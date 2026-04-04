/**
 * Chart Data Transformers Tests
 *
 * Tests for functions that convert existing data structures into Recharts-compatible formats
 */

import {
  transformMarketDataToTimeSeries,
  transformPortfolioToAllocation,
  transformPerformanceToMetrics,
  transformYieldComparisonData,
  transformPricingTrends,
  transformRiskMetrics,
  generateMockTimeSeries,
  generateMockAllocation,
  validateChartData
} from '@/lib/chart-data-transforms';

describe('transformMarketDataToTimeSeries', () => {
  test('transforms array of market data correctly', () => {
    const input = [
      { date: '2026-01-01', price: 150, volume: 100000 },
      { timestamp: '2026-01-02', carbon_price: 155, trading_volume: 120000 }
    ];

    const result = transformMarketDataToTimeSeries(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      date: '2026-01-01',
      price: 150,
      volume: 100000,
      market_cap: 0
    });
    expect(result[1]).toEqual({
      date: '2026-01-02',
      price: 155,
      volume: 120000,
      market_cap: 0
    });
  });

  test('handles empty array', () => {
    const result = transformMarketDataToTimeSeries([]);
    expect(result).toEqual([]);
  });

  test('handles null input', () => {
    const result = transformMarketDataToTimeSeries(null);
    expect(result).toEqual([]);
  });

  test('handles non-array input', () => {
    const result = transformMarketDataToTimeSeries({ not: 'array' });
    expect(result).toEqual([]);
  });
});

describe('transformPortfolioToAllocation', () => {
  test('transforms portfolio with allocation array', () => {
    const input = {
      allocation: [
        { asset_class: 'Carbon Credits', allocation_percent: 35, amount: 3500000 },
        { name: 'Green Bonds', percentage: 25, value: 2500000 }
      ]
    };

    const result = transformPortfolioToAllocation(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'Carbon Credits',
      value: 35,
      amount: 3500000
    });
    expect(result[1]).toEqual({
      name: 'Green Bonds',
      value: 25,
      amount: 2500000
    });
  });

  test('transforms portfolio with assets array', () => {
    const input = {
      assets: [
        { name: 'WREI Tokens', weight: 40, value: 4000000 },
        { type: 'Infrastructure', allocation: 30, amount: 3000000 }
      ]
    };

    const result = transformPortfolioToAllocation(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'WREI Tokens',
      value: 40,
      amount: 4000000
    });
    expect(result[1]).toEqual({
      name: 'Infrastructure',
      value: 30,
      amount: 3000000
    });
  });

  test('transforms object-based allocation data', () => {
    const input = {
      carbon_credits: 35,
      green_bonds: 25,
      infrastructure: 20,
      total: 100
    };

    const result = transformPortfolioToAllocation(input);

    expect(result).toHaveLength(3); // Excludes 'total'
    expect(result[0].name).toBe('carbon credits');
    expect(result[0].value).toBe(35);
  });

  test('handles empty object', () => {
    const result = transformPortfolioToAllocation({});
    expect(result).toEqual([]);
  });

  test('handles null input', () => {
    const result = transformPortfolioToAllocation(null);
    expect(result).toEqual([]);
  });
});

describe('transformPerformanceToMetrics', () => {
  test('transforms complete performance data', () => {
    const input = {
      api_metrics: { average_response_time: 450 },
      system_metrics: { cpu_usage: 0.65, memory_usage: 0.72 },
      trading_metrics: { success_rate: 0.98 }
    };

    const result = transformPerformanceToMetrics(input);

    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({
      metric: 'API Response Time',
      value: 450,
      target: 500,
      unit: 'ms'
    });
    expect(result[1]).toEqual({
      metric: 'CPU Usage',
      value: 0.65,
      target: 0.7,
      unit: 'percent'
    });
  });

  test('handles partial performance data', () => {
    const input = {
      api_metrics: { average_response_time: 300 }
    };

    const result = transformPerformanceToMetrics(input);

    expect(result).toHaveLength(1);
    expect(result[0].metric).toBe('API Response Time');
  });

  test('handles empty object', () => {
    const result = transformPerformanceToMetrics({});
    expect(result).toEqual([]);
  });

  test('handles null input', () => {
    const result = transformPerformanceToMetrics(null);
    expect(result).toEqual([]);
  });
});

describe('transformYieldComparisonData', () => {
  test('transforms complete yield data', () => {
    const input = {
      wrei_yields: { base_yield: 0.15, risk_adjusted_yield: 0.12, projected_yield: 0.18 },
      traditional_yields: { government_bonds: 0.03, corporate_bonds: 0.05, high_yield: 0.08 }
    };

    const result = transformYieldComparisonData(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      category: 'WREI Carbon Credits',
      yield: 0.15,
      risk_adjusted: 0.12,
      projected: 0.18
    });
    expect(result[1]).toEqual({
      category: 'Traditional Bonds',
      yield: 0.03,
      risk_adjusted: 0.05,
      projected: 0.08
    });
  });

  test('handles empty object', () => {
    const result = transformYieldComparisonData({});
    expect(result).toEqual([]);
  });

  test('handles null input', () => {
    const result = transformYieldComparisonData(null);
    expect(result).toEqual([]);
  });
});

describe('transformPricingTrends', () => {
  test('transforms pricing trend array', () => {
    const input = [
      { date: '2026-01-01', spot_price: 150, forward_price: 155, trading_volume: 100000 },
      { timestamp: '2026-01-02', current_price: 148, projected_price: 152, volume: 95000 }
    ];

    const result = transformPricingTrends(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      date: '2026-01-01',
      spot_price: 150,
      forward_price: 155,
      volume: 100000
    });
    expect(result[1]).toEqual({
      date: '2026-01-02',
      spot_price: 148,
      forward_price: 152,
      volume: 95000
    });
  });

  test('handles empty array', () => {
    const result = transformPricingTrends([]);
    expect(result).toEqual([]);
  });

  test('handles non-array input', () => {
    const result = transformPricingTrends({ not: 'array' });
    expect(result).toEqual([]);
  });
});

describe('transformRiskMetrics', () => {
  test('transforms risk data to radar chart format', () => {
    const input = {
      credit_risk: 3,
      market_risk: 5,
      liquidity_risk: 2,
      operational_risk: 4,
      esg_risk: 1
    };

    const result = transformRiskMetrics(input);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      metric: 'Credit Risk',
      value: 3,
      fullMark: 10
    });
    expect(result[4]).toEqual({
      metric: 'ESG Risk',
      value: 1,
      fullMark: 10
    });
  });

  test('handles missing risk metrics', () => {
    const input = { credit_risk: 3 };

    const result = transformRiskMetrics(input);

    expect(result).toHaveLength(5);
    expect(result[0].value).toBe(3);
    expect(result[1].value).toBe(0); // Default value
  });

  test('handles null input', () => {
    const result = transformRiskMetrics(null);
    expect(result).toEqual([]);
  });
});

describe('generateMockTimeSeries', () => {
  test('generates correct number of data points', () => {
    const result = generateMockTimeSeries(10, 100, 0.1);

    expect(result).toHaveLength(10);
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('price');
    expect(result[0]).toHaveProperty('volume');
  });

  test('uses default parameters', () => {
    const result = generateMockTimeSeries();

    expect(result).toHaveLength(30);
    expect(result[0].price).toBeGreaterThan(0);
  });

  test('maintains positive prices', () => {
    const result = generateMockTimeSeries(50, 10, 0.5);

    result.forEach(point => {
      expect(point.price).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('generateMockAllocation', () => {
  test('generates valid allocation data', () => {
    const result = generateMockAllocation();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    result.forEach(item => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('amount');
      expect(typeof item.value).toBe('number');
      expect(typeof item.amount).toBe('number');
    });
  });

  test('allocation percentages sum to 100', () => {
    const result = generateMockAllocation();
    const total = result.reduce((sum, item) => sum + item.value, 0);

    expect(total).toBe(100);
  });
});

describe('validateChartData', () => {
  test('validates valid chart data', () => {
    const data = [
      { date: '2026-01-01', price: 150 },
      { date: '2026-01-02', price: 155 }
    ];

    const result = validateChartData(data, ['date', 'price']);

    expect(result).toBe(true);
  });

  test('rejects data missing required keys', () => {
    const data = [
      { date: '2026-01-01' }, // Missing 'price'
      { date: '2026-01-02', price: 155 }
    ];

    const result = validateChartData(data, ['date', 'price']);

    expect(result).toBe(false);
  });

  test('rejects empty array', () => {
    const result = validateChartData([], ['date', 'price']);

    expect(result).toBe(false);
  });

  test('rejects null/undefined data', () => {
    expect(validateChartData(null as any, ['date', 'price'])).toBe(false);
    expect(validateChartData(undefined as any, ['date', 'price'])).toBe(false);
  });

  test('rejects non-array data', () => {
    const result = validateChartData({ not: 'array' } as any, ['date', 'price']);

    expect(result).toBe(false);
  });

  test('handles null/undefined values in data', () => {
    const data = [
      { date: '2026-01-01', price: null },
      { date: '2026-01-02', price: 155 }
    ];

    const result = validateChartData(data, ['date', 'price']);

    expect(result).toBe(false);
  });
});