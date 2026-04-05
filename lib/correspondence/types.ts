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

export type TimingSignal = 'BUY_NOW' | 'WAIT' | 'MARKET' | 'BUY_NOW_DEADLINE' | 'CONSIDER';

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
  // Forecast-connected fields (P11-B)
  timingSignal: TimingSignal | null;
  forecastPrice4w: number | null;
  forecastConfidence: number | null;
  timingExplanation: string | null;
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

// ---------------------------------------------------------------------------
// Email negotiation thread
// ---------------------------------------------------------------------------

export type NegotiationThreadState =
  | 'rfq_sent'          // Initial RFQ dispatched to counterparty
  | 'offer_received'    // Counterparty responded with an offer
  | 'counter_drafted'   // AI counter-offer drafted, awaiting broker approval
  | 'counter_approved'  // Broker approved counter, ready to send
  | 'counter_sent'      // Counter-offer sent to counterparty
  | 'accepted'          // Negotiation concluded — offer accepted
  | 'rejected';         // Negotiation concluded — offer rejected

export interface ParsedOffer {
  price: number | null;
  quantity: number | null;
  vintage: string | null;
  terms: string | null;
  counterOffer: boolean;
  confidence: number;       // 0–100, below 70 = manual review
  rawExcerpt: string;       // The relevant excerpt from the email
}

export interface NegotiationConstraints {
  instrumentType: string;
  anchorPrice: number;       // Our opening price
  priceFloor: number;        // Absolute minimum
  priceCeiling: number;      // Maximum (usually penalty rate)
  maxConcessionPerRound: number;  // e.g. 0.05 = 5%
  maxTotalConcession: number;     // e.g. 0.20 = 20%
  minRoundsBeforeConcession: number;
  currency: 'AUD' | 'USD';
}

export interface NegotiationRound {
  roundNumber: number;
  direction: 'outbound' | 'inbound';
  timestamp: string;
  correspondenceId: string | null;
  subject: string;
  body: string;
  parsedOffer: ParsedOffer | null;
  ourPrice: number | null;         // Our current offer price after this round
  theirPrice: number | null;       // Their offer price (if inbound)
  aiAnalysis: string | null;       // AI commentary on their position
}

export interface EmailNegotiationThread {
  id: string;
  organisationId: string;
  clientId: string | null;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyEmail: string;
  instrument: string;
  quantity: number;
  state: NegotiationThreadState;
  constraints: NegotiationConstraints;
  rounds: NegotiationRound[];
  currentOurPrice: number;          // Our latest offer price
  currentTheirPrice: number | null; // Their latest offer price
  totalConcessionGiven: number;     // Total $ conceded from anchor
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  closedReason: string | null;
}

export interface TradeConfirmation {
  tradeDate: string;
  settlementDate: string;
  instrument: string;
  quantity: number;
  pricePerUnit: number;
  totalConsideration: number;
  currency: 'AUD' | 'USD';
  buyerName: string;
  buyerEntity: string;
  sellerName: string;
  sellerEntity: string;
  settlementMethod: string;
  registryReference: string | null;
  specialConditions: string[];
  threadId: string;
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
