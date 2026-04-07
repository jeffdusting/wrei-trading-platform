#!/usr/bin/env python3
"""
Generate missing analysis artefacts:
  - forecasting/analysis/feature_independence_report.json
  - forecasting/analysis/ensemble_weight_history.json
"""

import json
import sys
from pathlib import Path

project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import numpy as np
import pandas as pd


def generate_feature_independence_report() -> None:
    """Compute feature correlation matrix and VIF for independence analysis."""
    from forecasting.models.counterfactual_model import (
        FEATURE_COLUMNS,
        load_reconstruction,
        prepare_features,
    )

    print("Generating feature independence report...")
    df = load_reconstruction()
    X, feature_names = prepare_features(df)
    X_df = pd.DataFrame(X, columns=feature_names)

    # Pairwise correlation matrix
    corr = X_df.corr()

    # Find highly correlated pairs (|r| > 0.8)
    high_corr_pairs = []
    for i in range(len(feature_names)):
        for j in range(i + 1, len(feature_names)):
            r = corr.iloc[i, j]
            if abs(r) > 0.8:
                high_corr_pairs.append({
                    "feature_a": feature_names[i],
                    "feature_b": feature_names[j],
                    "correlation": round(float(r), 4),
                })

    # VIF (Variance Inflation Factor) for multicollinearity
    from numpy.linalg import LinAlgError

    vif_results = {}
    X_clean = X_df.fillna(0.0).values
    # Remove constant columns
    col_std = np.std(X_clean, axis=0)
    nonconstant = col_std > 1e-10

    for i, fname in enumerate(feature_names):
        if not nonconstant[i]:
            vif_results[fname] = {"vif": float("inf"), "note": "constant column"}
            continue
        others = [j for j in range(len(feature_names)) if j != i and nonconstant[j]]
        if not others:
            vif_results[fname] = {"vif": 1.0, "note": "only non-constant column"}
            continue
        y = X_clean[:, i]
        X_others = X_clean[:, others]
        try:
            # R² from regressing feature i on all others
            X_aug = np.column_stack([np.ones(len(y)), X_others])
            beta = np.linalg.lstsq(X_aug, y, rcond=None)[0]
            y_hat = X_aug @ beta
            ss_res = np.sum((y - y_hat) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)
            r_squared = 1.0 - ss_res / max(ss_tot, 1e-10)
            vif = 1.0 / max(1.0 - r_squared, 1e-10)
            vif_results[fname] = {"vif": round(float(vif), 2)}
        except (LinAlgError, ValueError):
            vif_results[fname] = {"vif": float("nan"), "note": "computation failed"}

    report = {
        "n_features": len(feature_names),
        "n_observations": len(X_df),
        "feature_names": feature_names,
        "high_correlation_pairs": sorted(
            high_corr_pairs, key=lambda x: abs(x["correlation"]), reverse=True
        ),
        "vif": vif_results,
        "summary": {
            "n_high_corr_pairs": len(high_corr_pairs),
            "max_vif": max(
                (v["vif"] for v in vif_results.values() if isinstance(v["vif"], (int, float)) and not np.isnan(v["vif"]) and not np.isinf(v["vif"])),
                default=0.0,
            ),
            "features_with_vif_above_10": [
                f for f, v in vif_results.items()
                if isinstance(v["vif"], (int, float)) and v["vif"] > 10 and not np.isinf(v["vif"])
            ],
        },
    }

    out_path = Path(__file__).parent.parent / "analysis" / "feature_independence_report.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2, default=str)
    print(f"  Written to {out_path}")
    print(f"  {report['summary']['n_high_corr_pairs']} highly correlated pairs (|r| > 0.8)")
    print(f"  {len(report['summary']['features_with_vif_above_10'])} features with VIF > 10")


def generate_ensemble_weight_history() -> None:
    """Run ensemble evaluation to produce weight history log."""
    from forecasting.models.ensemble_forecast import run_ensemble_evaluation

    print("Generating ensemble weight history...")
    results = run_ensemble_evaluation()
    print(f"  Bayesian weight: {results['bayesian_weight']:.4f}")
    print(f"  ML weight: {results['ml_weight']:.4f}")
    print(f"  Ensemble MAPE 4w: {results['ensemble_mape_4w']*100:.2f}%")

    # Verify the file was created by log_ensemble_weights()
    history_path = Path(__file__).parent.parent / "analysis" / "ensemble_weight_history.json"
    if history_path.exists():
        print(f"  Written to {history_path}")
    else:
        print("  WARNING: ensemble_weight_history.json was not created")


if __name__ == "__main__":
    generate_feature_independence_report()
    print()
    generate_ensemble_weight_history()
    print("\nDone.")
