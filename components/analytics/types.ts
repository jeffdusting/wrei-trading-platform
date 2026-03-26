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