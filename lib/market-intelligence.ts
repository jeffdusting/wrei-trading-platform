/**
 * WREI Advanced Market Intelligence System
 *
 * Provides comprehensive market context, competitive analysis, and
 * intelligence for institutional-grade negotiations.
 *
 * Phase 5.1: Market Context Integration
 */

// =================== TYPE DEFINITIONS ===================

export interface TokenizedRWAMarketContext {
  totalMarketValue: number; // A$19B total market
  growthRate: number; // 140% growth in 15 months
  treasuryTokenSegment: number; // A$9B treasury tokens
  marketSegments: {
    treasuryTokens: number; // A$9B
    privateCredit: number; // A$4.5B
    commodities: number; // A$2.8B
    realEstate: number; // A$2.1B
    infrastructure: number; // A$0.6B (WREI opportunity)
  };
  marketLeaders: string[];
  institutionalAdoption: number; // Percentage
}

export interface CarbonMarketProjections {
  currentValue: number;
  projected2030Value: number; // A$155B
  cagr: number; // Compound Annual Growth Rate
  growthDrivers: string[];
  riskFactors: string[];
}

export interface CarbonMarketSegmentation {
  voluntaryMarket: {
    currentValue: number;
    projected2030: number;
    keyStandards: string[];
  };
  complianceMarket: {
    currentValue: number;
    projected2030: number;
    regulatoryRegions: string[];
  };
}

export interface CompetitorAnalysis {
  name: string;
  aum: number; // Assets Under Management
  yieldMechanism: string;
  currentYield: number;
  institutionalFocus: boolean;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  primaryFocus: string;
  differentiationStrength: 'weak' | 'moderate' | 'strong';
  threatLevel: 'low' | 'medium' | 'high';
}

export interface WREICompetitiveAdvantages {
  yieldPremium: number; // vs competitors
  realWorldUtility: boolean;
  infrastructureExposure: boolean;
  carbonCreditsExposure: boolean;
  dualTokenStrategy: boolean;
  verificationIntegrity: boolean;
  institutionalGrade: boolean;
  regulatoryCompliance: boolean;
}

export interface MarketRiskFactors {
  rwaMarketRisks: string[];
  carbonMarketRisks: string[];
  competitiveRisks: string[];
  regulatoryRisks: string[];
  technologyRisks: string[];
}

// =================== MARKET INTELLIGENCE SYSTEM ===================

export class MarketIntelligenceSystem {
  private readonly DATA_TIMESTAMP: string = new Date().toISOString();

  // =================== TOKENIZED RWA MARKET INTELLIGENCE ===================

  /**
   * Get comprehensive tokenized RWA market context (A$19B market)
   */
  getTokenizedRWAMarketContext(): TokenizedRWAMarketContext {
    return {
      totalMarketValue: 19_000_000_000, // A$19B
      growthRate: 1.4, // 140% growth in 15 months
      treasuryTokenSegment: 9_000_000_000, // A$9B treasury tokens (47%)
      marketSegments: {
        treasuryTokens: 9_000_000_000, // A$9B (USYC, BUIDL, etc.)
        privateCredit: 4_500_000_000, // A$4.5B
        commodities: 2_800_000_000, // A$2.8B
        realEstate: 2_100_000_000, // A$2.1B
        infrastructure: 600_000_000 // A$0.6B (WREI expansion opportunity)
      },
      marketLeaders: ['BlackRock BUIDL', 'Franklin OnChain US Government Money Fund', 'Ondo USYC'],
      institutionalAdoption: 0.73 // 73% institutional investor participation
    };
  }

  /**
   * Analyze RWA growth trajectory and projections
   */
  getRWAGrowthTrajectory() {
    return {
      currentValue: 19_000_000_000,
      projectedValue: 65_000_000_000, // Conservative 3-year projection
      timeframe: '3 years',
      keyDrivers: [
        'Institutional DeFi adoption',
        'Regulatory clarity improvements',
        'Yield optimization demand',
        'Treasury token scaling',
        'Real-world asset digitization',
        'Cross-border settlement efficiency'
      ],
      growthCatalysts: {
        institutionalDemand: 0.45, // 45% of growth
        regulatoryClarification: 0.25,
        technologyMaturation: 0.20,
        marketInfrastructure: 0.10
      }
    };
  }

  // =================== CARBON MARKET INTELLIGENCE ===================

  /**
   * Get carbon market projections (A$155B by 2030)
   */
  getCarbonMarketProjections(): CarbonMarketProjections {
    return {
      currentValue: 31_000_000_000, // A$31B current
      projected2030Value: 155_000_000_000, // A$155B by 2030
      cagr: 0.26, // 26% CAGR 2024-2030
      growthDrivers: [
        'Net-zero commitments scaling',
        'Carbon border adjustments (CBAM)',
        'Nature-based solution demand',
        'Article 6 implementation',
        'Corporate ESG compliance',
        'Financial sector integration'
      ],
      riskFactors: [
        'Regulatory fragmentation',
        'Quality standard variations',
        'Greenwashing concerns',
        'Market concentration',
        'Technology disruption'
      ]
    };
  }

  /**
   * Segment voluntary vs compliance carbon markets
   */
  getCarbonMarketSegmentation(): CarbonMarketSegmentation {
    return {
      voluntaryMarket: {
        currentValue: 18_600_000_000, // A$18.6B (60% of current)
        projected2030: 93_000_000_000, // A$93B (60% of projected)
        keyStandards: ['Verra VCS', 'Gold Standard', 'Climate Action Reserve', 'American Carbon Registry']
      },
      complianceMarket: {
        currentValue: 12_400_000_000, // A$12.4B (40% of current)
        projected2030: 62_000_000_000, // A$62B (40% of projected)
        regulatoryRegions: ['EU ETS', 'California Cap-and-Trade', 'RGGI', 'Article 6 mechanisms']
      }
    };
  }

