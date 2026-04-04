// =============================================================================
// WREI Platform — Simulated Order Book
// Generates a realistic bid/ask order book for any instrument type.
// Uses the instrument's spot price as midpoint, with configurable spread
// width and volume distribution that thins at extremes.
// =============================================================================

import { InstrumentType } from '../instruments/types';
import { resolveInstrumentPricing } from '../instruments/pricing-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;       // Cumulative quantity up to this level
  orderCount: number;  // Number of orders at this level
}

export interface OrderBookSnapshot {
  instrumentType: InstrumentType;
  midPrice: number;
  spread: number;
  spreadPct: number;
  bids: OrderBookLevel[];  // Sorted descending by price (best bid first)
  asks: OrderBookLevel[];  // Sorted ascending by price (best ask first)
  lastUpdated: number;     // Unix timestamp ms
}

export interface OrderBookConfig {
  levels: number;           // Price levels per side (default 10)
  updateIntervalMs: number; // Refresh interval (default 5000)
  baseVolume: number;       // Base volume at best bid/ask
  volumeDecay: number;      // How fast volume thins (0-1, lower = faster)
}

// ---------------------------------------------------------------------------
// Per-instrument spread configuration
// Tight spreads for liquid, regulated markets; wider for OTC/blockchain
// ---------------------------------------------------------------------------

const SPREAD_CONFIG: Record<InstrumentType, { spreadAbs: number; baseVol: number; tick: number }> = {
  ESC:      { spreadAbs: 0.10,  baseVol: 5000,  tick: 0.01 },
  VEEC:     { spreadAbs: 0.25,  baseVol: 3000,  tick: 0.05 },
  PRC:      { spreadAbs: 0.05,  baseVol: 8000,  tick: 0.01 },
  ACCU:     { spreadAbs: 0.50,  baseVol: 2000,  tick: 0.05 },
  LGC:      { spreadAbs: 0.10,  baseVol: 10000, tick: 0.01 },
  STC:      { spreadAbs: 0.10,  baseVol: 8000,  tick: 0.05 },
  WREI_CC:  { spreadAbs: 1.00,  baseVol: 500,   tick: 0.10 },
  WREI_ACO: { spreadAbs: 2.00,  baseVol: 100,   tick: 0.50 },
};

// ---------------------------------------------------------------------------
// Deterministic seeded random (simple LCG for reproducible books)
// ---------------------------------------------------------------------------

function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ---------------------------------------------------------------------------
// Volume distribution — more volume near the spread, thinning at extremes
// Uses exponential decay: volume_at_level = baseVolume * decay^level
// ---------------------------------------------------------------------------

function generateVolumes(
  levels: number,
  baseVolume: number,
  decay: number,
  rng: () => number,
): number[] {
  const volumes: number[] = [];
  for (let i = 0; i < levels; i++) {
    const base = baseVolume * Math.pow(decay, i);
    // Add ±30% random perturbation
    const perturbed = Math.max(1, Math.round(base * (0.7 + rng() * 0.6)));
    volumes.push(perturbed);
  }
  return volumes;
}

// ---------------------------------------------------------------------------
// Generate a single snapshot
// ---------------------------------------------------------------------------

