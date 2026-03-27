/**
 * WREI Trading Platform - Analytics Components Index
 *
 * Stage 2 Component 3: Intelligent Analytics Dashboard
 * AI-enhanced analytics with predictive insights
 *
 * Date: March 26, 2026
 */

// Core Analytics Components (Stage 1)
export { IntelligentAnalyticsDashboard as AnalyticsDashboard } from './IntelligentAnalyticsDashboard';
export { RealTimeMetricsWidget } from './RealTimeMetricsWidget';
export { PerformanceChart } from './PerformanceChart';
export { useAnalytics } from './useAnalytics';

// Stage 2 Component 3: Intelligent Analytics
export { IntelligentAnalyticsDashboard } from './IntelligentAnalyticsDashboard';
export { useIntelligentAnalytics } from './useIntelligentAnalytics';

// Core Analytics Engine
export { AnalyticsEngine } from './AnalyticsEngine';

// Analytics Utilities
export { AnalyticsUtils } from '../../lib/analytics-utils';

// Re-export core analytics types
export type {
  NegotiationMetrics,
  PerformanceBenchmark,
  MarketComparisonData,
  RiskAssessmentData,
  AnalyticsTimeframe,
  MetricType,
  ChartType,
  BenchmarkType,
  VisualizationConfig,
  AnalyticsReport,
  AnalyticsState
} from './types';

// Re-export intelligent analytics types
export type {
  PredictiveAnalytics,
  MarketForecast,
  RiskPredictions,
  PerformanceOptimisation,
  CompetitiveIntelligence,
  AIInsights,
  IntelligentAnalyticsState,
  PredictionConfidence,
  PredictionTimeframe,
  RiskLevel,
  TrendSignal
} from './types';

// Re-export hook types
export type {
  UseIntelligentAnalyticsState,
  UseIntelligentAnalyticsConfig
} from './useIntelligentAnalytics';

// Re-export types for convenience (legacy compatibility)
export type {
  AdvancedAnalyticsDashboard,
  PredictiveModel,
  SentimentAnalysis,
  RiskMetrics,
  PortfolioOptimization
} from '@/lib/advanced-analytics';
