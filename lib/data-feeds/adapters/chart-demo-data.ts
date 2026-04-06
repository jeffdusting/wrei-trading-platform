/**
 * Chart Demo Data Generator — produces realistic combined price history,
 * market volume estimates, and forecast data for chart display.
 *
 * Volume is estimated from public data sources:
 * - ESC: ~4.5M certificates created annually (IPART ESS reports)
 * - VEEC: ~6.2M certificates created annually (ESC Victoria)
 *
 * No private broker data or API connections are assumed.
 */

import { generatePriceHistory, PARAMS } from './simulation-engine'
import type { InstrumentType } from '@/lib/trading/instruments/types'
import type { ChartDataPoint, ChartMeta, CombinedChartData } from '@/components/charts/types'

// ---------------------------------------------------------------------------
// Public market volume parameters (from IPART/CER annual reports)
// ---------------------------------------------------------------------------

interface VolumeParams {
  annualCreation: number       // Total certificates created per year
  annualSurrender: number      // Total certificates surrendered per year
  weekdayWeight: number        // Fraction of volume on weekdays vs weekends
  volatilityFactor: number     // Daily volume variance (0-1)
  seasonalPeaks: number[]      // Months (1-12) with elevated surrender activity
}

const VOLUME_PARAMS: Partial<Record<InstrumentType, VolumeParams>> = {
  ESC: {
    annualCreation: 4_500_000,
    annualSurrender: 4_200_000,
    weekdayWeight: 0.95,
    volatilityFactor: 0.35,
    seasonalPeaks: [6, 12],    // ESS surrender deadlines June, December
  },
  VEEC: {
    annualCreation: 6_200_000,
    annualSurrender: 5_800_000,
    weekdayWeight: 0.93,
    volatilityFactor: 0.30,
    seasonalPeaks: [4, 10],    // VEU surrender deadlines April, October
  },
}

// ---------------------------------------------------------------------------
// Demo forecast data (matches ForecastPanel.tsx patterns)
// ---------------------------------------------------------------------------

interface DemoForecast {
  horizonWeeks: number
  priceForecast: number
  ci80: { lower: number; upper: number }
  ci95: { lower: number; upper: number }
  regimeProbabilities: Record<string, number>
}

const ESC_FORECASTS: DemoForecast[] = [
  { horizonWeeks: 1, priceForecast: 23.85, ci80: { lower: 23.10, upper: 24.60 }, ci95: { lower: 22.50, upper: 25.20 }, regimeProbabilities: { surplus: 0.25, balanced: 0.55, tightening: 0.20 } },
  { horizonWeeks: 4, priceForecast: 24.30, ci80: { lower: 22.80, upper: 25.80 }, ci95: { lower: 21.90, upper: 26.70 }, regimeProbabilities: { surplus: 0.25, balanced: 0.55, tightening: 0.20 } },
  { horizonWeeks: 12, priceForecast: 25.50, ci80: { lower: 22.00, upper: 29.00 }, ci95: { lower: 20.50, upper: 30.50 }, regimeProbabilities: { surplus: 0.20, balanced: 0.45, tightening: 0.35 } },
  { horizonWeeks: 26, priceForecast: 27.20, ci80: { lower: 21.00, upper: 33.40 }, ci95: { lower: 18.50, upper: 35.90 }, regimeProbabilities: { surplus: 0.15, balanced: 0.40, tightening: 0.45 } },
]

const VEEC_FORECASTS: DemoForecast[] = [
  { horizonWeeks: 1, priceForecast: 84.20, ci80: { lower: 82.50, upper: 85.90 }, ci95: { lower: 81.00, upper: 87.40 }, regimeProbabilities: { surplus: 0.30, balanced: 0.50, tightening: 0.20 } },
  { horizonWeeks: 4, priceForecast: 85.00, ci80: { lower: 80.50, upper: 89.50 }, ci95: { lower: 78.00, upper: 92.00 }, regimeProbabilities: { surplus: 0.30, balanced: 0.50, tightening: 0.20 } },
  { horizonWeeks: 12, priceForecast: 87.50, ci80: { lower: 76.00, upper: 99.00 }, ci95: { lower: 72.00, upper: 103.00 }, regimeProbabilities: { surplus: 0.25, balanced: 0.45, tightening: 0.30 } },
  { horizonWeeks: 26, priceForecast: 91.00, ci80: { lower: 72.00, upper: 110.00 }, ci95: { lower: 66.00, upper: 116.00 }, regimeProbabilities: { surplus: 0.20, balanced: 0.40, tightening: 0.40 } },
]

const DEMO_FORECASTS: Partial<Record<InstrumentType, DemoForecast[]>> = {
  ESC: ESC_FORECASTS,
  VEEC: VEEC_FORECASTS,
}

// ---------------------------------------------------------------------------
// Seeded PRNG for reproducible volume data
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

// ---------------------------------------------------------------------------
// Volume estimation from public parameters
// ---------------------------------------------------------------------------

function generateDailyVolume(
  instrument: InstrumentType,
  days: number,
  priceHistory: { date: string; price: number }[]
): { date: string; creationVolume: number; surrenderVolume: number; estimatedVolume: number }[] {
  const vp = VOLUME_PARAMS[instrument]
  if (!vp) {
    return priceHistory.map(p => ({
      date: p.date,
      creationVolume: 0,
      surrenderVolume: 0,
      estimatedVolume: 0,
    }))
  }

  const seed = instrument.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 7777 + days
  const rand = seededRandom(seed)

  const dailyCreation = vp.annualCreation / 260 // ~260 business days
  const dailySurrender = vp.annualSurrender / 260

  return priceHistory.map((p, i) => {
    const d = new Date(p.date)
    const dayOfWeek = d.getDay() // 0=Sun, 6=Sat
    const month = d.getMonth() + 1
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
    const isSurrenderPeak = vp.seasonalPeaks.includes(month)

    // Weekday/weekend weighting
    const weekdayMult = isWeekday ? 1.0 : (1 - vp.weekdayWeight) * 0.5

    // Random daily variance
    const creationNoise = 1 + (rand() - 0.5) * 2 * vp.volatilityFactor
    const surrenderNoise = 1 + (rand() - 0.5) * 2 * vp.volatilityFactor

    // Price volatility correlation — larger price moves = higher activity
    const priceChange = i > 0 ? Math.abs(p.price - priceHistory[i - 1].price) / priceHistory[i - 1].price : 0
    const volatilityBoost = 1 + priceChange * 5

    // Seasonal surrender spike
    const surrenderSeasonal = isSurrenderPeak ? 1.6 : 1.0

    const creation = Math.round(dailyCreation * weekdayMult * creationNoise * volatilityBoost)
    const surrender = Math.round(dailySurrender * weekdayMult * surrenderNoise * surrenderSeasonal * volatilityBoost)

    return {
      date: p.date,
      creationVolume: Math.max(0, creation),
      surrenderVolume: Math.max(0, surrender),
      estimatedVolume: Math.max(0, creation + surrender),
    }
  })
}

// ---------------------------------------------------------------------------
// Historical forecast overlay — past predictions vs actual outcomes
// ---------------------------------------------------------------------------

/**
 * Overlay historical forecast tracks onto the price series.
 * Simulates what the model would have predicted at 3 past origin dates,
 * each projecting 4 weeks forward. The predicted price diverges from
 * actual by ~3.6% MAPE (matching measured model accuracy).
 *
 * Each track is an interpolated line segment from (originDate, actualPrice)
 * to (targetDate, predictedPrice) so Recharts renders a visible segment.
 */
function overlayHistoricalForecasts(
  series: ChartDataPoint[],
  instrument: InstrumentType,
  days: number
): void {
  const historicalPoints = series.filter(d => !d.isForecast && d.price != null)
  if (historicalPoints.length < 56) return // Need at least 8 weeks of history

  const seed = instrument.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 3333
  const rand = seededRandom(seed)

  // 3 forecast tracks, origins spaced ~4 weeks apart from the end
  const trackConfigs = [
    { originOffset: 28, field: 'histForecast1' as const },  // 4 weeks ago
    { originOffset: 56, field: 'histForecast2' as const },  // 8 weeks ago
    { originOffset: 84, field: 'histForecast3' as const },  // 12 weeks ago
  ]

  for (const track of trackConfigs) {
    const originIdx = historicalPoints.length - 1 - track.originOffset
    const targetIdx = originIdx + 28 // 4 weeks forward from origin
    if (originIdx < 0 || targetIdx >= historicalPoints.length) continue

    const originPrice = historicalPoints[originIdx].price!
    const actualTargetPrice = historicalPoints[targetIdx].price!

    // Simulated prediction error: ~3.6% MAPE with slight directional bias
    const errorPct = (rand() - 0.45) * 0.072 // centered slightly above 0, range ±3.6%
    const predictedPrice = actualTargetPrice * (1 + errorPct)

    // Interpolate daily values along the segment
    for (let i = originIdx; i <= targetIdx; i++) {
      const t = (i - originIdx) / (targetIdx - originIdx) // 0 to 1
      const interpolated = originPrice + t * (predictedPrice - originPrice)
      const point = historicalPoints[i]
      // Find matching point in the full series by date
      const seriesPoint = series.find(s => s.date === point.date)
      if (seriesPoint) {
        seriesPoint[track.field] = Math.round(interpolated * 100) / 100
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate combined chart data (price + volume + forecast) for an instrument.
 * Uses simulation engine for prices and public market parameters for volume.
 * No private data sources or API connections required.
 */
export function generateCombinedChartData(
  instrument: InstrumentType,
  days: number = 90
): CombinedChartData {
  const simParams = PARAMS[instrument]

  // Generate price history from simulation engine
  const rawHistory = generatePriceHistory(instrument, days)
  const priceHistory = rawHistory.map(h => ({
    date: h.timestamp.slice(0, 10),
    price: h.price,
  }))

  // Generate volume estimates from public parameters
  const volumeData = generateDailyVolume(instrument, days, priceHistory)

  // Build historical series
  const series: ChartDataPoint[] = priceHistory.map((p, i) => ({
    date: p.date,
    price: p.price,
    creationVolume: volumeData[i]?.creationVolume ?? 0,
    surrenderVolume: volumeData[i]?.surrenderVolume ?? 0,
    estimatedVolume: volumeData[i]?.estimatedVolume ?? 0,
    isForecast: false,
  }))

  // Overlay historical forecast tracks (what the model predicted in the past)
  overlayHistoricalForecasts(series, instrument, days)

  // Append forecast points
  const forecasts = DEMO_FORECASTS[instrument]
  if (forecasts) {
    const now = new Date()
    for (const fc of forecasts) {
      const futureDate = new Date(now)
      futureDate.setDate(futureDate.getDate() + fc.horizonWeeks * 7)
      series.push({
        date: futureDate.toISOString().slice(0, 10),
        forecast: fc.priceForecast,
        forecastLow80: fc.ci80.lower,
        forecastHigh80: fc.ci80.upper,
        forecastLow95: fc.ci95.lower,
        forecastHigh95: fc.ci95.upper,
        isForecast: true,
      })
    }
  }

  // Current spot is the last historical price
  const lastPrice = priceHistory[priceHistory.length - 1]?.price ?? simParams.spot
  const prevPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : lastPrice
  const change = lastPrice - prevPrice
  const changePct = prevPrice > 0 ? (change / prevPrice) * 100 : 0

  const regimeProbs = forecasts?.[0]?.regimeProbabilities ?? {}

  const meta: ChartMeta = {
    instrument,
    currency: simParams.currency,
    currentSpot: Math.round(lastPrice * 100) / 100,
    priceChange24h: Math.round(change * 100) / 100,
    priceChangePct: Math.round(changePct * 100) / 100,
    modelVersion: '1.0.0 (demo)',
    forecastGeneratedAt: new Date().toISOString(),
    regimeProbabilities: regimeProbs,
  }

  return { meta, series }
}
