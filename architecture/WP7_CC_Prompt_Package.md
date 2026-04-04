# WP7 — CC Prompt Package

**Document Reference:** WR-WREI-WP7 | **Version:** 1.0 | **Date:** 4 April 2026
**Purpose:** Executable Claude Code prompts for each implementation phase (P0–P4)
**Prerequisite:** WP6 v1.1 approved. All WP documents placed in project `/docs/architecture/` directory.

---

## 0. One-Time Setup

Before running any phase prompt, complete the following setup tasks.

### 0.1 Place Architecture Documents in Project

Copy the WP1–WP6 documents into the project so CC can read them during discovery:

```bash
cd /Users/jeffdusting/Desktop/Projects/wrei-trading-platform
mkdir -p docs/architecture
# Copy WP1–WP6 markdown files into docs/architecture/
# Files: WP1_ESC_Market_Data_Source_Audit.md
#        WP2_Competitive_Platform_Benchmarking.md
#        WP3_CODEBASE_ASSESSMENT.md
#        WP4_User_Scenarios.md
#        WP5_Token_Instrument_Specification.md
#        WP6_Target_Architecture.md
```

### 0.2 CC Permissions

Either create `.claude/settings.json` per WP6 §6.3, or run all sessions with:

```bash
claude --dangerously-skip-permissions --model opus
```

### 0.3 Verify Environment

```bash
node --version          # Should be v20+
npm run build 2>&1 | tail -5   # Check current build state
vercel whoami           # Confirm Vercel CLI authenticated
```

---

## 1. Phase P0 — Stabilise & Persist

**Model:** Opus for P0.3 (decomposition). Sonnet for P0.1, P0.5, P0.6.
**Estimated sessions:** 2–3 (Session A: fixes + dedup. Session B: decomposition. Session C: Postgres + cleanup.)
**Duration:** 5–7 days

### Session P0-A: TypeScript Fixes and Route Deduplication

```
You are working on the WREI Trading Platform — a production trading platform for Australian environmental certificates (ESCs, VEECs, ACCUs) and tokenised carbon/asset products with a Bloomberg Terminal-style UI.

## MANDATORY DISCOVERY

Before writing ANY code, complete these steps:

1. Read CLAUDE.md
2. Read docs/architecture/WP6_Target_Architecture.md — Sections 1 (Principles) and 4.2 (Phase P0)
3. Read docs/architecture/WP3_CODEBASE_ASSESSMENT.md — Sections 1 (Build Health) and 3 (Reusability)
4. Run: npm run build 2>&1 | tail -30
5. Run: npx tsc --noEmit 2>&1 | head -50
6. Run: find . -type f -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | head -100

## TASKS (in order)

### Task P0.1 — Fix TypeScript Compilation Errors

The codebase has 32 TypeScript compilation errors. Fix all of them.

1. Run `npx tsc --noEmit 2>&1` and read every error.
2. The primary issues are:
   - Missing properties in NegotiationState (currentPrice, anchor, floor, volume)
   - Heroicons import errors (ChartLineIcon vs ChartPieIcon — check available exports)
   - Demo mode type mismatches in component interfaces
   - Missing exports in demo state management modules
3. Fix each error. Do NOT use `as any`, `@ts-ignore`, or `@ts-expect-error` — fix the actual types.
4. After fixing, run `npx tsc --noEmit` — it must return zero errors.

### Task P0.2 — Deduplicate API Routes

The files app/api/negotiate/route.ts and app/api/trade/route.ts are identical (1,449 lines each).

1. Verify they are identical: `diff app/api/negotiate/route.ts app/api/trade/route.ts`
2. Delete app/api/trade/route.ts
3. Create app/api/trade/route.ts as a thin re-export that imports from the negotiate route, OR update next.config.js to redirect /api/trade to /api/negotiate.
4. Verify both endpoints respond: test with a simple curl or by checking the build.

## VERIFICATION

After completing both tasks:

```bash
npm run build               # Must succeed, zero errors
npx tsc --noEmit            # Must succeed, zero errors
npm test -- --passWithNoTests 2>&1 | tail -10   # Note pass/fail count
```

## SESSION CLOSE

Create or update TASK_LOG.md with:
- Date, time, phase (P0-A)
- Every file changed with one-line description
- Build status, TS status, test results
- Any issues to carry forward
- Next session should: begin P0.3 (API route decomposition)
```

### Session P0-B: API Route Decomposition

