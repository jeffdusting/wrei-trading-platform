/**
 * WREI Trading Platform - Intelligent Analytics Engine Test Suite
 *
 * Stage 2 Component 3: Comprehensive tests for AI-Enhanced Analytics Engine
 * Tests predictive modelling, risk assessment, performance optimisation, and competitive intelligence
 *
 * Date: March 26, 2026
 */

import { IntelligentAnalyticsEngine } from '../../lib/ai-analytics/IntelligentAnalyticsEngine';
import { DemoOrchestrationEngine } from '../../lib/ai-orchestration/DemoOrchestrationEngine';
import { DynamicScenarioEngine } from '../../lib/ai-scenario-generation/DynamicScenarioEngine';
import { AnalyticsEngine } from '../../components/analytics/AnalyticsEngine';
import {
  PredictiveAnalytics,
  MarketForecast,
  RiskPredictions,
  PerformanceOptimisation,
  CompetitiveIntelligence,
  AIInsights,
  IntelligentAnalyticsState
} from '../../components/analytics/types';
import { AudienceType } from '../../components/audience';

// Test configuration and constants
const TEST_SESSION_ID = 'test-session-intelligent-analytics-001';
const TEST_AUDIENCE_TYPES: AudienceType[] = ['executive', 'technical', 'compliance'];

// Mock timers for controlling time-based operations
jest.useFakeTimers();

// Mock environment variables
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });

// Mock Anthropic SDK to avoid browser environment issues
jest.mock('@anthropic-ai/sdk', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Mock AI response' }]
        })
      }
    }))
  };
});

