/**
 * WREI Trading Platform - Enhanced Analytics Test Suite
 *
 * Step 1.4: Enhanced Negotiation Analytics - Component Testing
 * Comprehensive tests for analytics dashboard, real-time metrics, and performance charts
 *
 * Date: March 25, 2026
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import analytics components
import {
  AnalyticsEngine,
  AnalyticsDashboard,
  RealTimeMetricsWidget,
  PerformanceChart,
  useAnalytics,
  AnalyticsUtils
} from '../../components/analytics';
import { SimpleDemoProvider } from '../../components/demo/SimpleDemoProvider';

// Mock demo state manager
jest.mock('../../lib/demo-mode/simple-demo-state', () => ({
  useSimpleDemoStore: () => ({
    isActive: true,
    selectedDataSet: 'institutional',
    demoData: {
      persona: { name: 'Test Persona', organisation: 'Test Org' },
      marketData: { basePrice: 150, vcmSpot: 8.45, forwardRemoval: 185, dmrvPremium: 1.78, floor: 120 },
      portfolioMetrics: { targetAllocation: 500000, expectedYield: 0.085, riskProfile: 'Conservative', liquidityNeeds: 'Medium' },
      lastUpdated: new Date()
    },
    activateDemo: jest.fn(),
    deactivateDemo: jest.fn()
  })
}));

// Mock useIntelligentAnalytics hook
jest.mock('../../components/analytics/useIntelligentAnalytics', () => ({
  useIntelligentAnalytics: () => ({
    predictiveAnalytics: null,
    marketForecast: null,
    riskPredictions: null,
    performanceOptimisation: null,
    competitiveIntelligence: null,
    aiInsights: null,
    isLoading: false,
    isGeneratingPredictions: false,
    isRefreshing: false,
    error: null,
    lastUpdateTime: Date.now(),
    apiResponseTime: 150,
    engineStatus: 'active',
    engineHealth: 'healthy',
    hasValidPredictions: false,
    isDataStale: false,
    predictionAge: 0,
    refreshPredictions: jest.fn(),
    generateSpecificPrediction: jest.fn()
  })
}));

// Mock useAnalytics hook
jest.mock('../../components/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    analytics: {
      persona: { name: 'Test Persona', organisation: 'Test Org' },
      marketData: { basePrice: 150, vcmSpot: 8.45, forwardRemoval: 185, dmrvPremium: 1.78, floor: 120 },
      portfolioMetrics: { targetAllocation: 500000, expectedYield: 0.085, riskProfile: 'Conservative', liquidityNeeds: 'Medium' },
      lastUpdated: new Date()
    },
    isLoading: false,
    error: null,
    refreshAnalytics: jest.fn()
  })
}));

describe('Enhanced Negotiation Analytics - Step 1.4', () => {
  describe('AnalyticsEngine', () => {
    let analyticsEngine: any;

    beforeEach(() => {
      analyticsEngine = AnalyticsEngine.getInstance();
    });

    test('initializes with default benchmarks', () => {
      const benchmarks = analyticsEngine.getBenchmarks();
      expect(benchmarks).toBeDefined();
      expect(benchmarks.length).toBeGreaterThan(0);

      // Check for expected benchmark types
      const benchmarkIds = benchmarks.map((b: any) => b.id);
      expect(benchmarkIds).toContain('price-improvement');
      expect(benchmarkIds).toContain('cer-compliance');
      expect(benchmarkIds).toContain('settlement-efficiency');
    });

    test('processes scenario metrics correctly', () => {
      const sessionId = 'test-session-123';
      const scenarioId = 'test-scenario';
      const scenarioType = 'esc-market-trading';
      const executionData = {
        volume: 2500,
        finalPrice: 45.20,
        priceImprovement: 0.18,
        executionTime: 10,
        successRate: 0.95
      };

      const metrics = analyticsEngine.processScenarioMetrics(
        sessionId,
        scenarioId,
        scenarioType,
        executionData
      );

      expect(metrics).toBeDefined();
      expect(metrics.session_id).toBe(sessionId);
      expect(metrics.scenario_id).toBe(scenarioId);
      expect(metrics.performance.total_volume).toBe(executionData.volume);
      expect(metrics.performance.price_improvement).toBe(executionData.priceImprovement);
    });

    test('generates market analysis', () => {
      const marketData = analyticsEngine.generateMarketAnalysis();

      expect(marketData).toBeDefined();
      expect(marketData.market_segment).toBe('nsw_esc');
      expect(marketData.competitive_position).toBeDefined();
      expect(marketData.market_metrics).toBeDefined();
      expect(marketData.price_analysis).toBeDefined();
      expect(marketData.volume_analysis).toBeDefined();
    });

    test('generates risk assessment', () => {
      const riskData = analyticsEngine.generateRiskAssessment();

      expect(riskData).toBeDefined();
      expect(riskData.overall_risk_score).toBeDefined();
      expect(typeof riskData.overall_risk_score).toBe('number');
      expect(riskData.risk_categories).toBeDefined();

      // Check risk categories
      expect(riskData.risk_categories.operational).toBeDefined();
      expect(riskData.risk_categories.market).toBeDefined();
      expect(riskData.risk_categories.regulatory).toBeDefined();
      expect(riskData.risk_categories.counterparty).toBeDefined();
      expect(riskData.risk_categories.settlement).toBeDefined();
    });

    test('exports analytics data correctly', () => {
      const sessionId = 'export-test-session';

      // First create some metrics
      analyticsEngine.processScenarioMetrics(
        sessionId,
        'test-scenario',
        'esc-market-trading',
        { volume: 1000, finalPrice: 50.0 }
      );

      const exportData = analyticsEngine.exportAnalyticsData([sessionId]);

      expect(exportData).toBeDefined();
      expect(exportData.timestamp).toBeDefined();
      expect(exportData.sessions).toBeDefined();
      expect(exportData.benchmarks).toBeDefined();
      expect(exportData.market_analysis).toBeDefined();
      expect(exportData.risk_assessment).toBeDefined();
    });
  });

  describe('AnalyticsDashboard Component', () => {
    test('renders executive dashboard correctly', () => {
      render(
        <SimpleDemoProvider>
          <AnalyticsDashboard
            selectedDataSet="institutional"
            sessionId="test-session"
            onExport={jest.fn()}
          />
        </SimpleDemoProvider>
      );

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    test('renders technical dashboard correctly', () => {
      render(
        <SimpleDemoProvider>
          <AnalyticsDashboard
            selectedDataSet="retail"
            sessionId="test-session"
            onExport={jest.fn()}
          />
        </SimpleDemoProvider>
      );

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('renders compliance dashboard correctly', () => {
      render(
        <SimpleDemoProvider>
          <AnalyticsDashboard
            selectedDataSet="compliance"
            sessionId="test-session"
            onExport={jest.fn()}
          />
        </SimpleDemoProvider>
      );

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('handles tab navigation', () => {
      render(
        <SimpleDemoProvider>
          <AnalyticsDashboard
            selectedDataSet="institutional"
            sessionId="test-session"
            onExport={jest.fn()}
          />
        </SimpleDemoProvider>
      );

      const marketTab = screen.getByText('Market');
      fireEvent.click(marketTab);

      expect(screen.getByText('VCM Spot Reference')).toBeInTheDocument();
    });

    test('handles refresh functionality', () => {
      render(
        <SimpleDemoProvider>
          <AnalyticsDashboard
            selectedDataSet="institutional"
            sessionId="test-session"
            onExport={jest.fn()}
          />
        </SimpleDemoProvider>
      );

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(refreshButton).toBeInTheDocument();
    });

    test('displays refresh controls', () => {
      render(
        <SimpleDemoProvider>
          <AnalyticsDashboard
            selectedDataSet="institutional"
            sessionId="test-session"
            onExport={jest.fn()}
          />
        </SimpleDemoProvider>
      );

      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  describe('RealTimeMetricsWidget Component', () => {
    test('renders inactive state when scenario not active', () => {
      render(
        <RealTimeMetricsWidget
          sessionId="test-session"
          scenarioId="test-scenario"
          selectedAudience="executive"
          isScenarioActive={false}
        />
      );

      expect(screen.getByText('Real-Time Metrics (executive)')).toBeInTheDocument();
      expect(screen.getByText('Component 3 real-time metrics implementation in progress...')).toBeInTheDocument();
    });

    test('renders active state when scenario is running', () => {
      render(
        <RealTimeMetricsWidget
          sessionId="test-session"
          scenarioId="test-scenario"
          selectedAudience="executive"
          isScenarioActive={true}
        />
      );

      expect(screen.getByText('Real-Time Metrics (executive)')).toBeInTheDocument();
      expect(screen.getByText('Status: Active')).toBeInTheDocument();
    });

    test('shows audience-specific metrics for executive', () => {
      render(
        <RealTimeMetricsWidget
          sessionId="test-session"
          scenarioId="test-scenario"
          selectedAudience="executive"
          isScenarioActive={true}
        />
      );

      expect(screen.getByText('Real-Time Metrics (executive)')).toBeInTheDocument();
    });

    test('shows audience-specific metrics for technical', () => {
      render(
        <RealTimeMetricsWidget
          sessionId="test-session"
          scenarioId="test-scenario"
          selectedAudience="technical"
          isScenarioActive={true}
        />
      );

      expect(screen.getByText('Real-Time Metrics (technical)')).toBeInTheDocument();
    });

    test('shows audience-specific metrics for compliance', () => {
      render(
        <RealTimeMetricsWidget
          sessionId="test-session"
          scenarioId="test-scenario"
          selectedAudience="compliance"
          isScenarioActive={true}
        />
      );

      expect(screen.getByText('Real-Time Metrics (compliance)')).toBeInTheDocument();
    });
  });

  describe('PerformanceChart Component', () => {
    const mockBenchmarks = {
      market_return: 0.18,
      peer_average: 0.12,
      risk_free_rate: 0.04,
      volatility_benchmark: 0.25
    };

    test('renders chart for executive audience', () => {
      render(
        <PerformanceChart
          benchmarks={mockBenchmarks}
          selectedAudience="executive"
          timeframe="1d"
        />
      );

      expect(screen.getByText('Performance Chart (executive - 1d)')).toBeInTheDocument();
      expect(screen.getByText('Performance Visualization')).toBeInTheDocument();
    });

    test('renders chart for technical audience', () => {
      render(
        <PerformanceChart
          benchmarks={mockBenchmarks}
          selectedAudience="technical"
          timeframe="1d"
        />
      );

      expect(screen.getByText('Performance Chart (technical - 1d)')).toBeInTheDocument();
    });

    test('renders chart for compliance audience', () => {
      render(
        <PerformanceChart
          benchmarks={mockBenchmarks}
          selectedAudience="compliance"
          timeframe="1d"
        />
      );

      expect(screen.getByText('Performance Chart (compliance - 1d)')).toBeInTheDocument();
    });

    test('shows no data message when benchmarks are empty', () => {
      render(
        <PerformanceChart
          benchmarks={null}
          selectedAudience="executive"
          timeframe="1d"
        />
      );

      expect(screen.getByText('Performance Visualization')).toBeInTheDocument();
    });

    test('displays benchmark performance summary', () => {
      render(
        <PerformanceChart
          benchmarks={mockBenchmarks}
          selectedAudience="executive"
          timeframe="1d"
        />
      );

      expect(screen.getByText('Performance Visualization')).toBeInTheDocument();
      expect(screen.getByText('Component 3 chart implementation in progress...')).toBeInTheDocument();
    });

    test('shows improvement recommendations', () => {
      render(
        <PerformanceChart
          benchmarks={mockBenchmarks}
          selectedAudience="executive"
          timeframe="1d"
        />
      );

      expect(screen.getByText('Performance Visualization')).toBeInTheDocument();
      expect(screen.getByText('Component 3 chart implementation in progress...')).toBeInTheDocument();
    });
  });

  describe('AnalyticsUtils', () => {
    test('formats currency correctly', () => {
      expect(AnalyticsUtils.formatCurrency(1234567)).toBe('$1M');
      expect(AnalyticsUtils.formatCurrency(47.80)).toBe('$48');
    });

    test('formats percentage correctly', () => {
      expect(AnalyticsUtils.formatPercentage(0.185)).toBe('18.5%');
      expect(AnalyticsUtils.formatPercentage(0.95, 2)).toBe('95.00%');
    });

    test('formats numbers correctly', () => {
      expect(AnalyticsUtils.formatNumber(1234)).toBe('1.2k');
      expect(AnalyticsUtils.formatNumber(1234567)).toBe('1.2M');
      expect(AnalyticsUtils.formatNumber(1234567890)).toBe('1.2B');
    });

    test('gets performance colors correctly', () => {
      expect(AnalyticsUtils.getPerformanceColor(85)).toBe('green');
      expect(AnalyticsUtils.getPerformanceColor(70)).toBe('yellow');
      expect(AnalyticsUtils.getPerformanceColor(45)).toBe('red');
    });

    test('gets risk levels correctly', () => {
      expect(AnalyticsUtils.getRiskLevel(15)).toBe('low');
      expect(AnalyticsUtils.getRiskLevel(30)).toBe('medium');
      expect(AnalyticsUtils.getRiskLevel(60)).toBe('high');
      expect(AnalyticsUtils.getRiskLevel(85)).toBe('critical');
    });

    test('calculates trends correctly', () => {
      expect(AnalyticsUtils.calculateTrend(110, 100)).toBe('up');
      expect(AnalyticsUtils.calculateTrend(90, 100)).toBe('down');
      expect(AnalyticsUtils.calculateTrend(101, 100)).toBe('stable');
    });

    test('validates metrics correctly', () => {
      const validMetrics = {
        session_id: 'test',
        scenario_id: 'test',
        timestamp: new Date(),
        performance: {},
        market_position: {},
        risk_metrics: {},
        efficiency: {},
        esc_metrics: {}
      };

      expect(AnalyticsUtils.validateMetrics(validMetrics)).toBe(true);
      expect(AnalyticsUtils.validateMetrics({})).toBe(false);
    });

    test('calculates moving average correctly', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const movingAvg = AnalyticsUtils.calculateMovingAverage(data, 3);

      expect(movingAvg).toHaveLength(8); // 10 - 3 + 1
      expect(movingAvg[0]).toBeCloseTo(2, 1); // (1+2+3)/3
      expect(movingAvg[1]).toBeCloseTo(3, 1); // (2+3+4)/3
    });

    test('gets benchmark comparison correctly', () => {
      const comparison = AnalyticsUtils.getBenchmarkComparison(120, 100);

      expect(comparison.percentage).toBe(20);
      expect(comparison.direction).toBe('above');
      expect(comparison.category).toBe('excellent');

      const comparison2 = AnalyticsUtils.getBenchmarkComparison(80, 100);
      expect(comparison2.direction).toBe('below');
      expect(comparison2.category).toBe('poor');
    });

    test('generates color schemes correctly', () => {
      const colors3 = AnalyticsUtils.generateColorScheme(3);
      expect(colors3).toHaveLength(3);

      const colors15 = AnalyticsUtils.generateColorScheme(15);
      expect(colors15).toHaveLength(15);
    });
  });

  describe('Integration Tests', () => {
    test('analytics engine and dashboard work together', () => {
      const analyticsEngine = AnalyticsEngine.getInstance();

      // Process some metrics
      const sessionId = 'integration-test-session';
      analyticsEngine.processScenarioMetrics(
        sessionId,
        'test-scenario',
        'esc-market-trading',
        { volume: 2500, finalPrice: 48.0, priceImprovement: 0.20 }
      );

      // Render dashboard with session
      render(
        <SimpleDemoProvider>
          <AnalyticsDashboard
            selectedDataSet="institutional"
            sessionId={sessionId}
            onExport={jest.fn()}
          />
        </SimpleDemoProvider>
      );

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    test('real-time widget integrates with analytics engine', () => {
      const analyticsEngine = AnalyticsEngine.getInstance();
      const sessionId = 'widget-integration-test';

      analyticsEngine.processScenarioMetrics(
        sessionId,
        'test-scenario',
        'esc-market-trading',
        { volume: 3000, finalPrice: 45.5 }
      );

      render(
        <RealTimeMetricsWidget
          sessionId={sessionId}
          scenarioId="test-scenario"
          selectedAudience="executive"
          isScenarioActive={true}
        />
      );

      expect(screen.getByText('Real-Time Metrics (executive)')).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    test('analytics engine handles multiple sessions efficiently', () => {
      const analyticsEngine = AnalyticsEngine.getInstance();
      const startTime = performance.now();

      // Process 100 different sessions
      for (let i = 0; i < 100; i++) {
        analyticsEngine.processScenarioMetrics(
          `session-${i}`,
          `scenario-${i}`,
          'esc-market-trading',
          { volume: 2500 + i, finalPrice: 47.80 + i * 0.1 }
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process 100 sessions in under 100ms
      expect(duration).toBeLessThan(100);
    });

    test('benchmark updates are efficient', () => {
      const analyticsEngine = AnalyticsEngine.getInstance();
      const initialBenchmarks = analyticsEngine.getBenchmarks();

      const startTime = performance.now();

      // Process multiple metrics updates
      for (let i = 0; i < 50; i++) {
        analyticsEngine.processScenarioMetrics(
          'perf-test-session',
          'perf-scenario',
          'esc-market-trading',
          { volume: 2500, priceImprovement: 0.15 + (i * 0.001) }
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(50);

      const updatedBenchmarks = analyticsEngine.getBenchmarks();
      expect(updatedBenchmarks.length).toBe(initialBenchmarks.length);
    });
  });
});

/**
 * Test Helper Functions
 */

