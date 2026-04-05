/**
 * GET /api/v1/intelligence/alerts — list active intelligence alerts
 * POST /api/v1/intelligence/alerts — acknowledge an alert
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { getActiveAlerts, acknowledgeAlert } from '@/lib/market-intelligence/monitoring';

async function handleGet() {
  const alerts = await getActiveAlerts();
  return apiSuccess({
    alerts,
    total: alerts.length,
  });
}

async function handlePost(request: NextRequest) {
  let body: { alertId?: number };
  try {
    body = await request.json();
  } catch {
    return apiError('validation_error', 'Invalid JSON body', 400);
  }

  const alertId = body.alertId;
  if (!alertId || typeof alertId !== 'number') {
    return apiError('validation_error', 'alertId (number) is required', 400);
  }

  const success = await acknowledgeAlert(alertId);
  if (!success) {
    return apiError(
      'internal_error',
      'Failed to acknowledge alert — it may already be acknowledged or DB unavailable',
      500
    );
  }

  return apiSuccess({ acknowledged: true, alertId });
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
