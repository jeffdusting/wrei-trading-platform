/**
 * WREI Regulatory Compliance Integration - Australian Framework
 *
 * Comprehensive regulatory compliance system for WREI tokenization:
 * - Australian regulatory pathway indicators
 * - AML/CTF compliance status and requirements
 * - Tax treatment guidance (CGT vs income optimization)
 * - Digital Assets Framework Bill 2025 compliance
 * - AFSL licensing requirements and exemptions
 * - Real-time compliance monitoring and alerts
 */

import type {
  WREITokenType,
  InvestorClassification,
  PersonaType,
  YieldModelDefinition,
  InvestmentScenario
} from './types';

// =============================================================================
// REGULATORY COMPLIANCE INTERFACES
// =============================================================================

export interface ComplianceStatus {
  overall: 'compliant' | 'pending' | 'non_compliant' | 'under_review';
  lastAssessment: string; // ISO date
  nextReview: string; // ISO date
  jurisdiction: string;
  regulatoryFramework: string;
  complianceScore: number; // 0-100
  criticalIssues: string[];
  recommendations: string[];
}

export interface AFSLCompliance {
  required: boolean;
  status: 'licensed' | 'exemption_claimed' | 'application_pending' | 'not_required';
  licenseNumber?: string;
  exemptionSection?: string; // e.g., 's708' for wholesale exemption
  exemptionJustification?: string;
  authorizedRepresentatives: string[];
  complianceOfficer?: string;
  lastAudit?: string;
  nextAudit?: string;
}

export interface AMLCTFCompliance {
  status: 'registered' | 'registration_pending' | 'exempt' | 'non_compliant';
  austracRegistration: {
    registrationDate?: string;
    reportingEntityNumber?: string;
    businessType: string;
    riskRating: 'low' | 'medium' | 'high';
    lastReport?: string;
    nextReport?: string;
  };
  kycRequirements: {
    minimumChecks: string[];
    enhancedDueDiligence: boolean;
    ongoingMonitoring: boolean;
    recordKeeping: {
      duration: number; // years
      digitalStorage: boolean;
      auditTrail: boolean;
    };
  };
  suspiciousActivityReporting: {
    thresholds: Record<string, number>;
    reportingProcedures: string[];
    staffTraining: boolean;
  };
}

export interface TaxTreatment {
  tokenType: WREITokenType;
  yieldMechanism: 'revenue_share' | 'nav_accruing';
  classification: {
    income: boolean; // Ordinary income treatment
    capitalGains: boolean; // CGT treatment
    dividendImputation: boolean; // Franking credits available
    deductibility: boolean; // Tax deductible for certain entities
  };
  rates: {
    corporateRate: number; // 30% for companies
    individualRate: number; // Marginal rates
    cgtDiscount: number; // 50% for individuals, 0% for companies
    witholdingTax: number; // For foreign investors
  };
  guidance: {
    holdingPeriod: string;
    recordKeeping: string[];
    reportingRequirements: string[];
    optimizationStrategies: string[];
  };
}

export interface DigitalAssetsFramework {
  status: 'draft' | 'enacted' | 'in_force' | 'amended';
  effectiveDate: string;
  applicableTo: {
    custodialServices: boolean;
    exchangeServices: boolean;
    tokenIssuance: boolean;
    defiProtocols: boolean;
  };
  licensingRequirements: {
    digitalAssetPlatform: boolean;
    digitalAssetExchange: boolean;
    digitalAssetCustodian: boolean;
    marketMaker: boolean;
  };
  compliance: {
    riskManagement: boolean;
    cybersecurity: boolean;
    operationalResilience: boolean;
    conflictOfInterest: boolean;
    fairnessTransparency: boolean;
  };
}

export interface JurisdictionalCompliance {
  jurisdiction: string;
  applicableLaws: string[];
  regulatoryBodies: string[];
  compliance: ComplianceStatus;
  crossBorderRules: {
    allowedInvestorTypes: InvestorClassification[];
    restrictedJurisdictions: string[];
    treatyBenefits: boolean;
    witholdingObligations: boolean;
  };
}

// =============================================================================
// AUSTRALIAN REGULATORY FRAMEWORK CONSTANTS
// =============================================================================

