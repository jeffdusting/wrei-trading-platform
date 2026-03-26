/**
 * WREI Trading Platform - Analytics Dashboard
 *
 * Step 1.4: Enhanced Negotiation Analytics - Main Dashboard Component
 * Real-time analytics dashboard with performance benchmarking and market analysis
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

import {
  NegotiationMetrics,
  PerformanceBenchmark,
  MarketComparisonData,
  RiskAssessmentData,
  AnalyticsTimeframe
} from './types';

import { AudienceType } from '../audience';
import { AnalyticsEngine } from './AnalyticsEngine';
import { useDemoMode } from '../../lib/demo-mode/demo-state-manager';

interface AnalyticsDashboardProps {
  selectedAudience: AudienceType;
  sessionId?: string;
  scenarioId?: string;
  onExport?: (format: 'pdf' | 'excel' | 'powerpoint') => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  selectedAudience,
  sessionId,
  scenarioId,
  onExport
}) => {
  const demoMode = useDemoMode();
  const [analyticsEngine] = useState(() => AnalyticsEngine.getInstance());
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'risk' | 'market'>('overview');
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('1d');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Real-time data state
  const [currentMetrics, setCurrentMetrics] = useState<NegotiationMetrics | null>(null);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [marketData, setMarketData] = useState<MarketComparisonData | null>(null);
  const [riskData, setRiskData] = useState<RiskAssessmentData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Refresh data
  const refreshData = React.useCallback(() => {
    if (sessionId) {
      const metrics = analyticsEngine.getSessionMetrics(sessionId);
      setCurrentMetrics(metrics);
    }

    setBenchmarks(analyticsEngine.getBenchmarks());
    setMarketData(analyticsEngine.getMarketAnalysis());
    setRiskData(analyticsEngine.getRiskAssessment());
    setLastUpdated(new Date());

    // Track interaction
    demoMode.trackInteraction({
      type: 'click',
      data: {
        action: 'analytics_refresh',
        audience: selectedAudience,
        tab: activeTab
      }
    });
  }, [sessionId, analyticsEngine, demoMode, selectedAudience, activeTab]);

  // Auto-refresh effect
  useEffect(() => {
    refreshData(); // Initial load

    let intervalId: NodeJS.Timeout;
    if (isAutoRefresh) {
      intervalId = setInterval(refreshData, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshData, isAutoRefresh, refreshInterval]);

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  // Format large numbers
  const formatNumber = (value: number): string => {
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1) + 'M';
    }
    if (value >= 1_000) {
      return (value / 1_000).toFixed(1) + 'k';
    }
    return value.toFixed(0);
  };

  // Get audience-specific metrics
  const getAudienceMetrics = useMemo(() => {
    if (!currentMetrics) return null;

    switch (selectedAudience) {
      case 'executive':
        return {
          primary: [
            {
              title: 'Total Trading Volume',
              value: formatNumber(currentMetrics.performance.total_volume) + 't',
              change: '+12.3%',
              trend: 'up' as const,
              icon: ChartBarIcon
            },
            {
              title: 'Price Improvement',
              value: formatPercentage(currentMetrics.performance.price_improvement),
              change: '+2.1%',
              trend: 'up' as const,
              icon: TrendingUpIcon
            },
            {
              title: 'Market Share',
              value: formatPercentage(currentMetrics.market_position.market_share),
              change: '+0.3%',
              trend: 'up' as const,
              icon: EyeIcon
            },
            {
              title: 'Overall Risk Score',
              value: riskData ? riskData.overall_risk_score + '/100' : 'N/A',
              change: '-5.2%',
              trend: 'down' as const,
              icon: ShieldCheckIcon
            }
          ],
          secondary: [
            { label: 'Success Rate', value: formatPercentage(currentMetrics.performance.success_rate) },
            { label: 'Avg. Execution Time', value: currentMetrics.performance.execution_time + ' min' },
            { label: 'Customer Satisfaction', value: currentMetrics.market_position.participant_satisfaction + '/10' },
            { label: 'Automation Rate', value: formatPercentage(currentMetrics.efficiency.automation_rate) }
          ]
        };

      case 'technical':
        return {
          primary: [
            {
              title: 'API Response Time',
              value: '47ms',
              change: '-8.3%',
              trend: 'down' as const,
              icon: ClockIcon
            },
            {
              title: 'System Uptime',
              value: '99.94%',
              change: '+0.02%',
              trend: 'up' as const,
              icon: CheckCircleIcon
            },
            {
              title: 'Settlement Success',
              value: formatPercentage(riskData?.risk_categories.settlement.t0_settlement_metrics.success_rate || 0.98),
              change: '+0.5%',
              trend: 'up' as const,
              icon: ShieldCheckIcon
            },
            {
              title: 'Processing Errors',
              value: '0.6%',
              change: '-2.1%',
              trend: 'down' as const,
              icon: ExclamationTriangleIcon
            }
          ],
          secondary: [
            { label: 'T+0 Settlement Time', value: currentMetrics.esc_metrics.aemo_settlement_time + ' min' },
            { label: 'Throughput', value: currentMetrics.efficiency.negotiations_per_hour + '/hour' },
            { label: 'Cost per Transaction', value: formatCurrency(currentMetrics.efficiency.cost_per_transaction) },
            { label: 'Resource Utilization', value: formatPercentage(currentMetrics.efficiency.resource_utilisation) }
          ]
        };

      case 'compliance':
        return {
          primary: [
            {
              title: 'CER Compliance Score',
              value: formatPercentage(currentMetrics.esc_metrics.cer_compliance_score),
              change: '+1.2%',
              trend: 'up' as const,
              icon: CheckCircleIcon
            },
            {
              title: 'Certificate Verification',
              value: formatPercentage(currentMetrics.esc_metrics.certificate_verification_rate),
              change: '+0.3%',
              trend: 'up' as const,
              icon: ShieldCheckIcon
            },
            {
              title: 'Regulatory Risk',
              value: riskData ? riskData.risk_categories.regulatory.score + '/100' : 'N/A',
              change: '-3.5%',
              trend: 'down' as const,
              icon: ExclamationTriangleIcon
            },
            {
              title: 'Additionality Score',
              value: currentMetrics.esc_metrics.additionality_validation_score + '/100',
              change: '+2.8%',
              trend: 'up' as const,
              icon: DocumentTextIcon
            }
          ],
          secondary: [
            { label: 'AFSL Compliance', value: riskData ? formatPercentage(riskData.risk_categories.regulatory.factors.afsl_compliance) : 'N/A' },
            { label: 'AML/CTF Compliance', value: riskData ? formatPercentage(riskData.risk_categories.regulatory.factors.aml_ctf_compliance) : 'N/A' },
            { label: 'Reporting Timeliness', value: riskData ? formatPercentage(riskData.risk_categories.regulatory.factors.reporting_timeliness) : 'N/A' },
            { label: 'Audit Trail Completeness', value: '99.8%' }
          ]
        };

      default:
        return null;
    }
  }, [currentMetrics, riskData, selectedAudience]);

  // Get performance benchmarks for current audience
  const getAudienceBenchmarks = useMemo(() => {
    return benchmarks.filter(benchmark => {
      switch (selectedAudience) {
        case 'executive':
          return ['performance', 'efficiency'].includes(benchmark.category);
        case 'technical':
          return ['efficiency', 'performance'].includes(benchmark.category);
        case 'compliance':
          return ['compliance', 'risk'].includes(benchmark.category);
        default:
          return true;
      }
    });
  }, [benchmarks, selectedAudience]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    demoMode.trackInteraction({
      type: 'click',
      data: {
        action: 'analytics_tab_change',
        tab: tab,
        audience: selectedAudience
      }
    });
  };

  const handleExport = (format: 'pdf' | 'excel' | 'powerpoint') => {
    if (onExport) {
      onExport(format);
    }
    demoMode.trackInteraction({
      type: 'click',
      data: {
        action: 'analytics_export',
        format: format,
        audience: selectedAudience
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Enhanced Negotiation Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time performance metrics and market analysis • {selectedAudience} view
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Auto-refresh toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isAutoRefresh
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isAutoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>

            <button
              onClick={refreshData}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Export options */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-3 py-1 bg-green-50 text-green-700 rounded text-sm font-medium hover:bg-green-100 transition-colors"
            >
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Last updated indicator */}
      <div className="mb-6 text-sm text-gray-500 flex items-center space-x-2">
        <ClockIcon className="w-4 h-4" />
        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        {currentMetrics && (
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
            Live Data
          </span>
        )}
      </div>

      {/* Key Metrics Cards */}
      {getAudienceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getAudienceMetrics.primary.map((metric, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <metric.icon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-900">{metric.title}</h3>
                </div>
                <div className={`flex items-center space-x-1 ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUpIcon className="w-4 h-4" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">{metric.change}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'performance', label: 'Performance', icon: TrendingUpIcon },
            { id: 'risk', label: 'Risk Analysis', icon: ShieldCheckIcon },
            { id: 'market', label: 'Market Position', icon: EyeIcon }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Secondary Metrics */}
            {getAudienceMetrics && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
                <div className="space-y-3">
                  {getAudienceMetrics.secondary.map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                      <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Summary */}
            {marketData && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">NSW ESC Market Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Current Spot Price</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(marketData.price_analysis.current_market_price)}/tonne
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Our Average Price</span>
                    <span className="text-sm font-bold text-green-700">
                      {formatCurrency(marketData.price_analysis.our_average_price)}/tonne
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Market Position</span>
                    <span className="text-sm font-bold text-gray-900">
                      #{marketData.competitive_position.our_position} of {marketData.market_metrics.participant_count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Market Share</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPercentage(marketData.volume_analysis.volume_share)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Benchmarks</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getAudienceBenchmarks.map((benchmark) => (
                <div key={benchmark.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-900">{benchmark.name}</h4>
                    <div className={`flex items-center space-x-1 ${
                      benchmark.trend.direction === 'up' ? 'text-green-600' :
                      benchmark.trend.direction === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {benchmark.trend.direction === 'up' && <TrendingUpIcon className="w-4 h-4" />}
                      {benchmark.trend.direction === 'down' && <TrendingDownIcon className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {benchmark.trend.change_percentage > 0 ? '+' : ''}{benchmark.trend.change_percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Performance</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {benchmark.values.current > 1 ?
                          formatCurrency(benchmark.values.current) :
                          formatPercentage(benchmark.values.current)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Market Average</span>
                      <span className="text-sm font-medium text-gray-600">
                        {benchmark.values.market_average > 1 ?
                          formatCurrency(benchmark.values.market_average) :
                          formatPercentage(benchmark.values.market_average)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Industry Best</span>
                      <span className="text-sm font-medium text-green-600">
                        {benchmark.values.industry_best > 1 ?
                          formatCurrency(benchmark.values.industry_best) :
                          formatPercentage(benchmark.values.industry_best)
                        }
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Performance Score</span>
                      <span className="text-lg font-bold text-blue-600">
                        {benchmark.analysis.performance_score}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risk' && riskData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Overall Risk Score:</span>
                <span className={`text-2xl font-bold ${
                  riskData.overall_risk_score <= 20 ? 'text-green-600' :
                  riskData.overall_risk_score <= 40 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {riskData.overall_risk_score}/100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(riskData.risk_categories).map(([category, data]) => (
                <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-900 capitalize">
                      {category.replace('_', ' ')} Risk
                    </h4>
                    <span className={`text-lg font-bold ${
                      data.score <= 20 ? 'text-green-600' :
                      data.score <= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.score}/100
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(data.factors).map(([factor, value]) => (
                      <div key={factor} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">
                          {factor.replace('_', ' ')}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {typeof value === 'number' && value <= 1 ?
                            formatPercentage(value) :
                            value
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Alerts */}
            {riskData.monitoring.current_alerts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="text-base font-semibold text-yellow-800 mb-3">Active Risk Alerts</h4>
                <div className="space-y-2">
                  {riskData.monitoring.current_alerts.map((alert, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">{alert.message}</span>
                      <span className="text-xs text-yellow-600">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'market' && marketData && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Market Position Analysis</h3>

            {/* Competitive Position */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Market Leaders</h4>
                <div className="space-y-4">
                  {marketData.competitive_position.market_leaders.map((leader, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{leader.name}</span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatPercentage(leader.market_share)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Key Strengths:</span> {leader.key_strengths.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Our Competitive Advantages</h4>
                <ul className="space-y-2">
                  {marketData.competitive_position.competitive_advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Market Metrics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Market Metrics</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(marketData.market_metrics.total_market_size / 1000000)}M
                  </div>
                  <div className="text-sm text-gray-600">Total Market Size</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    +{formatPercentage(marketData.market_metrics.growth_rate)}
                  </div>
                  <div className="text-sm text-gray-600">Annual Growth</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(marketData.volume_analysis.total_market_volume / 1000)}k t
                  </div>
                  <div className="text-sm text-gray-600">Annual Volume</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {marketData.market_metrics.participant_count}
                  </div>
                  <div className="text-sm text-gray-600">Active Participants</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;