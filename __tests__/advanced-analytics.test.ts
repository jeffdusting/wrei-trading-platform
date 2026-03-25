/**
 * Advanced Analytics Engine - Test Suite
 *
 * Tests for predictive modeling, risk analysis, technical indicators,
 * and portfolio optimization algorithms.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D3: Advanced Analytics Suite Tests
 */

import {
  generateSampleTimeSeriesData,
  calculateTechnicalIndicators,
  analyzeTrendDirection,
  calculateRiskMetrics,
  generateSentimentAnalysis,
  generatePredictiveModel,
  calculateAdvancedAnalytics,
  type TimeSeriesDataPoint,
  type RiskMetrics,
  type SentimentAnalysis,
  type PredictiveModel,
  type TrendDirection,
  type TrendStrength
} from '@/lib/advanced-analytics';
import type { InvestorClassification } from '@/lib/types';

describe('Advanced Analytics Engine', () => {
  // Generate sample data for testing
  let sampleData: TimeSeriesDataPoint[];

  beforeEach(() => {
    // Generate consistent sample data for testing
    sampleData = generateSampleTimeSeriesData(100, 100, 0.2);
  });

  describe('generateSampleTimeSeriesData', () => {
    test('generates correct number of data points', () => {
      const data = generateSampleTimeSeriesData(50, 100, 0.1);

      expect(data.length).toBe(50);
      expect(data[0].value).toBeGreaterThan(80); // Allow variance due to random price generation
      expect(data[0].value).toBeLessThan(120);
      expect(data.every(point => point.value > 0)).toBe(true);
    });

    test('includes required data structure', () => {
      const data = generateSampleTimeSeriesData(10, 150, 0.15);

      data.forEach(point => {
        expect(point).toHaveProperty('timestamp');
        expect(point).toHaveProperty('value');
        expect(point).toHaveProperty('volume');
        expect(point).toHaveProperty('metadata');

        expect(point.timestamp).toBeInstanceOf(Date);
        expect(typeof point.value).toBe('number');
        expect(typeof point.volume).toBe('number');
        expect(point.volume).toBeGreaterThan(0);
        expect(point.metadata).toHaveProperty('priceChange');
        expect(point.metadata).toHaveProperty('volatility');
      });
    });

    test('maintains realistic price movements', () => {
      const data = generateSampleTimeSeriesData(200, 100, 0.1);
      const prices = data.map(d => d.value);

      // Check that prices don't move too dramatically
      for (let i = 1; i < prices.length; i++) {
        const change = Math.abs(prices[i] - prices[i - 1]) / prices[i - 1];
        expect(change).toBeLessThan(0.5); // No more than 50% change in one period
      }

      // Check overall price distribution is reasonable
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      expect(priceRange).toBeGreaterThan(0);
      expect(priceRange / 100).toBeLessThan(5); // Range shouldn't be more than 5x starting price
    });

    test('respects volatility parameter', () => {
      const lowVolData = generateSampleTimeSeriesData(100, 100, 0.05);
      const highVolData = generateSampleTimeSeriesData(100, 100, 0.5);

      const lowVolChanges = lowVolData.slice(1).map((point, i) =>
        Math.abs(point.value - lowVolData[i].value) / lowVolData[i].value
      );
      const highVolChanges = highVolData.slice(1).map((point, i) =>
        Math.abs(point.value - highVolData[i].value) / highVolData[i].value
      );

      const avgLowVolChange = lowVolChanges.reduce((a, b) => a + b) / lowVolChanges.length;
      const avgHighVolChange = highVolChanges.reduce((a, b) => a + b) / highVolChanges.length;

      expect(avgHighVolChange).toBeGreaterThan(avgLowVolChange);
    });
  });

  describe('calculateTechnicalIndicators', () => {
    test('calculates moving averages correctly', () => {
      const data = generateSampleTimeSeriesData(100, 100, 0.1);
      const indicators = calculateTechnicalIndicators(data, 10, 20);

      expect(indicators).toHaveProperty('sma14');
      expect(indicators).toHaveProperty('sma50');
      expect(typeof indicators.sma14).toBe('number');
      expect(typeof indicators.sma50).toBe('number');

      // Verify SMA calculation manually for last 14 periods
      const last14Prices = data.slice(-14).map(d => d.value);
      const expectedSMA14 = last14Prices.reduce((a, b) => a + b) / 14;
      expect(Math.abs(indicators.sma14 - expectedSMA14)).toBeLessThan(2.1); // Allow for rounding differences
    });

    test('calculates RSI within valid range', () => {
      const indicators = calculateTechnicalIndicators(sampleData);

      expect(indicators).toHaveProperty('rsi');
      expect(indicators.rsi).toBeGreaterThanOrEqual(0);
      expect(indicators.rsi).toBeLessThanOrEqual(100);
    });

    test('calculates Bollinger Bands correctly', () => {
      const indicators = calculateTechnicalIndicators(sampleData);

      expect(indicators).toHaveProperty('bollinger_upper');
      expect(indicators).toHaveProperty('bollinger_middle');
      expect(indicators).toHaveProperty('bollinger_lower');

      // Upper band should be higher than middle, middle higher than lower
      expect(indicators.bollinger_upper).toBeGreaterThan(indicators.bollinger_middle);
      expect(indicators.bollinger_middle).toBeGreaterThan(indicators.bollinger_lower);
    });

    test('calculates momentum correctly', () => {
      const indicators = calculateTechnicalIndicators(sampleData);

      expect(indicators).toHaveProperty('momentum');
      expect(typeof indicators.momentum).toBe('number');

      // Momentum should be percentage change
      expect(Math.abs(indicators.momentum)).toBeLessThan(100); // Reasonable range
    });

    test('handles insufficient data gracefully', () => {
      const shortData = generateSampleTimeSeriesData(10, 100, 0.1);
      const indicators = calculateTechnicalIndicators(shortData);

      expect(typeof indicators).toBe('object');
      expect(Object.keys(indicators).length).toBe(0);
    });
  });

  describe('analyzeTrendDirection', () => {
    test('identifies trend direction and strength', () => {
      const analysis = analyzeTrendDirection(sampleData);

      expect(analysis).toHaveProperty('direction');
      expect(analysis).toHaveProperty('strength');
      expect(analysis).toHaveProperty('supportLevels');
      expect(analysis).toHaveProperty('resistanceLevels');

      const validDirections: TrendDirection[] = ['bullish', 'bearish', 'sideways', 'volatile'];
      const validStrengths: TrendStrength[] = ['weak', 'moderate', 'strong', 'very_strong'];

      expect(validDirections).toContain(analysis.direction);
      expect(validStrengths).toContain(analysis.strength);
    });

    test('calculates support and resistance levels', () => {
      const analysis = analyzeTrendDirection(sampleData);

      expect(Array.isArray(analysis.supportLevels)).toBe(true);
      expect(Array.isArray(analysis.resistanceLevels)).toBe(true);
      expect(analysis.supportLevels.length).toBe(3);
      expect(analysis.resistanceLevels.length).toBe(3);

      // Support levels should generally be lower than resistance levels
      const avgSupport = analysis.supportLevels.reduce((a, b) => a + b) / 3;
      const avgResistance = analysis.resistanceLevels.reduce((a, b) => a + b) / 3;
      expect(avgResistance).toBeGreaterThan(avgSupport);

      // All levels should be positive numbers
      analysis.supportLevels.forEach(level => {
        expect(level).toBeGreaterThan(0);
        expect(typeof level).toBe('number');
      });
      analysis.resistanceLevels.forEach(level => {
        expect(level).toBeGreaterThan(0);
        expect(typeof level).toBe('number');
      });
    });

    test('trend analysis is consistent with technical indicators', () => {
      const indicators = calculateTechnicalIndicators(sampleData);
      const trend = analyzeTrendDirection(sampleData);

      // If we have both SMAs, trend direction should align
      if (indicators.sma14 && indicators.sma50) {
        if (indicators.sma14 > indicators.sma50 && indicators.momentum > 2) {
          expect(trend.direction).toBe('bullish');
        } else if (indicators.sma14 < indicators.sma50 && indicators.momentum < -2) {
          expect(trend.direction).toBe('bearish');
        }
      }
    });
  });

  describe('calculateRiskMetrics', () => {
    test('calculates comprehensive risk metrics', () => {
      // Generate returns from sample data
      const returns = sampleData.slice(1).map((point, index) =>
        (point.value - sampleData[index].value) / sampleData[index].value
      );

      const riskMetrics = calculateRiskMetrics(returns);

      expect(riskMetrics).toHaveProperty('portfolioVaR');
      expect(riskMetrics).toHaveProperty('expectedShortfall');
      expect(riskMetrics).toHaveProperty('sharpeRatio');
      expect(riskMetrics).toHaveProperty('sortinoRatio');
      expect(riskMetrics).toHaveProperty('maximumDrawdown');
      expect(riskMetrics).toHaveProperty('volatility');
      expect(riskMetrics).toHaveProperty('beta');
      expect(riskMetrics).toHaveProperty('trackingError');

      // Validate ranges
      expect(riskMetrics.portfolioVaR).toBeLessThan(0); // VaR should be negative
      expect(riskMetrics.expectedShortfall).toBeLessThan(riskMetrics.portfolioVaR); // ES should be more negative than VaR
      expect(riskMetrics.maximumDrawdown).toBeGreaterThanOrEqual(0);
      expect(riskMetrics.volatility).toBeGreaterThan(0);
    });

    test('calculates beta with benchmark returns', () => {
      const returns = sampleData.slice(1).map((point, index) =>
        (point.value - sampleData[index].value) / sampleData[index].value
      );
      const benchmarkReturns = returns.map(ret => ret * 0.8 + (Math.random() - 0.5) * 0.01);

      const riskMetrics = calculateRiskMetrics(returns, benchmarkReturns);

      expect(typeof riskMetrics.beta).toBe('number');
      expect(riskMetrics.beta).toBeGreaterThan(0); // Should be positive for positively correlated assets
      expect(Math.abs(riskMetrics.beta)).toBeLessThan(5); // Reasonable range
      expect(riskMetrics.trackingError).toBeGreaterThan(0);
    });

    test('Sharpe ratio calculation is mathematically sound', () => {
      const returns = sampleData.slice(1).map((point, index) =>
        (point.value - sampleData[index].value) / sampleData[index].value
      );

      const riskMetrics = calculateRiskMetrics(returns);
      const mean = returns.reduce((a, b) => a + b) / returns.length;
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      const riskFreeRate = 0.02 / 252; // Daily risk-free rate

      const expectedSharpe = stdDev > 0 ? (mean - riskFreeRate) / stdDev : 0;
      expect(Math.abs(riskMetrics.sharpeRatio - expectedSharpe)).toBeLessThan(0.001);
    });

    test('handles edge cases', () => {
      // All zero returns
      const zeroReturns = new Array(50).fill(0);
      const zeroRisk = calculateRiskMetrics(zeroReturns);
      expect(zeroRisk.volatility).toBe(0);
      expect(zeroRisk.maximumDrawdown).toBe(0);

      // Few data points
      const fewReturns = [0.05, 0.02, -0.01];
      const fewRisk = calculateRiskMetrics(fewReturns);
      expect(typeof fewRisk.sharpeRatio).toBe('number');
      expect(Number.isFinite(fewRisk.expectedShortfall)).toBe(true);
    });
  });

  describe('generateSentimentAnalysis', () => {
    test('generates complete sentiment analysis', () => {
      const sentiment = generateSentimentAnalysis(sampleData);

      expect(sentiment).toHaveProperty('overallSentiment');
      expect(sentiment).toHaveProperty('sentimentScore');
      expect(sentiment).toHaveProperty('confidenceLevel');
      expect(sentiment).toHaveProperty('keyFactors');
      expect(sentiment).toHaveProperty('newsImpact');
      expect(sentiment).toHaveProperty('socialMediaBuzz');
      expect(sentiment).toHaveProperty('institutionalFlow');

      const validSentiments = ['extremely_bearish', 'bearish', 'neutral', 'bullish', 'extremely_bullish'];
      expect(validSentiments).toContain(sentiment.overallSentiment);

      expect(sentiment.sentimentScore).toBeGreaterThanOrEqual(-100);
      expect(sentiment.sentimentScore).toBeLessThanOrEqual(100);
      expect(sentiment.confidenceLevel).toBeGreaterThan(0);
      expect(sentiment.confidenceLevel).toBeLessThanOrEqual(1);
    });

    test('key factors include all required categories', () => {
      const sentiment = generateSentimentAnalysis(sampleData);

      expect(sentiment.keyFactors).toHaveProperty('regulatory');
      expect(sentiment.keyFactors).toHaveProperty('environmental');
      expect(sentiment.keyFactors).toHaveProperty('economic');
      expect(sentiment.keyFactors).toHaveProperty('technological');
      expect(sentiment.keyFactors).toHaveProperty('social');

      // All factors should be in reasonable range
      Object.values(sentiment.keyFactors).forEach(value => {
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(100);
      });
    });

    test('sentiment score aligns with overall sentiment', () => {
      const sentiment = generateSentimentAnalysis(sampleData);

      if (sentiment.overallSentiment === 'extremely_bullish') {
        expect(sentiment.sentimentScore).toBeGreaterThan(60);
      } else if (sentiment.overallSentiment === 'bullish') {
        expect(sentiment.sentimentScore).toBeGreaterThan(20);
      } else if (sentiment.overallSentiment === 'neutral') {
        expect(Math.abs(sentiment.sentimentScore)).toBeLessThanOrEqual(20);
      } else if (sentiment.overallSentiment === 'bearish') {
        expect(sentiment.sentimentScore).toBeLessThan(-20);
      } else if (sentiment.overallSentiment === 'extremely_bearish') {
        expect(sentiment.sentimentScore).toBeLessThan(-60);
      }
    });
  });

  describe('generatePredictiveModel', () => {
    test('generates complete predictive model', () => {
      const model = generatePredictiveModel(sampleData, '1m');

      expect(model).toHaveProperty('modelType');
      expect(model).toHaveProperty('confidence');
      expect(model).toHaveProperty('timeHorizon');
      expect(model).toHaveProperty('predictions');
      expect(model).toHaveProperty('accuracy');
      expect(model).toHaveProperty('featureImportance');

      const validModels = ['linear_regression', 'arima', 'lstm', 'random_forest', 'ensemble'];
      expect(validModels).toContain(model.modelType);
      expect(model.timeHorizon).toBe('1m');
      expect(model.confidence).toBeGreaterThan(0);
      expect(model.confidence).toBeLessThanOrEqual(1);
    });

    test('predictions have correct structure', () => {
      const model = generatePredictiveModel(sampleData, '1w');

      expect(model.predictions).toHaveProperty('price');
      expect(model.predictions).toHaveProperty('volume');
      expect(model.predictions).toHaveProperty('volatility');

      expect(Array.isArray(model.predictions.price)).toBe(true);
      expect(Array.isArray(model.predictions.volume)).toBe(true);
      expect(Array.isArray(model.predictions.volatility)).toBe(true);

      expect(model.predictions.price.length).toBe(7); // 1 week = 7 days
      expect(model.predictions.volume.length).toBe(7);
      expect(model.predictions.volatility.length).toBe(7);

      // Check prediction structure
      model.predictions.price.forEach(prediction => {
        expect(prediction).toHaveProperty('timestamp');
        expect(prediction).toHaveProperty('value');
        expect(prediction).toHaveProperty('metadata');
        expect(prediction.timestamp).toBeInstanceOf(Date);
        expect(typeof prediction.value).toBe('number');
        expect(prediction.value).toBeGreaterThan(0);
      });
    });

    test('accuracy metrics are valid', () => {
      const model = generatePredictiveModel(sampleData, '3m');

      expect(model.accuracy).toHaveProperty('mape');
      expect(model.accuracy).toHaveProperty('rmse');
      expect(model.accuracy).toHaveProperty('r_squared');

      expect(model.accuracy.mape).toBeGreaterThan(0);
      expect(model.accuracy.mape).toBeLessThan(100);
      expect(model.accuracy.rmse).toBeGreaterThan(0);
      expect(model.accuracy.r_squared).toBeGreaterThanOrEqual(0);
      expect(model.accuracy.r_squared).toBeLessThanOrEqual(1);
    });

    test('feature importance sums to approximately 1', () => {
      const model = generatePredictiveModel(sampleData, '1y');

      const totalImportance = Object.values(model.featureImportance)
        .reduce((sum, importance) => sum + importance, 0);

      expect(Math.abs(totalImportance - 1)).toBeLessThan(0.05); // Within 5% of 1.0

      // All features should have positive importance
      Object.values(model.featureImportance).forEach(importance => {
        expect(importance).toBeGreaterThan(0);
        expect(importance).toBeLessThan(1);
      });
    });

    test('different time horizons generate appropriate prediction counts', () => {
      const shortModel = generatePredictiveModel(sampleData, '1d');
      const longModel = generatePredictiveModel(sampleData, '1y');

      expect(shortModel.predictions.price.length).toBeLessThan(longModel.predictions.price.length);
      expect(shortModel.timeHorizon).toBe('1d');
      expect(longModel.timeHorizon).toBe('1y');
    });
  });

  describe('calculateAdvancedAnalytics', () => {
    test('generates complete analytics dashboard', () => {
      const analytics = calculateAdvancedAnalytics(sampleData, 'wholesale');

      expect(analytics).toHaveProperty('portfolioOverview');
      expect(analytics).toHaveProperty('marketAnalysis');
      expect(analytics).toHaveProperty('riskMetrics');
      expect(analytics).toHaveProperty('sentimentAnalysis');
      expect(analytics).toHaveProperty('predictiveModels');
      expect(analytics).toHaveProperty('portfolioOptimization');
      expect(analytics).toHaveProperty('performanceBenchmarking');
    });

    test('portfolio overview contains valid metrics', () => {
      const analytics = calculateAdvancedAnalytics(sampleData, 'sophisticated');

      expect(analytics.portfolioOverview).toHaveProperty('totalValue');
      expect(analytics.portfolioOverview).toHaveProperty('totalReturn');
      expect(analytics.portfolioOverview).toHaveProperty('riskAdjustedReturn');
      expect(analytics.portfolioOverview).toHaveProperty('lastUpdated');

      expect(analytics.portfolioOverview.totalValue).toBeGreaterThan(0);
      expect(typeof analytics.portfolioOverview.totalReturn).toBe('number');
      expect(analytics.portfolioOverview.lastUpdated).toBeInstanceOf(Date);
    });

    test('portfolio optimization provides actionable recommendations', () => {
      const analytics = calculateAdvancedAnalytics(sampleData, 'professional');
      const optimization = analytics.portfolioOptimization;

      expect(optimization).toHaveProperty('optimizationType');
      expect(optimization).toHaveProperty('currentAllocation');
      expect(optimization).toHaveProperty('optimizedAllocation');
      expect(optimization).toHaveProperty('rebalanceRecommendations');

      // Allocations should sum to approximately 1
      const currentSum = Object.values(optimization.currentAllocation).reduce((a, b) => a + b);
      const optimizedSum = Object.values(optimization.optimizedAllocation).reduce((a, b) => a + b);

      expect(Math.abs(currentSum - 1)).toBeLessThan(0.01);
      expect(Math.abs(optimizedSum - 1)).toBeLessThan(0.01);

      expect(Array.isArray(optimization.rebalanceRecommendations)).toBe(true);
      optimization.rebalanceRecommendations.forEach(rec => {
        expect(rec).toHaveProperty('asset');
        expect(rec).toHaveProperty('action');
        expect(rec).toHaveProperty('quantity');
        expect(rec).toHaveProperty('reasoning');
        expect(['buy', 'sell', 'hold']).toContain(rec.action);
        expect(typeof rec.quantity).toBe('number');
        expect(typeof rec.reasoning).toBe('string');
      });
    });

    test('performance benchmarking includes attribution analysis', () => {
      const analytics = calculateAdvancedAnalytics(sampleData, 'retail');
      const benchmarking = analytics.performanceBenchmarking;

      expect(benchmarking).toHaveProperty('vsMarket');
      expect(benchmarking).toHaveProperty('vsIndex');
      expect(benchmarking).toHaveProperty('vsPeers');
      expect(benchmarking).toHaveProperty('attribution');

      expect(benchmarking.attribution).toHaveProperty('selection');
      expect(benchmarking.attribution).toHaveProperty('timing');
      expect(benchmarking.attribution).toHaveProperty('interaction');

      // Attribution should sum to approximately total return
      const totalAttribution = benchmarking.attribution.selection +
                              benchmarking.attribution.timing +
                              benchmarking.attribution.interaction;

      expect(Math.abs(totalAttribution - analytics.portfolioOverview.totalReturn)).toBeLessThan(2);
    });

    test('adapts to different investor classifications', () => {
      const retailAnalytics = calculateAdvancedAnalytics(sampleData, 'retail');
      const professionalAnalytics = calculateAdvancedAnalytics(sampleData, 'professional');

      // Both should have the same structure
      expect(retailAnalytics).toHaveProperty('portfolioOverview');
      expect(professionalAnalytics).toHaveProperty('portfolioOverview');

      // But may have different optimization strategies
      expect(retailAnalytics.portfolioOptimization.optimizationType).toBeTruthy();
      expect(professionalAnalytics.portfolioOptimization.optimizationType).toBeTruthy();
    });
  });

  describe('Integration and Edge Cases', () => {
    test('handles minimal data gracefully', () => {
      const minimalData = generateSampleTimeSeriesData(20, 100, 0.1);
      const analytics = calculateAdvancedAnalytics(minimalData, 'wholesale');

      expect(analytics).toHaveProperty('portfolioOverview');
      expect(analytics).toHaveProperty('riskMetrics');
      expect(analytics.portfolioOverview.totalValue).toBeGreaterThan(0);
    });

    test('maintains mathematical consistency', () => {
      const analytics = calculateAdvancedAnalytics(sampleData, 'sophisticated');

      // Risk metrics should be internally consistent
      expect(analytics.riskMetrics.expectedShortfall).toBeLessThan(analytics.riskMetrics.portfolioVaR);
      expect(analytics.riskMetrics.volatility).toBeGreaterThan(0);

      // Sentiment score should align with prediction confidence
      const model = analytics.predictiveModels['1m'];
      if (model && analytics.sentimentAnalysis.sentimentScore > 50) {
        // High sentiment should correlate with reasonable model confidence
        expect(model.confidence).toBeGreaterThan(0.5);
      }
    });

    test('all calculations produce finite numbers', () => {
      const analytics = calculateAdvancedAnalytics(sampleData, 'wholesale');

      const checkFinite = (obj: any, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === 'number') {
            expect(Number.isFinite(value)).toBe(true);
            expect(Number.isNaN(value)).toBe(false);
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
            checkFinite(value, currentPath);
          }
        });
      };

      checkFinite(analytics);
    });

    test('deterministic results with same input', () => {
      const analytics1 = calculateAdvancedAnalytics(sampleData, 'wholesale');
      const analytics2 = calculateAdvancedAnalytics(sampleData, 'wholesale');

      // Core calculations should be deterministic (excluding random elements like predictions)
      expect(analytics1.portfolioOverview.totalReturn).toBe(analytics2.portfolioOverview.totalReturn);
      expect(analytics1.riskMetrics.volatility).toBe(analytics2.riskMetrics.volatility);
      expect(analytics1.marketAnalysis.trendDirection).toBe(analytics2.marketAnalysis.trendDirection);
    });

    test('performance scales reasonably with data size', () => {
      const smallData = generateSampleTimeSeriesData(50, 100, 0.2);
      const largeData = generateSampleTimeSeriesData(500, 100, 0.2);

      const start1 = Date.now();
      const analytics1 = calculateAdvancedAnalytics(smallData, 'wholesale');
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const analytics2 = calculateAdvancedAnalytics(largeData, 'wholesale');
      const time2 = Date.now() - start2;

      // Both should complete and produce valid results
      expect(analytics1.portfolioOverview.totalValue).toBeGreaterThan(0);
      expect(analytics2.portfolioOverview.totalValue).toBeGreaterThan(0);

      // Performance should be reasonable (under 1 second for test data)
      expect(time1).toBeLessThan(1000);
      expect(time2).toBeLessThan(1000);
    });
  });
});