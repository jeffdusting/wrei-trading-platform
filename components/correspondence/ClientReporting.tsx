'use client'

/**
 * Client Reporting — broker generates and reviews AI-drafted
 * compliance position reports before sending to clients.
 */

import { useState, useEffect } from 'react'
import type { ClientPositionData, ClientReport } from '@/lib/correspondence/client-reporting'
import { getDemoClientData, getAllReports, updateReportStatus } from '@/lib/correspondence/client-reporting'

// ---------------------------------------------------------------------------
// Report Status Badge
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<ClientReport['status'], string> = {
  draft: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  sent: 'bg-emerald-100 text-emerald-700',
}

function ReportStatusBadge({ status }: { status: ClientReport['status'] }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Report Preview Modal
// ---------------------------------------------------------------------------

function ReportPreview({
  report,
  onApprove,
  onClose,
}: {
  report: ClientReport
  onApprove: () => void
  onClose: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="border-b border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{report.subject}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated {new Date(report.generatedAt).toLocaleDateString()} — <ReportStatusBadge status={report.status} />
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Close
        </button>
      </div>

      {/* Email Body Preview */}
      <div className="p-4 border-b border-slate-100">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Email Body</h4>
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
          {report.body}
        </div>
      </div>

      {/* Attachment Preview */}
      <div className="p-4 border-b border-slate-100">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Attached Report (HTML)</h4>
        <div className="border border-slate-200 rounded overflow-hidden max-h-80 overflow-y-auto">
          <iframe
            srcDoc={report.attachmentHTML}
            title="Report preview"
            className="w-full h-80 border-0"
            sandbox=""
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {report.status === 'draft' ? 'Review and approve before sending to client.' : ''}
          {report.status === 'sent' && report.sentAt ? `Sent ${new Date(report.sentAt).toLocaleDateString()}` : ''}
        </div>
        <div className="flex items-center gap-2">
          {report.status === 'draft' && (
            <button
              onClick={onApprove}
              className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Approve &amp; Mark Ready
            </button>
          )}
          {report.status === 'reviewed' && (
            <button
              onClick={onApprove}
              className="px-4 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            >
              Mark as Sent
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ClientReporting() {
  const [clients] = useState<ClientPositionData[]>(getDemoClientData)
  const [reports, setReports] = useState<ClientReport[]>([])
  const [generating, setGenerating] = useState<Set<string>>(new Set())
  const [generatingAll, setGeneratingAll] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ClientReport | null>(null)

  useEffect(() => {
    setReports(getAllReports())
  }, [])

  const refreshReports = () => setReports(getAllReports())

  const generateReport = async (clientId: string) => {
    setGenerating(prev => new Set(prev).add(clientId))
    try {
      const { generateClientPositionReport } = await import('@/lib/correspondence/client-reporting')
      const clientData = clients.find(c => c.clientId === clientId)
      if (!clientData) return
      await generateClientPositionReport(clientData)
      refreshReports()
    } finally {
      setGenerating(prev => {
        const next = new Set(prev)
        next.delete(clientId)
        return next
      })
    }
  }

  const generateAllReports = async () => {
    setGeneratingAll(true)
    try {
      const { generateBatchReports } = await import('@/lib/correspondence/client-reporting')
      await generateBatchReports(clients)
      refreshReports()
    } finally {
      setGeneratingAll(false)
    }
  }

  const handleApprove = (report: ClientReport) => {
    const nextStatus = report.status === 'draft' ? 'reviewed' : 'sent'
    const updated = updateReportStatus(report.id, nextStatus)
    if (updated) {
      setSelectedReport(updated)
      refreshReports()
    }
  }

  const draftCount = reports.filter(r => r.status === 'draft').length
  const sentCount = reports.filter(r => r.status === 'sent').length

  if (selectedReport) {
    return (
      <ReportPreview
        report={selectedReport}
        onApprove={() => handleApprove(selectedReport)}
        onClose={() => setSelectedReport(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">Total Clients</div>
          <div className="text-xl font-semibold text-slate-800">{clients.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">Pending Reports</div>
          <div className={`text-xl font-semibold ${draftCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {draftCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">Sent This Period</div>
          <div className="text-xl font-semibold text-emerald-600">{sentCount}</div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700">Client Reports</h3>
          <button
            onClick={generateAllReports}
            disabled={generatingAll}
            className="px-3 py-1.5 text-[10px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {generatingAll ? 'Generating...' : 'Generate All'}
          </button>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500">
              <th className="text-left px-4 py-2 font-medium">Client</th>
              <th className="text-left px-4 py-2 font-medium">Type</th>
              <th className="text-right px-4 py-2 font-medium">Penalty Exposure</th>
              <th className="text-left px-4 py-2 font-medium">Latest Report</th>
              <th className="text-right px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => {
              const clientReports = reports.filter(r => r.clientId === client.clientId)
              const latest = clientReports[0] ?? null

              return (
                <tr key={client.clientId} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-800">{client.clientName}</div>
                    <div className="text-[10px] text-slate-500">{client.contactEmail ?? '—'}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 capitalize">
                    {client.entityType.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {client.penaltyExposure > 0 ? (
                      <span className="text-red-600 font-medium">
                        A${client.penaltyExposure.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-emerald-600">A$0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {latest ? (
                      <div className="flex items-center gap-2">
                        <ReportStatusBadge status={latest.status} />
                        <span className="text-slate-500">{new Date(latest.generatedAt).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => generateReport(client.clientId)}
                        disabled={generating.has(client.clientId)}
                        className="px-2 py-1 text-[10px] font-medium border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
                      >
                        {generating.has(client.clientId) ? 'Generating...' : 'Generate'}
                      </button>
                      {latest && (
                        <button
                          onClick={() => setSelectedReport(latest)}
                          className="px-2 py-1 text-[10px] font-medium border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-semibold text-slate-700">Report History</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {reports.slice(0, 10).map(report => (
              <div
                key={report.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div>
                  <div className="text-xs font-medium text-slate-800">{report.subject}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(report.generatedAt).toLocaleString()}
                  </div>
                </div>
                <ReportStatusBadge status={report.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
