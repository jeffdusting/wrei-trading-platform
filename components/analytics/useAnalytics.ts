/**
 * WREI Trading Platform - Analytics Hook
 *
 * Stage 2 Component 3: Intelligent Analytics Dashboard
 * AI-enhanced analytics hook providing real-time data and insights
 *
 * Date: March 26, 2026
 */

import { useState, useEffect, useRef } from 'react';
import {
  calculateAdvancedAnalytics,
  generateSampleTimeSeriesData,
  type AdvancedAnalyticsDashboard,
  type TimeSeriesDataPoint
} from '@/lib/advanced-analytics';
import {
  calculateProfessionalMetrics,
  generateScenarioAnalysis,
  type ProfessionalMetrics,
  type ScenarioAnalysis
} from '@/lib/professional-analytics';
import type { PersonaType, InvestorClassification } from '@/lib/types';

export interface AnalyticsConfig {
  audience: 'executive' | 'technical' | 'compliance';
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  historicalDays?: number;
}

export interface AnalyticsData {
  dashboard: AdvancedAnalyticsDashboard;
  professionalMetrics: ProfessionalMetrics;
  scenarioAnalysis: ScenarioAnalysis;
  marketData: AdvancedAnalyticsDashboard['marketAnalysis'] & {
    price_analysis: {
      current_price: number;
      price_change_24h: number;
      price_trend: {
        short_term: 'bullish' | 'bearish' | 'sideways';
        long_term: 'bullish' | 'bearish' | 'sideways';
      };
      price_premium: number;
    };
    volume_analysis: {
      total_volume: number;
      volume_share: number;
      volume_trend: 'increasing' | 'decreasing' | 'stable';
    };
    competitive_position: {
      our_position: number;
      total_competitors: number;
      competitive_advantages: string[];
      market_threats: string[];
    };
    market_metrics: {
      total_market_size: number;
      growth_rate: number;
      volatility_index: number;
    };
  };
  riskData: {
    overall_risk_score: number;
    risk_categories: {
      market_risk: { score: number; description: string };
      operational_risk: { score: number; description: string };
      regulatory_risk: { score: number; description: string };
      liquidity_risk: { score: number; description: string };
    };
    monitoring: {
      current_alerts: Array<{
        severity: 'low' | 'medium' | 'high';
        message: string;
        timestamp: Date;
      }>;
      recommendations: string[];
    };
  };
  benchmarks: {
    market_return: number;
    peer_average: number;
    risk_free_rate: number;
    volatility_benchmark: number;
  };
  lastUpdated: Date;
}

/**
 * Generate comprehensive analytics data for the specified audience
 */
const generateAnalyticsData = (config: AnalyticsConfig): AnalyticsData => {
  // Generate sample time series data
  const timeSeriesData = generateSampleTimeSeriesData(
    config.historicalDays || 365,
    47.80, // Current NSW ESC spot price
    0.15   // Volatility
  );

  // Calculate advanced analytics dashboard
  const dashboard = calculateAdvancedAnalytics(timeSeriesData, 'sophisticated');

  // Map audience to appropriate persona for professional metrics
  const personaMapping: Record<string, PersonaType> = {
    executive: 'esg_impact_investor',
    technical: 'family_office',
    compliance: 'esg_impact_investor'
  };

  const persona = personaMapping[config.audience] || 'esg_impact_investor';

  // Calculate professional metrics
  const professionalMetrics = calculateProfessionalMetrics(
    2400000, // Portfolio value (A$2.4M as shown in executive dashboard)
    persona,
    5, // 5 year time horizon
    'moderate'
  );

  // Generate scenario analysis
  const scenarioAnalysis = generateScenarioAnalysis(
    'carbon_credits',
    2400000,
    5,
    0.12, // 12% base expected return
    0.18, // 18% volatility
    'sophisticated'
  );

  // Enhanced market data with competitive intelligence
  const marketData = {
    ...dashboard.marketAnalysis,
    price_analysis: {
      current_price: 47.80,
      price_change_24h: 2.3,
      price_trend: {
        short_term: dashboard.marketAnalysis.trendDirection === 'bullish' ? 'bullish' as const :
                   dashboard.marketAnalysis.trendDirection === 'bearish' ? 'bearish' as const : 'sideways' as const,
        long_term: 'bullish' as const
      },
      price_premium: 0.223 // 22.3% premium over market average
    },
    volume_analysis: {
      total_volume: 24000000, // A$24M annual volume
      volume_share: 0.12, // 12% market share
      volume_trend: 'increasing' as const
    },
    competitive_position: {
      our_position: 3,
      total_competitors: 45,
      competitive_advantages: [
        'AI-powered negotiation systems delivering 22% price improvement',
        'Real-time AEMO data integration for superior market timing',
        'Automated compliance reducing processing costs by 40%',
        'T+0 settlement capabilities via Zoniqx integration',
        'Comprehensive ESG impact measurement and reporting'
      ],
      market_threats: [
        'Regulatory changes to NSW Energy Savings Scheme',
        'New entrants with similar AI capabilities',
        'Market consolidation reducing trading opportunities'
      ]
    },
    market_metrics: {
      total_market_size: 200000000, // A$200M annual market size
      growth_rate: 0.085, // 8.5% annual growth
      volatility_index: 0.24 // 24% volatility index
    }
  };

  // Risk assessment data
  const riskData = {
    overall_risk_score: 21, // Low-medium risk (out of 100)
    risk_categories: {
      market_risk: {
        score: 25,
        description: 'Moderate exposure to ESC price volatility and market cycles'
      },
      operational_risk: {
        score: 15,
        description: 'Low operational risk due to automated systems and proven processes'
      },
      regulatory_risk: {
        score: 30,
        description: 'Moderate regulatory risk from potential changes to NSW ESS framework'
      },
      liquidity_risk: {
        score: 12,
        description: 'Low liquidity risk due to active ESC market and diverse client base'
      }
    },
    monitoring: {
      current_alerts: [
        {
          severity: 'medium' as const,
          message: 'ESC price volatility increased 15% over past 7 days',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ],
      recommendations: [
        'Consider hedging strategies for large ESC positions',
        'Monitor Clean Energy Regulator policy announcements',
        'Diversify across multiple ESC activity types',
        'Maintain liquidity reserves for opportunity capture'
      ]
    }
  };

  // Benchmarking data
  const benchmarks = {
    market_return: 0.085, // 8.5% market return
    peer_average: 0.072, // 7.2% peer average
    risk_free_rate: 0.04, // 4% risk-free rate
    volatility_benchmark: 0.15 // 15% volatility benchmark
  };

  return {
    dashboard,
    professionalMetrics,
    scenarioAnalysis,
    marketData,
    riskData,
    benchmarks,
    lastUpdated: new Date()
  };
};

/**
 * Main analytics hook providing comprehensive market intelligence and insights
 */
export const useAnalytics = (initialConfig: AnalyticsConfig) => {
  const [config, setConfig] = useState<AnalyticsConfig>({
    ...initialConfig,
    audience: initialConfig.audience || 'executive',
    autoRefresh: initialConfig.autoRefresh ?? false,
    refreshInterval: initialConfig.refreshInterval ?? 30000, // 30 seconds default
    historicalDays: initialConfig.historicalDays ?? 365
  });

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load analytics data
  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));

      const analyticsData = generateAnalyticsData(config);
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const refresh = async (): Promise<void> => {
    await loadData();
  };

  // Export data in various formats
  const exportData = (format: 'json' | 'csv' | 'excel') => {
    if (!data) return null;

    switch (format) {
      case 'json':
        return {
          timestamp: data.lastUpdated.toISOString(),
          portfolio_overview: data.dashboard.portfolioOverview,
          market_analysis: data.marketData,
          risk_metrics: data.riskData,
          performance_benchmarking: data.dashboard.performanceBenchmarking,
          professional_metrics: data.professionalMetrics
        };

      case 'csv':
        // Simplified CSV export for key metrics
        const csvData = [
          ['Metric', 'Value', 'Change', 'Benchmark'],
          ['Total Portfolio Value', `A$${(data.dashboard.portfolioOverview.totalValue / 1000000).toFixed(1)}M`, `${data.dashboard.portfolioOverview.totalReturn.toFixed(1)}%`, 'N/A'],
          ['Market Share', `${(data.marketData.volume_analysis.volume_share * 100).toFixed(1)}%`, '+2.3% YoY', '8.5%'],
          ['Risk Score', data.riskData.overall_risk_score.toString(), 'Improved', '25'],
          ['Sharpe Ratio', data.professionalMetrics.sharpeRatio.toFixed(2), '+0.3 vs peer', '0.8']
        ];
        return csvData.map(row => row.join(',')).join('\n');

      case 'excel':
        // Return structured data suitable for Excel export
        return {
          sheets: {
            'Portfolio Overview': data.dashboard.portfolioOverview,
            'Market Analysis': data.marketData,
            'Risk Assessment': data.riskData,
            'Professional Metrics': data.professionalMetrics
          },
          timestamp: data.lastUpdated.toISOString()
        };

      default:
        return data;
    }
  };

  // Update configuration
  const updateConfig = (newConfig: Partial<AnalyticsConfig>): void => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, [config]);

  // Setup auto-refresh
  useEffect(() => {
    if (config.autoRefresh && config.refreshInterval) {
      intervalRef.current = setInterval(() => {
        loadData();
      }, config.refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [config.autoRefresh, config.refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    config,
    refresh,
    exportData,
    updateConfig,
    // Convenience accessors
    marketData: data?.marketData || null,
    riskData: data?.riskData || null,
    benchmarks: data?.benchmarks || null
  };
};
