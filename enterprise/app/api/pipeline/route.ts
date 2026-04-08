import { NextResponse } from 'next/server'

const STAGE_WEIGHTS: Record<string, number> = {
  diagnostic: 0.10, validation: 0.25, implementation: 0.50,
  mv_audit: 0.75, registration: 0.90, sale: 1.00,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stage = searchParams.get('stage')
  const division = searchParams.get('division')

  try {
    const { sql } = await import('@shared/lib/db/connection')
    const result = await sql`
      SELECT * FROM pipeline_projects
      WHERE archived = false
      ORDER BY stage, created_at DESC
    `
    let projects = result.rows
    if (stage) projects = projects.filter((p: Record<string, unknown>) => p.stage === stage)
    if (division) projects = projects.filter((p: Record<string, unknown>) => p.division === division)
    return NextResponse.json({ projects, total: projects.length })
  } catch {
    return NextResponse.json({ projects: [], total: 0, message: 'Database unavailable' })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sql } = await import('@shared/lib/db/connection')
    const result = await sql`
      INSERT INTO pipeline_projects (
        assessment_id, project_name, client, division, scheme, method,
        stage, estimated_yield, estimated_value, probability_weight, notes
      ) VALUES (
        ${body.assessment_id ?? null}, ${body.project_name ?? 'Untitled'},
        ${body.client ?? null}, ${body.division ?? null},
        ${body.scheme ?? null}, ${body.method ?? null},
        ${body.stage ?? 'diagnostic'}, ${body.estimated_yield ?? null},
        ${body.estimated_value ?? null}, ${body.probability_weight ?? STAGE_WEIGHTS[body.stage ?? 'diagnostic'] ?? 0.10},
        ${body.notes ?? null}
      )
      RETURNING *
    `
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create project', message: err instanceof Error ? err.message : 'Database unavailable' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { sql } = await import('@shared/lib/db/connection')
    const weight = STAGE_WEIGHTS[body.stage] ?? 0.10
    const result = await sql`
      UPDATE pipeline_projects
      SET stage = ${body.stage}, probability_weight = ${weight}, updated_at = now()
      WHERE id = ${body.id}
      RETURNING *
    `
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update project', message: err instanceof Error ? err.message : 'Database unavailable' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { sql } = await import('@shared/lib/db/connection')
    await sql`UPDATE pipeline_projects SET archived = true, updated_at = now() WHERE id = ${id}`
    return NextResponse.json({ archived: true, id })
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
  }
}
