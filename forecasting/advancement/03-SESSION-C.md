# Session C: Signal Calibration, Market Impact, Scenario Narratives

**Prerequisites:** Session B committed to TASK_LOG
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` or `TASK_LOG.md` for model context. Only re-read files you are modifying.

---

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
