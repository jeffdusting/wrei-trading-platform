/**
 * WREI Market Data Ticker - Simulated Real-Time Updates
 *
 * Provides realistic market data simulation based on PRICING_INDEX values
 * for carbon credits, ESCs, and related market instruments.
 * In production, this would connect to real market data feeds.
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
}

export interface MarketStatus {
  isOpen: boolean;
  nextChange: string;
  timezone: string;
  lastUpdate: Date;
}

// Base ticker definitions with current market values
const BASE_TICKERS: Omit<TickerData, 'change' | 'changePercent' | 'timestamp'>[] = [
  {
    symbol: 'WREI-C',
    name: 'WREI Carbon Credits',
    price: 28.12, // WREI premium carbon price (1.85x dMRV)
    currency: 'USD',
  },
  {
    symbol: 'WREI-ESC',
    name: 'WREI ESC Credits',
    price: 54.97, // WREI premium ESC price (1.15x spot)
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
    price: 142.85, // Composite infrastructure pricing index
    currency: 'USD',
  },
];

// Market simulation state
class MarketSimulator {
  private tickers: Map<string, TickerData> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(tickers: TickerData[]) => void> = new Set();
  private lastUpdateTime: Date = new Date();

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
    // Generate realistic volume numbers based on symbol type
    const baseVolumes = {
      'WREI-C': 15000,
      'WREI-ESC': 45000,
      'VCM-SPOT': 125000,
      'DMRV-SPOT': 85000,
      'ESC-NSW': 95000,
      'ESC-FWD': 35000,
      'RWA-IDX': 25000,
    };

    const base = baseVolumes[symbol as keyof typeof baseVolumes] || 10000;
    return Math.floor(base * (0.7 + Math.random() * 0.6)); // ±30% variation
  }

  private updateTickerPrice(ticker: TickerData): TickerData {
    const volatilityMultipliers = {
      'WREI-C': 0.015,    // 1.5% max change - premium product, less volatile
      'WREI-ESC': 0.018,  // 1.8% max change
      'VCM-SPOT': 0.025,  // 2.5% max change - more volatile spot market
      'DMRV-SPOT': 0.022, // 2.2% max change
      'ESC-NSW': 0.035,   // 3.5% max change - regulatory market volatility
      'ESC-FWD': 0.020,   // 2.0% max change - forward contracts more stable
      'RWA-IDX': 0.012,   // 1.2% max change - infrastructure index more stable
    };

    const maxChange = volatilityMultipliers[ticker.symbol as keyof typeof volatilityMultipliers] || 0.02;

    // Generate realistic price movement (slightly mean reverting)
    const randomWalk = (Math.random() - 0.5) * 2 * maxChange;
    const meanReversion = ticker.changePercent * -0.1; // 10% mean reversion
    const totalChange = randomWalk + meanReversion;

    const oldPrice = ticker.price;
    const newPrice = Math.max(0.01, ticker.price * (1 + totalChange));
    const change = newPrice - oldPrice;
    const changePercent = (change / oldPrice) * 100;

    // Update 24h high/low
    const high24h = Math.max(ticker.high24h || newPrice, newPrice);
    const low24h = Math.min(ticker.low24h || newPrice, newPrice);

    // Update volume (simulate trading activity)
    const volumeChange = 1 + (Math.random() - 0.5) * 0.3; // ±15% volume change
    const volume = Math.floor((ticker.volume || 0) * volumeChange);

    return {
      ...ticker,
      price: Math.round(newPrice * 100) / 100, // 2 decimal places
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      timestamp: new Date(),
      volume,
      high24h,
      low24h,
    };
  }

  private updateAllTickers(): void {
    const updatedTickers = new Map<string, TickerData>();

    this.tickers.forEach((ticker, symbol) => {
      updatedTickers.set(symbol, this.updateTickerPrice(ticker));
    });

    this.tickers = updatedTickers;
    this.lastUpdateTime = new Date();

    // Notify all subscribers
    const tickerArray = Array.from(this.tickers.values());
    this.subscribers.forEach(callback => callback(tickerArray));
  }

  public subscribe(callback: (tickers: TickerData[]) => void): () => void {
    this.subscribers.add(callback);

    // Immediately send current data
    callback(Array.from(this.tickers.values()));

    return () => {
      this.subscribers.delete(callback);
    };
  }

  public startUpdates(intervalMs: number = 5000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateAllTickers();
    }, intervalMs);
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

  public getMarketStatus(): MarketStatus {
    // Simulate market hours (24/7 for carbon markets, but show status)
    const now = new Date();
    const hour = now.getHours();

    // Simulated: Carbon markets trade 24/7, but ESC markets have business hours
    const isOpen = true; // Carbon markets always open
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