/**
 * WREI Trading Platform - NSW ESC Market Context Configuration
 *
 * Comprehensive NSW Energy Savings Certificates market context for demo scenarios
 * Integrates Clean Energy Regulator compliance framework and Northmore Gordon branding
 *
 * Date: March 25, 2026
 * Context: Stage 1, Step 1.1 - NSW ESC Context Integration
 */

import { PRICING_INDEX } from '../negotiation-config';

// =============================================================================
// NSW ESC MARKET STRUCTURE & PARTICIPANTS
// =============================================================================

export const NSW_ESC_MARKET_CONTEXT = {
  // Market Overview
  MARKET_SIZE: {
    ANNUAL_TRADING_VOLUME: 200_000_000, // A$200M+ annual trading volume
    ANNUAL_ESC_CREATION: 85_000_000,    // ~85M ESCs created annually
    AVERAGE_ESC_SIZE: 2.35,             // A$2.35 average ESC value
    PARTICIPANT_COUNT: 850,             // Active market participants
  },

  // Current Market Conditions (Live Data Integration)
  CURRENT_CONDITIONS: {
    SPOT_PRICE: PRICING_INDEX.ESC_SPOT_REFERENCE,           // A$47.80 current spot
    FORWARD_PRICE: PRICING_INDEX.ESC_FORWARD_REFERENCE,     // A$52.15 forward curve
    VOLATILITY_RANGE: PRICING_INDEX.ESC_VOLATILITY_RANGE,   // [A$38, A$68] range
    LAST_UPDATED: PRICING_INDEX.INDEX_TIMESTAMP,
    DATA_SOURCES: ['AEMO', 'NSW ESC Registry', 'IPART', 'CER'],
  },

  // Market Participants & Trading Patterns
  PARTICIPANTS: {
    ACCREDITED_CERTIFICATE_PROVIDERS: {
      count: 420,
      market_share: 0.65, // 65% of ESC creation
      typical_volume_range: [10_000, 500_000], // ESCs per transaction
    },
    OBLIGED_PERSONS: {
      count: 38, // Energy retailers and large users
      market_share: 0.95, // 95% of ESC demand
      typical_volume_range: [50_000, 2_000_000], // ESCs per quarter
    },
    FINANCIAL_INTERMEDIARIES: {
      count: 45, // Including Northmore Gordon
      market_share: 0.25, // 25% of trading volume facilitation
      typical_volume_range: [25_000, 1_000_000], // ESCs per transaction
    },
    SPECULATORS_TRADERS: {
      count: 347,
      market_share: 0.15, // 15% of trading volume
      typical_volume_range: [5_000, 100_000], // ESCs per transaction
    },
  },

  // ESC Activity Types & Credit Values
  ESC_ACTIVITIES: {
    // Most common ESC activities for demonstration scenarios
    HIGH_EFFICIENCY_MOTORS: {
      activity_code: 'SYS1',
      description: 'High Efficiency Motors',
      market_share: 0.18,
      typical_esc_per_unit: 2.5,
      common_volumes: [10_000, 50_000, 100_000],
    },
    EFFICIENT_LIGHTING: {
      activity_code: 'SYS2',
      description: 'Efficient Lighting',
      market_share: 0.22,
      typical_esc_per_unit: 1.2,
      common_volumes: [25_000, 100_000, 250_000],
    },
    HVAC_EFFICIENCY: {
      activity_code: 'SYS3',
      description: 'HVAC System Efficiency',
      market_share: 0.15,
      typical_esc_per_unit: 8.5,
      common_volumes: [5_000, 25_000, 75_000],
    },
    BUILDING_THERMAL: {
      activity_code: 'SYS4',
      description: 'Building Thermal Efficiency',
      market_share: 0.12,
      typical_esc_per_unit: 15.0,
      common_volumes: [2_000, 10_000, 30_000],
    },
    APPLIANCE_REPLACEMENT: {
      activity_code: 'SYS5',
      description: 'Appliance Replacement',
      market_share: 0.08,
      typical_esc_per_unit: 0.8,
      common_volumes: [50_000, 200_000, 500_000],
    },
  },
} as const;

// =============================================================================
// CLEAN ENERGY REGULATOR COMPLIANCE FRAMEWORK
// =============================================================================

export const CER_COMPLIANCE_FRAMEWORK = {
  // Regulatory Authority Information
  AUTHORITY: {
    name: 'Clean Energy Regulator',
    abbreviation: 'CER',
    jurisdiction: 'Australian Government',
    website: 'https://www.cleanenergyregulator.gov.au',
    established: 2012,
  },

  // NSW ESC Scheme Compliance Requirements
  COMPLIANCE_REQUIREMENTS: {
    // Certificate Creation Compliance
    CERTIFICATE_CREATION: {
      mandatory_audits: {
        frequency: 'annual',
        threshold: 50_000, // ESCs
        auditor_requirements: 'CER-approved auditor',
      },
      record_keeping: {
        duration: '7 years',
        requirements: [
          'Activity implementation evidence',
          'Energy savings calculations',
          'Equipment specifications and invoices',
          'Site visit documentation',
          'Measurement and verification data',
        ],
      },
      reporting_obligations: {
        quarterly_returns: true,
        annual_statements: true,
        ad_hoc_requests: true,
        data_verification: 'mandatory',
      },
    },

    // Trading Compliance
    TRADING_COMPLIANCE: {
      participant_registration: {
        acp_registration: 'mandatory_for_creators',
        registry_account: 'mandatory_for_all',
        identity_verification: 'austrac_aml_ctf',
      },
      transaction_reporting: {
        trade_notifications: 'within_20_business_days',
        registry_transfers: 'within_5_business_days',
        price_reporting: 'voluntary_but_recommended',
      },
      audit_trails: {
        transaction_records: '7_years_retention',
        counterparty_due_diligence: 'ongoing_obligation',
        suspicious_activity: 'report_to_coder_austrac',
      },
    },

    // Market Integrity
    MARKET_INTEGRITY: {
      prohibited_conduct: [
        'Market manipulation',
        'False or misleading information',
        'Insider trading equivalent',
        'Fraudulent certificate creation',
      ],
      monitoring_systems: {
        automated_surveillance: true,
        pattern_detection: true,
        cross_reference_validation: true,
      },
      penalties: {
        civil_penalties: 'up_to_$126,000_individual',
        corporate_penalties: 'up_to_$630,000_entity',
        criminal_referrals: 'serious_breaches',
        licence_suspension: 'repeat_offenders',
      },
    },
  },

  // Automated Compliance Checking (for demo purposes)
  COMPLIANCE_VALIDATION: {
    REAL_TIME_CHECKS: {
      certificate_validity: 'registry_lookup',
      participant_status: 'active_registration_check',
      transaction_limits: 'account_balance_validation',
      sanctions_screening: 'aml_ctf_database',
    },
    PERIODIC_REVIEWS: {
      audit_schedule: 'risk_based_selection',
      compliance_scoring: 'automated_risk_assessment',
      regulatory_updates: 'real_time_notification',
    },
  },
} as const;

// =============================================================================
// NORTHMORE GORDON FIRM CONTEXT
// =============================================================================

export const NORTHMORE_GORDON_CONTEXT = {
  // Firm Profile
  FIRM_PROFILE: {
    name: 'Northmore Gordon',
    established: 1985,
    headquarters: 'Sydney, NSW',
    business_model: 'Independent Advisory Services',
    specialisation: 'Carbon Credit Trading & Environmental Finance',
    regulatory_status: 'AFSL 246896', // Example AFSL number
  },

  // Market Position & Capabilities
  MARKET_POSITION: {
    nsw_esc_market_share: 0.12, // 12% of trading facilitation
    annual_transaction_volume: 24_000_000, // A$24M annually
    client_base: {
      institutional_investors: 45,
      corporate_obliged_persons: 18,
      government_entities: 12,
      trading_desks: 8,
    },
    competitive_advantages: [
      'Deep regulatory expertise',
      'AI-powered trading platform',
      'Institutional-grade settlement',
      'Multi-jurisdiction compliance',
      'Real-time market intelligence',
    ],
  },

  // Service Offerings & Value Proposition
  SERVICE_OFFERINGS: {
    ADVISORY_SERVICES: {
      compliance_consulting: 'CER regulatory navigation',
      market_strategy: 'Optimal ESC trading strategies',
      risk_management: 'Portfolio hedging and optimization',
      due_diligence: 'Certificate verification and validation',
    },
    TRADING_SERVICES: {
      brokerage: 'Principal and agency trading',
      market_making: 'Liquidity provision',
      execution: 'Best execution guarantee',
      settlement: 'T+0 atomic settlement via WREI platform',
    },
    TECHNOLOGY_PLATFORM: {
      ai_negotiation: 'Claude-powered negotiation engine',
      real_time_pricing: 'Live AEMO and registry data feeds',
      compliance_automation: 'Automated CER compliance checking',
      portfolio_analytics: 'Advanced risk and performance metrics',
    },
  },

  // Client Value Propositions by Type
  CLIENT_VALUE_PROPOSITIONS: {
    EXECUTIVE_AUDIENCE: {
      headline: 'Maximize ESC Trading ROI with AI-Powered Intelligence',
      key_benefits: [
        '15-25% improved execution pricing through AI negotiation',
        'Reduced regulatory compliance costs (40% time savings)',
        'Enhanced portfolio performance with real-time analytics',
        'Institutional-grade settlement infrastructure',
      ],
      roi_metrics: {
        cost_savings: '40% reduction in compliance overhead',
        execution_improvement: '15-25% better pricing',
        time_efficiency: '75% faster transaction processing',
        risk_reduction: '60% improved risk monitoring',
      },
    },
    TECHNICAL_AUDIENCE: {
      headline: 'Advanced Technology Infrastructure for Carbon Credit Trading',
      key_benefits: [
        'API-first architecture with real-time data feeds',
        'Blockchain settlement with Zoniqx zProtocol integration',
        'Claude AI integration for intelligent negotiation',
        'Comprehensive audit trails and compliance automation',
      ],
      technical_specs: {
        api_latency: 'Sub-50ms response times',
        uptime_guarantee: '99.9% SLA with failover',
        data_refresh: '15-minute AEMO data updates',
        security: 'SOC2 Type II, ISO 27001 certified',
      },
    },
    COMPLIANCE_AUDIENCE: {
      headline: 'Automated CER Compliance with Comprehensive Audit Trails',
      key_benefits: [
        'Real-time CER compliance validation',
        'Automated audit trail generation',
        'Integrated AML/CTF screening',
        'Comprehensive regulatory reporting',
      ],
      compliance_features: {
        coder_integration: 'Real-time registry validation',
        audit_automation: 'Automated evidence collection',
        risk_monitoring: 'Continuous compliance screening',
        regulatory_updates: 'Real-time regulation change alerts',
      },
    },
  },
} as const;

