/**
 * WREI Trading Platform - Live Pricing Configuration
 *
 * Dynamic pricing configuration that integrates with live market data
 * Replaces static PRICING_INDEX with live data integration
 */

import { livePricingService, LivePricingData } from '../services/live-pricing-service';

export interface DynamicPricingIndex {
  // Voluntary Carbon Market References (USD)
  VCM_SPOT_REFERENCE: number;
  DMRV_SPOT_REFERENCE: number;
  FORWARD_REMOVAL_REFERENCE: number;
  DMRV_PREMIUM_BENCHMARK: number;

  // NSW ESC Market References (AUD) - LIVE DATA
  ESC_SPOT_REFERENCE: number;
  ESC_FORWARD_REFERENCE: number;
  ESC_VOLATILITY_RANGE: [number, number];

  // WREI Specific Pricing
  WREI_ANCHOR_PRICE: number;
  WREI_FLOOR_PRICE: number;

  // Premium Benchmarks
  CCP_PREMIUM_LOW: number;
  CCP_PREMIUM_HIGH: number;
  INSTITUTIONAL_PREMIUM: number;

  // Metadata
  INDEX_TIMESTAMP: string;
  DATA_SOURCES: string[];
  IS_LIVE: boolean;
  CONFIDENCE: number;
}

export interface DynamicNSWESCConfig {
  MARKET_CONDITIONS: {
    SPOT_PRICE: number;
    FORWARD_PRICE: number;
    VOLATILITY_RANGE: [number, number];
    LAST_UPDATED: string;
    DATA_SOURCES: string[];
    IS_LIVE_DATA: boolean;
    CONFIDENCE_LEVEL: number;
  };
  PARTICIPANTS: {
    TOTAL_COUNT: number;
    OUR_MARKET_SHARE: number;
    MARKET_SIZE_AUD: number;
  };
  NORTHMORE_GORDON_CONTEXT: {
    AFSL: string;
    TRADING_CAPABILITY: string;
    MARKET_POSITION: string;
    AI_ADVANTAGE: string;
  };
}

