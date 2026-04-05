'use client'

import { FC, useState, useEffect, useRef, useCallback } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'

interface AlertEvent {
  id: number
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  created_at: string
  acknowledged_at: string | null
}

// Demo alert events for demonstration mode
const DEMO_ALERTS: AlertEvent[] = [
  {
    id: 1,
    type: 'price_cross',
    severity: 'warning',
    title: 'ESC price crossed $23.50',
    message: 'ESC spot price rose above your $23.50 threshold',
    created_at: new Date(Date.now() - 12 * 60_000).toISOString(),
    acknowledged_at: null,
  },
  {
    id: 2,
    type: 'compliance_deadline',
    severity: 'critical',
    title: 'ESS surrender due in 14 days',
    message: 'Origin Energy ESS surrender deadline: 19 April 2026',
    created_at: new Date(Date.now() - 45 * 60_000).toISOString(),
    acknowledged_at: null,
  },
  {
    id: 3,
    type: 'settlement_status',
    severity: 'info',
    title: 'Trade T-4821 settled',
    message: 'TESSA transfer confirmed — 5,000 ESCs settled',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    acknowledged_at: null,
  },
]

const SEVERITY_COLOURS: Record<string, { dot: string; bg: string; text: string }> = {
  critical: { dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
  warning:  { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  info:     { dot: '#0EA5E9', bg: '#F0F9FF', text: '#075985' },
}

export const AlertBell: FC = () => {
  const tokens = useDesignTokens('retail')
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<AlertEvent[]>(DEMO_ALERTS)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unacknowledged = alerts.filter(a => !a.acknowledged_at).length

  const acknowledge = useCallback((id: number) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, acknowledged_at: new Date().toISOString() } : a)
    )
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const timeAgo = (iso: string): string => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded hover:bg-slate-700/20 transition-colors"
        aria-label={`Alerts — ${unacknowledged} unacknowledged`}
        title={`${unacknowledged} unacknowledged alert${unacknowledged !== 1 ? 's' : ''}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: tokens.colors.text.secondary }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Badge */}
        {unacknowledged > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-white font-medium"
            style={{
              fontSize: '9px',
              backgroundColor: tokens.colors.accent.danger,
              lineHeight: 1,
            }}
          >
            {unacknowledged > 9 ? '9+' : unacknowledged}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-80 rounded shadow-lg border z-50 overflow-hidden"
          style={{
            backgroundColor: tokens.colors.surface.white,
            borderColor: tokens.colors.surface.tertiary,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{
              borderColor: tokens.colors.surface.tertiary,
              backgroundColor: tokens.colors.surface.lightGrey,
            }}
          >
            <span className="bloomberg-section-label text-xs font-semibold text-slate-700">
              ALERTS
            </span>
            <span className="bloomberg-small-text text-slate-500">
              {unacknowledged} unread
            </span>
          </div>

          {/* Alert list */}
          <div className="max-h-72 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-400">
                No alerts
              </div>
            ) : (
              alerts.map(alert => {
                const colours = SEVERITY_COLOURS[alert.severity] ?? SEVERITY_COLOURS.info
                return (
                  <div
                    key={alert.id}
                    className="px-3 py-2 border-b last:border-b-0 flex items-start gap-2 hover:bg-slate-50 transition-colors"
                    style={{
                      borderColor: tokens.colors.surface.tertiary,
                      opacity: alert.acknowledged_at ? 0.5 : 1,
                    }}
                  >
                    {/* Severity dot */}
                    <div
                      className="mt-1.5 flex-shrink-0"
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: colours.dot,
                      }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] uppercase font-medium px-1 rounded"
                          style={{
                            backgroundColor: colours.bg,
                            color: colours.text,
                          }}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 bloomberg-data">
                          {timeAgo(alert.created_at)}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-0.5 truncate">
                        {alert.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {alert.message}
                      </div>
                    </div>

                    {/* Acknowledge */}
                    {!alert.acknowledged_at && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          acknowledge(alert.id)
                        }}
                        className="mt-1 text-[10px] text-slate-400 hover:text-blue-600 flex-shrink-0"
                        title="Acknowledge"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div
            className="px-3 py-1.5 border-t text-center"
            style={{
              borderColor: tokens.colors.surface.tertiary,
              backgroundColor: tokens.colors.surface.lightGrey,
            }}
          >
            <span className="text-[10px] text-slate-500 bloomberg-data">
              ALT — Alert Manager
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertBell
