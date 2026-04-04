// =============================================================================
// WREI Platform — Instrument-Aware Context Builder
// Generates instrument-specific system prompt context for Claude.
// Pulls from pricing engine (P1.2) and instrument registry (P1.1).
// Conciseness directive per WP6 §3.5.
// =============================================================================

import { InstrumentType } from '@/lib/trading/instruments/types';
import { getRegistryEntry, type InstrumentRegistryEntry } from '@/lib/trading/instruments/instrument-registry';
import { resolveInstrumentPricing, getMinAcceptablePrice, type ResolvedPricing } from '@/lib/trading/instruments/pricing-engine';

const CONCISENESS_DIRECTIVE =
  'Respond concisely. Data-dense, no filler. State facts and figures directly. Format for rapid scanning.';

/** Build the full instrument-specific system prompt context. */
export function buildInstrumentContext(
  instrumentType: InstrumentType,
  spotOverride?: number,
  quantity?: number,
): string {
  const entry = getRegistryEntry(instrumentType);
  const pricing = resolveInstrumentPricing(instrumentType, spotOverride, quantity);
  const header = buildHeader(entry, pricing);
  const body = buildBodyForType(instrumentType, entry, pricing);
  const constraints = buildNegotiationConstraints(pricing);
  return `${header}\n\n${body}\n\n${constraints}\n<directive>\n${CONCISENESS_DIRECTIVE}\n</directive>`;
}

/** Get just the conciseness directive for embedding elsewhere. */
export function getConcisenessDirective(): string {
  return CONCISENESS_DIRECTIVE;
}

function buildHeader(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  return `<instrument>
Type: ${entry.instrumentType} (${entry.category})
Display: ${entry.pricing.unitOfMeasure} denominated in ${pricing.currency}
Negotiation Style: ${entry.negotiationStyle}
Spot: ${pricing.currency} ${pricing.currentSpot.toFixed(2)}/${entry.pricing.unitOfMeasure}
Anchor: ${pricing.currency} ${pricing.effectiveAnchor.toFixed(2)}
Floor: ${pricing.currency} ${pricing.priceFloor.toFixed(2)}
Ceiling: ${pricing.currency} ${pricing.priceCeiling.toFixed(2)}
${pricing.volumeDiscount > 0 ? `Volume Discount: ${pricing.volumeDiscount}%` : ''}
</instrument>`;
}

function buildNegotiationConstraints(pricing: ResolvedPricing): string {
  const minAcceptable = getMinAcceptablePrice(pricing);
  return `<constraints>
HARD LIMITS (enforced in application code):
- Price floor: ${pricing.currency} ${pricing.priceFloor.toFixed(2)}
- Min acceptable (anchor - max concession): ${pricing.currency} ${minAcceptable.toFixed(2)}
- Max concession/round: ${(pricing.maxConcessionPerRound * 100).toFixed(1)}%
- Max total concession: ${(pricing.maxTotalConcession * 100).toFixed(1)}%
- Min rounds before concession: ${pricing.minRoundsBeforeConcession}
</constraints>`;
}

function buildBodyForType(type: InstrumentType, entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  switch (type) {
    case 'ESC':      return buildESCContext(entry, pricing);
    case 'VEEC':     return buildVEECContext(entry, pricing);
    case 'ACCU':     return buildACCUContext(entry, pricing);
    case 'LGC':      return buildLGCContext(entry, pricing);
    case 'STC':      return buildSTCContext(entry, pricing);
    case 'PRC':      return buildPRCContext(entry, pricing);
    case 'WREI_CC':  return buildWREICCContext(entry, pricing);
    case 'WREI_ACO': return buildWREIACOContext(entry, pricing);
  }
}

// --- ESC ---
function buildESCContext(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  const penaltyRate = entry.pricing.penaltyRate ?? 29.48;
  return `<market_context>
Instrument: NSW Energy Savings Certificate (ESC)
Scheme: NSW ESS, administered by IPART
Spot: A$${pricing.currentSpot.toFixed(2)}/MWh | Penalty: A$${penaltyRate.toFixed(2)} | Forward 12M: A$25.40
Creation Volume: ~4.5M ESCs/year | Surrender Deadline: 30 April annually
Settlement: TESSA registry transfer (T+2)
Key Dynamics:
- Penalty rate is buyer's BATNA — never price above A$${penaltyRate.toFixed(2)}
- Creation cost ~A$15-18 sets economic floor for ACPs
- Scheme target changes (IPART annual review) are primary price driver
- Vintage affects perception; activity type (lighting, HVAC, motors) influences quality
- Surplus creation volumes (~500K above target) put downward pressure
- ESC-VEEC correlation: ~0.65 historically
${entry.keyConsiderations.map(c => `- ${c}`).join('\n')}
</market_context>`;
}

// --- VEEC ---
function buildVEECContext(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  return `<market_context>
Instrument: Victorian Energy Efficiency Certificate (VEEC)
Scheme: VEU, administered by ESC Victoria
Spot: A$${pricing.currentSpot.toFixed(2)}/tCO2e | Forward 12M: A$88.00
Creation Volume: ~6.5M VEECs/year | Settlement: VEU Registry (T+3)
Key Dynamics:
- Higher unit value than ESCs — larger ticket negotiations
- Scheme target increases drive price appreciation
- No penalty rate cap — price is market-driven
- Victorian market independent of NSW ESS
- Hot water and space heating dominate creation volumes
${entry.keyConsiderations.map(c => `- ${c}`).join('\n')}
</market_context>`;
}

// --- ACCU ---
function buildACCUContext(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  return `<market_context>
Instrument: Australian Carbon Credit Unit (ACCU)
Scheme: ERF, administered by CER
Spot: A$${pricing.currentSpot.toFixed(2)}/tCO2e | Range: A$20-75 (method-dependent)
Settlement: ANREU registry transfer (T+3)
Key Dynamics:
- Price by method: HIR A$30-40, savanna A$25-35, energy efficiency A$30-45, vegetation A$35-50
- Safeguard Mechanism demand from 215+ facilities
- Financial product — AFSL required
- Co-benefits (Indigenous, biodiversity) command 20-40% premium
- CER audit for volumes >50K ACCUs
${entry.keyConsiderations.map(c => `- ${c}`).join('\n')}
</market_context>`;
}

// --- LGC ---
function buildLGCContext(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  return `<market_context>
Instrument: Large-scale Generation Certificate (LGC)
Scheme: RET, administered by CER
Spot: A$${pricing.currentSpot.toFixed(2)}/MWh | Settlement: REC Registry (T+2)
Key Dynamics:
- Oversupplied market — RET target largely met, price declined from A$85+ (2018)
- Large-volume transactions norm (100K+ MWh)
- Financial product classification under Corporations Act
- Corporate PPA bundling reduces standalone demand
${entry.keyConsiderations.map(c => `- ${c}`).join('\n')}
</market_context>`;
}

// --- STC ---
function buildSTCContext(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  return `<market_context>
Instrument: Small-scale Technology Certificate (STC)
Scheme: SRES, administered by CER
Spot: A$${pricing.currentSpot.toFixed(2)}/MWh | Clearing House: A$40.00 (ceiling)
Settlement: STC Clearing House (T+1)
Key Dynamics:
- Very tight price band A$35-40 — minimal negotiation room (~12% spread)
- High liquidity via clearing house — most liquid environmental certificate
- Solar installation volumes drive supply
- Seasonal patterns: higher creation in summer
${entry.keyConsiderations.map(c => `- ${c}`).join('\n')}
</market_context>`;
}

// --- PRC ---
function buildPRCContext(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  return `<market_context>
Instrument: Peak Reduction Certificate (PRC)
Scheme: PDRS, administered by IPART
Spot: A$${pricing.currentSpot.toFixed(2)}/kW | Settlement: TESSA (T+2)
Key Dynamics:
- Low unit value — volume is primary negotiation lever
- Newer scheme (2022) with evolving dynamics and wider bid-ask spreads
- Demand response and battery storage driving new creation activities
${entry.keyConsiderations.map(c => `- ${c}`).join('\n')}
</market_context>`;
}

// --- WREI-CC ---
function buildWREICCContext(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  return `<market_context>
Instrument: WREI Carbon Credit Token (WREI-CC)
Category: Blockchain-native digital carbon credit
Spot: ${pricing.currency} ${pricing.currentSpot.toFixed(2)}/tCO2e | Premium: 1.5x dMRV benchmark
Settlement: On-chain via Zoniqx zConnect (T+0 atomic)
Verification: ISO 14064-2 + Verra VCS + Gold Standard + dMRV telemetry
Emissions: vessel efficiency 47.2%, modal shift 47.9%, construction avoidance 4.8%
dMRV Benchmark: 1.78x premium market norm; supply 3.12M-13.1M tCO2e lifecycle
Token Standard: Zoniqx zProtocol (ERC-7518), CertiK-audited
Retirement: Safeguard Mechanism, CORSIA, ISSB S2
${entry.keyConsiderations.map(c => `- ${c}`).join('\n')}
</market_context>`;
}

// --- WREI-ACO ---
function buildWREIACOContext(entry: InstrumentRegistryEntry, pricing: ResolvedPricing): string {
  return `<market_context>
Instrument: WREI Asset Co Token (WREI-ACO)
Category: Tokenised infrastructure asset (real-world asset backed)
NAV: ${pricing.currency} ${pricing.currentSpot.toFixed(2)}/token
Settlement: On-chain via Zoniqx zConnect (T+0 atomic)
Asset: Water Roads Asset Co — 88 vessels + 22 Deep Power units, A$473M capex
Financials:
- Equity Yield: 28.3% | Lease Income: A$61.1M/yr | Debt Service: A$23.94M/yr
- Net Cash: A$37.16M/yr | Multiple: 3.0x lifecycle | Margin: 60.8%
- Distribution: Quarterly | Redemption: Quarterly windows
Comparables: REITs ~8%, infra debt ~6-7%, USYC 4.5%, BUIDL 5%
Requirements: Wholesale only (s708), AFSL required, 80% LTV DeFi eligible
${entry.keyConsiderations.map(c => `- ${c}`).join('\n')}
</market_context>`;
}
