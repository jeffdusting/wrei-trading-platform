# WREI Forecasting System — Comprehensive Advancement Plan

**Document Reference:** WR-ASS-014 | **Version:** 2.0 | **Date:** 7 April 2026
**Classification:** Internal — Strategic & Technical Plan
**Prepared for:** Jeff Dusting, CEO — Water Roads Pty Ltd
**Inputs:** Verification Report (7 April 2026), WR-ASS-012 (Assessment), WR-ASS-013 (Critique)

---

## 1. Verification Outcome and Audit Findings

The independent verification returned **PASS WITH CAVEATS**. Core implementation is correct — 50 tests pass, penalty rates are IPART-sourced and consistent across files (ESC 2026: A$35.86, VEEC 2026: A$100.00), all training data is flagged as synthetic, penalty ceiling enforcement is robust, and the signal pipeline correctly accepts relevant documents and rejects irrelevant ones.

Three items require remediation: two missing analysis artefacts (`feature_independence_report.json`, `ensemble_weight_history.json`) that were never persisted to disk despite the underlying functionality working, a forward curve that produces a flat line when invoked without pipeline context (technically correct but misleading), and a legacy penalty rate value (A$29.48) in an inline self-test in `ou_bounded.py`. These are addressed in CC Session A (§7.1).

---

## 2. Black Hat Critique

The following is the case an informed sceptic would make against the model — an investment banker during due diligence, a competing broker's data scientist, or an IPART compliance officer looking for overreach.

### 2.1. Synthetic Validation Is Circular

Every observation in the training set is interpolated from monthly or annual aggregates. The backtesting metrics (3.6% MAPE, 62% directional accuracy, A$142,680 decision value) measure how well the model predicts values it was trained to reproduce. The A$500,000 annual value projection for Northmore Gordon is extrapolated from this circular validation. Until the model is validated against genuine weekly prices, the accuracy claims are indefensible under due diligence scrutiny.

### 2.2. The Naive Model Is a Serious Challenge

In a low-volatility market with a hard penalty ceiling, "tomorrow's price equals today's price" achieves 2.0% MAPE — better than the ensemble's 3.6%. The model's claimed advantage is 62% directional accuracy, but the statistical significance of that advantage over random chance has not been tested. The sample size (260 synthetic weekly periods) likely supports the claim (p < 0.001 on a binomial test), but nobody has run the test or reported the result.

### 2.3. AI Signal Extraction Is Uncalibrated

The signal extractor calls Claude to produce numeric impact estimates (`supply_impact_pct: -0.3`). There is no empirical basis for the relationship between a parsed document's language and the actual market impact. The `signal_confidence` field is the model's self-assessed confidence in its own extraction — not an externally validated accuracy measure. Without a validation set of historical documents with known outcomes, the signal pipeline adds complexity and API cost without proven forecast value.

### 2.4. Shadow Market Estimation Is Single-Source

The 1.6× shadow multiplier derives from NMG's self-reported inventory data and self-reported 8.65% market share. If NMG's inventory behaviour is not representative of the broader market, the shadow estimate could be materially wrong. The TESSA transfer velocity cross-validation is a proxy, not a direct measurement.

### 2.5. Ensemble May Be Single-Model

If the ensemble weight history shows convergence to one extreme (Bayesian weight consistently above 0.85 or below 0.15), the "three-model ensemble" narrative is a marketing label on a single model. The infrastructure to detect this exists but the weights have never been persisted or examined.

### 2.6. Commercial Value Assumes Price-Taker Behaviour

The A$500,000+ value projection assumes the broker can execute at forecast prices. In a market with approximately 120,000 ESCs traded per week, a single 50,000-certificate trade is roughly 40% of weekly volume. At that scale, the model's recommendations would move the market, invalidating the forecast the recommendation was based on.

### 2.7. ESC-Only Architecture Cannot Scale

The current model is hardcoded to ESC market structure — penalty ceiling, IPART activity mix, TESSA settlement. None of these concepts apply to ACCUs (no penalty ceiling, Safeguard Mechanism demand, CER registry, $79.20 CCM soft ceiling), VCUs (voluntary market, project-based supply, Verra/Gold Standard verification), or tokenised credits (blockchain settlement, cross-chain liquidity). Extending to carbon trading requires re-architecting from ESC-specific to instrument-agnostic.

---

## 3. Genuine Data — Available Now

The earlier proposal to wait 12 weeks for data accumulation was wrong. The data exists on public websites and can be backfilled immediately.

### 3.1. Available Sources

3.1.1. **Ecovantage weekly market updates** — spot prices for ESC, VEEC, LGC, STC, ACCU, PRC with weekly commentary, published on their website going back to at least mid-2022. The existing `ecovantage_scraper.py` needs a historical mode that iterates through archived pages.

3.1.2. **Northmore Gordon** — equivalent weekly spot prices for cross-validation.

3.1.3. **CER Quarterly Carbon Market Reports** — ACCU spot price data, issuance volumes, and quarterly trading activity going back to 2012. Downloadable XLSX data workbooks.

3.1.4. **CORE Markets** — daily generic ACCU spot prices on their website (free tier).

3.1.5. **Shell Energy / other broker market updates** — Shell Energy published a detailed certificates market update (March 2024) with ESC, VEEC, LGC, STC, and ACCU price data and commentary. Similar publications from other brokers provide additional cross-validation sources.

3.1.6. **IPART annual compliance reports** — annual creation, surrender, and surplus figures for each ESS compliance year. Already used for synthetic data; the genuine weekly prices from 3.1.1–3.1.2 replace the interpolation.

### 3.2. Expected Yield

Backfilling from Ecovantage alone should produce approximately 150–180 genuine weekly spot price observations for ESCs (mid-2022 to present), with VEEC, LGC, STC, and ACCU prices for most of those weeks. CER quarterly reports add ACCU-specific data going back further. Cross-validation against NMG provides quality assurance on every data point.

### 3.3. Backfill and Validation Sequence

The backfill, data assembly replacement, and model validation run in a single CC session (§7.2) without manual intervention. The scrapers exist, the SQLite schema exists, the data_quality infrastructure exists. CC extends the scrapers with historical mode, executes the backfill, replaces synthetic data where genuine observations exist, and runs the first real validation — producing genuine MAPE, directional accuracy, and decision value numbers.

---

## 4. Multi-Instrument Forecasting Architecture

### 4.1. Instrument Configuration Schema

Each instrument is defined by a configuration object that parameterises all model components, replacing the current hardcoded ESC assumptions.

```python
@dataclass
class InstrumentConfig:
    code: str                           # ESC, VEEC, ACCU, LGC, STC, WREI-CC
    name: str
    currency: str                       # AUD, USD
    market_type: str                    # compliance, voluntary, hybrid

    # Price boundary structure
    has_penalty_ceiling: bool           # True for ESC/VEEC, False for ACCU/LGC
    penalty_rate: Optional[float]       # Current ceiling (ESC: 35.86, VEEC: 100.00)
    penalty_rate_source: Optional[str]  # "IPART CPI-adjusted" / "ESC Victoria" / None
    price_floor: float                  # Minimum plausible price

    # Supply dynamics
    supply_driver: str                  # "activity_creation" / "project_issuance" / "generation"
    supply_data_source: str             # "IPART" / "CER" / "CER+ANREU" / "simulation"
    known_supply_shocks: list           # [{"event": "CL phase-out", "date": "2026-12-31", "impact_pct": -0.22}]

    # Demand dynamics
    demand_driver: str                  # "surrender_obligation" / "safeguard_compliance" / "rpt_target"
    compliance_deadlines: list          # [{"date": "06-30", "label": "Q2 surrender"}, ...]
    demand_data_source: str

    # Regime structure
    regime_count: int
    regime_names: list                  # ["surplus", "balanced", "tightening"]
    ou_parameters: dict                 # Per-regime theta, mu, sigma

    # Data sources
    price_scrapers: list                # ["ecovantage", "northmore_gordon", "core_markets"]
    volume_scrapers: list               # ["ipart", "tessa", "cer_registry"]

    # Settlement
    settlement_type: str                # "registry" / "anreu" / "blockchain"
    settlement_registry: str            # "TESSA" / "ANREU" / "Verra" / "zConnect"
```

### 4.2. Model Component Generalisation

4.2.1. **Bounded OU model** — reflecting boundary conditional on `has_penalty_ceiling`. For ACCUs (no hard ceiling), use a soft upper bound at the historical 99th percentile. For LGCs (no regulatory ceiling), use an unbounded OU with increased volatility.

4.2.2. **Kalman filter** — state vector structure (surplus, momentum, demand pressure, regime indicator) applies across compliance instruments with different observation mappings. For ACCUs, observations are spot price, issuance volume, and price-to-CCM ratio (the CCM price of $79.20 indexed by CPI+2% is analogous to ESC's penalty rate but is a soft ceiling with limited stock). For LGCs, observations are spot price, generation volume, and RET shortfall.

4.2.3. **XGBoost** — common features (price, momentum, seasonality) plus instrument-specific features (activity mix for ESCs, methodology mix for ACCUs, capacity pipeline for LGCs). Signal extractor output is common across instruments.

4.2.4. **Ensemble** — instrument-agnostic weighted combiner with per-instrument weight history.

### 4.3. Instrument-Specific Configurations

Four instruments in the first expansion phase, plus two tokenised instruments:

4.3.1. **ESC** — current model refactored to use InstrumentConfig. No new modelling.

4.3.2. **VEEC** — Victorian-specific penalty rate (A$100.00), ESC Victoria compliance calendar, VEU activity mix. Reflecting boundary active but further from spot than ESC.

4.3.3. **ACCU** — no hard penalty ceiling (CCM at ~$79.20 is soft, limited stock). Supply driven by CER project issuance (quarterly cadence, 18.8M issued in 2024). Demand driven by Safeguard Mechanism compliance (annual March 31 deadline, baselines declining 4.9%/year). Regime structure captures the Safeguard demand cycle: pre-compliance buildup, compliance window pressure, post-compliance easing. Spot price averaged ~$35 in 2024, peaked at $42.50 in November 2024. The market is expected to tighten as baselines decline and demand increases — ANZ forecasts $70/tonne by end of 2025.

4.3.4. **LGC** — compliance demand from the Renewable Energy Target, supply from large-scale renewable generation. Structural transition from undersupply to oversupply as pipeline delivers. Spot around $3.05–$3.75 in early 2026.

### 4.4. Tokenised Instruments

4.4.1. **WREI-CC** — price forecast is a function of the underlying certificate forecast (ACCU or VCU) plus the 1.5× WREI verification premium (per WR-STR-008) minus a liquidity discount (new platform, thin initial liquidity). The forecasting model for WREI-CC derives from the ACCU/VCU model, not from independent price discovery.

4.4.2. **WREI-ACO** — infrastructure yield token. Not a certificate market forecast; it is a project finance DCF model with Monte Carlo simulation on fleet utilisation, route revenue, and operating costs. The forecasting system provides carbon price trajectory context that feeds into the ACO yield model, but the ACO price is a separate analytical module.

4.4.3. **Cross-instrument correlation** — tokenised credits backed by underlying certificates will have price correlation with those certificates. The model captures the basis risk (token price diverging from underlying due to liquidity, platform, or settlement factors) and adjusts confidence intervals accordingly.

---

## 5. Advancement Roadmap

### 5.1. Immediate — Weeks 1–2

5.1.1. **Audit remediation + statistical significance + ensemble investigation.** CC Session A (§7.1). Persists missing artefacts, fixes forward curve degeneracy, corrects legacy penalty rate, adds binomial and Diebold-Mariano tests, investigates ensemble weight convergence, adds weight constraint if needed.

5.1.2. **Historical scraper development + backfill + genuine validation.** CC Session B (§7.2). Extends scrapers with historical mode, executes the backfill, replaces synthetic data with genuine observations, runs the first real model validation, produces genuine MAPE/directional accuracy/decision value.

### 5.2. Short-Term — Weeks 3–6

5.2.1. **Signal extraction validation set.** Curate 20–30 historical documents with known market impact (IPART announcements, ESS Rule changes, activity phase-outs). Run the signal extractor, compare predicted vs actual impact, produce a calibration curve. CC Session C (§7.3).

5.2.2. **Market impact modelling.** Add price impact function: `adjusted_value = raw_value * (1 - (trade_volume / weekly_market_volume) * impact_coefficient)`. Calibrate from NMG historical trade data. Same CC session.

5.2.3. **Probabilistic scenario narratives.** AI-generated plain-English narrative layer grounded in the specific signals driving the forecast. Uses existing AI service router with Sonnet 4. Same CC session.

5.2.4. **Instrument configuration schema + ESC refactor.** Implement InstrumentConfig, refactor ESC model to use it. CC Session D (§7.4).

### 5.3. Medium-Term — Weeks 7–14

5.3.1. **VEEC model parameterisation and validation.** Victorian-specific configuration, validated against genuine VEEC weekly prices from the Ecovantage backfill.

5.3.2. **ACCU data pipeline + model training.** Download CER quarterly report data workbooks, extract ACCU price and issuance series, build ACCU instrument configuration with Safeguard demand dynamics, train and validate against genuine ACCU price data.

5.3.3. **Broker trade data feedback loop.** If a white-label agreement is in place, build the anonymised trade execution data integration. Real trade prices at real volumes are the highest-quality training data and solve the synthetic data problem fastest.

### 5.4. Longer-Term — Weeks 15+

5.4.1. **LGC/STC models** — RET compliance structure, generation capacity pipeline as supply driver.

5.4.2. **Tokenised credit forecasting** — WREI-CC as derivative of underlying certificate forecast, basis risk module, liquidity discount calibration.

5.4.3. **WREI-ACO yield model** — infrastructure token DCF with carbon price trajectory input from the forecasting system.

5.4.4. **Cross-instrument leading indicators** — wholesale electricity prices (AEMO) and gas prices as XGBoost features. Hypothesis: gas price spikes → increased heat pump installations → increased ESC/VEEC creation → supply pressure → price impact, operating at 4–12 week lag.

5.4.5. **Global VCM integration** — Ecosystem Marketplace, CBL/Xpansiv, ICE data feeds for international voluntary carbon credit pricing. Separate model structure for VCU dynamics (corporate net-zero commitments, Article 6, registry-specific premiums).

---

## 6. Relationship Between Critique and Roadmap

Each black hat criticism maps directly to a roadmap item.

| Critique | Addressed By | Timeline |
|----------|-------------|----------|
| §2.1 Synthetic validation is circular | §5.1.2 Genuine data backfill + validation | Weeks 1–2 |
| §2.2 Naive model challenge | §5.1.1 Statistical significance tests | Week 1 |
| §2.3 Signal extraction uncalibrated | §5.2.1 Signal validation set + calibration | Weeks 3–6 |
| §2.4 Shadow market single-source | §5.3.3 Broker trade data feedback | Weeks 7–14 |
| §2.5 Ensemble may be single-model | §5.1.1 Ensemble weight investigation | Week 1 |
| §2.6 Market impact ignored | §5.2.2 Market impact modelling | Weeks 3–6 |
| §2.7 ESC-only cannot scale | §5.2.4–§5.4 Multi-instrument architecture | Weeks 3–15+ |

---

## 7. CC Execution Prompts

The following prompts are designed to be stored in `docs/forecasting-advancement/` in the project directory, following the same pattern as the improvement programme. Each session executes fully without manual intervention. Use the same bootstrap prompt — CC reads `TASK_LOG.md` to determine which session to run.

### 7.1. CC Session A — Audit Remediation and Statistical Foundation

```
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
```

### 7.2. CC Session B — Historical Backfill and Genuine Validation

```
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
```

### 7.3. CC Session C — Signal Calibration, Market Impact, Scenario Narratives

```
You are working on the WREI Trading Platform forecasting system.
Read context:
  cat TASK_LOG.md
  cat forecasting/analysis/GENUINE_VALIDATION_REPORT.md

This session calibrates the signal extractor, adds market impact modelling,
and implements scenario narrative generation. Complete ALL tasks.

TASK 1: SIGNAL EXTRACTION VALIDATION SET

1a. Create forecasting/calibration/signal_validation_set.json containing
    20-30 historical documents where the actual ESC market impact is known.
    Source these from the Ecovantage and IPART archives already in the
    intelligence database, plus the following known events:

    - IPART ESS Rule change September 2025 (creation method changes)
    - Commercial lighting (CLESF) method end date: 31 March 2026
    - SONA method end date: 30 November 2025
    - IHEAB monthly reporting requirement: October 2025
    - F8/F9 gas boiler activity end date: 30 June 2026
    - HEER heat pump warranty requirement: 1 December 2025
    - ESS doorknocking ban: 12 September 2025

    For each document, record:
    - document_url, title, published_date
    - actual_price_change_4w, actual_price_change_12w (from genuine data)
    - actual_creation_volume_change_pct (if measurable)
    - expected_signal_direction ("tightening" or "surplus")

    If the IPART/Ecovantage documents for these events are in the SQLite DB,
    use them. If not, scrape them directly.

1b. Run the signal extractor on each validation document.
    Compare predicted supply_impact_pct and demand_impact_pct against
    observed outcomes.

1c. Compute a calibration adjustment:
    - If extractor consistently overpredicts impact by factor X,
      apply a scaling factor of 1/X to future signal outputs
    - If extractor direction accuracy is below 60%, flag as unreliable

1d. Write results to forecasting/analysis/signal_calibration_report.md
    and save the calibration scaling factors to
    forecasting/calibration/signal_calibration.json.

1e. Update ai_signal_extractor.py to apply the calibration scaling
    factors when they exist on disk.

TASK 2: MARKET IMPACT MODELLING

2a. In forecasting/models/market_impact.py (new file), implement:

    def estimate_market_impact(
        trade_volume: int,
        instrument: str,
        weekly_market_volume: Optional[int] = None
    ) -> float:
        """Returns impact coefficient 0-1, where 0 = no impact, 1 = full impact."""

    Default weekly_market_volume estimates:
    - ESC: 120,000 (derived from ~6.4M annual creation / 52 weeks)
    - VEEC: 85,000 (from ~4.4M annual target / 52)
    - ACCU: 360,000 (from ~18.8M annual issuance / 52)
    - LGC: estimate from Ecovantage data if available

    Impact formula:
    volume_fraction = trade_volume / weekly_market_volume
    impact = volume_fraction * IMPACT_COEFFICIENT  # start with 0.5
    adjusted_value = raw_value * (1 - impact)

2b. Integrate into the ensemble forecast output: add an
    adjusted_decision_value field to the ModelScorecard that applies
    the market impact adjustment to the raw decision value.

2c. Recalculate the NMG counterfactual value (A$142,680) with market
    impact applied. Log the adjusted figure.

TASK 3: PROBABILISTIC SCENARIO NARRATIVES

3a. Create forecasting/narratives/scenario_narrator.py with a method:

    def generate_forecast_narrative(
        forecast: dict,
        active_signals: list,
        regime_probabilities: dict,
        instrument: str = "ESC"
    ) -> str:

    This calls Claude Sonnet 4 via the AI service router (or direct API
    if router is unavailable) with a prompt that produces a 3-paragraph
    plain-English narrative explaining:
    - What the forecast says and what is driving it
    - The key risks and signals that could change the outlook
    - What a broker should consider doing in the current regime

    Use conciseness directive. Max 512 tokens. Temperature 0.3.

3b. Add the narrative to the forecast pipeline output in
    generate_forecast.py — store as a text field alongside the
    numeric forecast.

3c. Test with a sample forecast and print the narrative to confirm
    it reads naturally and cites specific signals.

VERIFICATION:
  cd forecasting && python -m pytest --tb=short -q
  cat forecasting/analysis/signal_calibration_report.md
  python -c "
  from forecasting.models.market_impact import estimate_market_impact
  impact = estimate_market_impact(50000, 'ESC')
  print(f'Market impact for 50k ESC trade: {impact:.3f}')
  "
  python -c "
  from forecasting.narratives.scenario_narrator import generate_forecast_narrative
  print('Narrative module imports successfully')
  "
  npm run build 2>&1 | tail -3

COMMIT:
  git add -A && git commit -m "Signal calibration + market impact + scenario narratives"
  Update TASK_LOG.md. Next: Session D (Multi-instrument architecture).
```

### 7.4. CC Session D — Multi-Instrument Architecture

```
You are working on the WREI Trading Platform forecasting system.
Read context:
  cat TASK_LOG.md
  cat forecasting/analysis/GENUINE_VALIDATION_REPORT.md

This session refactors the forecasting system from ESC-specific to
instrument-agnostic and parameterises the first additional instruments.
Complete ALL tasks.

TASK 1: INSTRUMENT CONFIGURATION SCHEMA

1a. Create forecasting/instruments/__init__.py and
    forecasting/instruments/config.py containing the InstrumentConfig
    dataclass as specified in §4.1 of the advancement plan
    (docs/forecasting-advancement/WREI-Comprehensive-Advancement-Plan.md).

1b. Create forecasting/instruments/registry.py with an
    INSTRUMENT_REGISTRY dict mapping instrument codes to InstrumentConfig
    instances. Start with ESC using values extracted from the current
    hardcoded parameters in state_space.py, ou_bounded.py, and
    counterfactual_model.py.

1c. Add VEEC configuration with:
    - penalty_rate: 100.00
    - penalty_rate_source: "ESC Victoria / Victorian Energy Efficiency Target Regulations"
    - supply_driver: "activity_creation"
    - demand_driver: "surrender_obligation" (VEU annual compliance)
    - ou_parameters: distinct from ESC (wider spread from ceiling)

1d. Add ACCU configuration with:
    - has_penalty_ceiling: False
    - supply_driver: "project_issuance"
    - demand_driver: "safeguard_compliance"
    - compliance_deadlines: [{"date": "03-31", "label": "Safeguard annual surrender"}]
    - ou_parameters: calibrated from CER quarterly price data
      (theta ~0.05, mu ~35.00, sigma ~2.50 for balanced regime — adjust
      based on actual observed volatility from the backfilled CER data)
    - settlement_type: "anreu"

1e. Add LGC skeleton configuration (parameters to be calibrated when
    LGC genuine data is available).

TASK 2: MODEL REFACTORING

2a. In ou_bounded.py, refactor the constructor to accept an
    InstrumentConfig parameter. Extract penalty_rate, regime parameters,
    and boundary type from the config rather than hardcoded values.
    Maintain backward compatibility — if no config is provided,
    default to the ESC configuration from the registry.

2b. In state_space.py, refactor to accept InstrumentConfig.
    The observation mapping (H matrix) should be configurable
    per instrument. For ACCUs, the price-to-penalty observation
    is replaced with price-to-CCM (using 79.20 as the reference).
    Maintain backward compatibility.

2c. In counterfactual_model.py, refactor to accept InstrumentConfig.
    The feature set should load instrument-specific features from
    the config. Maintain backward compatibility.

2d. In ensemble_forecast.py, refactor to accept InstrumentConfig.
    The penalty ceiling cap uses config.penalty_rate if
    config.has_penalty_ceiling, otherwise applies the soft upper bound.
    Maintain backward compatibility.

2e. In generate_forecast.py, add an instrument parameter to run_pipeline()
    that defaults to 'ESC'. The pipeline loads the instrument config
    from the registry and passes it to all model components.

TASK 3: ACCU MODEL TRAINING (if genuine ACCU data exists)

3a. Check if CER ACCU price data exists in the SQLite database
    from Session B's backfill.

3b. If ACCU data exists with > 20 genuine observations:
    - Assemble an ACCU-specific dataset
    - Train the OU model with ACCU parameters
    - Train XGBoost with ACCU-specific features
    - Run backtesting and produce an ACCU ModelScorecard
    - Write results to forecasting/analysis/ACCU_VALIDATION_REPORT.md

3c. If insufficient ACCU data, log this and create a stub report
    noting what data is needed and from which sources.

TASK 4: WREI-CC DERIVATIVE MODEL

4a. Create forecasting/models/token_pricing.py with:

    def forecast_wrei_cc(
        underlying_forecast: dict,  # ACCU or VCU forecast
        verification_premium: float = 1.5,
        liquidity_discount: float = 0.15,
        basis_risk_adjustment: float = 0.05
    ) -> dict:
        """
        WREI-CC price = underlying * verification_premium * (1 - liquidity_discount)
        CI bands widened by basis_risk_adjustment to capture token/underlying divergence.
        """

4b. Create forecasting/models/aco_yield.py with a stub:

    def forecast_wrei_aco(
        carbon_price_trajectory: list,  # from forecasting system
        fleet_utilisation: float = 0.75,
        route_revenue_per_trip: float = 15.0,
        operating_cost_ratio: float = 0.45
    ) -> dict:
        """
        Stub for WREI-ACO yield model. Returns indicative yield based on
        carbon price trajectory and fleet assumptions. Full DCF model
        to be implemented when fleet operational parameters are finalised.
        """

VERIFICATION:
  cd forecasting && python -m pytest --tb=short -q
  python -c "
  from forecasting.instruments.registry import INSTRUMENT_REGISTRY
  for code, config in INSTRUMENT_REGISTRY.items():
      print(f'{code}: penalty_ceiling={config.has_penalty_ceiling}, '
            f'supply={config.supply_driver}, demand={config.demand_driver}')
  "
  python -c "
  from forecasting.models.ou_bounded import BoundedOUModel
  from forecasting.instruments.registry import INSTRUMENT_REGISTRY
  # Test ESC (backward compatible)
  m1 = BoundedOUModel()
  print('ESC model: OK')
  # Test ACCU (new)
  m2 = BoundedOUModel(instrument_config=INSTRUMENT_REGISTRY['ACCU'])
  print('ACCU model: OK')
  "
  python -c "
  from forecasting.models.token_pricing import forecast_wrei_cc
  result = forecast_wrei_cc({'price': 35.0, 'ci_80': (30.0, 40.0)})
  print(f'WREI-CC forecast: {result}')
  "
  npm run build 2>&1 | tail -3

COMMIT:
  git add -A && git commit -m "Multi-instrument architecture + ACCU + tokenised credit models"
  git tag forecasting-multi-instrument
  Update TASK_LOG.md.
```

---

*End of comprehensive advancement plan.*
