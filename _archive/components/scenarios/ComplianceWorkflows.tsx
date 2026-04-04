/**
 * WREI Trading Platform - Compliance Workflows
 *
 * Step 1.3: Scenario Library & Templates - Regulatory Compliance Workflows
 * NSW ESC compliance validation and regulatory workflow simulations
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  CloudArrowDownIcon,
  CogIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import {
  ComplianceWorkflow,
  ComplianceStep,
  ComplianceOutput,
  ValidationResult
} from './types';
import { AudienceType } from '../audience';
import { useDemoMode } from '../../lib/demo-mode/demo-state-manager';
// import { getCERComplianceFramework } from '../../lib/demo-mode/esc-market-context'; // Removed for Phase 4

// Local stub for removed esc-market-context function
const getCERComplianceFramework = () => ({
  authority: 'Clean Energy Regulator',
  jurisdiction: 'Australia',
  frameworks: [],
  requirements: [],
});

interface ComplianceWorkflowsProps {
  workflowId?: string;
  selectedAudience?: AudienceType;
  onComplete?: (results: any) => void;
  onBack?: () => void;
}

interface WorkflowExecution {
  id: string;
  workflow: ComplianceWorkflow;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
  stepResults: Array<{
    stepId: string;
    status: 'completed' | 'failed' | 'skipped';
    duration: number;
    outputs: ComplianceOutput[];
    validationResults: ValidationResult[];
    timestamp: Date;
  }>;
  startTime: Date;
  endTime?: Date;
  overallScore: number;
}

const ComplianceWorkflows: React.FC<ComplianceWorkflowsProps> = ({
  workflowId,
  selectedAudience,
  onComplete,
  onBack
}) => {
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('cer-validation');
  const [complianceData, setComplianceData] = useState<any>(null);

  const demoMode = useDemoMode();

  // NSW ESC Compliance Workflows
  const workflows: Record<string, ComplianceWorkflow> = {
    'cer-validation': {
      id: 'cer-validation',
      name: 'CER ESC Certificate Validation',
      description: 'Complete validation of Energy Savings Certificates through Clean Energy Regulator systems',
      type: 'cer-validation',
      automation_level: 'semi-automated',
      regulatory_framework: {
        authority: 'CER',
        requirements: [
          'Certificate authenticity verification',
          'Additionality assessment',
          'Vintage year validation',
          'Double-spending prevention',
          'Audit trail documentation'
        ],
        documentation_needed: [
          'Original ESC certificate',
          'Project documentation',
          'Verification reports',
          'Chain of custody records'
        ]
      },
      steps: [
        {
          id: 'certificate-authenticity',
          name: 'Certificate Authenticity Check',
          type: 'automated-verification',
          estimated_time: 2,
          automation_status: 'automated',
          validation_criteria: [
            {
              id: 'cert-format',
              type: 'compliance-requirement',
              condition: {
                metric: 'certificate_format',
                operator: '==',
                value: 'CER_STANDARD',
                description: 'Certificate must follow CER standard format'
              },
              severity: 'error',
              message: 'Certificate format does not match CER standards'
            }
          ],
          outputs: [
            {
              type: 'validation-token',
              format: 'json',
              retention_period: 2555, // 7 years
              access_control: ['compliance_team', 'auditors']
            }
          ]
        },
        {
          id: 'registry-verification',
          name: 'CER Registry Cross-Reference',
          type: 'system-check',
          estimated_time: 3,
          automation_status: 'automated',
          validation_criteria: [
            {
              id: 'registry-match',
              type: 'compliance-requirement',
              condition: {
                metric: 'registry_status',
                operator: '==',
                value: 'VALID',
                description: 'Certificate must be found in CER registry'
              },
              severity: 'error',
              message: 'Certificate not found in CER registry'
            }
          ],
          outputs: [
            {
              type: 'validation-token',
              format: 'json',
              retention_period: 2555,
              access_control: ['compliance_team', 'auditors']
            }
          ]
        },
        {
          id: 'additionality-assessment',
          name: 'Additionality Assessment',
          type: 'automated-verification',
          estimated_time: 5,
          automation_status: 'hybrid',
          validation_criteria: [
            {
              id: 'additionality-score',
              type: 'compliance-requirement',
              condition: {
                metric: 'additionality_score',
                operator: '>=',
                value: 85,
                description: 'Additionality score must be 85% or higher'
              },
              severity: 'error',
              message: 'Additionality requirements not met'
            }
          ],
          outputs: [
            {
              type: 'report',
              format: 'pdf',
              retention_period: 2555,
              access_control: ['compliance_team', 'auditors', 'management']
            }
          ]
        },
        {
          id: 'vintage-validation',
          name: 'Vintage Year Validation',
          type: 'automated-verification',
          estimated_time: 1,
          automation_status: 'automated',
          validation_criteria: [
            {
              id: 'vintage-current',
              type: 'compliance-requirement',
              condition: {
                metric: 'vintage_year',
                operator: '>=',
                value: 2024,
                description: 'Vintage year must be 2024 or later'
              },
              severity: 'error',
              message: 'Certificate vintage year is too old'
            }
          ],
          outputs: [
            {
              type: 'validation-token',
              format: 'json',
              retention_period: 2555,
              access_control: ['compliance_team']
            }
          ]
        },
        {
          id: 'double-spend-check',
          name: 'Double-Spending Prevention',
          type: 'system-check',
          estimated_time: 2,
          automation_status: 'automated',
          validation_criteria: [
            {
              id: 'unique-usage',
              type: 'compliance-requirement',
              condition: {
                metric: 'previous_usage',
                operator: '==',
                value: 0,
                description: 'Certificate must not have been previously used'
              },
              severity: 'error',
              message: 'Certificate has been previously used'
            }
          ],
          outputs: [
            {
              type: 'audit-entry',
              format: 'json',
              retention_period: 3650, // Permanent
              access_control: ['system', 'auditors']
            }
          ]
        },
        {
          id: 'final-approval',
          name: 'Final Compliance Approval',
          type: 'manual-review',
          estimated_time: 8,
          automation_status: 'manual',
          validation_criteria: [
            {
              id: 'manager-approval',
              type: 'compliance-requirement',
              condition: {
                metric: 'approval_status',
                operator: '==',
                value: 'APPROVED',
                description: 'Compliance manager approval required'
              },
              severity: 'error',
              message: 'Compliance manager approval pending'
            }
          ],
          outputs: [
            {
              type: 'certificate',
              format: 'pdf',
              retention_period: 2555,
              access_control: ['all_stakeholders']
            },
            {
              type: 'audit-entry',
              format: 'json',
              retention_period: 3650,
              access_control: ['auditors', 'compliance_team']
            }
          ]
        }
      ]
    },

    'afsl-compliance': {
      id: 'afsl-compliance',
      name: 'AFSL Compliance Validation',
      description: 'Australian Financial Services License compliance check for carbon credit trading',
      type: 'afsl-compliance',
      automation_level: 'semi-automated',
      regulatory_framework: {
        authority: 'ASIC',
        requirements: [
          'Client classification verification',
          'Disclosure document provision',
          'Risk assessment completion',
          'Record keeping compliance'
        ],
        documentation_needed: [
          'Client agreements',
          'Risk assessments',
          'Disclosure statements',
          'Trading records'
        ]
      },
      steps: [
        {
          id: 'client-classification',
          name: 'Client Classification Check',
          type: 'automated-verification',
          estimated_time: 3,
          automation_status: 'automated',
          validation_criteria: [],
          outputs: []
        },
        {
          id: 'disclosure-verification',
          name: 'Disclosure Document Verification',
          type: 'document-validation',
          estimated_time: 5,
          automation_status: 'hybrid',
          validation_criteria: [],
          outputs: []
        },
        {
          id: 'risk-assessment',
          name: 'Client Risk Assessment',
          type: 'automated-verification',
          estimated_time: 4,
          automation_status: 'automated',
          validation_criteria: [],
          outputs: []
        }
      ]
    },

    'aml-ctf-check': {
      id: 'aml-ctf-check',
      name: 'AML/CTF Compliance Check',
      description: 'Anti-Money Laundering and Counter-Terrorism Financing compliance validation',
      type: 'aml-ctf-check',
      automation_level: 'fully-automated',
      regulatory_framework: {
        authority: 'AUSTRAC',
        requirements: [
          'Customer due diligence',
          'Suspicious matter reporting',
          'Transaction monitoring',
          'Record keeping'
        ],
        documentation_needed: [
          'Customer identification',
          'Source of funds documentation',
          'Transaction records',
          'SMR reports (if applicable)'
        ]
      },
      steps: [
        {
          id: 'customer-screening',
          name: 'Customer Screening',
          type: 'automated-verification',
          estimated_time: 2,
          automation_status: 'automated',
          validation_criteria: [],
          outputs: []
        },
        {
          id: 'transaction-monitoring',
          name: 'Transaction Monitoring',
          type: 'system-check',
          estimated_time: 3,
          automation_status: 'automated',
          validation_criteria: [],
          outputs: []
        },
        {
          id: 'risk-scoring',
          name: 'Risk Scoring Assessment',
          type: 'automated-verification',
          estimated_time: 1,
          automation_status: 'automated',
          validation_criteria: [],
          outputs: []
        }
      ]
    }
  };

  useEffect(() => {
    const framework = getCERComplianceFramework();
    setComplianceData(framework);
  }, []);

  const startWorkflow = (workflowId: string) => {
    const workflow = workflows[workflowId];
    if (!workflow) return;

    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflow,
      status: 'running',
      currentStep: 0,
      stepResults: [],
      startTime: new Date(),
      overallScore: 0
    };

    setCurrentExecution(execution);
    setIsRunning(true);

    demoMode.trackInteraction({
      type: 'click',
      data: { action: 'compliance_workflow_start', workflow_id: workflowId, audience: selectedAudience }
    });

    // Execute workflow steps
    executeWorkflowSteps(execution);
  };

  const executeWorkflowSteps = async (execution: WorkflowExecution) => {
    for (let i = 0; i < execution.workflow.steps.length; i++) {
      if (!isRunning) break;

      const step = execution.workflow.steps[i];

      // Update current step
      setCurrentExecution(prev => prev ? { ...prev, currentStep: i + 1 } : null);

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, step.estimated_time * 200)); // Accelerated

      // Generate step results
      const stepResult = generateStepResult(step) as {
        stepId: string;
        status: "failed" | "completed" | "skipped";
        duration: number;
        outputs: any[];
        validationResults: any[];
        timestamp: Date;
      };

      // Update execution with step result
      setCurrentExecution(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stepResults: [...prev.stepResults, stepResult]
        };
      });

      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Complete workflow
    completeWorkflow(execution);
  };

  const generateStepResult = (step: ComplianceStep) => {
    const success = Math.random() > 0.1; // 90% success rate
    const duration = step.estimated_time + Math.random() * 2;

    const validationResults: ValidationResult[] = step.validation_criteria.map(criteria => ({
      ruleId: criteria.id,
      status: success ? 'passed' : (Math.random() > 0.5 ? 'warning' : 'failed'),
      message: success ? 'Validation passed successfully' : criteria.message,
      timestamp: new Date(),
      details: generateValidationDetails(step, success)
    }));

    return {
      stepId: step.id,
      status: success ? 'completed' : 'failed' as const,
      duration,
      outputs: step.outputs,
      validationResults,
      timestamp: new Date()
    };
  };

  const generateValidationDetails = (step: ComplianceStep, success: boolean) => {
    switch (step.id) {
      case 'certificate-authenticity':
        return {
          certificate_id: 'ESC-2025-001234',
          format_version: '2.1',
          digital_signature: success ? 'VALID' : 'INVALID',
          checksum_verification: success ? 'PASSED' : 'FAILED'
        };
      case 'registry-verification':
        return {
          registry_lookup: success ? 'FOUND' : 'NOT_FOUND',
          certificate_status: success ? 'ACTIVE' : 'REVOKED',
          issue_date: '2025-03-15',
          registry_id: 'CER-REG-5678'
        };
      case 'additionality-assessment':
        return {
          additionality_score: success ? 92 : 78,
          baseline_assessment: success ? 'PASSED' : 'FAILED',
          project_type: 'Commercial Building Energy Efficiency',
          methodology: 'ESC Method 1.2'
        };
      case 'vintage-validation':
        return {
          vintage_year: 2025,
          compliance_period: 'Q1-2025',
          age_validation: success ? 'CURRENT' : 'EXPIRED'
        };
      case 'double-spend-check':
        return {
          blockchain_hash: success ? '0xabc123def456' : null,
          previous_transactions: success ? 0 : 1,
          uniqueness_verified: success
        };
      default:
        return {};
    }
  };

  const completeWorkflow = (execution: WorkflowExecution) => {
    const successfulSteps = execution.stepResults.filter(r => r.status === 'completed').length;
    const overallScore = (successfulSteps / execution.workflow.steps.length) * 100;

    setCurrentExecution(prev => prev ? {
      ...prev,
      status: overallScore >= 80 ? 'completed' as const : 'failed' as const,
      endTime: new Date(),
      overallScore
    } : null);

    setIsRunning(false);

    demoMode.trackInteraction({
      type: 'step_complete',
      data: {
        workflow_id: execution.workflow.id,
        overall_score: overallScore,
        audience: selectedAudience
      }
    });

    if (onComplete) {
      onComplete({
        score: overallScore,
        duration: (new Date().getTime() - execution.startTime.getTime()) / 1000,
        steps_completed: successfulSteps,
        total_steps: execution.workflow.steps.length
      });
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="bloomberg-page-heading text-gray-900">Compliance Workflows</h1>
            <p className="text-gray-600 mt-1">
              NSW ESC regulatory compliance validation and workflow automation
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back
            </button>
          )}
        </div>

        {/* Compliance Context */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h3 className=" text-gray-900 mb-3">Regulatory Framework</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bloomberg-large-metric text-green-600">98%</div>
              <div className="bloomberg-small-text text-gray-600">CER Compliance Score</div>
            </div>
            <div className="text-center">
              <div className="bloomberg-large-metric text-blue-600">AFSL 246896</div>
              <div className="bloomberg-small-text text-gray-600">License Status: Active</div>
            </div>
            <div className="text-center">
              <div className="bloomberg-large-metric text-purple-600">28s</div>
              <div className="bloomberg-small-text text-gray-600">Avg Validation Time</div>
            </div>
            <div className="text-center">
              <div className="bloomberg-large-metric text-orange-600">96%</div>
              <div className="bloomberg-small-text text-gray-600">Audit Readiness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Selection or Execution */}
      {!currentExecution ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(workflows).map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className=" text-gray-900">{workflow.name}</h3>
                  <p className="bloomberg-small-text text-gray-600">{workflow.regulatory_framework.authority}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{workflow.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between bloomberg-small-text">
                  <span className="text-gray-600">Steps:</span>
                  <span className="font-medium">{workflow.steps.length}</span>
                </div>
                <div className="flex justify-between bloomberg-small-text">
                  <span className="text-gray-600">Automation:</span>
                  <span className={`font-medium ${
                    workflow.automation_level === 'fully-automated' ? 'text-green-600' :
                    workflow.automation_level === 'semi-automated' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {workflow.automation_level.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between bloomberg-small-text">
                  <span className="text-gray-600">Est. Time:</span>
                  <span className="font-medium">
                    {workflow.steps.reduce((sum, step) => sum + step.estimated_time, 0)} min
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="font-medium text-gray-900 bloomberg-small-text">Key Requirements:</h4>
                <ul className="bloomberg-section-label text-gray-600 space-y-1">
                  {workflow.regulatory_framework.requirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => startWorkflow(workflow.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlayIcon className="w-4 h-4" />
                Start Workflow
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Workflow Execution View */
        <div className="space-y-6">
          {/* Execution Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="bloomberg-metric-value text-gray-900">
                  {currentExecution.workflow.name}
                </h2>
                <p className="text-gray-600">
                  {currentExecution.workflow.regulatory_framework.authority} Compliance Workflow
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 bloomberg-small-text font-medium rounded-full ${
                  currentExecution.status === 'completed' ? 'bg-green-100 text-green-800' :
                  currentExecution.status === 'failed' ? 'bg-red-100 text-red-800' :
                  currentExecution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentExecution.status.charAt(0).toUpperCase() + currentExecution.status.slice(1)}
                </span>
                {currentExecution.status === 'completed' && (
                  <div className="text-right">
                    <div className="bloomberg-card-title text-green-600">
                      {currentExecution.overallScore.toFixed(0)}%
                    </div>
                    <div className="bloomberg-section-label text-gray-600">Overall Score</div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between bloomberg-small-text text-gray-600 mb-2">
                <span>Progress</span>
                <span>{currentExecution.currentStep}/{currentExecution.workflow.steps.length} steps</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    currentExecution.status === 'completed' ? 'bg-green-600' :
                    currentExecution.status === 'failed' ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${(currentExecution.currentStep / currentExecution.workflow.steps.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className=" text-gray-900 mb-4">Workflow Steps</h3>
            <div className="space-y-4">
              {currentExecution.workflow.steps.map((step, index) => {
                const stepResult = currentExecution.stepResults.find(r => r.stepId === step.id);
                const isCurrentStep = index + 1 === currentExecution.currentStep && currentExecution.status === 'running';
                const isCompleted = stepResult !== undefined;

                return (
                  <div
                    key={step.id}
                    className={`border rounded-lg p-4 ${
                      isCurrentStep ? 'border-blue-300 bg-blue-50' :
                      isCompleted ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStepStatusIcon(stepResult?.status || 'pending')}
                        <div>
                          <h4 className="font-medium text-gray-900">{step.name}</h4>
                          <p className="bloomberg-small-text text-gray-600">{step.type.replace('-', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bloomberg-small-text text-gray-600">
                          {stepResult ? `${stepResult.duration.toFixed(1)}s` : `~${step.estimated_time}m`}
                        </div>
                        <div className={`bloomberg-section-label px-2 py-1 rounded-full ${
                          step.automation_status === 'automated' ? 'bg-green-100 text-green-800' :
                          step.automation_status === 'hybrid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {step.automation_status}
                        </div>
                      </div>
                    </div>

                    {/* Step Results */}
                    {stepResult && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-3">Validation Results</h5>
                        <div className="space-y-2">
                          {stepResult.validationResults.map((result, resultIndex) => (
                            <div
                              key={resultIndex}
                              className={`flex items-center justify-between p-2 rounded ${getValidationStatusColor(result.status)}`}
                            >
                              <span className="bloomberg-small-text font-medium">{result.message}</span>
                              <span className="bloomberg-section-label">
                                {result.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Output Documents */}
                        {stepResult.outputs.length > 0 && (
                          <div className="mt-3">
                            <h6 className="bloomberg-small-text font-medium text-gray-700 mb-2">Generated Documents</h6>
                            <div className="flex flex-wrap gap-2">
                              {stepResult.outputs.map((output, outputIndex) => (
                                <div
                                  key={outputIndex}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded bloomberg-section-label text-gray-700"
                                >
                                  <DocumentTextIcon className="w-3 h-3" />
                                  {output.type}.{output.format}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentExecution(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              New Workflow
            </button>
            {currentExecution.status === 'completed' && (
              <>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <CloudArrowDownIcon className="w-4 h-4" />
                  Export Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <EyeIcon className="w-4 h-4" />
                  View Audit Trail
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceWorkflows;