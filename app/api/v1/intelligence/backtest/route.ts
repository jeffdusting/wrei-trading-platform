/**
 * GET /api/v1/intelligence/backtest
 *
 * Returns the latest backtest results for the forecasting model.
 *
 * Response includes: MAPE, directional accuracy, decision value at each
 * horizon, benchmark comparisons, coverage metrics, regime-specific
 * performance.
 *
 * Requires API key authentication.
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { apiSuccess } from '@/lib/api/response';
import { sql } from '@/lib/db/connection';
import fs from 'fs';
import path from 'path';

async function handleGet() {
  // First try the database
  try {
    const { rows } = await sql`
      SELECT run_at, model_version, test_period_start, test_period_end,
             horizon_weeks, mape, directional_accuracy, decision_value,
             coverage_80, coverage_95,
             benchmark_mape_naive, benchmark_mape_sma, metadata
      FROM backtest_results
      WHERE run_at = (SELECT MAX(run_at) FROM backtest_results)
      ORDER BY horizon_weeks ASC
    `;

    if (rows.length > 0) {
      return apiSuccess(formatDbResults(rows));
    }
  } catch {
    // DB not available — fall through to JSON file
  }

  // Fallback: read from the static JSON results file
  try {
    const resultsPath = path.resolve(
      process.cwd(), 'forecasting', 'backtesting', 'results.json'
    );
    const raw = fs.readFileSync(resultsPath, 'utf-8');
    const data = JSON.parse(raw);
    return apiSuccess(data);
  } catch {
    return apiSuccess({
      message: 'No backtest results available. Run the backtesting framework first.',
      results: [],
    });
  }
}

function formatDbResults(rows: Array<Record<string, unknown>>) {
  const horizonResults = rows.map(r => ({
    horizonWeeks: r.horizon_weeks,
    mape: r.mape ? Number(r.mape) : null,
    directionalAccuracy: r.directional_accuracy ? Number(r.directional_accuracy) : null,
    decisionValue: r.decision_value ? Number(r.decision_value) : null,
    coverage80: r.coverage_80 ? Number(r.coverage_80) : null,
    coverage95: r.coverage_95 ? Number(r.coverage_95) : null,
    benchmarks: {
      mapeNaive: r.benchmark_mape_naive ? Number(r.benchmark_mape_naive) : null,
      mapeSma: r.benchmark_mape_sma ? Number(r.benchmark_mape_sma) : null,
    },
    metadata: r.metadata,
  }));

  return {
    runAt: rows[0].run_at,
    modelVersion: rows[0].model_version,
    testPeriod: {
      start: rows[0].test_period_start,
      end: rows[0].test_period_end,
    },
    results: horizonResults,
  };
}

export const GET = withAuth(handleGet);
