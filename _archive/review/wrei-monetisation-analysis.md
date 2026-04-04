# WREI Trading Platform — Fastest Path to Monetisation

**Prepared for:** Jeff Dewing, Director & COO, CBS Group / CEO, WaterRoads Pty Ltd
**Date:** 25 March 2026
**Classification:** Commercial-in-Confidence

---

## 1. Situation

The WREI Trading Platform is a fully functional, institutional-grade trading demonstration deployed at `wrei.cbslab.app`. It comprises approximately 87,000 lines of TypeScript across 10 page routes, 6 API endpoints, 50+ components, and 11 buyer personas — all underpinned by Claude Opus 4.6 AI negotiation, AFSL-compliant onboarding, financial modelling (Monte Carlo, IRR, NPV), and blockchain provenance visualisation. The platform has passed 623+ tests at a 100% pass rate and is deployed on Vercel.

However, it currently operates as a **demonstration environment only**. No real certificates are traded, no live market data feeds are connected, and no revenue is being generated. The platform was built to showcase WaterRoads' dual-token investment thesis (carbon credits + Asset Co infrastructure tokens), but the underlying infrastructure has significantly broader commercial application.

## 2. Complication

WaterRoads is in active Series A fundraising (A$15M equity target) and needs to demonstrate revenue traction or at minimum a credible near-term revenue pathway. The platform represents a substantial sunk cost in engineering. Meanwhile, the Australian environmental certificate market — comprising ESCs (~A$23/MWh spot), VEECs (~A$80/tCO₂e spot), PRCs (~A$3/cert), ACCUs (~A$36–38/tCO₂e), LGCs (~A$4–5/cert), and STCs — is traded almost entirely through bilateral contracts with no standardised exchange, limited price transparency, and fragmented broker intermediaries. This presents a significant gap that the WREI infrastructure is unusually well-positioned to fill.

## 3. Question

What is the fastest, lowest-risk path to generating revenue from the existing WREI platform infrastructure — and which option delivers the best risk-adjusted return on the marginal investment required?

## 4. Answer — Three Monetisation Options

---

### Option A: Australian Environmental Certificate Trading Hub

**Concept:** Pivot the WREI platform from a carbon-credit-only demonstration into a live, multi-certificate trading platform covering all six Australian environmental certificate classes: ESCs (NSW), VEECs (Vic), PRCs (NSW), ACCUs (Federal), LGCs (Federal), and STCs (Federal).

**Why this works now:** The existing platform already has the following capabilities directly transferable to this use case:

- AI-powered negotiation engine with configurable personas and price constraints — directly applicable to bilateral certificate negotiation where buyers and sellers currently rely on phone calls and email
- AFSL compliance module — ESC and VEEC trading activities may constitute financial products requiring an AFSL, and the platform already models this assessment
- Institutional onboarding with KYC/AML — required for any regulated trading activity
- Market data feeds architecture — currently stubbed with reference data but architecturally ready for live feed integration (AFMA, broker feeds)
- Financial analytics — IRR, NPV, scenario analysis, and risk profiling are directly applicable to certificate portfolio valuation
- Export and reporting — PDF, Excel, CSV, and JSON reporting for compliance and audit

**Market context:** The combined annual market for these certificates is substantial:

| Certificate | Spot Price (Mar 2026) | Annual Volume Estimate | Annual Market Value |
|---|---|---|---|
| VEECs | ~A$80/cert | 4.4M (2026 target) | ~A$352M |
| ESCs | ~A$23/MWh | ~5M+ (oversupply) | ~A$115M |
| ACCUs | ~A$36–38/t | ~17M+ (Safeguard) | ~A$630M+ |
| LGCs | ~A$4–5/cert | ~30M+ | ~A$135M |
| PRCs | ~A$3/cert | ~10M+ | ~A$30M |
| STCs | ~A$40/cert (clearing) | ~25M+ | ~A$1B+ |

The total addressable market exceeds **A$2.3 billion annually**, and currently no single platform provides AI-assisted negotiation, compliance automation, and analytics across all certificate types.

**Revenue model:** Transaction fees (0.5–1.5% of trade value) plus SaaS subscription for analytics and compliance modules. At 1% of even 2% market share across ESCs and VEECs alone (~A$9.3M in traded value), this generates ~A$93K in transaction fees, scaling rapidly with volume. Premium analytics subscriptions at A$2,000–5,000/month per institutional user add recurring SaaS revenue.

**Development required:**

- Live market data feed integration (AFMA, broker APIs) — 4–6 weeks
- Certificate-specific pricing models and constraint configurations — 2–3 weeks
- Counterparty matching and deal execution workflow — 6–8 weeks
- AFSL licensing or authorised representative arrangement — 3–6 months (critical path)
- Registry integration (IPART for ESCs, ESC Vic for VEECs, CER for ACCUs/LGCs/STCs) — 8–12 weeks

**Time to first revenue:** 4–6 months (with interim broker-assisted model while AFSL processes)

