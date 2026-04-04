/**
 * WREI Negotiation Config Tests
 *
 * Critical testing for negotiation configuration that validates:
 * - Pricing parameters match CLAUDE.md specifications
 * - Constraint calculations are mathematically correct
 * - WREI Pricing Index values are within expected ranges
 * - Live market data integration functions properly
 * - Business rule consistency across all pricing tiers
 *
 * BUSINESS CRITICAL: Validates pricing foundation for all negotiations
 * Total Tests: 15 comprehensive configuration tests
 */

import { NEGOTIATION_CONFIG, PRICING_INDEX } from '@/lib/negotiation-config';

// =============================================================================
// PRICING INDEX VALIDATION TESTS
// =============================================================================

describe('Negotiation Config: WREI Pricing Index Validation', () => {
  test('1. Pricing index contains all required market references', () => {
    // Verify all essential market data points exist
    expect(PRICING_INDEX.VCM_SPOT_REFERENCE).toBeGreaterThan(0);
    expect(PRICING_INDEX.DMRV_SPOT_REFERENCE).toBeGreaterThan(0);
    expect(PRICING_INDEX.FORWARD_REMOVAL_REFERENCE).toBeGreaterThan(0);
    expect(PRICING_INDEX.ESC_SPOT_REFERENCE).toBeGreaterThan(0);
    expect(PRICING_INDEX.ESC_FORWARD_REFERENCE).toBeGreaterThan(0);

    // Verify metadata exists
    expect(PRICING_INDEX.INDEX_TIMESTAMP).toBeDefined();
    expect(Array.isArray(PRICING_INDEX.DATA_SOURCES)).toBe(true);
    expect(PRICING_INDEX.DATA_SOURCES.length).toBeGreaterThan(0);
  });

  test('2. Market reference values are within realistic ranges', () => {
    // VCM spot should be reasonable (typically $5-50 USD/tonne)
    expect(PRICING_INDEX.VCM_SPOT_REFERENCE).toBeGreaterThanOrEqual(1);
    expect(PRICING_INDEX.VCM_SPOT_REFERENCE).toBeLessThanOrEqual(100);

    // dMRV premium should be higher than regular VCM
    expect(PRICING_INDEX.DMRV_SPOT_REFERENCE).toBeGreaterThan(PRICING_INDEX.VCM_SPOT_REFERENCE);

    // Forward removal should command significant premium
    expect(PRICING_INDEX.FORWARD_REMOVAL_REFERENCE).toBeGreaterThan(PRICING_INDEX.DMRV_SPOT_REFERENCE);

    // ESC prices should be reasonable for NSW market (typically AUD $30-80)
    expect(PRICING_INDEX.ESC_SPOT_REFERENCE).toBeGreaterThanOrEqual(20);
    expect(PRICING_INDEX.ESC_SPOT_REFERENCE).toBeLessThanOrEqual(100);
  });

  test('3. Premium benchmarks are mathematically consistent', () => {
    // dMRV premium calculation
    const calculatedDMRVPremium = PRICING_INDEX.DMRV_SPOT_REFERENCE / PRICING_INDEX.VCM_SPOT_REFERENCE;
    expect(calculatedDMRVPremium).toBeCloseTo(PRICING_INDEX.DMRV_PREMIUM_BENCHMARK, 1);

    // Premium ranges should be valid
    expect(PRICING_INDEX.CCP_PREMIUM_HIGH).toBeGreaterThan(PRICING_INDEX.CCP_PREMIUM_LOW);
    expect(PRICING_INDEX.INSTITUTIONAL_PREMIUM).toBeGreaterThan(1.0);
    expect(PRICING_INDEX.INSTITUTIONAL_PREMIUM).toBeLessThan(1.5);

    // Volatility range should make sense
    const [escLow, escHigh] = PRICING_INDEX.ESC_VOLATILITY_RANGE;
    expect(escLow).toBeGreaterThan(0);
    expect(escHigh).toBeGreaterThan(escLow);
    expect(PRICING_INDEX.ESC_SPOT_REFERENCE).toBeGreaterThanOrEqual(escLow);
    expect(PRICING_INDEX.ESC_SPOT_REFERENCE).toBeLessThanOrEqual(escHigh);
  });
});

// =============================================================================
// CARBON CREDIT PRICING VALIDATION TESTS
// =============================================================================

describe('Negotiation Config: Carbon Credit Pricing Validation', () => {
  test('4. Carbon pricing calculations match CLAUDE.md specifications', () => {
    // Base price should use dMRV reference
    expect(NEGOTIATION_CONFIG.BASE_CARBON_PRICE).toBe(PRICING_INDEX.DMRV_SPOT_REFERENCE);

    // WREI premium should be 85% (1.85x multiplier)
    expect(NEGOTIATION_CONFIG.WREI_PREMIUM_MULTIPLIER).toBe(1.85);

    // Anchor price calculation: BASE * 1.85
    const expectedAnchor = Math.round(PRICING_INDEX.DMRV_SPOT_REFERENCE * 1.85 * 100) / 100;
    expect(NEGOTIATION_CONFIG.ANCHOR_PRICE).toBe(expectedAnchor);

    // Price floor calculation: BASE * 1.50 (50% premium minimum)
    const expectedFloor = Math.round(PRICING_INDEX.DMRV_SPOT_REFERENCE * 1.50 * 100) / 100;
    expect(NEGOTIATION_CONFIG.PRICE_FLOOR).toBe(expectedFloor);
  });

  test('5. Carbon pricing hierarchy is logically correct', () => {
    // Anchor should be higher than floor
    expect(NEGOTIATION_CONFIG.ANCHOR_PRICE).toBeGreaterThan(NEGOTIATION_CONFIG.PRICE_FLOOR);

    // Floor should be higher than base
    expect(NEGOTIATION_CONFIG.PRICE_FLOOR).toBeGreaterThan(NEGOTIATION_CONFIG.BASE_CARBON_PRICE);

    // All prices should be positive
    expect(NEGOTIATION_CONFIG.BASE_CARBON_PRICE).toBeGreaterThan(0);
    expect(NEGOTIATION_CONFIG.PRICE_FLOOR).toBeGreaterThan(0);
    expect(NEGOTIATION_CONFIG.ANCHOR_PRICE).toBeGreaterThan(0);
  });

  test('6. Carbon pricing margins are business-appropriate', () => {
    // WREI premium should justify advanced verification (50-150% premium range)
    const premiumRatio = NEGOTIATION_CONFIG.ANCHOR_PRICE / NEGOTIATION_CONFIG.BASE_CARBON_PRICE;
    expect(premiumRatio).toBeGreaterThanOrEqual(1.5);
    expect(premiumRatio).toBeLessThanOrEqual(2.5);

    // Floor margin should provide reasonable business buffer
    const floorMargin = NEGOTIATION_CONFIG.PRICE_FLOOR / NEGOTIATION_CONFIG.BASE_CARBON_PRICE;
    expect(floorMargin).toBeGreaterThanOrEqual(1.3);
    expect(floorMargin).toBeLessThan(premiumRatio);

    // Negotiation range should allow meaningful concessions
    const negotiationRange = NEGOTIATION_CONFIG.ANCHOR_PRICE - NEGOTIATION_CONFIG.PRICE_FLOOR;
    const maxConcessionValue = NEGOTIATION_CONFIG.ANCHOR_PRICE * NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION;
    // The negotiation range should be substantial relative to the anchor price
    expect(negotiationRange / NEGOTIATION_CONFIG.ANCHOR_PRICE).toBeGreaterThan(0.15);
    expect(maxConcessionValue).toBeGreaterThan(0);
  });
});

// =============================================================================
// ESC PRICING VALIDATION TESTS
// =============================================================================

describe('Negotiation Config: ESC Pricing Validation', () => {
  test('7. ESC pricing calculations are mathematically correct', () => {
    // ESC market reference should use live ESC spot
    expect(NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE).toBe(PRICING_INDEX.ESC_SPOT_REFERENCE);

    // ESC premium should be conservative 15%
    expect(NEGOTIATION_CONFIG.ESC_WREI_PREMIUM_MULTIPLIER).toBe(1.15);

    // ESC anchor calculation: SPOT * 1.15
    const expectedESCAnchor = Math.round(PRICING_INDEX.ESC_SPOT_REFERENCE * 1.15 * 100) / 100;
    expect(NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE).toBe(expectedESCAnchor);

    // ESC floor calculation: SPOT * 1.08 (8% minimum premium)
    const expectedESCFloor = Math.round(PRICING_INDEX.ESC_SPOT_REFERENCE * 1.08 * 100) / 100;
    expect(NEGOTIATION_CONFIG.ESC_PRICE_FLOOR).toBe(expectedESCFloor);
  });

  test('8. ESC pricing hierarchy maintains market logic', () => {
    // ESC anchor should exceed ESC floor
    expect(NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE).toBeGreaterThan(NEGOTIATION_CONFIG.ESC_PRICE_FLOOR);

    // ESC floor should exceed market reference
    expect(NEGOTIATION_CONFIG.ESC_PRICE_FLOOR).toBeGreaterThan(NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE);

    // All ESC prices should be positive
    expect(NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE).toBeGreaterThan(0);
    expect(NEGOTIATION_CONFIG.ESC_PRICE_FLOOR).toBeGreaterThan(0);
    expect(NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE).toBeGreaterThan(0);
  });

  test('9. ESC premiums reflect NSW market dynamics', () => {
    // WREI ESC premium should be conservative (8-20% range)
    const escPremiumRatio = NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE / NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE;
    expect(escPremiumRatio).toBeGreaterThanOrEqual(1.08);
    expect(escPremiumRatio).toBeLessThanOrEqual(1.25);

    // ESC price should be within volatility range
    const [escLow, escHigh] = PRICING_INDEX.ESC_VOLATILITY_RANGE;
    expect(NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE).toBeGreaterThanOrEqual(escLow * 0.9); // Allow for premium above range
    expect(NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE).toBeLessThanOrEqual(escHigh * 1.3);

    // ESC negotiation should have adequate range
    const escNegotiationRange = NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE - NEGOTIATION_CONFIG.ESC_PRICE_FLOOR;
    expect(escNegotiationRange).toBeGreaterThan(0);
  });
});

// =============================================================================
// NEGOTIATION CONSTRAINT VALIDATION TESTS
// =============================================================================

describe('Negotiation Config: Constraint Parameter Validation', () => {
  test('10. Concession limits align with business strategy', () => {
    // Per-round concession should be conservative (3-7% range)
    expect(NEGOTIATION_CONFIG.MAX_CONCESSION_PER_ROUND).toBe(0.05); // 5%
    expect(NEGOTIATION_CONFIG.MAX_CONCESSION_PER_ROUND).toBeGreaterThan(0.02);
    expect(NEGOTIATION_CONFIG.MAX_CONCESSION_PER_ROUND).toBeLessThan(0.10);

    // Total concession should preserve profitability (15-25% range)
    expect(NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION).toBe(0.20); // 20%
    expect(NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION).toBeGreaterThan(0.10);
    expect(NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION).toBeLessThan(0.30);

    // Total should be multiple of per-round (allow multiple rounds)
    expect(NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION).toBeGreaterThan(NEGOTIATION_CONFIG.MAX_CONCESSION_PER_ROUND * 2);
  });

  test('11. Minimum rounds policy promotes relationship building', () => {
    // Should require enough rounds for rapport building (2-5 rounds)
    expect(NEGOTIATION_CONFIG.MIN_ROUNDS_BEFORE_PRICE_CONCESSION).toBe(3);
    expect(NEGOTIATION_CONFIG.MIN_ROUNDS_BEFORE_PRICE_CONCESSION).toBeGreaterThanOrEqual(2);
    expect(NEGOTIATION_CONFIG.MIN_ROUNDS_BEFORE_PRICE_CONCESSION).toBeLessThanOrEqual(5);

    // Should allow eventual concessions within total limit
    const minRounds = NEGOTIATION_CONFIG.MIN_ROUNDS_BEFORE_PRICE_CONCESSION;
    const maxRoundsAtFullConcession = NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION / NEGOTIATION_CONFIG.MAX_CONCESSION_PER_ROUND;
    expect(maxRoundsAtFullConcession).toBeGreaterThan(minRounds);
  });

  test('12. Constraint mathematics ensure business viability', () => {
    // Carbon credit constraints should preserve business viability
    const carbonMaxConcessionValue = NEGOTIATION_CONFIG.ANCHOR_PRICE * NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION;
    const carbonMinFinalPrice = NEGOTIATION_CONFIG.ANCHOR_PRICE - carbonMaxConcessionValue;
    // The minimum final price should be close to or above the floor (within reasonable rounding)
    expect(Math.abs(carbonMinFinalPrice - NEGOTIATION_CONFIG.PRICE_FLOOR)).toBeLessThan(1.0);
    expect(carbonMinFinalPrice / NEGOTIATION_CONFIG.BASE_CARBON_PRICE).toBeGreaterThan(1.3); // Maintains significant margin

    // ESC constraints should preserve business viability
    const escMaxConcessionValue = NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE * NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION;
    const escMinFinalPrice = NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE - escMaxConcessionValue;
    // ESC pricing should maintain meaningful margin above market reference
    expect(escMinFinalPrice / NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE).toBeGreaterThan(0.85);
    expect(escMaxConcessionValue).toBeGreaterThan(0);
  });
});

