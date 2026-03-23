/**
 * Real-Time Data Feed Connector
 * Milestone 2.1: Real-Time Data Feeds
 *
 * Provides subscription-based real-time market data with simulation capabilities
 * for demo deployment (no external API dependencies)
 */

import type {
  DataFeedType,
  DataFeedStatus,
  UpdateFrequency,
  DataFeedSubscription,
  DataFeedUpdate,
  DataFeedConfig,
  DataFeedStats,
  DataFeedError,
  DataFeedEvent,
  IDataFeedConnector,
  HistoricalDataRequest,
  HistoricalDataResponse,
  HistoricalDataPoint,
  CarbonPricingData,
  RWAMarketData,
  RegulatoryAlertsData,
  MarketSentimentData
} from './types';

// Import existing market intelligence for baseline data
import { marketIntelligenceSystem } from '../market-intelligence';
import { PRICING_INDEX } from '../negotiation-config';

class RealTimeDataConnector implements IDataFeedConnector {
  private subscriptions: Map<string, DataFeedSubscription> = new Map();
  private configs: Map<DataFeedType, DataFeedConfig> = new Map();
  private stats: Map<DataFeedType, DataFeedStats> = new Map();
  private historicalData: Map<DataFeedType, HistoricalDataPoint[]> = new Map();
  private intervals: Map<DataFeedType, NodeJS.Timeout> = new Map();
  private sequenceCounters: Map<DataFeedType, number> = new Map();
  private isStarted: boolean = false;
  private lastDataCache: Map<DataFeedType, DataFeedUpdate> = new Map();

  constructor() {
    this.initializeConfigs();
    this.initializeStats();
    this.initializeHistoricalData();
  }

  // ===== INITIALIZATION =====

  private initializeConfigs(): void {
    const defaultConfigs: Record<DataFeedType, DataFeedConfig> = {
      carbon_pricing: {
        feedType: 'carbon_pricing',
        enabled: true,
        updateFrequency: 'medium', // 5 minutes
        retryAttempts: 3,
        retryDelayMs: 5000,
        maxCacheSize: 2000,
        cacheTTL: 300000, // 5 minutes
        simulationParams: {
          volatility: 0.15, // 15% price volatility
          trendBias: 0.02,  // Slight upward bias
          eventFrequency: 0.1, // 10% chance of market events
        },
      },
      rwa_market: {
        feedType: 'rwa_market',
        enabled: true,
        updateFrequency: 'medium',
        retryAttempts: 3,
        retryDelayMs: 5000,
        maxCacheSize: 1000,
        cacheTTL: 900000, // 15 minutes
        simulationParams: {
          volatility: 0.08, // 8% market volatility
          trendBias: 0.05,  // Upward growth bias
          eventFrequency: 0.05, // 5% chance of events
        },
      },
      regulatory_alerts: {
        feedType: 'regulatory_alerts',
        enabled: true,
        updateFrequency: 'low', // 30 minutes
        retryAttempts: 3,
        retryDelayMs: 5000,
        maxCacheSize: 500,
        cacheTTL: 1800000, // 30 minutes
        simulationParams: {
          volatility: 0.0, // No volatility for regulatory data
          trendBias: 0.0,
          eventFrequency: 0.02, // 2% chance of new alerts
        },
      },
      market_sentiment: {
        feedType: 'market_sentiment',
        enabled: true,
        updateFrequency: 'high', // 30 seconds
        retryAttempts: 3,
        retryDelayMs: 5000,
        maxCacheSize: 1000,
        cacheTTL: 300000, // 5 minutes
        simulationParams: {
          volatility: 0.25, // 25% sentiment volatility
          trendBias: 0.0,   // No systematic bias
          eventFrequency: 0.15, // 15% chance of sentiment events
        },
      },
    };

    Object.entries(defaultConfigs).forEach(([feedType, config]) => {
      this.configs.set(feedType as DataFeedType, config);
    });
  }

  private initializeStats(): void {
    const feedTypes: DataFeedType[] = ['carbon_pricing', 'rwa_market', 'regulatory_alerts', 'market_sentiment'];

    feedTypes.forEach((feedType) => {
      this.stats.set(feedType, {
        feedType,
        status: 'disconnected',
        totalUpdates: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        lastUpdateTime: null,
        averageUpdateLatency: 0,
        currentSubscribers: 0,
        dataPointsCached: 0,
      });
      this.sequenceCounters.set(feedType, 0);
    });
  }

  private initializeHistoricalData(): void {
    const feedTypes: DataFeedType[] = ['carbon_pricing', 'rwa_market', 'regulatory_alerts', 'market_sentiment'];

    feedTypes.forEach((feedType) => {
      this.historicalData.set(feedType, []);
    });

    // Pre-populate with some historical data for realistic simulation
    this.generateInitialHistoricalData();
  }

  private generateInitialHistoricalData(): void {
    const now = new Date();
    const hoursBack = 24 * 7; // One week of data

    for (let i = hoursBack; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();

      // Generate historical carbon pricing data
      const carbonData = this.generateCarbonPricingData(timestamp);
      this.addHistoricalDataPoint('carbon_pricing', { timestamp, data: carbonData });

      // Generate historical RWA market data (less frequent updates)
      if (i % 4 === 0) { // Every 4 hours
        const rwaData = this.generateRWAMarketData(timestamp);
        this.addHistoricalDataPoint('rwa_market', { timestamp, data: rwaData });
      }

      // Generate sentiment data (frequent updates)
      const sentimentData = this.generateMarketSentimentData(timestamp);
      this.addHistoricalDataPoint('market_sentiment', { timestamp, data: sentimentData });

      // Generate regulatory alerts (infrequent)
      if (i % 24 === 0 && Math.random() < 0.3) { // Daily, 30% chance
        const regulatoryData = this.generateRegulatoryAlertsData(timestamp);
        this.addHistoricalDataPoint('regulatory_alerts', { timestamp, data: regulatoryData });
      }
    }
  }

  // ===== SUBSCRIPTION MANAGEMENT =====

