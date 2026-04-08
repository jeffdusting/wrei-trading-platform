# Session B: Historical Backfill and Genuine Validation

**Prerequisites:** Session A committed to TASK_LOG
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` or `TASK_LOG.md` for model context. Only re-read files you are modifying.

---

You are working on the WREI Trading Platform forecasting system.
Read context:
  cat TASK_LOG.md
  cat forecasting/analysis/DISCOVERY_SUMMARY.md 2>/dev/null || echo "No discovery summary"

This session backfills genuine weekly market data and validates the model
against real observations. Complete ALL tasks. Do not stop for confirmation.

TASK 1: HISTORICAL SCRAPER DEVELOPMENT

1a. Read forecasting/scrapers/ecovantage_scraper.py.
    Add a method scrape_historical(start_date: str, end_date: str)
    that fetches Ecovantage's weekly market update archive pages.

    Target URL pattern: https://www.ecovantage.com.au/energy-certificate-market-update/
    and paginated archives (page/2/, page/3/, etc.)

    For each weekly update page, extract:
    - Publication date
    - ESC spot price (or price range — take midpoint)
    - VEEC spot price
    - LGC spot price
    - STC spot price
    - ACCU spot price (if reported)
    - PRC spot price (if reported)
    - ESC creation volume (if reported)

    Use requests + BeautifulSoup. Handle 404s and network errors gracefully.
    Store results as ScrapedDocument instances with content_hash.

1b. Read forecasting/scrapers/northmore_scraper.py.
    Add equivalent scrape_historical() for NMG's published price archive.
    Target: https://northmoregordon.com/articles/ filtered for market updates.

1c. Read forecasting/scrapers/cer_scraper.py.
    Add a method scrape_quarterly_reports() that downloads CER Quarterly
    Carbon Market Report data workbooks (XLSX) from:
    https://cer.gov.au/markets/reports-and-data/quarterly-carbon-market-reports
    Extract ACCU spot price series and issuance volumes from each workbook.

TASK 2: EXECUTE BACKFILL

2a. Run ecovantage historical scraper for 2022-01-01 to present.
    Store all results in the SQLite intelligence database at
    forecasting/data/intelligence_documents.db with data_quality='genuine_weekly'.

    Log: total documents fetched, date range covered, instruments found,
    any errors encountered.

2b. Run NMG historical scraper for 2022-01-01 to present.
    Store with data_quality='genuine_weekly'.

2c. Cross-validate: for weeks where both Ecovantage and NMG report ESC
    spot prices, compare and flag any discrepancy exceeding A$0.50.
    Log cross-validation results.

2d. Run CER quarterly report scraper. Store ACCU price and volume data.

2e. Create forecasting/scrapers/backfill_report.json summarising:
    {
      "ecovantage_observations": N,
      "nmg_observations": N,
      "cer_accu_observations": N,
      "date_range": {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"},
      "cross_validation": {
        "weeks_compared": N,
        "discrepancies_over_050": N,
        "max_discrepancy": X.XX
      },
      "instruments_covered": ["ESC", "VEEC", ...]
    }

TASK 3: DATA ASSEMBLY UPDATE

3a. In forecasting/data_assembly.py, add a method load_genuine_observations()
    that reads genuine weekly prices from the SQLite database and returns
    a DataFrame with the same column structure as the synthetic dataset.

3b. Add a method assemble_hybrid_dataset() that:
    - Loads both synthetic and genuine data
    - For any week where genuine data exists, replaces the synthetic observation
    - Marks data_quality as 'genuine_weekly' or 'synthetic_monthly' accordingly
    - Returns the merged dataset

3c. Update assemble_dataset() to call assemble_hybrid_dataset() by default.
    The get_genuine_observation_count() method should now return > 0.

TASK 4: GENUINE VALIDATION

4a. Run the full backtesting engine against the hybrid dataset.
    Compute ModelScorecard for all models (ensemble, Bayesian, XGBoost, naive, SMA-4)
    on the genuine-data-only subset.

4b. Generate forecasting/analysis/GENUINE_VALIDATION_REPORT.md:

    # Genuine Data Validation Report
    ## Date: [timestamp]
    ## Genuine observations: [count]
    ## Date range: [start] to [end]

    ### Model Performance on Genuine Weekly Data

    | Metric | Naive | SMA-4 | Bayesian | XGBoost | Ensemble |
    |--------|-------|-------|----------|---------|----------|
    | MAPE (4w) | | | | | |
    | Directional Accuracy | | | | | |
    | Decision Value | | | | | |
    | Sharpe Ratio | | | | | |
    | Dir. Accuracy p-value | | | | | |

    ### Comparison: Synthetic vs Genuine Performance

    | Metric | Synthetic Backtest | Genuine Backtest | Delta |
    |--------|-------------------|------------------|-------|
    | [each metric] | | | |

    ### Verdict
    [Does the model perform better, worse, or comparably on genuine data?]
    [Is the directional accuracy advantage statistically significant on genuine data?]
    [Is the decision value positive on genuine data?]

TASK 5: REGRESSION CHECK

5a. Verify all existing tests still pass.
5b. Verify the hybrid dataset has both genuine and synthetic observations.
5c. Verify get_genuine_observation_count() returns > 0.

VERIFICATION:
  cd forecasting && python -m pytest --tb=short -q
  python -c "
  from forecasting.data_assembly import get_genuine_observation_count
  n = get_genuine_observation_count()
  print(f'Genuine observations: {n}')
  assert n > 0, 'Backfill produced no genuine observations'
  "
  cat forecasting/analysis/GENUINE_VALIDATION_REPORT.md
  cat forecasting/scrapers/backfill_report.json
  npm run build 2>&1 | tail -3

COMMIT:
  git add -A && git commit -m "Genuine data backfill + first real validation"
  git tag forecasting-genuine-validation
  Update TASK_LOG.md. Next: Session C (Signal calibration + market impact).
