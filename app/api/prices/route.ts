/**
 * Price Feed API — serves live/cached/simulated prices to client components.
 *
 * GET /api/prices              — all instrument prices + feed health
 * GET /api/prices?type=ESC     — single instrument price
 * GET /api/prices?history=ESC&days=30  — price history for charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllPrices, getPrice, getPriceHistory, getHealthStatus } from '@/lib/data-feeds/feed-manager';
import type { InstrumentType } from '@/lib/trading/instruments/types';

const VALID_TYPES: InstrumentType[] = ['ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI_CC', 'WREI_ACO'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') as InstrumentType | null;
    const history = searchParams.get('history') as InstrumentType | null;
    const days = parseInt(searchParams.get('days') ?? '30', 10);

    // Single instrument history
    if (history && VALID_TYPES.includes(history)) {
      const data = await getPriceHistory(history, days);
      return NextResponse.json({ history: data });
    }

    // Single instrument price
    if (type && VALID_TYPES.includes(type)) {
      const price = await getPrice(type);
      return NextResponse.json({ price });
    }

    // All prices + health
    const [prices, health] = await Promise.all([
      getAllPrices(),
      Promise.resolve(getHealthStatus()),
    ]);

    return NextResponse.json({ prices, health });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
