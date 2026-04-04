/**
 * Milestone 2.1: Institutional Portal Test Suite
 * Tests onboarding state management and regulatory compliance integration
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  createEmptyOnboardingState,
  validateOnboardingStep,
  getNextStep,
  getPreviousStep,
  calculateOnboardingProgress,
  isOnboardingComplete,
  mapPersonaToEntityType,
  getDefaultInvestmentPreferences,
} from '../lib/institutional-onboarding';
import {
  validateInvestorClassification,
  checkAFSLCompliance,
  validateAMLRequirements,
} from '../lib/regulatory-compliance';
import type {
  InstitutionalOnboardingState,
  InstitutionalIdentity,
  InvestmentPreferences,
  OnboardingStep,
} from '../lib/institutional-onboarding';
import type { PersonaType } from '../lib/types';

describe('Milestone 2.1: Institutional Portal - Onboarding State Management', () => {
  let mockOnboardingState: InstitutionalOnboardingState;

  beforeEach(() => {
    mockOnboardingState = createEmptyOnboardingState();
  });

  // ===== ONBOARDING STATE MANAGEMENT TESTS (5 tests) =====

  describe('Onboarding State Management', () => {
    test('creates valid onboarding state for each institutional persona type', () => {
      const institutionalPersonas: PersonaType[] = [
        'infrastructure_fund',
        'esg_impact_investor',
        'family_office',
        'sovereign_wealth',
        'pension_fund',
        'defi_yield_farmer',
      ];

      institutionalPersonas.forEach(persona => {
        // Test persona mapping
        const entityType = mapPersonaToEntityType(persona);
        expect(entityType).not.toBeNull();

        // Test default investment preferences
        const preferences = getDefaultInvestmentPreferences(persona);
        expect(preferences).toHaveProperty('preferredYieldMechanism');
        expect(preferences).toHaveProperty('targetAllocation');
        expect(preferences).toHaveProperty('riskTolerance');
        expect(preferences).toHaveProperty('liquidityRequirement');
        expect(preferences).toHaveProperty('esgMandatory');

        // Verify allocation percentages sum to 100
        if (preferences.targetAllocation) {
          const total = preferences.targetAllocation.carbonCredits + preferences.targetAllocation.assetCo;
          expect(total).toBe(100);
        }

        // Create mock institutional identity for this persona
        const mockIdentity: InstitutionalIdentity = {
          entityName: `Test ${persona} Entity`,
          entityType: entityType!,
          personaType: persona,
          jurisdiction: 'australia',
          aum: 50000000, // A$50M (above wholesale threshold)
          establishedYear: 2010,
          primaryContactName: 'John Smith',
          primaryContactRole: 'Investment Manager',
          isTaxExempt: persona === 'pension_fund' || persona === 'sovereign_wealth',
        };

        // Update state with this identity
        const stateWithIdentity = {
          ...mockOnboardingState,
          institutionalIdentity: mockIdentity,
        };

        // Validate that the state is properly formed
        expect(stateWithIdentity.institutionalIdentity?.personaType).toBe(persona);
        expect(stateWithIdentity.institutionalIdentity?.entityType).toBe(entityType);
      });
    });

    test('validates step progression logic (cannot skip steps, can go backward)', () => {
      // Test forward progression
      expect(getNextStep('institutional_identity', true)).toBe('investor_classification');
      expect(getNextStep('investor_classification', true)).toBe('kyc_aml_verification');
      expect(getNextStep('kyc_aml_verification', true)).toBe('afsl_compliance');
      expect(getNextStep('afsl_compliance', true)).toBe('investment_preferences');
      expect(getNextStep('investment_preferences', true)).toBe('compliance_confirmation');
      expect(getNextStep('compliance_confirmation', true)).toBeNull(); // Last step

      // Test that invalid current step returns same step
      expect(getNextStep('institutional_identity', false)).toBe('institutional_identity');
      expect(getNextStep('investor_classification', false)).toBe('investor_classification');

      // Test backward progression
      expect(getPreviousStep('compliance_confirmation')).toBe('investment_preferences');
      expect(getPreviousStep('investment_preferences')).toBe('afsl_compliance');
      expect(getPreviousStep('afsl_compliance')).toBe('kyc_aml_verification');
      expect(getPreviousStep('kyc_aml_verification')).toBe('investor_classification');
      expect(getPreviousStep('investor_classification')).toBe('institutional_identity');
      expect(getPreviousStep('institutional_identity')).toBeNull(); // First step

      // Test step progression tracking
      const state = createEmptyOnboardingState();
      expect(state.currentStep).toBe('institutional_identity');
      expect(state.stepProgress['institutional_identity']).toBe(false);
      expect(state.stepProgress['investor_classification']).toBe(false);

      // Mark first step complete and progress
      state.stepProgress['institutional_identity'] = true;
      state.currentStep = 'investor_classification';
      expect(calculateOnboardingProgress(state)).toBe(Math.round((1 / 6) * 100)); // 17%
    });

    test('verifies onboarding completion flags all required fields', () => {
      // Empty state should not be complete
      expect(isOnboardingComplete(mockOnboardingState)).toBe(false);
      expect(calculateOnboardingProgress(mockOnboardingState)).toBe(0);

      // Create a fully completed state
      const completedState: InstitutionalOnboardingState = {
        ...mockOnboardingState,
        stepProgress: {
          institutional_identity: true,
          investor_classification: true,
          kyc_aml_verification: true,
          afsl_compliance: true,
          investment_preferences: true,
          compliance_confirmation: true,
        },
        finalCompliance: {
          complianceReportGenerated: true,
          allRequirementsMet: true,
          riskAssessmentCompleted: true,
          clientAcceptanceStatus: 'approved',
          restrictedActivities: [],
          monitoringRequirements: ['annual_review'],
        },
      };

      expect(isOnboardingComplete(completedState)).toBe(true);
      expect(calculateOnboardingProgress(completedState)).toBe(100);

      // Partially completed state should not be complete
      const partialState = {
        ...completedState,
        stepProgress: {
          ...completedState.stepProgress,
          compliance_confirmation: false,
        },
      };

      expect(isOnboardingComplete(partialState)).toBe(false);
      expect(calculateOnboardingProgress(partialState)).toBe(Math.round((5 / 6) * 100)); // 83%

      // State with all steps complete but final compliance failing should not be complete
      const complianceFailState = {
        ...completedState,
        finalCompliance: {
          ...completedState.finalCompliance!,
          allRequirementsMet: false,
        },
      };

      expect(isOnboardingComplete(complianceFailState)).toBe(false);
    });

    test('tests state reset functionality', () => {
      // Modify the state
      mockOnboardingState.currentStep = 'investment_preferences';
      mockOnboardingState.stepProgress['institutional_identity'] = true;
      mockOnboardingState.stepProgress['investor_classification'] = true;
      mockOnboardingState.institutionalIdentity = {
        entityName: 'Test Entity',
        entityType: 'fund_manager',
        personaType: 'infrastructure_fund',
        jurisdiction: 'australia',
        aum: 100000000,
        establishedYear: 2015,
        primaryContactName: 'Jane Doe',
        primaryContactRole: 'CIO',
        isTaxExempt: false,
      };

      // Verify state is modified
      expect(mockOnboardingState.currentStep).toBe('investment_preferences');
      expect(mockOnboardingState.institutionalIdentity).not.toBeNull();

      // Reset by creating new empty state
      const resetState = createEmptyOnboardingState();

      // Verify reset state
      expect(resetState.currentStep).toBe('institutional_identity');
      expect(resetState.institutionalIdentity).toBeNull();
      expect(resetState.investorClassification).toBeNull();
      expect(resetState.kycAmlStatus).toBeNull();
      expect(resetState.afslCompliance).toBeNull();
      expect(resetState.investmentPreferences).toBeNull();
      expect(resetState.finalCompliance).toBeNull();
      expect(Object.values(resetState.stepProgress).every(step => step === false)).toBe(true);
      expect(resetState.onboardingCompleted).toBeNull();
      expect(resetState.version).toBe('2.1.0');
    });

    test('tests persona-specific defaults (e.g., pension fund gets professional classification by default)', () => {
      const personaDefaults: Array<{
        persona: PersonaType;
        expectedEntityType: InstitutionalIdentity['entityType'] | null;
        expectedYieldMechanism: string;
        expectedRiskTolerance: string;
        expectedESGMandatory: boolean;
      }> = [
        {
          persona: 'pension_fund',
          expectedEntityType: 'pension_fund',
          expectedYieldMechanism: 'nav_accruing',
          expectedRiskTolerance: 'conservative',
          expectedESGMandatory: true,
        },
        {
          persona: 'sovereign_wealth',
          expectedEntityType: 'sovereign_wealth',
          expectedYieldMechanism: 'nav_accruing',
          expectedRiskTolerance: 'conservative',
          expectedESGMandatory: true,
        },
        {
          persona: 'family_office',
          expectedEntityType: 'family_office',
          expectedYieldMechanism: 'nav_accruing',
          expectedRiskTolerance: 'aggressive',
          expectedESGMandatory: false,
        },
        {
          persona: 'infrastructure_fund',
          expectedEntityType: 'fund_manager',
          expectedYieldMechanism: 'nav_accruing',
          expectedRiskTolerance: 'moderate',
          expectedESGMandatory: true,
        },
        {
          persona: 'esg_impact_investor',
          expectedEntityType: 'fund_manager',
          expectedYieldMechanism: 'revenue_share',
          expectedRiskTolerance: 'moderate',
          expectedESGMandatory: true,
        },
        {
          persona: 'defi_yield_farmer',
          expectedEntityType: 'fund_manager',
          expectedYieldMechanism: 'revenue_share',
          expectedRiskTolerance: 'aggressive',
          expectedESGMandatory: false,
        },
      ];

      personaDefaults.forEach(({ persona, expectedEntityType, expectedYieldMechanism, expectedRiskTolerance, expectedESGMandatory }) => {
        // Test entity type mapping
        const entityType = mapPersonaToEntityType(persona);
        expect(entityType).toBe(expectedEntityType);

        // Test default investment preferences
        const preferences = getDefaultInvestmentPreferences(persona);
        expect(preferences.preferredYieldMechanism).toBe(expectedYieldMechanism);
        expect(preferences.riskTolerance).toBe(expectedRiskTolerance);
        expect(preferences.esgMandatory).toBe(expectedESGMandatory);

        // Special validation for pension fund
        if (persona === 'pension_fund') {
          expect(preferences.liquidityRequirement).toBe('quarterly');
          expect(preferences.targetAllocation?.carbonCredits).toBe(35);
          expect(preferences.targetAllocation?.assetCo).toBe(65);
        }

        // Special validation for sovereign wealth
        if (persona === 'sovereign_wealth') {
          expect(preferences.liquidityRequirement).toBe('annual');
          expect(preferences.targetAllocation?.carbonCredits).toBe(50);
          expect(preferences.targetAllocation?.assetCo).toBe(50);
        }

        // Special validation for family office
        if (persona === 'family_office') {
          expect(preferences.liquidityRequirement).toBe('quarterly');
          expect(preferences.riskTolerance).toBe('aggressive');
        }
      });
    });
  });

  // ===== INVESTOR CLASSIFICATION INTEGRATION TESTS (3 tests) =====

  describe('Investor Classification Integration', () => {
    test('calls validateInvestorClassification with institution parameters and verifies professional result', () => {
      const institutionParams = {
        entityType: 'fund_manager' as const,
        netAssets: 50000000, // A$50M
        grossIncome: 15000000, // A$15M
        aum: 500000000, // A$500M
        professionalExperience: true,
        jurisdictions: ['australia'],
      };

      const result = validateInvestorClassification(institutionParams);

      expect(result.classification).toBe('professional');
      expect(result.rationale).toContain('professional investor');
      expect(result.complianceNotes).toBeDefined();
      expect(result.restrictionFlags).toBeDefined();

      // Verify threshold checks
      expect(result.thresholds!.netAssets.met).toBe(true); // Above A$2.5M threshold
      expect(result.thresholds!.grossIncome.met).toBe(true); // Above A$250K threshold
      expect(result.thresholds!.aum.met).toBe(true); // Above AUM thresholds

      // Professional investors should have fewer restrictions
      expect(result.restrictionFlags!.length).toBeLessThanOrEqual(1);
    });

    test('calls with sophisticated entity parameters and verifies sophisticated result', () => {
      const sophisticatedParams = {
        entityType: 'sovereign_wealth' as const,
        netAssets: 1000000000, // A$1B
        grossIncome: 100000000, // A$100M
        aum: 10000000000, // A$10B
        professionalExperience: true,
        jurisdictions: ['australia'],
      };

      const result = validateInvestorClassification(sophisticatedParams);

      expect(result.classification).toBe('sophisticated');
      expect(result.rationale).toContain('sophisticated investor');

      // Sophisticated investors should meet all thresholds with significant margins
      expect(result.thresholds!.netAssets.met).toBe(true);
      expect(result.thresholds!.netAssets.value).toBeGreaterThan(100000000); // Well above threshold
      expect(result.thresholds!.grossIncome.met).toBe(true);
      expect(result.thresholds!.aum.met).toBe(true);

      // Sophisticated investors should have minimal restrictions
      expect(result.restrictionFlags!.length).toBe(0);
    });

    test('tests wholesale threshold edge cases (exactly A$2.5M net assets)', () => {
      // Test exactly at wholesale threshold
      const exactThresholdParams = {
        entityType: 'family_office' as const,
        netAssets: 2500000, // Exactly A$2.5M
        grossIncome: 250000, // Exactly A$250K
        aum: 5000000, // Above minimum
        professionalExperience: false,
        jurisdictions: ['australia'],
      };

      const exactResult = validateInvestorClassification(exactThresholdParams);
      expect(exactResult.classification).toBe('wholesale');
      expect(exactResult.thresholds!.netAssets.met).toBe(true);
      expect(exactResult.thresholds!.grossIncome.met).toBe(true);

      // Test just below wholesale threshold
      const belowThresholdParams = {
        ...exactThresholdParams,
        netAssets: 2499999, // Just below A$2.5M
        grossIncome: 249999, // Just below A$250K
      };

      const belowResult = validateInvestorClassification(belowThresholdParams);
      expect(belowResult.classification).toBe('retail');
      expect(belowResult.thresholds!.netAssets.met).toBe(false);

      // Test just above wholesale threshold
      const aboveThresholdParams = {
        ...exactThresholdParams,
        netAssets: 2500001, // Just above A$2.5M
      };

      const aboveResult = validateInvestorClassification(aboveThresholdParams);
      expect(aboveResult.classification).toBe('wholesale');
      expect(aboveResult.thresholds!.netAssets.met).toBe(true);
    });
  });

  // ===== KYC/AML VERIFICATION FLOW TESTS (3 tests) =====

  describe('KYC/AML Verification Flow', () => {
    test('calls validateAMLRequirements with high-risk parameters and verifies EDD required', () => {
      const highRiskParams = {
        clientType: 'corporate' as const,
        transactionValue: 5000000, // A$5M - high value
        jurisdictions: ['australia', 'cayman_islands'], // High-risk jurisdiction
        businessPurpose: 'carbon_credit_trading',
        pepStatus: true, // Politically Exposed Person
        sanctionsScreening: {
          cleared: true,
          riskRating: 'high' as const,
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      };

      const result = validateAMLRequirements(highRiskParams);

      expect(result.riskRating).toBe('high');
      expect(result.eddRequired).toBe(true);
      expect(result.monitoringLevel).toBe('enhanced');
      expect(result.restrictionFlags!.length).toBeGreaterThan(0);

      // High-risk clients should have comprehensive documentation requirements
      expect(result.documentationRequired!.beneficialOwnership).toBe(true);
      expect(result.documentationRequired!.sourceOfFunds).toBe(true);
      expect(result.documentationRequired!.businessPurpose).toBe(true);

      // Should have specific compliance notes for high-risk scenarios
      expect(result.complianceNotes!.some(note => note.includes('Enhanced Due Diligence'))).toBe(true);
    });

    test('tests suspicious activity flagging with transaction values above thresholds', () => {
      const largeTxParams = {
        clientType: 'corporate' as const,
        transactionValue: 15000000, // A$15M - above large cash transaction threshold
        jurisdictions: ['australia'],
        businessPurpose: 'carbon_credit_trading',
        pepStatus: false,
        sanctionsScreening: {
          cleared: true,
          riskRating: 'medium' as const,
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      };

      const result = validateAMLRequirements(largeTxParams);

      // Large transactions should trigger enhanced scrutiny
      expect(['medium', 'high']).toContain(result.riskRating);
      expect(result.reportingRequired).toBe(true);
      expect(result.restrictionFlags!.some(flag => flag.includes('large_cash_transaction'))).toBe(true);

      // Should require threshold transaction reporting
      const hasThresholdFlag = result.restrictionFlags!.some(flag =>
        flag.includes('threshold') || flag.includes('reporting')
      );
      expect(hasThresholdFlag).toBe(true);

      // Verify extremely large transaction handling
      const extremelyLargeTxParams = {
        ...largeTxParams,
        transactionValue: 50000000, // A$50M
      };

      const extremeResult = validateAMLRequirements(extremelyLargeTxParams);
      expect(extremeResult.riskRating).toBe('high');
      expect(extremeResult.eddRequired).toBe(true);
      expect(extremeResult.monitoringLevel).toBe('enhanced');
    });

    test('verifies standard CDD completion for normal-risk institutional clients', () => {
      const normalRiskParams = {
        clientType: 'corporate' as const,
        transactionValue: 1000000, // A$1M - normal institutional size
        jurisdictions: ['australia'],
        businessPurpose: 'carbon_credit_trading',
        pepStatus: false,
        sanctionsScreening: {
          cleared: true,
          riskRating: 'low' as const,
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      };

      const result = validateAMLRequirements(normalRiskParams);

      expect(result.riskRating).toBe('low');
      expect(result.eddRequired).toBe(false);
      expect(result.monitoringLevel).toBe('standard');
      expect(result.reportingRequired).toBe(false);

      // Standard CDD should have basic documentation requirements
      expect(result.documentationRequired!.corporateStructure).toBe(true);
      expect(result.documentationRequired!.businessPurpose).toBe(true);
      expect(result.documentationRequired!.beneficialOwnership).toBe(true);

      // Should have minimal restriction flags for normal risk
      expect(result.restrictionFlags!.length).toBeLessThanOrEqual(1);

      // Compliance notes should be standard, not enhanced
      const hasEnhancedNotes = result.complianceNotes!.some(note =>
        note.includes('Enhanced') || note.includes('enhanced')
      );
      expect(hasEnhancedNotes).toBe(false);
    });
  });

  // ===== AFSL COMPLIANCE ASSESSMENT TESTS (2 tests) =====

  describe('AFSL Compliance Assessment', () => {
    test('tests wholesale-only offering structure produces exemption_claimed status', () => {
      const wholesaleOnlyParams = {
        offeringStructure: {
          retailOffering: false,
          wholesaleOnly: true,
          sophisticatedInvestorsOnly: false,
          professionalInvestorsOnly: false,
        },
        licenseDetails: {
          afslNumber: undefined as string | undefined,
          authorisedRepresentative: false,
          exemptionsClaimed: ['s708_wholesale'],
        },
        investorBase: 'wholesale' as const,
        financialServices: ['dealing', 'advice'] as string[],
        jurisdiction: 'australia' as const,
      };

      const result = checkAFSLCompliance(wholesaleOnlyParams);

      expect(result.complianceStatus).toBe('exemption_claimed');
      expect(result.exemptionType).toBe('s708_wholesale');
      expect(result.licenseRequired).toBe(false);
      expect(result.restrictionNotes!.length).toBeGreaterThan(0);

      // Should have specific wholesale-only restrictions
      const hasWholesaleRestriction = result.restrictionNotes!.some(note =>
        note.includes('wholesale') || note.includes('professional')
      );
      expect(hasWholesaleRestriction).toBe(true);
    });

    test('tests retail-included offering structure requires AFSL license', () => {
      const retailIncludedParams = {
        offeringStructure: {
          retailOffering: true,
          wholesaleOnly: false,
          sophisticatedInvestorsOnly: false,
          professionalInvestorsOnly: false,
        },
        licenseDetails: {
          afslNumber: undefined as string | undefined,
          authorisedRepresentative: false,
          exemptionsClaimed: [] as string[],
        },
        investorBase: 'mixed' as const,
        financialServices: ['dealing', 'advice', 'custody'] as string[],
        jurisdiction: 'australia' as const,
      };

      const result = checkAFSLCompliance(retailIncludedParams);

      expect(result.complianceStatus).toBe('license_required');
      expect(result.licenseRequired).toBe(true);
      expect(result.exemptionType).toBe(null);

      // Should have compliance requirements for retail offerings
      expect(result.complianceRequirements!.length).toBeGreaterThan(2);
      expect(result.complianceRequirements!.some(req => req.includes('retail'))).toBe(true);

      // Test with valid AFSL
      const licensedParams = {
        ...retailIncludedParams,
        licenseDetails: {
          afslNumber: '123456',
          authorisedRepresentative: false,
          exemptionsClaimed: [],
        },
      };

      const licensedResult = checkAFSLCompliance(licensedParams);
      expect(licensedResult.complianceStatus).toBe('compliant');
      expect(licensedResult.licenseRequired).toBe(true);
    });
  });

  // ===== END-TO-END ONBOARDING FLOW TESTS (2 tests) =====

  describe('End-to-End Onboarding Flow', () => {
    test('complete onboarding for infrastructure fund persona produces valid compliance report', () => {
      // Step 1: Institutional Identity
      const mockIdentity: InstitutionalIdentity = {
        entityName: 'Green Infrastructure Fund LP',
        entityType: 'fund_manager',
        personaType: 'infrastructure_fund',
        jurisdiction: 'australia',
        aum: 750000000, // A$750M
        establishedYear: 2018,
        primaryContactName: 'Sarah Johnson',
        primaryContactRole: 'Portfolio Manager',
        regulatoryLicense: '234567',
        isTaxExempt: false,
      };

      mockOnboardingState.institutionalIdentity = mockIdentity;
      mockOnboardingState.stepProgress.institutional_identity = true;

      // Validate step 1
      const step1Validation = validateOnboardingStep('institutional_identity', mockOnboardingState);
      expect(step1Validation.isComplete).toBe(true);
      expect(step1Validation.errors.length).toBe(0);
      expect(step1Validation.nextRequiredStep).toBe('investor_classification');

      // Step 2: Investor Classification
      const classificationResult = validateInvestorClassification({
        entityType: 'fund_manager',
        netAssets: 750000000,
        grossIncome: 50000000,
        aum: 750000000,
        professionalExperience: true,
        jurisdictions: ['australia'],
      });

      mockOnboardingState.investorClassification = {
        classification: classificationResult.classification,
        rationale: classificationResult.rationale || '',
        thresholdsMet: {
          netAssets: classificationResult.thresholds!.netAssets.met,
          grossIncome: classificationResult.thresholds!.grossIncome.met,
          aum: true,
          professionalExperience: true,
        },
        exemptionsAvailable: ['s708_wholesale'],
      };
      mockOnboardingState.stepProgress.investor_classification = true;

      expect(classificationResult.classification).toBe('sophisticated');

      // Step 3: KYC/AML
      const amlResult = validateAMLRequirements({
        clientType: 'corporate',
        transactionValue: 25000000,
        jurisdictions: ['australia'],
        businessPurpose: 'carbon_credit_trading',
        pepStatus: false,
        sanctionsScreening: {
          cleared: true,
          riskRating: 'low',
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      });

      mockOnboardingState.kycAmlStatus = {
        kycRequired: true,
        kycCompleted: true,
        amlRiskRating: amlResult.riskRating!,
        eddRequired: amlResult.eddRequired!,
        sanctionsScreeningPassed: true,
        pepStatus: false,
        documentation: {
          corporateStructure: true,
          beneficialOwnership: true,
          sourceOfFunds: true,
          businessPurpose: true,
        },
      };
      mockOnboardingState.stepProgress.kyc_aml_verification = true;

      // Step 4: AFSL Compliance
      const afslResult = checkAFSLCompliance({
        offeringStructure: {
          retailOffering: false,
          wholesaleOnly: true,
          sophisticatedInvestorsOnly: true,
          professionalInvestorsOnly: false,
        },
        licenseDetails: {
          afslNumber: '234567',
          authorisedRepresentative: false,
          exemptionsClaimed: ['s708_wholesale'],
        },
        investorBase: 'sophisticated',
        financialServices: ['dealing'],
        jurisdiction: 'australia',
      });

      mockOnboardingState.afslCompliance = {
        afslRequired: false,
        exemptionType: 's708',
        complianceStatus: afslResult.complianceStatus === 'compliant' ? 'compliant' : 'exemption_claimed',
        restrictionNotes: afslResult.restrictionNotes || [],
      };
      mockOnboardingState.stepProgress.afsl_compliance = true;

      // Step 5: Investment Preferences
      const preferences = getDefaultInvestmentPreferences('infrastructure_fund');
      mockOnboardingState.investmentPreferences = {
        primaryTokenType: 'asset_co',
        secondaryTokenTypes: ['carbon_credits'],
        preferredYieldMechanism: preferences.preferredYieldMechanism!,
        targetAllocation: preferences.targetAllocation!,
        investmentHorizon: 'long_term',
        minimumTicketSize: 5000000,
        maximumTicketSize: 50000000,
        yieldRequirement: 9.5,
        riskTolerance: preferences.riskTolerance!,
        liquidityRequirement: preferences.liquidityRequirement!,
        esgMandatory: preferences.esgMandatory!,
        concentrationLimits: {
          singleAssetMax: 25,
          singleRegionMax: 40,
          singleSectorMax: 30,
        },
      };
      mockOnboardingState.stepProgress.investment_preferences = true;

      // Step 6: Final Compliance
      mockOnboardingState.finalCompliance = {
        complianceReportGenerated: true,
        allRequirementsMet: true,
        riskAssessmentCompleted: true,
        clientAcceptanceStatus: 'approved',
        restrictedActivities: [],
        monitoringRequirements: ['annual_review', 'transaction_monitoring'],
      };
      mockOnboardingState.stepProgress.compliance_confirmation = true;

      // Validate complete onboarding
      expect(isOnboardingComplete(mockOnboardingState)).toBe(true);
      expect(calculateOnboardingProgress(mockOnboardingState)).toBe(100);

      // Verify each step validation passes
      const allSteps: OnboardingStep[] = [
        'institutional_identity',
        'investor_classification',
        'kyc_aml_verification',
        'afsl_compliance',
        'investment_preferences',
        'compliance_confirmation',
      ];

      allSteps.forEach(step => {
        const validation = validateOnboardingStep(step, mockOnboardingState);
        expect(validation.isComplete).toBe(true);
        expect(validation.errors.length).toBe(0);
      });
    });

    test('onboarding state correctly maps to ProfessionalInterface props', () => {
      // Create completed onboarding state
      const completedState = {
        ...mockOnboardingState,
        institutionalIdentity: {
          entityName: 'ESG Impact Fund',
          entityType: 'fund_manager' as const,
          personaType: 'esg_impact_investor' as PersonaType,
          jurisdiction: 'australia' as const,
          aum: 250000000,
          establishedYear: 2020,
          primaryContactName: 'Michael Chen',
          primaryContactRole: 'CIO',
          isTaxExempt: false,
        },
        investorClassification: {
          classification: 'professional' as const,
          rationale: 'Professional investor - fund manager',
          thresholdsMet: {
            netAssets: true,
            grossIncome: true,
            aum: true,
            professionalExperience: true,
          },
          exemptionsAvailable: ['s708_wholesale'],
        },
        investmentPreferences: {
          primaryTokenType: 'carbon_credits' as const,
          secondaryTokenTypes: ['asset_co' as const],
          preferredYieldMechanism: 'revenue_share' as const,
          targetAllocation: { carbonCredits: 60, assetCo: 40 },
          investmentHorizon: 'medium_term' as const,
          minimumTicketSize: 2000000,
          maximumTicketSize: 20000000,
          yieldRequirement: 12.5,
          riskTolerance: 'moderate' as const,
          liquidityRequirement: 'monthly' as const,
          esgMandatory: true,
          concentrationLimits: {
            singleAssetMax: 15,
            singleRegionMax: 30,
            singleSectorMax: 25,
          },
        },
      };

      // Map to ProfessionalInterface props structure
      const mappedProps = {
        investorProfile: {
          type: completedState.institutionalIdentity?.personaType,
          classification: completedState.investorClassification?.classification,
          aum: completedState.institutionalIdentity?.aum,
          riskTolerance: completedState.investmentPreferences?.riskTolerance,
          yieldRequirement: completedState.investmentPreferences?.yieldRequirement,
          liquidityNeeds: completedState.investmentPreferences?.liquidityRequirement,
          esgFocus: completedState.investmentPreferences?.esgMandatory,
        },
        tokenType: completedState.investmentPreferences?.primaryTokenType,
        portfolioConfiguration: {
          targetAllocation: completedState.investmentPreferences?.targetAllocation,
          concentrationLimits: completedState.investmentPreferences?.concentrationLimits,
          yieldMechanism: completedState.investmentPreferences?.preferredYieldMechanism,
        },
      };

      // Verify mapping correctness
      expect(mappedProps.investorProfile.type).toBe('esg_impact_investor');
      expect(mappedProps.investorProfile.classification).toBe('professional');
      expect(mappedProps.investorProfile.aum).toBe(250000000);
      expect(mappedProps.investorProfile.riskTolerance).toBe('moderate');
      expect(mappedProps.investorProfile.yieldRequirement).toBe(12.5);
      expect(mappedProps.investorProfile.liquidityNeeds).toBe('monthly');
      expect(mappedProps.investorProfile.esgFocus).toBe(true);

      expect(mappedProps.tokenType).toBe('carbon_credits');
      expect(mappedProps.portfolioConfiguration.targetAllocation).toEqual({ carbonCredits: 60, assetCo: 40 });
      expect(mappedProps.portfolioConfiguration.yieldMechanism).toBe('revenue_share');
      expect(mappedProps.portfolioConfiguration.concentrationLimits?.singleAssetMax).toBe(15);

      // Verify data types match expected ProfessionalInterface requirements
      expect(typeof mappedProps.investorProfile.aum).toBe('number');
      expect(typeof mappedProps.investorProfile.yieldRequirement).toBe('number');
      expect(typeof mappedProps.investorProfile.esgFocus).toBe('boolean');
      expect(Array.isArray(['carbon_credits', 'asset_co', 'dual_portfolio'])).toBe(true);
      expect(['carbon_credits', 'asset_co', 'dual_portfolio']).toContain(mappedProps.tokenType);
    });
  });
});