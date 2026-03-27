# WREI Trading Platform -- System Functional Architecture

**Document Version:** 2.0
**Date:** 2026-03-27

---

## 1. Application Routes

### Page Routes (App Router)

| Route | File | Type | Purpose |
|-------|------|------|---------|
| `/` | `app/page.tsx` | Client | Landing page with hero, feature showcase, market data, pathways |
| `/negotiate` | `app/negotiate/page.tsx` | Client | AI negotiation interface with dashboard, coaching, and analytics |
| `/institutional/portal` | `app/institutional/portal/page.tsx` | Client | 6-step institutional onboarding wizard |
| `/calculator` | `app/calculator/page.tsx` | Client | Investment calculator with scenario comparison |
| `/compliance` | `app/compliance/page.tsx` | Client | Regulatory compliance map and status dashboard |
| `/demo` | `app/demo/page.tsx` | Client | Demo mode landing with tour selection |
| `/developer` | `app/developer/page.tsx` | Client | API Explorer, Quick Start Guide, documentation |
| `/scenario` | `app/scenario/page.tsx` | Client | Scenario simulation selector and engine |
| `/simulate` | `app/simulate/page.tsx` | Client | Alternative simulation entry point |
| `/performance` | `app/performance/page.tsx` | Client | Performance monitoring dashboard |

### API Routes

| Endpoint | File | Methods | Purpose |
|----------|------|---------|---------|
| `/api/negotiate` | `app/api/negotiate/route.ts` | POST | Claude API negotiation engine |
| `/api/analytics` | `app/api/analytics/route.ts` | POST | Financial calculation engine |
| `/api/analytics/predict` | `app/api/analytics/predict/route.ts` | POST | **Stage 2:** Intelligent predictive analytics |
| `/api/scenarios/generate` | `app/api/scenarios/generate/route.ts` | POST | **Stage 2:** Dynamic scenario generation |
| `/api/presentation/adapt` | `app/api/presentation/adapt/route.ts` | POST | **Stage 2:** Adaptive presentation layer |
| `/api/compliance` | `app/api/compliance/route.ts` | GET, POST | Compliance reporting and assessment |
| `/api/market-data` | `app/api/market-data/route.ts` | GET | Market data feeds and intelligence |
| `/api/metadata` | `app/api/metadata/route.ts` | GET | Token metadata queries |
| `/api/performance` | `app/api/performance/route.ts` | GET, POST | Performance monitoring and testing |

---

## 2. Component Hierarchy

### Root Layout (`app/layout.tsx`)
```
RootLayout
  -> DemoDataProvider (demo mode context injection)
    -> NavigationShell (persistent navigation, market ticker, demo controls)
      -> {children} (page content)
```

### Landing Page (`app/page.tsx`)
```
Home
  -> Hero Section (animated counters, CTA buttons)
  -> Feature Showcase (6 feature cards with links)
  -> Market Stats Section (WREI Pricing Index display)
  -> Pathway Selection (Investor, Developer, Compliance)
  -> Demo Notice Banner
```

### Negotiation Page (`app/negotiate/page.tsx`)
```
NegotiatePage
  -> Persona Selector
  -> Credit Type / Token Type Selection
  -> Chat Interface (message history, input)
  -> Analytics Tabs:
     -> Standard Analytics (phase, classification, emotion)
     -> Institutional Dashboard
     -> History (session list, replay, comparison)
  -> NegotiationStrategyPanel
  -> CoachingPanel
  -> Scorecard
  -> ReplayViewer
  -> ComparisonDashboard
  -> ExportModal
  -> Blockchain Visualisation:
     -> ProvenanceChain
     -> MerkleTreeView
     -> VesselProvenanceCard
```

### Institutional Portal (`app/institutional/portal/page.tsx`)
```
InstitutionalPortalPage
  -> InstitutionalOnboardingWizard
     -> InstitutionalIdentityForm (Step 1)
     -> InvestorClassificationAssessment (Step 2)
     -> KYCAMLVerification (Step 3)
     -> AFSLComplianceReview (Step 4)
     -> InvestmentPreferencesConfig (Step 5)
     -> ComplianceConfirmation (Step 6)
  -> PipelineTransition (post-onboarding)
```

### Performance Page (`app/performance/page.tsx`)
```
PerformancePage
  -> Quick Stats Header (uptime, response time, success rate, capacity)
  -> Feature Cards (monitoring, optimisation, load testing)
  -> Performance Visualisations:
     -> WREIBarChart (response time distribution)
     -> WREIAreaChart (API call volume)
     -> WREIPieChart (request status distribution)
  -> System Health Indicators
  -> Performance Specifications
  -> API Endpoints Table
  -> PerformanceDashboard component
```

---

## 3. Component Catalogue

### Core UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `NavigationShell` | `components/navigation/NavigationShell.tsx` | Persistent navigation with 9 route links, mobile menu, demo mode toggle |
| `InstitutionalDashboard` | `components/InstitutionalDashboard.tsx` | Institutional analytics alongside negotiation |
| `ProfessionalInterface` | `components/ProfessionalInterface.tsx` | Professional-grade investment analysis interface |
| `PerformanceDashboard` | `components/PerformanceDashboard.tsx` | System performance metrics display |
| `PortfolioManager` | `components/PortfolioManager.tsx` | Portfolio management and allocation |
| `PredictiveAnalyticsDashboard` | `components/PredictiveAnalyticsDashboard.tsx` | Predictive modelling display |
| `AdvancedAnalytics` | `components/AdvancedAnalytics.tsx` | Advanced analytics views |
| `AnalyticsHub` | `components/AnalyticsHub.tsx` | Central analytics aggregation |
| `NegotiationStrategyPanel` | `components/NegotiationStrategyPanel.tsx` | AI strategy transparency panel |
| `CoreInvestorJourneys` | `components/CoreInvestorJourneys.tsx` | Investor journey orchestration |
| `MarketIntelligenceDashboard` | `components/MarketIntelligenceDashboard.tsx` | Market intelligence display |

### Chart Components (`components/charts/`)

| Component | Purpose |
|-----------|---------|
| `WREILineChart` | Time series data with WREI colour scheme |
| `WREIBarChart` | Categorical/distribution data |
| `WREIPieChart` | Proportional data with legend |
| `WREIAreaChart` | Area-filled time series with gradient |

All charts use Recharts with Australian currency formatting and the WREI colour palette.

### Institutional Components (`components/institutional/`)

| Component | Purpose |
|-----------|---------|
| `InstitutionalOnboardingWizard` | 6-step onboarding orchestrator |
| `InstitutionalIdentityForm` | Entity registration (name, type, jurisdiction, AUM) |
| `InvestorClassificationAssessment` | Wholesale/professional/sophisticated classification |
| `KYCAMLVerification` | KYC/AML compliance checks and documentation |
| `AFSLComplianceReview` | Australian Financial Services Licence assessment |
| `InvestmentPreferencesConfig` | Token type, yield, risk, liquidity preferences |
| `ComplianceConfirmation` | Final review and terms acceptance |
| `PipelineTransition` | Onboarding-to-negotiation state transfer |

### Negotiation Components (`components/negotiation/`)

| Component | Purpose |
|-----------|---------|
| `CoachingPanel` | Real-time tactical suggestions during negotiation |
| `CommitteePanel` | Multi-stakeholder committee negotiation interface |
| `ComparisonDashboard` | Side-by-side session comparison |
| `ReplayViewer` | Step-through negotiation replay |
| `Scorecard` | Post-negotiation performance grading |

### Market Components (`components/market/`)

| Component | Purpose |
|-----------|---------|
| `MarketTicker` | Scrolling market data ticker (header bar) |
| `MarketStatus` | Market open/closed indicator |
| `CompetitivePositioning` | Competitive analysis radar chart |
| `ESGImpactDashboard` | ESG impact metrics and tracking |

### Compliance Components (`components/compliance/`)

| Component | Purpose |
|-----------|---------|
| `RegulatoryMap` | Jurisdictional compliance matrix |
| `ComplianceStatusDashboard` | Real-time compliance status |

### Blockchain Components (`components/blockchain/`)

| Component | Purpose |
|-----------|---------|
| `ProvenanceChain` | Verification chain visualisation |
| `MerkleTreeView` | Merkle tree hash structure display |
| `VesselProvenanceCard` | Individual vessel provenance details |

### Demo Components (`components/demo/`)

| Component | Purpose |
|-----------|---------|
| `DemoDataProvider` | Context provider for demo data injection |
| `DemoControlBar` | Tour navigation controls |
| `DemoModeToggle` | Demo mode activation button |
| `TourOverlay` | Step-by-step tour overlay with highlights |

### Professional Components (`components/professional/`)

| Component | Purpose |
|-----------|---------|
| `BloombergLayout` | Bloomberg-terminal-style layout wrapper |
| `AccessibilityWrapper` | WCAG 2.1 AA compliance wrapper |
| `ProfessionalDataGrid` | Sortable/filterable institutional data grid |

### Scenario Components (`components/scenarios/`)

| Component | Purpose |
|-----------|---------|
| `DeFiYieldFarmingScenario` | DeFi yield farming simulation |
| `ESGImpactScenario` | ESG impact assessment simulation |
| `FamilyOfficeScenario` | Family office legacy simulation |
| `InfrastructureFundScenario` | Infrastructure fund discovery simulation |
| `SovereignWealthFundScenario` | Sovereign wealth fund simulation |

### Simulation Components (`components/simulation/`)

| Component | Purpose |
|-----------|---------|
| `ScenarioSelector` | Scenario selection interface |
| `ScenarioSimulationEngine` | Simulation orchestration engine |

### Export Components (`components/export/`)

| Component | Purpose |
|-----------|---------|
| `ExportModal` | Multi-format report export dialog |

### Calculator Components (`components/calculator/`)

| Component | Purpose |
|-----------|---------|
| `InvestmentCalculator` | Interactive investment modelling tool |
| `ScenarioCompare` | Side-by-side scenario comparison |

### Analytics Components (`components/analytics/`)

| Component | Purpose |
|-----------|---------|
| `AdvancedAnalyticsSuite` | Advanced analytics aggregation |
| `IntelligentAnalyticsDashboard` | **Stage 2:** AI-enhanced analytics with predictive insights |
| `AnalyticsDashboard` | Core analytics dashboard (legacy export) |
| `RealTimeMetricsWidget` | Real-time performance metrics display |
| `PerformanceChart` | Chart component for performance data |

### **Stage 2 AI-Enhanced Components**

#### Orchestration System (`components/orchestration/`)
| Component | Purpose |
|-----------|---------|
| `DemoOrchestrator` | **Stage 2 Component 1:** AI-powered demo orchestration engine with intelligent tour management |

#### Scenario Generation (`components/generation/`)
| Component | Purpose |
|-----------|---------|
| `ScenarioGenerator` | **Stage 2 Component 2:** Dynamic scenario generation with AI-powered content creation |

#### Presentation Layer (`components/presentation/`)
| Component | Purpose |
|-----------|---------|
| `AdaptivePresentationDashboard` | **Stage 2 Component 4:** Adaptive presentation layer with audience-specific content |

#### Multi-Audience System (`components/audience/`)
| Component | Purpose |
|-----------|---------|
| `AudienceSelector` | **Stage 2 Component 5:** Multi-audience interface system with guided tours |
| `ExecutiveDashboard` | Executive-focused interface with high-level metrics and strategic insights |
| `TechnicalInterface` | Technical leadership interface with system architecture and performance data |
| `CompliancePanel` | Compliance-focused interface with regulatory frameworks and audit trails |
| `MultiAudienceRouter` | Route manager for audience-specific navigation and content delivery |

---

## 4. Data Flow Architecture

### Negotiation Flow

```
User Input -> NegotiatePage
  -> sanitiseInput() (defence.ts)
  -> classifyThreatLevel() (defence.ts)
  -> POST /api/negotiate
    -> Build System Prompt (persona + state + market context)
    -> Append Committee Mode (if active)
    -> Build Message History
    -> Claude API Call (claude-opus-4-6)
    -> Parse JSON Response
    -> enforceConstraints() (defence.ts)
      - Price floor enforcement ($22.80 min)
      - Max concession per round (5%)
      - Max total concession (20%)
      - Round progression rules
    -> validateOutput() (defence.ts)
    -> Generate Strategy Explanation
    -> Generate Token Metadata
    -> Return Response
  -> Update UI State (negotiationState, messages, classification, emotion)
  -> Generate Coaching Suggestions
  -> Update Scorecard
```

### Institutional Onboarding Flow

```
User -> InstitutionalPortalPage
  -> InstitutionalOnboardingWizard
    -> Step 1: InstitutionalIdentityForm
       -> Validate entity data
       -> Store in onboarding state
    -> Step 2: InvestorClassificationAssessment
       -> Assess thresholds (net assets, income, AUM)
       -> Determine classification (retail/wholesale/professional/sophisticated)
       -> Check s708 exemption eligibility
    -> Step 3: KYCAMLVerification
       -> Document verification (corporate structure, beneficial ownership)
       -> Sanctions screening
       -> AML risk rating assessment
    -> Step 4: AFSLComplianceReview
       -> Licence requirements check
       -> Exemption status determination
       -> Compliance officer assignment
    -> Step 5: InvestmentPreferencesConfig
       -> Token type selection
       -> Yield mechanism preference
       -> Risk/liquidity/concentration parameters
    -> Step 6: ComplianceConfirmation
       -> Final review
       -> Terms acceptance
  -> onComplete callback with full InstitutionalOnboardingState
  -> PipelineTransition
    -> parseNegotiationUrlParams()
    -> calculateInstitutionalConstraints()
    -> generatePersonalisedWelcome()
    -> Navigate to /negotiate with pre-configuration
```

### Market Data Flow

```
GET /api/market-data?action=<action>
  -> validateApiKey()
  -> checkRateLimit()
  -> Route to handler:
     carbon_pricing -> carbonPricingFeed
     carbon_analytics -> carbonPricingFeed.getAnalytics()
     rwa_market -> rwaMarketFeed
     rwa_analytics -> rwaMarketFeed.getAnalytics()
     market_sentiment -> realTimeDataConnector
     competitive_analysis -> marketIntelligenceSystem
     carbon_projections -> marketIntelligenceSystem
     historical -> carbonPricingFeed.getHistorical()
     feed_status -> realTimeDataConnector.getStatus()
  -> Return JSON with metadata (source, timestamp, requestId)
```

---

## 5. State Management Architecture

### Client-Side State (React)
- **NegotiatePage:** Uses `useState` for all negotiation state including messages, scoring, persona selection, session history, replay state, coaching state, committee configuration
- **InstitutionalPortalPage:** Uses `useState` for onboarding completion state
- **Each Onboarding Step:** Internal `useState` for form fields and validation

### Global State (Zustand)
- **Demo Mode State Manager:** Zustand store for demo mode, including:
  - `isActive`, `currentTour`, `tourStep`
  - `presentationMode` (guided, self-service, investor-briefing)
  - `prePopulatedData` (injected demo datasets)
  - `progress` (completed steps, interactions, session metrics)
  - Actions: `activateDemo()`, `deactivateDemo()`, `startTour()`, `nextStep()`, `previousStep()`, etc.

### Server-Side State
- **In-Memory Rate Limiting:** `Map<string, {count, resetTime}>` per API key
- **Performance Metrics:** `PerformanceMonitor` class with metric history
- **Token Metadata:** `TokenMetadataSystem` with in-memory token store
- **No Database:** All state is ephemeral (resets on Vercel deploy per CLAUDE.md design constraint)
