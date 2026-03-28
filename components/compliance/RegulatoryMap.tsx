'use client'

/**
 * Regulatory Compliance Map Component
 *
 * Visual flowchart showing investor type -> required compliance -> status
 * for Australian regulatory framework (AFSL, AML/CTF, Tax, Digital Assets).
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
  getOptimalTaxTreatment,
  getComplianceAlerts,
  AUSTRALIAN_REGULATORY_FRAMEWORK,
  type ComplianceStatus,
  type AFSLCompliance,
  type AMLCTFCompliance,
  type DigitalAssetsFramework,
  type TaxTreatment,
  type ComplianceAlert,
} from '@/lib/regulatory-compliance'

// =============================================================================
// TYPES
// =============================================================================

export type InvestorFilter = InvestorClassification | 'all'

export type OfferingStructure = 'wholesale_only' | 'sophisticated_only' | 'retail_included'

export interface ComplianceNode {
  id: string
  label: string
  category: 'investor_type' | 'framework' | 'requirement' | 'status'
  status: 'compliant' | 'pending' | 'non_compliant' | 'under_review' | 'info'
  details: string[]
  regulatoryBody?: string
}

export interface ComplianceConnection {
  from: string
  to: string
  label?: string
}

export interface RegulatoryMapProps {
  initialInvestorFilter?: InvestorFilter
  initialOfferingStructure?: OfferingStructure
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

function getStatusColour(status: string): string {
  switch (status) {
    case 'compliant': return 'bg-emerald-100 border-emerald-500 text-emerald-800'
    case 'pending': return 'bg-amber-100 border-amber-500 text-amber-800'
    case 'non_compliant': return 'bg-red-100 border-red-500 text-red-800'
    case 'under_review': return 'bg-sky-100 border-sky-500 text-sky-800'
    case 'info': return 'bg-slate-100 border-slate-400 text-slate-700'
    default: return 'bg-slate-100 border-slate-400 text-slate-700'
  }
}

function getStatusDot(status: string): string {
  switch (status) {
    case 'compliant': return 'bg-emerald-500'
    case 'pending': return 'bg-amber-500'
    case 'non_compliant': return 'bg-red-500'
    case 'under_review': return 'bg-sky-500'
    default: return 'bg-slate-400'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'compliant': return 'Compliant'
    case 'pending': return 'Pending'
    case 'non_compliant': return 'Non-Compliant'
    case 'under_review': return 'Under Review'
    case 'info': return 'Information'
    default: return 'Unknown'
  }
}

// =============================================================================
// COMPLIANCE NODE GENERATION
// =============================================================================

function buildComplianceNodes(
  investorFilter: InvestorFilter,
  offeringStructure: OfferingStructure
): ComplianceNode[] {
  const investorClass: InvestorClassification = investorFilter === 'all' ? 'wholesale' : investorFilter
  const overall = assessOverallCompliance('carbon_credits', investorClass, offeringStructure)
  const afsl = assessAFSLCompliance(investorClass, offeringStructure)
  const amlCtf = assessAMLCTFCompliance()
  const daf = assessDigitalAssetsFrameworkCompliance()
  const tax = getOptimalTaxTreatment('carbon_credits', 'revenue_share', {
    classification: investorClass,
    jurisdiction: 'Australia',
    taxResident: true,
  })

  const nodes: ComplianceNode[] = []

  // Investor Type Node
  const investorLabel = investorFilter === 'all'
    ? 'All Investor Types'
    : `${investorFilter.charAt(0).toUpperCase()}${investorFilter.slice(1)} Investor`
  nodes.push({
    id: 'investor-type',
    label: investorLabel,
    category: 'investor_type',
    status: 'info',
    details: getInvestorTypeDetails(investorFilter),
  })

  // AFSL Framework Node
  const afslStatus = getAFSLNodeStatus(afsl)
  nodes.push({
    id: 'afsl',
    label: 'AFSL Licensing',
    category: 'framework',
    status: afslStatus,
    regulatoryBody: 'ASIC',
    details: getAFSLDetails(afsl, offeringStructure),
  })

  // AML/CTF Framework Node
  const amlStatus = getAMLNodeStatus(amlCtf)
  nodes.push({
    id: 'aml-ctf',
    label: 'AML/CTF Compliance',
    category: 'framework',
    status: amlStatus,
    regulatoryBody: 'AUSTRAC',
    details: getAMLDetails(amlCtf),
  })

  // Tax Treatment Node
  nodes.push({
    id: 'tax-treatment',
    label: 'Tax Treatment',
    category: 'framework',
    status: 'compliant',
    regulatoryBody: 'ATO',
    details: getTaxDetails(tax),
  })

  // Digital Assets Framework Node
  const dafStatus = getDafNodeStatus(daf)
  nodes.push({
    id: 'digital-assets',
    label: 'Digital Assets Framework',
    category: 'framework',
    status: dafStatus,
    regulatoryBody: 'Treasury/ASIC',
    details: getDafDetails(daf),
  })

  // Overall Compliance Status Node
  nodes.push({
    id: 'overall-status',
    label: 'Overall Compliance',
    category: 'status',
    status: overall.overall,
    details: [
      `Compliance Score: ${overall.complianceScore}/100`,
      `Jurisdiction: ${overall.jurisdiction}`,
      `Next Review: ${new Date(overall.nextReview).toLocaleDateString('en-AU')}`,
      ...overall.criticalIssues.map(i => `Issue: ${i}`),
      ...overall.recommendations.map(r => `Recommendation: ${r}`),
    ],
  })

  return nodes
}

function getInvestorTypeDetails(filter: InvestorFilter): string[] {
  if (filter === 'all') {
    return [
      'Viewing compliance map for all investor types',
      'Select a specific investor type to see tailored requirements',
    ]
  }
  const details: Record<InvestorClassification, string[]> = {
    retail: [
      'Full retail protections apply',
      'Product Disclosure Statement (PDS) required',
      'Investment limit: A$50,000',
      'Cooling-off period applies',
      'AFSL licence required for offerings',
    ],
    wholesale: [
      'Wholesale client under s708 Corporations Act',
      'Minimum investment: A$500,000',
      'Net assets A$2.5M+ or income A$250K+',
      'AFSL exemption available',
      'Reduced disclosure requirements',
    ],
    professional: [
      'Professional investor classification',
      'Minimum AUM: A$10M',
      'Institutional-grade compliance',
      'Minimal disclosure obligations',
      'Direct market access eligible',
    ],
    sophisticated: [
      'Sophisticated investor under s761G',
      'Accountant certification required',
      'Net assets A$2.5M+ certified',
      'Professional experience required',
      'Full platform access',
    ],
  }
  return details[filter] || []
}

function getAFSLNodeStatus(afsl: AFSLCompliance): ComplianceNode['status'] {
  if (afsl.status === 'licensed' || afsl.status === 'exemption_claimed') return 'compliant'
  if (afsl.status === 'application_pending') return 'pending'
  return 'non_compliant'
}

function getAFSLDetails(afsl: AFSLCompliance, structure: OfferingStructure): string[] {
  const details: string[] = []
  details.push(`Status: ${afsl.status.replace(/_/g, ' ')}`)
  if (afsl.exemptionSection) details.push(`Exemption: ${afsl.exemptionSection}`)
  if (afsl.exemptionJustification) details.push(afsl.exemptionJustification)
  details.push(`Licence Required: ${afsl.required ? 'Yes' : 'No'}`)
  if (afsl.complianceOfficer) details.push(`Compliance Officer: ${afsl.complianceOfficer}`)
  if (afsl.nextAudit) details.push(`Next Audit: ${new Date(afsl.nextAudit).toLocaleDateString('en-AU')}`)
  return details
}

function getAMLNodeStatus(aml: AMLCTFCompliance): ComplianceNode['status'] {
  if (aml.status === 'registered') return 'compliant'
  if (aml.status === 'registration_pending') return 'pending'
  if (aml.status === 'exempt') return 'compliant'
  return 'non_compliant'
}

function getAMLDetails(aml: AMLCTFCompliance): string[] {
  const details: string[] = []
  details.push(`Registration Status: ${aml.status.replace(/_/g, ' ')}`)
  details.push(`Risk Rating: ${aml.austracRegistration.riskRating}`)
  details.push(`Record Keeping: ${aml.kycRequirements.recordKeeping.duration} years`)
  details.push(`Enhanced Due Diligence: ${aml.kycRequirements.enhancedDueDiligence ? 'Required' : 'Not Required'}`)
  details.push(`Ongoing Monitoring: ${aml.kycRequirements.ongoingMonitoring ? 'Active' : 'Inactive'}`)
  if (aml.austracRegistration.nextReport) {
    details.push(`Next Report Due: ${new Date(aml.austracRegistration.nextReport).toLocaleDateString('en-AU')}`)
  }
  return details
}

function getTaxDetails(tax: TaxTreatment): string[] {
  const details: string[] = []
  details.push(`Token Type: ${tax.tokenType.replace(/_/g, ' ')}`)
  details.push(`Yield Mechanism: ${tax.yieldMechanism.replace(/_/g, ' ')}`)
  details.push(`Corporate Rate: ${(tax.rates.corporateRate * 100).toFixed(0)}%`)
  details.push(`CGT Discount: ${(tax.rates.cgtDiscount * 100).toFixed(0)}%`)
  details.push(`Withholding Tax: ${(tax.rates.witholdingTax * 100).toFixed(0)}%`)
  details.push(tax.guidance.holdingPeriod)
  return details
}

function getDafNodeStatus(daf: DigitalAssetsFramework): ComplianceNode['status'] {
  const allCompliant = Object.values(daf.compliance).every(v => v === true)
  if (allCompliant) return 'compliant'
  const someCompliant = Object.values(daf.compliance).some(v => v === true)
  if (someCompliant) return 'pending'
  return 'non_compliant'
}

function getDafDetails(daf: DigitalAssetsFramework): string[] {
  const details: string[] = []
  details.push(`Status: ${daf.status.replace(/_/g, ' ')}`)
  details.push(`Effective Date: ${new Date(daf.effectiveDate).toLocaleDateString('en-AU')}`)
  details.push(`Token Issuance: ${daf.applicableTo.tokenIssuance ? 'Applicable' : 'Not Applicable'}`)
  details.push(`Risk Management: ${daf.compliance.riskManagement ? 'Compliant' : 'Non-Compliant'}`)
  details.push(`Cybersecurity: ${daf.compliance.cybersecurity ? 'Compliant' : 'Non-Compliant'}`)
  details.push(`Operational Resilience: ${daf.compliance.operationalResilience ? 'Compliant' : 'Non-Compliant'}`)
  return details
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function RegulatoryMap({
  initialInvestorFilter = 'all',
  initialOfferingStructure = 'wholesale_only',
}: RegulatoryMapProps) {
  const [investorFilter, setInvestorFilter] = useState<InvestorFilter>(initialInvestorFilter)
  const [offeringStructure, setOfferingStructure] = useState<OfferingStructure>(initialOfferingStructure)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const nodes = useMemo(
    () => buildComplianceNodes(investorFilter, offeringStructure),
    [investorFilter, offeringStructure]
  )

  const alerts = useMemo(() => getComplianceAlerts(), [])

  const investorNode = nodes.find(n => n.id === 'investor-type')
  const frameworkNodes = nodes.filter(n => n.category === 'framework')
  const statusNode = nodes.find(n => n.id === 'overall-status')
  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1B2A4A] px-6 py-4">
        <h2 className="bloomberg-metric-value text-white">
          Regulatory Compliance Map
        </h2>
        <p className="text-slate-300 bloomberg-small-text mt-1">
          Australian Financial Services Framework - Jurisdictional Requirements
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="investor-filter" className="block bloomberg-small-text font-medium text-slate-700 mb-1">
              Investor Type
            </label>
            <select
              id="investor-filter"
              value={investorFilter}
              onChange={(e) => {
                setInvestorFilter(e.target.value as InvestorFilter)
                setSelectedNode(null)
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bloomberg-small-text text-slate-800 focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] outline-none"
            >
              <option value="all">All Investor Types</option>
              <option value="retail">Retail Investor</option>
              <option value="wholesale">Wholesale Investor</option>
              <option value="professional">Professional Investor</option>
              <option value="sophisticated">Sophisticated Investor</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="offering-structure" className="block bloomberg-small-text font-medium text-slate-700 mb-1">
              Offering Structure
            </label>
            <select
              id="offering-structure"
              value={offeringStructure}
              onChange={(e) => {
                setOfferingStructure(e.target.value as OfferingStructure)
                setSelectedNode(null)
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bloomberg-small-text text-slate-800 focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] outline-none"
            >
              <option value="wholesale_only">Wholesale Only</option>
              <option value="sophisticated_only">Sophisticated Only</option>
              <option value="retail_included">Retail Included</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-b border-slate-200 flex flex-wrap gap-4" role="list" aria-label="Status legend">
        {['compliant', 'pending', 'non_compliant', 'under_review'].map((status) => (
          <div key={status} className="flex items-center gap-2" role="listitem">
            <span className={`w-3 h-3 rounded-full ${getStatusDot(status)}`} />
            <span className="bloomberg-section-label text-slate-600">{getStatusLabel(status)}</span>
          </div>
        ))}
      </div>

      {/* Flowchart */}
      <div className="px-6 py-6" role="img" aria-label="Regulatory compliance flowchart">
        <div className="flex flex-col items-center gap-2">

          {/* Investor Type Node */}
          {investorNode && (
            <button
              onClick={() => setSelectedNode(selectedNode === investorNode.id ? null : investorNode.id)}
              className={`w-full max-w-md px-4 py-3 rounded-lg border-2 text-center transition-all cursor-pointer
                ${getStatusColour(investorNode.status)}
                ${selectedNode === investorNode.id ? 'ring-2 ring-[#0EA5E9] ring-offset-2' : 'hover:shadow-md'}
              `}
              aria-label={`${investorNode.label} - ${getStatusLabel(investorNode.status)}`}
              data-testid={`node-${investorNode.id}`}
            >
              <div className=" bloomberg-small-text">{investorNode.label}</div>
              <div className="bloomberg-section-label mt-1 opacity-75">Click for details</div>
            </button>
          )}

          {/* Connection line down */}
          <div className="w-0.5 h-6 bg-slate-300" aria-hidden="true" />
          <svg width="12" height="8" className="-mt-1" aria-hidden="true">
            <polygon points="6,8 0,0 12,0" fill="#94a3b8" />
          </svg>

          {/* Framework Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {frameworkNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                className={`px-4 py-3 rounded-lg border-2 text-left transition-all cursor-pointer
                  ${getStatusColour(node.status)}
                  ${selectedNode === node.id ? 'ring-2 ring-[#0EA5E9] ring-offset-2' : 'hover:shadow-md'}
                `}
                aria-label={`${node.label} - ${getStatusLabel(node.status)}`}
                data-testid={`node-${node.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className=" bloomberg-small-text">{node.label}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${getStatusDot(node.status)}`} />
                </div>
                {node.regulatoryBody && (
                  <div className="bloomberg-section-label opacity-75">{node.regulatoryBody}</div>
                )}
                <div className="bloomberg-section-label mt-1 opacity-60">Click for details</div>
              </button>
            ))}
          </div>

          {/* Connection lines down */}
          <div className="flex gap-2 items-center" aria-hidden="true">
            <div className="w-0.5 h-6 bg-slate-300" />
          </div>
          <svg width="12" height="8" className="-mt-1" aria-hidden="true">
            <polygon points="6,8 0,0 12,0" fill="#94a3b8" />
          </svg>

          {/* Overall Status Node */}
          {statusNode && (
            <button
              onClick={() => setSelectedNode(selectedNode === statusNode.id ? null : statusNode.id)}
              className={`w-full max-w-md px-4 py-3 rounded-lg border-2 text-center transition-all cursor-pointer
                ${getStatusColour(statusNode.status)}
                ${selectedNode === statusNode.id ? 'ring-2 ring-[#0EA5E9] ring-offset-2' : 'hover:shadow-md'}
              `}
              aria-label={`${statusNode.label} - ${getStatusLabel(statusNode.status)}`}
              data-testid={`node-${statusNode.id}`}
            >
              <div className=" bloomberg-small-text">{statusNode.label}</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusDot(statusNode.status)}`} />
                <span className="bloomberg-section-label">{getStatusLabel(statusNode.status)}</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedNodeData && (
        <div
          className="px-6 py-4 bg-slate-50 border-t border-slate-200"
          data-testid="detail-panel"
          role="region"
          aria-label={`Details for ${selectedNodeData.label}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className=" text-slate-800">{selectedNodeData.label}</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${getStatusDot(selectedNodeData.status)}`} />
              <span className="bloomberg-small-text text-slate-600">{getStatusLabel(selectedNodeData.status)}</span>
            </div>
          </div>
          {selectedNodeData.regulatoryBody && (
            <p className="bloomberg-small-text text-slate-500 mb-2">
              Regulatory Body: {selectedNodeData.regulatoryBody}
            </p>
          )}
          <ul className="space-y-1" role="list">
            {selectedNodeData.details.map((detail, idx) => (
              <li key={idx} className="bloomberg-small-text text-slate-600 flex items-start gap-2">
                <span className="text-slate-400 mt-0.5 flex-shrink-0">&bull;</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-3 bloomberg-small-text text-[#0EA5E9] hover:underline"
          >
            Close details
          </button>
        </div>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200">
          <h3 className=" text-slate-800 mb-3">Active Compliance Alerts</h3>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, idx) => (
              <div
                key={idx}
                className={`px-4 py-3 rounded-lg border bloomberg-small-text ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                  alert.severity === 'high' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  alert.severity === 'medium' ? 'bg-sky-50 border-sky-200 text-sky-800' :
                  'bg-slate-50 border-slate-200 text-slate-700'
                }`}
                data-testid={`alert-${alert.severity}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{alert.title}</span>
                  <span className="bloomberg-section-label uppercase  opacity-75">
                    {alert.severity}
                  </span>
                </div>
                <p className="bloomberg-section-label mt-1 opacity-75">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
