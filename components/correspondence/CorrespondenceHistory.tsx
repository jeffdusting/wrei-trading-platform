'use client'

/**
 * CorrespondenceHistory — Timeline view of all correspondence for an organisation,
 * filterable by client, counterparty, type, and status.
 */

import { useState, useMemo } from 'react'
import type { DraftCorrespondence, CorrespondenceType, CorrespondenceStatus } from '@/lib/correspondence/types'

// ---------------------------------------------------------------------------
// Demo history data
// ---------------------------------------------------------------------------

const DEMO_HISTORY: DraftCorrespondence[] = [
  {
    id: 'hist-1', organisationId: 'org-1', type: 'rfq',
    counterpartyName: 'Green Energy Trading', counterpartyEmail: 'sarah.mitchell@greenenergy.com.au',
    subject: 'RFQ: ESC — 75,000 units for FY2025 compliance',
    body: 'Dear Sarah,\n\nWe are seeking a competitive offer for Energy Savings Certificates...',
    status: 'sent', threadId: 'thread-old-1', relatedClientId: 'demo-1', relatedInstrument: 'ESC',
    aiModel: 'claude-sonnet-4-20250514', aiTokensUsed: 290,
    rejectionReason: null, createdBy: 'user-1',
    createdAt: '2026-03-15T09:30:00Z', updatedAt: '2026-03-15T10:00:00Z', sentAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'hist-2', organisationId: 'org-1', type: 'quote',
    counterpartyName: 'Green Energy Trading', counterpartyEmail: 'sarah.mitchell@greenenergy.com.au',
    subject: 'RE: RFQ: ESC — 75,000 units for FY2025 compliance',
    body: 'Dear Team,\n\nThank you for your enquiry. We can offer 75,000 ESCs at A$22.80/unit...',
    status: 'replied', threadId: 'thread-old-1', relatedClientId: 'demo-1', relatedInstrument: 'ESC',
    aiModel: null, aiTokensUsed: null,
    rejectionReason: null, createdBy: 'user-1',
    createdAt: '2026-03-16T14:20:00Z', updatedAt: '2026-03-16T14:20:00Z', sentAt: null,
  },
  {
    id: 'hist-3', organisationId: 'org-1', type: 'confirmation',
    counterpartyName: 'Green Energy Trading', counterpartyEmail: 'sarah.mitchell@greenenergy.com.au',
    subject: 'Trade Confirmation: 75,000 ESC @ A$22.80',
    body: 'Dear Sarah,\n\nThis confirms the following trade:\n\nInstrument: ESC\nQuantity: 75,000\nPrice: A$22.80/unit...',
    status: 'sent', threadId: 'thread-old-1', relatedClientId: 'demo-1', relatedInstrument: 'ESC',
    aiModel: 'claude-sonnet-4-20250514', aiTokensUsed: 245,
    rejectionReason: null, createdBy: 'user-1',
    createdAt: '2026-03-18T11:00:00Z', updatedAt: '2026-03-18T11:30:00Z', sentAt: '2026-03-18T11:30:00Z',
  },
  {
    id: 'hist-4', organisationId: 'org-1', type: 'rfq',
    counterpartyName: 'CORE Markets', counterpartyEmail: 'a.thompson@coremarkets.com.au',
    subject: 'RFQ: ACCU — 10,000 units, Human-Induced Regeneration method',
    body: 'Dear Alex,\n\nWe have a client requirement for Australian Carbon Credit Units...',
    status: 'rejected', threadId: 'thread-old-2', relatedClientId: 'demo-3', relatedInstrument: 'ACCU',
    aiModel: 'claude-sonnet-4-20250514', aiTokensUsed: 310,
    rejectionReason: 'Client changed requirements — no longer needs ACCUs',
    createdBy: 'user-1',
    createdAt: '2026-03-20T08:45:00Z', updatedAt: '2026-03-20T09:00:00Z', sentAt: null,
  },
  {
    id: 'hist-5', organisationId: 'org-1', type: 'rfq',
    counterpartyName: 'Sustainable Markets Australia', counterpartyEmail: 'j.chen@sustainablemarkets.com.au',
    subject: 'RFQ: LGC — 200,000 units for institutional client',
    body: 'Dear James,\n\nWe are sourcing Large-scale Generation Certificates...',
    status: 'sent', threadId: 'thread-old-3', relatedClientId: 'demo-2', relatedInstrument: 'LGC',
    aiModel: 'claude-sonnet-4-20250514', aiTokensUsed: 275,
    rejectionReason: null, createdBy: 'user-1',
    createdAt: '2026-03-25T13:15:00Z', updatedAt: '2026-03-25T14:00:00Z', sentAt: '2026-03-25T14:00:00Z',
  },
]

const TYPE_LABELS: Record<CorrespondenceType, { label: string; icon: string }> = {
  rfq: { label: 'RFQ', icon: '📋' },
  quote: { label: 'Quote', icon: '💰' },
  confirmation: { label: 'Confirmation', icon: '✅' },
  follow_up: { label: 'Follow-up', icon: '↩️' },
  general: { label: 'General', icon: '✉️' },
}

const STATUS_COLOURS: Record<CorrespondenceStatus, string> = {
  drafted: 'bg-slate-400',
  approved: 'bg-emerald-400',
  sent: 'bg-sky-400',
  rejected: 'bg-red-400',
  replied: 'bg-purple-400',
}

export default function CorrespondenceHistory() {
  const [history] = useState<DraftCorrespondence[]>(DEMO_HISTORY)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCounterparty, setFilterCounterparty] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const counterparties = useMemo(
    () => Array.from(new Set(history.map(h => h.counterpartyName))).sort(),
    [history]
  )

  const filtered = useMemo(() => {
    return history.filter(h => {
      if (filterType !== 'all' && h.type !== filterType) return false
      if (filterStatus !== 'all' && h.status !== filterStatus) return false
      if (filterCounterparty !== 'all' && h.counterpartyName !== filterCounterparty) return false
      return true
    })
  }, [history, filterType, filterStatus, filterCounterparty])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap gap-3 items-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Filters:</span>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-300"
        >
          <option value="all">All Types</option>
          <option value="rfq">RFQ</option>
          <option value="quote">Quote</option>
          <option value="confirmation">Confirmation</option>
          <option value="follow_up">Follow-up</option>
          <option value="general">General</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-300"
        >
          <option value="all">All Statuses</option>
          <option value="drafted">Drafted</option>
          <option value="approved">Approved</option>
          <option value="sent">Sent</option>
          <option value="rejected">Rejected</option>
          <option value="replied">Replied</option>
        </select>

        <select
          value={filterCounterparty}
          onChange={e => setFilterCounterparty(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-300"
        >
          <option value="all">All Counterparties</option>
          {counterparties.map(cp => (
            <option key={cp} value={cp}>{cp}</option>
          ))}
        </select>

        <span className="text-[10px] text-slate-400 ml-auto">
          {filtered.length} of {history.length} records
        </span>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Correspondence Timeline
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No correspondence matches the selected filters</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(item => {
              const typeInfo = TYPE_LABELS[item.type]
              const statusColour = STATUS_COLOURS[item.status]
              return (
                <div key={item.id} className="hover:bg-slate-50 transition-colors">
                  <div
                    className="px-4 py-3 flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center mt-1 shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusColour}`} />
                      <div className="w-px h-full bg-slate-200 mt-1" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {typeInfo.label}
                        </span>
                        <span className="text-xs font-medium text-slate-700">{item.counterpartyName}</span>
                        {item.relatedInstrument && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-600">{item.relatedInstrument}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{item.subject}</div>
                      {item.threadId && (
                        <div className="text-[10px] text-slate-300 mt-0.5">Thread: {item.threadId.slice(0, 8)}…</div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="text-[10px] text-slate-400 shrink-0 capitalize">{item.status}</div>
                  </div>

                  {/* Expanded email content */}
                  {expandedId === item.id && (
                    <div className="px-4 pb-4 ml-7">
                      <div className="text-[10px] text-slate-400 mb-2 flex gap-4">
                        <span>To: {item.counterpartyEmail}</span>
                        {item.sentAt && <span>Sent: {new Date(item.sentAt).toLocaleString('en-AU')}</span>}
                        {item.aiModel && <span>AI: {item.aiModel}</span>}
                      </div>
                      <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap font-mono leading-relaxed">
                        {item.body}
                      </pre>
                      {item.rejectionReason && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                          Rejected: {item.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
