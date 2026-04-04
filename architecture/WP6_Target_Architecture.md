# WP6 — WREI Trading Platform: Target Architecture

**Document Reference:** WR-WREI-WP6 | **Version:** 2.0 (Final) | **Date:** 4 April 2026
**Classification:** Internal — Development Reference
**Author:** Strategic architecture developed in Claude, codebase assessment via Claude Code
**Supersedes:** TRADE_IMPLEMENTATION_PLAN.md (negotiate-to-trade plan), WR-STR-011A v1.1 (R0–R4 refactoring programme)
**v1.1 Changes:** AI engine scope and communication directive, resilience patterns, future roadmap, service granularity constraints, CC model guidance, graceful failure design

---

## Document Set Index

This architecture document is part of a controlled document set governing the WREI Trading Platform development. All documents use the prefix `WR-WREI-` and are versioned independently.

| Ref | Title | Purpose | Status |
|---|---|---|---|
| WR-WREI-WP1 | ESC Market & Data Source Audit | Market structure, registry APIs, data feed availability, integration strategy | Final v1.0 |
| WR-WREI-WP2 | Competitive Platform Benchmarking | Feature taxonomy, competitive analysis, scope gap identification | Final v1.0 |
| WR-WREI-WP3 | Codebase Architecture Assessment | Reusability analysis, decomposition plan, build health, risk register | Final |
| WR-WREI-WP4 | User Scenarios | Five persona workflows, feature dependencies, cross-scenario matrix | Final v1.0 — all 5 implemented |
| WR-WREI-WP5 | Token & Instrument Specification | Metadata schemas, lifecycle states, pricing mechanics, settlement adapters | Final v1.0 — implemented |
| **WR-WREI-WP6** | **Target Architecture** | **Platform architecture, phased implementation plan, test strategy** | **Final v2.0** |
| WR-WREI-WP7 | CC Prompt Package | Claude Code execution prompts for each implementation phase | Final — all phases executed |

**Upstream references:** WR-STR-007 (AI Carbon Markets Strategy), WR-STR-008 (Tokenisation Strategy), WR-STR-009 (Investor Summary), WR-FIN-001 (Financial Model), WRR-ESG-001 v5.2 (Impact Report), WREI Tokenisation Practical Paper.

**Downstream consumers:** Claude Code development prompts, regression test specifications, investor technical due diligence, regulatory documentation.

---

## 1. Architecture Principles

The following principles govern all design decisions. They are listed in priority order — where principles conflict, higher-ranked principles prevail.

1. **Production-first, demo-capable.** Design every component for production trading. Demo mode is a configuration overlay on production architecture, not a separate system.

2. **Instrument-agnostic core, instrument-specific adapters.** The trading engine, UI, and data layer handle all instrument types through a unified interface. Instrument-specific behaviour (ESC registry transfers, token on-chain settlement) is isolated in adapters.

3. **Provider-flexible infrastructure.** No vendor lock-in for tokenisation (Zoniqx), registry connectivity (Trovio/CorTenX), or settlement. All external dependencies are accessed through abstraction interfaces with pluggable implementations.

4. **Live data priority, simulation as fallback.** Where live data feeds exist, use them. Where they don't, simulate with realistic parameters derived from actual market data. The platform must clearly distinguish between live and simulated data in the UI.

5. **Compliance-embedded, not bolted on.** Authentication, audit trails, regulatory reporting, and AI disclosure are architectural components, not features added later.

6. **Context-managed development.** All Claude Code work operates within defined context boundaries, with mandatory discovery phases, file-path citations, and verification checkpoints at each phase gate.

7. **Graceful degradation.** Every external dependency (Claude API, price feeds, registry APIs, database) must have a defined failure mode that keeps the platform functional. No single API failure should render the platform unusable. Users must see clear status indicators when operating in degraded mode.

8. **AI on-demand only.** The AI engine is invoked only when a user or system event requires it. There are no background AI processes consuming tokens. Every AI call has a defined purpose, cost ceiling, and timeout. LLM communication is concise — no verbose explanations, no filler. The platform is a trading terminal, not a chatbot.

9. **Small, testable services.** No service module exceeds ~300 lines. Each module has a single responsibility, clear inputs and outputs, and can be unit-tested in isolation. Large modules are decomposed until this criterion is met.

---

## 2. System Architecture Overview

### 2.1 High-Level Component Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                     WREI Trading Platform                           │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │  Bloomberg   │  │   Trading   │  │  Analytics  │  │Compliance │ │
│  │ Terminal UI  │  │   Engine    │  │   Engine    │  │  Engine   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │
│         │                │                │               │        │
│  ┌──────┴────────────────┴────────────────┴───────────────┴──────┐ │
│  │                    API Layer (Next.js API Routes)              │ │
│  │    Negotiation Service │ Trade Service │ Data Service          │ │
│  └──────┬────────────────┬────────────────┬──────────────────────┘ │
│         │                │                │                        │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐               │
│  │  AI Engine  │  │ Settlement  │  │  Data Feed  │               │
│  │ (Claude     │  │  Adapters   │  │  Adapters   │               │
│  │  Opus 4)    │  │             │  │             │               │
│  └─────────────┘  └──────┬──────┘  └──────┬──────┘               │
│                          │                │                        │
└──────────────────────────┼────────────────┼────────────────────────┘
                           │                │
              ┌────────────┼────────────────┼────────────────┐
              │            │                │                │
        ┌─────┴─────┐ ┌───┴───┐ ┌─────────┴──┐ ┌──────────┴──┐
        │  TESSA    │ │  CER  │ │ Ecovantage │ │   Zoniqx    │
        │ (ESC/PRC) │ │CorTenX│ │ Northmore  │ │   CorTenX   │
        │           │ │(ACCU) │ │ CORE Mkts  │ │  (stubbed)  │
        └───────────┘ └───────┘ └────────────┘ └─────────────┘
              Registries          Price Feeds    Infrastructure
```

### 2.2 Technology Stack (Confirmed)

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Existing, production-tested |
| Language | TypeScript 5.3 (strict mode) | Existing, comprehensive type system |
| UI | Tailwind CSS + Bloomberg Terminal design tokens | Existing, 85% production-ready |
| Charts | Recharts 3.8 | Existing |
| State (client) | Zustand 5.0 + React Context | Existing, extend for multi-instrument |
| State (server) | Vercel Postgres | New — replaces stateless architecture |
| AI | Anthropic Claude Opus 4 (server-side only) | Existing, production-grade |
| Testing | Jest 30 + Playwright 1.42 | Existing, 99.1% pass rate |
| Deployment | Vercel | Existing |
| Monitoring | Vercel Analytics + structured logging | New |

---

## 3. Component Specifications

### 3.1 Bloomberg Terminal UI

**Current state (WP3):** 85% production-ready. BloombergShell, market ticker, design tokens, and navigation are production-grade. Missing: order book depth visualisation, persistent trade blotter, alert system, command palette.

**Target state:** Full institutional trading interface supporting all five user scenarios (WP4).

**Key enhancements:**

| Enhancement | Description | Scenario Dependencies | Estimated Effort |
|---|---|---|---|
| Order book visualisation | Simulated CLOB with bid/ask depth display | A, E | 3 days |
| Persistent trade blotter | Trade history from Vercel Postgres with filtering, search, export | A, B, C, D, E | 2 days |
| Instrument switcher | Product selector (ESC / VEEC / ACCU / WREI-CC / WREI-ACO) that reconfigures all panels | A, B, C, E | 2 days |
| Settlement status tracker | Visual pipeline showing trade → transfer → settled states | A, B, C, E | 2 days |
| Token detail panel | Full metadata display for WREI-CC and WREI-ACO with provenance chain | A, C | 2 days |
| Compliance dashboard (live data) | Regulatory status, ESS targets, penalty rates, audit readiness score | A, D | 3 days |
| White-label theming | CSS variable overrides for broker branding | B | 1 day |
| Alert system | Configurable price/volume/compliance alerts | B, D | 2 days |

### 3.2 Trading Engine

**Current state (WP3):** AI negotiation via Claude Opus 4 is production-grade. Defence layers effective. 11 buyer personas. Pricing config is demo-grade (single instrument, generic parameters).

**Target state:** Multi-instrument trading engine with per-instrument pricing, order management, and settlement orchestration.

**Architecture (all modules ≤ 300 lines per Principle 9):**

```
lib/trading/
├── engine.ts                    — Trade orchestrator: order routing, state machine (~200 lines)
├── instruments/
│   ├── instrument-registry.ts   — Instrument type registration and lookup (~100 lines)
│   ├── certificate-config.ts    — ESC/VEEC/ACCU/LGC/STC pricing configs (~150 lines)
│   ├── carbon-token-config.ts   — WREI-CC pricing config (~80 lines)
│   └── asset-token-config.ts    — WREI-ACO pricing config (~80 lines)
├── negotiation/
│   ├── negotiation-engine.ts    — Core negotiation logic (~200 lines)
│   ├── claude-integration.ts    — Claude API wrapper with timeout and cost guard (~150 lines)
│   ├── context-builders.ts      — Per-instrument market context generation (~250 lines)
│   ├── constraint-engine.ts     — Business rule enforcement per instrument (~100 lines)
│   └── response-processor.ts    — Output validation and state updates (~100 lines)
├── settlement/
│   ├── settlement-orchestrator.ts — Routes trades to correct adapter (~150 lines)
│   ├── adapters/
│   │   ├── tessa-adapter.ts     — ESC/PRC settlement (~150 lines)
│   │   ├── cer-adapter.ts       — ACCU settlement via CorTenX (~150 lines)
│   │   ├── veec-adapter.ts      — VEEC settlement (~100 lines)
│   │   ├── blockchain-adapter.ts — WREI token settlement (~150 lines)
│   │   ├── zoniqx-stub.ts       — Zoniqx zConnect API stub (~80 lines)
│   │   └── cortenx-stub.ts      — Trovio CorTenX API stub (~80 lines)
│   └── types.ts                 — Settlement interfaces (~60 lines)
├── compliance/
│   ├── compliance-engine.ts     — Per-instrument compliance rule evaluation (~200 lines)
│   ├── audit-logger.ts          — Immutable audit trail writer (~100 lines)
│   ├── ai-disclosure.ts         — AI negotiation disclosure generator (~50 lines)
│   └── reporting.ts             — Regulatory report generation (~200 lines)
├── personas/
│   ├── existing-personas.ts     — Retain existing 11 personas (~180 lines)
│   └── esc-personas.ts          — 4 new ESC-specific personas (~120 lines)
└── defence/
    └── defence.ts               — Existing defence layer (reuse as-is, 374 lines — exception to 300-line rule, production-proven)
```

**Note on `defence.ts`:** At 374 lines this marginally exceeds the 300-line target but is production-proven with comprehensive test coverage (WP3). Splitting it would add complexity without improving testability. Retained as-is with a documented exception.

### 3.3 Data Feed Layer

**Current state (WP3):** 85K lines of feed infrastructure in `lib/data-feeds/` — architecture complete but not connected to live sources. The existing files are significantly oversized (10K–26K lines each) and must be decomposed during integration.

**Target state:** Live price feeds where available, with graceful fallback to cached/simulated data. Each adapter module ≤ 300 lines, with shared utilities extracted.

**Feed architecture (decomposed from existing monoliths):**

```
lib/data-feeds/
├── feed-manager.ts              — Feed orchestrator, health monitoring, fallback logic
├── adapters/
│   ├── ecovantage-scraper.ts    — Weekly ESC/VEEC/ACCU/LGC spot prices
│   ├── northmore-scraper.ts     — Daily certificate price charts
│   ├── core-markets-api.ts      — CORE Markets subscription API (when available)
│   ├── cer-registry-api.ts      — CER CorTenX public data (when interop available)
│   └── simulation-engine.ts     — Realistic data simulation for gaps
├── cache/
│   └── price-cache.ts           — Vercel Postgres price history cache
└── types.ts                     — Feed interfaces
```

**Feed priority matrix:**

| Data Point | Tier 1 (Live) | Tier 2 (Cached) | Tier 3 (Simulated) |
|---|---|---|---|
| ESC spot price | Ecovantage/Northmore scrape | Last known price + timestamp | Historical mean ± realistic volatility |
| VEEC spot price | Ecovantage/Northmore scrape | Last known price | Historical mean ± volatility |
| ACCU spot price | CORE Markets (subscription) | Last known price | Method-specific reference prices |
| LGC/STC spot price | Ecovantage/Northmore scrape | Last known price | Historical mean ± volatility |
| Order book depth | — | — | Simulated with realistic spread/volume |
| ESC creation volumes | IPART annual reports (manual) | Cached quarterly | Modelled from historical trend |
| Carbon credit prices (global) | Existing data feed modules | Cached | Simulated |

### 3.4 Persistence Layer (Vercel Postgres)

**Schema overview:**

```sql
-- Core tables
instruments          — Instrument registry with JSONB metadata per type
trades               — Trade records (buyer, seller, instrument, price, qty, status)
negotiations         — AI negotiation sessions with full transcript
settlements          — Settlement tracking per trade
users                — User accounts (when auth is implemented)
pricing_config       — Per-instrument pricing configurations
audit_log            — Immutable audit trail (append-only)

-- Market data
price_history        — Historical price data per instrument type
market_snapshots     — Periodic market state snapshots
feed_status          — Data feed health monitoring

-- Compliance
compliance_records   — Regulatory reporting and compliance tracking
scheme_targets       — ESS/PDRS/VEU scheme targets and penalty rates
surrender_tracking   — Per-client surrender progress
```

### 3.5 AI Engine

**Design principle:** The AI engine is invoked on-demand only. No background processes, no ambient token consumption. Every AI call has a defined purpose, a cost ceiling (max_tokens), and a timeout. All LLM responses are concise — the platform is a trading terminal, not a conversational assistant.

**AI Service Router:**

```
lib/ai/
├── ai-service-router.ts         — Routes AI requests to the correct capability
├── capabilities/
│   ├── negotiation.ts           — Agentic trade negotiation (~150 lines)
│   ├── market-intelligence.ts   — Market commentary and trend analysis (~100 lines)
│   ├── compliance-monitor.ts    — Anomaly detection, suspicious activity flagging (~100 lines)
│   ├── portfolio-advisory.ts    — Procurement optimisation recommendations (~100 lines)
│   ├── data-interpreter.ts      — Natural language data queries (~100 lines)
│   └── report-generator.ts      — AI-assisted compliance and market reports (~100 lines)
├── prompts/
│   ├── system-prompts.ts        — Per-capability system prompts with conciseness directive
│   └── context-templates.ts     — Instrument and market context injection templates
├── guards/
│   ├── cost-guard.ts            — Token budget enforcement per request
│   ├── timeout-guard.ts         — Request timeout management
│   └── rate-limiter.ts          — Per-user and per-session rate limiting
└── types.ts                     — AI service interfaces
```

**Conciseness directive (embedded in all system prompts):**

All AI capabilities include the following system prompt directive:

> "You are an AI service within an institutional trading platform. Respond with data-dense, concise output. No filler, no preamble, no conversational padding. State facts, figures, and recommendations directly. Use short sentences. Omit pleasantries. Format for rapid scanning — traders read in seconds, not minutes. If a number answers the question, give the number."

**AI capability invocation matrix:**

| Capability | Trigger | Model | Max Tokens | Timeout | Fallback on Failure |
|---|---|---|---|---|---|
| Negotiation | User starts AI trade session | Claude Opus 4 | 1024 per turn | 30s | "AI negotiation unavailable. Manual order entry available." |
| Market intelligence | User requests market view / scheduled daily | Claude Sonnet 4 | 512 | 15s | Display cached last commentary with "Updated [timestamp]" |
| Compliance monitor | Trade completes / daily batch | Claude Sonnet 4 | 256 | 10s | Flag for manual review |
| Portfolio advisory | User requests recommendation | Claude Opus 4 | 512 | 20s | "Advisory service temporarily unavailable." |
| Data interpreter | User queries data in natural language | Claude Sonnet 4 | 512 | 15s | Redirect to structured filters |
| Report generator | User generates report | Claude Sonnet 4 | 2048 | 45s | Generate report without AI summary section |

**Model selection rationale:** Opus 4 for capabilities requiring multi-step reasoning and strategic judgement (negotiation, advisory). Sonnet 4 for capabilities that are primarily summarisation, pattern recognition, or templated generation (intelligence, compliance, interpretation, reporting). This optimises for quality where it matters without over-spending on routine tasks.

### 3.6 Resilience & Graceful Failure

**Design principle:** Every external dependency has a defined failure mode. No single API failure renders the platform unusable. The platform always remains navigable and informative, even when degraded.

**Circuit Breaker Pattern:**

Each external dependency is wrapped in a circuit breaker with three states:

| State | Behaviour | Transition |
|---|---|---|
| Closed | Normal operation, requests pass through | Opens after N consecutive failures (configurable, default: 3) |
| Open | All requests immediately return fallback response, no external calls | Half-opens after timeout period (configurable, default: 60s) |
| Half-Open | Allows a single test request through | Closes on success, re-opens on failure |

**Per-dependency failure modes:**

| Dependency | Failure Mode | User Experience | Recovery |
|---|---|---|---|
| **Claude API** | Negotiation unavailable | Banner: "AI negotiation temporarily unavailable." Manual order entry remains functional. Market data, blotter, compliance all unaffected. | Circuit breaker auto-retries after 60s |
| **Price feed scrapers** | Stale pricing | Prices display with amber "Last updated: [timestamp]" label instead of green "Live" label. All trading continues with last-known prices. | Background retry every 5 minutes |
| **Vercel Postgres** | Data persistence unavailable | Critical alert to admin. Platform continues in read-only mode for cached data. New trades queued in-memory for write-back on recovery. | Connection pool retry with exponential backoff |
| **CER CorTenX API** | Registry unavailable | Settlement status shows "Registry connection pending." Trade execution continues; settlement queued for processing when connection restores. | Retry with backoff; manual fallback process documented |
| **TESSA (manual process)** | No automated impact | Settlement instructions generated offline. Manual transfer process unaffected. | N/A (already manual) |

**UI degradation indicators:**

```typescript
interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  lastSuccessful: string;          // ISO 8601 timestamp
  fallbackActive: boolean;
  userMessage?: string;            // Displayed in status bar
}
```

The Bloomberg Terminal status bar (bottom of screen) displays service health as colour-coded indicators: green (healthy), amber (degraded/stale), red (unavailable). Users can click any indicator for detail.

**Error boundary strategy:**

React Error Boundaries wrap each major panel independently. If the order book component crashes, the trade blotter and market ticker continue operating. The failed panel displays a contained error state with a retry button, not a full-page crash.

```
BloombergShell
├── ErrorBoundary → MarketTickerPanel
├── ErrorBoundary → TradingPanel
│   ├── ErrorBoundary → OrderBook
│   ├── ErrorBoundary → NegotiationChat
│   └── ErrorBoundary → TradeEntry
├── ErrorBoundary → PositionPanel
│   ├── ErrorBoundary → TradeBlotter
│   └── ErrorBoundary → SettlementTracker
└── ErrorBoundary → CompliancePanel
```

---

## 4. Phased Implementation Plan

### 4.1 Phase Overview

| Phase | Name | Duration | Objective | Gate Criteria |
|---|---|---|---|---|
| P0 | Stabilise & Persist | 5–7 days | Fix blockers, add database, deduplicate API routes | Clean build, zero TS errors, Postgres operational, tests passing |
| P1 | Multi-Instrument Trading | 7–10 days | Per-instrument pricing, ESC trading interface, order book simulation | ESC trade executable end-to-end (with simulated settlement) |
| P2 | Live Data & Settlement | 5–7 days | Connect price feeds, implement settlement adapters, audit trail | Live ESC prices displayed, settlement state machine operational |
| P3 | Scenarios & Demo | 5–7 days | Implement all five user scenarios (WP4), demo mode data seeding | All scenarios executable, investor demo rehearsed |
| P4 | Compliance & Polish | 3–5 days | Compliance dashboards, reporting, white-label theming, performance | Compliance dashboard operational, platform investor-ready |

**Total estimated duration:** 25–36 days (5–7 weeks)

### 4.2 Phase P0 — Stabilise & Persist

**Objective:** Eliminate all blocking issues identified in WP3, establish persistence, and create a clean baseline for development.

| Task | Description | Effort | Dependency |
|---|---|---|---|
| P0.1 | Fix 32 TypeScript compilation errors (property mappings, icon imports) | 1 day | None |
| P0.2 | Delete duplicate API route (`app/api/trade/route.ts`), redirect `/api/trade` to unified endpoint | 0.5 day | None |
| P0.3 | Decompose API route monolith into modular services per §3.2 architecture | 3–4 days | P0.2 |
| P0.4 | Add Vercel Postgres — CC attempts `vercel postgres create` via CLI; if permissions fail, Jeff runs the single command per M2. CC then handles schema creation, connection pooling, and migration scripts. | 2 days | Vercel CLI authenticated (confirmed by existing .vercel/project.json) |
| P0.5 | Fix 15 failing tests, update test fixtures for new module structure | 1 day | P0.3 |
| P0.6 | Resolve demo mode type conflicts (standardise interfaces) | 1 day | P0.3 |
| P0.7 | Git baseline — tag `v0.2.0-baseline`, document current state | 0.5 day | All P0 tasks |

**Gate criteria:** `npm run build` succeeds with zero errors. `npx tsc --noEmit` passes. All tests pass. Vercel Postgres connected and schema deployed. Git tagged.

### 4.3 Phase P1 — Multi-Instrument Trading

**Objective:** Transform the single-instrument negotiation interface into a multi-instrument trading platform with ESC as the primary product.

| Task | Description | Effort | Dependency |
|---|---|---|---|
| P1.1 | Implement `Instrument` base interface and type-specific schemas (WP5 §2–3) | 2 days | P0 |
| P1.2 | Build per-instrument pricing engine (WP5 §5), replacing generic config | 2 days | P1.1 |
| P1.3 | Implement instrument switcher in Bloomberg UI | 1 day | P1.1 |
| P1.4 | Add 4 ESC-specific personas (WP4 §8) to persona system | 1 day | P0.3 |
| P1.5 | Build instrument-aware context builder for AI negotiation | 2 days | P1.1, P1.2, P1.4 |
| P1.6 | Implement simulated order book with bid/ask depth visualisation | 2 days | P1.1 |
| P1.7 | Implement persistent trade blotter (Vercel Postgres read/write) | 1 day | P0.4 |
| P1.8 | End-to-end ESC trade test — market view → negotiation → confirmation → blotter entry | 1 day | All P1 tasks |

**Gate criteria:** ESC trade executable end-to-end with instrument-specific pricing, AI negotiation with ESC market context, trade persisted to database, visible in blotter.

### 4.4 Phase P2 — Live Data & Settlement

**Objective:** Connect to real market data and implement the settlement adapter framework.

| Task | Description | Effort | Dependency |
|---|---|---|---|
| P2.1 | Implement Ecovantage/Northmore Gordon price scrapers | 2 days | P1 |
| P2.2 | Build price cache in Vercel Postgres with feed health monitoring | 1 day | P2.1 |
| P2.3 | Connect existing data feed modules (85K lines) to live/cached sources | 2 days | P2.1, P2.2 |
| P2.4 | Implement settlement adapter interfaces and orchestrator (WP5 §7) | 1 day | P1 |
| P2.5 | Build TESSA settlement adapter (simulated with manual confirmation step) | 1 day | P2.4 |
| P2.6 | Build CER CorTenX settlement adapter (simulated with API stub) | 1 day | P2.4 |
| P2.7 | Build blockchain settlement adapter (simulated with tx hash generation) | 1 day | P2.4 |
| P2.8 | Implement audit trail logger (append-only Postgres table) | 1 day | P0.4 |

**Gate criteria:** Live ESC/VEEC prices displayed in ticker and charts (with "Live" label). Settlement state machine operational for all instrument types. Audit trail recording all platform actions.

### 4.5 Phase P3 — Scenarios & Demo

**Objective:** Implement all five user scenarios from WP4, build demo mode data seeding, and rehearse the investor demonstration.

| Task | Description | Effort | Dependency |
|---|---|---|---|
| P3.1 | Scenario A — Investor demo flow (7 steps per WP4 §2) | 3 days | P2 |
| P3.2 | Scenario B — ESC broker white-label (5 steps per WP4 §3) | 2 days | P2 |
| P3.3 | Scenario C — Institutional carbon buyer negotiation (3 steps per WP4 §4) | 1 day | P2 |
| P3.4 | Scenario D — Compliance officer dashboards (3 steps per WP4 §5) | 2 days | P2 |
| P3.5 | Scenario E — Bulk ESC purchase with multi-counterparty AI (4 steps per WP4 §6) | 2 days | P2 |
| P3.6 | Demo mode data seeding (WP4 §9.2) — 30 days ESC history, 5 counterparties, sample trades | 1 day | P3.1–P3.5 |
| P3.7 | Investor demo rehearsal and orchestration script (WP4 §9.3) | 1 day | P3.6 |

**Gate criteria:** All five scenarios executable. Demo mode activatable via configuration. Investor demonstration rehearsed and timed (target: 25 minutes).

### 4.6 Phase P4 — Compliance & Polish

**Objective:** Production-grade compliance, reporting, performance optimisation, and final polish.

| Task | Description | Effort | Dependency |
|---|---|---|---|
| P4.1 | Compliance dashboard with live ESS data (targets, penalty rates, surrender deadlines) | 2 days | P3 |
| P4.2 | Report generation — PDF/CSV for trade reports, compliance summaries, audit exports | 1 day | P3 |
| P4.3 | AI disclosure integration — disclosure text on all trade confirmations and audit records | 0.5 day | P2.8 |
| P4.4 | White-label theming system (CSS variable overrides, logo upload, branding config) | 1 day | P3.2 |
| P4.5 | Performance testing — page load times, API response times, concurrent session testing | 1 day | P3 |
| P4.6 | Zoniqx API contract stubs (WP5 §7.1) | 0.5 day | P2.4 |
| P4.7 | CorTenX API contract stubs (WP5 §7.1) | 0.5 day | P2.4 |
| P4.8 | Final regression test suite execution and documentation | 1 day | All |
| P4.9 | Document set finalisation — version all WP documents, update cross-references | 0.5 day | All |

**Gate criteria:** Compliance dashboard operational with real ESS data. Reports exportable. Performance within targets (< 2s page load, < 500ms API response). All regression tests passing. Document set versioned and complete.

### 4.7 Manual Dependencies — Rationalised

The development plan has been designed to minimise manual intervention. The following is the exhaustive list of tasks that require Jeff's direct action. Everything else is automated or self-validating.

**One-Time Setup (before P0 begins, ~15 minutes total):**

| # | Task | Time | Notes |
|---|---|---|---|
| M1 | **CC permissions configuration.** Create `.claude/settings.json` in the project root with pre-approved operations (see §6.3), OR run CC sessions with `--dangerously-skip-permissions`. This eliminates per-operation approval prompts for file creation, npm commands, git, and build operations. | 2 min | One-time. All subsequent CC sessions run without manual approval. |
| M2 | **Vercel Postgres provisioning.** Run `vercel postgres create wrei-trading-db` from the project directory (requires Vercel CLI authenticated, which the existing `.vercel/project.json` confirms). Alternatively, CC can attempt this if M1 permissions include network access. | 3 min | One-time. CC handles schema creation and migration from here. |
| M3 | **Verify ANTHROPIC_API_KEY.** Confirm the existing key in `.env.local` is active and has sufficient quota for Opus 4 usage during development and production. | 2 min | Already exists per WP3. Just verify it works. |

**During Development (consolidated reviews, not per-step approvals):**

| # | Task | Time | Notes |
|---|---|---|---|
| M4 | **Phase gate review.** At each of the four phase gates (P0→P1→P2→P3→P4), review the automated gate report that CC produces. The report contains build status, test results, regression pass/fail, and a summary of changes. Jeff reviews and either proceeds or flags issues. This replaces per-task approval with a consolidated checkpoint. | 15 min × 4 = 1 hr total | CC self-validates against gate criteria. Jeff reviews the report, not each file. |
| M5 | **Investor demo rehearsal.** Walk through Scenario A end-to-end on the live platform. | 30 min | Cannot be delegated. Scheduled after P3 gate. |

**Total manual time across the entire programme: approximately 1.5 hours.**

**What is NOT required from Jeff:**

- ESS scheme data (penalty rates, targets, surrender deadlines) — hardcoded from public IPART sources. The 2026 ESC penalty rate is $29.48 per certificate shortfall. Annual targets are published in the ESS legislation. CC embeds these directly.
- Demo data approval — auto-generated from actual market parameters (ESC ~$22.50–$24.00, VEEC ~$81–$84, ACCU method-specific, LGC ~$3–$6). No review step.
- Price feed configuration — scraper targets (Ecovantage, Northmore Gordon) are public websites. No credentials required. Simulation fills all gaps automatically.
- Git operations — CC handles all branching, committing, tagging, and merging per the branch strategy.
- Test execution — automated at every session end and every gate.

**Simulation extensions for incomplete external tasks:**

All commercial engagements (§8) are non-blocking. The simulation layer provides complete coverage:

| External Task | If Not Complete | Simulation Coverage |
|---|---|---|
| CER CorTenX API access | ACCU settlement simulated | Full lifecycle simulation with realistic tx hashes and timing |
| CORE Markets subscription | Prices scraped from free sources | Ecovantage/Northmore Gordon scraping + historical simulation |
| TESSA API access (doesn't exist) | ESC settlement simulated | Manual workflow simulation with step-by-step status tracking |
| AFSL scoping (legal) | Platform operates in demo/white-label mode | Compliance dashboard shows pathway, not live AFSL status |
| Zoniqx partnership | Token settlement simulated | Full on-chain simulation with generated hashes |
| Trovio partnership | Registry integration simulated | CorTenX API stub responds with realistic data |

The platform is fully functional and demonstrable with zero external integrations complete. Each integration is additive — it replaces a simulation with a live connection, but the platform's behaviour and UI are identical in both modes.

---

## 5. Test & Regression Strategy

### 5.1 Test Layers

| Layer | Tool | Scope | Trigger |
|---|---|---|---|
| Unit tests | Jest | Individual functions, utilities, type validations | Every CC session, pre-commit |
| Component tests | Jest + Testing Library | React component rendering, user interactions | Every CC session |
| Integration tests | Jest | API routes, database operations, feed adapters | Per phase gate |
| E2E scenario tests | Playwright | Full user scenario workflows (WP4 scenarios A–E) | Per phase gate and pre-deployment |
| Performance tests | Playwright + custom | Page load, API response time, concurrent sessions | Phase P4 and pre-deployment |

### 5.2 Regression Test Specification

Each phase gate requires a full regression pass. The regression suite is defined by the user scenarios:

| Test ID | Scenario | Description | Pass Criteria |
|---|---|---|---|
| REG-A1 | Investor Demo | Landing dashboard loads with live/simulated market data | All prices displayed, ticker scrolling, metrics populated |
| REG-A2 | Investor Demo | ESC trade via AI negotiation completes successfully | Negotiation converges, trade confirms, appears in blotter |
| REG-A3 | Investor Demo | Carbon credit token detail displays full metadata | Provenance chain, verification standards, pricing all visible |
| REG-B1 | ESC Broker | White-label theming applies correctly | Custom branding visible, no Bloomberg defaults leaking |
| REG-B2 | ESC Broker | Broker-facilitated trade with AI negotiation | Broker sets constraints, AI negotiates within them, trade confirms |
| REG-C1 | Carbon Buyer | Agentic negotiation for WREI-CC with strategy panel | AI reasoning visible, defence layer indicators active |
| REG-D1 | Compliance | Audit trail records all platform actions | Every action timestamped, filterable, exportable |
| REG-D2 | Compliance | ESS compliance view shows correct targets and penalty rates | Data matches IPART published figures |
| REG-E1 | Bulk ESC | Multi-counterparty AI negotiation executes 500K ESC order | Volume filled across counterparties, VWAP calculated, execution report generated |
| REG-F1 | Cross-cutting | All instrument types selectable and tradeable | Instrument switcher works, pricing configs load per type |
| REG-F2 | Cross-cutting | Build passes with zero TypeScript errors | `npx tsc --noEmit` returns 0 |
| REG-F3 | Cross-cutting | All existing tests pass | `npm test` returns 0 failures |
| REG-F4 | Cross-cutting | Settlement state machine transitions correctly for each instrument | Each adapter handles all lifecycle states |

### 5.3 CC Session Test Protocol

Every Claude Code session must end with the following verification:

```bash
# Mandatory post-session checks
npm run build                    # Must succeed with zero errors
npx tsc --noEmit                 # Must succeed with zero errors  
npm test -- --passWithNoTests    # Must report zero failures
```

If any check fails, the CC session must fix the issues before committing. No session ends with a broken build.

---

## 6. CC Context Management

### 6.1 Session Preamble Template

Every CC session begins with this context preamble (adapted per phase):

```
You are working on the WREI Trading Platform. Before writing any code:

1. Read CLAUDE.md for project context
2. Read the current phase specification (provided below)
3. Run `find . -type f -name "*.ts" -o -name "*.tsx" | head -100` to orient
4. Read the specific files you will modify (first 100 lines each)
5. Check the current build state: `npm run build 2>&1 | tail -20`

Cite file paths for every change. Do not read files over 500 lines in full — use targeted line ranges.

Current phase: [PHASE ID]
Phase objective: [OBJECTIVE]
Files in scope: [LIST]
Files out of scope: [LIST]
```

### 6.2 Cross-Session Memory

Each CC session must update `TASK_LOG.md` in the project root with the following for every change:

```markdown
## Session [DATE] [TIME] — Phase [ID]

### Changes Made
- [file path]: [description of change]

### Build Status
- Build: PASS/FAIL
- TypeScript: PASS/FAIL ([N] errors)
- Tests: [X]/[Y] passing

### Known Issues
- [any issues to carry forward]

### Next Session Should
- [specific next steps]
```

### 6.3 CC Permissions Configuration

To eliminate per-operation approval prompts, create `.claude/settings.json` in the project root before the first CC session:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run build)",
      "Bash(npm test*)",
      "Bash(npx tsc*)",
      "Bash(find *)",
      "Bash(grep *)",
      "Bash(wc *)",
      "Bash(cat *)",
      "Bash(head *)",
      "Bash(tail *)",
      "Bash(ls *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(rm *)",
      "Bash(git *)",
      "Bash(node *)",
      "Bash(npx *)",
      "Bash(vercel *)"
    ]
  }
}
```