---

### Option B: White-Label SaaS for Environmental Certificate Brokers

**Concept:** Licence the platform technology stack to existing Accredited Certificate Providers (ACPs) and environmental certificate brokers — organisations like Ecovantage, Northmore Gordon, CORE Markets, Demand Manager, and Carbon & Energy Management — as a white-label trading and analytics platform.

**Why this works now:** These brokers currently operate with basic CRM tools, spreadsheet-based pricing, and manual bilateral negotiation. None offer AI-assisted price negotiation, automated compliance assessment, or institutional-grade analytics to their clients. The WREI platform provides all of these out of the box with relatively minor reconfiguration.

**Revenue model:** Annual SaaS licence at A$50,000–150,000 per broker (depending on features and volume), plus per-transaction fees passed through on trades executed via the platform. White-label implementation includes customised personas, branding, and certificate-type configuration.

**Target customers:** There are an estimated 15–25 significant ACPs and brokers across NSW and Victoria alone. Converting 3–5 in Year 1 at an average A$75,000 licence generates A$225,000–375,000 in ARR.

**Development required:**

- Multi-tenancy and white-label theming — 4–6 weeks
- Certificate-type configuration system (replacing hardcoded WREI carbon credit parameters) — 3–4 weeks
- Broker-specific persona library — 2–3 weeks
- SLA, hosting, and support infrastructure — 2–4 weeks

**Time to first revenue:** 3–4 months

---

### Option C: AI Negotiation Engine API-as-a-Service

**Concept:** Extract the AI negotiation engine (Claude API integration, persona management, defence layers, constraint enforcement, coaching, scoring) as a standalone API product, marketed to any B2B trading or procurement platform that needs intelligent, configurable negotiation automation.

**Why this works now:** The negotiation engine is the most differentiated and technically mature component of the platform. The defence layers, emotional intelligence tracking, argument classification, and constraint enforcement represent significant IP that is applicable well beyond environmental certificates — including procurement, real estate, insurance, and B2B SaaS contract negotiation.

**Revenue model:** Usage-based API pricing at A$0.05–0.50 per negotiation round (depending on model tier and volume), plus implementation and customisation fees of A$25,000–100,000 per integration. The API already exists (`POST /api/negotiate`) with documented request/response schemas.

**Target customers:** Procurement platforms, marketplace operators, real estate technology companies, insurance comparison platforms, and enterprise sales enablement tools.

**Development required:**

- API abstraction layer to decouple from WREI-specific carbon credit context — 3–4 weeks
- Multi-tenant API key management and billing — 4–6 weeks
- SDK development (JavaScript, Python) — 3–4 weeks
- Documentation and developer portal enhancement — 2–3 weeks
- Compliance and data processing agreements — 2–4 weeks

**Time to first revenue:** 4–6 months (longer sales cycle for enterprise API products)

---

## 5. Multi-Variable Assessment (MVA)

The following MVA scores each option across eight weighted criteria. Each criterion is scored 1–5 (5 = best) and weighted by strategic importance.

| # | Criterion | Weight | Option A: Certificate Hub | Option B: White-Label SaaS | Option C: API Service |
|---|---|---|---|---|---|
| 1 | Speed to first revenue | 20% | 3 | 4 | 2 |
| 2 | Revenue scale potential (3-year) | 20% | 5 | 3 | 4 |
| 3 | Development effort required | 10% | 2 | 4 | 3 |
| 4 | Regulatory complexity | 15% | 2 | 4 | 5 |
| 5 | Strategic alignment with WaterRoads | 15% | 5 | 3 | 2 |
| 6 | Competitive differentiation | 10% | 4 | 3 | 5 |
| 7 | Recurring revenue quality | 5% | 3 | 5 | 4 |
| 8 | Investor narrative strength | 5% | 5 | 3 | 3 |
| | **Weighted Score** | **100%** | **3.55** | **3.55** | **3.15** |

### Scoring Rationale

**Option A — Certificate Hub:**

- Speed (3): AFSL licensing is the critical path constraint; interim broker model can generate earlier revenue but at reduced margin
- Scale (5): A$2.3B+ annual market with no dominant digital platform; network effects compound once liquidity established
- Development (2): Most engineering required — live data feeds, registry integration, counterparty matching
- Regulatory (2): AFSL requirement is non-trivial; AML/CTF obligations for financial product trading
- Strategic alignment (5): Directly supports WaterRoads' carbon credit trading thesis and positions the company as market infrastructure
- Differentiation (4): AI negotiation in certificate trading is genuinely novel; current competitors are phone-and-spreadsheet operations
- Recurring revenue (3): Transaction-based revenue is volume-dependent; analytics subscriptions provide baseline
- Investor narrative (5): "We built the trading infrastructure for Australia's A$2.3B environmental certificate market" is a compelling Series A story

**Option B — White-Label SaaS:**

- Speed (4): Fastest to revenue with minimal regulatory overhead; brokers already have the AFSL
- Scale (3): Limited by number of addressable brokers (15–25 significant players); revenue per customer is moderate
- Development (4): Least new engineering — primarily configuration, theming, and multi-tenancy
- Regulatory (4): CBS/WaterRoads operates as technology provider, not financial services — the broker holds the AFSL
- Strategic alignment (3): Supports the WaterRoads ecosystem but is a B2B technology play rather than a trading position
- Differentiation (3): White-label SaaS is a proven model but not uniquely compelling; brokers may build internally
- Recurring revenue (5): Annual licences with high switching costs
- Investor narrative (3): Solid but less exciting than operating the market itself

**Option C — API Service:**

- Speed (2): Enterprise API sales cycles are typically 6–12 months; requires substantial sales effort
- Scale (4): Horizontal applicability across many industries; per-transaction pricing scales with adoption
- Development (3): Moderate engineering to abstract and generalise the negotiation engine
- Regulatory (5): No financial services regulation applicable; standard API terms
- Strategic alignment (2): Diverges from WaterRoads' core mission; risks splitting focus
- Differentiation (5): No comparable AI negotiation API product exists in the market
- Recurring revenue (4): Usage-based with implementation fees; predictable at scale
- Investor narrative (3): Interesting technology story but dilutes the WaterRoads infrastructure thesis

---

## 6. Recommendation — Phased Approach: B then A

The MVA reveals a tie between Options A and B, with Option C trailing. The recommended course of action is a **phased approach** that sequences these options to maximise speed to revenue while building toward the larger opportunity.

### Phase 1 (Months 1–4): White-Label SaaS (Option B)

Launch the white-label platform targeting 2–3 environmental certificate brokers in NSW and Victoria. This achieves the following objectives:

- Generates first revenue within 3–4 months with minimal regulatory exposure
- Validates market demand and product-market fit in the certificate trading space
- Builds relationships with ACPs who become channel partners and early adopters for Phase 2
- Funds continued platform development from operating revenue rather than equity dilution

The initial targets should include mid-tier ACPs who lack technology capabilities — specifically those operating in the ESC and VEEC markets where bilateral trading inefficiency is most acute.

### Phase 2 (Months 4–12): Certificate Trading Hub (Option A)

Leverage Phase 1 broker relationships, market intelligence, and revenue to launch a direct trading platform. The key enablers are:

- AFSL application lodged in Month 1 (parallel to Phase 1 development)
- Live market data integration developed using Phase 1 broker feedback
- Initial liquidity seeded through Phase 1 broker network (they become market makers)
- WaterRoads' own future carbon credit generation positions feed directly into the platform

### Phase 3 (Month 12+): API Monetisation (Option C)

Once the negotiation engine has been battle-tested across multiple certificate types and broker configurations, extract it as a standalone API product for horizontal market expansion. This becomes a capital-light, high-margin business line funded entirely by Phase 1–2 revenue.

---

## 7. Financial Summary

| Metric | Phase 1 (Yr 1) | Phase 2 (Yr 2) | Phase 3 (Yr 3) |
|---|---|---|---|
| Revenue model | SaaS licences | SaaS + transaction fees | SaaS + transactions + API |
| Target revenue | A$225K–375K | A$1.2M–2.5M | A$3.5M–7M |
| Gross margin | ~80% | ~65% | ~75% |
| Incremental dev cost | A$80K–120K | A$200K–350K | A$100K–150K |
| AFSL cost | — | A$30K–50K | — |
| Headcount (incremental) | 1 developer, 0.5 BD | 2 developers, 1 BD, 1 compliance | +1 developer, +1 BD |

## 8. Immediate Next Steps

The following five actions should be taken this week to initiate Phase 1:

1. **Identify 5 target ACPs** — Focus on mid-tier ESC/VEEC brokers in NSW and Victoria who currently trade bilaterally with no technology platform. Ecovantage, Northmore Gordon, and Demand Manager are starting points for market intelligence; smaller ACPs are better white-label targets.

2. **Scope AFSL requirements** — Engage a financial services lawyer to confirm whether operating a certificate trading hub requires a full AFSL, an authorised representative arrangement under an existing licensee, or falls within a technology-provider exemption. This determines Phase 2 timeline.

3. **Configure a live demo** — Reconfigure the WREI platform with ESC-specific personas, pricing (A$22–26/MWh range), and compliance rules to demonstrate to target ACPs within 2 weeks.

4. **Draft a white-label commercial proposal** — A one-page term sheet for the SaaS licence model (annual fee, transaction fee share, implementation scope, SLA) ready for ACP conversations.

5. **Register the domain** — Secure `envex.com.au` or equivalent for the Australian Environmental Certificate Exchange brand, independent of the WaterRoads/WREI branding.

---

*This analysis was prepared using the WREI Trading Platform documentation suite (v1.0, 25 March 2026) and current Australian environmental certificate market data.*
