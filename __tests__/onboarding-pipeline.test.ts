/**
 * Onboarding Pipeline Utilities - Test Suite
 *
 * Tests for state transfer from institutional onboarding to negotiation interface.
 * Covers persona mapping, pre-configuration extraction, validation, and constraint calculations.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement B4: Onboarding-to-Negotiation Pipeline Tests
 */

import {
  mapInstitutionalPersonaToBuyerPersona,
  extractNegotiationPreConfig,
  validateOnboardingForNegotiation,
  generateNegotiationUrlParams,
  parseNegotiationUrlParams,
  calculateInstitutionalConstraints,
  generatePersonalisedWelcome,
  type NegotiationPreConfig,
  type BuyerPersona,
  type InstitutionalClassification
} from '@/lib/onboarding-pipeline';

import type {
  PersonaType
} from '@/lib/types';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';

describe('Onboarding Pipeline Utilities', () => {
  // Mock institutional onboarding state for testing
  const mockOnboardingState: InstitutionalOnboardingState = {
    institutionalIdentity: {
      entityName: 'Test Superannuation Fund',
      personaType: 'superannuation_fund',
      entityType: 'fund',
      jurisdiction: 'australia',
      regulatoryStatus: 'regulated'
    },
    investorClassification: {
      classification: 'wholesale',
      netWorth: 15000000,
      grossIncome: 2500000,
      professionalInvestor: true,
      sophisticatedInvestor: true
    },
    kycAmlVerification: {
      verificationStatus: 'complete',
      documentsVerified: ['incorporation', 'afsl', 'financial_statements'],
      sanctionsScreening: true,
      pepStatus: 'not_identified',
      riskRating: 'low'
    },
    afslCompliance: {
      hasAfslLicense: true,
      licenseNumber: 'AFS123456',
      complianceStatus: 'compliant',
      jurisdictionRestrictions: [],
      clientTypeRestrictions: []
    },
    investmentPreferences: {
      primaryTokenType: 'carbon_credits',
      secondaryTokenTypes: ['real_estate_tokens'],
      minInvestmentSize: 1000000,
      maxInvestmentSize: 50000000,
      yieldRequirement: 8.5,
      riskTolerance: 'moderate',
      timeHorizon: 'long_term',
      esgConstraints: ['climate_positive', 'no_fossil_fuels'],
      settlementTimeline: 't1',
      paymentMethod: 'wire',
      reportingRequirements: 'enhanced',
      volumeRequirements: 'forward'
    },
    complianceConfirmation: {
      wholesaleClientConfirmation: true,
      riskWarningAcknowledged: true,
      coolingOffPeriodWaived: true,
      sophisticatedInvestorDeclaration: true,
      regulatoryDisclosuresAccepted: true
    }
  };

  describe('mapInstitutionalPersonaToBuyerPersona', () => {
    test('maps ESG/Impact focused institutions correctly', () => {
      expect(mapInstitutionalPersonaToBuyerPersona('superannuation_fund'))
        .toBe('esg_fund_portfolio_manager');
      expect(mapInstitutionalPersonaToBuyerPersona('pension_fund'))
        .toBe('esg_fund_portfolio_manager');
      expect(mapInstitutionalPersonaToBuyerPersona('sovereign_wealth_fund'))
        .toBe('esg_fund_portfolio_manager');
      expect(mapInstitutionalPersonaToBuyerPersona('impact_fund'))
        .toBe('esg_fund_portfolio_manager');
    });

    test('maps corporate and compliance focused institutions correctly', () => {
      expect(mapInstitutionalPersonaToBuyerPersona('insurance_company'))
        .toBe('corporate_compliance_officer');
      expect(mapInstitutionalPersonaToBuyerPersona('corporate_treasury'))
        .toBe('corporate_compliance_officer');
      expect(mapInstitutionalPersonaToBuyerPersona('bank_treasury'))
        .toBe('corporate_compliance_officer');
    });

    test('maps trading focused institutions correctly', () => {
      expect(mapInstitutionalPersonaToBuyerPersona('hedge_fund'))
        .toBe('carbon_trading_desk_analyst');
      expect(mapInstitutionalPersonaToBuyerPersona('prop_trading_firm'))
        .toBe('carbon_trading_desk_analyst');
      expect(mapInstitutionalPersonaToBuyerPersona('commodity_trader'))
        .toBe('carbon_trading_desk_analyst');
    });

    test('maps mid-tier and sustainability focused institutions correctly', () => {
      expect(mapInstitutionalPersonaToBuyerPersona('asset_manager'))
        .toBe('sustainability_director_midcap');
      expect(mapInstitutionalPersonaToBuyerPersona('family_office'))
        .toBe('sustainability_director_midcap');
      expect(mapInstitutionalPersonaToBuyerPersona('endowment_fund'))
        .toBe('sustainability_director_midcap');
    });

    test('maps government institutions correctly', () => {
      expect(mapInstitutionalPersonaToBuyerPersona('government_agency'))
        .toBe('government_procurement_officer');
      expect(mapInstitutionalPersonaToBuyerPersona('development_bank'))
        .toBe('government_procurement_officer');
      expect(mapInstitutionalPersonaToBuyerPersona('multilateral_org'))
        .toBe('government_procurement_officer');
    });

    test('defaults to corporate compliance officer for unknown persona types', () => {
      expect(mapInstitutionalPersonaToBuyerPersona('unknown_type' as PersonaType))
        .toBe('corporate_compliance_officer');
    });
  });

  describe('extractNegotiationPreConfig', () => {
    test('extracts complete pre-configuration from onboarding state', () => {
      const preConfig = extractNegotiationPreConfig(mockOnboardingState);

      expect(preConfig.isPreConfigured).toBe(true);
      expect(preConfig.buyerPersona).toBe('esg_fund_portfolio_manager');
      expect(preConfig.institutionalClassification).toBe('wholesale');
      expect(preConfig.entityName).toBe('Test Superannuation Fund');
    });

    test('extracts investment focus correctly', () => {
      const preConfig = extractNegotiationPreConfig(mockOnboardingState);

      expect(preConfig.investmentFocus).toEqual({
        primaryTokenType: 'carbon_credits',
        targetYield: 8.5,
        riskTolerance: 'moderate',
        minInvestmentSize: 1000000,
        maxInvestmentSize: 50000000
      });
    });

    test('extracts compliance context correctly', () => {
      const preConfig = extractNegotiationPreConfig(mockOnboardingState);

      expect(preConfig.complianceContext.afslStatus).toBe('compliant');
      expect(preConfig.complianceContext.kycStatus).toBe('complete');
      expect(preConfig.complianceContext.jurisdictionRestrictions).toEqual([]);
      expect(preConfig.complianceContext.regulatoryConstraints).toContain('esg_compliance_required');
    });

    test('extracts trading preferences correctly', () => {
      const preConfig = extractNegotiationPreConfig(mockOnboardingState);

      expect(preConfig.tradingPreferences).toEqual({
        settlementTimeline: 't1',
        paymentMethod: 'wire',
        reportingRequirements: 'enhanced',
        volumeRequirements: 'forward'
      });
    });

    test('handles missing data with defaults', () => {
      const incompleteState: InstitutionalOnboardingState = {
        institutionalIdentity: {
          entityName: 'Incomplete Entity',
          personaType: 'hedge_fund',
          entityType: 'fund',
          jurisdiction: 'australia',
          regulatoryStatus: 'regulated'
        }
      } as InstitutionalOnboardingState;

      const preConfig = extractNegotiationPreConfig(incompleteState);

      expect(preConfig.isPreConfigured).toBe(true);
      expect(preConfig.buyerPersona).toBe('carbon_trading_desk_analyst');
      expect(preConfig.institutionalClassification).toBe('retail');
      expect(preConfig.investmentFocus.targetYield).toBe(8.5);
    });

    test('maps risk tolerance correctly', () => {
      const lowRiskState = { ...mockOnboardingState };
      lowRiskState.investmentPreferences!.riskTolerance = 'low';
      expect(extractNegotiationPreConfig(lowRiskState).investmentFocus.riskTolerance).toBe('conservative');

      const highRiskState = { ...mockOnboardingState };
      highRiskState.investmentPreferences!.riskTolerance = 'high';
      expect(extractNegotiationPreConfig(highRiskState).investmentFocus.riskTolerance).toBe('aggressive');
    });
  });

  describe('validateOnboardingForNegotiation', () => {
    test('validates complete onboarding state as valid', () => {
      const validation = validateOnboardingForNegotiation(mockOnboardingState);

      expect(validation.isValid).toBe(true);
      expect(validation.missingFields).toEqual([]);
    });

    test('identifies missing entity name', () => {
      const invalidState = { ...mockOnboardingState };
      invalidState.institutionalIdentity!.entityName = '';

      const validation = validateOnboardingForNegotiation(invalidState);

      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toContain('entityName');
    });

    test('identifies missing persona type', () => {
      const invalidState = { ...mockOnboardingState };
      delete invalidState.institutionalIdentity!.personaType;

      const validation = validateOnboardingForNegotiation(invalidState);

      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toContain('personaType');
    });

    test('identifies missing investor classification', () => {
      const invalidState = { ...mockOnboardingState };
      delete invalidState.investorClassification!.classification;

      const validation = validateOnboardingForNegotiation(invalidState);

      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toContain('investorClassification');
    });

    test('identifies missing compliance status', () => {
      const invalidState = { ...mockOnboardingState };
      delete invalidState.afslCompliance!.complianceStatus;

      const validation = validateOnboardingForNegotiation(invalidState);

      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toContain('afslComplianceStatus');
    });

    test('identifies missing KYC verification status', () => {
      const invalidState = { ...mockOnboardingState };
      delete invalidState.kycAmlVerification!.verificationStatus;

      const validation = validateOnboardingForNegotiation(invalidState);

      expect(validation.isValid).toBe(false);
      expect(validation.missingFields).toContain('kycVerificationStatus');
    });
  });

  describe('generateNegotiationUrlParams', () => {
    test('generates correct URL parameters for pre-configuration', () => {
      const preConfig: NegotiationPreConfig = {
        isPreConfigured: true,
        buyerPersona: 'esg_fund_portfolio_manager',
        institutionalClassification: 'wholesale',
        entityName: 'Test Fund',
        investmentFocus: {
          primaryTokenType: 'carbon_credits',
          targetYield: 8.5,
          riskTolerance: 'moderate',
          minInvestmentSize: 1000000,
          maxInvestmentSize: 50000000
        },
        complianceContext: {
          afslStatus: 'compliant',
          kycStatus: 'complete',
          jurisdictionRestrictions: [],
          regulatoryConstraints: []
        },
        tradingPreferences: {
          settlementTimeline: 't1',
          paymentMethod: 'wire',
          reportingRequirements: 'standard',
          volumeRequirements: 'spot'
        }
      };

      const urlParams = generateNegotiationUrlParams(preConfig);
      const params = new URLSearchParams(urlParams);

      expect(params.get('onboarded')).toBe('true');
      expect(params.get('persona')).toBe('esg_fund_portfolio_manager');
      expect(params.get('classification')).toBe('wholesale');
      expect(params.get('entity')).toBe('Test Fund');
      expect(params.get('preconfig')).toBe('true');
    });
  });

  describe('parseNegotiationUrlParams', () => {
    test('parses pre-configured URL parameters correctly', () => {
      const searchParams = new URLSearchParams({
        onboarded: 'true',
        persona: 'esg_fund_portfolio_manager',
        classification: 'wholesale',
        entity: 'Test Fund',
        preconfig: 'true'
      });

      const parsed = parseNegotiationUrlParams(searchParams);

      expect(parsed.isPreConfigured).toBe(true);
      expect(parsed.persona).toBe('esg_fund_portfolio_manager');
      expect(parsed.classification).toBe('wholesale');
      expect(parsed.entityName).toBe('Test Fund');
    });

    test('identifies non-pre-configured parameters', () => {
      const searchParams = new URLSearchParams({
        onboarded: 'false',
        persona: 'esg_fund_portfolio_manager'
      });

      const parsed = parseNegotiationUrlParams(searchParams);

      expect(parsed.isPreConfigured).toBe(false);
    });

    test('handles missing pre-config flag', () => {
      const searchParams = new URLSearchParams({
        onboarded: 'true',
        persona: 'esg_fund_portfolio_manager'
      });

      const parsed = parseNegotiationUrlParams(searchParams);

      expect(parsed.isPreConfigured).toBe(false);
    });

    test('handles empty search parameters', () => {
      const searchParams = new URLSearchParams();

      const parsed = parseNegotiationUrlParams(searchParams);

      expect(parsed.isPreConfigured).toBe(false);
    });
  });

  describe('calculateInstitutionalConstraints', () => {
    const baseConstraints = {
      priceFloor: 120,
      maxConcessionPerRound: 0.05,
      maxTotalConcession: 0.20,
      minRoundsBeforeConcession: 3
    };

    test('applies sophisticated investor adjustments', () => {
      const adjusted = calculateInstitutionalConstraints('sophisticated', baseConstraints);

      expect(adjusted.priceFloor).toBe(118); // 2% more flexible
      expect(adjusted.maxConcessionPerRound).toBeCloseTo(0.0625, 4); // 25% larger concessions
      expect(adjusted.maxTotalConcession).toBeCloseTo(0.25, 2); // 25% larger total
      expect(adjusted.minRoundsBeforeConcession).toBe(2); // 1 round earlier
    });

    test('applies wholesale investor adjustments', () => {
      const adjusted = calculateInstitutionalConstraints('wholesale', baseConstraints);

      expect(adjusted.priceFloor).toBe(114); // 5% more flexible
      expect(adjusted.maxConcessionPerRound).toBeCloseTo(0.075, 4); // 50% larger concessions
      expect(adjusted.maxTotalConcession).toBeCloseTo(0.30, 2); // 50% larger total
      expect(adjusted.minRoundsBeforeConcession).toBe(1); // 2 rounds earlier
    });

    test('keeps standard constraints for retail investors', () => {
      const adjusted = calculateInstitutionalConstraints('retail', baseConstraints);

      expect(adjusted.priceFloor).toBe(120); // No change
      expect(adjusted.maxConcessionPerRound).toBeCloseTo(0.05, 4); // No change
      expect(adjusted.maxTotalConcession).toBeCloseTo(0.20, 2); // No change
      expect(adjusted.minRoundsBeforeConcession).toBe(3); // No change
    });

    test('enforces maximum concession limits', () => {
      const baseConstraintsHigh = {
        priceFloor: 120,
        maxConcessionPerRound: 0.07,
        maxTotalConcession: 0.25,
        minRoundsBeforeConcession: 3
      };

      const adjusted = calculateInstitutionalConstraints('wholesale', baseConstraintsHigh);

      expect(adjusted.maxConcessionPerRound).toBeCloseTo(0.08, 4); // Capped at 8%
      expect(adjusted.maxTotalConcession).toBeCloseTo(0.30, 2); // Capped at 30%
    });

    test('enforces minimum rounds before concession', () => {
      const baseConstraintsLow = {
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minRoundsBeforeConcession: 2
      };

      const adjusted = calculateInstitutionalConstraints('wholesale', baseConstraintsLow);

      expect(adjusted.minRoundsBeforeConcession).toBe(1); // Minimum of 1 round
    });
  });

  describe('generatePersonalisedWelcome', () => {
    test('generates correct welcome message for each persona', () => {
      const mockPreConfig = (persona: BuyerPersona): NegotiationPreConfig => ({
        isPreConfigured: true,
        buyerPersona: persona,
        institutionalClassification: 'wholesale',
        entityName: 'Test Entity',
        investmentFocus: {
          primaryTokenType: 'carbon_credits',
          targetYield: 8.5,
          riskTolerance: 'moderate',
          minInvestmentSize: 1000000,
          maxInvestmentSize: 50000000
        },
        complianceContext: {
          afslStatus: 'compliant',
          kycStatus: 'complete',
          jurisdictionRestrictions: [],
          regulatoryConstraints: []
        },
        tradingPreferences: {
          settlementTimeline: 't1',
          paymentMethod: 'wire',
          reportingRequirements: 'standard',
          volumeRequirements: 'spot'
        }
      });

      expect(generatePersonalisedWelcome(mockPreConfig('corporate_compliance_officer')))
        .toContain('compliance requirements');
      expect(generatePersonalisedWelcome(mockPreConfig('esg_fund_portfolio_manager')))
        .toContain('sustainability metrics');
      expect(generatePersonalisedWelcome(mockPreConfig('carbon_trading_desk_analyst')))
        .toContain('volume and pricing preferences');
      expect(generatePersonalisedWelcome(mockPreConfig('sustainability_director_midcap')))
        .toContain('sustainability goals and budget constraints');
      expect(generatePersonalisedWelcome(mockPreConfig('government_procurement_officer')))
        .toContain('regulatory and process requirements');
    });

    test('provides default welcome message for unknown personas', () => {
      const mockPreConfig: NegotiationPreConfig = {
        isPreConfigured: true,
        buyerPersona: 'unknown_persona' as BuyerPersona,
        institutionalClassification: 'wholesale',
        entityName: 'Test Entity',
        investmentFocus: {
          primaryTokenType: 'carbon_credits',
          targetYield: 8.5,
          riskTolerance: 'moderate',
          minInvestmentSize: 1000000,
          maxInvestmentSize: 50000000
        },
        complianceContext: {
          afslStatus: 'compliant',
          kycStatus: 'complete',
          jurisdictionRestrictions: [],
          regulatoryConstraints: []
        },
        tradingPreferences: {
          settlementTimeline: 't1',
          paymentMethod: 'wire',
          reportingRequirements: 'standard',
          volumeRequirements: 'spot'
        }
      };

      const welcome = generatePersonalisedWelcome(mockPreConfig);
      expect(welcome).toContain('institutional trading platform');
      expect(welcome).toContain('profile has been pre-configured');
    });
  });
});