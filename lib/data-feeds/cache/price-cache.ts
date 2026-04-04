/**
 * Price Cache — in-memory + Vercel Postgres persistence
 *
 * Stores price observations from all feed adapters. Provides:
 *  - Write: persist prices to in-memory cache (+ DB when available)
 *  - Read: retrieve price history with configurable lookback
 *  - Feed health: track per-feed success/failure in feed_status table
 *  - Three-tier fallback: live -> cached -> simulated
 *
 * DB operations are fire-and-forget — the platform works without Postgres.
 */

import type { InstrumentType } from '@/lib/trading/instruments/types';
import type { ScrapedPrice, PriceTier, ResolvedPrice, HistoricalPrice, FeedHealth } from '../adapters/types';

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  price: ScrapedPrice;
  tier: PriceTier;
}

/** In-memory price cache — Map<InstrumentType, latest CacheEntry> */
const latestPrices = new Map<InstrumentType, CacheEntry>();

/** In-memory history — Map<InstrumentType, CacheEntry[]> (newest first) */
const priceHistory = new Map<InstrumentType, CacheEntry[]>();

/** In-memory feed health */
const feedHealthMap = new Map<string, FeedHealth>();

const MAX_HISTORY_PER_INSTRUMENT = 1_000;

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

/** Store a batch of scraped prices */
export function cachePrices(prices: ScrapedPrice[], tier: PriceTier): void {
  for (const price of prices) {
    const entry: CacheEntry = { price, tier };

    // Update latest
    latestPrices.set(price.instrumentType, entry);

    // Append to history
    const history = priceHistory.get(price.instrumentType) ?? [];
    history.unshift(entry); // newest first
    if (history.length > MAX_HISTORY_PER_INSTRUMENT) {
      history.length = MAX_HISTORY_PER_INSTRUMENT;
    }
    priceHistory.set(price.instrumentType, history);
  }

  // Fire-and-forget DB persistence
  persistToDb(prices).catch(() => {});
}

/** Persist prices to Vercel Postgres (best-effort) */
async function persistToDb(prices: ScrapedPrice[]): Promise<void> {
  try {
    const { sql } = await import('@/lib/db/connection');
    for (const p of prices) {
      await sql`
        INSERT INTO price_history (instrument_id, price, source, recorded_at)
        SELECT i.id, ${p.price}, ${p.source}, ${p.timestamp}::timestamptz
        FROM instruments i
        WHERE i.symbol = ${p.instrumentType}
        LIMIT 1
      `;
    }
  } catch {
    // DB not available — this is expected in local dev and demo mode
  }
}

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

/** Get the latest cached price for an instrument */
export function getLatestPrice(instrumentType: InstrumentType): ResolvedPrice | null {
  const entry = latestPrices.get(instrumentType);
  if (!entry) return null;

  const ageMs = Date.now() - new Date(entry.price.timestamp).getTime();

  return {
    instrumentType: entry.price.instrumentType,
    price: entry.price.price,
    currency: entry.price.currency,
    tier: entry.tier,
    source: entry.price.source,
    timestamp: entry.price.timestamp,
    age: Math.floor(ageMs / 1000),
  };
}

/** Get price history for charts */
export function getCachedHistory(
  instrumentType: InstrumentType,
  days: number = 30
): HistoricalPrice[] {
  const history = priceHistory.get(instrumentType);
  if (!history || history.length === 0) return [];

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  return history
    .filter(e => new Date(e.price.timestamp).getTime() >= cutoff)
    .map(e => ({
      timestamp: e.price.timestamp,
      price: e.price.price,
    }))
    .reverse(); // oldest first for charts
}

// ---------------------------------------------------------------------------
// Feed health tracking
// ---------------------------------------------------------------------------

/** Record a successful fetch for a feed */
export function recordFeedSuccess(feedName: string): void {
  const existing = feedHealthMap.get(feedName);
  const health: FeedHealth = {
    feedName,
    status: 'healthy',
    lastSuccessAt: new Date().toISOString(),
    consecutiveFailures: 0,
  };
  feedHealthMap.set(feedName, health);

  // Fire-and-forget DB update
  updateFeedStatusDb(health).catch(() => {});
}

/** Record a failed fetch for a feed */
export function recordFeedFailure(feedName: string, message?: string): void {
  const existing = feedHealthMap.get(feedName);
  const failures = (existing?.consecutiveFailures ?? 0) + 1;
  const health: FeedHealth = {
    feedName,
    status: failures >= 3 ? 'down' : 'degraded',
    lastSuccessAt: existing?.lastSuccessAt ?? null,
    consecutiveFailures: failures,
    message,
  };
  feedHealthMap.set(feedName, health);

  updateFeedStatusDb(health).catch(() => {});
}

/** Get health status for a specific feed */
export function getFeedHealth(feedName: string): FeedHealth {
  return feedHealthMap.get(feedName) ?? {
    feedName,
    status: 'unknown',
    lastSuccessAt: null,
    consecutiveFailures: 0,
  };
}

/** Get health status for all tracked feeds */
export function getAllFeedHealth(): FeedHealth[] {
  return Array.from(feedHealthMap.values());
}

/** Persist feed status to DB (best-effort) */
async function updateFeedStatusDb(health: FeedHealth): Promise<void> {
  try {
    const { sql } = await import('@/lib/db/connection');
    await sql`
      INSERT INTO feed_status (feed_name, status, last_success_at, error_message, updated_at)
      VALUES (
        ${health.feedName},
        ${health.status},
        ${health.lastSuccessAt}::timestamptz,
        ${health.message ?? null},
        now()
      )
      ON CONFLICT (feed_name) DO UPDATE SET
        status = EXCLUDED.status,
        last_success_at = EXCLUDED.last_success_at,
        error_message = EXCLUDED.error_message,
        updated_at = now()
    `;
  } catch {
    // DB not available
  }
}

// ---------------------------------------------------------------------------
// Three-tier resolution helpers
// ---------------------------------------------------------------------------

/** Check if a cached price is still considered "live" (< 24 hours old) */
export function isLive(resolved: ResolvedPrice): boolean {
  return resolved.tier === 'live' && resolved.age < 24 * 60 * 60;
}

/** Check if a cached price is stale but usable */
export function isCached(resolved: ResolvedPrice): boolean {
  return resolved.tier === 'live' && resolved.age >= 24 * 60 * 60;
}

/** Clear all in-memory caches (for testing) */
export function clearCache(): void {
  latestPrices.clear();
  priceHistory.clear();
  feedHealthMap.clear();
}
