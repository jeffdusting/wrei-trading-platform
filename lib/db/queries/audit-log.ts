/**
 * Append-only audit trail writer.
 *
 * The audit_log table is insert-only by design — no updates or deletes
 * are permitted to maintain compliance integrity.
 */

import { sql } from '../connection';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditEntry {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface WriteAuditInput {
  entity_type: 'trade' | 'negotiation' | 'instrument' | 'settlement' | 'pricing' | 'system';
  entity_id: string;
  action: string;
  actor?: string;
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function writeAuditEntry(
  input: WriteAuditInput
): Promise<AuditEntry> {
  const { rows } = await sql`
    INSERT INTO audit_log (entity_type, entity_id, action, actor, details)
    VALUES (
      ${input.entity_type},
      ${input.entity_id},
      ${input.action},
      ${input.actor ?? 'system'},
      ${JSON.stringify(input.details ?? {})}
    )
    RETURNING *
  `;
  return rows[0] as AuditEntry;
}

export async function getAuditTrail(
  entityType: string,
  entityId: string,
  opts?: { limit?: number; offset?: number }
): Promise<AuditEntry[]> {
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;

  const { rows } = await sql`
    SELECT * FROM audit_log
    WHERE entity_type = ${entityType} AND entity_id = ${entityId}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as AuditEntry[];
}

export async function getRecentAuditEntries(
  opts?: { limit?: number; entityType?: string }
): Promise<AuditEntry[]> {
  const limit = opts?.limit ?? 50;

  if (opts?.entityType) {
    const { rows } = await sql`
      SELECT * FROM audit_log
      WHERE entity_type = ${opts.entityType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows as AuditEntry[];
  }

  const { rows } = await sql`
    SELECT * FROM audit_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as AuditEntry[];
}
