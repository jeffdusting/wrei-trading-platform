/**
 * POST /api/v1/import/{type} — CSV data import endpoints
 *
 * Accepts CSV uploads for: clients, counterparties, trades, inventory.
 * Requires admin role. Returns { imported, skipped, errors }.
 */

import { NextRequest } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/auth/middleware';
import { apiSuccess, apiError } from '@/lib/api/response';
import { sql } from '@/lib/db/connection';

// ---------------------------------------------------------------------------
// CSV parsing helper
// ---------------------------------------------------------------------------

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_ENTITY_TYPES = new Set(['acp', 'obligated_entity', 'government', 'corporate', 'institutional']);
const VALID_INSTRUMENTS = new Set(['ESC', 'VEEC', 'ACCU', 'STC', 'LGC']);
const VALID_SIDES = new Set(['buy', 'sell']);
const VALID_INV_STATUS = new Set(['registered', 'unregistered', 'committed']);

// ---------------------------------------------------------------------------
// POST handler — type determined by ?type= query parameter
// ---------------------------------------------------------------------------

async function handlePost(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user || user.role !== 'admin') {
    return apiError('forbidden', 'Admin role required for data import', 403);
  }

  const importType = request.nextUrl.searchParams.get('type');
  if (!importType || !['clients', 'counterparties', 'trades', 'inventory'].includes(importType)) {
    return apiError('validation_error', 'Query param ?type= must be one of: clients, counterparties, trades, inventory', 400);
  }

  let csvText: string;
  try {
    csvText = await request.text();
  } catch {
    return apiError('validation_error', 'Could not read CSV body', 400);
  }

  const rows = parseCSV(csvText);
  if (rows.length === 0) {
    return apiError('validation_error', 'CSV is empty or has no data rows', 400);
  }

  const orgId = user.organisationId;
  const result = { imported: 0, skipped: 0, errors: [] as string[] };

  switch (importType) {
    case 'clients':
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (!r.name || !VALID_ENTITY_TYPES.has(r.entity_type)) {
          result.errors.push(`Row ${i + 1}: missing name or invalid entity_type`);
          result.skipped++;
          continue;
        }
        try {
          await sql`INSERT INTO clients (organisation_id, name, entity_type, contact_email, contact_name, abn, ess_participant_id, annual_esc_target, annual_veec_target)
            VALUES (${orgId}, ${r.name}, ${r.entity_type}, ${r.contact_email || null}, ${r.contact_name || null}, ${r.abn || null}, ${r.ess_participant_id || null}, ${r.annual_esc_target ? parseInt(r.annual_esc_target) : null}, ${r.annual_veec_target ? parseInt(r.annual_veec_target) : null})`;
          result.imported++;
        } catch (e) {
          result.errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'DB error'}`);
          result.skipped++;
        }
      }
      break;

    case 'counterparties': {
      const seen = new Set<string>();
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const email = (r.email || '').toLowerCase();
        if (!r.name || !email) {
          result.errors.push(`Row ${i + 1}: missing name or email`);
          result.skipped++;
          continue;
        }
        if (seen.has(email)) {
          result.errors.push(`Row ${i + 1}: duplicate email '${email}'`);
          result.skipped++;
          continue;
        }
        seen.add(email);
        // Store as a client with entity_type from CSV (counterparties are stored in clients table)
        try {
          await sql`INSERT INTO clients (organisation_id, name, entity_type, contact_email, metadata)
            VALUES (${orgId}, ${r.name}, ${r.entity_type || 'acp'}, ${email}, ${JSON.stringify({ relationship: r.relationship || 'active', notes: r.notes || '' })})
            ON CONFLICT DO NOTHING`;
          result.imported++;
        } catch (e) {
          result.errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'DB error'}`);
          result.skipped++;
        }
      }
      break;
    }

    case 'trades':
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const instrument = (r.instrument_type || '').toUpperCase();
        const side = (r.side || '').toLowerCase();
        const qty = parseInt(r.quantity || '0');
        const price = parseFloat(r.price_per_cert || '0');

        if (!r.trade_date || !/^\d{4}-\d{2}-\d{2}$/.test(r.trade_date)) {
          result.errors.push(`Row ${i + 1}: invalid trade_date`);
          result.skipped++;
          continue;
        }
        if (!VALID_INSTRUMENTS.has(instrument) || !VALID_SIDES.has(side) || qty <= 0 || price <= 0) {
          result.errors.push(`Row ${i + 1}: invalid instrument/side/quantity/price`);
          result.skipped++;
          continue;
        }
        try {
          await sql`INSERT INTO trade_history (organisation_id, trade_date, instrument_type, side, quantity, price_per_cert, counterparty_name, client_name, settlement_status, source)
            VALUES (${orgId}, ${r.trade_date}, ${instrument}, ${side}, ${qty}, ${price}, ${r.counterparty_name || null}, ${r.client_name || null}, ${r.settlement_status || 'settled'}, 'import')`;
          result.imported++;
        } catch (e) {
          result.errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'DB error'}`);
          result.skipped++;
        }
      }
      break;

    case 'inventory':
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const instrument = (r.instrument_type || '').toUpperCase();
        const status = (r.status || 'registered').toLowerCase();
        const qty = parseInt(r.quantity || '0');
        const avgCost = r.average_cost ? parseFloat(r.average_cost) : null;

        if (!VALID_INSTRUMENTS.has(instrument) || !VALID_INV_STATUS.has(status) || qty <= 0) {
          result.errors.push(`Row ${i + 1}: invalid instrument/status/quantity`);
          result.skipped++;
          continue;
        }
        // Map inventory status to client_holdings status
        const holdingStatus = status === 'registered' ? 'held' : status === 'committed' ? 'pending_transfer' : 'held';
        try {
          // Use a synthetic client_id for NMG's own holdings (the org itself)
          // First get or create the org's own client record
          const { rows: existing } = await sql`
            SELECT id FROM clients WHERE organisation_id = ${orgId} AND name = 'NMG Holdings' LIMIT 1`;
          let clientId: string;
          if (existing.length > 0) {
            clientId = existing[0].id;
          } else {
            const { rows: created } = await sql`
              INSERT INTO clients (organisation_id, name, entity_type, metadata)
              VALUES (${orgId}, 'NMG Holdings', 'acp', '{"is_own_holdings": true}')
              RETURNING id`;
            clientId = created[0].id;
          }
          await sql`INSERT INTO client_holdings (client_id, instrument_type, quantity, average_cost, vintage, registry_reference, status)
            VALUES (${clientId}, ${instrument}, ${qty}, ${avgCost}, ${r.vintage || null}, ${r.registry_reference || null}, ${holdingStatus})`;
          result.imported++;
        } catch (e) {
          result.errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'DB error'}`);
          result.skipped++;
        }
      }
      break;
  }

  return apiSuccess(result);
}

export const POST = withAuth(handlePost, { roles: ['admin'] });
