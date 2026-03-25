/**
 * WREI API Documentation System
 *
 * Structured documentation for all 6 platform API endpoints.
 * Provides schemas, example payloads, error codes, and rate limit information
 * for the Developer Portal / API Explorer (Enhancement C3).
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  enum?: string[];
  default?: string | number | boolean;
  example?: string | number | boolean;
  min?: number;
  max?: number;
}

export interface ApiEndpointAction {
  name: string;
  description: string;
  parameters: ApiParameter[];
  exampleRequest: Record<string, unknown>;
  exampleResponse: Record<string, unknown>;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'DELETE';
  category: ApiCategory;
  title: string;
  description: string;
  authentication: AuthenticationInfo;
  rateLimit: RateLimitInfo;
  actions: ApiEndpointAction[];
  errorCodes: ErrorCode[];
  notes?: string[];
}

export interface AuthenticationInfo {
  required: boolean;
  header: string;
  description: string;
  devMode: string;
}

export interface RateLimitInfo {
  maxRequests: number;
  windowMs: number;
  windowDescription: string;
}

export interface ErrorCode {
  code: number;
  name: string;
  description: string;
}

export type ApiCategory =
  | 'trading'
  | 'analytics'
  | 'compliance'
  | 'market-data'
  | 'metadata'
  | 'performance';

export interface ApiCategoryInfo {
  id: ApiCategory;
  label: string;
  description: string;
  icon: string;
}

// =============================================================================
// API CATEGORIES
// =============================================================================

export const apiCategories: ApiCategoryInfo[] = [
  {
    id: 'trading',
    label: 'Trading',
    description: 'AI-powered carbon credit negotiation engine',
    icon: 'exchange',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Financial calculations, risk profiling, and portfolio optimisation',
    icon: 'chart',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Regulatory reporting and compliance monitoring',
    icon: 'shield',
  },
  {
    id: 'market-data',
    label: 'Market Data',
    description: 'Carbon pricing feeds, RWA market data, and competitive intelligence',
    icon: 'globe',
  },
  {
    id: 'metadata',
    label: 'Token Metadata',
    description: 'Blockchain provenance and token lifecycle tracking',
    icon: 'cube',
  },
  {
    id: 'performance',
    label: 'Performance',
    description: 'System health, benchmarks, and performance monitoring',
    icon: 'gauge',
  },
];

// =============================================================================
// COMMON ERROR CODES
// =============================================================================

const commonErrorCodes: ErrorCode[] = [
  { code: 400, name: 'Bad Request', description: 'Invalid request parameters or malformed JSON body' },
  { code: 401, name: 'Unauthorised', description: 'Missing or invalid X-WREI-API-Key header' },
  { code: 429, name: 'Rate Limited', description: 'Too many requests. Retry after the rate limit window resets.' },
  { code: 500, name: 'Internal Error', description: 'Unexpected server error. Contact support if persistent.' },
];

// =============================================================================
// COMMON AUTHENTICATION
// =============================================================================

const standardAuth: AuthenticationInfo = {
  required: true,
  header: 'X-WREI-API-Key',
  description: 'Include your API key in the X-WREI-API-Key header. Keys are issued during institutional onboarding.',
  devMode: 'In development/test mode (no WREI_API_KEY env var set), authentication is bypassed automatically.',
};

// =============================================================================
// NEGOTIATE API DOCUMENTATION
// =============================================================================

const negotiateEndpoint: ApiEndpoint = {
  id: 'negotiate',
  path: '/api/negotiate',
  method: 'POST',
  category: 'trading',
  title: 'AI Negotiation Engine',
  description:
    'Powers the WREI AI negotiation agent. Sends buyer messages to the Claude-powered negotiation engine and returns structured responses with pricing, strategy explanations, and deal terms. The agent enforces price floors, concession limits, and institutional-grade defence layers.',
  authentication: {
    required: false,
    header: 'N/A',
    description: 'The negotiation endpoint uses session-based state management rather than API key authentication.',
    devMode: 'No authentication required for the demo negotiation interface.',
  },
  rateLimit: {
    maxRequests: 20,
    windowMs: 60000,
    windowDescription: '20 requests per minute',
  },
  actions: [
    {
      name: 'negotiate',
      description: 'Send a buyer message to the AI negotiation agent and receive a structured response with pricing and strategy.',
      parameters: [
        { name: 'message', type: 'string', required: true, description: 'The buyer\'s message or offer', example: 'I would like to purchase 500 carbon credits at $130 per tonne.' },
        {
          name: 'state',
          type: 'object',
          required: true,
          description: 'Current negotiation state including round count, pricing history, and persona context',
        },
        { name: 'isOpening', type: 'boolean', required: false, description: 'Whether this is the opening message of a new negotiation', default: false },
      ],
      exampleRequest: {
        message: 'I would like to purchase 500 carbon credits at $130 per tonne.',
        state: {
          personaId: 'corporate_compliance',
          currentPrice: 150,
          round: 1,
          maxRounds: 12,
          history: [],
        },
        isOpening: false,
      },
      exampleResponse: {
        success: true,
        response: {
          message: 'Thank you for your interest in WREI-verified carbon credits. Our current pricing reflects the institutional-grade dMRV verification and Zoniqx zConnect settlement infrastructure...',
          currentPrice: 147.5,
          concession: 2.5,
          dealStatus: 'negotiating',
          round: 2,
        },
        strategyExplanation: {
          tactic: 'anchoring',
          reasoning: 'Maintaining price near anchor while demonstrating value proposition',
        },
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Missing required fields (message, state) or invalid persona ID' },
    { code: 500, name: 'Internal Error', description: 'Claude API error or constraint enforcement failure' },
  ],
  notes: [
    'Price floor of $120/tonne is enforced in application code, not delegated to the LLM.',
    'Maximum 5% concession per round enforced server-side.',
    'Maximum 20% total concession from anchor price ($150) enforced server-side.',
    'Input sanitisation removes injection attempts before sending to Claude API.',
    'Output filtering strips internal reasoning before delivery to client.',
  ],
};

// =============================================================================
// ANALYTICS API DOCUMENTATION
// =============================================================================

const analyticsEndpoint: ApiEndpoint = {
  id: 'analytics',
  path: '/api/analytics',
  method: 'POST',
  category: 'analytics',
  title: 'Financial Analytics Engine',
  description:
    'Comprehensive financial calculation engine providing IRR, NPV, carbon credit metrics, portfolio optimisation, Monte Carlo simulation, risk profiling, and scenario analysis for WREI token investments.',
  authentication: standardAuth,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
    windowDescription: '100 requests per minute',
  },
  actions: [
    {
      name: 'irr',
      description: 'Calculate Internal Rate of Return for a series of cash flows.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "irr"', enum: ['irr'] },
        { name: 'cashFlows', type: 'array', required: true, description: 'Array of cash flows (initial investment should be negative)', example: [-100000, 25000, 30000, 35000, 40000] as unknown as number },
      ],
      exampleRequest: {
        action: 'irr',
        cashFlows: [-100000, 25000, 30000, 35000, 40000],
      },
      exampleResponse: {
        success: true,
        data: {
          irr: 0.0892,
          annualizedReturn: '8.92%',
          periods: 4,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_IRR_CALCULATOR',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_abc123def',
        },
      },
    },
    {
      name: 'npv',
      description: 'Calculate Net Present Value of future cash flows at a given discount rate.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "npv"', enum: ['npv'] },
        { name: 'cashFlows', type: 'array', required: true, description: 'Array of future cash flows' },
        { name: 'discountRate', type: 'number', required: true, description: 'Annual discount rate (0.01 to 0.50)', min: 0.01, max: 0.50, example: 0.08 },
      ],
      exampleRequest: {
        action: 'npv',
        cashFlows: [-100000, 25000, 30000, 35000, 40000],
        discountRate: 0.08,
      },
      exampleResponse: {
        success: true,
        data: {
          npv: 5243.18,
          discountRate: 0.08,
          periods: 4,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_NPV_CALCULATOR',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_def456ghi',
        },
      },
    },
    {
      name: 'carbon_metrics',
      description: 'Calculate carbon credit investment metrics including yield, price appreciation, and risk-adjusted returns.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "carbon_metrics"', enum: ['carbon_metrics'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount in USD (1,000 to 1,000,000,000)', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Investment time horizon in years (1 to 30)', min: 1, max: 30 },
      ],
      exampleRequest: {
        action: 'carbon_metrics',
        investmentAmount: 500000,
        timeHorizon: 5,
      },
      exampleResponse: {
        success: true,
        data: {
          investmentAmount: 500000,
          timeHorizon: 5,
          projectedReturn: 892500,
          annualYield: 0.157,
          carbonCreditsAcquired: 3333,
          pricePerCredit: 150,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_CARBON_ANALYTICS',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_ghi789jkl',
        },
      },
    },
    {
      name: 'asset_co_metrics',
      description: 'Calculate Asset Co token metrics for infrastructure-backed carbon investments.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "asset_co_metrics"', enum: ['asset_co_metrics'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount in USD', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Time horizon in years', min: 1, max: 30 },
      ],
      exampleRequest: {
        action: 'asset_co_metrics',
        investmentAmount: 1000000,
        timeHorizon: 10,
      },
      exampleResponse: {
        success: true,
        data: {
          investmentAmount: 1000000,
          timeHorizon: 10,
          projectedNAV: 2150000,
          annualAppreciation: 0.08,
          revenueShareYield: 0.065,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_ASSET_CO_ANALYTICS',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_jkl012mno',
        },
      },
    },
    {
      name: 'dual_portfolio',
      description: 'Calculate dual portfolio metrics combining carbon credits and Asset Co tokens.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "dual_portfolio"', enum: ['dual_portfolio'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Total investment amount', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Time horizon in years', min: 1, max: 30 },
        { name: 'carbonAllocation', type: 'number', required: false, description: 'Percentage allocated to carbon credits (0 to 1)', default: 0.5 },
      ],
      exampleRequest: {
        action: 'dual_portfolio',
        investmentAmount: 2000000,
        timeHorizon: 7,
        carbonAllocation: 0.6,
      },
      exampleResponse: {
        success: true,
        data: {
          totalInvestment: 2000000,
          carbonAllocation: 1200000,
          assetCoAllocation: 800000,
          blendedReturn: 0.124,
          diversificationBenefit: 0.018,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_DUAL_PORTFOLIO_ANALYTICS',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_mno345pqr',
        },
      },
    },
    {
      name: 'risk_profile',
      description: 'Generate a comprehensive risk assessment for a given investment profile.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "risk_profile"', enum: ['risk_profile'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount in USD', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Time horizon in years', min: 1, max: 30 },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type for risk assessment', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
      ],
      exampleRequest: {
        action: 'risk_profile',
        investmentAmount: 500000,
        timeHorizon: 5,
        tokenType: 'carbon_credits',
      },
      exampleResponse: {
        success: true,
        data: {
          riskScore: 42,
          riskCategory: 'moderate',
          maxDrawdown: -0.18,
          volatility: 0.22,
          sharpeRatio: 1.35,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_RISK_PROFILER',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_pqr678stu',
        },
      },
    },
    {
      name: 'scenario_analysis',
      description: 'Run scenario analysis across bull, base, and bear market conditions.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "scenario_analysis"', enum: ['scenario_analysis'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount in USD', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Time horizon in years', min: 1, max: 30 },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type for scenario modelling', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
      ],
      exampleRequest: {
        action: 'scenario_analysis',
        investmentAmount: 1000000,
        timeHorizon: 10,
        tokenType: 'carbon_credits',
      },
      exampleResponse: {
        success: true,
        data: {
          scenarios: {
            bull: { returnRate: 0.25, finalValue: 9313226 },
            base: { returnRate: 0.15, finalValue: 4045558 },
            bear: { returnRate: 0.05, finalValue: 1628895 },
          },
          probabilityWeighted: 4329226,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_SCENARIO_ANALYTICS',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_stu901vwx',
        },
      },
    },
    {
      name: 'portfolio_optimization',
      description: 'Run portfolio optimisation to find optimal asset allocation.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "portfolio_optimization"', enum: ['portfolio_optimization'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Total investment amount', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Time horizon in years', min: 1, max: 30 },
        { name: 'riskTolerance', type: 'string', required: false, description: 'Risk tolerance level', enum: ['conservative', 'moderate', 'aggressive'], default: 'moderate' },
      ],
      exampleRequest: {
        action: 'portfolio_optimization',
        investmentAmount: 5000000,
        timeHorizon: 10,
        riskTolerance: 'moderate',
      },
      exampleResponse: {
        success: true,
        data: {
          optimalAllocation: {
            carbonCredits: 0.55,
            assetCo: 0.35,
            cash: 0.10,
          },
          expectedReturn: 0.142,
          expectedVolatility: 0.18,
          sharpeRatio: 1.42,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_PORTFOLIO_OPTIMIZER',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_vwx234yza',
        },
      },
    },
    {
      name: 'monte_carlo',
      description: 'Run Monte Carlo simulation for investment outcome distribution analysis.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "monte_carlo"', enum: ['monte_carlo'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount in USD', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Time horizon in years', min: 1, max: 30 },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
        { name: 'simulations', type: 'number', required: false, description: 'Number of Monte Carlo simulations (100 to 10000)', min: 100, max: 10000, default: 1000 },
      ],
      exampleRequest: {
        action: 'monte_carlo',
        investmentAmount: 1000000,
        timeHorizon: 5,
        tokenType: 'carbon_credits',
        simulations: 1000,
      },
      exampleResponse: {
        success: true,
        data: {
          simulations: 1000,
          percentiles: {
            p5: 820000,
            p25: 1050000,
            p50: 1340000,
            p75: 1680000,
            p95: 2250000,
          },
          meanOutcome: 1390000,
          probabilityOfLoss: 0.12,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_MONTE_CARLO_ENGINE',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_yza567bcd',
        },
      },
    },
    {
      name: 'professional_metrics',
      description: 'Calculate professional-grade investment metrics for institutional reporting.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "professional_metrics"', enum: ['professional_metrics'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Time horizon in years', min: 1, max: 30 },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
        { name: 'persona', type: 'string', required: false, description: 'Investor persona for tailored metrics', enum: ['esg_fund', 'family_office', 'infrastructure_fund', 'sovereign_wealth', 'defi_native'] },
      ],
      exampleRequest: {
        action: 'professional_metrics',
        investmentAmount: 10000000,
        timeHorizon: 7,
        tokenType: 'carbon_credits',
        persona: 'esg_fund',
      },
      exampleResponse: {
        success: true,
        data: {
          investmentMetrics: {
            irr: 0.157,
            npv: 4250000,
            cashOnCash: 2.42,
          },
          riskMetrics: {
            sharpeRatio: 1.35,
            maxDrawdown: -0.18,
            volatility: 0.22,
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_PROFESSIONAL_ANALYTICS',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_bcd890efg',
        },
      },
    },
    {
      name: 'calculate',
      description: 'General-purpose investment calculator for WREI token investments.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "calculate"', enum: ['calculate'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount in USD', min: 1000, max: 1000000000 },
        { name: 'timeHorizon', type: 'number', required: true, description: 'Time horizon in years', min: 1, max: 30 },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
      ],
      exampleRequest: {
        action: 'calculate',
        investmentAmount: 250000,
        timeHorizon: 5,
        tokenType: 'carbon_credits',
      },
      exampleResponse: {
        success: true,
        data: {
          summary: {
            investmentAmount: 250000,
            projectedValue: 445000,
            totalReturn: 195000,
            annualReturn: 0.122,
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_INVESTMENT_CALCULATOR',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_efg123hij',
        },
      },
    },
  ],
  errorCodes: commonErrorCodes,
  notes: [
    'All analytics calculations use real WREI financial models.',
    'Investment amounts are validated between $1,000 and $1,000,000,000.',
    'Time horizons are validated between 1 and 30 years.',
    'Discount rates are validated between 1% and 50%.',
  ],
};

// =============================================================================
// COMPLIANCE API DOCUMENTATION
// =============================================================================

const complianceGetEndpoint: ApiEndpoint = {
  id: 'compliance-get',
  path: '/api/compliance',
  method: 'GET',
  category: 'compliance',
  title: 'Compliance Status (Read)',
  description:
    'Read-only compliance status queries. Retrieve overall compliance status, alerts, regulatory framework details, and digital assets framework assessments.',
  authentication: standardAuth,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
    windowDescription: '100 requests per minute',
  },
  actions: [
    {
      name: 'status',
      description: 'Get overall compliance status for the platform.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=status', enum: ['status'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          complianceStatus: {
            overallStatus: 'compliant',
            complianceScore: 85,
            lastAssessment: '2026-03-24T10:00:00.000Z',
          },
          jurisdiction: 'australia',
          framework: 'AUSTRAC_ASIC_APRA',
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_COMPLIANCE_STATUS',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_abc123',
        },
      },
    },
    {
      name: 'alerts',
      description: 'Get current compliance alerts and warnings.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=alerts', enum: ['alerts'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          alerts: [
            { level: 'info', message: 'Quarterly compliance review due in 14 days', timestamp: '2026-03-24T10:00:00.000Z' },
          ],
          totalAlerts: 1,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_COMPLIANCE_ALERTS',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_def456',
        },
      },
    },
    {
      name: 'regulatory_framework',
      description: 'Get the full Australian regulatory framework reference data.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=regulatory_framework', enum: ['regulatory_framework'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          framework: {
            jurisdiction: 'Australia',
            regulators: ['ASIC', 'AUSTRAC', 'APRA', 'ATO'],
            keyLegislation: ['Corporations Act 2001', 'AML/CTF Act 2006'],
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_REGULATORY_FRAMEWORK',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_ghi789',
        },
      },
    },
    {
      name: 'digital_assets_framework',
      description: 'Get digital assets regulatory framework compliance assessment.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=digital_assets_framework', enum: ['digital_assets_framework'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          digitalAssetsCompliance: {
            tokenClassification: 'financial_product',
            regulatoryStatus: 'compliant',
            applicableRegulations: ['ASIC Information Sheet 225', 'Token Mapping Framework'],
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_DAF_COMPLIANCE',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_jkl012',
        },
      },
    },
  ],
  errorCodes: commonErrorCodes,
  notes: [
    'GET endpoints use query parameters for action selection.',
    'URL format: /api/compliance?action=status',
    'All compliance data reflects Australian regulatory frameworks (AFSL, AML/CTF, AUSTRAC).',
  ],
};

const compliancePostEndpoint: ApiEndpoint = {
  id: 'compliance-post',
  path: '/api/compliance',
  method: 'POST',
  category: 'compliance',
  title: 'Compliance Assessment (Write)',
  description:
    'Run compliance assessments and generate reports. Includes investor classification, AFSL checks, AML/CTF verification, environmental compliance, tokenisation standards, and full compliance reports.',
  authentication: standardAuth,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
    windowDescription: '100 requests per minute',
  },
  actions: [
    {
      name: 'investor_classification',
      description: 'Classify an investor type for regulatory purposes (wholesale, sophisticated, retail).',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "investor_classification"', enum: ['investor_classification'] },
        { name: 'investorType', type: 'string', required: true, description: 'Investor type to classify', enum: ['wholesale', 'sophisticated', 'retail', 'professional'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Proposed investment amount', min: 1000, max: 1000000000 },
      ],
      exampleRequest: {
        action: 'investor_classification',
        investorType: 'sophisticated',
        investmentAmount: 500000,
      },
      exampleResponse: {
        success: true,
        data: {
          classification: 'sophisticated',
          eligible: true,
          requirements: ['Net assets > $2.5M or gross income > $250K for last 2 years'],
          restrictions: [],
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_INVESTOR_CLASSIFIER',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_mno345',
        },
      },
    },
    {
      name: 'afsl_check',
      description: 'Check AFSL (Australian Financial Services Licence) compliance for a given activity.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "afsl_check"', enum: ['afsl_check'] },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type being traded', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount', min: 1000, max: 1000000000 },
      ],
      exampleRequest: {
        action: 'afsl_check',
        tokenType: 'carbon_credits',
        investmentAmount: 1000000,
      },
      exampleResponse: {
        success: true,
        data: {
          afslRequired: true,
          afslStatus: 'compliant',
          licenceNumber: 'AFSL-WREI-001',
          authorisations: ['dealing in financial products', 'providing financial advice'],
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_AFSL_COMPLIANCE',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_pqr678',
        },
      },
    },
    {
      name: 'aml_check',
      description: 'Run AML/CTF (Anti-Money Laundering / Counter-Terrorism Financing) verification.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "aml_check"', enum: ['aml_check'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Transaction amount to check', min: 1000, max: 1000000000 },
        { name: 'investorType', type: 'string', required: false, description: 'Type of investor', enum: ['wholesale', 'sophisticated', 'retail', 'professional'] },
      ],
      exampleRequest: {
        action: 'aml_check',
        investmentAmount: 750000,
        investorType: 'wholesale',
      },
      exampleResponse: {
        success: true,
        data: {
          amlStatus: 'cleared',
          riskLevel: 'low',
          thresholdExceeded: false,
          reportingRequired: false,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_AML_COMPLIANCE',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_stu901',
        },
      },
    },
    {
      name: 'environmental',
      description: 'Assess environmental compliance for carbon credit operations.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "environmental"', enum: ['environmental'] },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
      ],
      exampleRequest: {
        action: 'environmental',
        tokenType: 'carbon_credits',
      },
      exampleResponse: {
        success: true,
        data: {
          environmentalCompliance: {
            status: 'compliant',
            certifications: ['Verra VCS', 'Gold Standard', 'WREI dMRV'],
            carbonIntegrity: 'high',
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_ENVIRONMENTAL_COMPLIANCE',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_vwx234',
        },
      },
    },
    {
      name: 'tokenization_standards',
      description: 'Verify tokenisation standards compliance (ERC-7518 / DyCIST).',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "tokenization_standards"', enum: ['tokenization_standards'] },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type to verify', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
      ],
      exampleRequest: {
        action: 'tokenization_standards',
        tokenType: 'carbon_credits',
      },
      exampleResponse: {
        success: true,
        data: {
          standard: 'ERC-7518 (DyCIST)',
          audit: 'CertiK',
          compliant: true,
          infrastructure: 'Zoniqx zProtocol',
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_TOKENIZATION_STANDARDS',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_yza567',
        },
      },
    },
    {
      name: 'full_report',
      description: 'Generate a comprehensive compliance report covering all regulatory aspects.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "full_report"', enum: ['full_report'] },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount', min: 1000, max: 1000000000 },
        { name: 'investorType', type: 'string', required: false, description: 'Investor type', enum: ['wholesale', 'sophisticated', 'retail', 'professional'] },
      ],
      exampleRequest: {
        action: 'full_report',
        tokenType: 'carbon_credits',
        investmentAmount: 2000000,
        investorType: 'wholesale',
      },
      exampleResponse: {
        success: true,
        data: {
          report: {
            overallStatus: 'compliant',
            score: 92,
            sections: {
              afsl: 'compliant',
              aml: 'cleared',
              environmental: 'compliant',
              tokenisation: 'compliant',
              tax: 'optimised',
            },
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_COMPLIANCE_REPORT',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_bcd890',
        },
      },
    },
    {
      name: 'tax_treatment',
      description: 'Get optimal tax treatment recommendation for a WREI token investment.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "tax_treatment"', enum: ['tax_treatment'] },
        { name: 'tokenType', type: 'string', required: true, description: 'Token type', enum: ['carbon_credits', 'asset_co', 'dual_portfolio'] },
        { name: 'investmentAmount', type: 'number', required: true, description: 'Investment amount', min: 1000, max: 1000000000 },
      ],
      exampleRequest: {
        action: 'tax_treatment',
        tokenType: 'carbon_credits',
        investmentAmount: 500000,
      },
      exampleResponse: {
        success: true,
        data: {
          taxTreatment: {
            classification: 'CGT Asset',
            cgtDiscount: '50% for holdings > 12 months',
            gstTreatment: 'GST-free (financial supply)',
            recommendedStructure: 'Trust or company holding',
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_TAX_OPTIMIZATION',
          apiVersion: '2.2.0',
          requestId: 'cmp_1711270800000_efg123',
        },
      },
    },
  ],
  errorCodes: commonErrorCodes,
  notes: [
    'POST endpoints use JSON body with an action field.',
    'All compliance checks reference Australian regulatory frameworks.',
    'AFSL compliance is assessed against ASIC requirements.',
    'AML/CTF checks follow AUSTRAC reporting obligations.',
  ],
};

// =============================================================================
// MARKET DATA API DOCUMENTATION
// =============================================================================

const marketDataEndpoint: ApiEndpoint = {
  id: 'market-data',
  path: '/api/market-data',
  method: 'GET',
  category: 'market-data',
  title: 'Market Data Feeds',
  description:
    'Real-time and historical market data for carbon pricing, RWA markets, sentiment analysis, and competitive intelligence. Data feeds simulate institutional-grade market connectivity.',
  authentication: standardAuth,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
    windowDescription: '100 requests per minute',
  },
  actions: [
    {
      name: 'carbon_pricing',
      description: 'Get current carbon credit pricing data across multiple markets and indices.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=carbon_pricing', enum: ['carbon_pricing'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          carbonPricing: {
            vcmSpot: 6.34,
            forwardRemoval: 180.00,
            dmrvPremium: 1.78,
            wreiIndex: 150.00,
          },
          timestamp: '2026-03-24T10:00:00.000Z',
          dataAge: 0,
          nextUpdate: '2026-03-24T10:01:00.000Z',
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_CARBON_FEED',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_abc123',
        },
      },
    },
    {
      name: 'carbon_analytics',
      description: 'Get carbon market analytics including trends, forecasts, and market depth.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=carbon_analytics', enum: ['carbon_analytics'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          carbonAnalytics: {
            trends: [{ direction: 'bullish', confidence: 0.78, timeframe: '30d' }],
            volumeMetrics: { daily: 125000, weekly: 875000 },
          },
          analysisDepth: 'comprehensive',
          trendConfidence: 'high',
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_CARBON_ANALYTICS',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_def456',
        },
      },
    },
    {
      name: 'rwa_market',
      description: 'Get Real World Asset (RWA) market data and tokenisation metrics.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=rwa_market', enum: ['rwa_market'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          rwaMarket: {
            totalMarketCap: 12500000000,
            carbonTokenShare: 0.08,
            growthRate: 0.45,
          },
          timestamp: '2026-03-24T10:00:00.000Z',
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_RWA_FEED',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_ghi789',
        },
      },
    },
    {
      name: 'rwa_analytics',
      description: 'Get RWA market analytics and institutional adoption trends.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=rwa_analytics', enum: ['rwa_analytics'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          rwaAnalytics: {
            institutionalAdoption: 0.34,
            regulatoryClarity: 'improving',
            topSectors: ['real_estate', 'carbon_credits', 'commodities'],
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_RWA_ANALYTICS',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_jkl012',
        },
      },
    },
    {
      name: 'market_sentiment',
      description: 'Get aggregated market sentiment for carbon and RWA markets.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=market_sentiment', enum: ['market_sentiment'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          sentiment: {
            overall: 'bullish',
            score: 72,
            sources: ['institutional_flows', 'regulatory_signals', 'market_momentum'],
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_SENTIMENT_FEED',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_mno345',
        },
      },
    },
    {
      name: 'competitive_analysis',
      description: 'Get competitive intelligence on carbon credit platforms and market positioning.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=competitive_analysis', enum: ['competitive_analysis'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          competitiveAnalysis: {
            wreiPosition: 'premium_differentiated',
            competitors: 5,
            marketShare: 0.12,
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_COMPETITIVE_INTELLIGENCE',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_pqr678',
        },
      },
    },
    {
      name: 'carbon_projections',
      description: 'Get carbon credit price projections and forecast models.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=carbon_projections', enum: ['carbon_projections'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          projections: {
            shortTerm: { horizon: '3m', target: 165, confidence: 0.82 },
            mediumTerm: { horizon: '12m', target: 195, confidence: 0.68 },
            longTerm: { horizon: '36m', target: 280, confidence: 0.52 },
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_CARBON_PROJECTIONS',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_stu901',
        },
      },
    },
    {
      name: 'historical',
      description: 'Get historical market data for a specified time range.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=historical', enum: ['historical'] },
        { name: 'feedType', type: 'string', required: false, description: 'Data feed type', enum: ['carbon_pricing', 'rwa_market', 'regulatory_alerts', 'market_sentiment'], default: 'carbon_pricing' },
        { name: 'timeRange', type: 'string', required: false, description: 'Time range for historical data', enum: ['1h', '4h', '12h', '24h', '3d', '7d', '30d', '90d', '1y'], default: '24h' },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          historicalData: {
            feedType: 'carbon_pricing',
            timeRange: '24h',
            dataPoints: 24,
            series: [
              { timestamp: '2026-03-23T10:00:00.000Z', value: 148.50 },
              { timestamp: '2026-03-23T11:00:00.000Z', value: 149.20 },
            ],
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_HISTORICAL_DATA',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_vwx234',
        },
      },
    },
    {
      name: 'feed_status',
      description: 'Get the operational status of all market data feeds.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=feed_status', enum: ['feed_status'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          feeds: {
            carbonPricing: { status: 'active', latency: 12, lastUpdate: '2026-03-24T10:00:00.000Z' },
            rwaMarket: { status: 'active', latency: 8, lastUpdate: '2026-03-24T10:00:00.000Z' },
            sentiment: { status: 'active', latency: 45, lastUpdate: '2026-03-24T09:59:00.000Z' },
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_FEED_STATUS',
          apiVersion: '2.2.0',
          requestId: 'mkt_1711270800000_yza567',
        },
      },
    },
  ],
  errorCodes: commonErrorCodes,
  notes: [
    'All market data endpoints use GET with query parameters.',
    'URL format: /api/market-data?action=carbon_pricing',
    'Historical data supports multiple time ranges from 1 hour to 1 year.',
    'Feed data simulates real-time market connectivity for the demo.',
  ],
};

// =============================================================================
// METADATA API DOCUMENTATION
// =============================================================================

const metadataEndpoint: ApiEndpoint = {
  id: 'metadata',
  path: '/api/metadata',
  method: 'GET',
  category: 'metadata',
  title: 'Token Metadata',
  description:
    'Query and retrieve blockchain provenance metadata for WREI tokens. Provides token lifecycle tracking, quality scores, verification status, and comprehensive audit trails.',
  authentication: {
    required: false,
    header: 'N/A',
    description: 'The metadata endpoint does not require API key authentication in the current version.',
    devMode: 'No authentication required.',
  },
  rateLimit: {
    maxRequests: 200,
    windowMs: 60000,
    windowDescription: '200 requests per minute',
  },
  actions: [
    {
      name: 'query',
      description: 'Query tokens with optional filters for type, vessel, quality score, and date range.',
      parameters: [
        { name: 'action', type: 'string', required: false, description: 'Query parameter: action=query (default)', enum: ['query'], default: 'query' },
        { name: 'tokenType', type: 'string', required: false, description: 'Filter by token type' },
        { name: 'vesselId', type: 'string', required: false, description: 'Filter by vessel ID' },
        { name: 'minQualityScore', type: 'number', required: false, description: 'Minimum quality score (0 to 100)' },
        { name: 'verificationStatus', type: 'boolean', required: false, description: 'Filter by verification status' },
        { name: 'fromDate', type: 'string', required: false, description: 'Start date for date range filter (ISO 8601)' },
        { name: 'toDate', type: 'string', required: false, description: 'End date for date range filter (ISO 8601)' },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          tokens: [],
          totalCount: 0,
        },
        query: { tokenType: 'carbon_credits' },
      },
    },
    {
      name: 'statistics',
      description: 'Get aggregate metadata statistics across all tokens.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=statistics', enum: ['statistics'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          totalTokens: 0,
          averageQualityScore: 0,
          verificationRate: 0,
          tokenTypeDistribution: {},
        },
      },
    },
    {
      name: 'retrieve',
      description: 'Retrieve metadata for a specific token by ID.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=retrieve', enum: ['retrieve'] },
        { name: 'tokenId', type: 'string', required: true, description: 'The unique token identifier', example: 'WREI-CC-001' },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          tokenId: 'WREI-CC-001',
          tokenType: 'carbon_credits',
          qualityScore: 92,
          verificationStatus: true,
          provenance: {
            issueDate: '2026-01-15T00:00:00.000Z',
            verifier: 'WREI dMRV Engine',
          },
        },
      },
    },
    {
      name: 'tokens',
      description: 'Get a list of all token IDs in the system.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=tokens', enum: ['tokens'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          tokenIds: ['WREI-CC-001', 'WREI-AC-001'],
          count: 2,
        },
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Missing required parameters (e.g., tokenId for retrieve action)' },
    { code: 404, name: 'Not Found', description: 'Token metadata not found for the specified tokenId' },
    { code: 500, name: 'Internal Error', description: 'Unexpected server error' },
  ],
  notes: [
    'GET endpoints use query parameters.',
    'URL format: /api/metadata?action=query&tokenType=carbon_credits',
    'The metadata system stores token provenance on a per-session basis (no persistent database in demo).',
  ],
};

const metadataDeleteEndpoint: ApiEndpoint = {
  id: 'metadata-delete',
  path: '/api/metadata',
  method: 'DELETE',
  category: 'metadata',
  title: 'Token Metadata (Clear)',
  description: 'Clear all stored token metadata. Used for testing and demo reset purposes.',
  authentication: {
    required: false,
    header: 'N/A',
    description: 'No authentication required.',
    devMode: 'No authentication required.',
  },
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000,
    windowDescription: '10 requests per minute',
  },
  actions: [
    {
      name: 'clear',
      description: 'Clear all stored token metadata.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=clear', enum: ['clear'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        message: 'All metadata cleared',
      },
    },
  ],
  errorCodes: [
    { code: 400, name: 'Bad Request', description: 'Invalid action parameter' },
    { code: 500, name: 'Internal Error', description: 'Unexpected server error' },
  ],
};

// =============================================================================
// PERFORMANCE API DOCUMENTATION
// =============================================================================

const performanceGetEndpoint: ApiEndpoint = {
  id: 'performance-get',
  path: '/api/performance',
  method: 'GET',
  category: 'performance',
  title: 'Performance Monitoring (Read)',
  description:
    'Retrieve real-time performance metrics, system health status, benchmarks, and load test results for the WREI platform.',
  authentication: standardAuth,
  rateLimit: {
    maxRequests: 50,
    windowMs: 60000,
    windowDescription: '50 requests per minute',
  },
  actions: [
    {
      name: 'snapshot',
      description: 'Get a current performance snapshot with all key metrics.',
      parameters: [
        { name: 'action', type: 'string', required: false, description: 'Query parameter: action=snapshot (default)', enum: ['snapshot'], default: 'snapshot' },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          snapshot: {
            responseTime: { avg: 45, p95: 120, p99: 250 },
            throughput: 1200,
            errorRate: 0.002,
            uptime: 0.999,
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_PERFORMANCE_MONITOR',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_perf01',
        },
      },
    },
    {
      name: 'benchmarks',
      description: 'Get performance benchmarks and target compliance status.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=benchmarks', enum: ['benchmarks'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          benchmarks: [
            { category: 'API', name: 'Response Time', target: 200, current: 45, unit: 'ms', status: 'healthy' },
            { category: 'API', name: 'Throughput', target: 1000, current: 1200, unit: 'req/min', status: 'healthy' },
          ],
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_PERFORMANCE_BENCHMARKS',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_perf02',
        },
      },
    },
    {
      name: 'health',
      description: 'Get system health report covering all platform components.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=health', enum: ['health'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          overall: 'healthy',
          components: {
            apiGateway: 'healthy',
            analyticsEngine: 'healthy',
            complianceModule: 'healthy',
            marketDataFeeds: 'healthy',
          },
          alerts: [],
          recommendations: [],
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_SYSTEM_HEALTH',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_perf03',
        },
      },
    },
    {
      name: 'load_test',
      description: 'Get the most recent load test results.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Query parameter: action=load_test', enum: ['load_test'] },
      ],
      exampleRequest: {},
      exampleResponse: {
        success: true,
        data: {
          testName: 'Standard Load Test',
          duration: 60000,
          totalRequests: 1200,
          successfulRequests: 1198,
          failedRequests: 2,
          averageResponseTime: 45,
          p95ResponseTime: 120,
          errorRate: 0.0017,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_LOAD_TEST_RESULTS',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_perf04',
        },
      },
    },
  ],
  errorCodes: commonErrorCodes,
  notes: [
    'Performance endpoints have a lower rate limit (50/min) to prevent monitoring overhead.',
    'Health checks are lightweight and can be used for uptime monitoring.',
    'Load test results reflect the most recent test run.',
  ],
};

const performancePostEndpoint: ApiEndpoint = {
  id: 'performance-post',
  path: '/api/performance',
  method: 'POST',
  category: 'performance',
  title: 'Performance Testing (Write)',
  description:
    'Trigger performance benchmarks, stress tests, and manage performance metrics.',
  authentication: standardAuth,
  rateLimit: {
    maxRequests: 20,
    windowMs: 60000,
    windowDescription: '20 requests per minute',
  },
  actions: [
    {
      name: 'run_benchmark',
      description: 'Trigger a performance benchmark run.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "run_benchmark"', enum: ['run_benchmark'] },
        { name: 'benchmarkType', type: 'string', required: false, description: 'Type of benchmark to run', enum: ['quick', 'standard', 'comprehensive'], default: 'quick' },
      ],
      exampleRequest: {
        action: 'run_benchmark',
        benchmarkType: 'standard',
      },
      exampleResponse: {
        success: true,
        data: {
          benchmarkId: 'bench_1711270800000',
          status: 'completed',
          results: {
            avgResponseTime: 42,
            p95ResponseTime: 110,
            throughput: 1350,
          },
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_BENCHMARK_RUNNER',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_bench01',
        },
      },
    },
    {
      name: 'stress_test',
      description: 'Run a stress test to evaluate system capacity limits.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "stress_test"', enum: ['stress_test'] },
        { name: 'concurrency', type: 'number', required: false, description: 'Number of concurrent simulated users', default: 10, min: 1, max: 100 },
        { name: 'duration', type: 'number', required: false, description: 'Test duration in seconds', default: 30, min: 5, max: 300 },
      ],
      exampleRequest: {
        action: 'stress_test',
        concurrency: 20,
        duration: 60,
      },
      exampleResponse: {
        success: true,
        data: {
          testId: 'stress_1711270800000',
          status: 'completed',
          peakConcurrency: 20,
          maxThroughput: 2400,
          degradationPoint: 50,
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_STRESS_TEST',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_stress01',
        },
      },
    },
    {
      name: 'clear_metrics',
      description: 'Clear all stored performance metrics and reset counters.',
      parameters: [
        { name: 'action', type: 'string', required: true, description: 'Must be "clear_metrics"', enum: ['clear_metrics'] },
      ],
      exampleRequest: {
        action: 'clear_metrics',
      },
      exampleResponse: {
        success: true,
        data: {
          cleared: true,
          message: 'All performance metrics have been cleared',
        },
        metadata: {
          timestamp: '2026-03-24T10:00:00.000Z',
          source: 'WREI_METRICS_MANAGER',
          apiVersion: '2.2.0',
          requestId: 'wrei_1711270800000_clear01',
        },
      },
    },
  ],
  errorCodes: commonErrorCodes,
  notes: [
    'POST endpoints have a lower rate limit (20/min) as they trigger resource-intensive operations.',
    'Stress tests are simulated in the demo and do not affect actual system performance.',
    'Clearing metrics is irreversible within the current session.',
  ],
};

// =============================================================================
// COMPLETE API DOCUMENTATION
// =============================================================================

export const allEndpoints: ApiEndpoint[] = [
  negotiateEndpoint,
  analyticsEndpoint,
  complianceGetEndpoint,
  compliancePostEndpoint,
  marketDataEndpoint,
  metadataEndpoint,
  metadataDeleteEndpoint,
  performanceGetEndpoint,
  performancePostEndpoint,
];

/**
 * Get all endpoints grouped by category
 */
export function getEndpointsByCategory(): Record<ApiCategory, ApiEndpoint[]> {
  const grouped: Record<ApiCategory, ApiEndpoint[]> = {
    trading: [],
    analytics: [],
    compliance: [],
    'market-data': [],
    metadata: [],
    performance: [],
  };

  for (const endpoint of allEndpoints) {
    grouped[endpoint.category].push(endpoint);
  }

  return grouped;
}

/**
 * Get a specific endpoint by ID
 */
export function getEndpointById(id: string): ApiEndpoint | undefined {
  return allEndpoints.find((ep) => ep.id === id);
}

/**
 * Get all unique actions for an endpoint
 */
export function getEndpointActions(endpointId: string): string[] {
  const endpoint = getEndpointById(endpointId);
  if (!endpoint) return [];
  return endpoint.actions.map((a) => a.name);
}

/**
 * Get total count of documented endpoints
 */
export function getEndpointCount(): number {
  return allEndpoints.length;
}

/**
 * Get total count of documented actions across all endpoints
 */
export function getTotalActionCount(): number {
  return allEndpoints.reduce((sum, ep) => sum + ep.actions.length, 0);
}

/**
 * Validate that an example request contains valid JSON
 */
export function validateExamplePayloads(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const endpoint of allEndpoints) {
    for (const action of endpoint.actions) {
      try {
        JSON.stringify(action.exampleRequest);
      } catch {
        errors.push(`Invalid example request for ${endpoint.id}/${action.name}`);
      }
      try {
        JSON.stringify(action.exampleResponse);
      } catch {
        errors.push(`Invalid example response for ${endpoint.id}/${action.name}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// CODE EXAMPLES
// =============================================================================

export interface CodeExample {
  language: string;
  label: string;
  code: string;
}

/**
 * Generate code examples for a given endpoint and action
 */
export function generateCodeExamples(
  endpoint: ApiEndpoint,
  action: ApiEndpointAction
): CodeExample[] {
  const baseUrl = 'https://wrei-trading-platform.vercel.app';

  if (endpoint.method === 'GET') {
    const queryParams = action.parameters
      .filter((p) => p.example !== undefined || p.enum)
      .map((p) => `${p.name}=${p.example || (p.enum ? p.enum[0] : '')}`)
      .join('&');
    const url = `${baseUrl}${endpoint.path}?${queryParams || `action=${action.name}`}`;

    return [
      {
        language: 'curl',
        label: 'cURL',
        code: `curl -X GET "${url}" \\
  -H "X-WREI-API-Key: your_api_key_here"`,
      },
      {
        language: 'javascript',
        label: 'JavaScript',
        code: `const response = await fetch("${url}", {
  method: "GET",
  headers: {
    "X-WREI-API-Key": "your_api_key_here"
  }
});

const data = await response.json();
console.log(data);`,
      },
      {
        language: 'python',
        label: 'Python',
        code: `import requests

response = requests.get(
    "${url}",
    headers={"X-WREI-API-Key": "your_api_key_here"}
)

data = response.json()
print(data)`,
      },
    ];
  }

  if (endpoint.method === 'DELETE') {
    const url = `${baseUrl}${endpoint.path}?action=${action.name}`;

    return [
      {
        language: 'curl',
        label: 'cURL',
        code: `curl -X DELETE "${url}"`,
      },
      {
        language: 'javascript',
        label: 'JavaScript',
        code: `const response = await fetch("${url}", {
  method: "DELETE"
});

const data = await response.json();
console.log(data);`,
      },
      {
        language: 'python',
        label: 'Python',
        code: `import requests

response = requests.delete("${url}")
data = response.json()
print(data)`,
      },
    ];
  }

  // POST requests
  const bodyJson = JSON.stringify(action.exampleRequest, null, 2);

  return [
    {
      language: 'curl',
      label: 'cURL',
      code: `curl -X POST "${baseUrl}${endpoint.path}" \\
  -H "Content-Type: application/json" \\
  -H "X-WREI-API-Key: your_api_key_here" \\
  -d '${bodyJson}'`,
    },
    {
      language: 'javascript',
      label: 'JavaScript',
      code: `const response = await fetch("${baseUrl}${endpoint.path}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-WREI-API-Key": "your_api_key_here"
  },
  body: JSON.stringify(${bodyJson})
});

const data = await response.json();
console.log(data);`,
    },
    {
      language: 'python',
      label: 'Python',
      code: `import requests

response = requests.post(
    "${baseUrl}${endpoint.path}",
    headers={
        "Content-Type": "application/json",
        "X-WREI-API-Key": "your_api_key_here"
    },
    json=${bodyJson.replace(/"/g, '"').replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}
)

data = response.json()
print(data)`,
    },
  ];
}
