# Session I: VCM Benchmark, Tokenised Credits, and ACO Yield Model

**Prerequisites:** Session H committed. `TASK_LOG.md` shows prior sessions complete.
**Context:** Read `TASK_LOG.md` and `forecasting/analysis/ACCU_VALIDATION_REPORT.md`. Only re-read source files you are modifying.

---

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
