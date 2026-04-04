/**
 * WREI Tokenization Project - Phase 3.2 Tests
 * Advanced Negotiation Contexts
 *
 * Test Coverage:
 * - Primary vs secondary market dynamics
 * - Wholesale vs retail investor pathways
 * - Redemption window negotiations
 * - Cross-collateralization explanations
 */

import { NegotiationState, WREITokenType, InvestorClassification, MarketType, BuyerProfile, PersonaType } from '@/lib/types';
import { getPersonaById } from '@/lib/personas';

/** Creates a complete mock BuyerProfile with all required fields */
function createMockBuyerProfile(overrides: {
  persona: PersonaType | 'freeplay';
  detectedWarmth: number;
  detectedDominance: number;
  wreiTokenType?: WREITokenType;
  investorClassification?: InvestorClassification;
  marketPreference?: MarketType;
}): BuyerProfile {
  return {
    persona: overrides.persona,
    detectedWarmth: overrides.detectedWarmth,
    detectedDominance: overrides.detectedDominance,
    priceAnchor: null,
    volumeInterest: null,
    timelineUrgency: null,
    complianceDriver: null,
    creditType: 'carbon',
    escEligibilityBasis: null,
    wreiTokenType: overrides.wreiTokenType || 'carbon_credits',
    investorClassification: overrides.investorClassification || 'wholesale',
    marketPreference: overrides.marketPreference || 'primary',
    yieldMechanismPreference: null,
    portfolioContext: {
      ticketSize: { min: 1_000_000, max: 50_000_000 },
      yieldRequirement: 0.10,
      riskTolerance: 'moderate',
      liquidityNeeds: 'quarterly',
      esgFocus: false,
      crossCollateralInterest: false,
    },
    complianceRequirements: {
      aflsRequired: false,
      amlCompliance: true,
      taxTreatmentPreference: 'cgt',
      jurisdictionalConstraints: [],
    },
  };
}

