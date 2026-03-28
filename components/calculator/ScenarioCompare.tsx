'use client'

import React, { useState, useMemo, useCallback } from 'react'
import type { WREITokenType } from '@/lib/types'
import {
  calculateInvestment,
  validateCalculatorInputs,
  getDefaultInputs,
  INVESTMENT_PROFILES,
  CALCULATOR_BOUNDS,
  TOKEN_TYPE_LABELS,
  createScenarioComparison,
  compareScenarios,
  formatCurrency,
  formatPercentage,
  formatYears,
  formatMultiple,
  type CalculatorInputs,
  type ScenarioComparison,
  type RiskToleranceLevel,
} from '@/lib/investment-calculator'

// =============================================================================
// SCENARIO COMPARE COMPONENT
// =============================================================================

const MAX_SCENARIOS = 3

const SCENARIO_COLOURS = ['#0EA5E9', '#10B981', '#F59E0B'] as const
const SCENARIO_BG_COLOURS = ['bg-sky-50', 'bg-emerald-50', 'bg-amber-50'] as const
const SCENARIO_BORDER_COLOURS = ['border-[#0EA5E9]', 'border-[#10B981]', 'border-[#F59E0B]'] as const

export default function ScenarioCompare() {
  const [scenarios, setScenarios] = useState<ScenarioComparison[]>(() => {
    // Initialise with three default scenarios
    const defaults = getDefaultInputs()
    return [
      createScenarioComparison('scenario-1', 'Conservative', {
        ...defaults,
        ...INVESTMENT_PROFILES.conservative.inputs,
      } as CalculatorInputs),
      createScenarioComparison('scenario-2', 'Moderate', {
        ...defaults,
        ...INVESTMENT_PROFILES.moderate.inputs,
      } as CalculatorInputs),
      createScenarioComparison('scenario-3', 'Aggressive', {
        ...defaults,
        ...INVESTMENT_PROFILES.aggressive.inputs,
      } as CalculatorInputs),
    ]
  })

  const comparison = useMemo(() => compareScenarios(scenarios), [scenarios])

  const updateScenarioInput = useCallback((
    index: number,
    field: keyof CalculatorInputs,
    value: CalculatorInputs[keyof CalculatorInputs]
  ) => {
    setScenarios(prev => {
      const updated = [...prev]
      const newInputs = { ...updated[index].inputs, [field]: value }
      const errors = validateCalculatorInputs(newInputs)
      if (errors.length === 0) {
        try {
          updated[index] = createScenarioComparison(
            updated[index].id,
            updated[index].label,
            newInputs
          )
        } catch {
          // keep existing if calculation fails
        }
      }
      return updated
    })
  }, [])

  const updateScenarioLabel = useCallback((index: number, label: string) => {
    setScenarios(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], label }
      return updated
    })
  }, [])

  const resetToPresets = useCallback(() => {
    const defaults = getDefaultInputs()
    setScenarios([
      createScenarioComparison('scenario-1', 'Conservative', {
        ...defaults,
        ...INVESTMENT_PROFILES.conservative.inputs,
      } as CalculatorInputs),
      createScenarioComparison('scenario-2', 'Moderate', {
        ...defaults,
        ...INVESTMENT_PROFILES.moderate.inputs,
      } as CalculatorInputs),
      createScenarioComparison('scenario-3', 'Aggressive', {
        ...defaults,
        ...INVESTMENT_PROFILES.aggressive.inputs,
      } as CalculatorInputs),
    ])
  }, [])

  return (
    <div className="space-y-6" data-testid="scenario-compare">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="bloomberg-card-title text-[#1E293B]">Scenario Comparison</h3>
          <p className="bloomberg-small-text text-[#64748B]">Compare up to {MAX_SCENARIOS} investment scenarios side-by-side</p>
        </div>
        <button
          onClick={resetToPresets}
          className="px-4 py-2 bloomberg-small-text font-medium text-[#0EA5E9] border border-[#0EA5E9] rounded-lg hover:bg-sky-50 transition-colors"
          data-testid="reset-scenarios"
        >
          Reset to Presets
        </button>
      </div>

      {/* Scenario Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario, index) => (
          <div
            key={scenario.id}
            className={`rounded-xl border-2 ${SCENARIO_BORDER_COLOURS[index]} ${SCENARIO_BG_COLOURS[index]} p-4`}
            data-testid={`scenario-card-${index}`}
          >
            {/* Editable label */}
            <input
              type="text"
              value={scenario.label}
              onChange={e => updateScenarioLabel(index, e.target.value)}
              className="w-full bloomberg-small-text  text-[#1E293B] bg-transparent border-b border-slate-300 focus:outline-none focus:border-[#0EA5E9] mb-3 pb-1"
              data-testid={`scenario-label-${index}`}
            />

            {/* Key parameters */}
            <div className="space-y-3">
              <ScenarioSlider
                label="Investment"
                value={scenario.inputs.investmentAmount}
                min={CALCULATOR_BOUNDS.investmentAmount.min}
                max={50_000_000}
                step={100_000}
                format={formatCurrency}
                onChange={v => updateScenarioInput(index, 'investmentAmount', v)}
                testId={`scenario-${index}-investment`}
              />
              <ScenarioSlider
                label="Horizon"
                value={scenario.inputs.timeHorizon}
                min={CALCULATOR_BOUNDS.timeHorizon.min}
                max={CALCULATOR_BOUNDS.timeHorizon.max}
                step={1}
                format={v => `${v} years`}
                onChange={v => updateScenarioInput(index, 'timeHorizon', v)}
                testId={`scenario-${index}-horizon`}
              />
              <div>
                <label className="block bloomberg-section-label text-[#64748B] mb-1">Token Type</label>
                <select
                  value={scenario.inputs.tokenType}
                  onChange={e => updateScenarioInput(index, 'tokenType', e.target.value as WREITokenType)}
                  className="w-full px-2 py-1.5 rounded bloomberg-section-label border border-slate-300 bg-white text-[#1E293B]"
                  data-testid={`scenario-${index}-token`}
                >
                  {(Object.entries(TOKEN_TYPE_LABELS) as [WREITokenType, string][]).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block bloomberg-section-label text-[#64748B] mb-1">Risk</label>
                <div className="flex gap-1">
                  {(['conservative', 'moderate', 'aggressive'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => updateScenarioInput(index, 'riskTolerance', level)}
                      className={`flex-1 py-1 bloomberg-section-label rounded capitalize transition-all ${
                        scenario.inputs.riskTolerance === level
                          ? 'bg-[#1B2A4A] text-white'
                          : 'bg-white text-[#64748B] border border-slate-200'
                      }`}
                      data-testid={`scenario-${index}-risk-${level}`}
                    >
                      {level.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
              <ScenarioSlider
                label="Exit Multiple"
                value={scenario.inputs.exitMultiple}
                min={CALCULATOR_BOUNDS.exitMultiple.min}
                max={CALCULATOR_BOUNDS.exitMultiple.max}
                step={0.1}
                format={v => `${v.toFixed(1)}x`}
                onChange={v => updateScenarioInput(index, 'exitMultiple', v)}
                testId={`scenario-${index}-exit`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" data-testid="comparison-table">
        <div className="overflow-x-auto">
          <table className="w-full bloomberg-small-text">
            <thead>
              <tr className="bg-[#1B2A4A]">
                <th className="text-left py-3 px-4 text-white font-medium">Metric</th>
                {scenarios.map((s, i) => (
                  <th key={s.id} className="text-right py-3 px-4 text-white font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: SCENARIO_COLOURS[i] }}
                      />
                      {s.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="IRR"
                values={scenarios.map(s => formatPercentage(s.results.irr))}
                bestId={comparison.bestIRR}
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="NPV"
                values={scenarios.map(s => formatCurrency(s.results.npv))}
                bestId={comparison.bestNPV}
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="Cash-on-Cash"
                values={scenarios.map(s => formatMultiple(s.results.cashOnCash))}
                bestId=""
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="Payback Period"
                values={scenarios.map(s => formatYears(s.results.paybackPeriod))}
                bestId={comparison.quickestPayback}
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="Total Return"
                values={scenarios.map(s => formatPercentage(s.results.totalReturn))}
                bestId=""
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="Annualised Return"
                values={scenarios.map(s => formatPercentage(s.results.annualisedReturn))}
                bestId=""
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="End Value (Nominal)"
                values={scenarios.map(s => formatCurrency(s.results.nominalEndValue))}
                bestId=""
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="End Value (Real)"
                values={scenarios.map(s => formatCurrency(s.results.realEndValue))}
                bestId=""
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="Volatility"
                values={scenarios.map(s => formatPercentage(s.results.riskMetrics.volatility))}
                bestId={comparison.lowestRisk}
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="Sharpe Ratio"
                values={scenarios.map(s => s.results.riskMetrics.sharpeRatio.toFixed(2))}
                bestId=""
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="Max Drawdown"
                values={scenarios.map(s => formatPercentage(s.results.riskMetrics.maxDrawdown))}
                bestId=""
                scenarioIds={scenarios.map(s => s.id)}
              />
              <ComparisonRow
                label="After-Tax Return"
                values={scenarios.map(s => formatPercentage(s.results.afterTaxReturn))}
                bestId=""
                scenarioIds={scenarios.map(s => s.id)}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Best-in-class callouts */}
      {scenarios.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3" data-testid="best-callouts">
          <CalloutCard
            title="Best IRR"
            scenarioLabel={scenarios.find(s => s.id === comparison.bestIRR)?.label || ''}
            colour={SCENARIO_COLOURS[scenarios.findIndex(s => s.id === comparison.bestIRR)]}
          />
          <CalloutCard
            title="Best NPV"
            scenarioLabel={scenarios.find(s => s.id === comparison.bestNPV)?.label || ''}
            colour={SCENARIO_COLOURS[scenarios.findIndex(s => s.id === comparison.bestNPV)]}
          />
          <CalloutCard
            title="Lowest Risk"
            scenarioLabel={scenarios.find(s => s.id === comparison.lowestRisk)?.label || ''}
            colour={SCENARIO_COLOURS[scenarios.findIndex(s => s.id === comparison.lowestRisk)]}
          />
          <CalloutCard
            title="Quickest Payback"
            scenarioLabel={scenarios.find(s => s.id === comparison.quickestPayback)?.label || ''}
            colour={SCENARIO_COLOURS[scenarios.findIndex(s => s.id === comparison.quickestPayback)]}
          />
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="bloomberg-section-label text-[#64748B] leading-relaxed">
          <strong>Important:</strong> Scenario comparisons are for illustrative purposes only. Projections are based
          on model assumptions and do not guarantee future performance. All values in Australian dollars (A$).
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ScenarioSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  testId,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
  testId: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="bloomberg-section-label text-[#64748B]">{label}</label>
        <span className="bloomberg-section-label  text-[#1E293B]">{format(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#1B2A4A] h-1.5"
        data-testid={testId}
      />
    </div>
  )
}

function ComparisonRow({
  label,
  values,
  bestId,
  scenarioIds,
}: {
  label: string
  values: string[]
  bestId: string
  scenarioIds: string[]
}) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50" data-testid={`comparison-row-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <td className="py-2.5 px-4 text-[#1E293B] font-medium">{label}</td>
      {values.map((val, i) => (
        <td
          key={i}
          className={`py-2.5 px-4 text-right ${
            bestId === scenarioIds[i] ? ' text-[#10B981]' : 'text-[#1E293B]'
          }`}
        >
          {val}
          {bestId === scenarioIds[i] && (
            <span className="ml-1 bloomberg-section-label text-[#10B981]" title="Best in class">*</span>
          )}
        </td>
      ))}
    </tr>
  )
}

function CalloutCard({
  title,
  scenarioLabel,
  colour,
}: {
  title: string
  scenarioLabel: string
  colour: string
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <p className="bloomberg-section-label text-[#64748B] uppercase tracking-wide">{title}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colour }} />
        <span className="bloomberg-small-text  text-[#1E293B]">{scenarioLabel}</span>
      </div>
    </div>
  )
}
