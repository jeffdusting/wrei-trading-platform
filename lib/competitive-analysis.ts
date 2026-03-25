/**
 * Competitive Analysis Logic
 *
 * Provides market positioning insights, competitor analysis, and strategic positioning
 * for WREI carbon credit and tokenized asset marketplace.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D1: Competitive Positioning Visualisation
 */

import type { InvestorClassification } from '@/lib/types';

/**
 * Competitive positioning dimensions for analysis
 */
export type PositioningDimension =
  | 'price'
  | 'verification_quality'
  | 'liquidity'
  | 'transaction_speed'
  | 'regulatory_compliance'
  | 'market_coverage'
  | 'technology_innovation'
  | 'institutional_focus';

/**
 * Competitor profile in the carbon credit and tokenized asset space
 */
export interface CompetitorProfile {
  id: string;
  name: string;
  category: 'traditional_exchange' | 'digital_marketplace' | 'blockchain_native' | 'compliance_focused';
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: number; // Percentage of total market

  /** Positioning scores across key dimensions (0-100) */
  positioning: Record<PositioningDimension, number>;

  /** Target investor segments */
  targetSegments: InvestorClassification[];

  /** Key differentiators */
  keyFeatures: string[];

  /** Market presence indicators */
  marketMetrics: {
    dailyVolume: number; // USD millions
    totalAssets: number; // USD millions
    activeUsers: number;
    institutionalClients: number;
    averageTransactionSize: number; // USD
  };
}

/**
 * WREI's positioning profile for comparison
 */
export const WREI_PROFILE: CompetitorProfile = {
  id: 'wrei',
  name: 'WREI (Water Roads)',
  category: 'blockchain_native',
  description: 'AI-powered negotiation platform for verified carbon credits with institutional-grade tokenisation',
  strengths: [
    'AI-driven price discovery and negotiation',
    'Comprehensive dMRV verification',
    'Institutional-grade compliance framework',
    'Real-time ESG impact tracking',
    'Zoniqx infrastructure integration'
  ],
  weaknesses: [
    'Emerging market presence',
    'Limited historical track record',
    'Premium pricing for verification'
  ],
  marketShare: 2.5,

  positioning: {
    price: 75, // Premium but justified by quality
    verification_quality: 95, // Industry-leading dMRV
    liquidity: 60, // Building liquidity
    transaction_speed: 90, // T+0 settlement via Zoniqx
    regulatory_compliance: 95, // Comprehensive compliance
    market_coverage: 70, // Growing coverage
    technology_innovation: 95, // AI negotiation + blockchain
    institutional_focus: 90, // Purpose-built for institutions
  },

  targetSegments: ['sophisticated', 'wholesale', 'professional'],

  keyFeatures: [
    'AI-powered negotiation agents',
    'dMRV-verified carbon credits',
    'T+0 atomic settlement',
    'Real-time ESG impact measurement',
    'Institutional onboarding pipeline',
    'Multi-jurisdictional compliance'
  ],

  marketMetrics: {
    dailyVolume: 15.2,
    totalAssets: 450.7,
    activeUsers: 1250,
    institutionalClients: 180,
    averageTransactionSize: 125000,
  }
};

/**
 * Major competitors in the carbon credit and tokenized asset space
 */
