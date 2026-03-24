/**
 * WREI Professional Analytics Library - Advanced Institutional Calculations
 *
 * Phase 6.2: Institutional-grade financial analytics and modeling
 * Supporting wholesale/professional/sophisticated investor requirements
 *
 * Features:
 * - Advanced IRR/NPV calculations with Australian tax treatment
 * - Sophisticated portfolio optimization algorithms
 * - Multi-scenario Monte Carlo modeling
 * - Risk-adjusted returns with correlation analysis
 * - Professional-grade charting data preparation
 * - Real-time performance attribution analysis
 */

import type { WREITokenType, InvestorClassification, FinancialMetrics, PersonaType } from './types';
import { WREI_FINANCIAL_CONSTANTS } from './financial-calculations';

// =============================================================================
// PROFESSIONAL ANALYTICS INTERFACES
// =============================================================================

export interface ProfessionalMetrics {
  // Core Investment Returns
  irr: number;                    // Internal Rate of Return
  npv: number;                    // Net Present Value
  mirr: number;                   // Modified Internal Rate of Return
  cashOnCash: number;            // Cash-on-Cash Return
  cagr: number;                  // Compound Annual Growth Rate
  totalReturn: number;           // Total Return %

  // Risk-Adjusted Metrics
  sharpeRatio: number;           // Risk-adjusted return
  sortinoRatio: number;          // Downside-adjusted return
  calmarRatio: number;           // Return/Max Drawdown
  treynorRatio: number;          // Beta-adjusted return
  informationRatio: number;      // Active return/tracking error

  // Portfolio Construction Metrics
  optimizedAllocation: { [key in WREITokenType]: number };
  riskContribution: { [key in WREITokenType]: number };
  diversificationRatio: number;
  concentrationRisk: number;

  // Australian Tax Considerations
  frankingCreditValue: number;   // Imputation credit value
  cgtDiscount: number;           // CGT discount benefit
  negativeGearing: number;       // Negative gearing benefit
  effectiveTaxRate: number;      // After all tax considerations

  // Additional Risk Metrics
  maxDrawdown: number;           // Maximum portfolio drawdown
  volatility: number;            // Annualized volatility
  correlationScore: number;      // Portfolio correlation score

  // Institutional Benchmarks
  benchmarkOutperformance: { [benchmark: string]: number };
  trackingError: number;
  activeReturn: number;
  betaToMarket: number;
}

export interface ScenarioAnalysis {
  baseCase: ProfessionalMetrics;
  bullCase: ProfessionalMetrics;
  bearCase: ProfessionalMetrics;
  stressCase: ProfessionalMetrics;
  probabilityWeighted: ProfessionalMetrics;
}

export interface MonteCarloResults {
  mean: number;
  median: number;
  percentile5: number;
  percentile95: number;
  standardDeviation: number;
  skewness: number;
  kurtosis: number;
  probabilityOfLoss: number;
  expectedShortfall: number;
  valueAtRisk95: number;
}

export interface PerformanceAttribution {
  assetAllocation: number;       // Asset allocation contribution
  securitySelection: number;     // Security selection contribution
  interactionEffect: number;     // Interaction effect
  totalActiveReturn: number;     // Sum of above

  // By Token Type
  carbonCreditsContribution: number;
  assetCoContribution: number;
  dualPortfolioContribution: number;

  // By Factor
  yieldContribution: number;
  capitalGainsContribution: number;
  currencyContribution: number;
  otherContribution: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  benchmark?: number;
  label?: string;
}

export interface ProfessionalChartData {
  performanceChart: ChartDataPoint[];
  riskReturnScatter: { x: number; y: number; label: string }[];
  allocationPie: { name: string; value: number; color: string }[];
  drawdownChart: ChartDataPoint[];
  rollingReturns: ChartDataPoint[];
  correlationHeatmap: { x: string; y: string; value: number }[];
}

// =============================================================================
// AUSTRALIAN TAX CALCULATIONS
// =============================================================================

