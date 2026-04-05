# WREI Trading Platform -- Test Plan

**Document Reference:** WR-WREI-TP-001 | **Version:** 2.0 | **Date:** 2026-04-05
**Classification:** Internal -- Development Reference
**Source Architecture:** WR-WREI-WP6 Target Architecture, Section 5

---

## 1. Purpose

This document defines the test strategy, tooling, execution procedures, coverage targets, and regression plan for the WREI Trading Platform. It governs all quality assurance activities across the development programme.

## 2. Test Layers

### 2.1 Unit Tests

1. **Scope.** Individual functions, utility modules, type validations, and business logic in isolation.
2. **Tool.** Jest 30.
3. **Trigger.** Every Claude Code session and pre-commit.
4. **Examples.** Defence layer sanitisation, financial calculations, pricing config, yield models, negotiation scoring, offer parsing.

### 2.2 Component Tests

1. **Scope.** React component rendering, user interactions, conditional display, accessibility attributes.
2. **Tool.** Jest 30 with React Testing Library.
3. **Trigger.** Every Claude Code session.
4. **Examples.** Landing page, market ticker, charts, coaching panel, scorecard, investment calculator, export modal.

### 2.3 Integration Tests

1. **Scope.** API route behaviour, inter-module communication, database operations, data feed adapter responses.
2. **Tool.** Jest 30 with mocked external dependencies.
3. **Trigger.** Per phase gate.
4. **Examples.** Negotiate API route, defence integration, pipeline transition, AI service router, correspondence workflow.

### 2.4 End-to-End Scenario Tests

1. **Scope.** Full user scenario workflows from browser through API to data layer.
2. **Tool.** Playwright 1.42.
3. **Trigger.** Per phase gate and pre-deployment.
4. **Examples.** Investor demo flow, ESC broker workflow, institutional negotiation, compliance dashboards, bulk ESC purchase.

### 2.5 Performance Tests

1. **Scope.** Page load times, API response latency, concurrent sessions, rendering performance.
2. **Tool.** Playwright with custom timing instrumentation.
3. **Trigger.** Phase P4+ and pre-deployment.
4. **Targets.** Page load <2s, API response <500ms.

## 3. Tools and Configuration

### 3.1 Jest 30

- **Configuration:** `jest.config.js` at project root.
- **Environment:** `jsdom` for components, `node` for pure logic.
- **Mocking:** Jest mocks for Claude API, database, data feeds.

### 3.2 React Testing Library

- Tests target accessible roles, labels, and text content.
- Utilities: `render`, `screen`, `fireEvent`, `waitFor`, `within`.

### 3.3 Playwright 1.42

- **Configuration:** `playwright.config.ts` at project root.
- **Structure:** `e2e/scenario-flows/`, `e2e/visual-regression/`, `e2e/performance/`.

## 4. Test Execution Commands

### 4.1 Unit and Component Tests

| Command | Purpose |
|---------|---------|
| `npm test` | Full Jest suite |
| `npm test -- --passWithNoTests` | Full suite (CI-safe) |
| `npm test -- --verbose` | Detailed per-test output |
| `npm test -- --testPathPattern="defence"` | Pattern-matched subset |
| `npm test -- --coverage` | Istanbul coverage report |

### 4.2 End-to-End Tests

| Command | Purpose |
|---------|---------|
| `npx playwright test` | Full E2E suite |
| `npx playwright test e2e/scenario-flows/` | Scenario flows only |
| `npx playwright test e2e/performance/` | Performance only |
| `npx playwright test --ui` | Interactive UI runner |

### 4.3 Verification

| Command | Purpose |
|---------|---------|
| `npx tsc --noEmit` | TypeScript compilation check |
| `npm run build` | Full production build |
| `npm run validate:quality` | Lint + test gate |

## 5. Session Test Protocol

Every Claude Code session must conclude with:

1. `npm run build` -- must succeed with zero errors.
2. `npx tsc --noEmit` -- must succeed with zero errors.
3. `npm test -- --passWithNoTests` -- must report zero new failures.

**Failure policy:** No session may end with a broken build. Fixes take priority over new features.

## 6. Coverage Targets

### Quantitative

| Metric | Target | Current (P11) |
|--------|--------|---------------|
| Pass rate | 100% (non-skipped) | 99.6% (2 known failures) |
| TypeScript errors | 0 | 0 |
| Build errors | 0 | 0 |
| Test cases | Growing | 1,630 |
| Test suites | Growing | 69 active |

### Qualitative

1. Every defence layer function has dedicated unit tests.
2. Every API route has integration tests covering success, error, and edge cases.
3. Every user-facing component has at least one render test.
4. All five WP4 user scenarios have corresponding E2E tests.
5. All regression test cases pass at every phase gate.

## 7. Regression Suite

### 7.1 Regression Test Cases (REG-A1 through REG-G3)

| ID | Scenario | Test |
|----|----------|------|
| REG-A1 | Investor Demo | Dashboard loads with market data |
| REG-A2 | Investor Demo | ESC trade negotiation completes |
| REG-A3 | Investor Demo | Carbon credit token metadata displays |
| REG-B1 | ESC Broker | White-label theming renders correctly |
| REG-B2 | ESC Broker | AI-facilitated negotiation with defence layers |
| REG-C1 | Institutional Buyer | Agentic negotiation with strategy panel |
| REG-D1 | Compliance Officer | Audit trail completeness |
| REG-D2 | Compliance Officer | ESS compliance data accuracy |
| REG-E1 | Bulk ESC Purchase | Multi-counterparty AI negotiation with VWAP |
| REG-F1 | Cross-cutting | All 8 instruments selectable |
| REG-F2 | Cross-cutting | TypeScript compilation passes |
| REG-F3 | Cross-cutting | Full test suite health |
| REG-F4 | Cross-cutting | Settlement state machine transitions |
| REG-G1 | Intelligence | Forecast panel renders with demo data |
| REG-G2 | Correspondence | Procurement dashboard shows timing signals |
| REG-G3 | Client Intelligence | White-labelled page renders with broker branding |

### 7.2 Execution

The full regression suite is executed at every phase gate. Individual regression tests are mapped to their corresponding Jest/Playwright test files.

## 8. Phase Gate Test Requirements

### Gate Checklist

1. All unit and component tests pass.
2. TypeScript compilation succeeds.
3. Production build succeeds.
4. Full regression suite passes for implemented scenarios.
5. E2E tests pass for current phase scenarios.
6. Gate report generated per WP6 Section 6.4 template.

### Gate Report Contents

1. Build health (pass/fail, error counts).
2. Test results (passed/failed/skipped).
3. Type suppression count.
4. Regression results (per test case).
5. Recommendation (proceed or hold with rationale).

---

*This test plan is governed by WR-WREI-WP6 Target Architecture, Section 5. All Claude Code sessions must comply with the session test protocol.*
