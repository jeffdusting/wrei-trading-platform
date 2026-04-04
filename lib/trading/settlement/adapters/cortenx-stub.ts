// =============================================================================
// WREI Platform — Trovio CorTenX API Contract Stub
//
// This is a documented API contract stub — NOT a live integration.
// Defines the expected Trovio CorTenX sub-registry API interface for
// future production integration. All methods throw NotImplemented.
//
// CorTenX: Trovio's registry platform for Australian carbon credit units
// Provides programmatic access to CER (Clean Energy Regulator) operations
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
// Trovio CorTenX API Contract — Documented Endpoints
// ---------------------------------------------------------------------------

/**
 * POST /api/v2/transfers/initiate
 * Headers: { Authorization: Bearer <oauth_token>, X-Participant-Id: <id> }
 * Body: {
 *   transferType: 'standard' | 'voluntary_cancellation' | 'safeguard_surrender',
 *   fromAccount: string,         // CER registry account number
 *   toAccount: string,           // CER registry account number
 *   units: {
 *     projectId: string,         // ERF project ID
 *     methodology: string,       // ERF methodology name
 *     vintage: string,           // Year of issuance
 *     quantity: number,          // Number of ACCUs
 *     serialRange?: { start: string, end: string }
 *   },
 *   reference: string,           // External trade reference
 *   callbackUrl?: string         // Webhook for status updates
 * }
 * Response: { transferId: string, status: 'submitted', estimatedCompletion: string }
 *
 * GET /api/v2/transfers/:transferId
 * Response: {
 *   transferId, status: 'submitted' | 'processing' | 'completed' | 'rejected',
 *   units: { projectId, quantity, serialRange },
 *   timestamps: { submitted, processing?, completed?, rejected? },
 *   cerReference?: string
 * }
 *
 * POST /api/v2/transfers/:transferId/confirm
 * Response: { transferId, confirmed: boolean, cerReference, completedAt }
 *
 * DELETE /api/v2/transfers/:transferId
 * Response: { transferId, cancelled: boolean, reason? }
 *
 * GET /api/v2/holdings
 * Query: { accountId, projectId?, methodology?, vintage? }
 * Response: { holdings: Array<{ projectId, methodology, vintage, quantity, serialRange }> }
 *
 * GET /api/v2/projects/:projectId
 * Response: { projectId, name, methodology, proponent, status, totalIssuance }
 */

const NOT_IMPLEMENTED = 'CorTenX stub — not connected to live Trovio API';

export class CortenxSettlementStub implements SettlementAdapter {
  readonly adapterName = 'Trovio CorTenX (Stub)';
  readonly supportedInstruments: InstrumentType[] = ['ACCU'];

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
