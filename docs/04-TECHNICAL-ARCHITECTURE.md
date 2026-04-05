# WREI Trading Platform -- Technical Architecture Documentation

**Document Version:** 2.0
**Date:** 2026-04-05

---

## 1. Next.js 14 App Router Implementation

### Framework Configuration

- **Next.js version:** 14.1.0
- **React version:** 18.2.0
- **TypeScript:** 5.3.3 (strict mode enabled)
- **Module resolution:** Bundler
- **Path aliases:** `@/*` maps to project root
- **Build target:** ES5 for maximum browser compatibility

### Rendering Strategy

All page routes use `'use client'` directive (except `/client-intelligence` which uses a hybrid SSR/client pattern). This is deliberate:

1. Trading interfaces require extensive client-side interactivity
2. Real-time UI updates for negotiation, coaching, and market data
3. Bloomberg Terminal-style shell requires client-side state

Server-side functionality is in API routes (`app/api/*/route.ts`), which handle:
- Claude API calls (keeping `ANTHROPIC_API_KEY` server-side only)
- Database operations (PostgreSQL via Vercel Postgres)
- Financial calculations exposed as API services
- Market data feed orchestration with circuit breaker pattern
- AI service routing with guard pipeline

### Layout Architecture

```
app/layout.tsx (Root Layout)
  → Metadata configuration (title, description, OpenGraph)
  → Inter font from Google Fonts
  → Global CSS (Tailwind)
  → BloombergShell wrapper
    → TopBar (40px, branding + clock + status)
    → MarketTicker (scrolling live prices)
    → NavigationBar (48px, 6 consolidated items)
    → {children} (page content)
    → CommandBar (36px, terminal prompt + compliance)
```

---

## 2. Database Layer

### PostgreSQL (Vercel Postgres)

**Schema Version:** 7 (25 tables)
**Connection:** `lib/db/connection.ts` -- Singleton connection pool for serverless

| Category | Tables | Purpose |
|----------|--------|---------|
| Identity | organisations, users, api_keys, sessions | Authentication and authorisation |
| Instruments | instruments, instrument_config | 8 tradeable instruments with pricing config |
| Trading | trades, trade_history, negotiations, negotiation_rounds, settlements | Trade lifecycle and negotiation state |
| Clients | clients, client_holdings, surrender_obligations | Client management and compliance |
| Correspondence | correspondence, counterparties | Email drafts, threads, seller network |
| Market Data | price_observations, price_history, feed_status | Price feeds and health monitoring |
| Intelligence | forecasts, market_metrics | Forecast results and derived metrics |
| Operations | audit_log, alert_rules, alert_events, webhook_registrations | Audit trail, monitoring, integrations |

### Migration System

`lib/db/migrate.ts` -- Idempotent migration runner:
- Tracks schema version in `schema_migrations` table
- Supports force reset for development
- All DDL statements are `CREATE TABLE IF NOT EXISTS`

### Query Layer

`lib/db/queries/` -- Domain-specific query modules:
- `trades.ts` -- Trade CRUD with settlement tracking
- `negotiations.ts` -- Session state management
- `correspondence.ts` -- Correspondence lifecycle
- `pricing.ts` -- Price history and config
- `clients.ts` -- Client CRUD with holdings/compliance
- `audit-log.ts` -- Append-only audit trail

---

## 3. AI/ML Integration

### AI Service Router (`lib/ai/ai-service-router.ts`)

Single entry point for all Claude API calls with three-tier guard pipeline:

```
Request → Rate Limiter → Cost Guard → Timeout Guard → Claude API → Response
              ↓              ↓              ↓
          429 reject     402 reject     504 timeout
              ↓              ↓              ↓
           fallback       fallback       fallback
```

### Capabilities and Model Allocation

