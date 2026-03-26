/**
 * WREI Trading Platform - Intelligent Analytics Hook
 *
 * Stage 2 Component 3: React hook for AI-Enhanced Analytics
 * Manages state and API interactions for intelligent analytics dashboard
 *
 * Date: March 26, 2026
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PredictiveAnalytics,
  MarketForecast,
  RiskPredictions,
  PerformanceOptimisation,
  CompetitiveIntelligence,
  IntelligentAnalyticsState,
  AIInsights
} from './types';
import { AudienceType } from '../audience';

// Hook state interface
interface UseIntelligentAnalyticsState {
  // Data state
  predictiveAnalytics: PredictiveAnalytics | null;
  marketForecast: MarketForecast | null;
  riskPredictions: RiskPredictions | null;
  performanceOptimisation: PerformanceOptimisation | null;
  competitiveIntelligence: CompetitiveIntelligence | null;
  aiInsights: AIInsights | null;

  // Loading states
  isLoading: boolean;
  isGeneratingPredictions: boolean;
  isRefreshing: boolean;

  // Error states
  error: string | null;
  apiError: string | null;

  // Performance metrics
  lastUpdateTime: Date | null;
  apiResponseTime: number;
  cacheHitRate: number;

  // Engine status
  engineStatus: 'initialising' | 'active' | 'processing' | 'error' | 'offline';
  engineHealth: 'healthy' | 'degraded' | 'unhealthy';
}

// Hook configuration
interface UseIntelligentAnalyticsConfig {
  sessionId: string;
  audienceType: AudienceType;
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
  enableRealTimeUpdates?: boolean;
  confidenceThreshold?: number; // 0-100
}

// API response interface
interface PredictionAPIResponse {
  success: boolean;
  data: any;
  metadata: {
    sessionId: string;
    audienceType: string;
    action: string;
    processingTime: number;
    timestamp: string;
    source: string;
  };
  error?: string;
  code?: string;
}

export function useIntelligentAnalytics(config: UseIntelligentAnalyticsConfig) {
  const {
    sessionId,
    audienceType,
    autoRefresh = true,
    refreshInterval = 5,
    enableRealTimeUpdates = true,
    confidenceThreshold = 70
  } = config;

  // State management
  const [state, setState] = useState<UseIntelligentAnalyticsState>({
    predictiveAnalytics: null,
    marketForecast: null,
    riskPredictions: null,
    performanceOptimisation: null,
    competitiveIntelligence: null,
    aiInsights: null,
    isLoading: false,
    isGeneratingPredictions: false,
    isRefreshing: false,
    error: null,
    apiError: null,
    lastUpdateTime: null,
    apiResponseTime: 0,
    cacheHitRate: 0,
    engineStatus: 'initialising',
    engineHealth: 'healthy'
  });

  // Refs for cleanup and caching
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSuccessfulFetchRef = useRef<Date | null>(null);

  /**
   * Make API call to prediction endpoint
   */
  const makeAPICall = useCallback(async (
    action: string,
    additionalData: Record<string, any> = {}
  ): Promise<PredictionAPIResponse> => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const startTime = Date.now();

      const response = await fetch('/api/analytics/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          sessionId,
          audienceType,
          ...additionalData
        }),
        signal: abortControllerRef.current.signal
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: PredictionAPIResponse = await response.json();

      // Update performance metrics
      setState(prev => ({
        ...prev,
        apiResponseTime: responseTime,
        error: null,
        apiError: null
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';

      setState(prev => ({
        ...prev,
        error: errorMessage,
        apiError: errorMessage
      }));

      throw error;
    }
  }, [sessionId, audienceType]);

  /**
   * Generate full predictive analytics
   */
  const generateFullAnalysis = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    setState(prev => ({
      ...prev,
      isGeneratingPredictions: true,
      error: null,
      isLoading: true
    }));

    try {
      const response = await makeAPICall('generate_full_analysis', { forceRefresh });

      if (response.success && response.data) {
        const analytics: PredictiveAnalytics = response.data;

        setState(prev => ({
          ...prev,
          predictiveAnalytics: analytics,
          marketForecast: analytics.market_forecast,
          riskPredictions: analytics.risk_predictions,
          performanceOptimisation: analytics.performance_optimisation,
          competitiveIntelligence: analytics.competitive_intelligence,
          aiInsights: analytics.ai_insights,
          lastUpdateTime: new Date(),
          engineStatus: 'active'
        }));

        lastSuccessfulFetchRef.current = new Date();
      } else {
        throw new Error(response.error || 'Failed to generate analysis');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate analysis';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        engineStatus: 'error'
      }));

      console.error('[useIntelligentAnalytics] Generation failed:', error);
    } finally {
      setState(prev => ({
        ...prev,
        isGeneratingPredictions: false,
        isLoading: false
      }));
    }
  }, [makeAPICall]);

  /**
   * Generate specific prediction component
   */
  const generateSpecificPrediction = useCallback(async (
    predictionType: 'market_forecast' | 'risk_predictions' | 'performance_optimisation' | 'competitive_intelligence'
  ): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const actionMap = {
        market_forecast: 'generate_market_forecast',
        risk_predictions: 'generate_risk_predictions',
        performance_optimisation: 'generate_performance_optimisation',
        competitive_intelligence: 'generate_competitive_intelligence'
      };

      const response = await makeAPICall(actionMap[predictionType]);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          [predictionType]: response.data,
          lastUpdateTime: new Date(),
          engineStatus: 'active'
        }));
      } else {
        throw new Error(response.error || `Failed to generate ${predictionType}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to generate ${predictionType}`;
      setState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [makeAPICall]);

  /**
   * Refresh predictions (manual refresh)
   */
  const refreshPredictions = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    await generateFullAnalysis(true);
    setState(prev => ({ ...prev, isRefreshing: false }));
  }, [generateFullAnalysis]);

  /**
   * Get engine health and performance metrics
   */
  const getEngineHealth = useCallback(async (): Promise<void> => {
    try {
      const [healthResponse, metricsResponse] = await Promise.all([
        makeAPICall('engine_health'),
        makeAPICall('performance_metrics')
      ]);

      if (healthResponse.success && metricsResponse.success) {
        setState(prev => ({
          ...prev,
          engineHealth: healthResponse.data.status,
          cacheHitRate: metricsResponse.data.cache_hit_rate || 0,
          engineStatus: healthResponse.data.details.engine_status
        }));
      }

    } catch (error) {
      console.warn('[useIntelligentAnalytics] Health check failed:', error);
      setState(prev => ({
        ...prev,
        engineHealth: 'degraded'
      }));
    }
  }, [makeAPICall]);

  /**
   * Clear predictions cache
   */
  const clearCache = useCallback((): void => {
    setState(prev => ({
      ...prev,
      predictiveAnalytics: null,
      marketForecast: null,
      riskPredictions: null,
      performanceOptimisation: null,
      competitiveIntelligence: null,
      aiInsights: null,
      lastUpdateTime: null,
      cacheHitRate: 0
    }));

    lastSuccessfulFetchRef.current = null;
  }, []);

  /**
   * Setup automatic refresh
   */
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const scheduleNextRefresh = () => {
        refreshTimeoutRef.current = setTimeout(() => {
          if (!state.isGeneratingPredictions && !state.isLoading) {
            generateFullAnalysis(false);
          }
          scheduleNextRefresh();
        }, refreshInterval * 60 * 1000); // Convert minutes to milliseconds
      };

      scheduleNextRefresh();

      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
      };
    }
  }, [autoRefresh, refreshInterval, generateFullAnalysis, state.isGeneratingPredictions, state.isLoading]);

  /**
   * Initial data load
   */
  useEffect(() => {
    if (sessionId && audienceType) {
      generateFullAnalysis(false);
      getEngineHealth();
    }
  }, [sessionId, audienceType, generateFullAnalysis, getEngineHealth]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Real-time updates (placeholder for WebSocket integration)
  useEffect(() => {
    if (enableRealTimeUpdates) {
      // In production, this would establish WebSocket connection
      // for real-time prediction updates
      console.log('[useIntelligentAnalytics] Real-time updates enabled');
    }
  }, [enableRealTimeUpdates]);

  /**
   * Derived state for convenience
   */
  const hasValidPredictions = Boolean(
    state.predictiveAnalytics &&
    state.lastUpdateTime &&
    (Date.now() - state.lastUpdateTime.getTime()) < (refreshInterval * 60 * 1000 * 2) // Valid for 2x refresh interval
  );

  const predictionAge = state.lastUpdateTime
    ? Math.floor((Date.now() - state.lastUpdateTime.getTime()) / 1000)
    : null;

  const isDataStale = predictionAge !== null && predictionAge > (refreshInterval * 60 * 1.5);

  /**
   * Confidence-filtered predictions
   */
  const getHighConfidencePredictions = useCallback(() => {
    if (!state.predictiveAnalytics) return null;

    const filtered = { ...state.predictiveAnalytics };

    // Filter market forecast predictions by confidence
    if (filtered.market_forecast?.price_prediction) {
      filtered.market_forecast.price_prediction =
        filtered.market_forecast.price_prediction.filter(
          pred => pred.confidence >= confidenceThreshold
        );
    }

    return filtered;
  }, [state.predictiveAnalytics, confidenceThreshold]);

  // Return hook interface
  return {
    // Data
    ...state,
    hasValidPredictions,
    isDataStale,
    predictionAge,

    // Filtered data
    highConfidencePredictions: getHighConfidencePredictions(),

    // Actions
    generateFullAnalysis,
    generateSpecificPrediction,
    refreshPredictions,
    getEngineHealth,
    clearCache,

    // Utilities
    makeAPICall
  };
}

export type { UseIntelligentAnalyticsState, UseIntelligentAnalyticsConfig };