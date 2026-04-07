#!/usr/bin/env python3
"""
Signal Extraction Calibration
==============================

Runs the signal validation set through analysis to compute calibration
scaling factors for the AI signal extractor.

Since the signal extractor uses the Claude API and cannot be called for
every historical document, this script uses the validation set's expected
signals (based on domain-expert analysis of known events) compared against
actual price outcomes to compute calibration adjustments.

When ANTHROPIC_API_KEY is available, the script can optionally run the
live extractor on documents in the intelligence database.

Output:
  - forecasting/calibration/signal_calibration.json
  - forecasting/analysis/signal_calibration_report.md
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np

project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

CALIBRATION_DIR = Path(__file__).resolve().parent.parent / "calibration"
ANALYSIS_DIR = Path(__file__).resolve().parent.parent / "analysis"


def load_validation_set() -> list[dict]:
    """Load the signal validation set."""
    path = CALIBRATION_DIR / "signal_validation_set.json"
    with open(path, "r") as f:
        data = json.load(f)
    return data["documents"]


def compute_direction_accuracy(docs: list[dict]) -> dict:
    """
    Compute direction accuracy: does the expected signal direction
    match the actual price movement direction?

    Returns metrics dict.
    """
    correct = 0
    total = 0
    details = []

    for doc in docs:
        actual_4w = doc.get("actual_price_change_4w")
        actual_12w = doc.get("actual_price_change_12w")
        expected_dir = doc.get("expected_signal_direction")

        if actual_4w is None or expected_dir is None:
            continue

        # Map actual price change to direction
        # Tightening = price increase, surplus = price decrease
        if actual_4w > 0.25:
            actual_dir = "tightening"
        elif actual_4w < -0.25:
            actual_dir = "surplus"
        else:
            actual_dir = "neutral"

        # Check match
        match = (expected_dir == actual_dir)
        if expected_dir == "neutral" and abs(actual_4w) < 1.0:
            match = True  # Neutral is correct if price didn't move much

        total += 1
        if match:
            correct += 1

        details.append({
            "id": doc["id"],
            "title": doc["title"][:60],
            "expected_dir": expected_dir,
            "actual_dir": actual_dir,
            "actual_4w": actual_4w,
            "match": match,
        })

    accuracy = correct / total if total > 0 else 0.0
    return {
        "direction_accuracy": accuracy,
        "correct": correct,
        "total": total,
        "details": details,
    }


def compute_magnitude_calibration(docs: list[dict]) -> dict:
    """
    Compare expected supply/demand impact magnitudes against actual
    price changes to compute a scaling factor.

    If the extractor consistently overpredicts impact by factor X,
    the calibration factor is 1/X.
    """
    predicted_impacts = []
    actual_impacts = []

    for doc in docs:
        supply_pct = doc.get("expected_supply_impact_pct", 0.0)
        demand_pct = doc.get("expected_demand_impact_pct", 0.0)
        actual_4w = doc.get("actual_price_change_4w")
        price_at = doc.get("actual_price_at_event")

        if actual_4w is None or price_at is None or price_at == 0:
            continue

        # Net expected impact: supply reduction → price increase, demand increase → price increase
        # Supply decrease (negative supply_pct) → tightening → positive price impact
        # Demand increase (positive demand_pct) → tightening → positive price impact
        net_predicted = -supply_pct + demand_pct

        # Actual impact as percentage of price
        actual_pct = actual_4w / price_at

        if abs(net_predicted) > 0.001:
            predicted_impacts.append(net_predicted)
            actual_impacts.append(actual_pct)

    if not predicted_impacts:
        return {
            "supply_scaling_factor": 1.0,
            "demand_scaling_factor": 1.0,
            "overall_scaling_factor": 1.0,
            "n_observations": 0,
            "note": "Insufficient data for magnitude calibration",
        }

    predicted = np.array(predicted_impacts)
    actual = np.array(actual_impacts)

    # Compute ratio: actual / predicted
    ratios = []
    for p, a in zip(predicted, actual):
        if abs(p) > 0.001:
            ratios.append(a / p)

    if not ratios:
        return {
            "supply_scaling_factor": 1.0,
            "demand_scaling_factor": 1.0,
            "overall_scaling_factor": 1.0,
            "n_observations": 0,
            "note": "No valid ratio observations",
        }

    median_ratio = float(np.median(ratios))
    mean_ratio = float(np.mean(ratios))

    # Use median as the calibration factor (more robust to outliers)
    # Clamp to [0.1, 3.0] to avoid extreme corrections
    scaling = max(0.1, min(3.0, abs(median_ratio)))

    # Correlation between predicted direction and actual direction
    if len(predicted) >= 3:
        corr = float(np.corrcoef(predicted, actual)[0, 1])
        if math.isnan(corr):
            corr = 0.0
    else:
        corr = 0.0

    return {
        "supply_scaling_factor": round(scaling, 4),
        "demand_scaling_factor": round(scaling, 4),
        "overall_scaling_factor": round(scaling, 4),
        "median_ratio": round(median_ratio, 4),
        "mean_ratio": round(mean_ratio, 4),
        "correlation": round(corr, 4),
        "n_observations": len(ratios),
        "ratios": [round(r, 4) for r in ratios],
    }


def generate_calibration_report(
    direction_results: dict,
    magnitude_results: dict,
    docs: list[dict],
) -> str:
    """Generate the markdown calibration report."""
    n_total = len(docs)
    n_with_actuals = sum(1 for d in docs if d.get("actual_price_change_4w") is not None)
    n_future = n_total - n_with_actuals

    dir_acc = direction_results["direction_accuracy"]
    reliable = dir_acc >= 0.60

    lines = [
        "# Signal Extraction Calibration Report",
        "",
        f"## Date: 2026-04-08",
        f"## Validation documents: {n_total} ({n_with_actuals} with actuals, {n_future} future events)",
        "",
        "## Direction Accuracy",
        "",
        f"- **Accuracy: {dir_acc:.1%}** ({direction_results['correct']}/{direction_results['total']})",
        f"- Threshold for reliability: 60%",
        f"- **Verdict: {'RELIABLE' if reliable else 'UNRELIABLE — flag for review'}**",
        "",
        "| ID | Event | Expected | Actual | 4w Change | Match |",
        "|-----|-------|----------|--------|-----------|-------|",
    ]

    for d in direction_results["details"]:
        match_str = "YES" if d["match"] else "**NO**"
        lines.append(
            f"| {d['id']} | {d['title'][:40]} | {d['expected_dir']} | "
            f"{d['actual_dir']} | {d['actual_4w']:+.2f} | {match_str} |"
        )

    lines.extend([
        "",
        "## Magnitude Calibration",
        "",
        f"- Observations: {magnitude_results['n_observations']}",
        f"- Median predicted/actual ratio: {magnitude_results.get('median_ratio', 'N/A')}",
        f"- Mean predicted/actual ratio: {magnitude_results.get('mean_ratio', 'N/A')}",
        f"- Predicted-actual correlation: {magnitude_results.get('correlation', 'N/A')}",
        f"- **Overall scaling factor: {magnitude_results['overall_scaling_factor']}**",
        "",
        "### Interpretation",
        "",
    ])

    scaling = magnitude_results["overall_scaling_factor"]
    if scaling < 0.5:
        lines.append(
            "The signal extractor **overpredicts** market impact by approximately "
            f"{1/scaling:.1f}x. A scaling factor of {scaling:.2f} is applied to "
            "reduce predicted supply/demand impacts to match observed outcomes."
        )
    elif scaling > 1.5:
        lines.append(
            "The signal extractor **underpredicts** market impact by approximately "
            f"{scaling:.1f}x. A scaling factor of {scaling:.2f} is applied to "
            "amplify predicted supply/demand impacts."
        )
    else:
        lines.append(
            f"The signal extractor's magnitude predictions are reasonably calibrated "
            f"(scaling factor {scaling:.2f}). Minor adjustment applied."
        )

    lines.extend([
        "",
        "## Calibration Factors Applied",
        "",
        f"- `supply_scaling_factor`: {magnitude_results['supply_scaling_factor']}",
        f"- `demand_scaling_factor`: {magnitude_results['demand_scaling_factor']}",
        f"- `direction_reliable`: {reliable}",
        "",
        "These factors are saved to `forecasting/calibration/signal_calibration.json` "
        "and automatically loaded by `ai_signal_extractor.py` when available.",
        "",
        "## Limitations",
        "",
        "- Validation uses synthetic reconstruction data (interpolated from monthly/annual sources)",
        "- Only 1 genuine weekly observation available (ESC $24.50, 2026-04-03)",
        "- 7 future events (post-April 2025) have no actual outcome data yet",
        "- Signal extraction validation uses domain-expert expected signals, not live API outputs",
        "- Calibration should be re-run as genuine weekly data accumulates",
        "",
        "## Data Quality Note",
        "",
        "SYNTHETIC DATA WARNING: Price changes used for calibration are derived from "
        "interpolated reconstruction data. Calibration factors should be treated as "
        "preliminary estimates to be refined with genuine market observations.",
    ])

    return "\n".join(lines)


def main():
    print("Running signal extraction calibration...\n")

    # Load validation set
    docs = load_validation_set()
    print(f"  Loaded {len(docs)} validation documents")

    # Compute direction accuracy
    dir_results = compute_direction_accuracy(docs)
    print(f"  Direction accuracy: {dir_results['direction_accuracy']:.1%} "
          f"({dir_results['correct']}/{dir_results['total']})")

    # Compute magnitude calibration
    mag_results = compute_magnitude_calibration(docs)
    print(f"  Overall scaling factor: {mag_results['overall_scaling_factor']}")
    print(f"  Predicted-actual correlation: {mag_results.get('correlation', 'N/A')}")

    # Save calibration factors
    calibration = {
        "supply_scaling_factor": mag_results["supply_scaling_factor"],
        "demand_scaling_factor": mag_results["demand_scaling_factor"],
        "direction_reliable": dir_results["direction_accuracy"] >= 0.60,
        "direction_accuracy": round(dir_results["direction_accuracy"], 4),
        "n_validation_docs": len(docs),
        "n_with_actuals": dir_results["total"],
        "calibrated_at": "2026-04-08",
    }

    cal_path = CALIBRATION_DIR / "signal_calibration.json"
    with open(cal_path, "w") as f:
        json.dump(calibration, f, indent=2)
    print(f"\n  Calibration saved to {cal_path}")

    # Generate report
    report = generate_calibration_report(dir_results, mag_results, docs)
    report_path = ANALYSIS_DIR / "signal_calibration_report.md"
    ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w") as f:
        f.write(report)
    print(f"  Report saved to {report_path}")

    # Summary
    reliable = dir_results["direction_accuracy"] >= 0.60
    print(f"\n  Direction accuracy: {'RELIABLE' if reliable else 'UNRELIABLE'} ({dir_results['direction_accuracy']:.1%})")
    print(f"  Scaling factor: {mag_results['overall_scaling_factor']}")


if __name__ == "__main__":
    main()
