/**
 * API Documentation Tests
 *
 * Tests for the structured API documentation system (Enhancement C3).
 * Validates all 6 API endpoints are documented, example payloads are valid JSON,
 * and documentation structure is complete and consistent.
 */

import {
  allEndpoints,
  apiCategories,
  getEndpointsByCategory,
  getEndpointById,
  getEndpointActions,
  getEndpointCount,
  getTotalActionCount,
  validateExamplePayloads,
  generateCodeExamples,
  type ApiEndpoint,
  type ApiCategory,
} from '@/lib/api-documentation';

describe('API Documentation System', () => {
  describe('Endpoint Coverage', () => {
    test('documents all 6 API endpoint paths', () => {
      const documentedPaths = new Set(allEndpoints.map((ep) => ep.path));

      expect(documentedPaths).toContain('/api/negotiate');
      expect(documentedPaths).toContain('/api/analytics');
      expect(documentedPaths).toContain('/api/compliance');
      expect(documentedPaths).toContain('/api/market-data');
      expect(documentedPaths).toContain('/api/metadata');
      expect(documentedPaths).toContain('/api/performance');
    });

    test('has at least 9 endpoint definitions (some paths have multiple methods)', () => {
      expect(allEndpoints.length).toBeGreaterThanOrEqual(9);
    });

    test('getEndpointCount returns correct count', () => {
      expect(getEndpointCount()).toBe(allEndpoints.length);
    });

    test('getTotalActionCount returns sum of all actions', () => {
      const manualCount = allEndpoints.reduce(
        (sum, ep) => sum + ep.actions.length,
        0
      );
      expect(getTotalActionCount()).toBe(manualCount);
      expect(getTotalActionCount()).toBeGreaterThan(0);
    });
  });

  describe('Endpoint Structure', () => {
    test.each(allEndpoints.map((ep) => [ep.id, ep]))(
      'endpoint "%s" has all required fields',
      (_id, endpoint) => {
        const ep = endpoint as ApiEndpoint;
        expect(ep.id).toBeTruthy();
        expect(ep.path).toMatch(/^\/api\//);
        expect(['GET', 'POST', 'DELETE']).toContain(ep.method);
        expect(ep.title).toBeTruthy();
        expect(ep.description).toBeTruthy();
        expect(ep.description.length).toBeGreaterThan(20);
        expect(ep.authentication).toBeDefined();
        expect(ep.rateLimit).toBeDefined();
        expect(ep.rateLimit.maxRequests).toBeGreaterThan(0);
        expect(ep.rateLimit.windowMs).toBeGreaterThan(0);
        expect(ep.actions.length).toBeGreaterThan(0);
        expect(ep.errorCodes.length).toBeGreaterThan(0);
      }
    );

    test('every action has required fields', () => {
      for (const endpoint of allEndpoints) {
        for (const action of endpoint.actions) {
          expect(action.name).toBeTruthy();
          expect(action.description).toBeTruthy();
          expect(action.description.length).toBeGreaterThan(10);
          expect(Array.isArray(action.parameters)).toBe(true);
          expect(action.exampleRequest).toBeDefined();
          expect(action.exampleResponse).toBeDefined();
        }
      }
    });

    test('every parameter has required fields', () => {
      for (const endpoint of allEndpoints) {
        for (const action of endpoint.actions) {
          for (const param of action.parameters) {
            expect(param.name).toBeTruthy();
            expect(['string', 'number', 'boolean', 'object', 'array']).toContain(param.type);
            expect(typeof param.required).toBe('boolean');
            expect(param.description).toBeTruthy();
          }
        }
      }
    });
  });

  describe('Example Payloads', () => {
    test('all example requests are valid JSON', () => {
      for (const endpoint of allEndpoints) {
        for (const action of endpoint.actions) {
          expect(() => JSON.stringify(action.exampleRequest)).not.toThrow();
          const parsed = JSON.parse(JSON.stringify(action.exampleRequest));
          expect(parsed).toBeDefined();
        }
      }
    });

    test('all example responses are valid JSON', () => {
      for (const endpoint of allEndpoints) {
        for (const action of endpoint.actions) {
          expect(() => JSON.stringify(action.exampleResponse)).not.toThrow();
          const parsed = JSON.parse(JSON.stringify(action.exampleResponse));
          expect(parsed).toBeDefined();
        }
      }
    });

    test('validateExamplePayloads utility reports all valid', () => {
      const result = validateExamplePayloads();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('POST endpoint example requests include action field', () => {
      const postEndpoints = allEndpoints.filter((ep) => ep.method === 'POST');

      for (const endpoint of postEndpoints) {
        // Skip negotiate endpoint which has different structure
        if (endpoint.id === 'negotiate') continue;

        for (const action of endpoint.actions) {
          const request = action.exampleRequest as Record<string, unknown>;
          expect(request.action).toBe(action.name);
        }
      }
    });

    test('example responses have success field', () => {
      for (const endpoint of allEndpoints) {
        for (const action of endpoint.actions) {
          const response = action.exampleResponse as Record<string, unknown>;
          expect(response).toHaveProperty('success');
        }
      }
    });
  });

  describe('Category Organisation', () => {
    test('all 6 categories are defined', () => {
      expect(apiCategories).toHaveLength(6);

      const categoryIds = apiCategories.map((c) => c.id);
      expect(categoryIds).toContain('trading');
      expect(categoryIds).toContain('analytics');
      expect(categoryIds).toContain('compliance');
      expect(categoryIds).toContain('market-data');
      expect(categoryIds).toContain('metadata');
      expect(categoryIds).toContain('performance');
    });

    test('every category has label, description, and icon', () => {
      for (const cat of apiCategories) {
        expect(cat.label).toBeTruthy();
        expect(cat.description).toBeTruthy();
        expect(cat.icon).toBeTruthy();
      }
    });

    test('getEndpointsByCategory groups endpoints correctly', () => {
      const grouped = getEndpointsByCategory();

      // Every category should exist as a key
      for (const cat of apiCategories) {
        expect(grouped[cat.id]).toBeDefined();
        expect(Array.isArray(grouped[cat.id])).toBe(true);
      }

      // Total endpoints in groups should match allEndpoints
      const totalInGroups = Object.values(grouped).reduce(
        (sum, eps) => sum + eps.length,
        0
      );
      expect(totalInGroups).toBe(allEndpoints.length);
    });

    test('every endpoint belongs to a valid category', () => {
      const validCategories = apiCategories.map((c) => c.id);

      for (const endpoint of allEndpoints) {
        expect(validCategories).toContain(endpoint.category);
      }
    });
  });

  describe('Lookup Utilities', () => {
    test('getEndpointById returns correct endpoint', () => {
      const analytics = getEndpointById('analytics');
      expect(analytics).toBeDefined();
      expect(analytics?.path).toBe('/api/analytics');
      expect(analytics?.method).toBe('POST');
    });

    test('getEndpointById returns undefined for unknown ID', () => {
      const result = getEndpointById('nonexistent');
      expect(result).toBeUndefined();
    });

    test('getEndpointActions returns action names for valid endpoint', () => {
      const actions = getEndpointActions('analytics');
      expect(actions.length).toBeGreaterThan(0);
      expect(actions).toContain('irr');
      expect(actions).toContain('npv');
      expect(actions).toContain('monte_carlo');
    });

    test('getEndpointActions returns empty array for unknown endpoint', () => {
      const actions = getEndpointActions('nonexistent');
      expect(actions).toHaveLength(0);
    });
  });

  describe('Code Examples', () => {
    test('generates code examples for GET endpoints', () => {
      const marketData = allEndpoints.find((ep) => ep.id === 'market-data');
      expect(marketData).toBeDefined();

      if (marketData) {
        const action = marketData.actions[0];
        const examples = generateCodeExamples(marketData, action);

        expect(examples).toHaveLength(3);
        expect(examples.map((e) => e.language)).toEqual(['curl', 'javascript', 'python']);

        // cURL should use GET
        expect(examples[0].code).toContain('GET');
        expect(examples[0].code).toContain('X-WREI-API-Key');
      }
    });

    test('generates code examples for POST endpoints', () => {
      const analytics = allEndpoints.find((ep) => ep.id === 'analytics');
      expect(analytics).toBeDefined();

      if (analytics) {
        const action = analytics.actions[0];
        const examples = generateCodeExamples(analytics, action);

        expect(examples).toHaveLength(3);
        expect(examples.map((e) => e.language)).toEqual(['curl', 'javascript', 'python']);

        // cURL should use POST
        expect(examples[0].code).toContain('POST');
        expect(examples[0].code).toContain('Content-Type: application/json');
      }
    });

    test('generates code examples for DELETE endpoints', () => {
      const metadataDelete = allEndpoints.find((ep) => ep.id === 'metadata-delete');
      expect(metadataDelete).toBeDefined();

      if (metadataDelete) {
        const action = metadataDelete.actions[0];
        const examples = generateCodeExamples(metadataDelete, action);

        expect(examples).toHaveLength(3);
        expect(examples[0].code).toContain('DELETE');
      }
    });

    test('code examples include the correct base URL', () => {
      const endpoint = allEndpoints[0];
      const action = endpoint.actions[0];
      const examples = generateCodeExamples(endpoint, action);

      for (const example of examples) {
        expect(example.code).toContain('wrei-trading-platform.vercel.app');
      }
    });

    test('all code examples have non-empty code', () => {
      for (const endpoint of allEndpoints) {
        for (const action of endpoint.actions) {
          const examples = generateCodeExamples(endpoint, action);
          for (const example of examples) {
            expect(example.code.length).toBeGreaterThan(10);
            expect(example.label).toBeTruthy();
            expect(example.language).toBeTruthy();
          }
        }
      }
    });
  });

  describe('Analytics Endpoint Actions', () => {
    test('documents all 11 analytics actions', () => {
      const analytics = getEndpointById('analytics');
      expect(analytics).toBeDefined();

      const actionNames = analytics!.actions.map((a) => a.name);
      expect(actionNames).toContain('irr');
      expect(actionNames).toContain('npv');
      expect(actionNames).toContain('carbon_metrics');
      expect(actionNames).toContain('asset_co_metrics');
      expect(actionNames).toContain('dual_portfolio');
      expect(actionNames).toContain('risk_profile');
      expect(actionNames).toContain('scenario_analysis');
      expect(actionNames).toContain('portfolio_optimization');
      expect(actionNames).toContain('monte_carlo');
      expect(actionNames).toContain('professional_metrics');
      expect(actionNames).toContain('calculate');
    });
  });

  describe('Market Data Endpoint Actions', () => {
    test('documents all 9 market data actions', () => {
      const marketData = getEndpointById('market-data');
      expect(marketData).toBeDefined();

      const actionNames = marketData!.actions.map((a) => a.name);
      expect(actionNames).toContain('carbon_pricing');
      expect(actionNames).toContain('carbon_analytics');
      expect(actionNames).toContain('rwa_market');
      expect(actionNames).toContain('rwa_analytics');
      expect(actionNames).toContain('market_sentiment');
      expect(actionNames).toContain('competitive_analysis');
      expect(actionNames).toContain('carbon_projections');
      expect(actionNames).toContain('historical');
      expect(actionNames).toContain('feed_status');
    });
  });

  describe('Compliance Endpoint Actions', () => {
    test('documents GET compliance actions', () => {
      const complianceGet = getEndpointById('compliance-get');
      expect(complianceGet).toBeDefined();

      const actionNames = complianceGet!.actions.map((a) => a.name);
      expect(actionNames).toContain('status');
      expect(actionNames).toContain('alerts');
      expect(actionNames).toContain('regulatory_framework');
      expect(actionNames).toContain('digital_assets_framework');
    });

    test('documents POST compliance actions', () => {
      const compliancePost = getEndpointById('compliance-post');
      expect(compliancePost).toBeDefined();

      const actionNames = compliancePost!.actions.map((a) => a.name);
      expect(actionNames).toContain('investor_classification');
      expect(actionNames).toContain('afsl_check');
      expect(actionNames).toContain('aml_check');
      expect(actionNames).toContain('environmental');
      expect(actionNames).toContain('tokenization_standards');
      expect(actionNames).toContain('full_report');
      expect(actionNames).toContain('tax_treatment');
    });
  });

  describe('Performance Endpoint Actions', () => {
    test('documents GET performance actions', () => {
      const perfGet = getEndpointById('performance-get');
      expect(perfGet).toBeDefined();

      const actionNames = perfGet!.actions.map((a) => a.name);
      expect(actionNames).toContain('snapshot');
      expect(actionNames).toContain('benchmarks');
      expect(actionNames).toContain('health');
      expect(actionNames).toContain('load_test');
    });

    test('documents POST performance actions', () => {
      const perfPost = getEndpointById('performance-post');
      expect(perfPost).toBeDefined();

      const actionNames = perfPost!.actions.map((a) => a.name);
      expect(actionNames).toContain('run_benchmark');
      expect(actionNames).toContain('stress_test');
      expect(actionNames).toContain('clear_metrics');
    });
  });

  describe('Error Code Documentation', () => {
    test('all endpoints have error codes documented', () => {
      for (const endpoint of allEndpoints) {
        expect(endpoint.errorCodes.length).toBeGreaterThan(0);

        for (const errCode of endpoint.errorCodes) {
          expect(errCode.code).toBeGreaterThanOrEqual(400);
          expect(errCode.code).toBeLessThan(600);
          expect(errCode.name).toBeTruthy();
          expect(errCode.description).toBeTruthy();
        }
      }
    });
  });

  describe('Authentication Documentation', () => {
    test('all endpoints have authentication info', () => {
      for (const endpoint of allEndpoints) {
        expect(endpoint.authentication).toBeDefined();
        expect(typeof endpoint.authentication.required).toBe('boolean');
        expect(endpoint.authentication.description).toBeTruthy();
        expect(endpoint.authentication.devMode).toBeTruthy();
      }
    });

    test('authenticated endpoints specify the header name', () => {
      const authEndpoints = allEndpoints.filter((ep) => ep.authentication.required);

      for (const endpoint of authEndpoints) {
        expect(endpoint.authentication.header).toBe('X-WREI-API-Key');
      }
    });
  });

  describe('Rate Limit Documentation', () => {
    test('all endpoints have rate limit info', () => {
      for (const endpoint of allEndpoints) {
        expect(endpoint.rateLimit.maxRequests).toBeGreaterThan(0);
        expect(endpoint.rateLimit.windowMs).toBeGreaterThan(0);
        expect(endpoint.rateLimit.windowDescription).toBeTruthy();
      }
    });

    test('rate limits are reasonable', () => {
      for (const endpoint of allEndpoints) {
        // Max should be between 1 and 1000
        expect(endpoint.rateLimit.maxRequests).toBeGreaterThanOrEqual(1);
        expect(endpoint.rateLimit.maxRequests).toBeLessThanOrEqual(1000);

        // Window should be at least 1 second
        expect(endpoint.rateLimit.windowMs).toBeGreaterThanOrEqual(1000);
      }
    });
  });
});
