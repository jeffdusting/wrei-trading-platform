/**
 * Milestone 2.2: Market Data API Tests
 * Tests the External API Integration market data gateway
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '../app/api/market-data/route';

describe('Milestone 2.2: Market Data API', () => {
  beforeEach(() => {
    // Clear any existing timers and use fake timers for consistent testing
    jest.clearAllTimers();
    jest.useFakeTimers();

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Helper function to create mock GET requests
  function createGetRequest(action: string, params?: Record<string, string>): NextRequest {
    const url = new URL(`http://localhost:3000/api/market-data`);
    url.searchParams.set('action', action);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return {
      url: url.toString(),
      method: 'GET',
      headers: {
        get: (name: string) => name === 'X-WREI-API-Key' ? null : null
      }
    } as NextRequest;
  }

  // Helper function to parse API response
  async function parseApiResponse(response: Response) {
    const json = await response.json();
    return { status: response.status, data: json };
  }

  describe('Carbon Market Data Endpoints', () => {
    test('GET carbon_pricing returns valid CarbonPricingData structure', async () => {
      const request = createGetRequest('carbon_pricing');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.metadata.apiVersion).toBe('2.2.0');
      expect(data.metadata.source).toBe('WREI_CARBON_FEED');

      // Validate carbon pricing data structure
      const carbonData = data.data.carbonPricing;
      expect(carbonData).toBeDefined();
      expect(carbonData.spot).toBeDefined();
      expect(carbonData.indices).toBeDefined();
      expect(carbonData.volatility).toBeDefined();

      // Check that pricing values are reasonable
      expect(typeof carbonData.spot.vcm_spot_reference).toBe('number');
      expect(carbonData.spot.vcm_spot_reference).toBeGreaterThan(0);
      expect(typeof carbonData.spot.forward_removal_reference).toBe('number');
      expect(carbonData.spot.forward_removal_reference).toBeGreaterThan(0);
      expect(typeof carbonData.spot.dmrv_premium_benchmark).toBe('number');
      expect(carbonData.spot.dmrv_premium_benchmark).toBeGreaterThan(0);
    });

    test('GET carbon_analytics returns trends and analytics data', async () => {
      const request = createGetRequest('carbon_analytics');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.carbonAnalytics).toBeDefined();

      const analytics = data.data.carbonAnalytics;
      expect(analytics.currentData).toBeDefined();
      expect(analytics.trends).toBeDefined();
      expect(Array.isArray(analytics.trends)).toBe(true);
      expect(analytics.marketEvents).toBeDefined();
      expect(Array.isArray(analytics.marketEvents)).toBe(true);
      expect(analytics.volatilityAnalysis).toBeDefined();
      expect(analytics.arbitrageOpportunities).toBeDefined();

      // Validate trend confidence is set
      expect(['high', 'medium', 'low']).toContain(data.data.trendConfidence);
    });

    test('GET carbon_projections returns projected values and growth drivers', async () => {
      const request = createGetRequest('carbon_projections');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.carbonProjections).toBeDefined();

      const projections = data.data.carbonProjections;
      expect(projections.currentValue).toBeDefined();
      expect(typeof projections.currentValue).toBe('number');
      expect(projections.projected2030Value).toBeDefined();
      expect(typeof projections.projected2030Value).toBe('number');
      expect(projections.growthDrivers).toBeDefined();
      expect(Array.isArray(projections.growthDrivers)).toBe(true);
      expect(projections.riskFactors).toBeDefined();
      expect(Array.isArray(projections.riskFactors)).toBe(true);

      // Should include key assumptions
      expect(data.data.keyAssumptions).toBeDefined();
      expect(Array.isArray(data.data.keyAssumptions)).toBe(true);
      expect(data.data.projectionHorizon).toBe('2024-2030');
    });
  });

  describe('RWA Market Data Endpoints', () => {
    test('GET rwa_market returns valid RWAMarketData structure', async () => {
      const request = createGetRequest('rwa_market');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rwaMarket).toBeDefined();

      const marketData = data.data.rwaMarket;
      expect(typeof marketData.totalMarketValue).toBe('number');
      expect(marketData.totalMarketValue).toBeGreaterThan(0);
      expect(marketData.marketSegments).toBeDefined();
      expect(marketData.liquidityMetrics).toBeDefined();
      expect(marketData.yieldData).toBeDefined();

      // Validate market segments structure
      const segments = marketData.marketSegments;
      expect(segments.realEstate).toBeDefined();
      expect(segments.privateEquity).toBeDefined();
      expect(segments.infrastructure).toBeDefined();
      expect(segments.commodities).toBeDefined();

      // Each segment should have value and growth rate
      Object.values(segments).forEach((segment: any) => {
        expect(typeof segment.value).toBe('number');
        expect(typeof segment.growthRate).toBe('number');
        expect(Array.isArray(segment.topAssets)).toBe(true);
      });
    });

    test('GET rwa_analytics returns comprehensive market analytics', async () => {
      const request = createGetRequest('rwa_analytics');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rwaAnalytics).toBeDefined();

      const analytics = data.data.rwaAnalytics;
      expect(analytics.currentData).toBeDefined();
      expect(analytics.trends).toBeDefined();
      expect(Array.isArray(analytics.trends)).toBe(true);
      expect(analytics.innovations).toBeDefined();
      expect(Array.isArray(analytics.innovations)).toBe(true);
      expect(analytics.liquidityAnalysis).toBeDefined();
      expect(analytics.competitiveAnalysis).toBeDefined();
      expect(analytics.investmentFlows).toBeDefined();

      // Should have data points count
      expect(typeof data.data.dataPoints).toBe('number');
      expect(data.data.analyticsScope).toBe('multi_segment');
    });
  });

  describe('Market Intelligence Endpoints', () => {
    test('GET market_sentiment returns sentiment scores and predictions', async () => {
      const request = createGetRequest('market_sentiment');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sentimentAnalysis).toBeDefined();

      const sentiment = data.data.sentimentAnalysis;
      expect(sentiment.overallSentiment).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(sentiment.overallSentiment);
      expect(typeof sentiment.confidenceScore).toBe('number');
      expect(sentiment.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(sentiment.confidenceScore).toBeLessThanOrEqual(1);

      expect(Array.isArray(sentiment.keyDrivers)).toBe(true);
      expect(Array.isArray(sentiment.riskFactors)).toBe(true);
      expect(sentiment.sectorSentiment).toBeDefined();
    });

    test('GET competitive_analysis returns competitor array with known competitors', async () => {
      const request = createGetRequest('competitive_analysis');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.competitiveAnalysis).toBeDefined();

      const analysis = data.data.competitiveAnalysis;
      expect(Array.isArray(analysis)).toBe(true);
      expect(analysis.length).toBeGreaterThan(0);

      // Check structure of competitive analysis entries
      analysis.forEach((competitor: any) => {
        expect(competitor.name).toBeDefined();
        expect(typeof competitor.name).toBe('string');
        expect(competitor.yieldMechanism).toBeDefined();
        expect(typeof competitor.aum).toBe('number');
        expect(typeof competitor.marketShare).toBe('number');
        expect(Array.isArray(competitor.strengths)).toBe(true);
        expect(Array.isArray(competitor.weaknesses)).toBe(true);
      });

      expect(typeof data.data.competitorCount).toBe('number');
      expect(data.data.analysisScope).toBe('global_tokenization_market');
    });

    test('GET historical returns filtered data points for valid time range', async () => {
      const request = createGetRequest('historical', {
        feedType: 'carbon_pricing',
        timeRange: '24h',
        maxPoints: '50'
      });
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.historical).toBeDefined();

      const historical = data.data.historical;
      expect(Array.isArray(historical.dataPoints)).toBe(true);
      expect(historical.metadata).toBeDefined();
      expect(historical.metadata.feedType).toBe('carbon_pricing');
      expect(historical.metadata.timeRange).toBe('24h');

      // Should respect maxPoints parameter
      expect(historical.dataPoints.length).toBeLessThanOrEqual(50);

      // Validate request structure in response
      expect(data.data.request.feedType).toBe('carbon_pricing');
      expect(data.data.request.timeRange).toBe('24h');
      expect(data.data.request.maxDataPoints).toBe(50);
    });

    test('GET feed_status returns stats for all four feed types', async () => {
      const request = createGetRequest('feed_status');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.feedStatus).toBeDefined();

      const feedStatus = data.data.feedStatus;
      expect(feedStatus.carbon_pricing).toBeDefined();
      expect(feedStatus.rwa_market).toBeDefined();
      expect(feedStatus.regulatory_alerts).toBeDefined();
      expect(feedStatus.market_sentiment).toBeDefined();

      // Each feed should have status
      Object.values(feedStatus).forEach((stat: any) => {
        expect(stat.status).toBeDefined();
        expect(['connected', 'disconnected', 'connecting', 'error']).toContain(stat.status);
        expect(typeof stat.totalUpdates).toBe('number');
        expect(typeof stat.currentSubscribers).toBe('number');
      });

      expect(typeof data.data.totalFeeds).toBe('number');
      expect(data.data.totalFeeds).toBe(4);
      expect(['healthy', 'degraded']).toContain(data.data.systemHealth);
    });
  });

  describe('Error Handling and Validation', () => {
    test('GET with invalid action returns 400 error with descriptive message', async () => {
      const request = createGetRequest('invalid_action');
      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid action: invalid_action');
      expect(data.error).toContain('Valid actions:');
      expect(data.error).toContain('carbon_pricing');
      expect(data.error).toContain('rwa_market');
      expect(data.metadata.apiVersion).toBe('2.2.0');
    });

    test('GET historical with invalid parameters returns validation errors', async () => {
      // Test invalid feedType
      const invalidFeedRequest = createGetRequest('historical', {
        feedType: 'invalid_feed',
        timeRange: '24h'
      });
      const feedResponse = await GET(invalidFeedRequest);
      const { status: feedStatus, data: feedData } = await parseApiResponse(feedResponse);

      expect(feedStatus).toBe(500);
      expect(feedData.success).toBe(false);
      expect(feedData.error).toContain('Invalid feedType');

      // Test invalid timeRange
      const invalidTimeRequest = createGetRequest('historical', {
        feedType: 'carbon_pricing',
        timeRange: 'invalid_time'
      });
      const timeResponse = await GET(invalidTimeRequest);
      const { status: timeStatus, data: timeData } = await parseApiResponse(timeResponse);

      expect(timeStatus).toBe(500);
      expect(timeData.success).toBe(false);
      expect(timeData.error).toContain('Invalid timeRange');

      // Test invalid maxPoints
      const invalidPointsRequest = createGetRequest('historical', {
        feedType: 'carbon_pricing',
        timeRange: '24h',
        maxPoints: '2000' // Over the 1000 limit
      });
      const pointsResponse = await GET(invalidPointsRequest);
      const { status: pointsStatus, data: pointsData } = await parseApiResponse(pointsResponse);

      expect(pointsStatus).toBe(500);
      expect(pointsData.success).toBe(false);
      expect(pointsData.error).toContain('maxPoints must be between 1 and 1000');
    });

    test('GET without required action parameter returns error', async () => {
      const url = new URL('http://localhost:3000/api/market-data');
      // Don't set action parameter
      const request = {
        url: url.toString(),
        method: 'GET',
        headers: {
          get: (name: string) => name === 'X-WREI-API-Key' ? null : null
        }
      } as NextRequest;

      const response = await GET(request);
      const { status, data } = await parseApiResponse(response);

      expect(status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Missing required query parameter: action');
    });
  });
});