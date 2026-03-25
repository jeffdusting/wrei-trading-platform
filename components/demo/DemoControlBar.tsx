/**
 * WREI Trading Platform - Demo Control Bar
 *
 * Dedicated horizontal bar below the nav for demo tour controls.
 * Solves the off-screen issue by giving demo controls their own row.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDemoMode, DEMO_TOURS, type DemoTourType } from '@/lib/demo-mode/demo-state-manager';
import { TOUR_STEP_ROUTES } from '@/lib/demo-mode/tour-routes';

export default function DemoControlBar() {
  const router = useRouter();
  const {
    isActive,
    currentTour,
    tourStep,
    deactivateDemo,
    startTour,
    endTour,
    nextStep,
    prevStep,
    skipStep,
    getCurrentStep,
    getTourProgress,
    canGoNext,
    canGoPrev
  } = useDemoMode();

  const currentStep = getCurrentStep();
  const progress = getTourProgress();

  if (!isActive) return null;

  const handleNextStep = () => {
    if (!currentTour) return;
    const tour = DEMO_TOURS[currentTour];
    const nextIndex = Math.min(tourStep + 1, tour.steps.length - 1);
    const nextStepDef = tour.steps[nextIndex];

    // Navigate to the correct page for this step
    if (nextStepDef) {
      const route = getRouteForStep(currentTour, nextStepDef.id);
      if (route) {
        router.push(route);
      }
    }

    nextStep();
  };

  const handlePrevStep = () => {
    if (!currentTour) return;
    const tour = DEMO_TOURS[currentTour];
    const prevIndex = Math.max(tourStep - 1, 0);
    const prevStepDef = tour.steps[prevIndex];

    if (prevStepDef) {
      const route = getRouteForStep(currentTour, prevStepDef.id);
      if (route) {
        router.push(route);
      }
    }

    prevStep();
  };

  const handleStartTour = (tourType: DemoTourType) => {
    startTour(tourType);
    const firstStep = DEMO_TOURS[tourType].steps[0];
    if (firstStep) {
      const route = getRouteForStep(tourType, firstStep.id);
      if (route) {
        router.push(route);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-[#1B2A4A] border-b border-blue-800 sticky top-16 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 gap-4">

          {/* Left: Demo status and tour name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/30">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">DEMO</span>
            </div>

            {currentTour && (
              <span className="text-sm font-medium text-blue-200">
                {DEMO_TOURS[currentTour].name}
              </span>
            )}
          </div>

          {/* Centre: Tour controls and progress */}
          {currentTour ? (
            <div className="flex items-center gap-3 flex-1 justify-center min-w-0">
              {/* Progress bar */}
              <div className="hidden sm:flex items-center gap-2 min-w-0">
                <div className="w-32 bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-blue-300 whitespace-nowrap">
                  {tourStep + 1}/{DEMO_TOURS[currentTour].steps.length}
                </span>
              </div>

              {/* Step info */}
              {currentStep && (
                <div className="hidden md:block text-xs text-blue-200 truncate max-w-xs">
                  {currentStep.title}
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevStep}
                  disabled={!canGoPrev()}
                  className="p-1 rounded text-blue-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous Step (Left Arrow)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={!canGoNext()}
                  className="p-1 rounded text-blue-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next Step (Right Arrow)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={skipStep}
                  className="p-1 rounded text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Skip Step (S)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3m-4-6l3 3-3 3" />
                  </svg>
                </button>

                <div className="w-px h-4 bg-blue-700 mx-1"></div>

                <button
                  onClick={endTour}
                  className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  title="End Tour (Esc)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* No active tour -- show tour selection */
            <div className="flex items-center gap-2 flex-1 justify-center">
              <span className="text-xs text-blue-300">Select tour:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {Object.values(DEMO_TOURS).map((tour) => (
                  <button
                    key={tour.id}
                    onClick={() => handleStartTour(tour.id)}
                    className="px-2 py-0.5 text-xs font-medium text-blue-200 hover:text-white hover:bg-white/10 rounded transition-colors whitespace-nowrap"
                  >
                    {tour.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Right: Exit demo */}
          <div className="flex-shrink-0">
            <button
              onClick={deactivateDemo}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
              title="Exit Demo Mode"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get the route to navigate to for a given tour step
 */
function getRouteForStep(tourType: DemoTourType, stepId: string): string | null {
  const tourRoutes = TOUR_STEP_ROUTES[tourType];
  if (!tourRoutes) return null;
  return tourRoutes[stepId] || null;
}
