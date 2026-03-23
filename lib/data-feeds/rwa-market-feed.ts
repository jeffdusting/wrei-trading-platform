/**
 * RWA Market Feed Module
 * Milestone 2.1: Real-Time Data Feeds - Tokenized RWA Market Specialist
 *
 * Provides specialized Real World Asset tokenization market data and analytics
 */

import { marketIntelligenceSystem } from '../market-intelligence';
import type { RWAMarketData } from './types';

export interface RWAMarketTrend {
  segment: 'realEstate' | 'privateEquity' | 'infrastructure' | 'commodities';
  direction: 'growth' | 'consolidation' | 'decline';
  strength: number; // 0-100
  drivers: string[];
  projectedGrowth: number; // Percentage growth projection
  riskFactors: string[];
}

export interface RWAMarketInnovation {
  category: 'tokenization_standard' | 'custody_solution' | 'trading_protocol' | 'regulatory_framework';
  title: string;
  description: string;
  impactLevel: 'low' | 'medium' | 'high' | 'transformative';
  adoptionTimeline: string;
  keyPlayers: string[];
}

export interface RWALiquidityAnalysis {
  overallLiquidity: {
    score: number; // 0-100
    trend: 'improving' | 'stable' | 'declining';
    factors: string[];
  };
  segmentLiquidity: Record<'realEstate' | 'privateEquity' | 'infrastructure' | 'commodities', {
    dailyVolume: number;
    averageTradeSize: number;
    timeToExecution: number; // Hours
    marketMakersActive: number;
  }>;
  institutionalParticipation: {
    percentageOfVolume: number;
    averageTicketSize: number;
    topInstitutionTypes: string[];
  };
}

export interface RWAMarketAnalytics {
  currentData: RWAMarketData;
  trends: RWAMarketTrend[];
  innovations: RWAMarketInnovation[];
  liquidityAnalysis: RWALiquidityAnalysis;
  competitiveAnalysis: {
    marketLeaders: Array<{
      name: string;
      marketShare: number;
      focusArea: string;
      competitiveAdvantage: string;
    }>;
    emergingPlayers: string[];
    consolidationActivity: string[];
  };
  investmentFlows: {
    institutionalInflows: number; // Monthly inflows in A$
    retailParticipation: number; // Percentage of total volume
    geographicDistribution: Record<string, number>; // Regional allocation percentages
  };
}

class RWAMarketFeed {
  private marketState: {
    growthMomentum: Record<string, number>; // Growth momentum by segment
    liquidityTrend: number; // Overall liquidity trend
    institutionalAdoption: number; // Institutional adoption rate
    regulatoryClarity: number; // Regulatory clarity index
    innovationIndex: number; // Market innovation index
    lastInnovationTime: number;
    priceHistory: Record<string, Array<{ timestamp: number; value: number }>>;
  };

  private baseMarketData: ReturnType<typeof marketIntelligenceSystem.getTokenizedRWAMarketContext>;

  constructor() {
    this.baseMarketData = marketIntelligenceSystem.getTokenizedRWAMarketContext();
    this.marketState = {
      growthMomentum: {
        realEstate: 0.15, // 15% growth momentum
        privateEquity: 0.28, // High growth in private equity tokenization
        infrastructure: 0.18, // Moderate infrastructure growth
        commodities: 0.12, // Steady commodities tokenization
      },
      liquidityTrend: 0.65, // Improving liquidity
      institutionalAdoption: 0.45, // Moderate institutional adoption
      regulatoryClarity: 0.70, // Good regulatory framework clarity
      innovationIndex: 0.80, // High innovation activity
      lastInnovationTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
      priceHistory: {
        realEstate: [],
        privateEquity: [],
        infrastructure: [],
        commodities: [],
      },
    };
  }

  /**
   * Generate RWA market data with institutional-grade analytics
   */
  generateMarketData(timestamp: string): RWAMarketData {
    const now = Date.now();

    // Update market state
    this.updateMarketState(now);

    // Calculate segment values with growth simulation
    const segments = this.calculateSegmentValues();

    // Generate liquidity metrics
    const liquidityMetrics = this.generateLiquidityMetrics();

    // Calculate yield data
    const yieldData = this.generateYieldData();

    // Update price history for each segment
    this.updatePriceHistory(segments, now);

    return {
      totalMarketValue: this.calculateTotalMarketValue(segments),
      growthRate: this.calculateOverallGrowthRate(),
      marketSegments: segments,
      liquidityMetrics,
      yieldData,
    };
  }

