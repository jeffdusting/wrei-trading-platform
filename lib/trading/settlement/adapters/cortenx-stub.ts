// =============================================================================
// WREI Platform — Trovio CorTenX API Contract Stub
//
// Documented API contract stub with simulated responses for demo mode.
// Defines the expected Trovio CorTenX sub-registry API interface for
// future production integration. Returns realistic simulated responses.
//
// CorTenX: Trovio's registry platform for Australian carbon credit units
// Provides programmatic access to CER (Clean Energy Regulator) operations
//
// Production API base URL: https://api.cortenx.trovio.io/v2
// Authentication: OAuth 2.0 Bearer token + X-Participant-Id header
// Rate limits: 60 req/min (transfers), 300 req/min (queries)
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
 * Headers: { Authorization: Bearer <oauth_token>, X-Participant-Id: <participant_id> }
 * Body: {
 *   transferType: 'standard' | 'voluntary_cancellation' | 'safeguard_surrender',
 *   fromAccount: string,         // CER registry account number (e.g., "CER-ACC-12345")
 *   toAccount: string,           // CER registry account number
 *   units: {
 *     projectId: string,         // ERF project ID (e.g., "ERF-2024-0456")
 *     methodology: string,       // ERF methodology (e.g., "Savanna Fire Management")
 *     vintage: string,           // Year of issuance (e.g., "2025")
 *     quantity: number,          // Number of ACCUs
 *     serialRange?: { start: string, end: string }  // Optional specific unit range
 *   },
 *   reference: string,           // External trade reference (WREI trade ID)
 *   callbackUrl?: string         // Webhook for async status updates
 * }
 * Response 201: {
 *   transferId: string,
 *   status: 'submitted',
 *   estimatedCompletion: string, // ISO 8601 — typically T+1 business day
 *   cerReference?: string        // CER tracking number (assigned on processing)
 * }
 * Response 400: { error: string, code: 'INVALID_ACCOUNT' | 'INSUFFICIENT_UNITS' | 'SERIAL_MISMATCH' }
 * Response 401: { error: 'Unauthorized' }
 * Response 409: { error: 'Units already in pending transfer' }
 *
 * GET /api/v2/transfers/:transferId
 * Response 200: {
 *   transferId: string,
 *   status: 'submitted' | 'processing' | 'completed' | 'rejected',
 *   units: { projectId: string, quantity: number, serialRange: { start: string, end: string } },
 *   timestamps: { submitted: string, processing?: string, completed?: string, rejected?: string },
 *   cerReference?: string,       // CER registry reference number
 *   rejectionReason?: string     // Only present if status === 'rejected'
 * }
 *
 * POST /api/v2/transfers/:transferId/confirm
 * Body: { confirmationType: 'counterparty_accept' | 'auto_confirm' }
 * Response 200: { transferId: string, confirmed: boolean, cerReference: string, completedAt: string }
 *
 * DELETE /api/v2/transfers/:transferId
 * Response 200: { transferId: string, cancelled: boolean, reason?: string }
 * Response 409: { error: 'Transfer already completed — cannot cancel' }
 *
 * GET /api/v2/holdings
 * Query: { accountId: string, projectId?: string, methodology?: string, vintage?: string }
 * Response 200: {
 *   holdings: Array<{
 *     projectId: string,
 *     projectName: string,
 *     methodology: string,
 *     vintage: string,
 *     quantity: number,
 *     serialRange: { start: string, end: string },
 *     status: 'available' | 'pending_transfer' | 'cancelled'
 *   }>,
 *   totalUnits: number
 * }
 *
 * GET /api/v2/projects/:projectId
 * Response 200: {
 *   projectId: string,
 *   name: string,
 *   methodology: string,
 *   proponent: string,
 *   status: 'active' | 'completed' | 'revoked',
 *   totalIssuance: number,
 *   state: string,                // Australian state (e.g., "NT", "QLD")
 *   coBenefits: string[]          // e.g., ["Biodiversity", "Indigenous employment"]
 * }
 */

// ---------------------------------------------------------------------------
// Simulated response helpers
// ---------------------------------------------------------------------------

const SAMPLE_PROJECTS = [
  { id: 'ERF-2024-0456', name: 'West Arnhem Fire Abatement', methodology: 'Savanna Fire Management', state: 'NT' },
  { id: 'ERF-2023-1102', name: 'Queensland Avoided Deforestation', methodology: 'Avoided Clearing of Native Regrowth', state: 'QLD' },
  { id: 'ERF-2025-0089', name: 'Victorian Soil Carbon', methodology: 'Measurement of Soil Carbon Sequestration', state: 'VIC' },
];

function generateTransferId(): string {
  return `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateCerReference(): string {
  return `CER-TRF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`;
}

function generateSerialRange(qty: number): { start: string; end: string } {
  const base = Math.floor(Math.random() * 9000000) + 1000000;
  return { start: `ACCU-${base}`, end: `ACCU-${base + qty - 1}` };
}

// In-memory store for simulated transfer state
const transfers = new Map<string, SettlementRecord>();

export class CortenxSettlementStub implements SettlementAdapter {
  readonly adapterName = 'Trovio CorTenX (Stub)';
  readonly supportedInstruments: InstrumentType[] = ['ACCU'];

  /**
   * Simulates initiating a CER registry transfer via CorTenX.
   * In production, calls POST /api/v2/transfers/initiate.
   * ACCU transfers typically settle T+1 business day.
   */
  async initiateSettlement(trade: CompletedTrade): Promise<SettlementRecord> {
    const transferId = generateTransferId();
    const cerRef = generateCerReference();
    const project = SAMPLE_PROJECTS[Math.floor(Math.random() * SAMPLE_PROJECTS.length)];
    const serialRange = generateSerialRange(trade.quantity);
    const now = new Date().toISOString();

    // Estimated completion: next business day
    const est = new Date();
    est.setDate(est.getDate() + (est.getDay() === 5 ? 3 : est.getDay() === 6 ? 2 : 1));

    const record: SettlementRecord = {
      settlementId: transferId,
      tradeId: trade.tradeId,
      instrumentType: trade.instrumentType,
      status: 'initiated',
      method: 'cortenx_api',
      initiatedAt: now,
      updatedAt: now,
      estimatedCompletionAt: est.toISOString(),
      registryReference: cerRef,
      history: [
        { from: 'confirmed', to: 'initiated', timestamp: now, reason: `Transfer submitted to CorTenX — CER ref: ${cerRef}` },
      ],
      metadata: {
        projectId: project.id,
        projectName: project.name,
        methodology: project.methodology,
        state: project.state,
        serialRange,
        transferType: 'standard',
      },
    };

    transfers.set(transferId, record);
    return record;
  }

  /**
   * Simulates checking transfer status.
   * In production, calls GET /api/v2/transfers/:transferId.
   */
  async getSettlementStatus(settlementId: string): Promise<SettlementStatus> {
    const record = transfers.get(settlementId);
    if (!record) {
      return { settlementId, status: 'failed', updatedAt: new Date().toISOString(), metadata: {} };
    }

    const now = new Date().toISOString();

    // Simulate T+1: advance to processing on first check, complete on second
    if (record.status === 'initiated') {
      record.status = 'processing';
      record.updatedAt = now;
      record.history.push({
        from: 'initiated',
        to: 'processing',
        timestamp: now,
        reason: 'CER registry processing transfer — awaiting counterparty account verification',
      });
    } else if (record.status === 'processing') {
      record.status = 'complete';
      record.updatedAt = now;
      record.completedAt = now;
      record.history.push({
        from: 'processing',
        to: 'transfer_recorded',
        timestamp: now,
        reason: 'Units transferred in CER registry',
      });
      record.history.push({
        from: 'transfer_recorded',
        to: 'complete',
        timestamp: now,
        reason: 'Transfer confirmed by Clean Energy Regulator',
      });
    }

    return {
      settlementId,
      status: record.status,
      updatedAt: record.updatedAt,
      metadata: record.metadata,
    };
  }

  /**
   * Simulates confirming a transfer.
   * In production, calls POST /api/v2/transfers/:transferId/confirm.
   */
  async confirmSettlement(settlementId: string): Promise<SettlementConfirmation> {
    const record = transfers.get(settlementId);
    if (!record) {
      return { settlementId, confirmed: false };
    }

    const now = new Date().toISOString();
    record.history.push({
      from: record.status,
      to: 'complete',
      timestamp: now,
      reason: 'Transfer confirmed — units available in destination account',
    });
    record.status = 'complete';
    record.updatedAt = now;
    record.completedAt = now;

    return {
      settlementId,
      confirmed: true,
      confirmedAt: now,
      reference: record.registryReference,
    };
  }

  /**
   * Simulates cancelling a pending transfer.
   * In production, calls DELETE /api/v2/transfers/:transferId.
   */
  async cancelSettlement(settlementId: string): Promise<CancellationResult> {
    const record = transfers.get(settlementId);
    if (!record) {
      return { settlementId, cancelled: false, reason: 'Transfer not found' };
    }

    if (record.status === 'complete') {
      return { settlementId, cancelled: false, reason: 'Transfer already completed — cannot cancel (CER registry is immutable)' };
    }

    const now = new Date().toISOString();
    record.history.push({
      from: record.status,
      to: 'cancelled',
      timestamp: now,
      reason: 'Transfer cancelled — units returned to originating account',
    });
    record.status = 'cancelled';
    record.updatedAt = now;

    return { settlementId, cancelled: true };
  }
}
