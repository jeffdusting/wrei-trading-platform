/**
 * WREI Tokenization Project - Phase 3.3
 * Risk Profile Integration
 *
 * Comprehensive risk assessment framework for WREI token investments
 * including carbon price volatility, operational factors, regulatory changes,
 * and liquidity considerations.
 */

import { WREITokenType, InvestorClassification, PersonaType } from './types';

// =============================================================================
// RISK ASSESSMENT TYPES
// =============================================================================

export interface RiskMetrics {
  volatilityScore: number; // 1-10 scale
  liquidityScore: number; // 1-10 scale
  operationalScore: number; // 1-10 scale
  regulatoryScore: number; // 1-10 scale
  compositeScore: number; // Weighted average
  riskGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
}

export interface VolatilityProfile {
  historicalVolatility: number; // Annualized volatility
  priceRange12m: { min: number; max: number };
  averagePrice12m: number;
  volatilityDrivers: string[];
  hedgingAvailable: boolean;
  correlationFactors: { [key: string]: number };
}

export interface OperationalRiskFactors {
  fleetAvailability: number; // Target uptime percentage
  maintenanceRisk: 'low' | 'moderate' | 'high';
  technologyRisk: 'low' | 'moderate' | 'high';
  staffingRisk: 'low' | 'moderate' | 'high';
  cybersecurityRisk: 'low' | 'moderate' | 'high';
  climateAdaptationRisk: 'low' | 'moderate' | 'high';
}

export interface RegulatoryRiskAssessment {
  policyChangeImpact: 'positive' | 'neutral' | 'negative';
  complianceComplexity: 'low' | 'moderate' | 'high';
  jurisdictionalRisk: 'single' | 'multi_domestic' | 'international';
  regulatoryTimeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  adaptationCost: number; // A$ estimated compliance cost
}

export interface LiquidityRiskProfile {
  dailyTradingVolume: number; // A$ or tonnes
  bidAskSpread: number; // Percentage
  marketDepth: number; // Available liquidity within 5% of mid
  redemptionCycles: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  liquidityProviders: string[];
  stressTesting: {
    marketCrash: { liquidityDecline: number; recoveryDays: number };
    regulatoryShock: { demandSpike: number; supplyConstraint: number };
    technicalFailure: { accessHours: number; alternativeRoutes: boolean };
  };
}

export interface PersonaRiskTolerance {
  maxVolatility: number; // Maximum acceptable volatility
  liquidityRequirement: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  regulatoryRiskTolerance: 'low' | 'moderate' | 'high';
  operationalRiskTolerance: 'low' | 'moderate' | 'high';
  riskBudget: number; // Percentage of portfolio
  hedgingPreference: 'none' | 'minimal' | 'moderate' | 'comprehensive';
}

// =============================================================================
// CARBON PRICE VOLATILITY ASSESSMENT
// =============================================================================

export function getCarbonVolatilityProfile(): VolatilityProfile {
  return {
    historicalVolatility: 0.25, // 25% annual volatility
    priceRange12m: { min: 12.50, max: 18.75 }, // A$/tonne
    averagePrice12m: 15.20,
    volatilityDrivers: [
      'regulatory_announcements',
      'carbon_tax_policy_changes',
      'vcs_standard_updates',
      'supply_demand_imbalances',
      'seasonal_trading_patterns',
      'international_carbon_prices',
      'technology_breakthroughs',
      'climate_policy_elections'
    ],
    hedgingAvailable: true,
    correlationFactors: {
      energy_stocks: 0.65,
      green_bonds: -0.25,
      commodities: 0.35,
      australian_dollar: 0.15,
      oil_prices: 0.45,
      renewable_energy_etfs: 0.55
    }
  };
}

export function getAssetCoVolatilityProfile(): VolatilityProfile {
  return {
    historicalVolatility: 0.12, // 12% annual volatility (infrastructure-grade)
    priceRange12m: { min: 0.95, max: 1.08 }, // NAV multiple
    averagePrice12m: 1.00,
    volatilityDrivers: [
      'interest_rate_changes',
      'infrastructure_market_sentiment',
      'regulatory_changes_transport',
      'energy_price_fluctuations',
      'fleet_operational_performance',
      'lease_contract_renewals'
    ],
    hedgingAvailable: true,
    correlationFactors: {
      infrastructure_reits: 0.75,
      government_bonds: -0.35,
      transport_stocks: 0.60,
      utilities: 0.45,
      real_estate: 0.40,
      inflation_expectations: 0.30
    }
  };
}

export function assessVolatilityRisk(tokenType: WREITokenType, investorClassification: InvestorClassification): number {
  const carbonVol = getCarbonVolatilityProfile();
  const assetCoVol = getAssetCoVolatilityProfile();

  let baseVolatility: number;
  switch (tokenType) {
    case 'carbon_credits':
      baseVolatility = carbonVol.historicalVolatility;
      break;
    case 'asset_co':
      baseVolatility = assetCoVol.historicalVolatility;
      break;
    case 'dual_portfolio':
      // Portfolio diversification benefit
      const correlation = 0.20; // Low correlation between carbon and infrastructure
      baseVolatility = Math.sqrt(
        0.4 * 0.4 * carbonVol.historicalVolatility * carbonVol.historicalVolatility +
        0.6 * 0.6 * assetCoVol.historicalVolatility * assetCoVol.historicalVolatility +
        2 * 0.4 * 0.6 * correlation * carbonVol.historicalVolatility * assetCoVol.historicalVolatility
      );
      break;
    default:
      baseVolatility = 0.20;
  }

  // Adjust for investor sophistication (sophisticated investors can handle more complexity)
  const sophisticationMultiplier = investorClassification === 'sophisticated' ? 0.9 :
                                   investorClassification === 'professional' ? 0.95 : 1.0;

  return baseVolatility * sophisticationMultiplier;
}

// =============================================================================
// OPERATIONAL RISK ASSESSMENT
// =============================================================================

export function getFleetOperationalRisks(): OperationalRiskFactors {
  return {
    fleetAvailability: 0.95, // 95% target uptime
    maintenanceRisk: 'moderate', // Quarterly maintenance, predictable
    technologyRisk: 'moderate', // Battery degradation, software updates
    staffingRisk: 'low', // Stable maritime workforce, good retention
    cybersecurityRisk: 'moderate', // Connected vessels, but robust security
    climateAdaptationRisk: 'low' // Electric fleet resilient to fuel price shocks
  };
}

export function getCarbonGenerationRisks(): OperationalRiskFactors {
  return {
    fleetAvailability: 0.98, // High telemetry system uptime
    maintenanceRisk: 'low', // Automated measurement, minimal manual intervention
    technologyRisk: 'low', // Established telemetry technology
    staffingRisk: 'low', // Automated systems reduce staff dependency
    cybersecurityRisk: 'moderate', // Real-time data transmission
    climateAdaptationRisk: 'low' // Measurement independent of weather
  };
}

export function assessOperationalRisk(tokenType: WREITokenType): number {
  const fleetRisks = getFleetOperationalRisks();
  const carbonRisks = getCarbonGenerationRisks();

  let riskScore: number;
  switch (tokenType) {
    case 'carbon_credits':
      // Lower operational risk - automated systems
      riskScore = 3; // 1-10 scale, lower is better
      break;
    case 'asset_co':
      // Moderate operational risk - physical fleet operations
      riskScore = 4;
      break;
    case 'dual_portfolio':
      // Blended risk
      riskScore = 3.5;
      break;
    default:
      riskScore = 5;
  }

  return riskScore;
}

// =============================================================================
// REGULATORY RISK ASSESSMENT
// =============================================================================

export function getAustralianCarbonPolicyRisks(): RegulatoryRiskAssessment {
  return {
    policyChangeImpact: 'positive', // Net zero commitments driving demand
    complianceComplexity: 'moderate', // Multiple standards but well established
    jurisdictionalRisk: 'multi_domestic', // State and federal interaction
    regulatoryTimeframe: 'medium_term', // 2-5 year policy cycles
    adaptationCost: 150_000 // A$ estimated compliance infrastructure
  };
}

export function getFinancialServicesRegulatoryRisks(): RegulatoryRiskAssessment {
  return {
    policyChangeImpact: 'neutral', // Clarification rather than restriction
    complianceComplexity: 'high', // Multiple regulators (ASIC, AUSTRAC, APRA)
    jurisdictionalRisk: 'international', // AFSL + EU MiCA + potential US exposure
    regulatoryTimeframe: 'short_term', // 1-2 year implementation cycles
    adaptationCost: 500_000 // A$ estimated for comprehensive compliance
  };
}

export function assessRegulatoryRisk(tokenType: WREITokenType, investorClassification: InvestorClassification): number {
  const carbonPolicy = getAustralianCarbonPolicyRisks();
  const financialServices = getFinancialServicesRegulatoryRisks();

  let baseRegulatoryRisk: number;
  switch (tokenType) {
    case 'carbon_credits':
      baseRegulatoryRisk = 6; // Higher due to evolving carbon policy
      break;
    case 'asset_co':
      baseRegulatoryRisk = 3; // Lower - established infrastructure regulation
      break;
    case 'dual_portfolio':
      baseRegulatoryRisk = 5; // Blended exposure
      break;
    default:
      baseRegulatoryRisk = 5;
  }

  // Sophisticated investors better equipped to handle regulatory complexity
  const sophisticationAdjustment = investorClassification === 'sophisticated' ? -1 :
                                   investorClassification === 'professional' ? -0.5 : 0;

  return Math.max(1, baseRegulatoryRisk + sophisticationAdjustment);
}

// =============================================================================
// LIQUIDITY RISK ASSESSMENT
// =============================================================================

export function getCarbonCreditLiquidityProfile(): LiquidityRiskProfile {
  return {
    dailyTradingVolume: 750_000, // A$ daily volume (5,000 tonnes * A$150)
    bidAskSpread: 0.015, // 1.5% average spread
    marketDepth: 50_000, // Tonnes available within 5% of mid
    redemptionCycles: 'immediate',
    liquidityProviders: ['market_makers', 'trading_desks', 'aggregators', 'institutional_holders'],
    stressTesting: {
      marketCrash: { liquidityDecline: 0.50, recoveryDays: 90 },
      regulatoryShock: { demandSpike: 3.0, supplyConstraint: 0.30 },
      technicalFailure: { accessHours: 4, alternativeRoutes: true }
    }
  };
}

export function getAssetCoLiquidityProfile(): LiquidityRiskProfile {
  return {
    dailyTradingVolume: 250_000, // A$ daily volume
    bidAskSpread: 0.025, // 2.5% average spread (less liquid than carbon)
    marketDepth: 2_000_000, // A$ available within 5% of NAV
    redemptionCycles: 'quarterly',
    liquidityProviders: ['primary_market_maker', 'institutional_traders', 'defi_protocols'],
    stressTesting: {
      marketCrash: { liquidityDecline: 0.35, recoveryDays: 120 },
      regulatoryShock: { demandSpike: 1.5, supplyConstraint: 0.15 },
      technicalFailure: { accessHours: 24, alternativeRoutes: false }
    }
  };
}

export function assessLiquidityRisk(tokenType: WREITokenType, liquidityRequirement: string): number {
  const carbonLiquidity = getCarbonCreditLiquidityProfile();
  const assetCoLiquidity = getAssetCoLiquidityProfile();

  let baseLiquidityRisk: number;
  switch (tokenType) {
    case 'carbon_credits':
      baseLiquidityRisk = 4; // Good secondary market liquidity
      break;
    case 'asset_co':
      baseLiquidityRisk = 5; // Quarterly redemptions, moderate secondary market
      break;
    case 'dual_portfolio':
      baseLiquidityRisk = 4.5; // Blended liquidity profile
      break;
    default:
      baseLiquidityRisk = 5;
  }

  // Adjust for liquidity requirements
  const liquidityAdjustment = liquidityRequirement === 'daily' ? 1 :
                              liquidityRequirement === 'weekly' ? 0.5 :
                              liquidityRequirement === 'monthly' ? 0 :
                              liquidityRequirement === 'quarterly' ? -0.5 : -1;

  return Math.max(1, Math.min(10, baseLiquidityRisk + liquidityAdjustment));
}

// =============================================================================
// PERSONA-SPECIFIC RISK TOLERANCE
// =============================================================================

export function getPersonaRiskTolerance(persona: PersonaType): PersonaRiskTolerance {
  switch (persona) {
    case 'infrastructure_fund':
      return {
        maxVolatility: 0.15, // 15% maximum volatility
        liquidityRequirement: 'quarterly',
        regulatoryRiskTolerance: 'moderate',
        operationalRiskTolerance: 'moderate',
        riskBudget: 0.10, // 10% of portfolio in tokenized assets
        hedgingPreference: 'moderate'
      };

    case 'esg_impact_investor':
      return {
        maxVolatility: 0.25, // Accept higher volatility for impact
        liquidityRequirement: 'monthly',
        regulatoryRiskTolerance: 'high', // ESG regulations generally supportive
        operationalRiskTolerance: 'moderate',
        riskBudget: 0.15, // 15% allocation to impact investments
        hedgingPreference: 'minimal' // Avoid hedging for impact purity
      };

    case 'defi_yield_farmer':
      return {
        maxVolatility: 0.35, // High volatility tolerance for high returns
        liquidityRequirement: 'daily',
        regulatoryRiskTolerance: 'moderate',
        operationalRiskTolerance: 'low', // Sophisticated systems management
        riskBudget: 0.25, // 25% in high-yield strategies
        hedgingPreference: 'comprehensive' // Active risk management
      };

    case 'family_office':
      return {
        maxVolatility: 0.18, // Moderate volatility for multi-generational wealth
        liquidityRequirement: 'quarterly',
        regulatoryRiskTolerance: 'high', // Can adapt to regulatory changes
        operationalRiskTolerance: 'moderate',
        riskBudget: 0.05, // 5% allocation to alternative investments
        hedgingPreference: 'moderate'
      };

    case 'sovereign_wealth':
      return {
        maxVolatility: 0.20, // Government investment tolerance
        liquidityRequirement: 'annual',
        regulatoryRiskTolerance: 'high', // Can influence regulatory environment
        operationalRiskTolerance: 'high', // Long-term perspective
        riskBudget: 0.03, // 3% allocation to domestic green infrastructure
        hedgingPreference: 'moderate'
      };

    case 'pension_fund':
      return {
        maxVolatility: 0.12, // Conservative for member obligations
        liquidityRequirement: 'quarterly',
        regulatoryRiskTolerance: 'low', // Fiduciary duty constraints
        operationalRiskTolerance: 'low', // Member protection priority
        riskBudget: 0.02, // 2% allocation to alternative investments
        hedgingPreference: 'comprehensive' // Risk mitigation priority
      };

    // Legacy personas
    case 'compliance_officer':
    case 'esg_fund_manager':
    case 'trading_desk':
    case 'sustainability_director':
    case 'government_procurement':
    default:
      return {
        maxVolatility: 0.20,
        liquidityRequirement: 'monthly',
        regulatoryRiskTolerance: 'moderate',
        operationalRiskTolerance: 'moderate',
        riskBudget: 0.05,
        hedgingPreference: 'moderate'
      };
  }
}

// =============================================================================
// COMPREHENSIVE RISK ASSESSMENT
// =============================================================================

export function calculateRiskMetrics(
  tokenType: WREITokenType,
  investorClassification: InvestorClassification,
  persona: PersonaType
): RiskMetrics {
  const personaRiskTolerance = getPersonaRiskTolerance(persona);

  // Calculate individual risk scores (1-10 scale)
  const volatilityScore = assessVolatilityRisk(tokenType, investorClassification) * 40; // Convert to 1-10 scale
  const operationalScore = assessOperationalRisk(tokenType);
  const regulatoryScore = assessRegulatoryRisk(tokenType, investorClassification);
  const liquidityScore = assessLiquidityRisk(tokenType, personaRiskTolerance.liquidityRequirement);

  // Weighted composite score
  const weights = { volatility: 0.30, operational: 0.20, regulatory: 0.25, liquidity: 0.25 };
  const compositeScore =
    volatilityScore * weights.volatility +
    operationalScore * weights.operational +
    regulatoryScore * weights.regulatory +
    liquidityScore * weights.liquidity;

  // Convert to risk grade
  const riskGrade = compositeScore <= 2 ? 'AAA' :
                    compositeScore <= 3 ? 'AA' :
                    compositeScore <= 4 ? 'A' :
                    compositeScore <= 5 ? 'BBB' :
                    compositeScore <= 6 ? 'BB' :
                    compositeScore <= 7 ? 'B' : 'CCC';

  return {
    volatilityScore: Math.round(volatilityScore * 10) / 10,
    operationalScore: operationalScore,
    regulatoryScore: regulatoryScore,
    liquidityScore: liquidityScore,
    compositeScore: Math.round(compositeScore * 10) / 10,
    riskGrade: riskGrade
  };
}

// =============================================================================
// RISK-RETURN OPTIMIZATION
// =============================================================================

export function optimizeAllocation(
  persona: PersonaType,
  investorClassification: InvestorClassification,
  targetReturn: number
): {
  optimalAllocation: { carbon: number; asset_co: number };
  expectedReturn: number;
  expectedVolatility: number;
  sharpeRatio: number;
  riskAdjustedReturn: number;
} {
  const riskTolerance = getPersonaRiskTolerance(persona);
  const maxVolatility = riskTolerance.maxVolatility;

  // Expected returns (based on WREI documentation)
  const carbonReturn = 0.10; // 10% expected return for carbon credits
  const assetCoReturn = 0.283; // 28.3% expected return for asset co tokens

  // Volatilities
  const carbonVol = getCarbonVolatilityProfile().historicalVolatility; // 0.25
  const assetCoVol = getAssetCoVolatilityProfile().historicalVolatility; // 0.12
  const correlation = 0.20; // Low correlation

  // Optimize allocation using simplified mean-variance optimization
  let optimalCarbonWeight: number;

  if (targetReturn >= assetCoReturn) {
    // Target return requires leverage or is unattainable with current assets
    optimalCarbonWeight = 1.0; // Max carbon allocation
  } else if (targetReturn <= assetCoReturn) {
    // Can achieve target with asset co focus
    optimalCarbonWeight = Math.max(0, (targetReturn - assetCoReturn) / (carbonReturn - assetCoReturn));
  } else {
    // Find optimal allocation within volatility constraint
    // Simplified: use volatility-minimizing allocation as starting point
    const numerator = assetCoVol * assetCoVol - correlation * carbonVol * assetCoVol;
    const denominator = carbonVol * carbonVol + assetCoVol * assetCoVol - 2 * correlation * carbonVol * assetCoVol;
    optimalCarbonWeight = numerator / denominator;
  }

  // Constrain weights
  optimalCarbonWeight = Math.max(0, Math.min(1, optimalCarbonWeight));
  const optimalAssetCoWeight = 1 - optimalCarbonWeight;

  // Calculate portfolio metrics
  const expectedReturn = optimalCarbonWeight * carbonReturn + optimalAssetCoWeight * assetCoReturn;

  const expectedVolatility = Math.sqrt(
    optimalCarbonWeight * optimalCarbonWeight * carbonVol * carbonVol +
    optimalAssetCoWeight * optimalAssetCoWeight * assetCoVol * assetCoVol +
    2 * optimalCarbonWeight * optimalAssetCoWeight * correlation * carbonVol * assetCoVol
  );

  // Check if volatility constraint is violated
  if (expectedVolatility > maxVolatility) {
    // Re-optimize for volatility constraint
    // Simplified: adjust allocation to meet volatility constraint
    const volConstrained = maxVolatility;
    // Use conservative allocation when volatility constrained
    optimalCarbonWeight = Math.min(optimalCarbonWeight, 0.3);
    const portfolioReturn = optimalCarbonWeight * carbonReturn + (1 - optimalCarbonWeight) * assetCoReturn;

    return {
      optimalAllocation: { carbon: optimalCarbonWeight, asset_co: 1 - optimalCarbonWeight },
      expectedReturn: portfolioReturn,
      expectedVolatility: volConstrained,
      sharpeRatio: (portfolioReturn - 0.04) / volConstrained, // Assuming 4% risk-free rate
      riskAdjustedReturn: portfolioReturn / volConstrained
    };
  }

  const riskFreeRate = 0.04; // 4% risk-free rate
  const sharpeRatio = (expectedReturn - riskFreeRate) / expectedVolatility;

  return {
    optimalAllocation: { carbon: optimalCarbonWeight, asset_co: optimalAssetCoWeight },
    expectedReturn,
    expectedVolatility,
    sharpeRatio,
    riskAdjustedReturn: expectedReturn / expectedVolatility
  };
}

// =============================================================================
// RISK MONITORING AND ALERTS
// =============================================================================

export function generateRiskAlert(
  tokenType: WREITokenType,
  currentMetrics: RiskMetrics,
  thresholds: { volatility: number; liquidity: number; regulatory: number }
): {
  alertLevel: 'none' | 'info' | 'warning' | 'critical';
  alerts: string[];
  recommendations: string[];
} {
  const alerts: string[] = [];
  const recommendations: string[] = [];
  let alertLevel: 'none' | 'info' | 'warning' | 'critical' = 'none';

  // Volatility alerts
  if (currentMetrics.volatilityScore > thresholds.volatility) {
    alerts.push(`High volatility detected: ${currentMetrics.volatilityScore}/10`);
    recommendations.push('Consider reducing position size or implementing hedging strategies');
    alertLevel = 'warning';
  }

  // Liquidity alerts
  if (currentMetrics.liquidityScore > thresholds.liquidity) {
    alerts.push(`Liquidity constraints detected: ${currentMetrics.liquidityScore}/10`);
    recommendations.push('Monitor redemption windows and consider alternative exit strategies');
    if (alertLevel !== 'warning') alertLevel = 'info';
  }

  // Regulatory alerts
  if (currentMetrics.regulatoryScore > thresholds.regulatory) {
    alerts.push(`Regulatory risk elevated: ${currentMetrics.regulatoryScore}/10`);
    recommendations.push('Review compliance requirements and regulatory updates');
    if (alertLevel !== 'warning') alertLevel = 'info';
  }

  // Critical composite score
  if (currentMetrics.compositeScore > 7) {
    alerts.push(`Overall risk score critical: ${currentMetrics.compositeScore}/10`);
    recommendations.push('Immediate review of position sizing and risk management strategies recommended');
    alertLevel = 'critical';
  }

  return {
    alertLevel: alerts.length === 0 ? 'none' : alertLevel,
    alerts,
    recommendations
  };
}

// =============================================================================
// RISK REPORT GENERATION
// =============================================================================

export function generateRiskReport(
  tokenType: WREITokenType,
  investorClassification: InvestorClassification,
  persona: PersonaType
): {
  summary: string;
  riskMetrics: RiskMetrics;
  volatilityProfile: VolatilityProfile;
  liquidityProfile: LiquidityRiskProfile;
  operationalFactors: OperationalRiskFactors;
  regulatoryAssessment: RegulatoryRiskAssessment;
  personaFit: { score: number; recommendations: string[] };
  optimizedAllocation?: { carbon: number; asset_co: number };
} {
  const riskMetrics = calculateRiskMetrics(tokenType, investorClassification, persona);
  const personaRiskTolerance = getPersonaRiskTolerance(persona);

  const volatilityProfile = tokenType === 'carbon_credits' ? getCarbonVolatilityProfile() :
                            tokenType === 'asset_co' ? getAssetCoVolatilityProfile() :
                            getCarbonVolatilityProfile(); // Default for dual portfolio

  const liquidityProfile = tokenType === 'carbon_credits' ? getCarbonCreditLiquidityProfile() :
                           getAssetCoLiquidityProfile();

  const operationalFactors = tokenType === 'carbon_credits' ? getCarbonGenerationRisks() :
                             getFleetOperationalRisks();

  const regulatoryAssessment = getAustralianCarbonPolicyRisks();

  // Calculate persona fit score
  const volatilityFit = volatilityProfile.historicalVolatility <= personaRiskTolerance.maxVolatility ? 1 : 0;
  const liquidityFit = liquidityProfile.redemptionCycles === personaRiskTolerance.liquidityRequirement ? 1 : 0.5;
  const personalFitScore = Math.round((volatilityFit + liquidityFit) * 50); // 0-100 scale

  const recommendations: string[] = [];
  if (personalFitScore < 70) {
    recommendations.push('Consider dual portfolio allocation to balance risk-return profile');
  }
  if (riskMetrics.volatilityScore > 6) {
    recommendations.push('Implement volatility management strategies such as hedging or staged entry');
  }
  if (riskMetrics.liquidityScore > 6) {
    recommendations.push('Plan liquidity needs in advance and consider staggered investment approach');
  }

  const summary = `${tokenType.replace('_', ' ')} tokens show ${riskMetrics.riskGrade} risk grade with ${personalFitScore}% persona compatibility. ` +
                  `Key considerations: ${riskMetrics.volatilityScore > 5 ? 'elevated volatility' : 'stable pricing'}, ` +
                  `${riskMetrics.liquidityScore > 5 ? 'moderate liquidity constraints' : 'good liquidity'}, ` +
                  `${riskMetrics.regulatoryScore > 5 ? 'evolving regulatory environment' : 'stable regulatory framework'}.`;

  const result: any = {
    summary,
    riskMetrics,
    volatilityProfile,
    liquidityProfile,
    operationalFactors,
    regulatoryAssessment,
    personaFit: { score: personalFitScore, recommendations }
  };

  // Add optimized allocation for dual portfolio considerations
  if (tokenType === 'dual_portfolio') {
    const optimization = optimizeAllocation(persona, investorClassification, 0.15); // 15% target return
    result.optimizedAllocation = optimization.optimalAllocation;
  }

  return result;
}