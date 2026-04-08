# WREI Forecast Extension Plan — ACCU, International Carbon, and Asset Tokens

**Document Reference:** WR-ASS-015 | **Version:** 1.0 | **Date:** 8 April 2026
**Classification:** Internal — Strategic & Technical Plan
**Prepared for:** Jeff Dusting, CEO — Water Roads Pty Ltd

---

## 1. Scope

This plan extends the WREI forecasting system from its current ESC-only coverage to five instrument categories across three distinct market structures. The InstrumentConfig schema from Session D provides the architectural foundation; this plan fills it with market-specific parameterisation, data sources, and model adaptations.

The five categories, in order of data readiness and buildability, are the following.

1.1. **ACCUs** (Australian Carbon Credit Units) — compliance market, buildable now. CER publishes quarterly price data, issuance volumes, and Safeguard Mechanism compliance data. CORE Markets publishes daily spot prices. S&P Global Platts assesses benchmark Generic ACCUs daily at approximately A$37.30/mtCO2e as of late February 2026. The market traded a record 18.8 million ACCUs in 2024, with issuances projected at 22–26 million for 2026. Safeguard demand is the primary driver, with baselines declining at 4.9% per year.

1.2. **International voluntary carbon credits** (VCUs via Verra VCS, Gold Standard, CORSIA-eligible GEOs) — voluntary market, buildable with available exchange data. CBL/Xpansiv operates the world's largest spot carbon credit exchange, publishing daily GEO, N-GEO, and C-GEO prices. The VCM is valued at approximately €2.5 billion in 2025, projected to reach €3 billion in 2026. Nature-based credits (N-GEO) recently traded around $1.15–7.03, with technology credits (C-GEO) around $1.30. Prices are highly project-type dependent, ranging from $1.25 (Indian bundled solar) to $18.00 (US forestry).

1.3. **Tokenised carbon credits** (BCT, NCT, MCO2, WREI-CC) — derivative of underlying credits, buildable as pricing layer on top of categories 1.1 and 1.2. Token prices derive from the underlying credit price plus/minus a premium/discount driven by DeFi liquidity, platform trust, and vintage/quality attributes. KlimaDAO's BCT and Toucan's NCT are the reference instruments. On-chain data is available from CoinGecko and blockchain APIs.

1.4. **WREI-ACO (Asset Co infrastructure token)** — yield-based valuation, not a market-price forecast. The ACO token represents fractional interest in the Water Roads vessel fleet SPV (LeaseCo). Its price is derived from a DCF model with inputs from fleet utilisation, route revenue, operating costs, and carbon credit revenue. This is a project finance model, not a market forecasting model — the forecasting system provides carbon price trajectory as an input.

1.5. **SMCs (Safeguard Mechanism Credits)** — emerging market, limited data but structurally linked to ACCUs. SMCs traded at a $0.50–2.00 discount to generic ACCU spot. Only ~375,000 traded in Q2 2025. The model should track the ACCU-SMC spread rather than forecast SMC price independently.

---

## 2. Market Structure Comparison

The forecasting approach for each category depends on its market structure.

| Dimension | ESC (current) | ACCU | International VCM | Tokenised | WREI-ACO |
|-----------|--------------|------|-------------------|-----------|----------|
| Price ceiling | Hard (IPART penalty) | Soft (CCM $79.20) | None | Derives from underlying | N/A (yield-based) |
| Demand driver | Retailer surrender obligation | Safeguard compliance (declining baselines) | Corporate net-zero commitments, CORSIA | DeFi demand, retirement | Investor yield demand |
| Supply driver | ACP activity creation | CER project issuance | Project developer issuance (Verra, GS) | Bridge from registry | Fleet operations |
| Compliance cycle | Annual (June 30 / Dec 31) | Annual (March 31) | No fixed cycle | No fixed cycle | Quarterly distributions |
| Price range (2026) | A$23–29 | A$33–42 | $1–18 USD (project dependent) | Varies by pool | Yield-derived NAV |
| Data frequency | Weekly (Ecovantage) | Daily (CORE/Platts) | Daily (CBL/Xpansiv) | Continuous (on-chain) | Quarterly (financials) |
| Regime structure | Surplus/balanced/tightening | Pre-compliance/compliance/post-compliance | Risk-on/risk-off/quality-rotation | Premium/discount/parity | N/A |
| OU applicability | Yes (reflecting boundary) | Yes (soft upper bound at CCM) | Limited (no natural ceiling) | Derivative pricing | No |
| Kalman filter applicability | Yes (surplus state) | Yes (issuance vs demand balance) | Limited (fragmented supply) | No | No |
| XGBoost applicability | Yes (policy features) | Yes (Safeguard features) | Yes (sentiment, macro) | Yes (DeFi features) | No |

---

## 3. ACCU Forecasting Model

The ACCU market is the highest-priority extension because it shares structural similarities with ESCs (compliance-driven, Australian-regulated, single regulator), has good data availability, and is the underlying instrument for WREI-CC tokenised credits.

### 3.1. ACCU Market Dynamics

The ACCU market operates under the reformed Safeguard Mechanism, which requires approximately 215 covered facilities to keep emissions below declining baselines (declining 4.9% per year). Facilities that exceed their baselines must surrender ACCUs or SMCs. This creates compliance demand that grows annually as baselines tighten.

Key structural features that differentiate ACCUs from ESCs are the following.

3.1.1. **No hard penalty ceiling.** The Cost Containment Measure (CCM) provides ACCUs at a fixed price ($79.20 for 2024–25, CPI+2% indexed annually), but stock is limited (4.8 million at end of 2025) and only available to Safeguard entities. This creates a soft ceiling that may or may not bind, unlike ESC's hard penalty rate.

3.1.2. **Methodology-specific pricing.** Unlike ESCs (which are fungible regardless of creation method), ACCUs trade at different prices by methodology. Human-Induced Regeneration (HIR) ACCUs historically commanded a premium over generic ACCUs, though this spread has narrowed to near-parity in late 2024. Nature-based credits may command premiums for co-benefits.

3.1.3. **Government contract overhang.** Approximately 13 million ACCUs have been released from government Carbon Abatement Contracts (CACs) through four exit windows since 2022, with a permanent exit arrangement announced December 2025. This supply overhang depresses prices but is finite and declining.

3.1.4. **Annual compliance cycle.** The March 31 surrender deadline creates a pronounced seasonal demand pattern — compliance buying accelerates in Q4 and Q1, easing in Q2 and Q3. This is analogous to the ESC June 30/December 31 cycle but with a single annual deadline.

3.1.5. **Supply concentration.** The top 5 project developers (LMS Energy, Terra Carbon, AI Carbon, and others) produce a material share of annual issuance. Landfill gas projects account for approximately 3.8 million ACCUs per year, with 74 projects (43% of total landfill gas projects) having crediting periods ending in 2026 — a potential supply cliff analogous to the ESC commercial lighting phase-out.

### 3.2. ACCU Data Sources

| Source | Data | Frequency | Access |
|--------|------|-----------|--------|
| CER Quarterly Carbon Market Reports | Spot price charts, issuance volumes, holdings, surrender data, SMC data | Quarterly (+ interim data releases) | Free — XLSX data workbooks downloadable |
| CER ACCU Scheme project register | Individual project issuance, methodology, crediting periods | Updated regularly | Free — searchable database |
| CORE Markets | Daily generic ACCU spot price, monthly market reports | Daily/monthly | Free tier (spot price), paid (full analytics) |
| S&P Global Platts | Daily Generic ACCU and SMC assessments | Daily | Paid subscription (reference only) |
| Jarden | ACCU trade data (reported to CER) | Daily | Not directly accessible |
| ANREU / new Unit and Certificate Registry | Holdings, transfers, surrenders | Updated regularly | Partial public access |
| DCCEEW | Safeguard Mechanism baseline data, emissions projections | Annual/quarterly | Free — published reports |
| CCA (Climate Change Authority) | ACCU Scheme reviews, policy recommendations | Periodic | Free — published reports |

### 3.3. ACCU InstrumentConfig

```python
InstrumentConfig(
    code="ACCU",
    name="Australian Carbon Credit Unit",
    currency="AUD",
    market_type="compliance",
    has_penalty_ceiling=False,
    penalty_rate=None,  # CCM is soft ceiling, not hard
    price_floor=0.0,
    supply_driver="project_issuance",
    supply_data_source="CER",
    known_supply_shocks=[
        {"event": "Landfill gas crediting period cliff", "date": "2026-12-31",
         "impact_pct": -0.18, "note": "74 projects (43% of LFG) ending 2026"},
        {"event": "CAC permanent exit arrangement", "date": "2026-07-01",
         "impact_pct": 0.05, "note": "Additional supply released from contracts"}
    ],
    demand_driver="safeguard_compliance",
    compliance_deadlines=[{"date": "03-31", "label": "Safeguard annual surrender"}],
    demand_data_source="CER+DCCEEW",
    regime_count=3,
    regime_names=["post_compliance", "building", "compliance_window"],
    ou_parameters={
        "post_compliance": {"theta": 0.04, "mu": 33.0, "sigma": 1.50},
        "building": {"theta": 0.06, "mu": 36.0, "sigma": 2.00},
        "compliance_window": {"theta": 0.10, "mu": 40.0, "sigma": 3.00}
    },
    price_scrapers=["core_markets", "cer_quarterly"],
    volume_scrapers=["cer_registry", "cer_quarterly"],
    settlement_type="anreu",
    settlement_registry="Unit and Certificate Registry"
)
```

The OU parameters reflect observed ACCU dynamics: slower mean-reversion and lower volatility in the post-compliance easing period (April–August), moderate in the building period (September–December), and faster mean-reversion and higher volatility in the compliance window (January–March) when Safeguard entities accelerate procurement.

### 3.4. ACCU-Specific Model Adaptations

3.4.1. **OU model.** Use a soft upper bound rather than a reflecting boundary. The CCM price ($79.20 for 2024–25) is the reference ceiling, but instead of reflecting, the model applies an increasing mean-reversion force as price approaches the CCM — entities start buying from the CCM rather than the market, which caps upward price pressure without hard-reflecting the path.

