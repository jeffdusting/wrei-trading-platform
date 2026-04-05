/**
 * Settlement Facilitation — generates TESSA/VEEC portal transfer instructions
 * so the broker's admin staff can execute registry transfers quickly.
 *
 * Also handles follow-up drafting when settlement is overdue, and
 * tracks settlement status through manual broker updates.
 */

import { routeAIRequest } from '@/lib/ai/ai-service-router';
import { buildCorrespondenceDraftPrompt } from '@/lib/ai/prompts/system-prompts';
import type { TradeConfirmation } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SettlementTrackingStatus =
  | 'instructions_generated'  // Transfer instructions created
  | 'transferred'             // Broker confirmed transfer initiated in registry
  | 'confirmed'               // Counterparty confirmed receipt
  | 'complete';               // Both sides confirmed, settlement closed

export interface SettlementTracking {
  id: string;
  tradeId: string;
  threadId: string;
  instrument: string;
  quantity: number;
  counterpartyName: string;
  counterpartyEmail: string;
  registry: 'TESSA' | 'VEU';
  status: SettlementTrackingStatus;
  instructionsGeneratedAt: string;
  transferredAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  expectedCompletionDays: number;
  followUpsSent: number;
  lastFollowUpAt: string | null;
}

export interface TransferInstructions {
  title: string;
  registry: string;
  registryUrl: string;
  tradeReference: string;
  instrument: string;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  currency: 'AUD' | 'USD';
  sellerAccount: string;
  buyerAccount: string;
  vintage: string | null;
  steps: TransferStep[];
  expectedTimeline: string;
  notes: string[];
}

export interface TransferStep {
  number: number;
  instruction: string;
  detail: string | null;
}

// ---------------------------------------------------------------------------
// In-memory tracking store (production: database)
// ---------------------------------------------------------------------------

const trackingStore = new Map<string, SettlementTracking>();
let trackingCounter = 0;

// ---------------------------------------------------------------------------
// TESSA Transfer Instruction Generator (ESC / PRC)
// ---------------------------------------------------------------------------

export function generateTESSAInstructions(trade: TradeConfirmation): TransferInstructions {
  const isESC = trade.instrument === 'ESC';
  const registryName = isESC ? 'NSW ESS Registry (IPART)' : 'NSW PDRS Registry (IPART)';
  const instrumentLabel = isESC ? 'Energy Savings Certificates' : 'Peak Reduction Certificates';

  return {
    title: `TESSA Transfer Instruction — ${instrumentLabel}`,
    registry: registryName,
    registryUrl: 'https://tessa.ipart.nsw.gov.au',
    tradeReference: trade.threadId,
    instrument: trade.instrument,
    quantity: trade.quantity,
    pricePerUnit: trade.pricePerUnit,
    totalValue: trade.totalConsideration,
    currency: trade.currency,
    sellerAccount: trade.sellerEntity,
    buyerAccount: trade.buyerEntity,
    vintage: null,
    steps: [
      {
        number: 1,
        instruction: 'Log in to TESSA',
        detail: 'Navigate to https://tessa.ipart.nsw.gov.au and log in with your organisation credentials.',
      },
      {
        number: 2,
        instruction: 'Navigate to Certificate Holdings',
        detail: `Select "${isESC ? 'Energy Savings Certificates' : 'Peak Reduction Certificates'}" from the Holdings menu.`,
      },
      {
        number: 3,
        instruction: `Select ${trade.quantity.toLocaleString()} certificates`,
        detail: `Filter by instrument type ${trade.instrument}. Select ${trade.quantity.toLocaleString()} certificates for transfer.`,
      },
      {
        number: 4,
        instruction: 'Initiate Transfer',
        detail: `Click "Transfer" and enter buyer account reference: ${trade.buyerEntity}.`,
      },
      {
        number: 5,
        instruction: 'Confirm transfer details',
        detail: `Verify: ${trade.quantity.toLocaleString()} × ${trade.instrument} to ${trade.buyerName} (${trade.buyerEntity}). Total consideration: A$${trade.totalConsideration.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
      },
      {
        number: 6,
        instruction: 'Submit and record reference',
        detail: 'Click "Submit Transfer". Note the TESSA transfer reference number and update settlement status in the platform.',
      },
    ],
    expectedTimeline: 'Transfer typically recorded within 1–3 business days after submission.',
    notes: [
      'Ensure the seller account has sufficient certificate balance before initiating.',
      `Buyer account reference: ${trade.buyerEntity}`,
      `Trade reference: ${trade.threadId}`,
      `Settlement date per confirmation: ${trade.settlementDate}`,
    ],
  };
}

// ---------------------------------------------------------------------------
// VEEC Transfer Instruction Generator
// ---------------------------------------------------------------------------

export function generateVEECInstructions(trade: TradeConfirmation): TransferInstructions {
  return {
    title: 'VEU Registry Transfer Instruction — Victorian Energy Efficiency Certificates',
    registry: 'Essential Services Commission (Victoria)',
    registryUrl: 'https://veu-registry.esc.vic.gov.au',
    tradeReference: trade.threadId,
    instrument: 'VEEC',
    quantity: trade.quantity,
    pricePerUnit: trade.pricePerUnit,
    totalValue: trade.totalConsideration,
    currency: trade.currency,
    sellerAccount: trade.sellerEntity,
    buyerAccount: trade.buyerEntity,
    vintage: null,
    steps: [
      {
        number: 1,
        instruction: 'Log in to the VEU Registry',
        detail: 'Navigate to https://veu-registry.esc.vic.gov.au and log in with your organisation credentials.',
      },
      {
        number: 2,
        instruction: 'Navigate to Certificate Transfer',
        detail: 'Select "Transfer" → "Initiate Certificate Transfer" from the main menu.',
      },
      {
        number: 3,
        instruction: `Select ${trade.quantity.toLocaleString()} VEEC certificates`,
        detail: `Filter holdings to show VEEC certificates. Select ${trade.quantity.toLocaleString()} certificates for transfer.`,
      },
      {
        number: 4,
        instruction: 'Enter buyer account details',
        detail: `Enter buyer account number: ${trade.buyerEntity}. Verify buyer name: ${trade.buyerName}.`,
      },
      {
        number: 5,
        instruction: 'Confirm transfer details',
        detail: `Verify: ${trade.quantity.toLocaleString()} × VEEC to ${trade.buyerName}. Total consideration: A$${trade.totalConsideration.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`,
      },
      {
        number: 6,
        instruction: 'Submit and record ESC reference',
        detail: 'Click "Submit Transfer". Note the ESC transfer reference number and update settlement status in the platform.',
      },
    ],
    expectedTimeline: 'Transfer typically recorded within 1–3 business days after submission.',
    notes: [
      'Ensure the seller account has sufficient VEEC balance before initiating.',
      `Buyer account reference: ${trade.buyerEntity}`,
      `Trade reference: ${trade.threadId}`,
      `Settlement date per confirmation: ${trade.settlementDate}`,
    ],
  };
}

// ---------------------------------------------------------------------------
// Generate instructions for any supported trade
// ---------------------------------------------------------------------------

export function generateTransferInstructions(trade: TradeConfirmation): TransferInstructions {
  if (trade.instrument === 'VEEC') {
    return generateVEECInstructions(trade);
  }
  // ESC, PRC both use TESSA
  return generateTESSAInstructions(trade);
}

// ---------------------------------------------------------------------------
// Settlement Follow-Up Email Generator
// ---------------------------------------------------------------------------

export async function generateSettlementFollowUp(
  trade: TradeConfirmation,
  daysSinceInitiation: number,
  opts?: { userId?: string; organisationId?: string }
): Promise<{ subject: string; body: string }> {
  const currencySymbol = trade.currency === 'AUD' ? 'A$' : 'US$';
  const isOverdue = daysSinceInitiation > 3;

  try {
    const result = await routeAIRequest({
      capability: 'correspondence_draft',
      userId: opts?.userId,
      organisationId: opts?.organisationId,
      input: {
        systemPrompt: buildCorrespondenceDraftPrompt(),
        messages: [{
          role: 'user',
          content: [
            `Draft a settlement follow-up email for a ${isOverdue ? 'overdue' : 'pending'} registry transfer.`,
            ``,
            `Trade details:`,
            `- Instrument: ${trade.instrument}`,
            `- Quantity: ${trade.quantity.toLocaleString()} units`,
            `- Price: ${currencySymbol}${trade.pricePerUnit.toFixed(2)}/unit`,
            `- Total: ${currencySymbol}${trade.totalConsideration.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            `- Trade date: ${trade.tradeDate}`,
            `- Expected settlement: ${trade.settlementDate}`,
            `- Days since trade: ${daysSinceInitiation}`,
            `- Counterparty: ${trade.buyerName}`,
            ``,
            `Tone: ${isOverdue ? 'Firm but professional. Express concern about the delay.' : 'Friendly check-in on transfer status.'}`,
            ``,
            `Return in this format:`,
            `SUBJECT: <subject>`,
            `BODY:`,
            `<email body>`,
          ].join('\n'),
        }],
      },
    });

    if (result.ok && result.response.output) {
      const subjectMatch = result.response.output.match(/SUBJECT:\s*(.+)/i);
      const bodyMatch = result.response.output.match(/BODY:\s*([\s\S]+)/i);
      if (subjectMatch && bodyMatch) {
        return { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim() };
      }
    }
  } catch {
    // Fall through to template
  }

  // Fallback template
  return {
    subject: `Settlement ${isOverdue ? 'Overdue' : 'Status'}: ${trade.instrument} — ${trade.quantity.toLocaleString()} units`,
    body: [
      `Dear ${trade.buyerName},`,
      '',
      isOverdue
        ? `We are writing to follow up on the registry transfer for the ${trade.instrument} transaction dated ${trade.tradeDate}. The expected settlement date of ${trade.settlementDate} has now passed (${daysSinceInitiation} days since trade).`
        : `We are writing to check on the status of the registry transfer for the ${trade.instrument} transaction dated ${trade.tradeDate}.`,
      '',
      `Trade summary:`,
      `- Quantity: ${trade.quantity.toLocaleString()} units`,
      `- Price: ${currencySymbol}${trade.pricePerUnit.toFixed(2)}/unit`,
      `- Total: ${currencySymbol}${trade.totalConsideration.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      '',
      isOverdue
        ? 'Could you please confirm the current status of the transfer and provide an expected completion date?'
        : 'Please let us know once the transfer has been completed on your end.',
      '',
      'Kind regards',
    ].join('\n'),
  };
}

// ---------------------------------------------------------------------------
// Settlement Status Tracking
// ---------------------------------------------------------------------------

export function initiateSettlementTracking(
  trade: TradeConfirmation,
  registry: 'TESSA' | 'VEU'
): SettlementTracking {
  trackingCounter += 1;
  const id = `stl-${Date.now()}-${trackingCounter}`;
  const now = new Date().toISOString();

  const tracking: SettlementTracking = {
    id,
    tradeId: trade.threadId,
    threadId: trade.threadId,
    instrument: trade.instrument,
    quantity: trade.quantity,
    counterpartyName: trade.buyerName,
    counterpartyEmail: '',
    registry,
    status: 'instructions_generated',
    instructionsGeneratedAt: now,
    transferredAt: null,
    confirmedAt: null,
    completedAt: null,
    expectedCompletionDays: 3,
    followUpsSent: 0,
    lastFollowUpAt: null,
  };

  trackingStore.set(id, tracking);
  return tracking;
}

export function trackSettlementStatus(
  trackingId: string,
  newStatus: SettlementTrackingStatus
): SettlementTracking | null {
  const tracking = trackingStore.get(trackingId);
  if (!tracking) return null;

  const now = new Date().toISOString();
  tracking.status = newStatus;

  switch (newStatus) {
    case 'transferred':
      tracking.transferredAt = now;
      break;
    case 'confirmed':
      tracking.confirmedAt = now;
      break;
    case 'complete':
      tracking.completedAt = now;
      break;
  }

  trackingStore.set(trackingId, tracking);
  return tracking;
}

export function recordFollowUp(trackingId: string): SettlementTracking | null {
  const tracking = trackingStore.get(trackingId);
  if (!tracking) return null;

  tracking.followUpsSent += 1;
  tracking.lastFollowUpAt = new Date().toISOString();
  trackingStore.set(trackingId, tracking);
  return tracking;
}

export function getSettlementTracking(trackingId: string): SettlementTracking | null {
  return trackingStore.get(trackingId) ?? null;
}

export function getAllSettlementTrackings(): SettlementTracking[] {
  return Array.from(trackingStore.values()).sort(
    (a, b) => b.instructionsGeneratedAt.localeCompare(a.instructionsGeneratedAt)
  );
}

export function getOverdueSettlements(): SettlementTracking[] {
  const now = Date.now();
  return getAllSettlementTrackings().filter(t => {
    if (t.status === 'complete') return false;
    const initiated = new Date(t.instructionsGeneratedAt).getTime();
    const daysSince = (now - initiated) / (1000 * 60 * 60 * 24);
    return daysSince > t.expectedCompletionDays;
  });
}

export function getDaysSinceInitiation(tracking: SettlementTracking): number {
  const initiated = new Date(tracking.instructionsGeneratedAt).getTime();
  return Math.floor((Date.now() - initiated) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Demo data for UI
// ---------------------------------------------------------------------------

export function seedDemoSettlements(): SettlementTracking[] {
  const demoTrades: SettlementTracking[] = [
    {
      id: 'stl-demo-1',
      tradeId: 'trade-001',
      threadId: 'neg-thread-001',
      instrument: 'ESC',
      quantity: 5000,
      counterpartyName: 'GreenPower Solutions',
      counterpartyEmail: 'settlement@greenpower.com.au',
      registry: 'TESSA',
      status: 'transferred',
      instructionsGeneratedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      transferredAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      confirmedAt: null,
      completedAt: null,
      expectedCompletionDays: 3,
      followUpsSent: 0,
      lastFollowUpAt: null,
    },
    {
      id: 'stl-demo-2',
      tradeId: 'trade-002',
      threadId: 'neg-thread-002',
      instrument: 'VEEC',
      quantity: 12000,
      counterpartyName: 'EcoTrade Victoria',
      counterpartyEmail: 'ops@ecotrade.com.au',
      registry: 'VEU',
      status: 'instructions_generated',
      instructionsGeneratedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      transferredAt: null,
      confirmedAt: null,
      completedAt: null,
      expectedCompletionDays: 3,
      followUpsSent: 1,
      lastFollowUpAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'stl-demo-3',
      tradeId: 'trade-003',
      threadId: 'neg-thread-003',
      instrument: 'ESC',
      quantity: 3200,
      counterpartyName: 'CleanEnergy Partners',
      counterpartyEmail: 'admin@cleanenergy.com.au',
      registry: 'TESSA',
      status: 'complete',
      instructionsGeneratedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      transferredAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      confirmedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      expectedCompletionDays: 3,
      followUpsSent: 0,
      lastFollowUpAt: null,
    },
  ];

  for (const t of demoTrades) {
    trackingStore.set(t.id, t);
  }

  return demoTrades;
}
