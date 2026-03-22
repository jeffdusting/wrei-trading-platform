/**
 * Phase 5.1: Market Context Integration Tests
 *
 * Test-Driven Development for advanced market intelligence functionality.
 * Tests written BEFORE implementation following development process framework.
 */

import { MarketIntelligenceSystem } from '@/lib/market-intelligence';

describe('Phase 5.1: Market Context Integration', () => {

  let marketIntelligence: MarketIntelligenceSystem;

  beforeEach(() => {
    marketIntelligence = new MarketIntelligenceSystem();
  });

  describe('1. Tokenized RWA Market Intelligence', () => {

    test('should provide A$19B tokenized RWA market context', () => {
      const rwaContext = marketIntelligence.getTokenizedRWAMarketContext();

      expect(rwaContext).toHaveProperty('totalMarketValue', 19_000_000_000);
      expect(rwaContext.totalMarketValue).toBe(19_000_000_000); // A$19B
      expect(rwaContext).toHaveProperty('growthRate');
      expect(rwaContext.growthRate).toBeCloseTo(1.4, 1); // 140% growth in 15 months
      expect(rwaContext).toHaveProperty('treasuryTokenSegment');
      expect(rwaContext.treasuryTokenSegment).toBe(9_000_000_000); // A$9B treasury tokens
    });

    test('should track market composition and segments', () => {
      const rwaContext = marketIntelligence.getTokenizedRWAMarketContext();

      expect(rwaContext).toHaveProperty('marketSegments');
      expect(rwaContext.marketSegments).toHaveProperty('treasuryTokens');
      expect(rwaContext.marketSegments).toHaveProperty('privateCredit');
      expect(rwaContext.marketSegments).toHaveProperty('commodities');
      expect(rwaContext.marketSegments).toHaveProperty('realEstate');

      // Validate total adds up to A$19B
      const total = Object.values(rwaContext.marketSegments).reduce((sum: number, value: any) => sum + value, 0);
      expect(total).toBeCloseTo(19_000_000_000, -6); // Within millions
    });

    test('should provide growth trajectory analysis', () => {
      const growthAnalysis = marketIntelligence.getRWAGrowthTrajectory();

      expect(growthAnalysis).toHaveProperty('currentValue', 19_000_000_000);
      expect(growthAnalysis).toHaveProperty('projectedValue');
      expect(growthAnalysis.projectedValue).toBeGreaterThan(19_000_000_000);
      expect(growthAnalysis).toHaveProperty('timeframe');
      expect(growthAnalysis).toHaveProperty('keyDrivers');
      expect(Array.isArray(growthAnalysis.keyDrivers)).toBe(true);
    });

  });

  describe('2. Carbon Market Intelligence', () => {

    test('should provide A$155B projected carbon market by 2030', () => {
      const carbonMarketContext = marketIntelligence.getCarbonMarketProjections();

      expect(carbonMarketContext).toHaveProperty('projected2030Value', 155_000_000_000);
      expect(carbonMarketContext.projected2030Value).toBe(155_000_000_000); // A$155B
      expect(carbonMarketContext).toHaveProperty('currentValue');
      expect(carbonMarketContext.currentValue).toBeLessThan(155_000_000_000);
      expect(carbonMarketContext).toHaveProperty('cagr');
      expect(carbonMarketContext.cagr).toBeGreaterThan(0.2); // >20% CAGR expected
    });

    test('should segment voluntary vs compliance carbon markets', () => {
      const carbonSegments = marketIntelligence.getCarbonMarketSegmentation();

      expect(carbonSegments).toHaveProperty('voluntaryMarket');
      expect(carbonSegments).toHaveProperty('complianceMarket');
      expect(carbonSegments.voluntaryMarket).toHaveProperty('currentValue');
      expect(carbonSegments.voluntaryMarket).toHaveProperty('projected2030');
      expect(carbonSegments.complianceMarket).toHaveProperty('currentValue');
      expect(carbonSegments.complianceMarket).toHaveProperty('projected2030');

      // Total should equal projected A$155B
      const totalProjected = carbonSegments.voluntaryMarket.projected2030 +
                            carbonSegments.complianceMarket.projected2030;
      expect(totalProjected).toBeCloseTo(155_000_000_000, -7); // Within tens of millions
    });

    test('should track carbon credit quality tiers and pricing', () => {
      const qualityTiers = marketIntelligence.getCarbonQualityTierAnalysis();

      expect(qualityTiers).toHaveProperty('premiumTier'); // Verra VCS, Gold Standard
      expect(qualityTiers).toHaveProperty('standardTier'); // Basic offsets
      expect(qualityTiers).toHaveProperty('emergingTier'); // Nature-based, tech removal

      expect(qualityTiers.premiumTier).toHaveProperty('priceRange');
      expect(qualityTiers.premiumTier).toHaveProperty('qualityStandards');
      expect(qualityTiers.premiumTier.qualityStandards).toContain('Verra VCS');
      expect(qualityTiers.premiumTier.qualityStandards).toContain('Gold Standard');
    });

  });

  describe('3. Competitive Analysis Framework', () => {

    test('should analyze USYC competitive positioning', () => {
      const usycAnalysis = marketIntelligence.getCompetitorAnalysis('USYC');

      expect(usycAnalysis).toHaveProperty('name', 'USYC');
      expect(usycAnalysis).toHaveProperty('aum');
      expect(usycAnalysis.aum).toBeGreaterThan(1_000_000_000); // >A$1B AUM
      expect(usycAnalysis).toHaveProperty('yieldMechanism');
      expect(usycAnalysis.yieldMechanism).toContain('treasury'); // Treasury-backed
      expect(usycAnalysis).toHaveProperty('currentYield');
      expect(usycAnalysis.currentYield).toBeGreaterThan(0.04); // >4% yield
      expect(usycAnalysis.currentYield).toBeLessThan(0.06); // <6% yield range
    });

    test('should analyze BUIDL competitive positioning', () => {
      const buidlAnalysis = marketIntelligence.getCompetitorAnalysis('BUIDL');

      expect(buidlAnalysis).toHaveProperty('name', 'BUIDL');
      expect(buidlAnalysis).toHaveProperty('aum');
      expect(buidlAnalysis.aum).toBeGreaterThan(500_000_000); // >A$500M AUM
      expect(buidlAnalysis).toHaveProperty('yieldMechanism');
      expect(buidlAnalysis.yieldMechanism).toContain('Money market'); // Money market fund
      expect(buidlAnalysis).toHaveProperty('institutionalFocus');
      expect(buidlAnalysis.institutionalFocus).toBe(true);
    });

    test('should provide WREI competitive advantages analysis', () => {
      const wreiAdvantages = marketIntelligence.getWREICompetitiveAdvantages();

      expect(wreiAdvantages).toHaveProperty('yieldPremium');
      expect(wreiAdvantages.yieldPremium).toBeGreaterThan(0.23); // >23% vs USYC (28.3% vs 4.5%)
      expect(wreiAdvantages).toHaveProperty('realWorldUtility');
      expect(wreiAdvantages.realWorldUtility).toBe(true);
      expect(wreiAdvantages).toHaveProperty('infrastructureExposure');
      expect(wreiAdvantages).toHaveProperty('carbonCreditsExposure');
      expect(wreiAdvantages).toHaveProperty('dualTokenStrategy');
    });

    test('should benchmark against infrastructure REITs', () => {
      const reitBenchmark = marketIntelligence.getInfrastructureREITBenchmark();

      expect(reitBenchmark).toHaveProperty('averageYield');
      expect(reitBenchmark.averageYield).toBeGreaterThan(0.08); // >8% typical infrastructure REIT yield
      expect(reitBenchmark.averageYield).toBeLessThan(0.12); // <12% typical range
      expect(reitBenchmark).toHaveProperty('wreiPremium');
      expect(reitBenchmark.wreiPremium).toBeGreaterThan(0.16); // 28.3% vs ~12% = ~16% premium
    });

  });

  describe('4. J.P. Morgan Kinexys Positioning', () => {

    test('should analyze Kinexys market position and limitations', () => {
      const kinexysAnalysis = marketIntelligence.getKinexysAnalysis();

      expect(kinexysAnalysis).toHaveProperty('name', 'J.P. Morgan Kinexys');
      expect(kinexysAnalysis).toHaveProperty('marketPosition');
      expect(kinexysAnalysis.marketPosition).toContain('Carbon credit trading');
      expect(kinexysAnalysis).toHaveProperty('limitations');
      expect(Array.isArray(kinexysAnalysis.limitations)).toBe(true);
      expect(kinexysAnalysis.limitations).toContain('Trading focus only (no verification)');
      expect(kinexysAnalysis).toHaveProperty('tradingVolume');
    });

    test('should highlight WREI differentiation from Kinexys', () => {
      const differentiation = marketIntelligence.getKinexysVsWREIDifferentiation();

      expect(differentiation).toHaveProperty('kinexysApproach');
      expect(differentiation.kinexysApproach).toContain('marketplace');
      expect(differentiation).toHaveProperty('wreiApproach');
      expect(differentiation.wreiApproach).toContain('verification');
      expect(differentiation.wreiApproach).toContain('yield generation');
      expect(differentiation).toHaveProperty('keyDifferentiators');
      expect(Array.isArray(differentiation.keyDifferentiators)).toBe(true);
      expect(differentiation.keyDifferentiators.length).toBeGreaterThan(3);
    });

    test('should provide institutional investor value proposition vs Kinexys', () => {
      const valueProposition = marketIntelligence.getInstitutionalValueVsKinexys();

      expect(valueProposition).toHaveProperty('kinexysValue');
      expect(valueProposition).toHaveProperty('wreiValue');
      expect(valueProposition.wreiValue).toHaveProperty('yieldGeneration');
      expect(valueProposition.wreiValue).toHaveProperty('assetBackedTokens');
      expect(valueProposition.wreiValue).toHaveProperty('infrastructureExposure');
      expect(valueProposition.wreiValue).toHaveProperty('verificationIntegrity');
    });

  });

  describe('5. Market Intelligence Integration Points', () => {

    test('should integrate with existing negotiation context', () => {
      const negotiationContext = marketIntelligence.generateNegotiationMarketContext({
        tokenType: 'asset_co',
        investorType: 'infrastructure_fund',
        ticketSize: 50_000_000
      });

      expect(negotiationContext).toHaveProperty('marketPosition');
      expect(negotiationContext).toHaveProperty('competitiveAdvantages');
      expect(negotiationContext).toHaveProperty('investorRelevantComparisons');
      expect(negotiationContext.investorRelevantComparisons).toContain('infrastructure REIT');
    });

    test('should provide persona-specific market intelligence', () => {
      const esgContext = marketIntelligence.getPersonaSpecificMarketIntelligence('esg_impact');

      expect(esgContext).toHaveProperty('carbonMarketGrowth');
      expect(esgContext).toHaveProperty('esgInvestmentTrends');
      expect(esgContext).toHaveProperty('sustainabilityMetrics');

      const infrastructureContext = marketIntelligence.getPersonaSpecificMarketIntelligence('infrastructure_fund');
      expect(infrastructureContext).toHaveProperty('infrastructureMarketBenchmarks');
      expect(infrastructureContext).toHaveProperty('yieldComparisons');
    });

    test('should enable market-aware risk assessment', () => {
      const marketRiskFactors = marketIntelligence.getMarketRiskFactors();

      expect(marketRiskFactors).toHaveProperty('rwaMarketRisks');
      expect(marketRiskFactors).toHaveProperty('carbonMarketRisks');
      expect(marketRiskFactors).toHaveProperty('competitiveRisks');
      expect(marketRiskFactors).toHaveProperty('regulatoryRisks');

      expect(Array.isArray(marketRiskFactors.rwaMarketRisks)).toBe(true);
      expect(marketRiskFactors.rwaMarketRisks.length).toBeGreaterThan(2);
    });

  });

  describe('6. Market Intelligence Data Quality', () => {

    test('should maintain data consistency across market intelligence modules', () => {
      const rwaValue = marketIntelligence.getTokenizedRWAMarketContext().totalMarketValue;
      const carbonValue = marketIntelligence.getCarbonMarketProjections().projected2030Value;

      expect(rwaValue).toBe(19_000_000_000); // Consistent A$19B
      expect(carbonValue).toBe(155_000_000_000); // Consistent A$155B

      // Ensure cross-references are consistent
      const competitiveContext = marketIntelligence.generateCompetitiveContext();
      expect(competitiveContext.marketSizes.rwa).toBe(rwaValue);
      expect(competitiveContext.marketSizes.carbon2030).toBe(carbonValue);
    });

    test('should provide market intelligence freshness indicators', () => {
      const dataFreshness = marketIntelligence.getDataFreshness();

      expect(dataFreshness).toHaveProperty('lastUpdated');
      expect(dataFreshness).toHaveProperty('dataSourcesCount');
      expect(dataFreshness.dataSourcesCount).toBeGreaterThan(5);
      expect(dataFreshness).toHaveProperty('confidenceLevel');
      expect(dataFreshness.confidenceLevel).toBeGreaterThan(0.85); // >85% confidence
    });

  });

});