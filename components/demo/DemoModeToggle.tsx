/**
 * WREI Trading Platform - Demo Mode Toggle Component
 *
 * Navigation integration for demo mode activation and tour controls
 * Professional UI with clear indication of demo status
 */

'use client';

import React from 'react';
import { useDemoMode, DEMO_TOURS, type DemoTourType } from '@/lib/demo-mode/demo-state-manager';

interface DemoModeToggleProps {
  className?: string;
}

export default function DemoModeToggle({ className = '' }: DemoModeToggleProps) {
  const {
    isActive,
    currentTour,
    tourStep,
    presentationMode,
    activateDemo,
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

  if (!isActive) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Demo Mode Activation */}
        <div className="relative group">
          <button
            onClick={() => activateDemo('self-service')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Demo Mode
          </button>

          {/* Demo Mode Options Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Choose Demo Experience</h3>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    activateDemo('self-service');
                    startTour('executive-overview');
                  }}
                  className="w-full text-left p-3 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                >
                  <div className="font-medium text-gray-900">Executive Overview</div>
                  <div className="text-sm text-gray-600">12-minute high-level platform tour</div>
                </button>

                <button
                  onClick={() => {
                    activateDemo('self-service');
                    startTour('investor-deep-dive');
                  }}
                  className="w-full text-left p-3 rounded-md hover:bg-green-50 border border-transparent hover:border-green-200 transition-colors"
                >
                  <div className="font-medium text-gray-900">Investor Deep Dive</div>
                  <div className="text-sm text-gray-600">18-minute comprehensive experience</div>
                </button>

                <button
                  onClick={() => {
                    activateDemo('self-service');
                    startTour('technical-integration');
                  }}
                  className="w-full text-left p-3 rounded-md hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-colors"
                >
                  <div className="font-medium text-gray-900">Technical Integration</div>
                  <div className="text-sm text-gray-600">15-minute developer-focused tour</div>
                </button>

                <button
                  onClick={() => {
                    activateDemo('investor-briefing');
                    startTour('executive-overview');
                  }}
                  className="w-full text-left p-3 rounded-md hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
                >
                  <div className="font-medium text-gray-900">Presentation Mode</div>
                  <div className="text-sm text-gray-600">Guided investor presentation</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Demo Mode Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-md border border-green-200">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Demo Mode</span>
      </div>

      {/* Tour Controls */}
      {currentTour && (
        <>
          {/* Tour Progress */}
          <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
            <div className="text-sm font-medium text-gray-700">
              {DEMO_TOURS[currentTour].name}
            </div>

            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>

            <div className="text-sm text-gray-500 min-w-max">
              {tourStep + 1} of {DEMO_TOURS[currentTour].steps.length}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            <button
              onClick={prevStep}
              disabled={!canGoPrev()}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous Step"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextStep}
              disabled={!canGoNext()}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next Step"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <button
              onClick={skipStep}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Skip Step"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3m-4-6l3 3-3 3" />
              </svg>
            </button>

            <button
              onClick={endTour}
              className="p-2 rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors"
              title="End Tour"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Tour Selection Dropdown (when in demo mode but no active tour) */}
      {!currentTour && (
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
            Start Tour
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-2">
              {Object.values(DEMO_TOURS).map((tour) => (
                <button
                  key={tour.id}
                  onClick={() => startTour(tour.id)}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm">{tour.name}</div>
                  <div className="text-xs text-gray-600">{tour.duration}min • {tour.targetAudience}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exit Demo Mode */}
      <button
        onClick={deactivateDemo}
        className="p-2 rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors"
        title="Exit Demo Mode"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>

      {/* Current Step Info */}
      {currentStep && (
        <div className="hidden xl:block bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 max-w-sm">
          <div className="text-sm font-medium text-blue-900">{currentStep.title}</div>
          <div className="text-xs text-blue-700 mt-0.5 line-clamp-2">{currentStep.description}</div>
        </div>
      )}
    </div>
  );
}

// Presentation Mode Status (for investor briefings)
export function DemoPresentationStatus() {
  const { isActive, presentationMode, currentTour, tourStep } = useDemoMode();

  if (!isActive || presentationMode !== 'investor-briefing' || !currentTour) return null;

  const tour = DEMO_TOURS[currentTour];
  const progress = ((tourStep + 1) / tour.steps.length) * 100;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white rounded-lg px-4 py-2 z-50">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">Investor Briefing</div>
        <div className="w-24 bg-white/20 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-sm opacity-75">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

// Demo Mode Data Indicator (shows when using pre-populated data)
export function DemoDataIndicator() {
  const { isActive, prePopulatedData } = useDemoMode();

  if (!isActive || !prePopulatedData) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-sm font-medium shadow-sm z-40">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Using demo data
      </div>
    </div>
  );
}