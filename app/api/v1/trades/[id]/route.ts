/**
 * GET /api/v1/trades/:id — trade detail with settlement timeline
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getTradeById } from '@/lib/db/queries/trades';
import { sql } from '@/lib/db/connection';

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
    const trade = await getTradeById(id);
    if (!trade) {
      return apiError('not_found', 'Trade not found', 404);
    }

    // Fetch settlement records for this trade
    let settlement = null;
    try {
      const { rows } = await sql`
        SELECT * FROM settlements WHERE trade_id = ${id} ORDER BY created_at DESC LIMIT 1
      `;
      if (rows.length > 0) settlement = rows[0];
    } catch {
      // settlements table may not have data yet
    }

    return apiSuccess({
      ...trade,
      settlement,
    });
  } catch {
    return apiError('internal_error', 'Failed to retrieve trade', 500);
  }
}

export const GET = withAuth(handleGet);
