/**
 * WREI Trading Platform - Scenario System Type Definitions
 *
 * Step 1.3: Scenario Library & Templates - TypeScript Types
 * Comprehensive type definitions for scenario management and trading simulations
 *
 * Date: March 25, 2026
 */

import { AudienceType } from '../audience';

// Core Scenario Types
export type ScenarioType =
  | 'esc-market-trading'
  | 'multi-participant-auction'
  | 'compliance-workflow'
  | 'portfolio-optimization'
  | 'pricing-negotiation'
  | 'risk-assessment'
  | 'regulatory-validation';

export type ScenarioComplexity = 'basic' | 'intermediate' | 'advanced';
export type ScenarioDuration = 'quick' | 'medium' | 'extended'; // 5min, 15min, 30min
export type ScenarioOutcome = 'success' | 'partial' | 'failure' | 'pending';

// NSW ESC Scenario Templates
export interface ESCScenarioTemplate {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  complexity: ScenarioComplexity;
  duration: ScenarioDuration;
  targetAudience: AudienceType[];

  // NSW ESC Market Parameters
  marketContext: {
    spot_price: number; // Current A$/tonne
    volume_available: number; // Tonnes available
    participant_count: number;
    market_volatility: 'low' | 'medium' | 'high';
    time_of_day: 'morning' | 'midday' | 'afternoon' | 'evening';
    seasonal_factor: number; // Multiplier for seasonal demand
  };

  // Trading Parameters
  tradingParameters: TradingParameters;

  // Expected Outcomes
  expectedOutcomes: {
    price_range: [number, number]; // [min, max] A$/tonne
    success_probability: number; // 0-1
    time_to_completion: number; // Minutes
    key_metrics: Record<string, number>;
  };

  // Scenario Script
  scenarioSteps: ScenarioStep[];

  // Validation Rules
  validationRules: ValidationRule[];
}

export interface TradingParameters {
  volume_tonnes: number;
  max_price: number; // A$/tonne
  min_price: number; // A$/tonne
  urgency_level: 'low' | 'medium' | 'high';
  quality_requirements: {
    vintage_year: number;
    verification_standard: 'VCS' | 'CDM' | 'WREI' | 'multiple';
    additionality_proof: boolean;
    co_benefits: boolean;
  };
  settlement_preference: 'T+0' | 'T+1' | 'T+7';
  payment_terms: 'immediate' | 'net-30' | 'escrow';
}

// Trading Simulation Components
export interface TradingSimulation {
  id: string;
  template: ESCScenarioTemplate;
  status: 'setup' | 'running' | 'paused' | 'completed' | 'failed';
  startTime: Date;
  participants: MarketParticipant[];
  currentStep: number;
  stepResults: StepResult[];
  metrics: SimulationMetrics;
}

export interface MarketParticipant {
  id: string;
  type: 'buyer' | 'seller' | 'broker' | 'regulator';
  name: string;
  profile: ParticipantProfile;
  strategy: TradingStrategy;
  current_position: {
    volume_held: number;
    cash_available: number;
    open_orders: Order[];
  };
}

export interface ParticipantProfile {
  risk_tolerance: 'low' | 'medium' | 'high';
  experience_level: 'novice' | 'experienced' | 'expert';
  preferred_price_range: [number, number];
  volume_capacity: number;
  response_speed: 'slow' | 'medium' | 'fast';
  negotiation_style: 'conservative' | 'balanced' | 'aggressive';
}

export interface TradingStrategy {
  approach: 'price-focused' | 'volume-focused' | 'time-focused' | 'balanced';
  concession_rate: number; // % per round
  max_rounds: number;
  break_points: number[]; // Prices at which strategy changes
}

export interface Order {
  id: string;
  type: 'buy' | 'sell';
  volume: number;
  price: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  timestamp: Date;
}

// Scenario Execution
export interface ScenarioStep {
  id: string;
  name: string;
  description: string;
  type: 'market-action' | 'participant-decision' | 'system-event' | 'validation-check';
  duration_seconds: number;

  triggers: {
    automatic: boolean;
    manual_triggers: string[];
    condition_triggers: ConditionTrigger[];
  };

  actions: StepAction[];
  validation: StepValidation;
}

export interface StepAction {
  type: 'price-update' | 'participant-action' | 'market-event' | 'compliance-check';
  target: string; // participant ID, market parameter, etc.
  parameters: Record<string, any>;
  expected_outcome: string;
}

export interface StepResult {
  stepId: string;
  status: ScenarioOutcome;
  startTime: Date;
  endTime?: Date;
  actions_taken: StepAction[];
  metrics_captured: Record<string, number>;
  participant_responses: Record<string, any>;
  validation_results: ValidationResult[];
}

export interface ConditionTrigger {
  metric: string;
  operator: '>' | '<' | '==' | '>=' | '<=';
  value: number | string;
  description: string;
}

export interface StepValidation {
  required_metrics: string[];
  success_criteria: ValidationRule[];
  failure_conditions: ValidationRule[];
}

export interface ValidationRule {
  id: string;
  type: 'price-range' | 'volume-check' | 'time-limit' | 'participant-action' | 'compliance-requirement';
  condition: ConditionTrigger;
  severity: 'warning' | 'error' | 'info';
  message: string;
}

export interface ValidationResult {
  ruleId: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// Compliance Workflows
export interface ComplianceWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'cer-validation' | 'afsl-compliance' | 'aml-ctf-check' | 'audit-trail';
  steps: ComplianceStep[];
  automation_level: 'manual' | 'semi-automated' | 'fully-automated';
  regulatory_framework: {
    authority: 'CER' | 'ASIC' | 'AUSTRAC' | 'APRA';
    requirements: string[];
    documentation_needed: string[];
  };
}

export interface ComplianceStep {
  id: string;
  name: string;
  type: 'document-validation' | 'system-check' | 'manual-review' | 'automated-verification';
  estimated_time: number; // Minutes
  automation_status: 'automated' | 'manual' | 'hybrid';
  validation_criteria: ValidationRule[];
  outputs: ComplianceOutput[];
}

export interface ComplianceOutput {
  type: 'certificate' | 'report' | 'validation-token' | 'audit-entry';
  format: 'pdf' | 'json' | 'xml' | 'blockchain-record';
  retention_period: number; // Days
  access_control: string[];
}

// Portfolio Optimization
export interface PortfolioOptimizationScenario {
  id: string;
  name: string;
  description: string;
  portfolio: CarbonPortfolio;
  objectives: OptimizationObjective[];
  constraints: PortfolioConstraint[];
  time_horizon: number; // Months
  scenario_variants: PortfolioVariant[];
}

export interface CarbonPortfolio {
  id: string;
  name: string;
  total_volume: number; // Tonnes
  credits: CarbonCredit[];
  cash_position: number;
  target_allocations: Record<string, number>; // Asset type -> percentage
}

export interface CarbonCredit {
  id: string;
  type: 'ESC' | 'ACCU' | 'VCS' | 'CDM' | 'WREI';
  volume: number;
  purchase_price: number;
  current_value: number;
  vintage_year: number;
  project_type: string;
  verification_status: 'verified' | 'pending' | 'retired';
  risk_rating: 'low' | 'medium' | 'high';
}

export interface OptimizationObjective {
  type: 'maximize-return' | 'minimize-risk' | 'maximize-liquidity' | 'minimize-cost';
  weight: number; // 0-1, sum of all weights = 1
  target_value?: number;
}

export interface PortfolioConstraint {
  type: 'max-exposure' | 'min-liquidity' | 'vintage-limit' | 'geography-limit';
  parameters: Record<string, number>;
  enforcement: 'hard' | 'soft';
}

export interface PortfolioVariant {
  id: string;
  name: string;
  description: string;
  modifications: PortfolioModification[];
  expected_metrics: Record<string, number>;
}

export interface PortfolioModification {
  type: 'add-credits' | 'remove-credits' | 'rebalance' | 'hedge-position';
  parameters: Record<string, any>;
  rationale: string;
}

// Simulation Metrics and Analytics
export interface SimulationMetrics {
  performance: {
    execution_time: number; // Seconds
    price_improvement: number; // Percentage
    volume_efficiency: number; // Percentage
    success_rate: number; // Percentage
  };

  market_impact: {
    price_movement: number; // A$/tonne change
    volume_traded: number; // Total tonnes
    participant_satisfaction: number; // 0-10 scale
    market_efficiency: number; // 0-1 scale
  };

  risk_metrics: {
    counterparty_risk: number; // 0-10 scale
    settlement_risk: number; // 0-10 scale
    price_volatility: number; // Standard deviation
    liquidity_risk: number; // 0-10 scale
  };

  compliance_metrics: {
    validation_time: number; // Seconds
    compliance_score: number; // 0-100 percentage
    audit_readiness: number; // 0-100 percentage
    regulatory_risk: number; // 0-10 scale
  };
}

// Scenario Configuration
export interface ScenarioConfiguration {
  id: string;
  name: string;
  description: string;
  created_date: Date;
  last_modified: Date;
  creator: string;

  // Template Selection
  base_template: string; // Template ID
  customizations: TemplateCustomization[];

  // Audience Configuration
  target_audiences: AudienceType[];
  audience_specific_configs: Record<AudienceType, AudienceConfiguration>;

  // Demo Settings
  demo_settings: {
    auto_advance: boolean;
    step_timing: 'auto' | 'manual';
    show_metrics: boolean;
    enable_interaction: boolean;
    recording_mode: boolean;
  };

  // Outcome Prediction
  predicted_outcomes: Record<string, number>;
  success_criteria: ValidationRule[];

  // Rollback Configuration
  rollback_points: string[]; // Step IDs where rollback is possible
  fallback_scenarios: string[]; // Alternative scenario IDs
}

export interface TemplateCustomization {
  target: 'market-context' | 'participants' | 'timeline' | 'parameters';
  modifications: Record<string, any>;
  rationale: string;
}

export interface AudienceConfiguration {
  focus_areas: string[];
  metrics_emphasis: string[];
  detail_level: 'high' | 'medium' | 'low';
  interaction_style: 'guided' | 'exploratory' | 'presentation';
  time_allocation: Record<string, number>; // Step type -> minutes
}

// Utility Types
export type ScenarioStatus = 'draft' | 'ready' | 'running' | 'completed' | 'failed' | 'archived';

export interface ScenarioSummary {
  id: string;
  name: string;
  type: ScenarioType;
  status: ScenarioStatus;
  duration: ScenarioDuration;
  target_audiences: AudienceType[];
  last_run: Date | null;
  success_rate: number;
  created_date: Date;
}