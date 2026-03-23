/**
 * Carbon Pricing Feed Module
 * Milestone 2.1: Real-Time Data Feeds - Carbon Pricing Specialist
 *
 * Provides specialized carbon credit market data simulation and analysis
 */

import { PRICING_INDEX } from '../negotiation-config';
import type { CarbonPricingData } from './types';

export interface CarbonPricingTrend {
  timeframe: '1h' | '4h' | '24h' | '7d' | '30d';
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  confidence: number; // 0-100
  supportLevel: number;
  resistanceLevel: number;
}

export interface CarbonMarketEvent {
  type: 'regulatory_announcement' | 'large_transaction' | 'methodology_update' | 'market_maker_activity';
  impact: 'positive' | 'negative' | 'neutral';
  severity: number; // 0-100
  description: string;
  priceImpact: number; // Price impact in USD/tonne
  timestamp: string;
}

export interface CarbonPricingAnalytics {
  currentData: CarbonPricingData;
  trends: CarbonPricingTrend[];
  marketEvents: CarbonMarketEvent[];
  volatilityAnalysis: {
    currentVolatility: number;
    historicalAverage: number;
    volatilityRank: 'low' | 'medium' | 'high';
    impliedVolatility: number;
  };
  arbitrageOpportunities: Array<{
    marketA: string;
    marketB: string;
    priceDifferential: number;
    opportunitySize: number;
    riskAdjustedReturn: number;
  }>;
}

class CarbonPricingFeed {
  private baseReference: number;
  private marketState: {
    trendDirection: number; // -1 to 1
    volatilityState: number; // 0 to 1
    eventProbability: number; // 0 to 1
    lastEventTime: number;
    priceHistory: Array<{ timestamp: number; price: number }>;
  };

  constructor() {
    this.baseReference = PRICING_INDEX.DMRV_SPOT_REFERENCE;
    this.marketState = {
      trendDirection: 0.1, // Slight upward bias
      volatilityState: 0.15,
      eventProbability: 0.05,
      lastEventTime: Date.now() - 3600000, // 1 hour ago
      priceHistory: [],
    };
  }

  /**
   * Generate carbon pricing data with market simulation
   */
  generatePricingData(timestamp: string): CarbonPricingData {
    const now = Date.now();

    // Update market state based on time evolution
    this.updateMarketState(now);

    // Calculate current prices with market dynamics
    const vcmSpot = this.simulateVCMSpot();
    const forwardRemoval = this.simulateForwardRemoval();
    const dmrvPremium = this.simulateDMRVPremium();

    // Calculate WREI-specific indices
    const baseCarbonPrice = dmrvPremium * PRICING_INDEX.DMRV_SPOT_REFERENCE;
    const wreiPremiumMultiplier = this.calculateWREIPremiumMultiplier();
    const anchorPrice = baseCarbonPrice * wreiPremiumMultiplier;

    // Generate market depth and volatility metrics
    const marketDepth = this.generateMarketDepth(baseCarbonPrice);
    const volatilityMetrics = this.generateVolatilityMetrics();
    const projections = this.generatePriceProjections(baseCarbonPrice);

    // Update price history
    this.marketState.priceHistory.push({
      timestamp: now,
      price: baseCarbonPrice,
    });

    // Maintain history size (24 hours of 5-minute data = 288 points)
    if (this.marketState.priceHistory.length > 288) {
      this.marketState.priceHistory.shift();
    }

    return {
      spot: {
        vcm_spot_reference: vcmSpot,
        forward_removal_reference: forwardRemoval,
        dmrv_premium_benchmark: dmrvPremium,
      },
      indices: {
        base_carbon_price: baseCarbonPrice,
        wrei_premium_multiplier: wreiPremiumMultiplier,
        anchor_price: anchorPrice,
      },
      volatility: volatilityMetrics,
      market_depth: marketDepth,
      projections,
    };
  }

  /**
   * Generate comprehensive analytics for carbon pricing
   */
  generateAnalytics(currentData: CarbonPricingData): CarbonPricingAnalytics {
    return {
      currentData,
      trends: this.analyzeTrends(),
      marketEvents: this.generateMarketEvents(),
      volatilityAnalysis: this.analyzeVolatility(),
      arbitrageOpportunities: this.identifyArbitrageOpportunities(),
    };
  }

