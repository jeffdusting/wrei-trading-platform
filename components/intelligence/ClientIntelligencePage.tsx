'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { WHITE_LABEL_REGISTRY, DEFAULT_BRANDING, type WhiteLabelConfig } from '@/lib/config/white-label'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ForecastHorizon {
  horizonWeeks: number
  priceForecast: number
  confidenceIntervals: {
    ci80: { lower: number | null; upper: number | null }
    ci95: { lower: number | null; upper: number | null }
  }
  regimeProbabilities: Record<string, number> | null
}

interface PolicyEvent {
  title: string
  date: string
  impact: 'positive' | 'neutral' | 'negative'
  summary: string
}

// Demo data
const DEMO_FORECASTS: ForecastHorizon[] = [
  { horizonWeeks: 1, priceForecast: 23.85, confidenceIntervals: { ci80: { lower: 23.10, upper: 24.60 }, ci95: { lower: 22.50, upper: 25.20 } }, regimeProbabilities: { surplus: 0.25, balanced: 0.55, tightening: 0.20 } },
  { horizonWeeks: 4, priceForecast: 24.30, confidenceIntervals: { ci80: { lower: 22.80, upper: 25.80 }, ci95: { lower: 21.90, upper: 26.70 } }, regimeProbabilities: null },
  { horizonWeeks: 12, priceForecast: 25.50, confidenceIntervals: { ci80: { lower: 22.00, upper: 29.00 }, ci95: { lower: 20.50, upper: 30.50 } }, regimeProbabilities: null },
  { horizonWeeks: 26, priceForecast: 27.20, confidenceIntervals: { ci80: { lower: 21.00, upper: 33.40 }, ci95: { lower: 18.50, upper: 35.90 } }, regimeProbabilities: null },
]

const DEMO_SUPPLY_DEMAND = {
  weeklyCreation: 38500,
  creationTrend: 'stable' as const,
  weeklySurrender: 42000,
  surplusRunway: 18,
  activityBreakdown: [
    { activity: 'Residential HVAC', share: 0.35 },
    { activity: 'Commercial Lighting', share: 0.22 },
    { activity: 'Building Fabric', share: 0.18 },
    { activity: 'Pool Pumps', share: 0.12 },
    { activity: 'Other', share: 0.13 },
  ],
}

const DEMO_POLICY_EVENTS: PolicyEvent[] = [
  { title: 'ESS Rule Change 2026', date: '2026-06-30', impact: 'negative', summary: 'Proposed tightening of deemed savings for residential HVAC may reduce creation volumes by 15-20%.' },
  { title: 'IPART Target Review', date: '2026-09-01', impact: 'neutral', summary: 'Annual review of energy savings target. Current indication is status quo for FY2027.' },
  { title: 'Commercial Lighting Phase-Out', date: '2026-12-31', impact: 'negative', summary: 'Final sunset of commercial lighting activities. Removes ~22% of current ESC creation volume.' },
]

