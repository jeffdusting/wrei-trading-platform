'use client'

import { FC, useState } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'
import ForecastPanel from '@/components/intelligence/ForecastPanel'
import PriceVolumeChart from '@/components/charts/PriceVolumeChart'
import InstrumentSelector from '@/components/charts/InstrumentSelector'
import SpotPriceHeader from '@/components/charts/SpotPriceHeader'
import { useCombinedChartData } from '@/components/charts/hooks/useCombinedChartData'
import { CHART_INSTRUMENTS } from '@/components/charts/types'
import SupplyDemandPanel from '@/components/intelligence/SupplyDemandPanel'
import AlertsFeed from '@/components/intelligence/AlertsFeed'
import BacktestReport from '@/components/intelligence/BacktestReport'
import CounterfactualReport from '@/components/intelligence/CounterfactualReport'
import ForecastPerformance from '@/components/intelligence/ForecastPerformance'

const TABS = [
  { id: 'forecast', label: 'Forecast', icon: 'FCT' },
  { id: 'supply', label: 'Supply & Demand', icon: 'S&D' },
  { id: 'alerts', label: 'Alerts', icon: 'ALT' },
  { id: 'performance', label: 'Performance', icon: 'PRF' },
  { id: 'model', label: 'Model Performance', icon: 'MDL' },
  { id: 'counterfactual', label: 'Trade Analysis', icon: 'CFA' },
] as const

type TabId = (typeof TABS)[number]['id']

const IntelligencePage: FC = () => {
  const tokens = useDesignTokens('retail')
  const [activeTab, setActiveTab] = useState<TabId>('forecast')
  const [forecastInstrument, setForecastInstrument] = useState('ESC')
  const chartData = useCombinedChartData(forecastInstrument, 180)

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Market Intelligence</h1>
          <p className="bloomberg-small-text text-slate-500">
            ESC price forecasting, supply/demand analysis, and continuous monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: tokens.colors.status.online }}
          />
          <span className="bloomberg-small-text text-slate-500">LIVE</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div
        className="flex gap-1 mb-4 border-b"
        style={{ borderColor: tokens.colors.surface.tertiary }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 bloomberg-small-text font-medium transition-colors -mb-px"
            style={{
              borderBottom: activeTab === tab.id ? `2px solid ${tokens.colors.accent.info}` : '2px solid transparent',
              color: activeTab === tab.id ? tokens.colors.accent.info : '#64748B',
            }}
          >
            <span className="bloomberg-data bg-slate-100 px-1 rounded text-[10px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            {/* Instrument selector + spot price */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <InstrumentSelector
                instruments={[...CHART_INSTRUMENTS]}
                selected={forecastInstrument}
                onChange={setForecastInstrument}
              />
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

            {/* Price + volume + forecast chart */}
            {!chartData.loading && chartData.series.length > 0 && (
              <PriceVolumeChart
                data={chartData.series}
                instrument={forecastInstrument}
                currency={chartData.meta?.currency}
                height={350}
                showForecast={true}
                showVolume={true}
              />
            )}

            {/* Existing forecast detail + alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ForecastPanel />
              </div>
              <div>
                <AlertsFeed />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'supply' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SupplyDemandPanel />
            </div>
            <div>
              <AlertsFeed />
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="max-w-3xl">
            <AlertsFeed />
          </div>
        )}

        {activeTab === 'performance' && (
          <ForecastPerformance />
        )}

        {activeTab === 'model' && (
          <BacktestReport />
        )}

        {activeTab === 'counterfactual' && (
          <CounterfactualReport />
        )}
      </div>
    </div>
  )
}

export default IntelligencePage