  // ===== PRIVATE SIMULATION METHODS =====

  private updateMarketState(currentTime: number): void {
    const timeDelta = (currentTime - (this.marketState.lastEventTime || currentTime)) / (1000 * 60 * 60); // Hours

    // Trend mean reversion with momentum
    this.marketState.trendDirection = this.marketState.trendDirection * 0.98 + (Math.random() - 0.5) * 0.02;

    // Volatility clustering effect
    this.marketState.volatilityState = Math.max(0.05,
      this.marketState.volatilityState * 0.95 + Math.abs(Math.random() - 0.5) * 0.1);

    // Event probability increases with time since last event
    this.marketState.eventProbability = Math.min(0.3, 0.01 + timeDelta * 0.005);
  }

  private simulateVCMSpot(): number {
    const basePrice = PRICING_INDEX.VCM_SPOT_REFERENCE;
    const volatility = this.marketState.volatilityState;
    const trend = this.marketState.trendDirection;

    const randomWalk = (Math.random() - 0.5) * volatility * basePrice;
    const trendComponent = trend * basePrice * 0.001; // Small trend component

    return Math.max(basePrice * 0.5, basePrice + randomWalk + trendComponent);
  }

  private simulateForwardRemoval(): number {
    const basePrice = PRICING_INDEX.FORWARD_REMOVAL_REFERENCE;
    const contango = 1 + Math.random() * 0.1; // Forward premium
    const volatility = this.marketState.volatilityState * 0.5; // Less volatile than spot

    const randomComponent = (Math.random() - 0.5) * volatility * basePrice;

    return Math.max(basePrice * 0.8, basePrice * contango + randomComponent);
  }

  private simulateDMRVPremium(): number {
    const basePremium = PRICING_INDEX.DMRV_PREMIUM_BENCHMARK;

    // dMRV premium tends to be more stable but can spike during verification events
    const stabilityFactor = 0.95 + Math.random() * 0.1; // 95% to 105% of base
    const eventSpike = Math.random() < 0.05 ? (1 + Math.random() * 0.3) : 1; // 5% chance of 30% spike

    return basePremium * stabilityFactor * eventSpike;
  }

  private calculateWREIPremiumMultiplier(): number {
    // WREI premium affected by institutional adoption and market confidence
    const baseMultiplier = 1.85;
    const institutionalDemand = 0.95 + Math.random() * 0.1; // Market demand factor
    const confidenceIndex = 0.9 + this.marketState.trendDirection * 0.2; // Confidence affected by trend

    return baseMultiplier * institutionalDemand * confidenceIndex;
  }

  private generateMarketDepth(currentPrice: number): {
    bid_volume: number;
    ask_volume: number;
    spread_percentage: number;
  } {
    // Market depth simulation with realistic bid-ask dynamics
    const baseVolume = 75000; // Base volume in tonnes
    const marketStress = this.marketState.volatilityState;

    // Higher volatility reduces market depth
    const depthReduction = 1 - marketStress * 0.5;
    const bidVolume = baseVolume * depthReduction * (0.8 + Math.random() * 0.4);
    const askVolume = baseVolume * depthReduction * (0.7 + Math.random() * 0.6);

    // Spread widens with volatility and narrows with depth
    const baseSpread = 0.8; // 0.8% base spread
    const volatilitySpread = marketStress * 2;
    const liquidityAdjustment = Math.min(bidVolume, askVolume) / baseVolume;
    const spreadPercentage = (baseSpread + volatilitySpread) / liquidityAdjustment;

    return {
      bid_volume: Math.round(bidVolume),
      ask_volume: Math.round(askVolume),
      spread_percentage: Math.round(spreadPercentage * 100) / 100,
    };
  }

  private generateVolatilityMetrics(): {
    daily_change_percent: number;
    weekly_change_percent: number;
    volatility_index: number;
  } {
    const recentHistory = this.marketState.priceHistory.slice(-20); // Last 20 data points

    if (recentHistory.length < 2) {
      return {
        daily_change_percent: 0,
        weekly_change_percent: 0,
        volatility_index: this.marketState.volatilityState * 100,
      };
    }

    const currentPrice = recentHistory[recentHistory.length - 1].price;
    const dayAgoPrice = recentHistory[Math.max(0, recentHistory.length - 12)].price; // ~1 hour ago for simulation
    const weekAgoPrice = recentHistory[0].price;

    const dailyChange = ((currentPrice - dayAgoPrice) / dayAgoPrice) * 100;
    const weeklyChange = ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100;

    return {
      daily_change_percent: Math.round(dailyChange * 100) / 100,
      weekly_change_percent: Math.round(weeklyChange * 100) / 100,
      volatility_index: Math.round(this.marketState.volatilityState * 100),
    };
  }

  private generatePriceProjections(currentPrice: number): {
    next_hour: number;
    next_day: number;
    confidence_interval: [number, number];
  } {
    const trendFactor = this.marketState.trendDirection;
    const volatilityFactor = this.marketState.volatilityState;

    // Simple momentum-based projections
    const hourlyChange = trendFactor * 0.005 + (Math.random() - 0.5) * volatilityFactor * 0.02;
    const dailyChange = trendFactor * 0.02 + (Math.random() - 0.5) * volatilityFactor * 0.08;

    const nextHourPrice = currentPrice * (1 + hourlyChange);
    const nextDayPrice = currentPrice * (1 + dailyChange);

    // Confidence interval based on volatility
    const confidenceRange = currentPrice * volatilityFactor * 0.5;
    const lowerBound = currentPrice - confidenceRange;
    const upperBound = currentPrice + confidenceRange;

    return {
      next_hour: Math.round(nextHourPrice * 100) / 100,
      next_day: Math.round(nextDayPrice * 100) / 100,
      confidence_interval: [
        Math.round(lowerBound * 100) / 100,
        Math.round(upperBound * 100) / 100,
      ],
    };
  }

