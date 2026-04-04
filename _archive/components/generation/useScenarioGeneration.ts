/**
 * WREI Trading Platform - Dynamic Scenario Generation Hook
 *
 * Stage 2: Component 2 - React hook for scenario generation integration
 * Easy-to-use React hook for dynamic scenario generation functionality
 *
 * Date: March 26, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DynamicScenarioEngine } from '@/lib/ai-scenario-generation/DynamicScenarioEngine';
import {
  GeneratedScenario,
  ScenarioGenerationConfig,
  GenerationEngineState,
  GenerationEvent,
  MarketCondition,
  ParticipantProfile,
  GenerationMode,
  ScenarioValidation,
  ScenarioAdaptation
} from './types';
import { AudienceType } from '../audience';

export interface ScenarioGenerationHookConfig {
  // Basic configuration
  audience: AudienceType;
  defaultDuration?: number;
  defaultComplexity?: 'simple' | 'moderate' | 'complex' | 'expert';

  // Auto-generation settings
  autoGenerate?: boolean;
  regenerateOnAudienceChange?: boolean;

  // Market configuration
  defaultMarketCondition?: MarketCondition;
  allowedMarketConditions?: MarketCondition[];

  // Participant settings
  defaultParticipantCount?: number;
  defaultParticipantMix?: Record<ParticipantProfile, number>;

  // Event handlers
  onScenarioGenerated?: (scenario: GeneratedScenario) => void;
  onGenerationStateChange?: (state: GenerationEngineState) => void;
  onGenerationEvent?: (event: GenerationEvent) => void;
  onValidationCompleted?: (validation: ScenarioValidation) => void;
  onAdaptationTriggered?: (adaptation: ScenarioAdaptation) => void;
}

export interface ScenarioGenerationHookResult {
  // State
  currentScenario: GeneratedScenario | null;
  engineState: GenerationEngineState | null;
  isGenerating: boolean;
  isAdapting: boolean;
  recentEvents: GenerationEvent[];
  validationResults: ScenarioValidation[];

  // Actions
  generateScenario: (config?: Partial<ScenarioGenerationConfig>) => Promise<GeneratedScenario>;
  regenerateScenario: () => Promise<GeneratedScenario>;
  adaptScenario: (trigger: any, parameters: any) => Promise<ScenarioAdaptation>;
  validateScenario: (scenario?: GeneratedScenario) => Promise<ScenarioValidation>;

  // Configuration
  updateGenerationConfig: (updates: Partial<ScenarioGenerationConfig>) => void;
  setMarketCondition: (condition: MarketCondition) => void;
  setParticipantMix: (mix: Record<ParticipantProfile, number>) => void;
  setComplexity: (complexity: 'simple' | 'moderate' | 'complex' | 'expert') => void;

  // Utility functions
  getScenarioSummary: () => string | null;
  getPerformanceMetrics: () => any;
  clearCache: () => void;
  exportScenario: (format: 'json' | 'summary') => any;

  // Engine management
  getEngineStatus: () => { active: boolean; queueSize: number; performance: any };
  resetEngine: () => void;
}

export const useScenarioGeneration = (
  config: ScenarioGenerationHookConfig
): ScenarioGenerationHookResult => {
  const {
    audience,
    defaultDuration = 30,
    defaultComplexity = 'moderate',
    autoGenerate = false,
    regenerateOnAudienceChange = false,
    defaultMarketCondition = 'stable',
    allowedMarketConditions = ['bull', 'bear', 'volatile', 'stable'],
    defaultParticipantCount = 8,
    defaultParticipantMix = {
      institutional: 30,
      retail: 25,
      corporate: 25,
      government: 15,
      speculative: 5
    },
    onScenarioGenerated,
    onGenerationStateChange,
    onGenerationEvent,
    onValidationCompleted,
    onAdaptationTriggered
  } = config;

  // State management
  const [currentScenario, setCurrentScenario] = useState<GeneratedScenario | null>(null);
  const [engineState, setEngineState] = useState<GenerationEngineState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [recentEvents, setRecentEvents] = useState<GenerationEvent[]>([]);
  const [validationResults, setValidationResults] = useState<ScenarioValidation[]>([]);

  // Configuration state
  const [generationConfig, setGenerationConfig] = useState<Partial<ScenarioGenerationConfig>>({
    audience,
    duration: defaultDuration,
    complexity: defaultComplexity,
    participantCount: defaultParticipantCount,
    generationMode: 'hybrid' as GenerationMode
  });

  const [marketCondition, setMarketCondition] = useState<MarketCondition>(defaultMarketCondition);
  const [participantMix, setParticipantMix] = useState(defaultParticipantMix);

  // Refs
  const engineRef = useRef<DynamicScenarioEngine | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGenerationRef = useRef<string | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = DynamicScenarioEngine.getInstance();
    }

    // Start polling for engine state
    pollIntervalRef.current = setInterval(() => {
      if (engineRef.current) {
        const state = engineRef.current.getEngineState();
        setEngineState(state);
        onGenerationStateChange?.(state);

        // Get recent events
        const events = engineRef.current.getEventHistory();
        const newEvents = events.slice(-20);

        // Check for new events
        newEvents.forEach(event => {
          if (event.timestamp.getTime() > (lastGenerationRef.current ? parseInt(lastGenerationRef.current) : 0)) {
            onGenerationEvent?.(event);
          }
        });

        setRecentEvents(newEvents);
        lastGenerationRef.current = Date.now().toString();
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [onGenerationStateChange, onGenerationEvent]);

  // Auto-generate on audience change
  useEffect(() => {
    if (regenerateOnAudienceChange && currentScenario) {
      regenerateScenario();
    }
  }, [audience, regenerateOnAudienceChange]);

  // Auto-generate initial scenario
  useEffect(() => {
    if (autoGenerate && !currentScenario && !isGenerating) {
      generateScenario();
    }
  }, [autoGenerate]);

  // Update config when audience changes
  useEffect(() => {
    setGenerationConfig(prev => ({
      ...prev,
      audience
    }));
  }, [audience]);

  // Generate scenario
  const generateScenario = useCallback(async (
    configOverrides?: Partial<ScenarioGenerationConfig>
  ): Promise<GeneratedScenario> => {
    if (!engineRef.current || isGenerating) {
      throw new Error('Generation already in progress or engine not available');
    }

    setIsGenerating(true);

    try {
      const config: ScenarioGenerationConfig = {
        id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        audience,
        duration: defaultDuration,
        complexity: defaultComplexity,
        objectives: [`${audience} trading demonstration`, 'Market dynamics understanding'],

        marketConfig: {
          baseCondition: marketCondition,
          volatilityRange: getVolatilityRangeForCondition(marketCondition),
          priceRange: [35.0, 65.0], // NSW ESC historical range
          volumeRange: [50000, 500000],
          trendStrength: 0.5,
          noiseLevel: 0.3,
          seasonalEffects: true,
          regulatoryImpacts: ['ESS Rule Updates', 'CER Changes', 'AFSL Requirements']
        },

        participantCount: defaultParticipantCount,
        participantMix,

        generationMode: 'hybrid' as GenerationMode,
        realTimeDataSources: [],

        constraints: {
          minTradeSize: 100,
          maxTradeSize: 50000,
          allowableOutcomes: [
            'successful_trading',
            'market_learning',
            'risk_management',
            'compliance_achievement'
          ],
          prohibitedScenarios: [
            'market_manipulation',
            'regulatory_violation',
            'unrealistic_outcomes'
          ]
        },

        adaptationRules: [
          {
            trigger: 'low_engagement',
            condition: 'engagement_level < 0.6',
            action: 'increase_interactivity',
            parameters: { interactivity_boost: 1.3, add_decision_points: true }
          },
          {
            trigger: 'time_pressure',
            condition: 'remaining_time < 0.25',
            action: 'compress_timeline',
            parameters: { compression_factor: 0.8, prioritize_key_events: true }
          },
          {
            trigger: 'complexity_mismatch',
            condition: 'user_performance < expected_level',
            action: 'adjust_complexity',
            parameters: { complexity_adjustment: -0.2 }
          }
        ],

        // Merge in any overrides
        ...generationConfig,
        ...configOverrides
      };

      const scenario = await engineRef.current.generateScenario(config);

      setCurrentScenario(scenario);
      setValidationResults(scenario.validations);

      onScenarioGenerated?.(scenario);

      // Process validations
      scenario.validations.forEach(validation => {
        onValidationCompleted?.(validation);
      });

      return scenario;

    } catch (error) {
      console.error('Scenario generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [
    audience,
    defaultDuration,
    defaultComplexity,
    defaultParticipantCount,
    marketCondition,
    participantMix,
    generationConfig,
    isGenerating,
    onScenarioGenerated,
    onValidationCompleted
  ]);

  // Regenerate current scenario
  const regenerateScenario = useCallback(async (): Promise<GeneratedScenario> => {
    if (currentScenario) {
      return await generateScenario(currentScenario.config);
    } else {
      return await generateScenario();
    }
  }, [currentScenario, generateScenario]);

  // Adapt scenario
  const adaptScenario = useCallback(async (
    trigger: any,
    parameters: any
  ): Promise<ScenarioAdaptation> => {
    if (!engineRef.current || !currentScenario) {
      throw new Error('No active scenario to adapt');
    }

    setIsAdapting(true);

    try {
      const adaptation = await engineRef.current.adaptScenario(
        currentScenario.id,
        trigger,
        parameters
      );

      // Update current scenario with adaptation
      setCurrentScenario(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          adaptations: [...prev.adaptations, adaptation]
        };
      });

      onAdaptationTriggered?.(adaptation);

      return adaptation;

    } catch (error) {
      console.error('Scenario adaptation failed:', error);
      throw error;
    } finally {
      setIsAdapting(false);
    }
  }, [currentScenario, onAdaptationTriggered]);

  // Validate scenario
  const validateScenario = useCallback(async (
    scenario?: GeneratedScenario
  ): Promise<ScenarioValidation> => {
    if (!engineRef.current) {
      throw new Error('Engine not available');
    }

    const targetScenario = scenario || currentScenario;
    if (!targetScenario) {
      throw new Error('No scenario to validate');
    }

    // This would use the engine's validation method
    // For now, create a mock validation
    const validation: ScenarioValidation = {
      id: `validation-${targetScenario.id}-${Date.now()}`,
      timestamp: new Date(),
      validationType: 'realism',
      criteria: [
        { name: 'Price Realism', description: 'Prices within historical ranges', weight: 0.3, threshold: 0.8 },
        { name: 'Volume Realism', description: 'Volumes consistent with market size', weight: 0.2, threshold: 0.8 },
        { name: 'Participant Behavior', description: 'Realistic participant actions', weight: 0.25, threshold: 0.75 },
        { name: 'Market Consistency', description: 'Consistent with NSW ESC market', weight: 0.25, threshold: 0.85 }
      ],
      results: {
        overallScore: targetScenario.metadata.realism,
        passed: targetScenario.metadata.realism >= 0.8,
        criteriaScores: [
          { name: 'Price Realism', score: 0.9, passed: true, feedback: 'Prices are realistic' },
          { name: 'Volume Realism', score: 0.85, passed: true, feedback: 'Volumes are appropriate' },
          { name: 'Participant Behavior', score: 0.8, passed: true, feedback: 'Behavior is well-modeled' },
          { name: 'Market Consistency', score: 0.88, passed: true, feedback: 'Consistent with NSW ESC' }
        ]
      },
      recommendations: []
    };

    setValidationResults(prev => [...prev, validation]);
    onValidationCompleted?.(validation);

    return validation;
  }, [currentScenario, onValidationCompleted]);

  // Configuration update methods
  const updateGenerationConfig = useCallback((
    updates: Partial<ScenarioGenerationConfig>
  ) => {
    setGenerationConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const setMarketConditionHandler = useCallback((condition: MarketCondition) => {
    if (allowedMarketConditions.includes(condition)) {
      setMarketCondition(condition);
    }
  }, [allowedMarketConditions]);

  const setParticipantMixHandler = useCallback((
    mix: Record<ParticipantProfile, number>
  ) => {
    // Validate that percentages add up to 100
    const total = Object.values(mix).reduce((sum, val) => sum + val, 0);
    if (total === 100) {
      setParticipantMix(mix);
    } else {
      console.warn('Participant mix percentages must add up to 100');
    }
  }, []);

  const setComplexity = useCallback((
    complexity: 'simple' | 'moderate' | 'complex' | 'expert'
  ) => {
    setGenerationConfig(prev => ({ ...prev, complexity }));
  }, []);

  // Utility functions
  const getScenarioSummary = useCallback((): string | null => {
    if (!currentScenario) return null;

    return `${currentScenario.narrative.title} - ${currentScenario.participants.length} participants, ${currentScenario.marketConditions.duration}min duration, ${currentScenario.marketConditions.condition} market conditions`;
  }, [currentScenario]);

  const getPerformanceMetrics = useCallback(() => {
    return engineState?.performance || null;
  }, [engineState]);

  const clearCache = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.clearCache();
    }
  }, []);

  const exportScenario = useCallback((format: 'json' | 'summary') => {
    if (!currentScenario) return null;

    if (format === 'json') {
      return JSON.stringify(currentScenario, null, 2);
    } else {
      return {
        title: currentScenario.narrative.title,
        description: currentScenario.narrative.description,
        duration: currentScenario.marketConditions.duration,
        participants: currentScenario.participants.length,
        marketCondition: currentScenario.marketConditions.condition,
        priceRange: [
          currentScenario.marketConditions.priceMovement.startPrice,
          currentScenario.marketConditions.priceMovement.endPrice
        ],
        confidence: currentScenario.metadata.confidence,
        realism: currentScenario.metadata.realism,
        outcomes: currentScenario.outcomes.probabilistic.length,
        validations: currentScenario.validations.length
      };
    }
  }, [currentScenario]);

  const getEngineStatus = useCallback(() => {
    if (!engineState) {
      return { active: false, queueSize: 0, performance: null };
    }

    return {
      active: engineState.isActive,
      queueSize: engineState.queuedGenerations.length,
      performance: engineState.performance
    };
  }, [engineState]);

  const resetEngine = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.clearCache();
      setCurrentScenario(null);
      setValidationResults([]);
      setRecentEvents([]);
    }
  }, []);

  // Helper function for market conditions
  const getVolatilityRangeForCondition = (condition: MarketCondition): [number, number] => {
    const ranges = {
      bull: [0.1, 0.25] as [number, number],
      bear: [0.15, 0.3] as [number, number],
      volatile: [0.25, 0.5] as [number, number],
      stable: [0.05, 0.15] as [number, number],
      crisis: [0.4, 0.8] as [number, number]
    };
    return ranges[condition] || [0.1, 0.25];
  };

  return {
    // State
    currentScenario,
    engineState,
    isGenerating,
    isAdapting,
    recentEvents,
    validationResults,

    // Actions
    generateScenario,
    regenerateScenario,
    adaptScenario,
    validateScenario,

    // Configuration
    updateGenerationConfig,
    setMarketCondition: setMarketConditionHandler,
    setParticipantMix: setParticipantMixHandler,
    setComplexity,

    // Utility functions
    getScenarioSummary,
    getPerformanceMetrics,
    clearCache,
    exportScenario,

    // Engine management
    getEngineStatus,
    resetEngine
  };
};

export default useScenarioGeneration;