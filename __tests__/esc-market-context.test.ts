/**
 * WREI Trading Platform - NSW ESC Market Context Tests
 *
 * Unit tests for Step 1.1: NSW ESC Context Integration
 * Testing NSW ESC market context, Clean Energy Regulator compliance, and Northmore Gordon branding
 *
 * Date: March 25, 2026
 */

import {
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
} from '../lib/demo-mode/esc-market-context';
import { PRICING_INDEX, NSW_ESC_CONFIG } from '../lib/negotiation-config';

describe('NSW ESC Market Context', () => {
  describe('Market Structure', () => {
    test('should have valid market size configuration', () => {
      expect(NSW_ESC_MARKET_CONTEXT.MARKET_SIZE.ANNUAL_TRADING_VOLUME).toBe(200_000_000);
      expect(NSW_ESC_MARKET_CONTEXT.MARKET_SIZE.ANNUAL_ESC_CREATION).toBe(85_000_000);
      expect(NSW_ESC_MARKET_CONTEXT.MARKET_SIZE.PARTICIPANT_COUNT).toBe(850);
    });

    test('should integrate with live pricing data', () => {
      expect(NSW_ESC_MARKET_CONTEXT.CURRENT_CONDITIONS.SPOT_PRICE).toBe(PRICING_INDEX.ESC_SPOT_REFERENCE);
      expect(NSW_ESC_MARKET_CONTEXT.CURRENT_CONDITIONS.FORWARD_PRICE).toBe(PRICING_INDEX.ESC_FORWARD_REFERENCE);
      expect(NSW_ESC_MARKET_CONTEXT.CURRENT_CONDITIONS.VOLATILITY_RANGE).toEqual(PRICING_INDEX.ESC_VOLATILITY_RANGE);
    });

    test('should have comprehensive participant structure', () => {
      const participants = NSW_ESC_MARKET_CONTEXT.PARTICIPANTS;
      expect(participants.ACCREDITED_CERTIFICATE_PROVIDERS.count).toBe(420);
      expect(participants.OBLIGED_PERSONS.count).toBe(38);
      expect(participants.FINANCIAL_INTERMEDIARIES.count).toBe(45);
      expect(participants.SPECULATORS_TRADERS.count).toBe(347);
    });

    test('should have valid ESC activity types', () => {
      const activities = NSW_ESC_MARKET_CONTEXT.ESC_ACTIVITIES;
      expect(activities.HIGH_EFFICIENCY_MOTORS.activity_code).toBe('SYS1');
      expect(activities.EFFICIENT_LIGHTING.market_share).toBe(0.22);
      expect(activities.HVAC_EFFICIENCY.typical_esc_per_unit).toBe(8.5);
    });
  });

  describe('Current Market Context Helper', () => {
    test('getCurrentESCMarketContext should return valid market data', () => {
      const context = getCurrentESCMarketContext();

      expect(context.SPOT_PRICE).toBe(47.80);
      expect(context.FORWARD_PRICE).toBe(52.15);
      expect(context.market_participants).toBeDefined();
      expect(context.firm_context).toBeDefined();
    });
  });
});

describe('Clean Energy Regulator Compliance Framework', () => {
  describe('Authority Information', () => {
    test('should have valid CER authority details', () => {
      expect(CER_COMPLIANCE_FRAMEWORK.AUTHORITY.name).toBe('Clean Energy Regulator');
      expect(CER_COMPLIANCE_FRAMEWORK.AUTHORITY.abbreviation).toBe('CER');
      expect(CER_COMPLIANCE_FRAMEWORK.AUTHORITY.jurisdiction).toBe('Australian Government');
      expect(CER_COMPLIANCE_FRAMEWORK.AUTHORITY.established).toBe(2012);
    });
  });

  describe('Compliance Requirements', () => {
    test('should have certificate creation compliance rules', () => {
      const creation = CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_REQUIREMENTS.CERTIFICATE_CREATION;
      expect(creation.mandatory_audits.frequency).toBe('annual');
      expect(creation.mandatory_audits.threshold).toBe(50_000);
      expect(creation.record_keeping.duration).toBe('7 years');
    });

    test('should have trading compliance requirements', () => {
      const trading = CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_REQUIREMENTS.TRADING_COMPLIANCE;
      expect(trading.transaction_reporting.trade_notifications).toBe('within_20_business_days');
      expect(trading.transaction_reporting.registry_transfers).toBe('within_5_business_days');
      expect(trading.audit_trails.transaction_records).toBe('7_years_retention');
    });

    test('should have market integrity rules', () => {
      const integrity = CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_REQUIREMENTS.MARKET_INTEGRITY;
      expect(integrity.prohibited_conduct).toContain('Market manipulation');
      expect(integrity.prohibited_conduct).toContain('Fraudulent certificate creation');
      expect(integrity.penalties.civil_penalties).toBe('up_to_$126,000_individual');
    });
  });

  describe('Compliance Framework Helper', () => {
    test('getCERComplianceFramework should return summary', () => {
      const framework = getCERComplianceFramework();

      expect(framework.authority.name).toBe('Clean Energy Regulator');
      expect(framework.key_requirements).toContain('CERTIFICATE_CREATION');
      expect(framework.key_requirements).toContain('TRADING_COMPLIANCE');
      expect(framework.validation_methods).toBeDefined();
    });
  });
});

describe('Northmore Gordon Firm Context', () => {
  describe('Firm Profile', () => {
    test('should have valid firm information', () => {
      expect(NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE.name).toBe('Northmore Gordon');
      expect(NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE.established).toBe(1985);
      expect(NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE.headquarters).toBe('Sydney, NSW');
      expect(NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE.regulatory_status).toBe('AFSL 246896');
    });
  });

  describe('Market Position', () => {
    test('should have realistic market share and client base', () => {
      expect(NORTHMORE_GORDON_CONTEXT.MARKET_POSITION.nsw_esc_market_share).toBe(0.12);
      expect(NORTHMORE_GORDON_CONTEXT.MARKET_POSITION.annual_transaction_volume).toBe(24_000_000);
      expect(NORTHMORE_GORDON_CONTEXT.MARKET_POSITION.client_base.institutional_investors).toBe(45);
    });
  });

  describe('Value Propositions', () => {
    test('getNorthmoreGordonValueProp should return audience-specific content', () => {
      const executiveVP = getNorthmoreGordonValueProp('executive');
      expect(executiveVP.headline).toContain('Maximize ESC Trading ROI');
      expect(executiveVP.roi_metrics.cost_savings).toBe('40% reduction in compliance overhead');

      const technicalVP = getNorthmoreGordonValueProp('technical');
      expect(technicalVP.headline).toContain('Advanced Technology Infrastructure');
      expect(technicalVP.technical_specs.api_latency).toBe('Sub-50ms response times');

      const complianceVP = getNorthmoreGordonValueProp('compliance');
      expect(complianceVP.headline).toContain('Automated CER Compliance');
      expect(complianceVP.compliance_features.coder_integration).toBe('Real-time registry validation');
    });
  });
});

