/**
 * WREI Trading Platform - Analytics Hook
 *
 * Stage 2 Component 3: Simplified Analytics Dashboard
 * MIGRATED: Now uses simplified demo data instead of complex analytics system
 *
 * Date: March 28, 2026
 */

import { useState, useEffect, useRef } from 'react';
import { useSimpleDemoStore, SimpleDemoDataSet } from '@/lib/demo-mode/simple-demo-state';
import type { DemoDataSet } from '@/lib/demo-mode/demo-data-simple';

// Simplified analytics configuration
export interface AnalyticsConfig {
  dataSet?: SimpleDemoDataSet;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

// Simplified analytics data structure
export interface SimplifiedAnalytics {
  portfolioMetrics: {
    targetAllocation: number;
    expectedYield: number;
    riskProfile: string;
    liquidityNeeds: string;
  };
  marketData: {
    basePrice: number;
    floor: number;
    vcmSpot: number;
    forwardRemoval: number;
    dmrvPremium: number;
  };
  persona: {
    name: string;
    title: string;
    organisation: string;
    warmth: number;
    dominance: number;
    patience: number;
  };
  lastUpdated: Date;
}

export const useAnalytics = (config: AnalyticsConfig = {}) => {
  const {
    dataSet,
    autoRefresh = true,
    refreshInterval = 5000
  } = config;

  // Use simplified demo store
  const { isActive, selectedDataSet, demoData } = useSimpleDemoStore();

  // State
  const [analytics, setAnalytics] = useState<SimplifiedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate analytics from demo data
  const generateAnalytics = (data: DemoDataSet): SimplifiedAnalytics => {
    return {
      portfolioMetrics: data.portfolioMetrics,
      marketData: data.marketData,
      persona: data.persona,
      lastUpdated: new Date()
    };
  };

  // Refresh analytics
  const refreshAnalytics = () => {
    if (!isActive || !demoData) {
      setAnalytics(null);
      setError('Demo mode not active');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newAnalytics = generateAnalytics(demoData);
      setAnalytics(newAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && isActive) {
      refreshAnalytics();
      refreshIntervalRef.current = setInterval(refreshAnalytics, refreshInterval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, isActive, demoData, refreshInterval]);

  // Initial load effect
  useEffect(() => {
    refreshAnalytics();
  }, [isActive, demoData]);

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics
  };
};

export default useAnalytics;