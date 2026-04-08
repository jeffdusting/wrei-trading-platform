# WREI Forecasting System — Performance Analysis Report
## Date: 2026-04-08
## Scope: Post-advancement verification and performance assessment (Sessions A–D)

### 1. Implementation Integrity

#### 1.1 Structural Status

| Check | Result |
|-------|--------|
| Session A files (4/4) | **PASS** — feature_independence_report.json, ensemble_weight_history.json, statistical_significance.json, ensemble_weight_investigation.md |
| Session B files (2/2) | **PASS** — backfill_report.json, GENUINE_VALIDATION_REPORT.md |
| Session C files (4/4) | **PASS** — signal_calibration_report.md, signal_calibration.json, market_impact.py, scenario_narrator.py |
| Session D files (5/5) | **PASS** — instruments/__init__.py, instruments/config.py, instruments/registry.py, token_pricing.py, aco_yield.py |
| Import chain | **PASS** — All modules import cleanly (LibreSSL warning only) |
| Test suite | **PASS** — 50/50 tests pass (40.53s) |
| Next.js build | **PASS** — Static and dynamic routes compile successfully |

#### 1.2 Genuine Data Quality

| Metric | Value |
|--------|-------|
| Total observations | 327 |
| Genuine observations | 1 (0.3%) |
| Synthetic observations | 326 (99.7%) |
| Genuine date | 2026-04-03 |
| Genuine ESC price | A$24.50 |

**Backfill sources:**
- Ecovantage: 6 observations scraped (but only 1 ESC weekly price extracted — site shows current week only)
- Northmore Gordon: 0 (JS-rendered, no static prices)
- CER: 0 (no ACCU price in HTML)
- Cross-validation: 0 weeks compared (no overlapping sources)

**Assessment:** The genuine data pipeline is functional but the dataset is critically thin. Only 1 genuine weekly observation exists. The Ecovantage scraper works but the site is a single-page format — historical data is not accessible via static HTML. The NMG site requires JavaScript rendering (headless browser). This severely limits any genuine-vs-synthetic comparison or genuine-data-only backtesting.

### 2. Forecast Accuracy on Genuine Data

#### 2.1 Model Scorecard Comparison (Hybrid Dataset)

| Model | MAPE (4w) | Dir. Acc | Decision Value | Action Acc | Sharpe |
|-------|-----------|----------|----------------|------------|--------|
| Naive (random walk) | 2.03% | — | — | — | — |
| SMA-4 | 2.78% | — | — | — | — |
| SMA-12 | 4.68% | — | — | — | — |
| Bayesian-only | 5.85% | 52.4% | A$1,054,500 | — | 2.17 |
| ML-only (XGBoost) | 3.76% | — | — | 62.0% | — |
| Ensemble | 3.70% | — | — | — | — |

**Genuine-only backtest:** Not possible — only 1 genuine observation (no forward actuals available for validation).

#### 2.2 Statistical Significance

| Test | Statistic | p-value | Interpretation |
|------|-----------|---------|----------------|
| Binomial (directional accuracy) | 53.7% (N=270) | 0.124 | **Not significant** at p<0.05 |
| Diebold-Mariano (MAPE vs naive) | -2.589 | 0.010 | **Naive significantly outperforms** model on MAPE |

**Verdict:** The model's directional accuracy advantage (52.4% vs 50% random) is **not statistically significant** (p=0.124). On MAPE, the naive model significantly outperforms the Bayesian model (p=0.010). The ensemble (3.70% MAPE) substantially closes the gap to naive (2.03%) but this hasn't been tested for significance. The model's value proposition must rely on decision value and directional calls during market moves, not point-forecast accuracy.

#### 2.3 Performance by Market Condition

| Regime | ML MAPE (4w) | ML Action Accuracy | N weeks |
|--------|-------------|-------------------|---------|
| Stable | 2.91% | 55.6% | 27 |
| Transition | 3.84% | 39.6% | 48 |
| Policy window | 3.74% | 60.9% | 161 |

**Findings:**
- The ML model performs best during stable periods (2.91% MAPE) — but this is precisely when forecasting matters least.
- Action accuracy is highest during policy windows (60.9%) — this is where the model adds the most practical value.
- Transition periods (regime changes) show the worst action accuracy (39.6%) — the model is slow to detect moves.

#### 2.4 Price Persistence Analysis

| Metric | Value |
|--------|-------|
| 1-week autocorrelation | 1.000 |
| 4-week autocorrelation | 0.995 |
| Up moves (>A$0.50, 4w) | 50 weeks (15%) |
| Down moves (<-A$0.50, 4w) | 47 weeks (15%) |
| Flat (within A$0.50, 4w) | 226 weeks (70%) |
| Mean up move | +A$0.66 |
| Mean down move | -A$0.86 |

**Implication:** ESC prices exhibit extremely high persistence — the market moves less than A$0.50 in any 4-week window 70% of the time. This makes the naive model (predict "no change") extremely hard to beat on MAPE. The model's value must come from the 30% of weeks where prices do move, and the model correctly identifies direction. The asymmetry in moves (down moves 30% larger than up moves) suggests the surplus overhang creates sharper corrections than rallies.

### 3. Component Assessment

#### 3.1 Ensemble Weight Analysis

| Metric | Value |
|--------|-------|
| Optimised Bayesian weight | 0.15 |
| Optimised ML weight | 0.85 |
| Ensemble MAPE | 3.70% |
| Unclamped MAPE | 3.70% |
| Clamped MAPE ([0.2, 0.8]) | 3.72% |

**Verdict:** The ensemble is genuinely multi-model — both components contribute. However, the ML model dominates (85% weight). This is expected on synthetic data: XGBoost has access to features that generated the synthetic prices, creating circular advantage. The Bayesian model's 15% weight reflects its structural mean-reversion assumptions, which may prove more valuable on genuine data where synthetic regularities don't exist.

**Key feature importance (price regression):** regime_surplus_prob (54.1%), spot_price (21.7%), regime_tightening_prob (15.8%). The model relies heavily on regime classification — if regime detection is wrong, the price forecast degrades substantially.

#### 3.2 Signal Extractor Calibration

| Metric | Value |
|--------|-------|
| Direction accuracy | 70.6% (12/17 events) |
| Reliability threshold | 60% |
| Verdict | **RELIABLE** on direction |
| Magnitude scaling factor | 0.2447 |
| Overprediction ratio | ~4.1× |
| Predicted-actual correlation | -0.17 (weak) |

**Interpretation:** The signal extractor reliably identifies the direction of policy impacts (bullish/bearish) but dramatically overpredicts magnitude. The 0.2447 scaling factor corrects this. However, the weak correlation (-0.17) between predicted and actual magnitudes means the signal is useful as a directional indicator only — not for sizing the expected impact.

**Failure modes:** The extractor incorrectly predicted bullish outcomes for several events that coincided with the 2024 price decline (VAL-008, VAL-009, VAL-011). This suggests it overweights the policy signal and underweights the prevailing surplus dynamic.

#### 3.3 Market Impact

| Trade Size (ESC) | Impact Coefficient | Value Retention |
|-------------------|--------------------|-----------------|
| 10,000 | 0.042 | 95.8% |
| 25,000 | 0.104 | 89.6% |
| 50,000 (NMG notional) | 0.208 | 79.2% |
| 100,000 | 0.417 | 58.3% |
| 250,000 | 1.000 | 0.0% |

**NMG counterfactual (from Session C):**
- Raw decision value: A$142,680
- Impact-adjusted (50k notional): A$112,955 (20.8% reduction)

**ACCU market impact is lower** due to deeper liquidity (360k weekly volume vs 120k for ESC):
- 50,000 ACCUs: 6.9% impact (93.1% retention)
- 100,000 ACCUs: 13.9% impact (86.1% retention)

#### 3.4 Multi-Instrument Readiness

| Instrument | Penalty Ceiling | Supply Driver | Demand Driver | OU μ (balanced) | Status |
|------------|----------------|---------------|---------------|-----------------|--------|
| ESC | Yes (A$35.86) | activity_creation | surrender_obligation | 23.5 | **Trained** (synthetic) |
| VEEC | Yes (A$100.00) | activity_creation | surrender_obligation | 70.0 | **Config only** |
| ACCU | No | project_issuance | safeguard_compliance | 35.0 | **1 observation** — insufficient for training |
| LGC | No | generation | rpt_target | 4.0 | **Skeleton config** |

**ACCU status:** Only 1 genuine observation (A$36.30 on 2026-04-03). The training threshold is 20 observations. ACCU requires CCM auction data, ANREU registry data, and DCCEEW issuance reports — none currently scraped.

### 4. Identified Improvement Areas

Ranked by expected impact on forecast accuracy or commercial value.

#### 4.1 Data Gaps (Critical)

The single most important improvement is **genuine data accumulation**. All model metrics are currently validated against synthetic data that was generated from the same structural assumptions the model uses — this is circular validation.

| Gap | Impact | Source Required | Accessibility |
|-----|--------|-----------------|---------------|
| Genuine weekly ESC prices | **Critical** — current 1 observation is insufficient | Ecovantage archives, NMG (headless browser), Wayback Machine | Medium — requires browser automation |
| ACCU price history | **High** — enables second instrument | CER quarterly reports, CCM auction results, ANREU registry | Medium — public data, scraping required |
| Retailer obligation data | **High** — demand forecasting entirely estimated | IPART compliance reports, retailer annual reports, AEMO NEM data | Medium — public filings |
| ACP creation pipeline | **High** — supply forecasting lacks granularity | IPART ACP register, TESSA public registry | Medium — scraping from IPART website |
| VEEC/LGC price history | **Medium** — additional instruments | VEU/VEET registry, CER LGC register | Medium |
| Wholesale electricity prices | **Low** — indirect correlation | AEMO NEM spot price data | High — freely available |

