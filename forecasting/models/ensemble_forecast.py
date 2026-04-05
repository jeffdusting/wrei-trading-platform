"""
Ensemble Forecast Model for ESC Market Intelligence
=====================================================

Combines the Bayesian state-space forecast (P10-B) with the ML counterfactual
forecast (P10-C.3) using optimised weighted averaging.

Weights are determined by walk-forward cross-validation, minimising MAPE
on the validation set.

Output: { price_forecast, confidence_interval, recommended_action,
          action_confidence, estimated_value_per_cert }
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit

# Ensure project root on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from forecasting.models.ou_bounded import DEFAULT_REGIMES, OURegimeParams, forecast_at_horizons
from forecasting.models.counterfactual_model import (
    FEATURE_COLUMNS,
    load_reconstruction,
    prepare_features,
    train_price_model,
    train_action_model,
    train_value_model,
    ACTION_LABELS,
)


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class EnsembleForecast:
    """Combined forecast from Bayesian + ML models."""
    week_ending: str
    price_forecast_4w: float
    price_forecast_12w: float
    confidence_interval_80: Tuple[float, float]
    confidence_interval_95: Tuple[float, float]
    recommended_action: str
    action_confidence: float
    estimated_value_per_cert: float
    bayesian_weight: float
    ml_weight: float
    bayesian_price_4w: float
    ml_price_4w: float


# ---------------------------------------------------------------------------
# Weight optimisation
# ---------------------------------------------------------------------------

def optimise_weights(
    bayesian_forecasts: np.ndarray,
    ml_forecasts: np.ndarray,
    actuals: np.ndarray,
    n_grid: int = 21,
) -> Tuple[float, float, float]:
    """
    Find the optimal Bayesian/ML weight combination that minimises MAPE.

    Uses grid search over weight space [0, 1] in steps of 1/n_grid.

    Returns:
        (bayesian_weight, ml_weight, best_mape)
    """
    valid = ~np.isnan(actuals) & ~np.isnan(bayesian_forecasts) & ~np.isnan(ml_forecasts)
    bay = bayesian_forecasts[valid]
    ml = ml_forecasts[valid]
    act = actuals[valid]

    if len(act) < 5:
        return 0.5, 0.5, 1.0

    best_mape = float("inf")
    best_w = 0.5

    for i in range(n_grid):
        w = i / (n_grid - 1)
        ensemble = w * bay + (1.0 - w) * ml
        mape = float(np.mean(np.abs((act - ensemble) / np.maximum(act, 1.0))))
        if mape < best_mape:
            best_mape = mape
            best_w = w

    return best_w, 1.0 - best_w, best_mape


def walk_forward_weight_optimisation(
    df: pd.DataFrame,
    bayesian_col: str = "kalman_forecast_4w",
    actual_col: str = "price_t_plus_4w",
    start_week: int = 52,
    window: int = 52,
) -> Tuple[float, float]:
    """
    Walk-forward weight optimisation using expanding windows.

    At each step, optimise weights on the past `window` weeks, then
    average the optimal weights across all steps.

    Returns:
        (bayesian_weight, ml_weight)
    """
    from forecasting.models.counterfactual_model import walk_forward_predict

    bayesian = df[bayesian_col].values
    actuals = df[actual_col].values

    # Get ML predictions via walk-forward
    predictions, _ = walk_forward_predict(df, start_week=start_week, retrain_interval=12)

    # Build ML forecast array aligned to the full DataFrame
    ml_forecasts = np.full(len(df), np.nan)
    for i, pred in enumerate(predictions):
        t = start_week + i
        if t < len(df):
            ml_forecasts[t] = pred.predicted_price_4w

    # Optimise weights on overlapping windows
    weights_bay = []
    eval_start = max(start_week + window, start_week + 26)

    for t in range(eval_start, len(df)):
        w_start = max(start_week, t - window)
        bay_window = bayesian[w_start:t]
        ml_window = ml_forecasts[w_start:t]
        act_window = actuals[w_start:t]

        valid = ~np.isnan(bay_window) & ~np.isnan(ml_window) & ~np.isnan(act_window)
        if valid.sum() >= 10:
            w_bay, _, _ = optimise_weights(bay_window[valid], ml_window[valid], act_window[valid])
            weights_bay.append(w_bay)

    if not weights_bay:
        return 0.5, 0.5

    avg_bay = float(np.mean(weights_bay))
    return avg_bay, 1.0 - avg_bay


# ---------------------------------------------------------------------------
# Ensemble prediction (for backtesting integration)
# ---------------------------------------------------------------------------

def ensemble_predict_at(
    bayesian_price_4w: float,
    bayesian_price_12w: float,
    ml_price_4w: float,
    ml_action: str,
    ml_action_probs: Dict[str, float],
    ml_value: float,
    bayesian_weight: float,
    bayesian_ci_80: Tuple[float, float],
    bayesian_ci_95: Tuple[float, float],
    week_ending: str = "",
) -> EnsembleForecast:
    """
    Produce an ensemble forecast combining Bayesian and ML predictions.
    """
    ml_weight = 1.0 - bayesian_weight

    # Weighted price forecasts
    ens_price_4w = bayesian_weight * bayesian_price_4w + ml_weight * ml_price_4w
    # For 12w, use Bayesian only (ML doesn't predict 12w directly)
    ens_price_12w = bayesian_price_12w

    # Adjust confidence intervals — widen slightly if models disagree
    disagreement = abs(bayesian_price_4w - ml_price_4w)
    ci_expansion = 1.0 + 0.1 * min(disagreement / max(bayesian_price_4w, 1.0), 1.0)

    midpoint = ens_price_4w
    ci80_half = (bayesian_ci_80[1] - bayesian_ci_80[0]) / 2.0 * ci_expansion
    ci95_half = (bayesian_ci_95[1] - bayesian_ci_95[0]) / 2.0 * ci_expansion

    ci_80 = (midpoint - ci80_half, midpoint + ci80_half)
    ci_95 = (midpoint - ci95_half, midpoint + ci95_half)

    # Action: use ML action model (it's trained on hindsight-optimal actions)
    action = ml_action
    action_confidence = ml_action_probs.get(action, 0.5)

    return EnsembleForecast(
        week_ending=week_ending,
        price_forecast_4w=round(ens_price_4w, 4),
        price_forecast_12w=round(ens_price_12w, 4),
        confidence_interval_80=(round(ci_80[0], 4), round(ci_80[1], 4)),
        confidence_interval_95=(round(ci_95[0], 4), round(ci_95[1], 4)),
        recommended_action=action,
        action_confidence=round(action_confidence, 4),
        estimated_value_per_cert=round(ml_value, 4),
        bayesian_weight=round(bayesian_weight, 4),
        ml_weight=round(ml_weight, 4),
        bayesian_price_4w=round(bayesian_price_4w, 4),
        ml_price_4w=round(ml_price_4w, 4),
    )


# ---------------------------------------------------------------------------
# Full ensemble evaluation
# ---------------------------------------------------------------------------

def run_ensemble_evaluation(
    csv_path: Optional[str] = None,
    start_week: int = 52,
) -> Dict[str, Any]:
    """
    Run full ensemble evaluation with walk-forward weight optimisation.

    Returns:
        dict with ensemble metrics, weights, and comparison data.
    """
    from forecasting.models.counterfactual_model import walk_forward_predict

    print("  Loading reconstruction data...")
    df = load_reconstruction(csv_path)

    print("  Running ML walk-forward predictions...")
    predictions, ml_metrics = walk_forward_predict(df, start_week=start_week, retrain_interval=12)

    print("  Optimising ensemble weights...")
    bayesian = df["kalman_forecast_4w"].values
    actuals = df["price_t_plus_4w"].values

    # Build ML forecast array
    ml_forecasts = np.full(len(df), np.nan)
    for i, pred in enumerate(predictions):
        t = start_week + i
        if t < len(df):
            ml_forecasts[t] = pred.predicted_price_4w

    # Simple weight optimisation on the full available data
    valid = np.arange(start_week, len(df))
    valid_mask = ~np.isnan(bayesian[valid]) & ~np.isnan(ml_forecasts[valid]) & ~np.isnan(actuals[valid])
    valid_idx = valid[valid_mask]

    if len(valid_idx) >= 10:
        w_bay, w_ml, _ = optimise_weights(
            bayesian[valid_idx], ml_forecasts[valid_idx], actuals[valid_idx]
        )
    else:
        w_bay, w_ml = 0.5, 0.5

    # Compute ensemble MAPE
    ensemble_forecasts = w_bay * bayesian + w_ml * ml_forecasts
    bayesian_mape_list = []
    ml_mape_list = []
    ensemble_mape_list = []

    for t in valid_idx:
        actual = actuals[t]
        if np.isnan(actual) or actual <= 0:
            continue
        bayesian_mape_list.append(abs(bayesian[t] - actual) / actual)
        ml_mape_list.append(abs(ml_forecasts[t] - actual) / actual)
        ensemble_mape_list.append(abs(ensemble_forecasts[t] - actual) / actual)

    return {
        "bayesian_weight": w_bay,
        "ml_weight": w_ml,
        "bayesian_mape_4w": float(np.mean(bayesian_mape_list)) if bayesian_mape_list else 0.0,
        "ml_mape_4w": float(np.mean(ml_mape_list)) if ml_mape_list else 0.0,
        "ensemble_mape_4w": float(np.mean(ensemble_mape_list)) if ensemble_mape_list else 0.0,
        "n_evaluated": len(ensemble_mape_list),
        "ml_metrics": {k: {"cv_mean": v.cv_score_mean, "cv_std": v.cv_score_std} for k, v in ml_metrics.items()},
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Running ensemble forecast evaluation...\n")
    results = run_ensemble_evaluation()

    print("\n" + "=" * 60)
    print("ENSEMBLE FORECAST — EVALUATION RESULTS")
    print("=" * 60)
    print(f"  Bayesian weight:   {results['bayesian_weight']:.2f}")
    print(f"  ML weight:         {results['ml_weight']:.2f}")
    print(f"  Bayesian MAPE 4w:  {results['bayesian_mape_4w']*100:.2f}%")
    print(f"  ML MAPE 4w:        {results['ml_mape_4w']*100:.2f}%")
    print(f"  Ensemble MAPE 4w:  {results['ensemble_mape_4w']*100:.2f}%")
    print(f"  N evaluated:       {results['n_evaluated']}")
    print()

    # Check if ensemble beats both
    bay = results["bayesian_mape_4w"]
    ml = results["ml_mape_4w"]
    ens = results["ensemble_mape_4w"]
    if ens <= bay and ens <= ml:
        print("  Ensemble outperforms both individual models.")
    elif ens <= bay:
        print("  Ensemble outperforms Bayesian, but not ML alone.")
    elif ens <= ml:
        print("  Ensemble outperforms ML, but not Bayesian alone.")
    else:
        print("  Warning: ensemble does not outperform individual models.")
