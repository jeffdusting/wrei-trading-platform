'use client';

/**
 * AFSL Compliance Review Component
 * Step 4: Australian Financial Services License Requirements and Exemptions
 */

import { useState, useEffect } from 'react';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';
import { checkAFSLCompliance } from '@/lib/regulatory-compliance';

interface AFSLComplianceReviewProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  isLoading: boolean;
  errors: string[];
  warnings: string[];
  onboardingState: InstitutionalOnboardingState;
}

export const AFSLComplianceReview: React.FC<AFSLComplianceReviewProps> = ({
  onComplete,
  onBack,
  isLoading,
  errors,
  warnings,
  onboardingState,
}) => {
  const [complianceParams, setComplianceParams] = useState({
    offeringStructure: {
      retailOffering: false,
      wholesaleOnly: true,
      sophisticatedInvestorsOnly: true,
      professionalInvestorsOnly: false,
    },
    licenseDetails: {
      afslNumber: onboardingState.institutionalIdentity?.regulatoryLicense || undefined,
      authorisedRepresentative: false,
      exemptionsClaimed: ['s708_wholesale'] as string[],
    },
    investorBase: (onboardingState.investorClassification?.classification || 'wholesale') as 'retail' | 'wholesale' | 'professional' | 'sophisticated',
    financialServices: ['dealing'] as string[],
    jurisdiction: 'australia' as const,
  });

  const [complianceResult, setComplianceResult] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  useEffect(() => {
    performAFSLAssessment();
  }, [complianceParams]);

  const performAFSLAssessment = async () => {
    setIsAssessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const result = checkAFSLCompliance(complianceParams);
      setComplianceResult(result);
    } catch (error) {
      console.error('AFSL assessment error:', error);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      afslRequired: complianceResult?.licenseRequired || false,
      exemptionType: complianceResult?.exemptionType || 's708',
      complianceStatus: complianceResult?.complianceStatus || 'exemption_claimed',
      restrictionNotes: complianceResult?.restrictionNotes || [],
      assessmentDetails: {
        params: complianceParams,
        result: complianceResult,
      },
    };

    onComplete(data);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          AFSL Compliance Review
        </h2>
        <p className="text-slate-600">
          Review Australian Financial Services License requirements and available exemptions for your investment structure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Current Classification */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Current Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Investor Classification</p>
              <p className="font-medium text-slate-900 capitalize">
                {onboardingState.investorClassification?.classification || 'Not determined'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Existing License</p>
              <p className="font-medium text-slate-900">
                {complianceParams.licenseDetails.afslNumber || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Offering Structure */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Investment Offering Structure</h3>
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={complianceParams.offeringStructure.wholesaleOnly}
                onChange={(e) => setComplianceParams(prev => ({
                  ...prev,
                  offeringStructure: { ...prev.offeringStructure, wholesaleOnly: e.target.checked }
                }))}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Wholesale Investors Only</span>
                <p className="text-sm text-slate-500">Restrict offerings to wholesale investors (s708 exemption)</p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={complianceParams.offeringStructure.sophisticatedInvestorsOnly}
                onChange={(e) => setComplianceParams(prev => ({
                  ...prev,
                  offeringStructure: { ...prev.offeringStructure, sophisticatedInvestorsOnly: e.target.checked }
                }))}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Sophisticated Investors Only</span>
                <p className="text-sm text-slate-500">Further restrict to sophisticated investors</p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={complianceParams.offeringStructure.retailOffering}
                onChange={(e) => setComplianceParams(prev => ({
                  ...prev,
                  offeringStructure: { ...prev.offeringStructure, retailOffering: e.target.checked }
                }))}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">Include Retail Investors</span>
                <p className="text-sm text-slate-500">Enable access for retail investors (requires AFSL)</p>
              </div>
            </label>
          </div>
        </div>

        {/* License Details */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">License Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="afslNumber" className="block text-sm font-medium text-slate-700 mb-2">
                AFSL Number (if applicable)
              </label>
              <input
                type="text"
                id="afslNumber"
                value={complianceParams.licenseDetails.afslNumber || ''}
                onChange={(e) => setComplianceParams(prev => ({
                  ...prev,
                  licenseDetails: { ...prev.licenseDetails, afslNumber: e.target.value || undefined }
                }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="e.g., 123456"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={complianceParams.licenseDetails.authorisedRepresentative}
                  onChange={(e) => setComplianceParams(prev => ({
                    ...prev,
                    licenseDetails: { ...prev.licenseDetails, authorisedRepresentative: e.target.checked }
                  }))}
                  className="mr-2 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Authorised Representative of AFSL holder
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Compliance Assessment Result */}
        {complianceResult && (
          <div className={`p-6 rounded-lg border-2 ${
            complianceResult.complianceStatus === 'license_required' ? 'bg-amber-50 border-amber-200' :
            complianceResult.complianceStatus === 'compliant' ? 'bg-green-50 border-green-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">AFSL Compliance Assessment</h3>
              {isAssessing && (
                <div className="flex items-center text-sky-600">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assessing...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-600">Compliance Status</p>
                <p className={`font-medium capitalize ${
                  complianceResult.complianceStatus === 'license_required' ? 'text-amber-800' :
                  complianceResult.complianceStatus === 'compliant' ? 'text-green-800' :
                  'text-blue-800'
                }`}>
                  {complianceResult.complianceStatus.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">License Required</p>
                <p className={`font-medium ${complianceResult.licenseRequired ? 'text-amber-800' : 'text-green-800'}`}>
                  {complianceResult.licenseRequired ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Exemption Available</p>
                <p className="font-medium text-slate-800">
                  {complianceResult.exemptionType || 'None'}
                </p>
              </div>
            </div>

            {complianceResult.restrictionNotes && complianceResult.restrictionNotes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-800 mb-2">Compliance Notes:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {complianceResult.restrictionNotes.map((note: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-sky-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {complianceResult.complianceRequirements && complianceResult.complianceRequirements.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-800 mb-2">Ongoing Requirements:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {complianceResult.complianceRequirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 text-sky-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
            disabled={isLoading || !complianceResult}
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
              'Continue to Preferences →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};