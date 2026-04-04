/**
 * Shared types for all price feed adapters.
 *
 * Every adapter (scraper, API client, simulation engine) returns data
 * in the common ScrapedPrice format so the feed-manager can treat
 * them interchangeably.
 */

import type { InstrumentType } from '@/lib/trading/instruments/types';

/** A single price observation from any adapter */
export interface ScrapedPrice {
  instrumentType: InstrumentType;
  price: number;
  currency: 'AUD' | 'USD';
  source: string;          // e.g. 'ecovantage', 'northmore-gordon', 'simulation'
  timestamp: string;       // ISO 8601
}

/** Adapters return an array of prices on success, or null on failure */
export type ScrapeResult = ScrapedPrice[] | null;

/** Price tier used by the feed-manager to label provenance */
export type PriceTier = 'live' | 'cached' | 'simulated';

/** A resolved price with provenance metadata */
export interface ResolvedPrice {
  instrumentType: InstrumentType;
  price: number;
  currency: 'AUD' | 'USD';
  tier: PriceTier;
  source: string;
  timestamp: string;       // ISO 8601 — when the price was observed
  age: number;             // age in seconds since observation
}

/** Historical data point for chart display */
export interface HistoricalPrice {
  timestamp: string;       // ISO 8601
  price: number;
}

/** Feed health status for the Bloomberg status bar */
export interface FeedHealth {
  feedName: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastSuccessAt: string | null;
  consecutiveFailures: number;
  message?: string;
}
