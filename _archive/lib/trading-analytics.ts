/**
 * Trading Analytics Utility Functions
 *
 * Enhanced analytics for trading performance and market intelligence
 * Integrates with existing defence layer logic and professional analytics
 * Phase 3: Enhanced Trading Features
 */

import { NegotiationState } from './types';
import { PRICING_INDEX, NEGOTIATION_CONFIG } from './negotiation-config';

// Trading Performance Metrics
export interface TradingMetrics {
  executionScore: number;
  priceEfficiency: number;
  timeToClose: number;
  riskAdjustedReturn: number;
  marketImpact: number;
  qualityRating: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
}

// Market Context Analysis
export interface MarketContext {
  trendDirection: 'bullish' | 'bearish' | 'neutral';
  volatilityLevel: 'low' | 'medium' | 'high';
  liquidityScore: number;
  competitivePressure: number;
  seasonalFactor: number;
}

// Trading Recommendation
export interface TradingRecommendation {
  action: 'hold' | 'concede' | 'escalate' | 'close';
  confidence: number;
  reasoning: string;
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
  suggestedPrice?: number;
}

// Trade Performance Summary
export interface TradePerformanceSummary {
  totalTrades: number;
  successRate: number;
  averagePrice: number;
  averageDuration: number;
  volumeWeightedPrice: number;
  bestPrice: number;
  worstPrice: number;
  riskMetrics: {
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}

/**
 * Calculate comprehensive trading metrics for a given negotiation state
 */
export function calculateTradingMetrics(negotiationState: NegotiationState): TradingMetrics {
  const { currentOfferPrice, anchorPrice, priceFloor, round, phase } = negotiationState;
  const volume = negotiationState.buyerProfile.volumeInterest || 1000;

  // Execution Score (0-100): Based on price achievement vs. target
  const priceRange = anchorPrice - priceFloor;
  const priceAchievement = Math.max(0, currentOfferPrice - priceFloor) / priceRange;
  const executionScore = Math.round(priceAchievement * 100);

  // Price Efficiency: How well we maintained price vs. market
  const marketPrice = PRICING_INDEX.VCM_SPOT_REFERENCE * PRICING_INDEX.DMRV_PREMIUM_BENCHMARK;
  const priceEfficiency = Math.min(100, Math.round((currentOfferPrice / marketPrice) * 100));

  // Time to Close: Efficiency based on round progression
  const maxRounds = NEGOTIATION_CONFIG.MAX_ROUNDS_BEFORE_ESCALATION || 10;
  const timeEfficiency = phase === 'closure' ?
    Math.round(((maxRounds - round) / maxRounds) * 100) :
    Math.round(((maxRounds - round) / maxRounds) * 50); // Ongoing trades get partial score

  // Risk Adjusted Return: Price achievement adjusted for volume and market conditions
  const volumeWeight = Math.min(1, volume / 10000); // Scale factor for volume
  const marketVolatility = calculateMarketVolatility();
  const riskAdjustedReturn = Math.round((priceAchievement * volumeWeight / marketVolatility) * 100);

  // Market Impact: How much our trade moved the effective market
  const marketImpact = Math.round((volume / 50000) * 100); // Simplified market impact

  // Quality Rating: Overall assessment
  const overallScore = (executionScore + priceEfficiency + timeEfficiency) / 3;
  const qualityRating: TradingMetrics['qualityRating'] =
    overallScore >= 90 ? 'A+' :
    overallScore >= 80 ? 'A' :
    overallScore >= 70 ? 'B+' :
    overallScore >= 60 ? 'B' :
    overallScore >= 50 ? 'C+' : 'C';

  return {
    executionScore,
    priceEfficiency,
    timeToClose: timeEfficiency,
    riskAdjustedReturn,
    marketImpact,
    qualityRating
  };
}

/**
 * Analyze current market context for trading decisions
 */
export function analyzeMarketContext(): MarketContext {
  // Simulate market analysis based on pricing indices
  const vcmTrend = Math.random() - 0.5; // Simplified trend calculation
  const volatility = Math.random() * 0.3; // 0-30% volatility

  return {
    trendDirection: vcmTrend > 0.1 ? 'bullish' : vcmTrend < -0.1 ? 'bearish' : 'neutral',
    volatilityLevel: volatility > 0.2 ? 'high' : volatility > 0.1 ? 'medium' : 'low',
    liquidityScore: Math.round((0.7 + Math.random() * 0.3) * 100), // 70-100% liquidity
    competitivePressure: Math.round(Math.random() * 100),
    seasonalFactor: Math.round((1 + Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 365)) * 0.2) * 100)
  };
}

/**
 * Generate trading recommendation based on current state and market context
 */
