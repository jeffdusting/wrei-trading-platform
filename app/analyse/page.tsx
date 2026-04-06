'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PRICING_INDEX } from '@/lib/negotiation-config'
import PriceVolumeChart from '@/components/charts/PriceVolumeChart'
import InstrumentSelector from '@/components/charts/InstrumentSelector'
import TimeRangeSelector from '@/components/charts/TimeRangeSelector'
import SpotPriceHeader from '@/components/charts/SpotPriceHeader'
import { useCombinedChartData } from '@/components/charts/hooks/useCombinedChartData'
import { CHART_INSTRUMENTS, TIME_RANGE_DAYS } from '@/components/charts/types'
import type { TimeRange } from '@/components/charts/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TabProps {
  id: string
  label: string
  active: boolean
  onClick: () => void
}

interface MarketCommentary {
  commentary: string
  generatedAt: string
  topics: string[]
  source: 'ai' | 'fallback'
}

interface CarbonCredit {
  id: string
  standard: string
  vintage: string
  projectType: string
  coBenefits: string[]
  pricePerTonne: number
  available: number
  verificationScore: number
  region: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INSTRUMENT_SUMMARY = [
  { ticker: 'ESC', name: 'Energy Savings Certificate', spot: 23.00, volume: '4.5M/yr', scheme: 'NSW ESS', currency: 'AUD' },
  { ticker: 'VEEC', name: 'Victorian Energy Efficiency', spot: 83.50, volume: '6.2M/yr', scheme: 'VEU', currency: 'AUD' },
  { ticker: 'PRC', name: 'Peak Reduction Certificate', spot: 2.85, volume: '1.8M/yr', scheme: 'NSW PDRS', currency: 'AUD' },
  { ticker: 'ACCU', name: 'Australian Carbon Credit', spot: 35.00, volume: '16M/yr', scheme: 'ERF', currency: 'AUD' },
  { ticker: 'LGC', name: 'Large-scale Generation', spot: 5.25, volume: '38M/yr', scheme: 'RET', currency: 'AUD' },
  { ticker: 'STC', name: 'Small-scale Technology', spot: 39.50, volume: '28M/yr', scheme: 'SRES', currency: 'AUD' },
  { ticker: 'WREI-CC', name: 'WREI Carbon Credit', spot: PRICING_INDEX.DMRV_SPOT_REFERENCE * 1.5, volume: '3.1M base', scheme: 'WREI dMRV', currency: 'AUD' },
  { ticker: 'WREI-ACO', name: 'WREI Asset Co Token', spot: 1000.00, volume: 'A$131M equity', scheme: 'WREI LeaseCo', currency: 'AUD' },
]

const DEMO_CARBON_CREDITS: CarbonCredit[] = [
  { id: 'WCC-2024-001', standard: 'ISO 14064-2', vintage: '2024', projectType: 'Vessel Efficiency', coBenefits: ['Air Quality', 'Noise Reduction'], pricePerTonne: 152, available: 5000, verificationScore: 96, region: 'Sydney Harbour' },
  { id: 'WCC-2024-002', standard: 'Verra VCS', vintage: '2024', projectType: 'Modal Shift', coBenefits: ['Congestion Relief', 'Health Benefits'], pricePerTonne: 148, available: 12000, verificationScore: 94, region: 'Parramatta River' },
  { id: 'WCC-2023-015', standard: 'Gold Standard', vintage: '2023', projectType: 'Vessel Efficiency', coBenefits: ['Air Quality', 'Climate Resilience'], pricePerTonne: 145, available: 3200, verificationScore: 92, region: 'Manly Route' },
  { id: 'WCC-2024-003', standard: 'ISO 14064-2', vintage: '2024', projectType: 'Construction Avoidance', coBenefits: ['Biodiversity', 'Water Quality'], pricePerTonne: 155, available: 800, verificationScore: 97, region: 'Barangaroo' },
  { id: 'WCC-2023-022', standard: 'Verra VCS', vintage: '2023', projectType: 'Modal Shift', coBenefits: ['Health Benefits', 'Economic Access'], pricePerTonne: 140, available: 8500, verificationScore: 91, region: 'Olympic Park' },
  { id: 'WCC-2024-004', standard: 'Gold Standard', vintage: '2024', projectType: 'Vessel Efficiency', coBenefits: ['Air Quality', 'Noise Reduction', 'Tourism'], pricePerTonne: 158, available: 2100, verificationScore: 98, region: 'Circular Quay' },
  { id: 'WCC-2023-030', standard: 'ISO 14064-2', vintage: '2023', projectType: 'Construction Avoidance', coBenefits: ['Biodiversity'], pricePerTonne: 138, available: 1500, verificationScore: 89, region: 'Pyrmont' },
  { id: 'WCC-2024-005', standard: 'Verra VCS', vintage: '2024', projectType: 'Modal Shift', coBenefits: ['Congestion Relief', 'Air Quality', 'Health Benefits'], pricePerTonne: 150, available: 15000, verificationScore: 95, region: 'Western Sydney' },
]

const STANDARDS = ['All', 'ISO 14064-2', 'Verra VCS', 'Gold Standard']
const VINTAGES = ['All', '2024', '2023']
const PROJECT_TYPES = ['All', 'Vessel Efficiency', 'Modal Shift', 'Construction Avoidance']
const CO_BENEFITS = ['Air Quality', 'Noise Reduction', 'Congestion Relief', 'Health Benefits', 'Biodiversity', 'Water Quality', 'Climate Resilience', 'Economic Access', 'Tourism']

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const Tab = ({ label, active, onClick }: TabProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bloomberg-nav-item transition-all duration-200 border-b-2 ${
      active ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
)

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AnalysePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [commentary, setCommentary] = useState<MarketCommentary | null>(null)
  const [commentaryLoading, setCommentaryLoading] = useState(false)

  // Carbon credit filters
  const [filterStandard, setFilterStandard] = useState('All')
  const [filterVintage, setFilterVintage] = useState('All')
  const [filterProjectType, setFilterProjectType] = useState('All')
  const [filterCoBenefits, setFilterCoBenefits] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Chart state (integrated into Market Overview)
  const [chartInstrument, setChartInstrument] = useState('ESC')
  const [chartRange, setChartRange] = useState<TimeRange>('3M')
  const [showHistoricalForecasts, setShowHistoricalForecasts] = useState(false)
  const chartData = useCombinedChartData(chartInstrument, TIME_RANGE_DAYS[chartRange])

  const tabs = [
    { id: 'overview', label: 'Market Overview' },
    { id: 'carbon', label: 'Carbon Credits' },
    { id: 'calculator', label: 'Investment Calculator' },
    { id: 'scenarios', label: 'Market Scenarios' },
  ]

  const loadCommentary = useCallback(async () => {
    setCommentaryLoading(true)
    try {
      const res = await fetch('/api/market-commentary')
      if (res.ok) {
        const data = await res.json()
        setCommentary(data)
      }
    } catch {
      // Silently fail — commentary is non-critical
    } finally {
      setCommentaryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'overview' && !commentary) {
      loadCommentary()
    }
  }, [activeTab, commentary, loadCommentary])

  // Filtered carbon credits
  const filteredCredits = DEMO_CARBON_CREDITS.filter(cc => {
    if (filterStandard !== 'All' && cc.standard !== filterStandard) return false
    if (filterVintage !== 'All' && cc.vintage !== filterVintage) return false
    if (filterProjectType !== 'All' && cc.projectType !== filterProjectType) return false
    if (filterCoBenefits.length > 0 && !filterCoBenefits.some(b => cc.coBenefits.includes(b))) return false
    if (searchQuery && !cc.id.toLowerCase().includes(searchQuery.toLowerCase()) && !cc.region.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const toggleCoBenefit = (benefit: string) => {
    setFilterCoBenefits(prev =>
      prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Analysis & Market Intelligence</h1>
              <p className="bloomberg-body-text text-slate-600 mt-1">
                Market overview, carbon credit analysis, and investment modelling tools
              </p>
            </div>
            <div className="bloomberg-section-label">ANA</div>
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
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ============================================================= */}
        {/* MARKET OVERVIEW TAB (A6)                                       */}
        {/* ============================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Certificate & Token Summary */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-5 py-3 border-b border-slate-200">
                <div className="bloomberg-section-label">CERTIFICATE & TOKEN SUMMARY</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-2 bloomberg-small-text text-slate-500 font-medium">TICKER</th>
                      <th className="text-left px-5 py-2 bloomberg-small-text text-slate-500 font-medium">NAME</th>
                      <th className="text-right px-5 py-2 bloomberg-small-text text-slate-500 font-medium">SPOT PRICE</th>
                      <th className="text-right px-5 py-2 bloomberg-small-text text-slate-500 font-medium">CREATION VOLUME</th>
                      <th className="text-left px-5 py-2 bloomberg-small-text text-slate-500 font-medium">SCHEME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSTRUMENT_SUMMARY.map(inst => (
                      <tr key={inst.ticker} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-5 py-2.5 bloomberg-data text-blue-600 font-medium">{inst.ticker}</td>
                        <td className="px-5 py-2.5 bloomberg-body-text text-slate-800">{inst.name}</td>
                        <td className="px-5 py-2.5 text-right bloomberg-data text-slate-800">A${inst.spot.toFixed(2)}</td>
                        <td className="px-5 py-2.5 text-right bloomberg-data text-slate-600">{inst.volume}</td>
                        <td className="px-5 py-2.5 bloomberg-small-text text-slate-500">{inst.scheme}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Chart — integrated into Market Overview */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="bloomberg-section-label">PRICE CHART</div>
                  <InstrumentSelector
                    instruments={[...CHART_INSTRUMENTS]}
                    selected={chartInstrument}
                    onChange={setChartInstrument}
                  />
                  <TimeRangeSelector
                    selected={chartRange}
                    onChange={setChartRange}
                  />
                  <label className="flex items-center gap-1.5 bloomberg-small-text text-slate-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showHistoricalForecasts}
                      onChange={e => setShowHistoricalForecasts(e.target.checked)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                    Historical Forecasts
                  </label>
                </div>
                {chartData.meta && (
                  <SpotPriceHeader
                    instrument={chartData.meta.instrument}
                    spotPrice={chartData.meta.currentSpot}
                    change={chartData.meta.priceChange24h}
                    changePct={chartData.meta.priceChangePct}
                    currency={chartData.meta.currency}
                  />
                )}
              </div>
              {chartData.loading ? (
                <div className="p-8 flex items-center justify-center" style={{ height: 380 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="bloomberg-body-text text-slate-500">Loading chart data...</span>
                  </div>
                </div>
              ) : (
                <PriceVolumeChart
                  data={chartData.series}
                  instrument={chartInstrument}
                  currency={chartData.meta?.currency}
                  height={380}
                  showForecast={true}
                  showVolume={true}
                  showHistoricalForecasts={showHistoricalForecasts}
                />
              )}
            </div>

            {/* Market References + Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="bloomberg-section-label mb-3">VCM MARKET</div>
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
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="bloomberg-section-label mb-3">ESC MARKET</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">ESC Spot</span>
                    <span className="bloomberg-data text-green-600">A${PRICING_INDEX.ESC_SPOT_REFERENCE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">ESC Forward</span>
                    <span className="bloomberg-data text-blue-600">A${PRICING_INDEX.ESC_FORWARD_REFERENCE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">dMRV Premium</span>
                    <span className="bloomberg-data text-amber-600">+{((PRICING_INDEX.DMRV_PREMIUM_BENCHMARK - 1) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="bloomberg-section-label mb-3">WREI TOKENS</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">WREI-CC Anchor</span>
                    <span className="bloomberg-data text-green-600">A$150.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">WREI-ACO NAV</span>
                    <span className="bloomberg-data text-blue-600">A$1,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">ACO Yield</span>
                    <span className="bloomberg-data text-green-600">28.3% p.a.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Market Commentary */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bloomberg-section-label">AI MARKET COMMENTARY</div>
                  {commentary && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      commentary.source === 'ai' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {commentary.source === 'ai' ? 'Claude Sonnet 4' : 'Fallback'}
                    </span>
                  )}
                </div>
                <button
                  onClick={loadCommentary}
                  disabled={commentaryLoading}
                  className="bloomberg-small-text text-blue-600 hover:text-blue-800 disabled:text-slate-400"
                >
                  {commentaryLoading ? 'Generating…' : 'Refresh'}
                </button>
              </div>
              <div className="p-5">
                {commentaryLoading && !commentary ? (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="bloomberg-body-text text-slate-500">Generating AI market analysis…</span>
                  </div>
                ) : commentary ? (
                  <div>
                    <div className="bloomberg-body-text text-slate-700 whitespace-pre-line leading-relaxed">
                      {commentary.commentary}
                    </div>
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      {commentary.topics.map(topic => (
                        <span key={topic} className="bloomberg-small-text bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {topic}
                        </span>
                      ))}
                      <span className="bloomberg-small-text text-slate-400 ml-auto">
                        {new Date(commentary.generatedAt).toLocaleString('en-AU')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="bloomberg-body-text text-slate-500 py-4 text-center">
                    AI commentary unavailable. Click Refresh to retry.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* CARBON CREDITS TAB (P3.3.1)                                    */}
        {/* ============================================================= */}
        {activeTab === 'carbon' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="bloomberg-section-label mb-3">FILTER & SEARCH</div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="bloomberg-small-text text-slate-500 block mb-1">Standard</label>
                  <select
                    value={filterStandard}
                    onChange={e => setFilterStandard(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bloomberg-body-text text-sm"
                  >
                    {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="bloomberg-small-text text-slate-500 block mb-1">Vintage</label>
                  <select
                    value={filterVintage}
                    onChange={e => setFilterVintage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bloomberg-body-text text-sm"
                  >
                    {VINTAGES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="bloomberg-small-text text-slate-500 block mb-1">Project Type</label>
                  <select
                    value={filterProjectType}
                    onChange={e => setFilterProjectType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bloomberg-body-text text-sm"
                  >
                    {PROJECT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="bloomberg-small-text text-slate-500 block mb-1">Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Credit ID or region…"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bloomberg-body-text text-sm"
                  />
                </div>
              </div>
              {/* Co-benefits filter chips */}
              <div>
                <label className="bloomberg-small-text text-slate-500 block mb-2">Co-benefits</label>
                <div className="flex flex-wrap gap-2">
                  {CO_BENEFITS.map(benefit => (
                    <button
                      key={benefit}
                      onClick={() => toggleCoBenefit(benefit)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        filterCoBenefits.includes(benefit)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {benefit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between">
              <span className="bloomberg-small-text text-slate-500">
                {filteredCredits.length} of {DEMO_CARBON_CREDITS.length} credits
              </span>
              <span className="bloomberg-small-text text-slate-400">
                WREI-verified dMRV carbon credits
              </span>
            </div>

            {/* Credit cards */}
            <div className="grid gap-3">
              {filteredCredits.map(cc => (
                <div key={cc.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bloomberg-data text-blue-600 font-medium">{cc.id}</span>
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">{cc.standard}</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{cc.vintage}</span>
                      </div>
                      <div className="flex items-center gap-6 mb-2">
                        <span className="bloomberg-body-text text-slate-700">{cc.projectType}</span>
                        <span className="bloomberg-small-text text-slate-500">{cc.region}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cc.coBenefits.map(b => (
                          <span key={b} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">{b}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-6 flex-shrink-0">
                      <div className="bloomberg-data text-green-600 text-lg">A${cc.pricePerTonne}</div>
                      <div className="bloomberg-small-text text-slate-500">/tCO2e</div>
                      <div className="bloomberg-small-text text-slate-500 mt-1">{cc.available.toLocaleString()} avail.</div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <div className="w-12 h-1.5 bg-slate-200 rounded">
                          <div className="h-full bg-green-500 rounded" style={{ width: `${cc.verificationScore}%` }} />
                        </div>
                        <span className="bloomberg-small-text text-green-600">{cc.verificationScore}</span>
                      </div>
                      <Link
                        href="/trade"
                        className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        Negotiate
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCredits.length === 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                  <p className="bloomberg-body-text text-slate-500">No credits match your filters. Try adjusting your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* CALCULATOR TAB (existing)                                      */}
        {/* ============================================================= */}
        {activeTab === 'calculator' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="bloomberg-card-title text-slate-800 mb-4">Investment Calculator</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="bloomberg-section-label block mb-2">INVESTMENT AMOUNT</label>
                  <input
                    type="text"
                    placeholder="A$100,000"
                    className="w-full px-3 py-2 border border-slate-300 rounded bloomberg-data"
                  />
                </div>
                <div>
                  <label className="bloomberg-section-label block mb-2">TIME HORIZON</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded bloomberg-body-text">
                    <option>12 months</option>
                    <option>24 months</option>
                    <option>36 months</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="bloomberg-large-metric text-green-600">A$127,500</div>
                    <div className="bloomberg-small-text text-slate-500">PROJECTED VALUE</div>
                  </div>
                  <div>
                    <div className="bloomberg-large-metric text-blue-600">18.2%</div>
                    <div className="bloomberg-small-text text-slate-500">EXPECTED RETURN</div>
                  </div>
                  <div>
                    <div className="bloomberg-large-metric text-slate-600">2.1</div>
                    <div className="bloomberg-small-text text-slate-500">RISK RATIO</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/negotiate"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded bloomberg-body-text hover:bg-blue-700"
                >
                  Begin Negotiation
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* SCENARIOS TAB (existing)                                       */}
        {/* ============================================================= */}
        {activeTab === 'scenarios' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="bloomberg-card-title text-slate-800 mb-4">Market Scenarios</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'DeFi Integration', rows: [{ l: 'Yield Potential', v: '+24.5%', c: 'text-green-600' }, { l: 'Liquidity Risk', v: 'Medium', c: 'text-amber-600' }, { l: 'Time to Market', v: 'Q2 2026', c: 'text-slate-600' }] },
                { title: 'ESG Mandates', rows: [{ l: 'Market Demand', v: '+156%', c: 'text-green-600' }, { l: 'Price Premium', v: '+78%', c: 'text-green-600' }, { l: 'Regulatory Risk', v: 'Low', c: 'text-green-600' }] },
                { title: 'Infrastructure Focus', rows: [{ l: 'Capital Requirements', v: 'A$500M+', c: 'text-slate-600' }, { l: 'IRR Target', v: '12-15%', c: 'text-blue-600' }, { l: 'Hold Period', v: '7-10 years', c: 'text-slate-600' }] },
                { title: 'Sovereign Wealth', rows: [{ l: 'Allocation Target', v: '2-5%', c: 'text-slate-600' }, { l: 'Minimum Ticket', v: 'A$100M', c: 'text-slate-600' }, { l: 'Due Diligence', v: '9-12 months', c: 'text-amber-600' }] },
              ].map(scenario => (
                <div key={scenario.title} className="p-4 border border-slate-200 rounded">
                  <h3 className="bloomberg-card-title text-slate-800 mb-3">{scenario.title}</h3>
                  <div className="space-y-2">
                    {scenario.rows.map(row => (
                      <div key={row.l} className="flex justify-between">
                        <span className="bloomberg-body-text text-slate-600">{row.l}</span>
                        <span className={`bloomberg-data ${row.c}`}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
