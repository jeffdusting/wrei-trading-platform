/**
 * WREI Trading Platform - Dynamic Scenario Generation Types
 *
 * Stage 2: Component 2 - Dynamic Scenario Generation Engine
 * TypeScript definitions for AI-powered scenario generation and market simulation
 *
 * Date: March 26, 2026
 */

import { AudienceType } from '../audience';
import { ScenarioType } from '../scenarios/types';

// Core Generation Types
export type GenerationMode = 'realtime' | 'simulation' | 'hybrid';
export type MarketCondition = 'bull' | 'bear' | 'volatile' | 'stable' | 'crisis';
export type ParticipantProfile = 'institutional' | 'retail' | 'corporate' | 'government' | 'speculative';
export type RiskAppetite = 'conservative' | 'balanced' | 'aggressive' | 'speculative';
export type TradingStrategy = 'arbitrage' | 'momentum' | 'value' | 'compliance' | 'portfolio_optimization';

// Market Data Integration
export interface MarketDataSource {
  id: string;
  provider: 'bloomberg' | 'refinitiv' | 'aemo' | 'internal';
  endpoint: string;
  apiKey?: string;
  updateFrequency: number; // milliseconds
  lastUpdate: Date;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
}

export interface RealTimeMarketData {
  timestamp: Date;
  escSpotPrice: number; // A$/tonne
  volume24h: number; // tonnes
  volatility: number; // percentage
  bidAskSpread: number; // A$/tonne
  marketDepth: {
    bids: Array<{ price: number; volume: number }>;
    asks: Array<{ price: number; volume: number }>;
  };
  marketIndicators: {
    trend: 'up' | 'down' | 'sideways';
    momentum: number; // -1 to 1
    liquidity: 'high' | 'medium' | 'low';
    sentimentScore: number; // -100 to 100
  };
}

// Market Condition Generator
export interface MarketConditionConfig {
  baseCondition: MarketCondition;
  volatilityRange: [number, number]; // [min, max] percentage
  priceRange: [number, number]; // [min, max] A$/tonne
  volumeRange: [number, number]; // [min, max] tonnes
  trendStrength: number; // 0-1
  noiseLevel: number; // 0-1
  seasonalEffects: boolean;
  regulatoryImpacts: string[];
}

export interface GeneratedMarketCondition {
  id: string;
  timestamp: Date;
  condition: MarketCondition;
  duration: number; // minutes

  priceMovement: {
    startPrice: number; // A$/tonne
    endPrice: number; // A$/tonne
    peakPrice: number;
    troughPrice: number;
    priceTrajectory: Array<{ time: number; price: number }>;
  };

  volumeProfile: {
    totalVolume: number; // tonnes
    volumeDistribution: Array<{ time: number; volume: number }>;
    largeTradesCount: number;
    averageTradeSize: number;
  };

  volatilityMetrics: {
    historicalVolatility: number;
    impliedVolatility: number;
    volatilityClusters: Array<{ start: number; end: number; intensity: number }>;
  };

