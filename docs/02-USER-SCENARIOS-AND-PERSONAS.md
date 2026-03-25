# WREI Trading Platform -- User Scenarios and Personas Documentation

**Document Version:** 1.0
**Date:** 2026-03-25

---

## 1. Buyer Personas

The platform provides 11 pre-defined buyer personas across two categories: 5 original carbon credit buyer personas and 6 institutional investor personas. Each persona has calibrated warmth, dominance, and patience attributes that shape the AI negotiation behaviour.

### 1.1 Original Carbon Credit Personas

#### Sarah Chen -- Corporate Compliance Officer
- **Organisation:** AusPower Energy (publicly traded utility, 15,000 employees)
- **Warmth:** 6 | **Dominance:** 7 | **Patience:** 4
- **Motivation:** Meet ISSB S2 compliance deadlines with audit-ready credits
- **Budget:** $130-140/t (capped by board)
- **Volume:** 10,000 tCO2e
- **Key Characteristics:** Time-pressured (6-week deadline), audit-focused, risk-averse
- **Negotiation Strategy:** Lead with compliance alignment, emphasise dMRV verification meets ISSB standards, anchor on regulatory risk cost justification

#### James Hartley -- ESG Fund Portfolio Manager
- **Organisation:** Meridian Sustainable Infrastructure Fund (GBP 8.2B AUM)
- **Warmth:** 8 | **Dominance:** 6 | **Patience:** 7
- **Motivation:** Portfolio decarbonisation with institutional-grade credits
- **Budget:** $150-165/t (flexible for quality)
- **Volume:** 50,000 tCO2e
- **Key Characteristics:** Sophisticated, quality-metric driven, premium-tolerant, committee-based decisions
- **Negotiation Strategy:** Lead with institutional precedents and social proof, deploy relationship-building language, offer portfolio-level reporting

#### Alex Novak -- Carbon Trading Desk Analyst
- **Organisation:** Macquarie Commodities
- **Warmth:** 4 | **Dominance:** 9 | **Patience:** 3
- **Motivation:** Competitive pricing for client order book
- **Budget:** $115-125/t (aggressive)
- **Volume:** 100,000 tCO2e
- **Key Characteristics:** Transactional, volume-focused, aggressive on price, technically savvy
- **Negotiation Strategy:** Match direct communication style, emphasise T+0 settlement and API, defend premium with concrete data, offer volume-tier pricing

#### Priya Sharma -- Sustainability Director (Mid-Cap)
- **Organisation:** GreenBuild Construction (2,000 employees)
- **Warmth:** 8 | **Dominance:** 4 | **Patience:** 6
- **Motivation:** Greenwashing-proof credits for brand protection
- **Budget:** $120-135/t (moderate)
- **Volume:** 5,000 tCO2e
- **Key Characteristics:** Values-driven, first-time buyer, greenwashing-concerned, seeks guidance
- **Negotiation Strategy:** Lead with transparency and blockchain verification, emphasise reputational protection, offer educational support

#### David Thompson -- Government Procurement Officer
- **Organisation:** Department of Climate Change (Commonwealth)
- **Warmth:** 6 | **Dominance:** 5 | **Patience:** 9
- **Motivation:** Compliant procurement within allocated budget
- **Budget:** $130/t (fixed allocation)
- **Volume:** 25,000 tCO2e
- **Key Characteristics:** Process-driven, multi-approval cycle (90 days), documentation-focused
- **Negotiation Strategy:** Provide documentation proactively, offer staged procurement, escalate to human representative early for government terms

### 1.2 Institutional Investor Personas

#### Margaret Richardson -- Infrastructure Fund CIO
- **Organisation:** Macquarie Infrastructure Partners (A$12B AUM)
- **Warmth:** 7 | **Dominance:** 8 | **Patience:** 8
- **Motivation:** Stable 28.3% yields from real asset ownership
- **Budget:** A$50-500M (institutional allocation)
- **Volume:** A$100-200M initial allocation
- **Key Focus:** Infrastructure fundamentals, lease coverage ratios, fleet utilisation, Asset Co tokens
- **Negotiation Strategy:** Focus on NAV-accruing model, reference debt service coverage (60.8% margins), position as core infrastructure holding

#### Dr. Aisha Kowalski -- ESG Impact Investor
- **Organisation:** Generation Investment Management
- **Warmth:** 9 | **Dominance:** 6 | **Patience:** 7
- **Motivation:** Measurable environmental impact with financial returns
- **Key Focus:** SDG alignment, impact measurement, dual-token impact narrative

#### Marcus Chen -- DeFi Yield Farmer
- **Organisation:** Digital Asset Capital Management
- **Warmth:** 5 | **Dominance:** 7 | **Patience:** 3
- **Motivation:** Superior risk-adjusted yields through RWA tokenisation
- **Key Focus:** Yield mechanics, cross-collateral benefits, DeFi protocol integration

#### Victoria Pemberton -- Family Office
- **Organisation:** Pemberton Family Office
- **Warmth:** 8 | **Dominance:** 5 | **Patience:** 8
- **Motivation:** Intergenerational wealth preservation with legacy impact
- **Key Focus:** Tax efficiency, estate planning, long-term value preservation

#### Ambassador Li Wei -- Sovereign Wealth Fund
- **Organisation:** ASEAN Infrastructure Investment Council
- **Warmth:** 6 | **Dominance:** 8 | **Patience:** 9
- **Motivation:** Strategic regional infrastructure exposure
- **Key Focus:** Geopolitical considerations, scale requirements, regulatory alignment

#### Robert O'Sullivan -- Pension Fund
- **Organisation:** Australian Super Industry Fund
- **Warmth:** 6 | **Dominance:** 6 | **Patience:** 7
- **Motivation:** Member return optimisation with ESG compliance
- **Key Focus:** Fiduciary duty, member outcomes, regulatory requirements

### 1.3 Free Play Mode
Users may also select "Free Play" mode, which allows unstructured negotiation without a pre-defined persona. The AI agent will dynamically classify the buyer's behaviour and adapt its strategy accordingly.

---

## 2. User Journey Maps

### 2.1 Investor Pathway (Institutional Onboarding to Negotiation)

```
Step 1: Landing Page (/)
  -> Review platform capabilities, market data, pathways
  -> Select "Institutional Portal" or "Begin Negotiation"

Step 2: Institutional Onboarding (/institutional/portal)
  -> Step 2a: Institutional Identity
     - Entity name, type (fund_manager, family_office, pension_fund, etc.)
     - Jurisdiction, AUM, establishment year, regulatory licence
  -> Step 2b: Investor Classification Assessment
     - Wholesale/professional/sophisticated classification
     - Net assets, gross income, AUM thresholds
     - s708 exemption validation
  -> Step 2c: KYC/AML Verification
     - Corporate structure, beneficial ownership, source of funds
     - Sanctions screening, PEP status
     - Enhanced due diligence for high-risk ratings
  -> Step 2d: AFSL Compliance Review
     - Licence requirements assessment
     - Authorisation scope, compliance officer details
     - Exemption or licensing status
  -> Step 2e: Investment Preferences Configuration
     - Primary token type (carbon_credits, asset_co, dual_portfolio)
     - Yield mechanism preference (revenue_share, nav_accruing)
     - Risk tolerance, liquidity requirements, ESG mandate
     - Ticket size range, concentration limits
  -> Step 2f: Compliance Confirmation
     - Final review of all submitted data
     - Terms acceptance

Step 3: Pipeline Transition (PipelineTransition component)
  -> Generates pre-configuration for negotiation interface
  -> Maps institutional persona to buyer persona
  -> Calculates institutional constraints (adjusted floor, ceiling)
  -> Generates personalised welcome message

Step 4: Negotiation (/negotiate)
  -> Pre-configured with onboarding context
  -> Institutional dashboard active alongside negotiation chat
  -> Coaching panel available for guidance
  -> Strategy explanations visible in real-time
  -> Committee mode available for institutional deals

Step 5: Post-Negotiation
  -> Scorecard with graded performance
  -> Session saved to history for replay/comparison
  -> Export options (PDF, Excel, CSV, JSON)
```

### 2.2 Carbon Trading Pathway (Direct Negotiation)

```
Step 1: Landing Page (/) -> Click "Begin Negotiation"

Step 2: Negotiation Setup (/negotiate)
  -> Select buyer persona (or Free Play)
  -> Select credit type (carbon, ESC, both)
  -> Select WREI token type (carbon_credits, asset_co, dual_portfolio)
  -> View market data ticker

Step 3: Active Negotiation
  -> AI opens with persona-appropriate introduction
  -> Multi-round negotiation with:
     - Argument classification (price_challenge, fairness_appeal, etc.)
     - Emotional state tracking (frustrated, enthusiastic, sceptical, etc.)
     - Phase progression (opening -> elicitation -> negotiation -> closure/escalation)
     - Real-time coaching suggestions
     - Strategy transparency panel
     - Blockchain provenance visualisation

Step 4: Resolution
  -> Agreement reached (with final pricing and terms)
  -> Deferred (buyer needs time/approval)
  -> Escalated (referred to human representative)

Step 5: Analysis
  -> Scorecard (price, efficiency, strategy, emotional intelligence, info extraction)
  -> Replay viewer (step through negotiation history)
  -> Comparison dashboard (compare with previous sessions)
```

### 2.3 Developer Pathway

```
Step 1: Developer Portal (/developer)
  -> Quick Start Guide (API key, first request, integration)
  -> API Explorer (interactive endpoint testing)
  -> 6 documented API endpoints:
     - /api/negotiate (POST) -- Negotiation engine
     - /api/analytics (POST) -- Financial calculations
     - /api/compliance (GET/POST) -- Regulatory reporting
     - /api/market-data (GET) -- Market data feeds
     - /api/metadata (GET) -- Token metadata
     - /api/performance (GET/POST) -- System monitoring
```

### 2.4 Compliance Pathway

```
Step 1: Compliance Page (/compliance)
  -> Regulatory Map (jurisdictional compliance matrix)
  -> Compliance Status Dashboard
  -> AFSL, AML/CTF, tax treatment, Digital Assets Framework

Step 2: Institutional Onboarding (/institutional/portal)
  -> AFSL compliance review step
  -> KYC/AML verification step
```

### 2.5 Demo/Presentation Pathway

```
Step 1: Demo Page (/demo)
  -> Select tour type:
     - Executive Overview (5 min)
     - Investor Deep Dive (15 min)
     - Technical Integration (10 min)
     - Compliance Walkthrough (10 min)
     - Carbon Negotiation (10 min)
     - Portfolio Analytics (10 min)
  -> Select presentation mode:
     - Self-service (solo exploration)
     - Investor Briefing (guided presentation)

Step 2: Tour Progression
  -> Step-by-step guided navigation
  -> Pre-populated data injection via DemoDataProvider
  -> Progress tracking and engagement metrics
  -> Tour overlay with context and highlights
```

---

## 3. Scenario Simulation Descriptions

### 3.1 Infrastructure Fund Discovery (/scenario)
Margaret Richardson (CIO) explores WREI Asset Co tokens for infrastructure portfolio allocation. Covers fleet analysis, yield assessment, and institutional due diligence.

### 3.2 ESG Impact Assessment (/scenario)
Dr. Aisha Kowalski evaluates environmental impact metrics, SDG alignment, and measurable outcomes of WREI carbon credits.

### 3.3 DeFi Yield Farming (/scenario)
Marcus Chen analyses yield mechanics, cross-collateral benefits, and DeFi protocol integration for tokenised carbon assets.

### 3.4 Family Office Legacy (/scenario)
Victoria Pemberton evaluates intergenerational wealth preservation through tax-efficient carbon credit investment.

### 3.5 Sovereign Wealth Fund (/scenario)
Ambassador Li Wei assesses strategic regional infrastructure exposure and scale requirements.

---

## 4. Committee Mode

For institutional deals requiring multi-stakeholder approval, the platform supports committee mode negotiation with four roles:

1. **Chief Investment Officer (CIO)** -- Overall investment strategy and portfolio fit
2. **Risk Manager** -- Risk assessment, volatility analysis, exposure limits
3. **Compliance Officer** -- Regulatory compliance, AFSL, AML/CTF, jurisdictional
4. **ESG Lead** -- Environmental impact, sustainability metrics, SDG alignment

Committee decisions follow configurable voting protocols:
- **Unanimous** -- All members must approve
- **Majority** -- Simple majority required
- **Weighted** -- Votes weighted by role importance

Each member has independent stance options: approve, conditional approve, defer, reject.
