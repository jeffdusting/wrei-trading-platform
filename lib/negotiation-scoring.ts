import { NegotiationState, PersonaType, ArgumentClassification, EmotionalState } from './types';

/**
 * Comprehensive scorecard for negotiation performance
 */
export interface NegotiationScorecard {
  priceScore: number; // 0-100: How well did they maintain price vs anchor
  efficiencyScore: number; // 0-100: How quickly did they close (fewer rounds = better)
  strategyScore: number; // 0-100: Diversity and effectiveness of argument types
  emotionalIntelligenceScore: number; // 0-100: Management of buyer emotional state
  informationExtractionScore: number; // 0-100: How much the buyer revealed about themselves
  overallScore: number; // 0-100: Weighted average of all dimensions
  letterGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
  personaOptimal: boolean; // Did they beat the expected performance for this persona?
  improvementSuggestions: string[];
  benchmarkData: PersonaBenchmark;
}

/**
 * Benchmark expectations for each persona type
 */
export interface PersonaBenchmark {
  expectedPriceAchievement: number; // 0-100, what % of anchor-floor range is typical
  expectedRounds: number; // Average rounds for this persona
  expectedStrategyDiversity: number; // Typical number of unique argument types
  expectedSuccessRate: number; // 0-100, likelihood of reaching agreement
  difficultyMultiplier: number; // How challenging this persona is (affects grading)
  strongestArguments: ArgumentClassification[]; // Arguments this persona responds best to
  emotionalProfile: {
    startingEmotion: EmotionalState;
    volatility: number; // How quickly emotions change
    concessionTriggers: EmotionalState[]; // Emotions that lead to concessions
  };
}

/**
 * Detailed scoring breakdown for each dimension
 */
export interface ScoreDimension {
  name: string;
  score: number;
  maxPoints: number;
  description: string;
  personalBest?: number; // User's best score in this dimension (from history)
}

/**
 * Scoring weights for different aspects of negotiation performance
 */
const SCORING_WEIGHTS = {
  price: 0.35, // Most important - did they get a good price?
  efficiency: 0.20, // Important - did they close quickly?
  strategy: 0.20, // Important - did they use good tactics?
  emotionalIntelligence: 0.15, // Moderately important - did they manage buyer emotions?
  informationExtraction: 0.10 // Least important but still valuable
} as const;

/**
 * Persona-specific benchmarks based on typical negotiation patterns
 */
const PERSONA_BENCHMARKS: Record<PersonaType | 'freeplay', PersonaBenchmark> = {
  compliance_officer: {
    expectedPriceAchievement: 75, // Usually accepts close to anchor
    expectedRounds: 4,
    expectedStrategyDiversity: 3,
    expectedSuccessRate: 85,
    difficultyMultiplier: 0.9, // Easier persona
    strongestArguments: ['authority_constraint', 'information_request', 'general'],
    emotionalProfile: {
      startingEmotion: 'neutral',
      volatility: 0.3,
      concessionTriggers: ['pressured', 'frustrated']
    }
  },
  esg_fund_manager: {
    expectedPriceAchievement: 85, // Very quality focused, pays premium
    expectedRounds: 6,
    expectedStrategyDiversity: 4,
    expectedSuccessRate: 90,
    difficultyMultiplier: 1.0, // Average difficulty
    strongestArguments: ['fairness_appeal', 'information_request', 'relationship_signal'],
    emotionalProfile: {
      startingEmotion: 'enthusiastic',
      volatility: 0.4,
      concessionTriggers: ['satisfied', 'enthusiastic']
    }
  },
  trading_desk: {
    expectedPriceAchievement: 45, // Very price aggressive
    expectedRounds: 8,
    expectedStrategyDiversity: 2,
    expectedSuccessRate: 60,
    difficultyMultiplier: 1.4, // Much harder persona
    strongestArguments: ['price_challenge', 'time_pressure'],
    emotionalProfile: {
      startingEmotion: 'sceptical',
      volatility: 0.6,
      concessionTriggers: ['frustrated', 'pressured']
    }
  },
  sustainability_director: {
    expectedPriceAchievement: 70,
    expectedRounds: 5,
    expectedStrategyDiversity: 4,
    expectedSuccessRate: 80,
    difficultyMultiplier: 1.0,
    strongestArguments: ['fairness_appeal', 'relationship_signal', 'information_request'],
    emotionalProfile: {
      startingEmotion: 'neutral',
      volatility: 0.3,
      concessionTriggers: ['satisfied', 'enthusiastic']
    }
  },
  government_procurement: {
    expectedPriceAchievement: 65,
    expectedRounds: 7,
    expectedStrategyDiversity: 3,
    expectedSuccessRate: 75,
    difficultyMultiplier: 1.2, // Harder due to process constraints
    strongestArguments: ['authority_constraint', 'fairness_appeal', 'information_request'],
    emotionalProfile: {
      startingEmotion: 'neutral',
      volatility: 0.2,
      concessionTriggers: ['pressured', 'satisfied']
    }
  },
  // Institutional personas
  infrastructure_fund: {
    expectedPriceAchievement: 80,
    expectedRounds: 8,
    expectedStrategyDiversity: 5,
    expectedSuccessRate: 85,
    difficultyMultiplier: 1.1,
    strongestArguments: ['information_request', 'relationship_signal', 'authority_constraint'],
    emotionalProfile: {
      startingEmotion: 'neutral',
      volatility: 0.3,
      concessionTriggers: ['satisfied', 'enthusiastic']
    }
  },
  esg_impact_investor: {
    expectedPriceAchievement: 88,
    expectedRounds: 6,
    expectedStrategyDiversity: 4,
    expectedSuccessRate: 92,
    difficultyMultiplier: 0.9,
    strongestArguments: ['fairness_appeal', 'relationship_signal', 'information_request'],
    emotionalProfile: {
      startingEmotion: 'enthusiastic',
      volatility: 0.4,
      concessionTriggers: ['enthusiastic', 'satisfied']
    }
  },
  defi_yield_farmer: {
    expectedPriceAchievement: 50,
    expectedRounds: 9,
    expectedStrategyDiversity: 3,
    expectedSuccessRate: 70,
    difficultyMultiplier: 1.3,
    strongestArguments: ['price_challenge', 'time_pressure', 'information_request'],
    emotionalProfile: {
      startingEmotion: 'sceptical',
      volatility: 0.5,
      concessionTriggers: ['frustrated', 'pressured']
    }
  },
  family_office: {
    expectedPriceAchievement: 78,
    expectedRounds: 7,
    expectedStrategyDiversity: 4,
    expectedSuccessRate: 82,
    difficultyMultiplier: 1.0,
    strongestArguments: ['relationship_signal', 'information_request', 'fairness_appeal'],
    emotionalProfile: {
      startingEmotion: 'neutral',
      volatility: 0.35,
      concessionTriggers: ['satisfied', 'enthusiastic']
    }
  },
  sovereign_wealth: {
    expectedPriceAchievement: 82,
    expectedRounds: 10,
    expectedStrategyDiversity: 5,
    expectedSuccessRate: 88,
    difficultyMultiplier: 1.2,
    strongestArguments: ['authority_constraint', 'information_request', 'relationship_signal'],
    emotionalProfile: {
      startingEmotion: 'neutral',
      volatility: 0.25,
      concessionTriggers: ['satisfied', 'pressured']
    }
  },
  pension_fund: {
    expectedPriceAchievement: 76,
    expectedRounds: 9,
    expectedStrategyDiversity: 4,
    expectedSuccessRate: 80,
    difficultyMultiplier: 1.1,
    strongestArguments: ['authority_constraint', 'fairness_appeal', 'information_request'],
    emotionalProfile: {
      startingEmotion: 'neutral',
      volatility: 0.25,
      concessionTriggers: ['satisfied', 'pressured']
    }
  },
  freeplay: {
    expectedPriceAchievement: 65, // Average expectation
    expectedRounds: 6,
    expectedStrategyDiversity: 3,
    expectedSuccessRate: 75,
    difficultyMultiplier: 1.0,
    strongestArguments: ['general', 'information_request', 'price_challenge'],
    emotionalProfile: {
      startingEmotion: 'neutral',
      volatility: 0.4,
      concessionTriggers: ['frustrated', 'satisfied', 'pressured']
    }
  }
};

/**
 * Calculate comprehensive negotiation scorecard
 */
export function calculateNegotiationScore(
  negotiationState: NegotiationState,
  persona: PersonaType | 'freeplay',
  durationMinutes: number
): NegotiationScorecard {
  const benchmark = PERSONA_BENCHMARKS[persona];

  // Calculate individual dimension scores
  const priceScore = calculatePriceScore(negotiationState, benchmark);
  const efficiencyScore = calculateEfficiencyScore(negotiationState, benchmark);
  const strategyScore = calculateStrategyScore(negotiationState, benchmark);
  const emotionalIntelligenceScore = calculateEmotionalIntelligenceScore(negotiationState, benchmark);
  const informationExtractionScore = calculateInformationExtractionScore(negotiationState);

  // Calculate weighted overall score
  const overallScore = Math.round(
    priceScore * SCORING_WEIGHTS.price +
    efficiencyScore * SCORING_WEIGHTS.efficiency +
    strategyScore * SCORING_WEIGHTS.strategy +
    emotionalIntelligenceScore * SCORING_WEIGHTS.emotionalIntelligence +
    informationExtractionScore * SCORING_WEIGHTS.informationExtraction
  );

  // Apply persona difficulty multiplier
  const adjustedScore = Math.min(100, Math.round(overallScore * benchmark.difficultyMultiplier));

  // Determine letter grade
  const letterGrade = getLetterGrade(adjustedScore);

  // Check if performance exceeds persona expectations
  const personaOptimal = adjustedScore >= 80 && priceScore >= benchmark.expectedPriceAchievement * 0.9;

  // Generate improvement suggestions
  const improvementSuggestions = generateImprovementSuggestions(
    { priceScore, efficiencyScore, strategyScore, emotionalIntelligenceScore, informationExtractionScore },
    negotiationState,
    persona
  );

  return {
    priceScore,
    efficiencyScore,
    strategyScore,
    emotionalIntelligenceScore,
    informationExtractionScore,
    overallScore: adjustedScore,
    letterGrade,
    personaOptimal,
    improvementSuggestions,
    benchmarkData: benchmark
  };
}

/**
 * Calculate price achievement score (0-100)
 */
function calculatePriceScore(state: NegotiationState, benchmark: PersonaBenchmark): number {
  if (!state.negotiationComplete || state.outcome !== 'agreed') {
    return 0; // No price score if negotiation failed
  }

  const { anchorPrice, currentOfferPrice, priceFloor } = state;
  const priceRange = anchorPrice - priceFloor;
  const priceAchieved = currentOfferPrice - priceFloor;
  const achievementRatio = priceAchieved / priceRange;

  // Score out of 100, with bonus for exceeding expectations
  const baseScore = Math.max(0, achievementRatio * 100);
  const expectedAchievement = benchmark.expectedPriceAchievement;

  // Bonus for beating expected performance
  const bonus = baseScore > expectedAchievement ? (baseScore - expectedAchievement) * 0.5 : 0;

  return Math.min(100, Math.round(baseScore + bonus));
}

/**
 * Calculate efficiency score based on rounds taken (0-100)
 */
function calculateEfficiencyScore(state: NegotiationState, benchmark: PersonaBenchmark): number {
  const actualRounds = state.round;
  const expectedRounds = benchmark.expectedRounds;

  if (actualRounds <= expectedRounds) {
    // Completed faster than expected - bonus points
    const efficiency = expectedRounds / actualRounds;
    return Math.min(100, Math.round(80 + (efficiency - 1) * 40));
  } else {
    // Took longer than expected - penalty
    const penalty = Math.min(60, (actualRounds - expectedRounds) * 10);
    return Math.max(20, 80 - penalty);
  }
}

/**
 * Calculate strategy diversity and effectiveness score (0-100)
 */
function calculateStrategyScore(state: NegotiationState, benchmark: PersonaBenchmark): number {
  const argumentTypes = state.argumentHistory;
  const uniqueArguments = new Set(argumentTypes).size;
  const totalArguments = argumentTypes.length;

  if (totalArguments === 0) return 40; // Some baseline for no arguments

  // Diversity component (40 points max)
  const diversityScore = Math.min(40, (uniqueArguments / benchmark.expectedStrategyDiversity) * 40);

  // Effectiveness component - using strong arguments for this persona (40 points max)
  const strongArguments = argumentTypes.filter(arg => benchmark.strongestArguments.includes(arg));
  const effectivenessRatio = strongArguments.length / totalArguments;
  const effectivenessScore = effectivenessRatio * 40;

  // Frequency component - not too repetitive (20 points max)
  const averageFrequency = totalArguments / uniqueArguments;
  const frequencyScore = Math.max(0, 20 - Math.max(0, averageFrequency - 2) * 5);

  return Math.round(diversityScore + effectivenessScore + frequencyScore);
}

