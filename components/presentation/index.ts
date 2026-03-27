/**
 * WREI Trading Platform - Presentation Components Index
 * Stage 2 Component 4: Adaptive Presentation Layer Exports
 *
 * Central export hub for all adaptive presentation components and hooks.
 * Provides AI-powered presentation adaptation, audience engagement monitoring,
 * and real-time content optimisation for multi-stakeholder demonstrations.
 *
 * @version 1.0.0
 * @author Claude Sonnet 4 (Stage 2 Component 4 Index)
 * @date 2026-03-26
 */

// Import types for internal use
import type {
  AdaptivePresentationState,
  AdaptivePresentationPerformanceMetrics
} from '../analytics/types';

// Core Engine Export
export {
  AdaptivePresentationEngine,
  getAdaptivePresentationEngine
} from '../../lib/ai-presentation/AdaptivePresentationEngine';

// React Hook Exports
export {
  useAdaptivePresentation,
  useEngagementMonitoring
} from './useAdaptivePresentation';

// Main Component Export
export {
  AdaptivePresentationDashboard,
  default as AdaptivePresentationDashboardDefault
} from './AdaptivePresentationDashboard';

// Type Exports for Adaptive Presentation
export type {
  // Core State and Configuration
  AdaptivePresentationState,
  AdaptivePresentationOperation,
  AdaptivePresentationContext,
  AdaptivePresentationEngagementData,
  AdaptivePresentationAPIRequest,
  AdaptivePresentationAPIResponse,

  // Engagement and Metrics
  EngagementMetrics,
  EngagementHistoryEntry,
  EngagementTrend,

  // Content Adaptation
  ContentAdaptation,
  PacePreference,
  ContentDepth,
  VisualPreference,
  InteractionStyle,

  // Presentation Flow
  PresentationFlow,
  PresentationHealth,

  // Feedback and Personalisation
  RealTimeFeedback,
  PersonalisationProfile,
  AudienceResponse,

  // API Response Types
  PresentationAdaptationResponse,
  EngagementAnalysis,
  FlowOptimisation,
  PresentationSessionSummary,
  AdaptivePresentationPerformanceMetrics,

  // System Health
  SystemHealth
} from '../analytics/types';

// Re-export common types for convenience
export type { AudienceType } from '../audience';

// Version and metadata
export const ADAPTIVE_PRESENTATION_VERSION = '1.0.0';
export const COMPONENT_NAME = 'AdaptivePresentationLayer';
export const IMPLEMENTATION_DATE = '2026-03-26';

// Component feature flags and configuration
export const ADAPTIVE_PRESENTATION_FEATURES = {
  REAL_TIME_ENGAGEMENT_MONITORING: true,
  AI_CONTENT_ADAPTATION: true,
  AUDIENCE_PERSONALISATION: true,
  PRESENTATION_FLOW_OPTIMISATION: true,
  PERFORMANCE_ANALYTICS: true,
  CLAUDE_API_INTEGRATION: true,
  MULTI_AUDIENCE_SUPPORT: true,
  CACHING_AND_OPTIMISATION: true,
  ERROR_RESILIENCE: true,
  NSW_ESC_CONTEXT_INTEGRATION: true
} as const;

// Performance targets and SLA definitions
export const PERFORMANCE_TARGETS = {
  ENGAGEMENT_MONITORING_RESPONSE_TIME: 100, // milliseconds
  ADAPTATION_GENERATION_TIME: 500, // milliseconds
  API_RESPONSE_TARGET: 2000, // milliseconds
  CACHE_HIT_RATE_TARGET: 85, // percentage
  SYSTEM_UPTIME_TARGET: 99.5, // percentage
  ENGAGEMENT_PREDICTION_ACCURACY: 85 // percentage
} as const;

// Default configuration values
export const DEFAULT_CONFIGURATION = {
  AUTO_REFRESH: true,
  CACHE_DURATION: {
    executive: 8 * 60 * 1000,    // 8 minutes
    technical: 3 * 60 * 1000,    // 3 minutes
    compliance: 5 * 60 * 1000    // 5 minutes
  },
  ENGAGEMENT_THRESHOLDS: {
    ATTENTION_DROP_CRITICAL: 40,
    ATTENTION_DROP_WARNING: 60,
    INTERACTION_RATE_LOW: 0.5,
    COMPREHENSION_CRITICAL: 50
  },
  ADAPTATION_TRIGGERS: {
    MIN_CONFIDENCE_LEVEL: 0.7,
    HIGH_PRIORITY_URGENCY: 0.8,
    AUTOMATIC_ADAPTATION_THRESHOLD: 50 // attention level
  }
} as const;

// Australian market context constants
export const AUSTRALIAN_MARKET_CONTEXT = {
  MARKET_SEGMENT: 'NSW ESC Trading Platform',
  CURRENT_SPOT_PRICE: 47.80, // A$ per tonne (March 2026)
  ANNUAL_MARKET_VOLUME: 200_000_000, // A$ 200M+
  ACTIVE_PARTICIPANTS: 850,
  REGULATORY_FRAMEWORK: 'CER oversight with ESS compliance',
  SETTLEMENT_TYPE: 'T+0 atomic settlement'
} as const;

// Component status and health indicators
export const COMPONENT_STATUS = {
  DEVELOPMENT_STAGE: 'Stage 2 Component 4',
  STATUS: 'COMPLETE',
  INTEGRATION_POINTS: [
    'DemoOrchestrationEngine',
    'DynamicScenarioEngine',
    'IntelligentAnalyticsEngine',
    'Claude API'
  ],
  SUPPORTED_AUDIENCES: ['executive', 'technical', 'compliance'],
  API_ENDPOINTS: ['/api/presentation/adapt'],
  TEST_COVERAGE: '44 comprehensive tests'
} as const;

/**
 * Utility function to check if adaptive presentation features are available
 */
export function isAdaptivePresentationEnabled(): boolean {
  return Object.values(ADAPTIVE_PRESENTATION_FEATURES).every(feature => feature === true);
}

/**
 * Utility function to get performance targets for monitoring
 */
export function getPerformanceTargets() {
  return { ...PERFORMANCE_TARGETS };
}

/**
 * Utility function to get default configuration
 */
export function getDefaultConfiguration() {
  return { ...DEFAULT_CONFIGURATION };
}

/**
 * Utility function to get Australian market context
 */
export function getAustralianMarketContext() {
  return { ...AUSTRALIAN_MARKET_CONTEXT };
}

/**
 * Utility function to validate audience type
 */
export function isValidAudienceType(audience: string): audience is 'executive' | 'technical' | 'compliance' {
  return ['executive', 'technical', 'compliance'].includes(audience);
}

/**
 * Utility function to get cache duration for audience type
 */
export function getCacheDurationForAudience(audienceType: 'executive' | 'technical' | 'compliance'): number {
  return DEFAULT_CONFIGURATION.CACHE_DURATION[audienceType];
}

/**
 * Utility function to check if attention level requires intervention
 */
export function requiresAttentionIntervention(attentionLevel: number): 'critical' | 'warning' | 'normal' {
  if (attentionLevel < DEFAULT_CONFIGURATION.ENGAGEMENT_THRESHOLDS.ATTENTION_DROP_CRITICAL) {
    return 'critical';
  } else if (attentionLevel < DEFAULT_CONFIGURATION.ENGAGEMENT_THRESHOLDS.ATTENTION_DROP_WARNING) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Utility function to format performance metrics for display
 */
export function formatPerformanceMetric(value: number, type: 'percentage' | 'milliseconds' | 'decimal'): string {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'milliseconds':
      return `${value.toFixed(0)}ms`;
    case 'decimal':
      return value.toFixed(2);
    default:
      return value.toString();
  }
}

/**
 * Development and debugging utilities
 */
export const DEBUG_UTILITIES = {
  /**
   * Log adaptive presentation state for debugging
   */
  logAdaptivePresentationState: (state: AdaptivePresentationState) => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🎯 Adaptive Presentation State Debug');
      console.log('Session Active:', state.isActive);
      console.log('Current Audience:', state.currentAudience);
      console.log('Engagement Level:', state.engagementMetrics.attentionLevel);
      console.log('System Health:', state.systemHealth);
      console.log('API Response Time:', state.apiResponseTime);
      console.groupEnd();
    }
  },

  /**
   * Log performance metrics for monitoring
   */
  logPerformanceMetrics: (metrics: AdaptivePresentationPerformanceMetrics) => {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Adaptive Presentation Performance');
      console.log('System Health:', metrics.systemHealth);
      console.log('API Response Time:', `${metrics.apiResponseTime.toFixed(0)}ms`);
      console.log('Adaptation Accuracy:', `${metrics.adaptationAccuracy.toFixed(1)}%`);
      console.log('Cache Hit Rate:', `${metrics.cacheHitRate.toFixed(1)}%`);
      console.log('System Uptime:', `${metrics.systemUptime.toFixed(2)}%`);
      console.groupEnd();
    }
  }
} as const;