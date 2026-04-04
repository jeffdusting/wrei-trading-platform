/**
 * GET /api/clients/:id — Client detail with holdings summary
 * PUT /api/clients/:id — Update client
 *
 * Scoped to the authenticated user's organisation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET — client detail
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest, context: unknown) {
  try {
    const { id } = await (context as RouteContext).params;
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json({ error: 'No organisation associated with account' }, { status: 400 });
    }

    const { getClient, getClientHoldings, getClientSurrenderStatus } =
      await import('@/lib/db/queries/clients');

    const client = await getClient(id, user.organisationId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const [holdings, compliance] = await Promise.all([
      getClientHoldings(id),
      getClientSurrenderStatus(id),
    ]);

    return NextResponse.json({ client, holdings, compliance });
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

// ---------------------------------------------------------------------------
// PUT — update client
// ---------------------------------------------------------------------------

async function handlePut(request: NextRequest, context: unknown) {
  try {
    const { id } = await (context as RouteContext).params;
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json({ error: 'No organisation associated with account' }, { status: 400 });
    }

    const body = await request.json();
    const { updateClient } = await import('@/lib/db/queries/clients');

    const client = await updateClient(id, user.organisationId, body);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GET = withAuth(handleGet, { roles: ['admin', 'broker'] });
export const PUT = withAuth(handlePut, { roles: ['admin', 'broker'] });
