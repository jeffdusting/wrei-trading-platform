'use client'

import { FC, useState, useCallback } from 'react'
import type { Jurisdiction } from '@enterprise/lib/diagnostic/scheme-rules'
import { getMethodByCode } from '@enterprise/lib/diagnostic/scheme-rules'
import JurisdictionRouter from '@enterprise/components/diagnostic/JurisdictionRouter'
import ActivityClassifier from '@enterprise/components/diagnostic/ActivityClassifier'
import EligibilityGate from '@enterprise/components/diagnostic/EligibilityGate'
import YieldEstimator from '@enterprise/components/diagnostic/YieldEstimator'

type Step = 'jurisdiction' | 'activity' | 'eligibility' | 'yield'

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: 'jurisdiction', label: 'Jurisdiction', number: 1 },
  { key: 'activity', label: 'Activity Type', number: 2 },
  { key: 'eligibility', label: 'Eligibility', number: 3 },
  { key: 'yield', label: 'Yield Estimate', number: 4 },
]

const DiagnosticPage: FC = () => {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | null>(null)
  const [activityType, setActivityType] = useState<string | null>(null)
  const [methodCode, setMethodCode] = useState<string | null>(null)
  const [eligibilityAnswers, setEligibilityAnswers] = useState<Record<string, 'yes' | 'no'>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const currentStep: Step = !jurisdiction ? 'jurisdiction'
    : !activityType ? 'activity'
    : Object.keys(eligibilityAnswers).length === 0 ? 'eligibility'
    : 'yield'

  const handleJurisdictionChange = useCallback((j: Jurisdiction) => {
    setJurisdiction(j)
    setActivityType(null)
    setMethodCode(null)
    setEligibilityAnswers({})
    setSaved(false)
  }, [])

  const handleActivityChange = useCallback((activity: string, method: string) => {
    setActivityType(activity)
    setMethodCode(method)
    setEligibilityAnswers({})
    setSaved(false)
  }, [])

  const handleEligibilityChange = useCallback((questionId: string, answer: 'yes' | 'no') => {
    setEligibilityAnswers(prev => ({ ...prev, [questionId]: answer }))
    setSaved(false)
  }, [])

  const method = jurisdiction && methodCode ? getMethodByCode(jurisdiction, methodCode) : null
  const isEnded = method?.status === 'ended'

  const handleSave = async () => {
    if (!jurisdiction || !methodCode || !activityType) return
    setSaving(true)
    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: `${activityType} — ${jurisdiction}`,
          jurisdiction,
          scheme: jurisdiction === 'NSW' ? 'ESS' : 'VEU',
          method: methodCode,
          activity_type: activityType,
          eligible: !isEnded,
          status: 'complete',
        }),
      })
      if (res.ok) setSaved(true)
    } catch {
      // Silently fail — DB may not be connected
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">ORG</span>
          <h1 className="bloomberg-page-heading text-slate-900">Pre-Validation Diagnostic Engine</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          Assess project eligibility, classify activities, and estimate certificate yield.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6 bg-white border border-slate-200 rounded p-3">
        {STEPS.map((step, i) => {
          const isActive = step.key === currentStep
          const isDone = STEPS.findIndex(s => s.key === currentStep) > i
          return (
            <div key={step.key} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${isDone ? 'bg-green-400' : 'bg-slate-300'}`} />}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center bloomberg-data text-[10px]
                ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}
              `}>
                {isDone ? '\u2713' : step.number}
              </div>
              <span className={`bloomberg-small-text ${isActive ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="space-y-4">
        {/* Step 1: Jurisdiction */}
        <JurisdictionRouter value={jurisdiction} onChange={handleJurisdictionChange} />

        {/* Step 2: Activity Classification */}
        {jurisdiction && (
          <ActivityClassifier
            jurisdiction={jurisdiction}
            value={activityType}
            onChange={handleActivityChange}
          />
        )}

        {/* Step 3: Eligibility Gate */}
        {jurisdiction && methodCode && !isEnded && (
          <EligibilityGate
            jurisdiction={jurisdiction}
            methodCode={methodCode}
            answers={eligibilityAnswers}
            onChange={handleEligibilityChange}
          />
        )}

        {/* Step 4: Yield Estimation */}
        {jurisdiction && methodCode && !isEnded && Object.keys(eligibilityAnswers).length > 0 && (
          <YieldEstimator
            jurisdiction={jurisdiction}
            methodCode={methodCode}
          />
        )}

        {/* Save Assessment */}
        {jurisdiction && methodCode && (
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
              {saving ? 'Saving...' : saved ? 'Assessment Saved' : 'Save Assessment'}
            </button>
            {saved && (
              <span className="bloomberg-small-text text-green-600">
                Assessment saved to enterprise database.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiagnosticPage
