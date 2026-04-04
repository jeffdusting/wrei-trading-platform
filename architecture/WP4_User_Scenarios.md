# WP4 — User Scenarios

**Document Reference:** WR-WREI-WP4 | **Date:** 4 April 2026
**Purpose:** Define detailed user workflow scenarios for each platform persona, serving as functional specifications for implementation
**Status:** Draft for Jeff's review and approval

---

## 1. Scenario Overview

Five user scenarios cover the platform's primary audiences. Each scenario describes the user's context, what they need to achieve, the exact workflow through the platform, and the data/features required at each step. Scenario A (Investor Demo) is the orchestrated walkthrough that references elements from all other scenarios.

| ID | Persona | Primary Objective | Duration |
|---|---|---|---|
| A | Series A investor | Assess platform maturity and commercial opportunity | 20–30 min guided demo |
| B | ESC broker | Evaluate white-label trading capability for their business | 15–20 min self-directed |
| C | Institutional carbon buyer | Purchase WREI-verified carbon credits via agentic negotiation | 10–15 min trading session |
| D | Compliance officer | Monitor regulatory obligations and trading compliance | 10 min dashboard review |
| E | Bulk ESC purchaser | Execute a large-volume ESC acquisition | 15–20 min negotiation + execution |

---

## 2. Scenario A — Series A Investor Viewing a Live Demo

### 2.1 User Context

An institutional investor (or their analyst) attending a presentation by the Water Roads team. They have read WR-STR-009 and want to see the platform operating. They are evaluating technical maturity, the credibility of the trading infrastructure, and the commercial opportunity. Approximately 20–30 minutes.

### 2.2 Workflow

**Step A1 — Landing Dashboard (2 minutes)**

*Screen:* Bloomberg Terminal landing page with market ticker, key metrics panels, and navigation.

*What the investor sees:*

- Live market ticker scrolling ESC (~$23.00), VEEC (~$83.50), ACCU (by method), LGC (~$5.25), STC (~$39.50), PRC (~$2.85) spot prices. Each price labelled "Live" or "Indicative" depending on source.
- Dashboard headline metrics: total platform volume (cumulative), active sessions, certificates tracked, registry connections status (TESSA: manual | CER: API-ready | Verra: reference).
- Three primary product cards: "ESC Trading" (live, revenue-generating), "Carbon Credit Tokens" (WREI-verified, tokenised), "Asset Co Tokens" (infrastructure ownership).
- Navigation: Dashboard | Trade | Analyse | Compliance | System.

*What the investor should conclude:* This looks and feels like institutional trading infrastructure, not a prototype. The market data is real. The product architecture is clear.

*Data requirements:* Live ESC/VEEC/ACCU/LGC spot prices (scraped or subscription), platform usage metrics (from Vercel Postgres), registry connection status indicators.

---

**Step A2 — ESC Trading Demonstration (5 minutes)**

*Screen:* Trade page with three-panel Bloomberg layout: market data (left), trading interface (centre), position/history (right).

*Presenter action:* Walk through an ESC trade from market analysis to execution.

*What the investor sees:*

- **Left panel — Market Data:** ESC price chart (30-day history), simulated order book showing bid/ask depth at multiple price levels, supply/demand metrics (ESC creation volumes this month, surrender target for current compliance year, implied surplus/deficit).
- **Centre panel — Trade Entry:** Product selector (ESC selected), order type (Market / Limit / AI Negotiation), quantity field, price field (auto-populated from market), counterparty selector (simulated institutional counterparties with risk ratings), "Execute Trade" and "Start AI Negotiation" buttons.
- **Right panel — Position & History:** Current ESC holdings (quantity, average cost, unrealised P&L), trade blotter showing recent trades with timestamps, settlement status indicators (Pending → Confirmed → Settled).

*Presenter demonstrates:* Selects "AI Negotiation" mode, chooses a 50,000 ESC purchase. The AI negotiation agent (Claude Opus 4) engages a simulated institutional seller. The investor watches the negotiation unfold in real time — price offers, counteroffers, rationale, market context citations — converging on an executed price. Trade confirms with a unique ID and appears in the blotter.

*What the investor should conclude:* The agentic negotiation is genuinely sophisticated — it reasons about market context, adapts strategy, and reaches a deal. No other platform offers this. The ESC market has no digital trading infrastructure, and this is it.

*Data requirements:* ESC price history (30 days minimum, scraped/simulated), simulated order book, ESC supply/demand metrics (creation volumes from IPART annual reports, target from ESS legislation), Claude Opus 4 API for live negotiation, Vercel Postgres for trade persistence.

---

**Step A3 — Carbon Credit Tokenisation (5 minutes)**

*Screen:* Trade page switches to "Carbon Credit Tokens" product.

*Presenter action:* Show the tokenised carbon credit trading interface and explain the WREI verification premium.

*What the investor sees:*

- **Token Detail Panel:** A WREI-verified carbon credit token with full metadata: verification standard (ISO 14064-2 + Verra VCS + Gold Standard), generation source (Water Roads Sydney Route — modal shift + vessel efficiency), vintage, provenance chain (vessel telemetry → WREI calculation engine → blockchain verification → token mint), current market price vs. standard VCM spot, WREI premium indicator (1.5×).
- **Token Lifecycle Visualisation:** A flow diagram showing: Operational Data → WREI Verification → Token Mint → Trading → Retirement, with blockchain transaction references at each stage.
- **Market Comparison:** Side-by-side pricing: Standard VCM credit ($X) vs. WREI-verified credit ($X × 1.5), with explanation of the premium drivers (digital MRV, real-time provenance, institutional audit-readiness).

*What the investor should conclude:* The tokenisation architecture is real, the verification methodology is rigorous, and the 1.5× premium is justified by the provenance quality. This is infrastructure that extends beyond Water Roads to any asset generating carbon savings.

*Data requirements:* Token metadata schema (from WP5), WREI verification flow diagram, VCM spot price reference, WREI premium calculation, sample blockchain transaction data (simulated with realistic hashes).

---

**Step A4 — Asset Co Token Overview (3 minutes)**

*Screen:* Trade page switches to "Asset Co Tokens" product.

*Presenter action:* Explain the infrastructure ownership token and dual-token cross-collateralisation concept.

*What the investor sees:*

- **Asset Token Detail:** Fractional interest in the LeaseCo vessel fleet — token metadata showing underlying asset (Candela C-8 electric hydrofoil, serial number, operational route, utilisation rate), yield characteristics (28.3% equity yield from bareboat charter revenue), compliance status (AFSL, ASIC Digital Assets Framework Bill 2025).
- **Yield Dashboard:** Projected yield curve, dividend schedule, comparison to traditional infrastructure yields (toll roads, airports, utilities).
- **Cross-Collateralisation Concept:** Visual showing how asset co tokens can serve as yield-bearing DeFi collateral to fund carbon token exposure — the dual-token portfolio effect.

*What the investor should conclude:* This is a second investable product from the same infrastructure, with a yield profile that competes with traditional infrastructure. The cross-collateralisation concept is novel and defensible.

*Data requirements:* Asset token metadata schema (from WP5), yield projections (from WR-FIN-001), vessel specifications, DeFi collateral flow diagram.

---

**Step A5 — Compliance & Regulatory Dashboard (3 minutes)**

*Screen:* Compliance page.

*Presenter action:* Show the regulatory framework the platform operates within.

*What the investor sees:*

- **Regulatory Status Matrix:** A grid showing each relevant regulatory body (ASIC, AUSTRAC, IPART, CER, Verra, Gold Standard) with status indicators (Engaged | Compliant | In Progress | Pending), key dates, and responsible parties.
- **ESS Compliance View:** Current compliance year targets, ESC surrender deadlines, penalty rates ($29.48 for 2026, source: IPART), scheme participant obligations summary.
- **AFSL Pathway:** Timeline showing AFSL scoping (G+T/KWM engagement), application preparation, anticipated approval, and interim operating arrangements.
- **Audit Trail:** Sample audit log showing timestamped platform activity — trades, negotiations, settlements, user actions — demonstrating regulatory readiness.

*What the investor should conclude:* The team understands the regulatory landscape, has engaged appropriate counsel, and has built compliance into the platform architecture rather than bolting it on.

*Data requirements:* Regulatory body status (manually maintained), ESS penalty rates (from IPART published targets), AFSL timeline (from legal engagement), sample audit log entries (from Vercel Postgres).

---

**Step A6 — Analytics & Market Intelligence (3 minutes)**

*Screen:* Analyse page.

*Presenter action:* Show the platform's analytical capabilities and market intelligence.

*What the investor sees:*

- **Market Overview:** Australian environmental certificate market summary — total market value (A$2.3B+), certificate types with current prices, creation volumes, surrender rates, implied supply/demand balance.
- **AI Market Commentary:** Claude-generated market analysis summarising current ESC market conditions, recent policy developments (ESS Rule Change Review, commercial lighting phase-out), and price outlook.
- **Scenario Analysis:** Interactive tool showing carbon credit revenue projections under different assumptions (carbon price trajectory, network expansion, WREI premium realisation) — drawing from WR-FIN-001 model outputs.
- **Platform Competitive Position:** Visual showing the A$2.3B market with no dominant digital platform, WREI's first-mover position, and the feature comparison from WP2.

*What the investor should conclude:* The market opportunity is real, quantified, and unserved. The platform's analytical capabilities are institutional-grade.

*Data requirements:* Market size data (from WP1 research), AI market commentary (Claude API), scenario analysis parameters (from WR-FIN-001), competitive landscape data (from WP2).

---

**Step A7 — Closing & Portfolio Thesis (2 minutes)**

*Screen:* Return to dashboard or switch to a summary view.

*Presenter verbal:* "Your Water Roads holding subsidises carbon credit monetisation infrastructure for your entire portfolio." Show how WREI verification extends to other portfolio assets generating carbon savings — the platform-as-infrastructure thesis.

*What the investor should conclude:* This is not just a ferry company with a trading platform. This is carbon verification infrastructure that happens to be funded by a ferry operation.

---

### 2.3 Feature Dependencies (Scenario A)

| Feature | Priority | Status (from WP3) | Gap |
|---|---|---|---|
| Bloomberg Terminal UI | Must Have | 85% ready | Missing: order book depth, trade blotter persistence, alert system |
| Live market ticker | Must Have | Architecture exists | Needs live data feed connection |
| ESC price charts | Must Have | Recharts present | Needs historical data source |
| Simulated order book | Must Have | Not present | New feature — simulated CLOB |
| AI negotiation (Claude Opus 4) | Must Have | Production-ready | Minor: settlement trigger integration |
| Trade persistence | Must Have | Not present | Vercel Postgres (2–3 days) |
| Token metadata display | Must Have | Types exist | UI for token detail view |
| Compliance dashboard | Must Have | Page exists, demo data | Needs real regulatory data |
| Analytics dashboard | Must Have | AI analytics engine exists | Needs live market data connection |
| Scenario analysis tool | Should Have | Scenario generation exists | Needs WR-FIN-001 integration |

---

## 3. Scenario B — ESC Broker Evaluating White-Label Capability

### 3.1 User Context

A managing director at an existing ESC brokerage (e.g., Ecovantage, Demand Manager, Northmore Gordon, Trade In Green) evaluating the WREI platform as a potential white-label trading solution for their business. They currently trade ESCs via phone, email, and spreadsheet. They have 15–20 minutes and are self-directed after a brief orientation.

### 3.2 Workflow

**Step B1 — Broker Dashboard (2 minutes)**

*Screen:* Customised landing dashboard branded for the broker's business (white-label demonstration).

*What the broker sees:*

- Their own branding applied to the Bloomberg Terminal interface (logo, colour accent, business name).
- ESC-focused dashboard: current ESC spot price, 30-day price chart, creation volumes this week, next surrender deadline, penalty rate for current compliance year.
- Quick actions: "New ESC Trade," "View Inventory," "Client Positions," "Market Report."
- Client summary: number of active clients, total ESC positions under management, upcoming compliance deadlines per client.

*What the broker should conclude:* This could replace my spreadsheets and phone calls. It's built for my business.

*Data requirements:* White-label theming system (CSS variable overrides), ESC market data, sample client portfolio data.

---

**Step B2 — Client Trade Facilitation (5 minutes)**

*Screen:* Trade page in broker mode — broker is facilitating a trade between their ACP client (seller) and an obligated entity (buyer).

*What the broker sees:*

- **Seller side:** ACP inventory — certificates available by vintage, activity type, and registration status in TESSA.
- **Buyer side:** Obligated entity compliance position — annual target, certificates already surrendered, shortfall, deadline, penalty exposure at current rates.
- **Matching interface:** Broker selects seller inventory, buyer requirement, and either sets a price or initiates AI negotiation to optimise the deal.
- **AI Negotiation:** The agentic negotiator engages on behalf of the buyer, negotiating against the broker's pricing strategy. The broker can set floors, ceilings, and volume constraints.

*What the broker should conclude:* The AI negotiation would let me handle more trades with fewer staff. The compliance position view gives my clients visibility they currently don't have.

*Data requirements:* Sample ACP inventory data, sample obligated entity compliance data (target from ESS legislation, surrender status), AI negotiation in broker-facilitation mode.

---

**Step B3 — Settlement & Registry Workflow (3 minutes)**

*Screen:* Settlement tracking view.

*What the broker sees:*

- Trade confirmation with unique ID, agreed price, volume, counterparties.
- Settlement workflow: Trade Confirmed → TESSA Transfer Initiated → Transfer Recorded → Settlement Complete. Current status shown with timestamps.
- For production: integration with TESSA transfer process (initially manual confirmation, future API when available).
- Invoice generation and payment tracking (buyer pays broker, broker pays ACP, fees deducted).

*What the broker should conclude:* This replaces my manual settlement tracking. When TESSA gets an API, it will be end-to-end automated.

*Data requirements:* Trade settlement state machine, TESSA workflow steps, invoice template.

---

**Step B4 — Reporting & Analytics (3 minutes)**

*Screen:* Broker analytics dashboard.

*What the broker sees:*

- Trading volume report: trades by period, average price achieved, volume by client, revenue and fees earned.
- Market intelligence: ESC creation rates, scheme changes, price trend analysis, AI-generated market commentary.
- Client compliance summary: which clients are on track for annual surrender, which are at risk of penalty, suggested procurement quantities.
- Export capabilities: PDF reports for clients, CSV for accounting, compliance reports for regulatory filing.

*What the broker should conclude:* This gives me market intelligence and client reporting I currently produce manually. The compliance risk view is something I could charge my clients for.

*Data requirements:* Sample trading history, ESC market analytics, compliance calculation engine, report generation (PDF/CSV).

---

**Step B5 — White-Label & Pricing (2 minutes)**

*Screen:* System/admin page showing white-label configuration.

*What the broker sees:*

- Branding configuration: logo upload, primary/accent colours, business name, contact details.
- Pricing configuration: broker fee structure (per-certificate, percentage, or flat fee per trade), markup/markdown on AI negotiation prices.
- Client management: add/remove clients, set client-level trading limits, manage permissions.
- API access: REST API for integration with existing broker systems (CRM, accounting, compliance).

*What the broker should conclude:* I can deploy this for my business within weeks, brand it as my own, and set my own pricing. The API lets me connect it to my existing systems.

*Data requirements:* White-label admin interface, pricing configuration engine, client management module, API documentation.

