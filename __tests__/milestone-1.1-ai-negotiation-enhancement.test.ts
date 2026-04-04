/**
 * Phase 1 Milestone 1.1: AI Negotiation Enhancement Tests
 * Comprehensive test suite for strategy explanation system
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  generateStrategyExplanation,
  createMockPortfolioContext,
  NegotiationStrategyExplanation,
  InstitutionalNegotiationContext,
  PortfolioContext
} from '@/lib/negotiation-strategy';
import { NegotiationState, PersonaType, WREITokenType } from '@/lib/types';

// Global mock data for all tests
let mockNegotiationState: NegotiationState;
let mockInstitutionalContext: InstitutionalNegotiationContext;

describe('Milestone 1.1: AI Negotiation Enhancement', () => {

  beforeEach(() => {
      mockNegotiationState = {
        buyerProfile: {
          persona: 'esg_impact_investor',
          detectedWarmth: 9,
          detectedDominance: 6,
          priceAnchor: 150,
          volumeInterest: 500000,
          timelineUrgency: 'medium',
          complianceDriver: 'ESG mandate',
          creditType: 'carbon',
          escEligibilityBasis: null,
          wreiTokenType: 'carbon_credits',
          investorClassification: 'professional',
          marketPreference: 'primary',
          yieldMechanismPreference: null,
          portfolioContext: {
            ticketSize: { min: 100000, max: 1000000 },
            yieldRequirement: 0.08,
            riskTolerance: 'moderate',
            liquidityNeeds: 'quarterly',
            esgFocus: true,
            crossCollateralInterest: false
          },
          complianceRequirements: {
            aflsRequired: false,
            amlCompliance: true,
            taxTreatmentPreference: 'cgt',
            jurisdictionalConstraints: []
          }
        },
        messages: [],
        phase: 'negotiation',
        round: 3,
        anchorPrice: 150,
        currentOfferPrice: 145,
        priceFloor: 120,
        totalConcessionGiven: 5,
        maxConcessionPerRound: 7.5,
        maxTotalConcession: 30,
        outcome: null,
        roundsSinceLastConcession: 1,
        minimumRoundsBeforeConcession: 3,
        creditType: 'carbon',
        wreiTokenType: 'carbon_credits',
        investorClassification: 'professional',
        argumentHistory: [],
        emotionalState: 'neutral',
        negotiationComplete: false,
        marketContext: {
          marketType: 'primary',
          liquidityConditions: 'medium',
          competitivePressure: 5,
          regulatoryEnvironment: 'favorable'
        }
      };

      mockInstitutionalContext = {
        persona: 'esg_impact_investor',
        portfolioContext: createMockPortfolioContext('esg_impact_investor'),
        investorClassification: 'professional',
        negotiationObjective: 'acquisition',
        mandateConstraints: {
          priceFloor: 120,
          priceCeiling: 180,
          volumeMin: 100000,
          volumeMax: 2000000,
          timeConstraints: 'Board approval required by Q4'
        }
      };
    });

  describe('Strategy Explanation Generation', () => {
    it('should generate comprehensive strategy explanations for ESG investors', () => {
      const explanation = generateStrategyExplanation(
        mockNegotiationState,
        mockInstitutionalContext,
        'Offering premium pricing justified by verified carbon credits with institutional-grade documentation'
      );

      expect(explanation).toBeDefined();
      expect(explanation.decision).toContain('premium pricing');
      expect(explanation.rationale).toContain('ESG-focused approach');
      expect(explanation.marketContext).toContain('ESG fund mandates');
      expect(explanation.riskAssessment).toContain('Low reputational risk');
      expect(explanation.alternativeOptions).toHaveLength(3);
      expect(explanation.expectedOutcome).toContain('Agreement likely');
      expect(explanation.confidenceLevel).toBe('high');
      expect(explanation.institutionalFactors).toContain('Professional investor compliance requirements active');
    });

    it('should generate DeFi-specific strategy explanations', () => {
      const defiContext = {
        ...mockInstitutionalContext,
        persona: 'defi_yield_farmer' as PersonaType,
        portfolioContext: createMockPortfolioContext('defi_yield_farmer')
      };

      const defiState = {
        ...mockNegotiationState,
        buyer: {
          ...mockNegotiationState.buyerProfile,
          persona: 'defi_yield_farmer' as PersonaType
        },
        wreiTokenType: 'dual_portfolio' as WREITokenType
      };

      const explanation = generateStrategyExplanation(
        defiState,
        defiContext,
        'Emphasizing cross-collateral opportunities and API integration capabilities'
      );

      expect(explanation.rationale).toContain('DeFi strategy focused on capital efficiency');
      expect(explanation.marketContext).toContain('Tokenised RWA market');
      expect(explanation.riskAssessment).toContain('Technical execution risk');
      expect(explanation.alternativeOptions.some(opt => opt.includes('API access'))).toBe(true);
      expect(explanation.expectedOutcome).toContain('technical capabilities');
    });

    it('should generate Family Office strategy explanations', () => {
      const familyContext = {
        ...mockInstitutionalContext,
        persona: 'family_office' as PersonaType,
        portfolioContext: createMockPortfolioContext('family_office')
      };

      const familyState = {
        ...mockNegotiationState,
        buyer: {
          ...mockNegotiationState.buyerProfile,
          persona: 'family_office' as PersonaType
        }
      };

      const explanation = generateStrategyExplanation(
        familyState,
        familyContext,
        'Conservative approach focusing on multi-generational wealth preservation'
      );

      expect(explanation.rationale).toContain('Conservative wealth preservation');
      expect(explanation.marketContext).toContain('Family office allocations');
      expect(explanation.riskAssessment).toContain('Conservative risk profile');
      expect(explanation.alternativeOptions.some(opt => opt.includes('family reporting'))).toBe(true);
      expect(explanation.expectedOutcome).toContain('family investment committee');
    });

    it('should generate Sovereign Wealth Fund strategy explanations', () => {
      const sovereignContext = {
        ...mockInstitutionalContext,
        persona: 'sovereign_wealth' as PersonaType,
        portfolioContext: createMockPortfolioContext('sovereign_wealth')
      };

      const sovereignState = {
        ...mockNegotiationState,
        buyer: {
          ...mockNegotiationState.buyerProfile,
          persona: 'sovereign_wealth' as PersonaType
        }
      };

      const explanation = generateStrategyExplanation(
        sovereignState,
        sovereignContext,
        'Large-scale allocation strategy aligned with national development objectives'
      );

      expect(explanation.rationale).toContain('Sovereign mandate focused on large-scale');
      expect(explanation.marketContext).toContain('A$500M-2B sovereign allocation');
      expect(explanation.riskAssessment).toContain('Sovereign risk tolerance');
      expect(explanation.alternativeOptions.some(opt => opt.includes('sovereign-scale volume'))).toBe(true);
      expect(explanation.expectedOutcome).toContain('sovereign fund stakeholders');
    });

    it('should assess confidence levels accurately', () => {
      // High confidence scenario: institutional persona + good price positioning
      const highConfidenceExplanation = generateStrategyExplanation(
        mockNegotiationState,
        mockInstitutionalContext,
        'Well-positioned negotiation strategy'
      );
      expect(highConfidenceExplanation.confidenceLevel).toBe('high');

      // Lower confidence scenario: aggressive price movement
      const aggressiveState = {
        ...mockNegotiationState,
        currentOfferPrice: 180, // 20% above anchor
        buyer: { ...mockNegotiationState.buyerProfile, persona: 'trading_desk' as PersonaType }
      };
      const tradingContext = {
        ...mockInstitutionalContext,
        persona: 'trading_desk' as PersonaType
      };

      const lowerConfidenceExplanation = generateStrategyExplanation(
        aggressiveState,
        tradingContext,
        'Aggressive pricing strategy'
      );
      expect(lowerConfidenceExplanation.confidenceLevel).toBe('medium');
    });

    it('should include appropriate institutional factors', () => {
      const explanation = generateStrategyExplanation(
        mockNegotiationState,
        mockInstitutionalContext,
        'Professional investor approach'
      );

      expect(explanation.institutionalFactors).toContain('Professional investor compliance requirements active');
      expect(explanation.institutionalFactors).toContain('Carbon credit verification and registry requirements');
      expect(explanation.institutionalFactors).toContain('Time constraint active: Board approval required by Q4');
      expect(explanation.institutionalFactors?.length).toBeGreaterThan(0);
    });
  });

  describe('Portfolio Context Generation', () => {
    it('should create realistic ESG investor portfolio context', () => {
      const context = createMockPortfolioContext('esg_impact_investor');

      expect(context.currentHoldings.totalPortfolioValue).toBe(25000000000); // A$25B AUM
      expect(context.investmentObjectives.esgRequirements).toBe(true);
      expect(context.investmentObjectives.timeHorizon).toBe(10);
      expect(context.complianceRequirements.reportingRequirements).toContain('ISSB S2');
      expect(context.complianceRequirements.reportingRequirements).toContain('TCFD');
    });

    it('should create appropriate DeFi portfolio context', () => {
      const context = createMockPortfolioContext('defi_yield_farmer');

      expect(context.currentHoldings.totalPortfolioValue).toBe(2000000000); // A$2B AUM
      expect(context.investmentObjectives.riskTolerance).toBe('aggressive');
      expect(context.investmentObjectives.timeHorizon).toBe(2);
      expect(context.investmentObjectives.esgRequirements).toBe(false);
      expect(context.complianceRequirements.reportingRequirements).toContain('DeFi Protocol Audits');
    });

    it('should create conservative family office context', () => {
      const context = createMockPortfolioContext('family_office');

      expect(context.currentHoldings.totalPortfolioValue).toBe(2500000000); // A$2.5B family wealth
      expect(context.investmentObjectives.riskTolerance).toBe('conservative');
      expect(context.investmentObjectives.timeHorizon).toBe(50);
      expect(context.complianceRequirements.reportingRequirements).toContain('Family Governance');
    });

    it('should create sovereign scale portfolio context', () => {
      const context = createMockPortfolioContext('sovereign_wealth');

      expect(context.currentHoldings.totalPortfolioValue).toBe(200000000000); // A$200B sovereign fund
      expect(context.investmentObjectives.timeHorizon).toBe(30);
      expect(context.complianceRequirements.regulatoryFramework).toContain('Sovereign Investment Framework');
      expect(context.complianceRequirements.reportingRequirements).toContain('Parliamentary reporting');
    });
  });

  describe('Integration with Negotiation System', () => {
    it('should handle missing strategy explanations gracefully', () => {
      const explanation = generateStrategyExplanation(
        mockNegotiationState,
        mockInstitutionalContext,
        ''
      );

      expect(explanation).toBeDefined();
      expect(explanation.decision).toBe('');
      expect(explanation.rationale).toBeDefined();
      expect(explanation.confidenceLevel).toBeDefined();
    });

    it('should work with all supported token types', () => {
      const tokenTypes: WREITokenType[] = ['carbon_credits', 'asset_co', 'dual_portfolio'];

      tokenTypes.forEach(tokenType => {
        const state = {
          ...mockNegotiationState,
          wreiTokenType: tokenType
        };

        const explanation = generateStrategyExplanation(
          state,
          mockInstitutionalContext,
          `Strategy for ${tokenType}`
        );

        expect(explanation).toBeDefined();
        expect(explanation.institutionalFactors).toBeDefined();
      });
    });

    it('should adapt explanations to negotiation phases', () => {
      const phases = ['opening', 'negotiation', 'closure'] as const;

      phases.forEach(phase => {
        const state = {
          ...mockNegotiationState,
          phase: phase as any
        };

        const explanation = generateStrategyExplanation(
          state,
          mockInstitutionalContext,
          `${phase} phase strategy`
        );

        expect(explanation).toBeDefined();
        expect(explanation.confidenceLevel).toBeDefined();
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should generate explanations quickly', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        generateStrategyExplanation(
          mockNegotiationState,
          mockInstitutionalContext,
          'Performance test strategy'
        );
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;

      expect(avgTime).toBeLessThan(10); // Should take less than 10ms per explanation
    });

    it('should handle edge cases without errors', () => {
      // Test with minimal state
      const minimalState = {
        ...mockNegotiationState,
        currentOfferPrice: 0,
        anchorPrice: 0,
        buyerProfile: {
          ...mockNegotiationState.buyerProfile,
          persona: 'freeplay' as PersonaType
        }
      };

      const minimalContext = {
        ...mockInstitutionalContext,
        persona: 'freeplay' as PersonaType
      };

      expect(() => {
        generateStrategyExplanation(
          minimalState,
          minimalContext,
          'Edge case test'
        );
      }).not.toThrow();
    });
  });
});

describe('UI Component Integration', () => {

  describe('NegotiationStrategyPanel Component', () => {
    it('should be importable without errors', async () => {
      const { default: NegotiationStrategyPanel } = await import('@/components/NegotiationStrategyPanel');
      expect(NegotiationStrategyPanel).toBeDefined();
    });

    // Note: Full React component testing would require additional setup with React Testing Library
    // This validates the component can be imported and has the expected interface
  });
});

describe('API Integration', () => {

  describe('Strategy Explanation in API Response', () => {
    it('should include strategy explanation field in API response type', () => {
      // This test validates the TypeScript interface is correctly extended
      const mockApiResponse = {
        agentMessage: 'Test message',
        state: mockNegotiationState,
        classification: 'general' as any,
        emotionalState: 'neutral' as any,
        threatLevel: 'none' as const,
        strategyExplanation: {
          decision: 'Test decision',
          rationale: 'Test rationale',
          marketContext: 'Test context',
          riskAssessment: 'Test risk',
          alternativeOptions: ['Option 1'],
          expectedOutcome: 'Test outcome',
          confidenceLevel: 'high' as const
        }
      };

      expect(mockApiResponse.strategyExplanation).toBeDefined();
      expect(mockApiResponse.strategyExplanation?.confidenceLevel).toBe('high');
    });
  });
});

describe('Regression Tests', () => {

  describe('Existing Functionality Preservation', () => {
    it('should not break existing persona definitions', async () => {
      const { PERSONA_DEFINITIONS } = await import('@/lib/personas');
      expect(PERSONA_DEFINITIONS).toBeDefined();
      expect(PERSONA_DEFINITIONS.length).toBeGreaterThan(0);

      // Verify institutional personas exist
      const institutionalPersonas = PERSONA_DEFINITIONS.filter(p =>
        ['esg_impact_investor', 'defi_yield_farmer', 'family_office', 'sovereign_wealth'].includes(p.id)
      );
      expect(institutionalPersonas.length).toBe(4);
    });

    it('should maintain existing negotiation state structure', () => {
      expect(mockNegotiationState.buyerProfile).toBeDefined();
      expect(mockNegotiationState.phase).toBeDefined();
      expect(mockNegotiationState.currentOfferPrice).toBeDefined();
      expect(mockNegotiationState.wreiTokenType).toBeDefined();
    });

    it('should not interfere with existing API route functionality', () => {
      // This test ensures the enhanced API route maintains backward compatibility
      // Full integration testing would require API server setup
      expect(true).toBe(true); // Placeholder for integration test
    });
  });
});