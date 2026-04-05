/**
 * AI Draft Engine — Generates professional correspondence using the AI Service Router.
 *
 * All AI calls route through lib/ai/ai-service-router.ts with guard enforcement.
 * Uses the 'correspondence_draft' capability (Sonnet 4, 512 tokens).
 */

import { routeAIRequest } from '@/lib/ai/ai-service-router';
import { buildCorrespondenceDraftPrompt } from '@/lib/ai/prompts/system-prompts';
import type { ProcurementRecommendation, Counterparty } from './types';

export interface DraftResult {
  subject: string;
  body: string;
  model: string;
  tokensUsed: number;
}

/**
 * Generate an RFQ email draft for a specific counterparty based on a procurement need.
 *
 * The prompt deliberately omits the specific client name — the RFQ only reveals
 * the instrument, quantity, urgency, and preferred price range.
 */
export async function generateRFQDraft(
  recommendation: ProcurementRecommendation,
  counterparty: Counterparty,
  opts?: { userId?: string; organisationId?: string }
): Promise<DraftResult> {
  const urgencyLabel =
    recommendation.urgency <= 30 ? 'urgent (within 30 days)'
    : recommendation.urgency <= 90 ? 'near-term (within 90 days)'
    : 'standard timeline';

  const userMessage = [
    `Draft an RFQ email to ${counterparty.contactName} at ${counterparty.name}.`,
    ``,
    `Instrument: ${recommendation.instrument}`,
    `Quantity required: ${recommendation.shortfall.toLocaleString()} units`,
    `Compliance year: ${recommendation.complianceYear}`,
    `Urgency: ${urgencyLabel}`,
    `Penalty rate: A$${recommendation.penaltyRate.toFixed(2)}/unit (for context on pricing ceiling)`,
    ``,
    `Relationship: ${counterparty.relationship} supplier`,
    counterparty.notes ? `Notes: ${counterparty.notes}` : '',
    ``,
    `Requirements:`,
    `- Request best offer for the full quantity`,
    `- Specify preferred settlement: T+2 registry transfer`,
    `- Ask for vintage availability`,
    `- Professional tone, Australian business conventions`,
    `- Do NOT name the specific end-client`,
    ``,
    `Return the email in this exact format:`,
    `SUBJECT: <subject line>`,
    `BODY:`,
    `<email body>`,
  ].filter(Boolean).join('\n');

  const result = await routeAIRequest({
    capability: 'correspondence_draft',
    userId: opts?.userId,
    organisationId: opts?.organisationId,
    input: {
      systemPrompt: buildCorrespondenceDraftPrompt(),
      messages: [{ role: 'user', content: userMessage }],
    },
  });

  if (!result.ok) {
    return {
      subject: `RFQ: ${recommendation.instrument} — ${recommendation.shortfall.toLocaleString()} units`,
      body: buildFallbackRFQ(recommendation, counterparty),
      model: 'fallback',
      tokensUsed: 0,
    };
  }

  const { subject, body } = parseEmailResponse(result.response.output, recommendation, counterparty);

  return {
    subject,
    body,
    model: result.response.model,
    tokensUsed: result.response.tokensUsed,
  };
}

/** Parse AI response into subject + body, with fallback */
function parseEmailResponse(
  output: string,
  recommendation: ProcurementRecommendation,
  counterparty: Counterparty
): { subject: string; body: string } {
  const subjectMatch = output.match(/SUBJECT:\s*(.+)/i);
  const bodyMatch = output.match(/BODY:\s*([\s\S]+)/i);

  if (subjectMatch && bodyMatch) {
    return {
      subject: subjectMatch[1].trim(),
      body: bodyMatch[1].trim(),
    };
  }

  // If parsing fails, use the full output as body with a generated subject
  return {
    subject: `RFQ: ${recommendation.instrument} — ${recommendation.shortfall.toLocaleString()} units`,
    body: output.trim() || buildFallbackRFQ(recommendation, counterparty),
  };
}

/** Template-based fallback when AI is unavailable (guard rejection or timeout) */
function buildFallbackRFQ(
  rec: ProcurementRecommendation,
  cp: Counterparty
): string {
  return [
    `Dear ${cp.contactName},`,
    ``,
    `We are seeking a competitive offer for ${rec.instrument} certificates on behalf of our client.`,
    ``,
    `Instrument: ${rec.instrument}`,
    `Quantity: ${rec.shortfall.toLocaleString()} units`,
    `Compliance year: ${rec.complianceYear}`,
    `Settlement: T+2 registry transfer preferred`,
    ``,
    `Please provide your best offer including:`,
    `- Price per unit (AUD)`,
    `- Available vintages`,
    `- Delivery timeline`,
    ``,
    `We look forward to your response.`,
    ``,
    `Kind regards`,
  ].join('\n');
}
