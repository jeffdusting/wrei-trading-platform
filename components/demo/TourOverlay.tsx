/**
 * WREI Trading Platform - Tour Overlay Component
 *
 * Interactive guided tour system with smart highlighting and contextual tooltips.
 * Provides seamless navigation through demo scenarios.
 *
 * Fixes applied:
 * - Tooltip positioned independently (not child of backdrop) to prevent click propagation issues
 * - Fallback display when target element not found on page
 * - Removed styled-jsx dependency in favour of inline styles
 * - Proper page navigation via tour-routes
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoMode, DEMO_TOURS } from '@/lib/demo-mode/demo-state-manager';
import { TOUR_STEP_ROUTES } from '@/lib/demo-mode/tour-routes';

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TourOverlay() {
  const router = useRouter();
  const {
    isActive,
    currentTour,
    tourStep,
    showTourOverlay,
    getCurrentStep,
    nextStep,
    prevStep,
    skipStep,
    endTour,
    canGoNext,
    canGoPrev,
    trackInteraction
  } = useDemoMode();

  const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [elementFound, setElementFound] = useState(false);
  const currentStep = getCurrentStep();

  // Navigate to the correct page for a step
  const navigateForStep = useCallback((tourType: string, stepId: string) => {
    const tourRoutes = TOUR_STEP_ROUTES[tourType as keyof typeof TOUR_STEP_ROUTES];
    if (!tourRoutes) return;
    const route = tourRoutes[stepId];
    if (route) {
      router.push(route);
    }
  }, [router]);

  // Calculate element position and update highlight
  useEffect(() => {
    if (!currentStep?.targetElement || !showTourOverlay) {
      setHighlightPosition(null);
      setElementFound(false);
      return;
    }

    const updatePositions = () => {
      const targetElement = document.querySelector(currentStep.targetElement!);
      if (!targetElement) {
        setHighlightPosition(null);
        setElementFound(false);
        return;
      }

      setElementFound(true);
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      const highlightPos: HighlightPosition = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
      };
      setHighlightPosition(highlightPos);

      // Tooltip position -- centre below the element, then adjust for viewport
      const tooltipWidth = 340;
      const padding = 16;

      let tooltipLeft = rect.left + scrollLeft + rect.width / 2 - tooltipWidth / 2;
      let tooltipTop = rect.top + scrollTop + rect.height + padding + 8;

      // Clamp horizontally
      if (tooltipLeft < padding) {
        tooltipLeft = padding;
      } else if (tooltipLeft + tooltipWidth > window.innerWidth - padding) {
        tooltipLeft = window.innerWidth - tooltipWidth - padding;
      }

      // If below viewport, put above
      if (rect.bottom + 250 > window.innerHeight) {
        tooltipTop = rect.top + scrollTop - 250 - padding;
      }

      setTooltipStyle({
        position: 'absolute',
        top: `${tooltipTop}px`,
        left: `${tooltipLeft}px`,
        width: `${tooltipWidth}px`,
        zIndex: 60,
      });

      // Auto-scroll to element if off screen
      const viewportTop = scrollTop;
      const viewportBottom = scrollTop + window.innerHeight;
      const elementTop = rect.top + scrollTop;
      const elementBottom = elementTop + rect.height;

      if (elementTop < viewportTop + 100 || elementBottom > viewportBottom - 100) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    };

    // Delay slightly to allow page navigation to render
    const timeoutId = setTimeout(updatePositions, 150);

    const handleUpdate = () => requestAnimationFrame(updatePositions);
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [currentStep, showTourOverlay, tourStep]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!showTourOverlay) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (canGoNext()) handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (canGoPrev()) handlePrev();
          break;
        case 'Escape':
          e.preventDefault();
          endTour();
          break;
        case 's':
        case 'S':
          if (currentStep?.skipable !== false) {
            e.preventDefault();
            skipStep();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTourOverlay, tourStep]);

  const handleNext = () => {
    if (!currentTour) return;
    const tour = DEMO_TOURS[currentTour];
    const nextIndex = Math.min(tourStep + 1, tour.steps.length - 1);
    const nextStepDef = tour.steps[nextIndex];
    if (nextStepDef) {
      navigateForStep(currentTour, nextStepDef.id);
    }
    nextStep();
  };

  const handlePrev = () => {
    if (!currentTour) return;
    const tour = DEMO_TOURS[currentTour];
    const prevIndex = Math.max(tourStep - 1, 0);
    const prevStepDef = tour.steps[prevIndex];
    if (prevStepDef) {
      navigateForStep(currentTour, prevStepDef.id);
    }
    prevStep();
  };

  if (!isActive || !showTourOverlay || !currentTour || !currentStep) {
    return null;
  }

  const tour = DEMO_TOURS[currentTour];
  const progress = ((tourStep + 1) / tour.steps.length) * 100;

  return (
    <>
      {/* Backdrop overlay -- semi-transparent */}
      <div
        className="fixed inset-0 bg-black/40 z-[45] transition-opacity duration-300"
        onClick={() => {
          // Click on backdrop ends tour
          endTour();
          trackInteraction({ type: 'click', stepId: currentStep.id, data: { action: 'backdrop_click' } });
        }}
      />

      {/* Element Highlight (only when element exists) */}
      {highlightPosition && elementFound && (
        <>
          <div
            className="pointer-events-none z-[46]"
            style={{
              position: 'absolute',
              top: highlightPosition.top - 8,
              left: highlightPosition.left - 8,
              width: highlightPosition.width + 16,
              height: highlightPosition.height + 16,
              border: '3px solid #3B82F6',
              borderRadius: '8px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.0)',
              animation: 'demo-pulse 2s infinite',
              transition: 'all 0.3s ease',
            }}
          />
          <div
            className="pointer-events-none z-[46]"
            style={{
              position: 'absolute',
              top: highlightPosition.top - 4,
              left: highlightPosition.left - 4,
              width: highlightPosition.width + 8,
              height: highlightPosition.height + 8,
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
            }}
          />
        </>
      )}

      {/* Tooltip -- positioned absolutely on page, NOT inside backdrop */}
      {elementFound && highlightPosition ? (
        <div
          className="bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-[55]"
          style={tooltipStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipContent
            currentStep={currentStep}
            tourStep={tourStep}
            tour={tour}
            progress={progress}
            canGoNext={canGoNext()}
            canGoPrev={canGoPrev()}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={skipStep}
            onEnd={endTour}
          />
        </div>
      ) : (
        /* Fallback: centred floating card when target element is not on current page */
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-[55] w-[380px] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipContent
            currentStep={currentStep}
            tourStep={tourStep}
            tour={tour}
            progress={progress}
            canGoNext={canGoNext()}
            canGoPrev={canGoPrev()}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={skipStep}
            onEnd={endTour}
          />
          {!elementFound && currentStep.targetElement && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              This step highlights a component on a different page. Use the Next button to continue, or navigate to the relevant page.
            </div>
          )}
        </div>
      )}

      {/* Mobile Tour Controls (Bottom Sheet Style) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white rounded-t-xl shadow-2xl border-t border-gray-200 p-4 z-[55]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-blue-600">Step {tourStep + 1} of {tour.steps.length}</div>
            <div className="font-semibold text-gray-900 text-sm">{currentStep.title}</div>
          </div>
          <button
            onClick={endTour}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-gray-700 text-sm mb-3">{currentStep.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev()}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          {canGoNext() ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={endTour}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
            >
              Complete
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* CSS animation for highlight pulse -- using a regular style tag instead of styled-jsx */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes demo-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { opacity: 0.85; box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        }
      `}} />
    </>
  );
}

/**
 * Shared tooltip content used in both positioned and centred modes
 */
function TooltipContent({
  currentStep,
  tourStep,
  tour,
  progress,
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
  onSkip,
  onEnd,
}: {
  currentStep: { id: string; title: string; description: string; skipable?: boolean; action?: string; data?: Record<string, any> };
  tourStep: number;
  tour: { name: string; steps: any[] };
  progress: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onEnd: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-medium text-blue-600">
              Step {tourStep + 1} of {tour.steps.length}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900">{currentStep.title}</h3>
        </div>
        <button
          onClick={onEnd}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">{currentStep.description}</p>

        {currentStep.data && typeof currentStep.data.insight === 'string' && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-800">
              <strong>Key Insight:</strong> {currentStep.data.insight}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!canGoPrev}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 rounded hover:bg-gray-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          {currentStep.skipable !== false && (
            <button
              onClick={onSkip}
              className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              Skip
            </button>
          )}
        </div>

        {canGoNext ? (
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
          >
            Next
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onEnd}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
          >
            Complete
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-3 pt-2 border-t border-gray-200 hidden md:block">
        <div className="text-[10px] text-gray-400 flex items-center gap-3">
          <span><kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">&#8594;</kbd> Next</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">&#8592;</kbd> Prev</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">Esc</kbd> Exit</span>
        </div>
      </div>
    </>
  );
}
