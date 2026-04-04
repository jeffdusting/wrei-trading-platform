/**
 * Simulation Engine — realistic price generation for demo and fallback
 *
 * Generates current prices and 30-day historical data using a bounded
 * random walk with instrument-specific parameters from the pricing config.
 * Used when scrapers fail or for instruments without live sources
 * (WREI_CC, WREI_ACO).
 */

import type { InstrumentType } from '@/lib/trading/instruments/types';
import type { ScrapedPrice, HistoricalPrice } from './types';

const SOURCE_NAME = 'simulation';

/** Per-instrument simulation parameters */
interface SimParams {
  spot: number;         // Reference spot price
  volatility: number;   // Daily volatility as fraction (e.g. 0.015 = 1.5%)
  trend: number;        // Daily trend bias as fraction (e.g. 0.0002 = slight upward)
  floor: number;        // Hard price floor
  ceiling: number;      // Hard price ceiling
  currency: 'AUD' | 'USD';
}

const PARAMS: Record<InstrumentType, SimParams> = {
  ESC:      { spot: 23.00,    volatility: 0.020, trend:  0.0002, floor: 18.00,   ceiling: 29.48,    currency: 'AUD' },
  VEEC:     { spot: 83.50,    volatility: 0.015, trend:  0.0001, floor: 60.00,   ceiling: 120.00,   currency: 'AUD' },
  PRC:      { spot: 2.85,     volatility: 0.025, trend:  0.0003, floor: 2.00,    ceiling: 5.00,     currency: 'AUD' },
  ACCU:     { spot: 35.00,    volatility: 0.018, trend:  0.0001, floor: 20.00,   ceiling: 75.00,    currency: 'AUD' },
  LGC:      { spot: 5.25,     volatility: 0.022, trend: -0.0001, floor: 2.00,    ceiling: 15.00,    currency: 'AUD' },
  STC:      { spot: 39.50,    volatility: 0.008, trend:  0.0000, floor: 35.00,   ceiling: 40.00,    currency: 'AUD' },
  WREI_CC:  { spot: 22.80,    volatility: 0.015, trend:  0.0003, floor: 12.00,   ceiling: 45.00,    currency: 'USD' },
  WREI_ACO: { spot: 1000.00,  volatility: 0.005, trend:  0.0001, floor: 900.00,  ceiling: 1200.00,  currency: 'AUD' },
};

/** Seeded pseudo-random for reproducible historical data */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Round to 2 decimal places */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Generate a single simulated current price for an instrument.
 * Applies a small random perturbation from the reference spot.
 */
export function simulateCurrentPrice(instrumentType: InstrumentType): ScrapedPrice {
  const p = PARAMS[instrumentType];
  const perturbation = (Math.random() - 0.5) * 2 * p.volatility;
  const price = clamp(p.spot * (1 + perturbation), p.floor, p.ceiling);

  return {
    instrumentType,
    price: round2(price),
    currency: p.currency,
    source: SOURCE_NAME,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate simulated current prices for all instruments.
 */
export function simulateAllPrices(): ScrapedPrice[] {
  return (Object.keys(PARAMS) as InstrumentType[]).map(simulateCurrentPrice);
}

/**
 * Generate 30 days of historical price data for chart display.
 *
 * Uses a bounded random walk starting from the reference spot.
 * Mean-reverts toward spot to keep prices realistic.
 * Generates one data point per day.
 *
 * @param instrumentType - The instrument to generate history for
 * @param days - Number of days of history (default 30)
 * @param pointsPerDay - Intraday data points per day (default 1)
 */
export function generatePriceHistory(
  instrumentType: InstrumentType,
  days: number = 30,
  pointsPerDay: number = 1,
): HistoricalPrice[] {
  const p = PARAMS[instrumentType];
  // Seed from instrument type hash for reproducible results
  const seed = instrumentType.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 1000 + days;
  const rand = seededRandom(seed);

  const totalPoints = days * pointsPerDay;
  const intervalMs = (days * 24 * 60 * 60 * 1000) / totalPoints;
  const now = Date.now();
  const startTime = now - days * 24 * 60 * 60 * 1000;

  const history: HistoricalPrice[] = [];
  let price = p.spot * (0.95 + rand() * 0.10); // Start within 5% of spot

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(startTime + i * intervalMs).toISOString();

    // Random walk with mean reversion toward spot
    const randomComponent = (rand() - 0.5) * 2 * p.volatility;
    const meanReversion = ((p.spot - price) / p.spot) * 0.05;
    const trendComponent = p.trend;

    price = price * (1 + randomComponent + meanReversion + trendComponent);
    price = clamp(price, p.floor, p.ceiling);

    history.push({
      timestamp,
      price: round2(price),
    });
  }

  return history;
}

/**
 * Generate intraday price movements (24 hours, 5-minute intervals).
 */
export function generateIntradayHistory(instrumentType: InstrumentType): HistoricalPrice[] {
  return generatePriceHistory(instrumentType, 1, 288); // 288 = 24h * 60min / 5min
}

export function getSimulationParams(instrumentType: InstrumentType): SimParams {
  return PARAMS[instrumentType];
}

export { SOURCE_NAME, PARAMS };
