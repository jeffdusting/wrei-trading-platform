'use client'

export default function PortfolioPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">CMP</span>
          <h1 className="bloomberg-page-heading text-slate-900">Client Portfolio &amp; Compliance</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          Entity hierarchy, exposure dashboard, and compliance countdown.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded p-4">
        <p className="bloomberg-body-text text-amber-800">
          Coming in D4 — Entity hierarchy tree (Downer Group &rarr; Division &rarr; Business Unit &rarr; Client),
          per-entity compliance shortfall, penalty exposure, and surrender deadline countdown.
        </p>
      </div>
    </div>
  )
}
