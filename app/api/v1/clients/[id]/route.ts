/**
 * GET /api/v1/clients/:id — client detail
 * PUT /api/v1/clients/:id — update client
 *
 * Requires API key authentication. Organisation-scoped.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getClient, updateClient } from '@/lib/db/queries/clients';

async function handleGet(
  request: NextRequest,
  context: unknown,
) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;

  try {
    const client = await getClient(id, user.organisationId);
    if (!client) {
      return apiError('not_found', 'Client not found', 404);
    }
    return apiSuccess(client);
  } catch {
    return apiError('internal_error', 'Failed to retrieve client', 500);
  }
}

async function handlePut(
  request: NextRequest,
  context: unknown,
) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('validation_error', 'Invalid JSON body', 400);
  }

  try {
    const updated = await updateClient(id, user.organisationId, body);
    if (!updated) {
      return apiError('not_found', 'Client not found', 404);
    }
    return apiSuccess(updated);
  } catch {
    return apiError('internal_error', 'Failed to update client', 500);
  }
}

export const GET = withAuth(handleGet);
export const PUT = withAuth(handlePut, { roles: ['admin', 'broker'] });
