/**
 * Alert engine — evaluates all active rules against current data,
 * triggers events, logs to audit trail, and fires webhooks.
 */

import { sql } from '@/lib/db/connection';
import { writeAuditEntry } from '@/lib/db/queries/audit-log';
import { fireWebhook } from '@/lib/api/webhooks';
import { evaluateRule, type MarketSnapshot } from './alert-rules';
import type { AlertRule, AlertEvent, CreateAlertRuleInput } from './types';

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function createAlertRule(input: CreateAlertRuleInput): Promise<AlertRule> {
  const { rows } = await sql`
    INSERT INTO alert_rules (user_id, organisation_id, type, name, instrument, condition, threshold, metadata)
    VALUES (
      ${input.user_id},
      ${input.organisation_id},
      ${input.type},
      ${input.name},
      ${input.instrument ?? null},
      ${input.condition},
      ${input.threshold},
      ${JSON.stringify(input.metadata ?? {})}
    )
    RETURNING *
  `;

  const rule = rows[0] as AlertRule;

  await writeAuditEntry({
    entity_type: 'system',
    entity_id: rule.id,
    action: 'alert_rule.created',
    details: { type: rule.type, name: rule.name },
  }).catch(() => {});

  return rule;
}

export async function listAlertRules(orgId: string): Promise<AlertRule[]> {
  const { rows } = await sql`
    SELECT * FROM alert_rules
    WHERE organisation_id = ${orgId} AND is_active = true
    ORDER BY created_at DESC
  `;
  return rows as AlertRule[];
}

export async function updateAlertRule(
  id: string,
  orgId: string,
  updates: Partial<Pick<AlertRule, 'name' | 'condition' | 'threshold' | 'is_active'>>,
): Promise<AlertRule | null> {
  const { rows } = await sql`
    UPDATE alert_rules
    SET
      name = COALESCE(${updates.name ?? null}, name),
      condition = COALESCE(${updates.condition ?? null}, condition),
      threshold = COALESCE(${updates.threshold ?? null}, threshold),
      is_active = COALESCE(${updates.is_active ?? null}, is_active),
      updated_at = now()
    WHERE id = ${id} AND organisation_id = ${orgId}
    RETURNING *
  `;
  return (rows[0] as AlertRule) ?? null;
}

export async function deleteAlertRule(id: string, orgId: string): Promise<boolean> {
  const { rows } = await sql`
    UPDATE alert_rules
    SET is_active = false, updated_at = now()
    WHERE id = ${id} AND organisation_id = ${orgId}
    RETURNING id
  `;
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Alert events
// ---------------------------------------------------------------------------

export async function getAlertEvents(
  orgId: string,
  opts?: { unacknowledgedOnly?: boolean; limit?: number },
): Promise<AlertEvent[]> {
  const limit = opts?.limit ?? 50;

  if (opts?.unacknowledgedOnly) {
    const { rows } = await sql`
      SELECT ae.* FROM alert_events ae
      JOIN alert_rules ar ON ae.rule_id = ar.id
      WHERE ar.organisation_id = ${orgId}
        AND ae.acknowledged_at IS NULL
      ORDER BY ae.created_at DESC
      LIMIT ${limit}
    `;
    return rows as AlertEvent[];
  }

  const { rows } = await sql`
    SELECT ae.* FROM alert_events ae
    JOIN alert_rules ar ON ae.rule_id = ar.id
    WHERE ar.organisation_id = ${orgId}
    ORDER BY ae.created_at DESC
    LIMIT ${limit}
  `;
  return rows as AlertEvent[];
}

export async function acknowledgeAlert(
  eventId: number,
  userId: string,
): Promise<boolean> {
  const { rows } = await sql`
    UPDATE alert_events
    SET acknowledged_at = now(), acknowledged_by = ${userId}
    WHERE id = ${eventId} AND acknowledged_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Trigger — persist event + audit + webhook
// ---------------------------------------------------------------------------

async function triggerAlert(
  event: Omit<AlertEvent, 'id' | 'created_at' | 'acknowledged_at' | 'acknowledged_by'>,
  orgId: string,
): Promise<AlertEvent> {
  const { rows } = await sql`
    INSERT INTO alert_events (rule_id, type, severity, title, message, data)
    VALUES (
      ${event.rule_id},
      ${event.type},
      ${event.severity},
      ${event.title},
      ${event.message},
      ${JSON.stringify(event.data)}
    )
    RETURNING *
  `;

  const saved = rows[0] as AlertEvent;

  await writeAuditEntry({
    entity_type: 'system',
    entity_id: String(saved.id),
    action: 'alert.triggered',
    details: { type: saved.type, severity: saved.severity, title: saved.title },
  }).catch(() => {});

  // Fire webhook for price alerts
  if (event.type === 'price_cross') {
    fireWebhook(orgId, 'price.alert', saved).catch(() => {});
  }
  if (event.type === 'compliance_deadline' || event.type === 'compliance_shortfall') {
    fireWebhook(orgId, 'compliance.deadline', saved).catch(() => {});
  }

  return saved;
}

// ---------------------------------------------------------------------------
// Evaluate all active rules for an organisation
// ---------------------------------------------------------------------------

export async function evaluateAlerts(
  orgId: string,
  snapshot: MarketSnapshot,
): Promise<AlertEvent[]> {
  let rules: AlertRule[];
  try {
    rules = await listAlertRules(orgId);
  } catch {
    return [];
  }

  const triggered: AlertEvent[] = [];

  for (const rule of rules) {
    const result = evaluateRule(rule, snapshot);
    if (result) {
      try {
        const event = await triggerAlert(result, orgId);
        triggered.push(event);
      } catch {
        // Persist failure should not crash evaluation
      }
    }
  }

  return triggered;
}
