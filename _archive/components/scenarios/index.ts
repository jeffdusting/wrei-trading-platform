/**
 * WREI Trading Platform - Scenario Components Index
 *
 * Step 1.3: Scenario Library & Templates - Component Exports
 * Central export point for all scenario and template components
 *
 * Date: March 25, 2026
 */

// Main Scenario Router Component
export { default as ScenarioLibrary } from './ScenarioLibrary';

// NSW ESC Market Scenarios
export { default as ESCMarketScenarios } from './ESCMarketScenarios';

// Multi-Participant Trading Simulations
export { default as TradingSimulationEngine } from './TradingSimulationEngine';

// Regulatory Compliance Workflows
export { default as ComplianceWorkflows } from './ComplianceWorkflows';

// Portfolio Optimization Demonstrations
export { default as PortfolioOptimizer } from './PortfolioOptimizer';

// Scenario Configuration and Management
export { default as TemplateManager } from './TemplateManager';

// Type definitions
export type {
  ScenarioType,
  ESCScenarioTemplate,
  TradingSimulation,
  ComplianceWorkflow,
  PortfolioOptimizationScenario,
  ScenarioConfiguration as ScenarioConfigType,
  ScenarioOutcome,
  MarketParticipant,
  TradingParameters
} from './types';