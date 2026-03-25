/**
 * WREI Trading Platform - Demo Data Sets
 *
 * Pre-populated data for compelling demo narratives
 * Realistic institutional scenarios with Australian market context
 */

import type { DemoDataSet } from './demo-state-manager';

// Demo investor personas with realistic Australian institutional profiles
export const DEMO_INVESTOR_PERSONAS = {
  margaret_richardson: {
    id: 'margaret_richardson',
    name: 'Margaret Richardson',
    title: 'Chief Investment Officer',
    organisation: 'Macquarie Infrastructure Partners',
    type: 'infrastructure_fund',
    aum: 12_000_000_000,
    riskTolerance: 'moderate',
    yieldRequirement: 0.15,
    investmentFocus: ['Infrastructure', 'Real Assets', 'ESG Integration'],
    jurisdiction: 'AU',
    afslStatus: 'compliant',
    kycStatus: 'verified',
    portfolioConstraints: {
      maxSingleAssetAllocation: 0.15,
      minLiquidityRatio: 0.05,
      maxVolatility: 0.18,
      requiredESGRating: 'BB+',
      preferredHoldingPeriod: '5-10 years'
    },
    backgroundContext: 'Leading infrastructure investment professional with 15+ years managing institutional capital. Focus on assets generating stable cash flows with inflation protection.',
    currentAllocation: {
      infrastructure: 0.45,
      realEstate: 0.25,
      carbonCredits: 0.02, // Current minimal exposure
      alternativeFixed: 0.18,
      cash: 0.10
    },
    investmentThesis: 'Seeking real asset exposure with direct economic benefit participation and regulatory protection.',
    negotiationStyle: 'analytical',
    priceAnchor: 150,
    budgetRange: { min: 50_000_000, max: 200_000_000 }
  },

  aisha_kowalski: {
    id: 'aisha_kowalski',
    name: 'Dr. Aisha Kowalski',
    title: 'ESG Impact Investor',
    organisation: 'Generation Investment Management (Australia)',
    type: 'esg_impact',
    aum: 8_500_000_000,
    riskTolerance: 'aggressive',
    yieldRequirement: 0.18,
    investmentFocus: ['Verified Impact', 'Climate Solutions', 'Social Outcomes'],
    jurisdiction: 'AU',
    afslStatus: 'compliant',
    kycStatus: 'verified',
    portfolioConstraints: {
      maxSingleAssetAllocation: 0.20,
      minESGScore: 85,
      requiredImpactMeasurement: true,
      preferredCertifications: ['Gold Standard', 'Verra VCS', 'WREI dMRV'],
      maxGreenwashingRisk: 'low'
    },
    backgroundContext: 'PhD Environmental Economics, specialist in impact measurement and verification. Strong focus on additionality and permanence.',
    currentAllocation: {
      cleanTech: 0.35,
      impactBonds: 0.20,
      verifiedCarbonCredits: 0.15,
      sustainableInfrastructure: 0.25,
      cash: 0.05
    },
    investmentThesis: 'Premium for verified impact with measurable environmental and social outcomes.',
    negotiationStyle: 'quality-focused',
    priceAnchor: 165,
    budgetRange: { min: 25_000_000, max: 100_000_000 }
  },

  james_hartley: {
    id: 'james_hartley',
    name: 'James Hartley',
    title: 'Portfolio Manager',
    organisation: 'Meridian Sustainable Fund',
    type: 'asset_manager',
    aum: 2_800_000_000,
    riskTolerance: 'moderate',
    yieldRequirement: 0.12,
    investmentFocus: ['Sustainable Finance', 'Alternative Fixed Income', 'ESG Integration'],
    jurisdiction: 'AU',
    afslStatus: 'compliant',
    kycStatus: 'verified',
    portfolioConstraints: {
      maxSingleAssetAllocation: 0.10,
      requiredLiquidity: 'monthly',
      maxDuration: 5,
      minCreditRating: 'BBB-',
      requiredRegulatory: 'AFSL compliant'
    },
    backgroundContext: 'CFA charterholder with institutional fixed income focus. Experienced in alternative credit and sustainable finance products.',
    currentAllocation: {
      corporateBonds: 0.40,
      govtSecurities: 0.25,
      alternatives: 0.20,
      carbonCredits: 0.05, // Small existing position
      cash: 0.10
    },
    investmentThesis: 'Seeking yield enhancement with regulatory certainty and institutional-grade documentation.',
    negotiationStyle: 'systematic',
    priceAnchor: 140,
    budgetRange: { min: 15_000_000, max: 75_000_000 }
  },

  sarah_chen: {
    id: 'sarah_chen',
    name: 'Sarah Chen',
    title: 'Head of ESG Compliance',
    organisation: 'AusPower Energy Fund',
    type: 'compliance_focused',
    aum: 5_500_000_000,
    riskTolerance: 'conservative',
    yieldRequirement: 0.08,
    investmentFocus: ['Regulatory Compliance', 'Audit Documentation', 'Risk Management'],
    jurisdiction: 'AU',
    afslStatus: 'compliant',
    kycStatus: 'verified',
    portfolioConstraints: {
      requiredAuditTrail: true,
      maxRegulatoryRisk: 'low',
      requiredReporting: ['TCFD', 'ISSB S2', 'NGER'],
      mandatoryVerification: ['Third-party', 'Blockchain'],
      requiredInsurance: 'comprehensive'
    },
    backgroundContext: 'Former ASIC compliance officer, now leading ESG compliance for energy infrastructure fund. Strong focus on audit and regulatory requirements.',
    currentAllocation: {
      energyInfrastructure: 0.60,
      utilitiesDebt: 0.25,
      carbonOffsets: 0.08, // Compliance-driven
      cash: 0.07
    },
    investmentThesis: 'Compliance-first approach with comprehensive documentation and audit trail requirements.',
    negotiationStyle: 'process-oriented',
    priceAnchor: 135,
    budgetRange: { min: 10_000_000, max: 50_000_000 }
  },

  alex_novak: {
    id: 'alex_novak',
    name: 'Alex Novak',
    title: 'Carbon Trading Analyst',
    organisation: 'Macquarie Commodities Trading',
    type: 'trading_desk',
    aum: 15_000_000_000,
    riskTolerance: 'aggressive',
    yieldRequirement: 0.25,
    investmentFocus: ['Trading Opportunities', 'Market Making', 'Arbitrage'],
    jurisdiction: 'AU',
    afslStatus: 'compliant',
    kycStatus: 'verified',
    portfolioConstraints: {
      maxPositionSize: 1_000_000, // tCO2e
      requiredLiquidity: 'T+1',
      maxHoldingPeriod: '12 months',
      requiredPriceTransparency: true,
      mandatoryHedging: 'available'
    },
    backgroundContext: 'Quantitative background with 8+ years in carbon markets. Focus on price discovery, market making, and institutional flow.',
    currentAllocation: {
      spotCarbon: 0.30,
      forwardCarbon: 0.25,
      carbonfutures: 0.20,
      voluntaryCredits: 0.15,
      cash: 0.10
    },
    investmentThesis: 'Opportunistic trading with focus on price inefficiencies and institutional flow capture.',
    negotiationStyle: 'transactional',
    priceAnchor: 125, // More price sensitive
    budgetRange: { min: 5_000_000, max: 25_000_000 }
  }
};

// Pre-generated negotiation history for compelling narratives
export const DEMO_NEGOTIATION_HISTORY = [
  {
    id: 'nego_001',
    persona: 'margaret_richardson',
    date: '2026-03-20T10:30:00Z',
    duration: 18.5, // minutes
    outcome: 'successful',
    finalPrice: 148,
    anchorPrice: 150,
    volumetCO2e: 50_000,
    totalValue: 7_400_000,
    keyMoments: [
      { message: 'Infrastructure fund requirements discussion', timestamp: 2.3 },
      { message: 'WREI asset backing explanation', timestamp: 5.8 },
      { message: 'Yield comparison with traditional infrastructure', timestamp: 9.2 },
      { message: 'Price concession to A$148/tonne', timestamp: 15.1 },
      { message: 'Agreement and settlement terms', timestamp: 17.8 }
    ],
    satisfactionScore: 4.7,
    complianceChecks: ['AFSL', 'KYC', 'AML', 'Wholesale Investor'],
    settlementTime: '2m 34s'
  },

  {
    id: 'nego_002',
    persona: 'aisha_kowalski',
    date: '2026-03-19T14:15:00Z',
    duration: 22.3,
    outcome: 'successful',
    finalPrice: 162,
    anchorPrice: 165,
    volumetCO2e: 25_000,
    totalValue: 4_050_000,
    keyMoments: [
      { message: 'Impact verification requirements', timestamp: 3.1 },
      { message: 'dMRV premium justification', timestamp: 7.5 },
      { message: 'Additionality and permanence discussion', timestamp: 12.2 },
      { message: 'ESG reporting integration', timestamp: 18.0 },
      { message: 'Premium pricing agreement', timestamp: 21.1 }
    ],
    satisfactionScore: 4.9,
    complianceChecks: ['ESG Verification', 'Impact Measurement', 'Third-party Audit'],
    settlementTime: '1m 58s'
  },

  {
    id: 'nego_003',
    persona: 'alex_novak',
    date: '2026-03-18T09:45:00Z',
    duration: 8.7,
    outcome: 'successful',
    finalPrice: 132,
    anchorPrice: 135,
    volumetCO2e: 100_000,
    totalValue: 13_200_000,
    keyMoments: [
      { message: 'Volume tier pricing discussion', timestamp: 1.2 },
      { message: 'Market comparison and arbitrage', timestamp: 3.8 },
      { message: 'Liquidity and hedging options', timestamp: 5.5 },
      { message: 'Bulk discount negotiation', timestamp: 7.1 },
      { message: 'Quick settlement agreement', timestamp: 8.3 }
    ],
    satisfactionScore: 4.2,
    complianceChecks: ['Trading Authorization', 'Position Limits', 'Market Conduct'],
    settlementTime: '45s'
  }
];

// Market data for demo scenarios
export const DEMO_MARKET_DATA = {
  wreiPricingIndex: {
    lastUpdated: '2026-03-25T01:45:00Z',
    vcmSpotReference: 8.45, // AUD/tonne - EM SOVCM 2025
    forwardRemovalReference: 185, // AUD/tonne - Sylvera SOCC 2025
    dmrvPremiumBenchmark: 1.85, // 85% premium for dMRV
    baseCarbonPrice: 100, // USD/tonne
    wreiPremiumMultiplier: 1.52,
    anchorPrice: 152, // Current market anchor
    priceFloor: 125, // Absolute minimum
    volatility: {
      daily: 0.045,
      weekly: 0.12,
      monthly: 0.28
    },
    correlations: {
      traditional: 0.15,
      crypto: 0.32,
      commodities: 0.67,
      infrastructure: 0.58
    }
  },

  competitiveContext: {
    traditionalVCM: {
      avgPrice: 12.50,
      liquidity: 'low',
      verificationStandard: 'Variable',
      settlementTime: 'T+7 to T+30'
    },
    institutionalCredits: {
      avgPrice: 95.00,
      liquidity: 'moderate',
      verificationStandard: 'Third-party',
      settlementTime: 'T+3'
    },
    wreiAdvantage: {
      pricePosition: '+28% premium justified',
      liquidityAdvantage: 'T+0 settlement',
      verificationSuperior: 'dMRV + asset backing',
      institutionalGrade: 'AFSL compliant'
    }
  },

  fleetMetrics: {
    totalVessels: 88,
    deepPowerUnits: 22,
    totalCapacity: '847 MW',
    annualLeaseIncome: 61_100_000,
    averageLeaseYield: 0.283,
    occupancyRate: 0.97,
    creditGenerationPA: 185_000 // tCO2e per annum
  }
};

// Portfolio data for different demo scenarios
export const DEMO_PORTFOLIO_DATA = {
  infrastructure_fund: {
    totalAUM: 12_000_000_000,
    currentAllocation: {
      transport_infrastructure: 0.32,
      energy_infrastructure: 0.28,
      social_infrastructure: 0.15,
      digital_infrastructure: 0.12,
      carbon_credits: 0.03,
      cash_equivalents: 0.10
    },
    targetAllocation: {
      transport_infrastructure: 0.30,
      energy_infrastructure: 0.26,
      social_infrastructure: 0.15,
      digital_infrastructure: 0.12,
      carbon_credits: 0.07, // Proposed increase
      cash_equivalents: 0.10
    },
    performanceMetrics: {
      annualReturn: 0.142,
      volatility: 0.156,
      sharpeRatio: 0.91,
      maxDrawdown: 0.085,
      informationRatio: 1.23
    },
    wreiImpact: {
      yieldEnhancement: 0.023, // +230bps from WREI allocation
      diversificationBenefit: 0.015, // -150bps volatility
      esgScoreImprovement: 8.5
    }
  },

  esg_impact: {
    totalAUM: 8_500_000_000,
    impactFocus: ['Climate', 'Social Outcomes', 'Governance'],
    currentImpactMetrics: {
      carbonAvoided: 2_150_000, // tCO2e annually
      jobsCreated: 12_400,
      cleanEnergyGenerated: 1_850_000, // MWh
      peopleImpacted: 890_000
    },
    targetImpactMetrics: {
      carbonAvoided: 2_850_000, // With WREI addition
      jobsCreated: 13_100,
      cleanEnergyGenerated: 2_100_000,
      peopleImpacted: 1_200_000
    },
    verificationStandards: ['Gold Standard', 'Verra VCS', 'WREI dMRV'],
    reportingFrameworks: ['TCFD', 'ISSB S1/S2', 'UN SDGs']
  }
};

// Compliance data for demo scenarios
export const DEMO_COMPLIANCE_DATA = {
  afslCompliance: {
    licenceNumber: 'AFSL 481946',
    authorisedRepresentative: 'AR 1284567',
    status: 'Current',
    complianceScore: 98.5,
    lastAudit: '2025-11-15',
    nextAudit: '2026-11-15',
    requiredReporting: ['Breach Reporting', 'Financial Requirements', 'Audit Requirements'],
    currentCompliance: {
      capitalAdequacy: 'Compliant',
      professionalIndemnity: 'A$50M coverage',
      auditRequirements: 'Met',
      responsibleManager: 'Appointed'
    }
  },

  kycAmlVerification: {
    verificationLevel: 'Enhanced',
    riskRating: 'Low-Medium',
    sanctionsScreening: 'Clear',
    pepScreening: 'Clear',
    ultimateBeneficiaryOwner: 'Verified',
    sourceOfFunds: 'Verified',
    ongoingMonitoring: 'Active',
    lastReview: '2026-02-28',
    nextReview: '2026-08-28'
  },

  regulatoryReporting: {
    requiredReports: [
      { framework: 'TCFD', frequency: 'Annual', status: 'Current' },
      { framework: 'ISSB S2', frequency: 'Annual', status: 'Pending' },
      { framework: 'NGER', frequency: 'Annual', status: 'Current' },
      { framework: 'Modern Slavery Act', frequency: 'Annual', status: 'Current' }
    ],
    auditTrails: {
      blockchainVerification: 'Active',
      transactionRecords: 'Comprehensive',
      impactMeasurement: 'Third-party verified',
      reportingAccuracy: 99.7
    }
  }
};

// Analytics data for advanced demonstrations
export const DEMO_ANALYTICS_DATA = {
  scenarioAnalysis: {
    baseCase: {
      probabilityWeighting: 0.45,
      expectedReturn: 0.185,
      volatility: 0.145,
      maxDrawdown: 0.078
    },
    bullCase: {
      probabilityWeighting: 0.25,
      expectedReturn: 0.267,
      volatility: 0.198,
      maxDrawdown: 0.092
    },
    bearCase: {
      probabilityWeighting: 0.20,
      expectedReturn: 0.098,
      volatility: 0.156,
      maxDrawdown: 0.145
    },
    stressCase: {
      probabilityWeighting: 0.10,
      expectedReturn: -0.023,
      volatility: 0.287,
      maxDrawdown: 0.234
    }
  },

  monteCarloResults: {
    simulationRuns: 10_000,
    timeHorizon: 5, // years
    confidenceIntervals: {
      percentile_5: -0.045,
      percentile_25: 0.087,
      percentile_50: 0.168,
      percentile_75: 0.245,
      percentile_95: 0.398
    },
    probabilityOfLoss: 0.125,
    expectedShortfall: -0.089,
    valueatRisk_95: -0.134
  },

  attributionAnalysis: {
    factorContributions: {
      assetBacking: 0.125, // 12.5% return attribution
      carbonPremium: 0.045,
      liquidityPremium: 0.015,
      esgPremium: 0.032,
      regulatoryClarity: 0.018
    },
    riskContributions: {
      marketRisk: 0.65,
      creditRisk: 0.15,
      liquidityRisk: 0.08,
      operationalRisk: 0.07,
      regulatoryRisk: 0.05
    }
  }
};

// Complete demo data sets for different scenarios
export const DEMO_DATA_SETS: Record<string, DemoDataSet> = {
  infrastructure_discovery: {
    investorProfile: DEMO_INVESTOR_PERSONAS.margaret_richardson,
    marketData: DEMO_MARKET_DATA,
    negotiationHistory: DEMO_NEGOTIATION_HISTORY.filter(n =>
      ['margaret_richardson', 'james_hartley'].includes(n.persona)
    ),
    portfolioData: DEMO_PORTFOLIO_DATA.infrastructure_fund,
    complianceData: DEMO_COMPLIANCE_DATA,
    analyticsData: DEMO_ANALYTICS_DATA
  },

  esg_impact_assessment: {
    investorProfile: DEMO_INVESTOR_PERSONAS.aisha_kowalski,
    marketData: DEMO_MARKET_DATA,
    negotiationHistory: DEMO_NEGOTIATION_HISTORY.filter(n =>
      n.persona === 'aisha_kowalski'
    ),
    portfolioData: DEMO_PORTFOLIO_DATA.esg_impact,
    complianceData: DEMO_COMPLIANCE_DATA,
    analyticsData: DEMO_ANALYTICS_DATA
  },

  trading_desk_execution: {
    investorProfile: DEMO_INVESTOR_PERSONAS.alex_novak,
    marketData: DEMO_MARKET_DATA,
    negotiationHistory: DEMO_NEGOTIATION_HISTORY.filter(n =>
      n.persona === 'alex_novak'
    ),
    portfolioData: {
      ...DEMO_PORTFOLIO_DATA.infrastructure_fund,
      totalAUM: 15_000_000_000,
      focusArea: 'Carbon Trading and Market Making'
    },
    complianceData: DEMO_COMPLIANCE_DATA,
    analyticsData: DEMO_ANALYTICS_DATA
  },

  compliance_walkthrough: {
    investorProfile: DEMO_INVESTOR_PERSONAS.sarah_chen,
    marketData: DEMO_MARKET_DATA,
    negotiationHistory: DEMO_NEGOTIATION_HISTORY,
    portfolioData: DEMO_PORTFOLIO_DATA.infrastructure_fund,
    complianceData: DEMO_COMPLIANCE_DATA,
    analyticsData: DEMO_ANALYTICS_DATA
  }
};

export default DEMO_DATA_SETS;