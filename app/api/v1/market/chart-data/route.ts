/**
 * GET /api/v1/market/chart-data?instrument=ESC&days=90
 *
 * Combined price history + estimated market volume + forecast data
 * for chart display. Uses public data sources and simulation —
 * no private broker data or external API connections required.
 */

import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { validateInstrumentType } from '@/lib/api/validation'
import { generateCombinedChartData } from '@/lib/data-feeds/adapters/chart-demo-data'
import type { InstrumentType } from '@/lib/trading/instruments/types'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const instrument = params.get('instrument')
  const rawDays = params.get('days')

  if (!instrument) {
    return apiError('validation_error', 'instrument query parameter is required', 400)
  }

  const check = validateInstrumentType(instrument)
  if (!check.valid) {
    return apiError('validation_error', check.error.message, 400)
  }

  const days = rawDays ? parseInt(rawDays, 10) : 90
  if (isNaN(days) || days < 7 || days > 365) {
    return apiError('validation_error', 'days must be between 7 and 365', 400)
  }

  // Try DB-backed data first, fall back to simulation
  try {
    // For now, use simulation-based demo data for all instruments.
    // When live DB is populated with price_observations, this can
    // query the DB and merge with forecast table data.
    const data = generateCombinedChartData(check.type as InstrumentType, days)

    return apiSuccess(data)
  } catch {
    return apiError('internal_error', 'Failed to generate chart data', 500)
  }
}
