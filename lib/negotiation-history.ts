import { NegotiationState, PersonaType, NegotiationOutcome, Message, ArgumentClassification, EmotionalState } from './types';

/**
 * Represents a completed negotiation session with all its context
 */
export interface NegotiationSession {
  id: string;
  persona: PersonaType | 'freeplay';
  startTime: string;
  endTime?: string;
  messages: Message[];
  finalState: NegotiationState;
  outcome: NegotiationOutcome;
  metrics: NegotiationMetrics;
  stateHistory: NegotiationStateSnapshot[];
}

/**
 * Key performance metrics for a negotiation session
 */
export interface NegotiationMetrics {
  finalPrice: number;
  anchorPrice: number;
  priceFloor: number;
  totalRounds: number;
  concessionsMade: number;
  totalConcessionPercentage: number;
  averageConcessionPerRound: number;
  roundsToFirstConcession: number;
  argumentTypes: Record<ArgumentClassification, number>;
  emotionalProgression: EmotionalState[];
  duration: number; // minutes
  outcomeSuccess: boolean; // true if agreed, false if deferred/escalated
}

/**
 * State snapshot at a specific point in the negotiation
 */
export interface NegotiationStateSnapshot {
  round: number;
  timestamp: string;
  currentPrice: number;
  phase: string;
  emotionalState: EmotionalState;
  messageCount: number;
  totalConcessionSoFar: number;
}

/**
 * Comparison analysis between two negotiation sessions
 */
export interface SessionComparison {
  session1: NegotiationSession;
  session2: NegotiationSession;
  priceComparison: {
    finalPriceDifference: number;
    concessionDifference: number;
    efficiencyDifference: number; // price per round
  };
  strategyComparison: {
    roundsComparison: number;
    argumentDistribution1: Record<ArgumentClassification, number>;
    argumentDistribution2: Record<ArgumentClassification, number>;
    emotionalPatternSimilarity: number; // 0-1
  };
  outcomeComparison: {
    bothSuccessful: boolean;
    winnerSession: 'session1' | 'session2' | 'tie';
    successFactors: string[];
  };
}

/**
 * In-memory negotiation history manager
 * Complies with CLAUDE.md no-localStorage rule
 */
export class NegotiationHistoryManager {
  private sessions: NegotiationSession[] = [];
  private readonly maxSessions = 10; // Memory-safe limit

  /**
   * Add a completed negotiation session to history
   */
  addSession(session: Omit<NegotiationSession, 'id' | 'metrics' | 'stateHistory'>): string {
    const id = this.generateSessionId();
    const metrics = this.calculateMetrics(session.finalState, session.messages, session.startTime, session.endTime);
    const stateHistory = this.extractStateHistory(session.finalState);

    const completeSession: NegotiationSession = {
      ...session,
      id,
      metrics,
      stateHistory
    };

    this.sessions.unshift(completeSession); // Add to front (most recent first)

    // Enforce maximum session limit
    if (this.sessions.length > this.maxSessions) {
      this.sessions = this.sessions.slice(0, this.maxSessions);
    }

    return id;
  }

  /**
   * Retrieve a specific session by ID
   */
  getSession(id: string): NegotiationSession | null {
    return this.sessions.find(session => session.id === id) || null;
  }

  /**
   * Get all sessions, optionally filtered by persona
   */
  getAllSessions(persona?: PersonaType | 'freeplay'): NegotiationSession[] {
    if (persona) {
      return this.sessions.filter(session => session.persona === persona);
    }
    return [...this.sessions]; // Return copy to prevent external modification
  }

  /**
   * Get recent sessions (up to limit)
   */
  getRecentSessions(limit: number = 5): NegotiationSession[] {
    return this.sessions.slice(0, limit);
  }

  /**
   * Compare two sessions and return detailed analysis
   */
  compareSessions(sessionId1: string, sessionId2: string): SessionComparison | null {
    const session1 = this.getSession(sessionId1);
    const session2 = this.getSession(sessionId2);

    if (!session1 || !session2) {
      return null;
    }

    const priceComparison = {
      finalPriceDifference: session1.metrics.finalPrice - session2.metrics.finalPrice,
      concessionDifference: session1.metrics.totalConcessionPercentage - session2.metrics.totalConcessionPercentage,
      efficiencyDifference: (session1.metrics.finalPrice / session1.metrics.totalRounds) -
                           (session2.metrics.finalPrice / session2.metrics.totalRounds)
    };

    const strategyComparison = {
      roundsComparison: session1.metrics.totalRounds - session2.metrics.totalRounds,
      argumentDistribution1: session1.metrics.argumentTypes,
      argumentDistribution2: session2.metrics.argumentTypes,
      emotionalPatternSimilarity: this.calculateEmotionalSimilarity(
        session1.metrics.emotionalProgression,
        session2.metrics.emotionalProgression
      )
    };

    const outcomeComparison = {
      bothSuccessful: session1.metrics.outcomeSuccess && session2.metrics.outcomeSuccess,
      winnerSession: this.determineWinner(session1, session2),
      successFactors: this.identifySuccessFactors(session1, session2)
    };

    return {
      session1,
      session2,
      priceComparison,
      strategyComparison,
      outcomeComparison
    };
  }

