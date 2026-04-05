/**
 * POST /api/v1/correspondence/inbound
 *
 * Receives forwarded/pasted email content from the broker, matches it to
 * an existing negotiation thread, parses the offer, and optionally drafts
 * a counter-offer for broker review.
 *
 * Initial implementation: broker pastes email content into the platform UI.
 * Future: direct inbox integration via SendGrid Inbound Parse or equivalent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import {
  getThread,
  getActiveThreads,
  processInboundOffer,
  generateCounterOffer,
} from '@/lib/correspondence/negotiation-manager';

interface InboundEmailPayload {
  threadId?: string;
  counterpartyEmail?: string;
  subject?: string;
  body: string;
}

async function handlePost(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json(
        { error: 'No organisation associated with account' },
        { status: 400 },
      );
    }

    const payload: InboundEmailPayload = await request.json();

    if (!payload.body || typeof payload.body !== 'string' || payload.body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email body is required' },
        { status: 400 },
      );
    }

    // --- Match to thread ---
    let threadId = payload.threadId;

    if (!threadId && payload.counterpartyEmail) {
      // Try to match by counterparty email
      const active = getActiveThreads(user.organisationId);
      const match = active.find(
        t => t.counterpartyEmail.toLowerCase() === payload.counterpartyEmail!.toLowerCase(),
      );
      if (match) threadId = match.id;
    }

    if (!threadId) {
      return NextResponse.json(
        { error: 'Could not match email to an active negotiation thread. Provide threadId or counterpartyEmail.' },
        { status: 404 },
      );
    }

    // Verify thread belongs to this org
    const thread = getThread(threadId);
    if (!thread || thread.organisationId !== user.organisationId) {
      return NextResponse.json(
        { error: 'Thread not found or access denied' },
        { status: 404 },
      );
    }

    // --- Process inbound offer ---
    const result = await processInboundOffer(threadId, payload.body, payload.subject);

    // --- Auto-generate counter if possible ---
    let counterOffer = null;
    if (result.autoCounterAvailable) {
      try {
        counterOffer = generateCounterOffer(threadId);
      } catch {
        // Counter generation may fail if constraints prevent it
      }
    }

    return NextResponse.json({
      threadId,
      state: result.thread.state,
      parsedOffer: result.parsedOffer,
      threatLevel: result.threatLevel,
      requiresManualReview: result.requiresManualReview,
      counterOffer: counterOffer ? {
        counterPrice: counterOffer.counterPrice,
        concessionThisRound: counterOffer.concessionThisRound,
        remainingRoom: counterOffer.remainingRoom,
        suggestedBody: counterOffer.suggestedBody,
        state: counterOffer.thread.state,
      } : null,
      round: result.thread.rounds.length,
      currentOurPrice: result.thread.currentOurPrice,
      currentTheirPrice: result.thread.currentTheirPrice,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const status = message.includes('not found') || message.includes('closed') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export const POST = withAuth(handlePost, { roles: ['admin', 'broker'] });
