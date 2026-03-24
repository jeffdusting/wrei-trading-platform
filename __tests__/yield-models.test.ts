/**
 * WREI Sprint A2: Yield Models Test Suite
 *
 * Core Logic Testing Phase - Yield Mechanism Models
 * Tests sophisticated yield calculation system for WREI tokenization platform
 *
 * CRITICAL: These tests validate yield mechanisms that power:
 * - Revenue share distributions
 * - NAV-accruing compound growth
 * - Hybrid yield structures
 * - Dynamic yield optimization
 * - Performance-based adjustments
 *
 * Total Tests: 15 specialized yield tests
 */

import {
  WREI_YIELD_MODELS,
  calculateAnnualYieldFlexible as calculateAnnualYield,
  calculateRevenueshareYield,
  calculateNavAccruingYield,
  calculateHybridYield,
  optimizeYieldMechanism,
  YieldProjection
} from '@/lib/yield-models';

describe('WREI Yield Models - Core Logic', () => {

  // =============================================================================
  // REVENUE SHARE YIELD CALCULATIONS
  // =============================================================================

  test('1. Carbon Credit Revenue Share Base Case', () => {
    const yieldData = calculateRevenueshareYield({
      tokenType: 'carbon_credits',
      investmentAmount: 10_000_000,
      timeHorizon: 5,
      marketConditions: 'normal'
    });

    expect(yieldData.annualRate).toBe(0.08); // 8% revenue share
    expect(yieldData.quarterlyPayouts).toBe(4);
    expect(yieldData.annualCashFlow).toBe(800_000);
    expect(yieldData.totalCashFlow).toBe(4_000_000);
    expect(yieldData.yieldStability).toBeGreaterThan(0.85);
  });

  test('2. Asset Co Revenue Share High Performance', () => {
    const yieldData = calculateRevenueshareYield({
      tokenType: 'asset_co',
      investmentAmount: 50_000_000,
      timeHorizon: 8,
      performanceBonus: true
    });

    expect(yieldData.baseYield).toBe(0.283); // 28.3% base
    expect(yieldData.performanceUpside).toBeGreaterThan(0.05);
    expect(yieldData.totalYield).toBeGreaterThan(0.30);
    expect(yieldData.bonusThreshold).toBe(0.25);
  });

  test('3. Dual Portfolio Revenue Share Blended', () => {
    const yieldData = calculateRevenueshareYield({
      tokenType: 'dual_portfolio',
      investmentAmount: 25_000_000,
      timeHorizon: 6,
      carbonWeight: 0.6,
      assetCoWeight: 0.4
    });

    expect(yieldData.blendedRate).toBe(0.185); // 18.5% blended
    expect(yieldData.carbonComponent).toBe(0.048); // 60% * 8%
    expect(yieldData.assetCoComponent).toBe(0.1132); // 40% * 28.3%
    expect(yieldData.diversificationBenefit).toBeGreaterThan(0.02);
  });

  // =============================================================================
  // NAV-ACCRUING YIELD CALCULATIONS
  // =============================================================================

  test('4. Carbon Credit NAV-Accruing Compound Growth', () => {
    const yieldData = calculateNavAccruingYield({
      tokenType: 'carbon_credits',
      investmentAmount: 15_000_000,
      timeHorizon: 10,
      compoundingFrequency: 'annual'
    });

    expect(yieldData.annualRate).toBe(0.12); // 12% NAV accruing
    expect(yieldData.compoundedValue).toBeGreaterThan(46_000_000);
    expect(yieldData.totalReturn).toBeGreaterThan(31_000_000);
    expect(yieldData.cgtQualification).toBe(true);
  });

  test('5. Asset Co NAV-Accruing with Performance', () => {
    const yieldData = calculateNavAccruingYield({
      tokenType: 'asset_co',
      investmentAmount: 75_000_000,
      timeHorizon: 12,
      performanceRatchet: true
    });

    expect(yieldData.baseRate).toBe(0.283);
    expect(yieldData.ratchetThresholds).toHaveLength(3);
    expect(yieldData.maxPotentialRate).toBeGreaterThan(0.35);
    expect(yieldData.compoundedValue).toBeGreaterThan(300_000_000);
  });

  test('6. Dual Portfolio NAV-Accruing Optimization', () => {
    const yieldData = calculateNavAccruingYield({
      tokenType: 'dual_portfolio',
      investmentAmount: 40_000_000,
      timeHorizon: 7,
      rebalancingStrategy: 'dynamic'
    });

    expect(yieldData.optimizedRate).toBe(0.20); // 20% dual NAV
    expect(yieldData.rebalancingBenefit).toBeGreaterThan(0.015);
    expect(yieldData.compoundedValue).toBeGreaterThan(140_000_000);
    expect(yieldData.riskAdjustment).toBeLessThan(0.01);
  });

  // =============================================================================
  // HYBRID YIELD MECHANISMS
  // =============================================================================

  test('7. Hybrid Revenue + Growth Model', () => {
    const yieldData = calculateHybridYield({
      tokenType: 'dual_portfolio',
      investmentAmount: 60_000_000,
      timeHorizon: 8,
      revenuePortion: 0.4,
      growthPortion: 0.6
    });

    expect(yieldData.revenuePlank).toBe(0.074); // 40% of 18.5%
    expect(yieldData.growthPlank).toBe(0.12); // 60% of 20%
    expect(yieldData.totalExpectedYield).toBe(0.194);
    expect(yieldData.cashFlowSchedule).toHaveLength(8);
  });

  test('8. Performance-Triggered Yield Escalation', () => {
    const yieldData = calculateHybridYield({
      tokenType: 'asset_co',
      investmentAmount: 100_000_000,
      timeHorizon: 10,
      escalationTriggers: ['performance', 'time', 'market']
    });

    expect(yieldData.triggerMechanisms).toHaveLength(3);
    expect(yieldData.escalationSchedule).toBeDefined();
    expect(yieldData.maxEscalatedRate).toBeGreaterThan(0.35);
    expect(yieldData.probabilityWeighted).toBeGreaterThan(0.30);
  });

  // =============================================================================
  // YIELD OPTIMIZATION
  // =============================================================================

  test('9. Investor Profile Yield Optimization', () => {
    const optimizedYield = optimizeYieldMechanism({
      investorProfile: {
        riskTolerance: 'moderate',
        liquidityNeeds: 'quarterly',
        taxSituation: 'high_marginal_rate',
        timeHorizon: 6
      },
      investmentAmount: 35_000_000,
      tokenType: 'dual_portfolio'
    });

    expect(optimizedYield.recommendedMechanism).toBe('hybrid');
    expect(optimizedYield.taxAdvantage).toBeGreaterThan(0.03);
    expect(optimizedYield.liquidityScore).toBeGreaterThan(8);
    expect(optimizedYield.riskScore).toBeLessThan(6);
  });

  test('10. ESG-Focused Yield Enhancement', () => {
    const esgYield = calculateAnnualYield({
      tokenType: 'carbon_credits',
      investmentAmount: 20_000_000,
      yieldMechanism: 'revenue_share',
      esgFactor: true,
      sustainabilityBonus: 0.015
    });

    expect(esgYield.baseRate).toBe(0.08);
    expect(esgYield.esgPremium).toBe(0.015);
    expect(esgYield.enhancedRate).toBe(0.095);
    expect(esgYield.impactMetrics).toBeDefined();
  });

  // =============================================================================
  // DYNAMIC YIELD ADJUSTMENTS
  // =============================================================================

  test('11. Market Condition Yield Adjustments', () => {
    const bullMarketYield = calculateAnnualYield({
      tokenType: 'asset_co',
      investmentAmount: 80_000_000,
      yieldMechanism: 'nav_accruing',
      marketConditions: 'bull'
    });

    const bearMarketYield = calculateAnnualYield({
      tokenType: 'asset_co',
      investmentAmount: 80_000_000,
      yieldMechanism: 'nav_accruing',
      marketConditions: 'bear'
    });

    expect(bullMarketYield.adjustedRate).toBeGreaterThan(bearMarketYield.adjustedRate);
    expect(bullMarketYield.marketBeta).toBeGreaterThan(1.0);
    expect(bearMarketYield.downSideProtection).toBeGreaterThan(0.1);
  });

  test('12. Volatility-Adjusted Yield Calculation', () => {
    const lowVolYield = calculateAnnualYield({
      tokenType: 'carbon_credits',
      investmentAmount: 30_000_000,
      yieldMechanism: 'revenue_share',
      volatilityRegime: 'low'
    });

    const highVolYield = calculateAnnualYield({
      tokenType: 'carbon_credits',
      investmentAmount: 30_000_000,
      yieldMechanism: 'revenue_share',
      volatilityRegime: 'high'
    });

    expect(highVolYield.riskPremium).toBeGreaterThan(lowVolYield.riskPremium);
    expect(highVolYield.adjustedRate).toBeGreaterThan(lowVolYield.adjustedRate);
    expect(lowVolYield.stabilityScore).toBeGreaterThan(8.5);
  });

  // =============================================================================
  // YIELD PROJECTIONS AND MODELING
  // =============================================================================

  test('13. Multi-Year Yield Projection Modeling', () => {
    const projection: YieldProjection = calculateNavAccruingYield({
      tokenType: 'dual_portfolio',
      investmentAmount: 50_000_000,
      timeHorizon: 15,
      scenarioAnalysis: true
    });

    expect(projection.yearlyBreakdown).toHaveLength(15);
    expect(projection.scenarios.bull.finalValue).toBeGreaterThan(400_000_000);
    expect(projection.scenarios.base.finalValue).toBeGreaterThan(300_000_000);
    expect(projection.scenarios.bear.finalValue).toBeGreaterThan(200_000_000);
  });

  test('14. Monte Carlo Yield Distribution', () => {
    const distribution = calculateAnnualYield({
      tokenType: 'asset_co',
      investmentAmount: 45_000_000,
      yieldMechanism: 'hybrid',
      monteCarloRuns: 1000
    });

    expect(distribution.mean).toBeGreaterThan(0.25);
    expect(distribution.median).toBeGreaterThan(0.24);
    expect(distribution.standardDeviation).toBeLessThan(0.08);
    expect(distribution.percentile95).toBeGreaterThan(0.35);
    expect(distribution.percentile5).toBeGreaterThan(0.15);
  });

  test('15. Yield Model Validation and Constants', () => {
    // Validate core WREI yield model constants
    expect(WREI_YIELD_MODELS.CARBON_CREDITS.revenue_share).toBe(0.08);
    expect(WREI_YIELD_MODELS.CARBON_CREDITS.nav_accruing).toBe(0.12);
    expect(WREI_YIELD_MODELS.ASSET_CO.revenue_share).toBe(0.283);
    expect(WREI_YIELD_MODELS.ASSET_CO.nav_accruing).toBe(0.283);
    expect(WREI_YIELD_MODELS.DUAL_PORTFOLIO.revenue_share).toBe(0.185);
    expect(WREI_YIELD_MODELS.DUAL_PORTFOLIO.nav_accruing).toBe(0.20);

    // Validate calculation consistency
    const carbonYield = calculateAnnualYield({
      tokenType: 'carbon_credits',
      investmentAmount: 10_000_000,
      yieldMechanism: 'revenue_share'
    });

    expect(carbonYield.calculatedRate).toBe(WREI_YIELD_MODELS.CARBON_CREDITS.revenue_share);
    expect(carbonYield.modelConsistency).toBe(true);
  });

});

export default {};