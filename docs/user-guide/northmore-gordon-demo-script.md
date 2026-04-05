# Northmore Gordon — Platform Demonstration Script

**Audience:** Northmore Gordon senior leadership and trading desk
**Purpose:** Demonstrate WREI as white-label trading intelligence infrastructure for NMG's ESC/VEEC brokerage
**Duration:** 45 minutes guided + 15 minutes open discussion
**Platform URL:** `https://wrei-trading-platform.vercel.app`
**NMG Branded URL:** `https://wrei-trading-platform.vercel.app/?broker=nmg`
**Version:** v1.7.0-intelligence-complete
**Date:** April 2026

---

## Pre-Demo Checklist

- [ ] Platform loads at production URL
- [ ] `?broker=nmg` activates Northmore Gordon branding (forest green, NG badge)
- [ ] `ANTHROPIC_API_KEY` is set in Vercel (for live AI negotiation and correspondence)
- [ ] Test one negotiation round to confirm Claude API connectivity
- [ ] Navigate to `/intelligence` — verify forecast panel loads with data
- [ ] Navigate to `/correspondence` — verify procurement dashboard renders
- [ ] Navigate to `/client-intelligence?broker=nmg` — verify white-label page
- [ ] Have backup plan: if Claude API is down, skip live AI sections and explain from UI
- [ ] Browser zoom at 90% for data-dense Bloomberg screens on projector
- [ ] Close all other browser tabs

---

## Demo Flow Overview

| # | Section | Time | Purpose |
|---|---------|------|---------|
| 1 | Opening — The Problem | 3 min | Frame NMG's operational pain |
| 2 | White-Label Brand Identity | 2 min | Show it's their platform |
| 3 | Market Intelligence & Forecasting | 6 min | The data advantage |
| 4 | Client Management & Compliance | 5 min | Portfolio-level visibility |
| 5 | Procurement Intelligence | 5 min | When to buy, for whom, and why |
| 6 | AI Correspondence Engine | 6 min | Automated RFQ and negotiation workflow |
| 7 | AI-Powered Trading | 5 min | Live negotiation demonstration |
| 8 | Client Intelligence Portal | 3 min | Inbound marketing for NMG |
| 9 | Counterfactual Analysis — The Business Case | 5 min | Dollar value of platform intelligence |
| 10 | Compliance & Audit Trail | 3 min | Regulatory readiness |
| 11 | Discussion | 15 min | Q&A and next steps |

---

## Section 1: Opening — The Problem (3 minutes)

**Do not open the platform yet.** Start with conversation.

> "You manage a portfolio of obligated entities — Origin, EnergyAustralia, AGL, Alinta — each with ESS and VEU surrender deadlines, penalty exposure running into the millions, and a market where pricing comes from weekly emails and phone calls.
>
> Today, your team does three things manually that consume most of their time: figuring out when to buy, drafting RFQs to suppliers, and reporting to clients on their position.
>
> We've built a platform that does all three — under your brand, with your client relationships intact. Let me show you what it looks like."

**Key message:** Frame the demo as solving NMG's specific operational problems, not as a technology showcase.

---

## Section 2: White-Label Brand Identity (2 minutes)

**Actions:**

1. Open `https://wrei-trading-platform.vercel.app` — show WREI default branding
2. Append `?broker=nmg` to the URL
3. Point out the changes:
   - Top bar: **NORTHMORE GORDON** with forest-green background and **NG** badge
   - Footer: "© 2026 Northmore Gordon | Certificate Trading Platform"
   - "Powered by WREI" attribution visible
   - Command bar: `ng@trading:~$`
4. Show the market ticker scrolling with live ESC, VEEC, ACCU, LGC, STC prices
5. Point out the data source labels — "Simulated" (grey) or "LIVE" (green) depending on scraper availability

> "This is your brand, your identity, your client relationship. We provide the infrastructure. Everything your clients see comes from Northmore Gordon — not WREI."

**Pause briefly.** Let the branding sink in.

---

## Section 3: Market Intelligence & Forecasting (6 minutes)

**Navigate to:** Intelligence tab (MKT in nav bar) → `/intelligence`

### 3a. Forecast Panel (default tab)

> "No one in the ESC market has a quantitative price forecast. You're about to be the first broker who does."

**Point out on screen:**

1. **ESC Price Forecast fan chart** — shows price trajectory from current (~A$23.85) out to 26 weeks
   - Blue line: point forecast rising to A$27.20 at 6 months
   - Light blue band: 80% confidence interval
   - Lighter band: 95% confidence interval
   - "The model is bullish — A$3.35 upside over six months"

2. **Action badge** (top right) — shows BUY with confidence percentage
   - "The model's recommendation: buy now, with 78% confidence"

3. **Horizon table** below the chart:
   | Horizon | Forecast | 80% CI |
   |---------|----------|--------|
   | 1 week | A$23.85 | A$23.10 — A$24.60 |
   | 4 weeks | A$24.30 | A$22.80 — A$25.80 |
   | 12 weeks | A$25.50 | A$22.00 — A$29.00 |
   | 26 weeks | A$27.20 | A$21.00 — A$33.40 |

4. **Regime probability bar** at the bottom:
   - Surplus 25% | Balanced 55% | Tightening 20%
   - "The market is balanced now, but the model sees tightening supply as increasingly likely"

> "This forecast combines a Bayesian state-space model with a machine learning ensemble — trained on 7 years of ESC market data from IPART, Ecovantage, and your own published pricing. It runs daily."

### 3b. Supply & Demand Tab

Click the **Supply & Demand** tab.

1. Show weekly creation vs surrender volumes
2. Point out the net flow (creation minus surrender)
3. Show activity mix breakdown — which ESC activities are driving creation
4. Note the commercial lighting phase-out impact

> "Commercial lighting exits are removing 22% of creation volume annually. That's the structural driver behind the bullish forecast. Your clients need to understand this."

### 3c. Alerts Tab (brief)

Click **Alerts** tab briefly.

> "The system monitors for anomalies — creation velocity slowdowns, price-to-penalty ceiling approaching, policy consultations. Your team gets alerted before the market moves."

---

## Section 4: Client Management & Compliance (5 minutes)

**Navigate to:** `/clients`

### 4a. Client List

> "Here's your client book."

1. Show the client list on the left:
   - AusGrid Energy (obligated entity)
   - Melbourne Water Corp (obligated entity)
   - Pacific Solar Pty Ltd (ACP — certificate creator)
2. Point out entity types — "You manage both sides of the market: buyers (obligated entities) and sellers (ACPs)"

### 4b. Client Detail — Melbourne Water

Click **Melbourne Water Corp**.

1. Show holdings: 32,000 VEEC + 8,500 ESC
2. Show surrender obligations:
   - **VEU 2025:** Target 50,000, Surrendered 18,000, **Shortfall 32,000** — Deadline **April 30** (25 days)
   - **ESS 2025:** Target 15,000, Surrendered 6,500, **Shortfall 8,500** — Deadline June 30
3. Show penalty exposure: **A$4,090,580**
4. Show recent trades: 12,000 VEEC bought April 1 @ A$58.50

> "Melbourne Water has A$4.1 million in penalty exposure across two schemes, and the VEU deadline is 25 days away. This is the kind of situation where timing intelligence is worth real money."

### 4c. Compliance Overview

Click **Back** to return to the client list. Show the compliance overview at the bottom — all clients' positions at a glance.

> "At a glance: who's covered, who's exposed, and how much is at stake. Your morning starts here."

---

## Section 5: Procurement Intelligence (5 minutes)

**Navigate to:** `/correspondence` (Procurement tab is the default)

> "This is where the forecast meets the real world. The platform scans every client's compliance position, checks the price forecast, and tells you exactly what to do."

### 5a. Summary Cards

Point out the four summary cards at the top:
- **Clients at Risk:** 3
- **Total Shortfall:** 1,070,000 certificates
- **Penalty Exposure:** A$42M+
- **Drafts Pending:** (count of AI-drafted RFQs awaiting review)

### 5b. Procurement Recommendations Table

Walk through the table row by row:

1. **EnergyAustralia — RED — 22 days — BUY NOW DEADLINE**
   > "800,000 ESC shortfall with 22 days to deadline. The forecast says prices are rising, but that's irrelevant — deadline pressure overrides market timing. The system labels this 'BUY NOW DEADLINE'. This client needs certificates today."

2. **Alinta Energy — RED — 15 days — BUY NOW DEADLINE**
   > "120,000 VEEC shortfall, 15 days. A$14.4 million penalty exposure at A$120 per certificate. The VEEC penalty rate is brutal — there's no waiting here."

3. **Origin Energy — AMBER — 45 days — BUY NOW**
   > "50,000 ESC shortfall with 45 days. The timing signal says 'BUY NOW' — not because of deadline pressure, but because the forecast shows prices rising A$1.20 in the next 4 weeks. Buy today, save your client money."

4. **AGL Energy — GREEN — 120 days — CONSIDER**
   > "100,000 ESC shortfall but 120 days of runway. The forecast is bullish, so the signal is 'CONSIDER' — good price, but no urgency. Schedule this for next month."

### 5c. Explain the Timing Logic

> "Five signals: BUY NOW means the forecast is up. WAIT means it's softening. MARKET means fair value. But — and this is critical — if the deadline is less than 30 days and the client is RED, the system overrides WAIT with BUY NOW DEADLINE. Compliance always trumps market timing."

**Hover over** the timing badges to show the tooltip explanations.

---

## Section 6: AI Correspondence Engine (6 minutes)

> "You've identified the need. Now let's generate the RFQs."

### 6a. Generate RFQs

1. On the EnergyAustralia row, click **Generate RFQs**
2. The button shows "Generating..." briefly
3. Point out the **Drafts Pending** count incrementing

> "The AI just drafted RFQ emails for EnergyAustralia's 800,000 ESC shortfall — one for each counterparty in your seller network. Each email is calibrated to the market conditions: because prices are rising, the tone conveys urgency and willingness to transact quickly."

### 6b. Draft Review

Click the **Drafts** tab (shows badge count).

1. Show a drafted RFQ email:
   - Professional tone, Australian business conventions
   - Instrument, quantity, compliance year specified
   - Settlement: T+2 registry transfer requested
   - Vintage availability requested
   - No end-client named (broker confidentiality maintained)

2. Show the three-button workflow: **Approve** / **Edit** / **Reject**

> "Every draft goes through broker review. The AI writes it; your team approves it. No email leaves without human sign-off."

### 6c. Negotiations Tab (brief)

Click the **Negotiations** tab.

> "When counterparties respond, the platform parses their offers — extracts price, quantity, vintage, terms — and drafts counter-offers within your pricing constraints. If the AI's confidence in parsing is below 70%, it flags for manual review."

### 6d. Reports Tab

Click the **Reports** tab.

> "Client position reports are generated with AI-drafted market outlook and recommended actions — under your brand. Each report includes current holdings, surrender progress, and specific procurement recommendations based on the forecast."

> "For Melbourne Water, the report would say: 'Based on our bullish price outlook and your 25-day VEU deadline, we recommend procuring 32,000 VEECs immediately at current market levels.'"

---

## Section 7: AI-Powered Trading (5 minutes)

**Navigate to:** `/trade`

> "Now let's see the AI negotiate in real time."

### 7a. Setup

1. Select **ESC** in the instrument switcher
2. Select an appropriate persona (e.g., **Mark Donovan — ESC Obligated Entity Buyer**)
3. Click **Start Negotiation**

### 7b. Live Negotiation

1. The AI opens with an ESC-specific anchor:
   - References current spot (~A$23)
   - Mentions penalty rate (A$29.48) as pricing ceiling
   - Bloomberg-style data-dense format

