/**
 * WREI Trading Platform - Stage 2 Component 4 React Hook
 * Adaptive Presentation Hook
 *
 * React hook for AI-powered presentation adaptation functionality.
 * Provides state management, API integration, and real-time adaptation
 * capabilities for multi-audience demonstrations.
 *
 * Features:
 * - Real-time engagement monitoring and adaptation
 * - Audience-specific personalisation (Executive/Technical/Compliance)
 * - AI-enhanced content adaptation with Claude API integration
 * - Performance tracking and continuous improvement
 * - Caching and optimisation for responsive user experience
 *
 * @version 1.0.0
 * @author Claude Sonnet 4 (Stage 2 Component 4 Hook Implementation)
 * @date 2026-03-26
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AdaptivePresentationState,
  EngagementMetrics,
  ContentAdaptation,
  PresentationFlow,
  RealTimeFeedback,
  PersonalisationProfile
} from '@/lib/ai-presentation/AdaptivePresentationEngine';

/**
 * Adaptive presentation API response types
 */
interface AdaptationResponse {
  adaptationSuggestions: string[];
  contentModifications: string[];
  paceAdjustments: string[];
  interactionRecommendations: string[];
  claudeEnhanced?: any;
  confidence: number;
}

interface EngagementAnalysis {
  insights: string[];
  recommendations: string[];
  nextActions: string[];
  confidence: number;
  detailedAnalysis?: {
    assessment: string;
    riskFactors: string[];
    positiveIndicators: string[];
    immediateActions: string[];
  };
}

interface FlowOptimization {
  currentFlow: PresentationFlow;
  optimization: {
    flowOptimization: string[];
    sectionPriority: string[];
    timeManagement: string[];
    transitions: string[];
  };
}

interface SessionSummary {
  sessionSummary: {
    duration: number;
    averageEngagement: number;
    totalInteractions: number;
    adaptations: number;
    overallEffectiveness: number;
  };
  insights: string[];
  recommendations: string[];
}

/**
 * Hook state interface
 */
interface UseAdaptivePresentationState {
  // Core state
  presentationState: AdaptivePresentationState | null;
  isSessionActive: boolean;
  currentAudience: 'executive' | 'technical' | 'compliance';

  // Adaptation data
  currentAdaptation: AdaptationResponse | null;
  engagementAnalysis: EngagementAnalysis | null;
  flowOptimization: FlowOptimization | null;

  // Performance and status
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  apiResponseTime: number;

  // Cache status
  cacheStatus: {
    adaptationCached: boolean;
    analysisCached: boolean;
    optimizationCached: boolean;
    cacheExpiry: Date | null;
  };
}

/**
 * Cache configuration
 */
const CACHE_DURATION = {
  executive: 8 * 60 * 1000,    // 8 minutes for executive (slower pace)
  technical: 3 * 60 * 1000,    // 3 minutes for technical (faster updates)
  compliance: 5 * 60 * 1000    // 5 minutes for compliance (moderate pace)
};

/**
 * Custom hook for adaptive presentation management
 */
