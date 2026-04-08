import { NextResponse } from 'next/server'

/**
 * Portfolio/Entity API
 * GET: list entity hierarchy or entity by ID
 * POST: create entity
 * PUT: update entity
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const entityId = searchParams.get('entity_id')

  try {
    const { sql } = await import('@shared/lib/db/connection')

    if (entityId) {
      // Get entity + compliance
      const entityResult = await sql`SELECT * FROM entity_hierarchy WHERE id = ${entityId}`
      if (entityResult.rows.length === 0) {
        return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
      }
      const complianceResult = await sql`
        SELECT * FROM entity_compliance WHERE entity_id = ${entityId}
        ORDER BY compliance_year DESC, scheme
      `
      return NextResponse.json({
        entity: entityResult.rows[0],
        compliance: complianceResult.rows,
      })
    }

    // Full hierarchy
    const result = await sql`
      WITH RECURSIVE tree AS (
        SELECT *, 0 AS depth FROM entity_hierarchy WHERE parent_id IS NULL
        UNION ALL
        SELECT e.*, t.depth + 1
        FROM entity_hierarchy e JOIN tree t ON e.parent_id = t.id
      )
      SELECT * FROM tree ORDER BY depth, entity_name
    `
    return NextResponse.json({ entities: result.rows, total: result.rows.length })
  } catch {
    return NextResponse.json({ entities: [], total: 0, message: 'Database unavailable' })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sql } = await import('@shared/lib/db/connection')

    const result = await sql`
      INSERT INTO entity_hierarchy (parent_id, entity_name, entity_type, division, metadata)
      VALUES (
        ${body.parent_id ?? null}, ${body.entity_name}, ${body.entity_type},
        ${body.division ?? null}, ${JSON.stringify(body.metadata ?? {})}
      )
      RETURNING *
    `
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create entity', message: err instanceof Error ? err.message : 'Database unavailable' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { sql } = await import('@shared/lib/db/connection')

    const result = await sql`
      UPDATE entity_hierarchy
      SET entity_name = ${body.entity_name ?? ''}, entity_type = ${body.entity_type ?? 'client'},
          division = ${body.division ?? null}, metadata = ${JSON.stringify(body.metadata ?? {})},
          updated_at = now()
      WHERE id = ${body.id}
      RETURNING *
    `
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to update entity', message: err instanceof Error ? err.message : 'Database unavailable' },
      { status: 500 }
    )
  }
}
