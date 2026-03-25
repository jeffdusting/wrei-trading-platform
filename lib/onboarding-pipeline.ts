/**
 * Onboarding Pipeline Utilities
 *
 * Handles state transfer from institutional onboarding to negotiation interface.
 * Transforms institutional onboarding data into negotiation pre-configuration.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement B4: Onboarding-to-Negotiation Pipeline
 */

import type {
  PersonaType,
  InvestorClassification
} from '@/lib/types';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';

/**
 * Buyer persona types for negotiation interface
 */
export type BuyerPersona =
  | 'corporate_compliance_officer'
  | 'esg_fund_portfolio_manager'
  | 'carbon_trading_desk_analyst'
  | 'sustainability_director_midcap'
  | 'government_procurement_officer';

/**
 * Institutional classification types (using existing InvestorClassification)
 */
export type InstitutionalClassification = InvestorClassification;

/**
 * Pre-configuration data extracted from institutional onboarding
 * Used to initialise negotiation interface with institutional context
 */
export interface NegotiationPreConfig {
  /** Whether this is a pre-configured negotiation from onboarding */
  isPreConfigured: boolean;

  /** Institutional persona mapped from onboarding */
  buyerPersona: BuyerPersona;

  /** Institutional classification for constraint adjustments */
  institutionalClassification: InstitutionalClassification;

  /** Entity name for personalisation */
  entityName: string;

  /** Investment preferences from onboarding */
  investmentFocus: {
    primaryTokenType: string;
    targetYield: number;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    minInvestmentSize: number;
    maxInvestmentSize: number;
  };

  /** Compliance context for negotiation constraints */
  complianceContext: {
    afslStatus: 'compliant' | 'exemption_claimed' | 'pending' | 'requires_license';
    kycStatus: 'complete' | 'pending' | 'required';
    jurisdictionRestrictions: string[];
    regulatoryConstraints: string[];
  };

  /** Trading preferences from institutional onboarding */
  tradingPreferences: {
    settlementTimeline: 't0' | 't1' | 't2' | 'flexible';
    paymentMethod: 'wire' | 'crypto' | 'hybrid';
    reportingRequirements: 'standard' | 'enhanced' | 'custom';
    volumeRequirements: 'spot' | 'forward' | 'structured';
  };
}

/**
 * Maps institutional persona types to buyer personas for negotiation
 * Maintains consistency between onboarding and negotiation contexts
 */
export const mapInstitutionalPersonaToBuyerPersona = (personaType: PersonaType | string): BuyerPersona => {
  // Map both PersonaType values and institutional persona strings to buyer personas
  const personaMapping: Record<string, BuyerPersona> = {
    // PersonaType values
    'compliance_officer': 'corporate_compliance_officer',
    'esg_fund_manager': 'esg_fund_portfolio_manager',
    'trading_desk': 'carbon_trading_desk_analyst',
    'sustainability_director': 'sustainability_director_midcap',
    'government_procurement': 'government_procurement_officer',
    'infrastructure_fund': 'esg_fund_portfolio_manager',
    'esg_impact_investor': 'esg_fund_portfolio_manager',
    'defi_yield_farmer': 'carbon_trading_desk_analyst',
    'family_office': 'sustainability_director_midcap',
    'sovereign_wealth': 'government_procurement_officer',
    'pension_fund': 'esg_fund_portfolio_manager',

    // Institutional persona strings (from onboarding)
    'superannuation_fund': 'esg_fund_portfolio_manager',
    'sovereign_wealth_fund': 'esg_fund_portfolio_manager',
    'impact_fund': 'esg_fund_portfolio_manager',
    'insurance_company': 'corporate_compliance_officer',
    'corporate_treasury': 'corporate_compliance_officer',
    'bank_treasury': 'corporate_compliance_officer',
    'hedge_fund': 'carbon_trading_desk_analyst',
    'prop_trading_firm': 'carbon_trading_desk_analyst',
    'commodity_trader': 'carbon_trading_desk_analyst',
    'asset_manager': 'sustainability_director_midcap',
    'endowment_fund': 'sustainability_director_midcap',
    'government_agency': 'government_procurement_officer',
    'development_bank': 'government_procurement_officer',
    'multilateral_org': 'government_procurement_officer'
  };

  return personaMapping[personaType as string] || 'corporate_compliance_officer';
};

/**
 * Extracts negotiation pre-configuration from completed institutional onboarding
 * Transforms institutional data into format suitable for negotiation interface
 */
