/**
 * WREI Performance Monitoring API
 *
 * Provides real-time performance metrics and system health data
 * for institutional-grade monitoring and alerting
 */

import { NextRequest } from 'next/server';
import {
  performanceMonitor,
  PerformanceSnapshot,
  withPerformanceMonitoring
} from '@/lib/performance-monitor';
import {
  apiResponse,
  apiError,
  validateApiKey,
  checkRateLimit,
  generateRequestId
} from '@/lib/api-helpers';

interface PerformanceBenchmark {
  category: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
  lastUpdated: string;
}

interface SystemHealthReport {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    apiGateway: 'healthy' | 'warning' | 'critical';
    analyticsEngine: 'healthy' | 'warning' | 'critical';
    complianceModule: 'healthy' | 'warning' | 'critical';
    marketDataFeeds: 'healthy' | 'warning' | 'critical';
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }>;
  recommendations: string[];
}

interface LoadTestMetrics {
  testName: string;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  concurrency: number;
  timestamp: string;
}

/**
 * GET /api/performance
 * Retrieve current performance snapshot
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Validate API key
    const { valid, error } = validateApiKey(request);
    if (!valid) {
      return apiError(error || 'Invalid API key', 401);
    }

    // Rate limiting
    const apiKey = request.headers.get('X-WREI-API-Key') || 'anonymous';
    if (!checkRateLimit(apiKey, 50, 60000)) { // 50 requests per minute
      return apiError('Rate limit exceeded', 429);
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'snapshot';

    let result: any;
    let source: string;

    switch (action) {
      case 'snapshot':
        result = await handlePerformanceSnapshot();
        source = 'WREI_PERFORMANCE_MONITOR';
        break;

      case 'benchmarks':
        result = await handlePerformanceBenchmarks();
        source = 'WREI_PERFORMANCE_BENCHMARKS';
        break;

      case 'health':
        result = await handleSystemHealth();
        source = 'WREI_SYSTEM_HEALTH';
        break;

      case 'load_test':
        result = await handleLoadTestResults();
        source = 'WREI_LOAD_TEST_RESULTS';
        break;

      default:
        return apiError(`Invalid action: ${action}. Valid actions: snapshot, benchmarks, health, load_test`, 400);
    }

    return apiResponse(result, {
      source,
      requestId
    });

  } catch (error) {
    console.error('[Performance API Error]', error);
    return apiError(
      error instanceof Error ? error.message : 'Internal performance monitoring error',
      500
    );
  }
}

/**
 * POST /api/performance
 * Trigger performance tests or benchmarks
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Validate API key
    const { valid, error } = validateApiKey(request);
    if (!valid) {
      return apiError(error || 'Invalid API key', 401);
    }

    // Rate limiting
    const apiKey = request.headers.get('X-WREI-API-Key') || 'anonymous';
    if (!checkRateLimit(apiKey, 20, 60000)) { // 20 POST requests per minute
      return apiError('Rate limit exceeded', 429);
    }

    const body = await request.json();
    const action = body.action;

    let result: any;
    let source: string;

    switch (action) {
      case 'run_benchmark':
        result = await handleRunBenchmark(body);
        source = 'WREI_BENCHMARK_RUNNER';
        break;

      case 'stress_test':
        result = await handleStressTest(body);
        source = 'WREI_STRESS_TEST';
        break;

      case 'clear_metrics':
        result = await handleClearMetrics();
        source = 'WREI_METRICS_MANAGER';
        break;

      default:
        return apiError(`Invalid action: ${action}. Valid actions: run_benchmark, stress_test, clear_metrics`, 400);
    }

    return apiResponse(result, {
      source,
      requestId
    });

  } catch (error) {
    console.error('[Performance API POST Error]', error);
    return apiError(
      error instanceof Error ? error.message : 'Internal performance monitoring error',
      500
    );
  }
}

// =============================================================================
// PERFORMANCE MONITORING HANDLERS
// =============================================================================

async function handlePerformanceSnapshot(): Promise<PerformanceSnapshot> {
  return performanceMonitor.getPerformanceSnapshot();
}

async function handlePerformanceBenchmarks(): Promise<{ benchmarks: PerformanceBenchmark[] }> {
  const snapshot = performanceMonitor.getPerformanceSnapshot();

  const benchmarks: PerformanceBenchmark[] = [
    {
      category: 'API Performance',
      name: 'Average Response Time',
      description: 'Mean response time across all API endpoints',
      target: 500,
      current: snapshot.performanceThresholds.apiResponseTime.current,
      unit: 'ms',
      status: snapshot.performanceThresholds.apiResponseTime.status,
      trend: 'stable',
      lastUpdated: snapshot.timestamp
    },
    {
      category: 'Calculation Performance',
      name: 'Financial Calculations',
      description: 'Time taken for complex financial calculations',
      target: 2000,
      current: snapshot.performanceThresholds.calculationTime.current,
      unit: 'ms',
      status: snapshot.performanceThresholds.calculationTime.status,
      trend: 'stable',
      lastUpdated: snapshot.timestamp
    },
    {
      category: 'Throughput',
      name: 'Request Processing Rate',
      description: 'Number of requests processed per minute',
      target: 100,
      current: snapshot.performanceThresholds.throughput.current,
      unit: 'req/min',
      status: snapshot.performanceThresholds.throughput.status,
      trend: 'stable',
      lastUpdated: snapshot.timestamp
    },
    {
      category: 'Resource Utilization',
      name: 'Memory Usage',
      description: 'Current memory consumption',
      target: 100,
      current: snapshot.systemLoad.memoryUsage,
      unit: 'MB',
      status: snapshot.systemLoad.memoryUsage < 100 ? 'healthy' :
             snapshot.systemLoad.memoryUsage < 200 ? 'warning' : 'critical',
      trend: 'stable',
      lastUpdated: snapshot.timestamp
    }
  ];

  return { benchmarks };
}

async function handleSystemHealth(): Promise<SystemHealthReport> {
  const snapshot = performanceMonitor.getPerformanceSnapshot();

  // Determine component health based on metrics
  const apiHealth = snapshot.performanceThresholds.apiResponseTime.status;
  const analyticsHealth = snapshot.performanceThresholds.calculationTime.status;
  const complianceHealth = snapshot.businessMetrics.complianceChecks > 0 ? 'healthy' : 'warning';
  const marketDataHealth = snapshot.businessMetrics.marketDataRequests > 0 ? 'healthy' : 'warning';

  // Overall health is worst of all components
  const healthPriority = { healthy: 0, warning: 1, critical: 2 };
  const overallHealth = [apiHealth, analyticsHealth, complianceHealth, marketDataHealth]
    .reduce((worst, current) =>
      healthPriority[current] > healthPriority[worst] ? current : worst
    ) as 'healthy' | 'warning' | 'critical';

  const alerts = [];
  const recommendations = [];

  // Generate alerts based on metrics
  if (snapshot.performanceThresholds.apiResponseTime.status === 'critical') {
    alerts.push({
      level: 'critical' as const,
      message: `API response time critically high: ${snapshot.performanceThresholds.apiResponseTime.current.toFixed(0)}ms`,
      timestamp: snapshot.timestamp
    });
    recommendations.push('Optimize API endpoints and consider caching strategies');
  }

  if (snapshot.performanceThresholds.calculationTime.status === 'warning') {
    alerts.push({
      level: 'warning' as const,
      message: `Calculation performance degraded: ${snapshot.performanceThresholds.calculationTime.current.toFixed(0)}ms`,
      timestamp: snapshot.timestamp
    });
    recommendations.push('Review calculation algorithms for optimization opportunities');
  }

  if (snapshot.systemLoad.memoryUsage > 150) {
    alerts.push({
      level: 'warning' as const,
      message: `High memory usage: ${snapshot.systemLoad.memoryUsage.toFixed(0)}MB`,
      timestamp: snapshot.timestamp
    });
    recommendations.push('Monitor memory usage and implement garbage collection optimizations');
  }

  return {
    overall: overallHealth,
    components: {
      apiGateway: apiHealth,
      analyticsEngine: analyticsHealth,
      complianceModule: complianceHealth,
      marketDataFeeds: marketDataHealth
    },
    alerts,
    recommendations: recommendations.length > 0 ? recommendations : ['System performance is within acceptable ranges']
  };
}

async function handleLoadTestResults(): Promise<{ loadTests: LoadTestMetrics[] }> {
  // Simulate load test results based on current metrics
  const snapshot = performanceMonitor.getPerformanceSnapshot();

  const loadTests: LoadTestMetrics[] = [
    {
      testName: 'API Gateway Load Test',
      duration: 300000, // 5 minutes
      totalRequests: 1500,
      successfulRequests: 1485,
      failedRequests: 15,
      averageResponseTime: snapshot.performanceThresholds.apiResponseTime.current,
      p95ResponseTime: snapshot.systemLoad.responseTimeP95,
      p99ResponseTime: snapshot.systemLoad.responseTimeP95 * 1.2,
      throughput: snapshot.performanceThresholds.throughput.current,
      errorRate: 1.0,
      concurrency: 50,
      timestamp: snapshot.timestamp
    },
    {
      testName: 'Analytics Calculation Stress Test',
      duration: 600000, // 10 minutes
      totalRequests: 500,
      successfulRequests: 498,
      failedRequests: 2,
      averageResponseTime: snapshot.performanceThresholds.calculationTime.current,
      p95ResponseTime: snapshot.performanceThresholds.calculationTime.current * 1.5,
      p99ResponseTime: snapshot.performanceThresholds.calculationTime.current * 2.0,
      throughput: 50,
      errorRate: 0.4,
      concurrency: 10,
      timestamp: snapshot.timestamp
    }
  ];

  return { loadTests };
}

// =============================================================================
// POST HANDLERS
// =============================================================================

const handleRunBenchmark = withPerformanceMonitoring(
  'benchmark_execution',
  async (body: any) => {
    const benchmarkType = body.benchmarkType || 'full';
    const iterations = body.iterations || 100;

    // Simulate benchmark execution
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      // Simulate various operations
      if (benchmarkType === 'full' || benchmarkType === 'api') {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      }

      if (benchmarkType === 'full' || benchmarkType === 'calculation') {
        // Simulate calculation
        Math.pow(Math.random(), Math.random());
      }

      const endTime = performance.now();
      results.push(endTime - startTime);
    }

    const averageTime = results.reduce((a, b) => a + b, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);

    return {
      benchmarkType,
      iterations,
      averageTime: averageTime.toFixed(2),
      minTime: minTime.toFixed(2),
      maxTime: maxTime.toFixed(2),
      results: results.slice(0, 10), // First 10 results as sample
      timestamp: new Date().toISOString()
    };
  },
  ['benchmark', 'performance']
);

const handleStressTest = withPerformanceMonitoring(
  'stress_test',
  async (body: any) => {
    const concurrency = body.concurrency || 10;
    const duration = Math.min(body.duration || 30000, 60000); // Max 1 minute
    const endTime = Date.now() + duration;

    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    const responseTimes = [];

    const workers = Array.from({ length: concurrency }, async () => {
      while (Date.now() < endTime) {
        const startTime = performance.now();
        totalRequests++;

        try {
          // Simulate work
          await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
          successfulRequests++;
          responseTimes.push(performance.now() - startTime);
        } catch {
          failedRequests++;
        }
      }
    });

    await Promise.all(workers);

    responseTimes.sort((a, b) => a - b);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    return {
      testDuration: duration,
      concurrency,
      totalRequests,
      successfulRequests,
      failedRequests,
      errorRate: ((failedRequests / totalRequests) * 100).toFixed(2),
      averageResponseTime: averageResponseTime.toFixed(2),
      p95ResponseTime: responseTimes[p95Index]?.toFixed(2) || '0',
      p99ResponseTime: responseTimes[p99Index]?.toFixed(2) || '0',
      throughput: (totalRequests / (duration / 1000)).toFixed(2),
      timestamp: new Date().toISOString()
    };
  },
  ['stress_test', 'performance']
);

async function handleClearMetrics(): Promise<{ message: string; timestamp: string }> {
  performanceMonitor.clearMetrics();

  return {
    message: 'Performance metrics cleared successfully',
    timestamp: new Date().toISOString()
  };
}