export const COMPETITOR_PROFILES: CompetitorProfile[] = [
  {
    id: 'voluntary_carbon_market',
    name: 'VCM Traditional Exchanges',
    category: 'traditional_exchange',
    description: 'Traditional voluntary carbon market exchanges and registries',
    strengths: [
      'Established market presence',
      'High liquidity volumes',
      'Recognized standards (Verra, Gold Standard)',
      'Extensive project coverage'
    ],
    weaknesses: [
      'Manual verification processes',
      'Slow settlement (T+30-90)',
      'Limited transparency',
      'High intermediary costs'
    ],
    marketShare: 45.2,

    positioning: {
      price: 85, // Competitive base pricing
      verification_quality: 60, // Traditional verification
      liquidity: 95, // Highest liquidity
      transaction_speed: 30, // Very slow settlement
      regulatory_compliance: 70, // Established but aging
      market_coverage: 90, // Extensive coverage
      technology_innovation: 25, // Traditional systems
      institutional_focus: 60, // Mixed retail/institutional
    },

    targetSegments: ['retail', 'wholesale', 'sophisticated'],

    keyFeatures: [
      'Established market standards',
      'High volume availability',
      'Multiple credit types',
      'Global project coverage'
    ],

    marketMetrics: {
      dailyVolume: 285.4,
      totalAssets: 12500.0,
      activeUsers: 8500,
      institutionalClients: 950,
      averageTransactionSize: 45000,
    }
  },

  {
    id: 'klima_dao',
    name: 'KlimaDAO & ReFi Protocols',
    category: 'blockchain_native',
    description: 'DeFi-native carbon credit tokenisation and trading protocols',
    strengths: [
      'Full blockchain integration',
      'Automated market makers',
      'Token composability',
      'Community governance'
    ],
    weaknesses: [
      'Limited institutional compliance',
      'Quality verification gaps',
      'Regulatory uncertainty',
      'Volatile tokenomics'
    ],
    marketShare: 8.7,

    positioning: {
      price: 95, // Most competitive pricing
      verification_quality: 40, // Limited verification
      liquidity: 75, // AMM-driven liquidity
      transaction_speed: 95, // Instant settlement
      regulatory_compliance: 35, // Limited compliance
      market_coverage: 50, // Selective projects
      technology_innovation: 85, // DeFi innovation
      institutional_focus: 25, // Retail-focused
    },

    targetSegments: ['retail', 'wholesale'],

    keyFeatures: [
      'Automated market makers',
      'Token staking and rewards',
      'Composable DeFi integration',
      'Community governance'
    ],

    marketMetrics: {
      dailyVolume: 42.1,
      totalAssets: 890.3,
      activeUsers: 15200,
      institutionalClients: 45,
      averageTransactionSize: 8500,
    }
  },

  {
    id: 'cbn_digital',
    name: 'CBN Digital Marketplaces',
    category: 'digital_marketplace',
    description: 'Digital carbon credit marketplaces with technology focus',
    strengths: [
      'Digital-first approach',
      'API integrations',
      'Modern user experience',
      'Portfolio management tools'
    ],
    weaknesses: [
      'Limited verification innovation',
      'Centralized infrastructure',
      'Regional market focus',
      'Scaling challenges'
    ],
    marketShare: 12.8,

    positioning: {
      price: 70, // Competitive with premiums
      verification_quality: 75, // Enhanced digital verification
      liquidity: 65, // Growing liquidity
      transaction_speed: 70, // Moderate settlement speed
      regulatory_compliance: 80, // Strong compliance focus
      market_coverage: 60, // Regional strengths
      technology_innovation: 70, // Digital innovation
      institutional_focus: 75, // Institutional orientation
    },

    targetSegments: ['wholesale', 'sophisticated', 'professional'],

    keyFeatures: [
      'API-first architecture',
      'Portfolio analytics',
      'Compliance automation',
      'Multi-standard support'
    ],

    marketMetrics: {
      dailyVolume: 78.6,
      totalAssets: 2100.5,
      activeUsers: 3200,
      institutionalClients: 420,
      averageTransactionSize: 85000,
    }
  },

  {
    id: 'compliance_specialists',
    name: 'Compliance-First Platforms',
    category: 'compliance_focused',
    description: 'Institutional platforms prioritizing regulatory compliance and reporting',
    strengths: [
      'Regulatory expertise',
      'Institutional relationships',
      'Compliance automation',
      'Audit trail capabilities'
    ],
    weaknesses: [
      'Limited technology innovation',
      'Higher operational costs',
      'Slower market adaptation',
      'Complex user experience'
    ],
    marketShare: 18.5,

    positioning: {
      price: 60, // Premium pricing
      verification_quality: 85, // Strong verification
      liquidity: 55, // Limited liquidity
      transaction_speed: 50, // Traditional settlement
      regulatory_compliance: 95, // Compliance leaders
      market_coverage: 75, // Institutional coverage
      technology_innovation: 40, // Conservative tech
      institutional_focus: 95, // Pure institutional
    },

    targetSegments: ['sophisticated', 'wholesale', 'professional'],

    keyFeatures: [
      'Regulatory compliance automation',
      'Institutional client management',
      'Audit trail and reporting',
      'Multi-jurisdiction support'
    ],

    marketMetrics: {
      dailyVolume: 125.8,
      totalAssets: 4200.0,
      activeUsers: 1800,
      institutionalClients: 650,
      averageTransactionSize: 185000,
    }
  }
];

/**
 * Calculates competitive positioning analysis for WREI against competitors
 */
export const analyzeCompetitivePosition = (
  dimension: PositioningDimension,
  includeWREI: boolean = true
): {
  dimension: PositioningDimension;
  competitors: Array<{
    profile: CompetitorProfile;
    score: number;
    rank: number;
    marketShare: number;
  }>;
  wreiBenchmark: {
    score: number;
    rank: number;
    strengthVsAverage: number;
    topCompetitorGap: number;
  };
} => {
  const allProfiles = includeWREI ? [WREI_PROFILE, ...COMPETITOR_PROFILES] : COMPETITOR_PROFILES;

  // Sort by dimension score
  const sorted = allProfiles
    .map(profile => ({
      profile,
      score: profile.positioning[dimension],
      marketShare: profile.marketShare,
    }))
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  // Calculate WREI-specific metrics
  const wreiItem = sorted.find(item => item.profile.id === 'wrei');
  const competitorScores = sorted.filter(item => item.profile.id !== 'wrei').map(item => item.score);
  const avgCompetitorScore = competitorScores.reduce((a, b) => a + b, 0) / competitorScores.length;
  const topCompetitorScore = Math.max(...competitorScores);

  return {
    dimension,
    competitors: sorted,
    wreiBenchmark: {
      score: wreiItem?.score || 0,
      rank: wreiItem?.rank || 0,
      strengthVsAverage: ((wreiItem?.score || 0) - avgCompetitorScore) / avgCompetitorScore * 100,
      topCompetitorGap: (wreiItem?.score || 0) - topCompetitorScore,
    }
  };
};

/**
 * Generates strategic recommendations based on competitive analysis
 */
export const generateStrategicRecommendations = (
  targetSegment: InvestorClassification
): {
  keyOpportunities: string[];
  competitiveThreats: string[];
  strategicMoves: string[];
  positioningAdvice: string[];
} => {
  const segmentAnalysis = {
    retail: {
      keyOpportunities: [
        'Simplify institutional onboarding for smaller investors',
        'Leverage AI negotiation for better pricing access',
        'Provide educational content on dMRV benefits'
      ],
      competitiveThreats: [
        'DeFi protocols offer lower barriers to entry',
        'Traditional markets have established relationships',
        'Price sensitivity in retail segment'
      ],
      strategicMoves: [
        'Launch retail-friendly interface variant',
        'Partner with wealth management platforms',
        'Create tiered pricing structure'
      ],
      positioningAdvice: [
        'Emphasize quality and verification premium',
        'Highlight long-term value and ESG impact',
        'Simplify technical complexity'
      ]
    },

    wholesale: {
      keyOpportunities: [
        'Bridge gap between traditional and DeFi approaches',
        'Leverage superior settlement speed',
        'Provide comprehensive compliance support'
      ],
      competitiveThreats: [
        'Traditional markets dominate volume',
        'Compliance platforms have regulatory expertise',
        'Digital marketplaces have tech advantage'
      ],
      strategicMoves: [
        'Expand verification coverage rapidly',
        'Build strategic exchange partnerships',
        'Enhance API capabilities'
      ],
      positioningAdvice: [
        'Position as innovation leader with institutional rigor',
        'Emphasize speed and verification quality',
        'Target growth-oriented institutions'
      ]
    },

    sophisticated: {
      keyOpportunities: [
        'Combine best of traditional and blockchain approaches',
        'Leverage AI for superior price discovery',
        'Provide advanced analytics and insights'
      ],
      competitiveThreats: [
        'Compliance specialists dominate high-end market',
        'Traditional exchanges have liquidity advantage',
        'New entrants with specialized focus'
      ],
      strategicMoves: [
        'Develop advanced trading algorithms',
        'Create premium service tiers',
        'Build proprietary market intelligence'
      ],
      positioningAdvice: [
        'Focus on technological differentiation',
        'Emphasize data-driven insights',
        'Target innovation-forward institutions'
      ]
    },

    professional: {
      keyOpportunities: [
        'Serve as technology infrastructure provider',
        'Enable white-label solutions',
        'Provide institutional-grade API access'
      ],
      competitiveThreats: [
        'Large incumbents building internal capabilities',
        'Regulatory uncertainty around tokenisation',
        'Competition for top-tier talent'
      ],
      strategicMoves: [
        'Build enterprise partnership program',
        'Develop regulatory expertise in-house',
        'Create modular technology offerings'
      ],
      positioningAdvice: [
        'Position as infrastructure and technology leader',
        'Emphasize scalability and customization',
        'Focus on partnership rather than competition'
      ]
    }
  };

  return segmentAnalysis[targetSegment] || segmentAnalysis.wholesale;
};

/**
 * Calculates market opportunity size based on competitive landscape
 */
export const calculateMarketOpportunity = (): {
  totalMarketSize: number; // USD millions
  addressableMarket: number; // USD millions based on WREI positioning
  competitorGap: number; // USD millions opportunity from competitor weaknesses
  growthPotential: {
    dimension: PositioningDimension;
    marketShare: number;
    opportunitySize: number;
  }[];
} => {
  const totalDaily = COMPETITOR_PROFILES.reduce((sum, comp) => sum + comp.marketMetrics.dailyVolume, 0);
  const totalAssets = COMPETITOR_PROFILES.reduce((sum, comp) => sum + comp.marketMetrics.totalAssets, 0);

  // Estimate addressable market based on WREI's institutional focus and positioning
  const institutionalSegmentRatio = 0.65; // 65% of market is institutional-focused
  const premiumSegmentRatio = 0.35; // 35% willing to pay premium for quality/speed

  const addressableMarket = totalAssets * institutionalSegmentRatio * premiumSegmentRatio;

  // Identify gaps in competitor positioning for opportunity sizing
  const growthPotential = (['verification_quality', 'transaction_speed', 'technology_innovation', 'institutional_focus'] as PositioningDimension[])
    .map(dimension => {
      const analysis = analyzeCompetitivePosition(dimension, false);
      const avgScore = analysis.competitors.reduce((sum, c) => sum + c.score, 0) / analysis.competitors.length;
      const gap = Math.max(0, 85 - avgScore); // WREI target score vs market average

      return {
        dimension,
        marketShare: gap / 100 * 0.15, // Opportunity correlates to gap
        opportunitySize: totalAssets * (gap / 100 * 0.15)
      };
    });

  const competitorGap = growthPotential.reduce((sum, g) => sum + g.opportunitySize, 0);

  return {
    totalMarketSize: totalAssets,
    addressableMarket,
    competitorGap,
    growthPotential
  };
};

/**
 * Performance benchmark comparison for key metrics
 */
export const benchmarkPerformance = (
  metric: 'volume' | 'transaction_size' | 'user_growth' | 'institutional_penetration'
): {
  wreiBenchmark: number;
  competitorAverage: number;
  topPerformer: { name: string; value: number };
  percentileRank: number;
  improvementTarget: number;
} => {
  const metricExtractor = {
    volume: (p: CompetitorProfile) => p.marketMetrics.dailyVolume,
    transaction_size: (p: CompetitorProfile) => p.marketMetrics.averageTransactionSize,
    user_growth: (p: CompetitorProfile) => p.marketMetrics.activeUsers,
    institutional_penetration: (p: CompetitorProfile) => p.marketMetrics.institutionalClients / p.marketMetrics.activeUsers * 100
  };

  const extract = metricExtractor[metric];
  const wreiBenchmark = extract(WREI_PROFILE);
  const competitorValues = COMPETITOR_PROFILES.map(extract);
  const competitorAverage = competitorValues.reduce((a, b) => a + b, 0) / competitorValues.length;
  const topValue = Math.max(...competitorValues);
  const topPerformer = COMPETITOR_PROFILES.find(p => extract(p) === topValue);

  // Calculate percentile rank
  const allValues = [...competitorValues, wreiBenchmark].sort((a, b) => a - b);
  const wreiRank = allValues.indexOf(wreiBenchmark);
  const percentileRank = (wreiRank / (allValues.length - 1)) * 100;

  // Set improvement target (75th percentile or 20% above current)
  const p75Index = Math.floor(allValues.length * 0.75);
  const improvementTarget = Math.max(allValues[p75Index], wreiBenchmark * 1.2);

  return {
    wreiBenchmark,
    competitorAverage,
    topPerformer: {
      name: topPerformer?.name || 'Unknown',
      value: topValue
    },
    percentileRank,
    improvementTarget
  };
};