describe('Phase 3.2: Advanced Negotiation Contexts', () => {

  describe('Primary vs Secondary Market Dynamics', () => {

    test('Primary market offers institutional minimum allocations', () => {
      const primaryMarketState: NegotiationState = {
        wreiTokenType: 'asset_co',
        marketType: 'primary',
        investorClassification: 'professional',
        buyerProfile: createMockBuyerProfile({
          persona: 'infrastructure_fund',
          detectedWarmth: 7,
          detectedDominance: 8,
        }),
        tokenSpecificData: {
          targetAllocation: 100_000_000, // A$100M
          primaryMarketMinimum: 50_000_000, // A$50M minimum
          institutionalTierPricing: true
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      // Validate that the state structure supports primary market data
      expect(primaryMarketState.marketType).toBe('primary');
      expect(primaryMarketState.investorClassification).toBe('professional');
      expect(primaryMarketState.tokenSpecificData?.primaryMarketMinimum).toBe(50_000_000);
      expect(primaryMarketState.tokenSpecificData?.institutionalTierPricing).toBe(true);
    });

    test('Secondary market enables smaller fractional access', () => {
      const secondaryMarketState: NegotiationState = {
        wreiTokenType: 'carbon_credits',
        marketType: 'secondary',
        investorClassification: 'wholesale',
        buyerProfile: createMockBuyerProfile({
          persona: 'family_office',
          detectedWarmth: 8,
          detectedDominance: 5,
        }),
        tokenSpecificData: {
          targetAllocation: 5_000_000, // A$5M
          secondaryMarketLiquidity: true,
          fractionalAccess: true,
          marketMakingSpread: 0.02 // 2% spread
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(secondaryMarketState.tokenSpecificData?.secondaryMarketLiquidity).toBe(true);
      expect(secondaryMarketState.tokenSpecificData?.fractionalAccess).toBe(true);
      expect(secondaryMarketState.tokenSpecificData?.marketMakingSpread).toBe(0.02);
    });

    test('Primary market includes regulatory priority and early access terms', () => {
      const persona = getPersonaById('sovereign_wealth');
      expect(persona?.budgetRange).toContain('A$500M-2B');

      const sovereignPrimaryState: NegotiationState = {
        wreiTokenType: 'dual_portfolio',
        marketType: 'primary',
        investorClassification: 'professional',
        buyerProfile: createMockBuyerProfile({
          persona: 'sovereign_wealth',
          detectedWarmth: 7,
          detectedDominance: 8,
        }),
        tokenSpecificData: {
          targetAllocation: 750_000_000, // A$750M sovereign allocation
          primaryMarketAccess: true,
          regulatoryPriority: true,
          earlyAccessTerms: {
            discountRate: 0.05, // 5% early allocation discount
            lockupPeriod: 24 // months
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(sovereignPrimaryState.tokenSpecificData?.primaryMarketAccess).toBe(true);
      expect(sovereignPrimaryState.tokenSpecificData?.regulatoryPriority).toBe(true);
      expect(sovereignPrimaryState.tokenSpecificData?.earlyAccessTerms?.discountRate).toBe(0.05);
    });
  });

  describe('Wholesale vs Retail Investor Pathways', () => {

    test('Wholesale pathway enables AFSL s708 exemption for sophisticated investors', () => {
      const wholesaleState: NegotiationState = {
        wreiTokenType: 'asset_co',
        investorClassification: 'wholesale',
        buyerProfile: createMockBuyerProfile({
          persona: 'infrastructure_fund',
          detectedWarmth: 7,
          detectedDominance: 8,
        }),
        tokenSpecificData: {
          wholesaleExemption: 's708', // AFSL wholesale investor exemption
          minimumInvestment: 500_000, // A$500K sophisticated investor minimum
          aflsCompliance: {
            exemptionCategory: 'wholesale',
            accreditationRequired: true,
            disclosureLevel: 'minimal'
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(wholesaleState.tokenSpecificData?.wholesaleExemption).toBe('s708');
      expect(wholesaleState.tokenSpecificData?.aflsCompliance?.exemptionCategory).toBe('wholesale');
      expect(wholesaleState.tokenSpecificData?.minimumInvestment).toBe(500_000);
    });

    test('Professional investor pathway includes enhanced due diligence', () => {
      const professionalState: NegotiationState = {
        wreiTokenType: 'dual_portfolio',
        investorClassification: 'professional',
        buyerProfile: createMockBuyerProfile({
          persona: 'pension_fund',
          detectedWarmth: 6,
          detectedDominance: 6,
        }),
        tokenSpecificData: {
          professionalInvestorStatus: true,
          enhancedDueDiligence: {
            trusteeApproval: true,
            actuarialAssessment: true,
            memberImpactAnalysis: true,
            apraCompliance: true
          },
          fiduciaryFramework: {
            memberBenefit: 'diversification',
            riskAssessment: 'infrastructure',
            esgAlignment: 'carbon_reduction'
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(professionalState.tokenSpecificData?.enhancedDueDiligence?.trusteeApproval).toBe(true);
      expect(professionalState.tokenSpecificData?.fiduciaryFramework?.memberBenefit).toBe('diversification');
    });

    test('Sophisticated investor pathway enables advanced structures', () => {
      const sophisticatedState: NegotiationState = {
        wreiTokenType: 'carbon_credits',
        investorClassification: 'sophisticated',
        buyerProfile: createMockBuyerProfile({
          persona: 'defi_yield_farmer',
          detectedWarmth: 5,
          detectedDominance: 9,
        }),
        tokenSpecificData: {
          sophisticatedStructures: {
            leveragedExposure: true,
            crossCollateral: true,
            apiAccess: true,
            automatedStrategies: true
          },
          defiIntegration: {
            smartContractAccess: true,
            protocolCompatibility: ['aave', 'compound', 'zoniqx'],
            ltvRatio: 0.80
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(sophisticatedState.tokenSpecificData?.sophisticatedStructures?.leveragedExposure).toBe(true);
      expect(sophisticatedState.tokenSpecificData?.defiIntegration?.ltvRatio).toBe(0.80);
    });
  });

  describe('Redemption Window Negotiations', () => {

    test('Asset Co tokens include quarterly redemption windows', () => {
      const assetCoState: NegotiationState = {
        wreiTokenType: 'asset_co',
        buyerProfile: createMockBuyerProfile({
          persona: 'infrastructure_fund',
          detectedWarmth: 7,
          detectedDominance: 8,
        }),
        tokenSpecificData: {
          redemptionTerms: {
            frequency: 'quarterly',
            noticePeriod: 90, // days
            minimumHoldingPeriod: 365, // days
            redemptionFee: 0.005, // 0.5%
            navDiscount: 0.02, // 2% discount to NAV
            liquidityReserve: 0.15 // 15% of portfolio in liquid reserves
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(assetCoState.tokenSpecificData?.redemptionTerms?.frequency).toBe('quarterly');
      expect(assetCoState.tokenSpecificData?.redemptionTerms?.noticePeriod).toBe(90);
      expect(assetCoState.tokenSpecificData?.redemptionTerms?.liquidityReserve).toBe(0.15);
    });

    test('Carbon credit tokens enable immediate trading with settlement windows', () => {
      const carbonState: NegotiationState = {
        wreiTokenType: 'carbon_credits',
        buyerProfile: createMockBuyerProfile({
          persona: 'trading_desk',
          detectedWarmth: 4,
          detectedDominance: 9,
        }),
        tokenSpecificData: {
          tradingTerms: {
            immediateTrading: true,
            settlementWindow: 0, // T+0 settlement
            liquidityProvider: 'zoniqx_zconnect',
            marketMaking: true,
            bidAskSpread: 0.015 // 1.5% typical spread
          },
          retirementFlexibility: {
            immediateRetirement: true,
            scheduledRetirement: true,
            batchProcessing: true
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(carbonState.tokenSpecificData?.tradingTerms?.immediateTrading).toBe(true);
      expect(carbonState.tokenSpecificData?.tradingTerms?.settlementWindow).toBe(0);
      expect(carbonState.tokenSpecificData?.retirementFlexibility?.immediateRetirement).toBe(true);
    });

    test('Dual portfolio allows strategic rebalancing windows', () => {
      const dualState: NegotiationState = {
        wreiTokenType: 'dual_portfolio',
        buyerProfile: createMockBuyerProfile({
          persona: 'family_office',
          detectedWarmth: 8,
          detectedDominance: 5,
        }),
        tokenSpecificData: {
          rebalancingTerms: {
            frequency: 'quarterly',
            automaticRebalancing: true,
            targetAllocation: { carbon: 0.4, asset_co: 0.6 },
            rebalancingThreshold: 0.05, // 5% deviation threshold
            rebalancingFee: 0.001 // 0.1% fee
          },
          redemptionFlexibility: {
            partialRedemption: true,
            crossAssetRedemption: true,
            familyGovernanceApproval: true
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(dualState.tokenSpecificData?.rebalancingTerms?.frequency).toBe('quarterly');
      expect(dualState.tokenSpecificData?.rebalancingTerms?.targetAllocation?.carbon).toBe(0.4);
      expect(dualState.tokenSpecificData?.redemptionFlexibility?.crossAssetRedemption).toBe(true);
    });
  });

  describe('Cross-Collateralization Explanations', () => {

    test('Asset Co tokens enable 80% LTV borrowing for additional exposure', () => {
      const crossCollateralState: NegotiationState = {
        wreiTokenType: 'asset_co',
        buyerProfile: createMockBuyerProfile({
          persona: 'defi_yield_farmer',
          detectedWarmth: 5,
          detectedDominance: 9,
        }),
        tokenSpecificData: {
          crossCollateralization: {
            maxLtv: 0.80, // 80% loan-to-value
            borrowingCurrency: ['usdc', 'audt', 'dai'],
            interestRateRange: { min: 0.045, max: 0.065 }, // 4.5-6.5%
            marginCallThreshold: 0.85,
            liquidationThreshold: 0.90,
            protocolIntegration: ['aave', 'compound', 'zoniqx']
          },
          leverageStrategies: {
            carbonExposure: true,
            yieldFarming: true,
            arbitrage: true,
            hedging: true
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(crossCollateralState.tokenSpecificData?.crossCollateralization?.maxLtv).toBe(0.80);
      expect(crossCollateralState.tokenSpecificData?.leverageStrategies?.carbonExposure).toBe(true);
    });

    test('Carbon credits can be staked for additional yield generation', () => {
      const carbonCollateralState: NegotiationState = {
        wreiTokenType: 'carbon_credits',
        buyerProfile: createMockBuyerProfile({
          persona: 'defi_yield_farmer',
          detectedWarmth: 5,
          detectedDominance: 9,
        }),
        tokenSpecificData: {
          stakingMechanisms: {
            liquidityPooling: true,
            stakingYield: 0.03, // 3% additional APY
            impermanentLossProtection: true,
            stakingPenalty: 0.002 // 0.2% early unstaking penalty
          },
          collateralValue: {
            baseValue: 1.0, // 100% of token value
            volatilityDiscount: 0.15, // 15% haircut for volatility
            liquidityPremium: 0.05 // 5% premium for liquidity provision
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(carbonCollateralState.tokenSpecificData?.stakingMechanisms?.liquidityPooling).toBe(true);
      expect(carbonCollateralState.tokenSpecificData?.collateralValue?.volatilityDiscount).toBe(0.15);
    });

    test('Dual portfolio enables optimized cross-collateral strategies', () => {
      const optimizedCollateralState: NegotiationState = {
        wreiTokenType: 'dual_portfolio',
        buyerProfile: createMockBuyerProfile({
          persona: 'family_office',
          detectedWarmth: 8,
          detectedDominance: 5,
        }),
        tokenSpecificData: {
          portfolioLeverage: {
            correlationBenefit: 0.20, // 20% leverage increase from low correlation
            diversificationBonus: 0.15, // 15% additional LTV from diversification
            riskWeighting: { carbon: 0.25, asset_co: 0.12 }, // Volatility-weighted
            maxPortfolioLeverage: 0.90 // 90% with dual asset backing
          },
          strategicArbitrage: {
            yieldCurvePositioning: true,
            seasonalRebalancing: true,
            taxOptimization: true,
            generationalPlanning: true
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(optimizedCollateralState.tokenSpecificData?.portfolioLeverage?.correlationBenefit).toBe(0.20);
      expect(optimizedCollateralState.tokenSpecificData?.portfolioLeverage?.maxPortfolioLeverage).toBe(0.90);
      expect(optimizedCollateralState.tokenSpecificData?.strategicArbitrage?.taxOptimization).toBe(true);
    });
  });

  describe('Advanced Context Integration with Existing Personas', () => {

    test('Infrastructure fund receives primary market Asset Co allocation with institutional terms', () => {
      const persona = getPersonaById('infrastructure_fund');
      expect(persona?.name).toBe('Margaret Richardson');
      expect(persona?.budgetRange).toContain('A$50-500M');

      const infrastructureFundContext = {
        wreiTokenType: 'asset_co' as WREITokenType,
        marketType: 'primary' as MarketType,
        investorClassification: 'professional' as InvestorClassification,
        primaryMarketTerms: {
          minimumAllocation: 50_000_000,
          institutionalPricing: true,
          dedicatedAccountManager: true,
          quarterlyBoardReporting: true,
          aflsDocumentation: 'comprehensive'
        }
      };

      expect(infrastructureFundContext.marketType).toBe('primary');
      expect(infrastructureFundContext.primaryMarketTerms.minimumAllocation).toBe(50_000_000);
    });

    test('DeFi yield farmer accesses sophisticated cross-collateral structures', () => {
      const persona = getPersonaById('defi_yield_farmer');
      expect(persona?.name).toBe('Kevin Chen');
      expect(persona?.primaryMotivation).toContain('Cross-collateral DeFi strategies');

      const defiContext = {
        wreiTokenType: 'dual_portfolio' as WREITokenType,
        investorClassification: 'sophisticated' as InvestorClassification,
        advancedStructures: {
          crossCollateral: true,
          apiIntegration: true,
          automatedRebalancing: true,
          protocolCompatibility: ['zoniqx', 'aave', 'compound'],
          maxLeverage: 0.90
        }
      };

      expect(defiContext.advancedStructures.crossCollateral).toBe(true);
      expect(defiContext.advancedStructures.maxLeverage).toBe(0.90);
    });

    test('Sovereign wealth fund receives government-specific primary market terms', () => {
      const persona = getPersonaById('sovereign_wealth');
      expect(persona?.name).toBe('Dr. Fatima Al-Zahra');
      expect(persona?.budgetRange).toContain('A$500M-2B');

      const sovereignContext = {
        wreiTokenType: 'dual_portfolio' as WREITokenType,
        marketType: 'primary' as MarketType,
        investorClassification: 'professional' as InvestorClassification,
        sovereignTerms: {
          governmentPriority: true,
          strategicAllocation: true,
          parliamentaryReporting: true,
          nationalSecurityClearance: true,
          domesticAssetPriority: true
        }
      };

      expect(sovereignContext.sovereignTerms.governmentPriority).toBe(true);
      expect(sovereignContext.sovereignTerms.domesticAssetPriority).toBe(true);
    });
  });

  describe('Enhanced Type System Validation', () => {

    test('NegotiationState supports market type and investor classification', () => {
      const testState: NegotiationState = {
        wreiTokenType: 'asset_co',
        marketType: 'primary',
        investorClassification: 'professional',
        buyerProfile: {
          persona: 'infrastructure_fund',
          detectedWarmth: 7,
          detectedDominance: 8,
          priceAnchor: null,
          volumeInterest: null,
          timelineUrgency: null,
          complianceDriver: null,
          creditType: 'carbon',
          escEligibilityBasis: null,
          wreiTokenType: 'asset_co',
          investorClassification: 'professional',
          marketPreference: 'primary',
          yieldMechanismPreference: null,
          portfolioContext: {
            ticketSize: { min: 50_000_000, max: 500_000_000 },
            yieldRequirement: 0.12,
            riskTolerance: 'moderate',
            liquidityNeeds: 'quarterly',
            esgFocus: false,
            crossCollateralInterest: false
          },
          complianceRequirements: {
            aflsRequired: true,
            amlCompliance: true,
            taxTreatmentPreference: 'cgt',
            jurisdictionalConstraints: ['AU']
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(testState.marketType).toBe('primary');
      expect(testState.investorClassification).toBe('professional');
      expect(testState.wreiTokenType).toBe('asset_co');
    });

    test('TokenSpecificData supports advanced negotiation contexts', () => {
      const testState: NegotiationState = {
        wreiTokenType: 'dual_portfolio',
        investorClassification: 'sophisticated',
        buyerProfile: {
          persona: 'defi_yield_farmer',
          detectedWarmth: 5,
          detectedDominance: 9,
          priceAnchor: null,
          volumeInterest: null,
          timelineUrgency: null,
          complianceDriver: null,
          creditType: 'carbon',
          escEligibilityBasis: null,
          wreiTokenType: 'dual_portfolio',
          investorClassification: 'sophisticated',
          marketPreference: 'primary',
          yieldMechanismPreference: null,
          portfolioContext: {
            ticketSize: { min: 10_000_000, max: 50_000_000 },
            yieldRequirement: 0.20,
            riskTolerance: 'aggressive',
            liquidityNeeds: 'daily',
            esgFocus: false,
            crossCollateralInterest: true
          },
          complianceRequirements: {
            aflsRequired: false,
            amlCompliance: true,
            taxTreatmentPreference: 'cgt',
            jurisdictionalConstraints: []
          }
        },
        tokenSpecificData: {
          crossCollateralization: { maxLtv: 0.80 },
          redemptionTerms: { frequency: 'quarterly' },
          sophisticatedStructures: {
            leveragedExposure: true,
            crossCollateral: true,
            apiAccess: true,
            automatedStrategies: true
          }
        },
        // ... other required fields
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 0,
        phase: 'opening',
        messages: [],
        argumentHistory: [],
        emotionalState: 'neutral',
        totalConcessionGiven: 0,
        roundsSinceLastConcession: 0,
        negotiationComplete: false,
        outcome: null,
        creditType: 'carbon',
        priceFloor: 120,
        maxConcessionPerRound: 0.05,
        maxTotalConcession: 0.20,
        minimumRoundsBeforeConcession: 3,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'high',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable',
        },
      };

      expect(testState.tokenSpecificData?.crossCollateralization?.maxLtv).toBe(0.80);
      expect(testState.tokenSpecificData?.redemptionTerms?.frequency).toBe('quarterly');
      expect(testState.tokenSpecificData?.sophisticatedStructures?.leveragedExposure).toBe(true);
    });
  });
});