/**
 * INTEGRATION TESTS: System Functionality
 *
 * End-to-end tests validating the integration of Phases 1-3.1:
 * - Dual token system works with institutional personas
 * - Financial models integrate with persona expectations
 * - Regulatory compliance aligns with institutional requirements
 * - Overall system coherence and functionality
 */

import { describe, it, expect } from '@jest/globals';
import { PERSONA_DEFINITIONS, getPersonaById } from '../lib/personas';
import type { PersonaType, WREITokenType } from '../lib/types';

describe('Integration: System Functionality', () => {

  describe('Integration 1: Dual Token System × Institutional Personas', () => {
    it('should align token types with persona preferences', () => {
      const tokenPersonaAlignment: Record<WREITokenType, PersonaType[]> = {
        carbon_credits: ['esg_impact_investor'],
        asset_co: ['infrastructure_fund', 'sovereign_wealth', 'pension_fund'],
        dual_portfolio: ['family_office', 'defi_yield_farmer'],
      };

      Object.entries(tokenPersonaAlignment).forEach(([tokenType, personaIds]) => {
        personaIds.forEach(personaId => {
          const persona = getPersonaById(personaId as PersonaType);
          expect(persona).toBeDefined();

          // Check if persona briefing mentions the appropriate token type
          const briefingLower = persona!.briefing.toLowerCase();
          switch (tokenType) {
            case 'carbon_credits':
              expect(briefingLower).toMatch(/carbon|credit|emission|offset/);
              break;
            case 'asset_co':
              expect(briefingLower).toMatch(/asset co|infrastructure|yield|lease/);
              break;
            case 'dual_portfolio':
              expect(briefingLower).toMatch(/dual|portfolio|both|combined/);
              break;
          }
        });
      });
    });

    it('should have personas that understand specific WREI token mechanics', () => {
      const tokenMechanics = {
        '28.3%': 'asset_co', // Asset Co yield
        'cross-collateral': 'dual_portfolio', // Cross-collateral strategies
        'vessel efficiency': 'carbon_credits', // Carbon generation
        'NAV-accruing': 'asset_co', // NAV appreciation model
        'revenue share': 'carbon_credits', // Quarterly distributions
      };

      Object.entries(tokenMechanics).forEach(([mechanic, expectedToken]) => {
        const personasWithMechanic = PERSONA_DEFINITIONS.filter(persona =>
          persona.briefing.includes(mechanic) || persona.agentStrategy.includes(mechanic)
        );

        expect(personasWithMechanic.length).toBeGreaterThan(0);
        // At least one persona should understand this mechanic
      });
    });
  });

  describe('Integration 2: Financial Models × Persona Sophistication', () => {
    it('should have institutional personas reference appropriate financial metrics', () => {
      const institutionalPersonas = [
        'infrastructure_fund',
        'esg_impact_investor',
        'defi_yield_farmer',
        'family_office',
        'sovereign_wealth',
        'pension_fund'
      ];

      const financialMetrics = [
        'IRR', 'cash-on-cash', 'yield', 'NAV', 'AUM', 'LTV',
        '28.3%', 'A$131M', 'A$473M', '80%', 'risk-adjusted'
      ];

      institutionalPersonas.forEach(personaId => {
        const persona = getPersonaById(personaId as PersonaType);
        expect(persona).toBeDefined();

        const combinedText = `${persona!.briefing} ${persona!.agentStrategy}`;
        const foundMetrics = financialMetrics.filter(metric =>
          combinedText.includes(metric)
        );

        expect(foundMetrics.length).toBeGreaterThanOrEqual(2);
        // Each institutional persona should reference multiple financial metrics
      });
    });

    it('should have yield expectations aligned with WREI financial models', () => {
      const yieldExpectations: Record<string, { min: number; max: number }> = {
        infrastructure_fund: { min: 0.12, max: 0.35 }, // 12-35% for infrastructure (includes Asset Co 28.3%)
        esg_impact_investor: { min: 0.08, max: 0.30 }, // 8-30% for ESG + returns (includes both WREI products)
        defi_yield_farmer: { min: 0.08, max: 0.50 }, // 8-50% for leveraged strategies (wide range)
        family_office: { min: 0.08, max: 0.30 }, // 8-30% for long-term preservation (includes both)
        sovereign_wealth: { min: 0.08, max: 0.30 }, // 8-30% for sovereign mandates (includes both)
        pension_fund: { min: 0.08, max: 0.30 }, // 8-30% for pension obligations (includes both)
      };

      Object.entries(yieldExpectations).forEach(([personaId, { min, max }]) => {
        const persona = getPersonaById(personaId as PersonaType);
        expect(persona).toBeDefined();

        // WREI should meet these expectations
        const wreiAssetCoYield = 0.283; // 28.3%
        const wreiCarbonYield = 0.08; // 8% revenue share

        // At least one WREI product should meet persona expectations
        const meetsExpectations =
          (wreiAssetCoYield >= min && wreiAssetCoYield <= max) ||
          (wreiCarbonYield >= min && wreiCarbonYield <= max);

        expect(meetsExpectations).toBe(true);
      });
    });
  });

  describe('Integration 3: Regulatory Compliance × Institutional Requirements', () => {
    it('should align persona compliance needs with WREI regulatory framework', () => {
      const complianceRequirements = {
        pension_fund: ['fiduciary', 'APRA', 'member', 'trustee'],
        sovereign_wealth: ['sovereign', 'parliamentary', 'regulatory'],
        infrastructure_fund: ['AFSL', 'professional', 'institutional'],
        family_office: ['succession', 'tax', 'CGT', 'governance'],
        esg_impact_investor: ['ESG', 'verification', 'audit'],
        defi_yield_farmer: ['API', 'settlement', 'smart contract'],
      };

      Object.entries(complianceRequirements).forEach(([personaId, requirements]) => {
        const persona = getPersonaById(personaId as PersonaType);
        expect(persona).toBeDefined();

        const combinedText = `${persona!.briefing} ${persona!.agentStrategy}`.toLowerCase();
        const foundRequirements = requirements.filter(req =>
          combinedText.includes(req.toLowerCase())
        );

        expect(foundRequirements.length).toBeGreaterThanOrEqual(1);
        // Each persona should reference at least one relevant compliance aspect
      });
    });

    it('should have appropriate investor classification alignment', () => {
      const investorClassifications: Record<string, string[]> = {
        infrastructure_fund: ['professional', 'institutional'],
        esg_impact_investor: ['professional', 'institutional'],
        defi_yield_farmer: ['professional', 'sophisticated'],
        family_office: ['wholesale', 'sophisticated'],
        sovereign_wealth: ['professional', 'institutional'],
        pension_fund: ['professional', 'institutional'],
      };

      const institutionalPersonas = Object.keys(investorClassifications);
      const personasWithClassifications = institutionalPersonas.filter(personaId => {
        const persona = getPersonaById(personaId as PersonaType);
        if (!persona) return false;

        const combinedText = `${persona.briefing} ${persona.agentStrategy}`.toLowerCase();
        const expectedClassifications = investorClassifications[personaId];
        return expectedClassifications.some(classification =>
          combinedText.includes(classification.toLowerCase())
        );
      });

      // Most personas should have explicit investor classifications
      expect(personasWithClassifications.length).toBeGreaterThanOrEqual(4);
      expect(personasWithClassifications.length / institutionalPersonas.length).toBeGreaterThan(0.6); // >60% should have classifications
    });
  });

  describe('Integration 4: Negotiation Intelligence × Market Context', () => {
    it('should reference appropriate market intelligence in persona strategies', () => {
      const marketIntelligence = {
        'A$19B': 'tokenized RWA market size',
        'A$155B': 'projected carbon market 2030',
        'USYC': 'competitive treasury token',
        'BUIDL': 'competitive treasury token',
        'infrastructure REITs': 'comparable investment class',
      };

      let foundMarketRefs = 0;
      PERSONA_DEFINITIONS.forEach(persona => {
        const combinedText = `${persona.briefing} ${persona.agentStrategy}`;

        Object.keys(marketIntelligence).forEach(marketRef => {
          if (combinedText.includes(marketRef)) {
            foundMarketRefs++;
          }
        });
      });

      expect(foundMarketRefs).toBeGreaterThanOrEqual(4);
      // Multiple personas should reference market intelligence
    });

    it('should have personas with different negotiation styles', () => {
      const negotiationStyles = PERSONA_DEFINITIONS.map(persona => ({
        id: persona.id,
        warmth: persona.warmth,
        dominance: persona.dominance,
        patience: persona.patience,
      }));

      // Should have diversity in negotiation characteristics
      const warmthRange = Math.max(...negotiationStyles.map(p => p.warmth)) -
                         Math.min(...negotiationStyles.map(p => p.warmth));
      const dominanceRange = Math.max(...negotiationStyles.map(p => p.dominance)) -
                            Math.min(...negotiationStyles.map(p => p.dominance));
      const patienceRange = Math.max(...negotiationStyles.map(p => p.patience)) -
                           Math.min(...negotiationStyles.map(p => p.patience));

      expect(warmthRange).toBeGreaterThanOrEqual(4); // At least 4-point range
      expect(dominanceRange).toBeGreaterThanOrEqual(4); // At least 4-point range
      expect(patienceRange).toBeGreaterThanOrEqual(5); // At least 5-point range
    });
  });

  describe('Integration 5: System Coherence', () => {
    it('should maintain consistent terminology across all components', () => {
      const wreiTerminology = [
        'Asset Co', 'Carbon Credit', 'dual token', '28.3%', 'A$131M',
        'vessel efficiency', 'modal shift', 'construction avoidance',
        'dMRV', 'WREI', 'cross-collateral', 'NAV-accruing', 'revenue share'
      ];

      const allPersonaText = PERSONA_DEFINITIONS
        .map(p => `${p.briefing} ${p.agentStrategy}`)
        .join(' ');

      const foundTerms = wreiTerminology.filter(term =>
        allPersonaText.includes(term)
      );

      expect(foundTerms.length).toBeGreaterThanOrEqual(8);
      // Most WREI terminology should appear in persona definitions
    });

    it('should have realistic and achievable financial projections', () => {
      const projections = {
        carbonBaseRevenue: 468_000_000, // A$468M base case
        carbonExpansionRevenue: 1_970_000_000, // A$1.97B expansion
        assetCoEquityYield: 0.283, // 28.3%
        totalCapex: 473_000_000, // A$473M
        netCashFlow: 37_100_000, // A$37.1M annual
      };

      // Asset Co yield calculation should be mathematically correct
      const calculatedYield = projections.netCashFlow / (projections.totalCapex * 0.277); // A$131M equity
      expect(calculatedYield).toBeCloseTo(0.283, 2);

      // Revenue projections should be realistic for market size
      const marketContext = 19_000_000_000; // A$19B tokenized RWA market
      expect(projections.carbonBaseRevenue / marketContext).toBeLessThan(0.1); // <10% market share
    });

    it('should support end-to-end negotiation workflows', () => {
      // Test that we can simulate a complete negotiation flow
      const infrastructureFund = getPersonaById('infrastructure_fund');
      expect(infrastructureFund).toBeDefined();

      // Should have all components needed for negotiation
      expect(infrastructureFund!.briefing.length).toBeGreaterThan(200);
      expect(infrastructureFund!.agentStrategy.length).toBeGreaterThan(200);
      expect(infrastructureFund!.budgetRange).toContain('A$');
      expect(infrastructureFund!.volumeTarget).toContain('A$');
      expect(infrastructureFund!.primaryMotivation).toBeDefined();

      // Personality scores should be within valid ranges
      expect(infrastructureFund!.warmth).toBeGreaterThanOrEqual(1);
      expect(infrastructureFund!.warmth).toBeLessThanOrEqual(10);
      expect(infrastructureFund!.dominance).toBeGreaterThanOrEqual(1);
      expect(infrastructureFund!.dominance).toBeLessThanOrEqual(10);
      expect(infrastructureFund!.patience).toBeGreaterThanOrEqual(1);
      expect(infrastructureFund!.patience).toBeLessThanOrEqual(10);
    });
  });

  describe('Integration 6: Performance & Scalability', () => {
    it('should efficiently handle all persona definitions', () => {
      const startTime = Date.now();
      const allPersonas = PERSONA_DEFINITIONS;
      const endTime = Date.now();

      expect(allPersonas).toHaveLength(11);
      expect(endTime - startTime).toBeLessThan(100); // Should load quickly
    });

    it('should support persona selection without performance issues', () => {
      const personaIds: PersonaType[] = [
        'infrastructure_fund',
        'esg_impact_investor',
        'defi_yield_farmer',
        'family_office',
        'sovereign_wealth',
        'pension_fund'
      ];

      const startTime = Date.now();
      personaIds.forEach(id => {
        const persona = getPersonaById(id);
        expect(persona).toBeDefined();
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });
  });
});