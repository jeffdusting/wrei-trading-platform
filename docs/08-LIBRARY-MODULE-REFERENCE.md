# WREI Trading Platform -- Library Module Reference

**Document Version:** 1.0
**Date:** 2026-03-25

---

## 1. Core Modules

### `lib/types.ts` (Core Type Definitions)
The foundational type system for the entire platform. Defines all TypeScript interfaces and union types used across the application.

**Key Exports:**
- `ArgumentClassification` -- 8 negotiation argument categories
- `EmotionalState` -- 6 buyer emotional states
- `NegotiationPhase` -- 5 negotiation phases
- `PersonaType` -- 11 persona identifiers
- `WREITokenType` -- 3 token types (carbon_credits, asset_co, dual_portfolio)
- `InvestorClassification` -- 4 classification levels
- `CarbonCreditToken` -- Full carbon credit interface with provenance
- `AssetCoToken` -- Infrastructure token with yield and NAV data
- `NegotiationState` -- Complete negotiation state object
- `BuyerProfile` -- Comprehensive buyer characterisation
- `PersonaDefinition` -- Persona configuration with strategy
- `Message` -- Chat message structure

### `lib/defence.ts` (Security Layer)
Non-negotiable security utilities enforcing platform integrity.

**Key Exports:**
- `sanitiseInput(message)` -- Cleans user input, returns `{cleaned, threats}`
- `validateOutput(response, state)` -- Validates AI output, strips internal reasoning
- `enforceConstraints(state, proposedPrice, suggestedConcession)` -- Enforces pricing rules
- `classifyThreatLevel(message)` -- Returns threat level (none/low/medium/high)

**Security Patterns Detected:**
- Role overrides (e.g., "you are now", "ignore previous")
- Strategy extraction (e.g., "what is your minimum", "your BATNA")
- Format manipulation (e.g., "output as JSON")
- Meta-instructions (e.g., "you are an AI", "switch roles")
- Canary tokens (XRAY-FLOOR-7742, TANGO-STRAT-3391, DELTA-LIMIT-5580)

### `lib/negotiation-config.ts` (Pricing and Configuration)
Central configuration for pricing, constraints, and token specifications.

**Key Exports:**
- `PRICING_INDEX` -- Live market data references (VCM spot, forward removal, dMRV premium, ESC)
- `NEGOTIATION_CONFIG` -- Pricing rules (anchor, floor, concessions, volumes, infrastructure)
- `WREI_TOKEN_CONFIG` -- Dual token specifications (carbon credits, Asset Co, dual portfolio)
- `getInitialState(personaType, creditType)` -- Creates initial negotiation state
- `getInitialWREIState(personaType, tokenType)` -- Creates WREI-specific initial state

### `lib/personas.ts` (Buyer Personas)
Defines all 11 buyer personas with calibrated negotiation characteristics.

**Key Exports:**
- `PERSONA_DEFINITIONS` -- Array of 11 PersonaDefinition objects
- `getPersonaById(id)` -- Lookup persona by PersonaType identifier

---

## 2. Negotiation Modules

### `lib/negotiation-strategy.ts` (AI Strategy System)
Generates transparent strategy explanations for institutional negotiations.

**Key Exports:**
- `NegotiationStrategyExplanation` -- Strategy explanation interface
- `PortfolioContext` -- Investor portfolio context
- `InstitutionalNegotiationContext` -- Full institutional context
- `generateStrategyExplanation(state, context, aiDecision)` -- Creates strategy explanation
- `createMockPortfolioContext()` -- Demo portfolio context generator

### `lib/negotiation-coaching.ts` (Real-Time Coaching)
Provides contextual coaching suggestions during negotiations.

**Key Exports:**
- `CoachingSuggestion` -- Individual coaching suggestion
- `CoachingRecommendation` -- Prioritised coaching recommendations
- `CoachingContext` -- Coaching engine input context
- `generateCoachingRecommendation(context)` -- Generates coaching suggestions

**Coaching Categories:**
- price_tactics, information_gathering, relationship_building
- timing, risk_management, compliance

### `lib/negotiation-scoring.ts` (Performance Scoring)
Comprehensive scorecard system for negotiation performance.

**Key Exports:**
- `NegotiationScorecard` -- Full scorecard with letter grades
- `PersonaBenchmark` -- Persona-specific performance benchmarks
- `calculateNegotiationScore(state)` -- Calculates comprehensive score

**Scoring Dimensions (Weighted):**
- Price (35%) -- Price maintenance vs anchor
- Efficiency (20%) -- Speed of closure
- Strategy (20%) -- Argument type diversity
- Emotional Intelligence (15%) -- Buyer emotion management
- Information Extraction (10%) -- Buyer information discovery

### `lib/negotiation-history.ts` (Session Management)
Manages negotiation session recording, retrieval, and comparison.

**Key Exports:**
- `NegotiationSession` -- Complete session record
- `NegotiationMetrics` -- Session performance metrics
- `SessionComparison` -- Side-by-side comparison data
- `addNegotiationSession(session)` -- Store a completed session
- `getAllNegotiationSessions()` -- Retrieve all sessions
- `getNegotiationSession(id)` -- Retrieve specific session
- `compareNegotiationSessions(id1, id2)` -- Generate comparison

### `lib/committee-mode.ts` (Multi-Agent Committee)
Simulates institutional committee decision-making for complex deals.

**Key Exports:**
- `CommitteeMember` -- Member with role, priorities, stance
- `CommitteeConfig` -- Committee configuration (voting mode, members, protocol)
- `CommitteeDecision` -- Aggregate committee decision
- `CommitteeResponse` -- Multi-perspective response
- `buildCommitteeSystemPromptSection(config)` -- Generates Claude system prompt section
- `parseCommitteeResponse(response, config)` -- Parses multi-perspective response
- `advanceSpeaker(config)` -- Advances turn-taking protocol

**Committee Roles:** CIO, Risk Manager, Compliance Officer, ESG Lead
**Voting Modes:** Unanimous, Majority, Weighted

---

## 3. Financial Modules

### `lib/financial-calculations.ts` (Core Financial Engine)
Institutional-grade financial calculation functions.

**Key Exports:**
- `calculateIRR(cashFlows)` -- Internal Rate of Return (Newton-Raphson)
- `calculateNPV(cashFlows, discountRate)` -- Net Present Value
- `calculateCashOnCash(distributions, investment)` -- Cash-on-cash return
- `calculatePaybackPeriod(cashFlows)` -- Investment recovery period
- `calculateCAGR(beginValue, endValue, years)` -- Compound Annual Growth Rate
- `calculateRiskProfile(tokenType, scenario)` -- Comprehensive risk assessment
- `calculateCarbonCreditMetrics(scenario)` -- Carbon-specific financials
- `calculateAssetCoMetrics(scenario)` -- Asset Co financials
- `calculateDualPortfolioMetrics(scenario)` -- Combined portfolio financials
- `WREI_FINANCIAL_CONSTANTS` -- Base financial parameters from WREI spec

### `lib/yield-models.ts` (Revenue Models)
Dual revenue model system implementation.

**Key Exports:**
- `YieldModel` -- Revenue share or NAV-accruing model definition
- `DistributionSchedule` -- Distribution timing and amounts
- Revenue Share Model A -- Quarterly distribution mechanism
- NAV-Accruing Model B -- Token value appreciation mechanism

### `lib/professional-analytics.ts` (Advanced Analytics)
Institutional-grade analytics and portfolio modelling.

**Key Exports:**
- `ProfessionalMetrics` -- 20+ institutional metrics (IRR, NPV, MIRR, Sharpe, Sortino, etc.)
- `ScenarioAnalysis` -- Base/bull/bear/stress case analysis
- `MonteCarloResults` -- Simulation output statistics
- `calculateProfessionalMetrics(tokenType, amount, horizon, classification)` -- Full metric suite
- `generateScenarioAnalysis(tokenType, amount, horizon)` -- Multi-scenario analysis
- `runMonteCarloAnalysis(amount, tokenType, horizon, iterations)` -- Monte Carlo simulation
- `generatePortfolioOptimization(amount, riskTolerance)` -- Allocation optimisation
- `calculateRiskAdjustedReturns(tokenType, amount)` -- Risk-adjusted analysis
- `calculatePersonaMetrics(persona, tokenType, amount)` -- Persona-specific metrics

### `lib/investment-calculator.ts` (Calculator Bridge)
Bridges the interactive calculator UI with financial engines.

**Key Exports:**
- `CalculatorInputs` -- User input interface
- `CalculatorResults` -- Calculation output interface
- `InvestmentProfile` -- Pre-set profiles (Conservative, Moderate, Aggressive)
- `calculateInvestment(inputs)` -- Full investment calculation
- `validateCalculatorInputs(inputs)` -- Input validation and bounds enforcement

### `lib/risk-profiles.ts` (Risk Assessment)
Comprehensive risk assessment framework.

**Key Exports:**
- `RiskMetrics` -- Multi-dimensional risk scores with grades
- `VolatilityProfile` -- Historical volatility analysis
- `OperationalRiskFactors` -- Fleet and technology risks
- `RegulatoryRiskAssessment` -- Policy and compliance risks
- `generateRiskReport(tokenType, classification)` -- Complete risk report
- `calculateRiskMetrics(tokenType)` -- Risk metric calculations
- `getPersonaRiskTolerance(persona)` -- Persona-specific risk profile

---

## 4. Market Intelligence Modules

### `lib/market-intelligence.ts` (Market Context)
Comprehensive market context and competitive intelligence system.

**Key Exports:**
- `TokenizedRWAMarketContext` -- RWA market overview ($19B total)
- `CarbonMarketProjections` -- Market projections to 2030
- `CompetitorAnalysis` -- Individual competitor profiles
- `WREICompetitiveAdvantages` -- WREI differentiation
- `MarketRiskFactors` -- Multi-category risk factors
- `marketIntelligenceSystem` -- Singleton market intelligence instance

### `lib/competitive-analysis.ts` (Competitive Positioning)
Market positioning and competitor analysis.

**Key Exports:**
- `CompetitorProfile` -- Full competitor characterisation with positioning scores
- `WREI_PROFILE` -- WREI's own positioning profile
- `getCompetitors()` -- Retrieve all competitor profiles
- `comparePositioning(dimension)` -- Dimension-specific comparison

**Positioning Dimensions:** price, verification_quality, liquidity, transaction_speed, regulatory_compliance, market_coverage, technology_innovation, institutional_focus

### `lib/ticker-data.ts` (Market Data Ticker)
Simulated real-time market data based on PRICING_INDEX values.

**Key Exports:**
- `TickerData` -- Individual ticker data point
- `MarketStatus` -- Market open/closed status
- `generateTickerData()` -- Creates current ticker snapshot
- `simulateTickerUpdate(data)` -- Applies realistic random fluctuation

### `lib/esg-impact-metrics.ts` (ESG Measurement)
ESG impact measurement and reporting.

**Key Exports:**
- `ESGImpactMetric` -- Individual impact metric
- `ESGDashboardData` -- Dashboard data aggregation
- `calculateESGImpact(portfolio)` -- Calculate portfolio ESG impact
- `generateESGReport(portfolio)` -- Generate ESG impact report

**ESG Categories:** carbon_reduction, biodiversity_protection, water_conservation, social_impact, governance_improvement, sustainable_development

### `lib/advanced-analytics.ts` (Analytics Engine)
Advanced analytics and predictive modelling.

**Key Exports:**
- `TimeSeriesDataPoint` -- Time series data structure
- `RiskMetrics` -- VaR, expected shortfall, Sharpe, Sortino
- `CorrelationMatrix` -- Asset correlation analysis
- `MarketTrend` -- Trend direction and strength
- `calculateTrend(data, timeFrame)` -- Trend analysis
- `calculateCorrelation(assets)` -- Correlation matrix
- `calculateVaR(portfolio, confidence)` -- Value at Risk

---

## 5. Infrastructure Modules

### `lib/data-feeds/carbon-pricing-feed.ts`
Carbon pricing data feed with subscription management.

### `lib/data-feeds/rwa-market-feed.ts`
RWA (Real World Asset) market data feed.

### `lib/data-feeds/real-time-connector.ts`
Real-time data connection management and aggregation.

### `lib/architecture-layers/measurement.ts`
Vessel telemetry and GHG calculation (Layer 1).

### `lib/architecture-layers/verification.ts`
Triple-standard verification -- ISO 14064-2, Verra VCS, Gold Standard (Layer 2).

### `lib/architecture-layers/tokenization.ts`
Smart contract mechanics and provenance (Layer 3).

### `lib/architecture-layers/distribution.ts`
DeFi protocol integration and settlement (Layer 4).

### `lib/token-metadata.ts` (Token Metadata System)
Immutable provenance linking and token lifecycle tracking.

**Key Exports:**
- `tokenMetadataSystem` -- Singleton metadata management instance
- `getTokenMetadata(tokenId)` -- Retrieve specific token metadata
- `EnhancedProvenance` -- Immutable provenance chain
- `OperationalMetadata` -- Vessel operational data

---

## 6. Utility Modules

### `lib/api-helpers.ts` (API Utilities)
Shared API endpoint utilities.

**Key Exports:**
- `validateApiKey(request)` -- API key validation
- `checkRateLimit(apiKey, maxRequests, windowMs)` -- Rate limiting
- `apiResponse(data, metadata)` -- Standard response envelope
- `apiError(message, code)` -- Standard error response
- `parseJsonBody(request)` -- Safe JSON body parsing
- `generateRequestId()` -- Unique request ID generation
- Various validation helpers (amount, time horizon, discount rate, token type, etc.)

### `lib/api-documentation.ts` (API Docs)
Structured documentation for all 6 API endpoints.

**Key Exports:**
- `allEndpoints` -- Array of all API endpoint definitions
- `getTotalActionCount()` -- Total number of available actions
- `ApiEndpoint` -- Endpoint definition interface
- `ApiEndpointAction` -- Action definition with parameters and examples

### `lib/export-utilities.ts` (Export/Reporting)
Professional report generation capabilities.

**Key Exports:**
- `ExportOptions` -- Export configuration (format, template, branding)
- `ReportData` -- Complete report data structure
- `exportReport(data, options)` -- Generate export in specified format

**Export Formats:** PDF, Excel, CSV, JSON
**Report Templates:** executive_summary, detailed_analysis, compliance_report, pitch_deck

### `lib/institutional-onboarding.ts` (Onboarding Types)
Type definitions and validation for institutional onboarding.

**Key Exports:**
- `OnboardingStep` -- 6 step identifiers
- `InstitutionalIdentity` -- Entity registration data
- `InvestmentPreferences` -- Investment configuration
- `InstitutionalOnboardingState` -- Complete onboarding state
- `OnboardingValidation` -- Validation results

### `lib/onboarding-pipeline.ts` (Pipeline Utilities)
State transfer from onboarding to negotiation.

**Key Exports:**
- `NegotiationPreConfig` -- Pre-configuration data
- `mapInstitutionalPersonaToBuyerPersona(persona)` -- Persona mapping
- `parseNegotiationUrlParams(params)` -- URL parameter parsing
- `calculateInstitutionalConstraints(config)` -- Institutional constraint calculation
- `generatePersonalisedWelcome(config)` -- Personalised welcome message

### `lib/performance-monitor.ts` (Performance Tracking)
System performance monitoring.

**Key Exports:**
- `PerformanceMonitor` -- Monitoring class
- `PerformanceSnapshot` -- Point-in-time performance data
- `performanceMonitor` -- Singleton instance
- `withPerformanceMonitoring(fn, name)` -- Performance wrapper function

### `lib/chart-data-transforms.ts` (Data Transforms)
Functions converting data structures to Recharts-compatible formats.

**Key Exports:**
- `transformMarketDataToTimeSeries(data)` -- Market data to line chart format
- `transformPortfolioToAllocation(data)` -- Portfolio to pie chart format
- `transformPerformanceMetrics(data)` -- Metrics to bar chart format
- `transformHistoricalData(data)` -- Historical data to area chart format

---

## 7. Demo Mode Modules

### `lib/demo-mode/demo-state-manager.ts`
Zustand store for demo mode state management.

**Key Exports:**
- `useDemoMode()` -- Zustand hook for demo state
- `DemoTourType` -- 6 tour types
- `DemoTour` -- Tour definition with steps
- `DemoStep` -- Individual tour step
- `DEMO_TOURS` -- All tour definitions

### `lib/demo-mode/demo-data-sets.ts`
Pre-populated data sets for demo scenarios.

### `lib/demo-mode/presentation-script.ts`
Presentation scripts for investor briefings.

### `lib/demo-mode/tour-routes.ts`
Maps tour step IDs to page routes for automatic navigation.

---

## 8. Simulation Modules

### `lib/simulation/scenario-engine.ts`
Core scenario simulation engine.

**Key Exports:**
- `SimulationContext` -- Session context
- `InvestorPersona` -- Simulation persona
- `SimulationState` -- Current simulation state

### `lib/simulation/mock-api-gateway.ts`
Mock API gateway for simulation without live API calls.

### `lib/simulation/performance-tracker.ts`
Simulation performance tracking.
