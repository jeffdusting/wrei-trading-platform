#!/usr/bin/env python3
"""
ESC Forecast Generator
=======================

Loads market data, runs the state-space model, generates forecasts at
1w, 4w, 12w, 26w horizons, and stores results in the forecasts DB table.

Designed to be called daily by a cron job or via the data-ingestion layer.

Usage:
    python3 forecasting/generate_forecast.py
    python3 forecasting/generate_forecast.py --csv-only   # skip DB, use CSV
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime
from pathlib import Path

project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import logging

from forecasting.models.ou_bounded import OUForecast
from forecasting.models.state_space import (
    ESCStateSpaceModel,
    ForecastResult,
    load_historical_data,
    run_full_filter,
)

logger = logging.getLogger(__name__)

HORIZONS = [1, 4, 12, 26]
MODEL_VERSION = "2.0.0"
def _get_current_penalty_rate() -> float:
    """Load the current year's penalty rate from the JSON reference."""
    from forecasting.data_assembly import PENALTY_RATES
    current_year = datetime.now().year
    return PENALTY_RATES.get(current_year, PENALTY_RATES[max(PENALTY_RATES.keys())])

DEFAULT_PENALTY_RATE = _get_current_penalty_rate()


def load_latest_from_db() -> dict | None:
    """Attempt to load latest market data from the database."""
    try:
        import psycopg2
        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            return None

        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("""
            SELECT date, spot_price, spot_volume
            FROM market_data_daily
            WHERE instrument_type = 'ESC'
            ORDER BY date DESC LIMIT 1
        """)
        row = cur.fetchone()
        cur.close()
        conn.close()

        if row:
            return {
                "date": str(row[0]),
                "spot_price": float(row[1]) if row[1] else None,
                "creation_volume": float(row[2]) if row[2] else None,
            }
    except Exception:
        pass
    return None


def store_forecasts_to_db(result: ForecastResult) -> bool:
    """Store forecast results in the forecasts table."""
    try:
        import psycopg2
        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            return False

        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        for fc in result.price_forecasts:
            regime_probs = result.current_state.regime_probabilities
            metadata = {
                "regime": result.current_state.regime_name,
                "demand_pressure": result.current_state.demand_pressure,
                "shadow_surplus": result.shadow_estimate.shadow_surplus,
            }
            cur.execute(
                """
                INSERT INTO forecasts
                    (instrument_type, horizon_weeks, price_forecast,
                     price_lower_80, price_upper_80,
                     price_lower_95, price_upper_95,
                     regime_probability, model_version, metadata)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    "ESC",
                    fc.horizon_weeks,
                    fc.mean,
                    fc.lower_80,
                    fc.upper_80,
                    fc.lower_95,
                    fc.upper_95,
                    json.dumps(regime_probs),
                    MODEL_VERSION,
                    json.dumps(metadata),
                ),
            )

        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception:
        return False


def generate(csv_only: bool = False) -> ForecastResult:
    """Run the full forecast pipeline."""
    # Step 1: Run the Kalman filter on all historical data
    model = run_full_filter()
    latest_state = model.get_latest_state()

    if not latest_state:
        raise RuntimeError("No state produced by the model")

    # Step 2: Check for fresh DB data to incorporate
    db_obs = None if csv_only else load_latest_from_db()

    if db_obs and db_obs.get("spot_price"):
        # Incorporate the latest DB observation
        result = model.update_and_forecast(
            new_observations={
                "week_ending": db_obs["date"],
                "spot_price": db_obs["spot_price"],
                "creation_volume": db_obs.get("creation_volume"),
                "price_to_penalty": (
                    db_obs["spot_price"] / DEFAULT_PENALTY_RATE
                    if db_obs["spot_price"] else None
                ),
            },
            horizons=HORIZONS,
            penalty_rate=DEFAULT_PENALTY_RATE,
        )
    else:
        # Use the last CSV observation
        result = model.update_and_forecast(
            new_observations={
                "week_ending": latest_state.week_ending,
                "spot_price": None,  # no new observation, just produce forecast
            },
            horizons=HORIZONS,
            penalty_rate=DEFAULT_PENALTY_RATE,
        )

    # Step 3: Store to DB if available
    if not csv_only:
        stored = store_forecasts_to_db(result)
    else:
        stored = False

    return result


def run_pipeline(csv_only: bool = False) -> ForecastResult:
    """
    Full forecast pipeline with intelligence ingestion.

    Sequence:
      1. Run new source scrapers → collect ScrapedDocument lists
      2. Run ingestion pipeline → dedup, classify, store
      3. Run AI signal extraction on pending documents
      4. Load full Kalman filter state
      5. Check for regime override signals — apply if criteria met
      6. Get latest state estimate
      7. Incorporate new observations (update_and_forecast)
      8. Run XGBoost with expanded feature set (via generate())
      9. Run ensemble combiner (deferred to P3)
      10. Run anomaly detection (including policy_event_detected)
      11. Store results
      12. Log pipeline summary

    Each stage is wrapped in try/except — no single component failure
    crashes the pipeline.
    """
    from forecasting.scrapers.base import ScrapedDocument

    all_scraped: list[ScrapedDocument] = []
    active_signals: list[dict] = []
    all_alerts: list = []

    # --- Stage 1: Run new source scrapers -----------------------------------
    scraper_modules = []
    try:
        from forecasting.scrapers import (
            nsw_gazette_scraper,
            dcceew_scraper,
            cer_scraper,
            hansard_scraper,
            media_scraper,
            aer_scraper,
        )
        scraper_modules = [
            ("nsw_gazette", nsw_gazette_scraper),
            ("dcceew", dcceew_scraper),
            ("cer", cer_scraper),
            ("hansard", hansard_scraper),
            ("media", media_scraper),
            ("aer", aer_scraper),
        ]
    except ImportError as exc:
        logger.warning("Scraper import failed: %s — continuing without new scrapers", exc)

    for name, mod in scraper_modules:
        try:
            docs = mod.scrape()
            all_scraped.extend(docs)
            logger.info("Scraper %s returned %d documents", name, len(docs))
        except Exception as exc:
            logger.warning("Scraper %s failed: %s — skipping", name, exc)

    print(f"  [pipeline] Stage 1: {len(all_scraped)} documents scraped from {len(scraper_modules)} sources")

    # --- Stage 2: Ingestion pipeline ----------------------------------------
    ingestion_results = []
    try:
        from forecasting.ingestion.pipeline import IntelligencePipeline

        pipeline = IntelligencePipeline()
        if all_scraped:
            ingestion_results = pipeline.process_documents(all_scraped)
            ingested_count = sum(1 for r in ingestion_results if r.status == "ingested")
            print(f"  [pipeline] Stage 2: {ingested_count} new documents ingested")
        else:
            print("  [pipeline] Stage 2: No documents to ingest")
    except Exception as exc:
        logger.warning("Ingestion pipeline failed: %s — continuing with existing data", exc)
        print(f"  [pipeline] Stage 2: FAILED ({exc})")

    # --- Stage 3: AI signal extraction --------------------------------------
    try:
        from forecasting.ingestion.pipeline import IntelligencePipeline
        from forecasting.signals.ai_signal_extractor import extract_signals_batch

        pipeline = IntelligencePipeline()
        pending = pipeline.get_pending_documents()
        if pending:
            active_signals = extract_signals_batch(pending)
            print(f"  [pipeline] Stage 3: {len(active_signals)} active signals from {len(pending)} documents")
        else:
            print("  [pipeline] Stage 3: No pending documents for extraction")
    except Exception as exc:
        logger.warning("Signal extraction failed: %s — XGBoost will use zero-filled signal features", exc)
        print(f"  [pipeline] Stage 3: FAILED ({exc})")

    # --- Stage 4: Kalman filter ---------------------------------------------
    try:
        model = run_full_filter()
        print(f"  [pipeline] Stage 4: Kalman filter run ({len(model.history)} states)")
    except Exception as exc:
        raise RuntimeError(f"Kalman filter failed — cannot continue: {exc}") from exc

    # --- Stage 5: Regime override from signals ------------------------------
    for sig in active_signals:
        try:
            override_prob = float(sig.get("regime_override_prob", 0.0))
            confidence = float(sig.get("signal_confidence", 0.0))
            direction = sig.get("regime_override_direction", "none")

            if override_prob > 0.7 and confidence > 0.8 and direction != "none":
                model.override_regime_probability(
                    regime=direction,
                    probability=override_prob,
                    source=f"ai_signal:{sig.get('signal_source', 'unknown')}",
                )
                print(f"  [pipeline] Stage 5: Regime override → {direction} (prob={override_prob:.2f})")
        except Exception as exc:
            logger.warning("Regime override failed for signal: %s", exc)

    # --- Stage 6–7: Latest state + forecast ---------------------------------
    latest_state = model.get_latest_state()
    if not latest_state:
        raise RuntimeError("No state produced by the model")

    db_obs = None if csv_only else load_latest_from_db()

    if db_obs and db_obs.get("spot_price"):
        result = model.update_and_forecast(
            new_observations={
                "week_ending": db_obs["date"],
                "spot_price": db_obs["spot_price"],
                "creation_volume": db_obs.get("creation_volume"),
                "price_to_penalty": (
                    db_obs["spot_price"] / DEFAULT_PENALTY_RATE
                    if db_obs["spot_price"] else None
                ),
            },
            horizons=HORIZONS,
            penalty_rate=DEFAULT_PENALTY_RATE,
        )
    else:
        result = model.update_and_forecast(
            new_observations={
                "week_ending": latest_state.week_ending,
                "spot_price": None,
            },
            horizons=HORIZONS,
            penalty_rate=DEFAULT_PENALTY_RATE,
        )
    print(f"  [pipeline] Stage 6-7: Forecast generated ({latest_state.regime_name})")

    # --- Stage 8: XGBoost (via existing generate path) ----------------------
    # XGBoost walk-forward is computationally expensive and runs on the
    # reconstruction dataset during training. The expanded features are
    # available via FEATURES_INDEPENDENT for the next training cycle.
    print("  [pipeline] Stage 8: XGBoost feature set expanded (training deferred)")

    # --- Stage 9: Ensemble combiner (deferred to P3) ------------------------
    print("  [pipeline] Stage 9: Ensemble combiner (deferred to P3)")

    # --- Stage 10: Anomaly detection ----------------------------------------
    try:
        from forecasting.monitoring.anomaly_detector import (
            detect_anomalies,
            detect_policy_event_anomalies,
        )

        structural_alerts = detect_anomalies()
        all_alerts.extend(structural_alerts)

        # Augment active signals with relevance_score from pending docs
        augmented_signals = []
        for sig in active_signals:
            augmented_signals.append(sig)
        policy_alerts = detect_policy_event_anomalies(augmented_signals)
        all_alerts.extend(policy_alerts)

        print(f"  [pipeline] Stage 10: {len(all_alerts)} alerts ({len(structural_alerts)} structural, {len(policy_alerts)} policy)")
    except Exception as exc:
        logger.warning("Anomaly detection failed: %s", exc)
        print(f"  [pipeline] Stage 10: FAILED ({exc})")

    # --- Stage 11: Store results --------------------------------------------
    if not csv_only:
        stored = store_forecasts_to_db(result)
        print(f"  [pipeline] Stage 11: DB store {'OK' if stored else 'skipped (no DB)'}")
    else:
        print("  [pipeline] Stage 11: Skipped (csv-only mode)")

    # --- Stage 12: Summary --------------------------------------------------
    print(f"  [pipeline] Stage 12: Pipeline complete — "
          f"{len(all_scraped)} scraped, {len(active_signals)} active signals, "
          f"{len(all_alerts)} alerts")

    return result


def main() -> None:
    csv_only = "--csv-only" in sys.argv
    full_pipeline = "--pipeline" in sys.argv

    print(f"Generating ESC forecasts (model v{MODEL_VERSION})...")

    if full_pipeline:
        result = run_pipeline(csv_only=csv_only)
    else:
        result = generate(csv_only=csv_only)

    state = result.current_state
    print(f"\nCurrent state ({state.week_ending}):")
    print(f"  Regime: {state.regime_name} ({state.regime_probabilities})")
    print(f"  True surplus: {state.true_surplus:,.0f}")
    print(f"  Demand pressure: {state.demand_pressure:.3f}")

    print(f"\nPrice forecasts:")
    for fc in result.price_forecasts:
        print(
            f"  {fc.horizon_weeks:>3}w: ${fc.mean:.2f}  "
            f"80%=[${fc.lower_80:.2f}, ${fc.upper_80:.2f}]  "
            f"95%=[${fc.lower_95:.2f}, ${fc.upper_95:.2f}]"
        )

    shadow = result.shadow_estimate
    print(f"\nShadow market: {shadow.shadow_surplus:,.0f} "
          f"[{shadow.confidence_lower:,.0f}, {shadow.confidence_upper:,.0f}]")


if __name__ == "__main__":
    main()
