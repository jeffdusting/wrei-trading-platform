/**
 * WREI Sprint A2: Financial Calculations Test Suite
 *
 * Core Logic Testing Phase - Financial Calculations Module
 * Tests comprehensive financial modeling system for WREI tokenization platform
 *
 * CRITICAL: These tests validate the core financial engine that powers:
 * - Carbon credit pricing and valuation
 * - Asset Co-investment calculations
 * - Dual portfolio optimization
 * - Yield mechanism computations
 * - Risk-adjusted return calculations
 *
 * Total Tests: 20 comprehensive financial tests
 */

import {
  calculateCarbonCreditMetricsFlexible as calculateCarbonCreditMetrics,
  calculateAssetCoMetricsFlexible as calculateAssetCoMetrics,
  calculateDualPortfolioMetricsFlexible as calculateDualPortfolioMetrics,
  formatFinancialMetricsFlexible as formatFinancialMetrics,
  calculateIRR,
  calculateNPV,
  calculateCashOnCash,
  calculateCAGR,
  calculateRiskAdjustedReturn,
  WREI_FINANCIAL_CONSTANTS
} from '@/lib/financial-calculations';
import type { FinancialMetrics, CashFlow, InvestmentScenario } from '@/lib/financial-calculations';
import type { YieldModel } from '@/lib/yield-models';

describe('WREI Financial Calculations - Core Logic', () => {

  // =============================================================================
  // CARBON CREDIT FINANCIAL CALCULATIONS
  // =============================================================================

  test('1. Carbon Credit Revenue Share Calculation', () => {
    const scenario = {
      initialInvestment: 10_000_000,
      holdingPeriod: 5,
      exitMultiple: 1.0,
      discountRate: 0.08,
      taxRate: 0.30,
      inflationRate: 0.025
    };

    const yieldModel = {
      tokenType: 'carbon_credits' as const,
      baseYield: 0.08,
      distributionFrequency: 'quarterly' as const,
      taxTreatment: 'income' as const,
      riskAdjustment: 0.0
    };

    const metrics = calculateCarbonCreditMetrics(scenario, yieldModel);

    expect(metrics.irr).toBeCloseTo(0.08, 1); // 8% IRR
    expect(metrics.cashOnCash).toBeGreaterThan(0.07); // Positive cash-on-cash
    expect(metrics.totalReturn).toBeGreaterThan(2_500_000); // Positive total return
    expect(metrics.compoundAnnualGrowthRate).toBeGreaterThan(0.05);
  });

  test('2. Carbon Credit NAV-Accruing Calculation', () => {
    const metrics = calculateCarbonCreditMetrics({
      investmentAmount: 5_000_000,
      carbonCredits: 50_000,
      yieldMechanism: 'nav_accruing',
      timeHorizon: 3
    });

    expect(metrics.annualYield).toBe(0.12); // 12% NAV accruing
    expect(metrics.totalReturns).toBe(1_800_000); // A$1.8M over 3 years
    expect(metrics.compoundedValue).toBeGreaterThan(7_000_000);
    expect(metrics.cgtTreatment).toBe(true);
  });

  test('3. Carbon Credit Pricing Under Market Stress', () => {
    const metrics = calculateCarbonCreditMetrics({
      investmentAmount: 20_000_000,
      carbonCredits: 200_000,
      yieldMechanism: 'revenue_share',
      timeHorizon: 7,
      marketStress: 'high'
    });

    expect(metrics.stressAdjustedPrice).toBeLessThan(100);
    expect(metrics.volatilityAdjustment).toBeGreaterThan(0);
    expect(metrics.riskPremium).toBeGreaterThan(0.02);
  });

  test('4. Carbon Credit dMRV Premium Calculation', () => {
    const metrics = calculateCarbonCreditMetrics({
      investmentAmount: 15_000_000,
      carbonCredits: 150_000,
      yieldMechanism: 'revenue_share',
      timeHorizon: 5,
      dmrvEnabled: true
    });

    expect(metrics.dmrvPremium).toBe(0.78); // 78% premium
    expect(metrics.enhancedPrice).toBeCloseTo(178, 0); // A$178 per credit
    expect(metrics.qualityScore).toBeGreaterThan(9.0);
  });

  // =============================================================================
  // ASSET CO-INVESTMENT CALCULATIONS
  // =============================================================================

  test('5. Asset Co Primary Investment Calculation', () => {
    const metrics = calculateAssetCoMetrics({
      investmentAmount: 50_000_000,
      assetType: 'infrastructure',
      region: 'au',
      timeHorizon: 10,
      leverageRatio: 0.65
    });

    expect(metrics.annualYield).toBe(0.283); // 28.3% yield
    expect(metrics.leveragedReturn).toBeGreaterThan(0.4);
    expect(metrics.infraReturn).toBeGreaterThan(14_000_000); // Annual
    expect(metrics.taxAdvantage).toBeGreaterThan(0);
  });

  test('6. Asset Co ESG Infrastructure Metrics', () => {
    const metrics = calculateAssetCoMetrics({
      investmentAmount: 25_000_000,
      assetType: 'green_infrastructure',
      region: 'au',
      timeHorizon: 15,
      esgFocus: true
    });

    expect(metrics.esgPremium).toBeGreaterThan(0);
    expect(metrics.sustainabilityScore).toBeGreaterThan(8.5);
    expect(metrics.regulatoryAdvantage).toBeGreaterThan(0);
    expect(metrics.longTermMultiplier).toBeGreaterThan(1.2);
  });

  test('7. Asset Co Cross-Collateral Strategy', () => {
    const metrics = calculateAssetCoMetrics({
      investmentAmount: 75_000_000,
      assetType: 'mixed_portfolio',
      region: 'au',
      timeHorizon: 8,
      crossCollateral: true
    });

    expect(metrics.collateralAdvantage).toBeGreaterThan(0.05);
    expect(metrics.diversificationBonus).toBeGreaterThan(0.02);
    expect(metrics.riskReduction).toBeLessThan(0);
    expect(metrics.capitalEfficiency).toBeGreaterThan(1.15);
  });

  test('8. Asset Co Liquidity and Exit Modeling', () => {
    const metrics = calculateAssetCoMetrics({
      investmentAmount: 40_000_000,
      assetType: 'infrastructure',
      region: 'au',
      timeHorizon: 12,
      exitStrategy: 'trade_sale'
    });

    expect(metrics.exitMultiple).toBeGreaterThan(2.5);
    expect(metrics.liquidityDiscount).toBeLessThan(0.05);
    expect(metrics.exitValue).toBeGreaterThan(100_000_000);
    expect(metrics.holdingPeriodReturn).toBeGreaterThan(0.25);
  });

  // =============================================================================
  // DUAL PORTFOLIO OPTIMIZATION
  // =============================================================================

  test('9. Dual Portfolio Balanced Allocation', () => {
    const metrics = calculateDualPortfolioMetrics({
      totalInvestment: 100_000_000,
      carbonAllocation: 0.6,
      assetCoAllocation: 0.4,
      timeHorizon: 7,
      riskTolerance: 'moderate'
    });

    expect(metrics.blendedYield).toBeGreaterThan(0.15);
    expect(metrics.portfolioRisk).toBeLessThan(0.20);
    expect(metrics.sharpeRatio).toBeGreaterThan(0.8);
    expect(metrics.diversificationBenefit).toBeGreaterThan(0.02);
  });

  test('10. Dual Portfolio Conservative Strategy', () => {
    const metrics = calculateDualPortfolioMetrics({
      totalInvestment: 50_000_000,
      carbonAllocation: 0.8,
      assetCoAllocation: 0.2,
      timeHorizon: 5,
      riskTolerance: 'conservative'
    });

    expect(metrics.blendedYield).toBeGreaterThan(0.12);
    expect(metrics.portfolioRisk).toBeLessThan(0.15);
    expect(metrics.capitalPreservation).toBeGreaterThan(0.95);
    expect(metrics.incomeStability).toBeGreaterThan(0.9);
  });

  test('11. Dual Portfolio Aggressive Growth', () => {
    const metrics = calculateDualPortfolioMetrics({
      totalInvestment: 200_000_000,
      carbonAllocation: 0.3,
      assetCoAllocation: 0.7,
      timeHorizon: 10,
      riskTolerance: 'aggressive'
    });

    expect(metrics.blendedYield).toBeGreaterThan(0.22);
    expect(metrics.growthPotential).toBeGreaterThan(0.30);
    expect(metrics.volatility).toBeGreaterThan(0.18);
    expect(metrics.maxDrawdown).toBeLessThan(0.25);
  });

  test('12. Dual Portfolio Rebalancing Logic', () => {
    const metrics = calculateDualPortfolioMetrics({
      totalInvestment: 80_000_000,
      carbonAllocation: 0.5,
      assetCoAllocation: 0.5,
      timeHorizon: 6,
      rebalancingStrategy: 'quarterly'
    });

    expect(metrics.rebalancingBenefit).toBeGreaterThan(0.01);
    expect(metrics.transactionCosts).toBeLessThan(0.005);
    expect(metrics.opportunityCapture).toBeGreaterThan(0.03);
    expect(metrics.riskControl).toBeGreaterThan(0.02);
  });

  // =============================================================================
  // YIELD MECHANISM ANALYSIS
  // =============================================================================

  test('13. Revenue Share vs NAV-Accruing Comparison', () => {
    const revenueShare = calculateCarbonCreditMetrics({
      investmentAmount: 30_000_000,
      carbonCredits: 300_000,
      yieldMechanism: 'revenue_share',
      timeHorizon: 8
    });

    const navAccruing = calculateCarbonCreditMetrics({
      investmentAmount: 30_000_000,
      carbonCredits: 300_000,
      yieldMechanism: 'nav_accruing',
      timeHorizon: 8
    });

    expect(navAccruing.annualYield).toBeGreaterThan(revenueShare.annualYield);
    expect(revenueShare.cashFlowStability).toBeGreaterThan(navAccruing.cashFlowStability);
    expect(navAccruing.cgtAdvantage).toBe(true);
    expect(revenueShare.incomeTaxTreatment).toBe(true);
  });

  test('14. Tax-Optimized Yield Selection', () => {
    const metrics = calculateDualPortfolioMetrics({
      totalInvestment: 60_000_000,
      carbonAllocation: 0.55,
      assetCoAllocation: 0.45,
      timeHorizon: 9,
      taxOptimization: true
    });

    expect(metrics.afterTaxReturn).toBeGreaterThan(metrics.beforeTaxReturn * 0.7);
    expect(metrics.taxAlpha).toBeGreaterThan(0.02);
    expect(metrics.structuralAdvantage).toBeGreaterThan(0.01);
  });

  // =============================================================================
  // RISK-ADJUSTED CALCULATIONS
  // =============================================================================

  test('15. Sharpe Ratio and Risk Metrics', () => {
    const metrics = calculateDualPortfolioMetrics({
      totalInvestment: 45_000_000,
      carbonAllocation: 0.4,
      assetCoAllocation: 0.6,
      timeHorizon: 6
    });

    expect(metrics.sharpeRatio).toBeGreaterThan(0.75);
    expect(metrics.informationRatio).toBeGreaterThan(0.6);
    expect(metrics.calmarRatio).toBeGreaterThan(0.8);
    expect(metrics.sortinoRatio).toBeGreaterThan(1.0);
  });

  test('16. Value at Risk (VaR) Calculations', () => {
    const metrics = calculateDualPortfolioMetrics({
      totalInvestment: 120_000_000,
      carbonAllocation: 0.65,
      assetCoAllocation: 0.35,
      timeHorizon: 4
    });

    expect(metrics.daily95VaR).toBeLessThan(0.025); // 2.5% daily VaR
    expect(metrics.monthly95VaR).toBeLessThan(0.08);
    expect(metrics.annualVaR).toBeLessThan(0.18);
    expect(metrics.expectedShortfall).toBeGreaterThan(metrics.daily95VaR);
  });

  // =============================================================================
  // FINANCIAL FORMATTING AND UTILITIES
  // =============================================================================

  test('17. Financial Metrics Formatting', () => {
    const rawMetrics = {
      amount: 45_678_912.34,
      percentage: 0.12456,
      ratio: 2.3456789
    };

    const formatted = formatFinancialMetrics(rawMetrics);

    expect(formatted.amount).toBe('A$45.68M');
    expect(formatted.percentage).toBe('12.46%');
    expect(formatted.ratio).toBe('2.35x');
  });

  test('18. WREI Financial Constants Validation', () => {
    expect(WREI_FINANCIAL_CONSTANTS.CARBON_CREDITS.BASE_PRICE).toBe(100);
    expect(WREI_FINANCIAL_CONSTANTS.CARBON_CREDITS.WREI_PREMIUM).toBe(1.5);
    expect(WREI_FINANCIAL_CONSTANTS.ASSET_CO.TARGET_EQUITY_YIELD).toBe(0.283);
    expect(WREI_FINANCIAL_CONSTANTS.MARKET.CARBON_PRICE_VOLATILITY).toBe(0.25);
    expect(WREI_FINANCIAL_CONSTANTS.MARKET.INFRASTRUCTURE_DISCOUNT_RATE).toBe(0.08);
  });

  test('19. Currency and Regional Adjustments', () => {
    const auMetrics = calculateAssetCoMetrics({
      investmentAmount: 10_000_000,
      assetType: 'infrastructure',
      region: 'au',
      currency: 'AUD',
      timeHorizon: 5
    });

    expect(auMetrics.currencyRisk).toBe(0);
    expect(auMetrics.regulatoryFramework).toBe('favorable');
    expect(auMetrics.withholdingtax).toBe(0);
  });

  test('20. Portfolio Stress Testing', () => {
    const stressedMetrics = calculateDualPortfolioMetrics({
      totalInvestment: 85_000_000,
      carbonAllocation: 0.5,
      assetCoAllocation: 0.5,
      timeHorizon: 7,
      stressScenario: 'market_crash_30'
    });

    expect(stressedMetrics.stressLoss).toBeLessThan(0.25);
    expect(stressedMetrics.recoveryPeriod).toBeLessThan(2);
    expect(stressedMetrics.resilience).toBeGreaterThan(0.75);
    expect(stressedMetrics.capitalProtection).toBeGreaterThan(0.8);
  });

});

export default {};