export const AUSTRALIAN_REGULATORY_FRAMEWORK = {
  // Primary Regulatory Bodies
  REGULATORS: {
    ASIC: {
      name: 'Australian Securities and Investments Commission',
      role: 'Financial services licensing and market conduct',
      relevantActs: ['Corporations Act 2001', 'ASIC Act 2001'],
      contactInfo: 'https://asic.gov.au'
    },
    AUSTRAC: {
      name: 'Australian Transaction Reports and Analysis Centre',
      role: 'AML/CTF compliance and monitoring',
      relevantActs: ['Anti-Money Laundering and Counter-Terrorism Financing Act 2006'],
      contactInfo: 'https://austrac.gov.au'
    },
    ATO: {
      name: 'Australian Taxation Office',
      role: 'Tax treatment and compliance',
      relevantActs: ['Income Tax Assessment Act 1997', 'Taxation Administration Act 1953'],
      contactInfo: 'https://ato.gov.au'
    },
    TREASURY: {
      name: 'Treasury of Australia',
      role: 'Digital Assets Framework Bill policy',
      relevantActs: ['Digital Assets Framework Bill 2025'],
      contactInfo: 'https://treasury.gov.au'
    }
  },

  // AFSL Licensing Framework
  AFSL: {
    WHOLESALE_EXEMPTIONS: {
      s708: {
        description: 'Wholesale client exemption',
        requirements: [
          'Investment of A$500,000 or more',
          'Gross income of A$250,000+ for two consecutive years',
          'Net assets of A$2.5 million or more',
          'Professional investor certification'
        ],
        documentation: ['Wholesale client certificate', 'Financial statements', 'Accountant certification']
      },
      s761G: {
        description: 'Sophisticated investor exemption',
        requirements: [
          'Minimum investment of A$500,000',
          'Previous investment experience',
          'Accountant certification of net assets A$2.5M+'
        ],
        documentation: ['Sophisticated investor certificate', 'Accountant statement']
      }
    },
    LICENSING_REQUIREMENTS: {
      condition: 'Providing financial services to retail clients',
      exemptions: ['Wholesale only', 'Sophisticated investors only', 'Professional investors only'],
      obligations: [
        'Adequate compensation arrangements',
        'Risk management systems',
        'Compliance monitoring',
        'Staff training and competency',
        'Dispute resolution procedures'
      ]
    }
  },

  // AML/CTF Framework
  AML_CTF: {
    REGISTRATION_DEADLINE: '2026-03-31',
    REPORTING_ENTITY_TYPES: ['Digital currency exchange', 'Remittance service provider', 'Financial product issuer'],
    KYC_REQUIREMENTS: {
      individual: ['Full name', 'Date of birth', 'Residential address', 'Identity verification'],
      corporate: ['Company name', 'ACN/ABN', 'Registered office', 'Beneficial ownership'],
      trust: ['Trust deed', 'Trustee details', 'Beneficiary information', 'Control structure']
    },
    TRANSACTION_THRESHOLDS: {
      cash: 10000, // A$10,000 for cash transactions
      suspicious: 0, // No threshold for suspicious activity
      international: 1000, // A$1,000 for international fund transfers
      account_opening: 0 // All account openings
    }
  },

  // Tax Framework
  TAX_TREATMENT: {
    INCOME_TAX: {
      corporate_rate: 0.30, // 30% company tax rate
      individual_rates: {
        '0-18200': 0.00,
        '18201-45000': 0.19,
        '45001-120000': 0.325,
        '120001-180000': 0.37,
        '180001+': 0.45
      }
    },
    CAPITAL_GAINS: {
      discount_individual: 0.50, // 50% CGT discount for individuals
      discount_company: 0.00, // No CGT discount for companies
      holding_period: 365, // 365 days for discount eligibility
      small_business_concessions: true
    },
    DIVIDEND_IMPUTATION: {
      franking_rate: 0.30, // 30% franking rate
      eligibility: ['Australian residents', 'Holding period > 45 days'],
      refunds: true // Excess franking credits refundable
    }
  },

  // Digital Assets Framework Bill 2025
  DIGITAL_ASSETS_FRAMEWORK: {
    status: 'enacted',
    effective_date: '2025-07-01',
    scope: {
      custodial_services: true,
      exchange_services: true,
      token_issuance: true,
      defi_protocols: false // Excluded from initial scope
    },
    licensing_thresholds: {
      revenue: 5000000, // A$5M annual revenue
      assets_under_management: 50000000, // A$50M AUM
      transaction_volume: 100000000 // A$100M annual transaction volume
    }
  }
} as const;

