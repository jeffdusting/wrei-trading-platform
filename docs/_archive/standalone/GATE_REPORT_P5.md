# GATE REPORT — P5 Authentication & Client Management

**Date:** 2026-04-05
**Phase:** P5-A (Auth) + P5-B (Client Management)
**Branch:** main
**Tag:** v1.1.0-auth-clients

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** — all pages compile |
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npm test -- --passWithNoTests` | **PASS** — 68 suites, 1598 passed, 3 skipped, 0 failed |

---

## P5-A: Authentication System (prior commit)

| Deliverable | Status |
|-------------|--------|
| `organisations` table | Done |
| `users` table (role, org, API key, password hash) | Done |
| `sessions` table (24h expiry) | Done |
| Auth middleware (`withAuth`, `getAuthUser`) | Done |
| Session token auth (Bearer) | Done |
| API key auth (X-API-Key) | Done |
| POST /api/auth/register | Done |
| POST /api/auth/login | Done |
| POST /api/auth/logout | Done |
| GET /api/auth/me | Done |

---

## P5-B: Client Management (this commit)

### Schema (P5.4)

| Table | Columns | Key Features |
|-------|---------|-------------|
| `clients` | 15 | Scoped to organisation, entity types (acp/obligated_entity/government/corporate/institutional), compliance context (ESS participant ID, annual targets, safeguard facility) |
| `client_holdings` | 10 | Certificate holdings by instrument type, vintage, status (held/pending_transfer/surrendered/retired) |
| `surrender_tracking` | 12 | Computed columns: `shortfall` (GENERATED ALWAYS AS target - surrendered), `penalty_exposure` (GENERATED ALWAYS AS shortfall * penalty_rate) |

SCHEMA_VERSION: 2 → 3, ALL_TABLES: 11 → 14

### API Routes (P5.5)

| Endpoint | Methods | Auth | Description |
|----------|---------|------|-------------|
| `/api/clients` | GET, POST | admin, broker | List/create clients (org-scoped) |
| `/api/clients/:id` | GET, PUT | admin, broker | Detail with holdings + compliance / update |
| `/api/clients/:id/holdings` | GET, POST | admin, broker | Holdings breakdown + record new holding |
| `/api/clients/:id/compliance` | GET | admin, broker | Surrender tracking with summary |

All routes enforce organisation scoping — a broker can only see their own organisation's clients.

### UI Components (P5.6)

| Component | Lines | Features |
|-----------|-------|----------|
| `ClientList` | 206 | Table with entity type filter, click-through, active status indicator |
| `ClientDetail` | 294 | Client header, holdings table (grouped by instrument with subtotals), surrender tracking table with days-to-deadline |
| `ClientComplianceOverview` | 297 | All-clients compliance dashboard, sortable by penalty exposure/shortfall/name, traffic light indicators (green/amber/red) |
| `app/clients/page.tsx` | 39 | Layout page — list view or detail view |

### Traffic Light Logic

| Colour | Condition |
|--------|-----------|
| Green | Compliant, or shortfall ≤ 0 |
| Amber | < 80% surrendered with < 3 months to deadline |
| Red | Shortfall with < 1 month to deadline, or status = 'shortfall' |

### Navigation

Added "Clients" item to BloombergShell navigation bar (icon: CLT, href: /clients).

---

## WP4 Scenario Coverage

| Scenario B Step | Feature | Status |
|-----------------|---------|--------|
| B2 — Client trade facilitation | Buyer side: compliance position view | **Implemented** (ClientDetail + compliance API) |
| B4 — Reporting | Client compliance summary, which clients at risk | **Implemented** (ClientComplianceOverview, penalty exposure sort) |
| B5 — Client management | Add/remove clients, manage permissions | **Implemented** (API CRUD, ClientList) |

---

## Files Changed/Created

| File | Action | Lines |
|------|--------|-------|
| `lib/db/schema.ts` | Modified | +58 (3 new tables) |
| `lib/db/migrate.ts` | Modified | +3 (reset list) |
| `lib/db/queries/clients.ts` | **Created** | 259 |
| `app/api/clients/route.ts` | **Created** | 77 |
| `app/api/clients/[id]/route.ts` | **Created** | 75 |
| `app/api/clients/[id]/holdings/route.ts` | **Created** | 97 |
| `app/api/clients/[id]/compliance/route.ts` | **Created** | 55 |
| `components/broker/ClientList.tsx` | **Created** | 206 |
| `components/broker/ClientDetail.tsx` | **Created** | 294 |
| `components/broker/ClientComplianceOverview.tsx` | **Created** | 297 |
| `app/clients/page.tsx` | **Created** | 39 |
| `components/navigation/BloombergShell.tsx` | Modified | +1 (nav item) |
| `__tests__/db-connection.test.ts` | Modified | +12 (table count, new module test) |
| **Total new code** | | **~1,399** |
