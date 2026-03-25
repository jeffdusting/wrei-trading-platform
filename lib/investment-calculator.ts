/**
 * WREI Investment Calculator Library
 *
 * Bridges the interactive calculator UI with the existing financial calculation
 * engines in financial-calculations.ts and professional-analytics.ts.
 *
 * Provides:
 * - Pre-set investment profiles (Conservative, Moderate, Aggressive)
 * - Real-time calculation of IRR, NPV, cash-on-cash, payback period, total return
 * - Scenario comparison utilities for side-by-side analysis
 * - Cash flow projection generation for charting
 * - Input validation and bounds enforcement
 */

import type { WREITokenType } from './types';
import {
  calculateIRR,
  calculateNPV,
  calculateCashOnCash,
  calculatePaybackPeriod,
  calculateCAGR,
  calculateRiskAdjustedReturn,
  calculateRiskProfile,
  WREI_FINANCIAL_CONSTANTS,
  type CashFlow,
  type FinancialMetrics,
  type InvestmentScenario,
} from './financial-calculations';

// =============================================================================
// CALCULATOR INPUT / OUTPUT INTERFACES
// =============================================================================

export interface CalculatorInputs {
  investmentAmount: number;       // A$ (min 10,000 / max 500,000,000)
  timeHorizon: number;            // Years (1-30)
  tokenType: WREITokenType;       // carbon_credits | asset_co | dual_portfolio
  riskTolerance: RiskToleranceLevel;
  discountRate: number;           // 0.01 - 0.25
  taxRate: number;                // 0 - 0.47
  inflationRate: number;          // 0 - 0.15
  exitMultiple: number;           // 0.5 - 5.0
}

export type RiskToleranceLevel = 'conservative' | 'moderate' | 'aggressive';

export interface CalculatorResults {
  irr: number;
  npv: number;
  cashOnCash: number;
  paybackPeriod: number;
  totalReturn: number;
  annualisedReturn: number;
  riskAdjustedReturn: number;
  nominalEndValue: number;
  realEndValue: number;        // inflation-adjusted
  totalDistributions: number;
  totalTaxPaid: number;
  afterTaxReturn: number;
  cashFlowProjection: CashFlowProjectionPoint[];
  riskMetrics: CalculatorRiskMetrics;
}

export interface CashFlowProjectionPoint {
  year: number;
  cumulativeInvestment: number;
  annualDistribution: number;
  cumulativeDistributions: number;
  portfolioValue: number;
  netPosition: number;           // cumulative distributions + portfolio value - investment
}

export interface CalculatorRiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  probabilityOfLoss: number;     // simplified estimate
}

export interface InvestmentProfile {
  name: string;
  description: string;
  inputs: Partial<CalculatorInputs>;
}

export interface ScenarioComparison {
  id: string;
  label: string;
  inputs: CalculatorInputs;
  results: CalculatorResults;
}

// =============================================================================
// INPUT VALIDATION
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export const CALCULATOR_BOUNDS = {
  investmentAmount: { min: 10_000, max: 500_000_000 },
  timeHorizon: { min: 1, max: 30 },
  discountRate: { min: 0.01, max: 0.25 },
  taxRate: { min: 0, max: 0.47 },
  inflationRate: { min: 0, max: 0.15 },
  exitMultiple: { min: 0.5, max: 5.0 },
} as const;

