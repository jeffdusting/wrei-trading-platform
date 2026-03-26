/**
 * WREI Trading Platform - Dynamic Scenario Engine Tests
 *
 * Stage 2: Component 2 - Dynamic Scenario Generation Engine Tests
 * Comprehensive test suite for AI-powered scenario generation functionality
 *
 * Date: March 26, 2026
 */

import { DynamicScenarioEngine } from '@/lib/ai-scenario-generation/DynamicScenarioEngine';
import {
  ScenarioGenerationConfig,
  GeneratedScenario,
  MarketCondition,
  ParticipantProfile,
  GenerationEngineState,
  ScenarioValidation,
  GenerationEvent
} from '@/components/generation/types';
import { AudienceType } from '@/components/audience';

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            endPrice: 52.0,
            peakPrice: 54.0,
            troughPrice: 46.0,
            priceTrajectory: [
              { time: 0, price: 47.8 },
              { time: 15, price: 49.2 },
              { time: 30, price: 52.0 }
            ],
            totalVolume: 150000,
            volumeDistribution: [
              { time: 0, volume: 5000 },
              { time: 15, volume: 7500 },
              { time: 30, volume: 6000 }
            ],
            volatilityClusters: [
              { start: 5, end: 12, intensity: 0.8 }
            ],
            marketEvents: [
              {
                time: 10,
                type: 'major_trade',
                description: 'Large institutional trade executed',
                impact: 'medium'
              }
            ],
            title: 'NSW ESC Bull Market Trading Scenario',
            description: 'Interactive trading scenario demonstrating bull market dynamics',
            context: 'Favorable market conditions with strong ESC demand',
            objectives: ['Understanding bull market mechanics', 'Price trend analysis'],
            expectedOutcomes: ['Price appreciation', 'Increased trading volume'],
            keyLearnings: ['Bull market characteristics', 'Momentum trading strategies']
          })
        }]
      })
    }
  }))
}));

describe('DynamicScenarioEngine', () => {
  let engine: DynamicScenarioEngine;

  beforeEach(() => {
    engine = DynamicScenarioEngine.getInstance();
    // Clear any existing state
    engine.clearCache();
  });

  afterEach(() => {
    jest.clearAllMocks();
    engine.clearCache();
  });

  describe('Engine Initialization', () => {
    test('should create singleton instance', () => {
      const engine1 = DynamicScenarioEngine.getInstance();
      const engine2 = DynamicScenarioEngine.getInstance();
      expect(engine1).toBe(engine2);
    });

    test('should initialize with clean state', () => {
      const state = engine.getEngineState();
      expect(state.isActive).toBe(false);
      expect(state.currentGeneration).toBeNull();
      expect(state.queuedGenerations).toEqual([]);
      expect(state.performance.successRate).toBe(1.0);
    });

    test('should have empty event history initially', () => {
      const events = engine.getEventHistory();
      expect(events).toEqual([]);
    });
  });

  describe('Scenario Generation', () => {
    let mockConfig: ScenarioGenerationConfig;

    beforeEach(() => {
      mockConfig = {
        id: 'test-scenario-1',
        audience: 'executive' as AudienceType,
        duration: 30,
        complexity: 'moderate',
        objectives: ['Executive market overview', 'ROI demonstration'],

        marketConfig: {
          baseCondition: 'bull' as MarketCondition,
          volatilityRange: [0.1, 0.25],
          priceRange: [35.0, 65.0],
          volumeRange: [50000, 500000],
          trendStrength: 0.7,
          noiseLevel: 0.3,
          seasonalEffects: true,
          regulatoryImpacts: ['ESS Rule Updates']
        },

        participantCount: 8,
        participantMix: {
          institutional: 30,
          retail: 25,
          corporate: 25,
          government: 15,
          speculative: 5
        },

        generationMode: 'hybrid',
        realTimeDataSources: [],

        constraints: {
          minTradeSize: 100,
          maxTradeSize: 50000,
          allowableOutcomes: ['successful_trading', 'market_learning'],
          prohibitedScenarios: ['market_manipulation']
        },

        adaptationRules: [{
          trigger: 'low_engagement',
          condition: 'engagement < 0.6',
          action: 'increase_interaction',
          parameters: { interactivity: 1.2 }
        }]
      };
    });

    test('should generate complete scenario successfully', async () => {
      const scenario = await engine.generateScenario(mockConfig);

      expect(scenario).toMatchObject({
        id: mockConfig.id,
        type: expect.any(String),
        timestamp: expect.any(Date),
        config: mockConfig,
        metadata: {
          generationMethod: expect.any(String),
          confidence: expect.any(Number),
          realism: expect.any(Number),
          complexity: expect.any(Number),
          adaptability: expect.any(Number)
        },
        narrative: {
          title: expect.any(String),
          description: expect.any(String),
          context: expect.any(String),
          objectives: expect.any(Array),
          expectedOutcomes: expect.any(Array),
          keyLearnings: expect.any(Array)
        },
        marketConditions: expect.any(Object),
        participants: expect.any(Array),
        timeline: expect.any(Object),
        outcomes: {
          probabilistic: expect.any(Array),
          deterministic: expect.any(Array)
        },
        adaptations: expect.any(Array),
        validations: expect.any(Array)
      });

      expect(scenario.metadata.confidence).toBeGreaterThan(0);
      expect(scenario.metadata.confidence).toBeLessThanOrEqual(1);
      expect(scenario.participants).toHaveLength(8);
    });

    test('should generate different scenarios for different audiences', async () => {
      const executiveConfig = { ...mockConfig, audience: 'executive' as AudienceType };
      const technicalConfig = { ...mockConfig, id: 'test-scenario-2', audience: 'technical' as AudienceType };

      const executiveScenario = await engine.generateScenario(executiveConfig);
      const technicalScenario = await engine.generateScenario(technicalConfig);

      expect(executiveScenario.config.audience).toBe('executive');
      expect(technicalScenario.config.audience).toBe('technical');
      expect(executiveScenario.id).not.toBe(technicalScenario.id);
    });

    test('should respect market condition configuration', async () => {
      const bullConfig = { ...mockConfig, marketConfig: { ...mockConfig.marketConfig, baseCondition: 'bull' as MarketCondition } };
      const bearConfig = { ...mockConfig, id: 'test-scenario-bear', marketConfig: { ...mockConfig.marketConfig, baseCondition: 'bear' as MarketCondition } };

      const bullScenario = await engine.generateScenario(bullConfig);
      const bearScenario = await engine.generateScenario(bearConfig);

      expect(bullScenario.marketConditions.condition).toBe('bull');
      expect(bearScenario.marketConditions.condition).toBe('bear');
    });

    test('should generate realistic market conditions', async () => {
      const scenario = await engine.generateScenario(mockConfig);
      const market = scenario.marketConditions;

      // Price should be within NSW ESC historical range
      expect(market.priceMovement.startPrice).toBeGreaterThanOrEqual(35.0);
      expect(market.priceMovement.startPrice).toBeLessThanOrEqual(65.0);
      expect(market.priceMovement.endPrice).toBeGreaterThanOrEqual(35.0);
      expect(market.priceMovement.endPrice).toBeLessThanOrEqual(65.0);

      // Should have price trajectory
      expect(market.priceMovement.priceTrajectory).toBeDefined();
      expect(Array.isArray(market.priceMovement.priceTrajectory)).toBe(true);
      expect(market.priceMovement.priceTrajectory.length).toBeGreaterThan(0);

      // Volume should be reasonable
      expect(market.volumeProfile.totalVolume).toBeGreaterThan(0);
      expect(market.volumeProfile.averageTradeSize).toBeGreaterThan(0);

      // Should have market events
      expect(Array.isArray(market.marketEvents)).toBe(true);
    });

    test('should generate appropriate participant mix', async () => {
      const scenario = await engine.generateScenario(mockConfig);

      expect(scenario.participants).toHaveLength(8);

      // Check participant profiles
      const profiles = scenario.participants.map(p => p.profile);
      const profileCounts = profiles.reduce((acc, profile) => {
        acc[profile] = (acc[profile] || 0) + 1;
        return acc;
      }, {} as Record<ParticipantProfile, number>);

      // Should have multiple participant types
      expect(Object.keys(profileCounts).length).toBeGreaterThanOrEqual(2);

      // Each participant should have valid properties
      scenario.participants.forEach(participant => {
        expect(participant.id).toBeDefined();
        expect(participant.profile).toBeDefined();
        expect(participant.riskAppetite).toBeDefined();
        expect(participant.constraints).toBeDefined();
        expect(participant.decisionFactors).toBeDefined();
        expect(participant.behavioralBiases).toBeDefined();
      });
    });

    test('should generate scenario timeline with phases', async () => {
      const scenario = await engine.generateScenario(mockConfig);
      const timeline = scenario.timeline;

      expect(timeline.totalDuration).toBe(mockConfig.duration);
      expect(timeline.phases).toBeDefined();
      expect(Array.isArray(timeline.phases)).toBe(true);
      expect(timeline.phases.length).toBeGreaterThan(0);

      // Each phase should have required properties
      timeline.phases.forEach(phase => {
        expect(phase.name).toBeDefined();
        expect(phase.startTime).toBeGreaterThanOrEqual(0);
        expect(phase.duration).toBeGreaterThan(0);
        expect(phase.description).toBeDefined();
        expect(Array.isArray(phase.keyEvents)).toBe(true);
        expect(Array.isArray(phase.expectedActions)).toBe(true);
      });

      // Should have critical events
      expect(Array.isArray(timeline.criticalEvents)).toBe(true);

      // Should have decision points
      expect(Array.isArray(timeline.decisionPoints)).toBe(true);
    });

    test('should include validation results', async () => {
      const scenario = await engine.generateScenario(mockConfig);

      expect(scenario.validations).toBeDefined();
      expect(Array.isArray(scenario.validations)).toBe(true);
      expect(scenario.validations.length).toBeGreaterThan(0);

      const validation = scenario.validations[0];
      expect(validation.id).toBeDefined();
      expect(validation.timestamp).toBeInstanceOf(Date);
      expect(validation.validationType).toBeDefined();
      expect(validation.results).toBeDefined();
      expect(validation.results.overallScore).toBeGreaterThanOrEqual(0);
      expect(validation.results.overallScore).toBeLessThanOrEqual(1);
      expect(typeof validation.results.passed).toBe('boolean');
    });
  });

  describe('Market Conditions Generation', () => {
    test('should generate bull market conditions', async () => {
      const config = {
        ...createBasicConfig(),
        marketConfig: {
          baseCondition: 'bull' as MarketCondition,
          volatilityRange: [0.1, 0.25] as [number, number],
          priceRange: [35.0, 65.0] as [number, number],
          volumeRange: [50000, 500000] as [number, number],
          trendStrength: 0.7,
          noiseLevel: 0.3,
          seasonalEffects: true,
          regulatoryImpacts: ['ESS Updates']
        }
      };

      const scenario = await engine.generateScenario(config);
      expect(scenario.marketConditions.condition).toBe('bull');

      // Bull market should generally have upward price movement
      const { startPrice, endPrice } = scenario.marketConditions.priceMovement;
      // Allow for some variation but generally expect upward trend
      expect(endPrice).toBeGreaterThanOrEqual(startPrice * 0.95);
    });

    test('should generate different volatility for different conditions', async () => {
      const stableConfig = {
        ...createBasicConfig(),
        id: 'stable-test',
        marketConfig: {
          baseCondition: 'stable' as MarketCondition,
          volatilityRange: [0.05, 0.15] as [number, number],
          priceRange: [35.0, 65.0] as [number, number],
          volumeRange: [50000, 500000] as [number, number],
          trendStrength: 0.3,
          noiseLevel: 0.1,
          seasonalEffects: false,
          regulatoryImpacts: []
        }
      };

      const volatileConfig = {
        ...createBasicConfig(),
        id: 'volatile-test',
        marketConfig: {
          baseCondition: 'volatile' as MarketCondition,
          volatilityRange: [0.25, 0.5] as [number, number],
          priceRange: [35.0, 65.0] as [number, number],
          volumeRange: [50000, 500000] as [number, number],
          trendStrength: 0.5,
          noiseLevel: 0.4,
          seasonalEffects: true,
          regulatoryImpacts: ['Major regulatory changes']
        }
      };

      const stableScenario = await engine.generateScenario(stableConfig);
      const volatileScenario = await engine.generateScenario(volatileConfig);

      expect(stableScenario.marketConditions.volatilityMetrics.impliedVolatility)
        .toBeLessThan(volatileScenario.marketConditions.volatilityMetrics.impliedVolatility);
    });
  });

  describe('Participant Behavior Modeling', () => {
    test('should generate diverse participant profiles', async () => {
      const config = createBasicConfig();
      const scenario = await engine.generateScenario(config);

      const profiles = scenario.participants.map(p => p.profile);
      const uniqueProfiles = new Set(profiles);

      // Should have multiple different participant types
      expect(uniqueProfiles.size).toBeGreaterThanOrEqual(2);

      // Should include expected profile types
      expect(profiles).toContain('institutional');
    });

    test('should generate realistic behavioral biases', async () => {
      const config = createBasicConfig();
      const scenario = await engine.generateScenario(config);

      scenario.participants.forEach(participant => {
        const biases = participant.behavioralBiases;

        // All bias values should be between 0 and 1
        Object.values(biases).forEach(bias => {
          expect(bias).toBeGreaterThanOrEqual(0);
          expect(bias).toBeLessThanOrEqual(1);
        });

        // Should have all expected bias types
        expect(biases.anchoring).toBeDefined();
        expect(biases.herding).toBeDefined();
        expect(biases.overconfidence).toBeDefined();
        expect(biases.lossAversion).toBeDefined();
        expect(biases.recencyBias).toBeDefined();
      });
    });

    test('should generate appropriate constraints for different profiles', async () => {
      const config = createBasicConfig();
      const scenario = await engine.generateScenario(config);

      const institutional = scenario.participants.find(p => p.profile === 'institutional');
      const retail = scenario.participants.find(p => p.profile === 'retail');

      if (institutional && retail) {
        // Institutional should have larger position limits than retail
        expect(institutional.constraints.maxPositionSize)
          .toBeGreaterThan(retail.constraints.maxPositionSize);

        expect(institutional.constraints.maxDailyVolume)
          .toBeGreaterThan(retail.constraints.maxDailyVolume);
      }
    });
  });

  describe('Scenario Validation', () => {
    test('should validate price realism', async () => {
      const config = createBasicConfig();
      const scenario = await engine.generateScenario(config);

      expect(scenario.validations.length).toBeGreaterThan(0);

      const validation = scenario.validations[0];
      expect(validation.results.criteriaScores).toBeDefined();

      // Should have price realism criteria
      const priceRealism = validation.results.criteriaScores.find(
        c => c.name === 'Price Realism'
      );
      expect(priceRealism).toBeDefined();
    });

    test('should provide recommendations for failed validations', async () => {
      // Create a config that might fail validation
      const config = {
        ...createBasicConfig(),
        marketConfig: {
          baseCondition: 'crisis' as MarketCondition,
          volatilityRange: [0.8, 1.0] as [number, number],
          priceRange: [100.0, 200.0] as [number, number], // Unrealistic range
          volumeRange: [1000000, 2000000] as [number, number], // Very high volume
          trendStrength: 1.0,
          noiseLevel: 0.8,
          seasonalEffects: true,
          regulatoryImpacts: []
        }
      };

      const scenario = await engine.generateScenario(config);
      const validation = scenario.validations[0];

      // If validation fails, should have recommendations
      if (!validation.results.passed) {
        expect(validation.recommendations.length).toBeGreaterThan(0);
        validation.recommendations.forEach(rec => {
          expect(rec.type).toBeDefined();
          expect(rec.description).toBeDefined();
          expect(rec.priority).toBeDefined();
        });
      }
    });
  });

  describe('Monte Carlo Simulation', () => {
    test('should generate probabilistic outcomes', async () => {
      const config = createBasicConfig();
      const scenario = await engine.generateScenario(config);

      expect(scenario.outcomes.probabilistic).toBeDefined();
      expect(Array.isArray(scenario.outcomes.probabilistic)).toBe(true);
      expect(scenario.outcomes.probabilistic.length).toBeGreaterThan(0);

      scenario.outcomes.probabilistic.forEach(outcome => {
        expect(outcome.outcome).toBeDefined();
        expect(outcome.probability).toBeGreaterThanOrEqual(0);
        expect(outcome.probability).toBeLessThanOrEqual(1);
        expect(outcome.impact).toMatch(/positive|negative|neutral/);
        expect(outcome.description).toBeDefined();
      });
    });

    test('should generate deterministic outcomes', async () => {
      const config = createBasicConfig();
      const scenario = await engine.generateScenario(config);

      expect(scenario.outcomes.deterministic).toBeDefined();
      expect(Array.isArray(scenario.outcomes.deterministic)).toBe(true);
      expect(scenario.outcomes.deterministic.length).toBeGreaterThan(0);

      scenario.outcomes.deterministic.forEach(outcome => {
        expect(outcome.outcome).toBeDefined();
        expect(Array.isArray(outcome.conditions)).toBe(true);
        expect(outcome.description).toBeDefined();
      });
    });
  });

  describe('Engine State Management', () => {
    test('should track generation state correctly', async () => {
      const config = createBasicConfig();

      // Check initial state
      let state = engine.getEngineState();
      expect(state.isActive).toBe(false);
      expect(state.currentGeneration).toBeNull();

      // Start generation
      const generationPromise = engine.generateScenario(config);

      // Wait a bit for generation to start
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check active state (may not be active due to mock speed)
      state = engine.getEngineState();
      // Don't assert isActive as mock responses are instant

      // Wait for completion
      await generationPromise;

      // Check final state
      state = engine.getEngineState();
      expect(state.isActive).toBe(false);
      expect(state.currentGeneration).toBeNull();
    });

    test('should maintain performance metrics', async () => {
      const config1 = createBasicConfig();
      const config2 = { ...createBasicConfig(), id: 'test-scenario-2' };

      await engine.generateScenario(config1);
      await engine.generateScenario(config2);

      const state = engine.getEngineState();
      expect(state.performance).toBeDefined();
      expect(state.performance.averageGenerationTime).toBeGreaterThan(0);
      expect(state.performance.successRate).toBeGreaterThan(0);
      expect(state.performance.qualityScore).toBeGreaterThan(0);
    });

    test('should track event history', async () => {
      const config = createBasicConfig();
      await engine.generateScenario(config);

      const events = engine.getEventHistory();
      expect(events.length).toBeGreaterThan(0);

      // Should have generation start and complete events
      const eventTypes = events.map(e => e.type);
      expect(eventTypes).toContain('generation_started');
      expect(eventTypes).toContain('generation_completed');
    });
  });

  describe('Scenario Adaptation', () => {
    test('should create scenario adaptations', async () => {
      const config = createBasicConfig();
      const scenario = await engine.generateScenario(config);

      const adaptation = await engine.adaptScenario(
        scenario.id,
        { type: 'engagement_drop', value: 0.4 },
        { interactivity: 1.3, complexity: 0.8 }
      );

      expect(adaptation).toBeDefined();
      expect(adaptation.id).toBeDefined();
      expect(adaptation.timestamp).toBeInstanceOf(Date);
      expect(adaptation.trigger).toBeDefined();
      expect(adaptation.adaptation).toBeDefined();
      expect(adaptation.impact).toBeDefined();
      expect(adaptation.rollbackPlan).toBeDefined();
    });
  });

  describe('Caching', () => {
    test('should cache scenario components', async () => {
      const config = createBasicConfig();
      const scenario = await engine.generateScenario(config);

      const state = engine.getEngineState();

      // Should have cached market conditions
      expect(state.cache.marketConditions.size).toBeGreaterThan(0);

      // Should have cached participant models
      expect(state.cache.participantModels.size).toBeGreaterThan(0);

      // Should have cached scenario templates
      expect(state.cache.scenarioTemplates.size).toBeGreaterThan(0);
    });

    test('should clear cache when requested', async () => {
      const config = createBasicConfig();
      await engine.generateScenario(config);

      // Verify cache has items
      let state = engine.getEngineState();
      expect(state.cache.marketConditions.size).toBeGreaterThan(0);

      // Clear cache
      engine.clearCache();

      // Verify cache is empty
      state = engine.getEngineState();
      expect(state.cache.marketConditions.size).toBe(0);
      expect(state.cache.participantModels.size).toBe(0);
      expect(state.cache.scenarioTemplates.size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle generation errors gracefully', async () => {
      // Create invalid config
      const invalidConfig = {
        ...createBasicConfig(),
        participantCount: 0, // Invalid
        duration: -5 // Invalid
      };

      await expect(engine.generateScenario(invalidConfig))
        .rejects
        .toThrow();

      // Engine should return to inactive state after error
      const state = engine.getEngineState();
      expect(state.isActive).toBe(false);
    });
  });

  // Helper function to create basic valid configuration
  function createBasicConfig(): ScenarioGenerationConfig {
    return {
      id: `test-scenario-${Date.now()}`,
      audience: 'executive' as AudienceType,
      duration: 30,
      complexity: 'moderate',
      objectives: ['Market demonstration'],

      marketConfig: {
        baseCondition: 'stable' as MarketCondition,
        volatilityRange: [0.1, 0.25],
        priceRange: [35.0, 65.0],
        volumeRange: [50000, 500000],
        trendStrength: 0.5,
        noiseLevel: 0.3,
        seasonalEffects: true,
        regulatoryImpacts: []
      },

      participantCount: 6,
      participantMix: {
        institutional: 30,
        retail: 30,
        corporate: 20,
        government: 15,
        speculative: 5
      },

      generationMode: 'simulation',
      realTimeDataSources: [],

      constraints: {
        minTradeSize: 100,
        maxTradeSize: 10000,
        allowableOutcomes: ['successful_trading'],
        prohibitedScenarios: ['unrealistic_outcomes']
      },

      adaptationRules: []
    };
  }
});