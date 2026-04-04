// =============================================================================
// WREI Platform — Settlement Types per WP5 §7
// =============================================================================

import { InstrumentType } from '../instruments/types';

// ---------------------------------------------------------------------------
// Settlement Status State Machine
// ---------------------------------------------------------------------------

export type SettlementStatusValue =
  | 'confirmed'          // Trade confirmed, awaiting settlement initiation
  | 'initiated'          // Settlement process started
  | 'processing'         // In-flight (registry transfer, blockchain tx)
  | 'transfer_recorded'  // Registry has recorded transfer (TESSA/CER/VEEC)
  | 'complete'           // Settlement finalised
  | 'failed'             // Settlement failed
  | 'cancelled';         // Settlement cancelled

export type SettlementMethod =
  | 'tessa_registry'     // ESC/PRC: TESSA manual registry transfer
  | 'cer_registry'       // ACCU: CER/CorTenX registry API
  | 'veec_registry'      // VEEC: Victorian ESC registry transfer
  | 'blockchain'         // WREI-CC/WREI-ACO: on-chain atomic (T+0)
  | 'zoniqx_zconnect'    // Zoniqx zConnect (stub only)
  | 'cortenx_api';       // Trovio CorTenX (stub only)

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

export interface CompletedTrade {
  tradeId: string;
  instrumentType: InstrumentType;
  instrumentId: string;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  currency: 'AUD' | 'USD';
  buyerId: string;
  sellerId: string;
  negotiationId?: string;
  executedAt: string; // ISO 8601
}

export interface SettlementStateTransition {
  from: SettlementStatusValue;
  to: SettlementStatusValue;
  timestamp: string;
  reason?: string;
}

export interface SettlementRecord {
  settlementId: string;
  tradeId: string;
  instrumentType: InstrumentType;
  method: SettlementMethod;
  status: SettlementStatusValue;
  initiatedAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedCompletionAt?: string;
  blockchainHash?: string;
  blockNumber?: number;
  confirmationCount?: number;
  registryReference?: string;
  transferInstructions?: string;
  metadata: Record<string, unknown>;
  history: SettlementStateTransition[];
}

export interface SettlementStatus {
  settlementId: string;
  status: SettlementStatusValue;
  updatedAt: string;
  estimatedCompletionAt?: string;
  metadata: Record<string, unknown>;
}

export interface SettlementConfirmation {
  settlementId: string;
  confirmed: boolean;
  confirmedAt?: string;
  reference?: string;
}

export interface CancellationResult {
  settlementId: string;
  cancelled: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// SettlementAdapter Interface — WP5 §7
// ---------------------------------------------------------------------------

export interface SettlementAdapter {
  readonly adapterName: string;
  readonly supportedInstruments: InstrumentType[];

  initiateSettlement(trade: CompletedTrade): Promise<SettlementRecord>;
  getSettlementStatus(settlementId: string): Promise<SettlementStatus>;
  confirmSettlement(settlementId: string): Promise<SettlementConfirmation>;
  cancelSettlement(settlementId: string): Promise<CancellationResult>;
}
