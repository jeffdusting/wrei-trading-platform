/**
 * WREI Trading Platform - Performance Chart
 *
 * Stage 2 Component 3: Intelligent Analytics Dashboard (Foundation)
 * Performance visualization component
 *
 * Date: March 26, 2026
 */

'use client';

import React from 'react';

interface PerformanceChartProps {
  benchmarks: {
    market_return: number;
    peer_average: number;
    risk_free_rate: number;
    volatility_benchmark: number;
  } | null;
  selectedAudience: 'executive' | 'technical' | 'compliance';
  timeframe: '1d' | '1w' | '1m' | '3m' | '1y';
  height?: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  benchmarks,
  selectedAudience,
  timeframe,
  height = 300
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="bloomberg-card-title text-gray-900 mb-4">
        Performance Chart ({selectedAudience} - {timeframe})
      </h3>
      <div style={{ height: height }} className="flex items-center justify-center bg-gray-50 rounded">
        <div className="text-center text-gray-500">
          <div className="bloomberg-card-title font-medium">Performance Visualization</div>
          <div className="bloomberg-small-text mt-2">Component 3 chart implementation in progress...</div>
          {benchmarks && (
            <div className="mt-4 bloomberg-section-label space-y-1">
              <div>Market Return: {(benchmarks.market_return * 100).toFixed(1)}%</div>
              <div>Peer Average: {(benchmarks.peer_average * 100).toFixed(1)}%</div>
              <div>Risk-Free Rate: {(benchmarks.risk_free_rate * 100).toFixed(1)}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
