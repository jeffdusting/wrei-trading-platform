import {
  NegotiationHistoryManager,
  NegotiationSession,
  addNegotiationSession,
  getAllNegotiationSessions,
  getNegotiationSession,
  compareNegotiationSessions,
  getNegotiationGlobalStats
} from '@/lib/negotiation-history';
import { NegotiationState, PersonaType, ArgumentClassification, EmotionalState } from '@/lib/types';

describe('NegotiationHistoryManager', () => {
  let manager: NegotiationHistoryManager;

  // Mock negotiation data helpers
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
        content: 'I need a better price',
        timestamp: '2026-03-24T10:00:00Z',
        argumentClassification: 'price_challenge',
        emotionalState: 'frustrated'
      },
      {
        role: 'agent',
        content: 'Let me see what I can do',
        timestamp: '2026-03-24T10:01:00Z',
        emotionalState: 'neutral'
      }
    ],
    buyerProfile: {
      persona: 'compliance_officer',
      detectedWarmth: 6,
      detectedAssertiveness: 8,
      adaptedApproach: 'direct_authoritative'
    },
    argumentHistory: ['price_challenge', 'information_request', 'price_challenge'],
    emotionalState: 'satisfied',
    negotiationComplete: true,
    outcome: 'agreed',
    ...overrides
  });

  const createMockSession = (overrides: Partial<Omit<NegotiationSession, 'id' | 'metrics' | 'stateHistory'>> = {}) => ({
    persona: 'compliance_officer' as PersonaType,
    startTime: '2026-03-24T10:00:00Z',
    endTime: '2026-03-24T10:15:00Z',
    messages: [
      {
        role: 'buyer' as const,
        content: 'I need carbon credits for compliance',
        timestamp: '2026-03-24T10:00:00Z',
        argumentClassification: 'information_request' as ArgumentClassification,
        emotionalState: 'neutral' as EmotionalState
      },
      {
        role: 'agent' as const,
        content: 'I can offer WREI-verified credits at competitive rates',
        timestamp: '2026-03-24T10:01:00Z',
        emotionalState: 'neutral' as EmotionalState
      }
    ],
    finalState: createMockNegotiationState(),
    outcome: 'agreed' as const,
    ...overrides
  });

  beforeEach(() => {
    manager = new NegotiationHistoryManager();
  });

  describe('Session Management', () => {
    test('should add a session and generate unique ID', () => {
      const session = createMockSession();
      const id = manager.addSession(session);

      expect(id).toBeDefined();
      expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);

      const retrieved = manager.getSession(id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.persona).toBe('compliance_officer');
      expect(retrieved!.outcome).toBe('agreed');
    });

    test('should return null for non-existent session', () => {
      const session = manager.getSession('non-existent-id');
      expect(session).toBeNull();
    });

    test('should retrieve all sessions', () => {
      const session1 = createMockSession({ persona: 'compliance_officer' });
      const session2 = createMockSession({ persona: 'esg_fund_manager' });

      const id1 = manager.addSession(session1);
      const id2 = manager.addSession(session2);

      const allSessions = manager.getAllSessions();
      expect(allSessions).toHaveLength(2);
      expect(allSessions[0].id).toBe(id2); // Most recent first
      expect(allSessions[1].id).toBe(id1);
    });

    test('should filter sessions by persona', () => {
      const session1 = createMockSession({ persona: 'compliance_officer' });
      const session2 = createMockSession({ persona: 'esg_fund_manager' });
      const session3 = createMockSession({ persona: 'compliance_officer' });

      manager.addSession(session1);
      manager.addSession(session2);
      manager.addSession(session3);

      const complianceSessions = manager.getAllSessions('compliance_officer');
      expect(complianceSessions).toHaveLength(2);
      expect(complianceSessions.every(s => s.persona === 'compliance_officer')).toBe(true);

      const esgSessions = manager.getAllSessions('esg_fund_manager');
      expect(esgSessions).toHaveLength(1);
      expect(esgSessions[0].persona).toBe('esg_fund_manager');
    });

    test('should get recent sessions with limit', () => {
      // Add 7 sessions
      for (let i = 0; i < 7; i++) {
        manager.addSession(createMockSession({ persona: 'compliance_officer' }));
      }

      const recent3 = manager.getRecentSessions(3);
      expect(recent3).toHaveLength(3);

      const recent10 = manager.getRecentSessions(10);
      expect(recent10).toHaveLength(7); // All available sessions
    });

    test('should enforce maximum session limit', () => {
      // Add 12 sessions (exceeding the limit of 10)
      const sessionIds: string[] = [];
      for (let i = 0; i < 12; i++) {
        const id = manager.addSession(createMockSession({
          persona: 'compliance_officer',
          startTime: `2026-03-24T10:${i.toString().padStart(2, '0')}:00Z`
        }));
        sessionIds.push(id);
      }

      const allSessions = manager.getAllSessions();
      expect(allSessions).toHaveLength(10); // Should be capped at 10

      // First two sessions (oldest) should have been removed
      expect(manager.getSession(sessionIds[0])).toBeNull();
      expect(manager.getSession(sessionIds[1])).toBeNull();

      // Most recent should still exist
      expect(manager.getSession(sessionIds[11])).not.toBeNull();
    });

    test('should clear all sessions', () => {
      manager.addSession(createMockSession());
      manager.addSession(createMockSession());

      expect(manager.getAllSessions()).toHaveLength(2);

      manager.clearHistory();
      expect(manager.getAllSessions()).toHaveLength(0);
    });
  });

  describe('Metrics Calculation', () => {
    test('should calculate correct metrics for a session', () => {
      const session = createMockSession({
        startTime: '2026-03-24T10:00:00Z',
        endTime: '2026-03-24T10:15:00Z', // 15 minutes
        finalState: createMockNegotiationState({
          round: 8,
          anchorPrice: 150,
          currentOfferPrice: 135,
          outcome: 'agreed',
          argumentHistory: ['price_challenge', 'price_challenge', 'information_request', 'fairness_appeal']
        })
      });

      const id = manager.addSession(session);
      const retrieved = manager.getSession(id)!;

      expect(retrieved.metrics.finalPrice).toBe(135);
      expect(retrieved.metrics.anchorPrice).toBe(150);
      expect(retrieved.metrics.totalRounds).toBe(8);
      expect(retrieved.metrics.outcomeSuccess).toBe(true);
      expect(retrieved.metrics.duration).toBe(15); // 15 minutes
      expect(retrieved.metrics.totalConcessionPercentage).toBeCloseTo(10, 1); // (150-135)/150 * 100

      // Argument type counts
      expect(retrieved.metrics.argumentTypes.price_challenge).toBe(2);
      expect(retrieved.metrics.argumentTypes.information_request).toBe(1);
      expect(retrieved.metrics.argumentTypes.fairness_appeal).toBe(1);
      expect(retrieved.metrics.argumentTypes.general).toBe(0);
    });

    test('should handle unsuccessful negotiations', () => {
      const session = createMockSession({
        outcome: 'deferred',
        finalState: createMockNegotiationState({
          outcome: 'deferred',
          negotiationComplete: false
        })
      });

      const id = manager.addSession(session);
      const retrieved = manager.getSession(id)!;

      expect(retrieved.metrics.outcomeSuccess).toBe(false);
      expect(retrieved.outcome).toBe('deferred');
    });

    test('should extract state history snapshots', () => {
      const customMessages = [
        {
          role: 'buyer' as const,
          content: 'First message',
          timestamp: '2026-03-24T10:00:00Z',
          argumentClassification: 'information_request' as ArgumentClassification,
          emotionalState: 'neutral' as EmotionalState
        },
        {
          role: 'agent' as const,
          content: 'Second message',
          timestamp: '2026-03-24T10:01:00Z',
          emotionalState: 'neutral' as EmotionalState
        },
        {
          role: 'buyer' as const,
          content: 'Third message',
          timestamp: '2026-03-24T10:02:00Z',
          argumentClassification: 'price_challenge' as ArgumentClassification,
          emotionalState: 'frustrated' as EmotionalState
        }
      ];

      const session = createMockSession({
        messages: customMessages,
        finalState: createMockNegotiationState({
          messages: customMessages
        })
      });

      const id = manager.addSession(session);
      const retrieved = manager.getSession(id)!;

      expect(retrieved.stateHistory).toHaveLength(3);
      expect(retrieved.stateHistory[0].messageCount).toBe(1);
      expect(retrieved.stateHistory[1].messageCount).toBe(2);
      expect(retrieved.stateHistory[2].messageCount).toBe(3);
      expect(retrieved.stateHistory[2].emotionalState).toBe('frustrated');
    });
  });

  describe('Session Comparison', () => {
    test('should compare two sessions successfully', () => {
      const session1 = createMockSession({
        persona: 'compliance_officer',
        finalState: createMockNegotiationState({
          round: 6,
          anchorPrice: 150,
          currentOfferPrice: 140,
          outcome: 'agreed',
          argumentHistory: ['price_challenge', 'information_request']
        })
      });

      const session2 = createMockSession({
        persona: 'esg_fund_manager',
        finalState: createMockNegotiationState({
          round: 8,
          anchorPrice: 150,
          currentOfferPrice: 130,
          outcome: 'agreed',
          argumentHistory: ['price_challenge', 'price_challenge', 'fairness_appeal']
        })
      });

      const id1 = manager.addSession(session1);
      const id2 = manager.addSession(session2);

      const comparison = manager.compareSessions(id1, id2);
      expect(comparison).not.toBeNull();

      expect(comparison!.priceComparison.finalPriceDifference).toBe(10); // 140 - 130
      expect(comparison!.strategyComparison.roundsComparison).toBe(-2); // 6 - 8
      expect(comparison!.outcomeComparison.bothSuccessful).toBe(true);
      expect(comparison!.outcomeComparison.winnerSession).toBe('session1'); // Higher final price
    });

    test('should return null when comparing non-existent sessions', () => {
      const session = createMockSession();
      const id = manager.addSession(session);

      expect(manager.compareSessions(id, 'non-existent')).toBeNull();
      expect(manager.compareSessions('non-existent-1', 'non-existent-2')).toBeNull();
    });

    test('should identify winner correctly based on success vs failure', () => {
      const successfulSession = createMockSession({
        finalState: createMockNegotiationState({
          currentOfferPrice: 130,
          outcome: 'agreed'
        })
      });

      const failedSession = createMockSession({
        finalState: createMockNegotiationState({
          currentOfferPrice: 145, // Higher price but failed
          outcome: 'deferred'
        })
      });

      const id1 = manager.addSession(successfulSession);
      const id2 = manager.addSession(failedSession);

      const comparison = manager.compareSessions(id1, id2);
      expect(comparison!.outcomeComparison.winnerSession).toBe('session1'); // Success beats higher price
      expect(comparison!.outcomeComparison.bothSuccessful).toBe(false);
    });

    test('should determine tie correctly', () => {
      const session1 = createMockSession({
        finalState: createMockNegotiationState({
          round: 6,
          currentOfferPrice: 135,
          outcome: 'agreed'
        })
      });

      const session2 = createMockSession({
        finalState: createMockNegotiationState({
          round: 6,
          currentOfferPrice: 135,
          outcome: 'agreed'
        })
      });

      const id1 = manager.addSession(session1);
      const id2 = manager.addSession(session2);

      const comparison = manager.compareSessions(id1, id2);
      expect(comparison!.outcomeComparison.winnerSession).toBe('tie');
    });

    test('should identify success factors', () => {
      const betterSession = createMockSession({
        finalState: createMockNegotiationState({
          round: 5,
          anchorPrice: 150,
          currentOfferPrice: 140,
          outcome: 'agreed'
        })
      });

      const worseSession = createMockSession({
        finalState: createMockNegotiationState({
          round: 8,
          anchorPrice: 150,
          currentOfferPrice: 130,
          outcome: 'agreed'
        })
      });

      const id1 = manager.addSession(betterSession);
      const id2 = manager.addSession(worseSession);

      const comparison = manager.compareSessions(id1, id2);
      const successFactors = comparison!.outcomeComparison.successFactors;

      expect(successFactors).toContain('Achieved 7.7% higher final price');
      expect(successFactors).toContain('Closed deal 3 rounds faster');
    });

    test('should calculate emotional pattern similarity', () => {
      const session1 = createMockSession({
        messages: [
          {
            role: 'buyer',
            content: 'Test',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'neutral'
          },
          {
            role: 'buyer',
            content: 'Test',
            timestamp: '2026-03-24T10:01:00Z',
            emotionalState: 'frustrated'
          }
        ]
      });

      const session2 = createMockSession({
        messages: [
          {
            role: 'buyer',
            content: 'Test',
            timestamp: '2026-03-24T10:00:00Z',
            emotionalState: 'neutral'
          },
          {
            role: 'buyer',
            content: 'Test',
            timestamp: '2026-03-24T10:01:00Z',
            emotionalState: 'frustrated'
          }
        ]
      });

      const id1 = manager.addSession(session1);
      const id2 = manager.addSession(session2);

      const comparison = manager.compareSessions(id1, id2);
      expect(comparison!.strategyComparison.emotionalPatternSimilarity).toBe(1.0); // Identical patterns
    });
  });

  describe('Global Statistics', () => {
    test('should return null for empty history', () => {
      const stats = manager.getGlobalStats();
      expect(stats).toBeNull();
    });

    test('should calculate correct global statistics', () => {
      // Add 3 sessions with different outcomes and personas
      manager.addSession(createMockSession({
        persona: 'compliance_officer',
        finalState: createMockNegotiationState({
          round: 6,
          currentOfferPrice: 140,
          outcome: 'agreed'
        })
      }));

      manager.addSession(createMockSession({
        persona: 'compliance_officer',
        finalState: createMockNegotiationState({
          round: 8,
          currentOfferPrice: 130,
          outcome: 'deferred'
        })
      }));

      manager.addSession(createMockSession({
        persona: 'esg_fund_manager',
        finalState: createMockNegotiationState({
          round: 5,
          currentOfferPrice: 145,
          outcome: 'agreed'
        })
      }));

      const stats = manager.getGlobalStats();
      expect(stats).not.toBeNull();
      expect(stats!.totalSessions).toBe(3);
      expect(stats!.successRate).toBeCloseTo(0.67, 2); // 2 out of 3 successful
      expect(stats!.averageFinalPrice).toBeCloseTo(138.33, 2); // (140 + 130 + 145) / 3
      expect(stats!.averageRounds).toBeCloseTo(6.33, 2); // (6 + 8 + 5) / 3

      expect(stats!.personaPerformance.compliance_officer.count).toBe(2);
      expect(stats!.personaPerformance.compliance_officer.successCount).toBe(1);
      expect(stats!.personaPerformance.esg_fund_manager.count).toBe(1);
      expect(stats!.personaPerformance.esg_fund_manager.successCount).toBe(1);

      expect(stats!.bestPerformingPersona).toBe('esg_fund_manager'); // Highest avg price (145)
      expect(stats!.mostSuccessfulPersona).toBe('esg_fund_manager'); // 100% success rate
    });
  });

  describe('Utility Functions', () => {
    // Import the global manager to clear it between tests
    const { negotiationHistoryManager } = require('@/lib/negotiation-history');

    beforeEach(() => {
      // Clear global history before each utility test
      negotiationHistoryManager.clearHistory();
    });

    test('addNegotiationSession utility function should work', () => {
      const session = createMockSession();
      const id = addNegotiationSession(session);
      expect(id).toBeDefined();
      expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    test('getAllNegotiationSessions utility function should work', () => {
      addNegotiationSession(createMockSession());
      addNegotiationSession(createMockSession());

      const sessions = getAllNegotiationSessions();
      expect(sessions).toHaveLength(2);
    });

    test('getNegotiationSession utility function should work', () => {
      const id = addNegotiationSession(createMockSession());
      const session = getNegotiationSession(id);
      expect(session).not.toBeNull();
      expect(session!.id).toBe(id);
    });

    test('compareNegotiationSessions utility function should work', () => {
      const id1 = addNegotiationSession(createMockSession());
      const id2 = addNegotiationSession(createMockSession());

      const comparison = compareNegotiationSessions(id1, id2);
      expect(comparison).not.toBeNull();
      expect(comparison!.session1.id).toBe(id1);
      expect(comparison!.session2.id).toBe(id2);
    });

    test('getNegotiationGlobalStats utility function should work', () => {
      addNegotiationSession(createMockSession());
      const stats = getNegotiationGlobalStats();
      expect(stats).not.toBeNull();
      expect(stats!.totalSessions).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle session with no messages', () => {
      const session = createMockSession({
        messages: [],
        finalState: createMockNegotiationState({
          messages: [],
          argumentHistory: []
        })
      });

      const id = manager.addSession(session);
      const retrieved = manager.getSession(id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.stateHistory).toHaveLength(0);
      expect(retrieved!.metrics.emotionalProgression).toHaveLength(0);
    });

    test('should handle sessions with identical outcomes', () => {
      const session1 = createMockSession({
        finalState: createMockNegotiationState({
          round: 6,
          currentOfferPrice: 135,
          outcome: 'agreed'
        })
      });

      const session2 = createMockSession({
        finalState: createMockNegotiationState({
          round: 6,
          currentOfferPrice: 135,
          outcome: 'agreed'
        })
      });

      const id1 = manager.addSession(session1);
      const id2 = manager.addSession(session2);

      const comparison = manager.compareSessions(id1, id2);
      expect(comparison!.priceComparison.finalPriceDifference).toBe(0);
      expect(comparison!.strategyComparison.roundsComparison).toBe(0);
      expect(comparison!.outcomeComparison.winnerSession).toBe('tie');
      expect(comparison!.outcomeComparison.successFactors).toContain('Both sessions achieved similar outcomes');
    });

    test('should handle single session global stats', () => {
      manager.addSession(createMockSession({
        persona: 'compliance_officer',
        finalState: createMockNegotiationState({
          currentOfferPrice: 140,
          outcome: 'agreed'
        })
      }));

      const stats = manager.getGlobalStats();
      expect(stats!.totalSessions).toBe(1);
      expect(stats!.successRate).toBe(1.0);
      expect(stats!.averageFinalPrice).toBe(140);
      expect(stats!.bestPerformingPersona).toBe('compliance_officer');
      expect(stats!.mostSuccessfulPersona).toBe('compliance_officer');
    });

    test('should handle freeplay persona', () => {
      const session = createMockSession({
        persona: 'freeplay',
        finalState: createMockNegotiationState({
          buyerProfile: {
            persona: 'freeplay',
            detectedWarmth: 5,
            detectedAssertiveness: 5,
            adaptedApproach: 'balanced'
          }
        })
      });

      const id = manager.addSession(session);
      const retrieved = manager.getSession(id);
      expect(retrieved!.persona).toBe('freeplay');

      const freeplaySessions = manager.getAllSessions('freeplay');
      expect(freeplaySessions).toHaveLength(1);
    });
  });
});