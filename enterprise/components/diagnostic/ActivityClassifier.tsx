'use client'

import { FC } from 'react'
import type { Jurisdiction } from '@enterprise/lib/diagnostic/scheme-rules'
import { ACTIVITY_METHOD_MAP, getMethodByCode, getRuleSet } from '@enterprise/lib/diagnostic/scheme-rules'

interface ActivityClassifierProps {
  jurisdiction: Jurisdiction
  value: string | null
  onChange: (activityType: string, methodCode: string) => void
}

export const ActivityClassifier: FC<ActivityClassifierProps> = ({ jurisdiction, value, onChange }) => {
  const activityTypes = Object.keys(ACTIVITY_METHOD_MAP)

  const getMethodInfo = (activityType: string) => {
    const mapping = ACTIVITY_METHOD_MAP[activityType]
    const methodCode = jurisdiction === 'NSW' ? mapping.ess : mapping.veu
    const method = getMethodByCode(jurisdiction, methodCode)
    return { methodCode, method }
  }

  return (
    <div className="bg-white border border-slate-200 rounded p-4">
      <div className="bloomberg-section-label text-slate-400 mb-3">STEP 2: ACTIVITY TYPE</div>
      <div className="space-y-2">
        {activityTypes.map((activityType) => {
          const { methodCode, method } = getMethodInfo(activityType)
          const isEnded = method?.status === 'ended'
          const isEnding = method?.status === 'ending'
          const isSelected = value === activityType

          return (
            <button
              key={activityType}
              onClick={() => onChange(activityType, methodCode)}
              className={`
                w-full p-3 rounded border text-left transition-all flex items-center justify-between
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isEnded
                    ? 'border-red-200 bg-red-50/50 hover:border-red-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }
              `}
            >
              <div>
                <div className="bloomberg-card-title text-slate-900 flex items-center gap-2">
                  {activityType}
                  {isEnded && (
                    <span className="bloomberg-data text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                      ENDED
                    </span>
                  )}
                  {isEnding && (
                    <span className="bloomberg-data text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      ENDING {method?.endDate}
                    </span>
                  )}
                </div>
                <div className="bloomberg-small-text text-slate-500 mt-0.5">
                  Method: {methodCode} — {method?.name ?? 'Unknown'}
                </div>
              </div>
              <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                {methodCode}
              </span>
            </button>
          )
        })}
      </div>

      {value && getMethodInfo(value).method?.status === 'ended' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <p className="bloomberg-body-text text-red-800">
            This method has ended and is no longer accepting new projects.
            Existing projects lodged before the end date may still be processed.
          </p>
        </div>
      )}
    </div>
  )
}

export default ActivityClassifier
