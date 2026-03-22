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

import type { WREITokenType, InvestorClassification, FinancialMetrics } from './types';
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

export function calculateProfessionalMetrics(
  tokenType: WREITokenType,
  investmentAmount: number,
  timeHorizon: number,
  expectedReturn: number,
  riskFreeRate: number = 0.04,
  marketReturn: number = 0.08,
  volatility: number,
  beta: number = 1.0,
  investorClassification: InvestorClassification = 'wholesale',
  benchmarks: { [benchmark: string]: number } = {}
): ProfessionalMetrics {
  // Basic cash flow calculations
  const annualCashFlow = investmentAmount * expectedReturn;
  const terminalValue = investmentAmount * Math.pow(1 + expectedReturn, timeHorizon);

  // IRR (for consistent cash flows, equals expected return)
  const irr = expectedReturn;

  // Modified IRR (assumes reinvestment at risk-free rate)
  const mirr = Math.pow(
    (annualCashFlow * timeHorizon * (1 + riskFreeRate)) / investmentAmount,
    1 / timeHorizon
  ) - 1;

  // NPV calculation
  let npv = -investmentAmount;
  for (let year = 1; year <= timeHorizon; year++) {
    npv += annualCashFlow / Math.pow(1 + riskFreeRate, year);
  }

  // Other metrics
  const cashOnCash = expectedReturn;
  const cagr = expectedReturn; // For consistent returns
  const totalReturn = Math.pow(1 + expectedReturn, timeHorizon) - 1;

  // Risk-adjusted metrics
  const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
  const sortinoRatio = sharpeRatio * 1.2; // Approximate (downside deviation typically lower)
  const calmarRatio = expectedReturn / (volatility * 0.5); // Approximate max drawdown
  const treynorRatio = (expectedReturn - riskFreeRate) / beta;
  const informationRatio = (expectedReturn - marketReturn) / (volatility * 0.3); // Tracking error estimate

  // Portfolio optimization (equal weights for simplicity in single asset analysis)
  const optimizedAllocation: { [key in WREITokenType]: number } = {
    carbon_credits: tokenType === 'carbon_credits' ? 1 : 0,
    asset_co: tokenType === 'asset_co' ? 1 : 0,
    dual_portfolio: tokenType === 'dual_portfolio' ? 1 : 0
  };

  const riskContribution = optimizedAllocation;
  const diversificationRatio = tokenType === 'dual_portfolio' ? 1.2 : 1.0; // Dual portfolio gets diversification benefit
  const concentrationRisk = tokenType === 'dual_portfolio' ? 0.3 : 1.0; // Lower concentration risk for dual

  // Australian tax calculations
  const taxCalculation = calculateAustralianTaxTreatment(
    investmentAmount,
    annualCashFlow,
    terminalValue - investmentAmount,
    timeHorizon,
    annualCashFlow * 0.3, // Assume 30% franking
    investorClassification
  );

  const frankingCreditValue = taxCalculation.frankingBenefit / investmentAmount;
  const cgtDiscount = timeHorizon >= 1 ? 0.25 : 0; // 25% effective benefit from CGT discount
  const negativeGearing = 0; // Not applicable for positive yield investments
  const effectiveTaxRate = taxCalculation.totalTax / (annualCashFlow + terminalValue - investmentAmount);

  // Benchmark comparisons
  const defaultBenchmarks = {
    'ASX 200': 0.08,
    'USYC': 0.05,
    'BUIDL': 0.045,
    'Infrastructure REITs': 0.075,
    'Carbon ETFs': 0.03
  };

  const allBenchmarks = { ...defaultBenchmarks, ...benchmarks };
  const benchmarkOutperformance: { [benchmark: string]: number } = {};
  Object.entries(allBenchmarks).forEach(([name, returns]) => {
    benchmarkOutperformance[name] = expectedReturn - returns;
  });

  const trackingError = volatility * 0.3; // Estimate
  const activeReturn = expectedReturn - marketReturn;
  const betaToMarket = beta;

  return {
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
    optimizedAllocation,
    riskContribution,
    diversificationRatio,
    concentrationRisk,
    frankingCreditValue,
    cgtDiscount,
    negativeGearing,
    effectiveTaxRate,
    benchmarkOutperformance,
    trackingError,
    activeReturn,
    betaToMarket
  };
}

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
    results[scenario as keyof ScenarioAnalysis] = calculateProfessionalMetrics(
      tokenType,
      investmentAmount,
      timeHorizon,
      expectedReturn,
      0.04, // Risk-free rate
      0.08, // Market return
      volatility,
      1.0,  // Beta
      investorClassification
    );
  });

  // Probability-weighted scenario (25% each scenario)
  const weights = { baseCase: 0.4, bullCase: 0.25, bearCase: 0.25, stressCase: 0.1 };
  const probabilityWeightedReturn = Object.entries(scenarios).reduce((sum, [scenario, ret]) => {
    return sum + ret * weights[scenario as keyof typeof weights];
  }, 0);

  results.probabilityWeighted = calculateProfessionalMetrics(
    tokenType,
    investmentAmount,
    timeHorizon,
    probabilityWeightedReturn,
    0.04,
    0.08,
    volatility,
    1.0,
    investorClassification
  );

  return results as ScenarioAnalysis;
}

// =============================================================================
// EXPORTS
// =============================================================================

// All exports are already declared inline above