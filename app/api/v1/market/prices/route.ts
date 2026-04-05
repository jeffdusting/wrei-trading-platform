/**
 * GET /api/v1/market/prices
 *
 * Current prices for all instruments, or filtered by ?instrument=ESC.
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateInstrumentType } from '@/lib/api/validation';
import {
  getAllInstrumentTypes,
  getRegistryEntry,
} from '@/lib/trading/instruments/instrument-registry';
import { resolveInstrumentPricing } from '@/lib/trading/instruments/pricing-engine';
import type { InstrumentType } from '@/lib/trading/instruments/types';

function buildPriceEntry(type: InstrumentType) {
  const entry = getRegistryEntry(type);
  const resolved = resolveInstrumentPricing(type);
  return {
    instrument: type,
    category: entry.category,
    displayName: entry.instrumentDefaults.displayName ?? type,
    price: resolved.currentSpot,
    anchorPrice: resolved.anchorPrice,
    priceFloor: resolved.priceFloor,
    priceCeiling: resolved.priceCeiling,
    currency: resolved.currency,
    unitOfMeasure: resolved.unitOfMeasure,
    source: entry.pricing.spotPriceSource,
    updatedAt: new Date().toISOString(),
  };
}

async function handleGet(request: NextRequest) {
  const instrument = request.nextUrl.searchParams.get('instrument');

  if (instrument) {
    const check = validateInstrumentType(instrument);
    if (!check.valid) {
      return apiError('validation_error', check.error.message, 400);
    }
    return apiSuccess([buildPriceEntry(check.type)]);
  }

  const allTypes = getAllInstrumentTypes();
  const prices = allTypes.map(buildPriceEntry);
  return apiSuccess(prices);
}

export const GET = withAuth(handleGet);