```
You are working on the WREI Trading Platform. This session decomposes the monolithic API route into modular services.

## MANDATORY DISCOVERY

1. Read CLAUDE.md
2. Read TASK_LOG.md for previous session state
3. Read docs/architecture/WP6_Target_Architecture.md — Section 3.2 (Trading Engine architecture)
4. Read the first 100 lines and last 50 lines of app/api/negotiate/route.ts
5. Run: grep -n "export\|function\|async function" app/api/negotiate/route.ts
6. Run: npm run build 2>&1 | tail -10 (confirm clean baseline)

## TASK P0.3 — Decompose API Route Monolith

The 1,449-line negotiate/route.ts must be decomposed into the modular structure defined in WP6 §3.2. Each module must be ≤ 300 lines.

Target structure:
```
lib/trading/
├── negotiation/
│   ├── negotiation-engine.ts    — Core negotiation logic (~200 lines)
│   ├── claude-integration.ts    — Claude API wrapper with timeout (~150 lines)
│   ├── context-builders.ts      — Market context generation (~250 lines)
│   ├── constraint-engine.ts     — Business rule enforcement (~100 lines)
│   └── response-processor.ts    — Output validation and state updates (~100 lines)
└── defence/
    └── defence.ts               — Existing (reuse as-is from lib/defence.ts)
```

Steps:
1. Read the full negotiate/route.ts using targeted line ranges (100 lines at a time).
2. Identify the logical groupings: request processing, Claude API calls, business logic, context generation, response assembly.
3. Extract each group into its own module under lib/trading/negotiation/.
4. Each module exports clear interfaces — no default exports, named exports only.
5. Update app/api/negotiate/route.ts to import from the new modules. The route file itself should become a thin orchestrator (~100 lines) that calls the extracted services.
6. Update app/api/trade/route.ts (the re-export/redirect from P0.2) if needed.
7. Run build and type check after each extraction to catch issues early.

Critical constraints:
- Do NOT change any business logic. This is a structural refactor only.
- Preserve all defence layer behaviour.
- Preserve all Claude API integration behaviour.
- Preserve all pricing logic and constraint enforcement.
- Every function that existed before must still exist and behave identically.

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests 2>&1 | tail -10
```

Also verify the API still works:
```bash
# Check the route compiles and exports correctly
grep -r "export" lib/trading/negotiation/ | head -20
wc -l lib/trading/negotiation/*.ts   # Each file ≤ 300 lines
wc -l app/api/negotiate/route.ts     # Should be ~100 lines now
```

## SESSION CLOSE

Update TASK_LOG.md. Next session should: P0.4 (Vercel Postgres) + P0.5 (test fixes) + P0.6 (demo mode cleanup).
```

### Session P0-C: Persistence, Test Fixes, Baseline

```
You are working on the WREI Trading Platform. This session adds database persistence and cleans up remaining issues.

## MANDATORY DISCOVERY

1. Read CLAUDE.md
2. Read TASK_LOG.md for previous session state
3. Read docs/architecture/WP6_Target_Architecture.md — Section 3.4 (Persistence Layer)
4. Run: npm run build 2>&1 | tail -10 (confirm clean baseline)
5. Run: npm test -- --passWithNoTests 2>&1 | tail -20 (note failing tests)

## TASK P0.4 — Add Vercel Postgres

1. Attempt to provision: `vercel postgres create wrei-trading-db --yes`
   - If this fails due to permissions, STOP and note in TASK_LOG.md that Jeff needs to run this command manually.
   - If it succeeds, continue.
2. Install the Vercel Postgres package: `npm install @vercel/postgres`
3. Create `lib/db/` directory with:
   - `connection.ts` — Connection pool setup using @vercel/postgres (~50 lines)
   - `schema.ts` — SQL schema definitions per WP6 §3.4 (~150 lines)
   - `migrate.ts` — Schema migration runner (~80 lines)
   - `queries/` directory with:
     - `trades.ts` — Trade CRUD operations (~100 lines)
     - `negotiations.ts` — Negotiation session CRUD (~100 lines)
     - `audit-log.ts` — Append-only audit trail writer (~80 lines)
     - `pricing.ts` — Price history and config queries (~80 lines)
4. Create the database schema. Tables required (see WP6 §3.4 for full list):
   - instruments, trades, negotiations, settlements, pricing_config, audit_log, price_history, feed_status
5. Run the migration to create tables.
6. Write a basic connection test.

## TASK P0.5 — Fix Failing Tests

1. Run: `npm test 2>&1 | grep -E "FAIL|PASS" | head -20`
2. For each failing test, read the test file and the source file it tests.
3. Fix the tests. The 15 failures are primarily in:
   - Landing page SVG icon validation (update icon references to match P0.1 fixes)
   - Demo mode integration (update interfaces to match P0.6 changes)
4. Do NOT delete tests. Fix them or update their assertions to match the refactored code.

## TASK P0.6 — Demo Mode Type Cleanup

1. Read components/demo/SimpleDemoProvider.tsx
2. Read all files in lib/demo-mode/ (first 50 lines each)
3. Identify type mismatches between demo state interfaces and component props.
4. Standardise the interfaces — the Zustand store types should be the single source of truth.
5. Fix all type conflicts. Run `npx tsc --noEmit` — must return zero errors.

