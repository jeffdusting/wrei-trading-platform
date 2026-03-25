# WREI Trading Platform -- Executive Summary

**Document Version:** 1.0
**Date:** 2026-03-25
**Classification:** Internal / Partner Distribution
**Platform URL:** https://wrei-trading-platform.vercel.app

---

## 1. Platform Overview

The WREI Trading Platform is an institutional-grade carbon credit trading application built by Water Roads Pty Ltd. It demonstrates the full lifecycle of tokenised carbon credit trading -- from investor onboarding and regulatory compliance through AI-powered price negotiation to settlement infrastructure.

The platform serves as both a functional trading demonstration and an investment case showcase for the Water Roads Electric Infrastructure (WREI) dual-token system, encompassing carbon credit tokens and infrastructure-backed Asset Co tokens.

## 2. Value Proposition

### For Institutional Investors
- **AI-negotiated pricing** with transparent strategy explanations and real-time coaching
- **Regulatory-compliant onboarding** with AFSL, KYC/AML, and multi-jurisdiction frameworks
- **Institutional-grade analytics** including Monte Carlo simulation, portfolio optimisation, and risk-adjusted returns
- **Professional export capabilities** with PDF, Excel, CSV, and JSON report generation

### For the Carbon Credit Market
- **dMRV verification** providing 78% premium justification over manual verification methods
- **T+0 atomic settlement** via Zoniqx zConnect infrastructure (non-custodial, cross-chain)
- **Dual-token architecture** combining carbon credits (environmental asset) with Asset Co tokens (infrastructure yield)
- **Multi-standard compliance** across ISO 14064-2, Verra VCS, and Gold Standard

### Competitive Differentiation
- Only platform combining AI negotiation with blockchain-verified carbon credits
- Dual-token model providing both environmental and infrastructure-yield exposure
- Real-world asset backing from operational vessel fleet (88 vessels + 22 Deep Power units)
- Australian regulatory framework expertise (AFSL, AML/CTF, Digital Assets Framework Bill 2025)

## 3. Key Capabilities

| Capability | Status | Description |
|-----------|--------|-------------|
| AI Negotiation Engine | Implemented | Claude Opus 4.6 with 11 buyer personas, emotional intelligence, committee mode |
| Institutional Onboarding | Implemented | 6-step wizard: identity, classification, KYC/AML, AFSL, preferences, compliance |
| Investment Calculator | Implemented | Real-time IRR, NPV, cash-on-cash, scenario comparison, risk metrics |
| Regulatory Compliance | Implemented | AFSL, AML/CTF, tax treatment, Digital Assets Framework mapping |
| Market Intelligence | Implemented | Carbon pricing feeds, RWA market data, competitive analysis, projections |
| Performance Monitoring | Implemented | API metrics, system health, load testing, benchmark tracking |
| Demo Mode System | Implemented | 6 guided tours, presentation modes, pre-populated data injection |
| Developer Portal | Implemented | API Explorer, documentation for 6 endpoints, Quick Start Guide |
| Scenario Simulation | Implemented | 5 institutional scenarios (DeFi, ESG, Infrastructure, Family Office, Sovereign) |
| Export & Reporting | Implemented | PDF, Excel, CSV, JSON export with 4 report templates |
| Negotiation Coaching | Implemented | Real-time tactical suggestions, scoring, replay, comparison |
| Blockchain Provenance | Implemented | Merkle tree visualisation, vessel provenance cards, immutable chains |

## 4. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Server-side rendering, API routes |
| Language | TypeScript (strict mode) | Type safety across 86,000+ lines |
| Styling | Tailwind CSS | Utility-first, responsive design |
| AI Engine | Anthropic Claude API (Opus 4.6) | Negotiation intelligence |
| Charts | Recharts | Professional data visualisation |
| State | React useState/useReducer + Zustand | Client-side state management |
| Deployment | Vercel (hobby plan) | Global CDN, serverless functions |
| Testing | Jest 30 + Playwright | 66 unit/integration + 5 E2E test suites |

## 5. Target Audiences

1. **Institutional Investors** -- Infrastructure funds, ESG impact investors, pension funds, family offices, sovereign wealth funds
2. **Corporate Compliance Officers** -- Entities needing audit-ready carbon offsets for ISSB S2 disclosure
3. **Carbon Trading Desks** -- Professional traders seeking API access and volume pricing
4. **Government Procurement** -- Departmental offset programmes with formal procurement processes
5. **Sustainability Directors** -- Mid-cap companies seeking greenwashing-proof credits
6. **Developers** -- Technical teams evaluating WREI API integration

## 6. Implementation Maturity

The platform has progressed through multiple implementation milestones:

- **Milestone 1.1:** AI Negotiation Enhancement (complete) -- Strategy explanations, coaching, committee mode
- **Milestone 1.2:** Core Investor Journeys (complete) -- 5 institutional scenario simulations
- **Milestone 1.3:** Advanced Analytics (complete) -- Professional financial modelling
- **Milestone 2.1:** Institutional Onboarding Platform (complete) -- 6-step wizard, data feeds
- **Milestone 2.2:** External API Integration (complete) -- 6 API endpoints with documentation
- **Milestone 2.3:** Performance Optimisation (complete) -- Monitoring, caching, benchmarking

**Test Coverage:** 623+ tests across 35 test suites, 100% pass rate.

## 7. Pricing Model

The WREI Pricing Index is based on live market data:

| Metric | Value | Source |
|--------|-------|--------|
| VCM Spot Reference | $8.45/t USD | Xpansiv CBL, ClimateTrade |
| dMRV Spot Reference | $15.20/t USD | Verified digital MRV |
| Forward Removal | $185/t USD | Sylvera SOCC 2025 |
| dMRV Premium | +78% | Over manual verification |
| WREI Anchor Price | $28.12/t USD | 1.85x dMRV premium |
| WREI Price Floor | $22.80/t USD | 1.50x dMRV (absolute minimum) |
| NSW ESC Spot | $47.80/ESC AUD | AEMO trading data |

## 8. Infrastructure Integration

The platform references (but does not live-integrate in demo mode) Zoniqx institutional infrastructure:

- **Zoniqx zConnect** -- T+0 atomic, non-custodial, cross-chain settlement
- **Zoniqx zProtocol** -- DyCIST/ERC-7518 token standard (CertiK-audited)
- **Zoniqx zCompliance** -- AI-powered compliance across 20+ jurisdictions
- **Zoniqx zIdentity** -- KYC/KYB with jurisdiction-based access control
