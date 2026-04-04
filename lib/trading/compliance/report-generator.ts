// =============================================================================
// WREI Platform — Report Generator
//
// Generates exportable reports for compliance, audit, and trade history:
//   - Trade history CSV with all fields
//   - Compliance summary as PDF-styled HTML (surrender position, penalty, deadlines)
//   - Audit trail CSV for regulatory filing
//
// Called from: TradeBlotter export, compliance dashboard export
// =============================================================================

import type { AuditLogEntry } from './audit-logger';

// ---------------------------------------------------------------------------
// AI Disclosure — WP5 section 8.2
// ---------------------------------------------------------------------------

export const AI_DISCLOSURE_TEXT =
  'This trade was negotiated with the assistance of an AI-powered negotiation agent. ' +
  'The agent operates within defined price and volume constraints set by the platform ' +
  'and/or the counterparty. All negotiation transcripts are recorded and available for audit.';

// ---------------------------------------------------------------------------
// Trade Report — CSV
// ---------------------------------------------------------------------------

export interface TradeRecord {
  id: string;
  instrument_id: string;
  negotiation_id: string | null;
  direction: 'buy' | 'sell';
  quantity: number;
  price_per_unit: number;
  total_value: number;
  currency: string;
  buyer_persona: string | null;
  status: string;
  executed_at: string;
  settled_at: string | null;
  ai_assisted?: boolean;
}

const TRADE_CSV_HEADERS = [
  'Trade ID',
  'Instrument',
  'Direction',
  'Quantity',
  'Price Per Unit',
  'Total Value',
  'Currency',
  'Status',
  'Buyer Persona',
  'Negotiation ID',
  'AI Assisted',
  'Executed At',
  'Settled At',
];

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateTradeReportCsv(trades: TradeRecord[]): string {
  const rows = [TRADE_CSV_HEADERS.join(',')];

  for (const t of trades) {
    rows.push(
      [
        t.id,
        t.instrument_id,
        t.direction,
        String(t.quantity),
        t.price_per_unit.toFixed(2),
        t.total_value.toFixed(2),
        t.currency,
        t.status,
        t.buyer_persona ?? '',
        t.negotiation_id ?? '',
        t.ai_assisted !== false ? 'Yes' : 'No',
        t.executed_at,
        t.settled_at ?? '',
      ]
        .map(escapeCsvField)
        .join(','),
    );
  }

  // Append AI disclosure footer for trades that used AI
  const hasAiTrades = trades.some((t) => t.ai_assisted !== false);
  if (hasAiTrades) {
    rows.push('');
    rows.push(`"AI DISCLOSURE: ${AI_DISCLOSURE_TEXT}"`);
  }

  return rows.join('\n');
}

// ---------------------------------------------------------------------------
// Audit Trail — CSV
// ---------------------------------------------------------------------------

const AUDIT_CSV_HEADERS = [
  'Timestamp',
  'Action Type',
  'User ID',
  'Instrument ID',
  'Instrument Type',
  'Session ID',
  'Entity ID',
  'AI Assisted',
  'Details',
];

export function generateAuditExportCsv(entries: AuditLogEntry[]): string {
  const rows = [AUDIT_CSV_HEADERS.join(',')];

  for (const e of entries) {
    const isAiAssisted =
      e.actionType.startsWith('negotiation_') ||
      (e.details && (e.details as Record<string, unknown>).aiAssisted === true);

    rows.push(
      [
        e.timestamp,
        e.actionType,
        e.userId ?? 'system',
        e.instrumentId ?? '',
        e.instrumentType ?? '',
        e.sessionId ?? '',
        e.entityId ?? '',
        isAiAssisted ? 'Yes' : 'No',
        escapeCsvField(JSON.stringify(e.details ?? {})),
      ]
        .map(escapeCsvField)
        .join(','),
    );
  }

  return rows.join('\n');
}

// ---------------------------------------------------------------------------
// Compliance Summary — PDF-styled HTML
// ---------------------------------------------------------------------------

export interface CompliancePosition {
  entity: string;
  target: number;
  surrendered: number;
  held: number;
  shortfall: number;
  penaltyExposure: number;
  deadline: string;
  status: 'on_track' | 'at_risk';
}

