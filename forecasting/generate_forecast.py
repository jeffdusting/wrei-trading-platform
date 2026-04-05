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

from forecasting.models.ou_bounded import OUForecast
from forecasting.models.state_space import (
    ESCStateSpaceModel,
    ForecastResult,
    load_historical_data,
    run_full_filter,
)

HORIZONS = [1, 4, 12, 26]
MODEL_VERSION = "1.0.0"
DEFAULT_PENALTY_RATE = 36.20


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


def main() -> None:
    csv_only = "--csv-only" in sys.argv

    print(f"Generating ESC forecasts (model v{MODEL_VERSION})...")
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
