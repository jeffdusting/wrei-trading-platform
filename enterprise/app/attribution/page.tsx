'use client'

import { FC, useState, useCallback } from 'react'
import StakeholderMapper, { type StakeholderData, type Stakeholder } from '@enterprise/components/attribution/StakeholderMapper'
import CostResponsibilityTree, { type CostResponsibility } from '@enterprise/components/attribution/CostResponsibilityTree'
import NominationReadiness from '@enterprise/components/attribution/NominationReadiness'

const EMPTY_STAKEHOLDER: Stakeholder = { name: '', type: '' }

const AttributionPage: FC = () => {
  const [stakeholders, setStakeholders] = useState<StakeholderData>({
    assetOwner: EMPTY_STAKEHOLDER,
    facilityOperator: EMPTY_STAKEHOLDER,
    tenant: EMPTY_STAKEHOLDER,
  })

  const [costResponsibility, setCostResponsibility] = useState<CostResponsibility>({
    billPayer: null,
    contractHolder: null,
    costPassthrough: null,
    equipmentControl: null,
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const hasStakeholders = stakeholders.assetOwner.name || stakeholders.facilityOperator.name
  const hasCostData = costResponsibility.billPayer !== null && costResponsibility.equipmentControl !== null
  const isComplete = hasStakeholders && hasCostData

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/attribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_owner: stakeholders.assetOwner.name,
          asset_owner_type: stakeholders.assetOwner.type || null,
          facility_operator: stakeholders.facilityOperator.name || null,
          operator_type: stakeholders.facilityOperator.type || null,
          tenant: stakeholders.tenant.name || null,
          tenant_type: stakeholders.tenant.type || null,
          bill_payer: costResponsibility.billPayer,
          contract_holder: costResponsibility.contractHolder,
          cost_passthrough: costResponsibility.costPassthrough,
          equipment_control: costResponsibility.equipmentControl,
        }),
      })
      if (res.ok) setSaved(true)
    } catch {
      // DB may not be connected
    } finally {
      setSaving(false)
    }
  }, [stakeholders, costResponsibility])

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">ATR</span>
          <h1 className="bloomberg-page-heading text-slate-900">Energy Cost Attribution Tool</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          Determine the eligible energy saver and identify split-incentive issues.
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1: Stakeholder Mapping */}
        <StakeholderMapper value={stakeholders} onChange={setStakeholders} />

        {/* Step 2: Cost Responsibility Tree */}
        {hasStakeholders && (
          <CostResponsibilityTree value={costResponsibility} onChange={setCostResponsibility} />
        )}

        {/* Step 3: Nomination Readiness */}
        {isComplete && (
          <NominationReadiness
            stakeholders={stakeholders}
            costResponsibility={costResponsibility}
          />
        )}

        {/* Save Attribution */}
        {isComplete && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`px-4 py-2 rounded bloomberg-nav-item font-medium transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : saved ? 'Attribution Saved' : 'Save Attribution'}
            </button>
            {saved && (
              <span className="bloomberg-small-text text-green-600">
                Attribution record saved to enterprise database.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AttributionPage