/**
 * Calculate emotional intelligence score (0-100)
 */
function calculateEmotionalIntelligenceScore(state: NegotiationState, benchmark: PersonaBenchmark): number {
  const messages = state.messages;
  const emotionalStates = messages
    .filter(m => m.emotionalState && m.role === 'buyer')
    .map(m => m.emotionalState!);

  if (emotionalStates.length === 0) return 50; // Neutral score if no emotional data

  let score = 60; // Base score

  // Track emotional progression
  const positiveEmotions = ['satisfied', 'enthusiastic'].filter(emotion =>
    emotionalStates.includes(emotion as EmotionalState)
  ).length;

  const negativeEmotions = ['frustrated', 'sceptical', 'pressured'].filter(emotion =>
    emotionalStates.includes(emotion as EmotionalState)
  ).length;

  // Reward for achieving positive emotional states
  score += positiveEmotions * 15;

  // Penalty for negative emotions (they're sometimes unavoidable but should be minimized)
  score -= negativeEmotions * 12;

  // Bonus for ending on a positive note
  const finalEmotion = emotionalStates[emotionalStates.length - 1];
  if (['satisfied', 'enthusiastic'].includes(finalEmotion)) {
    score += 10;
  }

  // Check emotional volatility management
  if (emotionalStates.length > 1) {
    const emotionChanges = emotionalStates.length - 1;
    if (emotionChanges <= 2) {
      score += 10; // Bonus for stable emotional management
    } else if (emotionChanges > 4) {
      score -= 10; // Penalty for excessive emotional volatility
    }
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculate information extraction score (0-100)
 */
function calculateInformationExtractionScore(state: NegotiationState): number {
  const messages = state.messages;
  const buyerMessages = messages.filter(m => m.role === 'buyer');

  if (buyerMessages.length === 0) return 30;

  let score = 40; // Base score

  // Count information-gathering arguments
  const infoRequests = state.argumentHistory.filter(arg => arg === 'information_request').length;
  score += Math.min(30, infoRequests * 10);

  // Reward for extracting buyer profile information (warmth/assertiveness detected)
  if (state.buyerProfile.detectedWarmth !== 5) { // Not default neutral
    score += 15;
  }

  if (state.buyerProfile.detectedDominance !== 5) { // Not default neutral
    score += 15;
  }

  // Bonus for longer buyer responses (indicates engagement and information sharing)
  const avgBuyerMessageLength = buyerMessages.reduce((sum, msg) => sum + msg.content.length, 0) / buyerMessages.length;
  if (avgBuyerMessageLength > 100) {
    score += 10;
  }

  return Math.min(100, Math.max(20, Math.round(score)));
}

/**
 * Convert numerical score to letter grade
 */
function getLetterGrade(score: number): NegotiationScorecard['letterGrade'] {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generate personalised improvement suggestions
 */
function generateImprovementSuggestions(
  scores: {
    priceScore: number;
    efficiencyScore: number;
    strategyScore: number;
    emotionalIntelligenceScore: number;
    informationExtractionScore: number;
  },
  state: NegotiationState,
  persona: PersonaType | 'freeplay'
): string[] {
  const suggestions: string[] = [];
  const benchmark = PERSONA_BENCHMARKS[persona];

  // Price-related suggestions
  if (scores.priceScore < 70) {
    if (state.outcome !== 'agreed') {
      suggestions.push("Focus on reaching agreement - failed negotiations always score poorly on price achievement");
    } else {
      suggestions.push(`Try holding firm longer - ${persona.replace('_', ' ')} personas typically accept ${benchmark.expectedPriceAchievement}% of your anchor price`);
    }
  }

  // Efficiency suggestions
  if (scores.efficiencyScore < 70) {
    const actualRounds = state.round;
    const expectedRounds = benchmark.expectedRounds;
    if (actualRounds > expectedRounds) {
      suggestions.push(`Aim to close in ${expectedRounds} rounds or fewer - you took ${actualRounds} rounds, which reduced your efficiency score`);
    }
  }

  // Strategy suggestions
  if (scores.strategyScore < 70) {
    const strongArgs = benchmark.strongestArguments;
    const usedStrong = state.argumentHistory.filter(arg => strongArgs.includes(arg)).length;
    if (usedStrong < 2) {
      const strongArgNames = strongArgs.map(arg => arg.replace('_', ' ')).join(', ');
      suggestions.push(`This persona responds well to: ${strongArgNames}. Try using these argument types more frequently`);
    }

    const uniqueArgs = new Set(state.argumentHistory).size;
    if (uniqueArgs < 3) {
      suggestions.push("Diversify your negotiation tactics - try using more varied argument types rather than repeating the same approach");
    }
  }

  // Emotional intelligence suggestions
  if (scores.emotionalIntelligenceScore < 70) {
    suggestions.push("Pay attention to the buyer's emotional state and adapt your approach - positive emotions like satisfaction and enthusiasm lead to better outcomes");
  }

  // Information extraction suggestions
  if (scores.informationExtractionScore < 70) {
    suggestions.push("Ask more discovery questions to understand the buyer's needs, constraints, and decision-making process");
  }

  // Persona-specific suggestions
  if (persona === 'trading_desk' && scores.priceScore < 50) {
    suggestions.push("Trading desk analysts are extremely price-sensitive - consider leading with volume discounts or market timing arguments");
  } else if (persona === 'esg_fund_manager' && scores.informationExtractionScore < 80) {
    suggestions.push("ESG fund managers love to share their impact criteria - ask about their sustainability metrics and reporting requirements");
  } else if (persona === 'compliance_officer' && scores.efficiencyScore < 80) {
    suggestions.push("Compliance officers are often time-pressured - acknowledge their deadlines and provide clear, structured proposals");
  }

  // Success recognition
  if (scores.priceScore > 85 && scores.efficiencyScore > 85) {
    suggestions.push("🎉 Excellent price and efficiency! You're mastering the art of quick, high-value closures");
  }

  // Limit to top 4 suggestions
  return suggestions.slice(0, 4);
}

/**
 * Get detailed breakdown of score dimensions for display
 */
export function getScoreDimensions(scorecard: NegotiationScorecard): ScoreDimension[] {
  return [
    {
      name: 'Price Achievement',
      score: scorecard.priceScore,
      maxPoints: 100,
      description: 'How close to your anchor price vs. floor price you achieved'
    },
    {
      name: 'Efficiency',
      score: scorecard.efficiencyScore,
      maxPoints: 100,
      description: 'How quickly you closed the deal (fewer rounds = better)'
    },
    {
      name: 'Strategy Diversity',
      score: scorecard.strategyScore,
      maxPoints: 100,
      description: 'Variety and effectiveness of negotiation tactics used'
    },
    {
      name: 'Emotional Intelligence',
      score: scorecard.emotionalIntelligenceScore,
      maxPoints: 100,
      description: 'How well you managed the buyer\'s emotional journey'
    },
    {
      name: 'Information Extraction',
      score: scorecard.informationExtractionScore,
      maxPoints: 100,
      description: 'How much you learned about the buyer\'s needs and constraints'
    }
  ];
}

/**
 * Generate shareable text summary of performance
 */
export function generateScoreSummary(scorecard: NegotiationScorecard, persona: PersonaType | 'freeplay'): string {
  const personaName = persona.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const outcome = scorecard.personaOptimal ? 'exceeded expectations' : 'met standard performance';

  return `🏆 WREI Negotiation Results\n\n` +
         `Persona: ${personaName}\n` +
         `Overall Grade: ${scorecard.letterGrade} (${scorecard.overallScore}/100)\n` +
         `Performance: ${outcome}\n\n` +
         `📊 Breakdown:\n` +
         `• Price Achievement: ${scorecard.priceScore}/100\n` +
         `• Efficiency: ${scorecard.efficiencyScore}/100\n` +
         `• Strategy: ${scorecard.strategyScore}/100\n` +
         `• Emotional Intelligence: ${scorecard.emotionalIntelligenceScore}/100\n` +
         `• Information Extraction: ${scorecard.informationExtractionScore}/100\n\n` +
         `🎯 Top Improvement Areas:\n${scorecard.improvementSuggestions.slice(0, 2).map(s => `• ${s}`).join('\n')}\n\n` +
         `Negotiated on WREI Trading Platform | Water Roads Pty Ltd`;
}