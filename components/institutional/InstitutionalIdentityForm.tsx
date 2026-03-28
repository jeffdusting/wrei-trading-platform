'use client';

/**
 * Institutional Identity Form Component
 * Step 1: Entity Information Collection
 */

import { useState, useEffect } from 'react';
import type {
  InstitutionalOnboardingState,
  InstitutionalIdentity,
} from '@/lib/institutional-onboarding';
import { mapPersonaToEntityType, getDefaultInvestmentPreferences } from '@/lib/institutional-onboarding';
import type { PersonaType } from '@/lib/types';

interface InstitutionalIdentityFormProps {
  onComplete: (data: InstitutionalIdentity) => void;
  onBack: () => void;
  isLoading: boolean;
  errors: string[];
  warnings: string[];
  onboardingState: InstitutionalOnboardingState;
}

export const InstitutionalIdentityForm: React.FC<InstitutionalIdentityFormProps> = ({
  onComplete,
  onBack,
  isLoading,
  errors,
  warnings,
  onboardingState,
}) => {
  const [formData, setFormData] = useState<InstitutionalIdentity>(() => {
    return onboardingState.institutionalIdentity || {
      entityName: '',
      entityType: 'fund_manager',
      personaType: 'infrastructure_fund',
      jurisdiction: 'australia',
      aum: 0,
      establishedYear: new Date().getFullYear() - 5,
      primaryContactName: '',
      primaryContactRole: '',
      regulatoryLicense: '',
      isTaxExempt: false,
    };
  });

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Available persona types for institutional investors
  const institutionalPersonas: Array<{ value: PersonaType; label: string; description: string }> = [
    {
      value: 'infrastructure_fund',
      label: 'Infrastructure Fund Manager',
      description: 'Specializing in infrastructure assets and long-term yield generation',
    },
    {
      value: 'esg_impact_investor',
      label: 'ESG Impact Investor',
      description: 'Environmental, Social, and Governance focused investment strategy',
    },
    {
      value: 'family_office',
      label: 'Single/Multi-Family Office',
      description: 'Private wealth management for high net worth families',
    },
    {
      value: 'sovereign_wealth',
      label: 'Sovereign Wealth Fund',
      description: 'Government-owned investment fund for national economic objectives',
    },
    {
      value: 'pension_fund',
      label: 'Pension Fund',
      description: 'Retirement savings management for defined benefit/contribution plans',
    },
    {
      value: 'defi_yield_farmer',
      label: 'Digital Asset Fund Manager',
      description: 'DeFi and digital asset yield optimization strategies',
    },
  ];

  // Jurisdiction options
  const jurisdictions: Array<{ value: InstitutionalIdentity['jurisdiction']; label: string; description: string }> = [
    { value: 'australia', label: 'Australia', description: 'ASIC regulated, AFSL framework applicable' },
    { value: 'new_zealand', label: 'New Zealand', description: 'FMA regulated, equivalent framework' },
    { value: 'singapore', label: 'Singapore', description: 'MAS regulated, sophisticated investor regime' },
    { value: 'hong_kong', label: 'Hong Kong', description: 'SFC regulated, professional investor framework' },
    { value: 'other', label: 'Other', description: 'Subject to additional regulatory review' },
  ];

  // Contact role options
  const contactRoles = [
    'Chief Investment Officer',
    'Portfolio Manager',
    'Investment Director',
    'Fund Manager',
    'Managing Director',
    'Chief Executive Officer',
    'Investment Committee Chair',
    'Head of Alternatives',
    'Head of Infrastructure',
    'Other',
  ];

  // Handle field changes
  const handleFieldChange = (field: keyof InstitutionalIdentity, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-update entity type when persona changes
      if (field === 'personaType') {
        const entityType = mapPersonaToEntityType(value as PersonaType);
        if (entityType) {
          updated.entityType = entityType;
        }

        // Set tax exemption defaults for certain entity types
        if (value === 'pension_fund' || value === 'sovereign_wealth') {
          updated.isTaxExempt = true;
        }
      }

      return updated;
    });

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field));
  };

  // Handle field blur (for validation feedback)
  const handleFieldBlur = (field: keyof InstitutionalIdentity) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  // Field validation
  const getFieldError = (field: keyof InstitutionalIdentity): string | null => {
    if (!touchedFields.has(field)) return null;

    switch (field) {
      case 'entityName':
        if (!formData.entityName.trim()) return 'Entity name is required';
        if (formData.entityName.length < 3) return 'Entity name must be at least 3 characters';
        break;
      case 'aum':
        if (formData.aum <= 0) return 'Assets under management must be greater than zero';
        if (formData.aum < 1000000) return 'Minimum AUM of A$1M required for institutional access';
        break;
      case 'establishedYear':
        const currentYear = new Date().getFullYear();
        if (formData.establishedYear < 1900) return 'Establishment year seems too early';
        if (formData.establishedYear > currentYear) return 'Establishment year cannot be in the future';
        break;
      case 'primaryContactName':
        if (!formData.primaryContactName.trim()) return 'Primary contact name is required';
        break;
      case 'primaryContactRole':
        if (!formData.primaryContactRole.trim()) return 'Primary contact role is required';
        break;
      default:
        return null;
    }
    return null;
  };

  // Validation warnings
  const getFieldWarning = (field: keyof InstitutionalIdentity): string | null => {
    switch (field) {
      case 'aum':
        if (formData.aum < 2500000) {
          return 'AUM below A$2.5M wholesale investor threshold - retail restrictions may apply';
        }
        if (formData.aum < 10000000) {
          return 'Consider professional investor classification benefits with higher AUM';
        }
        break;
      case 'jurisdiction':
        if (formData.jurisdiction === 'other') {
          return 'Non-standard jurisdictions require additional regulatory review';
        }
        break;
      default:
        return null;
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched for validation
    const allFields = Object.keys(formData) as Array<keyof InstitutionalIdentity>;
    setTouchedFields(new Set(allFields));

    // Check for validation errors
    const hasErrors = allFields.some(field => getFieldError(field));

    if (!hasErrors) {
      onComplete(formData);
    }
  };

  // Format AUM display
  const formatAUM = (amount: number): string => {
    if (amount >= 1000000000) {
      return `A$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `A$${(amount / 1000000).toFixed(1)}M`;
    } else {
      return `A$${amount.toLocaleString()}`;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="bloomberg-large-metric text-slate-900 mb-2">
          Institutional Identity
        </h2>
        <p className="text-slate-600">
          Please provide your entity information to begin the onboarding process. This information will be used to determine appropriate regulatory treatment and investment access levels.
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
                <h3 className="bloomberg-small-text font-medium text-red-800">Please correct the following errors:</h3>
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

        {/* Entity Name */}
        <div>
          <label htmlFor="entityName" className="block bloomberg-small-text font-medium text-slate-700 mb-2">
            Entity Name *
          </label>
          <input
            type="text"
            id="entityName"
            value={formData.entityName}
            onChange={(e) => handleFieldChange('entityName', e.target.value)}
            onBlur={() => handleFieldBlur('entityName')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
              getFieldError('entityName') ? 'border-red-300' : 'border-slate-300'
            }`}
            placeholder="e.g., Green Infrastructure Fund LP"
          />
          {getFieldError('entityName') && (
            <p className="mt-1 bloomberg-small-text text-red-600">{getFieldError('entityName')}</p>
          )}
        </div>

        {/* Persona Type Selection */}
        <div>
          <label className="block bloomberg-small-text font-medium text-slate-700 mb-2">
            Investor Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutionalPersonas.map((persona) => (
              <div
                key={persona.value}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  formData.personaType === persona.value
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleFieldChange('personaType', persona.value)}
              >
                <input
                  type="radio"
                  name="personaType"
                  value={persona.value}
                  checked={formData.personaType === persona.value}
                  onChange={(e) => handleFieldChange('personaType', e.target.value as PersonaType)}
                  className="absolute top-4 right-4"
                />
                <h4 className="font-medium text-slate-900 mb-1">{persona.label}</h4>
                <p className="bloomberg-small-text text-slate-600">{persona.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Jurisdiction */}
        <div>
          <label htmlFor="jurisdiction" className="block bloomberg-small-text font-medium text-slate-700 mb-2">
            Primary Jurisdiction *
          </label>
          <select
            id="jurisdiction"
            value={formData.jurisdiction}
            onChange={(e) => handleFieldChange('jurisdiction', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            {jurisdictions.map((jurisdiction) => (
              <option key={jurisdiction.value} value={jurisdiction.value}>
                {jurisdiction.label} - {jurisdiction.description}
              </option>
            ))}
          </select>
          {getFieldWarning('jurisdiction') && (
            <p className="mt-1 bloomberg-small-text text-amber-600">{getFieldWarning('jurisdiction')}</p>
          )}
        </div>

        {/* AUM */}
        <div>
          <label htmlFor="aum" className="block bloomberg-small-text font-medium text-slate-700 mb-2">
            Assets Under Management (AUM) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-500">A$</span>
            <input
              type="number"
              id="aum"
              value={formData.aum || ''}
              onChange={(e) => handleFieldChange('aum', parseInt(e.target.value) || 0)}
              onBlur={() => handleFieldBlur('aum')}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                getFieldError('aum') ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="50000000"
              step="1000000"
              min="0"
            />
          </div>
          <p className="mt-1 bloomberg-small-text text-slate-500">
            Current AUM: {formatAUM(formData.aum)}
          </p>
          {getFieldError('aum') && (
            <p className="mt-1 bloomberg-small-text text-red-600">{getFieldError('aum')}</p>
          )}
          {getFieldWarning('aum') && (
            <p className="mt-1 bloomberg-small-text text-amber-600">{getFieldWarning('aum')}</p>
          )}
        </div>

        {/* Established Year */}
        <div>
          <label htmlFor="establishedYear" className="block bloomberg-small-text font-medium text-slate-700 mb-2">
            Year Established *
          </label>
          <input
            type="number"
            id="establishedYear"
            value={formData.establishedYear}
            onChange={(e) => handleFieldChange('establishedYear', parseInt(e.target.value))}
            onBlur={() => handleFieldBlur('establishedYear')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
              getFieldError('establishedYear') ? 'border-red-300' : 'border-slate-300'
            }`}
            min="1900"
            max={new Date().getFullYear()}
          />
          {getFieldError('establishedYear') && (
            <p className="mt-1 bloomberg-small-text text-red-600">{getFieldError('establishedYear')}</p>
          )}
        </div>

        {/* Primary Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="primaryContactName" className="block bloomberg-small-text font-medium text-slate-700 mb-2">
              Primary Contact Name *
            </label>
            <input
              type="text"
              id="primaryContactName"
              value={formData.primaryContactName}
              onChange={(e) => handleFieldChange('primaryContactName', e.target.value)}
              onBlur={() => handleFieldBlur('primaryContactName')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                getFieldError('primaryContactName') ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="John Smith"
            />
            {getFieldError('primaryContactName') && (
              <p className="mt-1 bloomberg-small-text text-red-600">{getFieldError('primaryContactName')}</p>
            )}
          </div>

          <div>
            <label htmlFor="primaryContactRole" className="block bloomberg-small-text font-medium text-slate-700 mb-2">
              Primary Contact Role *
            </label>
            <select
              id="primaryContactRole"
              value={formData.primaryContactRole}
              onChange={(e) => handleFieldChange('primaryContactRole', e.target.value)}
              onBlur={() => handleFieldBlur('primaryContactRole')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                getFieldError('primaryContactRole') ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="">Select role</option>
              {contactRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {getFieldError('primaryContactRole') && (
              <p className="mt-1 bloomberg-small-text text-red-600">{getFieldError('primaryContactRole')}</p>
            )}
          </div>
        </div>

        {/* Regulatory License (Optional) */}
        <div>
          <label htmlFor="regulatoryLicense" className="block bloomberg-small-text font-medium text-slate-700 mb-2">
            Regulatory License Number (Optional)
          </label>
          <input
            type="text"
            id="regulatoryLicense"
            value={formData.regulatoryLicense}
            onChange={(e) => handleFieldChange('regulatoryLicense', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="e.g., AFSL 123456"
          />
          <p className="mt-1 bloomberg-small-text text-slate-500">
            AFSL, AFS Representative, or equivalent regulatory authorization
          </p>
        </div>

        {/* Tax Exempt Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isTaxExempt}
              onChange={(e) => handleFieldChange('isTaxExempt', e.target.checked)}
              className="mr-2 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="bloomberg-small-text font-medium text-slate-700">
              Tax-exempt entity (e.g., superannuation fund, government entity)
            </span>
          </label>
          <p className="mt-1 bloomberg-small-text text-slate-500 ml-6">
            Check if your entity has tax-exempt status for investment income
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            disabled={true} // First step - no back button
            className="px-6 py-2 text-slate-400 cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            type="submit"
            disabled={isLoading}
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
              'Continue to Classification →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};