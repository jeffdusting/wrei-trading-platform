/**
 * GET /api/v1/clients/compliance/summary
 *
 * All clients' compliance positions in one call.
 * Requires API key authentication. Organisation-scoped.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import {
  getClientsByOrganisation,
  getClientSurrenderStatus,
} from '@/lib/db/queries/clients';

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  try {
    const clients = await getClientsByOrganisation(user.organisationId);

    const clientCompliance = await Promise.all(
      clients.map(async (client) => {
        const surrenderStatus = await getClientSurrenderStatus(client.id);
        const totalShortfall = surrenderStatus.reduce((sum, s) => sum + s.shortfall, 0);
        const totalPenaltyExposure = surrenderStatus.reduce(
          (sum, s) => sum + (s.penalty_exposure ?? 0), 0,
        );

        return {
          clientId: client.id,
          clientName: client.name,
          entityType: client.entity_type,
          isActive: client.is_active,
          schemes: surrenderStatus.length,
          totalShortfall,
          totalPenaltyExposure,
          status: totalShortfall > 0 ? 'at_risk' : 'compliant',
          surrenderStatus,
        };
      }),
    );

    const totalClients = clientCompliance.length;
    const atRisk = clientCompliance.filter(c => c.status === 'at_risk').length;
    const aggregatePenaltyExposure = clientCompliance.reduce(
      (sum, c) => sum + c.totalPenaltyExposure, 0,
    );

    return apiSuccess({
      clients: clientCompliance,
      summary: {
        totalClients,
        atRisk,
        compliant: totalClients - atRisk,
        aggregatePenaltyExposure,
      },
    });
  } catch {
    return apiError('internal_error', 'Failed to retrieve compliance summary', 500);
  }
}

export const GET = withAuth(handleGet);
