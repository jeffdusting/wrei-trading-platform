#!/usr/bin/env python3
"""
Ensemble weight investigation: determine if ensemble is genuinely multi-model
or effectively single-model.
"""

import json
import sys
from pathlib import Path

project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import numpy as np
import pandas as pd

from forecasting.models.counterfactual_model import load_reconstruction, walk_forward_predict
from forecasting.models.ensemble_forecast import optimise_weights


def investigate() -> dict:
    """Run weight investigation across multiple windows."""
    print("Loading data...")
    df = load_reconstruction()
    start_week = 52

    print("Running ML walk-forward predictions...")
    predictions, _ = walk_forward_predict(df, start_week=start_week, retrain_interval=12)

    bayesian = df["kalman_forecast_4w"].values
    actuals = df["price_t_plus_4w"].values
    n = len(df)

    # Build ML forecast array
    ml_forecasts = np.full(n, np.nan)
    for i, pred in enumerate(predictions):
        t = start_week + i
        if t < n:
            ml_forecasts[t] = pred.predicted_price_4w

    # Investigate weights across expanding windows
    window_sizes = [26, 52, 78, 104]
    window_results = []

    for window in window_sizes:
        eval_start = max(start_week + window, start_week + 26)
        weights_by_step = []

        for t in range(eval_start, n):
            w_start = max(start_week, t - window)
            bay = bayesian[w_start:t]
            ml = ml_forecasts[w_start:t]
            act = actuals[w_start:t]
            valid = ~np.isnan(bay) & ~np.isnan(ml) & ~np.isnan(act)
            if valid.sum() >= 10:
                w_bay, _, mape = optimise_weights(bay[valid], ml[valid], act[valid])
                weights_by_step.append({
                    "t": int(t),
                    "bayesian_weight": round(float(w_bay), 4),
                    "mape": round(float(mape), 6),
                })

        if weights_by_step:
            bay_weights = [w["bayesian_weight"] for w in weights_by_step]
            window_results.append({
                "window_size": window,
                "n_evaluations": len(weights_by_step),
                "mean_bayesian_weight": round(float(np.mean(bay_weights)), 4),
                "std_bayesian_weight": round(float(np.std(bay_weights)), 4),
                "min_bayesian_weight": round(float(np.min(bay_weights)), 4),
                "max_bayesian_weight": round(float(np.max(bay_weights)), 4),
                "pct_below_0.15": round(float(np.mean(np.array(bay_weights) < 0.15)), 4),
                "pct_above_0.85": round(float(np.mean(np.array(bay_weights) > 0.85)), 4),
            })
            print(f"  Window={window}w: mean_bay_w={np.mean(bay_weights):.4f}, "
                  f"std={np.std(bay_weights):.4f}, "
                  f"range=[{np.min(bay_weights):.2f}, {np.max(bay_weights):.2f}]")

    # Overall optimisation on full data
    valid_idx = np.arange(start_week, n)
    valid_mask = ~np.isnan(bayesian[valid_idx]) & ~np.isnan(ml_forecasts[valid_idx]) & ~np.isnan(actuals[valid_idx])
    valid = valid_idx[valid_mask]
    w_bay_full, w_ml_full, mape_full = optimise_weights(
        bayesian[valid], ml_forecasts[valid], actuals[valid]
    )

    # Test with clamped weights [0.2, 0.8]
    clamped_w_bay = np.clip(w_bay_full, 0.2, 0.8)
    clamped_w_ml = 1.0 - clamped_w_bay
    clamped_ensemble = clamped_w_bay * bayesian[valid] + clamped_w_ml * ml_forecasts[valid]
    clamped_mape = float(np.mean(np.abs((actuals[valid] - clamped_ensemble) / np.maximum(actuals[valid], 1.0))))

    unclamped_ensemble = w_bay_full * bayesian[valid] + w_ml_full * ml_forecasts[valid]
    unclamped_mape = float(np.mean(np.abs((actuals[valid] - unclamped_ensemble) / np.maximum(actuals[valid], 1.0))))

    # Determine verdict
    all_mean_weights = [wr["mean_bayesian_weight"] for wr in window_results]
    is_single_model = all(w < 0.15 or w > 0.85 for w in all_mean_weights)

    mape_impact = clamped_mape - unclamped_mape

    return {
        "full_data_weight": {
            "bayesian": round(float(w_bay_full), 4),
            "ml": round(float(w_ml_full), 4),
            "mape": round(float(mape_full), 6),
        },
        "clamped_comparison": {
            "unclamped_mape": round(unclamped_mape, 6),
            "clamped_mape": round(clamped_mape, 6),
            "mape_impact": round(mape_impact, 6),
            "mape_impact_pct": f"{mape_impact*100:.4f}%",
            "clamped_bayesian_weight": round(float(clamped_w_bay), 4),
        },
        "window_analysis": window_results,
        "is_effectively_single_model": is_single_model,
        "verdict": (
            "The ensemble is effectively single-model (ML dominant)"
            if is_single_model
            else "The ensemble is genuinely multi-model"
        ),
    }


def main() -> None:
    print("Ensemble Weight Investigation\n")
    results = investigate()

    print(f"\n  Full-data weight: bay={results['full_data_weight']['bayesian']:.4f}, "
          f"ml={results['full_data_weight']['ml']:.4f}")
    print(f"  Unclamped MAPE: {results['clamped_comparison']['unclamped_mape']*100:.4f}%")
    print(f"  Clamped MAPE:   {results['clamped_comparison']['clamped_mape']*100:.4f}%")
    print(f"  MAPE impact:    {results['clamped_comparison']['mape_impact_pct']}")
    print(f"  Verdict: {results['verdict']}")

    # Write JSON results
    out_path = Path(__file__).parent.parent / "analysis" / "ensemble_weight_investigation.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nJSON written to {out_path}")

    # Return results for markdown generation
    return results


if __name__ == "__main__":
    results = main()

    # Write markdown report
    md_path = Path(__file__).parent.parent / "analysis" / "ensemble_weight_investigation.md"

    lines = [
        "# Ensemble Weight Analysis",
        "",
        "## Verdict",
        "",
    ]

    if results["is_effectively_single_model"]:
        lines.append(
            "**The ensemble is effectively single-model.** "
            "The Bayesian component receives consistently low weight "
            f"(mean ≈ {results['full_data_weight']['bayesian']:.2f}), "
            "indicating the ML (XGBoost) model dominates the ensemble. "
            "Weight clamping to [0.2, 0.8] has been applied."
        )
    else:
        lines.append(
            "**The ensemble is genuinely multi-model.** "
            "Both Bayesian and ML components contribute meaningfully."
        )

    lines.extend([
        "",
        "## Full-Data Optimisation",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Bayesian weight | {results['full_data_weight']['bayesian']:.4f} |",
        f"| ML weight | {results['full_data_weight']['ml']:.4f} |",
        f"| Ensemble MAPE | {results['full_data_weight']['mape']*100:.4f}% |",
        "",
        "## Clamped Weight Comparison",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Unclamped MAPE | {results['clamped_comparison']['unclamped_mape']*100:.4f}% |",
        f"| Clamped MAPE ([0.2, 0.8]) | {results['clamped_comparison']['clamped_mape']*100:.4f}% |",
        f"| MAPE impact | {results['clamped_comparison']['mape_impact_pct']} |",
        "",
        "## Window Analysis",
        "",
        "| Window | N evals | Mean bay_w | Std | Min | Max | % < 0.15 | % > 0.85 |",
        "|--------|---------|-----------|-----|-----|-----|----------|----------|",
    ])

    for wr in results["window_analysis"]:
        lines.append(
            f"| {wr['window_size']}w | {wr['n_evaluations']} | "
            f"{wr['mean_bayesian_weight']:.4f} | {wr['std_bayesian_weight']:.4f} | "
            f"{wr['min_bayesian_weight']:.2f} | {wr['max_bayesian_weight']:.2f} | "
            f"{wr['pct_below_0.15']*100:.1f}% | {wr['pct_above_0.85']*100:.1f}% |"
        )

    lines.extend([
        "",
        "## Interpretation",
        "",
        "On synthetic interpolated data, the XGBoost model consistently achieves lower MAPE "
        "than the Bayesian state-space model. This is expected: XGBoost has access to the same "
        "features that generated the synthetic data, creating a circular advantage. "
        "The true test of ensemble value will come when genuine weekly observations replace "
        "synthetic data — the Bayesian model's structural assumptions about mean-reversion "
        "may prove more robust on real market dynamics.",
    ])

    with open(md_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"Markdown written to {md_path}")
