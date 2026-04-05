/**
 * Offer Parser — extracts structured offer data from natural language email text.
 *
 * Uses AI (via service router, Sonnet) to parse email content into structured
 * price/quantity/vintage/terms. Falls back to regex extraction if AI unavailable.
 * Returns confidence score; below 70% triggers manual review requirement.
 */

import { routeAIRequest } from '@/lib/ai/ai-service-router';
import { buildCorrespondenceDraftPrompt } from '@/lib/ai/prompts/system-prompts';
import type { ParsedOffer } from './types';

const OFFER_PARSE_SYSTEM_PROMPT =
  'You are a structured data extraction agent for an institutional trading platform. ' +
  'Extract offer details from the email text provided. Return ONLY valid JSON, no explanation.\n\n' +
  'Required JSON format:\n' +
  '{\n' +
  '  "price": <number or null>,\n' +
  '  "quantity": <number or null>,\n' +
  '  "vintage": <string or null>,\n' +
  '  "terms": <string summary or null>,\n' +
  '  "counterOffer": <boolean — true if they are making a counter-offer>,\n' +
  '  "confidence": <0-100 — how confident you are in the extraction>,\n' +
  '  "rawExcerpt": <the sentence(s) containing the offer>\n' +
  '}\n\n' +
  'Rules:\n' +
  '- Extract the per-unit price if stated (not total consideration)\n' +
  '- Quantity in units (certificates/tonnes), not dollar amounts\n' +
  '- If the email does not contain a clear offer, set confidence below 30\n' +
  '- If price is ambiguous or a range, use the midpoint and lower confidence\n' +
  '- Vintage format: "2025", "2024-25", or null\n' +
  '- Return ONLY the JSON object, nothing else';

/**
 * Parse an offer from email body text.
 * Attempts AI extraction first, falls back to regex if AI fails.
 */
export async function parseOffer(
  emailBody: string,
  instrumentType: string,
  opts?: { userId?: string; organisationId?: string },
): Promise<ParsedOffer> {
  // Try AI parsing first
  try {
    const result = await routeAIRequest({
      capability: 'correspondence_draft',
      userId: opts?.userId,
      organisationId: opts?.organisationId,
      input: {
        systemPrompt: OFFER_PARSE_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Instrument type: ${instrumentType}\n\nEmail content:\n${emailBody}`,
        }],
      },
      maxTokens: 256,
    });

    if (result.ok && result.response.output) {
      const parsed = extractJsonFromResponse(result.response.output);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn('[OfferParser] AI parsing failed, falling back to regex:', err);
  }

  // Fallback: regex-based extraction
  return regexParseOffer(emailBody);
}

/**
 * Extract JSON ParsedOffer from AI response text.
 * Handles responses that may include surrounding text.
 */
function extractJsonFromResponse(output: string): ParsedOffer | null {
  try {
    // Try direct parse first
    const direct = JSON.parse(output.trim());
    if (isValidParsedOffer(direct)) return direct;
  } catch {
    // Try extracting JSON from within text
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (isValidParsedOffer(parsed)) return parsed;
      } catch {
        // Fall through to null
      }
    }
  }
  return null;
}

function isValidParsedOffer(obj: unknown): obj is ParsedOffer {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'confidence' in obj &&
    typeof (obj as Record<string, unknown>).confidence === 'number'
  );
}

/**
 * Regex fallback for when AI is unavailable.
 * Extracts price and quantity using common email patterns.
 */
function regexParseOffer(emailBody: string): ParsedOffer {
  let price: number | null = null;
  let quantity: number | null = null;
  let vintage: string | null = null;
  let rawExcerpt = '';
  let confidence = 40; // Base confidence for regex extraction

  // Price patterns (per-unit)
  const pricePatterns = [
    /(?:at|offer|price|quote)\s*(?:of\s*)?\$?([\d,]+(?:\.\d{2})?)\s*(?:per\s+unit|\/unit|each|per\s+(?:tonne|certificate|MWh))/i,
    /\$([\d,]+(?:\.\d{2})?)\s*(?:per\s+unit|\/unit|each)/i,
    /(?:A\$|AUD\s*)([\d,]+(?:\.\d{2})?)/i,
    /\$([\d,]+(?:\.\d{2})?)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = emailBody.match(pattern);
    if (match) {
      price = parseFloat(match[1].replace(/,/g, ''));
      rawExcerpt = match[0];
      confidence += 20;
      break;
    }
  }

  // Quantity patterns
  const qtyPatterns = [
    /([\d,]+)\s*(?:units?|certificates?|ESCs?|VEECs?|ACCUs?|LGCs?|STCs?|PRCs?|tonnes?|MWh)/i,
    /(?:quantity|volume|lot)\s*(?:of\s*)?([\d,]+)/i,
  ];

  for (const pattern of qtyPatterns) {
    const match = emailBody.match(pattern);
    if (match) {
      quantity = parseInt(match[1].replace(/,/g, ''), 10);
      confidence += 10;
      break;
    }
  }

  // Vintage patterns
  const vintageMatch = emailBody.match(/(?:vintage|year)\s*(?:is\s*)?(\d{4}(?:\s*[-–]\s*\d{2,4})?)/i);
  if (vintageMatch) {
    vintage = vintageMatch[1];
    confidence += 5;
  }

  // Cap confidence for regex
  confidence = Math.min(confidence, 65);

  // Determine if it's a counter-offer
  const counterOffer = /counter|revised|updated|new offer|adjust/i.test(emailBody);

  return {
    price,
    quantity,
    vintage,
    terms: null,
    counterOffer,
    confidence,
    rawExcerpt: rawExcerpt || emailBody.slice(0, 200),
  };
}
