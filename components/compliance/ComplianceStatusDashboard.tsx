'use client'

/**
 * Compliance Status Dashboard Component
 *
 * Overall compliance score gauge, requirements checklist by investor type,
 * upcoming deadlines, and document status tracker.
 *
 * Enhancement D3: Regulatory Compliance Map
 * WREI Trading Platform - Phase 4
 */

import { useState, useMemo } from 'react'
import type { InvestorClassification } from '@/lib/types'
import {
  assessOverallCompliance,
  assessAFSLCompliance,
  assessAMLCTFCompliance,
  assessDigitalAssetsFrameworkCompliance,
  getComplianceAlerts,
  generateComplianceReport,
  AUSTRALIAN_REGULATORY_FRAMEWORK,
  COMPLIANCE_FRAMEWORKS,
  type ComplianceAlert,
} from '@/lib/regulatory-compliance'

// =============================================================================
// TYPES
// =============================================================================

export interface ComplianceStatusDashboardProps {
  initialInvestorType?: InvestorClassification
}

interface RequirementItem {
  id: string
  label: string
  framework: string
  status: 'met' | 'pending' | 'not_met'
  description: string
}

interface DeadlineItem {
  id: string
  title: string
  date: string
  regulatoryBody: string
  daysRemaining: number
  urgency: 'critical' | 'warning' | 'normal'
}

interface DocumentItem {
  id: string
  name: string
  status: 'current' | 'expiring_soon' | 'expired' | 'not_submitted'
  lastUpdated?: string
  expiryDate?: string
}

// =============================================================================
// DATA GENERATORS
// =============================================================================

function getRequirements(investorType: InvestorClassification): RequirementItem[] {
  const baseRequirements: RequirementItem[] = [
    {
      id: 'kyc-identity',
      label: 'Identity Verification (KYC)',
      framework: 'AML/CTF',
      status: 'met',
      description: 'Customer identity verification completed via 100-point check',
    },
    {
      id: 'aml-registration',
      label: 'AUSTRAC Registration',
      framework: 'AML/CTF',
      status: 'pending',
      description: 'Digital currency exchange registration with AUSTRAC',
    },
    {
      id: 'daf-risk-mgmt',
      label: 'Risk Management Framework',
      framework: 'Digital Assets Framework',
      status: 'met',
      description: 'Operational risk management systems in place per DAF 2025',
    },
    {
      id: 'daf-cybersecurity',
      label: 'Cybersecurity Standards',
      framework: 'Digital Assets Framework',
      status: 'met',
      description: 'Cybersecurity measures compliant with Digital Assets Framework',
    },
    {
      id: 'tax-reporting',
      label: 'Tax Reporting Setup',
      framework: 'Tax/ATO',
      status: 'met',
      description: 'Income and capital gains reporting structures established',
    },
  ]

  // Add investor-type-specific requirements
  if (investorType === 'retail') {
    baseRequirements.push(
      {
        id: 'afsl-licence',
        label: 'AFSL Licence',
        framework: 'AFSL',
        status: 'pending',
        description: 'Australian Financial Services Licence required for retail offerings',
      },
      {
        id: 'pds',
        label: 'Product Disclosure Statement',
        framework: 'AFSL',
        status: 'not_met',
        description: 'PDS must be issued to retail investors before investment',
      },
      {
        id: 'appropriateness',
        label: 'Appropriateness Test',
        framework: 'AFSL',
        status: 'not_met',
        description: 'Suitability assessment for retail investor protection',
      }
    )
  } else if (investorType === 'wholesale') {
    baseRequirements.push(
      {
        id: 'afsl-exemption',
        label: 'AFSL Exemption (s708)',
        framework: 'AFSL',
        status: 'met',
        description: 'Wholesale client exemption under s708 Corporations Act',
      },
      {
        id: 'wholesale-cert',
        label: 'Wholesale Client Certificate',
        framework: 'AFSL',
        status: 'met',
        description: 'Qualified accountant certificate confirming wholesale status',
      }
    )
  } else if (investorType === 'professional') {
    baseRequirements.push(
      {
        id: 'afsl-exemption',
        label: 'AFSL Exemption (s761G)',
        framework: 'AFSL',
        status: 'met',
        description: 'Professional investor exemption under s761G',
      },
      {
        id: 'professional-cert',
        label: 'Professional Investor Certification',
        framework: 'AFSL',
        status: 'met',
        description: 'AUM and professional experience requirements verified',
      }
    )
  } else if (investorType === 'sophisticated') {
    baseRequirements.push(
      {
        id: 'afsl-exemption',
        label: 'AFSL Exemption (s761G)',
        framework: 'AFSL',
        status: 'met',
        description: 'Sophisticated investor exemption under s761G',
      },
      {
        id: 'sophisticated-cert',
        label: 'Sophisticated Investor Certificate',
        framework: 'AFSL',
        status: 'met',
        description: 'Accountant certification of net assets and experience',
      }
    )
  }

  return baseRequirements
}

