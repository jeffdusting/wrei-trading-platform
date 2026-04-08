'use client'

import { FC } from 'react'

export interface Stakeholder {
  name: string
  type: 'individual' | 'company' | 'government' | ''
}

export interface StakeholderData {
  assetOwner: Stakeholder
  facilityOperator: Stakeholder
  tenant: Stakeholder
}

interface StakeholderMapperProps {
  value: StakeholderData
  onChange: (data: StakeholderData) => void
}

const ENTITY_TYPES: { value: Stakeholder['type']; label: string }[] = [
  { value: '', label: 'Select type...' },
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
  { value: 'government', label: 'Government' },
]

const StakeholderField: FC<{
  label: string
  role: string
  value: Stakeholder
  onChange: (s: Stakeholder) => void
}> = ({ label, role, value, onChange }) => (
  <div className="p-3 border border-slate-200 rounded">
    <div className="bloomberg-section-label text-slate-400 mb-2">{label}</div>
    <div className="space-y-2">
      <input
        type="text"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder={`${role} name`}
        className="w-full px-3 py-2 border border-slate-300 rounded bloomberg-body-text text-slate-900"
      />
      <select
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value as Stakeholder['type'] })}
        className="w-full px-3 py-2 border border-slate-300 rounded bloomberg-body-text text-slate-900 bg-white"
      >
        {ENTITY_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  </div>
)

export const StakeholderMapper: FC<StakeholderMapperProps> = ({ value, onChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-3">STEP 1: STAKEHOLDER IDENTIFICATION</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <StakeholderField
          label="ASSET OWNER"
          role="Owner"
          value={value.assetOwner}
          onChange={(s) => onChange({ ...value, assetOwner: s })}
        />
        <StakeholderField
          label="FACILITY OPERATOR"
          role="Operator"
          value={value.facilityOperator}
          onChange={(s) => onChange({ ...value, facilityOperator: s })}
        />
        <StakeholderField
          label="TENANT"
          role="Tenant"
          value={value.tenant}
          onChange={(s) => onChange({ ...value, tenant: s })}
        />
      </div>

      {/* Relationship Diagram */}
      {(value.assetOwner.name || value.facilityOperator.name || value.tenant.name) && (
        <div className="border-t border-slate-200 pt-3">
          <div className="bloomberg-section-label text-slate-400 mb-2">RELATIONSHIP</div>
          <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded">
            {value.assetOwner.name && (
              <div className="text-center px-3 py-2 bg-blue-50 border border-blue-200 rounded">
                <div className="bloomberg-small-text text-blue-800 font-medium">{value.assetOwner.name}</div>
                <div className="bloomberg-data text-[9px] text-blue-600">OWNER</div>
              </div>
            )}
            {value.assetOwner.name && value.facilityOperator.name && (
              <div className="text-slate-400">&rarr;</div>
            )}
            {value.facilityOperator.name && (
              <div className="text-center px-3 py-2 bg-green-50 border border-green-200 rounded">
                <div className="bloomberg-small-text text-green-800 font-medium">{value.facilityOperator.name}</div>
                <div className="bloomberg-data text-[9px] text-green-600">OPERATOR</div>
              </div>
            )}
            {value.facilityOperator.name && value.tenant.name && (
              <div className="text-slate-400">&rarr;</div>
            )}
            {value.tenant.name && (
              <div className="text-center px-3 py-2 bg-amber-50 border border-amber-200 rounded">
                <div className="bloomberg-small-text text-amber-800 font-medium">{value.tenant.name}</div>
                <div className="bloomberg-data text-[9px] text-amber-600">TENANT</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StakeholderMapper
