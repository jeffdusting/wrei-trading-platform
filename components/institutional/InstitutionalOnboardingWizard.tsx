'use client';

/**
 * Institutional Onboarding Wizard
 * Milestone 2.1: Institutional Onboarding Platform
 *
 * Multi-step onboarding orchestrator for institutional investors
 */

import { useState, useEffect } from 'react';
import type {
  InstitutionalOnboardingState,
  OnboardingStep,
  InstitutionalIdentity,
  InvestmentPreferences,
} from '@/lib/institutional-onboarding';
import {
  createEmptyOnboardingState,
  validateOnboardingStep,
  getNextStep,
  getPreviousStep,
  calculateOnboardingProgress,
  isOnboardingComplete,
} from '@/lib/institutional-onboarding';
import { InstitutionalIdentityForm } from './InstitutionalIdentityForm';
import { InvestorClassificationAssessment } from './InvestorClassificationAssessment';
import { KYCAMLVerification } from './KYCAMLVerification';
import { AFSLComplianceReview } from './AFSLComplianceReview';
import { InvestmentPreferencesConfig } from './InvestmentPreferencesConfig';
import { ComplianceConfirmation } from './ComplianceConfirmation';

interface OnboardingStepInfo {
  id: OnboardingStep;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  estimatedTime: string;
}

interface InstitutionalOnboardingWizardProps {
  onComplete?: (onboardingState: InstitutionalOnboardingState) => void;
  onExit?: () => void;
  initialState?: Partial<InstitutionalOnboardingState>;
}

export const InstitutionalOnboardingWizard: React.FC<InstitutionalOnboardingWizardProps> = ({
  onComplete,
  onExit,
  initialState,
}) => {
  const [onboardingState, setOnboardingState] = useState<InstitutionalOnboardingState>(() => {
    const emptyState = createEmptyOnboardingState();
    return initialState ? { ...emptyState, ...initialState } : emptyState;
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Define onboarding steps with metadata
  const onboardingSteps: OnboardingStepInfo[] = [
    {
      id: 'institutional_identity',
      title: 'Institutional Identity',
      description: 'Entity information, jurisdiction, and regulatory status',
      status: getStepStatus('institutional_identity'),
      estimatedTime: '5-10 minutes',
    },
    {
      id: 'investor_classification',
      title: 'Investor Classification',
      description: 'Determine wholesale, professional, or sophisticated investor status',
      status: getStepStatus('investor_classification'),
      estimatedTime: '3-5 minutes',
    },
    {
      id: 'kyc_aml_verification',
      title: 'KYC/AML Verification',
      description: 'Customer due diligence and anti-money laundering assessment',
      status: getStepStatus('kyc_aml_verification'),
      estimatedTime: '10-15 minutes',
    },
    {
      id: 'afsl_compliance',
      title: 'AFSL Compliance Review',
      description: 'Australian Financial Services License requirements and exemptions',
      status: getStepStatus('afsl_compliance'),
      estimatedTime: '5-8 minutes',
    },
    {
      id: 'investment_preferences',
      title: 'Investment Preferences',
      description: 'Token allocation, yield requirements, and risk parameters',
      status: getStepStatus('investment_preferences'),
      estimatedTime: '8-12 minutes',
    },
    {
      id: 'compliance_confirmation',
      title: 'Compliance Confirmation',
      description: 'Final compliance review and onboarding completion',
      status: getStepStatus('compliance_confirmation'),
      estimatedTime: '5-10 minutes',
    },
  ];

  function getStepStatus(stepId: OnboardingStep): 'pending' | 'active' | 'completed' | 'error' {
    if (stepId === onboardingState.currentStep) {
      return validationErrors.length > 0 ? 'error' : 'active';
    }
    return onboardingState.stepProgress[stepId] ? 'completed' : 'pending';
  }

  // Step navigation handlers
  const handleStepComplete = async (stepData: any) => {
    setIsValidating(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      // Update state with step data
      const updatedState = updateStateForStep(onboardingState, onboardingState.currentStep, stepData);

      // Validate current step
      const validation = validateOnboardingStep(updatedState.currentStep, updatedState);

      if (validation.isComplete) {
        // Mark step as complete
        updatedState.stepProgress[updatedState.currentStep] = true;
        updatedState.lastUpdated = new Date().toISOString();

        // Move to next step or complete onboarding
        const nextStep = getNextStep(updatedState.currentStep, true);
        if (nextStep) {
          updatedState.currentStep = nextStep;
        } else {
          // Final step completed
          updatedState.onboardingCompleted = new Date().toISOString();
          setShowConfirmation(true);
        }

        setOnboardingState(updatedState);

        if (validation.warnings.length > 0) {
          setValidationWarnings(validation.warnings);
        }
      } else {
        setValidationErrors(validation.errors);
      }
    } catch (error) {
      console.error('Error completing step:', error);
      setValidationErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsValidating(false);
    }
  };

  const handleStepBack = () => {
    const previousStep = getPreviousStep(onboardingState.currentStep);
    if (previousStep) {
      setOnboardingState(prev => ({
        ...prev,
        currentStep: previousStep,
        lastUpdated: new Date().toISOString(),
      }));
      setValidationErrors([]);
      setValidationWarnings([]);
    }
  };

  const handleOnboardingComplete = () => {
    if (isOnboardingComplete(onboardingState) && onComplete) {
      onComplete(onboardingState);
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  // Update state based on step completion
  function updateStateForStep(
    state: InstitutionalOnboardingState,
    step: OnboardingStep,
    data: any
  ): InstitutionalOnboardingState {
    const updatedState = { ...state };

    switch (step) {
      case 'institutional_identity':
        updatedState.institutionalIdentity = data as InstitutionalIdentity;
        break;
      case 'investor_classification':
        updatedState.investorClassification = data;
        break;
      case 'kyc_aml_verification':
        updatedState.kycAmlStatus = data;
        break;
      case 'afsl_compliance':
        updatedState.afslCompliance = data;
        break;
      case 'investment_preferences':
        updatedState.investmentPreferences = data as InvestmentPreferences;
        break;
      case 'compliance_confirmation':
        updatedState.finalCompliance = data;
        break;
    }

    return updatedState;
  }

  // Render current step component
  const renderCurrentStep = () => {
    const stepProps = {
      onComplete: handleStepComplete,
      onBack: handleStepBack,
      isLoading: isValidating,
      errors: validationErrors,
      warnings: validationWarnings,
      onboardingState,
    };

    switch (onboardingState.currentStep) {
      case 'institutional_identity':
        return <InstitutionalIdentityForm {...stepProps} />;
      case 'investor_classification':
        return <InvestorClassificationAssessment {...stepProps} />;
      case 'kyc_aml_verification':
        return <KYCAMLVerification {...stepProps} />;
      case 'afsl_compliance':
        return <AFSLComplianceReview {...stepProps} />;
      case 'investment_preferences':
        return <InvestmentPreferencesConfig {...stepProps} />;
      case 'compliance_confirmation':
        return <ComplianceConfirmation {...stepProps} />;
      default:
        return <div className="text-red-500">Unknown step: {onboardingState.currentStep}</div>;
    }
  };

  const progress = calculateOnboardingProgress(onboardingState);
  const currentStepIndex = onboardingSteps.findIndex(step => step.id === onboardingState.currentStep);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="bloomberg-page-heading text-slate-900">
                Institutional Onboarding
              </h1>
              <p className="text-slate-600 mt-2">
                Complete your institutional investor registration for the WREI trading platform
              </p>
            </div>
            <button
              onClick={handleExit}
              className="text-slate-400 hover:text-slate-600 p-2"
              title="Exit Onboarding"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between bloomberg-small-text text-slate-500 mb-2">
              <span>Progress: {progress}% complete</span>
              <span>Step {currentStepIndex + 1} of {onboardingSteps.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="bloomberg-card-title text-slate-900 mb-4">Onboarding Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  step.status === 'active'
                    ? 'border-sky-500 bg-sky-50'
                    : step.status === 'completed'
                    ? 'border-green-500 bg-green-50'
                    : step.status === 'error'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center bloomberg-small-text font-medium mr-3 ${
                      step.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : step.status === 'active'
                        ? 'bg-sky-500 text-white'
                        : step.status === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900">{step.title}</h3>
                </div>
                <p className="bloomberg-small-text text-slate-600 mb-2">{step.description}</p>
                <p className="bloomberg-section-label text-slate-400">Est. {step.estimatedTime}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {renderCurrentStep()}
        </div>

        {/* Global Warnings */}
        {validationWarnings.length > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="bloomberg-small-text font-medium text-amber-800">Warnings</h3>
                <div className="mt-2 bloomberg-small-text text-amber-700">
                  <ul className="list-disc list-inside space-y-1">
                    {validationWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="bloomberg-card-title font-medium text-slate-900 mb-2">
                  Onboarding Complete!
                </h3>
                <p className="text-slate-600 mb-6">
                  Your institutional investor registration has been successfully completed. You can now access the full WREI trading platform.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Review Details
                  </button>
                  <button
                    onClick={handleOnboardingComplete}
                    className="flex-1 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    Continue to Platform
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};