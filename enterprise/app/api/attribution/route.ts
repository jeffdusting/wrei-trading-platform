import { NextResponse } from 'next/server'

/**
 * Attribution Record API
 * POST: saves attribution outcome (optionally linked to a diagnostic assessment)
 * GET: retrieves attribution by assessment ID
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sql } = await import('@shared/lib/db/connection')

    const result = await sql`
      INSERT INTO attribution_records (
        assessment_id, asset_owner, asset_owner_type,
        facility_operator, operator_type, tenant, tenant_type,
        bill_payer, contract_holder, cost_passthrough, equipment_control,
        eligible_saver, split_incentive, confidence, required_actions
      ) VALUES (
        ${body.assessment_id ?? null},
        ${body.asset_owner ?? ''},
        ${body.asset_owner_type ?? null},
        ${body.facility_operator ?? null},
        ${body.operator_type ?? null},
        ${body.tenant ?? null},
        ${body.tenant_type ?? null},
        ${body.bill_payer ?? null},
        ${body.contract_holder ?? null},
        ${body.cost_passthrough ?? null},
        ${body.equipment_control ?? null},
        ${body.eligible_saver ?? null},
        ${body.split_incentive ?? false},
        ${body.confidence ?? null},
        ${JSON.stringify(body.required_actions ?? [])}
      )
      RETURNING *
    `
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to save attribution', message: err instanceof Error ? err.message : 'Database unavailable' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const assessmentId = searchParams.get('assessment_id')

  try {
    const { sql } = await import('@shared/lib/db/connection')

    if (assessmentId) {
      const result = await sql`
        SELECT * FROM attribution_records WHERE assessment_id = ${assessmentId}
      `
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Attribution not found' }, { status: 404 })
      }
      return NextResponse.json(result.rows[0])
    }

    const result = await sql`
      SELECT * FROM attribution_records ORDER BY created_at DESC LIMIT 100
    `
    return NextResponse.json({ attributions: result.rows, total: result.rows.length })
  } catch {
    return NextResponse.json({ attributions: [], total: 0, message: 'Database unavailable' })
  }
}