export const extractNegotiationPreConfig = (
  onboardingState: InstitutionalOnboardingState
): NegotiationPreConfig => {
  const buyerPersona = mapInstitutionalPersonaToBuyerPersona(
    onboardingState.institutionalIdentity?.personaType || 'corporate_treasury'
  );

  const institutionalClassification = onboardingState.investorClassification?.classification || 'retail';

  const prefs = onboardingState.investmentPreferences as any;
  const kycVerification = (onboardingState as any).kycAmlVerification;
  const kycStatus = onboardingState.kycAmlStatus;

  // Determine KYC completion status from either structure
  const isKycComplete = kycVerification?.verificationStatus === 'complete'
    || kycStatus?.kycCompleted === true;

  return {
    isPreConfigured: true,
    buyerPersona,
    institutionalClassification,
    entityName: onboardingState.institutionalIdentity?.entityName || 'Institutional Client',

    investmentFocus: {
      primaryTokenType: prefs?.primaryTokenType || 'carbon_credits',
      targetYield: prefs?.yieldRequirement || 8.5,
      riskTolerance: mapRiskTolerance(prefs?.riskTolerance || 'moderate'),
      minInvestmentSize: prefs?.minInvestmentSize ?? prefs?.minimumTicketSize ?? 100000,
      maxInvestmentSize: prefs?.maxInvestmentSize ?? prefs?.maximumTicketSize ?? 10000000,
    },

    complianceContext: {
      afslStatus: onboardingState.afslCompliance?.complianceStatus || 'pending',
      kycStatus: isKycComplete ? 'complete' : 'pending',
      jurisdictionRestrictions: (onboardingState.afslCompliance as any)?.jurisdictionRestrictions
        ?? onboardingState.afslCompliance?.restrictionNotes ?? [],
      regulatoryConstraints: extractRegulatoryConstraints(onboardingState),
    },

    tradingPreferences: {
      settlementTimeline: prefs?.settlementTimeline || 't1',
      paymentMethod: prefs?.paymentMethod || 'wire',
      reportingRequirements: prefs?.reportingRequirements || 'standard',
      volumeRequirements: prefs?.volumeRequirements || 'spot',
    },
  };
};

/**
 * Maps onboarding risk tolerance to standardised format
 */
const mapRiskTolerance = (tolerance: string): 'conservative' | 'moderate' | 'aggressive' => {
  switch (tolerance.toLowerCase()) {
    case 'low': return 'conservative';
    case 'conservative': return 'conservative';
    case 'medium': return 'moderate';
    case 'moderate': return 'moderate';
    case 'high': return 'aggressive';
    case 'aggressive': return 'aggressive';
    default: return 'moderate';
  }
};

/**
 * Extracts regulatory constraints from onboarding state
 */
const extractRegulatoryConstraints = (state: InstitutionalOnboardingState): string[] => {
  const constraints: string[] = [];

  // AFSL compliance constraints
  if (state.afslCompliance?.afslRequired === true && state.afslCompliance?.complianceStatus === 'requires_license') {
    constraints.push('retail_client_restrictions');
  }

  if (state.afslCompliance?.complianceStatus === 'exemption_claimed') {
    constraints.push('wholesale_client_only');
  }

  // KYC/AML constraints
  if (state.kycAmlStatus?.sanctionsScreeningPassed === false) {
    constraints.push('sanctions_screening_required');
  }

  if (state.kycAmlStatus?.pepStatus === true) {
    constraints.push('pep_enhanced_due_diligence');
  }

  // Investment preference constraints
  const prefs = state.investmentPreferences as any;
  if (prefs?.esgMandatory === true
    || (Array.isArray(prefs?.esgConstraints) && prefs.esgConstraints.length > 0)) {
    constraints.push('esg_compliance_required');
  }

  return constraints;
};

/**
 * Validates that onboarding state contains minimum required data for negotiation
 */