const DEMO_COMPLIANCE_CALENDAR = [
  { event: 'Q2 Surrender Deadline', date: '2026-06-30', daysAway: 86 },
  { event: 'Annual Compliance Report Due', date: '2026-09-30', daysAway: 178 },
  { event: 'Q4 Surrender Deadline', date: '2026-12-31', daysAway: 270 },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ClientIntelligencePageProps {
  broker?: string
}

const ClientIntelligencePage: FC<ClientIntelligencePageProps> = ({ broker }) => {
  const [branding, setBranding] = useState<WhiteLabelConfig>(DEFAULT_BRANDING)
  const [forecasts, setForecasts] = useState<ForecastHorizon[]>(DEMO_FORECASTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (broker && WHITE_LABEL_REGISTRY[broker]) {
      setBranding(WHITE_LABEL_REGISTRY[broker])
    }
  }, [broker])

  const fetchData = useCallback(async () => {
    try {
      const resp = await fetch('/api/v1/intelligence/forecast?instrument=ESC')
      if (resp.ok) {
        const json = await resp.json()
        if (json.data?.forecasts?.length > 0) {
          setForecasts(json.data.forecasts)
        }
      }
    } catch {
      // Use demo data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Derived values
  const currentPrice = forecasts[0]?.priceForecast ?? 23.50
  const fc12w = forecasts.find(f => f.horizonWeeks === 12)
  const forecast3m = fc12w?.priceForecast ?? currentPrice
  const priceDiff = forecast3m - currentPrice
  const direction = priceDiff > 0.50 ? 'up' : priceDiff < -0.50 ? 'down' : 'flat'
  const ci80 = fc12w?.confidenceIntervals.ci80
  const rangeStr = ci80
    ? `A$${ci80.lower?.toFixed(2)} — A$${ci80.upper?.toFixed(2)}`
    : '—'
  const ciWidth = ci80 ? (ci80.upper ?? forecast3m) - (ci80.lower ?? forecast3m) : 0
  const confidence = Math.max(0.3, Math.min(0.95, 1 - (ciWidth / forecast3m)))

  const directionIcon = direction === 'up' ? '\u2191' : direction === 'down' ? '\u2193' : '\u2194'
  const directionColour = direction === 'up' ? '#166534' : direction === 'down' ? '#991B1B' : '#374151'
  const directionBg = direction === 'up' ? '#DCFCE7' : direction === 'down' ? '#FEE2E2' : '#F3F4F6'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Header bar with broker branding */}
      <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: branding.primaryColour }}>
        <div className="flex items-center gap-3">
          <span
            className="px-2 py-0.5 rounded text-xs font-bold"
            style={{ backgroundColor: branding.accentColour, color: branding.primaryTextColour }}
          >
            {branding.terminalCode}
          </span>
          <span className="text-sm font-semibold" style={{ color: branding.primaryTextColour }}>
            {branding.businessName}
          </span>
        </div>
        <span className="text-xs" style={{ color: branding.primaryTextColour, opacity: 0.7 }}>
          ESC Market Intelligence
        </span>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800">ESC Market Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">
            Energy savings certificate market outlook, compliance calendar, and policy tracker
          </p>
        </div>

        {/* Hero: Price direction card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Price direction */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium mb-2">3-MONTH OUTLOOK</div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: directionBg, color: directionColour }}
              >
                {directionIcon}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800">
                  {direction === 'up' ? 'Bullish' : direction === 'down' ? 'Bearish' : 'Neutral'}
                </div>
                <div className="text-xs text-slate-500">
                  Range: {rangeStr}
                </div>
              </div>
            </div>
          </div>

          {/* Current price */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium mb-2">CURRENT ESC SPOT</div>
            <div className="text-2xl font-bold text-slate-800 font-mono">
              A${currentPrice.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {loading ? 'Loading...' : 'Updated today'}
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium mb-2">MODEL CONFIDENCE</div>
            <div className="text-2xl font-bold text-slate-800 font-mono">
              {(confidence * 100).toFixed(0)}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${confidence * 100}%`,
                  backgroundColor: confidence > 0.7 ? '#10B981' : confidence > 0.5 ? '#F59E0B' : '#EF4444',
                }}
              />
            </div>
          </div>
        </div>

        {/* Supply-Demand Balance */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">SUPPLY & DEMAND BALANCE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-slate-500">Weekly Creation</div>
              <div className="text-lg font-semibold font-mono text-slate-800">{DEMO_SUPPLY_DEMAND.weeklyCreation.toLocaleString()}</div>
              <div className="text-xs text-slate-500">ESCs/week ({DEMO_SUPPLY_DEMAND.creationTrend})</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Weekly Surrender</div>
              <div className="text-lg font-semibold font-mono text-slate-800">{DEMO_SUPPLY_DEMAND.weeklySurrender.toLocaleString()}</div>
              <div className="text-xs text-slate-500">ESCs/week</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Net Flow</div>
              <div className="text-lg font-semibold font-mono" style={{ color: DEMO_SUPPLY_DEMAND.weeklyCreation < DEMO_SUPPLY_DEMAND.weeklySurrender ? '#991B1B' : '#166534' }}>
                {(DEMO_SUPPLY_DEMAND.weeklyCreation - DEMO_SUPPLY_DEMAND.weeklySurrender).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">deficit = price support</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Surplus Runway</div>
              <div className="text-lg font-semibold font-mono text-slate-800">{DEMO_SUPPLY_DEMAND.surplusRunway}w</div>
              <div className="text-xs text-slate-500">at current surrender rate</div>
            </div>
          </div>

          {/* Activity breakdown bar */}
          <div className="text-xs text-slate-500 mb-1">Creation Activity Mix</div>
          <div className="flex h-6 rounded overflow-hidden">
            {DEMO_SUPPLY_DEMAND.activityBreakdown.map((a, i) => {
              const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#6B7280']
              return (
                <div
                  key={a.activity}
                  className="flex items-center justify-center text-white"
                  style={{
                    width: `${a.share * 100}%`,
                    backgroundColor: colors[i % colors.length],
                    fontSize: '9px',
                    fontWeight: 600,
                  }}
                  title={`${a.activity}: ${(a.share * 100).toFixed(0)}%`}
                >
                  {a.share > 0.15 ? `${a.activity} ${(a.share * 100).toFixed(0)}%` : ''}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Compliance Calendar */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">COMPLIANCE CALENDAR</h2>
            <div className="space-y-3">
              {DEMO_COMPLIANCE_CALENDAR.map(item => (
                <div key={item.event} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{item.event}</div>
                    <div className="text-xs text-slate-500">{item.date}</div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: item.daysAway < 30 ? '#FEE2E2' : item.daysAway < 90 ? '#FEF3C7' : '#DCFCE7',
                      color: item.daysAway < 30 ? '#991B1B' : item.daysAway < 90 ? '#92400E' : '#166534',
                    }}
                  >
                    {item.daysAway}d
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Tracker */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">POLICY TRACKER</h2>
            <div className="space-y-3">
              {DEMO_POLICY_EVENTS.map(event => (
                <div key={event.title} className="border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{event.title}</span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: event.impact === 'positive' ? '#DCFCE7' : event.impact === 'negative' ? '#FEE2E2' : '#F3F4F6',
                        color: event.impact === 'positive' ? '#166534' : event.impact === 'negative' ? '#991B1B' : '#374151',
                      }}
                    >
                      {event.impact}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{event.summary}</div>
                  <div className="text-xs text-slate-400 mt-1">Effective: {event.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast horizon table (simplified) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">PRICE FORECAST</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="text-left py-2 font-medium">Horizon</th>
                  <th className="text-right py-2 font-medium">Forecast</th>
                  <th className="text-right py-2 font-medium">80% Range</th>
                  <th className="text-right py-2 font-medium">Direction</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map(f => {
                  const diff = f.priceForecast - currentPrice
                  return (
                    <tr key={f.horizonWeeks} className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-700">
                        {f.horizonWeeks <= 4 ? `${f.horizonWeeks} week${f.horizonWeeks > 1 ? 's' : ''}` : `${Math.round(f.horizonWeeks / 4.33)} months`}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-800">A${f.priceForecast.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono text-slate-600 text-xs">
                        A${f.confidenceIntervals.ci80.lower?.toFixed(2)} — A${f.confidenceIntervals.ci80.upper?.toFixed(2)}
                      </td>
                      <td className="py-2 text-right">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: diff > 0.50 ? '#DCFCE7' : diff < -0.50 ? '#FEE2E2' : '#F3F4F6',
                            color: diff > 0.50 ? '#166534' : diff < -0.50 ? '#991B1B' : '#374151',
                          }}
                        >
                          {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact CTA */}
        <div
          className="rounded-lg p-6 text-center"
          style={{ backgroundColor: branding.primaryColour }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: branding.primaryTextColour }}>
            Need procurement assistance?
          </h3>
          <p className="text-sm mb-4" style={{ color: branding.primaryTextColour, opacity: 0.8 }}>
            Our trading desk can help you source ESCs at competitive prices with T+2 settlement.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href={`mailto:${branding.contactEmail}`}
              className="px-4 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: branding.accentColour, color: branding.primaryTextColour }}
            >
              {branding.contactEmail}
            </a>
            {branding.contactPhone && (
              <a
                href={`tel:${branding.contactPhone.replace(/\s/g, '')}`}
                className="px-4 py-2 rounded text-sm font-semibold border transition-opacity hover:opacity-90"
                style={{ borderColor: branding.primaryTextColour, color: branding.primaryTextColour }}
              >
                {branding.contactPhone}
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">{branding.footerText}</p>
          {branding.showAttribution && (
            <p className="text-xs text-slate-400 mt-1">Powered by WREI Platform</p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            This information is for general guidance only and does not constitute financial advice.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClientIntelligencePage
