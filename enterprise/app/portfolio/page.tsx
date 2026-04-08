'use client'

import { FC, useState, useMemo } from 'react'
import EntityHierarchy, { type EntityNode } from '@enterprise/components/portfolio/EntityHierarchy'
import ExposureDashboard, { type ComplianceObligation } from '@enterprise/components/portfolio/ExposureDashboard'
import ComplianceCountdown from '@enterprise/components/portfolio/ComplianceCountdown'

// Demo entity hierarchy
const DEMO_ENTITIES: EntityNode[] = [
  {
    id: 'dg', parent_id: null, entity_name: 'Downer Group', entity_type: 'group',
    certificateCount: 12450, complianceStatus: 'at_risk',
    children: [
      {
        id: 'dr', parent_id: 'dg', entity_name: 'Downer Rail', entity_type: 'division',
        certificateCount: 5200, complianceStatus: 'at_risk',
        children: [
          { id: 'ntl', parent_id: 'dr', entity_name: 'NSW TrainLink Fleet', entity_type: 'business_unit', certificateCount: 3100, complianceStatus: 'at_risk' },
          { id: 'st', parent_id: 'dr', entity_name: 'Sydney Trains Maintenance', entity_type: 'client', certificateCount: 2100, complianceStatus: 'compliant' },
        ],
      },
      {
        id: 'dm', parent_id: 'dg', entity_name: 'Downer Mining', entity_type: 'division',
        certificateCount: 4250, complianceStatus: 'compliant',
        children: [
          { id: 'bhp', parent_id: 'dm', entity_name: 'BHP Mitsubishi Alliance', entity_type: 'client', certificateCount: 2500, complianceStatus: 'compliant' },
          { id: 'rt', parent_id: 'dm', entity_name: 'Rio Tinto Coal', entity_type: 'client', certificateCount: 1750, complianceStatus: 'compliant' },
        ],
      },
      {
        id: 'du', parent_id: 'dg', entity_name: 'Downer Utilities', entity_type: 'division',
        certificateCount: 3000, complianceStatus: 'non_compliant',
        children: [
          { id: 'ee', parent_id: 'du', entity_name: 'Endeavour Energy', entity_type: 'client', certificateCount: 1500, complianceStatus: 'non_compliant' },
          { id: 'yvw', parent_id: 'du', entity_name: 'Yarra Valley Water', entity_type: 'client', certificateCount: 800, complianceStatus: 'at_risk' },
          { id: 'mw', parent_id: 'du', entity_name: 'Melbourne Water', entity_type: 'client', certificateCount: 700, complianceStatus: 'compliant' },
        ],
      },
    ],
  },
]

// Demo compliance obligations keyed by entity ID
const DEMO_OBLIGATIONS: Record<string, ComplianceObligation[]> = {
  dg: [
    { scheme: 'ESS', compliance_year: 2026, target: 15000, surrendered: 10750, shortfall: 4250, penalty_rate: 35.86, deadline: '2026-06-30' },
    { scheme: 'VEU', compliance_year: 2026, target: 5000, surrendered: 3800, shortfall: 1200, penalty_rate: 67.76, deadline: '2026-12-31' },
  ],
  dr: [
    { scheme: 'ESS', compliance_year: 2026, target: 6000, surrendered: 4800, shortfall: 1200, penalty_rate: 35.86, deadline: '2026-06-30' },
  ],
  ntl: [
    { scheme: 'ESS', compliance_year: 2026, target: 3500, surrendered: 2400, shortfall: 1100, penalty_rate: 35.86, deadline: '2026-06-30' },
  ],
  st: [
    { scheme: 'ESS', compliance_year: 2026, target: 2500, surrendered: 2400, shortfall: 100, penalty_rate: 35.86, deadline: '2026-06-30' },
  ],
  dm: [
    { scheme: 'ESS', compliance_year: 2026, target: 4500, surrendered: 4250, shortfall: 250, penalty_rate: 35.86, deadline: '2026-06-30' },
  ],
  du: [
    { scheme: 'ESS', compliance_year: 2026, target: 4500, surrendered: 1700, shortfall: 2800, penalty_rate: 35.86, deadline: '2026-06-30' },
    { scheme: 'VEU', compliance_year: 2026, target: 5000, surrendered: 3800, shortfall: 1200, penalty_rate: 67.76, deadline: '2026-12-31' },
  ],
  ee: [
    { scheme: 'ESS', compliance_year: 2026, target: 2000, surrendered: 500, shortfall: 1500, penalty_rate: 35.86, deadline: '2026-06-30' },
  ],
  yvw: [
    { scheme: 'VEU', compliance_year: 2026, target: 3000, surrendered: 2200, shortfall: 800, penalty_rate: 67.76, deadline: '2026-12-31' },
  ],
  mw: [
    { scheme: 'VEU', compliance_year: 2026, target: 2000, surrendered: 1600, shortfall: 400, penalty_rate: 67.76, deadline: '2026-12-31' },
  ],
}

const PortfolioPage: FC = () => {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>('dg')

  const selectedEntity = useMemo(() => {
    function findEntity(nodes: EntityNode[], id: string): EntityNode | null {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findEntity(node.children, id)
          if (found) return found
        }
      }
      return null
    }
    return selectedEntityId ? findEntity(DEMO_ENTITIES, selectedEntityId) : null
  }, [selectedEntityId])

  const obligations = selectedEntityId ? (DEMO_OBLIGATIONS[selectedEntityId] ?? []) : []

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">CMP</span>
          <h1 className="bloomberg-page-heading text-slate-900">Client Portfolio &amp; Compliance</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          Entity hierarchy, compliance shortfall, penalty exposure, and surrender deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel — Entity Tree */}
        <div className="lg:col-span-1">
          <EntityHierarchy
            entities={DEMO_ENTITIES}
            selectedId={selectedEntityId}
            onSelect={setSelectedEntityId}
          />
        </div>

        {/* Right Panel — Exposure + Countdown */}
        <div className="lg:col-span-2 space-y-4">
          {selectedEntity ? (
            <>
              <ExposureDashboard
                entityName={selectedEntity.entity_name}
                entityType={selectedEntity.entity_type}
                obligations={obligations}
              />
              <ComplianceCountdown obligations={obligations} />
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded p-6 text-center">
              <p className="bloomberg-body-text text-slate-500">
                Select an entity from the hierarchy to view compliance details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PortfolioPage
