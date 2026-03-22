/**
 * WREI Mock API Gateway
 * Simulates external API dependencies with realistic responses and latency
 * Version: 6.3.0
 */

export interface ApiSimulationConfig {
  baseLatency: number;
  variability: number;
  errorRate: number;
  enableNetworkSimulation: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
    source: string;
    cached: boolean;
  };
}

export class MockApiGateway {
  private config: ApiSimulationConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private requestLog: Array<{ endpoint: string; timestamp: Date; duration: number }>;

  constructor(config: Partial<ApiSimulationConfig> = {}) {
    this.config = {
      baseLatency: 300, // 300ms base latency
      variability: 200, // ±200ms variability
      errorRate: 0.02,  // 2% error rate
      enableNetworkSimulation: true,
      ...config
    };

    this.cache = new Map();
    this.requestLog = [];
  }

  // Bloomberg Terminal API Simulation
  public async getBloombergData(query: BloombergQuery): Promise<ApiResponse<BloombergData>> {
    await this.simulateNetworkDelay('bloomberg');

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('Bloomberg API temporarily unavailable', 'bloomberg');
    }

    const data = this.generateBloombergData(query);
    return this.createSuccessResponse(data, 'bloomberg');
  }

  // ESG Platform API Simulation
  public async getESGRatings(assetId: string): Promise<ApiResponse<ESGRating>> {
    await this.simulateNetworkDelay('esg_platform');

    const cacheKey = `esg_${assetId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return this.createSuccessResponse(cached, 'esg_platform', true);
    }

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('ESG data provider connection timeout', 'esg_platform');
    }

    const data = this.generateESGRating(assetId);
    this.setCache(cacheKey, data, 300000); // 5 minute cache

    return this.createSuccessResponse(data, 'esg_platform');
  }

  // Market Data Simulation
  public async getMarketData(symbols: string[]): Promise<ApiResponse<MarketData[]>> {
    await this.simulateNetworkDelay('market_data');

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('Market data feed interrupted', 'market_data');
    }

    const data = symbols.map(symbol => this.generateMarketData(symbol));
    return this.createSuccessResponse(data, 'market_data');
  }

  // Regulatory Compliance API Simulation
  public async getRegulatoryRequirements(jurisdiction: string): Promise<ApiResponse<RegulatoryInfo>> {
    await this.simulateNetworkDelay('regulatory');

    const cacheKey = `regulatory_${jurisdiction}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return this.createSuccessResponse(cached, 'regulatory', true);
    }

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('Regulatory database maintenance in progress', 'regulatory');
    }

    const data = this.generateRegulatoryInfo(jurisdiction);
    this.setCache(cacheKey, data, 1800000); // 30 minute cache

    return this.createSuccessResponse(data, 'regulatory');
  }

  // Consortium Management API Simulation
  public async getConsortiumData(consortiumId: string): Promise<ApiResponse<ConsortiumInfo>> {
    await this.simulateNetworkDelay('consortium');

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('Consortium API rate limit exceeded', 'consortium');
    }

    const data = this.generateConsortiumData(consortiumId);
    return this.createSuccessResponse(data, 'consortium');
  }

  // Risk Analytics API Simulation
  public async getRiskAnalysis(portfolio: PortfolioData): Promise<ApiResponse<RiskAnalysis>> {
    await this.simulateNetworkDelay('risk_analytics', 1500); // More complex calculation

    if (this.shouldSimulateError()) {
      return this.createErrorResponse('Risk calculation engine overloaded', 'risk_analytics');
    }

    const data = this.generateRiskAnalysis(portfolio);
    return this.createSuccessResponse(data, 'risk_analytics');
  }

  // Data Generation Methods
  private generateBloombergData(query: BloombergQuery): BloombergData {
    return {
      symbol: query.symbol,
      price: this.generateRealisticPrice(150, 180),
      change: this.generateChange(),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      marketCap: Math.floor(Math.random() * 10000000000) + 1000000000,
      pe: Number((Math.random() * 25 + 5).toFixed(2)),
      yield: Number((Math.random() * 0.08 + 0.02).toFixed(4)),
      lastUpdated: new Date(),
      analytics: {
        recommendation: this.getRandomRecommendation(),
        targetPrice: this.generateRealisticPrice(160, 200),
        analystCoverage: Math.floor(Math.random() * 15) + 5
      }
    };
  }

  private generateESGRating(assetId: string): ESGRating {
    const scores = {
      environmental: Math.floor(Math.random() * 40) + 60, // 60-100 range
      social: Math.floor(Math.random() * 30) + 70,         // 70-100 range
      governance: Math.floor(Math.random() * 25) + 75      // 75-100 range
    };

    const overall = Math.floor((scores.environmental + scores.social + scores.governance) / 3);

    return {
      assetId,
      overall,
      environmental: scores.environmental,
      social: scores.social,
      governance: scores.governance,
      rating: this.getESGLetterRating(overall),
      provider: 'Sustainalytics',
      lastUpdated: new Date(),
      trend: this.getRandomTrend(),
      peerComparison: {
        percentile: Math.floor(Math.random() * 40) + 60, // Top 40%
        industryAverage: Math.floor(Math.random() * 20) + 65
      },
      controversies: this.generateControversies(),
      certifications: ['TCFD', 'GRI', 'SASB']
    };
  }

  private generateMarketData(symbol: string): MarketData {
    return {
      symbol,
      price: this.generateRealisticPrice(100, 200),
      change: this.generateChange(),
      changePercent: Number((Math.random() * 10 - 5).toFixed(2)),
      volume: Math.floor(Math.random() * 5000000) + 500000,
      high52Week: this.generateRealisticPrice(180, 250),
      low52Week: this.generateRealisticPrice(50, 120),
      marketCap: Math.floor(Math.random() * 50000000000) + 1000000000,
      timestamp: new Date()
    };
  }

  private generateRegulatoryInfo(jurisdiction: string): RegulatoryInfo {
    const jurisdictionData: Record<string, Partial<RegulatoryInfo>> = {
      'AU': {
        jurisdiction: 'Australia',
        regulator: 'ASIC',
        requirements: [
          'AFSL license required for financial services',
          'Wholesale client verification for >A$2.5M investments',
          'Annual compliance reporting',
          'Product Disclosure Statement (PDS) distribution'
        ],
        restrictions: [
          'Retail investor limits: Maximum 20% of portfolio',
          'Cooling-off period: 14 days for new investments'
        ]
      },
      'US': {
        jurisdiction: 'United States',
        regulator: 'SEC',
        requirements: [
          'Investment Advisor registration',
          'Accredited investor verification',
          'Quarterly Form ADV filing',
          'Custody rule compliance'
        ],
        restrictions: [
          'Private placement limits under Regulation D',
          'Investment Company Act considerations'
        ]
      },
      'EU': {
        jurisdiction: 'European Union',
        regulator: 'ESMA',
        requirements: [
          'MiFID II compliance',
          'Professional client classification',
          'Best execution reporting',
          'GDPR data protection compliance'
        ],
        restrictions: [
          'PRIIPs regulation for complex products',
          'Sustainability disclosure requirements'
        ]
      }
    };

    const baseData: RegulatoryInfo = {
      jurisdiction: 'Unknown',
      regulator: 'N/A',
      requirements: ['Standard compliance procedures'],
      restrictions: ['Contact local regulator for specific requirements'],
      lastUpdated: new Date(),
      version: '2026.1',
      contacts: {
        primary: 'compliance@example.gov',
        phone: '+1-555-0123'
      }
    };

    return { ...baseData, ...jurisdictionData[jurisdiction] };
  }

  private generateConsortiumData(consortiumId: string): ConsortiumInfo {
    return {
      id: consortiumId,
      name: `Infrastructure Investment Consortium ${consortiumId.slice(-3)}`,
      members: this.generateConsortiumMembers(),
      totalCommitment: Math.floor(Math.random() * 5000000000) + 1000000000,
      availableCapital: Math.floor(Math.random() * 2000000000) + 500000000,
      investmentThreshold: Math.floor(Math.random() * 100000000) + 50000000,
      decisionTimeline: Math.floor(Math.random() * 60) + 30, // 30-90 days
      status: this.getRandomConsortiumStatus(),
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      governance: {
        votingThreshold: 0.67,
        quorumRequired: 0.5,
        chairEntity: 'Lead Investment Partner'
      }
    };
  }

  private generateRiskAnalysis(portfolio: PortfolioData): RiskAnalysis {
    return {
      portfolioId: portfolio.id,
      overallRisk: Number((Math.random() * 0.3 + 0.1).toFixed(4)), // 10-40% volatility
      var95: Number((Math.random() * 0.15 + 0.05).toFixed(4)),     // 5-20% VaR
      expectedReturn: Number((Math.random() * 0.12 + 0.04).toFixed(4)), // 4-16% return
      sharpeRatio: Number((Math.random() * 2 + 0.5).toFixed(2)),    // 0.5-2.5 Sharpe
      correlationMatrix: this.generateCorrelationMatrix(portfolio.assets.length),
      stressTest: this.generateStressTestResults(),
      recommendations: this.generateRiskRecommendations(),
      calculatedAt: new Date(),
      methodology: 'Monte Carlo simulation with 10,000 iterations'
    };
  }

  // Utility Methods
  private async simulateNetworkDelay(endpoint: string, baseDelay?: number): Promise<void> {
    if (!this.config.enableNetworkSimulation) return;

    const delay = baseDelay || this.config.baseLatency;
    const variability = Math.random() * this.config.variability - (this.config.variability / 2);
    const totalDelay = Math.max(50, delay + variability); // Minimum 50ms

    return new Promise(resolve => setTimeout(resolve, totalDelay));
  }

  private shouldSimulateError(): boolean {
    return Math.random() < this.config.errorRate;
  }

  private createSuccessResponse<T>(data: T, source: string, cached = false): ApiResponse<T> {
    const requestId = this.generateRequestId();
    return {
      success: true,
      data,
      metadata: {
        requestId,
        timestamp: new Date(),
        processingTime: this.config.baseLatency,
        source,
        cached
      }
    };
  }

  private createErrorResponse(error: string, source: string): ApiResponse {
    return {
      success: false,
      error,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date(),
        processingTime: this.config.baseLatency,
        source,
        cached: false
      }
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateRealisticPrice(min: number, max: number): number {
    return Number((Math.random() * (max - min) + min).toFixed(2));
  }

  private generateChange(): number {
    return Number((Math.random() * 20 - 10).toFixed(2));
  }

  private getRandomRecommendation(): string {
    const recommendations = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }

  private getESGLetterRating(score: number): string {
    if (score >= 90) return 'AAA';
    if (score >= 80) return 'AA';
    if (score >= 70) return 'A';
    if (score >= 60) return 'BBB';
    if (score >= 50) return 'BB';
    return 'B';
  }

  private getRandomTrend(): 'improving' | 'stable' | 'declining' {
    const trends = ['improving', 'stable', 'declining'];
    return trends[Math.floor(Math.random() * trends.length)] as any;
  }

  private generateControversies(): Array<{ type: string; severity: string; date: Date }> {
    const controversyTypes = ['Environmental violation', 'Labor dispute', 'Data privacy', 'Tax compliance'];
    const count = Math.floor(Math.random() * 3); // 0-2 controversies

    return Array.from({ length: count }, () => ({
      type: controversyTypes[Math.floor(Math.random() * controversyTypes.length)],
      severity: Math.random() > 0.7 ? 'High' : 'Medium',
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    }));
  }

  private generateConsortiumMembers(): Array<{ name: string; commitment: number; role: string }> {
    const members = [
      'Australian Super Fund',
      'Canada Pension Plan',
      'Singapore GIC',
      'Norway Government Pension',
      'California Teachers Fund'
    ];

    return members.slice(0, Math.floor(Math.random() * 3) + 2).map(name => ({
      name,
      commitment: Math.floor(Math.random() * 1000000000) + 100000000,
      role: Math.random() > 0.5 ? 'Lead Investor' : 'Participating Member'
    }));
  }

  private getRandomConsortiumStatus(): string {
    const statuses = ['Active', 'Fundraising', 'Closed', 'Under Review'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateCorrelationMatrix(size: number): number[][] {
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) =>
        i === j ? 1 : Number((Math.random() * 0.6 - 0.3).toFixed(3))
      )
    );
  }

  private generateStressTestResults(): any {
    return {
      scenarios: [
        { name: 'Market Crash (-30%)', impact: Number((Math.random() * -0.4 - 0.1).toFixed(3)) },
        { name: 'Interest Rate Rise (+3%)', impact: Number((Math.random() * -0.2).toFixed(3)) },
        { name: 'ESG Scandal', impact: Number((Math.random() * -0.25).toFixed(3)) }
      ]
    };
  }

  private generateRiskRecommendations(): string[] {
    const recommendations = [
      'Consider diversifying across multiple carbon credit vintages',
      'Monitor regulatory changes in target jurisdictions',
      'Implement hedging strategy for currency exposure',
      'Review ESG criteria alignment with fund objectives',
      'Consider increasing position size given attractive risk-return profile'
    ];

    return recommendations.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  // Cache management
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

// Supporting interfaces
export interface BloombergQuery {
  symbol: string;
  fields: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface BloombergData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  pe: number;
  yield: number;
  lastUpdated: Date;
  analytics: {
    recommendation: string;
    targetPrice: number;
    analystCoverage: number;
  };
}

export interface ESGRating {
  assetId: string;
  overall: number;
  environmental: number;
  social: number;
  governance: number;
  rating: string;
  provider: string;
  lastUpdated: Date;
  trend: 'improving' | 'stable' | 'declining';
  peerComparison: {
    percentile: number;
    industryAverage: number;
  };
  controversies: Array<{
    type: string;
    severity: string;
    date: Date;
  }>;
  certifications: string[];
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high52Week: number;
  low52Week: number;
  marketCap: number;
  timestamp: Date;
}

export interface RegulatoryInfo {
  jurisdiction: string;
  regulator: string;
  requirements: string[];
  restrictions: string[];
  lastUpdated: Date;
  version: string;
  contacts: {
    primary: string;
    phone: string;
  };
}

export interface ConsortiumInfo {
  id: string;
  name: string;
  members: Array<{
    name: string;
    commitment: number;
    role: string;
  }>;
  totalCommitment: number;
  availableCapital: number;
  investmentThreshold: number;
  decisionTimeline: number;
  status: string;
  lastActivity: Date;
  governance: {
    votingThreshold: number;
    quorumRequired: number;
    chairEntity: string;
  };
}

export interface PortfolioData {
  id: string;
  assets: Array<{
    symbol: string;
    weight: number;
  }>;
}

export interface RiskAnalysis {
  portfolioId: string;
  overallRisk: number;
  var95: number;
  expectedReturn: number;
  sharpeRatio: number;
  correlationMatrix: number[][];
  stressTest: any;
  recommendations: string[];
  calculatedAt: Date;
  methodology: string;
}