---

## 4. Scenario C — Institutional Carbon Credit Buyer Using Agentic Negotiation

### 4.1 User Context

A sustainability procurement manager at a large Australian corporate (e.g., BHP, CBA, Woolworths) tasked with acquiring carbon credits to meet voluntary commitments or mandatory Safeguard Mechanism obligations. They need credits with verifiable provenance that satisfy their ESG reporting requirements (ISSB S2, TCFD). They have 10–15 minutes to execute a trade.

### 4.2 Workflow

**Step C1 — Market Research (3 minutes)**

*Screen:* Analyse page filtered to carbon credits.

*What the buyer sees:*

- Carbon credit market overview: ACCU prices by method type (human-induced regeneration, savanna burning, energy efficiency), VCU (Verra) prices, Gold Standard prices.
- WREI-verified credits highlighted with premium indicator and provenance quality score.
- Credit comparison: standard VCM credits vs. WREI-verified credits — side by side showing verification depth, audit trail completeness, and institutional acceptance indicators.
- Filter/search by: standard (ISO 14064-2, Verra, Gold Standard), vintage, project type, co-benefits (SDG alignment, Indigenous co-benefits), price range, volume available.

*What the buyer should conclude:* I can see the full market, understand the quality tiers, and identify the credits that meet my reporting requirements.

---

**Step C2 — Agentic Negotiation (5–7 minutes)**

*Screen:* Trade page with AI Negotiation mode selected.

*What the buyer does:*

1. Selects "WREI Carbon Credit" as the product.
2. Enters parameters: quantity (e.g., 10,000 tonnes CO2e), maximum budget, preferred vintage range, required verification standards, deadline.
3. Selects "AI Negotiation" mode.
4. The Claude Opus 4 negotiation agent engages.

*What the buyer sees during negotiation:*

- **Chat interface:** Real-time conversation between the buyer's AI agent and the platform's seller agent. The buyer can observe but also intervene with instructions ("push harder on price," "accept if below $X," "ask about volume discounts").
- **Negotiation dashboard (alongside chat):** Current offer price, buyer's budget remaining, negotiation round counter, emotional state indicator of counterparty, market reference price for context.
- **Strategy panel:** The AI agent's reasoning is displayed in a side panel — why it made a specific counteroffer, what market data it's referencing, what concession strategy it's pursuing.
- **Defence indicators:** Visual confirmation that the defence layer is active — price floors enforced, no strategy leakage, constraint compliance verified.

*What the buyer should conclude:* The AI agent is genuinely negotiating on my behalf — reasoning about market conditions, adapting its strategy, and achieving a better price than I could through a manual broker process.

---

**Step C3 — Trade Execution & Settlement (2 minutes)**

*Screen:* Trade confirmation overlay.

*What the buyer sees:*

- Trade summary: credit type, quantity, agreed price, total cost, verification standards met, provenance chain summary.
- Settlement pathway: Trade Confirmed → Credit Transfer Initiated → Registry Update → Settlement Complete.
- Provenance certificate: downloadable PDF showing the complete verification chain from operational data through to the buyer's account.
- Compliance integration: option to tag credits against specific reporting obligations (ISSB S2, TCFD, Safeguard Mechanism).

*What the buyer should conclude:* I have an auditable record of this purchase that my ESG team and external auditors will accept.

---

## 5. Scenario D — Compliance Officer Reviewing Regulatory Dashboards

### 5.1 User Context

An internal compliance officer (either within an ESC brokerage, an obligated entity, or the WREI platform's own compliance function) monitoring trading activity, regulatory obligations, and audit readiness. They check the dashboard daily and produce quarterly reports. They have 10 minutes.

### 5.2 Workflow

**Step D1 — Compliance Overview (3 minutes)**

*Screen:* Compliance dashboard — top-level summary.

*What the compliance officer sees:*

- **Regulatory status grid:** ASIC (AFSL status), AUSTRAC (AML/CTF reporting status), IPART/ESS (scheme compliance status), CER (ACCU trading authorisation status) — each with traffic-light indicators and last-reviewed dates.
- **Trading activity summary:** Total trades this period, value traded, number of unique counterparties, average trade size, largest single trade.
- **Alert panel:** Flags for attention — trades exceeding size thresholds, counterparties requiring re-verification, upcoming regulatory deadlines, suspicious activity indicators.
- **Audit readiness score:** A percentage metric showing completeness of audit trail, document availability, and reporting currency.

---

**Step D2 — Scheme Compliance Detail (3 minutes)**

*Screen:* ESS Compliance sub-view.

*What the compliance officer sees:*

- **Surrender tracking (for obligated entity clients):** Each client's annual ESC target, certificates held, certificates surrendered to date, shortfall quantity, penalty exposure in dollars (shortfall × penalty rate), days remaining until surrender deadline.
- **ACP compliance (for certificate provider clients):** Accreditation status, volumetric limits vs. certificates created, audit schedule, any IPART conditions.
- **Scheme changes monitor:** Active and upcoming ESS Rule Change consultations, policy reforms, new activity types, and their impact on trading volumes and pricing.

---

**Step D3 — Audit Trail & Reporting (4 minutes)**

*Screen:* Audit trail viewer and report generator.

*What the compliance officer sees:*

- **Audit trail:** Filterable, searchable log of every platform action — trade initiations, AI negotiation transcripts, trade confirmations, settlement updates, user logins, configuration changes. Each entry timestamped, user-attributed, and immutable.
- **Report generator:** Pre-configured report templates for quarterly compliance review, annual ESS submission support, AUSTRAC suspicious matter reports (SMRs), AFSL breach registers. Export to PDF and CSV.
- **AI negotiation audit:** Specific view showing every AI negotiation session — inputs, agent reasoning, defence layer activations, constraint enforcement actions, and final outcomes. This demonstrates that AI-assisted trades are auditable and compliant.

---

## 6. Scenario E — Institution Making a Bulk ESC Purchase

### 6.1 User Context

A procurement officer at a large electricity retailer (e.g., Origin Energy, AGL, EnergyAustralia) needing to acquire a substantial volume of ESCs (e.g., 500,000+) to meet their annual ESS surrender obligation. They currently source via bilateral contracts with multiple ACPs and brokers. They have 15–20 minutes and are evaluating whether the platform can replace or supplement their existing procurement process.

### 6.2 Workflow

**Step E1 — Market Assessment (3 minutes)**

*Screen:* Trade page with ESC product selected, institutional mode enabled.

*What the purchaser sees:*

- **Market depth view:** Simulated order book showing available ESC volume at each price level — aggregated from multiple ACPs and sellers on the platform. Volume visualisation shows how much is available at spot, at premium, and at discount for large parcels.
- **Supply analysis:** ESC creation rates (weekly/monthly), creation by activity type (commercial lighting declining, heat pumps growing, PIAM&V steady), vintage distribution of available certificates.
- **Historical execution analysis:** How have large-volume ESC purchases historically impacted spot price? What is the estimated market impact of a 500K purchase?
- **Compliance position calculator:** Input annual target, certificates already held, and the tool calculates exact shortfall, penalty exposure at current rates, and break-even price (the price at which purchasing certificates is cheaper than paying the penalty).

---

**Step E2 — Procurement Strategy Selection (2 minutes)**

*Screen:* Trade page — strategy selection overlay.

*What the purchaser sees — three options:*

1. **Direct Market Order:** Execute immediately at current market prices. Platform shows estimated fill price, volume available at that price, and likely slippage for the full volume.
2. **AI-Negotiated Bilateral:** Engage the agentic negotiator to work through the volume across multiple counterparties, optimising for price, vintage quality, and settlement timing. Platform estimates time to complete and expected price improvement vs. market order.
3. **RFQ (Request for Quote):** Broadcast the requirement to qualified sellers on the platform and receive competitive quotes. Platform manages the RFQ process, aggregates responses, and presents ranked options.

*What the purchaser should conclude:* Each strategy has clear trade-offs. The AI negotiation is the most interesting — it can work a large order across multiple counterparties without moving the market as much as a single large order would.

---

**Step E3 — AI-Negotiated Bulk Execution (8–10 minutes)**

*Screen:* Bulk negotiation dashboard — dedicated interface for large-volume trades.

*What the purchaser sees:*

- **Execution progress:** The AI agent is working the 500K ESC order across multiple counterparties simultaneously. A progress dashboard shows total volume filled, average price achieved, number of counterparties engaged, and remaining volume.
- **Per-counterparty view:** Each negotiation is visible as a card showing counterparty name/ID, volume negotiated, price offered, negotiation stage, and estimated completion time.
- **Price optimisation chart:** Real-time visualisation of the blended average price achieved vs. the market reference price, showing the AI agent's price improvement in dollar terms.
- **Buyer controls:** The purchaser can set or adjust constraints at any time — maximum price per certificate, minimum vintage, maximum volume per counterparty, deadline for completion.
- **Compliance check:** Real-time verification that all certificates being negotiated meet the purchaser's ESS compliance requirements (correct scheme, valid vintage, registered in TESSA).

---

**Step E4 — Settlement & Position Update (2 minutes)**

*Screen:* Settlement summary for the bulk purchase.

*What the purchaser sees:*

- **Execution report:** Summary of all trades executed — number of counterparties, volume per counterparty, price per counterparty, blended average price, total cost, fees.
- **VWAP comparison:** Volume-weighted average price achieved vs. market spot price at time of execution, showing the AI negotiation premium/discount.
- **Settlement timeline:** Each trade's settlement status with expected TESSA transfer dates. For a 500K purchase across multiple counterparties, settlements may be staggered.
- **Position update:** Updated ESC holdings showing the new position, compliance gap (if any remaining), and estimated penalty exposure.
- **Export:** Full execution report for internal audit, counterparty confirmation letters, compliance documentation for ESS annual statement.

---

## 7. Cross-Scenario Feature Matrix

The following matrix maps features to scenarios, showing which features are exercised by each persona. This informs implementation priority — features used across multiple scenarios have higher priority.

| Feature | A (Investor) | B (Broker) | C (Carbon Buyer) | D (Compliance) | E (Bulk ESC) | Priority |
|---|---|---|---|---|---|---|
| Bloomberg Terminal UI | ● | ● | ● | ● | ● | Must Have |
| Live market ticker | ● | ● | ● | | ● | Must Have |
| ESC price charts | ● | ● | | | ● | Must Have |
| Simulated order book | ● | | | | ● | Must Have |
| AI negotiation (Opus 4) | ● | ● | ● | | ● | Must Have |
| Trade persistence (Postgres) | ● | ● | ● | ● | ● | Must Have |
| Trade blotter | ● | ● | ● | ● | ● | Must Have |
| Settlement tracking | ● | ● | ● | | ● | Must Have |
| Compliance dashboard | ● | | | ● | | Must Have |
| Audit trail | | | | ● | | Must Have |
| Token metadata display | ● | | ● | | | Must Have |
| White-label theming | | ● | | | | Should Have |
| Broker mode (facilitation) | | ● | | | | Should Have |
| RFQ mechanism | | | | | ● | Should Have |
| Bulk negotiation dashboard | | | | | ● | Should Have |
| Report generation (PDF/CSV) | | ● | | ● | ● | Should Have |
| Client/portfolio management | | ● | | | | Should Have |
| Scenario analysis tool | ● | | | | | Should Have |
| AI market commentary | ● | ● | ● | | | Should Have |
| Command palette | | | | | | Could Have |
| Keyboard shortcuts | | | | | | Could Have |

---

## 8. Persona Definitions (ESC-Specific Additions)

The existing 11 buyer personas in the platform should be retained and extended with the following ESC-specific personas for production trading:

### 8.1 NSW ESC Obligated Entity Buyer

**Role:** Procurement officer at an electricity retailer (e.g., Origin, AGL, EnergyAustralia).

**Objective:** Acquire ESCs at the lowest possible price to meet annual surrender obligations.

**Behaviour:** Highly price-sensitive, volume-focused, deadline-driven (annual surrender). Will push hard on price, especially for large volumes. References penalty rate as their BATNA (best alternative to negotiated agreement) — they will never pay more per certificate than the penalty rate.

**Negotiation parameters:** Budget derived from penalty exposure, target price below penalty rate, minimum vintage requirements, preferred settlement terms (immediate TESSA transfer).

### 8.2 ESC Trading Desk (Institutional)

**Role:** Environmental markets trader at an institutional desk (e.g., Macquarie, CBA, Shell Energy).

**Objective:** Trade ESCs for profit — buy low, sell high, manage inventory.

**Behaviour:** Sophisticated, market-aware, uses technical analysis and market intelligence. Will seek arbitrage opportunities (spot vs. forward, ESC vs. VEEC correlation). Demands fast execution and real-time market data.

**Negotiation parameters:** Tight spreads, volume flexibility, ability to go both long and short, mark-to-market position reporting.

### 8.3 Government Energy Efficiency Buyer

**Role:** Procurement officer at a NSW government agency implementing energy efficiency programmes under the Energy Security Safeguard.

**Objective:** Acquire ESCs to offset energy consumption in government buildings, or to demonstrate compliance with government sustainability targets.

**Behaviour:** Process-oriented, requires formal documentation, values provenance and audit trail. Less price-sensitive than retailers but requires competitive pricing for procurement compliance.

**Negotiation parameters:** Formal RFQ process, requires multiple quotes, standard government payment terms (30 days), comprehensive documentation requirements.

### 8.4 ESC Accredited Certificate Provider (Seller)

**Role:** An ACP seeking to sell registered ESCs created from energy saving activities.

**Objective:** Maximise the sale price of their ESC inventory while managing cash flow timing.

**Behaviour:** Inventory-constrained, cash-flow sensitive, may have forward creation commitments. Prices are influenced by their cost of creation (activity costs, registration fees, audit costs) and their view on future ESC prices.

**Negotiation parameters:** Floor price based on creation cost, preferred volume tranches, payment terms sensitivity, vintage management (prefer to sell older vintages first).

---

## 9. Implementation Notes

### 9.1 Demo Mode vs. Production Mode

All scenarios should work in two modes. **Demo mode** uses simulated data throughout — pre-configured market data, dummy counterparties, instant settlement — suitable for investor presentations and broker evaluations. **Production mode** uses live data feeds (where available), real counterparty accounts, and actual registry integration — suitable for live ESC trading.

The mode switch should be a system configuration, not visible to end users in production. In demo mode, a subtle "DEMONSTRATION" watermark appears in the footer and all trade confirmations are marked "Simulated — Not Executable."

### 9.2 Data Seeding for Demo Mode

Each scenario requires pre-seeded data. The demo mode data set should include the following:

- 30 days of realistic ESC price history (derived from actual market data, ~$22.50–$24.00 range).
- 5 simulated counterparties with varying risk profiles and inventory levels.
- 3 pre-executed trades in the blotter showing settlement progression.
- Compliance data for 2 sample obligated entities (one on track, one at risk of penalty).
- 1 sample WREI carbon credit token with full metadata and provenance chain.
- 1 sample asset co token with yield data.

### 9.3 Scenario A Orchestration Script

For the investor demonstration, a presentation guide should be produced (as a separate document) with the following for each step: exact navigation path, what to click, what to say, anticipated investor questions and prepared responses, and fallback if a live data feed is unavailable.

---

*This document is prepared for Jeff's review and approval. Approved scenarios will form the functional specification for the CC implementation prompt package (WP7).*
