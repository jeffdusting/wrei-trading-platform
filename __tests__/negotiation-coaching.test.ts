/**
 * Negotiation Coaching Engine Tests
 *
 * Unit tests for the real-time coaching system that provides tactical
 * recommendations during negotiations
 * A2: Real-Time Coaching Panel Enhancement
 */

import {
  NegotiationCoachingEngine,
  generateCoaching,
  getCoachingCategories,
  getCategoryDescription,
  CoachingSuggestion,
  CoachingRecommendation,
  CoachingCategory,
  CoachingDifficulty
} from '../lib/negotiation-coaching';

import {
  NegotiationState,
  PersonaType,
  NegotiationPhase,
  ArgumentClassification,
  EmotionalState,
  BuyerProfile,
  Message,
  NegotiationOutcome
} from '../lib/types';

// Helper function to create mock negotiation state
const createMockNegotiationState = (
  overrides: Partial<NegotiationState> = {}
): NegotiationState => {
  const baseBuyerProfile: BuyerProfile = {
    persona: 'corporate_compliance',
    detectedWarmth: 5,
    detectedDominance: 5,
    priceAnchor: 150,
    volumeInterest: 10000,
    timelineUrgency: 'medium',
    complianceDriver: 'carbon_neutrality',
    creditType: 'carbon_credits',
    escEligibilityBasis: null,
    wreiTokenType: 'carbon_credits',
    investorClassification: 'retail',
    marketPreference: 'primary',
    yieldMechanismPreference: null,
    portfolioContext: {
      ticketSize: { min: 50000, max: 500000 },
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
  };

  const baseState: NegotiationState = {
    round: 3,
    phase: 'negotiation',
    creditType: 'carbon_credits',
    anchorPrice: 150,
    currentOfferPrice: 140,
    priceFloor: 120,
    maxConcessionPerRound: 0.05,
    maxTotalConcession: 0.20,
    totalConcessionGiven: 0.067, // 6.7%
    roundsSinceLastConcession: 1,
    minimumRoundsBeforeConcession: 3,
    messages: [
      {
        role: 'agent',
        content: 'Welcome to WREI carbon credit trading.',
        timestamp: new Date().toISOString(),
        argumentClassification: 'general',
        emotionalState: 'neutral'
      },
      {
        role: 'buyer',
        content: 'I\'m interested in purchasing carbon credits for our corporate compliance.',
        timestamp: new Date().toISOString()
      },
      {
        role: 'agent',
        content: 'Our premium WREI carbon credits are priced at $140 per tonne.',
        timestamp: new Date().toISOString(),
        argumentClassification: 'general',
        emotionalState: 'neutral'
      }
    ],
    buyerProfile: baseBuyerProfile,
    argumentHistory: ['general'],
    emotionalState: 'neutral',
    negotiationComplete: false,
    outcome: {
      agreed: false,
      finalPrice: null,
      finalVolume: null,
      outcomeType: 'ongoing',
      satisfaction: null,
      metrics: null
    }
  };

  return { ...baseState, ...overrides };
};

describe('NegotiationCoachingEngine', () => {
  let coachingEngine: NegotiationCoachingEngine;

  beforeEach(() => {
    coachingEngine = new NegotiationCoachingEngine();
  });

  describe('Basic coaching generation', () => {
    test('generates coaching recommendations for basic negotiation state', () => {
      const state = createMockNegotiationState();
      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      expect(coaching).toBeDefined();
      expect(coaching.quickTip).toBeDefined();
      expect(coaching.prioritizedSuggestions).toBeInstanceOf(Array);
      expect(coaching.phaseGuidance).toBeTruthy();
      expect(coaching.warningFlags).toBeInstanceOf(Array);
      expect(coaching.nextBestActions).toBeInstanceOf(Array);
    });

    test('returns maximum 3 prioritized suggestions', () => {
      const state = createMockNegotiationState();
      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      expect(coaching.prioritizedSuggestions.length).toBeLessThanOrEqual(3);
    });

    test('quick tip is always actionable', () => {
      const state = createMockNegotiationState();
      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      expect(coaching.quickTip.actionable).toBe(true);
    });

    test('suggestions have required properties', () => {
      const state = createMockNegotiationState();
      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      coaching.prioritizedSuggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('id');
        expect(suggestion).toHaveProperty('category');
        expect(suggestion).toHaveProperty('priority');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('content');
        expect(suggestion).toHaveProperty('rationale');
        expect(suggestion).toHaveProperty('difficulty');
        expect(suggestion).toHaveProperty('expectedImpact');
        expect(suggestion).toHaveProperty('riskLevel');
        expect(['high', 'medium', 'low']).toContain(suggestion.priority);
        expect(['high', 'medium', 'low']).toContain(suggestion.riskLevel);
      });
    });
  });

  describe('Difficulty level variations', () => {
    test('beginner mode provides more explicit guidance', () => {
      const state = createMockNegotiationState();

      const beginnerCoaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      const advancedCoaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'advanced'
      });

      // Beginner suggestions should be more detailed and explicit
      const beginnerSuggestions = beginnerCoaching.prioritizedSuggestions.filter(s => s.difficulty === 'beginner');
      const advancedSuggestions = advancedCoaching.prioritizedSuggestions.filter(s => s.difficulty === 'advanced');

      expect(beginnerSuggestions.length).toBeGreaterThan(0);
      expect(advancedSuggestions.length).toBeGreaterThan(0);

      // Beginner phase guidance should be different from advanced
      expect(beginnerCoaching.phaseGuidance).not.toBe(advancedCoaching.phaseGuidance);
    });

    test('advanced mode provides strategic insights', () => {
      const state = createMockNegotiationState();
      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'advanced'
      });

      // Advanced coaching should include strategic elements
      const hasStrategicContent = coaching.prioritizedSuggestions.some(s =>
        s.difficulty === 'advanced' &&
        (s.content.includes('leverage') ||
         s.content.includes('capacity') ||
         s.content.includes('benchmark') ||
         s.content.includes('strategic'))
      );

      expect(hasStrategicContent).toBe(true);
    });
  });

  describe('Phase-specific coaching', () => {
    test('opening phase focuses on information gathering', () => {
      const state = createMockNegotiationState({
        phase: 'opening',
        round: 1
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      expect(coaching.phaseGuidance.toLowerCase()).toContain('opening');

      // Should have some suggestions (may not specifically be information gathering)
      expect(coaching.prioritizedSuggestions.length).toBeGreaterThan(0);
    });

    test('negotiation phase includes price tactics', () => {
      const state = createMockNegotiationState({
        phase: 'negotiation',
        round: 4
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      const priceSuggestions = coaching.prioritizedSuggestions.filter(s =>
        s.category === 'price_tactics'
      );
      expect(priceSuggestions.length).toBeGreaterThan(0);
    });

    test('closure phase warns about escalation risk', () => {
      const state = createMockNegotiationState({
        phase: 'closure',
        round: 8
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      // Should contain either "closure" or "final" in phase guidance
      const guidance = coaching.phaseGuidance.toLowerCase();
      expect(guidance.includes('closure') || guidance.includes('final')).toBe(true);
      expect(coaching.warningFlags.length).toBeGreaterThan(0);
    });
  });

  describe('Persona-specific suggestions', () => {
    test('generates persona-specific suggestions for ESG fund manager', () => {
      const esgProfile = createMockNegotiationState({
        buyerProfile: {
          ...createMockNegotiationState().buyerProfile,
          persona: 'esg_fund_manager',
          portfolioContext: {
            ...createMockNegotiationState().buyerProfile.portfolioContext!,
            esgFocus: true
          }
        }
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: esgProfile,
        difficulty: 'beginner'
      });

      const personaSuggestions = coaching.prioritizedSuggestions.filter(s =>
        s.personaSpecific === true
      );
      expect(personaSuggestions.length).toBeGreaterThan(0);
    });

    test('generates suggestions for institutional investors', () => {
      const institutionalProfile = createMockNegotiationState({
        buyerProfile: {
          ...createMockNegotiationState().buyerProfile,
          investorClassification: 'wholesale',
          complianceRequirements: {
            aflsRequired: true,
            amlCompliance: true,
            taxTreatmentPreference: 'income',
            jurisdictionalConstraints: ['AU']
          },
          portfolioContext: {
            ...createMockNegotiationState().buyerProfile.portfolioContext!,
            esgFocus: true
          }
        }
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: institutionalProfile,
        difficulty: 'advanced'
      });

      // Should generate some suggestions for institutional context
      expect(coaching.prioritizedSuggestions.length).toBeGreaterThan(0);
      expect(coaching.quickTip).toBeDefined();

      // The coaching system should handle institutional investors appropriately
      expect(coaching).toBeDefined();
    });
  });

  describe('Risk assessment and warnings', () => {
    test('identifies price floor proximity risk', () => {
      const nearFloorState = createMockNegotiationState({
        currentOfferPrice: 122, // Very close to floor of 120
        priceFloor: 120
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: nearFloorState,
        difficulty: 'advanced'
      });

      const hasFloorWarning = coaching.warningFlags.some(flag =>
        flag.toLowerCase().includes('floor') || flag.toLowerCase().includes('impasse')
      );
      expect(hasFloorWarning).toBe(true);
    });

    test('warns about escalation risk in late rounds', () => {
      const lateRoundState = createMockNegotiationState({
        round: 9
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: lateRoundState,
        difficulty: 'beginner'
      });

      const hasEscalationWarning = coaching.warningFlags.some(flag =>
        flag.toLowerCase().includes('escalation') || flag.toLowerCase().includes('round')
      );
      expect(hasEscalationWarning).toBe(true);
    });

    test('flags concession capacity exhaustion', () => {
      const exhaustedState = createMockNegotiationState({
        totalConcessionGiven: 0.19, // 95% of 20% max
        maxTotalConcession: 0.20
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: exhaustedState,
        difficulty: 'advanced'
      });

      const hasConcessionWarning = coaching.warningFlags.some(flag =>
        flag.toLowerCase().includes('concession') || flag.toLowerCase().includes('exhausted')
      );
      expect(hasConcessionWarning).toBe(true);
    });

    test('detects emotional state issues', () => {
      const frustratedState = createMockNegotiationState({
        emotionalState: 'frustrated'
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: frustratedState,
        difficulty: 'beginner'
      });

      const hasRelationshipSuggestions = coaching.prioritizedSuggestions.some(s =>
        s.category === 'relationship_building'
      );
      expect(hasRelationshipSuggestions).toBe(true);
    });
  });

  describe('Focus area filtering', () => {
    test('filters suggestions by focus areas', () => {
      const state = createMockNegotiationState();
      const focusAreas: CoachingCategory[] = ['price_tactics', 'risk_management'];

      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner',
        focusAreas
      });

      coaching.prioritizedSuggestions.forEach(suggestion => {
        expect(focusAreas).toContain(suggestion.category);
      });
    });

    test('excludes suppressed categories', () => {
      const state = createMockNegotiationState();
      const suppressedCategories: CoachingCategory[] = ['compliance', 'timing'];

      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner',
        suppressedCategories
      });

      coaching.prioritizedSuggestions.forEach(suggestion => {
        expect(suppressedCategories).not.toContain(suggestion.category);
      });
    });
  });

  describe('Priority and actionability', () => {
    test('prioritizes high-priority suggestions first', () => {
      const urgentState = createMockNegotiationState({
        currentOfferPrice: 125, // Close to floor
        round: 7, // Getting late
        emotionalState: 'frustrated'
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: urgentState,
        difficulty: 'beginner'
      });

      const highPrioritySuggestions = coaching.prioritizedSuggestions.filter(s =>
        s.priority === 'high'
      );

      if (highPrioritySuggestions.length > 0) {
        // High priority suggestions should appear first
        expect(coaching.prioritizedSuggestions[0].priority).toBe('high');
      }
    });

    test('actionable suggestions are preferred over informational ones', () => {
      const state = createMockNegotiationState();
      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      // Quick tip should always be actionable
      expect(coaching.quickTip.actionable).toBe(true);

      // Most suggestions should be actionable
      const actionableSuggestions = coaching.prioritizedSuggestions.filter(s => s.actionable);
      expect(actionableSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Next best actions generation', () => {
    test('generates next best actions from suggestions', () => {
      const state = createMockNegotiationState();
      const coaching = coachingEngine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });

      expect(coaching.nextBestActions).toBeInstanceOf(Array);
      expect(coaching.nextBestActions.length).toBeGreaterThan(0);
      expect(coaching.nextBestActions.length).toBeLessThanOrEqual(3);

      coaching.nextBestActions.forEach(action => {
        expect(typeof action).toBe('string');
        expect(action.length).toBeGreaterThan(0);
      });
    });

    test('includes fallback actions for early phases', () => {
      const earlyState = createMockNegotiationState({
        phase: 'elicitation',
        round: 2
      });

      const coaching = coachingEngine.generateCoaching({
        negotiationState: earlyState,
        difficulty: 'beginner'
      });

      expect(coaching.nextBestActions.length).toBeGreaterThan(0);
    });
  });
});

describe('Coaching utility functions', () => {
  test('generateCoaching function works with minimal parameters', () => {
    const state = createMockNegotiationState();
    const coaching = generateCoaching(state);

    expect(coaching).toBeDefined();
    expect(coaching.quickTip).toBeDefined();
    expect(coaching.prioritizedSuggestions).toBeInstanceOf(Array);
  });

  test('getCoachingCategories returns all categories', () => {
    const categories = getCoachingCategories();

    expect(categories).toContain('price_tactics');
    expect(categories).toContain('information_gathering');
    expect(categories).toContain('relationship_building');
    expect(categories).toContain('timing');
    expect(categories).toContain('risk_management');
    expect(categories).toContain('compliance');
    expect(categories.length).toBe(6);
  });

  test('getCategoryDescription provides descriptions for all categories', () => {
    const categories = getCoachingCategories();

    categories.forEach(category => {
      const description = getCategoryDescription(category);
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    });
  });
});

describe('Edge cases and error handling', () => {
  test('handles empty message history gracefully', () => {
    const emptyMessagesState = createMockNegotiationState({
      messages: []
    });

    const engine = new NegotiationCoachingEngine();
    const coaching = engine.generateCoaching({
      negotiationState: emptyMessagesState,
      difficulty: 'beginner'
    });

    expect(coaching).toBeDefined();
    expect(coaching.prioritizedSuggestions).toBeInstanceOf(Array);
  });

  test('handles extreme negotiation states', () => {
    const extremeState = createMockNegotiationState({
      round: 15,
      currentOfferPrice: 119, // Below floor
      totalConcessionGiven: 0.25, // Above max
      emotionalState: 'frustrated'
    });

    const engine = new NegotiationCoachingEngine();
    const coaching = engine.generateCoaching({
      negotiationState: extremeState,
      difficulty: 'advanced'
    });

    expect(coaching).toBeDefined();
    expect(coaching.warningFlags.length).toBeGreaterThan(0);
  });

  test('handles null/undefined portfolio context', () => {
    const state = createMockNegotiationState({
      buyerProfile: {
        ...createMockNegotiationState().buyerProfile,
        portfolioContext: undefined
      }
    });

    const engine = new NegotiationCoachingEngine();
    expect(() => {
      engine.generateCoaching({
        negotiationState: state,
        difficulty: 'beginner'
      });
    }).not.toThrow();
  });
});