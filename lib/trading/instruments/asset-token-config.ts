// =============================================================================
// WREI Platform — WREI Asset Co Token (WREI-ACO) Configuration
// Pricing per WP5 §3.3 and WR-STR-008 (LeaseCo yield-focused)
// =============================================================================

import {
  InstrumentPricingConfig,
  WREIAssetCoTokenMetadata,
  Instrument,
} from './types';

// ---------------------------------------------------------------------------
// Reference: Asset Co tokens are priced on NAV, negotiated on yield
// The "price" is the per-token NAV; negotiation centres on yield expectations
// ---------------------------------------------------------------------------

const TOKEN_EQUITY = 131_000_000;      // A$ tokenised equity
const DEFAULT_TOKEN_SUPPLY = 131_000;  // 1 token = A$1,000 face value
const NAV_PER_TOKEN = TOKEN_EQUITY / DEFAULT_TOKEN_SUPPLY; // A$1,000

// ---------------------------------------------------------------------------
// WREI-ACO Pricing Configuration
// ---------------------------------------------------------------------------

export const WREI_ACO_PRICING: InstrumentPricingConfig = {
  instrumentType: 'WREI_ACO',
  spotPriceSource: 'manual',           // NAV-based, not market-traded spot
  spotPriceUpdateInterval: 86_400,     // Daily NAV recalculation
  fallbackPrice: NAV_PER_TOKEN,        // A$1,000 per token

  anchorPrice: NAV_PER_TOKEN,
  anchorMethod: 'fixed',              // NAV-based pricing, not spot-derived
  priceFloor: Math.round(NAV_PER_TOKEN * 0.85), // 15% discount to NAV
  priceCeiling: Math.round(NAV_PER_TOKEN * 1.15), // 15% premium to NAV

  maxConcessionPerRound: 0.03,        // 3% — tighter for yield instruments
  maxTotalConcession: 0.10,           // 10% from NAV anchor

  volumeDiscountThresholds: [
    { quantity: 100, discountPct: 0.5 },    // A$100K+
    { quantity: 500, discountPct: 1.5 },    // A$500K+
    { quantity: 1_000, discountPct: 2.5 },  // A$1M+
    { quantity: 5_000, discountPct: 4 },    // A$5M+
  ],
  currency: 'AUD',
  unitOfMeasure: 'token',
};

// ---------------------------------------------------------------------------
// WREI-ACO Metadata Defaults
// ---------------------------------------------------------------------------

export const WREI_ACO_METADATA_DEFAULTS: Partial<WREIAssetCoTokenMetadata> = {
  underlyingAsset: {
    spvName: 'Water Roads LeaseCo Pty Ltd',
    assetClass: 'maritime_infrastructure',
    vesselCount: 88,
    vesselType: 'Candela C-8 Electric Hydrofoil',
    deepPowerUnits: 22,
    totalCapex: 473_000_000,
  },

  totalTokenSupply: DEFAULT_TOKEN_SUPPLY,
  tokenHolderEquity: TOKEN_EQUITY,
  fractionPerToken: 1 / DEFAULT_TOKEN_SUPPLY,

  yieldModel: 'distribution',
  grossLeaseYield: 0.129,        // 12.9% on total capex
  equityYield: 0.283,            // 28.3% on token equity
  distributionFrequency: 'quarterly',

  annualLeaseIncome: 61_100_000, // A$ at steady state
  annualDebtService: 23_900_000, // A$ (7% on A$342M debt)
  netCashFlow: 37_100_000,       // A$ after debt service
  cashOnCashMultiple: 3.0,       // Lifetime return multiple

  blockchainNetwork: 'Hedera',
  tokenStandard: 'ERC-7518',     // Zoniqx DyCIST

  afslRequired: true,
  wholesaleOnly: true,            // Initially s708 wholesale only

  settlementMethod: 'on_chain',
  settlementCycle: 'T+0',
  redemptionWindow: 'quarterly',
};

export const WREI_ACO_INSTRUMENT_DEFAULTS: Partial<Instrument> = {
  instrumentType: 'WREI_ACO',
  instrumentCategory: 'asset_token',
  displayName: 'WREI Asset Co Token',
  ticker: 'WREI-ACO',
  unitOfMeasure: 'token',
  currency: 'AUD',
  issuer: 'WREI',
  registryName: 'WREI_Blockchain',
  jurisdictions: ['AU'],
  regulatoryClassification: 'managed_investment',
  complianceFlags: ['afsl_required', 'wholesale_only'],
};

// ---------------------------------------------------------------------------
// Financial projections (informational for agent context)
// ---------------------------------------------------------------------------

export const WREI_ACO_FINANCIALS = {
  CAPEX: {
    totalCapex: 473_000_000,
    downPayment: 47_300_000,       // 10% from OpCo
    debtFunding: 342_000_000,      // At 7% interest-only
    tokenEquity: TOKEN_EQUITY,
  },
  STEADY_STATE: {
    annualLeaseIncome: 61_100_000,
    annualInterestCost: 23_900_000,
    netCashFlow: 37_100_000,
    equityYield: 0.283,
    grossLeaseYield: 0.129,
    netMargin: 0.608,
  },
  LIFETIME: {
    leaseIncome: 671_700_000,
    netCashGenerated: 395_400_000,
    cashOnCashMultiple: 3.0,
    endingCash: 311_700_000,
  },
  FLEET: {
    vesselCount: 88,
    deepPowerUnits: 22,
    rampUpYears: 4,               // 2027-2030
    steadyStateYears: 7,          // 2031-2037
  },
} as const;
