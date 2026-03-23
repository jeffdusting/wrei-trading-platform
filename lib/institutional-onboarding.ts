/**
 * Institutional Onboarding Types and Validation Helpers
 * Milestone 2.1: Institutional Onboarding Platform
 *
 * Extends existing types.ts interfaces for institutional investor onboarding workflow
 */

import type {
  PersonaType,
  WREITokenType,
  InvestorClassification,
  YieldMechanism
} from './types';

// ===== ONBOARDING WORKFLOW TYPES =====

export type OnboardingStep =
  | 'institutional_identity'
  | 'investor_classification'
  | 'kyc_aml_verification'
  | 'afsl_compliance'
  | 'investment_preferences'
  | 'compliance_confirmation';

export interface InstitutionalIdentity {
  entityName: string;
  entityType: 'fund_manager' | 'family_office' | 'pension_fund' | 'sovereign_wealth' | 'insurance_company' | 'endowment';
  personaType: PersonaType;
  jurisdiction: 'australia' | 'new_zealand' | 'singapore' | 'hong_kong' | 'other';
  aum: number; // Assets under management in A$
  establishedYear: number;
  primaryContactName: string;
  primaryContactRole: string;
  regulatoryLicense?: string; // AFSL number if applicable
  isTaxExempt: boolean;
}

export interface InvestmentPreferences {
  primaryTokenType: WREITokenType;
  secondaryTokenTypes: WREITokenType[];
  preferredYieldMechanism: YieldMechanism;
  targetAllocation: {
    carbonCredits: number; // Percentage 0-100
    assetCo: number;       // Percentage 0-100
  };
  investmentHorizon: 'short_term' | 'medium_term' | 'long_term'; // <2yr, 2-5yr, >5yr
  minimumTicketSize: number; // Minimum investment in A$
  maximumTicketSize: number; // Maximum investment in A$
  yieldRequirement: number;  // Minimum yield expectation
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  liquidityRequirement: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  esgMandatory: boolean;
  concentrationLimits: {
    singleAssetMax: number;   // Max % in single asset
    singleRegionMax: number;  // Max % in single region
    singleSectorMax: number;  // Max % in single sector
  };
}

export interface OnboardingValidation {
  isComplete: boolean;
  errors: string[];
  warnings: string[];
  nextRequiredStep: OnboardingStep | null;
}

export interface InstitutionalOnboardingState {
  currentStep: OnboardingStep;
  stepProgress: Record<OnboardingStep, boolean>;

  // Step 1: Institutional Identity
  institutionalIdentity: InstitutionalIdentity | null;

  // Step 2: Investor Classification
  investorClassification: {
    classification: InvestorClassification | null;
    rationale: string;
    thresholdsMet: {
      netAssets: boolean;
      grossIncome: boolean;
      aum: boolean;
      professionalExperience: boolean;
    };
    exemptionsAvailable: string[];
  } | null;

  // Step 3: KYC/AML Verification
  kycAmlStatus: {
    kycRequired: boolean;
    kycCompleted: boolean;
    amlRiskRating: 'low' | 'medium' | 'high';
    eddRequired: boolean;
    sanctionsScreeningPassed: boolean;
    pepStatus: boolean;
    documentation: {
      corporateStructure: boolean;
      beneficialOwnership: boolean;
      sourceOfFunds: boolean;
      businessPurpose: boolean;
    };
  } | null;

  // Step 4: AFSL Compliance
  afslCompliance: {
    afslRequired: boolean;
    exemptionType: 's708' | 's761G' | 'wholesale_only' | 'none';
    complianceStatus: 'compliant' | 'exemption_claimed' | 'requires_license';
    restrictionNotes: string[];
  } | null;

  // Step 5: Investment Preferences
  investmentPreferences: InvestmentPreferences | null;

  // Step 6: Final Compliance
  finalCompliance: {
    complianceReportGenerated: boolean;
    allRequirementsMet: boolean;
    riskAssessmentCompleted: boolean;
    clientAcceptanceStatus: 'pending' | 'approved' | 'declined';
    restrictedActivities: string[];
    monitoringRequirements: string[];
  } | null;

  // Metadata
  onboardingStarted: string; // ISO timestamp
  lastUpdated: string;       // ISO timestamp
  onboardingCompleted: string | null; // ISO timestamp
  version: string; // For future migration compatibility
}

// ===== VALIDATION HELPERS =====

export function createEmptyOnboardingState(): InstitutionalOnboardingState {
  const now = new Date().toISOString();

  return {
    currentStep: 'institutional_identity',
    stepProgress: {
      institutional_identity: false,
      investor_classification: false,
      kyc_aml_verification: false,
      afsl_compliance: false,
      investment_preferences: false,
      compliance_confirmation: false,
    },
    institutionalIdentity: null,
    investorClassification: null,
    kycAmlStatus: null,
    afslCompliance: null,
    investmentPreferences: null,
    finalCompliance: null,
    onboardingStarted: now,
    lastUpdated: now,
    onboardingCompleted: null,
    version: '2.1.0',
  };
}

export function validateOnboardingStep(
  step: OnboardingStep,
  state: InstitutionalOnboardingState
): OnboardingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (step) {
    case 'institutional_identity':
      if (!state.institutionalIdentity) {
        errors.push('Institutional identity information is required');
      } else {
        if (!state.institutionalIdentity.entityName.trim()) {
          errors.push('Entity name is required');
        }
        if (!state.institutionalIdentity.primaryContactName.trim()) {
          errors.push('Primary contact name is required');
        }
        if (state.institutionalIdentity.aum <= 0) {
          errors.push('Assets under management must be greater than zero');
        }
        if (state.institutionalIdentity.aum < 2500000) {
          warnings.push('AUM below wholesale investor threshold (A$2.5M)');
        }
      }
      break;

    case 'investor_classification':
      if (!state.investorClassification) {
        errors.push('Investor classification assessment is required');
      } else if (!state.investorClassification.classification) {
        errors.push('Investor classification must be determined');
      }
      break;

    case 'kyc_aml_verification':
      if (!state.kycAmlStatus) {
        errors.push('KYC/AML verification status is required');
      } else {
        if (state.kycAmlStatus.kycRequired && !state.kycAmlStatus.kycCompleted) {
          errors.push('KYC verification must be completed');
        }
        if (!state.kycAmlStatus.sanctionsScreeningPassed) {
          errors.push('Sanctions screening must pass');
        }
        if (state.kycAmlStatus.pepStatus) {
          warnings.push('Politically Exposed Person (PEP) status requires enhanced due diligence');
        }
      }
      break;

    case 'afsl_compliance':
      if (!state.afslCompliance) {
        errors.push('AFSL compliance assessment is required');
      } else if (state.afslCompliance.complianceStatus === 'requires_license') {
        errors.push('AFSL license required for this offering structure');
      }
      break;

    case 'investment_preferences':
      if (!state.investmentPreferences) {
        errors.push('Investment preferences must be specified');
      } else {
        const prefs = state.investmentPreferences;
        if (prefs.targetAllocation.carbonCredits + prefs.targetAllocation.assetCo !== 100) {
          errors.push('Target allocation must total 100%');
        }
        if (prefs.minimumTicketSize >= prefs.maximumTicketSize) {
          errors.push('Minimum ticket size must be less than maximum');
        }
        if (prefs.yieldRequirement < 0) {
          errors.push('Yield requirement cannot be negative');
        }
      }
      break;

    case 'compliance_confirmation':
      if (!state.finalCompliance) {
        errors.push('Final compliance review is required');
      } else if (!state.finalCompliance.allRequirementsMet) {
        errors.push('All compliance requirements must be satisfied');
      }
      break;
  }

  return {
    isComplete: errors.length === 0,
    errors,
    warnings,
    nextRequiredStep: getNextStep(step, errors.length === 0),
  };
}

