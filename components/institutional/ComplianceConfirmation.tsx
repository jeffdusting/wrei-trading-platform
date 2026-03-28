'use client';

/**
 * Compliance Confirmation Component
 * Step 6: Final compliance review and onboarding completion
 */

import { useState, useEffect } from 'react';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';
import { generateComplianceReport, generateDetailedComplianceReport, getComplianceAlerts } from '@/lib/regulatory-compliance';

interface ComplianceConfirmationProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  isLoading: boolean;
  errors: string[];
  warnings: string[];
  onboardingState: InstitutionalOnboardingState;
}

export const ComplianceConfirmation: React.FC<ComplianceConfirmationProps> = ({
  onComplete,
  onBack,
  isLoading,
  errors,
  warnings,
  onboardingState,
}) => {
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [complianceAlerts, setComplianceAlerts] = useState<any[]>([]);
  const [acceptanceConfirmed, setAcceptanceConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [riskDisclosureAccepted, setRiskDisclosureAccepted] = useState(false);
  const [monitoringConsent, setMonitoringConsent] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    generateFinalComplianceReport();
  }, []);

  const generateFinalComplianceReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate compliance report based on onboarding data
      const reportParams = {
        entityType: onboardingState.institutionalIdentity?.entityType || 'fund_manager',
        investorClassification: onboardingState.investorClassification?.classification || 'wholesale',
        amlRiskRating: onboardingState.kycAmlStatus?.amlRiskRating || 'medium',
        afslStatus: onboardingState.afslCompliance?.complianceStatus || 'exemption_claimed',
        jurisdiction: onboardingState.institutionalIdentity?.jurisdiction || 'australia',
      };

      const report = generateDetailedComplianceReport({
        platform: 'WREI',
        frameworks: ['AUSTRAC', 'ASIC', 'APRA'],
        jurisdictions: [reportParams.jurisdiction || 'australia'],
        scope: 'comprehensive',
        assessmentDate: new Date().toISOString()
      });
      setComplianceReport(report);

      // Get compliance alerts
      const alerts = getComplianceAlerts();
      setComplianceAlerts(alerts);
    } catch (error) {
      console.error('Error generating compliance report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptanceConfirmed || !termsAccepted || !riskDisclosureAccepted || !monitoringConsent) {
      return;
    }

    const data = {
      complianceReportGenerated: true,
      allRequirementsMet: complianceReport?.overallStatus === 'compliant',
      riskAssessmentCompleted: true,
      clientAcceptanceStatus: 'approved' as const,
      restrictedActivities: complianceReport?.restrictions || [],
      monitoringRequirements: complianceReport?.monitoringRequirements || ['annual_review'],
      complianceReport,
      complianceAlerts,
      confirmations: {
        acceptanceConfirmed,
        termsAccepted,
        riskDisclosureAccepted,
        monitoringConsent,
      },
      completedAt: new Date().toISOString(),
    };

    onComplete(data);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `A$${(amount / 1000000).toFixed(1)}M`;
    } else {
      return `A$${amount.toLocaleString()}`;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="bloomberg-large-metric text-slate-900 mb-2">
          Compliance Confirmation
        </h2>
        <p className="text-slate-600">
          Review your complete onboarding summary and confirm compliance with all regulatory requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Global Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="bloomberg-small-text font-medium text-red-800">Please address the following issues:</h3>
                <div className="mt-2 bloomberg-small-text text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Summary */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Onboarding Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="bloomberg-small-text font-medium text-slate-900 mb-2">Entity Information</h4>
              <dl className="bloomberg-small-text text-slate-600 space-y-1">
                <div>
                  <dt className="inline font-medium">Name:</dt>
                  <dd className="inline ml-2">{onboardingState.institutionalIdentity?.entityName}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Type:</dt>
                  <dd className="inline ml-2 capitalize">
                    {onboardingState.institutionalIdentity?.entityType?.replace('_', ' ')}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">AUM:</dt>
                  <dd className="inline ml-2">
                    {formatCurrency(onboardingState.institutionalIdentity?.aum || 0)}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="bloomberg-small-text font-medium text-slate-900 mb-2">Regulatory Classification</h4>
              <dl className="bloomberg-small-text text-slate-600 space-y-1">
                <div>
                  <dt className="inline font-medium">Classification:</dt>
                  <dd className="inline ml-2 capitalize">
                    {onboardingState.investorClassification?.classification}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">AML Risk:</dt>
                  <dd className="inline ml-2 capitalize">
                    {onboardingState.kycAmlStatus?.amlRiskRating}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">AFSL Status:</dt>
                  <dd className="inline ml-2">
                    {onboardingState.afslCompliance?.complianceStatus === 'exemption_claimed' ? 'Exempt' : 'Licensed'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="bloomberg-small-text font-medium text-slate-900 mb-2">Investment Preferences</h4>
              <dl className="bloomberg-small-text text-slate-600 space-y-1">
                <div>
                  <dt className="inline font-medium">Primary Token:</dt>
                  <dd className="inline ml-2 capitalize">
                    {onboardingState.investmentPreferences?.primaryTokenType?.replace('_', ' ')}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">Yield Target:</dt>
                  <dd className="inline ml-2">
                    {onboardingState.investmentPreferences?.yieldRequirement}% p.a.
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">Risk Tolerance:</dt>
                  <dd className="inline ml-2 capitalize">
                    {onboardingState.investmentPreferences?.riskTolerance}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Compliance Report */}
        {isGeneratingReport ? (
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="bloomberg-card-title text-slate-700">Generating Compliance Report...</span>
            </div>
            <p className="bloomberg-small-text text-slate-500">
              Consolidating regulatory assessments and generating final compliance documentation.
            </p>
          </div>
        ) : complianceReport ? (
          <div className={`border-2 rounded-lg p-6 ${
            complianceReport.overallStatus === 'compliant' ? 'bg-green-50 border-green-200' :
            complianceReport.overallStatus === 'conditional' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                complianceReport.overallStatus === 'compliant' ? 'bg-green-500' :
                complianceReport.overallStatus === 'conditional' ? 'bg-amber-500' :
                'bg-red-500'
              }`}>
                {complianceReport.overallStatus === 'compliant' ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`bloomberg-card-title ${
                  complianceReport.overallStatus === 'compliant' ? 'text-green-800' :
                  complianceReport.overallStatus === 'conditional' ? 'text-amber-800' :
                  'text-red-800'
                }`}>
                  Compliance Assessment: {complianceReport.overallStatus.toUpperCase()}
                </h3>
                <p className="bloomberg-small-text text-slate-600">
                  Report generated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {complianceReport.summary && (
              <div className="mb-4">
                <p className="bloomberg-small-text text-slate-700">{complianceReport.summary}</p>
              </div>
            )}

            {complianceReport.requirements && complianceReport.requirements.length > 0 && (
              <div className="mb-4">
                <h4 className="bloomberg-small-text font-medium text-slate-800 mb-2">Compliance Requirements:</h4>
                <ul className="bloomberg-small-text text-slate-600 space-y-1">
                  {complianceReport.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {complianceReport.restrictions && complianceReport.restrictions.length > 0 && (
              <div className="mb-4">
                <h4 className="bloomberg-small-text font-medium text-slate-800 mb-2">Investment Restrictions:</h4>
                <ul className="bloomberg-small-text text-slate-600 space-y-1">
                  {complianceReport.restrictions.map((restriction: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {restriction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* Active Compliance Alerts */}
        {complianceAlerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="bloomberg-small-text font-medium text-amber-800 mb-2">Active Compliance Alerts</h3>
            <ul className="bloomberg-small-text text-amber-700 space-y-1">
              {complianceAlerts.slice(0, 3).map((alert, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {alert.description || alert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Final Confirmations */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Final Confirmations</h3>
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={acceptanceConfirmed}
                onChange={(e) => setAcceptanceConfirmed(e.target.checked)}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="bloomberg-small-text font-medium text-slate-700">
                  I confirm the accuracy of all provided information
                </span>
                <p className="bloomberg-small-text text-slate-500">
                  All entity information, financial details, and investment preferences are accurate and complete
                </p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="bloomberg-small-text font-medium text-slate-700">
                  I accept the Terms and Conditions
                </span>
                <p className="bloomberg-small-text text-slate-500">
                  <a href="#" className="text-sky-600 hover:text-sky-800">Terms and Conditions</a> including
                  investment terms, fee structure, and platform usage guidelines
                </p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={riskDisclosureAccepted}
                onChange={(e) => setRiskDisclosureAccepted(e.target.checked)}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="bloomberg-small-text font-medium text-slate-700">
                  I acknowledge the Risk Disclosure Statement
                </span>
                <p className="bloomberg-small-text text-slate-500">
                  I understand the risks associated with carbon credit trading and tokenized asset investments
                </p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={monitoringConsent}
                onChange={(e) => setMonitoringConsent(e.target.checked)}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="bloomberg-small-text font-medium text-slate-700">
                  I consent to ongoing compliance monitoring
                </span>
                <p className="bloomberg-small-text text-slate-500">
                  Regular reviews, transaction monitoring, and regulatory reporting as required by law
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            ← Previous
          </button>
          <button
            type="submit"
            disabled={
              isLoading ||
              !acceptanceConfirmed ||
              !termsAccepted ||
              !riskDisclosureAccepted ||
              !monitoringConsent ||
              !complianceReport
            }
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-8 py-2 rounded-lg transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Completing...
              </>
            ) : (
              <>
                Complete Onboarding
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};