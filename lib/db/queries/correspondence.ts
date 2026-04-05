/**
 * Correspondence CRUD queries.
 */

import { sql } from '../connection';
import type { CorrespondenceRow } from '@/lib/correspondence/types';
import type { CreateCorrespondenceInput } from '@/lib/correspondence/types';

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createCorrespondence(
  orgId: string,
  userId: string,
  data: CreateCorrespondenceInput
): Promise<CorrespondenceRow> {
  const { rows } = await sql`
    INSERT INTO correspondence (
      organisation_id, type, counterparty_name, counterparty_email,
      subject, body, status, thread_id,
      related_client_id, related_instrument,
      ai_model, ai_tokens_used, created_by
    ) VALUES (
      ${orgId},
      ${data.type},
      ${data.counterpartyName},
      ${data.counterpartyEmail},
      ${data.subject},
      ${data.body},
      'drafted',
      ${data.threadId ?? null},
      ${data.relatedClientId ?? null},
      ${data.relatedInstrument ?? null},
      ${data.aiModel ?? null},
      ${data.aiTokensUsed ?? null},
      ${userId}
    )
    RETURNING *
  `;
  return rows[0] as CorrespondenceRow;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getCorrespondenceByOrg(
  orgId: string,
  filters?: { status?: string; type?: string; clientId?: string; counterpartyName?: string }
): Promise<CorrespondenceRow[]> {
  // Base query — filters are optional
  if (!filters || Object.values(filters).every(v => !v)) {
    const { rows } = await sql`
      SELECT * FROM correspondence
      WHERE organisation_id = ${orgId}
      ORDER BY created_at DESC
    `;
    return rows as CorrespondenceRow[];
  }

  // With status filter (most common)
  if (filters.status && !filters.type && !filters.clientId) {
    const { rows } = await sql`
      SELECT * FROM correspondence
      WHERE organisation_id = ${orgId} AND status = ${filters.status}
      ORDER BY created_at DESC
    `;
    return rows as CorrespondenceRow[];
  }

  // Generic filtered query
  const { rows } = await sql`
    SELECT * FROM correspondence
    WHERE organisation_id = ${orgId}
      AND (${filters.status ?? null}::text IS NULL OR status = ${filters.status ?? null})
      AND (${filters.type ?? null}::text IS NULL OR type = ${filters.type ?? null})
      AND (${filters.clientId ?? null}::text IS NULL OR related_client_id::text = ${filters.clientId ?? null})
    ORDER BY created_at DESC
  `;
  return rows as CorrespondenceRow[];
}

export async function getDraftedCorrespondence(orgId: string): Promise<CorrespondenceRow[]> {
  const { rows } = await sql`
    SELECT * FROM correspondence
    WHERE organisation_id = ${orgId} AND status = 'drafted'
    ORDER BY created_at DESC
  `;
  return rows as CorrespondenceRow[];
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateCorrespondenceStatus(
  id: string,
  orgId: string,
  status: string,
  extra?: { rejectionReason?: string; body?: string }
): Promise<CorrespondenceRow | null> {
  if (status === 'sent') {
    const { rows } = await sql`
      UPDATE correspondence SET
        status = ${status},
        sent_at = now(),
        updated_at = now()
      WHERE id = ${id} AND organisation_id = ${orgId}
      RETURNING *
    `;
    return (rows[0] as CorrespondenceRow) ?? null;
  }

  if (status === 'rejected' && extra?.rejectionReason) {
    const { rows } = await sql`
      UPDATE correspondence SET
        status = ${status},
        rejection_reason = ${extra.rejectionReason},
        updated_at = now()
      WHERE id = ${id} AND organisation_id = ${orgId}
      RETURNING *
    `;
    return (rows[0] as CorrespondenceRow) ?? null;
  }

  if (extra?.body) {
    const { rows } = await sql`
      UPDATE correspondence SET
        status = ${status},
        body = ${extra.body},
        updated_at = now()
      WHERE id = ${id} AND organisation_id = ${orgId}
      RETURNING *
    `;
    return (rows[0] as CorrespondenceRow) ?? null;
  }

  const { rows } = await sql`
    UPDATE correspondence SET
      status = ${status},
      updated_at = now()
    WHERE id = ${id} AND organisation_id = ${orgId}
    RETURNING *
  `;
  return (rows[0] as CorrespondenceRow) ?? null;
}
