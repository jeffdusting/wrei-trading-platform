# WREI Forecast Improvement Roadmap
## Date: 2026-04-08
## Based on: Performance Analysis Report + Participant Intelligence Build (Sessions E–F)

### 1. Current Forecast Performance Summary

**Key metrics (hybrid dataset — 327 observations, 1 genuine):**

| Metric | Naive | Ensemble | ML-only |
|--------|-------|----------|---------|
| MAPE (4w) | 2.03% | 3.70% | 3.76% |
| Directional Accuracy | — | 52.4% | — |
| Decision Value (Bayesian) | — | A$1,054,500 | — |
| Action Accuracy | — | — | 62.0% |

**Statistical significance:**
- Directional accuracy 52.4% is **not significant** at p<0.05 (p=0.124)
- Naive **significantly outperforms** the Bayesian model on MAPE (DM test p=0.010)
- The ensemble (3.70% MAPE) substantially closes the gap but naive still wins on point accuracy

**Where the model adds value:**
- **Policy windows**: 60.9% ML action accuracy (best regime) — the model correctly identifies policy-driven moves
- **Decision value**: A$1,054,500 cumulative on 50k notional — the model makes money on the trades it takes
- **Sharpe ratio**: 2.17 (Bayesian) — risk-adjusted returns are positive

**Where naive dominates:**
- **Stable periods**: prices move <A$0.50 in 70% of 4-week windows — predicting "no change" is correct most of the time
- **Transition periods**: 39.6% action accuracy — worse than random — the model detects regime changes too late

**Critical caveat:** All metrics are validated against synthetic data derived from the same structural assumptions the model uses. This is circular validation. Until 52+ genuine weekly observations accumulate, these numbers are unreliable.

### 2. New Intelligence Modules Deployed

#### 2.1 Demand-Side Participant Intelligence

**SchemeParticipantRegistry:** 8 participants loaded (Big 3 + 5 smaller retailers), tracking ~91% of NSW retail electricity market by estimated share.

**RetailerObligationEstimator:**
- Aggregate 2025 ESC obligation estimate: ~5.8M certificates (based on ESS Schedule 5 targets × market share allocation)
- Obligation concentration HHI: ~2,034 (moderate concentration — Big 3 hold ~74%)
- Quarterly demand pattern: Q4 accounts for ~50% of procurement (deadline-driven)

**Data quality:** Moderate (confidence 0.6). Market share estimates are from IPART/AER reporting; individual retailer obligations estimated proportionally. No retailer publicly discloses ESS compliance costs as a line item.

**Expected impact:** Provides fundamental demand-side signal absent from the model. The quarterly procurement cycle (heavy Q4 purchasing near June 30 deadline) should improve seasonal forecasting. The HHI metric captures concentration risk — if a major retailer exits NSW, demand drops materially.

#### 2.2 Supply-Side ACP Intelligence

**ACPRegistry:** 10 ACPs loaded (top 10 by estimated creation volume), total tracked creation ~5.2M certificates/year.

**Key findings:**
- 1 ACP has only ending methods (Bright Spark Energy — CLESF-only, method ended 31 March 2026)
- 1 ACP has majority ending-method exposure (CertificateTech — CLESF + MBM)
- Top 5 ACPs account for ~69% of tracked creation → moderate-to-high concentration

**CreationPipelineEstimator:**
- 26-week forward creation: ~3.0M certificates estimated
- Methods ending within 26 weeks: F8/F9 (30 June 2026); CLESF already ended
- Post-CLESF supply gap: ~130k certificates/month removed from pipeline

**Supply vulnerability:** HIGH — top 3 ACPs produce >60% of creation in some methods.

**Expected impact:** The creation pipeline estimate and method-ending countdown provide forward-looking supply signals. The concentration risk metric flags single-ACP-exit scenarios as material supply shocks.

#### 2.3 Shadow Supply Decomposition

**Five-pool model results:**

| Pool | Volume | Confidence | Data Source |
|------|--------|------------|-------------|
| ACP Pipeline | 1,724,402 | 0.4 | Registration lag × monthly creation |
| ACP Inventory | 738,456 | 0.3 | 6-week working inventory heuristic |
| Broker Inventory | 1,230,760 | 0.4 | NMG multiplier baseline |
| Forward-Committed | 640,000 | 0.2 | 10% of annual creation |
| Participant Surplus | 664,000 | 0.3 | DCCEEW data × 8% buffer fraction |
| **Total** | **4,997,618** | — | — |

**Decomposed multiplier: 2.11×** (vs simple multiplier: 1.6×)

**Interpretation:** The decomposed model suggests more shadow supply than the simple NMG multiplier. The divergence (0.51×) comes primarily from the ACP pipeline pool — the 14-week average registration lag represents ~1.7M certificates in limbo between activity completion and TESSA registration. This pool is invisible to both the NMG multiplier (which only counts registered supply) and the TESSA registry.

