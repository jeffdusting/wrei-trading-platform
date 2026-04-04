'use client'

// =============================================================================
// WREI Platform — Audit Trail Viewer (WP4 §5, Step D3)
//
// Filterable, searchable log of platform actions. Reads from the in-memory
// audit logger with fallback demo data. Supports filtering by action type,
// date range, instrument, and user. Exportable to CSV.
// =============================================================================

import { useState, useMemo, useCallback } from 'react'
import {
  getAuditLog,
  type AuditLogEntry,
  type AuditActionType,
} from '@/lib/trading/compliance/audit-logger'
import type { InstrumentType } from '@/lib/trading/instruments/types'

// ---------------------------------------------------------------------------
// Demo audit entries (shown when in-memory log is empty)
// ---------------------------------------------------------------------------

const DEMO_AUDIT_ENTRIES: AuditLogEntry[] = [
  { timestamp: '2026-04-04T09:15:23.000Z', actionType: 'trade_initiated', userId: 'mark.donovan', instrumentId: 'TRD-2026-001', instrumentType: 'ESC' as InstrumentType, sessionId: 'sess-a1', entityId: 'TRD-2026-001', details: { quantity: 25000, price: 23.10, counterparty: 'AGL Energy' } },
  { timestamp: '2026-04-04T09:15:24.000Z', actionType: 'negotiation_started', userId: 'system', instrumentId: 'NEG-2026-001', instrumentType: 'ESC' as InstrumentType, sessionId: 'sess-a1', entityId: 'NEG-2026-001', details: { persona: 'esc_obligated_entity', anchor: 23.50 } },
  { timestamp: '2026-04-04T09:18:42.000Z', actionType: 'negotiation_completed', userId: 'system', instrumentId: 'NEG-2026-001', instrumentType: 'ESC' as InstrumentType, sessionId: 'sess-a1', entityId: 'NEG-2026-001', details: { outcome: 'agreed', finalPrice: 22.80, rounds: 4 } },
  { timestamp: '2026-04-04T09:18:43.000Z', actionType: 'trade_confirmed', userId: 'system', instrumentId: 'TRD-2026-001', instrumentType: 'ESC' as InstrumentType, sessionId: 'sess-a1', entityId: 'TRD-2026-001', details: { quantity: 25000, agreedPrice: 22.80 } },
  { timestamp: '2026-04-04T09:19:00.000Z', actionType: 'settlement_initiated', userId: 'system', instrumentId: 'STL-2026-001', instrumentType: 'ESC' as InstrumentType, sessionId: 'sess-a1', entityId: 'STL-2026-001', details: { method: 'tessa_registry', tradeId: 'TRD-2026-001' } },
  { timestamp: '2026-04-04T10:05:12.000Z', actionType: 'settlement_state_change', userId: 'system', instrumentId: 'STL-2026-001', instrumentType: 'ESC' as InstrumentType, sessionId: 'sess-a1', entityId: 'STL-2026-001', details: { from: 'initiated', to: 'transfer_recorded' } },
  { timestamp: '2026-04-04T10:30:00.000Z', actionType: 'settlement_completed', userId: 'system', instrumentId: 'STL-2026-001', instrumentType: 'ESC' as InstrumentType, sessionId: 'sess-a1', entityId: 'STL-2026-001', details: { tessaRef: 'TESSA-2026-04-001' } },
  { timestamp: '2026-04-04T11:00:00.000Z', actionType: 'trade_initiated', userId: 'rachel.lim', instrumentId: 'TRD-2026-002', instrumentType: 'VEEC' as InstrumentType, sessionId: 'sess-b1', entityId: 'TRD-2026-002', details: { quantity: 5000, price: 83.50, counterparty: 'Origin Energy' } },
  { timestamp: '2026-04-04T11:05:00.000Z', actionType: 'negotiation_started', userId: 'system', instrumentId: 'NEG-2026-002', instrumentType: 'VEEC' as InstrumentType, sessionId: 'sess-b1', entityId: 'NEG-2026-002', details: { persona: 'esc_trading_desk', anchor: 84.00 } },
  { timestamp: '2026-04-04T11:12:30.000Z', actionType: 'config_change', userId: 'admin', instrumentId: null, sessionId: null, entityId: 'pricing-config', details: { field: 'esc_floor', oldValue: 17.50, newValue: 18.00 } },
  { timestamp: '2026-04-04T12:00:00.000Z', actionType: 'system_event', userId: null, instrumentId: null, sessionId: null, details: { event: 'feed_refresh', adapters: ['ecovantage', 'northmore'], status: 'success' } },
  { timestamp: '2026-04-04T14:30:00.000Z', actionType: 'trade_initiated', userId: 'jennifer.walsh', instrumentId: 'TRD-2026-003', instrumentType: 'ACCU' as InstrumentType, sessionId: 'sess-c1', entityId: 'TRD-2026-003', details: { quantity: 10000, price: 35.20, counterparty: 'NSW Dept of Planning' } },
]