#### 4.2 Model Structure

**Weakest link: Regime detection during transitions.** The ML model achieves only 39.6% action accuracy during transition periods — worse than random. The model detects regime changes too late, by which point the price has already moved.

The ensemble weight distribution (85/15 ML/Bayesian) is likely an artefact of synthetic data circularity. On genuine data, the Bayesian model's structural mean-reversion assumptions may prove more robust, potentially shifting the optimal weights.

**Recommendation:** Focus on improving transition detection rather than overall MAPE. A regime-change early-warning system (monitoring leading indicators before the HMM state fully transitions) could substantially improve action accuracy during the 30% of weeks where prices actually move.

#### 4.3 Feature Gaps

| Feature | Source | Expected Impact |
|---------|--------|-----------------|
| Retailer obligation estimates | IPART/AEMO | High — demand-side signal |
| ACP creation pipeline (forward supply) | IPART ACP register | High — supply-side signal |
| Days to CLESF/SONA/F8F9 end dates | Known dates | Medium — method-ending supply shock |
| AEMO NEM wholesale prices | AEMO data portal | Low — indirect energy cost signal |
| Retailer financial stress indicators | ASX filings | Medium — penalty-payment preference signal |
| Shadow supply decomposition | Multiple sources | Medium — replaces single-multiplier estimate |

#### 4.4 Shadow Supply

Current shadow estimate uses a single multiplier (1.6× visible TESSA supply) based on NMG market intelligence. This is crude and doesn't distinguish between:
1. ACP pipeline (activities completed, registration pending)
2. ACP inventory (registered, held by creators)
3. Broker inventory (held by intermediaries)
4. Forward-committed supply (contracted, not yet delivered)
5. Participant surplus bank (held beyond current obligation)

A decomposed shadow model would improve the Kalman filter's surplus observation, which feeds the regime classifier (the single most important feature at 54.1% importance).

#### 4.5 Regime Detection

**Current performance:** The Bayesian model's directional accuracy improves with horizon (50.0% at 1w → 57.4% at 12w), suggesting the HMM regime classifier captures medium-term trends but misses short-term turning points.

**Coverage analysis:** 80% CI coverage is 68.6% at 4w (should be 80%) — the model's uncertainty bands are too narrow. 95% CI coverage is 69.7% at 4w (should be 95%) — substantially underestimating tail risk.

**Regime changes in genuine period:** Cannot be assessed — only 1 genuine observation available.

### 5. Recommendations

Ordered by impact on forecast accuracy or commercial value.

1. **Accumulate genuine weekly ESC data** — Deploy headless browser scraping (Playwright/Puppeteer) for NMG and Wayback Machine scraping for Ecovantage archives. Target: 52+ genuine weekly observations. **Expected impact:** Enables real validation of all model metrics; currently all metrics are unreliable due to circular validation. **Dependency:** None. **Highest priority.**

2. **Build participant demand intelligence** — Scrape IPART scheme participant list and ACP register; estimate retailer obligations from public data; integrate as XGBoost features. **Expected impact:** Provides fundamental demand-side signal currently absent from the model. **Dependency:** Data source inventory (Session E Task 5).

3. **Decompose shadow supply** — Replace the single 1.6× multiplier with 5-pool model (ACP pipeline, ACP inventory, broker inventory, forward-committed, participant surplus). **Expected impact:** Improves the surplus estimate feeding the regime classifier (54.1% feature importance). **Dependency:** TESSA/IPART data access.

4. **Improve transition detection** — Add leading indicators for regime changes (ACP creation velocity changes, surrender deadline proximity, retailer stress signals). Target: >50% action accuracy during transitions (currently 39.6%). **Expected impact:** Captures most of the model's commercial value — the 30% of weeks where prices move. **Dependency:** Recommendations 2 and 3.

5. **Widen confidence intervals** — Current 80% CI covers only 68.6% (should be 80%). Calibrate using historical coverage ratios; likely requires fatter-tailed distribution assumptions. **Expected impact:** Improves risk communication and portfolio sizing. **Dependency:** None.

6. **Train ACCU model** — Collect 20+ genuine ACCU price observations from CCM auctions and ANREU registry. **Expected impact:** Second tradeable instrument, cross-market signals. **Dependency:** ACCU data scraper.

7. **Add wholesale electricity price feature** — AEMO NEM spot prices are freely available and may provide leading signal for ESC demand (energy cost → retrofit activity → ESC creation). **Expected impact:** Low-to-medium (indirect signal). **Dependency:** None.
