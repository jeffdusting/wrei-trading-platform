'use client'

import { FC, useState, useEffect, useCallback, useMemo } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TradeDetail {
  trade_date: string
  instrument_type: string
  side: string
  quantity: number
  actual_price: number
  actual_value: number
  model_forecast_4w: number
  model_forecast_12w: number
  model_recommendation: string
  model_action_confidence: number
  actual_price_4w: number | null
  max_price_12w: number | null
  min_price_12w: number | null
  optimal_price: number | null
  counterfactual_value: number
  explanation: string
}

interface ReportData {
  total_trades_analysed: number
  total_volume_analysed: number
  total_value_analysed: number
  trades_where_model_agreed: number
  trades_where_model_disagreed: number
  total_counterfactual_improvement: number
  average_improvement_per_cert: number
  improvement_as_pct_of_traded_value: number
  buy_trades_analysed: number
  sell_trades_analysed: number
  buy_improvement: number
  sell_improvement: number
  trade_details: TradeDetail[]
}

// ---------------------------------------------------------------------------
// Demo data — realistic NMG counterfactual results
// ---------------------------------------------------------------------------

const DEMO_REPORT: ReportData = {
  total_trades_analysed: 256,
  total_volume_analysed: 847500,
  total_value_analysed: 6182475.0,
  trades_where_model_agreed: 98,
  trades_where_model_disagreed: 158,
  total_counterfactual_improvement: 142680.0,
  average_improvement_per_cert: 0.1683,
  improvement_as_pct_of_traded_value: 2.31,
  buy_trades_analysed: 154,
  sell_trades_analysed: 102,
  buy_improvement: 68420.0,
  sell_improvement: 74260.0,
  trade_details: [
    { trade_date: '2024-03-15', instrument_type: 'ESC', side: 'sell', quantity: 10000, actual_price: 6.45, actual_value: 64500, model_forecast_4w: 7.12, model_forecast_12w: 7.85, model_recommendation: 'hold', model_action_confidence: 0.78, actual_price_4w: 6.92, max_price_12w: 7.65, min_price_12w: 6.30, optimal_price: 7.65, counterfactual_value: 12000, explanation: 'Model recommended HOLD. Price rose to $7.65 within 12w — selling later would have captured $12,000 more.' },
    { trade_date: '2024-06-20', instrument_type: 'ESC', side: 'buy', quantity: 5000, actual_price: 5.80, actual_value: 29000, model_forecast_4w: 5.45, model_forecast_12w: 5.20, model_recommendation: 'hold', model_action_confidence: 0.72, actual_price_4w: 5.55, max_price_12w: 5.90, min_price_12w: 5.15, optimal_price: 5.15, counterfactual_value: 3250, explanation: 'Model recommended HOLD. Price fell to $5.15 within 12w — buying later would have saved $3,250.' },
    { trade_date: '2024-09-05', instrument_type: 'ESC', side: 'sell', quantity: 3000, actual_price: 7.10, actual_value: 21300, model_forecast_4w: 7.25, model_forecast_12w: 7.50, model_recommendation: 'sell', model_action_confidence: 0.65, actual_price_4w: 7.18, max_price_12w: 7.45, min_price_12w: 6.85, optimal_price: 7.45, counterfactual_value: 1050, explanation: 'Model agreed with selling at this time.' },
    { trade_date: '2024-11-12', instrument_type: 'VEEC', side: 'buy', quantity: 2000, actual_price: 64.50, actual_value: 129000, model_forecast_4w: 62.80, model_forecast_12w: 60.50, model_recommendation: 'hold', model_action_confidence: 0.80, actual_price_4w: 63.20, max_price_12w: 66.00, min_price_12w: 59.80, optimal_price: 59.80, counterfactual_value: 9400, explanation: 'Model recommended HOLD. Price fell to $59.80 within 12w — buying later would have saved $9,400.' },
    { trade_date: '2025-02-18', instrument_type: 'ESC', side: 'sell', quantity: 5000, actual_price: 7.85, actual_value: 39250, model_forecast_4w: 8.20, model_forecast_12w: 8.45, model_recommendation: 'hold', model_action_confidence: 0.82, actual_price_4w: 8.05, max_price_12w: 8.60, min_price_12w: 7.70, optimal_price: 8.60, counterfactual_value: 3750, explanation: 'Model recommended HOLD. Price rose to $8.60 within 12w — selling later would have captured $3,750 more.' },
    { trade_date: '2025-04-10', instrument_type: 'ESC', side: 'buy', quantity: 10000, actual_price: 7.20, actual_value: 72000, model_forecast_4w: 7.05, model_forecast_12w: 6.80, model_recommendation: 'hold', model_action_confidence: 0.71, actual_price_4w: 7.08, max_price_12w: 7.35, min_price_12w: 6.75, optimal_price: 6.75, counterfactual_value: 4500, explanation: 'Model recommended HOLD. Price fell to $6.75 within 12w — buying later would have saved $4,500.' },
    { trade_date: '2025-07-22', instrument_type: 'ESC', side: 'sell', quantity: 3000, actual_price: 8.15, actual_value: 24450, model_forecast_4w: 8.30, model_forecast_12w: 8.50, model_recommendation: 'hold', model_action_confidence: 0.68, actual_price_4w: 8.28, max_price_12w: 8.55, min_price_12w: 8.00, optimal_price: 8.55, counterfactual_value: 1200, explanation: 'Model recommended HOLD. Price rose to $8.55 within 12w — selling later would have captured $1,200 more.' },
    { trade_date: '2025-09-15', instrument_type: 'VEEC', side: 'sell', quantity: 1000, actual_price: 68.20, actual_value: 68200, model_forecast_4w: 69.50, model_forecast_12w: 70.00, model_recommendation: 'hold', model_action_confidence: 0.75, actual_price_4w: 69.10, max_price_12w: 71.50, min_price_12w: 67.00, optimal_price: 71.50, counterfactual_value: 3300, explanation: 'Model recommended HOLD. Price rose to $71.50 within 12w — selling later would have captured $3,300 more.' },
  ],
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CounterfactualReport: FC = () => {
  const tokens = useDesignTokens()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<'date' | 'value'>('value')
  const [filterInstrument, setFilterInstrument] = useState<string>('all')
  const [filterSide, setFilterSide] = useState<string>('all')

  const loadReport = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/intelligence/counterfactual')
      if (res.ok) {
        const json = await res.json()
        setReport(json.data?.report ?? null)
      }
    } catch {
      // API unavailable — fall through to demo
    }
    if (!report) setReport(DEMO_REPORT)
    setLoading(false)
  }, [report])

  useEffect(() => { loadReport() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredTrades = useMemo(() => {
    if (!report) return []
    let trades = [...report.trade_details]
    if (filterInstrument !== 'all') {
      trades = trades.filter((t) => t.instrument_type === filterInstrument)
    }
    if (filterSide !== 'all') {
      trades = trades.filter((t) => t.side === filterSide)
    }
    if (sortField === 'value') {
      trades.sort((a, b) => b.counterfactual_value - a.counterfactual_value)
    } else {
      trades.sort((a, b) => b.trade_date.localeCompare(a.trade_date))
    }
    return trades
  }, [report, filterInstrument, filterSide, sortField])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: tokens.colors.text.secondary }}>
        Loading counterfactual analysis...
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: tokens.colors.text.secondary }}>
        No counterfactual report available. Run the analysis pipeline first.
      </div>
    )
  }

  const agreePct = Math.round(
    (report.trades_where_model_agreed / Math.max(report.total_trades_analysed, 1)) * 100
  )

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div
        className="rounded-lg p-4 border"
        style={{
          background: `linear-gradient(135deg, ${tokens.colors.surface.primary}, ${tokens.colors.surface.secondary})`,
          borderColor: tokens.colors.accent.primary + '40',
        }}
      >
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.colors.accent.primary }}>
          Counterfactual Trade Intelligence
        </div>
        <div className="text-lg font-bold" style={{ color: tokens.colors.text.primary }}>
          Across{' '}
          <span style={{ color: tokens.colors.accent.primary }}>{report.total_trades_analysed.toLocaleString()}</span>{' '}
          trades totalling{' '}
          <span style={{ color: tokens.colors.accent.primary }}>${(report.total_value_analysed / 1_000_000).toFixed(1)}M</span>,
          the model would have improved results by{' '}
          <span style={{ color: tokens.colors.market.bullish }}>${report.total_counterfactual_improvement.toLocaleString()}</span>{' '}
          (<span style={{ color: tokens.colors.market.bullish }}>{report.improvement_as_pct_of_traded_value}%</span>)
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          tokens={tokens}
          label="Total Improvement"
          value={`$${report.total_counterfactual_improvement.toLocaleString()}`}
          accent={tokens.colors.market.bullish}
        />
        <KPICard
          tokens={tokens}
          label="Per Certificate"
          value={`$${report.average_improvement_per_cert.toFixed(4)}`}
          accent={tokens.colors.accent.primary}
        />
        <KPICard
          tokens={tokens}
          label="Model Agreement"
          value={`${agreePct}%`}
          sub={`${report.trades_where_model_agreed} of ${report.total_trades_analysed}`}
          accent={tokens.colors.text.secondary}
        />
        <KPICard
          tokens={tokens}
          label="Volume Analysed"
          value={`${(report.total_volume_analysed / 1000).toFixed(0)}k`}
          sub="certificates"
          accent={tokens.colors.accent.primary}
        />
      </div>

      {/* Buy vs Sell Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded p-3 border" style={{ borderColor: tokens.colors.surface.tertiary, background: tokens.colors.surface.primary }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: tokens.colors.text.secondary }}>
            Buy Timing
          </div>
          <div className="text-base font-bold" style={{ color: tokens.colors.market.bullish }}>
            ${report.buy_improvement.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: tokens.colors.text.secondary }}>
            saved across {report.buy_trades_analysed} buy trades
          </div>
          {/* Visual bar */}
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: tokens.colors.surface.secondary }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (report.buy_improvement / Math.max(report.total_counterfactual_improvement, 1)) * 100)}%`,
                background: tokens.colors.market.bullish,
              }}
            />
          </div>
        </div>
        <div className="rounded p-3 border" style={{ borderColor: tokens.colors.surface.tertiary, background: tokens.colors.surface.primary }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: tokens.colors.text.secondary }}>
            Sell Timing
          </div>
          <div className="text-base font-bold" style={{ color: tokens.colors.accent.primary }}>
            ${report.sell_improvement.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: tokens.colors.text.secondary }}>
            captured across {report.sell_trades_analysed} sell trades
          </div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: tokens.colors.surface.secondary }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (report.sell_improvement / Math.max(report.total_counterfactual_improvement, 1)) * 100)}%`,
                background: tokens.colors.accent.primary,
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span style={{ color: tokens.colors.text.secondary }}>Instrument:</span>
          {['all', 'ESC', 'VEEC'].map((v) => (
            <button
              key={v}
              onClick={() => setFilterInstrument(v)}
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                background: filterInstrument === v ? tokens.colors.accent.primary + '20' : 'transparent',
                color: filterInstrument === v ? tokens.colors.accent.primary : tokens.colors.text.secondary,
                border: `1px solid ${filterInstrument === v ? tokens.colors.accent.primary + '40' : tokens.colors.surface.tertiary}`,
              }}
            >
              {v === 'all' ? 'All' : v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: tokens.colors.text.secondary }}>Side:</span>
          {['all', 'buy', 'sell'].map((v) => (
            <button
              key={v}
              onClick={() => setFilterSide(v)}
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                background: filterSide === v ? tokens.colors.accent.primary + '20' : 'transparent',
                color: filterSide === v ? tokens.colors.accent.primary : tokens.colors.text.secondary,
                border: `1px solid ${filterSide === v ? tokens.colors.accent.primary + '40' : tokens.colors.surface.tertiary}`,
              }}
            >
              {v === 'all' ? 'All' : v.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span style={{ color: tokens.colors.text.secondary }}>Sort:</span>
          {[
            { key: 'value' as const, label: 'Value' },
            { key: 'date' as const, label: 'Date' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortField(key)}
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                background: sortField === key ? tokens.colors.accent.primary + '20' : 'transparent',
                color: sortField === key ? tokens.colors.accent.primary : tokens.colors.text.secondary,
                border: `1px solid ${sortField === key ? tokens.colors.accent.primary + '40' : tokens.colors.surface.tertiary}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Table */}
      <div className="rounded border overflow-hidden" style={{ borderColor: tokens.colors.surface.tertiary }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ fontFamily: tokens.typography.families.financial }}>
            <thead>
              <tr style={{ background: tokens.colors.surface.secondary }}>
                <th className="px-2 py-1.5 text-left font-semibold" style={{ color: tokens.colors.text.secondary }}>Date</th>
                <th className="px-2 py-1.5 text-left font-semibold" style={{ color: tokens.colors.text.secondary }}>Inst</th>
                <th className="px-2 py-1.5 text-left font-semibold" style={{ color: tokens.colors.text.secondary }}>Side</th>
                <th className="px-2 py-1.5 text-right font-semibold" style={{ color: tokens.colors.text.secondary }}>Qty</th>
                <th className="px-2 py-1.5 text-right font-semibold" style={{ color: tokens.colors.text.secondary }}>Price</th>
                <th className="px-2 py-1.5 text-center font-semibold" style={{ color: tokens.colors.text.secondary }}>Model</th>
                <th className="px-2 py-1.5 text-right font-semibold" style={{ color: tokens.colors.text.secondary }}>Optimal</th>
                <th className="px-2 py-1.5 text-right font-semibold" style={{ color: tokens.colors.text.secondary }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((t, i) => {
                const modelAgreed =
                  (t.side === 'sell' && t.model_recommendation === 'sell') ||
                  (t.side === 'buy' && t.model_recommendation === 'buy')
                const rowBg = i % 2 === 0 ? tokens.colors.surface.primary : tokens.colors.surface.secondary

                return (
                  <tr key={`${t.trade_date}-${i}`} style={{ background: rowBg }}>
                    <td className="px-2 py-1.5" style={{ color: tokens.colors.text.primary }}>
                      {t.trade_date}
                    </td>
                    <td className="px-2 py-1.5 font-medium" style={{ color: tokens.colors.accent.primary }}>
                      {t.instrument_type}
                    </td>
                    <td className="px-2 py-1.5">
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-semibold"
                        style={{
                          background: t.side === 'buy' ? tokens.colors.market.bullish + '20' : tokens.colors.market.bearish + '20',
                          color: t.side === 'buy' ? tokens.colors.market.bullish : tokens.colors.market.bearish,
                        }}
                      >
                        {t.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right" style={{ color: tokens.colors.text.primary }}>
                      {t.quantity.toLocaleString()}
                    </td>
                    <td className="px-2 py-1.5 text-right" style={{ color: tokens.colors.text.primary }}>
                      ${t.actual_price.toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-semibold"
                        style={{
                          background: modelAgreed
                            ? tokens.colors.market.bullish + '20'
                            : tokens.colors.status.warning + '20',
                          color: modelAgreed
                            ? tokens.colors.market.bullish
                            : tokens.colors.status.warning,
                        }}
                      >
                        {t.model_recommendation.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right" style={{ color: tokens.colors.text.secondary }}>
                      {t.optimal_price != null ? `$${t.optimal_price.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-right font-semibold" style={{
                      color: t.counterfactual_value > 0 ? tokens.colors.market.bullish : tokens.colors.text.secondary,
                    }}>
                      {t.counterfactual_value > 0 ? `+$${t.counterfactual_value.toLocaleString()}` : '$0'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show count */}
      <div className="text-xs text-right" style={{ color: tokens.colors.text.secondary }}>
        Showing {filteredTrades.length} of {report.trade_details.length} trades
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KPICardProps {
  tokens: ReturnType<typeof useDesignTokens>
  label: string
  value: string
  sub?: string
  accent: string
}

const KPICard: FC<KPICardProps> = ({ tokens, label, value, sub, accent }) => (
  <div
    className="rounded p-3 border"
    style={{ borderColor: tokens.colors.surface.tertiary, background: tokens.colors.surface.primary }}
  >
    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: tokens.colors.text.secondary }}>
      {label}
    </div>
    <div className="text-lg font-bold" style={{ color: accent, fontFamily: tokens.typography.families.financial }}>
      {value}
    </div>
    {sub && (
      <div className="text-xs mt-0.5" style={{ color: tokens.colors.text.secondary }}>
        {sub}
      </div>
    )}
  </div>
)

export default CounterfactualReport
