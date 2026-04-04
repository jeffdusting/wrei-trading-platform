/**
 * WREI Trading Platform - Demo Mode Toggle Component
 *
 * Navigation integration for demo mode activation.
 * Supports compact mode (for nav bar) and full mode (standalone).
 * Tour controls are handled by DemoControlBar when active.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDemoMode, DEMO_TOURS, type DemoTourType } from '@/lib/demo-mode/demo-state-manager';

interface DemoModeToggleProps {
  className?: string;
  /** Compact mode: just the toggle button, no inline tour controls */
  compact?: boolean;
}

export default function DemoModeToggle({ className = '', compact = false }: DemoModeToggleProps) {
  const {
    isActive,
    activateDemo,
    deactivateDemo,
    startTour,
  } = useDemoMode();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  if (isActive && compact) {
    // When demo is active in compact mode, the DemoControlBar handles everything
    return null;
  }

  if (isActive && !compact) {
    // Full mode active state -- show status + exit only
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="bloomberg-section-label font-medium">Demo Active</span>
        </div>
        <button
          onClick={deactivateDemo}
          className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          title="Exit Demo Mode"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  // Inactive state -- show activation button with dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-md bloomberg-small-text font-medium transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <svg
          className="w-3.5 h-3.5"
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
        Demo
        <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-[100]">
          <div className="p-3">
            <h3 className=" text-gray-900 mb-2 bloomberg-small-text">Choose Demo Experience</h3>

            <div className="space-y-1">
              <button
                onClick={() => {
                  activateDemo('self-service');
                  startTour('executive-overview');
                  setDropdownOpen(false);
                }}
                className="w-full text-left p-2 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
              >
                <div className="font-medium text-gray-900 bloomberg-small-text">Executive Overview</div>
                <div className="bloomberg-section-label text-gray-600">12 min high-level platform tour</div>
              </button>

              <button
                onClick={() => {
                  activateDemo('self-service');
                  startTour('investor-deep-dive');
                  setDropdownOpen(false);
                }}
                className="w-full text-left p-2 rounded-md hover:bg-green-50 border border-transparent hover:border-green-200 transition-colors"
              >
                <div className="font-medium text-gray-900 bloomberg-small-text">Investor Deep Dive</div>
                <div className="bloomberg-section-label text-gray-600">18 min comprehensive experience</div>
              </button>

              <button
                onClick={() => {
                  activateDemo('self-service');
                  startTour('technical-integration');
                  setDropdownOpen(false);
                }}
                className="w-full text-left p-2 rounded-md hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-colors"
              >
                <div className="font-medium text-gray-900 bloomberg-small-text">Technical Integration</div>
                <div className="bloomberg-section-label text-gray-600">15 min developer-focused tour</div>
              </button>

              <button
                onClick={() => {
                  activateDemo('self-service');
                  startTour('carbon-negotiation');
                  setDropdownOpen(false);
                }}
                className="w-full text-left p-2 rounded-md hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
              >
                <div className="font-medium text-gray-900 bloomberg-small-text">Carbon Negotiation</div>
                <div className="bloomberg-section-label text-gray-600">8 min AI negotiation demo</div>
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={() => {
                  activateDemo('investor-briefing');
                  startTour('executive-overview');
                  setDropdownOpen(false);
                }}
                className="w-full text-left p-2 rounded-md hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
              >
                <div className="font-medium text-gray-900 bloomberg-small-text">Presentation Mode</div>
                <div className="bloomberg-section-label text-gray-600">Guided investor presentation</div>
              </button>

              <button
                onClick={() => {
                  activateDemo('self-service');
                  setDropdownOpen(false);
                }}
                className="w-full text-left p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
              >
                <div className="font-medium text-gray-900 bloomberg-small-text">Free Explore</div>
                <div className="bloomberg-section-label text-gray-600">Demo mode without guided tour</div>
              </button>
            </div>
          </div>
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
    <div className="fixed top-4 right-4 bg-black/80 text-white rounded-lg px-4 py-2 z-[100]">
      <div className="flex items-center gap-3">
        <div className="bloomberg-small-text font-medium">Investor Briefing</div>
        <div className="w-24 bg-white/20 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="bloomberg-small-text opacity-75">
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
    <div className="fixed bottom-4 left-4 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 bloomberg-small-text font-medium shadow-sm z-40">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Using demo data
      </div>
    </div>
  );
}
