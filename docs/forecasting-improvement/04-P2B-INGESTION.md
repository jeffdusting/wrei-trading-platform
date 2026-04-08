# Phase 2-B: Document Ingestion Pipeline

**Prerequisites:** Phase 2-A gate verification — all scrapers import and have required interface.
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` — do NOT re-read source files unless modifying them.

---

## Objective

Create the document ingestion pipeline that processes scraped documents before they reach the AI signal extractor.

## P2B.1. Ingestion Pipeline

Create `forecasting/ingestion/__init__.py` and `forecasting/ingestion/pipeline.py`.

**Pipeline stages:**

1. **Deduplication.** SHA-256 hash on normalised content (lowercase, whitespace-collapsed). If hash exists in `processed_documents` set, skip. If hash exists but `published_date` is newer, flag for re-extraction.

2. **Relevance classification.** Two-stage filter:
   - Stage 1: Keyword match — document must contain at least one term from: `["ESC", "energy savings certificate", "ESS", "VEEC", "energy efficiency scheme", "surrender", "creation", "penalty rate", "IPART", "obligated entity", "accredited certificate provider", "activity", "phase-out", "commercial lighting", "HEER", "IHEAB"]`. Documents failing keyword match are discarded.
   - Stage 2: AI relevance scoring — call Claude Haiku with:

   ```
   Rate the relevance of this document to the Australian Energy Savings Certificate (ESC) market on a scale of 0.0 to 1.0. Consider whether it contains information about: ESC prices, supply/demand dynamics, regulatory changes, activity eligibility, penalty rates, surrender deadlines, creation volumes, or market participant behaviour. Respond with ONLY a JSON object: {"relevance_score": 0.X, "reason": "brief explanation"}

   Document title: {title}
   Document excerpt (first 2000 chars): {content_text[:2000]}
   ```

   - Below 0.3: discard. 0.3–0.7: queue for batch processing. Above 0.7: fast-track for immediate signal extraction.

3. **Content normalisation.** Strip HTML tags, normalise whitespace, extract plain text. Truncate to 10,000 characters.

4. **Storage.** SQLite database at `forecasting/data/intelligence_documents.db`:

```sql
CREATE TABLE IF NOT EXISTS public_intelligence_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_url TEXT NOT NULL,
    document_url TEXT UNIQUE NOT NULL,
    source_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    published_date TEXT,
    ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
    content_hash TEXT NOT NULL,
    relevance_score REAL,
    content_text TEXT NOT NULL,
    signal_extracted INTEGER DEFAULT 0,
    signal_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_doc_hash ON public_intelligence_documents(content_hash);
CREATE INDEX IF NOT EXISTS idx_doc_type ON public_intelligence_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_signal_extracted ON public_intelligence_documents(signal_extracted);
```

**Note:** SQLite is used for the forecasting pipeline's own storage — separate from Vercel Postgres. The Python pipeline runs as a batch process; SQLite avoids coupling to application database provisioning.

## Gate Verification

```bash
# 1. Verify pipeline creates and queries SQLite DB
python -c "
from forecasting.ingestion.pipeline import IntelligencePipeline
from forecasting.scrapers.base import ScrapedDocument
import hashlib
doc = ScrapedDocument(
    source_name='test', source_url='http://test.com', document_url='http://test.com/1',
    title='ESC market update — IPART announces penalty rate review',
    published_date=None,
    content_text='IPART has announced a review of the ESS penalty rate for the 2027 compliance year. The review will consider CPI adjustments and scheme participant feedback.',
    document_type='test',
    content_hash=hashlib.sha256('test'.encode()).hexdigest()
)
pipeline = IntelligencePipeline()
result = pipeline.process_documents([doc])
print(f'Processed: {len(result)} documents')
print('PASS: Ingestion pipeline operational')
"

# 2. Verify SQLite schema
python -c "
import sqlite3, os
db_path = 'forecasting/data/intelligence_documents.db'
assert os.path.exists(db_path), f'DB not found at {db_path}'
conn = sqlite3.connect(db_path)
tables = conn.execute(\"SELECT name FROM sqlite_master WHERE type='table'\").fetchall()
print(f'Tables: {[t[0] for t in tables]}')
assert ('public_intelligence_documents',) in tables
print('PASS: SQLite schema verified')
"

# 3. Run test suite
cd forecasting && python -m pytest --tb=short -q
```

**Archive point:** `git add -A && git commit -m "P2-B: Document ingestion pipeline" && git tag forecasting-p2b-ingestion`

---

## Phase 2-B Completion

Update TASK_LOG.md:

```markdown
## Forecasting Model Improvement — Phase 2-B (Ingestion)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** forecasting-p2b-ingestion

### Files Created
- forecasting/ingestion/__init__.py
- forecasting/ingestion/pipeline.py
- forecasting/data/intelligence_documents.db (created at runtime)

### Next Phase
- Read `docs/forecasting-improvement/05-P2C-SIGNALS.md`
- Prerequisites: All 3 gate checks pass
```