  private analyzeTrends(): CarbonPricingTrend[] {
    const priceHistory = this.marketState.priceHistory;
    if (priceHistory.length < 10) {
      return [];
    }

    const trends: CarbonPricingTrend[] = [];
    const timeframes: Array<{ key: '1h' | '4h' | '24h' | '7d' | '30d'; points: number }> = [
      { key: '1h', points: 12 },   // Last 12 points (~1 hour of 5-min data)
      { key: '4h', points: 48 },   // Last 48 points
      { key: '24h', points: 144 }, // Last 144 points
      { key: '7d', points: 288 },  // All available points (max)
      { key: '30d', points: 288 }, // Same as 7d for simulation
    ];

    timeframes.forEach(({ key, points }) => {
      const relevantData = priceHistory.slice(-Math.min(points, priceHistory.length));
      if (relevantData.length < 3) return;

      const firstPrice = relevantData[0].price;
      const lastPrice = relevantData[relevantData.length - 1].price;
      const priceChange = (lastPrice - firstPrice) / firstPrice;

      // Calculate linear regression slope for trend strength
      const n = relevantData.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = relevantData.reduce((sum, point) => sum + point.price, 0);
      const sumXY = relevantData.reduce((sum, point, index) => sum + index * point.price, 0);
      const sumX2 = relevantData.reduce((sum, _, index) => sum + index * index, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const strength = Math.min(100, Math.abs(slope * 100 / firstPrice));

      trends.push({
        timeframe: key,
        direction: priceChange > 0.01 ? 'bullish' : priceChange < -0.01 ? 'bearish' : 'neutral',
        strength: Math.round(strength),
        confidence: Math.min(90, 50 + strength),
        supportLevel: Math.min(...relevantData.map(p => p.price)),
        resistanceLevel: Math.max(...relevantData.map(p => p.price)),
      });
    });

    return trends;
  }

  private generateMarketEvents(): CarbonMarketEvent[] {
    const events: CarbonMarketEvent[] = [];
    const currentTime = Date.now();

    // Check if we should generate a new market event
    if (Math.random() < this.marketState.eventProbability) {
      const eventTypes: Array<{
        type: CarbonMarketEvent['type'];
        weight: number;
        impactRange: [number, number];
      }> = [
        { type: 'regulatory_announcement', weight: 0.3, impactRange: [-5, 10] },
        { type: 'large_transaction', weight: 0.4, impactRange: [-3, 8] },
        { type: 'methodology_update', weight: 0.2, impactRange: [-2, 15] },
        { type: 'market_maker_activity', weight: 0.1, impactRange: [-1, 3] },
      ];

      const randomValue = Math.random();
      let cumulativeWeight = 0;

      for (const eventType of eventTypes) {
        cumulativeWeight += eventType.weight;
        if (randomValue <= cumulativeWeight) {
          const priceImpact = eventType.impactRange[0] +
            Math.random() * (eventType.impactRange[1] - eventType.impactRange[0]);

          events.push({
            type: eventType.type,
            impact: priceImpact > 2 ? 'positive' : priceImpact < -2 ? 'negative' : 'neutral',
            severity: Math.abs(priceImpact) * 10,
            description: this.generateEventDescription(eventType.type, priceImpact),
            priceImpact: Math.round(priceImpact * 100) / 100,
            timestamp: new Date(currentTime).toISOString(),
          });

          this.marketState.lastEventTime = currentTime;
          this.marketState.eventProbability = 0.01; // Reset event probability
          break;
        }
      }
    }

    return events;
  }

  private generateEventDescription(type: CarbonMarketEvent['type'], impact: number): string {
    const descriptions = {
      regulatory_announcement: [
        'New carbon credit standards proposed by Clean Energy Regulator',
        'ASIC releases updated guidance on carbon credit derivatives trading',
        'Government announces enhanced support for verified carbon projects',
        'International carbon market alignment initiative launched',
      ],
      large_transaction: [
        'Institutional investor acquires 50,000 tonne carbon credit portfolio',
        'Corporate buyer executes major carbon offset purchase agreement',
        'Carbon credit trading desk completes significant arbitrage transaction',
        'Sovereign wealth fund increases carbon credit allocation',
      ],
      methodology_update: [
        'Enhanced dMRV methodology receives international recognition',
        'New satellite monitoring protocol approved for carbon projects',
        'Blockchain verification system integration completed',
        'AI-powered carbon accounting methodology validated',
      ],
      market_maker_activity: [
        'Major market maker adjusts carbon credit pricing spreads',
        'Liquidity provider increases market depth for institutional trades',
        'Trading algorithm optimization reduces transaction costs',
        'Cross-market arbitrage activity normalizes price differentials',
      ],
    };

    const typeDescriptions = descriptions[type];
    const selectedDescription = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];

    const impactDirection = impact > 0 ? 'supporting price appreciation' : 'creating downward pressure';
    return `${selectedDescription}, ${impactDirection}`;
  }

  private analyzeVolatility(): CarbonPricingAnalytics['volatilityAnalysis'] {
    const currentVolatility = this.marketState.volatilityState * 100;
    const historicalAverage = 15; // 15% historical average for carbon markets

    return {
      currentVolatility: Math.round(currentVolatility),
      historicalAverage,
      volatilityRank: currentVolatility > 25 ? 'high' : currentVolatility > 10 ? 'medium' : 'low',
      impliedVolatility: Math.round(currentVolatility * 1.1), // Slightly higher implied vol
    };
  }

  private identifyArbitrageOpportunities(): CarbonPricingAnalytics['arbitrageOpportunities'] {
    // Simulate arbitrage opportunities between different carbon markets
    const opportunities = [];

    if (Math.random() < 0.3) { // 30% chance of arbitrage opportunity
      const markets = [
        'VCM Spot',
        'NSW ESC',
        'EU ETS',
        'California Cap-and-Trade',
        'CORSIA',
      ];

      const marketA = markets[Math.floor(Math.random() * markets.length)];
      let marketB = markets[Math.floor(Math.random() * markets.length)];
      while (marketB === marketA) {
        marketB = markets[Math.floor(Math.random() * markets.length)];
      }

      opportunities.push({
        marketA,
        marketB,
        priceDifferential: 2 + Math.random() * 8, // $2-10 price difference
        opportunitySize: 10000 + Math.random() * 40000, // Volume opportunity
        riskAdjustedReturn: 5 + Math.random() * 15, // 5-20% risk-adjusted return
      });
    }

    return opportunities;
  }
}

// ===== EXPORT SINGLETON =====

export const carbonPricingFeed = new CarbonPricingFeed();