#!/usr/bin/env python3
"""
Session G Task 3: Definitive Forecast Validation

Runs the full backtest on genuine + hybrid data, computes statistical
significance tests, and checks CI calibration.
"""

import json
import math
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from scipy import stats

# Ensure project root on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from forecasting.backtesting.backtest_engine import BacktestEngine, HORIZONS
from forecasting.data_assembly import assemble_hybrid_dataset, get_genuine_observation_count
from forecasting.models.state_space import load_historical_data


def run_backtest_on_data(label: str = "hybrid") -> Dict[str, Any]:
    """Run the backtest engine and return structured results."""
    engine = BacktestEngine()
    result = engine.run(start_week=52, model_version="session-g-validation")

    n_genuine = get_genuine_observation_count()
    print(f"\n{'='*60}")
    print(f"BACKTEST RESULTS — {label} dataset ({n_genuine} genuine observations)")
    print(f"{'='*60}")

    overall = result.overall_metrics
    output = {
        "label": label,
        "n_genuine": n_genuine,
        "n_total": engine.n,
        "test_period": f"{result.test_period_start} to {result.test_period_end}",
    }

    # Overall metrics by horizon
    metrics_table = {}
    for h in HORIZONS:
        if h in overall:
            m = overall[h]
            metrics_table[h] = {
                "mape_model": round(m.mape * 100, 2),
                "mape_naive": round(m.mape_naive * 100, 2),
                "mape_sma4": round(m.mape_sma4 * 100, 2),
                "directional_accuracy": round(m.directional_accuracy * 100, 1),
                "decision_value": round(m.decision_value, 2),
                "coverage_80": round(m.coverage_80 * 100, 1),
                "coverage_95": round(m.coverage_95 * 100, 1),
                "n_observations": m.n_observations,
            }
            print(f"\n  {h}w horizon ({m.n_observations} obs):")
            print(f"    MAPE: model={m.mape*100:.2f}% naive={m.mape_naive*100:.2f}% sma4={m.mape_sma4*100:.2f}%")
            print(f"    Directional accuracy: {m.directional_accuracy*100:.1f}%")
            print(f"    Decision value: A${m.decision_value:,.2f}")
            print(f"    CI coverage: 80%={m.coverage_80*100:.1f}% 95%={m.coverage_95*100:.1f}%")

    output["metrics"] = metrics_table

    # Regime-specific metrics
    regime_data = {}
    for rm in result.regime_metrics:
        regime_data[rm.period_type] = {"n_weeks": rm.n_weeks}
        if 4 in rm.metrics:
            m4 = rm.metrics[4]
            regime_data[rm.period_type].update({
                "mape_4w": round(m4.mape * 100, 2),
                "directional_accuracy_4w": round(m4.directional_accuracy * 100, 1),
                "decision_value_4w": round(m4.decision_value, 2),
            })
            print(f"\n  {rm.period_type} ({rm.n_weeks} weeks):")
            print(f"    MAPE(4w): {m4.mape*100:.2f}%  Dir.Acc: {m4.directional_accuracy*100:.1f}%  DV: A${m4.decision_value:,.2f}")

    output["regime_metrics"] = regime_data

    return output, engine, result


def binomial_test(accuracy: float, n: int, p0: float = 1/3) -> Dict[str, Any]:
    """
    Test if directional accuracy is significantly better than random (p0=1/3).
    """
    k = int(round(accuracy * n))
    # One-sided binomial test: P(X >= k) under H0: p = p0
    p_value = 1 - stats.binom.cdf(k - 1, n, p0)
    return {
        "accuracy": round(accuracy * 100, 1),
        "n": n,
        "successes": k,
        "null_probability": p0,
        "p_value": round(p_value, 4),
        "significant_at_005": p_value < 0.05,
        "significant_at_010": p_value < 0.10,
    }


def diebold_mariano_test(
    actuals: np.ndarray,
    forecast_model: np.ndarray,
    forecast_naive: np.ndarray,
) -> Dict[str, Any]:
    """
    Diebold-Mariano test for relative forecast accuracy.
    H0: model and naive have equal predictive ability.
    """
    d = (forecast_model - actuals)**2 - (forecast_naive - actuals)**2
    n = len(d)
    if n < 5:
        return {"dm_statistic": None, "p_value": None, "n": n, "note": "too few observations"}

    d_bar = np.mean(d)
    # Newey-West style variance (simple lag-1 autocorrelation)
    gamma_0 = np.var(d, ddof=1)
    if gamma_0 == 0:
        return {"dm_statistic": 0.0, "p_value": 1.0, "n": n}
    gamma_1 = np.cov(d[:-1], d[1:])[0, 1] if n > 1 else 0
    var_d = (gamma_0 + 2 * gamma_1) / n
    var_d = max(var_d, 1e-10)

    dm_stat = d_bar / np.sqrt(var_d)
    p_value = 2 * (1 - stats.t.cdf(abs(dm_stat), df=n - 1))

    return {
        "dm_statistic": round(float(dm_stat), 3),
        "p_value": round(float(p_value), 4),
        "n": n,
        "model_beats_naive": dm_stat < 0,
        "significant_at_005": p_value < 0.05,
    }


def ci_calibration_check(
    engine: "BacktestEngine",
    result: "Any",
) -> Dict[str, Any]:
    """Check if confidence intervals are properly calibrated."""
    calibration = {}

    for h in HORIZONS:
        covered_80 = 0
        covered_95 = 0
        total = 0

        for rec in result.forecast_records:
            actual = rec.actuals.get(h)
            if actual is None:
                continue
            total += 1

            lo_80, hi_80 = rec.confidence_80.get(h, (0, 0))
            lo_95, hi_95 = rec.confidence_95.get(h, (0, 0))

            if lo_80 <= actual <= hi_80:
                covered_80 += 1
            if lo_95 <= actual <= hi_95:
                covered_95 += 1

        if total > 0:
            cov_80 = covered_80 / total
            cov_95 = covered_95 / total
            calibration[h] = {
                "target_80": 0.80,
                "actual_80": round(cov_80, 3),
                "target_95": 0.95,
                "actual_95": round(cov_95, 3),
                "n": total,
                "needs_widening_80": cov_80 < 0.75,
                "needs_widening_95": cov_95 < 0.90,
            }
            if cov_80 < 0.75:
                # Calculate expansion factor
                calibration[h]["expansion_factor_80"] = round(0.80 / max(cov_80, 0.01), 3)

            print(f"\n  {h}w CI calibration ({total} obs):")
            print(f"    80% CI: actual coverage = {cov_80*100:.1f}% (target 80%)")
            print(f"    95% CI: actual coverage = {cov_95*100:.1f}% (target 95%)")

    return calibration


def genuine_vs_synthetic_comparison(engine: "BacktestEngine", result: "Any") -> Dict[str, Any]:
    """Compare model performance on genuine vs synthetic observations."""
    df = engine.df

    genuine_indices = []
    synthetic_indices = []

    for i, rec in enumerate(result.forecast_records):
        week_idx = rec.week_index
        if week_idx < len(df):
            quality = df.iloc[week_idx].get("data_quality", "synthetic_monthly")
            if quality == "genuine_weekly":
                genuine_indices.append(i)
            else:
                synthetic_indices.append(i)

    comparison = {
        "genuine_count": len(genuine_indices),
        "synthetic_count": len(synthetic_indices),
    }

    if genuine_indices:
        genuine_metrics = engine._compute_metrics(genuine_indices)
        if 4 in genuine_metrics:
            m = genuine_metrics[4]
            comparison["genuine_4w"] = {
                "mape": round(m.mape * 100, 2),
                "directional_accuracy": round(m.directional_accuracy * 100, 1),
                "decision_value": round(m.decision_value, 2),
            }

    return comparison


