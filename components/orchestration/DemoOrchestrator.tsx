'use client';

/**
 * WREI Trading Platform - AI Demo Orchestrator Component
 *
 * Stage 2: Component 1 - AI Demo Orchestration Engine
 * React interface component for simplified demo scenario management
 * MIGRATED: Now uses simplified demo data instead of complex tour system
 *
 * Date: March 28, 2026
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSimpleDemoStore, SimpleDemoDataSet } from '@/lib/demo-mode/simple-demo-state';
import { getDemoDataForSet, DemoDataSet } from '@/lib/demo-mode/demo-data-simple';

// UI Components
import {
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  CogIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Simplified types for demo orchestration
type ScenarioPhase = 'initialization' | 'data_loading' | 'execution' | 'completion';
type EngagementLevel = 'low' | 'medium' | 'high' | 'very_high';

interface SimplifiedOrchestrationEvent {
  id: string;
  timestamp: Date;
  type: 'scenario_started' | 'data_loaded' | 'scenario_changed' | 'session_completed';
  data: any;
}

interface DemoOrchestratorProps {
  // Simplified demo system integration
  currentDataSet?: SimpleDemoDataSet;
  onDataSetChange?: (dataSet: SimpleDemoDataSet) => void;

  // Demo session management
  sessionId?: string;
  autoStart?: boolean;

  // Event callbacks
  onEvent?: (event: SimplifiedOrchestrationEvent) => void;
  onScenarioData?: (data: DemoDataSet) => void;
}

export const DemoOrchestrator: React.FC<DemoOrchestratorProps> = ({
  currentDataSet,
  onDataSetChange,
  sessionId,
  autoStart = false,
  onEvent,
  onScenarioData
}) => {
  // Simplified demo state using Zustand store
  const { isActive: demoActive, selectedDataSet, demoData, activateDemo, deactivateDemo } = useSimpleDemoStore();

  // Component state
  const [currentPhase, setCurrentPhase] = useState<ScenarioPhase>('initialization');
  const [engagementLevel, setEngagementLevel] = useState<EngagementLevel>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentEvents, setRecentEvents] = useState<SimplifiedOrchestrationEvent[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // UI state
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Refs for intervals
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !demoActive && currentDataSet) {
      handleStartScenario();
    }
  }, [autoStart, demoActive, currentDataSet]);

  // Monitor demo state changes
  useEffect(() => {
    if (demoActive && demoData) {
      onScenarioData?.(demoData);
      setCurrentPhase('execution');
    } else {
      setCurrentPhase('initialization');
      setCompletionPercentage(0);
    }
  }, [demoActive, demoData, onScenarioData]);

  // Handle data set changes
  useEffect(() => {
    if (currentDataSet && currentDataSet !== selectedDataSet) {
      if (demoActive) {
        // Switch to new data set
        activateDemo(currentDataSet);
        emitEvent('scenario_changed', { newDataSet: currentDataSet, oldDataSet: selectedDataSet });
      }
    }
  }, [currentDataSet, selectedDataSet, demoActive, activateDemo]);

  // Event emission helper
  const emitEvent = useCallback((type: SimplifiedOrchestrationEvent['type'], data: any) => {
    const event: SimplifiedOrchestrationEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      data
    };

    setRecentEvents(prev => [event, ...prev.slice(0, 9)]);
    onEvent?.(event);
  }, [onEvent]);

  // Progress tracking
  const updateProgress = useCallback(() => {
    if (!sessionStartTime || !demoActive) return;

    const elapsed = Date.now() - sessionStartTime.getTime();
    const estimatedDuration = 30 * 1000; // 30 seconds for demo
    const progress = Math.min(100, Math.round((elapsed / estimatedDuration) * 100));

    setCompletionPercentage(progress);

    if (progress >= 100) {
      setCurrentPhase('completion');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  }, [sessionStartTime, demoActive]);

  // Start demo scenario
  const handleStartScenario = async () => {
    const targetDataSet = currentDataSet || 'institutional';

    if (!targetDataSet) {
      console.error('Cannot start scenario: missing data set');
      return;
    }

    setIsProcessing(true);
    setCurrentPhase('data_loading');

    try {
      // Activate the selected demo data set
      activateDemo(targetDataSet);

      // Set session start time and begin progress tracking
      const startTime = new Date();
      setSessionStartTime(startTime);
      setCompletionPercentage(0);

      // Start progress interval
      progressIntervalRef.current = setInterval(updateProgress, 1000);

      // Emit start event
      emitEvent('scenario_started', {
        sessionId: sessionId || `session-${Date.now()}`,
        dataSet: targetDataSet,
        startTime
      });

      // Move to execution phase after loading
      setTimeout(() => {
        setCurrentPhase('execution');
        emitEvent('data_loaded', { dataSet: targetDataSet });
      }, 1000);

    } catch (error) {
      console.error('Failed to start scenario:', error);
      setCurrentPhase('initialization');
    } finally {
      setIsProcessing(false);
    }
  };

  // Change data set (simplified version of scenario change)
  const handleChangeDataSet = (newDataSet: SimpleDemoDataSet) => {
    if (newDataSet === selectedDataSet) return;

    setIsProcessing(true);

    try {
      activateDemo(newDataSet);
      onDataSetChange?.(newDataSet);

      emitEvent('scenario_changed', {
        newDataSet,
        oldDataSet: selectedDataSet,
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Stop demo scenario
  const handleStopScenario = async () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    deactivateDemo();
    setCurrentPhase('initialization');
    setCompletionPercentage(0);
    setSessionStartTime(null);

    emitEvent('session_completed', {
      sessionId: sessionId || `session-${Date.now()}`,
      endTime: new Date(),
      result: 'manual_stop'
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Helper functions for UI
  const getPhaseIcon = (phase: ScenarioPhase) => {
    switch (phase) {
      case 'initialization': return <CogIcon className="w-5 h-5" />;
      case 'data_loading': return <ArrowPathIcon className="w-5 h-5 animate-spin" />;
      case 'execution': return <PlayCircleIcon className="w-5 h-5" />;
      case 'completion': return <CheckCircleIcon className="w-5 h-5" />;
    }
  };

  const getEngagementColor = (level: EngagementLevel) => {
    switch (level) {
      case 'low': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'high': return 'text-green-600 bg-green-50';
      case 'very_high': return 'text-green-700 bg-green-100';
    }
  };

  const getDataSetDisplayName = (dataSet: SimpleDemoDataSet) => {
    switch (dataSet) {
      case 'institutional': return 'ESG Fund Manager';
      case 'retail': return 'Sustainability Director';
      case 'compliance': return 'Government Procurement';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CogIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="bloomberg-card-title text-gray-900">Demo Scenario Manager</h2>
              <p className="bloomberg-small-text text-gray-500">Simplified demo orchestration with AI insights</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Control buttons */}
            {!demoActive ? (
              <button
                onClick={handleStartScenario}
                disabled={!currentDataSet || isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlayCircleIcon className="w-5 h-5" />
                <span>Start Scenario</span>
              </button>
            ) : (
              <button
                onClick={handleStopScenario}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopCircleIcon className="w-5 h-5" />
                <span>Stop</span>
              </button>
            )}

            {/* Data set selector */}
            {demoActive && selectedDataSet && (
              <select
                value={selectedDataSet}
                onChange={(e) => handleChangeDataSet(e.target.value as SimpleDemoDataSet)}
                disabled={isProcessing}
                className="px-3 py-2 border border-gray-300 rounded-lg bloomberg-small-text disabled:opacity-50"
              >
                <option value="institutional">ESG Fund Manager</option>
                <option value="retail">Sustainability Director</option>
                <option value="compliance">Government Procurement</option>
              </select>
            )}

            <button
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Display */}
      {demoActive && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Current Phase */}
            <div className="flex items-center space-x-2">
              {getPhaseIcon(currentPhase)}
              <div>
                <p className="bloomberg-section-label font-medium text-gray-500 uppercase tracking-wide">Phase</p>
                <p className="bloomberg-small-text  text-gray-900">
                  {currentPhase.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Data Set */}
            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 bg-blue-100 rounded-full bloomberg-section-label font-medium text-blue-700">
                {selectedDataSet || 'None'}
              </div>
              <div>
                <p className="bloomberg-section-label font-medium text-gray-500 uppercase tracking-wide">Scenario</p>
                <p className="bloomberg-small-text  text-gray-900">
                  {selectedDataSet ? getDataSetDisplayName(selectedDataSet) : 'Not selected'}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div>
              <p className="bloomberg-section-label font-medium text-gray-500 uppercase tracking-wide">Progress</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="bloomberg-small-text  text-gray-900">
                  {completionPercentage}%
                </span>
              </div>
            </div>

            {/* Engagement Level */}
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${getEngagementColor(engagementLevel)}`}>
                {engagementLevel}
              </div>
              <div>
                <p className="bloomberg-section-label font-medium text-gray-500 uppercase tracking-wide">Engagement</p>
                <p className="bloomberg-small-text  text-gray-900">
                  Simulated
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Scenario Data Display */}
      {demoData && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="bloomberg-small-text  text-blue-900 mb-1">
                Active Scenario: {demoData.persona.name} ({demoData.persona.title})
              </h4>
              <p className="bloomberg-small-text text-blue-700 mb-2">
                Organisation: {demoData.persona.organisation}
              </p>
              <div className="flex items-center justify-between">
                <span className="bloomberg-section-label text-blue-600">
                  Base Price: ${demoData.marketData.basePrice}/tonne
                </span>
                <span className="bloomberg-section-label text-blue-600">
                  Target: {Math.round(demoData.portfolioMetrics.targetAllocation / 1000)}k allocation
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="w-4 h-4 text-amber-600 animate-spin" />
            <span className="bloomberg-small-text text-amber-700">Processing orchestration decisions...</span>
          </div>
        </div>
      )}

      {/* Advanced Controls */}
      {showAdvancedControls && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="bloomberg-small-text  text-gray-900 mb-3">Advanced Controls</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="bloomberg-small-text">Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="px-6 py-4">
          <h4 className="bloomberg-small-text  text-gray-900 mb-3">Recent Events</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start space-x-2 bloomberg-small-text">
                <span className="bloomberg-section-label text-gray-500 min-w-16">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded bloomberg-section-label font-medium">
                  {event.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data set warning */}
      {!currentDataSet && !demoActive && (
        <div className="px-6 py-4 bg-amber-50 border-l-4 border-amber-400">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
            <p className="bloomberg-small-text text-amber-700">
              Please select a data set to begin scenario orchestration
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoOrchestrator;