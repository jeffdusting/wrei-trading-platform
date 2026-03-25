/**
 * WREI Trading Platform - CoinMarketCap API Integration
 *
 * Tracks tokenized Real-World Assets (RWA) and related cryptocurrency data
 * Free tier: 10,000 calls/month, professional tier available
 */

export interface CMCToken {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: string[];
  max_supply: number | null;
  circulating_supply: number;
  total_supply: number;
  platform?: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  };
  cmc_rank: number;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  tvl_ratio: number | null;
  last_updated: string;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      percent_change_30d: number;
      percent_change_60d: number;
      percent_change_90d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      tvl: number | null;
      last_updated: string;
    };
  };
}

export interface RWATokenData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
  percentChange7d: number;
  category: 'gold' | 'real-estate' | 'treasury' | 'commodity' | 'infrastructure';
  lastUpdated: string;
}

export interface RWAMarketOverview {
  totalMarketCap: number;
  averageReturn24h: number;
  topPerformer: RWATokenData | null;
  bottomPerformer: RWATokenData | null;
  goldBackedTokens: RWATokenData[];
  treasuryTokens: RWATokenData[];
  realEstateTokens: RWATokenData[];
  lastUpdated: string;
}

/**
 * CoinMarketCap API client for RWA token data
 */
export class CoinMarketCapAPI {
  private readonly baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  private readonly sandboxUrl = 'https://sandbox-api.coinmarketcap.com/v1';
  private readonly apiKey: string | null;
  private readonly useSandbox: boolean;

  constructor(useSandbox: boolean = false) {
    this.apiKey = process.env.CMC_API_KEY || null;
    this.useSandbox = useSandbox || !this.apiKey;
  }

  /**
   * Get RWA token data for major tokenized assets
   */
  async getRWATokens(): Promise<RWAMarketOverview | null> {
    // Major RWA tokens to track
    const rwaTokens = [
      'PAXG',  // PAX Gold
      'XAUt',  // Tether Gold
      'USYC',  // Hashnote US Yield Coin
      'BUIDL', // BlackRock USD Institutional Digital Liquidity Fund
      'RWA',   // RWA Inc. token
      'GOLD',  // GOLD token
      'DGLD',  // Digix Gold Token
    ];

    if (!this.apiKey && !this.useSandbox) {
      console.warn('CMC API key not available, using fallback RWA data');
      return this.getFallbackRWAData();
    }

    try {
      const symbolsString = rwaTokens.join(',');
      const tokenData = await this.fetchTokensBySymbol(symbolsString);

      if (!tokenData) {
        return this.getFallbackRWAData();
      }

      const rwaTokensData: RWATokenData[] = Object.values(tokenData).map((token: any) => ({
        symbol: token.symbol,
        name: token.name,
        price: token.quote.USD.price,
        marketCap: token.quote.USD.market_cap,
        volume24h: token.quote.USD.volume_24h,
        percentChange24h: token.quote.USD.percent_change_24h,
        percentChange7d: token.quote.USD.percent_change_7d,
        category: this.categorizeToken(token.symbol),
        lastUpdated: token.quote.USD.last_updated
      }));

      // Calculate market overview
      const totalMarketCap = rwaTokensData.reduce((sum, token) => sum + token.marketCap, 0);
      const averageReturn24h = rwaTokensData.reduce((sum, token) => sum + token.percentChange24h, 0) / rwaTokensData.length;

      // Find top and bottom performers
      const sortedByPerformance = [...rwaTokensData].sort((a, b) => b.percentChange24h - a.percentChange24h);
      const topPerformer = sortedByPerformance[0] || null;
      const bottomPerformer = sortedByPerformance[sortedByPerformance.length - 1] || null;

      // Categorize tokens
      const goldBackedTokens = rwaTokensData.filter(token => token.category === 'gold');
      const treasuryTokens = rwaTokensData.filter(token => token.category === 'treasury');
      const realEstateTokens = rwaTokensData.filter(token => token.category === 'real-estate');

      return {
        totalMarketCap,
        averageReturn24h,
        topPerformer,
        bottomPerformer,
        goldBackedTokens,
        treasuryTokens,
        realEstateTokens,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('CoinMarketCap API error:', error);
      return this.getFallbackRWAData();
    }
  }

  /**
   * Get market data for specific tokens by symbol
   */
  private async fetchTokensBySymbol(symbols: string): Promise<Record<string, CMCToken> | null> {
    const baseUrl = this.useSandbox ? this.sandboxUrl : this.baseUrl;
    const url = `${baseUrl}/cryptocurrency/quotes/latest?symbol=${symbols}`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      headers['X-CMC_PRO_API_KEY'] = this.apiKey;
    }

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status?.error_code === 0 && data.data) {
        return data.data;
      }

      return null;

    } catch (error) {
      console.error('Error fetching CMC tokens:', error);
      return null;
    }
  }

  /**
   * Categorize RWA tokens by asset type
   */
  private categorizeToken(symbol: string): 'gold' | 'real-estate' | 'treasury' | 'commodity' | 'infrastructure' {
    const goldTokens = ['PAXG', 'XAUt', 'GOLD', 'DGLD'];
    const treasuryTokens = ['USYC', 'BUIDL', 'OUSG', 'TFUND'];
    const realEstateTokens = ['RWA', 'REIT', 'PROPX'];

    if (goldTokens.includes(symbol)) return 'gold';
    if (treasuryTokens.includes(symbol)) return 'treasury';
    if (realEstateTokens.includes(symbol)) return 'real-estate';

    return 'commodity'; // Default category
  }

  /**
   * Fallback RWA data when API is unavailable
   */
  public getFallbackRWAData(): RWAMarketOverview {
    const mockTokens: RWATokenData[] = [
      {
        symbol: 'PAXG',
        name: 'PAX Gold',
        price: 2045.50,
        marketCap: 500000000,
        volume24h: 15000000,
        percentChange24h: 0.8,
        percentChange7d: 2.1,
        category: 'gold',
        lastUpdated: new Date().toISOString()
      },
      {
        symbol: 'USYC',
        name: 'Hashnote US Yield Coin',
        price: 1.02,
        marketCap: 150000000,
        volume24h: 5000000,
        percentChange24h: 0.1,
        percentChange7d: 0.3,
        category: 'treasury',
        lastUpdated: new Date().toISOString()
      },
      {
        symbol: 'BUIDL',
        name: 'BlackRock USD Institutional Digital Liquidity Fund',
        price: 1.00,
        marketCap: 400000000,
        volume24h: 12000000,
        percentChange24h: 0.0,
        percentChange7d: 0.1,
        category: 'treasury',
        lastUpdated: new Date().toISOString()
      }
    ];

    return {
      totalMarketCap: mockTokens.reduce((sum, token) => sum + token.marketCap, 0),
      averageReturn24h: mockTokens.reduce((sum, token) => sum + token.percentChange24h, 0) / mockTokens.length,
      topPerformer: mockTokens[0],
      bottomPerformer: mockTokens[mockTokens.length - 1],
      goldBackedTokens: mockTokens.filter(token => token.category === 'gold'),
      treasuryTokens: mockTokens.filter(token => token.category === 'treasury'),
      realEstateTokens: mockTokens.filter(token => token.category === 'real-estate'),
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Calculate RWA market context for WREI pricing
 */
export async function getRWAMarketContext(): Promise<{
  marketOverview: RWAMarketOverview;
  goldPremium: number;
  treasuryYield: number;
  rwaVolatility: number;
  marketTrend: 'bullish' | 'bearish' | 'sideways';
}> {
  const cmcAPI = new CoinMarketCapAPI();
  const marketOverview = await cmcAPI.getRWATokens() || cmcAPI.getFallbackRWAData();

  // Calculate gold premium based on gold-backed tokens
  const avgGoldReturn = marketOverview.goldBackedTokens.length > 0
    ? marketOverview.goldBackedTokens.reduce((sum, token) => sum + token.percentChange7d, 0) / marketOverview.goldBackedTokens.length
    : 0;

  const goldPremium = 1 + (avgGoldReturn / 100);

  // Estimate treasury yield from treasury tokens
  const avgTreasuryReturn = marketOverview.treasuryTokens.length > 0
    ? marketOverview.treasuryTokens.reduce((sum, token) => sum + token.percentChange7d, 0) / marketOverview.treasuryTokens.length
    : 0;

  const treasuryYield = Math.max(0, avgTreasuryReturn);

  // Calculate overall RWA volatility
  const returns = [marketOverview.topPerformer, marketOverview.bottomPerformer]
    .filter(token => token !== null)
    .map(token => token!.percentChange24h);

  const rwaVolatility = returns.length > 0
    ? Math.abs(Math.max(...returns) - Math.min(...returns))
    : 2.0; // Default volatility

  // Determine market trend
  let marketTrend: 'bullish' | 'bearish' | 'sideways' = 'sideways';
  if (marketOverview.averageReturn24h > 1.0) marketTrend = 'bullish';
  else if (marketOverview.averageReturn24h < -1.0) marketTrend = 'bearish';

  return {
    marketOverview,
    goldPremium,
    treasuryYield,
    rwaVolatility,
    marketTrend
  };
}

export default CoinMarketCapAPI;