  /**
   * Generate comprehensive RWA market analytics
   */
  generateAnalytics(currentData: RWAMarketData): RWAMarketAnalytics {
    return {
      currentData,
      trends: this.analyzeTrends(),
      innovations: this.generateInnovations(),
      liquidityAnalysis: this.analyzeLiquidity(currentData),
      competitiveAnalysis: this.generateCompetitiveAnalysis(),
      investmentFlows: this.analyzeInvestmentFlows(),
    };
  }

  // ===== PRIVATE CALCULATION METHODS =====

  private updateMarketState(currentTime: number): void {
    // Update growth momentum with market cycles
    Object.keys(this.marketState.growthMomentum).forEach(segment => {
      const currentMomentum = this.marketState.growthMomentum[segment];
      const cyclicalComponent = Math.sin((currentTime / (1000 * 60 * 60 * 24 * 30)) * 2 * Math.PI) * 0.05; // Monthly cycle
      const randomShock = (Math.random() - 0.5) * 0.02;

      this.marketState.growthMomentum[segment] = Math.max(0,
        currentMomentum * 0.98 + cyclicalComponent + randomShock);
    });

    // Update institutional adoption (gradual increase)
    this.marketState.institutionalAdoption = Math.min(0.95,
      this.marketState.institutionalAdoption + (Math.random() * 0.001));

    // Update liquidity trend (market maturation)
    this.marketState.liquidityTrend = Math.min(1.0,
      this.marketState.liquidityTrend + (Math.random() - 0.3) * 0.002);

    // Innovation cycles
    const timeSinceLastInnovation = currentTime - this.marketState.lastInnovationTime;
    if (timeSinceLastInnovation > 14 * 24 * 60 * 60 * 1000) { // 2 weeks
      this.marketState.innovationIndex = Math.min(1.0, this.marketState.innovationIndex + 0.1);
      this.marketState.lastInnovationTime = currentTime;
    }
  }

  private calculateSegmentValues(): RWAMarketData['marketSegments'] {
    const base = this.baseMarketData.marketSegments;
    const growthFactors = this.marketState.growthMomentum;

    return {
      realEstate: {
        value: base.realEstate * (1 + growthFactors.realEstate),
        growthRate: this.calculateSegmentGrowthRate('realEstate'),
        topAssets: this.generateTopAssets('realEstate'),
      },
      privateEquity: {
        value: base.privateCredit * (1 + growthFactors.privateEquity),
        growthRate: this.calculateSegmentGrowthRate('privateEquity'),
        topAssets: this.generateTopAssets('privateEquity'),
      },
      infrastructure: {
        value: base.infrastructure * (1 + growthFactors.infrastructure),
        growthRate: this.calculateSegmentGrowthRate('infrastructure'),
        topAssets: this.generateTopAssets('infrastructure'),
      },
      commodities: {
        value: base.commodities * (1 + growthFactors.commodities),
        growthRate: this.calculateSegmentGrowthRate('commodities'),
        topAssets: this.generateTopAssets('commodities'),
      },
    };
  }

  private calculateSegmentGrowthRate(segment: string): number {
    const baseMomentum = this.marketState.growthMomentum[segment] * 100;
    const institutionalBoost = this.marketState.institutionalAdoption * 20;
    const regulatoryBoost = this.marketState.regulatoryClarity * 15;
    const randomVariation = (Math.random() - 0.5) * 10;

    return Math.max(0, baseMomentum + institutionalBoost + regulatoryBoost + randomVariation);
  }

