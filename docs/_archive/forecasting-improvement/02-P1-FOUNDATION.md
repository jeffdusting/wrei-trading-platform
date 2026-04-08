# Phase 1: Data Integrity and Foundation

**Prerequisites:** Phase 0 discovery summary confirmed by operator.
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` — do NOT re-read source files unless modifying them.

---

## PHASE 1: DATA INTEGRITY AND FOUNDATION (Defect Remediation)

**Objective:** Fix data integrity issues that compromise model training quality before any new features are added.

**Do not proceed to Phase 2 until all Phase 1 tasks pass verification.**

### P1.1. Penalty Rate Reconciliation

The ESS penalty rate is CPI-adjusted annually from a base rate, as confirmed by IPART: "The Scheme Penalty Rate for each scheme is adjusted annually for movement in the Consumer Price Index." The actual gazetted rates per compliance year are published in IPART's "Relevant information for scheme participants" spreadsheet.

The current specification shows historical rates rising from A$28.52 (2019) to A$36.20 (2025), then uses A$29.48 for 2026. The historical rising series may be correct (CPI-adjusted), but the 2026 value of A$29.48 dropping from A$36.20 is internally inconsistent under CPI adjustment and is almost certainly wrong.

Separately, the VEEC penalty rate in the specification is listed as A$120.00, which is incorrect. The Essential Services Commission confirmed the VEEC shortfall penalty for 2024 is A$90.00 per certificate, and the Victorian Government has announced an increase to A$100.00 for 2026 onwards.

**Action:**

1. Read the penalty rate values currently in `data_assembly.py` and list them by year.

2. Download the authoritative IPART penalty rate data. Attempt to fetch the "Relevant information for scheme participants" spreadsheet from the IPART Energy Sustainability Schemes website:
   - Try: `https://www.energysustainabilityschemes.nsw.gov.au/key-information-scheme-participants`
   - Look for a downloadable spreadsheet link containing "Relevant information for scheme participants"
   - If the spreadsheet is accessible, extract the "scheme penalty rate" column for each ESS compliance year 2019–2026
   - If the spreadsheet is not directly accessible, use the IPART Annual Reports to the Minister (published on the same site) which list the penalty rate for each compliance year

3. Create a new file `forecasting/reference_data/penalty_rates.json` with the following structure. **You must populate the ESC rates from the IPART source data in step 2.** If you cannot access the IPART spreadsheet, use the rates currently in the codebase for 2019–2025 (these are likely the correct CPI-adjusted values) but flag the 2026 rate for manual verification:

```json
{
  "esc": {
    "source": "IPART Relevant Information for Scheme Participants spreadsheet / Annual Reports to the Minister",
    "note": "ESS penalty rate per certificate, CPI-adjusted annually from base rate under clause 15 of Schedule 4A to the Electricity Supply Act 1995 (NSW)",
    "base_penalty_rate_2009": 24.50,
    "rates": {
      "2019": "POPULATE_FROM_IPART_SOURCE",
      "2020": "POPULATE_FROM_IPART_SOURCE",
      "2021": "POPULATE_FROM_IPART_SOURCE",
      "2022": "POPULATE_FROM_IPART_SOURCE",
      "2023": "POPULATE_FROM_IPART_SOURCE",
      "2024": "POPULATE_FROM_IPART_SOURCE",
      "2025": "POPULATE_FROM_IPART_SOURCE",
      "2026": "POPULATE_FROM_IPART_SOURCE — FLAG IF NOT FOUND"
    },
    "verification_status": "IPART_SOURCED or REQUIRES_MANUAL_VERIFICATION"
  },
  "veec": {
    "source": "Essential Services Commission of Victoria / Victorian Energy Efficiency Target Regulations 2018",
    "note": "VEEC shortfall penalty per certificate under the Victorian Energy Upgrades program",
    "rates": {
      "2024": 90.00,
      "2025": 90.00,
      "2026": 100.00
    },
    "verification_status": "VERIFIED — ESC confirmed $90 for 2024, Victorian Government confirmed $100 for 2026"
  }
}
```

4. Update `data_assembly.py` to load penalty rates from this JSON file rather than hardcoding them.
5. Recalculate the `price_to_penalty_ratio` feature for all historical observations using the sourced rates.
6. Update the `PENALTY_CEILINGS` constant (or equivalent) used in the OU model reflecting boundary and chart display to use the correct VEEC ceiling of A$100.00 (not A$120.00).
7. Verify: Run `python -c "from forecasting.data_assembly import *; print('Penalty rates loaded successfully')"` and confirm no errors.
8. **Report the final penalty rate values used in the discovery summary output** so they can be manually verified against IPART records if the spreadsheet was not directly accessible.

**File citations required:** `forecasting/data_assembly.py` (lines modified), `forecasting/reference_data/penalty_rates.json` (new file).

### P1.0. Test Infrastructure Setup

Phase 0 discovered that pytest is not installed, no test directory exists, and there is zero test coverage. This must be established before any model changes.

**Action:**

