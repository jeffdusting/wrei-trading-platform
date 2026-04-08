'use client'

import { FC, useState } from 'react'

export interface EntityNode {
  id: string
  parent_id: string | null
  entity_name: string
  entity_type: 'group' | 'division' | 'business_unit' | 'client' | 'facility'
  certificateCount?: number
  complianceStatus?: 'compliant' | 'at_risk' | 'non_compliant'
  children?: EntityNode[]
}

interface EntityHierarchyProps {
  entities: EntityNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const TYPE_ICONS: Record<string, string> = {
  group: 'GRP',
  division: 'DIV',
  business_unit: 'BU',
  client: 'CLT',
  facility: 'FAC',
}

const STATUS_COLOURS: Record<string, string> = {
  compliant: 'bg-green-500',
  at_risk: 'bg-amber-500',
  non_compliant: 'bg-red-500',
}

const TreeNode: FC<{
  node: EntityNode
  selectedId: string | null
  onSelect: (id: string) => void
  depth: number
}> = ({ node, selectedId, onSelect, depth }) => {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className={`
          w-full text-left py-1.5 px-2 rounded flex items-center gap-2 transition-all
          ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <span className="bloomberg-data text-[10px]">{expanded ? '\u25BC' : '\u25B6'}</span>
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Type badge */}
        <span className="bloomberg-data text-[9px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">
          {TYPE_ICONS[node.entity_type] ?? 'ENT'}
        </span>

        {/* Name */}
        <span className={`bloomberg-small-text flex-1 ${isSelected ? 'text-blue-800 font-medium' : 'text-slate-900'}`}>
          {node.entity_name}
        </span>

        {/* Certificate count */}
        {node.certificateCount != null && (
          <span className="bloomberg-data text-[9px] text-slate-500">
            {node.certificateCount.toLocaleString()}
          </span>
        )}

        {/* Status indicator */}
        {node.complianceStatus && (
          <span
            className={`w-2 h-2 rounded-full ${STATUS_COLOURS[node.complianceStatus] ?? 'bg-slate-300'}`}
          />
        )}
      </button>

      {expanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export const EntityHierarchy: FC<EntityHierarchyProps> = ({ entities, selectedId, onSelect }) => {
  return (
    <div className="bg-white border border-slate-200 rounded">
      <div className="p-2 border-b border-slate-200">
        <div className="bloomberg-section-label text-slate-400">ENTITY HIERARCHY</div>
      </div>
      <div className="p-1 max-h-[600px] overflow-y-auto">
        {entities.map(entity => (
          <TreeNode key={entity.id} node={entity} selectedId={selectedId} onSelect={onSelect} depth={0} />
        ))}
      </div>
    </div>
  )
}

export default EntityHierarchy
