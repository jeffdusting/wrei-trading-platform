'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface WREIBarChartProps {
  data: any[]
  xDataKey: string
  yDataKey: string
  title?: string
  height?: number
  showLegend?: boolean
  color?: string
  formatXLabel?: (value: any) => string
  formatYLabel?: (value: any) => string
  formatTooltip?: (value: any, name?: any) => [string, string]
  horizontal?: boolean
}

const WREIBarChart: React.FC<WREIBarChartProps> = ({
  data,
  xDataKey,
  yDataKey,
  title,
  height = 300,
  showLegend = true,
  color = '#0EA5E9',
  formatXLabel,
  formatYLabel,
  formatTooltip,
  horizontal = false
}) => {
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `A$${(value / 1_000_000_000).toFixed(1)}B`
    } else if (value >= 1_000_000) {
      return `A$${(value / 1_000_000).toFixed(1)}M`
    } else if (value >= 1_000) {
      return `A$${(value / 1_000).toFixed(1)}K`
    } else {
      return `A$${value.toFixed(2)}`
    }
  }

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const defaultFormatTooltip = (value: any, name?: any): [string, string] => {
    if (typeof value === 'number') {
      // Check if it's a percentage (decimal between 0 and 1)
      if (value >= 0 && value <= 1 && value !== Math.floor(value)) {
        return [formatPercentage(value), String(name || '')]
      }
      // Check if it's likely a currency value (large numbers)
      if (value > 100) {
        return [formatCurrency(value), String(name || '')]
      }
      // Default to 2 decimal places
      return [value.toFixed(2), String(name || '')]
    }
    return [String(value), String(name || '')]
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      {title && (
        <h3 className="bloomberg-card-title text-[#1E293B] mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          layout={horizontal ? 'horizontal' : 'vertical'}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            type={horizontal ? 'number' : 'category'}
            dataKey={horizontal ? yDataKey : xDataKey}
            stroke="#64748B"
            fontSize={12}
            tickFormatter={horizontal ? formatYLabel : formatXLabel}
          />
          <YAxis
            type={horizontal ? 'category' : 'number'}
            dataKey={horizontal ? xDataKey : yDataKey}
            stroke="#64748B"
            fontSize={12}
            tickFormatter={horizontal ? formatXLabel : formatYLabel}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#1E293B'
            }}
            labelStyle={{ color: '#64748B' }}
            formatter={formatTooltip || defaultFormatTooltip}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#64748B' }}
            />
          )}
          <Bar
            dataKey={yDataKey}
            fill={color}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WREIBarChart