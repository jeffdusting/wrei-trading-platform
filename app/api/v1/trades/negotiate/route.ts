/**
 * POST /api/v1/trades/negotiate — initiate an AI-powered negotiation via API
 *
 * Creates a new negotiation session using the instrument pricing engine
 * and returns the session ID with the opening message.
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiCreated, apiError } from '@/lib/api/response';
import { validateRequired, validateInstrumentType } from '@/lib/api/validation';
import { resolveInstrumentPricing } from '@/lib/trading/instruments/pricing-engine';
import { createNegotiation } from '@/lib/db/queries/negotiations';
import { writeAuditEntry } from '@/lib/db/queries/audit-log';
import { fireWebhook } from '@/lib/api/webhooks';

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

  const errors = validateRequired(body, ['instrument', 'persona_type']);
  if (errors.length > 0) {
    return apiError('validation_error', errors.map(e => e.message).join('; '), 400);
  }

  const instrumentCheck = validateInstrumentType(body.instrument as string);
  if (!instrumentCheck.valid) {
    return apiError('validation_error', instrumentCheck.error.message, 400);
  }

  const quantity = body.quantity ? Number(body.quantity) : undefined;
  if (quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
    return apiError('validation_error', 'quantity must be a positive number', 400);
  }

  const resolved = resolveInstrumentPricing(instrumentCheck.type, undefined, quantity);

  const validPersonas = [
    'corporate_compliance',
    'esg_fund',
    'trading_desk',
    'sustainability_director',
    'government_procurement',
    'free_play',
  ];
  const personaType = body.persona_type as string;
  if (!validPersonas.includes(personaType)) {
    return apiError(
      'validation_error',
      `Invalid persona_type. Valid: ${validPersonas.join(', ')}`,
      400,
    );
  }

  try {
    const negotiation = await createNegotiation({
      persona_type: personaType,
      credit_type: body.credit_type as string ?? 'carbon',
      token_type: body.token_type as string ?? 'carbon_credits',
      anchor_price: resolved.effectiveAnchor,
      current_offer: resolved.effectiveAnchor,
      price_floor: resolved.priceFloor,
      buyer_profile: {
        instrument: instrumentCheck.type,
        quantity: quantity ?? 1000,
        organisation_id: user.organisationId,
        initiated_via: 'api_v1',
        ...(body.buyer_profile as Record<string, unknown> ?? {}),
      },
    });

    await writeAuditEntry({
      entity_type: 'negotiation',
      entity_id: negotiation.id,
      action: 'negotiation.initiated',
      actor: user.email,
      details: {
        instrument: instrumentCheck.type,
        persona: personaType,
        anchor: resolved.effectiveAnchor,
        source: 'api_v1',
      },
    }).catch(() => {});

    return apiCreated({
      id: negotiation.id,
      instrument: instrumentCheck.type,
      personaType: negotiation.persona_type,
      anchorPrice: negotiation.anchor_price,
      currentOffer: negotiation.current_offer,
      priceFloor: negotiation.price_floor,
      phase: negotiation.phase,
      round: negotiation.round,
      status: 'active',
      pricing: {
        currency: resolved.currency,
        unitOfMeasure: resolved.unitOfMeasure,
        volumeDiscount: resolved.volumeDiscount,
        maxConcessionPerRound: resolved.maxConcessionPerRound,
        maxTotalConcession: resolved.maxTotalConcession,
      },
      startedAt: negotiation.started_at,
    });
  } catch {
    return apiError('internal_error', 'Failed to create negotiation', 500);
  }
}

export const POST = withAuth(handlePost, { roles: ['admin', 'broker', 'trader'] });
