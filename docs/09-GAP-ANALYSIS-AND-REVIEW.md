# WREI Trading Platform -- Gap Analysis and Review

**Document Version:** 1.0
**Date:** 2026-03-25

---

## 1. Documentation Coverage Assessment

### What is Documented

| Area | Document | Coverage Level |
|------|----------|---------------|
| Platform overview and value proposition | 01-EXECUTIVE-SUMMARY.md | Complete |
| User journeys and persona documentation | 02-USER-SCENARIOS-AND-PERSONAS.md | Complete |
| Component hierarchy and data flows | 03-SYSTEM-FUNCTIONAL-ARCHITECTURE.md | Complete |
| Technical implementation details | 04-TECHNICAL-ARCHITECTURE.md | Complete |
| API endpoints and integration | 05-API-REFERENCE.md | Complete |
| Test infrastructure and coverage | 06-TEST-COVERAGE-AND-QA.md | Complete |
| Deployment and operations | 07-DEPLOYMENT-AND-OPERATIONS.md | Complete |
| Library module reference | 08-LIBRARY-MODULE-REFERENCE.md | Complete |

### Cross-Reference Verification

All documentation sections have been verified against the actual codebase:
- All 10 page routes documented and verified
- All 6 API routes documented with actions
- All 50+ components catalogued with purposes
- All 30+ library modules referenced
- All 66 test files inventoried
- All configuration files reviewed

---

## 2. Codebase Alignment Audit

### Verified Alignments

| Claim in Documentation | Verified In Codebase | Status |
|----------------------|---------------------|--------|
| 11 buyer personas | `lib/personas.ts` -- PERSONA_DEFINITIONS array | Confirmed |
| Claude Opus 4.6 model | `app/api/negotiate/route.ts` line 77: `model: 'claude-opus-4-6'` | Confirmed |
| Price floor enforcement in code | `lib/defence.ts` enforceConstraints() | Confirmed |
| 5% max concession per round | `lib/negotiation-config.ts` MAX_CONCESSION_PER_ROUND: 0.05 | Confirmed |
| 20% max total concession | `lib/negotiation-config.ts` MAX_TOTAL_CONCESSION: 0.20 | Confirmed |
| No localStorage/sessionStorage | Grep confirms zero usage in codebase | Confirmed |
| API key server-side only | `ANTHROPIC_API_KEY` used only in `app/api/negotiate/route.ts` | Confirmed |
| 6-step onboarding wizard | `components/institutional/` -- 6 step components | Confirmed |
| Zustand for demo mode | `lib/demo-mode/demo-state-manager.ts` uses `create` from zustand | Confirmed |
| 6 API endpoints | `app/api/` -- negotiate, analytics, compliance, market-data, metadata, performance | Confirmed |
| Recharts for charts | `package.json` dependency + `components/charts/` | Confirmed |
| X-WREI-API-Key authentication | `lib/api-helpers.ts` validateApiKey() | Confirmed |
| Rate limiting 100 req/min | `lib/api-helpers.ts` checkRateLimit() default 100/60000 | Confirmed |
| WREI colour scheme | `tailwind.config.ts` custom colors | Confirmed |
| Australian spelling | User-facing text uses "organised", "recognised", etc. | Confirmed |

### Discrepancies Found and Resolved

1. **CLAUDE.md states ANCHOR_PRICE = 150 and PRICE_FLOOR = 120** but `negotiation-config.ts` calculates these dynamically from live market data ($28.12 and $22.80 respectively). The CLAUDE.md values are for the WREI_TOKEN_CONFIG section (A$/tonne), while NEGOTIATION_CONFIG uses USD/tonne with different premiums. Both systems coexist -- CLAUDE.md describes the tokenisation document specification, while the live negotiation uses market-driven values. **Documentation accurately reflects both systems.**

2. **CLAUDE.md lists 5 buyer personas** but the platform now has 11 (5 original + 6 institutional). **Documentation accurately reflects the current 11 personas.**

3. **README.md mentions "5 Buyer Personas"** which is outdated relative to the current 11. The README should be updated to reflect the expanded persona set. **Noted as recommended update.**

---

## 3. Identified Gaps

### Gap 1: Demo Mode End-to-End Documentation

**Severity:** Medium
**Description:** While the demo mode system is documented architecturally, there is no step-by-step guide for conducting an investor presentation using demo mode. A presentation runbook would be valuable.
**Recommendation:** Create a presentation guide document covering each of the 6 tour types with talking points and expected flow.

### Gap 2: Data Model Documentation

**Severity:** Low
**Description:** While TypeScript interfaces are documented, there is no visual entity-relationship diagram showing how NegotiationState, BuyerProfile, NegotiationSession, and related types interconnect.
**Recommendation:** Create a data model diagram showing core entity relationships.

### Gap 3: Zoniqx Integration Boundary Documentation

**Severity:** Low
**Description:** CLAUDE.md states that Zoniqx references are "knowledge-base content for agent dialogue only" with no live integration. This boundary is clear in code but could benefit from a dedicated section explaining what is simulated vs. what would be live in production.
**Recommendation:** Add a "Production vs. Demo Boundaries" section to the technical architecture document.

### Gap 4: Accessibility Documentation

**Severity:** Medium
**Description:** The platform includes an `AccessibilityWrapper` component targeting WCAG 2.1 AA compliance, but there is no accessibility audit report or VPAT (Voluntary Product Accessibility Template).
**Recommendation:** Conduct an accessibility audit and document findings.

### Gap 5: Error Handling Guide

**Severity:** Low
**Description:** While API error codes are documented, there is no comprehensive guide to client-side error handling patterns used in the negotiation interface (retry logic, fallback UI, error boundary behaviour).
**Recommendation:** Add error handling patterns to the technical architecture document.

### Gap 6: Demo Data Set Documentation

**Severity:** Low
**Description:** The demo data sets in `lib/demo-mode/demo-data-sets.ts` are not individually documented. Understanding what each data set contains would help presentation preparation.
**Recommendation:** Document each demo data set's contents and intended use case.

---

## 4. README.md Update Recommendations

The current README.md is outdated relative to the platform's current capabilities. Recommended updates:

1. **Update "5 Buyer Personas" to "11 Buyer Personas"** (5 original + 6 institutional)
2. **Add new features** not mentioned: Investment Calculator, Compliance Dashboard, Demo Mode, Developer Portal, Scenario Simulation, Negotiation Coaching, Committee Mode
3. **Update technology stack** to include Recharts, Zustand
4. **Add route table** showing all 10 page routes
5. **Reference the `/docs` documentation suite**

---

## 5. Completeness Assessment

### Platform Capability Coverage

| Capability | Documented | Verified | Gap |
|-----------|-----------|---------|-----|
| Landing page and navigation | Yes | Yes | None |
| AI negotiation engine | Yes | Yes | None |
| Defence/security layers | Yes | Yes | None |
| 11 buyer personas | Yes | Yes | None |
| Committee mode | Yes | Yes | None |
| Negotiation coaching | Yes | Yes | None |
| Negotiation scoring | Yes | Yes | None |
| Negotiation history/replay | Yes | Yes | None |
| Institutional onboarding (6 steps) | Yes | Yes | None |
| Pipeline transition | Yes | Yes | None |
| Investment calculator | Yes | Yes | None |
| Scenario comparison | Yes | Yes | None |
| Regulatory compliance map | Yes | Yes | None |
| AFSL compliance | Yes | Yes | None |
| KYC/AML verification | Yes | Yes | None |
| Tax treatment guidance | Yes | Yes | None |
| Digital Assets Framework | Yes | Yes | None |
| Market data feeds | Yes | Yes | None |
| Competitive analysis | Yes | Yes | None |
| ESG impact dashboard | Yes | Yes | None |
| Demo mode (6 tours) | Yes | Yes | Presentation guide gap |
| Developer portal / API explorer | Yes | Yes | None |
| API documentation (6 endpoints) | Yes | Yes | None |
| Performance monitoring | Yes | Yes | None |
| Scenario simulation (5 scenarios) | Yes | Yes | None |
| Bloomberg-style layout | Yes | Yes | None |
| Accessibility wrapper | Yes | Yes | Audit report gap |
| Chart components (4 types) | Yes | Yes | None |
| Blockchain provenance | Yes | Yes | None |
| Token metadata system | Yes | Yes | None |
| Four-layer architecture | Yes | Yes | None |
| Export/reporting (4 formats) | Yes | Yes | None |
| Professional analytics | Yes | Yes | None |
| Monte Carlo simulation | Yes | Yes | None |
| Yield models (revenue share, NAV) | Yes | Yes | None |
| Risk profiles | Yes | Yes | None |

**Coverage Score: 35/35 capabilities documented (100%)**

### User Persona Coverage

| User Type | Journey Documented | Technical Docs | API Docs |
|-----------|-------------------|----------------|----------|
| Institutional Investor | Yes | Yes | Yes |
| Corporate Compliance Officer | Yes | Yes | N/A |
| ESG Fund Manager | Yes | Yes | N/A |
| Carbon Trading Desk | Yes | Yes | Yes |
| Sustainability Director | Yes | Yes | N/A |
| Government Procurement | Yes | Yes | N/A |
| Infrastructure Fund | Yes | Yes | N/A |
| ESG Impact Investor | Yes | Yes | N/A |
| DeFi Yield Farmer | Yes | Yes | N/A |
| Family Office | Yes | Yes | N/A |
| Sovereign Wealth Fund | Yes | Yes | N/A |
| Developer | Yes | Yes | Yes |
| Compliance Officer | Yes | Yes | Yes |
| Presenter/Demo User | Partial | Yes | N/A |

---

## 6. Internal Contradiction Check

The documentation suite has been reviewed for internal contradictions:

1. **Pricing values** are consistent across all documents (PRICING_INDEX values, WREI premiums, floor prices)
2. **Persona counts** are consistently stated as 11 (5 + 6)
3. **API endpoint counts** are consistently stated as 6
4. **Test counts** reference the baseline of 623+ tests / 35 suites
5. **Technology versions** are consistent with `package.json`
6. **CLAUDE.md constraints** are respected throughout (no localStorage, server-side API keys only, Australian spelling)

**No internal contradictions found.**

---

## 7. Documentation Maintenance Recommendations

1. **Version tracking:** Update document versions when platform capabilities change
2. **Test count updates:** Refresh test counts after each milestone
3. **API action updates:** Document new API actions as they are added
4. **Persona additions:** Document new personas following the established template
5. **Component catalogue:** Add new components to the architecture document
6. **Pricing updates:** Reflect any changes to PRICING_INDEX or NEGOTIATION_CONFIG
