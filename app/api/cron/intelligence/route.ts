/**
 * GET /api/cron/intelligence
 *
 * Daily cron job (6am AEST via Vercel Cron).
 * Pipeline: data ingestion -> forecast generation -> monitoring
 *
 * Protected by CRON_SECRET to prevent unauthorized invocation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDailyIngestion } from '@/lib/market-intelligence/data-ingestion';
import { runMonitor } from '@/lib/market-intelligence/monitoring';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export const maxDuration = 300; // 5 minutes (Vercel Pro limit)

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const log: string[] = [];
  let hasError = false;

  // Step 1: Data ingestion
  log.push('[1/3] Running data ingestion...');
  try {
    const ingestion = await runDailyIngestion();
    log.push(ingestion.success
      ? `  Ingestion OK: ${ingestion.stdout.slice(-200)}`
      : `  Ingestion WARN: ${ingestion.stderr.slice(-200)}`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.push(`  Ingestion ERROR: ${msg}`);
    hasError = true;
  }

  // Step 2: Forecast generation
  log.push('[2/3] Running forecast generation...');
  try {
    const scriptPath = path.resolve(process.cwd(), 'forecasting', 'generate_forecast.py');
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, {
      timeout: 120_000,
      cwd: process.cwd(),
      env: { ...process.env, PYTHONPATH: process.cwd() },
    });
    log.push(`  Forecast OK: ${stdout.slice(-200)}`);
    if (stderr) log.push(`  Forecast stderr: ${stderr.slice(-200)}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.push(`  Forecast ERROR: ${msg}`);
    hasError = true;
  }

  // Step 3: Monitoring
  log.push('[3/3] Running monitoring...');
  try {
    const monitoring = await runMonitor();
    log.push(monitoring.success
      ? `  Monitoring OK: ${monitoring.stdout.slice(-200)}`
      : `  Monitoring WARN: ${monitoring.stderr.slice(-200)}`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.push(`  Monitoring ERROR: ${msg}`);
    hasError = true;
  }

  const duration = Date.now() - startTime;
  log.push(`\nCompleted in ${(duration / 1000).toFixed(1)}s`);

  // If there were errors, store a system alert
  if (hasError) {
    try {
      const { sql } = await import('@/lib/db/connection');
      await sql`
        INSERT INTO intelligence_alerts
          (alert_type, severity, title, summary, estimated_price_impact_pct,
           source, source_url, metadata, created_at)
        VALUES (
          'system', 'warning',
          'Cron job completed with errors',
          ${log.join('\n').slice(-500)},
          0, 'cron', '', '{}',
          NOW()
        )
      `;
    } catch {
      // DB not available — log only
    }
  }

  return NextResponse.json({
    status: hasError ? 'completed_with_errors' : 'success',
    duration_ms: duration,
    log,
  });
}
