/**
 * GET /api/v1/market/orderbook?instrument=ESC
 *
 * Current order book for an instrument.
 * In the demo environment this returns simulated depth.
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateInstrumentType } from '@/lib/api/validation';
import { resolveInstrumentPricing } from '@/lib/trading/instruments/pricing-engine';

function generateOrderBookLevels(midPrice: number, levels: number, side: 'bid' | 'ask') {
  const entries = [];
  for (let i = 1; i <= levels; i++) {
    const offset = midPrice * 0.002 * i;
    const price = side === 'bid'
      ? Math.round((midPrice - offset) * 100) / 100
      : Math.round((midPrice + offset) * 100) / 100;
    const quantity = Math.round(500 + Math.random() * 4500);
    entries.push({ price, quantity, orders: Math.ceil(Math.random() * 5) });
  }
  return entries;
}

async function handleGet(request: NextRequest) {
  const instrument = request.nextUrl.searchParams.get('instrument');

  if (!instrument) {
    return apiError('validation_error', 'instrument query parameter is required', 400);
  }

  const check = validateInstrumentType(instrument);
  if (!check.valid) {
    return apiError('validation_error', check.error.message, 400);
  }

  const resolved = resolveInstrumentPricing(check.type);
  const mid = resolved.currentSpot;

  return apiSuccess({
    instrument: check.type,
    currency: resolved.currency,
    midPrice: mid,
    spread: Math.round(mid * 0.004 * 100) / 100,
    bids: generateOrderBookLevels(mid, 5, 'bid'),
    asks: generateOrderBookLevels(mid, 5, 'ask'),
    source: 'simulated',
    updatedAt: new Date().toISOString(),
  });
}

export const GET = withAuth(handleGet);