Alternatively, run all CC sessions with `claude --dangerously-skip-permissions` to bypass approval entirely. Given that the project is a development environment under Jeff's direct control and all sessions operate within defined phase scopes, this is the pragmatic choice for development velocity.

### 6.4 Automated Phase Gate Reports

At the end of each phase, the final CC session produces a gate report in `GATE_REPORT_PX.md` (where X is the phase number). The report is generated automatically — Jeff reviews it, not individual changes.

**Gate report template:**

```markdown
# Phase [X] Gate Report

## Build Health
- Build: PASS/FAIL
- TypeScript errors: [N]
- Test results: [X]/[Y] passing
- Type suppressions: [N] (target: decreasing)

## Changes Summary
- Files created: [N]
- Files modified: [N]
- Files deleted: [N]
- Total lines added: [N]
- Total lines removed: [N]

## Phase Objectives — Pass/Fail
- [ ] [Objective 1]: PASS/FAIL
- [ ] [Objective 2]: PASS/FAIL
- [ ] [Objective N]: PASS/FAIL

## Regression Results
- [REG-XX]: PASS/FAIL
- [REG-XX]: PASS/FAIL

## Blockers for Next Phase
- [Any issues that must be resolved]

## Recommendation
PROCEED / HOLD — [rationale]
```

Jeff's review is a single read of this document per phase. If all objectives pass and the recommendation is PROCEED, development continues to the next phase without further approval.

---

## 7. Deployment Strategy

### 7.1 Branch Strategy

```
main                             — Production (wrei.cbslab.app)
├── develop                      — Integration branch
│   ├── feature/p0-stabilise     — Phase P0 work
│   ├── feature/p1-multi-instrument — Phase P1 work
│   ├── feature/p2-live-data     — Phase P2 work
│   ├── feature/p3-scenarios     — Phase P3 work
│   └── feature/p4-compliance    — Phase P4 work
```

Each phase merges to `develop` at its gate. `develop` merges to `main` when a phase is investor-demo-ready. Vercel preview deployments are automatic for all branches.

### 7.2 Environment Configuration

| Environment | URL | Database | Data Feeds | Purpose |
|---|---|---|---|---|
| Production | wrei.cbslab.app | Vercel Postgres (prod) | Live + simulation fallback | Investor demos, broker evaluations |
| Preview | [branch].wrei.cbslab.app | Vercel Postgres (preview) | Simulation only | Development and testing |

---

## 8. Commercial Engagement Timeline (Parallel — Non-Blocking)

The following commercial engagements are strategically valuable but **none are development dependencies**. The simulation layer (§4.7) provides complete platform functionality regardless of engagement status. These engagements improve the platform's production readiness and commercial positioning but do not gate any implementation phase.

| Engagement | Contact | Timeline | Benefit | Impact If Delayed |
|---|---|---|---|---|
| CER Interoperability Programme | Clean Energy Regulator | Immediate — register interest | First-mover positioning for ACCU trading platform connectivity | None — CER adapter operates in simulation mode |
| Trovio/CorTenX | Trovio Operating Pty Ltd, 25 Bligh St Sydney | Within 2 weeks | Registry sub-registry capability, potential infrastructure partnership | None — CorTenX stub provides simulated responses |
| CORE Markets | CORE Markets, Melbourne | Within 2 weeks | Professional-grade market data replacing web scraping | None — Ecovantage/Northmore scraping + simulation covers gap |
| AFSL Scoping | Gilbert + Tobin or King & Wood Mallesons | Within 4 weeks | Legal clarity on platform operating model | None — platform operates in demo/white-label mode pending AFSL |
| IPART/TESSA | IPART Scheme Administrator | Within 4 weeks | TESSA data access or partnership for ESC registry integration | None — TESSA adapter operates in manual/simulated mode |
| Zoniqx | Zoniqx, Silicon Valley | When tokenisation phase approaches | Tokenisation infrastructure partnership | None — blockchain adapter provides full simulation |

---

## 9. Success Criteria

The platform is investor-demonstration-ready when all of the following are met:

1. All five user scenarios (WP4) are executable end-to-end.
2. Live ESC/VEEC/ACCU/LGC prices are displayed (with fallback to simulation where feeds are unavailable).
3. AI negotiation completes an ESC trade with instrument-specific market context and pricing.
4. Trade blotter persists across sessions with settlement status tracking.
5. Compliance dashboard shows real ESS targets and penalty rates.
6. Audit trail records all platform actions.
7. Demo mode is activatable for rehearsed investor presentations.
8. Build passes with zero TypeScript errors and all tests passing.
9. Document set (WP1–WP7) is versioned and accessible.
10. Investor demo rehearsed and timed at ≤ 25 minutes.
11. All external dependencies fail gracefully — platform remains navigable with degraded indicators when any single service is unavailable.
12. No AI process runs unless explicitly invoked by a user action or defined system event.

---

## 10. Future Roadmap

The following capabilities are out of scope for the current implementation (P0–P4) but the architecture must not preclude them. Each item notes the architectural provision that supports it.

### 10.1 Near-Term (Post-Series A, 6–12 Months)

