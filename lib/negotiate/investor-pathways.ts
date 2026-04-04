/**
 * Investor pathway context builders for negotiation system prompts.
 * Generates market access, redemption window, and cross-collateralization
 * context strings based on investor classification and token type.
 */

export function getMarketAccessContext(marketType: string, investorClassification: string, persona: string): string {
  const isPrimary = marketType === 'primary';
  const isWholesale = investorClassification === 'wholesale' || investorClassification === 'professional';
  const isSophisticated = investorClassification === 'sophisticated' || investorClassification === 'professional';

  if (isPrimary && isWholesale) {
    return `
**🎯 PRIMARY MARKET ACCESS - INSTITUTIONAL ALLOCATION**

MARKET POSITIONING:
- **Primary Market**: Direct allocation from Water Roads with institutional terms
- **Minimum Investment**: A$500K wholesale threshold, A$50M+ for institutional tiers
- **Early Access Pricing**: Primary market participants receive 3-5% institutional discount
- **Allocation Priority**: Institutional investors receive priority allocation in oversubscribed rounds
- **Lock-up Terms**: 12-24 month minimum holding period for primary allocations

WHOLESALE INVESTOR PATHWAY (AFSL s708 Exemption):
- **Accredited Status**: Wholesale investor exemption under AFSL regulations
- **Documentation**: Minimal disclosure requirements vs retail product disclosure
- **Investment Limits**: No statutory investment limits for wholesale participants
- **Due Diligence**: Enhanced institutional due diligence package available
- **Settlement**: Direct institutional custody arrangements via Zoniqx zIdentity`;

  } else if (!isPrimary) {
    return `
**🔄 SECONDARY MARKET ACCESS - LIQUIDITY TRADING**

MARKET POSITIONING:
- **Secondary Market**: Trading existing tokens via decentralized exchange infrastructure
- **Fractional Access**: Minimum A$1,000 investment with fractional token ownership
- **Immediate Settlement**: T+0 settlement via Zoniqx zConnect automated trading
- **Market Making**: Professional market makers provide liquidity with 1.5-2.5% spreads
- **Price Discovery**: Real-time pricing based on institutional trading activity

${isWholesale ? 'WHOLESALE SECONDARY ACCESS' : 'RETAIL SECONDARY ACCESS'}:
- **Trading Infrastructure**: ${isWholesale ? 'Direct API access for algorithmic trading' : 'Web interface with retail-friendly execution'}
- **Settlement Method**: ${isWholesale ? 'Institutional custody integration' : 'Self-custody wallet compatibility'}
- **Market Data**: ${isWholesale ? 'Level II order book access and trade history' : 'Real-time pricing with basic market data'}
- **Compliance**: ${isWholesale ? 'Wholesale investor documentation' : 'Full retail product disclosure compliance'}`;

  } else {
    return `
**👤 RETAIL MARKET ACCESS - CONSUMER PATHWAY**

MARKET POSITIONING:
- **Primary Retail**: Direct purchase from Water Roads with retail protections
- **Consumer Protection**: Full AFSL retail client protections and disclosure requirements
- **Minimum Investment**: A$1,000 minimum with educational support materials
- **Simplified Access**: Streamlined onboarding with guided investment process
- **Customer Support**: Dedicated retail customer service and educational resources`;
  }
}

export function getRedemptionWindowContext(wreiTokenType: string, investorClassification: string): string {
  const isSophisticated = investorClassification === 'sophisticated' || investorClassification === 'professional';

  switch (wreiTokenType) {
    case 'carbon_credits':
      return `
**⏰ CARBON CREDIT TOKEN REDEMPTION & TRADING WINDOWS**

IMMEDIATE LIQUIDITY:
- **Trading Available**: 24/7 secondary market trading via decentralized exchange
- **Settlement**: T+0 atomic settlement with instant token transfer
- **No Lock-up Period**: Carbon credits tradeable immediately upon purchase
- **Market Hours**: Continuous trading with global market maker support

RETIREMENT FLEXIBILITY:
- **Immediate Retirement**: Retire credits instantly for compliance or ESG reporting
- **Batch Retirement**: Schedule large volume retirements for quarterly reporting cycles
- **Forward Retirement**: Pre-schedule retirement dates for future compliance periods
- **Registry Integration**: Seamless retirement across multiple registry systems

${isSophisticated ? `
SOPHISTICATED TRADING FEATURES:
- **API Integration**: Programmatic trading and retirement via RESTful API
- **Automated Strategies**: Smart contract integration for automated ESG compliance
- **Cross-Market Arbitrage**: Trade across multiple carbon registries and exchanges
- **Hedge Mechanisms**: Use carbon credits as hedge against carbon tax exposure` : ''}`;

    case 'asset_co':
      return `
**⏰ ASSET CO TOKEN REDEMPTION WINDOWS**

QUARTERLY REDEMPTION CYCLES:
- **Redemption Frequency**: Quarterly windows (March, June, September, December)
- **Notice Period**: 90-day advance notice required for redemption requests
- **Processing Time**: 30-day processing period following redemption window close
- **Minimum Hold**: 12-month minimum holding period from initial purchase

REDEMPTION MECHANICS:
- **NAV Pricing**: Redemption at quarterly NAV less 2% liquidity discount
- **Liquidity Reserve**: 15% of token assets maintained in liquid reserves for redemptions
- **Pro-rata Distribution**: Large redemptions processed pro-rata if exceeding liquidity reserves
- **Infrastructure Protection**: Redemption limits protect underlying fleet operational integrity

${isSophisticated ? `
INSTITUTIONAL REDEMPTION FEATURES:
- **Large Block Processing**: Special procedures for redemptions exceeding A$10M
- **Forward Booking**: Reserve redemption capacity up to 2 quarters in advance
- **Partial Redemptions**: Redeem specific percentage of holdings while maintaining position
- **Tax-Efficient Timing**: Coordinate redemption timing with CGT and franking credit optimization` : ''}`;

    case 'dual_portfolio':
      return `
**⏰ DUAL PORTFOLIO REDEMPTION & REBALANCING**

FLEXIBLE REDEMPTION OPTIONS:
- **Asset-Specific**: Redeem carbon credits or asset co tokens independently
- **Portfolio Rebalancing**: Quarterly rebalancing between carbon and asset co allocations
- **Tactical Allocation**: Adjust allocation percentages based on market conditions
- **Cross-Asset Settlement**: Use asset co distributions to purchase additional carbon credits

REBALANCING MECHANICS:
- **Target Allocation**: Maintain 40% carbon credits, 60% asset co tokens (customizable)
- **Threshold Triggers**: Automatic rebalancing when allocation deviates >5% from target
- **Rebalancing Costs**: 0.1% fee for automated rebalancing, manual rebalancing free quarterly
- **Tax Efficiency**: Rebalancing structured to minimize CGT impact where possible

${isSophisticated ? `
ADVANCED PORTFOLIO FEATURES:
- **Dynamic Allocation**: Algorithm-based allocation adjustments based on carbon price volatility
- **Yield Optimization**: Automatic reinvestment of asset co distributions into carbon credit opportunities
- **Risk Budgeting**: Maintain portfolio volatility within specified risk parameters
- **Multi-Generational Planning**: Family office structures with succession planning integration` : ''}`;

    default:
      return '';
  }
}

export function getCrossCollateralizationContext(wreiTokenType: string, investorClassification: string): string {
  const isSophisticated = investorClassification === 'sophisticated' || investorClassification === 'professional';

  if (!isSophisticated) {
    return `
**🔗 TOKEN COLLATERAL BASICS**

SIMPLE COLLATERAL USE:
- **Personal Lending**: Use tokens as collateral for personal credit lines
- **Portfolio Margin**: Enhanced margin trading with tokenized asset backing
- **Wealth Planning**: Tokens accepted as collateral for private banking services
- **Insurance**: Tokens eligible for portfolio insurance and protection products`;
  }

  switch (wreiTokenType) {
    case 'carbon_credits':
      return `
**🔗 CARBON CREDIT CROSS-COLLATERALIZATION STRATEGIES**

DEFI INTEGRATION:
- **Base Collateral Value**: Carbon credits valued at 75% of current market price for lending
- **Volatility Haircut**: 15% haircut applied due to carbon price volatility (25% historical volatility)
- **Accepted Protocols**: Aave, Compound, and Zoniqx native lending protocols
- **Borrowing Currencies**: USDC, USDT, DAI, AUDT (stablecoins) + ETH, BTC (crypto assets)

LEVERAGE STRATEGIES:
- **Long Carbon Exposure**: Borrow stablecoins against carbon collateral, purchase additional carbon credits
- **Yield Farming**: Stake borrowed stablecoins in high-yield protocols while maintaining carbon exposure
- **Arbitrage Trading**: Cross-exchange arbitrage opportunities using carbon credit collateral
- **ESG Hedging**: Hedge carbon tax exposure by leveraging carbon credit holdings

RISK MANAGEMENT:
- **Liquidation Threshold**: 80% LTV triggers margin call, 85% LTV triggers liquidation
- **Oracle Pricing**: Chainlink oracles provide real-time carbon credit pricing for margin calculations
- **Insurance Options**: Smart contract insurance available for liquidation protection
- **Dynamic Hedging**: Automated hedging strategies to manage collateral ratio during volatility`;

    case 'asset_co':
      return `
**🔗 ASSET CO TOKEN CROSS-COLLATERALIZATION STRATEGIES**

INFRASTRUCTURE ASSET BACKING:
- **High Collateral Value**: Asset Co tokens valued at 80% of NAV for lending (stable infrastructure backing)
- **Low Volatility Premium**: 12% volatility vs 25% for carbon credits = higher collateral ratios
- **Institutional Protocols**: Integration with institutional DeFi platforms (Centrifuge, Goldfinch, Zoniqx)
- **Fiat Currency Access**: Borrow against tokens for AUD, USD, EUR working capital needs

YIELD-ENHANCED STRATEGIES:
- **Carry Trade**: Borrow at 4-6% against asset co yield of 28.3% for positive carry arbitrage
- **Real Estate Leverage**: Use infrastructure tokens as collateral for property investment
- **Business Funding**: Acceptable collateral for business loans and expansion capital
- **Tax-Efficient Borrowing**: Borrow against appreciated tokens to avoid CGT on disposal

INSTITUTIONAL APPLICATIONS:
- **Treasury Management**: Corporate treasuries use tokens for liquidity management without selling
- **Private Banking**: Ultra-high-net-worth families leverage tokens for lifestyle financing
- **Fund Operations**: Investment funds use tokens as repo collateral for leverage and liquidity
- **Cross-Border**: International investors access domestic AUD liquidity using token collateral

SOPHISTICATED MECHANICS:
- **Repo Agreements**: Short-term borrowing using tokens as collateral for cash flow management
- **Total Return Swaps**: Maintain token economic exposure while accessing leverage
- **Credit Facilities**: Revolving credit lines with token collateral for operational flexibility
- **Multi-Asset Portfolios**: Combine with other tokenized assets for optimized collateral efficiency`;

    case 'dual_portfolio':
      return `
**🔗 DUAL PORTFOLIO CROSS-COLLATERALIZATION OPTIMIZATION**

PORTFOLIO LEVERAGE ADVANTAGES:
- **Correlation Benefit**: Low correlation between carbon and infrastructure assets increases total portfolio LTV
- **Diversification Bonus**: Blended collateral portfolio supports 85-90% LTV vs 75-80% for single assets
- **Volatility Smoothing**: Combined portfolio volatility 15% vs 25% carbon-only, 12% asset-only
- **Dynamic Rebalancing**: Automated rebalancing maintains optimal collateral ratios

ADVANCED STRATEGIES:
- **Yield Curve Positioning**: Long asset co yield (28.3%), short borrowing costs (4-6%) for net positive carry
- **Cross-Asset Arbitrage**: Use asset co distributions to fund carbon credit speculation
- **Risk Parity**: Volatility-weighted portfolio maintains consistent risk exposure across asset classes
- **Systematic Alpha**: Quantitative strategies exploit carbon price seasonality vs infrastructure stability

INSTITUTIONAL OPTIMIZATION:
- **Family Office Structures**: Multi-generational leverage strategies with succession planning
- **Sovereign Applications**: Central bank-style portfolio management with dual asset diversification
- **Pension Integration**: Liability-driven investment matching using blended asset exposure
- **Insurance Optimization**: Use dual assets to optimize capital efficiency for insurance companies

CROSS-COLLATERAL INNOVATION:
- **Synthetic Products**: Create synthetic exposure to broader commodity and infrastructure markets
- **Hedge Fund Replication**: Replicate hedge fund strategies using tokenized asset building blocks
- **Multi-Manager Allocation**: Different managers for carbon vs infrastructure components
- **ESG Integration**: Maintain ESG exposure while accessing leverage for additional sustainable investments

TAX-EFFICIENT STRUCTURES:
- **CGT Optimization**: Structure borrowing to defer capital gains while maintaining economic exposure
- **Franking Credit Harvesting**: Optimize asset co distributions and borrowing to maximize after-tax returns
- **Cross-Border Optimization**: International investors optimize withholding tax and treaty benefits
- **Estate Planning**: Use leverage to maintain family wealth while funding distribution to next generation`;

    default:
      return '';
  }
}
