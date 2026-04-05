/**
 * GET /api/v1/correspondence/procurement
 *
 * Returns current procurement recommendations for all clients in the
 * authenticated user's organisation. Requires broker or admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';

async function handleGet(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user?.organisationId) {
      return NextResponse.json(
        { error: 'No organisation associated with account' },
        { status: 400 }
      );
    }

    const { evaluateClientNeeds } = await import('@/lib/correspondence/procurement-trigger');
    const recommendations = await evaluateClientNeeds(user.organisationId);

    return NextResponse.json({
      recommendations,
      total: recommendations.length,
      byRisk: {
        red: recommendations.filter(r => r.riskLevel === 'red').length,
        amber: recommendations.filter(r => r.riskLevel === 'amber').length,
        green: recommendations.filter(r => r.riskLevel === 'green').length,
      },
    });
  } catch {
    return NextResponse.json(
      { recommendations: [], total: 0, error: 'Database unavailable' },
      { status: 200 }
    );
  }
}

export const GET = withAuth(handleGet, { roles: ['admin', 'broker'] });
