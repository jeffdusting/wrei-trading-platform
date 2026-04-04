// =============================================================================
// WREI Platform — WREI Carbon Credit Token (WREI-CC) Configuration
// Pricing per WP5 §5.3 and WR-STR-008 (1.5x premium multiplier)
// =============================================================================

import {
  InstrumentPricingConfig,
  WREICarbonTokenMetadata,
  Instrument,
} from './types';

// ---------------------------------------------------------------------------
// Reference: dMRV spot price used as the base for premium calculation
// In production this comes from the live feed; here we use the fallback
// ---------------------------------------------------------------------------

const DMRV_SPOT_REFERENCE = 15.20;   // Current dMRV verified credit spot (USD)
const WREI_PREMIUM_MULTIPLIER = 1.5; // Per WR-STR-008

// ---------------------------------------------------------------------------
// WREI-CC Pricing Configuration
// ---------------------------------------------------------------------------

export const WREI_CC_PRICING: InstrumentPricingConfig = {
  instrumentType: 'WREI_CC',
  spotPriceSource: 'live_feed',
  spotPriceFeedUrl: undefined,       // Connected in production via data feed layer
  spotPriceUpdateInterval: 900,      // 15-minute updates during trading hours
  fallbackPrice: Math.round(DMRV_SPOT_REFERENCE * WREI_PREMIUM_MULTIPLIER * 100) / 100, // A$22.80

  anchorPrice: Math.round(DMRV_SPOT_REFERENCE * WREI_PREMIUM_MULTIPLIER * 100) / 100,   // A$22.80
  anchorMethod: 'premium_over_spot',
  premiumMultiplier: WREI_PREMIUM_MULTIPLIER,
  priceFloor: Math.round(DMRV_SPOT_REFERENCE * 1.2 * 100) / 100,   // A$18.24 (1.2x dMRV minimum)
  priceCeiling: Math.round(DMRV_SPOT_REFERENCE * 2.5 * 100) / 100, // A$38.00 (2.5x dMRV cap)

  maxConcessionPerRound: 0.05,  // 5% — standard negotiation room
  maxTotalConcession: 0.20,     // 20% from anchor

  volumeDiscountThresholds: [
    { quantity: 10_000, discountPct: 1 },
    { quantity: 50_000, discountPct: 2.5 },
    { quantity: 100_000, discountPct: 4 },
    { quantity: 500_000, discountPct: 5 },
  ],
  currency: 'AUD',
  unitOfMeasure: 'tCO2e',
};

// ---------------------------------------------------------------------------
// WREI-CC Metadata Defaults
// ---------------------------------------------------------------------------

export const WREI_CC_METADATA_DEFAULTS: Partial<WREICarbonTokenMetadata> = {
  verificationStandards: ['ISO_14064_2', 'Verra_VCS'],
  wreiVerificationScore: 92,
  wreiPremiumMultiplier: WREI_PREMIUM_MULTIPLIER,
  blockchainNetwork: 'Hedera',
  tokenStandard: 'ERC-7518',  // Zoniqx DyCIST
  yieldModel: 'accruing',
  projectedAnnualYield: 0.08, // 8% per WR-STR-008
  retirementEligible: true,
  settlementMethod: 'on_chain',
  settlementCycle: 'T+0',
};

export const WREI_CC_INSTRUMENT_DEFAULTS: Partial<Instrument> = {
  instrumentType: 'WREI_CC',
  instrumentCategory: 'carbon_token',
  displayName: 'WREI Carbon Credit Token',
  ticker: 'WREI-CC',
  unitOfMeasure: 'tCO2e',
  currency: 'AUD',
  issuer: 'WREI',
  registryName: 'WREI_Blockchain',
  jurisdictions: ['AU', 'Global'],
  regulatoryClassification: 'financial_product',
  complianceFlags: [],
};

// ---------------------------------------------------------------------------
// Supply projections (from WR-STR-008, informational for agent context)
// ---------------------------------------------------------------------------

export const WREI_CC_SUPPLY = {
  BASE_CASE: {
    tradeableCredits: 3_120_000,      // tonnes (2027-2040)
    totalRevenue: 468_000_000,        // A$ cumulative
    steadyStateAnnual: 33_400_000,    // A$ annual (2031-2037)
  },
  EXPANSION_CASE: {
    tradeableCredits: 13_100_000,     // tonnes (with Hyke routes)
    totalRevenue: 1_970_000_000,      // A$ cumulative
    steadyStateAnnual: 141_000_000,   // A$ annual
  },
  EMISSION_SOURCES: {
    vesselEfficiency: 47.2,           // % of total credits
    modalShift: 47.9,                 // % of total credits
    constructionAvoidance: 4.8,       // % of total credits
  },
} as const;
