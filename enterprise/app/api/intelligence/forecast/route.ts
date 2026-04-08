import { NextResponse } from 'next/server'

// Enterprise intelligence forecast API route
// Proxies to shared forecast logic — same data pipeline as broker
// When enterprise DB is connected, reads from shared forecasts table

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const instrument = searchParams.get('instrument') ?? 'ESC'

  try {
    // Attempt to read from database
    const { sql } = await import('@shared/lib/db/connection')
    const result = await sql`
      SELECT
        horizon_weeks,
        price_forecast,
        price_lower_80,
        price_upper_80,
        price_lower_95,
        price_upper_95,
        regime_probability,
        model_version,
        generated_at
      FROM forecasts
      WHERE instrument_type = ${instrument}
      ORDER BY generated_at DESC, horizon_weeks ASC
      LIMIT 10
    `

    return NextResponse.json({
      instrument,
      forecasts: result.rows,
      source: 'database',
    })
  } catch {
    // Graceful fallback — no database connected yet
    return NextResponse.json({
      instrument,
      forecasts: [],
      source: 'none',
      message: 'Enterprise database not connected. Forecasts will be available once POSTGRES_URL is configured.',
    })
  }
}
