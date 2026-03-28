'use client'

/**
 * Regulatory Compliance Page
 *
 * Hosts the RegulatoryMap and ComplianceStatusDashboard components.
 * Provides a comprehensive view of jurisdictional compliance requirements.
 *
 * Enhancement D3: Regulatory Compliance Map
 * WREI Trading Platform - Phase 4
 */

import { RegulatoryMap, ComplianceStatusDashboard } from '@/components/compliance'
import Link from 'next/link'

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-slate-50" data-demo="compliance-overview">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4" data-demo="regulatory-map">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Regulatory Compliance</h1>
              <p className="bloomberg-body-text text-slate-600 mt-1">
                Australian Financial Services Framework - Compliance Map and Status Dashboard
              </p>
              <p className="bloomberg-small-text text-slate-500 mt-1">
                Comprehensive compliance monitoring across AFSL, AML/CTF, Tax, and Digital Assets Framework
              </p>
            </div>
            <div className="bloomberg-section-label">
              CMP
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8" data-demo="risk-dashboard">
        {/* Regulatory Compliance Map */}
        <section aria-label="Regulatory compliance map" data-demo="afsl-compliance">
          <RegulatoryMap />
        </section>

        {/* Compliance Status Dashboard */}
        <section aria-label="Compliance status dashboard" data-demo="esg-reports">
          <ComplianceStatusDashboard />
        </section>

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 pt-4" data-demo="audit-trails">
          <Link
            href="/institutional/portal"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded bloomberg-body-text hover:bg-blue-700 transition-colors"
          >
            Institutional Onboarding
          </Link>
          <Link
            href="/negotiate"
            className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded bloomberg-body-text hover:bg-slate-900 transition-colors"
          >
            Start Negotiation
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded bloomberg-body-text hover:bg-slate-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
