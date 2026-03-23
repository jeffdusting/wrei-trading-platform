'use client';

/**
 * Institutional Onboarding Portal Page
 * Milestone 2.1: Institutional Onboarding Platform
 */

import { useState } from 'react';
import { InstitutionalOnboardingWizard } from '@/components/institutional/InstitutionalOnboardingWizard';
import type { InstitutionalOnboardingState } from '@/lib/institutional-onboarding';

export default function InstitutionalPortalPage() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [completedOnboardingState, setCompletedOnboardingState] = useState<InstitutionalOnboardingState | null>(null);

  const handleOnboardingComplete = (state: InstitutionalOnboardingState) => {
    setCompletedOnboardingState(state);
    setOnboardingComplete(true);
  };

  const handleExit = () => {
    // Navigate back to main platform or landing page
    window.location.href = '/';
  };

  const handleContinueToPlatform = () => {
    // Navigate to professional interface with onboarding context
    const searchParams = new URLSearchParams({
      onboarded: 'true',
      persona: completedOnboardingState?.institutionalIdentity?.personaType || '',
      classification: completedOnboardingState?.investorClassification?.classification || '',
    });

    window.location.href = `/professional?${searchParams.toString()}`;
  };

  if (onboardingComplete && completedOnboardingState) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Welcome to WREI!
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Your institutional investor onboarding has been successfully completed. You now have full access to the WREI trading platform.
            </p>

            {/* Onboarding Summary */}
            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Profile Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div>
                  <h3 className="text-sm font-medium text-slate-700">Entity Information</h3>
                  <p className="text-sm text-slate-900 font-medium">
                    {completedOnboardingState.institutionalIdentity?.entityName}
                  </p>
                  <p className="text-sm text-slate-600 capitalize">
                    {completedOnboardingState.institutionalIdentity?.personaType?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700">Classification</h3>
                  <p className="text-sm text-slate-900 font-medium capitalize">
                    {completedOnboardingState.investorClassification?.classification} Investor
                  </p>
                  <p className="text-sm text-slate-600">
                    {completedOnboardingState.afslCompliance?.complianceStatus === 'exemption_claimed'
                      ? 'AFSL Exempt' : 'AFSL Compliant'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700">Investment Focus</h3>
                  <p className="text-sm text-slate-900 font-medium capitalize">
                    {completedOnboardingState.investmentPreferences?.primaryTokenType?.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-slate-600">
                    {completedOnboardingState.investmentPreferences?.yieldRequirement}% target yield
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">What's Next?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h3 className="font-medium text-slate-900 mb-1">Access Professional Interface</h3>
                  <p className="text-sm text-slate-600">
                    Enter the professional trading interface with your institutional privileges
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h3 className="font-medium text-slate-900 mb-1">Begin AI Negotiations</h3>
                  <p className="text-sm text-slate-600">
                    Start negotiating carbon credit and asset token purchases with AI assistance
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h3 className="font-medium text-slate-900 mb-1">Portfolio Management</h3>
                  <p className="text-sm text-slate-600">
                    Monitor and manage your tokenized asset portfolio with advanced analytics
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={handleContinueToPlatform}
                className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                Enter Professional Interface
              </button>
              <button
                onClick={() => window.print()}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-8 py-3 rounded-lg transition-colors font-medium"
              >
                Download Summary
              </button>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Need assistance? Contact our institutional support team at{' '}
                <a href="mailto:institutional@wrei.com" className="text-sky-600 hover:text-sky-800">
                  institutional@wrei.com
                </a>
                {' '}or call +61 2 9000 1234
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InstitutionalOnboardingWizard
      onComplete={handleOnboardingComplete}
      onExit={handleExit}
    />
  );
}