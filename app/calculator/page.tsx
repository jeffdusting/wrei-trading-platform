'use client'

import React, { useState } from 'react'
import InvestmentCalculator from '@/components/calculator/InvestmentCalculator'
import ScenarioCompare from '@/components/calculator/ScenarioCompare'

type TabKey = 'calculator' | 'compare'

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('calculator')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Investment Calculator</h1>
              <p className="bloomberg-body-text text-slate-600 mt-1">
                Model returns across carbon credit and infrastructure-backed token investments
              </p>
            </div>
            <div className="bloomberg-section-label">
              CAL
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 bloomberg-nav-item transition-all duration-200 border-b-2 ${
                activeTab === 'calculator'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
              data-testid="tab-calculator"
            >
              Investment Calculator
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-2 bloomberg-nav-item transition-all duration-200 border-b-2 ${
                activeTab === 'compare'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
              data-testid="tab-compare"
            >
              Scenario Comparison
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'calculator' && <InvestmentCalculator />}
        {activeTab === 'compare' && <ScenarioCompare />}
      </div>
    </div>
  )
}