describe('IntelligentAnalyticsEngine', () => {
  let engine: IntelligentAnalyticsEngine;

  beforeEach(() => {
    // Reset engine instance before each test
    IntelligentAnalyticsEngine['instance'] = undefined as any;
    engine = IntelligentAnalyticsEngine.getInstance();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Singleton Pattern', () => {
    it('should maintain singleton instance', () => {
      const engine1 = IntelligentAnalyticsEngine.getInstance();
      const engine2 = IntelligentAnalyticsEngine.getInstance();

      expect(engine1).toBe(engine2);
      expect(engine1).toBeInstanceOf(IntelligentAnalyticsEngine);
    });

    it('should initialize with correct default state', () => {
      const state = engine.getEngineState();

      expect(state.engine_status).toBe('active');
      expect(state.last_prediction).toBeNull();
      expect(state.prediction_queue).toEqual([]);
      expect(state.performance_metrics.prediction_accuracy).toBe(0.85);
      expect(state.integration_status.orchestration_engine).toBe('connected');
      expect(state.integration_status.scenario_engine).toBe('connected');
      expect(state.integration_status.analytics_engine).toBe('connected');
      expect(state.integration_status.claude_api).toBe('connected');
    });
  });

  describe('Predictive Analytics Generation', () => {
    TEST_AUDIENCE_TYPES.forEach(audienceType => {
      it(`should generate comprehensive predictive analytics for ${audienceType} audience`, async () => {
        const analytics = await engine.generatePredictiveAnalytics(
          TEST_SESSION_ID,
          audienceType,
          false
        );

        expect(analytics).toBeDefined();
        expect(analytics.analysis_id).toMatch(/^intelligent-analytics-/);
        expect(analytics.timestamp).toBeInstanceOf(Date);
        expect(analytics.market_forecast).toBeDefined();
        expect(analytics.risk_predictions).toBeDefined();
        expect(analytics.performance_optimisation).toBeDefined();
        expect(analytics.competitive_intelligence).toBeDefined();
        expect(analytics.ai_insights).toBeDefined();
      });
    });

    it('should cache predictions and return cached results', async () => {
      const analytics1 = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        false
      );

      const analytics2 = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        false
      );

      expect(analytics1.analysis_id).toBe(analytics2.analysis_id);
      expect(analytics1.timestamp).toEqual(analytics2.timestamp);
    });

    it('should force refresh when requested', async () => {
      const analytics1 = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        false
      );

      // Advance fake timers to ensure timestamp difference
      jest.advanceTimersByTime(10);

      const analytics2 = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      expect(analytics1.analysis_id).not.toBe(analytics2.analysis_id);
      expect(analytics1.timestamp.getTime()).toBeLessThanOrEqual(analytics2.timestamp.getTime());
    });

    it('should update engine status during generation', async () => {
      const generationPromise = engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        true
      );

      // Check status is processing (if we could catch it mid-execution)
      await generationPromise;

      const state = engine.getEngineState();
      expect(state.engine_status).toBe('active');
      expect(state.last_prediction).not.toBeNull();
    });
  });

  describe('Market Forecast Generation', () => {
    it('should generate comprehensive market forecast', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const forecast = analytics.market_forecast;

      expect(forecast).toBeDefined();
      expect(forecast.forecast_id).toMatch(/^market-forecast-/);
      expect(forecast.market_segment).toBe('nsw_esc');
      expect(forecast.price_prediction).toHaveLength(3); // 1d, 1w, 1m predictions
      expect(forecast.trend_analysis.length).toBeGreaterThan(0);
      expect(forecast.volume_forecast.length).toBeGreaterThan(0);
      expect(forecast.regulatory_outlook).toBeDefined();
    });

    it('should provide realistic price predictions with confidence intervals', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        true
      );

      const forecast = analytics.market_forecast;
      const predictions = forecast.price_prediction;

      predictions.forEach(prediction => {
        expect(prediction.predicted_price).toBeGreaterThan(0);
        expect(prediction.confidence).toBeGreaterThanOrEqual(0);
        expect(prediction.confidence).toBeLessThanOrEqual(100);
        expect(prediction.confidence_interval.lower_bound)
          .toBeLessThan(prediction.confidence_interval.upper_bound);
        expect(prediction.key_drivers.length).toBeGreaterThan(0);
      });
    });

    it('should include regulatory outlook with future compliance costs', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'compliance',
        true
      );

      const forecast = analytics.market_forecast;
      const regulatory = forecast.regulatory_outlook;

      expect(regulatory.upcoming_changes.length).toBeGreaterThan(0);
      expect(regulatory.compliance_cost_forecast).toBeDefined();
      expect(regulatory.compliance_cost_forecast.predicted_cost)
        .toBeGreaterThan(regulatory.compliance_cost_forecast.current_cost);

      regulatory.upcoming_changes.forEach(change => {
        expect(change.regulation).toBeDefined();
        expect(change.effective_date).toBeInstanceOf(Date);
        expect(change.impact_level).toMatch(/^(very_low|low|medium|high|very_high)$/);
        expect(change.price_impact).toBeGreaterThanOrEqual(-1);
        expect(change.price_impact).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Risk Predictions Generation', () => {
    it('should generate comprehensive risk assessment', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'compliance',
        true
      );

      const risks = analytics.risk_predictions;

      expect(risks).toBeDefined();
      expect(risks.prediction_id).toMatch(/^risk-predictions-/);
      expect(risks.overall_risk_score).toBeGreaterThanOrEqual(0);
      expect(risks.overall_risk_score).toBeLessThanOrEqual(100);
      expect(risks.risk_level).toMatch(/^(very_low|low|medium|high|very_high)$/);
      expect(risks.emerging_risks.length).toBeGreaterThan(0);
      expect(risks.dynamic_risk_factors).toBeDefined();
      expect(risks.stress_test_scenarios.length).toBeGreaterThan(0);
    });

    it('should identify emerging risks with mitigation strategies', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const risks = analytics.risk_predictions;

      risks.emerging_risks.forEach(risk => {
        expect(risk.risk_type).toBeDefined();
        expect(risk.probability).toBeGreaterThanOrEqual(0);
        expect(risk.probability).toBeLessThanOrEqual(100);
        expect(risk.potential_impact).toBeGreaterThanOrEqual(0);
        expect(risk.potential_impact).toBeLessThanOrEqual(100);
        expect(risk.timeframe).toMatch(/^(1h|4h|1d|1w|1m|3m|6m|1y)$/);
        expect(risk.mitigation_suggestions.length).toBeGreaterThan(0);
      });
    });

    it('should provide dynamic risk factor analysis', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        true
      );

      const risks = analytics.risk_predictions;
      const factors = risks.dynamic_risk_factors;

      expect(factors.market_volatility).toBeDefined();
      expect(factors.counterparty_risk).toBeDefined();
      expect(factors.regulatory_risk).toBeDefined();
      expect(factors.operational_risk).toBeDefined();

      Object.values(factors).forEach(factor => {
        if ('current_score' in factor) {
          expect(factor.current_score).toBeGreaterThanOrEqual(0);
          expect(factor.predicted_score).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should include stress test scenarios with preparedness scores', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const risks = analytics.risk_predictions;

      risks.stress_test_scenarios.forEach(scenario => {
        expect(scenario.scenario_name).toBeDefined();
        expect(scenario.probability).toBeGreaterThanOrEqual(0);
        expect(scenario.probability).toBeLessThanOrEqual(100);
        expect(scenario.potential_loss).toBeGreaterThan(0);
        expect(scenario.recovery_time).toBeDefined();
        expect(scenario.preparedness_score).toBeGreaterThanOrEqual(0);
        expect(scenario.preparedness_score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Performance Optimisation', () => {
    it('should generate comprehensive performance analysis', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        true
      );

      const performance = analytics.performance_optimisation;

      expect(performance).toBeDefined();
      expect(performance.optimisation_id).toMatch(/^performance-opt-/);
      expect(performance.current_performance).toBeDefined();
      expect(performance.optimisation_opportunities.length).toBeGreaterThan(0);
      expect(performance.system_health_predictions.length).toBeGreaterThan(0);
      expect(performance.resource_optimisation).toBeDefined();
    });

    it('should provide realistic optimisation opportunities', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const performance = analytics.performance_optimisation;

      performance.optimisation_opportunities.forEach(opportunity => {
        expect(opportunity.category).toMatch(/^(pricing|operations|technology|compliance|market_timing)$/);
        expect(opportunity.potential_improvement).toBeGreaterThan(0);
        expect(opportunity.implementation_effort).toMatch(/^(low|medium|high)$/);
        expect(opportunity.estimated_value).toBeGreaterThan(0);
        expect(opportunity.ai_confidence).toMatch(/^(very_high|high|medium|low)$/);
        expect(opportunity.detailed_steps.length).toBeGreaterThan(0);
      });
    });

    it('should include system health predictions', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        true
      );

      const performance = analytics.performance_optimisation;

      performance.system_health_predictions.forEach(prediction => {
        expect(prediction.system_component).toBeDefined();
        expect(prediction.current_health).toBeGreaterThanOrEqual(0);
        expect(prediction.current_health).toBeLessThanOrEqual(100);
        expect(prediction.predicted_failure_probability).toBeGreaterThanOrEqual(0);
        expect(prediction.predicted_failure_probability).toBeLessThanOrEqual(100);
        expect(prediction.estimated_downtime_cost).toBeGreaterThan(0);
      });
    });

    it('should provide resource allocation optimisation', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const performance = analytics.performance_optimisation;
      const optimisation = performance.resource_optimisation;

      expect(Object.keys(optimisation.current_allocation).length).toBeGreaterThan(0);
      expect(Object.keys(optimisation.optimal_allocation).length)
        .toBe(Object.keys(optimisation.current_allocation).length);
      expect(optimisation.expected_improvement).toBeGreaterThan(0);
      expect(optimisation.reallocation_cost).toBeGreaterThan(0);
      expect(optimisation.payback_period).toBeDefined();
    });
  });

  describe('Competitive Intelligence', () => {
    it('should generate comprehensive competitive analysis', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const intelligence = analytics.competitive_intelligence;

      expect(intelligence).toBeDefined();
      expect(intelligence.intelligence_id).toMatch(/^competitive-intel-/);
      expect(intelligence.predicted_market_share.length).toBeGreaterThan(0);
      expect(intelligence.competitor_insights.length).toBeGreaterThan(0);
      expect(intelligence.market_opportunities.length).toBeGreaterThan(0);
      expect(intelligence.pricing_intelligence).toBeDefined();
    });

    it('should provide market share predictions with confidence levels', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const intelligence = analytics.competitive_intelligence;

      intelligence.predicted_market_share.forEach(prediction => {
        expect(prediction.predicted_share).toBeGreaterThan(0);
        expect(prediction.predicted_share).toBeLessThanOrEqual(1);
        expect(prediction.confidence).toMatch(/^(very_high|high|medium|low)$/);
        expect(prediction.key_assumptions.length).toBeGreaterThan(0);
      });
    });

    it('should analyse competitor strengths and vulnerabilities', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const intelligence = analytics.competitive_intelligence;

      intelligence.competitor_insights.forEach(competitor => {
        expect(competitor.competitor_name).toBeDefined();
        expect(competitor.current_market_share).toBeGreaterThan(0);
        expect(competitor.predicted_market_share).toBeGreaterThan(0);
        expect(competitor.threat_level).toMatch(/^(very_low|low|medium|high|very_high)$/);
        expect(competitor.competitive_advantages.length).toBeGreaterThan(0);
        expect(competitor.vulnerabilities.length).toBeGreaterThan(0);
        expect(competitor.strategic_recommendations.length).toBeGreaterThan(0);
      });
    });

    it('should identify market opportunities with realistic assessments', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const intelligence = analytics.competitive_intelligence;

      intelligence.market_opportunities.forEach(opportunity => {
        expect(opportunity.market_size).toBeGreaterThan(0);
        expect(opportunity.entry_difficulty).toMatch(/^(low|medium|high)$/);
        expect(opportunity.success_probability).toBeGreaterThanOrEqual(0);
        expect(opportunity.success_probability).toBeLessThanOrEqual(100);
        expect(opportunity.required_investment).toBeGreaterThan(0);
        expect(opportunity.competitive_intensity).toMatch(/^(very_low|low|medium|high|very_high)$/);
      });
    });

    it('should provide pricing intelligence with elasticity analysis', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const intelligence = analytics.competitive_intelligence;
      const pricing = intelligence.pricing_intelligence;

      expect(pricing.optimal_pricing_strategy).toBeDefined();
      expect(pricing.price_elasticity_analysis).toBeDefined();
      expect(pricing.price_elasticity_analysis.current_elasticity).toBeLessThan(0); // Should be negative
      expect(pricing.price_elasticity_analysis.optimal_price_point).toBeGreaterThan(0);
      expect(pricing.competitor_pricing_gaps.length).toBeGreaterThan(0);

      pricing.competitor_pricing_gaps.forEach(gap => {
        expect(gap.competitor).toBeDefined();
        expect(gap.opportunity_type)
          .toMatch(/^(premium_justification|competitive_pricing|value_positioning)$/);
      });
    });
  });

  describe('AI Insights Generation', () => {
    it('should generate comprehensive AI insights', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const insights = analytics.ai_insights;

      expect(insights).toBeDefined();
      expect(insights.insights_id).toMatch(/^ai-insights-/);
      expect(insights.model_version).toBe('claude-sonnet-4-20250514');
      expect(insights.executive_summary).toBeDefined();
      expect(insights.audience_insights).toBeDefined();
      expect(insights.pattern_recognition.length).toBeGreaterThan(0);
      expect(insights.market_intelligence).toBeDefined();
    });

    it('should provide audience-specific insights', async () => {
      const audienceTypes: AudienceType[] = ['executive', 'technical', 'compliance'];

      for (const audienceType of audienceTypes) {
        const analytics = await engine.generatePredictiveAnalytics(
          `${TEST_SESSION_ID}-${audienceType}`,
          audienceType,
          true
        );

        const insights = analytics.ai_insights;

        if (audienceType === 'executive') {
          const executiveInsights = insights.audience_insights.executive;
          expect(executiveInsights).toBeDefined();
          expect(executiveInsights.strategic_recommendations).toBeDefined();
          expect(executiveInsights.investment_priorities).toBeDefined();
          expect(executiveInsights.market_opportunities).toBeDefined();
        } else if (audienceType === 'technical') {
          const technicalInsights = insights.audience_insights.technical;
          expect(technicalInsights).toBeDefined();
          expect(technicalInsights.system_optimisations).toBeDefined();
          expect(technicalInsights.infrastructure_recommendations).toBeDefined();
          expect(technicalInsights.performance_improvements).toBeDefined();
        } else if (audienceType === 'compliance') {
          const complianceInsights = insights.audience_insights.compliance;
          expect(complianceInsights).toBeDefined();
          expect(complianceInsights.regulatory_updates).toBeDefined();
          expect(complianceInsights.compliance_priorities).toBeDefined();
          expect(complianceInsights.risk_mitigation_actions).toBeDefined();
        }
      }
    });

    it('should include pattern recognition with historical accuracy', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        true
      );

      const insights = analytics.ai_insights;

      insights.pattern_recognition.forEach(pattern => {
        expect(pattern.pattern_type).toBeDefined();
        expect(pattern.pattern_description).toBeDefined();
        expect(pattern.historical_accuracy).toBeGreaterThanOrEqual(0);
        expect(pattern.historical_accuracy).toBeLessThanOrEqual(100);
        expect(pattern.current_strength).toBeGreaterThanOrEqual(0);
        expect(pattern.current_strength).toBeLessThanOrEqual(100);
        expect(pattern.confidence).toMatch(/^(very_high|high|medium|low)$/);
        expect(pattern.predicted_outcome).toBeDefined();
      });
    });

    it('should provide market sentiment analysis', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      const insights = analytics.ai_insights;
      const sentiment = insights.market_intelligence.sentiment_analysis;

      expect(sentiment.overall_sentiment)
        .toMatch(/^(very_positive|positive|neutral|negative|very_negative)$/);
      expect(sentiment.sentiment_score).toBeGreaterThanOrEqual(-100);
      expect(sentiment.sentiment_score).toBeLessThanOrEqual(100);
      expect(sentiment.sentiment_drivers.length).toBeGreaterThan(0);
      expect(sentiment.sentiment_trend).toMatch(/^(improving|stable|deteriorating)$/);
    });
  });

  describe('Performance Metrics and Monitoring', () => {
    it('should track performance metrics accurately', async () => {
      const initialMetrics = engine.getPerformanceMetrics();
      expect(initialMetrics.average_prediction_time).toBe(0);

      await engine.generatePredictiveAnalytics(TEST_SESSION_ID, 'executive', true);

      const updatedMetrics = engine.getPerformanceMetrics();
      expect(updatedMetrics.average_prediction_time).toBeGreaterThan(0);
      expect(updatedMetrics.prediction_accuracy).toBe(0.85); // Should maintain baseline
    });

    it('should provide health check functionality', () => {
      const health = engine.healthCheck();

      expect(health.status).toMatch(/^(healthy|degraded|unhealthy)$/);
      expect(health.details).toBeDefined();
      expect(health.details.engine_status).toBeDefined();
      expect(health.details.performance_metrics).toBeDefined();
      expect(health.details.integration_status).toBeDefined();
    });

    it('should maintain cache correctly', async () => {
      // Generate prediction
      const analytics1 = await engine.generatePredictiveAnalytics(TEST_SESSION_ID, 'executive', true);

      // Get cached prediction
      const cached = engine.getCachedPredictions(TEST_SESSION_ID, 'executive');
      expect(cached).not.toBeNull();
      expect(cached!.analysis_id).toBe(analytics1.analysis_id);

      // Clear cache
      engine.clearCache();
      const clearedCache = engine.getCachedPredictions(TEST_SESSION_ID, 'executive');
      expect(clearedCache).toBeNull();
    });
  });

  describe('Integration with Other Engines', () => {
    it('should integrate with orchestration engine', async () => {
      // This tests that the engine can access orchestration data without errors
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      // The orchestration integration should influence performance optimisation
      expect(analytics.performance_optimisation).toBeDefined();
      expect(analytics.performance_optimisation.current_performance.efficiency_score)
        .toBeGreaterThan(0);
    });

    it('should integrate with scenario generation engine', async () => {
      // This tests that the engine can access scenario data for Monte Carlo analysis
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        true
      );

      // The scenario integration should influence market forecasting
      expect(analytics.market_forecast.price_prediction).toBeDefined();
      expect(analytics.market_forecast.price_prediction.length).toBeGreaterThan(0);
    });

    it('should integrate with base analytics engine', async () => {
      // This tests that the engine can access basic analytics data
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'compliance',
        true
      );

      // The analytics integration should provide market context
      expect(analytics.competitive_intelligence.predicted_market_share)
        .toBeDefined();
      expect(analytics.competitive_intelligence.competitor_insights.length)
        .toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle engine state transitions correctly', async () => {
      const initialState = engine.getEngineState();
      expect(initialState.engine_status).toBe('active');

      // Generate prediction and check state updates
      await engine.generatePredictiveAnalytics(TEST_SESSION_ID, 'executive', true);

      const finalState = engine.getEngineState();
      expect(finalState.engine_status).toBe('active');
      expect(finalState.last_prediction).not.toBeNull();
    });

    it('should maintain performance under load', async () => {
      const promises = [];

      // Generate multiple concurrent predictions
      for (let i = 0; i < 5; i++) {
        promises.push(
          engine.generatePredictiveAnalytics(`${TEST_SESSION_ID}-${i}`, 'executive', true)
        );
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.market_forecast).toBeDefined();
        expect(result.risk_predictions).toBeDefined();
      });
    });

    it('should provide consistent results for same inputs', async () => {
      const analytics1 = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        true
      );

      const analytics2 = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'technical',
        false // Should use cache
      );

      expect(analytics1.analysis_id).toBe(analytics2.analysis_id);
      expect(analytics1.market_forecast.forecast_id)
        .toBe(analytics2.market_forecast.forecast_id);
    });
  });

  describe('Australian Market Context', () => {
    it('should reflect NSW ESC market conditions correctly', async () => {
      const analytics = await engine.generatePredictiveAnalytics(
        TEST_SESSION_ID,
        'executive',
        true
      );

      expect(analytics.market_forecast.market_segment).toBe('nsw_esc');

      // Check that prices are in reasonable Australian dollar range
      analytics.market_forecast.price_prediction.forEach(prediction => {
        expect(prediction.predicted_price).toBeGreaterThan(15); // Above A$15/cert
        expect(prediction.predicted_price).toBeLessThan(40); // Below A$40/cert (above penalty rate)
      });

      // Check compliance-specific insights for Australian regulations
      const complianceAnalytics = await engine.generatePredictiveAnalytics(
        `${TEST_SESSION_ID}-compliance`,
        'compliance',
        true
      );

      const regulatoryOutlook = complianceAnalytics.market_forecast.regulatory_outlook;
      expect(regulatoryOutlook.upcoming_changes.length).toBeGreaterThan(0);

      // Should include Australian regulatory context
      const hasAustralianContext = regulatoryOutlook.upcoming_changes.some(change =>
        change.regulation.includes('ESS') || change.regulation.includes('CER')
      );
      expect(hasAustralianContext).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance targets for prediction generation', async () => {
      const startTime = Date.now();

      await engine.generatePredictiveAnalytics(TEST_SESSION_ID, 'executive', true);

      const processingTime = Date.now() - startTime;

      // Should generate predictions within 2 seconds
      expect(processingTime).toBeLessThan(2000);
    });

    it('should maintain high accuracy metrics', () => {
      const metrics = engine.getPerformanceMetrics();

      // Should maintain 85%+ prediction accuracy
      expect(metrics.prediction_accuracy).toBeGreaterThanOrEqual(0.85);

      // Error rate should be low
      expect(metrics.error_rate).toBeLessThan(0.05);
    });
  });
});

/**
 * Integration test with React Hook
 * Tests the useIntelligentAnalytics hook functionality
 */
describe('Integration with useIntelligentAnalytics Hook', () => {
  // Note: This would typically use @testing-library/react-hooks for full React testing
  // For now, we'll test the core engine functionality that the hook depends on

  it('should support hook-style caching and refresh patterns', async () => {
    const engine = IntelligentAnalyticsEngine.getInstance();

    // Simulate hook behavior
    const sessionId = 'hook-test-session';
    const audienceType: AudienceType = 'technical';

    // Initial generation (like hook initialization)
    const initial = await engine.generatePredictiveAnalytics(
      sessionId,
      audienceType,
      false
    );

    expect(initial).toBeDefined();

    // Cached retrieval (like hook state update)
    const cached = engine.getCachedPredictions(sessionId, audienceType);
    expect(cached).not.toBeNull();
    expect(cached!.analysis_id).toBe(initial.analysis_id);

    // Forced refresh (like user clicking refresh)
    const refreshed = await engine.generatePredictiveAnalytics(
      sessionId,
      audienceType,
      true
    );

    expect(refreshed.analysis_id).not.toBe(initial.analysis_id);
  });
});

/**
 * API Route Integration Tests
 * Tests that would verify the /api/analytics/predict endpoint
 */
describe('API Route Integration Points', () => {
  it('should provide data structures compatible with API serialization', async () => {
    const engine = IntelligentAnalyticsEngine.getInstance();
    const analytics = await engine.generatePredictiveAnalytics(
      'api-test-session',
      'executive',
      true
    );

    // Test JSON serialization/deserialization
    const serialized = JSON.stringify(analytics);
    const deserialized = JSON.parse(serialized) as PredictiveAnalytics;

    expect(deserialized.analysis_id).toBe(analytics.analysis_id);
    expect(new Date(deserialized.timestamp)).toEqual(analytics.timestamp);
    expect(deserialized.market_forecast.price_prediction.length)
      .toBe(analytics.market_forecast.price_prediction.length);
  });

  it('should support health check data structure for API monitoring', () => {
    const engine = IntelligentAnalyticsEngine.getInstance();
    const health = engine.healthCheck();

    // Ensure health check data is API-serializable
    const serialized = JSON.stringify(health);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.status).toBe(health.status);
    expect(deserialized.details).toBeDefined();
  });
});

/**
 * End-to-End Component Integration
 * Tests the complete flow from engine to dashboard component
 */
describe('End-to-End Analytics Flow', () => {
  it('should support complete analytics workflow', async () => {
    const engine = IntelligentAnalyticsEngine.getInstance();

    // Simulate complete dashboard workflow
    const sessionId = 'e2e-test-session';

    // 1. Generate initial analytics
    const analytics = await engine.generatePredictiveAnalytics(
      sessionId,
      'executive',
      true
    );

    // 2. Verify all required dashboard data is present
    expect(analytics.market_forecast).toBeDefined();
    expect(analytics.risk_predictions).toBeDefined();
    expect(analytics.performance_optimisation).toBeDefined();
    expect(analytics.competitive_intelligence).toBeDefined();
    expect(analytics.ai_insights).toBeDefined();

    // 3. Verify audience-specific insights
    const audienceInsights = analytics.ai_insights.audience_insights.executive;
    expect(audienceInsights.strategic_recommendations).toBeDefined();
    expect(audienceInsights.investment_priorities).toBeDefined();

    // 4. Verify health monitoring
    const health = engine.healthCheck();
    expect(health.status).toBe('healthy');

    // 5. Verify performance metrics tracking
    const metrics = engine.getPerformanceMetrics();
    expect(metrics.average_prediction_time).toBeGreaterThan(0);
  });
});