class LivePricingConfig {
  private static instance: LivePricingConfig;
  private cachedPricingIndex: DynamicPricingIndex | null = null;
  private cachedNSWConfig: DynamicNSWESCConfig | null = null;
  private lastUpdate: Date | null = null;
  private cacheValidityMs = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Initialize with live pricing service
  }

  public static getInstance(): LivePricingConfig {
    if (!LivePricingConfig.instance) {
      LivePricingConfig.instance = new LivePricingConfig();
    }
    return LivePricingConfig.instance;
  }

  /**
   * Get dynamic pricing index with live data
   */
  public async getPricingIndex(forceRefresh: boolean = false): Promise<DynamicPricingIndex> {
    if (this.needsRefresh() || forceRefresh) {
      await this.refreshPricingData();
    }
    return this.cachedPricingIndex || this.getFallbackPricingIndex();
  }

  /**
   * Get NSW ESC configuration with live data
   */
  public async getNSWESCConfig(forceRefresh: boolean = false): Promise<DynamicNSWESCConfig> {
    if (this.needsRefresh() || forceRefresh) {
      await this.refreshPricingData();
    }
    return this.cachedNSWConfig || this.getFallbackNSWConfig();
  }

  /**
   * Get live NSW ESC spot price directly
   */
  public async getLiveESCSpotPrice(): Promise<number> {
    const pricingIndex = await this.getPricingIndex();
    return pricingIndex.ESC_SPOT_REFERENCE;
  }

  /**
   * Get live WREI anchor price directly
   */
  public async getLiveWREIAnchorPrice(): Promise<number> {
    const pricingIndex = await this.getPricingIndex();
    return pricingIndex.WREI_ANCHOR_PRICE;
  }

  /**
   * Refresh all pricing data from live sources
   */
  private async refreshPricingData(): Promise<void> {
    try {
      const livePricing: LivePricingData = await livePricingService.getCurrentPricing();

      this.cachedPricingIndex = {
        // Voluntary Carbon Market References (USD) - Keep stable for demo
        VCM_SPOT_REFERENCE: 8.45,
        DMRV_SPOT_REFERENCE: 15.20,
        FORWARD_REMOVAL_REFERENCE: 185,
        DMRV_PREMIUM_BENCHMARK: 1.78,

        // NSW ESC Market References (AUD) - LIVE DATA
        ESC_SPOT_REFERENCE: livePricing.nswEscSpot,
        ESC_FORWARD_REFERENCE: livePricing.nswEscForward,
        ESC_VOLATILITY_RANGE: [livePricing.nswEscSpot * 0.80, livePricing.nswEscSpot * 1.42] as [number, number],

        // WREI Specific Pricing - LIVE DATA
        WREI_ANCHOR_PRICE: livePricing.wreiAnchor,
        WREI_FLOOR_PRICE: livePricing.wreiFloor,

        // Premium Benchmarks - Stable multipliers
        CCP_PREMIUM_LOW: 1.15,
        CCP_PREMIUM_HIGH: 1.25,
        INSTITUTIONAL_PREMIUM: 1.12,

        // Metadata
        INDEX_TIMESTAMP: livePricing.lastUpdated,
        DATA_SOURCES: ['Live Data Feed', 'World Bank API', 'FRED API', 'CoinMarketCap API'],
        IS_LIVE: livePricing.dataSource === 'live' || livePricing.dataSource === 'hybrid',
        CONFIDENCE: livePricing.confidence
      };

      this.cachedNSWConfig = {
        MARKET_CONDITIONS: {
          SPOT_PRICE: livePricing.nswEscSpot,
          FORWARD_PRICE: livePricing.nswEscForward,
          VOLATILITY_RANGE: [livePricing.nswEscSpot * 0.80, livePricing.nswEscSpot * 1.42] as [number, number],
          LAST_UPDATED: livePricing.lastUpdated,
          DATA_SOURCES: ['Live Market Data', 'AEMO', 'NSW ESC Registry', 'IPART', 'CER'],
          IS_LIVE_DATA: livePricing.dataSource === 'live' || livePricing.dataSource === 'hybrid',
          CONFIDENCE_LEVEL: livePricing.confidence
        },
        PARTICIPANTS: {
          TOTAL_COUNT: 850,
          OUR_MARKET_SHARE: 12,
          MARKET_SIZE_AUD: 200_000_000
        },
        NORTHMORE_GORDON_CONTEXT: {
          AFSL: '246896',
          TRADING_CAPABILITY: 'Full market access with proprietary AI negotiation',
          MARKET_POSITION: 'Leading AI-enhanced trading platform (12% market share)',
          AI_ADVANTAGE: '18.5% average price improvement through intelligent negotiation'
        }
      };

      this.lastUpdate = new Date();

    } catch (error) {
      console.error('[LivePricingConfig] Failed to refresh pricing data:', error);
      // Keep existing cached data on error
    }
  }

  /**
   * Check if cached data needs refresh
   */
  private needsRefresh(): boolean {
    return !this.lastUpdate ||
           !this.cachedPricingIndex ||
           (Date.now() - this.lastUpdate.getTime()) > this.cacheValidityMs;
  }

  /**
   * Get fallback pricing index
   */
  private getFallbackPricingIndex(): DynamicPricingIndex {
    return {
      VCM_SPOT_REFERENCE: 8.45,
      DMRV_SPOT_REFERENCE: 15.20,
      FORWARD_REMOVAL_REFERENCE: 185,
      DMRV_PREMIUM_BENCHMARK: 1.78,
      ESC_SPOT_REFERENCE: 47.80, // Fallback
      ESC_FORWARD_REFERENCE: 52.15, // Fallback
      ESC_VOLATILITY_RANGE: [38, 68],
      WREI_ANCHOR_PRICE: 150.00,
      WREI_FLOOR_PRICE: 120.00,
      CCP_PREMIUM_LOW: 1.15,
      CCP_PREMIUM_HIGH: 1.25,
      INSTITUTIONAL_PREMIUM: 1.12,
      INDEX_TIMESTAMP: new Date().toISOString(),
      DATA_SOURCES: ['Fallback Configuration'],
      IS_LIVE: false,
      CONFIDENCE: 75
    };
  }

  /**
   * Get fallback NSW ESC config
   */
  private getFallbackNSWConfig(): DynamicNSWESCConfig {
    return {
      MARKET_CONDITIONS: {
        SPOT_PRICE: 47.80,
        FORWARD_PRICE: 52.15,
        VOLATILITY_RANGE: [38, 68],
        LAST_UPDATED: new Date().toISOString(),
        DATA_SOURCES: ['Fallback Configuration'],
        IS_LIVE_DATA: false,
        CONFIDENCE_LEVEL: 75
      },
      PARTICIPANTS: {
        TOTAL_COUNT: 850,
        OUR_MARKET_SHARE: 12,
        MARKET_SIZE_AUD: 200_000_000
      },
      NORTHMORE_GORDON_CONTEXT: {
        AFSL: '246896',
        TRADING_CAPABILITY: 'Full market access with proprietary AI negotiation',
        MARKET_POSITION: 'Leading AI-enhanced trading platform (12% market share)',
        AI_ADVANTAGE: '18.5% average price improvement through intelligent negotiation'
      }
    };
  }

  /**
   * Get pricing status for debugging
   */
  public getStatus(): {
    isLive: boolean;
    lastUpdate: string | null;
    confidence: number;
    currentSpotPrice: number;
  } {
    return {
      isLive: this.cachedPricingIndex?.IS_LIVE || false,
      lastUpdate: this.lastUpdate?.toISOString() || null,
      confidence: this.cachedPricingIndex?.CONFIDENCE || 0,
      currentSpotPrice: this.cachedPricingIndex?.ESC_SPOT_REFERENCE || 47.80
    };
  }
}

// Export singleton instance
export const livePricingConfig = LivePricingConfig.getInstance();

// Types are exported via interface declarations above

// Legacy compatibility exports (for gradual migration)
export async function getLivePricingIndex(): Promise<DynamicPricingIndex> {
  return livePricingConfig.getPricingIndex();
}

export async function getLiveNSWESCConfig(): Promise<DynamicNSWESCConfig> {
  return livePricingConfig.getNSWESCConfig();
}