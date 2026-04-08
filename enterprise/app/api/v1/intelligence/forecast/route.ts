import { NextResponse } from 'next/server'

/**
 * Enterprise intelligence forecast API route.
 * Matches broker response format so shared ForecastPanel can be used.
 * Reads from enterprise DB (same schema as broker forecasts table).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const instrument = searchParams.get('instrument') ?? 'ESC'
  const horizon = searchParams.get('horizon')

  try {
    const { sql } = await import('@shared/lib/db/connection')

    let result
    if (horizon) {
      result = await sql`
        SELECT * FROM forecasts
        WHERE instrument_type = ${instrument} AND horizon_weeks = ${parseInt(horizon)}
        ORDER BY generated_at DESC
        LIMIT 1
      `
    } else {
      result = await sql`
        SELECT DISTINCT ON (horizon_weeks) *
        FROM forecasts
        WHERE instrument_type = ${instrument}
        ORDER BY horizon_weeks ASC, generated_at DESC
      `
    }

    const forecasts = result.rows.map((row: Record<string, unknown>) => ({
      generatedAt: row.generated_at,
      instrumentType: row.instrument_type,
      horizonWeeks: row.horizon_weeks,
      priceForecast: Number(row.price_forecast),
      confidenceIntervals: {
        ci80: {
          lower: row.price_lower_80 != null ? Number(row.price_lower_80) : null,
          upper: row.price_upper_80 != null ? Number(row.price_upper_80) : null,
        },
        ci95: {
          lower: row.price_lower_95 != null ? Number(row.price_lower_95) : null,
          upper: row.price_upper_95 != null ? Number(row.price_upper_95) : null,
        },
      },
      regimeProbabilities: row.regime_probability,
      modelVersion: row.model_version,
      metadata: row.metadata,
    }))

    const latest = result.rows[0]
    return NextResponse.json({
      instrument,
      forecasts,
      modelVersion: latest?.model_version ?? 'unknown',
      generatedAt: latest?.generated_at ?? new Date().toISOString(),
    })
  } catch {
    // No DB — return empty with message
    return NextResponse.json({
      instrument,
      forecasts: [],
      modelVersion: 'none',
      generatedAt: new Date().toISOString(),
      message: 'Enterprise database not connected. Forecasts populate once POSTGRES_URL is configured.',
    })
  }
}