describe('Demo Scenarios', () => {
  describe('ESC Demo Scenarios', () => {
    test('should have executive scenario configured', () => {
      const scenario = ESC_DEMO_SCENARIOS.EXECUTIVE_HIGH_VOLUME;
      expect(scenario.name).toBe('Large Portfolio ESC Acquisition');
      expect(scenario.audience).toBe('executive');
      expect(scenario.esc_details.volume).toBe(500_000);
      expect(scenario.esc_details.activity_type).toBe('EFFICIENT_LIGHTING');
    });

    test('should have technical scenario configured', () => {
      const scenario = ESC_DEMO_SCENARIOS.TECHNICAL_INTEGRATION;
      expect(scenario.name).toBe('API-Driven ESC Trading Integration');
      expect(scenario.audience).toBe('technical');
      expect(scenario.esc_details.volume).toBe(150_000);
      expect(scenario.esc_details.activity_type).toBe('HIGH_EFFICIENCY_MOTORS');
    });

    test('should have compliance scenario configured', () => {
      const scenario = ESC_DEMO_SCENARIOS.COMPLIANCE_AUDIT;
      expect(scenario.name).toBe('High-Risk Certificate Due Diligence');
      expect(scenario.audience).toBe('compliance');
      expect(scenario.esc_details.compliance_status).toBe('high_risk');
    });
  });

  describe('Scenario Helper Functions', () => {
    test('getESCDemoScenario should return scenario by ID', () => {
      const scenario = getESCDemoScenario('exec-high-vol-001');
      expect(scenario).toBeDefined();
      expect(scenario?.name).toBe('Large Portfolio ESC Acquisition');

      const nonExistent = getESCDemoScenario('non-existent');
      expect(nonExistent).toBeNull();
    });

    test('getESCScenariosByAudience should filter by audience type', () => {
      const executiveScenarios = getESCScenariosByAudience('executive');
      expect(executiveScenarios).toHaveLength(1);
      expect(executiveScenarios[0].audience).toBe('executive');

      const technicalScenarios = getESCScenariosByAudience('technical');
      expect(technicalScenarios).toHaveLength(1);
      expect(technicalScenarios[0].audience).toBe('technical');

      const complianceScenarios = getESCScenariosByAudience('compliance');
      expect(complianceScenarios).toHaveLength(1);
      expect(complianceScenarios[0].audience).toBe('compliance');
    });
  });
});

describe('ESC Trading Utilities', () => {
  describe('Volume Recommendations', () => {
    test('getRecommendedESCVolumes should return activity-specific volumes', () => {
      const lightingVolumes = getRecommendedESCVolumes('EFFICIENT_LIGHTING');
      expect(lightingVolumes).toEqual([25_000, 100_000, 250_000]);

      const motorVolumes = getRecommendedESCVolumes('HIGH_EFFICIENCY_MOTORS');
      expect(motorVolumes).toEqual([10_000, 50_000, 100_000]);

      const hvacVolumes = getRecommendedESCVolumes('HVAC_EFFICIENCY');
      expect(hvacVolumes).toEqual([5_000, 25_000, 75_000]);
    });
  });

  describe('Trading Parameter Validation', () => {
    test('validateESCTradingParameters should validate price ranges', () => {
      // Valid parameters
      const validParams = {
        volume: 50_000,
        price: 47.80,
        activityType: 'EFFICIENT_LIGHTING',
        participantType: 'ACP',
      };
      const validResult = validateESCTradingParameters(validParams);
      expect(validResult.isValid).toBe(true);
      expect(validResult.warnings).toHaveLength(0);

      // Price too low
      const lowPriceParams = {
        ...validParams,
        price: 25.00, // Well below market range
      };
      const lowPriceResult = validateESCTradingParameters(lowPriceParams);
      expect(lowPriceResult.isValid).toBe(false);
      expect(lowPriceResult.warnings[0]).toContain('significantly below market range');

      // Price too high
      const highPriceParams = {
        ...validParams,
        price: 85.00, // Well above market range
      };
      const highPriceResult = validateESCTradingParameters(highPriceParams);
      expect(highPriceResult.isValid).toBe(false);
      expect(highPriceResult.warnings[0]).toContain('significantly above market range');
    });

    test('should provide volume recommendations', () => {
      const largeVolumeParams = {
        volume: 1_500_000,
        price: 47.80,
        activityType: 'EFFICIENT_LIGHTING',
        participantType: 'ACP',
      };
      const largeVolumeResult = validateESCTradingParameters(largeVolumeParams);
      expect(largeVolumeResult.recommendations[0]).toContain('splitting large volume');

      const smallVolumeParams = {
        volume: 2_000,
        price: 47.80,
        activityType: 'EFFICIENT_LIGHTING',
        participantType: 'ACP',
      };
      const smallVolumeResult = validateESCTradingParameters(smallVolumeParams);
      expect(smallVolumeResult.recommendations[0]).toContain('higher transaction costs');
    });
  });
});

describe('Integration with Existing Config', () => {
  describe('NSW ESC Configuration Integration', () => {
    test('should integrate with existing PRICING_INDEX', () => {
      expect(NSW_ESC_CONFIG.MARKET_CONDITIONS.SPOT_PRICE).toBe(PRICING_INDEX.ESC_SPOT_REFERENCE);
      expect(NSW_ESC_CONFIG.MARKET_CONDITIONS.FORWARD_PRICE).toBe(PRICING_INDEX.ESC_FORWARD_REFERENCE);
      expect(NSW_ESC_CONFIG.MARKET_CONDITIONS.VOLATILITY_RANGE).toEqual(PRICING_INDEX.ESC_VOLATILITY_RANGE);
    });

    test('should have CER compliance framework integration', () => {
      expect(NSW_ESC_CONFIG.COMPLIANCE_FRAMEWORK.AUTHORITY).toBe('Clean Energy Regulator');
      expect(NSW_ESC_CONFIG.COMPLIANCE_FRAMEWORK.REGISTRY_SYSTEM).toBe('NSW ESC Registry');
      expect(NSW_ESC_CONFIG.COMPLIANCE_FRAMEWORK.REAL_TIME_VALIDATION).toBe(true);
    });

    test('should have Northmore Gordon context integration', () => {
      expect(NSW_ESC_CONFIG.FIRM_CONTEXT.MARKET_SHARE).toBe(0.12);
      expect(NSW_ESC_CONFIG.FIRM_CONTEXT.ANNUAL_VOLUME).toBe(24_000_000);
      expect(NSW_ESC_CONFIG.FIRM_CONTEXT.REGULATORY_STATUS).toBe('AFSL 246896');
    });

    test('should have demo enhancement metrics', () => {
      expect(NSW_ESC_CONFIG.DEMO_ENHANCEMENTS.AI_NEGOTIATION_ADVANTAGE).toBe(0.021);
      expect(NSW_ESC_CONFIG.DEMO_ENHANCEMENTS.COMPLIANCE_TIME_SAVINGS).toBe(0.40);
      expect(NSW_ESC_CONFIG.DEMO_ENHANCEMENTS.EXECUTION_IMPROVEMENT).toBe(0.15);
    });
  });
});

describe('Data Consistency', () => {
  test('all ESC scenarios should have consistent data structure', () => {
    Object.values(ESC_DEMO_SCENARIOS).forEach(scenario => {
      expect(scenario.id).toBeDefined();
      expect(scenario.name).toBeDefined();
      expect(scenario.audience).toMatch(/^(executive|technical|compliance)$/);
      expect(scenario.duration).toBeGreaterThan(0);
      expect(scenario.esc_details).toBeDefined();
      expect(scenario.negotiation_parameters).toBeDefined();
      expect(scenario.expected_outcomes).toBeDefined();
    });
  });

  test('all market participant percentages should be realistic', () => {
    const participants = NSW_ESC_MARKET_CONTEXT.PARTICIPANTS;
    Object.values(participants).forEach(participant => {
      expect(participant.market_share).toBeGreaterThan(0);
      expect(participant.market_share).toBeLessThanOrEqual(1);
      expect(participant.count).toBeGreaterThan(0);
    });
  });

  test('all ESC activity market shares should be realistic', () => {
    const activities = NSW_ESC_MARKET_CONTEXT.ESC_ACTIVITIES;
    const totalShare = Object.values(activities).reduce((sum, activity) => sum + activity.market_share, 0);
    expect(totalShare).toBeCloseTo(0.75, 1); // Approximately 75% of activities covered
  });
});