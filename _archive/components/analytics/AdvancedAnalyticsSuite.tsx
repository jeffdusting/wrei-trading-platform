/**
 * Advanced Analytics Suite Component
 *
 * Comprehensive analytics dashboard with predictive modeling, risk analysis,
 * technical indicators, and institutional-grade portfolio optimization tools.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D3: Advanced Analytics Suite
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  calculateAdvancedAnalytics,
  generateSampleTimeSeriesData,
  generatePredictiveModel,
  type AdvancedAnalyticsDashboard,
  type TimeSeriesDataPoint,
  type TimeFrame,
  type AnalyticsMetric,
  type TrendDirection,
  type TrendStrength
} from '@/lib/advanced-analytics';
import type { InvestorClassification } from '@/lib/types';

/**
 * Analytics view modes
 */
type AnalyticsView = 'overview' | 'technical' | 'risk' | 'sentiment' | 'predictive' | 'optimization';

/**
 * Component props
 */
interface AdvancedAnalyticsSuiteProps {
  /** Historical time series data */
  timeSeriesData?: TimeSeriesDataPoint[];
  /** Investor classification for tailored analytics */
  investorClassification?: InvestorClassification;
  /** Selected time frame for analysis */
  timeFrame?: TimeFrame;
  /** Component class name */
  className?: string;
}

/**
 * Advanced Analytics Suite Component
 */
export const AdvancedAnalyticsSuite: React.FC<AdvancedAnalyticsSuiteProps> = ({
  timeSeriesData,
  investorClassification = 'wholesale',
  timeFrame = '1m',
  className = ''
}) => {
  const [currentView, setCurrentView] = useState<AnalyticsView>('overview');
  const [selectedMetric, setSelectedMetric] = useState<AnalyticsMetric>('price_performance');
  const [isLoading, setIsLoading] = useState(true);

  // Generate or use provided time series data
  const sampleData = useMemo(() => {
    return timeSeriesData || generateSampleTimeSeriesData(365, 150, 0.25);
  }, [timeSeriesData]);

  // Calculate analytics dashboard
  const analytics = useMemo(() => {
    return calculateAdvancedAnalytics(sampleData, investorClassification);
  }, [sampleData, investorClassification]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), process.env.NODE_ENV === 'test' ? 100 : 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-8 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-slate-600">Loading advanced analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="bloomberg-metric-value text-slate-900">Advanced Analytics Suite</h2>
            <p className="text-slate-600 mt-1">
              Institutional-grade analytics with predictive modeling and risk assessment
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full bloomberg-small-text font-medium">
              {analytics.portfolioOverview.totalReturn >= 0 ? '+' : ''}{analytics.portfolioOverview.totalReturn.toFixed(2)}%
            </div>
            <div className="bloomberg-section-label text-slate-500">
              Risk-Adj: {analytics.portfolioOverview.riskAdjustedReturn.toFixed(2)}
            </div>
            <div className="bloomberg-section-label text-slate-500">
              Updated {analytics.portfolioOverview.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mt-4 bg-slate-100 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Market Overview', icon: '📊' },
            { key: 'technical', label: 'Technical Analysis', icon: '📈' },
            { key: 'risk', label: 'Risk Analytics', icon: '⚠️' },
            { key: 'sentiment', label: 'Market Sentiment', icon: '🎯' },
            { key: 'predictive', label: 'Predictive Models', icon: '🔮' },
            { key: 'optimization', label: 'Portfolio Optimization', icon: '⚡' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key as AnalyticsView)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md bloomberg-small-text font-medium transition-colors ${
                currentView === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{icon}</span>
              <span className="hidden lg:inline">{label}</span>
              <span className="lg:hidden">{key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {currentView === 'overview' && (
          <OverviewView analytics={analytics} sampleData={sampleData} />
        )}

        {currentView === 'technical' && (
          <TechnicalAnalysisView analytics={analytics} sampleData={sampleData} />
        )}

        {currentView === 'risk' && (
          <RiskAnalyticsView analytics={analytics} />
        )}

        {currentView === 'sentiment' && (
          <SentimentAnalysisView analytics={analytics} />
        )}

        {currentView === 'predictive' && (
          <PredictiveModelsView analytics={analytics} timeFrame={timeFrame} />
        )}

        {currentView === 'optimization' && (
          <PortfolioOptimizationView analytics={analytics} />
        )}
      </div>
    </div>
  );
};

/**
 * Market Overview View
 */
const OverviewView: React.FC<{
  analytics: AdvancedAnalyticsDashboard;
  sampleData: TimeSeriesDataPoint[];
}> = ({ analytics, sampleData }) => {
  const { portfolioOverview, marketAnalysis, performanceBenchmarking } = analytics;

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Portfolio Value"
          value={`$${(portfolioOverview.totalValue / 1000000).toFixed(2)}M`}
          change={portfolioOverview.totalReturn}
          trend={portfolioOverview.totalReturn > 0 ? 'positive' : 'negative'}
          icon="💰"
        />
        <MetricCard
          title="Total Return"
          value={`${portfolioOverview.totalReturn.toFixed(2)}%`}
          subValue="YTD"
          trend={portfolioOverview.totalReturn > 0 ? 'positive' : 'negative'}
          icon="📈"
        />
        <MetricCard
          title="Risk-Adjusted Return"
          value={portfolioOverview.riskAdjustedReturn.toFixed(2)}
          subValue="Sharpe Ratio"
          trend={portfolioOverview.riskAdjustedReturn > 1 ? 'positive' : 'neutral'}
          icon="⚖️"
        />
        <MetricCard
          title="Market Trend"
          value={marketAnalysis.trendDirection.replace('_', ' ')}
          subValue={`${marketAnalysis.trendStrength} strength`}
          trend={marketAnalysis.trendDirection === 'bullish' ? 'positive' :
                 marketAnalysis.trendDirection === 'bearish' ? 'negative' : 'neutral'}
          icon="🎯"
        />
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-900 mb-4">Price Performance</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
          <div className="text-center">
            <div className="text-slate-400 mb-2">📊</div>
            <p className="bloomberg-small-text text-slate-600">Interactive chart would render here</p>
            <p className="bloomberg-section-label text-slate-500">
              {sampleData.length} data points • {sampleData[0].timestamp.toLocaleDateString()} to {sampleData[sampleData.length - 1].timestamp.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Performance vs Benchmarks</h3>
          <div className="space-y-3">
            <BenchmarkComparisonBar
              label="vs Market"
              value={performanceBenchmarking.vsMarket}
              color="blue"
            />
            <BenchmarkComparisonBar
              label="vs Index"
              value={performanceBenchmarking.vsIndex}
              color="green"
            />
            <BenchmarkComparisonBar
              label="vs Peers"
              value={performanceBenchmarking.vsPeers}
              color="purple"
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Return Attribution</h3>
          <div className="space-y-4">
            {Object.entries(performanceBenchmarking.attribution).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-slate-600">
                  {formatIndicatorName(key)}
                </span>
                <span className={`font-medium ${
                  value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-slate-600'
                }`}>
                  {value >= 0 ? '+' : ''}{value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Technical Analysis View
 */
const TechnicalAnalysisView: React.FC<{
  analytics: AdvancedAnalyticsDashboard;
  sampleData: TimeSeriesDataPoint[];
}> = ({ analytics, sampleData }) => {
  const { marketAnalysis } = analytics;

  return (
    <div className="space-y-6">
      {/* Technical Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(marketAnalysis.technicalIndicators).map(([indicator, value]) => (
          <div key={indicator} className="bg-slate-50 rounded-lg p-4">
            <div className="bloomberg-small-text font-medium text-slate-900 mb-1">
              {formatIndicatorName(indicator).toUpperCase()}
            </div>
            <div className="bloomberg-card-title text-blue-600">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </div>
          </div>
        ))}
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Trend Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Direction</span>
              <TrendIndicator direction={marketAnalysis.trendDirection} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Strength</span>
              <StrengthIndicator strength={marketAnalysis.trendStrength} />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Support & Resistance</h3>
          <div className="space-y-3">
            <div>
              <div className="bloomberg-small-text text-slate-600 mb-1">Resistance Levels</div>
              <div className="flex flex-wrap gap-2">
                {marketAnalysis.resistanceLevels.map((level, index) => (
                  <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded bloomberg-small-text">
                    ${level}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="bloomberg-small-text text-slate-600 mb-1">Support Levels</div>
              <div className="flex flex-wrap gap-2">
                {marketAnalysis.supportLevels.map((level, index) => (
                  <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded bloomberg-small-text">
                    ${level}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Chart Placeholder */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-900 mb-4">Technical Analysis Chart</h3>
        <div className="h-80 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
          <div className="text-center">
            <div className="text-slate-400 mb-2">📈</div>
            <p className="bloomberg-small-text text-slate-600">Candlestick chart with technical overlays would render here</p>
            <p className="bloomberg-section-label text-slate-500">
              Including: Bollinger Bands, Moving Averages, RSI, Volume Profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Risk Analytics View
 */
const RiskAnalyticsView: React.FC<{
  analytics: AdvancedAnalyticsDashboard;
}> = ({ analytics }) => {
  const { riskMetrics } = analytics;

  return (
    <div className="space-y-6">
      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RiskMetricCard
          title="Value at Risk"
          value={`${riskMetrics.portfolioVaR.toFixed(2)}%`}
          subtitle="95% confidence"
          riskLevel={Math.abs(riskMetrics.portfolioVaR) > 5 ? 'high' :
                    Math.abs(riskMetrics.portfolioVaR) > 2 ? 'medium' : 'low'}
        />
        <RiskMetricCard
          title="Expected Shortfall"
          value={`${riskMetrics.expectedShortfall.toFixed(2)}%`}
          subtitle="Tail risk"
          riskLevel={Math.abs(riskMetrics.expectedShortfall) > 8 ? 'high' :
                    Math.abs(riskMetrics.expectedShortfall) > 4 ? 'medium' : 'low'}
        />
        <RiskMetricCard
          title="Volatility"
          value={`${riskMetrics.volatility.toFixed(2)}%`}
          subtitle="Annualized"
          riskLevel={riskMetrics.volatility > 30 ? 'high' :
                    riskMetrics.volatility > 15 ? 'medium' : 'low'}
        />
        <RiskMetricCard
          title="Max Drawdown"
          value={`${riskMetrics.maximumDrawdown.toFixed(2)}%`}
          subtitle="Historical"
          riskLevel={riskMetrics.maximumDrawdown > 20 ? 'high' :
                    riskMetrics.maximumDrawdown > 10 ? 'medium' : 'low'}
        />
      </div>

      {/* Risk-Return Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Risk-Adjusted Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Sharpe Ratio</span>
              <span className="font-medium text-blue-600">{riskMetrics.sharpeRatio.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Sortino Ratio</span>
              <span className="font-medium text-blue-600">{riskMetrics.sortinoRatio.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Beta</span>
              <span className="font-medium text-blue-600">{riskMetrics.beta.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Tracking Error</span>
              <span className="font-medium text-blue-600">{riskMetrics.trackingError.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Risk Decomposition</h3>
          <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
            <div className="text-center">
              <div className="text-slate-400 mb-2">📊</div>
              <p className="bloomberg-small-text text-slate-600">Risk decomposition chart would render here</p>
              <p className="bloomberg-section-label text-slate-500">Factor analysis • Sector exposure • Asset allocation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Market Sentiment Analysis View
 */
const SentimentAnalysisView: React.FC<{
  analytics: AdvancedAnalyticsDashboard;
}> = ({ analytics }) => {
  const { sentimentAnalysis } = analytics;

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <div className="bg-slate-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="bloomberg-card-title text-slate-900">Overall Market Sentiment</h3>
          <div className="flex items-center space-x-3">
            <SentimentIndicator sentiment={sentimentAnalysis.overallSentiment} />
            <span className="bloomberg-large-metric text-blue-600">
              {sentimentAnalysis.sentimentScore.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              sentimentAnalysis.sentimentScore > 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{
              width: `${Math.abs(sentimentAnalysis.sentimentScore)}%`,
              marginLeft: sentimentAnalysis.sentimentScore < 0 ? `${100 - Math.abs(sentimentAnalysis.sentimentScore)}%` : '0'
            }}
          ></div>
        </div>
        <div className="flex justify-between bloomberg-small-text text-slate-600 mt-2">
          <span>Extremely Bearish</span>
          <span>Neutral</span>
          <span>Extremely Bullish</span>
        </div>
      </div>

      {/* Sentiment Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Key Factors</h3>
          <div className="space-y-3">
            {Object.entries(sentimentAnalysis.keyFactors).map(([factor, value]) => (
              <div key={factor} className="flex justify-between items-center">
                <span className="text-slate-600">{formatIndicatorName(factor)}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <span className="bloomberg-small-text font-medium">{value.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Market Indicators</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">News Impact</span>
              <span className="font-medium">{sentimentAnalysis.newsImpact.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Social Media Buzz</span>
              <span className="font-medium">{sentimentAnalysis.socialMediaBuzz.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Institutional Flow</span>
              <span className="font-medium">{sentimentAnalysis.institutionalFlow.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Confidence Level</span>
              <span className="font-medium">{(sentimentAnalysis.confidenceLevel * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Predictive Models View
 */
const PredictiveModelsView: React.FC<{
  analytics: AdvancedAnalyticsDashboard;
  timeFrame: TimeFrame;
}> = ({ analytics, timeFrame }) => {
  const model = analytics.predictiveModels[timeFrame] || analytics.predictiveModels['1m'];

  if (!model) {
    return (
      <div className="text-center text-slate-600 py-8">
        <p>No predictive model available for the selected timeframe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="bloomberg-small-text font-medium text-blue-900 mb-1">Model Type</div>
          <div className="bloomberg-card-title text-blue-700">
            {formatIndicatorName(model.modelType)}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="bloomberg-small-text font-medium text-green-900 mb-1">Confidence</div>
          <div className="bloomberg-card-title text-green-700">
            {(model.confidence * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="bloomberg-small-text font-medium text-purple-900 mb-1">R-Squared</div>
          <div className="bloomberg-card-title text-purple-700">
            {model.accuracy.r_squared.toFixed(3)}
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="bloomberg-small-text font-medium text-amber-900 mb-1">MAPE</div>
          <div className="bloomberg-card-title text-amber-700">
            {model.accuracy.mape.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Predictions Chart */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-900 mb-4">
          Price Predictions ({model.timeHorizon.toUpperCase()})
        </h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
          <div className="text-center">
            <div className="text-slate-400 mb-2">📊</div>
            <p className="bloomberg-small-text text-slate-600">Predictive model chart would render here</p>
            <p className="bloomberg-section-label text-slate-500">
              {model.predictions.price.length} predictions • Confidence intervals included
            </p>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-900 mb-4">Feature Importance</h3>
        <div className="space-y-3">
          {Object.entries(model.featureImportance)
            .sort(([,a], [,b]) => b - a)
            .map(([feature, importance]) => (
              <div key={feature} className="flex justify-between items-center">
                <span className="text-slate-600">{formatIndicatorName(feature)}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(importance * 100)}%` }}
                    ></div>
                  </div>
                  <span className="bloomberg-small-text font-medium">{(importance * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Portfolio Optimization View
 */
const PortfolioOptimizationView: React.FC<{
  analytics: AdvancedAnalyticsDashboard;
}> = ({ analytics }) => {
  const { portfolioOptimization } = analytics;

  return (
    <div className="space-y-6">
      {/* Optimization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="bloomberg-small-text font-medium text-blue-900 mb-1">Expected Return</div>
          <div className="bloomberg-card-title text-blue-700">
            {portfolioOptimization.expectedReturn.toFixed(2)}%
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="bloomberg-small-text font-medium text-green-900 mb-1">Expected Risk</div>
          <div className="bloomberg-card-title text-green-700">
            {portfolioOptimization.expectedRisk.toFixed(2)}%
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="bloomberg-small-text font-medium text-purple-900 mb-1">Sharpe Ratio</div>
          <div className="bloomberg-card-title text-purple-700">
            {portfolioOptimization.sharpeRatio.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Allocation Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationChart
          title="Current Allocation"
          allocation={portfolioOptimization.currentAllocation}
        />
        <AllocationChart
          title="Optimized Allocation"
          allocation={portfolioOptimization.optimizedAllocation}
        />
      </div>

      {/* Rebalancing Recommendations */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-900 mb-4">Rebalancing Recommendations</h3>
        <div className="space-y-4">
          {portfolioOptimization.rebalanceRecommendations.map((rec, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">
                  {formatIndicatorName(rec.asset)}
                </span>
                <span className={`px-3 py-1 rounded-full bloomberg-small-text font-medium ${
                  rec.action === 'buy'
                    ? 'bg-green-100 text-green-700'
                    : rec.action === 'sell'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {rec.action.toUpperCase()} {rec.quantity}%
                </span>
              </div>
              <p className="bloomberg-small-text text-slate-600">{rec.reasoning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper Functions
 */

/**
 * Format technical indicator names for display
 */
const formatIndicatorName = (indicator: string): string => {
  // Handle different naming conventions
  let formatted = indicator;

  if (indicator.includes('_')) {
    // Handle underscore-separated names like "bollinger_upper", "price_history"
    formatted = indicator.replace(/_/g, ' ');
  } else {
    // Handle camelCase/lowercase names like "sma14", "rsi"
    formatted = indicator
      // Add space before numbers: "sma14" -> "sma 14"
      .replace(/(\w)(\d+)/g, '$1 $2');
  }

  // Convert to sentence case (only first letter capitalized)
  formatted = formatted.toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

/**
 * Reusable Components
 */
const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: number;
  subValue?: string;
  trend: 'positive' | 'negative' | 'neutral';
  icon: string;
}> = ({ title, value, change, subValue, trend, icon }) => (
  <div className="bg-slate-50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="bloomberg-large-metric">{icon}</span>
      {change !== undefined && (
        <span className={`bloomberg-small-text font-medium ${
          trend === 'positive' ? 'text-green-600' :
          trend === 'negative' ? 'text-red-600' : 'text-slate-600'
        }`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </span>
      )}
    </div>
    <div className="bloomberg-large-metric text-slate-900 mb-1">{value}</div>
    <div className="bloomberg-small-text text-slate-600">{title}</div>
    {subValue && <div className="bloomberg-section-label text-slate-500">{subValue}</div>}
  </div>
);

const RiskMetricCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  riskLevel: 'low' | 'medium' | 'high';
}> = ({ title, value, subtitle, riskLevel }) => (
  <div className={`rounded-lg p-4 ${
    riskLevel === 'high' ? 'bg-red-50' :
    riskLevel === 'medium' ? 'bg-amber-50' : 'bg-green-50'
  }`}>
    <div className="bloomberg-small-text font-medium mb-1 capitalize">
      {title}
    </div>
    <div className={`bloomberg-large-metric mb-1 ${
      riskLevel === 'high' ? 'text-red-700' :
      riskLevel === 'medium' ? 'text-amber-700' : 'text-green-700'
    }`}>
      {value}
    </div>
    <div className="bloomberg-section-label text-slate-600">{subtitle}</div>
  </div>
);

const BenchmarkComparisonBar: React.FC<{
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple';
}> = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-600">{label}</span>
    <div className="flex items-center space-x-2">
      <div className="w-20 bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            color === 'blue' ? 'bg-blue-500' :
            color === 'green' ? 'bg-green-500' : 'bg-purple-500'
          }`}
          style={{ width: `${Math.min(Math.abs(value), 20) * 5}%` }}
        ></div>
      </div>
      <span className={`bloomberg-small-text font-medium ${
        value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-slate-600'
      }`}>
        {value >= 0 ? '+' : ''}{value.toFixed(2)}%
      </span>
    </div>
  </div>
);

const TrendIndicator: React.FC<{ direction: TrendDirection }> = ({ direction }) => (
  <span className={`px-3 py-1 rounded-full bloomberg-small-text font-medium ${
    direction === 'bullish' ? 'bg-green-100 text-green-700' :
    direction === 'bearish' ? 'bg-red-100 text-red-700' :
    direction === 'volatile' ? 'bg-orange-100 text-orange-700' :
    'bg-slate-100 text-slate-700'
  }`}>
    {direction.replace('_', ' ').toUpperCase()}
  </span>
);

const StrengthIndicator: React.FC<{ strength: TrendStrength }> = ({ strength }) => (
  <span className={`px-3 py-1 rounded-full bloomberg-small-text font-medium ${
    strength === 'very_strong' ? 'bg-blue-100 text-blue-700' :
    strength === 'strong' ? 'bg-indigo-100 text-indigo-700' :
    strength === 'moderate' ? 'bg-purple-100 text-purple-700' :
    'bg-slate-100 text-slate-700'
  }`}>
    {strength.replace('_', ' ').toUpperCase()}
  </span>
);

const SentimentIndicator: React.FC<{
  sentiment: 'extremely_bearish' | 'bearish' | 'neutral' | 'bullish' | 'extremely_bullish';
}> = ({ sentiment }) => {
  const config = {
    extremely_bearish: { color: 'bg-red-100 text-red-700', icon: '📉' },
    bearish: { color: 'bg-orange-100 text-orange-700', icon: '📉' },
    neutral: { color: 'bg-slate-100 text-slate-700', icon: '➡️' },
    bullish: { color: 'bg-green-100 text-green-700', icon: '📈' },
    extremely_bullish: { color: 'bg-emerald-100 text-emerald-700', icon: '📈' }
  }[sentiment];

  return (
    <span className={`px-3 py-1 rounded-full bloomberg-small-text font-medium flex items-center space-x-1 ${config.color}`}>
      <span>{config.icon}</span>
      <span>{sentiment.replace('_', ' ').toUpperCase()}</span>
    </span>
  );
};

const AllocationChart: React.FC<{
  title: string;
  allocation: Record<string, number>;
}> = ({ title, allocation }) => (
  <div className="bg-slate-50 rounded-lg p-6">
    <h4 className="font-medium text-slate-900 mb-4">{title}</h4>
    <div className="space-y-3">
      {Object.entries(allocation).map(([asset, weight]) => (
        <div key={asset} className="flex justify-between items-center">
          <span className="text-slate-600">{formatIndicatorName(asset)}</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${weight * 100}%` }}
              ></div>
            </div>
            <span className="bloomberg-small-text font-medium">{(weight * 100).toFixed(1)}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);