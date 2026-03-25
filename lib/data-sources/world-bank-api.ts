/**
 * WREI Trading Platform - World Bank API Integration
 *
 * Provides free access to economic indicators and commodity prices
 * that correlate with carbon markets and RWA valuations
 */

export interface WorldBankIndicator {
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

export interface CommodityPriceData {
  coalPrice: number;
  oilPrice: number;
  goldPrice: number;
  carbonIntensityIndex: number;
  lastUpdated: string;
}

/**
 * World Bank API client for commodity and economic data
 */
export class WorldBankAPI {
  private readonly baseUrl = 'https://api.worldbank.org/v2';
  private readonly format = 'json';

  /**
   * Fetch commodity price indicators that correlate with carbon markets
   */
  async getCommodityPrices(): Promise<CommodityPriceData | null> {
    try {
      const indicators = [
        'PCOALAU', // Australian coal price ($/mt)
        'POILWTI', // Oil price WTI ($/bbl)
        'PGOLD',   // Gold price ($/troy oz)
      ];

      const promises = indicators.map(indicator =>
        this.fetchIndicator(indicator, 'WLD', 1)
      );

      const results = await Promise.all(promises);
      const [coalData, oilData, goldData] = results;

      if (!coalData?.[0]?.value || !oilData?.[0]?.value || !goldData?.[0]?.value) {
        return null;
      }

      // Calculate carbon intensity index based on commodity prices
      const carbonIntensityIndex = this.calculateCarbonIntensity(
        coalData[0].value,
        oilData[0].value
      );

      return {
        coalPrice: coalData[0].value,
        oilPrice: oilData[0].value,
        goldPrice: goldData[0].value,
        carbonIntensityIndex,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('World Bank API error:', error);
      return null;
    }
  }

  /**
   * Fetch environmental indicators
   */
  async getEnvironmentalIndicators() {
    const indicators = [
      'EN.ATM.CO2E.KT', // CO2 emissions (kt)
      'EN.ATM.GHGT.KT.CE', // GHG emissions (kt CO2 equivalent)
    ];

    try {
      const promises = indicators.map(indicator =>
        this.fetchIndicator(indicator, 'AUS', 5) // Australia data, last 5 years
      );

      return await Promise.all(promises);
    } catch (error) {
      console.error('Environmental indicators error:', error);
      return null;
    }
  }

  /**
   * Fetch infrastructure investment indicators
   */
  async getInfrastructureIndicators() {
    const indicators = [
      'NE.GDI.TOTL.ZS', // Gross capital formation (% of GDP)
      'IC.BUS.EASE.XQ', // Ease of doing business index
    ];

    try {
      const promises = indicators.map(indicator =>
        this.fetchIndicator(indicator, 'AUS', 3)
      );

      return await Promise.all(promises);
    } catch (error) {
      console.error('Infrastructure indicators error:', error);
      return null;
    }
  }

  /**
   * Private method to fetch indicator data
   */
  private async fetchIndicator(
    indicator: string,
    country: string = 'WLD',
    mostRecent: number = 1
  ): Promise<WorldBankIndicator[] | null> {
    const url = `${this.baseUrl}/country/${country}/indicator/${indicator}?format=${this.format}&mostRecent=${mostRecent}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // World Bank API returns [metadata, data] array
      if (Array.isArray(data) && data.length > 1) {
        return data[1]; // Return the actual data array
      }

      return null;
    } catch (error) {
      console.error(`Error fetching indicator ${indicator}:`, error);
      return null;
    }
  }

  /**
   * Calculate carbon intensity index from commodity prices
   * Higher coal/oil prices typically correlate with higher carbon costs
   */
  private calculateCarbonIntensity(coalPrice: number, oilPrice: number): number {
    // Normalize prices and create composite index (0-100 scale)
    const coalNormalized = Math.min(coalPrice / 200, 1); // Normalize against $200/mt baseline
    const oilNormalized = Math.min(oilPrice / 100, 1);   // Normalize against $100/bbl baseline

    // Weighted average (coal has higher carbon intensity)
    const carbonIntensity = (coalNormalized * 0.7 + oilNormalized * 0.3) * 100;

    return Math.round(carbonIntensity * 100) / 100; // Round to 2 decimal places
  }
}

/**
 * Get carbon market context from commodity prices
 */
export async function getCarbonMarketContext(): Promise<{
  commodityPrices: CommodityPriceData | null;
  carbonPremiumEstimate: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}> {
  const worldBank = new WorldBankAPI();
  const commodityPrices = await worldBank.getCommodityPrices();

  let carbonPremiumEstimate = 1.0; // Default multiplier
  let marketSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  if (commodityPrices) {
    // Higher commodity prices suggest higher carbon costs
    if (commodityPrices.carbonIntensityIndex > 70) {
      carbonPremiumEstimate = 1.2;
      marketSentiment = 'bullish';
    } else if (commodityPrices.carbonIntensityIndex < 30) {
      carbonPremiumEstimate = 0.8;
      marketSentiment = 'bearish';
    }
  }

  return {
    commodityPrices,
    carbonPremiumEstimate,
    marketSentiment
  };
}

export default WorldBankAPI;