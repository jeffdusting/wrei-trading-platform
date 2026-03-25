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
      <div data-demo="portfolio-config">
        <PipelineTransition
          onboardingState={completedOnboardingState}
          onContinueToNegotiation={handleContinueToNegotiation}
          onExit={handleExit}
        />
      </div>
    );
  }

  return (
    <div data-demo="onboarding-start">
      <InstitutionalOnboardingWizard
        onComplete={handleOnboardingComplete}
        onExit={handleExit}
      />
    </div>
  );
}