## TASK P0.7 — Git Baseline and Gate Report

1. Run full verification:
```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
```
2. If all pass, commit and tag:
```bash
git add .
git commit -m "P0: Stabilise and persist — TS fixes, route decomposition, Vercel Postgres, test fixes"
git tag v0.2.0-baseline
```
3. Generate GATE_REPORT_P0.md per WP6 §6.4 template. Include:
   - Build health (all three checks)
   - Files created/modified/deleted counts
   - Phase objectives pass/fail
   - Recommendation: PROCEED or HOLD

## SESSION CLOSE

Update TASK_LOG.md. Commit GATE_REPORT_P0.md.
```

---

## 2. Phase P1 — Multi-Instrument Trading

**Model:** Opus for all tasks (architecture-heavy phase).
**Estimated sessions:** 3–4
**Duration:** 7–10 days

### Session P1-A: Instrument Types and Pricing Engine

```
You are working on the WREI Trading Platform. This session implements the multi-instrument data model and per-instrument pricing engine.

## MANDATORY DISCOVERY

1. Read CLAUDE.md and TASK_LOG.md
2. Read docs/architecture/WP5_Token_Instrument_Specification.md — Sections 2–5 (schemas, lifecycle, pricing)
3. Read docs/architecture/WP6_Target_Architecture.md — Section 3.2 (Trading Engine)
4. Read lib/types.ts (full file — 485 lines, within limit)
5. Read lib/negotiation-config.ts (first 200 lines — pricing parameters)
6. Run: npm run build 2>&1 | tail -10

## TASK P1.1 — Instrument Base Interface and Type-Specific Schemas

1. Create `lib/trading/instruments/` directory.
2. Create `types.ts` — the Instrument base interface and all type-specific metadata interfaces exactly as defined in WP5 §2–3. Include InstrumentType, InstrumentCategory, InstrumentStatus enums.
3. Create `instrument-registry.ts` — a registry that maps InstrumentType to its configuration, metadata schema, and default pricing. This is the single lookup point for all instrument-related config.
4. Create `certificate-config.ts` — ESC, VEEC, PRC, ACCU, LGC, STC configurations with realistic pricing from WP1 research:
   - ESC: spot ~$23.00, floor $18.00, ceiling $29.48 (penalty rate)
   - VEEC: spot ~$83.50, floor $60.00, ceiling $120.00
   - ACCU: spot varies by method ($25–$50 range), floor $20.00
   - LGC: spot ~$5.25, floor $2.00, ceiling $15.00
   - STC: spot ~$39.50, floor $35.00, ceiling $40.00 (clearing house price)
   - PRC: spot ~$2.85, floor $2.00, ceiling $5.00
5. Create `carbon-token-config.ts` — WREI-CC configuration per WP5 §5.3, with 1.5× premium multiplier.
6. Create `asset-token-config.ts` — WREI-ACO configuration per WP5.

All files ≤ 300 lines. Use Australian spelling in all comments and string literals.

## TASK P1.2 — Per-Instrument Pricing Engine

1. Create `lib/trading/instruments/pricing-engine.ts` (~200 lines).
2. Implement InstrumentPricingConfig interface from WP5 §5.2.
3. The pricing engine:
   - Accepts an InstrumentType and returns the full pricing config
   - Calculates anchor price (from spot, fixed, or premium-over-spot)
   - Enforces price floor and ceiling
   - Applies volume discount thresholds
   - Returns negotiation parameters (max concession per round, max total concession)
