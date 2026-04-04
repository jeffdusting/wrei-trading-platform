/**
 * Negotiation session CRUD operations.
 */

import { sql } from '../connection';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NegotiationRow {
  id: string;
  instrument_id: string | null;
  persona_type: string;
  credit_type: string;
  token_type: string;
  phase: string;
  round: number;
  anchor_price: number;
  current_offer: number;
  price_floor: number;
  total_concession: number;
  outcome: string | null;
  buyer_profile: Record<string, unknown>;
  messages: unknown[];
  state_snapshot: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNegotiationInput {
  instrument_id?: string;
  persona_type: string;
  credit_type?: string;
  token_type?: string;
  anchor_price: number;
  current_offer: number;
  price_floor: number;
  buyer_profile?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function createNegotiation(
  input: CreateNegotiationInput
): Promise<NegotiationRow> {
  const { rows } = await sql`
    INSERT INTO negotiations (
      instrument_id, persona_type, credit_type, token_type,
      anchor_price, current_offer, price_floor, buyer_profile
    ) VALUES (
      ${input.instrument_id ?? null},
      ${input.persona_type},
      ${input.credit_type ?? 'carbon'},
      ${input.token_type ?? 'carbon_credits'},
      ${input.anchor_price},
      ${input.current_offer},
      ${input.price_floor},
      ${JSON.stringify(input.buyer_profile ?? {})}
    )
    RETURNING *
  `;
  return rows[0] as NegotiationRow;
}

export async function getNegotiationById(
  id: string
): Promise<NegotiationRow | null> {
  const { rows } = await sql`
    SELECT * FROM negotiations WHERE id = ${id}
  `;
  return (rows[0] as NegotiationRow) ?? null;
}

export async function updateNegotiationState(
  id: string,
  update: {
    phase?: string;
    round?: number;
    current_offer?: number;
    total_concession?: number;
    outcome?: string;
    messages?: unknown[];
    state_snapshot?: Record<string, unknown>;
    completed_at?: Date;
  }
): Promise<NegotiationRow | null> {
  // Build partial update — only set fields that are provided
  const { rows } = await sql`
    UPDATE negotiations SET
      phase            = COALESCE(${update.phase ?? null}, phase),
      round            = COALESCE(${update.round ?? null}, round),
      current_offer    = COALESCE(${update.current_offer ?? null}, current_offer),
      total_concession = COALESCE(${update.total_concession ?? null}, total_concession),
      outcome          = COALESCE(${update.outcome ?? null}, outcome),
      messages         = COALESCE(${update.messages ? JSON.stringify(update.messages) : null}::jsonb, messages),
      state_snapshot   = COALESCE(${update.state_snapshot ? JSON.stringify(update.state_snapshot) : null}::jsonb, state_snapshot),
      completed_at     = COALESCE(${update.completed_at?.toISOString() ?? null}, completed_at),
      updated_at       = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as NegotiationRow) ?? null;
}

export async function listNegotiations(opts?: {
  persona_type?: string;
  outcome?: string;
  limit?: number;
  offset?: number;
}): Promise<NegotiationRow[]> {
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;

  if (opts?.persona_type) {
    const { rows } = await sql`
      SELECT * FROM negotiations
      WHERE persona_type = ${opts.persona_type}
      ORDER BY started_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows as NegotiationRow[];
  }

  const { rows } = await sql`
    SELECT * FROM negotiations
    ORDER BY started_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as NegotiationRow[];
}
