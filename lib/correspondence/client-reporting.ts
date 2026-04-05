/**
 * Client Reporting — generates AI-drafted compliance position reports
 * for broker clients. Reports are data-driven: the AI summarises and
 * contextualises structured data, it does not invent numbers.
 *
 * Output: { subject, body (email-ready HTML), attachmentHTML (printable report) }
 */

import { routeAIRequest } from '@/lib/ai/ai-service-router';
import { buildReportGeneratorPrompt } from '@/lib/ai/prompts/system-prompts';
import { buildIntelligenceReportPrompt, type IntelligenceReportContext } from './prompts/intelligence-report-prompt';
import { fetchLatestForecast, type ForecastResponse } from './procurement-trigger';
import { getWhiteLabelConfig } from '@/lib/config/white-label';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClientPositionData {
  clientId: string;
  clientName: string;
  entityType: string;
  contactEmail: string | null;
  holdings: HoldingSummary[];
  surrenderProgress: SurrenderSummary[];
  recentTrades: TradeSummary[];
  penaltyExposure: number;
}

export interface HoldingSummary {
  instrument: string;
  quantity: number;
  averageCost: number | null;
  vintage: string | null;
  status: string;
}

export interface SurrenderSummary {
  scheme: string;
  complianceYear: string;
  target: number;
  surrendered: number;
  shortfall: number;
  penaltyRate: number | null;
  penaltyExposure: number | null;
  deadline: string | null;
  status: string;
}

export interface TradeSummary {
  date: string;
  instrument: string;
  quantity: number;
  price: number;
  direction: 'buy' | 'sell';
}

export interface ClientReport {
  id: string;
  clientId: string;
  clientName: string;
  period: string;
  subject: string;
  body: string;
  attachmentHTML: string;
  generatedAt: string;
  status: 'draft' | 'reviewed' | 'sent';
  sentAt: string | null;
}

// ---------------------------------------------------------------------------
// In-memory report store (production: database)
// ---------------------------------------------------------------------------

const reportStore = new Map<string, ClientReport>();
let reportCounter = 0;

// ---------------------------------------------------------------------------
// Market context for commentary (demo values)
// ---------------------------------------------------------------------------

const MARKET_CONTEXT = {
  escSpot: 29.48,
  veecSpot: 58.50,
  accuSpot: 32.00,
  escTrend: 'stable' as const,
  veecTrend: 'rising' as const,
  supplyOutlook: 'Tightening supply expected in Q3 as compliance deadlines approach.',
};

// ---------------------------------------------------------------------------
// Forecast-enhanced market intelligence (P11-B.2)
// ---------------------------------------------------------------------------

interface MarketIntelligenceSection {
  marketOutlook: string;
  recommendedActions: string;
  forecastData: {
    currentSpot: number;
    forecast1m: number;
    forecast3m: number;
    forecast6m: number;
    confidence: number;
    direction: 'bullish' | 'neutral' | 'bearish';
  };
}

async function generateMarketIntelligence(
  data: ClientPositionData,
  opts?: { userId?: string; organisationId?: string }
): Promise<MarketIntelligenceSection | null> {
  const forecast = await fetchLatestForecast('ESC');
  const branding = getWhiteLabelConfig();

  const currentSpot = forecast.currentSpot;
  const fc4w = forecast.forecasts.find(f => f.horizonWeeks === 4);
  const fc12w = forecast.forecasts.find(f => f.horizonWeeks === 12);
  const fc26w = forecast.forecasts.find(f => f.horizonWeeks === 26);

  const forecast1m = fc4w?.priceForecast ?? currentSpot;
  const forecast3m = fc12w?.priceForecast ?? currentSpot;
  const forecast6m = fc26w?.priceForecast ?? currentSpot;
  const ci80Lower3m = fc12w?.confidenceIntervals.ci80.lower ?? forecast3m * 0.9;
  const ci80Upper3m = fc12w?.confidenceIntervals.ci80.upper ?? forecast3m * 1.1;

  const ciWidth = ci80Upper3m - ci80Lower3m;
  const confidence = Math.max(0.3, Math.min(0.95, 1 - (ciWidth / forecast3m)));

  const direction: 'bullish' | 'neutral' | 'bearish' =
    forecast3m > currentSpot + 0.50 ? 'bullish'
    : forecast3m < currentSpot - 0.50 ? 'bearish'
    : 'neutral';

  // Client shortfall context
  const totalShortfall = data.surrenderProgress.reduce((sum, s) => sum + s.shortfall, 0);
  const nearestDeadline = data.surrenderProgress
    .filter(s => s.deadline)
    .map(s => {
      const d = new Date(s.deadline!);
      return Math.max(0, Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    })
    .sort((a, b) => a - b)[0] ?? 365;

  const timingSignal = direction === 'bullish'
    ? 'BUY NOW — price forecast to rise'
    : direction === 'bearish'
      ? 'WAIT — price forecast to soften'
      : 'MARKET — current price is fair value';

  const ctx: IntelligenceReportContext = {
    brokerName: branding.businessName,
    currentSpot,
    spotTrend30d: MARKET_CONTEXT.escTrend,
    forecast1m,
    forecast3m,
    forecast6m,
    forecastConfidence: confidence,
    ci80Lower3m,
    ci80Upper3m,
    creationVelocityTrend: 'stable',
    activityMixNotes: 'Residential HVAC and commercial lighting upgrades remain dominant activities',
    commercialLightingImpact: 'Commercial lighting phase-out reducing creation volume by ~12% annually',
    policyEvents: [
      'ESS Rule Change 2026 consultation closing June 2026',
      'IPART annual energy savings target review in progress',
    ],
    surplusRunwayWeeks: 18,
    clientShortfall: totalShortfall,
    clientDeadlineDays: nearestDeadline,
    timingSignal,
  };

  try {
    const result = await routeAIRequest({
      capability: 'report_generator',
      userId: opts?.userId,
      organisationId: opts?.organisationId,
      input: {
        systemPrompt: buildIntelligenceReportPrompt(ctx),
        messages: [{ role: 'user', content: 'Generate the Market Outlook and Recommended Actions sections.' }],
      },
    });

    if (result.ok) {
      const output = result.response.output;
      const outlookMatch = output.match(/MARKET_OUTLOOK:\s*([\s\S]*?)(?=RECOMMENDED_ACTIONS:|$)/i);
      const actionsMatch = output.match(/RECOMMENDED_ACTIONS:\s*([\s\S]*?)$/i);

      return {
        marketOutlook: outlookMatch?.[1]?.trim() || buildFallbackOutlook(ctx),
        recommendedActions: actionsMatch?.[1]?.trim() || buildFallbackActions(ctx),
        forecastData: { currentSpot, forecast1m, forecast3m, forecast6m, confidence, direction },
      };
    }
  } catch {
    // Fall through to template
  }

  return {
    marketOutlook: buildFallbackOutlook(ctx),
    recommendedActions: buildFallbackActions(ctx),
    forecastData: { currentSpot, forecast1m, forecast3m, forecast6m, confidence, direction },
  };
}

function buildFallbackOutlook(ctx: IntelligenceReportContext): string {
  return `ESC certificates are currently trading at A$${ctx.currentSpot.toFixed(2)} with a ${ctx.spotTrend30d} 30-day trend. ` +
    `Our model forecasts A$${ctx.forecast3m.toFixed(2)} at the 3-month horizon (80% confidence interval: A$${ctx.ci80Lower3m.toFixed(2)} — A$${ctx.ci80Upper3m.toFixed(2)}), ` +
    `indicating a ${ctx.forecast3m > ctx.currentSpot + 0.50 ? 'bullish' : ctx.forecast3m < ctx.currentSpot - 0.50 ? 'bearish' : 'neutral'} outlook. ` +
    `${ctx.commercialLightingImpact}. Creation velocity is ${ctx.creationVelocityTrend}.`;
}

function buildFallbackActions(ctx: IntelligenceReportContext): string {
  if (ctx.clientShortfall === 0) {
    return 'No immediate procurement action required. We recommend monitoring the market for opportunistic buying if prices soften.';
  }
  if (ctx.clientDeadlineDays < 30) {
    return `Urgent: We recommend procuring ${ctx.clientShortfall.toLocaleString()} certificates immediately — only ${ctx.clientDeadlineDays} days to surrender deadline.`;
  }
  if (ctx.forecast3m > ctx.currentSpot + 0.50) {
    return `Based on our bullish price outlook, we recommend procuring ${ctx.clientShortfall.toLocaleString()} certificates at current levels before the anticipated price increase.`;
  }
  return `We recommend splitting procurement of ${ctx.clientShortfall.toLocaleString()} certificates across the next 3 months to average into the market.`;
}

// ---------------------------------------------------------------------------
// Generate a single client position report
// ---------------------------------------------------------------------------

export async function generateClientPositionReport(
  data: ClientPositionData,
  period?: string,
  opts?: { userId?: string; organisationId?: string }
): Promise<ClientReport> {
  const reportPeriod = period ?? new Date().toISOString().slice(0, 7); // YYYY-MM
  const reportId = `rpt-${Date.now()}-${++reportCounter}`;

  // Build the data section for the AI — structured facts, not prose
  const holdingsText = data.holdings.length > 0
    ? data.holdings.map(h =>
        `${h.instrument}: ${h.quantity.toLocaleString()} units${h.vintage ? ` (vintage ${h.vintage})` : ''}${h.averageCost ? ` @ A$${h.averageCost.toFixed(2)}/unit` : ''} [${h.status}]`
      ).join('\n')
    : 'No current holdings.';

  const surrenderText = data.surrenderProgress.length > 0
    ? data.surrenderProgress.map(s =>
        `${s.scheme} (${s.complianceYear}): Target ${s.target.toLocaleString()}, Surrendered ${s.surrendered.toLocaleString()}, Shortfall ${s.shortfall.toLocaleString()}${s.penaltyExposure ? ` — Penalty exposure A$${s.penaltyExposure.toLocaleString()}` : ''}${s.deadline ? ` — Deadline: ${s.deadline}` : ''} [${s.status}]`
      ).join('\n')
    : 'No active surrender obligations.';

  const tradesText = data.recentTrades.length > 0
    ? data.recentTrades.map(t =>
        `${t.date}: ${t.direction.toUpperCase()} ${t.quantity.toLocaleString()} × ${t.instrument} @ A$${t.price.toFixed(2)}`
      ).join('\n')
    : 'No recent trades.';

  // Generate forecast-enhanced market intelligence (P11-B.2)
  const intelligence = await generateMarketIntelligence(data, opts);

  // Try AI-drafted commentary
  let commentary = '';
  try {
    const intelligenceContext = intelligence
      ? [
          ``,
          `FORECAST-ENHANCED MARKET OUTLOOK:`,
          `ESC spot: A$${intelligence.forecastData.currentSpot.toFixed(2)}`,
          `1-month forecast: A$${intelligence.forecastData.forecast1m.toFixed(2)}`,
          `3-month forecast: A$${intelligence.forecastData.forecast3m.toFixed(2)} (${intelligence.forecastData.direction})`,
          `6-month forecast: A$${intelligence.forecastData.forecast6m.toFixed(2)}`,
          `Model confidence: ${(intelligence.forecastData.confidence * 100).toFixed(0)}%`,
        ].join('\n')
      : '';

    const result = await routeAIRequest({
      capability: 'report_generator',
      userId: opts?.userId,
      organisationId: opts?.organisationId,
      input: {
        systemPrompt: buildReportGeneratorPrompt(),
        messages: [{
          role: 'user',
          content: [
            `Generate a compliance position report summary for client "${data.clientName}" (${data.entityType}).`,
            `Period: ${reportPeriod}`,
            ``,
            `CURRENT HOLDINGS:`,
            holdingsText,
            ``,
            `SURRENDER PROGRESS:`,
            surrenderText,
            ``,
            `RECENT TRADES:`,
            tradesText,
            ``,
            `TOTAL PENALTY EXPOSURE: A$${data.penaltyExposure.toLocaleString()}`,
            ``,
            `MARKET CONTEXT:`,
            `ESC spot: A$${MARKET_CONTEXT.escSpot} (${MARKET_CONTEXT.escTrend})`,
            `VEEC spot: A$${MARKET_CONTEXT.veecSpot} (${MARKET_CONTEXT.veecTrend})`,
            `ACCU spot: A$${MARKET_CONTEXT.accuSpot}`,
            `Outlook: ${MARKET_CONTEXT.supplyOutlook}`,
            intelligenceContext,
            ``,
            `Requirements:`,
            `- 3-4 paragraphs covering: position summary, compliance status, market commentary, recommended actions`,
            `- Reference exact numbers from the data above — do not invent figures`,
            `- Australian spelling, professional tone`,
            `- Include specific next steps and deadlines`,
          ].join('\n'),
        }],
      },
    });

    if (result.ok) {
      commentary = result.response.output;
    }
  } catch {
    // Fall through to template
  }

  if (!commentary) {
    commentary = buildFallbackCommentary(data, reportPeriod);
  }

  // Build the email body with intelligence sections
  const branding = getWhiteLabelConfig();
  const subject = `Compliance Position Report — ${data.clientName} — ${reportPeriod}`;
  const bodyParts = [
    `Dear ${data.clientName},`,
    '',
    `Please find below your compliance position report for ${reportPeriod}.`,
    '',
    commentary,
  ];

  // Add Market Outlook section (P11-B.2)
  if (intelligence) {
    bodyParts.push(
      '',
      '--- Market Outlook ---',
      '',
      intelligence.marketOutlook,
      '',
      '--- Recommended Actions ---',
      '',
      intelligence.recommendedActions,
    );
  }

  bodyParts.push(
    '',
    'Please do not hesitate to contact us if you have any questions regarding this report.',
    '',
    'Kind regards,',
    branding.businessName,
  );
  const body = bodyParts.join('\n');

  // Build printable HTML attachment
  const attachmentHTML = renderReportHTML(data, commentary, reportPeriod, intelligence);

  const report: ClientReport = {
    id: reportId,
    clientId: data.clientId,
    clientName: data.clientName,
    period: reportPeriod,
    subject,
    body,
    attachmentHTML,
    generatedAt: new Date().toISOString(),
    status: 'draft',
    sentAt: null,
  };

  reportStore.set(reportId, report);
  return report;
}

// ---------------------------------------------------------------------------
// Batch report generation
// ---------------------------------------------------------------------------

export async function generateBatchReports(
  clients: ClientPositionData[],
  period?: string,
  opts?: { userId?: string; organisationId?: string }
): Promise<ClientReport[]> {
  const reports: ClientReport[] = [];
  for (const client of clients) {
    const report = await generateClientPositionReport(client, period, opts);
    reports.push(report);
  }
  return reports;
}

// ---------------------------------------------------------------------------
// Report CRUD
// ---------------------------------------------------------------------------

export function getReport(reportId: string): ClientReport | null {
  return reportStore.get(reportId) ?? null;
}

export function getAllReports(): ClientReport[] {
  return Array.from(reportStore.values()).sort(
    (a, b) => b.generatedAt.localeCompare(a.generatedAt)
  );
}

export function getReportsByClient(clientId: string): ClientReport[] {
  return getAllReports().filter(r => r.clientId === clientId);
}

export function updateReportStatus(
  reportId: string,
  status: ClientReport['status']
): ClientReport | null {
  const report = reportStore.get(reportId);
  if (!report) return null;
  report.status = status;
  if (status === 'sent') report.sentAt = new Date().toISOString();
  reportStore.set(reportId, report);
  return report;
}

// ---------------------------------------------------------------------------
// Fallback template commentary (when AI unavailable)
// ---------------------------------------------------------------------------

function buildFallbackCommentary(data: ClientPositionData, period: string): string {
  const totalHeld = data.holdings.reduce((sum, h) => sum + h.quantity, 0);
  const totalShortfall = data.surrenderProgress.reduce((sum, s) => sum + s.shortfall, 0);

  const lines: string[] = [
    `Position Summary (${period}):`,
    `Your current portfolio holds ${totalHeld.toLocaleString()} certificates across ${data.holdings.length} instrument type${data.holdings.length !== 1 ? 's' : ''}.`,
  ];

  if (totalShortfall > 0) {
    lines.push(
      '',
      `Compliance Status:`,
      `There is a current shortfall of ${totalShortfall.toLocaleString()} certificates against your surrender targets.`,
      `Total penalty exposure at current rates: A$${data.penaltyExposure.toLocaleString()}.`,
    );
  } else {
    lines.push('', 'Compliance Status:', 'You are currently on track to meet all surrender obligations.');
  }

  lines.push(
    '',
    `Market Commentary:`,
    `ESC certificates are trading at A$${MARKET_CONTEXT.escSpot} (${MARKET_CONTEXT.escTrend}). VEEC certificates at A$${MARKET_CONTEXT.veecSpot} (${MARKET_CONTEXT.veecTrend}). ${MARKET_CONTEXT.supplyOutlook}`,
  );

  if (totalShortfall > 0) {
    lines.push(
      '',
      'Recommended Actions:',
      '- Procurement of certificates to close the shortfall gap before the compliance deadline.',
      '- Consider forward purchasing to lock in current pricing given tightening supply outlook.',
    );
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Printable HTML report
// ---------------------------------------------------------------------------

function renderReportHTML(
  data: ClientPositionData,
  commentary: string,
  period: string,
  intelligence?: MarketIntelligenceSection | null
): string {
  const holdingsRows = data.holdings.map(h => `
    <tr>
      <td style="padding:4px 8px;border:1px solid #ddd;">${esc(h.instrument)}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${h.quantity.toLocaleString()}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;">${h.vintage ?? '—'}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${h.averageCost ? `A$${h.averageCost.toFixed(2)}` : '—'}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;">${esc(h.status)}</td>
    </tr>
  `).join('');

  const surrenderRows = data.surrenderProgress.map(s => `
    <tr>
      <td style="padding:4px 8px;border:1px solid #ddd;">${esc(s.scheme)}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;">${esc(s.complianceYear)}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${s.target.toLocaleString()}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${s.surrendered.toLocaleString()}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;text-align:right;font-weight:600;${s.shortfall > 0 ? 'color:#EF4444;' : ''}">${s.shortfall.toLocaleString()}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;">${s.deadline ?? '—'}</td>
      <td style="padding:4px 8px;border:1px solid #ddd;">${esc(s.status)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Client Position Report — ${esc(data.clientName)}</title></head>
<body style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#1E293B;max-width:800px;margin:0 auto;padding:24px;">
  <div style="border-bottom:3px solid #1B2A4A;padding-bottom:12px;margin-bottom:16px;">
    <h1 style="font-size:18px;color:#1B2A4A;margin:0;">WREI Trading Platform</h1>
    <p style="color:#64748B;margin:4px 0 0;">Compliance Position Report — ${esc(period)}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#F1F5F9;">
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;width:30%;">Client</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${esc(data.clientName)}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Entity Type</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${esc(data.entityType)}</td>
    </tr>
    <tr style="background:#F1F5F9;">
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Report Period</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${esc(period)}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Total Penalty Exposure</td>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;${data.penaltyExposure > 0 ? 'color:#EF4444;' : ''}">A$${data.penaltyExposure.toLocaleString()}</td>
    </tr>
  </table>

  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Current Holdings</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#F1F5F9;">
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Instrument</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;">Quantity</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Vintage</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;">Avg Cost</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Status</th>
    </tr>
    ${holdingsRows || '<tr><td colspan="5" style="padding:8px;border:1px solid #ddd;text-align:center;color:#64748B;">No current holdings</td></tr>'}
  </table>

  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Surrender Progress</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#F1F5F9;">
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Scheme</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Year</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;">Target</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;">Surrendered</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;">Shortfall</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Deadline</th>
      <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Status</th>
    </tr>
    ${surrenderRows || '<tr><td colspan="7" style="padding:8px;border:1px solid #ddd;text-align:center;color:#64748B;">No active surrender obligations</td></tr>'}
  </table>

  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Commentary &amp; Recommendations</h2>
  <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:12px;border-radius:4px;white-space:pre-line;line-height:1.5;">
    ${esc(commentary)}
  </div>

  ${intelligence ? `
  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Market Outlook</h2>
  <div style="background:#F0F9FF;border:1px solid #BAE6FD;padding:12px;border-radius:4px;line-height:1.5;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      <tr>
        <td style="padding:2px 8px;font-size:11px;color:#64748B;">Current ESC Spot</td>
        <td style="padding:2px 8px;font-size:11px;font-weight:600;">A$${intelligence.forecastData.currentSpot.toFixed(2)}</td>
        <td style="padding:2px 8px;font-size:11px;color:#64748B;">1m Forecast</td>
        <td style="padding:2px 8px;font-size:11px;font-weight:600;">A$${intelligence.forecastData.forecast1m.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:2px 8px;font-size:11px;color:#64748B;">3m Forecast</td>
        <td style="padding:2px 8px;font-size:11px;font-weight:600;">A$${intelligence.forecastData.forecast3m.toFixed(2)}</td>
        <td style="padding:2px 8px;font-size:11px;color:#64748B;">6m Forecast</td>
        <td style="padding:2px 8px;font-size:11px;font-weight:600;">A$${intelligence.forecastData.forecast6m.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:2px 8px;font-size:11px;color:#64748B;">Direction</td>
        <td style="padding:2px 8px;font-size:11px;font-weight:600;color:${intelligence.forecastData.direction === 'bullish' ? '#166534' : intelligence.forecastData.direction === 'bearish' ? '#991B1B' : '#374151'};">${intelligence.forecastData.direction.toUpperCase()}</td>
        <td style="padding:2px 8px;font-size:11px;color:#64748B;">Confidence</td>
        <td style="padding:2px 8px;font-size:11px;font-weight:600;">${(intelligence.forecastData.confidence * 100).toFixed(0)}%</td>
      </tr>
    </table>
    <div style="white-space:pre-line;font-size:12px;">${esc(intelligence.marketOutlook)}</div>
  </div>

  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Recommended Actions</h2>
  <div style="background:#F0FDF4;border:1px solid #BBF7D0;padding:12px;border-radius:4px;white-space:pre-line;line-height:1.5;font-size:12px;">
    ${esc(intelligence.recommendedActions)}
  </div>
  ` : ''}

  <div style="border-top:1px solid #ddd;padding-top:12px;margin-top:24px;font-size:10px;color:#64748B;">
    <p>This report is for informational purposes only and does not constitute financial advice. Data sourced from WREI Trading Platform records.</p>
    <p>Generated by WREI Trading Platform | ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Demo data for UI
// ---------------------------------------------------------------------------

export function getDemoClientData(): ClientPositionData[] {
  return [
    {
      clientId: 'client-001',
      clientName: 'AusGrid Energy',
      entityType: 'obligated_entity',
      contactEmail: 'compliance@ausgrid.com.au',
      holdings: [
        { instrument: 'ESC', quantity: 45000, averageCost: 28.50, vintage: '2025', status: 'held' },
        { instrument: 'ESC', quantity: 12000, averageCost: 27.80, vintage: '2024', status: 'held' },
      ],
      surrenderProgress: [
        { scheme: 'ESS', complianceYear: '2025', target: 80000, surrendered: 23000, shortfall: 57000, penaltyRate: 29.48, penaltyExposure: 1680360, deadline: '2026-06-30', status: 'in_progress' },
      ],
      recentTrades: [
        { date: '2026-03-28', instrument: 'ESC', quantity: 5000, price: 29.00, direction: 'buy' },
        { date: '2026-03-15', instrument: 'ESC', quantity: 8000, price: 28.75, direction: 'buy' },
      ],
      penaltyExposure: 1680360,
    },
    {
      clientId: 'client-002',
      clientName: 'Melbourne Water Corp',
      entityType: 'obligated_entity',
      contactEmail: 'energy@melbwater.com.au',
      holdings: [
        { instrument: 'VEEC', quantity: 32000, averageCost: 56.20, vintage: '2025', status: 'held' },
        { instrument: 'ESC', quantity: 8500, averageCost: 29.10, vintage: '2025', status: 'held' },
      ],
      surrenderProgress: [
        { scheme: 'VEU', complianceYear: '2025', target: 50000, surrendered: 18000, shortfall: 32000, penaltyRate: 120.00, penaltyExposure: 3840000, deadline: '2026-04-30', status: 'in_progress' },
        { scheme: 'ESS', complianceYear: '2025', target: 15000, surrendered: 6500, shortfall: 8500, penaltyRate: 29.48, penaltyExposure: 250580, deadline: '2026-06-30', status: 'in_progress' },
      ],
      recentTrades: [
        { date: '2026-04-01', instrument: 'VEEC', quantity: 12000, price: 58.50, direction: 'buy' },
      ],
      penaltyExposure: 4090580,
    },
    {
      clientId: 'client-003',
      clientName: 'Pacific Solar Pty Ltd',
      entityType: 'acp',
      contactEmail: 'admin@pacificsolar.com.au',
      holdings: [
        { instrument: 'ESC', quantity: 25000, averageCost: null, vintage: '2025', status: 'held' },
        { instrument: 'STC', quantity: 14000, averageCost: null, vintage: '2026', status: 'held' },
      ],
      surrenderProgress: [],
      recentTrades: [
        { date: '2026-03-20', instrument: 'ESC', quantity: 3000, price: 29.20, direction: 'sell' },
      ],
      penaltyExposure: 0,
    },
  ];
}
