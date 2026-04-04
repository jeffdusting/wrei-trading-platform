import type { PersonaType, WREITokenType, InvestorClassification, NegotiationState } from '@/lib/types';
import { WREI_TOKEN_CONFIG, NEGOTIATION_CONFIG } from '@/lib/negotiation-config';
import { calculateProfessionalMetrics, generateScenarioAnalysis } from '@/lib/professional-analytics';
import type { ReportData } from '@/lib/export-utilities';

export const isInstitutionalPersona = (persona: PersonaType | 'freeplay'): boolean => {
  const institutionalPersonas: PersonaType[] = [
    'infrastructure_fund',
    'esg_impact_investor',
    'defi_yield_farmer',
    'family_office',
    'sovereign_wealth',
    'pension_fund'
  ];
  return institutionalPersonas.includes(persona as PersonaType);
};

export const mapUrlPersonaToBuyerPersona = (urlPersona: string): PersonaType | 'freeplay' => {
  const personaMapping: Record<string, PersonaType> = {
    'corporate_compliance_officer': 'compliance_officer',
    'esg_fund_portfolio_manager': 'esg_impact_investor',
    'carbon_trading_desk_analyst': 'trading_desk',
    'sustainability_director_midcap': 'family_office',
    'government_procurement_officer': 'government_procurement'
  };
  return personaMapping[urlPersona] || 'freeplay';
};

export const getPriceRangePercent = (tradingState: NegotiationState | null): number => {
  if (!tradingState) return 50;

  const tokenType = tradingState.wreiTokenType || 'carbon_credits';

  if (tokenType === 'asset_co') {
    const minYield = 20;
    const maxYield = 30;
    const range = maxYield - minYield;
    const position = tradingState.currentOfferPrice - minYield;
    return Math.max(0, Math.min(100, (position / range) * 100));
  } else if (tokenType === 'dual_portfolio') {
    return 50;
  } else {
    const basePrice = WREI_TOKEN_CONFIG.CARBON_CREDITS.BASE_PRICE;
    const anchorPrice = WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE;
    const range = anchorPrice - basePrice;
    const position = tradingState.currentOfferPrice - basePrice;
    return Math.max(0, Math.min(100, (position / range) * 100));
  }
};

export const getConcessionPercent = (tradingState: NegotiationState | null): number => {
  if (!tradingState) return 0;
  const tokenType = tradingState.wreiTokenType || 'carbon_credits';

  if (tokenType === 'asset_co') {
    const anchorYield = WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.EQUITY_YIELD * 100;
    return Math.round((tradingState.totalConcessionGiven / anchorYield) * 100);
  } else if (tokenType === 'dual_portfolio') {
    return Math.round((tradingState.totalConcessionGiven / tradingState.anchorPrice) * 100);
  } else {
    return Math.round((tradingState.totalConcessionGiven / WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE) * 100);
  }
};

export const generateReportData = (
  selectedWREITokenType: WREITokenType,
  investmentSize: number,
  timeHorizon: number,
  investorClassification: InvestorClassification,
  selectedPersona: PersonaType | 'freeplay',
  selectedPersonaName: string | undefined
): ReportData => {
  const tokenType = selectedWREITokenType;
  const expectedReturn = tokenType === 'carbon_credits' ? 0.08 :
                        tokenType === 'asset_co' ? 0.283 : 0.185;
  const volatility = tokenType === 'carbon_credits' ? 0.25 :
                    tokenType === 'asset_co' ? 0.12 : 0.15;

  const getRiskTolerance = (persona: PersonaType | 'freeplay'): 'conservative' | 'moderate' | 'aggressive' => {
    const riskMap: Record<string, 'conservative' | 'moderate' | 'aggressive'> = {
      infrastructure_fund: 'moderate',
      family_office: 'conservative',
      esg_impact_investor: 'moderate',
      pension_fund: 'conservative',
      sovereign_wealth: 'aggressive',
      insurance_company: 'conservative'
    };
    return riskMap[persona] || 'moderate';
  };

  const professionalMetrics = calculateProfessionalMetrics(
    investmentSize,
    selectedPersona as PersonaType,
    timeHorizon,
    getRiskTolerance(selectedPersona)
  );

  const scenarioAnalysis = generateScenarioAnalysis(
    tokenType,
    investmentSize,
    timeHorizon,
    expectedReturn,
    volatility,
    investorClassification
  );

  return {
    investmentSummary: {
      tokenType,
      investmentAmount: investmentSize,
      timeHorizon,
      expectedReturn,
      riskLevel: investorClassification
    },
    professionalMetrics,
    scenarioAnalysis,
    chartData: {
      performanceChart: [],
      riskReturnScatter: [],
      allocationPie: [],
      drawdownChart: [],
      rollingReturns: [],
      correlationHeatmap: []
    },
    complianceData: {
      regulatoryStatus: 'Australian AFSL 534187',
      disclosures: [
        'Investment values may fall as well as rise',
        'Past performance is not indicative of future results',
        'Carbon credit values subject to regulatory changes'
      ],
      riskWarnings: [
        'Technology and counterparty risks apply',
        'Liquidity may be limited in secondary markets',
        'Regulatory environment may change'
      ],
      taxImplications: [
        'Income treatment for revenue share mechanism',
        'CGT treatment for NAV-accruing mechanism',
        'Franking credits may be available'
      ]
    },
    marketData: {
      benchmarkComparisons: professionalMetrics.benchmarkOutperformance,
      competitivePositioning: [
        'Native digital carbon credits with T+0 settlement',
        'Asset-backed yield from real infrastructure',
        'Cross-collateral capability up to 90% LTV'
      ],
      marketTrends: [
        'A$155B carbon market projected by 2030',
        'A$19B tokenized RWA market growth',
        'Increasing institutional adoption'
      ]
    },
    generatedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    reportVersion: '6.2.0'
  };
};

const AUM_MAP: Record<string, number> = {
  infrastructure_fund: 5_000_000_000, esg_impact: 1_000_000_000,
  defi_farmer: 2_000_000_000, family_office: 2_500_000_000,
  sovereign_wealth: 230_000_000_000, pension_fund: 300_000_000_000,
};

const RISK_MAP: Record<string, 'conservative' | 'moderate' | 'aggressive'> = {
  infrastructure_fund: 'moderate', esg_impact: 'moderate', defi_farmer: 'aggressive',
  family_office: 'conservative', sovereign_wealth: 'conservative', pension_fund: 'conservative',
};

const YIELD_MAP: Record<string, number> = {
  infrastructure_fund: 0.12, esg_impact: 0.10, defi_farmer: 0.15,
  family_office: 0.08, sovereign_wealth: 0.08, pension_fund: 0.09,
};

export const buildInvestorProfile = (
  selectedPersona: PersonaType | 'freeplay',
  investorClassification: InvestorClassification
) => ({
  type: selectedPersona as PersonaType,
  classification: investorClassification,
  aum: AUM_MAP[selectedPersona] || 5_000_000_000,
  riskTolerance: RISK_MAP[selectedPersona] || 'moderate' as const,
  yieldRequirement: YIELD_MAP[selectedPersona] || 0.10,
  liquidityNeeds: 'quarterly' as const,
});

export const buildPortfolioAllocation = (selectedWREITokenType: WREITokenType) => ({
  carbonCredits: selectedWREITokenType === 'carbon_credits' ? 1.0 : 0.3,
  assetCoTokens: selectedWREITokenType === 'asset_co' ? 1.0 : 0.4,
  dualPortfolio: selectedWREITokenType === 'dual_portfolio' ? 1.0 : 0.3,
});

export const buildProvenanceTradeData = (
  lastAgreedTrade: { id: string; instrument_id: string; quantity: number; price_per_unit: number; total_value: number; currency: string; executed_at: string },
  selectedInstrument: string,
  selectedPersona: PersonaType | 'freeplay',
) => ({
  tradeId: lastAgreedTrade.id,
  instrumentType: lastAgreedTrade.instrument_id,
  instrumentName: selectedInstrument === 'WREI_CC' ? 'WREI Carbon Credit Token' :
    selectedInstrument === 'WREI_ACO' ? 'WREI Asset Co Token' : lastAgreedTrade.instrument_id,
  quantity: lastAgreedTrade.quantity,
  pricePerUnit: lastAgreedTrade.price_per_unit,
  totalValue: lastAgreedTrade.total_value,
  currency: lastAgreedTrade.currency,
  buyer: selectedPersona === 'freeplay' ? 'Free Play Buyer' : (selectedPersona as string).replace(/_/g, ' '),
  seller: 'WREI Trading Platform',
  timestamp: lastAgreedTrade.executed_at,
  settlementMethod: selectedInstrument.startsWith('WREI') ? 'Zoniqx zConnect (T+0)' : 'Registry Transfer',
  settlementStatus: 'confirmed' as const,
});

export const buildProvenanceData = (
  selectedInstrument: string,
  quantity: number,
) => selectedInstrument === 'WREI_CC' ? {
  vesselId: 'WREI-V042',
  vesselName: 'Sydney Explorer',
  route: 'Circular Quay → Manly',
  emissionsSaved: quantity * 0.85,
  verificationStandards: ['ISO 14064-2', 'Verra VCS', 'Gold Standard'],
  blockchainTxHash: `0x${Date.now().toString(16)}a4f7b2c1d8e9f0`,
  tokenStandard: 'ERC-7518 (DyCIST)',
  blockchainNetwork: 'Polygon PoS',
} : undefined;