4. Replace references to the old generic pricing in lib/negotiation-config.ts — the old config becomes a data input to the new per-instrument engine, not the engine itself. Do NOT delete negotiation-config.ts yet; extract the reusable parts and import them.

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
```

Check module sizes:
```bash
wc -l lib/trading/instruments/*.ts   # Each ≤ 300 lines
```

## SESSION CLOSE

Update TASK_LOG.md. Next session: P1.3 (instrument switcher UI) + P1.4 (ESC personas) + P1.5 (context builders).
```

### Session P1-B: UI Instrument Switcher and ESC Personas

```
You are working on the WREI Trading Platform. This session adds the instrument switcher to the Bloomberg UI and creates ESC-specific negotiation personas.

## MANDATORY DISCOVERY

1. Read CLAUDE.md and TASK_LOG.md
2. Read docs/architecture/WP4_User_Scenarios.md — Section 8 (ESC-specific personas)
3. Read docs/architecture/WP6_Target_Architecture.md — Section 3.1 (Bloomberg UI enhancements) and Section 3.5 (AI Engine — conciseness directive)
4. Read components/navigation/BloombergShell.tsx (full — 286 lines)
5. Read app/trade/page.tsx (first 100 lines)
6. Read lib/personas.ts (full — 176 lines)
7. Run: npm run build 2>&1 | tail -10

## TASK P1.3 — Instrument Switcher in Bloomberg UI

1. Create `components/trading/InstrumentSwitcher.tsx` (~150 lines).
2. The switcher displays instrument categories and types as selectable tabs or dropdown:
   - Certificates: ESC | VEEC | ACCU | LGC | STC | PRC
   - Tokens: WREI-CC | WREI-ACO
3. When an instrument is selected:
   - The pricing engine loads the instrument's config
   - The market data panel updates (price chart, order book) for that instrument
   - The trade entry form updates (unit of measure, price range, order types)
   - The AI negotiation context switches to instrument-specific prompts
4. Integrate the switcher into app/trade/page.tsx — it should appear prominently in the trading interface.
5. Use existing Bloomberg Terminal design tokens. The switcher must look institutional — no casual UI patterns.

## TASK P1.4 — ESC-Specific Personas

1. Create `lib/trading/personas/esc-personas.ts` (~120 lines).
2. Implement the 4 ESC personas defined in WP4 §8:
   - NSW ESC Obligated Entity Buyer — price-sensitive, deadline-driven, references penalty rate as BATNA
   - ESC Trading Desk (Institutional) — sophisticated, seeks arbitrage, demands fast execution
   - Government Energy Efficiency Buyer — process-oriented, requires documentation, formal RFQ
   - ESC Accredited Certificate Provider (Seller) — inventory-constrained, cash-flow sensitive
3. Each persona includes: name, role description, negotiation strategy instructions, pricing parameters, and communication style. The AI conciseness directive (WP6 §3.5) applies — persona instructions must direct Claude to respond concisely within the trading context.
4. Register these personas in the existing persona system alongside the current 11.

## TASK P1.5 — Instrument-Aware Context Builder

1. Create `lib/trading/negotiation/instrument-context.ts` (~250 lines).
2. This module generates the system prompt context injected into Claude for each negotiation, specific to the instrument being traded:
   - ESC context: current spot price, penalty rate, creation volumes, scheme changes, surrender deadline proximity
   - VEEC context: similar to ESC with Victorian scheme specifics
   - ACCU context: method type, Safeguard Mechanism obligations, co-benefits
   - WREI-CC context: verification premium justification, provenance depth, dMRV benchmark
   - WREI-ACO context: yield metrics, fleet utilisation, NAV, comparable infrastructure yields
3. The context builder pulls from the pricing engine (P1.2) and instrument registry (P1.1).
4. Integrate with the existing negotiation engine — replace the generic context with instrument-specific context.
5. Embed the conciseness directive in all generated system prompts:
   "Respond concisely. Data-dense, no filler. State facts and figures directly. Format for rapid scanning."

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
wc -l components/trading/InstrumentSwitcher.tsx   # ≤ 300 lines
wc -l lib/trading/personas/esc-personas.ts         # ≤ 300 lines
wc -l lib/trading/negotiation/instrument-context.ts # ≤ 300 lines
```

## SESSION CLOSE

Update TASK_LOG.md. Next session: P1.6 (order book) + P1.7 (trade blotter) + P1.8 (end-to-end test).
```

### Session P1-C: Order Book, Trade Blotter, End-to-End Test

```
You are working on the WREI Trading Platform. This session builds the simulated order book, persistent trade blotter, and validates end-to-end ESC trading.

## MANDATORY DISCOVERY

1. Read CLAUDE.md and TASK_LOG.md
2. Read docs/architecture/WP6_Target_Architecture.md — Section 3.6 (Resilience — Error Boundaries)
3. Read lib/db/queries/trades.ts (created in P0)
4. Read lib/trading/instruments/pricing-engine.ts (created in P1-A)
5. Run: npm run build 2>&1 | tail -10

## TASK P1.6 — Simulated Order Book

1. Create `lib/trading/orderbook/` directory.
2. Create `orderbook-simulator.ts` (~200 lines):
   - Generates a realistic bid/ask order book for any instrument type
   - Uses the instrument's spot price as midpoint
   - Generates 10 price levels on each side with realistic volume distribution (more volume near the spread, thinning at extremes)
   - Spread width varies by instrument (ESC: tight ~$0.10, ACCU: wider ~$0.50, WREI-CC: wider ~$1.00)
   - Updates periodically (configurable interval, default 5 seconds) with small random perturbations
3. Create `components/trading/OrderBookPanel.tsx` (~200 lines):
   - Displays bid/ask depth as a visual panel (price levels, volumes, depth bars)
   - Bloomberg Terminal styling — green bids, red asks, monospace numbers
   - Updates reactively when the simulator produces new data
4. Wrap OrderBookPanel in an Error Boundary per WP6 §3.6 — if it crashes, the trading interface continues.

## TASK P1.7 — Persistent Trade Blotter

1. Create `components/trading/TradeBlotter.tsx` (~200 lines):
   - Reads trade history from Vercel Postgres via lib/db/queries/trades.ts
   - Displays as a Bloomberg-style data grid: timestamp, instrument, side (buy/sell), quantity, price, total value, settlement status, trade ID
   - Filterable by instrument type, date range, status
   - Sortable by any column
   - Pagination for large datasets
2. When a trade completes (via negotiation or direct order), write it to the database AND display it immediately in the blotter.
3. Wrap in Error Boundary.

## TASK P1.8 — End-to-End ESC Trade Test

Validate the full ESC trading flow:

1. Select ESC via the instrument switcher.
2. Verify the order book shows ESC-specific data (~$23 midpoint).
3. Initiate an AI negotiation for 10,000 ESCs.
4. Verify the AI agent uses ESC-specific context (penalty rate, creation volumes, market conditions).
5. Complete the negotiation to an agreed trade.
6. Verify the trade appears in the blotter with correct instrument type, price, quantity.
7. Verify the trade is persisted in Vercel Postgres.

If any step fails, fix it before proceeding. Document the full flow in TASK_LOG.md.

Generate GATE_REPORT_P1.md per WP6 §6.4 template.

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
wc -l lib/trading/orderbook/*.ts components/trading/OrderBookPanel.tsx components/trading/TradeBlotter.tsx
```

## SESSION CLOSE

Update TASK_LOG.md. Commit GATE_REPORT_P1.md. Tag: `git tag v0.3.0-multi-instrument`
```

---

## 3. Phase P2 — Live Data & Settlement

**Model:** Opus for all tasks.
**Estimated sessions:** 2–3
**Duration:** 5–7 days

### Session P2-A: Price Feed Scrapers and Cache

```
You are working on the WREI Trading Platform. This session connects live price data and builds the settlement adapter framework.

## MANDATORY DISCOVERY

1. Read CLAUDE.md and TASK_LOG.md
2. Read docs/architecture/WP1_ESC_Market_Data_Source_Audit.md — Section 4 (Price Data Sources) and Section 7.1 (Data Layer Design)
3. Read docs/architecture/WP6_Target_Architecture.md — Section 3.3 (Data Feed Layer) and Section 3.6 (Resilience)
4. Run: ls lib/data-feeds/ and read the first 50 lines of each file to understand existing infrastructure
5. Run: npm run build 2>&1 | tail -10

## TASK P2.1 — Price Feed Scrapers

1. Create `lib/data-feeds/adapters/` directory.
2. Create `ecovantage-scraper.ts` (~150 lines):
   - Fetches the Ecovantage market update page (https://www.ecovantage.com.au/energy-certificate-market-update/)
   - Extracts ESC, VEEC, LGC, ACCU, STC, PRC spot prices from the page content
   - Parses prices into the standard InstrumentPricing format
   - Returns structured data with timestamp and source attribution
   - Handles fetch failures gracefully — returns null, does not throw
3. Create `northmore-scraper.ts` (~150 lines):
   - Fetches Northmore Gordon certificate prices page (https://northmoregordon.com/certificate-prices/)
   - Similar extraction logic, different page structure
   - Serves as secondary/validation source
4. Create `simulation-engine.ts` (~200 lines):
   - Generates realistic price data when scrapers fail or for instruments without live sources
   - Uses instrument-specific parameters (spot, volatility, trend) from pricing config
   - Generates intraday price movements using a random walk bounded by floor/ceiling
   - Generates historical data (30 days) for chart display

## TASK P2.2 — Price Cache

1. Create `lib/data-feeds/cache/price-cache.ts` (~150 lines):
   - Writes price data to the price_history table in Vercel Postgres
   - Reads price data with configurable lookback period
   - Tracks feed health in the feed_status table (last successful fetch, consecutive failures, current status)
   - Implements the three-tier fallback: live → cached → simulated

2. Create `lib/data-feeds/feed-manager.ts` (~200 lines):
   - Orchestrates all feed adapters with circuit breaker pattern per WP6 §3.6
   - Each adapter wrapped in try/catch with fallback to next tier
   - Provides a single `getPrice(instrumentType)` function that returns the best available price with source attribution
   - Provides `getPriceHistory(instrumentType, days)` for charts
   - Exposes `getHealthStatus()` for the Bloomberg status bar indicators

## TASK P2.3 — Connect to UI

1. Update the market ticker component to use feed-manager instead of static/simulated data.
2. Update price charts to use getPriceHistory from the cache.
3. Add feed health indicators to the Bloomberg Terminal status bar:
   - Green dot + "Live" when scraper data is current (< 24 hours old)
   - Amber dot + "Cached [timestamp]" when using cached data
   - Grey dot + "Simulated" when using simulation engine
4. Each indicator wrapped in Error Boundary — feed display failure does not affect trading.

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
wc -l lib/data-feeds/adapters/*.ts lib/data-feeds/cache/*.ts lib/data-feeds/feed-manager.ts
```

Test the scrapers (if network access available):
```bash
node -e "const f = require('./lib/data-feeds/adapters/ecovantage-scraper'); f.scrape().then(console.log)"
```

## SESSION CLOSE

Update TASK_LOG.md. Next session: P2.4–P2.8 (settlement adapters + audit trail).
```

### Session P2-B: Settlement Adapters and Audit Trail

```
You are working on the WREI Trading Platform. This session implements the settlement adapter framework and audit trail.

## MANDATORY DISCOVERY

1. Read CLAUDE.md and TASK_LOG.md
2. Read docs/architecture/WP5_Token_Instrument_Specification.md — Section 7 (Settlement Adapter Specification)
3. Read docs/architecture/WP6_Target_Architecture.md — Section 3.2 (settlement directory structure)
4. Run: npm run build 2>&1 | tail -10

## TASKS P2.4–P2.7 — Settlement Adapters

1. Create `lib/trading/settlement/types.ts` (~60 lines):
   - SettlementAdapter interface, SettlementRecord, SettlementStatus, CompletedTrade types
   - Per WP5 §7

2. Create `lib/trading/settlement/settlement-orchestrator.ts` (~150 lines):
   - Routes a completed trade to the correct adapter based on instrument type
   - Manages settlement state machine: Confirmed → Processing → Complete (or Failed)
   - Writes all state transitions to the settlements table and audit log
   - Circuit breaker wrapper for each adapter per WP6 §3.6

3. Create settlement adapters (each ~100–150 lines, all simulated for now):
   - `adapters/tessa-adapter.ts` — ESC/PRC: generates TESSA transfer instructions, simulates multi-step workflow (Initiated → Transfer Recorded → Complete), realistic timing (1–3 business day simulation)
   - `adapters/cer-adapter.ts` — ACCU: generates CER registry transfer, simulates CorTenX API response with realistic unit data, T+1 timing
   - `adapters/veec-adapter.ts` — VEEC: mirrors TESSA pattern for Victorian registry
   - `adapters/blockchain-adapter.ts` — WREI-CC/WREI-ACO: generates simulated blockchain transaction hash, T+0 instant settlement, includes block number and confirmation count

4. Create stubs (each ~80 lines):
   - `adapters/zoniqx-stub.ts` — Zoniqx zConnect API contract stub with documented endpoints
   - `adapters/cortenx-stub.ts` — Trovio CorTenX API contract stub with documented endpoints

## TASK P2.8 — Audit Trail Logger

1. Create `lib/trading/compliance/audit-logger.ts` (~100 lines):
   - Writes to the audit_log table (append-only, no updates or deletes)
   - Every platform action: trade initiation, negotiation message, trade confirmation, settlement state change, user action, configuration change
   - Each entry: timestamp, action_type, user_id (null for system), instrument_id, details (JSONB), session_id
   - The logger is called from the trade engine, settlement orchestrator, and negotiation engine
2. Integrate the audit logger into:
   - The negotiation engine (log each negotiation turn)
   - The settlement orchestrator (log each state transition)
   - The trade engine (log trade creation and completion)

Generate GATE_REPORT_P2.md per WP6 §6.4 template.

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
wc -l lib/trading/settlement/**/*.ts lib/trading/compliance/audit-logger.ts
```

## SESSION CLOSE

Update TASK_LOG.md. Commit GATE_REPORT_P2.md. Tag: `git tag v0.4.0-live-data`
```

---

## 4. Phase P3 — Scenarios & Demo

**Model:** Opus for all tasks.
**Estimated sessions:** 3–4
**Duration:** 5–7 days

### Session P3-A: Investor Demo and Carbon Buyer Scenarios

```
You are working on the WREI Trading Platform. This session implements the investor demo flow and institutional carbon buyer scenario.

## MANDATORY DISCOVERY

1. Read CLAUDE.md and TASK_LOG.md
2. Read docs/architecture/WP4_User_Scenarios.md — Sections 2 (Scenario A) and 4 (Scenario C)
3. Read docs/architecture/WP6_Target_Architecture.md — Section 3.1 (Bloomberg UI enhancements)
4. Read app/page.tsx (first 100 lines — landing dashboard)
5. Run: npm run build 2>&1 | tail -10

## TASK P3.1 — Scenario A: Investor Demo Flow

Implement the 7-step investor demonstration per WP4 §2.2:

Step A1 — Landing Dashboard:
- Update app/page.tsx to display live/simulated prices for all 6 certificate types in the market ticker
- Add dashboard metrics: total platform volume, active sessions, certificates tracked, registry connection status indicators
- Add three product cards: ESC Trading, Carbon Credit Tokens, Asset Co Tokens

Step A2 — ESC Trading Demo:
- The trade page (already built in P1) must support the full flow: market data → order book → AI negotiation → trade confirmation → blotter entry
- Verify instrument switcher, ESC-specific pricing, and ESC persona context all work together

Step A3 — Carbon Credit Tokenisation:
- Create `components/trading/TokenDetailPanel.tsx` (~200 lines)
- Displays WREI-CC token metadata: verification standards, generation source, provenance chain, WREI premium indicator
- Include a token lifecycle visualisation (Data Collected → Verified → Minted → Active → Traded → Retired)

Step A4 — Asset Co Token:
- Extend TokenDetailPanel for WREI-ACO display: underlying asset, yield characteristics, fleet metrics
- Show cross-collateralisation concept as a visual flow

Step A5 — Compliance Dashboard:
- Implemented in P3.4 (Scenario D) — reference only here

Step A6 — Analytics:
- Update the analyse page with market overview: certificate type summary, prices, creation volumes
- Add AI market commentary section — calls Claude Sonnet 4 per WP6 §3.5 capability matrix

Step A7 — Closing (no UI work — presenter verbal)

## TASK P3.3 — Scenario C: Institutional Carbon Buyer

Per WP4 §4:
1. Carbon credit market view on the analyse page with filter/search by standard, vintage, project type, co-benefits
2. AI negotiation for WREI-CC with the strategy panel visible — shows AI reasoning alongside the negotiation chat
3. Trade confirmation with provenance certificate (downloadable summary — can be a styled div with print CSS)

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
```

Walk through Scenario A steps A1–A4 and A6 manually in the browser. Document any issues.

## SESSION CLOSE

Update TASK_LOG.md. Next session: P3.2 (broker), P3.4 (compliance), P3.5 (bulk ESC).
```

### Session P3-B: Broker, Compliance, and Bulk ESC Scenarios

```
You are working on the WREI Trading Platform. This session implements the broker, compliance officer, and bulk ESC purchase scenarios.

## MANDATORY DISCOVERY

1. Read CLAUDE.md and TASK_LOG.md
2. Read docs/architecture/WP4_User_Scenarios.md — Sections 3 (Scenario B), 5 (Scenario D), 6 (Scenario E)
3. Run: npm run build 2>&1 | tail -10

## TASK P3.2 — Scenario B: ESC Broker White-Label

Per WP4 §3:
1. Create `lib/config/white-label.ts` (~80 lines) — configuration for branding overrides (logo URL, primary colour, accent colour, business name, contact)
2. Create `components/branding/WhiteLabelProvider.tsx` (~100 lines) — applies CSS variable overrides from white-label config
3. Update BloombergShell to accept white-label branding — the shell reads from WhiteLabelProvider and applies overrides to the top bar, navigation, and footer
4. Create a sample broker configuration (e.g., "Demand Manager" branding with placeholder logo)

