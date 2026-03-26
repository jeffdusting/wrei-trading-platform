/**
 * WREI Trading Platform - Analytics Components Export
 *
 * Step 1.4: Enhanced Negotiation Analytics - Central Component Exports
 * Consolidated exports for all analytics components and utilities
 *
 * Date: March 25, 2026
 */

// Core Types
export type {
  AnalyticsTimeframe,
  MetricType,
  ChartType,
  BenchmarkType,
  NegotiationMetrics,
  PerformanceBenchmark,
  MarketComparisonData,
  RiskAssessmentData,
  OperationalRisk,
  MarketRisk,
  RegulatoryRisk,
  CounterpartyRisk,
  SettlementRisk,
  VisualizationConfig,
  AnalyticsReport,
  AnalyticsState
} from './types';

// Core Engine
export { AnalyticsEngine } from './AnalyticsEngine';

// React Components
export { default as AnalyticsDashboard } from './AnalyticsDashboard';
export { default as RealTimeMetricsWidget } from './RealTimeMetricsWidget';
export { default as PerformanceChart } from './PerformanceChart';

// React Hooks
export { useAnalytics } from './useAnalytics';

// Component Props Types
export type { default as AnalyticsDashboardProps } from './AnalyticsDashboard';
export type { default as RealTimeMetricsWidgetProps } from './RealTimeMetricsWidget';
export type { default as PerformanceChartProps } from './PerformanceChart';

// Analytics Utilities
export const AnalyticsUtils = {
  /**
   * Format currency values for display
   */
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  /**
   * Format percentage values for display
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return (value * 100).toFixed(decimals) + '%';
  },

  /**
   * Format large numbers with appropriate units
   */
  formatNumber: (value: number): string => {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1) + 'B';
    }
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + 'M';
    }
    if (value >= 1_000) {
      return (value / 1_000).toFixed(1) + 'k';
    }
    return value.toFixed(0);
  },

  /**
   * Get color based on performance score
   */
  getPerformanceColor: (score: number, thresholds = { good: 80, fair: 60 }): string => {
    if (score >= thresholds.good) return 'green';
    if (score >= thresholds.fair) return 'yellow';
    return 'red';
  },

  /**
   * Get risk level based on risk score
   */
  getRiskLevel: (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score <= 20) return 'low';
    if (score <= 40) return 'medium';
    if (score <= 70) return 'high';
    return 'critical';
  },

  /**
   * Calculate trend direction
   */
  calculateTrend: (current: number, previous: number): 'up' | 'down' | 'stable' => {
    const threshold = 0.02; // 2% threshold for stability
    const change = (current - previous) / previous;

    if (Math.abs(change) < threshold) return 'stable';
    return change > 0 ? 'up' : 'down';
  },

  /**
   * Generate color scheme for charts
   */
  generateColorScheme: (count: number): string[] => {
    const baseColors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#F97316', // Orange
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#EC4899', // Pink
      '#6366F1'  // Indigo
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Generate additional colors if needed
    const colors = [...baseColors];
    while (colors.length < count) {
      const hue = (colors.length * 360) / count;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }

    return colors;
  },

  /**
   * Export data to CSV format
   */
  exportToCsv: (data: any[], filename: string = 'analytics-data.csv'): void => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  /**
   * Calculate moving average
   */
  calculateMovingAverage: (data: number[], window: number): number[] => {
    if (data.length < window) return data;

    const result: number[] = [];
    for (let i = window - 1; i < data.length; i++) {
      const slice = data.slice(i - window + 1, i + 1);
      const average = slice.reduce((sum, value) => sum + value, 0) / window;
      result.push(average);
    }

    return result;
  },

  /**
   * Get benchmark comparison result
   */
  getBenchmarkComparison: (current: number, benchmark: number): {
    percentage: number;
    direction: 'above' | 'below' | 'equal';
    category: 'excellent' | 'good' | 'fair' | 'poor';
  } => {
    const percentage = ((current - benchmark) / benchmark) * 100;
    const direction = current > benchmark ? 'above' : current < benchmark ? 'below' : 'equal';

    let category: 'excellent' | 'good' | 'fair' | 'poor';
    if (percentage >= 20) category = 'excellent';
    else if (percentage >= 5) category = 'good';
    else if (percentage >= -5) category = 'fair';
    else category = 'poor';

    return {
      percentage: Math.abs(percentage),
      direction,
      category
    };
  },

  /**
   * Validate metrics data
   */
  validateMetrics: (metrics: Partial<NegotiationMetrics>): boolean => {
    const required = [
      'session_id',
      'scenario_id',
      'timestamp',
      'performance',
      'market_position',
      'risk_metrics',
      'efficiency',
      'esc_metrics'
    ];

    return required.every(field => field in metrics && metrics[field as keyof NegotiationMetrics] !== null);
  }
};

// Default Analytics Configuration
export const DEFAULT_ANALYTICS_CONFIG = {
  refreshInterval: 5000, // 5 seconds
  autoRefresh: true,
  defaultTimeframe: '1d' as AnalyticsTimeframe,
  maxDataPoints: 100,
  chartHeight: 300,
  showLegend: true,
  showComparison: true,
  alertThresholds: {
    performance: 80,
    risk: 30,
    compliance: 95
  }
};

// Analytics Event Types for tracking
export const ANALYTICS_EVENTS = {
  SESSION_START: 'analytics_session_start',
  SESSION_STOP: 'analytics_session_stop',
  DATA_REFRESH: 'analytics_data_refresh',
  CHART_INTERACTION: 'analytics_chart_interaction',
  EXPORT_DATA: 'analytics_export_data',
  THRESHOLD_ALERT: 'analytics_threshold_alert',
  BENCHMARK_UPDATE: 'analytics_benchmark_update'
} as const;

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];