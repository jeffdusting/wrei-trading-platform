'use client';

/**
 * Investor Classification Assessment Component
 * Step 2: Determine wholesale, professional, or sophisticated investor status
 */

import { useState, useEffect } from 'react';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';
import { validateInvestorClassification } from '@/lib/regulatory-compliance';
import type { InvestorClassification } from '@/lib/types';

interface InvestorClassificationAssessmentProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  isLoading: boolean;
  errors: string[];
  warnings: string[];
  onboardingState: InstitutionalOnboardingState;
}

interface ClassificationParams {
  entityType: 'fund_manager' | 'family_office' | 'pension_fund' | 'sovereign_wealth' | 'insurance_company' | 'endowment';
  netAssets: number;
  grossIncome: number;
  aum: number;
  professionalExperience: boolean;
  jurisdictions: string[];
}

export const InvestorClassificationAssessment: React.FC<InvestorClassificationAssessmentProps> = ({
  onComplete,
  onBack,
  isLoading,
  errors,
  warnings,
  onboardingState,
}) => {
  const [classificationParams, setClassificationParams] = useState<ClassificationParams>(() => ({
    entityType: onboardingState.institutionalIdentity?.entityType || 'fund_manager',
    netAssets: onboardingState.institutionalIdentity?.aum || 0,
    grossIncome: 0,
    aum: onboardingState.institutionalIdentity?.aum || 0,
    professionalExperience: true,
    jurisdictions: [onboardingState.institutionalIdentity?.jurisdiction || 'australia'],
  }));

  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Run classification assessment when params change
  useEffect(() => {
    if (classificationParams.netAssets > 0) {
      performClassificationAssessment();
    }
  }, [classificationParams]);

  const performClassificationAssessment = async () => {
    setIsAssessing(true);
    try {
      // Simulate brief processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = validateInvestorClassification(classificationParams);
      setClassificationResult(result);
    } catch (error) {
      console.error('Classification assessment error:', error);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleFieldChange = (field: keyof ClassificationParams, value: any) => {
    setClassificationParams(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const handleFieldBlur = (field: keyof ClassificationParams) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  // Field validation
  const getFieldError = (field: keyof ClassificationParams): string | null => {
    if (!touchedFields.has(field)) return null;

    switch (field) {
      case 'netAssets':
        if (classificationParams.netAssets <= 0) return 'Net assets must be greater than zero';
        break;
      case 'grossIncome':
        if (classificationParams.grossIncome < 0) return 'Gross income cannot be negative';
        break;
      case 'aum':
        if (classificationParams.aum <= 0) return 'AUM must be greater than zero';
        break;
      default:
        return null;
    }
    return null;
  };

  // Classification explanations
  const getClassificationExplanation = (classification: InvestorClassification) => {
    switch (classification) {
      case 'sophisticated':
        return {
          title: 'Sophisticated Investor',
          description: 'Highest level of investor classification with minimal restrictions',
          benefits: [
            'Access to all investment products',
            'Reduced disclosure requirements',
            'No investment limits',
            'Expedited onboarding process',
          ],
          requirements: [
            'Net assets ≥ A$2.5M AND gross income ≥ A$250K (last 2 years)',
            'OR Accountant certificate of sophisticated investor status',
            'OR Control gross assets ≥ A$10M',
          ],
        };
      case 'professional':
        return {
          title: 'Professional Investor',
          description: 'Institutional-level access with professional exemptions',
          benefits: [
            'Access to wholesale investment products',
            'Professional investor exemptions under s761GA',
            'Reduced regulatory oversight',
            'Priority access to new offerings',
          ],
          requirements: [
            'AFS licensee, or person who controls ≥ A$10M',
            'Listed entity or control listed entity',
            'Superannuation fund, ADI, general insurer, life company',
            'Person operating as fund manager',
          ],
        };
      case 'wholesale':
        return {
          title: 'Wholesale Investor',
          description: 'Intermediate classification with expanded access',
          benefits: [
            'Access to wholesale investment products',
            'Exemption from retail disclosure requirements',
            'Higher investment limits',
            'Access to private placements',
          ],
          requirements: [
            'Net assets ≥ A$2.5M OR gross income ≥ A$250K (last 2 years)',
            'Accountant certificate within last 2 years',
            'Investment ≥ A$500K with professional advice',
          ],
        };
      case 'retail':
        return {
          title: 'Retail Investor',
          description: 'Standard investor classification with full regulatory protection',
          benefits: [
            'Full retail investor protections',
            'Comprehensive disclosure documents',
            'Dispute resolution access',
            'Compensation scheme coverage',
          ],
          requirements: [
            'Below wholesale/professional thresholds',
            'Full Product Disclosure Statement required',
            'Cooling-off period applies',
            'Investment limits may apply',
          ],
        };
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `A$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `A$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `A$${amount.toLocaleString()}`;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!classificationResult) {
      return;
    }

    const data = {
      classification: manualOverride ? 'retail' as InvestorClassification : classificationResult.classification,
      rationale: manualOverride ? `Manual override: ${overrideReason}` : classificationResult.rationale,
      thresholdsMet: {
        netAssets: classificationParams.netAssets >= 2500000,
        grossIncome: classificationParams.grossIncome >= 250000,
        aum: classificationParams.aum >= 2500000,
        professionalExperience: classificationParams.professionalExperience,
      },
      exemptionsAvailable: classificationResult.exemptionsAvailable || [],
      assessmentDetails: {
        params: classificationParams,
        result: classificationResult,
        manualOverride,
        overrideReason: manualOverride ? overrideReason : null,
      },
    };

    onComplete(data);
  };

  const explanation = classificationResult ? getClassificationExplanation(classificationResult.classification) : null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Investor Classification Assessment
        </h2>
        <p className="text-slate-600">
          Based on your entity information, we need to determine your investor classification under Australian regulations. This affects the types of investments you can access and regulatory requirements.
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
                <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
                <div className="mt-2 text-sm text-red-700">
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

        {/* Entity Summary */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Entity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Entity Name</p>
              <p className="font-medium text-slate-900">
                {onboardingState.institutionalIdentity?.entityName || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Entity Type</p>
              <p className="font-medium text-slate-900 capitalize">
                {onboardingState.institutionalIdentity?.entityType?.replace('_', ' ') || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Jurisdiction</p>
              <p className="font-medium text-slate-900 capitalize">
                {onboardingState.institutionalIdentity?.jurisdiction || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Net Assets */}
            <div>
              <label htmlFor="netAssets" className="block text-sm font-medium text-slate-700 mb-2">
                Net Assets *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">A$</span>
                <input
                  type="number"
                  id="netAssets"
                  value={classificationParams.netAssets || ''}
                  onChange={(e) => handleFieldChange('netAssets', parseInt(e.target.value) || 0)}
                  onBlur={() => handleFieldBlur('netAssets')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    getFieldError('netAssets') ? 'border-red-300' : 'border-slate-300'
                  }`}
                  step="100000"
                  min="0"
                />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Total assets minus liabilities: {formatCurrency(classificationParams.netAssets)}
              </p>
              {getFieldError('netAssets') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('netAssets')}</p>
              )}
              <div className="mt-2 text-xs">
                <span className={classificationParams.netAssets >= 2500000 ? 'text-green-600' : 'text-slate-500'}>
                  Wholesale threshold: A$2.5M {classificationParams.netAssets >= 2500000 ? '✓' : '✗'}
                </span>
              </div>
            </div>

            {/* Gross Income */}
            <div>
              <label htmlFor="grossIncome" className="block text-sm font-medium text-slate-700 mb-2">
                Annual Gross Income *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">A$</span>
                <input
                  type="number"
                  id="grossIncome"
                  value={classificationParams.grossIncome || ''}
                  onChange={(e) => handleFieldChange('grossIncome', parseInt(e.target.value) || 0)}
                  onBlur={() => handleFieldBlur('grossIncome')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    getFieldError('grossIncome') ? 'border-red-300' : 'border-slate-300'
                  }`}
                  step="10000"
                  min="0"
                />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Gross income for past 2 financial years: {formatCurrency(classificationParams.grossIncome)}
              </p>
              {getFieldError('grossIncome') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('grossIncome')}</p>
              )}
              <div className="mt-2 text-xs">
                <span className={classificationParams.grossIncome >= 250000 ? 'text-green-600' : 'text-slate-500'}>
                  Wholesale threshold: A$250K {classificationParams.grossIncome >= 250000 ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Experience */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Experience</h3>
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={classificationParams.professionalExperience}
                onChange={(e) => handleFieldChange('professionalExperience', e.target.checked)}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Professional investment experience
                </span>
                <p className="text-sm text-slate-500">
                  Entity has professional experience in investments, including management of financial assets,
                  institutional investment strategies, or relevant financial services experience.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Classification Result */}
        {classificationResult && (
          <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Assessment Result</h3>
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

            {explanation && (
              <div className={`p-4 rounded-lg mb-4 ${
                classificationResult.classification === 'sophisticated' ? 'bg-green-50 border border-green-200' :
                classificationResult.classification === 'professional' ? 'bg-blue-50 border border-blue-200' :
                classificationResult.classification === 'wholesale' ? 'bg-amber-50 border border-amber-200' :
                'bg-slate-50 border border-slate-200'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  classificationResult.classification === 'sophisticated' ? 'text-green-800' :
                  classificationResult.classification === 'professional' ? 'text-blue-800' :
                  classificationResult.classification === 'wholesale' ? 'text-amber-800' :
                  'text-slate-800'
                }`}>
                  {explanation.title}
                </h4>
                <p className="text-sm text-slate-600 mb-3">{explanation.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-slate-800 mb-2">Benefits</h5>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {explanation.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-800 mb-2">Requirements</h5>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {explanation.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-slate-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-slate-600">
              <p><strong>Rationale:</strong> {classificationResult.rationale}</p>
              {classificationResult.complianceNotes && classificationResult.complianceNotes.length > 0 && (
                <div className="mt-2">
                  <p><strong>Compliance Notes:</strong></p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {classificationResult.complianceNotes.map((note: string, index: number) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Override Option */}
        {classificationResult && classificationResult.classification !== 'retail' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Manual Override Option</h3>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={manualOverride}
                onChange={(e) => setManualOverride(e.target.checked)}
                className="mr-3 mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-medium text-amber-800">
                  Request retail investor treatment
                </span>
                <p className="text-sm text-amber-700">
                  You may choose to be treated as a retail investor to receive full regulatory protections,
                  though this may limit access to certain investment products.
                </p>
              </div>
            </label>

            {manualOverride && (
              <div className="mt-3">
                <label htmlFor="overrideReason" className="block text-sm font-medium text-amber-800 mb-1">
                  Reason for override *
                </label>
                <textarea
                  id="overrideReason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                  placeholder="Please explain why you prefer retail investor treatment..."
                />
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
            disabled={isLoading || !classificationResult || (manualOverride && !overrideReason.trim())}
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
              'Continue to KYC/AML →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};