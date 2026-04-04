/**
 * GET  /api/clients — List all clients for the authenticated user's organisation
 * POST /api/clients — Create a new client
 *
 * Requires: admin or broker role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';

// ---------------------------------------------------------------------------
// GET — list clients
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json({ error: 'No organisation associated with account' }, { status: 400 });
    }

    const { getClientsByOrganisation } = await import('@/lib/db/queries/clients');
    const clients = await getClientsByOrganisation(user.organisationId);
    return NextResponse.json({ clients });
  } catch {
    return NextResponse.json({ clients: [], error: 'Database unavailable' }, { status: 200 });
  }
}

// ---------------------------------------------------------------------------
// POST — create client
// ---------------------------------------------------------------------------

async function handlePost(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json({ error: 'No organisation associated with account' }, { status: 400 });
    }

    const body = await request.json();

    if (!body.name || !body.entity_type) {
      return NextResponse.json({ error: 'name and entity_type are required' }, { status: 400 });
    }

    const validTypes = ['acp', 'obligated_entity', 'government', 'corporate', 'institutional'];
    if (!validTypes.includes(body.entity_type)) {
      return NextResponse.json({ error: `entity_type must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    const { createClient } = await import('@/lib/db/queries/clients');
    const client = await createClient(user.organisationId, {
      name: body.name,
      entity_type: body.entity_type,
      contact_email: body.contact_email,
      contact_name: body.contact_name,
      abn: body.abn,
      ess_participant_id: body.ess_participant_id,
      annual_esc_target: body.annual_esc_target,
      annual_veec_target: body.annual_veec_target,
      safeguard_facility_id: body.safeguard_facility_id,
      metadata: body.metadata,
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Exports — wrapped with auth (admin/broker only)
// ---------------------------------------------------------------------------

export const GET = withAuth(handleGet, { roles: ['admin', 'broker'] });
export const POST = withAuth(handlePost, { roles: ['admin', 'broker'] });
