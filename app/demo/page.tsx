/**
 * WREI Trading Platform - Demo Mode Landing Page
 *
 * Comprehensive demo mode showcase with tour selection and presentation options
 * Professional entry point for investor briefings and technical demonstrations
 */

'use client';

import React from 'react';
import { useDemoMode, DEMO_TOURS, type DemoTourType } from '@/lib/demo-mode/demo-state-manager';
import { PRESENTATION_SCRIPTS } from '@/lib/demo-mode/presentation-script';
import { DemoHighlight, DemoMetricsDisplay } from '@/components/demo/DemoDataProvider';

export default function DemoPage() {
  const { isActive, currentTour, activateDemo, startTour } = useDemoMode();

  const handleStartDemo = (tourType: DemoTourType, presentationMode: 'self-service' | 'investor-briefing' = 'self-service') => {
    if (!isActive) {
      activateDemo(presentationMode);
    }
    startTour(tourType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <DemoHighlight demoId="demo-hero" className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B2A4A] to-blue-900 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                WREI Platform Demo Mode
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-4xl mx-auto">
                Experience institutional-grade carbon credit trading with guided tours,
                realistic scenarios, and professional presentation modes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleStartDemo('executive-overview')}
                  className="px-8 py-4 bg-[#0EA5E9] hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                  Start Executive Overview
                </button>
                <button
                  onClick={() => handleStartDemo('investor-deep-dive')}
                  className="px-8 py-4 bg-white hover:bg-gray-100 text-[#1B2A4A] font-semibold rounded-lg transition-colors shadow-lg"
                >
                  Full Investor Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      </DemoHighlight>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Demo Status */}
        {isActive && currentTour && (
          <DemoHighlight demoId="demo-status" className="mb-12">
            <div className="bg-green-100 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Demo Mode Active</h3>
                  <p className="text-green-700">
                    Currently running: <strong>{DEMO_TOURS[currentTour].name}</strong>
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {DEMO_TOURS[currentTour].description}
                  </p>
                </div>
              </div>
            </div>
          </DemoHighlight>
        )}

        {/* Tour Selection */}
        <DemoHighlight demoId="tour-selection" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Demo Experience</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Select from our comprehensive demo tours designed for different audiences and use cases.
              Each tour includes realistic data, guided explanations, and interactive elements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.values(DEMO_TOURS).map((tour) => (
              <div key={tour.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{tour.name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {tour.duration}min
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{tour.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    <strong>Target:</strong> {tour.targetAudience}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Tour Highlights:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tour.outcomes.slice(0, 3).map((outcome, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleStartDemo(tour.id)}
                    className="w-full px-4 py-2 bg-[#0EA5E9] hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                  >
                    Start {tour.name}
                  </button>

                  {(tour.id === 'executive-overview' || tour.id === 'investor-deep-dive') && (
                    <button
                      onClick={() => handleStartDemo(tour.id, 'investor-briefing')}
                      className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
                    >
                      Presentation Mode
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DemoHighlight>

        {/* Presentation Scripts */}
        <DemoHighlight demoId="presentation-scripts" className="mb-16">
          <div className="bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Presentation Scripts & Talking Points</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {Object.values(PRESENTATION_SCRIPTS).map((script) => (
                <div key={script.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{script.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>Duration: {script.duration}min</span>
                      <span>•</span>
                      <span>{script.targetAudience}</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Structured presentation with {script.slides.length} sections covering platform capabilities,
                      competitive advantages, and implementation pathways.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Key Objectives:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {script.objectives.slice(0, 3).map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-500 mb-3">
                      Includes: {script.appendix.qnaPrep.length} Q&A scenarios,
                      {script.appendix.followUpMaterials.length} follow-up materials
                    </div>
                    <button
                      onClick={() => {
                        // Start corresponding tour in presentation mode
                        const tourId = script.id === 'investor-briefing' ? 'executive-overview' : 'technical-integration';
                        handleStartDemo(tourId as DemoTourType, 'investor-briefing');
                      }}
                      className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
                    >
                      Start Presentation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DemoHighlight>

        {/* Features Overview */}
        <DemoHighlight demoId="features-overview" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Demo Mode Features</h2>
            <p className="text-lg text-gray-600">
              Professional-grade demonstration capabilities designed for institutional audiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-populated Data</h3>
              <p className="text-gray-600">
                Realistic institutional scenarios with Australian market context,
                professional personas, and compelling narratives.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Guided Tours</h3>
              <p className="text-gray-600">
                Interactive step-by-step tours with contextual explanations,
                keyboard navigation, and professional presentation flow.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Metrics</h3>
              <p className="text-gray-600">
                Session tracking, engagement metrics, and completion analytics
                for presentation effectiveness measurement.
              </p>
            </div>
          </div>
        </DemoHighlight>

        {/* Call to Action */}
        <DemoHighlight demoId="demo-cta" className="text-center">
          <div className="bg-gradient-to-r from-[#1B2A4A] to-blue-900 rounded-xl text-white p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience WREI?</h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Start with our executive overview for a comprehensive introduction,
              or jump into the full investor experience for detailed exploration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleStartDemo('executive-overview')}
                className="px-8 py-4 bg-[#0EA5E9] hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                Executive Overview (12min)
              </button>
              <button
                onClick={() => handleStartDemo('investor-deep-dive')}
                className="px-8 py-4 bg-white hover:bg-gray-100 text-[#1B2A4A] font-semibold rounded-lg transition-colors shadow-lg"
              >
                Full Experience (18min)
              </button>
            </div>
          </div>
        </DemoHighlight>
      </div>

      {/* Demo Metrics Display (only shows when demo is active) */}
      <DemoMetricsDisplay />
    </div>
  );
}