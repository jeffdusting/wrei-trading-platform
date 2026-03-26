/**
 * WREI Trading Platform - Analytics React Hook
 *
 * Step 1.4: Enhanced Negotiation Analytics - React Hook for Analytics Integration
 * Custom hook for integrating real-time analytics with scenario execution
 *
 * Date: March 25, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NegotiationMetrics,
  PerformanceBenchmark,
  MarketComparisonData,
  RiskAssessmentData,
  AnalyticsState,
  AnalyticsTimeframe
} from './types';

import { AudienceType } from '../audience';
import { ScenarioType } from '../scenarios/types';
import { AnalyticsEngine } from './AnalyticsEngine';

interface UseAnalyticsOptions {
  sessionId?: string;
  scenarioId?: string;
  scenarioType?: ScenarioType;
  audience: AudienceType;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface AnalyticsHookReturn {
  // Current state
  state: AnalyticsState;
  isLoading: boolean;
  error: string | null;

  // Current data
  currentMetrics: NegotiationMetrics | null;
  benchmarks: PerformanceBenchmark[];
  marketData: MarketComparisonData | null;
  riskData: RiskAssessmentData | null;

  // Actions
  startSession: (sessionId: string, scenarioId: string, scenarioType: ScenarioType) => void;
  stopSession: () => void;
  refreshData: () => Promise<void>;
  processScenarioData: (executionData: any) => NegotiationMetrics;
  updateTimeframe: (timeframe: AnalyticsTimeframe) => void;
  exportData: (format: 'json' | 'csv') => any;

  // Configuration
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  updateUserPreferences: (preferences: Partial<AnalyticsState['user_preferences']>) => void;
}

export const useAnalytics = ({
  sessionId: initialSessionId,
  scenarioId: initialScenarioId,
  scenarioType: initialScenarioType,
  audience,
  autoRefresh = true,
  refreshInterval = 5000
}: UseAnalyticsOptions): AnalyticsHookReturn => {
  const [analyticsEngine] = useState(() => AnalyticsEngine.getInstance());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core analytics state
  const [state, setState] = useState<AnalyticsState>({
    current_session: {
      session_id: initialSessionId || '',
      start_time: new Date(),
      scenario_type: initialScenarioType || 'esc-market-trading',
      selected_audience: audience,
      active_metrics: null
    },
    live_data: {
      market_data: null,
      risk_data: null,
      benchmarks: [],
      last_updated: new Date()
    },
    config: {
      refresh_interval: refreshInterval,
      enabled_metrics: ['performance', 'efficiency', 'compliance', 'risk'],
      dashboard_layout: 'default',
      export_preferences: {}
    },
    user_preferences: {
      preferred_timeframe: '1d',
      default_chart_types: {
        performance: 'line',
        efficiency: 'bar',
        compliance: 'gauge',
        risk: 'heatmap',
        market_position: 'pie'
      },
      alert_thresholds: {
        'price_improvement': 0.15, // 15% threshold
        'compliance_score': 0.90, // 90% threshold
        'risk_score': 30, // Risk score threshold
        'settlement_success': 0.95 // 95% threshold
      },
      custom_benchmarks: []
    }
  });

  // Data state
  const [currentMetrics, setCurrentMetrics] = useState<NegotiationMetrics | null>(null);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [marketData, setMarketData] = useState<MarketComparisonData | null>(null);
  const [riskData, setRiskData] = useState<RiskAssessmentData | null>(null);

  // Refs for interval management
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const isActiveRef = useRef(autoRefresh);

  // Update analytics engine and refresh data
  const refreshData = useCallback(async () => {
    if (!state.current_session.session_id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get current metrics for the session
      const sessionMetrics = analyticsEngine.getSessionMetrics(state.current_session.session_id);
      setCurrentMetrics(sessionMetrics);

      // Get benchmarks
      const currentBenchmarks = analyticsEngine.getBenchmarks();
      setBenchmarks(currentBenchmarks);

      // Get market analysis
      const market = analyticsEngine.getMarketAnalysis();
      setMarketData(market);

      // Get risk assessment
      const risk = analyticsEngine.getRiskAssessment();
      setRiskData(risk);

      // Update state
      setState(prev => ({
        ...prev,
        current_session: {
          ...prev.current_session,
          active_metrics: sessionMetrics
        },
        live_data: {
          market_data: market,
          risk_data: risk,
          benchmarks: currentBenchmarks,
          last_updated: new Date()
        }
      }));

    } catch (err) {
      console.error('Analytics refresh error:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [state.current_session.session_id, analyticsEngine]);

  // Start a new analytics session
  const startSession = useCallback((sessionId: string, scenarioId: string, scenarioType: ScenarioType) => {
    setState(prev => ({
      ...prev,
      current_session: {
        session_id: sessionId,
        start_time: new Date(),
        scenario_type: scenarioType,
        selected_audience: audience,
        active_metrics: null
      }
    }));

    // Start auto-refresh if enabled
    if (autoRefresh) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = setInterval(refreshData, state.config.refresh_interval);
    }

    // Initial data load
    refreshData();
  }, [audience, autoRefresh, refreshData, state.config.refresh_interval]);

  // Stop the current analytics session
  const stopSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      current_session: {
        ...prev.current_session,
        session_id: '',
        active_metrics: null
      }
    }));

    // Clear intervals
    clearInterval(refreshIntervalRef.current);
    setCurrentMetrics(null);
  }, []);

  // Process scenario execution data
  const processScenarioData = useCallback((executionData: any): NegotiationMetrics => {
    if (!state.current_session.session_id) {
      throw new Error('No active analytics session');
    }

    const metrics = analyticsEngine.processScenarioMetrics(
      state.current_session.session_id,
      'current-scenario',
      state.current_session.scenario_type,
      executionData
    );

    setCurrentMetrics(metrics);

    setState(prev => ({
      ...prev,
      current_session: {
        ...prev.current_session,
        active_metrics: metrics
      }
    }));

    return metrics;
  }, [state.current_session, analyticsEngine]);

  // Update timeframe preference
  const updateTimeframe = useCallback((timeframe: AnalyticsTimeframe) => {
    setState(prev => ({
      ...prev,
      user_preferences: {
        ...prev.user_preferences,
        preferred_timeframe: timeframe
      }
    }));
  }, []);

  // Export analytics data
  const exportData = useCallback((format: 'json' | 'csv') => {
    const sessionIds = state.current_session.session_id ? [state.current_session.session_id] : [];
    const data = analyticsEngine.exportAnalyticsData(sessionIds);

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV export (simplified)
    if (format === 'csv' && data.sessions.length > 0) {
      const headers = ['timestamp', 'volume', 'price_improvement', 'success_rate', 'execution_time'];
      const rows = data.sessions.map((session: NegotiationMetrics) => [
        session.timestamp.toISOString(),
        session.performance.total_volume,
        session.performance.price_improvement,
        session.performance.success_rate,
        session.performance.execution_time
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return data;
  }, [state.current_session.session_id, analyticsEngine]);

  // Set auto-refresh
  const setAutoRefresh = useCallback((enabled: boolean) => {
    isActiveRef.current = enabled;

    if (enabled && state.current_session.session_id) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = setInterval(refreshData, state.config.refresh_interval);
    } else {
      clearInterval(refreshIntervalRef.current);
    }
  }, [refreshData, state.config.refresh_interval, state.current_session.session_id]);

  // Set refresh interval
  const setRefreshInterval = useCallback((interval: number) => {
    setState(prev => ({
      ...prev,
      config: {
        ...prev.config,
        refresh_interval: interval
      }
    }));

    // Restart interval with new timing
    if (isActiveRef.current && state.current_session.session_id) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = setInterval(refreshData, interval);
    }
  }, [refreshData, state.current_session.session_id]);

  // Update user preferences
  const updateUserPreferences = useCallback((preferences: Partial<AnalyticsState['user_preferences']>) => {
    setState(prev => ({
      ...prev,
      user_preferences: {
        ...prev.user_preferences,
        ...preferences
      }
    }));
  }, []);

  // Effect for initial setup
  useEffect(() => {
    if (initialSessionId && initialScenarioId && initialScenarioType) {
      startSession(initialSessionId, initialScenarioId, initialScenarioType);
    }

    return () => {
      clearInterval(refreshIntervalRef.current);
    };
  }, [initialSessionId, initialScenarioId, initialScenarioType, startSession]);

  // Effect for audience changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      current_session: {
        ...prev.current_session,
        selected_audience: audience
      }
    }));
  }, [audience]);

  // Effect for auto-refresh setting
  useEffect(() => {
    setAutoRefresh(autoRefresh);
  }, [autoRefresh, setAutoRefresh]);

  return {
    // State
    state,
    isLoading,
    error,

    // Data
    currentMetrics,
    benchmarks,
    marketData,
    riskData,

    // Actions
    startSession,
    stopSession,
    refreshData,
    processScenarioData,
    updateTimeframe,
    exportData,

    // Configuration
    setAutoRefresh,
    setRefreshInterval,
    updateUserPreferences
  };
};

export default useAnalytics;