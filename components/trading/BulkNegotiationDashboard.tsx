'use client'

// =============================================================================
// WREI Platform — Bulk ESC Negotiation Dashboard (WP4 §6, Scenario E)
//
// Displays a large-volume ESC purchase being worked by the AI agent across
// multiple simulated counterparties. Shows total volume filled, average price,
// per-counterparty cards, VWAP comparison, and execution report.
// =============================================================================

import { useState, useCallback, useRef, useEffect } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BuyerConstraints {
  totalVolume: number
  maxPricePerCert: number
  minVintage: number
  maxPerCounterparty: number
  deadline: string // ISO date
}

interface CounterpartyNegotiation {
  id: string
  name: string
  riskRating: 'A' | 'B' | 'C'
  availableVolume: number
  volumeNegotiated: number
  priceOffered: number
  priceFinal: number | null
  status: 'queued' | 'negotiating' | 'agreed' | 'rejected' | 'timeout'
  rounds: number
  startedAt: string | null
  completedAt: string | null
}

interface ExecutionReport {
  totalFilled: number
  totalCost: number
  vwap: number
  spotAtExecution: number
  counterparties: number
  duration: string
  trades: { counterparty: string; volume: number; price: number; status: string }[]
}

// ---------------------------------------------------------------------------
// Simulated counterparties
// ---------------------------------------------------------------------------

const COUNTERPARTIES: Omit<CounterpartyNegotiation, 'status' | 'rounds' | 'startedAt' | 'completedAt' | 'priceFinal'>[] = [
  { id: 'CP-001', name: 'EfficientAus Solutions', riskRating: 'A', availableVolume: 180_000, volumeNegotiated: 0, priceOffered: 23.20 },
  { id: 'CP-002', name: 'GreenCert NSW', riskRating: 'A', availableVolume: 150_000, volumeNegotiated: 0, priceOffered: 23.40 },
  { id: 'CP-003', name: 'ESC Direct Pty Ltd', riskRating: 'B', availableVolume: 120_000, volumeNegotiated: 0, priceOffered: 22.90 },
  { id: 'CP-004', name: 'CarbonTrade Australia', riskRating: 'B', availableVolume: 100_000, volumeNegotiated: 0, priceOffered: 23.60 },
  { id: 'CP-005', name: 'National Energy Services', riskRating: 'A', availableVolume: 200_000, volumeNegotiated: 0, priceOffered: 23.10 },
]

const SPOT_PRICE = 23.00

// ---------------------------------------------------------------------------
// Simulation helpers
// ---------------------------------------------------------------------------

