// =============================================================================
// WREI Platform — Per-Instrument Pricing Engine
// Replaces the generic pricing logic with instrument-aware calculations.
// Accepts an InstrumentType, returns fully resolved pricing parameters
// for the negotiation engine to enforce.
// =============================================================================

import {
  InstrumentType,
  InstrumentPricingConfig,
  VolumeDiscountThreshold,
} from './types';
import { getPricingConfig, getRegistryEntry } from './instrument-registry';

// ---------------------------------------------------------------------------
// Resolved Pricing — what the negotiation engine actually uses
// ---------------------------------------------------------------------------

export interface ResolvedPricing {
  instrumentType: InstrumentType;

  // Calculated prices
  anchorPrice: number;
  priceFloor: number;
  priceCeiling: number;
  currentSpot: number;

  // Negotiation constraints
  maxConcessionPerRound: number;
  maxTotalConcession: number;
  minRoundsBeforeConcession: number;

  // Volume discount (if applicable)
  volumeDiscount: number;          // Percentage discount applied
  effectiveAnchor: number;         // Anchor after volume discount

  // Display
  currency: 'AUD' | 'USD';
  unitOfMeasure: string;

  // Metadata for agent context
  negotiationStyle: string;
  keyConsiderations: string[];
}

// ---------------------------------------------------------------------------
// Configuration — shared negotiation parameters
// Imported from existing negotiation-config.ts values
// ---------------------------------------------------------------------------

const DEFAULT_MIN_ROUNDS_BEFORE_CONCESSION = 3;

// ---------------------------------------------------------------------------
// Core Pricing Functions
// ---------------------------------------------------------------------------

/**
 * Calculate the anchor price based on the instrument's pricing method.
 *
 * - 'spot': anchor = current spot price
 * - 'fixed': anchor = configured fixed price
 * - 'premium_over_spot': anchor = spot × premium multiplier
 */
function calculateAnchor(
  config: InstrumentPricingConfig,
  currentSpot: number,
): number {
  switch (config.anchorMethod) {
    case 'spot':
      return currentSpot;
    case 'fixed':
      return config.anchorPrice;
    case 'premium_over_spot':
      return Math.round(currentSpot * (config.premiumMultiplier ?? 1) * 100) / 100;
  }
}

/**
 * Enforce price floor and ceiling on a given price.
 * Returns the clamped value.
 */
export function clampPrice(
  price: number,
  floor: number,
  ceiling: number,
): number {
  return Math.max(floor, Math.min(ceiling, price));
}

/**
 * Find the applicable volume discount for a given quantity.
 * Returns the discount percentage (e.g. 2.5 for 2.5%).
 * Thresholds are cumulative — the highest qualifying tier applies.
 */
export function getVolumeDiscount(
  thresholds: VolumeDiscountThreshold[],
  quantity: number,
): number {
  if (thresholds.length === 0) return 0;

  // Sort descending by quantity to find the highest qualifying tier
  const sorted = [...thresholds].sort((a, b) => b.quantity - a.quantity);
  for (const tier of sorted) {
    if (quantity >= tier.quantity) {
      return tier.discountPct;
    }
  }
  return 0;
}

/**
 * Apply a percentage discount to a price.
 */
function applyDiscount(price: number, discountPct: number): number {
  return Math.round(price * (1 - discountPct / 100) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Main Engine Function
// ---------------------------------------------------------------------------

/**
 * Resolve full pricing for an instrument type.
 *
 * @param instrumentType - The instrument to price
 * @param currentSpot    - Current spot/reference price (falls back to config fallback)
 * @param quantity       - Trade quantity for volume discount calculation
 * @returns Fully resolved pricing parameters for the negotiation engine
 */
export function resolveInstrumentPricing(
  instrumentType: InstrumentType,
  currentSpot?: number,
  quantity?: number,
): ResolvedPricing {
  const config = getPricingConfig(instrumentType);
  const entry = getRegistryEntry(instrumentType);

  // Use provided spot or fall back to configured fallback price
  const spot = currentSpot ?? config.fallbackPrice;

  // Calculate anchor based on pricing method
  const rawAnchor = calculateAnchor(config, spot);

  // Clamp anchor within floor/ceiling
  const anchorPrice = clampPrice(rawAnchor, config.priceFloor, config.priceCeiling);

  // Apply volume discount if quantity provided
  const volumeDiscount = quantity
    ? getVolumeDiscount(config.volumeDiscountThresholds, quantity)
    : 0;
  const effectiveAnchor = volumeDiscount > 0
    ? applyDiscount(anchorPrice, volumeDiscount)
    : anchorPrice;

  // Ensure effective anchor doesn't breach the floor
  const clampedEffectiveAnchor = Math.max(effectiveAnchor, config.priceFloor);

  return {
    instrumentType,
    anchorPrice,
    priceFloor: config.priceFloor,
    priceCeiling: config.priceCeiling,
    currentSpot: spot,
    maxConcessionPerRound: config.maxConcessionPerRound,
    maxTotalConcession: config.maxTotalConcession,
    minRoundsBeforeConcession: DEFAULT_MIN_ROUNDS_BEFORE_CONCESSION,
    volumeDiscount,
    effectiveAnchor: clampedEffectiveAnchor,
    currency: config.currency,
    unitOfMeasure: config.unitOfMeasure,
    negotiationStyle: entry.negotiationStyle,
    keyConsiderations: entry.keyConsiderations,
  };
}

// ---------------------------------------------------------------------------
// Convenience Functions
// ---------------------------------------------------------------------------

/**
 * Calculate the minimum acceptable price for a negotiation.
 * This is the anchor minus the maximum total concession, floored at priceFloor.
 */
export function getMinAcceptablePrice(resolved: ResolvedPricing): number {
  const minFromConcession = resolved.effectiveAnchor * (1 - resolved.maxTotalConcession);
  return Math.max(
    Math.round(minFromConcession * 100) / 100,
    resolved.priceFloor,
  );
}

/**
 * Calculate the maximum concession amount for the current round.
 */
export function getMaxRoundConcession(
  resolved: ResolvedPricing,
  currentPrice: number,
): number {
  return Math.round(currentPrice * resolved.maxConcessionPerRound * 100) / 100;
}

/**
 * Validate that a proposed price is within acceptable bounds.
 * Returns true if the price is at or above the minimum acceptable price.
 */
export function isPriceAcceptable(
  resolved: ResolvedPricing,
  proposedPrice: number,
): boolean {
  return proposedPrice >= getMinAcceptablePrice(resolved);
}

/**
 * Calculate remaining concession headroom from the current price.
 * Returns the amount (in currency) that can still be conceded.
 */
export function getRemainingConcessionRoom(
  resolved: ResolvedPricing,
  currentPrice: number,
): number {
  const minAcceptable = getMinAcceptablePrice(resolved);
  return Math.max(0, Math.round((currentPrice - minAcceptable) * 100) / 100);
}