const ACTION_LABELS: Record<AuditActionType, string> = {
  trade_initiated: 'Trade Initiated',
  trade_confirmed: 'Trade Confirmed',
  trade_cancelled: 'Trade Cancelled',
  negotiation_started: 'Negotiation Started',
  negotiation_message: 'Negotiation Message',
  negotiation_completed: 'Negotiation Completed',
  settlement_initiated: 'Settlement Initiated',
  settlement_state_change: 'Settlement Update',
  settlement_completed: 'Settlement Completed',
  settlement_failed: 'Settlement Failed',
  user_action: 'User Action',
  config_change: 'Config Change',
  system_event: 'System Event',
}

const ACTION_COLOURS: Record<string, string> = {
  trade: 'bg-blue-100 text-blue-800',
  negotiation: 'bg-purple-100 text-purple-800',
  settlement: 'bg-emerald-100 text-emerald-800',
  user: 'bg-amber-100 text-amber-800',
  config: 'bg-orange-100 text-orange-800',
  system: 'bg-slate-100 text-slate-700',
}

function getActionCategory(action: AuditActionType): string {
  if (action.startsWith('trade_')) return 'trade'
  if (action.startsWith('negotiation_')) return 'negotiation'
  if (action.startsWith('settlement_')) return 'settlement'
  if (action === 'user_action') return 'user'
  if (action === 'config_change') return 'config'
  return 'system'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AuditTrailViewer() {
  const [filterAction, setFilterAction] = useState<AuditActionType | 'all'>('all')
  const [filterInstrument, setFilterInstrument] = useState<string>('all')
  const [filterUser, setFilterUser] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const entries = useMemo(() => {
    const live = getAuditLog({ limit: 500 })
    return live.length > 0 ? live : DEMO_AUDIT_ENTRIES
  }, [])

  const filtered = useMemo(() => {
    let result = entries
    if (filterAction !== 'all') {
      result = result.filter(e => e.actionType === filterAction)
    }
    if (filterInstrument !== 'all') {
      result = result.filter(e => e.instrumentType === filterInstrument)
    }
    if (filterUser) {
      result = result.filter(e =>
        (e.userId ?? '').toLowerCase().includes(filterUser.toLowerCase())
      )
    }
    if (filterDateFrom) {
      const from = new Date(filterDateFrom)
      result = result.filter(e => new Date(e.timestamp) >= from)
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo + 'T23:59:59')
      result = result.filter(e => new Date(e.timestamp) <= to)
    }
    return result
  }, [entries, filterAction, filterInstrument, filterUser, filterDateFrom, filterDateTo])

  const exportToCsv = useCallback(() => {
    const header = 'Timestamp,Action,User,Instrument,Entity ID,Details'
    const rows = filtered.map(e => {
      const details = JSON.stringify(e.details).replace(/"/g, '""')
      return `${e.timestamp},${e.actionType},${e.userId ?? 'system'},${e.instrumentType ?? ''},${e.entityId ?? ''},"${details}"`
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wrei-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  const instruments = useMemo(() => {
    const set = new Set(entries.map(e => e.instrumentType).filter(Boolean))
    return Array.from(set) as string[]
  }, [entries])

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="bloomberg-section-label text-slate-800">Audit Trail</h3>
          <p className="bloomberg-small-text text-slate-500">
            {filtered.length} entries — immutable, timestamped, user-attributed
          </p>
        </div>
        <button
          onClick={exportToCsv}
          className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap gap-3 items-center bg-slate-50">
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value as AuditActionType | 'all')}
          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
        >
          <option value="all">All Actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={filterInstrument}
          onChange={e => setFilterInstrument(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
        >
          <option value="all">All Instruments</option>
          {instruments.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        <input
          type="text"
          placeholder="Filter by user..."
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white w-32"
        />

        <input
          type="date"
          value={filterDateFrom}
          onChange={e => setFilterDateFrom(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="date"
          value={filterDateTo}
          onChange={e => setFilterDateTo(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Timestamp</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Action</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">User</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Instrument</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Entity</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((entry, i) => {
              const cat = getActionCategory(entry.actionType)
              return (
                <tr key={`${entry.timestamp}-${i}`} className="hover:bg-slate-50">
                  <td className="px-3 py-1.5 font-mono text-slate-600 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('en-AU', { hour12: false })}
                  </td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${ACTION_COLOURS[cat]}`}>
                      {ACTION_LABELS[entry.actionType]}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-slate-700">{entry.userId ?? 'system'}</td>
                  <td className="px-3 py-1.5 font-mono text-slate-600">{entry.instrumentType ?? '—'}</td>
                  <td className="px-3 py-1.5 font-mono text-slate-500 truncate max-w-[120px]">{entry.entityId ?? '—'}</td>
                  <td className="px-3 py-1.5 text-slate-500 truncate max-w-[200px]">
                    {Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                  No audit entries match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