export function generateOrderBook(
  instrumentType: InstrumentType,
  spotOverride?: number,
  config?: Partial<OrderBookConfig>,
): OrderBookSnapshot {
  const resolved = resolveInstrumentPricing(instrumentType, spotOverride);
  const midPrice = resolved.currentSpot;
  const spread = SPREAD_CONFIG[instrumentType];
  const levels = config?.levels ?? 10;
  const baseVolume = config?.baseVolume ?? spread.baseVol;
  const decay = config?.volumeDecay ?? 0.72;

  const halfSpread = spread.spreadAbs / 2;
  const tick = spread.tick;
  const rng = createRng(Date.now() & 0xffff);

  // --- Bids (below mid) ---
  const bidVolumes = generateVolumes(levels, baseVolume, decay, rng);
  const bids: OrderBookLevel[] = [];
  let bidCumulative = 0;
  for (let i = 0; i < levels; i++) {
    const price = roundToTick(midPrice - halfSpread - i * tick, tick);
    if (price <= 0) break;
    bidCumulative += bidVolumes[i];
    bids.push({
      price,
      quantity: bidVolumes[i],
      total: bidCumulative,
      orderCount: Math.max(1, Math.floor(3 + rng() * 8)),
    });
  }

  // --- Asks (above mid) ---
  const askVolumes = generateVolumes(levels, baseVolume, decay, rng);
  const asks: OrderBookLevel[] = [];
  let askCumulative = 0;
  for (let i = 0; i < levels; i++) {
    const price = roundToTick(midPrice + halfSpread + i * tick, tick);
    askCumulative += askVolumes[i];
    asks.push({
      price,
      quantity: askVolumes[i],
      total: askCumulative,
      orderCount: Math.max(1, Math.floor(3 + rng() * 8)),
    });
  }

  const bestBid = bids[0]?.price ?? midPrice - halfSpread;
  const bestAsk = asks[0]?.price ?? midPrice + halfSpread;
  const actualSpread = roundToTick(bestAsk - bestBid, tick);

  return {
    instrumentType,
    midPrice,
    spread: actualSpread,
    spreadPct: midPrice > 0 ? Number(((actualSpread / midPrice) * 100).toFixed(3)) : 0,
    bids,
    asks,
    lastUpdated: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Perturbation — small random changes to an existing snapshot
// ---------------------------------------------------------------------------

export function perturbOrderBook(snapshot: OrderBookSnapshot): OrderBookSnapshot {
  const rng = createRng(Date.now() & 0xffff);
  const spread = SPREAD_CONFIG[snapshot.instrumentType];

  // Shift mid price slightly (±0.1% max)
  const drift = (rng() - 0.5) * 0.002 * snapshot.midPrice;
  const newMid = roundToTick(snapshot.midPrice + drift, spread.tick);

  // Perturb volumes (±15%)
  const perturbLevel = (level: OrderBookLevel): OrderBookLevel => ({
    ...level,
    quantity: Math.max(1, Math.round(level.quantity * (0.85 + rng() * 0.3))),
    orderCount: Math.max(1, level.orderCount + Math.floor(rng() * 3) - 1),
  });

  const halfSpread = spread.spreadAbs / 2;
  const tick = spread.tick;

  // Rebuild with new mid and perturbed volumes
  const bids = snapshot.bids.map((level, i) => {
    const perturbed = perturbLevel(level);
    return {
      ...perturbed,
      price: roundToTick(newMid - halfSpread - i * tick, tick),
    };
  });

  const asks = snapshot.asks.map((level, i) => {
    const perturbed = perturbLevel(level);
    return {
      ...perturbed,
      price: roundToTick(newMid + halfSpread + i * tick, tick),
    };
  });

  // Recalculate cumulative totals
  let bidCum = 0;
  for (const b of bids) { bidCum += b.quantity; b.total = bidCum; }
  let askCum = 0;
  for (const a of asks) { askCum += a.quantity; a.total = askCum; }

  const bestBid = bids[0]?.price ?? newMid - halfSpread;
  const bestAsk = asks[0]?.price ?? newMid + halfSpread;
  const actualSpread = roundToTick(bestAsk - bestBid, tick);

  return {
    ...snapshot,
    midPrice: newMid,
    spread: actualSpread,
    spreadPct: newMid > 0 ? Number(((actualSpread / newMid) * 100).toFixed(3)) : 0,
    bids,
    asks,
    lastUpdated: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function roundToTick(value: number, tick: number): number {
  return Math.round(value / tick) * tick;
}

/**
 * Returns the spread config for a given instrument (for display/testing).
 */
export function getSpreadConfig(instrumentType: InstrumentType) {
  return SPREAD_CONFIG[instrumentType];
}