2. Type a buyer message:
   > "We need 50,000 ESCs for Q2 surrender. What's your best price for immediate TESSA transfer?"

3. Watch the AI respond with:
   - Specific price offer within ESC range
   - TESSA settlement T+2 reference
   - Volume context

4. Continue 2-3 rounds — show the AI making calibrated concessions

5. **Point out the strategy panel** (if visible) — shows AI reasoning

> "Every negotiation round is constrained in application code — price floor, maximum 5% concession per round, 20% total concession from anchor. The AI can't give away the farm, no matter how persuasive the buyer."

### 7c. Bulk Mode (if time permits)

1. Switch to **Bulk Procurement** mode
2. Show 5 simulated counterparties
3. Start bulk negotiation — AI works the order across all counterparties

> "For large orders, the AI negotiates with multiple counterparties simultaneously, optimising VWAP. This replaces days of phone calls."

---

## Section 8: Client Intelligence Portal (3 minutes)

**Open new tab:** `/client-intelligence?broker=nmg`

> "This is your public-facing page — the one your clients and prospects see."

**Point out:**

1. **Northmore Gordon branding** — forest green header, NG badge, brand throughout
2. **3-Month Outlook card** — direction arrow (up/flat/down), price range
3. **Current ESC Spot** — A$23.85
4. **Model Confidence** — percentage with progress bar
5. **Supply & Demand Balance** — creation/surrender volumes, net flow, surplus runway
6. **Activity mix bar** — which ESC activities are driving the market
7. **Compliance Calendar** — Q2 surrender June 30, Annual report September 30
8. **Policy Tracker** — ESS Rule Change 2026, IPART review, commercial lighting phase-out
9. **Price Forecast table** — all horizons with direction indicators
10. **Contact CTA** — "info@northmoregordon.com" and "1300 854 561"

> "This page requires no login. Scheme participants searching for ESC market intelligence find this page under your brand. It's your inbound marketing tool — positions NMG as the market authority."

> "The data is the same as what your trading desk sees. Transparency builds trust."

---

## Section 9: Counterfactual Analysis — The Business Case (5 minutes)

**Navigate back to:** `/intelligence` → click **Trade Analysis** tab

> "Here's the bottom line. We took NMG's historical trade data — 256 trades across 2024 and 2025 — and asked: what would have happened if you'd had this forecast?"

**Point out on screen:**

1. **Headline metrics:**
   - 256 trades analysed
   - 847,500 certificates
   - A$6.18M total traded value
   - **A$142,680 counterfactual improvement (+2.31%)**

2. **Trade-by-trade analysis table** — shows each trade with:
   - Actual price vs model forecast
   - Model recommendation (BUY / HOLD / SELL)
   - Whether following the model would have improved outcome
   - Dollar value of the improvement

3. **Key insight:**
   > "The model agreed with 38% of your historical trades — meaning 62% of the time, better timing was available. On A$6.18 million of trades, that's A$142,000 in captured value. Scale that to your full annual volume of A$24 million — you're looking at A$500,000+ per year in improved execution."

4. **Walk through a specific trade:**
   > "March 2024: NMG sold 10,000 ESCs at A$6.45. The model said HOLD. Price rose to A$7.65 within 12 weeks. That's A$12,000 left on the table on a single trade."

> "This isn't theoretical. This is your data, your trades, your money. The platform would have generated an additional half a million dollars annually in execution improvement."

---

## Section 10: Compliance & Audit Trail (3 minutes)

**Navigate to:** `/compliance`

1. Show the **Regulatory Status Grid:**
   - **ASIC** — Digital Assets AFSL: In Progress
   - **AUSTRAC** — AML/CTF: Compliant
   - **IPART** — ESS Participant: Compliant
   - **CER** — ACCU Trading: Pending

2. Show the **Audit Trail Viewer:**
   - Every negotiation round logged
   - Every correspondence draft and approval tracked
   - Every settlement instruction recorded
   - CSV export for regulators

