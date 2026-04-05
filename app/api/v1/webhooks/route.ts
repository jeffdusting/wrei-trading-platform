/**
 * GET    /api/v1/webhooks — list registered webhooks
 * POST   /api/v1/webhooks — register a new webhook
 * DELETE /api/v1/webhooks — deregister a webhook (requires ?id=...)
 *
 * Requires API key authentication. Organisation-scoped.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiCreated, apiError } from '@/lib/api/response';
import { validateRequired } from '@/lib/api/validation';
import {
  listWebhooks,
  registerWebhook,
  deleteWebhook,
  VALID_WEBHOOK_EVENTS,
  type WebhookEvent,
} from '@/lib/api/webhooks';

// ---------------------------------------------------------------------------
// GET — list webhooks
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  try {
    const webhooks = await listWebhooks(user.organisationId);
    // Strip secrets from response
    const safe = webhooks.map(({ secret: _s, ...rest }) => rest);
    return apiSuccess(safe);
  } catch {
    return apiError('internal_error', 'Failed to retrieve webhooks', 500);
  }
}

// ---------------------------------------------------------------------------
// POST — register webhook
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

  const errors = validateRequired(body, ['url', 'events']);
  if (errors.length > 0) {
    return apiError('validation_error', errors.map(e => e.message).join('; '), 400);
  }

  const url = body.url as string;
  try {
    new URL(url);
  } catch {
    return apiError('validation_error', 'url must be a valid URL', 400);
  }

  const events = body.events as string[];
  if (!Array.isArray(events) || events.length === 0) {
    return apiError('validation_error', 'events must be a non-empty array', 400);
  }

  const invalid = events.filter(e => !VALID_WEBHOOK_EVENTS.includes(e as WebhookEvent));
  if (invalid.length > 0) {
    return apiError(
      'validation_error',
      `Invalid events: ${invalid.join(', ')}. Valid: ${VALID_WEBHOOK_EVENTS.join(', ')}`,
      400,
    );
  }

  try {
    const webhook = await registerWebhook(
      user.organisationId,
      url,
      events as WebhookEvent[],
    );

    return apiCreated({
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret, // Returned once on creation for client to store
      isActive: webhook.is_active,
      createdAt: webhook.created_at,
    });
  } catch {
    return apiError('internal_error', 'Failed to register webhook', 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE — deregister webhook
// ---------------------------------------------------------------------------

async function handleDelete(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return apiError('validation_error', 'id query parameter is required', 400);
  }

  try {
    const deleted = await deleteWebhook(id, user.organisationId);
    if (!deleted) {
      return apiError('not_found', 'Webhook not found', 404);
    }
    return apiSuccess({ id, deleted: true });
  } catch {
    return apiError('internal_error', 'Failed to delete webhook', 500);
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost, { roles: ['admin', 'broker'] });
export const DELETE = withAuth(handleDelete, { roles: ['admin', 'broker'] });
