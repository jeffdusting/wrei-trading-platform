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
  wreiTokenType?: WREITokenType;
  marketType?: MarketType;
  investorClassification?: InvestorClassification;
  tokenSpecificData?: {
    // Market Access Context
    targetAllocation?: number; // A$ investment amount
    primaryMarketMinimum?: number; // Minimum for primary market access
    secondaryMarketLiquidity?: boolean; // Secondary market available
    fractionalAccess?: boolean; // Allow fractional ownership
    marketMakingSpread?: number; // Bid-ask spread
    institutionalTierPricing?: boolean; // Institutional pricing available
    wholesaleExemption?: string; // AFSL exemption category
    minimumInvestment?: number; // Minimum investment threshold
    primaryMarketAccess?: boolean; // Primary market eligibility
    regulatoryPriority?: boolean; // Government/sovereign priority
    earlyAccessTerms?: {
      discountRate?: number; // Early allocation discount
      lockupPeriod?: number; // Months locked
    };

    // AFSL Compliance
    aflsCompliance?: {
      exemptionCategory?: string; // wholesale, professional, sophisticated
      accreditationRequired?: boolean;
      disclosureLevel?: string; // minimal, standard, comprehensive
    };

    // Professional/Sophisticated Features
    professionalInvestorStatus?: boolean;
    enhancedDueDiligence?: {
      trusteeApproval?: boolean;
      actuarialAssessment?: boolean;
      memberImpactAnalysis?: boolean;
      apraCompliance?: boolean;
    };
    fiduciaryFramework?: {
      memberBenefit?: string;
      riskAssessment?: string;
      esgAlignment?: string;
    };
    sophisticatedStructures?: {
      leveragedExposure?: boolean;
      crossCollateral?: boolean;
      apiAccess?: boolean;
      automatedStrategies?: boolean;
    };

    // DeFi Integration
    defiIntegration?: {
      smartContractAccess?: boolean;
      protocolCompatibility?: string[];
      ltvRatio?: number;
    };

    // Redemption Terms
    redemptionTerms?: {
      frequency?: string; // quarterly, monthly, etc.
      noticePeriod?: number; // days
      minimumHoldingPeriod?: number; // days
      redemptionFee?: number; // percentage
      navDiscount?: number; // discount to NAV
      liquidityReserve?: number; // percentage kept liquid
    };

    // Trading Terms
    tradingTerms?: {
      immediateTrading?: boolean;
      settlementWindow?: number; // T+0, T+1, etc.
      liquidityProvider?: string;
      marketMaking?: boolean;
      bidAskSpread?: number;
    };

    // Retirement Flexibility
    retirementFlexibility?: {
      immediateRetirement?: boolean;
      scheduledRetirement?: boolean;
      batchProcessing?: boolean;
    };

    // Rebalancing Terms
    rebalancingTerms?: {
      frequency?: string;
      automaticRebalancing?: boolean;
      targetAllocation?: { carbon?: number; asset_co?: number };
      rebalancingThreshold?: number; // deviation threshold
      rebalancingFee?: number;
    };

    redemptionFlexibility?: {
      partialRedemption?: boolean;
      crossAssetRedemption?: boolean;
      familyGovernanceApproval?: boolean;
    };

    // Cross-Collateralization
    crossCollateralization?: {
      maxLtv?: number; // Loan-to-value ratio
      borrowingCurrency?: string[];
      interestRateRange?: { min: number; max: number };
      marginCallThreshold?: number;
      liquidationThreshold?: number;
      protocolIntegration?: string[];
    };

    leverageStrategies?: {
      carbonExposure?: boolean;
      yieldFarming?: boolean;
      arbitrage?: boolean;
      hedging?: boolean;
    };

    // Staking and Collateral
    stakingMechanisms?: {
      liquidityPooling?: boolean;
      stakingYield?: number; // additional APY
      impermanentLossProtection?: boolean;
      stakingPenalty?: number; // early unstaking penalty
    };

    collateralValue?: {
      baseValue?: number; // percentage of token value
      volatilityDiscount?: number; // haircut for volatility
      liquidityPremium?: number; // premium for liquidity provision
    };

    // Portfolio-Level Features
    portfolioLeverage?: {
      correlationBenefit?: number; // leverage increase from low correlation
      diversificationBonus?: number; // additional LTV from diversification
      riskWeighting?: { carbon?: number; asset_co?: number };
      maxPortfolioLeverage?: number; // maximum combined leverage
    };

    strategicArbitrage?: {
      yieldCurvePositioning?: boolean;
      seasonalRebalancing?: boolean;
      taxOptimization?: boolean;
      generationalPlanning?: boolean;
    };

    // Legacy token data
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

// =============================================================================
// PHASE 2: FINANCIAL MODELING INTERFACES
// =============================================================================

export interface FinancialMetrics {
  irr: number; // Internal Rate of Return (annualised)
  cashOnCash: number; // Cash-on-cash return multiple
  npv: number; // Net Present Value at discount rate
  paybackPeriod: number; // Years to recover initial investment
  riskAdjustedReturn: number; // Risk-adjusted IRR
  totalReturn: number; // Total return over holding period
  yieldOnCost: number; // Annual yield on initial investment
  compoundAnnualGrowthRate: number; // CAGR
}

export interface CashFlow {
  date: string; // ISO date string
  amount: number; // A$ cash flow (positive = inflow, negative = outflow)
  type: 'initial_investment' | 'quarterly_distribution' | 'lease_income' | 'capital_appreciation' | 'exit_value';
  description: string;
  taxable: boolean;
  taxRate?: number;
}

export interface InvestmentScenario {
  initialInvestment: number; // A$
  holdingPeriod: number; // Years
  exitMultiple?: number; // Exit value as multiple of initial investment
  discountRate: number; // Required return for NPV calculation
  taxRate: number; // Marginal tax rate
  inflationRate: number; // Annual inflation rate
}

export interface RiskProfile {
  volatility: number; // Annualised volatility (standard deviation)
  sharpeRatio: number; // Risk-adjusted return ratio
  maxDrawdown: number; // Maximum peak-to-trough decline
  correlationToMarket: number; // Correlation with broader market
  liquidityRisk: 'low' | 'medium' | 'high';
  operationalRisk: 'low' | 'medium' | 'high';
  regulatoryRisk: 'low' | 'medium' | 'high';
}

export interface YieldModelDefinition {
  type: 'revenue_share' | 'nav_accruing';
  tokenType: WREITokenType;
  description: string;
  distributionFrequency: 'quarterly' | 'annual' | 'continuous';
  expectedYield: number; // Annual expected yield
  riskProfile: RiskProfile;
  taxImplications: {
    incomeTax: boolean;
    capitalGainsTax: boolean;
    dividendImputation: boolean;
  };
}

export interface DistributionSchedule {
  date: string; // ISO date string
  amount: number; // A$ per token
  type: 'interest' | 'dividend' | 'capital_gain' | 'lease_income';
  taxTreatment: 'income' | 'capital_gains' | 'dividend_imputation';
}

export interface PortfolioAnalysis {
  tokenType: WREITokenType;
  allocation: number; // Percentage of total portfolio
  financialMetrics: FinancialMetrics;
  riskProfile: RiskProfile;
  yieldModel: YieldModelDefinition;
  distributionSchedule: DistributionSchedule[];
  complianceStatus: {
    aflsCompliant: boolean;
    amlCompliant: boolean;
    jurisdictionalApproval: boolean;
  };
}