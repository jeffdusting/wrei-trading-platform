# Session H: ACCU Forecasting Model

**Prerequisites:** Session G committed. `TASK_LOG.md` shows prior sessions complete.
**Context:** Read `TASK_LOG.md` and `forecasting/analysis/DISCOVERY_SUMMARY.md`. Only re-read source files you are modifying.

---

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
