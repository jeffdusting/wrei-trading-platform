# WREI Trading Platform -- Gap Analysis and Review

**Document Version:** 2.0
**Date:** 2026-04-05

---

## 1. Documentation Coverage Assessment

### What is Documented

| Area | Document | Version | Status |
|------|----------|---------|--------|
| Platform overview and roadmap | 01-EXECUTIVE-SUMMARY.md | 2.0 | Current (P11) |
| User journeys and personas | 02-USER-SCENARIOS-AND-PERSONAS.md | 1.0 | Partially stale (pre-P5 personas only) |
| Routes, components, data flows | 03-SYSTEM-FUNCTIONAL-ARCHITECTURE.md | 3.0 | Current (P11) |
| Tech stack, AI, database, security | 04-TECHNICAL-ARCHITECTURE.md | 2.0 | Current (P11) |
| API endpoint reference | 05-API-REFERENCE.md | 1.0 | Stale (6 endpoints, now 53) |
| Test inventory and QA | 06-TEST-COVERAGE-AND-QA.md | 2.0 | Current (P11) |
| Deployment and operations | 07-DEPLOYMENT-AND-OPERATIONS.md | 1.0 | Partially stale (no DB ops, no cron) |
| Library module reference | 08-LIBRARY-MODULE-REFERENCE.md | 1.0 | Stale (pre-P5 modules only) |
| Gap analysis (this document) | 09-GAP-ANALYSIS-AND-REVIEW.md | 2.0 | Current (P11) |
| Detailed system specification | 10-SYSTEM-SPECIFICATION.md | 1.0 | New — Current (P11) |
| Test plan and regression | testing/test-plan.md | 2.0 | Current (P11) |

---

## 2. Remaining Gaps

### Gap 1: API Reference (05) is Stale

**Severity:** High
**Description:** Documents 6 endpoints from Milestone 2.2. The platform now has 53 API routes including the full v1 REST API, correspondence, intelligence, and import endpoints.
**Recommendation:** Rewrite 05-API-REFERENCE.md to cover all v1 endpoints with request/response schemas.

### Gap 2: User Scenarios (02) Missing ESC Broker Personas

**Severity:** Medium
**Description:** Documents the original 11 negotiation personas but does not cover the ESC broker workflow personas (obligated entity contacts, counterparty sellers, compliance officers in the correspondence context).
**Recommendation:** Add ESC broker user scenarios covering RFQ generation, email negotiation, and settlement workflows.

### Gap 3: Library Module Reference (08) is Stale

**Severity:** Medium
**Description:** Documents core modules from Milestone 2.3. Missing: `lib/correspondence/*`, `lib/ai/*`, `lib/db/*`, `lib/config/*`, `lib/data-feeds/adapters/*`, all Python modules.
**Recommendation:** Rewrite 08-LIBRARY-MODULE-REFERENCE.md with current module inventory. The System Specification (10) partially covers this.

### Gap 4: Deployment Operations (07) Missing Database and Cron

**Severity:** Medium
**Description:** Documents Vercel deployment but does not cover PostgreSQL provisioning, schema migration, cron job configuration, or Python forecasting environment setup.
**Recommendation:** Add sections for database setup, migration commands, cron job scheduling, and Python environment.

### Gap 5: Python Forecasting Tests

**Severity:** Medium
**Description:** The Python forecasting pipeline has no automated test suite in CI. The backtesting engine validates model accuracy but runs ad-hoc. No regression tests for scrapers or data assembly.
**Recommendation:** Add pytest suite for forecasting models, scrapers, and data assembly. Integrate into CI.

### Gap 6: Correspondence Engine Tests

**Severity:** Medium
**Description:** Core broker workflow modules (procurement-trigger, ai-draft-engine, offer-parser, negotiation-manager, settlement-facilitation) have no dedicated Jest tests.
**Recommendation:** Write unit tests for each correspondence module.

### Gap 7: Accessibility Audit

**Severity:** Low
**Description:** The platform includes an `AccessibilityWrapper` but no VPAT or accessibility audit report exists.
**Recommendation:** Conduct WCAG 2.1 AA audit and document findings.

---

## 3. Platform Capability Coverage

| Capability | Documented | Tested | Gap |
|-----------|-----------|--------|-----|
| AI Negotiation Engine | Yes (03, 04, 10) | Yes (6 test files) | None |
| Defence/Security Layers | Yes (04, 10) | Yes (4 test files) | None |
| Bloomberg Terminal Interface | Yes (03) | Yes (landing, nav) | None |
| AI Correspondence Engine | Yes (10) | Partial (API only) | Test gap |
| ESC Market Intelligence | Yes (10) | Partial (API only) | Test gap |
| Python Forecasting Pipeline | Yes (04, 10) | No (no CI tests) | Test gap |
| Client Management | Yes (10) | Partial (API only) | None |
| Market Data Pipeline | Yes (04, 10) | Yes (3 test files) | None |
| White-Label System | Yes (04, 10) | No | Test gap |
| Institutional Onboarding | Yes (03) | Yes (portal, pipeline) | None |
| Investment Calculator | Yes (03) | Yes (calculator test) | None |
| Regulatory Compliance | Yes (04) | Yes (2 test files) | None |
| Performance Monitoring | Yes (04) | Yes (3 test files) | None |
| Export/Reporting | Yes (03) | Yes (2 test files) | None |
| Scenario Simulation | Yes (03) | Yes (e2e, engine) | None |
| Database Layer | Yes (04, 10) | Low (schema only) | Test gap |
| Live Price Feeds | Yes (04, 10) | Medium (adapter tests) | None |
| Settlement Facilitation | Yes (10) | No | Test gap |
| Client Intelligence Page | Yes (03, 10) | No | Test gap |
| Forecast Performance Dashboard | Yes (03) | No | Test gap |

**Documentation Score:** 20/20 capabilities documented
**Test Score:** 13/20 capabilities have dedicated tests (65%)

---

## 4. Internal Consistency Check

| Check | Result |
|-------|--------|
| Route counts match between docs | 15 pages, 53 API routes — consistent |
| Component catalogue matches code | All major components documented |
| Test counts match reality | 1,630 tests, 69 suites — matches `npm test` output |
| Technology versions match package.json | Verified |
| Pricing values consistent | WREI Pricing Index values consistent across docs |
| Instrument count consistent | 8 instruments across all documents |

**No internal contradictions found.**

---

## 5. Recommended Documentation Priorities

| Priority | Action | Effort |
|----------|--------|--------|
| 1 | Rewrite 05-API-REFERENCE.md (53 endpoints) | High |
| 2 | Add correspondence engine Jest tests | Medium |
| 3 | Update 07-DEPLOYMENT-AND-OPERATIONS.md | Medium |
| 4 | Update 08-LIBRARY-MODULE-REFERENCE.md | Medium |
| 5 | Add pytest suite for forecasting | Medium |
| 6 | Update 02-USER-SCENARIOS-AND-PERSONAS.md | Low |
| 7 | Accessibility audit | Low |
