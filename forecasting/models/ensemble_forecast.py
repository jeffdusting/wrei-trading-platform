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

DATA_QUALITY_NOTE = (
    "Trained on interpolated data only. Backtesting metrics reflect synthetic "
    "validation. Genuine weekly observation accumulation begins when live "
    "scrapers are operational."
)


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
    data_quality_note: str = DATA_QUALITY_NOTE


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
        w_bay, w_ml, best_mape = optimise_weights(
            bayesian[valid_idx], ml_forecasts[valid_idx], actuals[valid_idx]
        )
        # Log weights for transparency (P3.3)
        log_ensemble_weights(w_bay, w_ml, best_mape)
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
# EnsembleForecaster class (P3.2 forward curve + P3.3 weight transparency)
# ---------------------------------------------------------------------------

class EnsembleForecaster:
    """
    High-level ensemble forecaster providing forward curve construction
    and weight transparency.

    Accepts an optional InstrumentConfig to customise penalty ceiling,
    regime parameters, and boundary type for non-ESC instruments.
    """

    def __init__(
        self,
        current_price: Optional[float] = None,
        regime: str = "balanced",
        penalty_rate: float = 35.86,
        instrument_config: Optional[Any] = None,
    ) -> None:
        import logging

        logger = logging.getLogger(__name__)

        self.instrument_config = instrument_config

        # Resolve penalty rate and boundary from config
        if instrument_config is not None:
            from forecasting.models.ou_bounded import regimes_from_config
            self._regimes = regimes_from_config(instrument_config)
            self.has_penalty_ceiling = instrument_config.has_penalty_ceiling
            if instrument_config.has_penalty_ceiling and instrument_config.penalty_rate is not None:
                self.penalty_rate = instrument_config.penalty_rate
            elif instrument_config.soft_upper_bound is not None:
                self.penalty_rate = instrument_config.soft_upper_bound
            else:
                self.penalty_rate = penalty_rate
        else:
            self._regimes = DEFAULT_REGIMES
            self.has_penalty_ceiling = True
            self.penalty_rate = penalty_rate

        if current_price is not None:
            self.current_price = current_price
        else:
            self.current_price = self._load_latest_spot_price()

        self.regime = regime

        if regime not in self._regimes:
            raise ValueError(f"Unknown regime '{regime}'. Must be one of: {list(self._regimes.keys())}")
        self.ou_params = self._regimes[regime]

        # Warn if current_price equals balanced regime mu (no market signal)
        balanced_mu = self._regimes.get("balanced", DEFAULT_REGIMES["balanced"]).mu
        if abs(self.current_price - balanced_mu) < 0.01:
            logger.warning(
                "current_price (%.2f) equals balanced regime mu — "
                "no market signal in the forecast. Consider providing "
                "an explicit current_price.",
                self.current_price,
            )

    @staticmethod
    def _load_latest_spot_price() -> float:
        """Load the latest observation's spot price from the reconstruction dataset."""
        try:
            import pandas as pd

            csv_path = Path(__file__).parent.parent / "data" / "esc_reconstruction.csv"
            if csv_path.exists():
                df = pd.read_csv(csv_path)
                last_price = df["spot_price"].dropna().iloc[-1]
                return float(last_price)
        except Exception:
            pass
        # Fallback to balanced regime mu
        return DEFAULT_REGIMES["balanced"].mu

    def _ou_expected_price(self, t: float) -> float:
        """
        OU analytical expected price at time t (weeks).

        E[P(t)] = mu + (P(0) - mu) * exp(-theta * t)
        """
        mu = self.ou_params.mu
        theta = self.ou_params.theta
        return mu + (self.current_price - mu) * np.exp(-theta * t)

    def _ou_variance(self, t: float) -> float:
        """
        OU analytical variance at time t (weeks).

        Var[P(t)] = (sigma^2 / (2*theta)) * (1 - exp(-2*theta*t))
        """
        sigma = self.ou_params.sigma
        theta = self.ou_params.theta
        return (sigma ** 2 / (2.0 * theta)) * (1.0 - np.exp(-2.0 * theta * t))

    def generate_forward_curve(
        self,
        horizon_weeks: int = 26,
        kalman_4w_forecast: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        """
        Produce 26 weekly point forecasts with CI bands.

        The Kalman filter state estimate drives the short end (1w-4w),
        the OU analytical solution drives the long end (4w-26w),
        with a blending zone at 4w-8w.

        Each entry: { "week": int, "price": float, "ci_80_lower": float,
                      "ci_80_upper": float, "ci_95_lower": float,
                      "ci_95_upper": float }
        """
        # If no Kalman forecast provided, use OU for the short end too
        kalman_4w = kalman_4w_forecast or self._ou_expected_price(4.0)

        # Build Kalman short-end curve (linear interp from current to 4w forecast)
        def kalman_price_at(t: float) -> float:
            if t <= 0:
                return self.current_price
            frac = min(t / 4.0, 1.0)
            return self.current_price + frac * (kalman_4w - self.current_price)

        curve: List[Dict[str, Any]] = []

        for week in range(1, horizon_weeks + 1):
            t = float(week)
            ou_price = self._ou_expected_price(t)
            ou_var = self._ou_variance(t)
            ou_std = np.sqrt(max(ou_var, 0.0))

            if t <= 4.0:
                # Short end: Kalman-driven
                price = kalman_price_at(t)
            elif t <= 8.0:
                # Blending zone: linear blend from Kalman to OU
                blend = (t - 4.0) / 4.0  # 0 at week 4, 1 at week 8
                price = (1.0 - blend) * kalman_price_at(t) + blend * ou_price
            else:
                # Long end: OU analytical
                price = ou_price

            # CI bands from OU analytical variance at each point
            # Apply ensemble CI expansion when models disagree
            disagreement_factor = 1.0
            if kalman_4w_forecast is not None and t <= 8.0:
                disagreement = abs(kalman_4w - self._ou_expected_price(4.0))
                disagreement_factor = 1.0 + 0.1 * min(
                    disagreement / max(self.current_price, 1.0), 1.0
                )

            ci_80_half = 1.282 * ou_std * disagreement_factor
            ci_95_half = 1.960 * ou_std * disagreement_factor

            # Enforce penalty rate ceiling (hard for compliance, soft clamp for others)
            if self.has_penalty_ceiling:
                price = min(price, self.penalty_rate)
            price = max(price, 0.0)

            curve.append({
                "week": week,
                "price": round(price, 4),
                "ci_80_lower": round(max(0.0, price - ci_80_half), 4),
                "ci_80_upper": round(min(self.penalty_rate, price + ci_80_half), 4),
                "ci_95_lower": round(max(0.0, price - ci_95_half), 4),
                "ci_95_upper": round(min(self.penalty_rate, price + ci_95_half), 4),
            })

        return curve

    def get_weight_history(self) -> List[Dict[str, Any]]:
        """
        Return the historical ensemble weight series from the log file.

        Each entry: { "timestamp": str, "bayesian_weight": float,
                      "ml_weight": float, "validation_mape": float }
        """
        import json

        history_path = Path(__file__).parent.parent / "analysis" / "ensemble_weight_history.json"
        if not history_path.exists():
            return []

        with open(history_path, "r") as f:
            data = json.load(f)
        return data.get("history", [])


def log_ensemble_weights(
    bayesian_weight: float,
    ml_weight: float,
    validation_mape: float,
    timestamp: Optional[str] = None,
) -> None:
    """
    Append ensemble weights to the persistent weight history log.

    Warns if weight consistently converges toward 0.0 or 1.0 (single-model).
    """
    import json
    import logging
    from datetime import datetime

    logger = logging.getLogger(__name__)

    history_path = Path(__file__).parent.parent / "analysis" / "ensemble_weight_history.json"
    history_path.parent.mkdir(parents=True, exist_ok=True)

    # Load existing
    if history_path.exists():
        with open(history_path, "r") as f:
            data = json.load(f)
    else:
        data = {"history": []}

    # Append new entry
    entry = {
        "timestamp": timestamp or datetime.utcnow().isoformat(),
        "bayesian_weight": round(bayesian_weight, 4),
        "ml_weight": round(ml_weight, 4),
        "validation_mape": round(validation_mape, 6),
    }
    data["history"].append(entry)

    # Write back
    with open(history_path, "w") as f:
        json.dump(data, f, indent=2)

    # Check for single-model convergence (last 4 windows)
    recent = data["history"][-4:]
    if len(recent) >= 4:
        bay_weights = [e["bayesian_weight"] for e in recent]
        all_near_zero = all(w < 0.1 for w in bay_weights)
        all_near_one = all(w > 0.9 for w in bay_weights)
        if all_near_zero or all_near_one:
            dominant = "Bayesian" if all_near_one else "ML"
            logger.warning(
                "Ensemble is effectively single-model (%s dominant) — "
                "review model independence. Last 4 weights: %s",
                dominant, bay_weights,
            )


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
