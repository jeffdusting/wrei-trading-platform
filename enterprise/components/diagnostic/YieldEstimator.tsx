'use client'

import { FC, useState, useEffect, useMemo, useCallback } from 'react'
import type { Jurisdiction } from '@enterprise/lib/diagnostic/scheme-rules'
import { getYieldFormula } from '@enterprise/lib/diagnostic/scheme-rules'

interface YieldEstimatorProps {
  jurisdiction: Jurisdiction
  methodCode: string
}

export const YieldEstimator: FC<YieldEstimatorProps> = ({ jurisdiction, methodCode }) => {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [spotPrice, setSpotPrice] = useState<number | null>(null)
  const [forecastPrice, setForecastPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const formula = getYieldFormula(jurisdiction, methodCode)

  // Fetch current spot and 26-week forecast prices
  useEffect(() => {
    async function fetchPrices() {
      const instrument = jurisdiction === 'NSW' ? 'ESC' : 'VEEC'
      try {
        const [spotRes, forecastRes] = await Promise.all([
          fetch(`/api/v1/intelligence/metrics?instrument=${instrument}`),
          fetch(`/api/v1/intelligence/forecast?instrument=${instrument}&horizon=26`),
        ])

        if (spotRes.ok) {
          const data = await spotRes.json()
          if (data.recentPrices?.length > 0) {
            setSpotPrice(data.recentPrices[0].spotPrice)
          }
        }
        if (forecastRes.ok) {
          const data = await forecastRes.json()
          if (data.forecasts?.length > 0) {
            setForecastPrice(data.forecasts[0].priceForecast)
          }
        }
      } catch {
        // Use demo prices as fallback
      }

      // Demo fallback prices
      if (!spotPrice) setSpotPrice(jurisdiction === 'NSW' ? 37.85 : 78.50)
      if (!forecastPrice) setForecastPrice(jurisdiction === 'NSW' ? 39.20 : 81.00)
      setLoading(false)
    }
    fetchPrices()
  }, [jurisdiction])

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const yieldEstimate = useMemo(() => {
    if (!formula) return 0
    const numericInputs: Record<string, number | string> = {}
    formula.inputs.forEach(inp => {
      numericInputs[inp.key] = inp.type === 'number' ? (Number(inputs[inp.key]) || 0) : (inputs[inp.key] ?? '')
    })
    return formula.calculate(numericInputs)
  }, [formula, inputs])

  const currentValue = spotPrice ? yieldEstimate * spotPrice : null
  const forecastValue = forecastPrice ? yieldEstimate * forecastPrice : null

  const handleDownloadPdf = useCallback(async () => {
    setDownloadingPdf(true)
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: `${methodCode} Assessment — ${jurisdiction}`,
          jurisdiction,
          scheme: jurisdiction === 'NSW' ? 'ESS' : 'VEU',
          method: methodCode,
          eligible: true,
          yieldEstimate,
          yieldUnit: formula?.unit ?? 'ESC',
          currentPrice: spotPrice,
          forecastPrice,
          currentValue: currentValue ? Math.round(currentValue) : undefined,
          forecastValue: forecastValue ? Math.round(forecastValue) : undefined,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-assessment-${methodCode.toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // PDF generation may fail if pdfkit isn't available in build
    } finally {
      setDownloadingPdf(false)
    }
  }, [jurisdiction, methodCode, yieldEstimate, spotPrice, forecastPrice, currentValue, forecastValue, formula])

  if (!formula) {
    return (
      <div className="bg-white border border-slate-200 rounded p-4">
        <div className="bloomberg-section-label text-slate-400 mb-3">STEP 4: YIELD ESTIMATE</div>
        <p className="bloomberg-body-text text-slate-500">
          No yield formula available for method {methodCode} in {jurisdiction}.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-3">STEP 4: YIELD ESTIMATE</div>

      {/* Input Fields */}
      <div className="space-y-3 mb-4">
        {formula.inputs.map((inp) => (
          <div key={inp.key}>
            <label className="bloomberg-small-text text-slate-600 block mb-1">
              {inp.label} {inp.unit && <span className="text-slate-400">({inp.unit})</span>}
            </label>
            {inp.type === 'select' && inp.options ? (
              <select
                value={inputs[inp.key] ?? ''}
                onChange={(e) => handleInputChange(inp.key, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bloomberg-body-text text-slate-900 bg-white"
              >
                <option value="">Select...</option>
                {inp.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={inputs[inp.key] ?? ''}
                onChange={(e) => handleInputChange(inp.key, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bloomberg-data text-slate-900"
                placeholder="0"
              />
            )}
          </div>
        ))}
      </div>

      {/* Results */}
      {yieldEstimate > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="bloomberg-section-label text-slate-400">EST. CERTIFICATES</div>
              <div className="bloomberg-large-metric text-slate-900">
                {yieldEstimate.toLocaleString()}
              </div>
              <div className="bloomberg-small-text text-slate-500">{formula.unit}</div>
            </div>
            <div>
              <div className="bloomberg-section-label text-slate-400">CURRENT VALUE</div>
              <div className="bloomberg-large-metric text-slate-900">
                {currentValue != null ? `A$${currentValue.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
              </div>
              <div className="bloomberg-small-text text-slate-500">
                @ A${spotPrice?.toFixed(2) ?? '—'}/cert
                {loading && ' (loading...)'}
              </div>
            </div>
            <div>
              <div className="bloomberg-section-label text-slate-400">26W FORECAST VALUE</div>
              <div className={`bloomberg-large-metric ${forecastValue && currentValue && forecastValue > currentValue ? 'text-green-600' : 'text-slate-900'}`}>
                {forecastValue != null ? `A$${forecastValue.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
              </div>
              <div className="bloomberg-small-text text-slate-500">
                @ A${forecastPrice?.toFixed(2) ?? '—'}/cert
              </div>
            </div>
          </div>

          {/* Download PDF Button */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 rounded bloomberg-nav-item font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {downloadingPdf ? 'Generating PDF...' : 'Download Assessment PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default YieldEstimator
