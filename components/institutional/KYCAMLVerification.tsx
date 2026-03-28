'use client';

/**
 * KYC/AML Verification Component
 * Step 3: Customer Due Diligence and Anti-Money Laundering Assessment
 */

import { useState, useEffect } from 'react';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';
import { validateAMLRequirements } from '@/lib/regulatory-compliance';

interface KYCAMLVerificationProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  isLoading: boolean;
  errors: string[];
  warnings: string[];
  onboardingState: InstitutionalOnboardingState;
}

export const KYCAMLVerification: React.FC<KYCAMLVerificationProps> = ({
  onComplete,
  onBack,
  isLoading,
  errors,
  warnings,
  onboardingState,
}) => {
  const [amlParams, setAmlParams] = useState({
    clientType: 'corporate' as const,
    transactionValue: 10000000, // Default A$10M
    jurisdictions: [onboardingState.institutionalIdentity?.jurisdiction || 'australia'],
    businessPurpose: 'carbon_credit_trading',
    pepStatus: false,
    sanctionsScreening: {
      cleared: false,
      riskRating: 'medium' as const,
      lastUpdated: new Date().toISOString().split('T')[0],
    },
  });

  const [amlResult, setAmlResult] = useState<any>(null);
  const [documentationStatus, setDocumentationStatus] = useState({
    corporateStructure: false,
    beneficialOwnership: false,
    sourceOfFunds: false,
    businessPurpose: true, // Pre-checked as it's carbon credit trading
  });

  const [isAssessing, setIsAssessing] = useState(false);

  useEffect(() => {
    performAMLAssessment();
  }, [amlParams]);

  const performAMLAssessment = async () => {
    setIsAssessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const result = validateAMLRequirements(amlParams);
      setAmlResult(result);
    } catch (error) {
      console.error('AML assessment error:', error);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      kycRequired: true,
      kycCompleted: Object.values(documentationStatus).every(Boolean),
      amlRiskRating: amlResult?.riskRating || 'medium',
      eddRequired: amlResult?.eddRequired || false,
      sanctionsScreeningPassed: amlParams.sanctionsScreening.cleared,
      pepStatus: amlParams.pepStatus,
      documentation: documentationStatus,
      assessmentDetails: {
        params: amlParams,
        result: amlResult,
      },
    };

    onComplete(data);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `A$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `A$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `A$${amount.toLocaleString()}`;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="bloomberg-large-metric text-slate-900 mb-2">
          KYC/AML Verification
        </h2>
        <p className="text-slate-600">
          Complete customer due diligence and anti-money laundering assessment as required under the AML/CTF Act 2006.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Transaction Details */}
        <div>
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Transaction Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="transactionValue" className="block bloomberg-small-text font-medium text-slate-700 mb-2">
                Expected Transaction Value *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">A$</span>
                <input
                  type="number"
                  id="transactionValue"
                  value={amlParams.transactionValue}
                  onChange={(e) => setAmlParams(prev => ({ ...prev, transactionValue: parseInt(e.target.value) || 0 }))}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  step="1000000"
                  min="0"
                />
              </div>
              <p className="mt-1 bloomberg-small-text text-slate-500">
                Initial transaction size: {formatCurrency(amlParams.transactionValue)}
              </p>
            </div>

            <div>
              <label className="block bloomberg-small-text font-medium text-slate-700 mb-2">
                Business Purpose
              </label>
              <select
                value={amlParams.businessPurpose}
                onChange={(e) => setAmlParams(prev => ({ ...prev, businessPurpose: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="carbon_credit_trading">Carbon Credit Trading</option>
                <option value="asset_tokenization">Asset Tokenization</option>
                <option value="portfolio_diversification">Portfolio Diversification</option>
                <option value="yield_generation">Yield Generation</option>
                <option value="esg_investment">ESG Investment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Risk Assessment</h3>
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={amlParams.pepStatus}
                onChange={(e) => setAmlParams(prev => ({ ...prev, pepStatus: e.target.checked }))}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="bloomberg-small-text font-medium text-slate-700">
                  Politically Exposed Person (PEP) Status
                </span>
                <p className="bloomberg-small-text text-slate-500">
                  Entity or beneficial owners hold prominent public positions or have significant political exposure
                </p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={amlParams.sanctionsScreening.cleared}
                onChange={(e) => setAmlParams(prev => ({
                  ...prev,
                  sanctionsScreening: { ...prev.sanctionsScreening, cleared: e.target.checked }
                }))}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="bloomberg-small-text font-medium text-slate-700">
                  Sanctions Screening Cleared
                </span>
                <p className="bloomberg-small-text text-slate-500">
                  Entity and beneficial owners cleared against OFAC, UN, EU, and Australian sanctions lists
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* AML Assessment Result */}
        {amlResult && (
          <div className={`p-6 rounded-lg border-2 ${
            amlResult.riskRating === 'high' ? 'bg-red-50 border-red-200' :
            amlResult.riskRating === 'medium' ? 'bg-amber-50 border-amber-200' :
            'bg-green-50 border-green-200'
          }`}>
            <h3 className="bloomberg-card-title text-slate-900 mb-3">AML Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="bloomberg-small-text text-slate-600">Risk Rating</p>
                <p className={`font-medium capitalize ${
                  amlResult.riskRating === 'high' ? 'text-red-800' :
                  amlResult.riskRating === 'medium' ? 'text-amber-800' :
                  'text-green-800'
                }`}>
                  {amlResult.riskRating}
                </p>
              </div>
              <div>
                <p className="bloomberg-small-text text-slate-600">EDD Required</p>
                <p className={`font-medium ${amlResult.eddRequired ? 'text-red-800' : 'text-green-800'}`}>
                  {amlResult.eddRequired ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="bloomberg-small-text text-slate-600">Monitoring Level</p>
                <p className="font-medium text-slate-800 capitalize">{amlResult.monitoringLevel}</p>
              </div>
            </div>

            {amlResult.restrictionFlags.length > 0 && (
              <div>
                <p className="bloomberg-small-text font-medium text-slate-800 mb-2">Risk Factors:</p>
                <ul className="bloomberg-small-text text-slate-600 space-y-1">
                  {amlResult.restrictionFlags.map((flag: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Documentation Checklist */}
        <div>
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Required Documentation</h3>
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="space-y-4">
              {Object.entries({
                corporateStructure: 'Corporate structure diagram and ownership details',
                beneficialOwnership: 'Beneficial ownership declarations (25%+ ownership)',
                sourceOfFunds: 'Source of funds documentation and bank statements',
                businessPurpose: 'Business purpose and nature of trading activities',
              }).map(([key, label]) => (
                <label key={key} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={documentationStatus[key as keyof typeof documentationStatus]}
                    onChange={(e) => setDocumentationStatus(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <span className="bloomberg-small-text font-medium text-slate-700">{label}</span>
                    {key === 'businessPurpose' && (
                      <p className="bloomberg-small-text text-slate-500">Pre-completed based on platform purpose</p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="bloomberg-small-text font-medium text-slate-700">
                  Documentation Completion
                </span>
                <span className={`bloomberg-small-text font-medium ${
                  Object.values(documentationStatus).every(Boolean) ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {Object.values(documentationStatus).filter(Boolean).length} of {Object.keys(documentationStatus).length} complete
                </span>
              </div>
            </div>
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
            disabled={isLoading || !Object.values(documentationStatus).every(Boolean) || !amlParams.sanctionsScreening.cleared}
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white px-8 py-2 rounded-lg transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Continue to AFSL Review →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};