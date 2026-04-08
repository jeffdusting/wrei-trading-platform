# Session D: Multi-Instrument Architecture

**Prerequisites:** Session C committed to TASK_LOG
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` or `TASK_LOG.md` for model context. Only re-read files you are modifying.

---

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
