# WREI Trading Platform — Overview

**Document Reference:** WR-UG-001 | **Version:** 1.0 | **Date:** 5 April 2026
**Purpose:** Platform overview for new users, investors, and evaluators
**Audience:** All platform stakeholders

---

## 1. What the Platform Is

1.1. The WREI Trading Platform is institutional-grade infrastructure for trading Australian environmental certificates and blockchain-verified carbon credit tokens. It runs on Next.js 14 with a Bloomberg Terminal-style interface, uses Claude API (Opus 4.6 in production) for agentic negotiation, and deploys on Vercel.

1.2. It is not a prototype. The platform handles live ESC market data, executes AI-negotiated trades with full audit trails, and enforces regulatory constraints in application code rather than delegating them to the AI. Defence layers — price floors, concession limits, input sanitisation, output filtering — are hard-coded, not suggested.

1.3. In demo mode, simulated data replaces live feeds without changing the interface or workflow. A subtle "DEMONSTRATION" watermark appears in the footer. All trade confirmations are marked "Simulated — Not Executable."

---

## 2. Tradeable Instruments

The platform supports eight instruments across three categories.

### 2.1. Australian Environmental Certificates

The following six instruments are regulated certificates under Australian state and federal schemes.

2.1.1. **ESC** — Energy Savings Certificate. Created under the NSW Energy Security Safeguard (ESS), administered by IPART. Current spot approximately A$47.80. Settlement via TESSA registry transfer.

2.1.2. **VEEC** — Victorian Energy Efficiency Certificate. Created under the Victorian Energy Upgrades (VEU) programme. Current spot approximately A$83.50.

2.1.3. **PRC** — Peak Reduction Certificate. Created under the NSW Peak Demand Reduction Scheme (PDRS), also administered by IPART. Current spot approximately A$2.85.

2.1.4. **ACCU** — Australian Carbon Credit Unit. Issued under the Emissions Reduction Fund (ERF) by the Clean Energy Regulator. Priced by method type (human-induced regeneration, savanna burning, energy efficiency). Current spot approximately A$35.00.

2.1.5. **LGC** — Large-scale Generation Certificate. Part of the Renewable Energy Target (RET). Current spot approximately A$5.25.

2.1.6. **STC** — Small-scale Technology Certificate. Part of the Small-scale Renewable Energy Scheme (SRES). Current spot approximately A$39.50.

### 2.2. WREI Carbon Credit Tokens (WREI-CC)

2.2.1. Blockchain-native carbon credits verified against ISO 14064-2, Verra VCS, and Gold Standard. Generated from Water Roads operational data — vessel efficiency, modal shift, and construction avoidance.

2.2.2. Each token carries a complete provenance chain: vessel telemetry, WREI calculation engine, blockchain verification, token mint. The verification depth justifies a 1.5x premium over standard VCM credits.

2.2.3. Token standard is ERC-7518 (DyCIST), CertiK-audited. Settlement is T+0, on-chain.

### 2.3. WREI Asset Co Tokens (WREI-ACO)

2.3.1. Fractional ownership tokens representing equity in the LeaseCo vessel fleet — 88 Candela C-8 electric hydrofoils plus 22 Deep Power charging units.

2.3.2. Yield profile: 28.3% equity yield from A$61.1M annual bareboat charter revenue, quarterly distributions, 3.0x cash-on-cash multiple over the asset lifecycle.

2.3.3. These tokens are wholesale-only financial products requiring AFSL compliance. Settlement is T+0, on-chain, with quarterly redemption windows.

---

## 3. The Bloomberg Terminal Interface

3.1. The interface follows Bloomberg Terminal design conventions. It is data-dense, uses tight line heights, monospace fonts for financial data (SF Mono), and a clean sans-serif (Inter) for UI elements.

3.2. The layout structure consists of the following elements.

3.2.1. **Top bar** (40px) — WREI branding (or white-label broker branding), real-time clock, system status indicators.

3.2.2. **Market ticker** — Scrolling prices for all eight instruments, each labelled "Live," "Cached," or "Indicative" depending on the data source tier.

3.2.3. **Navigation bar** (48px) — Six consolidated tabs: Trading (TRD), Analytics (ANA), Market (MKT), Portfolio (PRT), Compliance (CMP), System (SYS).

3.2.4. **Command bar** (36px) — Terminal-style footer with `wrei@platform:~$` prompt styling and compliance information.

