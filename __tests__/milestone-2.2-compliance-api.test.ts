/**
 * Milestone 2.2: Compliance API Tests
 * Tests the External API Integration regulatory compliance endpoints
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../app/api/compliance/route';

describe('Milestone 2.2: Compliance API', () => {
  beforeEach(() => {
    // Clear any existing timers and use fake timers for consistent testing
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Helper function to create mock GET requests
  function createGetRequest(action: string, params?: Record<string, string>): NextRequest {
    const url = new URL(`http://localhost:3000/api/compliance`);
    url.searchParams.set('action', action);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return {
      url: url.toString(),
      method: 'GET',
      headers: {
        get: (name: string) => name === 'X-WREI-API-Key' ? null : null
      }
    } as NextRequest;
  }

  // Helper function to create mock POST requests
  function createPostRequest(body: any): NextRequest {
    return {
      url: 'http://localhost:3000/api/compliance',
      method: 'POST',
      headers: {
        get: (name: string) => name === 'X-WREI-API-Key' ? null : null
      },
      text: async () => JSON.stringify(body),
      json: async () => body
    } as NextRequest;
  }

  // Helper function to parse API response
  async function parseApiResponse(response: Response) {
    const json = await response.json();
    return { status: response.status, data: json };
  }

  describe('GET Compliance Endpoints', () => {
    test('GET status returns comprehensive compliance status', async () => {
      const request = createGetRequest('status');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.metadata.apiVersion).toBe('2.2.0');
      expect(data.metadata.source).toBe('WREI_COMPLIANCE_STATUS');

      // Validate compliance status structure
      const complianceData = data.data;
      expect(complianceData.complianceStatus).toBeDefined();
      expect(complianceData.jurisdiction).toBe('australia');
      expect(complianceData.framework).toBe('AUSTRAC_ASIC_APRA');
      expect(typeof complianceData.complianceScore).toBe('number');
      expect(complianceData.complianceScore).toBeGreaterThan(0);
      expect(complianceData.complianceScore).toBeLessThanOrEqual(100);
      expect(complianceData.lastAssessment).toBeDefined();
      expect(complianceData.nextReview).toBeDefined();
    });

    test('GET alerts returns sorted compliance alerts', async () => {
      const request = createGetRequest('alerts');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.alerts).toBeDefined();

      const alertsData = data.data;
      expect(Array.isArray(alertsData.alerts)).toBe(true);
      expect(typeof alertsData.alertCount).toBe('number');
      expect(typeof alertsData.criticalAlerts).toBe('number');
      expect(typeof alertsData.highPriorityAlerts).toBe('number');
      expect(alertsData.lastUpdated).toBeDefined();
      expect(alertsData.monitoringStatus).toBe('active');

      // Verify alerts are properly structured
      alertsData.alerts.forEach((alert: any) => {
        if (alert.priority) {
          expect(['critical', 'high', 'medium', 'low']).toContain(alert.priority);
        }
      });
    });

    test('GET regulatory_framework returns Australian framework details', async () => {
      const request = createGetRequest('regulatory_framework');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.framework).toBeDefined();
      expect(data.data.jurisdiction).toBe('australia');
      expect(data.data.effectiveDate).toBeDefined();
      expect(data.data.lastUpdated).toBeDefined();
      expect(Array.isArray(data.data.applicableRegulators)).toBe(true);
      expect(Array.isArray(data.data.keyLegislation)).toBe(true);

      // Check for key Australian regulators
      expect(data.data.applicableRegulators.some((reg: string) => reg.includes('ASIC'))).toBe(true);
      expect(data.data.applicableRegulators.some((reg: string) => reg.includes('AUSTRAC'))).toBe(true);
      expect(data.data.applicableRegulators.some((reg: string) => reg.includes('APRA'))).toBe(true);

      // Check for key legislation
      expect(data.data.keyLegislation.some((leg: string) => leg.includes('Corporations Act'))).toBe(true);
      expect(data.data.keyLegislation.some((leg: string) => leg.includes('Anti-Money Laundering'))).toBe(true);
    });

    test('GET digital_assets_framework returns DAF compliance assessment', async () => {
      const request = createGetRequest('digital_assets_framework');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.digitalAssetsFramework).toBeDefined();
      expect(data.data.status).toBeDefined();
      expect(data.data.effectiveDate).toBeDefined();
      expect(data.data.applicabilityAssessment).toBeDefined();

      const assessment = data.data.applicabilityAssessment;
      expect(Array.isArray(assessment.tokenTypes)).toBe(true);
      expect(assessment.tokenTypes).toContain('carbon_credits');
      expect(assessment.tokenTypes).toContain('asset_co');
      expect(assessment.tokenTypes).toContain('dual_portfolio');
      expect(typeof assessment.complianceRequired).toBe('boolean');
      expect(Array.isArray(assessment.exemptions)).toBe(true);
      expect(Array.isArray(assessment.additionalRequirements)).toBe(true);
    });
  });

  describe('POST Compliance Analysis Endpoints', () => {
    test('POST investor_classification assesses investor eligibility correctly', async () => {
      const request = createPostRequest({
        action: 'investor_classification',
        entityType: 'individual',
        netAssets: 5000000,
        grossIncome: 500000,
        professionalExperience: true
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_INVESTOR_CLASSIFIER');

      const result = data.data;
      expect(result.investorClassification).toBeDefined();
      expect(result.inputParameters.entityType).toBe('individual');
      expect(result.inputParameters.netAssets).toBe(5000000);
      expect(result.inputParameters.grossIncome).toBe(500000);
      expect(result.assessmentTimestamp).toBeDefined();
      expect(result.validityPeriod).toBe('12 months');
      expect(typeof result.reviewRequired).toBe('boolean');
    });

    test('POST afsl_check evaluates license requirements', async () => {
      const request = createPostRequest({
        action: 'afsl_check',
        productType: 'managed_investment_scheme',
        offeringStructure: 'public_offer',
        targetInvestors: 'retail',
        custodyArrangements: 'custodial_wallet'
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_AFSL_COMPLIANCE');

      const result = data.data;
      expect(result.afslCompliance).toBeDefined();
      expect(result.inputParameters.offeringStructure).toBe('public_offer');
      expect(result.inputParameters.jurisdiction).toBeDefined();
      expect(result.assessmentTimestamp).toBeDefined();
      expect(Array.isArray(result.recommendedActions)).toBe(true);
      expect(result.complianceValidity).toBe('6 months');
    });

    test('POST aml_check validates AML/CTF requirements', async () => {
      const request = createPostRequest({
        action: 'aml_check',
        customerType: 'individual',
        clientType: 'retail',
        riskRating: 'medium',
        transactionValue: 250000,
        jurisdictions: ['australia'],
        pepStatus: false
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_AML_COMPLIANCE');

      const result = data.data;
      expect(result.amlCompliance).toBeDefined();
      expect(result.inputParameters.customerType).toBe('individual');
      expect(result.inputParameters.transactionValue).toBe(250000);
      expect(result.riskAssessment).toBeDefined();
      expect(result.riskAssessment.overallRisk).toBeDefined();
      expect(typeof result.riskAssessment.mitigationRequired).toBe('boolean');
      expect(result.riskAssessment.monitoringLevel).toBeDefined();
      expect(result.assessmentTimestamp).toBeDefined();
      expect(result.complianceValidity).toBe('12 months');
    });

    test('POST environmental validates carbon credit compliance', async () => {
      const request = createPostRequest({
        action: 'environmental',
        creditType: 'forestry_avoidance',
        verificationStandard: 'VCS',
        dmrvTechnology: true,
        additionalStandards: ['Gold_Standard', 'CCB'],
        certificationLevel: 'premium'
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_ENVIRONMENTAL_COMPLIANCE');

      const result = data.data;
      expect(result.environmentalCompliance).toBeDefined();
      expect(result.inputParameters.creditType).toBe('forestry_avoidance');
      expect(result.inputParameters.verificationStandard).toBe('VCS');
      expect(result.inputParameters.dmrvTechnology).toBe(true);
      expect(result.verificationSummary).toBeDefined();
      expect(result.verificationSummary.primaryStandard).toBe('VCS');
      expect(Array.isArray(result.verificationSummary.additionalCertifications)).toBe(true);
      expect(result.verificationSummary.technologyEnhanced).toBe(true);
      expect(result.assessmentTimestamp).toBeDefined();
      expect(result.certificationValidity).toBe('24 months');
    });

    test('POST tokenization_standards verifies token standards compliance', async () => {
      const request = createPostRequest({
        action: 'tokenization_standards',
        tokenStandard: 'ERC-7518',
        metadataStandard: 'DyCIST',
        interoperability: ['ethereum', 'polygon', 'binance_smart_chain'],
        securityFeatures: ['multi_sig', 'time_locks', 'access_control'],
        auditTrail: true
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_TOKENIZATION_STANDARDS');

      const result = data.data;
      expect(result.tokenizationStandards).toBeDefined();
      expect(result.inputParameters.tokenStandard).toBe('ERC-7518');
      expect(result.inputParameters.metadataStandard).toBe('DyCIST');
      expect(result.standardsCompliance).toBeDefined();
      expect(result.standardsCompliance.primaryStandard).toBe('ERC-7518');
      expect(Array.isArray(result.standardsCompliance.interoperabilitySupport)).toBe(true);
      expect(result.standardsCompliance.securityLevel).toBeDefined();
      expect(result.assessmentTimestamp).toBeDefined();
      expect(result.complianceValidity).toBe('12 months');
    });

    test('POST full_report generates comprehensive compliance assessment', async () => {
      const request = createPostRequest({
        action: 'full_report',
        tokenType: 'carbon_credits',
        platform: 'WREI',
        frameworks: ['AUSTRAC', 'ASIC', 'APRA'],
        jurisdiction: 'australia',
        assessmentScope: 'comprehensive'
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_COMPLIANCE_REPORT');

      const result = data.data;
      expect(result.complianceReport).toBeDefined();
      expect(result.reportMetadata).toBeDefined();
      expect(result.reportMetadata.reportId).toMatch(/^WREI_COMPLIANCE_\d+$/);
      expect(result.reportMetadata.generatedAt).toBeDefined();
      expect(result.reportMetadata.reportType).toBe('comprehensive_compliance_assessment');
      expect(result.reportMetadata.jurisdiction).toBe('australia');
      expect(result.reportMetadata.scope).toBe('comprehensive');
      expect(result.executiveSummary).toBeDefined();
      expect(typeof result.executiveSummary.overallComplianceScore).toBe('number');
      expect(typeof result.executiveSummary.criticalIssues).toBe('number');
      expect(typeof result.executiveSummary.recommendations).toBe('number');
      expect(result.executiveSummary.nextReviewDate).toBeDefined();
      expect(result.reportValidity).toBe('6 months');
    });

    test('POST tax_treatment provides optimized tax structure advice', async () => {
      const request = createPostRequest({
        action: 'tax_treatment',
        tokenType: 'dual_portfolio',
        yieldMechanism: 'revenue_share',
        investorProfile: 'sophisticated',
        holdingPeriod: 18,
        jurisdiction: 'australia'
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_TAX_OPTIMIZATION');

      const result = data.data;
      expect(result.taxTreatment).toBeDefined();
      expect(result.inputParameters.tokenType).toBe('dual_portfolio');
      expect(result.inputParameters.yieldMechanism).toBe('revenue_share');
      expect(result.inputParameters.investorProfile).toBe('sophisticated');
      expect(result.optimizationSummary).toBeDefined();
      expect(result.optimizationSummary.recommendedStructure).toBeDefined();
      expect(typeof result.optimizationSummary.estimatedTaxRate).toBe('number');
      expect(typeof result.optimizationSummary.optimizationPotential).toBe('number');
      expect(result.assessmentTimestamp).toBeDefined();
      expect(result.adviceValidity).toBe('12 months');
    });
  });

  describe('Error Handling and Validation', () => {
    test('GET with invalid action returns 400 error', async () => {
      const request = createGetRequest('invalid_action');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action: invalid_action');
      expect(data.error).toContain('Valid actions:');
      expect(data.error).toContain('status');
      expect(data.error).toContain('alerts');
      expect(data.error).toContain('regulatory_framework');
      expect(data.error).toContain('digital_assets_framework');
      expect(data.metadata.apiVersion).toBe('2.2.0');
    });

    test('POST with invalid action returns 400 error', async () => {
      const request = createPostRequest({
        action: 'invalid_analysis',
        someParameter: 'value'
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action: invalid_analysis');
      expect(data.error).toContain('Valid actions:');
      expect(data.error).toContain('investor_classification');
      expect(data.error).toContain('afsl_check');
      expect(data.error).toContain('aml_check');
      expect(data.error).toContain('environmental');
      expect(data.error).toContain('tokenization_standards');
      expect(data.error).toContain('full_report');
      expect(data.error).toContain('tax_treatment');
    });

    test('POST with missing required fields returns validation errors', async () => {
      // Test investor_classification missing entityType
      const investorRequest = createPostRequest({
        action: 'investor_classification',
        netAssets: 1000000
        // Missing entityType
      });

      const investorResponse = await POST(investorRequest);
      const { status: investorStatus, data: investorData } = await parseApiResponse(investorResponse);

      expect(investorStatus).toBe(500);
      expect(investorData.success).toBe(false);
      expect(investorData.error).toContain('Missing required fields: entityType');

      // Test AFSL check missing offeringStructure
      const afslRequest = createPostRequest({
        action: 'afsl_check',
        productType: 'managed_investment_scheme'
        // Missing offeringStructure
      });

      const afslResponse = await POST(afslRequest);
      const { status: afslStatus, data: afslData } = await parseApiResponse(afslResponse);

      expect(afslStatus).toBe(500);
      expect(afslData.success).toBe(false);
      expect(afslData.error).toContain('Missing required fields: offeringStructure');

      // Test AML check missing customerType
      const amlRequest = createPostRequest({
        action: 'aml_check',
        riskRating: 'medium'
        // Missing customerType
      });

      const amlResponse = await POST(amlRequest);
      const { status: amlStatus, data: amlData } = await parseApiResponse(amlResponse);

      expect(amlStatus).toBe(500);
      expect(amlData.success).toBe(false);
      expect(amlData.error).toContain('Missing required fields: customerType');

      // Test environmental compliance missing required fields
      const envRequest = createPostRequest({
        action: 'environmental',
        creditType: 'forestry_avoidance'
        // Missing verificationStandard
      });

      const envResponse = await POST(envRequest);
      const { status: envStatus, data: envData } = await parseApiResponse(envResponse);

      expect(envStatus).toBe(500);
      expect(envData.success).toBe(false);
      expect(envData.error).toContain('Missing required fields: verificationStandard');

      // Test tokenization standards missing required fields
      const tokenRequest = createPostRequest({
        action: 'tokenization_standards',
        tokenStandard: 'ERC-7518'
        // Missing metadataStandard
      });

      const tokenResponse = await POST(tokenRequest);
      const { status: tokenStatus, data: tokenData } = await parseApiResponse(tokenResponse);

      expect(tokenStatus).toBe(500);
      expect(tokenData.success).toBe(false);
      expect(tokenData.error).toContain('Missing required fields: metadataStandard');

      // Test tax treatment missing required fields
      const taxRequest = createPostRequest({
        action: 'tax_treatment',
        tokenType: 'carbon_credits'
        // Missing yieldMechanism and investorProfile
      });

      const taxResponse = await POST(taxRequest);
      const { status: taxStatus, data: taxData } = await parseApiResponse(taxResponse);

      expect(taxStatus).toBe(500);
      expect(taxData.success).toBe(false);
      expect(taxData.error).toContain('Missing required fields: yieldMechanism, investorProfile');
    });

    test('POST with invalid parameter types returns validation errors', async () => {
      // Test invalid numeric types for investor classification
      const invalidTypesRequest = createPostRequest({
        action: 'investor_classification',
        entityType: 'individual',
        netAssets: 'not_a_number',
        grossIncome: 'also_not_a_number'
      });

      const invalidTypesResponse = await POST(invalidTypesRequest);
      const { status, data } = await parseApiResponse(invalidTypesResponse);

      expect(status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('netAssets must be a number');

      // Test invalid token type for tax treatment
      const invalidTokenRequest = createPostRequest({
        action: 'tax_treatment',
        tokenType: 'invalid_token_type',
        yieldMechanism: 'revenue_share',
        investorProfile: 'sophisticated'
      });

      const invalidTokenResponse = await POST(invalidTokenRequest);
      const { status: tokenStatus, data: tokenData } = await parseApiResponse(invalidTokenResponse);

      expect(tokenStatus).toBe(500);
      expect(tokenData.success).toBe(false);
      expect(tokenData.error).toContain('tokenType must be one of: carbon_credits, asset_co, dual_portfolio');

      // Test invalid yield mechanism for tax treatment
      const invalidYieldRequest = createPostRequest({
        action: 'tax_treatment',
        tokenType: 'carbon_credits',
        yieldMechanism: 'invalid_mechanism',
        investorProfile: 'sophisticated'
      });

      const invalidYieldResponse = await POST(invalidYieldRequest);
      const { status: yieldStatus, data: yieldData } = await parseApiResponse(invalidYieldResponse);

      expect(yieldStatus).toBe(500);
      expect(yieldData.success).toBe(false);
      expect(yieldData.error).toContain('yieldMechanism must be one of: revenue_share, nav_accruing');

      // Test invalid transaction value for AML check
      const invalidTransactionRequest = createPostRequest({
        action: 'aml_check',
        customerType: 'individual',
        transactionValue: -50000 // Negative value
      });

      const invalidTransactionResponse = await POST(invalidTransactionRequest);
      const { status: transactionStatus, data: transactionData } = await parseApiResponse(invalidTransactionResponse);

      expect(transactionStatus).toBe(500);
      expect(transactionData.success).toBe(false);
      expect(transactionData.error).toContain('investmentAmount must be between');
    });

    test('GET without required action parameter returns error', async () => {
      const url = new URL('http://localhost:3000/api/compliance');
      // Don't set action parameter
      const request = {
        url: url.toString(),
        method: 'GET',
        headers: {
          get: (name: string) => name === 'X-WREI-API-Key' ? null : null
        }
      } as NextRequest;

      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required query parameter: action');
    });

    test('POST with malformed JSON returns error', async () => {
      const malformedJsonRequest = {
        url: 'http://localhost:3000/api/compliance',
        method: 'POST',
        headers: {
          get: (name: string) => name === 'X-WREI-API-Key' ? null : null
        },
        text: async () => '{ invalid json }'
      } as NextRequest;

      const malformedJsonResponse = await POST(malformedJsonRequest);
      const { status: malformedJsonStatus, data: malformedJsonData } = await parseApiResponse(malformedJsonResponse);

      expect(malformedJsonStatus).toBe(500);
      expect(malformedJsonData.success).toBe(false);
      expect(malformedJsonData.error).toContain('Invalid JSON in request body');
    });
  });
});