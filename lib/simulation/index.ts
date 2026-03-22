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
export function createSimulationEnvironment(config: {
  scenarioId: string;
  persona: InvestorPersona;
  apiConfig?: Partial<ApiSimulationConfig>;
}) {
  const engine = new ScenarioEngine(config.scenarioId, config.persona);
  const apiGateway = new MockApiGateway(config.apiConfig);
  const performanceTracker = new PerformanceTracker();

  const sessionId = performanceTracker.startSession(
    config.scenarioId,
    config.persona.id,
    `user_${Date.now()}`
  );

  return {
    engine,
    apiGateway,
    performanceTracker,
    sessionId,
    executeAction: async (actionId: string, parameters?: any) => {
      // Record interaction
      performanceTracker.recordInteraction(sessionId, 'click', actionId, parameters);

      // Execute action through engine
      const result = await engine.executeAction(actionId, parameters);

      // Record performance metrics
      performanceTracker.recordPerformanceMetric(sessionId, 'avgResponseTime', 200);

      return result;
    },
    getProgress: () => engine.getProgress(),
    getRealTimeMetrics: () => performanceTracker.getRealTimeMetrics(sessionId),
    endSession: (status: 'completed' | 'abandoned' | 'error', feedback?: UserFeedback) => {
      performanceTracker.endSession(sessionId, status, feedback);
    }
  };
}