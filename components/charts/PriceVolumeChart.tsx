'use client'

import { FC, useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import PriceChartTooltip from './PriceChartTooltip'
import type { ChartDataPoint } from './types'

interface PriceVolumeChartProps {
  data: ChartDataPoint[]
  instrument: string
  currency?: string
  height?: number
  showForecast?: boolean
  showVolume?: boolean
  showHistoricalForecasts?: boolean
}

const HIST_FORECAST_COLOR = '#F59E0B' // amber — distinguishes from blue price/forecast

const PriceVolumeChart: FC<PriceVolumeChartProps> = ({
  data,
  instrument,
  currency = 'AUD',
  height = 420,
  showForecast = true,
  showVolume = true,
  showHistoricalForecasts = false,
}) => {
  const prefix = currency === 'AUD' ? 'A$' : '$'

  // Find the boundary between historical and forecast data
  const nowDate = useMemo(() => {
    const lastHistorical = [...data].reverse().find(d => !d.isForecast)
    return lastHistorical?.date ?? ''
  }, [data])

  // Compute Y-axis domains
  const { priceDomain, volumeDomain } = useMemo(() => {
    const prices: number[] = []
    const volumes: number[] = []

    for (const d of data) {
      if (d.price != null) prices.push(d.price)
      if (d.forecast != null) prices.push(d.forecast)
      if (d.forecastHigh95 != null) prices.push(d.forecastHigh95)
      if (d.forecastLow95 != null) prices.push(d.forecastLow95)
      if (showHistoricalForecasts) {
        if (d.histForecast1 != null) prices.push(d.histForecast1)
        if (d.histForecast2 != null) prices.push(d.histForecast2)
        if (d.histForecast3 != null) prices.push(d.histForecast3)
      }
      if (d.creationVolume != null) volumes.push(d.creationVolume)
      if (d.surrenderVolume != null) volumes.push(d.surrenderVolume)
    }

    const minPrice = prices.length > 0 ? Math.min(...prices) * 0.95 : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.05 : 100
    const maxVol = volumes.length > 0 ? Math.max(...volumes) : 1

    return {
      priceDomain: [Math.floor(minPrice * 10) / 10, Math.ceil(maxPrice * 10) / 10] as [number, number],
      // Scale volume axis so bars occupy bottom ~25% of chart
      volumeDomain: [0, maxVol * 4] as [number, number],
    }
  }, [data, showHistoricalForecasts])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  }

  const formatPrice = (value: number) => `${prefix}${value.toFixed(2)}`

  const formatVolume = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return String(value)
  }

  // Determine X-axis tick interval based on data length
  const tickInterval = data.length > 180 ? 29 : data.length > 90 ? 13 : data.length > 30 ? 6 : 1

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 flex items-center justify-center" style={{ height }}>
        <span className="text-sm text-slate-400">No chart data available for {instrument}</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />

          {/* X Axis — shared by all series */}
          <XAxis
            dataKey="date"
            stroke="#94A3B8"
            fontSize={10}
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            tickFormatter={formatDate}
            interval={tickInterval}
            tickLine={false}
          />

          {/* Left Y Axis — Price */}
          <YAxis
            yAxisId="price"
            orientation="left"
            domain={priceDomain}
            stroke="#94A3B8"
            fontSize={10}
            fontFamily="ui-monospace, SFMono-Regular, monospace"
            tickFormatter={formatPrice}
            tickLine={false}
            axisLine={false}
            width={65}
          />

          {/* Right Y Axis — Volume (hidden label, scaled) */}
          {showVolume && (
            <YAxis
              yAxisId="volume"
              orientation="right"
              domain={volumeDomain}
              stroke="#94A3B8"
              fontSize={10}
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              tickFormatter={formatVolume}
              tickLine={false}
              axisLine={false}
              width={50}
            />
          )}

          {/* Tooltip */}
          <Tooltip
            content={<PriceChartTooltip currency={currency} />}
            cursor={{ stroke: '#CBD5E1', strokeDasharray: '3 3' }}
          />

          {/* "NOW" reference line */}
          {nowDate && showForecast && (
            <ReferenceLine
              yAxisId="price"
              x={nowDate}
              stroke="#64748B"
              strokeDasharray="4 4"
              label={{
                value: 'NOW',
                position: 'top',
                fill: '#64748B',
                fontSize: 10,
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontWeight: 600,
              }}
            />
          )}

          {/* --- Volume bars (bottom layer) --- */}
          {showVolume && (
            <>
              <Bar
                yAxisId="volume"
                dataKey="creationVolume"
                fill="#10B981"
                opacity={0.35}
                barSize={3}
                isAnimationActive={false}
              />
              <Bar
                yAxisId="volume"
                dataKey="surrenderVolume"
                fill="#F59E0B"
                opacity={0.35}
                barSize={3}
                isAnimationActive={false}
              />
            </>
          )}

          {/* --- Forecast CI bands (before forecast line so line draws on top) --- */}
          {showForecast && (
            <>
              <Area
                yAxisId="price"
                dataKey="forecastHigh95"
                stroke="none"
                fill="#DBEAFE"
                fillOpacity={0.4}
                isAnimationActive={false}
                connectNulls={false}
              />
              <Area
                yAxisId="price"
                dataKey="forecastLow95"
                stroke="none"
                fill="#FFFFFF"
                fillOpacity={1}
                isAnimationActive={false}
                connectNulls={false}
              />
              <Area
                yAxisId="price"
                dataKey="forecastHigh80"
                stroke="none"
                fill="#93C5FD"
                fillOpacity={0.4}
                isAnimationActive={false}
                connectNulls={false}
              />
              <Area
                yAxisId="price"
                dataKey="forecastLow80"
                stroke="none"
                fill="#FFFFFF"
                fillOpacity={1}
                isAnimationActive={false}
                connectNulls={false}
              />
            </>
          )}

          {/* --- Historical price line --- */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#0EA5E9"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#0EA5E9', stroke: '#FFF', strokeWidth: 2 }}
            connectNulls={false}
            isAnimationActive={false}
          />

          {/* --- Historical forecast tracks (amber dashed segments) --- */}
          {showHistoricalForecasts && (
            <>
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="histForecast1"
                name="Predicted (4w ago)"
                stroke={HIST_FORECAST_COLOR}
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                opacity={0.8}
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="histForecast2"
                name="Predicted (8w ago)"
                stroke={HIST_FORECAST_COLOR}
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                opacity={0.6}
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="histForecast3"
                name="Predicted (12w ago)"
                stroke={HIST_FORECAST_COLOR}
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                opacity={0.4}
              />
            </>
          )}

          {/* --- Forecast centre line (dashed) --- */}
          {showForecast && (
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="forecast"
              stroke="#2563EB"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ r: 3, fill: '#2563EB', stroke: '#FFF', strokeWidth: 1 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}

          {/* Legend */}
          <Legend
            verticalAlign="bottom"
            height={28}
            wrapperStyle={{ fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PriceVolumeChart
