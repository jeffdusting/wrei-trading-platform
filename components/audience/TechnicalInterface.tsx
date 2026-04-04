/**
 * WREI Trading Platform - Technical Interface
 *
 * Step 1.2: Multi-Audience Interface System - Technical Interface
 * System architecture, API integration, and technical implementation details for CTOs and architects
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDemoMode } from '@/lib/demo-mode/demo-state-manager';
// import { getNorthmoreGordonValueProp } from '@/lib/demo-mode/esc-market-context'; // Removed for Phase 4
import { NSW_ESC_CONFIG } from '@/lib/negotiation-config';

// Local stub for removed esc-market-context function
const getNorthmoreGordonValueProp = (_audience?: string) => ({
  headline: '',
  benefits: [] as string[],
  duration: '',
});
import {
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  BoltIcon,
  CircleStackIcon,
  CommandLineIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface TechnicalMetric {
  label: string;
  value: string;
  target: string;
  status: 'excellent' | 'good' | 'warning';
  description: string;
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  responseTime: string;
  uptime: string;
  requests: string;
}

interface SystemComponent {
  name: string;
  version: string;
  status: 'healthy' | 'warning' | 'error';
  cpu: number;
  memory: number;
  description: string;
}

const TechnicalMetric: React.FC<{ metric: TechnicalMetric }> = ({ metric }) => {
  const statusColors = {
    excellent: 'text-green-600 bg-green-100',
    good: 'text-blue-600 bg-blue-100',
    warning: 'text-yellow-600 bg-yellow-100'
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{metric.label}</h4>
        <span className={`px-2 py-1 rounded bloomberg-section-label font-medium ${statusColors[metric.status]}`}>
          {metric.status.toUpperCase()}
        </span>
      </div>
      <div className="bloomberg-large-metric text-gray-900 mb-1">{metric.value}</div>
      <div className="bloomberg-small-text text-gray-600 mb-2">Target: {metric.target}</div>
      <p className="bloomberg-section-label text-gray-500">{metric.description}</p>
    </div>
  );
};

export const TechnicalInterface: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('architecture');
  const [liveMetrics, setLiveMetrics] = useState(true);
  const demoMode = useDemoMode();
  const escData = demoMode.getESCDemoData();
  const valueProps = getNorthmoreGordonValueProp('technical');

  const systemMetrics: TechnicalMetric[] = [
    {
      label: 'API Response Time',
      value: '47ms',
      target: '< 50ms',
      status: 'excellent',
      description: 'P95 response time for ESC trading endpoints'
    },
    {
      label: 'System Uptime',
      value: '99.94%',
      target: '99.9%',
      status: 'excellent',
      description: '30-day rolling uptime with automated failover'
    },
    {
      label: 'Data Freshness',
      value: '12s',
      target: '< 15s',
      status: 'excellent',
      description: 'Market data ingestion latency'
    },
    {
      label: 'Throughput',
      value: '8,450/s',
      target: '10,000/s',
      status: 'good',
      description: 'Peak API requests per second'
    },
    {
      label: 'Error Rate',
      value: '0.02%',
      target: '< 0.1%',
      status: 'excellent',
      description: '7-day rolling error rate'
    },
    {
      label: 'Cache Hit Rate',
      value: '94.2%',
      target: '> 90%',
      status: 'excellent',
      description: 'Redis cache efficiency for market data'
    }
  ];

  const apiEndpoints: APIEndpoint[] = [
    {
      method: 'GET',
      path: '/api/v1/esc/market-data',
      description: 'Real-time NSW ESC market data',
      responseTime: '23ms',
      uptime: '99.95%',
      requests: '2.4M/day'
    },
    {
      method: 'POST',
      path: '/api/v1/esc/negotiate',
      description: 'AI-powered ESC negotiation endpoint',
      responseTime: '340ms',
      uptime: '99.91%',
      requests: '145K/day'
    },
    {
      method: 'GET',
      path: '/api/v1/compliance/validation',
      description: 'CER compliance validation',
      responseTime: '156ms',
      uptime: '99.87%',
      requests: '89K/day'
    },
    {
      method: 'POST',
      path: '/api/v1/settlement/initiate',
      description: 'Zoniqx blockchain settlement',
      responseTime: '1.2s',
      uptime: '99.99%',
      requests: '12K/day'
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/performance',
      description: 'Trading performance metrics',
      responseTime: '78ms',
      uptime: '99.93%',
      requests: '456K/day'
    }
  ];

  const systemComponents: SystemComponent[] = [
    {
      name: 'Trading Engine',
      version: 'v2.4.1',
      status: 'healthy',
      cpu: 23,
      memory: 67,
      description: 'Core ESC trading and negotiation processing'
    },
    {
      name: 'Market Data Service',
      version: 'v1.8.3',
      status: 'healthy',
      cpu: 45,
      memory: 34,
      description: 'Broker feed data ingestion and processing'
    },
    {
      name: 'Compliance Engine',
      version: 'v3.1.0',
      status: 'healthy',
      cpu: 18,
      memory: 29,
      description: 'CER validation and regulatory compliance'
    },
    {
      name: 'AI Negotiator',
      version: 'v1.2.4',
      status: 'warning',
      cpu: 78,
      memory: 85,
      description: 'Claude-powered negotiation intelligence'
    },
    {
      name: 'Settlement Gateway',
      version: 'v2.0.1',
      status: 'healthy',
      cpu: 12,
      memory: 22,
      description: 'Zoniqx blockchain integration service'
    }
  ];

  const tabs = [
    { id: 'architecture', label: 'System Architecture' },
    { id: 'performance', label: 'Performance Metrics' },
    { id: 'apis', label: 'API Endpoints' },
    { id: 'monitoring', label: 'System Monitoring' },
    { id: 'integration', label: 'Integration Details' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-demo="technical-interface">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="bloomberg-page-heading mb-2">Technical Integration Dashboard</h1>
            <p className="text-green-100 bloomberg-card-title">NSW ESC Trading Platform - System Architecture & APIs</p>
            <div className="flex items-center space-x-4 mt-4 text-green-100 bloomberg-small-text">
              <span>API Version: v2.4.1</span>
              <span>•</span>
              <span>Uptime: 99.94%</span>
              <span>•</span>
              <span>Response Time: &lt;50ms</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${liveMetrics ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-green-100">Live Metrics</span>
            </div>
            <div className="text-green-200 bloomberg-small-text mt-1">Last updated: 12s ago</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium bloomberg-small-text ${
                  selectedTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'architecture' && (
            <div className="space-y-6" data-demo="technical-architecture">
              <h3 className="bloomberg-metric-value text-gray-900">System Architecture Overview</h3>

              {/* Architecture Diagram */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-4 mb-3">
                      <CloudIcon className="w-8 h-8 text-blue-600 mx-auto" />
                    </div>
                    <h4 className=" text-gray-900">Data Layer</h4>
                    <p className="bloomberg-small-text text-gray-600 mt-2">
                      Broker Price Feeds<br/>
                      CER Registry Integration<br/>
                      PostgreSQL + Redis
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 rounded-lg p-4 mb-3">
                      <CpuChipIcon className="w-8 h-8 text-green-600 mx-auto" />
                    </div>
                    <h4 className=" text-gray-900">Processing Layer</h4>
                    <p className="bloomberg-small-text text-gray-600 mt-2">
                      Trading Engine<br/>
                      AI Negotiation<br/>
                      Compliance Validation
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-lg p-4 mb-3">
                      <ShieldCheckIcon className="w-8 h-8 text-purple-600 mx-auto" />
                    </div>
                    <h4 className=" text-gray-900">Settlement Layer</h4>
                    <p className="bloomberg-small-text text-gray-600 mt-2">
                      Zoniqx zProtocol<br/>
                      Blockchain Settlement<br/>
                      Audit Trail Generation
                    </p>
                  </div>
                </div>
              </div>

              {/* Technology Stack */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className=" text-gray-900 mb-3">Core Technologies</h4>
                  <div className="space-y-2 bloomberg-small-text">
                    <div className="flex justify-between">
                      <span>Runtime:</span>
                      <span className="font-medium">Node.js 18.x + TypeScript</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Framework:</span>
                      <span className="font-medium">Next.js 14 (App Router)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database:</span>
                      <span className="font-medium">PostgreSQL 15 + Redis 7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Engine:</span>
                      <span className="font-medium">Claude Sonnet 4 API</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blockchain:</span>
                      <span className="font-medium">Zoniqx zProtocol</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className=" text-gray-900 mb-3">Infrastructure</h4>
                  <div className="space-y-2 bloomberg-small-text">
                    <div className="flex justify-between">
                      <span>Hosting:</span>
                      <span className="font-medium">Vercel + AWS Lambda</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CDN:</span>
                      <span className="font-medium">Cloudflare Enterprise</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monitoring:</span>
                      <span className="font-medium">DataDog + Sentry</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security:</span>
                      <span className="font-medium">SOC2 Type II + ISO 27001</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compliance:</span>
                      <span className="font-medium">AFSL 246896 + AUSTRAC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'performance' && (
            <div className="space-y-6" data-demo="technical-performance">
              <h3 className="bloomberg-metric-value text-gray-900">Performance Metrics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemMetrics.map((metric, index) => (
                  <TechnicalMetric key={index} metric={metric} />
                ))}
              </div>

              {/* Performance Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className=" text-gray-900 mb-3">Response Time Trend (24h)</h4>
                  <div className="flex items-end space-x-1 h-32">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="bg-green-400 rounded-t"
                        style={{
                          height: `${Math.random() * 60 + 40}%`,
                          width: '100%'
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between bloomberg-section-label text-gray-500 mt-2">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className=" text-gray-900 mb-3">Throughput (requests/min)</h4>
                  <div className="flex items-end space-x-1 h-32">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="bg-blue-400 rounded-t"
                        style={{
                          height: `${Math.random() * 80 + 20}%`,
                          width: '100%'
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between bloomberg-section-label text-gray-500 mt-2">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'apis' && (
            <div className="space-y-6" data-demo="technical-apis">
              <div className="flex justify-between items-center">
                <h3 className="bloomberg-metric-value text-gray-900">API Endpoints</h3>
                <a
                  href="#"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg bloomberg-small-text font-medium hover:bg-green-700"
                >
                  View Full API Documentation
                </a>
              </div>

              <div className="space-y-3">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded bloomberg-section-label font-medium ${
                          endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                          endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="bloomberg-small-text bloomberg-data text-gray-900">{endpoint.path}</code>
                      </div>
                      <div className="text-right bloomberg-small-text">
                        <div className="font-medium text-gray-900">{endpoint.responseTime}</div>
                        <div className="text-gray-500">avg response</div>
                      </div>
                    </div>
                    <p className="bloomberg-small-text text-gray-600 mb-2">{endpoint.description}</p>
                    <div className="flex items-center justify-between bloomberg-section-label text-gray-500">
                      <span>Uptime: {endpoint.uptime}</span>
                      <span>Requests: {endpoint.requests}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'monitoring' && (
            <div className="space-y-6" data-demo="technical-monitoring">
              <h3 className="bloomberg-metric-value text-gray-900">System Monitoring</h3>

              <div className="space-y-4">
                {systemComponents.map((component, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          component.status === 'healthy' ? 'bg-green-500' :
                          component.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <h4 className=" text-gray-900">{component.name}</h4>
                        <span className="bloomberg-small-text text-gray-500">{component.version}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full bloomberg-section-label font-medium ${
                        component.status === 'healthy' ? 'bg-green-100 text-green-700' :
                        component.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {component.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="bloomberg-small-text text-gray-600 mb-3">{component.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between bloomberg-small-text mb-1">
                          <span>CPU Usage</span>
                          <span>{component.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              component.cpu > 80 ? 'bg-red-500' :
                              component.cpu > 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${component.cpu}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between bloomberg-small-text mb-1">
                          <span>Memory Usage</span>
                          <span>{component.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              component.memory > 80 ? 'bg-red-500' :
                              component.memory > 60 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${component.memory}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'integration' && (
            <div className="space-y-6" data-demo="technical-integration">
              <h3 className="bloomberg-metric-value text-gray-900">Integration Details</h3>

              {/* Data Sources */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className=" text-gray-900 mb-4">External Data Sources</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Broker Price Feeds</h5>
                    <ul className="bloomberg-small-text text-gray-600 space-y-1">
                      <li>• ESC/VEEC/ACCU spot pricing (Ecovantage, NMG, CORE)</li>
                      <li>• Weekly publication scraping + simulation</li>
                      <li>• Market reference pricing</li>
                      <li>• Fallback: simulation engine</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Clean Energy Regulator</h5>
                    <ul className="bloomberg-small-text text-gray-600 space-y-1">
                      <li>• NSW ESC Registry validation</li>
                      <li>• Certificate authenticity verification</li>
                      <li>• Compliance requirement updates</li>
                      <li>• Update frequency: Real-time webhook</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Integration Patterns */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className=" text-gray-900 mb-3">Authentication</h4>
                  <div className="space-y-2 bloomberg-small-text">
                    <div><strong>API Keys:</strong> Bearer token authentication</div>
                    <div><strong>OAuth 2.0:</strong> For third-party integrations</div>
                    <div><strong>mTLS:</strong> For high-security connections</div>
                    <div><strong>Rate Limiting:</strong> 10,000 requests/hour</div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className=" text-gray-900 mb-3">Data Formats</h4>
                  <div className="space-y-2 bloomberg-small-text">
                    <div><strong>Request/Response:</strong> JSON API</div>
                    <div><strong>WebSocket:</strong> Real-time market data</div>
                    <div><strong>Webhooks:</strong> Event notifications</div>
                    <div><strong>Bulk Data:</strong> CSV/Parquet exports</div>
                  </div>
                </div>
              </div>

              {/* Sample Code */}
              <div className="bg-gray-900 rounded-lg p-6 text-green-400 bloomberg-data bloomberg-small-text">
                <div className="text-gray-400 mb-2">{`// Sample API Integration`}</div>
                <div className="space-y-1">
                  <div><span className="text-blue-400">const</span> response = <span className="text-blue-400">await</span> fetch(<span className="text-yellow-300">&apos;/api/v1/esc/market-data&apos;</span>, {`{`}</div>
                  <div className="ml-4">headers: {`{`} <span className="text-yellow-300">&apos;Authorization&apos;</span>: <span className="text-yellow-300">&apos;Bearer $`{`token`}`&apos;</span> {`}`},</div>
                  <div className="ml-4">method: <span className="text-yellow-300">&apos;GET&apos;</span></div>
                  <div>{`});`}</div>
                  <div></div>
                  <div><span className="text-blue-400">const</span> marketData = <span className="text-blue-400">await</span> response.json();</div>
                  <div>console.log(marketData.esc_spot_price); <span className="text-gray-500">{`// 23.00`}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicalInterface;