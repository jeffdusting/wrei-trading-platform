'use client'

import { FC, useMemo } from 'react'
import type { ComplianceObligation } from './ExposureDashboard'

interface ComplianceCountdownProps {
  obligations: ComplianceObligation[]
  spotPrice?: number
}

interface Deadline {
  scheme: string
  label: string
  date: string
  daysRemaining: number
  shortfall: number
  procurementCost: number
}

export const ComplianceCountdown: FC<ComplianceCountdownProps> = ({ obligations, spotPrice = 37.85 }) => {
  const deadlines = useMemo((): Deadline[] => {
    const now = Date.now()
    return obligations
      .filter(o => o.deadline && o.shortfall > 0)
      .map(o => {
        const daysRemaining = Math.ceil((new Date(o.deadline).getTime() - now) / (1000 * 60 * 60 * 24))
        return {
          scheme: o.scheme,
          label: `${o.scheme} ${o.compliance_year}`,
          date: o.deadline,
          daysRemaining,
          shortfall: o.shortfall,
          procurementCost: o.shortfall * spotPrice,
        }
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  }, [obligations, spotPrice])

  const getTrafficLight = (days: number) => {
    if (days > 90) return { colour: 'bg-green-500', label: 'GREEN', textColour: 'text-green-700' }
    if (days > 30) return { colour: 'bg-amber-500', label: 'AMBER', textColour: 'text-amber-700' }
    return { colour: 'bg-red-500', label: 'RED', textColour: 'text-red-700' }
  }

  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-3">COMPLIANCE COUNTDOWN</div>

      {deadlines.length === 0 && (
        <p className="bloomberg-body-text text-slate-500">No outstanding surrender deadlines.</p>
      )}

      <div className="space-y-3">
        {deadlines.map((d, i) => {
          const light = getTrafficLight(d.daysRemaining)
          return (
            <div key={i} className="p-3 border border-slate-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${light.colour}`} />
                  <span className="bloomberg-card-title text-slate-900">{d.label}</span>
                  <span className={`bloomberg-data text-[9px] font-medium ${light.textColour}`}>
                    {light.label}
                  </span>
                </div>
                <span className="bloomberg-data bloomberg-small-text text-slate-500">{d.date}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="bloomberg-data text-[9px] text-slate-400 uppercase">Days Left</div>
                  <div className={`bloomberg-metric-value ${d.daysRemaining <= 30 ? 'text-red-600' : 'text-slate-900'}`}>
                    {d.daysRemaining}
                  </div>
                </div>
                <div>
                  <div className="bloomberg-data text-[9px] text-slate-400 uppercase">Shortfall</div>
                  <div className="bloomberg-metric-value text-red-600">
                    {d.shortfall.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="bloomberg-data text-[9px] text-slate-400 uppercase">Est. Cost</div>
                  <div className="bloomberg-metric-value text-slate-900">
                    A${d.procurementCost.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${light.colour}`}
                  style={{ width: `${Math.max(5, Math.min(100, (1 - d.daysRemaining / 365) * 100))}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 bloomberg-small-text text-slate-400">
        ESS deadline: 30 June (annual), 31 December (interim) | VEU: annual compliance deadline
      </div>
    </div>
  )
}

export default ComplianceCountdown
