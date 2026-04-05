#!/usr/bin/env python3
"""
Run the WREI ESC forecasting model backtest.

Usage:
    python3 forecasting/backtesting/run_backtest.py

Outputs:
  - JSON results to forecasting/backtesting/results.json
  - Human-readable report to stdout
  - Optionally stores results in the backtest_results DB table
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Ensure the project root is on the path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from forecasting.backtesting.backtest_engine import (
    BacktestEngine,
    format_report,
    result_to_dict,
)


def store_to_database(result_dict: dict) -> bool:
    """Attempt to store backtest results in the DB. Returns True on success."""
    try:
        import psycopg2

        db_url = os.environ.get("DATABASE_URL")
        if not db_url:
            return False

        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        model_version = result_dict["model_version"]
        period = result_dict["test_period"]

        for horizon_key, metrics in result_dict["overall"].items():
            horizon_weeks = int(horizon_key.replace("w", ""))
            cur.execute(
                """
                INSERT INTO backtest_results
                    (model_version, test_period_start, test_period_end,
                     horizon_weeks, mape, directional_accuracy, decision_value,
                     coverage_80, coverage_95,
                     benchmark_mape_naive, benchmark_mape_sma, metadata)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    model_version,
                    period["start"],
                    period["end"],
                    horizon_weeks,
                    metrics["mape"],
                    metrics["directional_accuracy"],
                    metrics["decision_value"],
                    metrics["coverage_80"],
                    metrics["coverage_95"],
                    metrics["benchmarks"]["mape_naive"],
                    metrics["benchmarks"]["mape_sma4"],
                    json.dumps(metrics),
                ),
            )

        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception:
        return False


def main() -> None:
    print("Loading historical data and running walk-forward backtest...")
    print("(This trains the model at each step — may take a few minutes)\n")

    engine = BacktestEngine()
    result = engine.run(start_week=52, model_version="1.0.0")

    # Print human-readable report
    report = format_report(result)
    print(report)

    # Save JSON results
    result_dict = result_to_dict(result)
    output_path = Path(__file__).parent / "results.json"
    with open(output_path, "w") as f:
        json.dump(result_dict, f, indent=2)
    print(f"\nJSON results saved to: {output_path}")

    # Attempt DB storage
    if store_to_database(result_dict):
        print("Results stored in backtest_results table.")
    else:
        print("DB storage skipped (no DATABASE_URL or table not available).")

    # Validation summary
    print("\n--- Validation Criteria ---")
    m4 = result.overall_metrics.get(4)
    if m4:
        mape_ok = m4.mape < 0.10
        dir_ok = m4.directional_accuracy > 0.50
        value_ok = m4.decision_value > 0
        cov_ok = m4.coverage_80 > 0.60

        print(f"  4w MAPE < 10%:         {'PASS' if mape_ok else 'FAIL'} ({m4.mape*100:.2f}%)")
        print(f"  4w Dir. accuracy > 50%: {'PASS' if dir_ok else 'FAIL'} ({m4.directional_accuracy*100:.1f}%)")
        print(f"  4w Decision value > 0:  {'PASS' if value_ok else 'FAIL'} (${m4.decision_value:,.0f})")
        print(f"  80% coverage > 60%:    {'PASS' if cov_ok else 'FAIL'} ({m4.coverage_80*100:.1f}%)")

        if mape_ok and dir_ok and cov_ok:
            print("\n  All key criteria PASSED.")
        else:
            print("\n  Some criteria need attention — consider parameter tuning.")


if __name__ == "__main__":
    main()
