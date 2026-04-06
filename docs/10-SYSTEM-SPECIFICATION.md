# WREI Trading Platform -- Detailed System Specification

**Document Version:** 1.0
**Date:** 2026-04-05
**Classification:** Internal -- Technical Reference
**Derived From:** WP6 Target Architecture, Gate Reports P0-P11

---

## 1. System Overview

The WREI Trading Platform is a Next.js 14 application composed of seven interconnected subsystems. Each subsystem has defined interfaces, data flows, and failure modes.

```
                          ┌─────────────────────┐
                          │   Bloomberg Shell    │
                          │   (15 page routes)   │
                          └──────────┬──────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
           ┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
           │  Negotiation  │ │Correspondence│ │   Market    │
           │    Engine     │ │   Engine     │ │Intelligence │
           └───────┬───────┘ └──────┬──────┘ └──────┬──────┘
                   │                │                │
           ┌───────▼────────────────▼────────────────▼──────┐
           │              AI Service Router                  │
           │   (rate-limit → cost-guard → timeout-guard)     │
           └───────────────────┬─────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Data Layer       │
                    │  PostgreSQL + Cache  │
                    │  + Python Forecasts  │
                    └─────────────────────┘
```

---

## 2. Subsystem 1: Negotiation Engine

### Purpose
AI-powered price negotiation for carbon credits and environmental certificates.

### Entry Points
- `POST /api/negotiate` — Single-round negotiation turn
- `POST /api/v1/trades/negotiate` — Session-based negotiation (v1 API)
- `POST /api/v1/trades/negotiate/[id]` — Continue existing session

### Components

| Module | File | Responsibility |
|--------|------|----------------|
| System Prompt Builder | `lib/negotiate/system-prompt.ts` | Dynamic prompt from persona + state + market context |
| Defence Layer | `lib/defence.ts` | Input sanitisation, threat classification, constraint enforcement, output validation |
| Persona Definitions | `lib/personas.ts` | 15 buyer personas with warmth/dominance/patience calibration |
| Negotiation Config | `lib/negotiation-config.ts` | WREI Pricing Index, constraint parameters, round rules |
| Coaching Engine | `lib/negotiation-coaching.ts` | Real-time tactical suggestions |
| Scoring System | `lib/negotiation-scoring.ts` | Performance grading (price efficiency, strategy, rapport) |
| History Manager | `lib/negotiation-history.ts` | Session storage, replay, comparison |
| Committee Mode | `lib/committee-mode.ts` | Multi-stakeholder negotiation protocol |

### Constraints (enforced in application code, not LLM)
- **Price floor:** $120/t (WREI-CC), $22.80/t (ESC), instrument-specific
- **Max concession per round:** 5% of current price
- **Max total concession:** 20% from anchor price
- **Min rounds before price concession:** 3
- **Max rounds before escalation:** 8

### Data Flow
```
User message → sanitiseInput() → classifyThreatLevel() → POST /api/negotiate
  → Build system prompt (persona + state + market + constraints)
  → Claude API call (claude-opus-4-6, max 1024 tokens)
  → Parse JSON response
  → enforceConstraints() [price floor, concession limits]
  → validateOutput() [strip internal reasoning, filter canary tokens]
  → Return: { response, classification, emotion, proposedPrice, ... }
```

---

## 3. Subsystem 2: AI Correspondence Engine

### Purpose
Automated email drafting, inbound offer parsing, negotiation state management, trade confirmation, and client reporting for the ESC broker workflow.

### Entry Points
- `POST /api/v1/correspondence/procurement/generate-rfqs` — Generate RFQ drafts
- `POST /api/v1/correspondence/inbound` — Process inbound offers
- `POST /api/v1/correspondence/reports` — Generate client reports
- `GET /api/v1/correspondence/threads` — List negotiation threads
- `POST /api/v1/correspondence/threads/[id]` — Broker actions (approve/edit/reject)
- `GET /api/v1/correspondence/settlement` — Settlement status

### Components

