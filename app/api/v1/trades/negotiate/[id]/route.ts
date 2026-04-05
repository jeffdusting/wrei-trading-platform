/**
 * GET  /api/v1/trades/negotiate/:id — negotiation status and transcript
 * POST /api/v1/trades/negotiate/:id — send a message / instruction
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateRequired } from '@/lib/api/validation';
import {
  getNegotiationById,
  updateNegotiationState,
} from '@/lib/db/queries/negotiations';
import { fireWebhook } from '@/lib/api/webhooks';

// ---------------------------------------------------------------------------
// GET — negotiation status
// ---------------------------------------------------------------------------

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
    const negotiation = await getNegotiationById(id);
    if (!negotiation) {
      return apiError('not_found', 'Negotiation not found', 404);
    }

    return apiSuccess({
      id: negotiation.id,
      personaType: negotiation.persona_type,
      instrument: negotiation.credit_type,
      phase: negotiation.phase,
      round: negotiation.round,
      anchorPrice: negotiation.anchor_price,
      currentOffer: negotiation.current_offer,
      priceFloor: negotiation.price_floor,
      totalConcession: negotiation.total_concession,
      outcome: negotiation.outcome,
      messages: negotiation.messages,
      startedAt: negotiation.started_at,
      completedAt: negotiation.completed_at,
    });
  } catch {
    return apiError('internal_error', 'Failed to retrieve negotiation', 500);
  }
}

// ---------------------------------------------------------------------------
// POST — send message / instruction
// ---------------------------------------------------------------------------

async function handlePost(
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

  const errors = validateRequired(body, ['message']);
  if (errors.length > 0) {
    return apiError('validation_error', errors.map(e => e.message).join('; '), 400);
  }

  try {
    const negotiation = await getNegotiationById(id);
    if (!negotiation) {
      return apiError('not_found', 'Negotiation not found', 404);
    }

    if (negotiation.outcome) {
      return apiError('validation_error', 'Negotiation has already concluded', 400);
    }

    const existingMessages = Array.isArray(negotiation.messages) ? negotiation.messages : [];
    const newMessage = {
      role: 'buyer',
      content: body.message as string,
      timestamp: new Date().toISOString(),
      source: 'api_v1',
    };

    const updated = await updateNegotiationState(id, {
      messages: [...existingMessages, newMessage],
      round: negotiation.round + 1,
    });

    if (updated?.outcome) {
      fireWebhook(user.organisationId, 'negotiation.completed', {
        negotiationId: id,
        outcome: updated.outcome,
      }).catch(() => {});
    }

    return apiSuccess({
      id: updated?.id,
      round: updated?.round,
      phase: updated?.phase,
      currentOffer: updated?.current_offer,
      totalConcession: updated?.total_concession,
      outcome: updated?.outcome,
      messageCount: Array.isArray(updated?.messages) ? updated.messages.length : 0,
    });
  } catch {
    return apiError('internal_error', 'Failed to process message', 500);
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost, { roles: ['admin', 'broker', 'trader'] });
