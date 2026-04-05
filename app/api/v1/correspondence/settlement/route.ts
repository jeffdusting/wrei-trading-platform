/**
 * GET /api/v1/correspondence/settlement
 *
 * Settlement status for pending trades, with TESSA instruction links
 * where applicable. Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { sql } from '@/lib/db/connection';

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  try {
    // Fetch trades with their settlement records that are not yet fully settled
    const { rows } = await sql`
      SELECT
        t.id AS trade_id,
        t.instrument_id,
        t.direction,
        t.quantity,
        t.price_per_unit,
        t.total_value,
        t.currency,
        t.status AS trade_status,
        t.executed_at,
        s.id AS settlement_id,
        s.method AS settlement_method,
        s.status AS settlement_status,
        s.blockchain_hash,
        s.settled_at,
        s.metadata AS settlement_metadata
      FROM trades t
      LEFT JOIN settlements s ON s.trade_id = t.id
      WHERE t.status IN ('pending', 'confirmed')
      ORDER BY t.executed_at DESC
      LIMIT 100
    `;

    const settlements = rows.map((row: Record<string, unknown>) => ({
      tradeId: row.trade_id,
      instrumentId: row.instrument_id,
      direction: row.direction,
      quantity: row.quantity,
      pricePerUnit: row.price_per_unit,
      totalValue: row.total_value,
      currency: row.currency,
      tradeStatus: row.trade_status,
      executedAt: row.executed_at,
      settlement: row.settlement_id ? {
        id: row.settlement_id,
        method: row.settlement_method,
        status: row.settlement_status,
        blockchainHash: row.blockchain_hash,
        settledAt: row.settled_at,
        metadata: row.settlement_metadata,
      } : null,
    }));

    const pending = settlements.filter(s => !s.settlement || s.settlement.status === 'pending');
    const processing = settlements.filter(s => s.settlement?.status === 'processing');

    return apiSuccess({
      settlements,
      summary: {
        total: settlements.length,
        pending: pending.length,
        processing: processing.length,
      },
    });
  } catch {
    return apiError('internal_error', 'Failed to retrieve settlement status', 500);
  }
}

export const GET = withAuth(handleGet);
