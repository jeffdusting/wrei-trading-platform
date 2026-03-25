'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface WREIPieChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  title?: string
  height?: number
  showLegend?: boolean
  colors?: string[]
  innerRadius?: number
  outerRadius?: number
  formatTooltip?: (value: any, name?: any) => [string, string]
}

const DEFAULT_COLORS = [
  '#0EA5E9', // Primary teal
  '#10B981', // Success green
  '#F59E0B', // Warning amber
  '#EF4444', // Error red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1'  // Indigo
]

const WREIPieChart: React.FC<WREIPieChartProps> = ({
  data,
  dataKey,
  nameKey,
  title,
  height = 300,
  showLegend = true,
  colors = DEFAULT_COLORS,
  innerRadius = 0,
  outerRadius = 80,
  formatTooltip
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
    return `${value.toFixed(1)}%`
  }

  const defaultFormatTooltip = (value: any, name?: any): [string, string] => {
    if (typeof value === 'number') {
      // For pie charts, typically show both value and percentage
      const total = data.reduce((sum, item) => sum + item[dataKey], 0)
      const percentage = (value / total) * 100

      let formattedValue: string
      if (value > 100) {
        formattedValue = formatCurrency(value)
      } else {
        formattedValue = value.toFixed(2)
      }

      return [`${formattedValue} (${formatPercentage(percentage)})`, String(name || '')]
    }
    return [String(value), String(name || '')]
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? ( // Only show label if slice is > 5%
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      {title && (
        <h3 className="text-lg font-semibold text-[#1E293B] mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#1E293B'
            }}
            formatter={formatTooltip || defaultFormatTooltip}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#64748B' }}
              formatter={(value: string) => (
                <span style={{ color: '#64748B' }}>{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WREIPieChart