> "Every action on the platform is auditable. When IPART asks how a trade was priced, you don't search through emails — you pull the audit log. When a compliance officer reviews your ESS position, the data is here."

---

## Section 11: Discussion (15 minutes)

### Anticipated Questions

**"What does it cost?"**
> "We're seeking a launch broker partner to validate the platform in production. The commercial model is SaaS — monthly platform fee plus per-trade execution fee. For a launch partner, we offer preferential terms in exchange for market feedback and co-development input."

**"How accurate is the forecast?"**
> "The ensemble model achieves 3.6% MAPE on 4-week forecasts and 62% directional accuracy — consistently better than random walk. We track performance in real-time on the Performance tab. If the model drifts, we know within 4 weeks and recalibrate."

**"Can it handle VEECs?"**
> "Already built. Select VEEC in the instrument switcher — the pricing, personas, and settlement workflow are all VEEC-specific. The forecast model is currently ESC-only; VEEC forecasting is on the roadmap for Q3."

**"What about ACCUs?"**
> "The instrument system supports ACCUs. The CER has launched a blockchain registry with API connectivity — we're positioning for early integration. ACCUs may require AFSL considerations we're scoping with Gilbert + Tobin."

**"Is it AFSL-compliant?"**
> "ESCs are not financial products under Australian law — IPART is explicit. The platform operates below the AFSL threshold for ESC/VEEC brokerage. For ACCUs and LGCs, we're seeking formal legal advice. The platform architecture supports AFSL-grade compliance if needed."

**"When could we go live?"**
> "White-label deployment within weeks. The platform is live now. Settlement uses manual TESSA confirmation initially — same process you use today, with a digital audit trail. We automate registry settlement as APIs become available."

**"How does the AI handle pricing constraints?"**
> "All constraints are enforced in application code — not in the AI model. For ESCs: floor at market reference, ceiling at penalty rate A$29.48, maximum 5% concession per round, 20% total concession. These are immutable. The AI cannot override them."

**"What about data security?"**
> "The Anthropic API key is server-side only — never exposed to the browser. Client data is in PostgreSQL with role-based access. All AI calls go through a guard pipeline: rate limiting, cost budgets, and timeouts. The audit log is append-only."

**"Can our clients see the intelligence data?"**
> "Yes — the Client Intelligence page at `/client-intelligence?broker=nmg` is public. Market data and forecasts are visible without login. Client-specific position data would require authentication in production."

**"What if the AI is wrong?"**
> "The forecast model has a published error rate (3.6% MAPE) and real-time performance tracking. The Performance tab shows predicted vs actual every week. If the model is consistently wrong, a drift alert fires. The platform is designed for human-in-the-loop operation — the AI recommends, your team decides."

---

## Demo Summary — Leave-Behind Points

1. **Market intelligence advantage** — NMG becomes the only ESC broker with quantitative price forecasting
2. **Operational efficiency** — AI-drafted correspondence replaces hours of manual RFQ work
3. **Procurement timing** — Forecast-connected signals optimise when to buy for each client
4. **Quantified value** — A$142K improvement on historical trades; A$500K+ projected annually at scale
5. **Client retention** — White-labelled intelligence portal positions NMG as market authority
6. **Regulatory readiness** — Append-only audit trail, constraint enforcement, full compliance logging
7. **Speed to market** — White-label deployment in weeks, not months

---

## Technical Notes

- **White-label URL:** `?broker=nmg` or `?broker=northmore-gordon` (both work)
- **Environment variable:** `NEXT_PUBLIC_WHITE_LABEL_BROKER=northmore-gordon`
- **AI models:** Claude Opus 4.6 for negotiation, Sonnet 4 for correspondence (production)
- **Database:** PostgreSQL (Vercel Postgres) — persistent across sessions
- **Forecast pipeline:** Python (Bayesian state-space + XGBoost ensemble) — runs daily via cron
- **Data sources:** Ecovantage, Northmore Gordon published prices, IPART, TESSA
- **Feed fallback:** Live scraper → cached → simulated (clearly labelled)
