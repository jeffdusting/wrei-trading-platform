/**
 * GET  /api/v1/correspondence/threads/:id — thread detail with all rounds
 * POST /api/v1/correspondence/threads/:id — submit broker action (approve/edit/reject)
 *
 * Requires API key authentication. Organisation-scoped.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { validateRequired } from '@/lib/api/validation';
import { getThread, approveCounter, rejectOffer } from '@/lib/correspondence/negotiation-manager';
import { updateCorrespondenceStatus } from '@/lib/db/queries/correspondence';

// ---------------------------------------------------------------------------
// GET — full thread detail
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
    const thread = getThread(id);
    if (!thread || thread.organisationId !== user.organisationId) {
      return apiError('not_found', 'Thread not found', 404);
    }

    return apiSuccess(thread);
  } catch {
    return apiError('internal_error', 'Failed to retrieve thread', 500);
  }
}

// ---------------------------------------------------------------------------
// POST — broker action: approve, edit, or reject a drafted counter-offer
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

  const errors = validateRequired(body, ['action']);
  if (errors.length > 0) {
    return apiError('validation_error', errors.map(e => e.message).join('; '), 400);
  }

  const action = body.action as string;
  if (!['approve', 'edit', 'reject'].includes(action)) {
    return apiError('validation_error', 'action must be "approve", "edit", or "reject"', 400);
  }

  try {
    const thread = getThread(id);
    if (!thread || thread.organisationId !== user.organisationId) {
      return apiError('not_found', 'Thread not found', 404);
    }

    if (action === 'approve') {
      const result = approveCounter(id);
      return apiSuccess({
        threadId: id,
        state: result.state,
        message: 'Counter-offer approved and ready to send',
      });
    }

    if (action === 'reject') {
      const reason = (body.reason as string) ?? 'Broker rejected via API';
      const result = rejectOffer(id, reason);

      // Also update the correspondence record if a correspondence_id is provided
      if (body.correspondence_id) {
        await updateCorrespondenceStatus(
          body.correspondence_id as string,
          user.organisationId,
          'rejected',
          { rejectionReason: reason },
        ).catch(() => {});
      }

      return apiSuccess({
        threadId: id,
        state: result.state,
        message: 'Counter-offer rejected',
      });
    }

    // action === 'edit'
    if (!body.edited_body || typeof body.edited_body !== 'string') {
      return apiError('validation_error', 'edited_body is required for edit action', 400);
    }

    // Update correspondence with edited body if correspondence_id provided
    if (body.correspondence_id) {
      await updateCorrespondenceStatus(
        body.correspondence_id as string,
        user.organisationId,
        'approved',
        { body: body.edited_body as string },
      ).catch(() => {});
    }

    return apiSuccess({
      threadId: id,
      state: thread.state,
      message: 'Draft updated with edits',
    });
  } catch {
    return apiError('internal_error', 'Failed to process action', 500);
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost, { roles: ['admin', 'broker'] });