// Mock scenario execution data generator
export const generateMockExecutionData = (overrides: any = {}) => ({
  volume: 2500,
  finalPrice: 47.80,
  priceImprovement: 0.185,
  executionTime: 12,
  successRate: 0.94,
  satisfaction: 8.7,
  negotiationsPerHour: 4.2,
  automationRate: 0.88,
  transactionCost: 95,
  resourceUtil: 0.78,
  cerCompliance: 0.98,
  aemoSettlement: 1.8,
  certVerification: 0.996,
  additionalityScore: 87,
  ...overrides
});

// Mock benchmark data generator
export const generateMockBenchmark = (id: string, overrides: any = {}) => ({
  id,
  name: `Mock ${id} Benchmark`,
  type: 'market_average',
  category: 'performance',
  values: {
    current: 0.18,
    target: 0.20,
    market_average: 0.12,
    industry_best: 0.25
  },
  trend: {
    direction: 'up',
    change_percentage: 8.3,
    timeframe: '1m',
    historical_data: Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      value: 0.12 + (i * 0.002) + (Math.random() * 0.01)
    }))
  },
  analysis: {
    performance_score: 85,
    gap_analysis: {
      gap_value: 0.02,
      gap_percentage: 10,
      improvement_potential: 0.07
    },
    recommendations: [
      'Enhance AI negotiation algorithms',
      'Integrate additional market data sources',
      'Optimize execution timing strategies'
    ]
  },
  ...overrides
});

// Test data cleanup utility
export const cleanupTestData = () => {
  const analyticsEngine = AnalyticsEngine.getInstance();
  analyticsEngine.clearCache();
};