'use client';

/**
 * Investment Preferences Configuration Component
 * Step 5: Token allocation, yield requirements, and risk parameters
 */

import { useState, useEffect } from 'react';
import type { InstitutionalOnboardingState, InvestmentPreferences } from '@/lib/institutional-onboarding';
import { getDefaultInvestmentPreferences } from '@/lib/institutional-onboarding';
import type { WREITokenType, YieldMechanism } from '@/lib/types';

interface InvestmentPreferencesConfigProps {
  onComplete: (data: InvestmentPreferences) => void;
  onBack: () => void;
  isLoading: boolean;
  errors: string[];
  warnings: string[];
  onboardingState: InstitutionalOnboardingState;
}

export const InvestmentPreferencesConfig: React.FC<InvestmentPreferencesConfigProps> = ({
  onComplete,
  onBack,
  isLoading,
  errors,
  warnings,
  onboardingState,
}) => {
  const [preferences, setPreferences] = useState<InvestmentPreferences>(() => {
    const personaType = onboardingState.institutionalIdentity?.personaType;
    const defaults = personaType ? getDefaultInvestmentPreferences(personaType) : {};

    return {
      primaryTokenType: 'carbon_credits',
      secondaryTokenTypes: ['asset_co'],
      preferredYieldMechanism: 'revenue_share',
      targetAllocation: { carbonCredits: 50, assetCo: 50 },
      investmentHorizon: 'medium_term',
      minimumTicketSize: 1000000,
      maximumTicketSize: 10000000,
      yieldRequirement: 8.0,
      riskTolerance: 'moderate',
      liquidityRequirement: 'monthly',
      esgMandatory: false,
      concentrationLimits: {
        singleAssetMax: 20,
        singleRegionMax: 40,
        singleSectorMax: 30,
      },
      ...defaults,
    };
  });

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const tokenTypes: Array<{ value: WREITokenType; label: string; description: string }> = [
    {
      value: 'carbon_credits',
      label: 'WREI Carbon Credits',
      description: 'Verified carbon offset tokens with dMRV technology',
    },
    {
      value: 'asset_co',
      label: 'WREI Asset Co Tokens',
      description: 'Tokenized infrastructure asset co-investment opportunities',
    },
    {
      value: 'dual_portfolio',
      label: 'Dual Portfolio Strategy',
      description: 'Balanced allocation across both carbon credits and asset tokens',
    },
  ];

  const yieldMechanisms: Array<{ value: YieldMechanism; label: string; description: string }> = [
    {
      value: 'revenue_share',
      label: 'Revenue Share Model',
      description: 'Direct participation in underlying asset revenue streams',
    },
    {
      value: 'nav_accruing',
      label: 'NAV Accruing Model',
      description: 'Value appreciation through net asset value growth',
    },
  ];

  const handleFieldChange = (field: keyof InvestmentPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const handleAllocationChange = (type: 'carbonCredits' | 'assetCo', value: number) => {
    const otherType = type === 'carbonCredits' ? 'assetCo' : 'carbonCredits';
    setPreferences(prev => ({
      ...prev,
      targetAllocation: {
        ...prev.targetAllocation,
        [type]: value,
        [otherType]: 100 - value,
      },
    }));
    setTouchedFields(prev => new Set(prev).add('targetAllocation'));
  };

  const handleConcentrationLimitChange = (limit: keyof InvestmentPreferences['concentrationLimits'], value: number) => {
    setPreferences(prev => ({
      ...prev,
      concentrationLimits: {
        ...prev.concentrationLimits,
        [limit]: value,
      },
    }));
    setTouchedFields(prev => new Set(prev).add('concentrationLimits'));
  };

  const getFieldError = (field: keyof InvestmentPreferences): string | null => {
    if (!touchedFields.has(field)) return null;

    switch (field) {
      case 'minimumTicketSize':
        if (preferences.minimumTicketSize <= 0) return 'Minimum ticket size must be greater than zero';
        if (preferences.minimumTicketSize >= preferences.maximumTicketSize) {
          return 'Minimum ticket size must be less than maximum';
        }
        break;
      case 'maximumTicketSize':
        if (preferences.maximumTicketSize <= preferences.minimumTicketSize) {
          return 'Maximum ticket size must be greater than minimum';
        }
        break;
      case 'yieldRequirement':
        if (preferences.yieldRequirement < 0) return 'Yield requirement cannot be negative';
        if (preferences.yieldRequirement > 100) return 'Yield requirement seems unrealistic (>100%)';
        break;
      default:
        return null;
    }
    return null;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched for validation
    const allFields = Object.keys(preferences) as Array<keyof InvestmentPreferences>;
    setTouchedFields(new Set(allFields));

    // Check for validation errors
    const hasErrors = allFields.some(field => getFieldError(field));

    if (!hasErrors) {
      onComplete(preferences);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Investment Preferences
        </h2>
        <p className="text-slate-600">
          Configure your investment parameters including token allocation, yield requirements, and risk management preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Primary Token Selection */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Token Strategy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tokenTypes.map((token) => (
              <div
                key={token.value}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  preferences.primaryTokenType === token.value
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleFieldChange('primaryTokenType', token.value)}
              >
                <input
                  type="radio"
                  name="primaryTokenType"
                  value={token.value}
                  checked={preferences.primaryTokenType === token.value}
                  onChange={(e) => handleFieldChange('primaryTokenType', e.target.value as WREITokenType)}
                  className="absolute top-4 right-4"
                />
                <h4 className="font-medium text-slate-900 mb-1">{token.label}</h4>
                <p className="text-sm text-slate-600">{token.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Target Allocation */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Target Allocation</h3>
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Carbon Credits: {preferences.targetAllocation.carbonCredits}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={preferences.targetAllocation.carbonCredits}
                  onChange={(e) => handleAllocationChange('carbonCredits', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Asset Co Tokens: {preferences.targetAllocation.assetCo}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={preferences.targetAllocation.assetCo}
                  onChange={(e) => handleAllocationChange('assetCo', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Total Allocation:</span>
                <span className={`font-medium ${
                  preferences.targetAllocation.carbonCredits + preferences.targetAllocation.assetCo === 100
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {preferences.targetAllocation.carbonCredits + preferences.targetAllocation.assetCo}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Yield and Risk Parameters */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Yield and Risk Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="yieldRequirement" className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Yield Requirement (% p.a.)
              </label>
              <input
                type="number"
                id="yieldRequirement"
                value={preferences.yieldRequirement}
                onChange={(e) => handleFieldChange('yieldRequirement', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                  getFieldError('yieldRequirement') ? 'border-red-300' : 'border-slate-300'
                }`}
                step="0.1"
                min="0"
                max="50"
              />
              {getFieldError('yieldRequirement') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('yieldRequirement')}</p>
              )}
            </div>

            <div>
              <label htmlFor="riskTolerance" className="block text-sm font-medium text-slate-700 mb-2">
                Risk Tolerance
              </label>
              <select
                id="riskTolerance"
                value={preferences.riskTolerance}
                onChange={(e) => handleFieldChange('riskTolerance', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="conservative">Conservative - Capital preservation priority</option>
                <option value="moderate">Moderate - Balanced risk/return approach</option>
                <option value="aggressive">Aggressive - Growth-focused with higher risk tolerance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Investment Size and Liquidity */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Investment Size and Liquidity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="minimumTicketSize" className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Ticket Size
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">A$</span>
                <input
                  type="number"
                  id="minimumTicketSize"
                  value={preferences.minimumTicketSize}
                  onChange={(e) => handleFieldChange('minimumTicketSize', parseInt(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    getFieldError('minimumTicketSize') ? 'border-red-300' : 'border-slate-300'
                  }`}
                  step="100000"
                />
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatCurrency(preferences.minimumTicketSize)}</p>
              {getFieldError('minimumTicketSize') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('minimumTicketSize')}</p>
              )}
            </div>

            <div>
              <label htmlFor="maximumTicketSize" className="block text-sm font-medium text-slate-700 mb-2">
                Maximum Ticket Size
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">A$</span>
                <input
                  type="number"
                  id="maximumTicketSize"
                  value={preferences.maximumTicketSize}
                  onChange={(e) => handleFieldChange('maximumTicketSize', parseInt(e.target.value) || 0)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                    getFieldError('maximumTicketSize') ? 'border-red-300' : 'border-slate-300'
                  }`}
                  step="1000000"
                />
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatCurrency(preferences.maximumTicketSize)}</p>
              {getFieldError('maximumTicketSize') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('maximumTicketSize')}</p>
              )}
            </div>

            <div>
              <label htmlFor="liquidityRequirement" className="block text-sm font-medium text-slate-700 mb-2">
                Liquidity Requirement
              </label>
              <select
                id="liquidityRequirement"
                value={preferences.liquidityRequirement}
                onChange={(e) => handleFieldChange('liquidityRequirement', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="daily">Daily liquidity</option>
                <option value="weekly">Weekly liquidity</option>
                <option value="monthly">Monthly liquidity</option>
                <option value="quarterly">Quarterly liquidity</option>
                <option value="annual">Annual liquidity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Concentration Limits */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Concentration Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Single Asset: {preferences.concentrationLimits.singleAssetMax}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={preferences.concentrationLimits.singleAssetMax}
                onChange={(e) => handleConcentrationLimitChange('singleAssetMax', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Single Region: {preferences.concentrationLimits.singleRegionMax}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={preferences.concentrationLimits.singleRegionMax}
                onChange={(e) => handleConcentrationLimitChange('singleRegionMax', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Single Sector: {preferences.concentrationLimits.singleSectorMax}%
              </label>
              <input
                type="range"
                min="10"
                max="75"
                step="5"
                value={preferences.concentrationLimits.singleSectorMax}
                onChange={(e) => handleConcentrationLimitChange('singleSectorMax', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ESG and Sustainability */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">ESG and Sustainability</h3>
          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={preferences.esgMandatory}
                onChange={(e) => handleFieldChange('esgMandatory', e.target.checked)}
                className="mr-3 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">ESG compliance mandatory</span>
                <p className="text-sm text-slate-500">
                  All investments must meet defined Environmental, Social, and Governance criteria
                </p>
              </div>
            </label>

            <div>
              <label htmlFor="investmentHorizon" className="block text-sm font-medium text-slate-700 mb-2">
                Investment Horizon
              </label>
              <select
                id="investmentHorizon"
                value={preferences.investmentHorizon}
                onChange={(e) => handleFieldChange('investmentHorizon', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="short_term">Short Term (&lt; 2 years)</option>
                <option value="medium_term">Medium Term (2-5 years)</option>
                <option value="long_term">Long Term (&gt; 5 years)</option>
              </select>
            </div>

            <div>
              <label htmlFor="yieldMechanism" className="block text-sm font-medium text-slate-700 mb-2">
                Preferred Yield Mechanism
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {yieldMechanisms.map((mechanism) => (
                  <div
                    key={mechanism.value}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      preferences.preferredYieldMechanism === mechanism.value
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleFieldChange('preferredYieldMechanism', mechanism.value)}
                  >
                    <input
                      type="radio"
                      name="preferredYieldMechanism"
                      value={mechanism.value}
                      checked={preferences.preferredYieldMechanism === mechanism.value}
                      onChange={(e) => handleFieldChange('preferredYieldMechanism', e.target.value as YieldMechanism)}
                      className="absolute top-4 right-4"
                    />
                    <h4 className="font-medium text-slate-900 mb-1">{mechanism.label}</h4>
                    <p className="text-sm text-slate-600">{mechanism.description}</p>
                  </div>
                ))}
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
            disabled={isLoading || preferences.targetAllocation.carbonCredits + preferences.targetAllocation.assetCo !== 100}
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
              'Continue to Final Review →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};