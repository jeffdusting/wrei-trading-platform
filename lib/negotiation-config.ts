import { NegotiationState, PersonaType, CreditType, WREITokenType, InvestorClassification } from './types';

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

// WREI Dual Token System Configuration (from Tokenization Document)
export const WREI_TOKEN_CONFIG = {
  // Carbon Credit Token Configuration
  CARBON_CREDITS: {
    BASE_PRICE: 100,              // A$/tonne (document specification)
    WREI_PREMIUM: 1.5,            // 1.5x multiplier
    ANCHOR_PRICE: 150,            // A$150/tonne (document specification)
    PRICE_FLOOR: 120,             // A$120/tonne minimum (document specification)

    // Supply Projections (from document)
    BASE_CASE: {
      TRADEABLE_CREDITS: 3_120_000,     // tonnes (2027-2040)
      TOTAL_REVENUE: 468_000_000,       // A$ cumulative
      STEADY_STATE_ANNUAL: 33_400_000,  // A$ annual (2031-2037)
    },
    EXPANSION_CASE: {
      TRADEABLE_CREDITS: 13_100_000,    // tonnes (with Hyke routes)
      TOTAL_REVENUE: 1_970_000_000,     // A$ cumulative
      STEADY_STATE_ANNUAL: 141_000_000, // A$ annual
    },

    // Generation Sources (from document)
    EMISSION_SOURCES: {
      VESSEL_EFFICIENCY: {
        ELECTRIC_CONSUMPTION: 0.12,     // kWh/passenger-km
        DIESEL_BASELINE: 3.31,          // kWh/passenger-km (Parramatta Class)
        CONTRIBUTION_PCT: 47.2,         // % of total credits
      },
      MODAL_SHIFT: {
        VEHICLE_BASELINE: 171,          // gCO2/km (Australian National Greenhouse Accounts)
        SHIFT_RATE: 0.40,              // 40% modal shift
        CONTRIBUTION_PCT: 47.9,         // % of total (community/societal)
      },
      CONSTRUCTION_AVOIDANCE: {
        AMORTIZATION_YEARS: 30,         // Infrastructure lifespan
        CONTRIBUTION_PCT: 4.8,          // % of total credits
      },
    },
  },

  // Asset Co Token Configuration
  ASSET_CO: {
    // LeaseCo Financial Profile (from document)
    TOTAL_CAPEX: 473_000_000,          // A$ (88 vessels + 22 Deep Power)
    DOWN_PAYMENT: 47_300_000,          // A$ (10% from OpCo)
    DEBT_FUNDING: 342_000_000,         // A$ at 7% interest-only
    TOKEN_EQUITY: 131_000_000,         // A$ (capex - debt)

    // Yield Profile
    STEADY_STATE: {
      ANNUAL_LEASE_INCOME: 61_100_000,  // A$ (2031-2037)
      ANNUAL_INTEREST_COST: 23_900_000, // A$ (7% on debt)
      NET_CASH_FLOW: 37_100_000,       // A$ after debt service
      EQUITY_YIELD: 0.283,             // 28.3% on token equity
      GROSS_LEASE_YIELD: 0.129,        // 12.9% on total capex
      NET_MARGIN: 0.608,               // 60.8%
    },

    // Lifetime Projections
    LIFETIME: {
      LEASE_INCOME: 671_700_000,       // A$ (2027-2040)
      NET_CASH_GENERATED: 395_400_000, // A$ after interest
      CASH_ON_CASH_MULTIPLE: 3.0,     // Total return multiple
      ENDING_CASH: 311_700_000,        // A$ at 2040 (covers 91% of debt)
    },

    // Fleet Composition
    FLEET: {
      VESSEL_COUNT: 88,                // Electric hydrofoils
      DEEP_POWER_UNITS: 22,           // BESS infrastructure
      RAMP_UP_YEARS: 4,               // Partial fleet 2027-2030
      STEADY_STATE_YEARS: 7,          // Full operations 2031-2037
    },
  },

  // Market Context (from document)
  MARKET_INTELLIGENCE: {
    TOKENIZED_RWA_MARKET: 19_000_000_000,    // A$19B (March 2026)
    RWA_GROWTH_RATE: 1.4,                    // 140% in 15 months
    TREASURY_TOKENS_AUM: 9_000_000_000,      // A$9B (USYC, BUIDL)
    CARBON_MARKET_2030: 155_000_000_000,     // A$155B projection
    DIGITAL_MRV_PREMIUM: 1.78,               // 78% premium benchmark
  },

  // Regulatory Framework (Australian focus)
  REGULATORY: {
    AFSL_REQUIRED: true,
    WHOLESALE_EXEMPTION: 's708',              // Corporations Act
    DAP_LICENSING: 'Digital Assets Framework Bill 2025',
    AML_CTF_DATE: '2026-03-31',              // AUSTRAC registration deadline
    TAX_CGT_DISCOUNT: 0.5,                   // 50% for 12+ months holding
  },
} as const;

