/**
 * WREI Financial Calculations - Institutional-Grade Metrics
 *
 * Comprehensive financial calculation engine for WREI tokenization:
 * - IRR (Internal Rate of Return) calculations
 * - Cash-on-Cash returns
 * - Net Present Value (NPV)
 * - Risk-adjusted returns
 * - Tax-efficient yield calculations
 *
 * Based on WREI Tokenization Practical Paper financial specifications
 */

import type { YieldModel, DistributionSchedule } from './yield-models';
import type { WREITokenType } from './types';

// =============================================================================
// FINANCIAL CALCULATION INTERFACES
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

// =============================================================================
// FINANCIAL CONSTANTS (BASED ON WREI SPECIFICATIONS)
// =============================================================================

export const WREI_FINANCIAL_CONSTANTS = {
  // Carbon Credit Financials
  CARBON_CREDITS: {
    BASE_CREDITS: 3_120_000,
    EXPANSION_CREDITS: 13_100_000,
    BASE_PRICE: 100, // A$/tonne
    WREI_PREMIUM: 1.5,
    EFFECTIVE_PRICE: 150, // A$/tonne
    BASE_REVENUE: 468_000_000, // A$ total
    EXPANSION_REVENUE: 1_970_000_000, // A$ total
    ANNUAL_STEADY_STATE_BASE: 33_400_000, // A$ annual
    ANNUAL_STEADY_STATE_EXPANSION: 141_000_000, // A$ annual
  },

  // Asset Co Financials
  ASSET_CO: {
    TOTAL_CAPEX: 473_000_000, // A$
    DEBT_FUNDING: 342_000_000, // A$ at 7%
    TOKEN_EQUITY: 131_000_000, // A$
    LEASE_INCOME_ANNUAL: 61_100_000, // A$
    NET_CASH_FLOW_ANNUAL: 37_100_000, // A$
    TARGET_EQUITY_YIELD: 0.283, // 28.3%
    CASH_ON_CASH_MULTIPLE: 3.0,
    DEBT_SERVICE_RATE: 0.07, // 7% debt rate
  },

  // Market Context
  MARKET: {
    TOKENIZED_RWA_MARKET: 19_000_000_000, // A$19B
    CARBON_MARKET_2030: 155_000_000_000, // A$155B projected
    RWA_GROWTH_RATE: 1.4, // 140% in 15 months
    CARBON_PRICE_VOLATILITY: 0.25, // 25% annual volatility
    INFRASTRUCTURE_DISCOUNT_RATE: 0.08, // 8% infrastructure discount rate
  }
};

// =============================================================================
// CORE FINANCIAL CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 */
export function calculateIRR(cashFlows: CashFlow[]): number {
  // Sort cash flows by date
  const sortedFlows = cashFlows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedFlows.length < 2) return 0;

  // Initial guess: 10%
  let irr = 0.1;
  const tolerance = 1e-6;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    const { npv, derivative } = calculateNPVandDerivative(sortedFlows, irr);

    if (Math.abs(npv) < tolerance) {
      return irr;
    }

    if (Math.abs(derivative) < tolerance) {
      break; // Derivative too small, cannot continue
    }

    irr = irr - npv / derivative;

    // Bounds checking
    if (irr < -0.99) irr = -0.99;
    if (irr > 10) irr = 10;
  }

  return irr;
}

/**
 * Calculate NPV and its derivative for IRR calculation
 */
function calculateNPVandDerivative(cashFlows: CashFlow[], rate: number): { npv: number; derivative: number } {
  const startDate = new Date(cashFlows[0].date).getTime();
  let npv = 0;
  let derivative = 0;

  for (const flow of cashFlows) {
    const years = (new Date(flow.date).getTime() - startDate) / (365.25 * 24 * 60 * 60 * 1000);
    const discountFactor = Math.pow(1 + rate, -years);

    npv += flow.amount * discountFactor;
    derivative -= flow.amount * years * discountFactor / (1 + rate);
  }

  return { npv, derivative };
}

/**
 * Calculate Net Present Value at given discount rate
 */
