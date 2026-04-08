'use client'

import { FC, useState, useEffect } from 'react'

interface ForecastPoint {
  horizon_weeks: number
  price_forecast: number
  price_lower_80: number | null
  price_upper_80: number | null
  regime_probability: Record<string, number> | null
}

const IntelligencePage: FC = () => {
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForecasts() {
      try {
        const res = await fetch('/api/intelligence/forecast?instrument=ESC')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setForecasts(data.forecasts ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load forecasts')
      } finally {
        setLoading(false)
      }
    }
    fetchForecasts()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">MKT</span>
          <h1 className="bloomberg-page-heading text-slate-900">Market Intelligence</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          ESC price forecasts, supply/demand analysis, and market alerts.
        </p>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded p-4">
          <p className="bloomberg-body-text text-slate-500">Loading forecast data...</p>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
          <p className="bloomberg-body-text text-amber-800">
            Forecast data unavailable: {error}. Connect enterprise database to enable live forecasts.
          </p>
        </div>
      )}

      {!loading && forecasts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded p-4">
          <h2 className="bloomberg-card-title text-slate-900 mb-3">ESC Price Forecasts</h2>
          <div className="overflow-x-auto">
            <table className="w-full bloomberg-body-text">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 bloomberg-section-label">Horizon</th>
                  <th className="text-right py-2 px-3 bloomberg-section-label">Forecast</th>
                  <th className="text-right py-2 px-3 bloomberg-section-label">80% CI Low</th>
                  <th className="text-right py-2 px-3 bloomberg-section-label">80% CI High</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f) => (
                  <tr key={f.horizon_weeks} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-700">{f.horizon_weeks}w</td>
                    <td className="py-2 px-3 text-right bloomberg-data">${f.price_forecast.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right bloomberg-data text-slate-500">
                      {f.price_lower_80 != null ? `$${f.price_lower_80.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right bloomberg-data text-slate-500">
                      {f.price_upper_80 != null ? `$${f.price_upper_80.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && forecasts.length === 0 && !error && (
        <div className="bg-white border border-slate-200 rounded p-4">
          <p className="bloomberg-body-text text-slate-500">
            No forecast data available. The intelligence page will display shared ForecastPanel,
            SupplyDemandPanel, and AlertsFeed components once the market data pipeline is connected.
          </p>
        </div>
      )}
    </div>
  )
}

export default IntelligencePage
