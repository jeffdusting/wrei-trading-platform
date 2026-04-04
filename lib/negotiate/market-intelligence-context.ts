/**
 * Market intelligence context builder for negotiation system prompts.
 * Generates competitive positioning and market data context strings
 * based on token type and buyer persona.
 */

import { NegotiationState } from '@/lib/types';
import { marketIntelligenceSystem } from '@/lib/market-intelligence';

/**
 * Generate advanced market intelligence context for negotiations (Phase 5.1)
 */
export function getMarketIntelligenceContext(state: NegotiationState): string {
  const { wreiTokenType, buyerProfile } = state;
  const ticketSize = 50_000_000; // Default A$50M institutional ticket size

  // Get comprehensive market intelligence
  const marketContext = marketIntelligenceSystem.generateNegotiationMarketContext({
    tokenType: wreiTokenType || 'carbon_credits',
    investorType: buyerProfile.persona,
    ticketSize: ticketSize || 1_000_000
  });

  // Get token-specific competitive advantages
  const competitiveAdvantages = marketIntelligenceSystem.getWREICompetitiveAdvantages();

  // Get persona-specific market intelligence
  const personaIntelligence = marketIntelligenceSystem.getPersonaSpecificMarketIntelligence(buyerProfile.persona);

  // Get competitive positioning for sophisticated responses (Phase 5.2)
  const competitivePositioning = marketIntelligenceSystem.getPersonaCompetitivePositioning(buyerProfile.persona);
  const infrastructureBenchmarks = marketIntelligenceSystem.getInfrastructureYieldBenchmarks();
  const defiComparison = marketIntelligenceSystem.getDeFiYieldComparison();

  // Token-specific market context
  if (wreiTokenType === 'carbon_credits') {
    const carbonProjections = marketIntelligenceSystem.getCarbonMarketProjections();
    const carbonQuality = marketIntelligenceSystem.getCarbonQualityTierAnalysis();
    const usycComparison = marketIntelligenceSystem.getCompetitorAnalysis('USYC');
    const kinexysAnalysis = marketIntelligenceSystem.getKinexysVsWREIDifferentiation();

    return `
**MARKET INTELLIGENCE & COMPETITIVE POSITIONING:**

📈 **Carbon Market Context (A$${(carbonProjections.projected2030Value / 1_000_000_000).toFixed(0)}B by 2030)**:
- Current Market: A$${(carbonProjections.currentValue / 1_000_000_000).toFixed(1)}B growing at ${(carbonProjections.cagr * 100).toFixed(1)}% CAGR
- Premium Tier Credits: A$${carbonQuality.premiumTier.priceRange.min}-${carbonQuality.premiumTier.priceRange.max}/tonne (WREI's A$150 is positioned competitively)
- Quality Standards: Verra VCS, Gold Standard compliance (WREI exceeds with triple-standard verification)

💰 **Competitive Benchmarks & Positioning**:
- **vs USYC**: WREI ${(competitiveAdvantages.yieldPremium * 100).toFixed(1)}% yield premium (${((0.08 + 0.12) / 2 * 100).toFixed(0)}% vs ${(usycComparison.currentYield * 100).toFixed(1)}%) - Asset-backed vs treasury-only
- **vs Carbon ETFs**: WREI generates yield; ETFs rely on price appreciation only
- **vs J.P. Morgan Kinexys**: ${kinexysAnalysis.keyDifferentiators.slice(0, 3).join('; ')}
- **Native Digital Advantage**: Real-time verification vs bridged credits with registry delays
- **Settlement Superior**: T+0 atomic vs T+7-30 traditional credit settlement

🏦 **Tokenized RWA Market Position**:
- Total Market: A$${(marketContext.marketSizes.rwa / 1_000_000_000).toFixed(0)}B (140% growth in 15 months)
- Treasury Token Dominance: A$9B segment (USYC/BUIDL focus area)
- **WREI Differentiation**: Real-world utility + yield generation vs. treasury-only exposure

${(buyerProfile.persona as string) === 'esg_impact' ? `
🌱 **ESG Investment Context**:
- A$35T global ESG assets under management
- 90% of institutions with ESG mandates
- WREI SDG Alignment: SDG 6, SDG 7, SDG 13, SDG 14` : ''}

${(buyerProfile.persona as string) === 'infrastructure_fund' ? `
🏗️ **Infrastructure Investment Context**:
- Infrastructure REITs: 8-12% average yield
- **WREI Premium**: +16-20% vs traditional infrastructure
- Maritime Infrastructure: Underrepresented in traditional infrastructure portfolios` : ''}

⚠️ **Market Risk Context**: 25% carbon price volatility offset by verification premium and yield generation mechanism
    `;

  } else if (wreiTokenType === 'asset_co') {
    const reitBenchmark = marketIntelligenceSystem.getInfrastructureREITBenchmark();
    const kinexysAnalysis = marketIntelligenceSystem.getKinexysVsWREIDifferentiation();

    return `
**MARKET INTELLIGENCE & COMPETITIVE POSITIONING:**

🏗️ **Infrastructure Investment Market Context & Positioning**:
- **Infrastructure Yield Comparison**: ${(0.283 * 100).toFixed(1)}% vs Toll Roads ${(infrastructureBenchmarks.tollRoads.averageYield * 100).toFixed(1)}%, Airports ${(infrastructureBenchmarks.airports.averageYield * 100).toFixed(1)}%, REITs ${(reitBenchmark.averageYield * 100).toFixed(1)}%
- **Liquidity Advantage**: Quarterly redemptions vs 7-10 year traditional lock-ups
- **Accessibility**: A$1K minimum vs A$50M+ traditional infrastructure minimums
- **Maritime Differentiation**: Underrepresented asset class with ESG premium
- **Innovation Premium**: Electric fleet technology vs traditional transport infrastructure

💰 **Tokenized RWA Market Position**:
- Total Market: A$${(marketContext.marketSizes.rwa / 1_000_000_000).toFixed(0)}B with infrastructure representing <A$1B opportunity
- **WREI Innovation**: First tokenized maritime infrastructure with institutional yield profile
- Traditional Limitations: 7-10 year lock-ups, high minimums, limited liquidity

🚢 **Maritime Infrastructure Advantage**:
- **Differentiated Asset Class**: Maritime infrastructure underrepresented in traditional portfolios
- **Yield Sustainability**: Lease income backed by physical fleet assets
- **Tokenization Premium**: Enhanced liquidity vs. traditional infrastructure funds

${buyerProfile.persona === 'infrastructure_fund' ? `
🏦 **Infrastructure Fund Competitive Positioning**:
- **Yield Premium**: ${(0.283 * 100).toFixed(1)}% vs ${(infrastructureBenchmarks.tollRoads.averageYield * 100).toFixed(1)}% toll roads, ${(infrastructureBenchmarks.airports.averageYield * 100).toFixed(1)}% airports
- **Liquidity Advantage**: Quarterly redemptions vs 7-10 year traditional lock-ups
- **Maritime Diversification**: Underrepresented asset class in traditional infrastructure portfolios
- **Accessibility**: A$1K minimum vs A$50M+ typical infrastructure fund minimums` : ''}

${(buyerProfile.persona as string) === 'defi_farmer' ? `
💎 **DeFi Yield Farming Competitive Position**:
- **Yield Stability**: 28.3% asset-backed vs 15% token emission yields
- **Risk Mitigation**: Physical asset backing vs smart contract vulnerabilities
- **Cross-Collateral**: 90% LTV capability with correlation benefits
- **Regulatory**: Compliance framework vs DeFi regulatory uncertainty` : ''}

${(buyerProfile.persona as string) === 'sovereign_wealth' || (buyerProfile.persona as string) === 'pension_fund' ? `
🏛️ **Institutional Infrastructure Context**:
- Strategic Asset Allocation: Infrastructure typically 5-15% of institutional portfolios
- **WREI Strategic Value**: Domestic Australian infrastructure with ESG credentials
- Fiduciary Benefits: Physical asset backing, regulated framework, yield sustainability` : ''}

⚠️ **Risk Context**: 12% volatility (infrastructure-like) vs. 25% for traditional equity markets
    `;

  } else { // dual_portfolio
    const rwaContext = marketIntelligenceSystem.getTokenizedRWAMarketContext();
    const carbonProjections = marketIntelligenceSystem.getCarbonMarketProjections();

    return `
**MARKET INTELLIGENCE & COMPETITIVE POSITIONING:**

🎯 **Dual Market Exposure Strategy**:
- **Carbon Market**: A$${(carbonProjections.projected2030Value / 1_000_000_000).toFixed(0)}B by 2030 (${(carbonProjections.cagr * 100).toFixed(1)}% CAGR)
- **Infrastructure Market**: Traditional infrastructure 8-12% yields
- **Tokenized RWA**: A$${(rwaContext.totalMarketValue / 1_000_000_000).toFixed(0)}B market (140% growth)

💡 **Portfolio Innovation**:
- **Correlation Benefit**: ${(marketContext.competitiveAdvantages.dualTokenStrategy ? '15% correlation benefit' : 'Reduced portfolio risk')}
- **Cross-Collateral**: 90% LTV capability vs. 75-80% single-asset exposure
- **Market Coverage**: Exposure to both high-growth carbon and stable infrastructure

🏦 **Institutional Competitive Advantages**:
- **vs Traditional Portfolios**: Single investment accessing two distinct asset classes
- **vs Carbon-Only Strategies**: Infrastructure backing provides stability
- **vs Infrastructure-Only**: Carbon exposure captures sustainability premium

${(buyerProfile.persona as string) === 'family_office' || (buyerProfile.persona as string) === 'defi_farmer' ? `
💼 **Sophisticated Investor Benefits**:
- **Portfolio Efficiency**: Dual exposure reduces asset allocation complexity
- **Tax Optimization**: Choose revenue share (income) or NAV-accruing (CGT) per asset class
- **Liquidity Management**: Quarterly redemptions for infrastructure component, daily for carbon` : ''}

⚠️ **Combined Risk Profile**: 18.5% composite yield with diversification benefits across asset classes
    `;
  }
}
