'use client'

import { FC } from 'react'
import type { Jurisdiction } from '@enterprise/lib/diagnostic/scheme-rules'

interface JurisdictionRouterProps {
  value: Jurisdiction | null
  onChange: (jurisdiction: Jurisdiction) => void
}

const JURISDICTIONS: { value: Jurisdiction; label: string; scheme: string }[] = [
  { value: 'NSW', label: 'New South Wales', scheme: 'ESS (Energy Savings Scheme)' },
  { value: 'VIC', label: 'Victoria', scheme: 'VEU (Victorian Energy Upgrades)' },
]

export const JurisdictionRouter: FC<JurisdictionRouterProps> = ({ value, onChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-3">STEP 1: JURISDICTION</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {JURISDICTIONS.map((j) => (
          <button
            key={j.value}
            onClick={() => onChange(j.value)}
            className={`
              p-4 rounded border-2 text-left transition-all
              ${value === j.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
              }
            `}
          >
            <div className="bloomberg-card-title text-slate-900">{j.label}</div>
            <div className="bloomberg-small-text text-slate-500 mt-1">{j.scheme}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default JurisdictionRouter
