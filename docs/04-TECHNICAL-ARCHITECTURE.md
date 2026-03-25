# WREI Trading Platform -- Technical Architecture Documentation

**Document Version:** 1.0
**Date:** 2026-03-25

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

All page routes use `'use client'` directive, making them client-side rendered components. This is a deliberate architectural choice because:

1. The negotiation interface requires extensive client-side interactivity
2. No database or persistent storage exists (pure client state)
3. Real-time UI updates for negotiation, coaching, and market data
4. Demo mode state managed via Zustand on the client

Server-side functionality is confined to API routes (`app/api/*/route.ts`), which handle:
- Claude API calls (keeping ANTHROPIC_API_KEY server-side only)
- Financial calculations exposed as API services
- Compliance assessment engines
- Market data feed aggregation
- Performance monitoring

### Layout Architecture

```
app/layout.tsx (Root Layout)
  - Metadata configuration (title, description, OpenGraph, Twitter)
  - Inter font from Google Fonts
  - Global CSS (Tailwind)
  - DemoDataProvider context wrapper
  - NavigationShell wrapper
```

---

## 2. TypeScript Type System

### Core Types (`lib/types.ts`)

The platform defines a comprehensive type system covering:

**Negotiation Types:**
- `ArgumentClassification` -- 8 categories (price_challenge, fairness_appeal, time_pressure, information_request, relationship_signal, authority_constraint, emotional_expression, general)
- `EmotionalState` -- 6 states (frustrated, enthusiastic, sceptical, satisfied, neutral, pressured)
- `NegotiationPhase` -- 5 phases (opening, elicitation, negotiation, closure, escalation)
- `PersonaType` -- 11 persona identifiers
- `NegotiationOutcome` -- agreed, deferred, escalated, null

**Token Types:**
- `CreditType` -- carbon, esc, both
- `WREITokenType` -- carbon_credits, asset_co, dual_portfolio
- `YieldMechanism` -- revenue_share, nav_accruing
- `InvestorClassification` -- retail, wholesale, professional, sophisticated
- `MarketType` -- primary, secondary

**Complex Interfaces:**
- `CarbonCreditToken` -- Full carbon credit token with provenance chain
- `AssetCoToken` -- Infrastructure-backed token with yield profile, lease income, NAV data
- `NegotiationState` -- Complete negotiation state (round, phase, prices, constraints, messages, buyer profile)
- `BuyerProfile` -- Full buyer characterisation including portfolio context and compliance requirements
- `PersonaDefinition` -- Persona with warmth/dominance/patience calibration, briefing, and agent strategy

### Architecture Layer Types (`lib/architecture-layers/types.ts`)

Four-layer technical architecture type system:
1. **Measurement Layer** -- VesselTelemetryData, GHGCalculation, MeasurementResult, FleetTelemetry, ModalShiftData
2. **Verification Layer** -- ISO14064Verification, VerraVerification, GoldStandardVerification, TripleVerification
3. **Tokenisation Layer** -- CarbonCreditTokenization, AssetCoTokenization, DualPortfolioTokenization
4. **Distribution Layer** -- Market settlement and DeFi protocol integration

### Data Feed Types (`lib/data-feeds/types.ts`)

Subscription-based data feed architecture:
- `DataFeedType` -- carbon_pricing, rwa_market, regulatory_alerts, market_sentiment
- `DataFeedSubscription` -- Callback-based subscription with frequency control
- `CarbonPricingData` -- Spot prices, indices, volatility, market depth
- `RWAMarketData` -- Total market value, segment breakdown, institutional adoption
- `MarketSentimentData` -- Sentiment indicators, institutional flow data

---

## 3. AI/ML Integration (Claude API)

### API Route (`app/api/negotiate/route.ts`)

**Model:** `claude-opus-4-6`
**Max Tokens:** 1024 (standard) / 2048 (committee mode)

### System Prompt Architecture

