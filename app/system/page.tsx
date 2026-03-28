'use client'

import { useState } from 'react'
import Link from 'next/link'

interface TabProps {
  id: string
  label: string
  active: boolean
  onClick: () => void
}

const Tab = ({ id, label, active, onClick }: TabProps) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 bloomberg-nav-item transition-all duration-200
      border-b-2 ${active
        ? 'border-blue-500 text-blue-600 bg-blue-50'
        : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
      }
    `}
  >
    {label}
  </button>
)

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState('demo')

  const tabs = [
    { id: 'demo', label: 'Demo Mode' },
    { id: 'performance', label: 'Performance' },
    { id: 'api', label: 'API Explorer' }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">System Management</h1>
              <p className="bloomberg-body-text text-slate-600 mt-1">
                Demo controls, system performance and API access
              </p>
            </div>
            <div className="bloomberg-section-label">
              SYS
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                id={tab.id}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'demo' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="bloomberg-card-title text-slate-800 mb-4">Demo Mode Controls</h2>
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                <h3 className="bloomberg-card-title text-amber-800 mb-2">Demonstration Environment</h3>
                <p className="bloomberg-body-text text-amber-700">
                  This is a demonstration of the WREI platform capabilities. No real carbon credits are traded,
                  and all negotiations are with AI agents.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="bloomberg-card-title text-slate-800 mb-3">Demo Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center bloomberg-body-text text-slate-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      AI-powered negotiation scenarios
                    </li>
                    <li className="flex items-center bloomberg-body-text text-slate-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Real-time market data simulation
                    </li>
                    <li className="flex items-center bloomberg-body-text text-slate-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Multi-persona buyer interactions
                    </li>
                    <li className="flex items-center bloomberg-body-text text-slate-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Institutional onboarding flow
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="bloomberg-card-title text-slate-800 mb-3">Quick Navigation</h3>
                  <div className="space-y-2">
                    <Link href="/negotiate" className="block p-2 border border-slate-200 rounded hover:bg-slate-50">
                      <div className="bloomberg-body-text text-blue-600">Begin Negotiation</div>
                      <div className="bloomberg-small-text text-slate-500">Start AI-powered trading session</div>
                    </Link>
                    <Link href="/institutional/portal" className="block p-2 border border-slate-200 rounded hover:bg-slate-50">
                      <div className="bloomberg-body-text text-blue-600">Institutional Portal</div>
                      <div className="bloomberg-small-text text-slate-500">Onboarding and compliance flow</div>
                    </Link>
                    <Link href="/analyse" className="block p-2 border border-slate-200 rounded hover:bg-slate-50">
                      <div className="bloomberg-body-text text-blue-600">Analysis Tools</div>
                      <div className="bloomberg-small-text text-slate-500">Investment calculator and scenarios</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="bloomberg-card-title text-slate-800 mb-4">System Performance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-slate-200 rounded">
                <div className="bloomberg-large-metric text-green-600">99.8%</div>
                <div className="bloomberg-section-label mt-2">UPTIME</div>
                <div className="bloomberg-small-text text-slate-500 mt-1">Last 30 days</div>
              </div>

              <div className="text-center p-4 border border-slate-200 rounded">
                <div className="bloomberg-large-metric text-blue-600">45ms</div>
                <div className="bloomberg-section-label mt-2">AVG RESPONSE</div>
                <div className="bloomberg-small-text text-slate-500 mt-1">API endpoints</div>
              </div>

              <div className="text-center p-4 border border-slate-200 rounded">
                <div className="bloomberg-large-metric text-slate-600">2,847</div>
                <div className="bloomberg-section-label mt-2">TRANSACTIONS</div>
                <div className="bloomberg-small-text text-slate-500 mt-1">This month</div>
              </div>

              <div className="text-center p-4 border border-slate-200 rounded">
                <div className="bloomberg-large-metric text-green-600">T+0</div>
                <div className="bloomberg-section-label mt-2">SETTLEMENT</div>
                <div className="bloomberg-small-text text-slate-500 mt-1">Atomic & non-custodial</div>
              </div>

              <div className="text-center p-4 border border-slate-200 rounded">
                <div className="bloomberg-large-metric text-blue-600">23</div>
                <div className="bloomberg-section-label mt-2">JURISDICTIONS</div>
                <div className="bloomberg-small-text text-slate-500 mt-1">Compliance coverage</div>
              </div>

              <div className="text-center p-4 border border-slate-200 rounded">
                <div className="bloomberg-large-metric text-green-600">100%</div>
                <div className="bloomberg-section-label mt-2">VERIFICATION</div>
                <div className="bloomberg-small-text text-slate-500 mt-1">Credit authenticity</div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="bloomberg-card-title text-slate-800 mb-3">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
                  <span className="bloomberg-body-text text-slate-600">AI Negotiation Engine</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="bloomberg-small-text text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
                  <span className="bloomberg-body-text text-slate-600">Market Data Feed</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="bloomberg-small-text text-green-600">Live</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
                  <span className="bloomberg-body-text text-slate-600">Blockchain Network</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="bloomberg-small-text text-green-600">Synchronized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="bloomberg-card-title text-slate-800 mb-4">API Explorer</h2>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="bloomberg-card-title text-blue-800 mb-2">Coming Soon</h3>
                <p className="bloomberg-body-text text-blue-700">
                  API documentation and interactive explorer will be available in the next release.
                  Contact our team for early access to developer resources.
                </p>
              </div>

              <div>
                <h3 className="bloomberg-card-title text-slate-800 mb-3">Available Endpoints</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
                    <div>
                      <span className="bloomberg-data text-green-600">GET</span>
                      <span className="bloomberg-body-text text-slate-600 ml-3">/api/market-data</span>
                    </div>
                    <span className="bloomberg-small-text text-slate-500">Real-time pricing</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
                    <div>
                      <span className="bloomberg-data text-blue-600">POST</span>
                      <span className="bloomberg-body-text text-slate-600 ml-3">/api/negotiate</span>
                    </div>
                    <span className="bloomberg-small-text text-slate-500">Start negotiation session</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
                    <div>
                      <span className="bloomberg-data text-amber-600">PUT</span>
                      <span className="bloomberg-body-text text-slate-600 ml-3">/api/verification</span>
                    </div>
                    <span className="bloomberg-small-text text-slate-500">Credit verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}