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


def run_pipeline(csv_only: bool = False, instrument: str = "ESC") -> ForecastResult:
    """
    Full forecast pipeline with intelligence ingestion.

    Args:
        csv_only: If True, skip database operations.
        instrument: Instrument code (default "ESC"). Loads config from
            the instrument registry and passes to all model components.

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

    # Load instrument configuration
    instrument_config = None
    try:
        from forecasting.instruments.registry import get_instrument
        instrument_config = get_instrument(instrument)
        print(f"  [pipeline] Instrument: {instrument_config.code} ({instrument_config.name})")
    except (ImportError, KeyError) as exc:
        logger.warning("Instrument config not available for %s: %s — using ESC defaults", instrument, exc)

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

    # --- Stage 3b: Participant demand intelligence ---------------------------
    demand_features: dict = {}
    try:
        from forecasting.participants.demand_intelligence import (
            RetailerObligationEstimator,
        )
        estimator = RetailerObligationEstimator()
        compliance_year = datetime.now().year
        demand_features = estimator.get_xgboost_features(compliance_year)
        print(f"  [pipeline] Stage 3b: Demand intelligence — "
              f"top5 obligation={demand_features.get('top5_retailer_obligation_total', 0):,.0f}, "
              f"HHI={demand_features.get('obligation_concentration_hhi', 0):.0f}")
    except Exception as exc:
        logger.warning("Demand intelligence failed: %s — continuing without", exc)
        print(f"  [pipeline] Stage 3b: Demand intelligence FAILED ({exc})")

    # --- Stage 3c: Supply-side ACP intelligence -------------------------------
    supply_features: dict = {}
    try:
        from forecasting.participants.supply_intelligence import (
            ACPConcentrationAnalyser,
        )
        analyser = ACPConcentrationAnalyser()
        supply_features = analyser.get_xgboost_features()
        print(f"  [pipeline] Stage 3c: Supply intelligence — "
              f"pipeline 26w={supply_features.get('creation_pipeline_26w_total', 0):,.0f}, "
              f"vulnerability={supply_features.get('supply_vulnerability_score', 0):.0f}")
    except Exception as exc:
        logger.warning("Supply intelligence failed: %s — continuing without", exc)
        print(f"  [pipeline] Stage 3c: Supply intelligence FAILED ({exc})")

    # --- Stage 3d: Shadow supply decomposition --------------------------------
    shadow_decomposed = None
    try:
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        decomposer = ShadowSupplyDecomposer()
        shadow_decomposed = decomposer.total_shadow_estimate()
        print(f"  [pipeline] Stage 3d: Shadow decomposition — "
              f"multiplier={shadow_decomposed['shadow_multiplier']:.2f}× "
              f"(simple={shadow_decomposed['comparison_to_simple_multiplier']['simple_multiplier']}×)")
    except Exception as exc:
        logger.warning("Shadow decomposition failed: %s — using simple multiplier", exc)
        print(f"  [pipeline] Stage 3d: Shadow decomposition FAILED ({exc})")

    # --- Stage 4: Kalman filter ---------------------------------------------
    try:
        model = run_full_filter(instrument_config=instrument_config)
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

    # --- Stage 8: XGBoost + Volume forecast ----------------------------------
    # XGBoost walk-forward is computationally expensive and runs on the
    # reconstruction dataset during training. The expanded features are
    # available via FEATURES_INDEPENDENT for the next training cycle.
    volume_result = None
    try:
        from forecasting.models.volume_forecast import VolumeForecaster

        vf = VolumeForecaster()
        volume_result = vf.forecast(horizon_weeks=26)
        print(f"  [pipeline] Stage 8: Volume forecast generated "
              f"(creation wk1={volume_result.creation_forecast[0]:,.0f}, "
              f"surrender wk1={volume_result.surrender_forecast[0]:,.0f})")
    except Exception as exc:
        logger.warning("Volume forecast failed: %s — continuing without volume data", exc)
        print(f"  [pipeline] Stage 8: Volume forecast FAILED ({exc})")

    # --- Stage 9: Ensemble forward curve -------------------------------------
    try:
        from forecasting.models.ensemble_forecast import EnsembleForecaster

        # Use latest state's regime and price for the forward curve
        regime_name = latest_state.regime_name if latest_state else "balanced"
        current_price = None
        if result and result.price_forecasts:
            # Use the 1w forecast as current implied price
            for fc in result.price_forecasts:
                if fc.horizon_weeks == 1:
                    current_price = fc.mean
                    break

        kalman_4w = None
        if result and result.price_forecasts:
            for fc in result.price_forecasts:
                if fc.horizon_weeks == 4:
                    kalman_4w = fc.mean
                    break

        ef = EnsembleForecaster(
            current_price=current_price,
            regime=regime_name,
            instrument_config=instrument_config,
        )
        forward_curve = ef.generate_forward_curve(
            horizon_weeks=26,
            kalman_4w_forecast=kalman_4w,
        )
        print(f"  [pipeline] Stage 9: Forward curve generated "
              f"(wk1=${forward_curve[0]['price']:.2f}, wk26=${forward_curve[25]['price']:.2f})")
    except Exception as exc:
        logger.warning("Ensemble forward curve failed: %s", exc)
        print(f"  [pipeline] Stage 9: Forward curve FAILED ({exc})")

    # --- Stage 9b: Scenario narrative -----------------------------------------
    narrative = ""
    try:
        from forecasting.narratives.scenario_narrator import generate_forecast_narrative

        # Build forecast dict for the narrator
        forecast_for_narrative = {
            "current_price": current_price,
            "price_forecast_4w": kalman_4w,
            "price_forecast_12w": forward_curve[11]["price"] if len(forward_curve) > 11 else kalman_4w,
            "confidence_interval_80": (
                forward_curve[3]["ci_80_lower"] if len(forward_curve) > 3 else 0,
                forward_curve[3]["ci_80_upper"] if len(forward_curve) > 3 else 0,
            ),
            "recommended_action": "hold",
            "action_confidence": 0.5,
        }

        regime_probs = (
            latest_state.regime_probabilities if latest_state else {}
        )

        narrative = generate_forecast_narrative(
            forecast=forecast_for_narrative,
            active_signals=active_signals,
            regime_probabilities=regime_probs,
            instrument="ESC",
        )
        print(f"  [pipeline] Stage 9b: Narrative generated ({len(narrative)} chars)")
    except Exception as exc:
        logger.warning("Narrative generation failed: %s", exc)
        print(f"  [pipeline] Stage 9b: Narrative FAILED ({exc})")

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