export function useAdaptivePresentation(
  initialAudience: 'executive' | 'technical' | 'compliance' = 'executive',
  autoRefresh: boolean = true
) {
  // Core state
  const [state, setState] = useState<UseAdaptivePresentationState>({
    presentationState: null,
    isSessionActive: false,
    currentAudience: initialAudience,
    currentAdaptation: null,
    engagementAnalysis: null,
    flowOptimization: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    apiResponseTime: 0,
    cacheStatus: {
      adaptationCached: false,
      analysisCached: false,
      optimizationCached: false,
      cacheExpiry: null
    }
  });

  // Refs for timers and cache management
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const adaptationCache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const requestQueue = useRef<Set<string>>(new Set());

  /**
   * Generate cache key based on operation and context
   */
  const generateCacheKey = useCallback((
    operation: string,
    audienceType: string,
    context?: any
  ): string => {
    const contextHash = context ? JSON.stringify(context).substring(0, 50) : '';
    return `${operation}_${audienceType}_${contextHash}`;
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((
    cacheKey: string,
    audienceType: 'executive' | 'technical' | 'compliance'
  ): boolean => {
    const cached = adaptationCache.current.get(cacheKey);
    if (!cached) return false;

    const cacheAge = Date.now() - cached.timestamp;
    const maxAge = CACHE_DURATION[audienceType];
    return cacheAge < maxAge;
  }, []);

  /**
   * Make API request with caching and deduplication
   */
  const makeAPIRequest = useCallback(async (
    operation: string,
    data: any,
    skipCache: boolean = false
  ): Promise<any> => {
    const cacheKey = generateCacheKey(operation, state.currentAudience, data);

    // Check cache first (unless skipping)
    if (!skipCache && isCacheValid(cacheKey, state.currentAudience)) {
      const cached = adaptationCache.current.get(cacheKey);
      return cached!.data;
    }

    // Check if request is already in progress
    if (requestQueue.current.has(cacheKey)) {
      // Wait for existing request
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!requestQueue.current.has(cacheKey)) {
            clearInterval(checkInterval);
            const cached = adaptationCache.current.get(cacheKey);
            resolve(cached ? cached.data : null);
          }
        }, 100);
      });
    }

    // Add to request queue
    requestQueue.current.add(cacheKey);

    try {
      const startTime = performance.now();

      const response = await fetch('/api/presentation/adapt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          audienceType: state.currentAudience,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const responseTime = performance.now() - startTime;

      // Update response time in state
      setState(prev => ({ ...prev, apiResponseTime: responseTime }));

      // Cache the result
      adaptationCache.current.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error(`API request failed for ${operation}:`, error);
      throw error;
    } finally {
      // Remove from request queue
      requestQueue.current.delete(cacheKey);
    }
  }, [state.currentAudience, generateCacheKey, isCacheValid]);

  /**
   * Start presentation session
   */
  const startSession = useCallback(async (
    audienceType: 'executive' | 'technical' | 'compliance' = state.currentAudience,
    customProfile?: Partial<PersonalisationProfile>
  ): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await makeAPIRequest('start_session', {
        audienceType,
        context: { customProfile }
      }, true); // Skip cache for session start

      if (response.success) {
        setState(prev => ({
          ...prev,
          presentationState: response.data.sessionState,
          isSessionActive: true,
          currentAudience: audienceType,
          lastUpdated: new Date(),
          isLoading: false
        }));

        // Start auto-refresh if enabled
        if (autoRefresh) {
          startAutoRefresh();
        }
      } else {
        throw new Error(response.error || 'Failed to start presentation session');
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start session',
        isLoading: false
      }));
    }
  }, [state.currentAudience, makeAPIRequest, autoRefresh]);

  /**
   * Generate content adaptation recommendations
   */
  const generateAdaptation = useCallback(async (context: {
    currentSection?: string;
    timeRemaining?: number;
    engagementData?: Partial<EngagementMetrics>;
  }): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await makeAPIRequest('generate_adaptation', {
        context,
        engagementData: context.engagementData || {}
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          currentAdaptation: response.data,
          lastUpdated: new Date(),
          isLoading: false,
          cacheStatus: {
            ...prev.cacheStatus,
            adaptationCached: true,
            cacheExpiry: new Date(Date.now() + CACHE_DURATION[prev.currentAudience])
          }
        }));
      } else {
        throw new Error(response.error || 'Failed to generate adaptation');
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate adaptation',
        isLoading: false
      }));
    }
  }, [makeAPIRequest]);

  /**
   * Analyze engagement patterns
   */
  const analyzeEngagement = useCallback(async (
    engagementData: Partial<EngagementMetrics>
  ): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await makeAPIRequest('analyze_engagement', {
        engagementData
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          engagementAnalysis: response.data,
          lastUpdated: new Date(),
          isLoading: false,
          cacheStatus: {
            ...prev.cacheStatus,
            analysisCached: true,
            cacheExpiry: new Date(Date.now() + CACHE_DURATION[prev.currentAudience])
          }
        }));
      } else {
        throw new Error(response.error || 'Failed to analyze engagement');
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze engagement',
        isLoading: false
      }));
    }
  }, [makeAPIRequest]);

  /**
   * Optimize presentation flow
   */
  const optimizeFlow = useCallback(async (context: {
    currentSection?: string;
    sectionProgress?: number;
    totalSections?: number;
    timeRemaining?: number;
  }): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await makeAPIRequest('optimize_flow', { context });

      if (response.success) {
        setState(prev => ({
          ...prev,
          flowOptimization: response.data,
          lastUpdated: new Date(),
          isLoading: false,
          cacheStatus: {
            ...prev.cacheStatus,
            optimizationCached: true,
            cacheExpiry: new Date(Date.now() + CACHE_DURATION[prev.currentAudience])
          }
        }));
      } else {
        throw new Error(response.error || 'Failed to optimize flow');
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to optimize flow',
        isLoading: false
      }));
    }
  }, [makeAPIRequest]);

  /**
   * Generate comprehensive insights
   */
  const generateInsights = useCallback(async (context: {
    currentSection?: string;
    engagementData?: Partial<EngagementMetrics>;
    timeRemaining?: number;
  }): Promise<EngagementAnalysis | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await makeAPIRequest('generate_insights', {
        context,
        engagementData: context.engagementData || {}
      });

      if (response.success) {
        const insights = response.data;
        setState(prev => ({
          ...prev,
          engagementAnalysis: insights,
          lastUpdated: new Date(),
          isLoading: false
        }));
        return insights;
      } else {
        throw new Error(response.error || 'Failed to generate insights');
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate insights',
        isLoading: false
      }));
      return null;
    }
  }, [makeAPIRequest]);

  /**
   * Record audience question for analysis
   */
  const recordQuestion = useCallback(async (
    question: string,
    complexity: 'basic' | 'intermediate' | 'advanced' = 'intermediate',
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> => {
    // This would typically update the local state and potentially trigger
    // a re-analysis of engagement patterns

    // For now, we'll trigger a new engagement analysis
    const updatedEngagement: Partial<EngagementMetrics> = {
      questionFrequency: (state.presentationState?.engagementMetrics.questionFrequency || 0) + 1,
      interactionRate: (state.presentationState?.engagementMetrics.interactionRate || 0) + 0.1,
      lastUpdated: new Date()
    };

    await analyzeEngagement(updatedEngagement);
  }, [state.presentationState, analyzeEngagement]);

  /**
   * Record engagement signal
   */
  const recordEngagementSignal = useCallback(async (
    signal: 'attention_drop' | 'interest_spike' | 'confusion' | 'approval',
    section: string,
    confidence: number = 0.8
  ): Promise<void> => {
    // Update engagement metrics based on signal
    let engagementUpdate: Partial<EngagementMetrics> = {
      lastUpdated: new Date()
    };

    const currentAttention = state.presentationState?.engagementMetrics.attentionLevel || 75;
    const currentComprehension = state.presentationState?.engagementMetrics.comprehensionScore || 80;

    switch (signal) {
      case 'attention_drop':
        engagementUpdate.attentionLevel = Math.max(0, currentAttention - 10);
        break;
      case 'interest_spike':
        engagementUpdate.attentionLevel = Math.min(100, currentAttention + 15);
        break;
      case 'confusion':
        engagementUpdate.comprehensionScore = Math.max(0, currentComprehension - 15);
        break;
      case 'approval':
        engagementUpdate.comprehensionScore = Math.min(100, currentComprehension + 10);
        break;
    }

    // Trigger re-analysis if significant signal
    if (confidence >= 0.8 && (signal === 'attention_drop' || signal === 'confusion')) {
      await analyzeEngagement(engagementUpdate);
    }
  }, [state.presentationState, analyzeEngagement]);

  /**
   * End presentation session
   */
  const endSession = useCallback(async (): Promise<SessionSummary | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await makeAPIRequest('end_session', {}, true); // Skip cache

      if (response.success) {
        setState(prev => ({
          ...prev,
          isSessionActive: false,
          presentationState: null,
          lastUpdated: new Date(),
          isLoading: false
        }));

        // Stop auto-refresh
        stopAutoRefresh();

        return response.data;
      } else {
        throw new Error(response.error || 'Failed to end session');
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to end session',
        isLoading: false
      }));
      return null;
    }
  }, [makeAPIRequest]);

  /**
   * Get engine health and performance metrics
   */
  const getEngineHealth = useCallback(async (): Promise<any> => {
    try {
      const response = await makeAPIRequest('engine_health', {});
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get engine health:', error);
      return null;
    }
  }, [makeAPIRequest]);

  /**
   * Start auto-refresh timer
   */
  const startAutoRefresh = useCallback(() => {
    if (refreshTimer.current) return; // Already running

    const refreshInterval = CACHE_DURATION[state.currentAudience] / 2; // Refresh at half cache duration

    refreshTimer.current = setInterval(async () => {
      if (state.isSessionActive) {
        try {
          // Refresh engagement analysis
          await analyzeEngagement(
            state.presentationState?.engagementMetrics || {}
          );
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }
    }, refreshInterval);
  }, [state.currentAudience, state.isSessionActive, state.presentationState, analyzeEngagement]);

  /**
   * Stop auto-refresh timer
   */
  const stopAutoRefresh = useCallback(() => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    adaptationCache.current.clear();
    setState(prev => ({
      ...prev,
      cacheStatus: {
        adaptationCached: false,
        analysisCached: false,
        optimizationCached: false,
        cacheExpiry: null
      }
    }));
  }, []);

  /**
   * Switch audience type
   */
  const switchAudience = useCallback(async (
    newAudience: 'executive' | 'technical' | 'compliance'
  ): Promise<void> => {
    if (newAudience === state.currentAudience) return;

    // Clear cache when switching audience
    clearCache();

    setState(prev => ({ ...prev, currentAudience: newAudience }));

    // If session is active, restart with new audience
    if (state.isSessionActive) {
      await startSession(newAudience);
    }
  }, [state.currentAudience, state.isSessionActive, clearCache, startSession]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopAutoRefresh();
      adaptationCache.current.clear();
      requestQueue.current.clear();
    };
  }, [stopAutoRefresh]);

  /**
   * Start auto-refresh when session becomes active
   */
  useEffect(() => {
    if (state.isSessionActive && autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  }, [state.isSessionActive, autoRefresh, startAutoRefresh, stopAutoRefresh]);

  return {
    // State
    ...state,

    // Actions
    startSession,
    endSession,
    generateAdaptation,
    analyzeEngagement,
    optimizeFlow,
    generateInsights,
    recordQuestion,
    recordEngagementSignal,
    switchAudience,

    // Utilities
    getEngineHealth,
    clearCache,
    startAutoRefresh,
    stopAutoRefresh,

    // Computed values
    isHealthy: !state.error && state.apiResponseTime < 2000,
    cacheAge: state.cacheStatus.cacheExpiry
      ? Math.max(0, state.cacheStatus.cacheExpiry.getTime() - Date.now())
      : 0,
    engagementLevel: state.presentationState?.engagementMetrics.attentionLevel || 0,
    systemHealth: state.presentationState?.systemHealth || 'unknown'
  };
}

/**
 * Utility hook for engagement monitoring
 */
export function useEngagementMonitoring(
  adaptiveHook: ReturnType<typeof useAdaptivePresentation>
) {
  const [engagementHistory, setEngagementHistory] = useState<Array<{
    timestamp: Date;
    attentionLevel: number;
    interactionRate: number;
    comprehensionScore: number;
  }>>([]);

  const recordEngagement = useCallback((metrics: EngagementMetrics) => {
    setEngagementHistory(prev => [
      ...prev.slice(-19), // Keep last 20 entries
      {
        timestamp: new Date(),
        attentionLevel: metrics.attentionLevel,
        interactionRate: metrics.interactionRate,
        comprehensionScore: metrics.comprehensionScore
      }
    ]);

    // Automatically analyze if attention drops significantly
    if (metrics.attentionLevel < 50) {
      adaptiveHook.recordEngagementSignal('attention_drop', 'monitoring', 0.9);
    }
  }, [adaptiveHook]);

  const getEngagementTrend = useCallback(() => {
    if (engagementHistory.length < 3) return 'stable';

    const recent = engagementHistory.slice(-3);
    const avgFirst = recent[0].attentionLevel;
    const avgLast = recent[recent.length - 1].attentionLevel;

    if (avgLast > avgFirst + 10) return 'improving';
    if (avgLast < avgFirst - 10) return 'declining';
    return 'stable';
  }, [engagementHistory]);

  return {
    engagementHistory,
    recordEngagement,
    getEngagementTrend,
    averageAttention: engagementHistory.length > 0
      ? engagementHistory.reduce((sum, item) => sum + item.attentionLevel, 0) / engagementHistory.length
      : 0
  };
}