import { NextResponse } from 'next/server'

/**
 * Enterprise intelligence alerts API route.
 * Matches broker response format so shared AlertsFeed can be used.
 */
export async function GET() {
  try {
    const { sql } = await import('@shared/lib/db/connection')

    const result = await sql`
      SELECT * FROM intelligence_alerts
      WHERE acknowledged_at IS NULL
      ORDER BY
        CASE severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
        created_at DESC
      LIMIT 50
    `

    const alerts = result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      alertType: row.alert_type,
      severity: row.severity,
      title: row.title,
      summary: row.summary,
      estimatedPriceImpactPct: row.estimated_price_impact_pct ? Number(row.estimated_price_impact_pct) : 0,
      source: row.source,
      sourceUrl: row.source_url,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
      acknowledgedAt: row.acknowledged_at,
    }))

    return NextResponse.json({ alerts, total: alerts.length })
  } catch {
    return NextResponse.json({
      alerts: [],
      total: 0,
      message: 'Enterprise database not connected.',
    })
  }
}

export async function POST(request: Request) {
  try {
    const { alertId } = await request.json()

    if (!alertId || typeof alertId !== 'number') {
      return NextResponse.json({ error: 'alertId required (number)' }, { status: 400 })
    }

    const { sql } = await import('@shared/lib/db/connection')

    await sql`
      UPDATE intelligence_alerts
      SET acknowledged_at = NOW()
      WHERE id = ${alertId}
    `

    return NextResponse.json({ acknowledged: true, alertId })
  } catch {
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Failed to acknowledge alert — it may already be acknowledged or DB unavailable',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
