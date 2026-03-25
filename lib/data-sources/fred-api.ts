/**
 * WREI Trading Platform - FRED API Integration
 *
 * Federal Reserve Economic Data for RWA market context
 * Free API access to economic indicators affecting asset valuations
 */

export interface FredSeries {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: FredObservation[];
}

export interface FredObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

export interface EconomicIndicators {
  tenYearTreasury: number | null;      // DGS10 - 10-Year Treasury Rate
  inflation: number | null;            // CPIAUCSL - Consumer Price Index
  gdp: number | null;                  // GDP - Gross Domestic Product
  unemploymentRate: number | null;     // UNRATE - Unemployment Rate
  federalFundsRate: number | null;     // FEDFUNDS - Federal Funds Rate
  lastUpdated: string;
}

export interface RWAMarketContext {
  riskFreeRate: number;
  inflationAdjustedReturn: number;
  economicGrowthFactor: number;
  marketSentiment: 'expansionary' | 'contractionary' | 'neutral';
  yieldCurveSlope: number;
}

/**
 * FRED API client for economic data
 * Note: Requires FRED_API_KEY environment variable
 */
export class FREDAPI {
  private readonly baseUrl = 'https://api.stlouisfed.org/fred';
  private readonly apiKey: string | null;

  constructor() {
    // API key is optional - will use fallback data if not available
    this.apiKey = process.env.FRED_API_KEY || null;
  }

  /**
   * Get key economic indicators for RWA market analysis
   */
  async getEconomicIndicators(): Promise<EconomicIndicators | null> {
    if (!this.apiKey) {
      console.warn('FRED API key not available, using fallback economic data');
      return this.getFallbackEconomicData();
    }

    try {
      const seriesIds = [
        'DGS10',    // 10-Year Treasury Constant Maturity Rate
        'CPIAUCSL', // Consumer Price Index for All Urban Consumers
        'GDP',      // Gross Domestic Product
        'UNRATE',   // Unemployment Rate
        'FEDFUNDS', // Federal Funds Effective Rate
      ];

      const promises = seriesIds.map(seriesId =>
        this.fetchSeries(seriesId, 1) // Get most recent observation
      );

      const results = await Promise.all(promises);
      const [treasuryData, inflationData, gdpData, unemploymentData, fedFundsData] = results;

      return {
        tenYearTreasury: this.parseValue(treasuryData?.observations?.[0]?.value),
        inflation: this.parseValue(inflationData?.observations?.[0]?.value),
        gdp: this.parseValue(gdpData?.observations?.[0]?.value),
        unemploymentRate: this.parseValue(unemploymentData?.observations?.[0]?.value),
        federalFundsRate: this.parseValue(fedFundsData?.observations?.[0]?.value),
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('FRED API error:', error);
      return this.getFallbackEconomicData();
    }
  }

  /**
   * Calculate RWA market context from economic indicators
   */
  async getRWAMarketContext(): Promise<RWAMarketContext> {
    const indicators = await this.getEconomicIndicators();

    if (!indicators) {
      return this.getDefaultRWAContext();
    }

    const riskFreeRate = indicators.tenYearTreasury || 4.5;
    const inflationRate = this.calculateInflationRate(indicators.inflation);
    const realRate = riskFreeRate - inflationRate;

    // Calculate economic growth factor
    const economicGrowthFactor = this.calculateGrowthFactor(
      indicators.unemploymentRate,
      indicators.federalFundsRate
    );

    // Determine market sentiment
    const marketSentiment = this.assessMarketSentiment(
      riskFreeRate,
      inflationRate,
      indicators.unemploymentRate || 4.0,
      indicators.federalFundsRate || 5.0
    );

    // Calculate yield curve slope (approximation)
    const yieldCurveSlope = (riskFreeRate - (indicators.federalFundsRate || 5.0)) / 10;

    return {
      riskFreeRate,
      inflationAdjustedReturn: realRate,
      economicGrowthFactor,
      marketSentiment,
      yieldCurveSlope
    };
  }

  /**
   * Fetch a specific FRED series
   */
  private async fetchSeries(seriesId: string, limit: number = 10): Promise<FredSeries | null> {
    const url = `${this.baseUrl}/series/observations?series_id=${seriesId}&api_key=${this.apiKey}&file_type=json&limit=${limit}&sort_order=desc`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as FredSeries;

    } catch (error) {
      console.error(`Error fetching FRED series ${seriesId}:`, error);
      return null;
    }
  }

  /**
   * Parse string values from FRED API (handles "." for missing values)
   */
  private parseValue(value: string | undefined): number | null {
    if (!value || value === '.') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Calculate annualized inflation rate from CPI
   */
  private calculateInflationRate(cpiValue: number | null): number {
    if (!cpiValue) return 2.5; // Default assumption

    // This is a simplified calculation - would need historical CPI for accurate rate
    // Using current CPI value to estimate inflation trend
    const estimatedInflation = Math.max(0, Math.min(10, (cpiValue - 280) / 20));
    return estimatedInflation;
  }

  /**
   * Calculate economic growth factor from unemployment and Fed funds rate
   */
  private calculateGrowthFactor(unemployment: number | null, fedRate: number | null): number {
    const unemploymentRate = unemployment || 4.0;
    const federalRate = fedRate || 5.0;

    // Lower unemployment and moderate rates suggest growth
    // Factor ranges from 0.5 (recession) to 1.5 (strong growth)
    const unemploymentFactor = Math.max(0.5, 1.3 - (unemploymentRate / 10));
    const rateFactor = federalRate < 3 ? 1.1 : federalRate > 7 ? 0.9 : 1.0;

    return Math.round((unemploymentFactor * rateFactor) * 100) / 100;
  }

  /**
   * Assess overall market sentiment from economic indicators
   */
  private assessMarketSentiment(
    treasuryRate: number,
    inflationRate: number,
    unemploymentRate: number,
    fedRate: number
  ): 'expansionary' | 'contractionary' | 'neutral' {
    // Expansionary: Low unemployment, moderate rates, controlled inflation
    if (unemploymentRate < 4.5 && fedRate < 6 && inflationRate < 4) {
      return 'expansionary';
    }

    // Contractionary: High rates to combat inflation, rising unemployment
    if (fedRate > 6 || inflationRate > 5 || unemploymentRate > 6) {
      return 'contractionary';
    }

    return 'neutral';
  }

  /**
   * Fallback economic data when API is unavailable
   */
  private getFallbackEconomicData(): EconomicIndicators {
    return {
      tenYearTreasury: 4.5,   // Approximate current rate
      inflation: 3.2,         // Approximate current CPI
      gdp: 27000,            // Approximate GDP in billions
      unemploymentRate: 3.7, // Approximate current rate
      federalFundsRate: 5.25, // Approximate current rate
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Default RWA market context
   */
  private getDefaultRWAContext(): RWAMarketContext {
    return {
      riskFreeRate: 4.5,
      inflationAdjustedReturn: 1.3,
      economicGrowthFactor: 1.0,
      marketSentiment: 'neutral',
      yieldCurveSlope: -0.025
    };
  }
}

/**
 * Get RWA yield adjustments based on economic conditions
 */
export async function getRWAYieldAdjustments(): Promise<{
  baseYieldAdjustment: number;
  riskPremium: number;
  inflationProtection: number;
  economicContext: RWAMarketContext;
}> {
  const fredAPI = new FREDAPI();
  const economicContext = await fredAPI.getRWAMarketContext();

  // Calculate yield adjustments
  const baseYieldAdjustment = economicContext.riskFreeRate / 100; // Convert percentage

  // Risk premium based on market sentiment
  const riskPremium = economicContext.marketSentiment === 'contractionary' ? 0.02 :
                     economicContext.marketSentiment === 'expansionary' ? -0.01 : 0;

  // Inflation protection adjustment
  const inflationProtection = Math.max(0, (economicContext.inflationAdjustedReturn / 100) - 0.02);

  return {
    baseYieldAdjustment,
    riskPremium,
    inflationProtection,
    economicContext
  };
}

export default FREDAPI;