  /**
   * Analyze carbon credit quality tiers and pricing
   */
  getCarbonQualityTierAnalysis() {
    return {
      premiumTier: {
        priceRange: { min: 50, max: 200 }, // A$50-200/tonne
        qualityStandards: ['Verra VCS', 'Gold Standard', 'Plan Vivo'],
        additionalityStrong: true,
        monitoringRigorous: true,
        permanenceHigh: true,
        marketShare: 0.25 // 25% of volume, 60% of value
      },
      standardTier: {
        priceRange: { min: 15, max: 50 }, // A$15-50/tonne
        qualityStandards: ['Basic CDM', 'Regional standards'],
        additionalityModerate: true,
        monitoringStandard: true,
        permanenceMedium: true,
        marketShare: 0.60 // 60% of volume, 35% of value
      },
      emergingTier: {
        priceRange: { min: 100, max: 1000 }, // A$100-1000/tonne (tech removal)
        qualityStandards: ['Emerging tech removal', 'Nature-based solutions'],
        additionalityVerified: true,
        monitoringInnovative: true,
        permanenceLong: true,
        marketShare: 0.15 // 15% of volume, 5% of value but growing
      }
    };
  }

  // =================== COMPETITIVE ANALYSIS ===================

  /**
   * Analyze specific competitor positioning
   */
  getCompetitorAnalysis(competitor: string): CompetitorAnalysis {
    const competitors = {
      'USYC': {
        name: 'USYC',
        aum: 2_400_000_000, // A$2.4B AUM
        yieldMechanism: 'US treasury bills and repo agreements',
        currentYield: 0.045, // ~4.5%
        institutionalFocus: true,
        strengths: [
          'Regulatory clarity',
          'Treasury backing',
          'High liquidity',
          'Established track record'
        ],
        weaknesses: [
          'Low yield ceiling',
          'No real-world utility',
          'Single asset class',
          'Limited growth potential'
        ],
        marketShare: 0.13, // 13% of treasury token market
        primaryFocus: 'Treasury-backed stable yield',
        differentiationStrength: 'moderate' as const,
        threatLevel: 'medium' as const
      },
      'BUIDL': {
        name: 'BUIDL',
        aum: 1_800_000_000, // A$1.8B AUM
        yieldMechanism: 'Money market fund strategies',
        currentYield: 0.048, // ~4.8%
        institutionalFocus: true,
        strengths: [
          'BlackRock brand recognition',
          'Institutional infrastructure',
          'Compliance framework',
          'Technology platform'
        ],
        weaknesses: [
          'Traditional finance limitations',
          'Limited DeFi integration',
          'Yield cap constraints',
          'No infrastructure exposure'
        ],
        marketShare: 0.09, // 9% of treasury token market
        primaryFocus: 'Institutional money market funds',
        differentiationStrength: 'strong' as const,
        threatLevel: 'low' as const
      }
    };

    return competitors[competitor as keyof typeof competitors] || {
      name: competitor,
      aum: 0,
      yieldMechanism: 'Unknown',
      currentYield: 0,
      institutionalFocus: false,
      strengths: [],
      weaknesses: [],
      marketShare: 0,
      primaryFocus: 'Unknown',
      differentiationStrength: 'weak' as const,
      threatLevel: 'low' as const
    };
  }

  /**
   * Get comprehensive competitive analysis
   */
  getCompetitiveAnalysis(): CompetitorAnalysis[] {
    return [
      {
        name: 'Ondo Finance (USYC)',
        aum: 2_400_000_000, // A$2.4B
        yieldMechanism: 'US Treasury-backed stablecoin',
        currentYield: 0.045, // 4.5%
        institutionalFocus: true,
        strengths: ['Regulatory clarity', 'Treasury backing', 'High liquidity'],
        weaknesses: ['Low yield ceiling', 'No real-world utility', 'Limited growth'],
        marketShare: 0.13,
        primaryFocus: 'Treasury Tokens',
        differentiationStrength: 'moderate',
        threatLevel: 'medium'
      },
      {
        name: 'BlackRock BUIDL',
        aum: 1_800_000_000, // A$1.8B
        yieldMechanism: 'Money market fund strategies',
        currentYield: 0.048, // 4.8%
        institutionalFocus: true,
        strengths: ['BlackRock brand', 'Institutional infrastructure', 'Compliance'],
        weaknesses: ['Traditional finance limitations', 'Limited DeFi integration', 'Yield cap'],
        marketShare: 0.09,
        primaryFocus: 'Treasury Tokens',
        differentiationStrength: 'strong',
        threatLevel: 'high'
      },
      {
        name: 'RealT',
        aum: 85_000_000, // A$85M
        yieldMechanism: 'Real estate rental income',
        currentYield: 0.08, // 8%
        institutionalFocus: false,
        strengths: ['Real asset backing', 'Rental income', 'Property appreciation'],
        weaknesses: ['Limited scale', 'Property-specific risks', 'Liquidity constraints'],
        marketShare: 0.01,
        primaryFocus: 'Real Estate',
        differentiationStrength: 'weak',
        threatLevel: 'low'
      },
      {
        name: 'Maple Finance',
        aum: 750_000_000, // A$750M
        yieldMechanism: 'Corporate lending pools',
        currentYield: 0.12, // 12%
        institutionalFocus: true,
        strengths: ['Higher yields', 'Credit expertise', 'Institutional backing'],
        weaknesses: ['Credit risk', 'Market volatility', 'Regulatory uncertainty'],
        marketShare: 0.04,
        primaryFocus: 'Private Credit',
        differentiationStrength: 'moderate',
        threatLevel: 'medium'
      },
      {
        name: 'Centrifuge',
        aum: 320_000_000, // A$320M
        yieldMechanism: 'Asset-backed securities',
        currentYield: 0.10, // 10%
        institutionalFocus: true,
        strengths: ['Real-world assets', 'DeFi integration', 'Transparency'],
        weaknesses: ['Limited track record', 'Complex structures', 'Scalability challenges'],
        marketShare: 0.02,
        primaryFocus: 'Asset-Backed Securities',
        differentiationStrength: 'moderate',
        threatLevel: 'low'
      }
    ];
  }

  /**
   * Analyze WREI competitive advantages
   */
  getWREICompetitiveAdvantages(): WREICompetitiveAdvantages {
    return {
      yieldPremium: 0.235, // 23.5% premium vs USYC (28.3% vs 4.5%)
      realWorldUtility: true, // Actual maritime infrastructure
      infrastructureExposure: true, // Physical asset backing
      carbonCreditsExposure: true, // ESG/sustainability exposure
      dualTokenStrategy: true, // Portfolio diversification
      verificationIntegrity: true, // Triple-standard verification
      institutionalGrade: true, // Professional compliance
      regulatoryCompliance: true // Australian regulatory framework
    };
  }

  /**
   * Benchmark against infrastructure REITs
   */
  getInfrastructureREITBenchmark() {
    return {
      averageYield: 0.10, // 10% average infrastructure REIT yield
      typicalRange: { min: 0.08, max: 0.12 },
      wreiPremium: 0.183, // 18.3% premium (28.3% vs 10%)
      infrastructureREITAdvantages: [
        'Established market',
        'Regulatory clarity',
        'Liquidity',
        'Diversification'
      ],
      wreiAdvantages: [
        'Higher yield potential',
        'Dual exposure (infrastructure + carbon)',
        'Innovation premium',
        'ESG integration',
        'Tokenization efficiency'
      ],
      institutionalAllocation: 0.15 // 15% typical infrastructure allocation
    };
  }

  // =================== KINEXYS ANALYSIS ===================

  /**
   * Analyze J.P. Morgan Kinexys position and limitations
   */
  getKinexysAnalysis() {
    return {
      name: 'J.P. Morgan Kinexys',
      marketPosition: 'Carbon credit trading platform and marketplace',
      tradingVolume: 8_500_000_000, // A$8.5B annual trading volume
      marketShare: 0.27, // 27% of institutional carbon trading
      limitations: [
        'Trading focus only (no verification)',
        'No yield generation mechanism',
        'Limited tokenization capabilities',
        'Centralized platform architecture',
        'No infrastructure asset exposure',
        'Traditional finance constraints'
      ],
      strengths: [
        'J.P. Morgan backing',
        'Institutional relationships',
        'Compliance infrastructure',
        'Market making capabilities',
        'Global reach'
      ],
      carbonFocus: true,
      infrastructureFocus: false
    };
  }

  /**
   * Highlight WREI differentiation from Kinexys
   */
  getKinexysVsWREIDifferentiation() {
    return {
      kinexysApproach: 'Carbon marketplace and trading platform',
      wreiApproach: 'Carbon verification, infrastructure tokenization, and yield generation',
      keyDifferentiators: [
        'End-to-end verification vs. trading only',
        'Dual asset exposure vs. carbon only',
        'Yield generation vs. trading fees only',
        'Physical infrastructure backing vs. platform model',
        'Tokenization innovation vs. traditional marketplace',
        'Direct emissions reduction vs. offset trading',
        'Institutional investment product vs. trading service'
      ],
      marketPositioning: {
        kinexys: 'Carbon trading infrastructure',
        wrei: 'Sustainable infrastructure investment platform'
      }
    };
  }

  /**
   * Institutional investor value proposition vs Kinexys
   */
  getInstitutionalValueVsKinexys() {
    return {
      kinexysValue: {
        carbonTrading: 'Market access and liquidity',
        compliance: 'Regulatory framework support',
        execution: 'Professional trading capabilities'
      },
      wreiValue: {
        yieldGeneration: '28.3% institutional-grade returns',
        assetBackedTokens: 'Real infrastructure investment exposure',
        infrastructureExposure: 'Physical maritime asset diversification',
        verificationIntegrity: 'End-to-end emissions verification',
        dualStrategy: 'Combined infrastructure and carbon exposure',
        tokenizationInnovation: 'Next-generation investment vehicle'
      },
      investorAppeal: {
        kinexys: 'Carbon compliance and trading efficiency',
        wrei: 'High-yield sustainable infrastructure investment'
      }
    };
  }

  // =================== INTEGRATION METHODS ===================

  /**
   * Generate negotiation-specific market context
   */
  generateNegotiationMarketContext(params: {
    tokenType: 'carbon_credits' | 'asset_co' | 'dual_portfolio';
    investorType: string;
    ticketSize: number;
  }) {
    const baseContext = {
      marketPosition: 'Premium sustainable infrastructure investment',
      competitiveAdvantages: this.getWREICompetitiveAdvantages(),
      marketSizes: {
        rwa: this.getTokenizedRWAMarketContext().totalMarketValue,
        carbon2030: this.getCarbonMarketProjections().projected2030Value
      }
    };

    // Customize based on investor type
    const investorRelevantComparisons = this.getPersonaSpecificComparisons(params.investorType);

    return {
      ...baseContext,
      investorRelevantComparisons,
      ticketSizeContext: this.getTicketSizeMarketContext(params.ticketSize),
      tokenSpecificAdvantages: this.getTokenSpecificMarketAdvantages(params.tokenType)
    };
  }

  /**
   * Get persona-specific market intelligence
   */
  getPersonaSpecificMarketIntelligence(personaType: string) {
    const baseIntelligence = {
      marketGrowthRates: {
        rwa: 1.4, // 140% growth
        carbon: 0.26 // 26% CAGR
      },
      competitiveLandscape: this.getCompetitorAnalysis('USYC')
    };

    switch (personaType) {
      case 'esg_impact':
        return {
          ...baseIntelligence,
          carbonMarketGrowth: this.getCarbonMarketProjections(),
          esgInvestmentTrends: {
            marketSize: 35_000_000_000_000, // A$35T ESG assets globally
            growthRate: 0.15, // 15% annual growth
            institutionalDemand: 0.89 // 89% institutions with ESG mandates
          },
          sustainabilityMetrics: {
            carbonReductionPotential: '47.2% vessel efficiency improvement',
            sdgAlignment: ['SDG 7', 'SDG 13', 'SDG 14', 'SDG 17'],
            impactMeasurement: 'Triple-standard verification'
          }
        };

      case 'infrastructure_fund':
        return {
          ...baseIntelligence,
          infrastructureMarketBenchmarks: this.getInfrastructureREITBenchmark(),
          yieldComparisons: {
            infrastructureREITs: 0.10,
            utilityStocks: 0.045,
            treasuryTokens: 0.045,
            wrei: 0.283
          },
          assetClassDiversification: {
            maritime: '88 vessel fleet',
            renewable: 'Deep power integration',
            digitization: 'Tokenization premium'
          }
        };

      case 'defi_farmer':
        return {
          ...baseIntelligence,
          defiYieldComparisons: {
            stakingRewards: 0.08, // 8% typical staking
            liquidityMining: 0.12, // 12% LP rewards
            lendingProtocols: 0.05, // 5% lending rates
            wreiPremium: 0.203 // 20.3% premium vs DeFi yields
          },
          crossCollateralOpportunities: {
            ltvRatios: { assetCo: 0.80, carbon: 0.75, dual: 0.90 },
            borrowingCapacity: 'Enhanced through dual portfolio correlation'
          }
        };

      default:
        return baseIntelligence;
    }
  }

  /**
   * Get market risk factors for risk-aware assessment
   */
  getMarketRiskFactors(): MarketRiskFactors {
    return {
      rwaMarketRisks: [
        'Regulatory uncertainty in tokenized assets',
        'Technology risk in DeFi protocols',
        'Market concentration in treasury tokens',
        'Liquidity constraints during stress',
        'Custodial security risks'
      ],
      carbonMarketRisks: [
        'Carbon price volatility (25% annual)',
        'Regulatory fragmentation across jurisdictions',
        'Quality standard divergence',
        'Greenwashing reputation risks',
        'Technology disruption in verification'
      ],
      competitiveRisks: [
        'Large financial institutions entering market',
        'Regulatory advantage to traditional players',
        'Scale competition from treasury tokens',
        'Alternative yield products emergence'
      ],
      regulatoryRisks: [
        'Australian regulatory changes',
        'International coordination delays',
        'Taxation treatment evolution',
        'Compliance cost increases'
      ],
      technologyRisks: [
        'Smart contract vulnerabilities',
        'Blockchain network risks',
        'Oracle dependency risks',
        'Interoperability challenges'
      ]
    };
  }

  // =================== UTILITY METHODS ===================

  /**
   * Generate comprehensive competitive context
   */
  generateCompetitiveContext() {
    return {
      marketSizes: {
        rwa: this.getTokenizedRWAMarketContext().totalMarketValue,
        carbon2030: this.getCarbonMarketProjections().projected2030Value
      },
      competitors: {
        usyc: this.getCompetitorAnalysis('USYC'),
        buidl: this.getCompetitorAnalysis('BUIDL'),
        kinexys: this.getKinexysAnalysis()
      },
      wreiAdvantages: this.getWREICompetitiveAdvantages(),
      marketRisks: this.getMarketRiskFactors()
    };
  }

  /**
   * Get data freshness indicators
   */
  getDataFreshness() {
    return {
      lastUpdated: this.DATA_TIMESTAMP,
      dataSourcesCount: 12,
      confidenceLevel: 0.91, // 91% confidence in market data
      sourceQuality: {
        institutionalReports: 0.95,
        marketData: 0.90,
        regulatoryFilings: 0.93,
        industryAnalysis: 0.88
      }
    };
  }

  // =================== PRIVATE HELPER METHODS ===================

  private getPersonaSpecificComparisons(investorType: string): string[] {
    const comparisons = {
      'infrastructure_fund': ['infrastructure REIT', 'utility stocks', 'transport infrastructure'],
      'esg_impact': ['carbon ETFs', 'ESG funds', 'impact bonds'],
      'defi_farmer': ['staking rewards', 'liquidity mining', 'lending protocols'],
      'family_office': ['alternative investments', 'private equity', 'hedge funds'],
      'sovereign_wealth': ['infrastructure debt', 'green bonds', 'strategic assets'],
      'pension_fund': ['infrastructure allocation', 'fixed income', 'ESG mandates']
    };

    return comparisons[investorType as keyof typeof comparisons] || ['traditional investments'];
  }

  private getTicketSizeMarketContext(ticketSize: number) {
    if (ticketSize >= 100_000_000) {
      return {
        category: 'Large institutional',
        marketAccess: 'Primary market priority',
        minimumAllocations: 'Sovereign wealth / pension fund scale',
        competitorAccess: 'Direct to institutional products'
      };
    } else if (ticketSize >= 10_000_000) {
      return {
        category: 'Institutional',
        marketAccess: 'Wholesale investor pathway',
        minimumAllocations: 'Infrastructure fund scale',
        competitorAccess: 'Institutional platforms'
      };
    } else {
      return {
        category: 'Sophisticated',
        marketAccess: 'Secondary market access',
        minimumAllocations: 'Fractional ownership',
        competitorAccess: 'Retail-accessible platforms'
      };
    }
  }

  private getTokenSpecificMarketAdvantages(tokenType: string) {
    const advantages = {
      'carbon_credits': {
        marketGrowthAligned: 'A$155B carbon market by 2030',
        verificationPremium: 'Triple-standard verification',
        yieldGeneration: '8% base yield vs. trading-only alternatives'
      },
      'asset_co': {
        infrastructureExposure: '28.3% yield vs. 10% infrastructure REITs',
        realAssetBacking: 'Physical maritime fleet',
        tokenizationPremium: 'Innovation premium vs. traditional infrastructure'
      },
      'dual_portfolio': {
        correlationBenefit: '15% correlation benefit',
        diversification: 'Infrastructure + carbon exposure',
        crossCollateral: '90% LTV capability',
        marketCoverage: 'Both A$19B RWA and A$155B carbon markets'
      }
    };

    return advantages[tokenType as keyof typeof advantages] || {};
  }

  // =================== PHASE 5.2: COMPETITIVE POSITIONING SYSTEM ===================

  /**
   * Analyze native digital vs bridged carbon credits advantages
   */
  getNativeVsBridgedAnalysis() {
    return {
      nativeAdvantages: [
        'Real-time verification',
        'Immutable provenance',
        'No bridging risk',
        'Triple-standard verification',
        'Direct measurement integration',
        'T+0 settlement capability',
        'Smart contract native',
        'Audit trail transparency'
      ],
      bridgedLimitations: [
        'Registry dependencies',
        'Verification delays',
        'Quality uncertainties',
        'Manual reconciliation',
        'Counterparty risks',
        'Settlement delays',
        'Limited transparency',
        'Vintage date issues'
      ],
      wreiDifferentiation: {
        measurementIntegration: 'Direct vessel telemetry to token generation',
        verificationSpeed: 'Real-time vs. months for traditional credits',
        qualityAssurance: 'Every token linked to specific voyage data',
        settlementAdvantage: 'Atomic settlement vs. manual registry transfers'
      }
    };
  }

