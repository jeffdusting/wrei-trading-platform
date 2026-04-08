'use client'

import { FC } from 'react'

export interface PipelineProject {
  id: string
  project_name: string
  client: string | null
  division: string | null
  scheme: string | null
  method: string | null
  stage: string
  estimated_yield: number | null
  estimated_value: number | null
  probability_weight: number
}

const STAGE_COLOURS: Record<string, { bg: string; border: string }> = {
  diagnostic: { bg: 'bg-blue-50', border: 'border-blue-200' },
  validation: { bg: 'bg-blue-50', border: 'border-blue-300' },
  implementation: { bg: 'bg-amber-50', border: 'border-amber-200' },
  mv_audit: { bg: 'bg-amber-50', border: 'border-amber-300' },
  registration: { bg: 'bg-green-50', border: 'border-green-200' },
  sale: { bg: 'bg-green-50', border: 'border-green-300' },
}

interface PipelineCardProps {
  project: PipelineProject
  onMoveForward?: () => void
  onMoveBack?: () => void
}

export const PipelineCard: FC<PipelineCardProps> = ({ project, onMoveForward, onMoveBack }) => {
  const colours = STAGE_COLOURS[project.stage] ?? { bg: 'bg-slate-50', border: 'border-slate-200' }
  const weightedValue = (project.estimated_value ?? 0) * project.probability_weight

  return (
    <div className={`p-3 rounded border ${colours.border} ${colours.bg} mb-2`}>
      <div className="bloomberg-card-title text-slate-900 mb-1 truncate" title={project.project_name}>
        {project.project_name}
      </div>
      {project.client && (
        <div className="bloomberg-small-text text-slate-500 mb-1">{project.client}</div>
      )}
      <div className="flex items-center gap-1.5 mb-2">
        {project.scheme && (
          <span className="bloomberg-data text-[9px] px-1 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            {project.scheme}
          </span>
        )}
        {project.method && (
          <span className="bloomberg-data text-[9px] px-1 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            {project.method}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="bloomberg-data text-[9px] text-slate-400 uppercase">Yield</div>
          <div className="bloomberg-data bloomberg-small-text text-slate-900">
            {project.estimated_yield ? project.estimated_yield.toLocaleString() : '—'}
          </div>
        </div>
        <div>
          <div className="bloomberg-data text-[9px] text-slate-400 uppercase">Wtd Value</div>
          <div className="bloomberg-data bloomberg-small-text text-slate-900">
            {weightedValue > 0 ? `A$${weightedValue.toLocaleString('en-AU', { maximumFractionDigits: 0 })}` : '—'}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="bloomberg-data text-[9px] text-slate-400">
          {Math.round(project.probability_weight * 100)}% prob
        </span>
        <div className="flex gap-1">
          {onMoveBack && (
            <button
              onClick={onMoveBack}
              className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 bloomberg-data text-[9px] text-slate-600"
              title="Move to previous stage"
            >
              &larr;
            </button>
          )}
          {onMoveForward && (
            <button
              onClick={onMoveForward}
              className="px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 bloomberg-data text-[9px] text-blue-700"
              title="Move to next stage"
            >
              &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PipelineCard
