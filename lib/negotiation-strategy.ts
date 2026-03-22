/**
 * WREI Negotiation Strategy System
 * Enhanced AI negotiation with real-time strategy explanations
 * Phase 1 Milestone 1.1 - AI Negotiation Enhancement
 */

import { NegotiationState, PersonaType, WREITokenType, InvestorClassification } from './types';

export interface NegotiationStrategyExplanation {
  decision: string;                    // What the AI decided to do
  rationale: string;                   // Why this approach was chosen
  marketContext: string;               // Current market conditions influencing decision
  riskAssessment: string;              // Risk factors considered
  alternativeOptions: string[];        // Other strategies that were considered
  expectedOutcome: string;             // What the AI expects to happen
  confidenceLevel: 'low' | 'medium' | 'high'; // AI confidence in this strategy
  institutionalFactors?: string[];     // Specific institutional investor considerations
}

export interface PortfolioContext {
  currentHoldings: {
    carbonCredits: number;             // tCO2e currently held
    assetCoTokens: number;             // Asset Co tokens held
    totalPortfolioValue: number;       // A$ total portfolio value
  };
  investmentObjectives: {
    targetAllocation: {
      carbonCredits: number;           // % target allocation
      assetCoTokens: number;           // % target allocation
      cash: number;                    // % cash allocation
    };
    timeHorizon: number;               // years
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    esgRequirements: boolean;          // ESG mandate requirements
  };
  complianceRequirements: {
    regulatoryFramework: string[];     // e.g., ['AFSL', 'MiFID II']
    reportingRequirements: string[];   // e.g., ['ISSB S2', 'TCFD']
    auditRequirements: string[];       // e.g., ['Big 4 audit', 'ESG verification']
  };
}

export interface InstitutionalNegotiationContext {
  persona: PersonaType;
  portfolioContext: PortfolioContext;
  investorClassification: InvestorClassification;
  negotiationObjective: 'acquisition' | 'portfolio_optimization' | 'risk_management' | 'compliance';
  mandateConstraints: {
    priceFloor?: number;               // Minimum price willing to accept
    priceCeiling?: number;             // Maximum price willing to pay
    volumeMin?: number;                // Minimum volume required
    volumeMax?: number;                // Maximum volume capacity
    timeConstraints?: string;          // e.g., "Board approval required by Q4"
  };
}

/**
 * Generate strategy explanation for institutional negotiation decisions
 */
export function generateStrategyExplanation(
  state: NegotiationState,
  context: InstitutionalNegotiationContext,
  aiDecision: string
): NegotiationStrategyExplanation {
  const { persona, portfolioContext, investorClassification, mandateConstraints } = context;

  // Analyze current negotiation phase and market conditions
  const currentPhase = state.phase;
  const currentPrice = state.currentOfferPrice;
  const anchorPrice = state.anchorPrice;
  const priceMovement = ((currentPrice - anchorPrice) / anchorPrice) * 100;

  // Generate persona-specific strategy explanations
  const explanation = generatePersonaSpecificExplanation(
    persona,
    currentPhase,
    priceMovement,
    portfolioContext,
    aiDecision
  );

  // Add institutional factors
  const institutionalFactors = generateInstitutionalFactors(
    investorClassification,
    mandateConstraints,
    state.wreiTokenType || 'carbon_credits'
  );

  // Assess confidence based on market conditions and persona match
  const confidenceLevel = assessStrategyConfidence(state, context);

  return {
    decision: aiDecision,
    rationale: explanation.rationale,
    marketContext: explanation.marketContext,
    riskAssessment: explanation.riskAssessment,
    alternativeOptions: explanation.alternativeOptions,
    expectedOutcome: explanation.expectedOutcome,
    confidenceLevel,
    institutionalFactors
  };
}

/**
 * Generate persona-specific negotiation explanations
 */
function generatePersonaSpecificExplanation(
  persona: PersonaType,
  phase: string,
  priceMovement: number,
  portfolioContext: PortfolioContext,
  decision: string
): Omit<NegotiationStrategyExplanation, 'confidenceLevel' | 'institutionalFactors'> {

  switch (persona) {
    case 'esg_impact_investor':
      return {
        decision,
        rationale: `ESG-focused approach prioritising measurable impact over aggressive pricing. Current ${priceMovement > 0 ? 'premium' : 'discount'} of ${Math.abs(priceMovement).toFixed(1)}% aligns with impact investor expectations for verified carbon credits.`,
        marketContext: `ESG fund mandates typically accept 15-25% premiums for high-quality verification. dMRV technology provides institutional-grade transparency required for ESG reporting.`,
        riskAssessment: `Low reputational risk given verification standards. Portfolio allocation remains within ESG mandate limits (${portfolioContext.investmentObjectives.targetAllocation.carbonCredits}% target).`,
        alternativeOptions: [
          'Negotiate volume discount for large ESG portfolio allocation',
          'Request quarterly impact reporting package',
          'Structure forward purchase agreement for ongoing ESG needs'
        ],
        expectedOutcome: `Agreement likely given ESG mandate alignment and quality focus over price sensitivity. Expect documentation requests for ESG committee review.`
      };

    case 'defi_yield_farmer':
      return {
        decision,
        rationale: `DeFi strategy focused on capital efficiency and cross-collateral opportunities. ${priceMovement > 0 ? 'Price premium' : 'Price discount'} of ${Math.abs(priceMovement).toFixed(1)}% evaluated against 80% LTV borrowing capacity and 28.3% Asset Co yield.`,
        marketContext: `Tokenised RWA market growing rapidly (A$19B). WREI's T+0 settlement and smart contract compatibility provide significant operational advantages over traditional carbon markets.`,
        riskAssessment: `Technical execution risk managed through API integration. Leverage risk controlled via automated liquidation protocols. Smart contract audit status critical for position sizing.`,
        alternativeOptions: [
          'Negotiate API access and technical documentation package',
          'Structure automated trading protocols with volume tiers',
          'Request smart contract audit reports and security documentation'
        ],
        expectedOutcome: `Decision driven by technical capabilities and yield mathematics rather than relationship factors. Rapid decision-making expected if technical requirements met.`
      };

    case 'family_office':
      return {
        decision,
        rationale: `Conservative wealth preservation approach with multi-generational time horizon. ${priceMovement > 0 ? 'Premium pricing' : 'Discount pricing'} of ${Math.abs(priceMovement).toFixed(1)}% evaluated for long-term value creation and family legacy alignment.`,
        marketContext: `Family office allocations to alternative investments increasing. Real asset backing provides inflation protection suitable for 50+ year investment horizon.`,
        riskAssessment: `Conservative risk profile prioritises capital preservation. Real asset backing (water infrastructure) provides downside protection. ESG alignment supports family values and next-generation engagement.`,
        alternativeOptions: [
          'Negotiate quarterly family reporting package',
          'Structure CGT-efficient NAV accruing model',
          'Request family governance and succession planning documentation'
        ],
        expectedOutcome: `Thorough due diligence process expected. Decision requires family investment committee approval. Relationship building and education critical for success.`
      };

    case 'sovereign_wealth':
      return {
        decision,
        rationale: `Sovereign mandate focused on large-scale Australian green infrastructure exposure. ${priceMovement > 0 ? 'Premium' : 'Discount'} of ${Math.abs(priceMovement).toFixed(1)}% assessed against sovereign investment criteria and national development objectives.`,
        marketContext: `A$500M-2B sovereign allocation size requires institutional-grade settlement and compliance infrastructure. National policy alignment with climate objectives critical.`,
        riskAssessment: `Sovereign risk tolerance allows for innovation premium given strategic Australian infrastructure exposure. Currency hedging and macroeconomic factors integrated into pricing assessment.`,
        alternativeOptions: [
          'Negotiate sovereign-scale volume pricing (A$750M-1.5B)',
          'Structure national policy alignment and reporting framework',
          'Request macroeconomic impact assessment and currency hedging options'
        ],
        expectedOutcome: `Complex approval process involving multiple sovereign fund stakeholders. National policy alignment and strategic infrastructure benefits critical for approval.`
      };

    default:
      return {
        decision,
        rationale: `Standard institutional approach balancing price, quality, and execution requirements.`,
        marketContext: `Professional investor market conditions with institutional-grade settlement requirements.`,
        riskAssessment: `Standard institutional risk assessment protocols applied.`,
        alternativeOptions: [
          'Negotiate institutional pricing terms',
          'Request comprehensive due diligence package'
        ],
        expectedOutcome: `Professional evaluation process with committee-based decision-making expected.`
      };
  }
}

/**
 * Generate institutional-specific factors affecting negotiation
 */
function generateInstitutionalFactors(
  classification: InvestorClassification,
  constraints: InstitutionalNegotiationContext['mandateConstraints'],
  tokenType: WREITokenType
): string[] {
  const factors: string[] = [];

  // Classification-based factors
  switch (classification) {
    case 'sophisticated':
      factors.push('Sophisticated investor classification allows for complex structures');
      factors.push('Higher risk tolerance enables innovation premium acceptance');
      break;
    case 'professional':
      factors.push('Professional investor compliance requirements active');
      factors.push('Fiduciary duty considerations influence pricing negotiations');
      break;
    case 'wholesale':
      factors.push('Wholesale investor protections apply');
      factors.push('Investment mandate constraints require documentation');
      break;
  }

  // Token type specific factors
  switch (tokenType) {
    case 'carbon_credits':
      factors.push('Carbon credit verification and registry requirements');
      factors.push('ESG reporting and compliance implications');
      break;
    case 'asset_co':
      factors.push('Real asset backing provides institutional comfort');
      factors.push('Yield characteristics suitable for institutional mandates');
      break;
    case 'dual_portfolio':
      factors.push('Portfolio diversification benefits across asset classes');
      factors.push('Cross-collateral opportunities enhance capital efficiency');
      break;
  }

  // Constraint-based factors
  if (constraints.timeConstraints) {
    factors.push(`Time constraint active: ${constraints.timeConstraints}`);
  }

  if (constraints.volumeMin && constraints.volumeMax) {
    factors.push(`Volume requirements between ${constraints.volumeMin} and ${constraints.volumeMax}`);
  }

  return factors;
}

/**
 * Assess AI confidence in strategy based on market conditions and persona match
 */
function assessStrategyConfidence(
  state: NegotiationState,
  context: InstitutionalNegotiationContext
): 'low' | 'medium' | 'high' {
  let confidenceScore = 5; // Start with medium confidence

  // Increase confidence for institutional persona match
  if (['esg_impact_investor', 'defi_yield_farmer', 'family_office', 'sovereign_wealth'].includes(context.persona)) {
    confidenceScore += 2;
  }

  // Adjust for price positioning
  const priceVsAnchor = (state.currentOfferPrice - state.anchorPrice) / state.anchorPrice;
  if (Math.abs(priceVsAnchor) < 0.1) { // Within 10% of anchor
    confidenceScore += 1;
  }

  // Adjust for negotiation phase
  if (state.phase === 'opening' || state.phase === 'negotiation') {
    confidenceScore += 1;
  }

  // Adjust for portfolio alignment
  if (context.portfolioContext.investmentObjectives.esgRequirements &&
      ['carbon_credits', 'dual_portfolio'].includes(state.wreiTokenType || 'carbon_credits')) {
    confidenceScore += 1;
  }

  // Convert to confidence level
  if (confidenceScore >= 8) return 'high';
  if (confidenceScore >= 6) return 'medium';
  return 'low';
}

/**
 * Create mock portfolio context for demonstration purposes
 */
export function createMockPortfolioContext(persona: PersonaType): PortfolioContext {
  switch (persona) {
    case 'esg_impact_investor':
      return {
        currentHoldings: {
          carbonCredits: 150000,      // 150k tCO2e
          assetCoTokens: 50000,       // A$50M equivalent
          totalPortfolioValue: 25000000000 // A$25B AUM
        },
        investmentObjectives: {
          targetAllocation: {
            carbonCredits: 15,         // 15% allocation to carbon assets
            assetCoTokens: 10,         // 10% allocation to asset co
            cash: 5                    // 5% cash for deployment
          },
          timeHorizon: 10,
          riskTolerance: 'moderate',
          esgRequirements: true
        },
        complianceRequirements: {
          regulatoryFramework: ['AFSL', 'MiFID II', 'SFDR'],
          reportingRequirements: ['ISSB S2', 'TCFD', 'EU Taxonomy'],
          auditRequirements: ['Big 4 ESG audit', 'Third-party verification']
        }
      };

    case 'defi_yield_farmer':
      return {
        currentHoldings: {
          carbonCredits: 25000,       // 25k tCO2e for cross-collateral
          assetCoTokens: 75000,       // A$75M for yield farming
          totalPortfolioValue: 2000000000 // A$2B digital AUM
        },
        investmentObjectives: {
          targetAllocation: {
            carbonCredits: 25,         // 25% for leverage strategies
            assetCoTokens: 35,         // 35% for yield generation
            cash: 10                   // 10% for high-velocity trading
          },
          timeHorizon: 2,
          riskTolerance: 'aggressive',
          esgRequirements: false
        },
        complianceRequirements: {
          regulatoryFramework: ['AFSL', 'Digital Asset License'],
          reportingRequirements: ['DeFi Protocol Audits', 'Smart Contract Verification'],
          auditRequirements: ['Technical security audit', 'Compliance monitoring']
        }
      };

    case 'family_office':
      return {
        currentHoldings: {
          carbonCredits: 30000,       // 30k tCO2e for ESG alignment
          assetCoTokens: 45000,       // A$45M conservative infrastructure
          totalPortfolioValue: 2500000000 // A$2.5B family wealth
        },
        investmentObjectives: {
          targetAllocation: {
            carbonCredits: 3,          // 3% ESG/environmental allocation
            assetCoTokens: 5,          // 5% infrastructure allocation
            cash: 2                    // 2% alternative assets
          },
          timeHorizon: 50,
          riskTolerance: 'conservative',
          esgRequirements: true
        },
        complianceRequirements: {
          regulatoryFramework: ['AFSL', 'Family Office Regulations'],
          reportingRequirements: ['Family Governance', 'Multi-generational reporting'],
          auditRequirements: ['Family audit', 'Succession planning review']
        }
      };

    case 'sovereign_wealth':
      return {
        currentHoldings: {
          carbonCredits: 500000,      // 500k tCO2e sovereign mandate
          assetCoTokens: 1000000,     // A$1B infrastructure exposure
          totalPortfolioValue: 200000000000 // A$200B sovereign fund
        },
        investmentObjectives: {
          targetAllocation: {
            carbonCredits: 1,          // 1% environmental/climate allocation
            assetCoTokens: 2,          // 2% Australian infrastructure
            cash: 0.5                  // 0.5% innovation/emerging assets
          },
          timeHorizon: 30,
          riskTolerance: 'moderate',
          esgRequirements: true
        },
        complianceRequirements: {
          regulatoryFramework: ['Sovereign Investment Framework', 'National Interest Test'],
          reportingRequirements: ['Parliamentary reporting', 'National policy alignment'],
          auditRequirements: ['Auditor-General review', 'Parliamentary scrutiny']
        }
      };

    default:
      return {
        currentHoldings: {
          carbonCredits: 10000,
          assetCoTokens: 25000,
          totalPortfolioValue: 100000000
        },
        investmentObjectives: {
          targetAllocation: { carbonCredits: 10, assetCoTokens: 15, cash: 5 },
          timeHorizon: 5,
          riskTolerance: 'moderate',
          esgRequirements: false
        },
        complianceRequirements: {
          regulatoryFramework: ['AFSL'],
          reportingRequirements: ['Standard reporting'],
          auditRequirements: ['Annual audit']
        }
      };
  }
}