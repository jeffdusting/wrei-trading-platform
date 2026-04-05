'use client'

import { FC, useState, useCallback } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'
import type { AlertType, AlertCondition } from '@/lib/alerts/types'

// ---------------------------------------------------------------------------
// Types for local state
// ---------------------------------------------------------------------------

interface LocalRule {
  id: string
  type: AlertType
  name: string
  instrument: string
  condition: AlertCondition
  threshold: number
  is_active: boolean
  created_at: string
}

interface LocalEvent {
  id: number
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  type: string
  created_at: string
  acknowledged_at: string | null
}

// Demo data
const DEMO_RULES: LocalRule[] = [
  { id: 'r1', type: 'price_cross', name: 'ESC above $24', instrument: 'ESC', condition: 'above', threshold: 24, is_active: true, created_at: '2026-04-01T08:00:00Z' },
  { id: 'r2', type: 'compliance_deadline', name: 'Surrender <30 days', instrument: '', condition: 'below', threshold: 30, is_active: true, created_at: '2026-04-01T08:00:00Z' },
  { id: 'r3', type: 'feed_health', name: 'Feed degradation', instrument: '', condition: 'equals', threshold: 1, is_active: true, created_at: '2026-04-01T08:00:00Z' },
  { id: 'r4', type: 'settlement_status', name: 'Failed settlements', instrument: '', condition: 'equals', threshold: 1, is_active: false, created_at: '2026-03-20T10:00:00Z' },
]

const DEMO_EVENTS: LocalEvent[] = [
  { id: 1, severity: 'warning', title: 'ESC price crossed $23.50', message: 'ESC spot above $23.50 threshold', type: 'price_cross', created_at: new Date(Date.now() - 12 * 60_000).toISOString(), acknowledged_at: null },
  { id: 2, severity: 'critical', title: 'ESS surrender due in 14 days', message: 'Origin Energy ESS deadline: 19 April 2026', type: 'compliance_deadline', created_at: new Date(Date.now() - 45 * 60_000).toISOString(), acknowledged_at: null },
  { id: 3, severity: 'info', title: 'Trade T-4821 settled', message: 'TESSA transfer confirmed — 5,000 ESCs', type: 'settlement_status', created_at: new Date(Date.now() - 2 * 3600_000).toISOString(), acknowledged_at: new Date(Date.now() - 3600_000).toISOString() },
  { id: 4, severity: 'warning', title: 'VEEC feed degraded', message: 'Ecovantage scraper returning stale data', type: 'feed_health', created_at: new Date(Date.now() - 5 * 3600_000).toISOString(), acknowledged_at: new Date(Date.now() - 4 * 3600_000).toISOString() },
]

const ALERT_TYPES: { value: AlertType; label: string }[] = [
  { value: 'price_cross', label: 'Price Cross' },
  { value: 'volume_threshold', label: 'Volume Threshold' },
  { value: 'compliance_deadline', label: 'Compliance Deadline' },
  { value: 'compliance_shortfall', label: 'Compliance Shortfall' },
  { value: 'settlement_status', label: 'Settlement Status' },
  { value: 'feed_health', label: 'Feed Health' },
]

const SEVERITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
  warning:  { bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  info:     { bg: '#F0F9FF', text: '#075985', dot: '#0EA5E9' },
}

type Tab = 'rules' | 'history'

export const AlertManager: FC = () => {
  const tokens = useDesignTokens('retail')
  const [tab, setTab] = useState<Tab>('rules')
  const [rules, setRules] = useState<LocalRule[]>(DEMO_RULES)
  const [events, setEvents] = useState<LocalEvent[]>(DEMO_EVENTS)
  const [showCreate, setShowCreate] = useState(false)

  // New rule form state
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<AlertType>('price_cross')
  const [newInstrument, setNewInstrument] = useState('ESC')
  const [newCondition, setNewCondition] = useState<AlertCondition>('above')
  const [newThreshold, setNewThreshold] = useState('')

  const toggleActive = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r))
  }, [])

  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }, [])

  const acknowledgeEvent = useCallback((id: number) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, acknowledged_at: new Date().toISOString() } : e))
  }, [])

  const createRule = useCallback(() => {
    if (!newName || !newThreshold) return
    const rule: LocalRule = {
      id: `r${Date.now()}`,
      type: newType,
      name: newName,
      instrument: newInstrument,
      condition: newCondition,
      threshold: Number(newThreshold),
      is_active: true,
      created_at: new Date().toISOString(),
    }
    setRules(prev => [rule, ...prev])
    setShowCreate(false)
    setNewName('')
    setNewThreshold('')
  }, [newName, newType, newInstrument, newCondition, newThreshold])

  const timeAgo = (iso: string): string => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const inputStyle = {
    fontSize: tokens.typography.sizes.sm,
    fontFamily: tokens.typography.families.financial,
    padding: '4px 8px',
    border: `1px solid ${tokens.colors.surface.tertiary}`,
    borderRadius: tokens.borderRadius.sm,
    backgroundColor: tokens.colors.surface.white,
  }

  return (
    <div
      className="rounded border"
      style={{
        borderColor: tokens.colors.surface.tertiary,
        backgroundColor: tokens.colors.surface.white,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: tokens.colors.surface.tertiary }}
      >
        <div className="flex items-center gap-4">
          <span className="bloomberg-section-label text-xs font-semibold text-slate-700">
            ALERT MANAGER
          </span>
          <div className="flex gap-1">
            {(['rules', 'history'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3 py-1 text-xs rounded transition-colors"
                style={{
                  backgroundColor: tab === t ? tokens.colors.accent.info + '15' : 'transparent',
                  color: tab === t ? tokens.colors.accent.info : tokens.colors.text.secondary,
                  fontWeight: tab === t ? 600 : 400,
                }}
              >
                {t === 'rules' ? `Rules (${rules.length})` : `History (${events.length})`}
              </button>
            ))}
          </div>
        </div>
        {tab === 'rules' && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-xs px-3 py-1 rounded font-medium transition-colors"
            style={{
              backgroundColor: tokens.colors.accent.info,
              color: 'white',
            }}
          >
            + New Rule
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && tab === 'rules' && (
        <div
          className="px-4 py-3 border-b grid grid-cols-6 gap-2 items-end"
          style={{
            borderColor: tokens.colors.surface.tertiary,
            backgroundColor: tokens.colors.surface.lightGrey,
          }}
        >
          <div>
            <label className="block text-[10px] text-slate-500 mb-0.5">Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Alert name"
              className="w-full"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-0.5">Type</label>
            <select value={newType} onChange={e => setNewType(e.target.value as AlertType)} className="w-full" style={inputStyle}>
              {ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-0.5">Instrument</label>
            <input
              type="text"
              value={newInstrument}
              onChange={e => setNewInstrument(e.target.value)}
              placeholder="ESC"
              className="w-full"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-0.5">Condition</label>
            <select value={newCondition} onChange={e => setNewCondition(e.target.value as AlertCondition)} className="w-full" style={inputStyle}>
              <option value="above">Above</option>
              <option value="below">Below</option>
              <option value="equals">Equals</option>
              <option value="crosses">Crosses</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-0.5">Threshold</label>
            <input
              type="number"
              value={newThreshold}
              onChange={e => setNewThreshold(e.target.value)}
              placeholder="0"
              className="w-full"
              style={inputStyle}
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={createRule}
              className="text-xs px-3 py-1 rounded font-medium"
              style={{ backgroundColor: tokens.colors.status.online, color: 'white' }}
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-xs px-3 py-1 rounded text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules tab */}
      {tab === 'rules' && (
        <div className="divide-y" style={{ borderColor: tokens.colors.surface.tertiary }}>
          {rules.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No alert rules configured</div>
          ) : (
            rules.map(rule => (
              <div key={rule.id} className="px-4 py-2 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(rule.id)}
                  className="w-8 h-4 rounded-full relative transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: rule.is_active ? tokens.colors.status.online : tokens.colors.surface.tertiary,
                  }}
                  title={rule.is_active ? 'Active' : 'Inactive'}
                >
                  <div
                    className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform"
                    style={{ left: rule.is_active ? '16px' : '2px' }}
                  />
                </button>

                {/* Type badge */}
                <span
                  className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 flex-shrink-0"
                  style={{ fontFamily: tokens.typography.families.financial }}
                >
                  {rule.type.replace('_', ' ')}
                </span>

                {/* Name + details */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-800 truncate">{rule.name}</div>
                  <div className="text-[10px] text-slate-500 bloomberg-data">
                    {rule.instrument && `${rule.instrument} · `}{rule.condition} {rule.threshold}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-xs text-slate-400 hover:text-red-500 flex-shrink-0"
                  title="Delete rule"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="divide-y" style={{ borderColor: tokens.colors.surface.tertiary }}>
          {events.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No alert events</div>
          ) : (
            events.map(event => {
              const s = SEVERITY_STYLES[event.severity] ?? SEVERITY_STYLES.info
              return (
                <div
                  key={event.id}
                  className="px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                  style={{ opacity: event.acknowledged_at ? 0.55 : 1 }}
                >
                  <div
                    className="flex-shrink-0"
                    style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.dot }}
                  />
                  <span
                    className="text-[10px] uppercase font-medium px-1 rounded flex-shrink-0"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    {event.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 truncate">{event.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{event.message}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 bloomberg-data flex-shrink-0">
                    {timeAgo(event.created_at)}
                  </span>
                  {!event.acknowledged_at && (
                    <button
                      onClick={() => acknowledgeEvent(event.id)}
                      className="text-[10px] text-blue-500 hover:text-blue-700 flex-shrink-0"
                    >
                      ACK
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default AlertManager
