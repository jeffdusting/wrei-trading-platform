/**
 * GET /api/v1/market/instruments
 *
 * List all tradeable instruments with current configuration.
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { apiSuccess } from '@/lib/api/response';
import {
  getAllInstrumentTypes,
  getRegistryEntry,
} from '@/lib/trading/instruments/instrument-registry';
import { resolveInstrumentPricing } from '@/lib/trading/instruments/pricing-engine';

async function handleGet(_request: NextRequest) {
  const instruments = getAllInstrumentTypes().map(type => {
    const entry = getRegistryEntry(type);
    const resolved = resolveInstrumentPricing(type);
    const defaults = entry.instrumentDefaults;

    return {
      instrumentType: type,
      category: entry.category,
      displayName: defaults.displayName ?? type,
      ticker: defaults.ticker ?? type,
      currency: resolved.currency,
      unitOfMeasure: resolved.unitOfMeasure,
      currentSpot: resolved.currentSpot,
      anchorPrice: resolved.anchorPrice,
      priceFloor: resolved.priceFloor,
      priceCeiling: resolved.priceCeiling,
      negotiationStyle: entry.negotiationStyle,
      keyConsiderations: entry.keyConsiderations,
      jurisdictions: defaults.jurisdictions ?? [],
      regulatoryClassification: defaults.regulatoryClassification ?? 'not_financial_product',
    };
  });

  return apiSuccess(instruments);
}

export const GET = withAuth(handleGet);
