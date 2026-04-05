/**
 * GET    /api/v1/alerts       — list alert rules + recent events
 * POST   /api/v1/alerts       — create an alert rule
 * PUT    /api/v1/alerts       — update a rule (body.id required)
 * DELETE /api/v1/alerts?id=   — soft-delete a rule
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiCreated, apiError } from '@/lib/api/response';
import { validateRequired } from '@/lib/api/validation';
import {
  createAlertRule,
  listAlertRules,
  updateAlertRule,
  deleteAlertRule,
  getAlertEvents,
  acknowledgeAlert,
} from '@/lib/alerts/alert-engine';
import type { AlertType, AlertCondition } from '@/lib/alerts/types';

const VALID_TYPES: AlertType[] = [
  'price_cross', 'volume_threshold', 'compliance_deadline',
  'compliance_shortfall', 'settlement_status', 'feed_health',
];
const VALID_CONDITIONS: AlertCondition[] = ['above', 'below', 'equals', 'crosses'];

// ---------------------------------------------------------------------------
// GET — list rules + events
// ---------------------------------------------------------------------------

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user?.organisationId) {
    return apiError('forbidden', 'No organisation associated with account', 403);
  }

  const view = request.nextUrl.searchParams.get('view') ?? 'rules';

  try {
    if (view === 'events') {
      const unackedOnly = request.nextUrl.searchParams.get('unacknowledged') === 'true';
      const events = await getAlertEvents(user.organisationId, { unacknowledgedOnly: unackedOnly });
      return apiSuccess(events);
    }

    const rules = await listAlertRules(user.organisationId);
    return apiSuccess(rules);
  } catch {
    return apiError('internal_error', 'Failed to retrieve alerts', 500);
  }
}

// ---------------------------------------------------------------------------
// POST — create rule or acknowledge event
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

  // Acknowledge an event
  if (body.action === 'acknowledge' && body.event_id) {
    try {
      const ok = await acknowledgeAlert(Number(body.event_id), user.id);
      if (!ok) return apiError('not_found', 'Event not found or already acknowledged', 404);
      return apiSuccess({ acknowledged: true });
    } catch {
      return apiError('internal_error', 'Failed to acknowledge alert', 500);
    }
  }

  // Create a rule
  const errors = validateRequired(body, ['type', 'name', 'condition', 'threshold']);
  if (errors.length > 0) {
    return apiError('validation_error', errors.map(e => e.message).join('; '), 400);
  }

  const type = body.type as string;
  if (!VALID_TYPES.includes(type as AlertType)) {
    return apiError('validation_error', `type must be one of: ${VALID_TYPES.join(', ')}`, 400);
  }

  const condition = body.condition as string;
  if (!VALID_CONDITIONS.includes(condition as AlertCondition)) {
    return apiError('validation_error', `condition must be one of: ${VALID_CONDITIONS.join(', ')}`, 400);
  }

  const threshold = Number(body.threshold);
  if (isNaN(threshold)) {
    return apiError('validation_error', 'threshold must be a number', 400);
  }

  try {
    const rule = await createAlertRule({
      user_id: user.id,
      organisation_id: user.organisationId,
      type: type as AlertType,
      name: body.name as string,
      instrument: (body.instrument as string) ?? undefined,
      condition: condition as AlertCondition,
      threshold,
      metadata: (body.metadata as Record<string, unknown>) ?? {},
    });
    return apiCreated(rule);
  } catch {
    return apiError('internal_error', 'Failed to create alert rule', 500);
  }
}

// ---------------------------------------------------------------------------
// PUT — update rule
// ---------------------------------------------------------------------------

async function handlePut(request: NextRequest) {
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

  if (!body.id || typeof body.id !== 'string') {
    return apiError('validation_error', 'id is required', 400);
  }

  try {
    const rule = await updateAlertRule(body.id, user.organisationId, {
      name: body.name as string | undefined,
      condition: body.condition as AlertCondition | undefined,
      threshold: body.threshold != null ? Number(body.threshold) : undefined,
      is_active: body.is_active as boolean | undefined,
    });
    if (!rule) return apiError('not_found', 'Alert rule not found', 404);
    return apiSuccess(rule);
  } catch {
    return apiError('internal_error', 'Failed to update alert rule', 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE — soft-delete rule
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
    const ok = await deleteAlertRule(id, user.organisationId);
    if (!ok) return apiError('not_found', 'Alert rule not found', 404);
    return apiSuccess({ deleted: true });
  } catch {
    return apiError('internal_error', 'Failed to delete alert rule', 500);
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost, { roles: ['admin', 'broker', 'trader', 'compliance'] });
export const PUT = withAuth(handlePut, { roles: ['admin', 'broker', 'trader', 'compliance'] });
export const DELETE = withAuth(handleDelete, { roles: ['admin', 'broker'] });
