/**
 * WREI Trading Platform - Dynamic Scenario Generation Components Export
 *
 * Stage 2: Component 2 - Dynamic Scenario Generation Module
 * Central exports for dynamic scenario generation functionality
 *
 * Date: March 26, 2026
 */

// Core Components
export { ScenarioGenerator } from './ScenarioGenerator';

// React Hook
export { useScenarioGeneration } from './useScenarioGeneration';
export type {
  ScenarioGenerationHookConfig,
  ScenarioGenerationHookResult
} from './useScenarioGeneration';

// Core Engine (for advanced usage)
export { DynamicScenarioEngine } from '@/lib/ai-scenario-generation/DynamicScenarioEngine';

// Types and Interfaces
export type {
  // Core Generation Types
  GenerationMode,
  MarketCondition,
  ParticipantProfile,
  RiskAppetite,
  TradingStrategy,

  // Market Data Integration
  MarketDataSource,
  RealTimeMarketData,

  // Market Condition Generator
  MarketConditionConfig,
  GeneratedMarketCondition,

  // Participant Behavior Engine
  ParticipantBehaviorModel,
  ParticipantDecision,

  // Scenario Generation Configuration
  ScenarioGenerationConfig,

  // Generated Scenario Structure
  GeneratedScenario,
  ScenarioTimeline,

  // Scenario Adaptation
  ScenarioAdaptation,

  // Scenario Validation
  ScenarioValidation,

  // Generation Engine State
  GenerationEngineState,

  // Generation Events
  GenerationEvent,
  GenerationEventType,

  // Monte Carlo Simulation Results
  MonteCarloResults
} from './types';