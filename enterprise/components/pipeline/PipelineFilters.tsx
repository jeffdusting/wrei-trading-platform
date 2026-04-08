'use client'

import { FC } from 'react'

export interface PipelineFilterState {
  division: string
  client: string
  scheme: string
  stage: string
  sortBy: 'value' | 'date' | 'client'
}

interface PipelineFiltersProps {
  value: PipelineFilterState
  onChange: (filters: PipelineFilterState) => void
  divisions: string[]
  clients: string[]
}

const STAGES = [
  { value: '', label: 'All Stages' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'validation', label: 'Validation' },
  { value: 'implementation', label: 'Implementation' },
  { value: 'mv_audit', label: 'M&V/Audit' },
  { value: 'registration', label: 'Registration' },
  { value: 'sale', label: 'Sale' },
]

export const PipelineFilters: FC<PipelineFiltersProps> = ({ value, onChange, divisions, clients }) => {
  const update = (key: keyof PipelineFilterState, val: string) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="bg-white border border-slate-200 rounded p-3 mb-3">
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="bloomberg-data text-[9px] text-slate-400 block mb-0.5">DIVISION</label>
          <select
            value={value.division}
            onChange={(e) => update('division', e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded bloomberg-small-text bg-white text-slate-900"
          >
            <option value="">All Divisions</option>
            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="bloomberg-data text-[9px] text-slate-400 block mb-0.5">CLIENT</label>
          <select
            value={value.client}
            onChange={(e) => update('client', e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded bloomberg-small-text bg-white text-slate-900"
          >
            <option value="">All Clients</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="bloomberg-data text-[9px] text-slate-400 block mb-0.5">SCHEME</label>
          <select
            value={value.scheme}
            onChange={(e) => update('scheme', e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded bloomberg-small-text bg-white text-slate-900"
          >
            <option value="">All Schemes</option>
            <option value="ESS">ESS</option>
            <option value="VEU">VEU</option>
          </select>
        </div>
        <div>
          <label className="bloomberg-data text-[9px] text-slate-400 block mb-0.5">STAGE</label>
          <select
            value={value.stage}
            onChange={(e) => update('stage', e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded bloomberg-small-text bg-white text-slate-900"
          >
            {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="bloomberg-data text-[9px] text-slate-400 block mb-0.5">SORT BY</label>
          <select
            value={value.sortBy}
            onChange={(e) => update('sortBy', e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded bloomberg-small-text bg-white text-slate-900"
          >
            <option value="value">Est. Value</option>
            <option value="date">Date Created</option>
            <option value="client">Client Name</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default PipelineFilters
