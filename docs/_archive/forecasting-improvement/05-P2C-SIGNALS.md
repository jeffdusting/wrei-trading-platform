# Phase 2-C: Enhanced AI Signal Extractor

**Prerequisites:** Phase 2-B gate verification — ingestion pipeline operational.
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` — do NOT re-read source files unless modifying them. Read `forecasting/signals/ai_signal_extractor.py` since you are modifying it.

---

## Objective

Expand the existing signal extractor to process documents from the ingestion pipeline with an enhanced output schema.

### P2.3. Enhanced AI Signal Extractor

Expand the existing `forecasting/signals/ai_signal_extractor.py` to process documents from the ingestion pipeline and produce an enhanced output schema.

**Current output schema** (preserve for backward compatibility):
```python
{
    "policy_signal_active": bool,
    "supply_impact_pct": float,
    "demand_impact_pct": float
}
```

**Enhanced output schema** (add these fields):
```python
{
    "policy_signal_active": bool,
    "supply_impact_pct": float,        # -1.0 to +1.0
    "demand_impact_pct": float,        # -1.0 to +1.0
    "signal_source": str,              # NEW — source_name of the document
    "signal_confidence": float,        # NEW — 0.0 to 1.0, extractor's self-assessed confidence
    "signal_horizon_weeks": int,       # NEW — estimated weeks until impact materialises
    "regime_override_prob": float,     # NEW — 0.0 to 1.0, probability current regime should transition
    "regime_override_direction": str,  # NEW — "tightening", "surplus", or "none"
    "event_category": str              # NEW — one of: rule_change, penalty_determination, activity_phaseout, scheme_expansion, compliance_enforcement, political_signal, market_commentary, cross_scheme
}
```

**Updated extraction prompt** — replace the existing system prompt in `ai_signal_extractor.py` with:

```
You are an expert analyst of the Australian Energy Savings Certificate (ESC) market. You are extracting structured market signals from a document to feed into a quantitative forecasting model.

The ESC market operates under the NSW Energy Savings Scheme (ESS), administered by IPART. Key dynamics:
- ESC prices are bounded above by the IPART penalty rate (currently A$29.48/certificate)
- Supply is driven by certificate creation from accredited activities (commercial lighting phase-out completing Dec 2026 removes ~22% of creation volume)
- Demand is driven by obligated entity surrender requirements
- The market has three regimes: surplus (oversupplied, prices low), balanced, tightening (undersupplied, prices approach penalty ceiling)

Analyse the following document and extract a structured signal. Be conservative — only flag a signal as active if the document contains specific, actionable information that would change a trader's view of ESC supply, demand, or pricing within the next 26 weeks.

Respond with ONLY a JSON object matching this exact schema:
{
    "policy_signal_active": true/false,
    "supply_impact_pct": float between -1.0 and 1.0 (negative = supply reduction, positive = supply increase),
    "demand_impact_pct": float between -1.0 and 1.0 (negative = demand reduction, positive = demand increase),
    "signal_confidence": float between 0.0 and 1.0,
    "signal_horizon_weeks": integer 1-26,
    "regime_override_prob": float between 0.0 and 1.0 (probability the market regime should change as a result),
    "regime_override_direction": "tightening" or "surplus" or "none",
    "event_category": one of "rule_change", "penalty_determination", "activity_phaseout", "scheme_expansion", "compliance_enforcement", "political_signal", "market_commentary", "cross_scheme"
}

Document source: {source_name}
Document type: {document_type}
Published: {published_date}
Title: {title}

Content:
{content_text}
```

**Add a batch processing method** — `extract_signals_batch(documents: list[dict]) -> list[dict]` that processes queued documents from the ingestion pipeline, writes results back to the SQLite database, and returns the list of active signals for consumption by the forecast models.

**AI call configuration:**
- Model: Claude Sonnet 4 (cost-efficient for extraction, not negotiation)
- Max tokens: 512
- Temperature: 0 (deterministic extraction)
- Rate limit: Maximum 30 calls per pipeline run (to control API costs)
- If rate limit is reached, remaining documents are queued for the next run

**File citations required:** `forecasting/signals/ai_signal_extractor.py`.

## Gate Verification

```bash
# 1. Verify enhanced signal schema
python -c "
from forecasting.signals.ai_signal_extractor import extract_signal
import inspect
sig = inspect.signature(extract_signal)
print(f'Signal extractor signature: {sig}')
print('PASS: Signal extractor schema verified')
"

# 2. Verify batch processing method exists
python -c "
from forecasting.signals.ai_signal_extractor import extract_signals_batch
import inspect
sig = inspect.signature(extract_signals_batch)
print(f'Batch extractor signature: {sig}')
print('PASS: Batch processing method verified')
"

# 3. Run test suite
cd forecasting && python -m pytest --tb=short -q
```

**Archive point:** `git add -A && git commit -m "P2-C: Enhanced AI signal extractor" && git tag forecasting-p2c-signals`

---

## Phase 2-C Completion

Update TASK_LOG.md:

```markdown
## Forecasting Model Improvement — Phase 2-C (Signals)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** forecasting-p2c-signals

### Files Modified
- forecasting/signals/ai_signal_extractor.py

### Next Phase
- Read `docs/forecasting-improvement/06-P2D-INTEGRATION.md`
- Prerequisites: All 3 gate checks pass
```
