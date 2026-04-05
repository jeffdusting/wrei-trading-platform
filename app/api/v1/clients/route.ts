/**
 * GET  /api/v1/clients — list all clients for the organisation
 * POST /api/v1/clients — create a new client
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiCreated, apiError } from '@/lib/api/response';
import { validateRequired } from '@/lib/api/validation';
import { getClientsByOrganisation, createClient } from '@/lib/db/queries/clients';

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  try {
    const clients = await getClientsByOrganisation(user.organisationId);
    return apiSuccess(clients);
  } catch {
    return apiError('internal_error', 'Failed to retrieve clients', 500);
  }
}

async function handlePost(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('validation_error', 'Invalid JSON body', 400);
  }

  const errors = validateRequired(body, ['name', 'entity_type']);
  if (errors.length > 0) {
    return apiError('validation_error', errors.map(e => e.message).join('; '), 400);
  }

  const validEntityTypes = ['acp', 'obligated_entity', 'government', 'corporate', 'institutional'];
  if (!validEntityTypes.includes(body.entity_type as string)) {
    return apiError(
      'validation_error',
      `entity_type must be one of: ${validEntityTypes.join(', ')}`,
      400,
    );
  }

  try {
    const client = await createClient(user.organisationId, {
      name: body.name as string,
      entity_type: body.entity_type as 'acp' | 'obligated_entity' | 'government' | 'corporate' | 'institutional',
      contact_email: body.contact_email as string | undefined,
      contact_name: body.contact_name as string | undefined,
      abn: body.abn as string | undefined,
      ess_participant_id: body.ess_participant_id as string | undefined,
      annual_esc_target: body.annual_esc_target as number | undefined,
      annual_veec_target: body.annual_veec_target as number | undefined,
      safeguard_facility_id: body.safeguard_facility_id as string | undefined,
      metadata: body.metadata as Record<string, unknown> | undefined,
    });

    return apiCreated(client);
  } catch {
    return apiError('internal_error', 'Failed to create client', 500);
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost, { roles: ['admin', 'broker'] });
