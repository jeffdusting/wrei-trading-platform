/**
 * GET /api/v1/market/prices/history?instrument=ESC&days=30
 *
 * Price history for a specific instrument.
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateInstrumentType } from '@/lib/api/validation';
import { getPriceHistory } from '@/lib/db/queries/pricing';

async function handleGet(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const instrument = params.get('instrument');
  const rawDays = params.get('days');

  if (!instrument) {
    return apiError('validation_error', 'instrument query parameter is required', 400);
  }

  const check = validateInstrumentType(instrument);
  if (!check.valid) {
    return apiError('validation_error', check.error.message, 400);
  }

  const days = rawDays ? parseInt(rawDays, 10) : 30;
  if (isNaN(days) || days < 1 || days > 365) {
    return apiError('validation_error', 'days must be between 1 and 365', 400);
  }

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await getPriceHistory(check.type, { since, limit: days * 24 });

    return apiSuccess(
      history.map(h => ({
        instrument: check.type,
        price: h.price,
        source: h.source,
        recordedAt: h.recorded_at,
      })),
    );
  } catch {
    return apiError('internal_error', 'Failed to retrieve price history', 500);
  }
}

export const GET = withAuth(handleGet);
