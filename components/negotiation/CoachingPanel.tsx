/**
 * Real-Time Coaching Panel Component
 *
 * Provides contextual coaching suggestions and guidance during trading
 * Integrates with NegotiationCoachingEngine to deliver tactical recommendations
 * A2: Real-Time Coaching Panel Enhancement
 */

'use client';

import React, { useState, useEffect } from 'react';
import { NegotiationState } from '../../lib/types';
import {
  CoachingSuggestion,
  CoachingRecommendation,
  CoachingCategory,
  CoachingDifficulty,
  CoachingHistoryEntry,
  generateCoaching,
  getCoachingCategories,
  getCategoryDescription
} from '../../lib/negotiation-coaching';

interface CoachingPanelProps {
  negotiationState: NegotiationState;
  isVisible: boolean;
  onToggleVisibility: () => void;
  className?: string;
}

const CoachingPanel: React.FC<CoachingPanelProps> = ({
  negotiationState,
  isVisible,
  onToggleVisibility,
  className = '',
}) => {
  const [difficulty, setDifficulty] = useState<CoachingDifficulty>('beginner');
  const [focusAreas, setFocusAreas] = useState<CoachingCategory[]>([]);
  const [coaching, setCoaching] = useState<CoachingRecommendation | null>(null);
  const [coachingHistory, setCoachingHistory] = useState<CoachingHistoryEntry[]>([]);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Update coaching when trading state changes
  useEffect(() => {
    if (isVisible) {
      try {
        const newCoaching = generateCoaching(negotiationState, difficulty, focusAreas.length > 0 ? focusAreas : undefined);
        setCoaching(newCoaching);
      } catch (error) {
        console.error('Coaching generation error:', error);
        // Set a fallback coaching state
        setCoaching({
          quickTip: {
            id: 'fallback-tip',
            category: 'information_gathering',
            priority: 'medium',
            title: 'Continue Trading',
            content: 'Consider your trading objectives and current position.',
            rationale: 'General guidance when coaching is unavailable',
            difficulty: 'beginner',
            actionable: true,
            expectedImpact: 'Maintain trading focus',
            riskLevel: 'low'
          },
          prioritizedSuggestions: [],
          phaseGuidance: 'Continue with your trading strategy.',
          warningFlags: [],
          nextBestActions: ['Consider your current position and objectives']
        });
      }
    }
  }, [negotiationState, difficulty, focusAreas, isVisible]);

  // Handle suggestion adoption tracking
  const handleSuggestionAdoption = (suggestion: CoachingSuggestion, adopted: boolean) => {
    const historyEntry: CoachingHistoryEntry = {
      timestamp: new Date().toISOString(),
      round: negotiationState.round,
      suggestion,
      adopted,
    };

    setCoachingHistory(prev => [...prev, historyEntry]);
  };

  // Toggle focus area
  const toggleFocusArea = (category: CoachingCategory) => {
    setFocusAreas(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getCategoryIcon = (category: CoachingCategory): string => {
    const icons = {
      price_tactics: '💰',
      information_gathering: '🔍',
      relationship_building: '🤝',
      timing: '⏰',
      risk_management: '⚠️',
      compliance: '📋',
    };
    return icons[category];
  };

  const getPriorityColor = (priority: CoachingSuggestion['priority']): string => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-amber-600 bg-amber-50 border-amber-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[priority];
  };

  const getRiskColor = (risk: CoachingSuggestion['riskLevel']): string => {
    const colors = {
      high: 'text-red-500',
      medium: 'text-amber-500',
      low: 'text-green-500',
    };
    return colors[risk];
  };

  if (!isVisible) {
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
        <button
          onClick={onToggleVisibility}
          className="bg-[#0EA5E9] text-white p-3 rounded-l-lg shadow-lg hover:bg-[#0284C7] transition-colors"
          title="Open Coaching Panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-slate-200 z-40 overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="">Real-Time Coaching</h3>
            <p className="bloomberg-section-label text-slate-300">Round {negotiationState.round} • {negotiationState.phase}</p>
          </div>
        </div>
        <button
          onClick={onToggleVisibility}
          className="text-slate-300 hover:text-white transition-colors"
          title="Close Coaching Panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        {/* Difficulty Toggle */}
        <div className="mb-3">
          <label className="bloomberg-section-label font-medium text-slate-600 block mb-1">Coaching Level</label>
          <div className="flex bg-white rounded-lg border border-slate-200">
            <button
              onClick={() => setDifficulty('beginner')}
              className={`flex-1 px-3 py-1.5 bloomberg-section-label font-medium rounded-l-lg transition-colors ${
                difficulty === 'beginner'
                  ? 'bg-[#0EA5E9] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setDifficulty('advanced')}
              className={`flex-1 px-3 py-1.5 bloomberg-section-label font-medium rounded-r-lg transition-colors ${
                difficulty === 'advanced'
                  ? 'bg-[#0EA5E9] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <label className="bloomberg-section-label font-medium text-slate-600 block mb-1">Focus Areas</label>
          <div className="flex flex-wrap gap-1">
            {getCoachingCategories().map(category => (
              <button
                key={category}
                onClick={() => toggleFocusArea(category)}
                className={`px-2 py-1 bloomberg-section-label rounded-full transition-colors ${
                  focusAreas.includes(category)
                    ? 'bg-[#0EA5E9] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
                title={getCategoryDescription(category)}
              >
                {getCategoryIcon(category)} {category.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bloomberg-section-label text-slate-600 hover:text-slate-800 flex items-center space-x-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{showHistory ? 'Current' : 'History'} ({coachingHistory.length})</span>
          </button>
          {coaching && (
            <div className="bloomberg-section-label text-slate-500">
              {coaching.warningFlags.length > 0 && (
                <span className="text-red-500">⚠️ {coaching.warningFlags.length}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {showHistory ? (
          /* History View */
          <div>
            <h4 className="font-medium text-slate-800 mb-3">Coaching History</h4>
            {coachingHistory.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="bloomberg-small-text">No coaching history yet</p>
                <p className="bloomberg-section-label">Suggestions you interact with will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coachingHistory.slice().reverse().map((entry, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bloomberg-section-label font-medium text-slate-600">Round {entry.round}</span>
                      <span className={`bloomberg-section-label px-2 py-1 rounded-full ${
                        entry.adopted ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {entry.adopted ? 'Adopted' : 'Skipped'}
                      </span>
                    </div>
                    <p className="bloomberg-small-text font-medium text-slate-800">{entry.suggestion.title}</p>
                    <p className="bloomberg-section-label text-slate-600 mt-1">{entry.suggestion.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Current Coaching View */
          <div>
            {coaching && (
              <>
                {/* Quick Tip */}
                <div className="mb-6">
                  <h4 className="font-medium text-slate-800 mb-2 flex items-center">
                    <span className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center bloomberg-section-label mr-2">
                      !
                    </span>
                    Quick Tip
                  </h4>
                  <div className={`border rounded-lg p-3 ${getPriorityColor(coaching.quickTip.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium bloomberg-small-text">{coaching.quickTip.title}</h5>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSuggestionAdoption(coaching.quickTip, true)}
                          className="bloomberg-section-label bg-white/50 hover:bg-white/80 px-2 py-1 rounded transition-colors"
                          title="Mark as adopted"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleSuggestionAdoption(coaching.quickTip, false)}
                          className="bloomberg-section-label bg-white/50 hover:bg-white/80 px-2 py-1 rounded transition-colors"
                          title="Skip suggestion"
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                    <p className="bloomberg-small-text mb-2">{coaching.quickTip.content}</p>
                    <div className="flex items-center justify-between bloomberg-section-label">
                      <span className="flex items-center space-x-2">
                        <span>{getCategoryIcon(coaching.quickTip.category)}</span>
                        <span>{coaching.quickTip.category.replace(/_/g, ' ')}</span>
                      </span>
                      <span className={getRiskColor(coaching.quickTip.riskLevel)}>
                        Risk: {coaching.quickTip.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning Flags */}
                {coaching.warningFlags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-red-600 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Warning Flags
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <ul className="bloomberg-small-text text-red-700 space-y-1">
                        {coaching.warningFlags.map((flag, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Phase Guidance */}
                <div className="mb-6">
                  <h4 className="font-medium text-slate-800 mb-2">Phase Guidance</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="bloomberg-small-text text-blue-800">{coaching.phaseGuidance}</p>
                  </div>
                </div>

                {/* Prioritized Suggestions */}
                <div className="mb-6">
                  <h4 className="font-medium text-slate-800 mb-2">Suggestions</h4>
                  <div className="space-y-3">
                    {coaching.prioritizedSuggestions.map((suggestion, index) => (
                      <div key={suggestion.id} className="border border-slate-200 rounded-lg">
                        <div
                          className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => setExpandedSuggestion(
                            expandedSuggestion === suggestion.id ? null : suggestion.id
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`bloomberg-section-label px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                                  {suggestion.priority}
                                </span>
                                <span className="bloomberg-section-label text-slate-500">
                                  {getCategoryIcon(suggestion.category)} {suggestion.category.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <h5 className="font-medium bloomberg-small-text text-slate-800">{suggestion.title}</h5>
                              <p className="bloomberg-section-label text-slate-600 mt-1">{suggestion.content}</p>
                            </div>
                            <svg
                              className={`w-4 h-4 text-slate-400 transition-transform ${
                                expandedSuggestion === suggestion.id ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {expandedSuggestion === suggestion.id && (
                          <div className="border-t border-slate-200 p-3 bg-slate-50">
                            <div className="space-y-2">
                              <div>
                                <h6 className="bloomberg-section-label font-medium text-slate-700">Rationale:</h6>
                                <p className="bloomberg-section-label text-slate-600">{suggestion.rationale}</p>
                              </div>
                              <div>
                                <h6 className="bloomberg-section-label font-medium text-slate-700">Expected Impact:</h6>
                                <p className="bloomberg-section-label text-slate-600">{suggestion.expectedImpact}</p>
                              </div>
                              {suggestion.timing && (
                                <div>
                                  <h6 className="bloomberg-section-label font-medium text-slate-700">Timing:</h6>
                                  <p className="bloomberg-section-label text-slate-600">{suggestion.timing}</p>
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-2">
                                <span className={`bloomberg-section-label ${getRiskColor(suggestion.riskLevel)}`}>
                                  Risk: {suggestion.riskLevel}
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleSuggestionAdoption(suggestion, true)}
                                    className="bloomberg-section-label bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded transition-colors"
                                  >
                                    Adopt
                                  </button>
                                  <button
                                    onClick={() => handleSuggestionAdoption(suggestion, false)}
                                    className="bloomberg-section-label bg-slate-200 text-slate-600 hover:bg-slate-300 px-2 py-1 rounded transition-colors"
                                  >
                                    Skip
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Best Actions */}
                {coaching.nextBestActions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Next Best Actions</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <ul className="bloomberg-small-text text-green-800 space-y-1">
                        {coaching.nextBestActions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">→</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachingPanel;