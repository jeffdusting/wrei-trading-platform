# Phase 4: Regression Testing

**Prerequisites:** Phase 3 gate verification — all 5 checks pass.
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` — do NOT re-read source files unless modifying them. Read only the specific files you are modifying.

---

## PHASE 4: REGRESSION TESTING AGAINST HISTORICAL DATA

**Objective:** Run the complete improved forecasting system against the historical reference dataset and verify that improvements have not degraded existing performance. Produce a comprehensive comparison report.

**CRITICAL CAVEAT: All backtesting runs against synthetic (interpolated) training data. No genuine weekly market observations exist in the current dataset. The regression report must state this prominently. Metrics are indicative of model structure quality relative to baseline, not predictive accuracy against real market data.**

### P4.1. Regression Test Suite

Create `forecasting/tests/test_regression.py`:

**Test categories:**

1. **Baseline reproduction.** Run the original model configuration (conservative HMM, full feature set, no signal features, simple interpolation) against the 2019–2025 synthetic data. Record MAPE, directional accuracy, and decision value. These are the baseline numbers — the improved model must not degrade directional accuracy or decision value on the same synthetic dataset.

2. **Improved model comparison.** Run the improved model configuration (responsive HMM, independent features, signal features zero-filled for historical period, forward curve, corrected penalty rates) against the same synthetic data. Record the full ModelScorecard.

3. **Penalty rate impact test.** Compare the model's output at 5 randomly selected historical dates using (a) the old CPI-estimated penalty rates and (b) the corrected IPART rates. Document the forecast difference at each date.

4. **Feature independence test.** Compare ensemble performance with and without Kalman forecast features in the XGBoost model. Record the MAPE difference.

5. **Regime detection test.** Identify the known regime transitions in the historical data (periods where price moved >A$2.00 in 12 weeks). Measure how many weeks earlier the responsive HMM detects these transitions compared to the conservative HMM.

6. **Volume forecast accuracy.** Compare the volume forecast model's 4-week-ahead creation volume predictions against actual 2024–2025 IPART creation data. Report MAPE on volume.

7. **Forward curve vs interpolation.** At 10 randomly selected historical dates, compare the forward curve's 26-week forecast shape against the linear interpolation approach. Report the maximum divergence at any weekly point.

8. **Signal pipeline integration test.** Create 5 synthetic test documents (one per event category) with known expected signal outputs. Run them through the full ingestion pipeline and signal extractor. Verify the output schema is correct and the signals propagate to the XGBoost feature set.

9. **End-to-end pipeline test.** Run the complete `generate_forecast.py` pipeline (with scrapers in mock mode returning cached test data) and verify:
   - Pipeline completes without error
   - Forecast output contains all required fields
   - All CI bands respect the penalty ceiling cap
   - Anomaly detector runs and produces valid output
   - Results are written to SQLite storage

### P4.2. Regression Report

After running all regression tests, generate `forecasting/analysis/REGRESSION_REPORT.md` with the following structure:

```markdown
# Forecasting Model Regression Report
## Date: [timestamp]
## Model Version: 2.0.0

### ⚠️ SYNTHETIC DATA NOTICE
All training, validation, and backtesting data in this report is interpolated from monthly/annual sources. No genuine weekly market observations were available. Metrics reflect model structure quality relative to baseline — NOT predictive accuracy against real market data. Genuine validation will be possible once live scrapers have accumulated 12+ weeks of weekly observations.

### 1. Baseline vs Improved Model Comparison

| Metric | Baseline (v1.0) | Improved (v2.0) | Change |
|--------|-----------------|-----------------|--------|
| MAPE (4w, genuine data) | X.X% | X.X% | ±X.X% |
| Directional Accuracy | X.X% | X.X% | ±X.X% |
| Cumulative Decision Value | A$X,XXX | A$X,XXX | ±A$X,XXX |
| Sharpe Ratio | X.XX | X.XX | ±X.XX |
| Max Drawdown | A$X,XXX | A$X,XXX | ±A$X,XXX |

### 2. Penalty Rate Correction Impact
[Table of forecast differences at 5 test dates]

### 3. Feature Independence Analysis
[MAPE with/without Kalman features]

### 4. Regime Detection Improvement
[Weeks of earlier detection at each historical transition]

### 5. Volume Forecast Accuracy
[MAPE on 4-week creation volume predictions]

### 6. Forward Curve Quality
[Maximum divergence from interpolation at 10 test dates]

### 7. Signal Pipeline Integration
[5 synthetic document test results — pass/fail per document]

### 8. End-to-End Pipeline
[Pipeline completion status, output validation results]

### 9. Regression Verdict
PASS: Improved model does not degrade directional accuracy or decision value
  — OR —
FAIL: [specific metric that degraded and by how much]
```

### P4.3. Acceptance Criteria

The regression test **passes** if ALL of the following are true:

1. Directional accuracy on synthetic 2019–2025 data is equal to or better than baseline
2. Cumulative decision value on synthetic 2019–2025 data is equal to or better than baseline
3. All CI bands respect the penalty ceiling cap (ESC penalty rate per year from IPART source, A$100.00 for VEEC 2026)
4. The end-to-end pipeline completes without error in mock mode
5. All 5 synthetic signal documents produce correctly structured output
6. No Python import errors across the entire `forecasting/` module tree
7. All existing tests continue to pass

The regression test **warns** (does not block, but flags for review) if:

1. MAPE increases by more than 0.5 percentage points
2. Ensemble weight consistently converges to within 0.1 of 0.0 or 1.0
3. Shadow market cross-validation shows divergence

### PHASE 4 GATE VERIFICATION

```bash
# Run the full regression test suite
cd forecasting && python -m pytest tests/test_regression.py -v --tb=long 2>&1 | tee regression_output.txt

# Verify regression report was generated
cat forecasting/analysis/REGRESSION_REPORT.md

# Verify no import errors across the module tree
python -c "
import importlib, pkgutil, forecasting
for importer, modname, ispkg in pkgutil.walk_packages(forecasting.__path__, prefix='forecasting.'):
    try:
        importlib.import_module(modname)
    except Exception as e:
        print(f'FAIL: {modname} — {e}')
        exit(1)
print('PASS: All modules import cleanly')
"

# Final build verification (TypeScript side unaffected)
npm run build 2>&1 | tail -5
npx tsc --noEmit 2>&1 | tail -5
npm test -- --passWithNoTests 2>&1 | tail -10
```

**Archive point:** `git add -A && git commit -m "P4: Regression testing complete — see REGRESSION_REPORT.md" && git tag forecasting-v2.0.0`

---

## Phase 4 Completion

Update TASK_LOG.md:

```markdown
## Forecasting Model Improvement — Phase 4 (Regression)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** forecasting-v2.0.0

### Regression Verdict
- [PASS or FAIL with details]

### Key Metrics
- Directional accuracy: [baseline] → [improved]
- Decision value: [baseline] → [improved]
- MAPE (genuine data): [baseline] → [improved]

### Completion Checklist
- [ ] P1 gate passed
- [ ] P2-A gate passed
- [ ] P2-B gate passed
- [ ] P2-C gate passed
- [ ] P2-D gate passed
- [ ] P3 gate passed
- [ ] P4 regression report shows PASS
- [ ] All Python modules import cleanly
- [ ] TypeScript build passes
- [ ] REGRESSION_REPORT.md generated
- [ ] Tagged forecasting-v2.0.0
```

## Programme Complete

The forecasting model improvement programme is complete. The regression report at `forecasting/analysis/REGRESSION_REPORT.md` documents the full comparison.
