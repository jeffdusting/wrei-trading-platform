/**
 * WREI Trading Platform - Analytics System Type Definitions
 *
 * Step 1.4: Enhanced Negotiation Analytics - TypeScript Types
 * Comprehensive type definitions for real-time analytics, performance benchmarking,
 * and market comparison analysis
 *
 * Date: March 25, 2026
 */

import { AudienceType } from '../audience';
import { ScenarioType } from '../scenarios/types';

// Core Analytics Types
export type AnalyticsTimeframe = '1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '1y';
export type MetricType = 'performance' | 'risk' | 'compliance' | 'efficiency' | 'market_position';
export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge' | 'area';
export type BenchmarkType = 'market_average' | 'industry_best' | 'regulatory_minimum' | 'custom';

// Real-time Negotiation Metrics
export interface NegotiationMetrics {
  session_id: string;
  scenario_id: string;
  timestamp: Date;

  // Core Performance Metrics
  performance: {
    total_volume: number; // Tonnes traded
    average_price: number; // A$/tonne
    price_improvement: number; // % vs market
    execution_time: number; // Minutes
    success_rate: number; // % successful negotiations
  };

  // Market Position Metrics
  market_position: {
    market_share: number; // % of total market volume
    price_competitiveness: number; // Rank vs competitors (1-100)
    participant_satisfaction: number; // AI-assessed satisfaction (1-10)
    repeat_customer_rate: number; // % returning customers
  };

  // Risk Assessment Metrics
  risk_metrics: {
    counterparty_risk: number; // Risk score (1-100)
    settlement_risk: number; // Risk of settlement failure (%)
    regulatory_risk: number; // Compliance risk score (1-100)
    market_volatility_exposure: number; // Price volatility impact (%)
  };

  // Efficiency Metrics
  efficiency: {
    negotiations_per_hour: number;
    automation_rate: number; // % automated vs manual steps
    cost_per_transaction: number; // A$ operational cost per trade
    resource_utilisation: number; // % of available trading capacity used
  };

  // NSW ESC Specific Metrics
  esc_metrics: {
    cer_compliance_score: number; // % compliance with CER requirements
    aemo_settlement_time: number; // Minutes for AEMO settlement
    certificate_verification_rate: number; // % successfully verified
    additionality_validation_score: number; // Additionality assessment (1-100)
  };
}

// Performance Benchmarking
export interface PerformanceBenchmark {
  id: string;
  name: string;
  type: BenchmarkType;
  category: MetricType;

  // Benchmark Values
  values: {
    current: number;
    target: number;
    market_average: number;
    industry_best: number;
    regulatory_minimum?: number;
  };

  // Trend Analysis
  trend: {
    direction: 'up' | 'down' | 'stable';
    change_percentage: number;
    timeframe: AnalyticsTimeframe;
    historical_data: Array<{
      timestamp: Date;
      value: number;
    }>;
  };

  // Benchmark Analysis
  analysis: {
    performance_score: number; // 1-100 score vs benchmark
    gap_analysis: {
      gap_value: number;
      gap_percentage: number;
      improvement_potential: number;
    };
    recommendations: string[];
  };
}

// Market Comparison Analysis
export interface MarketComparisonData {
  analysis_id: string;
  timestamp: Date;
  market_segment: 'nsw_esc' | 'accu' | 'vcs' | 'wrei';

  // Competitive Position
  competitive_position: {
    our_position: number; // Market ranking (1-N)
    market_leaders: Array<{
      name: string;
      market_share: number;
      key_strengths: string[];
    }>;
    competitive_advantages: string[];
    areas_for_improvement: string[];
  };

  // Market Analysis
  market_metrics: {
    total_market_size: number; // A$ total market value
    growth_rate: number; // % annual growth
    volatility_index: number; // Market volatility score
    liquidity_score: number; // Market liquidity rating (1-100)
    participant_count: number;
  };