3.3. Borders use 0.5px terminal-style lines. Colour accents use Bloomberg orange (#FF6B1A) for signature elements, with WREI sky blue (#0EA5E9) as the primary accent.

---

## 4. AI-Powered Agentic Negotiation

4.1. The negotiation engine uses Claude API (Sonnet 4 for development, Opus 4.6 for production) to conduct multi-turn negotiations with human buyers.

4.2. The AI agent operates within hard constraints enforced in application code, not by the LLM itself. These constraints are non-negotiable.

4.2.1. Price floor enforcement — the absolute minimum price is enforced server-side before any response reaches the client.

4.2.2. Maximum 5% concession per round — the application code caps each price movement.

4.2.3. Maximum 20% total concession from anchor — cumulative concessions are tracked and capped.

4.2.4. Minimum 3 rounds before any price concession — the agent cannot reduce price in the opening rounds.

4.2.5. Input sanitisation — role override attempts, strategy extraction attempts, and format manipulation are detected and neutralised before reaching the Claude API.

4.2.6. Output filtering — internal reasoning and strategy markers are stripped before delivery to the client.

4.3. During negotiation, the interface displays a real-time Negotiation Dashboard showing the current round, negotiation phase (opening, elicitation, negotiation, closure, escalation), the agent's current offer, the buyer's anchor price, emotional state detection, argument classification, threat level indicators, and concession tracking.

---

## 5. Settlement and Registry Integration

5.1. Settlement pathways vary by instrument category.

5.1.1. **Australian certificates (ESC, VEEC, PRC, ACCU, LGC, STC)** — Settlement via registry transfer. For ESCs, this means TESSA (Transfer and Surrender of ESCs Application) managed by IPART. The workflow is: Trade Confirmed, TESSA Transfer Initiated, Transfer Recorded, Settlement Complete. Current integration is manual confirmation with future API automation planned.

5.1.2. **WREI tokens (WREI-CC, WREI-ACO)** — Settlement via Zoniqx zConnect for T+0 atomic, non-custodial, cross-chain settlement. Token standard is Zoniqx zProtocol (DyCIST / ERC-7518), CertiK-audited.

5.2. Settlement status is tracked in the database with states: pending, processing, completed, failed. The trade blotter displays settlement progression with timestamps.

5.3. Compliance integration (Zoniqx zCompliance) provides AI-powered compliance across 20+ jurisdictions in real time. Identity and KYC are managed through Zoniqx zIdentity with jurisdiction-based access controls.

---

## 6. Compliance and Regulatory Framework

6.1. The compliance dashboard displays a regulatory status matrix covering the following bodies.

6.1.1. **ASIC** — AFSL status and Digital Assets Framework Bill 2025 compliance.

6.1.2. **AUSTRAC** — AML/CTF reporting status and suspicious matter report (SMR) generation.

6.1.3. **IPART** — ESS scheme compliance, ESC surrender deadlines, and penalty rate tracking (A$29.48 for 2026).

6.1.4. **Clean Energy Regulator** — ACCU trading authorisation and registry connection status.

6.1.5. **Verra and Gold Standard** — Carbon credit verification standard compliance.

6.2. The audit trail is append-only, timestamped, user-attributed, and immutable. Every platform action — trade initiations, AI negotiation transcripts, defence layer activations, settlement updates, configuration changes — is logged to the `audit_log` table.

6.3. AI negotiation sessions are independently auditable, showing inputs, agent reasoning, constraint enforcement actions, and final outcomes.

---

## 7. Who the Platform Serves

The platform supports five primary user scenarios. Each persona experiences a different workflow through the same infrastructure.

### 7.1. Series A Investor (Scenario A)

7.1.1. An institutional investor evaluating the platform's technical maturity and commercial opportunity during a 20-30 minute guided demonstration.

7.1.2. They see the full platform — landing dashboard, ESC trading, carbon credit tokenisation, asset co tokens, compliance, analytics — and should conclude that this is real infrastructure, not a prototype.

### 7.2. ESC Broker (Scenario B)

7.2.1. A managing director at an existing ESC brokerage (Ecovantage, Demand Manager, Northmore Gordon, Trade In Green) evaluating white-label capability for their business.

7.2.2. They experience 15-20 minutes of self-directed exploration: broker-branded dashboard, client trade facilitation, settlement workflow, reporting, and white-label configuration.

### 7.3. Institutional Carbon Buyer (Scenario C)

7.3.1. A sustainability procurement manager at a large Australian corporate acquiring WREI-verified carbon credits via agentic negotiation.

7.3.2. Their 10-15 minute session covers market research on the Analyse page, AI-negotiated bilateral trade, and settlement with provenance certificate.

### 7.4. Compliance Officer (Scenario D)

7.4.1. An internal compliance officer monitoring trading activity, regulatory obligations, and audit readiness across the platform.

7.4.2. Their 10-minute dashboard review covers the compliance overview, ESS scheme compliance detail, and the audit trail with report generation.

### 7.5. Bulk ESC Purchaser (Scenario E)

7.5.1. A procurement officer at a large electricity retailer (Origin, AGL, EnergyAustralia) executing a 500,000+ ESC purchase to meet annual ESS surrender obligations.

7.5.2. Their 15-20 minute session uses the Bulk Negotiation Dashboard — a dedicated interface for large-volume trades across multiple counterparties simultaneously.

---

## 8. Technical Notes

8.1. **State management** — React useState/useReducer plus Zustand for demo mode. No localStorage, no sessionStorage.

8.2. **API security** — The Anthropic API key is used exclusively in server-side API routes. It is never exposed to the client.

8.3. **Data feeds** — Three-tier fallback: live (scraped within 24 hours), cached (scraped but older), simulated (generated from instrument parameters). The feed manager uses circuit breakers with a 3-failure threshold and 60-second recovery timeout.

8.4. **Deployment** — Vercel free hobby plan. Database is Vercel Postgres.

8.5. **Spelling convention** — Australian English throughout all user-facing text.

---

*This document is maintained by the WREI Platform team. For implementation details, refer to the architecture working papers (WP1-WP7).*
