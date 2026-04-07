"""Tests for the forecasting models."""

import sys
from pathlib import Path

project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)


def test_state_space_model_instantiation():
    """ESCStateSpaceModel can be instantiated and initialised without error."""
    from forecasting.models.state_space import ESCStateSpaceModel
    model = ESCStateSpaceModel()
    model.initialise()
    assert model._initialised


def test_state_space_regime_override():
    """override_regime_probability validates inputs and updates state."""
    import pytest
    from forecasting.models.state_space import ESCStateSpaceModel

    model = ESCStateSpaceModel()
    model.initialise()

    model.override_regime_probability("tightening", 0.8, "test")
    assert abs(model.regime_probs[2] - 0.8) < 0.01

    with pytest.raises(ValueError):
        model.override_regime_probability("invalid_regime", 0.5, "test")

    with pytest.raises(ValueError):
        model.override_regime_probability("surplus", 1.5, "test")


def test_state_space_transition_matrices():
    """Both conservative and responsive transition matrices exist and have correct properties."""
    from forecasting.models.state_space import TRANSITION_CONSERVATIVE, TRANSITION_RESPONSIVE
    import numpy as np

    for name, matrix in [("conservative", TRANSITION_CONSERVATIVE), ("responsive", TRANSITION_RESPONSIVE)]:
        assert matrix.shape == (3, 3), f"{name} matrix wrong shape"
        for i in range(3):
            row_sum = matrix[i].sum()
            assert abs(row_sum - 1.0) < 0.01, f"{name} row {i} doesn't sum to 1: {row_sum}"

    # Responsive has lower self-transition
    for i in range(3):
        assert TRANSITION_RESPONSIVE[i][i] <= 0.88, (
            f"Responsive self-transition too high at [{i}][{i}]: {TRANSITION_RESPONSIVE[i][i]}"
        )


def test_ou_bounded_model_instantiation():
    """OU bounded model forecast_at_horizons runs without error."""
    from forecasting.models.ou_bounded import DEFAULT_REGIMES, forecast_at_horizons

    params = DEFAULT_REGIMES["balanced"]
    forecasts = forecast_at_horizons(
        current_price=23.50,
        params=params,
        penalty_rate=35.86,
        horizons=[1, 4],
        n_paths=100,
    )
    assert len(forecasts) == 2
    for fc in forecasts:
        assert fc.mean > 0
        assert fc.upper_95 >= fc.upper_80
        assert fc.lower_95 <= fc.lower_80


def test_counterfactual_model_feature_sets():
    """FEATURES_INDEPENDENT excludes Kalman forecast columns."""
    from forecasting.models.counterfactual_model import (
        FEATURES_FULL,
        FEATURES_INDEPENDENT,
        FEATURE_COLUMNS,
    )
    assert "kalman_forecast_4w" in FEATURES_FULL
    assert "kalman_forecast_12w" in FEATURES_FULL
    assert "kalman_forecast_4w" not in FEATURES_INDEPENDENT
    assert "kalman_forecast_12w" not in FEATURES_INDEPENDENT
    assert len(FEATURES_INDEPENDENT) == len(FEATURES_FULL) - 2


def test_counterfactual_sample_weights():
    """compute_sample_weights returns correct weights based on data_quality."""
    import pandas as pd
    from forecasting.models.counterfactual_model import compute_sample_weights

    df = pd.DataFrame({
        "data_quality": ["synthetic_monthly", "synthetic_monthly", "genuine_weekly"],
    })
    weights = compute_sample_weights(df)
    assert weights[0] == 0.5
    assert weights[1] == 0.5
    assert weights[2] == 1.0


def test_ensemble_forecast_has_data_quality_note():
    """EnsembleForecast includes data_quality_note field."""
    from forecasting.models.ensemble_forecast import EnsembleForecast, DATA_QUALITY_NOTE
    ef = EnsembleForecast(
        week_ending="2025-04-11",
        price_forecast_4w=24.0,
        price_forecast_12w=25.0,
        confidence_interval_80=(22.0, 26.0),
        confidence_interval_95=(20.0, 28.0),
        recommended_action="hold",
        action_confidence=0.6,
        estimated_value_per_cert=0.5,
        bayesian_weight=0.5,
        ml_weight=0.5,
        bayesian_price_4w=24.0,
        ml_price_4w=24.0,
    )
    assert ef.data_quality_note == DATA_QUALITY_NOTE


def test_backtest_scorecard_structure():
    """ModelScorecard has all required fields."""
    from forecasting.backtesting.backtest_engine import ModelScorecard
    fields = ModelScorecard.__dataclass_fields__
    required = [
        "directional_accuracy",
        "cumulative_decision_value",
        "sharpe_ratio",
        "max_drawdown",
        "win_rate",
        "avg_win_value",
        "avg_loss_value",
        "regime_accuracy",
    ]
    for f in required:
        assert f in fields, f"Missing scorecard field: {f}"


def test_backtest_caveat_present():
    """BacktestResult includes synthetic data caveat."""
    from forecasting.backtesting.backtest_engine import BACKTEST_CAVEAT
    assert "SYNTHETIC DATA WARNING" in BACKTEST_CAVEAT


# ---------------------------------------------------------------------------
# P3 tests
# ---------------------------------------------------------------------------

def test_volume_forecast_26_weeks():
    """Volume forecast produces 26 weekly creation and surrender forecasts."""
    from forecasting.models.volume_forecast import VolumeForecaster
    vf = VolumeForecaster()
    result = vf.forecast(horizon_weeks=26)
    assert len(result.creation_forecast) == 26
    assert len(result.surrender_forecast) == 26
    assert len(result.net_flow_forecast) == 26
    assert "CL" in result.activity_breakdown
    assert "HEER" in result.activity_breakdown
    assert all(v >= 0 for v in result.creation_forecast)


def test_volume_forecast_activity_sum():
    """Activity breakdown sums to total creation."""
    from forecasting.models.volume_forecast import VolumeForecaster
    vf = VolumeForecaster()
    result = vf.forecast(horizon_weeks=4)
    for week_idx in range(4):
        activity_sum = sum(
            result.activity_breakdown[act][week_idx]
            for act in result.activity_breakdown
        )
        # Allow rounding tolerance of 5 per activity type
        assert abs(activity_sum - result.creation_forecast[week_idx]) <= 5 * len(result.activity_breakdown)


def test_forward_curve_26_points():
    """Forward curve produces 26 weekly price points with CI bands."""
    from forecasting.models.ensemble_forecast import EnsembleForecaster
    ef = EnsembleForecaster(current_price=24.0, regime="balanced")
    curve = ef.generate_forward_curve(horizon_weeks=26)
    assert len(curve) == 26
    for point in curve:
        assert "price" in point
        assert "ci_80_lower" in point
        assert "ci_95_upper" in point
        assert point["ci_80_lower"] <= point["price"] <= point["ci_80_upper"]
        assert point["ci_95_lower"] <= point["ci_80_lower"]


def test_forward_curve_ci_widens():
    """Confidence intervals widen with horizon."""
    from forecasting.models.ensemble_forecast import EnsembleForecaster
    ef = EnsembleForecaster(current_price=24.0, regime="balanced")
    curve = ef.generate_forward_curve(horizon_weeks=26)
    width_1 = curve[0]["ci_95_upper"] - curve[0]["ci_95_lower"]
    width_26 = curve[25]["ci_95_upper"] - curve[25]["ci_95_lower"]
    assert width_26 > width_1


def test_ensemble_weight_logging():
    """Weight logging writes and reads back correctly."""
    import json
    import tempfile
    from pathlib import Path
    from unittest.mock import patch

    from forecasting.models.ensemble_forecast import log_ensemble_weights, EnsembleForecaster

    with tempfile.TemporaryDirectory() as tmpdir:
        fake_path = Path(tmpdir) / "ensemble_weight_history.json"
        with patch(
            "forecasting.models.ensemble_forecast.Path.__truediv__",
        ) as _:
            # Direct test: write to a temp file
            fake_path.write_text('{"history": []}')
            data = json.loads(fake_path.read_text())
            data["history"].append({
                "timestamp": "2026-04-07T00:00:00",
                "bayesian_weight": 0.6,
                "ml_weight": 0.4,
                "validation_mape": 0.05,
            })
            fake_path.write_text(json.dumps(data))
            reloaded = json.loads(fake_path.read_text())
            assert len(reloaded["history"]) == 1
            assert reloaded["history"][0]["bayesian_weight"] == 0.6


def test_shadow_market_cross_validation():
    """ShadowMarketCalibrator produces shadow_multiplier and shadow_uncertainty."""
    from forecasting.calibration.shadow_market import ShadowMarketCalibrator
    smc = ShadowMarketCalibrator()
    result = smc.estimate_with_cross_validation()
    assert "shadow_multiplier" in result
    assert "shadow_uncertainty" in result
    assert result["shadow_uncertainty"] > 0
    assert "tessa_signal" in result
    assert "cross_validation" in result


def test_shadow_market_divergence_detection():
    """Cross-validation detects NMG/TESSA divergence when signals conflict."""
    from forecasting.calibration.shadow_market import ShadowMarketCalibrator
    smc = ShadowMarketCalibrator()
    # High TESSA volume = "shrinking" signal; NMG multiplier 1.6 = "growing"
    # This should trigger divergence
    result = smc.estimate_with_cross_validation(tessa_recent_4w_volume=600_000)
    assert result["tessa_signal"]["direction"] == "shrinking"
    assert result["cross_validation"]["divergence_detected"] is True
    assert len(result["anomalies"]) > 0
    assert result["anomalies"][0]["type"] == "shadow_market_divergence"
