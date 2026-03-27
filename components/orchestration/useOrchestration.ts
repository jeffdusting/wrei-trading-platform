/**
 * WREI Trading Platform - Orchestration React Hook
 *
 * Stage 2: Component 1 - AI Demo Orchestration Engine
 * React hook for orchestration integration in existing components
 *
 * Date: March 26, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DemoOrchestrationEngine } from '@/lib/ai-orchestration/DemoOrchestrationEngine';
import {
  OrchestrationState,
  OrchestrationDecision,
  OrchestrationEvent,
  AudienceAnalysis,
  ContextAssessment,
  EngagementLevel,
  KnowledgeLevel,
  DemoObjective
} from './types';
import { AudienceType } from '../audience';
import { ScenarioType } from '../scenarios/types';

export interface OrchestrationHookConfig {
  // Session configuration
  sessionId?: string;
  maxDuration?: number;
  adaptationEnabled?: boolean;

  // Auto-management settings
  autoStart?: boolean;
  autoAnalyze?: boolean;
  analyzeInterval?: number; // milliseconds

  // Integration settings
  audience?: AudienceType;
  availableScenarios?: ScenarioType[];

  // Event handlers
  onStateChange?: (state: OrchestrationState) => void;
  onDecisionMade?: (decision: OrchestrationDecision) => void;
  onEvent?: (event: OrchestrationEvent) => void;
}

export interface OrchestrationHookResult {
  // State
  orchestrationState: OrchestrationState | null;
  currentDecision: OrchestrationDecision | null;
  isActive: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  recentEvents: OrchestrationEvent[];

  // Actions
  startOrchestration: () => Promise<void>;
  pauseOrchestration: () => void;
  resumeOrchestration: () => void;
  stopOrchestration: () => Promise<void>;

  // Analysis functions
  analyzeAudience: (input?: Partial<AudienceAnalysis>) => Promise<AudienceAnalysis>;
  assessContext: (input?: any) => Promise<ContextAssessment>;
  makeDecision: () => Promise<OrchestrationDecision | null>;

  // Engagement tracking
  reportEngagement: (level: EngagementLevel, trigger?: string) => void;
  reportInteraction: (type: string, data?: any) => void;
  updateKnowledgeLevel: (level: KnowledgeLevel) => void;

  // Utility functions
  getCurrentPhase: () => string;
  getCompletionPercentage: () => number;
  getEngagementTrend: () => 'improving' | 'stable' | 'declining';
  getRiskLevel: () => 'low' | 'medium' | 'high';
}

export const useOrchestration = (config: OrchestrationHookConfig = {}): OrchestrationHookResult => {
  const {
    sessionId,
    maxDuration = 30,
    adaptationEnabled = true,
    autoStart = false,
    autoAnalyze = false,
    analyzeInterval = 10000,
    audience,
    availableScenarios,
    onStateChange,
    onDecisionMade,
    onEvent
  } = config;

  // State management
  const [orchestrationState, setOrchestrationState] = useState<OrchestrationState | null>(null);
  const [currentDecision, setCurrentDecision] = useState<OrchestrationDecision | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentEvents, setRecentEvents] = useState<OrchestrationEvent[]>([]);

  // Refs
  const engineRef = useRef<DemoOrchestrationEngine | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const engagementHistoryRef = useRef<Array<{ timestamp: Date; level: EngagementLevel; trigger: string }>>([]);

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = DemoOrchestrationEngine.getInstance();
    }
  }, []);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && !isActive && audience && engineRef.current) {
      startOrchestration();
    }
  }, [autoStart, audience]);

  // Event handler
  const handleEvent = useCallback((event: OrchestrationEvent) => {
    setRecentEvents(prev => [event, ...prev.slice(0, 19)]);
    onEvent?.(event);
  }, [onEvent]);

  // Start orchestration
  const startOrchestration = useCallback(async () => {
    if (!engineRef.current || !audience) {
      console.error('Cannot start orchestration: missing engine or audience');
      return;
    }

    setIsProcessing(true);

    try {
      // Create initial analyses
      const sessionId = `session-${Date.now()}`;
      const audienceAnalysis = await engineRef.current.analyzeAudience(sessionId, {
        type: audience,
        timestamp: new Date(),
        engagementLevel: 'medium' as EngagementLevel,
        knowledgeLevel: 'intermediate' as KnowledgeLevel,
        objectives: ['education' as DemoObjective]
      });

      const contextAssessment = await engineRef.current.assessContext(sessionId, {
        timeAvailable: maxDuration,
        environment: 'desktop',
        objectives: ['education' as DemoObjective]
      });

      // Create orchestration configuration
      const orchestrationConfig = {
        sessionId: sessionId || `session-${Date.now()}`,
        audienceAnalysis,
        contextAssessment,
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

      // Start orchestration session
      const initialState = await engineRef.current.startOrchestration(orchestrationConfig);

      setOrchestrationState(initialState);
      setIsActive(true);
      setIsPaused(false);

      // Emit start event
      const startEvent: OrchestrationEvent = {
        id: `start-${Date.now()}`,
        timestamp: new Date(),
        sessionId: initialState.sessionId,
        type: 'session_started',
        data: { config: orchestrationConfig }
      };

      handleEvent(startEvent);
      onStateChange?.(initialState);

      // Start auto-analysis if enabled
      if (autoAnalyze) {
        analysisIntervalRef.current = setInterval(async () => {
          if (!isPaused) {
            const decision = await makeDecision();
            if (decision) {
              setCurrentDecision(decision);
              onDecisionMade?.(decision);
            }
          }
        }, analyzeInterval);
      }

    } catch (error) {
      console.error('Failed to start orchestration:', error);
      handleEvent({
        id: `error-${Date.now()}`,
        timestamp: new Date(),
        sessionId: sessionId || 'unknown',
        type: 'error_occurred',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsProcessing(false);
    }
  }, [audience, maxDuration, adaptationEnabled, availableScenarios, sessionId, autoAnalyze, analyzeInterval, isPaused, onStateChange, onDecisionMade, handleEvent]);

  // Pause orchestration
  const pauseOrchestration = useCallback(() => {
    setIsPaused(true);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, []);

  // Resume orchestration
  const resumeOrchestration = useCallback(() => {
    setIsPaused(false);
    if (autoAnalyze && !analysisIntervalRef.current) {
      analysisIntervalRef.current = setInterval(async () => {
        if (!isPaused) {
          const decision = await makeDecision();
          if (decision) {
            setCurrentDecision(decision);
            onDecisionMade?.(decision);
          }
        }
      }, analyzeInterval);
    }
  }, [autoAnalyze, analyzeInterval, isPaused, onDecisionMade]);

  // Stop orchestration
  const stopOrchestration = useCallback(async () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    setIsActive(false);
    setIsPaused(false);
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

        handleEvent(endEvent);
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }

    setOrchestrationState(null);
  }, [orchestrationState, handleEvent]);

  // Analysis functions
  const analyzeAudience = useCallback(async (input?: Partial<AudienceAnalysis>): Promise<AudienceAnalysis> => {
    if (!engineRef.current) {
      throw new Error('Orchestration engine not initialized');
    }

    const baseInput = {
      type: audience || 'executive',
      timestamp: new Date(),
      engagementLevel: 'medium' as EngagementLevel,
      knowledgeLevel: 'intermediate' as KnowledgeLevel,
      objectives: ['education' as DemoObjective],
      ...input
    };

    return await engineRef.current.analyzeAudience(`session-${Date.now()}`, baseInput);
  }, [audience]);

  const assessContext = useCallback(async (input?: any): Promise<ContextAssessment> => {
    if (!engineRef.current) {
      throw new Error('Orchestration engine not initialized');
    }

    const baseInput = {
      timeAvailable: maxDuration,
      environment: 'desktop',
      objectives: ['education' as DemoObjective],
      ...input
    };

    return await engineRef.current.assessContext(`session-${Date.now()}`, baseInput);
  }, [maxDuration]);

  const makeDecision = useCallback(async (): Promise<OrchestrationDecision | null> => {
    if (!engineRef.current || !isActive || isPaused) {
      return null;
    }

    setIsProcessing(true);

    try {
      const decision = await engineRef.current.generateOrchestrationDecisionForActiveSession();
      if (decision) {
        const decisionEvent: OrchestrationEvent = {
          id: `decision-${Date.now()}`,
          timestamp: new Date(),
          sessionId: orchestrationState?.sessionId || 'unknown',
          type: 'adaptation_triggered',
          data: { decision }
        };

        handleEvent(decisionEvent);
      }
      return decision;
    } catch (error) {
      console.error('Error making orchestration decision:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isActive, isPaused, orchestrationState?.sessionId, handleEvent]);

  // Engagement tracking
  const reportEngagement = useCallback((level: EngagementLevel, trigger = 'user_action') => {
    const engagementData = {
      timestamp: new Date(),
      level,
      trigger
    };

    engagementHistoryRef.current.push(engagementData);

    // Keep only last 20 engagement points
    if (engagementHistoryRef.current.length > 20) {
      engagementHistoryRef.current = engagementHistoryRef.current.slice(-20);
    }

    const engagementEvent: OrchestrationEvent = {
      id: `engagement-${Date.now()}`,
      timestamp: new Date(),
      sessionId: orchestrationState?.sessionId || 'unknown',
      type: 'engagement_changed',
      data: engagementData
    };

    handleEvent(engagementEvent);
  }, [orchestrationState?.sessionId, handleEvent]);

  const reportInteraction = useCallback((type: string, data?: any) => {
    const interactionEvent: OrchestrationEvent = {
      id: `interaction-${Date.now()}`,
      timestamp: new Date(),
      sessionId: orchestrationState?.sessionId || 'unknown',
      type: 'objective_progress',
      data: { interactionType: type, ...data }
    };

    handleEvent(interactionEvent);
  }, [orchestrationState?.sessionId, handleEvent]);

  const updateKnowledgeLevel = useCallback((level: KnowledgeLevel) => {
    if (orchestrationState) {
      const updatedState = {
        ...orchestrationState,
        config: {
          ...orchestrationState.config,
          audienceAnalysis: {
            ...orchestrationState.config.audienceAnalysis,
            knowledgeLevel: level
          }
        }
      };

      setOrchestrationState(updatedState);
      onStateChange?.(updatedState);
    }
  }, [orchestrationState, onStateChange]);

  // Utility functions
  const getCurrentPhase = useCallback(() => {
    return orchestrationState?.currentPhase.replace('_', ' ') || 'Not started';
  }, [orchestrationState?.currentPhase]);

  const getCompletionPercentage = useCallback(() => {
    return orchestrationState?.status.completionPercentage || 0;
  }, [orchestrationState?.status.completionPercentage]);

  const getEngagementTrend = useCallback(() => {
    return orchestrationState?.performance.engagementTrend || 'stable';
  }, [orchestrationState?.performance.engagementTrend]);

  const getRiskLevel = useCallback(() => {
    return orchestrationState?.performance.riskLevel || 'medium';
  }, [orchestrationState?.performance.riskLevel]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  // Update state when orchestration state changes
  useEffect(() => {
    if (orchestrationState) {
      onStateChange?.(orchestrationState);
    }
  }, [orchestrationState, onStateChange]);

  return {
    // State
    orchestrationState,
    currentDecision,
    isActive,
    isPaused,
    isProcessing,
    recentEvents,

    // Actions
    startOrchestration,
    pauseOrchestration,
    resumeOrchestration,
    stopOrchestration,

    // Analysis functions
    analyzeAudience,
    assessContext,
    makeDecision,

    // Engagement tracking
    reportEngagement,
    reportInteraction,
    updateKnowledgeLevel,

    // Utility functions
    getCurrentPhase,
    getCompletionPercentage,
    getEngagementTrend,
    getRiskLevel
  };
};

export default useOrchestration;