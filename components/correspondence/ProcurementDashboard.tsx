'use client'

/**
 * ProcurementDashboard — Table of clients with compliance shortfalls,
 * sorted by risk level. Allows triggering AI-drafted RFQ generation.
 */

import { useState, useEffect, useCallback } from 'react'
import type { ProcurementRecommendation, RiskLevel } from '@/lib/correspondence/types'

const RISK_BADGE: Record<RiskLevel, { label: string; colour: string; dot: string }> = {
  red: { label: 'Critical', colour: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  amber: { label: 'At Risk', colour: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  green: { label: 'Monitor', colour: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
}

// ---------------------------------------------------------------------------
// Demo data — used when API is unavailable
// ---------------------------------------------------------------------------

const DEMO_RECOMMENDATIONS: ProcurementRecommendation[] = [
  {
    clientId: 'demo-1', clientName: 'Origin Energy', instrument: 'ESC',
    target: 850_000, held: 180_000, surrendered: 620_000, shortfall: 50_000,
    penaltyExposure: 50_000 * 29.48, penaltyRate: 29.48, urgency: 45,
    riskLevel: 'amber', recommendedAction: 'Priority: source 50,000 ESC within 30 days',
    complianceYear: '2026', surrenderDeadline: '2027-02-28',
    timingSignal: 'BUY_NOW', forecastPrice4w: 24.30, forecastConfidence: 0.72,
    timingExplanation: 'Price forecast to rise from A$23.10 to A$24.30 at 4-week horizon (+A$1.20)',
  },
  {
    clientId: 'demo-2', clientName: 'EnergyAustralia', instrument: 'ESC',
    target: 1_500_000, held: 200_000, surrendered: 500_000, shortfall: 800_000,
    penaltyExposure: 800_000 * 29.48, penaltyRate: 29.48, urgency: 22,
    riskLevel: 'red', recommendedAction: 'Urgent: procure 800,000 ESC immediately to avoid penalty exposure',
    complianceYear: '2026', surrenderDeadline: '2027-02-28',
    timingSignal: 'BUY_NOW_DEADLINE', forecastPrice4w: 24.30, forecastConfidence: 0.72,
    timingExplanation: 'Price forecast to rise. Deadline pressure overrides timing — only 22 days remaining',
  },
  {
    clientId: 'demo-3', clientName: 'AGL Energy', instrument: 'ESC',
    target: 1_200_000, held: 300_000, surrendered: 800_000, shortfall: 100_000,
    penaltyExposure: 100_000 * 29.48, penaltyRate: 29.48, urgency: 120,
    riskLevel: 'green', recommendedAction: 'Monitor: 100,000 ESC shortfall — schedule procurement',
    complianceYear: '2026', surrenderDeadline: '2027-02-28',
    timingSignal: 'CONSIDER', forecastPrice4w: 24.30, forecastConfidence: 0.72,
    timingExplanation: 'Good price opportunity — consider opportunistic procurement',
  },
  {
    clientId: 'demo-4', clientName: 'Alinta Energy', instrument: 'VEEC',
    target: 200_000, held: 20_000, surrendered: 60_000, shortfall: 120_000,
    penaltyExposure: 120_000 * 120.0, penaltyRate: 120.0, urgency: 15,
    riskLevel: 'red', recommendedAction: 'Urgent: procure 120,000 VEEC immediately to avoid penalty exposure',
    complianceYear: '2026', surrenderDeadline: '2027-02-28',
    timingSignal: 'BUY_NOW_DEADLINE', forecastPrice4w: 58.90, forecastConfidence: 0.65,
    timingExplanation: 'Deadline pressure — only 15 days remaining',
  },
]

interface Props {
  onGenerateRFQs?: (rec: ProcurementRecommendation) => void
  pendingDraftCount?: number
}

export default function ProcurementDashboard({ onGenerateRFQs, pendingDraftCount = 0 }: Props) {
  const [recommendations, setRecommendations] = useState<ProcurementRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/correspondence/procurement')
      if (res.ok) {
        const data = await res.json()
        if (data.recommendations?.length > 0) {
          setRecommendations(data.recommendations)
          setLoading(false)
          return
        }
      }
    } catch { /* fall through to demo */ }
    setRecommendations(DEMO_RECOMMENDATIONS.sort((a, b) => {
      const order: Record<RiskLevel, number> = { red: 0, amber: 1, green: 2 }
      return order[a.riskLevel] - order[b.riskLevel] || b.penaltyExposure - a.penaltyExposure
    }))
    setLoading(false)
  }, [])

  useEffect(() => { fetchRecommendations() }, [fetchRecommendations])

  const handleGenerate = async (rec: ProcurementRecommendation) => {
    setGenerating(rec.clientId)
    if (onGenerateRFQs) onGenerateRFQs(rec)
    // Simulate delay for demo
    setTimeout(() => setGenerating(null), 1500)
  }

  const totalExposure = recommendations.reduce((sum, r) => sum + r.penaltyExposure, 0)
  const totalShortfall = recommendations.reduce((sum, r) => sum + r.shortfall, 0)

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Clients at Risk</div>
          <div className="text-xl font-semibold text-slate-800 mt-1">
            {recommendations.filter(r => r.riskLevel !== 'green').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Shortfall</div>
          <div className="text-xl font-semibold text-slate-800 mt-1">
            {totalShortfall.toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Penalty Exposure</div>
          <div className="text-xl font-semibold text-red-600 mt-1">
            A${(totalExposure / 1_000_000).toFixed(2)}M
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Drafts Pending</div>
          <div className="text-xl font-semibold text-amber-600 mt-1">{pendingDraftCount}</div>
        </div>
      </div>

      {/* Recommendations table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Procurement Recommendations
          </h3>
          <span className="text-[10px] text-slate-400">
            {recommendations.length} client{recommendations.length !== 1 ? 's' : ''} with shortfalls
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading recommendations…</div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            All clients are compliant — no procurement needed
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-2 font-medium">Risk</th>
                  <th className="text-left px-4 py-2 font-medium">Client</th>
                  <th className="text-left px-4 py-2 font-medium">Instrument</th>
                  <th className="text-right px-4 py-2 font-medium">Target</th>
                  <th className="text-right px-4 py-2 font-medium">Surrendered</th>
                  <th className="text-right px-4 py-2 font-medium">Shortfall</th>
                  <th className="text-right px-4 py-2 font-medium">Penalty Exposure</th>
                  <th className="text-right px-4 py-2 font-medium">Days Left</th>
                  <th className="text-center px-4 py-2 font-medium">Timing</th>
                  <th className="text-center px-4 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendations.map(rec => {
                  const badge = RISK_BADGE[rec.riskLevel]
                  return (
                    <tr key={`${rec.clientId}-${rec.instrument}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded ${badge.colour}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{rec.clientName}</td>
                      <td className="px-4 py-3 text-slate-600">{rec.instrument}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{rec.target.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{rec.surrendered.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">{rec.shortfall.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-600">
                        A${rec.penaltyExposure.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono ${rec.urgency < 30 ? 'text-red-600 font-semibold' : rec.urgency < 90 ? 'text-amber-600' : 'text-slate-600'}`}>
                          {rec.urgency}d
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rec.timingSignal ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{
                              backgroundColor: rec.timingSignal.includes('BUY') ? '#DBEAFE' : rec.timingSignal === 'WAIT' ? '#FEF3C7' : rec.timingSignal === 'CONSIDER' ? '#F0FDF4' : '#F3F4F6',
                              color: rec.timingSignal.includes('BUY') ? '#1E40AF' : rec.timingSignal === 'WAIT' ? '#92400E' : rec.timingSignal === 'CONSIDER' ? '#166534' : '#374151',
                            }}
                            title={rec.timingExplanation ?? ''}
                          >
                            {rec.timingSignal.replace(/_/g, ' ')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleGenerate(rec)}
                          disabled={generating === rec.clientId}
                          className="px-3 py-1 text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200 rounded hover:bg-sky-100 transition-colors disabled:opacity-50"
                        >
                          {generating === rec.clientId ? 'Generating…' : 'Generate RFQs'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