  private generateTopAssets(segment: string): Array<{ name: string; value: number; yieldRate: number }> {
    const assetTemplates = {
      realEstate: [
        { name: 'Commercial Property Portfolio', baseValue: 45000000, baseYield: 7.5 },
        { name: 'Residential REIT Token', baseValue: 38000000, baseYield: 6.2 },
        { name: 'Industrial Real Estate Fund', baseValue: 32000000, baseYield: 8.1 },
        { name: 'Retail Property Token', baseValue: 28000000, baseYield: 5.8 },
        { name: 'Mixed-Use Development', baseValue: 25000000, baseYield: 7.2 },
      ],
      privateEquity: [
        { name: 'Growth Tech Fund Token', baseValue: 85000000, baseYield: 14.2 },
        { name: 'Healthcare PE Token', baseValue: 72000000, baseYield: 12.8 },
        { name: 'CleanTech Venture Fund', baseValue: 58000000, baseYield: 16.5 },
        { name: 'FinTech Growth Fund', baseValue: 51000000, baseYield: 18.3 },
        { name: 'Industrial PE Token', baseValue: 44000000, baseYield: 11.7 },
      ],
      infrastructure: [
        { name: 'WREI Infrastructure Token', baseValue: 28000000, baseYield: 9.2 },
        { name: 'Renewable Energy Portfolio', baseValue: 24000000, baseYield: 8.8 },
        { name: 'Transport Infrastructure', baseValue: 21000000, baseYield: 7.5 },
        { name: 'Water Infrastructure Fund', baseValue: 18000000, baseYield: 6.9 },
        { name: 'Digital Infrastructure', baseValue: 16000000, baseYield: 10.1 },
      ],
      commodities: [
        { name: 'Precious Metals Token', baseValue: 42000000, baseYield: 4.2 },
        { name: 'Agricultural Commodities', baseValue: 35000000, baseYield: 6.8 },
        { name: 'Energy Commodities Fund', baseValue: 29000000, baseYield: 8.1 },
        { name: 'Industrial Metals Token', baseValue: 26000000, baseYield: 5.5 },
        { name: 'Carbon Credits Portfolio', baseValue: 22000000, baseYield: 12.4 },
      ],
    };

    const templates = assetTemplates[segment as keyof typeof assetTemplates];
    const growthFactor = 1 + this.marketState.growthMomentum[segment];
    const marketVolatility = 0.15; // 15% volatility

    return templates.slice(0, 3).map(template => ({
      name: template.name,
      value: Math.round(template.baseValue * growthFactor * (1 + (Math.random() - 0.5) * marketVolatility)),
      yieldRate: Math.round((template.baseYield * (1 + (Math.random() - 0.5) * 0.2)) * 100) / 100,
    }));
  }

  private calculateTotalMarketValue(segments: RWAMarketData['marketSegments']): number {
    return segments.realEstate.value + segments.privateEquity.value +
           segments.infrastructure.value + segments.commodities.value;
  }

  private calculateOverallGrowthRate(): number {
    const segmentWeights = {
      realEstate: 0.35,
      privateEquity: 0.30,
      infrastructure: 0.20,
      commodities: 0.15,
    };

    return Object.entries(segmentWeights).reduce((totalGrowth, [segment, weight]) => {
      return totalGrowth + (this.marketState.growthMomentum[segment] * 100 * weight);
    }, 0);
  }

  private generateLiquidityMetrics(): RWAMarketData['liquidityMetrics'] {
    const liquidityIndex = this.marketState.liquidityTrend;
    const institutionalFactor = this.marketState.institutionalAdoption;

    return {
      dailyTradingVolume: Math.round((8000000 + Math.random() * 12000000) * liquidityIndex),
      averageTradeSize: Math.round((400000 + Math.random() * 600000) * institutionalFactor),
      activeTokens: 180 + Math.floor(Math.random() * 70),
    };
  }

  private generateYieldData(): RWAMarketData['yieldData'] {
    const marketConditions = (this.marketState.growthMomentum.realEstate +
                            this.marketState.growthMomentum.privateEquity +
                            this.marketState.growthMomentum.infrastructure +
                            this.marketState.growthMomentum.commodities) / 4;

    const baseYield = 9.2;
    const marketAdjustment = marketConditions * 20; // Market conditions affect yield
    const riskPremium = (1 - this.marketState.regulatoryClarity) * 5; // Regulatory uncertainty adds risk premium

    const averageYield = baseYield + marketAdjustment + riskPremium;

    return {
      averageYield: Math.round(averageYield * 100) / 100,
      yieldRange: [
        Math.round((averageYield * 0.5) * 100) / 100,
        Math.round((averageYield * 1.8) * 100) / 100,
      ],
      riskAdjustedYield: Math.round((averageYield * 0.85) * 100) / 100, // 15% risk adjustment
    };
  }

  private updatePriceHistory(segments: RWAMarketData['marketSegments'], timestamp: number): void {
    Object.entries(segments).forEach(([segmentName, segmentData]) => {
      const history = this.marketState.priceHistory[segmentName];
      history.push({
        timestamp,
        value: segmentData.value,
      });

      // Maintain 30 days of hourly data (720 points)
      if (history.length > 720) {
        history.shift();
      }
    });
  }

