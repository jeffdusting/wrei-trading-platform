/**
 * WREI Trading Platform - Simplified Demo System Tests
 *
 * Unit tests for simplified demo system configuration
 * Testing basic negotiation config and demo data availability
 *
 * Date: March 28, 2026 (Updated for Phase 5)
 */

import { PRICING_INDEX, NSW_ESC_CONFIG } from '../lib/negotiation-config';

describe('Simplified Demo System Configuration', () => {
  describe('Pricing Index', () => {
    test('should have valid VCM spot reference', () => {
      expect(PRICING_INDEX.VCM_SPOT_REFERENCE).toBe(8.45);
    });

    test('should have valid forward removal reference', () => {
      expect(PRICING_INDEX.FORWARD_REMOVAL_REFERENCE).toBe(185);
    });

    test('should have valid DMRV premium benchmark', () => {
      expect(PRICING_INDEX.DMRV_PREMIUM_BENCHMARK).toBe(1.78);
    });

    test('should have valid ESC spot reference', () => {
      expect(PRICING_INDEX.ESC_SPOT_REFERENCE).toBe(23.00);
    });
  });

  describe('NSW ESC Configuration', () => {
    test('should have valid market conditions', () => {
      expect(NSW_ESC_CONFIG.MARKET_CONDITIONS.SPOT_PRICE).toBe(23.00);
      expect(NSW_ESC_CONFIG.MARKET_CONDITIONS.DATA_SOURCES).toContain('Ecovantage');
    });

    test('should have compliance framework configuration', () => {
      expect(NSW_ESC_CONFIG.COMPLIANCE_FRAMEWORK.AUTHORITY).toBe('Clean Energy Regulator');
      expect(NSW_ESC_CONFIG.COMPLIANCE_FRAMEWORK.REGISTRY_SYSTEM).toBe('NSW ESC Registry');
    });
  });
});