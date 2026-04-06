'use client'

import { FC } from 'react'

interface TooltipPayloadEntry {
  dataKey: string
  value: number | undefined
  color: string
}

interface PriceChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
  currency?: string
}

const PriceChartTooltip: FC<PriceChartTooltipProps> = ({
  active,
  payload,
  label,
  currency = 'AUD',
}) => {
  if (!active || !payload || payload.length === 0) return null

  const prefix = currency === 'AUD' ? 'A$' : '$'
  const price = payload.find(p => p.dataKey === 'price')?.value
  const forecast = payload.find(p => p.dataKey === 'forecast')?.value
  const forecastLow80 = payload.find(p => p.dataKey === 'forecastLow80')?.value
  const forecastHigh80 = payload.find(p => p.dataKey === 'forecastHigh80')?.value
  const creation = payload.find(p => p.dataKey === 'creationVolume')?.value
  const surrender = payload.find(p => p.dataKey === 'surrenderVolume')?.value

  const dateStr = label ? new Date(label).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : ''

  return (
    <div
      className="rounded shadow-lg border px-3 py-2"
      style={{
        backgroundColor: '#1A1A1B',
        borderColor: '#333',
        fontSize: '11px',
        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        minWidth: '160px',
      }}
    >
      <div className="text-slate-400 mb-1.5">{dateStr}</div>

      {price != null && (
        <div className="flex justify-between gap-4">
          <span className="text-slate-300">Price</span>
          <span className="text-white font-semibold">{prefix}{price.toFixed(2)}</span>
        </div>
      )}

      {forecast != null && (
        <>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300">Forecast</span>
            <span className="text-blue-400 font-semibold">{prefix}{forecast.toFixed(2)}</span>
          </div>
          {forecastLow80 != null && forecastHigh80 != null && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">80% CI</span>
              <span className="text-slate-400">{prefix}{forecastLow80.toFixed(2)} — {prefix}{forecastHigh80.toFixed(2)}</span>
            </div>
          )}
        </>
      )}

      {(creation != null || surrender != null) && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-700">
          {creation != null && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-300">Creation</span>
              <span style={{ color: '#10B981' }}>{creation.toLocaleString()}</span>
            </div>
          )}
          {surrender != null && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-300">Surrender</span>
              <span style={{ color: '#F59E0B' }}>{surrender.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PriceChartTooltip