  // Price Analysis
  price_analysis: {
    current_market_price: number; // A$/tonne
    our_average_price: number; // A$/tonne
    price_premium: number; // % premium/discount vs market
    price_trend: {
      short_term: 'bullish' | 'bearish' | 'neutral';
      long_term: 'bullish' | 'bearish' | 'neutral';
      key_drivers: string[];
    };
  };

  // Volume Analysis
  volume_analysis: {
    total_market_volume: number; // Tonnes
    our_volume: number; // Tonnes
    volume_share: number; // % of total market
    volume_trend: 'increasing' | 'decreasing' | 'stable';
  };
}

// Risk Assessment Dashboard
export interface RiskAssessmentData {
  assessment_id: string;
  timestamp: Date;
  overall_risk_score: number; // Composite risk score (1-100)

  // Risk Categories
  risk_categories: {
    operational: OperationalRisk;
    market: MarketRisk;
    regulatory: RegulatoryRisk;
    counterparty: CounterpartyRisk;
    settlement: SettlementRisk;
  };

  // Risk Mitigation
  mitigation_strategies: Array<{
    risk_type: string;
    strategy: string;
    effectiveness: number; // % risk reduction
    implementation_cost: number; // A$ cost
    timeline: string;
  }>;

  // Risk Monitoring
  monitoring: {
    alert_thresholds: Record<string, number>;
    current_alerts: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      timestamp: Date;
      action_required: boolean;
    }>;
    compliance_status: 'compliant' | 'warning' | 'non-compliant';
  };
}

export interface OperationalRisk {
  score: number; // 1-100
  factors: {
    system_uptime: number; // % uptime
    processing_errors: number; // Error rate %
    capacity_utilisation: number; // % of max capacity
    staff_availability: number; // % available staff
  };
  trend: 'improving' | 'stable' | 'deteriorating';
  mitigation_actions: string[];
}

export interface MarketRisk {
  score: number; // 1-100
  factors: {
    price_volatility: number; // Volatility index
    liquidity_risk: number; // Liquidity risk score
    concentration_risk: number; // Portfolio concentration score
    correlation_risk: number; // Cross-asset correlation risk
  };
  var_analysis: {
    daily_var_95: number; // Daily Value at Risk at 95% confidence
    daily_var_99: number; // Daily Value at Risk at 99% confidence
    expected_shortfall: number; // Expected loss beyond VaR
  };
  stress_testing: {
    scenario: string;
    potential_loss: number; // A$ potential loss
    probability: number; // % probability
  }[];
}

export interface RegulatoryRisk {
  score: number; // 1-100
  factors: {
    cer_compliance: number; // % compliant with CER rules
    afsl_compliance: number; // % compliant with AFSL obligations
    aml_ctf_compliance: number; // % compliant with AML/CTF
    reporting_timeliness: number; // % on-time regulatory reports
  };
  compliance_gaps: Array<{
    regulation: string;
    gap_description: string;
    severity: 'low' | 'medium' | 'high';
    remediation_timeline: string;
  }>;
}

export interface CounterpartyRisk {
  score: number; // 1-100
  factors: {
    credit_quality: number; // Average counterparty credit score
    concentration_risk: number; // % exposure to largest counterparty
    settlement_history: number; // % successful settlements
    kyc_compliance: number; // % KYC compliant counterparties
  };
  top_exposures: Array<{
    counterparty_name: string;
    exposure_amount: number; // A$ exposure
    credit_rating: string;
    last_assessment: Date;
  }>;
}

export interface SettlementRisk {
  score: number; // 1-100
  factors: {
    settlement_failure_rate: number; // % failed settlements
    average_settlement_time: number; // Hours to settlement
    blockchain_reliability: number; // % successful blockchain transactions
    payment_system_uptime: number; // % payment system availability
  };
  t0_settlement_metrics: {
    success_rate: number; // % T+0 settlements successful
    average_time: number; // Minutes for T+0 settlement
    cost_per_transaction: number; // A$ cost per T+0 settlement
  };
}