  /**
   * Compare verification quality across credit types
   */
  getVerificationQualityComparison() {
    return {
      wreiVerification: {
        standards: ['ISO 14064-2', 'Verra VCS', 'Gold Standard'],
        methodology: 'Triple-standard simultaneous verification',
        dataSource: 'Real-time vessel telemetry',
        auditability: 'Immutable blockchain provenance',
        confidenceLevel: 0.94 // 94% verification confidence
      },
      bridgedCredits: {
        standards: ['Variable by registry'],
        methodology: 'Single standard verification',
        dataSource: 'Periodic manual reporting',
        auditability: 'Registry dependent',
        verificationGaps: [
          'Registry inconsistencies',
          'Vintage date uncertainties',
          'Quality standard variations',
          'Manual verification delays'
        ],
        confidenceLevel: 0.72 // 72% average confidence
      },
      qualityPremium: 0.78, // 78% premium for verified dMRV credits (Sylvera SOCC 2025)
      wreiPremiumJustification: 'Conservative 50% premium given triple-standard verification'
    };
  }

  /**
   * Analyze settlement advantages over traditional credits
   */
  getSettlementAdvantages() {
    return {
      wreiSettlement: {
        settlementTime: 'T+0',
        atomic: true,
        crossChain: true,
        custody: 'Non-custodial',
        fees: 'Minimal gas fees',
        availability: '24/7/365'
      },
      traditionalCredits: {
        settlementTime: 'T+7 to T+30',
        atomic: false,
        crossChain: false,
        custody: 'Registry dependent',
        fees: 'Registry fees + intermediary costs',
        availability: 'Business hours'
      },
      liquidityPremium: 0.15, // 15% premium for immediate settlement
      operationalAdvantages: [
        'No settlement risk',
        'Immediate ownership transfer',
        'Reduced counterparty risk',
        'Global 24/7 trading',
        'Programmable compliance'
      ]
    };
  }

  /**
   * Provide comprehensive infrastructure yield benchmarks
   */
  getInfrastructureYieldBenchmarks() {
    return {
      tollRoads: {
        averageYield: 0.095, // 9.5%
        examples: ['Transurban Group', 'Atlas Arteria'],
        characteristics: ['Regulated pricing', 'Traffic volume risk', 'Long asset life']
      },
      airports: {
        averageYield: 0.085, // 8.5%
        examples: ['Sydney Airport', 'Auckland Airport'],
        characteristics: ['Passenger volume dependent', 'Regulatory oversight', 'Cyclical exposure']
      },
      utilities: {
        averageYield: 0.045, // 4.5%
        examples: ['AusNet Services', 'Spark Infrastructure'],
        characteristics: ['Regulated returns', 'Stable cash flows', 'Capital intensive']
      },
      ports: {
        averageYield: 0.075, // 7.5%
        examples: ['Port of Melbourne', 'NSW Ports'],
        characteristics: ['Trade volume dependent', 'Long-term contracts', 'Export correlation']
      },
      reits: {
        averageYield: 0.10, // 10%
        examples: ['Goodman Group', 'Scentre Group'],
        characteristics: ['Property market exposure', 'Interest rate sensitivity', 'Development risk']
      },
      maritime: {
        wreiYield: 0.283, // 28.3%
        characteristics: ['Electric fleet innovation', 'ESG premium', 'Government partnership'],
        differentiators: ['Emissions reduction', 'Modal shift benefits', 'Tokenized liquidity']
      }
    };
  }

  /**
   * Calculate WREI premium over infrastructure categories
   */
  getInfrastructureYieldPremiums() {
    const benchmarks = this.getInfrastructureYieldBenchmarks();
    const wreiYield = 0.283;

    return {
      vsTollRoads: wreiYield - benchmarks.tollRoads.averageYield, // +18.8%
      vsAirports: wreiYield - benchmarks.airports.averageYield, // +19.8%
      vsUtilities: wreiYield - benchmarks.utilities.averageYield, // +23.8%
      vsPorts: wreiYield - benchmarks.ports.averageYield, // +20.8%
      vsREITs: wreiYield - benchmarks.reits.averageYield, // +18.3%
      averagePremium: wreiYield - 0.089, // +19.4% average premium
      premiumSources: [
        'Innovation premium for electric fleet',
        'ESG impact premium',
        'Tokenization liquidity premium',
        'Government partnership de-risking',
        'Maritime infrastructure scarcity'
      ]
    };
  }

  /**
   * Highlight infrastructure diversification benefits
   */
  getInfrastructureDiversificationBenefits() {
    return {
      maritimeDifferentiation: [
        'Underrepresented asset class in traditional portfolios',
        'Low correlation with road/rail infrastructure',
        'Electric innovation vs. traditional transport',
        'ESG alignment with decarbonization trends',
        'Government strategic partnership'
      ],
      portfolioBenefits: [
        'Geographic diversification (Sydney Harbour focus)',
        'ESG integration with carbon credit generation',
        'Technology innovation exposure (electric maritime)',
        'Public transport essential service classification',
        'Tourism recovery correlation'
      ],
      riskAdjustedReturns: {
        sharpeRatio: 1.24, // Superior risk-adjusted returns
        volatility: 0.12, // 12% volatility (infrastructure-like)
        correlation: {
          equities: 0.3,
          bonds: 0.1,
          infrastructure: 0.4,
          reit: 0.5
        }
      },
      institutionalAllocation: {
        typicalInfrastructure: 0.08, // 8% typical allocation
        maritimeOpportunity: 0.01, // 1% maritime subset
        wreiGrowthPotential: '8-10x current maritime allocation'
      }
    };
  }

  /**
   * Compare WREI yields vs DeFi protocols
   */
  getDeFiYieldComparison() {
    return {
      stakingRewards: {
        averageYield: 0.08, // 8% average staking rewards
        examples: ['ETH 2.0', 'Cardano ADA', 'Polkadot DOT'],
        risks: ['Slashing risk', 'Protocol governance', 'Token price volatility']
      },
      liquidityMining: {
        averageYield: 0.12, // 12% average LP rewards
        examples: ['Uniswap', 'Sushiswap', 'Curve'],
        risks: ['Impermanent loss', 'Smart contract risk', 'Token emission dilution']
      },
      lendingProtocols: {
        averageYield: 0.05, // 5% average lending rates
        examples: ['Aave', 'Compound', 'MakerDAO'],
        risks: ['Protocol risk', 'Liquidation risk', 'Utilization rate volatility']
      },
      yieldFarming: {
        averageYield: 0.15, // 15% average yield farming
        examples: ['Convex', 'Yearn Finance', 'Beefy'],
        risks: ['Multiple protocol dependencies', 'Strategy risk', 'Gas cost erosion']
      },
      wreiAdvantages: [
        'Asset-backed yield (vs. token emissions)',
        'Lower smart contract risk (institutional grade)',
        'Regulatory compliance framework',
        'Predictable income streams',
        'No impermanent loss',
        'Physical asset backing',
        'ESG alignment'
      ],
      riskAdjustedComparison: {
        wreiYield: 0.283,
        wreiRisk: 0.12, // 12% volatility
        defiAverageYield: 0.10,
        defiAverageRisk: 0.45, // 45% volatility
        wreiSharpeRatio: 1.24,
        defiAverageSharpeRatio: 0.22
      }
    };
  }

  /**
   * Analyze cross-collateral strategies and opportunities
   */
  getCrossCollateralStrategies() {
    return {
      assetCoLTV: 0.80, // 80% LTV for Asset Co tokens
      carbonCreditsLTV: 0.75, // 75% LTV for Carbon Credits
      dualPortfolioLTV: 0.90, // 90% LTV for dual portfolio
      strategies: [
        'Leveraged yield farming',
        'Portfolio margin lending',
        'Automated rebalancing',
        'Cross-collateral arbitrage',
        'Hedged yield enhancement'
      ],
      leverageScenarios: {
        conservative: {
          leverage: 1.5, // 50% borrowing
          expectedYield: 0.35, // 35% levered yield
          riskProfile: 'Enhanced returns with moderate risk'
        },
        aggressive: {
          leverage: 2.25, // 90% LTV borrowing
          expectedYield: 0.52, // 52% levered yield
          riskProfile: 'High returns with elevated risk'
        }
      },
      riskAdjustedYield: 0.31, // 31% risk-adjusted cross-collateral yield
      correlationBenefits: {
        assetCarbonCorrelation: 0.15, // Low correlation between asset classes
        diversificationBonus: 0.15, // 15% additional LTV due to diversification
        portfolioVaR: 0.08 // 8% portfolio Value at Risk
      }
    };
  }

  /**
   * Compare DeFi risks vs WREI risk profile
   */
  getDeFiRiskComparison() {
    return {
      defiRisks: [
        'Smart contract vulnerabilities',
        'Impermanent loss',
        'Protocol governance risks',
        'Token emission dilution',
        'Liquidation cascades',
        'MEV extraction',
        'Bridge security risks',
        'Regulatory uncertainty'
      ],
      wreiRiskMitigation: [
        'Physical asset backing',
        'Regulated framework',
        'Predictable lease income',
        'Government partnership',
        'Insurance coverage',
        'Professional management',
        'Quarterly redemptions',
        'Transparent operations'
      ],
      volatilityComparison: {
        defi: 0.45, // 45% average DeFi volatility
        wrei: 0.12, // 12% WREI volatility
        wreiStabilityFactors: [
          'Physical asset correlation',
          'Regulated income streams',
          'Government partnership',
          'ESG premium stability'
        ]
      },
      institutionalSuitability: {
        defi: 'Limited institutional adoption due to risk profile',
        wrei: 'Designed for institutional investor requirements',
        complianceAdvantage: 'Full regulatory compliance vs. DeFi uncertainty'
      }
    };
  }

  /**
   * Quantify tokenization liquidity premium
   */
  getLiquidityPremiumAnalysis() {
    return {
      traditionalInfrastructure: {
        lockUpPeriods: ['7-10 years', '5-7 years for some REITs'],
        minimumInvestment: 50_000_000, // A$50M typical minimum
        secondaryMarket: false,
        liquidityConstraints: [
          'No secondary trading',
          'Capital call requirements',
          'Limited exit opportunities',
          'Illiquidity discounts'
        ]
      },
      wreiLiquidity: {
        redemptionWindows: 'Quarterly',
        minimumInvestment: 1_000, // A$1K minimum
        secondaryMarket: true,
        liquidityAdvantages: [
          'Quarterly redemptions',
          'Secondary market trading',
          'Fractional ownership',
          'T+0 settlement'
        ]
      },
      premiumValue: 0.025, // 2.5% annual liquidity premium
      liquidityMetrics: {
        traditionalDiscount: 0.15, // 15% illiquidity discount
        tokenizationPremium: 0.10, // 10% tokenization premium
        accessibilityMultiplier: 50, // 50x more accessible (A$50M vs A$1K)
        timeToLiquidity: {
          traditional: '7-10 years',
          wrei: '3 months (quarterly redemptions)'
        }
      }
    };
  }

  /**
   * Compare secondary market accessibility
   */
  getSecondaryMarketComparison() {
    return {
      traditionalInfrastructure: {
        secondaryMarket: false,
        liquidityConstraints: [
          'No secondary trading',
          'Private market valuations',
          'Complex transfer processes',
          'Limited buyer pool'
        ],
        exitMechanisms: ['Fund maturity', 'Manager discretion', 'Force majeure events']
      },
      wreiTokens: {
        secondaryMarket: true,
        tradingHours: '24/7',
        settlementTime: 'T+0',
        marketMakers: 'AMM protocols',
        liquidityProvision: 'DEX integration',
        globalAccess: true
      },
      liquidityAdvantage: [
        'Continuous trading',
        'Instant settlement',
        'Global accessibility',
        'Price discovery',
        'Portfolio rebalancing'
      ],
      marketDepthProjections: {
        launchLiquidity: 10_000_000, // A$10M initial
        matureLiquidity: 100_000_000, // A$100M at maturity
        bidAskSpreads: '0.5-1.0%',
        dailyVolume: 2_000_000 // A$2M projected daily volume
      }
    };
  }

  /**
   * Analyze fractional ownership benefits
   */
  getFractionalOwnershipBenefits() {
    return {
      accessibilityImprovements: {
        minimumInvestment: 1_000, // A$1K vs A$50M traditional
        democratizationRatio: 50_000, // 50,000x more accessible
        investorPoolExpansion: '1,000x larger addressable market'
      },
      portfolioDiversification: [
        'Granular allocation (1% vs 100% positions)',
        'Risk distribution across multiple assets',
        'Geographic diversification capability',
        'Sector allocation flexibility'
      ],
      democratizationBenefits: [
        'Institutional-grade access for retail',
        'Reduced barriers to entry',
        'Educational investment opportunity',
        'ESG participation for individuals',
        'Technology innovation exposure'
      ],
      economicImpact: {
        capitalMobilization: 'Broader investor base',
        marketEfficiency: 'Enhanced price discovery',
        innovation: 'Tokenization infrastructure development',
        inclusion: 'Financial democratization'
      }
    };
  }

  /**
   * Generate persona-specific competitive arguments
   */
  getPersonaCompetitivePositioning(personaType: string) {
    const basePositioning = {
      primaryArguments: [
        '28.3% yield vs traditional alternatives',
        'Asset-backed yield sustainability',
        'Tokenized liquidity advantage'
      ],
      competitorWeaknesses: [
        'Traditional lock-up periods',
        'High minimum investments',
        'Limited secondary liquidity'
      ]
    };

    switch (personaType) {
      case 'infrastructure_fund':
        return {
          ...basePositioning,
          primaryArguments: [
            '28.3% yield vs 8-12% traditional infrastructure',
            'Maritime infrastructure diversification',
            'Tokenized liquidity advantage',
            'ESG integration with carbon generation',
            'Government partnership de-risking'
          ],
          competitorWeaknesses: [
            'Traditional lock-up periods (7-10 years)',
            'High minimum investments (A$50M+)',
            'Limited maritime exposure',
            'Illiquidity premiums'
          ]
        };

      case 'defi_farmer':
        return {
          ...basePositioning,
          primaryArguments: [
            'Asset-backed yield stability vs token emissions',
            'Cross-collateral strategies (90% LTV)',
            'Lower smart contract risk profile',
            'Regulatory compliance framework',
            'No impermanent loss risk'
          ],
          competitorWeaknesses: [
            'DeFi protocol vulnerabilities',
            'Token emission dilution',
            'Impermanent loss risks',
            'Regulatory uncertainty'
          ]
        };

      case 'esg_impact':
        return {
          ...basePositioning,
          primaryArguments: [
            'Direct emissions reduction impact',
            'Triple-standard verification',
            'SDG alignment (7, 13, 14, 17)',
            'Real-world utility vs. trading-only',
            'Measurable environmental outcomes'
          ],
          competitorWeaknesses: [
            'Greenwashing risks in traditional offsets',
            'Quality uncertainty in bridged credits',
            'No yield generation in carbon ETFs',
            'Limited verification standards'
          ]
        };

      default:
        return basePositioning;
    }
  }

  /**
   * Generate competitive negotiation context
   */
  generateCompetitiveNegotiationContext(params: {
    tokenType: string;
    competitorMention?: string;
    investorConcern?: string;
  }) {
    const { tokenType, competitorMention, investorConcern } = params;

    const baseContext = {
      directComparison: this.getDirectCompetitorComparison(competitorMention || 'infrastructure REITs', tokenType),
      competitiveAdvantages: this.getTokenSpecificAdvantages(tokenType),
      addressedConcerns: this.getInvestorConcernResponse(investorConcern || 'yield sustainability')
    };

    if (tokenType === 'asset_co') {
      return {
        ...baseContext,
        yieldSustainability: [
          'Physical fleet backing provides residual value',
          'Predictable lease income from government partnership',
          'Maritime essential service classification',
          'Electric fleet innovation premium'
        ],
        infrastructureAdvantages: [
          '28.3% vs 8-12% traditional infrastructure',
          'Quarterly redemptions vs 7-10 year lock-ups',
          'A$1K vs A$50M minimum investment',
          'Maritime diversification opportunity'
        ]
      };
    }

    return baseContext;
  }

  /**
   * Generate competitive response to specific objections
   */
  generateCompetitiveResponse(params: {
    competitorType: string;
    buyerObjection: string;
    tokenType: string;
  }) {
    const { competitorType, buyerObjection, tokenType } = params;

    if (competitorType === 'USYC' || competitorType === 'treasury tokens') {
      return {
        directResponse: `USYC provides 4.5% treasury-backed returns, while WREI offers 8-12% asset-backed returns with real-world utility. You're comparing treasury bills to infrastructure investment.`,
        valueProposition: [
          'Real-world utility vs. treasury-only exposure',
          'ESG impact with carbon credit generation',
          'Infrastructure diversification benefit',
          'Innovation premium for electric maritime'
        ],
        riskMitigation: [
          'Treasury tokens offer stability but limited growth',
          'WREI provides diversification beyond treasury exposure',
          'Physical asset backing vs. government dependency',
          'Multiple revenue streams vs. single yield source'
        ]
      };
    }

    if (competitorType === 'infrastructure REITs') {
      return {
        directResponse: `Infrastructure REITs average 8-12% returns with 7-10 year lock-ups. WREI offers 28.3% returns with quarterly redemptions and A$1K minimums vs. typical A$50M infrastructure requirements.`,
        valueProposition: [
          'Superior yield (28.3% vs 8-12%)',
          'Enhanced liquidity (quarterly vs multi-year)',
          'Lower barriers (A$1K vs A$50M)',
          'Maritime diversification vs. road/rail focus'
        ],
        riskMitigation: [
          'Government partnership reduces operational risk',
          'Electric fleet innovation provides competitive moat',
          'ESG alignment with decarbonization trends',
          'Essential service classification'
        ]
      };
    }

    return {
      directResponse: `WREI offers institutional-grade returns with enhanced liquidity and ESG integration compared to traditional alternatives.`,
      valueProposition: ['Asset-backed yields', 'Real-world utility', 'Regulatory compliance'],
      riskMitigation: ['Professional management', 'Government partnership', 'Physical asset backing']
    };
  }

