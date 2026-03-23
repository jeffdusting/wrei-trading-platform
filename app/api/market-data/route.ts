/**
 * WREI Market Data API Gateway
 *
 * External API endpoint for carbon market feeds, RWA market data, and competitive intelligence.
 * Part of Milestone 2.2: External API Integration
 */

import { NextRequest } from 'next/server';
import {
  validateApiKey,
  checkRateLimit,
  apiResponse,
  apiError,
  getQueryParam,
  validateDataFeedType,
  validateTimeRange,
  validateNumericRange,
  logApiRequest,
  logApiError,
  type DataFeedType,
  type TimeRange
} from '@/lib/api-helpers';

// Import data feeds and intelligence systems
import { carbonPricingFeed } from '@/lib/data-feeds/carbon-pricing-feed';
import { rwaMarketFeed } from '@/lib/data-feeds/rwa-market-feed';
import { realTimeDataConnector } from '@/lib/data-feeds/real-time-connector';
import { marketIntelligenceSystem } from '@/lib/market-intelligence';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let action = 'unknown';
  let requestId = '';

  try {
    // Extract action from query parameters
    action = getQueryParam(request, 'action', true) || 'unknown';
    requestId = `mkt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Validate API key
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      logApiError('/api/market-data', action, requestId, authResult.error);
      return apiError(authResult.error || 'Authentication failed', 401);
    }

    // Check rate limiting
    const apiKey = request.headers.get('X-WREI-API-Key') || 'anonymous';
    if (!checkRateLimit(apiKey, 100, 60000)) {
      logApiError('/api/market-data', action, requestId, 'Rate limit exceeded');
      return apiError('Rate limit exceeded. Maximum 100 requests per minute.', 429);
    }

    // Route to appropriate handler based on action
    let result;
    let source = 'WREI_MARKET_DATA';

    switch (action) {
      case 'carbon_pricing':
        result = await handleCarbonPricing();
        source = 'WREI_CARBON_FEED';
        break;

      case 'carbon_analytics':
        result = await handleCarbonAnalytics();
        source = 'WREI_CARBON_ANALYTICS';
        break;

      case 'rwa_market':
        result = await handleRWAMarket();
        source = 'WREI_RWA_FEED';
        break;

      case 'rwa_analytics':
        result = await handleRWAAnalytics();
        source = 'WREI_RWA_ANALYTICS';
        break;

      case 'market_sentiment':
        result = await handleMarketSentiment();
        source = 'WREI_SENTIMENT_FEED';
        break;

      case 'competitive_analysis':
        result = await handleCompetitiveAnalysis();
        source = 'WREI_COMPETITIVE_INTELLIGENCE';
        break;

      case 'carbon_projections':
        result = await handleCarbonProjections();
        source = 'WREI_CARBON_PROJECTIONS';
        break;

      case 'historical':
        result = await handleHistoricalData(request);
        source = 'WREI_HISTORICAL_DATA';
        break;

      case 'feed_status':
        result = await handleFeedStatus();
        source = 'WREI_FEED_STATUS';
        break;

      default:
        logApiError('/api/market-data', action, requestId, 'Invalid action');
        return apiError(
          `Invalid action: ${action}. Valid actions: carbon_pricing, carbon_analytics, rwa_market, rwa_analytics, market_sentiment, competitive_analysis, carbon_projections, historical, feed_status`,
          400
        );
    }

    const processingTime = Date.now() - startTime;
    logApiRequest('GET', '/api/market-data', action, requestId, true, processingTime);

    return apiResponse(result, {
      source,
      requestId
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logApiError('/api/market-data', action, requestId, error);
    logApiRequest('GET', '/api/market-data', action, requestId, false, processingTime);

    return apiError(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

/**
 * Handle carbon_pricing action
 */
async function handleCarbonPricing() {
  const timestamp = new Date().toISOString();
  const carbonData = carbonPricingFeed.generatePricingData(timestamp);

  return {
    carbonPricing: carbonData,
    timestamp,
    dataAge: 0, // Real-time simulation
    nextUpdate: new Date(Date.now() + 60000).toISOString() // Next minute
  };
}

/**
 * Handle carbon_analytics action
 */
async function handleCarbonAnalytics() {
  const timestamp = new Date().toISOString();
  const currentData = carbonPricingFeed.generatePricingData(timestamp);
  const analytics = carbonPricingFeed.generateAnalytics(currentData);

  return {
    carbonAnalytics: analytics,
    timestamp,
    analysisDepth: 'comprehensive',
    trendConfidence: analytics.trends.length > 0 ? 'high' : 'medium'
  };
}

/**
 * Handle rwa_market action
 */
async function handleRWAMarket() {
  const timestamp = new Date().toISOString();
  const marketData = rwaMarketFeed.generateMarketData(timestamp);

  return {
    rwaMarket: marketData,
    timestamp,
    marketCoverage: 'institutional_grade',
    totalAssets: marketData.liquidityMetrics.activeTokens
  };
}

/**
 * Handle rwa_analytics action
 */
async function handleRWAAnalytics() {
  const timestamp = new Date().toISOString();
  const currentData = rwaMarketFeed.generateMarketData(timestamp);
  const analytics = rwaMarketFeed.generateAnalytics(currentData);

  return {
    rwaAnalytics: analytics,
    timestamp,
    analyticsScope: 'multi_segment',
    dataPoints: analytics.trends?.length || 0
  };
}

/**
 * Handle market_sentiment action
 */
async function handleMarketSentiment() {
  // Get latest sentiment data from the real-time connector
  const sentimentData = realTimeDataConnector.getLatestData('market_sentiment');

  if (!sentimentData) {
    // Generate fresh sentiment if no data available
    const marketContext = marketIntelligenceSystem.getTokenizedRWAMarketContext();

    return {
      sentimentAnalysis: {
        overallSentiment: 'positive',
        confidenceScore: 0.75,
        marketMomentum: 'bullish',
        keyDrivers: [
          'Institutional adoption increasing',
          'Regulatory clarity improving',
          'ESG demand strengthening'
        ],
        riskFactors: [
          'Interest rate volatility',
          'Regulatory changes pending'
        ],
        sectorSentiment: {
          carbon_credits: 0.8,
          real_estate: 0.7,
          infrastructure: 0.75,
          commodities: 0.65
        }
      },
      timestamp: new Date().toISOString(),
      dataSource: 'synthetic_generation',
      marketContext: {
        totalMarketSize: marketContext.totalMarketValue,
        growthRate: marketContext.growthRate
      }
    };
  }

  return {
    sentimentAnalysis: sentimentData.data,
    timestamp: sentimentData.timestamp,
    dataSource: 'real_time_connector',
    feedStatus: realTimeDataConnector.getStats('market_sentiment')
  };
}

/**
 * Handle competitive_analysis action
 */
async function handleCompetitiveAnalysis() {
  const competitiveAnalysis = marketIntelligenceSystem.getCompetitiveAnalysis();

  return {
    competitiveAnalysis,
    timestamp: new Date().toISOString(),
    analysisScope: 'global_tokenization_market',
    competitorCount: competitiveAnalysis.length,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Handle carbon_projections action
 */
async function handleCarbonProjections() {
  const projections = marketIntelligenceSystem.getCarbonMarketProjections();

  return {
    carbonProjections: projections,
    timestamp: new Date().toISOString(),
    projectionHorizon: '2024-2030',
    modelConfidence: 'high',
    keyAssumptions: [
      'Continued regulatory support for carbon markets',
      'Growing corporate net-zero commitments',
      'Technological advancement in verification'
    ]
  };
}

/**
 * Handle historical action with query parameters
 */
async function handleHistoricalData(request: NextRequest) {
  // Extract and validate query parameters
  const feedType = getQueryParam(request, 'feedType', true);
  const timeRange = getQueryParam(request, 'timeRange', true);
  const maxPoints = getQueryParam(request, 'maxPoints');

  if (!feedType || !validateDataFeedType(feedType)) {
    throw new Error(`Invalid feedType. Must be one of: carbon_pricing, rwa_market, regulatory_alerts, market_sentiment`);
  }

  if (!timeRange || !validateTimeRange(timeRange)) {
    throw new Error(`Invalid timeRange. Must be one of: 1h, 4h, 12h, 24h, 3d, 7d, 30d, 90d, 1y`);
  }

  let maxPointsNum = 100; // Default
  if (maxPoints) {
    const validationError = validateNumericRange(parseInt(maxPoints), 1, 1000, 'maxPoints');
    if (validationError) {
      throw new Error(validationError);
    }
    maxPointsNum = parseInt(maxPoints);
  }

  // Request historical data
  const historicalRequest = {
    feedType: feedType as DataFeedType,
    timeRange: timeRange as TimeRange,
    maxDataPoints: maxPointsNum
  };

  const historicalData = realTimeDataConnector.getHistoricalData(historicalRequest);

  if (!historicalData || !historicalData.dataPoints) {
    // Return empty historical data if none available
    return {
      historical: {
        dataPoints: [],
        metadata: {
          feedType: feedType as DataFeedType,
          timeRange: timeRange as TimeRange,
          maxDataPoints: maxPointsNum,
          actualDataPoints: 0,
          oldestTimestamp: new Date().toISOString(),
          newestTimestamp: new Date().toISOString()
        }
      },
      request: historicalRequest,
      timestamp: new Date().toISOString(),
      dataPoints: 0,
      timespan: {
        from: new Date().toISOString(),
        to: new Date().toISOString()
      }
    };
  }

  return {
    historical: historicalData,
    request: historicalRequest,
    timestamp: new Date().toISOString(),
    dataPoints: historicalData.dataPoints.length,
    timespan: {
      from: historicalData.metadata.oldestTimestamp,
      to: historicalData.metadata.newestTimestamp
    }
  };
}

/**
 * Handle feed_status action
 */
async function handleFeedStatus() {
  const allStats = realTimeDataConnector.getAllStats();

  return {
    feedStatus: allStats,
    timestamp: new Date().toISOString(),
    totalFeeds: Object.keys(allStats).length,
    connectedFeeds: Object.values(allStats).filter(stat => stat.status === 'connected').length,
    systemHealth: Object.values(allStats).every(stat => stat.status === 'connected') ? 'healthy' : 'degraded'
  };
}