export function validateCalculatorInputs(inputs: CalculatorInputs): ValidationError[] {
  const errors: ValidationError[] = [];

  if (inputs.investmentAmount < CALCULATOR_BOUNDS.investmentAmount.min ||
      inputs.investmentAmount > CALCULATOR_BOUNDS.investmentAmount.max) {
    errors.push({
      field: 'investmentAmount',
      message: `Investment must be between A$${CALCULATOR_BOUNDS.investmentAmount.min.toLocaleString()} and A$${CALCULATOR_BOUNDS.investmentAmount.max.toLocaleString()}`
    });
  }

  if (inputs.timeHorizon < CALCULATOR_BOUNDS.timeHorizon.min ||
      inputs.timeHorizon > CALCULATOR_BOUNDS.timeHorizon.max) {
    errors.push({
      field: 'timeHorizon',
      message: `Time horizon must be between ${CALCULATOR_BOUNDS.timeHorizon.min} and ${CALCULATOR_BOUNDS.timeHorizon.max} years`
    });
  }

  if (inputs.discountRate < CALCULATOR_BOUNDS.discountRate.min ||
      inputs.discountRate > CALCULATOR_BOUNDS.discountRate.max) {
    errors.push({
      field: 'discountRate',
      message: `Discount rate must be between ${(CALCULATOR_BOUNDS.discountRate.min * 100).toFixed(0)}% and ${(CALCULATOR_BOUNDS.discountRate.max * 100).toFixed(0)}%`
    });
  }

  if (inputs.taxRate < CALCULATOR_BOUNDS.taxRate.min ||
      inputs.taxRate > CALCULATOR_BOUNDS.taxRate.max) {
    errors.push({
      field: 'taxRate',
      message: `Tax rate must be between ${(CALCULATOR_BOUNDS.taxRate.min * 100).toFixed(0)}% and ${(CALCULATOR_BOUNDS.taxRate.max * 100).toFixed(0)}%`
    });
  }

  if (inputs.inflationRate < CALCULATOR_BOUNDS.inflationRate.min ||
      inputs.inflationRate > CALCULATOR_BOUNDS.inflationRate.max) {
    errors.push({
      field: 'inflationRate',
      message: `Inflation rate must be between ${(CALCULATOR_BOUNDS.inflationRate.min * 100).toFixed(0)}% and ${(CALCULATOR_BOUNDS.inflationRate.max * 100).toFixed(0)}%`
    });
  }

  if (inputs.exitMultiple < CALCULATOR_BOUNDS.exitMultiple.min ||
      inputs.exitMultiple > CALCULATOR_BOUNDS.exitMultiple.max) {
    errors.push({
      field: 'exitMultiple',
      message: `Exit multiple must be between ${CALCULATOR_BOUNDS.exitMultiple.min}x and ${CALCULATOR_BOUNDS.exitMultiple.max}x`
    });
  }

  const validTokenTypes: WREITokenType[] = ['carbon_credits', 'asset_co', 'dual_portfolio'];
  if (!validTokenTypes.includes(inputs.tokenType)) {
    errors.push({
      field: 'tokenType',
      message: 'Token type must be carbon_credits, asset_co, or dual_portfolio'
    });
  }

  const validRiskLevels: RiskToleranceLevel[] = ['conservative', 'moderate', 'aggressive'];
  if (!validRiskLevels.includes(inputs.riskTolerance)) {
    errors.push({
      field: 'riskTolerance',
      message: 'Risk tolerance must be conservative, moderate, or aggressive'
    });
  }

  return errors;
}

// =============================================================================
// PRE-SET INVESTMENT PROFILES
// =============================================================================

export const INVESTMENT_PROFILES: Record<RiskToleranceLevel, InvestmentProfile> = {
  conservative: {
    name: 'Conservative',
    description: 'Lower risk, stable income focus. Suitable for institutional investors prioritising capital preservation.',
    inputs: {
      tokenType: 'asset_co',
      riskTolerance: 'conservative',
      discountRate: 0.06,
      taxRate: 0.30,
      inflationRate: 0.03,
      exitMultiple: 1.2,
      timeHorizon: 10,
    },
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced risk-return profile. Blended portfolio with diversification benefits.',
    inputs: {
      tokenType: 'dual_portfolio',
      riskTolerance: 'moderate',
      discountRate: 0.08,
      taxRate: 0.25,
      inflationRate: 0.03,
      exitMultiple: 1.5,
      timeHorizon: 7,
    },
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Higher risk, growth-oriented. Carbon credit exposure with maximum upside potential.',
    inputs: {
      tokenType: 'carbon_credits',
      riskTolerance: 'aggressive',
      discountRate: 0.10,
      taxRate: 0.25,
      inflationRate: 0.04,
      exitMultiple: 2.0,
      timeHorizon: 5,
    },
  },
};

export function getDefaultInputs(): CalculatorInputs {
  return {
    investmentAmount: 1_000_000,
    timeHorizon: 7,
    tokenType: 'dual_portfolio',
    riskTolerance: 'moderate',
    discountRate: 0.08,
    taxRate: 0.25,
    inflationRate: 0.03,
    exitMultiple: 1.5,
  };
}

export function applyProfile(
  currentInputs: CalculatorInputs,
  profile: RiskToleranceLevel
): CalculatorInputs {
  const profileData = INVESTMENT_PROFILES[profile];
  return {
    ...currentInputs,
    ...profileData.inputs,
  };
}

// =============================================================================
// EXPECTED RETURN BY TOKEN TYPE AND RISK TOLERANCE
// =============================================================================

function getExpectedAnnualYield(tokenType: WREITokenType, riskTolerance: RiskToleranceLevel): number {
  const yieldMatrix: Record<WREITokenType, Record<RiskToleranceLevel, number>> = {
    carbon_credits: {
      conservative: 0.06,
      moderate: 0.08,
      aggressive: 0.12,
    },
    asset_co: {
      conservative: 0.20,
      moderate: 0.25,
      aggressive: 0.283,
    },
    dual_portfolio: {
      conservative: 0.12,
      moderate: 0.15,
      aggressive: 0.18,
    },
  };

  return yieldMatrix[tokenType]?.[riskTolerance] ?? 0.08;
}

function getAppreciationRate(tokenType: WREITokenType, riskTolerance: RiskToleranceLevel): number {
  const appreciationMatrix: Record<WREITokenType, Record<RiskToleranceLevel, number>> = {
    carbon_credits: {
      conservative: 0.02,
      moderate: 0.05,
      aggressive: 0.08,
    },
    asset_co: {
      conservative: 0.01,
      moderate: 0.03,
      aggressive: 0.05,
    },
    dual_portfolio: {
      conservative: 0.015,
      moderate: 0.04,
      aggressive: 0.065,
    },
  };

  return appreciationMatrix[tokenType]?.[riskTolerance] ?? 0.03;
}

// =============================================================================
// CORE CALCULATION ENGINE
// =============================================================================

