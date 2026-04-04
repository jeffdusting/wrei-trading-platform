/**
 * WREI Trading Platform - Orchestration Components Export
 *
 * Stage 2: Component 1 - AI Demo Orchestration Engine
 * Central exports for orchestration functionality
 *
 * Date: March 26, 2026
 */

// Core Components
export { DemoOrchestrator } from './DemoOrchestrator';

// Types and Interfaces
export type {
  OrchestrationPhase,
  EngagementLevel,
  KnowledgeLevel,
  DemoObjective,
  AdaptationTrigger,
  AudienceAnalysis,
  EngagementDataPoint,
  ContextAssessment,
  OrchestrationConfig,
  ExitCriteria,
  OrchestrationState,
  ScenarioAdaptation,
  OrchestrationDecision,
  OrchestrationAction,
  OrchestrationEvent,
  OrchestrationEventType,
  OrchestrationResult,
  AIPromptTemplate,
  AIOrchestrationPrompt,
  OrchestrationAnalytics
} from './types';

// Core Engine (for advanced usage)
export { DemoOrchestrationEngine } from '@/lib/ai-orchestration/DemoOrchestrationEngine';