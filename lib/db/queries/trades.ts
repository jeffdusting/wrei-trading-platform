/**
 * Trade CRUD operations.
 */

import { sql } from '../connection';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TradeRow {
  id: string;
  instrument_id: string;
  negotiation_id: string | null;
  direction: 'buy' | 'sell';
  quantity: number;
  price_per_unit: number;
  total_value: number;
  currency: string;
  buyer_persona: string | null;
  status: 'pending' | 'confirmed' | 'settled' | 'cancelled';
  executed_at: string;
  settled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateTradeInput {
  instrument_id: string;
  negotiation_id?: string;
  direction: 'buy' | 'sell';
  quantity: number;
  price_per_unit: number;
  currency?: string;
  buyer_persona?: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function createTrade(input: CreateTradeInput): Promise<TradeRow> {
  const totalValue = input.quantity * input.price_per_unit;
  const { rows } = await sql`
    INSERT INTO trades (
      instrument_id, negotiation_id, direction, quantity,
      price_per_unit, total_value, currency, buyer_persona, metadata
    ) VALUES (
      ${input.instrument_id},
      ${input.negotiation_id ?? null},
      ${input.direction},
      ${input.quantity},
      ${input.price_per_unit},
      ${totalValue},
      ${input.currency ?? 'USD'},
      ${input.buyer_persona ?? null},
      ${JSON.stringify(input.metadata ?? {})}
    )
    RETURNING *
  `;
  return rows[0] as TradeRow;
}

export async function getTradeById(id: string): Promise<TradeRow | null> {
  const { rows } = await sql`
    SELECT * FROM trades WHERE id = ${id}
  `;
  return (rows[0] as TradeRow) ?? null;
}

export async function listTrades(opts?: {
  status?: string;
  instrument_id?: string;
  limit?: number;
  offset?: number;
}): Promise<TradeRow[]> {
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;

  if (opts?.status && opts?.instrument_id) {
    const { rows } = await sql`
      SELECT * FROM trades
      WHERE status = ${opts.status} AND instrument_id = ${opts.instrument_id}
      ORDER BY executed_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows as TradeRow[];
  }
  if (opts?.status) {
    const { rows } = await sql`
      SELECT * FROM trades
      WHERE status = ${opts.status}
      ORDER BY executed_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows as TradeRow[];
  }
  if (opts?.instrument_id) {
    const { rows } = await sql`
      SELECT * FROM trades
      WHERE instrument_id = ${opts.instrument_id}
      ORDER BY executed_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows as TradeRow[];
  }

  const { rows } = await sql`
    SELECT * FROM trades
    ORDER BY executed_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as TradeRow[];
}

export async function updateTradeStatus(
  id: string,
  status: TradeRow['status'],
  settledAt?: Date
): Promise<TradeRow | null> {
  const { rows } = await sql`
    UPDATE trades
    SET status = ${status},
        settled_at = ${settledAt?.toISOString() ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as TradeRow) ?? null;
}