export function calculateInvestment(inputs: CalculatorInputs): CalculatorResults {
  const errors = validateCalculatorInputs(inputs);
  if (errors.length > 0) {
    throw new Error(`Invalid inputs: ${errors.map(e => e.message).join('; ')}`);
  }

  const annualYield = getExpectedAnnualYield(inputs.tokenType, inputs.riskTolerance);
  const appreciationRate = getAppreciationRate(inputs.tokenType, inputs.riskTolerance);
  const riskProfile = calculateRiskProfile(inputs.tokenType);

  // Build cash flow schedule
  const cashFlows = buildCashFlows(inputs, annualYield);

  // Core metrics
  const irr = calculateIRR(cashFlows);
  const npv = calculateNPV(cashFlows, inputs.discountRate);
  const paybackPeriod = calculatePaybackPeriod(cashFlows);

  // Distributions
  const totalDistributions = cashFlows
    .filter(cf => cf.type === 'quarterly_distribution' || cf.type === 'lease_income')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const totalGrossDistributions = totalDistributions / (1 - inputs.taxRate);
  const totalTaxPaid = totalGrossDistributions - totalDistributions;

  const cashOnCash = calculateCashOnCash(inputs.investmentAmount, totalDistributions, inputs.timeHorizon);

  // End value
  const nominalEndValue = inputs.investmentAmount *
    Math.pow(1 + appreciationRate, inputs.timeHorizon) *
    inputs.exitMultiple;

  const realEndValue = nominalEndValue /
    Math.pow(1 + inputs.inflationRate, inputs.timeHorizon);

  // Total return
  const totalReturnValue = totalDistributions + nominalEndValue - inputs.investmentAmount;
  const totalReturn = totalReturnValue / inputs.investmentAmount;

  // Annualised return
  const annualisedReturn = calculateCAGR(
    inputs.investmentAmount,
    totalDistributions + nominalEndValue,
    inputs.timeHorizon
  );

  // Risk-adjusted
  const riskAdjustedReturn = calculateRiskAdjustedReturn(
    annualisedReturn,
    0.04, // risk-free rate
    riskProfile.volatility
  );

  // After-tax return
  const afterTaxReturn = totalDistributions + (nominalEndValue - inputs.investmentAmount) * (1 - inputs.taxRate * 0.5); // CGT discount
  const afterTaxReturnPct = (afterTaxReturn - inputs.investmentAmount) / inputs.investmentAmount;

  // Cash flow projection for charting
  const cashFlowProjection = buildCashFlowProjection(inputs, annualYield, appreciationRate);

  // Risk metrics
  const volatility = riskProfile.volatility;
  const sharpeRatio = (annualisedReturn - 0.04) / (volatility || 0.01);
  const maxDrawdown = riskProfile.maxDrawdown;
  const probabilityOfLoss = estimateProbabilityOfLoss(annualisedReturn, volatility, inputs.timeHorizon);

  return {
    irr,
    npv,
    cashOnCash,
    paybackPeriod,
    totalReturn,
    annualisedReturn,
    riskAdjustedReturn,
    nominalEndValue,
    realEndValue,
    totalDistributions,
    totalTaxPaid,
    afterTaxReturn: afterTaxReturnPct,
    cashFlowProjection,
    riskMetrics: {
      volatility,
      sharpeRatio,
      maxDrawdown,
      probabilityOfLoss,
    },
  };
}

// =============================================================================
// CASH FLOW CONSTRUCTION
// =============================================================================

function buildCashFlows(inputs: CalculatorInputs, annualYield: number): CashFlow[] {
  const cashFlows: CashFlow[] = [];
  const baseDate = new Date(2026, 0, 1); // Fixed reference

  // Initial investment
  cashFlows.push({
    date: baseDate.toISOString(),
    amount: -inputs.investmentAmount,
    type: 'initial_investment',
    description: 'Initial investment',
    taxable: false,
  });

  // Quarterly distributions
  const quarterlyGross = inputs.investmentAmount * annualYield / 4;
  const quarterlyNet = quarterlyGross * (1 - inputs.taxRate);
  const flowType = inputs.tokenType === 'asset_co' ? 'lease_income' : 'quarterly_distribution';

  for (let q = 1; q <= inputs.timeHorizon * 4; q++) {
    const qDate = new Date(baseDate);
    qDate.setMonth(qDate.getMonth() + q * 3);

    cashFlows.push({
      date: qDate.toISOString(),
      amount: quarterlyNet,
      type: flowType as 'quarterly_distribution' | 'lease_income',
      description: `Q${q} distribution`,
      taxable: true,
      taxRate: inputs.taxRate,
    });
  }

  // Exit value
  const appreciationRate = getAppreciationRate(inputs.tokenType, inputs.riskTolerance);
  const exitValue = inputs.investmentAmount *
    Math.pow(1 + appreciationRate, inputs.timeHorizon) *
    inputs.exitMultiple;

  const exitDate = new Date(baseDate);
  exitDate.setFullYear(exitDate.getFullYear() + inputs.timeHorizon);

  cashFlows.push({
    date: exitDate.toISOString(),
    amount: exitValue,
    type: 'exit_value',
    description: 'Token sale proceeds',
    taxable: true,
    taxRate: inputs.taxRate * 0.5, // CGT discount
  });

  return cashFlows;
}

