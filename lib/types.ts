export type ArgumentClassification =
  | 'price_challenge'
  | 'fairness_appeal'
  | 'time_pressure'
  | 'information_request'
  | 'relationship_signal'
  | 'authority_constraint'
  | 'emotional_expression'
  | 'general';

export type EmotionalState =
  | 'frustrated'
  | 'enthusiastic'
  | 'sceptical'
  | 'satisfied'
  | 'neutral'
  | 'pressured';

export type NegotiationPhase =
  | 'opening'
  | 'elicitation'
  | 'negotiation'
  | 'closure'
  | 'escalation';

export type PersonaType =
  | 'compliance_officer'
  | 'esg_fund_manager'
  | 'trading_desk'
  | 'sustainability_director'
  | 'government_procurement'
  // WREI Institutional Personas
  | 'infrastructure_fund'
  | 'esg_impact_investor'
  | 'defi_yield_farmer'
  | 'family_office'
  | 'sovereign_wealth'
  | 'pension_fund';

export type NegotiationOutcome = 'agreed' | 'deferred' | 'escalated' | null;

export type CreditType = 'carbon' | 'esc' | 'both';

// WREI Dual Token System Types
export type WREITokenType = 'carbon_credits' | 'asset_co' | 'dual_portfolio';

export type YieldMechanism = 'revenue_share' | 'nav_accruing';

export type InvestorClassification = 'retail' | 'wholesale' | 'professional' | 'sophisticated';

export type MarketType = 'primary' | 'secondary';

// Carbon Credit Token Specific Types
export interface CarbonCreditToken {
  tokenId: string;
  tonnageCO2e: number;
  verificationStandards: ('ISO_14064_2' | 'Verra_VCS' | 'Gold_Standard')[];
  generationSource: 'vessel_efficiency' | 'modal_shift' | 'construction_avoidance';
  vesselTripId?: string;
  blockchainHash: string;
  mintDate: string;
  retirementStatus: 'active' | 'retired';
  provenance: {
    vesselId: string;
    route: string;
    energyData: {
      consumption: number; // kWh/passenger-km
      passengers: number;
      distance: number;
    };
    emissionsSaved: number; // tonnes CO2e
  };
}

// Asset Co Token Specific Types
export interface AssetCoToken {
  tokenId: string;
  fractionalInterest: number; // Percentage of LeaseCo ownership
  underlyingAssets: {
    vesselCount: number;
    deepPowerUnits: number;
    totalCapex: number; // A$
  };
  yieldProfile: {
    mechanism: YieldMechanism;
    annualYield: number; // Percentage
    distributionFrequency: 'monthly' | 'quarterly' | 'annually';
    lastDistribution?: string;
    nextDistribution?: string;
  };
  leaseIncome: {
    annualIncome: number; // A$
    netCashFlow: number; // A$ after debt service
    debtServiceCoverage: number;
  };
  navData: {
    currentNAV: number; // A$ per token
    historicalNAV: { date: string; value: number }[];
  };
}

export interface Message {
  role: 'agent' | 'buyer';
  content: string;
  timestamp: string;
  argumentClassification?: ArgumentClassification;
  emotionalState?: EmotionalState;
}

export interface BuyerProfile {
  persona: PersonaType | 'freeplay';
  detectedWarmth: number;       // 1-10
  detectedDominance: number;    // 1-10
  priceAnchor: number | null;
  volumeInterest: number | null;
  timelineUrgency: 'low' | 'medium' | 'high' | null;
  complianceDriver: string | null;
  creditType: CreditType;       // Legacy: What type of credits they want
  escEligibilityBasis: string | null;  // NSW ESS eligibility (lighting, HVAC, etc)

  // WREI Dual Token System Extensions
  wreiTokenType: WREITokenType; // Primary token interest
  investorClassification: InvestorClassification;
  marketPreference: MarketType;
  yieldMechanismPreference: YieldMechanism | null;
  portfolioContext: {
    aum?: number; // Assets under management (A$)
    ticketSize: { min: number; max: number }; // Investment range (A$)
    yieldRequirement: number; // Minimum yield expectation
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    liquidityNeeds: 'daily' | 'monthly' | 'quarterly' | 'annual';
    esgFocus: boolean;
    crossCollateralInterest: boolean;
  };
  complianceRequirements: {
    aflsRequired: boolean;
    amlCompliance: boolean;
    taxTreatmentPreference: 'cgt' | 'income' | 'either';
    jurisdictionalConstraints: string[];
  };
}

export interface NegotiationState {
  round: number;
  phase: NegotiationPhase;
  creditType: CreditType; // Legacy support
  anchorPrice: number;
  currentOfferPrice: number;
  priceFloor: number;
  maxConcessionPerRound: number;
  maxTotalConcession: number;
  totalConcessionGiven: number;
  roundsSinceLastConcession: number;
  minimumRoundsBeforeConcession: number;
  messages: Message[];
  buyerProfile: BuyerProfile;
  argumentHistory: ArgumentClassification[];
  emotionalState: EmotionalState;
  negotiationComplete: boolean;
  outcome: NegotiationOutcome;
  // ESC-specific fields (legacy)
  escAnchorPrice?: number;
  escCurrentOfferPrice?: number;
  escPriceFloor?: number;

  // WREI Dual Token System
  wreiTokenType: WREITokenType;
  tokenSpecificData: {
    carbonCredits?: {
      projectedSupply: number; // Base case: 3.12M, Expansion: 13.1M tonnes
      currentPrice: number; // A$/tonne
      premiumMultiplier: number; // 1.5x base price
      totalRevenue: number; // Cumulative projection A$
      steadyStateRevenue: number; // Annual A$
      generationSources: {
        vesselEfficiency: number; // % of total
        modalShift: number; // % of total
        constructionAvoidance: number; // % of total
      };
    };
    assetCo?: {
      equityCapitalization: number; // A$131M
      totalCapex: number; // A$473M
      debtFunding: number; // A$342M at 7%
      netCashFlow: number; // A$/annual after debt service
      equityYield: number; // 28.3% at steady state
      cashOnCashMultiple: number; // 3.0x lifetime
      fleetComposition: {
        vesselCount: number; // 88 vessels
        deepPowerUnits: number; // 22 units
      };
      leaseProfile: {
        annualIncome: number; // A$61.1M steady state
        interestCost: number; // A$23.9M annual
        netMargin: number; // 60.8%
      };
    };
  };

  marketContext: {
    marketType: MarketType;
    liquidityConditions: 'high' | 'medium' | 'low';
    competitivePressure: number; // 1-10 scale
    regulatoryEnvironment: 'favorable' | 'neutral' | 'challenging';
  };
}

export interface ClaudeResponse {
  response: string;
  argumentClassification: ArgumentClassification;
  emotionalState: EmotionalState;
  detectedWarmth: number;
  detectedDominance: number;
  proposedPrice: number | null;
  suggestedConcession: string | null;
  escalate: boolean;
  escalationReason: string | null;
}

export interface PersonaDefinition {
  id: PersonaType;
  name: string;
  title: string;
  organisation: string;
  warmth: number;         // 1-10
  dominance: number;      // 1-10
  patience: number;       // 1-10
  primaryMotivation: string;
  budgetRange: string;
  volumeTarget: string;
  briefing: string;       // shown to the human tester
  agentStrategy: string;  // embedded in the system prompt for Claude
}