// =============================================================================
// COMPLIANCE ASSESSMENT FUNCTIONS
// =============================================================================

/**
 * Assess overall compliance status for WREI token offering
 */
export function assessOverallCompliance(
  tokenType: WREITokenType,
  investorClassification: InvestorClassification,
  offeringStructure: 'wholesale_only' | 'sophisticated_only' | 'retail_included'
): ComplianceStatus {
  const criticalIssues: string[] = [];
  const recommendations: string[] = [];
  let complianceScore = 100;

  // AFSL Assessment
  const aflsStatus = assessAFSLCompliance(investorClassification, offeringStructure);
  if (aflsStatus.required && aflsStatus.status !== 'licensed' && aflsStatus.status !== 'exemption_claimed') {
    criticalIssues.push('AFSL license required for retail offerings');
    complianceScore -= 30;
  }

  // AML/CTF Assessment
  const amlStatus = assessAMLCTFCompliance();
  if (amlStatus.status === 'non_compliant') {
    criticalIssues.push('AUSTRAC registration required by March 31, 2026');
    complianceScore -= 25;
  }

  // Digital Assets Framework Assessment
  if (new Date() >= new Date('2025-07-01')) {
    const dafCompliance = assessDigitalAssetsFrameworkCompliance();
    if (!dafCompliance.compliance.riskManagement) {
      recommendations.push('Implement Digital Assets Framework risk management systems');
      complianceScore -= 10;
    }
  }

  // Token-specific compliance
  if (tokenType === 'asset_co' && offeringStructure === 'retail_included') {
    recommendations.push('Consider managed investment scheme (MIS) licensing for retail asset co offerings');
  }

  const overall = complianceScore >= 90 ? 'compliant' :
                   complianceScore >= 70 ? 'pending' :
                   complianceScore >= 50 ? 'under_review' : 'non_compliant';

  return {
    overall,
    lastAssessment: new Date().toISOString(),
    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    jurisdiction: 'Australia',
    regulatoryFramework: 'Australian Financial Services Framework',
    complianceScore,
    criticalIssues,
    recommendations
  };
}

/**
 * Assess AFSL compliance requirements
 */
