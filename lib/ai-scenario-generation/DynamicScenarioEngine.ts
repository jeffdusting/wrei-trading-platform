/**
 * WREI Trading Platform - Dynamic Scenario Generation Engine
 *
 * Stage 2: Component 2 - Core Dynamic Scenario Generation Engine
 * AI-powered generation of realistic trading scenarios with market simulation
 *
 * Date: March 26, 2026
 */

import {
  GeneratedScenario,
  ScenarioGenerationConfig,
  GeneratedMarketCondition,
  ParticipantBehaviorModel,
  ParticipantDecision,
  RealTimeMarketData,
  MarketDataSource,
  GenerationEngineState,
  GenerationEvent,
  GenerationEventType,
  ScenarioValidation,
  MonteCarloResults,
  MarketCondition,
  ParticipantProfile,
  RiskAppetite,
  ScenarioTimeline,
  ScenarioAdaptation
} from '../../components/generation/types';

import { AudienceType } from '../../components/audience';
import { ScenarioType } from '../../components/scenarios/types';
// Removed direct Anthropic SDK import - using API routes instead

// NSW ESC Market Constants for Scenario Generation
const NSW_ESC_GENERATION_CONTEXT = {
  MARKET_SIZE: 200_000_000, // A$200M annual market
  CURRENT_SPOT_PRICE: 47.80, // A$/tonne current AEMO pricing
  HISTORICAL_PRICE_RANGE: [35.0, 65.0], // [min, max] historical range
  TYPICAL_VOLATILITY: 0.18, // 18% annualized volatility
  AVERAGE_TRADE_SIZE: 1000, // tonnes
  MAJOR_PARTICIPANTS: ['Energy Retailers', 'Large Energy Users', 'ACPs', 'Traders'],
  COMPLIANCE_DEADLINES: ['Mar 31', 'Dec 31'], // ESS compliance dates
  REGULATION_UPDATES: ['ESS Rule Changes', 'CER Updates', 'AFSL Changes']
} as const;

export class DynamicScenarioEngine {
  private static instance: DynamicScenarioEngine;
  private engineState: GenerationEngineState;
  private eventHistory: GenerationEvent[] = [];
  private marketDataCache: Map<string, RealTimeMarketData> = new Map();

  private constructor() {
    // Private constructor for singleton pattern

    this.engineState = {
      isActive: false,
      currentGeneration: null,
      queuedGenerations: [],
      performance: {
        averageGenerationTime: 0,
        successRate: 1.0,
        qualityScore: 0.85,
        adaptationRate: 0.2
      },
      cache: {
        marketConditions: new Map(),
        participantModels: new Map(),
        scenarioTemplates: new Map(),
        validationResults: new Map()
      },
      dataSources: {
        active: [],
        inactive: [],
        errors: []
      }
    };
  }

  public static getInstance(): DynamicScenarioEngine {
    if (!DynamicScenarioEngine.instance) {
      DynamicScenarioEngine.instance = new DynamicScenarioEngine();
    }
    return DynamicScenarioEngine.instance;
  }

