// =============================================================================
// WREI Platform — Settlement Orchestrator
//
// Routes completed trades to the correct adapter based on instrument type.
// Manages settlement state machine: Confirmed → Processing → Complete | Failed
// Writes all state transitions to the settlements table and audit log.
// Circuit breaker wrapper per adapter per WP6 §3.6.
// =============================================================================

import type { InstrumentType } from '../instruments/types';
import type {
  SettlementAdapter,
  CompletedTrade,
  SettlementRecord,
  SettlementStatus,
  SettlementConfirmation,
  CancellationResult,
  SettlementMethod,
} from './types';
import { TessaSettlementAdapter } from './adapters/tessa-adapter';
import { CerSettlementAdapter } from './adapters/cer-adapter';
import { VeecSettlementAdapter } from './adapters/veec-adapter';
import { BlockchainSettlementAdapter } from './adapters/blockchain-adapter';
import { logSettlementEvent } from '../compliance/audit-logger';

// ---------------------------------------------------------------------------
// Circuit Breaker (WP6 §3.6)
// ---------------------------------------------------------------------------

interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half_open';
  failures: number;
  lastFailureAt: number;
}

const BREAKER_THRESHOLD = 3;
const BREAKER_TIMEOUT_MS = 60_000;
const breakers = new Map<string, CircuitBreakerState>();

function getBreaker(name: string): CircuitBreakerState {
  if (!breakers.has(name)) {
    breakers.set(name, { status: 'closed', failures: 0, lastFailureAt: 0 });
  }
  return breakers.get(name)!;
}

function checkBreaker(name: string): boolean {
  const b = getBreaker(name);
  if (b.status === 'closed') return true;
  if (b.status === 'open' && Date.now() - b.lastFailureAt > BREAKER_TIMEOUT_MS) {
    b.status = 'half_open';
    return true; // allow one test request
  }
  return b.status === 'half_open'; // half_open allows one request
}

function recordSuccess(name: string): void {
  const b = getBreaker(name);
  b.status = 'closed';
  b.failures = 0;
}

function recordFailure(name: string): void {
  const b = getBreaker(name);
  b.failures++;
  b.lastFailureAt = Date.now();
  if (b.failures >= BREAKER_THRESHOLD) {
    b.status = 'open';
  }
}

// ---------------------------------------------------------------------------
// Adapter Registry
// ---------------------------------------------------------------------------

const adapters: SettlementAdapter[] = [
  new TessaSettlementAdapter(),
  new CerSettlementAdapter(),
  new VeecSettlementAdapter(),
  new BlockchainSettlementAdapter(),
];

function getAdapterForInstrument(instrumentType: InstrumentType): SettlementAdapter | null {
  return adapters.find(a => a.supportedInstruments.includes(instrumentType)) ?? null;
}

function getMethodForInstrument(instrumentType: InstrumentType): SettlementMethod {
  const methodMap: Record<InstrumentType, SettlementMethod> = {
    ESC: 'tessa_registry',
    PRC: 'tessa_registry',
    ACCU: 'cer_registry',
    VEEC: 'veec_registry',
    LGC: 'cer_registry',      // LGC settles via CER registry
    STC: 'cer_registry',      // STC settles via CER registry
    WREI_CC: 'blockchain',
    WREI_ACO: 'blockchain',
  };
  return methodMap[instrumentType];
}

// ---------------------------------------------------------------------------
// DB Persistence (fire-and-forget)
// ---------------------------------------------------------------------------

async function persistSettlement(record: SettlementRecord, tradeId: string): Promise<void> {
  try {
    const { sql } = await import('@/lib/db/connection');
    const methodDbValue = record.method === 'blockchain' ? 'zconnect'
      : record.method.includes('registry') ? 'registry'
      : 'manual';

    const statusDbValue = record.status === 'complete' ? 'completed'
      : record.status === 'failed' ? 'failed'
      : record.status === 'cancelled' ? 'failed'
      : record.status === 'initiated' || record.status === 'transfer_recorded' ? 'processing'
      : 'pending';

    await sql`
      INSERT INTO settlements (trade_id, method, status, blockchain_hash, settled_at, metadata)
      VALUES (
        ${tradeId},
        ${methodDbValue},
        ${statusDbValue},
        ${record.blockchainHash ?? null},
        ${record.completedAt ?? null},
        ${JSON.stringify(record.metadata)}
      )
      ON CONFLICT DO NOTHING
    `;
  } catch {
    // DB unavailable — in-memory record is authoritative
  }
}

