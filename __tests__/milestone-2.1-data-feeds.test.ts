/**
 * Milestone 2.1: Data Feeds Test Suite
 * Tests real-time data feed connector, subscription management, and data generation
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  realTimeDataConnector,
  subscribeToFeed,
  unsubscribeFromFeed,
  startDataFeeds,
  stopDataFeeds,
} from '../lib/data-feeds/real-time-connector';
import type {
  DataFeedType,
  DataFeedUpdate,
  UpdateFrequency,
  HistoricalDataRequest,
} from '../lib/data-feeds/types';

describe('Milestone 2.1: Data Feeds', () => {
  beforeEach(() => {
    // Reset connector state before each test
    stopDataFeeds();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up after each test
    stopDataFeeds();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // ===== REAL-TIME DATA CONNECTOR TESTS (4 tests) =====

  describe('RealTimeDataConnector Core Functionality', () => {
    test('connector initializes with default configuration', () => {
      const stats = realTimeDataConnector.getAllStats();

      expect(stats).toHaveProperty('carbon_pricing');
      expect(stats).toHaveProperty('rwa_market');
      expect(stats).toHaveProperty('regulatory_alerts');
      expect(stats).toHaveProperty('market_sentiment');

      // Check initial stats
      expect(stats.carbon_pricing.status).toBe('disconnected');
      expect(stats.carbon_pricing.totalUpdates).toBe(0);
      expect(stats.carbon_pricing.currentSubscribers).toBe(0);

      // Check configuration exists
      const config = realTimeDataConnector.getConfig('carbon_pricing');
      expect(config.feedType).toBe('carbon_pricing');
      expect(config.enabled).toBe(true);
      expect(config.updateFrequency).toBe('medium');
    });

    test('subscribe/unsubscribe lifecycle works correctly', () => {
      const mockCallback = jest.fn();

      // Subscribe to carbon pricing feed
      const subscriptionId = realTimeDataConnector.subscribe(
        'carbon_pricing',
        mockCallback,
        'high'
      );

      expect(subscriptionId).toMatch(/^sub_carbon_pricing_\d+_[a-z0-9]{9}$/);

      // Check stats updated
      const stats = realTimeDataConnector.getStats('carbon_pricing');
      expect(stats.currentSubscribers).toBe(1);

      // Unsubscribe
      const unsubscribed = realTimeDataConnector.unsubscribe(subscriptionId);
      expect(unsubscribed).toBe(true);

      // Check stats updated
      const updatedStats = realTimeDataConnector.getStats('carbon_pricing');
      expect(updatedStats.currentSubscribers).toBe(0);

      // Try to unsubscribe again (should fail)
      const secondUnsubscribe = realTimeDataConnector.unsubscribe(subscriptionId);
      expect(secondUnsubscribe).toBe(false);
    });

    test('getLatestData returns typed data for each feed type', () => {
      // Initially should return null (no data generated yet)
      expect(realTimeDataConnector.getLatestData('carbon_pricing')).toBeNull();
      expect(realTimeDataConnector.getLatestData('rwa_market')).toBeNull();
      expect(realTimeDataConnector.getLatestData('regulatory_alerts')).toBeNull();
      expect(realTimeDataConnector.getLatestData('market_sentiment')).toBeNull();

      // Start feeds to generate initial data
      const mockCallback = jest.fn();
      subscribeToFeed('carbon_pricing', mockCallback);
      startDataFeeds();

      // Fast-forward past connection delay and initial update
      jest.advanceTimersByTime(5000);

      const carbonData = realTimeDataConnector.getLatestData('carbon_pricing');
      expect(carbonData).not.toBeNull();
      expect(carbonData?.feedType).toBe('carbon_pricing');
      expect(carbonData?.data).toHaveProperty('spot');
      expect(carbonData?.data).toHaveProperty('indices');
      expect(carbonData?.data).toHaveProperty('volatility');
      expect(carbonData?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(carbonData?.sequence).toBe(1);
    });

    test('multiple subscribers receive the same update', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      // Subscribe multiple callbacks to the same feed
      subscribeToFeed('market_sentiment', callback1, 'high');
      subscribeToFeed('market_sentiment', callback2, 'high');
      subscribeToFeed('market_sentiment', callback3, 'medium');

      startDataFeeds();

      // Fast-forward to trigger update
      jest.advanceTimersByTime(5000);

      // All callbacks should be called with the same update
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);

      const update1 = callback1.mock.calls[0][0] as DataFeedUpdate;
      const update2 = callback2.mock.calls[0][0] as DataFeedUpdate;
      const update3 = callback3.mock.calls[0][0] as DataFeedUpdate;

      expect(update1.sequence).toBe(update2.sequence);
      expect(update1.sequence).toBe(update3.sequence);
      expect(update1.timestamp).toBe(update2.timestamp);
      expect(update1.timestamp).toBe(update3.timestamp);
    });
  });

  // ===== CARBON PRICING FEED TESTS (3 tests) =====

  describe('Carbon Pricing Feed', () => {
    test('produces data conforming to existing PRICING_INDEX structure', () => {
      const mockCallback = jest.fn();
      subscribeToFeed('carbon_pricing', mockCallback);
      startDataFeeds();

      jest.advanceTimersByTime(5000);

      expect(mockCallback).toHaveBeenCalled();
      const update = mockCallback.mock.calls[0][0] as DataFeedUpdate;
      const data = update.data as any;

      // Check structure matches CarbonPricingData interface
      expect(data).toHaveProperty('spot');
      expect(data.spot).toHaveProperty('vcm_spot_reference');
      expect(data.spot).toHaveProperty('forward_removal_reference');
      expect(data.spot).toHaveProperty('dmrv_premium_benchmark');

      expect(data).toHaveProperty('indices');
      expect(data.indices).toHaveProperty('base_carbon_price');
      expect(data.indices).toHaveProperty('wrei_premium_multiplier');
      expect(data.indices).toHaveProperty('anchor_price');

      expect(data).toHaveProperty('volatility');
      expect(data).toHaveProperty('market_depth');
      expect(data).toHaveProperty('projections');

      // Validate data types and ranges
      expect(typeof data.spot.vcm_spot_reference).toBe('number');
      expect(data.spot.vcm_spot_reference).toBeGreaterThan(0);
      expect(typeof data.indices.wrei_premium_multiplier).toBe('number');
      expect(data.indices.wrei_premium_multiplier).toBeGreaterThan(1);
    });

    test('simulated price updates stay within defined volatility bounds', () => {
      const updates: DataFeedUpdate[] = [];
      const mockCallback = jest.fn((update: DataFeedUpdate) => {
        updates.push(update);
      });

      subscribeToFeed('carbon_pricing', mockCallback);
      startDataFeeds();

      // Generate multiple updates
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes between updates
      }

      expect(updates.length).toBeGreaterThanOrEqual(5);

      // Analyze price volatility
      const prices = updates.map(update => (update.data as any).indices.base_carbon_price);
      const priceChanges = prices.slice(1).map((price, index) =>
        Math.abs((price - prices[index]) / prices[index])
      );

      // No single update should change by more than 50% (extreme volatility protection)
      priceChanges.forEach(change => {
        expect(change).toBeLessThan(0.5);
      });

      // At least some price variation should occur
      const maxChange = Math.max(...priceChanges);
      expect(maxChange).toBeGreaterThan(0.001); // At least 0.1% variation
    });

    test('historical data returns correct time-series format', async () => {
      // Start feed and generate some history
      const mockCallback = jest.fn();
      subscribeToFeed('carbon_pricing', mockCallback);
      startDataFeeds();

      // Generate historical data points
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
      }

      const request: HistoricalDataRequest = {
        feedType: 'carbon_pricing',
        timeRange: '1h',
        maxPoints: 20,
      };

      const response = await realTimeDataConnector.getHistoricalData(request);

      expect(response.feedType).toBe('carbon_pricing');
      expect(response.timeRange).toBe('1h');
      expect(response.dataPoints).toBeDefined();
      expect(Array.isArray(response.dataPoints)).toBe(true);
      expect(response.totalPoints).toBe(response.dataPoints.length);
      expect(response.fromTime).toBeDefined();
      expect(response.toTime).toBeDefined();

      // Check data points have correct structure
      if (response.dataPoints.length > 0) {
        const firstPoint = response.dataPoints[0];
        expect(firstPoint).toHaveProperty('timestamp');
        expect(firstPoint).toHaveProperty('data');
        expect(firstPoint.data).toHaveProperty('spot');
        expect(firstPoint.data).toHaveProperty('indices');

        // Check timestamps are in chronological order
        const timestamps = response.dataPoints.map(p => new Date(p.timestamp).getTime());
        for (let i = 1; i < timestamps.length; i++) {
          expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
        }
      }
    });
  });

  // ===== RWA MARKET FEED TESTS (3 tests) =====

  describe('RWA Market Feed', () => {
    test('produces data conforming to TokenizedRWAMarketContext interface', () => {
      const mockCallback = jest.fn();
      subscribeToFeed('rwa_market', mockCallback);
      startDataFeeds();

      jest.advanceTimersByTime(5000);

      expect(mockCallback).toHaveBeenCalled();
      const update = mockCallback.mock.calls[0][0] as DataFeedUpdate;
      const data = update.data as any;

      // Check RWAMarketData structure
      expect(data).toHaveProperty('totalMarketValue');
      expect(data).toHaveProperty('growthRate');
      expect(data).toHaveProperty('marketSegments');
      expect(data).toHaveProperty('liquidityMetrics');
      expect(data).toHaveProperty('yieldData');

      // Check market segments
      expect(data.marketSegments).toHaveProperty('realEstate');
      expect(data.marketSegments).toHaveProperty('privateEquity');
      expect(data.marketSegments).toHaveProperty('infrastructure');
      expect(data.marketSegments).toHaveProperty('commodities');

      // Each segment should have required properties
      Object.values(data.marketSegments).forEach((segment: any) => {
        expect(segment).toHaveProperty('value');
        expect(segment).toHaveProperty('growthRate');
        expect(segment).toHaveProperty('topAssets');
        expect(Array.isArray(segment.topAssets)).toBe(true);
        expect(segment.topAssets.length).toBe(3);

        segment.topAssets.forEach((asset: any) => {
          expect(asset).toHaveProperty('name');
          expect(asset).toHaveProperty('value');
          expect(asset).toHaveProperty('yieldRate');
          expect(typeof asset.value).toBe('number');
          expect(typeof asset.yieldRate).toBe('number');
        });
      });

      // Validate liquidity metrics
      expect(data.liquidityMetrics).toHaveProperty('dailyTradingVolume');
      expect(data.liquidityMetrics).toHaveProperty('averageTradeSize');
      expect(data.liquidityMetrics).toHaveProperty('activeTokens');
      expect(typeof data.liquidityMetrics.dailyTradingVolume).toBe('number');
      expect(data.liquidityMetrics.dailyTradingVolume).toBeGreaterThan(0);
    });

    test('market segments sum to total market value', () => {
      const mockCallback = jest.fn();
      subscribeToFeed('rwa_market', mockCallback);
      startDataFeeds();

      jest.advanceTimersByTime(5000);

      const update = mockCallback.mock.calls[0][0] as DataFeedUpdate;
      const data = update.data as any;

      const segmentSum = data.marketSegments.realEstate.value +
                        data.marketSegments.privateEquity.value +
                        data.marketSegments.infrastructure.value +
                        data.marketSegments.commodities.value;

      // Allow for small rounding differences
      expect(Math.abs(segmentSum - data.totalMarketValue)).toBeLessThan(1000);
    });

    test('feed integrates with existing getTokenizedRWAMarketContext function', () => {
      // This test ensures our feed produces data compatible with existing market intelligence
      const mockCallback = jest.fn();
      subscribeToFeed('rwa_market', mockCallback);
      startDataFeeds();

      jest.advanceTimersByTime(5000);

      const update = mockCallback.mock.calls[0][0] as DataFeedUpdate;
      const data = update.data as any;

      // Check that the structure is compatible with existing market intelligence expectations
      expect(data.totalMarketValue).toBeGreaterThan(10000000000); // Should be in billions
      expect(data.growthRate).toBeGreaterThan(0); // Should show positive growth
      expect(data.marketSegments.infrastructure.value).toBeGreaterThan(0); // WREI opportunity segment

      // Yield data should be realistic for institutional investors
      expect(data.yieldData.averageYield).toBeGreaterThan(5); // At least 5% yield
      expect(data.yieldData.averageYield).toBeLessThan(50); // Not more than 50% (unrealistic)
      expect(Array.isArray(data.yieldData.yieldRange)).toBe(true);
      expect(data.yieldData.yieldRange.length).toBe(2);
      expect(data.yieldData.yieldRange[0]).toBeLessThan(data.yieldData.yieldRange[1]);
    });
  });

  // ===== FEED MANAGEMENT AND ERROR HANDLING (1 test) =====

  describe('Feed Management', () => {
    test('feed statistics track updates and performance correctly', () => {
      const mockCallback = jest.fn();

      // Subscribe to multiple feeds
      subscribeToFeed('carbon_pricing', mockCallback);
      subscribeToFeed('market_sentiment', mockCallback);

      startDataFeeds();

      // Initial stats should show connecting/connected status
      jest.advanceTimersByTime(2000); // Connection delay

      let stats = realTimeDataConnector.getAllStats();
      expect(stats.carbon_pricing.status).toBe('connected');
      expect(stats.market_sentiment.status).toBe('connected');

      // Generate several updates
      jest.advanceTimersByTime(35000); // 35 seconds (should trigger high frequency updates)

      stats = realTimeDataConnector.getAllStats();

      // Check that updates were tracked
      expect(stats.carbon_pricing.totalUpdates).toBeGreaterThan(0);
      expect(stats.carbon_pricing.successfulUpdates).toBeGreaterThan(0);
      expect(stats.carbon_pricing.currentSubscribers).toBe(1);
      expect(stats.carbon_pricing.lastUpdateTime).not.toBeNull();

      expect(stats.market_sentiment.totalUpdates).toBeGreaterThan(0);
      expect(stats.market_sentiment.successfulUpdates).toBeGreaterThan(0);
      expect(stats.market_sentiment.currentSubscribers).toBe(1);

      // Check that data points are being cached
      expect(stats.carbon_pricing.dataPointsCached).toBeGreaterThan(0);
      expect(stats.market_sentiment.dataPointsCached).toBeGreaterThan(0);

      // Verify no failed updates (in normal operation)
      expect(stats.carbon_pricing.failedUpdates).toBe(0);
      expect(stats.market_sentiment.failedUpdates).toBe(0);
    });
  });

  // ===== CONVENIENCE FUNCTIONS TEST (1 test) =====

  describe('Convenience Functions', () => {
    test('convenience functions provide same functionality as connector methods', () => {
      const mockCallback = jest.fn();

      // Test subscribeToFeed convenience function
      const subscriptionId = subscribeToFeed('regulatory_alerts', mockCallback, 'low');
      expect(subscriptionId).toMatch(/^sub_regulatory_alerts_\d+_[a-z0-9]{9}$/);

      // Start feeds
      startDataFeeds();
      jest.advanceTimersByTime(5000);

      // Check subscription worked
      const stats = realTimeDataConnector.getStats('regulatory_alerts');
      expect(stats.currentSubscribers).toBe(1);

      // Test unsubscribeFromFeed convenience function
      const unsubscribed = unsubscribeFromFeed(subscriptionId);
      expect(unsubscribed).toBe(true);

      const updatedStats = realTimeDataConnector.getStats('regulatory_alerts');
      expect(updatedStats.currentSubscribers).toBe(0);

      // Test stopDataFeeds convenience function
      stopDataFeeds();

      const finalStats = realTimeDataConnector.getAllStats();
      Object.values(finalStats).forEach(stat => {
        expect(stat.status).toBe('disconnected');
      });
    });
  });

  // ===== CONFIGURATION AND EDGE CASES (1 test) =====

  describe('Configuration and Edge Cases', () => {
    test('feed configuration can be updated and affects behavior', () => {
      const mockCallback = jest.fn();
      subscribeToFeed('carbon_pricing', mockCallback);

      // Update configuration to very high frequency
      realTimeDataConnector.updateConfig('carbon_pricing', {
        updateFrequency: 'real_time',
        simulationParams: {
          volatility: 0.5, // High volatility
          trendBias: 0.1,
          eventFrequency: 0.8,
        },
      });

      const updatedConfig = realTimeDataConnector.getConfig('carbon_pricing');
      expect(updatedConfig.updateFrequency).toBe('real_time');
      expect(updatedConfig.simulationParams?.volatility).toBe(0.5);

      startDataFeeds();

      // With real_time frequency, should get updates very quickly
      jest.advanceTimersByTime(3000); // 3 seconds

      const stats = realTimeDataConnector.getStats('carbon_pricing');
      expect(stats.totalUpdates).toBeGreaterThan(1); // Should have multiple updates in 3 seconds

      // Test that restart functionality works
      realTimeDataConnector.restart();
      jest.advanceTimersByTime(2000);

      const restartedStats = realTimeDataConnector.getStats('carbon_pricing');
      expect(restartedStats.status).toBe('connected');
    });
  });
});