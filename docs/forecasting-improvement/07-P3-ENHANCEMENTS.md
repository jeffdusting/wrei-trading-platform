# Phase 3: Model Enhancements

**Prerequisites:** Phase 2-D gate verification — all 6 checks pass.
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` — do NOT re-read source files unless modifying them. Read only the specific files you are modifying.

---

## PHASE 3: MODEL ENHANCEMENTS

**Objective:** Improve forecast quality through structural model enhancements.

### P3.1. Volume Forecast Model

The current volume projection uses a simple linear adjustment formula. Replace it with a structured decomposition model.

**Create** `forecasting/models/volume_forecast.py`:

1. Decompose ESC creation volume by activity type using IPART activity registration data:
   - Commercial lighting (CL) — declining, phase-out completing 31 Dec 2026
   - Home Energy Efficiency Retrofits (HEER) — growing
   - Industrial, Commercial and Agricultural (IHEAB) — growing
   - Power Infrastructure and Motor Vehicles (PIAMV) — stable
   - Other activities — stable to growing

2. For each activity type, model:
   - Historical creation volume trend (linear or exponential fit on 2022–2025 genuine data)
   - Known phase-out schedule (CL reaches zero by week 52 of 2026)
   - Seasonal adjustment (Q2–Q3 creation peak for residential, Q4 surrender peak)

3. Sum activity-level forecasts to produce total weekly creation volume forecast at 1w, 4w, 12w, 26w horizons.

4. Surrender volume forecast: based on known obligation targets (from IPART annual compliance reports), distributed by the historical seasonal pattern (Q4-heavy procurement, June 30 and December 31 deadlines).

5. Output: `VolumeForeccast` dataclass with `creation_forecast`, `surrender_forecast`, `net_flow_forecast`, `activity_breakdown`, all at weekly frequency for 26 weeks.

6. Replace the simple adjustment formula in `chart-demo-data.ts` integration with the volume model output.

**File citations required:** `forecasting/models/volume_forecast.py` (new), `forecasting/generate_forecast.py` (integration).

### P3.2. Forward Curve Construction

Replace the linear interpolation between 4 anchor horizons with an analytical forward curve.

**In `ensemble_forecast.py`:**

1. Use the OU model's analytical solution for the expected path:
   ```
   E[P(t)] = mu + (P(0) - mu) * exp(-theta * t)
   ```
   where mu and theta are the current regime's parameters.

2. The Kalman filter's state estimate drives the short end (1w–4w), while the OU analytical solution drives the long end (4w–26w), with a blending zone at 4w–8w.

3. Produce 26 weekly point forecasts (not 4 anchors with interpolation).

4. CI bands at each weekly point are derived from the OU model's analytical variance:
   ```
   Var[P(t)] = (sigma^2 / (2*theta)) * (1 - exp(-2*theta*t))
   ```

5. The ensemble CI expansion logic (widening when models disagree) applies at each weekly point.

**File citations required:** `forecasting/models/ensemble_forecast.py`.

### P3.3. Ensemble Weight Transparency

**In `ensemble_forecast.py`:**

1. Log the optimised `bayesian_weight` and `ml_weight` for every retraining window to a file `forecasting/analysis/ensemble_weight_history.json`.

2. Add a method `get_weight_history() -> list[dict]` that returns the historical weight series with timestamps and validation MAPE at each window.

3. If the weight consistently converges to within 0.1 of either 0.0 or 1.0 across the last 4 retraining windows, log a warning: "Ensemble is effectively single-model — review model independence."

**File citations required:** `forecasting/models/ensemble_forecast.py`, `forecasting/analysis/ensemble_weight_history.json` (new).

### P3.4. Shadow Market Cross-Validation

**In `forecasting/calibration/shadow_market.py`:**

1. Add a second calibration method using TESSA transfer velocity as a proxy for market-wide inventory turnover:
   - If TESSA transfer volume over the last 4 weeks exceeds the historical average by more than 20%, the market is drawing down inventory (shadow supply shrinking).
   - If TESSA transfer volume is more than 20% below average, inventory is building (shadow supply growing).

2. Cross-validate the NMG-derived shadow multiplier (1.6×) against the TESSA velocity signal. If they diverge (NMG says supply is growing but TESSA says it is shrinking, or vice versa), flag a `shadow_market_divergence` anomaly with severity "medium".

3. Add a confidence interval to the shadow estimate: report `shadow_multiplier` ± `shadow_uncertainty` based on the cross-validation agreement.

**File citations required:** `forecasting/calibration/shadow_market.py`.

### PHASE 3 GATE VERIFICATION

```bash
# 1. Verify volume forecast model
python -c "
from forecasting.models.volume_forecast import VolumeForecaster
vf = VolumeForecaster()
result = vf.forecast(horizon_weeks=26)
assert hasattr(result, 'creation_forecast')
assert hasattr(result, 'activity_breakdown')
assert len(result.creation_forecast) == 26
print(f'26-week creation forecast range: {min(result.creation_forecast):.0f} - {max(result.creation_forecast):.0f}')
print('PASS: Volume forecast model operational')
"

# 2. Verify forward curve (26 weekly points)
python -c "
from forecasting.models.ensemble_forecast import EnsembleForecaster
ef = EnsembleForecaster()
curve = ef.generate_forward_curve(horizon_weeks=26)
assert len(curve) == 26, f'Expected 26 weekly points, got {len(curve)}'
print(f'Forward curve: week 1 = A\${curve[0][\"price\"]:.2f}, week 26 = A\${curve[25][\"price\"]:.2f}')
print('PASS: Forward curve construction verified')
"

# 3. Verify ensemble weight logging
python -c "
from forecasting.models.ensemble_forecast import EnsembleForecaster
ef = EnsembleForecaster()
history = ef.get_weight_history()
print(f'Weight history entries: {len(history)}')
print('PASS: Ensemble weight transparency verified')
"

# 4. Verify shadow market cross-validation
python -c "
from forecasting.calibration.shadow_market import ShadowMarketCalibrator
smc = ShadowMarketCalibrator()
result = smc.estimate_with_cross_validation()
assert 'shadow_multiplier' in result
assert 'shadow_uncertainty' in result
print(f'Shadow multiplier: {result[\"shadow_multiplier\"]:.2f} ± {result[\"shadow_uncertainty\"]:.2f}')
print('PASS: Shadow market cross-validation operational')
"

# 5. Run full test suite
cd forecasting && python -m pytest --tb=short -q
```

**Archive point:** `git add -A && git commit -m "P3: Model enhancements" && git tag forecasting-p3-enhancements`

---

## Phase 3 Completion

Update TASK_LOG.md:

```markdown
## Forecasting Model Improvement — Phase 3 (Enhancements)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** forecasting-p3-enhancements

### Files Created/Modified
- forecasting/models/volume_forecast.py (new)
- forecasting/models/ensemble_forecast.py (forward curve, weight logging)
- forecasting/calibration/shadow_market.py (cross-validation)
- forecasting/analysis/ensemble_weight_history.json (new)

### Tests Run
- [Pass/fail summary from gate verification]

### Next Phase
- Read `docs/forecasting-improvement/08-P4-REGRESSION.md`
- Prerequisites: All 5 gate checks pass
```
