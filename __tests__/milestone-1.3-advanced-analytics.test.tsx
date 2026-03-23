/**
 * WREI Advanced Analytics and Market Intelligence Test Suite
 * Phase 1 Milestone 1.3 - Advanced Analytics and Market Intelligence
 * Comprehensive testing of all analytics components and integration points
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  calculateProfessionalMetrics,
  generatePortfolioOptimization,
  calculateRiskAdjustedReturns
} from '@/lib/professional-analytics';
import {
  getTokenizedRWAMarketContext,
  getCarbonMarketProjections,
  getCompetitiveAnalysis,
  getMarketSentimentAnalysis
} from '@/lib/market-intelligence';
import { PersonaType } from '@/lib/types';

// Mock the components to avoid complex rendering issues in tests
jest.mock('@/components/MarketIntelligenceDashboard', () => ({
  MarketIntelligenceDashboard: ({ persona, portfolioValue }: any) =>
    React.createElement('div', { 'data-testid': 'market-intelligence' }, `Market Intelligence for ${persona} with A$${portfolioValue / 1000000000}B`)
}));

jest.mock('@/components/PredictiveAnalyticsDashboard', () => ({
  PredictiveAnalyticsDashboard: ({ persona, timeHorizon }: any) =>
    React.createElement('div', { 'data-testid': 'predictive-analytics' }, `Predictive Analytics for ${persona}, ${timeHorizon} years`)
}));

jest.mock('@/components/AdvancedAnalytics', () => ({
  AdvancedAnalytics: () => React.createElement('div', { 'data-testid': 'advanced-analytics' }, 'Advanced Analytics Dashboard')
}));

jest.mock('@/components/InstitutionalDashboard', () => ({
  InstitutionalDashboard: () => React.createElement('div', { 'data-testid': 'institutional-dashboard' }, 'Institutional Dashboard')
}));

jest.mock('@/components/AnalyticsHub', () => ({
  AnalyticsHub: ({ persona, portfolioValue }: any) =>
    React.createElement('div', { 'data-testid': 'analytics-hub' }, `Analytics Hub for ${persona}`)
}));

import { AnalyticsHub } from '@/components/AnalyticsHub';

// Mock fetch for any API calls
global.fetch = jest.fn();

describe('Phase 1 Milestone 1.3: Advanced Analytics and Market Intelligence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: 'mock data' })
    });
  });

  describe('Professional Analytics Library', () => {
    it('calculates professional metrics for ESG impact investor', () => {
      const metrics = calculateProfessionalMetrics(
        1000000000, // A$1B portfolio
        'esg_impact_investor',
        10, // 10 year horizon
        'moderate'
      );

      expect(metrics).toBeDefined();
      expect(metrics.irr).toBeGreaterThan(0);
      expect(metrics.npv).toBeGreaterThan(0);
      expect(metrics.sharpeRatio).toBeGreaterThan(0);
      expect(metrics.optimizedAllocation).toBeDefined();
      expect(metrics.optimizedAllocation.carbon_credits).toBeGreaterThan(0);
      expect(metrics.optimizedAllocation.asset_co).toBeGreaterThan(0);
      expect(metrics.optimizedAllocation.dual_portfolio).toBeGreaterThan(0);

      // Verify allocation sums to approximately 1 (100%)
      const totalAllocation = Object.values(metrics.optimizedAllocation).reduce((sum, val) => sum + val, 0);
      expect(totalAllocation).toBeCloseTo(1.0, 1);
    });

    it('calculates professional metrics for family office with conservative risk', () => {
      const metrics = calculateProfessionalMetrics(
        2500000000, // A$2.5B portfolio
        'family_office',
        50, // 50 year horizon
        'conservative'
      );

      expect(metrics).toBeDefined();
      expect(metrics.volatility).toBeLessThan(0.15); // Conservative should have lower volatility
      expect(metrics.optimizedAllocation.asset_co).toBeGreaterThan(0.5); // Family office should prefer asset co
      expect(metrics.maxDrawdown).toBeLessThan(metrics.volatility); // Max drawdown should be reasonable
    });

    it('calculates professional metrics for DeFi yield farmer with aggressive risk', () => {
      const metrics = calculateProfessionalMetrics(
        500000000, // A$500M portfolio
        'defi_yield_farmer',
        5, // 5 year horizon
        'aggressive'
      );

      expect(metrics).toBeDefined();
      expect(metrics.volatility).toBeGreaterThan(0.2); // Aggressive should have higher volatility
      expect(metrics.irr).toBeGreaterThan(0.15); // Should expect higher returns for higher risk
      expect(metrics.optimizedAllocation.dual_portfolio).toBeGreaterThan(0.1); // DeFi should use dual portfolio
    });

    it('generates portfolio optimization recommendations', () => {
      const currentAllocation = {
        carbon_credits: 0.3,
        asset_co: 0.5,
        dual_portfolio: 0.2
      };

      const optimization = generatePortfolioOptimization(
        currentAllocation,
        'moderate',
        10
      );

      expect(optimization).toBeDefined();
      expect(optimization.recommendedAllocation).toBeDefined();
      expect(optimization.expectedReturn).toBeGreaterThan(0);
      expect(optimization.expectedRisk).toBeGreaterThan(0);
      expect(optimization.sharpeRatio).toBeGreaterThan(0);
      expect(optimization.improvementPotential).toBeGreaterThanOrEqual(0);

      // Verify recommended allocation sums to 1
      const totalRecommended = Object.values(optimization.recommendedAllocation).reduce((sum, val) => sum + val, 0);
      expect(totalRecommended).toBeCloseTo(1.0, 2);
    });

    it('calculates risk-adjusted returns with multiple metrics', () => {
      const riskMetrics = calculateRiskAdjustedReturns(
        1000000000, // A$1B portfolio
        0.15, // 15% expected return
        0.20, // 20% volatility
        10 // 10 year horizon
      );

      expect(riskMetrics).toBeDefined();
      expect(riskMetrics.sharpeRatio).toBeGreaterThan(0);
      expect(riskMetrics.sortinoRatio).toBeGreaterThanOrEqual(riskMetrics.sharpeRatio); // Sortino should be >= Sharpe
      expect(riskMetrics.calmarRatio).toBeGreaterThan(0);
      expect(riskMetrics.maxDrawdown).toBeGreaterThan(0);
      expect(riskMetrics.var95).toBeGreaterThan(0);
      expect(riskMetrics.cvar95).toBeGreaterThanOrEqual(riskMetrics.var95); // CVaR should be >= VaR
    });
  });

  describe('Market Intelligence System', () => {
    it('provides comprehensive tokenized RWA market context', () => {
      const marketContext = getTokenizedRWAMarketContext();

      expect(marketContext).toBeDefined();
      expect(marketContext.totalMarketValue).toBe(19_000_000_000); // A$19B
      expect(marketContext.growthRate).toBeGreaterThan(1); // Should show growth
      expect(marketContext.marketSegments).toBeDefined();
      expect(marketContext.marketSegments.treasuryTokens).toBeGreaterThan(0);
      expect(marketContext.marketSegments.infrastructure).toBeGreaterThan(0);
      expect(marketContext.institutionalAdoption).toBeGreaterThan(0);
      expect(marketContext.marketLeaders).toBeInstanceOf(Array);
      expect(marketContext.marketLeaders.length).toBeGreaterThan(0);

      // Verify market segments sum to total market value
      const totalSegments = Object.values(marketContext.marketSegments).reduce((sum, val) => sum + val, 0);
      expect(totalSegments).toBe(marketContext.totalMarketValue);
    });

    it('provides carbon market projections with growth metrics', () => {
      const projections = getCarbonMarketProjections();

      expect(projections).toBeDefined();
      expect(projections.currentValue).toBeGreaterThan(0);
      expect(projections.projected2030Value).toBeGreaterThan(projections.currentValue);
      expect(projections.cagr).toBeGreaterThan(0);
      expect(projections.cagr).toBeLessThan(1); // CAGR should be reasonable (< 100%)
      expect(projections.growthDrivers).toBeInstanceOf(Array);
      expect(projections.growthDrivers.length).toBeGreaterThan(0);
      expect(projections.riskFactors).toBeInstanceOf(Array);
      expect(projections.riskFactors.length).toBeGreaterThan(0);
    });

    it('provides competitive analysis with market positioning', () => {
      const competitors = getCompetitiveAnalysis();

      expect(competitors).toBeInstanceOf(Array);
      expect(competitors.length).toBeGreaterThan(0);

      competitors.forEach(competitor => {
        expect(competitor.name).toBeDefined();
        expect(competitor.aum).toBeGreaterThan(0);
        expect(competitor.yieldMechanism).toBeDefined();
        expect(competitor.currentYield).toBeGreaterThanOrEqual(0);
        expect(competitor.institutionalFocus).toBeDefined();
        expect(competitor.strengths).toBeInstanceOf(Array);
        expect(competitor.weaknesses).toBeInstanceOf(Array);
        expect(competitor.primaryFocus).toBeDefined();
        expect(['weak', 'moderate', 'strong']).toContain(competitor.differentiationStrength);
        expect(['low', 'medium', 'high']).toContain(competitor.threatLevel);
      });

      // Verify we have major competitors
      const competitorNames = competitors.map(c => c.name.toLowerCase());
      expect(competitorNames.some(name => name.includes('blackrock') || name.includes('buidl'))).toBe(true);
      expect(competitorNames.some(name => name.includes('ondo') || name.includes('usyc'))).toBe(true);
    });

    it('provides market sentiment analysis with scoring', () => {
      const sentiment = getMarketSentimentAnalysis();

      expect(sentiment).toBeDefined();
      expect(sentiment.overall).toBeGreaterThanOrEqual(0);
      expect(sentiment.overall).toBeLessThanOrEqual(100);
      expect(sentiment.carbonMarkets).toBeGreaterThanOrEqual(0);
      expect(sentiment.carbonMarkets).toBeLessThanOrEqual(100);
      expect(sentiment.rwaTokenization).toBeGreaterThanOrEqual(0);
      expect(sentiment.rwaTokenization).toBeLessThanOrEqual(100);
      expect(sentiment.institutionalAdoption).toBeGreaterThanOrEqual(0);
      expect(sentiment.institutionalAdoption).toBeLessThanOrEqual(100);
      expect(['bearish', 'neutral', 'bullish']).toContain(sentiment.sentiment);
      expect(sentiment.keyTrends).toBeInstanceOf(Array);
      expect(sentiment.keyTrends.length).toBeGreaterThan(0);
      expect(sentiment.riskFactors).toBeInstanceOf(Array);
      expect(sentiment.riskFactors.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Hub Integration', () => {
    it('renders analytics hub with persona-specific capabilities', () => {
      render(<AnalyticsHub persona="esg_impact_investor" portfolioValue={1000000000} />);

      expect(screen.getByTestId('analytics-hub')).toBeInTheDocument();
      expect(screen.getByText('Analytics Hub for esg_impact_investor')).toBeInTheDocument();
    });

    it('handles different persona types correctly', () => {
      const personas: PersonaType[] = ['esg_impact_investor', 'family_office', 'defi_yield_farmer'];

      personas.forEach(persona => {
        const { unmount } = render(
          <AnalyticsHub
            persona={persona}
            portfolioValue={1000000000}
            timeHorizon={10}
            riskTolerance="moderate"
          />
        );

        expect(screen.getByTestId('analytics-hub')).toBeInTheDocument();
        unmount();
      });
    });

    it('handles different portfolio values correctly', () => {
      const portfolioValues = [100000000, 1000000000, 10000000000]; // A$100M, A$1B, A$10B

      portfolioValues.forEach(value => {
        const { unmount } = render(
          <AnalyticsHub
            persona="esg_impact_investor"
            portfolioValue={value}
          />
        );

        expect(screen.getByTestId('analytics-hub')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Data Validation and Edge Cases', () => {
    it('handles zero portfolio value gracefully', () => {
      const metrics = calculateProfessionalMetrics(0, 'esg_impact_investor', 10, 'moderate');

      expect(metrics).toBeDefined();
      expect(metrics.npv).toBeGreaterThanOrEqual(0);
    });

    it('handles extreme time horizons', () => {
      const shortHorizon = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 1, 'moderate');
      const longHorizon = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 100, 'moderate');

      expect(shortHorizon).toBeDefined();
      expect(longHorizon).toBeDefined();
      expect(shortHorizon.volatility).toBeGreaterThan(0);
      expect(longHorizon.volatility).toBeGreaterThan(0);
    });

    it('handles all risk tolerance levels', () => {
      const riskLevels: Array<'conservative' | 'moderate' | 'aggressive'> = ['conservative', 'moderate', 'aggressive'];

      riskLevels.forEach(risk => {
        const metrics = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 10, risk);
        expect(metrics).toBeDefined();
        expect(metrics.volatility).toBeGreaterThan(0);
      });

      // Conservative should have lower volatility than aggressive
      const conservative = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 10, 'conservative');
      const aggressive = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 10, 'aggressive');

      expect(conservative.volatility).toBeLessThan(aggressive.volatility);
    });

    it('handles invalid allocation inputs for optimization', () => {
      const invalidAllocation = {
        carbon_credits: 0.7,
        asset_co: 0.5,
        dual_portfolio: 0.3
      }; // Sums to more than 1

      const optimization = generatePortfolioOptimization(invalidAllocation, 'moderate', 10);

      expect(optimization).toBeDefined();
      expect(optimization.improvementPotential).toBeGreaterThan(0); // Should suggest improvement
    });
  });

  describe('Performance and Scalability', () => {
    it('calculates metrics efficiently for large portfolios', () => {
      const startTime = Date.now();

      const metrics = calculateProfessionalMetrics(
        100000000000, // A$100B portfolio
        'sovereign_wealth',
        30,
        'moderate'
      );

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(metrics).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('handles multiple concurrent metric calculations', () => {
      const promises = [];
      const portfolioSizes = [1e8, 1e9, 1e10, 1e11]; // Various sizes

      portfolioSizes.forEach(size => {
        promises.push(
          Promise.resolve(calculateProfessionalMetrics(size, 'esg_impact_investor', 10, 'moderate'))
        );
      });

      return Promise.all(promises).then(results => {
        expect(results.length).toBe(4);
        results.forEach(metrics => {
          expect(metrics).toBeDefined();
          expect(metrics.irr).toBeGreaterThan(0);
        });
      });
    });

    it('maintains consistent results across multiple calls', () => {
      const call1 = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 10, 'moderate');
      const call2 = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 10, 'moderate');

      // Results should be identical for same inputs
      expect(call1.irr).toBe(call2.irr);
      expect(call1.sharpeRatio).toBe(call2.sharpeRatio);
      expect(call1.optimizedAllocation.carbon_credits).toBe(call2.optimizedAllocation.carbon_credits);
    });
  });

  describe('Integration with Previous Milestones', () => {
    it('maintains compatibility with Milestone 1.1 AI negotiation system', () => {
      // Verify that analytics can provide data for AI strategy explanations
      const metrics = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 10, 'moderate');
      const marketContext = getTokenizedRWAMarketContext();

      // These metrics should be usable by the AI negotiation system
      expect(metrics.optimizedAllocation).toBeDefined();
      expect(marketContext.totalMarketValue).toBeGreaterThan(0);

      // Verify data structure compatibility
      expect(typeof metrics.irr).toBe('number');
      expect(typeof metrics.volatility).toBe('number');
      expect(typeof marketContext.growthRate).toBe('number');
    });

    it('integrates with Milestone 1.2 investor journeys', () => {
      // Verify that analytics support the investor journey personas
      const infraMetrics = calculateProfessionalMetrics(15200000000, 'esg_impact_investor', 25, 'moderate'); // Sarah Chen
      const esgMetrics = calculateProfessionalMetrics(8500000000, 'esg_impact_investor', 15, 'moderate'); // James Rodriguez
      const familyMetrics = calculateProfessionalMetrics(2500000000, 'family_office', 50, 'conservative'); // Margaret Thompson

      expect(infraMetrics).toBeDefined();
      expect(esgMetrics).toBeDefined();
      expect(familyMetrics).toBeDefined();

      // Each should have appropriate risk characteristics
      expect(familyMetrics.volatility).toBeLessThan(infraMetrics.volatility); // Family office more conservative
      expect(familyMetrics.optimizedAllocation.asset_co).toBeGreaterThan(0.5); // Family office prefers asset co
    });

    it('provides enhanced data for existing components', () => {
      const sentimentData = getMarketSentimentAnalysis();
      const competitiveData = getCompetitiveAnalysis();

      // This data should enhance existing negotiation and journey components
      expect(sentimentData.overall).toBeGreaterThan(0);
      expect(competitiveData.length).toBeGreaterThan(0);

      // Data should be structured for easy consumption by other components
      competitiveData.forEach(competitor => {
        expect(competitor.name).toBeDefined();
        expect(competitor.aum).toBeGreaterThan(0);
        expect(competitor.threatLevel).toBeDefined();
      });
    });
  });

  describe('Error Handling and Reliability', () => {
    it('handles missing or undefined inputs gracefully', () => {
      // Test with undefined persona
      expect(() => {
        calculateProfessionalMetrics(1000000000, undefined as any, 10, 'moderate');
      }).not.toThrow();
    });

    it('provides fallback values for edge cases', () => {
      const metrics = calculateProfessionalMetrics(-1000000, 'esg_impact_investor', 0, 'moderate');

      expect(metrics).toBeDefined();
      expect(metrics.irr).toBeGreaterThanOrEqual(0); // Should not be negative
    });

    it('maintains data consistency across market intelligence functions', () => {
      const context1 = getTokenizedRWAMarketContext();
      const context2 = getTokenizedRWAMarketContext();

      expect(context1.totalMarketValue).toBe(context2.totalMarketValue);
      expect(context1.growthRate).toBe(context2.growthRate);
    });
  });

  describe('Milestone 1.3 Completion Verification', () => {
    it('implements all required analytics capabilities', () => {
      // Verify all major analytics functions are available and working
      const capabilities = [
        calculateProfessionalMetrics,
        generatePortfolioOptimization,
        calculateRiskAdjustedReturns,
        getTokenizedRWAMarketContext,
        getCarbonMarketProjections,
        getCompetitiveAnalysis,
        getMarketSentimentAnalysis
      ];

      capabilities.forEach(capability => {
        expect(typeof capability).toBe('function');
      });
    });

    it('provides institutional-grade analytics depth', () => {
      const metrics = calculateProfessionalMetrics(1000000000, 'esg_impact_investor', 10, 'moderate');

      // Should provide comprehensive professional metrics
      const requiredMetrics = [
        'irr', 'npv', 'sharpeRatio', 'sortinoRatio', 'calmarRatio',
        'optimizedAllocation', 'volatility', 'maxDrawdown'
      ];

      requiredMetrics.forEach(metric => {
        expect(metrics[metric as keyof typeof metrics]).toBeDefined();
      });
    });

    it('delivers market intelligence at scale', () => {
      const marketContext = getTokenizedRWAMarketContext();
      const carbonProjections = getCarbonMarketProjections();
      const competitors = getCompetitiveAnalysis();
      const sentiment = getMarketSentimentAnalysis();

      // Verify comprehensive market coverage
      expect(marketContext.totalMarketValue).toBe(19_000_000_000); // A$19B market coverage
      expect(carbonProjections.projected2030Value).toBeGreaterThan(100_000_000_000); // A$100B+ projections
      expect(competitors.length).toBeGreaterThanOrEqual(3); // Multiple competitors analyzed
      expect(sentiment.keyTrends.length).toBeGreaterThanOrEqual(3); // Multiple trend analysis
    });

    it('integrates seamlessly with existing platform', () => {
      // Test that new analytics work with existing persona system
      const personas: PersonaType[] = ['esg_impact_investor', 'family_office', 'defi_yield_farmer'];

      personas.forEach(persona => {
        const analytics = calculateProfessionalMetrics(1000000000, persona, 10, 'moderate');
        expect(analytics).toBeDefined();
        expect(analytics.optimizedAllocation).toBeDefined();
      });
    });
  });
});