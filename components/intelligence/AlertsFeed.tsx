'use client'

import { FC, useState, useCallback } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'

interface Alert {
  id: number
  alertType: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  summary: string
  estimatedPriceImpactPct: number
  source: string
  sourceUrl: string
  metadata: Record<string, unknown>
  createdAt: string
  acknowledgedAt: string | null
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  policy: 'Policy',
  creation_anomaly: 'Creation',
  sentiment: 'Sentiment',
  surplus: 'Surplus',
  regime: 'Regime',
  system: 'System',
}

const SEVERITY_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  critical: { dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
  warning:  { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  info:     { dot: '#0EA5E9', bg: '#F0F9FF', text: '#075985' },
}

// Demo alerts
const DEMO_ALERTS: Alert[] = [
  {
    id: 1, alertType: 'policy', severity: 'critical',
    title: 'IPART: Commercial lighting method sunset — March 2026',
    summary: 'IPART confirmed the commercial lighting activity method will end on 31 March 2026. This removes approximately 25% of current ESC creation volume, likely causing significant supply reduction and upward price pressure.',
    estimatedPriceImpactPct: 15.0,
    source: 'ipart', sourceUrl: 'https://www.ipart.nsw.gov.au',
    metadata: { affected_activities: ['commercial_lighting'], supply_impact: 'decrease', confidence: 0.9 },
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), acknowledgedAt: null,
  },
  {
    id: 2, alertType: 'creation_anomaly', severity: 'warning',
    title: 'Creation slowdown detected (22% below trend)',
    summary: '4-week creation velocity (145K/wk) has dropped 22% below the 12-week average (186K/wk). This may indicate early supply tightening ahead of method sunset.',
    estimatedPriceImpactPct: 3.3,
    source: 'anomaly_detector', sourceUrl: '',
    metadata: { velocity_4w: 145000, velocity_12w: 186000, ratio: 0.78 },
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(), acknowledgedAt: null,
  },
  {
    id: 3, alertType: 'sentiment', severity: 'info',
    title: 'Ecovantage: Bullish sentiment (concern=7/10)',
    summary: 'Key themes: supply tightening expectations, method sunset countdown, institutional demand increase.',
    estimatedPriceImpactPct: 2.1,
    source: 'ecovantage', sourceUrl: '',
    metadata: { overall_sentiment: 'bullish', price_direction: 'up', supply_concern_level: 7 },
    createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(), acknowledgedAt: null,
  },
  {
    id: 4, alertType: 'surplus', severity: 'info',
    title: 'Surplus tightening — 3.2 years remaining',
    summary: 'Estimated years-to-exhaustion has declined to 3.2 years. While not yet critical, the trajectory warrants monitoring as method sunsets reduce creation capacity.',
    estimatedPriceImpactPct: 1.5,
    source: 'anomaly_detector', sourceUrl: '',
    metadata: { surplus_runway_years: 3.2 },
    createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(), acknowledgedAt: null,
  },
]

const FILTER_TYPES = ['all', 'policy', 'creation_anomaly', 'sentiment', 'surplus', 'regime'] as const

const AlertsFeed: FC = () => {
  const tokens = useDesignTokens('retail')
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const acknowledge = useCallback(async (id: number) => {
    // Try API first
    try {
      await fetch('/api/v1/intelligence/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: id }),
      })
    } catch {
      // Demo mode — handle locally
    }
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, acknowledgedAt: new Date().toISOString() } : a)
    )
  }, [])

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.alertType === filter)

  const activeAlerts = filteredAlerts.filter(a => !a.acknowledgedAt)
  const ackAlerts = filteredAlerts.filter(a => a.acknowledgedAt)

  const timeAgo = (iso: string): string => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="bg-white rounded border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">INTELLIGENCE ALERTS</h3>
        <span className="bloomberg-small-text text-slate-500">{activeAlerts.length} active</span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-1 mb-3">
        {FILTER_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className="px-2 py-0.5 rounded bloomberg-small-text transition-colors"
            style={{
              backgroundColor: filter === type ? tokens.colors.accent.info : '#F1F5F9',
              color: filter === type ? 'white' : '#64748B',
              fontWeight: filter === type ? 600 : 400,
            }}
          >
            {type === 'all' ? 'All' : ALERT_TYPE_LABELS[type] ?? type}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="max-h-96 overflow-y-auto space-y-1">
        {activeAlerts.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-400">
            No active alerts{filter !== 'all' ? ` for "${ALERT_TYPE_LABELS[filter] ?? filter}"` : ''}
          </div>
        )}

        {activeAlerts.map(alert => {
          const sev = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info
          const expanded = expandedId === alert.id

          return (
            <div
              key={alert.id}
              className="border border-slate-200 rounded cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(expanded ? null : alert.id)}
            >
              <div className="flex items-start gap-2 p-2">
                {/* Severity dot */}
                <div
                  className="mt-1.5 flex-shrink-0"
                  style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sev.dot }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] uppercase font-medium px-1 rounded"
                      style={{ backgroundColor: sev.bg, color: sev.text }}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-medium px-1 rounded bg-slate-100">
                      {ALERT_TYPE_LABELS[alert.alertType] ?? alert.alertType}
                    </span>
                    <span className="text-[10px] text-slate-400 bloomberg-data">{timeAgo(alert.createdAt)}</span>
                    {alert.estimatedPriceImpactPct !== 0 && (
                      <span
                        className="text-[10px] bloomberg-data font-medium"
                        style={{
                          color: alert.estimatedPriceImpactPct > 0
                            ? tokens.colors.market.bullish
                            : tokens.colors.market.bearish,
                        }}
                      >
                        {alert.estimatedPriceImpactPct > 0 ? '+' : ''}{alert.estimatedPriceImpactPct.toFixed(1)}% est.
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-800 mt-0.5">{alert.title}</div>

                  {/* Expanded summary */}
                  {expanded && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-slate-600 leading-relaxed">{alert.summary}</p>
                      {alert.sourceUrl && (
                        <a
                          href={alert.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline"
                          onClick={e => e.stopPropagation()}
                        >
                          View source
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Acknowledge button */}
                <button
                  onClick={(e) => { e.stopPropagation(); acknowledge(alert.id) }}
                  className="mt-0.5 text-[10px] text-slate-400 hover:text-blue-600 flex-shrink-0 px-1"
                  title="Acknowledge"
                >
                  ACK
                </button>
              </div>
            </div>
          )
        })}

        {/* Acknowledged alerts (dimmed) */}
        {ackAlerts.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-100">
            <div className="bloomberg-small-text text-slate-400 mb-1">Acknowledged ({ackAlerts.length})</div>
            {ackAlerts.map(alert => (
              <div key={alert.id} className="flex items-center gap-2 py-1 opacity-40">
                <div
                  className="flex-shrink-0"
                  style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: SEVERITY_STYLES[alert.severity]?.dot ?? '#6B7280' }}
                />
                <span className="text-xs text-slate-500 truncate">{alert.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsFeed
