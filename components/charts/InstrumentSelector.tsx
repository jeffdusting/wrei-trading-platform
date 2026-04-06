'use client'

import { FC } from 'react'

const INSTRUMENT_LABELS: Record<string, string> = {
  ESC: 'ESC',
  VEEC: 'VEEC',
  PRC: 'PRC',
  ACCU: 'ACCU',
  LGC: 'LGC',
  STC: 'STC',
  WREI_CC: 'WREI-CC',
  WREI_ACO: 'WREI-ACO',
}

interface InstrumentSelectorProps {
  instruments: string[]
  selected: string
  onChange: (instrument: string) => void
}

const InstrumentSelector: FC<InstrumentSelectorProps> = ({ instruments, selected, onChange }) => (
  <div className="flex gap-1">
    {instruments.map(inst => {
      const isActive = inst === selected
      return (
        <button
          key={inst}
          onClick={() => onChange(inst)}
          className="px-3 py-1.5 text-xs font-semibold rounded transition-colors"
          style={{
            backgroundColor: isActive ? '#2563EB' : '#F1F5F9',
            color: isActive ? '#FFFFFF' : '#475569',
          }}
        >
          {INSTRUMENT_LABELS[inst] ?? inst}
        </button>
      )
    })}
  </div>
)

export default InstrumentSelector
