/**
 * Client CRUD and holdings/compliance queries.
 */

import { sql } from '../connection';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClientRow {
  id: string;
  organisation_id: string;
  name: string;
  entity_type: 'acp' | 'obligated_entity' | 'government' | 'corporate' | 'institutional';
  contact_email: string | null;
  contact_name: string | null;
  abn: string | null;
  ess_participant_id: string | null;
  annual_esc_target: number | null;
  annual_veec_target: number | null;
  safeguard_facility_id: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  name: string;
  entity_type: ClientRow['entity_type'];
  contact_email?: string;
  contact_name?: string;
  abn?: string;
  ess_participant_id?: string;
  annual_esc_target?: number;
  annual_veec_target?: number;
  safeguard_facility_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateClientInput {
  name?: string;
  entity_type?: ClientRow['entity_type'];
  contact_email?: string;
  contact_name?: string;
  abn?: string;
  ess_participant_id?: string;
  annual_esc_target?: number;
  annual_veec_target?: number;
  safeguard_facility_id?: string;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface HoldingRow {
  id: string;
  client_id: string;
  instrument_type: string;
  quantity: number;
  average_cost: number | null;
  total_cost: number | null;
  vintage: string | null;
  registry_reference: string | null;
  status: 'held' | 'pending_transfer' | 'surrendered' | 'retired';
  updated_at: string;
}

export interface CreateHoldingInput {
  instrument_type: string;
  quantity: number;
  average_cost?: number;
  total_cost?: number;
  vintage?: string;
  registry_reference?: string;
  status?: HoldingRow['status'];
}

export interface SurrenderRow {
  id: string;
  client_id: string;
  compliance_year: string;
  scheme: string;
  target_quantity: number;
  surrendered_quantity: number;
  shortfall: number;
  penalty_rate: number | null;
  penalty_exposure: number | null;
  surrender_deadline: string | null;
  status: 'in_progress' | 'compliant' | 'shortfall' | 'penalty_paid';
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Client CRUD
// ---------------------------------------------------------------------------

export async function createClient(
  orgId: string,
  data: CreateClientInput
): Promise<ClientRow> {
  const { rows } = await sql`
    INSERT INTO clients (
      organisation_id, name, entity_type,
      contact_email, contact_name, abn,
      ess_participant_id, annual_esc_target, annual_veec_target,
      safeguard_facility_id, metadata
    ) VALUES (
      ${orgId},
      ${data.name},
      ${data.entity_type},
      ${data.contact_email ?? null},
      ${data.contact_name ?? null},
      ${data.abn ?? null},
      ${data.ess_participant_id ?? null},
      ${data.annual_esc_target ?? null},
      ${data.annual_veec_target ?? null},
      ${data.safeguard_facility_id ?? null},
      ${JSON.stringify(data.metadata ?? {})}
    )
    RETURNING *
  `;
  return rows[0] as ClientRow;
}

export async function getClientsByOrganisation(orgId: string): Promise<ClientRow[]> {
  const { rows } = await sql`
    SELECT * FROM clients
    WHERE organisation_id = ${orgId}
    ORDER BY name ASC
  `;
  return rows as ClientRow[];
}

export async function getClient(
  clientId: string,
  orgId: string
): Promise<ClientRow | null> {
  const { rows } = await sql`
    SELECT * FROM clients
    WHERE id = ${clientId} AND organisation_id = ${orgId}
  `;
  return (rows[0] as ClientRow) ?? null;
}

export async function updateClient(
  clientId: string,
  orgId: string,
  data: UpdateClientInput
): Promise<ClientRow | null> {
  // Build SET clause dynamically — only update provided fields
  const sets: string[] = [];
  const vals: unknown[] = [];

  if (data.name !== undefined) { sets.push('name'); vals.push(data.name); }
  if (data.entity_type !== undefined) { sets.push('entity_type'); vals.push(data.entity_type); }
  if (data.contact_email !== undefined) { sets.push('contact_email'); vals.push(data.contact_email); }
  if (data.contact_name !== undefined) { sets.push('contact_name'); vals.push(data.contact_name); }
  if (data.abn !== undefined) { sets.push('abn'); vals.push(data.abn); }
  if (data.ess_participant_id !== undefined) { sets.push('ess_participant_id'); vals.push(data.ess_participant_id); }
  if (data.annual_esc_target !== undefined) { sets.push('annual_esc_target'); vals.push(data.annual_esc_target); }
  if (data.annual_veec_target !== undefined) { sets.push('annual_veec_target'); vals.push(data.annual_veec_target); }
  if (data.safeguard_facility_id !== undefined) { sets.push('safeguard_facility_id'); vals.push(data.safeguard_facility_id); }
  if (data.is_active !== undefined) { sets.push('is_active'); vals.push(data.is_active); }
  if (data.metadata !== undefined) { sets.push('metadata'); vals.push(JSON.stringify(data.metadata)); }

  if (sets.length === 0) return getClient(clientId, orgId);

  // Use a simple full-update approach to avoid SQL injection with dynamic columns
  const current = await getClient(clientId, orgId);
  if (!current) return null;

  const merged = { ...current, ...data, metadata: data.metadata !== undefined ? data.metadata : current.metadata };

  const { rows } = await sql`
    UPDATE clients SET
      name = ${merged.name},
      entity_type = ${merged.entity_type},
      contact_email = ${merged.contact_email ?? null},
      contact_name = ${merged.contact_name ?? null},
      abn = ${merged.abn ?? null},
      ess_participant_id = ${merged.ess_participant_id ?? null},
      annual_esc_target = ${merged.annual_esc_target ?? null},
      annual_veec_target = ${merged.annual_veec_target ?? null},
      safeguard_facility_id = ${merged.safeguard_facility_id ?? null},
      is_active = ${merged.is_active},
      metadata = ${JSON.stringify(merged.metadata)},
      updated_at = now()
    WHERE id = ${clientId} AND organisation_id = ${orgId}
    RETURNING *
  `;
  return (rows[0] as ClientRow) ?? null;
}

// ---------------------------------------------------------------------------
// Holdings
// ---------------------------------------------------------------------------

export async function getClientHoldings(clientId: string): Promise<HoldingRow[]> {
  const { rows } = await sql`
    SELECT * FROM client_holdings
    WHERE client_id = ${clientId}
    ORDER BY instrument_type, vintage
  `;
  return rows as HoldingRow[];
}

export async function createHolding(
  clientId: string,
  data: CreateHoldingInput
): Promise<HoldingRow> {
  const totalCost = data.total_cost ?? (data.average_cost && data.quantity
    ? data.average_cost * data.quantity
    : null);

  const { rows } = await sql`
    INSERT INTO client_holdings (
      client_id, instrument_type, quantity,
      average_cost, total_cost, vintage,
      registry_reference, status
    ) VALUES (
      ${clientId},
      ${data.instrument_type},
      ${data.quantity},
      ${data.average_cost ?? null},
      ${totalCost ?? null},
      ${data.vintage ?? null},
      ${data.registry_reference ?? null},
      ${data.status ?? 'held'}
    )
    RETURNING *
  `;
  return rows[0] as HoldingRow;
}

// ---------------------------------------------------------------------------
// Surrender / Compliance
// ---------------------------------------------------------------------------

export async function getClientSurrenderStatus(
  clientId: string,
  year?: string
): Promise<SurrenderRow[]> {
  if (year) {
    const { rows } = await sql`
      SELECT * FROM surrender_tracking
      WHERE client_id = ${clientId} AND compliance_year = ${year}
      ORDER BY scheme
    `;
    return rows as SurrenderRow[];
  }

  const { rows } = await sql`
    SELECT * FROM surrender_tracking
    WHERE client_id = ${clientId}
    ORDER BY compliance_year DESC, scheme
  `;
  return rows as SurrenderRow[];
}