export function calculateNPV(cashFlows: CashFlow[], discountRate: number): number {
  const sortedFlows = cashFlows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const startDate = new Date(sortedFlows[0].date).getTime();

  return sortedFlows.reduce((npv, flow) => {
    const years = (new Date(flow.date).getTime() - startDate) / (365.25 * 24 * 60 * 60 * 1000);
    const presentValue = flow.amount / Math.pow(1 + discountRate, years);
    return npv + presentValue;
  }, 0);
}

/**
 * Calculate Cash-on-Cash return multiple
 */
export function calculateCashOnCash(
  initialInvestment: number,
  totalCashReturns: number,
  holdingPeriod: number
): number {
  if (initialInvestment === 0) return 0;
  return totalCashReturns / initialInvestment;
}

/**
 * Calculate payback period in years
 */
export function calculatePaybackPeriod(cashFlows: CashFlow[]): number {
  const sortedFlows = cashFlows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulativeCashFlow = 0;
  const startDate = new Date(sortedFlows[0].date).getTime();

  for (const flow of sortedFlows) {
    cumulativeCashFlow += flow.amount;

    if (cumulativeCashFlow >= 0) {
      const years = (new Date(flow.date).getTime() - startDate) / (365.25 * 24 * 60 * 60 * 1000);
      return years;
    }
  }

  return Infinity; // Never pays back
}

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 */
export function calculateCAGR(
  beginningValue: number,
  endingValue: number,
  periods: number
): number {
  if (beginningValue === 0 || periods === 0) return 0;
  return Math.pow(endingValue / beginningValue, 1 / periods) - 1;
}

// =============================================================================
// TOKEN-SPECIFIC FINANCIAL CALCULATIONS
// =============================================================================

/**
 * Calculate comprehensive financial metrics for Carbon Credit tokens
 */
export function calculateCarbonCreditMetrics(
  scenario: InvestmentScenario,
  yieldModel: YieldModel
): FinancialMetrics {
  const cashFlows: CashFlow[] = [];

  // Initial investment (negative cash flow)
  cashFlows.push({
    date: new Date().toISOString(),
    amount: -scenario.initialInvestment,
    type: 'initial_investment',
    description: 'Initial carbon credit token purchase',
    taxable: false
  });

  // Quarterly distributions
  const quarterlyYield = scenario.initialInvestment * 0.08 / 4; // 8% annual yield, quarterly
  for (let quarter = 1; quarter <= scenario.holdingPeriod * 4; quarter++) {
    const quarterDate = new Date();
    quarterDate.setMonth(quarterDate.getMonth() + quarter * 3);

    cashFlows.push({
      date: quarterDate.toISOString(),
      amount: quarterlyYield * (1 - scenario.taxRate),
      type: 'quarterly_distribution',
      description: `Q${quarter} carbon credit revenue distribution`,
      taxable: true,
      taxRate: scenario.taxRate
    });
  }

  // Exit value (capital appreciation)
  if (scenario.exitMultiple) {
    const exitDate = new Date();
    exitDate.setFullYear(exitDate.getFullYear() + scenario.holdingPeriod);

    cashFlows.push({
      date: exitDate.toISOString(),
      amount: scenario.initialInvestment * scenario.exitMultiple,
      type: 'exit_value',
      description: 'Token sale proceeds',
      taxable: true,
      taxRate: scenario.taxRate * 0.5 // Capital gains tax discount
    });
  }

  return calculateMetricsFromCashFlows(cashFlows, scenario);
}

/**
 * Calculate comprehensive financial metrics for Asset Co tokens
 */
export function calculateAssetCoMetrics(
  scenario: InvestmentScenario,
  yieldModel: YieldModel
): FinancialMetrics {
  const cashFlows: CashFlow[] = [];

  // Initial investment
  cashFlows.push({
    date: new Date().toISOString(),
    amount: -scenario.initialInvestment,
    type: 'initial_investment',
    description: 'Initial asset co token purchase',
    taxable: false
  });

  // Quarterly lease income distributions (28.3% annual yield)
  const quarterlyIncome = (scenario.initialInvestment * WREI_FINANCIAL_CONSTANTS.ASSET_CO.TARGET_EQUITY_YIELD) / 4;
  for (let quarter = 1; quarter <= scenario.holdingPeriod * 4; quarter++) {
    const quarterDate = new Date();
    quarterDate.setMonth(quarterDate.getMonth() + quarter * 3);

    cashFlows.push({
      date: quarterDate.toISOString(),
      amount: quarterlyIncome * (1 - scenario.taxRate),
      type: 'lease_income',
      description: `Q${quarter} ferry lease income distribution`,
      taxable: true,
      taxRate: scenario.taxRate
    });
  }

  // Exit value based on cash-on-cash multiple
  if (scenario.exitMultiple) {
    const exitDate = new Date();
    exitDate.setFullYear(exitDate.getFullYear() + scenario.holdingPeriod);

    cashFlows.push({
      date: exitDate.toISOString(),
      amount: scenario.initialInvestment * WREI_FINANCIAL_CONSTANTS.ASSET_CO.CASH_ON_CASH_MULTIPLE,
      type: 'exit_value',
      description: 'Asset co token sale at 3.0x multiple',
      taxable: true,
      taxRate: scenario.taxRate * 0.5
    });
  }

  return calculateMetricsFromCashFlows(cashFlows, scenario);
}

/**
 * Calculate blended metrics for dual portfolio
 */
export function calculateDualPortfolioMetrics(
  scenario: InvestmentScenario,
  carbonWeight: number = 0.4,
  assetCoWeight: number = 0.6
): FinancialMetrics {
  // Split investment across both token types
  const carbonInvestment = { ...scenario, initialInvestment: scenario.initialInvestment * carbonWeight };
  const assetCoInvestment = { ...scenario, initialInvestment: scenario.initialInvestment * assetCoWeight };

  const carbonMetrics = calculateCarbonCreditMetrics(carbonInvestment, {} as YieldModel);
  const assetCoMetrics = calculateAssetCoMetrics(assetCoInvestment, {} as YieldModel);

  // Weighted average metrics
  return {
    irr: carbonMetrics.irr * carbonWeight + assetCoMetrics.irr * assetCoWeight,
    cashOnCash: carbonMetrics.cashOnCash * carbonWeight + assetCoMetrics.cashOnCash * assetCoWeight,
    npv: carbonMetrics.npv + assetCoMetrics.npv,
    paybackPeriod: Math.min(carbonMetrics.paybackPeriod, assetCoMetrics.paybackPeriod),
    riskAdjustedReturn: (carbonMetrics.riskAdjustedReturn * carbonWeight + assetCoMetrics.riskAdjustedReturn * assetCoWeight) + 0.02, // Cross-collateral benefit
    totalReturn: carbonMetrics.totalReturn + assetCoMetrics.totalReturn,
    yieldOnCost: carbonMetrics.yieldOnCost * carbonWeight + assetCoMetrics.yieldOnCost * assetCoWeight,
    compoundAnnualGrowthRate: carbonMetrics.compoundAnnualGrowthRate * carbonWeight + assetCoMetrics.compoundAnnualGrowthRate * assetCoWeight
  };
}

// =============================================================================
// RISK-ADJUSTED CALCULATIONS
// =============================================================================

/**
 * Calculate risk-adjusted returns using Sharpe ratio methodology
 */
export function calculateRiskAdjustedReturn(
  expectedReturn: number,
  riskFreeRate: number,
  volatility: number
): number {
  if (volatility === 0) return expectedReturn;
  const excessReturn = expectedReturn - riskFreeRate;
  const sharpeRatio = excessReturn / volatility;
  return riskFreeRate + (sharpeRatio * volatility * 0.8); // Risk adjustment factor
}

/**
 * Calculate portfolio risk profile for WREI tokens
 */
export function calculateRiskProfile(tokenType: WREITokenType): RiskProfile {
  switch (tokenType) {
    case 'carbon_credits':
      return {
        volatility: 0.25, // 25% annual volatility
        sharpeRatio: 0.8, // Good risk-adjusted returns
        maxDrawdown: 0.15, // 15% maximum drawdown
        correlationToMarket: 0.3, // Low correlation to traditional markets
        liquidityRisk: 'medium',
        operationalRisk: 'low',
        regulatoryRisk: 'medium'
      };

    case 'asset_co':
      return {
        volatility: 0.12, // 12% annual volatility (infrastructure-like)
        sharpeRatio: 1.2, // Excellent risk-adjusted returns
        maxDrawdown: 0.08, // 8% maximum drawdown
        correlationToMarket: 0.2, // Very low correlation
        liquidityRisk: 'low',
        operationalRisk: 'low',
        regulatoryRisk: 'low'
      };

    case 'dual_portfolio':
      return {
        volatility: 0.15, // Blended volatility
        sharpeRatio: 1.0, // Good diversified returns
        maxDrawdown: 0.10, // Diversification benefit
        correlationToMarket: 0.25, // Blended correlation
        liquidityRisk: 'low',
        operationalRisk: 'low',
        regulatoryRisk: 'low'
      };

    default:
      return {
        volatility: 0.20,
        sharpeRatio: 0.6,
        maxDrawdown: 0.20,
        correlationToMarket: 0.5,
        liquidityRisk: 'medium',
        operationalRisk: 'medium',
        regulatoryRisk: 'medium'
      };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate metrics from cash flows array
 */
function calculateMetricsFromCashFlows(
  cashFlows: CashFlow[],
  scenario: InvestmentScenario
): FinancialMetrics {
  const irr = calculateIRR(cashFlows);
  const npv = calculateNPV(cashFlows, scenario.discountRate);
  const paybackPeriod = calculatePaybackPeriod(cashFlows);

  // Total cash distributions (excluding initial investment and exit value)
  const totalDistributions = cashFlows
    .filter(cf => cf.type === 'quarterly_distribution' || cf.type === 'lease_income')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const cashOnCash = calculateCashOnCash(scenario.initialInvestment, totalDistributions, scenario.holdingPeriod);

  // Exit value calculation
  const exitValue = cashFlows.find(cf => cf.type === 'exit_value')?.amount || scenario.initialInvestment;
  const totalReturn = (totalDistributions + exitValue) / scenario.initialInvestment - 1;

  const compoundAnnualGrowthRate = calculateCAGR(
    scenario.initialInvestment,
    exitValue + totalDistributions,
    scenario.holdingPeriod
  );

  const yieldOnCost = totalDistributions / scenario.initialInvestment / scenario.holdingPeriod;

  const riskAdjustedReturn = calculateRiskAdjustedReturn(
    irr,
    0.05, // 5% risk-free rate
    calculateRiskProfile('carbon_credits').volatility
  );

  return {
    irr,
    cashOnCash,
    npv,
    paybackPeriod,
    riskAdjustedReturn,
    totalReturn,
    yieldOnCost,
    compoundAnnualGrowthRate
  };
}

/**
 * Format financial metrics for display
 */
export function formatFinancialMetrics(metrics: FinancialMetrics): Record<string, string> {
  return {
    irr: `${(metrics.irr * 100).toFixed(2)}%`,
    cashOnCash: `${metrics.cashOnCash.toFixed(2)}x`,
    npv: `A$${(metrics.npv / 1000000).toFixed(2)}M`,
    paybackPeriod: `${metrics.paybackPeriod.toFixed(1)} years`,
    riskAdjustedReturn: `${(metrics.riskAdjustedReturn * 100).toFixed(2)}%`,
    totalReturn: `${(metrics.totalReturn * 100).toFixed(2)}%`,
    yieldOnCost: `${(metrics.yieldOnCost * 100).toFixed(2)}%`,
    compoundAnnualGrowthRate: `${(metrics.compoundAnnualGrowthRate * 100).toFixed(2)}%`
  };
}

// =============================================================================
// FINANCIAL CALCULATIONS METADATA
// =============================================================================

export const FINANCIAL_CALCULATIONS_METADATA = {
  supportedMetrics: [
    'IRR', 'Cash-on-Cash', 'NPV', 'Payback Period', 'Risk-Adjusted Return',
    'Total Return', 'Yield on Cost', 'CAGR'
  ],
  calculationMethods: ['Newton-Raphson IRR', 'Discounted Cash Flow', 'Risk-Adjusted Sharpe'],
  supportedTokenTypes: ['carbon_credits', 'asset_co', 'dual_portfolio'],
  lastUpdated: '2026-03-20',
  version: '1.0.0',
  basedOn: 'WREI Tokenization Practical Paper Specifications'
};