function simulateNegotiation(
  cp: CounterpartyNegotiation,
  maxPrice: number,
  maxVol: number,
  totalNeeded: number,
): CounterpartyNegotiation {
  const capVolume = Math.min(cp.availableVolume, maxVol, totalNeeded)
  const rounds = 2 + Math.floor(Math.random() * 3)
  const spread = cp.priceOffered - SPOT_PRICE
  const discount = spread * (0.3 + Math.random() * 0.5)
  const finalPrice = parseFloat((cp.priceOffered - discount).toFixed(2))

  if (finalPrice > maxPrice) {
    return { ...cp, status: 'rejected', rounds, priceFinal: null, volumeNegotiated: 0, startedAt: cp.startedAt, completedAt: new Date().toISOString() }
  }

  return {
    ...cp,
    status: 'agreed',
    rounds,
    priceFinal: finalPrice,
    volumeNegotiated: capVolume,
    completedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BulkNegotiationDashboard() {
  const [constraints, setConstraints] = useState<BuyerConstraints>({
    totalVolume: 500_000,
    maxPricePerCert: 24.00,
    minVintage: 2025,
    maxPerCounterparty: 200_000,
    deadline: '2026-04-30',
  })

  const [negotiations, setNegotiations] = useState<CounterpartyNegotiation[]>([])
  const [running, setRunning] = useState(false)
  const [report, setReport] = useState<ExecutionReport | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const startBulkNegotiation = useCallback(() => {
    setReport(null)
    setRunning(true)

    // Initialise all counterparties as queued
    const initial: CounterpartyNegotiation[] = COUNTERPARTIES.map(cp => ({
      ...cp,
      status: 'queued' as const,
      rounds: 0,
      priceFinal: null,
      startedAt: null,
      completedAt: null,
    }))
    setNegotiations(initial)

    // Sequentially process each counterparty with simulated delay
    let remaining = constraints.totalVolume
    let idx = 0
    const results: CounterpartyNegotiation[] = [...initial]

    const processNext = () => {
      if (idx >= results.length || remaining <= 0) {
        // Generate execution report
        const agreed = results.filter(r => r.status === 'agreed')
        const totalFilled = agreed.reduce((s, r) => s + r.volumeNegotiated, 0)
        const totalCost = agreed.reduce((s, r) => s + r.volumeNegotiated * (r.priceFinal ?? 0), 0)
        setReport({
          totalFilled,
          totalCost,
          vwap: totalFilled > 0 ? parseFloat((totalCost / totalFilled).toFixed(2)) : 0,
          spotAtExecution: SPOT_PRICE,
          counterparties: agreed.length,
          duration: `${agreed.length * 2}m ${Math.floor(Math.random() * 50)}s`,
          trades: agreed.map(r => ({
            counterparty: r.name,
            volume: r.volumeNegotiated,
            price: r.priceFinal!,
            status: 'Confirmed',
          })),
        })
        setRunning(false)
        return
      }

      // Mark current as negotiating
      results[idx] = { ...results[idx], status: 'negotiating', startedAt: new Date().toISOString() }
      setNegotiations([...results])

      // Simulate negotiation after delay
      timerRef.current = setTimeout(() => {
        results[idx] = simulateNegotiation(
          results[idx],
          constraints.maxPricePerCert,
          constraints.maxPerCounterparty,
          remaining,
        )
        if (results[idx].status === 'agreed') {
          remaining -= results[idx].volumeNegotiated
        }
        setNegotiations([...results])
        idx++
        processNext()
      }, 1200 + Math.random() * 800)
    }

    processNext()
  }, [constraints])

  // Derived metrics
  const totalFilled = negotiations.filter(n => n.status === 'agreed').reduce((s, n) => s + n.volumeNegotiated, 0)
  const pctFilled = constraints.totalVolume > 0 ? Math.round((totalFilled / constraints.totalVolume) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bloomberg-section-label text-slate-800">Bulk ESC Procurement</h2>
          <p className="text-xs text-slate-500">AI-negotiated acquisition across multiple counterparties (WP4 §6)</p>
        </div>
        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">SCENARIO E</span>
      </div>

      {/* Buyer Controls */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-slate-700 mb-3">Buyer Constraints</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Total Volume (ESCs)</label>
            <input
              type="number"
              value={constraints.totalVolume}
              onChange={e => setConstraints(p => ({ ...p, totalVolume: parseInt(e.target.value) || 0 }))}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-mono"
              disabled={running}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Max Price (A$/cert)</label>
            <input
              type="number"
              step="0.10"
              value={constraints.maxPricePerCert}
              onChange={e => setConstraints(p => ({ ...p, maxPricePerCert: parseFloat(e.target.value) || 0 }))}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-mono"
              disabled={running}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Min Vintage</label>
            <input
              type="number"
              value={constraints.minVintage}
              onChange={e => setConstraints(p => ({ ...p, minVintage: parseInt(e.target.value) || 2024 }))}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-mono"
              disabled={running}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Max Per Counterparty</label>
            <input
              type="number"
              value={constraints.maxPerCounterparty}
              onChange={e => setConstraints(p => ({ ...p, maxPerCounterparty: parseInt(e.target.value) || 0 }))}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-mono"
              disabled={running}
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Deadline</label>
            <input
              type="date"
              value={constraints.deadline}
              onChange={e => setConstraints(p => ({ ...p, deadline: e.target.value }))}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1"
              disabled={running}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={startBulkNegotiation}
            disabled={running}
            className={`px-4 py-2 text-xs font-medium rounded transition-colors ${
              running
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {running ? 'Negotiating...' : 'Start Bulk Negotiation'}
          </button>
          <span className="text-xs text-slate-500">
            ESC Spot: <span className="font-mono font-medium">A${SPOT_PRICE.toFixed(2)}</span> |
            Penalty: <span className="font-mono font-medium text-red-600">A$29.48</span>
          </span>
        </div>
      </div>

      {/* Progress Overview */}
      {negotiations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-700">Execution Progress</h3>
            <span className="text-xs font-mono text-slate-600">
              {totalFilled.toLocaleString()} / {constraints.totalVolume.toLocaleString()} ESCs ({pctFilled}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full mb-4">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${pctFilled}%` }}
            />
          </div>

          {/* Counterparty Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {negotiations.map(cp => {
              const statusConfig = {
                queued: { label: 'Queued', colour: 'bg-slate-100 text-slate-600' },
                negotiating: { label: 'Negotiating', colour: 'bg-blue-100 text-blue-700' },
                agreed: { label: 'Agreed', colour: 'bg-emerald-100 text-emerald-700' },
                rejected: { label: 'Rejected', colour: 'bg-red-100 text-red-700' },
                timeout: { label: 'Timeout', colour: 'bg-amber-100 text-amber-700' },
              }[cp.status]

              return (
                <div key={cp.id} className={`border rounded-lg p-3 ${
                  cp.status === 'negotiating' ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">{cp.name}</span>
                      <span className="text-[10px] font-mono bg-slate-100 px-1 rounded">{cp.riskRating}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusConfig.colour}`}>
                      {statusConfig.label}
                      {cp.status === 'negotiating' && <span className="ml-1 animate-pulse">...</span>}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <div><span className="text-slate-400">Available:</span> <span className="font-mono">{cp.availableVolume.toLocaleString()}</span></div>
                    <div><span className="text-slate-400">Offered:</span> <span className="font-mono">A${cp.priceOffered.toFixed(2)}</span></div>
                    {cp.status === 'agreed' && (
                      <>
                        <div><span className="text-slate-400">Filled:</span> <span className="font-mono text-emerald-700">{cp.volumeNegotiated.toLocaleString()}</span></div>
                        <div><span className="text-slate-400">Final:</span> <span className="font-mono text-emerald-700">A${cp.priceFinal?.toFixed(2)}</span></div>
                      </>
                    )}
                    {cp.rounds > 0 && (
                      <div><span className="text-slate-400">Rounds:</span> <span className="font-mono">{cp.rounds}</span></div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Execution Report */}
      {report && (
        <div className="bg-white border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-emerald-800">Execution Report</h3>
            <span className="text-[10px] text-slate-500">Duration: {report.duration}</span>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold font-mono text-slate-800">{report.totalFilled.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">ESCs Filled</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold font-mono text-slate-800">A${report.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-[10px] text-slate-500">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold font-mono text-blue-700">A${report.vwap.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500">VWAP Achieved</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold font-mono ${report.vwap <= report.spotAtExecution ? 'text-emerald-600' : 'text-red-600'}`}>
                {report.vwap <= report.spotAtExecution ? '-' : '+'}A${Math.abs(report.vwap - report.spotAtExecution).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500">vs Spot ({report.spotAtExecution.toFixed(2)})</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold font-mono text-slate-800">{report.counterparties}</div>
              <div className="text-[10px] text-slate-500">Counterparties</div>
            </div>
          </div>

          {/* Trade breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Counterparty</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">Volume</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">Price (A$)</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">Total (A$)</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.trades.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-1.5 text-slate-700">{t.counterparty}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{t.volume.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{t.price.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{(t.volume * t.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td className="px-3 py-1.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Compliance note */}
          <div className="mt-3 px-3 py-2 bg-slate-50 rounded text-[10px] text-slate-500">
            All certificates verified ESS-eligible, 2025+ vintage, registered in TESSA. Settlement via TESSA registry transfer.
            Simulated — Not Executable.
          </div>
        </div>
      )}
    </div>
  )
}
