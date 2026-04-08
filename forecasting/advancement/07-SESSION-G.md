# Session G: Genuine Data Acquisition and Definitive Model Verification

**Prerequisites:** Session F committed. `FORECAST_IMPROVEMENT_ROADMAP.md` exists.
**Context:** Read `TASK_LOG.md` and `forecasting/analysis/FORECAST_IMPROVEMENT_ROADMAP.md`.
**Critical context:** Session B's backfill produced only 1 genuine observation because Ecovantage and NMG sites require JavaScript rendering. This session fixes that.

---

You are working on the WREI Trading Platform forecasting system.
Read context:
  cat TASK_LOG.md
  cat forecasting/analysis/FORECAST_IMPROVEMENT_ROADMAP.md

This session solves the genuine data acquisition problem that has blocked
model validation since Session B, then runs the definitive forecast
performance assessment with ablation testing of the new participant
intelligence modules.

**Priority order is strict. If you approach context limits, commit what you
have and stop. Data acquisition (Tasks 1–2) comes before validation (Tasks
3–5). A session that delivers genuine data but no validation is useful; a
session that delivers neither is wasted.**

Complete ALL tasks. Do not stop for confirmation.

TASK 1: INSTALL HEADLESS BROWSER INFRASTRUCTURE

1a. Install Playwright:
```bash
pip install playwright --break-system-packages
playwright install chromium
```

If Playwright installation fails (e.g., missing system dependencies), try:
```bash
playwright install --with-deps chromium
```

If that also fails, fall back to selenium + chromedriver:
```bash
pip install selenium webdriver-manager --break-system-packages
```

Verify the headless browser works:
```bash
python -c "
try:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('https://httpbin.org/get')
        print('Playwright working')
        browser.close()
except Exception as e:
    print(f'Playwright failed: {e}')
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        opts = Options()
        opts.add_argument('--headless')
        opts.add_argument('--no-sandbox')
        driver = webdriver.Chrome(options=opts)
        driver.get('https://httpbin.org/get')
        print('Selenium working')
        driver.quit()
    except Exception as e2:
        print(f'Selenium also failed: {e2}')
        print('FALLBACK: Use requests + BeautifulSoup with Wayback Machine CDX API')
"
```

Note which browser engine is available. Use it throughout this session.

TASK 2: GENUINE ESC PRICE HISTORY ACQUISITION

The objective is 52+ genuine weekly ESC spot price observations covering
mid-2022 to present. Use multiple strategies in parallel — take whichever
produces the most data.

2a. Strategy 1 — Wayback Machine CDX API (no JS required):

The Internet Archive's CDX API returns a list of all archived snapshots
of a URL. Ecovantage's market update page has been archived regularly.

```python
import requests, json

# Find all archived snapshots of Ecovantage market updates
cdx_url = "http://web.archive.org/cdx/search/cdx"
params = {
    "url": "ecovantage.com.au/energy-certificate-market-update*",
    "output": "json",
    "from": "20220101",
    "to": "20260408",
    "fl": "timestamp,original,statuscode",
    "filter": "statuscode:200",
    "collapse": "timestamp:8"  # One snapshot per day
}
response = requests.get(cdx_url, params=params)
snapshots = json.loads(response.text)
print(f"Found {len(snapshots)-1} Wayback Machine snapshots")
```

For each snapshot, fetch the archived page and extract ESC spot price:
```
https://web.archive.org/web/{timestamp}/{original_url}
```

Parse the page content with BeautifulSoup. Ecovantage market updates
typically contain price data in text format like "ESC spot... $23.00"
or in table rows. Extract: date, ESC price, VEEC price, LGC price,
ACCU price, creation volume (where mentioned).

2b. Strategy 2 — Playwright rendering of Ecovantage archives:

If the site uses client-side rendering, use Playwright to load pages:
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to market update archives
    page.goto("https://www.ecovantage.com.au/energy-certificate-market-update/")
    page.wait_for_load_state("networkidle")

    # Extract content and paginate
    content = page.content()
    # Parse with BeautifulSoup
    # Look for pagination links (page/2/, page/3/, etc.)
    # Navigate through all archive pages
```

2c. Strategy 3 — NMG / Northmore Gordon published prices:

Northmore Gordon publishes articles with market data at
https://northmoregordon.com/articles/

Scrape article archive pages, filter for market updates, extract
ESC/VEEC price references. NMG articles are more analytical and may
not always contain spot prices, but when they do, they provide a
cross-validation source.

2d. Strategy 4 — Shell Energy / broker market updates:

Shell Energy published a detailed certificates market update (March 2024)
at https://shellenergy.com.au/energy-insights/certificates-market-update-march-2024/
Search for additional Shell Energy market updates with historical price data.

2e. Strategy 5 — IPART Annual Reports to the Minister:

These reports contain annual and sometimes quarterly price ranges.
Available at: https://www.energysustainabilityschemes.nsw.gov.au/
Navigate to publications/reports section.
Even if only annual/quarterly, these provide anchor points for validating
scraped weekly data.

2f. Strategy 6 — AFMA Environmental Product data:

The Australian Financial Markets Association publishes environmental
product conventions and occasionally market data.
Check: https://afma.com.au/

2g. Data assembly:

After running all strategies, consolidate results:

```python
# Deduplicate by week (prefer Ecovantage, fall back to NMG, then others)
# Cross-validate: where multiple sources report the same week, flag
# discrepancies exceeding A$0.50
# Store all genuine observations in the SQLite database with:
#   data_quality = 'genuine_weekly'
#   source_name = 'ecovantage_wayback' / 'ecovantage_live' / 'nmg' / 'shell' / etc.
```

Write results to forecasting/scrapers/genuine_backfill_report.json:
```json
{
    "total_genuine_observations": N,
    "date_range": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
    "sources": {
        "ecovantage_wayback": N,
        "ecovantage_live": N,
        "nmg": N,
        "shell_energy": N,
        "ipart_reports": N
    },
    "instruments_covered": ["ESC", ...],
    "cross_validation": {
        "weeks_with_multiple_sources": N,
        "discrepancies_over_050": N,
        "max_discrepancy": X.XX
    },
    "gaps": ["list of weeks with no data"]
}
```

**If total genuine observations < 20 after all strategies:**
Report what was found and what failed, with specific error messages.
The remaining tasks still run on whatever genuine data is available
(even 10 observations is better than 1) plus the synthetic dataset.

2h. Update data_assembly.py:

Call assemble_hybrid_dataset() to merge the new genuine observations.
Verify get_genuine_observation_count() now returns > 1.

TASK 3: DEFINITIVE FORECAST VALIDATION

Run with whatever genuine data was acquired. Label all results clearly
with the genuine observation count so the reader knows the sample size.

3a. Run full backtest on genuine-only subset:

```python
from forecasting.backtesting.backtest_engine import BacktestEngine
from forecasting.data_assembly import assemble_dataset

df = assemble_dataset()
genuine = df[df['data_quality'] == 'genuine_weekly']
n_genuine = len(genuine)

print(f"Running validation on {n_genuine} genuine observations")

if n_genuine >= 10:
    engine = BacktestEngine()
    results = engine.run_backtest(genuine)
    comparison = engine.generate_scorecard_comparison()
    print(comparison)
else:
    print(f"Only {n_genuine} genuine observations — running on hybrid dataset")
    engine = BacktestEngine()
    results = engine.run_backtest(df)
    comparison = engine.generate_scorecard_comparison()
    print(comparison)
