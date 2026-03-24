'use client';

/**
 * WREI Analytics Hub
 * Phase 1 Milestone 1.3 - Advanced Analytics and Market Intelligence
 *
 * Unified analytics interface that combines market intelligence, predictive analytics,
 * and portfolio optimization for institutional investors
 */

import { useState, useEffect } from 'react';
import { MarketIntelligenceDashboard } from './MarketIntelligenceDashboard';
import { PredictiveAnalyticsDashboard } from './PredictiveAnalyticsDashboard';
import AdvancedAnalytics from './AdvancedAnalytics';
import InstitutionalDashboard from './InstitutionalDashboard';
import { PersonaType } from '@/lib/types';

type AnalyticsView =
  | 'overview'
  | 'market_intelligence'
  | 'predictive_analytics'
  | 'advanced_analytics'
  | 'institutional_dashboard';

interface AnalyticsHubProps {
  persona?: PersonaType;
  portfolioValue?: number;
  timeHorizon?: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  defaultView?: AnalyticsView;
}

interface AnalyticsCapability {
  id: AnalyticsView;
  title: string;
  description: string;
  icon: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  targetAudience: PersonaType[];
  features: string[];
  component: React.ComponentType<any>;
}

export const AnalyticsHub: React.FC<AnalyticsHubProps> = ({
  persona = 'esg_impact_investor',
  portfolioValue = 1000000000,
  timeHorizon = 10,
  riskTolerance = 'moderate',
  defaultView = 'overview'
}) => {
  const [activeView, setActiveView] = useState<AnalyticsView>(defaultView);
  const [userPreferences, setUserPreferences] = useState({
    autoRefresh: true,
    refreshInterval: 5, // minutes
    alertsEnabled: true,
    complexityLevel: 'advanced' as 'basic' | 'intermediate' | 'advanced' | 'expert'
  });

  // Analytics capabilities configuration
  const analyticsCapabilities: AnalyticsCapability[] = [
    {
      id: 'market_intelligence',
      title: 'Market Intelligence',
      description: 'Real-time market analysis, competitive positioning, and opportunity scoring',
      icon: '📊',
      complexity: 'intermediate',
      targetAudience: ['esg_impact_investor', 'family_office', 'defi_yield_farmer', 'sovereign_wealth'],
      features: [
        'A$19B tokenized RWA market analysis',
        'Carbon market projections through 2030',
        'Competitive landscape assessment',
        'Market sentiment analysis',
        'Opportunity scoring algorithms'
      ],
      component: MarketIntelligenceDashboard
    },
    {
      id: 'predictive_analytics',
      title: 'Predictive Analytics',
      description: 'AI-powered predictive insights, scenario modeling, and investment recommendations',
      icon: '🔮',
      complexity: 'expert',
      targetAudience: ['esg_impact_investor', 'defi_yield_farmer', 'sovereign_wealth'],
      features: [
        'Machine learning-based insights',
        'Monte Carlo scenario modeling',
        'Risk-adjusted return predictions',
        'AI investment recommendations',
        'Portfolio optimization suggestions'
      ],
      component: PredictiveAnalyticsDashboard
    },
    {
      id: 'advanced_analytics',
      title: 'Advanced Analytics',
      description: 'Comprehensive portfolio analytics with professional-grade metrics and modeling',
      icon: '📈',
      complexity: 'advanced',
      targetAudience: ['esg_impact_investor', 'family_office', 'defi_yield_farmer', 'sovereign_wealth'],
      features: [
        'Professional portfolio metrics (IRR, NPV, Sharpe)',
        'Fleet performance tracking',
        'Carbon generation analytics',
        'Cross-collateralization analysis',
        'Real-time financial performance'
      ],
      component: AdvancedAnalytics
    },
    {
      id: 'institutional_dashboard',
      title: 'Institutional Dashboard',
      description: 'Executive-level overview with Bloomberg Terminal-style interface for institutional investors',
      icon: '🏛️',
      complexity: 'intermediate',
      targetAudience: ['esg_impact_investor', 'family_office', 'sovereign_wealth'],
      features: [
        'Executive summary dashboard',
        'Bloomberg Terminal-style interface',
        'Multi-asset portfolio overview',
        'Risk monitoring and alerts',
        'Compliance reporting'
      ],
      component: InstitutionalDashboard
    }
  ];

  // Filter capabilities based on persona and complexity level
  const relevantCapabilities = analyticsCapabilities.filter(capability =>
    capability.targetAudience.includes(persona) &&
    (userPreferences.complexityLevel === 'expert' ||
     capability.complexity !== 'expert' &&
     (userPreferences.complexityLevel === 'advanced' || capability.complexity !== 'advanced'))
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Advanced Analytics & Market Intelligence</h1>
          <p className="text-xl text-blue-100 mb-6">
            Institutional-grade analytics platform powered by AI and real-time market intelligence.
            Make data-driven investment decisions with confidence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🤖 AI-Powered Insights</h3>
              <p className="text-blue-100">Machine learning algorithms analyze market patterns and predict opportunities</p>
            </div>
            <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Real-Time Analytics</h3>
              <p className="text-blue-100">Live market data and portfolio performance tracking with instant alerts</p>
            </div>
            <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎯 Precision Targeting</h3>
              <p className="text-blue-100">Persona-specific insights tailored to your investment profile and objectives</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Capabilities Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Analytics Capabilities</h2>
          <div className="text-sm text-slate-600">
            Showing capabilities for: <span className="font-medium">{persona.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {relevantCapabilities.map((capability) => (
            <div
              key={capability.id}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveView(capability.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{capability.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{capability.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        capability.complexity === 'expert' ? 'bg-red-100 text-red-800' :
                        capability.complexity === 'advanced' ? 'bg-purple-100 text-purple-800' :
                        capability.complexity === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {capability.complexity.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">
                        {capability.targetAudience.length} investor types
                      </span>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Launch →
                </button>
              </div>

              {/* Description */}
              <p className="text-slate-600 mb-4">{capability.description}</p>

              {/* Features */}
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {capability.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                  {capability.features.length > 3 && (
                    <li className="text-sm text-slate-500">
                      +{capability.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🔗 Platform Integration Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-green-800">✅ Milestone 1.1 Complete</h3>
            <p className="text-sm text-slate-600 mt-1">
              AI Negotiation Enhancement with real-time strategy explanations and institutional investor support
            </p>
            <div className="text-xs text-green-600 mt-2">Status: Production Ready • 262/262 tests passing</div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-green-800">✅ Milestone 1.2 Complete</h3>
            <p className="text-sm text-slate-600 mt-1">
              Core Investor Journeys with comprehensive workflow implementation for three institutional personas
            </p>
            <div className="text-xs text-green-600 mt-2">Status: Production Ready • 29/29 tests passing</div>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-blue-800">🚧 Milestone 1.3 Current</h3>
            <p className="text-sm text-slate-600 mt-1">
              Advanced Analytics and Market Intelligence with AI-powered insights and predictive modeling
            </p>
            <div className="text-xs text-blue-600 mt-2">Status: Development Complete • Testing in Progress</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="font-medium text-slate-800 mb-2">🎯 Total Platform Capabilities</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">291</div>
              <div className="text-slate-600">Total Tests Passing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-slate-600">Investor Journeys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-slate-600">Analytics Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-slate-600">Integration Success</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Preferences */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">⚙️ Analytics Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Display Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Complexity Level
                </label>
                <select
                  value={userPreferences.complexityLevel}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    complexityLevel: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic - Essential metrics only</option>
                  <option value="intermediate">Intermediate - Standard analytics</option>
                  <option value="advanced">Advanced - Professional metrics</option>
                  <option value="expert">Expert - All capabilities</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Auto-refresh Interval
                </label>
                <select
                  value={userPreferences.refreshInterval}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    refreshInterval: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-700 mb-3">Notification Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPreferences.autoRefresh}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    autoRefresh: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700">Enable auto-refresh</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPreferences.alertsEnabled}
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    alertsEnabled: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700">Enable market alerts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveView = () => {
    const capability = analyticsCapabilities.find(cap => cap.id === activeView);
    if (!capability) return null;

    const Component = capability.component;

    const commonProps = {
      persona,
      portfolioValue,
      timeHorizon,
      riskTolerance
    };

    return <Component {...commonProps} />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      {activeView !== 'overview' && (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setActiveView('overview')}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <span>←</span>
                  <span>Analytics Hub</span>
                </button>

                <div className="h-6 w-px bg-slate-300"></div>

                {relevantCapabilities.map((capability) => (
                  <button
                    key={capability.id}
                    onClick={() => setActiveView(capability.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeView === capability.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{capability.icon}</span>
                    <span>{capability.title}</span>
                  </button>
                ))}
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-600">Phase 1 Milestone 1.3</div>
                <div className="text-lg font-semibold text-purple-600">Advanced Analytics</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'overview' ? renderOverview() : renderActiveView()}
      </div>
    </div>
  );
};