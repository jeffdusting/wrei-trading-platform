/**
 * WREI Trading Platform - Intelligent Analytics Dashboard
 *
 * Stage 2 Component 3: AI-Enhanced Analytics Dashboard Component
 * Real-time predictive analytics with audience-specific insights
 *
 * Date: March 26, 2026
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useIntelligentAnalytics } from './useIntelligentAnalytics';
import { AudienceType } from '../audience';
import {
  PredictiveAnalytics,
  MarketForecast,
  RiskPredictions,
  PerformanceOptimisation,
  CompetitiveIntelligence,
  AIInsights,
  PredictionTimeframe,
  RiskLevel
} from './types';

// Component props interface
interface IntelligentAnalyticsDashboardProps {
  sessionId: string;
  selectedAudience: AudienceType;
  onExport?: (format: 'pdf' | 'excel' | 'powerpoint') => void;
  className?: string;
}

// Tab navigation interface
type DashboardTab = 'overview' | 'market' | 'risk' | 'performance' | 'competitive' | 'insights';

export const IntelligentAnalyticsDashboard: React.FC<IntelligentAnalyticsDashboardProps> = ({
  sessionId,
  selectedAudience,
  onExport,
  className = ''
}) => {
  // Hook for intelligent analytics
  const {
    predictiveAnalytics,
    marketForecast,
    riskPredictions,
    performanceOptimisation,
    competitiveIntelligence,
    aiInsights,
    isLoading,
    isGeneratingPredictions,
    isRefreshing,
    error,
    lastUpdateTime,
    apiResponseTime,
    engineStatus,
    engineHealth,
    hasValidPredictions,
    isDataStale,
    predictionAge,
    refreshPredictions,
    generateSpecificPrediction
  } = useIntelligentAnalytics({
    sessionId,
    audienceType: selectedAudience,
    autoRefresh: true,
    refreshInterval: selectedAudience === 'technical' ? 5 : selectedAudience === 'executive' ? 10 : 15,
    enableRealTimeUpdates: true,
    confidenceThreshold: selectedAudience === 'executive' ? 80 : 70
  });

  // Component state
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Toggle detail sections
  const toggleDetails = (section: string) => {
    setShowDetails(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get audience-specific insights
  const audienceInsights = useMemo(() => {
    if (!aiInsights) return null;

    return aiInsights.audience_insights[selectedAudience];
  }, [aiInsights, selectedAudience]);

  // Get priority metrics for audience
  const priorityMetrics = useMemo(() => {
    const metrics = [];

    switch (selectedAudience) {
      case 'executive':
        if (competitiveIntelligence) metrics.push('Market Share Prediction');
        if (performanceOptimisation) metrics.push('ROI Optimisation');
        if (riskPredictions) metrics.push('Strategic Risk Assessment');
        break;
      case 'technical':
        if (performanceOptimisation) metrics.push('System Performance');
        if (marketForecast) metrics.push('API Response Optimisation');
        if (riskPredictions) metrics.push('Infrastructure Health');
        break;
      case 'compliance':
        if (riskPredictions) metrics.push('Regulatory Compliance');
        if (marketForecast) metrics.push('Compliance Cost Forecast');
        if (performanceOptimisation) metrics.push('Audit Readiness');
        break;
    }

    return metrics;
  }, [selectedAudience, competitiveIntelligence, performanceOptimisation, riskPredictions, marketForecast]);

  // Format currency values (Australian dollars)
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  };

  // Get status colour based on risk level
  const getRiskColour = (riskLevel: RiskLevel): string => {
    const colours = {
      very_low: 'text-green-600 bg-green-50',
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      very_high: 'text-red-600 bg-red-50'
    };
    return colours[riskLevel] || colours.medium;
  };

  // Tab configuration
  const tabs: Array<{ id: DashboardTab; label: string; icon: string }> = [
    { id: 'overview', label: 'Executive Summary', icon: '📊' },
    { id: 'market', label: 'Market Forecast', icon: '📈' },
    { id: 'risk', label: 'Risk Analysis', icon: '⚠️' },
    { id: 'performance', label: 'Performance', icon: '🎯' },
    { id: 'competitive', label: 'Market Intelligence', icon: '🏆' },
    { id: 'insights', label: 'AI Insights', icon: '🤖' }
  ];

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Analytics Error</h3>
            <p className="text-sm text-red-600">Failed to load intelligent analytics</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={() => refreshPredictions()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colours"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Intelligent Analytics Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                AI-Enhanced Predictive Insights • {selectedAudience} View
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex space-x-2">
            <div className={`px-2 py-1 text-xs rounded-full ${
              engineStatus === 'active' ? 'bg-green-100 text-green-700' :
              engineStatus === 'processing' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {engineStatus === 'active' ? '● Active' :
               engineStatus === 'processing' ? '● Processing' :
               '● Error'}
            </div>
            <div className={`px-2 py-1 text-xs rounded-full ${
              engineHealth === 'healthy' ? 'bg-green-100 text-green-700' :
              engineHealth === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {engineHealth}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Performance metrics */}
          {lastUpdateTime && (
            <div className="text-xs text-gray-500 text-right">
              <div>Updated: {Math.floor(predictionAge! / 60)}m {predictionAge! % 60}s ago</div>
              <div>Response: {apiResponseTime}ms</div>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={refreshPredictions}
            disabled={isRefreshing || isGeneratingPredictions}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colours"
          >
            <span className={isRefreshing || isGeneratingPredictions ? 'animate-spin' : ''}>
              🔄
            </span>
            <span>
              {isRefreshing || isGeneratingPredictions ? 'Generating...' : 'Refresh'}
            </span>
          </button>

          {/* Export buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => onExport?.('pdf')}
              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colours"
            >
              Export PDF
            </button>
            <button
              onClick={() => onExport?.('excel')}
              className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colours"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {(isLoading || isGeneratingPredictions) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-700">
              {isGeneratingPredictions ? 'Generating AI predictions...' : 'Loading analytics...'}
            </span>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex space-x-0 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colours ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="p-6">
        {/* Data staleness warning */}
        {isDataStale && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-sm text-yellow-800">
                Predictions may be stale. Consider refreshing for latest insights.
              </span>
            </div>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'overview' && (
          <OverviewTab
            predictiveAnalytics={predictiveAnalytics}
            audienceInsights={audienceInsights}
            priorityMetrics={priorityMetrics}
            selectedAudience={selectedAudience}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
        )}

        {activeTab === 'market' && (
          <MarketForecastTab
            marketForecast={marketForecast}
            selectedAudience={selectedAudience}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
            generateSpecificPrediction={generateSpecificPrediction}
          />
        )}

        {activeTab === 'risk' && (
          <RiskAnalysisTab
            riskPredictions={riskPredictions}
            selectedAudience={selectedAudience}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
            getRiskColour={getRiskColour}
            generateSpecificPrediction={generateSpecificPrediction}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab
            performanceOptimisation={performanceOptimisation}
            selectedAudience={selectedAudience}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
            generateSpecificPrediction={generateSpecificPrediction}
          />
        )}

        {activeTab === 'competitive' && (
          <CompetitiveIntelligenceTab
            competitiveIntelligence={competitiveIntelligence}
            selectedAudience={selectedAudience}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
            generateSpecificPrediction={generateSpecificPrediction}
          />
        )}

        {activeTab === 'insights' && (
          <AIInsightsTab
            aiInsights={aiInsights}
            audienceInsights={audienceInsights}
            selectedAudience={selectedAudience}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
            getRiskColour={getRiskColour}
          />
        )}

        {/* No data state */}
        {!hasValidPredictions && !isLoading && !isGeneratingPredictions && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-400">🔮</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Predictions Available</h4>
            <p className="text-gray-600 mb-4">
              Click &quot;Refresh&quot; to generate AI-powered predictive analytics for this session.
            </p>
            <button
              onClick={() => refreshPredictions()}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colours"
            >
              Generate Predictions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Tab component interfaces
interface TabProps {
  selectedAudience: AudienceType;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number, decimals?: number) => string;
  generateSpecificPrediction?: (type: any) => Promise<void>;
  getRiskColour?: (risk: RiskLevel) => string;
}

/**
 * Overview Tab Component
 */
const OverviewTab: React.FC<TabProps & {
  predictiveAnalytics: PredictiveAnalytics | null;
  audienceInsights: any;
  priorityMetrics: string[];
}> = ({ predictiveAnalytics, audienceInsights, priorityMetrics, selectedAudience, formatCurrency, formatPercentage }) => {
  if (!predictiveAnalytics) {
    return <div className="text-center text-gray-500 py-8">No overview data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Executive summary */}
      {predictiveAnalytics.ai_insights?.executive_summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">Executive Summary</h4>
          <div className="space-y-2">
            {predictiveAnalytics.ai_insights.executive_summary.key_findings.map((finding, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-sm text-blue-800">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priorityMetrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">{metric}</h5>
            <div className="text-2xl font-bold text-blue-600">
              {/* Placeholder values - would be calculated from actual data */}
              {index === 0 ? '92.4%' : index === 1 ? formatCurrency(850000) : '18.5%'}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {index === 0 ? 'Confidence Level' : index === 1 ? 'Optimisation Value' : 'Improvement'}
            </div>
          </div>
        ))}
      </div>

      {/* Audience-specific recommendations */}
      {audienceInsights && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-green-900 mb-3">
            Recommendations for {selectedAudience} Team
          </h4>
          <div className="space-y-2">
            {(audienceInsights.strategic_recommendations ||
              audienceInsights.system_optimisations ||
              audienceInsights.compliance_priorities || [])
              .slice(0, 5)
              .map((rec: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm text-green-800">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Market Forecast Tab Component
 */
const MarketForecastTab: React.FC<TabProps & {
  marketForecast: MarketForecast | null;
}> = ({ marketForecast, formatCurrency, formatPercentage, generateSpecificPrediction }) => {
  if (!marketForecast) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No market forecast data available</p>
        <button
          onClick={() => generateSpecificPrediction?.('market_forecast')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Market Forecast
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">NSW ESC Market Forecast</h4>

      {/* Price predictions */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Price Predictions</h5>
        {marketForecast.price_prediction.map((prediction, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-gray-900">
                  {prediction.timeframe.toUpperCase()} Forecast
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(prediction.predicted_price)}
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  prediction.confidence >= 80 ? 'bg-green-100 text-green-700' :
                  prediction.confidence >= 70 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {prediction.confidence}% Confidence
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              Range: {formatCurrency(prediction.confidence_interval.lower_bound)} - {formatCurrency(prediction.confidence_interval.upper_bound)}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Key Drivers:</div>
              {prediction.key_drivers.map((driver, driverIndex) => (
                <div key={driverIndex} className="text-xs text-gray-600 flex items-center space-x-1">
                  <span>•</span>
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trend analysis */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Market Trend Analysis</h5>
        <div className="grid gap-4">
          {marketForecast.trend_analysis.map((trend, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{trend.indicator}</div>
                  <div className="text-sm text-gray-600 mt-1">{trend.reasoning}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    trend.signal.includes('bullish') ? 'bg-green-100 text-green-700' :
                    trend.signal.includes('bearish') ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {trend.signal.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {trend.strength}% Strength
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Risk Analysis Tab Component
 */
const RiskAnalysisTab: React.FC<TabProps & {
  riskPredictions: RiskPredictions | null;
}> = ({ riskPredictions, formatCurrency, formatPercentage, getRiskColour, generateSpecificPrediction }) => {
  if (!riskPredictions) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No risk prediction data available</p>
        <button
          onClick={() => generateSpecificPrediction?.('risk_predictions')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Risk Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Risk Assessment & Predictions</h4>
        <div className={`px-3 py-1 rounded text-sm font-medium ${getRiskColour!(riskPredictions.risk_level)}`}>
          Overall Risk: {riskPredictions.risk_level.replace('_', ' ').toUpperCase()} ({riskPredictions.overall_risk_score}/100)
        </div>
      </div>

      {/* Emerging risks */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Emerging Risk Factors</h5>
        {riskPredictions.emerging_risks.map((risk, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="font-medium text-gray-900">{risk.risk_type}</div>
              <div className="flex space-x-2">
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                  {risk.probability}% Probability
                </span>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                  Impact: {risk.potential_impact}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{risk.risk_description}</p>
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Mitigation Strategies:</div>
              {risk.mitigation_suggestions.map((suggestion, sugIndex) => (
                <div key={sugIndex} className="text-xs text-gray-600 flex items-center space-x-1">
                  <span>•</span>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Stress test scenarios */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Stress Test Scenarios</h5>
        <div className="grid gap-4">
          {riskPredictions.stress_test_scenarios.map((scenario, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{scenario.scenario_name}</div>
                  <div className="text-sm text-red-600 mt-1">
                    Potential Loss: {formatCurrency(scenario.potential_loss)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Recovery Time: {scenario.recovery_time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    {scenario.probability}% Probability
                  </div>
                  <div className={`text-xs px-2 py-1 rounded mt-2 ${
                    scenario.preparedness_score >= 80 ? 'bg-green-100 text-green-700' :
                    scenario.preparedness_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {scenario.preparedness_score}% Prepared
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Performance Tab Component
 */
const PerformanceTab: React.FC<TabProps & {
  performanceOptimisation: PerformanceOptimisation | null;
}> = ({ performanceOptimisation, formatCurrency, formatPercentage, generateSpecificPrediction }) => {
  if (!performanceOptimisation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No performance data available</p>
        <button
          onClick={() => generateSpecificPrediction?.('performance_optimisation')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Performance Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Performance Optimisation</h4>

      {/* Current performance metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {performanceOptimisation.current_performance.efficiency_score}%
          </div>
          <div className="text-sm text-blue-800">Efficiency Score</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {performanceOptimisation.current_performance.cost_effectiveness}%
          </div>
          <div className="text-sm text-green-800">Cost Effectiveness</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {performanceOptimisation.current_performance.market_competitiveness}%
          </div>
          <div className="text-sm text-purple-800">Market Position</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {performanceOptimisation.current_performance.automation_level}%
          </div>
          <div className="text-sm text-orange-800">Automation Level</div>
        </div>
      </div>

      {/* Optimisation opportunities */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Optimisation Opportunities</h5>
        {performanceOptimisation.optimisation_opportunities.map((opportunity, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-gray-900">{opportunity.opportunity_name}</div>
                <div className="text-sm text-gray-600">{opportunity.category.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatPercentage(opportunity.potential_improvement / 100)} Improvement
                </div>
                <div className="text-sm text-green-700">
                  {formatCurrency(opportunity.estimated_value)} Annual Value
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-600">Effort: </span>
                <span className={`font-medium ${
                  opportunity.implementation_effort === 'low' ? 'text-green-600' :
                  opportunity.implementation_effort === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {opportunity.implementation_effort.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Timeline: </span>
                <span className="font-medium text-gray-900">{opportunity.timeline}</span>
              </div>
              <div>
                <span className="text-gray-600">AI Confidence: </span>
                <span className="font-medium text-blue-600">
                  {opportunity.ai_confidence.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Implementation Steps:</div>
              {opportunity.detailed_steps.map((step, stepIndex) => (
                <div key={stepIndex} className="text-xs text-gray-600 flex items-center space-x-1">
                  <span>{stepIndex + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Competitive Intelligence Tab Component
 */
const CompetitiveIntelligenceTab: React.FC<TabProps & {
  competitiveIntelligence: CompetitiveIntelligence | null;
}> = ({ competitiveIntelligence, formatCurrency, formatPercentage, generateSpecificPrediction }) => {
  if (!competitiveIntelligence) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No competitive intelligence data available</p>
        <button
          onClick={() => generateSpecificPrediction?.('competitive_intelligence')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Market Intelligence
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Competitive Market Intelligence</h4>

      {/* Market share predictions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-3">Market Share Projections</h5>
        <div className="grid gap-3">
          {competitiveIntelligence.predicted_market_share.map((prediction, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="text-sm text-blue-800">{prediction.timeframe.toUpperCase()}</div>
              <div className="flex items-center space-x-2">
                <div className="text-lg font-bold text-blue-600">
                  {formatPercentage(prediction.predicted_share)}
                </div>
                <div className="text-xs text-blue-700">
                  ({prediction.confidence.replace('_', ' ')})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor analysis */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Competitor Analysis</h5>
        {competitiveIntelligence.competitor_insights.map((competitor, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-gray-900">{competitor.competitor_name}</div>
                <div className="text-sm text-gray-600">
                  Current: {formatPercentage(competitor.current_market_share)} →
                  Predicted: {formatPercentage(competitor.predicted_market_share)}
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                competitor.threat_level === 'low' ? 'bg-green-100 text-green-700' :
                competitor.threat_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {competitor.threat_level.toUpperCase()} Threat
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-700 mb-2">Competitive Advantages:</div>
                <ul className="space-y-1">
                  {competitor.competitive_advantages.map((advantage, advIndex) => (
                    <li key={advIndex} className="flex items-center space-x-1 text-green-600">
                      <span>•</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-red-700 mb-2">Vulnerabilities:</div>
                <ul className="space-y-1">
                  {competitor.vulnerabilities.map((vulnerability, vulnIndex) => (
                    <li key={vulnIndex} className="flex items-center space-x-1 text-red-600">
                      <span>•</span>
                      <span>{vulnerability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market opportunities */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Market Opportunities</h5>
        {competitiveIntelligence.market_opportunities.map((opportunity, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-gray-900">{opportunity.opportunity_type}</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(opportunity.market_size)}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Success Rate: </span>
                <span className="font-medium text-gray-900">{opportunity.success_probability}%</span>
              </div>
              <div>
                <span className="text-gray-600">Timeline: </span>
                <span className="font-medium text-gray-900">{opportunity.time_to_capture}</span>
              </div>
              <div>
                <span className="text-gray-600">Investment: </span>
                <span className="font-medium text-gray-900">{formatCurrency(opportunity.required_investment)}</span>
              </div>
              <div>
                <span className="text-gray-600">Competition: </span>
                <span className={`font-medium ${
                  opportunity.competitive_intensity === 'low' ? 'text-green-600' :
                  opportunity.competitive_intensity === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {opportunity.competitive_intensity.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * AI Insights Tab Component
 */
const AIInsightsTab: React.FC<TabProps & {
  aiInsights: AIInsights | null;
  audienceInsights: any;
}> = ({ aiInsights, audienceInsights, selectedAudience, formatCurrency, formatPercentage, getRiskColour }) => {
  if (!aiInsights) {
    return <div className="text-center text-gray-500 py-8">No AI insights data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h4>
        <div className="text-xs text-gray-500">
          Model: {aiInsights.model_version} • Generated: {new Date(aiInsights.generated_at).toLocaleString()}
        </div>
      </div>

      {/* Critical alerts */}
      {aiInsights.executive_summary.risk_alerts.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-medium text-gray-800">Critical Alerts</h5>
          {aiInsights.executive_summary.risk_alerts.map((alert, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getRiskColour!(alert.severity as RiskLevel)}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{alert.alert_type}</div>
                <div className="text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                  {alert.severity.toUpperCase()}
                </div>
              </div>
              <p className="text-sm mb-2">{alert.message}</p>
              <div className="text-xs">
                <strong>Recommended Action:</strong> {alert.recommended_action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strategic implications */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h5 className="font-medium text-purple-900 mb-3">Strategic Implications</h5>
        <div className="space-y-2">
          {aiInsights.executive_summary.strategic_implications.map((implication, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-purple-600 mt-1">💡</span>
              <span className="text-sm text-purple-800">{implication}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audience-specific insights */}
      {audienceInsights && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-900 mb-3">
            {selectedAudience.charAt(0).toUpperCase() + selectedAudience.slice(1)} Team Priorities
          </h5>
          <div className="space-y-3">
            {Object.entries(audienceInsights).map(([key, values]) => (
              <div key={key}>
                <div className="text-sm font-medium text-green-800 mb-1">
                  {key.replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase())}:
                </div>
                <div className="space-y-1">
                  {(values as string[]).slice(0, 3).map((item: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-xs text-green-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern recognition */}
      <div className="space-y-4">
        <h5 className="font-medium text-gray-800">Pattern Recognition</h5>
        {aiInsights.pattern_recognition.map((pattern, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-gray-900">{pattern.pattern_type}</div>
              <div className="flex items-center space-x-2">
                <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {pattern.historical_accuracy}% Accurate
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  pattern.confidence === 'very_high' ? 'bg-green-100 text-green-700' :
                  pattern.confidence === 'high' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {pattern.confidence.replace('_', ' ').toUpperCase()} Confidence
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{pattern.pattern_description}</p>
            <div className="text-sm font-medium text-gray-900">
              Predicted Outcome: {pattern.predicted_outcome}
            </div>
          </div>
        ))}
      </div>

      {/* Market sentiment */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h5 className="font-medium text-indigo-900 mb-3">Market Sentiment Analysis</h5>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-indigo-800">Overall Sentiment:</span>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded text-sm font-medium ${
                aiInsights.market_intelligence.sentiment_analysis.overall_sentiment === 'very_positive' ? 'bg-green-100 text-green-700' :
                aiInsights.market_intelligence.sentiment_analysis.overall_sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                aiInsights.market_intelligence.sentiment_analysis.overall_sentiment === 'neutral' ? 'bg-gray-100 text-gray-700' :
                'bg-red-100 text-red-700'
              }`}>
                {aiInsights.market_intelligence.sentiment_analysis.overall_sentiment.replace('_', ' ').toUpperCase()}
              </div>
              <span className="text-sm font-bold text-indigo-700">
                {aiInsights.market_intelligence.sentiment_analysis.sentiment_score > 0 ? '+' : ''}
                {aiInsights.market_intelligence.sentiment_analysis.sentiment_score}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-indigo-800 mb-1">Key Sentiment Drivers:</div>
            <div className="space-y-1">
              {aiInsights.market_intelligence.sentiment_analysis.sentiment_drivers.map((driver, index) => (
                <div key={index} className="flex items-center space-x-1 text-xs text-indigo-700">
                  <span>•</span>
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentAnalyticsDashboard;