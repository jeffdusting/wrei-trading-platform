/**
 * Data Feeds Types and Interfaces
 * Milestone 2.1: Real-Time Data Feeds
 *
 * Defines subscription-based data feed architecture for institutional platform
 */

// ===== CORE FEED TYPES =====

export type DataFeedType =
  | 'carbon_pricing'
  | 'rwa_market'
  | 'regulatory_alerts'
  | 'market_sentiment';

export type DataFeedStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export type UpdateFrequency =
  | 'real_time'    // ~1 second intervals
  | 'high'         // ~30 second intervals
  | 'medium'       // ~5 minute intervals
  | 'low'          // ~30 minute intervals
  | 'daily';       // Once per day

// ===== SUBSCRIPTION MANAGEMENT =====

export interface DataFeedSubscription {
  id: string;
  feedType: DataFeedType;
  callback: (update: DataFeedUpdate) => void;
  frequency: UpdateFrequency;
  isActive: boolean;
  subscribedAt: string; // ISO timestamp
  lastUpdate: string | null; // ISO timestamp
}

export interface DataFeedUpdate {
  feedType: DataFeedType;
  timestamp: string; // ISO timestamp
  data: CarbonPricingData | RWAMarketData | RegulatoryAlertsData | MarketSentimentData;
  sequence: number; // Incremental update counter
  source: string; // Data source identifier
}

// ===== CARBON PRICING FEED =====
// Extends existing PRICING_INDEX structure from negotiation-config.ts

export interface CarbonPricingData {
  spot: {
    vcm_spot_reference: number;      // Current VCM spot price (Sylvera EM SOVCM 2025)
    forward_removal_reference: number; // Forward removal price (Sylvera SOCC 2025)
    dmrv_premium_benchmark: number;  // Premium for dMRV credits
  };
  indices: {
    base_carbon_price: number;       // WREI Pricing Index base
    wrei_premium_multiplier: number; // WREI premium factor
    anchor_price: number;            // Current anchor for negotiations
  };
  volatility: {
    daily_change_percent: number;    // 24h price change
    weekly_change_percent: number;   // 7d price change
    volatility_index: number;        // Market volatility measure (0-100)
  };
  market_depth: {
    bid_volume: number;              // Total bid volume (tonnes)
    ask_volume: number;              // Total ask volume (tonnes)
    spread_percentage: number;       // Bid-ask spread %
  };
  projections: {
    next_hour: number;               // Projected price +1 hour
    next_day: number;                // Projected price +24 hours
    confidence_interval: [number, number]; // [lower, upper] 95% CI
  };
}

// ===== RWA MARKET FEED =====
// Extends TokenizedRWAMarketContext from market-intelligence.ts

export interface RWAMarketData {
  totalMarketValue: number;          // Total tokenized RWA market size (A$)
  growthRate: number;                // Year-over-year growth %
  marketSegments: {
    realEstate: {
      value: number;                 // Market segment value (A$)
      growthRate: number;            // Segment growth %
      topAssets: Array<{
        name: string;
        value: number;
        yieldRate: number;
      }>;
    };
    privateEquity: {
      value: number;
      growthRate: number;
      topAssets: Array<{
        name: string;
        value: number;
        yieldRate: number;
      }>;
    };
    infrastructure: {
      value: number;
      growthRate: number;
      topAssets: Array<{
        name: string;
        value: number;
        yieldRate: number;
      }>;
    };
    commodities: {
      value: number;
      growthRate: number;
      topAssets: Array<{
        name: string;
        value: number;
        yieldRate: number;
      }>;
    };
  };
  liquidityMetrics: {
    dailyTradingVolume: number;      // A$ volume last 24h
    averageTradeSize: number;        // Average transaction size
    activeTokens: number;            // Number of actively traded tokens
  };
  yieldData: {
    averageYield: number;            // Market-wide average yield %
    yieldRange: [number, number];    // [min, max] yield range
    riskAdjustedYield: number;       // Risk-adjusted market yield %
  };
}

// ===== REGULATORY ALERTS FEED =====
// Integrates with existing compliance framework

export interface RegulatoryAlertsData {
  activeAlerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'afsl' | 'aml_ctf' | 'environmental' | 'tax' | 'disclosure';
    title: string;
    description: string;
    jurisdiction: string;
    effectiveDate: string; // ISO date
    actionRequired: boolean;
    relatedRegulations: string[]; // Regulation references
  }>;
  complianceUpdates: Array<{
    id: string;
    updateType: 'threshold_change' | 'new_requirement' | 'exemption_change' | 'guidance_update';
    title: string;
    summary: string;
    impactLevel: 'low' | 'medium' | 'high';
    applicableEntityTypes: string[];
    implementationDeadline: string | null; // ISO date
  }>;
  jurisdictionalChanges: Array<{
    jurisdiction: string;
    changeType: 'new_regulation' | 'amendment' | 'repeal' | 'guidance';
    title: string;
    description: string;
    impactAssessment: string;
  }>;
}

// ===== MARKET SENTIMENT FEED =====
// Provides AI-powered market sentiment analysis

export interface MarketSentimentData {
  overallSentiment: {
    score: number;                   // Sentiment score (-100 to +100)
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;              // Confidence level (0-100)
  };
  sectorSentiment: {
    carbonCredits: {
      score: number;
      drivers: string[];             // Key sentiment drivers
    };
    tokenizedRWA: {
      score: number;
      drivers: string[];
    };
    infrastructure: {
      score: number;
      drivers: string[];
    };
  };
  newsAnalysis: {
    positiveKeywords: string[];      // Trending positive terms
    negativeKeywords: string[];      // Trending negative terms
    emergingThemes: string[];        // New market themes
  };
  investorBehavior: {
    buyingPressure: number;          // Buying pressure indicator (0-100)
    sellingPressure: number;         // Selling pressure indicator (0-100)
    volumeTrend: 'increasing' | 'stable' | 'decreasing';
    avgHoldingPeriod: number;        // Average holding period (days)
  };
  marketPredictions: {
    shortTerm: {                     // Next 24-48 hours
      priceDirection: 'up' | 'down' | 'sideways';
      confidence: number;
      keyFactors: string[];
    };
    mediumTerm: {                    // Next 1-4 weeks
      priceDirection: 'up' | 'down' | 'sideways';
      confidence: number;
      keyFactors: string[];
    };
  };
}

// ===== FEED CONFIGURATION =====

export interface DataFeedConfig {
  feedType: DataFeedType;
  enabled: boolean;
  updateFrequency: UpdateFrequency;
  retryAttempts: number;
  retryDelayMs: number;
  maxCacheSize: number;            // Max historical data points to keep
  cacheTTL: number;                // Cache time-to-live in milliseconds
  simulationParams?: {             // For demo simulation
    volatility: number;            // Volatility factor for price changes
    trendBias: number;             // Trend bias (-1 to +1)
    eventFrequency: number;        // Frequency of market events (0-1)
  };
}

export interface DataFeedStats {
  feedType: DataFeedType;
  status: DataFeedStatus;
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  lastUpdateTime: string | null;
  averageUpdateLatency: number;    // Average update time in ms
  currentSubscribers: number;
  dataPointsCached: number;
}

// ===== HISTORICAL DATA =====

export type TimeRange =
  | '1h'  | '4h'  | '12h'  | '24h'
  | '3d'  | '7d'  | '30d'  | '90d'
  | '1y'  | '2y'  | '5y';

export interface HistoricalDataPoint {
  timestamp: string; // ISO timestamp
  data: CarbonPricingData | RWAMarketData | RegulatoryAlertsData | MarketSentimentData;
}

export interface HistoricalDataRequest {
  feedType: DataFeedType;
  timeRange: TimeRange;
  resolution?: 'minute' | 'hour' | 'day' | 'week'; // Data point granularity
  maxPoints?: number; // Maximum data points to return
}

export interface HistoricalDataResponse {
  feedType: DataFeedType;
  timeRange: TimeRange;
  dataPoints: HistoricalDataPoint[];
  totalPoints: number;
  fromTime: string; // ISO timestamp
  toTime: string;   // ISO timestamp
}

// ===== ERROR HANDLING =====

export interface DataFeedError {
  code: string;
  message: string;
  feedType: DataFeedType;
  timestamp: string;
  retryable: boolean;
  details?: Record<string, any>;
}

export type DataFeedEventType =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'data_update'
  | 'subscription_added'
  | 'subscription_removed';

export interface DataFeedEvent {
  type: DataFeedEventType;
  feedType: DataFeedType;
  timestamp: string;
  data?: any;
}

// ===== CONNECTOR INTERFACE =====
// Main interface for the RealTimeDataConnector class

export interface IDataFeedConnector {
  // Subscription management
  subscribe(
    feedType: DataFeedType,
    callback: (update: DataFeedUpdate) => void,
    frequency?: UpdateFrequency
  ): string; // Returns subscription ID

  unsubscribe(subscriptionId: string): boolean;

  // Data retrieval
  getLatestData(feedType: DataFeedType): DataFeedUpdate | null;

  getHistoricalData(request: HistoricalDataRequest): Promise<HistoricalDataResponse>;

  // Status and management
  getStats(feedType: DataFeedType): DataFeedStats;

  getAllStats(): Record<DataFeedType, DataFeedStats>;

  getFeedStatus(feedType: DataFeedType): DataFeedStatus;

  // Configuration
  updateConfig(feedType: DataFeedType, config: Partial<DataFeedConfig>): void;

  getConfig(feedType: DataFeedType): DataFeedConfig;

  // Lifecycle
  start(): void;

  stop(): void;

  restart(): void;
}