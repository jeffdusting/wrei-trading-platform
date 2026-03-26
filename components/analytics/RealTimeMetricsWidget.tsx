/**
 * WREI Trading Platform - Real-Time Metrics Widget
 *
 * Step 1.4: Enhanced Negotiation Analytics - Live Metrics Component
 * Displays real-time negotiation metrics during active trading scenarios
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BoltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

import { NegotiationMetrics } from './types';
import { AudienceType } from '../audience';
import { AnalyticsEngine } from './AnalyticsEngine';

interface RealTimeMetricsWidgetProps {
  sessionId: string;
  scenarioId: string;
  selectedAudience: AudienceType;
  isScenarioActive: boolean;
  onMetricsUpdate?: (metrics: NegotiationMetrics) => void;
}

interface MetricDisplay {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  change?: string;
  icon: React.ComponentType<any>;
  color: string;
  priority: number; // 1 = highest priority
}

const RealTimeMetricsWidget: React.FC<RealTimeMetricsWidgetProps> = ({
  sessionId,
  scenarioId,
  selectedAudience,
  isScenarioActive,
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<NegotiationMetrics | null>(null);
  const [analyticsEngine] = useState(() => AnalyticsEngine.getInstance());
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time updates during active scenarios
  useEffect(() => {
    if (!isScenarioActive) return;

    const interval = setInterval(() => {
      // Simulate scenario execution data with realistic variations
      const simulatedData = generateSimulatedScenarioData();
      const updatedMetrics = analyticsEngine.processScenarioMetrics(
        sessionId,
        scenarioId,
        'esc-market-trading',
        simulatedData
      );

      setMetrics(updatedMetrics);
      setUpdateCount(prev => prev + 1);
      setLastUpdate(new Date());

      if (onMetricsUpdate) {
        onMetricsUpdate(updatedMetrics);
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isScenarioActive, sessionId, scenarioId, analyticsEngine, onMetricsUpdate]);

  // Generate simulated real-time data for demo purposes
  const generateSimulatedScenarioData = () => {
    const baseData = {
      volume: 2500 + Math.random() * 500, // 2500-3000 tonnes
      finalPrice: 47.80 * (0.85 + Math.random() * 0.15), // 8.5% improvement with variation
      priceImprovement: 0.15 + Math.random() * 0.08, // 15-23% improvement
      executionTime: 8 + Math.random() * 8, // 8-16 minutes
      successRate: 0.90 + Math.random() * 0.08, // 90-98% success rate
      satisfaction: 8.0 + Math.random() * 1.5, // 8.0-9.5/10 satisfaction
      negotiationsPerHour: 3.5 + Math.random() * 1.5, // 3.5-5.0 per hour
      automationRate: 0.85 + Math.random() * 0.10, // 85-95% automation
      transactionCost: 80 + Math.random() * 30, // A$80-110 per transaction
      resourceUtil: 0.70 + Math.random() * 0.20, // 70-90% utilization
      cerCompliance: 0.96 + Math.random() * 0.03, // 96-99% compliance
      aemoSettlement: 1.5 + Math.random() * 1.0, // 1.5-2.5 minutes
      certVerification: 0.995 + Math.random() * 0.004, // 99.5-99.9% verification
      additionalityScore: 85 + Math.random() * 10, // 85-95 score
    };

    return baseData;
  };

  // Get audience-specific metrics to display
  const getDisplayMetrics = (): MetricDisplay[] => {
    if (!metrics) return [];

    const baseMetrics: Record<AudienceType, MetricDisplay[]> = {
      executive: [
        {
          id: 'volume',
          label: 'Trading Volume',
          value: (metrics.performance.total_volume / 1000).toFixed(1),
          unit: 'k tonnes',
          trend: 'up',
          change: '+12.3%',
          icon: ChartBarIcon,
          color: 'blue',
          priority: 1
        },
        {
          id: 'price_improvement',
          label: 'Price Improvement',
          value: (metrics.performance.price_improvement * 100).toFixed(1),
          unit: '%',
          trend: 'up',
          change: '+2.1%',
          icon: TrendingUpIcon,
          color: 'green',
          priority: 2
        },
        {
          id: 'success_rate',
          label: 'Success Rate',
          value: (metrics.performance.success_rate * 100).toFixed(1),
          unit: '%',
          trend: 'stable',
          icon: CheckCircleIcon,
          color: 'emerald',
          priority: 3
        },
        {
          id: 'execution_time',
          label: 'Avg. Execution',
          value: metrics.performance.execution_time.toFixed(1),
          unit: 'min',
          trend: 'down',
          change: '-8.5%',
          icon: ClockIcon,
          color: 'indigo',
          priority: 4
        },
        {
          id: 'customer_satisfaction',
          label: 'Satisfaction',
          value: metrics.market_position.participant_satisfaction.toFixed(1),
          unit: '/10',
          trend: 'up',
          change: '+0.3',
          icon: CheckCircleIcon,
          color: 'pink',
          priority: 5
        },
        {
          id: 'cost_per_transaction',
          label: 'Cost per Trade',
          value: metrics.efficiency.cost_per_transaction.toFixed(0),
          unit: 'AUD',
          trend: 'down',
          change: '-12%',
          icon: CurrencyDollarIcon,
          color: 'green',
          priority: 6
        }
      ],
      technical: [
        {
          id: 'throughput',
          label: 'Negotiations/Hour',
          value: metrics.efficiency.negotiations_per_hour.toFixed(1),
          unit: '/hr',
          trend: 'up',
          change: '+15%',
          icon: BoltIcon,
          color: 'yellow',
          priority: 1
        },
        {
          id: 'automation_rate',
          label: 'Automation Rate',
          value: (metrics.efficiency.automation_rate * 100).toFixed(1),
          unit: '%',
          trend: 'up',
          change: '+3.2%',
          icon: CheckCircleIcon,
          color: 'green',
          priority: 2
        },
        {
          id: 'settlement_time',
          label: 'Settlement Time',
          value: metrics.esc_metrics.aemo_settlement_time.toFixed(1),
          unit: 'min',
          trend: 'down',
          change: '-5%',
          icon: ClockIcon,
          color: 'blue',
          priority: 3
        },
        {
          id: 'resource_util',
          label: 'Resource Util.',
          value: (metrics.efficiency.resource_utilisation * 100).toFixed(1),
          unit: '%',
          trend: 'stable',
          icon: ChartBarIcon,
          color: 'indigo',
          priority: 4
        },
        {
          id: 'verification_rate',
          label: 'Cert. Verification',
          value: (metrics.esc_metrics.certificate_verification_rate * 100).toFixed(2),
          unit: '%',
          trend: 'up',
          change: '+0.1%',
          icon: ShieldCheckIcon,
          color: 'emerald',
          priority: 5
        },
        {
          id: 'cost_efficiency',
          label: 'Cost Efficiency',
          value: metrics.efficiency.cost_per_transaction.toFixed(0),
          unit: 'AUD',
          trend: 'down',
          change: '-8%',
          icon: CurrencyDollarIcon,
          color: 'green',
          priority: 6
        }
      ],
      compliance: [
        {
          id: 'cer_compliance',
          label: 'CER Compliance',
          value: (metrics.esc_metrics.cer_compliance_score * 100).toFixed(1),
          unit: '%',
          trend: 'up',
          change: '+1.2%',
          icon: ShieldCheckIcon,
          color: 'green',
          priority: 1
        },
        {
          id: 'additionality_score',
          label: 'Additionality Score',
          value: metrics.esc_metrics.additionality_validation_score.toFixed(0),
          unit: '/100',
          trend: 'up',
          change: '+2.8',
          icon: CheckCircleIcon,
          color: 'emerald',
          priority: 2
        },
        {
          id: 'regulatory_risk',
          label: 'Regulatory Risk',
          value: metrics.risk_metrics.regulatory_risk.toFixed(0),
          unit: '/100',
          trend: 'down',
          change: '-3.5',
          icon: ExclamationTriangleIcon,
          color: metrics.risk_metrics.regulatory_risk < 20 ? 'green' : 'yellow',
          priority: 3
        },
        {
          id: 'counterparty_risk',
          label: 'Counterparty Risk',
          value: metrics.risk_metrics.counterparty_risk.toFixed(0),
          unit: '/100',
          trend: 'stable',
          icon: InformationCircleIcon,
          color: metrics.risk_metrics.counterparty_risk < 30 ? 'green' : 'yellow',
          priority: 4
        },
        {
          id: 'settlement_risk',
          label: 'Settlement Risk',
          value: (metrics.risk_metrics.settlement_risk * 100).toFixed(1),
          unit: '%',
          trend: 'down',
          change: '-0.3%',
          icon: ShieldCheckIcon,
          color: 'green',
          priority: 5
        },
        {
          id: 'cert_verification',
          label: 'Cert. Verification',
          value: (metrics.esc_metrics.certificate_verification_rate * 100).toFixed(2),
          unit: '%',
          trend: 'stable',
          icon: CheckCircleIcon,
          color: 'emerald',
          priority: 6
        }
      ]
    };

    return baseMetrics[selectedAudience] || [];
  };

  const displayMetrics = getDisplayMetrics();
  const topMetrics = displayMetrics.slice(0, 4); // Show top 4 metrics prominently
  const secondaryMetrics = displayMetrics.slice(4); // Show remaining metrics in compact form

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      emerald: 'text-emerald-600 bg-emerald-50',
      indigo: 'text-indigo-600 bg-indigo-50',
      pink: 'text-pink-600 bg-pink-50',
      yellow: 'text-yellow-600 bg-yellow-50',
      red: 'text-red-600 bg-red-50'
    };
    return colors[color] || 'text-gray-600 bg-gray-50';
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon className="w-3 h-3 text-green-600" />;
      case 'down':
        return <TrendingDownIcon className="w-3 h-3 text-red-600" />;
      default:
        return null;
    }
  };

  if (!isScenarioActive) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">
          <ChartBarIcon className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Real-Time Analytics</h3>
        <p className="text-sm text-gray-600">
          Start a trading scenario to view live negotiation metrics
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live Negotiation Metrics</h3>
            <p className="text-sm text-gray-600 mt-1">
              Real-time performance • {selectedAudience} view
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">LIVE</span>
            </div>
            <div className="text-xs text-gray-500">
              {updateCount} updates • {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {topMetrics.map((metric) => (
            <div
              key={metric.id}
              className={`p-4 rounded-lg ${getColorClasses(metric.color)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="w-5 h-5" />
                {metric.trend && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    {metric.change && (
                      <span className="text-xs font-medium">{metric.change}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {metric.value}{metric.unit && <span className="text-sm font-normal ml-1">{metric.unit}</span>}
                </div>
                <div className="text-sm font-medium opacity-80">{metric.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Metrics */}
        {secondaryMetrics.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Metrics</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {secondaryMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">
                      {metric.value}{metric.unit && <span className="font-normal ml-1">{metric.unit}</span>}
                    </span>
                    {metric.trend && getTrendIcon(metric.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Scenario executing optimally • All systems operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetricsWidget;