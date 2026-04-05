'use client'

/**
 * Settlement Instructions — displays TESSA/VEEC transfer instructions
 * as a formatted, printable document with checklist and status tracking.
 */

import { useState, useEffect } from 'react'
import type {
  TransferInstructions,
  SettlementTracking,
  SettlementTrackingStatus,
} from '@/lib/correspondence/settlement-facilitation'
import {
  seedDemoSettlements,
  getAllSettlementTrackings,
  getDaysSinceInitiation,
} from '@/lib/correspondence/settlement-facilitation'

// ---------------------------------------------------------------------------
// Settlement Timer
// ---------------------------------------------------------------------------

function SettlementTimer({ tracking }: { tracking: SettlementTracking }) {
  const daysSince = getDaysSinceInitiation(tracking)
  const isOverdue = daysSince > tracking.expectedCompletionDays && tracking.status !== 'complete'
  const isComplete = tracking.status === 'complete'

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          isComplete ? 'bg-emerald-500' : isOverdue ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
        }`}
      />
      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}>
        {isComplete
          ? 'Complete'
          : isOverdue
            ? `Overdue — ${daysSince}d (expected ${tracking.expectedCompletionDays}d)`
            : `Day ${daysSince} of ${tracking.expectedCompletionDays}`}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<SettlementTrackingStatus, string> = {
  instructions_generated: 'Instructions Generated',
  transferred: 'Transfer Initiated',
  confirmed: 'Counterparty Confirmed',
  complete: 'Complete',
}

const STATUS_COLOURS: Record<SettlementTrackingStatus, string> = {
  instructions_generated: 'bg-blue-100 text-blue-700',
  transferred: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  complete: 'bg-emerald-100 text-emerald-800',
}

function StatusBadge({ status }: { status: SettlementTrackingStatus }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOURS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Instruction Document View
// ---------------------------------------------------------------------------

function InstructionDocument({
  instructions,
  onClose,
}: {
  instructions: TransferInstructions
  onClose: () => void
}) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)

  const toggleStep = (n: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  const copyToClipboard = () => {
    const text = [
      instructions.title,
      '═'.repeat(50),
      '',
      `Registry: ${instructions.registry}`,
      `URL: ${instructions.registryUrl}`,
      `Trade Reference: ${instructions.tradeReference}`,
      `Instrument: ${instructions.instrument}`,
      `Quantity: ${instructions.quantity.toLocaleString()}`,
      `Price: A$${instructions.pricePerUnit.toFixed(2)}/unit`,
      `Total: A$${instructions.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      '',
      `Seller Account: ${instructions.sellerAccount}`,
      `Buyer Account: ${instructions.buyerAccount}`,
      '',
      'Steps:',
      ...instructions.steps.map(s => `${s.number}. ${s.instruction}${s.detail ? `\n   ${s.detail}` : ''}`),
      '',
      instructions.expectedTimeline,
      '',
      'Notes:',
      ...instructions.notes.map(n => `• ${n}`),
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const currencySymbol = instructions.currency === 'AUD' ? 'A$' : 'US$'

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{instructions.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{instructions.registry}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
        </div>
      </div>

      {/* Trade Summary */}
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Instrument:</span>{' '}
            <span className="font-medium text-slate-800">{instructions.instrument}</span>
          </div>
          <div>
            <span className="text-slate-500">Quantity:</span>{' '}
            <span className="font-medium text-slate-800">{instructions.quantity.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500">Price:</span>{' '}
            <span className="font-medium text-slate-800">{currencySymbol}{instructions.pricePerUnit.toFixed(2)}/unit</span>
          </div>
          <div>
            <span className="text-slate-500">Total:</span>{' '}
            <span className="font-semibold text-slate-800">
              {currencySymbol}{instructions.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Seller Account:</span>{' '}
            <span className="font-mono text-slate-700">{instructions.sellerAccount}</span>
          </div>
          <div>
            <span className="text-slate-500">Buyer Account:</span>{' '}
            <span className="font-mono text-slate-700">{instructions.buyerAccount}</span>
          </div>
        </div>
      </div>

      {/* Steps Checklist */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-3">Transfer Steps</h4>
        <div className="space-y-3">
          {instructions.steps.map(step => (
            <label
              key={step.number}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={checkedSteps.has(step.number)}
                onChange={() => toggleStep(step.number)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className={checkedSteps.has(step.number) ? 'opacity-60' : ''}>
                <div className="text-xs font-medium text-slate-800">
                  {step.number}. {step.instruction}
                </div>
                {step.detail && (
                  <div className="text-[11px] text-slate-500 mt-0.5">{step.detail}</div>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{checkedSteps.size} of {instructions.steps.length} steps completed</span>
            <span>{instructions.expectedTimeline}</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(checkedSteps.size / instructions.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      {instructions.notes.length > 0 && (
        <div className="p-4 border-t border-slate-100 bg-amber-50">
          <h4 className="text-xs font-semibold text-amber-800 mb-2">Notes</h4>
          <ul className="space-y-1">
            {instructions.notes.map((note, i) => (
              <li key={i} className="text-[11px] text-amber-700 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SettlementInstructions() {
  const [settlements, setSettlements] = useState<SettlementTracking[]>([])
  const [selectedInstructions, setSelectedInstructions] = useState<TransferInstructions | null>(null)

  useEffect(() => {
    // Seed demo data if empty
    const existing = getAllSettlementTrackings()
    if (existing.length === 0) {
      seedDemoSettlements()
    }
    setSettlements(getAllSettlementTrackings())
  }, [])

  const overdueCount = settlements.filter(s => {
    if (s.status === 'complete') return false
    return getDaysSinceInitiation(s) > s.expectedCompletionDays
  }).length

  const pendingCount = settlements.filter(s => s.status !== 'complete').length

  // Generate instructions on-the-fly for demo viewing
  const viewInstructions = (tracking: SettlementTracking) => {
    const { generateTESSAInstructions, generateVEECInstructions } = require('@/lib/correspondence/settlement-facilitation')
    const demoTrade = {
      tradeDate: tracking.instructionsGeneratedAt.split('T')[0],
      settlementDate: tracking.instructionsGeneratedAt.split('T')[0],
      instrument: tracking.instrument,
      quantity: tracking.quantity,
      pricePerUnit: tracking.instrument === 'VEEC' ? 58.50 : 29.00,
      totalConsideration: tracking.quantity * (tracking.instrument === 'VEEC' ? 58.50 : 29.00),
      currency: 'AUD' as const,
      buyerName: tracking.counterpartyName,
      buyerEntity: `ACC-${tracking.counterpartyName.replace(/\s/g, '').slice(0, 8).toUpperCase()}`,
      sellerName: 'WREI Broker',
      sellerEntity: 'WREI-BROKER-001',
      settlementMethod: tracking.registry === 'TESSA' ? 'TESSA Registry Transfer' : 'VEU Registry Transfer',
      registryReference: null,
      specialConditions: [],
      threadId: tracking.threadId,
    }

    const instructions = tracking.registry === 'VEU'
      ? generateVEECInstructions(demoTrade)
      : generateTESSAInstructions(demoTrade)
    setSelectedInstructions(instructions)
  }

  if (selectedInstructions) {
    return (
      <InstructionDocument
        instructions={selectedInstructions}
        onClose={() => setSelectedInstructions(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">Active Settlements</div>
          <div className="text-xl font-semibold text-slate-800">{pendingCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">Overdue</div>
          <div className={`text-xl font-semibold ${overdueCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {overdueCount}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 mb-1">Completed</div>
          <div className="text-xl font-semibold text-emerald-600">
            {settlements.filter(s => s.status === 'complete').length}
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xs font-semibold text-slate-700">Settlement Tracking</h3>
        </div>

        {settlements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active settlements. Settlements appear here when trade confirmations are completed.
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="text-left px-4 py-2 font-medium">Counterparty</th>
                <th className="text-left px-4 py-2 font-medium">Instrument</th>
                <th className="text-right px-4 py-2 font-medium">Qty</th>
                <th className="text-left px-4 py-2 font-medium">Registry</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Timeline</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{s.counterpartyName}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {s.instrument}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                    {s.quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{s.registry}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <SettlementTimer tracking={s} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => viewInstructions(s)}
                        className="px-2 py-1 text-[10px] font-medium border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                      >
                        View
                      </button>
                      {s.status !== 'complete' && s.followUpsSent > 0 && (
                        <span className="text-[10px] text-slate-400" title="Follow-ups sent">
                          {s.followUpsSent} follow-up{s.followUpsSent !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
