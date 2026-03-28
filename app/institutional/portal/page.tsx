'use client';

/**
 * Institutional Onboarding Portal Page
 * Milestone 2.1: Institutional Onboarding Platform
 */

import { useState } from 'react';
import { InstitutionalOnboardingWizard } from '@/components/institutional/InstitutionalOnboardingWizard';
import { PipelineTransition } from '@/components/institutional/PipelineTransition';
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

  const handleContinueToNegotiation = () => {
    // This will be handled by the PipelineTransition component
    // which will navigate to the correct negotiate route with pre-configuration
  };

  if (onboardingComplete && completedOnboardingState) {
    return (
      <div className="min-h-screen bg-slate-50" data-demo="portfolio-config">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="bloomberg-page-heading text-slate-800">Institutional Portal</h1>
                <p className="bloomberg-body-text text-slate-600 mt-1">
                  Onboarding complete - Pipeline transition
                </p>
              </div>
              <div className="bloomberg-section-label">
                INS
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <PipelineTransition
            onboardingState={completedOnboardingState}
            onContinueToNegotiation={handleContinueToNegotiation}
            onExit={handleExit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-demo="onboarding-start">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Institutional Portal</h1>
              <p className="bloomberg-body-text text-slate-600 mt-1">
                Institutional client onboarding and compliance verification
              </p>
            </div>
            <div className="bloomberg-section-label">
              INS
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <InstitutionalOnboardingWizard
          onComplete={handleOnboardingComplete}
          onExit={handleExit}
        />
      </div>
    </div>
  );
}