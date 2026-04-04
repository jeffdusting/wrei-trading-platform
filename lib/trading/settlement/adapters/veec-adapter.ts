// =============================================================================
// WREI Platform — VEEC Settlement Adapter
// Mirrors TESSA pattern for Victorian Energy Efficiency Certificate registry
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

function generateTransferInstructions(trade: CompletedTrade): string {
  return [
    `VEEC REGISTRY TRANSFER — Essential Services Commission (Victoria)`,
    `──────────────────────────────────────────`,
    `Trade ID:        ${trade.tradeId}`,
    `Instrument:      VEEC`,
    `Quantity:         ${trade.quantity.toLocaleString()} certificates`,
    `Price:           A$${trade.pricePerUnit.toFixed(2)}/certificate`,
    `Total Value:     A$${trade.totalValue.toFixed(2)}`,
    ``,
    `Seller Account:  ${trade.sellerId}`,
    `Buyer Account:   ${trade.buyerId}`,
    ``,
    `Instructions:`,
    `1. Log in to the VEU Registry at https://veu-registry.esc.vic.gov.au`,
    `2. Navigate to Transfer → Initiate Certificate Transfer`,
    `3. Enter buyer account number: ${trade.buyerId}`,
    `4. Select ${trade.quantity} VEEC certificates for transfer`,
    `5. Confirm transfer and note the ESC reference number`,
    `6. Upload confirmation to WREI platform`,
    ``,
    `Estimated completion: 1–3 business days`,
  ].join('\n');
}

function estimateCompletion(): string {
  const days = 1 + Math.floor(Math.random() * 3);
  const completion = new Date();
  let added = 0;
  while (added < days) {
    completion.setDate(completion.getDate() + 1);
    const dow = completion.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return completion.toISOString();
}

export class VeecSettlementAdapter implements SettlementAdapter {
  readonly adapterName = 'Victorian ESC Registry';
  readonly supportedInstruments: InstrumentType[] = ['VEEC'];

  async initiateSettlement(trade: CompletedTrade): Promise<SettlementRecord> {
    const now = new Date().toISOString();
    const settlementId = `VEEC-${Date.now()}`;

    const record: SettlementRecord = {
      settlementId,
      tradeId: trade.tradeId,
      instrumentType: trade.instrumentType,
      method: 'veec_registry',
      status: 'initiated',
      initiatedAt: now,
      updatedAt: now,
      estimatedCompletionAt: estimateCompletion(),
      registryReference: `VEU-REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      transferInstructions: generateTransferInstructions(trade),
      metadata: {
        registry: 'Victorian Energy Upgrades',
        administrator: 'Essential Services Commission',
        transferType: 'manual_registry',
      },
      history: [{
        from: 'confirmed',
        to: 'initiated',
        timestamp: now,
        reason: 'Transfer instructions generated for VEU Registry',
      }],
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

    if (record.status === 'initiated') {
      const transition: SettlementStateTransition = {
        from: 'initiated',
        to: 'transfer_recorded',
        timestamp: now,
        reason: 'ESC Victoria confirmed registry transfer recorded',
      };
      record.status = 'transfer_recorded';
      record.updatedAt = now;
      record.history.push(transition);
      records.set(settlementId, record);
      return { settlementId, confirmed: false, reference: record.registryReference };
    }

    if (record.status === 'transfer_recorded') {
      const transition: SettlementStateTransition = {
        from: 'transfer_recorded',
        to: 'complete',
        timestamp: now,
        reason: 'Transfer confirmed by receiving party',
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