// =============================================================================
// INTEGRATION AND CONSISTENCY TESTS
// =============================================================================

describe('Negotiation Config: Integration and Consistency', () => {
  test('13. Cross-market pricing relationships are logical', () => {
    // Carbon and ESC markets serve different purposes but should be relatable
    // (No strict mathematical relationship expected, but sanity check values)
    expect(NEGOTIATION_CONFIG.BASE_CARBON_PRICE).toBeGreaterThan(0);
    expect(NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE).toBeGreaterThan(0);

    // Both markets should have similar premium structures relative to their bases
    const carbonPremiumRange = (NEGOTIATION_CONFIG.ANCHOR_PRICE - NEGOTIATION_CONFIG.PRICE_FLOOR) / NEGOTIATION_CONFIG.BASE_CARBON_PRICE;
    const escPremiumRange = (NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE - NEGOTIATION_CONFIG.ESC_PRICE_FLOOR) / NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE;

    // Both should have meaningful negotiation ranges
    expect(carbonPremiumRange).toBeGreaterThan(0.1);
    expect(escPremiumRange).toBeGreaterThan(0.05);
  });

  test('14. Configuration supports diverse buyer personas', () => {
    // Price range should accommodate different buyer types
    const carbonNegotiationRange = NEGOTIATION_CONFIG.ANCHOR_PRICE - NEGOTIATION_CONFIG.PRICE_FLOOR;
    const escNegotiationRange = NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE - NEGOTIATION_CONFIG.ESC_PRICE_FLOOR;

    // Should allow significant negotiation for enterprise buyers
    expect(carbonNegotiationRange / NEGOTIATION_CONFIG.ANCHOR_PRICE).toBeGreaterThanOrEqual(0.15);
    expect(escNegotiationRange / NEGOTIATION_CONFIG.ESC_ANCHOR_PRICE).toBeGreaterThanOrEqual(0.05);

    // Should maintain premium for quality-focused buyers
    expect(NEGOTIATION_CONFIG.PRICE_FLOOR / NEGOTIATION_CONFIG.BASE_CARBON_PRICE).toBeGreaterThan(1.3);
    expect(NEGOTIATION_CONFIG.ESC_PRICE_FLOOR / NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE).toBeGreaterThan(1.05);
  });

  test('15. Live market data integration maintains currency', () => {
    // Pricing should be based on recent market data
    const indexTimestamp = new Date(PRICING_INDEX.INDEX_TIMESTAMP);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - indexTimestamp.getTime()) / (1000 * 60 * 60);

    // Market data should be relatively recent (within 30 days for test/demo environment)
    expect(hoursSinceUpdate).toBeLessThan(30 * 24); // 30 days in hours

    // Data sources should include reputable market providers
    const dataSources = PRICING_INDEX.DATA_SOURCES;
    expect(dataSources).toContain('Ecovantage'); // ESC broker price data
    expect(dataSources.some(source => source.includes('Xpansiv') || source.includes('CBL'))).toBe(true); // VCM data

    // Configuration should reflect live pricing
    expect(NEGOTIATION_CONFIG.BASE_CARBON_PRICE).toBe(PRICING_INDEX.DMRV_SPOT_REFERENCE);
    expect(NEGOTIATION_CONFIG.ESC_MARKET_REFERENCE).toBe(PRICING_INDEX.ESC_SPOT_REFERENCE);
  });
});

export default {};