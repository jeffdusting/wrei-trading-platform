/**
 * WREI Compliance Reporting API
 *
 * Automated regulatory reporting and compliance monitoring for institutional clients.
 * Part of Milestone 2.2: External API Integration
 */

import { NextRequest } from 'next/server';
import {
  validateApiKey,
  checkRateLimit,
  apiResponse,
  apiError,
  parseJsonBody,
  getQueryParam,
  validateRequiredFields,
  validateInvestmentAmount,
  validateTokenType,
  validateAndSanitiseText,
  logApiRequest,
  logApiError
} from '@/lib/api-helpers';

// Import compliance and regulatory functions
import {
  assessOverallCompliance,
  getComplianceAlerts,
  validateInvestorClassification,
  checkAFSLCompliance,
  validateAMLRequirements,
  generateComplianceReport,
  getOptimalTaxTreatment,
  assessEnvironmentalCompliance,
  verifyTokenizationStandards,
  assessDigitalAssetsFrameworkCompliance,
  AUSTRALIAN_REGULATORY_FRAMEWORK
} from '@/lib/regulatory-compliance';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let action = 'unknown';
  let requestId = '';

  try {
    // Extract action from query parameters
    action = getQueryParam(request, 'action', true) || 'unknown';
    requestId = `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Validate API key
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      logApiError('/api/compliance', action, requestId, authResult.error);
      return apiError(authResult.error || 'Authentication failed', 401);
    }

    // Check rate limiting
    const apiKey = request.headers.get('X-WREI-API-Key') || 'anonymous';
    if (!checkRateLimit(apiKey, 100, 60000)) {
      logApiError('/api/compliance', action, requestId, 'Rate limit exceeded');
      return apiError('Rate limit exceeded. Maximum 100 requests per minute.', 429);
    }

    // Route to appropriate handler based on action
    let result;
    let source = 'WREI_COMPLIANCE_ENGINE';

    switch (action) {
      case 'status':
        result = await handleComplianceStatus();
        source = 'WREI_COMPLIANCE_STATUS';
        break;

      case 'alerts':
        result = await handleComplianceAlerts();
        source = 'WREI_COMPLIANCE_ALERTS';
        break;

      case 'regulatory_framework':
        result = await handleRegulatoryFramework();
        source = 'WREI_REGULATORY_FRAMEWORK';
        break;

      case 'digital_assets_framework':
        result = await handleDigitalAssetsFramework();
        source = 'WREI_DAF_COMPLIANCE';
        break;

      default:
        logApiError('/api/compliance', action, requestId, 'Invalid action');
        return apiError(
          `Invalid action: ${action}. Valid actions: status, alerts, regulatory_framework, digital_assets_framework`,
          400
        );
    }

    const processingTime = Date.now() - startTime;
    logApiRequest('GET', '/api/compliance', action, requestId, true, processingTime);

    return apiResponse(result, {
      source,
      requestId
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logApiError('/api/compliance', action, requestId, error);
    logApiRequest('GET', '/api/compliance', action, requestId, false, processingTime);

    return apiError(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let action = 'unknown';
  let requestId = '';

  try {
    // Extract action from request body
    const body = await parseJsonBody(request);
    action = body.action || 'unknown';
    requestId = `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Validate API key
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      logApiError('/api/compliance', action, requestId, authResult.error);
      return apiError(authResult.error || 'Authentication failed', 401);
    }

    // Check rate limiting
    const apiKey = request.headers.get('X-WREI-API-Key') || 'anonymous';
    if (!checkRateLimit(apiKey, 100, 60000)) {
      logApiError('/api/compliance', action, requestId, 'Rate limit exceeded');
      return apiError('Rate limit exceeded. Maximum 100 requests per minute.', 429);
    }

    // Route to appropriate handler based on action
    let result;
    let source = 'WREI_COMPLIANCE_ENGINE';

    switch (action) {
      case 'investor_classification':
        result = await handleInvestorClassification(body);
        source = 'WREI_INVESTOR_CLASSIFIER';
        break;

      case 'afsl_check':
        result = await handleAFSLCheck(body);
        source = 'WREI_AFSL_COMPLIANCE';
        break;

      case 'aml_check':
        result = await handleAMLCheck(body);
        source = 'WREI_AML_COMPLIANCE';
        break;

      case 'environmental':
        result = await handleEnvironmentalCompliance(body);
        source = 'WREI_ENVIRONMENTAL_COMPLIANCE';
        break;

      case 'tokenization_standards':
        result = await handleTokenizationStandards(body);
        source = 'WREI_TOKENIZATION_STANDARDS';
        break;

      case 'full_report':
        result = await handleFullReport(body);
        source = 'WREI_COMPLIANCE_REPORT';
        break;

      case 'tax_treatment':
        result = await handleTaxTreatment(body);
        source = 'WREI_TAX_OPTIMIZATION';
        break;

      default:
        logApiError('/api/compliance', action, requestId, 'Invalid action');
        return apiError(
          `Invalid action: ${action}. Valid actions: investor_classification, afsl_check, aml_check, environmental, tokenization_standards, full_report, tax_treatment`,
          400
        );
    }

    const processingTime = Date.now() - startTime;
    logApiRequest('POST', '/api/compliance', action, requestId, true, processingTime);

    return apiResponse(result, {
      source,
      requestId
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logApiError('/api/compliance', action, requestId, error);
    logApiRequest('POST', '/api/compliance', action, requestId, false, processingTime);

    return apiError(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

// =============================================================================
// GET ACTION HANDLERS
// =============================================================================

/**
 * Handle compliance status inquiry
 */
async function handleComplianceStatus() {
  const overallCompliance = assessOverallCompliance();

  return {
    complianceStatus: overallCompliance,
    timestamp: new Date().toISOString(),
    jurisdiction: 'australia',
    framework: 'AUSTRAC_ASIC_APRA',
    complianceScore: overallCompliance.overallScore || 85,
    lastAssessment: new Date().toISOString(),
    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
  };
}

/**
 * Handle compliance alerts retrieval
 */
async function handleComplianceAlerts() {
  const alerts = getComplianceAlerts();

  // Sort alerts by priority and timestamp
  const sortedAlerts = Array.isArray(alerts) ? alerts.sort((a, b) => {
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;

    if (aPriority !== bPriority) return aPriority - bPriority;

    return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
  }) : [];

  return {
    alerts: sortedAlerts,
    alertCount: sortedAlerts.length,
    criticalAlerts: sortedAlerts.filter(alert => alert.priority === 'critical').length,
    highPriorityAlerts: sortedAlerts.filter(alert => alert.priority === 'high').length,
    lastUpdated: new Date().toISOString(),
    monitoringStatus: 'active'
  };
}

/**
 * Handle regulatory framework information
 */
async function handleRegulatoryFramework() {
  return {
    framework: AUSTRALIAN_REGULATORY_FRAMEWORK,
    jurisdiction: 'australia',
    effectiveDate: '2024-01-01',
    lastUpdated: new Date().toISOString(),
    applicableRegulators: [
      'Australian Securities and Investments Commission (ASIC)',
      'Australian Prudential Regulation Authority (APRA)',
      'Australian Transaction Reports and Analysis Centre (AUSTRAC)',
      'Reserve Bank of Australia (RBA)'
    ],
    keyLegislation: [
      'Corporations Act 2001',
      'Anti-Money Laundering and Counter-Terrorism Financing Act 2006',
      'Banking Act 1959',
      'Financial Sector (Collection of Data) Act 2001',
      'Privacy Act 1988'
    ]
  };
}

/**
 * Handle Digital Assets Framework compliance
 */
async function handleDigitalAssetsFramework() {
  const dafCompliance = assessDigitalAssetsFrameworkCompliance();

  return {
    digitalAssetsFramework: dafCompliance,
    status: dafCompliance.status || 'in_force',
    effectiveDate: dafCompliance.effectiveDate || '2024-01-01',
    applicabilityAssessment: {
      tokenTypes: ['carbon_credits', 'asset_co', 'dual_portfolio'],
      complianceRequired: true,
      exemptions: [],
      additionalRequirements: [
        'Digital asset service provider licensing',
        'Custody and operational risk management',
        'Market conduct and disclosure obligations'
      ]
    },
    timestamp: new Date().toISOString()
  };
}

// =============================================================================
// POST ACTION HANDLERS
// =============================================================================

/**
 * Handle investor classification assessment
 */
async function handleInvestorClassification(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['entityType']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate parameters
  if (body.netAssets !== undefined && typeof body.netAssets !== 'number') {
    throw new Error('netAssets must be a number');
  }

  if (body.grossIncome !== undefined && typeof body.grossIncome !== 'number') {
    throw new Error('grossIncome must be a number');
  }

  if (body.aum !== undefined && typeof body.aum !== 'number') {
    throw new Error('aum must be a number');
  }

  const result = validateInvestorClassification({
    entityType: body.entityType,
    netAssets: body.netAssets,
    grossIncome: body.grossIncome,
    aum: body.aum,
    professionalExperience: body.professionalExperience,
    jurisdictions: body.jurisdictions,
    investmentAmount: body.investmentAmount
  });

  return {
    investorClassification: result,
    inputParameters: {
      entityType: body.entityType,
      netAssets: body.netAssets,
      grossIncome: body.grossIncome,
      aum: body.aum
    },
    assessmentTimestamp: new Date().toISOString(),
    validityPeriod: '12 months',
    reviewRequired: false
  };
}

/**
 * Handle AFSL compliance check
 */
async function handleAFSLCheck(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['offeringStructure']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Convert targetInvestors to array if it's a string
  const targetInvestors = Array.isArray(body.targetInvestors)
    ? body.targetInvestors
    : body.targetInvestors
      ? [body.targetInvestors]
      : undefined;

  const result = checkAFSLCompliance({
    productType: body.productType,
    offeringStructure: body.offeringStructure,
    targetInvestors,
    custodyArrangements: body.custodyArrangements,
    licenseDetails: body.licenseDetails,
    investorBase: body.investorBase,
    financialServices: body.financialServices,
    jurisdiction: body.jurisdiction || 'australia'
  });

  return {
    afslCompliance: result,
    inputParameters: {
      offeringStructure: body.offeringStructure,
      jurisdiction: body.jurisdiction || 'australia'
    },
    assessmentTimestamp: new Date().toISOString(),
    recommendedActions: result.complianceStatus === 'license_required'
      ? ['Apply for AFSL license', 'Engage compliance consultant', 'Implement risk management framework']
      : [],
    complianceValidity: '6 months'
  };
}

/**
 * Handle AML/CTF compliance check
 */
async function handleAMLCheck(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['customerType']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate transaction value if provided
  if (body.transactionValue !== undefined) {
    const amountError = validateInvestmentAmount(body.transactionValue, 1, 1_000_000_000_000);
    if (amountError) throw new Error(amountError);
  }

  const result = validateAMLRequirements({
    customerType: body.customerType,
    clientType: body.clientType,
    riskRating: body.riskRating,
    jurisdictions: body.jurisdictions,
    transactionValue: body.transactionValue,
    businessPurpose: body.businessPurpose,
    pepStatus: body.pepStatus,
    sanctionsScreening: body.sanctionsScreening,
    ongoingMonitoring: body.ongoingMonitoring,
    ultimateBeneficialOwner: body.ultimateBeneficialOwner
  });

  return {
    amlCompliance: result,
    inputParameters: {
      customerType: body.customerType,
      transactionValue: body.transactionValue,
      jurisdictions: body.jurisdictions
    },
    riskAssessment: {
      overallRisk: result.riskRating || 'medium',
      mitigationRequired: result.eddRequired || false,
      monitoringLevel: result.monitoringLevel || 'standard'
    },
    assessmentTimestamp: new Date().toISOString(),
    complianceValidity: '12 months'
  };
}

/**
 * Handle environmental compliance assessment
 */
async function handleEnvironmentalCompliance(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['creditType', 'verificationStandard']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate and sanitise text inputs
  const { sanitised: creditType, error: creditError } = validateAndSanitiseText(body.creditType, 100, 'creditType');
  if (creditError) throw new Error(creditError);

  const { sanitised: verificationStandard, error: verificationError } = validateAndSanitiseText(body.verificationStandard, 100, 'verificationStandard');
  if (verificationError) throw new Error(verificationError);

  const result = assessEnvironmentalCompliance({
    creditType,
    verificationStandard,
    dmrvTechnology: body.dmrvTechnology || false,
    additionalStandards: body.additionalStandards || [],
    certificationLevel: body.certificationLevel || 'standard'
  });

  return {
    environmentalCompliance: result,
    inputParameters: {
      creditType, // This is now the sanitised string, not the object
      verificationStandard, // This is now the sanitised string, not the object
      dmrvTechnology: body.dmrvTechnology
    },
    verificationSummary: {
      primaryStandard: verificationStandard,
      additionalCertifications: body.additionalStandards || [],
      technologyEnhanced: body.dmrvTechnology || false
    },
    assessmentTimestamp: new Date().toISOString(),
    certificationValidity: '24 months'
  };
}

/**
 * Handle tokenization standards verification
 */
async function handleTokenizationStandards(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['tokenStandard', 'metadataStandard']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const result = verifyTokenizationStandards({
    tokenStandard: body.tokenStandard,
    metadataStandard: body.metadataStandard,
    interoperability: body.interoperability || [],
    securityFeatures: body.securityFeatures || [],
    auditTrail: body.auditTrail || true
  });

  return {
    tokenizationStandards: result,
    inputParameters: {
      tokenStandard: body.tokenStandard,
      metadataStandard: body.metadataStandard
    },
    standardsCompliance: {
      primaryStandard: body.tokenStandard,
      interoperabilitySupport: body.interoperability || [],
      securityLevel: result.securityAssessment || 'standard'
    },
    assessmentTimestamp: new Date().toISOString(),
    complianceValidity: '12 months'
  };
}

/**
 * Handle comprehensive compliance report generation
 */
async function handleFullReport(body: any) {
  const result = generateComplianceReport({
    tokenType: body.tokenType,
    platform: body.platform || 'WREI',
    frameworks: body.frameworks || ['AUSTRAC', 'ASIC', 'APRA'],
    jurisdiction: body.jurisdiction || 'australia',
    assessmentScope: body.assessmentScope || 'comprehensive'
  });

  return {
    complianceReport: result,
    reportMetadata: {
      reportId: `WREI_COMPLIANCE_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      reportType: 'comprehensive_compliance_assessment',
      jurisdiction: body.jurisdiction || 'australia',
      scope: body.assessmentScope || 'comprehensive'
    },
    executiveSummary: {
      overallComplianceScore: result.overallScore || 85,
      criticalIssues: result.criticalIssues || 0,
      recommendations: result.recommendations?.length || 0,
      nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months
    },
    reportValidity: '6 months'
  };
}

/**
 * Handle tax treatment optimization
 */
async function handleTaxTreatment(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['tokenType', 'yieldMechanism', 'investorProfile']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate token type
  if (!validateTokenType(body.tokenType)) {
    throw new Error('tokenType must be one of: carbon_credits, asset_co, dual_portfolio');
  }

  const validYieldMechanisms = ['revenue_share', 'nav_accruing'];
  if (!validYieldMechanisms.includes(body.yieldMechanism)) {
    throw new Error('yieldMechanism must be one of: revenue_share, nav_accruing');
  }

  // Construct investorProfile object with required fields
  const investorProfile = {
    classification: typeof body.investorProfile === 'string' ? body.investorProfile : body.investorProfile?.classification || 'retail',
    jurisdiction: body.jurisdiction || 'australia',
    taxResident: body.investorProfile?.taxResident !== false, // Default to true
    marginalRate: body.investorProfile?.marginalRate
  };

  const result = getOptimalTaxTreatment(
    body.tokenType,
    body.yieldMechanism,
    investorProfile
  );

  return {
    taxTreatment: result,
    inputParameters: {
      tokenType: body.tokenType,
      yieldMechanism: body.yieldMechanism,
      investorProfile: body.investorProfile
    },
    optimizationSummary: {
      recommendedStructure: result.classification || 'capital_gains',
      estimatedTaxRate: result.rates?.individualRate || 0.3,
      optimizationPotential: result.optimizationStrategies?.length || 0
    },
    assessmentTimestamp: new Date().toISOString(),
    adviceValidity: '12 months'
  };
}