export function generateTradingRecommendation(
  negotiationState: NegotiationState,
  marketContext?: MarketContext
): TradingRecommendation {
  const { currentOfferPrice, anchorPrice, priceFloor, round, phase } = negotiationState;
  const context = marketContext || analyzeMarketContext();

  const priceRatio = currentOfferPrice / anchorPrice;
  const roundProgress = round / (NEGOTIATION_CONFIG.MAX_ROUNDS_BEFORE_ESCALATION || 10);

  // Decision logic based on price position, round progress, and market context
  let action: TradingRecommendation['action'] = 'hold';
  let confidence = 50;
  let reasoning = '';
  let expectedOutcome = '';
  let riskLevel: TradingRecommendation['riskLevel'] = 'medium';
  let suggestedPrice: number | undefined;

  if (phase === 'closure') {
    action = 'close';
    confidence = 95;
    reasoning = 'Trade has reached closure phase';
    expectedOutcome = 'Successful trade completion';
    riskLevel = 'low';
  } else if (phase === 'escalation') {
    action = 'escalate';
    confidence = 80;
    reasoning = 'Price negotiations have reached impasse';
    expectedOutcome = 'Potential trade failure or breakthrough';
    riskLevel = 'high';
  } else if (currentOfferPrice <= priceFloor * 1.02) {
    action = 'hold';
    confidence = 85;
    reasoning = 'Price near floor - maintain position';
    expectedOutcome = 'Protect minimum acceptable return';
    riskLevel = 'high';
  } else if (priceRatio > 0.9 && roundProgress < 0.5) {
    action = 'hold';
    confidence = 75;
    reasoning = 'Strong price position with time remaining';
    expectedOutcome = 'Maintain premium pricing';
    riskLevel = 'low';
  } else if (context.trendDirection === 'bearish' && roundProgress > 0.7) {
    action = 'concede';
    confidence = 70;
    reasoning = 'Market trend bearish, late in negotiation';
    expectedOutcome = 'Close trade before further price decline';
    riskLevel = 'medium';
    suggestedPrice = Math.max(priceFloor, currentOfferPrice * 0.97);
  } else if (context.volatilityLevel === 'high' && priceRatio > 0.85) {
    action = 'close';
    confidence = 80;
    reasoning = 'High volatility, good price achieved';
    expectedOutcome = 'Secure gains in uncertain market';
    riskLevel = 'medium';
  } else {
    action = 'hold';
    confidence = 60;
    reasoning = 'Continue current trading strategy';
    expectedOutcome = 'Gradual price improvement expected';
    riskLevel = 'medium';
  }

  return {
    action,
    confidence,
    reasoning,
    expectedOutcome,
    riskLevel,
    suggestedPrice
  };
}

/**
 * Calculate historical trading performance summary
 */
export function calculateTradePerformanceSummary(trades: Array<{
  price: number;
  volume: number;
  duration: number;
  success: boolean;
}>): TradePerformanceSummary {
  const totalTrades = trades.length;
  const successfulTrades = trades.filter(t => t.success);
  const successRate = totalTrades > 0 ? (successfulTrades.length / totalTrades) * 100 : 0;

  const prices = successfulTrades.map(t => t.price);
  const volumes = successfulTrades.map(t => t.volume);
  const durations = trades.map(t => t.duration);

  const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  // Volume Weighted Average Price
  const totalValue = successfulTrades.reduce((acc, t) => acc + (t.price * t.volume), 0);
  const totalVolume = volumes.reduce((a, b) => a + b, 0);
  const volumeWeightedPrice = totalVolume > 0 ? totalValue / totalVolume : 0;

  const bestPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const worstPrice = prices.length > 0 ? Math.min(...prices) : 0;

  // Risk Metrics
  const returns = prices.map(price => (price - averagePrice) / averagePrice);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(returns.reduce((acc, r) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length);
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

  const maxDrawdown = calculateMaxDrawdown(prices);
  const winRate = successRate;

  return {
    totalTrades,
    successRate,
    averagePrice,
    averageDuration,
    volumeWeightedPrice,
    bestPrice,
    worstPrice,
    riskMetrics: {
      sharpeRatio,
      maxDrawdown,
      winRate
    }
  };
}

/**
 * Calculate market volatility based on price movements
 */
function calculateMarketVolatility(): number {
  // Simplified volatility calculation
  // In production, this would use historical price data
  const baseVolatility = 0.15; // 15% base volatility
  const randomFactor = Math.random() * 0.1; // +/- 10% random variation
  return baseVolatility + (Math.random() - 0.5) * randomFactor;
}

/**
 * Calculate maximum drawdown from price series
 */
function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;

  let maxDrawdown = 0;
  let peak = prices[0];

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    } else {
      const drawdown = (peak - prices[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }

  return maxDrawdown * 100; // Return as percentage
}

/**
 * Calculate optimal pricing strategy based on market conditions
 */
export function calculateOptimalPricing(
  basePrice: number,
  volume: number,
  marketContext: MarketContext
): {
  optimalPrice: number;
  priceRange: { min: number; max: number };
  confidence: number;
  strategy: string;
} {
  let adjustment = 1.0;
  let strategy = 'baseline';

  // Market trend adjustment
  if (marketContext.trendDirection === 'bullish') {
    adjustment *= 1.05; // 5% premium in bull market
    strategy = 'premium pricing';
  } else if (marketContext.trendDirection === 'bearish') {
    adjustment *= 0.97; // 3% discount in bear market
    strategy = 'competitive pricing';
  }

  // Volatility adjustment
  if (marketContext.volatilityLevel === 'high') {
    adjustment *= 1.03; // 3% volatility premium
    strategy += ' + volatility premium';
  }

  // Volume scaling
  const volumeMultiplier = volume > 10000 ? 0.98 : volume < 1000 ? 1.02 : 1.0;
  adjustment *= volumeMultiplier;

  const optimalPrice = basePrice * adjustment;
  const priceRange = {
    min: optimalPrice * 0.95,
    max: optimalPrice * 1.05
  };

  // Confidence based on market stability
  const confidence = marketContext.volatilityLevel === 'low' ? 85 :
                    marketContext.volatilityLevel === 'medium' ? 70 : 55;

  return {
    optimalPrice,
    priceRange,
    confidence,
    strategy
  };
}

const tradingAnalytics = {
  calculateTradingMetrics,
  analyzeMarketContext,
  generateTradingRecommendation,
  calculateTradePerformanceSummary,
  calculateOptimalPricing
};

export default tradingAnalytics;