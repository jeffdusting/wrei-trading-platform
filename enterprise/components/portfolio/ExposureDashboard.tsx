'use client'

import { FC } from 'react'

export interface ComplianceObligation {
  scheme: 'ESS' | 'VEU'
  compliance_year: number
  target: number
  surrendered: number
  shortfall: number
  penalty_rate: number
  deadline: string
}

interface ExposureDashboardProps {
  entityName: string
  entityType: string
  obligations: ComplianceObligation[]
}

// IPART penalty rates
const PENALTY_RATES: Record<string, number> = {
  ESS: 35.86,
  VEU: 67.76,
}

export const ExposureDashboard: FC<ExposureDashboardProps> = ({ entityName, entityType, obligations }) => {
  const totalShortfall = obligations.reduce((sum, o) => sum + Math.max(0, o.shortfall), 0)
  const totalPenaltyExposure = obligations.reduce(
    (sum, o) => sum + Math.max(0, o.shortfall) * (o.penalty_rate || PENALTY_RATES[o.scheme] || 0), 0
  )
  const nextDeadline = obligations
    .filter(o => o.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]

  const daysToDeadline = nextDeadline
    ? Math.ceil((new Date(nextDeadline.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-1">EXPOSURE DASHBOARD</div>
      <div className="bloomberg-card-title text-slate-900 mb-3">
        {entityName}
        <span className="bloomberg-data text-[9px] bg-slate-100 px-1 py-0.5 rounded ml-2 text-slate-500">
          {entityType.toUpperCase()}
        </span>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="bloomberg-section-label text-slate-400">TOTAL SHORTFALL</div>
          <div className={`bloomberg-metric-value ${totalShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totalShortfall.toLocaleString()}
          </div>
          <div className="bloomberg-small-text text-slate-500">certificates</div>
        </div>
        <div>
          <div className="bloomberg-section-label text-slate-400">PENALTY EXPOSURE</div>
          <div className={`bloomberg-metric-value ${totalPenaltyExposure > 0 ? 'text-red-600' : 'text-green-600'}`}>
            A${totalPenaltyExposure.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
          </div>
          <div className="bloomberg-small-text text-slate-500">at current penalty rates</div>
        </div>
        <div>
          <div className="bloomberg-section-label text-slate-400">NEXT DEADLINE</div>
          <div className="bloomberg-metric-value text-slate-900">
            {daysToDeadline != null ? `${daysToDeadline}d` : '—'}
          </div>
          <div className="bloomberg-small-text text-slate-500">
            {nextDeadline?.deadline ?? 'No deadlines'}
          </div>
        </div>
      </div>

      {/* Obligations Table */}
      {obligations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full bloomberg-body-text">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-1.5 px-2 bloomberg-section-label">Scheme</th>
                <th className="text-left py-1.5 px-2 bloomberg-section-label">Year</th>
                <th className="text-right py-1.5 px-2 bloomberg-section-label">Target</th>
                <th className="text-right py-1.5 px-2 bloomberg-section-label">Surrendered</th>
                <th className="text-right py-1.5 px-2 bloomberg-section-label">Shortfall</th>
                <th className="text-right py-1.5 px-2 bloomberg-section-label">Penalty</th>
                <th className="text-right py-1.5 px-2 bloomberg-section-label">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {obligations.map((o, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1.5 px-2">
                    <span className="bloomberg-data text-[9px] bg-slate-100 px-1 rounded">{o.scheme}</span>
                  </td>
                  <td className="py-1.5 px-2 bloomberg-data">{o.compliance_year}</td>
                  <td className="py-1.5 px-2 text-right bloomberg-data">{o.target.toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right bloomberg-data">{o.surrendered.toLocaleString()}</td>
                  <td className={`py-1.5 px-2 text-right bloomberg-data ${o.shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {o.shortfall.toLocaleString()}
                  </td>
                  <td className="py-1.5 px-2 text-right bloomberg-data text-red-600">
                    A${(o.shortfall * (o.penalty_rate || PENALTY_RATES[o.scheme] || 0)).toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-1.5 px-2 text-right bloomberg-data text-slate-500">{o.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {obligations.length === 0 && (
        <p className="bloomberg-body-text text-slate-500">No compliance obligations for this entity.</p>
      )}
    </div>
  )
}

export default ExposureDashboard
