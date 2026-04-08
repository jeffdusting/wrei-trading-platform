'use client'

import { FC } from 'react'

export interface CostResponsibility {
  billPayer: 'owner' | 'operator' | 'tenant' | null
  contractHolder: 'owner' | 'operator' | 'tenant' | null
  costPassthrough: 'direct' | 'embedded' | 'none' | null
  equipmentControl: 'owner' | 'operator' | 'tenant' | null
}

interface CostResponsibilityTreeProps {
  value: CostResponsibility
  onChange: (data: CostResponsibility) => void
}

interface QuestionDef {
  key: keyof CostResponsibility
  question: string
  options: { value: string; label: string }[]
}

const QUESTIONS: QuestionDef[] = [
  {
    key: 'billPayer',
    question: 'Q1: Who pays the electricity bill?',
    options: [
      { value: 'owner', label: 'Asset Owner' },
      { value: 'operator', label: 'Facility Operator' },
      { value: 'tenant', label: 'Tenant' },
    ],
  },
  {
    key: 'contractHolder',
    question: 'Q2: Who holds the retail electricity contract?',
    options: [
      { value: 'owner', label: 'Asset Owner' },
      { value: 'operator', label: 'Facility Operator' },
      { value: 'tenant', label: 'Tenant' },
    ],
  },
  {
    key: 'costPassthrough',
    question: 'Q3: Are electricity costs passed through in the lease/contract?',
    options: [
      { value: 'direct', label: 'Yes — direct pass-through' },
      { value: 'embedded', label: 'Yes — embedded in service fee' },
      { value: 'none', label: 'No — not passed through' },
    ],
  },
  {
    key: 'equipmentControl',
    question: 'Q4: Who controls the energy-using equipment?',
    options: [
      { value: 'owner', label: 'Asset Owner' },
      { value: 'operator', label: 'Facility Operator' },
      { value: 'tenant', label: 'Tenant' },
    ],
  },
]

export const CostResponsibilityTree: FC<CostResponsibilityTreeProps> = ({ value, onChange }) => {
  const handleChange = (key: keyof CostResponsibility, val: string) => {
    onChange({ ...value, [key]: val })
  }

  // Determine which questions to show based on previous answers
  const visibleQuestions = QUESTIONS.filter((q, i) => {
    if (i === 0) return true
    // Show Q2 only after Q1 is answered
    if (i === 1) return value.billPayer !== null
    // Show Q3 only after Q2 is answered
    if (i === 2) return value.contractHolder !== null
    // Show Q4 only after Q3 is answered
    if (i === 3) return value.costPassthrough !== null
    return false
  })

  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-3">STEP 2: COST RESPONSIBILITY</div>
      <div className="space-y-4">
        {visibleQuestions.map((q) => (
          <div key={q.key} className="p-3 border border-slate-200 rounded">
            <p className="bloomberg-body-text text-slate-900 mb-2">{q.question}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange(q.key, opt.value)}
                  className={`px-4 py-1.5 rounded bloomberg-small-text font-medium transition-all ${
                    value[q.key] === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CostResponsibilityTree
