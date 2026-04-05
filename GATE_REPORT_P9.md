# GATE REPORT — Phase P9: AI Correspondence Engine

**Date:** 2026-04-05
**Phase:** P9 (Complete)
**Tag:** v1.3.0-correspondence-engine

---

## Objective

Build a complete AI-powered correspondence engine for the broker workflow: procurement triggers, AI-drafted RFQ emails, multi-round email negotiations with constraint enforcement, trade confirmations, settlement facilitation with TESSA/VEEC transfer instructions, and automated client compliance reporting.

---

## Deliverables

### P9-A: AI Draft Engine & Procurement Trigger (Commit: P9-B)
- AI RFQ drafting via service router (Sonnet 4, 512 tokens)
- Procurement trigger: `evaluateClientNeeds(orgId)` — risk classification (red/amber/green)
- Seller outreach: 5 demo counterparties, instrument-filtered RFQ batch generation
- Correspondence lifecycle: drafted → approved → sent → replied

### P9-B: Correspondence Management UI (Commit: d7e8111)
- Procurement dashboard with risk-sorted client table
- Draft review with approve/edit/reject workflow
- Correspondence history timeline with filters
- Navigation: "Correspondence" (COR) added to BloombergShell

### P9-C: Email Negotiation & Trade Confirmation (Commit: 9a2cba2)
- Negotiation thread state machine (RFQ Sent → Offer Received → Counter → Accepted/Rejected)
- AI offer parser with confidence scoring (<70% = manual review)
- Constraint enforcement: price floor, per-round concession, total concession — in application code
- AFMA-style trade confirmations (template-generated, not AI)
- Inbound email processing API with auto counter-offer generation
- Negotiation thread UI with timeline, parsed offer summaries, concession tracker

### P9-D: Settlement Facilitation & Client Reporting (This session)
- TESSA transfer instruction generator (ESC/PRC)
- VEEC transfer instruction generator
- Settlement follow-up drafting (AI with overdue-aware tone)
- Settlement status tracking: instructions_generated → transferred → confirmed → complete
- AI-drafted client position reports (holdings, surrender progress, penalty exposure, market commentary)
- Batch report generation for all clients
- Reports API: POST generate, GET list
- Correspondence dashboard: 6 tabs (Procurement | Drafts | Negotiations | Settlement | Reports | History)
- BloombergShell badge count for items requiring broker attention

---

## Architecture

```
lib/correspondence/
  types.ts                    244 lines — All correspondence type definitions
  ai-draft-engine.ts          136 lines — AI RFQ drafting via service router
  procurement-trigger.ts      162 lines — Client needs evaluation, risk classification
  seller-outreach.ts          141 lines — RFQ batch generation, counterparty network
  negotiation-manager.ts      386 lines — Thread state machine, constraint enforcement
  offer-parser.ts             170 lines — AI email parsing, confidence scoring
  trade-confirmation-gen...   266 lines — AFMA confirmations, covering email
  settlement-facilitation.ts  452 lines — TESSA/VEEC instructions, follow-up, tracking
  client-reporting.ts         460 lines — AI position reports, batch generation

components/correspondence/
  ProcurementDashboard.tsx    198 lines — Risk-sorted client shortfalls
  DraftReview.tsx             271 lines — Approve/edit/reject workflow
  CorrespondenceHistory.tsx   231 lines — Timeline with filters
  NegotiationThread.tsx       393 lines — Thread timeline, concession tracker
  SettlementInstructions.tsx  392 lines — Transfer checklist, status tracking
  ClientReporting.tsx         306 lines — Report generation and review

app/api/v1/correspondence/
  procurement/route.ts         43 lines — GET procurement recommendations
  procurement/generate-rfqs/   63 lines — POST generate RFQ drafts
  inbound/route.ts            112 lines — POST inbound email processing
  reports/route.ts            130 lines — POST/GET client reports

app/correspondence/page.tsx   112 lines — 6-tab layout
```

**Total new code across P9:** ~4,700 lines

---

## Verification Matrix

| Check | P9-A/B | P9-C | P9-D |
|-------|--------|------|------|
| `npx tsc --noEmit` | Zero errors | Zero errors | Zero errors |
| `npm run build` | Clean | Clean | Clean |
| `npm test` | 1612 tests | 1612 tests | 1612 tests |
| API routes | 2 new λ | 1 new λ | 1 new λ |

---

## Defence & Constraint Enforcement

- **Negotiation constraints** enforced in application code, NOT delegated to AI:
  - Price floor enforcement per instrument
  - Per-round concession limit (30% of gap, capped)
  - Total concession limit from anchor
  - Minimum rounds before price concession
- **Input sanitisation** on all inbound email content before AI processing
- **Output filtering** strips internal reasoning from AI responses
- **Threat level classification** on inbound emails (none/low/medium/high)
- **AI guard chain**: rate limiter → cost guard → timeout guard on all AI calls
- **Template fallbacks** for every AI-drafted output (RFQs, follow-ups, reports)
- **Data-driven reports**: AI contextualises structured data, never invents numbers

---

## AI Capabilities Used

| Capability | Model | Max Tokens | Used For |
|-----------|-------|------------|----------|
| `correspondence_draft` | Sonnet 4 | 512 | RFQ emails, counter-offers, covering emails, settlement follow-ups |
| `report_generator` | Sonnet 4 | 512 | Client position report commentary |

---

## Gate Decision

**PASS** — Phase P9 complete. The AI correspondence engine provides:
1. Automated procurement trigger → RFQ generation pipeline
2. Multi-round email negotiation with institutional-grade constraint enforcement
3. AFMA-compliant trade confirmations
4. TESSA/VEEC settlement facilitation with tracking and follow-ups
5. AI-drafted client compliance position reports with batch generation
6. Full broker review workflow (approve/edit/reject) at every stage
7. Defence layers applied to all AI interactions
