/**
 * WREI Trading Platform - Live Pricing React Hook
 *
 * React hook for accessing live pricing data in components
 * Automatically refreshes and provides loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { livePricingService, LivePricingData } from '../lib/services/live-pricing-service';
import { livePricingConfig, DynamicPricingIndex } from '../lib/config/live-pricing-config';

export interface UseLivePricingOptions {
  refreshInterval?: number; // minutes
  autoRefresh?: boolean;
  fallbackEnabled?: boolean;
}

export interface LivePricingState {
  pricing: LivePricingData | null;
  pricingIndex: DynamicPricingIndex | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
  confidence: number;
}

export const useLivePricing = (options: UseLivePricingOptions = {}) => {
  const {
    refreshInterval = 5,
    autoRefresh = true,
    fallbackEnabled = true
  } = options;

  const [state, setState] = useState<LivePricingState>({
    pricing: null,
    pricingIndex: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    isLive: false,
    confidence: 0
  });

  const refreshPricing = useCallback(async (forceRefresh: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [pricing, pricingIndex] = await Promise.all([
        livePricingService.getCurrentPricing(forceRefresh),
        livePricingConfig.getPricingIndex(forceRefresh)
      ]);

      setState({
        pricing,
        pricingIndex,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        isLive: pricingIndex.IS_LIVE,
        confidence: pricingIndex.CONFIDENCE
      });

    } catch (error) {
      console.error('Failed to fetch live pricing:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pricing data'
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshPricing();
  }, [refreshPricing]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshPricing();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshPricing]);

  // Helper functions for common pricing values
  const getNSWESCSpot = useCallback((): number => {
    return state.pricing?.nswEscSpot || 47.80; // Fallback
  }, [state.pricing]);

  const getWREIAnchor = useCallback((): number => {
    return state.pricing?.wreiAnchor || 150.00; // Fallback
  }, [state.pricing]);

  const getWREIFloor = useCallback((): number => {
    return state.pricing?.wreiFloor || 120.00; // Fallback
  }, [state.pricing]);

  const formatPrice = useCallback((price: number, currency: string = 'AUD'): string => {
    const symbol = currency === 'AUD' ? 'A$' : '$';
    return `${symbol}${price.toFixed(2)}`;
  }, []);

  return {
    ...state,
    refreshPricing,
    getNSWESCSpot,
    getWREIAnchor,
    getWREIFloor,
    formatPrice,

    // Status helpers
    isStale: state.lastUpdated && (Date.now() - state.lastUpdated.getTime()) > (10 * 60 * 1000), // 10 min
    isHighConfidence: state.confidence > 80,
    dataAge: state.lastUpdated ? Math.floor((Date.now() - state.lastUpdated.getTime()) / (1000 * 60)) : -1
  };
};