/**
 * GET /api/v1/intelligence/metrics
 *
 * Returns the latest derived market metrics for ESC instruments.
 * Query params:
 *   ?instrument=ESC  — filter by instrument type (default: all)
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import {
  getLatestMetrics,
  getHistoricalPrices,
} from '@/lib/market-intelligence/data-ingestion';

const VALID_INSTRUMENTS = ['ESC', 'VEEC', 'LGC', 'ACCU', 'STC', 'PRC'];

async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instrument = searchParams.get('instrument');
  const days = parseInt(searchParams.get('days') ?? '90', 10);

  // Validate instrument parameter if provided
  if (instrument && !VALID_INSTRUMENTS.includes(instrument.toUpperCase())) {
    return apiError(
      'validation_error',
      `Invalid instrument. Must be one of: ${VALID_INSTRUMENTS.join(', ')}`,
      400
    );
  }

  if (instrument) {
    // Single instrument — return metrics + recent prices
    const type = instrument.toUpperCase();
    const [metrics, prices] = await Promise.all([
      getLatestMetrics(type),
      getHistoricalPrices(type, Math.min(days, 365)),
    ]);

    return apiSuccess({
      instrument: type,
      metrics,
      recentPrices: prices.slice(-30), // Last 30 data points
      priceCount: prices.length,
    });
  }

  // All instruments — return latest metrics for each
  const allMetrics = await Promise.all(
    VALID_INSTRUMENTS.map(async (type) => {
      const metrics = await getLatestMetrics(type);
      return { instrument: type, metrics };
    })
  );

  // Filter to instruments that have data
  const withData = allMetrics.filter(m => m.metrics !== null);

  return apiSuccess({
    instruments: withData,
    total: withData.length,
  });
}

export const GET = withAuth(handleGet);
