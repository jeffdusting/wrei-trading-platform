'use client'

export default function AttributionPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">ATR</span>
          <h1 className="bloomberg-page-heading text-slate-900">Energy Cost Attribution Tool</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          Stakeholder mapping, cost responsibility tree, and nomination readiness assessment.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded p-4">
        <p className="bloomberg-body-text text-amber-800">
          Coming in D3 — Energy Cost Attribution Tool with stakeholder mapper,
          cost responsibility decision tree, and nomination readiness checker.
        </p>
      </div>
    </div>
  )
}
