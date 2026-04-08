'use client'

export default function DiagnosticPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">ORG</span>
          <h1 className="bloomberg-page-heading text-slate-900">Pre-Validation Diagnostic Engine</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          Jurisdiction routing, activity classification, eligibility gating, and yield estimation.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded p-4">
        <p className="bloomberg-body-text text-amber-800">
          Coming in D3 — Pre-Validation Diagnostic Engine with ESS (NSW) and VEU (VIC) rule sets,
          activity classifier, eligibility gate, and yield estimator.
        </p>
      </div>
    </div>
  )
}
