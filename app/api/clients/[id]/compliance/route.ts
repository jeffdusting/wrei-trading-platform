/**
 * GET /api/clients/:id/compliance — Surrender tracking for a compliance year
 *
 * Query params:
 *   year (optional) — e.g. "2026". If omitted, returns all years.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';

type RouteContext = { params: Promise<{ id: string }> };

async function handleGet(request: NextRequest, context: unknown) {
  try {
    const { id } = await (context as RouteContext).params;
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json({ error: 'No organisation associated with account' }, { status: 400 });
    }

    const { getClient, getClientSurrenderStatus } = await import('@/lib/db/queries/clients');

    const client = await getClient(id, user.organisationId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const year = request.nextUrl.searchParams.get('year') ?? undefined;
    const surrenderStatus = await getClientSurrenderStatus(id, year);

    // Compute summary
    const totalTarget = surrenderStatus.reduce((s, r) => s + r.target_quantity, 0);
    const totalSurrendered = surrenderStatus.reduce((s, r) => s + r.surrendered_quantity, 0);
    const totalShortfall = surrenderStatus.reduce((s, r) => s + Math.max(0, r.shortfall), 0);
    const totalPenaltyExposure = surrenderStatus.reduce(
      (s, r) => s + Number(r.penalty_exposure ?? 0), 0
    );

    return NextResponse.json({
      client_id: id,
      year: year ?? 'all',
      records: surrenderStatus,
      summary: {
        totalTarget,
        totalSurrendered,
        totalShortfall,
        totalPenaltyExposure,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export const GET = withAuth(handleGet, { roles: ['admin', 'broker'] });