// Legacy function for backward compatibility
export function getInitialState(persona: PersonaType | 'freeplay', creditType: CreditType = 'carbon'): NegotiationState {
  // Map legacy creditType to WREI token types
  const wreiTokenType: WREITokenType = creditType === 'esc' ? 'carbon_credits' :
                                       creditType === 'both' ? 'dual_portfolio' : 'carbon_credits';

  return getInitialWREIState(persona, wreiTokenType, creditType);
}

// New WREI token-aware initialization function
export function getInitialWREIState(
  persona: PersonaType | 'freeplay',
  wreiTokenType: WREITokenType = 'carbon_credits',
  legacyCreditType?: CreditType
): NegotiationState {

  // Determine pricing based on WREI token type
  const isAssetCo = wreiTokenType === 'asset_co';
  const isDualPortfolio = wreiTokenType === 'dual_portfolio';

  // Use WREI document specifications for pricing
  const anchorPrice = isAssetCo ?
    WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.EQUITY_YIELD * 100 : // Show as percentage for Asset Co
    WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE; // A$150/tonne for Carbon Credits

  const priceFloor = isAssetCo ?
    (WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.EQUITY_YIELD * 0.8) * 100 : // 80% of yield as floor
    WREI_TOKEN_CONFIG.CARBON_CREDITS.PRICE_FLOOR; // A$120/tonne for Carbon Credits

  return {
    round: 0,
    phase: 'opening',
    creditType: legacyCreditType || 'carbon', // Legacy support
    wreiTokenType,
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
      creditType: legacyCreditType || 'carbon',
      escEligibilityBasis: null,

      // WREI extensions
      wreiTokenType,
      investorClassification: getDefaultInvestorClassification(persona),
      marketPreference: 'primary',
      yieldMechanismPreference: isAssetCo ? 'nav_accruing' : 'revenue_share',
      portfolioContext: getDefaultPortfolioContext(persona),
      complianceRequirements: getDefaultComplianceRequirements(persona),
    },
    argumentHistory: [],
    emotionalState: 'neutral',
    negotiationComplete: false,
    outcome: null,

    // Legacy ESC support
    escAnchorPrice: legacyCreditType === 'esc' ? NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE : undefined,
    escCurrentOfferPrice: legacyCreditType === 'esc' ? NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE : undefined,
    escPriceFloor: legacyCreditType === 'esc' ? NEGOTIATION_CONFIG.ESC_PRICE_FLOOR : undefined,

    // WREI token-specific data
    tokenSpecificData: {
      carbonCredits: (!isAssetCo || isDualPortfolio) ? {
        projectedSupply: WREI_TOKEN_CONFIG.CARBON_CREDITS.BASE_CASE.TRADEABLE_CREDITS,
        currentPrice: WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE,
        premiumMultiplier: WREI_TOKEN_CONFIG.CARBON_CREDITS.WREI_PREMIUM,
        totalRevenue: WREI_TOKEN_CONFIG.CARBON_CREDITS.BASE_CASE.TOTAL_REVENUE,
        steadyStateRevenue: WREI_TOKEN_CONFIG.CARBON_CREDITS.BASE_CASE.STEADY_STATE_ANNUAL,
        generationSources: {
          vesselEfficiency: WREI_TOKEN_CONFIG.CARBON_CREDITS.EMISSION_SOURCES.VESSEL_EFFICIENCY.CONTRIBUTION_PCT,
          modalShift: WREI_TOKEN_CONFIG.CARBON_CREDITS.EMISSION_SOURCES.MODAL_SHIFT.CONTRIBUTION_PCT,
          constructionAvoidance: WREI_TOKEN_CONFIG.CARBON_CREDITS.EMISSION_SOURCES.CONSTRUCTION_AVOIDANCE.CONTRIBUTION_PCT,
        },
      } : undefined,

      assetCo: (isAssetCo || isDualPortfolio) ? {
        equityCapitalization: WREI_TOKEN_CONFIG.ASSET_CO.TOKEN_EQUITY,
        totalCapex: WREI_TOKEN_CONFIG.ASSET_CO.TOTAL_CAPEX,
        debtFunding: WREI_TOKEN_CONFIG.ASSET_CO.DEBT_FUNDING,
        netCashFlow: WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.NET_CASH_FLOW,
        equityYield: WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.EQUITY_YIELD,
        cashOnCashMultiple: WREI_TOKEN_CONFIG.ASSET_CO.LIFETIME.CASH_ON_CASH_MULTIPLE,
        fleetComposition: {
          vesselCount: WREI_TOKEN_CONFIG.ASSET_CO.FLEET.VESSEL_COUNT,
          deepPowerUnits: WREI_TOKEN_CONFIG.ASSET_CO.FLEET.DEEP_POWER_UNITS,
        },
        leaseProfile: {
          annualIncome: WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.ANNUAL_LEASE_INCOME,
          interestCost: WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.ANNUAL_INTEREST_COST,
          netMargin: WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.NET_MARGIN,
        },
      } : undefined,
    },

    marketContext: {
      marketType: 'primary',
      liquidityConditions: 'medium',
      competitivePressure: 5,
      regulatoryEnvironment: 'favorable',
    },
  };
}

// Helper functions for default buyer profile data
function getDefaultInvestorClassification(persona: PersonaType | 'freeplay'): InvestorClassification {
  switch (persona) {
    case 'infrastructure_fund':
    case 'sovereign_wealth':
    case 'pension_fund':
      return 'professional';
    case 'family_office':
    case 'esg_fund_manager':
      return 'sophisticated';
    case 'defi_yield_farmer':
      return 'wholesale';
    default:
      return 'retail';
  }
}

function getDefaultPortfolioContext(persona: PersonaType | 'freeplay') {
  const defaults = {
    ticketSize: { min: 10_000, max: 100_000 },
    yieldRequirement: 0.08,
    riskTolerance: 'moderate' as const,
    liquidityNeeds: 'quarterly' as const,
    esgFocus: false,
    crossCollateralInterest: false,
  };

  switch (persona) {
    case 'infrastructure_fund':
      return {
        ...defaults,
        aum: 5_000_000_000,
        ticketSize: { min: 10_000_000, max: 100_000_000 },
        yieldRequirement: 0.12,
        riskTolerance: 'conservative' as const,
        liquidityNeeds: 'quarterly' as const,
      };
    case 'family_office':
      return {
        ...defaults,
        aum: 500_000_000,
        ticketSize: { min: 1_000_000, max: 10_000_000 },
        yieldRequirement: 0.10,
        esgFocus: true,
      };
    case 'defi_yield_farmer':
      return {
        ...defaults,
        ticketSize: { min: 100_000, max: 1_000_000 },
        yieldRequirement: 0.15,
        riskTolerance: 'aggressive' as const,
        liquidityNeeds: 'daily' as const,
        crossCollateralInterest: true,
      };
    default:
      return defaults;
  }
}

function getDefaultComplianceRequirements(persona: PersonaType | 'freeplay') {
  return {
    aflsRequired: ['infrastructure_fund', 'pension_fund', 'sovereign_wealth'].includes(persona),
    amlCompliance: true,
    taxTreatmentPreference: 'cgt' as const,
    jurisdictionalConstraints: ['AU'], // Australian focus
  };
}