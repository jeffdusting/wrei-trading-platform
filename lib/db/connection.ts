/**
 * Vercel Postgres connection pool setup.
 *
 * Uses @vercel/postgres which reads POSTGRES_URL (and variants) from
 * process.env automatically.  In local development, set these in .env.local.
 */

import { sql, db, createPool } from '@vercel/postgres';
import type { VercelPool } from '@vercel/postgres';

// ---------------------------------------------------------------------------
// Singleton pool — reused across requests in the same serverless invocation
// ---------------------------------------------------------------------------

let _pool: VercelPool | null = null;

export function getPool(): VercelPool {
  if (!_pool) {
    _pool = createPool({
      connectionString: process.env.POSTGRES_URL,
      max: 10,            // max connections per serverless instance
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return _pool;
}

// ---------------------------------------------------------------------------
// Convenience re-exports
// ---------------------------------------------------------------------------

/** Tagged-template helper — `sql\`SELECT ...\`` */
export { sql };

/** Pre-configured pool client for transactions */
export { db };

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export async function checkConnection(): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await sql`SELECT 1 AS ping`;
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
