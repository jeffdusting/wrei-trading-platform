/**
 * WREI Market Data Ticker - Live Feed + Simulated Fallback
 *
 * Provides market data for the Bloomberg Terminal ticker bar.
 * Fetches live prices from the feed-manager API when available,
 * falls back to local simulation when the API is unreachable.
 */

import React from 'react';
import { PRICING_INDEX } from './negotiation-config';

export interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  currency: 'USD' | 'AUD';
  volume?: number;
  high24h?: number;
  low24h?: number;
  /** Price tier from feed-manager: live, cached, or simulated */
  feedTier?: 'live' | 'cached' | 'simulated';
}

export interface MarketStatus {
  isOpen: boolean;
  nextChange: string;
  timezone: string;
  lastUpdate: Date;
}

/** Overall feed health for UI indicators */
export type FeedOverallStatus = 'live' | 'cached' | 'simulated';

// Mapping from feed-manager InstrumentType to ticker symbol
const INSTRUMENT_TO_TICKER: Record<string, string> = {
  ESC: 'ESC-NSW',
  VEEC: 'VEEC',
  PRC: 'PRC',
  ACCU: 'ACCU',
  LGC: 'LGC',
  STC: 'STC',
  WREI_CC: 'WREI-C',
  WREI_ACO: 'WREI-ACO',
};

// Base ticker definitions with current market values
const BASE_TICKERS: Omit<TickerData, 'change' | 'changePercent' | 'timestamp'>[] = [
  {
    symbol: 'WREI-C',
    name: 'WREI Carbon Credits',
    price: 28.12,
    currency: 'USD',
  },
  {
    symbol: 'WREI-ESC',
    name: 'WREI ESC Credits',
    price: 54.97,
    currency: 'AUD',
  },
  {
    symbol: 'VCM-SPOT',
    name: 'VCM Spot Average',
    price: PRICING_INDEX.VCM_SPOT_REFERENCE,
    currency: 'USD',
  },
  {
    symbol: 'DMRV-SPOT',
    name: 'Digital MRV Credits',
    price: PRICING_INDEX.DMRV_SPOT_REFERENCE,
    currency: 'USD',
  },
  {
    symbol: 'ESC-NSW',
    name: 'NSW ESC Spot',
    price: PRICING_INDEX.ESC_SPOT_REFERENCE,
    currency: 'AUD',
  },
  {
    symbol: 'ESC-FWD',
    name: 'ESC Forward (12M)',
    price: PRICING_INDEX.ESC_FORWARD_REFERENCE,
    currency: 'AUD',
  },
  {
    symbol: 'RWA-IDX',
    name: 'WREI Infrastructure Index',
    price: 142.85,
    currency: 'USD',
  },
  // Certificate instruments added from feed-manager
  {
    symbol: 'VEEC',
    name: 'VIC VEEC Spot',
    price: 83.50,
    currency: 'AUD',
  },
  {
    symbol: 'ACCU',
    name: 'ACCU Spot',
    price: 35.00,
    currency: 'AUD',
  },
  {
    symbol: 'LGC',
    name: 'LGC Spot',
    price: 5.25,
    currency: 'AUD',
  },
  {
    symbol: 'STC',
    name: 'STC Spot',
    price: 39.50,
    currency: 'AUD',
  },
  {
    symbol: 'PRC',
    name: 'PRC Spot',
    price: 2.85,
    currency: 'AUD',
  },
  {
    symbol: 'WREI-ACO',
    name: 'WREI Asset Co',
    price: 1000.00,
    currency: 'AUD',
  },
];

// Market simulation state
class MarketSimulator {
  private tickers: Map<string, TickerData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(tickers: TickerData[]) => void> = new Set();
  private lastUpdateTime: Date = new Date();
  private _feedOverallStatus: FeedOverallStatus = 'simulated';

  constructor() {
    this.initializeTickers();
  }

  private initializeTickers(): void {
    const now = new Date();

    BASE_TICKERS.forEach(baseTicker => {
      const ticker: TickerData = {
        ...baseTicker,
        change: 0,
        changePercent: 0,
        timestamp: now,
        volume: this.generateInitialVolume(baseTicker.symbol),
        high24h: baseTicker.price * (1 + Math.random() * 0.05),
        low24h: baseTicker.price * (1 - Math.random() * 0.05),
      };

      this.tickers.set(baseTicker.symbol, ticker);
    });
  }

  private generateInitialVolume(symbol: string): number {
    const baseVolumes: Record<string, number> = {
      'WREI-C': 15000,
      'WREI-ESC': 45000,
      'VCM-SPOT': 125000,
      'DMRV-SPOT': 85000,
      'ESC-NSW': 95000,
      'ESC-FWD': 35000,
      'RWA-IDX': 25000,
      'VEEC': 60000,
      'ACCU': 40000,
      'LGC': 30000,
      'STC': 80000,
      'PRC': 20000,
      'WREI-ACO': 5000,
    };

    const base = baseVolumes[symbol] || 10000;
    return Math.floor(base * (0.7 + Math.random() * 0.6));
  }

  private updateTickerPrice(ticker: TickerData): TickerData {
    const volatilityMultipliers: Record<string, number> = {
      'WREI-C': 0.015,
      'WREI-ESC': 0.018,
      'VCM-SPOT': 0.025,
      'DMRV-SPOT': 0.022,
      'ESC-NSW': 0.035,
      'ESC-FWD': 0.020,
      'RWA-IDX': 0.012,
      'VEEC': 0.015,
      'ACCU': 0.018,
      'LGC': 0.022,
      'STC': 0.008,
      'PRC': 0.025,
      'WREI-ACO': 0.005,
    };

    const maxChange = volatilityMultipliers[ticker.symbol] || 0.02;

    const randomWalk = (Math.random() - 0.5) * 2 * maxChange;
    const meanReversion = ticker.changePercent * -0.1;
    const totalChange = randomWalk + meanReversion;

    const oldPrice = ticker.price;
    const newPrice = Math.max(0.01, ticker.price * (1 + totalChange));
    const change = newPrice - oldPrice;
    const changePercent = (change / oldPrice) * 100;

    const high24h = Math.max(ticker.high24h || newPrice, newPrice);
    const low24h = Math.min(ticker.low24h || newPrice, newPrice);

    const volumeChange = 1 + (Math.random() - 0.5) * 0.3;
    const volume = Math.floor((ticker.volume || 0) * volumeChange);

    return {
      ...ticker,
      price: Math.round(newPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      timestamp: new Date(),
      volume,
      high24h,
      low24h,
    };
  }

  /**
   * Ingest prices from the feed-manager API.
   * Updates matching tickers with live/cached data and records their tier.
   */
  public ingestFeedPrices(apiPrices: Array<{
    instrumentType: string;
    price: number;
    currency: string;
    tier: string;
  }>): void {
    for (const fp of apiPrices) {
      const symbol = INSTRUMENT_TO_TICKER[fp.instrumentType];
      if (!symbol) continue;

      const existing = this.tickers.get(symbol);
      if (!existing) continue;

      const oldPrice = existing.price;
      const newPrice = Math.round(fp.price * 100) / 100;
      const change = Math.round((newPrice - oldPrice) * 100) / 100;
      const changePercent = oldPrice > 0
        ? Math.round(((newPrice - oldPrice) / oldPrice) * 10000) / 100
        : 0;

      this.tickers.set(symbol, {
        ...existing,
        price: newPrice,
        change,
        changePercent,
        timestamp: new Date(),
        high24h: Math.max(existing.high24h || newPrice, newPrice),
        low24h: Math.min(existing.low24h || newPrice, newPrice),
        feedTier: fp.tier as TickerData['feedTier'],
      });
    }
  }

  /**
   * Fetch prices from the feed-manager API and merge them into tickers.
   * Falls back silently to local simulation on failure.
   */
  private async fetchLivePrices(): Promise<void> {
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) return;
      const data = await res.json();

      if (data.prices && Array.isArray(data.prices)) {
        this.ingestFeedPrices(data.prices);
      }
      if (data.health?.overall) {
        this._feedOverallStatus = data.health.overall;
      }
    } catch {
      // API unreachable — continue with local simulation
    }
  }

  private updateAllTickers(): void {
    const updatedTickers = new Map<string, TickerData>();

    this.tickers.forEach((ticker, symbol) => {
      updatedTickers.set(symbol, this.updateTickerPrice(ticker));
    });

    this.tickers = updatedTickers;
    this.lastUpdateTime = new Date();

    const tickerArray = Array.from(this.tickers.values());
    this.subscribers.forEach(callback => callback(tickerArray));
  }

  public subscribe(callback: (tickers: TickerData[]) => void): () => void {
    this.subscribers.add(callback);
    callback(Array.from(this.tickers.values()));

    return () => {
      this.subscribers.delete(callback);
    };
  }

  public startUpdates(intervalMs: number = 5000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Fetch live prices immediately and on a slower cadence (60s)
    this.fetchLivePrices();
    const liveFetchInterval = setInterval(() => this.fetchLivePrices(), 60_000);

    this.updateInterval = setInterval(() => {
      this.updateAllTickers();
    }, intervalMs);

    // Store live fetch interval for cleanup
    const origStop = this.stopUpdates.bind(this);
    this.stopUpdates = () => {
      clearInterval(liveFetchInterval);
      origStop();
    };
  }

  public stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public getCurrentTickers(): TickerData[] {
    return Array.from(this.tickers.values());
  }

  public getTicker(symbol: string): TickerData | undefined {
    return this.tickers.get(symbol);
  }

  public get feedOverallStatus(): FeedOverallStatus {
    return this._feedOverallStatus;
  }

  public getMarketStatus(): MarketStatus {
    const isOpen = true;
    const nextChange = isOpen ? "Market operates 24/7" : "Opens 9:00 AM AEST";

    return {
      isOpen,
      nextChange,
      timezone: 'AEST',
      lastUpdate: this.lastUpdateTime,
    };
  }
}

// Singleton instance
export const marketSimulator = new MarketSimulator();

// Convenience hooks for React components
export function useMarketData(autoStart: boolean = true): {
  tickers: TickerData[];
  marketStatus: MarketStatus;
  isConnected: boolean;
} {
  const [tickers, setTickers] = React.useState<TickerData[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    setIsConnected(true);

    const unsubscribe = marketSimulator.subscribe((newTickers) => {
      setTickers(newTickers);
    });

    if (autoStart) {
      marketSimulator.startUpdates(5000); // 5 second updates
    }

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [autoStart]);

  return {
    tickers,
    marketStatus: marketSimulator.getMarketStatus(),
    isConnected,
  };
}

// Export types and utilities
export {
  marketSimulator as default,
  MarketSimulator,
};