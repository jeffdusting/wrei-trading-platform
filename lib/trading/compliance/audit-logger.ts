// =============================================================================
// WREI Platform — Application-Level Audit Trail Logger
//
// Append-only audit logger for all platform actions. Writes to the audit_log
// table (via lib/db/queries/audit-log.ts) when DB is available, and always
// maintains an in-memory log for the current session.
//
// Called from: trade engine, settlement orchestrator, negotiation engine
// =============================================================================

import type { InstrumentType } from '../instruments/types';

// ---------------------------------------------------------------------------
// Action Types
// ---------------------------------------------------------------------------

export type AuditActionType =
  | 'trade_initiated'
  | 'trade_confirmed'
  | 'trade_cancelled'
  | 'negotiation_started'
  | 'negotiation_message'
  | 'negotiation_completed'
  | 'settlement_initiated'
  | 'settlement_state_change'
  | 'settlement_completed'
  | 'settlement_failed'
  | 'user_action'
  | 'config_change'
  | 'system_event';

// ---------------------------------------------------------------------------
// Audit Entry
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  timestamp: string;
  actionType: AuditActionType;
  userId: string | null;    // null for system-initiated actions
  instrumentId: string | null;
  instrumentType?: InstrumentType;
  sessionId: string | null;
  entityId?: string;        // trade ID, settlement ID, negotiation ID, etc.
  aiAssisted?: boolean;     // true for AI-negotiated trades (WP5 §8.2)
  details: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// In-Memory Store (always available, regardless of DB)
// ---------------------------------------------------------------------------

const auditLog: AuditLogEntry[] = [];
const MAX_IN_MEMORY_ENTRIES = 10_000;

// ---------------------------------------------------------------------------
// Core Logger
// ---------------------------------------------------------------------------

export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  const isAi = entry.aiAssisted ?? entry.actionType.startsWith('negotiation_');
  const fullEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    aiAssisted: isAi,
  };

  // Always append to in-memory log
  auditLog.push(fullEntry);
  if (auditLog.length > MAX_IN_MEMORY_ENTRIES) {
    auditLog.splice(0, auditLog.length - MAX_IN_MEMORY_ENTRIES);
  }

  // Fire-and-forget to Vercel Postgres if available
  try {
    const { writeAuditEntry } = await import('@/lib/db/queries/audit-log');
    await writeAuditEntry({
      entity_type: mapActionToEntityType(entry.actionType),
      entity_id: entry.entityId ?? entry.instrumentId ?? '00000000-0000-0000-0000-000000000000',
      action: entry.actionType,
      actor: entry.userId ?? 'system',
      details: {
        ...entry.details,
        instrumentType: entry.instrumentType,
        sessionId: entry.sessionId,
      },
    });
  } catch {
    // DB unavailable — in-memory log is authoritative
  }
}

// ---------------------------------------------------------------------------
// Convenience Loggers
// ---------------------------------------------------------------------------

export async function logTradeEvent(
  actionType: 'trade_initiated' | 'trade_confirmed' | 'trade_cancelled',
  tradeId: string,
  instrumentType: InstrumentType,
  details: Record<string, unknown>,
  sessionId?: string,
  userId?: string,
): Promise<void> {
  await logAuditEvent({
    actionType,
    userId: userId ?? null,
    instrumentId: tradeId,
    instrumentType,
    sessionId: sessionId ?? null,
    entityId: tradeId,
    details,
  });
}

export async function logNegotiationEvent(
  actionType: 'negotiation_started' | 'negotiation_message' | 'negotiation_completed',
  negotiationId: string,
  instrumentType: InstrumentType | undefined,
  details: Record<string, unknown>,
  sessionId?: string,
  userId?: string,
): Promise<void> {
  await logAuditEvent({
    actionType,
    userId: userId ?? null,
    instrumentId: negotiationId,
    instrumentType,
    sessionId: sessionId ?? null,
    entityId: negotiationId,
    aiAssisted: true, // All negotiation events are AI-assisted (WP5 §8.2)
    details: { ...details, aiAssisted: true },
  });
}

export async function logSettlementEvent(
  actionType: 'settlement_initiated' | 'settlement_state_change' | 'settlement_completed' | 'settlement_failed',
  settlementId: string,
  instrumentType: InstrumentType,
  details: Record<string, unknown>,
  sessionId?: string,
): Promise<void> {
  await logAuditEvent({
    actionType,
    userId: null,
    instrumentId: settlementId,
    instrumentType,
    sessionId: sessionId ?? null,
    entityId: settlementId,
    details,
  });
}

// ---------------------------------------------------------------------------
// Query (in-memory)
// ---------------------------------------------------------------------------

export function getAuditLog(opts?: {
  actionType?: AuditActionType;
  entityId?: string;
  instrumentType?: InstrumentType;
  limit?: number;
}): AuditLogEntry[] {
  let filtered = auditLog;
  if (opts?.actionType) filtered = filtered.filter(e => e.actionType === opts.actionType);
  if (opts?.entityId) filtered = filtered.filter(e => e.entityId === opts.entityId);
  if (opts?.instrumentType) filtered = filtered.filter(e => e.instrumentType === opts.instrumentType);
  const limit = opts?.limit ?? 100;
  return filtered.slice(-limit).reverse();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapActionToEntityType(action: AuditActionType): 'trade' | 'negotiation' | 'settlement' | 'system' {
  if (action.startsWith('trade_')) return 'trade';
  if (action.startsWith('negotiation_')) return 'negotiation';
  if (action.startsWith('settlement_')) return 'settlement';
  return 'system';
}