  /**
   * Validate scenario generation configuration
   */
  private validateGenerationConfig(config: ScenarioGenerationConfig): void {
    // Validate duration
    if (!config.duration || config.duration <= 0) {
      throw new Error(`Invalid duration: ${config.duration}. Duration must be positive.`);
    }

    // Validate participant count
    if (!config.participantCount || config.participantCount <= 0) {
      throw new Error(`Invalid participant count: ${config.participantCount}. Must be greater than 0.`);
    }

    // Validate participant mix
    if (!config.participantMix || Object.keys(config.participantMix).length === 0) {
      throw new Error('Participant mix cannot be empty.');
    }

    // Validate participant mix percentages
    const totalPercentage = Object.values(config.participantMix).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalPercentage - 100) > 1) { // Allow 1% tolerance for rounding
      throw new Error(`Participant mix percentages must sum to 100, got ${totalPercentage}.`);
    }

    // Validate market config
    if (!config.marketConfig) {
      throw new Error('Market configuration is required.');
    }

    // Validate price range
    if (config.marketConfig.priceRange && config.marketConfig.priceRange.length === 2) {
      const [min, max] = config.marketConfig.priceRange;
      if (min >= max) {
        throw new Error(`Invalid price range: [${min}, ${max}]. Min must be less than max.`);
      }
      if (min <= 0) {
        throw new Error(`Invalid price range: [${min}, ${max}]. Prices must be positive.`);
      }
    }

    // Validate volume range
    if (config.marketConfig.volumeRange && config.marketConfig.volumeRange.length === 2) {
      const [min, max] = config.marketConfig.volumeRange;
      if (min >= max || min < 0) {
        throw new Error(`Invalid volume range: [${min}, ${max}]. Min must be less than max and non-negative.`);
      }
    }
  }

  /**
   * Generate a complete trading scenario based on configuration
   */
  public async generateScenario(config: ScenarioGenerationConfig): Promise<GeneratedScenario> {
    // Validate configuration
    this.validateGenerationConfig(config);

    const startTime = Date.now();
    this.engineState.isActive = true;
    this.engineState.currentGeneration = config.id;

    await this.emitEvent('generation_started', { config });

    try {
      // Step 1: Generate market conditions
      const marketConditions = await this.generateMarketConditions(config);
      await this.emitEvent('market_condition_generated', { marketConditions });

      // Step 2: Model participant behaviors
      const participants = await this.generateParticipantModels(config);
      await this.emitEvent('participants_modeled', { participantCount: participants.length });

      // Step 3: Create scenario timeline
      const timeline = await this.generateScenarioTimeline(config, marketConditions, participants);

      // Step 4: Generate narrative using AI
      const narrative = await this.generateScenarioNarrative(config, marketConditions, participants);

      // Step 5: Calculate outcome probabilities
      const outcomes = await this.calculateOutcomeProbabilities(config, marketConditions, participants);

      // Step 6: Create the complete scenario
      const scenario: GeneratedScenario = {
        id: config.id,
        type: this.mapConfigToScenarioType(config),
        timestamp: new Date(),
        config,
        metadata: {
          generationMethod: config.generationMode === 'realtime' ? 'ai' : 'simulation',
          confidence: this.calculateGenerationConfidence(marketConditions, participants),
          realism: this.assessScenarioRealism(marketConditions, participants),
          complexity: this.calculateScenarioComplexity(config),
          adaptability: this.calculateAdaptability(config)
        },
        narrative,
        marketConditions,
        participants,
        timeline,
        outcomes,
        adaptations: [],
        validations: []
      };

      // Step 7: Validate scenario
      const validation = await this.validateScenario(scenario);
      scenario.validations.push(validation);

      await this.emitEvent('scenario_validated', { validation });

      // Step 8: Cache results and update performance
      this.cacheScenarioComponents(scenario);
      this.updatePerformanceMetrics(startTime, true);

      await this.emitEvent('generation_completed', { scenarioId: scenario.id, duration: Date.now() - startTime });

      this.engineState.isActive = false;
      this.engineState.currentGeneration = null;

      return scenario;

    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      await this.emitEvent('generation_failed', { error: error instanceof Error ? error.message : 'Unknown error' });

      this.engineState.isActive = false;
      this.engineState.currentGeneration = null;

      throw error;
    }
  }

  /**
   * Generate realistic market conditions using market data and AI
   */
  private async generateMarketConditions(config: ScenarioGenerationConfig): Promise<GeneratedMarketCondition> {
    const baseCondition = config.marketConfig.baseCondition;
    const currentMarketData = await this.getCurrentMarketData();

    // Use AI API to generate realistic market trajectory
    let aiResponse: any = {};
    try {
      const apiResponse = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'generate_market_conditions',
          audience: 'technical', // Default for scenario generation
          config: {
            ...config,
            marketCondition: baseCondition
          },
          marketData: currentMarketData
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status}`);
      }

      const apiData = await apiResponse.json();
      aiResponse = apiData.data || {};
    } catch (error) {
      console.warn('[DynamicScenarioEngine] API call failed, using fallback generation:', error);
      // Use fallback generation when API fails
      aiResponse = {};
    }

    const condition: GeneratedMarketCondition = {
      id: `market-${config.id}-${Date.now()}`,
      timestamp: new Date(),
      condition: baseCondition,
      duration: config.duration,

      priceMovement: {
        startPrice: currentMarketData?.escSpotPrice || NSW_ESC_GENERATION_CONTEXT.CURRENT_SPOT_PRICE,
        endPrice: aiResponse.endPrice || this.calculateEndPrice(baseCondition),
        peakPrice: aiResponse.peakPrice || this.calculatePeakPrice(baseCondition),
        troughPrice: aiResponse.troughPrice || this.calculateTroughPrice(baseCondition),
        priceTrajectory: aiResponse.priceTrajectory || this.generatePriceTrajectory(baseCondition, config.duration)
      },

      volumeProfile: {
        totalVolume: aiResponse.totalVolume || this.calculateTotalVolume(config),
        volumeDistribution: aiResponse.volumeDistribution || this.generateVolumeDistribution(config.duration),
        largeTradesCount: aiResponse.largeTradesCount || Math.floor(config.duration / 10),
        averageTradeSize: NSW_ESC_GENERATION_CONTEXT.AVERAGE_TRADE_SIZE
      },

      volatilityMetrics: {
        historicalVolatility: NSW_ESC_GENERATION_CONTEXT.TYPICAL_VOLATILITY,
        impliedVolatility: aiResponse.impliedVolatility || this.calculateImpliedVolatility(baseCondition),
        volatilityClusters: aiResponse.volatilityClusters || this.generateVolatilityClusters(config.duration)
      },

      marketEvents: aiResponse.marketEvents || this.generateMarketEvents(baseCondition, config.duration)
    };

    // Cache the generated condition
    this.engineState.cache.marketConditions.set(condition.id, condition);

    return condition;
  }

  /**
   * Generate participant behavior models
   */
  private async generateParticipantModels(config: ScenarioGenerationConfig): Promise<ParticipantBehaviorModel[]> {
    const participants: ParticipantBehaviorModel[] = [];

    // Calculate exact participant counts to match target
    const profiles = Object.keys(config.participantMix) as ParticipantProfile[];
    const participantCounts: Record<ParticipantProfile, number> = {} as Record<ParticipantProfile, number>;

    // First pass: allocate based on percentages
    let totalAllocated = 0;
    for (const profile of profiles) {
      const percentage = config.participantMix[profile] || 0;
      const count = Math.round((config.participantCount * percentage) / 100);
      participantCounts[profile] = count;
      totalAllocated += count;
    }

    // Adjust if total doesn't match target (distribute remainder)
    let difference = config.participantCount - totalAllocated;
    const sortedProfiles = profiles.sort((a, b) =>
      (config.participantMix[b] || 0) - (config.participantMix[a] || 0)
    );

    // Add/subtract participants starting from highest percentage profiles
    for (const profile of sortedProfiles) {
      if (difference === 0) break;

      if (difference > 0) {
        participantCounts[profile]++;
        difference--;
      } else if (difference < 0 && participantCounts[profile] > 0) {
        participantCounts[profile]--;
        difference++;
      }
    }

    // Generate participants based on calculated counts
    for (const [profile, count] of Object.entries(participantCounts)) {
      for (let i = 0; i < count; i++) {
        const participant = await this.createParticipantModel(
          profile as ParticipantProfile,
          config,
          i
        );
        participants.push(participant);
      }
    }

    return participants;
  }

  /**
   * Create individual participant behavior model
   */
  private async createParticipantModel(
    profile: ParticipantProfile,
    config: ScenarioGenerationConfig,
    index: number
  ): Promise<ParticipantBehaviorModel> {
    const participant: ParticipantBehaviorModel = {
      id: `${profile}-${index}-${config.id}`,
      profile,
      riskAppetite: this.assignRiskAppetite(profile),
      tradingStrategy: this.assignTradingStrategy(profile, config.audience),

      decisionFactors: this.generateDecisionFactors(profile),
      behavioralBiases: this.generateBehavioralBiases(profile),
      constraints: this.generateParticipantConstraints(profile, config)
    };

    // Cache the participant model
    this.engineState.cache.participantModels.set(participant.id, participant);

    return participant;
  }

  /**
   * Generate scenario timeline with key events and decision points
   */
  private async generateScenarioTimeline(
    config: ScenarioGenerationConfig,
    marketConditions: GeneratedMarketCondition,
    participants: ParticipantBehaviorModel[]
  ): Promise<ScenarioTimeline> {
    const phases = this.generateTimelinePhases(config);
    const criticalEvents = this.generateCriticalEvents(config, marketConditions);
    const decisionPoints = this.generateDecisionPoints(config, participants);

    return {
      totalDuration: config.duration,
      phases,
      criticalEvents,
      decisionPoints
    };
  }

  /**
   * Generate scenario narrative using AI
   */
  private async generateScenarioNarrative(
    config: ScenarioGenerationConfig,
    marketConditions: GeneratedMarketCondition,
    participants: ParticipantBehaviorModel[]
  ): Promise<GeneratedScenario['narrative']> {
    const prompt = this.buildNarrativePrompt(config, marketConditions, participants);

    let aiResponse: any = {};
    try {
      const apiResponse = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'generate_narrative',
          audience: 'technical',
          config: {
            ...config,
            marketConditions,
            participants
          }
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`Narrative API request failed: ${apiResponse.status}`);
      }

      const apiData = await apiResponse.json();
      aiResponse = apiData.data || {};
    } catch (error) {
      console.warn('[DynamicScenarioEngine] Narrative API call failed, using fallback generation:', error);
      // Use fallback generation when API fails
      aiResponse = {};
    }

    return {
      title: aiResponse.title || this.generateDefaultTitle(config),
      description: aiResponse.description || this.generateDefaultDescription(config),
      context: aiResponse.context || this.generateDefaultContext(config, marketConditions),
      objectives: aiResponse.objectives || config.objectives,
      expectedOutcomes: aiResponse.expectedOutcomes || this.generateDefaultOutcomes(config),
      keyLearnings: aiResponse.keyLearnings || this.generateDefaultLearnings(config)
    };
  }

  /**
   * Calculate outcome probabilities using Monte Carlo simulation
   */
  private async calculateOutcomeProbabilities(
    config: ScenarioGenerationConfig,
    marketConditions: GeneratedMarketCondition,
    participants: ParticipantBehaviorModel[]
  ): Promise<GeneratedScenario['outcomes']> {
    const monteCarloResults = await this.runMonteCarloSimulation(
      config,
      marketConditions,
      participants,
      1000 // simulation runs
    );

    const probabilistic = this.extractProbabilisticOutcomes(monteCarloResults);
    const deterministic = this.generateDeterministicOutcomes(config, marketConditions);

    return { probabilistic, deterministic };
  }

  /**
   * Run Monte Carlo simulation for outcome probabilities
   */
  private async runMonteCarloSimulation(
    config: ScenarioGenerationConfig,
    marketConditions: GeneratedMarketCondition,
    participants: ParticipantBehaviorModel[],
    runs: number
  ): Promise<MonteCarloResults> {
    const results: MonteCarloResults = {
      simulationId: `monte-carlo-${config.id}`,
      timestamp: new Date(),
      runs,
      priceOutcomes: {
        mean: 0,
        median: 0,
        stdDev: 0,
        percentiles: [],
        distribution: []
      },
      volumeOutcomes: {
        totalVolume: { mean: 0, stdDev: 0, distribution: [] },
        largestTrade: { mean: 0, max: 0, probability: 0 },
        participantVolumes: []
      },
      scenarioOutcomes: [],
      riskMetrics: {
        valueAtRisk: [],
        expectedShortfall: 0,
        maxDrawdown: 0,
        sharpeRatio: 0
      }
    };

    const priceOutcomes: number[] = [];
    const volumeOutcomes: number[] = [];

    // Run simulations
    for (let i = 0; i < runs; i++) {
      const outcome = this.simulateSingleRun(config, marketConditions, participants);
      priceOutcomes.push(outcome.finalPrice);
      volumeOutcomes.push(outcome.totalVolume);
    }

    // Calculate statistics
    results.priceOutcomes.mean = priceOutcomes.reduce((a, b) => a + b, 0) / runs;
    results.priceOutcomes.median = this.calculateMedian(priceOutcomes);
    results.priceOutcomes.stdDev = this.calculateStandardDeviation(priceOutcomes, results.priceOutcomes.mean);

    results.volumeOutcomes.totalVolume.mean = volumeOutcomes.reduce((a, b) => a + b, 0) / runs;
    results.volumeOutcomes.totalVolume.stdDev = this.calculateStandardDeviation(volumeOutcomes, results.volumeOutcomes.totalVolume.mean);

    // Generate scenario outcomes based on simulation results
    results.scenarioOutcomes = this.generateScenarioOutcomes(priceOutcomes, volumeOutcomes, config);

    return results;
  }

  /**
   * Simulate a single Monte Carlo run
   */
  private simulateSingleRun(
    config: ScenarioGenerationConfig,
    marketConditions: GeneratedMarketCondition,
    participants: ParticipantBehaviorModel[]
  ): { finalPrice: number; totalVolume: number } {
    let currentPrice = marketConditions.priceMovement.startPrice;
    let totalVolume = 0;

    // Simple simulation - in production this would be more sophisticated
    const priceNoise = (Math.random() - 0.5) * 2; // -1 to 1
    const demandSupplyImbalance = this.calculateDemandSupplyImbalance(participants);

    const finalPrice = Math.max(
      NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[0],
      Math.min(
        NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[1],
        currentPrice * (1 + (priceNoise * 0.1) + (demandSupplyImbalance * 0.05))
      )
    );

    // Calculate total volume based on participant behavior
    totalVolume = participants.reduce((total, participant) => {
      const participantVolume = this.simulateParticipantVolume(participant, currentPrice, finalPrice);
      return total + participantVolume;
    }, 0);

    return { finalPrice, totalVolume };
  }

  /**
   * Validate generated scenario for realism and compliance
   */
  private async validateScenario(scenario: GeneratedScenario): Promise<ScenarioValidation> {
    const validation: ScenarioValidation = {
      id: `validation-${scenario.id}`,
      timestamp: new Date(),
      validationType: 'realism',

      criteria: [
        { name: 'Price Realism', description: 'Prices within historical ranges', weight: 0.3, threshold: 0.8 },
        { name: 'Volume Realism', description: 'Volumes consistent with market size', weight: 0.2, threshold: 0.8 },
        { name: 'Participant Behavior', description: 'Realistic participant actions', weight: 0.25, threshold: 0.75 },
        { name: 'Market Consistency', description: 'Consistent with NSW ESC market', weight: 0.25, threshold: 0.85 }
      ],

      results: {
        overallScore: 0,
        passed: false,
        criteriaScores: []
      },

      recommendations: []
    };

    // Validate each criterion
    for (const criterion of validation.criteria) {
      const score = await this.validateCriterion(scenario, criterion);
      validation.results.criteriaScores.push({
        name: criterion.name,
        score,
        passed: score >= criterion.threshold,
        feedback: this.generateValidationFeedback(criterion.name as 'Price Realism' | 'Volume Realism' | 'Participant Behavior' | 'Market Consistency', score)
      });
    }

    // Calculate overall score
    validation.results.overallScore = validation.results.criteriaScores.reduce((total, result, index) => {
      return total + (result.score * validation.criteria[index].weight);
    }, 0);

    validation.results.passed = validation.results.overallScore >= 0.8;

    // Generate recommendations if needed
    if (!validation.results.passed) {
      validation.recommendations = this.generateValidationRecommendations(validation);
    }

    // Cache validation results
    this.engineState.cache.validationResults.set(validation.id, validation);

    return validation;
  }

  // Helper methods for market condition generation
  private buildMarketConditionPrompt(config: ScenarioGenerationConfig, marketData?: RealTimeMarketData): string {
    return `Generate realistic NSW ESC market conditions for a ${config.audience} audience demonstration.

Market Context:
- Current ESC spot price: ${marketData?.escSpotPrice || NSW_ESC_GENERATION_CONTEXT.CURRENT_SPOT_PRICE} A$/tonne
- Market condition: ${config.marketConfig.baseCondition}
- Duration: ${config.duration} minutes
- Complexity: ${config.complexity}

Generate market conditions including:
1. Price trajectory (start, peak, trough, end prices)
2. Volume profile and distribution
3. Key market events
4. Volatility clusters

Ensure realism for NSW ESC market characteristics. Respond in JSON format.`;
  }

  private buildNarrativePrompt(
    config: ScenarioGenerationConfig,
    marketConditions: GeneratedMarketCondition,
    participants: ParticipantBehaviorModel[]
  ): string {
    return `Create an engaging narrative for a ${config.audience} audience NSW ESC trading scenario.

Scenario Context:
- Audience: ${config.audience}
- Market condition: ${marketConditions.condition}
- Participants: ${participants.length} (${participants.map(p => p.profile).join(', ')})
- Duration: ${config.duration} minutes
- Price range: ${marketConditions.priceMovement.startPrice}-${marketConditions.priceMovement.endPrice} A$/tonne

Create:
- Title: Compelling scenario title
- Description: Clear scenario overview
- Context: Market background and setup
- Objectives: Learning objectives for ${config.audience}
- Expected outcomes: Key results participants should understand
- Key learnings: Main takeaways

Respond in JSON format with these fields.`;
  }

  // Helper methods for calculations
  private calculateEndPrice(condition: MarketCondition): number {
    const basePrice = NSW_ESC_GENERATION_CONTEXT.CURRENT_SPOT_PRICE;
    const multipliers = {
      bull: 1.1,
      bear: 0.9,
      volatile: 1 + (Math.random() - 0.5) * 0.3,
      stable: 1 + (Math.random() - 0.5) * 0.05,
      crisis: 0.8
    };
    return basePrice * multipliers[condition];
  }

  private calculatePeakPrice(condition: MarketCondition): number {
    return this.calculateEndPrice(condition) * 1.05;
  }

  private calculateTroughPrice(condition: MarketCondition): number {
    return this.calculateEndPrice(condition) * 0.95;
  }

  private generatePriceTrajectory(condition: MarketCondition, duration: number): Array<{ time: number; price: number }> {
    const trajectory: Array<{ time: number; price: number }> = [];
    const startPrice = NSW_ESC_GENERATION_CONTEXT.CURRENT_SPOT_PRICE;
    const endPrice = this.calculateEndPrice(condition);

    const steps = Math.min(duration, 100); // Max 100 data points

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const time = (duration * progress);
      let price = startPrice + (endPrice - startPrice) * progress;

      // Add realistic noise
      if (i > 0 && i < steps) {
        const noise = (Math.random() - 0.5) * startPrice * 0.02;
        price += noise;
      }

      trajectory.push({ time, price });
    }

    return trajectory;
  }

  private calculateTotalVolume(config: ScenarioGenerationConfig): number {
    const baseVolume = NSW_ESC_GENERATION_CONTEXT.AVERAGE_TRADE_SIZE * config.participantCount;
    const durationMultiplier = Math.min(config.duration / 30, 2); // Scale with duration, cap at 2x
    return Math.floor(baseVolume * durationMultiplier);
  }

  private generateVolumeDistribution(duration: number): Array<{ time: number; volume: number }> {
    const distribution: Array<{ time: number; volume: number }> = [];
    const steps = Math.min(duration / 5, 20); // Every 5 minutes or max 20 points

    for (let i = 0; i <= steps; i++) {
      const time = (duration / steps) * i;
      // Higher volume at beginning and end (market open/close effect)
      const volumeMultiplier = 0.5 + 0.5 * Math.sin((i / steps) * Math.PI);
      const volume = Math.floor(500 * volumeMultiplier * (0.8 + Math.random() * 0.4));
      distribution.push({ time, volume });
    }

    return distribution;
  }

  private calculateImpliedVolatility(condition: MarketCondition): number {
    const baseVol = NSW_ESC_GENERATION_CONTEXT.TYPICAL_VOLATILITY;
    const multipliers = {
      bull: 1.2,
      bear: 1.3,
      volatile: 1.8,
      stable: 0.8,
      crisis: 2.0
    };
    return baseVol * multipliers[condition];
  }

  private generateVolatilityClusters(duration: number): Array<{ start: number; end: number; intensity: number }> {
    const clusters = [];
    const numClusters = Math.floor(duration / 20); // One cluster every 20 minutes

    for (let i = 0; i < numClusters; i++) {
      const start = (duration / numClusters) * i + Math.random() * 5;
      const end = start + 3 + Math.random() * 7; // 3-10 minute clusters
      const intensity = 0.5 + Math.random() * 0.5; // 0.5-1.0 intensity

      clusters.push({ start, end, intensity });
    }

    return clusters;
  }

  private generateMarketEvents(condition: MarketCondition, duration: number): Array<{
    time: number;
    type: 'regulatory_change' | 'major_trade' | 'news_impact' | 'technical_break';
    description: string;
    impact: 'high' | 'medium' | 'low';
  }> {
    const events = [];
    const eventTypes = ['regulatory_change', 'major_trade', 'news_impact', 'technical_break'] as const;
    const numEvents = Math.floor(duration / 15); // One event every 15 minutes on average

    for (let i = 0; i < numEvents; i++) {
      const time = Math.random() * duration;
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const impact: 'high' | 'medium' | 'low' = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';

      const descriptions = {
        regulatory_change: 'NSW ESS rule update announced',
        major_trade: 'Large institutional trade executed',
        news_impact: 'Energy sector news affecting ESC demand',
        technical_break: 'Price breaks key technical level'
      };

      events.push({
        time,
        type,
        description: descriptions[type],
        impact
      });
    }

    return events.sort((a, b) => a.time - b.time);
  }

  // Participant modeling helper methods
  private assignRiskAppetite(profile: ParticipantProfile): RiskAppetite {
    const profileRiskMap: Record<ParticipantProfile, RiskAppetite> = {
      institutional: 'balanced',
      retail: 'conservative',
      corporate: 'conservative',
      government: 'conservative',
      speculative: 'aggressive'
    };
    return profileRiskMap[profile];
  }

  private assignTradingStrategy(profile: ParticipantProfile, audience: AudienceType): any {
    // Strategy assignment based on participant profile and audience focus
    const strategies = {
      institutional: 'portfolio_optimization',
      retail: 'compliance',
      corporate: 'compliance',
      government: 'compliance',
      speculative: 'arbitrage'
    };
    return strategies[profile];
  }

  private generateDecisionFactors(profile: ParticipantProfile) {
    // Generate realistic decision factor weights for different participant types
    const baseFactors = {
      institutional: { priceWeight: 0.4, volumeWeight: 0.3, trendWeight: 0.2, timeWeight: 0.05, riskWeight: 0.05 },
      retail: { priceWeight: 0.5, volumeWeight: 0.1, trendWeight: 0.15, timeWeight: 0.15, riskWeight: 0.1 },
      corporate: { priceWeight: 0.35, volumeWeight: 0.2, trendWeight: 0.15, timeWeight: 0.2, riskWeight: 0.1 },
      government: { priceWeight: 0.3, volumeWeight: 0.15, trendWeight: 0.1, timeWeight: 0.25, riskWeight: 0.2 },
      speculative: { priceWeight: 0.25, volumeWeight: 0.35, trendWeight: 0.3, timeWeight: 0.05, riskWeight: 0.05 }
    };

    return baseFactors[profile] || baseFactors.institutional;
  }

  private generateBehavioralBiases(profile: ParticipantProfile) {
    // Generate realistic behavioral bias levels
    const baseBiases = {
      institutional: { anchoring: 0.2, herding: 0.15, overconfidence: 0.25, lossAversion: 0.3, recencyBias: 0.2 },
      retail: { anchoring: 0.4, herding: 0.35, overconfidence: 0.3, lossAversion: 0.5, recencyBias: 0.4 },
      corporate: { anchoring: 0.3, herding: 0.25, overconfidence: 0.2, lossAversion: 0.35, recencyBias: 0.25 },
      government: { anchoring: 0.35, herding: 0.2, overconfidence: 0.15, lossAversion: 0.4, recencyBias: 0.3 },
      speculative: { anchoring: 0.15, herding: 0.1, overconfidence: 0.6, lossAversion: 0.2, recencyBias: 0.5 }
    };

    return baseBiases[profile] || baseBiases.institutional;
  }

  private generateParticipantConstraints(profile: ParticipantProfile, config: ScenarioGenerationConfig): {
    maxPositionSize: number;
    maxDailyVolume: number;
    priceRange: [number, number];
    timeHorizon: number;
  } {
    const baseConstraints = {
      institutional: {
        maxPositionSize: 50000,
        maxDailyVolume: 100000,
        priceRange: [NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[0], NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[1]] as [number, number],
        timeHorizon: config.duration
      },
      retail: {
        maxPositionSize: 1000,
        maxDailyVolume: 2000,
        priceRange: [NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[0] * 1.1, NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[1] * 0.9] as [number, number],
        timeHorizon: config.duration * 0.8
      },
      corporate: {
        maxPositionSize: 10000,
        maxDailyVolume: 20000,
        priceRange: [NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[0] * 1.05, NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[1] * 0.95] as [number, number],
        timeHorizon: config.duration
      },
      government: {
        maxPositionSize: 25000,
        maxDailyVolume: 30000,
        priceRange: [NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[0] * 1.1, NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[1] * 0.9] as [number, number],
        timeHorizon: config.duration * 1.2
      },
      speculative: {
        maxPositionSize: 20000,
        maxDailyVolume: 100000,
        priceRange: [NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[0], NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[1]] as [number, number],
        timeHorizon: config.duration * 0.5
      }
    };

    return baseConstraints[profile] || baseConstraints.institutional;
  }

  // Timeline generation methods
  private generateTimelinePhases(config: ScenarioGenerationConfig) {
    const phases = [];
    const phaseCount = Math.min(Math.floor(config.duration / 10), 5); // Max 5 phases

    for (let i = 0; i < phaseCount; i++) {
      const startTime = (config.duration / phaseCount) * i;
      const duration = config.duration / phaseCount;

      phases.push({
        name: `Phase ${i + 1}`,
        startTime,
        duration,
        description: this.generatePhaseDescription(i, phaseCount, config),
        keyEvents: this.generatePhaseEvents(i, config),
        expectedActions: this.generateExpectedActions(i, config)
      });
    }

    return phases;
  }

  private generateCriticalEvents(config: ScenarioGenerationConfig, marketConditions: GeneratedMarketCondition) {
    return marketConditions.marketEvents.map(event => ({
      time: event.time,
      event: event.type,
      description: event.description,
      impact: event.impact,
      trigger: 'market_condition',
      outcomes: this.generateEventOutcomes(event)
    }));
  }

  private generateDecisionPoints(config: ScenarioGenerationConfig, participants: ParticipantBehaviorModel[]) {
    const decisionPoints = [];
    const pointCount = Math.floor(config.duration / 20); // Every 20 minutes

    for (let i = 0; i < pointCount; i++) {
      const time = 20 * (i + 1);
      decisionPoints.push({
        time,
        description: `Trading decision point ${i + 1}`,
        options: ['Buy', 'Sell', 'Hold', 'Hedge'],
        defaultAction: 'Hold',
        timeLimit: 60 // 1 minute to decide
      });
    }

    return decisionPoints;
  }

  // Utility methods
  private mapConfigToScenarioType(config: ScenarioGenerationConfig): ScenarioType {
    // Map generation config to existing scenario types
    if (config.audience === 'executive') return 'esc-market-trading';
    if (config.audience === 'technical') return 'portfolio-optimization';
    if (config.audience === 'compliance') return 'compliance-workflow';
    return 'esc-market-trading';
  }

  private calculateGenerationConfidence(
    marketConditions: GeneratedMarketCondition,
    participants: ParticipantBehaviorModel[]
  ): number {
    // Calculate confidence based on data quality and model robustness
    let confidence = 0.8;

    // Adjust based on participant count (more participants = higher confidence)
    if (participants.length >= 5) confidence += 0.1;
    if (participants.length >= 10) confidence += 0.05;

    // Adjust based on market data quality
    if (marketConditions.priceMovement.priceTrajectory.length > 50) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  private assessScenarioRealism(
    marketConditions: GeneratedMarketCondition,
    participants: ParticipantBehaviorModel[]
  ): number {
    let realism = 0.85; // Base realism score

    // Check price ranges
    const priceInRange =
      marketConditions.priceMovement.startPrice >= NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[0] &&
      marketConditions.priceMovement.endPrice <= NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE[1];

    if (!priceInRange) realism -= 0.2;

    // Check participant mix realism
    const hasInstitutional = participants.some(p => p.profile === 'institutional');
    const hasRetail = participants.some(p => p.profile === 'retail');

    if (hasInstitutional && hasRetail) realism += 0.1;

    return Math.max(0, Math.min(realism, 1.0));
  }

  private calculateScenarioComplexity(config: ScenarioGenerationConfig): number {
    let complexity = 0.5; // Base complexity

    if (config.complexity === 'complex') complexity = 0.8;
    else if (config.complexity === 'expert') complexity = 1.0;
    else if (config.complexity === 'simple') complexity = 0.3;

    // Adjust for participant count
    complexity += (config.participantCount - 5) * 0.05;

    // Adjust for duration
    complexity += (config.duration - 30) * 0.01;

    return Math.max(0, Math.min(complexity, 1.0));
  }

  private calculateAdaptability(config: ScenarioGenerationConfig): number {
    // Higher adaptability for audiences that benefit from dynamic adjustment
    const audienceAdaptability = {
      executive: 0.7,
      technical: 0.9,
      compliance: 0.6
    };

    let adaptability = audienceAdaptability[config.audience] || 0.7;

    // Increase adaptability if adaptation rules are defined
    if (config.adaptationRules.length > 0) {
      adaptability += 0.2;
    }

    return Math.min(adaptability, 1.0);
  }

  // Additional helper methods for simulation and validation
  private async getCurrentMarketData(): Promise<RealTimeMarketData | undefined> {
    // In production, this would fetch from Bloomberg/Refinitiv APIs
    // For now, return simulated current market data
    return {
      timestamp: new Date(),
      escSpotPrice: NSW_ESC_GENERATION_CONTEXT.CURRENT_SPOT_PRICE,
      volume24h: 150000,
      volatility: NSW_ESC_GENERATION_CONTEXT.TYPICAL_VOLATILITY,
      bidAskSpread: 0.5,
      marketDepth: {
        bids: [
          { price: 47.75, volume: 5000 },
          { price: 47.70, volume: 8000 },
          { price: 47.65, volume: 12000 }
        ],
        asks: [
          { price: 47.85, volume: 4000 },
          { price: 47.90, volume: 7000 },
          { price: 47.95, volume: 10000 }
        ]
      },
      marketIndicators: {
        trend: 'up',
        momentum: 0.3,
        liquidity: 'high',
        sentimentScore: 15
      }
    };
  }

  private calculateDemandSupplyImbalance(participants: ParticipantBehaviorModel[]): number {
    // Simplified calculation of demand/supply imbalance
    let demandScore = 0;
    let supplyScore = 0;

    participants.forEach(participant => {
      if (participant.profile === 'institutional' || participant.profile === 'corporate') {
        demandScore += 1;
      }
      if (participant.profile === 'speculative') {
        supplyScore += 1;
      }
    });

    return (demandScore - supplyScore) / participants.length;
  }

  private simulateParticipantVolume(
    participant: ParticipantBehaviorModel,
    currentPrice: number,
    finalPrice: number
  ): number {
    const priceChange = (finalPrice - currentPrice) / currentPrice;
    const baseVolume = NSW_ESC_GENERATION_CONTEXT.AVERAGE_TRADE_SIZE;

    // Adjust volume based on participant's price sensitivity and risk appetite
    let volumeMultiplier = 1;

    if (participant.riskAppetite === 'aggressive') {
      volumeMultiplier = 1.5;
    } else if (participant.riskAppetite === 'conservative') {
      volumeMultiplier = 0.7;
    }

    // Adjust for price movement
    if (Math.abs(priceChange) > 0.05) { // > 5% price change
      volumeMultiplier *= 1.2; // Increased trading activity
    }

    return Math.floor(baseVolume * volumeMultiplier * (0.8 + Math.random() * 0.4));
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private calculateStandardDeviation(numbers: number[], mean: number): number {
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  private generateScenarioOutcomes(
    priceOutcomes: number[],
    volumeOutcomes: number[],
    config: ScenarioGenerationConfig
  ) {
    const priceMean = priceOutcomes.reduce((a, b) => a + b, 0) / priceOutcomes.length;
    const volumeMean = volumeOutcomes.reduce((a, b) => a + b, 0) / volumeOutcomes.length;

    return [
      {
        outcome: 'Price appreciation',
        probability: priceOutcomes.filter(p => p > NSW_ESC_GENERATION_CONTEXT.CURRENT_SPOT_PRICE).length / priceOutcomes.length,
        conditions: ['Favorable market conditions', 'Strong demand'],
        impact: 1,
        confidence: 0.8
      },
      {
        outcome: 'High trading volume',
        probability: volumeOutcomes.filter(v => v > volumeMean * 1.2).length / volumeOutcomes.length,
        conditions: ['Market volatility', 'Active participants'],
        impact: 0.5,
        confidence: 0.75
      },
      {
        outcome: 'Successful execution',
        probability: 0.85, // Base success rate
        conditions: ['Normal market conditions', 'Adequate liquidity'],
        impact: 1,
        confidence: 0.9
      }
    ];
  }

  private extractProbabilisticOutcomes(results: MonteCarloResults): {
    outcome: string;
    probability: number;
    impact: "positive" | "neutral" | "negative";
    description: string;
  }[] {
    return results.scenarioOutcomes.map(outcome => ({
      outcome: outcome.outcome,
      probability: outcome.probability,
      impact: (outcome.impact > 0 ? 'positive' : outcome.impact < 0 ? 'negative' : 'neutral') as "positive" | "neutral" | "negative",
      description: `${outcome.outcome} with ${Math.round(outcome.probability * 100)}% probability`
    }));
  }

  private generateDeterministicOutcomes(
    config: ScenarioGenerationConfig,
    marketConditions: GeneratedMarketCondition
  ): {
    outcome: string;
    conditions: string[];
    description: string;
  }[] {
    return [
      {
        outcome: 'Compliance achievement',
        conditions: ['All trades executed within regulatory limits'],
        description: 'Successful completion of ESC compliance obligations'
      },
      {
        outcome: 'Market learning',
        conditions: ['Participant engagement maintained'],
        description: `Understanding of NSW ESC trading for ${config.audience} audience`
      }
    ];
  }

  private async validateCriterion(scenario: GeneratedScenario, criterion: { name: string }): Promise<number> {
    // Simplified validation logic - in production this would be more sophisticated
    switch (criterion.name) {
      case 'Price Realism':
        return this.validatePriceRealism(scenario.marketConditions);
      case 'Volume Realism':
        return this.validateVolumeRealism(scenario.marketConditions);
      case 'Participant Behavior':
        return this.validateParticipantBehavior(scenario.participants);
      case 'Market Consistency':
        return this.validateMarketConsistency(scenario.marketConditions);
      default:
        return 0.8;
    }
  }

  private validatePriceRealism(marketConditions: GeneratedMarketCondition): number {
    const { startPrice, endPrice, peakPrice, troughPrice } = marketConditions.priceMovement;
    const [minPrice, maxPrice] = NSW_ESC_GENERATION_CONTEXT.HISTORICAL_PRICE_RANGE;

    let score = 1.0;

    if (startPrice < minPrice || startPrice > maxPrice) score -= 0.3;
    if (endPrice < minPrice || endPrice > maxPrice) score -= 0.3;
    if (peakPrice < minPrice || peakPrice > maxPrice) score -= 0.2;
    if (troughPrice < minPrice || troughPrice > maxPrice) score -= 0.2;

    return Math.max(0, score);
  }

  private validateVolumeRealism(marketConditions: GeneratedMarketCondition): number {
    const totalVolume = marketConditions.volumeProfile.totalVolume;
    const marketSize = NSW_ESC_GENERATION_CONTEXT.MARKET_SIZE / NSW_ESC_GENERATION_CONTEXT.CURRENT_SPOT_PRICE;

    // Volume should be reasonable relative to daily market activity
    const dailyVolumeEstimate = marketSize * 0.001; // 0.1% of market per day
    const reasonableRange = [dailyVolumeEstimate * 0.1, dailyVolumeEstimate * 2];

    if (totalVolume >= reasonableRange[0] && totalVolume <= reasonableRange[1]) {
      return 0.9;
    } else if (totalVolume < reasonableRange[0] * 0.5 || totalVolume > reasonableRange[1] * 2) {
      return 0.3;
    } else {
      return 0.6;
    }
  }

  private validateParticipantBehavior(participants: ParticipantBehaviorModel[]): number {
    // Check for realistic participant mix and behavior parameters
    let score = 0.8;

    // Should have diverse participant types
    const profileTypes = new Set(participants.map(p => p.profile));
    if (profileTypes.size >= 3) score += 0.1;

    // Risk appetite should vary
    const riskTypes = new Set(participants.map(p => p.riskAppetite));
    if (riskTypes.size >= 2) score += 0.1;

    return Math.min(score, 1.0);
  }

  private validateMarketConsistency(marketConditions: GeneratedMarketCondition): number {
    // Check consistency with NSW ESC market characteristics
    let score = 0.9;

    // Volatility should be reasonable
    if (marketConditions.volatilityMetrics.historicalVolatility > 0.5) score -= 0.2;
    if (marketConditions.volatilityMetrics.historicalVolatility < 0.05) score -= 0.1;

    // Should have realistic market events
    if (marketConditions.marketEvents.length === 0) score -= 0.1;

    return Math.max(0, score);
  }

  private generateValidationFeedback(criterionName: 'Price Realism' | 'Volume Realism' | 'Participant Behavior' | 'Market Consistency', score: number): string {
    const feedback = {
      'Price Realism': score > 0.8 ? 'Prices are realistic and within historical ranges' :
                     score > 0.5 ? 'Some price points may be outside typical ranges' :
                     'Price levels appear unrealistic for NSW ESC market',
      'Volume Realism': score > 0.8 ? 'Trading volumes are consistent with market size' :
                       score > 0.5 ? 'Volume levels may be high/low for scenario duration' :
                       'Unrealistic volume levels for NSW ESC market',
      'Participant Behavior': score > 0.8 ? 'Participant behaviors are well-modeled' :
                             score > 0.5 ? 'Some participant behaviors could be improved' :
                             'Participant modeling needs enhancement',
      'Market Consistency': score > 0.8 ? 'Scenario is consistent with NSW ESC market' :
                           score > 0.5 ? 'Minor inconsistencies with market characteristics' :
                           'Major inconsistencies with NSW ESC market'
    };

    return feedback[criterionName] || 'Validation completed';
  }

  private generateValidationRecommendations(validation: ScenarioValidation) {
    const recommendations: {
      type: 'improvement';
      description: string;
      priority: 'high' | 'medium';
      estimatedImpact: number;
    }[] = [];

    validation.results.criteriaScores.forEach((result, index) => {
      if (!result.passed) {
        const criterion = validation.criteria[index];
        recommendations.push({
          type: 'improvement' as const,
          description: `Improve ${criterion.name}: ${result.feedback}`,
          priority: criterion.weight > 0.25 ? 'high' as const : 'medium' as const,
          estimatedImpact: criterion.weight
        });
      }
    });

    return recommendations;
  }

  // Helper methods for timeline generation
  private generatePhaseDescription(phaseIndex: number, totalPhases: number, config: ScenarioGenerationConfig): string {
    const phases = [
      'Market opening and initial positioning',
      'Active trading and price discovery',
      'Market response to events',
      'Final positioning and settlement',
      'Market close and evaluation'
    ];
    return phases[phaseIndex] || `Trading phase ${phaseIndex + 1}`;
  }

  private generatePhaseEvents(phaseIndex: number, config: ScenarioGenerationConfig): string[] {
    const events = [
      ['Market opens', 'Initial bids and offers', 'Participant assessment'],
      ['Price movements', 'Volume increases', 'Trading strategies emerge'],
      ['Market events impact', 'Participant reactions', 'Strategy adjustments'],
      ['Final trades', 'Position optimization', 'Risk management'],
      ['Market close', 'Settlement', 'Performance evaluation']
    ];
    return events[phaseIndex] || [`Phase ${phaseIndex + 1} activities`];
  }

  private generateExpectedActions(phaseIndex: number, config: ScenarioGenerationConfig): string[] {
    const actions = [
      ['Assess market conditions', 'Set initial positions'],
      ['Monitor price movements', 'Execute trades'],
      ['React to events', 'Adjust strategies'],
      ['Finalize positions', 'Manage risk'],
      ['Evaluate performance', 'Learn from outcomes']
    ];
    return actions[phaseIndex] || [`Phase ${phaseIndex + 1} actions`];
  }

  private generateEventOutcomes(event: { type: 'regulatory_change' | 'major_trade' | 'news_impact' | 'technical_break' }): string[] {
    const outcomeMap = {
      regulatory_change: ['Price adjustment', 'Compliance review', 'Strategy change'],
      major_trade: ['Price movement', 'Volume spike', 'Market response'],
      news_impact: ['Sentiment shift', 'Volatility increase', 'Position adjustments'],
      technical_break: ['Trend continuation', 'Support/resistance test', 'Technical analysis']
    };
    return outcomeMap[event.type] || ['Market impact'];
  }

  // Default content generation methods
  private generateDefaultTitle(config: ScenarioGenerationConfig): string {
    return `NSW ESC Trading Scenario - ${config.audience} Focus`;
  }

  private generateDefaultDescription(config: ScenarioGenerationConfig): string {
    return `Interactive trading scenario designed for ${config.audience} audience, demonstrating key aspects of NSW Energy Savings Certificate market dynamics.`;
  }

  private generateDefaultContext(config: ScenarioGenerationConfig, marketConditions: GeneratedMarketCondition): string {
    return `Market conditions: ${marketConditions.condition}. Duration: ${config.duration} minutes. Complexity: ${config.complexity}.`;
  }

  private generateDefaultOutcomes(config: ScenarioGenerationConfig): string[] {
    return [
      'Understanding of NSW ESC market mechanics',
      'Experience with trading decision-making',
      'Knowledge of risk management principles',
      'Insight into market participant behavior'
    ];
  }

  private generateDefaultLearnings(config: ScenarioGenerationConfig): string[] {
    return [
      'NSW ESC pricing dynamics',
      'Impact of market events on trading',
      'Importance of timing in trading decisions',
      'Risk-return trade-offs in carbon credit trading'
    ];
  }

  // Event and cache management
  private async emitEvent(type: GenerationEventType, data: any): Promise<void> {
    const event: GenerationEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      scenarioId: this.engineState.currentGeneration || undefined,
      data
    };

    this.eventHistory.push(event);

    // Keep only last 1000 events
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-1000);
    }
  }

  private cacheScenarioComponents(scenario: GeneratedScenario): void {
    // Cache components for future reuse
    this.engineState.cache.marketConditions.set(
      scenario.marketConditions.id,
      scenario.marketConditions
    );

    scenario.participants.forEach(participant => {
      this.engineState.cache.participantModels.set(participant.id, participant);
    });

    // Cache scenario template (without specific instance data)
    const template = {
      type: scenario.type,
      config: scenario.config,
      narrative: scenario.narrative
    };
    this.engineState.cache.scenarioTemplates.set(`template-${scenario.type}`, template);
  }

  private updatePerformanceMetrics(startTime: number, success: boolean): void {
    const duration = Date.now() - startTime;

    // Update average generation time
    const currentAvg = this.engineState.performance.averageGenerationTime;
    this.engineState.performance.averageGenerationTime = (currentAvg + duration) / 2;

    // Update success rate (rolling average)
    const currentRate = this.engineState.performance.successRate;
    const newRate = success ? 1.0 : 0.0;
    this.engineState.performance.successRate = (currentRate * 0.9) + (newRate * 0.1);
  }

  // Public utility methods
  public getEngineState(): GenerationEngineState {
    return { ...this.engineState };
  }

  public getEventHistory(): GenerationEvent[] {
    return [...this.eventHistory];
  }

  public clearCache(): void {
    this.engineState.cache.marketConditions.clear();
    this.engineState.cache.participantModels.clear();
    this.engineState.cache.scenarioTemplates.clear();
    this.engineState.cache.validationResults.clear();
  }

  public async adaptScenario(
    scenarioId: string,
    adaptationTrigger: any,
    adaptationParameters: any
  ): Promise<ScenarioAdaptation> {
    // Implementation for real-time scenario adaptation
    const adaptation: ScenarioAdaptation = {
      id: `adaptation-${scenarioId}-${Date.now()}`,
      timestamp: new Date(),
      trigger: adaptationTrigger,
      adaptation: {
        type: 'parameter_adjustment',
        description: 'Real-time scenario adaptation',
        changes: Object.entries(adaptationParameters).map(([property, value]) => ({
          component: 'scenario',
          property,
          oldValue: null, // Would need original value
          newValue: value
        }))
      },
      impact: {
        realism: 0,
        complexity: 0,
        duration: 0,
        engagement: 0.1
      },
      rollbackPlan: {
        conditions: ['User request', 'Performance degradation'],
        actions: ['Restore original parameters'],
        timeLimit: 5
      }
    };

    await this.emitEvent('adaptation_triggered', { adaptation });
    return adaptation;
  }
}