'use client'

import { FC, useMemo } from 'react'
import type { PipelineProject } from './PipelineCard'

interface PipelineAggregationProps {
  projects: PipelineProject[]
}

export const PipelineAggregation: FC<PipelineAggregationProps> = ({ projects }) => {
  const stats = useMemo(() => {
    const totalValue = projects.reduce(
      (sum, p) => sum + (p.estimated_value ?? 0) * p.probability_weight, 0
    )
    const stageCount: Record<string, number> = {}
    const divisionValue: Record<string, number> = {}

    projects.forEach(p => {
      stageCount[p.stage] = (stageCount[p.stage] ?? 0) + 1
      const div = p.division ?? 'Unassigned'
      divisionValue[div] = (divisionValue[div] ?? 0) + (p.estimated_value ?? 0) * p.probability_weight
    })

    return { totalValue, stageCount, divisionValue, totalProjects: projects.length }
  }, [projects])

  return (
    <div className="bg-white border border-slate-200 rounded p-3 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="bloomberg-section-label text-slate-400">TOTAL PROJECTS</div>
          <div className="bloomberg-metric-value text-slate-900">{stats.totalProjects}</div>
        </div>
        <div>
          <div className="bloomberg-section-label text-slate-400">WEIGHTED PIPELINE VALUE</div>
          <div className="bloomberg-metric-value text-slate-900">
            A${stats.totalValue.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div>
          <div className="bloomberg-section-label text-slate-400">BY STAGE</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.stageCount).map(([stage, count]) => (
              <span key={stage} className="bloomberg-data text-[9px] bg-slate-100 px-1 py-0.5 rounded">
                {stage.slice(0, 3).toUpperCase()}: {count}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="bloomberg-section-label text-slate-400">BY DIVISION</div>
          <div className="space-y-0.5">
            {Object.entries(stats.divisionValue).slice(0, 3).map(([div, val]) => (
              <div key={div} className="bloomberg-small-text text-slate-600 flex justify-between">
                <span className="truncate mr-2">{div}</span>
                <span className="bloomberg-data flex-shrink-0">
                  A${val.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PipelineAggregation
