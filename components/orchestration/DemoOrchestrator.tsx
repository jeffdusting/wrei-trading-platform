'use client';

/**
 * WREI Trading Platform - AI Demo Orchestrator Component
 *
 * Stage 2: Component 1 - AI Demo Orchestration Engine
 * React interface component for intelligent demo flow management
 *
 * Date: March 26, 2026
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DemoOrchestrationEngine } from '@/lib/ai-orchestration/DemoOrchestrationEngine';
import {
  OrchestrationState,
  OrchestrationPhase,
  AudienceAnalysis,
  ContextAssessment,
  OrchestrationDecision,
  OrchestrationAction,
  EngagementLevel,
  KnowledgeLevel,
  DemoObjective,
  OrchestrationEvent
} from './types';
import { AudienceType } from '../audience';
import { ScenarioType } from '../scenarios/types';

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

interface DemoOrchestratorProps {
  // Integration with existing audience system
  currentAudience?: AudienceType;
  onAudienceChange?: (audience: AudienceType) => void;

  // Integration with scenario system
  availableScenarios?: ScenarioType[];
  onScenarioChange?: (scenario: ScenarioType) => void;

  // Demo session management
  sessionId?: string;
  autoStart?: boolean;

  // Configuration overrides
  maxDuration?: number;
  adaptationEnabled?: boolean;

  // Event callbacks
  onOrchestrationEvent?: (event: OrchestrationEvent) => void;
  onStateChange?: (state: OrchestrationState) => void;
  onDecisionMade?: (decision: OrchestrationDecision) => void;
}

export const DemoOrchestrator: React.FC<DemoOrchestratorProps> = ({
  currentAudience,
  onAudienceChange,
  availableScenarios,
  onScenarioChange,
  sessionId,
  autoStart = false,
  maxDuration = 30,
  adaptationEnabled = true,
  onOrchestrationEvent,
  onStateChange,
  onDecisionMade
}) => {
  // Core orchestration state
  const [orchestrationState, setOrchestrationState] = useState<OrchestrationState | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<OrchestrationDecision | null>(null);
  const [recentEvents, setRecentEvents] = useState<OrchestrationEvent[]>([]);

  // UI state
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for engine and intervals
  const engineRef = useRef<DemoOrchestrationEngine | null>(null);
  const orchestrationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventListenerRef = useRef<((event: OrchestrationEvent) => void) | null>(null);

  // Refs for latest state values (avoids stale closures in setInterval callbacks)
  const isActiveRef = useRef(false);
  const isPausedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // Initialize orchestration engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = DemoOrchestrationEngine.getInstance();
    }
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isActive && currentAudience) {
      handleStartOrchestration();
    }
  }, [autoStart, currentAudience]);

  // Event listener setup
  useEffect(() => {
    const handleEvent = (event: OrchestrationEvent) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 9)]);
      onOrchestrationEvent?.(event);

      // Handle specific event types
      switch (event.type) {
        case 'audience_analyzed':
          if (event.data.detectedType !== currentAudience) {
            onAudienceChange?.(event.data.detectedType);
          }
          break;
        case 'scenario_selected':
          onScenarioChange?.(event.data.scenarioType);
          break;
        case 'adaptation_triggered':
          setCurrentDecision(event.data.decision);
          break;
      }
    };

    eventListenerRef.current = handleEvent;
    return () => {
      eventListenerRef.current = null;
    };
  }, [currentAudience, onOrchestrationEvent, onAudienceChange, onScenarioChange]);

  // Refs for callbacks (avoids stale closures in setInterval)
  const onStateChangeRef = useRef(onStateChange);
  const onDecisionMadeRef = useRef(onDecisionMade);
  useEffect(() => { onStateChangeRef.current = onStateChange; }, [onStateChange]);
  useEffect(() => { onDecisionMadeRef.current = onDecisionMade; }, [onDecisionMade]);

  // Main orchestration loop
  const runOrchestrationLoop = useCallback(async () => {
    if (!engineRef.current || !isActiveRef.current || isPausedRef.current) return;

    setIsProcessing(true);

    try {
      const currentState = await engineRef.current.getCurrentState();
      if (!currentState) return;

      setOrchestrationState(currentState);
      onStateChangeRef.current?.(currentState);

      // Generate and execute decisions
      const decision = await engineRef.current.generateOrchestrationDecisionForActiveSession();
      if (decision) {
        setCurrentDecision(decision);
        onDecisionMadeRef.current?.(decision);

        // Execute the decision
        await executeOrchestrationAction(decision.decision.action);

        // Emit orchestration event
        const event: OrchestrationEvent = {
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          sessionId: currentState.sessionId,
          type: 'adaptation_triggered',
          data: { decision }
        };

        eventListenerRef.current?.(event);
      }
    } catch (error) {
      console.error('Orchestration loop error:', error);

      const errorEvent: OrchestrationEvent = {
        id: `error-${Date.now()}`,
        timestamp: new Date(),
        sessionId: orchestrationState?.sessionId || 'unknown',
        type: 'error_occurred',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };

      eventListenerRef.current?.(errorEvent);
    } finally {
      setIsProcessing(false);
    }
  }, [orchestrationState?.sessionId]);

  // Execute orchestration actions
  const executeOrchestrationAction = async (action: OrchestrationAction) => {
    switch (action.type) {
      case 'continue':
        // Continue current flow - no action needed
        break;

      case 'adapt_scenario':
        onScenarioChange?.(action.newScenario);
        break;

      case 'adjust_pace':
        // Pace adjustment would be handled by parent components
        break;

      case 'change_focus':
        // Focus change would trigger UI updates
        break;

      case 'provide_context':
        // Context provision would update information displays
        break;

      case 'escalate_engagement':
        // Engagement escalation would trigger interactive elements
        break;

      case 'prepare_exit':
        // Exit preparation would prepare conclusion
        break;
    }
  };

  // Start orchestration session
  const handleStartOrchestration = async () => {
    if (!engineRef.current || !currentAudience) {
      console.error('Cannot start orchestration: missing engine or audience');
      return;
    }

    setIsProcessing(true);

    try {
      const config = {
        sessionId: sessionId || `session-${Date.now()}`,
        audienceAnalysis: await engineRef.current.analyzeAudience(sessionId || `session-${Date.now()}`, {
          type: currentAudience,
          timestamp: new Date(),
          engagementLevel: 'medium' as EngagementLevel,
          knowledgeLevel: 'intermediate' as KnowledgeLevel,
          objectives: ['education' as DemoObjective]
        }),
        contextAssessment: await engineRef.current.assessContext(sessionId || `session-${Date.now()}`, {
          timeAvailable: maxDuration,
          environment: 'desktop',
          objectives: ['education' as DemoObjective]
        }),
        parameters: {
          maxDuration,
          adaptationEnabled,
          fallbackScenarios: availableScenarios || [],
          exitCriteria: []
        },
        aiConfig: {
          adaptationSensitivity: 0.7,
          contextualPrompting: true,
          realTimeOptimization: true,
          learningMode: true
        }
      };

      const initialState = await engineRef.current.startOrchestration(config);
      setOrchestrationState(initialState);
      setIsActive(true);
      setIsPaused(false);

      // Update refs immediately (before interval fires) to avoid stale closure issues
      isActiveRef.current = true;
      isPausedRef.current = false;

      // Start orchestration loop
      orchestrationIntervalRef.current = setInterval(runOrchestrationLoop, 5000); // Run every 5 seconds

      const startEvent: OrchestrationEvent = {
        id: `start-${Date.now()}`,
        timestamp: new Date(),
        sessionId: initialState.sessionId,
        type: 'session_started',
        data: { config }
      };

      eventListenerRef.current?.(startEvent);
    } catch (error) {
      console.error('Failed to start orchestration:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Pause orchestration
  const handlePauseOrchestration = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    isPausedRef.current = newPaused;

    if (orchestrationIntervalRef.current && isPaused) {
      clearInterval(orchestrationIntervalRef.current);
      orchestrationIntervalRef.current = null;
    } else if (!isPaused) {
      orchestrationIntervalRef.current = setInterval(runOrchestrationLoop, 5000);
    }
  };

  // Stop orchestration
  const handleStopOrchestration = async () => {
    if (orchestrationIntervalRef.current) {
      clearInterval(orchestrationIntervalRef.current);
      orchestrationIntervalRef.current = null;
    }

    setIsActive(false);
    setIsPaused(false);
    isActiveRef.current = false;
    isPausedRef.current = false;
    setCurrentDecision(null);

    if (engineRef.current && orchestrationState) {
      try {
        await engineRef.current.completeSession(orchestrationState.sessionId);

        const endEvent: OrchestrationEvent = {
          id: `end-${Date.now()}`,
          timestamp: new Date(),
          sessionId: orchestrationState.sessionId,
          type: 'session_completed',
          data: { result: 'manual_stop' }
        };

        eventListenerRef.current?.(endEvent);
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }

    setOrchestrationState(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (orchestrationIntervalRef.current) {
        clearInterval(orchestrationIntervalRef.current);
      }
    };
  }, []);

  // Helper functions for UI
  const getPhaseIcon = (phase: OrchestrationPhase) => {
    switch (phase) {
      case 'initialization': return <CogIcon className="w-5 h-5" />;
      case 'audience_analysis': return <UserGroupIcon className="w-5 h-5" />;
      case 'context_assessment': return <ClockIcon className="w-5 h-5" />;
      case 'scenario_selection': return <ChartBarIcon className="w-5 h-5" />;
      case 'execution': return <PlayCircleIcon className="w-5 h-5" />;
      case 'adaptation': return <ArrowPathIcon className="w-5 h-5" />;
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

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'high': return 'text-red-600 bg-red-50';
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
              <h2 className="text-lg font-semibold text-gray-900">Demo Orchestration Engine</h2>
              <p className="text-sm text-gray-500">AI-powered demo flow management</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Control buttons */}
            {!isActive ? (
              <button
                onClick={handleStartOrchestration}
                disabled={!currentAudience || isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlayCircleIcon className="w-5 h-5" />
                <span>Start</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseOrchestration}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  {isPaused ? <PlayCircleIcon className="w-5 h-5" /> : <PauseCircleIcon className="w-5 h-5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={handleStopOrchestration}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <StopCircleIcon className="w-5 h-5" />
                  <span>Stop</span>
                </button>
              </>
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
      {orchestrationState && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Current Phase */}
            <div className="flex items-center space-x-2">
              {getPhaseIcon(orchestrationState.currentPhase)}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phase</p>
                <p className="text-sm font-semibold text-gray-900">
                  {orchestrationState.currentPhase.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Engagement Level */}
            {orchestrationState.config.audienceAnalysis && (
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(orchestrationState.config.audienceAnalysis.engagementLevel)}`}>
                  {orchestrationState.config.audienceAnalysis.engagementLevel}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Engagement</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {orchestrationState.performance.engagementTrend}
                  </p>
                </div>
              </div>
            )}

            {/* Progress */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${orchestrationState.status.completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {orchestrationState.status.completionPercentage}%
                </span>
              </div>
            </div>

            {/* Risk Level */}
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(orchestrationState.performance.riskLevel)}`}>
                {orchestrationState.performance.riskLevel}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Risk</p>
                <p className="text-sm font-semibold text-gray-900">
                  {orchestrationState.performance.adaptationCount} adaptations
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Decision Display */}
      {currentDecision && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-100 rounded-lg">
              <ArrowPathIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Orchestration Decision: {currentDecision.decision.action.type}
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                {currentDecision.decision.reasoning[0]}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600">
                  Confidence: {Math.round(currentDecision.decision.confidence * 100)}%
                </span>
                <span className="text-xs text-blue-600">
                  Expected improvement: +{Math.round(currentDecision.expectedOutcome.engagementImprovement)}%
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
            <span className="text-sm text-amber-700">Processing orchestration decisions...</span>
          </div>
        </div>
      )}

      {/* Advanced Controls */}
      {showAdvancedControls && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Advanced Controls</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="px-6 py-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Events</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-start space-x-2 text-sm">
                <span className="text-xs text-gray-500 min-w-16">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                  {event.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No audience warning */}
      {!currentAudience && (
        <div className="px-6 py-4 bg-amber-50 border-l-4 border-amber-400">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              Please select an audience type to begin orchestration
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoOrchestrator;