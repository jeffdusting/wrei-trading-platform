# WREI Trading Platform -- Continuation Prompt
# Milestone 2.1 Phase 3 Completion and Beyond

**Date:** 2026-03-23
**Context:** Post-Phase 3 Audit, Pre-Commit

---

## IMMEDIATE TASK: Fix Phase 3 Issues and Complete Milestone 2.1

### Context

You are continuing development on the WREI Trading Platform. An audit of the Milestone 2.1 Phase 3 implementation has been completed. The institutional onboarding portal UI is fully built (8 components, 6-step wizard), but there are 4 issues that need fixing before the work can be committed.

### Required Reading (Start Here)

1. `/MILESTONE_2.1_PHASE3_AUDIT.md` -- Full audit report with all findings
2. `/INTEGRATED_DEVELOPMENT_PLAN.md` -- Overall development roadmap
3. `/CLAUDE.md` -- Project rules, colour scheme, architecture constraints

### Current State

- **Branch:** main
- **Last Commit:** `09ddccb` -- GATE 2 COMPLETE: Phase A Testing Foundation & Milestones 1.2-1.3 Implementation
- **Uncommitted:** 15 new files for Milestone 2.1 (all untracked, listed below)
- **Existing Tests:** 27 suites, 500 tests -- ALL PASSING (no regressions)
- **New Tests:** 2 suites, 28 tests -- 17 passing, 11 failing

### Uncommitted Files

```
app/institutional/portal/page.tsx
components/institutional/AFSLComplianceReview.tsx
components/institutional/ComplianceConfirmation.tsx
components/institutional/InstitutionalIdentityForm.tsx
components/institutional/InstitutionalOnboardingWizard.tsx
components/institutional/InvestmentPreferencesConfig.tsx
components/institutional/InvestorClassificationAssessment.tsx
components/institutional/KYCAMLVerification.tsx
lib/data-feeds/carbon-pricing-feed.ts
lib/data-feeds/real-time-connector.ts
lib/data-feeds/rwa-market-feed.ts
lib/data-feeds/types.ts
lib/institutional-onboarding.ts
__tests__/milestone-2.1-data-feeds.test.ts
__tests__/milestone-2.1-institutional-portal.test.tsx
```

---

## FIX 1: TypeScript Error in rwa-market-feed.ts (BLOCKS DEPLOYMENT)

**File:** `lib/data-feeds/rwa-market-feed.ts:58`
**Error:** Property name has a space: `competitive Advantage: string;`
**Fix:** Change to `competitiveAdvantage: string;`

This is a simple typo in an interface definition.

## FIX 2: Regulatory Compliance Function Signatures (9 FAILING TESTS)

**Root Cause:** The test file `__tests__/milestone-2.1-institutional-portal.test.tsx` and the onboarding components expect richer API from 3 functions in `lib/regulatory-compliance.ts`:

### 2a. `validateInvestorClassification` needs enhancement

**Current signature accepts:** `{ entityType?, netAssets?, grossIncome?, investmentAmount?, ...}`
**Tests/components expect it to accept:** `{ entityType: 'fund_manager'|'family_office'|'pension_fund'|'sovereign_wealth'|..., netAssets, grossIncome, aum, professionalExperience, jurisdictions }`

**Current return:** `{ classification, regulatory?, exemptions?, complianceValid, ... }`
**Tests expect return:** `{ classification, rationale: string, thresholds: { netAssets: { met, value }, grossIncome: { met, value }, aum: { met, value } }, complianceNotes: string[], restrictionFlags: string[], exemptionsAvailable: string[] }`

**Key logic needed:**
- `entityType === 'fund_manager'` with high AUM -> 'professional' or 'sophisticated'
- `entityType === 'sovereign_wealth'` with A$1B+ -> 'sophisticated'
- `netAssets >= 2500000` -> at minimum 'wholesale'
- `netAssets < 2500000 AND grossIncome < 250000` -> 'retail'
- Must return `thresholds` object with `{ met: boolean, value: number }` for each threshold
- Must return `rationale` string containing the classification name
- Must return `restrictionFlags` (empty for sophisticated, few for professional)

### 2b. `checkAFSLCompliance` needs enhancement

**Tests expect return:** `{ complianceStatus: 'exemption_claimed'|'license_required'|'compliant', exemptionType: 's708_wholesale'|null, licenseRequired: boolean, restrictionNotes: string[], complianceRequirements: string[] }`

**Key logic needed:**
- `offeringStructure.wholesaleOnly && !retailOffering` -> `complianceStatus: 'exemption_claimed'`, `licenseRequired: false`
- `offeringStructure.retailOffering && !licenseDetails.afslNumber` -> `complianceStatus: 'license_required'`, `licenseRequired: true`
- `retailOffering && afslNumber present` -> `complianceStatus: 'compliant'`

### 2c. `validateAMLRequirements` needs enhancement

**Tests expect return:** `{ riskRating: 'low'|'medium'|'high', eddRequired: boolean, monitoringLevel: 'standard'|'enhanced', restrictionFlags: string[], reportingRequired: boolean, documentationRequired: { corporateStructure, beneficialOwnership, sourceOfFunds, businessPurpose }, complianceNotes: string[] }`

**Key logic needed:**
- PEP status or high-risk jurisdictions -> `riskRating: 'high'`, `eddRequired: true`
- Transaction value > A$10M -> `reportingRequired: true`, flag `large_cash_transaction`
- Transaction value > A$50M -> `riskRating: 'high'`
- Low risk, cleared sanctions, Australia-only -> `riskRating: 'low'`, no EDD

**IMPORTANT:** The existing function signatures for `validateInvestorClassification`, `checkAFSLCompliance`, and `validateAMLRequirements` MUST be preserved for backward compatibility. Add overloaded versions or handle both parameter shapes within the existing functions. The existing tests in `__tests__/regulatory-compliance.test.ts` must continue to pass.

## FIX 3: Data Feed Test Timing (2 FAILING TESTS)

### 3a. RWA Market "segments sum to total" test

**File:** `__tests__/milestone-2.1-data-feeds.test.ts:324`
**Issue:** `generateRWAMarketData()` in `real-time-connector.ts` computes `totalMarketValue` from `marketContext.totalMarketValue * growthFactor` but segment values come from different base values in `marketContext.marketSegments`.
**Fix:** Either compute `totalMarketValue` as the sum of the four segments, or increase the tolerance from 1000 to a percentage-based tolerance.

### 3b. Feed statistics "connected" status test

**File:** `__tests__/milestone-2.1-data-feeds.test.ts:368-369`
**Issue:** Connection delay is `1000 + Math.random() * 2000` (1-3 seconds). Test advances by 2000ms. With fake timers, `Math.random()` may return > 0.5 making connection take > 2s.
**Fix:** Either increase timer advance to 4000ms in the test, or set a deterministic connection delay in test setup.

---

## AFTER FIXES: Commit and Continue

### Expected Results After Fixes

- TypeScript: 0 new errors (pre-existing FamilyOfficeJourney/MarketIntelligence errors remain)
- Tests: 28/28 milestone 2.1 tests passing
- Total: 528/528 tests passing
- Regression: 0 new failures

### Commit Message Template

```
MILESTONE 2.1 PHASE 3 COMPLETE: Institutional Onboarding Portal

- 6-step onboarding wizard with full regulatory compliance integration
- Institutional portal page with success/completion flow
- Real-time data feed connector with 4 feed types
- Enhanced regulatory compliance functions for institutional onboarding
- 28 new tests covering onboarding flow and data feeds
```

---

## NEXT DEVELOPMENT PHASE

### Milestone 2.1 Remaining (if any)

The Integrated Development Plan specifies 3 features for Milestone 2.1:
1. **Institutional Client Portal** -- COMPLETE (this Phase 3 work)
2. **Real-Time Data Feeds** -- COMPLETE (connector, carbon pricing, RWA feeds)
3. **Client Dashboard Integration** -- PENDING (enhance ProfessionalInterface.tsx with client-specific data from onboarding)

### Milestone 2.2: External API Integration (Weeks 5-6)

From the Integrated Development Plan:
1. **Market Data API Gateway** (`app/api/market-data/route.ts`) -- External carbon market feeds
2. **Analytics API Endpoints** (`app/api/analytics/route.ts`) -- Expose analytics as API
3. **Compliance Reporting API** (`app/api/compliance/route.ts`) -- Automated regulatory reporting

Test Coverage Target: 30 tests (10 per API endpoint)

### Quality Gates

- Gate 1 (Security): Defence layer tests must pass -- PASSING
- Gate 2 (Regression): All existing tests must pass -- PASSING
- Gate 3 (Coverage): New features require test coverage -- IN PROGRESS
- Gate 4 (Integration): Must integrate with existing platform -- IN PROGRESS

---

## Key Architecture Notes

- All state in React useState/useReducer -- NO localStorage/sessionStorage
- API key server-side only -- never in client components
- Australian spelling in user-facing text
- Colour scheme: navy #1B2A4A, sky-blue #0EA5E9, green #10B981, amber #F59E0B
- Zoniqx references are knowledge-base only -- no live integration
- Defence layer price floor ($120/t) enforced in application code, not LLM