  /**
   * Get summary statistics across all sessions
   */
  getGlobalStats() {
    if (this.sessions.length === 0) {
      return null;
    }

    const successfulSessions = this.sessions.filter(s => s.metrics.outcomeSuccess);
    const averageFinalPrice = this.sessions.reduce((sum, s) => sum + s.metrics.finalPrice, 0) / this.sessions.length;
    const averageRounds = this.sessions.reduce((sum, s) => sum + s.metrics.totalRounds, 0) / this.sessions.length;
    const successRate = successfulSessions.length / this.sessions.length;

    const personaPerformance = this.sessions.reduce((acc, session) => {
      if (!acc[session.persona]) {
        acc[session.persona] = { count: 0, avgPrice: 0, successCount: 0 };
      }
      acc[session.persona].count++;
      acc[session.persona].avgPrice = (acc[session.persona].avgPrice * (acc[session.persona].count - 1) + session.metrics.finalPrice) / acc[session.persona].count;
      if (session.metrics.outcomeSuccess) {
        acc[session.persona].successCount++;
      }
      return acc;
    }, {} as Record<string, { count: number; avgPrice: number; successCount: number }>);

    return {
      totalSessions: this.sessions.length,
      successRate,
      averageFinalPrice,
      averageRounds,
      personaPerformance,
      bestPerformingPersona: Object.entries(personaPerformance)
        .sort(([,a], [,b]) => b.avgPrice - a.avgPrice)[0]?.[0] || null,
      mostSuccessfulPersona: Object.entries(personaPerformance)
        .sort(([,a], [,b]) => (b.successCount/b.count) - (a.successCount/a.count))[0]?.[0] || null
    };
  }

