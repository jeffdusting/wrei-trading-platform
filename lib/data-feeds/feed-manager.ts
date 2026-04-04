/**
 * Feed Manager — orchestrates all price feed adapters
 *
 * Implements the WP6 §3.6 circuit breaker pattern per adapter.
 * Provides single-function access to the best available price
 * with three-tier fallback: live -> cached -> simulated.
 *
 * Exports:
 *  - getPrice(instrumentType)   — best available price with source attribution
 *  - getPriceHistory(type, days) — historical data for charts
 *  - getHealthStatus()          — feed health for Bloomberg status bar
 *  - refreshAllPrices()         — trigger a full refresh cycle
 */

import type { InstrumentType } from '@/lib/trading/instruments/types';
import type { ScrapeResult, ResolvedPrice, HistoricalPrice, FeedHealth, PriceTier } from './adapters/types';
import { scrapeEcovantage, SOURCE_NAME as ECOVANTAGE } from './adapters/ecovantage-scraper';
import { scrapeNorthmoreGordon, SOURCE_NAME as NORTHMORE } from './adapters/northmore-scraper';
import { simulateCurrentPrice, simulateAllPrices, generatePriceHistory } from './adapters/simulation-engine';
import {
  cachePrices,
  getLatestPrice,
  getCachedHistory,
  recordFeedSuccess,
  recordFeedFailure,
  getAllFeedHealth,
  getFeedHealth,
} from './cache/price-cache';

// ---------------------------------------------------------------------------
// Circuit breaker (WP6 §3.6)
// ---------------------------------------------------------------------------

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreaker {
  state: CircuitState;
  failures: number;
  lastFailure: number;     // epoch ms
  lastSuccess: number;     // epoch ms
}

const FAILURE_THRESHOLD = 3;
const OPEN_TIMEOUT_MS = 60_000; // 60 seconds before half-open

const breakers = new Map<string, CircuitBreaker>();

function getBreaker(name: string): CircuitBreaker {
  if (!breakers.has(name)) {
    breakers.set(name, {
      state: 'closed',
      failures: 0,
      lastFailure: 0,
      lastSuccess: 0,
    });
  }
  return breakers.get(name)!;
}

function shouldAttempt(name: string): boolean {
  const b = getBreaker(name);
  if (b.state === 'closed') return true;
  if (b.state === 'open') {
    // Check if timeout has elapsed -> transition to half-open
    if (Date.now() - b.lastFailure >= OPEN_TIMEOUT_MS) {
      b.state = 'half-open';
      return true;
    }
    return false;
  }
  // half-open: allow one attempt
  return true;
}

function recordSuccess(name: string): void {
  const b = getBreaker(name);
  b.state = 'closed';
  b.failures = 0;
  b.lastSuccess = Date.now();
  recordFeedSuccess(name);
}

function recordFailure(name: string, message?: string): void {
  const b = getBreaker(name);
  b.failures++;
  b.lastFailure = Date.now();
  if (b.failures >= FAILURE_THRESHOLD) {
    b.state = 'open';
  }
  recordFeedFailure(name, message);
}

// ---------------------------------------------------------------------------
// Adapter execution with circuit breaker
// ---------------------------------------------------------------------------

async function runAdapter(
  name: string,
  fn: () => Promise<ScrapeResult>
): Promise<ScrapeResult> {
  if (!shouldAttempt(name)) return null;

  try {
    const result = await fn();
    if (result && result.length > 0) {
      recordSuccess(name);
      return result;
    }
    recordFailure(name, 'Empty result');
    return null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    recordFailure(name, message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Last full refresh timestamp */
let lastRefresh = 0;

/**
 * Refresh prices from all live adapters. Called automatically when
 * getPrice() detects stale data, or can be called manually.
 */
export async function refreshAllPrices(): Promise<void> {
  // Try Ecovantage first (primary source)
  const ecoResult = await runAdapter(ECOVANTAGE, scrapeEcovantage);
  if (ecoResult) {
    cachePrices(ecoResult, 'live');
  }

  // Try Northmore Gordon (secondary/validation)
  const northResult = await runAdapter(NORTHMORE, scrapeNorthmoreGordon);
  if (northResult) {
    // Only cache Northmore prices for instruments not already covered by Ecovantage
    const ecoCovered = new Set(ecoResult?.map(p => p.instrumentType) ?? []);
    const newPrices = northResult.filter(p => !ecoCovered.has(p.instrumentType));
    if (newPrices.length > 0) {
      cachePrices(newPrices, 'live');
    }
  }

  // Generate simulated prices for any instruments still missing
  const allTypes: InstrumentType[] = ['ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI_CC', 'WREI_ACO'];
  const simPrices = allTypes
    .filter(t => !getLatestPrice(t) || getLatestPrice(t)!.tier === 'simulated')
    .map(t => simulateCurrentPrice(t));

  if (simPrices.length > 0) {
    cachePrices(simPrices, 'simulated');
  }

  lastRefresh = Date.now();
}

/** Minimum interval between auto-refreshes (5 minutes) */
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Get the best available price for an instrument.
 *
 * Three-tier fallback:
 *  1. Live — scraped within last 24 hours
 *  2. Cached — scraped but older than 24 hours
 *  3. Simulated — generated from instrument parameters
 *
 * Auto-triggers a refresh if data is stale.
 */
export async function getPrice(instrumentType: InstrumentType): Promise<ResolvedPrice> {
  // Auto-refresh if stale
  if (Date.now() - lastRefresh > AUTO_REFRESH_INTERVAL_MS) {
    await refreshAllPrices();
  }

  const cached = getLatestPrice(instrumentType);
  if (cached) {
    // Determine effective tier based on age
    const LIVE_THRESHOLD_S = 24 * 60 * 60; // 24 hours
    if (cached.tier === 'live' && cached.age < LIVE_THRESHOLD_S) {
      return cached; // Tier 1: live
    }
    if (cached.tier === 'live') {
      return { ...cached, tier: 'cached' as PriceTier }; // Tier 2: stale but real
    }
    return cached; // Tier 3: simulated
  }

  // Nothing cached at all — generate simulation
  const sim = simulateCurrentPrice(instrumentType);
  cachePrices([sim], 'simulated');
  return getLatestPrice(instrumentType)!;
}

/**
 * Get price history for chart display.
 *
 * Returns cached history if available, otherwise generates
 * simulated history from the simulation engine.
 */
export async function getPriceHistory(
  instrumentType: InstrumentType,
  days: number = 30
): Promise<HistoricalPrice[]> {
  const cached = getCachedHistory(instrumentType, days);
  if (cached.length >= 10) {
    return cached;
  }
  // Fall back to simulated history
  return generatePriceHistory(instrumentType, days);
}

/**
 * Get health status for all feeds. Used by the Bloomberg Terminal
 * status bar to display live/cached/simulated indicators.
 */
export function getHealthStatus(): {
  feeds: FeedHealth[];
  overall: 'live' | 'cached' | 'simulated';
  lastRefresh: string | null;
} {
  const feeds = getAllFeedHealth();

  // Determine overall status
  const hasHealthy = feeds.some(f => f.status === 'healthy');
  const hasDegraded = feeds.some(f => f.status === 'degraded');

  let overall: 'live' | 'cached' | 'simulated';
  if (hasHealthy) {
    overall = 'live';
  } else if (hasDegraded) {
    overall = 'cached';
  } else {
    overall = 'simulated';
  }

  return {
    feeds,
    overall,
    lastRefresh: lastRefresh ? new Date(lastRefresh).toISOString() : null,
  };
}

/**
 * Get prices for all instruments in one call.
 * Used by the market ticker to populate all symbols.
 */
export async function getAllPrices(): Promise<ResolvedPrice[]> {
  const allTypes: InstrumentType[] = ['ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI_CC', 'WREI_ACO'];
  return Promise.all(allTypes.map(getPrice));
}
