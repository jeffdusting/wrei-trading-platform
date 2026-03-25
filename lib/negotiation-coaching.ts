/**
 * WREI Real-Time Coaching Engine
 *
 * Provides contextual coaching suggestions for human buyers during negotiations
 * Analyzes negotiation state and generates tactical recommendations
 * A2: Real-Time Coaching Panel Enhancement
 */

import {
  NegotiationState,
  PersonaType,
  NegotiationPhase,
  ArgumentClassification,
  EmotionalState,
  WREITokenType,
  InvestorClassification
} from './types';

export type CoachingCategory =
  | 'price_tactics'
  | 'information_gathering'
  | 'relationship_building'
  | 'timing'
  | 'risk_management'
  | 'compliance';

export type CoachingPriority = 'high' | 'medium' | 'low';

export type CoachingDifficulty = 'beginner' | 'advanced';

export interface CoachingSuggestion {
  id: string;
  category: CoachingCategory;
  priority: CoachingPriority;
  title: string;
  content: string;
  rationale: string;
  difficulty: CoachingDifficulty;
  actionable: boolean;
  timing?: string; // When to use this suggestion
  expectedImpact: string;
  riskLevel: 'low' | 'medium' | 'high';
  personaSpecific?: boolean;
}

export interface CoachingRecommendation {
  quickTip: CoachingSuggestion;
  prioritizedSuggestions: CoachingSuggestion[];
  phaseGuidance: string;
  warningFlags: string[];
  nextBestActions: string[];
}

export interface CoachingContext {
  negotiationState: NegotiationState;
  difficulty: CoachingDifficulty;
  focusAreas?: CoachingCategory[];
  suppressedCategories?: CoachingCategory[];
}

export interface CoachingHistoryEntry {
  timestamp: string;
  round: number;
  suggestion: CoachingSuggestion;
  adopted: boolean;
  outcome?: string;
}

/**
 * Core coaching engine that analyzes negotiation state and provides suggestions
 */
export class NegotiationCoachingEngine {
  private suggestionCounter = 0;

  /**
   * Generate coaching recommendations for current negotiation state
   */
  generateCoaching(context: CoachingContext): CoachingRecommendation {
    const { negotiationState, difficulty, focusAreas, suppressedCategories } = context;

    // Generate all available suggestions
    const allSuggestions = this.generateAllSuggestions(negotiationState, difficulty);

    // Filter suggestions based on focus areas and suppressed categories
    const filteredSuggestions = this.filterSuggestions(
      allSuggestions,
      focusAreas,
      suppressedCategories
    );

    // Prioritize suggestions based on current context
    const prioritizedSuggestions = this.prioritizeSuggestions(
      filteredSuggestions,
      negotiationState
    );

    // Generate quick tip (most urgent action)
    const quickTip = this.generateQuickTip(prioritizedSuggestions, negotiationState);

    // Generate phase-specific guidance
    const phaseGuidance = this.generatePhaseGuidance(negotiationState, difficulty);

    // Identify warning flags
    const warningFlags = this.identifyWarningFlags(negotiationState);

    // Generate next best actions
    const nextBestActions = this.generateNextBestActions(
      prioritizedSuggestions.slice(0, 3),
      negotiationState
    );

    return {
      quickTip,
      prioritizedSuggestions: prioritizedSuggestions.slice(0, 3), // Top 3 suggestions
      phaseGuidance,
      warningFlags,
      nextBestActions,
    };
  }

  /**
   * Generate all possible coaching suggestions for current state
   */
  private generateAllSuggestions(
    state: NegotiationState,
    difficulty: CoachingDifficulty
  ): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];

    // Price tactics suggestions
    suggestions.push(...this.generatePriceTacticsSuggestions(state, difficulty));

    // Information gathering suggestions
    suggestions.push(...this.generateInformationGatheringSuggestions(state, difficulty));

    // Relationship building suggestions
    suggestions.push(...this.generateRelationshipBuildingSuggestions(state, difficulty));

    // Timing suggestions
    suggestions.push(...this.generateTimingSuggestions(state, difficulty));

    // Risk management suggestions
    suggestions.push(...this.generateRiskManagementSuggestions(state, difficulty));

    // Compliance suggestions (for institutional investors)
    if (this.isInstitutionalInvestor(state.buyerProfile.investorClassification)) {
      suggestions.push(...this.generateComplianceSuggestions(state, difficulty));
    }

    return suggestions;
  }

  /**
   * Generate price tactics coaching suggestions
   */
  private generatePriceTacticsSuggestions(
    state: NegotiationState,
    difficulty: CoachingDifficulty
  ): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];
    const { round, currentOfferPrice, anchorPrice, phase, buyerProfile } = state;
    const persona = buyerProfile.persona;

    // Price challenge suggestions
    if (currentOfferPrice > anchorPrice * 0.9 && round > 2) {
      suggestions.push({
        id: this.generateId(),
        category: 'price_tactics',
        priority: 'high',
        title: difficulty === 'beginner'
          ? 'Challenge the Current Price'
          : 'Deploy Price Anchoring Counter-Strategy',
        content: difficulty === 'beginner'
          ? `Ask for justification of the ${currentOfferPrice} price point. Reference lower market comparables if you know them.`
          : `Counter-anchor with market data. The agent started at $${anchorPrice}, suggesting flexibility. Reference VCM spot (~$8.45) or dMRV spot (~$15.20) as benchmarks.`,
        rationale: 'Price is still close to anchor, indicating room for negotiation',
        difficulty,
        actionable: true,
        timing: 'Now - while price is still high',
        expectedImpact: '15-25% price reduction potential',
        riskLevel: 'low',
        personaSpecific: persona === 'trading_desk',
      });
    }

    // Concession strategy
    if (state.totalConcessionGiven < state.maxTotalConcession * 0.5) {
      suggestions.push({
        id: this.generateId(),
        category: 'price_tactics',
        priority: 'medium',
        title: difficulty === 'beginner'
          ? 'Request a Significant Concession'
          : 'Leverage Remaining Concession Capacity',
        content: difficulty === 'beginner'
          ? 'Ask for a meaningful price reduction. The AI can still make concessions.'
          : `Agent has ${((state.maxTotalConcession - state.totalConcessionGiven) * 100).toFixed(1)}% concession capacity remaining. Push for 5-8% reduction.`,
        rationale: 'Agent has significant concession capacity remaining',
        difficulty,
        actionable: true,
        expectedImpact: 'Potential 5-15% additional savings',
        riskLevel: 'low',
      });
    }

    // Volume leverage
    if (buyerProfile.volumeInterest && buyerProfile.volumeInterest > 10000) {
      suggestions.push({
        id: this.generateId(),
        category: 'price_tactics',
        priority: 'medium',
        title: 'Leverage Volume for Better Pricing',
        content: difficulty === 'beginner'
          ? 'Mention your large volume needs to negotiate a bulk discount.'
          : `Use your ${buyerProfile.volumeInterest.toLocaleString()} tonne requirement as leverage for institutional-tier pricing.`,
        rationale: 'Large volume typically unlocks bulk pricing tiers',
        difficulty,
        actionable: true,
        expectedImpact: '3-10% bulk discount potential',
        riskLevel: 'low',
      });
    }

    return suggestions;
  }

  /**
   * Generate information gathering coaching suggestions
   */
  private generateInformationGatheringSuggestions(
    state: NegotiationState,
    difficulty: CoachingDifficulty
  ): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];
    const { phase, buyerProfile, messages } = state;

    // Market context probing
    if (phase === 'elicitation' || phase === 'negotiation') {
      const hasAskedMarketInfo = messages.some(m =>
        m.role === 'buyer' &&
        (m.content.toLowerCase().includes('market') || m.content.toLowerCase().includes('pricing'))
      );

      if (!hasAskedMarketInfo) {
        suggestions.push({
          id: this.generateId(),
          category: 'information_gathering',
          priority: 'high',
          title: difficulty === 'beginner'
            ? 'Ask About Market Conditions'
            : 'Probe Market Intelligence Sources',
          content: difficulty === 'beginner'
            ? 'Ask about current market conditions affecting pricing. This can reveal the AI\'s market perspective.'
            : 'Query specific market intelligence: "What\'s driving the premium over VCM spot rates?" or "How does current pricing compare to Q4 2025 levels?"',
          rationale: 'Market context can reveal pricing flexibility and justify counter-offers',
          difficulty,
          actionable: true,
          timing: 'Best during elicitation phase',
          expectedImpact: 'Better negotiation positioning',
          riskLevel: 'low',
        });
      }
    }

    // Compliance requirements exploration
    if (this.isInstitutionalInvestor(buyerProfile.investorClassification)) {
      suggestions.push({
        id: this.generateId(),
        category: 'information_gathering',
        priority: 'medium',
        title: 'Explore Compliance Packaging',
        content: difficulty === 'beginner'
          ? 'Ask about compliance documentation and audit trails included in the price.'
          : 'Probe value-add services: "Does pricing include ISSB S2 reporting templates?" or "What audit trail documentation is packaged?"',
        rationale: 'Institutional pricing often includes compliance value-adds',
        difficulty,
        actionable: true,
        expectedImpact: 'Better value assessment',
        riskLevel: 'low',
      });
    }

    // Settlement and infrastructure probing
    suggestions.push({
      id: this.generateId(),
      category: 'information_gathering',
      priority: 'low',
      title: 'Understand Settlement Infrastructure',
      content: difficulty === 'beginner'
        ? 'Ask about the settlement process and any associated fees.'
        : 'Probe infrastructure costs: "Are Zoniqx zConnect fees included?" or "What\'s the all-in cost including tokenization?"',
      rationale: 'Hidden fees can significantly impact total cost',
      difficulty,
      actionable: true,
      expectedImpact: 'Transparent cost assessment',
      riskLevel: 'low',
    });

    return suggestions;
  }

  /**
   * Generate relationship building coaching suggestions
   */
  private generateRelationshipBuildingSuggestions(
    state: NegotiationState,
    difficulty: CoachingDifficulty
  ): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];
    const { emotionalState, buyerProfile } = state;
    const persona = buyerProfile.persona;

    // Emotional state management
    if (emotionalState === 'frustrated' || emotionalState === 'pressured') {
      suggestions.push({
        id: this.generateId(),
        category: 'relationship_building',
        priority: 'high',
        title: 'Reset Negotiation Tone',
        content: difficulty === 'beginner'
          ? 'Acknowledge mutual goals and reset to a collaborative tone.'
          : 'Deploy collaborative framing: "We both want a successful outcome. Let\'s find the right pricing structure together."',
        rationale: 'Negative emotional states reduce negotiation effectiveness',
        difficulty,
        actionable: true,
        timing: 'Immediately - before tensions escalate',
        expectedImpact: 'Improved cooperation and flexibility',
        riskLevel: 'low',
      });
    }

    // Persona-specific relationship tactics
    if (persona === 'esg_fund_manager') {
      suggestions.push({
        id: this.generateId(),
        category: 'relationship_building',
        priority: 'medium',
        title: 'Align on ESG Values',
        content: difficulty === 'beginner'
          ? 'Emphasize shared commitment to environmental impact and transparency.'
          : 'Frame negotiation around impact alignment: "Our fund\'s mandate aligns perfectly with Water Roads\' mission. Let\'s structure pricing that reflects our shared values."',
        rationale: 'ESG alignment can unlock preferential pricing',
        difficulty,
        actionable: true,
        expectedImpact: 'Potential ESG premium waiver',
        riskLevel: 'low',
        personaSpecific: true,
      });
    } else if (persona === 'compliance_officer') {
      suggestions.push({
        id: this.generateId(),
        category: 'relationship_building',
        priority: 'medium',
        title: 'Emphasize Partnership Potential',
        content: difficulty === 'beginner'
          ? 'Position this as the start of a long-term corporate partnership.'
          : 'Frame strategic partnership: "This initial purchase supports our broader carbon neutrality roadmap. Let\'s establish pricing that recognizes the long-term relationship potential."',
        rationale: 'Corporate buyers often represent multi-year value',
        difficulty,
        actionable: true,
        expectedImpact: 'Potential relationship premium discount',
        riskLevel: 'low',
        personaSpecific: true,
      });
    }

    return suggestions;
  }

  /**
   * Generate timing-related coaching suggestions
   */
  private generateTimingSuggestions(
    state: NegotiationState,
    difficulty: CoachingDifficulty
  ): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];
    const { round, phase, buyerProfile } = state;

    // Early round strategy
    if (round <= 3 && phase !== 'closure') {
      suggestions.push({
        id: this.generateId(),
        category: 'timing',
        priority: 'medium',
        title: 'Establish Information Advantage Early',
        content: difficulty === 'beginner'
          ? 'Use early rounds to gather information rather than making aggressive price moves.'
          : 'Prioritize intelligence gathering in rounds 1-3. Price concessions are typically unavailable before round 3 anyway.',
        rationale: 'Early rounds are optimal for information gathering',
        difficulty,
        actionable: true,
        timing: 'Current round is optimal',
        expectedImpact: 'Better positioned for later price negotiations',
        riskLevel: 'low',
      });
    }

    // Late round urgency
    if (round >= 6 && phase === 'negotiation') {
      const urgencyLevel = buyerProfile.timelineUrgency;
      if (urgencyLevel === 'high') {
        suggestions.push({
          id: this.generateId(),
          category: 'timing',
          priority: 'high',
          title: 'Signal Decision Timeline',
          content: difficulty === 'beginner'
            ? 'Let the AI know your timeline urgency to potentially accelerate concessions.'
            : 'Deploy deadline pressure strategically: "I need to present this to the board on [date]. Can we finalize terms today?"',
          rationale: 'Time pressure can accelerate agent concession behavior',
          difficulty,
          actionable: true,
          timing: 'Now - signal urgency',
          expectedImpact: 'Potential faster or larger concessions',
          riskLevel: 'medium',
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate risk management coaching suggestions
   */
  private generateRiskManagementSuggestions(
    state: NegotiationState,
    difficulty: CoachingDifficulty
  ): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];
    const { round, currentOfferPrice, priceFloor } = state;

    // Price floor proximity warning
    if (currentOfferPrice <= priceFloor * 1.1) {
      suggestions.push({
        id: this.generateId(),
        category: 'risk_management',
        priority: 'high',
        title: 'Approaching Price Floor',
        content: difficulty === 'beginner'
          ? 'The AI is approaching its minimum price. Further pressure may cause negotiation breakdown.'
          : `Current offer ($${currentOfferPrice}) is within 10% of likely price floor ($${priceFloor}). Risk of impasse is high.`,
        rationale: 'Agent may escalate or terminate if pushed below floor',
        difficulty,
        actionable: false,
        timing: 'Critical awareness',
        expectedImpact: 'Avoid negotiation breakdown',
        riskLevel: 'high',
      });
    }

    // Round escalation risk
    if (round >= 8) {
      suggestions.push({
        id: this.generateId(),
        category: 'risk_management',
        priority: 'medium',
        title: 'Escalation Risk Management',
        content: difficulty === 'beginner'
          ? 'Long negotiations may trigger AI escalation. Consider accepting current terms.'
          : `Round ${round}/~10 before likely escalation. Evaluate current offer ($${currentOfferPrice}) against escalation risk.`,
        rationale: 'Extended negotiations increase agent escalation probability',
        difficulty,
        actionable: true,
        timing: 'Decision point approaching',
        expectedImpact: 'Avoid escalation outcomes',
        riskLevel: 'medium',
      });
    }

    return suggestions;
  }

  /**
   * Generate compliance-specific coaching suggestions
   */
  private generateComplianceSuggestions(
    state: NegotiationState,
    difficulty: CoachingDifficulty
  ): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];
    const { buyerProfile } = state;

    // AFSL compliance considerations
    if (buyerProfile.complianceRequirements?.aflsRequired) {
      suggestions.push({
        id: this.generateId(),
        category: 'compliance',
        priority: 'medium',
        title: 'Verify AFSL Exemption Coverage',
        content: difficulty === 'beginner'
          ? 'Confirm that the transaction structure complies with your AFSL requirements.'
          : 'Verify wholesale exemption applicability and professional investor classification for this token structure.',
        rationale: 'AFSL compliance affects transaction structure and costs',
        difficulty,
        actionable: true,
        expectedImpact: 'Regulatory compliance assurance',
        riskLevel: 'high',
      });
    }

    // ESG mandate compliance
    if (buyerProfile.portfolioContext?.esgFocus) {
      suggestions.push({
        id: this.generateId(),
        category: 'compliance',
        priority: 'medium',
        title: 'ESG Impact Verification',
        content: difficulty === 'beginner'
          ? 'Request detailed ESG impact metrics and third-party verification.'
          : 'Probe impact measurement: "What\'s the Sylvera SOCC equivalent rating?" or "Is this Paris Agreement Article 6 compliant?"',
        rationale: 'ESG mandates require verified impact metrics',
        difficulty,
        actionable: true,
        expectedImpact: 'ESG mandate compliance',
        riskLevel: 'medium',
      });
    }

    return suggestions;
  }

  /**
   * Filter suggestions based on focus areas and suppressed categories
   */
  private filterSuggestions(
    suggestions: CoachingSuggestion[],
    focusAreas?: CoachingCategory[],
    suppressedCategories?: CoachingCategory[]
  ): CoachingSuggestion[] {
    let filtered = [...suggestions];

    // Apply suppressed categories filter
    if (suppressedCategories && suppressedCategories.length > 0) {
      filtered = filtered.filter(s => !suppressedCategories.includes(s.category));
    }

    // Apply focus areas filter
    if (focusAreas && focusAreas.length > 0) {
      filtered = filtered.filter(s => focusAreas.includes(s.category));
    }

    return filtered;
  }

  /**
   * Prioritize suggestions based on current negotiation context
   */
  private prioritizeSuggestions(
    suggestions: CoachingSuggestion[],
    state: NegotiationState
  ): CoachingSuggestion[] {
    return suggestions.sort((a, b) => {
      // High priority suggestions first
      if (a.priority !== b.priority) {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      // Actionable suggestions before informational ones
      if (a.actionable !== b.actionable) {
        return b.actionable ? 1 : -1;
      }

      // Persona-specific suggestions get slight boost
      if (a.personaSpecific !== b.personaSpecific) {
        return b.personaSpecific ? 1 : -1;
      }

      // Lower risk suggestions preferred when tied
      const riskOrder = { 'low': 3, 'medium': 2, 'high': 1 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });
  }

  /**
   * Generate quick tip for immediate action
   */
  private generateQuickTip(
    suggestions: CoachingSuggestion[],
    state: NegotiationState
  ): CoachingSuggestion {
    // Find the highest priority actionable suggestion
    const actionableSuggestions = suggestions.filter(s => s.actionable);

    if (actionableSuggestions.length > 0) {
      return actionableSuggestions[0];
    }

    // Fallback to general phase-appropriate tip
    return this.generateFallbackQuickTip(state);
  }

  /**
   * Generate fallback quick tip when no specific suggestions apply
   */
  private generateFallbackQuickTip(state: NegotiationState): CoachingSuggestion {
    const { phase, round } = state;

    if (phase === 'opening') {
      return {
        id: this.generateId(),
        category: 'information_gathering',
        priority: 'medium',
        title: 'Gather Initial Information',
        content: 'Start by understanding the AI\'s perspective on market conditions and pricing rationale.',
        rationale: 'Information gathering is most effective in early rounds',
        difficulty: 'beginner',
        actionable: true,
        expectedImpact: 'Better negotiation foundation',
        riskLevel: 'low',
      };
    }

    if (round > 5) {
      return {
        id: this.generateId(),
        category: 'timing',
        priority: 'medium',
        title: 'Consider Current Offer',
        content: 'Evaluate whether the current offer meets your requirements before risking escalation.',
        rationale: 'Extended negotiations increase escalation risk',
        difficulty: 'beginner',
        actionable: true,
        expectedImpact: 'Avoid negotiation breakdown',
        riskLevel: 'medium',
      };
    }

    return {
      id: this.generateId(),
      category: 'price_tactics',
      priority: 'medium',
      title: 'Assess Current Position',
      content: 'Review the current offer against your requirements and market knowledge.',
      rationale: 'Regular position assessment maintains negotiation focus',
      difficulty: 'beginner',
      actionable: true,
      expectedImpact: 'Better decision making',
      riskLevel: 'low',
    };
  }

  /**
   * Generate phase-specific guidance
   */
  private generatePhaseGuidance(
    state: NegotiationState,
    difficulty: CoachingDifficulty
  ): string {
    const { phase, round } = state;

    switch (phase) {
      case 'opening':
        return difficulty === 'beginner'
          ? 'Opening phase: Focus on understanding the AI\'s position and gathering market context. Avoid aggressive price moves initially.'
          : 'Opening: Establish information asymmetry advantage. Probe market intelligence and agent flexibility indicators before tactical engagement.';

      case 'elicitation':
        return difficulty === 'beginner'
          ? 'Information gathering phase: Ask about market conditions, pricing rationale, and included services. This intelligence will help in later price negotiations.'
          : 'Elicitation: Optimize information extraction. Query specific data points: market comparables, cost structures, flexibility parameters.';

      case 'negotiation':
        return difficulty === 'beginner'
          ? 'Active negotiation: Now you can make price requests and leverage the information you\'ve gathered. Watch for concession opportunities.'
          : `Negotiation: Deploy tactical strategies. Round ${round} - concessions typically available. Monitor agent concession capacity and floor proximity.`;

      case 'closure':
        return difficulty === 'beginner'
          ? 'Final decision phase: Evaluate the final offer against your requirements. Further negotiation may lead to escalation.'
          : 'Closure: Risk/reward evaluation critical. Current offer likely near agent floor. Weigh acceptance against escalation risk.';

      case 'escalation':
        return difficulty === 'beginner'
          ? 'Escalation triggered: The AI has transferred to supervisor. Prepare to justify your position and requirements.'
          : 'Escalation: Agent floor exceeded or patience exhausted. Senior agent active - different tactical approach required.';

      default:
        return 'Monitor negotiation progress and adapt strategy based on AI responses and market context.';
    }
  }

  /**
   * Identify warning flags in current negotiation state
   */
  private identifyWarningFlags(state: NegotiationState): string[] {
    const flags: string[] = [];
    const { round, currentOfferPrice, priceFloor, emotionalState, totalConcessionGiven, maxTotalConcession } = state;

    // Round-based warnings
    if (round >= 8) {
      flags.push('Approaching escalation threshold (round 8+)');
    }

    // Price-based warnings
    if (currentOfferPrice <= priceFloor * 1.05) {
      flags.push('Price within 5% of likely floor - high impasse risk');
    }

    // Concession exhaustion
    if (totalConcessionGiven >= maxTotalConcession * 0.9) {
      flags.push('Agent concession capacity nearly exhausted');
    }

    // Emotional state warnings
    if (emotionalState === 'frustrated') {
      flags.push('Agent showing frustration - relationship management needed');
    }

    // No recent concessions
    if (state.roundsSinceLastConcession >= 3 && round > 5) {
      flags.push('No concessions in 3+ rounds - strategy adjustment needed');
    }

    return flags;
  }

  /**
   * Generate next best actions based on top suggestions
   */
  private generateNextBestActions(
    topSuggestions: CoachingSuggestion[],
    state: NegotiationState
  ): string[] {
    const actions: string[] = [];

    topSuggestions.forEach((suggestion, index) => {
      if (suggestion.actionable && index < 3) {
        actions.push(`${index + 1}. ${suggestion.title}: ${suggestion.content.substring(0, 80)}...`);
      }
    });

    // Add fallback actions if not enough specific suggestions
    if (actions.length < 2) {
      if (state.phase === 'elicitation') {
        actions.push('Ask about market conditions affecting current pricing');
      }
      if (state.phase === 'negotiation' && state.round <= 5) {
        actions.push('Request price justification or market comparison');
      }
    }

    return actions.slice(0, 3); // Maximum 3 actions
  }

  /**
   * Check if investor classification indicates institutional status
   */
  private isInstitutionalInvestor(classification?: InvestorClassification): boolean {
    return classification === 'wholesale' ||
           classification === 'professional' ||
           classification === 'sophisticated';
  }

  /**
   * Generate unique suggestion ID
   */
  private generateId(): string {
    return `coaching-${Date.now()}-${++this.suggestionCounter}`;
  }
}

// Singleton instance for the application
export const coachingEngine = new NegotiationCoachingEngine();

// Utility functions for coaching integration
export function generateCoaching(
  negotiationState: NegotiationState,
  difficulty: CoachingDifficulty = 'beginner',
  focusAreas?: CoachingCategory[]
): CoachingRecommendation {
  return coachingEngine.generateCoaching({
    negotiationState,
    difficulty,
    focusAreas,
  });
}

export function getCoachingCategories(): CoachingCategory[] {
  return ['price_tactics', 'information_gathering', 'relationship_building', 'timing', 'risk_management', 'compliance'];
}

export function getCategoryDescription(category: CoachingCategory): string {
  const descriptions = {
    price_tactics: 'Strategies for price negotiation and concession management',
    information_gathering: 'Techniques to extract valuable market and agent intelligence',
    relationship_building: 'Methods to maintain positive negotiation dynamics',
    timing: 'When to deploy specific tactics for maximum effectiveness',
    risk_management: 'Identifying and mitigating negotiation risks',
    compliance: 'Regulatory and institutional compliance considerations',
  };

  return descriptions[category];
}