  subscribe(
    feedType: DataFeedType,
    callback: (update: DataFeedUpdate) => void,
    frequency: UpdateFrequency = 'medium'
  ): string {
    const subscriptionId = `sub_${feedType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const subscription: DataFeedSubscription = {
      id: subscriptionId,
      feedType,
      callback,
      frequency,
      isActive: true,
      subscribedAt: new Date().toISOString(),
      lastUpdate: null,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Update stats
    const stats = this.stats.get(feedType)!;
    stats.currentSubscribers = Array.from(this.subscriptions.values())
      .filter(s => s.feedType === feedType && s.isActive).length;

    // If this is the first subscription for this feed type and we're started, begin updates
    if (this.isStarted && !this.intervals.has(feedType)) {
      this.startFeedUpdates(feedType);
    }

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    subscription.isActive = false;
    this.subscriptions.delete(subscriptionId);

    // Update stats
    const stats = this.stats.get(subscription.feedType)!;
    stats.currentSubscribers = Array.from(this.subscriptions.values())
      .filter(s => s.feedType === subscription.feedType && s.isActive).length;

    // If no more subscribers for this feed type, stop updates
    if (stats.currentSubscribers === 0) {
      this.stopFeedUpdates(subscription.feedType);
    }

    return true;
  }

  // ===== DATA RETRIEVAL =====

  getLatestData(feedType: DataFeedType): DataFeedUpdate | null {
    return this.lastDataCache.get(feedType) || null;
  }

  async getHistoricalData(request: HistoricalDataRequest): Promise<HistoricalDataResponse> {
    const historicalData = this.historicalData.get(request.feedType) || [];

    // Parse time range to get start time
    const now = new Date();
    const timeRangeMs = this.parseTimeRangeToMs(request.timeRange);
    const fromTime = new Date(now.getTime() - timeRangeMs);

    // Filter data points within time range
    const filteredData = historicalData
      .filter(point => new Date(point.timestamp) >= fromTime)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Apply max points limit if specified
    const finalData = request.maxPoints && filteredData.length > request.maxPoints
      ? filteredData.slice(-request.maxPoints)
      : filteredData;

    return {
      feedType: request.feedType,
      timeRange: request.timeRange,
      dataPoints: finalData,
      totalPoints: finalData.length,
      fromTime: finalData.length > 0 ? finalData[0].timestamp : now.toISOString(),
      toTime: finalData.length > 0 ? finalData[finalData.length - 1].timestamp : now.toISOString(),
    };
  }

  private parseTimeRangeToMs(timeRange: string): number {
    const ranges: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
      '2y': 2 * 365 * 24 * 60 * 60 * 1000,
      '5y': 5 * 365 * 24 * 60 * 60 * 1000,
    };

    return ranges[timeRange] || ranges['24h'];
  }

  // ===== STATUS AND MANAGEMENT =====

  getStats(feedType: DataFeedType): DataFeedStats {
    return { ...this.stats.get(feedType)! };
  }

  getAllStats(): Record<DataFeedType, DataFeedStats> {
    const result = {} as Record<DataFeedType, DataFeedStats>;
    this.stats.forEach((stats, feedType) => {
      result[feedType] = { ...stats };
    });
    return result;
  }

  getFeedStatus(feedType: DataFeedType): DataFeedStatus {
    return this.stats.get(feedType)?.status || 'disconnected';
  }

  // ===== CONFIGURATION =====

  updateConfig(feedType: DataFeedType, config: Partial<DataFeedConfig>): void {
    const currentConfig = this.configs.get(feedType);
    if (currentConfig) {
      this.configs.set(feedType, { ...currentConfig, ...config });

      // Restart feed if configuration changed and feed is active
      if (this.intervals.has(feedType)) {
        this.stopFeedUpdates(feedType);
        this.startFeedUpdates(feedType);
      }
    }
  }

  getConfig(feedType: DataFeedType): DataFeedConfig {
    return { ...this.configs.get(feedType)! };
  }

  // ===== LIFECYCLE =====

  start(): void {
    if (this.isStarted) return;

    this.isStarted = true;

    // Start feeds that have active subscriptions
    this.stats.forEach((stats, feedType) => {
      if (stats.currentSubscribers > 0) {
        this.startFeedUpdates(feedType);
      }
    });
  }

  stop(): void {
    if (!this.isStarted) return;

    this.isStarted = false;

    // Stop all feed updates
    this.intervals.forEach((interval, feedType) => {
      this.stopFeedUpdates(feedType);
    });

    // Clear all subscriptions and reset subscriber counts
    this.subscriptions.clear();
    this.stats.forEach((stats) => {
      stats.currentSubscribers = 0;
    });
  }

  restart(): void {
    // Stop feeds but preserve subscriptions for restart
    if (!this.isStarted) return;

    this.isStarted = false;

    // Stop all feed updates but keep subscriptions
    this.intervals.forEach((interval, feedType) => {
      this.stopFeedUpdates(feedType);
    });

    setTimeout(() => this.start(), 100);
  }

  // ===== INTERNAL UPDATE MECHANISM =====

  private startFeedUpdates(feedType: DataFeedType): void {
    const config = this.configs.get(feedType);
    if (!config || !config.enabled) return;

    const updateInterval = this.getUpdateIntervalMs(config.updateFrequency);

    // Set status to connecting
    const stats = this.stats.get(feedType)!;
    stats.status = 'connecting';

    // Simulate connection delay
    setTimeout(() => {
      stats.status = 'connected';

      const interval = setInterval(() => {
        this.generateAndDistributeUpdate(feedType);
      }, updateInterval);

      this.intervals.set(feedType, interval);

      // Generate initial update
      this.generateAndDistributeUpdate(feedType);
    }, 1000); // Fixed 1 second connection delay
  }

  private stopFeedUpdates(feedType: DataFeedType): void {
    const interval = this.intervals.get(feedType);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(feedType);
    }

    const stats = this.stats.get(feedType)!;
    stats.status = 'disconnected';
  }

  private getUpdateIntervalMs(frequency: UpdateFrequency): number {
    const intervals: Record<UpdateFrequency, number> = {
      real_time: 1000,      // 1 second
      high: 30000,          // 30 seconds
      medium: 300000,       // 5 minutes
      low: 1800000,         // 30 minutes
      daily: 86400000,      // 24 hours
    };

    return intervals[frequency];
  }

  private generateAndDistributeUpdate(feedType: DataFeedType): void {
    const startTime = Date.now();

    try {
      const timestamp = new Date().toISOString();
      const sequence = this.sequenceCounters.get(feedType)! + 1;
      this.sequenceCounters.set(feedType, sequence);

      let data: CarbonPricingData | RWAMarketData | RegulatoryAlertsData | MarketSentimentData;

      switch (feedType) {
        case 'carbon_pricing':
          data = this.generateCarbonPricingData(timestamp);
          break;
        case 'rwa_market':
          data = this.generateRWAMarketData(timestamp);
          break;
        case 'regulatory_alerts':
          data = this.generateRegulatoryAlertsData(timestamp);
          break;
        case 'market_sentiment':
          data = this.generateMarketSentimentData(timestamp);
          break;
        default:
          throw new Error(`Unknown feed type: ${feedType}`);
      }

      const update: DataFeedUpdate = {
        feedType,
        timestamp,
        data,
        sequence,
        source: `WREI_${feedType.toUpperCase()}_SIMULATOR`,
      };

      // Cache the update
      this.lastDataCache.set(feedType, update);

      // Add to historical data
      this.addHistoricalDataPoint(feedType, { timestamp, data });

      // Distribute to subscribers
      const activeSubscriptions = Array.from(this.subscriptions.values())
        .filter(sub => sub.feedType === feedType && sub.isActive);

      activeSubscriptions.forEach(subscription => {
        try {
          subscription.callback(update);
          subscription.lastUpdate = timestamp;
        } catch (error) {
          console.error(`Error in subscription callback for ${subscription.id}:`, error);
        }
      });

      // Update stats
      const endTime = Date.now();
      const stats = this.stats.get(feedType)!;
      stats.totalUpdates++;
      stats.successfulUpdates++;
      stats.lastUpdateTime = timestamp;
      stats.averageUpdateLatency = (stats.averageUpdateLatency + (endTime - startTime)) / 2;
      stats.dataPointsCached = this.historicalData.get(feedType)?.length || 0;

    } catch (error) {
      const stats = this.stats.get(feedType)!;
      stats.totalUpdates++;
      stats.failedUpdates++;
      stats.status = 'error';

      console.error(`Error generating update for ${feedType}:`, error);

      // Retry mechanism could go here
      setTimeout(() => {
        if (this.intervals.has(feedType)) {
          stats.status = 'connected';
        }
      }, 5000);
    }
  }

  // ===== DATA GENERATION METHODS =====

  private generateCarbonPricingData(timestamp: string): CarbonPricingData {
    const config = this.configs.get('carbon_pricing')!.simulationParams!;
    const basePrice = PRICING_INDEX.DMRV_SPOT_REFERENCE;

    // Apply volatility and trend
    const priceVariation = (Math.random() - 0.5) * config.volatility * basePrice;
    const trendAdjustment = config.trendBias * basePrice * 0.01;
    const currentPrice = Math.max(basePrice + priceVariation + trendAdjustment, basePrice * 0.5);

    return {
      spot: {
        vcm_spot_reference: PRICING_INDEX.VCM_SPOT_REFERENCE * (1 + (Math.random() - 0.5) * 0.1),
        forward_removal_reference: PRICING_INDEX.FORWARD_REMOVAL_REFERENCE * (1 + (Math.random() - 0.5) * 0.05),
        dmrv_premium_benchmark: PRICING_INDEX.DMRV_PREMIUM_BENCHMARK * (1 + (Math.random() - 0.5) * 0.15),
      },
      indices: {
        base_carbon_price: currentPrice,
        wrei_premium_multiplier: 1.85 * (1 + (Math.random() - 0.5) * 0.1),
        anchor_price: currentPrice * 1.85,
      },
      volatility: {
        daily_change_percent: (Math.random() - 0.5) * 10,
        weekly_change_percent: (Math.random() - 0.5) * 20,
        volatility_index: Math.random() * 100,
      },
      market_depth: {
        bid_volume: 50000 + Math.random() * 100000,
        ask_volume: 45000 + Math.random() * 90000,
        spread_percentage: 0.5 + Math.random() * 2,
      },
      projections: {
        next_hour: currentPrice * (1 + (Math.random() - 0.5) * 0.02),
        next_day: currentPrice * (1 + (Math.random() - 0.5) * 0.05),
        confidence_interval: [currentPrice * 0.95, currentPrice * 1.05],
      },
    };
  }

  private generateRWAMarketData(timestamp: string): RWAMarketData {
    const marketContext = marketIntelligenceSystem.getTokenizedRWAMarketContext();
    const config = this.configs.get('rwa_market')!.simulationParams!;

    // Apply market growth simulation
    const growthFactor = 1 + config.trendBias + (Math.random() - 0.5) * config.volatility;

    // Calculate segment values first
    const realEstateValue = marketContext.marketSegments.realEstate * growthFactor;
    const privateEquityValue = marketContext.marketSegments.privateCredit * growthFactor;
    const infrastructureValue = marketContext.marketSegments.infrastructure * growthFactor;
    const commoditiesValue = marketContext.marketSegments.commodities * growthFactor;

    // Total market value should be the sum of all segments
    const totalMarketValue = realEstateValue + privateEquityValue + infrastructureValue + commoditiesValue;

    return {
      totalMarketValue,
      growthRate: marketContext.growthRate * (1 + (Math.random() - 0.5) * 0.2),
      marketSegments: {
        realEstate: {
          value: realEstateValue,
          growthRate: 15 + (Math.random() - 0.5) * 10,
          topAssets: [
            { name: 'Commercial Property Token A', value: 50000000, yieldRate: 8.5 + Math.random() * 2 },
            { name: 'Residential REIT Token B', value: 35000000, yieldRate: 6.2 + Math.random() * 2 },
            { name: 'Industrial Property Token C', value: 28000000, yieldRate: 7.8 + Math.random() * 2 },
          ],
        },
        privateEquity: {
          value: privateEquityValue,
          growthRate: 25 + (Math.random() - 0.5) * 15,
          topAssets: [
            { name: 'Tech Growth Fund Token', value: 80000000, yieldRate: 12.3 + Math.random() * 3 },
            { name: 'Healthcare PE Token', value: 65000000, yieldRate: 14.1 + Math.random() * 3 },
            { name: 'CleanTech Venture Token', value: 45000000, yieldRate: 16.7 + Math.random() * 4 },
          ],
        },
        infrastructure: {
          value: infrastructureValue,
          growthRate: 18 + (Math.random() - 0.5) * 8,
          topAssets: [
            { name: 'WREI Infrastructure Token', value: 25000000, yieldRate: 9.2 + Math.random() * 2 },
            { name: 'Solar Farm Token', value: 18000000, yieldRate: 8.8 + Math.random() * 2 },
            { name: 'Transport Infrastructure Token', value: 15000000, yieldRate: 7.5 + Math.random() * 2 },
          ],
        },
        commodities: {
          value: commoditiesValue,
          growthRate: 12 + (Math.random() - 0.5) * 12,
          topAssets: [
            { name: 'Gold Token', value: 40000000, yieldRate: 4.2 + Math.random() * 1 },
            { name: 'Agricultural Commodities Token', value: 30000000, yieldRate: 6.8 + Math.random() * 2 },
            { name: 'Energy Commodities Token', value: 25000000, yieldRate: 8.1 + Math.random() * 3 },
          ],
        },
      },
      liquidityMetrics: {
        dailyTradingVolume: 5000000 + Math.random() * 10000000,
        averageTradeSize: 250000 + Math.random() * 500000,
        activeTokens: 150 + Math.floor(Math.random() * 50),
      },
      yieldData: {
        averageYield: 8.5 + (Math.random() - 0.5) * 2,
        yieldRange: [4.2, 16.7],
        riskAdjustedYield: 7.2 + (Math.random() - 0.5) * 1.5,
      },
    };
  }

  private generateRegulatoryAlertsData(timestamp: string): RegulatoryAlertsData {
    const config = this.configs.get('regulatory_alerts')!.simulationParams!;
    const shouldGenerateNewAlert = Math.random() < config.eventFrequency;

    const existingAlerts = [
      {
        id: 'alert_001',
        severity: 'medium' as const,
        category: 'afsl' as const,
        title: 'ASIC Consultation: Updates to Relief Instrument CI 07/03',
        description: 'ASIC proposes amendments to conditional relief for managed investment schemes',
        jurisdiction: 'Australia',
        effectiveDate: '2026-04-15',
        actionRequired: true,
        relatedRegulations: ['CI 07/03', 'Corporations Act 2001'],
      },
      {
        id: 'alert_002',
        severity: 'low' as const,
        category: 'environmental' as const,
        title: 'Draft Carbon Credit Guidelines Update',
        description: 'Clean Energy Regulator releases draft guidelines for carbon credit methodology updates',
        jurisdiction: 'Australia',
        effectiveDate: '2026-05-01',
        actionRequired: false,
        relatedRegulations: ['Carbon Credits (CFI) Act 2011'],
      },
    ];

    const newAlert = shouldGenerateNewAlert ? {
      id: `alert_${Date.now()}`,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      category: ['tax', 'disclosure', 'aml_ctf'][Math.floor(Math.random() * 3)] as any,
      title: 'New Regulatory Development',
      description: 'Regulatory update generated by simulation',
      jurisdiction: 'Australia',
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actionRequired: Math.random() < 0.3,
      relatedRegulations: ['Corporations Act 2001'],
    } : null;

    return {
      activeAlerts: newAlert ? [newAlert, ...existingAlerts] : existingAlerts,
      complianceUpdates: [
        {
          id: 'update_001',
          updateType: 'threshold_change',
          title: 'Wholesale Investor Thresholds Indexed',
          summary: 'Annual indexation of wholesale investor thresholds effective July 1, 2026',
          impactLevel: 'medium',
          applicableEntityTypes: ['managed_investment_scheme', 'financial_product_issuer'],
          implementationDeadline: '2026-07-01',
        },
      ],
      jurisdictionalChanges: [
        {
          jurisdiction: 'Australia',
          changeType: 'amendment',
          title: 'Treasury Laws Amendment (Carbon Credit Framework) Bill 2026',
          description: 'Proposed amendments to enhance carbon credit integrity and transparency',
          impactAssessment: 'Moderate impact on carbon credit issuers and traders',
        },
      ],
    };
  }

  private generateMarketSentimentData(timestamp: string): MarketSentimentData {
    const config = this.configs.get('market_sentiment')!.simulationParams!;

    // Generate base sentiment with volatility
    const baseSentiment = (Math.random() - 0.5) * 2 * 100; // -100 to +100
    const sentimentVolatility = (Math.random() - 0.5) * config.volatility * 100;
    const overallScore = Math.max(-100, Math.min(100, baseSentiment + sentimentVolatility));

    return {
      overallSentiment: {
        score: overallScore,
        trend: overallScore > 10 ? 'improving' : overallScore < -10 ? 'declining' : 'stable',
        confidence: 60 + Math.random() * 30,
      },
      sectorSentiment: {
        carbonCredits: {
          score: overallScore + (Math.random() - 0.5) * 40,
          drivers: ['regulatory_support', 'institutional_adoption', 'pricing_stability'],
        },
        tokenizedRWA: {
          score: overallScore + (Math.random() - 0.5) * 30,
          drivers: ['market_growth', 'technology_advancement', 'liquidity_improvement'],
        },
        infrastructure: {
          score: overallScore + (Math.random() - 0.5) * 20,
          drivers: ['government_backing', 'esg_focus', 'yield_attraction'],
        },
      },
      newsAnalysis: {
        positiveKeywords: ['adoption', 'growth', 'innovation', 'sustainability', 'yield'],
        negativeKeywords: ['volatility', 'regulation', 'uncertainty', 'risk'],
        emergingThemes: ['institutional_tokenization', 'carbon_credit_integrity', 'rwa_liquidity'],
      },
      investorBehavior: {
        buyingPressure: 40 + Math.random() * 40,
        sellingPressure: 20 + Math.random() * 40,
        volumeTrend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any,
        avgHoldingPeriod: 90 + Math.random() * 180,
      },
      marketPredictions: {
        shortTerm: {
          priceDirection: ['up', 'down', 'sideways'][Math.floor(Math.random() * 3)] as any,
          confidence: 50 + Math.random() * 30,
          keyFactors: ['market_sentiment', 'regulatory_news', 'institutional_flows'],
        },
        mediumTerm: {
          priceDirection: overallScore > 0 ? 'up' : 'down',
          confidence: 40 + Math.random() * 40,
          keyFactors: ['adoption_trends', 'regulatory_clarity', 'market_maturation'],
        },
      },
    };
  }

  private addHistoricalDataPoint(feedType: DataFeedType, dataPoint: HistoricalDataPoint): void {
    const historical = this.historicalData.get(feedType)!;
    historical.push(dataPoint);

    // Maintain cache size limit
    const config = this.configs.get(feedType)!;
    if (historical.length > config.maxCacheSize) {
      historical.splice(0, historical.length - config.maxCacheSize);
    }
  }
}

// ===== EXPORT SINGLETON =====

export const realTimeDataConnector = new RealTimeDataConnector();

// ===== CONVENIENCE FUNCTIONS =====

export function subscribeToFeed(
  feedType: DataFeedType,
  callback: (update: DataFeedUpdate) => void,
  frequency?: UpdateFrequency
): string {
  return realTimeDataConnector.subscribe(feedType, callback, frequency);
}

export function unsubscribeFromFeed(subscriptionId: string): boolean {
  return realTimeDataConnector.unsubscribe(subscriptionId);
}

export function startDataFeeds(): void {
  realTimeDataConnector.start();
}

export function stopDataFeeds(): void {
  realTimeDataConnector.stop();
}