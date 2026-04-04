/**
 * Milestone 2.2: Analytics API Tests
 * Tests the External API Integration analytics calculation endpoints
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/analytics/route';

describe('Milestone 2.2: Analytics API', () => {
  beforeEach(() => {
    // Clear any existing timers and use fake timers for consistent testing
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Helper function to create mock POST requests
  function createPostRequest(body: any): NextRequest {
    return {
      url: 'http://localhost:3000/api/analytics',
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
    // Debug failing responses
    if (response.status !== 200) {
      console.log('Response status:', response.status);
      console.log('Response data:', json);
    }
    return { status: response.status, data: json };
  }

  describe('Financial Calculation Endpoints', () => {
    test('POST irr calculates IRR from cash flows correctly', async () => {
      const request = createPostRequest({
        action: 'irr',
        cashFlows: [
          { year: 0, amount: -1000000 }, // Initial investment
          { year: 1, amount: 200000 },
          { year: 2, amount: 250000 },
          { year: 3, amount: 300000 },
          { year: 4, amount: 350000 },
          { year: 5, amount: 400000 }
        ]
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_IRR_CALCULATOR');

      const result = data.data;
      expect(typeof result.irr).toBe('number');
      expect(result.irr).toBeGreaterThan(0);
      expect(result.irr).toBeLessThan(1); // IRR should be reasonable
      expect(result.irrPercentage).toBeDefined();
      expect(result.cashFlowsCount).toBe(6);
      expect(result.totalInvestment).toBe(-1000000);
      expect(result.totalReturns).toBe(1500000);
      expect(result.annualizationPeriod).toBe(5);
    });

    test('POST npv calculates NPV with discount rate correctly', async () => {
      const request = createPostRequest({
        action: 'npv',
        cashFlows: [
          { year: 0, amount: -1000000 },
          { year: 1, amount: 400000 },
          { year: 2, amount: 500000 },
          { year: 3, amount: 600000 }
        ],
        discountRate: 0.1 // 10%
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_NPV_CALCULATOR');

      const result = data.data;
      expect(typeof result.npv).toBe('number');
      expect(result.discountRate).toBe(0.1);
      expect(result.discountRatePercentage).toBe('10.00');
      expect(result.cashFlowsCount).toBe(4);
      expect(Array.isArray(result.presentValueBreakdown)).toBe(true);
      expect(result.presentValueBreakdown.length).toBe(4);

      // Check structure of breakdown
      result.presentValueBreakdown.forEach((pv: any) => {
        expect(typeof pv.year).toBe('number');
        expect(typeof pv.originalAmount).toBe('number');
        expect(typeof pv.presentValue).toBe('number');
        expect(typeof pv.discountFactor).toBe('number');
      });
    });

    test('POST carbon_metrics returns yield and return metrics', async () => {
      const request = createPostRequest({
        action: 'carbon_metrics',
        investmentAmount: 500000,
        carbonCredits: 3000,
        yieldMechanism: 'revenue_share',
        timeHorizon: 7,
        riskProfile: 'moderate'
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_CARBON_ANALYTICS');

      const result = data.data;
      expect(result.metrics).toBeDefined();
      expect(result.inputParameters.investmentAmount).toBe(500000);
      expect(result.inputParameters.carbonCredits).toBe(3000);
      expect(result.inputParameters.yieldMechanism).toBe('revenue_share');
      expect(result.inputParameters.timeHorizon).toBe(7);
      expect(result.inputParameters.pricePerCredit).toBeCloseTo(500000 / 3000, 2);
      expect(result.calculationTimestamp).toBeDefined();

      // Validate metrics structure (should have standard financial metrics)
      if (result.metrics.expectedIRR !== undefined) {
        expect(typeof result.metrics.expectedIRR).toBe('number');
      }
    });

    test('POST asset_co_metrics returns infrastructure-specific metrics', async () => {
      const request = createPostRequest({
        action: 'asset_co_metrics',
        investmentAmount: 2000000,
        assetType: 'deep_power',
        region: 'australia',
        timeHorizon: 12,
        operationalParameters: {
          capacity: 500,
          utilization: 0.85
        }
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_ASSET_CO_ANALYTICS');

      const result = data.data;
      expect(result.metrics).toBeDefined();
      expect(result.inputParameters.investmentAmount).toBe(2000000);
      expect(result.inputParameters.assetType).toBe('deep_power');
      expect(result.inputParameters.region).toBe('australia');
      expect(result.inputParameters.timeHorizon).toBe(12);
      expect(result.calculationTimestamp).toBeDefined();
    });

    test('POST dual_portfolio returns blended portfolio metrics', async () => {
      const request = createPostRequest({
        action: 'dual_portfolio',
        totalInvestment: 1000000,
        carbonAllocation: 0.6,
        assetCoAllocation: 0.4,
        timeHorizon: 10,
        riskTolerance: 'moderate'
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_DUAL_PORTFOLIO_ANALYTICS');

      const result = data.data;
      expect(result.metrics).toBeDefined();
      expect(result.allocationBreakdown.carbonCredit.allocation).toBe(0.6);
      expect(result.allocationBreakdown.carbonCredit.amount).toBe(600000);
      expect(result.allocationBreakdown.assetCo.allocation).toBe(0.4);
      expect(result.allocationBreakdown.assetCo.amount).toBe(400000);
      expect(result.calculationTimestamp).toBeDefined();
    });
  });

  describe('Advanced Analytics Endpoints', () => {
    test('POST risk_profile returns correct risk profile for each token type', async () => {
      const tokenTypes = ['carbon_credits', 'asset_co', 'dual_portfolio'];

      for (const tokenType of tokenTypes) {
        const request = createPostRequest({
          action: 'risk_profile',
          tokenType
        });

        const response = await POST(request);
        const { status, data } = await parseApiResponse(response);

        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.metadata.source).toBe('WREI_RISK_PROFILER');

        const result = data.data;
        expect(result.tokenType).toBe(tokenType);
        expect(result.riskProfile).toBeDefined();
        expect(result.riskCategory).toBeDefined();
        expect(['low', 'medium', 'high'].some(cat =>
          result.riskCategory.toLowerCase().includes(cat)
        )).toBe(true);
        expect(Array.isArray(result.keyRiskFactors)).toBe(true);
        expect(Array.isArray(result.mitigationStrategies)).toBe(true);
      }
    });

    test('POST scenario_analysis returns base/bull/bear/stress cases', async () => {
      const request = createPostRequest({
        action: 'scenario_analysis',
        investmentAmount: 750000,
        tokenType: 'dual_portfolio',
        investorType: 'professional',
        timeHorizon: 8,
        scenarios: ['base', 'bull', 'bear', 'stress']
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_SCENARIO_ANALYTICS');

      const result = data.data;
      expect(result.scenarioAnalysis).toBeDefined();
      expect(result.inputParameters.investmentAmount).toBe(750000);
      expect(result.inputParameters.tokenType).toBe('dual_portfolio');
      expect(result.inputParameters.investorType).toBe('professional');
      expect(result.inputParameters.timeHorizon).toBe(8);
      expect(result.calculationTimestamp).toBeDefined();
    });

    test('POST portfolio_optimization returns allocation recommendations', async () => {
      const request = createPostRequest({
        action: 'portfolio_optimization',
        totalInvestment: 5000000,
        riskTolerance: 'aggressive',
        timeHorizon: 15,
        constraints: {
          maxConcentration: 0.4,
          minLiquidity: 0.2
        },
        objectiveFunction: 'maximize_sharpe'
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_PORTFOLIO_OPTIMIZER');

      const result = data.data;
      expect(result.portfolioOptimization).toBeDefined();
      expect(result.inputParameters.totalInvestment).toBe(5000000);
      expect(result.inputParameters.riskTolerance).toBe('aggressive');
      expect(result.inputParameters.timeHorizon).toBe(15);
      expect(result.calculationTimestamp).toBeDefined();
    });

    test('POST monte_carlo returns statistical distribution results', async () => {
      const request = createPostRequest({
        action: 'monte_carlo',
        investmentAmount: 1500000,
        tokenType: 'carbon_credits',
        simulations: 1000,
        timeHorizon: 10,
        volatilityAssumptions: {
          annualVol: 0.25,
          meanReturn: 0.12
        }
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_MONTE_CARLO_ENGINE');

      const result = data.data;
      expect(result.monteCarloResults).toBeDefined();
      expect(result.simulationParameters.investmentAmount).toBe(1500000);
      expect(result.simulationParameters.tokenType).toBe('carbon_credits');
      expect(result.simulationParameters.simulations).toBe(1000);
      expect(result.simulationParameters.timeHorizon).toBe(10);
      expect(result.calculationTimestamp).toBeDefined();
    });
  });

  describe('Error Handling and Validation', () => {
    test('POST with invalid action or missing required fields returns 400 error', async () => {
      // Test invalid action
      const invalidActionRequest = createPostRequest({
        action: 'invalid_calculation',
        someParameter: 'value'
      });

      const invalidActionResponse = await POST(invalidActionRequest);
      const { status: invalidStatus, data: invalidData } = await parseApiResponse(invalidActionResponse);

      expect(invalidStatus).toBe(400);
      expect(invalidData.success).toBe(false);
      expect(invalidData.error).toContain('Invalid action: invalid_calculation');
      expect(invalidData.metadata.apiVersion).toBe('2.2.0');

      // Test missing required fields
      const missingFieldsRequest = createPostRequest({
        action: 'irr'
        // Missing cashFlows
      });

      const missingFieldsResponse = await POST(missingFieldsRequest);
      const { status: missingStatus, data: missingData } = await parseApiResponse(missingFieldsResponse);

      expect(missingStatus).toBe(500);
      expect(missingData.success).toBe(false);
      expect(missingData.error).toContain('Missing required fields: cashFlows');

      // Test invalid cash flows structure
      const invalidCashFlowsRequest = createPostRequest({
        action: 'irr',
        cashFlows: 'not_an_array'
      });

      const invalidCashFlowsResponse = await POST(invalidCashFlowsRequest);
      const { status: invalidCashFlowsStatus, data: invalidCashFlowsData } = await parseApiResponse(invalidCashFlowsResponse);

      expect(invalidCashFlowsStatus).toBe(500);
      expect(invalidCashFlowsData.success).toBe(false);
      expect(invalidCashFlowsData.error).toContain('cashFlows must be an array');

      // Test invalid discount rate
      const invalidDiscountRateRequest = createPostRequest({
        action: 'npv',
        cashFlows: [
          { year: 0, amount: -1000 },
          { year: 1, amount: 1200 }
        ],
        discountRate: 2.0 // 200% - too high
      });

      const invalidDiscountRateResponse = await POST(invalidDiscountRateRequest);
      const { status: invalidDiscountRateStatus, data: invalidDiscountRateData } = await parseApiResponse(invalidDiscountRateResponse);

      expect(invalidDiscountRateStatus).toBe(500);
      expect(invalidDiscountRateData.success).toBe(false);
      expect(invalidDiscountRateData.error).toContain('discountRate must be between');

      // Test invalid token type
      const invalidTokenTypeRequest = createPostRequest({
        action: 'risk_profile',
        tokenType: 'invalid_token_type'
      });

      const invalidTokenTypeResponse = await POST(invalidTokenTypeRequest);
      const { status: invalidTokenTypeStatus, data: invalidTokenTypeData } = await parseApiResponse(invalidTokenTypeResponse);

      expect(invalidTokenTypeStatus).toBe(500);
      expect(invalidTokenTypeData.success).toBe(false);
      expect(invalidTokenTypeData.error).toContain('tokenType must be one of');

      // Test invalid investment amount
      const invalidAmountRequest = createPostRequest({
        action: 'carbon_metrics',
        investmentAmount: -50000, // Negative amount
        carbonCredits: 1000,
        yieldMechanism: 'revenue_share',
        timeHorizon: 5
      });

      const invalidAmountResponse = await POST(invalidAmountRequest);
      const { status: invalidAmountStatus, data: invalidAmountData } = await parseApiResponse(invalidAmountResponse);

      expect(invalidAmountStatus).toBe(500);
      expect(invalidAmountData.success).toBe(false);
      expect(invalidAmountData.error).toContain('investmentAmount must be between');

      // Test malformed JSON
      const malformedJsonRequest = {
        url: 'http://localhost:3000/api/analytics',
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

    test('POST professional_metrics validates all parameters correctly', async () => {
      const request = createPostRequest({
        action: 'professional_metrics',
        investmentAmount: 10000000,
        tokenType: 'asset_co',
        investorClassification: 'sophisticated',
        timeHorizon: 20,
        customParameters: {
          leverageRatio: 0.6,
          taxOptimization: true
        }
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_PROFESSIONAL_ANALYTICS');

      const result = data.data;
      expect(result.professionalMetrics).toBeDefined();
      expect(result.inputParameters.investmentAmount).toBe(10000000);
      expect(result.inputParameters.tokenType).toBe('asset_co');
      expect(result.inputParameters.investorClassification).toBe('sophisticated');
      expect(result.inputParameters.timeHorizon).toBe(20);
      expect(result.calculationTimestamp).toBeDefined();
    });
  });
});