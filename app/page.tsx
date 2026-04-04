'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PRICING_INDEX, NEGOTIATION_CONFIG } from '@/lib/negotiation-config'

// ---------------------------------------------------------------------------
// All 8 tradeable instrument types with simulated live prices
// ---------------------------------------------------------------------------

interface InstrumentTicker {
  ticker: string
  name: string
  spot: number
  currency: string
  unit: string
  change: number // percentage change
  category: 'certificate' | 'carbon_token' | 'asset_token'
}

const BASE_INSTRUMENTS: InstrumentTicker[] = [
  { ticker: 'ESC', name: 'Energy Savings Certificate', spot: 23.00, currency: 'AUD', unit: '/cert', change: 1.2, category: 'certificate' },
  { ticker: 'VEEC', name: 'Victorian Energy Efficiency', spot: 83.50, currency: 'AUD', unit: '/cert', change: -0.4, category: 'certificate' },
  { ticker: 'PRC', name: 'Peak Reduction Certificate', spot: 2.85, currency: 'AUD', unit: '/cert', change: 0.8, category: 'certificate' },
  { ticker: 'ACCU', name: 'Australian Carbon Credit', spot: 35.00, currency: 'AUD', unit: '/unit', change: 2.1, category: 'certificate' },
  { ticker: 'LGC', name: 'Large-scale Generation', spot: 5.25, currency: 'AUD', unit: '/cert', change: -1.5, category: 'certificate' },
  { ticker: 'STC', name: 'Small-scale Technology', spot: 39.50, currency: 'AUD', unit: '/cert', change: 0.1, category: 'certificate' },
  { ticker: 'WREI-CC', name: 'WREI Carbon Credit', spot: PRICING_INDEX.DMRV_SPOT_REFERENCE * 1.5, currency: 'AUD', unit: '/tCO2e', change: 3.2, category: 'carbon_token' },
  { ticker: 'WREI-ACO', name: 'WREI Asset Co Token', spot: 1000.00, currency: 'AUD', unit: '/token', change: 0.6, category: 'asset_token' },
]

// ---------------------------------------------------------------------------
// Market data hook with simulated live updates
// ---------------------------------------------------------------------------

interface DashboardMetrics {
  totalVolume: number
  activeSessions: number
  certificatesTracked: number
  instruments: InstrumentTicker[]
  registryStatus: { name: string; status: 'online' | 'degraded' | 'offline'; label: string }[]
}

function useDashboardData() {
  const [data, setData] = useState<DashboardMetrics>({
    totalVolume: 847_329_000,
    activeSessions: 23,
    certificatesTracked: 2_847_329,
    instruments: BASE_INSTRUMENTS,
    registryStatus: [
      { name: 'TESSA (NSW)', status: 'degraded', label: 'Manual — web portal' },
      { name: 'CER CorTenX', status: 'offline', label: 'Simulated — API pending' },
      { name: 'VEEC Registry', status: 'degraded', label: 'Manual — web portal' },
      { name: 'Blockchain', status: 'offline', label: 'Simulated' },
    ],
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        activeSessions: Math.floor(Math.random() * 15) + 15,
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 50000),
        instruments: prev.instruments.map(inst => ({
          ...inst,
          spot: Math.round((inst.spot + (Math.random() - 0.5) * inst.spot * 0.002) * 100) / 100,
          change: Math.round((inst.change + (Math.random() - 0.5) * 0.3) * 10) / 10,
        })),
      }))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return data
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TickerStrip({ instruments }: { instruments: InstrumentTicker[] }) {
  return (
    <div className="bg-slate-900 border-b border-slate-700 overflow-hidden">
      <div className="flex animate-scroll-left whitespace-nowrap py-1.5 px-4 gap-8">
        {[...instruments, ...instruments].map((inst, i) => (
          <span key={`${inst.ticker}-${i}`} className="inline-flex items-center gap-2 text-xs font-mono">
            <span className="text-amber-400 font-semibold">{inst.ticker}</span>
            <span className="text-white">{inst.currency === 'AUD' ? 'A$' : '$'}{inst.spot.toFixed(2)}</span>
            <span className={inst.change >= 0 ? 'text-green-400' : 'text-red-400'}>
              {inst.change >= 0 ? '+' : ''}{inst.change.toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ value, label, colour = 'text-slate-800' }: { value: string; label: string; colour?: string }) {
  return (
    <div className="bg-white p-4 rounded border border-slate-200 text-center">
      <div className={`text-xl font-semibold font-mono ${colour}`}>{value}</div>
      <div className="bloomberg-section-label mt-1">{label}</div>
    </div>
  )
}

function RegistryIndicator({ name, status, label }: { name: string; status: 'online' | 'degraded' | 'offline'; label: string }) {
  const dotColour = status === 'online' ? 'bg-green-500' : status === 'degraded' ? 'bg-amber-500' : 'bg-gray-400'
  const textColour = status === 'online' ? 'text-green-600' : status === 'degraded' ? 'text-amber-600' : 'text-slate-500'
  return (
    <div className="flex items-center justify-between">
      <span className="bloomberg-small-text text-slate-600">{name}</span>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColour}`} />
        <span className={`bloomberg-small-text ${textColour}`}>{label}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Product Cards
// ---------------------------------------------------------------------------

interface ProductCard {
  title: string
  code: string
  description: string
  metrics: { label: string; value: string; colour: string }[]
  href: string
  accentColour: string
}

const PRODUCT_CARDS: ProductCard[] = [
  {
    title: 'ESC Trading',
    code: 'ESC',
    description: 'Trade NSW Energy Savings Certificates with AI-powered negotiation. Market data from broker publications and simulation.',
    metrics: [
      { label: 'Spot', value: `A$${BASE_INSTRUMENTS[0].spot.toFixed(2)}`, colour: 'text-green-600' },
      { label: 'Penalty Rate', value: 'A$29.48', colour: 'text-amber-600' },
      { label: 'Settlement', value: 'T+2 TESSA', colour: 'text-blue-600' },
    ],
    href: '/trade',
    accentColour: 'border-l-green-500',
  },
  {
    title: 'Carbon Credit Tokens',
    code: 'WREI-CC',
    description: 'WREI-verified carbon credits with dMRV provenance. Blockchain-native with T+0 settlement via Zoniqx zConnect.',
    metrics: [
      { label: 'Anchor', value: 'A$150/tCO2e', colour: 'text-green-600' },
      { label: 'Premium', value: '+50% dMRV', colour: 'text-amber-600' },
      { label: 'Settlement', value: 'T+0 On-chain', colour: 'text-blue-600' },
    ],
    href: '/trade',
    accentColour: 'border-l-blue-500',
  },
  {
    title: 'Asset Co Tokens',
    code: 'WREI-ACO',
    description: 'Tokenised maritime infrastructure equity. NAV-accruing with 28.3% equity yield from 88 electric vessels.',
    metrics: [
      { label: 'Yield', value: '28.3% p.a.', colour: 'text-green-600' },
      { label: 'NAV', value: 'A$1,000/token', colour: 'text-blue-600' },
      { label: 'Distribution', value: 'Quarterly', colour: 'text-slate-600' },
    ],
    href: '/trade',
    accentColour: 'border-l-purple-500',
  },
]

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TradeDashboard() {
  const dashboard = useDashboardData()
  const [activePanel, setActivePanel] = useState('market')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Scrolling Ticker — all 8 instrument types */}
      <TickerStrip instruments={dashboard.instruments} />

      <div className="h-[calc(100vh-36px)] flex flex-col">
        {/* Dashboard Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Trading Dashboard</h1>
              <p className="bloomberg-small-text text-slate-500 mt-1">
                Real-time carbon credit and environmental certificate trading platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bloomberg-section-label">TRD</div>
              <div className="bloomberg-data text-green-600">LIVE</div>
            </div>
          </div>
        </div>

        {/* Three-Panel Bloomberg Layout */}
        <div className="flex-1 flex min-h-0">

          {/* Left Panel - Market Data & Navigation */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">

            {/* Instrument Prices */}
            <div className="p-4 border-b border-slate-200">
              <div className="bloomberg-section-label mb-3">INSTRUMENT PRICES</div>
              <div className="space-y-1.5">
                {dashboard.instruments.map(inst => (
                  <div key={inst.ticker} className="flex justify-between items-center py-1 px-2 rounded hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-5 rounded ${
                        inst.category === 'certificate' ? 'bg-green-500' :
                        inst.category === 'carbon_token' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      <span className="bloomberg-small-text text-slate-700 font-medium">{inst.ticker}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bloomberg-data text-slate-800 text-xs">
                        {inst.currency === 'AUD' ? 'A$' : '$'}{inst.spot.toFixed(2)}
                      </span>
                      <span className={`bloomberg-small-text text-xs ${inst.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {inst.change >= 0 ? '+' : ''}{inst.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-slate-200">
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

            {/* Registry Connection Status */}
            <div className="p-4 flex-1">
              <div className="bloomberg-section-label mb-3">REGISTRY STATUS</div>
              <div className="space-y-2">
                {dashboard.registryStatus.map(reg => (
                  <RegistryIndicator key={reg.name} name={reg.name} status={reg.status} label={reg.label} />
                ))}
              </div>
            </div>
          </div>

          {/* Centre Panel - Main Content */}
          <div className="flex-1 bg-slate-50 flex flex-col min-h-0">

            {/* Panel Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex-shrink-0">
              <div className="flex gap-1">
                {[
                  { id: 'market', label: 'Market Overview' },
                  { id: 'products', label: 'Products' },
                  { id: 'trading', label: 'Active Trading' },
                  { id: 'portfolio', label: 'Portfolio Status' },
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
            <div className="p-6 overflow-y-auto flex-1">
              {activePanel === 'market' && (
                <div className="space-y-6">
                  {/* Dashboard Metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <MetricCard
                      value={`A$${(dashboard.totalVolume / 1_000_000).toFixed(1)}M`}
                      label="PLATFORM VOLUME"
                      colour="text-slate-800"
                    />
                    <MetricCard
                      value={String(dashboard.activeSessions)}
                      label="ACTIVE SESSIONS"
                      colour="text-blue-600"
                    />
                    <MetricCard
                      value={dashboard.certificatesTracked.toLocaleString()}
                      label="CERTIFICATES TRACKED"
                      colour="text-green-600"
                    />
                    <MetricCard
                      value="T+0"
                      label="SETTLEMENT SPEED"
                      colour="text-amber-600"
                    />
                  </div>

                  {/* Certificate Summary Table */}
                  <div className="bg-white rounded border border-slate-200">
                    <div className="px-4 py-3 border-b border-slate-200">
                      <div className="bloomberg-section-label">CERTIFICATE & TOKEN SUMMARY</div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left px-4 py-2 bloomberg-small-text text-slate-500 font-medium">INSTRUMENT</th>
                            <th className="text-right px-4 py-2 bloomberg-small-text text-slate-500 font-medium">SPOT</th>
                            <th className="text-right px-4 py-2 bloomberg-small-text text-slate-500 font-medium">CHG%</th>
                            <th className="text-right px-4 py-2 bloomberg-small-text text-slate-500 font-medium">CATEGORY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.instruments.map(inst => (
                            <tr key={inst.ticker} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="px-4 py-2">
                                <div className="bloomberg-body-text text-slate-800 font-medium">{inst.ticker}</div>
                                <div className="bloomberg-small-text text-slate-500">{inst.name}</div>
                              </td>
                              <td className="px-4 py-2 text-right bloomberg-data text-slate-800">
                                {inst.currency === 'AUD' ? 'A$' : '$'}{inst.spot.toFixed(2)}
                              </td>
                              <td className={`px-4 py-2 text-right bloomberg-data ${inst.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {inst.change >= 0 ? '+' : ''}{inst.change.toFixed(1)}%
                              </td>
                              <td className="px-4 py-2 text-right">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                                  inst.category === 'certificate' ? 'bg-green-50 text-green-700' :
                                  inst.category === 'carbon_token' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                }`}>
                                  {inst.category === 'certificate' ? 'Certificate' : inst.category === 'carbon_token' ? 'Carbon Token' : 'Asset Token'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Market Context */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border border-slate-200">
                      <div className="bloomberg-section-label mb-3">MARKET REFERENCES</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text text-slate-600">VCM Spot</span>
                          <span className="bloomberg-data text-green-600">A${PRICING_INDEX.VCM_SPOT_REFERENCE.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text text-slate-600">dMRV Spot</span>
                          <span className="bloomberg-data text-blue-600">A${PRICING_INDEX.DMRV_SPOT_REFERENCE.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text text-slate-600">Forward Removal</span>
                          <span className="bloomberg-data text-blue-600">A${PRICING_INDEX.FORWARD_REMOVAL_REFERENCE}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text text-slate-600">dMRV Premium</span>
                          <span className="bloomberg-data text-amber-600">+{((PRICING_INDEX.DMRV_PREMIUM_BENCHMARK - 1) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border border-slate-200">
                      <div className="bloomberg-section-label mb-3">INFRASTRUCTURE</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text text-slate-600">Jurisdictions</span>
                          <span className="bloomberg-data text-amber-600">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text text-slate-600">Settlement</span>
                          <span className="bloomberg-data text-green-600">Zoniqx zConnect</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text text-slate-600">Token Standard</span>
                          <span className="bloomberg-data text-blue-600">ERC-7518</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="bloomberg-body-text text-slate-600">Compliance</span>
                          <span className="bloomberg-data text-green-600">zCompliance AI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'products' && (
                <div className="space-y-4">
                  {PRODUCT_CARDS.map((card) => (
                    <div key={card.code} className={`bg-white rounded border border-slate-200 border-l-4 ${card.accentColour} p-5`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="bloomberg-card-title text-slate-800">{card.title}</h3>
                          <p className="bloomberg-small-text text-slate-500 mt-1 max-w-lg">{card.description}</p>
                        </div>
                        <span className="bloomberg-section-label bg-slate-100 px-2 py-1 rounded">{card.code}</span>
                      </div>
                      <div className="flex items-center gap-8 mb-4">
                        {card.metrics.map(m => (
                          <div key={m.label}>
                            <div className="bloomberg-small-text text-slate-500">{m.label}</div>
                            <div className={`bloomberg-data ${m.colour}`}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                      <Link
                        href={card.href}
                        className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded bloomberg-small-text hover:bg-blue-700"
                      >
                        Trade {card.code}
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {activePanel === 'trading' && (
                <div className="bg-white p-6 rounded border border-slate-200">
                  <h3 className="bloomberg-card-title text-slate-800 mb-4">Active Trading Sessions</h3>
                  <div className="space-y-3">
                    {[
                      { persona: 'ESG Fund Manager', instrument: 'WREI-CC', status: 'Negotiating', progress: 65 },
                      { persona: 'Infrastructure Fund', instrument: 'WREI-ACO', status: 'Pricing', progress: 30 },
                      { persona: 'Corporate Compliance', instrument: 'ESC', status: 'Due Diligence', progress: 85 },
                      { persona: 'Trading Desk', instrument: 'ACCU', status: 'Order Entry', progress: 45 },
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded">
                        <div>
                          <div className="bloomberg-body-text text-slate-800">{session.persona}</div>
                          <div className="bloomberg-small-text text-slate-500">{session.instrument} &middot; {session.status}</div>
                        </div>
                        <div className="text-right">
                          <div className="bloomberg-data text-blue-600">{session.progress}%</div>
                          <div className="w-16 h-2 bg-slate-200 rounded mt-1">
                            <div className="h-full bg-blue-600 rounded" style={{ width: `${session.progress}%` }} />
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
                          <span className="bloomberg-body-text">Certificates</span>
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

          {/* Right Panel - Analytics & System */}
          <div className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">

            {/* Real-time Analytics */}
            <div className="p-4 border-b border-slate-200">
              <div className="bloomberg-section-label mb-3">ANALYTICS</div>
              <div className="space-y-4">
                {[
                  { label: 'Price Discovery', value: '+2.3%', colour: 'text-green-600', barColour: 'bg-green-500', pct: 68 },
                  { label: 'Market Depth', value: 'Strong', colour: 'text-blue-600', barColour: 'bg-blue-500', pct: 84 },
                  { label: 'Volatility', value: 'Low', colour: 'text-amber-600', barColour: 'bg-amber-500', pct: 32 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="bloomberg-small-text text-slate-600">{item.label}</span>
                      <span className={`bloomberg-data ${item.colour}`}>{item.value}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded">
                      <div className={`h-full ${item.barColour} rounded`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-4 border-b border-slate-200">
              <div className="bloomberg-section-label mb-3">RECENT ACTIVITY</div>
              <div className="space-y-3">
                {[
                  { action: 'ESC Trade Completed', entity: 'A$23.00 × 5,000', time: '2 min ago' },
                  { action: 'WREI-CC Verified', entity: 'Batch #2847', time: '5 min ago' },
                  { action: 'ACCU Settlement', entity: 'A$175K', time: '12 min ago' },
                  { action: 'WREI-ACO Minted', entity: 'Token #1042', time: '18 min ago' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
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
                {[
                  { label: 'AI Engine', status: 'Online' },
                  { label: 'Market Feed', status: 'Live' },
                  { label: 'Blockchain', status: 'Synced' },
                  { label: 'Compliance', status: 'Active' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="bloomberg-small-text text-slate-600">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="bloomberg-small-text text-green-600">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker scroll animation */}
      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
      `}</style>

      {/* Demo Notice */}
      <div className="fixed bottom-4 right-4 bg-amber-100 border border-amber-300 rounded px-4 py-2 max-w-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          <span className="bloomberg-small-text text-amber-800">Demo Environment</span>
        </div>
        <p className="bloomberg-small-text text-amber-700 mt-1">
          No real credits traded. AI agents only.
        </p>
      </div>
    </div>
  )
}
