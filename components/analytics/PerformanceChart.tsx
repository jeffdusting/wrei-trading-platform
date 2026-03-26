/**
 * WREI Trading Platform - Performance Comparison Chart
 *
 * Step 1.4: Enhanced Negotiation Analytics - Chart Visualization Component
 * Interactive charts for performance benchmarking and trend analysis
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

import { PerformanceBenchmark, AnalyticsTimeframe, ChartType } from './types';
import { AudienceType } from '../audience';

interface PerformanceChartProps {
  benchmarks: PerformanceBenchmark[];
  selectedAudience: AudienceType;
  timeframe: AnalyticsTimeframe;
  chartType?: ChartType;
  height?: number;
  showLegend?: boolean;
  showComparison?: boolean;
}

interface ChartPoint {
  date: string;
  value: number;
  label: string;
  color: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  benchmarks,
  selectedAudience,
  timeframe,
  chartType = 'line',
  height = 300,
  showLegend = true,
  showComparison = true
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(
    benchmarks.length > 0 ? benchmarks[0].id : null
  );
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  // Filter benchmarks based on audience
  const audienceRelevantBenchmarks = useMemo(() => {
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

  // Get selected benchmark
  const selectedBenchmark = audienceRelevantBenchmarks.find(b => b.id === selectedMetric);

  // Generate chart data points
  const chartData = useMemo(() => {
    if (!selectedBenchmark) return [];

    const data = selectedBenchmark.trend.historical_data;
    const daysToShow = timeframe === '1h' ? 1 :
                      timeframe === '4h' ? 1 :
                      timeframe === '1d' ? 7 :
                      timeframe === '1w' ? 30 :
                      timeframe === '1m' ? 30 :
                      timeframe === '3m' ? 90 : 365;

    const filteredData = data.slice(-daysToShow);

    return filteredData.map((point, index) => ({
      date: point.timestamp.toLocaleDateString(),
      value: point.value,
      label: formatValue(point.value, selectedBenchmark),
      color: getValueColor(point.value, selectedBenchmark),
      x: (index / (filteredData.length - 1)) * 100,
      y: 100 - ((point.value - Math.min(...filteredData.map(p => p.value))) /
           (Math.max(...filteredData.map(p => p.value)) - Math.min(...filteredData.map(p => p.value)))) * 80
    }));
  }, [selectedBenchmark, timeframe]);

  // Format values based on benchmark type
  const formatValue = (value: number, benchmark: PerformanceBenchmark): string => {
    if (value < 1) {
      return (value * 100).toFixed(1) + '%';
    }
    if (value > 1000) {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0
      }).format(value);
    }
    return value.toFixed(2);
  };

  // Get color based on performance
  const getValueColor = (value: number, benchmark: PerformanceBenchmark): string => {
    const { current, market_average, industry_best } = benchmark.values;

    if (value >= industry_best * 0.9) return '#10B981'; // Green - Excellent
    if (value >= market_average * 1.1) return '#3B82F6'; // Blue - Above average
    if (value >= market_average * 0.9) return '#F59E0B'; // Amber - Average
    return '#EF4444'; // Red - Below average
  };

  // Generate SVG path for line chart
  const generatePath = (points: any[]): string => {
    if (points.length < 2) return '';

    const path = points.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${acc} ${command} ${point.x} ${point.y}`;
    }, '');

    return path;
  };

  // Generate comparison bars
  const generateComparisonBars = () => {
    if (!selectedBenchmark || !showComparison) return null;

    const { current, market_average, industry_best, regulatory_minimum } = selectedBenchmark.values;
    const maxValue = Math.max(current, market_average, industry_best, regulatory_minimum || 0);

    const bars = [
      { label: 'Current', value: current, color: '#3B82F6' },
      { label: 'Market Avg.', value: market_average, color: '#6B7280' },
      { label: 'Industry Best', value: industry_best, color: '#10B981' },
    ];

    if (regulatory_minimum) {
      bars.push({ label: 'Regulatory Min.', value: regulatory_minimum, color: '#EF4444' });
    }

    return (
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Comparison</h4>
        <div className="space-y-3">
          {bars.map((bar, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-600">{bar.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: bar.color,
                    width: `${(bar.value / maxValue) * 100}%`
                  }}
                />
              </div>
              <div className="w-20 text-sm font-medium text-gray-900 text-right">
                {formatValue(bar.value, selectedBenchmark)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (audienceRelevantBenchmarks.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
        <p className="text-sm text-gray-600">
          No performance benchmarks available for the {selectedAudience} audience.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedAudience} metrics • {timeframe} view
          </p>
        </div>

        {/* Metric Selector */}
        {audienceRelevantBenchmarks.length > 1 && (
          <div className="flex space-x-2">
            {audienceRelevantBenchmarks.map((benchmark) => (
              <button
                key={benchmark.id}
                onClick={() => setSelectedMetric(benchmark.id)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedMetric === benchmark.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {benchmark.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      {selectedBenchmark && chartData.length > 0 && (
        <div className="relative">
          {/* SVG Chart */}
          <div className="relative" style={{ height: `${height}px` }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              className="overflow-visible"
            >
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />

              {/* Trend line */}
              <path
                d={generatePath(chartData)}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={point.color}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-4 transition-all"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Benchmark lines */}
              <line
                x1="0"
                y1={100 - ((selectedBenchmark.values.market_average - Math.min(...chartData.map(p => p.value))) /
                     (Math.max(...chartData.map(p => p.value)) - Math.min(...chartData.map(p => p.value)))) * 80}
                x2="100"
                y2={100 - ((selectedBenchmark.values.market_average - Math.min(...chartData.map(p => p.value))) /
                     (Math.max(...chartData.map(p => p.value)) - Math.min(...chartData.map(p => p.value)))) * 80}
                stroke="#6B7280"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.6"
              />

              <line
                x1="0"
                y1={100 - ((selectedBenchmark.values.industry_best - Math.min(...chartData.map(p => p.value))) /
                     (Math.max(...chartData.map(p => p.value)) - Math.min(...chartData.map(p => p.value)))) * 80}
                x2="100"
                y2={100 - ((selectedBenchmark.values.industry_best - Math.min(...chartData.map(p => p.value))) /
                     (Math.max(...chartData.map(p => p.value)) - Math.min(...chartData.map(p => p.value)))) * 80}
                stroke="#10B981"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
              <div className="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10"
                   style={{
                     left: `${hoveredPoint.x}%`,
                     top: `${hoveredPoint.y}%`,
                     transform: 'translate(-50%, -100%)',
                     marginTop: '-8px'
                   }}>
                {hoveredPoint.label} on {hoveredPoint.date}
              </div>
            )}
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-gray-600">Current Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-gray-500 border-dashed" style={{ borderTop: '1px dashed' }}></div>
                <span className="text-gray-600">Market Average</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-green-500 border-dashed" style={{ borderTop: '1px dashed' }}></div>
                <span className="text-gray-600">Industry Best</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Summary */}
      {selectedBenchmark && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">{selectedBenchmark.name}</h4>
            <div className={`flex items-center space-x-1 ${
              selectedBenchmark.trend.direction === 'up' ? 'text-green-600' :
              selectedBenchmark.trend.direction === 'down' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {selectedBenchmark.trend.direction === 'up' && <TrendingUpIcon className="w-4 h-4" />}
              {selectedBenchmark.trend.direction === 'down' && <TrendingDownIcon className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {selectedBenchmark.trend.change_percentage > 0 ? '+' : ''}
                {selectedBenchmark.trend.change_percentage}% ({selectedBenchmark.trend.timeframe})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {formatValue(selectedBenchmark.values.current, selectedBenchmark)}
              </div>
              <div className="text-xs text-gray-600">Current</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-600">
                {formatValue(selectedBenchmark.values.market_average, selectedBenchmark)}
              </div>
              <div className="text-xs text-gray-600">Market Average</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {formatValue(selectedBenchmark.values.industry_best, selectedBenchmark)}
              </div>
              <div className="text-xs text-gray-600">Industry Best</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {selectedBenchmark.analysis.performance_score}/100
              </div>
              <div className="text-xs text-gray-600">Performance Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Bars */}
      {generateComparisonBars()}

      {/* Recommendations */}
      {selectedBenchmark && selectedBenchmark.analysis.recommendations.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <InformationCircleIcon className="w-4 h-4" />
            <span>Improvement Recommendations</span>
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {selectedBenchmark.analysis.recommendations.slice(0, 2).map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;