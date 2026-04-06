'use client'

import { FC } from 'react'

interface SpotPriceHeaderProps {
  instrument: string
  spotPrice: number
  change: number
  changePct: number
  currency?: string
}

const SpotPriceHeader: FC<SpotPriceHeaderProps> = ({
  instrument,
  spotPrice,
  change,
  changePct,
  currency = 'AUD',
}) => {
  const isPositive = change >= 0
  const changeColor = isPositive ? '#10B981' : '#EF4444'
  const arrow = isPositive ? '\u25B2' : '\u25BC'
  const prefix = currency === 'AUD' ? 'A$' : '$'

  return (
    <div className="flex items-baseline gap-4">
      <div>
        <span className="text-xs text-slate-500 font-medium mr-2">{instrument}</span>
        <span className="text-2xl font-bold font-mono text-slate-800">
          {prefix}{spotPrice.toFixed(2)}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-mono font-semibold" style={{ color: changeColor }}>
          {arrow} {isPositive ? '+' : ''}{change.toFixed(2)}
        </span>
        <span className="text-xs font-mono" style={{ color: changeColor }}>
          ({isPositive ? '+' : ''}{changePct.toFixed(2)}%)
        </span>
      </div>
    </div>
  )
}

export default SpotPriceHeader
