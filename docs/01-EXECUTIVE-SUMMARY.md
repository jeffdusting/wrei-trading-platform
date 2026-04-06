# WREI Trading Platform -- Executive Summary

**Document Version:** 2.0
**Date:** 2026-04-05
**Classification:** Internal / Partner Distribution
**Platform URL:** https://wrei-trading-platform.vercel.app
**Current Release:** v1.7.0-intelligence-complete

---

## 1. Platform Overview

The WREI Trading Platform is an institutional-grade environmental certificate and carbon credit trading application built by Water Roads Pty Ltd. It provides a complete operational workflow from client onboarding and compliance monitoring through AI-powered price negotiation, procurement automation, settlement facilitation, and market intelligence -- delivered through a Bloomberg Terminal-style professional interface.

The platform supports two operational modes:

1. **WREI Carbon Credit Trading** -- Dual-token system (carbon credits + Asset Co infrastructure tokens) for institutional investors, with AI negotiation, provenance tracking, and Zoniqx settlement infrastructure.
2. **ESC Broker White-Label** -- Energy savings certificate (ESC) trading platform for Australian energy retailers, configurable under broker brands (e.g., Northmore Gordon, Demand Manager) with AI-drafted correspondence, procurement triggers, client reporting, and market intelligence.

## 2. Value Proposition

### For Institutional Investors
- **AI-negotiated pricing** with transparent strategy explanations and real-time coaching
- **Regulatory-compliant onboarding** with AFSL, KYC/AML, and multi-jurisdiction frameworks
- **Institutional-grade analytics** including Monte Carlo simulation, portfolio optimisation, and risk-adjusted returns
- **Professional export capabilities** with PDF, Excel, CSV, and JSON report generation

### For ESC Brokers (White-Label)
- **AI Correspondence Engine** -- automated RFQ generation, inbound offer parsing, counter-offer drafting, trade confirmations
- **Procurement Intelligence** -- forecast-connected timing signals that combine market outlook with compliance urgency
- **Client Intelligence Reports** -- AI-drafted market outlook and recommendations under the broker's brand
- **Market Forecasting** -- Bayesian state-space + ML ensemble model with 4-week to 26-week price forecasts
- **Settlement Facilitation** -- TESSA/VEEC registry transfer instructions and overdue tracking

### For the Carbon Credit Market
- **dMRV verification** providing 78% premium justification over manual verification methods
- **T+0 atomic settlement** via Zoniqx zConnect infrastructure (non-custodial, cross-chain)
- **Dual-token architecture** combining carbon credits (environmental asset) with Asset Co tokens (infrastructure yield)
- **Multi-standard compliance** across ISO 14064-2, Verra VCS, and Gold Standard

### Competitive Differentiation
- Only platform combining AI negotiation with blockchain-verified carbon credits
- Dual-token model providing both environmental and infrastructure-yield exposure
- Integrated market intelligence with Bayesian forecasting and anomaly detection
- Australian regulatory framework expertise (AFSL, AML/CTF, ESS, Digital Assets Framework Bill 2025)

## 3. Key Capabilities

| Capability | Status | Description |
|-----------|--------|-------------|
| AI Negotiation Engine | Implemented | Claude Opus 4.6 with 15 buyer personas, emotional intelligence, committee mode |
| Bloomberg Terminal Interface | Implemented | Professional data-dense UI with 6 consolidated navigation items, market ticker, command bar |
| AI Correspondence Engine | Implemented | RFQ drafting, offer parsing, counter-offer generation, trade confirmations, client reports |
| ESC Market Intelligence | Implemented | Bayesian + ML ensemble forecasting (6-month horizon, penalty-capped), supply/demand analysis, anomaly detection, policy monitoring |
| Price & Volume Charts | Implemented | Recharts ComposedChart with price history, forecast overlay (weekly interpolated), volume bars, CI bands, historical forecast accuracy toggle |
| Procurement Triggers | Implemented | Forecast-connected timing signals with deadline override logic |
| Client Management | Implemented | Entity management, holdings tracking, compliance monitoring, surrender progress |
| Settlement Facilitation | Implemented | TESSA/VEEC registry instructions, overdue follow-up, status tracking |
| White-Label System | Implemented | Broker-branded interface, client intelligence page, configurable branding |
| Institutional Onboarding | Implemented | 6-step wizard: identity, classification, KYC/AML, AFSL, preferences, compliance |
| Investment Calculator | Implemented | Real-time IRR, NPV, cash-on-cash, scenario comparison, risk metrics |
| Regulatory Compliance | Implemented | AFSL, AML/CTF, tax treatment, Digital Assets Framework mapping, ESS compliance |
| Performance Monitoring | Implemented | API metrics, system health, load testing, benchmark tracking |
| Developer Portal | Implemented | API Explorer, v1 REST documentation, Quick Start Guide |
| Scenario Simulation | Implemented | 5 institutional scenarios (DeFi, ESG, Infrastructure, Family Office, Sovereign) |
| Export & Reporting | Implemented | PDF, Excel, CSV, JSON export with 4 report templates |
| Negotiation Coaching | Implemented | Real-time tactical suggestions, scoring, replay, comparison |
| Blockchain Provenance | Implemented | Merkle tree visualisation, vessel provenance cards, immutable chains |
| Live Price Feeds | Implemented | Three-tier fallback (Ecovantage/NMG scraper -> cached -> simulated) with circuit breaker |
| Forecast Performance | Implemented | Rolling accuracy tracking, model drift detection, decision value assessment |
| Client Intelligence Page | Implemented | Public white-labelled market intelligence for scheme participants |

## 4. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Server-side rendering, API routes, 15 page routes |
| Language | TypeScript (strict mode) | Type safety across 100,000+ lines |
| Styling | Tailwind CSS | Utility-first, Bloomberg Terminal design system |
| AI Engine | Anthropic Claude API (Opus 4.6 / Sonnet 4) | Negotiation, correspondence, market intelligence |
| AI Service Router | Custom guard pipeline | Rate-limit, cost guard, timeout per capability |
| Database | PostgreSQL (Vercel Postgres) | Trades, clients, correspondence, pricing, audit logs |
| Forecasting | Python (NumPy, Pandas, XGBoost, SciPy) | Bayesian state-space + ML ensemble price model |
| Charts | Recharts + SVG | Professional data visualisation, fan charts |
| State | React useState/useReducer + Zustand | Client-side state management |
| Deployment | Vercel (hobby plan) | Global CDN, serverless functions, cron jobs |
| Testing | Jest 30 + Playwright | 69 unit/integration suites + 5 E2E test suites |

## 5. Platform Scale

| Metric | Count |
|--------|-------|
| Page routes | 15 |
| API routes | 53 (23 legacy + 29 v1 + 1 cron) |
| React components | 80+ |
| Library modules | 60+ |
| Test suites | 69 active + 5 E2E |
| Test cases | 1,630 (1,623 passing) |
| Python forecasting modules | 15 |
| Buyer/negotiation personas | 15 |
| Tradeable instruments | 8 (ESC, VEEC, PRC, ACCU, LGC, STC, WREI-CC, WREI-ACO) |

## 6. Target Audiences

1. **ESC Brokers** -- Northmore Gordon, Demand Manager, and other certificate brokers seeking white-label trading intelligence
2. **Institutional Investors** -- Infrastructure funds, ESG impact investors, pension funds, family offices, sovereign wealth funds
3. **Obligated Energy Retailers** -- Entities with ESS/VEU surrender obligations seeking procurement assistance
4. **Corporate Compliance Officers** -- Entities needing audit-ready environmental certificates for regulatory compliance
5. **Carbon Trading Desks** -- Professional traders seeking API access and volume pricing
6. **Government Procurement** -- Departmental offset programmes with formal procurement processes
7. **Developers** -- Technical teams evaluating WREI API integration

## 7. Implementation History

| Phase | Name | Key Deliverable | Version |
|-------|------|-----------------|---------|
| P0 | Stabilisation Baseline | Build health, file inventory, security assessment | -- |
| P1 | Multi-Instrument Support | 8 instruments, live data, Bloomberg interface | -- |
| P2 | Live Data Integration | Ecovantage/NMG scrapers, circuit breaker, 3-tier fallback | -- |
| P3 | User Scenarios | Broker white-label, compliance dashboard, bulk ESC | -- |
| P4 | Compliance & Polish | Institutional features, audit trail, regulatory framework | v1.0.0 |
| P5 | Authentication | Client management, API key validation, OAuth prep | -- |
| P6 | Database & Persistence | PostgreSQL schema, query layer, migration system | -- |
| P7 | REST API v1 | 29 versioned endpoints, webhook system, alerts | -- |
| P8 | Market Data Pipeline | Price history, order book, instrument metadata | -- |
| P9 | AI Correspondence Engine | RFQ drafting, email negotiation, settlement, reporting | v1.5.0 |
| P10 | Market Intelligence | Bayesian forecasting, backtesting, ensemble model, monitoring | v1.6.0 |
| P11 | NMG Integration | Data import, shadow market calibration, forecast-connected procurement | v1.7.0 |

**Test Coverage Growth:** 623 tests (P4) -> 1,598 tests (P9) -> 1,630 tests (P11)

## 8. Pricing Model

The WREI Pricing Index is based on live market data:

| Metric | Value | Source |
|--------|-------|--------|
| VCM Spot Reference | $6.34/t USD | EM SOVCM 2025 |
| dMRV Spot Reference | $11.29/t USD | Verified digital MRV |
| Forward Removal | $180/t USD | Sylvera SOCC 2025 |
| dMRV Premium | +78% | Over manual verification |
| WREI Anchor Price | $150/t USD | 1.5x base |
| WREI Price Floor | $120/t USD | 1.2x base (absolute minimum) |
| NSW ESC Spot | ~A$23/ESC | Ecovantage/NMG live feeds |
| ESC Penalty Rate | A$29.48/ESC | ESS regulatory rate |

## 9. Infrastructure Integration

The platform references (but does not live-integrate in demo mode) Zoniqx institutional infrastructure:

- **Zoniqx zConnect** -- T+0 atomic, non-custodial, cross-chain settlement
- **Zoniqx zProtocol** -- DyCIST/ERC-7518 token standard (CertiK-audited)
- **Zoniqx zCompliance** -- AI-powered compliance across 20+ jurisdictions
- **Zoniqx zIdentity** -- KYC/KYB with jurisdiction-based access control

## 10. Future Roadmap

### Near-Term (Q2 2026)
- **P12: Live Deployment** -- End-to-end integration testing, production environment setup, monitoring
- **Auth-gated Client Sections** -- Client-specific position data on the intelligence page behind login
- **Automated Weekly Reports** -- Scheduled intelligence report generation and distribution
- **Forecast Model Recalibration** -- Monthly automated retraining with latest market data

### Mid-Term (Q3-Q4 2026)
- **Live Zoniqx Integration** -- Production connection to zConnect settlement and zCompliance
- **Multi-Scheme Support** -- Extend forecasting to VEEC, ACCU, LGC instruments
- **Mobile Interface** -- Responsive trading interface optimised for mobile brokers
- **Broker Onboarding Portal** -- Self-service white-label configuration and branding
- **Advanced Email Integration** -- IMAP/SMTP connectivity for live correspondence flow
- **Portfolio Optimisation** -- Cross-instrument hedging and procurement scheduling

### Long-Term (2027+)
- **International Expansion** -- EU ETS, UK ETS, California Cap-and-Trade market support
- **Institutional API Marketplace** -- Third-party data feed integration and analytics plugins
- **Regulatory Reporting Automation** -- Direct submission to CER, IPART, AUSTRAC
- **Carbon Credit Tokenisation Production** -- Live WREI-CC and WREI-ACO token issuance
- **AI Agent Autonomy** -- Graduated from human-in-the-loop to supervised autonomous trading