```

3b. Run binomial test and DM test on genuine results:

If directional accuracy on genuine data differs from synthetic (52.4%),
report both values and the statistical significance of each.

3c. Confidence interval calibration check:

```python
# For each forecast horizon (1w, 4w, 12w, 26w):
# Count how many actual prices fell within the 80% CI
# Count how many fell within the 95% CI
# Report coverage ratios — they should be close to 80% and 95%
# If 80% CI only covers ~69% (as the roadmap suggests), calculate
# the expansion factor needed: target_coverage / actual_coverage
```

3d. Fix CI calibration if needed:

If the 80% CI coverage is below 75%, apply a calibration multiplier
to the CI bands in ensemble_forecast.py:
```python
ci_calibration_factor = target_coverage_quantile / actual_coverage_quantile
```
This is a single-line fix. Run the coverage check again after applying.

TASK 4: ABLATION TESTING

Test whether the new participant intelligence and shadow supply modules
actually improve forecast accuracy.

4a. Run three model configurations on the same dataset:

Configuration A — Baseline (no participant intelligence, simple 1.6x shadow):
  Disable participant demand features
  Disable ACP supply features
  Use simple shadow multiplier (1.6x)

Configuration B — Participant intelligence only:
  Enable participant demand features (obligation estimates, HHI, deadline proximity)
  Enable ACP supply features (pipeline, concentration, method endings)
  Keep simple shadow multiplier

Configuration C — Full model (participant intelligence + decomposed shadow):
  Enable all participant features
  Enable decomposed shadow supply model

```python
# For each configuration:
# 1. Set feature flags
# 2. Run backtest on the same data window
# 3. Produce ModelScorecard
# 4. Compare: directional accuracy, decision value, MAPE
```

4b. Report ablation results:

```
| Metric | A (Baseline) | B (+Participants) | C (+Shadow) | Delta A→C |
|--------|--------------|--------------------|-------------|-----------|
| MAPE | | | | |
| Dir. Accuracy | | | | |
| Decision Value | | | | |
| Sharpe Ratio | | | | |
| Transition Accuracy | | | | |
```

The key question: does Configuration C beat Configuration A on directional
accuracy or decision value? If not, the new modules add complexity without
forecast value (they may still have standalone intelligence value for
trading desk briefings).

4c. Feature importance analysis:

After ablation, run XGBoost feature importance on Configuration C:
```python
from forecasting.models.counterfactual_model import CounterfactualModel
model = CounterfactualModel()
# Train on full dataset with all features
# Extract feature_importances_
# Rank and report top 20 features
# Specifically note where participant and shadow features rank
```

If participant/shadow features rank outside the top 20, they are not
contributing meaningfully to the ML model's decisions.

TASK 5: PRODUCE DEFINITIVE VERIFICATION REPORT

Write forecasting/analysis/DEFINITIVE_VERIFICATION_REPORT.md:

```markdown
# WREI Forecasting System — Definitive Verification Report
## Date: [timestamp]
## Genuine observations: [count] (from [sources])

### 1. Data Acquisition Outcome

#### 1.1 Genuine Data Recovered
[Observation count, date range, sources, instruments]
[Gaps in the series]
[Cross-validation results between sources]

#### 1.2 Data Quality Assessment
[Genuine vs synthetic price distributions where overlap exists]
[Price persistence on genuine data (autocorrelation)]
[Volatility comparison: is genuine data more/less volatile than synthetic?]

### 2. Forecast Performance on Genuine Data

#### 2.1 Model Scorecard
[Full table: Naive, SMA-4, Bayesian, XGBoost, Ensemble]
[Statistical significance of directional accuracy]
[DM test vs naive]

#### 2.2 Confidence Interval Calibration
[Coverage ratios before and after calibration fix]
[Calibration factor applied]

#### 2.3 Performance by Market Condition
[Stable periods: MAPE, directional accuracy]
[Transition periods: MAPE, directional accuracy, timing lag]
[Policy event windows: signal extractor accuracy]

### 3. Ablation Test Results

#### 3.1 Module Impact
[Ablation table: Baseline vs +Participants vs +Shadow]
[Which modules improve which metrics?]
[Which modules make no measurable difference?]

#### 3.2 Feature Importance
[Top 20 features from XGBoost]
[Participant/shadow feature rankings]

#### 3.3 Verdict on New Modules
[Do participant intelligence features improve forecast accuracy? YES/NO]
[Does shadow decomposition improve forecast accuracy? YES/NO]
[If NO: do they provide standalone intelligence value? Assessment]

### 4. Commercial Viability Assessment

#### 4.1 Does the model beat naive on genuine data?
[MAPE: likely no — structural feature of low-volatility market]
[Directional accuracy: [result] — [significant/not significant]]
[Decision value: [result] — the metric that matters commercially]

#### 4.2 Updated NMG Value Proposition
[Decision value on genuine data × annualised × market impact adjustment]
[Is A$500K/year defensible? If not, what is the realistic figure?]

#### 4.3 Model Strengths to Lead With
[What the model does well — specific, evidence-based]

#### 4.4 Model Limitations to Disclose
[What the model does not do well — honest, specific]
[Recommended framing for broker conversations]

### 5. Recommended Next Actions
[Ordered by impact, referencing FORECAST_IMPROVEMENT_ROADMAP.md items]
[Updated based on genuine validation findings]
```

VERIFICATION:
  cd forecasting && python -m pytest --tb=short -q
  python -c "
  from forecasting.data_assembly import get_genuine_observation_count
  n = get_genuine_observation_count()
  print(f'Genuine observations: {n}')
  "
  cat forecasting/scrapers/genuine_backfill_report.json | python -m json.tool | head -20
  ls -la forecasting/analysis/DEFINITIVE_VERIFICATION_REPORT.md
  npm run build 2>&1 | tail -3

COMMIT:
  git add -A && git commit -m "Genuine data acquisition + definitive verification + ablation testing"
  git tag forecasting-genuine-verified
  Update TASK_LOG.md.