export function generateComplianceSummaryHtml(
  positions: CompliancePosition[],
  opts: { penaltyRate: number; reportDate?: string } = { penaltyRate: 29.48 },
): string {
  const reportDate = opts.reportDate ?? new Date().toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const totalTarget = positions.reduce((s, p) => s + p.target, 0);
  const totalSurrendered = positions.reduce((s, p) => s + p.surrendered, 0);
  const totalHeld = positions.reduce((s, p) => s + p.held, 0);
  const totalShortfall = positions.reduce((s, p) => s + p.shortfall, 0);
  const totalPenalty = positions.reduce((s, p) => s + p.penaltyExposure, 0);

  const positionRows = positions
    .map(
      (p) => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0">${p.entity}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace">${p.target.toLocaleString()}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace">${p.surrendered.toLocaleString()}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace">${p.held.toLocaleString()}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;color:${p.shortfall > 0 ? '#ef4444' : '#10b981'}">${p.shortfall.toLocaleString()}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;color:${p.penaltyExposure > 0 ? '#ef4444' : '#10b981'}">A$${p.penaltyExposure.toLocaleString()}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0">${p.deadline}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0">
          <span style="padding:2px 8px;border-radius:4px;font-size:11px;background:${p.status === 'at_risk' ? '#fef2f2' : '#f0fdf4'};color:${p.status === 'at_risk' ? '#dc2626' : '#16a34a'}">${p.status === 'at_risk' ? 'At Risk' : 'On Track'}</span>
        </td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>WREI Compliance Summary — ${reportDate}</title>
<style>
  body { font-family: Inter, -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 40px; }
  @media print { body { padding: 20px; } @page { size: A4; margin: 15mm; } }
  h1 { font-size: 18px; margin: 0 0 4px 0; }
  h2 { font-size: 14px; margin: 24px 0 8px 0; color: #475569; }
  .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 24px; }
  .meta { font-size: 12px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { padding: 8px 12px; text-align: left; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #64748b; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .summary-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
  .summary-card .label { font-size: 11px; color: #64748b; }
  .summary-card .value { font-size: 20px; font-weight: 600; font-family: monospace; margin-top: 4px; }
  .disclosure { margin-top: 24px; padding: 12px; border: 1px solid #fbbf24; border-radius: 6px; background: #fffbeb; font-size: 11px; color: #92400e; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <h1>WREI Platform — ESS Compliance Summary</h1>
    <div class="meta">Report Date: ${reportDate} | ESC Penalty Rate: A$${opts.penaltyRate.toFixed(2)} (Source: IPART Targets and Penalties)</div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Total Target</div>
      <div class="value">${totalTarget.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Surrendered</div>
      <div class="value">${totalSurrendered.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Held</div>
      <div class="value">${totalHeld.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="label">Penalty Exposure</div>
      <div class="value" style="color:${totalPenalty > 0 ? '#ef4444' : '#10b981'}">A$${totalPenalty.toLocaleString()}</div>
    </div>
  </div>

  <h2>Obligated Entity Positions</h2>
  <table>
    <thead>
      <tr>
        <th>Entity</th><th style="text-align:right">Target</th><th style="text-align:right">Surrendered</th>
        <th style="text-align:right">Held</th><th style="text-align:right">Shortfall</th>
        <th style="text-align:right">Penalty Exposure</th><th>Deadline</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${positionRows}
      <tr style="font-weight:600;background:#f8fafc">
        <td style="padding:8px 12px">Total</td>
        <td style="padding:8px 12px;text-align:right;font-family:monospace">${totalTarget.toLocaleString()}</td>
        <td style="padding:8px 12px;text-align:right;font-family:monospace">${totalSurrendered.toLocaleString()}</td>
        <td style="padding:8px 12px;text-align:right;font-family:monospace">${totalHeld.toLocaleString()}</td>
        <td style="padding:8px 12px;text-align:right;font-family:monospace;color:${totalShortfall > 0 ? '#ef4444' : '#10b981'}">${totalShortfall.toLocaleString()}</td>
        <td style="padding:8px 12px;text-align:right;font-family:monospace;color:${totalPenalty > 0 ? '#ef4444' : '#10b981'}">A$${totalPenalty.toLocaleString()}</td>
        <td colspan="2"></td>
      </tr>
    </tbody>
  </table>

  <div class="disclosure">
    <strong>AI Disclosure:</strong> ${AI_DISCLOSURE_TEXT}
  </div>

  <div class="footer">
    Generated by WREI Trading Platform | ${reportDate} | Confidential — for regulatory and audit purposes only
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Download helpers (browser-side)
// ---------------------------------------------------------------------------

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadHtml(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
