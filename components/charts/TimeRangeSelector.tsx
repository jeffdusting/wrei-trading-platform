'use client'

import { FC } from 'react'
import type { TimeRange } from './types'

const RANGES: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL']

interface TimeRangeSelectorProps {
  selected: TimeRange
  onChange: (range: TimeRange) => void
}

const TimeRangeSelector: FC<TimeRangeSelectorProps> = ({ selected, onChange }) => (
  <div className="flex gap-1">
    {RANGES.map(range => {
      const isActive = range === selected
      return (
        <button
          key={range}
          onClick={() => onChange(range)}
          className="px-2.5 py-1 text-xs font-medium rounded transition-colors"
          style={{
            backgroundColor: isActive ? '#1E293B' : 'transparent',
            color: isActive ? '#FFFFFF' : '#64748B',
          }}
        >
          {range}
        </button>
      )
    })}
  </div>
)

export default TimeRangeSelector
