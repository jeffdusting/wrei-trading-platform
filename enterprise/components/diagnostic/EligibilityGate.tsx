'use client'

import { FC } from 'react'
import type { Jurisdiction, Disqualifier } from '@enterprise/lib/diagnostic/scheme-rules'
import { getDisqualifiersForMethod } from '@enterprise/lib/diagnostic/scheme-rules'

interface EligibilityGateProps {
  jurisdiction: Jurisdiction
  methodCode: string
  answers: Record<string, 'yes' | 'no'>
  onChange: (questionId: string, answer: 'yes' | 'no') => void
}

export const EligibilityGate: FC<EligibilityGateProps> = ({ jurisdiction, methodCode, answers, onChange }) => {
  const disqualifiers = getDisqualifiersForMethod(jurisdiction, methodCode)

  const getStatus = (d: Disqualifier): 'pass' | 'fail' | 'pending' => {
    const answer = answers[d.id]
    if (!answer) return 'pending'
    return answer === d.disqualifyOn ? 'fail' : 'pass'
  }

  const allAnswered = disqualifiers.every(d => answers[d.id])
  const anyFailed = disqualifiers.some(d => getStatus(d) === 'fail')
  const allPassed = allAnswered && !anyFailed

  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-3">STEP 3: ELIGIBILITY CHECK</div>
      <div className="space-y-4">
        {disqualifiers.map((d) => {
          const status = getStatus(d)
          return (
            <div
              key={d.id}
              className={`p-3 rounded border ${
                status === 'fail' ? 'border-red-300 bg-red-50' :
                status === 'pass' ? 'border-green-200 bg-green-50/50' :
                'border-slate-200'
              }`}
            >
              <p className="bloomberg-body-text text-slate-900 mb-2">{d.question}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onChange(d.id, 'yes')}
                  className={`px-4 py-1.5 rounded bloomberg-small-text font-medium transition-all ${
                    answers[d.id] === 'yes'
                      ? d.disqualifyOn === 'yes' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => onChange(d.id, 'no')}
                  className={`px-4 py-1.5 rounded bloomberg-small-text font-medium transition-all ${
                    answers[d.id] === 'no'
                      ? d.disqualifyOn === 'no' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  No
                </button>
              </div>
              {status === 'fail' && (
                <div className="mt-2 p-2 bg-red-100 rounded">
                  <p className="bloomberg-small-text text-red-800">{d.explanation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {anyFailed && (
        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
          <p className="bloomberg-card-title text-red-800">
            DISQUALIFIED — This project does not meet eligibility requirements.
          </p>
        </div>
      )}

      {allPassed && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
          <p className="bloomberg-card-title text-green-800">
            ELIGIBLE — All checks passed. Proceed to yield estimation.
          </p>
        </div>
      )}
    </div>
  )
}

export default EligibilityGate
