'use client'

import { FC } from 'react'
import Link from 'next/link'

const SUMMARY_CARDS = [
  {
    title: 'Pipeline',
    icon: 'PIP',
    href: '/pipeline',
    stats: [
      { label: 'Active Projects', value: '—' },
      { label: 'Est. Value', value: '—' },
    ],
    description: 'Total projects, estimated value, stage distribution',
  },
  {
    title: 'Compliance',
    icon: 'CMP',
    href: '/portfolio',
    stats: [
      { label: 'Entities', value: '—' },
      { label: 'Shortfall', value: '—' },
    ],
    description: 'Total entities, shortfall, next deadline',
  },
  {
    title: 'Market',
    icon: 'MKT',
    href: '/intelligence',
    stats: [
      { label: 'ESC Spot', value: '—' },
      { label: 'Forecast', value: '—' },
    ],
    description: 'Current spot, 4-week forecast direction, regime',
  },
  {
    title: 'Recent Activity',
    icon: 'ORG',
    href: '/diagnostic',
    stats: [
      { label: 'Assessments', value: '—' },
      { label: 'Last 7 Days', value: '—' },
    ],
    description: 'Last 5 diagnostic assessments',
  },
]

const EnterpriseDashboard: FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="bloomberg-page-heading text-slate-900">Enterprise Dashboard</h1>
        <p className="bloomberg-body-text text-slate-500 mt-1">
          Downer Environmental Certificate Intelligence Platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUMMARY_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white border border-slate-200 rounded p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-1.5 py-0.5 rounded">
                {card.icon}
              </span>
              <span className="bloomberg-card-title text-slate-900">{card.title}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {card.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="bloomberg-section-label text-slate-400">{stat.label}</div>
                  <div className="bloomberg-metric-value text-slate-900">{stat.value}</div>
                </div>
              ))}
            </div>
            <p className="bloomberg-small-text text-slate-400">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="bloomberg-body-text text-blue-800">
          Data will populate once the enterprise database is connected. Dashboard cards link to
          Origination (diagnostic + attribution), Pipeline, Intelligence, and Compliance pages.
        </p>
      </div>
    </div>
  )
}

export default EnterpriseDashboard
