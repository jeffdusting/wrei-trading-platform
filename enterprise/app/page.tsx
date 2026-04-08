'use client'

import { FC, useState, useEffect } from 'react'
import Link from 'next/link'

// Demo data — shown when enterprise DB is not connected
const DEMO_PIPELINE = {
  totalProjects: 12,
  totalValue: 847500,
  stages: { diagnostic: 3, validation: 4, implementation: 2, mv_audit: 1, registration: 1, sale: 1 },
}

const DEMO_COMPLIANCE = {
  totalEntities: 8,
  totalShortfall: 4250,
  nextDeadline: '2026-06-30',
  daysRemaining: 82,
}

const DEMO_MARKET = {
  escSpot: 37.85,
  forecastDirection: 'up' as const,
  forecastDelta: '+2.4%',
  regime: 'balanced',
}

const DEMO_ACTIVITY = [
  { name: 'Downer Rail — HVAC Upgrade NSW', method: 'HEER', status: 'complete', date: '2026-04-08' },
  { name: 'TrainLink Fleet — Motor Replacement', method: 'MBM', status: 'complete', date: '2026-04-07' },
  { name: 'Downer Mining — Refrigeration QLD', method: 'MBM', status: 'draft', date: '2026-04-06' },
  { name: 'Downer Utilities — Hot Water VIC', method: 'IHEAB', status: 'complete', date: '2026-04-05' },
  { name: 'Sydney Trains — Building Shell', method: 'PIAMV', status: 'draft', date: '2026-04-04' },
]

interface DashboardData {
  pipeline: typeof DEMO_PIPELINE
  compliance: typeof DEMO_COMPLIANCE
  market: typeof DEMO_MARKET
  activity: typeof DEMO_ACTIVITY
  isDemo: boolean
}

const EnterpriseDashboard: FC = () => {
  const [data, setData] = useState<DashboardData>({
    pipeline: DEMO_PIPELINE,
    compliance: DEMO_COMPLIANCE,
    market: DEMO_MARKET,
    activity: DEMO_ACTIVITY,
    isDemo: true,
  })

  useEffect(() => {
    // Attempt to fetch live data — fall back to demo
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/intelligence/forecast?instrument=ESC')
        if (res.ok) {
          const forecastData = await res.json()
          if (forecastData.forecasts?.length > 0) {
            const f4w = forecastData.forecasts.find((f: { horizon_weeks: number }) => f.horizon_weeks === 4)
            if (f4w) {
              setData(prev => ({
                ...prev,
                market: {
                  ...prev.market,
                  escSpot: Number(f4w.price_forecast),
                },
                isDemo: false,
              }))
            }
          }
        }
      } catch {
        // Keep demo data
      }
    }
    fetchDashboard()
  }, [])

  const fmtCurrency = (n: number) => `A$${n.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="bloomberg-page-heading text-slate-900">Enterprise Dashboard</h1>
        <p className="bloomberg-body-text text-slate-500 mt-1">
          Downer Environmental Certificate Intelligence Platform
          {data.isDemo && (
            <span className="ml-2 text-amber-600 bloomberg-small-text bg-amber-50 px-1.5 py-0.5 rounded">
              DEMO DATA
            </span>
          )}
        </p>
      </div>

      {/* 2×2 Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Pipeline Summary */}
        <Link href="/pipeline" className="bg-white border border-slate-200 rounded p-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">PIP</span>
            <span className="bloomberg-card-title text-slate-900">Pipeline Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <div className="bloomberg-section-label text-slate-400">ACTIVE PROJECTS</div>
              <div className="bloomberg-metric-value text-slate-900">{data.pipeline.totalProjects}</div>
            </div>
            <div>
              <div className="bloomberg-section-label text-slate-400">EST. VALUE</div>
              <div className="bloomberg-metric-value text-slate-900">{fmtCurrency(data.pipeline.totalValue)}</div>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {Object.entries(data.pipeline.stages).map(([stage, count]) => (
              <div key={stage} className="flex-1 text-center">
                <div className="bloomberg-data text-[9px] text-slate-400 uppercase">{stage.slice(0, 3)}</div>
                <div className="bloomberg-data bloomberg-small-text text-slate-700">{count}</div>
              </div>
            ))}
          </div>
        </Link>

        {/* Compliance Summary */}
        <Link href="/portfolio" className="bg-white border border-slate-200 rounded p-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">CMP</span>
            <span className="bloomberg-card-title text-slate-900">Compliance Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <div className="bloomberg-section-label text-slate-400">ENTITIES</div>
              <div className="bloomberg-metric-value text-slate-900">{data.compliance.totalEntities}</div>
            </div>
            <div>
              <div className="bloomberg-section-label text-slate-400">SHORTFALL</div>
              <div className="bloomberg-metric-value text-red-600">
                {data.compliance.totalShortfall.toLocaleString()} ESC
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: data.compliance.daysRemaining > 90 ? '#00C896' : data.compliance.daysRemaining > 30 ? '#FFB800' : '#FF4757' }}
            />
            <span className="bloomberg-small-text text-slate-500">
              Next deadline: {data.compliance.nextDeadline} ({data.compliance.daysRemaining} days)
            </span>
          </div>
        </Link>

        {/* Market Snapshot */}
        <Link href="/intelligence" className="bg-white border border-slate-200 rounded p-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">MKT</span>
            <span className="bloomberg-card-title text-slate-900">Market Snapshot</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <div className="bloomberg-section-label text-slate-400">ESC SPOT</div>
              <div className="bloomberg-metric-value text-slate-900">
                A${data.market.escSpot.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="bloomberg-section-label text-slate-400">4W FORECAST</div>
              <div className={`bloomberg-metric-value ${data.market.forecastDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {data.market.forecastDelta}
              </div>
            </div>
          </div>
          <div className="mt-2">
            <span className="bloomberg-small-text text-slate-500">
              Regime: <span className="bloomberg-data">{data.market.regime.toUpperCase()}</span>
            </span>
          </div>
        </Link>

        {/* Recent Activity */}
        <Link href="/diagnostic" className="bg-white border border-slate-200 rounded p-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">ORG</span>
            <span className="bloomberg-card-title text-slate-900">Recent Assessments</span>
          </div>
          <div className="space-y-1.5">
            {data.activity.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="bloomberg-small-text text-slate-700 truncate flex-1 mr-2">
                  {item.name}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="bloomberg-data text-[9px] bg-slate-100 px-1 rounded">{item.method}</span>
                  <span className={`bloomberg-data text-[9px] px-1 rounded ${
                    item.status === 'complete' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Link>
      </div>
    </div>
  )
}

export default EnterpriseDashboard
