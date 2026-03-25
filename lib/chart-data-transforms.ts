/**
 * Chart Data Transformers
 *
 * Functions to convert existing data structures into Recharts-compatible formats
 */

// Transform market data from market-intelligence.ts into time series format for line charts
export function transformMarketDataToTimeSeries(marketData: any): any[] {
  if (!marketData || !Array.isArray(marketData)) {
    return []
  }

  return marketData.map((item: any) => ({
    date: item.date || item.timestamp || item.time,
    price: item.price || item.value || item.carbon_price || 0,
    volume: item.volume || item.trading_volume || 0,
    market_cap: item.market_cap || item.marketCap || 0
  }))
}

// Transform portfolio data from professional-analytics.ts into allocation format for pie charts
export function transformPortfolioToAllocation(portfolioData: any): any[] {
  if (!portfolioData || typeof portfolioData !== 'object') {
    return []
  }

  // Handle different portfolio data structures
  if (portfolioData.allocation && Array.isArray(portfolioData.allocation)) {
    return portfolioData.allocation.map((item: any) => ({
      name: item.asset_class || item.name || item.category,
      value: item.allocation_percent || item.percentage || item.weight || 0,
      amount: item.amount || item.value || 0
    }))
  }

  if (portfolioData.assets && Array.isArray(portfolioData.assets)) {
    return portfolioData.assets.map((asset: any) => ({
      name: asset.name || asset.type || asset.asset_class,
      value: asset.weight || asset.allocation || asset.percentage || 0,
      amount: asset.value || asset.amount || 0
    }))
  }

  // Transform object-based allocation data
  const allocationEntries = Object.entries(portfolioData).filter(([key, value]) =>
    typeof value === 'number' && key !== 'total'
  )

  return allocationEntries.map(([key, value]: [string, any]) => ({
    name: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
    value: value as number,
    amount: value as number
  }))
}

// Transform performance data from performance-monitor.ts into metrics format for bar charts
export function transformPerformanceToMetrics(performanceData: any): any[] {
  if (!performanceData || typeof performanceData !== 'object') {
    return []
  }

  const metrics = []

  // API response times
  if (performanceData.api_metrics) {
    metrics.push({
      metric: 'API Response Time',
      value: performanceData.api_metrics.average_response_time || 0,
      target: 500, // 500ms target
      unit: 'ms'
    })
  }

  // System metrics
  if (performanceData.system_metrics) {
    metrics.push(
      {
        metric: 'CPU Usage',
        value: performanceData.system_metrics.cpu_usage || 0,
        target: 0.7, // 70% target
        unit: 'percent'
      },
      {
        metric: 'Memory Usage',
        value: performanceData.system_metrics.memory_usage || 0,
        target: 0.8, // 80% target
        unit: 'percent'
      }
    )
  }

  // Trading metrics
  if (performanceData.trading_metrics) {
    metrics.push({
      metric: 'Success Rate',
      value: performanceData.trading_metrics.success_rate || 0,
      target: 0.95, // 95% target
      unit: 'percent'
    })
  }

  return metrics
}

// Transform yield comparison data from yield-models.ts for comparative charts
export function transformYieldComparisonData(yieldData: any): any[] {
  if (!yieldData || typeof yieldData !== 'object') {
    return []
  }

  const comparisons = []

  // WREI yields
  if (yieldData.wrei_yields) {
    comparisons.push({
      category: 'WREI Carbon Credits',
      yield: yieldData.wrei_yields.base_yield || 0,
      risk_adjusted: yieldData.wrei_yields.risk_adjusted_yield || 0,
      projected: yieldData.wrei_yields.projected_yield || 0
    })
  }

  // Traditional yields for comparison
  if (yieldData.traditional_yields) {
    comparisons.push({
      category: 'Traditional Bonds',
      yield: yieldData.traditional_yields.government_bonds || 0,
      risk_adjusted: yieldData.traditional_yields.corporate_bonds || 0,
      projected: yieldData.traditional_yields.high_yield || 0
    })
  }

  // Alternative investments
  if (yieldData.alternative_yields) {
    comparisons.push({
      category: 'Alternative Assets',
      yield: yieldData.alternative_yields.real_estate || 0,
      risk_adjusted: yieldData.alternative_yields.infrastructure || 0,
      projected: yieldData.alternative_yields.commodities || 0
    })
  }

  return comparisons
}

// Transform pricing trends for area charts
export function transformPricingTrends(pricingData: any): any[] {
  if (!pricingData || !Array.isArray(pricingData)) {
    return []
  }

  return pricingData.map((item: any) => ({
    date: item.date || item.timestamp,
    spot_price: item.spot_price || item.current_price || 0,
    forward_price: item.forward_price || item.projected_price || 0,
    volume: item.trading_volume || item.volume || 0
  }))
}

// Transform risk metrics for radar charts (future enhancement)
export function transformRiskMetrics(riskData: any): any[] {
  if (!riskData || typeof riskData !== 'object') {
    return []
  }

  return [
    {
      metric: 'Credit Risk',
      value: riskData.credit_risk || 0,
      fullMark: 10
    },
    {
      metric: 'Market Risk',
      value: riskData.market_risk || 0,
      fullMark: 10
    },
    {
      metric: 'Liquidity Risk',
      value: riskData.liquidity_risk || 0,
      fullMark: 10
    },
    {
      metric: 'Operational Risk',
      value: riskData.operational_risk || 0,
      fullMark: 10
    },
    {
      metric: 'ESG Risk',
      value: riskData.esg_risk || 0,
      fullMark: 10
    }
  ]
}

// Helper function to generate mock time series data for development
export function generateMockTimeSeries(
  points: number = 30,
  startValue: number = 100,
  volatility: number = 0.1
): any[] {
  const data = []
  let value = startValue
  const now = new Date()

  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000) // Daily data
    const change = (Math.random() - 0.5) * 2 * volatility
    value = value * (1 + change)

    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(0, value),
      volume: Math.floor(Math.random() * 1000000) + 100000
    })
  }

  return data
}

// Helper function to generate mock allocation data
export function generateMockAllocation(): any[] {
  return [
    { name: 'Carbon Credits', value: 35, amount: 3500000 },
    { name: 'Green Bonds', value: 25, amount: 2500000 },
    { name: 'Renewable Energy', value: 20, amount: 2000000 },
    { name: 'Infrastructure', value: 15, amount: 1500000 },
    { name: 'Cash', value: 5, amount: 500000 }
  ]
}

// Helper function to validate chart data
export function validateChartData(data: any[], requiredKeys: string[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false
  }

  return data.every(item =>
    requiredKeys.every(key =>
      item.hasOwnProperty(key) && item[key] !== null && item[key] !== undefined
    )
  )
}