/**
 * WREI Trading Platform - Orchestration React Hook
 *
 * Stage 2: Component 1 - Simplified Demo Orchestration Hook
 * React hook for simplified demo scenario integration in existing components
 * MIGRATED: Now uses simplified demo data instead of complex AI orchestration
 *
 * Date: March 28, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSimpleDemoStore, SimpleDemoDataSet } from '@/lib/demo-mode/simple-demo-state';
import { getDemoDataForSet, DemoDataSet } from '@/lib/demo-mode/demo-data-simple';

// Simplified types for demo orchestration
type ScenarioPhase = 'initialization' | 'data_loading' | 'execution' | 'completion';
type EngagementLevel = 'low' | 'medium' | 'high' | 'very_high';

interface SimplifiedOrchestrationEvent {
  id: string;
  timestamp: Date;
  type: 'scenario_started' | 'data_loaded' | 'scenario_changed' | 'session_completed';
  data: any;
}

export interface OrchestrationHookConfig {
  // Session configuration
  sessionId?: string;

  // Auto-management settings
  autoStart?: boolean;
  progressInterval?: number; // milliseconds

  // Integration settings
  dataSet?: SimpleDemoDataSet;
  availableDataSets?: SimpleDemoDataSet[];

  // Event handlers
  onScenarioData?: (data: DemoDataSet) => void;
  onEvent?: (event: SimplifiedOrchestrationEvent) => void;
  onDataSetChange?: (dataSet: SimpleDemoDataSet) => void;
}

export interface OrchestrationHookResult {
  // State
  currentPhase: ScenarioPhase;
  demoData: DemoDataSet | null;
  selectedDataSet: SimpleDemoDataSet | null;
  isActive: boolean;
  isProcessing: boolean;
  completionPercentage: number;
  recentEvents: SimplifiedOrchestrationEvent[];

  // Actions
  startScenario: (dataSet?: SimpleDemoDataSet) => Promise<void>;
  stopScenario: () => Promise<void>;
  changeDataSet: (dataSet: SimpleDemoDataSet) => void;

  // Simplified analysis functions
  getScenarioData: () => DemoDataSet | null;
  reportEngagement: (level: EngagementLevel) => void;

  // Utility functions
  getCurrentPhase: () => string;
  getCompletionPercentage: () => number;
  getEngagementLevel: () => EngagementLevel;
}

export const useOrchestration = (config: OrchestrationHookConfig = {}): OrchestrationHookResult => {
  const {
    sessionId,
    autoStart = false,
    progressInterval = 1000,
    dataSet,
    availableDataSets,
    onScenarioData,
    onEvent,
    onDataSetChange
  } = config;

  // Use simplified demo store
  const { isActive, selectedDataSet, demoData, activateDemo, deactivateDemo } = useSimpleDemoStore();

  // State management
  const [currentPhase, setCurrentPhase] = useState<ScenarioPhase>('initialization');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentEvents, setRecentEvents] = useState<SimplifiedOrchestrationEvent[]>([]);
  const [engagementLevel, setEngagementLevel] = useState<EngagementLevel>('medium');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Refs
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && !isActive && dataSet) {
      startScenario(dataSet);
    }
  }, [autoStart, isActive, dataSet]);

  // Event handler
  const handleEvent = useCallback((event: SimplifiedOrchestrationEvent) => {
    setRecentEvents(prev => [event, ...prev.slice(0, 19)]);
    onEvent?.(event);
  }, [onEvent]);

  // Monitor demo state changes
  useEffect(() => {
    if (isActive && demoData) {
      onScenarioData?.(demoData);
      setCurrentPhase('execution');
    } else {
      setCurrentPhase('initialization');
      setCompletionPercentage(0);
    }
  }, [isActive, demoData, onScenarioData]);

  // Progress tracking
  const updateProgress = useCallback(() => {
    if (!sessionStartTime || !isActive) return;

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
  }, [sessionStartTime, isActive]);

  // Start scenario
  const startScenario = useCallback(async (targetDataSet?: SimpleDemoDataSet) => {
    const useDataSet = targetDataSet || dataSet || 'institutional';

    if (!useDataSet) {
      console.error('Cannot start scenario: missing data set');
      return;
    }

    setIsProcessing(true);
    setCurrentPhase('data_loading');

    try {
      activateDemo(useDataSet);

      const startTime = new Date();
      setSessionStartTime(startTime);
      setCompletionPercentage(0);

      // Start progress tracking
      progressIntervalRef.current = setInterval(updateProgress, progressInterval);

      // Emit start event
      handleEvent({
        id: `start-${Date.now()}`,
        timestamp: new Date(),
        type: 'scenario_started',
        data: { sessionId: sessionId || `session-${Date.now()}`, dataSet: useDataSet, startTime }
      });

      // Move to execution phase
      setTimeout(() => {
        setCurrentPhase('execution');
        handleEvent({
          id: `loaded-${Date.now()}`,
          timestamp: new Date(),
          type: 'data_loaded',
          data: { dataSet: useDataSet }
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start scenario:', error);
      setCurrentPhase('initialization');
    } finally {
      setIsProcessing(false);
    }
  }, [dataSet, sessionId, activateDemo, progressInterval, updateProgress, handleEvent]);

  // Stop scenario
  const stopScenario = useCallback(async () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    deactivateDemo();
    setCurrentPhase('initialization');
    setCompletionPercentage(0);
    setSessionStartTime(null);

    handleEvent({
      id: `stop-${Date.now()}`,
      timestamp: new Date(),
      type: 'session_completed',
      data: { sessionId: sessionId || `session-${Date.now()}`, endTime: new Date(), result: 'manual_stop' }
    });
  }, [deactivateDemo, sessionId, handleEvent]);

  // Change data set
  const changeDataSet = useCallback((newDataSet: SimpleDemoDataSet) => {
    if (newDataSet === selectedDataSet) return;

    activateDemo(newDataSet);
    onDataSetChange?.(newDataSet);

    handleEvent({
      id: `change-${Date.now()}`,
      timestamp: new Date(),
      type: 'scenario_changed',
      data: { newDataSet, oldDataSet: selectedDataSet }
    });
  }, [selectedDataSet, activateDemo, onDataSetChange, handleEvent]);

  // Simplified functions
  const getScenarioData = useCallback(() => demoData, [demoData]);
  const reportEngagement = useCallback((level: EngagementLevel) => {
    setEngagementLevel(level);
  }, []);
  const getCurrentPhase = useCallback(() => currentPhase.replace('_', ' '), [currentPhase]);
  const getCompletionPercentage = useCallback(() => completionPercentage, [completionPercentage]);
  const getEngagementLevel = useCallback(() => engagementLevel, [engagementLevel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    currentPhase,
    demoData,
    selectedDataSet,
    isActive,
    isProcessing,
    completionPercentage,
    recentEvents,

    // Actions
    startScenario,
    stopScenario,
    changeDataSet,

    // Analysis functions
    getScenarioData,
    reportEngagement,

    // Utility functions
    getCurrentPhase,
    getCompletionPercentage,
    getEngagementLevel
  };
};

export default useOrchestration;