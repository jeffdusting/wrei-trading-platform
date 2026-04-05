'use client'

/**
 * NegotiationThread — displays a single email negotiation thread in
 * chronological order with parsed offers, AI analysis, state indicators,
 * action buttons, and a concession tracker side panel.
 */

import { useState } from 'react'
import type {
  EmailNegotiationThread,
  NegotiationThreadState,
  NegotiationRound,
  ParsedOffer,
} from '@/lib/correspondence/types'

// ---------------------------------------------------------------------------
// State labels & colours
// ---------------------------------------------------------------------------

const STATE_CONFIG: Record<NegotiationThreadState, { label: string; colour: string; icon: string }> = {
  rfq_sent:          { label: 'RFQ Sent',          colour: 'bg-sky-100 text-sky-700',       icon: '→' },
  offer_received:    { label: 'Offer Received',    colour: 'bg-amber-100 text-amber-700',   icon: '←' },
  counter_drafted:   { label: 'Counter Drafted',   colour: 'bg-slate-100 text-slate-600',   icon: '✎' },
  counter_approved:  { label: 'Counter Approved',  colour: 'bg-emerald-100 text-emerald-700', icon: '✓' },
  counter_sent:      { label: 'Counter Sent',      colour: 'bg-sky-100 text-sky-700',       icon: '→' },
  accepted:          { label: 'Accepted',           colour: 'bg-emerald-100 text-emerald-700', icon: '★' },
  rejected:          { label: 'Rejected',           colour: 'bg-red-100 text-red-700',       icon: '✕' },
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_THREAD: EmailNegotiationThread = {
  id: 'neg-thread-demo-1',
  organisationId: 'org-1',
  clientId: 'demo-1',
  counterpartyId: 'cp-1',
  counterpartyName: 'Green Energy Trading',
  counterpartyEmail: 'sarah.mitchell@greenenergy.com.au',
  instrument: 'ESC',
  quantity: 50_000,
  state: 'offer_received',
  constraints: {
    instrumentType: 'ESC',
    anchorPrice: 23.00,
    priceFloor: 18.00,
    priceCeiling: 29.48,
    maxConcessionPerRound: 0.05,
    maxTotalConcession: 0.20,
    minRoundsBeforeConcession: 3,
    currency: 'AUD',
  },
  rounds: [
    {
      roundNumber: 1, direction: 'outbound',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      correspondenceId: 'draft-1', subject: 'RFQ: ESC — 50,000 units for FY2026 compliance',
      body: 'Dear Sarah,\n\nWe are seeking a competitive offer for 50,000 Energy Savings Certificates for FY2026 compliance.\n\nSettlement: T+2 registry transfer preferred.\n\nKind regards',
      parsedOffer: null, ourPrice: 23.00, theirPrice: null, aiAnalysis: null,
    },
    {
      roundNumber: 2, direction: 'inbound',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      correspondenceId: null, subject: 'Re: RFQ: ESC — 50,000 units for FY2026 compliance',
      body: 'Hi,\n\nThank you for your enquiry. We can offer 50,000 ESCs at $21.80 per certificate, vintage 2025.\n\nDelivery within 5 business days via TESSA transfer.\n\nRegards,\nSarah',
      parsedOffer: {
        price: 21.80, quantity: 50000, vintage: '2025', terms: 'Delivery within 5 business days',
        counterOffer: false, confidence: 92, rawExcerpt: 'We can offer 50,000 ESCs at $21.80 per certificate',
      },
      ourPrice: 23.00, theirPrice: 21.80, aiAnalysis: 'Offer is A$1.20 below our anchor (5.2% gap). First round — constraints prevent concession before round 3. Recommend holding at current price.',
    },
  ],
  currentOurPrice: 23.00,
  currentTheirPrice: 21.80,
  totalConcessionGiven: 0,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
  closedAt: null,
  closedReason: null,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  thread?: EmailNegotiationThread
}

export default function NegotiationThread({ thread: threadProp }: Props) {
  const thread = threadProp ?? DEMO_THREAD
  const [pasteContent, setPasteContent] = useState('')
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const { constraints, rounds, currentOurPrice, currentTheirPrice, totalConcessionGiven } = thread
  const stateConf = STATE_CONFIG[thread.state]
  const gap = currentTheirPrice !== null ? currentOurPrice - currentTheirPrice : null
  const gapPct = gap !== null ? ((gap / currentOurPrice) * 100).toFixed(1) : null
  const concessionPct = ((totalConcessionGiven / constraints.anchorPrice) * 100).toFixed(1)
  const maxTotalConcessionAmt = constraints.anchorPrice * constraints.maxTotalConcession
  const remainingRoom = maxTotalConcessionAmt - totalConcessionGiven
  const isClosed = thread.state === 'accepted' || thread.state === 'rejected'

  return (
    <div className="flex gap-4">
      {/* Main timeline */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1E293B]">
              {thread.counterpartyName}
            </h2>
            <p className="text-xs text-[#64748B]">
              {thread.instrument} — {thread.quantity.toLocaleString()} units — {thread.counterpartyEmail}
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${stateConf.colour}`}>
            {stateConf.icon} {stateConf.label}
          </span>
        </div>

        {/* Rounds timeline */}
        <div className="space-y-3">
          {rounds.map((round) => (
            <RoundCard key={round.roundNumber} round={round} currency={constraints.currency} />
          ))}
        </div>

        {/* Paste inbound email */}
        {!isClosed && (
          <div className="mt-4 border border-[#E2E8F0] rounded-lg p-3">
            <label className="block text-xs font-medium text-[#64748B] mb-1">
              Paste counterparty response
            </label>
            <textarea
              className="w-full border border-[#E2E8F0] rounded p-2 text-sm text-[#1E293B] resize-none focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
              rows={4}
              placeholder="Paste the seller's email response here..."
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
            />
            <button
              className="mt-2 px-3 py-1.5 text-xs font-medium rounded bg-[#1B2A4A] text-white hover:bg-[#2a3d66] disabled:opacity-40"
              disabled={!pasteContent.trim()}
              onClick={() => {
                setActiveAction('processing')
                // In production: POST /api/v1/correspondence/inbound
                setTimeout(() => {
                  setActiveAction(null)
                  setPasteContent('')
                }, 1500)
              }}
            >
              {activeAction === 'processing' ? 'Processing...' : 'Process Inbound Email'}
            </button>
          </div>
        )}

        {/* Action buttons */}
        {!isClosed && (
          <div className="flex gap-2 mt-4">
            {thread.state === 'counter_drafted' && (
              <>
                <ActionButton
                  label="Approve Counter"
                  colour="bg-emerald-600 hover:bg-emerald-700"
                  active={activeAction}
                  actionKey="approve"
                  onAction={setActiveAction}
                />
                <ActionButton
                  label="Edit Counter"
                  colour="bg-[#1B2A4A] hover:bg-[#2a3d66]"
                  active={activeAction}
                  actionKey="edit"
                  onAction={setActiveAction}
                />
              </>
            )}
            {thread.state === 'offer_received' && (
              <ActionButton
                label="Accept Offer"
                colour="bg-emerald-600 hover:bg-emerald-700"
                active={activeAction}
                actionKey="accept"
                onAction={setActiveAction}
              />
            )}
            {(thread.state === 'offer_received' || thread.state === 'counter_drafted') && (
              <ActionButton
                label="Reject"
                colour="bg-red-600 hover:bg-red-700"
                active={activeAction}
                actionKey="reject"
                onAction={setActiveAction}
              />
            )}
            <ActionButton
              label="Manual Review"
              colour="bg-amber-500 hover:bg-amber-600"
              active={activeAction}
              actionKey="manual"
              onAction={setActiveAction}
            />
          </div>
        )}

        {/* Closed banner */}
        {isClosed && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            thread.state === 'accepted'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {thread.state === 'accepted' ? 'Negotiation completed' : 'Negotiation rejected'}
            {thread.closedReason && ` — ${thread.closedReason}`}
          </div>
        )}
      </div>

      {/* Side panel: constraints & concession tracker */}
      <div className="w-64 shrink-0">
        <div className="border border-[#E2E8F0] rounded-lg p-3 space-y-3 sticky top-4">
          <h3 className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">
            Negotiation Position
          </h3>

          <StatRow label="Our Price" value={`${constraints.currency} ${currentOurPrice.toFixed(2)}`} highlight />
          <StatRow label="Their Price" value={currentTheirPrice !== null ? `${constraints.currency} ${currentTheirPrice.toFixed(2)}` : '—'} />
          <StatRow label="Gap" value={gap !== null ? `${constraints.currency} ${gap.toFixed(2)} (${gapPct}%)` : '—'} />

          <div className="border-t border-[#E2E8F0] pt-2">
            <h3 className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide mb-2">
              Constraints
            </h3>
            <StatRow label="Anchor" value={`${constraints.currency} ${constraints.anchorPrice.toFixed(2)}`} />
            <StatRow label="Floor" value={`${constraints.currency} ${constraints.priceFloor.toFixed(2)}`} />
            <StatRow label="Ceiling" value={`${constraints.currency} ${constraints.priceCeiling.toFixed(2)}`} />
            <StatRow label="Max/Round" value={`${(constraints.maxConcessionPerRound * 100).toFixed(0)}%`} />
            <StatRow label="Max Total" value={`${(constraints.maxTotalConcession * 100).toFixed(0)}%`} />
            <StatRow label="Min Rounds" value={`${constraints.minRoundsBeforeConcession}`} />
          </div>

          <div className="border-t border-[#E2E8F0] pt-2">
            <h3 className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide mb-2">
              Concession Tracker
            </h3>
            <StatRow label="Given" value={`${constraints.currency} ${totalConcessionGiven.toFixed(2)} (${concessionPct}%)`} />
            <StatRow label="Remaining" value={`${constraints.currency} ${remainingRoom.toFixed(2)}`} />
            <div className="mt-1">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (totalConcessionGiven / maxTotalConcessionAmt) * 100)}%`,
                    backgroundColor: totalConcessionGiven / maxTotalConcessionAmt > 0.8 ? '#EF4444' : totalConcessionGiven / maxTotalConcessionAmt > 0.5 ? '#F59E0B' : '#10B981',
                  }}
                />
              </div>
            </div>
            <StatRow label="Round" value={`${rounds.length}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RoundCard({ round, currency }: { round: NegotiationRound; currency: string }) {
  const [expanded, setExpanded] = useState(round.roundNumber === 1 || round.direction === 'inbound')
  const isInbound = round.direction === 'inbound'
  const time = new Date(round.timestamp).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className={`border rounded-lg overflow-hidden ${
      isInbound ? 'border-amber-200 bg-amber-50/50' : 'border-sky-200 bg-sky-50/50'
    }`}>
      {/* Round header */}
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
            isInbound ? 'bg-amber-200 text-amber-800' : 'bg-sky-200 text-sky-800'
          }`}>
            {isInbound ? 'IN' : 'OUT'}
          </span>
          <span className="text-sm font-medium text-[#1E293B] truncate">{round.subject}</span>
        </div>
        <span className="text-xs text-[#64748B] shrink-0 ml-2">{time}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Email body */}
          <pre className="text-xs text-[#1E293B] whitespace-pre-wrap font-sans bg-white/60 rounded p-2 border border-[#E2E8F0]">
            {round.body}
          </pre>

          {/* Parsed offer */}
          {round.parsedOffer && (
            <ParsedOfferSummary offer={round.parsedOffer} currency={currency} />
          )}

          {/* AI analysis */}
          {round.aiAnalysis && (
            <div className="text-xs bg-violet-50 border border-violet-200 rounded p-2">
              <span className="font-semibold text-violet-700">AI Analysis: </span>
              <span className="text-violet-900">{round.aiAnalysis}</span>
            </div>
          )}

          {/* Price indicators */}
          <div className="flex gap-3 text-xs text-[#64748B]">
            {round.ourPrice !== null && (
              <span>Our price: <span className="font-medium text-[#1E293B]">{currency} {round.ourPrice.toFixed(2)}</span></span>
            )}
            {round.theirPrice !== null && (
              <span>Their price: <span className="font-medium text-[#1E293B]">{currency} {round.theirPrice.toFixed(2)}</span></span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ParsedOfferSummary({ offer, currency }: { offer: ParsedOffer; currency: string }) {
  const confidenceColour = offer.confidence >= 70 ? 'text-emerald-600' : offer.confidence >= 50 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="text-xs bg-slate-50 border border-slate-200 rounded p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-[#1B2A4A]">Parsed Offer</span>
        <span className={`font-medium ${confidenceColour}`}>
          {offer.confidence}% confidence
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {offer.price !== null && (
          <span>Price: <strong>{currency} {offer.price.toFixed(2)}</strong></span>
        )}
        {offer.quantity !== null && (
          <span>Qty: <strong>{offer.quantity.toLocaleString()}</strong></span>
        )}
        {offer.vintage && <span>Vintage: <strong>{offer.vintage}</strong></span>}
        {offer.terms && <span className="col-span-2">Terms: {offer.terms}</span>}
      </div>
      {offer.confidence < 70 && (
        <p className="mt-1 text-amber-600 font-medium">Manual review recommended</p>
      )}
    </div>
  )
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[#64748B]">{label}</span>
      <span className={highlight ? 'font-semibold text-[#1B2A4A]' : 'text-[#1E293B]'}>{value}</span>
    </div>
  )
}

function ActionButton({
  label, colour, active, actionKey, onAction,
}: {
  label: string; colour: string; active: string | null; actionKey: string;
  onAction: (key: string | null) => void;
}) {
  return (
    <button
      className={`px-3 py-1.5 text-xs font-medium rounded text-white ${colour} disabled:opacity-40`}
      disabled={active !== null}
      onClick={() => {
        onAction(actionKey)
        setTimeout(() => onAction(null), 1500)
      }}
    >
      {active === actionKey ? 'Processing...' : label}
    </button>
  )
}