export function calculateAustralianTaxTreatment(
  investmentAmount: number,
  annualIncome: number,
  capitalGains: number,
  holdingPeriod: number, // in years
  frankingCredits: number,
  investorClassification: InvestorClassification
): {
  incomeTax: number;
  cgtTax: number;
  frankingBenefit: number;
  totalTax: number;
  afterTaxReturn: number;
} {
  // Australian tax rates for 2025-26
  const taxBrackets = [
    { min: 0, max: 18_200, rate: 0.0 },
    { min: 18_200, max: 45_000, rate: 0.19 },
    { min: 45_000, max: 120_000, rate: 0.325 },
    { min: 120_000, max: 180_000, rate: 0.37 },
    { min: 180_000, max: Infinity, rate: 0.45 }
  ];

  // Institutional tax rates (corporate/SMSF)
  const institutionalTaxRate = investorClassification === 'professional' ? 0.30 :
                              investorClassification === 'sophisticated' ? 0.25 : 0.19;

  // Calculate marginal tax rate
  let marginalRate = 0;
  for (const bracket of taxBrackets) {
    if (annualIncome > bracket.min) {
      marginalRate = bracket.rate;
    }
  }

  // Use institutional rate for professional investors
  if (investorClassification === 'professional') {
    marginalRate = institutionalTaxRate;
  }

  // Income tax on distributions
  const incomeTax = annualIncome * marginalRate;

  // CGT calculation with 50% discount for >12 months holding
  const cgtDiscount = holdingPeriod >= 1 ? 0.5 : 0;
  const taxableCapitalGain = capitalGains * (1 - cgtDiscount);
  const cgtTax = taxableCapitalGain * marginalRate;

  // Franking credit benefit (imputation system)
  const frankingBenefit = frankingCredits * (marginalRate < 0.30 ? frankingCredits * (0.30 - marginalRate) : 0);

  const totalTax = incomeTax + cgtTax - frankingBenefit;
  const afterTaxReturn = annualIncome + capitalGains - totalTax;

  return {
    incomeTax,
    cgtTax,
    frankingBenefit,
    totalTax,
    afterTaxReturn
  };
}

// =============================================================================
// ADVANCED PORTFOLIO OPTIMIZATION
// =============================================================================

export function calculateOptimalAllocation(
  expectedReturns: { [key in WREITokenType]: number },
  volatilities: { [key in WREITokenType]: number },
  correlations: { [key: string]: number },
  riskTolerance: 'conservative' | 'moderate' | 'aggressive',
  constraints: { [key in WREITokenType]: { min: number; max: number } }
): { [key in WREITokenType]: number } {
  // Modern Portfolio Theory optimization (simplified)
  const tokens: WREITokenType[] = ['carbon_credits', 'asset_co', 'dual_portfolio'];

  // Risk tolerance adjustment
  const riskAversion = riskTolerance === 'conservative' ? 4 :
                      riskTolerance === 'moderate' ? 2 : 1;

  // Equal weight starting point
  let allocation: { [key in WREITokenType]: number } = {
    carbon_credits: 0.33,
    asset_co: 0.33,
    dual_portfolio: 0.34
  };

  // Adjust for expected returns and risk
  tokens.forEach(token => {
    const returnWeight = expectedReturns[token] / riskAversion;
    const riskPenalty = volatilities[token] * riskAversion;
    const adjustedWeight = returnWeight - riskPenalty;

    allocation[token] = Math.max(
      constraints[token].min,
      Math.min(constraints[token].max, adjustedWeight)
    );
  });

  // Normalize to sum to 1
  const totalWeight = Object.values(allocation).reduce((sum, weight) => sum + weight, 0);
  tokens.forEach(token => {
    allocation[token] = allocation[token] / totalWeight;
  });

  return allocation;
}

// =============================================================================
// MONTE CARLO SIMULATION
// =============================================================================