3.4.2. **Kalman filter.** State vector adaptation: replace `true_surplus` with `net_compliance_position` (total holdings minus estimated compliance obligation), replace `creation_momentum` with `issuance_momentum` (quarterly issuance rate), replace `demand_pressure` with `safeguard_demand_pressure` (days to March 31 × estimated excess emissions), and retain `regime_indicator`. Observations: spot price (from CORE Markets daily), quarterly issuance volume (from CER), and price-to-CCM ratio (analogous to ESC's price-to-penalty ratio).

3.4.3. **XGBoost features.** ACCU-specific features: `safeguard_baseline_decline_rate`, `total_accu_holdings` (from CER reports), `safeguard_entity_holdings_pct` (60%+ of holdings as of end 2024), `ccm_stock_remaining`, `cac_releases_ytd`, `methodology_mix_concentration` (HIR vs generic vs other), `smc_issuance_ytd`, `smc_accu_spread`.

3.4.4. **Compliance demand model.** The Safeguard Mechanism's declining baselines create a mechanistic demand forecast: if covered emissions are approximately 132.7 million mtCO2e (2024–25 preliminary) and baselines decline at 4.9% per year, the aggregate exceedance grows predictably. The CER projects 13.7 million mtCO2e exceedance across 143 facilities. This exceedance converts directly to ACCU/SMC surrender demand.

---

## 4. International Voluntary Carbon Credit Forecasting

The international VCM operates on fundamentally different dynamics from Australian compliance markets and requires a different model architecture.

### 4.1. VCM Market Dynamics

The VCM is fragmented across registries (Verra VCS, Gold Standard, ACR, Climate Action Reserve), project types (nature-based, technology, removal vs avoidance), and quality tiers (CCP-eligible, CORSIA-eligible, general voluntary). Prices range from $1.25 (low-quality avoidance) to $180+ (high-quality removal). There is no compliance driver — demand comes from corporate net-zero commitments, voluntary offset purchases, and CORSIA aviation obligations.

### 4.2. VCM Data Sources

| Source | Data | Access |
|--------|------|--------|
| CBL/Xpansiv | Daily GEO, N-GEO, C-GEO spot and futures | Partial free (summary), paid (full history) |
| S&P Global Platts | Daily VCM assessments, carbon credit specifications | Paid |
| Verra VCS registry | Project data, issuance, retirements (public search) | Free |
| Gold Standard registry | Project data, issuance, retirements | Free |
| AlliedOffsets | VCM market data, pricing, forecasting | Paid |
| Ecosystem Marketplace (SOVCM) | Annual VCM report with price/volume data | Free (summary), paid (full) |
| Climate Focus VCM Dashboard | Consolidated VCM metrics across registries | Free |
| CoinGecko | BCT, NCT, MCO2 token prices | Free API |
| DefiLlama | RWA dashboard including carbon tokens | Free |

### 4.3. VCM Forecasting Approach

The VCM cannot be modelled with a single instrument forecast because prices vary by an order of magnitude across project types. The approach is a **tiered model**.

4.3.1. **Tier 1 — Benchmark indices.** Forecast the CBL GEO, N-GEO, and C-GEO benchmark indices using the OU model with macro-driven regime detection. Regime drivers: corporate net-zero announcement rate, CORSIA phase timeline, ICVCM CCP-eligible credit supply, and EU CBAM indirect effects. No penalty ceiling — use a soft upper bound based on the marginal abatement cost curve.

4.3.2. **Tier 2 — Quality spread model.** Model the spread between CCP-eligible credits and general voluntary credits as a mean-reverting process driven by integrity events (registry scandals, methodology revocations, buyer sentiment shifts). The ICVCM CCP label creates a structural quality premium.

4.3.3. **Tier 3 — Project-type premia.** Model the premium/discount for specific project categories (REDD+, cookstoves, renewable energy, removal technologies) relative to the GEO benchmark. These spreads are driven by methodology-specific supply dynamics and buyer preference shifts.

The VCM model is the least mature of the five categories because the market itself is less mature — price discovery is fragmented, liquidity is thin, and the relationship between fundamentals and prices is weaker than in compliance markets. The initial implementation should focus on Tier 1 (benchmark index forecasting) with Tiers 2 and 3 as later additions.

---

## 5. Tokenised Carbon Credit Pricing

Tokenised carbon credits (BCT, NCT, MCO2, and WREI-CC) are derivatives of underlying credits. Their prices derive from the underlying credit price adjusted for tokenisation premium/discount, DeFi liquidity, vintage quality, and platform trust.

### 5.1. Tokenised Carbon Pricing Model

```
Token_price = Underlying_credit_price
            × (1 + quality_premium)        # CCP-eligible, co-benefits, vintage
            × (1 + verification_premium)   # dMRV, blockchain provenance
            × (1 - liquidity_discount)     # thin markets, platform risk
            × (1 + defi_demand_premium)    # staking, collateral, retirement demand
```

For WREI-CC specifically, per WR-STR-008:
- `verification_premium` = 0.50 (the 1.5× WREI verification premium)
- `liquidity_discount` = 0.10–0.20 (new platform, initially thin)
- `defi_demand_premium` = 0.00 initially (grows with DeFi integration)

### 5.2. On-Chain Data Sources

| Source | Data | Access |
|--------|------|--------|
| CoinGecko API | BCT, NCT, MCO2, KLIMA token prices and volumes | Free API |
| Etherscan / Polygonscan | On-chain transaction data, contract interactions | Free API |
| Toucan Protocol subgraph | Carbon pool statistics, bridging volumes, retirements | Free (The Graph) |
| KlimaDAO dashboard | Treasury holdings, staking rates, retirement volumes | Free |
| RWA.xyz | Tokenised RWA analytics across chains | Free |
| DefiLlama | RWA TVL, yield data | Free |

### 5.3. Token Price Forecast

The token price forecast is not independent — it derives from the underlying credit forecast (ACCU for Australian tokens, GEO for international tokens) with adjustment factors. The model produces:

```python
@dataclass
class TokenForecast:
    underlying_instrument: str      # "ACCU", "GEO", "N-GEO"
    underlying_forecast: float      # from ACCU or VCM model
    quality_premium: float
    verification_premium: float
    liquidity_discount: float
    defi_demand_premium: float
    token_price_forecast: float     # computed
    basis_risk: float               # CI widening for token/underlying divergence
```

---

## 6. WREI-ACO Asset Token Valuation

The ACO token is fundamentally different from the other instruments — it represents fractional ownership of an infrastructure asset (the Water Roads vessel fleet SPV), not a market-traded environmental certificate.

### 6.1. Valuation Model

The ACO token price is derived from a DCF model, not a market-price forecast:

```
ACO_NAV = Σ (Net_fleet_revenue_t / (1 + discount_rate)^t)  for t = 1 to T
        + Terminal_value_T / (1 + discount_rate)^T

NAV_per_token = ACO_NAV / tokens_outstanding
```

Where:
- `Net_fleet_revenue_t` = (Passenger revenue + Carbon credit revenue) - Operating costs - Debt service
- `Carbon_credit_revenue` = Fleet carbon savings × Carbon price trajectory (from ACCU/VCM model)
- `discount_rate` = Risk-free rate + Infrastructure risk premium + Liquidity premium
- `Terminal_value` = Perpetuity or exit multiple

### 6.2. Connection to Forecasting System

The forecasting system provides the **carbon price trajectory** input that drives the carbon credit revenue component of the DCF. If ACCU prices rise (tightening Safeguard, declining supply), carbon credit revenue increases, ACO NAV increases. This creates a correlation between the carbon market forecast and the ACO token valuation.

The DCF model should produce:
- Base case NAV (using ensemble forecast median carbon price trajectory)
- Bull case NAV (using 80% CI upper bound)
- Bear case NAV (using 80% CI lower bound)
- Sensitivity: NAV change per A$1 change in ACCU price

### 6.3. Market Comparables

For secondary market price discovery (once ACO tokens trade), the model should track comparable infrastructure RWA tokens: tokenised U.S. Treasuries (BUIDL, OUSG) for yield benchmarking, tokenised private credit (Centrifuge, Maple Finance) for risk premium calibration, and maritime infrastructure funds for operational comparables. RWA.xyz provides aggregate analytics across these categories.

---

## 7. Implementation Sequencing

The five instrument categories are sequenced by data readiness and dependency.

| Session | Scope | Depends On | Key Output |
|---------|-------|------------|------------|
| H | ACCU model: data acquisition, parameterisation, training, validation | Session D InstrumentConfig schema | Trained ACCU model with genuine data validation |
| I | VCM benchmark model: CBL/Xpansiv data, GEO/N-GEO/C-GEO forecasting | Session H ACCU model (for cross-market features) | VCM Tier 1 benchmark forecast |
| J | Tokenised credit pricing: on-chain data, derivative pricing model | Sessions H+I (underlying forecasts) | WREI-CC and BCT/NCT price models |
| K | ACO yield model: DCF, carbon trajectory integration, comparable tracking | Sessions H+I (carbon price trajectory) | ACO NAV model with scenario analysis |
| L | Cross-instrument correlation and portfolio analytics | All prior sessions | Correlation matrix, hedging signals, portfolio optimiser |

---

## 8. CC Session Prompts

### 8.1. Session H — ACCU Model

```
You are working on the WREI Trading Platform forecasting system.
Read context:
  cat TASK_LOG.md
  cat forecasting/analysis/DISCOVERY_SUMMARY.md 2>/dev/null

This session builds and validates the ACCU forecasting model. Complete ALL tasks.

TASK 1: ACCU DATA ACQUISITION

1a. Scrape CER Quarterly Carbon Market Report data workbooks:
    - Navigate to https://cer.gov.au/markets/reports-and-data/quarterly-carbon-market-reports
    - Download all available XLSX data workbooks (2022 to present)
    - Extract: Generic ACCU spot price series, quarterly issuance volumes,
      ACCU holdings by entity type, surrender volumes, SMC data
    - Store in SQLite with data_quality='genuine_quarterly' for quarterly data
      and 'genuine_daily' if daily price series are in the workbooks

1b. Scrape CORE Markets daily ACCU price:
    - Navigate to https://coremarkets.co/resources/market-prices
    - Extract daily Generic ACCU spot prices (free tier data)
    - Store with data_quality='genuine_daily'

1c. Scrape CER ACCU Scheme project register:
    - Extract: project count by methodology, crediting period end dates,
      total issuance by methodology
    - Identify the landfill gas crediting period cliff (74 projects ending 2026)
    - Store project-level data for supply analysis

1d. Scrape DCCEEW Safeguard Mechanism data:
    - Extract: covered emissions, baseline projections, facility count,
      exceedance estimates
    - Calculate aggregate compliance demand for 2025-26 and 2026-27

1e. Write forecasting/scrapers/accu_backfill_report.json with observation
    counts, date ranges, and data quality assessment.

TASK 2: ACCU MODEL PARAMETERISATION

2a. Update forecasting/instruments/registry.py with the ACCU InstrumentConfig
    as specified in the plan document (§3.3). Calibrate OU parameters from
    the genuine price data:
    - Fit theta, mu, sigma for each regime using MLE on the daily/quarterly
      price series
    - Regime assignment: post_compliance (April-August), building (Sept-Dec),
      compliance_window (Jan-March)

2b. Implement soft upper bound in ou_bounded.py for instruments without
    has_penalty_ceiling. Instead of reflecting boundary, apply increasing
    mean-reversion force as price approaches the CCM:
    ```python
    if not config.has_penalty_ceiling and config.code == 'ACCU':
        ccm_price = 79.20  # 2024-25, CPI+2% indexed
        proximity = max(0, (price - ccm_price * 0.8) / (ccm_price * 0.2))
        adjusted_theta = theta * (1 + proximity * 3)  # triple mean-reversion near CCM
    ```

2c. Implement ACCU-specific Kalman filter observations in state_space.py:
    - Observation 1: spot_price (from CORE Markets)
    - Observation 2: issuance_volume (quarterly from CER, interpolated weekly)
    - Observation 3: price_to_ccm_ratio (spot / CCM price)

2d. Implement ACCU-specific XGBoost features in counterfactual_model.py:
    - safeguard_baseline_decline_rate (4.9% — from DCCEEW)
    - total_accu_holdings (from CER quarterly)
    - safeguard_entity_holdings_pct (from CER quarterly)
    - ccm_stock_remaining (from CER quarterly)
    - days_to_march_31 (compliance deadline proximity)
    - methodology_concentration_hhi (from project register)
    - landfill_gas_projects_ending_within_26w (supply cliff indicator)

TASK 3: ACCU MODEL TRAINING AND VALIDATION

3a. Assemble ACCU training dataset from genuine data acquired in Task 1.
    If genuine daily data has > 100 observations, use daily frequency.
    If only quarterly, interpolate to weekly (flagged as synthetic_quarterly).

3b. Train the OU model with ACCU parameters.
3c. Train XGBoost with ACCU-specific features.
3d. Run backtesting and produce ACCU ModelScorecard.
3e. Run binomial and DM tests on ACCU results.

3f. Write forecasting/analysis/ACCU_VALIDATION_REPORT.md with:
    - Genuine observation count and date range
    - Model scorecard (Naive, OU, XGBoost, Ensemble)
    - Statistical significance of directional accuracy
    - Regime-specific performance (post-compliance vs compliance window)
    - Supply cliff analysis (landfill gas crediting period endings)
    - Compliance demand projection for 2026-27

TASK 4: SMC SPREAD MODEL

4a. Create forecasting/models/smc_spread.py:
    - Model the ACCU-SMC spread as a mean-reverting process
    - Calibrate from CER quarterly data (SMCs traded at $0.50-2.00 discount)
    - SMC forecast = ACCU forecast - spread_estimate

VERIFICATION:
  cd forecasting && python -m pytest --tb=short -q
  python -c "
  from forecasting.instruments.registry import INSTRUMENT_REGISTRY
  accu = INSTRUMENT_REGISTRY.get('ACCU')
  assert accu is not None, 'ACCU not in registry'
  print(f'ACCU config: ceiling={accu.has_penalty_ceiling}, supply={accu.supply_driver}')
  "
  cat forecasting/analysis/ACCU_VALIDATION_REPORT.md | head -40
  npm run build 2>&1 | tail -3

COMMIT:
  git add -A && git commit -m "ACCU forecasting model — trained and validated"
  git tag forecasting-accu-model
  Update TASK_LOG.md. Next: Session I (VCM benchmark model).
```

### 8.2. Session I — VCM Benchmark and Tokenised Credit Model

```
You are working on the WREI Trading Platform forecasting system.
Read context:
  cat TASK_LOG.md
  cat forecasting/analysis/ACCU_VALIDATION_REPORT.md

This session builds the international voluntary carbon credit benchmark model
and the tokenised carbon credit pricing layer. Complete ALL tasks.

TASK 1: VCM BENCHMARK DATA ACQUISITION

1a. Scrape CBL/Xpansiv data:
    - Navigate to https://www.xpansiv.com and CBL market data pages
    - Extract GEO, N-GEO, C-GEO spot prices and volumes where publicly available
    - If direct data is not freely accessible, scrape price references from
      CORE Markets monthly reports, CER quarterly reports (which reference
      international carbon prices), and Carbon Pulse / Carbon Herald articles
    - Store with data_quality='genuine_daily' or 'genuine_weekly'

1b. Scrape Verra VCS registry statistics:
    - Navigate to https://registry.verra.org
    - Extract: total VCUs issued, retired, and available by project type
    - Calculate retirement rate trends (indicator of demand)

1c. Scrape Climate Focus VCM Dashboard:
    - Navigate to https://climatefocus.com/initiatives/voluntary-carbon-market-dashboard/
    - Extract consolidated VCM metrics

1d. Write forecasting/scrapers/vcm_backfill_report.json.

TASK 2: VCM INSTRUMENT CONFIGURATIONS

2a. Add GEO (Global Emissions Offset) InstrumentConfig:
    - code: "GEO"
    - market_type: "voluntary"
    - has_penalty_ceiling: False
    - supply_driver: "project_issuance"
    - demand_driver: "corporate_voluntary"
    - regime_names: ["risk_off", "balanced", "quality_rotation"]
    - OU parameters calibrated from scraped GEO price data

2b. Add N-GEO (Nature-based) InstrumentConfig:
    - Same structure, different OU parameters (higher volatility,
      nature-based premium dynamics)

2c. Add C-GEO (Technology-based) InstrumentConfig:
    - Same structure, lower volatility, CORSIA-demand driven

TASK 3: VCM MODEL TRAINING

3a. Train OU models for GEO, N-GEO, C-GEO using scraped data.
    If data is insufficient for full model training (< 50 observations),
    create stub configurations with estimated parameters from published
    market reports and flag for future calibration.

3b. For XGBoost, use macro features:
    - corporate_netzero_announcement_index (scrape-derived if possible)
    - vcu_retirement_rate_trend (from Verra registry)
    - corsia_phase_timeline (manually configured)
    - eu_ets_price (if available — cross-market indicator)
    - quality_premium_spread (N-GEO vs C-GEO)

3c. Write forecasting/analysis/VCM_VALIDATION_REPORT.md.

TASK 4: TOKENISED CARBON CREDIT PRICING MODEL

4a. Create forecasting/models/token_pricing.py (expand from Session D stub):

    class TokenPricingModel:
        def forecast(self, underlying_forecast, token_config):
            """
            Token price = underlying × (1 + quality_premium)
                        × (1 + verification_premium)
                        × (1 - liquidity_discount)
                        × (1 + defi_demand_premium)
            """

4b. Create token configurations:
    - WREI-CC: verification_premium=0.50, liquidity_discount=0.15, underlying="ACCU"
    - BCT: verification_premium=0.0, liquidity_discount=0.05, underlying="GEO"
    - NCT: verification_premium=0.0, liquidity_discount=0.05, underlying="N-GEO"

4c. Scrape on-chain token prices from CoinGecko API:
    ```python
    # CoinGecko free API for BCT, NCT, KLIMA, MCO2 prices
    # GET https://api.coingecko.com/api/v3/coins/{id}/market_chart
    ```
    Store historical token prices for validation.

4d. Validate token pricing model against observed BCT/NCT prices:
    - Compare model output (underlying GEO × adjustment factors) vs actual BCT/NCT
    - Report the basis (model price - actual price) and its distribution
    - Calibrate liquidity_discount and defi_demand_premium to minimise basis

TASK 5: WREI-ACO YIELD MODEL

5a. Create forecasting/models/aco_yield.py (expand from Session D stub):

    class ACOYieldModel:
        def calculate_nav(self, carbon_price_trajectory, fleet_params):
            """
            DCF model for WREI Asset Co token NAV.
            Uses carbon price trajectory from ACCU/VCM model.
            """

        def scenario_analysis(self, accu_forecast, fleet_params):
            """
            Returns base, bull, bear NAV scenarios.
            Bull = 80% CI upper carbon price
            Bear = 80% CI lower carbon price
            Sensitivity = NAV change per A$1 ACCU price change
            """

5b. Use fleet parameters from WR-STR-008 / WR-FIN-001:
    - Gross yield: 12.9%
    - Equity yield: 28.3%
    - Operating cost ratio: ~45%
    - Carbon credit contribution: variable (from forecast)

5c. Write forecasting/analysis/ACO_YIELD_REPORT.md with:
    - Base/bull/bear NAV scenarios
    - Sensitivity to carbon price
    - Comparison to RWA token yield benchmarks (BUIDL ~4.8% APY, OUSG ~4% APY)

TASK 6: CROSS-INSTRUMENT CORRELATION MATRIX

6a. Create forecasting/analysis/cross_instrument_correlation.py:
    - Compute price correlation matrix across all instruments with genuine data
    - Identify leading/lagging relationships (does ACCU lead ESC? Does GEO lead BCT?)
    - Report correlation coefficients and time lags

6b. Write forecasting/analysis/CROSS_INSTRUMENT_REPORT.md.

VERIFICATION:
  cd forecasting && python -m pytest --tb=short -q
  python -c "
  from forecasting.instruments.registry import INSTRUMENT_REGISTRY
  for code in ['ACCU', 'GEO', 'N-GEO', 'C-GEO']:
      config = INSTRUMENT_REGISTRY.get(code)
      status = 'configured' if config else 'MISSING'
      print(f'{code}: {status}')
  "
  python -c "
  from forecasting.models.token_pricing import TokenPricingModel
  m = TokenPricingModel()
  result = m.forecast(underlying_forecast=35.0, token_config={'verification_premium': 0.5, 'liquidity_discount': 0.15})
  print(f'WREI-CC forecast: A\${result:.2f} (underlying A\$35.00)')
  "
  npm run build 2>&1 | tail -3

COMMIT:
  git add -A && git commit -m "VCM benchmark + tokenised credit pricing + ACO yield model"
  git tag forecasting-multi-market
  Update TASK_LOG.md.
```

---

## 9. Risk Assessment

### 9.1. Data Access Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| CORE Markets free tier data insufficient | Medium | Fall back to CER quarterly data (lower frequency) |
| CBL/Xpansiv data behind paywall | High | Use published references from broker reports, CER reports |
| CoinGecko API rate limits | Low | Cache aggressively, use daily resolution |
| CER registry scraping blocked | Low | Use published XLSX data workbooks instead |

### 9.2. Model Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| ACCU model overfits to compliance cycle | High | Hold out one full compliance year for validation |
| VCM model lacks sufficient data | High | Start with Tier 1 benchmarks only, defer Tier 2/3 |
| Token pricing model ignores DeFi-specific dynamics | Medium | Monitor basis vs actuals, recalibrate quarterly |
| ACO yield model assumptions are speculative | Medium | Label as indicative, sensitivity analysis on all inputs |

---

*End of forecast extension plan.*
