/**
 * Token context builders for negotiation system prompts.
 * Generates credit type and WREI token context strings for the
 * AI negotiation agent's system prompt.
 */

import { NegotiationState } from '@/lib/types';
import { getMarketAccessContext, getRedemptionWindowContext, getCrossCollateralizationContext } from './investor-pathways';
import { getMarketIntelligenceContext } from './market-intelligence-context';

export function getCreditTypeContext(creditType: string, anchorPrice: number): string {
  switch (creditType) {
    case 'carbon':
      return `
CREDIT TYPE: You are negotiating WREI-verified CARBON CREDITS
- Current anchor price: USD $${anchorPrice}/tonne
- Currency: USD
- Unit: tonnes CO2 equivalent (tCO2e)
- Market: Voluntary Carbon Market (VCM)
- Compliance: Triple-standard (ISO 14064-2, Verra VCS, Gold Standard)
- Always specify "carbon credits" and "USD" and "per tonne" in your responses`;

    case 'esc':
      return `
CREDIT TYPE: You are negotiating NSW ENERGY SAVINGS CERTIFICATES (ESCs)
- Current anchor price: AUD $${anchorPrice}/ESC
- Currency: AUD (Australian Dollars)
- Unit: Energy Savings Certificates (ESCs)
- Market: NSW Energy Savings Scheme (ESS)
- Compliance: NSW ESS scheme requirements, IPART-approved methodology
- Always specify "Energy Savings Certificates" or "ESCs" and "AUD" and "per ESC" in your responses`;

    case 'both':
      return `
CREDIT TYPE: You are negotiating BOTH carbon credits AND ESCs
- Ask the buyer which credit type they prefer to focus on first
- Carbon: USD $28.12/tonne, ESCs: AUD $${anchorPrice}/ESC
- Clearly specify currency and unit for each type in your responses`;

    default:
      return '';
  }
}

export function getWREITokenContext(state: NegotiationState): string {
  const { wreiTokenType, tokenSpecificData, marketType = 'primary', investorClassification = 'wholesale' } = state;

  // Generate market access and investor pathway context
  const marketAccessContext = getMarketAccessContext(marketType, investorClassification, state.buyerProfile.persona);
  const redemptionContext = getRedemptionWindowContext(wreiTokenType || 'carbon_credits', investorClassification);
  const crossCollateralContext = getCrossCollateralizationContext(wreiTokenType || 'carbon_credits', investorClassification);

  // Generate advanced market intelligence context (Phase 5.1)
  const marketIntelligenceContext = getMarketIntelligenceContext(state);

  switch (wreiTokenType) {
    case 'carbon_credits':
      return `
🌱 WREI CARBON CREDIT TOKENS - Institutional Investment Grade

${marketAccessContext}

TOKEN STRUCTURE:
- **Anchor Price**: A$150/tonne (1.5× A$100 base carbon price)
- **Supply Base Case**: 3.12 million tradeable tonnes (2027-2040)
- **Supply Expansion**: 13.1 million tonnes (with Hyke routes from 2028)
- **Revenue Projection**: A$468M base case, A$1.97B expansion case
- **Steady State Revenue**: A$33.4M annually (base), A$141M (expansion)

EMISSION GENERATION SOURCES (Real-time Measurement):
1. **Vessel Efficiency** (47.2% of credits):
   - Electric hydrofoils: 0.12 kWh/passenger-km
   - Diesel baseline: 3.31 kWh/passenger-km (Parramatta Class ferries)
   - 96% efficiency improvement drives 2.83M tonnes of verified savings

2. **Construction Avoidance** (4.8% of credits):
   - Avoided embodied emissions from road/rail infrastructure not built
   - 30-year asset amortization methodology
   - 290,000 tonnes cumulative avoided emissions

3. **Modal Shift** (47.9% - Community Benefit):
   - 40% passenger modal shift from private vehicles
   - Baseline: 171 gCO2/km (Australian National Greenhouse Accounts)
   - 2.87M tonnes community benefit (NOT tradeable by Water Roads)

VERIFICATION & TOKENIZATION:
- **Native Digital Generation**: Credits generated from real-time vessel telemetry, NOT bridged from traditional registries
- **Blockchain Provenance**: Every token links to specific vessel trip with immutable operational data
- **Triple Standard**: Simultaneous ISO 14064-2, Verra VCS, and Gold Standard compliance
- **Settlement**: T+0 atomic settlement via Zoniqx zConnect infrastructure

YIELD MECHANISMS & FINANCIAL RETURNS:
- **Model A - Revenue Share**: 8% annual yield through quarterly distributions (75% of gross revenue)
  * Expected IRR: 8-12% depending on carbon price appreciation
  * Tax Treatment: Dividend imputation, 30% company tax with franking credits
  * Ideal for: Income-focused investors, pension funds, conservative portfolios

- **Model B - NAV-Accruing**: 12% annual NAV appreciation with minimal distributions (25% distributed)
  * Expected IRR: 12-15% through token price appreciation
  * Tax Treatment: Capital gains (50% CGT discount after 12 months)
  * Ideal for: Growth investors, family offices, tax-optimized strategies

INVESTMENT SCENARIOS (A$100,000 investment):
- **Conservative (Revenue Share)**: A$8,000 annual income, 2.5-year payback, total return 15-20%
- **Growth (NAV-Accruing)**: A$12,000 annual appreciation, capital gains treatment, total return 20-25%
- **Risk Profile**: 25% volatility, 0.8 Sharpe ratio, low correlation to traditional markets

INSTITUTIONAL BENCHMARKS & MARKET CONTEXT:
${marketIntelligenceContext}

INVESTOR VALUE PROPOSITION:
- **Fractional Access**: A$1,000 minimum vs traditional 1,000+ tonne lots
- **Greenwashing Protection**: Real-time verification eliminates provenance gaps
- **Market Premium**: Digital MRV credits command 78% premiums; WREI's 50% is conservative
- **Tax Efficiency**: Choose revenue share (income) or NAV-accruing (CGT) based on your tax position
- **Liquidity**: Secondary market trading with DeFi protocol integration

${redemptionContext}

${crossCollateralContext}`;

    case 'asset_co':
      return `
🏗️ WREI ASSET CO TOKENS - Infrastructure Investment Grade

${marketAccessContext}

TOKEN STRUCTURE:
- **Token Equity**: A$131 million (A$473M total capex - A$342M debt)
- **Anchor Yield**: 28.3% equity yield at steady state (2031-2037)
- **Fleet Backing**: 88 Candela electric hydrofoils + 22 Deep Power BESS units
- **Cash-on-Cash Multiple**: 3.0× over lifetime (2027-2040)

LEASECO FINANCIAL MODEL:
- **Total Capex**: A$473M (vessel fleet + Deep Power infrastructure)
- **Debt Funding**: A$342M at 7% interest-only (institutional facility)
- **Down Payment**: A$47.3M (10% from Water Roads OpCo)
- **Debt Service Coverage**: Strong with 60.8% net margin

YIELD PROFILE (Steady State 2031-2037):
- **Annual Lease Income**: A$61.1M from Water Roads OpCo
- **Annual Interest Cost**: A$23.9M (7% on A$342M debt)
- **Net Cash Flow**: A$37.1M annually to token holders
- **Gross Lease Yield**: 12.9% on total capex
- **Infrastructure Margin**: 60.8% after debt service

INCOME MECHANISMS & FINANCIAL RETURNS:
- **Model A - Revenue Share**: 28.3% annual yield through quarterly distributions (85% of net cash flow)
  * Expected IRR: 28-30% with contractual lease income
  * Cash-on-Cash: 3.0x multiple over 14-year lifetime
  * Tax Treatment: Ordinary income (lease income), 30% company tax rate
  * Ideal for: Income-focused institutions, pension funds, infrastructure investors

- **Model B - NAV-Accruing**: 28.3% underlying yield with reinvestment for token appreciation
  * Expected IRR: 25-28% through asset value growth
  * Annual Distributions: 40% paid out, 60% reinvested
  * Tax Treatment: Capital gains (50% CGT discount after 12 months)
  * Ideal for: Growth-oriented family offices, sovereign wealth funds

INVESTMENT SCENARIOS (A$1,000,000 investment):
- **Revenue Share**: A$283,000 annual income, 3.5-year payback, A$3.0M total return
- **NAV-Accruing**: A$113,000 annual distribution + appreciation, tax-efficient CGT treatment
- **Risk Profile**: 12% volatility (infrastructure-like), 1.2 Sharpe ratio, very low market correlation

INFRASTRUCTURE COMPARISONS & MARKET CONTEXT:
${marketIntelligenceContext}

LIFETIME PROJECTIONS:
- **Total Lease Income**: A$671.7M (2027-2040)
- **Net Cash Generated**: A$395.4M after debt service
- **Ending Cash Position**: A$311.7M (covers 91% of debt principal)
- **Residual Distribution**: Fleet end-of-life value to token holders

INSTITUTIONAL COMPARATORS:
- **Risk Profile**: Similar to toll road/airport lease investments
- **Yield Premium**: 28.3% vs traditional infrastructure 8-12%
- **Liquidity Advantage**: Tokenized vs 7-10 year lock-ups in traditional funds
- **Transparency**: Real-time vessel telemetry and operational performance data

CROSS-COLLATERALIZATION:
- Use Asset Co tokens as yield-bearing collateral in DeFi protocols
- Borrow stablecoins against predictable infrastructure yield
- Deploy borrowed capital into WREI Carbon Credit tokens for additional exposure
- Replicate institutional Treasury-derivatives strategies with Water Roads assets

${redemptionContext}

${crossCollateralContext}`;

    case 'dual_portfolio':
      return `
🎯 WREI DUAL TOKEN PORTFOLIO - Diversified Investment Strategy

${marketAccessContext}

PORTFOLIO CONSTRUCTION:
- **Carbon Credits**: A$150/tonne, variable yield (carbon price dependent)
- **Asset Co Tokens**: 28.3% yield, predictable income (contractual leases)
- **Risk Balance**: Carbon upside potential + infrastructure yield stability
- **Correlation**: Low correlation provides natural portfolio diversification

STRATEGIC ALLOCATION APPROACHES:
1. **Income + Growth**: 70% Asset Co (steady yield) + 30% Carbon Credits (upside)
2. **ESG Focus**: 60% Carbon Credits (impact) + 40% Asset Co (infrastructure)
3. **Yield Optimization**: Asset Co as collateral, borrow to increase carbon exposure

BLENDED FINANCIAL RETURNS:
- **Hybrid Model**: 18.5% blended annual yield (40% carbon + 60% asset co)
- **Diversification Benefit**: +2% additional yield from cross-collateral strategies
- **Total Expected IRR**: 20-22% with reduced volatility (15% vs 25% for carbon alone)
- **Risk-Adjusted Returns**: 1.0 Sharpe ratio with superior diversification

INVESTMENT SCENARIOS (A$500,000 dual portfolio):
- **Standard Allocation**: A$200K carbon (8-12% yield) + A$300K asset co (28.3% yield)
- **Expected Annual Income**: A$101,000 blended (20.2% effective yield)
- **Cross-Collateral Strategy**: Use asset co yield as collateral to lever carbon exposure
- **Risk Profile**: Balanced 15% volatility with infrastructure yield stability

STRATEGIC ADVANTAGES:
- **Yield Floor**: Asset Co provides 28.3% base yield regardless of carbon prices
- **ESG Impact**: Carbon Credits deliver measurable emission reductions
- **Tax Optimization**: Mix income (asset co) and CGT (carbon) based on your structure
- **Liquidity Options**: Trade components separately or maintain combined position
- **Cross-Collateral**: Use predictable Asset Co yield to fund additional carbon exposure
- **Rebalancing**: Quarterly rebalancing maintains target allocation automatically

INSTITUTIONAL POSITIONING:
- **vs Single Assets**: Superior risk-adjusted returns through diversification
- **vs Traditional Portfolios**: Higher yields with embedded ESG impact
- **vs DeFi Strategies**: Similar yields with institutional-grade compliance and custody

${redemptionContext}

${crossCollateralContext}

TOKEN METADATA & TRANSPARENCY:
- **Immutable Provenance**: Every token links to specific vessel operations with cryptographic verification
- **Real-time Tracking**: Live vessel telemetry integration provides continuous performance monitoring
- **Environmental Verification**: Ongoing impact tracking with 92%+ confidence verification
- **Operational Data**: Complete vessel efficiency metrics, carbon generation rates, and modal shift benefits
- **Quality Assurance**: 98% metadata completeness with automated integrity verification
- **Transparency Standard**: Full operational audit trail from measurement to tokenization to distribution

Which token type would you like to focus on first, or shall we discuss a balanced portfolio approach optimized for your specific yield requirements and risk tolerance?`;

    default:
      return getCreditTypeContext(state.creditType, state.anchorPrice);
  }
}