function buildCashFlowProjection(
  inputs: CalculatorInputs,
  annualYield: number,
  appreciationRate: number
): CashFlowProjectionPoint[] {
  const projection: CashFlowProjectionPoint[] = [];
  let cumulativeDistributions = 0;
  const annualDistribution = inputs.investmentAmount * annualYield * (1 - inputs.taxRate);

  for (let year = 0; year <= inputs.timeHorizon; year++) {
    if (year > 0) {
      cumulativeDistributions += annualDistribution;
    }

    const portfolioValue = inputs.investmentAmount *
      Math.pow(1 + appreciationRate, year);

    projection.push({
      year,
      cumulativeInvestment: inputs.investmentAmount,
      annualDistribution: year === 0 ? 0 : annualDistribution,
      cumulativeDistributions,
      portfolioValue,
      netPosition: cumulativeDistributions + portfolioValue - inputs.investmentAmount,
    });
  }

  return projection;
}

// =============================================================================
// RISK ESTIMATION
// =============================================================================

function estimateProbabilityOfLoss(
  expectedReturn: number,
  volatility: number,
  timeHorizon: number
): number {
  // Simplified: use z-score for cumulative normal approximation
  if (volatility === 0) return 0;
  const annualisedVol = volatility / Math.sqrt(timeHorizon);
  const zScore = expectedReturn / annualisedVol;

  // Approximate cumulative normal (Abramowitz and Stegun)
  const sign = zScore >= 0 ? 1 : -1;
  const z = Math.abs(zScore);
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  const cdf = zScore >= 0 ? 1 - p : p;
  return Math.max(0, Math.min(1, 1 - cdf)); // probability of negative return
}

// =============================================================================
// SCENARIO COMPARISON
// =============================================================================

export function createScenarioComparison(
  id: string,
  label: string,
  inputs: CalculatorInputs
): ScenarioComparison {
  const results = calculateInvestment(inputs);
  return { id, label, inputs, results };
}

export function compareScenarios(
  scenarios: ScenarioComparison[]
): {
  scenarios: ScenarioComparison[];
  bestIRR: string;
  bestNPV: string;
  lowestRisk: string;
  quickestPayback: string;
} {
  if (scenarios.length === 0) {
    return {
      scenarios: [],
      bestIRR: '',
      bestNPV: '',
      lowestRisk: '',
      quickestPayback: '',
    };
  }

  const bestIRR = scenarios.reduce((best, s) =>
    s.results.irr > best.results.irr ? s : best
  );

  const bestNPV = scenarios.reduce((best, s) =>
    s.results.npv > best.results.npv ? s : best
  );

  const lowestRisk = scenarios.reduce((best, s) =>
    s.results.riskMetrics.volatility < best.results.riskMetrics.volatility ? s : best
  );

  const quickestPayback = scenarios.reduce((best, s) =>
    s.results.paybackPeriod < best.results.paybackPeriod ? s : best
  );

  return {
    scenarios,
    bestIRR: bestIRR.id,
    bestNPV: bestNPV.id,
    lowestRisk: lowestRisk.id,
    quickestPayback: quickestPayback.id,
  };
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `A$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (Math.abs(value) >= 1_000_000) {
    return `A$${(value / 1_000_000).toFixed(2)}M`;
  } else if (Math.abs(value) >= 1_000) {
    return `A$${(value / 1_000).toFixed(1)}K`;
  }
  return `A$${value.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatYears(value: number): string {
  if (value === Infinity) return 'N/A';
  if (value < 1) return `${Math.round(value * 12)} months`;
  return `${value.toFixed(1)} years`;
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

// =============================================================================
// TOKEN TYPE DISPLAY NAMES
// =============================================================================

export const TOKEN_TYPE_LABELS: Record<WREITokenType, string> = {
  carbon_credits: 'Carbon Credit Tokens',
  asset_co: 'Asset Co Tokens',
  dual_portfolio: 'Dual Portfolio (Blended)',
};

export const TOKEN_TYPE_DESCRIPTIONS: Record<WREITokenType, string> = {
  carbon_credits: 'Revenue-share tokens backed by verified carbon credits with dMRV premium',
  asset_co: 'Infrastructure-backed tokens with ferry lease income and 28.3% target yield',
  dual_portfolio: 'Blended allocation across carbon credits and Asset Co for diversification',
};
