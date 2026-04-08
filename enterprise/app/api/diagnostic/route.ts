import { NextResponse } from 'next/server'

/**
 * Diagnostic Assessment API
 * POST: saves a completed diagnostic assessment
 * GET: retrieves assessment by ID or lists assessments
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sql } = await import('@shared/lib/db/connection')

    const result = await sql`
      INSERT INTO diagnostic_assessments (
        project_name, jurisdiction, scheme, method, activity_type,
        eligible, disqualifiers, yield_estimate, yield_inputs,
        current_value, forecast_value, status, created_by, division, client, notes
      ) VALUES (
        ${body.project_name ?? 'Untitled'},
        ${body.jurisdiction},
        ${body.scheme},
        ${body.method},
        ${body.activity_type ?? null},
        ${body.eligible ?? false},
        ${JSON.stringify(body.disqualifiers ?? [])},
        ${body.yield_estimate ?? null},
        ${JSON.stringify(body.yield_inputs ?? {})},
        ${body.current_value ?? null},
        ${body.forecast_value ?? null},
        ${body.status ?? 'draft'},
        ${body.created_by ?? null},
        ${body.division ?? null},
        ${body.client ?? null},
        ${body.notes ?? null}
      )
      RETURNING *
    `
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to save assessment', message: err instanceof Error ? err.message : 'Database unavailable' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    const { sql } = await import('@shared/lib/db/connection')

    if (id) {
      const result = await sql`SELECT * FROM diagnostic_assessments WHERE id = ${id}`
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      }
      return NextResponse.json(result.rows[0])
    }

    const jurisdiction = searchParams.get('jurisdiction')
    const scheme = searchParams.get('scheme')
    const status = searchParams.get('status')

    const result = await sql`
      SELECT * FROM diagnostic_assessments
      WHERE
        (${jurisdiction ?? null}::text IS NULL OR jurisdiction = ${jurisdiction ?? ''})
        AND (${scheme ?? null}::text IS NULL OR scheme = ${scheme ?? ''})
        AND (${status ?? null}::text IS NULL OR status = ${status ?? ''})
      ORDER BY created_at DESC
      LIMIT 100
    `
    return NextResponse.json({ assessments: result.rows, total: result.rows.length })
  } catch {
    return NextResponse.json({ assessments: [], total: 0, message: 'Database unavailable' })
  }
}
