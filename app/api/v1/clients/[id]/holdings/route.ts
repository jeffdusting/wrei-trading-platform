/**
 * GET /api/v1/clients/:id/holdings — client's certificate/token holdings
 *
 * Requires API key authentication. Organisation-scoped.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getClient, getClientHoldings } from '@/lib/db/queries/clients';

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
    // Verify client belongs to this organisation
    const client = await getClient(id, user.organisationId);
    if (!client) {
      return apiError('not_found', 'Client not found', 404);
    }

    const holdings = await getClientHoldings(id);

    // Summarise by instrument type
    const summary = holdings.reduce((acc, h) => {
      const key = h.instrument_type;
      if (!acc[key]) {
        acc[key] = { instrumentType: key, totalQuantity: 0, totalCost: 0, positions: 0 };
      }
      acc[key].totalQuantity += h.quantity;
      acc[key].totalCost += h.total_cost ?? 0;
      acc[key].positions += 1;
      return acc;
    }, {} as Record<string, { instrumentType: string; totalQuantity: number; totalCost: number; positions: number }>);

    return apiSuccess({
      clientId: id,
      clientName: client.name,
      holdings,
      summary: Object.values(summary),
    });
  } catch {
    return apiError('internal_error', 'Failed to retrieve holdings', 500);
  }
}

export const GET = withAuth(handleGet);