1. Install pytest: `pip install pytest --break-system-packages`
2. Create the test directory structure:
   ```
   forecasting/tests/__init__.py
   forecasting/tests/test_data_assembly.py
   forecasting/tests/test_models.py
   forecasting/tests/conftest.py
   ```
3. In `conftest.py`, create shared fixtures: a minimal assembled dataset (10 rows), a mock penalty rates JSON, and a mock scraped document.
4. In `test_data_assembly.py`, write at minimum:
   - Test that `assemble_dataset()` returns a DataFrame with required columns
   - Test that penalty rates load from JSON reference
   - Test that `price_to_penalty_ratio` is computed correctly
5. In `test_models.py`, write at minimum:
   - Test that each model class can be instantiated without error
   - Test that the ensemble combiner produces output with required fields
6. Verify: `cd forecasting && python -m pytest --tb=short -q` passes with all tests green.

**File citations required:** All new test files.

### P1.2. Training Data Quality Flagging

Phase 0 discovered that ALL training data is synthetic — weekly prices are interpolated from monthly or annual source data throughout the entire 2019–2025 range. There are no genuine weekly observations in the current dataset.

This means the backtesting metrics in the specification (3.6% MAPE, 62% directional accuracy, A$142,680 decision value) were computed against interpolated data, not real market observations. These metrics measure how well the model predicts its own interpolation, which is a circular validation.

**Action:**

1. In `data_assembly.py`, add a `data_quality` column to the assembled dataset. Mark ALL current observations as `synthetic_weekly` with a sub-classification:
   - `synthetic_annual` — interpolated from annual aggregates (likely 2019–2021)
   - `synthetic_monthly` — interpolated from monthly data (if any period uses this)
   - `synthetic_quarterly` — interpolated from quarterly data (if any period uses this)
   Inspect the actual interpolation logic in the code to determine which sub-classification applies to each period.

2. Add a `data_quality_note` field to the ensemble forecast output: `"Trained on interpolated data only. Backtesting metrics reflect synthetic validation. Genuine weekly observation accumulation begins when live scrapers are operational."`

3. In `backtest_engine.py`, add a prominent caveat to all backtest output:
   ```python
   BACKTEST_CAVEAT = (
       "SYNTHETIC DATA WARNING: All training and validation data is interpolated "
       "from monthly/annual sources. Reported metrics (MAPE, directional accuracy, "
       "decision value) have not been validated against genuine weekly market observations. "
       "Treat as indicative of model structure quality, not predictive accuracy."
   )
   ```

4. In `data_assembly.py`, add a method `get_genuine_observation_count() -> int` that returns the count of non-synthetic rows. This will return 0 now but will increase as the scrapers accumulate real weekly data. Log this count each time the pipeline runs.

5. In `counterfactual_model.py`, add infrastructure for sample weighting by data quality (genuine=1.0, synthetic=0.5) but set all weights to 0.5 for now since all data is synthetic. When genuine observations arrive, the weighting will activate automatically.

**File citations required:** `forecasting/data_assembly.py`, `forecasting/models/counterfactual_model.py`, `forecasting/models/ensemble_forecast.py`, `forecasting/backtesting/backtest_engine.py`.

### P1.3. XGBoost Feature Independence

The XGBoost model currently uses `kalman_forecast_4w` and `kalman_forecast_12w` as input features. The ensemble then combines XGBoost and Bayesian outputs. This creates circular dependency — XGBoost partially learns to weight the Kalman output, inflating apparent model complementarity.

**Action:**

1. In `counterfactual_model.py`, create two feature set configurations:
   - `FEATURES_FULL` — the current 36-feature set including Kalman forecasts
   - `FEATURES_INDEPENDENT` — the feature set excluding `kalman_forecast_4w` and `kalman_forecast_12w` (34 features)

2. Add a configuration parameter `use_independent_features: bool = True` (default True) that selects the feature set.

3. Run both configurations through the backtest engine and log the comparative results. If removing Kalman features degrades ensemble MAPE by less than 0.5 percentage points, set `use_independent_features = True` as the production default.

4. Log the comparison in a new file `forecasting/analysis/feature_independence_report.json`.

**File citations required:** `forecasting/models/counterfactual_model.py`.

### P1.4. Regime Detection Lag Reduction

The HMM transition matrix has self-transition probabilities of 0.90–0.92, causing 2–4 week regime detection lag.

**Action:**

1. In `state_space.py`, locate the HMM transition matrix.
2. Create a configurable transition matrix with two presets:
   - `TRANSITION_CONSERVATIVE` — current values (0.90–0.92 self-transition)
   - `TRANSITION_RESPONSIVE` — reduced self-transition (0.85–0.88), with the freed probability distributed proportionally to adjacent regime transitions
3. Default to `TRANSITION_RESPONSIVE`.
4. Add a method `override_regime_probability(regime: str, probability: float, source: str)` that allows external callers (the enhanced signal extractor in Phase 2) to force-update the regime indicator when a high-confidence policy event is detected. This method should:
   - Validate that probability is in [0, 1]
   - Log the override to the anomaly detector's alert system
   - Apply the override as a direct adjustment to the state vector's `regime_indicator`

