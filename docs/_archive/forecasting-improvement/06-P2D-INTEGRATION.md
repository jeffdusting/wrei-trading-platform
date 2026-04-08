# Phase 2-D: Model Integration and Pipeline Orchestration

**Prerequisites:** Phase 2-C gate verification — enhanced signal extractor operational.
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` — do NOT re-read source files unless modifying them. Read only the specific files you are modifying.

---

## Objective

Wire the enhanced signals into the three forecast models and update the daily pipeline to incorporate the full ingestion flow.

### P2.4. Model Integration

Wire the enhanced signals into the three existing forecast models.

**P2.4a. XGBoost feature expansion.**

In `counterfactual_model.py`:
1. Add the following features from the enhanced signal output:
   - `signal_confidence` (float)
   - `signal_horizon_weeks` (int)
   - `regime_override_prob` (float)
   - `event_category` — one-hot encoded into 8 binary features: `event_cat_rule_change`, `event_cat_penalty_determination`, `event_cat_activity_phaseout`, `event_cat_scheme_expansion`, `event_cat_compliance_enforcement`, `event_cat_political_signal`, `event_cat_market_commentary`, `event_cat_cross_scheme`
2. Features with `signal_confidence` below 0.5 should be zero-masked (set to 0.0) to prevent low-confidence signals from introducing noise.
3. Update the `FEATURES_INDEPENDENT` list to include the new signal features (these are external data, not Kalman-derived, so they belong in the independent set).
4. The feature count should increase from 34 (independent) to 45 (independent + signal features).

**P2.4b. Kalman filter regime override.**

In `state_space.py`:
1. The `override_regime_probability()` method created in P1.4 should be called by the forecast pipeline when the signal extractor produces a signal with `regime_override_prob > 0.7` AND `signal_confidence > 0.8`.
2. The override adjusts the `regime_indicator` state variable toward the `regime_override_direction`:
   - If direction is "tightening": `regime_indicator = max(regime_indicator, regime_override_prob)`
   - If direction is "surplus": `regime_indicator = min(regime_indicator, 1.0 - regime_override_prob)`
3. Log every override to the anomaly detector alert system with severity "high" and source "ai_signal_override".

**P2.4c. Anomaly detector expansion.**

In `anomaly_detector.py`:
1. Add a new anomaly type: `policy_event_detected`
   - Trigger: Any document processed by the signal extractor with `relevance_score > 0.7` AND `signal_confidence > 0.6` AND `policy_signal_active = true`
   - Severity: "medium" for `signal_confidence` 0.6–0.8, "high" for `signal_confidence > 0.8`
   - Alert message includes the document title, source, event category, and estimated supply/demand impact

**File citations required:** `forecasting/models/counterfactual_model.py`, `forecasting/models/state_space.py`, `forecasting/monitoring/anomaly_detector.py`.

### P2.5. Pipeline Orchestration

Update `forecasting/generate_forecast.py` to incorporate the new ingestion pipeline in the daily forecast run.

**Updated pipeline sequence:**

```
1. Run all scrapers (existing 4 + new 6) — collect ScrapedDocument lists
2. Run ingestion pipeline — deduplicate, classify, store
3. Run AI signal extraction on new/updated documents
4. Load full Kalman filter state (run_full_filter on historical data)
5. Check for regime override signals — apply if criteria met
6. Get latest state estimate
7. Incorporate new observations (update_and_forecast)
8. Run XGBoost with expanded feature set
9. Run ensemble combiner
10. Run anomaly detection (including policy_event_detected)
11. Store results to forecasts table (or CSV/SQLite fallback)
12. Log pipeline run to TASK_LOG
```

**Error handling:** Each stage must be wrapped in try/except. If any new scraper fails, the pipeline continues with remaining scrapers. If the ingestion pipeline fails, the forecast runs on existing data without new signals. If the signal extractor fails, the XGBoost model runs with zero-filled signal features. The pipeline must never crash entirely due to a single component failure.

**File citations required:** `forecasting/generate_forecast.py`.

### PHASE 2 GATE VERIFICATION

```bash
# 1. Verify all scrapers import without error
python -c "
from forecasting.scrapers import (
    nsw_gazette_scraper, dcceew_scraper, cer_scraper,
    hansard_scraper, media_scraper, aer_scraper
)
print('PASS: All new scrapers import successfully')
"

# 2. Verify ingestion pipeline
python -c "
from forecasting.ingestion.pipeline import IntelligencePipeline
from forecasting.scrapers.base import ScrapedDocument
import hashlib
doc = ScrapedDocument(
    source_name='test', source_url='http://test.com', document_url='http://test.com/1',
    title='ESC market update', published_date=None,
    content_text='IPART has announced a review of the ESS penalty rate for 2027.',
    document_type='test',
    content_hash=hashlib.sha256('test'.encode()).hexdigest()
)
pipeline = IntelligencePipeline()
result = pipeline.process_documents([doc])
print(f'Processed: {len(result)} documents')
print('PASS: Ingestion pipeline operational')
"

# 3. Verify enhanced signal schema
python -c "
from forecasting.signals.ai_signal_extractor import extract_signal
# Verify the function signature accepts enhanced schema fields
import inspect
sig = inspect.signature(extract_signal)
print(f'Signal extractor signature: {sig}')
print('PASS: Signal extractor schema verified')
"

# 4. Verify XGBoost feature expansion
python -c "
from forecasting.models.counterfactual_model import FEATURES_INDEPENDENT
signal_features = [f for f in FEATURES_INDEPENDENT if f.startswith('event_cat_') or f in ['signal_confidence', 'signal_horizon_weeks', 'regime_override_prob']]
print(f'Signal features in independent set: {signal_features}')
assert len(signal_features) >= 11, f'Expected 11+ signal features, got {len(signal_features)}'
print('PASS: Feature expansion verified')
"

# 5. Verify pipeline orchestration
python -c "
from forecasting.generate_forecast import run_pipeline
import inspect
src = inspect.getsource(run_pipeline)
assert 'IntelligencePipeline' in src or 'ingestion' in src, 'Pipeline not integrated'
print('PASS: Pipeline orchestration includes ingestion')
"

# 6. Run full test suite
cd forecasting && python -m pytest --tb=short -q
```

**Archive point:** `git add -A && git commit -m "P2: Public intelligence ingestion pipeline" && git tag forecasting-p2-ingestion`

---

## Phase 2-D Completion

Update TASK_LOG.md:

```markdown
## Forecasting Model Improvement — Phase 2-D (Integration)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** forecasting-p2d-integration

### Files Modified
- forecasting/models/counterfactual_model.py (XGBoost feature expansion)
- forecasting/models/state_space.py (regime override wiring)
- forecasting/monitoring/anomaly_detector.py (policy_event_detected)
- forecasting/generate_forecast.py (pipeline orchestration)

### Tests Run
- [Pass/fail summary from gate verification]

### Next Phase
- Read `docs/forecasting-improvement/07-P3-ENHANCEMENTS.md`
- Prerequisites: All 6 gate checks pass
```