**Impact on Kalman filter:** The higher shadow multiplier would shift the regime classifier toward "surplus" more frequently, reducing bullish bias. However, confidence levels are low (0.2–0.4) and the decomposed model should only override the simple multiplier when specific pools can be validated against TESSA or IPART data.

### 3. Remaining Data Gaps

Ordered by impact on forecast accuracy.

| Gap | Impact | Data Source Required | Accessibility |
|-----|--------|---------------------|---------------|
| Genuine weekly ESC prices (only 1 observation) | **Critical** | Ecovantage archives (Wayback Machine), NMG (headless browser) | Medium — requires Playwright |
| Individual retailer ESC targets | **High** | IPART Individual Energy Savings Targets page | Medium — HTML scraping |
| TESSA certificate transfer velocity | **High** | TESSA registry (searchable web interface) | Medium — requires Playwright |
| ACP creation volumes (monthly) | **High** | IPART ACP register + IHEAB monthly reports | Medium — HTML scraping |
| ACCU price history (for second instrument) | **High** | CER quarterly reports, CCM auctions | Medium — PDF/HTML |
| Forward trade data | **Medium** | Broker platforms (Ecovantage, DemandManager) | Low — limited public disclosure |
| Retailer financial stress signals | **Medium** | ASX announcements, annual reports | High — well-structured data |
| AEMO NEM wholesale prices | **Low** | nemweb.com.au (free CSV) | High — freely downloadable |

### 4. Recommended Next Steps

Ordered by impact × feasibility.

1. **Deploy headless browser scraping for genuine ESC price history**
   - Expected impact: Enables genuine validation — the single highest-value improvement
   - Effort: 2-3 days (Playwright setup, Ecovantage Wayback Machine, NMG JS rendering)
   - Dependency: None
   - Target: 52+ genuine weekly observations

2. **Scrape IPART Individual Energy Savings Targets**
   - Expected impact: Per-retailer demand obligations replace market-share estimates (confidence 0.6 → 0.8+)
   - Effort: 1 day (HTML scraper)
   - Dependency: None

3. **Build TESSA certificate registry scraper (Playwright)**
   - Expected impact: Enables real-time creation/transfer/surrender tracking; validates shadow decomposition pools 1-3
   - Effort: 3-5 days (interactive web interface, pagination, rate limiting)
   - Dependency: Playwright infrastructure from step 1

4. **Improve transition detection (regime-change early warning)**
   - Expected impact: Target >50% action accuracy during transitions (currently 39.6% — this is where commercial value lies)
   - Effort: 3-5 days
   - Dependency: Steps 2 and 3 provide the leading indicator features
   - Approach: Monitor ACP creation velocity changes, surrender deadline proximity, and retailer stress signals as leading indicators before HMM state transitions

5. **Widen model confidence intervals**
   - Expected impact: 80% CI currently covers only 68.6% (should be 80%) — improves risk communication
   - Effort: 1 day (calibration from historical coverage ratios)
   - Dependency: None

6. **Validate shadow decomposition pools against TESSA data**
   - Expected impact: Reduces shadow estimate confidence from 0.2-0.4 to 0.6+; higher-quality surplus estimate improves regime classifier
   - Effort: 2-3 days
   - Dependency: Step 3 (TESSA scraper)

7. **Train ACCU model**
   - Expected impact: Second tradeable instrument, cross-market correlation signals
   - Effort: 3-5 days
   - Dependency: 20+ ACCU price observations (from CER/CCM data)

8. **Add AEMO wholesale electricity price feature**
   - Expected impact: Low — indirect correlation with ESC prices
   - Effort: 1 day (CSV download, feature engineering)
   - Dependency: None

### 5. Commercial Implications

**Does the model demonstrably beat naive on genuine data?**
No — with 1 genuine observation, this cannot be assessed. On synthetic data, the naive model significantly outperforms on MAPE (2.03% vs 3.70% ensemble). This is structurally expected: ESC prices are extremely persistent (1-week autocorrelation = 1.000) and move less than A$0.50 in 70% of 4-week windows.

**What would change that?**
The model's value is not in MAPE but in **decision value** — correctly timing the 30% of weeks where prices do move. The Bayesian model's A$1,054,500 cumulative decision value on 50k notional (Sharpe 2.17) suggests genuine trading alpha, but this must be validated on genuine data.

**Updated NMG counterfactual value:**
- Raw decision value: A$142,680
- Market impact-adjusted (50k notional): A$112,955 (20.8% reduction)
- With participant intelligence features: expected improvement pending genuine validation

**Key commercial question:** The model's value proposition rests entirely on decision value (timing trades) not point forecasts (predicting prices). This is commercially reasonable — no ESC desk expects to predict prices more accurately than "today's price" — but it means the genuine validation must test **trade timing accuracy**, not MAPE. The 62% ML action accuracy is the metric that matters, and it must be validated on genuine market data.

**Participant intelligence modules** add structural economic intelligence that was previously absent. Even before improving forecast accuracy, these modules provide commercial value as standalone intelligence products: retailer obligation estimates, ACP concentration risk analysis, and shadow supply decomposition are useful for trading desk briefings regardless of model accuracy.