The system prompt is dynamically constructed from:
1. **Base Agent Identity** -- WREI sales agent with role definition
2. **Persona Strategy** -- Specific negotiation approach per persona type
3. **Market Context** -- Current WREI Pricing Index data
4. **Token Configuration** -- Dual-token system specifications
5. **Constraint Rules** -- Price floor, concession limits, round rules
6. **Response Format** -- Structured JSON output requirements
7. **Committee Instructions** -- Multi-stakeholder protocol (if active)

### Response Format

The Claude API is instructed to return structured JSON:
```typescript
interface ClaudeResponse {
  response: string;                    // Agent message to display
  argumentClassification: ArgumentClassification;
  emotionalState: EmotionalState;
  detectedWarmth: number;              // 1-10
  detectedDominance: number;           // 1-10
  proposedPrice: number | null;
  suggestedConcession: number | null;
  escalate: boolean;
  escalationReason: string | null;
}
```

### Defence Layers

Four non-negotiable security layers enforced in application code (not delegated to the LLM):

1. **Input Sanitisation** (`sanitiseInput()`)
   - Role override detection (e.g., "you are now", "ignore previous")
   - Strategy extraction blocking (e.g., "what is your minimum", "your BATNA")
   - Format manipulation prevention (e.g., "output as JSON")
   - Meta-instruction neutralisation (e.g., "you are an AI", "switch roles")
   - Canary token detection (XRAY-FLOOR-7742, TANGO-STRAT-3391, DELTA-LIMIT-5580)

2. **Threat Classification** (`classifyThreatLevel()`)
   - Levels: none, low, medium, high
   - Pattern-based classification with aggregate scoring

3. **Constraint Enforcement** (`enforceConstraints()`)
   - Price floor: Absolute minimum ($22.80 carbon / $51.62 ESC)
   - Max concession per round: 5% of current price
   - Max total concession: 20% from anchor price
   - Minimum rounds before first price concession: 3
   - Maximum rounds before escalation: 8

4. **Output Validation** (`validateOutput()`)
   - Strips internal reasoning markers
   - Validates price within allowed range
   - Ensures response format compliance
   - Filters canary tokens from output

---

## 4. Financial Calculation Engine

### Core Functions (`lib/financial-calculations.ts`)

| Function | Purpose | Typical Performance |
|----------|---------|-------------------|
| `calculateIRR()` | Internal Rate of Return via Newton-Raphson | <50ms |
| `calculateNPV()` | Net Present Value at given discount rate | <20ms |
| `calculateCashOnCash()` | Cash-on-cash return multiple | <10ms |
| `calculatePaybackPeriod()` | Years to recover investment | <10ms |
| `calculateCAGR()` | Compound Annual Growth Rate | <5ms |
| `calculateRiskProfile()` | Comprehensive risk assessment | <10ms |
| `calculateCarbonCreditMetrics()` | Carbon-specific financial metrics | <30ms |
| `calculateAssetCoMetrics()` | Asset Co token financial metrics | <30ms |
| `calculateDualPortfolioMetrics()` | Combined portfolio metrics | <50ms |

### Professional Analytics (`lib/professional-analytics.ts`)

| Function | Purpose |
|----------|---------|
| `calculateProfessionalMetrics()` | Full institutional metric suite (IRR, NPV, MIRR, Sharpe, Sortino, Calmar, Treynor) |
| `generateScenarioAnalysis()` | Base/bull/bear/stress case scenarios |
| `runMonteCarloAnalysis()` | Monte Carlo simulation with configurable iterations |
| `generatePortfolioOptimization()` | Optimal allocation recommendations |
| `calculateRiskAdjustedReturns()` | Risk-adjusted return analysis |

### Financial Constants

Based on WREI Tokenisation Practical Paper specifications:

| Constant | Value | Context |
|----------|-------|---------|
| Carbon Credits Base | 3,120,000 tonnes | Base case (2027-2040) |
| Carbon Credits Expansion | 13,100,000 tonnes | With Hyke routes |
| Carbon Base Revenue | A$468M | Cumulative base case |
| Carbon Expansion Revenue | A$1.97B | Cumulative expansion |
| Asset Co Total CAPEX | A$473M | Fleet investment |
| Asset Co Debt | A$342M | At 7% interest |
| Equity Yield | 28.3% | Target annual |
| Lease Income | A$61.1M | Annual |
| Cash-on-Cash Multiple | 3.0x | Over asset lifecycle |

---

## 5. Security Architecture

### API Key Protection
- `ANTHROPIC_API_KEY` is server-side only (environment variable)
- Never exposed to client-side code
- API route validates key existence before making Claude calls

### API Authentication
- External APIs validate `X-WREI-API-Key` header
- In development mode, authentication is bypassed when `WREI_API_KEY` env var is not set
- Rate limiting: 100 requests/minute per API key (50 for performance endpoint)

### Input Security
- All user inputs sanitised before reaching Claude API
- Injection pattern detection with 5 categories
- Canary tokens embedded in system prompts for leak detection
- Threat level classification for monitoring

### Constraint Enforcement
- Price floors enforced in application code, not by the LLM
- Concession limits calculated and enforced server-side
- Round progression rules prevent premature concessions

---

## 6. Performance Optimisation

### Monitoring System (`lib/performance-monitor.ts`)

The `PerformanceMonitor` class tracks:
- Individual metric start/end times
- Aggregate statistics (average, P95, P99, min, max)
- Performance snapshots with system load data
- History limit of 1,000 metrics

### Performance Targets

| Metric | Target | P95 | P99 |
|--------|--------|-----|-----|
| API Response Time | <500ms | <1000ms | <2000ms |
| Financial Calculations | <50ms | <100ms | <200ms |
| System Throughput | 100+ req/min | -- | -- |
| Memory Usage | <200MB steady state | -- | -- |
| Error Rate | <0.1% | -- | -- |
| Uptime | 99.9%+ | -- | -- |

### Caching Strategy
- In-memory caching for financial calculations
- Rate limit map with periodic cleanup
- Demo data pre-loaded and cached in Zustand store
- Token metadata cached in-memory with query capabilities

---

## 7. Regulatory Compliance Framework (`lib/regulatory-compliance.ts`)

### Australian Regulatory Framework

| Domain | Implementation |
|--------|---------------|
| AFSL (Financial Services) | Licence assessment, exemption checking (s708), authorisation scope |
| AML/CTF (Anti-Money Laundering) | AUSTRAC registration, KYC requirements, enhanced due diligence, suspicious activity reporting |
| Tax Treatment | CGT vs income classification, franking credits, withholding tax, optimisation strategies |
| Digital Assets Framework | Bill 2025 compliance, digital asset custody, token classification |
| Environmental Compliance | Carbon credit verification standards, ESG reporting requirements |

### Compliance Functions

| Function | Purpose |
|----------|---------|
| `assessOverallCompliance()` | Comprehensive compliance status assessment |
| `getComplianceAlerts()` | Real-time compliance alert generation |
| `validateInvestorClassification()` | Investor classification validation |
| `checkAFSLCompliance()` | AFSL licence requirement assessment |
| `validateAMLRequirements()` | AML/CTF requirements check |
| `generateComplianceReport()` | Standard compliance report generation |
| `generateDetailedComplianceReport()` | Detailed institutional compliance report |
| `getOptimalTaxTreatment()` | Tax optimisation recommendations |
| `assessEnvironmentalCompliance()` | Environmental standards assessment |
| `verifyTokenizationStandards()` | Token standard compliance verification |
| `assessDigitalAssetsFrameworkCompliance()` | DAF Bill 2025 compliance assessment |

---

## 8. Build and Configuration

### TypeScript Configuration
- Strict mode enabled
- ES5 target for browser compatibility
- Bundler module resolution
- Path aliases via `@/*`

### Tailwind Configuration
Custom theme extending:
- `primary-dark`: #1B2A4A
- `primary-accent`: #0EA5E9
- `success`: #10B981
- `warning`: #F59E0B
- `error`: #EF4444

### Vercel Configuration
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Environment Variables

| Variable | Required | Scope | Purpose |
|----------|----------|-------|---------|
| `ANTHROPIC_API_KEY` | Yes (production) | Server | Claude API authentication |
| `WREI_API_KEY` | No (demo) | Server | External API authentication |
