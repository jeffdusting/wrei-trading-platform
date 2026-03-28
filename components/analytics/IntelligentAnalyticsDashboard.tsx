/**
 * WREI Trading Platform - Simplified Analytics Dashboard
 *
 * Stage 2 Component 3: Simplified Analytics Dashboard Component
 * MIGRATED: Now uses simplified demo data instead of complex AI analytics
 *
 * Date: March 28, 2026
 */

'use client';

import React, { useState } from 'react';
import { useAnalytics } from './useAnalytics';
import { useSimpleDemoStore, SimpleDemoDataSet } from '@/lib/demo-mode/simple-demo-state';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Component props interface
interface IntelligentAnalyticsDashboardProps {
  sessionId?: string;
  selectedDataSet?: SimpleDemoDataSet;
  onExport?: (format: 'pdf' | 'excel') => void;
}

export const IntelligentAnalyticsDashboard: React.FC<IntelligentAnalyticsDashboardProps> = ({
  sessionId,
  selectedDataSet,
  onExport
}) => {
  // Use simplified analytics hook
  const { analytics, isLoading, error, refreshAnalytics } = useAnalytics({
    dataSet: selectedDataSet,
    autoRefresh: true
  });

  const { isActive } = useSimpleDemoStore();

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'portfolio'>('overview');

  if (!isActive || !analytics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 bloomberg-small-text font-medium text-gray-900">No Analytics Data</h3>
          <p className="mt-1 bloomberg-small-text text-gray-500">
            Start demo mode to view analytics dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="bloomberg-card-title text-gray-900">Analytics Dashboard</h2>
              <p className="bloomberg-small-text text-gray-500">
                Scenario: {analytics.persona.name} ({analytics.persona.organisation})
              </p>
            </div>
          </div>

          <button
            onClick={refreshAnalytics}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {(['overview', 'market', 'portfolio'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 bloomberg-small-text font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="bloomberg-small-text font-medium text-gray-500">Target Allocation</p>
                  <p className="bloomberg-large-metric text-gray-900">
                    ${(analytics.portfolioMetrics.targetAllocation / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="bloomberg-small-text font-medium text-gray-500">Expected Yield</p>
                  <p className="bloomberg-large-metric text-gray-900">
                    {(analytics.portfolioMetrics.expectedYield * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="bloomberg-small-text font-medium text-gray-500">Base Price</p>
                  <p className="bloomberg-large-metric text-gray-900">
                    ${analytics.marketData.basePrice}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <UserGroupIcon className="w-8 h-8 text-amber-600" />
                <div className="ml-4">
                  <p className="bloomberg-small-text font-medium text-gray-500">Risk Profile</p>
                  <p className="bloomberg-large-metric text-gray-900">
                    {analytics.portfolioMetrics.riskProfile}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="bloomberg-small-text font-medium text-blue-900 mb-2">VCM Spot Reference</h4>
                <p className="bloomberg-metric-value text-blue-700">${analytics.marketData.vcmSpot}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="bloomberg-small-text font-medium text-green-900 mb-2">Forward Removal</h4>
                <p className="bloomberg-metric-value text-green-700">${analytics.marketData.forwardRemoval}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="bloomberg-small-text font-medium text-purple-900 mb-2">dMRV Premium</h4>
                <p className="bloomberg-metric-value text-purple-700">{analytics.marketData.dmrvPremium}x</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="bloomberg-card-title text-gray-900 mb-4">Portfolio Details</h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="bloomberg-small-text font-medium text-gray-500">Risk Profile</dt>
                  <dd className="bloomberg-card-title text-gray-900">{analytics.portfolioMetrics.riskProfile}</dd>
                </div>
                <div>
                  <dt className="bloomberg-small-text font-medium text-gray-500">Liquidity Needs</dt>
                  <dd className="bloomberg-card-title text-gray-900">{analytics.portfolioMetrics.liquidityNeeds}</dd>
                </div>
                <div>
                  <dt className="bloomberg-small-text font-medium text-gray-500">Price Floor</dt>
                  <dd className="bloomberg-card-title text-gray-900">${analytics.marketData.floor}/tonne</dd>
                </div>
                <div>
                  <dt className="bloomberg-small-text font-medium text-gray-500">Last Updated</dt>
                  <dd className="bloomberg-card-title text-gray-900">
                    {analytics.lastUpdated.toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligentAnalyticsDashboard;