# WREI Trading Platform -- Test Coverage and Quality Assurance

**Document Version:** 2.0
**Date:** 2026-04-05

---

## 1. Testing Infrastructure

### Framework Configuration

| Tool | Version | Purpose |
|------|---------|---------|
| Jest | 30.3.0 | Unit and integration testing |
| ts-jest | 29.4.6 | TypeScript transformation for Jest |
| @testing-library/react | 16.3.2 | React component testing |
| @testing-library/jest-dom | 6.9.1 | Custom DOM matchers |
| @testing-library/user-event | 14.6.1 | User interaction simulation |
| Playwright | 1.42.1 | End-to-end browser testing |

### Jest Configuration (`jest.config.js`)

- **Preset:** ts-jest
- **Environment:** jsdom
- **Test roots:** `__tests__/`, `lib/`, `components/`
- **Timeout:** 30,000ms per test
- **Coverage:** Collected from `lib/**/*.{ts,tsx}`
- **Path mapping:** `@/*` resolves to project root

### Playwright Configuration (`playwright.config.ts`)

- **Browser targets:** Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL:** http://localhost:3000
- **Timeout:** 60,000ms per test
- **Retries:** 2 in CI, 0 in development
- **Artifacts:** Screenshots on failure, video on failure, trace on retry

---

## 2. Test Suite Inventory

### Current Metrics (as of P11, 2026-04-05)

| Metric | Value |
|--------|-------|
| **Total test suites** | 69 active + 5 E2E = 74 total |
| **Total test cases** | 1,630 (1,623 passing, 2 failing, 5 skipped) |
| **Lines of test code** | ~35,000 |
| **Pass rate** | 99.6% (2 known failures: db-connection schema count) |
| **Execution time** | ~27 seconds |

### Test Files by Category

#### Core Security & Defence (4 files)

| Test File | Tests | Focus |
|-----------|-------|-------|
| `defence-layer.test.ts` | ~30 | Input sanitisation, output validation, constraint enforcement, threat classification |
| `api-defense-integration.test.ts` | ~15 | Defence layer integration within API routes |
| `api-negotiate-route.test.ts` | ~20 | Negotiation API route with Claude API coordination |
| `regulatory-compliance.test.ts` | ~18 | AFSL, investor classification, AML, environmental standards |

#### Financial Engine (4 files)

| Test File | Tests | Focus |
|-----------|-------|-------|
| `financial-calculations.test.ts` | ~20 | IRR, NPV, carbon/asset metrics, risk-adjusted returns |
| `yield-models.test.ts` | ~15 | Revenue share, NAV-accruing, hybrid, dynamic optimisation |
| `advanced-analytics.test.ts` | ~20 | Predictive modelling, risk analysis, portfolio optimisation |
| `esg-impact-metrics.test.ts` | ~15 | ESG dashboard calculations, impact metrics, ROI projections |

#### Negotiation & Coaching (6 files)

| Test File | Tests | Focus |
|-----------|-------|-------|
| `negotiation-coaching.test.ts` | ~20 | Real-time coaching engine, tactical recommendations |
| `negotiation-history.test.ts` | ~15 | Session tracking, comparison, global statistics |
| `negotiation-scoring.test.ts` | ~15 | Score calculations, dimensions, persona benchmarks |
| `negotiation-config.test.ts` | ~15 | Pricing configuration, constraints, business rules |
| `committee-mode.test.ts` | ~25 | Committee configuration, voting, turn-taking |
| `milestone-1.1-ai-negotiation-enhancement.test.ts` | ~15 | Strategy explanations, persona alignment |

#### Market Data & Intelligence (9 files)

| Test File | Tests | Focus |
|-----------|-------|-------|
| `milestone-2.1-data-feeds.test.ts` | ~20 | Real-time data feed connector, subscriptions |
| `milestone-2.2-market-data-api.test.ts` | ~15 | Market data API gateway |
| `milestone-2.2-analytics-api.test.ts` | ~15 | Analytics API endpoints |
| `milestone-2.2-compliance-api.test.ts` | ~15 | Compliance API endpoints |
| `ticker-data.test.ts` | ~10 | Market ticker data provider |
| `esc-market-context.test.ts` | ~10 | NSW ESC pricing index validation |
| `milestone-2.3-performance-core.test.ts` | ~15 | Core performance monitoring |
| `milestone-2.3-api-optimization.test.ts` | ~15 | API caching, endpoint optimisation |
| `milestone-2.3-performance-monitoring.test.ts` | ~15 | Performance system, load testing |

#### Phase Architecture Tests (13 files)

| Test File | Tests | Focus |
|-----------|-------|-------|
| `phase1-dual-token-architecture.test.ts` | ~20 | Dual token system types |
| `phase2-financial-modeling.test.ts` | ~20 | Revenue models, analytics |
| `phase3.1-institutional-personas.test.ts` | ~20 | 6 institutional personas |
| `phase3.2-advanced-negotiation-contexts.test.ts` | ~15 | Market dynamics, pathways |
| `phase3.3-risk-profile-integration.test.ts` | ~15 | Risk assessment framework |
| `phase4.2-token-metadata-system.test.ts` | ~15 | Token metadata, provenance |
| `phase4.2-integration-workflow.test.ts` | ~15 | Cross-layer integration |
| `phase5.1-market-context-integration.test.ts` | ~15 | Market intelligence context |
| `phase5.2-competitive-positioning-system.test.ts` | ~15 | Competitive analysis |
| `phase6.1-basic-dashboard.test.ts` | ~10 | Dashboard structure |
| `phase6.1-institutional-dashboard.test.ts` | ~15 | Institutional views |
| `phase6.1-institutional-dashboard-simple.test.ts` | ~10 | Simplified validation |
| `phase6.2-professional-investment-interface.test.tsx` | ~15 | Professional interface |

#### UI Component Tests (11 files)

| Test File | Tests | Focus |
|-----------|-------|-------|
| `landing-page.test.tsx` | ~10 | Bloomberg Terminal dashboard |
| `market-ticker.test.tsx` | ~10 | Scrolling ticker rendering |
| `chart-components.test.tsx` | ~10 | WREI Recharts components |
| `investment-calculator.test.tsx` | ~15 | Calculator interactions |
| `coaching-panel.test.tsx` | ~10 | Coaching UI |
| `comparison-dashboard.test.tsx` | ~10 | Session comparison |
| `scorecard.test.tsx` | ~10 | Performance scorecard |
| `replay-viewer.test.tsx` | ~10 | Replay viewer |
| `regulatory-map.test.tsx` | ~10 | Compliance visualisation |
| `provenance-visualiser.test.tsx` | ~10 | Blockchain provenance |
| `export-modal.test.tsx` | ~10 | Export UI |

#### Integration & Infrastructure (8 files)

| Test File | Tests | Focus |
|-----------|-------|-------|
| `integration-system-functionality.test.ts` | ~20 | Cross-module integration |
| `core-scenarios-e2e.test.ts` | ~15 | Core platform scenarios |
| `onboarding-pipeline.test.ts` | ~15 | Pipeline transition |
| `api-documentation.test.ts` | ~10 | API docs validation |
| `db-connection.test.ts` | ~10 | Database schema/connection |
| `demo-state-manager-esc.test.ts` | ~10 | Demo state management |
| `setup.test.ts` | ~5 | Framework regression |
| `export-generation.test.ts` | ~10 | Export utilities |

#### AI Engine Tests (3 files)

| Test File | Tests | Focus |
|-----------|-------|-------|
| `orchestration/orchestration-engine.test.ts` | ~20 | Demo orchestration |
| `generation/dynamic-scenario-engine.test.ts` | ~20 | Scenario generation |
| `analytics/intelligent-analytics-engine.test.ts` | ~20 | AI analytics |

#### E2E Tests (5 files)

| Test File | Focus |
|-----------|-------|
| `e2e/scenario-flows/basic-platform.spec.ts` | Navigation and interaction |
| `e2e/scenario-flows/infrastructure-fund-discovery.spec.ts` | Fund discovery workflow |
| `e2e/scenario-flows/infrastructure-fund-complete.spec.ts` | Full fund scenario |
| `e2e/performance/load-time-validation.spec.ts` | Page load performance |
| `e2e/visual-regression/ui-consistency.spec.ts` | Visual regression |

---

## 3. Test Coverage Analysis

### Coverage by Subsystem

| Subsystem | Test Files | Coverage Level | Notes |
|-----------|------------|---------------|-------|
| Negotiation Engine | 6 | High | All personas, constraints, coaching, scoring |
| Defence/Security | 4 | High | Sanitisation, validation, enforcement, canary tokens |
| Financial Calculations | 4 | High | IRR, NPV, Monte Carlo, yields, risk profiles |
| AI Service Router | 3 | Medium | Engine tests cover routing; guards not isolated |
| Correspondence Engine | 0 | Not Covered | Business logic tested via API routes only |
| Market Intelligence | 2 | Medium | API endpoints tested; forecasting models in Python |
| Client Management | 0 | Not Covered | Covered by API route integration tests |
| Market Data Pipeline | 3 | Medium | Feeds, ticker, ESC context tested |
| White-Label System | 0 | Not Covered | Runtime resolution only |
| UI Components | 11 | Medium-High | Key components tested |
| Database Layer | 1 | Low | Schema validation only |
| Python Forecasting | 0 | N/A | Python tests not in Jest suite |

---

## 4. Quality Gates

### Pre-Session Protocol

Every Claude Code session concludes with:

1. `npm run build` -- must succeed with zero errors
2. `npx tsc --noEmit` -- must succeed with zero errors
3. `npm test -- --passWithNoTests` -- must report zero new failures

### npm Scripts

| Script | Purpose |
|--------|---------|
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Coverage report |
| `npm run test:e2e` | Playwright E2E |
| `npm run test:e2e:ui` | Playwright with UI |
| `npm run validate:quality` | Full quality gate |

---

## 5. Known Gaps and Priorities

### Critical Gaps (should be addressed)

1. **Correspondence Engine** -- No dedicated tests for procurement-trigger, ai-draft-engine, offer-parser, negotiation-manager, settlement-facilitation. These are the core broker workflow modules.

2. **Database Queries** -- No tests for query modules (trades, negotiations, correspondence, clients). Currently depend on live DB.

3. **Python Forecasting** -- No automated test suite for the forecasting models. Backtesting (`backtest_engine.py`) validates accuracy but is not in CI.

### Medium Gaps

4. **White-Label Resolution** -- No tests for config resolution logic.
5. **AI Guards** -- Rate limiter, cost guard, timeout guard lack isolated unit tests.
6. **Client Intelligence Page** -- No component test for the public-facing page.

### Low Priority

7. **Design System** -- Token values untested (low risk, static config).
8. **Demo Mode** -- State manager tested; tour mechanics are not.
