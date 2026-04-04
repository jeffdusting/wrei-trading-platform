// =============================================================================
// WREI Platform — Blockchain Settlement Adapter (WREI-CC / WREI-ACO)
// Simulated on-chain atomic settlement: T+0 instant
// Generates transaction hash, block number, confirmation count
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

function generateTxHash(): string {
  const bytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  return `0x${bytes}`;
}

function generateBlockNumber(): number {
  // Simulate a realistic Ethereum-like block number
  return 19_500_000 + Math.floor(Math.random() * 500_000);
}

function generateContractAddress(): string {
  const bytes = Array.from({ length: 20 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  return `0x${bytes}`;
}

export class BlockchainSettlementAdapter implements SettlementAdapter {
  readonly adapterName = 'Blockchain (On-Chain)';
  readonly supportedInstruments: InstrumentType[] = ['WREI_CC', 'WREI_ACO'];

  async initiateSettlement(trade: CompletedTrade): Promise<SettlementRecord> {
    const now = new Date().toISOString();
    const settlementId = `BLK-${trade.instrumentType}-${Date.now()}`;
    const txHash = generateTxHash();
    const blockNumber = generateBlockNumber();

    const tokenStandard = trade.instrumentType === 'WREI_CC'
      ? 'ERC-7518 (DyCIST)'
      : 'ERC-7518 (DyCIST)';
    const tokenDescription = trade.instrumentType === 'WREI_CC'
      ? 'WREI Carbon Credit Token'
      : 'WREI Asset Co Token';

    // T+0 settlement: completes immediately
    const record: SettlementRecord = {
      settlementId,
      tradeId: trade.tradeId,
      instrumentType: trade.instrumentType,
      method: 'blockchain',
      status: 'complete',
      initiatedAt: now,
      updatedAt: now,
      completedAt: now,
      blockchainHash: txHash,
      blockNumber,
      confirmationCount: 12,
      metadata: {
        network: 'Ethereum L2 (Polygon)',
        tokenStandard,
        tokenDescription,
        contractAddress: generateContractAddress(),
        fromAddress: `0x${trade.sellerId.replace(/[^a-f0-9]/gi, '').padEnd(40, '0').slice(0, 40)}`,
        toAddress: `0x${trade.buyerId.replace(/[^a-f0-9]/gi, '').padEnd(40, '0').slice(0, 40)}`,
        tokenAmount: trade.quantity,
        gasUsed: 85_000 + Math.floor(Math.random() * 30_000),
        settlementCycle: 'T+0',
        auditedBy: 'CertiK',
        protocolVersion: 'zProtocol v2.1',
      },
      history: [
        { from: 'confirmed', to: 'initiated', timestamp: now, reason: 'On-chain transfer submitted' },
        { from: 'initiated', to: 'processing', timestamp: now, reason: 'Transaction included in block' },
        { from: 'processing', to: 'complete', timestamp: now, reason: `Confirmed in block ${blockNumber} (12 confirmations)` },
      ],
    };

    records.set(settlementId, record);
    return record;
  }

  async getSettlementStatus(settlementId: string): Promise<SettlementStatus> {
    const record = records.get(settlementId);
    if (!record) throw new Error(`Settlement not found: ${settlementId}`);

    // Simulate increasing confirmation count over time
    if (record.confirmationCount !== undefined && record.confirmationCount < 64) {
      record.confirmationCount = Math.min(64, record.confirmationCount + 3);
      records.set(settlementId, record);
    }

    return {
      settlementId: record.settlementId,
      status: record.status,
      updatedAt: record.updatedAt,
      metadata: {
        ...record.metadata,
        confirmationCount: record.confirmationCount,
        blockchainHash: record.blockchainHash,
        blockNumber: record.blockNumber,
      },
    };
  }

  async confirmSettlement(settlementId: string): Promise<SettlementConfirmation> {
    const record = records.get(settlementId);
    if (!record) throw new Error(`Settlement not found: ${settlementId}`);

    // Blockchain settlements are confirmed at initiation (T+0)
    return {
      settlementId,
      confirmed: record.status === 'complete',
      confirmedAt: record.completedAt,
      reference: record.blockchainHash,
    };
  }

  async cancelSettlement(settlementId: string): Promise<CancellationResult> {
    const record = records.get(settlementId);
    if (!record) throw new Error(`Settlement not found: ${settlementId}`);

    // On-chain transactions cannot be reversed once confirmed
    if (record.status === 'complete') {
      return {
        settlementId,
        cancelled: false,
        reason: 'On-chain settlement is irreversible once confirmed',
      };
    }

    const now = new Date().toISOString();
    record.history.push({ from: record.status, to: 'cancelled', timestamp: now, reason: 'Cancelled before confirmation' });
    record.status = 'cancelled';
    record.updatedAt = now;
    records.set(settlementId, record);
    return { settlementId, cancelled: true };
  }
}
