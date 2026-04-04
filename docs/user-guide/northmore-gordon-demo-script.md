# Northmore Gordon — Demo Script

**Audience:** Northmore Gordon (Sydney ESC/VEEC/LGC/STC/ACCU broker)
**Purpose:** Evaluate WREI as white-label trading infrastructure
**Duration:** ~20 minutes guided + open discussion
**URL:** `https://wrei-trading-platform.vercel.app/?broker=northmore-gordon`

---

## 1. Introduction (2 minutes)

> "We've built a digital trading platform for the Australian environmental certificate market. No one else has done this for ESCs. Here's what it looks like with your branding on it."

**Actions:**

1. Open the platform at the default URL (WREI branding)
2. Append `?broker=northmore-gordon` to the URL
3. Point out the branding changes:
   - Top bar shows "NORTHMORE GORDON" with NG badge in brand green
   - Footer shows "Northmore Gordon | Certificate Trading Platform"
   - "Powered by WREI" attribution visible
   - Command prompt reads `ng@trading:~$`
4. Show the market ticker scrolling with live/simulated ESC, VEEC, ACCU, LGC, STC prices
5. Point out the feed health indicator in the footer — will show "SIMULATED" (grey) or "LIVE" (green) depending on scraper status

**Key message:** "This is your brand, your client relationship. We provide the infrastructure."

---

## 2. ESC Market View (3 minutes)

> "Your clients currently get price data from your weekly updates and phone calls. This gives them real-time visibility."

**Actions:**

1. Navigate to **Trading** (TRD tab)
2. Open the **Instrument Switcher** panel (top-left)
3. Select **ESC** under the Certificates (CRT) tab
4. Point out the order book:
   - ESC midpoint ~A$23.00 (matches current market)
   - Tight bid-ask spread (~A$0.10)
   - Depth visible on both sides
5. Note the ESC-specific metadata:
   - Ticker: ESC
   - Unit: MWh
   - Currency: AUD
   - Registry: TESSA
   - Scheme: NSW ESS
6. Point out penalty rate context: A$29.48 (IPART 2026) — the ceiling buyers won't exceed

**Key message:** "Real-time order book depth for ESCs. Your clients can see where the market is, not wait for a phone call."

---

## 3. AI Negotiation Demo (5 minutes)

> "Your team spends hours on phone and email negotiating ESC trades bilaterally. Watch what happens when we let AI handle it."

**Actions:**

1. In the **Persona Selector** (left panel), select **Mark Donovan — ESC Obligated Entity Buyer** (Origin Energy, 500K ESCs)
2. Click **Start Negotiation**
3. The AI agent opens with an ESC-specific anchor — note:
   - References current spot (~A$23.00)
   - Mentions penalty rate (A$29.48) as pricing context
   - Concise, data-dense format (Bloomberg style)
4. Type a buyer message, e.g.: *"We need 50,000 ESCs for surrender. What's your best price for immediate TESSA transfer?"*
5. Watch the AI respond with:
   - Specific price offer within ESC range (A$18-29.48)
   - Volume discount reference (1% at 50K, 2% at 100K, 3.5% at 500K)
   - TESSA settlement timeline (T+2)
6. Continue for 2-3 rounds to show negotiation dynamics
7. If time permits, show the **Strategy Panel** (click the strategy icon) — this shows the AI's reasoning in real time
8. Show the **Trade Blotter** below — completed trades appear with:
   - Instrument: ESC
   - Price, quantity, direction
   - Settlement status (TESSA transfer steps)

**Key message:** "Every negotiation is recorded, auditable, and compliant. The AI applies consistent pricing logic across all trades — no more human inconsistency."

---

## 4. Bulk Purchase Demo (3 minutes)

> "Now imagine one of your large retailer clients needs 500,000 ESCs before the surrender deadline."

**Actions:**

1. Click the **Bulk Procurement** mode button in the top trade mode selector
2. The **Bulk ESC Procurement** dashboard loads with:
   - Default: 500,000 ESCs target
   - 5 simulated counterparties (EfficientAus, GreenCert NSW, ESC Direct, CarbonTrade, National Energy Services)
   - Buyer controls: max price (A$24.00), min vintage (2025), max per counterparty (200,000)
3. Click **Start Bulk Negotiation**
4. Watch the AI negotiate with each counterparty sequentially:
   - Status cards update: Queued → Negotiating (pulsing blue) → Agreed (green) or Rejected (red)
   - Progress bar fills as volume is accumulated
   - Each counterparty gets 2-5 rounds of negotiation
5. When complete, show the execution report:
   - Total ESCs filled
   - VWAP achieved vs spot (colour-coded: green if below spot)
   - Per-counterparty breakdown

**Key message:** "The AI works the order across multiple counterparties, optimising price and minimising market impact. This replaces days of phone calls with minutes of automated execution."

---

## 5. Compliance & Audit (2 minutes)

> "Every trade, every negotiation turn, every settlement step is recorded."

**Actions:**

1. Navigate to **Compliance** (CMP tab)
2. Show the regulatory dashboard:
   - ESS scheme targets and surrender deadlines
   - Penalty rate reference (A$29.48)
   - Certificate creation volumes and scheme participant data
3. Show the audit trail viewer (if available):
   - Timestamped record of each negotiation round
   - AI reasoning logged for each decision
   - Price constraint enforcement documented

