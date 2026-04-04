'use client'

/**
 * Regulatory Compliance Page — Scenario D (WP4 §5)
 *
 * Comprehensive compliance dashboard for compliance officers:
 * - Regulatory status grid (ASIC, AUSTRAC, IPART, CER)
 * - ESS compliance view with obligated entity positions
 * - Scheme changes monitor
 * - Audit trail viewer with filtering and CSV export
 */

import { useState } from 'react'
import { RegulatoryMap, ComplianceStatusDashboard } from '@/components/compliance'
import AuditTrailViewer from '@/components/compliance/AuditTrailViewer'
import {
  generateComplianceSummaryHtml,
  downloadHtml,
  AI_DISCLOSURE_TEXT,
} from '@/lib/trading/compliance/report-generator'
import type { CompliancePosition } from '@/lib/trading/compliance/report-generator'

// ---------------------------------------------------------------------------
// Static data — regulatory status, ESS positions, scheme changes
// ---------------------------------------------------------------------------

const REGULATORY_STATUS = [
  { body: 'ASIC', area: 'AFSL — Digital Assets', status: 'in_progress' as const, lastReview: '2026-03-15', nextAction: 'Application lodgement Q3 2026', contact: 'Gilbert + Tobin' },
  { body: 'AUSTRAC', area: 'AML/CTF Registration', status: 'compliant' as const, lastReview: '2026-03-28', nextAction: 'Annual report due Dec 2026', contact: 'KWM' },
  { body: 'IPART', area: 'ESS Scheme Participant', status: 'compliant' as const, lastReview: '2026-04-01', nextAction: 'Annual statement due 28 Feb 2027', contact: 'Internal' },
  { body: 'CER', area: 'ACCU Trading Authorisation', status: 'pending' as const, lastReview: '2026-02-20', nextAction: 'Application preparation', contact: 'Internal' },
]

const STATUS_CONFIG = {
  compliant: { label: 'Compliant', colour: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  in_progress: { label: 'In Progress', colour: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  pending: { label: 'Pending', colour: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

const ESS_POSITIONS = [
  {
    entity: 'Origin Energy',
    target2026: 850_000,
    surrendered: 620_000,
    held: 180_000,
    shortfall: 50_000,
    penaltyExposure: 50_000 * 29.48,
    deadline: '28 Feb 2027',
    status: 'at_risk' as const,
  },
  {
    entity: 'AGL Energy',
    target2026: 1_200_000,
    surrendered: 950_000,
    held: 300_000,
    shortfall: 0,
    penaltyExposure: 0,
    deadline: '28 Feb 2027',
    status: 'on_track' as const,
  },
]

const SCHEME_CHANGES = [
  {
    title: 'ESS Rule Change Review 2026',
    body: 'IPART',
    status: 'Open for submissions',
    deadline: '30 June 2026',
    impact: 'May revise activity eligibility criteria and baseline calculations. Commercial lighting phase-out affects ~15% of current ESC creation volume.',
  },
  {
    title: 'ESS Policy Reform Consultation',
    body: 'NSW Government',
    status: 'Consultation paper released',
    deadline: '15 August 2026',
    impact: 'Potential expansion to include transport electrification activities. Could increase ESC creation volumes and market liquidity.',
  },
  {
    title: 'Digital Assets Framework Bill 2025',
    body: 'Federal Treasury',
    status: 'Parliamentary committee review',
    deadline: 'Expected passage H2 2026',
    impact: 'Establishes licensing regime for digital asset platforms. WREI AFSL application aligns with anticipated requirements.',
  },
]

type ComplianceTab = 'overview' | 'ess' | 'changes' | 'audit'

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<ComplianceTab>('overview')

  const tabs: { id: ComplianceTab; label: string }[] = [
    { id: 'overview', label: 'Regulatory Overview' },
    { id: 'ess', label: 'ESS Compliance' },
    { id: 'changes', label: 'Scheme Changes' },
    { id: 'audit', label: 'Audit Trail' },
  ]

  return (
    <div className="min-h-screen bg-slate-50" data-demo="compliance-overview">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Regulatory Compliance</h1>
              <p className="bloomberg-body-text text-slate-600 mt-1">
                Australian Financial Services Framework — Compliance Monitoring and Audit
              </p>
            </div>
            <div className="bloomberg-section-label">CMP</div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mt-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-t transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-100 text-slate-800 border border-b-0 border-slate-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* TAB: Overview */}
        {activeTab === 'overview' && (
          <>
            {/* Regulatory Status Grid */}
            <section>
              <h2 className="bloomberg-section-label text-slate-700 mb-3">Regulatory Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {REGULATORY_STATUS.map(reg => {
                  const cfg = STATUS_CONFIG[reg.status]
                  return (
                    <div key={reg.body} className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="font-semibold text-sm text-slate-800">{reg.body}</span>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${cfg.colour}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{reg.area}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                        <div><span className="text-slate-400">Last Review:</span> <span className="text-slate-600">{reg.lastReview}</span></div>
                        <div><span className="text-slate-400">Contact:</span> <span className="text-slate-600">{reg.contact}</span></div>
                        <div className="col-span-2"><span className="text-slate-400">Next Action:</span> <span className="text-slate-600">{reg.nextAction}</span></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Trading Activity Summary */}
            <section>
              <h2 className="bloomberg-section-label text-slate-700 mb-3">Trading Activity Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Trades This Period', value: '47', sub: 'Last 30 days' },
                  { label: 'Value Traded', value: 'A$2.1M', sub: 'Cumulative' },
                  { label: 'Counterparties', value: '12', sub: 'Unique' },
                  { label: 'Avg Trade Size', value: 'A$44.7K', sub: 'Per trade' },
                  { label: 'Audit Readiness', value: '94%', sub: 'Score' },
                ].map(m => (
                  <div key={m.label} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-slate-800 font-mono">{m.value}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{m.label}</div>
                    <div className="text-[10px] text-slate-400">{m.sub}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Existing compliance components */}
            <section aria-label="Regulatory compliance map">
              <RegulatoryMap />
            </section>
            <section aria-label="Compliance status dashboard">
              <ComplianceStatusDashboard />
            </section>
          </>
        )}

        {/* TAB: ESS Compliance */}
        {activeTab === 'ess' && (
          <>
            {/* ESS Overview Cards */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="bloomberg-section-label text-slate-700">ESS 2026 Compliance Year</h2>
                <button
                  onClick={() => {
                    const positions: CompliancePosition[] = ESS_POSITIONS.map(p => ({
                      entity: p.entity,
                      target: p.target2026,
                      surrendered: p.surrendered,
                      held: p.held,
                      shortfall: p.shortfall,
                      penaltyExposure: p.penaltyExposure,
                      deadline: p.deadline,
                      status: p.status,
                    }))
                    const html = generateComplianceSummaryHtml(positions, { penaltyRate: 29.48 })
                    downloadHtml(html, `wrei-compliance-summary-${new Date().toISOString().slice(0, 10)}.html`)
                  }}
                  className="text-xs px-3 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                >
                  Export Summary
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500">Penalty Rate</div>
                  <div className="text-lg font-semibold text-red-600 font-mono">A$29.48</div>
                  <div className="text-[10px] text-slate-400">Per ESC shortfall (IPART 2026)</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500">Surrender Deadline</div>
                  <div className="text-sm font-semibold text-slate-800">28 Feb 2027</div>
                  <div className="text-[10px] text-slate-400">ESS Rule 2009 cl 11A</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500">ESC Spot Price</div>
                  <div className="text-lg font-semibold text-slate-800 font-mono">A$23.00</div>
                  <div className="text-[10px] text-emerald-600">Below penalty — buy signal</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500">Breakeven Discount</div>
                  <div className="text-lg font-semibold text-emerald-600 font-mono">22.0%</div>
                  <div className="text-[10px] text-slate-400">Spot vs penalty rate</div>
                </div>
              </div>

              {/* ESS Energy Savings Targets */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-2">ESS Energy Savings Targets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
                  <div><span className="text-slate-400">2026 Target:</span> <span className="font-mono text-slate-800">8.5% of liable electricity</span></div>
                  <div><span className="text-slate-400">Scheme Period:</span> <span className="font-mono text-slate-800">2009 – 2050</span></div>
                  <div><span className="text-slate-400">Administrator:</span> <span className="font-mono text-slate-800">IPART</span></div>
                  <div><span className="text-slate-400">Legislation:</span> <span className="font-mono text-slate-800">Electricity Supply Act 1995 (NSW) Part 9</span></div>
                  <div><span className="text-slate-400">Target Type:</span> <span className="font-mono text-slate-800">Individual (per liable entity)</span></div>
                  <div><span className="text-slate-400">Penalty Source:</span> <span className="font-mono text-slate-800">IPART Targets and Penalties</span></div>
                </div>
              </div>
            </section>

            {/* Obligated Entity Positions */}
            <section>
              <h2 className="bloomberg-section-label text-slate-700 mb-3">Obligated Entity Positions</h2>
              <div className="space-y-3">
                {ESS_POSITIONS.map(pos => {
                  const pctComplete = Math.round(((pos.surrendered + pos.held) / pos.target2026) * 100)
                  const isAtRisk = pos.status === 'at_risk'
                  return (
                    <div key={pos.entity} className={`bg-white border rounded-lg p-4 ${isAtRisk ? 'border-red-200' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800">{pos.entity}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            isAtRisk ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isAtRisk ? 'At Risk' : 'On Track'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">Deadline: {pos.deadline}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full mb-2">
                        <div
                          className={`h-full rounded-full ${isAtRisk ? 'bg-amber-400' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(pctComplete, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                        <div><span className="text-slate-400">Target:</span> <span className="font-mono">{pos.target2026.toLocaleString()}</span></div>
                        <div><span className="text-slate-400">Surrendered:</span> <span className="font-mono">{pos.surrendered.toLocaleString()}</span></div>
                        <div><span className="text-slate-400">Held:</span> <span className="font-mono">{pos.held.toLocaleString()}</span></div>
                        <div><span className="text-slate-400">Shortfall:</span> <span className={`font-mono ${pos.shortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{pos.shortfall.toLocaleString()}</span></div>
                        <div><span className="text-slate-400">Penalty Exposure:</span> <span className={`font-mono ${pos.penaltyExposure > 0 ? 'text-red-600' : 'text-emerald-600'}`}>A${pos.penaltyExposure.toLocaleString()}</span></div>
                        <div><span className="text-slate-400">Progress:</span> <span className="font-mono">{pctComplete}%</span></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {/* TAB: Scheme Changes */}
        {activeTab === 'changes' && (
          <section>
            <h2 className="bloomberg-section-label text-slate-700 mb-3">Active Regulatory Consultations</h2>
            <div className="space-y-3">
              {SCHEME_CHANGES.map(change => (
                <div key={change.title} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-slate-800">{change.title}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {change.body}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[11px] text-slate-500 mb-2">
                    <span>Status: <span className="text-slate-700">{change.status}</span></span>
                    <span>Deadline: <span className="text-slate-700">{change.deadline}</span></span>
                  </div>
                  <p className="text-xs text-slate-600">{change.impact}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB: Audit Trail */}
        {activeTab === 'audit' && (
          <section>
            <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">AI Disclosure — </span>
              <span className="text-xs text-amber-800">{AI_DISCLOSURE_TEXT}</span>
            </div>
            <AuditTrailViewer />
          </section>
        )}
      </div>
    </div>
  )
}
