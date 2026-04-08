'use client'

export default function PipelinePage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">PIP</span>
          <h1 className="bloomberg-page-heading text-slate-900">Project Pipeline</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          Kanban board tracking projects from diagnostic through to sale.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded p-4">
        <p className="bloomberg-body-text text-amber-800">
          Coming in D4 — Six-stage Kanban board (Diagnostic, Validation, Implementation,
          M&amp;V/Audit, Registration, Sale) with drag-and-drop, pipeline aggregation,
          and probability-weighted value estimates.
        </p>
      </div>
    </div>
  )
}
