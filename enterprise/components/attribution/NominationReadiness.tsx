'use client'

import { FC, useMemo } from 'react'
import type { StakeholderData } from './StakeholderMapper'
import type { CostResponsibility } from './CostResponsibilityTree'

interface NominationReadinessProps {
  stakeholders: StakeholderData
  costResponsibility: CostResponsibility
}

interface ReadinessResult {
  eligibleSaver: string
  eligibleSaverRole: string
  splitIncentive: boolean
  confidence: 'high' | 'medium' | 'low'
  requiredActions: string[]
  explanation: string
}

function determineReadiness(
  stakeholders: StakeholderData,
  cost: CostResponsibility
): ReadinessResult {
  const { assetOwner, facilityOperator, tenant } = stakeholders

  // Determine the energy saver based on ESS/VEU rules:
  // The "energy saver" is the person who pays for the energy and controls the equipment
  let eligibleSaver = ''
  let eligibleSaverRole = ''
  let splitIncentive = false
  let confidence: 'high' | 'medium' | 'low' = 'low'
  const requiredActions: string[] = []

  // If bill payer = equipment controller, straightforward
  if (cost.billPayer === cost.equipmentControl) {
    eligibleSaverRole = cost.billPayer ?? 'unknown'
    if (eligibleSaverRole === 'owner') eligibleSaver = assetOwner.name
    else if (eligibleSaverRole === 'operator') eligibleSaver = facilityOperator.name
    else if (eligibleSaverRole === 'tenant') eligibleSaver = tenant.name
    confidence = 'high'
  } else {
    // Split incentive — bill payer differs from equipment controller
    splitIncentive = true
    // The bill payer is generally the energy saver under ESS/VEU
    eligibleSaverRole = cost.billPayer ?? 'unknown'
    if (eligibleSaverRole === 'owner') eligibleSaver = assetOwner.name
    else if (eligibleSaverRole === 'operator') eligibleSaver = facilityOperator.name
    else if (eligibleSaverRole === 'tenant') eligibleSaver = tenant.name
    confidence = 'medium'
    requiredActions.push('Obtain consent from equipment controller for the upgrade')
  }

  // If cost passthrough is embedded, the tenant may be the economic beneficiary but not the legal saver
  if (cost.costPassthrough === 'embedded') {
    confidence = 'medium'
    requiredActions.push('Clarify contractual arrangement — embedded costs may affect energy saver determination')
  }

  // If the asset owner is NOT the energy saver, flag the split incentive
  if (eligibleSaverRole !== 'owner' && assetOwner.name) {
    splitIncentive = true
    requiredActions.push(`Obtain written consent from asset owner (${assetOwner.name}) before proceeding`)
  }

  // If the contract holder differs from bill payer, additional complexity
  if (cost.contractHolder && cost.billPayer && cost.contractHolder !== cost.billPayer) {
    confidence = 'low'
    requiredActions.push('Review contractual chain — retail contract holder differs from bill payer')
  }

  if (!eligibleSaver) {
    eligibleSaver = 'Unable to determine'
    confidence = 'low'
    requiredActions.push('Complete all stakeholder and cost responsibility fields')
  }

  const explanation = splitIncentive
    ? `Split incentive detected: the ${cost.billPayer ?? 'bill payer'} pays for energy but the ${cost.equipmentControl ?? 'equipment controller'} controls the equipment. A contractual arrangement is needed to align incentives before the project can proceed to nomination.`
    : `The energy saver is clearly identified as the ${eligibleSaverRole}. No split incentive issues — the project can proceed to nomination.`

  return {
    eligibleSaver,
    eligibleSaverRole,
    splitIncentive,
    confidence,
    requiredActions,
    explanation,
  }
}

export const NominationReadiness: FC<NominationReadinessProps> = ({ stakeholders, costResponsibility }) => {
  const result = useMemo(
    () => determineReadiness(stakeholders, costResponsibility),
    [stakeholders, costResponsibility]
  )

  const confidenceColour = {
    high: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-100 text-green-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700' },
    low: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-700' },
  }

  const colours = confidenceColour[result.confidence]

  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-3">STEP 3: NOMINATION READINESS</div>

      {/* Eligible Saver */}
      <div className={`p-4 rounded border ${colours.border} ${colours.bg} mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="bloomberg-section-label text-slate-400">ELIGIBLE ENERGY SAVER</div>
            <div className="bloomberg-metric-value text-slate-900">{result.eligibleSaver}</div>
            <div className="bloomberg-small-text text-slate-500 capitalize">Role: {result.eligibleSaverRole}</div>
          </div>
          <div className="text-right">
            <span className={`bloomberg-data text-[10px] px-2 py-1 rounded ${colours.badge}`}>
              {result.confidence.toUpperCase()} CONFIDENCE
            </span>
          </div>
        </div>
        <p className={`bloomberg-body-text ${colours.text}`}>{result.explanation}</p>
      </div>

      {/* Split Incentive Flag */}
      {result.splitIncentive && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="bloomberg-data text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">SPLIT INCENTIVE</span>
          </div>
          <p className="bloomberg-small-text text-amber-800">
            The asset owner is not the energy saver. This is common in commercial leases where the tenant
            pays the electricity bill but the owner controls the building equipment. A contractual arrangement
            (e.g., green lease clause, energy savings agreement) is required before nomination.
          </p>
        </div>
      )}

      {/* Required Actions */}
      {result.requiredActions.length > 0 && (
        <div>
          <div className="bloomberg-section-label text-slate-400 mb-2">REQUIRED ACTIONS</div>
          <ul className="space-y-1">
            {result.requiredActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bloomberg-data text-[9px] bg-slate-200 px-1 rounded mt-0.5">{i + 1}</span>
                <span className="bloomberg-body-text text-slate-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default NominationReadiness
