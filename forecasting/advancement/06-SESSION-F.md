# Session F: Participant Intelligence and Shadow Supply Decomposition

**Prerequisites:** Session E committed. `PERFORMANCE_ANALYSIS_REPORT.md` and `PARTICIPANT_DATA_INVENTORY.md` exist.
**Context:** Read `TASK_LOG.md`, `forecasting/analysis/PERFORMANCE_ANALYSIS_REPORT.md`, and `forecasting/analysis/PARTICIPANT_DATA_INVENTORY.md` for current state. Only re-read source files you are modifying.

---

You are working on the WREI Trading Platform forecasting system.
Read context:
  cat TASK_LOG.md
  cat forecasting/analysis/PERFORMANCE_ANALYSIS_REPORT.md
  cat forecasting/analysis/PARTICIPANT_DATA_INVENTORY.md

This session builds two new forecasting intelligence modules: participant
demand/supply intelligence from institutional data, and a decomposed shadow
supply model replacing the single-multiplier estimate.

Use the data sources catalogued in PARTICIPANT_DATA_INVENTORY.md. If a source
was found accessible in Session E, scrape it now. If it was found inaccessible,
note the gap and continue with available sources.

Complete ALL tasks. Do not stop for confirmation.

TASK 1: DEMAND-SIDE PARTICIPANT INTELLIGENCE

Build a module that estimates ESC demand by tracking the institutional
behaviour of scheme participants (electricity retailers).

1a. Create forecasting/participants/__init__.py and
    forecasting/participants/demand_intelligence.py.

1b. Implement a SchemeParticipantRegistry class that:

    - Loads the IPART scheme participant list (scrape from IPART website
      or read from the file downloaded in Session E Task 5a)
    - Identifies the top participants by known or estimated liable acquisitions
    - Stores participant metadata: entity name, entity type, estimated NSW
      market share, parent company, ASX code (if listed)

    The top participants are expected to include:
    - Origin Energy (ASX: ORG)
    - AGL Energy (ASX: AGL)
    - EnergyAustralia (parent: CLP Holdings HK:0002)
    - Alinta Energy (parent: Chow Tai Fook Enterprises)
    - Red Energy / Lumo Energy (parent: Snowy Hydro, Commonwealth-owned)
    - Momentum Energy
    - Enova Energy
    Use the IPART participant list as the authoritative source; the names above
    are guidance, not a hardcoded list.

1c. Implement a RetailerObligationEstimator class that:

    - Estimates each retailer's annual ESC obligation from public data:
      obligation = liable_acquisitions_MWh × energy_conversion_factor × scheme_target
    - Sources liable acquisitions from:
      (a) Retailer annual reports (NSW electricity sales volumes)
      (b) AEMO NEM retail market data (if accessible — check PARTICIPANT_DATA_INVENTORY.md)
      (c) IPART annual compliance reports (which report total scheme target and % met)
    - If individual retailer data is unavailable, estimate market share from
      publicly available customer count data and assume proportional load
    - Calculates the aggregate demand schedule by quarter, accounting for
      the June 30 and December 31 surrender deadlines
    - Flags any retailer showing financial stress signals (from ASX announcements
      or annual report commentary) that might indicate penalty-payment preference

1d. Implement a RetailerMediaMonitor class that:

    - Scrapes public media and ASX announcements for the top 5 retailers
    - Searches for keywords: "ESS", "energy savings", "certificate",
      "surrender", "compliance", "penalty", "renewable", "NSW retail",
      "customer growth", "customer loss", "market exit"
    - Uses the existing AI signal extractor framework to parse findings
      into structured signals:
      {
        "participant_name": str,
        "signal_type": "demand_increase" | "demand_decrease" | "penalty_preference" | "compliance_surplus",
        "estimated_volume_impact": int,  # certificates affected
        "confidence": float,
        "source": str,
        "published_date": str
      }

1e. Integrate with the XGBoost feature set:
    Add the following features to the instrument config for ESC:
    - `top5_retailer_obligation_total` (aggregate estimated demand)
    - `obligation_concentration_hhi` (Herfindahl index of obligation distribution)
    - `days_to_next_surrender_deadline`
    - `retailer_stress_signal_count` (number of active stress signals)
    - `demand_media_signal_score` (net demand signal from media monitoring)

TASK 2: SUPPLY-SIDE PARTICIPANT INTELLIGENCE

Build a module that estimates ESC supply by tracking ACP creation behaviour.

2a. Create forecasting/participants/supply_intelligence.py.

