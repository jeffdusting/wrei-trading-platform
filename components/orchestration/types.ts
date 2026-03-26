/**
 * WREI Trading Platform - AI Demo Orchestration Types
 *
 * Stage 2: Component 1 - AI Demo Orchestration Engine
 * TypeScript definitions for intelligent demo flow management and scenario orchestration
 *
 * Date: March 26, 2026
 */

import { AudienceType } from '../audience';
import { ScenarioType } from '../scenarios/types';

// Core Orchestration Types
export type OrchestrationPhase = 'initialization' | 'audience_analysis' | 'context_assessment' | 'scenario_selection' | 'execution' | 'adaptation' | 'completion';
export type EngagementLevel = 'low' | 'medium' | 'high' | 'very_high';
export type KnowledgeLevel = 'novice' | 'intermediate' | 'advanced' | 'expert';
export type DemoObjective = 'education' | 'sales' | 'compliance_review' | 'technical_evaluation' | 'due_diligence';
export type AdaptationTrigger = 'engagement_drop' | 'time_pressure' | 'technical_difficulty' | 'interest_shift' | 'completion_risk';

// Audience Analysis
export interface AudienceAnalysis {
  id: string;
  timestamp: Date;

  // Type Detection
  detectedType: AudienceType;
  confidence: number; // 0-1
  typeIndicators: string[];

  // Engagement Assessment
  engagementLevel: EngagementLevel;
  engagementScore: number; // 0-100
  engagementHistory: EngagementDataPoint[];

  // Knowledge Level Assessment
  knowledgeLevel: KnowledgeLevel;
  technicalFamiliarity: number; // 0-100
  domainExpertise: number; // 0-100

  // Behavioral Patterns
  attentionSpan: number; // minutes
  interactionFrequency: number; // interactions per minute
  preferredPace: 'slow' | 'moderate' | 'fast';
  visualPreference: 'text' | 'charts' | 'mixed';
}

export interface EngagementDataPoint {
  timestamp: Date;
  level: EngagementLevel;
  score: number;
  trigger: string;
}

// Context Assessment
export interface ContextAssessment {
  id: string;
  timestamp: Date;

  // Environment Scan
  environment: {
    deviceType: 'desktop' | 'tablet' | 'mobile';
    screenSize: { width: number; height: number };
    connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
    browserCapabilities: string[];
  };

  // Time Constraints
  timeConstraints: {
    totalAvailable: number; // minutes
    currentElapsed: number; // minutes
    hardDeadline?: Date;
    flexibility: 'none' | 'slight' | 'moderate' | 'high';
  };

  // Objective Analysis
  objectives: {
    primary: DemoObjective;
    secondary: DemoObjective[];
    success_criteria: string[];
    risk_factors: string[];
  };

  // External Factors
  externalFactors: {
    multipleParticipants: boolean;
    recordingSession: boolean;
    followupRequired: boolean;
    decisionTimeframe: string;
  };
}

// Demo Orchestration Configuration
export interface OrchestrationConfig {
  sessionId: string;
  audienceAnalysis: AudienceAnalysis;
  contextAssessment: ContextAssessment;

  // Demo Parameters
  parameters: {
    maxDuration: number; // minutes
    adaptationEnabled: boolean;
    fallbackScenarios: ScenarioType[];
    exitCriteria: ExitCriteria[];
  };

  // AI Configuration
  aiConfig: {
    adaptationSensitivity: number; // 0-1
    contextualPrompting: boolean;
    realTimeOptimization: boolean;
    learningMode: boolean;
  };
}

export interface ExitCriteria {
  condition: string;
  threshold: number;
  action: 'adapt' | 'fallback' | 'terminate';
}

// Orchestration State
export interface OrchestrationState {
  sessionId: string;
  currentPhase: OrchestrationPhase;
  startTime: Date;
  lastUpdateTime: Date;

  // Active Configuration
  config: OrchestrationConfig;

  // Current Status
  status: {
    isActive: boolean;
    isPaused: boolean;
    needsAdaptation: boolean;
    completionPercentage: number;
  };

  // Performance Tracking
  performance: {
    engagementTrend: 'improving' | 'stable' | 'declining';
    objectiveProgress: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high';
    adaptationCount: number;
  };

