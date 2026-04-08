import { NextResponse } from 'next/server'

/**
 * Enterprise intelligence metrics API route.
 * Matches broker response format so shared SupplyDemandPanel can be used.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const instrument = searchParams.get('instrument')

  try {
    const { sql } = await import('@shared/lib/db/connection')

    if (instrument) {
      // Single instrument
      const metricsResult = await sql`
        SELECT * FROM market_metrics
        WHERE instrument_type = ${instrument}
        ORDER BY date DESC
        LIMIT 1
      `
      const metrics = metricsResult.rows[0] ?? null

      return NextResponse.json({
        instrument,
        metrics: metrics ? {
          date: metrics.date,
          instrumentType: metrics.instrument_type,
          cumulativeSurplus: metrics.cumulative_surplus ? Number(metrics.cumulative_surplus) : null,
          creationVelocity4w: metrics.creation_velocity_4w ? Number(metrics.creation_velocity_4w) : null,
          creationVelocity12w: metrics.creation_velocity_12w ? Number(metrics.creation_velocity_12w) : null,
          impliedAnnualDemand: metrics.implied_annual_demand ? Number(metrics.implied_annual_demand) : null,
          surplusRunwayYears: metrics.surplus_runway_years ? Number(metrics.surplus_runway_years) : null,
          daysToSurrender: metrics.days_to_surrender ? Number(metrics.days_to_surrender) : null,
          priceToPenaltyRatio: metrics.price_to_penalty_ratio ? Number(metrics.price_to_penalty_ratio) : null,
          penaltyRate: metrics.penalty_rate ? Number(metrics.penalty_rate) : null,
          forwardCurveSlope: metrics.forward_curve_slope ? Number(metrics.forward_curve_slope) : null,
          regimeIndicator: metrics.regime_indicator,
        } : null,
        recentPrices: [],
        priceCount: 0,
      })
    }

    // All instruments
    const result = await sql`
      SELECT DISTINCT ON (instrument_type) *
      FROM market_metrics
      ORDER BY instrument_type, date DESC
    `

    const instruments = result.rows.map((row: Record<string, unknown>) => ({
      instrument: row.instrument_type,
      metrics: {
        date: row.date,
        instrumentType: row.instrument_type,
        cumulativeSurplus: row.cumulative_surplus ? Number(row.cumulative_surplus) : null,
        creationVelocity4w: row.creation_velocity_4w ? Number(row.creation_velocity_4w) : null,
        creationVelocity12w: row.creation_velocity_12w ? Number(row.creation_velocity_12w) : null,
        impliedAnnualDemand: row.implied_annual_demand ? Number(row.implied_annual_demand) : null,
        surplusRunwayYears: row.surplus_runway_years ? Number(row.surplus_runway_years) : null,
        daysToSurrender: row.days_to_surrender ? Number(row.days_to_surrender) : null,
        priceToPenaltyRatio: row.price_to_penalty_ratio ? Number(row.price_to_penalty_ratio) : null,
        penaltyRate: row.penalty_rate ? Number(row.penalty_rate) : null,
        forwardCurveSlope: row.forward_curve_slope ? Number(row.forward_curve_slope) : null,
        regimeIndicator: row.regime_indicator,
      },
    }))

    return NextResponse.json({ instruments, total: instruments.length })
  } catch {
    if (instrument) {
      return NextResponse.json({
        instrument,
        metrics: null,
        recentPrices: [],
        priceCount: 0,
        message: 'Enterprise database not connected.',
      })
    }
    return NextResponse.json({ instruments: [], total: 0, message: 'Enterprise database not connected.' })
  }
}