export function assessAFSLCompliance(
  investorClassification: InvestorClassification,
  offeringStructure: 'wholesale_only' | 'sophisticated_only' | 'retail_included'
): AFSLCompliance {
  const retailIncluded = offeringStructure === 'retail_included';
  const wholesaleOnly = offeringStructure === 'wholesale_only';

  return {
    required: retailIncluded,
    status: retailIncluded ? 'application_pending' :
            wholesaleOnly ? 'exemption_claimed' : 'exemption_claimed',
    exemptionSection: wholesaleOnly ? 's708' : 's761G',
    exemptionJustification: wholesaleOnly ?
      'Wholesale client exemption under s708 - minimum A$500,000 investments to qualifying wholesale clients' :
      'Sophisticated investor exemption under s761G - certified sophisticated investors only',
    authorizedRepresentatives: ['Water Roads Pty Ltd Directors'],
    complianceOfficer: 'Chief Compliance Officer',
    nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * Assess AML/CTF compliance status
 */
export function assessAMLCTFCompliance(): AMLCTFCompliance {
  const registrationRequired = new Date() >= new Date('2024-01-01'); // Digital currency services subject to AML/CTF

  return {
    status: registrationRequired ? 'registration_pending' : 'registered',
    austracRegistration: {
      registrationDate: '2024-01-15T00:00:00Z',
      reportingEntityNumber: 'RE12345678',
      businessType: 'Digital currency exchange service',
      riskRating: 'medium',
      lastReport: '2024-12-31T00:00:00Z',
      nextReport: '2025-12-31T00:00:00Z'
    },
    kycRequirements: {
      minimumChecks: [
        'Identity verification (100 points check)',
        'Address verification',
        'Source of funds verification',
        'Beneficial ownership disclosure'
      ],
      enhancedDueDiligence: true,
      ongoingMonitoring: true,
      recordKeeping: {
        duration: 7, // 7 years as required by AML/CTF Act
        digitalStorage: true,
        auditTrail: true
      }
    },
    suspiciousActivityReporting: {
      thresholds: AUSTRALIAN_REGULATORY_FRAMEWORK.AML_CTF.TRANSACTION_THRESHOLDS,
      reportingProcedures: [
        'Suspicious Matter Report (SMR) within 3 business days',
        'Threshold Transaction Report (TTR) within 10 business days',
        'International Funds Transfer Instruction (IFTI) within 10 business days'
      ],
      staffTraining: true
    }
  };
}

/**
 * Get optimal tax treatment recommendations
 */
export function getOptimalTaxTreatment(
  tokenType: WREITokenType,
  yieldMechanism: 'revenue_share' | 'nav_accruing',
  investorProfile: {
    classification: InvestorClassification;
    jurisdiction: string;
    taxResident: boolean;
    marginalRate?: number;
  }
): TaxTreatment {
  const isRevenueShare = yieldMechanism === 'revenue_share';
  const isAssetCo = tokenType === 'asset_co';

  return {
    tokenType,
    yieldMechanism,
    classification: {
      income: isRevenueShare, // Revenue share distributions are ordinary income
      capitalGains: yieldMechanism === 'nav_accruing', // NAV appreciation is CGT
      dividendImputation: isAssetCo && isRevenueShare && investorProfile.taxResident, // Asset Co distributions may be franked
      deductibility: investorProfile.classification === 'professional' // Professional investors may claim deductions
    },
    rates: {
      corporateRate: AUSTRALIAN_REGULATORY_FRAMEWORK.TAX_TREATMENT.INCOME_TAX.corporate_rate,
      individualRate: investorProfile.marginalRate || 0.325, // Default to 32.5% bracket
      cgtDiscount: investorProfile.classification === 'professional' ? 0.0 : 0.5, // Companies don't get CGT discount
      witholdingTax: investorProfile.taxResident ? 0.0 : 0.30 // 30% withholding for non-residents
    },
    guidance: {
      holdingPeriod: yieldMechanism === 'nav_accruing' ?
        'Hold for 12+ months to qualify for 50% CGT discount (individuals only)' :
        'No minimum holding period for income distributions',
      recordKeeping: [
        'Acquisition date and cost basis',
        'Distribution records with franking credit details',
        'Transaction confirmations and settlement records',
        'Annual statements showing income and capital components'
      ],
      reportingRequirements: [
        'Include distributions in annual tax return',
        'Capital gains/losses reported in year of disposal',
        'Foreign income and asset reporting if applicable',
        'Dividend imputation credits claimed where eligible'
      ],
      optimizationStrategies: [
        yieldMechanism === 'nav_accruing' ?
          'Consider timing of disposals to optimize CGT discount eligibility' :
          'Consider income splitting through family trusts where appropriate',
        'Utilize excess franking credits for tax refunds if available',
        'Consider SMSF holding for tax-effective retirement savings'
      ]
    }
  };
}

/**
 * Assess Digital Assets Framework compliance
 */
export function assessDigitalAssetsFrameworkCompliance(): DigitalAssetsFramework {
  const framework = AUSTRALIAN_REGULATORY_FRAMEWORK.DIGITAL_ASSETS_FRAMEWORK;

  return {
    status: 'in_force',
    effectiveDate: framework.effective_date,
    applicableTo: {
      custodialServices: false, // WREI uses non-custodial settlement
      exchangeServices: false, // Not operating as exchange
      tokenIssuance: true, // WREI issues tokens
      defiProtocols: false // DeFi protocols excluded from initial scope
    },
    licensingRequirements: {
      digitalAssetPlatform: false, // Below licensing thresholds
      digitalAssetExchange: false,
      digitalAssetCustodian: false,
      marketMaker: false
    },
    compliance: {
      riskManagement: true,
      cybersecurity: true,
      operationalResilience: true,
      conflictOfInterest: true,
      fairnessTransparency: true
    }
  };
}

// =============================================================================
// COMPLIANCE MONITORING & ALERTS
// =============================================================================

export interface ComplianceAlert {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'deadline' | 'threshold' | 'requirement' | 'update';
  title: string;
  description: string;
  dueDate?: string;
  actionRequired: string[];
  regulatoryBody: string;
}

/**
 * Get active compliance alerts and upcoming deadlines
 */
export function getComplianceAlerts(): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  const now = new Date();
  const amlDeadline = new Date('2026-03-31');

  // AML/CTF Registration Alert
  if (now < amlDeadline) {
    const daysUntilDeadline = Math.ceil((amlDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    alerts.push({
      severity: daysUntilDeadline <= 30 ? 'critical' : 'high',
      type: 'deadline',
      title: 'AUSTRAC Registration Required',
      description: `AML/CTF registration deadline approaching in ${daysUntilDeadline} days`,
      dueDate: amlDeadline.toISOString(),
      actionRequired: [
        'Complete AUSTRAC registration application',
        'Implement AML/CTF compliance program',
        'Train staff on suspicious activity reporting',
        'Establish ongoing monitoring procedures'
      ],
      regulatoryBody: 'AUSTRAC'
    });
  }

  // Digital Assets Framework Update
  if (now >= new Date('2025-07-01')) {
    alerts.push({
      severity: 'medium',
      type: 'update',
      title: 'Digital Assets Framework Now in Effect',
      description: 'Ensure compliance with new digital asset licensing and operational requirements',
      actionRequired: [
        'Review operational procedures for DAF compliance',
        'Implement enhanced risk management systems',
        'Update cybersecurity and operational resilience measures'
      ],
      regulatoryBody: 'Treasury/ASIC'
    });
  }

  // AFSL Review Alert
  alerts.push({
    severity: 'low',
    type: 'requirement',
    title: 'Annual AFSL Compliance Review',
    description: 'Annual review of AFSL exemption compliance and documentation',
    actionRequired: [
      'Review wholesale client certifications',
      'Update sophisticated investor documentation',
      'Audit compliance procedures and staff training'
    ],
    regulatoryBody: 'ASIC'
  });

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Generate compliance report for institutional investors
 */
export function generateComplianceReport(tokenType: WREITokenType): {
  summary: ComplianceStatus;
  afsl: AFSLCompliance;
  amlCtf: AMLCTFCompliance;
  taxTreatment: TaxTreatment;
  digitalAssetsFramework: DigitalAssetsFramework;
  alerts: ComplianceAlert[];
  lastUpdated: string;
} {
  const summary = assessOverallCompliance(tokenType, 'wholesale', 'wholesale_only');
  const afsl = assessAFSLCompliance('wholesale', 'wholesale_only');
  const amlCtf = assessAMLCTFCompliance();
  const taxTreatment = getOptimalTaxTreatment(tokenType, 'revenue_share', {
    classification: 'wholesale',
    jurisdiction: 'Australia',
    taxResident: true
  });
  const digitalAssetsFramework = assessDigitalAssetsFrameworkCompliance();
  const alerts = getComplianceAlerts();

  return {
    summary,
    afsl,
    amlCtf,
    taxTreatment,
    digitalAssetsFramework,
    alerts,
    lastUpdated: new Date().toISOString()
  };
}

// =============================================================================
// REGULATORY COMPLIANCE METADATA
// =============================================================================

export const REGULATORY_COMPLIANCE_METADATA = {
  version: '1.0.0',
  lastUpdated: '2026-03-20',
  jurisdiction: 'Australia',
  applicableFrameworks: [
    'Australian Financial Services Licensing',
    'Anti-Money Laundering and Counter-Terrorism Financing',
    'Digital Assets Framework Bill 2025',
    'Income Tax Assessment Act 1997',
    'Corporations Act 2001'
  ],
  regulatoryBodies: ['ASIC', 'AUSTRAC', 'ATO', 'Treasury'],
  complianceRisk: 'Medium',
  reviewFrequency: 'Quarterly',
  nextMajorUpdate: '2025-07-01' // Digital Assets Framework effective date
};