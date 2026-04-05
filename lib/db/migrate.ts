/**
 * Schema migration runner for Vercel Postgres.
 *
 * Usage:
 *   import { runMigrations } from '@/lib/db/migrate';
 *   await runMigrations();        // idempotent — safe to call on every cold start
 *   await runMigrations(true);    // force re-run (drops + recreates)
 */

import { sql } from './connection';
import { ALL_TABLES, SCHEMA_VERSION } from './schema';

// ---------------------------------------------------------------------------
// Migration metadata table
// ---------------------------------------------------------------------------

const CREATE_MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS _migrations (
  version     INT          PRIMARY KEY,
  applied_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  checksum    VARCHAR(64)
);
`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface MigrationResult {
  applied: boolean;
  version: number;
  tablesCreated: number;
  error?: string;
}

export async function runMigrations(
  force = false
): Promise<MigrationResult> {
  try {
    // Ensure migration tracking table exists
    await sql.query(CREATE_MIGRATIONS_TABLE);

    // Check current version
    const { rows } = await sql`
      SELECT version FROM _migrations
      ORDER BY version DESC
      LIMIT 1
    `;

    const currentVersion = rows[0]?.version ?? 0;

    if (currentVersion >= SCHEMA_VERSION && !force) {
      return {
        applied: false,
        version: currentVersion,
        tablesCreated: 0,
      };
    }

    // Run all DDL statements
    let tablesCreated = 0;
    for (const ddl of ALL_TABLES) {
      await sql.query(ddl);
      tablesCreated++;
    }

    // Record migration
    await sql`
      INSERT INTO _migrations (version)
      VALUES (${SCHEMA_VERSION})
      ON CONFLICT (version) DO UPDATE
        SET applied_at = now()
    `;

    return {
      applied: true,
      version: SCHEMA_VERSION,
      tablesCreated,
    };
  } catch (err) {
    return {
      applied: false,
      version: 0,
      tablesCreated: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Drop all application tables. Destructive — use only in dev/test.
 */
export async function resetSchema(): Promise<void> {
  const tables = [
    'backtest_results',
    'intelligence_alerts',
    'forecasts',
    'market_metrics',
    'creation_volumes',
    'market_data_daily',
    'surrender_tracking',
    'client_holdings',
    'clients',
    'feed_status',
    'audit_log',
    'price_history',
    'pricing_config',
    'settlements',
    'trades',
    'negotiations',
    'instruments',
    'sessions',
    'users',
    'organisations',
    '_migrations',
  ];
  for (const t of tables) {
    await sql.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
  }
}
