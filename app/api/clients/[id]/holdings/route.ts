/**
 * GET  /api/clients/:id/holdings — Full holdings breakdown
 * POST /api/clients/:id/holdings — Record a new holding
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET — holdings breakdown by instrument, vintage, status
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest, context: unknown) {
  try {
    const { id } = await (context as RouteContext).params;
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json({ error: 'No organisation associated with account' }, { status: 400 });
    }

    const { getClient, getClientHoldings } = await import('@/lib/db/queries/clients');

    const client = await getClient(id, user.organisationId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const holdings = await getClientHoldings(id);

    // Group by instrument type for summary
    const byInstrument: Record<string, { quantity: number; totalCost: number; count: number }> = {};
    for (const h of holdings) {
      const key = h.instrument_type;
      if (!byInstrument[key]) byInstrument[key] = { quantity: 0, totalCost: 0, count: 0 };
      byInstrument[key].quantity += h.quantity;
      byInstrument[key].totalCost += Number(h.total_cost ?? 0);
      byInstrument[key].count++;
    }

    return NextResponse.json({ holdings, summary: byInstrument });
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a new holding
// ---------------------------------------------------------------------------

async function handlePost(request: NextRequest, context: unknown) {
  try {
    const { id } = await (context as RouteContext).params;
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json({ error: 'No organisation associated with account' }, { status: 400 });
    }

    const { getClient, createHolding } = await import('@/lib/db/queries/clients');

    const client = await getClient(id, user.organisationId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();

    if (!body.instrument_type || body.quantity == null) {
      return NextResponse.json(
        { error: 'instrument_type and quantity are required' },
        { status: 400 }
      );
    }

    const holding = await createHolding(id, {
      instrument_type: body.instrument_type,
      quantity: body.quantity,
      average_cost: body.average_cost,
      total_cost: body.total_cost,
      vintage: body.vintage,
      registry_reference: body.registry_reference,
      status: body.status,
    });

    return NextResponse.json({ holding }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create holding' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withAuth(handleGet, { roles: ['admin', 'broker'] });
export const POST = withAuth(handlePost, { roles: ['admin', 'broker'] });
