'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'

interface ForecastHorizon {
  horizonWeeks: number
  priceForecast: number
  confidenceIntervals: {
    ci80: { lower: number | null; upper: number | null }
    ci95: { lower: number | null; upper: number | null }
  }
  regimeProbabilities: Record<string, number> | null
  metadata: Record<string, unknown> | null
}

interface ForecastData {
  instrument: string
  forecasts: ForecastHorizon[]
  modelVersion?: string
  generatedAt?: string
}

// Demo data when API/DB not available
const DEMO_FORECASTS: ForecastHorizon[] = [
  {
    horizonWeeks: 1,
    priceForecast: 23.85,
    confidenceIntervals: { ci80: { lower: 23.10, upper: 24.60 }, ci95: { lower: 22.50, upper: 25.20 } },
    regimeProbabilities: { surplus: 0.25, balanced: 0.55, tightening: 0.20 },
    metadata: { regime: 'balanced', demand_pressure: 0.42 },
  },
  {
    horizonWeeks: 4,
    priceForecast: 24.30,
    confidenceIntervals: { ci80: { lower: 22.80, upper: 25.80 }, ci95: { lower: 21.90, upper: 26.70 } },
    regimeProbabilities: { surplus: 0.25, balanced: 0.55, tightening: 0.20 },
    metadata: null,
  },
  {
    horizonWeeks: 12,
    priceForecast: 25.50,
    confidenceIntervals: { ci80: { lower: 22.00, upper: 29.00 }, ci95: { lower: 20.50, upper: 30.50 } },
    regimeProbabilities: { surplus: 0.20, balanced: 0.45, tightening: 0.35 },
    metadata: null,
  },
  {
    horizonWeeks: 26,
    priceForecast: 27.20,
    confidenceIntervals: { ci80: { lower: 21.00, upper: 33.40 }, ci95: { lower: 18.50, upper: 35.90 } },
    regimeProbabilities: { surplus: 0.15, balanced: 0.40, tightening: 0.45 },
    metadata: null,
  },
]

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  BUY:  { bg: '#DCFCE7', text: '#166534' },
  HOLD: { bg: '#F3F4F6', text: '#374151' },
  SELL: { bg: '#FEE2E2', text: '#991B1B' },
}

const ForecastPanel: FC = () => {
  const tokens = useDesignTokens('retail')
  const [forecasts, setForecasts] = useState<ForecastHorizon[]>(DEMO_FORECASTS)
  const [modelVersion, setModelVersion] = useState('1.0.0 (demo)')
  const [generatedAt, setGeneratedAt] = useState(new Date().toISOString())
  const [loading, setLoading] = useState(true)

  const fetchForecasts = useCallback(async () => {
    try {
      const resp = await fetch('/api/v1/intelligence/forecast?instrument=ESC')
      if (resp.ok) {
        const json = await resp.json()
        const data: ForecastData = json.data
        if (data.forecasts && data.forecasts.length > 0) {
          setForecasts(data.forecasts)
          if (data.modelVersion) setModelVersion(data.modelVersion)
          if (data.generatedAt) setGeneratedAt(data.generatedAt)
        }
      }
    } catch {
      // Use demo data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchForecasts() }, [fetchForecasts])

  // Derive regime from first forecast that has it
  const regimeProbs = forecasts.find(f => f.regimeProbabilities)?.regimeProbabilities
  const currentRegime = regimeProbs
    ? Object.entries(regimeProbs).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : 'balanced'

  // Derive action from price trajectory
  const fc4w = forecasts.find(f => f.horizonWeeks === 4)
  const fc1w = forecasts.find(f => f.horizonWeeks === 1)
  const currentPrice = fc1w?.priceForecast ?? 23.50
  const forecast4w = fc4w?.priceForecast ?? currentPrice
  const pctChange = ((forecast4w - currentPrice) / currentPrice) * 100
  const action = pctChange > 2 ? 'BUY' : pctChange < -2 ? 'SELL' : 'HOLD'
  const actionConfidence = Math.min(0.95, 0.5 + Math.abs(pctChange) * 0.05)
  const valuePerCert = Math.abs(forecast4w - currentPrice)
  const actionStyle = ACTION_COLORS[action] ?? ACTION_COLORS.HOLD

  // Fan chart dimensions
  const chartW = 520
  const chartH = 160
  const padding = { top: 10, bottom: 25, left: 50, right: 10 }
  const plotW = chartW - padding.left - padding.right
  const plotH = chartH - padding.top - padding.bottom

  // Build data points for the fan chart
  const horizonData = [0, ...forecasts.map(f => f.horizonWeeks)]
  const priceData = [currentPrice, ...forecasts.map(f => f.priceForecast)]
  const ci95Lower = [currentPrice, ...forecasts.map(f => f.confidenceIntervals.ci95.lower ?? f.priceForecast)]
  const ci95Upper = [currentPrice, ...forecasts.map(f => f.confidenceIntervals.ci95.upper ?? f.priceForecast)]
  const ci80Lower = [currentPrice, ...forecasts.map(f => f.confidenceIntervals.ci80.lower ?? f.priceForecast)]
  const ci80Upper = [currentPrice, ...forecasts.map(f => f.confidenceIntervals.ci80.upper ?? f.priceForecast)]

  const maxH = Math.max(...horizonData)
  const allPrices = [...ci95Lower, ...ci95Upper]
  const minP = Math.min(...allPrices) * 0.97
  const maxP = Math.max(...allPrices) * 1.03
  const xScale = (w: number) => padding.left + (w / maxH) * plotW
  const yScale = (p: number) => padding.top + plotH - ((p - minP) / (maxP - minP)) * plotH

  const buildPath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(horizonData[i]).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ')

  const ci95Area = buildPath(ci95Upper) + ' ' +
    [...ci95Lower].reverse().map((v, i) => `L${xScale(horizonData[horizonData.length - 1 - i]).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ') + ' Z'

  const ci80Area = buildPath(ci80Upper) + ' ' +
    [...ci80Lower].reverse().map((v, i) => `L${xScale(horizonData[horizonData.length - 1 - i]).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ') + ' Z'

  const priceLine = buildPath(priceData)

  return (
    <div className="bg-white rounded border border-slate-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">ESC PRICE FORECAST</h3>
          <span className="bloomberg-small-text text-slate-500">
            Model v{modelVersion} | {loading ? 'Loading...' : new Date(generatedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Action badge */}
          <div
            className="px-3 py-1 rounded text-xs font-bold"
            style={{ backgroundColor: actionStyle.bg, color: actionStyle.text }}
          >
            {action} ({(actionConfidence * 100).toFixed(0)}%)
          </div>
          {/* Value indicator */}
          <div className="text-right">
            <div className="bloomberg-small-text text-slate-500">Est. Value</div>
            <div className="bloomberg-data text-sm font-medium" style={{ color: pctChange >= 0 ? tokens.colors.market.bullish : tokens.colors.market.bearish }}>
              {pctChange >= 0 ? '+' : '-'}${valuePerCert.toFixed(2)}/cert
            </div>
          </div>
        </div>
      </div>

      {/* Fan Chart */}
      <div className="mb-4">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: '180px' }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => {
            const y = padding.top + plotH * (1 - frac)
            const price = minP + (maxP - minP) * frac
            return (
              <g key={frac}>
                <line x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="#E2E8F0" strokeWidth="0.5" />
                <text x={padding.left - 4} y={y + 3} textAnchor="end" className="fill-slate-400" style={{ fontSize: '9px', fontFamily: tokens.typography.families.financial }}>
                  ${price.toFixed(2)}
                </text>
              </g>
            )
          })}
          {/* X axis labels */}
          {horizonData.map((w, i) => (
            <text key={w} x={xScale(w)} y={chartH - 4} textAnchor="middle" className="fill-slate-400" style={{ fontSize: '9px' }}>
              {i === 0 ? 'Now' : `${w}w`}
            </text>
          ))}
          {/* 95% CI band */}
          <path d={ci95Area} fill="#DBEAFE" opacity={0.5} />
          {/* 80% CI band */}
          <path d={ci80Area} fill="#93C5FD" opacity={0.5} />
          {/* Price line */}
          <path d={priceLine} fill="none" stroke="#2563EB" strokeWidth="2" />
          {/* Data points */}
          {priceData.map((p, i) => (
            <circle key={i} cx={xScale(horizonData[i])} cy={yScale(p)} r="3" fill="#2563EB" />
          ))}
        </svg>
        <div className="flex items-center justify-center gap-4 mt-1 bloomberg-small-text text-slate-500">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: '#93C5FD' }} /> 80% CI</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm" style={{ backgroundColor: '#DBEAFE' }} /> 95% CI</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 rounded-sm bg-blue-600" /> Forecast</span>
        </div>
      </div>

      {/* Horizon table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full bloomberg-small-text">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1 text-slate-500 font-medium">Horizon</th>
              <th className="text-right py-1 text-slate-500 font-medium">Forecast</th>
              <th className="text-right py-1 text-slate-500 font-medium">80% CI</th>
              <th className="text-right py-1 text-slate-500 font-medium">95% CI</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map(f => (
              <tr key={f.horizonWeeks} className="border-b border-slate-100">
                <td className="py-1 font-medium text-slate-700">{f.horizonWeeks}w</td>
                <td className="py-1 text-right bloomberg-data text-slate-800">${f.priceForecast.toFixed(2)}</td>
                <td className="py-1 text-right bloomberg-data text-slate-600">
                  ${f.confidenceIntervals.ci80.lower?.toFixed(2)} — ${f.confidenceIntervals.ci80.upper?.toFixed(2)}
                </td>
                <td className="py-1 text-right bloomberg-data text-slate-600">
                  ${f.confidenceIntervals.ci95.lower?.toFixed(2)} — ${f.confidenceIntervals.ci95.upper?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Regime indicator */}
      {regimeProbs && (
        <div>
          <div className="bloomberg-small-text text-slate-500 mb-1 font-medium">REGIME PROBABILITY</div>
          <div className="flex gap-1 h-5 rounded overflow-hidden">
            {Object.entries(regimeProbs).map(([regime, prob]) => {
              const colors: Record<string, string> = {
                surplus: '#10B981', balanced: '#6B7280', tightening: '#EF4444',
              }
              return (
                <div
                  key={regime}
                  className="flex items-center justify-center text-white bloomberg-small-text font-medium"
                  style={{
                    width: `${prob * 100}%`,
                    backgroundColor: colors[regime] ?? '#6B7280',
                    fontSize: '9px',
                    minWidth: prob > 0.1 ? undefined : 0,
                  }}
                  title={`${regime}: ${(prob * 100).toFixed(1)}%`}
                >
                  {prob > 0.15 ? `${regime} ${(prob * 100).toFixed(0)}%` : ''}
                </div>
              )
            })}
          </div>
          <div className="mt-1 bloomberg-small-text text-slate-500">
            Current regime: <span className="font-medium text-slate-700 capitalize">{currentRegime}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForecastPanel
