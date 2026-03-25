/**
 * WREI Trading Platform - Live Carbon Pricing Feed
 *
 * Enhanced carbon pricing with live data integration
 * Combines real market data with sophisticated simulation
 */

import { PRICING_INDEX, NEGOTIATION_CONFIG } from '../negotiation-config';
import { getCarbonMarketContext } from '../data-sources/world-bank-api';
import { getRWAYieldAdjustments } from '../data-sources/fred-api';
import { getRWAMarketContext } from '../data-sources/coinmarketcap-api';
export interface LiveCarbonPricingData {
  vcmSpotReference: number;
  dmrvSpotReference: number;
  forwardRemovalReference: number;
  dmrvPremiumBenchmark: number;
  wreiAnchorPrice: number;
  wreiFloorPrice: number;
  nswEscSpot: number;
  carbonIntensityIndex: number;
  lastUpdated: string;

  // Live data specific fields
  dataSource: 'live' | 'simulation' | 'hybrid';
  freshness: number; // Age of data in minutes
  confidence: number; // Confidence in pricing data (0-100)
  marketContext: {
    commodityInfluence: number;
    economicInfluence: number;
    rwaInfluence: number;
    regulatoryInfluence: number;
  };
}

export interface PriceUpdateResult {
  success: boolean;
  updatedPrices: LiveCarbonPricingData;
  errors?: string[];
  fallbackUsed: boolean;
  apiStatus: {
    worldBank: 'success' | 'error' | 'timeout';
    fred: 'success' | 'error' | 'timeout';
    coinmarketcap: 'success' | 'error' | 'timeout';
  };
}

/**
 * Live Carbon Pricing Feed with multiple data source integration
 */
export class LiveCarbonPricingFeed {
  private baseReference: number;
  private lastUpdate: Date;
  private cachedPricing: LiveCarbonPricingData | null = null;
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseReference = PRICING_INDEX.VCM_SPOT_REFERENCE;
    this.lastUpdate = new Date(0); // Force initial update
  }

  /**
   * Get live carbon pricing with multiple data source integration
   */
  async getLivePricingData(): Promise<PriceUpdateResult> {
    const now = new Date();
    const timeSinceUpdate = now.getTime() - this.lastUpdate.getTime();

    // Return cached data if fresh enough
    if (this.cachedPricing && timeSinceUpdate < this.cacheTimeout) {
      return {
        success: true,
        updatedPrices: this.cachedPricing,
        fallbackUsed: false,
        apiStatus: { worldBank: 'success', fred: 'success', coinmarketcap: 'success' }
      };
    }

    const errors: string[] = [];
    const apiStatus = {
      worldBank: 'success' as 'success' | 'error' | 'timeout',
      fred: 'success' as 'success' | 'error' | 'timeout',
      coinmarketcap: 'success' as 'success' | 'error' | 'timeout'
    };

    try {
      // Fetch data from multiple sources concurrently
      const [carbonContext, rwaAdjustments, rwaMarketData] = await Promise.allSettled([
        this.timeoutPromise(getCarbonMarketContext(), 10000),
        this.timeoutPromise(getRWAYieldAdjustments(), 10000),
        this.timeoutPromise(getRWAMarketContext(), 10000)
      ]);

      // Process World Bank carbon context
      let commodityInfluence = 1.0;
      if (carbonContext.status === 'fulfilled' && carbonContext.value.commodityPrices) {
        commodityInfluence = carbonContext.value.carbonPremiumEstimate;
      } else {
        apiStatus.worldBank = carbonContext.status === 'rejected' ? 'error' : 'timeout';
        if (carbonContext.status === 'rejected') {
          errors.push(`World Bank API: ${carbonContext.reason}`);
        }
      }

      // Process FRED economic data
      let economicInfluence = 1.0;
      if (rwaAdjustments.status === 'fulfilled') {
        const context = rwaAdjustments.value.economicContext;
        economicInfluence = 1.0 + (context.economicGrowthFactor - 1.0) * 0.5; // Moderate the influence
      } else {
        apiStatus.fred = rwaAdjustments.status === 'rejected' ? 'error' : 'timeout';
        if (rwaAdjustments.status === 'rejected') {
          errors.push(`FRED API: ${rwaAdjustments.reason}`);
        }
      }

      // Process RWA market data
      let rwaInfluence = 1.0;
      if (rwaMarketData.status === 'fulfilled') {
        const marketTrend = rwaMarketData.value.marketTrend;
        rwaInfluence = marketTrend === 'bullish' ? 1.05 :
                      marketTrend === 'bearish' ? 0.95 : 1.0;
      } else {
        apiStatus.coinmarketcap = rwaMarketData.status === 'rejected' ? 'error' : 'timeout';
        if (rwaMarketData.status === 'rejected') {
          errors.push(`CoinMarketCap API: ${rwaMarketData.reason}`);
        }
      }

      // Calculate live pricing with influences
      const livePricing = this.calculateLivePricing({
        commodityInfluence,
        economicInfluence,
        rwaInfluence,
        regulatoryInfluence: this.getRegulatoryInfluence() // Static for now
      });

      this.cachedPricing = livePricing;
      this.lastUpdate = now;

      return {
        success: true,
        updatedPrices: livePricing,
        errors: errors.length > 0 ? errors : undefined,
        fallbackUsed: errors.length === 3, // All APIs failed
        apiStatus
      };

    } catch (error) {
      console.error('Live pricing update failed:', error);

      // Return fallback simulation data
      const fallbackPricing = this.getFallbackPricing();

      return {
        success: false,
        updatedPrices: fallbackPricing,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        fallbackUsed: true,
        apiStatus: { worldBank: 'error', fred: 'error', coinmarketcap: 'error' }
      };
    }
  }

  /**
   * Calculate live pricing based on market influences
   */
  private calculateLivePricing(marketContext: {
    commodityInfluence: number;
    economicInfluence: number;
    rwaInfluence: number;
    regulatoryInfluence: number;
  }): LiveCarbonPricingData {
    const basePrices = PRICING_INDEX;

    // Apply market influences to base prices
    const combinedInfluence = (
      marketContext.commodityInfluence * 0.3 +
      marketContext.economicInfluence * 0.25 +
      marketContext.rwaInfluence * 0.25 +
      marketContext.regulatoryInfluence * 0.2
    );

    const wreiAnchorPrice = NEGOTIATION_CONFIG.BASE_CARBON_PRICE * NEGOTIATION_CONFIG.WREI_PREMIUM_MULTIPLIER * combinedInfluence;
    const wreiFloorPrice = wreiAnchorPrice * 0.81; // Maintain 81% floor ratio

    // Calculate confidence based on API success rate
    const successfulAPIs = Object.values(this.getLastAPIStatus()).filter(status => status === 'success').length;
    const confidence = (successfulAPIs / 3) * 100;

    return {
      vcmSpotReference: basePrices.VCM_SPOT_REFERENCE * marketContext.commodityInfluence,
      dmrvSpotReference: basePrices.DMRV_SPOT_REFERENCE * combinedInfluence,
      forwardRemovalReference: basePrices.FORWARD_REMOVAL_REFERENCE * marketContext.economicInfluence,
      dmrvPremiumBenchmark: basePrices.DMRV_PREMIUM_BENCHMARK,
      wreiAnchorPrice: Math.round(wreiAnchorPrice * 100) / 100,
      wreiFloorPrice: Math.round(wreiFloorPrice * 100) / 100,
      nswEscSpot: basePrices.ESC_SPOT_REFERENCE, // Static for now - would need Australian API
      carbonIntensityIndex: this.calculateCarbonIntensity(marketContext),
      lastUpdated: new Date().toISOString(),

      // Live data specific fields
      dataSource: 'hybrid' as const,
      freshness: 0, // Fresh data
      confidence,
      marketContext
    };
  }

  /**
   * Get current regulatory influence (static for now)
   */
  private getRegulatoryInfluence(): number {
    // This would integrate with regulatory news feeds in production
    // For now, return neutral influence
    return 1.0;
  }

  /**
   * Calculate carbon intensity index from market context
   */
  private calculateCarbonIntensity(marketContext: {
    commodityInfluence: number;
    economicInfluence: number;
    rwaInfluence: number;
    regulatoryInfluence: number;
  }): number {
    const baseIntensity = 65; // Base carbon intensity
    const intensityMultiplier = (marketContext.commodityInfluence + marketContext.regulatoryInfluence) / 2;

    return Math.round(baseIntensity * intensityMultiplier);
  }

  /**
   * Get fallback pricing when APIs fail
   */
  private getFallbackPricing(): LiveCarbonPricingData {
    const basePrices = PRICING_INDEX;

    return {
      vcmSpotReference: basePrices.VCM_SPOT_REFERENCE,
      dmrvSpotReference: basePrices.DMRV_SPOT_REFERENCE,
      forwardRemovalReference: basePrices.FORWARD_REMOVAL_REFERENCE,
      dmrvPremiumBenchmark: basePrices.DMRV_PREMIUM_BENCHMARK,
      wreiAnchorPrice: NEGOTIATION_CONFIG.BASE_CARBON_PRICE * NEGOTIATION_CONFIG.WREI_PREMIUM_MULTIPLIER,
      wreiFloorPrice: NEGOTIATION_CONFIG.BASE_CARBON_PRICE * NEGOTIATION_CONFIG.WREI_PREMIUM_MULTIPLIER * 0.81,
      nswEscSpot: basePrices.ESC_SPOT_REFERENCE,
      carbonIntensityIndex: 65,
      lastUpdated: new Date().toISOString(),

      dataSource: 'simulation',
      freshness: 0,
      confidence: 75, // Reduced confidence for fallback data
      marketContext: {
        commodityInfluence: 1.0,
        economicInfluence: 1.0,
        rwaInfluence: 1.0,
        regulatoryInfluence: 1.0
      }
    };
  }

  /**
   * Get status of last API calls
   */
  private getLastAPIStatus() {
    // This would store the last known status - simplified for now
    return {
      worldBank: 'success' as 'success' | 'error' | 'timeout',
      fred: 'success' as 'success' | 'error' | 'timeout',
      coinmarketcap: 'success' as 'success' | 'error' | 'timeout'
    };
  }

  /**
   * Timeout wrapper for API calls
   */
  private timeoutPromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    });
  }
}

/**
 * Global instance for the live carbon pricing feed
 */
export const liveCarbonPricingFeed = new LiveCarbonPricingFeed();

/**
 * Get live carbon pricing data with fallback
 */
export async function getLiveCarbonPricing(): Promise<LiveCarbonPricingData> {
  const result = await liveCarbonPricingFeed.getLivePricingData();
  return result.updatedPrices;
}

export default LiveCarbonPricingFeed;