export function getNextStep(
  currentStep: OnboardingStep,
  currentStepValid: boolean
): OnboardingStep | null {
  if (!currentStepValid) return currentStep;

  const stepOrder: OnboardingStep[] = [
    'institutional_identity',
    'investor_classification',
    'kyc_aml_verification',
    'afsl_compliance',
    'investment_preferences',
    'compliance_confirmation',
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === stepOrder.length - 1) return null; // Already at last step

  return stepOrder[currentIndex + 1];
}

export function getPreviousStep(currentStep: OnboardingStep): OnboardingStep | null {
  const stepOrder: OnboardingStep[] = [
    'institutional_identity',
    'investor_classification',
    'kyc_aml_verification',
    'afsl_compliance',
    'investment_preferences',
    'compliance_confirmation',
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === 0) return null; // Already at first step

  return stepOrder[currentIndex - 1];
}

export function calculateOnboardingProgress(state: InstitutionalOnboardingState): number {
  const totalSteps = Object.keys(state.stepProgress).length;
  const completedSteps = Object.values(state.stepProgress).filter(Boolean).length;

  return Math.round((completedSteps / totalSteps) * 100);
}

export function isOnboardingComplete(state: InstitutionalOnboardingState): boolean {
  return Object.values(state.stepProgress).every(Boolean) &&
         state.finalCompliance?.allRequirementsMet === true;
}

// ===== PERSONA MAPPING HELPERS =====

export function mapPersonaToEntityType(persona: PersonaType): InstitutionalIdentity['entityType'] | null {
  switch (persona) {
    case 'infrastructure_fund':
      return 'fund_manager';
    case 'esg_impact_investor':
      return 'fund_manager';
    case 'family_office':
      return 'family_office';
    case 'sovereign_wealth':
      return 'sovereign_wealth';
    case 'pension_fund':
      return 'pension_fund';
    case 'defi_yield_farmer':
      return 'fund_manager'; // Treat as specialized fund manager
    default:
      return null; // Non-institutional personas
  }
}

export function getDefaultInvestmentPreferences(persona: PersonaType): Partial<InvestmentPreferences> {
  switch (persona) {
    case 'infrastructure_fund':
      return {
        preferredYieldMechanism: 'nav_accruing',
        targetAllocation: { carbonCredits: 30, assetCo: 70 },
        riskTolerance: 'moderate',
        liquidityRequirement: 'quarterly',
        esgMandatory: true,
      };

    case 'esg_impact_investor':
      return {
        preferredYieldMechanism: 'revenue_share',
        targetAllocation: { carbonCredits: 60, assetCo: 40 },
        riskTolerance: 'moderate',
        liquidityRequirement: 'monthly',
        esgMandatory: true,
      };

    case 'family_office':
      return {
        preferredYieldMechanism: 'nav_accruing',
        targetAllocation: { carbonCredits: 40, assetCo: 60 },
        riskTolerance: 'aggressive',
        liquidityRequirement: 'quarterly',
        esgMandatory: false,
      };

    case 'sovereign_wealth':
      return {
        preferredYieldMechanism: 'nav_accruing',
        targetAllocation: { carbonCredits: 50, assetCo: 50 },
        riskTolerance: 'conservative',
        liquidityRequirement: 'annual',
        esgMandatory: true,
      };

    case 'pension_fund':
      return {
        preferredYieldMechanism: 'nav_accruing',
        targetAllocation: { carbonCredits: 35, assetCo: 65 },
        riskTolerance: 'conservative',
        liquidityRequirement: 'quarterly',
        esgMandatory: true,
      };

    case 'defi_yield_farmer':
      return {
        preferredYieldMechanism: 'revenue_share',
        targetAllocation: { carbonCredits: 20, assetCo: 80 },
        riskTolerance: 'aggressive',
        liquidityRequirement: 'daily',
        esgMandatory: false,
      };

    default:
      return {
        preferredYieldMechanism: 'revenue_share',
        targetAllocation: { carbonCredits: 50, assetCo: 50 },
        riskTolerance: 'moderate',
        liquidityRequirement: 'monthly',
        esgMandatory: false,
      };
  }
}