| Module | File | Responsibility |
|--------|------|----------------|
| AI Draft Engine | `lib/correspondence/ai-draft-engine.ts` | AI-generated RFQ emails via Sonnet 4 (512 tokens) |
| Offer Parser | `lib/correspondence/offer-parser.ts` | Structured extraction from inbound emails (price/qty/vintage/terms) |
| Negotiation Manager | `lib/correspondence/negotiation-manager.ts` | Email negotiation state machine with pricing constraints |
| Procurement Trigger | `lib/correspondence/procurement-trigger.ts` | Risk classification + forecast-connected timing signals |
| Client Reporting | `lib/correspondence/client-reporting.ts` | AI-drafted compliance reports with market intelligence |
| Trade Confirmations | `lib/correspondence/trade-confirmation-generator.ts` | AFMA-compliant confirmation generation |
| Settlement | `lib/correspondence/settlement-facilitation.ts` | TESSA/VEEC registry instructions, overdue follow-up |
| Seller Outreach | `lib/correspondence/seller-outreach.ts` | Multi-counterparty RFQ dispatch |
| Intelligence Prompt | `lib/correspondence/prompts/intelligence-report-prompt.ts` | Market outlook prompt for client reports |

### Correspondence Lifecycle
```
drafted → approved → sent → [replied → counter_drafted → counter_approved → counter_sent] → accepted/rejected
```

### Procurement Timing Signals (P11-B)

| Signal | Condition | Override |
|--------|-----------|----------|
| `BUY_NOW` | Forecast 4w > spot + $0.50 | — |
| `WAIT` | Forecast 4w < spot - $0.50 | Overridden to `BUY_NOW_DEADLINE` if risk=RED and days<30 |
| `MARKET` | Within $0.50 tolerance | — |
| `BUY_NOW_DEADLINE` | WAIT + RED risk + <30 days | — |
| `CONSIDER` | BUY_NOW + GREEN risk | — |

### Email Negotiation Constraints
- Anchor price derived from instrument penalty rate
- Floor at 80% of penalty rate
- Ceiling at penalty rate
- Max 5% concession per round, 20% total
- Confidence threshold: <70% = manual review required

---

## 4. Subsystem 3: Market Intelligence & Forecasting

### Purpose
ESC price forecasting, supply/demand analysis, anomaly detection, and continuous market monitoring.

### Entry Points
- `GET /api/v1/intelligence/forecast` — Latest price forecasts
- `GET /api/v1/intelligence/metrics` — Derived market metrics
- `GET /api/v1/intelligence/backtest` — Model performance data
- `GET /api/v1/intelligence/alerts` — Active alerts
- `GET /api/v1/intelligence/counterfactual` — Trade analysis report
- `GET /api/cron/intelligence` — Daily pipeline trigger

### Forecasting Pipeline (Python)

| Model | File | Method |
|-------|------|--------|
| Bayesian State-Space | `forecasting/models/state_space.py` | Kalman filter with 4 hidden states, HMM regime transitions |
| Bounded OU Process | `forecasting/models/ou_bounded.py` | Ornstein-Uhlenbeck with 3 regimes (surplus/balanced/tightening) |
| ML Counterfactual | `forecasting/models/counterfactual_model.py` | XGBoost walk-forward for 4w price, action, decision value |
| Ensemble | `forecasting/models/ensemble_forecast.py` | CV-optimised weighted average minimising MAPE |

### Forecast Horizons and Output
- Anchor horizons: 1 week, 4 weeks, 12 weeks, 26 weeks (6 months)
- Chart display: weekly interpolation produces 26 data points for smooth visualisation
- Output per horizon: point forecast, 80% CI, 95% CI, regime probabilities
- **Penalty rate ceiling:** All forecasts and CI bands are capped at the instrument penalty rate (ESC: A$29.48, VEEC: A$120.00). The OU model uses a reflecting boundary at the penalty rate. CI bands compress asymmetrically near the ceiling.
- **Volume forecast:** Creation and surrender volumes projected from public IPART/CER annual rates, adjusted by regime probability (tightening reduces creation, increases surrender)

