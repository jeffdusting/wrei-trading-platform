/**
 * GET /api/v1/clients/:id/compliance — client compliance / surrender status
 *
 * Optionally filter by ?year=2026.
 * Requires API key authentication. Organisation-scoped.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getClient, getClientSurrenderStatus } from '@/lib/db/queries/clients';

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
  const year = request.nextUrl.searchParams.get('year') ?? undefined;

  try {
    const client = await getClient(id, user.organisationId);
    if (!client) {
      return apiError('not_found', 'Client not found', 404);
    }

    const surrenderStatus = await getClientSurrenderStatus(id, year);

    const totalShortfall = surrenderStatus.reduce((sum, s) => sum + s.shortfall, 0);
    const totalPenaltyExposure = surrenderStatus.reduce(
      (sum, s) => sum + (s.penalty_exposure ?? 0),
      0,
    );

    return apiSuccess({
      clientId: id,
      clientName: client.name,
      complianceYear: year ?? 'all',
      surrenderStatus,
      summary: {
        totalSchemes: surrenderStatus.length,
        totalShortfall,
        totalPenaltyExposure,
        atRisk: surrenderStatus.filter(s => s.status === 'shortfall').length,
        compliant: surrenderStatus.filter(s => s.status === 'compliant').length,
      },
    });
  } catch {
    return apiError('internal_error', 'Failed to retrieve compliance data', 500);
  }
}

export const GET = withAuth(handleGet);
