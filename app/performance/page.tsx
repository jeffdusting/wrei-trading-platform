"use client";

import React from 'react';
import PerformanceDashboard from '@/components/PerformanceDashboard';

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">WREI Performance Center</h1>
              <p className="text-slate-600 mt-1">Real-time performance monitoring and system health</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Water Roads Environmental Intelligence</div>
              <div className="text-sm text-slate-700 font-medium">Trading Platform v2.3.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Header */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-slate-600">System Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">&lt; 500ms</div>
                <div className="text-sm text-slate-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">150+</div>
                <div className="text-sm text-slate-600">Req/Min Capacity</div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">Real-time Monitoring</h3>
              </div>
              <p className="text-slate-600 mb-4">
                Monitor API performance, system health, and business metrics in real-time with automated alerting.
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Response time tracking</li>
                <li>• Memory usage monitoring</li>
                <li>• Business activity metrics</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">Performance Optimization</h3>
              </div>
              <p className="text-slate-600 mb-4">
                Advanced caching, batch processing, and calculation optimization for institutional-grade performance.
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Intelligent caching strategies</li>
                <li>• Batch processing optimization</li>
                <li>• Financial calculation acceleration</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">🧪</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 ml-3">Load Testing & Benchmarking</h3>
              </div>
              <p className="text-slate-600 mb-4">
                Comprehensive load testing and benchmarking tools to validate performance under institutional workloads.
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Stress testing capabilities</li>
                <li>• Performance benchmarking</li>
                <li>• Regression testing</li>
              </ul>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">API Performance</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>Target: &lt;500ms response time</li>
                  <li>P95: &lt;1000ms</li>
                  <li>P99: &lt;2000ms</li>
                  <li>Throughput: 100+ req/min</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Calculation Performance</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>IRR: &lt;50ms typical</li>
                  <li>NPV: &lt;20ms typical</li>
                  <li>Risk Profile: &lt;10ms</li>
                  <li>Monte Carlo: &lt;5s (1000 runs)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">System Resources</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>Memory: &lt;200MB steady state</li>
                  <li>CPU: Adaptive scaling</li>
                  <li>Storage: Stateless architecture</li>
                  <li>Network: Global CDN delivery</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Reliability Targets</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>Uptime: 99.9%+</li>
                  <li>Error rate: &lt;0.1%</li>
                  <li>MTTR: &lt;5 minutes</li>
                  <li>RTO: &lt;1 minute</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance API Endpoints</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-4 font-medium text-slate-800">Endpoint</th>
                    <th className="text-left py-2 px-4 font-medium text-slate-800">Method</th>
                    <th className="text-left py-2 px-4 font-medium text-slate-800">Purpose</th>
                    <th className="text-left py-2 px-4 font-medium text-slate-800">Authentication</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 font-mono text-blue-600">/api/performance?action=snapshot</td>
                    <td className="py-2 px-4">GET</td>
                    <td className="py-2 px-4">Real-time performance metrics</td>
                    <td className="py-2 px-4">API Key</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 font-mono text-blue-600">/api/performance?action=benchmarks</td>
                    <td className="py-2 px-4">GET</td>
                    <td className="py-2 px-4">Performance benchmark data</td>
                    <td className="py-2 px-4">API Key</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 font-mono text-blue-600">/api/performance?action=health</td>
                    <td className="py-2 px-4">GET</td>
                    <td className="py-2 px-4">System health report</td>
                    <td className="py-2 px-4">API Key</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-4 font-mono text-blue-600">/api/performance</td>
                    <td className="py-2 px-4">POST</td>
                    <td className="py-2 px-4">Run performance tests</td>
                    <td className="py-2 px-4">API Key</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              📊 Open Performance Dashboard
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              🧪 Run Benchmark Tests
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              ⚡ View Optimization Reports
            </button>
            <a
              href="/negotiate"
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              ← Back to Trading Platform
            </a>
          </div>
        </div>
      </div>

      {/* Performance Dashboard Component */}
      <PerformanceDashboard />
    </div>
  );
}