## TASK P3.4 — Scenario D: Compliance Officer Dashboards

Per WP4 §5:
1. Update app/compliance/page.tsx with live compliance data:
   - Regulatory status grid: ASIC, AUSTRAC, IPART, CER with status indicators and dates
   - ESS compliance view: 2026 target, penalty rate ($29.48), surrender deadline, sample obligated entity positions
   - Scheme changes monitor: reference to current ESS Rule Change Review and ESS Policy Reform consultations
2. Create `components/compliance/AuditTrailViewer.tsx` (~200 lines):
   - Reads from audit_log table via lib/db/queries/
   - Filterable by action type, date range, instrument, user
   - Exportable to CSV

## TASK P3.5 — Scenario E: Bulk ESC Purchase

Per WP4 §6:
1. Create `components/trading/BulkNegotiationDashboard.tsx` (~250 lines):
   - Displays a large-volume ESC purchase being worked by the AI agent across multiple simulated counterparties
   - Shows: total volume filled, average price achieved, per-counterparty cards (volume, price, status), VWAP comparison to spot
   - Buyer controls: max price, min vintage, max per counterparty, deadline
2. The bulk negotiation runs multiple sequential AI negotiation sessions (simulated concurrency — actually sequential calls to Claude, displayed as parallel progress)
3. Generates an execution report at completion (trade summary, VWAP, counterparty breakdown)

## TASK P3.6 — Demo Mode Data Seeding

1. Create `lib/demo/seed-data.ts` (~200 lines):
   - Generates and inserts demo data into Vercel Postgres:
     - 30 days ESC price history (~$22.50–$24.00 with realistic daily variance)
     - 30 days for each other certificate type using realistic ranges from WP1
     - 5 simulated counterparties with names, risk ratings, inventory levels
     - 3 pre-executed trades in the blotter (one completed, one settling, one pending)
     - 2 sample obligated entity compliance positions (one on track, one at risk)
     - 1 sample WREI-CC token with full metadata
     - 1 sample WREI-ACO token with yield data
