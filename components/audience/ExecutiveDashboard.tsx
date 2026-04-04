/**
 * WREI Trading Platform - Executive Dashboard
 *
 * Stage 2 Component 4: Executive Interface (Simplified)
 * MIGRATED: Now uses simplified demo data instead of complex ESC market context
 *
 * Date: March 28, 2026
 */

'use client';

import React, { useState } from 'react';
import { useSimpleDemoStore } from '@/lib/demo-mode/simple-demo-state';
import { useAnalytics } from '../analytics/useAnalytics';
import {
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BanknotesIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { PresentationChartBarIcon } from '@heroicons/react/24/outline';

// Step 1.4: Enhanced Analytics Integration
import {
  AnalyticsDashboard,
  RealTimeMetricsWidget,
  PerformanceChart
} from '../analytics';

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  description?: string;
}

interface ROIMetric {
  category: string;
  current: number;
  improved: number;
  savings: string;
  description: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeType, icon: Icon, description }) => {
  const changeColor = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100'
  }[changeType];

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="bloomberg-small-text font-medium text-gray-600">{title}</p>
          <p className="bloomberg-large-metric text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="bloomberg-small-text text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="ml-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full bloomberg-section-label font-medium ${changeColor}`}>
          {change}
        </span>
      </div>
    </div>
  );
};

export const ExecutiveDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('YTD');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const { isActive: isDemoActive, demoData } = useSimpleDemoStore();

  // Step 1.4: Enhanced Analytics Integration
  const analytics = useAnalytics({
    autoRefresh: true,
    refreshInterval: 5000
  });

  // Generate session ID for analytics tracking
  const sessionId = React.useMemo(() => `exec-session-${Date.now()}`, []);

  // Handle analytics export
  const handleAnalyticsExport = (format: 'pdf' | 'excel') => {
    const data = analytics.analytics;
    console.log(`Exporting executive analytics in ${format} format:`, data);

    // Track interaction (simplified)
    console.log('User exported analytics:', {
      action: 'analytics_export',
      format: format,
      audience: 'executive'
    });
  };

  // Sample data based on NSW ESC market context and Northmore Gordon positioning
  const kpis = [
    {
      title: 'ESC Trading Volume',
      value: 'A$24.0M',
      change: '+18% vs target',
      changeType: 'positive' as const,
      icon: ArrowTrendingUpIcon,
      description: 'Annual transaction volume (12% market share)'
    },
    {
      title: 'Execution Improvement',
      value: '22.3%',
      change: '+7.3% with AI',
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon,
      description: 'Pricing improvement over market average'
    },
    {
      title: 'Compliance Efficiency',
      value: '85%',
      change: '+40% time savings',
      changeType: 'positive' as const,
      icon: ClockIcon,
      description: 'Automated CER compliance processing'
    },
    {
      title: 'Risk Score',
      value: '2.1/10',
      change: '60% improvement',
      changeType: 'positive' as const,
      icon: ShieldCheckIcon,
      description: 'Regulatory and operational risk index'
    }
  ];

  const roiMetrics: ROIMetric[] = [
    {
      category: 'Trading Execution',
      current: 23.00,
      improved: 26.45,
      savings: 'A$2.1M annual',
      description: 'AI-powered trading vs manual trading'
    },
    {
      category: 'Compliance Costs',
      current: 100,
      improved: 60,
      savings: 'A$480K annual',
      description: 'Automated CER compliance vs manual processing'
    },
    {
      category: 'Settlement Risk',
      current: 100,
      improved: 15,
      savings: 'A$320K annual',
      description: 'T+0 settlement vs traditional T+2 processes'
    },
    {
      category: 'Market Intelligence',
      current: 100,
      improved: 125,
      savings: 'A$650K annual',
      description: 'Real-time AEMO data vs delayed market information'
    }
  ];

  const portfolioMetrics = [
    { label: 'Total ESCs Under Management', value: '2.4M ESCs', subtext: 'A$115M value' },
    { label: 'Average Transaction Size', value: '47K ESCs', subtext: 'A$2.25M average' },
    { label: 'Client Satisfaction', value: '94%', subtext: '+8% YoY improvement' },
    { label: 'Market Share Growth', value: '+2.3%', subtext: '12% to 14.3% projected' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8" data-demo="executive-dashboard">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="bloomberg-page-heading mb-2">Executive Dashboard</h1>
            <p className="text-blue-100 bloomberg-card-title">NSW Energy Savings Certificates Trading Performance</p>
            <div className="flex items-center space-x-4 mt-4 text-blue-100">
              <span>Northmore Gordon</span>
              <span>•</span>
              <span>AFSL 246896</span>
              <span>•</span>
              <span>12% Market Share</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bloomberg-large-metric">A$23.00</div>
            <div className="text-blue-200 bloomberg-small-text">Current ESC Spot Price</div>
            <div className="text-blue-200 bloomberg-section-label">Simulated — broker publications</div>
          </div>
        </div>
      </div>

      {/* Time Frame Selector and Analytics Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h2 className="bloomberg-large-metric text-gray-900">Key Performance Indicators</h2>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`inline-flex items-center px-4 py-2 rounded-lg bloomberg-small-text font-medium transition-colors ${
              showAnalytics
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <PresentationChartBarIcon className="w-4 h-4 mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Advanced Analytics'}
          </button>
        </div>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {['QTD', 'YTD', '12M'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-md bloomberg-small-text font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-demo="executive-kpi-cards">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Step 1.4: Enhanced Analytics Dashboard */}
      {showAnalytics && (
        <div className="space-y-6" data-demo="executive-enhanced-analytics">
          {/* Analytics Dashboard */}
          <AnalyticsDashboard
            sessionId={sessionId}
            onExport={(format) => handleAnalyticsExport(format)}
          />

          {/* Performance Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <PerformanceChart
              benchmarks={null}
              selectedAudience="executive"
              timeframe="1m"
              height={300}
            />

            {/* Real-time Metrics Widget */}
            <RealTimeMetricsWidget
              sessionId={sessionId}
              scenarioId={activeScenarioId || 'demo-scenario'}
              selectedAudience="executive"
              isScenarioActive={!!activeScenarioId}
              onMetricsUpdate={(metrics) => {
                // Track metrics updates for executive dashboard
                console.log('Executive dashboard metrics update:', metrics);
              }}
            />
          </div>

          {/* Market Intelligence with Analytics - temporarily disabled */}
          {false && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="bloomberg-metric-value text-gray-900 mb-6">
                Market Position & Competitive Intelligence
              </h3>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className=" text-blue-700 mb-3">Our Performance</h4>
                  <div className="space-y-2 bloomberg-small-text">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Share</span>
                      <span className="font-medium text-gray-900">12.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Position</span>
                      <span className="font-medium text-gray-900">#3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Advantage</span>
                      <span className="font-medium text-green-600">15.2% better</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className=" text-green-700 mb-3">Market Outlook</h4>
                  <div className="space-y-2 bloomberg-small-text">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Size</span>
                      <span className="font-medium text-gray-900">A$850M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth Rate</span>
                      <span className="font-medium text-green-600">+22.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trend</span>
                      <span className="font-medium text-gray-900 capitalize">bullish</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className=" text-purple-700 mb-3">Competitive Advantages</h4>
                  <ul className="bloomberg-small-text text-gray-700 space-y-1">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>dMRV verification technology</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Institutional-grade infrastructure</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>AI-powered trading</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Risk Analytics Summary - temporarily disabled */}
        </div>
      )}

      {/* ROI Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6" data-demo="executive-roi-analysis">
        <h3 className="bloomberg-metric-value text-gray-900 mb-6">
          Platform ROI Analysis - AI vs Traditional Methods
        </h3>
        <div className="space-y-6">
          {roiMetrics.map((metric, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{metric.category}</h4>
                <span className="bloomberg-card-title text-green-600">{metric.savings}</span>
              </div>
              <p className="bloomberg-small-text text-gray-600 mb-3">{metric.description}</p>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between bloomberg-small-text text-gray-600 mb-1">
                    <span>Traditional</span>
                    <span>WREI Platform</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                      className="absolute left-0 top-0 h-2 bg-red-400 rounded-l-full"
                      style={{ width: `${(metric.current / (metric.current + metric.improved)) * 100}%` }}
                    ></div>
                    <div
                      className="absolute right-0 top-0 h-2 bg-green-400 rounded-r-full"
                      style={{ width: `${(metric.improved / (metric.current + metric.improved)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bloomberg-small-text font-medium text-green-600">
                    {((metric.improved - metric.current) / metric.current * 100).toFixed(1)}% improvement
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Overview & Market Intelligence */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Portfolio Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6" data-demo="executive-portfolio-metrics">
          <h3 className="bloomberg-metric-value text-gray-900 mb-6">Portfolio Overview</h3>
          <div className="space-y-4">
            {portfolioMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <div>
                  <div className="font-medium text-gray-900">{metric.label}</div>
                  <div className="bloomberg-small-text text-gray-600">{metric.subtext}</div>
                </div>
                <div className="bloomberg-card-title text-blue-600">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Intelligence */}
        <div className="bg-white rounded-lg border border-gray-200 p-6" data-demo="executive-market-intelligence">
          <h3 className="bloomberg-metric-value text-gray-900 mb-6">Market Intelligence</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <div className="font-medium text-gray-900">NSW ESC Market Size</div>
                <div className="bloomberg-small-text text-gray-600">Annual trading volume</div>
              </div>
              <div className="bloomberg-card-title text-blue-600">A$200M+</div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <div className="font-medium text-gray-900">Total Market Participants</div>
                <div className="bloomberg-small-text text-gray-600">Active traders and institutions</div>
              </div>
              <div className="bloomberg-card-title text-blue-600">850+</div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <div className="font-medium text-gray-900">Price Volatility Range</div>
                <div className="bloomberg-small-text text-gray-600">12-month historical</div>
              </div>
              <div className="bloomberg-card-title text-blue-600">A$38-68</div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <div className="font-medium text-gray-900">Competitive Position</div>
                <div className="bloomberg-small-text text-gray-600">Market share ranking</div>
              </div>
              <div className="bloomberg-card-title text-blue-600">#3 of 45</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6" data-demo="executive-recommendations">
        <h3 className="bloomberg-metric-value text-gray-900 mb-4">
          Strategic Recommendations
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4">
            <h4 className=" text-green-700 mb-2">Immediate Opportunities</h4>
            <ul className="bloomberg-small-text text-gray-700 space-y-1">
              <li>• Expand AI trading to additional ESC categories</li>
              <li>• Leverage real-time AEMO data for predictive pricing</li>
              <li>• Automate remaining manual compliance processes</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className=" text-blue-700 mb-2">Growth Initiatives</h4>
            <ul className="bloomberg-small-text text-gray-700 space-y-1">
              <li>• Target 15% market share within 18 months</li>
              <li>• Expand client base to 100+ institutions</li>
              <li>• Develop cross-jurisdiction carbon trading</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className=" text-purple-700 mb-2">Technology Roadmap</h4>
            <ul className="bloomberg-small-text text-gray-700 space-y-1">
              <li>• Implement advanced ML risk models</li>
              <li>• Enhance blockchain settlement capabilities</li>
              <li>• Develop mobile trading applications</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6" data-demo="executive-action-items">
        <h3 className="bloomberg-metric-value text-gray-900 mb-4">Priority Action Items</h3>
        <div className="space-y-3">
          {[
            { priority: 'High', task: 'Finalize Q2 ESC portfolio expansion strategy', due: '2 days', owner: 'Investment Committee' },
            { priority: 'High', task: 'Review AI trading performance metrics', due: '1 week', owner: 'Trading Desk' },
            { priority: 'Medium', task: 'Assess new Clean Energy Regulator guidelines', due: '2 weeks', owner: 'Compliance Team' },
            { priority: 'Medium', task: 'Evaluate additional Zoniqx integration opportunities', due: '3 weeks', owner: 'Technology Team' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded bloomberg-section-label font-medium ${
                  item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.priority}
                </span>
                <span className="font-medium text-gray-900">{item.task}</span>
              </div>
              <div className="text-right">
                <div className="bloomberg-small-text text-gray-600">Due: {item.due}</div>
                <div className="bloomberg-section-label text-gray-500">{item.owner}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;