**Key message:** "Auditors can verify every negotiation decision. No 'I think we agreed on $23 over the phone' conversations."

---

## 6. Settlement & Registry (2 minutes)

> "Settlement happens through TESSA — the IPART registry for ESCs."

**Actions:**

1. Navigate back to **Trading** and show a completed trade in the blotter
2. Explain the settlement workflow:
   - Trade Confirmed → Transfer Initiated in TESSA → Transfer Recorded → Settlement Complete
3. Explain the current state:
   - "We've built adapters for TESSA, the CER blockchain registry, and the Victorian VEEC registry"
   - "Today these are simulated — TESSA has no API, so initial settlement uses manual confirmation"
   - "The CER has just launched a blockchain registry built by Trovio with an API-first design. They're actively running an interoperability programme for third-party platforms"
   - "When TESSA gets an API — and it will — we'll be the first platform connected"

**Key message:** "We're not waiting for perfect infrastructure. We ship now with manual settlement, then automate as registries modernise."

---

## 7. White-Label Proposition (2 minutes)

**Actions:**

1. Remove `?broker=northmore-gordon` from the URL → show WREI default branding
2. Re-add `?broker=northmore-gordon` → show Northmore Gordon branding
3. Explain the white-label model:
   - "This runs under your brand. Your clients see your platform, not ours."
   - "You set the fee structure. You manage the client relationships. We provide the infrastructure."
   - "Configuration covers: logo, colours, contact details, footer text, terminal code"
   - "Your internal team gets the full Bloomberg Terminal interface. Your clients get a branded portal."

**Key message:** "Deploy within weeks, brand as your own, set your own pricing."

---

## 8. Discussion (5+ minutes)

### Anticipated Questions and Responses

**"What does it cost?"**
> "We're in early partnership discussions. We're looking for a launch broker partner who shapes the product with us, in exchange for preferential terms. The platform is built — we need a broker who knows the ESC market to validate it in production."

**"Can it handle VEECs?"**
> "Already built. Same interface, Victorian scheme rules, ESC Victoria registry adapter. Select VEEC in the instrument switcher — the pricing, personas, and settlement workflow are all VEEC-specific."

**"What about ACCUs?"**
> "The instrument system supports ACCUs with method-specific pricing (HIR, savanna, energy efficiency, vegetation). The CER has just launched a blockchain registry with third-party API connectivity — we're positioning to be an early integration partner. ACCUs are also financial products, so there are additional AFSL considerations we're scoping."

**"Is it AFSL-compliant?"**
> "ESCs are not financial products under Australian law — IPART is explicit about this. The platform as a matching and negotiation tool likely operates below the AFSL threshold, similar to how other ESC brokers operate today. We're scoping this with Gilbert + Tobin to confirm the regulatory position for the full platform including ACCUs and LGCs."

**"When could we go live?"**
> "White-label deployment within weeks once we agree terms. The platform is live now. Settlement requires manual TESSA confirmation initially — same process you use today, just with a digital audit trail. Live settlement automation depends on TESSA API availability."

**"How accurate is the pricing data?"**
> "The platform aggregates from multiple sources: Ecovantage public pricing, your own published certificate prices, and AEMO data. When live scrapers are running, data is refreshed daily. When scrapers are unavailable, we clearly label the data as 'Simulated' with realistic pricing from our simulation engine. The ESC simulation uses A$23.00 as reference — we calibrate to match published market data."

**"What about my existing clients and workflows?"**
> "The platform doesn't replace your client relationships — it enhances them. Think of it as upgrading from spreadsheets and phone calls to a Bloomberg Terminal, under your brand. Your team still manages client relationships, sets pricing strategy, and approves trades. The AI handles the repetitive bilateral negotiation work."

**"Can the AI be wrong about pricing?"**
> "The AI operates within hard constraints enforced in application code, not in the AI model itself. For ESCs: floor at A$18, ceiling at penalty rate A$29.48, maximum 3% concession per round, 10% total concession. These limits are immutable — the AI cannot override them regardless of what a counterparty says."

---

## Pre-Demo Checklist

- [ ] Verify platform loads at `https://wrei-trading-platform.vercel.app`
- [ ] Verify `?broker=northmore-gordon` activates NG branding
- [ ] Verify ESC instrument selection works
- [ ] Verify ESC order book shows ~A$23 midpoint
- [ ] Verify ESC persona selector includes Mark Donovan
- [ ] Verify `ANTHROPIC_API_KEY` is set in Vercel environment (for live AI negotiation)
- [ ] Verify feed health indicator is visible in footer
- [ ] Verify bulk procurement mode renders with 5 counterparties
- [ ] Test one full negotiation round to confirm API connectivity
- [ ] Have fallback: if API is down, explain the AI component and show the rest of the UI

---

## Technical Notes

- **White-label switching:** URL parameter `?broker=northmore-gordon` or `?broker=demand-manager` or remove for WREI default
- **Environment variable alternative:** Set `NEXT_PUBLIC_WHITE_LABEL_BROKER=northmore-gordon` in Vercel
- **API model:** Claude Opus 4.6 in production, Sonnet 4 in development
- **No database:** All state is in-memory React — demo resets on page refresh
- **Feed status:** Without live scraper credentials, prices show as "SIMULATED" — this is by design and clearly labelled