export function runMonteCarloAnalysis(
  tokenType: WREITokenType,
  initialInvestment: number,
  timeHorizon: number,
  expectedReturn: number,
  volatility: number,
  simulations: number = 10000
): MonteCarloResults {
  const results: number[] = [];

  for (let i = 0; i < simulations; i++) {
    let value = initialInvestment;

    for (let year = 0; year < timeHorizon; year++) {
      // Generate random return using normal distribution approximation
      const randomReturn = expectedReturn + volatility * (
        Math.random() + Math.random() + Math.random() +
        Math.random() + Math.random() + Math.random() - 3
      ); // Approximates normal distribution

      value *= (1 + randomReturn);
    }

    results.push((value - initialInvestment) / initialInvestment);
  }

  // Sort results for percentile calculations
  results.sort((a, b) => a - b);

  const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
  const median = results[Math.floor(results.length / 2)];
  const percentile5 = results[Math.floor(results.length * 0.05)];
  const percentile95 = results[Math.floor(results.length * 0.95)];

  // Standard deviation
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
  const standardDeviation = Math.sqrt(variance);

  // Skewness and kurtosis
  const skewness = results.reduce((sum, val) => sum + Math.pow((val - mean) / standardDeviation, 3), 0) / results.length;
  const kurtosis = results.reduce((sum, val) => sum + Math.pow((val - mean) / standardDeviation, 4), 0) / results.length - 3;

  // Risk metrics
  const negativeResults = results.filter(r => r < 0);
  const probabilityOfLoss = negativeResults.length / results.length;

  // Expected Shortfall (Conditional VaR)
  const var95Index = Math.floor(results.length * 0.05);
  const expectedShortfall = negativeResults.length > 0 ?
    results.slice(0, var95Index).reduce((sum, val) => sum + val, 0) / var95Index : 0;

  return {
    mean,
    median,
    percentile5,
    percentile95,
    standardDeviation,
    skewness,
    kurtosis,
    probabilityOfLoss,
    expectedShortfall,
    valueAtRisk95: percentile5
  };
}

// =============================================================================
// PERFORMANCE ATTRIBUTION ANALYSIS
// =============================================================================

export function calculatePerformanceAttribution(
  portfolioReturn: number,
  benchmarkReturn: number,
  portfolioWeights: { [key in WREITokenType]: number },
  benchmarkWeights: { [key in WREITokenType]: number },
  assetReturns: { [key in WREITokenType]: number },
  benchmarkAssetReturns: { [key in WREITokenType]: number }
): PerformanceAttribution {
  // Asset Allocation Effect
  let assetAllocation = 0;
  Object.keys(portfolioWeights).forEach(asset => {
    const token = asset as WREITokenType;
    const weightDiff = portfolioWeights[token] - benchmarkWeights[token];
    assetAllocation += weightDiff * benchmarkAssetReturns[token];
  });

  // Security Selection Effect
  let securitySelection = 0;
  Object.keys(portfolioWeights).forEach(asset => {
    const token = asset as WREITokenType;
    const returnDiff = assetReturns[token] - benchmarkAssetReturns[token];
    securitySelection += benchmarkWeights[token] * returnDiff;
  });

  // Interaction Effect
  let interactionEffect = 0;
  Object.keys(portfolioWeights).forEach(asset => {
    const token = asset as WREITokenType;
    const weightDiff = portfolioWeights[token] - benchmarkWeights[token];
    const returnDiff = assetReturns[token] - benchmarkAssetReturns[token];
    interactionEffect += weightDiff * returnDiff;
  });

  const totalActiveReturn = assetAllocation + securitySelection + interactionEffect;

  // By Token Type Contributions
  const carbonCreditsContribution = portfolioWeights.carbon_credits * assetReturns.carbon_credits;
  const assetCoContribution = portfolioWeights.asset_co * assetReturns.asset_co;
  const dualPortfolioContribution = portfolioWeights.dual_portfolio * assetReturns.dual_portfolio;

  // By Factor (simplified)
  const yieldContribution = portfolioReturn * 0.7; // Assume 70% from yield
  const capitalGainsContribution = portfolioReturn * 0.25; // 25% from capital gains
  const currencyContribution = portfolioReturn * 0.03; // 3% currency
  const otherContribution = portfolioReturn * 0.02; // 2% other factors

  return {
    assetAllocation,
    securitySelection,
    interactionEffect,
    totalActiveReturn,
    carbonCreditsContribution,
    assetCoContribution,
    dualPortfolioContribution,
    yieldContribution,
    capitalGainsContribution,
    currencyContribution,
    otherContribution
  };
}

// =============================================================================
// COMPREHENSIVE PROFESSIONAL METRICS CALCULATION
// =============================================================================


// =============================================================================
// CHART DATA GENERATION FOR PROFESSIONAL INTERFACE
// =============================================================================

