#!/usr/bin/env python3
"""
Run the WREI ESC forecasting model backtest.

Usage:
    python3 forecasting/backtesting/run_backtest.py           # Bayesian-only
    python3 forecasting/backtesting/run_backtest.py --full     # All models comparison

Outputs:
  - JSON results to forecasting/backtesting/results.json
  - Human-readable report to stdout
  - Optionally stores results in the backtest_results DB table
"""

from __future__ import annotations

import argparse
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
    run_comparative_backtest,
    format_comparative_report,
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


def run_bayesian_only() -> None:
    """Run Bayesian-only backtest (original P10-B behaviour)."""
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


def run_full_comparison() -> None:
    """Run comparative backtest across all model variants."""
    print("Running full comparative backtest (Bayesian + ML + Ensemble)...")
    print("(This may take several minutes)\n")

    comp = run_comparative_backtest(start_week=52)

    # Print comparative report
    report = format_comparative_report(comp)
    print(report)

    # Save comprehensive results
    bayesian_dict = result_to_dict(comp["bayesian"])
    full_results = {
        "bayesian": bayesian_dict,
        "ml": comp["ml_eval"],
        "ensemble": comp["ensemble_eval"],
        "ml_regime": comp["ml_regime"],
    }
    output_path = Path(__file__).parent / "results.json"
    with open(output_path, "w") as f:
        json.dump(full_results, f, indent=2, default=str)
    print(f"\nJSON results saved to: {output_path}")

    # Validation summary
    print("\n--- P10-C Validation Criteria ---")
    ens = comp["ensemble_eval"]
    ml = comp["ml_eval"]
    b4 = comp["bayesian"].overall_metrics.get(4)

    if b4:
        bay_mape = b4.mape
        ml_mape = ml["price_mape"]
        ens_mape = ens["ensemble_mape_4w"]
        ens_beats = ens_mape <= bay_mape and ens_mape <= ml_mape
        print(f"  1. Ensemble beats both at 4w:  {'PASS' if ens_beats else 'FAIL'} "
              f"(Ens={ens_mape*100:.2f}%, Bay={bay_mape*100:.2f}%, ML={ml_mape*100:.2f}%)")

    action_acc = ml["action_accuracy"]
    action_ok = action_acc > 0.55
    print(f"  2. Action accuracy > 55%:     {'PASS' if action_ok else 'FAIL'} ({action_acc*100:.1f}%)")

    # Check feature importance rankings
    fi_report = comp["feature_importance_report"]
    has_key_features = ("creation_velocity_trend" in fi_report or
                        "surplus_runway" in fi_report or
                        "policy_supply_impact" in fi_report or
                        "broker_sentiment" in fi_report)
    print(f"  3. Key features rank highly:   {'PASS' if has_key_features else 'FAIL'}")

    if b4:
        bay_dv = b4.decision_value
        print(f"  4. Bayesian decision value > 0: {'PASS' if bay_dv > 0 else 'FAIL'} (${bay_dv:,.0f})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run WREI ESC backtest")
    parser.add_argument("--full", action="store_true",
                        help="Run full comparative backtest (Bayesian + ML + Ensemble)")
    args = parser.parse_args()

    if args.full:
        run_full_comparison()
    else:
        run_bayesian_only()


if __name__ == "__main__":
    main()
