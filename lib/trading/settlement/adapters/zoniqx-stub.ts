// =============================================================================
// WREI Platform — Zoniqx zConnect API Contract Stub
//
// This is a documented API contract stub — NOT a live integration.
// Defines the expected Zoniqx zConnect settlement interface for future
// production integration. All methods throw NotImplemented.
//
// Zoniqx zConnect: T+0 atomic, non-custodial, cross-chain settlement
// Token standard: zProtocol (DyCIST / ERC-7518), CertiK-audited
// =============================================================================

import type { InstrumentType } from '../../instruments/types';
import type {
  SettlementAdapter,
  CompletedTrade,
  SettlementRecord,
  SettlementStatus,
  SettlementConfirmation,
  CancellationResult,
} from '../types';

// ---------------------------------------------------------------------------
// Zoniqx zConnect API Contract — Documented Endpoints
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/settlement/initiate
 * Headers: { Authorization: Bearer <api_key>, X-Client-Id: <client_id> }
 * Body: {
 *   tradeId: string,
 *   tokenId: string,
 *   tokenStandard: 'ERC-7518',
 *   fromWallet: string,
 *   toWallet: string,
 *   amount: number,
 *   currency: 'USD' | 'AUD',
 *   settlementType: 'atomic' | 'escrow',
 *   complianceCheck: boolean,
 *   crossChain?: { sourceChain: string, targetChain: string }
 * }
 * Response: { settlementId: string, status: 'pending', txHash?: string }
 *
 * GET /api/v1/settlement/:settlementId/status
 * Response: { settlementId, status, confirmations, blockNumber, txHash }
 *
 * POST /api/v1/settlement/:settlementId/confirm
 * Response: { settlementId, confirmed: boolean, finalTxHash, blockNumber }
 *
 * POST /api/v1/settlement/:settlementId/cancel
 * Response: { settlementId, cancelled: boolean, reason? }
 *
 * GET /api/v1/compliance/check
 * Query: { walletAddress, jurisdiction, tokenId }
 * Response: { eligible: boolean, restrictions: string[], kycStatus }
 */

const NOT_IMPLEMENTED = 'Zoniqx zConnect stub — not connected to live API';

export class ZoniqxSettlementStub implements SettlementAdapter {
  readonly adapterName = 'Zoniqx zConnect (Stub)';
  readonly supportedInstruments: InstrumentType[] = ['WREI_CC', 'WREI_ACO'];

  async initiateSettlement(_trade: CompletedTrade): Promise<SettlementRecord> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async getSettlementStatus(_settlementId: string): Promise<SettlementStatus> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async confirmSettlement(_settlementId: string): Promise<SettlementConfirmation> {
    throw new Error(NOT_IMPLEMENTED);
  }

  async cancelSettlement(_settlementId: string): Promise<CancellationResult> {
    throw new Error(NOT_IMPLEMENTED);
  }
}
