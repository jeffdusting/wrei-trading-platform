// =============================================================================
// WREI Platform — Australian Environmental Certificate Configurations
// Pricing from WP1 research; negotiation parameters per WP5 §5.2-5.3
// =============================================================================

import { InstrumentPricingConfig, CertificateMetadata, Instrument } from './types';

// Shared registry transfer steps used by most certificate types
const TESSA_TRANSFER_STEPS = ['Trade Confirmed', 'Transfer Initiated in TESSA', 'Transfer Recorded', 'Settlement Complete'];
const CER_TRANSFER_STEPS = ['Trade Confirmed', 'Transfer Initiated in ANREU', 'CER Approval', 'Transfer Recorded', 'Settlement Complete'];

// ---------------------------------------------------------------------------
// ESC — Energy Savings Certificate (NSW ESS)
// ---------------------------------------------------------------------------

export const ESC_PRICING: InstrumentPricingConfig = {
  instrumentType: 'ESC',
  spotPriceSource: 'scraped',
  spotPriceUpdateInterval: 86_400, // Daily
  fallbackPrice: 23.00,
  anchorPrice: 23.00,
  anchorMethod: 'spot',
  priceFloor: 18.00,
  priceCeiling: 29.48,            // 2026 IPART penalty rate
  maxConcessionPerRound: 0.03,    // 3% — tighter for lower-value certificates
  maxTotalConcession: 0.10,       // 10%
  penaltyRate: 29.48,
  volumeDiscountThresholds: [
    { quantity: 50_000, discountPct: 1 },
    { quantity: 100_000, discountPct: 2 },
    { quantity: 500_000, discountPct: 3.5 },
  ],
  currency: 'AUD',
  unitOfMeasure: 'MWh',
};

export const ESC_METADATA_DEFAULTS: Partial<CertificateMetadata> = {
  scheme: 'ESS',
  schemeAdministrator: 'IPART',
  penaltyRate: 29.48,
  settlementMethod: 'registry_transfer',
  registryTransferSteps: TESSA_TRANSFER_STEPS,
  estimatedSettlementDays: 2,
};

export const ESC_INSTRUMENT_DEFAULTS: Partial<Instrument> = {
  instrumentType: 'ESC',
  instrumentCategory: 'certificate',
  displayName: 'Energy Savings Certificate',
  ticker: 'ESC',
  unitOfMeasure: 'MWh',
  currency: 'AUD',
  issuer: 'NSW ESS',
  registryName: 'TESSA',
  jurisdictions: ['NSW'],
  regulatoryClassification: 'not_financial_product',
  complianceFlags: [],
};

// ---------------------------------------------------------------------------
// VEEC — Victorian Energy Efficiency Certificate (VEU)
// ---------------------------------------------------------------------------

export const VEEC_PRICING: InstrumentPricingConfig = {
  instrumentType: 'VEEC',
  spotPriceSource: 'scraped',
  spotPriceUpdateInterval: 86_400,
  fallbackPrice: 83.50,
  anchorPrice: 83.50,
  anchorMethod: 'spot',
  priceFloor: 60.00,
  priceCeiling: 120.00,
  maxConcessionPerRound: 0.03,
  maxTotalConcession: 0.10,
  volumeDiscountThresholds: [
    { quantity: 10_000, discountPct: 1 },
    { quantity: 50_000, discountPct: 2 },
    { quantity: 200_000, discountPct: 3 },
  ],
  currency: 'AUD',
  unitOfMeasure: 'tCO2e',
};

export const VEEC_METADATA_DEFAULTS: Partial<CertificateMetadata> = {
  scheme: 'VEU',
  schemeAdministrator: 'ESC_Victoria',
  settlementMethod: 'registry_transfer',
  registryTransferSteps: ['Trade Confirmed', 'Transfer Initiated in VEU Registry', 'Transfer Recorded', 'Settlement Complete'],
  estimatedSettlementDays: 3,
};

