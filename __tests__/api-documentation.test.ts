/**
 * API Documentation Tests
 *
 * Tests for the structured v1 API documentation system.
 * Validates all v1 endpoints are documented, example payloads are valid JSON,
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
    test('documents all v1 API resource groups', () => {
      const documentedPaths = allEndpoints.map((ep) => ep.path);

      // Market Data
      expect(documentedPaths).toContain('/api/v1/market/prices');
      expect(documentedPaths).toContain('/api/v1/market/prices/history');
      expect(documentedPaths).toContain('/api/v1/market/orderbook');
      expect(documentedPaths).toContain('/api/v1/market/instruments');

      // Trading
      expect(documentedPaths).toContain('/api/v1/trades');
      expect(documentedPaths).toContain('/api/v1/trades/:id');
      expect(documentedPaths).toContain('/api/v1/trades/negotiate');
      expect(documentedPaths).toContain('/api/v1/trades/negotiate/:id');

      // Clients
      expect(documentedPaths).toContain('/api/v1/clients');
      expect(documentedPaths).toContain('/api/v1/clients/:id');
      expect(documentedPaths).toContain('/api/v1/clients/:id/holdings');

      // Compliance
      expect(documentedPaths).toContain('/api/v1/clients/:id/compliance');
      expect(documentedPaths).toContain('/api/v1/clients/compliance/summary');

      // Correspondence
      expect(documentedPaths).toContain('/api/v1/correspondence');
      expect(documentedPaths).toContain('/api/v1/correspondence/inbound');
      expect(documentedPaths).toContain('/api/v1/correspondence/threads');

      // Webhooks
      expect(documentedPaths).toContain('/api/v1/webhooks');
    });

    test('has at least 30 endpoint definitions (all HTTP method/path combinations)', () => {
      expect(allEndpoints.length).toBeGreaterThanOrEqual(30);
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
        expect(['GET', 'POST', 'PUT', 'DELETE']).toContain(ep.method);
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
  });

  describe('Category Organisation', () => {
    test('all 6 categories are defined', () => {
      expect(apiCategories).toHaveLength(6);

      const categoryIds = apiCategories.map((c) => c.id);
      expect(categoryIds).toContain('market-data');
      expect(categoryIds).toContain('trading');
      expect(categoryIds).toContain('clients');
      expect(categoryIds).toContain('compliance');
      expect(categoryIds).toContain('correspondence');
      expect(categoryIds).toContain('webhooks');
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

    test('market-data category has 4 endpoints', () => {
      const grouped = getEndpointsByCategory();
      expect(grouped['market-data']).toHaveLength(4);
    });

    test('trading category has 6 endpoints', () => {
      const grouped = getEndpointsByCategory();
      expect(grouped.trading).toHaveLength(6);
    });

    test('webhooks category has 3 endpoints', () => {
      const grouped = getEndpointsByCategory();
      expect(grouped.webhooks).toHaveLength(3);
    });
  });

  describe('Lookup Utilities', () => {
    test('getEndpointById returns correct endpoint', () => {
      const prices = getEndpointById('market-prices');
      expect(prices).toBeDefined();
      expect(prices?.path).toBe('/api/v1/market/prices');
      expect(prices?.method).toBe('GET');
    });

    test('getEndpointById returns undefined for unknown ID', () => {
      const result = getEndpointById('nonexistent');
      expect(result).toBeUndefined();
    });

    test('getEndpointActions returns action names for valid endpoint', () => {
      const actions = getEndpointActions('trades-list');
      expect(actions.length).toBeGreaterThan(0);
      expect(actions).toContain('list_trades');
    });

    test('getEndpointActions returns empty array for unknown endpoint', () => {
      const actions = getEndpointActions('nonexistent');
      expect(actions).toHaveLength(0);
    });
  });

  describe('Code Examples', () => {
    test('generates code examples for GET endpoints', () => {
      const prices = allEndpoints.find((ep) => ep.id === 'market-prices');
      expect(prices).toBeDefined();

      if (prices) {
        const action = prices.actions[0];
        const examples = generateCodeExamples(prices, action);

        expect(examples).toHaveLength(3);
        expect(examples.map((e) => e.language)).toEqual(['curl', 'javascript', 'python']);

        // cURL should use GET
        expect(examples[0].code).toContain('GET');
        expect(examples[0].code).toContain('X-API-Key');
      }
    });

    test('generates code examples for POST endpoints', () => {
      const createTrade = allEndpoints.find((ep) => ep.id === 'trades-create');
      expect(createTrade).toBeDefined();

      if (createTrade) {
        const action = createTrade.actions[0];
        const examples = generateCodeExamples(createTrade, action);

        expect(examples).toHaveLength(3);
        expect(examples.map((e) => e.language)).toEqual(['curl', 'javascript', 'python']);

        // cURL should use POST
        expect(examples[0].code).toContain('POST');
        expect(examples[0].code).toContain('Content-Type: application/json');
      }
    });

    test('generates code examples for PUT endpoints', () => {
      const updateClient = allEndpoints.find((ep) => ep.id === 'clients-update');
      expect(updateClient).toBeDefined();

      if (updateClient) {
        const action = updateClient.actions[0];
        const examples = generateCodeExamples(updateClient, action);

        expect(examples).toHaveLength(3);
        expect(examples[0].code).toContain('PUT');
      }
    });

    test('generates code examples for DELETE endpoints', () => {
      const deleteWebhook = allEndpoints.find((ep) => ep.id === 'webhooks-delete');
      expect(deleteWebhook).toBeDefined();

      if (deleteWebhook) {
        const action = deleteWebhook.actions[0];
        const examples = generateCodeExamples(deleteWebhook, action);

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

    test('all v1 endpoints require authentication', () => {
      for (const endpoint of allEndpoints) {
        expect(endpoint.authentication.required).toBe(true);
        expect(endpoint.authentication.header).toBe('X-API-Key');
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
        expect(endpoint.rateLimit.maxRequests).toBeGreaterThanOrEqual(1);
        expect(endpoint.rateLimit.maxRequests).toBeLessThanOrEqual(1000);
        expect(endpoint.rateLimit.windowMs).toBeGreaterThanOrEqual(1000);
      }
    });

    test('write endpoints have lower rate limits than read endpoints', () => {
      const writeEndpoints = allEndpoints.filter((ep) => ['POST', 'PUT', 'DELETE'].includes(ep.method));
      const readEndpoints = allEndpoints.filter((ep) => ep.method === 'GET');

      const maxWriteRate = Math.max(...writeEndpoints.map((ep) => ep.rateLimit.maxRequests));
      const minReadRate = Math.min(...readEndpoints.map((ep) => ep.rateLimit.maxRequests));

      expect(maxWriteRate).toBeLessThanOrEqual(minReadRate);
    });
  });
});
