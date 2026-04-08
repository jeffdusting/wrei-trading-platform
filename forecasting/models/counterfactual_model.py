"""
ML Counterfactual Model for ESC Market Intelligence
=====================================================

Trains XGBoost models on the historical reconstruction dataset to predict:
  1. Price at T+4 weeks (regression)
  2. Optimal action: buy/hold/sell (classification)
  3. Decision value: expected gain per certificate (regression)

Walk-forward training: at week T, trains only on weeks 0..T-1.
Feature importance extraction for interpretability.
Time-series cross-validation within training windows.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, accuracy_score
from sklearn.preprocessing import LabelEncoder

try:
    import xgboost as xgb
except ImportError:
    xgb = None  # type: ignore


# Ensure project root on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)


# ---------------------------------------------------------------------------
# Feature definitions
# ---------------------------------------------------------------------------

# Full feature set including Kalman forecasts (creates circular dependency with ensemble)
FEATURES_FULL = [
    "spot_price",
    "creation_velocity_4w",
    "creation_velocity_12w",
    "creation_velocity_trend",
    "cumulative_surplus",
    "surplus_runway_years",
    "days_to_surrender",
    "penalty_rate",
    "price_to_penalty_ratio",
    "activity_cl_pct",
    "activity_heer_pct",
    "activity_iheab_pct",
    "activity_piamv_pct",
    "policy_signal_active",
    "policy_supply_impact_pct",
    "policy_demand_impact_pct",
    "broker_sentiment",
    "supply_concern_level",
    "creation_trend_accelerating",
    "creation_trend_decelerating",
    "estimated_shadow_supply",
    "regime_surplus_prob",
    "regime_balanced_prob",
    "regime_tightening_prob",
    # AI signal features (P2-D)
    "signal_confidence",
    "signal_horizon_weeks",
    "regime_override_prob",
    "event_cat_rule_change",
    "event_cat_penalty_determination",
    "event_cat_activity_phaseout",
    "event_cat_scheme_expansion",
    "event_cat_compliance_enforcement",
    "event_cat_political_signal",
    "event_cat_market_commentary",
    "event_cat_cross_scheme",
    # Kalman forecasts (excluded from independent set)
    "kalman_forecast_4w",
    "kalman_forecast_12w",
]

# Signal feature names for confidence-based zero-masking
SIGNAL_FEATURES = [
    "signal_confidence", "signal_horizon_weeks", "regime_override_prob",
    "event_cat_rule_change", "event_cat_penalty_determination",
    "event_cat_activity_phaseout", "event_cat_scheme_expansion",
    "event_cat_compliance_enforcement", "event_cat_political_signal",
    "event_cat_market_commentary", "event_cat_cross_scheme",
]

# Independent feature set: excludes Kalman forecasts to avoid circular dependency
# where XGBoost partially learns to weight Kalman output, inflating ensemble complementarity
FEATURES_INDEPENDENT = [f for f in FEATURES_FULL if f not in ("kalman_forecast_4w", "kalman_forecast_12w")]

# Default: use independent features to ensure clean ensemble composition
use_independent_features: bool = True

FEATURE_COLUMNS = FEATURES_INDEPENDENT if use_independent_features else FEATURES_FULL

TARGET_PRICE_4W = "price_t_plus_4w"
TARGET_ACTION = "optimal_action"
TARGET_VALUE = "optimal_value_per_cert"

ACTION_LABELS = ["buy", "hold", "sell"]


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class ModelMetrics:
    """Training metrics for one model."""
    model_type: str
    mape: float = 0.0
    mae: float = 0.0
    accuracy: float = 0.0
    cv_score_mean: float = 0.0
    cv_score_std: float = 0.0
    n_train: int = 0
    n_test: int = 0
    feature_importance: Dict[str, float] = field(default_factory=dict)


@dataclass
class CounterfactualPrediction:
    """Prediction from the counterfactual model at one time step."""
    week_ending: str
    predicted_price_4w: float
    predicted_action: str
    action_probabilities: Dict[str, float]
    predicted_value: float


# ---------------------------------------------------------------------------
# Model training
# ---------------------------------------------------------------------------

def load_reconstruction(csv_path: Optional[str] = None, instrument_config: Optional[Any] = None) -> pd.DataFrame:
    """Load the reconstruction dataset.

    Args:
        csv_path: Override CSV path.
        instrument_config: Optional InstrumentConfig — future use for
            instrument-specific datasets.
    """
    if csv_path is None:
        csv_path = str(Path(__file__).parent.parent / "data" / "esc_reconstruction.csv")
    return pd.read_csv(csv_path)


def prepare_features(
    df: pd.DataFrame,
    instrument_config: Optional[Any] = None,
) -> Tuple[np.ndarray, List[str]]:
    """Extract feature matrix from the reconstruction DataFrame.

    Signal features with signal_confidence < 0.5 are zero-masked to prevent
    low-confidence signals from introducing noise.

    Args:
        df: Reconstruction DataFrame.
        instrument_config: Optional InstrumentConfig — if provided, uses
            instrument-specific feature columns instead of the default ESC set.
    """
    if instrument_config is not None and hasattr(instrument_config, "feature_columns") and instrument_config.feature_columns:
        columns = instrument_config.feature_columns
    else:
        columns = FEATURE_COLUMNS

    # Add any missing columns as zeros (signal features may not exist in older datasets)
    X = df.reindex(columns=columns, fill_value=0.0).copy()
    X = X.fillna(0.0)

    # Zero-mask signal features where signal_confidence < 0.5
    if "signal_confidence" in X.columns:
        low_conf_mask = X["signal_confidence"] < 0.5
        for feat in SIGNAL_FEATURES:
            if feat in X.columns:
                X.loc[low_conf_mask, feat] = 0.0

    return X.values, list(columns)


def compute_sample_weights(df: pd.DataFrame) -> np.ndarray:
    """Compute sample weights by data quality: genuine=1.0, synthetic=0.5."""
    if "data_quality" not in df.columns:
        return np.full(len(df), 0.5)
    return np.where(
        df["data_quality"].str.startswith("synthetic", na=True),
        0.5,
        1.0,
    )


def train_price_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    n_cv_folds: int = 5,
    sample_weights: Optional[np.ndarray] = None,
) -> Tuple[Any, ModelMetrics]:
    """Train XGBoost regression model for 4-week price prediction."""
    if xgb is None:
        raise ImportError("xgboost is required but not installed")

    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        verbosity=0,
    )

    # Time-series cross-validation
    tscv = TimeSeriesSplit(n_splits=min(n_cv_folds, max(2, len(y_train) // 20)))
    cv_scores = []
    for train_idx, val_idx in tscv.split(X_train):
        if len(val_idx) < 2:
            continue
        sw = sample_weights[train_idx] if sample_weights is not None else None
        model.fit(X_train[train_idx], y_train[train_idx], sample_weight=sw)
        preds = model.predict(X_train[val_idx])
        mape = np.mean(np.abs((y_train[val_idx] - preds) / np.maximum(y_train[val_idx], 1.0)))
        cv_scores.append(mape)

    # Final fit on all training data
    sw = sample_weights if sample_weights is not None else None
    model.fit(X_train, y_train, sample_weight=sw)

    # Feature importance
    importance = dict(zip(FEATURE_COLUMNS, model.feature_importances_.tolist()))

    metrics = ModelMetrics(
        model_type="price_regression",
        cv_score_mean=float(np.mean(cv_scores)) if cv_scores else 0.0,
        cv_score_std=float(np.std(cv_scores)) if cv_scores else 0.0,
        n_train=len(y_train),
        feature_importance=importance,
    )
    return model, metrics


def train_action_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    n_cv_folds: int = 5,
) -> Tuple[Any, LabelEncoder, ModelMetrics]:
    """Train XGBoost classifier for optimal action prediction."""
    if xgb is None:
        raise ImportError("xgboost is required but not installed")

    le = LabelEncoder()
    le.fit(ACTION_LABELS)
    y_encoded = le.transform(y_train)

    # Ensure all 3 classes are present — XGBoost requires contiguous 0..num_class-1
    unique_classes = set(np.unique(y_encoded).tolist())
    missing_classes = [c for c in range(3) if c not in unique_classes]
    if missing_classes:
        # Add one synthetic sample per missing class (copy of first training row)
        n_missing = len(missing_classes)
        X_train = np.vstack([X_train] + [X_train[:1]] * n_missing)
        y_encoded = np.concatenate([y_encoded, np.array(missing_classes)])

    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        verbosity=0,
        objective="multi:softprob",
        num_class=3,
    )

    # Time-series cross-validation (on original data before augmentation)
    n_original = len(y_train)
    tscv = TimeSeriesSplit(n_splits=min(n_cv_folds, max(2, n_original // 20)))
    cv_scores = []
    for train_idx, val_idx in tscv.split(X_train[:n_original]):
        if len(val_idx) < 2:
            continue
        fold_y = y_encoded[train_idx]
        fold_X = X_train[train_idx]
        # Ensure all 3 classes present in fold
        fold_missing = [c for c in range(3) if c not in set(fold_y.tolist())]
        if fold_missing:
            fold_X = np.vstack([fold_X] + [fold_X[:1]] * len(fold_missing))
            fold_y = np.concatenate([fold_y, np.array(fold_missing)])
        try:
            model.fit(fold_X, fold_y)
            preds = model.predict(X_train[val_idx])
            acc = accuracy_score(y_encoded[val_idx], preds)
            cv_scores.append(acc)
        except ValueError:
            continue

    # Final fit
    model.fit(X_train, y_encoded)

    importance = dict(zip(FEATURE_COLUMNS, model.feature_importances_.tolist()))

    metrics = ModelMetrics(
        model_type="action_classification",
        cv_score_mean=float(np.mean(cv_scores)) if cv_scores else 0.0,
        cv_score_std=float(np.std(cv_scores)) if cv_scores else 0.0,
        n_train=len(y_train),
        feature_importance=importance,
    )
    return model, le, metrics


def train_value_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    n_cv_folds: int = 5,
) -> Tuple[Any, ModelMetrics]:
    """Train XGBoost regression model for decision value prediction."""
    if xgb is None:
        raise ImportError("xgboost is required but not installed")

    model = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        reg_alpha=0.2,
        reg_lambda=1.0,
        random_state=42,
        verbosity=0,
    )

    tscv = TimeSeriesSplit(n_splits=min(n_cv_folds, max(2, len(y_train) // 20)))
    cv_scores = []
    for train_idx, val_idx in tscv.split(X_train):
        if len(val_idx) < 2:
            continue
        model.fit(X_train[train_idx], y_train[train_idx])
        preds = model.predict(X_train[val_idx])
        mae = mean_absolute_error(y_train[val_idx], preds)
        cv_scores.append(mae)

    model.fit(X_train, y_train)

    importance = dict(zip(FEATURE_COLUMNS, model.feature_importances_.tolist()))

    metrics = ModelMetrics(
        model_type="value_regression",
        cv_score_mean=float(np.mean(cv_scores)) if cv_scores else 0.0,
        cv_score_std=float(np.std(cv_scores)) if cv_scores else 0.0,
        n_train=len(y_train),
        feature_importance=importance,
    )
    return model, metrics


# ---------------------------------------------------------------------------
# Walk-forward prediction
# ---------------------------------------------------------------------------

def walk_forward_predict(
    df: pd.DataFrame,
    start_week: int = 52,
    retrain_interval: int = 12,
) -> Tuple[List[CounterfactualPrediction], Dict[str, ModelMetrics]]:
    """
    Walk-forward prediction: at each step t, train on 0..t-1, predict at t.

    Args:
        df: Reconstruction DataFrame.
        start_week: First week to predict (0-indexed).
        retrain_interval: Retrain models every N weeks (for speed).

    Returns:
        (predictions, final_metrics)
    """
    X_all, feature_names = prepare_features(df)
    y_price = df[TARGET_PRICE_4W].ffill().fillna(df["spot_price"]).values
    y_action = df[TARGET_ACTION].fillna("hold").values
    y_value = df[TARGET_VALUE].fillna(0.0).values
    n = len(df)

    predictions: List[CounterfactualPrediction] = []
    price_model = None
    action_model = None
    action_le = None
    value_model = None
    last_metrics: Dict[str, ModelMetrics] = {}

    for t in range(start_week, n):
        # Retrain periodically
        need_train = (
            price_model is None
            or (t - start_week) % retrain_interval == 0
        )

        if need_train and t >= 20:
            X_train = X_all[:t]
            # Only use rows where targets are valid
            valid_price = ~np.isnan(y_price[:t])
            if valid_price.sum() >= 15:
                price_model, pm = train_price_model(X_train[valid_price], y_price[:t][valid_price])
                last_metrics["price"] = pm

            if t >= 20:
                action_model, action_le, am = train_action_model(X_train, y_action[:t])
                last_metrics["action"] = am

            valid_value = ~np.isnan(y_value[:t])
            if valid_value.sum() >= 15:
                value_model, vm = train_value_model(X_train[valid_value], y_value[:t][valid_value])
                last_metrics["value"] = vm

        # Predict
        x = X_all[t:t + 1]
        predicted_price = float(price_model.predict(x)[0]) if price_model else float(df.iloc[t]["spot_price"])
        predicted_value = float(value_model.predict(x)[0]) if value_model else 0.0

        if action_model and action_le:
            action_proba = action_model.predict_proba(x)[0]
            action_idx = int(np.argmax(action_proba))
            predicted_action = action_le.inverse_transform([action_idx])[0]
            action_probs = {
                label: float(action_proba[i])
                for i, label in enumerate(action_le.classes_)
            }
        else:
            predicted_action = "hold"
            action_probs = {"buy": 0.0, "hold": 1.0, "sell": 0.0}

        predictions.append(CounterfactualPrediction(
            week_ending=str(df.iloc[t]["week_ending"]),
            predicted_price_4w=round(predicted_price, 4),
            predicted_action=predicted_action,
            action_probabilities=action_probs,
            predicted_value=round(predicted_value, 4),
        ))

    return predictions, last_metrics


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

def evaluate_predictions(
    df: pd.DataFrame,
    predictions: List[CounterfactualPrediction],
    start_week: int = 52,
) -> Dict[str, Any]:
    """Evaluate walk-forward predictions against actuals."""
    prices_actual = df[TARGET_PRICE_4W].values
    actions_actual = df[TARGET_ACTION].values
    values_actual = df[TARGET_VALUE].values

    price_errors = []
    action_correct = 0
    action_total = 0
    value_errors = []

    for i, pred in enumerate(predictions):
        t = start_week + i
        if t >= len(df):
            break

        # Price MAPE
        actual_price = prices_actual[t]
        if not np.isnan(actual_price) and actual_price > 0:
            ape = abs(pred.predicted_price_4w - actual_price) / actual_price
            price_errors.append(ape)

        # Action accuracy
        actual_action = actions_actual[t]
        if isinstance(actual_action, str):
            action_total += 1
            if pred.predicted_action == actual_action:
                action_correct += 1

        # Value MAE
        actual_value = values_actual[t]
        if not np.isnan(actual_value):
            value_errors.append(abs(pred.predicted_value - actual_value))

    return {
        "price_mape": float(np.mean(price_errors)) if price_errors else 0.0,
        "price_mae": float(np.mean([abs(e) for e in price_errors])) if price_errors else 0.0,
        "action_accuracy": action_correct / max(action_total, 1),
        "action_total": action_total,
        "value_mae": float(np.mean(value_errors)) if value_errors else 0.0,
        "n_predictions": len(predictions),
    }


def format_feature_importance(metrics: Dict[str, ModelMetrics], top_n: int = 10) -> str:
    """Format feature importance rankings."""
    lines = []
    for model_type, m in metrics.items():
        if not m.feature_importance:
            continue
        sorted_features = sorted(
            m.feature_importance.items(),
            key=lambda x: x[1],
            reverse=True,
        )
        lines.append(f"\n  {m.model_type} — top {top_n} features:")
        for rank, (feat, imp) in enumerate(sorted_features[:top_n], 1):
            lines.append(f"    {rank:2d}. {feat:<35s} {imp:.4f}")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Train ML counterfactual model")
    parser.add_argument("--train", action="store_true", help="Run training and evaluation")
    parser.add_argument("--csv", type=str, default=None, help="Path to reconstruction CSV")
    args = parser.parse_args()

    if not args.train:
        print("Usage: python3 counterfactual_model.py --train")
        print("  Trains XGBoost models on the reconstruction dataset.")
        return

    if xgb is None:
        print("ERROR: xgboost is not installed. Run: pip install xgboost")
        return

    print("Loading reconstruction dataset...")
    df = load_reconstruction(args.csv)
    print(f"  Rows: {len(df)}, Columns: {len(df.columns)}")

    print("\nRunning walk-forward training and prediction...")
    predictions, final_metrics = walk_forward_predict(df, start_week=52, retrain_interval=12)

    print(f"\nGenerated {len(predictions)} predictions (weeks 52–{52 + len(predictions) - 1})")

    # Evaluate
    eval_results = evaluate_predictions(df, predictions, start_week=52)

    print("\n" + "=" * 60)
    print("ML COUNTERFACTUAL MODEL — EVALUATION RESULTS")
    print("=" * 60)
    print(f"  Price MAPE (4w):       {eval_results['price_mape']*100:.2f}%")
    print(f"  Action accuracy:       {eval_results['action_accuracy']*100:.1f}% "
          f"({eval_results['action_total']} predictions)")
    print(f"  Value MAE:             ${eval_results['value_mae']:.4f}/cert")
    print(f"  N predictions:         {eval_results['n_predictions']}")

    # Feature importance
    print("\n" + "-" * 60)
    print("FEATURE IMPORTANCE")
    print("-" * 60)
    print(format_feature_importance(final_metrics))

    # Save results
    results_path = Path(__file__).parent.parent / "data" / "counterfactual_results.json"
    results = {
        "evaluation": eval_results,
        "feature_importance": {
            k: v.feature_importance for k, v in final_metrics.items()
        },
    }
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {results_path}")


if __name__ == "__main__":
    main()
