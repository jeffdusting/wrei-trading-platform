/**
 * Type definitions for the WREI Correspondence Engine.
 *
 * Covers: AI-drafted emails, procurement recommendations,
 * RFQ generation, and correspondence lifecycle tracking.
 */

// ---------------------------------------------------------------------------
// Correspondence lifecycle
// ---------------------------------------------------------------------------

export type CorrespondenceStatus =
  | 'drafted'      // AI-generated, awaiting broker review
  | 'approved'     // Broker approved, ready to send
  | 'sent'         // Dispatched to counterparty
  | 'rejected'     // Broker rejected the draft
  | 'replied';     // Counterparty responded

export type CorrespondenceType =
  | 'rfq'          // Request for quote
  | 'quote'        // Price quote to buyer
  | 'confirmation' // Trade confirmation
  | 'follow_up'    // Follow-up on existing thread
  | 'general';     // General correspondence

export interface DraftCorrespondence {
  id: string;
  organisationId: string;
  type: CorrespondenceType;
  counterpartyName: string;
  counterpartyEmail: string;
  subject: string;
  body: string;
  status: CorrespondenceStatus;
  threadId: string | null;
  relatedClientId: string | null;
  relatedInstrument: string | null;
  aiModel: string | null;
  aiTokensUsed: number | null;
  rejectionReason: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

export interface CreateCorrespondenceInput {
  type: CorrespondenceType;
  counterpartyName: string;
  counterpartyEmail: string;
  subject: string;
  body: string;
  threadId?: string;
  relatedClientId?: string;
  relatedInstrument?: string;
  aiModel?: string;
  aiTokensUsed?: number;
}

// ---------------------------------------------------------------------------
// Counterparty (seller network)
// ---------------------------------------------------------------------------

export interface Counterparty {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  instruments: string[];       // e.g. ['ESC', 'VEEC', 'ACCU']
  relationship: 'preferred' | 'active' | 'new';
  notes: string | null;
}

// ---------------------------------------------------------------------------
// Procurement recommendation
// ---------------------------------------------------------------------------

export type RiskLevel = 'green' | 'amber' | 'red';

export interface ProcurementRecommendation {
  clientId: string;
  clientName: string;
  instrument: string;
  target: number;
  held: number;
  surrendered: number;
  shortfall: number;
  penaltyExposure: number;
  penaltyRate: number;
  urgency: number;              // days to surrender deadline
  riskLevel: RiskLevel;
  recommendedAction: string;
  complianceYear: string;
  surrenderDeadline: string | null;
}

// ---------------------------------------------------------------------------
// RFQ generation request/response
// ---------------------------------------------------------------------------

export interface GenerateRFQRequest {
  recommendation: ProcurementRecommendation;
  counterparties: Counterparty[];
}

export interface GenerateRFQResult {
  drafts: DraftCorrespondence[];
  totalTokensUsed: number;
}

// ---------------------------------------------------------------------------
// Correspondence DB row (matches SQL schema)
// ---------------------------------------------------------------------------

export interface CorrespondenceRow {
  id: string;
  organisation_id: string;
  type: CorrespondenceType;
  counterparty_name: string;
  counterparty_email: string;
  subject: string;
  body: string;
  status: CorrespondenceStatus;
  thread_id: string | null;
  related_client_id: string | null;
  related_instrument: string | null;
  ai_model: string | null;
  ai_tokens_used: number | null;
  rejection_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

/** Convert DB row to domain object */
export function rowToCorrespondence(row: CorrespondenceRow): DraftCorrespondence {
  return {
    id: row.id,
    organisationId: row.organisation_id,
    type: row.type,
    counterpartyName: row.counterparty_name,
    counterpartyEmail: row.counterparty_email,
    subject: row.subject,
    body: row.body,
    status: row.status,
    threadId: row.thread_id,
    relatedClientId: row.related_client_id,
    relatedInstrument: row.related_instrument,
    aiModel: row.ai_model,
    aiTokensUsed: row.ai_tokens_used,
    rejectionReason: row.rejection_reason,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at,
  };
}
