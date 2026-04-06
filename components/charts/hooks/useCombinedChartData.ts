import { useState, useEffect, useCallback } from 'react'
import type { CombinedChartData, ChartDataPoint, ChartMeta } from '../types'

interface UseCombinedChartDataResult {
  series: ChartDataPoint[]
  meta: ChartMeta | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const EMPTY_META: ChartMeta = {
  instrument: '',
  currency: 'AUD',
  currentSpot: 0,
  priceChange24h: 0,
  priceChangePct: 0,
}

export function useCombinedChartData(
  instrument: string,
  days: number
): UseCombinedChartDataResult {
  const [series, setSeries] = useState<ChartDataPoint[]>([])
  const [meta, setMeta] = useState<ChartMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(
        `/api/v1/market/chart-data?instrument=${encodeURIComponent(instrument)}&days=${days}`
      )
      if (!resp.ok) {
        throw new Error(`API returned ${resp.status}`)
      }
      const json = await resp.json()
      const data: CombinedChartData = json.data
      if (data?.series?.length > 0) {
        setSeries(data.series)
        setMeta(data.meta)
      } else {
        setSeries([])
        setMeta(EMPTY_META)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
      setSeries([])
      setMeta(null)
    } finally {
      setLoading(false)
    }
  }, [instrument, days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { series, meta, loading, error, refresh: fetchData }
}
