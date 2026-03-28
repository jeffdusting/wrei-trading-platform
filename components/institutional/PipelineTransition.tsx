/**
 * Pipeline Transition Component
 *
 * Handles the transition from institutional onboarding completion to negotiation interface.
 * Provides visual feedback, data validation, and smooth navigation with pre-configuration.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement B4: Onboarding-to-Negotiation Pipeline
 */

'use client';

import { useState, useEffect } from 'react';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';
import {
  extractNegotiationPreConfig,
  validateOnboardingForNegotiation,
  generateNegotiationUrlParams,
  generatePersonalisedWelcome,
  type NegotiationPreConfig
} from '@/lib/onboarding-pipeline';

interface PipelineTransitionProps {
  /** Completed onboarding state to transfer */
  onboardingState: InstitutionalOnboardingState;

  /** Callback when user chooses to continue to negotiation */
  onContinueToNegotiation: () => void;

  /** Callback when user chooses to exit/return to home */
  onExit: () => void;

  /** Optional custom entity name override */
  entityNameOverride?: string;

  /** Optional navigation function for testing */
  navigate?: (url: string) => void;
}

type TransitionStage = 'preparing' | 'validating' | 'ready' | 'error' | 'transitioning';

export function PipelineTransition({
  onboardingState,
  onContinueToNegotiation,
  onExit,
  entityNameOverride,
  navigate
}: PipelineTransitionProps) {
  const [stage, setStage] = useState<TransitionStage>('preparing');
  const [preConfig, setPreConfig] = useState<NegotiationPreConfig | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');

  // Process onboarding data and prepare pre-configuration
  useEffect(() => {
    const processOnboardingData = async () => {
      setStage('preparing');

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 800));

      setStage('validating');

      // Validate onboarding data completeness
      const validation = validateOnboardingForNegotiation(onboardingState);

      if (!validation.isValid) {
        setValidationErrors(validation.missingFields);
        setStage('error');
        return;
      }

      // Extract pre-configuration
      try {
        const extractedPreConfig = extractNegotiationPreConfig(onboardingState);

        // Apply entity name override if provided
        if (entityNameOverride) {
          extractedPreConfig.entityName = entityNameOverride;
        }

        setPreConfig(extractedPreConfig);
        setWelcomeMessage(generatePersonalisedWelcome(extractedPreConfig));

        // Small delay before showing ready state
        await new Promise(resolve => setTimeout(resolve, 500));
        setStage('ready');

      } catch (error) {
        console.error('Error extracting pre-configuration:', error);
        setValidationErrors(['Failed to process onboarding data']);
        setStage('error');
      }
    };

    processOnboardingData();
  }, [onboardingState, entityNameOverride]);

  const handleContinueToNegotiation = () => {
    if (!preConfig) return;

    setStage('transitioning');

    // Generate URL parameters for negotiation page
    const urlParams = generateNegotiationUrlParams(preConfig);

    // Navigate to negotiation page with pre-configuration
    if (navigate) {
      navigate(`/negotiate?${urlParams}`);
    } else {
      window.location.href = `/negotiate?${urlParams}`;
    }
  };

  const renderStageContent = () => {
    switch (stage) {
      case 'preparing':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-sky-100 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
            <h2 className="bloomberg-large-metric text-slate-900 mb-4">Preparing Your Profile</h2>
            <p className="bloomberg-card-title text-slate-600">
              We&apos;re processing your institutional onboarding data and preparing your personalised trading interface...
            </p>
          </div>
        );

      case 'validating':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
              <div className="animate-pulse">
                <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <h2 className="bloomberg-large-metric text-slate-900 mb-4">Validating Compliance</h2>
            <p className="bloomberg-card-title text-slate-600">
              Verifying your institutional credentials and regulatory compliance status...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="bloomberg-large-metric text-slate-900 mb-4">Configuration Issue</h2>
            <p className="bloomberg-card-title text-slate-600 mb-6">
              We encountered an issue processing your onboarding data. The following information is missing:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <ul className="text-left bloomberg-small-text text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    <span className="capitalize">{error.replace('_', ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="bloomberg-small-text text-slate-600 mb-6">
              Please contact our institutional support team or return to complete your onboarding.
            </p>
            <div className="space-x-4">
              <button
                onClick={onExit}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2 rounded-lg transition-colors"
              >
                Return to Onboarding
              </button>
              <a
                href="mailto:institutional@wrei.com"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
              >
                Contact Support
              </a>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="bloomberg-large-metric text-slate-900 mb-4">Ready to Begin Trading</h2>
            <p className="bloomberg-card-title text-slate-600 mb-8">
              {welcomeMessage}
            </p>

            {preConfig && (
              <div className="bg-slate-50 rounded-lg p-6 mb-8">
                <h3 className="bloomberg-card-title text-slate-900 mb-4">Your Configuration Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                  <div>
                    <h4 className="bloomberg-small-text font-medium text-slate-700">Entity</h4>
                    <p className="bloomberg-small-text text-slate-900 font-medium">{preConfig.entityName}</p>
                    <p className="bloomberg-small-text text-slate-600 capitalize">
                      {preConfig.institutionalClassification} Investor
                    </p>
                  </div>
                  <div>
                    <h4 className="bloomberg-small-text font-medium text-slate-700">Trading Focus</h4>
                    <p className="bloomberg-small-text text-slate-900 font-medium capitalize">
                      {preConfig.investmentFocus.primaryTokenType.replace('_', ' ')}
                    </p>
                    <p className="bloomberg-small-text text-slate-600">
                      {preConfig.investmentFocus.targetYield}% target yield
                    </p>
                  </div>
                  <div>
                    <h4 className="bloomberg-small-text font-medium text-slate-700">Investment Range</h4>
                    <p className="bloomberg-small-text text-slate-900 font-medium">
                      ${(preConfig.investmentFocus.minInvestmentSize / 1000).toFixed(0)}K - ${(preConfig.investmentFocus.maxInvestmentSize / 1000000).toFixed(1)}M
                    </p>
                    <p className="bloomberg-small-text text-slate-600 capitalize">
                      {preConfig.investmentFocus.riskTolerance} Risk Profile
                    </p>
                  </div>
                  <div>
                    <h4 className="bloomberg-small-text font-medium text-slate-700">Settlement</h4>
                    <p className="bloomberg-small-text text-slate-900 font-medium uppercase">
                      {preConfig.tradingPreferences.settlementTimeline}
                    </p>
                    <p className="bloomberg-small-text text-slate-600 capitalize">
                      {preConfig.tradingPreferences.paymentMethod} Payment
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-sky-50 border border-sky-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 text-left">
                  <h4 className="bloomberg-small-text  text-sky-900">What Happens Next</h4>
                  <p className="bloomberg-small-text text-sky-800 mt-1">
                    You&apos;ll enter the WREI negotiation interface with your institutional profile pre-configured.
                    The AI negotiation agent will understand your compliance requirements, investment focus,
                    and trading preferences automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContinueToNegotiation}
                className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                Begin AI Negotiation
              </button>
              <button
                onClick={onExit}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-3 rounded-lg transition-colors font-medium"
              >
                Return to Home
              </button>
            </div>
          </div>
        );

      case 'transitioning':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-sky-100 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
            <h2 className="bloomberg-large-metric text-slate-900 mb-4">Launching Negotiation Interface</h2>
            <p className="bloomberg-card-title text-slate-600">
              Transferring your profile to the WREI trading platform...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {renderStageContent()}
        </div>

        {/* Progress Indicator */}
        {(stage === 'preparing' || stage === 'validating' || stage === 'transitioning' || stage === 'ready') && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-center space-x-4 bloomberg-small-text text-slate-600">
                <div className={`flex items-center ${stage === 'preparing' ? 'text-sky-600' : stage === 'ready' ? 'text-green-600' : 'text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${stage === 'preparing' ? 'bg-sky-600 animate-pulse' : stage === 'ready' ? 'bg-green-600' : 'bg-slate-400'}`}></div>
                  Preparing
                </div>
                <div className="w-8 border-t border-slate-300"></div>
                <div className={`flex items-center ${stage === 'validating' ? 'text-amber-600' : stage === 'ready' ? 'text-green-600' : 'text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${stage === 'validating' ? 'bg-amber-600 animate-pulse' : stage === 'ready' ? 'bg-green-600' : 'bg-slate-400'}`}></div>
                  Validating
                </div>
                <div className="w-8 border-t border-slate-300"></div>
                <div className={`flex items-center ${stage === 'ready' ? 'text-green-600' : 'text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${stage === 'ready' ? 'bg-green-600' : 'bg-slate-400'}`}></div>
                  Ready
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}