# WREI Trading Platform -- System Functional Architecture

**Document Version:** 3.0
**Date:** 2026-04-05
**Update:** P11 complete -- all subsystems documented

---

## 1. Application Routes

### Page Routes (App Router) -- 15 Pages

| Route | File | Type | Purpose |
|-------|------|------|---------|
| `/` | `app/page.tsx` | Client | Live trading dashboard with instrument ticker, market data, portfolio overview |
| `/trade` | `app/trade/page.tsx` | Client | AI-powered trading interface with multi-persona negotiation, bulk mode, order book |
| `/analyse` | `app/analyse/page.tsx` | Client | Market analysis tools with carbon credit filtering and investment calculator |
| `/intelligence` | `app/intelligence/page.tsx` | Client | ESC market intelligence: forecast, supply/demand, alerts, performance, backtest, trade analysis |
| `/client-intelligence` | `app/client-intelligence/page.tsx` | Hybrid | Public white-labelled ESC intelligence page for scheme participants |
| `/correspondence` | `app/correspondence/page.tsx` | Client | Correspondence management: procurement, drafts, negotiations, settlement, reports, history |
| `/clients` | `app/clients/page.tsx` | Client | Client management with list/detail views and compliance overview |
| `/compliance` | `app/compliance/page.tsx` | Client | Regulatory compliance dashboard: ASIC, AUSTRAC, IPART, CER status |
| `/performance` | `app/performance/page.tsx` | Client | System performance monitoring with API metrics and health status |
| `/calculator` | `app/calculator/page.tsx` | Client | Investment calculator with IRR, NPV, scenario comparison |
| `/scenario` | `app/scenario/page.tsx` | Client | Portfolio scenario selector with simulation engine |
| `/simulate` | `app/simulate/page.tsx` | Client | Trading simulation with Bloomberg-styled scenario engine |
| `/institutional/portal` | `app/institutional/portal/page.tsx` | Client | 6-step institutional onboarding wizard |
| `/developer` | `app/developer/page.tsx` | Client | Developer portal with REST API v1 documentation and API explorer |
| `/system` | `app/system/page.tsx` | Client | System management with demo controls and endpoint listings |

### API Routes -- 53 Endpoints

#### Legacy API (`/api/`) -- 23 Routes

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/negotiate` | POST | Core AI negotiation (Claude Opus 4.6) |
| `/api/analytics` | POST | Financial calculations (IRR, NPV, Monte Carlo, etc.) |
| `/api/analytics/predict` | POST | AI predictive analytics and forecasting |
| `/api/scenarios/generate` | POST | Dynamic AI scenario generation |
| `/api/compliance` | GET, POST | Compliance assessment and reporting |
| `/api/market-data` | GET | Market data feeds (carbon, RWA, sentiment) |
| `/api/market-commentary` | GET | AI-generated market commentary |
| `/api/metadata` | GET, DELETE | Token metadata queries |
| `/api/performance` | GET, POST | Performance monitoring and benchmarks |
| `/api/prices` | GET | All instrument prices with feed health |
| `/api/trade` | POST | Legacy trade endpoint (redirects to negotiate) |
| `/api/trades` | GET, POST | Trade listing and recording |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | Authentication |
| `/api/auth/logout` | POST | Session invalidation |
| `/api/auth/me` | GET | Current user info |
| `/api/clients` | GET, POST | Client CRUD |
| `/api/clients/[id]` | GET, PUT | Client detail/update |
| `/api/clients/[id]/holdings` | GET, POST | Client holdings |
| `/api/clients/[id]/compliance` | GET | Client compliance status |

#### V1 API (`/api/v1/`) -- 29 Routes

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/v1/market/prices` | GET | Current instrument prices |
| `/api/v1/market/prices/history` | GET | Price history time-series |
| `/api/v1/market/orderbook` | GET | Order book depth |
| `/api/v1/market/instruments` | GET | All tradeable instruments |
| `/api/v1/trades` | GET, POST | Trade CRUD |
| `/api/v1/trades/[id]` | GET | Trade detail with settlement |
| `/api/v1/trades/negotiate` | POST | Session-based negotiation |
| `/api/v1/trades/negotiate/[id]` | GET, POST | Continue negotiation |
| `/api/v1/clients` | GET, POST | Client management |
| `/api/v1/clients/[id]` | GET, PUT | Client detail |
| `/api/v1/clients/[id]/holdings` | GET | Client holdings |
| `/api/v1/clients/[id]/compliance` | GET | Surrender tracking |
| `/api/v1/clients/compliance/summary` | GET | All clients' compliance |
| `/api/v1/correspondence` | GET | List correspondence |
| `/api/v1/correspondence/procurement` | GET | Procurement recommendations |
| `/api/v1/correspondence/procurement/generate-rfqs` | POST | Generate RFQ drafts |
| `/api/v1/correspondence/inbound` | POST | Process inbound offers |
| `/api/v1/correspondence/reports` | GET, POST | Client reports |
| `/api/v1/correspondence/threads` | GET | Negotiation threads |
| `/api/v1/correspondence/threads/[id]` | GET, POST | Thread detail/actions |
| `/api/v1/correspondence/settlement` | GET | Settlement status |
| `/api/v1/intelligence/forecast` | GET | Price forecasts |
| `/api/v1/intelligence/metrics` | GET | Derived market metrics |
| `/api/v1/intelligence/backtest` | GET | Backtest results |
| `/api/v1/intelligence/alerts` | GET, POST | Intelligence alerts |
| `/api/v1/intelligence/counterfactual` | GET | Trade analysis report |
| `/api/v1/import` | POST | CSV data import |
| `/api/v1/webhooks` | GET, POST, DELETE | Webhook management |
| `/api/v1/alerts` | GET, POST, PUT, DELETE | Alert rule management |

#### Cron Jobs -- 1 Route

| Endpoint | Trigger | Purpose |
|----------|---------|---------|
| `/api/cron/intelligence` | Daily (CRON_SECRET) | Data ingestion, forecast generation, monitoring |

---

## 2. Component Hierarchy

### Root Layout (`app/layout.tsx`)
```
RootLayout
  → BloombergShell (persistent terminal chrome)
    → TopBar (branding, clock, status)
    → MarketTicker (scrolling price feed)
    → NavigationBar (6 consolidated items: TRD, ANA, MKT, PRT, CMP, SYS)
    → {children} (page content)
    → CommandBar (terminal prompt, compliance info)
```

### Trading Page (`/trade`)
```
TradePage
  → InstrumentSelector (8 instruments)
  → PersonaSelector (15 personas)
  → ChatInterface (message history, input)
  → AnalyticsTabs
    → StandardAnalytics (phase, classification, emotion)
    → InstitutionalDashboard
    → History (replay, comparison)
  → NegotiationStrategyPanel
  → CoachingPanel
  → OrderBookPanel
  → TokenDetailPanel
```

### Intelligence Page (`/intelligence`)
```
IntelligencePage
  → TabNavigation [Forecast | Supply & Demand | Alerts | Performance | Model | Trade Analysis]
  → ForecastPanel (fan chart, horizon table, regime probability, action badge)
  → SupplyDemandPanel (creation/surrender balance, activity mix)
  → AlertsFeed (active alerts with severity)
  → ForecastPerformance (MAPE, directional accuracy, drift detection, P&L)
  → BacktestReport (model comparison, regime performance)
  → CounterfactualReport (historical trade analysis)
```

### Correspondence Page (`/correspondence`)
```
CorrespondencePage
  → TabNavigation [Procurement | Drafts | Negotiations | Settlement | Reports | History]
  → ProcurementDashboard (risk table, timing signals, RFQ generation)
  → DraftList (pending approvals with preview)
  → NegotiationThreadList (active threads, round history)
  → SettlementTracker (pending settlements, registry links)
  → ReportList (client reports with status)
  → CorrespondenceHistory (full archive)
```

### Client Intelligence Page (`/client-intelligence`)
```
ClientIntelligencePage (white-label branding)
  → BrokerHeader (logo, brand colours)
  → HeroCards [3-Month Outlook | Current Spot | Model Confidence]
  → SupplyDemandBalance (creation/surrender, activity mix bar)
  → ComplianceCalendar (upcoming deadlines)
  → PolicyTracker (rule changes with impact ratings)
  → ForecastTable (horizons with direction indicators)
  → ContactCTA (broker email/phone)
  → BrandedFooter
```

---

## 3. Component Catalogue

### Bloomberg Terminal Components (`components/navigation/`, `components/professional/`)

| Component | Purpose |
|-----------|---------|
| `BloombergShell` | Terminal chrome: top bar, nav, command bar with white-label support |
| `BloombergLayout` | Bloomberg-terminal-style layout wrapper |
| `ProfessionalDataGrid` | Sortable/filterable institutional data grid |
| `AccessibilityWrapper` | WCAG 2.1 AA compliance wrapper |

### Intelligence Components (`components/intelligence/`)

| Component | Purpose |
|-----------|---------|
| `ForecastPanel` | ESC price fan chart with confidence intervals and action badge |
| `SupplyDemandPanel` | Creation/surrender balance and activity mix visualisation |
| `AlertsFeed` | Active intelligence alerts with severity indicators |
| `BacktestReport` | Model performance comparison across horizons |
| `CounterfactualReport` | Historical trade analysis with optimal timing assessment |
| `ForecastPerformance` | Rolling accuracy, drift detection, recommendation P&L tracking |
| `ClientIntelligencePage` | Public white-labelled ESC market intelligence |

### Correspondence Components (`components/correspondence/`)

| Component | Purpose |
|-----------|---------|
| `ProcurementDashboard` | Client shortfall table with timing signals and RFQ generation |
| `DraftReviewPanel` | Draft approval/edit/reject workflow |
| `NegotiationThreadView` | Email negotiation thread with round history |
| `SettlementPanel` | Settlement tracking with registry instruction links |
| `ReportGenerator` | Client report generation and preview |

### Negotiation Components (`components/negotiation/`)

| Component | Purpose |
|-----------|---------|
| `CoachingPanel` | Real-time tactical suggestions |
| `CommitteePanel` | Multi-stakeholder committee interface |
| `ComparisonDashboard` | Side-by-side session comparison |
| `ReplayViewer` | Step-through negotiation replay |
| `Scorecard` | Post-negotiation performance grading |

### Chart Components (`components/charts/`)

| Component | Purpose |
|-----------|---------|
| `WREILineChart` | Time series data with WREI colour scheme |
| `WREIBarChart` | Categorical/distribution data |
| `WREIPieChart` | Proportional data with legend |
| `WREIAreaChart` | Area-filled time series with gradient |

### Institutional Components (`components/institutional/`)

| Component | Purpose |
|-----------|---------|
| `InstitutionalOnboardingWizard` | 6-step onboarding orchestrator |
| `InstitutionalIdentityForm` | Entity registration |
| `InvestorClassificationAssessment` | Wholesale/professional classification |
| `KYCAMLVerification` | KYC/AML compliance checks |
| `AFSLComplianceReview` | Financial Services Licence assessment |
| `InvestmentPreferencesConfig` | Token type, yield, risk preferences |
| `ComplianceConfirmation` | Final review and terms acceptance |
| `PipelineTransition` | Onboarding-to-negotiation state transfer |

### Market Components (`components/market/`)

| Component | Purpose |
|-----------|---------|
| `MarketTicker` | Scrolling market data ticker |
| `MarketStatus` | Market open/closed indicator |
| `CompetitivePositioning` | Competitive analysis radar chart |
| `ESGImpactDashboard` | ESG impact metrics and tracking |

### Scenario Components (`components/scenarios/`)

| Component | Purpose |
|-----------|---------|
| `DeFiYieldFarmingScenario` | DeFi yield farming simulation |
| `ESGImpactScenario` | ESG impact assessment |
| `FamilyOfficeScenario` | Family office legacy simulation |
| `InfrastructureFundScenario` | Infrastructure fund discovery |
| `SovereignWealthFundScenario` | Sovereign wealth fund simulation |

### Export, Calculator, Analytics

| Component | Purpose |
|-----------|---------|
| `ExportModal` | Multi-format report export (PDF, Excel, CSV, JSON) |
| `InvestmentCalculator` | Interactive investment modelling |
| `ScenarioCompare` | Side-by-side scenario comparison |
| `IntelligentAnalyticsDashboard` | AI-enhanced analytics with predictive insights |
| `DemoOrchestrator` | Demo scenario management |
| `ScenarioGenerator` | Dynamic AI-powered scenario creation |

---

## 4. Data Flow Architecture

### AI Negotiation Flow
```
User Input → NegotiatePage
  → sanitiseInput() → classifyThreatLevel()
  → POST /api/negotiate
    → Build system prompt (persona + state + market + constraints)
    → Claude API (claude-opus-4-6)
    → enforceConstraints() [price floor, concession limits]
    → validateOutput() [strip reasoning, filter canary tokens]
    → Return response
  → Update UI (messages, classification, emotion, coaching, scorecard)
```

### Correspondence Flow
```
Procurement Trigger → evaluateClientNeeds()
  → Fetch forecast → computeTimingSignal()
  → ProcurementDashboard
    → "Generate RFQs" → POST /api/v1/correspondence/procurement/generate-rfqs
      → AI Draft Engine (Sonnet 4, 512 tokens)
      → Store as "drafted" correspondence
    → Broker reviews → approve/edit/reject
    → "approved" → mark as "sent"
  → Counterparty replies → POST /api/v1/correspondence/inbound
    → Offer Parser → structured extraction
    → AI Counter-Offer (if within constraints)
    → Store in negotiation thread
  → Accepted → Trade Confirmation Generator
    → Settlement Facilitation (TESSA/VEEC instructions)
```

### Market Intelligence Flow
```
Daily Cron (/api/cron/intelligence)
  → Run scrapers (Ecovantage, NMG, IPART, TESSA)
  → Update market_metrics + price_observations
  → Python forecast pipeline
    → Bayesian state-space → OU bounded → XGBoost counterfactual
    → Ensemble (CV-optimised weights)
    → Store forecasts at 1w/4w/12w/26w horizons
  → Anomaly detection → create alert_events if triggered
  → Intelligence API serves latest data to UI
```

### Price Feed Flow
```
Client request → Feed Manager
  → Tier 1: Ecovantage/NMG live scraper (15s timeout)
    → Success: cache in-memory + persist to DB → return
    → Failure: circuit breaker trips
  → Tier 2: Price Cache (in-memory → DB lookup)
    → Hit: return cached price with staleness flag
    → Miss: fall through
  → Tier 3: Simulation Engine (bounded random walk)
    → Always returns a price (instrument-specific parameters)
```

---

## 5. State Management Architecture

### Client-Side State (React)
- **NegotiatePage / TradePage:** `useState` for negotiation state, messages, persona, scoring, coaching
- **IntelligencePage:** `useState` for active tab, forecast data, alerts
- **CorrespondencePage:** `useState` for active tab, selected items, draft preview
- **ClientsPage:** `useState` for client list, selected client, filter state

### Global State (Zustand)
- **Demo State Manager:** `isActive`, `selectedDataSet`, `demoData`
- Data sets: `institutional`, `retail`, `compliance`

### Server-Side State (PostgreSQL)
- All persistent data in PostgreSQL (Vercel Postgres)
- In-memory caching for price feeds and rate limiting
- Fire-and-forget DB operations for non-critical persistence (price cache)

### AI State
- Conversation context managed per-request (message history in request body)
- No persistent AI memory across sessions
- Guard state (rate counters, cost budgets) in-memory with UTC midnight reset