  // Current Scenario
  activeScenario: {
    type: ScenarioType;
    startTime: Date;
    estimatedCompletion: Date;
    adaptations: ScenarioAdaptation[];
  } | null;
}

export interface ScenarioAdaptation {
  timestamp: Date;
  trigger: AdaptationTrigger;
  previousState: any;
  newState: any;
  reasoning: string;
  effectiveness: number; // 0-100, measured post-adaptation
}

// Orchestration Decision Tree
export interface OrchestrationDecision {
  id: string;
  timestamp: Date;
  context: {
    phase: OrchestrationPhase;
    audienceState: AudienceAnalysis;
    contextState: ContextAssessment;
    performanceMetrics: any;
  };

  // Decision Making
  decision: {
    action: OrchestrationAction;
    confidence: number; // 0-1
    reasoning: string[];
    alternatives: OrchestrationAction[];
  };

  // Expected Outcomes
  expectedOutcome: {
    engagementImprovement: number;
    completionProbability: number;
    riskMitigation: string[];
  };
}

export type OrchestrationAction =
  | { type: 'continue'; parameters?: any }
  | { type: 'adapt_scenario'; newScenario: ScenarioType; adaptations: any }
  | { type: 'adjust_pace'; newPace: 'slow' | 'moderate' | 'fast' }
  | { type: 'change_focus'; newFocus: string; reason: string }
  | { type: 'provide_context'; contextType: string; content: string }
  | { type: 'escalate_engagement'; tactics: string[] }
  | { type: 'prepare_exit'; exitStrategy: string };

// Orchestration Events
export interface OrchestrationEvent {
  id: string;
  timestamp: Date;
  sessionId: string;
  type: OrchestrationEventType;
  data: any;
}

export type OrchestrationEventType =
  | 'session_started'
  | 'audience_analyzed'
  | 'context_assessed'
  | 'scenario_selected'
  | 'adaptation_triggered'
  | 'engagement_changed'
  | 'objective_progress'
  | 'session_completed'
  | 'error_occurred';

// Orchestration Results
export interface OrchestrationResult {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  totalDuration: number; // minutes

  // Success Metrics
  success: {
    objectivesAchieved: number; // 0-100
    audienceSatisfaction: number; // 0-100
    completionRate: number; // 0-100
    adaptationEffectiveness: number; // 0-100
  };

  // Performance Data
  performance: {
    averageEngagement: number;
    peakEngagement: number;
    adaptationCount: number;
    scenariosUsed: ScenarioType[];
  };

  // Insights
  insights: {
    audienceProfile: AudienceAnalysis;
    effectiveStrategies: string[];
    improvementAreas: string[];
    recommendations: string[];
  };

  // Export Data
  exportData: {
    timeline: OrchestrationEvent[];
    decisions: OrchestrationDecision[];
    finalState: OrchestrationState;
  };
}

// AI Orchestration Prompts and Templates
export interface AIPromptTemplate {
  id: string;
  name: string;
  audience: AudienceType;
  phase: OrchestrationPhase;
  template: string;
  variables: string[];
  expectedOutputFormat: 'json' | 'text' | 'structured';
}

export interface AIOrchestrationPrompt {
  template: AIPromptTemplate;
  context: {
    audienceAnalysis: AudienceAnalysis;
    contextAssessment: ContextAssessment;
    currentState: OrchestrationState;
    historicalData?: any;
  };
  generatedPrompt: string;
  expectedResponse: any;
}

// Orchestration Analytics
export interface OrchestrationAnalytics {
  sessionMetrics: {
    totalSessions: number;
    averageDuration: number;
    successRate: number;
    adaptationRate: number;
  };

  audienceInsights: {
    [key in AudienceType]: {
      preferredScenarios: ScenarioType[];
      averageEngagement: number;
      commonAdaptations: string[];
      successPatterns: string[];
    };
  };

  performanceTrends: {
    engagementOverTime: Array<{ date: Date; value: number }>;
    adaptationEffectiveness: Array<{ trigger: AdaptationTrigger; success: number }>;
    objectiveAchievement: Array<{ objective: DemoObjective; success: number }>;
  };
}