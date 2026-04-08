'use client'

import { FC, useState, useEffect, useCallback, useMemo } from 'react'
import KanbanBoard from '@enterprise/components/pipeline/KanbanBoard'
import PipelineAggregation from '@enterprise/components/pipeline/PipelineAggregation'
import PipelineFilters, { type PipelineFilterState } from '@enterprise/components/pipeline/PipelineFilters'
import type { PipelineProject } from '@enterprise/components/pipeline/PipelineCard'

// Demo pipeline data
const DEMO_PROJECTS: PipelineProject[] = [
  { id: '1', project_name: 'Downer Rail — HVAC Upgrade', client: 'NSW TrainLink', division: 'Downer Rail', scheme: 'ESS', method: 'HEER', stage: 'diagnostic', estimated_yield: 450, estimated_value: 17033, probability_weight: 0.10 },
  { id: '2', project_name: 'Sydney Trains — Motor Replacement', client: 'Sydney Trains', division: 'Downer Rail', scheme: 'ESS', method: 'MBM', stage: 'validation', estimated_yield: 1200, estimated_value: 45420, probability_weight: 0.25 },
  { id: '3', project_name: 'Downer Mining — Refrigeration QLD', client: 'BHP Mitsubishi', division: 'Downer Mining', scheme: 'ESS', method: 'MBM', stage: 'validation', estimated_yield: 800, estimated_value: 30280, probability_weight: 0.25 },
  { id: '4', project_name: 'Downer Utilities — Hot Water VIC', client: 'Yarra Valley Water', division: 'Downer Utilities', scheme: 'VEU', method: 'VIHEAB', stage: 'implementation', estimated_yield: 350, estimated_value: 27475, probability_weight: 0.50 },
  { id: '5', project_name: 'Melbourne Metro — Building Shell', client: 'Metro Trains', division: 'Downer Rail', scheme: 'VEU', method: 'VHEER', stage: 'implementation', estimated_yield: 600, estimated_value: 47100, probability_weight: 0.50 },
  { id: '6', project_name: 'Downer Utilities — LED Upgrade NSW', client: 'Endeavour Energy', division: 'Downer Utilities', scheme: 'ESS', method: 'HEER', stage: 'mv_audit', estimated_yield: 2000, estimated_value: 75700, probability_weight: 0.75 },
  { id: '7', project_name: 'TrainLink Fleet — Motor Overhaul', client: 'NSW TrainLink', division: 'Downer Rail', scheme: 'ESS', method: 'MBM', stage: 'registration', estimated_yield: 950, estimated_value: 35958, probability_weight: 0.90 },
  { id: '8', project_name: 'Downer Mining — Compressor Upgrade', client: 'Rio Tinto', division: 'Downer Mining', scheme: 'ESS', method: 'MBM', stage: 'sale', estimated_yield: 1500, estimated_value: 56775, probability_weight: 1.00 },
  { id: '9', project_name: 'Downer Rail — Signalling Efficiency', client: 'ARTC', division: 'Downer Rail', scheme: 'ESS', method: 'PIAMV', stage: 'diagnostic', estimated_yield: 300, estimated_value: 11355, probability_weight: 0.10 },
  { id: '10', project_name: 'VIC Water — Pump Upgrades', client: 'Melbourne Water', division: 'Downer Utilities', scheme: 'VEU', method: 'VMBM', stage: 'validation', estimated_yield: 700, estimated_value: 54950, probability_weight: 0.25 },
  { id: '11', project_name: 'Downer Mining — Ventilation NSW', client: 'Glencore', division: 'Downer Mining', scheme: 'ESS', method: 'MBM', stage: 'diagnostic', estimated_yield: 1100, estimated_value: 41635, probability_weight: 0.10 },
  { id: '12', project_name: 'NSW Health — HVAC Retrofit', client: 'NSW Health', division: 'Downer Utilities', scheme: 'ESS', method: 'HEER', stage: 'mv_audit', estimated_yield: 1800, estimated_value: 68130, probability_weight: 0.75 },
]

const PipelinePage: FC = () => {
  const [projects, setProjects] = useState<PipelineProject[]>(DEMO_PROJECTS)
  const [filters, setFilters] = useState<PipelineFilterState>({
    division: '', client: '', scheme: '', stage: '', sortBy: 'value',
  })

  // Attempt to fetch live data
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/pipeline')
        if (res.ok) {
          const data = await res.json()
          if (data.projects?.length > 0) setProjects(data.projects)
        }
      } catch { /* keep demo data */ }
    }
    fetchProjects()
  }, [])

  const handleStageChange = useCallback(async (projectId: string, newStage: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, stage: newStage } : p
    ))
    try {
      await fetch('/api/pipeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, stage: newStage }),
      })
    } catch { /* optimistic update — API may not be connected */ }
  }, [])

  const filteredProjects = useMemo(() => {
    let result = projects
    if (filters.division) result = result.filter(p => p.division === filters.division)
    if (filters.client) result = result.filter(p => p.client === filters.client)
    if (filters.scheme) result = result.filter(p => p.scheme === filters.scheme)
    if (filters.stage) result = result.filter(p => p.stage === filters.stage)

    if (filters.sortBy === 'value') result = [...result].sort((a, b) => (b.estimated_value ?? 0) - (a.estimated_value ?? 0))
    else if (filters.sortBy === 'client') result = [...result].sort((a, b) => (a.client ?? '').localeCompare(b.client ?? ''))

    return result
  }, [projects, filters])

  const divisions = useMemo(() => [...new Set(projects.map(p => p.division).filter(Boolean) as string[])], [projects])
  const clients = useMemo(() => [...new Set(projects.map(p => p.client).filter(Boolean) as string[])], [projects])

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">PIP</span>
          <h1 className="bloomberg-page-heading text-slate-900">Project Pipeline</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          Track projects from diagnostic through to certificate sale.
        </p>
      </div>

      <PipelineFilters value={filters} onChange={setFilters} divisions={divisions} clients={clients} />
      <PipelineAggregation projects={filteredProjects} />
      <KanbanBoard projects={filteredProjects} onStageChange={handleStageChange} />
    </div>
  )
}

export default PipelinePage
