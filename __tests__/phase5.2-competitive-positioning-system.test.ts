/**
 * Phase 5.2: Competitive Positioning System Tests
 *
 * Test-Driven Development for enhanced competitive positioning functionality.
 * Tests written BEFORE implementation following development process framework.
 */

import { MarketIntelligenceSystem } from '@/lib/market-intelligence';

describe('Phase 5.2: Competitive Positioning System', () => {

  let marketIntelligence: MarketIntelligenceSystem;

  beforeEach(() => {
    marketIntelligence = new MarketIntelligenceSystem();
  });

  describe('1. Native Digital vs Bridged Carbon Credits Positioning', () => {

    test('should highlight native digital credit advantages', () => {
      const nativeVsBridged = marketIntelligence.getNativeVsBridgedAnalysis();

      expect(nativeVsBridged).toHaveProperty('nativeAdvantages');
      expect(nativeVsBridged.nativeAdvantages).toContain('Real-time verification');
      expect(nativeVsBridged.nativeAdvantages).toContain('Immutable provenance');
      expect(nativeVsBridged.nativeAdvantages).toContain('No bridging risk');
      expect(nativeVsBridged.nativeAdvantages).toContain('Triple-standard verification');

      expect(nativeVsBridged).toHaveProperty('bridgedLimitations');
      expect(nativeVsBridged.bridgedLimitations).toContain('Registry dependencies');
      expect(nativeVsBridged.bridgedLimitations).toContain('Verification delays');
      expect(nativeVsBridged.bridgedLimitations).toContain('Quality uncertainties');
    });

    test('should provide verification quality comparisons', () => {
      const verificationComparison = marketIntelligence.getVerificationQualityComparison();

      expect(verificationComparison).toHaveProperty('wreiVerification');
      expect(verificationComparison.wreiVerification).toHaveProperty('standards');
      expect(verificationComparison.wreiVerification.standards).toContain('ISO 14064-2');
      expect(verificationComparison.wreiVerification.standards).toContain('Verra VCS');
      expect(verificationComparison.wreiVerification.standards).toContain('Gold Standard');

      expect(verificationComparison).toHaveProperty('bridgedCredits');
      expect(verificationComparison.bridgedCredits).toHaveProperty('verificationGaps');
      expect(verificationComparison.bridgedCredits.verificationGaps).toContain('Registry inconsistencies');

      expect(verificationComparison).toHaveProperty('qualityPremium');
      expect(verificationComparison.qualityPremium).toBeGreaterThan(0.5); // >50% premium for native digital
    });

    test('should compare settlement and liquidity advantages', () => {
      const settlementAdvantages = marketIntelligence.getSettlementAdvantages();

      expect(settlementAdvantages).toHaveProperty('wreiSettlement');
      expect(settlementAdvantages.wreiSettlement).toHaveProperty('settlementTime', 'T+0');
      expect(settlementAdvantages.wreiSettlement).toHaveProperty('atomic', true);
      expect(settlementAdvantages.wreiSettlement).toHaveProperty('crossChain', true);

      expect(settlementAdvantages).toHaveProperty('traditionalCredits');
      expect(settlementAdvantages.traditionalCredits).toHaveProperty('settlementTime', 'T+7 to T+30');
      expect(settlementAdvantages.traditionalCredits).toHaveProperty('atomic', false);

      expect(settlementAdvantages).toHaveProperty('liquidityPremium');
      expect(settlementAdvantages.liquidityPremium).toBeGreaterThan(0.1); // >10% liquidity premium
    });

  });

  describe('2. Infrastructure Yield Comparisons', () => {

    test('should provide comprehensive infrastructure yield benchmarks', () => {
      const infrastructureBenchmarks = marketIntelligence.getInfrastructureYieldBenchmarks();

      expect(infrastructureBenchmarks).toHaveProperty('tollRoads');
      expect(infrastructureBenchmarks.tollRoads).toHaveProperty('averageYield');
      expect(infrastructureBenchmarks.tollRoads.averageYield).toBeGreaterThan(0.08); // >8%
      expect(infrastructureBenchmarks.tollRoads.averageYield).toBeLessThan(0.12); // <12%

      expect(infrastructureBenchmarks).toHaveProperty('airports');
      expect(infrastructureBenchmarks.airports).toHaveProperty('averageYield');
      expect(infrastructureBenchmarks.airports.averageYield).toBeGreaterThan(0.07); // >7%

      expect(infrastructureBenchmarks).toHaveProperty('utilities');
      expect(infrastructureBenchmarks.utilities).toHaveProperty('averageYield');
      expect(infrastructureBenchmarks.utilities.averageYield).toBeGreaterThan(0.04); // >4%

      expect(infrastructureBenchmarks).toHaveProperty('maritime');
      expect(infrastructureBenchmarks.maritime).toHaveProperty('wreiYield', 0.283); // 28.3%
    });

    test('should calculate WREI premium over infrastructure categories', () => {
      const yieldPremiums = marketIntelligence.getInfrastructureYieldPremiums();

      expect(yieldPremiums).toHaveProperty('vsTollRoads');
      expect(yieldPremiums.vsTollRoads).toBeGreaterThan(0.15); // >15% premium
      expect(yieldPremiums).toHaveProperty('vsAirports');
      expect(yieldPremiums.vsAirports).toBeGreaterThan(0.18); // >18% premium
      expect(yieldPremiums).toHaveProperty('vsUtilities');
      expect(yieldPremiums.vsUtilities).toBeGreaterThan(0.23); // >23% premium
      expect(yieldPremiums).toHaveProperty('vsREITs');
      expect(yieldPremiums.vsREITs).toBeGreaterThan(0.16); // >16% premium

      expect(yieldPremiums).toHaveProperty('averagePremium');
      expect(yieldPremiums.averagePremium).toBeGreaterThan(0.18); // >18% average premium
    });

    test('should highlight infrastructure diversification benefits', () => {
      const diversificationBenefits = marketIntelligence.getInfrastructureDiversificationBenefits();

      expect(diversificationBenefits).toHaveProperty('maritimeDifferentiation');
      expect(diversificationBenefits.maritimeDifferentiation).toContain('Underrepresented asset class in traditional portfolios');
      expect(diversificationBenefits.maritimeDifferentiation).toContain('Low correlation with road/rail infrastructure');

      expect(diversificationBenefits).toHaveProperty('portfolioBenefits');
      expect(diversificationBenefits.portfolioBenefits).toContain('Geographic diversification (Sydney Harbour focus)');
      expect(diversificationBenefits.portfolioBenefits).toContain('ESG integration with carbon credit generation');

      expect(diversificationBenefits).toHaveProperty('riskAdjustedReturns');
      expect(diversificationBenefits.riskAdjustedReturns).toHaveProperty('sharpeRatio');
      expect(diversificationBenefits.riskAdjustedReturns.sharpeRatio).toBeGreaterThan(1.0);
    });

  });

  describe('3. DeFi Yield Farming Advantages', () => {

    test('should compare WREI yields vs DeFi protocols', () => {
      const defiComparison = marketIntelligence.getDeFiYieldComparison();

      expect(defiComparison).toHaveProperty('stakingRewards');
      expect(defiComparison.stakingRewards).toHaveProperty('averageYield');
      expect(defiComparison.stakingRewards.averageYield).toBeLessThan(0.15); // <15%

      expect(defiComparison).toHaveProperty('liquidityMining');
      expect(defiComparison.liquidityMining).toHaveProperty('averageYield');
      expect(defiComparison.liquidityMining.averageYield).toBeLessThan(0.20); // <20%

      expect(defiComparison).toHaveProperty('lendingProtocols');
      expect(defiComparison.lendingProtocols).toHaveProperty('averageYield');
      expect(defiComparison.lendingProtocols.averageYield).toBeLessThan(0.08); // <8%

      expect(defiComparison).toHaveProperty('wreiAdvantages');
      expect(defiComparison.wreiAdvantages).toContain('Asset-backed yield (vs. token emissions)');
      expect(defiComparison.wreiAdvantages).toContain('Lower smart contract risk (institutional grade)');
      expect(defiComparison.wreiAdvantages).toContain('Regulatory compliance framework');
    });

    test('should highlight cross-collateral strategies', () => {
      const crossCollateralStrategies = marketIntelligence.getCrossCollateralStrategies();

      expect(crossCollateralStrategies).toHaveProperty('assetCoLTV');
      expect(crossCollateralStrategies.assetCoLTV).toBe(0.80); // 80% LTV
      expect(crossCollateralStrategies).toHaveProperty('carbonCreditsLTV');
      expect(crossCollateralStrategies.carbonCreditsLTV).toBe(0.75); // 75% LTV
      expect(crossCollateralStrategies).toHaveProperty('dualPortfolioLTV');
      expect(crossCollateralStrategies.dualPortfolioLTV).toBe(0.90); // 90% LTV

      expect(crossCollateralStrategies).toHaveProperty('strategies');
      expect(crossCollateralStrategies.strategies).toContain('Leveraged yield farming');
      expect(crossCollateralStrategies.strategies).toContain('Portfolio margin lending');
      expect(crossCollateralStrategies.strategies).toContain('Automated rebalancing');

      expect(crossCollateralStrategies).toHaveProperty('riskAdjustedYield');
      expect(crossCollateralStrategies.riskAdjustedYield).toBeGreaterThan(0.20); // >20%
    });

    test('should compare DeFi risks vs WREI risk profile', () => {
      const riskComparison = marketIntelligence.getDeFiRiskComparison();

      expect(riskComparison).toHaveProperty('defiRisks');
      expect(riskComparison.defiRisks).toContain('Smart contract vulnerabilities');
      expect(riskComparison.defiRisks).toContain('Impermanent loss');
      expect(riskComparison.defiRisks).toContain('Protocol governance risks');
      expect(riskComparison.defiRisks).toContain('Token emission dilution');

      expect(riskComparison).toHaveProperty('wreiRiskMitigation');
      expect(riskComparison.wreiRiskMitigation).toContain('Physical asset backing');
      expect(riskComparison.wreiRiskMitigation).toContain('Regulated framework');
      expect(riskComparison.wreiRiskMitigation).toContain('Predictable lease income');

      expect(riskComparison).toHaveProperty('volatilityComparison');
      expect(riskComparison.volatilityComparison.defi).toBeGreaterThan(0.40); // >40% volatility
      expect(riskComparison.volatilityComparison.wrei).toBeLessThan(0.15); // <15% volatility
    });

  });

  describe('4. Liquidity Premium Analysis', () => {

    test('should quantify tokenization liquidity premium', () => {
      const liquidityPremium = marketIntelligence.getLiquidityPremiumAnalysis();

      expect(liquidityPremium).toHaveProperty('traditionalInfrastructure');
      expect(liquidityPremium.traditionalInfrastructure).toHaveProperty('lockUpPeriods');
      expect(liquidityPremium.traditionalInfrastructure.lockUpPeriods).toContain('7-10 years');
      expect(liquidityPremium.traditionalInfrastructure).toHaveProperty('minimumInvestment');
      expect(liquidityPremium.traditionalInfrastructure.minimumInvestment).toBeGreaterThan(10_000_000); // >A$10M

      expect(liquidityPremium).toHaveProperty('wreiLiquidity');
      expect(liquidityPremium.wreiLiquidity).toHaveProperty('redemptionWindows', 'Quarterly');
      expect(liquidityPremium.wreiLiquidity).toHaveProperty('minimumInvestment');
      expect(liquidityPremium.wreiLiquidity.minimumInvestment).toBeLessThan(100_000); // <A$100K

      expect(liquidityPremium).toHaveProperty('premiumValue');
      expect(liquidityPremium.premiumValue).toBeGreaterThan(0.02); // >2% liquidity premium
    });

    test('should compare secondary market accessibility', () => {
      const secondaryMarketComparison = marketIntelligence.getSecondaryMarketComparison();

      expect(secondaryMarketComparison).toHaveProperty('traditionalInfrastructure');
      expect(secondaryMarketComparison.traditionalInfrastructure).toHaveProperty('secondaryMarket', false);
      expect(secondaryMarketComparison.traditionalInfrastructure).toHaveProperty('liquidityConstraints');
      expect(secondaryMarketComparison.traditionalInfrastructure.liquidityConstraints).toContain('No secondary trading');

      expect(secondaryMarketComparison).toHaveProperty('wreiTokens');
      expect(secondaryMarketComparison.wreiTokens).toHaveProperty('secondaryMarket', true);
      expect(secondaryMarketComparison.wreiTokens).toHaveProperty('tradingHours', '24/7');
      expect(secondaryMarketComparison.wreiTokens).toHaveProperty('settlementTime', 'T+0');

      expect(secondaryMarketComparison).toHaveProperty('liquidityAdvantage');
      expect(secondaryMarketComparison.liquidityAdvantage).toContain('Continuous trading');
      expect(secondaryMarketComparison.liquidityAdvantage).toContain('Instant settlement');
    });

    test('should analyze fractional ownership benefits', () => {
      const fractionalOwnership = marketIntelligence.getFractionalOwnershipBenefits();

      expect(fractionalOwnership).toHaveProperty('accessibilityImprovements');
      expect(fractionalOwnership.accessibilityImprovements).toHaveProperty('minimumInvestment');
      expect(fractionalOwnership.accessibilityImprovements.minimumInvestment).toBeLessThanOrEqual(1_000); // <=A$1K

      expect(fractionalOwnership).toHaveProperty('portfolioDiversification');
      expect(fractionalOwnership.portfolioDiversification).toContain('Granular allocation (1% vs 100% positions)');
      expect(fractionalOwnership.portfolioDiversification).toContain('Risk distribution across multiple assets');

      expect(fractionalOwnership).toHaveProperty('democratizationBenefits');
      expect(fractionalOwnership.democratizationBenefits).toContain('Institutional-grade access for retail');
      expect(fractionalOwnership.democratizationBenefits).toContain('Reduced barriers to entry');
    });

  });

  describe('5. Competitive Positioning Integration', () => {

    test('should generate persona-specific competitive arguments', () => {
      const infrastructureFundPositioning = marketIntelligence.getPersonaCompetitivePositioning('infrastructure_fund');

      expect(infrastructureFundPositioning).toHaveProperty('primaryArguments');
      expect(infrastructureFundPositioning.primaryArguments).toContain('28.3% yield vs 8-12% traditional infrastructure');
      expect(infrastructureFundPositioning.primaryArguments).toContain('Maritime infrastructure diversification');
      expect(infrastructureFundPositioning.primaryArguments).toContain('Tokenized liquidity advantage');

      expect(infrastructureFundPositioning).toHaveProperty('competitorWeaknesses');
      expect(infrastructureFundPositioning.competitorWeaknesses).toContain('Traditional lock-up periods (7-10 years)');
      expect(infrastructureFundPositioning.competitorWeaknesses).toContain('High minimum investments (A$50M+)');

      const defiPersonaPositioning = marketIntelligence.getPersonaCompetitivePositioning('defi_farmer');
      expect(defiPersonaPositioning.primaryArguments).toContain('Asset-backed yield stability vs token emissions');
      expect(defiPersonaPositioning.primaryArguments).toContain('Cross-collateral strategies (90% LTV)');
    });

    test('should integrate competitive positioning with negotiation context', () => {
      const negotiationPositioning = marketIntelligence.generateCompetitiveNegotiationContext({
        tokenType: 'asset_co',
        competitorMention: 'infrastructure REITs',
        investorConcern: 'yield sustainability'
      });

      expect(negotiationPositioning).toHaveProperty('directComparison');
      expect(negotiationPositioning.directComparison).toContain('28.3% vs');
      expect(negotiationPositioning.directComparison).toContain('infrastructure REITs');

      expect(negotiationPositioning).toHaveProperty('yieldSustainability');
      expect(negotiationPositioning.yieldSustainability).toContain('Physical fleet backing provides residual value');
      expect(negotiationPositioning.yieldSustainability).toContain('Predictable lease income from government partnership');

      expect(negotiationPositioning).toHaveProperty('competitiveAdvantages');
      expect(Array.isArray(negotiationPositioning.competitiveAdvantages)).toBe(true);
      expect(negotiationPositioning.competitiveAdvantages.length).toBeGreaterThan(2);
    });

    test('should provide dynamic competitive responses', () => {
      const competitiveResponse = marketIntelligence.generateCompetitiveResponse({
        competitorType: 'USYC',
        buyerObjection: 'Why not stick with proven treasury tokens?',
        tokenType: 'carbon_credits'
      });

      expect(competitiveResponse).toHaveProperty('directResponse');
      expect(competitiveResponse.directResponse).toContain('USYC');
      expect(competitiveResponse.directResponse).toContain('4.5%');
      expect(competitiveResponse.directResponse).toContain('8-12%');

      expect(competitiveResponse).toHaveProperty('valueProposition');
      expect(competitiveResponse.valueProposition).toContain('Real-world utility vs. treasury-only exposure');
      expect(competitiveResponse.valueProposition).toContain('ESG impact with carbon credit generation');

      expect(competitiveResponse).toHaveProperty('riskMitigation');
      expect(competitiveResponse.riskMitigation).toContain('Treasury tokens offer stability but limited growth');
      expect(competitiveResponse.riskMitigation).toContain('WREI provides diversification beyond treasury exposure');
    });

  });

  describe('6. Competitive Positioning Data Quality', () => {

    test('should maintain consistent competitive data across positioning modules', () => {
      const infrastructureYields = marketIntelligence.getInfrastructureYieldBenchmarks();
      const yieldPremiums = marketIntelligence.getInfrastructureYieldPremiums();
      const competitiveContext = marketIntelligence.generateCompetitiveNegotiationContext({
        tokenType: 'asset_co',
        competitorMention: 'infrastructure REITs',
        investorConcern: 'yield comparison'
      });

      // Ensure consistency across modules
      const reitYield = infrastructureYields.reits?.averageYield || 0.10;
      const expectedPremium = 0.283 - reitYield;
      expect(yieldPremiums.vsREITs).toBeCloseTo(expectedPremium, 2);

      // Ensure competitive context reflects current data
      expect(competitiveContext.directComparison).toContain('28.3%');
    });

    test('should provide positioning confidence metrics', () => {
      const positioningMetrics = marketIntelligence.getCompetitivePositioningMetrics();

      expect(positioningMetrics).toHaveProperty('dataConfidence');
      expect(positioningMetrics.dataConfidence).toBeGreaterThan(0.85); // >85% confidence

      expect(positioningMetrics).toHaveProperty('competitiveAdvantageCount');
      expect(positioningMetrics.competitiveAdvantageCount).toBeGreaterThan(5);

      expect(positioningMetrics).toHaveProperty('benchmarkCoverage');
      expect(positioningMetrics.benchmarkCoverage).toBeGreaterThan(0.90); // >90% benchmark coverage

      expect(positioningMetrics).toHaveProperty('lastUpdated');
      expect(typeof positioningMetrics.lastUpdated).toBe('string');
    });

  });

});