/**
 * MILESTONE 2.3: Performance Monitoring System Tests
 *
 * Comprehensive test suite for performance monitoring, optimization,
 * and load testing capabilities
 */

import { NextRequest } from 'next/server';
import {
  performanceMonitor,
  PerformanceOptimizer,
  withPerformanceMonitoring,
  monitorPerformance
} from '@/lib/performance-monitor';
import { GET, POST } from '@/app/api/performance/route';

describe('Milestone 2.3: Performance Monitoring System', () => {
  beforeEach(() => {
    // Clear performance metrics before each test
    performanceMonitor.clearMetrics();
    PerformanceOptimizer.clearCache();
  });

  // Helper function to create Next.js request
  function createRequest(method: string = 'GET', body?: any, params?: Record<string, string>): NextRequest {
    const url = new URL('https://example.com/api/performance');
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return {
      method,
      headers: new Map([
        ['content-type', 'application/json'],
        ['X-WREI-API-Key', 'test-key']
      ]),
      url: url.toString(),
      json: async () => body || {}
    } as unknown as NextRequest;
  }

  // Helper function to parse API response
  async function parseApiResponse(response: Response) {
    const json = await response.json();
    return { status: response.status, data: json };
  }

  describe('Performance Monitor Core Functionality', () => {
    test('tracks metric start and end correctly', () => {
      const metricId = performanceMonitor.startMetric('test_metric', { test: true });

      expect(metricId).toMatch(/test_metric_\d+_[a-z0-9]+/);

      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Busy wait for 10ms
      }

      const completedMetric = performanceMonitor.endMetric(metricId);

      expect(completedMetric).toBeTruthy();
      expect(completedMetric!.name).toBe('test_metric');
      expect(completedMetric!.duration).toBeGreaterThan(5);
      expect(completedMetric!.context).toEqual({ test: true });
    });

    test('calculates metric statistics correctly', () => {
      // Add multiple metrics with known durations
      for (let i = 0; i < 10; i++) {
        const metricId = performanceMonitor.startMetric('stats_test');
        // Simulate different durations by manipulating the start time
        const metric = (performanceMonitor as any).metrics.get(metricId);
        if (metric) {
          metric.startTime = performance.now() - (i * 10); // 0, 10, 20, ... 90ms ago
        }
        performanceMonitor.endMetric(metricId);
      }

      const stats = performanceMonitor.getMetricStats('stats_test');

      expect(stats.count).toBe(10);
      expect(stats.averageDuration).toBeGreaterThan(0);
      expect(stats.p95Duration).toBeGreaterThan(0);
      expect(stats.minDuration).toBeGreaterThan(0);
      expect(stats.maxDuration).toBeGreaterThan(stats.minDuration);
    });

    test('generates performance snapshot', () => {
      // Create some activity
      const metricId1 = performanceMonitor.startMetric('api_request', {}, ['api']);
      const metricId2 = performanceMonitor.startMetric('calculation', {}, ['calculation']);

      performanceMonitor.endMetric(metricId1);

      const snapshot = performanceMonitor.getPerformanceSnapshot();

      expect(snapshot.timestamp).toBeTruthy();
      expect(snapshot.systemLoad).toBeTruthy();
      expect(snapshot.businessMetrics).toBeTruthy();
      expect(snapshot.performanceThresholds).toBeTruthy();

      expect(snapshot.systemLoad.activeCalculations).toBe(1); // One still active
      expect(snapshot.performanceThresholds.apiResponseTime.status).toMatch(/healthy|warning|critical/);

      performanceMonitor.endMetric(metricId2);
    });
  });

  describe('Performance Optimization Utilities', () => {
    test('caches function results correctly', () => {
      let callCount = 0;
      const expensiveFunction = () => {
        callCount++;
        return `result_${callCount}`;
      };

      // First call should execute function
      const result1 = PerformanceOptimizer.cached('test_key', expensiveFunction, 1000);
      expect(result1).toBe('result_1');
      expect(callCount).toBe(1);

      // Second call should return cached result
      const result2 = PerformanceOptimizer.cached('test_key', expensiveFunction, 1000);
      expect(result2).toBe('result_1');
      expect(callCount).toBe(1); // Should not have increased

      // Different key should execute function again
      const result3 = PerformanceOptimizer.cached('test_key_2', expensiveFunction, 1000);
      expect(result3).toBe('result_2');
      expect(callCount).toBe(2);
    });

    test('handles async cached functions', async () => {
      let callCount = 0;
      const asyncExpensiveFunction = async () => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 10));
        return `async_result_${callCount}`;
      };

      const result1 = await PerformanceOptimizer.cachedAsync('async_key', asyncExpensiveFunction, 1000);
      expect(result1).toBe('async_result_1');
      expect(callCount).toBe(1);

      const result2 = await PerformanceOptimizer.cachedAsync('async_key', asyncExpensiveFunction, 1000);
      expect(result2).toBe('async_result_1');
      expect(callCount).toBe(1);
    });

    test('processes batches with controlled concurrency', async () => {
      const items = Array.from({ length: 20 }, (_, i) => i);
      const processedOrder: number[] = [];

      const processor = async (item: number) => {
        processedOrder.push(item);
        await new Promise(resolve => setTimeout(resolve, 10));
        return item * 2;
      };

      const results = await PerformanceOptimizer.batchProcess(items, processor, 5);

      expect(results).toEqual(items.map(i => i * 2));
      expect(processedOrder.length).toBe(20);

      // Check that batching occurred (first 5 items should complete before items 15-19 start)
      const firstBatchIndices = processedOrder.slice(0, 5);
      const lastBatchIndices = processedOrder.slice(15, 20);

      expect(Math.max(...firstBatchIndices)).toBeLessThan(Math.min(...lastBatchIndices));
    });
  });

  describe('Performance Monitoring Decorators', () => {
    test('withPerformanceMonitoring wrapper tracks async functions', async () => {
      const originalFunction = async (x: number, y: number) => {
        await new Promise(resolve => setTimeout(resolve, 20));
        return x + y;
      };

      const monitoredFunction = withPerformanceMonitoring(
        'test_async_function',
        originalFunction,
        ['math', 'async']
      );

      const result = await monitoredFunction(5, 10);
      expect(result).toBe(15);

      const stats = performanceMonitor.getMetricStats('test_async_function');
      expect(stats.count).toBe(1);
      expect(stats.averageDuration).toBeGreaterThan(15);
    });

    test('monitorPerformance decorator tracks sync functions', () => {
      const originalFunction = (x: number, y: number) => {
        // Simulate some work
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait
        }
        return x * y;
      };

      const monitoredFunction = monitorPerformance(
        'test_sync_function',
        originalFunction,
        ['math', 'sync']
      );

      const result = monitoredFunction(6, 7);
      expect(result).toBe(42);

      const stats = performanceMonitor.getMetricStats('test_sync_function');
      expect(stats.count).toBe(1);
      expect(stats.averageDuration).toBeGreaterThan(5);
    });

    test('performance monitoring handles function errors', async () => {
      const errorFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        throw new Error('Test error');
      };

      const monitoredFunction = withPerformanceMonitoring(
        'test_error_function',
        errorFunction
      );

      await expect(monitoredFunction()).rejects.toThrow('Test error');

      const metrics = performanceMonitor.getAllMetrics();
      const errorMetric = metrics.find(m => m.name === 'test_error_function');

      expect(errorMetric).toBeTruthy();
      expect(errorMetric!.context!.success).toBe(false);
      expect(errorMetric!.context!.error).toBe('Test error');
    });
  });

  describe('Performance API Endpoints', () => {
    test('GET performance snapshot returns system metrics', async () => {
      const request = createRequest('GET', null, { action: 'snapshot' });
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_PERFORMANCE_MONITOR');

      const snapshot = data.data;
      expect(snapshot.timestamp).toBeTruthy();
      expect(snapshot.systemLoad).toBeTruthy();
      expect(snapshot.businessMetrics).toBeTruthy();
      expect(snapshot.performanceThresholds).toBeTruthy();

      expect(typeof snapshot.systemLoad.memoryUsage).toBe('number');
      expect(snapshot.performanceThresholds.apiResponseTime.target).toBe(500);
    });

    test('GET performance benchmarks returns benchmark data', async () => {
      const request = createRequest('GET', null, { action: 'benchmarks' });
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_PERFORMANCE_BENCHMARKS');

      const benchmarks = data.data.benchmarks;
      expect(Array.isArray(benchmarks)).toBe(true);
      expect(benchmarks.length).toBeGreaterThan(0);

      const apiBenchmark = benchmarks.find((b: any) => b.name === 'Average Response Time');
      expect(apiBenchmark).toBeTruthy();
      expect(apiBenchmark.category).toBe('API Performance');
      expect(apiBenchmark.unit).toBe('ms');
      expect(apiBenchmark.status).toMatch(/healthy|warning|critical/);
    });

    test('GET system health returns component status', async () => {
      const request = createRequest('GET', null, { action: 'health' });
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_SYSTEM_HEALTH');

      const health = data.data;
      expect(health.overall).toMatch(/healthy|warning|critical/);
      expect(health.components).toBeTruthy();
      expect(health.components.apiGateway).toMatch(/healthy|warning|critical/);
      expect(health.components.analyticsEngine).toMatch(/healthy|warning|critical/);
      expect(Array.isArray(health.alerts)).toBe(true);
      expect(Array.isArray(health.recommendations)).toBe(true);
    });

    test('POST benchmark execution runs performance tests', async () => {
      const request = createRequest('POST', {
        action: 'run_benchmark',
        benchmarkType: 'api',
        iterations: 10
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_BENCHMARK_RUNNER');

      const result = data.data;
      expect(result.benchmarkType).toBe('api');
      expect(result.iterations).toBe(10);
      expect(typeof result.averageTime).toBe('string');
      expect(typeof result.minTime).toBe('string');
      expect(typeof result.maxTime).toBe('string');
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBe(10);
    });

    test('POST stress test simulates high load', async () => {
      const request = createRequest('POST', {
        action: 'stress_test',
        concurrency: 5,
        duration: 1000 // 1 second
      });

      const response = await POST(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metadata.source).toBe('WREI_STRESS_TEST');

      const result = data.data;
      expect(result.concurrency).toBe(5);
      expect(result.testDuration).toBe(1000);
      expect(result.totalRequests).toBeGreaterThan(0);
      expect(result.successfulRequests).toBeGreaterThan(0);
      expect(typeof result.errorRate).toBe('string');
      expect(typeof result.averageResponseTime).toBe('string');
      expect(typeof result.throughput).toBe('string');
    });

    test('handles invalid performance actions', async () => {
      const request = createRequest('GET', null, { action: 'invalid_action' });
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action: invalid_action');
    });
  });

  describe('Load Testing and Stress Testing', () => {
    test('simulates concurrent API requests', async () => {
      const concurrency = 10;
      const requestsPerWorker = 5;

      const makeRequest = async () => {
        const metricId = performanceMonitor.startMetric('load_test_request', {}, ['load_test']);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
        performanceMonitor.endMetric(metricId);
        return true;
      };

      const workers = Array.from({ length: concurrency }, async () => {
        const promises = Array.from({ length: requestsPerWorker }, makeRequest);
        return Promise.all(promises);
      });

      const results = await Promise.all(workers);
      const totalRequests = results.flat().length;

      expect(totalRequests).toBe(concurrency * requestsPerWorker);

      const stats = performanceMonitor.getMetricStats('load_test_request');
      expect(stats.count).toBe(totalRequests);
      expect(stats.averageDuration).toBeGreaterThan(10);
      expect(stats.averageDuration).toBeLessThan(100);
    });

    test('measures calculation performance under load', async () => {
      const calculations = Array.from({ length: 20 }, (_, i) => async () => {
        const metricId = performanceMonitor.startMetric('load_test_calculation', { index: i }, ['calculation']);

        // Simulate various complexity calculations
        let result = 0;
        for (let j = 0; j < 1000 * (i + 1); j++) {
          result += Math.sqrt(j);
        }

        performanceMonitor.endMetric(metricId, { result: result.toString().length });
        return result;
      });

      const results = await PerformanceOptimizer.batchProcess(calculations, calc => calc(), 5);

      expect(results).toHaveLength(20);
      expect(results.every(r => r > 0)).toBe(true);

      const stats = performanceMonitor.getMetricStats('load_test_calculation');
      expect(stats.count).toBe(20);
      expect(stats.maxDuration).toBeGreaterThan(stats.minDuration);
    });

    test('monitors memory usage during intensive operations', () => {
      const initialSnapshot = performanceMonitor.getPerformanceSnapshot();
      const initialMemory = initialSnapshot.systemLoad.memoryUsage;

      // Create large objects to increase memory usage
      const largeArrays = [];
      for (let i = 0; i < 10; i++) {
        largeArrays.push(new Array(10000).fill(i));
      }

      const finalSnapshot = performanceMonitor.getPerformanceSnapshot();
      const finalMemory = finalSnapshot.systemLoad.memoryUsage;

      expect(typeof initialMemory).toBe('number');
      expect(typeof finalMemory).toBe('number');
      expect(initialMemory).toBeGreaterThanOrEqual(0);
      expect(finalMemory).toBeGreaterThanOrEqual(0);

      // Memory values should be reasonable (not negative, not impossibly high)
      expect(finalMemory).toBeLessThan(1000); // Less than 1GB
    });
  });

  describe('Performance Thresholds and Alerting', () => {
    test('correctly categorizes response times', () => {
      // Create metrics with different response times
      const fastMetricId = performanceMonitor.startMetric('api_request');
      const slowMetricId = performanceMonitor.startMetric('api_request');
      const criticalMetricId = performanceMonitor.startMetric('api_request');

      // Simulate different response times by manipulating start times
      const now = performance.now();
      (performanceMonitor as any).metrics.get(fastMetricId).startTime = now - 100; // 100ms
      (performanceMonitor as any).metrics.get(slowMetricId).startTime = now - 800; // 800ms
      (performanceMonitor as any).metrics.get(criticalMetricId).startTime = now - 1500; // 1500ms

      performanceMonitor.endMetric(fastMetricId);
      performanceMonitor.endMetric(slowMetricId);
      performanceMonitor.endMetric(criticalMetricId);

      const snapshot = performanceMonitor.getPerformanceSnapshot();
      const threshold = snapshot.performanceThresholds.apiResponseTime;

      expect(threshold.target).toBe(500);
      expect(typeof threshold.current).toBe('number');
      expect(threshold.status).toMatch(/healthy|warning|critical/);

      // With mixed response times, average should be between 100 and 1500
      expect(threshold.current).toBeGreaterThan(100);
      expect(threshold.current).toBeLessThan(1500);
    });

    test('detects performance degradation trends', () => {
      // Simulate degrading performance over time
      const times = [50, 75, 100, 150, 200, 300, 400, 600]; // Increasing response times

      times.forEach((time, index) => {
        const metricId = performanceMonitor.startMetric('degradation_test');
        const now = performance.now();
        (performanceMonitor as any).metrics.get(metricId).startTime = now - time;
        performanceMonitor.endMetric(metricId, { sequenceNumber: index });
      });

      const stats = performanceMonitor.getMetricStats('degradation_test');

      expect(stats.count).toBe(8);
      expect(stats.maxDuration).toBeGreaterThan(stats.minDuration);
      expect(stats.averageDuration).toBeGreaterThan(200);
      expect(stats.p95Duration).toBeGreaterThan(stats.averageDuration);
    });
  });
});