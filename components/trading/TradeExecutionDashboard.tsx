/**
 * Trade Execution Dashboard Component
 *
 * Enhanced trading dashboard with Bloomberg Terminal styling
 * Integrates with existing negotiation state and Claude API
 * Phase 3: Enhanced Trading Features
 */

'use client';

import React from 'react';
import { NegotiationState } from '@/lib/types';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface TradeExecutionDashboardProps {
  negotiationState: NegotiationState;
  className?: string;
}

interface TradeStatus {
  phase: string;
  round: number;
  status: 'active' | 'paused' | 'completed' | 'failed';
  priceMovement: 'up' | 'down' | 'stable';
  timeElapsed: string;
  nextAction: string;
}

export const TradeExecutionDashboard: React.FC<TradeExecutionDashboardProps> = ({
  negotiationState,
  className = ''
}) => {
  const tokens = useDesignTokens('institutional');

  // Calculate trade status from negotiation state
  const calculateTradeStatus = (): TradeStatus => {
    const startTime = Date.now() - (negotiationState.round * 45000); // Estimate 45s per round
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    let status: 'active' | 'paused' | 'completed' | 'failed' = 'active';
    if (negotiationState.phase === 'closure') status = 'completed';
    if (negotiationState.phase === 'escalation') status = 'failed';

    const priceMovement = negotiationState.currentPrice > negotiationState.anchor ? 'down' :
                         negotiationState.currentPrice < negotiationState.anchor ? 'up' : 'stable';

    return {
      phase: negotiationState.phase,
      round: negotiationState.round,
      status,
      priceMovement,
      timeElapsed: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      nextAction: status === 'active' ? 'Awaiting counterparty response' : 'Review completion'
    };
  };

  const tradeStatus = calculateTradeStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriceMovementIcon = (movement: string) => {
    switch (movement) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-slate-200"
        style={{ backgroundColor: tokens.colors.surface.secondary }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-5 h-5 text-slate-600" />
            <h3 className="bloomberg-card-title text-slate-800">Trade Execution</h3>
          </div>
          <div className={`px-3 py-1 rounded-full bloomberg-small-text font-medium ${getStatusColor(tradeStatus.status)}`}>
            {tradeStatus.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Trade Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Current Phase */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="bloomberg-small-text text-slate-500 uppercase tracking-wide">Phase</span>
            </div>
            <div className="bloomberg-body-text font-medium text-slate-800">
              {tradeStatus.phase.charAt(0).toUpperCase() + tradeStatus.phase.slice(1)}
            </div>
          </div>

          {/* Round Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-slate-500" />
              <span className="bloomberg-small-text text-slate-500 uppercase tracking-wide">Round</span>
            </div>
            <div className="bloomberg-body-text font-medium text-slate-800">
              {tradeStatus.round}/10
            </div>
          </div>

          {/* Price Movement */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
              <span className="bloomberg-small-text text-slate-500 uppercase tracking-wide">Price</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bloomberg-data text-slate-800">
                ${negotiationState.currentPrice.toFixed(2)}
              </span>
              {getPriceMovementIcon(tradeStatus.priceMovement)}
            </div>
          </div>

          {/* Time Elapsed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-slate-500" />
              <span className="bloomberg-small-text text-slate-500 uppercase tracking-wide">Duration</span>
            </div>
            <div className="bloomberg-data text-slate-800">
              {tradeStatus.timeElapsed}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="bloomberg-small-text text-slate-500">Trade Progress</span>
            <span className="bloomberg-small-text text-slate-500">{Math.round((tradeStatus.round / 10) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((tradeStatus.round / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="bloomberg-small-text text-slate-500 uppercase tracking-wide">Price Range</span>
              <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="bloomberg-small-text text-slate-600">Floor:</span>
                <span className="bloomberg-data text-slate-800">${negotiationState.floor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="bloomberg-small-text text-slate-600">Anchor:</span>
                <span className="bloomberg-data text-slate-800">${negotiationState.anchor.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="bloomberg-small-text text-slate-500 uppercase tracking-wide">Volume</span>
              <ChartBarIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="space-y-1">
              <div className="bloomberg-large-metric text-slate-800">
                {negotiationState.volume.toLocaleString()}
              </div>
              <div className="bloomberg-small-text text-slate-600">tCO₂e</div>
            </div>
          </div>
        </div>

        {/* Next Action */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            {tradeStatus.status === 'active' ? (
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
            )}
            <div>
              <div className="bloomberg-small-text text-slate-600 uppercase tracking-wide mb-1">Next Action</div>
              <div className="bloomberg-body-text text-slate-800">{tradeStatus.nextAction}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeExecutionDashboard;