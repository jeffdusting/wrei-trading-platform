/**
 * Basic database connection and schema tests.
 *
 * These tests verify the module structure compiles and exports correctly.
 * Live database tests require POSTGRES_URL and are skipped in CI without it.
 */

import {
  SCHEMA_VERSION,
  ALL_TABLES,
} from '@/lib/db/schema';

import {
  checkConnection,
} from '@/lib/db/connection';

import {
  runMigrations,
} from '@/lib/db/migrate';

// ---------------------------------------------------------------------------
// Schema structure tests (no database required)
// ---------------------------------------------------------------------------

describe('Database Schema', () => {
  it('exports a positive schema version', () => {
    expect(SCHEMA_VERSION).toBeGreaterThan(0);
  });

  it('defines all 8 required tables', () => {
    expect(ALL_TABLES).toHaveLength(8);
  });

  it('each DDL statement is a non-empty string', () => {
    for (const ddl of ALL_TABLES) {
      expect(typeof ddl).toBe('string');
      expect(ddl.length).toBeGreaterThan(10);
    }
  });

  it('DDL includes expected table names', () => {
    const combined = ALL_TABLES.join('\n');
    const expectedTables = [
      'instruments',
      'trades',
      'negotiations',
      'settlements',
      'pricing_config',
      'price_history',
      'audit_log',
      'feed_status',
    ];
    for (const table of expectedTables) {
      expect(combined).toContain(table);
    }
  });
});

// ---------------------------------------------------------------------------
// Query module import tests (no database required)
// ---------------------------------------------------------------------------

describe('Query modules', () => {
  it('trades module exports CRUD functions', async () => {
    const trades = await import('@/lib/db/queries/trades');
    expect(typeof trades.createTrade).toBe('function');
    expect(typeof trades.getTradeById).toBe('function');
    expect(typeof trades.listTrades).toBe('function');
    expect(typeof trades.updateTradeStatus).toBe('function');
  });

  it('negotiations module exports CRUD functions', async () => {
    const negotiations = await import('@/lib/db/queries/negotiations');
    expect(typeof negotiations.createNegotiation).toBe('function');
    expect(typeof negotiations.getNegotiationById).toBe('function');
    expect(typeof negotiations.updateNegotiationState).toBe('function');
    expect(typeof negotiations.listNegotiations).toBe('function');
  });

  it('audit-log module exports write and read functions', async () => {
    const audit = await import('@/lib/db/queries/audit-log');
    expect(typeof audit.writeAuditEntry).toBe('function');
    expect(typeof audit.getAuditTrail).toBe('function');
    expect(typeof audit.getRecentAuditEntries).toBe('function');
  });

  it('pricing module exports query functions', async () => {
    const pricing = await import('@/lib/db/queries/pricing');
    expect(typeof pricing.recordPrice).toBe('function');
    expect(typeof pricing.getPriceHistory).toBe('function');
    expect(typeof pricing.getActivePricingConfig).toBe('function');
    expect(typeof pricing.upsertPricingConfig).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Live connection tests (skipped without POSTGRES_URL)
// ---------------------------------------------------------------------------

const hasDatabase = !!process.env.POSTGRES_URL;

describe('Database Connection', () => {
  (hasDatabase ? it : it.skip)(
    'can connect and ping the database',
    async () => {
      const result = await checkConnection();
      expect(result.ok).toBe(true);
      expect(result.latencyMs).toBeLessThan(5000);
    }
  );

  (hasDatabase ? it : it.skip)(
    'can run migrations',
    async () => {
      const result = await runMigrations();
      expect(result.error).toBeUndefined();
      expect(result.version).toBe(SCHEMA_VERSION);
    }
  );
});
