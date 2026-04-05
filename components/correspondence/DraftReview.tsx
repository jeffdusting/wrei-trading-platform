'use client'

/**
 * DraftReview — Lists all AI-drafted emails awaiting broker approval.
 * Actions: Approve & Send, Edit, Reject.
 */

import { useState } from 'react'
import type { DraftCorrespondence, CorrespondenceStatus } from '@/lib/correspondence/types'

// ---------------------------------------------------------------------------
// Demo drafts
// ---------------------------------------------------------------------------

const DEMO_DRAFTS: DraftCorrespondence[] = [
  {
    id: 'draft-1', organisationId: 'org-1', type: 'rfq',
    counterpartyName: 'Green Energy Trading', counterpartyEmail: 'sarah.mitchell@greenenergy.com.au',
    subject: 'RFQ: ESC — 50,000 units for FY2026 compliance',
    body: 'Dear Sarah,\n\nWe are seeking a competitive offer for Energy Savings Certificates on behalf of our client.\n\nInstrument: ESC\nQuantity: 50,000 units\nCompliance year: 2026\nSettlement: T+2 registry transfer preferred\n\nPlease provide your best offer including:\n- Price per unit (AUD)\n- Available vintages\n- Delivery timeline\n\nWe look forward to your response.\n\nKind regards',
    status: 'drafted', threadId: 'thread-1', relatedClientId: 'demo-1', relatedInstrument: 'ESC',
    aiModel: 'claude-sonnet-4-20250514', aiTokensUsed: 312,
    rejectionReason: null, createdBy: 'user-1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(), sentAt: null,
  },
  {
    id: 'draft-2', organisationId: 'org-1', type: 'rfq',
    counterpartyName: 'Ecovantage Energy', counterpartyEmail: 'd.park@ecovantage.com.au',
    subject: 'RFQ: ESC — 50,000 units for FY2026 compliance',
    body: 'Dear David,\n\nWe are writing to request a quotation for Energy Savings Certificates.\n\nInstrument: ESC\nQuantity: 50,000 units\nCompliance year: 2026\nSettlement: T+2 registry transfer preferred\n\nAs a major ESC creator, we value your ability to supply large volumes directly. Please provide your best pricing and available vintages.\n\nKind regards',
    status: 'drafted', threadId: 'thread-1', relatedClientId: 'demo-1', relatedInstrument: 'ESC',
    aiModel: 'claude-sonnet-4-20250514', aiTokensUsed: 287,
    rejectionReason: null, createdBy: 'user-1',
    createdAt: new Date(Date.now() - 3500000).toISOString(),
    updatedAt: new Date(Date.now() - 3500000).toISOString(), sentAt: null,
  },
  {
    id: 'draft-3', organisationId: 'org-1', type: 'rfq',
    counterpartyName: 'CORE Markets', counterpartyEmail: 'a.thompson@coremarkets.com.au',
    subject: 'RFQ: VEEC — 120,000 units, urgent requirement',
    body: 'Dear Alex,\n\nWe have an urgent requirement for Victorian Energy Efficiency Certificates on behalf of a client.\n\nInstrument: VEEC\nQuantity: 120,000 units\nCompliance year: 2026\nTimeline: Urgent — within 15 days\nSettlement: T+2 registry transfer\n\nGiven the time sensitivity, we would appreciate your prompt response with pricing and availability.\n\nKind regards',
    status: 'drafted', threadId: 'thread-2', relatedClientId: 'demo-4', relatedInstrument: 'VEEC',
    aiModel: 'claude-sonnet-4-20250514', aiTokensUsed: 298,
    rejectionReason: null, createdBy: 'user-1',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(), sentAt: null,
  },
]

const STATUS_LABELS: Record<CorrespondenceStatus, { label: string; colour: string }> = {
  drafted: { label: 'Draft', colour: 'bg-slate-100 text-slate-600' },
  approved: { label: 'Approved', colour: 'bg-emerald-100 text-emerald-700' },
  sent: { label: 'Sent', colour: 'bg-sky-100 text-sky-700' },
  rejected: { label: 'Rejected', colour: 'bg-red-100 text-red-700' },
  replied: { label: 'Replied', colour: 'bg-purple-100 text-purple-700' },
}

interface Props {
  drafts?: DraftCorrespondence[]
}

export default function DraftReview({ drafts: externalDrafts }: Props) {
  const [drafts, setDrafts] = useState<DraftCorrespondence[]>(externalDrafts ?? DEMO_DRAFTS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const updateStatus = (id: string, status: CorrespondenceStatus, extra?: { body?: string; rejectionReason?: string }) => {
    setDrafts(prev => prev.map(d => {
      if (d.id !== id) return d
      return {
        ...d,
        status,
        body: extra?.body ?? d.body,
        rejectionReason: extra?.rejectionReason ?? d.rejectionReason,
        sentAt: status === 'sent' ? new Date().toISOString() : d.sentAt,
        updatedAt: new Date().toISOString(),
      }
    }))
    setEditingId(null)
    setRejectingId(null)
    setRejectReason('')
  }

  const handleApprove = (id: string) => {
    updateStatus(id, 'sent')
    // In production: POST /api/v1/correspondence/:id/send
  }

  const handleStartEdit = (draft: DraftCorrespondence) => {
    setEditingId(draft.id)
    setEditBody(draft.body)
    setExpandedId(draft.id)
  }

  const handleSaveEdit = (id: string) => {
    updateStatus(id, 'drafted', { body: editBody })
    setEditingId(null)
  }

  const handleReject = (id: string) => {
    updateStatus(id, 'rejected', { rejectionReason: rejectReason || 'No reason provided' })
  }

  const pendingDrafts = drafts.filter(d => d.status === 'drafted')
  const processedDrafts = drafts.filter(d => d.status !== 'drafted')

  return (
    <div className="space-y-4">
      {/* Pending drafts */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Drafts Awaiting Approval
          </h3>
          <span className="text-[10px] text-amber-600 font-medium">
            {pendingDrafts.length} pending
          </span>
        </div>

        {pendingDrafts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No drafts awaiting review</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingDrafts.map(draft => (
              <div key={draft.id} className="hover:bg-slate-50 transition-colors">
                {/* Draft header row */}
                <div
                  className="px-4 py-3 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === draft.id ? null : draft.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs text-slate-800 truncate">{draft.counterpartyName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_LABELS[draft.status].colour}`}>
                        {STATUS_LABELS[draft.status].label}
                      </span>
                      {draft.relatedInstrument && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-600">{draft.relatedInstrument}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{draft.subject}</div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                    {draft.aiModel && <span>AI: {draft.aiModel.split('-').slice(-1)[0]}</span>}
                    {draft.aiTokensUsed && <span>{draft.aiTokensUsed} tok</span>}
                    <span className="text-slate-300">▾</span>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedId === draft.id && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="text-[10px] text-slate-400 flex gap-4">
                      <span>To: {draft.counterpartyEmail}</span>
                      <span>Created: {new Date(draft.createdAt).toLocaleString('en-AU')}</span>
                    </div>

                    {editingId === draft.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editBody}
                          onChange={e => setEditBody(e.target.value)}
                          className="w-full h-48 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded p-3 resize-y focus:outline-none focus:ring-1 focus:ring-sky-300"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(draft.id)}
                            className="px-3 py-1.5 text-[10px] font-medium bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-[10px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap font-mono leading-relaxed">
                        {draft.body}
                      </pre>
                    )}

                    {rejectingId === draft.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection (optional)"
                          className="flex-1 text-xs border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-300"
                        />
                        <button
                          onClick={() => handleReject(draft.id)}
                          className="px-3 py-1.5 text-[10px] font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason('') }}
                          className="px-3 py-1.5 text-[10px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : editingId !== draft.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(draft.id)}
                          className="px-3 py-1.5 text-[10px] font-medium bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                        >
                          Approve &amp; Send
                        </button>
                        <button
                          onClick={() => handleStartEdit(draft)}
                          className="px-3 py-1.5 text-[10px] font-medium bg-white text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setRejectingId(draft.id)}
                          className="px-3 py-1.5 text-[10px] font-medium text-red-600 hover:text-red-800 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed drafts */}
      {processedDrafts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Processed</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {processedDrafts.map(draft => {
              const sl = STATUS_LABELS[draft.status]
              return (
                <div key={draft.id} className="px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-700">{draft.counterpartyName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${sl.colour}`}>{sl.label}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{draft.subject}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 shrink-0">
                    {draft.sentAt ? new Date(draft.sentAt).toLocaleString('en-AU') : new Date(draft.updatedAt).toLocaleString('en-AU')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
