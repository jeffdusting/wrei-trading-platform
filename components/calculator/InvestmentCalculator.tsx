'use client'

import React, { useState, useMemo, useCallback } from 'react'
import type { WREITokenType } from '@/lib/types'
import {
  calculateInvestment,
  validateCalculatorInputs,
  getDefaultInputs,
  applyProfile,
  INVESTMENT_PROFILES,
  CALCULATOR_BOUNDS,
  TOKEN_TYPE_LABELS,
  TOKEN_TYPE_DESCRIPTIONS,
  formatCurrency,
  formatPercentage,
  formatYears,
  formatMultiple,
  type CalculatorInputs,
  type CalculatorResults,
  type RiskToleranceLevel,
} from '@/lib/investment-calculator'

// =============================================================================
// INVESTMENT CALCULATOR COMPONENT
// =============================================================================

export default function InvestmentCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(getDefaultInputs())
  const [activeProfile, setActiveProfile] = useState<RiskToleranceLevel | null>('moderate')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Compute results reactively
  const results = useMemo<CalculatorResults | null>(() => {
    const errors = validateCalculatorInputs(inputs)
    if (errors.length > 0) return null
    try {
      return calculateInvestment(inputs)
    } catch {
      return null
    }
  }, [inputs])

  const validationErrors = useMemo(() => validateCalculatorInputs(inputs), [inputs])

  // Input handlers
  const updateInput = useCallback(<K extends keyof CalculatorInputs>(
    field: K,
    value: CalculatorInputs[K]
  ) => {
    setInputs(prev => ({ ...prev, [field]: value }))
    setActiveProfile(null) // clear profile selection on manual change
  }, [])

  const handleProfileSelect = useCallback((profile: RiskToleranceLevel) => {
    setInputs(prev => applyProfile(prev, profile))
    setActiveProfile(profile)
  }, [])

  return (
    <div className="space-y-6">
      {/* Profile Selection */}
      <div data-testid="profile-selector">
        <h3 className="bloomberg-card-title text-[#1E293B] mb-3">Investment Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(INVESTMENT_PROFILES) as [RiskToleranceLevel, typeof INVESTMENT_PROFILES['conservative']][]).map(
            ([key, profile]) => (
              <button
                key={key}
                data-testid={`profile-${key}`}
                onClick={() => handleProfileSelect(key)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  activeProfile === key
                    ? 'border-[#0EA5E9] bg-sky-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className=" text-[#1E293B]">{profile.name}</span>
                  {activeProfile === key && (
                    <span className="text-[#0EA5E9] bloomberg-small-text font-medium">Active</span>
                  )}
                </div>
                <p className="bloomberg-small-text text-[#64748B] leading-snug">{profile.description}</p>
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" data-testid="input-panel">
          <h3 className="bloomberg-card-title text-[#1E293B] mb-4">Investment Parameters</h3>

          {/* Investment Amount */}
          <div className="mb-5">
            <label className="block bloomberg-small-text font-medium text-[#1E293B] mb-1">
              Investment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] bloomberg-small-text">A$</span>
              <input
                type="number"
                data-testid="input-investment-amount"
                value={inputs.investmentAmount}
                onChange={e => updateInput('investmentAmount', Number(e.target.value))}
                min={CALCULATOR_BOUNDS.investmentAmount.min}
                max={CALCULATOR_BOUNDS.investmentAmount.max}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent text-[#1E293B]"
              />
            </div>
            <p className="bloomberg-section-label text-[#64748B] mt-1">{formatCurrency(inputs.investmentAmount)}</p>
          </div>

          {/* Time Horizon */}
          <div className="mb-5">
            <label className="block bloomberg-small-text font-medium text-[#1E293B] mb-1">
              Time Horizon: {inputs.timeHorizon} {inputs.timeHorizon === 1 ? 'year' : 'years'}
            </label>
            <input
              type="range"
              data-testid="input-time-horizon"
              value={inputs.timeHorizon}
              onChange={e => updateInput('timeHorizon', Number(e.target.value))}
              min={CALCULATOR_BOUNDS.timeHorizon.min}
              max={CALCULATOR_BOUNDS.timeHorizon.max}
              step={1}
              className="w-full accent-[#0EA5E9]"
            />
            <div className="flex justify-between bloomberg-section-label text-[#64748B]">
              <span>{CALCULATOR_BOUNDS.timeHorizon.min}yr</span>
              <span>{CALCULATOR_BOUNDS.timeHorizon.max}yr</span>
            </div>
          </div>

          {/* Token Type */}
          <div className="mb-5">
            <label className="block bloomberg-small-text font-medium text-[#1E293B] mb-1">Token Type</label>
            <select
              data-testid="input-token-type"
              value={inputs.tokenType}
              onChange={e => updateInput('tokenType', e.target.value as WREITokenType)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] text-[#1E293B] bg-white"
            >
              {(Object.entries(TOKEN_TYPE_LABELS) as [WREITokenType, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className="bloomberg-section-label text-[#64748B] mt-1">
              {TOKEN_TYPE_DESCRIPTIONS[inputs.tokenType]}
            </p>
          </div>

          {/* Risk Tolerance */}
          <div className="mb-5">
            <label className="block bloomberg-small-text font-medium text-[#1E293B] mb-1">Risk Tolerance</label>
            <div className="grid grid-cols-3 gap-2">
              {(['conservative', 'moderate', 'aggressive'] as const).map(level => (
                <button
                  key={level}
                  data-testid={`risk-${level}`}
                  onClick={() => updateInput('riskTolerance', level)}
                  className={`py-2 px-3 rounded-lg bloomberg-small-text font-medium capitalize transition-all ${
                    inputs.riskTolerance === level
                      ? level === 'conservative'
                        ? 'bg-[#10B981] text-white'
                        : level === 'moderate'
                          ? 'bg-[#0EA5E9] text-white'
                          : 'bg-[#F59E0B] text-white'
                      : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Parameters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[#0EA5E9] bloomberg-small-text font-medium mb-4 flex items-center gap-1"
            data-testid="toggle-advanced"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showAdvanced ? 'Hide' : 'Show'} Advanced Parameters
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-t border-slate-200 pt-4" data-testid="advanced-params">
              {/* Discount Rate */}
              <div>
                <label className="block bloomberg-small-text font-medium text-[#1E293B] mb-1">
                  Discount Rate: {(inputs.discountRate * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  data-testid="input-discount-rate"
                  value={inputs.discountRate}
                  onChange={e => updateInput('discountRate', Number(e.target.value))}
                  min={CALCULATOR_BOUNDS.discountRate.min}
                  max={CALCULATOR_BOUNDS.discountRate.max}
                  step={0.005}
                  className="w-full accent-[#0EA5E9]"
                />
              </div>

              {/* Tax Rate */}
              <div>
                <label className="block bloomberg-small-text font-medium text-[#1E293B] mb-1">
                  Tax Rate: {(inputs.taxRate * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  data-testid="input-tax-rate"
                  value={inputs.taxRate}
                  onChange={e => updateInput('taxRate', Number(e.target.value))}
                  min={CALCULATOR_BOUNDS.taxRate.min}
                  max={CALCULATOR_BOUNDS.taxRate.max}
                  step={0.01}
                  className="w-full accent-[#0EA5E9]"
                />
              </div>

              {/* Inflation Rate */}
              <div>
                <label className="block bloomberg-small-text font-medium text-[#1E293B] mb-1">
                  Inflation Rate: {(inputs.inflationRate * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  data-testid="input-inflation-rate"
                  value={inputs.inflationRate}
                  onChange={e => updateInput('inflationRate', Number(e.target.value))}
                  min={CALCULATOR_BOUNDS.inflationRate.min}
                  max={CALCULATOR_BOUNDS.inflationRate.max}
                  step={0.005}
                  className="w-full accent-[#0EA5E9]"
                />
              </div>

              {/* Exit Multiple */}
              <div>
                <label className="block bloomberg-small-text font-medium text-[#1E293B] mb-1">
                  Exit Multiple: {inputs.exitMultiple.toFixed(1)}x
                </label>
                <input
                  type="range"
                  data-testid="input-exit-multiple"
                  value={inputs.exitMultiple}
                  onChange={e => updateInput('exitMultiple', Number(e.target.value))}
                  min={CALCULATOR_BOUNDS.exitMultiple.min}
                  max={CALCULATOR_BOUNDS.exitMultiple.max}
                  step={0.1}
                  className="w-full accent-[#0EA5E9]"
                />
              </div>
            </div>
          )}

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" data-testid="validation-errors">
              {validationErrors.map((err, i) => (
                <p key={i} className="bloomberg-small-text text-[#EF4444]">{err.message}</p>
              ))}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" data-testid="results-panel">
          <h3 className="bloomberg-card-title text-[#1E293B] mb-4">Investment Projections</h3>

          {results ? (
            <div className="space-y-6">
              {/* Primary Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  label="IRR"
                  value={formatPercentage(results.irr)}
                  description="Internal Rate of Return"
                  colour={results.irr > 0.1 ? 'green' : results.irr > 0.05 ? 'blue' : 'amber'}
                />
                <MetricCard
                  label="NPV"
                  value={formatCurrency(results.npv)}
                  description="Net Present Value"
                  colour={results.npv > 0 ? 'green' : 'red'}
                />
                <MetricCard
                  label="Cash-on-Cash"
                  value={formatMultiple(results.cashOnCash)}
                  description="Distribution return multiple"
                  colour="blue"
                />
                <MetricCard
                  label="Payback Period"
                  value={formatYears(results.paybackPeriod)}
                  description="Time to recover investment"
                  colour={results.paybackPeriod < 5 ? 'green' : 'amber'}
                />
                <MetricCard
                  label="Total Return"
                  value={formatPercentage(results.totalReturn)}
                  description="Over holding period"
                  colour={results.totalReturn > 0.5 ? 'green' : 'blue'}
                />
                <MetricCard
                  label="Annualised Return"
                  value={formatPercentage(results.annualisedReturn)}
                  description="Compound annual growth"
                  colour={results.annualisedReturn > 0.1 ? 'green' : 'blue'}
                />
              </div>

              {/* Value Summary */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className=" text-[#1E293B] bloomberg-small-text mb-3">Value Summary</h4>
                <div className="space-y-2">
                  <SummaryRow label="Initial Investment" value={formatCurrency(inputs.investmentAmount)} />
                  <SummaryRow label="Total Distributions" value={formatCurrency(results.totalDistributions)} />
                  <SummaryRow label="Estimated End Value (Nominal)" value={formatCurrency(results.nominalEndValue)} />
                  <SummaryRow label="Estimated End Value (Real)" value={formatCurrency(results.realEndValue)} />
                  <SummaryRow label="Estimated Tax Paid" value={formatCurrency(results.totalTaxPaid)} />
                  <SummaryRow
                    label="After-Tax Return"
                    value={formatPercentage(results.afterTaxReturn)}
                    highlight
                  />
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className=" text-[#1E293B] bloomberg-small-text mb-3">Risk Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric label="Volatility" value={formatPercentage(results.riskMetrics.volatility)} />
                  <MiniMetric label="Sharpe Ratio" value={results.riskMetrics.sharpeRatio.toFixed(2)} />
                  <MiniMetric label="Max Drawdown" value={formatPercentage(results.riskMetrics.maxDrawdown)} />
                  <MiniMetric label="Probability of Loss" value={formatPercentage(results.riskMetrics.probabilityOfLoss)} />
                  <MiniMetric label="Risk-Adjusted Return" value={formatPercentage(results.riskAdjustedReturn)} />
                </div>
              </div>

              {/* Cash Flow Projection Table */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className=" text-[#1E293B] bloomberg-small-text mb-3">Cash Flow Projection</h4>
                <div className="overflow-x-auto">
                  <table className="w-full bloomberg-small-text" data-testid="cashflow-table">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 text-[#64748B] font-medium">Year</th>
                        <th className="text-right py-2 text-[#64748B] font-medium">Distribution</th>
                        <th className="text-right py-2 text-[#64748B] font-medium">Portfolio Value</th>
                        <th className="text-right py-2 text-[#64748B] font-medium">Net Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.cashFlowProjection.map(row => (
                        <tr key={row.year} className="border-b border-slate-100">
                          <td className="py-1.5 text-[#1E293B]">{row.year}</td>
                          <td className="py-1.5 text-right text-[#1E293B]">
                            {row.year === 0 ? '-' : formatCurrency(row.annualDistribution)}
                          </td>
                          <td className="py-1.5 text-right text-[#1E293B]">
                            {formatCurrency(row.portfolioValue)}
                          </td>
                          <td className={`py-1.5 text-right font-medium ${
                            row.netPosition >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                          }`}>
                            {formatCurrency(row.netPosition)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-[#64748B]" data-testid="no-results">
              <div className="text-center">
                <p className="bloomberg-card-title font-medium">Adjust parameters to see projections</p>
                <p className="bloomberg-small-text mt-1">Please correct any validation errors above</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="bloomberg-section-label text-[#64748B] leading-relaxed">
          <strong>Important Disclaimer:</strong> These projections are for illustrative purposes only and do not
          constitute financial advice. Past performance is not indicative of future results. Actual returns may vary
          significantly from projections. All calculations are based on WREI model assumptions and are subject to
          market, regulatory, and operational risks. Consult a licensed financial adviser before making investment
          decisions. All amounts in Australian dollars (A$). Tax calculations are simplified and may not reflect
          your individual circumstances.
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function MetricCard({
  label,
  value,
  description,
  colour,
}: {
  label: string
  value: string
  description: string
  colour: 'green' | 'blue' | 'amber' | 'red'
}) {
  const colourMap = {
    green: 'border-[#10B981] bg-emerald-50',
    blue: 'border-[#0EA5E9] bg-sky-50',
    amber: 'border-[#F59E0B] bg-amber-50',
    red: 'border-[#EF4444] bg-red-50',
  }

  return (
    <div className={`p-3 rounded-lg border ${colourMap[colour]}`} data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="bloomberg-section-label text-[#64748B] font-medium uppercase tracking-wide">{label}</p>
      <p className="bloomberg-metric-value text-[#1E293B] mt-1">{value}</p>
      <p className="bloomberg-section-label text-[#64748B] mt-0.5">{description}</p>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`flex justify-between items-center py-1 ${highlight ? ' text-[#1E293B]' : 'text-[#64748B]'}`}>
      <span className="bloomberg-small-text">{label}</span>
      <span className={`bloomberg-small-text ${highlight ? 'text-[#10B981]' : 'text-[#1E293B]'}`}>{value}</span>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 px-2 bg-slate-50 rounded">
      <span className="bloomberg-section-label text-[#64748B]">{label}</span>
      <span className="bloomberg-section-label  text-[#1E293B]">{value}</span>
    </div>
  )
}