// ---------------------------------------------------------------------------
// Orchestrator Public API
// ---------------------------------------------------------------------------

export async function settleTradeForInstrument(trade: CompletedTrade): Promise<SettlementRecord> {
  const adapter = getAdapterForInstrument(trade.instrumentType);
  if (!adapter) {
    throw new Error(`No settlement adapter for instrument type: ${trade.instrumentType}`);
  }

  const breakerName = adapter.adapterName;

  if (!checkBreaker(breakerName)) {
    await logSettlementEvent('settlement_failed', `FAIL-${trade.tradeId}`, trade.instrumentType, {
      reason: 'Circuit breaker open',
      adapter: breakerName,
      tradeId: trade.tradeId,
    });
    throw new Error(`Settlement adapter ${breakerName} circuit breaker is open`);
  }

  try {
    const record = await adapter.initiateSettlement(trade);

    recordSuccess(breakerName);

    // Log initiation
    await logSettlementEvent('settlement_initiated', record.settlementId, trade.instrumentType, {
      tradeId: trade.tradeId,
      method: record.method,
      adapter: breakerName,
      estimatedCompletion: record.estimatedCompletionAt,
    });

    // Log each state transition from history
    for (const transition of record.history) {
      await logSettlementEvent('settlement_state_change', record.settlementId, trade.instrumentType, {
        from: transition.from,
        to: transition.to,
        reason: transition.reason,
      });
    }

    // If already complete (T+0 blockchain), log completion
    if (record.status === 'complete') {
      await logSettlementEvent('settlement_completed', record.settlementId, trade.instrumentType, {
        tradeId: trade.tradeId,
        method: record.method,
        blockchainHash: record.blockchainHash,
        blockNumber: record.blockNumber,
      });
    }

    // Persist to DB
    await persistSettlement(record, trade.tradeId);

    return record;
  } catch (err) {
    recordFailure(breakerName);

    await logSettlementEvent('settlement_failed', `FAIL-${trade.tradeId}`, trade.instrumentType, {
      reason: err instanceof Error ? err.message : String(err),
      adapter: breakerName,
      tradeId: trade.tradeId,
    });

    throw err;
  }
}

export async function getSettlementStatusForTrade(
  settlementId: string,
  instrumentType: InstrumentType,
): Promise<SettlementStatus> {
  const adapter = getAdapterForInstrument(instrumentType);
  if (!adapter) throw new Error(`No settlement adapter for: ${instrumentType}`);
  return adapter.getSettlementStatus(settlementId);
}

export async function confirmSettlementForTrade(
  settlementId: string,
  instrumentType: InstrumentType,
): Promise<SettlementConfirmation> {
  const adapter = getAdapterForInstrument(instrumentType);
  if (!adapter) throw new Error(`No settlement adapter for: ${instrumentType}`);

  const result = await adapter.confirmSettlement(settlementId);

  if (result.confirmed) {
    await logSettlementEvent('settlement_completed', settlementId, instrumentType, {
      confirmedAt: result.confirmedAt,
      reference: result.reference,
    });
  }

  return result;
}

export async function cancelSettlementForTrade(
  settlementId: string,
  instrumentType: InstrumentType,
): Promise<CancellationResult> {
  const adapter = getAdapterForInstrument(instrumentType);
  if (!adapter) throw new Error(`No settlement adapter for: ${instrumentType}`);

  const result = await adapter.cancelSettlement(settlementId);

  if (result.cancelled) {
    await logSettlementEvent('settlement_state_change', settlementId, instrumentType, {
      to: 'cancelled',
      reason: result.reason ?? 'User-initiated cancellation',
    });
  }

  return result;
}

export { getMethodForInstrument, getAdapterForInstrument };
