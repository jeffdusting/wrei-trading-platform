/**
 * Trade Confirmation Generator — produces AFMA-style trade confirmations
 * for completed email negotiations.
 *
 * The confirmation detail is template-generated (not AI) for accuracy.
 * AI drafts only the covering email. Structure follows AFMA Environmental
 * Product Conventions.
 */

import { routeAIRequest } from '@/lib/ai/ai-service-router';
import { buildCorrespondenceDraftPrompt } from '@/lib/ai/prompts/system-prompts';
import type { TradeConfirmation } from './types';

// ---------------------------------------------------------------------------
// Settlement method lookup
// ---------------------------------------------------------------------------

const SETTLEMENT_METHODS: Record<string, string> = {
  ESC: 'TESSA Registry Transfer',
  VEEC: 'VEU Registry Transfer',
  PRC: 'TESSA Registry Transfer',
  ACCU: 'ANREU Registry Transfer',
  LGC: 'REC Registry Transfer',
  STC: 'STC Clearing House',
  WREI_CC: 'On-chain via Zoniqx zConnect (T+0 atomic)',
  WREI_ACO: 'On-chain via Zoniqx zConnect (T+0 atomic)',
};

const SETTLEMENT_DAYS: Record<string, number> = {
  ESC: 2, VEEC: 3, PRC: 2, ACCU: 3, LGC: 2, STC: 1, WREI_CC: 0, WREI_ACO: 0,
};

// ---------------------------------------------------------------------------
// Generate confirmation
// ---------------------------------------------------------------------------

export interface GenerateConfirmationInput {
  instrument: string;
  quantity: number;
  pricePerUnit: number;
  currency: 'AUD' | 'USD';
  buyerName: string;
  buyerEntity: string;
  sellerName: string;
  sellerEntity: string;
  threadId: string;
  specialConditions?: string[];
  registryReference?: string;
}

export function generateConfirmation(input: GenerateConfirmationInput): TradeConfirmation {
  const tradeDate = new Date().toISOString().split('T')[0];
  const settlementDays = SETTLEMENT_DAYS[input.instrument] ?? 2;
  const settlementDate = addBusinessDays(new Date(), settlementDays)
    .toISOString()
    .split('T')[0];

  return {
    tradeDate,
    settlementDate,
    instrument: input.instrument,
    quantity: input.quantity,
    pricePerUnit: input.pricePerUnit,
    totalConsideration: Math.round(input.quantity * input.pricePerUnit * 100) / 100,
    currency: input.currency,
    buyerName: input.buyerName,
    buyerEntity: input.buyerEntity,
    sellerName: input.sellerName,
    sellerEntity: input.sellerEntity,
    settlementMethod: SETTLEMENT_METHODS[input.instrument] ?? 'Registry Transfer',
    registryReference: input.registryReference ?? null,
    specialConditions: input.specialConditions ?? [],
    threadId: input.threadId,
  };
}

// ---------------------------------------------------------------------------
// Render confirmation as HTML (template, not AI)
// ---------------------------------------------------------------------------

export function renderConfirmationHTML(conf: TradeConfirmation): string {
  const currencySymbol = conf.currency === 'AUD' ? 'A$' : 'US$';
  const specialRows = conf.specialConditions.length > 0
    ? conf.specialConditions.map(c => `<tr><td colspan="2" style="padding:4px 8px;border:1px solid #ddd;">${escapeHtml(c)}</td></tr>`).join('')
    : '<tr><td colspan="2" style="padding:4px 8px;border:1px solid #ddd;">None</td></tr>';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Trade Confirmation</title></head>
<body style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#1E293B;max-width:700px;margin:0 auto;padding:24px;">
  <div style="border-bottom:3px solid #1B2A4A;padding-bottom:12px;margin-bottom:16px;">
    <h1 style="font-size:18px;color:#1B2A4A;margin:0;">WREI Trading Platform</h1>
    <p style="color:#64748B;margin:4px 0 0;">Trade Confirmation — Environmental Products</p>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#F1F5F9;">
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;width:40%;">Trade Date</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${conf.tradeDate}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Settlement Date</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${conf.settlementDate}</td>
    </tr>
    <tr style="background:#F1F5F9;">
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Reference</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(conf.threadId)}</td>
    </tr>
  </table>

  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Instrument Details</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#F1F5F9;">
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;width:40%;">Instrument</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(conf.instrument)}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Quantity</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${conf.quantity.toLocaleString()}</td>
    </tr>
    <tr style="background:#F1F5F9;">
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Price per Unit</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${currencySymbol}${conf.pricePerUnit.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Total Consideration</td>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;color:#1B2A4A;">${currencySymbol}${conf.totalConsideration.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>
  </table>

  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Counterparties</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#F1F5F9;">
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;width:40%;">Buyer</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(conf.buyerName)} (${escapeHtml(conf.buyerEntity)})</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Seller</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(conf.sellerName)} (${escapeHtml(conf.sellerEntity)})</td>
    </tr>
  </table>

  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Settlement</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    <tr style="background:#F1F5F9;">
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;width:40%;">Settlement Method</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${escapeHtml(conf.settlementMethod)}</td>
    </tr>
    <tr>
      <td style="padding:6px 8px;border:1px solid #ddd;font-weight:600;">Registry Reference</td>
      <td style="padding:6px 8px;border:1px solid #ddd;">${conf.registryReference ? escapeHtml(conf.registryReference) : 'To be assigned'}</td>
    </tr>
  </table>

  <h2 style="font-size:14px;color:#1B2A4A;margin:16px 0 8px;">Special Conditions</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
    ${specialRows}
  </table>

  <div style="border-top:1px solid #ddd;padding-top:12px;margin-top:24px;font-size:10px;color:#64748B;">
    <p>This confirmation is subject to the AFMA Environmental Product Conventions. Both parties should review and confirm the details above within 2 business days.</p>
    <p>Generated by WREI Trading Platform | ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// AI-drafted covering email for the confirmation
// ---------------------------------------------------------------------------

export async function generateCoveringEmail(
  conf: TradeConfirmation,
  opts?: { userId?: string; organisationId?: string },
): Promise<{ subject: string; body: string }> {
  const currencySymbol = conf.currency === 'AUD' ? 'A$' : 'US$';

  try {
    const result = await routeAIRequest({
      capability: 'correspondence_draft',
      userId: opts?.userId,
      organisationId: opts?.organisationId,
      input: {
        systemPrompt: buildCorrespondenceDraftPrompt(),
        messages: [{
          role: 'user',
          content: [
            `Draft a covering email for the attached trade confirmation.`,
            ``,
            `Trade details:`,
            `- Instrument: ${conf.instrument}`,
            `- Quantity: ${conf.quantity.toLocaleString()} units`,
            `- Price: ${currencySymbol}${conf.pricePerUnit.toFixed(2)}/unit`,
            `- Total: ${currencySymbol}${conf.totalConsideration.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            `- Settlement: ${conf.settlementDate} via ${conf.settlementMethod}`,
            `- Buyer: ${conf.buyerName}`,
            ``,
            `Requirements:`,
            `- Congratulate on the completed trade`,
            `- Reference the attached confirmation for full details`,
            `- Remind about settlement timeline`,
            `- Professional Australian business tone`,
            ``,
            `Return in this format:`,
            `SUBJECT: <subject>`,
            `BODY:`,
            `<email body>`,
          ].join('\n'),
        }],
      },
    });

    if (result.ok && result.response.output) {
      const subjectMatch = result.response.output.match(/SUBJECT:\s*(.+)/i);
      const bodyMatch = result.response.output.match(/BODY:\s*([\s\S]+)/i);
      if (subjectMatch && bodyMatch) {
        return { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim() };
      }
    }
  } catch {
    // Fall through to template
  }

  // Fallback template
  return {
    subject: `Trade Confirmation: ${conf.instrument} — ${conf.quantity.toLocaleString()} units`,
    body: [
      `Dear ${conf.buyerName},`,
      '',
      `Please find attached the trade confirmation for the ${conf.instrument} transaction.`,
      '',
      `Summary:`,
      `- Quantity: ${conf.quantity.toLocaleString()} units`,
      `- Price: ${currencySymbol}${conf.pricePerUnit.toFixed(2)}/unit`,
      `- Total consideration: ${currencySymbol}${conf.totalConsideration.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `- Settlement: ${conf.settlementDate} via ${conf.settlementMethod}`,
      '',
      `Please review and confirm the details within 2 business days.`,
      '',
      'Kind regards',
    ].join('\n'),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