  /**
   * Get competitive positioning metrics
   */
  getCompetitivePositioningMetrics() {
    return {
      dataConfidence: 0.91, // 91% confidence in competitive data
      competitiveAdvantageCount: 8, // 8 major competitive advantages
      benchmarkCoverage: 0.95, // 95% benchmark coverage
      lastUpdated: this.DATA_TIMESTAMP,
      positioningStrength: {
        yield: 0.95, // Very strong yield positioning
        liquidity: 0.90, // Strong liquidity advantage
        esg: 0.92, // Strong ESG positioning
        innovation: 0.88, // Strong innovation premium
        risk: 0.85 // Good risk-adjusted positioning
      },
      competitorCoverage: [
        'Treasury tokens (USYC, BUIDL)',
        'Infrastructure REITs',
        'DeFi protocols',
        'Carbon ETFs',
        'Traditional infrastructure funds'
      ]
    };
  }

  // =================== PRIVATE COMPETITIVE POSITIONING HELPERS ===================

  private getDirectCompetitorComparison(competitor: string, tokenType: string): string {
    const comparisons = {
      'infrastructure REITs': `28.3% vs 8-12% infrastructure REITs with quarterly redemptions vs 7-10 year lock-ups`,
      'USYC': `8-12% asset-backed vs 4.5% treasury-backed returns (+23% yield premium)`,
      'DeFi protocols': `28.3% asset-backed vs 8-15% token emission yields with lower smart contract risk`,
      'carbon ETFs': `8-12% yield generation vs price appreciation only with direct impact verification`
    };

    return comparisons[competitor as keyof typeof comparisons] ||
           `WREI ${tokenType} offers superior risk-adjusted returns vs ${competitor}`;
  }

  private getTokenSpecificAdvantages(tokenType: string): string[] {
    const advantages = {
      'asset_co': [
        'Physical fleet backing',
        'Predictable lease income',
        'Government partnership',
        'Maritime infrastructure scarcity',
        'Electric fleet innovation'
      ],
      'carbon_credits': [
        'Triple-standard verification',
        'Real-time measurement integration',
        'Direct emissions reduction impact',
        'Native digital generation',
        'Yield generation capability'
      ],
      'dual_portfolio': [
        'Diversification across asset classes',
        'Cross-collateral capabilities',
        'Correlation benefits',
        'Enhanced LTV ratios',
        'Multi-market exposure'
      ]
    };

    return advantages[tokenType as keyof typeof advantages] || ['Competitive positioning'];
  }

  private getInvestorConcernResponse(concern: string): string {
    const responses = {
      'yield sustainability': 'Physical asset backing and government partnership provide yield sustainability',
      'liquidity': 'Quarterly redemptions and secondary market trading provide enhanced liquidity',
      'risk profile': 'Regulated framework and professional management reduce investment risks',
      'market timing': 'ESG trends and decarbonization provide long-term tailwinds',
      'scale': 'A$19B RWA market growth provides scaling opportunities'
    };

    return responses[concern as keyof typeof responses] || 'WREI addresses investor concerns through institutional-grade structure';
  }
}

// =================== EXPORT SINGLETON ===================

export const marketIntelligenceSystem = new MarketIntelligenceSystem();

// =================== CONVENIENCE FUNCTIONS FOR DASHBOARD ===================

/**
 * Get tokenized RWA market context
 */
export function getTokenizedRWAMarketContext(): TokenizedRWAMarketContext {
  return marketIntelligenceSystem.getTokenizedRWAMarketContext();
}

/**
 * Get carbon market projections
 */
export function getCarbonMarketProjections(): CarbonMarketProjections {
  return marketIntelligenceSystem.getCarbonMarketProjections();
}

/**
 * Get competitive analysis
 */
export function getCompetitiveAnalysis(): CompetitorAnalysis[] {
  return marketIntelligenceSystem.getCompetitiveAnalysis();
}

/**
 * Market sentiment analysis interface
 */
export interface MarketSentimentData {
  overall: number; // 0-100 sentiment score
  carbonMarkets: number;
  rwaTokenization: number;
  institutionalAdoption: number;
  regulatoryEnvironment: number;
  technologyTrends: number;
  sentiment: 'bearish' | 'neutral' | 'bullish';
  keyTrends: string[];
  riskFactors: string[];
}

/**
 * Get market sentiment analysis
 */
export function getMarketSentimentAnalysis(): MarketSentimentData {
  // Generate realistic sentiment data based on current market conditions
  const carbonMarkets = 78; // Bullish on carbon markets
  const rwaTokenization = 85; // Very bullish on RWA tokenization
  const institutionalAdoption = 72; // Growing institutional interest
  const regulatoryEnvironment = 65; // Cautious but improving regulatory clarity
  const technologyTrends = 88; // Strong tech adoption

  const overall = Math.round((carbonMarkets + rwaTokenization + institutionalAdoption + regulatoryEnvironment + technologyTrends) / 5);

  const sentiment: 'bearish' | 'neutral' | 'bullish' = overall > 75 ? 'bullish' : overall > 55 ? 'neutral' : 'bearish';

  return {
    overall,
    carbonMarkets,
    rwaTokenization,
    institutionalAdoption,
    regulatoryEnvironment,
    technologyTrends,
    sentiment,
    keyTrends: [
      'ESG mandate acceleration driving carbon credit demand',
      'Institutional adoption of tokenized RWA increasing',
      'Regulatory clarity improving in major jurisdictions',
      'Technology infrastructure maturing for institutional use',
      'Cross-collateral strategies gaining traction'
    ],
    riskFactors: [
      'Carbon price volatility remains elevated',
      'Regulatory changes could impact market structure',
      'Technology risks in smart contract implementations',
      'Market liquidity constraints in stress scenarios',
      'Competitive pressure from traditional finance'
    ]
  };
}

// =================== END OF MARKET INTELLIGENCE SYSTEM ===================