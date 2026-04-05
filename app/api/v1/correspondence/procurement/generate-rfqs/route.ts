/**
 * POST /api/v1/correspondence/procurement/generate-rfqs
 *
 * Generates AI-drafted RFQ emails for a specific procurement recommendation.
 * Requires broker or admin role.
 *
 * Body: { recommendation: ProcurementRecommendation, counterpartyIds?: string[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import type { ProcurementRecommendation } from '@/lib/correspondence/types';

async function handlePost(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json(
        { error: 'No organisation associated with account' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const recommendation = body.recommendation as ProcurementRecommendation | undefined;

    if (!recommendation?.clientId || !recommendation?.instrument || !recommendation?.shortfall) {
      return NextResponse.json(
        { error: 'Invalid recommendation: clientId, instrument, and shortfall are required' },
        { status: 400 }
      );
    }

    // Get counterparties — use demo set filtered by instrument
    const { getCounterpartiesForInstrument } = await import('@/lib/correspondence/seller-outreach');
    const { generateRFQBatch } = await import('@/lib/correspondence/seller-outreach');

    const counterparties = getCounterpartiesForInstrument(recommendation.instrument);
    if (counterparties.length === 0) {
      return NextResponse.json(
        { error: `No counterparties available for ${recommendation.instrument}` },
        { status: 404 }
      );
    }

    const result = await generateRFQBatch(recommendation, counterparties, {
      orgId: user.organisationId,
      userId: user.id,
    });

    return NextResponse.json({
      drafts: result.drafts,
      totalDrafts: result.drafts.length,
      totalTokensUsed: result.totalTokensUsed,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate RFQ drafts' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handlePost, { roles: ['admin', 'broker'] });
