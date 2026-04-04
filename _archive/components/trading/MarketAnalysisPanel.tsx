/**
 * Market Analysis Panel Component
 *
 * Real-time market context display with Bloomberg Terminal styling
 * Integrates with WREI Pricing Index and market intelligence
 * Phase 3: Enhanced Trading Features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import { PRICING_INDEX } from '@/lib/negotiation-config';
import {
  ChartBarSquareIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface MarketAnalysisPanelProps {
  className?: string;
}

interface MarketData {
  vcmSpot: number;
  forwardRemoval: number;
  dmrvPremium: number;
  volatility: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  lastUpdate: Date;
}

interface MarketIndicator {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export const MarketAnalysisPanel: React.FC<MarketAnalysisPanelProps> = ({
  className = ''
}) => {
  const tokens = useDesignTokens('institutional');
  const [marketData, setMarketData] = useState<MarketData>({
    vcmSpot: PRICING_INDEX.VCM_SPOT_REFERENCE,
    forwardRemoval: PRICING_INDEX.FORWARD_REMOVAL_REFERENCE,
    dmrvPremium: PRICING_INDEX.DMRV_PREMIUM_BENCHMARK,
    volatility: 12.5,
    trend: 'bullish',
    lastUpdate: new Date()
  });

  // Simulate real-time market updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => {
        const vcmChange = (Math.random() - 0.5) * 0.2;
        const forwardChange = (Math.random() - 0.5) * 5;
        const dmrvChange = (Math.random() - 0.5) * 0.1;

        const newVcm = Math.max(0.1, prev.vcmSpot + vcmChange);
        const newForward = Math.max(50, prev.forwardRemoval + forwardChange);
        const newDmrv = Math.max(1.0, prev.dmrvPremium + dmrvChange);

        // Determine overall trend
        const totalChange = vcmChange + (forwardChange / 10) + dmrvChange;
        const trend = totalChange > 0.05 ? 'bullish' : totalChange < -0.05 ? 'bearish' : 'neutral';

        return {
          vcmSpot: newVcm,
          forwardRemoval: newForward,
          dmrvPremium: newDmrv,
          volatility: Math.max(5, Math.min(25, prev.volatility + (Math.random() - 0.5) * 2)),
          trend,
          lastUpdate: new Date()
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getMarketIndicators = (): MarketIndicator[] => {
    // Calculate changes from baseline
    const vcmChange = ((marketData.vcmSpot - PRICING_INDEX.VCM_SPOT_REFERENCE) / PRICING_INDEX.VCM_SPOT_REFERENCE) * 100;
    const forwardChange = ((marketData.forwardRemoval - PRICING_INDEX.FORWARD_REMOVAL_REFERENCE) / PRICING_INDEX.FORWARD_REMOVAL_REFERENCE) * 100;
    const dmrvChange = ((marketData.dmrvPremium - PRICING_INDEX.DMRV_PREMIUM_BENCHMARK) / PRICING_INDEX.DMRV_PREMIUM_BENCHMARK) * 100;

    return [
      {
        name: 'VCM Spot',
        value: marketData.vcmSpot,
        change: vcmChange,
        trend: vcmChange > 0.1 ? 'up' : vcmChange < -0.1 ? 'down' : 'stable',
        unit: 'USD/tCO₂e'
      },
      {
        name: 'Forward Removal',
        value: marketData.forwardRemoval,
        change: forwardChange,
        trend: forwardChange > 0.5 ? 'up' : forwardChange < -0.5 ? 'down' : 'stable',
        unit: 'USD/tCO₂e'
      },
      {
        name: 'dMRV Premium',
        value: marketData.dmrvPremium,
        change: dmrvChange,
        trend: dmrvChange > 0.1 ? 'up' : dmrvChange < -0.1 ? 'down' : 'stable',
        unit: 'x multiplier'
      }
    ];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
      default: return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-600 bg-green-50';
      case 'bearish': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const indicators = getMarketIndicators();

  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-slate-200"
        style={{ backgroundColor: tokens.colors.surface.secondary }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartBarSquareIcon className="w-5 h-5 text-slate-600" />
            <h3 className="bloomberg-card-title text-slate-800">Market Analysis</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full bloomberg-small-text font-medium ${getTrendColor(marketData.trend)}`}>
              {marketData.trend.toUpperCase()}
            </div>
            <div className="bloomberg-small-text text-slate-500">
              {marketData.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Market Indicators */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {indicators.map((indicator) => (
            <div key={indicator.name} className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="bloomberg-small-text text-slate-500 uppercase tracking-wide">
                  {indicator.name}
                </span>
                {getTrendIcon(indicator.trend)}
              </div>
              <div className="space-y-1">
                <div className="bloomberg-data text-slate-800">
                  {typeof indicator.value === 'number' && indicator.value < 10
                    ? indicator.value.toFixed(2)
                    : Math.round(indicator.value).toLocaleString()
                  }
                </div>
                <div className="flex items-center justify-between">
                  <span className="bloomberg-small-text text-slate-600">{indicator.unit}</span>
                  <span className={`bloomberg-small-text font-medium ${
                    indicator.change > 0 ? 'text-green-600' :
                    indicator.change < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Volatility */}
        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-slate-500" />
              <span className="bloomberg-small-text text-slate-500 uppercase tracking-wide">Market Volatility</span>
            </div>
            <span className="bloomberg-small-text text-slate-600">{marketData.volatility.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                marketData.volatility > 20 ? 'bg-red-500' :
                marketData.volatility > 15 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((marketData.volatility / 25) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="bloomberg-small-text text-slate-500">Low</span>
            <span className="bloomberg-small-text text-slate-500">High</span>
          </div>
        </div>

        {/* Market Context */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <InformationCircleIcon className="w-5 h-5 text-slate-600" />
            <h4 className="bloomberg-body-text font-medium text-slate-800">Market Context</h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                <div className="bloomberg-small-text text-slate-600 mb-1">WREI Premium</div>
                <div className="bloomberg-body-text text-slate-800">
                  Trading at {((150 / marketData.vcmSpot) - 1) * 100 > 0 ? '+' : ''}
                  {(((150 / marketData.vcmSpot) - 1) * 100).toFixed(0)}% to VCM spot
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <div className="bloomberg-small-text text-slate-600 mb-1">Quality Premium</div>
                <div className="bloomberg-body-text text-slate-800">
                  dMRV verification adds {((marketData.dmrvPremium - 1) * 100).toFixed(0)}% value
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                <div className="bloomberg-small-text text-slate-600 mb-1">Forward Curve</div>
                <div className="bloomberg-body-text text-slate-800">
                  2025 delivery premium: {((marketData.forwardRemoval / marketData.vcmSpot) - 1) * 100 > 0 ? '+' : ''}
                  {(((marketData.forwardRemoval / marketData.vcmSpot) - 1) * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                <div className="bloomberg-small-text text-slate-600 mb-1">Settlement</div>
                <div className="bloomberg-body-text text-slate-800">
                  T+0 atomic via Zoniqx zConnect
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-500">
            <ClockIcon className="w-4 h-4" />
            <span className="bloomberg-small-text">
              Last updated: {marketData.lastUpdate.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysisPanel;