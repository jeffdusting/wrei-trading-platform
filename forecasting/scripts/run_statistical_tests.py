#!/usr/bin/env python3
"""
Run statistical significance tests on the backtest data and write results.
"""

import json
import sys
from pathlib import Path

project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import numpy as np

from forecasting.backtesting.backtest_engine import (
    BacktestEngine,
    binomial_test_directional_accuracy,
    diebold_mariano_test,
    generate_scorecard,
    FLAT_THRESHOLD,
)


def main() -> None:
    print("Running statistical significance tests...\n")

    engine = BacktestEngine()
    result = engine.run(start_week=52, model_version="2.0.0")

    # Directional accuracy at 4w horizon
    correct = 0
    total = 0
    forecast_errors = []
    naive_errors = []

    for rec in result.forecast_records:
        actual = rec.actuals.get(4)
        if actual is None:
            continue

        current = rec.current_price
        forecast_price = rec.forecasts[4]

        # Directional accuracy
        actual_dir = actual - current
        forecast_dir = forecast_price - current
        actual_label = "flat" if abs(actual_dir) < FLAT_THRESHOLD else ("up" if actual_dir > 0 else "down")
        forecast_label = "flat" if abs(forecast_dir) < FLAT_THRESHOLD else ("up" if forecast_dir > 0 else "down")

        if actual_label == forecast_label:
            correct += 1
        total += 1

        # Errors for DM test
        forecast_errors.append(forecast_price - actual)
        naive_errors.append(current - actual)

    # Run tests
    binom = binomial_test_directional_accuracy(correct, total)
    dm = diebold_mariano_test(np.array(forecast_errors), np.array(naive_errors))

    output = {
        "directional_accuracy": binom,
        "diebold_mariano": dm,
    }

    print(f"Directional accuracy: {binom['observed']:.4f} (n={binom['n']}, p={binom['pvalue']:.6f})")
    print(f"Diebold-Mariano: stat={dm['statistic']}, p={dm['pvalue']}")
    print(f"  Interpretation: {dm['interpretation']}")

    out_path = Path(__file__).parent.parent / "analysis" / "statistical_significance.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\nWritten to {out_path}")


if __name__ == "__main__":
    main()
