# WP1 — ESC Market & Data Source Audit

**Document Reference:** WR-WREI-WP1 | **Date:** 4 April 2026
**Purpose:** Inform WREI Trading Platform architecture decisions regarding data integration, registry connectivity, and market structure

---

## 1. Executive Summary

**Situation.** The WREI Trading Platform requires live data integration for ESC trading in NSW as the initial monetisation pathway, with architecture readiness for ACCU, VEEC, LGC, and tokenised carbon credit trading.

**Complication.** The Australian environmental certificate market operates as a bilateral OTC market with no centralised exchange and limited public API infrastructure. The key registries (IPART TESSA for ESCs, CER Unit & Certificate Registry for ACCUs) are at different stages of digital maturity, and price data is fragmented across paid subscription services and broker publications.

**Question.** What data is available for live integration, what must be simulated, and what emerging infrastructure (CER interoperability, Trovio CorTenX) should the platform architecture accommodate?

**Answer.** The platform should adopt a three-tier data strategy: (1) scrape or subscribe to publicly available price data from Ecovantage, Northmore Gordon, and CORE Markets for near-real-time ESC/VEEC/ACCU/LGC pricing; (2) design abstracted registry adapters for TESSA (manual/web-based today) and the CER Unit & Certificate Registry (API-first, interoperability programme in progress); and (3) simulate settlement, order book depth, and counterparty activity using realistic parameters derived from actual market data. The CER's CorTenX-based registry and its planned interoperability programme represent a significant near-term integration opportunity for ACCUs that the platform architecture must accommodate.

---

## 2. ESC Market Structure

### 2.1 How ESCs Work

Energy Savings Certificates are tradeable certificates created under the NSW Energy Savings Scheme (ESS), established in 2009 under the Electricity Supply Act 1995. Each ESC represents one notional megawatt hour (MWh) of energy saved. The market operates as follows:

1. **Creation.** Only Accredited Certificate Providers (ACPs) can create ESCs, from recognised energy saving activities for which they are accredited.
2. **Registration.** ESCs are registered in the TESSA registry operated by IPART (the Scheme Regulator). A per-certificate registration fee applies.
3. **Trading.** ESCs are traded bilaterally between counterparties — there is no centralised exchange or standard contract. IPART is explicitly not involved in trading. AFMA Environmental Product Conventions provide reference contract terms.
4. **Transfer.** Buyer and seller record the change of ownership in the TESSA Registry.
5. **Surrender.** Scheme Participants (primarily electricity retailers) surrender ESCs annually to meet individual energy savings targets. Failure to surrender sufficient certificates results in a penalty (the penalty rate is published annually by IPART and effectively sets a price ceiling).

### 2.2 Regulatory Classification — Critical for Platform Design

ESCs themselves are **not** classified as financial products under Australian law. However, IPART's guidance explicitly states that "some trading activities involving ESCs may be considered financial products and require an Australian Financial Services Licence." This distinction is important: the certificates are not regulated, but a platform facilitating their trade may be. ASIC Regulatory Guide 236 provides further guidance.

This means the WREI platform's initial ESC trading capability can operate without an AFSL if structured as a bilateral matching/negotiation service rather than an exchange or market-making facility — aligning with the white-label SaaS to ESC brokers approach identified in the monetisation analysis.

### 2.3 Current Market Conditions (Q1 2026)

The following market data points are drawn from publicly available broker publications:

| Certificate | Recent Spot Price | Trend | Annual Market Size |
|---|---|---|---|
| ESC (NSW) | ~A$22.75–23.10 | Steady; oversupply but held by commercial lighting phase-out expectations | Targets set annually by IPART |
| VEEC (VIC) | ~A$81–84 | Strengthened from mid-$70s; watching 2026-27 creation rates vs lower targets | ~4.4M target for 2026 (down from 7.3M in 2025) |
| ACCU | Variable by method | Compliance-driven (Safeguard Mechanism); spot market active | ~60M active ACCUs in registry |
| LGC | ~A$3–6.75 | Collapsed from $30+ in early 2025; structural oversupply | Surplus growing |
| STC | ~A$39.50–40 | Clearing House surplus dampening prices | Clearing House processing 2–3 weeks |
| PRC (NSW) | ~A$2.75–2.90 | Minor activity; low volumes | Relatively new scheme |

---

## 3. Registry Infrastructure Assessment

### 3.1 TESSA (IPART — ESCs and PRCs)

**Status:** Operational web portal; no public API

TESSA is the online registry for NSW Energy Savings Scheme and Peak Demand Reduction Scheme certificates. Its capabilities include the following:

- **Public access (no login):** View the Registry of Certificates, Accepted Products List, and Published List of ACPs and Accreditations.
- **Registered users:** Register certificates, transfer certificates, surrender certificates, submit applications.
- **User types:** Basic, Customer Admin, Signatory, ACP-specific.

**Integration assessment:** TESSA is a web application with no documented REST API or programmatic access. Integration would require either (a) web scraping of the public registry view (fragile, potentially against ToS), (b) becoming a registered TESSA user and automating the web interface (requires IPART account, potentially against ToS), or (c) establishing a formal partnership with IPART for data feed access. For the platform's initial phase, TESSA data should be treated as reference data obtained periodically rather than a live integration.

**Architecture implication:** Design an abstract `RegistryAdapter` interface that can accommodate future API access when/if IPART modernises TESSA, without depending on it for launch.

### 3.2 CER Unit & Certificate Registry (ACCUs, SMCs)

**Status:** Live since November 2025; API-first design; interoperability programme in progress

This is a highly significant development for the WREI platform. The Clean Energy Regulator launched a new blockchain-based registry in November 2025, built on Trovio's CorTenX technology. Key facts:

- **Technology:** Trovio CorTenX blockchain ledger — scalable, customisable, secure. API-first design with multi-factor authentication.
- **Scope:** Currently holds ACCUs and Safeguard Mechanism credit units (SMCs). Will progressively onboard Renewable Energy Guarantee of Origin (REGO) certificates, Nature Repair Market biodiversity certificates, and potentially other unit types.
- **Scale:** Successfully migrated 177,672,533 active and previously cancelled ACCUs, plus the full transaction history of over 2,000 ANREU accounts.
- **Interoperability programme:** The CER is actively developing connectivity between the registry and external trading platforms. This originated from the Australian Carbon Exchange consultation, which concluded that a government-run exchange was unsuitable — instead, the consensus was for interoperability with CER systems, enabling third-party platforms to connect.
- **Current status of interoperability:** The CER has confirmed it is "continuing consultation with stakeholders" and aims to "refine and build API connectivity between user systems and the registry as supported by legal, technical and security requirements."

**Integration assessment:** This is the highest-priority future integration for the WREI platform. The CER's explicit strategy is to enable third-party trading platforms to connect to the registry — this is precisely what the WREI platform would be. The API-first design of CorTenX means programmatic integration is architecturally intended, even if the specific API specifications are not yet public.

**Architecture implication:** Design the platform's ACCU trading capability around an abstracted registry interface, with the CER CorTenX API as the target production integration. The platform should monitor the CER's interoperability consultation process and consider engaging directly as a potential integration partner.

### 3.3 Trovio CorTenX — Potential Infrastructure Partner

**Status:** Live infrastructure powering the CER registry and UNFCCC Article 6 registry

Trovio is an Australian company (HQ: 25 Bligh Street, Sydney) providing blockchain-based registry infrastructure. Their CorTenX platform is now powering two major global registry systems:

1. **Australian CER Unit & Certificate Registry** — live since November 2025.
2. **UNFCCC Article 6 Registry** — awarded in January 2026 to deliver the core registry infrastructure for Paris Agreement Article 6.2 and 6.4 and the Interoperability Hub.

CorTenX capabilities include registry and sub-registry architecture, inventory management, project offtake management, forwards/futures/options support, and API connectivity to third-party marketplaces.

**Architecture implication:** Trovio/CorTenX represents a potential integration partner alongside (or as an alternative to) Zoniqx for certain registry functions. The WREI platform should design its registry abstraction layer to accommodate both Zoniqx (for tokenisation) and CorTenX (for registry interoperability) without coupling to either. Trovio's Sydney location and role as the CER's technology partner makes direct engagement feasible.

### 3.4 VEEC Registry (Essential Services Commission, Victoria)

**Status:** Separate registry operated by the ESC Victoria; web-based, no public API documented.

Similar constraints to TESSA. The VEEC market is structurally similar to ESCs but operates under Victorian legislation. Integration approach should mirror the ESC strategy — abstracted adapter, periodic data capture, live integration deferred.

---

## 4. Price Data Sources

### 4.1 Available Live or Near-Live Data

| Source | Data Available | Access Model | Update Frequency | API Available |
|---|---|---|---|---|
| **Ecovantage** | ESC, VEEC, LGC, ACCU, STC, PRC spot and forward prices; creation volumes; market commentary | Free (published weekly on website) | Weekly | No (web scrape possible) |
| **Northmore Gordon** | ESC, VEEC, LGC, STC, ACCU live certificate prices | Free (published on website with charts) | Daily | No (web scrape possible) |
| **CORE Markets** | ESC, VEEC, LGC, STC, ACCU, NZU, Verra VCU, Gold Standard prices | Free limited view; paid subscription for full history and analytics | Daily | Likely available to paid subscribers |
| **Demand Manager** | ESC, VEEC, LGC, STC prices; ESC registry data certificate view | Monthly reports; AFSL holder (No. 474395) | Monthly | No |
| **Trade In Green** | ESC, VEEC, LGC, STC buy prices | Published on website | Regularly updated | No |
| **AFMA** | Wholesale environmental certificate prices; Environmental Product Conventions | Paid subscription | Regular | No |

### 4.2 Data Integration Strategy

**Tier 1 — Immediate (scraped/embedded):** Ecovantage and Northmore Gordon publish spot prices that can be captured via web scraping or manual data entry. These provide the core price discovery data for the platform's initial phase.

**Tier 2 — Near-term (subscription):** CORE Markets offers the most comprehensive data platform with free limited access and paid subscriptions for full history and tools. A paid subscription would provide the data depth needed for institutional-grade price charts and analytics.

**Tier 3 — Medium-term (API integration):** The CER's registry interoperability programme, once live, would provide direct ACCU data. For ESCs, formal engagement with IPART or a data partnership with an AFSL-holding broker would be required.

**Simulation requirement:** The following data elements have no public source and must be simulated with realistic parameters for the platform: order book depth, counterparty activity/interest, bid-ask spread dynamics, settlement confirmation flows, historical trade-by-trade data, and intraday price movements.

---

## 5. Zoniqx Architecture Assessment

### 5.1 Zoniqx Product Suite

Zoniqx offers a TPaaS (Tokenisation Platform as a Service) with the following components relevant to WREI:

| Component | Function | WREI Relevance |
|---|---|---|
| **zProtocol (ERC-7518/DyCIST)** | Token standard with built-in compliance, governance, and interoperability | Carbon credit and asset co token standard |
| **z360** | Full lifecycle management platform for tokenised assets | Token issuance, management, retirement |
| **zConnect** | Distribution/interoperability framework connecting to exchanges, custodians, marketplaces | Settlement and liquidity venue connectivity |
| **zCompliance** | Automated compliance verification across 20+ jurisdictions | AFSL, AUSTRAC, AML/CTF compliance |
| **zIdentity** | Blockchain-native KYC/AML credentials | Investor onboarding |
| **zInsights** | Analytics dashboards and on-chain pricing data | Market analytics layer |
| **zPayRails** | Payment infrastructure for token transactions | Settlement payment processing |

### 5.2 Integration Model

Zoniqx operates an enterprise partnership model rather than a self-service API. There are no publicly available API docs, SDK repositories, or developer portals. Integration would require direct commercial engagement.

**Architecture implication:** The platform should define abstract interfaces for tokenisation operations (mint, transfer, retire, verify), settlement (atomic swap, escrow, T+0), compliance (KYC check, jurisdiction validation, transfer restriction), and identity (credential verification, accredited investor check). These interfaces should be designed so that Zoniqx's suite can be plugged in as a provider, but the platform is not dependent on Zoniqx for its initial ESC trading phase.

---

## 6. Competitive Platform Landscape

### 6.1 Australian Platforms

| Platform | Focus | Status | Differentiation |
|---|---|---|---|
| **CORE Markets** | Carbon and renewable energy market data, software, transactions | Operational | Most comprehensive AU environmental market data platform; serves corporates, project developers, brokers |
| **ACX (proposed)** | Australian Carbon Exchange | Shelved — CER consultation concluded exchange model was "unsuitable for the market" | Replaced by interoperability approach |
| **Demand Manager** | ESC/VEEC/LGC/STC trading and advisory | Operational (AFSL holder) | Broker-dealer with registry data access; potential white-label partner or competitor |

### 6.2 Global Platforms (Reference Architecture)

| Platform | Focus | Relevance to WREI |
|---|---|---|
| **Xpansiv/CBL Markets** | Spot environmental commodity exchange (ACCUs, carbon credits, RECs) | Exchange model; WREI strategy references partnership |
| **Toucan Protocol** | On-chain carbon credit bridge (Verra credits tokenised) | Tokenisation architecture reference |
| **KlimaDAO** | On-chain carbon market (bonding, retirement) | DeFi carbon market mechanics |
| **Carbonmark** | Carbon credit marketplace | UI/UX reference for credit browsing/purchasing |
| **Bloomberg Terminal** | Institutional trading interface standard | UI/UX design target |

### 6.3 Platform Gap — WREI's Opportunity

No existing Australian platform combines the following capabilities: ESC/VEEC/ACCU/LGC trading interface with Bloomberg-style institutional UX, agentic AI negotiation for bilateral trades, tokenisation infrastructure for carbon credits and infrastructure assets, registry interoperability readiness (both TESSA and CER CorTenX), and regulatory compliance automation. The A$2.3B+ annual environmental certificate market in Australia has no dominant digital trading platform — the market is served by broker-dealers, spreadsheet-based pricing, and manual TESSA transfers. This is the gap the WREI platform targets.

---

## 7. Architecture Recommendations

### 7.1 Data Layer Design

The platform should implement a **Data Source Abstraction Layer** with the following adapters:

1. **MarketDataAdapter** — interface for price feeds, supporting scrape-based (Ecovantage, Northmore Gordon), subscription-based (CORE Markets), and simulated sources, with a unified internal price feed format.
2. **RegistryAdapter** — interface for registry operations (query holdings, initiate transfer, confirm surrender), with implementations for TESSA (manual/future API), CER CorTenX (API-first, target production integration), and VEEC Registry (manual/future API).
3. **SettlementAdapter** — interface for trade settlement, with implementations for manual bilateral (ESC phase 1), Zoniqx zConnect (tokenised phase), and CorTenX (ACCU registry settlement).
4. **ComplianceAdapter** — interface for regulatory checks, with implementations for AFSL compliance rules, AML/CTF (AUSTRAC) checks, and Zoniqx zCompliance (future integration).

### 7.2 Priority Integration Sequence

1. **Immediate:** Scrape or manually capture ESC/VEEC/ACCU/LGC spot prices from public sources; build simulated order book and settlement flows using realistic parameters.
2. **Short-term (0–3 months):** Establish CORE Markets subscription for comprehensive price data; register TESSA Basic user account for ESC registry access; begin CER interoperability consultation engagement.
3. **Medium-term (3–6 months):** Integrate CER CorTenX API for ACCU trading when interoperability becomes available; evaluate Trovio partnership for registry sub-registry capability.
4. **Long-term (6–12 months):** Engage Zoniqx for tokenisation infrastructure; establish AFSL-compliant trading operations; build live settlement capability.

### 7.3 Key Commercial Engagement Recommendations

The following engagements should commence in parallel with platform development:

1. **CER Interoperability Programme** — register interest as a prospective third-party trading platform. The CER is actively seeking platform partners, and early engagement positions WREI favourably.
2. **Trovio Operating Pty Ltd** — explore CorTenX sub-registry or data partnership. Their Sydney presence (25 Bligh Street) and role powering both the CER and UNFCCC registries makes them a strategically important relationship.
3. **CORE Markets** — evaluate subscription pricing for data feed access. Their platform is the closest to providing the comprehensive market data the WREI platform needs.
4. **IPART** — enquire about TESSA data access for platform integration. Given the market's evolution toward digital trading, IPART may be receptive to platform partnerships.

---

## 8. Risks and Considerations

### 8.1 AFSL Trigger Risk

While ESCs are not financial products, the WREI platform's trading facilitation activities may cross the AFSL threshold depending on how the platform is structured. The distinction between a "matching/negotiation tool" (potentially no AFSL required) and a "marketplace/exchange" (AFSL required) needs legal clarification early. This aligns with the existing recommendation to engage Gilbert + Tobin or King & Wood Mallesons.

### 8.2 Data Reliability

Scraped price data from broker websites is subject to change without notice, may not represent actual executable prices, and carries no SLA. The platform must clearly distinguish between indicative/reference pricing and executable pricing in its UI and documentation.

### 8.3 ESS Scheme Changes

The NSW Energy Savings Scheme is undergoing active reform consultation (ESS Rule Change Review and ESS Policy Reform, both under way). Commercial lighting, which was the largest ESC creation mechanism, has been discontinued. These changes will affect ESC supply/demand dynamics and should be monitored as market intelligence within the platform.

---

*This document is prepared for internal use by Water Roads Pty Ltd to inform platform architecture decisions. Market data cited is drawn from publicly available sources and is indicative only.*
