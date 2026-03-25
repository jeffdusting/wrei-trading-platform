# WREI Trading Platform -- Development Continuation Prompt

## Required Reading
1. `/CLAUDE.md` -- Project rules, architecture, colour scheme, constraints
2. `/MASTER_IMPLEMENTATION_PLAN.md` -- Comprehensive 16-enhancement plan (Parts A-E)

## Current State (as of 2026-03-24)

- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS, recharts@3.8.0
- **Live URL:** https://wrei-trading-platform.vercel.app
- **Branch:** main
- **Test Count:** 846 total (822 passing, 24 failing in 2 suites)
- **Build:** Clean compilation, no TypeScript errors

## Completed Work

### Phase 1: Critical Foundation -- 100% COMPLETE
- **B2 (Navigation Shell):** `components/navigation/NavigationShell.tsx` -- integrated into `app/layout.tsx`
- **B1 (Recharts Layer):** `components/charts/` (WREILineChart, WREIPieChart, WREIBarChart, WREIAreaChart, index.ts) + `lib/chart-data-transforms.ts`
- **B3 (Landing Page):** `app/page.tsx` rewritten (414 lines, up from 80)
- Phase 1 tests: 75/75 passing

### Phase 2: Intelligence Layer -- PARTIALLY COMPLETE
- **A1 (Replay & Comparison):** IMPLEMENTED with test defects
  - `lib/negotiation-history.ts` (421 lines) -- 21/21 tests pass
  - `components/negotiation/ReplayViewer.tsx` (438 lines) -- 25/29 tests pass (4 failures)
  - `components/negotiation/ComparisonDashboard.tsx` (696 lines) -- 14/34 tests pass (20 failures)
  - All integrated into `app/negotiate/page.tsx` (now 2,110 lines)
- **A4 (Scoring & Benchmarking):** 100% COMPLETE
  - `lib/negotiation-scoring.ts` (574 lines) -- 41/41 tests pass
  - `components/negotiation/Scorecard.tsx` (404 lines) -- 23/23 tests pass
  - Integrated into negotiate page completion flow
- **C1 (Market Data Ticker):** NOT STARTED
- **A2 (Real-Time Coaching Panel):** NOT STARTED

## IMMEDIATE PRIORITY: Fix 24 Test Failures

The 24 failures in `__tests__/replay-viewer.test.tsx` (4) and `__tests__/comparison-dashboard.test.tsx` (20) are UI rendering mismatches, NOT logic bugs:

### Root Causes:
1. **formatPersona bug in ComparisonDashboard.tsx (line ~41):** Uses `.replace('_', ' ')` which only replaces FIRST underscore. Fix: change to `.replace(/_/g, ' ')` or `.replaceAll('_', ' ')`. Example: `esg_fund_manager` becomes `"Esg Fund_manager"` instead of `"Esg Fund Manager"`.

2. **Same bug in ReplayViewer.tsx (line ~159):** `session.persona.replace('_', ' ')` should be `.replace(/_/g, ' ')`.

3. **CSS capitalize vs text content (ReplayViewer):** The emotional state panel renders lowercase text (`neutral`) with CSS `capitalize` class. Testing-library reads DOM text content, not visual presentation. Either:
   - Fix component: use JS `.charAt(0).toUpperCase() + .slice(1)` instead of CSS capitalize, OR
   - Fix tests: match lowercase text

4. **Currency formatting locale issue:** Component uses `Intl.NumberFormat('en-AU', { style: 'currency', currency: 'USD' })` which produces `US$135` not `$135`. Tests need to match actual format or component needs to match test expectations.

5. **Strategy change highlight timing:** ReplayViewer checks `messages[index-1].argumentClassification` but agent messages in mock data don't have `argumentClassification`, preventing highlight detection. Either mock data needs agent argumentClassification or test expectation needs adjustment.

6. **Auto-play timer test:** May need `act()` wrapping for state updates with fake timers.

### Fix Strategy:
- Best approach: fix both component bugs AND update tests to match actual rendered output
- Ensure `replace` uses global flag everywhere personas are formatted
- Use consistent currency formatting expectations

## NEXT TASKS (in priority order)

1. Fix 24 test failures (30-60 minutes)
2. Implement C1: Live Market Data Ticker (4-5 hours)
   - New: `lib/ticker-data.ts` -- simulated real-time updates from PRICING_INDEX
   - New: `components/market/MarketTicker.tsx` -- scrolling ticker bar
   - New: `components/market/MarketStatus.tsx` -- market open/closed badge
   - Modify: `components/navigation/NavigationShell.tsx` -- integrate ticker
   - New: `__tests__/ticker-data.test.ts`, `__tests__/market-ticker.test.tsx`
3. Implement A2: Real-Time Coaching Panel (6-8 hours)
   - New: `lib/negotiation-coaching.ts` -- context-aware suggestions engine
   - New: `components/negotiation/CoachingPanel.tsx` -- side panel UI
   - Modify: `app/negotiate/page.tsx` -- integrate coaching
   - New: `__tests__/negotiation-coaching.test.ts`, `__tests__/coaching-panel.test.tsx`
4. After Phase 2 completion, proceed to Phase 3 (Institutional Depth)

## Key Files Reference

| Purpose | Path | Lines |
|---------|------|-------|
| Negotiate page (main UI) | `app/negotiate/page.tsx` | 2,110 |
| Negotiate API route | `app/api/negotiate/route.ts` | 1,363 |
| Landing page | `app/page.tsx` | 414 |
| Navigation shell | `components/navigation/NavigationShell.tsx` | ~150 |
| Layout wrapper | `app/layout.tsx` | ~50 |
| Type definitions | `lib/types.ts` | 484 |
| Defence layer | `lib/defence.ts` | 373 |
| Negotiation config | `lib/negotiation-config.ts` | 642 |
| Scoring engine | `lib/negotiation-scoring.ts` | 574 |
| History manager | `lib/negotiation-history.ts` | 421 |
| Chart transforms | `lib/chart-data-transforms.ts` | ~200 |
| Scorecard component | `components/negotiation/Scorecard.tsx` | 404 |
| Replay viewer | `components/negotiation/ReplayViewer.tsx` | 438 |
| Comparison dashboard | `components/negotiation/ComparisonDashboard.tsx` | 696 |
| Jest config | `jest.config.js` | |
| Package config | `package.json` | |

## Architecture Rules (from CLAUDE.md)
- NO localStorage/sessionStorage (in-memory state only)
- ANTHROPIC_API_KEY server-side only
- Defence layers non-negotiable (price floor $120, max 5% concession/round, max 20% total)
- Australian spelling in all user-facing text
- NO Zoniqx packages (knowledge-base content only for agent dialogue)
- All CSS via Tailwind classes (no separate CSS files)
- Colour scheme: navy #1B2A4A, teal #0EA5E9, green #10B981, amber #F59E0B, red #EF4444

## Regression Protocol
BEFORE any work: `npm test` (expect 846 total, target 0 failures)
AFTER each enhancement: `npm test` + `npm run build`