def run_definitive_validation() -> Dict[str, Any]:
    """Execute the full definitive validation suite."""
    print("=" * 60)
    print(f"DEFINITIVE FORECAST VALIDATION — {get_genuine_observation_count()} genuine observations")
    print("=" * 60)

    # 3a. Run full backtest
    output, engine, result = run_backtest_on_data("hybrid")

    # 3b. Statistical tests
    print(f"\n{'='*60}")
    print("STATISTICAL SIGNIFICANCE TESTS")
    print(f"{'='*60}")

    # Collect actuals and forecasts for 4w horizon
    actuals_4w = []
    forecast_4w = []
    naive_4w = []

    for rec in result.forecast_records:
        actual = rec.actuals.get(4)
        if actual is None:
            continue
        actuals_4w.append(actual)
        forecast_4w.append(rec.forecasts[4])
        naive_4w.append(rec.current_price)

    actuals_arr = np.array(actuals_4w)
    forecast_arr = np.array(forecast_4w)
    naive_arr = np.array(naive_4w)

    # Directional accuracy
    if 4 in result.overall_metrics:
        m4 = result.overall_metrics[4]
        binom = binomial_test(m4.directional_accuracy, m4.n_observations)
        output["binomial_test_4w"] = binom
        print(f"\n  Binomial test (4w directional accuracy):")
        print(f"    Accuracy: {binom['accuracy']}% ({binom['successes']}/{binom['n']})")
        print(f"    p-value: {binom['p_value']} {'***' if binom['significant_at_005'] else '(not significant)'}")

    # DM test
    if len(actuals_arr) >= 5:
        dm = diebold_mariano_test(actuals_arr, forecast_arr, naive_arr)
        output["dm_test_4w"] = dm
        print(f"\n  Diebold-Mariano test (4w, model vs naive):")
        print(f"    DM statistic: {dm['dm_statistic']}")
        print(f"    p-value: {dm['p_value']}")
        print(f"    Model beats naive: {dm.get('model_beats_naive', 'N/A')}")

    # 3c. CI calibration
    print(f"\n{'='*60}")
    print("CONFIDENCE INTERVAL CALIBRATION")
    print(f"{'='*60}")
    ci_cal = ci_calibration_check(engine, result)
    output["ci_calibration"] = ci_cal

    # Genuine vs synthetic comparison
    print(f"\n{'='*60}")
    print("GENUINE vs SYNTHETIC COMPARISON")
    print(f"{'='*60}")
    comparison = genuine_vs_synthetic_comparison(engine, result)
    output["genuine_vs_synthetic"] = comparison
    print(f"  Genuine obs in test set: {comparison['genuine_count']}")
    if "genuine_4w" in comparison:
        g = comparison["genuine_4w"]
        print(f"  Genuine 4w MAPE: {g['mape']}%  Dir.Acc: {g['directional_accuracy']}%  DV: A${g['decision_value']:,.2f}")

    # Price persistence on genuine data
    print(f"\n{'='*60}")
    print("GENUINE DATA CHARACTERISTICS")
    print(f"{'='*60}")
    rows = assemble_hybrid_dataset()
    genuine_prices = [r["spot_price"] for r in rows if r.get("data_quality") == "genuine_weekly"]
    if len(genuine_prices) >= 2:
        genuine_arr = np.array(genuine_prices)
        if len(genuine_arr) > 2:
            autocorr = np.corrcoef(genuine_arr[:-1], genuine_arr[1:])[0, 1]
        else:
            autocorr = float("nan")
        output["genuine_characteristics"] = {
            "count": len(genuine_prices),
            "mean": round(float(np.mean(genuine_arr)), 2),
            "std": round(float(np.std(genuine_arr)), 2),
            "min": round(float(np.min(genuine_arr)), 2),
            "max": round(float(np.max(genuine_arr)), 2),
            "autocorrelation_1": round(float(autocorr), 3) if not math.isnan(autocorr) else None,
        }
        print(f"  Count: {len(genuine_prices)}")
        print(f"  Range: ${np.min(genuine_arr):.2f} – ${np.max(genuine_arr):.2f}")
        print(f"  Mean: ${np.mean(genuine_arr):.2f}  Std: ${np.std(genuine_arr):.2f}")
        print(f"  1-step autocorrelation: {autocorr:.3f}")

    # Save results
    output_path = os.path.join(os.path.dirname(__file__), "definitive_validation_results.json")
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2, default=str)
    print(f"\nResults saved to {output_path}")

    return output


if __name__ == "__main__":
    run_definitive_validation()
