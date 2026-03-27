/**
 * Analytics Utilities - Test Support
 * Provides utility functions for analytics calculations and formatting
 */

export const AnalyticsUtils = {
  formatCurrency: (amount: number): string => {
    if (amount >= 1000000) {
      return `$${Math.round(amount / 1000000)}M`;
    } else if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`;
    }
    return `$${Math.round(amount).toLocaleString()}`;
  },

  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  formatNumber: (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  },

  getPerformanceColor: (score: number): string => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  },

  getRiskLevel: (score: number): string => {
    if (score < 20) return 'low';
    if (score < 40) return 'medium';
    if (score < 70) return 'high';
    return 'critical';
  },

  calculateTrend: (current: number, previous: number): string => {
    const diff = ((current - previous) / previous) * 100;
    if (diff > 2) return 'up';
    if (diff < -2) return 'down';
    return 'stable';
  },

  validateMetrics: (metrics: any): boolean => {
    return metrics && typeof metrics === 'object' && Object.keys(metrics).length > 0;
  },

  calculateMovingAverage: (data: number[], window: number): number[] => {
    const result = [];
    for (let i = 0; i <= data.length - window; i++) {
      const windowSum = data.slice(i, i + window).reduce((a, b) => a + b, 0);
      result.push(windowSum / window);
    }
    return result;
  },

  getBenchmarkComparison: (value: number, benchmark: number) => {
    const percentage = Math.abs(((value - benchmark) / benchmark) * 100);
    const direction = value > benchmark ? 'above' : 'below';
    let category = 'poor';

    if (direction === 'above' && percentage > 15) category = 'excellent';
    else if (direction === 'above' && percentage > 5) category = 'good';
    else if (direction === 'below' && percentage < 5) category = 'good';

    return { percentage, direction, category };
  },

  generateColorScheme: (count: number): string[] => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1',
      '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'
    ];

    return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
  }
};