2. Demo mode activatable via environment variable: `DEMO_MODE=true`
3. When DEMO_MODE is true, seed data is loaded on first access if not already present

Generate GATE_REPORT_P3.md. Tag: `git tag v0.5.0-scenarios`

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
```

Walk through all 5 scenarios in the browser. Document any issues in GATE_REPORT_P3.md.

## SESSION CLOSE

Update TASK_LOG.md. Commit GATE_REPORT_P3.md.
```

---

## 5. Phase P4 — Compliance & Polish

**Model:** Sonnet for P4.1–P4.4, P4.6–P4.7, P4.9. Opus for P4.5, P4.8.
**Estimated sessions:** 2
**Duration:** 3–5 days

### Session P4-A: Compliance, Reporting, Polish

```
You are working on the WREI Trading Platform. This session adds production compliance features, reporting, and final polish.

## MANDATORY DISCOVERY

1. Read CLAUDE.md and TASK_LOG.md
2. Read docs/architecture/WP6_Target_Architecture.md — Section 4.6 (Phase P4) and Section 3.5 (AI Engine — AI disclosure)
3. Run: npm run build 2>&1 | tail -10

## TASK P4.1 — Compliance Dashboard Final Pass

1. Verify all compliance data is current and accurate:
   - ESC penalty rate 2026: $29.48 (source: IPART Targets and Penalties page)
   - ESS energy savings targets (source: ESS legislation)
2. Add AI disclosure integration per WP5 §8.2 — the standard disclosure text appears on all trade confirmations and audit records where AI negotiation was used.

## TASK P4.2 — Report Generation

1. Create `lib/trading/compliance/report-generator.ts` (~200 lines):
   - Trade report: exports trade history as CSV with all fields
   - Compliance summary: PDF-styled HTML showing surrender position, penalty exposure, deadline status
   - Audit export: full audit trail as CSV for regulatory filing
2. Add export buttons to the trade blotter and compliance dashboard.

## TASK P4.3 — AI Disclosure

1. Ensure every trade confirmation that used AI negotiation includes the disclosure text from WP5 §8.2.
2. Ensure the audit trail flags AI-assisted trades distinctly from manual trades.

## TASK P4.4 — White-Label Polish

1. Verify the white-label theming system works end-to-end — apply a sample broker brand and walk through Scenario B.
2. Fix any styling leaks (Bloomberg defaults showing through white-label overrides).

## TASK P4.5 — Performance Testing

1. Measure and document:
   - Landing page load time (target: < 2 seconds)
   - Trade page load time (target: < 2 seconds)
   - AI negotiation first-response time (target: < 5 seconds)
   - API response times for non-AI endpoints (target: < 500ms)
2. If any target is missed, investigate and optimise (lazy loading, code splitting, query optimisation).

## TASK P4.6–P4.7 — API Stubs

1. Finalise Zoniqx zConnect API stub with documented endpoint contracts.
2. Finalise Trovio CorTenX API stub with documented endpoint contracts.
3. Both stubs should return realistic simulated responses and include inline documentation of expected production API behaviour.

## TASK P4.8 — Final Regression Suite

Run every regression test from WP6 §5.2 (REG-A1 through REG-F4). Document results.

## TASK P4.9 — Document Set Finalisation

1. Update all WP documents with version numbers and final dates.
2. Verify all cross-references are correct.
3. Generate a final README.md update documenting the platform's current capabilities.

Generate GATE_REPORT_P4.md (final gate report).

## VERIFICATION

```bash
npm run build
npx tsc --noEmit
npm test -- --passWithNoTests
```

## SESSION CLOSE

Update TASK_LOG.md. Commit GATE_REPORT_P4.md. Tag: `git tag v1.0.0-investor-ready`

Push all tags:
```bash
git push --tags
```
```

---

## 6. Post-Completion Checklist

After all phases complete, Jeff reviews:

- [ ] GATE_REPORT_P0.md — all objectives pass
- [ ] GATE_REPORT_P1.md — all objectives pass
- [ ] GATE_REPORT_P2.md — all objectives pass
- [ ] GATE_REPORT_P3.md — all objectives pass
- [ ] GATE_REPORT_P4.md — all objectives pass, all regression tests pass
- [ ] Walk through Scenario A (investor demo) end-to-end on production URL
- [ ] Platform tagged v1.0.0-investor-ready
- [ ] Document set (WP1–WP7) versioned in docs/architecture/

---

*This prompt package is designed for execution with cleared CC context at each session start. The TASK_LOG.md provides cross-session continuity. Each prompt is self-contained and references the architecture documents that CC reads during its mandatory discovery phase.*
