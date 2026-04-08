'use client'

import { FC } from 'react'
import ForecastPanel from '@shared/components/intelligence/ForecastPanel'
import SupplyDemandPanel from '@shared/components/intelligence/SupplyDemandPanel'
import AlertsFeed from '@shared/components/intelligence/AlertsFeed'

const IntelligencePage: FC = () => {
  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">MKT</span>
          <h1 className="bloomberg-page-heading text-slate-900">Market Intelligence</h1>
        </div>
        <p className="bloomberg-body-text text-slate-500">
          ESC price forecasts, supply/demand analysis, and market alerts — shared from WREI market data pipeline.
        </p>
      </div>

      <div className="space-y-4">
        {/* Shared ForecastPanel — fetches from /api/v1/intelligence/forecast */}
        <ForecastPanel />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Shared SupplyDemandPanel — fetches from /api/v1/intelligence/metrics */}
          <SupplyDemandPanel />

          {/* Shared AlertsFeed — fetches from /api/v1/intelligence/alerts */}
          <AlertsFeed />
        </div>
      </div>
    </div>
  )
}

export default IntelligencePage
