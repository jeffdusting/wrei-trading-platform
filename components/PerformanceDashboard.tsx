"use client";

import React, { useState, useEffect } from 'react';
import { performanceMonitor, PerformanceSnapshot } from '@/lib/performance-monitor';

interface MetricCardProps {
  title: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  target?: string | number;
  description?: string;
}

function MetricCard({ title, value, status, target, description }: MetricCardProps) {
  const statusColors = {
    healthy: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    critical: 'bg-red-50 border-red-200 text-red-900'
  };

  const statusDots = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className={`w-3 h-3 rounded-full ${statusDots[status]}`}></div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold">
          {typeof value === 'number' ? Math.round(value) : value}
        </span>
        {target && (
          <span className="text-sm opacity-75">
            / {typeof target === 'number' ? Math.round(target) : target}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs mt-1 opacity-75">{description}</p>
      )}
    </div>
  );
}

interface PerformanceChartProps {
  data: Array<{ time: string; value: number }>;
  title: string;
  color: string;
}

function PerformanceChart({ data, title, color }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
        <div className="h-32 flex items-center justify-center text-slate-500">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h3 className="font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="h-32 relative">
        <svg className="w-full h-full">
          <polyline
            points={data.map((d, i) =>
              `${(i / (data.length - 1)) * 100},${100 - ((d.value - minValue) / range) * 100}`
            ).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {data.map((d, i) => (
            <circle
              key={i}
              cx={(i / (data.length - 1)) * 100}
              cy={100 - ((d.value - minValue) / range) * 100}
              r="3"
              fill={color}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-end justify-between text-xs text-slate-500 pointer-events-none">
          <span>{minValue.toFixed(1)}</span>
          <span>{maxValue.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

export default function PerformanceDashboard() {
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [chartData, setChartData] = useState<{
    responseTime: Array<{ time: string; value: number }>;
    throughput: Array<{ time: string; value: number }>;
    calculations: Array<{ time: string; value: number }>;
  }>({
    responseTime: [],
    throughput: [],
    calculations: []
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const newSnapshot = performanceMonitor.getPerformanceSnapshot();
      setSnapshot(newSnapshot);

      // Update chart data
      const now = new Date();
      const timeLabel = now.toLocaleTimeString('en-AU', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setChartData(prev => ({
        responseTime: [
          ...prev.responseTime.slice(-19), // Keep last 20 points
          { time: timeLabel, value: newSnapshot.performanceThresholds.apiResponseTime.current }
        ],
        throughput: [
          ...prev.throughput.slice(-19),
          { time: timeLabel, value: newSnapshot.performanceThresholds.throughput.current }
        ],
        calculations: [
          ...prev.calculations.slice(-19),
          { time: timeLabel, value: newSnapshot.systemLoad.activeCalculations }
        ]
      }));
    };

    updateMetrics(); // Initial load
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-slate-700 transition-colors z-50"
      >
        📊 Performance Monitor
      </button>
    );
  }

  if (!snapshot) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">Loading performance data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">WREI Performance Dashboard</h2>
              <p className="text-slate-600 mt-1">
                Last updated: {new Date(snapshot.timestamp).toLocaleString('en-AU')}
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* System Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">System Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="API Response Time"
                value={`${snapshot.performanceThresholds.apiResponseTime.current.toFixed(0)}ms`}
                target={`${snapshot.performanceThresholds.apiResponseTime.target}ms`}
                status={snapshot.performanceThresholds.apiResponseTime.status}
                description="Average API response time"
              />
              <MetricCard
                title="Calculation Performance"
                value={`${snapshot.performanceThresholds.calculationTime.current.toFixed(0)}ms`}
                target={`${snapshot.performanceThresholds.calculationTime.target}ms`}
                status={snapshot.performanceThresholds.calculationTime.status}
                description="Financial calculation time"
              />
              <MetricCard
                title="Throughput"
                value={snapshot.performanceThresholds.throughput.current}
                target={snapshot.performanceThresholds.throughput.target}
                status={snapshot.performanceThresholds.throughput.status}
                description="Requests per minute"
              />
              <MetricCard
                title="Memory Usage"
                value={`${snapshot.systemLoad.memoryUsage.toFixed(0)}MB`}
                status={snapshot.systemLoad.memoryUsage < 100 ? 'healthy' : snapshot.systemLoad.memoryUsage < 200 ? 'warning' : 'critical'}
                description="Current memory consumption"
              />
            </div>
          </div>

          {/* Business Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Business Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Negotiation Sessions"
                value={snapshot.businessMetrics.negotiationsSessions}
                status="healthy"
                description="Active negotiations"
              />
              <MetricCard
                title="Analytics Calculations"
                value={snapshot.businessMetrics.analyticsCalculations}
                status="healthy"
                description="Recent calculations"
              />
              <MetricCard
                title="Compliance Checks"
                value={snapshot.businessMetrics.complianceChecks}
                status="healthy"
                description="Compliance validations"
              />
              <MetricCard
                title="Market Data Requests"
                value={snapshot.businessMetrics.marketDataRequests}
                status="healthy"
                description="Market data calls"
              />
            </div>
          </div>

          {/* Performance Charts */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Performance Trends</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <PerformanceChart
                data={chartData.responseTime}
                title="Response Time (ms)"
                color="#3B82F6"
              />
              <PerformanceChart
                data={chartData.throughput}
                title="Throughput (req/min)"
                color="#10B981"
              />
              <PerformanceChart
                data={chartData.calculations}
                title="Active Calculations"
                color="#F59E0B"
              />
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">System Status</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Active API Calls:</span>
                  <br />
                  <span className="text-slate-900">{snapshot.systemLoad.apiCalls}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Active Calculations:</span>
                  <br />
                  <span className="text-slate-900">{snapshot.systemLoad.activeCalculations}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">P95 Response Time:</span>
                  <br />
                  <span className="text-slate-900">{snapshot.systemLoad.responseTimeP95.toFixed(0)}ms</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Platform Status:</span>
                  <br />
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}