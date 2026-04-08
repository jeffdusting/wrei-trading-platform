# WREI Shared Module Map — Downer Enterprise Build

**Date:** 2026-04-09
**Phase:** D0 (Discovery)
**Author:** Claude Code (Opus 4.6)

---

## Shared Library Modules (lib/)

| File | Exports | Dependencies (lib/) | External Packages | Enterprise Use | Issues |
|------|---------|-------------------|-------------------|---------------|--------|
| `lib/data-feeds/feed-manager.ts` | `refreshAllPrices()`, `getPrice()`, `getPriceHistory()`, `getHealthStatus()`, `getAllPrices()` | `lib/trading/instruments/types`, `./adapters/*`, `./cache/price-cache` | None | Current spot prices for Yield Estimator | Clean |
| `lib/data-feeds/adapters/ecovantage-scraper.ts` | `scrapeEcovantage()`, `SOURCE_NAME`, `SOURCE_URL` | `lib/trading/instruments/types`, `./types` | None | Price data source | Clean |
| `lib/data-feeds/adapters/northmore-scraper.ts` | `scrapeNorthmoreGordon()`, `SOURCE_NAME`, `SOURCE_URL` | `lib/trading/instruments/types`, `./types` | None | Price data source | Clean |
| `lib/data-feeds/adapters/simulation-engine.ts` | `simulateCurrentPrice()`, `simulateAllPrices()`, `generatePriceHistory()`, `generateIntradayHistory()`, `getSimulationParams()`, `SOURCE_NAME`, `PARAMS` | `lib/trading/instruments/types`, `./types` | None | Demo/fallback pricing | Clean |
| `lib/data-feeds/adapters/types.ts` | `ScrapedPrice`, `ScrapeResult`, `PriceTier`, `ResolvedPrice`, `HistoricalPrice`, `FeedHealth` | `lib/trading/instruments/types` | None | Type definitions | Clean |
| `lib/data-feeds/cache/price-cache.ts` | `cachePrices()`, `getLatestPrice()`, `getCachedHistory()`, `recordFeedSuccess()`, `recordFeedFailure()`, `getFeedHealth()`, `getAllFeedHealth()`, `isLive()`, `isCached()`, `clearCache()` | `lib/trading/instruments/types`, `../adapters/types` | `@vercel/postgres` (lazy) | Price caching layer | WARN: lazy import of `@/lib/db/connection` in fire-and-forget DB persist |
| `lib/data-feeds/types.ts` | `DataFeedType`, `DataFeedStatus`, `UpdateFrequency`, `DataFeedSubscription`, `DataFeedUpdate`, `CarbonPricingData`, `RWAMarketData`, `IDataFeedConnector`, + 8 more | None | None | Type definitions | Clean |
| `lib/config/white-label.ts` | `WhiteLabelConfig`, `DEFAULT_BRANDING`, `DEMAND_MANAGER_BRANDING`, `NORTHMORE_GORDON_BRANDING`, `WHITE_LABEL_REGISTRY`, `getWhiteLabelConfig()` | None | None | Downer branding config | Clean — additive change needed to register Downer |
| `lib/db/connection.ts` | `sql`, `db`, `getPool()`, `checkConnection()` | None | `@vercel/postgres` | Database access | Clean — enterprise uses separate POSTGRES_URL |
| `lib/db/schema.ts` | `SCHEMA_VERSION` (=7), 25 CREATE_* constants, `ALL_TABLES` | None | None | Schema definitions | Clean — enterprise adds tables |
| `lib/db/migrate.ts` | `MigrationResult`, `runMigrations()`, `resetSchema()` | `./connection`, `./schema` | None | Migration runner | Clean |
| `lib/db/index.ts` | Barrel: `sql`, `db`, `getPool`, `checkConnection`, `runMigrations`, `resetSchema`, `tradeQueries`, `negotiationQueries`, `auditQueries`, `pricingQueries` | `./connection`, `./migrate`, `./schema`, `./queries/*` | None | Database barrel | Clean |
| `lib/db/queries/trades.ts` | `TradeRow`, `CreateTradeInput`, `createTrade()`, `getTradeById()`, `listTrades()`, `updateTradeStatus()` | `../connection` | None | Not used by enterprise | Broker-only |
| `lib/db/queries/negotiations.ts` | `NegotiationRow`, `CreateNegotiationInput`, `createNegotiation()`, `getNegotiationById()`, `updateNegotiationState()`, `listNegotiations()` | `../connection` | None | Not used by enterprise | Broker-only |
| `lib/db/queries/pricing.ts` | `PriceHistoryRow`, `PricingConfigRow`, `recordPrice()`, `getPriceHistory()`, `getActivePricingConfig()`, `upsertPricingConfig()` | `../connection` | None | Price history queries | Shareable |
| `lib/db/queries/audit-log.ts` | `AuditEntry`, `WriteAuditInput`, `writeAuditEntry()`, `getAuditTrail()`, `getRecentAuditEntries()` | `../connection` | None | Audit trail | Shareable |
| `lib/db/queries/clients.ts` | `ClientRow`, `CreateClientInput`, `UpdateClientInput`, `HoldingRow`, `CreateHoldingInput`, `SurrenderRow`, `createClient()`, `getClientsByOrganisation()`, `getClient()`, `updateClient()`, `getClientHoldings()`, `createHolding()`, `getClientSurrenderStatus()` | `../connection` | None | Client/entity queries | Broker-specific schema |
| `lib/db/queries/correspondence.ts` | `createCorrespondence()`, `getCorrespondenceByOrg()`, `getDraftedCorrespondence()`, `updateCorrespondenceStatus()` | `../connection`, `@/lib/correspondence/types` | None | Not used by enterprise | Broker-only |
| `lib/ai/types.ts` | `AICapability`, `AIRequest`, `AIResponse`, `AIGuardResult`, `MODEL_MAP`, `DEFAULT_MAX_TOKENS` | None | None | AI type definitions | Clean |
| `lib/ai/guards/timeout-guard.ts` | `DEFAULT_TIMEOUTS`, `getFallbackMessage()`, `withTimeout()` | `../types` | None | API timeout protection | Clean |
| `lib/ai/guards/cost-guard.ts` | `checkCostGuard()`, `recordTokenUsage()`, `getTokenUsage()` | `../types` | None | AI cost control | Clean |
| `lib/ai/guards/rate-limiter.ts` | `RATE_LIMITS`, `checkRateLimit()`, `recordCall()` | `../types` | None | Rate limiting | Clean |
| `lib/defence.ts` | `sanitiseInput()`, `validateOutput()`, `enforceConstraints()`, `classifyThreatLevel()` | `./types`, `./negotiation-config` | None | Input sanitisation | Negotiation-specific — enterprise may not need |

---

## Shared Components (components/)

| Component | Imports From | Broker Dependencies | Can Share Directly? | Issues |
|-----------|-------------|-------------------|-------------------|--------|
| `components/intelligence/ForecastPanel.tsx` | `@/design-system/tokens/professional-tokens` | None | YES with caveat | Hardcoded API path `/api/v1/intelligence/forecast?instrument=ESC` — enterprise must provide matching route |
| `components/intelligence/SupplyDemandPanel.tsx` | `@/design-system/tokens/professional-tokens` | None | YES with caveat | Hardcoded API path `/api/v1/intelligence/metrics?instrument=ESC` |
| `components/intelligence/AlertsFeed.tsx` | `@/design-system/tokens/professional-tokens` | None | YES with caveat | Hardcoded API path `/api/v1/intelligence/alerts` |
| `components/intelligence/ClientIntelligencePage.tsx` | `@/design-system/tokens/professional-tokens`, `@/lib/config/white-label` | None | YES | Uses WHITE_LABEL_REGISTRY — enterprise benefits from this (Downer config) |
| `components/charts/WREILineChart.tsx` | `recharts` | None | YES | Fully generic chart wrapper, zero app dependencies |
| `components/charts/WREIBarChart.tsx` | `recharts` | None | YES | Fully generic chart wrapper, zero app dependencies |
| `components/navigation/BloombergShell.tsx` | `@/design-system/tokens/professional-tokens`, `@/components/market/MarketTicker`, `@/components/demo/SimpleDemoToggle`, `@/components/demo/SimpleDemoProvider`, `@/components/market/FeedHealthIndicator`, `@/components/alerts/AlertBell`, `@/components/navigation/ServiceHealthBar`, `@/components/branding/WhiteLabelProvider` | Hardcoded nav paths: `/`, `/trade`, `/clients`, `/correspondence`, `/analyse`, `/institutional/portal`, `/intelligence`, `/compliance`, `/system` | NO — needs wrapper | Uses `usePathname()` with broker routes, `useWhiteLabel()` context, `useSimpleDemoMode()` context. Enterprise must create EnterpriseShell wrapper with enterprise nav items. |
| `components/professional/BloombergLayout.tsx` | `@/design-system/tokens/professional-tokens` | None (11 inline placeholder components) | YES | Self-contained layout container. Accepts `mode` and `investorType` props. |

---

## Shareable API Logic

| Route | Methods | Database Tables | Extractable Logic | Classification | Notes |
|-------|---------|----------------|-------------------|---------------|-------|
| `/api/v1/intelligence/forecast` | GET | `forecasts` | YES — `getInstrumentForecasts(instrument, horizon?)` | GENERIC | Instrument-agnostic, no org scoping |
| `/api/v1/market/prices` | GET | None (in-memory registry) | YES — already uses `buildPriceEntry()` + `resolveInstrumentPricing()` | GENERIC | Configuration-driven, no broker logic |
| `/api/v1/market/instruments` | GET | None (in-memory registry) | YES — `getAllInstrumentsWithPricing()` | GENERIC | Pure config catalog |
| `/api/v1/clients` | GET, POST | `clients` | PARTIAL — queries already in `lib/db/queries/clients.ts` | BROKER-SPECIFIC | Org-scoped, ESC/VEEC target fields are compliance-specific |
| `/api/v1/clients/compliance/summary` | GET | `clients`, `surrender_tracking` | PARTIAL — orchestration logic extractable | BROKER-SPECIFIC | Surrender schema tied to carbon certificate compliance |
| `/api/cron/intelligence` | GET | `intelligence_alerts` (insert on error) | PARTIAL — orchestration pattern reusable | BROKER-SPECIFIC | Python pipeline execution is WREI-specific |

---

## Build Baseline

| Metric | Value |
|--------|-------|
| TypeScript errors | **0** |
| Tests passed | **1616** |
| Tests failed | **1** (`db-connection.test.ts:31` — expects `ALL_TABLES.length === 24`, actual is 25) |
| Tests skipped | **3** |
| Test suites | **68** (67 passed, 1 failed) |
| Build | **Successful** |
| Build time | ~45s |

**Note:** The 1 test failure is a stale assertion — `ALL_TABLES` grew from 24 to 25 tables but the test was not updated. This is pre-existing, not caused by this phase.

---

## Directory Structure Reference

```
lib/data-feeds/
├── feed-manager.ts            (5 exports)
├── types.ts                   (type definitions)
├── adapters/
│   ├── ecovantage-scraper.ts  (scrapeEcovantage)
│   ├── northmore-scraper.ts   (scrapeNorthmoreGordon)
│   ├── simulation-engine.ts   (4 simulation functions)
│   ├── types.ts               (6 interfaces)
│   └── chart-demo-data.ts     (demo data)
└── cache/
    └── price-cache.ts         (10 cache functions)

lib/db/
├── connection.ts              (@vercel/postgres pool)
├── schema.ts                  (25 DDL statements, v7)
├── migrate.ts                 (migration runner)
├── index.ts                   (barrel export)
└── queries/
    ├── trades.ts              (broker-only)
    ├── negotiations.ts        (broker-only)
    ├── pricing.ts             (shareable)
    ├── audit-log.ts           (shareable)
    ├── clients.ts             (broker-specific schema)
    └── correspondence.ts      (broker-only)

lib/ai/
├── types.ts                   (core AI types)
└── guards/
    ├── timeout-guard.ts
    ├── cost-guard.ts
    └── rate-limiter.ts

lib/config/
└── white-label.ts             (needs Downer entry added)
```

---

## Identified Risks

### HIGH: BloombergShell hardcoded navigation
`components/navigation/BloombergShell.tsx` has 9 hardcoded broker route paths and depends on three context providers (`useWhiteLabel`, `useSimpleDemoMode`, `usePathname`). Enterprise app **cannot import directly** — must create an `EnterpriseShell` wrapper or extend BloombergShell to accept nav items as props.

### MEDIUM: Intelligence panels hardcoded API paths
`ForecastPanel`, `SupplyDemandPanel`, and `AlertsFeed` all use hardcoded `/api/v1/intelligence/*` fetch paths. The enterprise app must provide matching API routes at the same paths, or the components need to accept configurable API base URLs.

### LOW: price-cache.ts lazy DB import
`lib/data-feeds/cache/price-cache.ts` uses `await import('@/lib/db/connection')` in fire-and-forget functions. If the enterprise app's `@/lib/db/connection` path resolution differs, this will silently fail (graceful — cache still works in-memory).

### LOW: Stale test assertion
`__tests__/db-connection.test.ts:31` asserts `ALL_TABLES.length === 24` but actual is 25. Pre-existing — not caused by enterprise work.

---

## Recommendations

### Before D1 (Enterprise Scaffold)

1. **No lib/ changes needed.** All shared modules can be imported via path aliases without modification.

2. **BloombergShell strategy:** Create `enterprise/components/EnterpriseShell.tsx` that reuses the Bloomberg Terminal aesthetic (top bar, market ticker, command bar, dark theme) but with enterprise navigation items (ORG, PIP, MKT, CMP). Do not modify the shared BloombergShell.

3. **Intelligence API routes:** Enterprise app must create matching routes at `/api/v1/intelligence/forecast`, `/api/v1/intelligence/metrics`, and `/api/v1/intelligence/alerts` that call the same shared forecast/pricing logic. This allows the shared intelligence components to work without modification.

4. **White-label registry:** Add Downer entry to `lib/config/white-label.ts` in D1. This is an additive change (new key in `WHITE_LABEL_REGISTRY`) that does not affect existing broker behaviour.

5. **External packages for enterprise `package.json`:** The enterprise app must install:
   - `recharts` (used by WREILineChart, WREIBarChart)
   - `@vercel/postgres` (used by db/connection)
   - `@anthropic-ai/sdk` (if enterprise uses AI features)
   - Design system tokens are in-repo, imported via path alias

6. **Database:** Enterprise uses separate Postgres instance. Shared base tables (instruments, price_observations, forecasts, etc.) plus enterprise-specific tables (diagnostic_assessments, attribution_records, pipeline_projects, entity_hierarchy, entity_compliance).

---

*End of D0 discovery. Next phase: D1 (Enterprise Scaffold).*
