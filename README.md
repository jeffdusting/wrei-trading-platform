# WREI Trading Platform

A Next.js 14 application demonstrating the WREI institutional-grade carbon credit trading platform. Features a Bloomberg Terminal-style interface with AI-powered negotiation (Claude API), multi-instrument support for 8 tradeable products, live price feeds, and full settlement lifecycle management.

**Version:** 1.0.0 (Investor-Ready) | **Date:** 4 April 2026

## Platform Capabilities

### Trading Engine
- **8 Tradeable Instruments**: ESC, VEEC, PRC, ACCU, LGC, STC, WREI-CC, WREI-ACO
- **AI-Powered Negotiation**: Claude Opus 4.6 agentic negotiation with defence layers
- **15 Buyer Personas**: 5 original + 4 ESC-specific + 6 advanced scenario personas
- **Per-Instrument Pricing**: Spot-based, penalty-anchored, and NAV-based pricing engines
- **Order Book Simulation**: Realistic bid/ask depth panels for all instruments
- **Trade Blotter**: Bloomberg-style data grid with filtering, sorting, CSV export

### Market Data
- **Live Price Feeds**: Ecovantage and Northmore Gordon scrapers with circuit breaker
- **Three-Tier Fallback**: Live → Cached → Simulated with UI health indicators
- **Price Cache**: In-memory + Vercel Postgres persistence

### Settlement
- **4 Operational Adapters**: TESSA (ESC/PRC), CER (ACCU), VEEC Registry, Blockchain (WREI tokens)
- **2 API Contract Stubs**: Zoniqx zConnect (T+0 atomic), Trovio CorTenX (CER registry)
- **Settlement Orchestrator**: Circuit breaker pattern, state machine lifecycle

### Compliance & Audit
- **Regulatory Dashboard**: ASIC, AUSTRAC, IPART, CER status tracking
- **ESS Compliance**: Penalty rates (A$29.48, IPART 2026), surrender positions, deadline monitoring
- **Audit Trail**: 13 action types, append-only, AI-assisted trade flagging (WP5 §8.2)
- **Report Generation**: Trade CSV, compliance summary HTML, audit trail CSV
- **AI Disclosure**: WP5 §8.2 disclosure on all trade confirmations and audit records

### User Scenarios (WP4)
- **A: Investor Demo** — 7-step demonstration flow with all instruments
- **B: ESC Broker** — White-label theming with Demand Manager sample brand
- **C: Institutional Carbon Buyer** — WREI-CC market view with provenance certificates
- **D: Compliance Officer** — Regulatory grid, ESS positions, audit trail viewer
- **E: Bulk ESC Purchase** — Multi-counterparty negotiation with VWAP execution report

### Bloomberg Terminal Interface
- 40px system status bar with real-time clock and feed health indicator
- Scrolling market ticker with all 8 instruments
- 48px navigation with terminal-style tabs (DSH, TRD, ANA, INS, CMP, SYS)
- 36px command bar footer with `wrei@platform:~$` prompt
- White-label CSS variable overrides for broker deployments

## Technology Stack

- **Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI Engine**: Anthropic Claude API — Sonnet 4 (dev), Opus 4.6 (production)
- **State**: React useState/useReducer + Zustand for demo mode
- **Database**: Vercel Postgres (optional — graceful degradation without it)
- **Testing**: Jest + React Testing Library (80 suites, 1888 tests)
- **Deployment**: Vercel (free hobby plan)

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.local.example .env.local
# Add ANTHROPIC_API_KEY to .env.local

# Run
npm run dev
# Open http://localhost:3000
```

### Build & Test

```bash
npm run build          # Production build
npx tsc --noEmit       # Type check (0 errors)
npm test               # Run test suite (1888 pass, 0 fail)
```

## Architecture

```
app/
  page.tsx                          — Landing dashboard (8-instrument ticker, metrics)
  trade/page.tsx                    — Trading interface (instrument switcher, negotiation, blotter)
  analyse/page.tsx                  — Market overview, AI commentary, carbon credit browser
  compliance/page.tsx               — Regulatory dashboard with ESS compliance
  api/negotiate/route.ts            — AI negotiation engine (Claude API)
  api/trades/route.ts               — Trade CRUD
  api/prices/route.ts               — Live price feed endpoint
  api/market-commentary/route.ts    — AI market commentary

lib/
  trading/instruments/              — 8 instrument types, pricing configs, registry
  trading/settlement/               — 4 adapters + 2 API stubs + orchestrator
  trading/compliance/               — Audit logger + report generator
  trading/orderbook/                — Simulated order book engine
  trading/personas/                 — ESC-specific personas
  trading/negotiation/              — Instrument-aware context builder
  negotiate/                        — Decomposed API route modules (6 files)
  data-feeds/                       — Scraper adapters, cache, feed manager
  config/white-label.ts             — Broker theming configuration
  db/                               — Vercel Postgres schema, queries, migration

components/
  trading/                          — InstrumentSwitcher, OrderBook, Blotter, TokenDetail, Provenance
  compliance/                       — AuditTrailViewer
  branding/                         — WhiteLabelProvider
  navigation/BloombergShell.tsx     — Bloomberg Terminal shell wrapper
```

## Document Set

| Ref | Title | Version |
|-----|-------|---------|
| WR-WREI-WP1 | ESC Market & Data Source Audit | v1.0 Final |
| WR-WREI-WP2 | Competitive Platform Benchmarking | v1.0 Final |
| WR-WREI-WP3 | Codebase Architecture Assessment | Final |
| WR-WREI-WP4 | User Scenarios | v1.0 Final |
| WR-WREI-WP5 | Token & Instrument Specification | v1.0 Final |
| WR-WREI-WP6 | Target Architecture | v2.0 Final |
| WR-WREI-WP7 | CC Prompt Package | Final |

## Security

- API key server-side only (never exposed to client)
- Price floors enforced in application code, not delegated to LLM
- Max 5% concession per round, 20% total — enforced programmatically
- Input sanitisation and output validation on all Claude API calls
- AI disclosure on all AI-assisted trade confirmations (WP5 §8.2)

## Infrastructure (Production Roadmap)

Zoniqx integration references are for agent knowledge only — no live API connections in demo.

- **Settlement**: Zoniqx zConnect (T+0 atomic, cross-chain)
- **Token Standard**: Zoniqx zProtocol (DyCIST/ERC-7518, CertiK-audited)
- **Compliance**: Zoniqx zCompliance (AI-powered, 20+ jurisdictions)
- **Registry**: Trovio CorTenX (CER registry programmatic access)

---

**Water Roads Engineering** | WREI Verified Carbon Credit Trading Platform | v1.0.0