export const VEEC_INSTRUMENT_DEFAULTS: Partial<Instrument> = {
  instrumentType: 'VEEC',
  instrumentCategory: 'certificate',
  displayName: 'Victorian Energy Efficiency Certificate',
  ticker: 'VEEC',
  unitOfMeasure: 'tCO2e',
  currency: 'AUD',
  issuer: 'VIC VEU',
  registryName: 'TESSA',
  jurisdictions: ['VIC'],
  regulatoryClassification: 'not_financial_product',
  complianceFlags: [],
};

// ---------------------------------------------------------------------------
// PRC — Peak Reduction Certificate (NSW PDRS)
// ---------------------------------------------------------------------------

export const PRC_PRICING: InstrumentPricingConfig = {
  instrumentType: 'PRC',
  spotPriceSource: 'scraped',
  spotPriceUpdateInterval: 86_400,
  fallbackPrice: 2.85,
  anchorPrice: 2.85,
  anchorMethod: 'spot',
  priceFloor: 2.00,
  priceCeiling: 5.00,
  maxConcessionPerRound: 0.03,
  maxTotalConcession: 0.10,
  volumeDiscountThresholds: [
    { quantity: 100_000, discountPct: 1 },
    { quantity: 500_000, discountPct: 2 },
    { quantity: 1_000_000, discountPct: 3 },
  ],
  currency: 'AUD',
  unitOfMeasure: 'kW',
};

export const PRC_METADATA_DEFAULTS: Partial<CertificateMetadata> = {
  scheme: 'PDRS',
  schemeAdministrator: 'IPART',
  settlementMethod: 'registry_transfer',
  registryTransferSteps: TESSA_TRANSFER_STEPS,
  estimatedSettlementDays: 2,
};

export const PRC_INSTRUMENT_DEFAULTS: Partial<Instrument> = {
  instrumentType: 'PRC',
  instrumentCategory: 'certificate',
  displayName: 'Peak Reduction Certificate',
  ticker: 'PRC',
  unitOfMeasure: 'kW',
  currency: 'AUD',
  issuer: 'NSW PDRS',
  registryName: 'TESSA',
  jurisdictions: ['NSW'],
  regulatoryClassification: 'not_financial_product',
  complianceFlags: [],
};

// ---------------------------------------------------------------------------
// ACCU — Australian Carbon Credit Unit (ERF)
// ---------------------------------------------------------------------------

export const ACCU_PRICING: InstrumentPricingConfig = {
  instrumentType: 'ACCU',
  spotPriceSource: 'scraped',
  spotPriceUpdateInterval: 86_400,
  fallbackPrice: 35.00,           // Mid-range across methods ($25-$50)
  anchorPrice: 35.00,
  anchorMethod: 'spot',
  priceFloor: 20.00,
  priceCeiling: 75.00,            // Premium methods (HIR, Indigenous co-benefits)
  maxConcessionPerRound: 0.04,    // 4% — more negotiable than ESCs
  maxTotalConcession: 0.15,       // 15%
  volumeDiscountThresholds: [
    { quantity: 10_000, discountPct: 1 },
    { quantity: 50_000, discountPct: 2.5 },
    { quantity: 100_000, discountPct: 4 },
  ],
  currency: 'AUD',
  unitOfMeasure: 'tCO2e',
};

export const ACCU_METADATA_DEFAULTS: Partial<CertificateMetadata> = {
  scheme: 'ERF',
  schemeAdministrator: 'CER',
  settlementMethod: 'registry_transfer',
  registryTransferSteps: CER_TRANSFER_STEPS,
  estimatedSettlementDays: 3,
};

export const ACCU_INSTRUMENT_DEFAULTS: Partial<Instrument> = {
  instrumentType: 'ACCU',
  instrumentCategory: 'certificate',
  displayName: 'Australian Carbon Credit Unit',
  ticker: 'ACCU',
  unitOfMeasure: 'tCO2e',
  currency: 'AUD',
  issuer: 'CER',
  registryName: 'TESSA',
  jurisdictions: ['AU'],
  regulatoryClassification: 'financial_product',
  complianceFlags: [],
};

// ---------------------------------------------------------------------------
// LGC — Large-scale Generation Certificate (RET)
// ---------------------------------------------------------------------------

export const LGC_PRICING: InstrumentPricingConfig = {
  instrumentType: 'LGC',
  spotPriceSource: 'scraped',
  spotPriceUpdateInterval: 86_400,
  fallbackPrice: 5.25,
  anchorPrice: 5.25,
  anchorMethod: 'spot',
  priceFloor: 2.00,
  priceCeiling: 15.00,
  maxConcessionPerRound: 0.04,
  maxTotalConcession: 0.15,
  volumeDiscountThresholds: [
    { quantity: 50_000, discountPct: 1 },
    { quantity: 200_000, discountPct: 2 },
    { quantity: 500_000, discountPct: 3 },
  ],
  currency: 'AUD',
  unitOfMeasure: 'MWh',
};

export const LGC_METADATA_DEFAULTS: Partial<CertificateMetadata> = {
  scheme: 'RET',
  schemeAdministrator: 'CER',
  settlementMethod: 'registry_transfer',
  registryTransferSteps: ['Trade Confirmed', 'Transfer Initiated in REC Registry', 'Transfer Recorded', 'Settlement Complete'],
  estimatedSettlementDays: 2,
};

export const LGC_INSTRUMENT_DEFAULTS: Partial<Instrument> = {
  instrumentType: 'LGC',
  instrumentCategory: 'certificate',
  displayName: 'Large-scale Generation Certificate',
  ticker: 'LGC',
  unitOfMeasure: 'MWh',
  currency: 'AUD',
  issuer: 'CER',
  registryName: 'TESSA',
  jurisdictions: ['AU'],
  regulatoryClassification: 'financial_product',
  complianceFlags: [],
};

// ---------------------------------------------------------------------------
// STC — Small-scale Technology Certificate (SRES)
// ---------------------------------------------------------------------------

export const STC_PRICING: InstrumentPricingConfig = {
  instrumentType: 'STC',
  spotPriceSource: 'scraped',
  spotPriceUpdateInterval: 86_400,
  fallbackPrice: 39.50,
  anchorPrice: 39.50,
  anchorMethod: 'spot',
  priceFloor: 35.00,
  priceCeiling: 40.00,            // Clearing house price caps effective ceiling
  maxConcessionPerRound: 0.02,    // 2% — very tight, near clearing house price
  maxTotalConcession: 0.05,       // 5% — minimal room given price band
  volumeDiscountThresholds: [
    { quantity: 10_000, discountPct: 0.5 },
    { quantity: 50_000, discountPct: 1 },
    { quantity: 100_000, discountPct: 1.5 },
  ],
  currency: 'AUD',
  unitOfMeasure: 'MWh',
};

export const STC_METADATA_DEFAULTS: Partial<CertificateMetadata> = {
  scheme: 'SRES',
  schemeAdministrator: 'CER',
  settlementMethod: 'registry_transfer',
  registryTransferSteps: ['Trade Confirmed', 'STC Clearing House Transfer', 'Transfer Recorded', 'Settlement Complete'],
  estimatedSettlementDays: 1,
};

export const STC_INSTRUMENT_DEFAULTS: Partial<Instrument> = {
  instrumentType: 'STC',
  instrumentCategory: 'certificate',
  displayName: 'Small-scale Technology Certificate',
  ticker: 'STC',
  unitOfMeasure: 'MWh',
  currency: 'AUD',
  issuer: 'CER',
  registryName: 'TESSA',
  jurisdictions: ['AU'],
  regulatoryClassification: 'financial_product',
  complianceFlags: [],
};
