/**
 * GET /api/v1/correspondence/threads — list active negotiation threads
 *
 * Returns in-memory negotiation threads for the authenticated organisation.
 * Requires API key authentication. Organisation-scoped.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getActiveThreads } from '@/lib/correspondence/negotiation-manager';

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  try {
    const threads = getActiveThreads(user.organisationId);

    const summary = threads.map(t => ({
      id: t.id,
      counterpartyName: t.counterpartyName,
      counterpartyEmail: t.counterpartyEmail,
      instrument: t.instrument,
      quantity: t.quantity,
      state: t.state,
      currentOurPrice: t.currentOurPrice,
      currentTheirPrice: t.currentTheirPrice,
      rounds: t.rounds.length,
      totalConcessionGiven: t.totalConcessionGiven,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return apiSuccess(summary);
  } catch {
    return apiError('internal_error', 'Failed to retrieve threads', 500);
  }
}

export const GET = withAuth(handleGet);
