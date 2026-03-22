/**
 * WREI Core Simulation Library
 * Complete simulation engine for institutional investor scenarios
 * Version: 6.3.0
 */

// Core Engine
export { ScenarioEngine } from './scenario-engine';
export type {
  SimulationContext,
  InvestorPersona,
  PersonaPreferences,
  SimulationState,
  UserInput,
  SystemResponse,
  PerformanceMetrics,
  ScenarioStep,
  ActionResult,
  ProgressInfo
} from './scenario-engine';

// Mock API Gateway
export { MockApiGateway } from './mock-api-gateway';
export type {
  ApiSimulationConfig,
  ApiResponse,
  BloombergQuery,
  BloombergData,
  ESGRating,
  MarketData,
  RegulatoryInfo,
  ConsortiumInfo,
  PortfolioData,
  RiskAnalysis
} from './mock-api-gateway';

// Performance Tracking
export { PerformanceTracker } from './performance-tracker';
export type {
  PerformanceSession,
  SessionMetrics,
  EfficiencyMetrics,
  TechnicalMetrics,
  UserInteraction,
  MilestoneEvent,
  UserFeedback,
  AggregateAnalytics,
  PerformanceReport,
  RealTimeMetrics,
  OptimizationSuggestion
} from './performance-tracker';

// Utility function for creating a complete simulation environment
// Minimal stub implementation for deployment compatibility
export function createSimulationEnvironment(config: {
  scenarioId: string;
  persona: any;
  apiConfig?: any;
}) {
  const sessionId = `session_${Date.now()}`;

  return {
    sessionId,
    performanceTracker: {
      recordMilestone: (id: string, name: string, type: string, data?: any) => {
        console.log('Milestone recorded:', id, name, type, data);
      },
      recordInteraction: (id: string, type: string, action: string, data?: any) => {
        console.log('Interaction recorded:', id, type, action, data);
      }
    },
    executeAction: async (actionId: string, parameters?: any) => {
      console.log('Simulation action:', actionId, parameters);
      return { success: true, data: parameters };
    },
    getProgress: () => ({ completed: 0, total: 10 }),
    getRealTimeMetrics: () => ({ responseTime: 200, accuracy: 0.85 }),
    endSession: (status: string, feedback?: any) => {
      console.log('Simulation ended:', status, feedback);
    }
  };
}