function getDeadlines(): DeadlineItem[] {
  const now = new Date()
  const deadlines: DeadlineItem[] = []

  // AUSTRAC Registration Deadline
  const austracDeadline = new Date('2026-03-31')
  const austracDays = Math.ceil((austracDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  deadlines.push({
    id: 'austrac-reg',
    title: 'AUSTRAC Registration Deadline',
    date: '2026-03-31',
    regulatoryBody: 'AUSTRAC',
    daysRemaining: austracDays,
    urgency: austracDays <= 30 ? 'critical' : austracDays <= 90 ? 'warning' : 'normal',
  })

  // Annual AFSL Review
  const afslReview = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  const afslDays = Math.ceil((afslReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  deadlines.push({
    id: 'afsl-review',
    title: 'Annual AFSL Compliance Review',
    date: afslReview.toISOString().split('T')[0],
    regulatoryBody: 'ASIC',
    daysRemaining: afslDays,
    urgency: 'normal',
  })

  // AML/CTF Annual Report
  const amlReport = new Date('2026-12-31')
  const amlDays = Math.ceil((amlReport.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  deadlines.push({
    id: 'aml-annual',
    title: 'AML/CTF Annual Compliance Report',
    date: '2026-12-31',
    regulatoryBody: 'AUSTRAC',
    daysRemaining: amlDays,
    urgency: 'normal',
  })

  // Tax Year End
  const taxEnd = new Date('2026-06-30')
  const taxDays = Math.ceil((taxEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  deadlines.push({
    id: 'tax-year-end',
    title: 'Financial Year End - Tax Reporting',
    date: '2026-06-30',
    regulatoryBody: 'ATO',
    daysRemaining: taxDays,
    urgency: taxDays <= 30 ? 'warning' : 'normal',
  })

  return deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining)
}

function getDocuments(investorType: InvestorClassification): DocumentItem[] {
  const docs: DocumentItem[] = [
    {
      id: 'aml-program',
      name: 'AML/CTF Program Document',
      status: 'current',
      lastUpdated: '2026-01-15',
      expiryDate: '2027-01-15',
    },
    {
      id: 'risk-assessment',
      name: 'Enterprise Risk Assessment',
      status: 'current',
      lastUpdated: '2026-02-01',
      expiryDate: '2026-08-01',
    },
    {
      id: 'cybersecurity-policy',
      name: 'Cybersecurity Policy & Procedures',
      status: 'current',
      lastUpdated: '2025-11-20',
      expiryDate: '2026-11-20',
    },
    {
      id: 'token-audit',
      name: 'Smart Contract Audit Report (CertiK)',
      status: 'current',
      lastUpdated: '2025-10-01',
      expiryDate: '2026-10-01',
    },
  ]

  if (investorType === 'retail') {
    docs.push({
      id: 'pds',
      name: 'Product Disclosure Statement',
      status: 'not_submitted',
    })
    docs.push({
      id: 'afsl-application',
      name: 'AFSL Licence Application',
      status: 'not_submitted',
    })
  } else if (investorType === 'wholesale') {
    docs.push({
      id: 'wholesale-exemption',
      name: 'Wholesale Exemption Documentation',
      status: 'current',
      lastUpdated: '2026-01-01',
      expiryDate: '2027-01-01',
    })
  } else if (investorType === 'sophisticated') {
    docs.push({
      id: 'sophistication-cert',
      name: 'Sophisticated Investor Certificate',
      status: 'current',
      lastUpdated: '2026-01-01',
      expiryDate: '2027-01-01',
    })
  }

  return docs
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ScoreGauge({ score }: { score: number }) {
  const colour = score >= 90 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444'
  const circumference = 2 * Math.PI * 54
  const progress = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center" data-testid="compliance-score-gauge">
      <svg width="140" height="140" viewBox="0 0 120 120" aria-label={`Compliance score: ${score} out of 100`}>
        {/* Background circle */}
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke={colour}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 60 60)"
          data-testid="score-progress"
        />
        {/* Score text */}
        <text
          x="60" y="55"
          textAnchor="middle"
          className="text-2xl font-bold"
          fill="#1E293B"
          fontSize="24"
        >
          {score}
        </text>
        <text
          x="60" y="72"
          textAnchor="middle"
          fill="#64748B"
          fontSize="11"
        >
          out of 100
        </text>
      </svg>
      <p className="text-sm font-medium text-slate-700 mt-2">Compliance Score</p>
    </div>
  )
}

function getDocStatusColour(status: DocumentItem['status']): string {
  switch (status) {
    case 'current': return 'text-emerald-600 bg-emerald-50'
    case 'expiring_soon': return 'text-amber-600 bg-amber-50'
    case 'expired': return 'text-red-600 bg-red-50'
    case 'not_submitted': return 'text-slate-500 bg-slate-100'
  }
}

function getDocStatusLabel(status: DocumentItem['status']): string {
  switch (status) {
    case 'current': return 'Current'
    case 'expiring_soon': return 'Expiring Soon'
    case 'expired': return 'Expired'
    case 'not_submitted': return 'Not Submitted'
  }
}

function getReqStatusColour(status: RequirementItem['status']): string {
  switch (status) {
    case 'met': return 'text-emerald-600'
    case 'pending': return 'text-amber-600'
    case 'not_met': return 'text-red-600'
  }
}

function getReqIcon(status: RequirementItem['status']): string {
  switch (status) {
    case 'met': return '\u2713'   // checkmark
    case 'pending': return '\u25CB' // circle
    case 'not_met': return '\u2717' // x mark
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function ComplianceStatusDashboard({
  initialInvestorType = 'wholesale',
}: ComplianceStatusDashboardProps) {
  const [investorType, setInvestorType] = useState<InvestorClassification>(initialInvestorType)

  const report = useMemo(() => generateComplianceReport('carbon_credits'), [])
  const requirements = useMemo(() => getRequirements(investorType), [investorType])
  const deadlines = useMemo(() => getDeadlines(), [])
  const documents = useMemo(() => getDocuments(investorType), [investorType])

  const metCount = requirements.filter(r => r.status === 'met').length
  const pendingCount = requirements.filter(r => r.status === 'pending').length
  const notMetCount = requirements.filter(r => r.status === 'not_met').length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1B2A4A] px-6 py-4">
        <h2 className="text-xl font-semibold text-white">
          Compliance Status Dashboard
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Comprehensive compliance monitoring and requirement tracking
        </p>
      </div>

      {/* Investor Type Selector */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <label htmlFor="dashboard-investor-type" className="block text-sm font-medium text-slate-700 mb-1">
          View Requirements For
        </label>
        <select
          id="dashboard-investor-type"
          value={investorType}
          onChange={(e) => setInvestorType(e.target.value as InvestorClassification)}
          className="w-full sm:w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] outline-none"
        >
          <option value="retail">Retail Investor</option>
          <option value="wholesale">Wholesale Investor</option>
          <option value="professional">Professional Investor</option>
          <option value="sophisticated">Sophisticated Investor</option>
        </select>
      </div>

      {/* Score + Summary Row */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200">
        {/* Score Gauge */}
        <div className="flex justify-center">
          <ScoreGauge score={report.summary.complianceScore} />
        </div>

        {/* Framework Scores */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Framework Compliance</h3>
          {[
            { label: 'AFSL Licensing', body: 'ASIC', status: report.afsl.status },
            { label: 'AML/CTF', body: 'AUSTRAC', status: report.amlCtf.status },
            { label: 'Digital Assets', body: 'Treasury', status: report.digitalAssetsFramework.status },
            { label: 'Tax Treatment', body: 'ATO', status: 'compliant' },
          ].map((fw) => (
            <div key={fw.label} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-700">{fw.label}</span>
                <span className="text-slate-400 text-xs ml-2">({fw.body})</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                fw.status === 'licensed' || fw.status === 'exemption_claimed' || fw.status === 'registered' || fw.status === 'in_force' || fw.status === 'compliant'
                  ? 'bg-emerald-100 text-emerald-700'
                  : fw.status === 'registration_pending' || fw.status === 'application_pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {String(fw.status).replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>

        {/* Requirements Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Requirements Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm" data-testid="requirements-met">
              <span className="text-emerald-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Met
              </span>
              <span className="font-medium text-slate-700">{metCount} of {requirements.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm" data-testid="requirements-pending">
              <span className="text-amber-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pending
              </span>
              <span className="font-medium text-slate-700">{pendingCount} of {requirements.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm" data-testid="requirements-not-met">
              <span className="text-red-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Not Met
              </span>
              <span className="font-medium text-slate-700">{notMetCount} of {requirements.length}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(metCount / requirements.length) * 100}%` }}
              data-testid="progress-bar"
              role="progressbar"
              aria-valuenow={metCount}
              aria-valuemin={0}
              aria-valuemax={requirements.length}
              aria-label={`${metCount} of ${requirements.length} requirements met`}
            />
          </div>
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="px-6 py-5 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Requirements Checklist - {investorType.charAt(0).toUpperCase() + investorType.slice(1)} Investor
        </h3>
        <div className="space-y-2" role="list" aria-label="Compliance requirements">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              role="listitem"
              data-testid={`requirement-${req.id}`}
            >
              <span className={`text-lg font-bold mt-0.5 ${getReqStatusColour(req.status)}`}>
                {getReqIcon(req.status)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">{req.label}</span>
                  <span className="text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                    {req.framework}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{req.description}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                req.status === 'met' ? 'bg-emerald-100 text-emerald-700' :
                req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {req.status === 'met' ? 'Met' : req.status === 'pending' ? 'Pending' : 'Not Met'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="px-6 py-5 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Upcoming Deadlines</h3>
        <div className="space-y-2" role="list" aria-label="Upcoming compliance deadlines">
          {deadlines.map((dl) => (
            <div
              key={dl.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                dl.urgency === 'critical' ? 'bg-red-50 border-red-200' :
                dl.urgency === 'warning' ? 'bg-amber-50 border-amber-200' :
                'bg-slate-50 border-slate-200'
              }`}
              role="listitem"
              data-testid={`deadline-${dl.id}`}
            >
              <div>
                <div className="text-sm font-medium text-slate-800">{dl.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {dl.regulatoryBody} &middot; Due: {new Date(dl.date).toLocaleDateString('en-AU')}
                </div>
              </div>
              <div className={`text-sm font-semibold ${
                dl.urgency === 'critical' ? 'text-red-600' :
                dl.urgency === 'warning' ? 'text-amber-600' :
                'text-slate-600'
              }`}>
                {dl.daysRemaining > 0 ? `${dl.daysRemaining} days` : 'Overdue'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Status */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Document Status Tracker</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="pb-2 pr-4">Document</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Last Updated</th>
                <th className="pb-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 last:border-0" data-testid={`doc-${doc.id}`}>
                  <td className="py-2 pr-4 text-slate-700">{doc.name}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDocStatusColour(doc.status)}`}>
                      {getDocStatusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-slate-500 text-xs">
                    {doc.lastUpdated ? new Date(doc.lastUpdated).toLocaleDateString('en-AU') : '-'}
                  </td>
                  <td className="py-2 text-slate-500 text-xs">
                    {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('en-AU') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
