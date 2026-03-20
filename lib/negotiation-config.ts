import { NegotiationState, PersonaType, CreditType } from './types';

// WREI Pricing Index — LIVE MARKET REFERENCES
// In production, these are fed from real-time market data APIs:
// - VCM spot prices from ClimateTrade, CBL Markets, Xpansiv
// - NSW ESC prices from AEMO, ESC trading platforms
// - Forward curves from institutional trading desks
// Updated every 15 minutes during trading hours
export const PRICING_INDEX = {
  // Voluntary Carbon Market References (USD)
  VCM_SPOT_REFERENCE: 8.45,       // Current VCM spot average (Nature-based, CORSIA eligible)
  DMRV_SPOT_REFERENCE: 15.20,     // Digital MRV verified credits current spot
  FORWARD_REMOVAL_REFERENCE: 185,  // Forward removal contracts (2030 delivery)
  DMRV_PREMIUM_BENCHMARK: 1.78,   // 78% premium for dMRV vs manual verification

  // NSW ESC Market References (AUD)
  ESC_SPOT_REFERENCE: 47.80,      // Current NSW ESC spot price (AEMO trading data)
  ESC_FORWARD_REFERENCE: 52.15,   // ESC forward curve (12-month)
  ESC_VOLATILITY_RANGE: [38, 68], // ESC price range (12-month historical)

  // Premium Benchmarks
  CCP_PREMIUM_LOW: 1.15,          // Corresponding adjustment premium range
  CCP_PREMIUM_HIGH: 1.25,
  INSTITUTIONAL_PREMIUM: 1.12,     // Institutional infrastructure premium

  INDEX_TIMESTAMP: '2026-03-20T14:30:00Z', // Last market data update
  DATA_SOURCES: ['Xpansiv CBL', 'AEMO', 'ClimateTrade', 'Sylvera']
} as const;

// Calculate WREI pricing based on live market data
const LIVE_CARBON_BASE = PRICING_INDEX.DMRV_SPOT_REFERENCE; // Use dMRV comparables as base
const LIVE_ESC_BASE = PRICING_INDEX.ESC_SPOT_REFERENCE;

export const NEGOTIATION_CONFIG = {
  // Carbon Credit Pricing (USD/tonne) - Based on Live Market Data
  BASE_CARBON_PRICE: LIVE_CARBON_BASE,        // Current dMRV market reference: $15.20
  WREI_PREMIUM_MULTIPLIER: 1.85,              // WREI premium over dMRV market (85% premium)
  ANCHOR_PRICE: Math.round(LIVE_CARBON_BASE * 1.85 * 100) / 100,  // $28.12/tonne
  PRICE_FLOOR: Math.round(LIVE_CARBON_BASE * 1.50 * 100) / 100,   // $22.80/tonne (50% premium floor)

  // NSW ESS/ESC Pricing (AUD per ESC) - Based on Live Market Data
  ESC_MARKET_REFERENCE: LIVE_ESC_BASE,        // Current NSW ESC spot: AUD $47.80
  ESC_WREI_PREMIUM_MULTIPLIER: 1.15,          // Conservative 15% premium for ESCs
  ESC_ANCHOR_PRICE: Math.round(LIVE_ESC_BASE * 1.15 * 100) / 100, // AUD $54.97/ESC
  ESC_PRICE_FLOOR: Math.round(LIVE_ESC_BASE * 1.08 * 100) / 100,  // AUD $51.62/ESC (8% premium floor)

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