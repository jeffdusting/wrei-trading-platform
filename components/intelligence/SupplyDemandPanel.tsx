'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'

interface MetricsData {
  cumulativeSurplus: number | null
  creationVelocity4w: number | null
  creationVelocity12w: number | null
  impliedAnnualDemand: number | null
  surplusRunwayYears: number | null
  daysToSurrender: number | null
  priceToPenaltyRatio: number | null
  penaltyRate: number | null
}

// Demo metrics when DB not available
const DEMO_METRICS: MetricsData = {
  cumulativeSurplus: 8_250_000,
  creationVelocity4w: 145_000,
  creationVelocity12w: 158_000,
  impliedAnnualDemand: 7_540_000,
  surplusRunwayYears: 3.2,
  daysToSurrender: 361,
  priceToPenaltyRatio: 0.65,
  penaltyRate: 36.20,
}

// Demo historical surplus data (quarterly)
const DEMO_SURPLUS_HISTORY = [
  { period: 'Q1 2024', surplus: 9_800_000, type: 'historical' },
  { period: 'Q2 2024', surplus: 9_400_000, type: 'historical' },
  { period: 'Q3 2024', surplus: 8_900_000, type: 'historical' },
  { period: 'Q4 2024', surplus: 8_500_000, type: 'historical' },
  { period: 'Q1 2025', surplus: 8_250_000, type: 'historical' },
  { period: 'Q2 2025', surplus: 7_900_000, type: 'forecast' },
  { period: 'Q3 2025', surplus: 7_500_000, type: 'forecast' },
  { period: 'Q4 2025', surplus: 7_100_000, type: 'forecast' },
]

// Demo activity mix
const DEMO_ACTIVITY_MIX = [
  { activity: 'Commercial Lighting', pct: 28, color: '#3B82F6' },
  { activity: 'HVAC Upgrades', pct: 22, color: '#10B981' },
  { activity: 'Power Factor Correction', pct: 18, color: '#F59E0B' },
  { activity: 'Building Envelope', pct: 15, color: '#8B5CF6' },
  { activity: 'Industrial Process', pct: 12, color: '#EC4899' },
  { activity: 'Other', pct: 5, color: '#6B7280' },
]

const SupplyDemandPanel: FC = () => {
  const tokens = useDesignTokens('retail')
  const [metrics, setMetrics] = useState<MetricsData>(DEMO_METRICS)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = useCallback(async () => {
    try {
      const resp = await fetch('/api/v1/intelligence/metrics?instrument=ESC')
      if (resp.ok) {
        const json = await resp.json()
        if (json.data?.metrics) {
          setMetrics({ ...DEMO_METRICS, ...json.data.metrics })
        }
      }
    } catch {
      // Use demo data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  // Surplus bar chart
  const maxSurplus = Math.max(...DEMO_SURPLUS_HISTORY.map(d => d.surplus))
  const barChartH = 120

  // Creation velocity comparison
  const vel4w = metrics.creationVelocity4w ?? 0
  const vel12w = metrics.creationVelocity12w ?? 0
  const velRatio = vel12w > 0 ? vel4w / vel12w : 1
  const velTrend = velRatio > 1.05 ? 'accelerating' : velRatio < 0.95 ? 'decelerating' : 'stable'
  const velTrendColor = velTrend === 'accelerating' ? tokens.colors.market.bullish
    : velTrend === 'decelerating' ? tokens.colors.market.bearish
    : tokens.colors.market.neutral

  // Surrender deadline
  const surrenderDate = new Date()
  const dts = metrics.daysToSurrender ?? 365
  surrenderDate.setDate(surrenderDate.getDate() + dts)

  return (
    <div className="bg-white rounded border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">
        SUPPLY & DEMAND {loading && <span className="text-slate-400 font-normal">(loading...)</span>}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Surplus bar chart */}
        <div>
          <div className="bloomberg-small-text text-slate-500 font-medium mb-2">CUMULATIVE SURPLUS (ESCs)</div>
          <div className="relative" style={{ height: `${barChartH + 30}px` }}>
            <div className="flex items-end justify-between gap-1" style={{ height: `${barChartH}px` }}>
              {DEMO_SURPLUS_HISTORY.map((d) => {
                const h = (d.surplus / maxSurplus) * barChartH
                const isForecast = d.type === 'forecast'
                return (
                  <div key={d.period} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${h}px`,
                        backgroundColor: isForecast ? '#93C5FD' : '#3B82F6',
                        opacity: isForecast ? 0.6 : 1,
                        border: isForecast ? '1px dashed #3B82F6' : 'none',
                      }}
                      title={`${d.period}: ${(d.surplus / 1_000_000).toFixed(1)}M`}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              {DEMO_SURPLUS_HISTORY.map(d => (
                <div key={d.period} className="flex-1 text-center" style={{ fontSize: '8px', color: '#94A3B8' }}>
                  {d.period.replace('20', "'")}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1 bloomberg-small-text text-slate-500">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-blue-500" /> Historical</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-blue-300 border border-dashed border-blue-500" /> Forecast</span>
          </div>
        </div>

        {/* Right: Key metrics */}
        <div className="space-y-3">
          {/* Creation velocity */}
          <div className="border border-slate-200 rounded p-2">
            <div className="bloomberg-small-text text-slate-500 font-medium mb-1">CREATION VELOCITY</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="bloomberg-data text-sm text-slate-800">
                  {vel4w > 0 ? `${(vel4w / 1000).toFixed(0)}K/wk` : 'N/A'} <span className="text-slate-400">(4w avg)</span>
                </div>
                <div className="bloomberg-data bloomberg-small-text text-slate-500">
                  {vel12w > 0 ? `${(vel12w / 1000).toFixed(0)}K/wk` : 'N/A'} <span className="text-slate-400">(12w avg)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="bloomberg-small-text font-medium capitalize" style={{ color: velTrendColor }}>
                  {velTrend}
                </span>
                <div className="bloomberg-small-text text-slate-400">
                  {((velRatio - 1) * 100).toFixed(1)}% vs trend
                </div>
              </div>
            </div>
            {/* Mini velocity bar */}
            <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, velRatio * 50)}%`,
                  backgroundColor: velTrendColor,
                }}
              />
            </div>
          </div>

          {/* Surplus runway */}
          <div className="border border-slate-200 rounded p-2">
            <div className="bloomberg-small-text text-slate-500 font-medium mb-1">SURPLUS RUNWAY</div>
            <div className="flex items-center justify-between">
              <span className="bloomberg-data text-sm text-slate-800">
                ~{metrics.surplusRunwayYears?.toFixed(1) ?? 'N/A'} years
              </span>
              <span
                className="bloomberg-small-text px-1.5 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: (metrics.surplusRunwayYears ?? 5) < 2 ? '#FEE2E2' : (metrics.surplusRunwayYears ?? 5) < 3 ? '#FEF3C7' : '#DCFCE7',
                  color: (metrics.surplusRunwayYears ?? 5) < 2 ? '#991B1B' : (metrics.surplusRunwayYears ?? 5) < 3 ? '#92400E' : '#166534',
                }}
              >
                {(metrics.surplusRunwayYears ?? 5) < 2 ? 'TIGHT' : (metrics.surplusRunwayYears ?? 5) < 3 ? 'WATCH' : 'ADEQUATE'}
              </span>
            </div>
            <div className="bloomberg-small-text text-slate-400 mt-0.5">
              At current rates: {metrics.cumulativeSurplus ? `${(metrics.cumulativeSurplus / 1_000_000).toFixed(1)}M surplus` : 'N/A'}
            </div>
          </div>

          {/* Demand timeline */}
          <div className="border border-slate-200 rounded p-2">
            <div className="bloomberg-small-text text-slate-500 font-medium mb-1">NEXT SURRENDER DEADLINE</div>
            <div className="flex items-center justify-between">
              <span className="bloomberg-data text-sm text-slate-800">
                {surrenderDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="bloomberg-data text-sm font-medium" style={{
                color: dts < 30 ? tokens.colors.market.bearish : dts < 90 ? tokens.colors.accent.warning : tokens.colors.market.neutral,
              }}>
                {dts}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity mix */}
      <div className="mt-4">
        <div className="bloomberg-small-text text-slate-500 font-medium mb-2">CREATION ACTIVITY MIX</div>
        <div className="flex items-center gap-1 h-6 rounded overflow-hidden">
          {DEMO_ACTIVITY_MIX.map(a => (
            <div
              key={a.activity}
              className="h-full flex items-center justify-center text-white"
              style={{
                width: `${a.pct}%`,
                backgroundColor: a.color,
                fontSize: '8px',
                fontWeight: 600,
              }}
              title={`${a.activity}: ${a.pct}%`}
            >
              {a.pct >= 12 ? `${a.pct}%` : ''}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
          {DEMO_ACTIVITY_MIX.map(a => (
            <span key={a.activity} className="flex items-center gap-1 bloomberg-small-text text-slate-500">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: a.color }} />
              {a.activity}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SupplyDemandPanel
