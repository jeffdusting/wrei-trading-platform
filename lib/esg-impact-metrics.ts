/**
 * ESG Impact Metrics and Dashboard Logic
 *
 * Provides real-time ESG impact measurement, tracking, and reporting
 * for WREI carbon credit and tokenized asset transactions.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D2: ESG Impact Dashboard
 */

import type { InvestorClassification } from '@/lib/types';

/**
 * ESG impact categories for measurement and reporting
 */
export type ESGCategory =
  | 'carbon_reduction'
  | 'biodiversity_protection'
  | 'water_conservation'
  | 'social_impact'
  | 'governance_improvement'
  | 'sustainable_development';

/**
 * Impact measurement units
 */
export type ImpactUnit =
  | 'tonnes_co2'
  | 'hectares_protected'
  | 'litres_water_saved'
  | 'people_benefited'
  | 'jobs_created'
  | 'sdg_score';

/**
 * ESG impact metric data structure
 */
export interface ESGImpactMetric {
  id: string;
  category: ESGCategory;
  name: string;
  description: string;
  unit: ImpactUnit;
  value: number;
  baseline: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
  verificationSource: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

/**
 * Real-time ESG performance dashboard data
 */
export interface ESGDashboardData {
  portfolioOverview: {
    totalImpactScore: number;
    carbonFootprintReduction: number; // tonnes CO2e
    biodiversityImpactScore: number;
    socialImpactScore: number;
    governanceScore: number;
    lastCalculated: Date;
  };

  categoryBreakdown: Record<ESGCategory, {
    score: number;
    metrics: ESGImpactMetric[];
    monthlyTrend: number[];
    targetProgress: number; // percentage
  }>;

  certificationStatus: {
    verifiedCredits: number;
    pendingVerification: number;
    totalCredits: number;
    verificationRate: number;
    certificationBodies: string[];
  };

  impactProjections: {
    timeline: '1month' | '3months' | '6months' | '1year';
    projectedCarbonReduction: number;
    projectedBiodiversityGain: number;
    projectedSocialBenefit: number;
    confidenceInterval: [number, number];
  }[];
}

/**
 * ESG reporting framework alignment
 */
export type ReportingFramework =
  | 'TCFD'
  | 'SASB'
  | 'GRI'
  | 'UN_SDG'
  | 'EU_TAXONOMY'
  | 'CSRD'
  | 'ISSB';

/**
 * Institution-specific ESG requirements
 */
export interface InstitutionalESGRequirements {
  classification: InvestorClassification;
  mandatoryFrameworks: ReportingFramework[];
  requiredMetrics: ESGCategory[];
  reportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  auditRequirements: 'internal' | 'external' | 'both';
  stakeholderDisclosure: boolean;
}

/**
 * Sample ESG impact metrics for demonstration
 */
export const SAMPLE_ESG_METRICS: ESGImpactMetric[] = [
  {
    id: 'carbon_sequestration',
    category: 'carbon_reduction',
    name: 'Carbon Sequestration',
    description: 'Total CO2 equivalent sequestered through verified projects',
    unit: 'tonnes_co2',
    value: 125480,
    baseline: 0,
    target: 200000,
    trend: 'improving',
    lastUpdated: new Date('2026-03-24T10:30:00Z'),
    verificationSource: 'Verra VCS Registry',
    confidenceLevel: 'high'
  },
  {
    id: 'forest_protection',
    category: 'biodiversity_protection',
    name: 'Forest Area Protected',
    description: 'Total hectares of forest under REDD+ protection programs',
    unit: 'hectares_protected',
    value: 45720,
    baseline: 0,
    target: 75000,
    trend: 'improving',
    lastUpdated: new Date('2026-03-24T10:15:00Z'),
    verificationSource: 'FSC Certification',
    confidenceLevel: 'high'
  },
  {
    id: 'water_conservation',
    category: 'water_conservation',
    name: 'Water Conservation',
    description: 'Annual water savings from efficiency projects',
    unit: 'litres_water_saved',
    value: 2840000,
    baseline: 100000,
    target: 5000000,
    trend: 'improving',
    lastUpdated: new Date('2026-03-24T09:45:00Z'),
    verificationSource: 'Water Stewardship Council',
    confidenceLevel: 'medium'
  },
  {
    id: 'community_employment',
    category: 'social_impact',
    name: 'Community Employment',
    description: 'Jobs created in local communities through project implementation',
    unit: 'jobs_created',
    value: 1250,
    baseline: 0,
    target: 2000,
    trend: 'stable',
    lastUpdated: new Date('2026-03-24T08:30:00Z'),
    verificationSource: 'ILO Standards Verification',
    confidenceLevel: 'medium'
  },
  {
    id: 'local_community_benefit',
    category: 'social_impact',
    name: 'Local Community Benefit',
    description: 'Number of people directly benefited from social impact programs',
    unit: 'people_benefited',
    value: 8750,
    baseline: 0,
    target: 15000,
    trend: 'improving',
    lastUpdated: new Date('2026-03-24T10:00:00Z'),
    verificationSource: 'UN SDG Impact Standards',
    confidenceLevel: 'high'
  },
  {
    id: 'governance_transparency',
    category: 'governance_improvement',
    name: 'Governance Transparency Score',
    description: 'Project governance and transparency benchmark score',
    unit: 'sdg_score',
    value: 8.7,
    baseline: 5.0,
    target: 9.5,
    trend: 'improving',
    lastUpdated: new Date('2026-03-24T10:45:00Z'),
    verificationSource: 'Transparency International',
    confidenceLevel: 'high'
  }
];

/**
 * Calculates comprehensive ESG dashboard data
 */
export const calculateESGDashboard = (
  metrics: ESGImpactMetric[] = SAMPLE_ESG_METRICS
): ESGDashboardData => {
  // Calculate portfolio overview
  const totalImpactScore = calculateOverallImpactScore(metrics);
  const carbonMetrics = metrics.filter(m => m.category === 'carbon_reduction');
  const carbonFootprintReduction = carbonMetrics.reduce((sum, m) => sum + m.value, 0);

  // Category breakdown with trends
  const categoryBreakdown = calculateCategoryBreakdown(metrics);

  // Certification status
  const verifiedCredits = Math.floor(carbonFootprintReduction * 0.85); // 85% verified
  const pendingVerification = Math.floor(carbonFootprintReduction * 0.15);
  const totalCredits = verifiedCredits + pendingVerification;

  // Impact projections
  const impactProjections = generateImpactProjections(metrics);

  return {
    portfolioOverview: {
      totalImpactScore,
      carbonFootprintReduction,
      biodiversityImpactScore: calculateCategoryScore(metrics, 'biodiversity_protection'),
      socialImpactScore: calculateCategoryScore(metrics, 'social_impact'),
      governanceScore: calculateCategoryScore(metrics, 'governance_improvement'),
      lastCalculated: new Date()
    },

    categoryBreakdown,

    certificationStatus: {
      verifiedCredits,
      pendingVerification,
      totalCredits,
      verificationRate: verifiedCredits / totalCredits,
      certificationBodies: [
        'Verra (VCS)',
        'Gold Standard',
        'Climate Action Reserve',
        'American Carbon Registry'
      ]
    },

    impactProjections
  };
};

/**
 * Calculates overall impact score based on weighted categories
 */
const calculateOverallImpactScore = (metrics: ESGImpactMetric[]): number => {
  const categoryWeights: Record<ESGCategory, number> = {
    carbon_reduction: 0.3,
    biodiversity_protection: 0.2,
    water_conservation: 0.15,
    social_impact: 0.2,
    governance_improvement: 0.1,
    sustainable_development: 0.05
  };

  const categoryScores = Object.keys(categoryWeights).map(category => {
    const categoryMetrics = metrics.filter(m => m.category === category as ESGCategory);
    const categoryScore = calculateCategoryScore(categoryMetrics, category as ESGCategory);
    return categoryScore * categoryWeights[category as ESGCategory];
  });

  return Math.round(categoryScores.reduce((sum, score) => sum + score, 0) * 100) / 100;
};

/**
 * Calculates category-specific impact score
 */
const calculateCategoryScore = (
  metrics: ESGImpactMetric[],
  category?: ESGCategory
): number => {
  const categoryMetrics = category
    ? metrics.filter(m => m.category === category)
    : metrics;

  if (categoryMetrics.length === 0) return 0;

  const scores = categoryMetrics.map(metric => {
    const progress = (metric.value - metric.baseline) / (metric.target - metric.baseline);
    return Math.min(Math.max(progress, 0), 1) * 10; // Scale to 0-10
  });

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100) / 100;
};

/**
 * Generates category breakdown with trends and targets
 */
const calculateCategoryBreakdown = (
  metrics: ESGImpactMetric[]
): Record<ESGCategory, any> => {
  const categories: ESGCategory[] = [
    'carbon_reduction',
    'biodiversity_protection',
    'water_conservation',
    'social_impact',
    'governance_improvement',
    'sustainable_development'
  ];

  const breakdown: Record<string, any> = {};

  categories.forEach(category => {
    const categoryMetrics = metrics.filter(m => m.category === category);
    const score = calculateCategoryScore(categoryMetrics, category);

    // Generate synthetic monthly trends (last 12 months)
    const monthlyTrend = generateMonthlyTrend(score);

    // Calculate target progress
    const targetProgress = categoryMetrics.length > 0
      ? categoryMetrics.reduce((sum, m) => {
          const progress = (m.value - m.baseline) / (m.target - m.baseline);
          return sum + Math.min(Math.max(progress, 0), 1);
        }, 0) / categoryMetrics.length * 100
      : 0;

    breakdown[category] = {
      score,
      metrics: categoryMetrics,
      monthlyTrend,
      targetProgress: Math.round(targetProgress)
    };
  });

  return breakdown as Record<ESGCategory, any>;
};

/**
 * Generates synthetic monthly trend data
 */
const generateMonthlyTrend = (currentScore: number): number[] => {
  const trend: number[] = [];
  let baseScore = currentScore * 0.7; // Start 30% lower

  for (let i = 0; i < 12; i++) {
    // Add some realistic variance with overall upward trend
    const variance = (Math.random() - 0.5) * 0.3;
    const growthFactor = 1 + (i * 0.025); // 2.5% monthly growth trend
    baseScore = Math.max(0, baseScore * growthFactor + variance);
    trend.push(Math.round(baseScore * 100) / 100);
  }

  return trend;
};

/**
 * Generates impact projections for different timeframes
 */
const generateImpactProjections = (
  metrics: ESGImpactMetric[]
): ESGDashboardData['impactProjections'] => {
  const carbonMetrics = metrics.filter(m => m.category === 'carbon_reduction');
  const biodiversityMetrics = metrics.filter(m => m.category === 'biodiversity_protection');
  const socialMetrics = metrics.filter(m => m.category === 'social_impact');

  const currentCarbon = carbonMetrics.reduce((sum, m) => sum + m.value, 0);
  const currentBiodiversity = biodiversityMetrics.reduce((sum, m) => sum + m.value, 0);
  const currentSocial = socialMetrics.reduce((sum, m) => sum + m.value, 0);

  const projections: ESGDashboardData['impactProjections'] = [
    {
      timeline: '1month',
      projectedCarbonReduction: Math.round(currentCarbon * 1.08),
      projectedBiodiversityGain: Math.round(currentBiodiversity * 1.05),
      projectedSocialBenefit: Math.round(currentSocial * 1.03),
      confidenceInterval: [0.95, 1.15]
    },
    {
      timeline: '3months',
      projectedCarbonReduction: Math.round(currentCarbon * 1.25),
      projectedBiodiversityGain: Math.round(currentBiodiversity * 1.18),
      projectedSocialBenefit: Math.round(currentSocial * 1.12),
      confidenceInterval: [0.85, 1.35]
    },
    {
      timeline: '6months',
      projectedCarbonReduction: Math.round(currentCarbon * 1.55),
      projectedBiodiversityGain: Math.round(currentBiodiversity * 1.40),
      projectedSocialBenefit: Math.round(currentSocial * 1.28),
      confidenceInterval: [0.75, 1.65]
    },
    {
      timeline: '1year',
      projectedCarbonReduction: Math.round(currentCarbon * 2.10),
      projectedBiodiversityGain: Math.round(currentBiodiversity * 1.85),
      projectedSocialBenefit: Math.round(currentSocial * 1.60),
      confidenceInterval: [0.60, 2.20]
    }
  ];

  return projections;
};

/**
 * Gets institutional ESG requirements based on investor classification
 */
export const getInstitutionalESGRequirements = (
  classification: InvestorClassification
): InstitutionalESGRequirements => {
  const requirementsMap: Record<InvestorClassification, InstitutionalESGRequirements> = {
    sophisticated: {
      classification,
      mandatoryFrameworks: ['TCFD', 'SASB', 'GRI'],
      requiredMetrics: ['carbon_reduction', 'biodiversity_protection', 'governance_improvement'],
      reportingFrequency: 'monthly',
      auditRequirements: 'external',
      stakeholderDisclosure: true
    },
    wholesale: {
      classification,
      mandatoryFrameworks: ['TCFD', 'GRI', 'UN_SDG'],
      requiredMetrics: ['carbon_reduction', 'social_impact', 'governance_improvement'],
      reportingFrequency: 'quarterly',
      auditRequirements: 'both',
      stakeholderDisclosure: true
    },
    professional: {
      classification,
      mandatoryFrameworks: ['TCFD', 'SASB', 'EU_TAXONOMY', 'CSRD'],
      requiredMetrics: ['carbon_reduction', 'biodiversity_protection', 'water_conservation', 'social_impact', 'governance_improvement'],
      reportingFrequency: 'monthly',
      auditRequirements: 'both',
      stakeholderDisclosure: true
    },
    retail: {
      classification,
      mandatoryFrameworks: ['UN_SDG'],
      requiredMetrics: ['carbon_reduction', 'social_impact'],
      reportingFrequency: 'quarterly',
      auditRequirements: 'internal',
      stakeholderDisclosure: false
    }
  };

  return requirementsMap[classification];
};

/**
 * Generates ESG compliance report for specific framework
 */
export const generateESGComplianceReport = (
  framework: ReportingFramework,
  dashboardData: ESGDashboardData,
  requirements: InstitutionalESGRequirements
): {
  framework: ReportingFramework;
  complianceScore: number;
  requiredDisclosures: string[];
  completedDisclosures: string[];
  gaps: string[];
  recommendations: string[];
} => {
  const frameworkRequirements = {
    TCFD: [
      'Climate risk assessment',
      'Carbon footprint disclosure',
      'Transition scenario analysis',
      'Physical risk evaluation'
    ],
    SASB: [
      'Industry-specific metrics',
      'ESG materiality assessment',
      'Stakeholder impact analysis',
      'Sustainability accounting standards'
    ],
    GRI: [
      'Universal standards compliance',
      'Economic impact disclosure',
      'Environmental impact metrics',
      'Social impact reporting'
    ],
    UN_SDG: [
      'SDG alignment mapping',
      'Target contribution measurement',
      'Impact indicator tracking',
      'Progress reporting'
    ],
    EU_TAXONOMY: [
      'Environmental objective alignment',
      'Technical screening criteria',
      'Do no significant harm assessment',
      'Minimum safeguards compliance'
    ],
    CSRD: [
      'Double materiality assessment',
      'Sustainability data disclosure',
      'Value chain impact reporting',
      'Forward-looking information'
    ],
    ISSB: [
      'Climate-related disclosures',
      'Sustainability-related financial information',
      'Industry-based requirements',
      'Cross-industry metrics'
    ]
  };

  const requiredDisclosures = frameworkRequirements[framework];
  const completedDisclosures = requiredDisclosures.filter(
    (_, index) => dashboardData.portfolioOverview.totalImpactScore > (index + 1) * 1.5
  );

  const gaps = requiredDisclosures.filter(
    disclosure => !completedDisclosures.includes(disclosure)
  );

  const complianceScore = Math.round(
    (completedDisclosures.length / requiredDisclosures.length) * 100
  );

  const recommendations = gaps.map(gap =>
    `Enhance ${gap.toLowerCase()} to meet ${framework} requirements`
  );

  return {
    framework,
    complianceScore,
    requiredDisclosures,
    completedDisclosures,
    gaps,
    recommendations
  };
};

/**
 * Calculates ESG impact ROI and financial metrics
 */
export const calculateESGImpactROI = (
  dashboardData: ESGDashboardData,
  investmentAmount: number
): {
  impactROI: number;
  carbonPrice: number;
  socialValueGenerated: number;
  reputationalValue: number;
  totalESGValue: number;
  paybackPeriodMonths: number;
} => {
  // Carbon pricing (AU$40-60/tonne CO2e typical)
  const carbonPrice = 50; // AUD per tonne
  const carbonValue = dashboardData.portfolioOverview.carbonFootprintReduction * carbonPrice;

  // Social impact valuation (conservative estimate)
  const socialValuePerPerson = 250; // AUD per person benefited
  const socialMetrics = Object.values(dashboardData.categoryBreakdown.social_impact?.metrics || []);
  const peopleBenefited = socialMetrics
    .filter(m => m.unit === 'people_benefited')
    .reduce((sum, m) => sum + m.value, 0);
  const socialValueGenerated = peopleBenefited * socialValuePerPerson;

  // Reputational value (brand premium estimation)
  const reputationalValue = investmentAmount * 0.15; // 15% brand premium

  // Total ESG value
  const totalESGValue = carbonValue + socialValueGenerated + reputationalValue;

  // Impact ROI calculation
  const impactROI = ((totalESGValue - investmentAmount) / investmentAmount) * 100;

  // Payback period estimation
  const monthlyESGValue = totalESGValue / 12;
  const paybackPeriodMonths = Math.ceil(investmentAmount / monthlyESGValue);

  return {
    impactROI: Math.round(impactROI * 100) / 100,
    carbonPrice,
    socialValueGenerated: Math.round(socialValueGenerated),
    reputationalValue: Math.round(reputationalValue),
    totalESGValue: Math.round(totalESGValue),
    paybackPeriodMonths
  };
};