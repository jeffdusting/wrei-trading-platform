// =============================================================================
// WREI Platform — Instrument Registry
// Single lookup point for all instrument-related configuration
// Maps InstrumentType to its pricing config, metadata defaults, and
// instrument defaults. Used by the pricing engine and context builders.
// =============================================================================

import {
  InstrumentType,
  InstrumentCategory,
  InstrumentPricingConfig,
  Instrument,
} from './types';

import {
  ESC_PRICING, ESC_INSTRUMENT_DEFAULTS,
  VEEC_PRICING, VEEC_INSTRUMENT_DEFAULTS,
  PRC_PRICING, PRC_INSTRUMENT_DEFAULTS,
  ACCU_PRICING, ACCU_INSTRUMENT_DEFAULTS,
  LGC_PRICING, LGC_INSTRUMENT_DEFAULTS,
  STC_PRICING, STC_INSTRUMENT_DEFAULTS,
} from './certificate-config';

import { WREI_CC_PRICING, WREI_CC_INSTRUMENT_DEFAULTS } from './carbon-token-config';
import { WREI_ACO_PRICING, WREI_ACO_INSTRUMENT_DEFAULTS } from './asset-token-config';

// ---------------------------------------------------------------------------
// Registry Entry
// ---------------------------------------------------------------------------

export interface InstrumentRegistryEntry {
  instrumentType: InstrumentType;
  category: InstrumentCategory;
  pricing: InstrumentPricingConfig;
  instrumentDefaults: Partial<Instrument>;
  /** Negotiation style hint for the AI agent context builder */
  negotiationStyle: string;
  /** Key considerations the agent should weigh during negotiation */
  keyConsiderations: string[];
}

// ---------------------------------------------------------------------------
// Registry Data
// ---------------------------------------------------------------------------

const REGISTRY: Record<InstrumentType, InstrumentRegistryEntry> = {
  ESC: {
    instrumentType: 'ESC',
    category: 'certificate',
    pricing: ESC_PRICING,
    instrumentDefaults: ESC_INSTRUMENT_DEFAULTS,
    negotiationStyle: 'Price-anchored bilateral',
    keyConsiderations: [
      'Penalty rate (A$29.48) as effective ceiling',
      'Creation cost (~A$15-18) as floor reference',
      'Vintage affects quality perception',
      'Compliance deadline urgency creates leverage',
      'Activity type (lighting, HVAC, motors) influences value',
    ],
  },
  VEEC: {
    instrumentType: 'VEEC',
    category: 'certificate',
    pricing: VEEC_PRICING,
    instrumentDefaults: VEEC_INSTRUMENT_DEFAULTS,
    negotiationStyle: 'Price-anchored bilateral',
    keyConsiderations: [
      'Higher value (~A$83) than ESCs — larger ticket negotiation',
      'Scheme target changes are critical price drivers',
      'Activity type affects quality perception',
      'Victorian market dynamics differ from NSW',
    ],
  },
  PRC: {
    instrumentType: 'PRC',
    category: 'certificate',
    pricing: PRC_PRICING,
    instrumentDefaults: PRC_INSTRUMENT_DEFAULTS,
    negotiationStyle: 'Price-anchored bilateral',
    keyConsiderations: [
      'Low unit value — volume is the key negotiation lever',
      'Peak demand reduction methodology is differentiator',
      'Newer scheme with evolving market dynamics',
    ],
  },
  ACCU: {
    instrumentType: 'ACCU',
    category: 'certificate',
    pricing: ACCU_PRICING,
    instrumentDefaults: ACCU_INSTRUMENT_DEFAULTS,
    negotiationStyle: 'Method-aware bilateral',
    keyConsiderations: [
      'Price varies significantly by method type (HIR vs savanna vs energy efficiency)',
      'Co-benefits (Indigenous, biodiversity) command premium',
      'Safeguard Mechanism demand creates price support',
      'Financial product — AFSL considerations apply',
    ],
  },
  LGC: {
    instrumentType: 'LGC',
    category: 'certificate',
    pricing: LGC_PRICING,
    instrumentDefaults: LGC_INSTRUMENT_DEFAULTS,
    negotiationStyle: 'Volume-focused bilateral',
    keyConsiderations: [
      'Oversupplied market — price is low (~A$5.25)',
      'RET scheme maturity reduces compliance urgency',
      'Large-volume transactions are the norm',
      'Financial product classification',
    ],
  },
  STC: {
    instrumentType: 'STC',
    category: 'certificate',
    pricing: STC_PRICING,
    instrumentDefaults: STC_INSTRUMENT_DEFAULTS,
    negotiationStyle: 'Narrow-band bilateral',
    keyConsiderations: [
      'Clearing house price (~A$40) caps the effective ceiling',
      'Very tight price band — minimal negotiation room',
      'High liquidity via clearing house',
      'Solar installation volumes drive supply',
    ],
  },
  WREI_CC: {
    instrumentType: 'WREI_CC',
    category: 'carbon_token',
    pricing: WREI_CC_PRICING,
    instrumentDefaults: WREI_CC_INSTRUMENT_DEFAULTS,
    negotiationStyle: 'Premium-justified',
    keyConsiderations: [
      'Must articulate WREI verification premium credibly',
      'Reference dMRV benchmarks (1.78x premium is market norm)',
      'Provenance depth (vessel telemetry) as value driver',
      'T+0 on-chain settlement as institutional advantage',
      'Retirement eligibility (Safeguard, CORSIA, ISSB S2) adds value',
    ],
  },
  WREI_ACO: {
    instrumentType: 'WREI_ACO',
    category: 'asset_token',
    pricing: WREI_ACO_PRICING,
    instrumentDefaults: WREI_ACO_INSTRUMENT_DEFAULTS,
    negotiationStyle: 'Yield-focused',
    keyConsiderations: [
      'Negotiation centres on yield expectations, not spot price',
      'NAV discount/premium is the core bargaining variable',
      'Quarterly redemption terms and distribution frequency matter',
      'Comparable infrastructure yields (REITs at 8%) are the benchmark',
      'Wholesale only — s708 exemption required',
      'AFSL compliance is non-negotiable',
    ],
  },
};

// ---------------------------------------------------------------------------
// Lookup Functions
// ---------------------------------------------------------------------------

/** Get the full registry entry for an instrument type */
export function getRegistryEntry(type: InstrumentType): InstrumentRegistryEntry {
  return REGISTRY[type];
}

/** Get pricing config for an instrument type */
export function getPricingConfig(type: InstrumentType): InstrumentPricingConfig {
  return REGISTRY[type].pricing;
}

/** Get instrument defaults for an instrument type */
export function getInstrumentDefaults(type: InstrumentType): Partial<Instrument> {
  return REGISTRY[type].instrumentDefaults;
}

/** Get the category for an instrument type */
export function getCategory(type: InstrumentType): InstrumentCategory {
  return REGISTRY[type].category;
}

/** Get all instrument types in a category */
export function getTypesByCategory(category: InstrumentCategory): InstrumentType[] {
  return Object.values(REGISTRY)
    .filter(entry => entry.category === category)
    .map(entry => entry.instrumentType);
}

/** Get all registered instrument types */
export function getAllInstrumentTypes(): InstrumentType[] {
  return Object.keys(REGISTRY) as InstrumentType[];
}

/** Get all certificate types (convenience) */
export function getCertificateTypes(): InstrumentType[] {
  return getTypesByCategory('certificate');
}

/** Get all token types (convenience) */
export function getTokenTypes(): InstrumentType[] {
  return [
    ...getTypesByCategory('carbon_token'),
    ...getTypesByCategory('asset_token'),
  ];
}
