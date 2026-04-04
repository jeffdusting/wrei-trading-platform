# WREI Trading Platform -- Master Implementation Plan v3.0

**Created:** 2026-03-23
**Author:** Claude Opus 4.6 (development planning session)
**Scope:** 16 Enhancements across 4 Phases (4-week execution)
**Baseline:** 623 tests passing, 35 test suites, main branch at `5b8e1f2`
**Live:** https://wrei-trading-platform.vercel.app

---

## Table of Contents

- [Part A: Master Development Plan (16 Enhancements)](#part-a-master-development-plan)
- [Part B: Phase-by-Phase Execution Strategy](#part-b-phase-by-phase-execution-strategy)
- [Part C: Regression Testing Framework](#part-c-regression-testing-framework)
- [Part D: Documentation Maintenance Strategy](#part-d-documentation-maintenance-strategy)
- [Part E: Future Context Prompt](#part-e-future-context-prompt)

---

## Current Architecture Inventory

### Pages (App Router)
| Route | File | Lines | Purpose |
|-------|------|-------|---------|
| `/` | `app/page.tsx` | 80 | Landing page (basic) |
| `/negotiate` | `app/negotiate/page.tsx` | 1,842 | Main negotiation interface |
| `/institutional/portal` | `app/institutional/portal/page.tsx` | ~130 | Institutional onboarding wizard |
| `/scenario` | `app/scenario/page.tsx` | 67 | Scenario simulation selector |
| `/simulate` | `app/simulate/page.tsx` | 74 | Simulation engine page |
| `/performance` | `app/performance/page.tsx` | ~130 | Performance dashboard |

### API Routes
| Endpoint | File | Lines | Purpose |
|----------|------|-------|---------|
| `/api/negotiate` | `app/api/negotiate/route.ts` | 1,363 | Claude API negotiation engine |
| `/api/analytics` | `app/api/analytics/route.ts` | 661 | Analytics calculations API |
| `/api/compliance` | `app/api/compliance/route.ts` | 605 | Compliance reporting API |
| `/api/market-data` | `app/api/market-data/route.ts` | 374 | Market data feeds API |
| `/api/metadata` | `app/api/metadata/route.ts` | 133 | Token metadata API |
| `/api/performance` | `app/api/performance/route.ts` | 456 | Performance monitoring API |

### Library Modules (16,175 lines total)
| Module | Lines | Purpose |
|--------|-------|---------|
| `lib/types.ts` | 484 | Core TypeScript definitions |
| `lib/defence.ts` | 373 | Input sanitisation, output validation |
| `lib/negotiation-config.ts` | 642 | Pricing, constraints, token config |
| `lib/negotiation-strategy.ts` | 398 | AI strategy explanation system |
| `lib/personas.ts` | 175 | 11 buyer persona definitions |
| `lib/financial-calculations.ts` | 732 | IRR, NPV, cash-on-cash |
| `lib/yield-models.ts` | 687 | Revenue share, NAV accruing |
| `lib/professional-analytics.ts` | 886 | Monte Carlo, portfolio optimisation |
| `lib/market-intelligence.ts` | 1,472 | Market context, competitive analysis |
| `lib/regulatory-compliance.ts` | 1,228 | AFSL, AML/CTF, tax treatment |
| `lib/export-utilities.ts` | 729 | PDF/Excel report generation |
| `lib/performance-monitor.ts` | 300 | System performance tracking |
| `lib/institutional-onboarding.ts` | 386 | Onboarding state management |
| `lib/risk-profiles.ts` | 660 | Risk assessment and profiling |
| `lib/token-metadata.ts` | 988 | Blockchain provenance metadata |
| `lib/api-helpers.ts` | 440 | Shared API utilities |
| `lib/data-feeds/*` | 2,071 | Carbon pricing, RWA, real-time feeds |
| `lib/architecture-layers/*` | 1,772 | Measurement, verification, tokenisation |
| `lib/simulation/*` | 1,752 | Scenario engine, mock API, tracking |

### Components (21,971 lines total)
| Category | Count | Lines | Key Components |
|----------|-------|-------|----------------|
| Core UI | 12 | 7,673 | NegotiatePage, InstitutionalDashboard, ProfessionalInterface |
| Institutional | 7 | 3,001 | OnboardingWizard, AFSL, KYC, Identity forms |
| Professional | 3 | 835 | BloombergLayout, AccessibilityWrapper, DataGrid |
| Scenarios | 5 | 5,866 | DeFi, ESG, FamilyOffice, Infrastructure, Sovereign |
| Simulation | 2 | 864 | ScenarioSelector, ScenarioSimulationEngine |
| UI Pro | 2 | 965 | ProfessionalDataGrid, ProfessionalMetricsDashboard |

### Test Suite
- **35 test suites**, **623 tests**, **100% pass rate**
- **15,713 lines** of test code across 36 test files
- Jest + ts-jest, jsdom environment
- Custom matchers: `toBeValidAUM`, `toHaveValidWREIYield`, `toContainInstitutionalTerms`, `toBeOneOf`

### Dependencies
- **Runtime:** next@14.1.0, react@18.2.0, @anthropic-ai/sdk
- **Dev:** jest@30.3.0, @testing-library/react@16.3.2, ts-jest, @playwright/test
- **NOT installed (needed):** recharts (Phase 1), any Zoniqx packages (NEVER install per CLAUDE.md)

---

# Part A: Master Development Plan

## Enhancement B2: Unified Navigation Shell

**Priority:** Phase 1 (Week 1) | **Risk:** LOW | **Effort:** 4-6 hours

### Problem Statement
Currently each page has its own ad-hoc header. No consistent navigation exists between `/`, `/negotiate`, `/institutional/portal`, `/scenario`, `/simulate`, and `/performance`. Users cannot discover or navigate between features.

### Implementation Steps

1. **Create shared navigation component**
   - New file: `components/navigation/NavigationShell.tsx`
   - Responsive top navbar with Water Roads / WREI branding
   - Navigation links: Home, Negotiate, Institutional, Scenarios, Performance
   - Active route highlighting using `usePathname()` from `next/navigation`
   - Mobile hamburger menu for responsive design
   - Colour scheme: `#1B2A4A` bg, `#0EA5E9` active, `#FFFFFF` text

2. **Create layout wrapper**
   - Modify: `app/layout.tsx`
   - Wrap `{children}` with NavigationShell
   - Preserve existing metadata, Inter font
   - Add `globals.css` smooth scrolling if not present

3. **Remove page-specific headers**
   - Modify: `app/page.tsx` -- remove `<header>` block (lines 7-15)
   - Modify: `app/performance/page.tsx` -- remove nav header (lines 10-23)
   - Modify: `app/negotiate/page.tsx` -- remove any inline header
   - Ensure each page focuses on content only

4. **Add breadcrumb support**
   - Optional breadcrumb component for nested routes like `/institutional/portal`

### Files to Modify
- **New:** `components/navigation/NavigationShell.tsx`
- **Modify:** `app/layout.tsx`, `app/page.tsx`, `app/performance/page.tsx`, `app/negotiate/page.tsx`

### Testing Strategy
- New: `__tests__/navigation-shell.test.tsx` (8-10 tests)
  - Renders all navigation links
  - Active state matches current route
  - Mobile menu toggle works
  - All routes accessible
  - Branding elements present
- Regression: Run full `npm test` -- all 623 must pass

### Documentation Updates
- CLAUDE.md: Add `components/navigation/` to Architecture section
- CLAUDE.md: Update file structure diagram

### Dependencies
- None (pure React component, no external libs)

### Regression Checkpoint
- Run `npm test` after completion
- Verify `npm run build` succeeds (TypeScript compilation)
- Manual visual check of all 6 pages

---

## Enhancement B1: Data Visualisation Layer (Recharts)

**Priority:** Phase 1 (Week 1) | **Risk:** MEDIUM | **Effort:** 6-8 hours

### Problem Statement
All dashboards use text-based numeric displays. No charts or graphs exist for market data, performance metrics, portfolio allocation, or pricing trends. Recharts is the standard lightweight React charting library.

### Implementation Steps

1. **Install Recharts**
   ```bash
   npm install recharts
   ```
   - Verify bundle size impact (recharts is tree-shakeable)
   - Confirm TypeScript types included

2. **Create chart wrapper components**
   - New file: `components/charts/WREILineChart.tsx` -- time series data (prices, yields)
   - New file: `components/charts/WREIPieChart.tsx` -- portfolio allocation, market segments
   - New file: `components/charts/WREIBarChart.tsx` -- comparative metrics, benchmarks
   - New file: `components/charts/WREIAreaChart.tsx` -- market cap, volume trends
   - New file: `components/charts/index.ts` -- barrel export
   - All use WREI colour scheme from CLAUDE.md
   - Australian dollar formatting, responsive sizing

3. **Create chart data transformers**
   - New file: `lib/chart-data-transforms.ts`
   - Functions to convert existing data structures into Recharts-compatible format
   - `transformMarketDataToTimeSeries()` -- from market-intelligence.ts data
   - `transformPortfolioToAllocation()` -- from professional-analytics.ts data
   - `transformPerformanceToMetrics()` -- from performance-monitor.ts data
   - `transformYieldComparisonData()` -- from yield-models.ts data

4. **Integrate charts into existing dashboards**
   - Modify: `components/InstitutionalDashboard.tsx` -- add portfolio allocation pie chart
   - Modify: `components/ProfessionalInterface.tsx` -- add performance line chart
   - Modify: `components/MarketIntelligenceDashboard.tsx` -- add market trends area chart
   - Modify: `components/PerformanceDashboard.tsx` -- add system metrics bar chart

### Files to Modify
- **New:** `components/charts/WREILineChart.tsx`, `WREIPieChart.tsx`, `WREIBarChart.tsx`, `WREIAreaChart.tsx`, `index.ts`
- **New:** `lib/chart-data-transforms.ts`
- **Modify:** `package.json` (add recharts dependency)
- **Modify:** 4 existing dashboard components

### Testing Strategy
- New: `__tests__/chart-components.test.tsx` (12-15 tests)
  - Each chart type renders without errors
  - Correct colour scheme applied
  - Empty data handled gracefully
  - Responsive container sizing
  - Data transformer functions produce valid output
- New: `__tests__/chart-data-transforms.test.ts` (10-12 tests)
  - Each transformer handles expected input
  - Edge cases: empty arrays, null values, extreme numbers
  - Output format matches Recharts expectations
- Regression: All 623 existing tests must pass (chart additions are additive)

### Documentation Updates
- CLAUDE.md: Add `recharts` to Technology Stack
- CLAUDE.md: Add `components/charts/` to Architecture

### Dependencies
- Enhancement B2 (Navigation Shell) should be done first so charts render within consistent layout

### Regression Checkpoint
- Run `npm test` after each chart component
- Run `npm run build` to verify no SSR issues with Recharts (client-only)
- Verify Vercel deployment succeeds (bundle size within free tier limits)

---

## Enhancement B3: Landing Page Redesign

**Priority:** Phase 1 (Week 1) | **Risk:** LOW | **Effort:** 3-4 hours

### Problem Statement
Current landing page (`app/page.tsx`, 80 lines) is a minimal placeholder with emoji icons, basic feature cards, and a single CTA. It does not showcase the platform's depth (negotiation AI, institutional onboarding, scenario simulation, analytics, performance monitoring).

### Implementation Steps

1. **Redesign hero section**
   - Larger, more impactful headline
   - Animated stats counter (credits verified, settlement time, jurisdictions)
   - Professional background pattern or gradient

2. **Add feature showcase section**
   - 6 feature cards with proper SVG icons (not emojis)
   - AI Negotiation, Institutional Portal, Scenario Simulation, Market Intelligence, Compliance, Performance
   - Each card links to its respective page

3. **Add market stats section**
   - Pull from `WREI_TOKEN_CONFIG` and `PRICING_INDEX` in `lib/negotiation-config.ts`
   - Display: carbon price, market cap, verification standards, settlement speed

4. **Add platform navigation section**
   - Quick-start guide cards for different user types
   - Investor pathway, Developer pathway, Compliance pathway

5. **Add footer with proper Water Roads branding**
   - Multi-column footer
   - Platform links, legal disclaimers, demo notice

### Files to Modify
- **Modify:** `app/page.tsx` (complete rewrite, currently 80 lines, target ~200-300 lines)

### Testing Strategy
- New: `__tests__/landing-page.test.tsx` (8-10 tests)
  - All feature cards render with correct links
  - Market stats display correct values from config
  - Navigation links work
  - Responsive layout checks
  - Demo environment notice present
- Regression: Full suite unaffected (landing page is standalone)

### Documentation Updates
- None (landing page is UI-only, no architectural change)

### Dependencies
- Enhancement B2 (Navigation Shell) should be done first

### Regression Checkpoint
- Run `npm test` after completion
- Run `npm run build` for TypeScript/SSR validation
- Manual visual review on mobile and desktop

---

## Enhancement A1: Negotiation Replay and Comparison

**Priority:** Phase 2 (Week 2) | **Risk:** MEDIUM | **Effort:** 8-10 hours

### Problem Statement
Completed negotiations vanish when the page refreshes (no localStorage per CLAUDE.md). Users cannot review past negotiation strategies, compare outcomes across personas, or learn from different approaches. Currently state is held only in `useState`.

### Implementation Steps

1. **Create negotiation history state manager**
   - New file: `lib/negotiation-history.ts`
   - In-memory session store (compliant with no-localStorage rule)
   - `NegotiationSession` interface: id, persona, messages, outcome, metrics, timestamps
   - `NegotiationHistoryManager` class with add/get/list/compare methods
   - Maximum 10 sessions per browser session (memory-safe)
   - Comparison functions: outcome vs persona, price achieved vs anchor, rounds to close

2. **Create replay viewer component**
   - New file: `components/negotiation/ReplayViewer.tsx`
   - Message-by-message replay with timeline slider
   - Highlights: price concessions, strategy changes, emotional shifts
   - Side panel showing state at each point (price, phase, emotion)

3. **Create comparison dashboard**
   - New file: `components/negotiation/ComparisonDashboard.tsx`
   - Side-by-side comparison of 2-3 negotiation sessions
   - Metrics table: final price, rounds, concessions, outcome
   - Strategy effectiveness radar chart (uses Recharts from B1)
   - Export comparison as report data

4. **Integrate into negotiate page**
   - Modify: `app/negotiate/page.tsx`
   - Add "View History" tab/panel alongside existing interface
   - Store completed negotiations in in-memory history
   - "Compare" button when 2+ sessions exist

### Files to Modify
- **New:** `lib/negotiation-history.ts`, `components/negotiation/ReplayViewer.tsx`, `components/negotiation/ComparisonDashboard.tsx`
- **Modify:** `app/negotiate/page.tsx`

### Testing Strategy
- New: `__tests__/negotiation-history.test.ts` (15-18 tests)
  - Add/retrieve sessions
  - Maximum session limit enforced
  - Comparison calculations correct
  - Edge cases: single session, identical outcomes
- New: `__tests__/replay-viewer.test.tsx` (8-10 tests)
  - Renders message timeline
  - State display at each point accurate
  - Navigation controls work
- Regression: Ensure negotiate page still functions identically when no history exists

### Documentation Updates
- CLAUDE.md: Add `lib/negotiation-history.ts` to Architecture
- CLAUDE.md: Note that session history is in-memory only (per no-localStorage rule)

### Dependencies
- Enhancement B1 (Recharts) for comparison charts
- Enhancement B2 (Navigation Shell) for layout consistency

### Regression Checkpoint
- Run `npm test` after history manager
- Run `npm test` after UI components
- Full suite after integration with negotiate page

---

## Enhancement A4: Outcome Scoring and Benchmarking

**Priority:** Phase 2 (Week 2) | **Risk:** LOW | **Effort:** 5-6 hours

### Problem Statement
After a negotiation completes, there is no scoring or benchmarking. Users do not know if they achieved a good outcome. No metrics compare their performance against optimal strategies or other persona types.

### Implementation Steps

1. **Create scoring engine**
   - New file: `lib/negotiation-scoring.ts`
   - `NegotiationScorecard` interface: priceScore, efficiencyScore, strategyScore, overallScore
   - Score dimensions:
     - Price Achievement: how close to anchor vs floor (0-100)
     - Efficiency: rounds taken vs optimal (fewer = better)
     - Strategy Diversity: variety of argument types used
     - Emotional Intelligence: warmth/dominance management
     - Information Extraction: how much the agent revealed
   - Benchmark against persona-specific expectations
   - Letter grade system: A+, A, B+, B, C+, C, D, F

2. **Create scorecard display component**
   - New file: `components/negotiation/Scorecard.tsx`
   - Visual scorecard with radar chart (Recharts)
   - Grade badge with colour coding
   - Improvement suggestions based on score
   - "Share" button generating text summary

3. **Integrate with negotiation completion**
   - Modify: `app/negotiate/page.tsx`
   - Calculate and display scorecard when `negotiationComplete === true`
   - Connect scoring to history (A1) for trend tracking

### Files to Modify
- **New:** `lib/negotiation-scoring.ts`, `components/negotiation/Scorecard.tsx`
- **Modify:** `app/negotiate/page.tsx`

### Testing Strategy
- New: `__tests__/negotiation-scoring.test.ts` (15-20 tests)
  - Score calculations for each dimension
  - Grade boundaries correct
  - Persona-specific benchmarks applied
  - Edge cases: perfect score, zero concession, max rounds
- New: `__tests__/scorecard.test.tsx` (6-8 tests)
  - Renders all score dimensions
  - Grade badge displays correctly
  - Improvement suggestions relevant to scores
- Regression: Negotiate page functions identically until completion

### Documentation Updates
- CLAUDE.md: Add scoring system to Architecture

### Dependencies
- Enhancement B1 (Recharts) for radar chart
- Enhancement A1 (History) for trend data (optional, can work standalone)

### Regression Checkpoint
- Run `npm test` after scoring engine
- Run `npm test` after UI integration

---

## Enhancement C1: Live Market Data Ticker

**Priority:** Phase 2 (Week 2) | **Risk:** LOW | **Effort:** 4-5 hours

### Problem Statement
Market data from `lib/data-feeds/` and `lib/negotiation-config.ts` (PRICING_INDEX) is static. There is no visual ticker showing carbon prices, ESC prices, or market conditions that would give the platform a real-time trading feel.

### Implementation Steps

1. **Create ticker data provider**
   - New file: `lib/ticker-data.ts`
   - Simulated real-time updates using `setInterval` (demo appropriate)
   - Base values from `PRICING_INDEX` in negotiation-config.ts
   - Small random walks around base values (realistic volatility)
   - Data shape: `{ symbol, price, change, changePercent, timestamp }`
   - Tickers: WREI-C (carbon), WREI-ESC (ESC), VCM-SPOT, RWA-IDX

2. **Create ticker bar component**
   - New file: `components/market/MarketTicker.tsx`
   - Horizontally scrolling ticker tape (CSS animation)
   - Green/red for positive/negative changes
   - Click to expand detail panel
   - Configurable update interval (default 5s for demo)

3. **Create market status indicator**
   - New file: `components/market/MarketStatus.tsx`
   - Small badge: "Market Open" / "After Hours" (simulated)
   - Shows last update timestamp

4. **Integrate into layout**
   - Modify: `components/navigation/NavigationShell.tsx` (from B2)
   - Add ticker below navbar or at page top
   - Optional: collapsible for mobile

### Files to Modify
- **New:** `lib/ticker-data.ts`, `components/market/MarketTicker.tsx`, `components/market/MarketStatus.tsx`
- **Modify:** `components/navigation/NavigationShell.tsx`

### Testing Strategy
- New: `__tests__/ticker-data.test.ts` (10-12 tests)
  - Initial values match PRICING_INDEX
  - Random walk stays within bounds
  - Update function produces valid data
  - All required tickers present
- New: `__tests__/market-ticker.test.tsx` (6-8 tests)
  - Renders all ticker symbols
  - Green/red colour coding correct
  - Handles zero change gracefully
- Regression: Navigation shell still renders correctly

### Documentation Updates
- CLAUDE.md: Add ticker system to Architecture

### Dependencies
- Enhancement B2 (Navigation Shell) for placement

### Regression Checkpoint
- Run `npm test` after ticker data module
- Run `npm test` after UI components

---

## Enhancement A2: Real-Time Coaching Panel

**Priority:** Phase 2 (Week 2) | **Risk:** MEDIUM | **Effort:** 6-8 hours

### Problem Statement
The existing `NegotiationStrategyPanel` (208 lines) shows AI strategy explanations, but there is no real-time coaching for the human user. The panel explains what the AI is doing but does not suggest what the buyer should try next.

### Implementation Steps

1. **Create coaching engine**
   - New file: `lib/negotiation-coaching.ts`
   - Analyses current negotiation state and generates suggestions
   - Coaching categories: price tactics, information gathering, relationship building, timing
   - Considers: persona type, current phase, emotional state, rounds elapsed, concession history
   - Returns: 2-3 prioritised suggestions with brief rationale
   - Difficulty levels: beginner (explicit guidance), advanced (strategic hints)

2. **Create coaching panel component**
   - New file: `components/negotiation/CoachingPanel.tsx`
   - Expandable side panel or bottom drawer
   - Shows current suggestions with priority indicators
   - "Quick tip" for immediate next action
   - Historical coaching log for session review
   - Toggle between beginner/advanced mode

3. **Integrate with negotiate page**
   - Modify: `app/negotiate/page.tsx`
   - Add coaching panel alongside strategy panel
   - Update coaching suggestions after each message exchange
   - Respect existing state management pattern (useState only)

### Files to Modify
- **New:** `lib/negotiation-coaching.ts`, `components/negotiation/CoachingPanel.tsx`
- **Modify:** `app/negotiate/page.tsx`

### Testing Strategy
- New: `__tests__/negotiation-coaching.test.ts` (15-18 tests)
  - Suggestions vary by persona
  - Phase-appropriate guidance
  - Difficulty level filtering
  - Edge cases: first round, final round, after concession
- New: `__tests__/coaching-panel.test.tsx` (8-10 tests)
  - Renders suggestions correctly
  - Difficulty toggle works
  - Quick tip always present
- Regression: Negotiate page functions identically without coaching panel open

### Documentation Updates
- CLAUDE.md: Add coaching system to Architecture

### Dependencies
- Enhancement B2 (Navigation Shell) for layout
- Uses existing `lib/negotiation-strategy.ts` data

### Regression Checkpoint
- Run `npm test` after coaching engine
- Run `npm test` after UI integration

---

## Enhancement B4: Onboarding-to-Negotiation Pipeline

**Priority:** Phase 3 (Week 3) | **Risk:** MEDIUM | **Effort:** 6-8 hours

### Problem Statement
The institutional onboarding portal (`/institutional/portal`) completes but does not connect to the negotiation interface. After onboarding, users are directed to a non-existent `/professional` route. The onboarding data (entity type, classification, preferences) should pre-configure the negotiation.

### Implementation Steps

1. **Create pipeline state transfer**
   - New file: `lib/onboarding-pipeline.ts`
   - Maps `InstitutionalOnboardingState` to `NegotiationState` initial values
   - Translates: investor classification to persona, preferences to token type, compliance to constraints
   - In-memory state bridge (no localStorage)

2. **Create pipeline entry component**
   - New file: `components/institutional/PipelineTransition.tsx`
   - Transition screen after onboarding completion
   - Shows: "Entering negotiation as [classification] investor for [token type]"
   - Confirms parameters before launching negotiation

3. **Update onboarding completion flow**
   - Modify: `app/institutional/portal/page.tsx`
   - Replace broken `/professional` redirect with pipeline transition
   - Pass onboarding state to pipeline

4. **Update negotiate page to accept pipeline state**
   - Modify: `app/negotiate/page.tsx`
   - Accept URL search params or in-memory state from pipeline
   - Pre-select persona, token type, investor classification
   - Show "Institutional Mode" indicator in UI

### Files to Modify
- **New:** `lib/onboarding-pipeline.ts`, `components/institutional/PipelineTransition.tsx`
- **Modify:** `app/institutional/portal/page.tsx`, `app/negotiate/page.tsx`

### Testing Strategy
- New: `__tests__/onboarding-pipeline.test.ts` (12-15 tests)
  - State mapping for each persona type
  - Classification mapping correct
  - Edge cases: missing fields, partial onboarding
- New: `__tests__/pipeline-transition.test.tsx` (6-8 tests)
  - Renders transition screen with correct data
  - Navigation to negotiate page works
- Regression: Both onboarding and negotiate pages work independently

### Documentation Updates
- CLAUDE.md: Add pipeline to Architecture section
- CLAUDE.md: Document the onboarding-to-negotiation flow

### Dependencies
- Enhancement B2 (Navigation Shell) for consistent layout
- Existing institutional onboarding components

### Regression Checkpoint
- Run `npm test` after pipeline logic
- Run `npm test` after UI changes
- Verify onboarding still works standalone

---

## Enhancement D1: Competitive Positioning Visualisation

**Priority:** Phase 3 (Week 3) | **Risk:** LOW | **Effort:** 5-6 hours

### Problem Statement
`lib/market-intelligence.ts` (1,472 lines) contains extensive competitive analysis data (competitor AUM, yields, market share, differentiation) but this data is only available through text-based display. No visual competitive positioning exists.

### Implementation Steps

1. **Create positioning chart components**
   - New file: `components/market/CompetitivePositionMap.tsx`
   - Scatter plot: X = AUM/Market Share, Y = Yield, bubble size = institutional focus
   - WREI highlighted with distinct marker
   - Competitor data from `lib/market-intelligence.ts` `getCompetitorAnalysis()`
   - Uses Recharts ScatterChart from B1

2. **Create competitive matrix component**
   - New file: `components/market/CompetitiveMatrix.tsx`
   - Feature comparison matrix: WREI vs top 5 competitors
   - Categories: dMRV, settlement speed, yield, compliance, liquidity
   - Visual checkmarks/strength indicators
   - Export-friendly layout

3. **Create SWOT visualisation**
   - New file: `components/market/SWOTDiagram.tsx`
   - 4-quadrant SWOT from existing `getWREICompetitivePosition()` data
   - Interactive: click quadrant for details

4. **Integrate into Market Intelligence Dashboard**
   - Modify: `components/MarketIntelligenceDashboard.tsx`
   - Add new visualisation tabs

### Files to Modify
- **New:** `components/market/CompetitivePositionMap.tsx`, `CompetitiveMatrix.tsx`, `SWOTDiagram.tsx`
- **Modify:** `components/MarketIntelligenceDashboard.tsx`

### Testing Strategy
- New: `__tests__/competitive-positioning.test.tsx` (10-12 tests)
  - Renders all competitors from data source
  - WREI correctly highlighted
  - Matrix features accurate
  - SWOT quadrants populated
- Regression: MarketIntelligenceDashboard existing functionality preserved

### Documentation Updates
- CLAUDE.md: Note competitive visualisation components

### Dependencies
- Enhancement B1 (Recharts) for charts

### Regression Checkpoint
- Run `npm test` after each component
- Full suite after dashboard integration

---

## Enhancement D2: ESG Impact Dashboard

**Priority:** Phase 3 (Week 3) | **Risk:** LOW | **Effort:** 5-6 hours

### Problem Statement
ESG impact data exists throughout the codebase (carbon credits, CO2 reduction, sustainability scores in `lib/token-metadata.ts`, `lib/market-intelligence.ts`) but there is no dedicated ESG visualisation that institutional ESG-mandated investors would expect.

### Implementation Steps

1. **Create ESG metrics aggregator**
   - New file: `lib/esg-metrics.ts`
   - Aggregates ESG data from existing sources:
     - Carbon offset metrics from `token-metadata.ts`
     - Sustainability scores from market intelligence
     - SDG alignment mapping
   - ESG scoring framework: Environmental, Social, Governance sub-scores
   - ISSB S2 / TCFD reporting alignment

2. **Create ESG dashboard component**
   - New file: `components/esg/ESGImpactDashboard.tsx`
   - Overall ESG score gauge (Recharts RadialBarChart)
   - CO2 offset waterfall chart
   - SDG alignment grid
   - Reporting standard compliance checklist
   - Portfolio ESG impact calculator

3. **Create ESG report generator**
   - New file: `lib/esg-reporting.ts`
   - Generates TCFD-aligned disclosure data
   - ISSB S2 metrics preparation
   - Export-ready format (connects to export-utilities.ts)

4. **Integrate into existing flows**
   - Modify: `components/ProfessionalInterface.tsx` -- add ESG tab
   - Modify: `components/InstitutionalDashboard.tsx` -- add ESG summary widget

### Files to Modify
- **New:** `lib/esg-metrics.ts`, `lib/esg-reporting.ts`, `components/esg/ESGImpactDashboard.tsx`
- **Modify:** `components/ProfessionalInterface.tsx`, `components/InstitutionalDashboard.tsx`

### Testing Strategy
- New: `__tests__/esg-metrics.test.ts` (12-15 tests)
  - Score calculations correct
  - SDG mapping accurate
  - Aggregation from multiple sources works
- New: `__tests__/esg-dashboard.test.tsx` (8-10 tests)
  - Renders all ESG dimensions
  - Score gauge displays correct value
  - Reporting checklist accurate
- Regression: Existing dashboard functionality preserved

### Documentation Updates
- CLAUDE.md: Add ESG system to Architecture

### Dependencies
- Enhancement B1 (Recharts) for visualisations

### Regression Checkpoint
- Run `npm test` after metrics engine
- Run `npm test` after dashboard component
- Full suite after integration

---

## Enhancement C2: Blockchain Provenance Visualiser

**Priority:** Phase 3 (Week 3) | **Risk:** MEDIUM | **Effort:** 6-8 hours

### Problem Statement
`lib/token-metadata.ts` (988 lines) contains detailed provenance data (provenance chains, Merkle roots, verification proofs, vessel telemetry) but no visual representation. Buyers want to see the verification chain visually.

### Implementation Steps

1. **Create provenance chain visualiser**
   - New file: `components/blockchain/ProvenanceChain.tsx`
   - Vertical timeline showing verification steps
   - Each step: vessel measurement -> dMRV verification -> standard certification -> minting
   - Expandable details for each step
   - Visual hash display (truncated, copy-to-clipboard)
   - Animated "verified" checkmarks

2. **Create Merkle tree visualiser**
   - New file: `components/blockchain/MerkleTreeView.tsx`
   - Simplified tree diagram showing proof path
   - Highlights verification proof nodes
   - Educational tooltips explaining what each element means

3. **Create vessel provenance map**
   - New file: `components/blockchain/VesselProvenanceCard.tsx`
   - Card component showing vessel origin data
   - Telemetry summary: energy, passengers, distance, emissions saved
   - Links to provenance chain

4. **Integrate into negotiation and dashboard flows**
   - Modify: `app/negotiate/page.tsx` -- add "Verify Credit" option in token details
   - Modify: `components/InstitutionalDashboard.tsx` -- add provenance tab

### Files to Modify
- **New:** `components/blockchain/ProvenanceChain.tsx`, `MerkleTreeView.tsx`, `VesselProvenanceCard.tsx`
- **Modify:** `app/negotiate/page.tsx`, `components/InstitutionalDashboard.tsx`

### Testing Strategy
- New: `__tests__/provenance-visualiser.test.tsx` (12-15 tests)
  - Renders provenance chain steps
  - Merkle tree displays correct structure
  - Vessel data displays accurately
  - Hash truncation and copy works
- Regression: Negotiate page and dashboard still function

### Documentation Updates
- CLAUDE.md: Add blockchain visualisation to Architecture

### Dependencies
- Enhancement B2 (Navigation Shell) for layout

### Regression Checkpoint
- Run `npm test` after each component
- Full suite after integration

---

## Enhancement D4: Investment Calculator

**Priority:** Phase 4 (Week 4) | **Risk:** LOW | **Effort:** 5-6 hours

### Problem Statement
`lib/financial-calculations.ts` and `lib/professional-analytics.ts` contain sophisticated IRR/NPV/Monte Carlo engines, but there is no interactive calculator where users can input their own parameters and see results.

### Implementation Steps

1. **Create interactive calculator component**
   - New file: `components/calculator/InvestmentCalculator.tsx`
   - Input fields: investment amount, time horizon, token type, risk tolerance
   - Sliders for discount rate, tax rate, inflation rate
   - Pre-set profiles: Conservative, Moderate, Aggressive
   - Real-time output updating as inputs change
   - Output: IRR, NPV, cash-on-cash, payback period, total return

2. **Create scenario comparison within calculator**
   - New file: `components/calculator/ScenarioCompare.tsx`
   - Side-by-side comparison of up to 3 scenarios
   - "What-if" sliders for key parameters
   - Chart showing return distribution (Recharts)

3. **Create calculator API endpoint (optional)**
   - Modify: `app/api/analytics/route.ts` -- add `calculate` action
   - Allows external tools to use the calculation engine

4. **Add calculator to navigation**
   - Modify: `components/navigation/NavigationShell.tsx` -- add Calculator link
   - New page: `app/calculator/page.tsx` (thin wrapper)

### Files to Modify
- **New:** `components/calculator/InvestmentCalculator.tsx`, `components/calculator/ScenarioCompare.tsx`, `app/calculator/page.tsx`
- **Modify:** `components/navigation/NavigationShell.tsx`, optionally `app/api/analytics/route.ts`

### Testing Strategy
- New: `__tests__/investment-calculator.test.tsx` (15-18 tests)
  - Correct IRR calculation for known inputs
  - NPV matches expected values
  - Slider inputs update output
  - Pre-set profiles apply correct values
  - Edge cases: zero investment, max values
- Regression: Analytics API still functions correctly

### Documentation Updates
- CLAUDE.md: Add `/calculator` route to Architecture

### Dependencies
- Enhancement B1 (Recharts) for charts
- Enhancement B2 (Navigation Shell) for nav link

### Regression Checkpoint
- Run `npm test` after calculator logic
- Full suite after page creation

---

## Enhancement B5: Professional Export Enhancement

**Priority:** Phase 4 (Week 4) | **Risk:** LOW | **Effort:** 4-5 hours

### Problem Statement
`lib/export-utilities.ts` (729 lines) defines comprehensive export interfaces but the actual export is simulated (generates data structures, not files). No real PDF/CSV generation occurs.

### Implementation Steps

1. **Implement CSV export**
   - Modify: `lib/export-utilities.ts`
   - Real CSV generation from report data
   - Browser-side download trigger using `Blob` and `URL.createObjectURL`
   - Columns match institutional reporting standards
   - Australian number formatting (commas for thousands)

2. **Implement JSON export**
   - Modify: `lib/export-utilities.ts`
   - Formatted JSON with metadata headers
   - Includes API-compatible structure

3. **Implement text-based PDF alternative**
   - Modify: `lib/export-utilities.ts`
   - Generate formatted text report (avoiding heavy PDF library dependency)
   - Professional header, sections, tables
   - Suitable for copy-paste or print-to-PDF

4. **Create export modal component**
   - New file: `components/export/ExportModal.tsx`
   - Format selection (CSV, JSON, Text Report)
   - Template selection (Executive Summary, Detailed Analysis, Compliance Report)
   - Preview pane
   - Download button

5. **Integrate export across platform**
   - Modify: `app/negotiate/page.tsx` -- improve existing export UI
   - Modify: `components/ProfessionalInterface.tsx` -- add export button
   - Modify: `components/InstitutionalDashboard.tsx` -- add export button

### Files to Modify
- **New:** `components/export/ExportModal.tsx`
- **Modify:** `lib/export-utilities.ts`, `app/negotiate/page.tsx`, `components/ProfessionalInterface.tsx`, `components/InstitutionalDashboard.tsx`

### Testing Strategy
- New: `__tests__/export-generation.test.ts` (12-15 tests)
  - CSV output format correct
  - JSON structure valid
  - Text report contains all sections
  - Australian formatting applied
  - Handles large datasets
- New: `__tests__/export-modal.test.tsx` (6-8 tests)
  - Format selection works
  - Preview renders correctly
  - Download triggers correctly
- Regression: Existing export interface preserved

### Documentation Updates
- CLAUDE.md: Update export capabilities description

### Dependencies
- None (uses native browser APIs)

### Regression Checkpoint
- Run `npm test` after export logic changes
- Full suite after UI integration

---

## Enhancement A3: Multi-Agent Committee Mode

**Priority:** Phase 4 (Week 4) | **Risk:** HIGH | **Effort:** 10-12 hours

### Problem Statement
Currently only a single WREI agent negotiates with a single buyer. Institutional deals often involve committee decisions (board approval, risk committee, compliance sign-off). A committee mode would simulate multiple AI agents with different mandates.

### Implementation Steps

1. **Create committee configuration**
   - New file: `lib/committee-mode.ts`
   - Committee member types: Chief Investment Officer, Risk Manager, Compliance Officer, ESG Lead
   - Each has different priorities, risk tolerance, and approval thresholds
   - Committee voting logic: unanimous, majority, weighted
   - Turn-taking protocol: sequential or round-robin

2. **Modify API route for committee**
   - Modify: `app/api/negotiate/route.ts`
   - New mode parameter: `committee: true`
   - Generates responses from multiple "perspectives" using a single Claude call with structured output
   - Each perspective tagged with committee member role
   - Defence layers apply to all perspectives

3. **Create committee UI components**
   - New file: `components/negotiation/CommitteePanel.tsx`
   - Shows each committee member with avatar and mandate
   - Indicates each member's current stance
   - Voting progress indicator
   - Internal committee discussion display (optional reveal)

4. **Integrate into negotiate page**
   - Modify: `app/negotiate/page.tsx`
   - Add "Committee Mode" toggle in negotiation setup
   - Different message display for committee responses
   - Committee outcome display

### Files to Modify
- **New:** `lib/committee-mode.ts`, `components/negotiation/CommitteePanel.tsx`
- **Modify:** `app/api/negotiate/route.ts`, `app/negotiate/page.tsx`

### Testing Strategy
- New: `__tests__/committee-mode.test.ts` (15-20 tests)
  - Committee configuration validates
  - Voting logic for each mode (unanimous, majority, weighted)
  - Member perspectives differ based on role
  - Turn-taking protocol correct
- New: `__tests__/committee-panel.test.tsx` (8-10 tests)
  - Renders all committee members
  - Voting progress displays correctly
  - Stance indicators update
- Regression: CRITICAL -- negotiate API route must still work in single-agent mode
  - Run all existing API route tests
  - Verify existing personas still function

### Documentation Updates
- CLAUDE.md: Add Committee Mode to Architecture
- CLAUDE.md: Document new API mode parameter

### Dependencies
- Enhancement B2 (Navigation Shell) for layout
- Enhancement A1 (History) for committee session review

### Regression Checkpoint
- Run FULL `npm test` after each sub-task (API changes are highest risk)
- Run `npm run build` to verify TypeScript
- Test single-agent mode explicitly after committee changes

---

## Enhancement C3: API Explorer / Developer Portal

**Priority:** Phase 4 (Week 4) | **Risk:** LOW | **Effort:** 6-8 hours

### Problem Statement
The platform has 6 API endpoints (`/api/negotiate`, `/api/analytics`, `/api/compliance`, `/api/market-data`, `/api/metadata`, `/api/performance`) but no documentation, exploration, or testing interface for developers.

### Implementation Steps

1. **Create API documentation data**
   - New file: `lib/api-documentation.ts`
   - Structured documentation for each endpoint
   - Request/response schemas
   - Example payloads
   - Error code reference
   - Rate limit information

2. **Create API explorer component**
   - New file: `components/developer/APIExplorer.tsx`
   - Left sidebar: endpoint list grouped by category
   - Centre panel: endpoint detail (method, URL, description, parameters)
   - Right panel: live request builder
   - Response preview with syntax highlighting (pre-formatted JSON)
   - "Try It" button that makes real API calls

3. **Create developer portal page**
   - New file: `app/developer/page.tsx`
   - API Explorer as main content
   - Quick-start guide
   - Authentication instructions
   - Code examples (curl, JavaScript, Python)

4. **Add to navigation**
   - Modify: `components/navigation/NavigationShell.tsx` -- add Developer link

### Files to Modify
- **New:** `lib/api-documentation.ts`, `components/developer/APIExplorer.tsx`, `app/developer/page.tsx`
- **Modify:** `components/navigation/NavigationShell.tsx`

### Testing Strategy
- New: `__tests__/api-documentation.test.ts` (8-10 tests)
  - All 6 endpoints documented
  - Example payloads are valid JSON
  - Response schemas match actual API responses
- New: `__tests__/api-explorer.test.tsx` (8-10 tests)
  - Renders endpoint list
  - Endpoint detail displays correctly
  - Request builder creates valid payloads
- Regression: No existing functionality affected (additive only)

### Documentation Updates
- CLAUDE.md: Add `/developer` route to Architecture
- CLAUDE.md: Note API documentation system

### Dependencies
- Enhancement B2 (Navigation Shell) for nav link

### Regression Checkpoint
- Run `npm test` after each component
- Full suite after page creation

---

## Enhancement D3: Regulatory Compliance Map

**Priority:** Phase 4 (Week 4) | **Risk:** LOW | **Effort:** 4-5 hours

### Problem Statement
`lib/regulatory-compliance.ts` (1,228 lines) contains comprehensive Australian regulatory framework data (AFSL, AML/CTF, CGT, AUSTRAC) but it is only accessible through function calls. No visual compliance map or status dashboard exists.

### Implementation Steps

1. **Create compliance map component**
   - New file: `components/compliance/RegulatoryMap.tsx`
   - Visual flowchart: investor type -> required compliance -> status
   - Colour-coded: green (compliant), amber (pending), red (non-compliant)
   - Interactive: click each node for details
   - Shows: AFSL requirements, AML/CTF status, tax treatment, jurisdictional constraints

2. **Create compliance status dashboard**
   - New file: `components/compliance/ComplianceStatusDashboard.tsx`
   - Overall compliance score gauge
   - Checklist of requirements by investor type
   - Upcoming deadlines and renewal dates
   - Document status tracker

3. **Create compliance page**
   - New file: `app/compliance/page.tsx`
   - Hosts RegulatoryMap and ComplianceStatusDashboard
   - Links to onboarding for incomplete compliance

4. **Add to navigation**
   - Modify: `components/navigation/NavigationShell.tsx` -- add Compliance link

### Files to Modify
- **New:** `components/compliance/RegulatoryMap.tsx`, `ComplianceStatusDashboard.tsx`, `app/compliance/page.tsx`
- **Modify:** `components/navigation/NavigationShell.tsx`

### Testing Strategy
- New: `__tests__/regulatory-map.test.tsx` (10-12 tests)
  - Renders all compliance categories
  - Status colours correct
  - Investor type filtering works
  - Flowchart connections accurate
- Regression: Existing compliance API and tests unaffected

### Documentation Updates
- CLAUDE.md: Add `/compliance` route to Architecture

### Dependencies
- Enhancement B2 (Navigation Shell) for nav link
- Enhancement B1 (Recharts) for gauges

### Regression Checkpoint
- Run `npm test` after components
- Full suite after page creation

---

## Enhancement C4: Performance Dashboard Enhancement

**Priority:** Phase 4 (Week 4) | **Risk:** LOW | **Effort:** 4-5 hours

### Problem Statement
The existing `app/performance/page.tsx` and `components/PerformanceDashboard.tsx` (314 lines) show hardcoded stats (100% uptime, <500ms response). The performance monitor (`lib/performance-monitor.ts`) tracks real metrics but they are not displayed.

### Implementation Steps

1. **Connect real performance data**
   - Modify: `components/PerformanceDashboard.tsx`
   - Import and use `performanceMonitor` from `lib/performance-monitor.ts`
   - Display actual tracked metrics: API call counts, response times, success rates
   - Auto-refresh with configurable interval

2. **Add performance charts**
   - Add to: `components/PerformanceDashboard.tsx`
   - Response time histogram (Recharts)
   - API call volume over time (Recharts)
   - Success/error rate pie chart (Recharts)
   - Memory usage trend (if available)

3. **Add health check indicators**
   - Each API endpoint: green/amber/red status
   - Last response time for each
   - Error rate threshold alerts

4. **Update performance page**
   - Modify: `app/performance/page.tsx`
   - Remove hardcoded stats, use real component data
   - Add auto-refresh toggle

### Files to Modify
- **Modify:** `components/PerformanceDashboard.tsx`, `app/performance/page.tsx`

### Testing Strategy
- New: `__tests__/performance-dashboard-enhanced.test.tsx` (10-12 tests)
  - Renders real metric values
  - Charts display with valid data
  - Health indicators show correct status
  - Auto-refresh toggle works
- Regression: Existing performance tests still pass

### Documentation Updates
- CLAUDE.md: Update performance section

### Dependencies
- Enhancement B1 (Recharts) for charts
- Enhancement B2 (Navigation Shell) for layout

### Regression Checkpoint
- Run `npm test` after each change
- Full suite after completion

---

# Part B: Phase-by-Phase Execution Strategy

## Phase 1: Critical Foundation (Week 1)

**Goal:** Establish unified navigation, data visualisation, and redesigned landing page. These three enhancements are the foundation for everything else.

### Execution Order (Dependencies)

```
Day 1-2: B2 (Navigation Shell) -- no dependencies, unlocks all other enhancements
    |
Day 2-3: B1 (Recharts Layer) -- needs B2 for layout context
    |
Day 3-4: B3 (Landing Page Redesign) -- needs B2 for navigation
    |
Day 4:   Integration testing + regression checkpoint
```

### Day 1-2: B2 -- Unified Navigation Shell

**Morning Session:**
1. Create `components/navigation/NavigationShell.tsx`
2. Write `__tests__/navigation-shell.test.tsx`
3. Run tests -- new tests + all 623 existing must pass

**Afternoon Session:**
4. Modify `app/layout.tsx` to wrap with NavigationShell
5. Remove page-specific headers from `app/page.tsx`, `app/performance/page.tsx`
6. Run `npm run build` to verify compilation
7. Run full `npm test` -- **REGRESSION CHECKPOINT 1**

### Day 2-3: B1 -- Data Visualisation Layer

**Morning Session:**
1. `npm install recharts`
2. Create all 4 chart wrapper components + barrel export
3. Write `__tests__/chart-components.test.tsx`
4. Run tests

**Afternoon Session:**
5. Create `lib/chart-data-transforms.ts`
6. Write `__tests__/chart-data-transforms.test.ts`
7. Integrate charts into 4 existing dashboards
8. Run `npm run build` -- verify no SSR issues with Recharts
9. Run full `npm test` -- **REGRESSION CHECKPOINT 2**

### Day 3-4: B3 -- Landing Page Redesign

**Session:**
1. Redesign `app/page.tsx`
2. Write `__tests__/landing-page.test.tsx`
3. Run full `npm test` -- **REGRESSION CHECKPOINT 3**

### Day 4: Phase 1 Completion

1. Run full test suite: `npm test`
2. Run build: `npm run build`
3. Update CLAUDE.md with new architecture entries
4. Create git commit for Phase 1

**Expected Test Count After Phase 1:** 623 + ~55 new = ~678 tests

---

## Phase 2: Intelligence Layer (Week 2)

**Goal:** Add negotiation replay/comparison, outcome scoring, market ticker, and coaching panel.

### Execution Order

```
Day 1-2: A1 (Replay & Comparison) -- needs B1 charts
    |
Day 2-3: A4 (Scoring & Benchmarking) -- needs B1 charts, benefits from A1
    |
Day 3:   C1 (Market Data Ticker) -- needs B2 nav
    |
Day 3-4: A2 (Coaching Panel) -- independent but benefits from all above
    |
Day 4:   Integration testing + regression checkpoint
```

### Day 1-2: A1 -- Negotiation Replay and Comparison

**Morning Session:**
1. Create `lib/negotiation-history.ts`
2. Write `__tests__/negotiation-history.test.ts`
3. Run tests

**Afternoon Session:**
4. Create `components/negotiation/ReplayViewer.tsx`
5. Create `components/negotiation/ComparisonDashboard.tsx`
6. Write component tests
7. Integrate into `app/negotiate/page.tsx`
8. Run full `npm test` -- **REGRESSION CHECKPOINT 4**

### Day 2-3: A4 -- Outcome Scoring

**Morning Session:**
1. Create `lib/negotiation-scoring.ts`
2. Write `__tests__/negotiation-scoring.test.ts`
3. Run tests

**Afternoon Session:**
4. Create `components/negotiation/Scorecard.tsx`
5. Write component tests
6. Integrate into negotiate page completion flow
7. Run full `npm test` -- **REGRESSION CHECKPOINT 5**

### Day 3: C1 -- Market Data Ticker

1. Create `lib/ticker-data.ts`
2. Create `components/market/MarketTicker.tsx` and `MarketStatus.tsx`
3. Write tests
4. Integrate into NavigationShell
5. Run full `npm test` -- **REGRESSION CHECKPOINT 6**

### Day 3-4: A2 -- Real-Time Coaching Panel

1. Create `lib/negotiation-coaching.ts`
2. Create `components/negotiation/CoachingPanel.tsx`
3. Write tests
4. Integrate into negotiate page
5. Run full `npm test` -- **REGRESSION CHECKPOINT 7**

**Expected Test Count After Phase 2:** ~678 + ~95 new = ~773 tests

---

## Phase 3: Institutional Depth (Week 3)

**Goal:** Connect onboarding pipeline, add competitive visualisation, ESG dashboard, and blockchain provenance.

### Execution Order

```
Day 1-2: B4 (Onboarding Pipeline) -- fixes broken /professional redirect
    |
Day 2:   D1 (Competitive Positioning) -- needs B1 charts
    |
Day 3:   D2 (ESG Impact Dashboard) -- needs B1 charts
    |
Day 3-4: C2 (Blockchain Provenance) -- independent
    |
Day 4:   Integration testing + regression checkpoint
```

### Day 1-2: B4 -- Onboarding-to-Negotiation Pipeline

1. Create `lib/onboarding-pipeline.ts`
2. Create `components/institutional/PipelineTransition.tsx`
3. Modify `app/institutional/portal/page.tsx` -- fix broken redirect
4. Modify `app/negotiate/page.tsx` -- accept pipeline params
5. Write tests
6. Run full `npm test` -- **REGRESSION CHECKPOINT 8**

### Day 2: D1 -- Competitive Positioning Visualisation

1. Create 3 new components in `components/market/`
2. Integrate into `MarketIntelligenceDashboard.tsx`
3. Write tests
4. Run full `npm test` -- **REGRESSION CHECKPOINT 9**

### Day 3: D2 -- ESG Impact Dashboard

1. Create `lib/esg-metrics.ts` and `lib/esg-reporting.ts`
2. Create `components/esg/ESGImpactDashboard.tsx`
3. Integrate into ProfessionalInterface and InstitutionalDashboard
4. Write tests
5. Run full `npm test` -- **REGRESSION CHECKPOINT 10**

### Day 3-4: C2 -- Blockchain Provenance Visualiser

1. Create 3 new components in `components/blockchain/`
2. Integrate into negotiate page and InstitutionalDashboard
3. Write tests
4. Run full `npm test` -- **REGRESSION CHECKPOINT 11**

**Expected Test Count After Phase 3:** ~773 + ~80 new = ~853 tests

---

## Phase 4: Polish and Depth (Week 4)

**Goal:** Add investment calculator, enhanced exports, committee mode, API explorer, compliance map, and performance enhancement.

### Execution Order (most to least risk)

```
Day 1:   A3 (Committee Mode) -- HIGHEST RISK, touches API route
    |
Day 1-2: D4 (Investment Calculator) -- medium risk, new page
    |
Day 2:   B5 (Export Enhancement) -- low risk, modifies existing
    |
Day 3:   C3 (API Explorer) -- low risk, additive
    |
Day 3:   D3 (Regulatory Compliance Map) -- low risk, additive
    |
Day 4:   C4 (Performance Dashboard Enhancement) -- low risk, modifies existing
    |
Day 4:   Final integration testing + regression + documentation
```

### Day 1: A3 -- Multi-Agent Committee Mode (HIGHEST RISK)

**CRITICAL: This modifies the 1,363-line negotiate API route.**

1. Create `lib/committee-mode.ts` with configuration and voting logic
2. Write `__tests__/committee-mode.test.ts` (20 tests)
3. Run existing API route tests FIRST: verify all pass
4. Modify `app/api/negotiate/route.ts` -- add committee mode
5. Run ALL existing API tests again -- verify no regressions
6. Create `components/negotiation/CommitteePanel.tsx`
7. Integrate into negotiate page
8. Run FULL `npm test` -- **REGRESSION CHECKPOINT 12** (most critical)

### Day 1-2: D4 -- Investment Calculator

1. Create calculator components
2. Create `app/calculator/page.tsx`
3. Write tests
4. Run full `npm test` -- **REGRESSION CHECKPOINT 13**

### Day 2: B5 -- Professional Export Enhancement

1. Modify `lib/export-utilities.ts` -- implement real CSV/JSON/text exports
2. Create `components/export/ExportModal.tsx`
3. Integrate across platform
4. Write tests
5. Run full `npm test` -- **REGRESSION CHECKPOINT 14**

### Day 3: C3 + D3 -- API Explorer and Compliance Map

1. Create API documentation and explorer
2. Create compliance map components
3. Create new pages
4. Write tests
5. Run full `npm test` -- **REGRESSION CHECKPOINT 15**

### Day 4: C4 + Final Integration

1. Enhance PerformanceDashboard with real data and charts
2. Write tests
3. Run FULL `npm test` -- **FINAL REGRESSION CHECKPOINT**
4. Run `npm run build` -- verify clean compilation
5. Update all documentation
6. Create final git commit

**Expected Test Count After Phase 4:** ~853 + ~110 new = ~963 tests

---

# Part C: Regression Testing Framework

## Testing Architecture

### Tier 1: Unit Tests (lib/ modules)
- Each `lib/*.ts` module has a corresponding `__tests__/*.test.ts`
- Tests import functions directly and validate business logic
- No mocking required (pure functions)
- Run in: `npm test`

### Tier 2: Component Tests (components/)
- Each significant component has a `__tests__/*.test.tsx`
- Uses `@testing-library/react` for render and interaction
- Mock data providers where needed
- Run in: `npm test`

### Tier 3: API Integration Tests
- Tests for each API route in `__tests__/`
- Mock Anthropic SDK (never call real API in tests)
- Validate request/response format, error handling, defence layers
- Run in: `npm test`

### Tier 4: E2E Tests (Playwright)
- Existing in `e2e/` directory
- Run separately: `npm run test:e2e`
- Test full user flows through the browser

## Regression Protocol

### Before Each Enhancement

```bash
# Step 1: Verify baseline
npm test 2>&1 | tail -5
# Expected: "Tests: 623 passed, 623 total" (or current count)

# Step 2: Verify build
npm run build 2>&1 | tail -5
# Expected: "Compiled successfully"
```

### After Each Enhancement

```bash
# Step 1: Run new tests only (fast feedback)
npx jest --testPathPattern="NEW_TEST_FILE" --verbose

# Step 2: Run full regression
npm test 2>&1 | tail -5
# Expected: All previous tests still pass + new tests pass

# Step 3: Verify build (catches TypeScript errors)
npm run build 2>&1 | tail -5
```

### After Each Phase (Weekly Gate)

```bash
# Step 1: Full test suite
npm test

# Step 2: TypeScript compilation
npm run build

# Step 3: Lint
npm run lint

# Step 4: Coverage report (optional but recommended)
npm run test:coverage
```

## Test Naming Convention

```
__tests__/{feature-area}.test.ts      # Unit tests for lib modules
__tests__/{feature-area}.test.tsx     # Component tests (React)
__tests__/{milestone-X.Y}-{name}.test.ts  # Milestone-specific tests
```

## Test File Plan (New Tests)

| Phase | Test File | Tests | Type |
|-------|-----------|-------|------|
| 1 | `__tests__/navigation-shell.test.tsx` | 8-10 | Component |
| 1 | `__tests__/chart-components.test.tsx` | 12-15 | Component |
| 1 | `__tests__/chart-data-transforms.test.ts` | 10-12 | Unit |
| 1 | `__tests__/landing-page.test.tsx` | 8-10 | Component |
| 2 | `__tests__/negotiation-history.test.ts` | 15-18 | Unit |
| 2 | `__tests__/replay-viewer.test.tsx` | 8-10 | Component |
| 2 | `__tests__/negotiation-scoring.test.ts` | 15-20 | Unit |
| 2 | `__tests__/scorecard.test.tsx` | 6-8 | Component |
| 2 | `__tests__/ticker-data.test.ts` | 10-12 | Unit |
| 2 | `__tests__/market-ticker.test.tsx` | 6-8 | Component |
| 2 | `__tests__/negotiation-coaching.test.ts` | 15-18 | Unit |
| 2 | `__tests__/coaching-panel.test.tsx` | 8-10 | Component |
| 3 | `__tests__/onboarding-pipeline.test.ts` | 12-15 | Unit |
| 3 | `__tests__/pipeline-transition.test.tsx` | 6-8 | Component |
| 3 | `__tests__/competitive-positioning.test.tsx` | 10-12 | Component |
| 3 | `__tests__/esg-metrics.test.ts` | 12-15 | Unit |
| 3 | `__tests__/esg-dashboard.test.tsx` | 8-10 | Component |
| 3 | `__tests__/provenance-visualiser.test.tsx` | 12-15 | Component |
| 4 | `__tests__/committee-mode.test.ts` | 15-20 | Unit |
| 4 | `__tests__/committee-panel.test.tsx` | 8-10 | Component |
| 4 | `__tests__/investment-calculator.test.tsx` | 15-18 | Component |
| 4 | `__tests__/export-generation.test.ts` | 12-15 | Unit |
| 4 | `__tests__/export-modal.test.tsx` | 6-8 | Component |
| 4 | `__tests__/api-documentation.test.ts` | 8-10 | Unit |
| 4 | `__tests__/api-explorer.test.tsx` | 8-10 | Component |
| 4 | `__tests__/regulatory-map.test.tsx` | 10-12 | Component |
| 4 | `__tests__/performance-dashboard-enhanced.test.tsx` | 10-12 | Component |

**Total New Tests: ~340 tests**
**Projected Final Count: 623 + 340 = ~963 tests**

## Critical Regression Risks

| Enhancement | Risk | Mitigation |
|------------|------|------------|
| B2 (Nav Shell) | Layout changes break page rendering | Test each page independently |
| A3 (Committee) | API route modification breaks negotiation | Run all 949-line API test suite before/after |
| B4 (Pipeline) | Negotiate page param handling breaks existing flow | Test with and without URL params |
| B1 (Recharts) | SSR issues with client-only charts | Use `"use client"` directive, dynamic imports if needed |
| C4 (Perf Dashboard) | Removing hardcoded stats breaks test expectations | Update tests alongside component |

---

# Part D: Documentation Maintenance Strategy

## Documents to Maintain

### 1. `/CLAUDE.md` -- Primary Project Context

**Update Triggers:**
- New page route added -> update Architecture section
- New lib module added -> update Architecture section
- New dependency added -> update Technology Stack
- New design pattern established -> update Critical Design Rules
- Colour scheme used in new way -> verify Colour Scheme section

**Update Protocol:**
After each phase completion, review and update:
- Architecture file structure diagram
- Technology stack (if dependencies added)
- Build Progress Tracker checkboxes

### 2. `/MASTER_IMPLEMENTATION_PLAN.md` (this document)

**Update Triggers:**
- Enhancement completed -> mark as done, record actual test count
- Phase completed -> update execution status
- Scope change -> revise affected enhancements
- New dependency discovered -> update dependency graph

### 3. `/INTEGRATED_DEVELOPMENT_PLAN.md` -- Historical Context

**Update Triggers:**
- Milestone completion -> update Current State Assessment
- Test count changes -> update testing metrics
- Development approach changes -> update workflow section

### 4. Test Documentation

**Files:** Test files themselves serve as documentation.
**Convention:** Each test file starts with a JSDoc comment describing:
- What module/feature it tests
- How many tests
- Key scenarios covered

### 5. API Documentation (New -- created in C3)

**File:** `lib/api-documentation.ts`
**Update Triggers:**
- New API endpoint added
- Existing endpoint parameters change
- New error codes added

## Documentation Update Checklist (Per Phase)

```markdown
## Phase [N] Documentation Checklist
- [ ] CLAUDE.md Architecture section updated
- [ ] CLAUDE.md Technology Stack updated (if deps added)
- [ ] MASTER_IMPLEMENTATION_PLAN.md status updated
- [ ] New test files have JSDoc headers
- [ ] INTEGRATED_DEVELOPMENT_PLAN.md milestone status updated
- [ ] Git commit message references documentation updates
```

---

# Part E: Future Context Prompt

The following prompt can be used in a fresh Claude Code session to continue this work from any point.

---

```markdown
# WREI Trading Platform -- Development Continuation Prompt

## Required Reading (Start Here)

1. `/CLAUDE.md` -- Project rules, architecture, colour scheme, constraints
2. `/MASTER_IMPLEMENTATION_PLAN.md` -- This comprehensive plan (Part A-E)
3. Run `npm test` to verify baseline test count

## Current State

- **Platform:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Live URL:** https://wrei-trading-platform.vercel.app
- **Repository:** main branch
- **Critical Constraints:**
  - NO localStorage/sessionStorage (in-memory state only)
  - ANTHROPIC_API_KEY server-side only
  - Defence layers non-negotiable (price floor, concession limits)
  - Australian spelling in all user-facing text
  - NO Zoniqx packages (knowledge-base content only)
  - All CSS via Tailwind classes (no separate CSS files)

## Check Current Progress

Run this command to determine where development stands:

```bash
# 1. Check test count (baseline was 623)
npm test 2>&1 | tail -3

# 2. Check git log for phase completion commits
git log --oneline -10

# 3. Check for new files since baseline
git status

# 4. Check which components exist
ls -la components/navigation/ components/charts/ components/market/ \
  components/negotiation/ components/blockchain/ components/esg/ \
  components/calculator/ components/export/ components/compliance/ \
  components/developer/ 2>/dev/null
```

## Development Phases

### Phase 1: Critical Foundation (Week 1) -- B2, B1, B3
- B2: Unified Navigation Shell (`components/navigation/NavigationShell.tsx`)
- B1: Data Visualisation Layer (install recharts, `components/charts/`)
- B3: Landing Page Redesign (`app/page.tsx` rewrite)

### Phase 2: Intelligence Layer (Week 2) -- A1, A4, C1, A2
- A1: Negotiation Replay & Comparison (`lib/negotiation-history.ts`)
- A4: Outcome Scoring & Benchmarking (`lib/negotiation-scoring.ts`)
- C1: Live Market Data Ticker (`lib/ticker-data.ts`, `components/market/`)
- A2: Real-Time Coaching Panel (`lib/negotiation-coaching.ts`)

### Phase 3: Institutional Depth (Week 3) -- B4, D1, D2, C2
- B4: Onboarding-to-Negotiation Pipeline (`lib/onboarding-pipeline.ts`)
- D1: Competitive Positioning Visualisation (`components/market/`)
- D2: ESG Impact Dashboard (`lib/esg-metrics.ts`, `components/esg/`)
- C2: Blockchain Provenance Visualiser (`components/blockchain/`)

### Phase 4: Polish & Depth (Week 4) -- D4, B5, A3, C3, D3, C4
- A3: Multi-Agent Committee Mode (HIGHEST RISK -- modifies API route)
- D4: Investment Calculator (`app/calculator/page.tsx`)
- B5: Professional Export Enhancement (`lib/export-utilities.ts` real exports)
- C3: API Explorer / Developer Portal (`app/developer/page.tsx`)
- D3: Regulatory Compliance Map (`app/compliance/page.tsx`)
- C4: Performance Dashboard Enhancement

## Regression Protocol

BEFORE starting any work:
```bash
npm test  # Verify all tests pass
```

AFTER each enhancement:
```bash
npm test  # All previous + new tests must pass
npm run build  # TypeScript must compile
```

## Architecture Rules

- Pages go in `app/` (App Router)
- Shared components in `components/{category}/`
- Business logic in `lib/`
- API routes in `app/api/{endpoint}/route.ts`
- Tests in `__tests__/`
- All new components use "use client" if they have state/effects
- Colour scheme: navy #1B2A4A, teal #0EA5E9, green #10B981, amber #F59E0B, red #EF4444

## Key Files Reference

| Purpose | Path |
|---------|------|
| Negotiate page (main UI) | `app/negotiate/page.tsx` (1,842 lines) |
| Negotiate API route | `app/api/negotiate/route.ts` (1,363 lines) |
| Type definitions | `lib/types.ts` |
| Defence layer | `lib/defence.ts` |
| Negotiation config | `lib/negotiation-config.ts` |
| Financial calculations | `lib/financial-calculations.ts` |
| Professional analytics | `lib/professional-analytics.ts` |
| Market intelligence | `lib/market-intelligence.ts` |
| Regulatory compliance | `lib/regulatory-compliance.ts` |
| Jest config | `jest.config.js` |
| Jest setup | `jest.setup.js` |
| Package config | `package.json` |

## Implementation Approach

For each enhancement:
1. Read the detailed plan in MASTER_IMPLEMENTATION_PLAN.md (Part A)
2. Create the lib module first (business logic)
3. Write tests for the lib module
4. Create the component(s)
5. Write component tests
6. Integrate into existing pages
7. Run full regression: `npm test`
8. Run build: `npm run build`
9. Update documentation

Do NOT:
- Skip regression tests
- Modify defence layer constraints
- Add localStorage/sessionStorage
- Import Anthropic SDK on client side
- Install Zoniqx packages
- Create separate CSS files
- Use American spelling in user-facing text
```

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Enhancements** | 16 |
| **Total Phases** | 4 (one per week) |
| **Current Tests** | 623 (35 suites) |
| **Projected Final Tests** | ~963 (~63 suites) |
| **New Files (estimated)** | ~45 |
| **Modified Files (estimated)** | ~25 |
| **New Dependencies** | 1 (recharts) |
| **Regression Checkpoints** | 16 (one per enhancement + final) |
| **Highest Risk Enhancement** | A3 (Committee Mode -- modifies API route) |
| **Lowest Risk Enhancements** | B3, D4, C3, D3, C4 (additive only) |

---

**Status:** Ready for Execution
**Start:** Phase 1, Enhancement B2 (Unified Navigation Shell)
**End:** Phase 4, Final regression + documentation + deployment
