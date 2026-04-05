/**
 * Webhook delivery system for the WREI public REST API.
 *
 * Supports: trade.created, trade.settled, negotiation.completed,
 *           correspondence.received, price.alert, compliance.deadline
 *
 * Delivery: fire-and-forget with 3 retries (exponential backoff).
 * Payload is HMAC-SHA256 signed for verification.
 */

import { createHmac, randomBytes } from 'crypto';
import { sql } from '@/lib/db/connection';
import { writeAuditEntry } from '@/lib/db/queries/audit-log';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WebhookEvent =
  | 'trade.created'
  | 'trade.settled'
  | 'negotiation.completed'
  | 'correspondence.received'
  | 'price.alert'
  | 'compliance.deadline';

export const VALID_WEBHOOK_EVENTS: WebhookEvent[] = [
  'trade.created',
  'trade.settled',
  'negotiation.completed',
  'correspondence.received',
  'price.alert',
  'compliance.deadline',
];

export interface WebhookRegistration {
  id: string;
  organisation_id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export async function registerWebhook(
  orgId: string,
  url: string,
  events: WebhookEvent[],
): Promise<WebhookRegistration> {
  const secret = randomBytes(32).toString('hex');

  const { rows } = await sql`
    INSERT INTO webhook_registrations (organisation_id, url, events, secret)
    VALUES (${orgId}, ${url}, ${JSON.stringify(events)}::jsonb, ${secret})
    RETURNING *
  `;

  const row = rows[0] as WebhookRegistration;

  await writeAuditEntry({
    entity_type: 'system',
    entity_id: row.id,
    action: 'webhook.registered',
    details: { url, events },
  }).catch(() => {});

  return row;
}

export async function listWebhooks(orgId: string): Promise<WebhookRegistration[]> {
  const { rows } = await sql`
    SELECT * FROM webhook_registrations
    WHERE organisation_id = ${orgId} AND is_active = true
    ORDER BY created_at DESC
  `;
  return rows as WebhookRegistration[];
}

export async function deleteWebhook(id: string, orgId: string): Promise<boolean> {
  const { rows } = await sql`
    UPDATE webhook_registrations
    SET is_active = false, updated_at = now()
    WHERE id = ${id} AND organisation_id = ${orgId}
    RETURNING id
  `;

  if (rows.length > 0) {
    await writeAuditEntry({
      entity_type: 'system',
      entity_id: id,
      action: 'webhook.deregistered',
    }).catch(() => {});
  }

  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Signing
// ---------------------------------------------------------------------------

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function deliverWithRetry(
  url: string,
  body: string,
  signature: string,
  attempt: number = 1,
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WREI-Signature': signature,
        'X-WREI-Event-Timestamp': new Date().toISOString(),
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      return { success: true, status: response.status };
    }

    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return deliverWithRetry(url, body, signature, attempt + 1);
    }

    return { success: false, status: response.status, error: `HTTP ${response.status}` };
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return deliverWithRetry(url, body, signature, attempt + 1);
    }
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Fire webhook for a given event. Fire-and-forget — does not block the caller.
 * Logs delivery results to the audit trail.
 */
export async function fireWebhook(
  orgId: string,
  event: WebhookEvent,
  payload: unknown,
): Promise<void> {
  let registrations: WebhookRegistration[];
  try {
    registrations = await listWebhooks(orgId);
  } catch {
    return; // DB unavailable — fail silently
  }

  const matching = registrations.filter(r =>
    Array.isArray(r.events) && r.events.includes(event),
  );

  for (const reg of matching) {
    const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
    const signature = signPayload(body, reg.secret);

    // Fire-and-forget — don't await
    deliverWithRetry(reg.url, body, signature).then(result => {
      writeAuditEntry({
        entity_type: 'system',
        entity_id: reg.id,
        action: result.success ? 'webhook.delivered' : 'webhook.failed',
        details: { event, url: reg.url, ...result },
      }).catch(() => {});
    });
  }
}