| Capability | Description | Architectural Provision |
|---|---|---|
| **Mobile monitoring UI** | Responsive mobile interface for position monitoring, price alerts, and trade notifications (not full execution) | Bloomberg Terminal breakpoints already support 1920px/2560px; add mobile breakpoints (375px/768px). Component architecture already panel-based — panels can be individually rendered for mobile. |
| **CER CorTenX live integration** | Production API connection to the CER Unit & Certificate Registry for ACCU trading | SettlementAdapter interface and CER adapter stub already defined. Replace stub with live implementation when API specifications are published. |
| **User authentication & authorisation** | Full user management with role-based access (trader, compliance, admin, broker) | Persistence layer includes `users` table. Auth middleware insertion point defined in API layer. No business logic depends on anonymous access. |
| **AFSL-compliant operations** | Licensed trading operations once AFSL is secured | Compliance engine architecture embeds AFSL rules as configurable rulesets. Audit trail and reporting already operational. |
| **CORE Markets data subscription** | Professional-grade market data feed replacing web scraping | DataFeedAdapter interface supports subscription-based feeds. Price cache already handles multiple data tiers. |

### 10.2 Medium-Term (12–24 Months)

| Capability | Description | Architectural Provision |
|---|---|---|
| **Agent-to-agent autonomous trading** | AI buyer agents negotiate directly with AI seller agents without human intervention | Negotiation engine already supports AI-on-both-sides. Add autonomous session mode with human override controls and circuit breakers. |
| **Real-time WebSocket streaming** | Live push updates for market data, order book, and trade confirmations | Data feed layer includes `real-time-connector.ts` (26.6K lines of existing WebSocket architecture). Upgrade from polling to push. |
| **Exchange integration (Xpansiv/CBL)** | Direct connectivity to CBL for ACCU exchange trading | SettlementAdapter pattern supports exchange settlement. Add CBL-specific adapter alongside bilateral adapters. |
| **Multi-tenancy for white-label** | Full tenant isolation for multiple broker white-label deployments | White-label theming (P4) is the UI layer. Multi-tenancy requires database tenant isolation (row-level security in Postgres) and per-tenant configuration. Schema supports this with tenant_id foreign keys. |
| **Advanced analytics (ML-based)** | Price prediction, volume forecasting, optimal execution timing | AI Service Router supports additional capabilities. Add ML model endpoints alongside LLM capabilities. Price history cache provides training data. |

### 10.3 Long-Term (24+ Months)

| Capability | Description | Architectural Provision |
|---|---|---|
| **Live tokenisation** | Minting and managing real tokens on blockchain (Zoniqx, CorTenX, or built-in-house) | Blockchain settlement adapter and Zoniqx/CorTenX stubs provide the integration interface. Token metadata schemas (WP5) are chain-agnostic. |
| **Cross-collateralisation (DeFi)** | Asset co tokens as collateral for carbon token exposure | Dual token architecture (WP5 §6) already defines the product interaction. DeFi integration requires smart contract development — architecture supports this through the blockchain adapter layer. |
| **Third-party WREI verification** | Extending WREI verification to non-Water-Roads carbon projects | WREI verification engine is separated from Water Roads operational data by the measurement/verification layer boundary. Third-party projects connect at the measurement layer. |
| **Multi-language / global expansion** | Internationalisation for non-English markets as Water Roads expands globally | UI components use string constants (not hardcoded text). Add i18n library (next-intl or equivalent) and locale-specific content. |
| **Public API for developers** | REST/GraphQL API for external developers to build on the WREI platform | API layer (Next.js API routes) already provides HTTP endpoints. Add API key management, rate limiting, and developer documentation layer. |
| **Regulatory reporting automation** | Automated submission to ASIC, AUSTRAC, IPART, CER | Compliance engine and reporting module provide the data. Add submission adapters per regulatory body. |

---

## 11. Claude Code Model Guidance

### 11.1 Model Selection by Task

The platform development is not price-sensitive. Use the best model for each task category.

| Task Category | Model | Rationale |
|---|---|---|
| **Architecture and decomposition** (P0.3, P1.1, P1.2) | Claude Opus 4 | Complex multi-file refactoring requiring understanding of system-wide dependencies. Opus maintains coherence across large structural changes. |
| **AI negotiation engine** (P1.4, P1.5) | Claude Opus 4 | System prompt design and negotiation strategy require nuanced reasoning. The negotiation engine is the platform's primary differentiator — it must be Opus quality. |
| **New feature implementation** (P1.6, P2.1–P2.7, P3.1–P3.5) | Claude Opus 4 | New features require understanding the existing architecture, the WP specifications, and the design system simultaneously. Opus handles this multi-context reasoning better. |
| **Bug fixes and type corrections** (P0.1, P0.5, P0.6) | Claude Sonnet 4 | Mechanical fixes with clear error messages. Sonnet is sufficient and faster. |
| **Test writing and fixture updates** (P0.5, P4.8) | Claude Sonnet 4 | Test patterns are well-established. Sonnet follows existing test conventions reliably. |
| **Documentation and comments** (P0.7, P4.9) | Claude Sonnet 4 | Prose generation from specifications. Sonnet is sufficient. |

### 11.2 Invocation

```bash
# For Opus tasks (architecture, features, negotiation engine)
claude --model opus

# For Sonnet tasks (fixes, tests, documentation)
claude --model sonnet
```

### 11.3 Production AI Engine

The deployed platform uses the model assignments defined in §3.5 AI capability invocation matrix. In summary: Opus 4 for negotiation and advisory (reasoning-intensive), Sonnet 4 for intelligence, compliance, interpretation, and reporting (summarisation-intensive).

---

*This document governs the WREI Trading Platform development programme. All Claude Code work must reference the relevant phase specification and comply with the test protocol defined in §5.3 and context management protocol defined in §6.*
