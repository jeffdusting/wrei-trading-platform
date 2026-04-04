// =============================================================================
// WREI Platform — CER Settlement Adapter (ACCU)
// Simulated CorTenX API response with realistic unit data, T+1 timing
// =============================================================================

import type { InstrumentType } from '../../instruments/types';
import type {
  SettlementAdapter,
  CompletedTrade,
  SettlementRecord,
  SettlementStatus,
  SettlementConfirmation,
  CancellationResult,
  SettlementStateTransition,
} from '../types';

const records = new Map<string, SettlementRecord>();

function generateCortenxReference(): string {
  // Simulates a CorTenX transfer reference: CTX-YYYYMMDD-XXXXX
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CTX-${date}-${seq}`;
}

function generateAccuUnitData(trade: CompletedTrade): Record<string, unknown> {
  const projectId = `ERF-${100000 + Math.floor(Math.random() * 900000)}`;
  return {
    projectId,
    methodology: 'Avoided Clearing of Native Regrowth',
    vintage: new Date().getFullYear().toString(),
    unitSerialRange: {
      start: `ACCU-${projectId}-${String(1).padStart(6, '0')}`,
      end: `ACCU-${projectId}-${String(trade.quantity).padStart(6, '0')}`,
    },
    totalUnits: trade.quantity,
    unitType: 'tCO2e',
    registryAccountSeller: trade.sellerId,
    registryAccountBuyer: trade.buyerId,
    cerRegistryId: `CER-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  };
}

function estimateT1Completion(): string {
  const completion = new Date();
  // T+1: next business day
  completion.setDate(completion.getDate() + 1);
  while (completion.getDay() === 0 || completion.getDay() === 6) {
    completion.setDate(completion.getDate() + 1);
  }
  return completion.toISOString();
}

export class CerSettlementAdapter implements SettlementAdapter {
  readonly adapterName = 'CER Registry (CorTenX)';
  readonly supportedInstruments: InstrumentType[] = ['ACCU'];

  async initiateSettlement(trade: CompletedTrade): Promise<SettlementRecord> {
    const now = new Date().toISOString();
    const settlementId = `CER-ACCU-${Date.now()}`;
    const cortenxRef = generateCortenxReference();
    const unitData = generateAccuUnitData(trade);

    const record: SettlementRecord = {
      settlementId,
      tradeId: trade.tradeId,
      instrumentType: trade.instrumentType,
      method: 'cer_registry',
      status: 'processing',
      initiatedAt: now,
      updatedAt: now,
      estimatedCompletionAt: estimateT1Completion(),
      registryReference: cortenxRef,
      transferInstructions: [
        `CER REGISTRY TRANSFER — Clean Energy Regulator`,
        `──────────────────────────────────────────`,
        `CorTenX Reference: ${cortenxRef}`,
        `Project: ${unitData.projectId}`,
        `Units: ${trade.quantity} ACCU (${(unitData.unitSerialRange as { start: string }).start} – ${(unitData.unitSerialRange as { end: string }).end})`,
        `Methodology: ${unitData.methodology}`,
        ``,
        `Transfer submitted to CER via CorTenX API`,
        `Estimated completion: T+1 (next business day)`,
      ].join('\n'),
      metadata: {
        registry: 'Clean Energy Regulator',
        apiProvider: 'Trovio CorTenX',
        cortenxReference: cortenxRef,
        unitData,
      },
      history: [
        { from: 'confirmed', to: 'initiated', timestamp: now, reason: 'CER transfer request submitted' },
        { from: 'initiated', to: 'processing', timestamp: now, reason: 'CorTenX API accepted transfer' },
      ],
    };

    records.set(settlementId, record);
    return record;
  }

  async getSettlementStatus(settlementId: string): Promise<SettlementStatus> {
    const record = records.get(settlementId);
    if (!record) throw new Error(`Settlement not found: ${settlementId}`);
    return {
      settlementId: record.settlementId,
      status: record.status,
      updatedAt: record.updatedAt,
      estimatedCompletionAt: record.estimatedCompletionAt,
      metadata: record.metadata,
    };
  }

  async confirmSettlement(settlementId: string): Promise<SettlementConfirmation> {
    const record = records.get(settlementId);
    if (!record) throw new Error(`Settlement not found: ${settlementId}`);

    const now = new Date().toISOString();

    if (record.status === 'processing') {
      const transition: SettlementStateTransition = {
        from: 'processing',
        to: 'complete',
        timestamp: now,
        reason: 'CER registry confirmed unit transfer via CorTenX',
      };
      record.status = 'complete';
      record.completedAt = now;
      record.updatedAt = now;
      record.history.push(transition);
      records.set(settlementId, record);
      return { settlementId, confirmed: true, confirmedAt: now, reference: record.registryReference };
    }

    return { settlementId, confirmed: record.status === 'complete', reference: record.registryReference };
  }

  async cancelSettlement(settlementId: string): Promise<CancellationResult> {
    const record = records.get(settlementId);
    if (!record) throw new Error(`Settlement not found: ${settlementId}`);
    if (record.status === 'complete') {
      return { settlementId, cancelled: false, reason: 'Settlement already complete' };
    }

    const now = new Date().toISOString();
    record.history.push({ from: record.status, to: 'cancelled', timestamp: now, reason: 'Cancelled by user' });
    record.status = 'cancelled';
    record.updatedAt = now;
    records.set(settlementId, record);
    return { settlementId, cancelled: true };
  }
}
