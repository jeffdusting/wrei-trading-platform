'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WREI_TOKEN_CONFIG, PRICING_INDEX } from '@/lib/negotiation-config'

// Market data simulation for real-time updates
function useMarketData() {
  const [data, setData] = useState({
    vcmSpot: PRICING_INDEX.VCM_SPOT_REFERENCE,
    forwardRemoval: PRICING_INDEX.FORWARD_REMOVAL_REFERENCE,
    dmrvPremium: PRICING_INDEX.DMRV_PREMIUM_BENCHMARK,
    totalCredits: 2847329,
    activeTrades: 23,
    settlementTime: 180
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        vcmSpot: prev.vcmSpot + (Math.random() - 0.5) * 0.1,
        activeTrades: Math.floor(Math.random() * 15) + 15,
        settlementTime: Math.floor(Math.random() * 50) + 150
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return data
}

export default function TradeDashboard() {
  const marketData = useMarketData()
  const [activePanel, setActivePanel] = useState('market')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Bloomberg Terminal Three-Panel Layout */}
      <div className="h-screen flex flex-col">

        {/* Dashboard Header - No Large Hero */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Trading Dashboard</h1>
              <p className="bloomberg-small-text text-slate-500 mt-1">
                Real-time carbon credit trading platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bloomberg-section-label">TRD</div>
              <div className="bloomberg-data text-green-600">LIVE</div>
            </div>
          </div>
        </div>

        {/* Three-Panel Bloomberg Layout */}
        <div className="flex-1 flex">

          {/* Left Panel - Market Data & Navigation */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">

            {/* Market Overview */}
            <div className="p-4 border-b border-slate-200">
              <div className="bloomberg-section-label mb-3">MARKET DEPTH</div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="bloomberg-body-text text-slate-600">VCM SPOT</span>
                  <span className="bloomberg-data text-green-600">A${marketData.vcmSpot.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="bloomberg-body-text text-slate-600">FORWARD REM</span>
                  <span className="bloomberg-data text-blue-600">A${marketData.forwardRemoval}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="bloomberg-body-text text-slate-600">DMRV PREMIUM</span>
                  <span className="bloomberg-data text-amber-600">+{((marketData.dmrvPremium - 1) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Trading Products */}
            <div className="p-4 border-b border-slate-200">
              <div className="bloomberg-section-label mb-3">PRODUCTS</div>

              <div className="space-y-2">
                <div className="p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-8 bg-green-500 rounded"></div>
                    <div>
                      <div className="bloomberg-body-text text-slate-800">Carbon Credits</div>
                      <div className="bloomberg-small-text text-slate-500">dMRV Verified</div>
                    </div>
                  </div>
                </div>

                <div className="p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-8 bg-blue-500 rounded"></div>
                    <div>
                      <div className="bloomberg-body-text text-slate-800">Asset Co Tokens</div>
                      <div className="bloomberg-small-text text-slate-500">Infrastructure</div>
                    </div>
                  </div>
                </div>

                <div className="p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-8 bg-purple-500 rounded"></div>
                    <div>
                      <div className="bloomberg-body-text text-slate-800">Dual Portfolio</div>
                      <div className="bloomberg-small-text text-slate-500">Diversified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 flex-1">
              <div className="bloomberg-section-label mb-3">QUICK ACTIONS</div>

              <div className="space-y-2">
                <Link
                  href="/trade"
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded bloomberg-body-text hover:bg-blue-700 text-center"
                >
                  Begin Trading
                </Link>

                <Link
                  href="/analyse"
                  className="block w-full bg-slate-100 text-slate-700 px-4 py-2 rounded bloomberg-body-text hover:bg-slate-200 text-center"
                >
                  Analysis Tools
                </Link>

                <Link
                  href="/institutional/portal"
                  className="block w-full bg-slate-100 text-slate-700 px-4 py-2 rounded bloomberg-body-text hover:bg-slate-200 text-center"
                >
                  Institutional Portal
                </Link>
              </div>
            </div>
          </div>

          {/* Center Panel - Main Content */}
          <div className="flex-1 bg-slate-50">

            {/* Panel Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 py-2">
              <div className="flex gap-1">
                {[
                  { id: 'market', label: 'Market Overview' },
                  { id: 'trading', label: 'Active Trading' },
                  { id: 'portfolio', label: 'Portfolio Status' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePanel(tab.id)}
                    className={`
                      px-4 py-2 bloomberg-nav-item border-b-2 transition-colors
                      ${activePanel === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-6">
              {activePanel === 'market' && (
                <div className="space-y-6">
                  {/* Live Trading Stats */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded border border-slate-200 text-center">
                      <div className="bloomberg-large-metric text-slate-800">{marketData.totalCredits.toLocaleString()}</div>
                      <div className="bloomberg-section-label mt-2">CREDITS VERIFIED</div>
                    </div>

                    <div className="bg-white p-6 rounded border border-slate-200 text-center">
                      <div className="bloomberg-large-metric text-blue-600">{marketData.activeTrades}</div>
                      <div className="bloomberg-section-label mt-2">ACTIVE NEGOTIATIONS</div>
                    </div>

                    <div className="bg-white p-6 rounded border border-slate-200 text-center">
                      <div className="bloomberg-large-metric text-green-600">&lt; {marketData.settlementTime}s</div>
                      <div className="bloomberg-section-label mt-2">AVG SETTLEMENT</div>
                    </div>
                  </div>

                  {/* Market Trends */}
                  <div className="bg-white p-6 rounded border border-slate-200">
                    <h3 className="bloomberg-card-title text-slate-800 mb-4">Market Trends</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="bloomberg-section-label mb-2">JURISDICTIONS</div>
                        <div className="bloomberg-large-metric text-amber-600">23</div>
                        <div className="bloomberg-small-text text-slate-500">Compliance coverage</div>
                      </div>

                      <div>
                        <div className="bloomberg-section-label mb-2">SETTLEMENT</div>
                        <div className="bloomberg-large-metric text-green-600">T+0</div>
                        <div className="bloomberg-small-text text-slate-500">Atomic & non-custodial</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'trading' && (
                <div className="bg-white p-6 rounded border border-slate-200">
                  <h3 className="bloomberg-card-title text-slate-800 mb-4">Active Trading Sessions</h3>
                  <div className="space-y-3">
                    {[
                      { persona: 'ESG Fund Manager', status: 'Negotiating', progress: 65 },
                      { persona: 'Infrastructure Fund', status: 'Pricing', progress: 30 },
                      { persona: 'Corporate Compliance', status: 'Due Diligence', progress: 85 }
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded">
                        <div>
                          <div className="bloomberg-body-text text-slate-800">{session.persona}</div>
                          <div className="bloomberg-small-text text-slate-500">{session.status}</div>
                        </div>
                        <div className="text-right">
                          <div className="bloomberg-data text-blue-600">{session.progress}%</div>
                          <div className="w-16 h-2 bg-slate-200 rounded mt-1">
                            <div
                              className="h-full bg-blue-600 rounded"
                              style={{ width: `${session.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'portfolio' && (
                <div className="bg-white p-6 rounded border border-slate-200">
                  <h3 className="bloomberg-card-title text-slate-800 mb-4">Portfolio Overview</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="bloomberg-section-label mb-3">ALLOCATION</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text">Carbon Credits</span>
                          <span className="bloomberg-data">60%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text">Asset Co Tokens</span>
                          <span className="bloomberg-data">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text">Cash</span>
                          <span className="bloomberg-data">10%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="bloomberg-section-label mb-3">PERFORMANCE</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text">Total Value</span>
                          <span className="bloomberg-data text-green-600">A$2.8M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text">30d Return</span>
                          <span className="bloomberg-data text-green-600">+12.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text">Volatility</span>
                          <span className="bloomberg-data text-amber-600">8.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Analytics & Notifications */}
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col">

            {/* Real-time Analytics */}
            <div className="p-4 border-b border-slate-200">
              <div className="bloomberg-section-label mb-3">ANALYTICS</div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="bloomberg-small-text text-slate-600">Price Discovery</span>
                    <span className="bloomberg-data text-green-600">+2.3%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded">
                    <div className="h-full bg-green-500 rounded" style={{ width: '68%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="bloomberg-small-text text-slate-600">Market Depth</span>
                    <span className="bloomberg-data text-blue-600">Strong</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded">
                    <div className="h-full bg-blue-500 rounded" style={{ width: '84%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="bloomberg-small-text text-slate-600">Volatility</span>
                    <span className="bloomberg-data text-amber-600">Low</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded">
                    <div className="h-full bg-amber-500 rounded" style={{ width: '32%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-4 border-b border-slate-200">
              <div className="bloomberg-section-label mb-3">RECENT ACTIVITY</div>

              <div className="space-y-3">
                {[
                  { action: 'Trade Started', entity: 'ESG Fund', time: '2 min ago' },
                  { action: 'Credit Verified', entity: 'Batch #2847', time: '5 min ago' },
                  { action: 'Settlement Complete', entity: 'A$125K', time: '12 min ago' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="bloomberg-small-text text-slate-800">{item.action}</div>
                      <div className="bloomberg-small-text text-slate-500">{item.entity}</div>
                      <div className="bloomberg-small-text text-slate-400">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="p-4 flex-1">
              <div className="bloomberg-section-label mb-3">SYSTEM STATUS</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bloomberg-small-text text-slate-600">AI Engine</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="bloomberg-small-text text-green-600">Online</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="bloomberg-small-text text-slate-600">Market Feed</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="bloomberg-small-text text-green-600">Live</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="bloomberg-small-text text-slate-600">Blockchain</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="bloomberg-small-text text-green-600">Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice - Compact Bloomberg Style */}
      <div className="fixed bottom-4 right-4 bg-amber-100 border border-amber-300 rounded px-4 py-2 max-w-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span className="bloomberg-small-text text-amber-800">Demo Environment</span>
        </div>
        <p className="bloomberg-small-text text-amber-700 mt-1">
          No real credits traded. AI agents only.
        </p>
      </div>
    </div>
  )
}