2b. Implement an ACPRegistry class that:

    - Loads the IPART ACP register (scrape from the URL in
      PARTICIPANT_DATA_INVENTORY.md or read the file from Session E)
    - Parses: ACP name, accreditation status (current/cancelled/suspended),
      accredited methods, ESC creation history (total certificates created)
    - Identifies the top 10 ACPs by creation volume
    - Flags ACPs whose only accredited method is ending:
      CLESF ending 31 March 2026, SONA ended 30 November 2025,
      F8/F9 gas boiler ending 30 June 2026

2c. Implement a CreationPipelineEstimator class that:

    - Estimates the certificate creation pipeline by method:
      For each active method (HEER, IHEAB, CLESF, MBM, PIAMV, other):
      - Count of ACPs accredited for this method
      - Historical monthly creation rate (from IPART data)
      - Known end dates and eligibility changes
      - Estimated monthly creation going forward
    - Produces a 26-week forward creation schedule by method
    - Cross-references against the volume forecast model (forecasting/models/volume_forecast.py)
      and flags any material divergence

2d. Implement an ACPConcentrationAnalyser class that:

    - Calculates creation concentration (top 5 ACPs as % of total)
    - Identifies method-level concentration (e.g., if 80% of HEER creation
      comes from 3 ACPs, a single ACP exit is a material supply shock)
    - Produces a supply vulnerability score:
      high = top 3 ACPs produce >60% of creation in any single method
      medium = top 3 produce 40–60%
      low = top 3 produce <40%

2e. Integrate with the XGBoost feature set:
    - `top10_acp_creation_share` (concentration)
    - `active_acp_count` (total active ACPs — declining = supply risk)
    - `methods_ending_within_26w` (count of methods with imminent end dates)
    - `creation_pipeline_26w_total` (forward creation estimate)
    - `supply_vulnerability_score` (from concentration analysis)

TASK 3: SHADOW SUPPLY DECOMPOSITION

Replace the single-multiplier shadow estimate with a decomposed model.

3a. Create forecasting/calibration/shadow_decomposition.py.

3b. Implement a ShadowSupplyDecomposer class that estimates five distinct
    shadow supply pools:

    Pool 1: ACP Pipeline (activities completed, registration pending)
    - Estimated from: gap between IPART monthly activity reports (if available)
      and TESSA certificate registration data
    - If monthly activity data is not yet available (IHEAB monthly reporting
      started October 2025), estimate from the historical average lag between
      activity dates and registration dates
    - Typical lag: 2–6 months
    - Output: pipeline_volume_estimate, pipeline_lag_weeks

    Pool 2: ACP Inventory (registered, held by creators)
    - Estimated from: TESSA data showing certificates registered to ACP accounts
      but not yet transferred to buyers
    - If TESSA account-level data is not publicly accessible, estimate from:
      (total annual creation - total annual transfers) as a proxy for
      inventory accumulation rate
    - Output: acp_inventory_estimate

    Pool 3: Broker Inventory (registered, held by brokers/intermediaries)
    - Estimated from: NMG inventory data (existing 1.6x multiplier baseline),
      Ecovantage creation volume data, and broker weekly commentary
      mentioning inventory levels
    - Cross-validate against TESSA transfer velocity:
      if transfers are high but prices are stable, broker inventory is absorbing supply
      if transfers drop while creation continues, inventory is building
    - Output: broker_inventory_estimate, broker_inventory_direction (building/drawing_down/stable)

    Pool 4: Forward-Committed Supply (contracted but not yet delivered)
    - Estimated from: broker weekly commentary mentioning forward trades
      and forward prices (Ecovantage market updates reference forward market
      activity with contract months)
    - If forward data is available, estimate committed volume by delivery month
    - Output: forward_committed_estimate, delivery_schedule

    Pool 5: Surplus Bank (held by scheme participants beyond current obligation)
    - Estimated from: IPART annual compliance reports, which show surplus
      certificates surrendered (certificates surrendered beyond the obligation)
    - The DCCEEW statutory review noted participants surrendered 18.7M ESCs
      between 2019-2022, with penalty-equivalent shortfalls of only 274,000 —
      implying some participants hold surplus buffer stock
    - Output: participant_surplus_estimate

3c. Implement a method total_shadow_estimate() that returns:
    {
      "total_shadow_supply": sum of all 5 pools,
      "shadow_multiplier": total_shadow / tessa_visible_supply,
      "pool_breakdown": {
        "acp_pipeline": {"volume": N, "confidence": 0-1, "data_source": str},
        "acp_inventory": {"volume": N, "confidence": 0-1, "data_source": str},
        "broker_inventory": {"volume": N, "confidence": 0-1, "data_source": str, "direction": str},
        "forward_committed": {"volume": N, "confidence": 0-1, "delivery_schedule": dict},
        "participant_surplus": {"volume": N, "confidence": 0-1, "data_source": str}
      },
      "comparison_to_simple_multiplier": {
        "simple_multiplier": 1.6,
        "decomposed_multiplier": X.X,
        "divergence": X.X,
        "interpretation": str
      }
    }

3d. Integrate with the Kalman filter:
    - Replace the single `true_surplus` calculation that uses the 0.92
      registered fraction with a call to total_shadow_estimate()
    - The shadow multiplier from the decomposed model feeds directly into
      the state vector's surplus observation
    - If the decomposed model cannot run (insufficient data), fall back to
      the existing single-multiplier estimate

3e. Integrate with the anomaly detector:
    - Add anomaly type: `shadow_supply_shift`
      Trigger: any individual pool changes by >20% week-over-week
      Severity: high if total shadow changes by >15%, medium if 10–15%
    - Add anomaly type: `supply_concentration_risk`
      Trigger: supply_vulnerability_score changes from low/medium to high
      Severity: medium

TASK 4: MODEL INTEGRATION AND TESTING

4a. Update generate_forecast.py pipeline to include:
    - Participant demand intelligence (after scraper stage, before model stage)
    - ACP supply intelligence (same position)
    - Shadow supply decomposition (replaces simple shadow estimate in Kalman stage)
    Each new module is wrapped in try/except — if it fails, the pipeline
    continues with the previous estimates.

4b. Write tests in forecasting/tests/test_participants.py:
    - Test SchemeParticipantRegistry loads and returns >0 participants
    - Test ACPRegistry loads and returns >0 ACPs with creation history
    - Test ShadowSupplyDecomposer returns valid structure with 5 pools
    - Test that total_shadow_estimate multiplier is >1.0 (shadow > visible)
    - Test that pipeline runs with participant modules enabled

4c. Write tests in forecasting/tests/test_shadow_decomposition.py:
    - Test each pool estimation method individually
    - Test fallback to simple multiplier when decomposed model has insufficient data
    - Test anomaly triggers for shadow_supply_shift

TASK 5: PRODUCE IMPROVEMENT ROADMAP

Based on everything discovered in Tasks 1–4, write
forecasting/analysis/FORECAST_IMPROVEMENT_ROADMAP.md:

```markdown
# WREI Forecast Improvement Roadmap
## Date: [timestamp]
## Based on: Performance Analysis Report + Participant Intelligence Build

### 1. Current Forecast Performance Summary
[Key metrics from genuine validation — MAPE, directional accuracy, decision value]
[Statistical significance verdict]
[Where the model adds value vs where naive dominates]

### 2. New Intelligence Modules Deployed

#### 2.1 Demand-Side Participant Intelligence
[Participants identified, obligation estimates, data quality assessment]
[Expected impact on demand forecasting]

#### 2.2 Supply-Side ACP Intelligence
[ACPs catalogued, creation pipeline, concentration risks identified]
[Expected impact on supply forecasting]

#### 2.3 Shadow Supply Decomposition
[Five-pool model results vs single multiplier]
[Which pools have good data vs which are estimated]
[Impact on Kalman filter surplus estimate]

### 3. Remaining Data Gaps
[Ordered by impact on forecast accuracy]

| Gap | Impact | Data Source Required | Accessibility |
|-----|--------|---------------------|---------------|
[Each identified gap]

### 4. Recommended Next Steps
[Ordered by impact × feasibility]

1. [Description, expected impact, effort, dependency]
2. [...]

### 5. Commercial Implications
[What do the genuine performance numbers mean for the NMG value proposition?]
[Does the model demonstrably beat naive on genuine data?]
[If not, what would change that?]
[Updated counterfactual value with market impact adjustment]
```

VERIFICATION:
  cd forecasting && python -m pytest --tb=short -q
  python -c "
  from forecasting.participants.demand_intelligence import SchemeParticipantRegistry
  reg = SchemeParticipantRegistry()
  print(f'Participants loaded: {len(reg.participants)}')
  "
  python -c "
  from forecasting.participants.supply_intelligence import ACPRegistry
  reg = ACPRegistry()
  print(f'ACPs loaded: {len(reg.acps)}')
  "
  python -c "
  from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
  sd = ShadowSupplyDecomposer()
  result = sd.total_shadow_estimate()
  print(f'Shadow multiplier: {result[\"shadow_multiplier\"]:.2f}')
  for pool, data in result['pool_breakdown'].items():
      print(f'  {pool}: {data[\"volume\"]:,.0f} (confidence: {data[\"confidence\"]:.1f})')
  "
  ls -la forecasting/analysis/FORECAST_IMPROVEMENT_ROADMAP.md
  npm run build 2>&1 | tail -3

COMMIT:
  git add -A && git commit -m "Participant intelligence + shadow supply decomposition"
  git tag forecasting-participant-intelligence
  Update TASK_LOG.md.
