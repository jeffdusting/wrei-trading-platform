import { NegotiationState, PersonaType } from './types';

// WREI Pricing Index — in production, this would be a live feed from
// market signals (VCM spot, forward removal contracts, dMRV comparables).
// For the demo, these are configurable reference values that the agent
// treats as dynamic market data rather than hardcoded prices.
export const PRICING_INDEX = {
  VCM_SPOT_REFERENCE: 6.34,       // Current VCM spot average (USD, EM SOVCM 2025)
  FORWARD_REMOVAL_REFERENCE: 180,  // Forward removal contract reference (USD, Sylvera SOCC 2025)
  DMRV_PREMIUM_BENCHMARK: 1.78,   // 78% premium for digital MRV credits
  CCP_PREMIUM_LOW: 1.15,          // CCP label premium range low
  CCP_PREMIUM_HIGH: 1.25,         // CCP label premium range high
  INDEX_DATE: '2026-03-20',       // Date of last index update
} as const;

export const NEGOTIATION_CONFIG = {
  // Carbon Credit Pricing
  BASE_CARBON_PRICE: 100,          // WREI Pricing Index reference (USD/tonne)
  WREI_PREMIUM_MULTIPLIER: 1.5,
  ANCHOR_PRICE: 150,               // 1.5× index reference
  PRICE_FLOOR: 120,                // 1.2× index reference — absolute minimum

  // NSW ESS/ESC Pricing (AUD per ESC)
  ESC_MARKET_REFERENCE: 42,        // Current NSW ESC spot price (AUD)
  ESC_WREI_PREMIUM_MULTIPLIER: 1.25,
  ESC_ANCHOR_PRICE: 52.50,         // 1.25× market reference (AUD per ESC)
  ESC_PRICE_FLOOR: 45,             // 1.07× market reference — absolute minimum

  // Common negotiation parameters
  MAX_CONCESSION_PER_ROUND: 0.05,  // 5%
  MAX_TOTAL_CONCESSION: 0.20,      // 20% from anchor
  MIN_ROUNDS_BEFORE_PRICE_CONCESSION: 3,
  MAX_ROUNDS_BEFORE_ESCALATION: 8,

  // Volume ranges
  AVAILABLE_CARBON_VOLUMES: [1000, 5000, 10000, 50000, 100000], // tCO2e
  AVAILABLE_ESC_VOLUMES: [5000, 25000, 50000, 100000, 500000],   // ESCs

  // Infrastructure references (displayed in UI and used in agent knowledge)
  SETTLEMENT_PROVIDER: 'Zoniqx zConnect',
  TOKEN_STANDARD: 'Zoniqx zProtocol (DyCIST / ERC-7518)',
  COMPLIANCE_ENGINE: 'Zoniqx zCompliance',
  IDENTITY_PROVIDER: 'Zoniqx zIdentity',
} as const;

export function getInitialState(persona: PersonaType | 'freeplay', creditType: CreditType = 'carbon'): NegotiationState {
  // Use carbon credit pricing by default, ESC pricing when specified
  const isESC = creditType === 'esc';
  const anchorPrice = isESC ? NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE : NEGOTIATION_CONFIG.ANCHOR_PRICE;
  const priceFloor = isESC ? NEGOTIATION_CONFIG.ESC_PRICE_FLOOR : NEGOTIATION_CONFIG.PRICE_FLOOR;

  return {
    round: 0,
    phase: 'opening',
    creditType,
    anchorPrice,
    currentOfferPrice: anchorPrice,
    priceFloor,
    maxConcessionPerRound: NEGOTIATION_CONFIG.MAX_CONCESSION_PER_ROUND,
    maxTotalConcession: NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION,
    totalConcessionGiven: 0,
    roundsSinceLastConcession: 0,
    minimumRoundsBeforeConcession: NEGOTIATION_CONFIG.MIN_ROUNDS_BEFORE_PRICE_CONCESSION,
    messages: [],
    buyerProfile: {
      persona,
      detectedWarmth: 5,
      detectedDominance: 5,
      priceAnchor: null,
      volumeInterest: null,
      timelineUrgency: null,
      complianceDriver: null,
      creditType,
      escEligibilityBasis: null,
    },
    argumentHistory: [],
    emotionalState: 'neutral',
    negotiationComplete: false,
    outcome: null,
    // ESC-specific pricing (when applicable)
    escAnchorPrice: isESC ? NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE : undefined,
    escCurrentOfferPrice: isESC ? NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE : undefined,
    escPriceFloor: isESC ? NEGOTIATION_CONFIG.ESC_PRICE_FLOOR : undefined,
  };
}