export const validateOnboardingForNegotiation = (
  state: InstitutionalOnboardingState
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];

  // Check institutional identity
  if (!state.institutionalIdentity?.entityName) {
    missingFields.push('entityName');
  }

  if (!state.institutionalIdentity?.personaType) {
    missingFields.push('personaType');
  }

  // Check investor classification
  if (!state.investorClassification?.classification) {
    missingFields.push('investorClassification');
  }

  // Check compliance status
  if (!state.afslCompliance?.complianceStatus) {
    missingFields.push('afslComplianceStatus');
  }

  const kycVerification = (state as any).kycAmlVerification;
  if (state.kycAmlStatus?.kycCompleted === undefined && !kycVerification?.verificationStatus) {
    missingFields.push('kycVerificationStatus');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Generates URL search parameters for negotiation page with pre-configuration
 */
export const generateNegotiationUrlParams = (preConfig: NegotiationPreConfig): string => {
  const params = new URLSearchParams({
    onboarded: 'true',
    persona: preConfig.buyerPersona,
    classification: preConfig.institutionalClassification,
    entity: preConfig.entityName,
    preconfig: 'true',
  });

  return params.toString();
};

/**
 * Parses URL search parameters to extract pre-configuration data
 * Used by negotiation page to detect and load pre-configuration
 */
export const parseNegotiationUrlParams = (searchParams: URLSearchParams): {
  isPreConfigured: boolean;
  persona?: BuyerPersona;
  classification?: InstitutionalClassification;
  entityName?: string;
} => {
  const isPreConfigured = searchParams.get('onboarded') === 'true' &&
                          searchParams.get('preconfig') === 'true';

  if (!isPreConfigured) {
    return { isPreConfigured: false };
  }

  return {
    isPreConfigured: true,
    persona: searchParams.get('persona') as BuyerPersona || undefined,
    classification: searchParams.get('classification') as InstitutionalClassification || undefined,
    entityName: searchParams.get('entity') || undefined,
  };
};

/**
 * Calculates adjusted negotiation constraints based on institutional classification
 * Higher classification levels get more favorable terms and flexibility
 */
export const calculateInstitutionalConstraints = (
  classification: InstitutionalClassification,
  baseConstraints: {
    priceFloor: number;
    maxConcessionPerRound: number;
    maxTotalConcession: number;
    minRoundsBeforeConcession: number;
  }
) => {
  const adjustments = {
    sophisticated: {
      priceFloorMultiplier: 0.98,    // 2% more flexible floor
      concessionMultiplier: 1.25,    // 25% larger concessions allowed
      minRoundsReduction: 1,         // Can concede 1 round earlier
    },
    wholesale: {
      priceFloorMultiplier: 0.95,    // 5% more flexible floor
      concessionMultiplier: 1.5,     // 50% larger concessions allowed
      minRoundsReduction: 2,         // Can concede 2 rounds earlier
    },
    professional: {
      priceFloorMultiplier: 0.96,    // 4% more flexible floor
      concessionMultiplier: 1.35,    // 35% larger concessions allowed
      minRoundsReduction: 1,         // Can concede 1 round earlier
    },
    retail: {
      priceFloorMultiplier: 1.0,     // Standard constraints
      concessionMultiplier: 1.0,     // Standard concession limits
      minRoundsReduction: 0,         // Standard round requirements
    },
  };

  const adjustment = adjustments[classification] || adjustments.retail;

  return {
    priceFloor: Math.round(baseConstraints.priceFloor * adjustment.priceFloorMultiplier),
    maxConcessionPerRound: Math.min(0.08, baseConstraints.maxConcessionPerRound * adjustment.concessionMultiplier),
    maxTotalConcession: Math.min(0.30, baseConstraints.maxTotalConcession * adjustment.concessionMultiplier),
    minRoundsBeforeConcession: Math.max(1, baseConstraints.minRoundsBeforeConcession - adjustment.minRoundsReduction),
  };
};

/**
 * Creates personalised welcome message for pre-configured negotiation
 */
export const generatePersonalisedWelcome = (preConfig: NegotiationPreConfig): string => {
  const personaGreetings = {
    corporate_compliance_officer: 'Welcome to WREI\'s institutional trading platform. Your compliance requirements have been pre-loaded.',
    esg_fund_portfolio_manager: 'Welcome to WREI\'s ESG-focused carbon credit marketplace. Your sustainability metrics are configured.',
    carbon_trading_desk_analyst: 'Welcome to WREI\'s professional trading interface. Your volume and pricing preferences are active.',
    sustainability_director_midcap: 'Welcome to WREI\'s institutional platform. Your sustainability goals and budget constraints are configured.',
    government_procurement_officer: 'Welcome to WREI\'s government procurement interface. Your regulatory and process requirements are pre-configured.',
  };

  return personaGreetings[preConfig.buyerPersona] ||
         'Welcome to WREI\'s institutional trading platform. Your profile has been pre-configured.';
};

/**
 * Export types for external use
 * (NegotiationPreConfig is already exported above)
 */