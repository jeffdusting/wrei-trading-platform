/**
 * WREI Trading Platform - Live Pricing Service
 *
 * Centralized service for accessing real-time pricing data
 * Replaces static NSW ESC pricing (A$47.80) with live market data
 */

import { LiveCarbonPricingData, PriceUpdateResult, LiveCarbonPricingFeed } from '../data-feeds/live-carbon-pricing-feed';

export interface LivePricingData {
  nswEscSpot: number;
  nswEscForward: number;
  vcmSpot: number;
  wreiAnchor: number;
  wreiFloor: number;
  lastUpdated: string;
  dataSource: 'live' | 'simulation' | 'hybrid';
  freshness: number;
  confidence: number;
}

export interface PricingServiceConfig {
  refreshInterval: number; // minutes
  fallbackEnabled: boolean;
  maxAge: number; // minutes
}

class LivePricingService {
  private static instance: LivePricingService;
  private liveFeed: LiveCarbonPricingFeed;
  private cachedData: LivePricingData | null = null;
  private lastUpdate: Date | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private config: PricingServiceConfig = {
    refreshInterval: 5, // 5 minutes
    fallbackEnabled: true,
    maxAge: 15 // 15 minutes max age
  };

  private constructor() {
    this.liveFeed = new LiveCarbonPricingFeed();
    this.startAutoRefresh();
  }

  public static getInstance(): LivePricingService {
    if (!LivePricingService.instance) {
      LivePricingService.instance = new LivePricingService();
    }
    return LivePricingService.instance;
  }

  /**
   * Get current live pricing data
   */
  public async getCurrentPricing(forceRefresh: boolean = false): Promise<LivePricingData> {
    const now = new Date();
    const needsRefresh = forceRefresh ||
      !this.cachedData ||
      !this.lastUpdate ||
      (now.getTime() - this.lastUpdate.getTime()) > (this.config.maxAge * 60 * 1000);

    if (needsRefresh) {
      await this.refreshPricing();
    }

    return this.cachedData || this.getFallbackPricing();
  }

  /**
   * Get NSW ESC spot price specifically
   */
  public async getNSWESCSpotPrice(): Promise<number> {
    const pricing = await this.getCurrentPricing();
    return pricing.nswEscSpot;
  }

  /**
   * Get WREI anchor price
   */
  public async getWREIAnchorPrice(): Promise<number> {
    const pricing = await this.getCurrentPricing();
    return pricing.wreiAnchor;
  }

  /**
   * Get WREI floor price
   */
  public async getWREIFloorPrice(): Promise<number> {
    const pricing = await this.getCurrentPricing();
    return pricing.wreiFloor;
  }

  /**
   * Refresh pricing data from live sources
   */
  private async refreshPricing(): Promise<void> {
    try {
      const result: PriceUpdateResult = await this.liveFeed.getLivePricingData();

      if (result.success) {
        this.cachedData = {
          nswEscSpot: result.updatedPrices.nswEscSpot,
          nswEscForward: result.updatedPrices.nswEscSpot * 1.09, // Forward premium
          vcmSpot: result.updatedPrices.vcmSpotReference,
          wreiAnchor: result.updatedPrices.wreiAnchorPrice,
          wreiFloor: result.updatedPrices.wreiFloorPrice,
          lastUpdated: result.updatedPrices.lastUpdated,
          dataSource: result.updatedPrices.dataSource,
          freshness: result.updatedPrices.freshness,
          confidence: result.updatedPrices.confidence
        };
        this.lastUpdate = new Date();
      } else {
        console.warn('[LivePricingService] Failed to refresh pricing data, using fallback');
        if (this.config.fallbackEnabled && !this.cachedData) {
          this.cachedData = this.getFallbackPricing();
          this.lastUpdate = new Date();
        }
      }
    } catch (error) {
      console.error('[LivePricingService] Error refreshing pricing:', error);
      if (this.config.fallbackEnabled && !this.cachedData) {
        this.cachedData = this.getFallbackPricing();
        this.lastUpdate = new Date();
      }
    }
  }

  /**
   * Get fallback pricing when live data unavailable
   */
  private getFallbackPricing(): LivePricingData {
    return {
      nswEscSpot: 47.80, // Fallback to known stable value
      nswEscForward: 52.10,
      vcmSpot: 6.34,
      wreiAnchor: 150.00,
      wreiFloor: 120.00,
      lastUpdated: new Date().toISOString(),
      dataSource: 'simulation',
      freshness: 0,
      confidence: 75
    };
  }

  /**
   * Start automatic refresh timer
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(async () => {
      await this.refreshPricing();
    }, this.config.refreshInterval * 60 * 1000);

    // Initial refresh
    this.refreshPricing().catch(console.error);
  }

  /**
   * Stop automatic refresh
   */
  public stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Update service configuration
   */
  public updateConfig(newConfig: Partial<PricingServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart auto-refresh with new interval if it changed
    if (newConfig.refreshInterval) {
      this.startAutoRefresh();
    }
  }

  /**
   * Get service status
   */
  public getStatus(): {
    isActive: boolean;
    lastUpdate: string | null;
    dataAge: number; // minutes
    confidence: number;
    dataSource: string;
  } {
    const now = new Date();
    const dataAge = this.lastUpdate ?
      (now.getTime() - this.lastUpdate.getTime()) / (1000 * 60) : -1;

    return {
      isActive: !!this.refreshTimer,
      lastUpdate: this.lastUpdate?.toISOString() || null,
      dataAge,
      confidence: this.cachedData?.confidence || 0,
      dataSource: this.cachedData?.dataSource || 'none'
    };
  }

  /**
   * Force immediate pricing refresh
   */
  public async forceRefresh(): Promise<PriceUpdateResult> {
    const result = await this.liveFeed.getLivePricingData();
    if (result.success) {
      await this.refreshPricing();
    }
    return result;
  }
}

// Export singleton instance
export const livePricingService = LivePricingService.getInstance();

// Types are exported via interface declarations above