/**
 * GET /api/v1/intelligence/counterfactual — counterfactual trade analysis report
 *
 * Returns the pre-computed counterfactual report showing how the model
 * would have performed on NMG's historical trades.
 *
 * Requires admin role.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import fs from 'fs';
import path from 'path';

async function handleGet(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user || user.role !== 'admin') {
    return apiError('forbidden', 'Admin role required', 403);
  }

  // Load pre-computed report from forecasting pipeline output
  const reportPath = path.join(
    process.cwd(),
    'forecasting',
    'data',
    'counterfactual_report.json'
  );

  try {
    if (!fs.existsSync(reportPath)) {
      return apiError(
        'not_found',
        'Counterfactual report not yet generated. Run the analysis pipeline first.',
        404
      );
    }

    const raw = fs.readFileSync(reportPath, 'utf-8');
    const report = JSON.parse(raw);

    return apiSuccess({
      report,
      generatedAt: fs.statSync(reportPath).mtime.toISOString(),
    });
  } catch (err) {
    return apiError(
      'internal_error',
      `Failed to load counterfactual report: ${err instanceof Error ? err.message : 'unknown'}`,
      500
    );
  }
}

export const GET = withAuth(handleGet, { roles: ['admin'] });
