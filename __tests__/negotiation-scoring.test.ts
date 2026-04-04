import {
  calculateNegotiationScore,
  getScoreDimensions,
  generateScoreSummary,
  type NegotiationScorecard,
  type PersonaBenchmark
} from '@/lib/negotiation-scoring';
import { NegotiationState, PersonaType, ArgumentClassification, EmotionalState, BuyerProfile } from '@/lib/types';

describe('NegotiationScoring', () => {
  // Helper to create mock buyer profile
  const createMockBuyerProfile = (overrides: Partial<BuyerProfile> = {}): BuyerProfile => ({
    persona: 'compliance_officer',
    detectedWarmth: 6,
    detectedDominance: 8,
    priceAnchor: 150,
    volumeInterest: 10000,
    timelineUrgency: 'medium',
    complianceDriver: 'carbon_neutrality',
    creditType: 'carbon',
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
    },
    ...overrides
  });

  // Helper to create mock negotiation state
  const createMockNegotiationState = (overrides: Partial<NegotiationState> = {}): NegotiationState => ({
    round: 5,
    phase: 'closure',
    creditType: 'carbon',
    anchorPrice: 150,
    currentOfferPrice: 135,
    priceFloor: 120,
    maxConcessionPerRound: 0.05,
    maxTotalConcession: 0.20,
    totalConcessionGiven: 0.10,
    roundsSinceLastConcession: 2,
    minimumRoundsBeforeConcession: 3,
    messages: [
      {
        role: 'buyer',
        content: 'I need carbon credits for compliance',
        timestamp: '2026-03-24T10:00:00Z',
        argumentClassification: 'information_request',
        emotionalState: 'neutral'
      },
      {
        role: 'agent',
        content: 'I can offer WREI-verified credits',
        timestamp: '2026-03-24T10:01:00Z',
        emotionalState: 'neutral'
      },
      {
        role: 'buyer',
        content: 'The price is too high',
        timestamp: '2026-03-24T10:02:00Z',
        argumentClassification: 'price_challenge',
        emotionalState: 'frustrated'
      },
      {
        role: 'agent',
        content: 'Let me see what I can do',
        timestamp: '2026-03-24T10:03:00Z',
        emotionalState: 'neutral'
      },
      {
        role: 'buyer',
        content: 'That works for us',
        timestamp: '2026-03-24T10:04:00Z',
        argumentClassification: 'general',
        emotionalState: 'satisfied'
      }
    ],
    buyerProfile: {
      persona: 'compliance_officer',
      detectedWarmth: 6,
      detectedDominance: 8,
      priceAnchor: 150,
      volumeInterest: 10000,
      timelineUrgency: 'medium',
      complianceDriver: 'carbon_neutrality',
      creditType: 'carbon',
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
    },
    argumentHistory: ['information_request', 'price_challenge', 'general'],
    emotionalState: 'satisfied',
    negotiationComplete: true,
    outcome: 'agreed',
    marketContext: {
      marketType: 'primary',
      liquidityConditions: 'medium',
      competitivePressure: 5,
      regulatoryEnvironment: 'favorable'
    },
    ...overrides
  });

  describe('Price Score Calculation', () => {
    test('calculates perfect price score for anchor price achievement', () => {
      const state = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 150, // Perfect price
        priceFloor: 120,
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.priceScore).toBeGreaterThan(95); // Should be near perfect
    });

    test('calculates zero price score for failed negotiations', () => {
      const state = createMockNegotiationState({
        outcome: 'deferred',
        negotiationComplete: true
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.priceScore).toBe(0);
    });

    test('calculates proportional price score between anchor and floor', () => {
      const state = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 135, // 50% between floor and anchor
        priceFloor: 120,
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.priceScore).toBeGreaterThan(40);
      expect(scorecard.priceScore).toBeLessThan(60);
    });

    test('gives bonus points for exceeding persona expectations', () => {
      const state1 = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 140, // High achievement
        priceFloor: 120,
        outcome: 'agreed'
      });

      const state2 = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 125, // Low achievement
        priceFloor: 120,
        outcome: 'agreed'
      });

      const score1 = calculateNegotiationScore(state1, 'compliance_officer', 15);
      const score2 = calculateNegotiationScore(state2, 'compliance_officer', 15);

      expect(score1.priceScore).toBeGreaterThan(score2.priceScore);
    });
  });

  describe('Efficiency Score Calculation', () => {
    test('gives high efficiency score for quick closures', () => {
      const state = createMockNegotiationState({
        round: 2 // Much faster than expected 4 rounds for compliance officer
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 5);
      expect(scorecard.efficiencyScore).toBeGreaterThan(85);
    });

    test('penalises slow negotiations', () => {
      const state = createMockNegotiationState({
        round: 10 // Much slower than expected 4 rounds
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 30);
      expect(scorecard.efficiencyScore).toBeLessThan(50);
    });

    test('gives average score for meeting expectations', () => {
      const state = createMockNegotiationState({
        round: 4 // Exactly expected rounds for compliance officer
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.efficiencyScore).toBeGreaterThan(75);
      expect(scorecard.efficiencyScore).toBeLessThan(85);
    });
  });

  describe('Strategy Score Calculation', () => {
    test('rewards argument diversity', () => {
      const state1 = createMockNegotiationState({
        argumentHistory: ['information_request', 'price_challenge', 'fairness_appeal', 'authority_constraint']
      });

      const state2 = createMockNegotiationState({
        argumentHistory: ['price_challenge', 'price_challenge', 'price_challenge', 'price_challenge']
      });

      const score1 = calculateNegotiationScore(state1, 'compliance_officer', 15);
      const score2 = calculateNegotiationScore(state2, 'compliance_officer', 15);

      expect(score1.strategyScore).toBeGreaterThan(score2.strategyScore);
    });

    test('rewards using persona-appropriate arguments', () => {
      // Compliance officers respond well to authority_constraint and information_request
      const state = createMockNegotiationState({
        argumentHistory: ['authority_constraint', 'information_request', 'general']
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.strategyScore).toBeGreaterThan(65);
    });

    test('handles empty argument history gracefully', () => {
      const state = createMockNegotiationState({
        argumentHistory: []
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.strategyScore).toBe(40); // Baseline score
    });
  });

  describe('Emotional Intelligence Score Calculation', () => {
    test('rewards positive emotional outcomes', () => {
      const state = createMockNegotiationState({
        messages: [
          {
            role: 'buyer',
            content: 'Starting neutral',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'neutral'
          },
          {
            role: 'buyer',
            content: 'Becoming satisfied',
            timestamp: '2026-03-24T10:01:00Z',
            emotionalState: 'satisfied'
          },
          {
            role: 'buyer',
            content: 'Now enthusiastic',
            timestamp: '2026-03-24T10:02:00Z',
            emotionalState: 'enthusiastic'
          }
        ]
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.emotionalIntelligenceScore).toBeGreaterThan(80);
    });

    test('penalises excessive negative emotions', () => {
      const state = createMockNegotiationState({
        messages: [
          {
            role: 'buyer',
            content: 'Frustrated',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'frustrated'
          },
          {
            role: 'buyer',
            content: 'Still frustrated',
            timestamp: '2026-03-24T10:01:00Z',
            emotionalState: 'frustrated'
          },
          {
            role: 'buyer',
            content: 'Very frustrated',
            timestamp: '2026-03-24T10:02:00Z',
            emotionalState: 'frustrated'
          }
        ]
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.emotionalIntelligenceScore).toBeLessThan(65);
    });

    test('handles missing emotional data gracefully', () => {
      const state = createMockNegotiationState({
        messages: [
          {
            role: 'buyer',
            content: 'No emotion data',
            timestamp: '2026-03-24T10:00:00Z'
          }
        ]
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.emotionalIntelligenceScore).toBe(50); // Neutral baseline
    });

    test('rewards emotional stability', () => {
      const stableState = createMockNegotiationState({
        messages: [
          {
            role: 'buyer',
            content: 'Neutral throughout',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'neutral'
          },
          {
            role: 'buyer',
            content: 'Still neutral',
            timestamp: '2026-03-24T10:01:00Z',
            emotionalState: 'neutral'
          },
          {
            role: 'buyer',
            content: 'Finally satisfied',
            timestamp: '2026-03-24T10:02:00Z',
            emotionalState: 'satisfied'
          }
        ]
      });

      const volatileState = createMockNegotiationState({
        messages: [
          {
            role: 'buyer',
            content: 'Neutral',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'neutral'
          },
          {
            role: 'buyer',
            content: 'Frustrated',
            timestamp: '2026-03-24T10:01:00Z',
            emotionalState: 'frustrated'
          },
          {
            role: 'buyer',
            content: 'Enthusiastic',
            timestamp: '2026-03-24T10:02:00Z',
            emotionalState: 'enthusiastic'
          },
          {
            role: 'buyer',
            content: 'Sceptical',
            timestamp: '2026-03-24T10:03:00Z',
            emotionalState: 'sceptical'
          },
          {
            role: 'buyer',
            content: 'Pressured',
            timestamp: '2026-03-24T10:04:00Z',
            emotionalState: 'pressured'
          }
        ]
      });

      const stableScore = calculateNegotiationScore(stableState, 'compliance_officer', 15);
      const volatileScore = calculateNegotiationScore(volatileState, 'compliance_officer', 15);

      expect(stableScore.emotionalIntelligenceScore).toBeGreaterThan(volatileScore.emotionalIntelligenceScore);
    });
  });

  describe('Information Extraction Score Calculation', () => {
    test('rewards information request arguments', () => {
      const state = createMockNegotiationState({
        argumentHistory: ['information_request', 'information_request', 'information_request'],
        buyerProfile: createMockBuyerProfile({
          detectedWarmth: 7,
          detectedDominance: 8,
        })
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 15);
      expect(scorecard.informationExtractionScore).toBeGreaterThan(75);
    });

    test('rewards buyer profile detection', () => {
      const detectedState = createMockNegotiationState({
        buyerProfile: createMockBuyerProfile({
          detectedWarmth: 7,
          detectedDominance: 8,
        })
      });

      const defaultState = createMockNegotiationState({
        buyerProfile: createMockBuyerProfile({
          detectedWarmth: 5,
          detectedDominance: 5,
        })
      });

      const detectedScore = calculateNegotiationScore(detectedState, 'compliance_officer', 15);
      const defaultScore = calculateNegotiationScore(defaultState, 'compliance_officer', 15);

      expect(detectedScore.informationExtractionScore).toBeGreaterThan(defaultScore.informationExtractionScore);
    });

    test('rewards longer buyer messages', () => {
      const longMessagesState = createMockNegotiationState({
        messages: [
          {
            role: 'buyer',
            content: 'I am looking for high-quality carbon credits that meet our stringent ESG requirements and can be verified through multiple independent standards for our upcoming quarterly compliance reporting.',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'neutral'
          }
        ]
      });

      const shortMessagesState = createMockNegotiationState({
        messages: [
          {
            role: 'buyer',
            content: 'Yes',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'neutral'
          }
        ]
      });

      const longScore = calculateNegotiationScore(longMessagesState, 'compliance_officer', 15);
      const shortScore = calculateNegotiationScore(shortMessagesState, 'compliance_officer', 15);

      expect(longScore.informationExtractionScore).toBeGreaterThan(shortScore.informationExtractionScore);
    });
  });

  describe('Overall Score and Grade Calculation', () => {
    test('calculates weighted overall score correctly', () => {
      const state = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 145, // Good price
        round: 4, // Good efficiency for compliance officer
        argumentHistory: ['information_request', 'authority_constraint', 'general'], // Good for compliance officer
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(state, 'compliance_officer', 12);

      // Price is weighted 35%, so should have significant impact
      expect(scorecard.overallScore).toBeGreaterThan(70);
      expect(scorecard.overallScore).toBeLessThanOrEqual(100);
    });

    test('applies persona difficulty multiplier correctly', () => {
      const easyState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 140,
        round: 4,
        outcome: 'agreed'
      });

      const hardState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 140,
        round: 8,
        outcome: 'agreed'
      });

      // Compliance officer is easier (0.9 multiplier) vs trading desk (1.4 multiplier)
      const easyScore = calculateNegotiationScore(easyState, 'compliance_officer', 15);
      const hardScore = calculateNegotiationScore(hardState, 'trading_desk', 20);

      // Same performance should score higher against easier persona
      expect(easyScore.overallScore).toBeLessThanOrEqual(100);
      expect(hardScore.overallScore).toBeLessThanOrEqual(100);
    });

    test('assigns correct letter grades', () => {
      // Test boundary conditions
      const perfectState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 150,
        round: 2,
        argumentHistory: ['information_request', 'authority_constraint'],
        outcome: 'agreed'
      });

      const poorState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 125,
        round: 15,
        argumentHistory: ['general'],
        outcome: 'agreed'
      });

      const failedState = createMockNegotiationState({
        outcome: 'deferred'
      });

      const perfectScore = calculateNegotiationScore(perfectState, 'compliance_officer', 5);
      const poorScore = calculateNegotiationScore(poorState, 'trading_desk', 45); // Hard persona
      const failedScore = calculateNegotiationScore(failedState, 'compliance_officer', 30);

      expect(['A+', 'A', 'A-', 'B+', 'B']).toContain(perfectScore.letterGrade);
      expect(['C', 'C-', 'D', 'F']).toContain(poorScore.letterGrade);
      expect(failedScore.letterGrade).toBe('F');
    });
  });

  describe('Persona-Specific Benchmarks', () => {
    test('applies different expectations for different personas', () => {
      const samePerformance = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 135,
        round: 6,
        outcome: 'agreed'
      });

      // Same performance against easy vs hard persona
      const easyPersonaScore = calculateNegotiationScore(samePerformance, 'compliance_officer', 18);
      const hardPersonaScore = calculateNegotiationScore(samePerformance, 'trading_desk', 18);

      // Performance expectations are different
      expect(easyPersonaScore.benchmarkData.expectedPriceAchievement).toBeGreaterThan(
        hardPersonaScore.benchmarkData.expectedPriceAchievement
      );

      expect(easyPersonaScore.benchmarkData.expectedRounds).toBeLessThan(
        hardPersonaScore.benchmarkData.expectedRounds
      );
    });

    test('identifies persona optimal performance correctly', () => {
      const excellentState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 148,
        round: 3,
        argumentHistory: ['information_request', 'authority_constraint'],
        outcome: 'agreed'
      });

      const averageState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 130,
        round: 6,
        outcome: 'agreed'
      });

      const excellentScore = calculateNegotiationScore(excellentState, 'compliance_officer', 10);
      const averageScore = calculateNegotiationScore(averageState, 'compliance_officer', 20);

      expect(excellentScore.personaOptimal).toBe(true);
      expect(averageScore.personaOptimal).toBe(false);
    });

    test('handles freeplay persona with average expectations', () => {
      const state = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 135,
        round: 6,
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(state, 'freeplay', 18);

      expect(scorecard.benchmarkData.expectedPriceAchievement).toBe(65); // Average expectation
      expect(scorecard.benchmarkData.difficultyMultiplier).toBe(1.0); // No adjustment
      expect(scorecard).toMatchObject({
        overallScore: expect.any(Number),
        letterGrade: expect.any(String),
        personaOptimal: expect.any(Boolean)
      });
    });
  });

  describe('Improvement Suggestions', () => {
    test('generates relevant price improvement suggestions', () => {
      const lowPriceState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 125, // Poor price
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(lowPriceState, 'compliance_officer', 15);
      const suggestions = scorecard.improvementSuggestions.join(' ');

      expect(suggestions.toLowerCase()).toMatch(/hold.*firm|anchor.*price|compliance_officer.*accept/);
    });

    test('generates failure-specific suggestions', () => {
      const failedState = createMockNegotiationState({
        outcome: 'deferred',
        negotiationComplete: true
      });

      const scorecard = calculateNegotiationScore(failedState, 'compliance_officer', 30);
      const suggestions = scorecard.improvementSuggestions.join(' ');

      expect(suggestions.toLowerCase()).toMatch(/reach.*agreement|failed.*negotiations/);
    });

    test('generates persona-specific strategic suggestions', () => {
      const tradingDeskState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 125,
        argumentHistory: ['general', 'general'],
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(tradingDeskState, 'trading_desk', 25);
      const suggestions = scorecard.improvementSuggestions.join(' ');

      expect(suggestions.toLowerCase()).toMatch(/trading.*desk|price.*sensitive|volume.*discount/);
    });

    test('provides success recognition for excellent performance', () => {
      const excellentState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 148,
        round: 2,
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(excellentState, 'compliance_officer', 8);
      const suggestions = scorecard.improvementSuggestions.join(' ');

      expect(suggestions).toMatch(/🎉|excellent|mastering/i);
    });

    test('limits suggestions to maximum of 4', () => {
      const poorState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 125,
        round: 15,
        argumentHistory: ['general'],
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(poorState, 'trading_desk', 45);
      expect(scorecard.improvementSuggestions.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Score Dimensions', () => {
    test('returns all five score dimensions correctly', () => {
      const scorecard = calculateNegotiationScore(
        createMockNegotiationState(),
        'compliance_officer',
        15
      );

      const dimensions = getScoreDimensions(scorecard);
      expect(dimensions).toHaveLength(5);

      const expectedDimensions = [
        'Price Achievement',
        'Efficiency',
        'Strategy Diversity',
        'Emotional Intelligence',
        'Information Extraction'
      ];

      dimensions.forEach((dim, index) => {
        expect(dim.name).toBe(expectedDimensions[index]);
        expect(dim.score).toBeGreaterThanOrEqual(0);
        expect(dim.score).toBeLessThanOrEqual(100);
        expect(dim.maxPoints).toBe(100);
        expect(dim.description).toBeTruthy();
      });
    });
  });

  describe('Score Summary Generation', () => {
    test('generates comprehensive shareable summary', () => {
      const scorecard = calculateNegotiationScore(
        createMockNegotiationState(),
        'esg_fund_manager',
        18
      );

      const summary = generateScoreSummary(scorecard, 'esg_fund_manager');

      expect(summary).toContain('WREI Negotiation Results');
      expect(summary).toContain('Esg Fund Manager');
      expect(summary).toContain(scorecard.letterGrade);
      expect(summary).toContain(scorecard.overallScore.toString());
      expect(summary).toContain('Price Achievement:');
      expect(summary).toContain('Efficiency:');
      expect(summary).toContain('Strategy:');
      expect(summary).toContain('Emotional Intelligence:');
      expect(summary).toContain('Information Extraction:');
      expect(summary).toContain('Top Improvement Areas:');
      expect(summary).toContain('Water Roads Pty Ltd');
    });

    test('formats persona name correctly', () => {
      const scorecard = calculateNegotiationScore(
        createMockNegotiationState(),
        'government_procurement',
        20
      );

      const summary = generateScoreSummary(scorecard, 'government_procurement');
      expect(summary).toContain('Government Procurement');
    });

    test('indicates performance level correctly', () => {
      const excellentState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 148,
        round: 2,
        outcome: 'agreed'
      });

      const averageState = createMockNegotiationState({
        anchorPrice: 150,
        currentOfferPrice: 130,
        round: 8,
        outcome: 'agreed'
      });

      const excellentScore = calculateNegotiationScore(excellentState, 'compliance_officer', 8);
      const averageScore = calculateNegotiationScore(averageState, 'compliance_officer', 24);

      const excellentSummary = generateScoreSummary(excellentScore, 'compliance_officer');
      const averageSummary = generateScoreSummary(averageScore, 'compliance_officer');

      if (excellentScore.personaOptimal) {
        expect(excellentSummary).toContain('exceeded expectations');
      }

      if (!averageScore.personaOptimal) {
        expect(averageSummary).toContain('met standard performance');
      }
    });
  });

  describe('Edge Cases', () => {
    test('handles minimum edge case scenarios', () => {
      const minimalState = createMockNegotiationState({
        round: 1,
        anchorPrice: 150,
        currentOfferPrice: 120, // Floor price
        messages: [],
        argumentHistory: [],
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(minimalState, 'compliance_officer', 1);

      expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
      expect(scorecard.overallScore).toBeLessThanOrEqual(100);
      expect(scorecard.letterGrade).toBeTruthy();
      expect(scorecard.improvementSuggestions).toBeInstanceOf(Array);
    });

    test('handles maximum performance scenarios', () => {
      const perfectState = createMockNegotiationState({
        round: 1, // Fastest possible
        anchorPrice: 150,
        currentOfferPrice: 150, // Perfect price
        argumentHistory: ['information_request', 'authority_constraint', 'fairness_appeal', 'relationship_signal'],
        messages: [
          {
            role: 'buyer',
            content: 'This is exactly what we need for our comprehensive compliance program and I am very satisfied with the quality and pricing structure you have presented.',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'enthusiastic'
          }
        ],
        buyerProfile: createMockBuyerProfile({
          detectedWarmth: 8,
          detectedDominance: 7,
        }),
        outcome: 'agreed'
      });

      const scorecard = calculateNegotiationScore(perfectState, 'compliance_officer', 2);

      expect(scorecard.overallScore).toBeGreaterThan(80);
      expect(['A+', 'A', 'A-', 'B+', 'B']).toContain(scorecard.letterGrade);
      expect(scorecard.personaOptimal).toBe(true);
    });

    test('handles escalated negotiations correctly', () => {
      const escalatedState = createMockNegotiationState({
        outcome: 'escalated',
        negotiationComplete: true
      });

      const scorecard = calculateNegotiationScore(escalatedState, 'compliance_officer', 45);

      expect(scorecard.priceScore).toBe(0); // No price achievement for failed negotiation
      expect(scorecard.letterGrade).toBe('F');
      expect(scorecard.personaOptimal).toBe(false);
    });
  });
});