'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'

interface HorizonMetrics {
  horizonWeeks: number
  mape: number | null
  directionalAccuracy: number | null
  decisionValue: number | null
  coverage80: number | null
  coverage95: number | null
  benchmarks: {
    mapeNaive: number | null
    mapeSma: number | null
  }
}

interface BacktestData {
  modelVersion?: string
  testPeriod?: { start: string; end: string }
  results?: HorizonMetrics[]
  // Full comparative (from results.json)
  bayesian?: Record<string, unknown>
  ml?: Record<string, unknown>
  ensemble?: Record<string, unknown>
  ml_regime?: Record<string, unknown>
}

// Demo data matching P10-C backtest output
const DEMO_HORIZON_RESULTS: HorizonMetrics[] = [
  { horizonWeeks: 4, mape: 0.0378, directionalAccuracy: 0.62, decisionValue: 1401000, coverage80: 0.75, coverage95: 0.92, benchmarks: { mapeNaive: 0.0203, mapeSma: 0.0278 } },
  { horizonWeeks: 12, mape: 0.0650, directionalAccuracy: 0.58, decisionValue: 850000, coverage80: 0.70, coverage95: 0.88, benchmarks: { mapeNaive: 0.0450, mapeSma: 0.0520 } },
  { horizonWeeks: 26, mape: 0.0920, directionalAccuracy: 0.55, decisionValue: 420000, coverage80: 0.65, coverage95: 0.85, benchmarks: { mapeNaive: 0.0680, mapeSma: 0.0750 } },
]

const DEMO_MODEL_COMPARISON = [
  { model: 'Bayesian', mape4w: 3.78, actionAcc: null, weight: 0.15 },
  { model: 'ML (XGBoost)', mape4w: 3.65, actionAcc: 62.0, weight: 0.85 },
  { model: 'Ensemble', mape4w: 3.59, actionAcc: null, weight: null },
  { model: 'Naive (RW)', mape4w: 2.03, actionAcc: null, weight: null },
  { model: 'SMA-4', mape4w: 2.78, actionAcc: null, weight: null },
]

const DEMO_REGIME_PERF = [
  { regime: 'Stable', mape: 2.98, actionAcc: 55.6, n: 27 },
  { regime: 'Transition', mape: 3.67, actionAcc: 39.6, n: 48 },
  { regime: 'Policy Window', mape: 3.74, actionAcc: 60.9, n: 161 },
]

const DEMO_FEATURE_IMPORTANCE = [
  { feature: 'broker_sentiment', importance: 0.1003 },
  { feature: 'activity_cl_pct', importance: 0.0844 },
  { feature: 'policy_supply_impact_pct', importance: 0.0791 },
  { feature: 'penalty_rate', importance: 0.0741 },
  { feature: 'surplus_runway_years', importance: 0.0616 },
  { feature: 'creation_velocity_trend', importance: 0.0580 },
  { feature: 'price_to_penalty', importance: 0.0521 },
  { feature: 'supply_concern_level', importance: 0.0490 },
]

const BacktestReport: FC = () => {
  const tokens = useDesignTokens('retail')
  const [results, setResults] = useState<HorizonMetrics[]>(DEMO_HORIZON_RESULTS)
  const [modelVersion, setModelVersion] = useState('1.0.0')
  const [loading, setLoading] = useState(true)

  const fetchBacktest = useCallback(async () => {
    try {
      const resp = await fetch('/api/v1/intelligence/backtest')
      if (resp.ok) {
        const json = await resp.json()
        const data: BacktestData = json.data
        if (data.results && data.results.length > 0) {
          setResults(data.results)
          if (data.modelVersion) setModelVersion(data.modelVersion)
        }
      }
    } catch {
      // Use demo data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBacktest() }, [fetchBacktest])

  const fmtPct = (v: number | null) => v !== null ? `${(v * 100).toFixed(2)}%` : '—'
  const fmtMoney = (v: number | null) => v !== null ? `$${(v / 1000).toFixed(0)}K` : '—'

  const maxImportance = Math.max(...DEMO_FEATURE_IMPORTANCE.map(f => f.importance))

  return (
    <div className="bg-white rounded border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">
          MODEL PERFORMANCE {loading && <span className="text-slate-400 font-normal">(loading...)</span>}
        </h3>
        <span className="bloomberg-small-text text-slate-500">Model v{modelVersion}</span>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {results.slice(0, 1).map(r => (
          <div key="cards" className="contents">
            <div className="border border-slate-200 rounded p-2 text-center">
              <div className="bloomberg-small-text text-slate-500">4w MAPE</div>
              <div className="text-lg font-bold bloomberg-data" style={{
                color: (r.mape ?? 1) < 0.05 ? tokens.colors.market.bullish : (r.mape ?? 1) < 0.10 ? tokens.colors.accent.warning : tokens.colors.market.bearish,
              }}>
                {fmtPct(r.mape)}
              </div>
              <div className="bloomberg-small-text text-slate-400">Target &lt;10%</div>
            </div>
            <div className="border border-slate-200 rounded p-2 text-center">
              <div className="bloomberg-small-text text-slate-500">Direction Acc.</div>
              <div className="text-lg font-bold bloomberg-data" style={{
                color: (r.directionalAccuracy ?? 0) > 0.55 ? tokens.colors.market.bullish : tokens.colors.accent.warning,
              }}>
                {fmtPct(r.directionalAccuracy)}
              </div>
              <div className="bloomberg-small-text text-slate-400">Target &gt;50%</div>
            </div>
            <div className="border border-slate-200 rounded p-2 text-center">
              <div className="bloomberg-small-text text-slate-500">Decision Value</div>
              <div className="text-lg font-bold bloomberg-data" style={{
                color: (r.decisionValue ?? 0) > 0 ? tokens.colors.market.bullish : tokens.colors.market.bearish,
              }}>
                {fmtMoney(r.decisionValue)}
              </div>
              <div className="bloomberg-small-text text-slate-400">Target &gt;$0</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model comparison table */}
        <div>
          <div className="bloomberg-small-text text-slate-500 font-medium mb-2">MODEL COMPARISON (4W MAPE)</div>
          <table className="w-full bloomberg-small-text">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-1 text-slate-500 font-medium">Model</th>
                <th className="text-right py-1 text-slate-500 font-medium">MAPE</th>
                <th className="text-right py-1 text-slate-500 font-medium">Action Acc</th>
                <th className="text-right py-1 text-slate-500 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_MODEL_COMPARISON.map(m => (
                <tr
                  key={m.model}
                  className={`border-b border-slate-100 ${m.model === 'Ensemble' ? 'bg-blue-50' : ''}`}
                >
                  <td className="py-1 font-medium text-slate-700">
                    {m.model}
                    {m.model === 'Ensemble' && <span className="ml-1 text-[9px] text-blue-600">BEST</span>}
                  </td>
                  <td className="py-1 text-right bloomberg-data text-slate-800">{m.mape4w.toFixed(2)}%</td>
                  <td className="py-1 text-right bloomberg-data text-slate-600">
                    {m.actionAcc ? `${m.actionAcc.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-1 text-right bloomberg-data text-slate-600">
                    {m.weight !== null ? `${(m.weight * 100).toFixed(0)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Regime-specific performance */}
        <div>
          <div className="bloomberg-small-text text-slate-500 font-medium mb-2">REGIME-SPECIFIC (4W)</div>
          <table className="w-full bloomberg-small-text">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-1 text-slate-500 font-medium">Regime</th>
                <th className="text-right py-1 text-slate-500 font-medium">MAPE</th>
                <th className="text-right py-1 text-slate-500 font-medium">Action Acc</th>
                <th className="text-right py-1 text-slate-500 font-medium">N</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_REGIME_PERF.map(r => (
                <tr key={r.regime} className="border-b border-slate-100">
                  <td className="py-1 font-medium text-slate-700">{r.regime}</td>
                  <td className="py-1 text-right bloomberg-data text-slate-800">{r.mape.toFixed(2)}%</td>
                  <td className="py-1 text-right bloomberg-data text-slate-600">{r.actionAcc.toFixed(1)}%</td>
                  <td className="py-1 text-right bloomberg-data text-slate-400">{r.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Horizon performance table */}
      <div className="mt-4">
        <div className="bloomberg-small-text text-slate-500 font-medium mb-2">PERFORMANCE BY HORIZON</div>
        <table className="w-full bloomberg-small-text">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1 text-slate-500 font-medium">Horizon</th>
              <th className="text-right py-1 text-slate-500 font-medium">MAPE</th>
              <th className="text-right py-1 text-slate-500 font-medium">Dir. Acc.</th>
              <th className="text-right py-1 text-slate-500 font-medium">Dec. Value</th>
              <th className="text-right py-1 text-slate-500 font-medium">Cov. 80%</th>
              <th className="text-right py-1 text-slate-500 font-medium">Cov. 95%</th>
              <th className="text-right py-1 text-slate-500 font-medium">vs Naive</th>
              <th className="text-right py-1 text-slate-500 font-medium">vs SMA-4</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.horizonWeeks} className="border-b border-slate-100">
                <td className="py-1 font-medium text-slate-700">{r.horizonWeeks}w</td>
                <td className="py-1 text-right bloomberg-data text-slate-800">{fmtPct(r.mape)}</td>
                <td className="py-1 text-right bloomberg-data text-slate-800">{fmtPct(r.directionalAccuracy)}</td>
                <td className="py-1 text-right bloomberg-data text-slate-800">{fmtMoney(r.decisionValue)}</td>
                <td className="py-1 text-right bloomberg-data text-slate-600">{fmtPct(r.coverage80)}</td>
                <td className="py-1 text-right bloomberg-data text-slate-600">{fmtPct(r.coverage95)}</td>
                <td className="py-1 text-right bloomberg-data text-slate-600">{fmtPct(r.benchmarks.mapeNaive)}</td>
                <td className="py-1 text-right bloomberg-data text-slate-600">{fmtPct(r.benchmarks.mapeSma)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feature importance */}
      <div className="mt-4">
        <div className="bloomberg-small-text text-slate-500 font-medium mb-2">ML FEATURE IMPORTANCE (ACTION MODEL)</div>
        <div className="space-y-1">
          {DEMO_FEATURE_IMPORTANCE.map((f, i) => (
            <div key={f.feature} className="flex items-center gap-2">
              <span className="bloomberg-small-text text-slate-400 w-4 text-right">{i + 1}</span>
              <span className="bloomberg-small-text text-slate-700 w-40 truncate" title={f.feature}>
                {f.feature.replace(/_/g, ' ')}
              </span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(f.importance / maxImportance) * 100}%`,
                    backgroundColor: i < 3 ? tokens.colors.accent.info : '#94A3B8',
                  }}
                />
              </div>
              <span className="bloomberg-data bloomberg-small-text text-slate-500 w-12 text-right">
                {(f.importance * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BacktestReport
