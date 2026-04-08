# Phase 2-A: New Source Scrapers

**Prerequisites:** Phase 1 gate verification — all 6 checks pass.
**Context:** Read `forecasting/analysis/DISCOVERY_SUMMARY.md` — do NOT re-read source files unless modifying them.

---

## Objective

Create six new scraper modules and a shared base dataclass, following the pattern of existing scrapers.

## P2A.1. Base Dataclass

Create `forecasting/scrapers/base.py`:

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class ScrapedDocument:
    source_name: str
    source_url: str
    document_url: str
    title: str
    published_date: Optional[datetime]
    content_text: str
    document_type: str  # gazette, federal_policy, registry_update, hansard, media, regulatory
    content_hash: str   # SHA-256 of normalised content_text
```

## P2A.2. New Scrapers

Create six new scraper modules in `forecasting/scrapers/`. Each must:
- Be a standalone Python module
- Have a `scrape()` function returning a list of `ScrapedDocument` instances
- Handle HTTP errors gracefully (log and return empty list, never crash)
- Include `SOURCE_NAME` and `SOURCE_URL` constants

**Scraper specifications:**

```
forecasting/scrapers/nsw_gazette_scraper.py
  SOURCE_URL: https://gazette.legislation.nsw.gov.au
  TARGET: NSW Government Gazette entries related to ESS, Energy Savings Scheme, IPART determinations
  DOCUMENT_TYPE: "gazette"
  FREQUENCY: Daily
  FILTER: Keyword match on ["energy savings", "ESS", "IPART", "energy efficiency", "electricity supply"]

forecasting/scrapers/dcceew_scraper.py
  SOURCE_URL: https://www.dcceew.gov.au
  TARGET: Consultation papers, Safeguard Mechanism updates, Emissions Reduction Fund policy
  DOCUMENT_TYPE: "federal_policy"
  FREQUENCY: Daily
  FILTER: Pages under /climate-change/, /energy/, /environment/protection/ paths

forecasting/scrapers/cer_scraper.py
  SOURCE_URL: https://www.cleanenergyregulator.gov.au
  TARGET: ANREU transaction reports, ACCU issuance data, ERF project registrations, CER media releases
  DOCUMENT_TYPE: "registry_update"
  FREQUENCY: Daily
  FILTER: Pages under /Infohub/, /DocumentAssets/, media releases

forecasting/scrapers/hansard_scraper.py
  SOURCE_URL: https://www.parliament.nsw.gov.au/hansard
  TARGET: NSW Parliamentary Hansard entries mentioning energy policy, ESS, certificates, IPART
  DOCUMENT_TYPE: "hansard"
  FREQUENCY: Weekly (Hansard publishes after sitting days)
  FILTER: Keyword search on ["energy savings scheme", "energy efficiency", "IPART", "certificates", "emissions"]

forecasting/scrapers/media_scraper.py
  SOURCE_URL: Multiple — see target list
  TARGET: Curated media sources for ESC and energy market coverage
  SOURCES:
    - Australian Financial Review energy section (afr.com/companies/energy)
    - RenewEconomy (reneweconomy.com.au)
    - AEMO publications (aemo.com.au/newsroom)
    - Energy Efficiency Council (eec.org.au/news)
    - Energy Security Board (esb-post2025.com.au or dataportal.energy.gov.au)
  DOCUMENT_TYPE: "media"
  FREQUENCY: Daily
  FILTER: Must mention at least one of ["ESC", "energy savings certificate", "ESS scheme", "VEEC", "energy efficiency", "certificate market", "penalty rate", "surrender obligation"]

forecasting/scrapers/aer_scraper.py
  SOURCE_URL: https://www.aer.gov.au
  TARGET: Australian Energy Regulator determinations, retail electricity market reports
  DOCUMENT_TYPE: "regulatory"
  FREQUENCY: Daily
  FILTER: Determinations and reports related to energy retailers (ESS obligated entities)
```

## P2A.3. Update Daily Runner

Modify `forecasting/scrapers/run_daily.py` to include all new scrapers in the pipeline. Each scraper runs independently — if one fails, the others continue.

## Gate Verification

```bash
# 1. Verify base dataclass
python -c "
from forecasting.scrapers.base import ScrapedDocument
import hashlib
doc = ScrapedDocument(
    source_name='test', source_url='http://test.com', document_url='http://test.com/1',
    title='Test', published_date=None, content_text='Test content',
    document_type='test', content_hash=hashlib.sha256('test'.encode()).hexdigest()
)
print(f'ScrapedDocument created: {doc.source_name}')
print('PASS: Base dataclass verified')
"

# 2. Verify all new scrapers import
python -c "
from forecasting.scrapers import nsw_gazette_scraper, dcceew_scraper, cer_scraper
from forecasting.scrapers import hansard_scraper, media_scraper, aer_scraper
print('PASS: All 6 new scrapers import successfully')
"

# 3. Verify each scraper has scrape() function
python -c "
from forecasting.scrapers import nsw_gazette_scraper, dcceew_scraper, cer_scraper
from forecasting.scrapers import hansard_scraper, media_scraper, aer_scraper
for mod in [nsw_gazette_scraper, dcceew_scraper, cer_scraper, hansard_scraper, media_scraper, aer_scraper]:
    assert hasattr(mod, 'scrape'), f'{mod.__name__} missing scrape()'
    assert hasattr(mod, 'SOURCE_NAME'), f'{mod.__name__} missing SOURCE_NAME'
print('PASS: All scrapers have required interface')
"

# 4. Run test suite
cd forecasting && python -m pytest --tb=short -q
```

**Archive point:** `git add -A && git commit -m "P2-A: New source scrapers" && git tag forecasting-p2a-scrapers`

---

## Phase 2-A Completion

Update TASK_LOG.md:

```markdown
## Forecasting Model Improvement — Phase 2-A (Scrapers)
**Date:** [timestamp]
**Status:** COMPLETE
**Git Tag:** forecasting-p2a-scrapers

### Files Created
- forecasting/scrapers/base.py
- forecasting/scrapers/nsw_gazette_scraper.py
- forecasting/scrapers/dcceew_scraper.py
- forecasting/scrapers/cer_scraper.py
- forecasting/scrapers/hansard_scraper.py
- forecasting/scrapers/media_scraper.py
- forecasting/scrapers/aer_scraper.py
- forecasting/scrapers/run_daily.py (modified)

### Next Phase
- Read `docs/forecasting-improvement/04-P2B-INGESTION.md`
- Prerequisites: All 4 gate checks pass
```