// Data Visualization Configuration
export interface VisualizationConfig {
  id: string;
  title: string;
  chart_type: ChartType;
  data_source: string;
  refresh_interval: number; // Seconds

  // Chart Configuration
  chart_config: {
    x_axis: {
      field: string;
      label: string;
      format?: string;
    };
    y_axis: {
      field: string;
      label: string;
      format?: string;
    };
    series?: Array<{
      field: string;
      label: string;
      color?: string;
    }>;
  };

  // Display Options
  display_options: {
    show_legend: boolean;
    show_grid: boolean;
    show_tooltips: boolean;
    animation: boolean;
    responsive: boolean;
  };

  // Audience Configuration
  audience_config: Array<{
    audience: AudienceType;
    visible: boolean;
    priority: number; // Display priority (1-10)
    custom_styling?: Record<string, any>;
  }>;
}

// Analytics Export/Reporting
export interface AnalyticsReport {
  report_id: string;
  title: string;
  generated_at: Date;
  report_type: 'executive_summary' | 'technical_deep_dive' | 'compliance_report' | 'market_analysis';
  audience: AudienceType;

  // Report Content
  content: {
    executive_summary?: string;
    key_findings: string[];
    performance_highlights: string[];
    risk_summary: string[];
    recommendations: string[];
    market_outlook: string;
  };

  // Data Sections
  data_sections: Array<{
    title: string;
    charts: VisualizationConfig[];
    tables: Array<{
      title: string;
      data: Record<string, any>[];
      columns: string[];
    }>;
    narrative: string;
  }>;

  // Export Options
  export_formats: ('pdf' | 'excel' | 'powerpoint' | 'json')[];
  confidentiality_level: 'public' | 'internal' | 'confidential' | 'restricted';
}

// Real-time Analytics State
export interface AnalyticsState {
  // Current Session
  current_session: {
    session_id: string;
    start_time: Date;
    scenario_type: ScenarioType;
    selected_audience: AudienceType;
    active_metrics: NegotiationMetrics | null;
  };

  // Live Data
  live_data: {
    market_data: MarketComparisonData | null;
    risk_data: RiskAssessmentData | null;
    benchmarks: PerformanceBenchmark[];
    last_updated: Date;
  };

  // Configuration
  config: {
    refresh_interval: number;
    enabled_metrics: MetricType[];
    dashboard_layout: string;
    export_preferences: Record<string, any>;
  };

  // User Preferences
  user_preferences: {
    preferred_timeframe: AnalyticsTimeframe;
    default_chart_types: Record<MetricType, ChartType>;
    alert_thresholds: Record<string, number>;
    custom_benchmarks: PerformanceBenchmark[];
  };
}

// Stage 2 Component 3: Intelligent Analytics Types
// AI-Enhanced Analytics with Predictive Insights

export type PredictionConfidence = 'very_high' | 'high' | 'medium' | 'low';
export type PredictionTimeframe = '1h' | '4h' | '1d' | '1w' | '1m' | '3m' | '6m' | '1y';
export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
export type TrendSignal = 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';

// Core Predictive Analytics Interface
export interface PredictiveAnalytics {
  analysis_id: string;
  timestamp: Date;
  market_forecast: MarketForecast;
  risk_predictions: RiskPredictions;
  performance_optimisation: PerformanceOptimisation;
  competitive_intelligence: CompetitiveIntelligence;
  ai_insights: AIInsights;
}

// Market Forecasting with AI Predictions
export interface MarketForecast {
  forecast_id: string;
  generated_at: Date;
  market_segment: 'nsw_esc' | 'accu' | 'vcs' | 'wrei';

  // Price Predictions
  price_prediction: Array<{
    timeframe: PredictionTimeframe;
    predicted_price: number;
    confidence: number; // 0-100
    confidence_level: PredictionConfidence;
    confidence_interval: {
      lower_bound: number;
      upper_bound: number;
    };
    key_drivers: string[];
  }>;

  // Trend Analysis
  trend_analysis: Array<{
    indicator: string;
    signal: TrendSignal;
    strength: number; // 0-100
    timeframe: PredictionTimeframe;
    reasoning: string;
  }>;

  // Volume Forecasts
  volume_forecast: Array<{
    period: PredictionTimeframe;
    predicted_volume: number; // tonnes
    volume_change: number; // % change vs current
    market_drivers: string[];
  }>;

  // Regulatory Impact Predictions
  regulatory_outlook: {
    upcoming_changes: Array<{
      regulation: string;
      effective_date: Date;
      impact_level: RiskLevel;
      price_impact: number; // % expected price change
      market_impact_description: string;
    }>;
    compliance_cost_forecast: {
      current_cost: number; // A$ per tonne
      predicted_cost: number; // A$ per tonne
      change_percentage: number;
      timeframe: PredictionTimeframe;
    };
  };
}

// Enhanced Risk Predictions with AI
export interface RiskPredictions {
  prediction_id: string;
  generated_at: Date;
  overall_risk_score: number; // 0-100
  risk_level: RiskLevel;

  // Emerging Risk Detection
  emerging_risks: Array<{
    risk_type: string;
    probability: number; // 0-100
    potential_impact: number; // 0-100
    timeframe: PredictionTimeframe;
    risk_description: string;
    mitigation_suggestions: string[];
  }>;

  // Dynamic Risk Scoring
  dynamic_risk_factors: {
    market_volatility: {
      current_score: number;
      predicted_score: number;
      trend: 'increasing' | 'stable' | 'decreasing';
      confidence: PredictionConfidence;
    };
    counterparty_risk: {
      current_score: number;
      predicted_score: number;
      high_risk_counterparties: number;
      risk_concentration: number; // % in top 3 counterparties
    };
    regulatory_risk: {
      current_score: number;
      predicted_score: number;
      upcoming_deadlines: number;
      compliance_gaps: number;
    };
    operational_risk: {
      current_score: number;
      predicted_score: number;
      system_reliability: number;
      capacity_utilisation: number;
    };
  };

  // Stress Testing Scenarios
  stress_test_scenarios: Array<{
    scenario_name: string;
    probability: number; // % probability in next 12 months
    potential_loss: number; // A$ potential loss
    recovery_time: string; // estimated recovery timeframe
    preparedness_score: number; // 0-100 how prepared we are
  }>;
}

// AI-Powered Performance Optimisation
export interface PerformanceOptimisation {
  optimisation_id: string;
  generated_at: Date;

  // Real-time Performance Analysis
  current_performance: {
    efficiency_score: number; // 0-100
    cost_effectiveness: number; // 0-100
    market_competitiveness: number; // 0-100
    automation_level: number; // 0-100
  };

  // Optimisation Recommendations
  optimisation_opportunities: Array<{
    category: 'pricing' | 'operations' | 'technology' | 'compliance' | 'market_timing';
    opportunity_name: string;
    potential_improvement: number; // % improvement
    implementation_effort: 'low' | 'medium' | 'high';
    estimated_value: number; // A$ annual value
    timeline: string;
    ai_confidence: PredictionConfidence;
    detailed_steps: string[];
  }>;

  // Predictive Maintenance
  system_health_predictions: Array<{
    system_component: string;
    current_health: number; // 0-100
    predicted_failure_probability: number; // 0-100
    recommended_maintenance_window: string;
    estimated_downtime_cost: number; // A$ cost if failure occurs
  }>;

  // Resource Allocation Optimisation
  resource_optimisation: {
    current_allocation: Record<string, number>;
    optimal_allocation: Record<string, number>;
    expected_improvement: number; // % improvement in efficiency
    reallocation_cost: number; // A$ cost to implement
    payback_period: string;
  };
}

// Competitive Intelligence with AI Analysis
export interface CompetitiveIntelligence {
  intelligence_id: string;
  generated_at: Date;

  // Market Position Prediction
  predicted_market_share: Array<{
    timeframe: PredictionTimeframe;
    predicted_share: number; // % market share
    confidence: PredictionConfidence;
    key_assumptions: string[];
  }>;

