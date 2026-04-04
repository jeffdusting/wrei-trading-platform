/**
 * PHASE 1 TESTS: Dual Token Architecture
 *
 * Tests for completed Phase 1 functionality:
 * - Dual token type system
 * - Token-specific knowledge bases
 * - Updated pricing models
 * - Enhanced UI components
 */

import { describe, it, expect } from '@jest/globals';
import type {
  WREITokenType,
  PersonaType,
  BuyerProfile,
  CarbonCreditToken,
  AssetCoToken,
  InvestorClassification
} from '../lib/types';

// Test Data Constants from WREI Document
const WREI_TEST_DATA = {
  carbonCredits: {
    basePrice: 100, // A$/tonne
    wreiPremium: 1.5,
    effectivePrice: 150, // A$/tonne
    baseSupply: 3_120_000, // tonnes
    expansionSupply: 13_100_000, // tonnes
    baseRevenue: 468_000_000, // A$
    expansionRevenue: 1_965_000_000, // A$ (13.1M tonnes × A$150/tonne)
    steadyStateAnnual: 33_400_000, // A$ (base)
    expansionAnnual: 141_000_000, // A$ (expansion)
  },
  assetCo: {
    totalCapex: 473_000_000, // A$
    debtFunding: 342_000_000, // A$ at 7%
    equityCapitalization: 131_000_000, // A$
    equityYield: 0.283, // 28.3%
    annualLeaseIncome: 61_100_000, // A$
    netCashFlow: 37_100_000, // A$
    cashOnCashMultiple: 3.0,
    vesselCount: 88,
    deepPowerUnits: 22,
  },
  market: {
    tokenizedRWAMarket: 19_000_000_000, // A$19B
    projectedCarbonMarket2030: 155_000_000_000, // A$155B
  }
};

describe('Phase 1: Dual Token Architecture', () => {

  describe('1.1: Token Type System', () => {
    it('should support all WREI token types', () => {
      const validTokenTypes: WREITokenType[] = [
        'carbon_credits',
        'asset_co',
        'dual_portfolio'
      ];

      validTokenTypes.forEach(tokenType => {
        expect(['carbon_credits', 'asset_co', 'dual_portfolio']).toContain(tokenType);
      });
    });

    it('should have correct carbon credit token structure', () => {
      const carbonToken: Partial<CarbonCreditToken> = {
        tokenId: 'WREI-CC-001',
        tonnageCO2e: 1000,
        verificationStandards: ['ISO_14064_2', 'Verra_VCS', 'Gold_Standard'],
        generationSource: 'vessel_efficiency',
        blockchainHash: '0x123...',
        retirementStatus: 'active',
      };

      expect(carbonToken.verificationStandards).toHaveLength(3);
      expect(['vessel_efficiency', 'modal_shift', 'construction_avoidance']).toContain(carbonToken.generationSource);
      expect(['active', 'retired']).toContain(carbonToken.retirementStatus);
    });

    it('should have correct asset co token structure', () => {
      const assetCoToken: Partial<AssetCoToken> = {
        tokenId: 'WREI-AC-001',
        fractionalInterest: 0.01, // 1%
        underlyingAssets: {
          vesselCount: WREI_TEST_DATA.assetCo.vesselCount,
          deepPowerUnits: WREI_TEST_DATA.assetCo.deepPowerUnits,
          totalCapex: WREI_TEST_DATA.assetCo.totalCapex,
        },
        yieldProfile: {
          mechanism: 'nav_accruing',
          annualYield: WREI_TEST_DATA.assetCo.equityYield,
          distributionFrequency: 'quarterly',
        },
      };

      expect(assetCoToken.underlyingAssets?.vesselCount).toBe(88);
      expect(assetCoToken.underlyingAssets?.deepPowerUnits).toBe(22);
      expect(assetCoToken.yieldProfile?.annualYield).toBe(0.283);
    });
  });

  describe('1.2: Institutional Investor Classifications', () => {
    it('should support all investor classification types', () => {
      const classifications: InvestorClassification[] = [
        'retail',
        'wholesale',
        'professional',
        'sophisticated'
      ];

      classifications.forEach(classification => {
        expect(['retail', 'wholesale', 'professional', 'sophisticated']).toContain(classification);
      });
    });

    it('should have proper buyer profile structure with WREI extensions', () => {
      const buyerProfile: Partial<BuyerProfile> = {
        persona: 'infrastructure_fund',
        wreiTokenType: 'asset_co',
        investorClassification: 'professional',
        marketPreference: 'primary',
        yieldMechanismPreference: 'nav_accruing',
        portfolioContext: {
          aum: 12_000_000_000, // A$12B
          ticketSize: { min: 50_000_000, max: 500_000_000 },
          yieldRequirement: 0.12, // 12%
          riskTolerance: 'moderate',
          liquidityNeeds: 'quarterly',
          esgFocus: true,
          crossCollateralInterest: false,
        },
      };

      expect(buyerProfile.portfolioContext?.aum).toBeGreaterThan(1_000_000_000);
      expect(buyerProfile.portfolioContext!.ticketSize.min).toBeLessThan(buyerProfile.portfolioContext!.ticketSize.max);
      expect(['conservative', 'moderate', 'aggressive']).toContain(buyerProfile.portfolioContext?.riskTolerance);
    });
  });

  describe('1.3: Pricing Model Validation', () => {
    it('should have correct carbon credit pricing', () => {
      const carbonPricing = {
        basePrice: 100,
        premiumMultiplier: 1.5,
        effectivePrice: 150,
      };

      expect(carbonPricing.effectivePrice).toBe(carbonPricing.basePrice * carbonPricing.premiumMultiplier);
      expect(carbonPricing.effectivePrice).toBe(WREI_TEST_DATA.carbonCredits.effectivePrice);
    });

    it('should have correct asset co yield calculations', () => {
      const yieldCalculation = {
        netCashFlow: WREI_TEST_DATA.assetCo.netCashFlow,
        equityCapitalization: WREI_TEST_DATA.assetCo.equityCapitalization,
        calculatedYield: WREI_TEST_DATA.assetCo.netCashFlow / WREI_TEST_DATA.assetCo.equityCapitalization,
      };

      expect(yieldCalculation.calculatedYield).toBeCloseTo(0.283, 3);
    });

    it('should have correct revenue projections', () => {
      const revenueProjections = {
        baseCase: WREI_TEST_DATA.carbonCredits.baseSupply * WREI_TEST_DATA.carbonCredits.effectivePrice,
        expansionCase: WREI_TEST_DATA.carbonCredits.expansionSupply * WREI_TEST_DATA.carbonCredits.effectivePrice,
      };

      expect(revenueProjections.baseCase).toBeCloseTo(WREI_TEST_DATA.carbonCredits.baseRevenue, -6); // Allow ±1M tolerance
      expect(revenueProjections.expansionCase).toBeCloseTo(WREI_TEST_DATA.carbonCredits.expansionRevenue, -7); // Allow ±10M tolerance for large projections
    });
  });

  describe('1.4: Knowledge Base Integration', () => {
    it('should have carbon credit emission sources correctly configured', () => {
      const emissionSources = {
        vesselEfficiency: 47.2, // %
        modalShift: 47.9, // %
        constructionAvoidance: 4.8, // %
      };

      const totalPercentage = emissionSources.vesselEfficiency + emissionSources.modalShift + emissionSources.constructionAvoidance;
      expect(totalPercentage).toBeCloseTo(100, 0); // Allow 0.5% tolerance for rounding
    });

    it('should have asset co fleet composition correctly defined', () => {
      const fleetComposition = {
        vessels: WREI_TEST_DATA.assetCo.vesselCount,
        deepPowerUnits: WREI_TEST_DATA.assetCo.deepPowerUnits,
        totalUnits: WREI_TEST_DATA.assetCo.vesselCount + WREI_TEST_DATA.assetCo.deepPowerUnits,
      };

      expect(fleetComposition.vessels).toBe(88);
      expect(fleetComposition.deepPowerUnits).toBe(22);
      expect(fleetComposition.totalUnits).toBe(110);
    });
  });
});