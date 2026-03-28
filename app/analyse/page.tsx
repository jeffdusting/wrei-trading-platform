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

export default function AnalysePage() {
  const [activeTab, setActiveTab] = useState('calculator')

  const tabs = [
    { id: 'calculator', label: 'Investment Calculator' },
    { id: 'scenarios', label: 'Market Scenarios' }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Analysis & Modelling</h1>
              <p className="bloomberg-body-text text-slate-600 mt-1">
                Investment analysis and market scenario modelling tools
              </p>
            </div>
            <div className="bloomberg-section-label">
              ANA
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

        {activeTab === 'scenarios' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="bloomberg-card-title text-slate-800 mb-4">Market Scenarios</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border border-slate-200 rounded">
                <h3 className="bloomberg-card-title text-slate-800 mb-3">DeFi Integration</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Yield Potential</span>
                    <span className="bloomberg-data text-green-600">+24.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Liquidity Risk</span>
                    <span className="bloomberg-data text-amber-600">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Time to Market</span>
                    <span className="bloomberg-data text-slate-600">Q2 2026</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded">
                <h3 className="bloomberg-card-title text-slate-800 mb-3">ESG Mandates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Market Demand</span>
                    <span className="bloomberg-data text-green-600">+156%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Price Premium</span>
                    <span className="bloomberg-data text-green-600">+78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Regulatory Risk</span>
                    <span className="bloomberg-data text-green-600">Low</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded">
                <h3 className="bloomberg-card-title text-slate-800 mb-3">Infrastructure Focus</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Capital Requirements</span>
                    <span className="bloomberg-data text-slate-600">A$500M+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">IRR Target</span>
                    <span className="bloomberg-data text-blue-600">12-15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Hold Period</span>
                    <span className="bloomberg-data text-slate-600">7-10 years</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded">
                <h3 className="bloomberg-card-title text-slate-800 mb-3">Sovereign Wealth</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Allocation Target</span>
                    <span className="bloomberg-data text-slate-600">2-5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Minimum Ticket</span>
                    <span className="bloomberg-data text-slate-600">A$100M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="bloomberg-body-text text-slate-600">Due Diligence</span>
                    <span className="bloomberg-data text-amber-600">9-12 months</span>
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