  // Competitor Analysis
  competitor_insights: Array<{
    competitor_name: string;
    current_market_share: number;
    predicted_market_share: number;
    threat_level: RiskLevel;
    competitive_advantages: string[];
    vulnerabilities: string[];
    strategic_recommendations: string[];
  }>;

  // Market Opportunity Analysis
  market_opportunities: Array<{
    opportunity_type: string;
    market_size: number; // A$ potential revenue
    entry_difficulty: 'low' | 'medium' | 'high';
    time_to_capture: string;
    success_probability: number; // 0-100
    required_investment: number; // A$ required investment
    competitive_intensity: RiskLevel;
  }>;

  // Pricing Strategy Intelligence
  pricing_intelligence: {
    optimal_pricing_strategy: string;
    price_elasticity_analysis: {
      current_elasticity: number;
      optimal_price_point: number; // A$ per tonne
      volume_impact: number; // % change in volume
      revenue_impact: number; // % change in revenue
    };
    competitor_pricing_gaps: Array<{
      competitor: string;
      price_gap: number; // % difference vs our pricing
      opportunity_type: 'premium_justification' | 'competitive_pricing' | 'value_positioning';
    }>;
  };
}

// AI-Generated Insights and Recommendations
export interface AIInsights {
  insights_id: string;
  generated_at: Date;
  model_version: string; // Claude model version used

  // Executive Summary (AI-generated)
  executive_summary: {
    key_findings: string[];
    critical_actions: string[];
    strategic_implications: string[];
    risk_alerts: Array<{
      alert_type: string;
      severity: RiskLevel;
      message: string;
      recommended_action: string;
    }>;
  };

  // Audience-Specific Insights
  audience_insights: {
    executive: {
      strategic_recommendations: string[];
      investment_priorities: string[];
      risk_concerns: string[];
      market_opportunities: string[];
    };
    technical: {
      system_optimisations: string[];
      infrastructure_recommendations: string[];
      automation_opportunities: string[];
      performance_improvements: string[];
    };
    compliance: {
      regulatory_updates: string[];
      compliance_priorities: string[];
      risk_mitigation_actions: string[];
      reporting_improvements: string[];
    };
  };

  // Predictive Patterns Recognition
  pattern_recognition: Array<{
    pattern_type: string;
    pattern_description: string;
    historical_accuracy: number; // % accuracy of this pattern historically
    current_strength: number; // 0-100 current pattern strength
    predicted_outcome: string;
    confidence: PredictionConfidence;
  }>;

  // Market Intelligence
  market_intelligence: {
    sentiment_analysis: {
      overall_sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
      sentiment_score: number; // -100 to +100
      sentiment_drivers: string[];
      sentiment_trend: 'improving' | 'stable' | 'deteriorating';
    };
    macro_economic_factors: Array<{
      factor: string;
      impact_level: RiskLevel;
      impact_description: string;
      monitoring_priority: 'high' | 'medium' | 'low';
    }>;
  };
}

// Intelligent Analytics Engine State
export interface IntelligentAnalyticsState {
  engine_status: 'initialising' | 'active' | 'processing' | 'error' | 'offline';
  last_prediction: Date | null;
  prediction_queue: string[];

  // Current Predictions
  active_predictions: {
    market_forecast: MarketForecast | null;
    risk_predictions: RiskPredictions | null;
    performance_optimisation: PerformanceOptimisation | null;
    competitive_intelligence: CompetitiveIntelligence | null;
  };

  // Performance Metrics
  performance_metrics: {
    average_prediction_time: number; // milliseconds
    prediction_accuracy: number; // % historical accuracy
    api_response_time: number; // milliseconds
    cache_hit_rate: number; // % cache hit rate
    error_rate: number; // % error rate
  };

  // Integration Status
  integration_status: {
    orchestration_engine: 'connected' | 'disconnected' | 'error';
    scenario_engine: 'connected' | 'disconnected' | 'error';
    analytics_engine: 'connected' | 'disconnected' | 'error';
    claude_api: 'connected' | 'disconnected' | 'error';
  };

  // Configuration
  configuration: {
    prediction_refresh_interval: number; // minutes
    ai_model_version: string;
    confidence_threshold: number; // minimum confidence for predictions
    audience_preferences: Record<AudienceType, {
      preferred_metrics: string[];
      detail_level: 'high' | 'medium' | 'low';
      update_frequency: number; // minutes
    }>;
  };
}

// Stage 2 Component 4: Adaptive Presentation Layer Types
// AI-Powered Presentation Adaptation and Audience Engagement

export type EngagementTrend = 'increasing' | 'stable' | 'decreasing';
export type PacePreference = 'slow' | 'medium' | 'fast';
export type ContentDepth = 'overview' | 'detailed' | 'deep-dive';
export type VisualPreference = 'charts' | 'tables' | 'narratives' | 'mixed';
export type InteractionStyle = 'guided' | 'interactive' | 'autonomous';
export type PresentationHealth = 'excellent' | 'good' | 'needs_attention' | 'critical';
export type SystemHealth = 'excellent' | 'good' | 'degraded' | 'critical';
export type AudienceResponse = 'positive' | 'neutral' | 'negative';

// Audience engagement metrics tracking
export interface EngagementMetrics {
  attentionLevel: number; // 0-100 scale
  interactionRate: number; // Interactions per minute
  comprehensionScore: number; // Understanding assessment 0-100
  questionFrequency: number; // Questions per 5-minute window
  pacePreference: PacePreference; // Derived from engagement patterns
  topicInterest: Record<string, number>; // Interest scores by topic
  engagementTrend: EngagementTrend;
  lastUpdated: Date;
}

// AI-generated content adaptation recommendations
export interface ContentAdaptation {
  recommendedPace: PacePreference;
  contentDepth: ContentDepth;
  visualPreference: VisualPreference;
  interactionStyle: InteractionStyle;
  topicEmphasis: string[]; // Topics to emphasise
  topicDeemphasis: string[]; // Topics to minimise
  suggestedBreaks: number[]; // Minutes into presentation for breaks
  adaptationConfidence: number; // 0-100 confidence in recommendations
}

// Presentation flow state and optimisation
export interface PresentationFlow {
  currentSection: string;
  completedSections: string[];
  upcomingSections: string[];
  estimatedTimeRemaining: number; // Minutes
  paceAdjustment: number; // -1.0 to 1.0 (slower to faster)
  engagementZones: Array<{
    section: string;
    engagementScore: number;
    duration: number;
    effectiveness: number;
  }>;
  optimisationSuggestions: string[];
  flowHealth: PresentationHealth;
}

// Real-time feedback integration and processing
export interface RealTimeFeedback {
  audienceQuestions: Array<{
    question: string;
    timestamp: Date;
    audienceType: AudienceType;
    complexity: 'basic' | 'intermediate' | 'advanced';
    topic: string;
    urgency: 'low' | 'medium' | 'high';
  }>;
  engagementSignals: Array<{
    signal: 'attention_drop' | 'interest_spike' | 'confusion' | 'approval';
    timestamp: Date;
    section: string;
    confidence: number;
  }>;
  adaptationHistory: Array<{
    adaptation: ContentAdaptation;
    timestamp: Date;
    effectiveness: number;
    audienceResponse: AudienceResponse;
  }>;
  currentFeedbackSummary: string;
}

// Audience-specific personalisation profiles
export interface PersonalisationProfile {
  audienceType: AudienceType;
  preferredPace: PacePreference;
  technicalDepth: 'high-level' | 'moderate' | 'detailed';
  visualPreferences: string[];
  attentionSpan: number; // Minutes
  interactionStyle: 'formal' | 'casual' | 'mixed';
  keyInterests: string[];
  avoidTopics: string[];
  successMetrics: string[];
}

// Comprehensive adaptive presentation state
export interface AdaptivePresentationState {
  isActive: boolean;
  currentAudience: AudienceType;
  startTime: Date;
  elapsedTime: number; // Minutes

  // Core metrics
  engagementMetrics: EngagementMetrics;
  contentAdaptation: ContentAdaptation;
  presentationFlow: PresentationFlow;
  realTimeFeedback: RealTimeFeedback;

  // Personalisation
  activeProfile: PersonalisationProfile;
  adaptationHistory: ContentAdaptation[];

  // Performance tracking
  adaptationEffectiveness: number; // 0-100
  audienceSatisfaction: number; // 0-100
  presentationQuality: number; // 0-100

  // System health
  systemHealth: SystemHealth;
  lastUpdate: Date;
  apiResponseTime: number;
}

// AI-enhanced presentation adaptation response
export interface PresentationAdaptationResponse {
  adaptationSuggestions: string[];
  contentModifications: string[];
  paceAdjustments: string[];
  interactionRecommendations: string[];
  claudeEnhanced?: {
    adaptationSuggestions: string[];
    contentModifications: string[];
    paceAdjustments: string[];
    interactionRecommendations: string[];
  };
  confidence: number;
  marketContext: string;
}

// Engagement analysis with AI insights
export interface EngagementAnalysis {
  insights: string[];
  recommendations: string[];
  nextActions: string[];
  confidence: number;
  detailedAnalysis?: {
    assessment: string;
    riskFactors: string[];
    positiveIndicators: string[];
    immediateActions: string[];
  };
  marketContext: string;
}

// Presentation flow optimisation response
export interface FlowOptimisation {
  currentFlow: PresentationFlow;
  optimisation: {
    flowOptimisation: string[];
    sectionPriority: string[];
    timeManagement: string[];
    transitions: string[];
  };
  marketContext: string;
}

// Session summary after presentation completion
export interface PresentationSessionSummary {
  sessionSummary: {
    duration: number;
    averageEngagement: number;
    totalInteractions: number;
    adaptations: number;
    overallEffectiveness: number;
  };
  insights: string[];
  recommendations: string[];
  marketContext: string;
}

// Performance metrics for adaptive presentation engine
export interface AdaptivePresentationPerformanceMetrics {
  systemHealth: SystemHealth;
  apiResponseTime: number;
  adaptationAccuracy: number;
  engagementPredictionAccuracy: number;
  systemUptime: number;
  cacheHitRate: number;
}

// Engagement monitoring history entry
export interface EngagementHistoryEntry {
  timestamp: Date;
  attentionLevel: number;
  interactionRate: number;
  comprehensionScore: number;
}

// API operation types for adaptive presentation
export type AdaptivePresentationOperation =
  | 'start_session'
  | 'generate_adaptation'
  | 'analyze_engagement'
  | 'optimize_flow'
  | 'generate_insights'
  | 'end_session'
  | 'engine_health'
  | 'performance_metrics';

// Request context for API operations
export interface AdaptivePresentationContext {
  currentSection?: string;
  timeRemaining?: number;
  sectionProgress?: number;
  totalSections?: number;
  customProfile?: Partial<PersonalisationProfile>;
}

// Engagement data for API operations
export interface AdaptivePresentationEngagementData {
  attentionLevel?: number;
  interactionRate?: number;
  comprehensionScore?: number;
  questionFrequency?: number;
  pacePreference?: PacePreference;
}

// Complete API request interface
export interface AdaptivePresentationAPIRequest {
  operation: AdaptivePresentationOperation;
  audienceType?: AudienceType;
  context?: AdaptivePresentationContext;
  engagementData?: AdaptivePresentationEngagementData;
  marketContext?: string;
}

// Complete API response interface
export interface AdaptivePresentationAPIResponse {
  success: boolean;
  operation: AdaptivePresentationOperation;
  data: any;
  error?: string;
  responseTime: number;
  marketContext: string;
  timestamp?: string;
}