  // ===== ANALYTICS METHODS =====

  private analyzeTrends(): RWAMarketTrend[] {
    const trends: RWAMarketTrend[] = [];
    const segments = ['realEstate', 'privateEquity', 'infrastructure', 'commodities'] as const;

    segments.forEach(segment => {
      const momentum = this.marketState.growthMomentum[segment];
      const history = this.marketState.priceHistory[segment];

      let direction: RWAMarketTrend['direction'] = 'growth';
      if (momentum < 0.05) direction = 'consolidation';
      if (momentum < 0) direction = 'decline';

      const strength = Math.min(100, momentum * 400); // Scale to 0-100

      trends.push({
        segment,
        direction,
        strength: Math.round(strength),
        drivers: this.getTrendDrivers(segment, direction),
        projectedGrowth: momentum * 100,
        riskFactors: this.getRiskFactors(segment),
      });
    });

    return trends;
  }

  private getTrendDrivers(segment: string, direction: RWAMarketTrend['direction']): string[] {
    const driverMap = {
      realEstate: {
        growth: ['institutional adoption', 'yield seeking', 'liquidity improvements', 'regulatory clarity'],
        consolidation: ['market maturation', 'competitive pressures', 'standardization'],
        decline: ['interest rate headwinds', 'regulatory uncertainty', 'liquidity concerns'],
      },
      privateEquity: {
        growth: ['high returns', 'democratized access', 'institutional interest', 'technology enablement'],
        consolidation: ['market saturation', 'due diligence challenges', 'fee compression'],
        decline: ['market volatility', 'due diligence complexity', 'regulatory scrutiny'],
      },
      infrastructure: {
        growth: ['ESG mandates', 'government backing', 'stable yields', 'inflation protection'],
        consolidation: ['project completion cycles', 'capital allocation shifts'],
        decline: ['policy changes', 'construction delays', 'financing challenges'],
      },
      commodities: {
        growth: ['inflation hedge demand', 'supply chain digitization', 'institutional access'],
        consolidation: ['price stabilization', 'market efficiency improvements'],
        decline: ['price volatility concerns', 'storage complexities', 'regulatory challenges'],
      },
    };

    return driverMap[segment as keyof typeof driverMap][direction] || [];
  }

  private getRiskFactors(segment: string): string[] {
    const riskMap = {
      realEstate: ['interest rate sensitivity', 'liquidity constraints', 'property management complexity'],
      privateEquity: ['illiquidity premium', 'due diligence requirements', 'market valuation cycles'],
      infrastructure: ['regulatory changes', 'construction risks', 'long payback periods'],
      commodities: ['price volatility', 'storage costs', 'physical delivery complexities'],
    };

    return riskMap[segment as keyof typeof riskMap] || [];
  }

  private generateInnovations(): RWAMarketInnovation[] {
    const innovations: RWAMarketInnovation[] = [];

    // Generate innovations based on innovation index
    if (Math.random() < this.marketState.innovationIndex * 0.3) {
      const innovationTemplates: RWAMarketInnovation[] = [
        {
          category: 'tokenization_standard',
          title: 'Enhanced ERC-3643 Compliance Framework',
          description: 'New tokenization standard with built-in regulatory compliance and automated reporting',
          impactLevel: 'high',
          adoptionTimeline: '6-12 months',
          keyPlayers: ['Zoniqx', 'Polymesh', 'SecurityToken.io'],
        },
        {
          category: 'custody_solution',
          title: 'Institutional Multi-Asset Custody Platform',
          description: 'Integrated custody solution supporting multiple RWA token types with regulatory oversight',
          impactLevel: 'transformative',
          adoptionTimeline: '12-18 months',
          keyPlayers: ['Fireblocks', 'BitGo', 'Anchorage Digital'],
        },
        {
          category: 'trading_protocol',
          title: 'Cross-Chain RWA Liquidity Protocol',
          description: 'Decentralized protocol enabling RWA token trading across multiple blockchain networks',
          impactLevel: 'medium',
          adoptionTimeline: '3-6 months',
          keyPlayers: ['Aave', '1inch', 'Uniswap Labs'],
        },
        {
          category: 'regulatory_framework',
          title: 'Global RWA Tokenization Standards',
          description: 'International regulatory framework for cross-border RWA token issuance and trading',
          impactLevel: 'transformative',
          adoptionTimeline: '18-24 months',
          keyPlayers: ['IOSCO', 'FSB', 'Basel Committee'],
        },
      ];

      innovations.push(innovationTemplates[Math.floor(Math.random() * innovationTemplates.length)]);
    }

    return innovations;
  }

  private analyzeLiquidity(marketData: RWAMarketData): RWALiquidityAnalysis {
    const liquidityScore = this.marketState.liquidityTrend * 100;

    return {
      overallLiquidity: {
        score: Math.round(liquidityScore),
        trend: liquidityScore > 70 ? 'improving' : liquidityScore > 40 ? 'stable' : 'declining',
        factors: ['institutional participation', 'market maker activity', 'regulatory clarity', 'technology advancement'],
      },
      segmentLiquidity: {
        realEstate: {
          dailyVolume: marketData.liquidityMetrics.dailyTradingVolume * 0.35,
          averageTradeSize: marketData.liquidityMetrics.averageTradeSize * 0.8,
          timeToExecution: 4 + Math.random() * 8,
          marketMakersActive: 8 + Math.floor(Math.random() * 5),
        },
        privateEquity: {
          dailyVolume: marketData.liquidityMetrics.dailyTradingVolume * 0.25,
          averageTradeSize: marketData.liquidityMetrics.averageTradeSize * 1.5,
          timeToExecution: 8 + Math.random() * 16,
          marketMakersActive: 4 + Math.floor(Math.random() * 3),
        },
        infrastructure: {
          dailyVolume: marketData.liquidityMetrics.dailyTradingVolume * 0.25,
          averageTradeSize: marketData.liquidityMetrics.averageTradeSize * 1.2,
          timeToExecution: 6 + Math.random() * 12,
          marketMakersActive: 6 + Math.floor(Math.random() * 4),
        },
        commodities: {
          dailyVolume: marketData.liquidityMetrics.dailyTradingVolume * 0.15,
          averageTradeSize: marketData.liquidityMetrics.averageTradeSize * 0.6,
          timeToExecution: 2 + Math.random() * 4,
          marketMakersActive: 12 + Math.floor(Math.random() * 8),
        },
      },
      institutionalParticipation: {
        percentageOfVolume: this.marketState.institutionalAdoption * 100,
        averageTicketSize: marketData.liquidityMetrics.averageTradeSize * 2.5,
        topInstitutionTypes: ['pension funds', 'sovereign wealth funds', 'family offices', 'insurance companies'],
      },
    };
  }

  private generateCompetitiveAnalysis(): RWAMarketAnalytics['competitiveAnalysis'] {
    return {
      marketLeaders: [
        {
          name: 'Ondo Finance',
          marketShare: 25.3,
          focusArea: 'Tokenized Treasury and Credit',
          competitiveAdvantage: 'First-mover advantage in institutional DeFi',
        },
        {
          name: 'Centrifuge',
          marketShare: 18.7,
          focusArea: 'Invoice and Trade Finance',
          competitiveAdvantage: 'Decentralized credit protocol with real-world collateral',
        },
        {
          name: 'Maple Finance',
          marketShare: 15.2,
          focusArea: 'Institutional Credit',
          competitiveAdvantage: 'Undercollateralized lending with institutional borrowers',
        },
        {
          name: 'Backed Finance',
          marketShare: 12.1,
          focusArea: 'Equity and Bond Tokenization',
          competitiveAdvantage: 'Regulated European framework with traditional asset backing',
        },
      ],
      emergingPlayers: ['Swarm', 'tZERO', 'INX', 'OpenFinance'],
      consolidationActivity: [
        'Multiple custody providers acquiring smaller tokenization platforms',
        'Traditional asset managers partnering with blockchain infrastructure providers',
        'Cross-border regulatory harmonization driving platform consolidation',
      ],
    };
  }

  private analyzeInvestmentFlows(): RWAMarketAnalytics['investmentFlows'] {
    return {
      institutionalInflows: 250000000 + Math.random() * 500000000, // A$250-750M monthly
      retailParticipation: (1 - this.marketState.institutionalAdoption) * 100,
      geographicDistribution: {
        'North America': 40 + Math.random() * 10,
        'Europe': 25 + Math.random() * 10,
        'Asia Pacific': 20 + Math.random() * 10,
        'Australia': 8 + Math.random() * 5,
        'Other': 7 + Math.random() * 5,
      },
    };
  }
}

// ===== EXPORT SINGLETON =====

export const rwaMarketFeed = new RWAMarketFeed();