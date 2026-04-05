/**
 * Email Negotiation Manager — manages multi-round email negotiations
 * with counterparties. Enforces the same pricing constraints as the
 * platform negotiation engine (price floor, per-round concession,
 * total concession limits). Defence layers applied to all inbound content.
 *
 * Thread state machine:
 * RFQ Sent → Offer Received → [Counter Drafted → Counter Approved → Counter Sent → Offer Received]* → Accepted/Rejected
 */

import { sanitiseInput, classifyThreatLevel } from '@/lib/defence';
import { resolveInstrumentPricing, getMinAcceptablePrice, getRemainingConcessionRoom } from '@/lib/trading/instruments/pricing-engine';
import type { InstrumentType } from '@/lib/trading/instruments/types';
import type {
  EmailNegotiationThread,
  NegotiationThreadState,
  NegotiationConstraints,
  NegotiationRound,
  ParsedOffer,
  TradeConfirmation,
} from './types';
import { parseOffer } from './offer-parser';
import { generateConfirmation } from './trade-confirmation-generator';

// ---------------------------------------------------------------------------
// In-memory thread store (production: database)
// ---------------------------------------------------------------------------

const threads = new Map<string, EmailNegotiationThread>();

let threadCounter = 0;
function nextThreadId(): string {
  threadCounter += 1;
  return `neg-thread-${Date.now()}-${threadCounter}`;
}

// ---------------------------------------------------------------------------
// Start a new email negotiation
// ---------------------------------------------------------------------------

export interface StartNegotiationInput {
  organisationId: string;
  clientId?: string;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyEmail: string;
  instrument: InstrumentType;
  quantity: number;
  anchorPriceOverride?: number;
}

export function startEmailNegotiation(input: StartNegotiationInput): EmailNegotiationThread {
  const pricing = resolveInstrumentPricing(input.instrument, undefined, input.quantity);

  const anchorPrice = input.anchorPriceOverride ?? pricing.effectiveAnchor;

  const constraints: NegotiationConstraints = {
    instrumentType: input.instrument,
    anchorPrice,
    priceFloor: pricing.priceFloor,
    priceCeiling: pricing.priceCeiling,
    maxConcessionPerRound: pricing.maxConcessionPerRound,
    maxTotalConcession: pricing.maxTotalConcession,
    minRoundsBeforeConcession: pricing.minRoundsBeforeConcession,
    currency: pricing.currency,
  };

  const thread: EmailNegotiationThread = {
    id: nextThreadId(),
    organisationId: input.organisationId,
    clientId: input.clientId ?? null,
    counterpartyId: input.counterpartyId,
    counterpartyName: input.counterpartyName,
    counterpartyEmail: input.counterpartyEmail,
    instrument: input.instrument,
    quantity: input.quantity,
    state: 'rfq_sent',
    constraints,
    rounds: [],
    currentOurPrice: anchorPrice,
    currentTheirPrice: null,
    totalConcessionGiven: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    closedAt: null,
    closedReason: null,
  };

  threads.set(thread.id, thread);
  return thread;
}

// ---------------------------------------------------------------------------
// Process an inbound offer (counterparty response)
// ---------------------------------------------------------------------------

export interface ProcessInboundResult {
  thread: EmailNegotiationThread;
  parsedOffer: ParsedOffer;
  threatLevel: 'none' | 'low' | 'medium' | 'high';
  requiresManualReview: boolean;
  autoCounterAvailable: boolean;
}

export async function processInboundOffer(
  threadId: string,
  emailContent: string,
  subject?: string,
): Promise<ProcessInboundResult> {
  const thread = threads.get(threadId);
  if (!thread) throw new Error(`Thread not found: ${threadId}`);

  if (thread.state === 'accepted' || thread.state === 'rejected') {
    throw new Error(`Thread ${threadId} is closed (${thread.state})`);
  }

  // Defence: sanitise inbound email content
  const { cleaned, threats } = sanitiseInput(emailContent);
  const threatLevel = classifyThreatLevel(emailContent);

  if (threatLevel === 'high') {
    console.warn(`[Negotiation] High threat in thread ${threadId}: ${threats.join(', ')}`);
  }

  // Parse the offer from the sanitised content
  const parsedOffer = await parseOffer(cleaned, thread.constraints.instrumentType);

  const requiresManualReview = parsedOffer.confidence < 70 || threatLevel === 'high';

  // Record the inbound round
  const round: NegotiationRound = {
    roundNumber: thread.rounds.length + 1,
    direction: 'inbound',
    timestamp: new Date().toISOString(),
    correspondenceId: null,
    subject: subject ?? `Re: ${thread.instrument} negotiation`,
    body: cleaned,
    parsedOffer,
    ourPrice: thread.currentOurPrice,
    theirPrice: parsedOffer.price,
    aiAnalysis: null,
  };

  thread.rounds.push(round);
  thread.state = 'offer_received';
  thread.currentTheirPrice = parsedOffer.price;
  thread.updatedAt = new Date().toISOString();

  // Can we auto-generate a counter?
  const autoCounterAvailable = !requiresManualReview && parsedOffer.price !== null;

  threads.set(threadId, thread);

  return { thread, parsedOffer, threatLevel, requiresManualReview, autoCounterAvailable };
}

// ---------------------------------------------------------------------------
// Generate a counter-offer
// ---------------------------------------------------------------------------

export interface CounterOfferResult {
  thread: EmailNegotiationThread;
  counterPrice: number;
  concessionThisRound: number;
  remainingRoom: number;
  suggestedBody: string;
}

export function generateCounterOffer(threadId: string): CounterOfferResult {
  const thread = threads.get(threadId);
  if (!thread) throw new Error(`Thread not found: ${threadId}`);

  if (thread.state !== 'offer_received') {
    throw new Error(`Cannot counter from state: ${thread.state}`);
  }

  const { constraints, currentOurPrice, currentTheirPrice, rounds } = thread;
  const completedRounds = rounds.filter(r => r.direction === 'inbound').length;

  // Calculate counter price
  let counterPrice = currentOurPrice;

  if (currentTheirPrice !== null && completedRounds >= constraints.minRoundsBeforeConcession) {
    // Move towards their price, but respect constraints
    const gap = currentOurPrice - currentTheirPrice;
    const maxConcession = currentOurPrice * constraints.maxConcessionPerRound;
    const concessionAmount = Math.min(gap * 0.3, maxConcession); // Concede 30% of gap, capped

    counterPrice = currentOurPrice - concessionAmount;

    // Enforce price floor
    counterPrice = Math.max(counterPrice, constraints.priceFloor);

    // Enforce total concession limit
    const minAcceptable = constraints.anchorPrice * (1 - constraints.maxTotalConcession);
    counterPrice = Math.max(counterPrice, minAcceptable, constraints.priceFloor);

    // Round to 2 decimal places
    counterPrice = Math.round(counterPrice * 100) / 100;
  }

  const concessionThisRound = currentOurPrice - counterPrice;
  const pricing = resolveInstrumentPricing(
    constraints.instrumentType as InstrumentType,
    undefined,
    thread.quantity,
  );
  const remainingRoom = getRemainingConcessionRoom(pricing, counterPrice);

  // Build suggested email body
  const suggestedBody = buildCounterEmailBody(thread, counterPrice, currentTheirPrice);

  // Record counter-offer round
  const round: NegotiationRound = {
    roundNumber: thread.rounds.length + 1,
    direction: 'outbound',
    timestamp: new Date().toISOString(),
    correspondenceId: null,
    subject: `Re: ${thread.instrument} — ${thread.quantity.toLocaleString()} units`,
    body: suggestedBody,
    parsedOffer: null,
    ourPrice: counterPrice,
    theirPrice: currentTheirPrice,
    aiAnalysis: null,
  };

  thread.rounds.push(round);
  thread.state = 'counter_drafted';
  thread.currentOurPrice = counterPrice;
  thread.totalConcessionGiven = constraints.anchorPrice - counterPrice;
  thread.updatedAt = new Date().toISOString();

  threads.set(threadId, thread);

  return { thread, counterPrice, concessionThisRound, remainingRoom, suggestedBody };
}

// ---------------------------------------------------------------------------
// Approve / send counter-offer
// ---------------------------------------------------------------------------

export function approveCounter(threadId: string): EmailNegotiationThread {
  const thread = threads.get(threadId);
  if (!thread) throw new Error(`Thread not found: ${threadId}`);
  if (thread.state !== 'counter_drafted') {
    throw new Error(`Cannot approve from state: ${thread.state}`);
  }
  thread.state = 'counter_approved';
  thread.updatedAt = new Date().toISOString();
  threads.set(threadId, thread);
  return thread;
}

export function markCounterSent(threadId: string): EmailNegotiationThread {
  const thread = threads.get(threadId);
  if (!thread) throw new Error(`Thread not found: ${threadId}`);
  if (thread.state !== 'counter_approved') {
    throw new Error(`Cannot mark sent from state: ${thread.state}`);
  }
  thread.state = 'counter_sent';
  thread.updatedAt = new Date().toISOString();
  threads.set(threadId, thread);
  return thread;
}

// ---------------------------------------------------------------------------
// Accept / reject negotiation
// ---------------------------------------------------------------------------

export function acceptOffer(threadId: string): { thread: EmailNegotiationThread; confirmation: TradeConfirmation } {
  const thread = threads.get(threadId);
  if (!thread) throw new Error(`Thread not found: ${threadId}`);

  if (thread.state !== 'offer_received' && thread.state !== 'counter_sent') {
    throw new Error(`Cannot accept from state: ${thread.state}`);
  }

  const agreedPrice = thread.currentTheirPrice ?? thread.currentOurPrice;

  // Final constraint check — never accept below floor
  if (agreedPrice < thread.constraints.priceFloor) {
    throw new Error(
      `Cannot accept: price ${agreedPrice} is below floor ${thread.constraints.priceFloor}`,
    );
  }

  thread.state = 'accepted';
  thread.closedAt = new Date().toISOString();
  thread.closedReason = `Agreed at ${thread.constraints.currency} ${agreedPrice.toFixed(2)}`;
  thread.updatedAt = new Date().toISOString();

  const confirmation = generateConfirmation({
    instrument: thread.instrument,
    quantity: thread.quantity,
    pricePerUnit: agreedPrice,
    currency: thread.constraints.currency,
    buyerName: thread.counterpartyName,
    buyerEntity: thread.counterpartyName,
    sellerName: 'WREI Brokerage',
    sellerEntity: 'WREI Pty Ltd',
    threadId: thread.id,
  });

  threads.set(threadId, thread);

  return { thread, confirmation };
}

export function rejectOffer(threadId: string, reason?: string): EmailNegotiationThread {
  const thread = threads.get(threadId);
  if (!thread) throw new Error(`Thread not found: ${threadId}`);

  if (thread.state === 'accepted' || thread.state === 'rejected') {
    throw new Error(`Thread ${threadId} is already closed`);
  }

  thread.state = 'rejected';
  thread.closedAt = new Date().toISOString();
  thread.closedReason = reason ?? 'Rejected by broker';
  thread.updatedAt = new Date().toISOString();

  threads.set(threadId, thread);
  return thread;
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getThread(threadId: string): EmailNegotiationThread | null {
  return threads.get(threadId) ?? null;
}

export function getThreadsByOrg(organisationId: string): EmailNegotiationThread[] {
  return Array.from(threads.values())
    .filter(t => t.organisationId === organisationId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getActiveThreads(organisationId: string): EmailNegotiationThread[] {
  return getThreadsByOrg(organisationId)
    .filter(t => t.state !== 'accepted' && t.state !== 'rejected');
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildCounterEmailBody(
  thread: EmailNegotiationThread,
  counterPrice: number,
  theirPrice: number | null,
): string {
  const { constraints, quantity, instrument } = thread;
  const lines: string[] = [
    `Dear ${thread.counterpartyName.split(' ').pop()},`,
    '',
    `Thank you for your response regarding the ${instrument} requirement.`,
    '',
  ];

  if (theirPrice !== null) {
    lines.push(
      `We have noted your offer of ${constraints.currency} ${theirPrice.toFixed(2)} per unit. ` +
      `Having reviewed our position, we would like to counter at ` +
      `${constraints.currency} ${counterPrice.toFixed(2)} per unit ` +
      `for ${quantity.toLocaleString()} ${instrument}s.`,
    );
  } else {
    lines.push(
      `Our current offer stands at ${constraints.currency} ${counterPrice.toFixed(2)} per unit ` +
      `for ${quantity.toLocaleString()} ${instrument}s.`,
    );
  }

  lines.push(
    '',
    'Settlement: T+2 registry transfer',
    '',
    'We look forward to your response.',
    '',
    'Kind regards',
  );

  return lines.join('\n');
}