  marketEvents: Array<{
    time: number;
    type: 'regulatory_change' | 'major_trade' | 'news_impact' | 'technical_break';
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

// Participant Behavior Engine
export interface ParticipantBehaviorModel {
  id: string;
  profile: ParticipantProfile;
  riskAppetite: RiskAppetite;
  tradingStrategy: TradingStrategy;

  decisionFactors: {
    priceWeight: number; // 0-1
    volumeWeight: number; // 0-1
    trendWeight: number; // 0-1
    timeWeight: number; // 0-1
    riskWeight: number; // 0-1
  };

  behavioralBiases: {
    anchoring: number; // 0-1
    herding: number; // 0-1
    overconfidence: number; // 0-1
    lossAversion: number; // 0-1
    recencyBias: number; // 0-1
  };

  constraints: {
    maxPositionSize: number; // tonnes
    maxDailyVolume: number; // tonnes
    priceRange: [number, number]; // [min, max] acceptable prices
    timeHorizon: number; // minutes
  };
}

export interface ParticipantDecision {
  participantId: string;
  timestamp: Date;
  decision: 'buy' | 'sell' | 'hold' | 'hedge';
  volume: number; // tonnes
  priceLimit: number; // A$/tonne
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  reasoning: string[];
  alternativeActions: Array<{
    action: 'buy' | 'sell' | 'hold' | 'hedge';
    probability: number;
    rationale: string;
  }>;
}

// Scenario Generation Configuration
export interface ScenarioGenerationConfig {
  id: string;
  audience: AudienceType;
  duration: number; // minutes
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  objectives: string[];

  marketConfig: MarketConditionConfig;
  participantCount: number;
  participantMix: Record<ParticipantProfile, number>; // percentage distribution

  generationMode: GenerationMode;
  realTimeDataSources: MarketDataSource[];

  constraints: {
    minTradeSize: number; // tonnes
    maxTradeSize: number; // tonnes
    allowableOutcomes: string[];
    prohibitedScenarios: string[];
  };

  adaptationRules: Array<{
    trigger: string;
    condition: string;
    action: string;
    parameters: any;
  }>;
}

// Generated Scenario Structure
export interface GeneratedScenario {
  id: string;
  type: ScenarioType;
  timestamp: Date;
  config: ScenarioGenerationConfig;

  metadata: {
    generationMethod: 'ai' | 'simulation' | 'hybrid';
    confidence: number; // 0-1
    realism: number; // 0-1
    complexity: number; // 0-1
    adaptability: number; // 0-1
  };

  narrative: {
    title: string;
    description: string;
    context: string;
    objectives: string[];
    expectedOutcomes: string[];
    keyLearnings: string[];
  };

  marketConditions: GeneratedMarketCondition;
  participants: ParticipantBehaviorModel[];
  timeline: ScenarioTimeline;

  outcomes: {
    probabilistic: Array<{
      outcome: string;
      probability: number;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
    }>;
    deterministic: Array<{
      outcome: string;
      conditions: string[];
      description: string;
    }>;
  };

  adaptations: ScenarioAdaptation[];
  validations: ScenarioValidation[];
}

// Scenario Timeline
export interface ScenarioTimeline {
  totalDuration: number; // minutes
  phases: Array<{
    name: string;
    startTime: number; // minutes from start
    duration: number; // minutes
    description: string;
    keyEvents: string[];
    expectedActions: string[];
  }>;

  criticalEvents: Array<{
    time: number; // minutes from start
    event: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    trigger: string;
    outcomes: string[];
  }>;

  decisionPoints: Array<{
    time: number; // minutes from start
    description: string;
    options: string[];
    defaultAction: string;
    timeLimit: number; // seconds
  }>;
}

// Scenario Adaptation
export interface ScenarioAdaptation {
  id: string;
  timestamp: Date;
  trigger: {
    type: 'audience_engagement' | 'time_constraint' | 'performance_metric' | 'user_input';
    value: any;
    threshold: any;
    condition: string;
  };

  adaptation: {
    type: 'parameter_adjustment' | 'event_injection' | 'outcome_modification' | 'timeline_compression';
    description: string;
    changes: Array<{
      component: string;
      property: string;
      oldValue: any;
      newValue: any;
    }>;
  };

  impact: {
    realism: number; // change in realism score
    complexity: number; // change in complexity
    duration: number; // change in duration (minutes)
    engagement: number; // expected engagement impact
  };

  rollbackPlan: {
    conditions: string[];
    actions: string[];
    timeLimit: number; // minutes
  };
}

// Scenario Validation
export interface ScenarioValidation {
  id: string;
  timestamp: Date;
  validationType: 'realism' | 'compliance' | 'market_accuracy' | 'participant_behavior' | 'outcome_probability';

  criteria: {
    name: string;
    description: string;
    weight: number; // 0-1
    threshold: number; // 0-1
  }[];

  results: {
    overallScore: number; // 0-1
    passed: boolean;
    criteriaScores: Array<{
      name: string;
      score: number; // 0-1
      passed: boolean;
      feedback: string;
    }>;
  };

  recommendations: Array<{
    type: 'improvement' | 'adjustment' | 'replacement';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedImpact: number; // 0-1
  }>;
}

// Generation Engine State
export interface GenerationEngineState {
  isActive: boolean;
  currentGeneration: string | null; // scenario ID being generated
  queuedGenerations: string[]; // scenario IDs in queue

  performance: {
    averageGenerationTime: number; // milliseconds
    successRate: number; // 0-1
    qualityScore: number; // 0-1
    adaptationRate: number; // adaptations per scenario
  };

  cache: {
    marketConditions: Map<string, GeneratedMarketCondition>;
    participantModels: Map<string, ParticipantBehaviorModel>;
    scenarioTemplates: Map<string, Partial<GeneratedScenario>>;
    validationResults: Map<string, ScenarioValidation>;
  };

  dataSources: {
    active: MarketDataSource[];
    inactive: MarketDataSource[];
    errors: Array<{
      sourceId: string;
      error: string;
      timestamp: Date;
    }>;
  };
}

// Generation Events
export interface GenerationEvent {
  id: string;
  timestamp: Date;
  type: GenerationEventType;
  scenarioId?: string;
  data: any;
}

export type GenerationEventType =
  | 'generation_started'
  | 'market_condition_generated'
  | 'participants_modeled'
  | 'scenario_validated'
  | 'adaptation_triggered'
  | 'generation_completed'
  | 'generation_failed'
  | 'cache_updated'
  | 'data_source_connected'
  | 'data_source_error';

// Monte Carlo Simulation Results
export interface MonteCarloResults {
  simulationId: string;
  timestamp: Date;
  runs: number;

  priceOutcomes: {
    mean: number;
    median: number;
    stdDev: number;
    percentiles: Array<{ percentile: number; value: number }>;
    distribution: Array<{ range: [number, number]; probability: number }>;
  };

  volumeOutcomes: {
    totalVolume: { mean: number; stdDev: number; distribution: Array<{ range: [number, number]; probability: number }> };
    largestTrade: { mean: number; max: number; probability: number };
    participantVolumes: Array<{ participantId: string; volume: number; confidence: number }>;
  };

  scenarioOutcomes: Array<{
    outcome: string;
    probability: number;
    conditions: string[];
    impact: number; // -1 to 1
    confidence: number; // 0-1
  }>;

  riskMetrics: {
    valueAtRisk: Array<{ confidence: number; var: number }>; // VaR at different confidence levels
    expectedShortfall: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}