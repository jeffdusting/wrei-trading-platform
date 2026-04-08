'use client'

import { FC } from 'react'
import PipelineCard, { type PipelineProject } from './PipelineCard'

const STAGES = [
  { key: 'diagnostic', label: 'Diagnostic', weight: 0.10 },
  { key: 'validation', label: 'Validation', weight: 0.25 },
  { key: 'implementation', label: 'Implementation', weight: 0.50 },
  { key: 'mv_audit', label: 'M&V/Audit', weight: 0.75 },
  { key: 'registration', label: 'Registration', weight: 0.90 },
  { key: 'sale', label: 'Sale', weight: 1.00 },
]

const STAGE_HEADER_COLOURS: Record<string, string> = {
  diagnostic: 'bg-blue-500',
  validation: 'bg-blue-600',
  implementation: 'bg-amber-500',
  mv_audit: 'bg-amber-600',
  registration: 'bg-green-500',
  sale: 'bg-green-600',
}

interface KanbanBoardProps {
  projects: PipelineProject[]
  onStageChange: (projectId: string, newStage: string) => void
}

export const KanbanBoard: FC<KanbanBoardProps> = ({ projects, onStageChange }) => {
  const getProjectsForStage = (stage: string) =>
    projects.filter(p => p.stage === stage)

  const getNextStage = (current: string): string | null => {
    const idx = STAGES.findIndex(s => s.key === current)
    return idx < STAGES.length - 1 ? STAGES[idx + 1].key : null
  }

  const getPrevStage = (current: string): string | null => {
    const idx = STAGES.findIndex(s => s.key === current)
    return idx > 0 ? STAGES[idx - 1].key : null
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-6 gap-2 min-w-[900px]">
        {STAGES.map((stage) => {
          const stageProjects = getProjectsForStage(stage.key)
          return (
            <div key={stage.key} className="bg-slate-50 rounded border border-slate-200 min-h-[400px]">
              {/* Column Header */}
              <div className={`${STAGE_HEADER_COLOURS[stage.key]} px-2 py-1.5 rounded-t flex items-center justify-between`}>
                <span className="bloomberg-small-text text-white font-medium">{stage.label}</span>
                <span className="bloomberg-data text-[9px] text-white/80">
                  {stageProjects.length} | {Math.round(stage.weight * 100)}%
                </span>
              </div>

              {/* Cards */}
              <div className="p-2">
                {stageProjects.map((project) => (
                  <PipelineCard
                    key={project.id}
                    project={project}
                    onMoveForward={
                      getNextStage(stage.key)
                        ? () => onStageChange(project.id, getNextStage(stage.key)!)
                        : undefined
                    }
                    onMoveBack={
                      getPrevStage(stage.key)
                        ? () => onStageChange(project.id, getPrevStage(stage.key)!)
                        : undefined
                    }
                  />
                ))}
                {stageProjects.length === 0 && (
                  <div className="p-4 text-center bloomberg-small-text text-slate-400">
                    No projects
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default KanbanBoard