  /**
   * Clear all session history
   */
  clearHistory(): void {
    this.sessions = [];
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Calculate comprehensive metrics for a negotiation session
   */
  private calculateMetrics(
    finalState: NegotiationState,
    messages: Message[],
    startTime: string,
    endTime?: string
  ): NegotiationMetrics {
    const startTimestamp = new Date(startTime);
    const endTimestamp = endTime ? new Date(endTime) : new Date();
    const duration = (endTimestamp.getTime() - startTimestamp.getTime()) / (1000 * 60); // minutes

    const argumentTypes = finalState.argumentHistory.reduce((acc, arg) => {
      acc[arg] = (acc[arg] || 0) + 1;
      return acc;
    }, {} as Record<ArgumentClassification, number>);

    // Fill in missing argument types with 0
    const allArgumentTypes: ArgumentClassification[] = [
      'price_challenge', 'fairness_appeal', 'time_pressure', 'information_request',
      'relationship_signal', 'authority_constraint', 'emotional_expression', 'general'
    ];
    allArgumentTypes.forEach(type => {
      if (!(type in argumentTypes)) {
        argumentTypes[type] = 0;
      }
    });

    const emotionalProgression = messages
      .filter(m => m.emotionalState)
      .map(m => m.emotionalState!)
      .filter((state, index, arr) => arr.indexOf(state) === index); // Remove duplicates

    const totalConcessionPercentage = (finalState.anchorPrice - finalState.currentOfferPrice) / finalState.anchorPrice * 100;
    const concessionsMade = Math.floor(totalConcessionPercentage / (finalState.maxConcessionPerRound * 100));
    const roundsToFirstConcession = finalState.roundsSinceLastConcession > 0
      ? finalState.round - finalState.roundsSinceLastConcession
      : finalState.minimumRoundsBeforeConcession;

    return {
      finalPrice: finalState.currentOfferPrice,
      anchorPrice: finalState.anchorPrice,
      priceFloor: finalState.priceFloor,
      totalRounds: finalState.round,
      concessionsMade,
      totalConcessionPercentage,
      averageConcessionPerRound: concessionsMade > 0 ? totalConcessionPercentage / concessionsMade : 0,
      roundsToFirstConcession,
      argumentTypes,
      emotionalProgression,
      duration,
      outcomeSuccess: finalState.outcome === 'agreed'
    };
  }

  /**
   * Extract state snapshots from negotiation state
   */
  private extractStateHistory(finalState: NegotiationState): NegotiationStateSnapshot[] {
    // Since we don't have full historical state, create snapshots based on messages
    const snapshots: NegotiationStateSnapshot[] = [];
    const messages = finalState.messages;

    messages.forEach((message, index) => {
      // Estimate state at this point in the negotiation
      const round = Math.floor(index / 2) + 1; // Rough approximation
      const timestamp = message.timestamp;

      // Price estimation - this is a simplified approximation
      const progressRatio = messages.length > 1 ? index / (messages.length - 1) : 0;
      const totalConcession = finalState.anchorPrice - finalState.currentOfferPrice;
      const currentPrice = finalState.anchorPrice - (totalConcession * progressRatio);
      const clampedPrice = Math.max(currentPrice, finalState.priceFloor);

      snapshots.push({
        round,
        timestamp,
        currentPrice: clampedPrice,
        phase: finalState.phase,
        emotionalState: message.emotionalState || 'neutral',
        messageCount: index + 1,
        totalConcessionSoFar: (finalState.anchorPrice - clampedPrice) / finalState.anchorPrice * 100
      });
    });

    return snapshots;
  }

  /**
   * Calculate similarity between two emotional progressions (0-1)
   */
  private calculateEmotionalSimilarity(
    progression1: EmotionalState[],
    progression2: EmotionalState[]
  ): number {
    if (progression1.length === 0 && progression2.length === 0) return 1;
    if (progression1.length === 0 || progression2.length === 0) return 0;

    const maxLength = Math.max(progression1.length, progression2.length);
    let matches = 0;

    for (let i = 0; i < maxLength; i++) {
      const state1 = progression1[Math.min(i, progression1.length - 1)];
      const state2 = progression2[Math.min(i, progression2.length - 1)];
      if (state1 === state2) matches++;
    }

    return matches / maxLength;
  }

  /**
   * Determine which session performed better
   */
  private determineWinner(
    session1: NegotiationSession,
    session2: NegotiationSession
  ): 'session1' | 'session2' | 'tie' {
    // Primary criteria: outcome success
    if (session1.metrics.outcomeSuccess && !session2.metrics.outcomeSuccess) return 'session1';
    if (!session1.metrics.outcomeSuccess && session2.metrics.outcomeSuccess) return 'session2';

    // Secondary criteria: final price (higher is better)
    if (session1.metrics.finalPrice > session2.metrics.finalPrice) return 'session1';
    if (session2.metrics.finalPrice > session1.metrics.finalPrice) return 'session2';

    // Tertiary criteria: efficiency (fewer rounds to close)
    if (session1.metrics.totalRounds < session2.metrics.totalRounds) return 'session1';
    if (session2.metrics.totalRounds < session1.metrics.totalRounds) return 'session2';

    return 'tie';
  }

  /**
   * Identify key success factors by comparing sessions
   */
  private identifySuccessFactors(
    session1: NegotiationSession,
    session2: NegotiationSession
  ): string[] {
    const factors: string[] = [];
    const winner = this.determineWinner(session1, session2);

    if (winner === 'tie') {
      factors.push('Both sessions achieved similar outcomes');
      return factors;
    }

    const winnerSession = winner === 'session1' ? session1 : session2;
    const loserSession = winner === 'session1' ? session2 : session1;

    if (winnerSession.metrics.outcomeSuccess && !loserSession.metrics.outcomeSuccess) {
      factors.push('Successfully reached agreement vs. deferral/escalation');
    }

    if (winnerSession.metrics.finalPrice > loserSession.metrics.finalPrice) {
      const priceDiff = ((winnerSession.metrics.finalPrice - loserSession.metrics.finalPrice) / loserSession.metrics.finalPrice * 100).toFixed(1);
      factors.push(`Achieved ${priceDiff}% higher final price`);
    }

    if (winnerSession.metrics.totalRounds < loserSession.metrics.totalRounds) {
      const roundDiff = loserSession.metrics.totalRounds - winnerSession.metrics.totalRounds;
      factors.push(`Closed deal ${roundDiff} round${roundDiff > 1 ? 's' : ''} faster`);
    }

    if (winnerSession.metrics.roundsToFirstConcession > loserSession.metrics.roundsToFirstConcession) {
      factors.push('Held firm longer before making first concession');
    }

    return factors;
  }
}

// Global singleton instance for the application
export const negotiationHistoryManager = new NegotiationHistoryManager();

// Utility functions for easy integration
export const addNegotiationSession = (session: Omit<NegotiationSession, 'id' | 'metrics' | 'stateHistory'>) => {
  return negotiationHistoryManager.addSession(session);
};

export const getAllNegotiationSessions = () => {
  return negotiationHistoryManager.getAllSessions();
};

export const getNegotiationSession = (id: string) => {
  return negotiationHistoryManager.getSession(id);
};

export const compareNegotiationSessions = (id1: string, id2: string) => {
  return negotiationHistoryManager.compareSessions(id1, id2);
};

export const getNegotiationGlobalStats = () => {
  return negotiationHistoryManager.getGlobalStats();
};