export function generateProfessionalChartData(
  tokenType: WREITokenType,
  investmentAmount: number,
  timeHorizon: number,
  expectedReturn: number,
  volatility: number
): ProfessionalChartData {
  // Performance chart (projected)
  const performanceChart: ChartDataPoint[] = [];
  const benchmarkReturn = 0.08; // ASX 200 equivalent

  for (let month = 0; month <= timeHorizon * 12; month++) {
    const years = month / 12;
    const portfolioValue = investmentAmount * Math.pow(1 + expectedReturn, years);
    const benchmarkValue = investmentAmount * Math.pow(1 + benchmarkReturn, years);

    performanceChart.push({
      date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: portfolioValue,
      benchmark: benchmarkValue
    });
  }

  // Risk-return scatter plot
  const riskReturnScatter = [
    { x: volatility * 100, y: expectedReturn * 100, label: tokenType },
    { x: 15, y: 8, label: 'ASX 200' },
    { x: 5, y: 4, label: 'Government Bonds' },
    { x: 12, y: 7.5, label: 'Infrastructure REITs' },
    { x: 25, y: 3, label: 'Carbon ETFs' }
  ];

  // Allocation pie chart
  const allocationPie = [
    {
      name: tokenType === 'carbon_credits' ? 'Carbon Credits' :
            tokenType === 'asset_co' ? 'Asset Co Tokens' : 'Dual Portfolio',
      value: 100,
      color: tokenType === 'carbon_credits' ? '#10B981' :
             tokenType === 'asset_co' ? '#3B82F6' : '#8B5CF6'
    }
  ];

  // Drawdown chart (estimated)
  const drawdownChart: ChartDataPoint[] = [];
  for (let month = 0; month <= timeHorizon * 12; month++) {
    const randomDrawdown = Math.random() * volatility * 0.3; // Random drawdown up to 30% of volatility
    drawdownChart.push({
      date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: -randomDrawdown
    });
  }

  // Rolling returns (1-year periods)
  const rollingReturns: ChartDataPoint[] = [];
  for (let quarter = 0; quarter < timeHorizon * 4; quarter++) {
    const rollingReturn = expectedReturn + (Math.random() - 0.5) * volatility;
    rollingReturns.push({
      date: new Date(Date.now() + quarter * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: rollingReturn
    });
  }

  // Correlation heatmap
  const assets = ['WREI Token', 'ASX 200', 'AUD/USD', 'Oil', 'Carbon Price', 'Interest Rates'];
  const correlationHeatmap: { x: string; y: string; value: number }[] = [];

  assets.forEach((assetX, i) => {
    assets.forEach((assetY, j) => {
      let correlation = 0;
      if (i === j) correlation = 1;
      else if (assetX === 'WREI Token') {
        correlation = tokenType === 'carbon_credits' ?
          (assetY === 'Carbon Price' ? 0.8 : assetY === 'Oil' ? -0.3 : 0.1) :
          tokenType === 'asset_co' ?
          (assetY === 'ASX 200' ? 0.4 : assetY === 'Interest Rates' ? -0.6 : 0.2) :
          0.3; // Dual portfolio moderate correlations
      } else {
        correlation = Math.random() * 0.6 - 0.3; // Random correlations between other assets
      }

      correlationHeatmap.push({ x: assetX, y: assetY, value: correlation });
    });
  });

  return {
    performanceChart,
    riskReturnScatter,
    allocationPie,
    drawdownChart,
    rollingReturns,
    correlationHeatmap
  };
}

// =============================================================================
// SCENARIO ANALYSIS
// =============================================================================

/**
 * Calculate professional metrics for scenario analysis with variable expected return
 */
function calculateScenarioMetrics(
  tokenType: WREITokenType,
  investmentAmount: number,
  timeHorizon: number,
  expectedReturn: number,
  volatility: number,
  investorClassification: InvestorClassification
): ProfessionalMetrics {
  const portfolioValue = investmentAmount;
  const riskFreeRate = 0.04;
  const beta = 1.0;

  // Calculate core metrics directly using the provided expected return
  const annualCashFlow = portfolioValue * expectedReturn;

  // Calculate risk-adjusted returns
  const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
  const sortinoRatio = sharpeRatio * 1.2; // Approximate, assuming downside deviation is lower
  const calmarRatio = expectedReturn / (volatility * 0.25); // Approximate max drawdown
  const maxDrawdown = volatility * 0.25;
  const var95 = portfolioValue * volatility * 1.645; // 95% VaR
  const cvar95 = var95 * 1.2;

  // Calculate tracking metrics
  const trackingError = volatility * 0.3; // Approximate
  const informationRatio = (expectedReturn - 0.08) / trackingError; // vs market benchmark of 8%

  // Calculate growth metrics
  const totalReturn = Math.pow(1 + expectedReturn, timeHorizon) * portfolioValue - portfolioValue;
  const annualisedReturn = expectedReturn;
  const cagr = expectedReturn;

  // Calculate additional required metrics
  const npv = totalReturn; // Simplified for scenario analysis
  const irr = expectedReturn;
  const mirr = expectedReturn * 0.9; // Simplified
  const cashOnCash = annualCashFlow / portfolioValue;
  const treynorRatio = (expectedReturn - riskFreeRate) / beta;

  // Portfolio construction metrics (simplified for scenario analysis)
  const optimizedAllocation: { [key in WREITokenType]: number } = {
    carbon_credits: tokenType === 'carbon_credits' ? 1.0 : 0.3,
    asset_co: tokenType === 'asset_co' ? 1.0 : 0.4,
    dual_portfolio: tokenType === 'dual_portfolio' ? 1.0 : 0.3
  };

  const riskContribution: { [key in WREITokenType]: number } = {
    carbon_credits: 0.35,
    asset_co: 0.45,
    dual_portfolio: 0.2
  };

  // Australian tax metrics (simplified)
  const frankingCreditValue = portfolioValue * 0.015; // 1.5% franking benefit
  const cgtDiscount = investorClassification === 'sophisticated' ? 0.5 : 0.5; // 50% CGT discount
  const negativeGearing = 0; // Not applicable for these instruments
  const effectiveTaxRate = investorClassification === 'sophisticated' ? 0.25 : 0.30;

  return {
    // Core Investment Returns
    irr,
    npv,
    mirr,
    cashOnCash,
    cagr,
    totalReturn,

    // Risk-Adjusted Metrics
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    treynorRatio,
    informationRatio,

    // Portfolio Construction Metrics
    optimizedAllocation,
    riskContribution,
    diversificationRatio: tokenType === 'dual_portfolio' ? 1.25 : 1.0,
    concentrationRisk: tokenType === 'dual_portfolio' ? 0.15 : 0.35,

    // Australian Tax Considerations
    frankingCreditValue,
    cgtDiscount,
    negativeGearing,
    effectiveTaxRate,

    // Additional Risk Metrics
    maxDrawdown,
    volatility,
    correlationScore: beta,

    // Institutional Benchmarks
    benchmarkOutperformance: { 'ASX 200': expectedReturn - 0.08 },
    trackingError,
    activeReturn: expectedReturn - 0.08, // vs 8% benchmark
    betaToMarket: beta
  };
}

export function generateScenarioAnalysis(
  tokenType: WREITokenType,
  investmentAmount: number,
  timeHorizon: number,
  baseExpectedReturn: number,
  volatility: number,
  investorClassification: InvestorClassification
): ScenarioAnalysis {
  const scenarios = {
    baseCase: baseExpectedReturn,
    bullCase: baseExpectedReturn * 1.5,      // 50% higher returns
    bearCase: baseExpectedReturn * 0.5,      // 50% lower returns
    stressCase: baseExpectedReturn * 0.2     // 80% reduction (crisis scenario)
  };

  const results: Partial<ScenarioAnalysis> = {};

  Object.entries(scenarios).forEach(([scenario, expectedReturn]) => {
    results[scenario as keyof ScenarioAnalysis] = calculateScenarioMetrics(
      tokenType,
      investmentAmount,
      timeHorizon,
      expectedReturn,
      volatility,
      investorClassification
    );
  });

  // Probability-weighted scenario (25% each scenario)
  const weights = { baseCase: 0.4, bullCase: 0.25, bearCase: 0.25, stressCase: 0.1 };
  const probabilityWeightedReturn = Object.entries(scenarios).reduce((sum, [scenario, ret]) => {
    return sum + ret * weights[scenario as keyof typeof weights];
  }, 0);

  results.probabilityWeighted = calculateScenarioMetrics(
    tokenType,
    investmentAmount,
    timeHorizon,
    probabilityWeightedReturn,
    volatility,
    investorClassification
  );

  return results as ScenarioAnalysis;
}

// =============================================================================
// SIMPLIFIED API FUNCTIONS FOR DASHBOARD INTEGRATION
// =============================================================================

/**
 * Calculate professional metrics for a specific persona and portfolio
 * This is the main function that tests expect
 */
export function calculateProfessionalMetrics(
  portfolioValue: number,
  persona: PersonaType,
  timeHorizon: number,
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
): ProfessionalMetrics {
  return calculatePersonaMetrics(portfolioValue, persona, timeHorizon, riskTolerance);
}

/**
 * Calculate professional metrics for a specific persona and portfolio (internal implementation)
 */
export function calculatePersonaMetrics(
  portfolioValue: number,
  persona: PersonaType,
  timeHorizon: number,
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
): ProfessionalMetrics {
  // Map persona to appropriate token type and parameters
  let tokenType: WREITokenType = 'carbon_credits';
  let expectedReturn = 0.12; // 12% base return
  let volatility = 0.18; // 18% volatility
  let beta = 1.0;

  switch (persona) {
    case 'esg_impact_investor':
      tokenType = 'carbon_credits';
      expectedReturn = 0.15; // Higher return for ESG focus
      volatility = 0.20;
      beta = 0.8;
      break;
    case 'family_office':
      tokenType = 'asset_co';
      expectedReturn = 0.10; // Conservative return for family office
      volatility = 0.12;
      beta = 0.6;
      break;
    case 'defi_yield_farmer':
      tokenType = 'dual_portfolio';
      expectedReturn = 0.18; // Higher return for DeFi
      volatility = 0.25;
      beta = 1.2;
      break;
    default:
      // Default to moderate ESG investor
      tokenType = 'carbon_credits';
      expectedReturn = 0.12;
      volatility = 0.18;
      beta = 1.0;
  }

  // Adjust for risk tolerance
  switch (riskTolerance) {
    case 'conservative':
      expectedReturn *= 0.8;
      volatility *= 0.7;
      break;
    case 'aggressive':
      expectedReturn *= 1.3;
      volatility *= 1.4;
      break;
    // moderate stays as-is
  }

  // Calculate core metrics directly
  const annualCashFlow = portfolioValue * expectedReturn;
  const riskFreeRate = 0.04;
  const marketReturn = 0.08;

  // IRR calculation (for consistent cash flows, equals expected return)
  const irr = expectedReturn;

  // Modified IRR (assumes reinvestment at risk-free rate)
  const mirr = Math.pow(
    (annualCashFlow * timeHorizon * (1 + riskFreeRate)) / portfolioValue,
    1 / timeHorizon
  ) - 1;

  // NPV calculation
  let npv = -portfolioValue;
  for (let year = 1; year <= timeHorizon; year++) {
    npv += annualCashFlow / Math.pow(1 + riskFreeRate, year);
  }

  // Other core metrics
  const cashOnCash = expectedReturn;
  const cagr = expectedReturn;
  const totalReturn = Math.pow(1 + expectedReturn, timeHorizon) - 1;

  // Risk-adjusted metrics
  const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
  const sortinoRatio = sharpeRatio * 1.2; // Approximate
  const calmarRatio = expectedReturn / (volatility * 0.6); // Approximate max drawdown
  const treynorRatio = (expectedReturn - riskFreeRate) / beta;
  const informationRatio = (expectedReturn - marketReturn) / (volatility * 0.3);

  // Calculate persona-specific allocation
  const personaAllocation = {
    carbon_credits: persona === 'esg_impact_investor' ? 0.6 : persona === 'family_office' ? 0.2 : 0.4,
    asset_co: persona === 'family_office' ? 0.7 : persona === 'esg_impact_investor' ? 0.3 : 0.4,
    dual_portfolio: persona === 'defi_yield_farmer' ? 0.2 : 0.1
  };

  // Portfolio construction metrics
  const riskContribution = {
    carbon_credits: personaAllocation.carbon_credits * volatility,
    asset_co: personaAllocation.asset_co * volatility * 0.8, // Lower risk
    dual_portfolio: personaAllocation.dual_portfolio * volatility * 1.1 // Higher risk
  };

  const diversificationRatio = 1.2; // Assume some diversification benefit
  const concentrationRisk = Math.max(...Object.values(personaAllocation));

  // Australian tax considerations
  const frankingCreditValue = portfolioValue * 0.02; // 2% franking benefit
  const cgtDiscount = expectedReturn * 0.5; // 50% CGT discount for long-term
  const negativeGearing = 0; // Not applicable for these assets
  const effectiveTaxRate = 0.25; // Effective tax rate after considerations

  const detailedMetrics = {
    irr,
    npv,
    mirr,
    cashOnCash,
    cagr,
    totalReturn,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    treynorRatio,
    informationRatio,
    riskContribution,
    diversificationRatio,
    concentrationRisk,
    frankingCreditValue,
    cgtDiscount,
    negativeGearing,
    effectiveTaxRate
  };

  return {
    ...detailedMetrics,
    optimizedAllocation: personaAllocation,
    maxDrawdown: volatility * 0.6, // Estimated max drawdown as 60% of volatility
    volatility,
    correlationScore: beta,
    benchmarkOutperformance: { 'ASX 200': expectedReturn - 0.08 },
    trackingError: volatility * 0.3,
    activeReturn: expectedReturn - 0.08, // Assuming market return of 8%
    betaToMarket: beta
  };
}

/**
 * Generate portfolio optimization recommendations
 */
export interface PortfolioOptimization {
  recommendedAllocation: { [key in WREITokenType]: number };
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  improvementPotential: number;
}

export function generatePortfolioOptimization(
  currentAllocation: { [key in WREITokenType]: number },
  riskTolerance: 'conservative' | 'moderate' | 'aggressive',
  timeHorizon: number
): PortfolioOptimization {
  // Define optimal allocations based on risk tolerance
  const optimalAllocations = {
    conservative: { carbon_credits: 0.3, asset_co: 0.6, dual_portfolio: 0.1 },
    moderate: { carbon_credits: 0.4, asset_co: 0.4, dual_portfolio: 0.2 },
    aggressive: { carbon_credits: 0.5, asset_co: 0.3, dual_portfolio: 0.2 }
  };

  const recommended = optimalAllocations[riskTolerance];

  // Expected returns by asset class
  const expectedReturns = { carbon_credits: 0.15, asset_co: 0.12, dual_portfolio: 0.18 };
  const risks = { carbon_credits: 0.20, asset_co: 0.12, dual_portfolio: 0.25 };

  // Calculate portfolio expected return and risk
  const expectedReturn = Object.entries(recommended).reduce((sum, [asset, weight]) => {
    return sum + weight * expectedReturns[asset as WREITokenType];
  }, 0);

  const expectedRisk = Math.sqrt(Object.entries(recommended).reduce((sum, [asset, weight]) => {
    return sum + Math.pow(weight * risks[asset as WREITokenType], 2);
  }, 0));

  const sharpeRatio = (expectedReturn - 0.04) / expectedRisk; // Assuming 4% risk-free rate

  // Calculate improvement potential
  const currentReturn = Object.entries(currentAllocation).reduce((sum, [asset, weight]) => {
    return sum + weight * expectedReturns[asset as WREITokenType];
  }, 0);

  const improvementPotential = Math.abs(((expectedReturn - currentReturn) / Math.abs(currentReturn || 0.01)) * 100);

  return {
    recommendedAllocation: recommended,
    expectedReturn,
    expectedRisk,
    sharpeRatio,
    improvementPotential
  };
}

/**
 * Calculate risk-adjusted returns with multiple metrics
 */
export function calculateRiskAdjustedReturns(
  portfolioValue: number,
  expectedReturn: number,
  volatility: number,
  timeHorizon: number
): {
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  var95: number; // 95% Value at Risk
  cvar95: number; // 95% Conditional Value at Risk
} {
  const riskFreeRate = 0.04;

  // Sharpe Ratio
  const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;

  // Sortino Ratio (assuming downside deviation is 70% of total volatility)
  const downsideDeviation = volatility * 0.7;
  const sortinoRatio = (expectedReturn - riskFreeRate) / downsideDeviation;

  // Calmar Ratio (return / max drawdown)
  const maxDrawdown = volatility * 0.6; // Estimated as 60% of volatility
  const calmarRatio = expectedReturn / maxDrawdown;

  // Value at Risk (95% confidence)
  const var95 = portfolioValue * (expectedReturn - 1.645 * volatility); // 1.645 is 95% z-score

  // Conditional Value at Risk (expected loss beyond VaR)
  const cvar95 = var95 * 1.3; // Approximation

  return {
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    maxDrawdown,
    var95: Math.abs(var95),
    cvar95: Math.abs(cvar95)
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

// All exports are already declared inline above