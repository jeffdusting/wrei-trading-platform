/**
 * Market Intelligence Monitoring — TypeScript integration layer
 *
 * Bridges the Python monitoring pipeline with the Next.js application:
 *  - runMonitor()          — triggers Python run_monitor.py
 *  - getActiveAlerts()     — queries intelligence_alerts table
 *  - acknowledgeAlert()    — marks an alert as acknowledged
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { sql } from '@/lib/db/connection';

const execAsync = promisify(exec);

// ---------------------------------------------------------------------------
// Python pipeline execution
// ---------------------------------------------------------------------------

export async function runMonitor(): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
}> {
  const scriptPath = path.resolve(
    process.cwd(), 'forecasting', 'monitoring', 'run_monitor.py'
  );

  try {
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, {
      timeout: 180_000,
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONPATH: path.resolve(process.cwd()),
      },
    });
    return { success: true, stdout, stderr };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, stdout: '', stderr: message };
  }
}

// ---------------------------------------------------------------------------
// Alert queries
// ---------------------------------------------------------------------------

export interface IntelligenceAlert {
  id: number;
  alertType: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  summary: string;
  estimatedPriceImpactPct: number;
  source: string;
  sourceUrl: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  acknowledgedAt: string | null;
}

export async function getActiveAlerts(): Promise<IntelligenceAlert[]> {
  try {
    const { rows } = await sql`
      SELECT id, alert_type, severity, title, summary,
             estimated_price_impact_pct, source, source_url,
             metadata, created_at, acknowledged_at
      FROM intelligence_alerts
      WHERE acknowledged_at IS NULL
      ORDER BY
        CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END,
        created_at DESC
      LIMIT 50
    `;

    return rows.map(r => ({
      id: r.id,
      alertType: r.alert_type,
      severity: r.severity,
      title: r.title,
      summary: r.summary,
      estimatedPriceImpactPct: r.estimated_price_impact_pct
        ? Number(r.estimated_price_impact_pct) : 0,
      source: r.source,
      sourceUrl: r.source_url ?? '',
      metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata ?? {}),
      createdAt: r.created_at,
      acknowledgedAt: r.acknowledged_at,
    }));
  } catch {
    return [];
  }
}

export async function acknowledgeAlert(alertId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE intelligence_alerts
      SET acknowledged_at = NOW()
      WHERE id = ${alertId} AND acknowledged_at IS NULL
    `;
    return true;
  } catch {
    return false;
  }
}