// =============================================================================
// DEMO SCENARIO CONFIGURATIONS
// =============================================================================

export interface ESCDemoScenario {
  id: string;
  name: string;
  description: string;
  audience: 'executive' | 'technical' | 'compliance';
  duration: number; // minutes
  participants: {
    seller: string;
    buyer: string;
    intermediary?: string;
  };
  esc_details: {
    activity_type: keyof typeof NSW_ESC_MARKET_CONTEXT.ESC_ACTIVITIES;
    volume: number;
    price_range: [number, number];
    compliance_status: 'verified' | 'pending' | 'high_risk';
  };
  negotiation_parameters: {
    starting_price: number;
    reserve_price: number;
    max_concession: number;
    time_pressure: 'low' | 'medium' | 'high';
  };
  expected_outcomes: {
    settlement_price?: number;
    completion_rate: number;
    key_learning_points: string[];
  };
}

export const ESC_DEMO_SCENARIOS: Record<string, ESCDemoScenario> = {
  // Executive-focused scenarios
  EXECUTIVE_HIGH_VOLUME: {
    id: 'exec-high-vol-001',
    name: 'Large Portfolio ESC Acquisition',
    description: 'Institutional investor acquiring 500K ESCs for compliance portfolio',
    audience: 'executive',
    duration: 8,
    participants: {
      seller: 'Major ACP (Lighting Efficiency)',
      buyer: 'Pension Fund (ESG Mandate)',
      intermediary: 'Northmore Gordon',
    },
    esc_details: {
      activity_type: 'EFFICIENT_LIGHTING',
      volume: 500_000,
      price_range: [46.50, 48.50],
      compliance_status: 'verified',
    },
    negotiation_parameters: {
      starting_price: 48.20,
      reserve_price: 46.80,
      max_concession: 0.15,
      time_pressure: 'medium',
    },
    expected_outcomes: {
      settlement_price: 47.40,
      completion_rate: 0.95,
      key_learning_points: [
        'AI negotiation achieves 2.1% better pricing than market average',
        'T+0 settlement reduces counterparty risk',
        'Automated compliance validation saves 40 hours of due diligence',
      ],
    },
  },

  // Technical-focused scenarios
  TECHNICAL_INTEGRATION: {
    id: 'tech-integration-001',
    name: 'API-Driven ESC Trading Integration',
    description: 'Demonstrating system integration capabilities for energy retailer',
    audience: 'technical',
    duration: 12,
    participants: {
      seller: 'Industrial ACP (Motors)',
      buyer: 'Energy Retailer (API Client)',
    },
    esc_details: {
      activity_type: 'HIGH_EFFICIENCY_MOTORS',
      volume: 150_000,
      price_range: [47.20, 49.80],
      compliance_status: 'verified',
    },
    negotiation_parameters: {
      starting_price: 49.50,
      reserve_price: 47.50,
      max_concession: 0.18,
      time_pressure: 'low',
    },
    expected_outcomes: {
      settlement_price: 48.10,
      completion_rate: 0.88,
      key_learning_points: [
        'Real-time AEMO data feeds enable dynamic pricing',
        'Zoniqx zProtocol ensures atomic settlement',
        'API integration reduces manual processing by 85%',
      ],
    },
  },

  // Compliance-focused scenarios
  COMPLIANCE_AUDIT: {
    id: 'comp-audit-001',
    name: 'High-Risk Certificate Due Diligence',
    description: 'Comprehensive compliance validation for potentially fraudulent ESCs',
    audience: 'compliance',
    duration: 15,
    participants: {
      seller: 'Unverified ACP (HVAC)',
      buyer: 'Government Entity',
      intermediary: 'Northmore Gordon (Due Diligence)',
    },
    esc_details: {
      activity_type: 'HVAC_EFFICIENCY',
      volume: 75_000,
      price_range: [44.00, 46.00], // Discounted due to risk
      compliance_status: 'high_risk',
    },
    negotiation_parameters: {
      starting_price: 45.80,
      reserve_price: 42.50,
      max_concession: 0.25,
      time_pressure: 'high',
    },
    expected_outcomes: {
      settlement_price: undefined, // Transaction declined
      completion_rate: 0.15,
      key_learning_points: [
        'Automated CER compliance checks identify red flags',
        'Real-time audit trail generation supports regulatory reporting',
        'Risk-based pricing protects institutional clients',
      ],
    },
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get current ESC market context for demo initialization
 */
export function getCurrentESCMarketContext() {
  return {
    ...NSW_ESC_MARKET_CONTEXT.CURRENT_CONDITIONS,
    market_participants: NSW_ESC_MARKET_CONTEXT.PARTICIPANTS,
    firm_context: NORTHMORE_GORDON_CONTEXT.MARKET_POSITION,
  };
}

/**
 * Get compliance framework summary for audience briefings
 */
export function getCERComplianceFramework() {
  return {
    authority: CER_COMPLIANCE_FRAMEWORK.AUTHORITY,
    key_requirements: Object.keys(CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_REQUIREMENTS),
    validation_methods: CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_VALIDATION,
  };
}

/**
 * Get audience-specific value proposition for Northmore Gordon
 */
export function getNorthmoreGordonValueProp(audience: 'executive' | 'technical' | 'compliance') {
  const propositions = NORTHMORE_GORDON_CONTEXT.CLIENT_VALUE_PROPOSITIONS;

  switch (audience) {
    case 'executive':
      return propositions.EXECUTIVE_AUDIENCE;
    case 'technical':
      return propositions.TECHNICAL_AUDIENCE;
    case 'compliance':
      return propositions.COMPLIANCE_AUDIENCE;
    default:
      return propositions.EXECUTIVE_AUDIENCE;
  }
}

/**
 * Get demo scenario by ID with full context
 */
export function getESCDemoScenario(scenarioId: string): ESCDemoScenario | null {
  // Search by scenario ID, not by object key
  const scenario = Object.values(ESC_DEMO_SCENARIOS).find(s => s.id === scenarioId);
  return scenario || null;
}

/**
 * Get scenarios filtered by audience type
 */
export function getESCScenariosByAudience(audience: 'executive' | 'technical' | 'compliance'): ESCDemoScenario[] {
  return Object.values(ESC_DEMO_SCENARIOS).filter(scenario => scenario.audience === audience);
}

/**
 * Calculate ESC volume recommendations based on activity type
 */
export function getRecommendedESCVolumes(activityType: keyof typeof NSW_ESC_MARKET_CONTEXT.ESC_ACTIVITIES): number[] {
  return [...NSW_ESC_MARKET_CONTEXT.ESC_ACTIVITIES[activityType].common_volumes];
}

/**
 * Validate ESC trading parameters for compliance
 */
export function validateESCTradingParameters(params: {
  volume: number;
  price: number;
  activityType: string;
  participantType: string;
}): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Price validation
  const currentMarket = NSW_ESC_MARKET_CONTEXT.CURRENT_CONDITIONS;
  const [minPrice, maxPrice] = currentMarket.VOLATILITY_RANGE;

  if (params.price < minPrice * 0.8) {
    warnings.push(`Price ${params.price} significantly below market range (${minPrice}-${maxPrice})`);
  }

  if (params.price > maxPrice * 1.2) {
    warnings.push(`Price ${params.price} significantly above market range (${minPrice}-${maxPrice})`);
  }

  // Volume validation
  if (params.volume > 1_000_000) {
    recommendations.push('Consider splitting large volume across multiple transactions');
  }

  if (params.volume < 5_000) {
    recommendations.push('Small volumes may have higher transaction costs');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations,
  };
}

export default {
  NSW_ESC_MARKET_CONTEXT,
  CER_COMPLIANCE_FRAMEWORK,
  NORTHMORE_GORDON_CONTEXT,
  ESC_DEMO_SCENARIOS,
  getCurrentESCMarketContext,
  getCERComplianceFramework,
  getNorthmoreGordonValueProp,
  getESCDemoScenario,
  getESCScenariosByAudience,
  getRecommendedESCVolumes,
  validateESCTradingParameters,
};