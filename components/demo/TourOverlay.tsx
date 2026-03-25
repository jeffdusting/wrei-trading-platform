/**
 * WREI Trading Platform - Tour Overlay Component
 *
 * Interactive guided tour system with smart highlighting and contextual tooltips
 * Provides seamless navigation through demo scenarios
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDemoMode, DEMO_TOURS } from '@/lib/demo-mode/demo-state-manager';

interface TourOverlayProps {
  className?: string;
}

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TourOverlay({ className = '' }: TourOverlayProps) {
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
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const currentStep = getCurrentStep();

  // Calculate element position and update highlight
  useEffect(() => {
    if (!currentStep?.targetElement || !showTourOverlay) {
      setHighlightPosition(null);
      setTooltipPosition(null);
      return;
    }

    const updatePositions = () => {
      const targetElement = document.querySelector(currentStep.targetElement!);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Highlight position (absolute to page)
      const highlightPos: HighlightPosition = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
      };
      setHighlightPosition(highlightPos);

      // Tooltip position calculation
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const padding = 16;

      let tooltipLeft = rect.left + scrollLeft + rect.width / 2 - tooltipWidth / 2;
      let tooltipTop = rect.top + scrollTop + rect.height + padding;

      // Adjust for viewport boundaries
      if (tooltipLeft < padding) {
        tooltipLeft = padding;
      } else if (tooltipLeft + tooltipWidth > window.innerWidth - padding) {
        tooltipLeft = window.innerWidth - tooltipWidth - padding;
      }

      // If tooltip would be below viewport, position above
      if (tooltipTop + tooltipHeight > window.innerHeight + scrollTop - padding) {
        tooltipTop = rect.top + scrollTop - tooltipHeight - padding;
      }

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });

      // Auto-scroll to element if needed
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

    // Initial calculation
    updatePositions();

    // Update on scroll and resize
    const handleUpdate = () => requestAnimationFrame(updatePositions);
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [currentStep, showTourOverlay]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!showTourOverlay) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Space':
          e.preventDefault();
          if (canGoNext()) nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (canGoPrev()) prevStep();
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
  }, [showTourOverlay, canGoNext, canGoPrev, nextStep, prevStep, skipStep, endTour, currentStep]);

  // Track tour interactions
  const handleStepAction = (action: string) => {
    trackInteraction({
      type: 'click',
      stepId: currentStep?.id,
      data: { action, stepIndex: tourStep }
    });
  };

  if (!isActive || !showTourOverlay || !currentTour || !currentStep) {
    return null;
  }

  const tour = DEMO_TOURS[currentTour];
  const progress = ((tourStep + 1) / tour.steps.length) * 100;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${className}`}
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            endTour();
            handleStepAction('backdrop_click');
          }
        }}
      >
        {/* Element Highlight */}
        {highlightPosition && (
          <>
            {/* Highlight Ring */}
            <div
              className="absolute border-4 border-blue-500 rounded-lg shadow-lg transition-all duration-300 pointer-events-none"
              style={{
                top: highlightPosition.top - 8,
                left: highlightPosition.left - 8,
                width: highlightPosition.width + 16,
                height: highlightPosition.height + 16,
                animation: 'pulse 2s infinite'
              }}
            />

            {/* Spotlight Effect */}
            <div
              className="absolute bg-white/10 border-2 border-white/30 rounded-lg backdrop-blur-sm transition-all duration-300 pointer-events-none"
              style={{
                top: highlightPosition.top - 4,
                left: highlightPosition.left - 4,
                width: highlightPosition.width + 8,
                height: highlightPosition.height + 8
              }}
            />
          </>
        )}

        {/* Tour Tooltip */}
        {tooltipPosition && (
          <div
            className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm z-50 transform transition-all duration-300"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              minWidth: '320px'
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-600">
                    Step {tourStep + 1} of {tour.steps.length}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{currentStep.title}</h3>
              </div>

              <button
                onClick={() => {
                  endTour();
                  handleStepAction('close_button');
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{currentStep.description}</p>

              {currentStep.data && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Key Insight:</strong>{' '}
                    {typeof currentStep.data.insight === 'string' ? currentStep.data.insight : 'Additional context available.'}
                  </div>
                </div>
              )}

              {currentStep.action && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <strong>Action:</strong> {currentStep.action}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    prevStep();
                    handleStepAction('previous');
                  }}
                  disabled={!canGoPrev()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {currentStep.skipable !== false && (
                  <button
                    onClick={() => {
                      skipStep();
                      handleStepAction('skip');
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                  >
                    Skip
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canGoNext() ? (
                  <button
                    onClick={() => {
                      nextStep();
                      handleStepAction('next');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      endTour();
                      handleStepAction('complete');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                  >
                    Complete Tour
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd>
                  Next
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd>
                  Previous
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd>
                  Exit
                </span>
              </div>
            </div>

            {/* Tooltip Arrow */}
            <div
              className="absolute w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45 -translate-y-2"
              style={{
                top: highlightPosition && tooltipPosition && tooltipPosition.top > highlightPosition.top + highlightPosition.height
                  ? 0
                  : undefined,
                bottom: highlightPosition && tooltipPosition && tooltipPosition.top < highlightPosition.top
                  ? 0
                  : undefined,
                left: '50%',
                marginLeft: '-8px'
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile Tour Controls (Bottom Sheet Style) */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-blue-600">Step {tourStep + 1} of {tour.steps.length}</div>
            <div className="font-semibold text-gray-900">{currentStep.title}</div>
          </div>
          <button
            onClick={() => {
              endTour();
              handleStepAction('mobile_close');
            }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-gray-700 text-sm mb-4">{currentStep.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              prevStep();
              handleStepAction('mobile_previous');
            }}
            disabled={!canGoPrev()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {canGoNext() ? (
            <button
              onClick={() => {
                nextStep();
                handleStepAction('mobile_next');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => {
                endTour();
                handleStepAction('mobile_complete');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
            >
              Complete
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>
    </>
  );
}