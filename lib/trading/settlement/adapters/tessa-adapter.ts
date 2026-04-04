// =============================================================================
// WREI Platform — TESSA Settlement Adapter (ESC / PRC)
// Simulated multi-step registry transfer: Initiated → Transfer Recorded → Complete
// Realistic timing: 1–3 business days
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
  const registryName = trade.instrumentType === 'ESC'
    ? 'NSW ESS Registry (IPART)'
    : 'NSW PDRS Registry (IPART)';
  return [
    `TESSA TRANSFER INSTRUCTION — ${registryName}`,
    `──────────────────────────────────────────`,
    `Trade ID:        ${trade.tradeId}`,
    `Instrument:      ${trade.instrumentType}`,
    `Quantity:         ${trade.quantity.toLocaleString()} certificates`,
    `Price:           A$${trade.pricePerUnit.toFixed(2)}/certificate`,
    `Total Value:     A$${trade.totalValue.toFixed(2)}`,
    ``,
    `Seller Account:  ${trade.sellerId}`,
    `Buyer Account:   ${trade.buyerId}`,
    ``,
    `Instructions:`,
    `1. Log in to TESSA at https://tessa.ipart.nsw.gov.au`,
    `2. Navigate to Transfer → Create New Transfer`,
    `3. Enter buyer account number: ${trade.buyerId}`,
    `4. Select ${trade.quantity} ${trade.instrumentType} certificates`,
    `5. Confirm transfer and note reference number`,
    `6. Upload confirmation to WREI platform`,
    ``,
    `Estimated completion: 1–3 business days`,
  ].join('\n');
}

function estimateCompletion(): string {
  const days = 1 + Math.floor(Math.random() * 3); // 1–3 business days
  const completion = new Date();
  let added = 0;
  while (added < days) {
    completion.setDate(completion.getDate() + 1);
    const dow = completion.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return completion.toISOString();
}

export class TessaSettlementAdapter implements SettlementAdapter {
  readonly adapterName = 'TESSA Registry';
  readonly supportedInstruments: InstrumentType[] = ['ESC', 'PRC'];

  async initiateSettlement(trade: CompletedTrade): Promise<SettlementRecord> {
    const now = new Date().toISOString();
    const settlementId = `TESSA-${trade.instrumentType}-${Date.now()}`;
    const instructions = generateTransferInstructions(trade);

    const record: SettlementRecord = {
      settlementId,
      tradeId: trade.tradeId,
      instrumentType: trade.instrumentType,
      method: 'tessa_registry',
      status: 'initiated',
      initiatedAt: now,
      updatedAt: now,
      estimatedCompletionAt: estimateCompletion(),
      registryReference: `TESSA-REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      transferInstructions: instructions,
      metadata: {
        registry: trade.instrumentType === 'ESC' ? 'NSW ESS' : 'NSW PDRS',
        administrator: 'IPART',
        transferType: 'manual_registry',
      },
      history: [{
        from: 'confirmed',
        to: 'initiated',
        timestamp: now,
        reason: 'Transfer instructions generated',
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

    // Simulate multi-step: initiated → transfer_recorded → complete
    if (record.status === 'initiated') {
      const transition: SettlementStateTransition = {
        from: 'initiated',
        to: 'transfer_recorded',
        timestamp: now,
        reason: 'Registry transfer recorded by IPART',
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
