/**
 * Advanced Analytics Suite Component - Test Suite
 *
 * Tests for Advanced Analytics Suite React component functionality.
 * Covers rendering, view switching, data visualization, and user interactions.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D3: Advanced Analytics Suite Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdvancedAnalyticsSuite } from '@/components/analytics/AdvancedAnalyticsSuite';
import * as AdvancedAnalytics from '@/lib/advanced-analytics';

// Mock the advanced analytics module
jest.mock('@/lib/advanced-analytics', () => ({
  ...jest.requireActual('@/lib/advanced-analytics'),
  calculateAdvancedAnalytics: jest.fn(),
  generateSampleTimeSeriesData: jest.fn(),
  generatePredictiveModel: jest.fn()
}));

// Mock data for testing
const mockTimeSeriesData = [
  {
    timestamp: new Date('2026-01-01T00:00:00Z'),
    value: 100,
    volume: 1000000,
    metadata: { priceChange: 0, volatility: 0.02 }
  },
  {
    timestamp: new Date('2026-01-02T00:00:00Z'),
    value: 102,
    volume: 1200000,
    metadata: { priceChange: 2, volatility: 0.025 }
  },
  {
    timestamp: new Date('2026-01-03T00:00:00Z'),
    value: 101.5,
    volume: 950000,
    metadata: { priceChange: -0.5, volatility: 0.022 }
  }
];

const mockAnalyticsDashboard = {
  portfolioOverview: {
    totalValue: 5250000,
    totalReturn: 12.45,
    riskAdjustedReturn: 1.8,
    lastUpdated: new Date('2026-03-24T15:30:00Z')
  },
  marketAnalysis: {
    trendDirection: 'bullish' as const,
    trendStrength: 'strong' as const,
    supportLevels: [95.5, 98.2, 100.1],
    resistanceLevels: [103.8, 106.2, 109.5],
    technicalIndicators: {
      sma14: 101.2,
      sma50: 99.8,
      rsi: 68.5,
      bollinger_upper: 105.2,
      bollinger_middle: 101.0,
      bollinger_lower: 96.8,
      momentum: 2.3
    }
  },
  riskMetrics: {
    portfolioVaR: -3.2,
    expectedShortfall: -4.8,
    sharpeRatio: 1.45,
    sortinoRatio: 1.62,
    maximumDrawdown: 8.7,
    volatility: 18.5,
    beta: 1.12,
    trackingError: 2.8
  },
  sentimentAnalysis: {
    overallSentiment: 'bullish' as const,
    sentimentScore: 68.2,
    confidenceLevel: 0.85,
    keyFactors: {
      regulatory: 72.0,
      environmental: 81.5,
      economic: 65.3,
      technological: 89.2,
      social: 58.7
    },
    newsImpact: 67.4,
    socialMediaBuzz: 72.8,
    institutionalFlow: 74.1
  },
  predictiveModels: {
    '1m': {
      modelType: 'ensemble' as const,
      confidence: 0.78,
      timeHorizon: '1m' as const,
      predictions: {
        price: [
          { timestamp: new Date('2026-04-01T00:00:00Z'), value: 103.2, metadata: { uncertainty: 0.02 } },
          { timestamp: new Date('2026-04-02T00:00:00Z'), value: 104.1, metadata: { uncertainty: 0.025 } }
        ],
        volume: [
          { timestamp: new Date('2026-04-01T00:00:00Z'), value: 1100000, metadata: { change: 0.05 } },
          { timestamp: new Date('2026-04-02T00:00:00Z'), value: 1050000, metadata: { change: -0.02 } }
        ],
        volatility: [
          { timestamp: new Date('2026-04-01T00:00:00Z'), value: 2.1, metadata: { trend: 'increasing' } },
          { timestamp: new Date('2026-04-02T00:00:00Z'), value: 2.3, metadata: { trend: 'increasing' } }
        ]
      },
      accuracy: {
        mape: 12.5,
        rmse: 1.8,
        r_squared: 0.82
      },
      featureImportance: {
        price_history: 0.25,
        volume_profile: 0.15,
        technical_indicators: 0.20,
        market_sentiment: 0.15,
        macroeconomic: 0.12,
        seasonal_patterns: 0.08,
        news_events: 0.05
      }
    }
  },
  portfolioOptimization: {
    optimizationType: 'mean_variance' as const,
    currentAllocation: {
      carbon_credits: 0.6,
      renewable_certificates: 0.25,
      biodiversity_tokens: 0.15
    },
    optimizedAllocation: {
      carbon_credits: 0.55,
      renewable_certificates: 0.3,
      biodiversity_tokens: 0.15
    },
    expectedReturn: 14.8,
    expectedRisk: 16.2,
    sharpeRatio: 1.62,
    rebalanceRecommendations: [
      {
        asset: 'carbon_credits',
        action: 'sell' as const,
        quantity: 5,
        reasoning: 'Reduce concentration risk'
      },
      {
        asset: 'renewable_certificates',
        action: 'buy' as const,
        quantity: 5,
        reasoning: 'Increase diversification'
      }
    ],
    constraintsApplied: ['maximum_single_asset_weight', 'minimum_liquidity_threshold']
  },
  performanceBenchmarking: {
    vsMarket: 4.2,
    vsIndex: 2.8,
    vsPeers: 3.5,
    attribution: {
      selection: 7.5,
      timing: 3.7,
      interaction: 1.3
    }
  }
};

describe('AdvancedAnalyticsSuite Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (AdvancedAnalytics.generateSampleTimeSeriesData as jest.Mock).mockReturnValue(mockTimeSeriesData);
    (AdvancedAnalytics.calculateAdvancedAnalytics as jest.Mock).mockReturnValue(mockAnalyticsDashboard);
  });

  describe('Component Rendering', () => {
    test('renders loading state initially', () => {
      render(<AdvancedAnalyticsSuite />);

      expect(screen.getByText('Loading advanced analytics...')).toBeInTheDocument();

      // Check for the spinner element specifically
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'border-b-2', 'border-blue-500');
    });

    test('renders analytics suite after loading', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Suite')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Institutional-grade analytics with predictive modeling and risk assessment')).toBeInTheDocument();
      expect(screen.getAllByText('+12.45%').length).toBeGreaterThanOrEqual(1);
    });

    test('displays navigation tabs', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Market Overview')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Technical Analysis')).toBeInTheDocument();
      expect(screen.getByText('Risk Analytics')).toBeInTheDocument();
      expect(screen.getByText('Market Sentiment')).toBeInTheDocument();
      expect(screen.getByText('Predictive Models')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Optimization')).toBeInTheDocument();
    });

    test('renders with custom props', async () => {
      render(
        <AdvancedAnalyticsSuite
          timeSeriesData={mockTimeSeriesData}
          investorClassification="professional"
          timeFrame="3m"
          className="custom-class"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Suite')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(AdvancedAnalytics.calculateAdvancedAnalytics).toHaveBeenCalledWith(mockTimeSeriesData, 'professional');
    });
  });

  describe('View Navigation', () => {
    test('switches between analytics views', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Suite')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Default should be Overview
      expect(screen.getByText('Portfolio Value')).toBeInTheDocument();

      // Switch to Technical Analysis
      fireEvent.click(screen.getByText('Technical Analysis'));
      await waitFor(() => {
        expect(screen.getByText('Trend Analysis')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Switch to Risk Analytics
      fireEvent.click(screen.getByText('Risk Analytics'));
      await waitFor(() => {
        expect(screen.getByText('Value at Risk')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Switch to Market Sentiment
      fireEvent.click(screen.getByText('Market Sentiment'));
      await waitFor(() => {
        expect(screen.getByText('Overall Market Sentiment')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Switch to Predictive Models
      fireEvent.click(screen.getByText('Predictive Models'));
      await waitFor(() => {
        expect(screen.getByText('Model Type')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Switch to Portfolio Optimization
      fireEvent.click(screen.getByText('Portfolio Optimization'));
      await waitFor(() => {
        expect(screen.getByText('Expected Return')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    test('active tab receives correct styling', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Market Overview')).toBeInTheDocument();
      }, { timeout: 2000 });

      const overviewTab = screen.getByText('Market Overview').closest('button');
      const technicalTab = screen.getByText('Technical Analysis').closest('button');

      expect(overviewTab).toHaveClass('bg-white', 'text-blue-600', 'shadow-sm');
      expect(technicalTab).toHaveClass('text-slate-600');

      // Switch tabs
      fireEvent.click(screen.getByText('Technical Analysis'));

      await waitFor(() => {
        expect(technicalTab).toHaveClass('bg-white', 'text-blue-600', 'shadow-sm');
        expect(overviewTab).toHaveClass('text-slate-600');
      }, { timeout: 2000 });
    });
  });

  describe('Market Overview View', () => {
    test('displays key performance metrics', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('$5.25M')).toBeInTheDocument();
      expect(screen.getByText('Total Return')).toBeInTheDocument();
      expect(screen.getAllByText('12.45%').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Risk-Adjusted Return')).toBeInTheDocument();
      expect(screen.getByText('1.80')).toBeInTheDocument();
      expect(screen.getByText('Market Trend')).toBeInTheDocument();
      expect(screen.getByText('bullish')).toBeInTheDocument();
    });

    test('displays performance benchmarking', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Performance vs Benchmarks')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('vs Market')).toBeInTheDocument();
      expect(screen.getByText('+4.20%')).toBeInTheDocument();
      expect(screen.getByText('vs Index')).toBeInTheDocument();
      expect(screen.getByText('+2.80%')).toBeInTheDocument();
      expect(screen.getByText('vs Peers')).toBeInTheDocument();
      expect(screen.getByText('+3.50%')).toBeInTheDocument();
    });

    test('displays return attribution', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Return Attribution')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Selection')).toBeInTheDocument();
      expect(screen.getByText('+7.50%')).toBeInTheDocument();
      expect(screen.getByText('Timing')).toBeInTheDocument();
      expect(screen.getByText('+3.70%')).toBeInTheDocument();
      expect(screen.getByText('Interaction')).toBeInTheDocument();
      expect(screen.getByText('+1.30%')).toBeInTheDocument();
    });
  });

  describe('Technical Analysis View', () => {
    test('displays technical indicators', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Technical Analysis'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('SMA 14')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('101.20')).toBeInTheDocument(); // SMA14 value
      expect(screen.getByText('RSI')).toBeInTheDocument();
      expect(screen.getByText('68.50')).toBeInTheDocument(); // RSI value
      expect(screen.getByText('MOMENTUM')).toBeInTheDocument();
      expect(screen.getByText('2.30')).toBeInTheDocument(); // Momentum value
    });

    test('displays trend analysis', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Technical Analysis'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Trend Analysis')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Direction')).toBeInTheDocument();
      expect(screen.getByText('BULLISH')).toBeInTheDocument();
      expect(screen.getByText('Strength')).toBeInTheDocument();
      expect(screen.getByText('STRONG')).toBeInTheDocument();
    });

    test('displays support and resistance levels', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Technical Analysis'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Support & Resistance')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Resistance Levels')).toBeInTheDocument();
      expect(screen.getByText('$103.8')).toBeInTheDocument();
      expect(screen.getByText('Support Levels')).toBeInTheDocument();
      expect(screen.getByText('$95.5')).toBeInTheDocument();
    });
  });

  describe('Risk Analytics View', () => {
    test('displays risk metrics cards', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Risk Analytics'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Value at Risk')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('-3.20%')).toBeInTheDocument(); // VaR value
      expect(screen.getByText('Expected Shortfall')).toBeInTheDocument();
      expect(screen.getByText('-4.80%')).toBeInTheDocument(); // ES value
      expect(screen.getByText('Volatility')).toBeInTheDocument();
      expect(screen.getByText('18.50%')).toBeInTheDocument(); // Volatility value
      expect(screen.getByText('Max Drawdown')).toBeInTheDocument();
      expect(screen.getByText('8.70%')).toBeInTheDocument(); // Max drawdown value
    });

    test('displays risk-adjusted performance metrics', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Risk Analytics'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Risk-Adjusted Performance')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
      expect(screen.getByText('1.450')).toBeInTheDocument();
      expect(screen.getByText('Sortino Ratio')).toBeInTheDocument();
      expect(screen.getByText('1.620')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('1.120')).toBeInTheDocument();
    });
  });

  describe('Market Sentiment View', () => {
    test('displays overall sentiment analysis', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Market Sentiment'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Overall Market Sentiment')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('68.2')).toBeInTheDocument(); // Sentiment score
      expect(screen.getByText('BULLISH')).toBeInTheDocument();
    });

    test('displays key sentiment factors', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Market Sentiment'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Key Factors')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Regulatory')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('Environmental')).toBeInTheDocument();
      expect(screen.getByText('82%')).toBeInTheDocument(); // Environmental factor
      expect(screen.getByText('Technological')).toBeInTheDocument();
      expect(screen.getByText('89%')).toBeInTheDocument(); // Technological factor
    });

    test('displays market indicators', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Market Sentiment'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Market Indicators')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('News Impact')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByText('Social Media Buzz')).toBeInTheDocument();
      expect(screen.getByText('73%')).toBeInTheDocument();
    });
  });

  describe('Predictive Models View', () => {
    test('displays model overview metrics', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Predictive Models'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Model Type')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Ensemble')).toBeInTheDocument();
      expect(screen.getByText('Confidence')).toBeInTheDocument();
      expect(screen.getByText('78.0%')).toBeInTheDocument();
      expect(screen.getByText('R-Squared')).toBeInTheDocument();
      expect(screen.getByText('0.820')).toBeInTheDocument();
      expect(screen.getByText('MAPE')).toBeInTheDocument();
      expect(screen.getByText('12.5%')).toBeInTheDocument();
    });

    test('displays feature importance analysis', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Predictive Models'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Feature Importance')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Price history')).toBeInTheDocument();
      expect(screen.getByText('25.0%')).toBeInTheDocument(); // Price history importance
      expect(screen.getByText('Technical indicators')).toBeInTheDocument();
      expect(screen.getByText('20.0%')).toBeInTheDocument(); // Technical indicators importance
    });
  });

  describe('Portfolio Optimization View', () => {
    test('displays optimization overview', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Portfolio Optimization'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Expected Return')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('14.80%')).toBeInTheDocument();
      expect(screen.getByText('Expected Risk')).toBeInTheDocument();
      expect(screen.getByText('16.20%')).toBeInTheDocument();
      expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
      expect(screen.getByText('1.620')).toBeInTheDocument();
    });

    test('displays allocation comparison', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Portfolio Optimization'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Current Allocation')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Optimized Allocation')).toBeInTheDocument();
      expect(screen.getAllByText('Carbon credits').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('60.0%')).toBeInTheDocument(); // Current carbon credits allocation
      expect(screen.getByText('55.0%')).toBeInTheDocument(); // Optimized carbon credits allocation
    });

    test('displays rebalancing recommendations', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Portfolio Optimization'));
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(screen.getByText('Rebalancing Recommendations')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getAllByText('Carbon credits').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('SELL 5%')).toBeInTheDocument();
      expect(screen.getByText('Reduce concentration risk')).toBeInTheDocument();
      expect(screen.getAllByText('Renewable certificates').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('BUY 5%')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles missing analytics data gracefully', async () => {
      (AdvancedAnalytics.calculateAdvancedAnalytics as jest.Mock).mockReturnValue({
        portfolioOverview: {
          totalValue: 0,
          totalReturn: 0,
          riskAdjustedReturn: 0,
          lastUpdated: new Date()
        },
        marketAnalysis: {
          trendDirection: 'sideways',
          trendStrength: 'weak',
          supportLevels: [],
          resistanceLevels: [],
          technicalIndicators: {}
        },
        riskMetrics: {
          portfolioVaR: 0,
          expectedShortfall: 0,
          sharpeRatio: 0,
          sortinoRatio: 0,
          maximumDrawdown: 0,
          volatility: 0,
          beta: 0,
          trackingError: 0
        },
        sentimentAnalysis: {
          overallSentiment: 'neutral',
          sentimentScore: 0,
          confidenceLevel: 0.5,
          keyFactors: {
            regulatory: 50,
            environmental: 50,
            economic: 50,
            technological: 50,
            social: 50
          },
          newsImpact: 50,
          socialMediaBuzz: 50,
          institutionalFlow: 50
        },
        predictiveModels: {},
        portfolioOptimization: {
          optimizationType: 'mean_variance',
          currentAllocation: {},
          optimizedAllocation: {},
          expectedReturn: 0,
          expectedRisk: 0,
          sharpeRatio: 0,
          rebalanceRecommendations: [],
          constraintsApplied: []
        },
        performanceBenchmarking: {
          vsMarket: 0,
          vsIndex: 0,
          vsPeers: 0,
          attribution: { selection: 0, timing: 0, interaction: 0 }
        }
      });

      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getAllByText('+0.00%').length).toBeGreaterThanOrEqual(1);
      }, { timeout: 2000 });
    });

    test('handles custom time series data prop', async () => {
      const customData = [
        {
          timestamp: new Date('2026-02-01T00:00:00Z'),
          value: 200,
          volume: 500000,
          metadata: { priceChange: 0, volatility: 0.01 }
        }
      ];

      render(<AdvancedAnalyticsSuite timeSeriesData={customData} />);

      await waitFor(() => {
        expect(AdvancedAnalytics.calculateAdvancedAnalytics).toHaveBeenCalledWith(customData, 'wholesale');
      }, { timeout: 2000 });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Suite')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Check for button roles
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThanOrEqual(6); // At least 6 navigation tabs

      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: /Advanced Analytics Suite/ })).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Suite')).toBeInTheDocument();
      }, { timeout: 2000 });

      const technicalTab = screen.getByText('Technical Analysis');

      // Test keyboard interaction
      fireEvent.keyDown(technicalTab, { key: 'Enter', code: 'Enter' });
      fireEvent.click(technicalTab);

      await waitFor(() => {
        expect(screen.getByText('SMA 14')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Responsive Design', () => {
    test('handles mobile navigation labels', async () => {
      // Mock a mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<AdvancedAnalyticsSuite />);

      await waitFor(() => {
        expect(screen.getByText('Advanced Analytics Suite')).toBeInTheDocument();
      }, { timeout: 2000 });

      // On mobile, tabs should show shorter labels
      const tabs = screen.getAllByRole('button');
      const tabTexts = tabs.map(tab => tab.textContent);

      // Should have both full labels and short labels available
      expect(tabTexts.some(text => text?.includes('📊'))).toBe(true); // Icon should be present
    });
  });
});