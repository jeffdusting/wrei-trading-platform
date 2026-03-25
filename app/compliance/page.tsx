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
    <div className="min-h-screen bg-[#F8FAFC]" data-demo="compliance-overview">
      {/* Page Header */}
      <div className="bg-[#1B2A4A] text-white py-8" data-demo="regulatory-map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Regulatory Compliance</h1>
          <p className="mt-2 text-slate-300 text-lg">
            Australian Financial Services Framework - Compliance Map and Status Dashboard
          </p>
          <p className="mt-1 text-slate-400 text-sm">
            Comprehensive compliance monitoring across AFSL, AML/CTF, Tax, and Digital Assets Framework
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" data-demo="risk-dashboard">
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
            className="inline-flex items-center px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] transition-colors text-sm font-medium"
          >
            Institutional Onboarding
          </Link>
          <Link
            href="/negotiate"
            className="inline-flex items-center px-4 py-2 bg-[#1B2A4A] text-white rounded-lg hover:bg-[#152240] transition-colors text-sm font-medium"
          >
            Start Negotiation
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
