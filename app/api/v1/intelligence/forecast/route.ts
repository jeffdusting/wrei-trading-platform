/**
 * GET /api/v1/intelligence/forecast
 *
 * Returns the latest price forecasts for ESC instruments.
 *
 * Query params:
 *   ?instrument=ESC     — filter by instrument type (default: ESC)
 *   ?horizon=4          — specific horizon in weeks (default: all)
 *
 * Response includes: price forecast, confidence intervals, regime
 * probabilities, model version.
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { sql } from '@/lib/db/connection';

const VALID_INSTRUMENTS = ['ESC', 'VEEC', 'LGC', 'ACCU', 'STC', 'PRC'];
const VALID_HORIZONS = [1, 4, 12, 26];

async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instrument = (searchParams.get('instrument') ?? 'ESC').toUpperCase();
  const horizonParam = searchParams.get('horizon');

  if (!VALID_INSTRUMENTS.includes(instrument)) {
    return apiError(
      'validation_error',
      `Invalid instrument. Must be one of: ${VALID_INSTRUMENTS.join(', ')}`,
      400
    );
  }

  if (horizonParam) {
    const h = parseInt(horizonParam, 10);
    if (!VALID_HORIZONS.includes(h)) {
      return apiError(
        'validation_error',
        `Invalid horizon. Must be one of: ${VALID_HORIZONS.join(', ')}`,
        400
      );
    }
  }

  try {
    // Get the latest forecast batch (all rows from the most recent generated_at)
    const { rows } = horizonParam
      ? await sql`
          SELECT generated_at, instrument_type, horizon_weeks,
                 price_forecast, price_lower_80, price_upper_80,
                 price_lower_95, price_upper_95,
                 regime_probability, model_version, metadata
          FROM forecasts
          WHERE instrument_type = ${instrument}
            AND horizon_weeks = ${parseInt(horizonParam, 10)}
          ORDER BY generated_at DESC
          LIMIT 1
        `
      : await sql`
          SELECT generated_at, instrument_type, horizon_weeks,
                 price_forecast, price_lower_80, price_upper_80,
                 price_lower_95, price_upper_95,
                 regime_probability, model_version, metadata
          FROM forecasts
          WHERE instrument_type = ${instrument}
            AND generated_at = (
              SELECT MAX(generated_at) FROM forecasts
              WHERE instrument_type = ${instrument}
            )
          ORDER BY horizon_weeks ASC
        `;

    if (rows.length === 0) {
      return apiSuccess({
        instrument,
        forecasts: [],
        message: 'No forecasts available. Run the forecast generator first.',
      });
    }

    const forecasts = rows.map((r) => ({
      generatedAt: r.generated_at,
      instrumentType: r.instrument_type,
      horizonWeeks: r.horizon_weeks,
      priceForecast: Number(r.price_forecast),
      confidenceIntervals: {
        ci80: {
          lower: r.price_lower_80 ? Number(r.price_lower_80) : null,
          upper: r.price_upper_80 ? Number(r.price_upper_80) : null,
        },
        ci95: {
          lower: r.price_lower_95 ? Number(r.price_lower_95) : null,
          upper: r.price_upper_95 ? Number(r.price_upper_95) : null,
        },
      },
      regimeProbabilities: r.regime_probability,
      modelVersion: r.model_version,
      metadata: r.metadata,
    }));

    return apiSuccess({
      instrument,
      forecasts,
      modelVersion: rows[0].model_version,
      generatedAt: rows[0].generated_at,
    });
  } catch {
    // DB not available — return empty forecasts (expected in demo mode)
    return apiSuccess({
      instrument,
      forecasts: [],
      message: 'Forecast database not available. Deploy with DATABASE_URL to enable.',
    });
  }
}

export const GET = withAuth(handleGet);
