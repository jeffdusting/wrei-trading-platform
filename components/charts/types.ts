/**
 * Shared types for price history, volume, and forecast chart components.
 */

export interface ChartDataPoint {
  date: string                     // ISO date "2026-04-05"
  price?: number                   // Historical closing price (AUD)
  estimatedVolume?: number         // Estimated market-wide daily volume (certificates)
  creationVolume?: number          // ESC/VEEC creation volume (public data)
  surrenderVolume?: number         // ESC/VEEC surrender volume (public data)
  forecast?: number                // Forecast centre price
  forecastLow80?: number           // 80% CI lower bound
  forecastHigh80?: number          // 80% CI upper bound
  forecastLow95?: number           // 95% CI lower bound
  forecastHigh95?: number          // 95% CI upper bound
  isForecast: boolean              // true for future data points
  // Historical forecast tracks — what the model predicted for this date in the past
  histForecast1?: number           // Forecast made ~4 weeks before this date
  histForecast2?: number           // Forecast made ~8 weeks before this date
  histForecast3?: number           // Forecast made ~12 weeks before this date
}

export interface ChartMeta {
  instrument: string
  currency: string
  currentSpot: number
  priceChange24h: number
  priceChangePct: number
  modelVersion?: string
  forecastGeneratedAt?: string
  regimeProbabilities?: Record<string, number>
}

export interface CombinedChartData {
  meta: ChartMeta
  series: ChartDataPoint[]
}

export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  'ALL': 365,
}

/** Instruments available for charting (ESC/VEEC initially, extensible) */
export const CHART_INSTRUMENTS = ['ESC', 'VEEC'] as const
export type ChartInstrument = (typeof CHART_INSTRUMENTS)[number]
