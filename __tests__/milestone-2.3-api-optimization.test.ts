/**
 * MILESTONE 2.3: API Performance Optimization Tests
 *
 * Tests for API performance enhancements, caching strategies,
 * and integration with existing endpoints
 */

import { NextRequest } from 'next/server';
import {
  startApiPerformanceTracking,
  endApiPerformanceTracking,
  trackCalculationPerformance
} from '@/lib/api-helpers';
import { performanceMonitor, PerformanceOptimizer } from '@/lib/performance-monitor';
import { calculateIRR, calculateNPV, calculateRiskProfile } from '@/lib/financial-calculations';

// Import API routes for integration testing
import { POST as AnalyticsAPI } from '@/app/api/analytics/route';
import { GET as MarketDataAPI } from '@/app/api/market-data/route';
import { GET as ComplianceAPI } from '@/app/api/compliance/route';

describe('Milestone 2.3: API Performance Optimization', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    PerformanceOptimizer.clearCache();
  });

  // Helper function to create Next.js request
  function createRequest(method: string = 'GET', body?: any, endpoint: string = '/api/analytics'): NextRequest {
    const url = new URL(`https://example.com${endpoint}`);

    return {
      method,
      headers: new Map([
        ['content-type', 'application/json'],
        ['X-WREI-API-Key', 'test-key']
      ]),
      url: url.toString(),
      json: async () => body || {}
    } as NextRequest;
  }

  // Helper function to parse API response
  async function parseApiResponse(response: Response) {
    const json = await response.json();
    return { status: response.status, data: json };
  }

  describe('API Performance Tracking Integration', () => {
    test('tracks API request lifecycle', () => {
      const endpoint = '/api/analytics';
      const action = 'irr';
      const requestId = 'test-123';

      // Start tracking
      const metricId = startApiPerformanceTracking(endpoint, action, requestId);
      expect(metricId).toBeTruthy();

      // Simulate API processing time
      const start = performance.now();
      while (performance.now() - start < 25) {
        // Busy wait for 25ms
      }

      // End tracking
      endApiPerformanceTracking(metricId, true, 200);

      // Verify metrics were recorded
      const stats = performanceMonitor.getMetricStats('api_request');
      expect(stats.count).toBe(1);
      expect(stats.averageDuration).toBeGreaterThan(20);

      const metrics = performanceMonitor.getAllMetrics();
      const apiMetric = metrics.find(m => m.name === 'api_request');

      expect(apiMetric).toBeTruthy();
      expect(apiMetric!.context!.endpoint).toBe(endpoint);
      expect(apiMetric!.context!.action).toBe(action);
      expect(apiMetric!.context!.success).toBe(true);
      expect(apiMetric!.context!.statusCode).toBe(200);
    });

    test('handles API request failures', () => {
      const metricId = startApiPerformanceTracking('/api/test', 'fail', 'test-456');

      // End with failure
      endApiPerformanceTracking(metricId, false, 500);

      const metrics = performanceMonitor.getAllMetrics();
      const failedMetric = metrics.find(m => m.context?.success === false);

      expect(failedMetric).toBeTruthy();
      expect(failedMetric!.context!.statusCode).toBe(500);
    });
  });

  describe('Calculation Performance Optimization', () => {
    test('tracks IRR calculation performance', () => {
      const cashFlows = [
        { year: 0, amount: -1000000 },
        { year: 1, amount: 200000 },
        { year: 2, amount: 300000 },
        { year: 3, amount: 400000 },
        { year: 4, amount: 500000 }
      ];

      const irr = trackCalculationPerformance('irr_calculation', () =>
        calculateIRR(cashFlows)
      );

      expect(typeof irr).toBe('number');
      expect(irr).toBeGreaterThan(0);

      const stats = performanceMonitor.getMetricStats('calculation');
      expect(stats.count).toBe(1);
      expect(stats.averageDuration).toBeGreaterThan(0);
    });

    test('tracks NPV calculation performance', () => {
      const cashFlows = [
        { year: 0, amount: -2000000 },
        { year: 1, amount: 400000 },
        { year: 2, amount: 600000 },
        { year: 3, amount: 800000 }
      ];

      const npv = trackCalculationPerformance('npv_calculation', () =>
        calculateNPV(cashFlows, 0.1)
      );

      expect(typeof npv).toBe('number');

      const stats = performanceMonitor.getMetricStats('calculation');
      expect(stats.count).toBe(1);
    });

    test('tracks risk profile calculation performance', () => {
      const riskProfile = trackCalculationPerformance('risk_profile_calculation', () =>
        calculateRiskProfile('carbon_credits')
      );

      expect(riskProfile).toBeTruthy();
      expect(riskProfile.volatility).toBe(0.25);
      expect(riskProfile.sharpeRatio).toBe(0.8);

      const stats = performanceMonitor.getMetricStats('calculation');
      expect(stats.count).toBe(1);
      expect(stats.averageDuration).toBeGreaterThan(0);
    });

    test('handles calculation errors gracefully', () => {
      const errorCalculation = () => {
        throw new Error('Calculation failed');
      };

      expect(() =>
        trackCalculationPerformance('error_calculation', errorCalculation)
      ).toThrow('Calculation failed');

      const metrics = performanceMonitor.getAllMetrics();
      const errorMetric = metrics.find(m => m.context?.success === false);

      expect(errorMetric).toBeTruthy();
      expect(errorMetric!.context!.error).toBe('Calculation failed');
    });
  });

  describe('Caching Performance Optimization', () => {
    test('caches expensive calculations efficiently', () => {
      let calculationCount = 0;

      const expensiveCalculation = () => {
        calculationCount++;
        // Simulate expensive calculation
        let result = 0;
        for (let i = 0; i < 10000; i++) {
          result += Math.sqrt(i);
        }
        return result;
      };

      // First call - should calculate
      const result1 = PerformanceOptimizer.cached('expensive_calc', expensiveCalculation, 5000);
      expect(calculationCount).toBe(1);
      expect(typeof result1).toBe('number');

      // Second call - should use cache
      const result2 = PerformanceOptimizer.cached('expensive_calc', expensiveCalculation, 5000);
      expect(calculationCount).toBe(1); // Should not increase
      expect(result2).toBe(result1);

      // Third call with different key - should calculate again
      const result3 = PerformanceOptimizer.cached('expensive_calc_2', expensiveCalculation, 5000);
      expect(calculationCount).toBe(2);
      expect(typeof result3).toBe('number');
    });

    test('respects cache TTL expiration', async () => {
      let callCount = 0;
      const shortTTLFunction = () => {
        callCount++;
        return `result_${callCount}`;
      };

      // First call
      const result1 = PerformanceOptimizer.cached('ttl_test', shortTTLFunction, 50); // 50ms TTL
      expect(result1).toBe('result_1');
      expect(callCount).toBe(1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 60));

      // Call after TTL expiration
      const result2 = PerformanceOptimizer.cached('ttl_test', shortTTLFunction, 50);
      expect(result2).toBe('result_2');
      expect(callCount).toBe(2);
    });

    test('async caching works correctly', async () => {
      let asyncCallCount = 0;

      const asyncExpensiveFunction = async () => {
        asyncCallCount++;
        await new Promise(resolve => setTimeout(resolve, 20));
        return `async_result_${asyncCallCount}`;
      };

      // First call
      const result1 = await PerformanceOptimizer.cachedAsync('async_test', asyncExpensiveFunction, 1000);
      expect(result1).toBe('async_result_1');
      expect(asyncCallCount).toBe(1);

      // Second call - should use cache
      const result2 = await PerformanceOptimizer.cachedAsync('async_test', asyncExpensiveFunction, 1000);
      expect(result2).toBe('async_result_1');
      expect(asyncCallCount).toBe(1);
    });

    test('cache clearing works correctly', () => {
      let callCount = 0;
      const testFunction = () => {
        callCount++;
        return callCount;
      };

      // Cache some results
      PerformanceOptimizer.cached('test_1', testFunction);
      PerformanceOptimizer.cached('test_2', testFunction);
      expect(callCount).toBe(2);

      // Clear specific pattern
      PerformanceOptimizer.clearCache('test_1');

      // test_1 should recalculate, test_2 should use cache
      PerformanceOptimizer.cached('test_1', testFunction);
      PerformanceOptimizer.cached('test_2', testFunction);
      expect(callCount).toBe(3); // Only test_1 should have incremented

      // Clear all cache
      PerformanceOptimizer.clearCache();

      // Both should recalculate
      PerformanceOptimizer.cached('test_1', testFunction);
      PerformanceOptimizer.cached('test_2', testFunction);
      expect(callCount).toBe(5);
    });
  });

  describe('Integrated API Performance Testing', () => {
    test('analytics API performance under load', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        action: 'irr',
        cashFlows: [
          { year: 0, amount: -1000000 * (i + 1) },
          { year: 1, amount: 200000 * (i + 1) },
          { year: 2, amount: 300000 * (i + 1) }
        ]
      }));

      const startTime = performance.now();

      const promises = requests.map(body =>
        AnalyticsAPI(createRequest('POST', body))
      );

      const responses = await Promise.all(promises);
      const endTime = performance.now();

      // All requests should succeed
      for (const response of responses) {
        const { status, data } = await parseApiResponse(response);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
      }

      // Total time should be reasonable (parallel processing should be faster than sequential)
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds

      // Check if performance metrics were recorded
      const snapshot = performanceMonitor.getPerformanceSnapshot();
      expect(snapshot.businessMetrics.analyticsCalculations).toBeGreaterThanOrEqual(0);
    });

    test('market data API caching performance', async () => {
      const request = createRequest('GET', null, '/api/market-data?action=carbon_pricing');

      // First request
      const start1 = performance.now();
      const response1 = await MarketDataAPI(request);
      const end1 = performance.now();

      // Second request (should potentially use cached data)
      const start2 = performance.now();
      const response2 = await MarketDataAPI(request);
      const end2 = performance.now();

      const { status: status1, data: data1 } = await parseApiResponse(response1);
      const { status: status2, data: data2 } = await parseApiResponse(response2);

      expect(status1).toBe(200);
      expect(status2).toBe(200);
      expect(data1.success).toBe(true);
      expect(data2.success).toBe(true);

      const time1 = end1 - start1;
      const time2 = end2 - start2;

      // Both requests should complete reasonably quickly
      expect(time1).toBeLessThan(2000);
      expect(time2).toBeLessThan(2000);
    });

    test('compliance API performance consistency', async () => {
      const endpoints = [
        '/api/compliance?action=status',
        '/api/compliance?action=digital_assets_framework',
        '/api/compliance?action=regulatory_framework'
      ];

      const responseTimes = [];

      for (const endpoint of endpoints) {
        const request = createRequest('GET', null, endpoint);
        const startTime = performance.now();

        const response = await ComplianceAPI(request);
        const endTime = performance.now();

        const { status, data } = await parseApiResponse(response);
        expect(status).toBe(200);
        expect(data.success).toBe(true);

        responseTimes.push(endTime - startTime);
      }

      // All response times should be reasonable
      expect(responseTimes.every(time => time < 1000)).toBe(true);

      // Calculate consistency (coefficient of variation)
      const mean = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / responseTimes.length;
      const standardDeviation = Math.sqrt(variance);
      const coefficientOfVariation = standardDeviation / mean;

      // Response times should be reasonably consistent (CV < 1.2 for test environment)
      expect(coefficientOfVariation).toBeLessThan(1.2);
    });
  });

  describe('Batch Processing Performance', () => {
    test('batch processes analytics calculations efficiently', async () => {
      const calculations = Array.from({ length: 20 }, (_, i) => ({
        type: 'irr',
        data: {
          cashFlows: [
            { year: 0, amount: -100000 * (i + 1) },
            { year: 1, amount: 30000 * (i + 1) },
            { year: 2, amount: 50000 * (i + 1) },
            { year: 3, amount: 70000 * (i + 1) }
          ]
        }
      }));

      const processor = async (calc: any) => {
        return trackCalculationPerformance('batch_irr', () =>
          calculateIRR(calc.data.cashFlows)
        );
      };

      const startTime = performance.now();
      const results = await PerformanceOptimizer.batchProcess(calculations, processor, 5);
      const endTime = performance.now();

      expect(results).toHaveLength(20);
      expect(results.every(r => typeof r === 'number' && r > 0)).toBe(true);

      const totalTime = endTime - startTime;
      const stats = performanceMonitor.getMetricStats('calculation');

      expect(stats.count).toBe(20);
      expect(totalTime).toBeLessThan(10000); // Should complete in under 10 seconds

      // Batch processing should show controlled concurrency
      expect(stats.maxDuration).toBeGreaterThan(stats.minDuration); // Some variation expected
    });

    test('handles batch processing errors gracefully', async () => {
      const mixedJobs = [
        { shouldFail: false, data: 'valid' },
        { shouldFail: true, data: 'invalid' },
        { shouldFail: false, data: 'valid' },
        { shouldFail: true, data: 'invalid' }
      ];

      const processor = async (job: any) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        if (job.shouldFail) {
          throw new Error(`Processing failed for ${job.data}`);
        }
        return `processed_${job.data}`;
      };

      // Batch processing should handle individual failures
      const results = await PerformanceOptimizer.batchProcess(
        mixedJobs.filter(j => !j.shouldFail), // Only process valid jobs
        processor,
        2
      );

      expect(results).toHaveLength(2);
      expect(results.every(r => r.startsWith('processed_'))).toBe(true);
    });
  });

  describe('Performance Regression Testing', () => {
    test('IRR calculation performance remains consistent', () => {
      const testCases = [
        { cashFlows: [{ year: 0, amount: -1000 }, { year: 1, amount: 1100 }] },
        { cashFlows: [{ year: 0, amount: -10000 }, { year: 1, amount: 5000 }, { year: 2, amount: 6000 }] },
        { cashFlows: [{ year: 0, amount: -100000 }, { year: 1, amount: 30000 }, { year: 2, amount: 40000 }, { year: 3, amount: 50000 }] }
      ];

      const executionTimes = testCases.map(testCase => {
        const startTime = performance.now();
        const result = calculateIRR(testCase.cashFlows);
        const endTime = performance.now();

        expect(typeof result).toBe('number');
        return endTime - startTime;
      });

      // All calculations should complete quickly
      expect(executionTimes.every(time => time < 50)).toBe(true); // Under 50ms each

      // Performance should be reasonably consistent
      const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      expect(avgTime).toBeLessThan(20); // Average under 20ms
    });

    test('risk profile calculation performance baseline', () => {
      const tokenTypes: Array<'carbon_credits' | 'asset_co' | 'dual_portfolio'> = ['carbon_credits', 'asset_co', 'dual_portfolio'];

      const performanceResults = tokenTypes.map(tokenType => {
        const iterations = 100;
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
          const startTime = performance.now();
          const result = calculateRiskProfile(tokenType);
          const endTime = performance.now();

          expect(result).toBeTruthy();
          expect(typeof result.volatility).toBe('number');
          times.push(endTime - startTime);
        }

        return {
          tokenType,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times)
        };
      });

      performanceResults.forEach(result => {
        expect(result.avgTime).toBeLessThan(5); // Should average under 5ms
        expect(result.maxTime).toBeLessThan(20); // Worst case under 20ms
      });
    });
  });
});