| Capability | Model | Max Tokens | Rate Limit |
|-----------|-------|------------|------------|
| `negotiation` | claude-opus-4-6 | 1024 | 10/hr/user |
| `market_intelligence` | claude-sonnet-4-6 | 1024 | 30/hr/user |
| `report_generator` | claude-sonnet-4-6 | 1024 | 20/hr/user |
| `correspondence_draft` | claude-sonnet-4-6 | 512 | 50/hr/user |
| `compliance_monitor` | claude-sonnet-4-6 | 512 | 30/hr/user |
| `portfolio_advisory` | claude-sonnet-4-6 | 512 | 20/hr/user |
| `data_interpreter` | claude-sonnet-4-6 | 256 | 50/hr/user |

### System Prompt Architecture

Prompts are dynamically constructed per capability (`lib/ai/prompts/system-prompts.ts`):
- **Conciseness directive** prepended to ALL prompts (WP6 §3.5)
- **Negotiation:** persona + state + market context + constraints + response format
- **Correspondence:** professional tone + instrument context + Australian conventions
- **Intelligence:** broker brand + forecast data + policy events + client position

### Defence Layers (Negotiation)

1. **Input Sanitisation** (`lib/defence.ts: sanitiseInput()`) -- Role override, strategy extraction, format manipulation, meta-instruction detection
2. **Threat Classification** (`classifyThreatLevel()`) -- Pattern-based scoring: none/low/medium/high
3. **Constraint Enforcement** (`enforceConstraints()`) -- Price floor, concession limits, round rules in application code
4. **Output Validation** (`validateOutput()`) -- Strip internal reasoning, filter canary tokens, validate price range

---

## 4. Python Forecasting System

### Architecture

```
forecasting/
  ├── data_assembly.py          # Historical dataset (2019-2025)
  ├── generate_forecast.py      # Daily forecast runner
  ├── models/
  │   ├── state_space.py        # Bayesian Kalman filter + HMM
  │   ├── ou_bounded.py         # Ornstein-Uhlenbeck bounded process
  │   ├── counterfactual_model.py  # XGBoost walk-forward
  │   └── ensemble_forecast.py  # CV-weighted ensemble
  ├── scrapers/
  │   ├── ecovantage_scraper.py # Spot prices + creation volumes
  │   ├── northmore_scraper.py  # Secondary price source
  │   ├── ipart_scraper.py      # ESS news + rule changes
  │   ├── tessa_scraper.py      # Registry data
  │   └── run_daily.py          # Orchestration
  ├── monitoring/
  │   ├── monitor.py            # Continuous market monitoring
  │   └── anomaly_detector.py   # Regime change alerts
  ├── signals/
  │   └── ai_signal_extractor.py  # Claude policy signal extraction
  ├── backtesting/
  │   └── backtest_engine.py    # Walk-forward validation
  ├── calibration/
  │   └── shadow_market.py      # NMG inventory shadow supply
  └── import/
      └── nmg_import.py         # NMG data import pipeline
```

### Ensemble Forecast Output
```python
@dataclass
class EnsembleForecast:
    week_ending: str
    price_forecast_4w: float
    price_forecast_12w: float
    confidence_interval_80: Tuple[float, float]
    confidence_interval_95: Tuple[float, float]
    recommended_action: str        # BUY / HOLD / SELL
    action_confidence: float       # 0-1
    estimated_value_per_cert: float
    bayesian_weight: float
    ml_weight: float
```

---

## 5. Market Data Pipeline

### Three-Tier Fallback Architecture

| Tier | Source | Timeout | Caching |
|------|--------|---------|---------|
| 1. Live | Ecovantage/NMG scraper | 15s | → Tier 2 |
| 2. Cached | In-memory + PostgreSQL | Immediate | 5-min stale threshold |
| 3. Simulated | Bounded random walk | Immediate | Not cached |

### Circuit Breaker (per adapter)
- **Threshold:** 3 consecutive failures
- **Open duration:** 60 seconds
- **Half-open:** Single test request before full reset

### Feed Adapters

| Adapter | File | Instruments |
|---------|------|-------------|
| Ecovantage | `lib/data-feeds/adapters/ecovantage-scraper.ts` | ESC, VEEC, LGC, ACCU, STC, PRC |
| Northmore Gordon | `lib/data-feeds/adapters/northmore-scraper.ts` | ESC, VEEC, LGC, ACCU, STC, PRC |
| Simulation | `lib/data-feeds/adapters/simulation-engine.ts` | All 8 instruments |

---

## 6. White-Label System

### Configuration (`lib/config/white-label.ts`)

```typescript
interface WhiteLabelConfig {
  businessName: string       // Top bar display
  terminalCode: string       // 2-3 char badge
  logoUrl: string | null
  primaryColour: string      // Top bar background
  accentColour: string       // Buttons, badges
  primaryTextColour: string
  contactEmail: string       // Command bar footer
  contactPhone: string | null
  footerText: string
  showAttribution: boolean   // "Powered by WREI"
}
```

### Resolution
1. Check `NEXT_PUBLIC_WHITE_LABEL_BROKER` env var
2. Check `?broker=` URL parameter (for `/client-intelligence`)
3. Lookup in `WHITE_LABEL_REGISTRY` by slug
4. Fall back to `DEFAULT_BRANDING` (WREI Platform)

---

## 7. Security Architecture

### Authentication
- **Session tokens:** Bearer header, 24-hour expiry
- **API keys:** `X-API-Key` header, hashed storage, per-key permissions
- **Roles:** admin, broker, trader, compliance, readonly

### API Security
- Rate limiting: 100 req/min standard, 50 for performance, 20 for auth endpoints
- Request validation on all POST/PUT endpoints
- CORS restricted to deployment domain

### AI Security
- Canary tokens in system prompts (XRAY-FLOOR-7742, TANGO-STRAT-3391, DELTA-LIMIT-5580)
- Input sanitisation blocks injection attempts before Claude API
- Constraint enforcement in application code (not delegated to LLM)
- Daily token budget per user (50K) and organisation (500K)

### Data Security
- `ANTHROPIC_API_KEY` server-side only
- Password hashing with bcrypt
- API key hashing (only hash stored)
- Append-only audit log

---

## 8. Performance

### Targets and Benchmarks

| Metric | Target | Measured |
|--------|--------|----------|
| First Contentful Paint | <2s | ~1.2s |
| API response (financial) | <50ms | <20ms typical |
| API response (AI) | <500ms | ~300ms |
| JS bundle (first load) | <100kB | 84.5kB |
| Build time | <60s | ~45s |
| Test execution | <60s | ~27s |

### Caching Strategy
- In-memory price cache with 5-minute stale threshold
- Rate limit counters with periodic cleanup
- Demo data pre-loaded in Zustand store
- PostgreSQL persistent cache with fire-and-forget writes

---

## 9. Build and Deployment

### Vercel Configuration
- Framework: Next.js
- Build: `npm run build`
- Output: `.next`
- Cron: `/api/cron/intelligence` (daily)

### Environment Variables

| Variable | Required | Scope | Purpose |
|----------|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Production | Server | Claude API |
| `POSTGRES_URL` | Production | Server | Database |
| `CRON_SECRET` | Production | Server | Cron auth |
| `NEXT_PUBLIC_WHITE_LABEL_BROKER` | Optional | Client | Active broker |
| `NEXT_PUBLIC_BASE_URL` | Optional | Client | Base URL |

### TypeScript Configuration
- Strict mode enabled
- ES5 target for compatibility
- Bundler module resolution
- Path aliases via `@/*`

### Tailwind Configuration
Bloomberg Terminal design tokens in `design-system/tokens/professional-tokens.ts`:
- Bloomberg orange: `#FF6B1A`
- Terminal black: `#0A0A0B`
- Market bullish: `#00C896`
- Market bearish: `#FF4757`
