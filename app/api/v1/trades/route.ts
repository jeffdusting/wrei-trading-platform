/**
 * GET  /api/v1/trades — list trades for the authenticated organisation
 * POST /api/v1/trades — create a trade record (manual entry)
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiCreated, apiError, apiPaginated } from '@/lib/api/response';
import { validateRequired, validatePagination, validateInstrumentType } from '@/lib/api/validation';
import { listTrades, createTrade } from '@/lib/db/queries/trades';
import { sql } from '@/lib/db/connection';
import { writeAuditEntry } from '@/lib/db/queries/audit-log';
import { fireWebhook } from '@/lib/api/webhooks';

// ---------------------------------------------------------------------------
// GET — list trades
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  const pag = validatePagination(request.nextUrl.searchParams);
  if (!pag.valid) {
    return apiError('validation_error', pag.error.message, 400);
  }

  const { page, limit, offset } = pag.params;
  const status = request.nextUrl.searchParams.get('status') ?? undefined;
  const instrumentId = request.nextUrl.searchParams.get('instrument_id') ?? undefined;

  try {
    const trades = await listTrades({ status, instrument_id: instrumentId, limit, offset });

    // Count total for pagination
    const { rows: countRows } = await sql`SELECT COUNT(*)::int AS total FROM trades`;
    const total = (countRows[0] as { total: number }).total;

    return apiPaginated(trades, page, limit, total);
  } catch {
    return apiError('internal_error', 'Failed to retrieve trades', 500);
  }
}

// ---------------------------------------------------------------------------
// POST — create trade
// ---------------------------------------------------------------------------

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

  const errors = validateRequired(body, ['instrument_id', 'direction', 'quantity', 'price_per_unit']);
  if (errors.length > 0) {
    return apiError('validation_error', errors.map(e => e.message).join('; '), 400);
  }

  const direction = body.direction as string;
  if (direction !== 'buy' && direction !== 'sell') {
    return apiError('validation_error', 'direction must be "buy" or "sell"', 400);
  }

  const quantity = Number(body.quantity);
  const pricePerUnit = Number(body.price_per_unit);
  if (isNaN(quantity) || quantity <= 0) {
    return apiError('validation_error', 'quantity must be a positive number', 400);
  }
  if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
    return apiError('validation_error', 'price_per_unit must be a positive number', 400);
  }

  try {
    const trade = await createTrade({
      instrument_id: body.instrument_id as string,
      direction,
      quantity,
      price_per_unit: pricePerUnit,
      currency: (body.currency as string) ?? 'AUD',
      buyer_persona: (body.buyer_persona as string) ?? undefined,
      metadata: {
        ...(body.metadata as Record<string, unknown> ?? {}),
        organisation_id: user.organisationId,
        created_via: 'api_v1',
      },
    });

    await writeAuditEntry({
      entity_type: 'trade',
      entity_id: trade.id,
      action: 'trade.created',
      actor: user.email,
      details: { direction, quantity, price_per_unit: pricePerUnit, source: 'api_v1' },
    }).catch(() => {});

    fireWebhook(user.organisationId, 'trade.created', trade).catch(() => {});

    return apiCreated(trade);
  } catch {
    return apiError('internal_error', 'Failed to create trade', 500);
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost, { roles: ['admin', 'broker', 'trader'] });
