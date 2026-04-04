/**
 * Price history and pricing config queries.
 */

import { sql } from '../connection';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PriceHistoryRow {
  id: string;
  instrument_id: string;
  price: number;
  source: string;
  recorded_at: string;
}

export interface PricingConfigRow {
  id: string;
  instrument_id: string;
  anchor_price: number;
  price_floor: number;
  premium_multiplier: number;
  max_concession_per_round: number;
  max_total_concession: number;
  min_rounds_before_concession: number;
  effective_from: string;
  effective_to: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Price History
// ---------------------------------------------------------------------------

export async function recordPrice(
  instrumentId: string,
  price: number,
  source: string
): Promise<PriceHistoryRow> {
  const { rows } = await sql`
    INSERT INTO price_history (instrument_id, price, source)
    VALUES (${instrumentId}, ${price}, ${source})
    RETURNING *
  `;
  return rows[0] as PriceHistoryRow;
}

export async function getPriceHistory(
  instrumentId: string,
  opts?: { limit?: number; since?: Date }
): Promise<PriceHistoryRow[]> {
  const limit = opts?.limit ?? 100;

  if (opts?.since) {
    const { rows } = await sql`
      SELECT * FROM price_history
      WHERE instrument_id = ${instrumentId}
        AND recorded_at >= ${opts.since.toISOString()}
      ORDER BY recorded_at DESC
      LIMIT ${limit}
    `;
    return rows as PriceHistoryRow[];
  }

  const { rows } = await sql`
    SELECT * FROM price_history
    WHERE instrument_id = ${instrumentId}
    ORDER BY recorded_at DESC
    LIMIT ${limit}
  `;
  return rows as PriceHistoryRow[];
}

// ---------------------------------------------------------------------------
// Pricing Config
// ---------------------------------------------------------------------------

export async function getActivePricingConfig(
  instrumentId: string
): Promise<PricingConfigRow | null> {
  const { rows } = await sql`
    SELECT * FROM pricing_config
    WHERE instrument_id = ${instrumentId}
      AND effective_from <= now()
      AND (effective_to IS NULL OR effective_to > now())
    ORDER BY effective_from DESC
    LIMIT 1
  `;
  return (rows[0] as PricingConfigRow) ?? null;
}

export async function upsertPricingConfig(input: {
  instrument_id: string;
  anchor_price: number;
  price_floor: number;
  premium_multiplier?: number;
  max_concession_per_round?: number;
  max_total_concession?: number;
  min_rounds_before_concession?: number;
}): Promise<PricingConfigRow> {
  // Expire current active config
  await sql`
    UPDATE pricing_config
    SET effective_to = now()
    WHERE instrument_id = ${input.instrument_id}
      AND effective_to IS NULL
  `;

  const { rows } = await sql`
    INSERT INTO pricing_config (
      instrument_id, anchor_price, price_floor, premium_multiplier,
      max_concession_per_round, max_total_concession, min_rounds_before_concession
    ) VALUES (
      ${input.instrument_id},
      ${input.anchor_price},
      ${input.price_floor},
      ${input.premium_multiplier ?? 1.5},
      ${input.max_concession_per_round ?? 0.05},
      ${input.max_total_concession ?? 0.20},
      ${input.min_rounds_before_concession ?? 3}
    )
    RETURNING *
  `;
  return rows[0] as PricingConfigRow;
}
