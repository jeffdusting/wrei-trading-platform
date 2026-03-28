'use client';

/**
 * WREI Trading Platform - Simplified Scenario Generator Component
 *
 * Stage 2: Component 2 - Simplified Scenario Generation Interface
 * MIGRATED: Now uses simplified demo data instead of complex AI scenario generation
 *
 * Date: March 28, 2026
 */

import React, { useState } from 'react';
import { useSimpleDemoStore, SimpleDemoDataSet } from '@/lib/demo-mode/simple-demo-state';
import { getDemoDataForSet } from '@/lib/demo-mode/demo-data-simple';
import {
  GeneratedScenario,
  ScenarioGenerationConfig,
  GenerationEngineState,
  GenerationEvent,
  MarketCondition,
  ParticipantProfile,
  GenerationMode,
  MarketDataSource,
  ScenarioValidation
} from './types';
import { AudienceType } from '../audience';
import { ScenarioType } from '../scenarios/types';

// UI Components
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  CogIcon,
  SparklesIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ScenarioGeneratorProps {
  // Integration with orchestration
  audience: AudienceType;
  onScenarioGenerated?: (scenario: GeneratedScenario) => void;
  onGenerationStateChange?: (state: GenerationEngineState) => void;

  // Configuration
  defaultDuration?: number;
  defaultComplexity?: 'simple' | 'moderate' | 'complex' | 'expert';
  availableMarketConditions?: MarketCondition[];

  // External data sources
  marketDataSources?: MarketDataSource[];

  // UI customization
  showAdvancedOptions?: boolean;
  compactMode?: boolean;
}

export const ScenarioGenerator: React.FC<ScenarioGeneratorProps> = ({
  audience,
  onScenarioGenerated,
  onGenerationStateChange,
  defaultDuration = 30,
  defaultComplexity = 'moderate',
  availableMarketConditions = ['bull', 'bear', 'volatile', 'stable'],
  marketDataSources = [],
  showAdvancedOptions = true,
  compactMode = false
}) => {
  // Core state
  const [generationConfig, setGenerationConfig] = useState<Partial<ScenarioGenerationConfig>>({
    duration: defaultDuration,
    complexity: defaultComplexity,
    audience,
    objectives: [],
    participantCount: 8,
    generationMode: 'hybrid'
  });

  const [engineState, setEngineState] = useState<GenerationEngineState | null>(null);
  const [currentScenario, setCurrentScenario] = useState<GeneratedScenario | null>(null);
  const [recentEvents, setRecentEvents] = useState<GenerationEvent[]>([]);
  const [validationResults, setValidationResults] = useState<ScenarioValidation[]>([]);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedMarketCondition, setSelectedMarketCondition] = useState<MarketCondition>('stable');
  const [participantMix, setParticipantMix] = useState<Record<ParticipantProfile, number>>({
    institutional: 30,
    retail: 25,
    corporate: 25,
    government: 15,
    speculative: 5
  });

  // Refs
  const engineRef = useRef<DynamicScenarioEngine | null>(null);
  const generationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = DynamicScenarioEngine.getInstance();
    }

    // Poll for engine state updates
    const pollInterval = setInterval(() => {
      if (engineRef.current) {
        const state = engineRef.current.getEngineState();
        setEngineState(state);
        onGenerationStateChange?.(state);

        const events = engineRef.current.getEventHistory().slice(-10);
        setRecentEvents(events);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [onGenerationStateChange]);

  // Update config when audience changes
  useEffect(() => {
    setGenerationConfig(prev => ({
      ...prev,
      audience
    }));
  }, [audience]);

  // Generate scenario
  const handleGenerateScenario = useCallback(async () => {
    if (!engineRef.current || isGenerating) return;

    setIsGenerating(true);

    try {
      const config: ScenarioGenerationConfig = {
        id: `scenario-${Date.now()}`,
        audience,
        duration: generationConfig.duration || defaultDuration,
        complexity: generationConfig.complexity || defaultComplexity,
        objectives: generationConfig.objectives || [`${audience} demonstration objectives`],

        marketConfig: {
          baseCondition: selectedMarketCondition,
          volatilityRange: getVolatilityRangeForCondition(selectedMarketCondition),
          priceRange: [35.0, 65.0], // NSW ESC historical range
          volumeRange: [50000, 500000],
          trendStrength: 0.5,
          noiseLevel: 0.3,
          seasonalEffects: true,
          regulatoryImpacts: ['ESS Rule Updates', 'CER Changes']
        },

        participantCount: generationConfig.participantCount || 8,
        participantMix,

        generationMode: generationConfig.generationMode || 'hybrid',
        realTimeDataSources: marketDataSources,

        constraints: {
          minTradeSize: 100,
          maxTradeSize: 50000,
          allowableOutcomes: ['successful_trading', 'market_learning', 'risk_management'],
          prohibitedScenarios: ['market_manipulation', 'regulatory_violation']
        },

        adaptationRules: [
          {
            trigger: 'low_engagement',
            condition: 'engagement < 0.6',
            action: 'increase_interaction',
            parameters: { interactivity: 1.2 }
          },
          {
            trigger: 'time_pressure',
            condition: 'remaining_time < 0.3',
            action: 'compress_timeline',
            parameters: { compression: 0.8 }
          }
        ]
      };

      const scenario = await engineRef.current.generateScenario(config);

      setCurrentScenario(scenario);
      onScenarioGenerated?.(scenario);

      // Collect validation results
      setValidationResults(scenario.validations);

    } catch (error) {
      console.error('Scenario generation failed:', error);
      // Handle error state
    } finally {
      setIsGenerating(false);
    }
  }, [
    audience,
    generationConfig,
    selectedMarketCondition,
    participantMix,
    marketDataSources,
    defaultDuration,
    defaultComplexity,
    isGenerating,
    onScenarioGenerated
  ]);

  // Configuration helpers
  const getVolatilityRangeForCondition = (condition: MarketCondition): [number, number] => {
    const ranges: Record<MarketCondition, [number, number]> = {
      bull: [0.1, 0.25],
      bear: [0.15, 0.3],
      volatile: [0.25, 0.5],
      stable: [0.05, 0.15],
      crisis: [0.4, 0.8]
    };
    return ranges[condition] || [0.1, 0.25];
  };

  const getMarketConditionColor = (condition: MarketCondition) => {
    const colors = {
      bull: 'text-green-600 bg-green-50',
      bear: 'text-red-600 bg-red-50',
      volatile: 'text-orange-600 bg-orange-50',
      stable: 'text-blue-600 bg-blue-50',
      crisis: 'text-purple-600 bg-purple-50'
    };
    return colors[condition] || 'text-gray-600 bg-gray-50';
  };

  const getComplexityDescription = (complexity: string) => {
    const descriptions: Record<string, string> = {
      simple: 'Basic trading scenario with clear outcomes',
      moderate: 'Intermediate complexity with multiple factors',
      complex: 'Advanced scenario with market dynamics',
      expert: 'Sophisticated multi-layered trading simulation'
    };
    return descriptions[complexity] || descriptions.moderate;
  };

  // Validation display helpers
  const getValidationStatusIcon = (validation: ScenarioValidation) => {
    if (validation.results.passed) {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
    } else {
      return <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />;
    }
  };

  const getValidationStatusColor = (validation: ScenarioValidation) => {
    return validation.results.passed
      ? 'text-green-700 bg-green-50 border-green-200'
      : 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Dynamic Scenario Generator</h2>
              <p className="text-sm text-gray-500">
                AI-powered scenario generation for {audience} audience
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateScenario}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5" />
                  <span>Generate Scenario</span>
                </>
              )}
            </button>

            {showAdvancedOptions && (
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CogIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Market Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Market Condition
            </label>
            <select
              value={selectedMarketCondition}
              onChange={(e) => setSelectedMarketCondition(e.target.value as MarketCondition)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              {availableMarketConditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)} Market
                </option>
              ))}
            </select>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${getMarketConditionColor(selectedMarketCondition)}`}>
              {selectedMarketCondition}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={generationConfig.duration || defaultDuration}
              onChange={(e) => setGenerationConfig(prev => ({
                ...prev,
                duration: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complexity Level
            </label>
            <select
              value={generationConfig.complexity || defaultComplexity}
              onChange={(e) => setGenerationConfig(prev => ({
                ...prev,
                complexity: e.target.value as any
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="simple">Simple</option>
              <option value="moderate">Moderate</option>
              <option value="complex">Complex</option>
              <option value="expert">Expert</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {getComplexityDescription(generationConfig.complexity || defaultComplexity)}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Configuration */}
      {showAdvanced && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Advanced Configuration</h3>

          {/* Participant Mix */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participant Mix (%)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(participantMix).map(([profile, percentage]) => (
                <div key={profile}>
                  <label className="text-xs text-gray-600 capitalize">
                    {profile.replace('_', ' ')}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={percentage}
                    onChange={(e) => setParticipantMix(prev => ({
                      ...prev,
                      [profile]: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 text-center">{percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Generation Mode */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generation Mode
            </label>
            <div className="flex space-x-4">
              {(['realtime', 'simulation', 'hybrid'] as GenerationMode[]).map(mode => (
                <label key={mode} className="flex items-center">
                  <input
                    type="radio"
                    name="generationMode"
                    value={mode}
                    checked={generationConfig.generationMode === mode}
                    onChange={(e) => setGenerationConfig(prev => ({
                      ...prev,
                      generationMode: e.target.value as GenerationMode
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Participant Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Participants
            </label>
            <input
              type="number"
              min="3"
              max="20"
              value={generationConfig.participantCount || 8}
              onChange={(e) => setGenerationConfig(prev => ({
                ...prev,
                participantCount: parseInt(e.target.value)
              }))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      )}

      {/* Engine Status */}
      {engineState && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase">Success Rate</p>
                <p className="text-sm font-semibold text-blue-900">
                  {Math.round(engineState.performance.successRate * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase">Avg Generation Time</p>
                <p className="text-sm font-semibold text-blue-900">
                  {Math.round(engineState.performance.averageGenerationTime / 1000)}s
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase">Quality Score</p>
                <p className="text-sm font-semibold text-blue-900">
                  {Math.round(engineState.performance.qualityScore * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase">Active Sources</p>
                <p className="text-sm font-semibold text-blue-900">
                  {engineState.dataSources.active.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Scenario Display */}
      {currentScenario && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Scenario</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <EyeIcon className="w-4 h-4" />
                <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
              </button>
            </div>
          </div>

          {/* Scenario Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <DocumentIcon className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600 uppercase">Type</span>
              </div>
              <p className="text-sm font-semibold">{currentScenario.type}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <SparklesIcon className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600 uppercase">Confidence</span>
              </div>
              <p className="text-sm font-semibold">
                {Math.round(currentScenario.metadata.confidence * 100)}%
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <ChartBarIcon className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600 uppercase">Realism</span>
              </div>
              <p className="text-sm font-semibold">
                {Math.round(currentScenario.metadata.realism * 100)}%
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <CogIcon className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600 uppercase">Complexity</span>
              </div>
              <p className="text-sm font-semibold">
                {Math.round(currentScenario.metadata.complexity * 100)}%
              </p>
            </div>
          </div>

          {/* Scenario Preview */}
          {showPreview && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-2">{currentScenario.narrative.title}</h4>
              <p className="text-sm text-gray-700 mb-3">{currentScenario.narrative.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Market Conditions</h5>
                  <div className="space-y-1 text-sm">
                    <p>Condition: <span className="font-medium">{currentScenario.marketConditions.condition}</span></p>
                    <p>Duration: <span className="font-medium">{currentScenario.marketConditions.duration} minutes</span></p>
                    <p>Price Range: <span className="font-medium">
                      A${currentScenario.marketConditions.priceMovement.startPrice.toFixed(2)} -
                      A${currentScenario.marketConditions.priceMovement.endPrice.toFixed(2)}
                    </span></p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Participants</h5>
                  <div className="space-y-1 text-sm">
                    <p>Total: <span className="font-medium">{currentScenario.participants.length} participants</span></p>
                    <p>Profiles: <span className="font-medium">
                      {Array.from(new Set(currentScenario.participants.map(p => p.profile))).join(', ')}
                    </span></p>
                    <p>Volume: <span className="font-medium">
                      {currentScenario.marketConditions.volumeProfile.totalVolume.toLocaleString()} tonnes
                    </span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Validation Results</h3>

          {validationResults.map(validation => (
            <div
              key={validation.id}
              className={`border rounded-lg p-4 mb-3 ${getValidationStatusColor(validation)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getValidationStatusIcon(validation)}
                  <span className="text-sm font-medium">
                    {validation.validationType} validation
                  </span>
                </div>
                <div className="text-sm font-semibold">
                  Score: {Math.round(validation.results.overallScore * 100)}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {validation.results.criteriaScores.map((criteria, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{criteria.name}:</span>
                    <span className={criteria.passed ? 'text-green-600' : 'text-red-600'}>
                      {Math.round(criteria.score * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              {validation.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium mb-1">Recommendations:</p>
                  <ul className="text-xs space-y-1">
                    {validation.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-gray-500">•</span>
                        <span>{rec.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Generation Events</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentEvents.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-start space-x-2 text-sm">
                <span className="text-xs text-gray-500 min-w-16">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                  {event.type.replace(/_/g, ' ')}
                </span>
                {event.scenarioId && (
                  <span className="text-xs text-gray-600 truncate">
                    {event.scenarioId.slice(0, 8)}...
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No scenario state */}
      {!currentScenario && !isGenerating && (
        <div className="px-6 py-8 text-center">
          <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No scenario generated yet</p>
          <p className="text-sm text-gray-500">
            Configure your preferences and click &quot;Generate Scenario&quot; to create an AI-powered trading scenario
          </p>
        </div>
      )}
    </div>
  );
};

export default ScenarioGenerator;