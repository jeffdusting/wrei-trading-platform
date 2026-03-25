'use client'

import React, { useState } from 'react'
import InvestmentCalculator from '@/components/calculator/InvestmentCalculator'
import ScenarioCompare from '@/components/calculator/ScenarioCompare'

type TabKey = 'calculator' | 'compare'

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('calculator')

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Page Header */}
      <div className="bg-[#1B2A4A] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">WREI Investment Calculator</h1>
          <p className="text-slate-300 mt-1">
            Model returns across carbon credit and infrastructure-backed token investments
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'calculator'
                ? 'border-[#0EA5E9] text-[#0EA5E9]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
            data-testid="tab-calculator"
          >
            Investment Calculator
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'compare'
                ? 'border-[#0EA5E9] text-[#0EA5E9]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
            data-testid="tab-compare"
          >
            Scenario Comparison
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calculator' && <InvestmentCalculator />}
        {activeTab === 'compare' && <ScenarioCompare />}
      </div>
    </div>
  )
}