### Chart Integration
- `/analyse` — Market Overview tab: 2-column layout with price+volume+forecast chart (right), instrument data (left). Supports ESC/VEEC instrument selection, 1W-1Y time range, historical forecast overlay toggle, click-to-expand modal.
- `/intelligence` — Forecast tab: price+volume+forecast chart above the ForecastPanel detail card.
- Historical forecast overlay: 3 amber dashed tracks showing past model predictions (4w/8w/12w ago) vs actual, with ~3.6% MAPE error. Tooltip shows predicted price and error percentage.

### Data Sources

| Source | Scraper | Data |
|--------|---------|------|
| Ecovantage | `forecasting/scrapers/ecovantage_scraper.py` | Spot prices, creation volumes, activity breakdown |
| Northmore Gordon | `forecasting/scrapers/northmore_scraper.py` | Spot prices, inventory levels |
| IPART | `forecasting/scrapers/ipart_scraper.py` | ESS news, rule changes, consultations |
| TESSA Registry | `forecasting/scrapers/tessa_scraper.py` | Registry transfer data |

### Monitoring & Anomaly Detection
- **Continuous Monitor** (`forecasting/monitoring/monitor.py`) — Checks IPART/Ecovantage/NSW DCCEEW, triggers forecast re-runs on regime changes
- **Anomaly Detector** (`forecasting/monitoring/anomaly_detector.py`) — Alerts for creation velocity slowdown, surplus tightening, price-to-penalty approaching ceiling, forward curve inversion
- **AI Signal Extraction** (`forecasting/signals/ai_signal_extractor.py`) — Claude API extraction from policy documents into structured JSON for ML model

### Cron Pipeline (`api/cron/intelligence`)
```
1. Run all scrapers (Ecovantage, NMG, IPART, TESSA)
2. Update market metrics DB tables
3. Generate new forecast at all horizons
4. Run anomaly detection
5. Store results and create alerts
```

---

## 5. Subsystem 4: Client & Trade Management

### Purpose
Client entity management, holdings tracking, compliance monitoring, and trade lifecycle.

### Entry Points
- `GET/POST /api/v1/clients` — Client CRUD
- `GET /api/v1/clients/[id]/holdings` — Holdings by instrument/vintage
- `GET /api/v1/clients/[id]/compliance` — Surrender progress
- `GET /api/v1/clients/compliance/summary` — All clients' positions
- `GET/POST /api/v1/trades` — Trade CRUD
- `GET /api/v1/trades/[id]` — Trade detail with settlement timeline

### Client Entity Types
`acp` | `obligated_entity` | `government` | `corporate` | `institutional`

### Risk Classification (Compliance)

| Level | Coverage | Days to Deadline |
|-------|----------|------------------|
| GREEN | >80% covered | >90 days |
| AMBER | 50-80% covered | 30-90 days |
| RED | <50% covered | <30 days |

### Trade Lifecycle
```
pending → confirmed → settling → settled
                   → failed
```

---

## 6. Subsystem 5: AI Service Router

### Purpose
Central routing layer for all AI API calls with guard enforcement, model selection, and audit logging.

### File
`lib/ai/ai-service-router.ts`

### Capabilities and Models

| Capability | Model | Max Tokens | Timeout |
|-----------|-------|------------|---------|
| `negotiation` | claude-opus-4-6 | 1024 | 30s |
| `market_intelligence` | claude-sonnet-4-6 | 1024 | 20s |
| `compliance_monitor` | claude-sonnet-4-6 | 512 | 15s |
| `portfolio_advisory` | claude-sonnet-4-6 | 512 | 15s |
| `data_interpreter` | claude-sonnet-4-6 | 256 | 10s |
| `report_generator` | claude-sonnet-4-6 | 1024 | 45s |
| `correspondence_draft` | claude-sonnet-4-6 | 512 | 15s |

### Guard Pipeline (executed in order)
1. **Rate Limiter** (`lib/ai/guards/rate-limiter.ts`) — Sliding window per user/capability
2. **Cost Guard** (`lib/ai/guards/cost-guard.ts`) — Daily token budget (50K user, 500K org)
3. **Timeout Guard** (`lib/ai/guards/timeout-guard.ts`) — Per-capability timeout with graceful fallback

### Conciseness Directive
All AI calls are prepended with: *"Respond with data-dense, concise output. No filler, no preamble. State facts, figures, and recommendations directly."*

---

## 7. Subsystem 6: Market Data Pipeline

### Purpose
Real-time price feeds for 8 instruments with three-tier fallback and circuit breaker pattern.

### Architecture
```
Tier 1: Live scrapers (Ecovantage, Northmore Gordon)
  ↓ (on failure, circuit breaker trips)
Tier 2: Cached prices (PostgreSQL + in-memory)
  ↓ (on cache miss)
Tier 3: Simulated prices (bounded random walk)
```

### Components

| Module | File | Responsibility |
|--------|------|----------------|
| Feed Manager | `lib/data-feeds/feed-manager.ts` | Orchestrates adapters, circuit breaker, fallback |
| Ecovantage Scraper | `lib/data-feeds/adapters/ecovantage-scraper.ts` | ESC, VEEC, LGC, ACCU, STC, PRC spot prices |
| NMG Scraper | `lib/data-feeds/adapters/northmore-scraper.ts` | Secondary/validation price source |
| Simulation Engine | `lib/data-feeds/adapters/simulation-engine.ts` | Instrument-specific volatility/trend/floor |
| Price Cache | `lib/data-feeds/cache/price-cache.ts` | In-memory + PostgreSQL persistence |
| Real-Time Connector | `lib/data-feeds/real-time-connector.ts` | Subscription-based feed with simulation |

### Instruments

| Code | Name | Category | Currency |
|------|------|----------|----------|
| ESC | Energy Savings Certificate | Environmental | AUD |
| VEEC | Victorian Energy Efficiency Certificate | Environmental | AUD |
| PRC | Peak Reduction Certificate | Environmental | AUD |
| ACCU | Australian Carbon Credit Unit | Carbon | AUD |
| LGC | Large-scale Generation Certificate | Renewable | AUD |
| STC | Small-scale Technology Certificate | Renewable | AUD |
| WREI-CC | WREI Carbon Credit Token | Tokenised | USD |
| WREI-ACO | WREI Asset Co Token | Tokenised | USD |

---

## 8. Subsystem 7: White-Label & Presentation

### Purpose
Configurable branding for ESC broker deployments and public-facing intelligence pages.

### Configuration
`lib/config/white-label.ts` — `WhiteLabelConfig` with businessName, terminalCode, logoUrl, primaryColour, accentColour, contactEmail, contactPhone, footerText, showAttribution.

### Registered Brokers

| Slug | Business Name | Code |
|------|---------------|------|
| `nmg` / `northmore-gordon` | NORTHMORE GORDON | NG |
| `dm` / `demand-manager` | DEMAND MANAGER | DM |
| (default) | WREI PLATFORM | WR |

### White-Label Pages
- **Bloomberg Shell** (`components/navigation/BloombergShell.tsx`) — Top bar, nav, command bar styled per config
- **Client Intelligence** (`/client-intelligence?broker=nmg`) — Public page with broker branding
- **Client Reports** — Email body and HTML attachments branded per config

---

## 9. Database Schema

### PostgreSQL (Vercel Postgres), Schema Version 7

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `organisations` | Broker/platform entities | name, slug, tier |
| `users` | Authenticated users | email, password_hash, role, organisation_id |
| `api_keys` | API authentication | key_hash, user_id, permissions, rate_limit |
| `sessions` | Active login sessions | token_hash, user_id, expires_at |
| `instruments` | Tradeable instruments | symbol, name, category, currency |
| `instrument_config` | Pricing configuration | instrument_id, anchor_price, floor, ceiling |
| `trades` | Trade records | instrument_id, side, quantity, price, status |
| `trade_history` | Historical trade data (import) | organisation_id, instrument, side, quantity, price |
| `negotiations` | Negotiation sessions | persona, phase, anchor_price, current_offer |
| `negotiation_rounds` | Round-by-round history | negotiation_id, round, user_message, ai_response |
| `settlements` | Settlement tracking | trade_id, method, registry_ref, status |
| `clients` | Broker client entities | organisation_id, name, entity_type |
| `client_holdings` | Certificate/token holdings | client_id, instrument, quantity, vintage |
| `surrender_obligations` | Compliance surrender targets | client_id, scheme, target, surrendered, deadline |
| `correspondence` | Email drafts and sent items | type, counterparty, subject, body, status |
| `counterparties` | Seller network | name, contact, instruments, relationship |
| `price_observations` | Historical price data | instrument_id, price, source, observed_at |
| `price_history` | Aggregated price history | instrument_id, date, open, high, low, close |
| `feed_status` | Data feed health | adapter, status, last_success, error_count |
| `audit_log` | Append-only audit trail | actor, action, resource, details |
| `alert_rules` | Monitoring alert rules | type, condition, threshold, enabled |
| `alert_events` | Triggered alert events | rule_id, triggered_at, acknowledged |
| `webhook_registrations` | Webhook endpoints | url, events, secret_hash |
| `forecasts` | Price forecast results | instrument, horizon, price, ci_lower, ci_upper |
| `market_metrics` | Derived market metrics | instrument, metric_type, value |

---

## 10. Security Architecture

### Authentication
- **Session tokens** — Bearer header for browser sessions
- **API keys** — `X-API-Key` header for programmatic access
- **Role-based access** — admin, broker, trader, compliance, readonly

### AI Defence Layers
1. **Input Sanitisation** — Role override, strategy extraction, format manipulation, meta-instruction detection
2. **Threat Classification** — none/low/medium/high with pattern scoring
3. **Constraint Enforcement** — Price floors, concession limits in application code
4. **Output Validation** — Strip internal reasoning, filter canary tokens, validate price range
5. **Canary Tokens** — XRAY-FLOOR-7742, TANGO-STRAT-3391, DELTA-LIMIT-5580

### AI Service Guards
- Rate limiting per user/capability (sliding window)
- Daily token budget enforcement (50K user, 500K org)
- Per-capability timeout with graceful fallback

### Data Security
- `ANTHROPIC_API_KEY` server-side only (never exposed to client)
- Password hashing with bcrypt
- API key hashing (only hash stored)
- Append-only audit log (no updates/deletes)

---

## 11. Performance Specifications

| Metric | Target | Measured |
|--------|--------|----------|
| Page load (First Contentful Paint) | <2s | ~1.2s |
| API response (financial calc) | <50ms | <20ms typical |
| API response (AI negotiation) | <500ms | ~300ms typical |
| Build time | <60s | ~45s |
| Test suite execution | <60s | ~27s |
| JS bundle (first load shared) | <100kB | 84.5kB |
| Concurrent sessions | 100+ | Vercel serverless |

---

## 12. Environment Variables

| Variable | Required | Scope | Purpose |
|----------|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Yes (production) | Server | Claude API authentication |
| `POSTGRES_URL` | Yes (production) | Server | Database connection string |
| `CRON_SECRET` | Yes (production) | Server | Cron job authentication |
| `NEXT_PUBLIC_WHITE_LABEL_BROKER` | No | Client | Active white-label broker slug |
| `NEXT_PUBLIC_BASE_URL` | No | Client | Base URL for internal API calls |
| `WREI_API_KEY` | No (demo) | Server | External API authentication |

---

## 13. Error Handling Strategy

### API Routes
- All routes return structured JSON: `{ ok: boolean, error?: string, data?: any }`
- HTTP status codes: 200 (success), 400 (bad request), 401 (unauthorised), 403 (forbidden), 404 (not found), 429 (rate limited), 500 (server error)

### AI Calls
- On guard rejection: return fallback template-generated content
- On timeout: return partial result or fallback
- On API error: log to audit, return user-friendly error message

### Data Feeds
- Circuit breaker pattern: trip after 3 consecutive failures, reset after 60s
- Fallback chain: live → cached → simulated (always returns a price)

### Client Components
- Graceful degradation: components render with demo data if API unavailable
- Loading states with skeleton placeholders
- Error boundaries prevent full-page crashes
