"""
Historical Reconstruction Dataset
===================================

For each week T in the 2019–2025 historical period, assemble the complete
"information state" — everything that was knowable at that point in time —
and the actual outcomes that followed.

This produces the training dataset for the ML counterfactual model (P10-C.3).

Output: forecasting/data/esc_reconstruction.csv
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

# Ensure project root on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from forecasting.models.state_space import (
    ESCStateSpaceModel,
    load_historical_data,
    SURPLUS_SCALE,
    CREATION_SCALE,
)
from forecasting.models.ou_bounded import DEFAULT_REGIMES, forecast_at_horizons
from forecasting.signals.signal_history import build_signal_features


# ---------------------------------------------------------------------------
# Velocity computation
# ---------------------------------------------------------------------------

def compute_creation_velocity(
    creation_volumes: np.ndarray,
    t: int,
    window: int,
) -> float:
    """Average weekly creation velocity over the given window ending at t."""
    start = max(0, t - window + 1)
    if start >= t:
        return float(creation_volumes[t])
    return float(np.mean(creation_volumes[start:t + 1]))


def compute_creation_velocity_trend(
    creation_volumes: np.ndarray,
    t: int,
    window: int = 12,
) -> float:
    """Change in velocity: recent 4w velocity minus trailing velocity."""
    if t < window:
        return 0.0
    recent_4w = compute_creation_velocity(creation_volumes, t, 4)
    trailing = compute_creation_velocity(creation_volumes, t - 4, max(1, window - 4))
    return recent_4w - trailing


def compute_activity_mix(creation_by_activity_str: str) -> Dict[str, float]:
    """Parse creation_by_activity JSON and compute proportions."""
    try:
        raw = json.loads(creation_by_activity_str) if isinstance(creation_by_activity_str, str) else creation_by_activity_str
        total = sum(raw.values())
        if total == 0:
            return {k: 0.0 for k in raw}
        return {k: round(v / total, 4) for k, v in raw.items()}
    except (json.JSONDecodeError, TypeError, AttributeError):
        return {}


# ---------------------------------------------------------------------------
# Optimal action labelling
# ---------------------------------------------------------------------------

BUY_THRESHOLD = 0.50   # AUD — price must rise by this much for "buy"
SELL_THRESHOLD = 0.50   # AUD — price must fall by this much for "sell"


def label_optimal_action(
    price_now: float,
    price_4w: Optional[float],
) -> str:
    """Hindsight-optimal action based on 4-week price change."""
    if price_4w is None:
        return "hold"
    delta = price_4w - price_now
    if delta > BUY_THRESHOLD:
        return "buy"
    elif delta < -SELL_THRESHOLD:
        return "sell"
    return "hold"


def compute_optimal_value(
    price_now: float,
    max_price_12w: Optional[float],
) -> float:
    """Hindsight-optimal value: max price in next 12w minus current price."""
    if max_price_12w is None:
        return 0.0
    return max(0.0, max_price_12w - price_now)


# ---------------------------------------------------------------------------
# Main reconstruction
# ---------------------------------------------------------------------------

def reconstruct(
    csv_path: Optional[str] = None,
    output_path: Optional[str] = None,
) -> pd.DataFrame:
    """
    Build the complete reconstruction dataset.

    For each week T, computes:
      - InformationState: all features knowable at time T
      - ActualOutcome: future prices and optimal actions (hindsight)

    Returns:
        DataFrame with one row per week.
    """
    # Load data
    df = load_historical_data(csv_path)
    prices = df["spot_price"].values
    creation_volumes = df["creation_volume_total"].values
    n = len(df)

    # Run Kalman filter to get state estimates
    print("  Running Kalman filter for state estimates...")
    model = ESCStateSpaceModel()
    model.run_filter(df)
    states = model.history

    # Build signal features
    print("  Computing AI signal features...")
    signals_df = build_signal_features(df)

    # Build reconstruction rows
    print("  Assembling reconstruction rows...")
    rows: List[Dict[str, Any]] = []

    for t in range(n):
        row_data = df.iloc[t]
        state = states[t]
        signal = signals_df.iloc[t]

        # --- Structured data ---
        spot_price = float(prices[t])
        velocity_4w = compute_creation_velocity(creation_volumes, t, 4)
        velocity_12w = compute_creation_velocity(creation_volumes, t, 12)
        velocity_trend = compute_creation_velocity_trend(creation_volumes, t, 12)
        cumulative_surplus = float(row_data["cumulative_surplus"])
        annual_demand = float(row_data["annual_demand"])
        surplus_runway = cumulative_surplus / max(annual_demand, 1.0)
        days_to_surrender = int(row_data["days_to_surrender"])
        penalty_rate = float(row_data["penalty_rate"])
        price_to_penalty = float(row_data["price_to_penalty_ratio"])

        # Activity mix proportions
        activity_mix = compute_activity_mix(row_data["creation_by_activity"])
        cl_pct = activity_mix.get("commercial_lighting", 0.0)
        heer_pct = activity_mix.get("heer", 0.0)
        iheab_pct = activity_mix.get("iheab", 0.0)
        piamv_pct = activity_mix.get("piamv", 0.0)

        # Forward premium (not available in historical data — use NaN)
        forward_premium = np.nan

        # --- AI-extracted signals ---
        policy_active = bool(signal["policy_signal_active"])
        policy_supply_pct = float(signal["policy_supply_impact_pct"])
        broker_sentiment = float(signal["broker_sentiment"])
        supply_concern = float(signal["supply_concern_level"])
        creation_trend = str(signal["creation_trend_signal"])

        # --- State-space model estimates ---
        estimated_shadow = state.true_surplus * 0.08  # 8% shadow fraction
        regime_probs = state.regime_probabilities
        regime_surplus_prob = regime_probs.get("surplus", 0.0)
        regime_balanced_prob = regime_probs.get("balanced", 0.0)
        regime_tightening_prob = regime_probs.get("tightening", 0.0)

        # Kalman price forecast (from OU model at current regime)
        regime = state.regime_name
        params = DEFAULT_REGIMES[regime]
        try:
            forecasts = forecast_at_horizons(
                current_price=spot_price,
                params=params,
                penalty_rate=penalty_rate,
                horizons=[4, 12],
                n_paths=500,  # reduced for speed
            )
            kalman_forecast_4w = forecasts[0].mean
            kalman_forecast_12w = forecasts[1].mean
        except Exception:
            kalman_forecast_4w = spot_price
            kalman_forecast_12w = spot_price

        # --- Actual outcomes ---
        price_1w = float(prices[t + 1]) if t + 1 < n else np.nan
        price_4w = float(prices[t + 4]) if t + 4 < n else np.nan
        price_12w = float(prices[t + 12]) if t + 12 < n else np.nan
        price_26w = float(prices[t + 26]) if t + 26 < n else np.nan

        # Max/min in next 12 weeks
        end_12w = min(t + 13, n)  # t+1 through t+12
        if t + 1 < n:
            future_window = prices[t + 1:end_12w]
            max_12w = float(np.max(future_window)) if len(future_window) > 0 else np.nan
            min_12w = float(np.min(future_window)) if len(future_window) > 0 else np.nan
        else:
            max_12w = np.nan
            min_12w = np.nan

        optimal_action = label_optimal_action(spot_price, price_4w if t + 4 < n else None)
        optimal_value = compute_optimal_value(spot_price, max_12w if t + 1 < n else None)

        rows.append({
            # Index
            "week_ending": str(row_data["week_ending"]),
            "week_index": t,
            # Structured data
            "spot_price": round(spot_price, 4),
            "creation_velocity_4w": round(velocity_4w, 2),
            "creation_velocity_12w": round(velocity_12w, 2),
            "creation_velocity_trend": round(velocity_trend, 2),
            "cumulative_surplus": cumulative_surplus,
            "surplus_runway_years": round(surplus_runway, 4),
            "days_to_surrender": days_to_surrender,
            "penalty_rate": penalty_rate,
            "price_to_penalty_ratio": round(price_to_penalty, 4),
            "forward_premium": forward_premium,
            "activity_cl_pct": cl_pct,
            "activity_heer_pct": heer_pct,
            "activity_iheab_pct": iheab_pct,
            "activity_piamv_pct": piamv_pct,
            # AI signals
            "policy_signal_active": int(policy_active),
            "policy_supply_impact_pct": policy_supply_pct,
            "policy_demand_impact_pct": float(signal["policy_demand_impact_pct"]),
            "broker_sentiment": broker_sentiment,
            "supply_concern_level": supply_concern,
            "creation_trend_accelerating": int(creation_trend == "accelerating"),
            "creation_trend_decelerating": int(creation_trend == "decelerating"),
            # State-space estimates
            "estimated_shadow_supply": round(estimated_shadow, 0),
            "regime_surplus_prob": round(regime_surplus_prob, 4),
            "regime_balanced_prob": round(regime_balanced_prob, 4),
            "regime_tightening_prob": round(regime_tightening_prob, 4),
            "kalman_forecast_4w": round(kalman_forecast_4w, 4),
            "kalman_forecast_12w": round(kalman_forecast_12w, 4),
            # Actual outcomes
            "price_t_plus_1w": round(price_1w, 4) if not np.isnan(price_1w) else np.nan,
            "price_t_plus_4w": round(price_4w, 4) if not np.isnan(price_4w) else np.nan,
            "price_t_plus_12w": round(price_12w, 4) if not np.isnan(price_12w) else np.nan,
            "price_t_plus_26w": round(price_26w, 4) if not np.isnan(price_26w) else np.nan,
            "max_price_next_12w": round(max_12w, 4) if not np.isnan(max_12w) else np.nan,
            "min_price_next_12w": round(min_12w, 4) if not np.isnan(min_12w) else np.nan,
            "optimal_action": optimal_action,
            "optimal_value_per_cert": round(optimal_value, 4),
        })

    result_df = pd.DataFrame(rows)

    # Save to CSV
    if output_path is None:
        output_path = str(Path(__file__).parent.parent / "data" / "esc_reconstruction.csv")
    result_df.to_csv(output_path, index=False)
    print(f"  Saved reconstruction to: {output_path}")

    return result_df


# ---------------------------------------------------------------------------
# Self-test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Running historical reconstruction...\n")
    df = reconstruct()
    print(f"\n--- Reconstruction Summary ---")
    print(f"  Rows: {len(df)}")
    print(f"  Columns: {len(df.columns)}")
    print(f"  Date range: {df['week_ending'].iloc[0]} to {df['week_ending'].iloc[-1]}")
    print(f"  Price range: ${df['spot_price'].min():.2f} — ${df['spot_price'].max():.2f}")
    print(f"  Optimal actions: {df['optimal_action'].value_counts().to_dict()}")
    print(f"  Mean optimal value: ${df['optimal_value_per_cert'].mean():.4f}")
    print(f"  Weeks with policy signal: {df['policy_signal_active'].sum()}")
    print(f"\n  Feature columns:")
    for col in df.columns:
        print(f"    {col}: {df[col].dtype}")
    print("\nReconstruction complete.")
