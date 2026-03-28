/**
 * WREI Trading Platform - Compliance Panel
 *
 * Step 1.2: Multi-Audience Interface System - Compliance Interface
 * Regulatory adherence, audit trails, and risk management for compliance officers and legal teams
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDemoMode } from '@/lib/demo-mode/demo-state-manager';
// import { getCERComplianceFramework, getNorthmoreGordonValueProp } from '@/lib/demo-mode/esc-market-context'; // Removed for Phase 4
import { NSW_ESC_CONFIG } from '@/lib/negotiation-config';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  DocumentChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface ComplianceMetric {
  category: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  score: number;
  lastAudit: string;
  nextReview: string;
  details: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface RegulatoryRequirement {
  id: string;
  authority: string;
  requirement: string;
  status: 'met' | 'partial' | 'overdue';
  dueDate: string;
  completionRate: number;
  assignedTo: string;
  description: string;
}

interface AuditTrailEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  entity: string;
  details: string;
  riskRating: 'low' | 'medium' | 'high';
  status: 'approved' | 'pending' | 'rejected';
}

const ComplianceStatusBadge: React.FC<{ status: 'compliant' | 'warning' | 'non-compliant' }> = ({ status }) => {
  const styles = {
    compliant: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    'non-compliant': 'bg-red-100 text-red-700'
  };

  return (
    <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${styles[status]}`}>
      {status.replace('-', ' ').toUpperCase()}
    </span>
  );
};

const RiskLevelBadge: React.FC<{ level: 'low' | 'medium' | 'high' }> = ({ level }) => {
  const styles = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${styles[level]}`}>
      {level.toUpperCase()} RISK
    </span>
  );
};

export const CompliancePanel: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30d');
  const demoMode = useDemoMode();
  const escData = demoMode.getESCDemoData();
  const complianceFramework = getCERComplianceFramework();
  const valueProps = getNorthmoreGordonValueProp('compliance');

  const complianceMetrics: ComplianceMetric[] = [
    {
      category: 'Clean Energy Regulator',
      status: 'compliant',
      score: 98,
      lastAudit: '2026-02-15',
      nextReview: '2026-05-15',
      details: [
        'ESC creation documentation complete',
        'Quarterly reporting submitted on time',
        'Audit trail comprehensive and accessible'
      ],
      riskLevel: 'low'
    },
    {
      category: 'AUSTRAC AML/CTF',
      status: 'compliant',
      score: 96,
      lastAudit: '2026-01-30',
      nextReview: '2026-07-30',
      details: [
        'Customer due diligence procedures current',
        'Suspicious matter reporting protocols active',
        'Transaction monitoring systems operational'
      ],
      riskLevel: 'low'
    },
    {
      category: 'AFSL Compliance',
      status: 'warning',
      score: 87,
      lastAudit: '2026-03-01',
      nextReview: '2026-04-01',
      details: [
        'Financial services licence conditions met',
        'Risk management framework adequate',
        'Client classification procedures need update'
      ],
      riskLevel: 'medium'
    },
    {
      category: 'Privacy & Data Protection',
      status: 'compliant',
      score: 94,
      lastAudit: '2026-02-28',
      nextReview: '2026-05-28',
      details: [
        'Privacy policy current and accessible',
        'Data breach procedures documented',
        'Third-party data sharing agreements current'
      ],
      riskLevel: 'low'
    }
  ];

  const regulatoryRequirements: RegulatoryRequirement[] = [
    {
      id: 'CER-001',
      authority: 'Clean Energy Regulator',
      requirement: 'Quarterly ESC Trading Report',
      status: 'met',
      dueDate: '2026-04-30',
      completionRate: 100,
      assignedTo: 'Compliance Team',
      description: 'Quarterly report on ESC trading activities and volumes'
    },
    {
      id: 'AFSL-002',
      authority: 'ASIC',
      requirement: 'Risk Management Review',
      status: 'partial',
      dueDate: '2026-04-15',
      completionRate: 75,
      assignedTo: 'Risk Manager',
      description: 'Annual review of risk management framework and procedures'
    },
    {
      id: 'AUSTRAC-003',
      authority: 'AUSTRAC',
      requirement: 'AML/CTF Program Update',
      status: 'met',
      dueDate: '2026-03-31',
      completionRate: 100,
      assignedTo: 'Compliance Officer',
      description: 'Update to anti-money laundering and counter-terrorism financing program'
    },
    {
      id: 'PRIVACY-004',
      authority: 'OAIC',
      requirement: 'Privacy Impact Assessment',
      status: 'overdue',
      dueDate: '2026-03-20',
      completionRate: 60,
      assignedTo: 'Legal Team',
      description: 'Privacy impact assessment for new data collection processes'
    }
  ];

  const auditTrail: AuditTrailEntry[] = [
    {
      id: 'AT-001',
      timestamp: '2026-03-25T14:30:00Z',
      action: 'ESC Certificate Validation',
      user: 'system@northmoregordon.com',
      entity: 'ESC-SYS2-2024-089456',
      details: 'Automated CER registry validation completed successfully',
      riskRating: 'low',
      status: 'approved'
    },
    {
      id: 'AT-002',
      timestamp: '2026-03-25T14:28:00Z',
      action: 'High-Value Transaction Review',
      user: 'compliance@northmoregordon.com',
      entity: 'TXN-2026-03-25-14:28',
      details: 'Manual review of A$2.4M ESC transaction for compliance verification',
      riskRating: 'medium',
      status: 'approved'
    },
    {
      id: 'AT-003',
      timestamp: '2026-03-25T14:25:00Z',
      action: 'Client Onboarding KYC',
      user: 'kyc.officer@northmoregordon.com',
      entity: 'CLIENT-INS-2026-089',
      details: 'Enhanced due diligence completed for institutional client',
      riskRating: 'low',
      status: 'approved'
    },
    {
      id: 'AT-004',
      timestamp: '2026-03-25T14:20:00Z',
      action: 'Suspicious Activity Alert',
      user: 'monitoring@northmoregordon.com',
      entity: 'TXN-2026-03-25-14:15',
      details: 'Automated monitoring flagged unusual trading pattern for review',
      riskRating: 'high',
      status: 'pending'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Compliance Overview' },
    { id: 'requirements', label: 'Regulatory Requirements' },
    { id: 'audit', label: 'Audit Trail' },
    { id: 'reports', label: 'Compliance Reports' },
    { id: 'monitoring', label: 'Risk Monitoring' }
  ];

  const overallComplianceScore = Math.round(
    complianceMetrics.reduce((sum, metric) => sum + metric.score, 0) / complianceMetrics.length
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-demo="compliance-panel">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="bloomberg-page-heading mb-2">Compliance & Risk Management</h1>
            <p className="text-amber-100 bloomberg-card-title">NSW ESC Trading - Regulatory Adherence Dashboard</p>
            <div className="flex items-center space-x-4 mt-4 text-amber-100 bloomberg-small-text">
              <span>AFSL 246896</span>
              <span>•</span>
              <span>SOC2 Type II Certified</span>
              <span>•</span>
              <span>ISO 27001 Compliant</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bloomberg-page-heading">{overallComplianceScore}%</div>
            <div className="text-amber-200">Overall Compliance Score</div>
            <div className="flex items-center justify-end mt-2">
              <CheckCircleIcon className="w-5 h-5 text-green-300 mr-2" />
              <span className="text-amber-100 bloomberg-small-text">All Critical Requirements Met</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium bloomberg-small-text ${
                  selectedTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6" data-demo="compliance-overview">
              <h3 className="bloomberg-metric-value text-gray-900">Compliance Status Overview</h3>

              {/* Compliance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {complianceMetrics.map((metric, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className=" text-gray-900">{metric.category}</h4>
                      <ComplianceStatusBadge status={metric.status} />
                    </div>

                    <div className="flex items-center mb-4">
                      <div className="bloomberg-large-metric text-gray-900 mr-2">{metric.score}%</div>
                      <RiskLevelBadge level={metric.riskLevel} />
                    </div>

                    <div className="space-y-2 mb-4">
                      {metric.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start bloomberg-small-text text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {detail}
                        </div>
                      ))}
                    </div>

                    <div className="bloomberg-small-text text-gray-500 border-t pt-3">
                      <div className="flex justify-between">
                        <span>Last Audit: {metric.lastAudit}</span>
                        <span>Next Review: {metric.nextReview}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Achievements */}
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className=" text-green-800 mb-4">Recent Compliance Achievements</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bloomberg-large-metric text-green-700">100%</div>
                    <div className="bloomberg-small-text text-green-600">CER Reporting Compliance</div>
                  </div>
                  <div className="text-center">
                    <div className="bloomberg-large-metric text-green-700">0</div>
                    <div className="bloomberg-small-text text-green-600">Regulatory Breaches (12 months)</div>
                  </div>
                  <div className="text-center">
                    <div className="bloomberg-large-metric text-green-700">24hrs</div>
                    <div className="bloomberg-small-text text-green-600">Average Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'requirements' && (
            <div className="space-y-6" data-demo="compliance-requirements">
              <div className="flex justify-between items-center">
                <h3 className="bloomberg-metric-value text-gray-900">Regulatory Requirements</h3>
                <div className="flex space-x-2">
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bloomberg-small-text"
                  >
                    <option value="30d">Next 30 Days</option>
                    <option value="90d">Next 90 Days</option>
                    <option value="12m">Next 12 Months</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {regulatoryRequirements.map((req, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className=" text-gray-900">{req.requirement}</h4>
                        <p className="bloomberg-small-text text-gray-600 mt-1">{req.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full bloomberg-section-label font-medium ${
                        req.status === 'met' ? 'bg-green-100 text-green-700' :
                        req.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bloomberg-small-text">
                      <div>
                        <span className="text-gray-500">Authority:</span>
                        <div className="font-medium">{req.authority}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <div className={`font-medium ${
                          new Date(req.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {req.dueDate}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Assigned To:</span>
                        <div className="font-medium">{req.assignedTo}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                req.completionRate === 100 ? 'bg-green-500' :
                                req.completionRate >= 75 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${req.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="bloomberg-section-label font-medium">{req.completionRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'audit' && (
            <div className="space-y-6" data-demo="compliance-audit-trail">
              <div className="flex justify-between items-center">
                <h3 className="bloomberg-metric-value text-gray-900">Audit Trail</h3>
                <div className="flex space-x-2">
                  <button className="bg-amber-600 text-white px-4 py-2 rounded-lg bloomberg-small-text font-medium hover:bg-amber-700">
                    Export Audit Log
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg bloomberg-small-text font-medium hover:bg-gray-50">
                    Filter Events
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center bloomberg-small-text text-gray-600">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  <span>All compliance-related activities are automatically logged and timestamped</span>
                </div>
              </div>

              <div className="space-y-3">
                {auditTrail.map((entry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`w-3 h-3 rounded-full ${
                          entry.status === 'approved' ? 'bg-green-500' :
                          entry.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></span>
                        <h4 className="font-medium text-gray-900">{entry.action}</h4>
                        <RiskLevelBadge level={entry.riskRating} />
                      </div>
                      <span className="bloomberg-small-text text-gray-500">{entry.timestamp}</span>
                    </div>

                    <p className="bloomberg-small-text text-gray-600 mb-2">{entry.details}</p>

                    <div className="flex justify-between items-center bloomberg-section-label text-gray-500">
                      <div className="flex space-x-4">
                        <span>User: {entry.user}</span>
                        <span>Entity: {entry.entity}</span>
                      </div>
                      <span className={`px-2 py-1 rounded bloomberg-section-label font-medium ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-700' :
                        entry.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {entry.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'reports' && (
            <div className="space-y-6" data-demo="compliance-reports">
              <h3 className="bloomberg-metric-value text-gray-900">Compliance Reports</h3>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'CER Quarterly Report',
                    description: 'NSW ESC trading activities and compliance status',
                    lastGenerated: '2026-03-01',
                    nextDue: '2026-06-01',
                    status: 'current'
                  },
                  {
                    title: 'AUSTRAC Annual Report',
                    description: 'AML/CTF compliance and suspicious matter reporting',
                    lastGenerated: '2026-01-15',
                    nextDue: '2027-01-15',
                    status: 'current'
                  },
                  {
                    title: 'ASIC Breach Report',
                    description: 'Significant breach notification and remediation',
                    lastGenerated: 'N/A',
                    nextDue: 'As required',
                    status: 'not-applicable'
                  },
                  {
                    title: 'Internal Audit Report',
                    description: 'Comprehensive internal compliance review',
                    lastGenerated: '2026-02-28',
                    nextDue: '2026-05-31',
                    status: 'upcoming'
                  }
                ].map((report, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <h4 className=" text-gray-900 mb-2">{report.title}</h4>
                    <p className="bloomberg-small-text text-gray-600 mb-4">{report.description}</p>

                    <div className="space-y-2 bloomberg-small-text">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Generated:</span>
                        <span className="font-medium">{report.lastGenerated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Next Due:</span>
                        <span className="font-medium">{report.nextDue}</span>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-amber-600 text-white px-4 py-2 rounded-lg bloomberg-small-text font-medium hover:bg-amber-700">
                      Generate Report
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'monitoring' && (
            <div className="space-y-6" data-demo="compliance-monitoring">
              <h3 className="bloomberg-metric-value text-gray-900">Risk Monitoring</h3>

              {/* Risk Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <div className="bloomberg-large-metric text-green-800">Low Risk</div>
                      <div className="bloomberg-small-text text-green-600">Overall Assessment</div>
                    </div>
                  </div>
                  <p className="bloomberg-small-text text-green-700">
                    All critical compliance requirements are being met with robust controls in place.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 mr-3" />
                    <div>
                      <div className="bloomberg-large-metric text-yellow-800">1</div>
                      <div className="bloomberg-small-text text-yellow-600">Items Requiring Attention</div>
                    </div>
                  </div>
                  <p className="bloomberg-small-text text-yellow-700">
                    AFSL client classification procedures need updating within 30 days.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <ClockIcon className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <div className="bloomberg-large-metric text-blue-800">3</div>
                      <div className="bloomberg-small-text text-blue-600">Upcoming Reviews</div>
                    </div>
                  </div>
                  <p className="bloomberg-small-text text-blue-700">
                    Scheduled compliance reviews and audits in the next 90 days.
                  </p>
                </div>
              </div>

              {/* Monitoring Alerts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className=" text-gray-900 mb-4">Active Monitoring Alerts</h4>
                <div className="space-y-3">
                  {[
                    {
                      alert: 'High-value transaction requires manual review',
                      severity: 'medium',
                      timestamp: '2026-03-25T14:20:00Z',
                      action: 'Review Pending'
                    },
                    {
                      alert: 'Quarterly reporting deadline approaching',
                      severity: 'low',
                      timestamp: '2026-03-25T09:00:00Z',
                      action: 'Prepare Documents'
                    },
                    {
                      alert: 'New CER guidelines published',
                      severity: 'medium',
                      timestamp: '2026-03-24T16:30:00Z',
                      action: 'Review Required'
                    }
                  ].map((alert, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.severity === 'high' ? 'bg-red-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="bloomberg-small-text font-medium text-gray-900">{alert.alert}</span>
                      </div>
                      <div className="text-right bloomberg-small-text text-gray-500">
                        <div>{alert.action}</div>
                        <div>{alert.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompliancePanel;