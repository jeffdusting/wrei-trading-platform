/**
 * WREI Trading Platform - Live Market Data Handler
 *
 * Enhanced market data handler with live external API integration
 * Provides real-time carbon pricing and RWA market data
 */

import { NextRequest } from 'next/server';
import { getLiveCarbonPricing } from '../data-feeds/live-carbon-pricing-feed';
import { getRWAMarketContext } from '../data-sources/coinmarketcap-api';
import { getRWAYieldAdjustments } from '../data-sources/fred-api';
import { getCarbonMarketContext } from '../data-sources/world-bank-api';
import {
  apiResponse,
  apiError,
  getQueryParam,
  logApiRequest,
  logApiError
} from '../api-helpers';

export interface LiveMarketDataResponse {
  carbonPricing: {
    vcmSpotReference: number;
    dmrvSpotReference: number;
    forwardRemovalReference: number;
    wreiAnchorPrice: number;
    wreiFloorPrice: number;
    nswEscSpot: number;
    carbonIntensityIndex: number;
    dataSource: 'live' | 'simulation' | 'hybrid';
    confidence: number;
    freshness: number;
    lastUpdated: string;
  };
  rwaMarketData: {
    totalMarketCap: number;
    averageReturn24h: number;
    goldPremium: number;
    treasuryYield: number;
    marketTrend: 'bullish' | 'bearish' | 'sideways';
    volatility: number;
    topPerformer: any;
    lastUpdated: string;
  } | null;
  economicContext: {
    riskFreeRate: number;
    inflationAdjustedReturn: number;
    economicGrowthFactor: number;
    marketSentiment: 'expansionary' | 'contractionary' | 'neutral';
    yieldCurveSlope: number;
  } | null;
  marketIntelligence: {
    overallSentiment: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
    opportunityScore: number;
    recommendedAction: string;
  };
  apiStatus: {
    carbonPricing: 'success' | 'partial' | 'fallback';
    rwaData: 'success' | 'partial' | 'fallback';
    economicData: 'success' | 'partial' | 'fallback';
  };
  requestMetadata: {
    requestId: string;
    processingTime: number;
    dataLatency: number;
  };
}

/**
 * Handle live market data requests
 */
export async function handleLiveMarketData(
  request: NextRequest,
  action: string,
  requestId: string
): Promise<Response> {
  const startTime = Date.now();

  try {
    // Extract query parameters
    const includeRWA = getQueryParam(request, 'include_rwa', false) === 'true';
    const includeEconomic = getQueryParam(request, 'include_economic', false) === 'true';
    const fullData = getQueryParam(request, 'full_data', false) === 'true';

    // Fetch data concurrently
    const dataPromises = [
      getLiveCarbonPricing(),
      includeRWA || fullData ? getRWAMarketContext() : Promise.resolve(null),
      includeEconomic || fullData ? getRWAYieldAdjustments() : Promise.resolve(null),
      fullData ? getCarbonMarketContext() : Promise.resolve(null)
    ];

    const [carbonPricing, rwaData, economicData, carbonContext] = await Promise.allSettled(dataPromises);

    // Process carbon pricing data
    let carbonPricingResult;
    let carbonPricingStatus: 'success' | 'partial' | 'fallback' = 'fallback';

    if (carbonPricing.status === 'fulfilled' && carbonPricing.value) {
      const value = carbonPricing.value as any; // Type assertion to handle the complex union type
      carbonPricingResult = {
        vcmSpotReference: value.vcmSpotReference,
        dmrvSpotReference: value.dmrvSpotReference,
        forwardRemovalReference: value.forwardRemovalReference,
        wreiAnchorPrice: value.wreiAnchorPrice,
        wreiFloorPrice: value.wreiFloorPrice,
        nswEscSpot: value.nswEscSpot,
        carbonIntensityIndex: value.carbonIntensityIndex,
        dataSource: value.dataSource,
        confidence: value.confidence,
        freshness: value.freshness,
        lastUpdated: value.lastUpdated
      };
      carbonPricingStatus = value.confidence > 90 ? 'success' :
                           value.confidence > 60 ? 'partial' : 'fallback';
    } else {
      // Fallback carbon pricing
      carbonPricingResult = {
        vcmSpotReference: 8.45,
        dmrvSpotReference: 15.20,
        forwardRemovalReference: 185.00,
        wreiAnchorPrice: 28.12,
        wreiFloorPrice: 22.80,
        nswEscSpot: 47.80,
        carbonIntensityIndex: 65,
        dataSource: 'fallback' as const,
        confidence: 50,
        freshness: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    // Process RWA market data
    let rwaMarketResult = null;
    let rwaDataStatus: 'success' | 'partial' | 'fallback' = 'fallback';

    if (rwaData && rwaData.status === 'fulfilled' && rwaData.value) {
      const rwaValue = rwaData.value as any; // Type assertion for complex union type
      rwaMarketResult = {
        totalMarketCap: rwaValue.marketOverview?.totalMarketCap || 0,
        averageReturn24h: rwaValue.marketOverview?.averageReturn24h || 0,
        goldPremium: rwaValue.goldPremium || 1.0,
        treasuryYield: rwaValue.treasuryYield || 4.5,
        marketTrend: rwaValue.marketTrend || 'neutral',
        volatility: rwaValue.rwaVolatility || 2.0,
        topPerformer: rwaValue.marketOverview?.topPerformer || null,
        lastUpdated: rwaValue.marketOverview?.lastUpdated || new Date().toISOString()
      };
      rwaDataStatus = 'success';
    } else if (includeRWA || fullData) {
      // Fallback RWA data
      rwaMarketResult = {
        totalMarketCap: 1050000000,
        averageReturn24h: 0.3,
        goldPremium: 1.02,
        treasuryYield: 4.5,
        marketTrend: 'neutral' as const,
        volatility: 2.1,
        topPerformer: null,
        lastUpdated: new Date().toISOString()
      };
    }

    // Process economic context
    let economicContextResult = null;
    let economicDataStatus: 'success' | 'partial' | 'fallback' = 'fallback';

    if (economicData && economicData.status === 'fulfilled' && economicData.value) {
      const economicValue = economicData.value as any; // Type assertion
      economicContextResult = economicValue.economicContext || economicValue;
      economicDataStatus = 'success';
    } else if (includeEconomic || fullData) {
      // Fallback economic data
      economicContextResult = {
        riskFreeRate: 4.5,
        inflationAdjustedReturn: 1.3,
        economicGrowthFactor: 1.0,
        marketSentiment: 'neutral' as const,
        yieldCurveSlope: -0.025
      };
    }

    // Generate market intelligence
    const marketIntelligence = generateMarketIntelligence(
      carbonPricingResult,
      rwaMarketResult,
      economicContextResult
    );

    // Calculate processing metrics
    const processingTime = Date.now() - startTime;
    const dataLatency = carbonPricingResult.freshness;

    const response: LiveMarketDataResponse = {
      carbonPricing: carbonPricingResult,
      rwaMarketData: rwaMarketResult,
      economicContext: economicContextResult,
      marketIntelligence,
      apiStatus: {
        carbonPricing: carbonPricingStatus,
        rwaData: rwaDataStatus,
        economicData: economicDataStatus
      },
      requestMetadata: {
        requestId,
        processingTime,
        dataLatency
      }
    };

    // Log successful request
    logApiRequest('GET', '/api/market-data', action, requestId, true, processingTime);

    return apiResponse(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logApiError('GET', '/api/market-data', action, requestId, error instanceof Error ? error.message : 'Unknown error');

    return apiError(
      `Market data request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

/**
 * Generate market intelligence summary
 */
function generateMarketIntelligence(
  carbonPricing: any,
  rwaData: any,
  economicContext: any
): {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
  opportunityScore: number;
  recommendedAction: string;
} {
  let sentimentScore = 0;
  let riskScore = 0;

  // Factor in carbon pricing confidence and trends
  if (carbonPricing.confidence > 80) sentimentScore += 1;
  if (carbonPricing.confidence < 60) riskScore += 1;

  // Factor in RWA market trends
  if (rwaData) {
    if (rwaData.marketTrend === 'bullish') sentimentScore += 1;
    if (rwaData.marketTrend === 'bearish') sentimentScore -= 1;
    if (rwaData.volatility > 5) riskScore += 1;
  }

  // Factor in economic conditions
  if (economicContext) {
    if (economicContext.marketSentiment === 'expansionary') sentimentScore += 1;
    if (economicContext.marketSentiment === 'contractionary') sentimentScore -= 1;
    if (economicContext.economicGrowthFactor > 1.1) sentimentScore += 1;
  }

  // Determine overall sentiment
  const overallSentiment = sentimentScore > 1 ? 'bullish' :
                          sentimentScore < -1 ? 'bearish' : 'neutral';

  // Determine risk level
  const riskLevel = riskScore > 2 ? 'high' :
                   riskScore > 0 ? 'medium' : 'low';

  // Calculate opportunity score (0-100)
  const opportunityScore = Math.max(0, Math.min(100,
    50 + (sentimentScore * 15) - (riskScore * 10) + (carbonPricing.confidence * 0.3)
  ));

  // Generate recommended action
  let recommendedAction = 'Hold current positions and monitor market conditions';

  if (overallSentiment === 'bullish' && riskLevel === 'low') {
    recommendedAction = 'Consider increasing carbon credit positions - favorable market conditions';
  } else if (overallSentiment === 'bearish' && riskLevel === 'high') {
    recommendedAction = 'Exercise caution - consider reducing exposure or hedging positions';
  } else if (opportunityScore > 75) {
    recommendedAction = 'Strong opportunity identified - consider strategic positioning';
  }

  return {
    overallSentiment,
    riskLevel,
    opportunityScore: Math.round(opportunityScore),
    recommendedAction
  };
}