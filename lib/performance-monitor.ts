/**
 * WREI Performance Monitoring System
 *
 * Tracks API performance, calculation metrics, and system health
 * for institutional-grade performance requirements
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  context?: Record<string, any>;
  tags?: string[];
}

export interface PerformanceSnapshot {
  timestamp: string;
  systemLoad: {
    apiCalls: number;
    activeCalculations: number;
    memoryUsage: number;
    responseTimeP95: number;
  };
  businessMetrics: {
    negotiationsSessions: number;
    analyticsCalculations: number;
    complianceChecks: number;
    marketDataRequests: number;
  };
  performanceThresholds: {
    apiResponseTime: { target: number; current: number; status: 'healthy' | 'warning' | 'critical' };
    calculationTime: { target: number; current: number; status: 'healthy' | 'warning' | 'critical' };
    throughput: { target: number; current: number; status: 'healthy' | 'warning' | 'critical' };
  };
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private completedMetrics: PerformanceMetric[] = [];
  private readonly maxMetricsHistory = 1000;

  /**
   * Start tracking a performance metric
   */
  startMetric(name: string, context?: Record<string, any>, tags?: string[]): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const metric: PerformanceMetric = {
      id,
      name,
      startTime: performance.now(),
      context,
      tags
    };

    this.metrics.set(id, metric);
    return id;
  }

  /**
   * Complete a performance metric
   */
  endMetric(id: string, additionalContext?: Record<string, any>): PerformanceMetric | null {
    const metric = this.metrics.get(id);
    if (!metric) return null;

    const endTime = performance.now();
    const completedMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration: endTime - metric.startTime,
      context: { ...metric.context, ...additionalContext }
    };

    this.metrics.delete(id);
    this.completedMetrics.push(completedMetric);

    // Maintain history limit
    if (this.completedMetrics.length > this.maxMetricsHistory) {
      this.completedMetrics.shift();
    }

    return completedMetric;
  }

  /**
   * Get performance statistics for a metric name
   */
  getMetricStats(name: string): {
    count: number;
    averageDuration: number;
    p95Duration: number;
    p99Duration: number;
    minDuration: number;
    maxDuration: number;
  } {
    const metrics = this.completedMetrics.filter(m => m.name === name && m.duration);
    if (metrics.length === 0) {
      return { count: 0, averageDuration: 0, p95Duration: 0, p99Duration: 0, minDuration: 0, maxDuration: 0 };
    }

    const durations = metrics.map(m => m.duration!).sort((a, b) => a - b);
    const count = durations.length;
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count,
      averageDuration: sum / count,
      p95Duration: durations[Math.floor(count * 0.95)],
      p99Duration: durations[Math.floor(count * 0.99)],
      minDuration: durations[0],
      maxDuration: durations[count - 1]
    };
  }

  /**
   * Get current performance snapshot
   */
  getPerformanceSnapshot(): PerformanceSnapshot {
    const now = new Date().toISOString();
    const activeMetrics = Array.from(this.metrics.values());
    const recentMetrics = this.completedMetrics.filter(m =>
      m.endTime && (Date.now() - (m.endTime - m.startTime)) < 60000 // Last minute
    );

    // Calculate system metrics
    const apiStats = this.getMetricStats('api_request');
    const calculationStats = this.getMetricStats('calculation');

    return {
      timestamp: now,
      systemLoad: {
        apiCalls: recentMetrics.filter(m => m.tags?.includes('api')).length,
        activeCalculations: activeMetrics.filter(m => m.tags?.includes('calculation')).length,
        memoryUsage: process.memoryUsage ? process.memoryUsage().heapUsed / 1024 / 1024 : 0,
        responseTimeP95: apiStats.p95Duration
      },
      businessMetrics: {
        negotiationsSessions: recentMetrics.filter(m => m.name.includes('negotiation')).length,
        analyticsCalculations: recentMetrics.filter(m => m.name.includes('analytics')).length,
        complianceChecks: recentMetrics.filter(m => m.name.includes('compliance')).length,
        marketDataRequests: recentMetrics.filter(m => m.name.includes('market_data')).length
      },
      performanceThresholds: {
        apiResponseTime: {
          target: 500, // 500ms
          current: apiStats.averageDuration,
          status: apiStats.averageDuration < 500 ? 'healthy' : apiStats.averageDuration < 1000 ? 'warning' : 'critical'
        },
        calculationTime: {
          target: 2000, // 2 seconds
          current: calculationStats.averageDuration,
          status: calculationStats.averageDuration < 2000 ? 'healthy' : calculationStats.averageDuration < 5000 ? 'warning' : 'critical'
        },
        throughput: {
          target: 100, // 100 requests per minute
          current: recentMetrics.length,
          status: recentMetrics.length > 100 ? 'healthy' : recentMetrics.length > 50 ? 'warning' : 'critical'
        }
      }
    };
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.completedMetrics.length = 0;
  }

  /**
   * Get all completed metrics (for debugging/analysis)
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.completedMetrics];
  }
}

// Singleton instance for global use
export const performanceMonitor = new PerformanceMonitor();

/**
 * Utility function to wrap async functions with performance monitoring
 */
export function withPerformanceMonitoring<T extends any[], R>(
  name: string,
  fn: (...args: T) => Promise<R>,
  tags?: string[]
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const metricId = performanceMonitor.startMetric(name, { args: args.length }, tags);
    try {
      const result = await fn(...args);
      performanceMonitor.endMetric(metricId, { success: true });
      return result;
    } catch (error) {
      performanceMonitor.endMetric(metricId, { success: false, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  };
}

/**
 * Decorator for synchronous functions
 */
export function monitorPerformance<T extends any[], R>(
  name: string,
  fn: (...args: T) => R,
  tags?: string[]
): (...args: T) => R {
  return (...args: T): R => {
    const metricId = performanceMonitor.startMetric(name, { args: args.length }, tags);
    try {
      const result = fn(...args);
      performanceMonitor.endMetric(metricId, { success: true });
      return result;
    } catch (error) {
      performanceMonitor.endMetric(metricId, { success: false, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  };
}

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  private static cache = new Map<string, { value: any; timestamp: number; ttl: number }>();

  /**
   * Simple in-memory cache with TTL
   */
  static cached<T>(key: string, fn: () => T, ttl: number = 60000): T {
    const now = Date.now();
    const cached = this.cache.get(key);

    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.value;
    }

    const value = fn();
    this.cache.set(key, { value, timestamp: now, ttl });
    return value;
  }

  /**
   * Async cache with TTL
   */
  static async cachedAsync<T>(key: string, fn: () => Promise<T>, ttl: number = 60000): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.value;
    }

    const value = await fn();
    this.cache.set(key, { value, timestamp: now, ttl });
    return value;
  }

  /**
   * Clear cache entries
   */
  static clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Batch process items with controlled concurrency
   */
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }

    return results;
  }
}

export default performanceMonitor;