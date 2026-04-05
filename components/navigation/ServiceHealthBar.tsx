'use client'

import { FC, useState, useEffect, Component, ReactNode } from 'react'
import { useDesignTokens } from '@/design-system/tokens/professional-tokens'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ServiceStatus = 'healthy' | 'degraded' | 'unavailable'

interface ServiceHealth {
  name: string
  code: string
  status: ServiceStatus
  lastSuccessful: string | null
  message?: string
}

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface EBState { hasError: boolean }

class HealthBarErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(): EBState { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-[6px] h-[6px] rounded-full bg-gray-400" />
          <span className="bloomberg-small-text text-slate-400">SERVICES N/A</span>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Status colours
// ---------------------------------------------------------------------------

const STATUS_DOT: Record<ServiceStatus, string> = {
  healthy:     '#10B981',
  degraded:    '#F59E0B',
  unavailable: '#EF4444',
}

const STATUS_LABEL: Record<ServiceStatus, string> = {
  healthy:     'OK',
  degraded:    'DEGRADED',
  unavailable: 'DOWN',
}

// ---------------------------------------------------------------------------
// Demo service health data
// ---------------------------------------------------------------------------

function getDemoHealth(): ServiceHealth[] {
  return [
    { name: 'AI Engine', code: 'AI', status: 'healthy', lastSuccessful: new Date().toISOString() },
    { name: 'Price Feeds', code: 'PF', status: 'healthy', lastSuccessful: new Date().toISOString() },
    { name: 'Database', code: 'DB', status: 'healthy', lastSuccessful: new Date().toISOString() },
    { name: 'Settlement', code: 'ST', status: 'healthy', lastSuccessful: new Date().toISOString() },
    { name: 'Email', code: 'EM', status: 'degraded', lastSuccessful: new Date(Date.now() - 15 * 60_000).toISOString(), message: 'SMTP response slow' },
  ]
}

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

const DetailModal: FC<{ services: ServiceHealth[]; onClose: () => void }> = ({ services, onClose }) => {
  const tokens = useDesignTokens('retail')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative w-96 rounded shadow-lg border overflow-hidden"
        style={{ backgroundColor: tokens.colors.surface.white, borderColor: tokens.colors.surface.tertiary }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: tokens.colors.surface.tertiary, backgroundColor: tokens.colors.surface.lightGrey }}
        >
          <span className="bloomberg-section-label text-xs font-semibold text-slate-700">
            SERVICE HEALTH
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>

        <div className="divide-y" style={{ borderColor: tokens.colors.surface.tertiary }}>
          {services.map(svc => (
            <div key={svc.code} className="px-4 py-2.5 flex items-center gap-3">
              <div
                className="flex-shrink-0"
                style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: STATUS_DOT[svc.status] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-800">{svc.name}</span>
                  <span
                    className="text-[10px] font-medium px-1.5 rounded"
                    style={{
                      color: STATUS_DOT[svc.status],
                      backgroundColor: svc.status === 'healthy' ? '#F0FDF4' : svc.status === 'degraded' ? '#FFFBEB' : '#FEF2F2',
                    }}
                  >
                    {STATUS_LABEL[svc.status]}
                  </span>
                </div>
                {svc.message && (
                  <div className="text-[10px] text-slate-500 mt-0.5">{svc.message}</div>
                )}
                {svc.lastSuccessful && (
                  <div className="text-[10px] text-slate-400 bloomberg-data mt-0.5">
                    Last OK: {new Date(svc.lastSuccessful).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status bar widget
// ---------------------------------------------------------------------------

function ServiceHealthBarInner() {
  const tokens = useDesignTokens('retail')
  const [services, setServices] = useState<ServiceHealth[]>(getDemoHealth)
  const [showDetail, setShowDetail] = useState(false)

  // Refresh every 60s (in production, this would call a health endpoint)
  useEffect(() => {
    const interval = setInterval(() => setServices(getDemoHealth()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const overall = services.some(s => s.status === 'unavailable')
    ? 'unavailable'
    : services.some(s => s.status === 'degraded')
      ? 'degraded'
      : 'healthy'

  return (
    <>
      <button
        onClick={() => setShowDetail(true)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        title="Click for service health detail"
        style={{ fontFamily: tokens.typography.families.financial }}
      >
        <span className="bloomberg-small-text text-slate-400">SERVICES</span>
        {services.map(svc => (
          <div
            key={svc.code}
            className="flex items-center gap-1"
            title={`${svc.name}: ${STATUS_LABEL[svc.status]}${svc.message ? ` — ${svc.message}` : ''}`}
          >
            <div
              style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: STATUS_DOT[svc.status] }}
            />
            <span
              className="bloomberg-small-text"
              style={{ color: STATUS_DOT[svc.status], fontSize: '10px' }}
            >
              {svc.code}
            </span>
          </div>
        ))}

        {/* Overall summary */}
        <span
          className="bloomberg-small-text ml-1"
          style={{ color: STATUS_DOT[overall], fontSize: '10px' }}
        >
          {overall === 'healthy' ? 'ALL OK' : overall === 'degraded' ? 'DEGRADED' : 'ISSUE'}
        </span>
      </button>

      {showDetail && <DetailModal services={services} onClose={() => setShowDetail(false)} />}
    </>
  )
}

export default function ServiceHealthBar() {
  return (
    <HealthBarErrorBoundary>
      <ServiceHealthBarInner />
    </HealthBarErrorBoundary>
  )
}
