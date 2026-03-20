/**
 * PHASE 3.1 TESTS: Institutional Buyer Personas
 *
 * Tests for completed Phase 3.1 functionality:
 * - 6 new institutional buyer personas
 * - Sophisticated financial understanding
 * - Appropriate personality profiles
 * - Agent strategy definitions
 */

import { describe, it, expect } from '@jest/globals';
import { PERSONA_DEFINITIONS, getPersonaById, getAllPersonas } from '../lib/personas';
import type { PersonaDefinition, PersonaType } from '../lib/types';

// Institutional persona IDs added in Phase 3.1
const INSTITUTIONAL_PERSONA_IDS: PersonaType[] = [
  'infrastructure_fund',
  'esg_impact_investor',
  'defi_yield_farmer',
  'family_office',
  'sovereign_wealth',
  'pension_fund'
];

// Expected characteristics for institutional personas
const INSTITUTIONAL_EXPECTATIONS = {
  minimumAUM: 1_000_000_000, // A$1B+ for institutional scale
  ticketSizes: {
    minimum: 10_000_000, // A$10M+
    maximum: 2_000_000_000, // A$2B maximum
  },
  sophisticatedTerms: [
    '28.3%', 'Asset Co', 'IRR', 'NAV', 'yield', 'cash-on-cash',
    'cross-collateral', 'LTV', 'AUM', 'infrastructure', 'ESG',
    'DeFi', 'regulatory', 'compliance', 'AFSL', 'fiduciary'
  ],
  personalityRanges: {
    warmth: { min: 4, max: 9 },
    dominance: { min: 5, max: 9 },
    patience: { min: 4, max: 9 },
  }
};

describe('Phase 3.1: Institutional Buyer Personas', () => {

  describe('3.1.1: Persona Structure Validation', () => {
    it('should have all 6 institutional personas defined', () => {
      INSTITUTIONAL_PERSONA_IDS.forEach(personaId => {
        const persona = getPersonaById(personaId);
        expect(persona).toBeDefined();
        expect(persona?.id).toBe(personaId);
      });
    });

    it('should maintain backward compatibility with original personas', () => {
      const originalPersonaIds: PersonaType[] = [
        'compliance_officer',
        'esg_fund_manager',
        'trading_desk',
        'sustainability_director',
        'government_procurement'
      ];

      originalPersonaIds.forEach(personaId => {
        const persona = getPersonaById(personaId);
        expect(persona).toBeDefined();
        expect(persona?.id).toBe(personaId);
      });
    });

    it('should have total persona count of 11 (5 original + 6 institutional)', () => {
      const allPersonas = getAllPersonas();
      expect(allPersonas).toHaveLength(11);
    });
  });

  describe('3.1.2: Infrastructure Fund Manager', () => {
    const persona = getPersonaById('infrastructure_fund');

    it('should have appropriate infrastructure focus characteristics', () => {
      expect(persona).toBeDefined();
      expect(persona?.name).toBe('Margaret Richardson');
      expect(persona?.organisation).toContain('Macquarie');
      expect(persona?.title).toContain('Investment Officer');
    });

    it('should demonstrate yield-focused sophistication', () => {
      expect(persona?.briefing).toContain('28.3%');
      expect(persona?.briefing).toContain('Asset Co');
      expect(persona?.briefing).toContain('cash-on-cash');
      expect(persona?.briefing).toContain('A$61.1M');
      expect(persona?.briefing).toContain('infrastructure');
    });

    it('should have institutional-scale parameters', () => {
      expect(persona?.budgetRange).toContain('A$50-500M');
      expect(persona?.volumeTarget).toContain('A$100-200M');
      expect(persona?.briefing).toContain('A$12B AUM');
    });

    it('should have appropriate negotiation characteristics', () => {
      expect(persona?.warmth).toBeGreaterThanOrEqual(6);
      expect(persona?.dominance).toBeGreaterThanOrEqual(7);
      expect(persona?.patience).toBeGreaterThanOrEqual(7);
    });
  });

  describe('3.1.3: ESG Impact Investor', () => {
    const persona = getPersonaById('esg_impact_investor');

    it('should have appropriate ESG focus characteristics', () => {
      expect(persona).toBeDefined();
      expect(persona?.name).toBe('Dr. Aisha Kowalski');
      expect(persona?.organisation).toContain('Generation Investment');
      expect(persona?.title).toContain('Impact');
    });

    it('should demonstrate carbon-focused sophistication', () => {
      expect(persona?.briefing).toContain('Carbon Credit');
      expect(persona?.briefing).toContain('verification');
      expect(persona?.briefing).toContain('telemetry');
      expect(persona?.briefing).toContain('47.2%');
      expect(persona?.briefing).toContain('modal shift');
    });

    it('should reference appropriate carbon market knowledge', () => {
      expect(persona?.briefing).toContain('A$155B');
      expect(persona?.briefing).toContain('2030');
      expect(persona?.agentStrategy).toContain('native digital');
      expect(persona?.agentStrategy).toContain('dMRV');
    });
  });

  describe('3.1.4: DeFi Yield Farmer', () => {
    const persona = getPersonaById('defi_yield_farmer');

    it('should have appropriate DeFi characteristics', () => {
      expect(persona).toBeDefined();
      expect(persona?.name).toBe('Kevin Chen');
      expect(persona?.organisation).toContain('Jump Trading');
      expect(persona?.title).toContain('DeFi');
    });

    it('should demonstrate cross-collateral sophistication', () => {
      expect(persona?.briefing).toContain('cross-collateral');
      expect(persona?.briefing).toContain('80% LTV');
      expect(persona?.briefing).toContain('USYC');
      expect(persona?.briefing).toContain('BUIDL');
      expect(persona?.briefing).toContain('A$19B');
    });

    it('should have high dominance and low patience (typical DeFi trader)', () => {
      expect(persona?.dominance).toBeGreaterThanOrEqual(9);
      expect(persona?.patience).toBeLessThanOrEqual(4);
      expect(persona?.warmth).toBeLessThanOrEqual(5);
    });
  });

  describe('3.1.5: Family Office', () => {
    const persona = getPersonaById('family_office');

    it('should have appropriate family office characteristics', () => {
      expect(persona).toBeDefined();
      expect(persona?.name).toBe('Charles Whitmore III');
      expect(persona?.organisation).toContain('Family Office');
      expect(persona?.title).toContain('Investment Advisor');
    });

    it('should demonstrate long-term wealth preservation focus', () => {
      expect(persona?.briefing).toContain('multi-generational');
      expect(persona?.briefing).toContain('50+ year');
      expect(persona?.briefing).toContain('succession planning');
      expect(persona?.briefing).toContain('NAV-accruing');
      expect(persona?.briefing).toContain('CGT');
    });

    it('should have high patience (long-term focus)', () => {
      expect(persona?.patience).toBeGreaterThanOrEqual(9);
      expect(persona?.agentStrategy).toContain('generational');
    });
  });

  describe('3.1.6: Sovereign Wealth Fund', () => {
    const persona = getPersonaById('sovereign_wealth');

    it('should have appropriate sovereign characteristics', () => {
      expect(persona).toBeDefined();
      expect(persona?.name).toBe('Dr. Fatima Al-Zahra');
      expect(persona?.organisation).toContain('Australia Future Fund');
      expect(persona?.title).toContain('Alternative Investments');
    });

    it('should demonstrate sovereign-scale sophistication', () => {
      expect(persona?.briefing).toContain('A$230B AUM');
      expect(persona?.budgetRange).toContain('A$500M-2B');
      expect(persona?.briefing).toContain('domestic');
      expect(persona?.briefing).toContain('sovereign');
      expect(persona?.briefing).toContain('parliamentary');
    });

    it('should reference national strategic considerations', () => {
      expect(persona?.agentStrategy).toContain('sovereign benefits');
      expect(persona?.agentStrategy).toContain('domestic job creation');
      expect(persona?.agentStrategy).toContain('nation-building');
    });
  });

  describe('3.1.7: Pension Fund', () => {
    const persona = getPersonaById('pension_fund');

    it('should have appropriate pension fund characteristics', () => {
      expect(persona).toBeDefined();
      expect(persona?.name).toBe('Sarah Mitchell');
      expect(persona?.organisation).toContain('AustralianSuper');
      expect(persona?.title).toContain('Alternatives');
    });

    it('should demonstrate fiduciary responsibility focus', () => {
      expect(persona?.briefing).toContain('fiduciary');
      expect(persona?.briefing).toContain('member');
      expect(persona?.briefing).toContain('trustee');
      expect(persona?.briefing).toContain('3.2M members');
      expect(persona?.briefing).toContain('A$300B AUM');
    });

    it('should have very high patience (institutional governance)', () => {
      expect(persona?.patience).toBeGreaterThanOrEqual(9);
      expect(persona?.agentStrategy).toContain('prudent');
      expect(persona?.agentStrategy).toContain('member benefit');
    });
  });

  describe('3.1.8: Cross-Persona Validation', () => {
    const institutionalPersonas = INSTITUTIONAL_PERSONA_IDS.map(id => getPersonaById(id)!);

    it('should all demonstrate sophisticated financial understanding', () => {
      institutionalPersonas.forEach(persona => {
        const combinedText = `${persona.briefing} ${persona.agentStrategy}`.toLowerCase();

        // Should contain sophisticated financial terms
        const hasFinancialTerms = INSTITUTIONAL_EXPECTATIONS.sophisticatedTerms.some(term =>
          combinedText.includes(term.toLowerCase())
        );
        expect(hasFinancialTerms).toBe(true);
      });
    });

    it('should have realistic AUM figures mentioned', () => {
      institutionalPersonas.forEach(persona => {
        // Extract AUM figures (look for patterns like "A$XB AUM" or "A$XB")
        const aumPattern = /A\$[\d,]+[MB]/g;
        const aumMatches = `${persona.briefing} ${persona.budgetRange}`.match(aumPattern);
        expect(aumMatches).toBeDefined();
        expect(aumMatches!.length).toBeGreaterThan(0);
      });
    });

    it('should have appropriate personality score ranges', () => {
      institutionalPersonas.forEach(persona => {
        expect(persona.warmth).toBeGreaterThanOrEqual(INSTITUTIONAL_EXPECTATIONS.personalityRanges.warmth.min);
        expect(persona.warmth).toBeLessThanOrEqual(INSTITUTIONAL_EXPECTATIONS.personalityRanges.warmth.max);

        expect(persona.dominance).toBeGreaterThanOrEqual(INSTITUTIONAL_EXPECTATIONS.personalityRanges.dominance.min);
        expect(persona.dominance).toBeLessThanOrEqual(INSTITUTIONAL_EXPECTATIONS.personalityRanges.dominance.max);

        expect(persona.patience).toBeGreaterThanOrEqual(INSTITUTIONAL_EXPECTATIONS.personalityRanges.patience.min);
        expect(persona.patience).toBeLessThanOrEqual(INSTITUTIONAL_EXPECTATIONS.personalityRanges.patience.max);
      });
    });

    it('should have unique names and organisations', () => {
      const names = institutionalPersonas.map(p => p.name);
      const organisations = institutionalPersonas.map(p => p.organisation);

      expect(new Set(names).size).toBe(names.length); // All unique names
      expect(new Set(organisations).size).toBe(organisations.length); // All unique organisations
    });

    it('should have comprehensive agent strategies', () => {
      institutionalPersonas.forEach(persona => {
        expect(persona.agentStrategy.length).toBeGreaterThan(200); // Substantial strategy guidance
        expect(persona.agentStrategy).toContain('warmth');
        expect(persona.agentStrategy).toContain('dominance');
        expect(persona.agentStrategy).toContain('patience');
      });
    });
  });

  describe('3.1.9: Integration with Existing System', () => {
    it('should maintain consistent persona structure across all personas', () => {
      const allPersonas = getAllPersonas();

      allPersonas.forEach(persona => {
        expect(persona).toHaveProperty('id');
        expect(persona).toHaveProperty('name');
        expect(persona).toHaveProperty('title');
        expect(persona).toHaveProperty('organisation');
        expect(persona).toHaveProperty('warmth');
        expect(persona).toHaveProperty('dominance');
        expect(persona).toHaveProperty('patience');
        expect(persona).toHaveProperty('briefing');
        expect(persona).toHaveProperty('agentStrategy');
      });
    });

    it('should support persona selection functionality', () => {
      // Test that persona selection logic can handle new institutional personas
      INSTITUTIONAL_PERSONA_IDS.forEach(personaId => {
        const selected = getPersonaById(personaId);
        expect(selected).toBeDefined();
        expect(selected?.id).toBe(personaId);
      });
    });
  });
});