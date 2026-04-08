# Session A: Audit Remediation and Statistical Foundation

**Prerequisites:** TASK_LOG shows improvement programme complete
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` or `TASK_LOG.md` for model context. Only re-read files you are modifying.

---

You are working on the WREI Trading Platform forecasting system.
Read context:
  cat TASK_LOG.md
  cat forecasting/analysis/REGRESSION_REPORT.md

This session addresses audit remediation and statistical foundation.
Complete ALL tasks. Do not stop and ask for confirmation.

TASK 1: PERSIST MISSING ANALYSIS ARTEFACTS

1a. Run the forecast pipeline or call the specific methods that generate:
    - forecasting/analysis/feature_independence_report.json
    - forecasting/analysis/ensemble_weight_history.json
    If the methods exist but were never called with output persistence,
    call them and write the output. If they need to be written, write them.
    Verify both files exist on disk after completion.

1b. In ensemble_forecast.py, modify generate_forward_curve() so that when
    called without explicit current_price, it loads the latest observation's
    spot price from data_assembly rather than using a hardcoded default.
    Add a log warning if current_price equals the balanced regime mu
    (indicating no market signal in the forecast).

1c. In ou_bounded.py, find the inline self-test using penalty = 29.48
    (approximately line 289). Replace with the current year's rate loaded
    from forecasting/reference_data/penalty_rates.json.

TASK 2: STATISTICAL SIGNIFICANCE TESTING

2a. Install scipy if not present: pip install scipy --break-system-packages

2b. In forecasting/backtesting/backtest_engine.py, add:
    - Binomial test: p-value for observed directional accuracy vs 50% null.
      Use scipy.stats.binomtest (or binom_test for older scipy).
    - Diebold-Mariano test: compare ensemble forecast errors vs naive model
      errors. Implement the standard DM test (two-sided, squared error loss).
    Add both to ModelScorecard output as directional_accuracy_pvalue and
    dm_statistic / dm_pvalue fields.

2c. Run both tests against the current synthetic backtest data.
    Write results to forecasting/analysis/statistical_significance.json:
    {
      "directional_accuracy": {"observed": X, "n": X, "pvalue": X},
      "diebold_mariano": {"statistic": X, "pvalue": X, "interpretation": "..."}
    }

TASK 3: ENSEMBLE WEIGHT INVESTIGATION

3a. Read forecasting/analysis/ensemble_weight_history.json (created in 1a).
    Determine: what does the Bayesian weight converge to? Is it near 0,
    near 1, or in the middle?

3b. If weight is consistently above 0.85 or below 0.15 across retraining
    windows, add a constraint clamping weights to [0.2, 0.8] range in
    ensemble_forecast.py. Re-run the ensemble backtest with the constraint.
    Report MAPE impact.

3c. Write findings to forecasting/analysis/ensemble_weight_investigation.md
    with the heading "Ensemble Weight Analysis" and a clear verdict:
    "The ensemble is [genuinely multi-model / effectively single-model]"
    with supporting data.

VERIFICATION:
  cd forecasting && python -m pytest --tb=short -q
  ls -la forecasting/analysis/feature_independence_report.json
  ls -la forecasting/analysis/ensemble_weight_history.json
  ls -la forecasting/analysis/statistical_significance.json
  ls -la forecasting/analysis/ensemble_weight_investigation.md
  npm run build 2>&1 | tail -3
  npx tsc --noEmit 2>&1 | tail -3

COMMIT:
  git add -A && git commit -m "Audit remediation + statistical foundation"
  Update TASK_LOG.md. Next: Session B (Historical backfill).