**File citations required:** `forecasting/models/state_space.py`.

### P1.5. Backtesting Metric Reframe

The current backtesting output reports MAPE as the primary metric, but the naive random walk outperforms the ensemble on MAPE (2.0% vs 3.6%). The ensemble's value is in directional accuracy and decision value — these should be the primary reported metrics.

**Action:**

1. In `backtest_engine.py`, restructure the output to produce a unified scorecard per model:

```python
@dataclass
class ModelScorecard:
    model_name: str
    mape_4w: float
    directional_accuracy: float       # PRIMARY — percentage correct up/down
    cumulative_decision_value: float   # PRIMARY — dollar value of following signals
    sharpe_ratio: float               # risk-adjusted signal returns
    max_drawdown: float               # worst peak-to-trough of signal strategy
    win_rate: float                   # percentage of trades with positive value
    avg_win_value: float              # average dollar value of winning trades
    avg_loss_value: float             # average dollar value of losing trades
    regime_accuracy: dict             # per-regime performance breakdown
```

2. Ensure the naive model (random walk) and SMA-4 benchmarks are computed with the full scorecard — especially directional accuracy and decision value, which will be poor and provide the right comparison context.

3. Add a `generate_scorecard_comparison()` method that outputs a formatted comparison table showing all models side by side.

4. Add per-data-quality reporting as specified in P1.2.

**File citations required:** `forecasting/backtesting/backtest_engine.py`.

### PHASE 1 GATE VERIFICATION

Run the following checks before proceeding to Phase 2:

```bash
# 0. Verify pytest installed and test infrastructure exists
python -m pytest --version
python -c "
import os
assert os.path.exists('forecasting/tests/__init__.py'), 'Missing tests/__init__.py'
assert os.path.exists('forecasting/tests/conftest.py'), 'Missing conftest.py'
print('PASS: Test infrastructure exists')
"

# 1. Verify penalty rates are loaded from JSON reference
python -c "
from forecasting.data_assembly import assemble_dataset
df = assemble_dataset()
rates = df[['year', 'penalty_rate']].drop_duplicates().sort_values('year')
print('Penalty rates by year:')
for _, row in rates.iterrows():
    print(f'  {int(row.year)}: A\${row.penalty_rate:.2f}')
assert df['penalty_rate'].notna().all(), 'Missing penalty rates'
print('PASS: Penalty rates loaded from JSON reference')
"

# 2. Verify data quality column and synthetic caveat
python -c "
from forecasting.data_assembly import assemble_dataset, get_genuine_observation_count
df = assemble_dataset()
assert 'data_quality' in df.columns, 'Missing data_quality column'
genuine = get_genuine_observation_count()
print(f'Genuine observations: {genuine} (expected 0 for current dataset)')
print(f'Total observations: {len(df)} (all synthetic)')
print('PASS: Data quality flagging verified')
"

# 3. Verify XGBoost independent features configuration
python -c "
from forecasting.models.counterfactual_model import FEATURES_INDEPENDENT
assert 'kalman_forecast_4w' not in FEATURES_INDEPENDENT
assert 'kalman_forecast_12w' not in FEATURES_INDEPENDENT
print(f'Independent feature count: {len(FEATURES_INDEPENDENT)}')
print('PASS: Feature independence verified')
"

# 4. Verify responsive transition matrix
python -c "
from forecasting.models.state_space import TRANSITION_RESPONSIVE
for i in range(3):
    assert TRANSITION_RESPONSIVE[i][i] <= 0.88, f'Self-transition too high: {TRANSITION_RESPONSIVE[i][i]}'
print('PASS: Responsive transition matrix verified')
"

# 5. Verify backtesting scorecard structure
python -c "
from forecasting.backtesting.backtest_engine import ModelScorecard
s = ModelScorecard.__dataclass_fields__
required = ['directional_accuracy', 'cumulative_decision_value', 'sharpe_ratio', 'max_drawdown']
for f in required:
    assert f in s, f'Missing scorecard field: {f}'
print('PASS: Scorecard structure verified')
"

# 6. Run full test suite
cd forecasting && python -m pytest --tb=short -q
```

**Archive point:** `git add -A && git commit -m "P1: Data integrity and foundation fixes" && git tag forecasting-p1-foundation`

---

## Phase 1 Completion

Update TASK_LOG.md:

```markdown
## Forecasting Model Improvement — Phase 1 (Foundation)
**Date:** [timestamp]
**Status:** COMPLETE / PARTIAL / BLOCKED
**Git Tag:** forecasting-p1-foundation

### Tasks Completed
- [List with file citations]

### Penalty Rates Used
- [List year:rate pairs — CRITICAL for operator verification]

### Tests Run
- [Pass/fail summary from gate verification]

### Known Issues
- [Any issues discovered during implementation]

### Next Phase
- Read `docs/forecasting-improvement/03-P2A-SCRAPERS.md`
- Prerequisites: All 7 gate checks pass (0 through 6)
```
