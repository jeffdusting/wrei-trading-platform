/**
 * GET /api/v1/correspondence — list correspondence for the organisation
 *
 * Supports filters: ?type=rfq&status=drafted&client_id=...
 * Requires API key authentication. Organisation-scoped.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getCorrespondenceByOrg } from '@/lib/db/queries/correspondence';
import { rowToCorrespondence } from '@/lib/correspondence/types';

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  const params = request.nextUrl.searchParams;
  const filters = {
    type: params.get('type') ?? undefined,
    status: params.get('status') ?? undefined,
    clientId: params.get('client_id') ?? undefined,
  };

  try {
    const rows = await getCorrespondenceByOrg(user.organisationId, filters);
    const correspondence = rows.map(rowToCorrespondence);

    return apiSuccess(correspondence);
  } catch {
    return apiError('internal_error', 'Failed to retrieve correspondence', 500);
  }
}

export const GET = withAuth(handleGet);
