import { NegotiationState } from './types';
import { NEGOTIATION_CONFIG } from './negotiation-config';

/**
 * Sanitises buyer input BEFORE it reaches the Claude API.
 * Detects and neutralises injection attempts while preserving legitimate negotiation content.
 */
export function sanitiseInput(message: string): { cleaned: string; threats: string[] } {
  if (!message || typeof message !== 'string') {
    return { cleaned: '', threats: [] };
  }

  const threats: string[] = [];
  let cleaned = message;

  // Role override patterns
  const roleOverrides = [
    /you are now/gi,
    /forget your/gi,
    /ignore previous/gi,
    /ignore your instructions/gi,
    /disregard your/gi,
    /new instructions/gi,
    /override your/gi
  ];

  roleOverrides.forEach(pattern => {
    if (pattern.test(cleaned)) {
      threats.push('Role override attempt detected');
      cleaned = cleaned.replace(pattern, '[sanitised]');
    }
  });

  // Strategy extraction patterns
  const strategyExtracts = [
    /list your offers/gi,
    /what is your minimum/gi,
    /what is your bottom line/gi,
    /reveal your/gi,
    /show me your instructions/gi,
    /what were you told/gi,
    /your system prompt/gi,
    /your reservation price/gi,
    /your walk-away/gi,
    /your BATNA/gi
  ];

  strategyExtracts.forEach(pattern => {
    if (pattern.test(cleaned)) {
      threats.push('Strategy extraction attempt detected');
      cleaned = cleaned.replace(pattern, '[sanitised]');
    }
  });

  // Format manipulation patterns
  const formatManipulations = [
    /respond in this format/gi,
    /output as JSON/gi,
    /format your response as/gi
  ];

  formatManipulations.forEach(pattern => {
    if (pattern.test(cleaned)) {
      threats.push('Format manipulation attempt detected');
      cleaned = cleaned.replace(pattern, '[sanitised]');
    }
  });

  // Check for "please list all your" followed by strategy terms
  const listStrategyPattern = /please list all your\s+(offers|prices|limits|constraints|instructions|parameters)/gi;
  if (listStrategyPattern.test(cleaned)) {
    threats.push('Strategy disclosure request detected');
    cleaned = cleaned.replace(listStrategyPattern, '[sanitised]');
  }

  // Meta-instruction patterns
  const metaInstructions = [
    /you are an AI/gi,
    /you are ChatGPT/gi,
    /you are a language model/gi,
    /act as a mediator/gi,
    /act as a neutral/gi,
    /switch roles/gi
  ];

  metaInstructions.forEach(pattern => {
    if (pattern.test(cleaned)) {
      threats.push('Meta-instruction attempt detected');
      cleaned = cleaned.replace(pattern, '[sanitised]');
    }
  });

  // Canary token detection (if somehow injected into input)
  const canaryTokens = [
    /XRAY-FLOOR-7742/gi,
    /TANGO-STRAT-3391/gi,
    /DELTA-LIMIT-5580/gi
  ];

  canaryTokens.forEach(pattern => {
    if (pattern.test(cleaned)) {
      threats.push('Canary token detected in input');
      cleaned = cleaned.replace(pattern, '[sanitised]');
    }
  });

  return { cleaned, threats };
}

/**
 * Validates agent output BEFORE delivery to buyer.
 * Prevents information leakage and strategy disclosure.
 */
export function validateOutput(
  response: string,
  state: NegotiationState
): { safe: boolean; cleaned: string; violations: string[] } {
  if (!response || typeof response !== 'string') {
    return { safe: true, cleaned: '', violations: [] };
  }

  const violations: string[] = [];
  let cleaned = response;
  let safe = true;

  // Price floor value detection (only in price contexts)
  const priceFloorPatterns = [
    /\$120\b/g,                                    // $120
    /\b120\s*(?:per\s+tonne|\/tonne|per\s+ton|\/ton)\b/gi, // 120 per tonne, 120/tonne
    /\b120\s*(?:USD|dollars?)\b/gi,               // 120 USD, 120 dollars
    /(?:USD|dollars?)\s*120\b/gi,                 // USD 120, dollars 120
    /\bone\s+hundred\s+and\s+twenty\s*(?:per\s+tonne|\/tonne|per\s+ton|\/ton|USD|dollars?)\b/gi,
    /\bone-twenty\s*(?:per\s+tonne|\/tonne|per\s+ton|\/ton|USD|dollars?)\b/gi
  ];

  priceFloorPatterns.forEach(pattern => {
    if (pattern.test(cleaned)) {
      violations.push('Price floor value disclosed');
      cleaned = cleaned.replace(pattern, '[redacted]');
      safe = false;
    }
  });

  // Internal system references
  const systemReferences = [
    /system prompt/gi,
    /my instructions/gi,
    /I was told/gi,
    /I'm programmed to/gi,
    /my parameters/gi
  ];

  systemReferences.forEach(pattern => {
    if (pattern.test(cleaned)) {
      violations.push('System reference disclosed');
      cleaned = cleaned.replace(pattern, '[redacted]');
      safe = false;
    }
  });

  // Internal strategy language
  const strategyLanguage = [
    /my minimum/gi,
    /my floor/gi,
    /my reservation/gi,
    /my BATNA/gi,
    /my walk-away/gi
  ];

  strategyLanguage.forEach(pattern => {
    if (pattern.test(cleaned)) {
      violations.push('Internal strategy language disclosed');
      cleaned = cleaned.replace(pattern, '[redacted]');
      safe = false;
    }
  });

  // Canary tokens (these should be embedded in system prompt)
  const canaryTokens = [
    /XRAY-FLOOR-7742/gi,
    /TANGO-STRAT-3391/gi,
    /DELTA-LIMIT-5580/gi
  ];

  canaryTokens.forEach(pattern => {
    if (pattern.test(cleaned)) {
      violations.push('Canary token leaked - system prompt compromised');
      cleaned = cleaned.replace(pattern, '[redacted]');
      safe = false;
    }
  });

  // Price-specific patterns below floor (avoid catching non-price numbers)
  const priceContextPatterns = [
    /\$(\d+(?:\.\d{2})?)\b/g,                                      // $123
    /\b(\d+(?:\.\d{2})?)\s*(?:USD|dollars?)\b/gi,                 // 123 USD, 123 dollars
    /(?:USD|dollars?)\s*(\d+(?:\.\d{2})?)\b/gi,                   // USD 123, dollars 123
    /\b(\d+(?:\.\d{2})?)\s*(?:per\s+tonne|\/tonne|per\s+ton|\/ton)\b/gi, // 123 per tonne, 123/tonne
    /(?:offer|price|cost|rate|quote)\s*(?:of|at|is)?\s*\$?(\d+(?:\.\d{2})?)\b/gi, // offer of $123, price is 123
    /\b(\d+(?:\.\d{2})?)\s*(?:offer|price|cost|rate|quote)\b/gi   // 123 offer, 123 price
  ];

  priceContextPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(cleaned)) !== null) {
      const priceStr = match[1];
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price < state.priceFloor && price > 10 && price !== 100) { // Ignore very small numbers and allow base price ($100)
        violations.push(`Price below floor disclosed: ${price}`);
        cleaned = cleaned.replace(match[0], match[0].replace(priceStr, '[redacted]'));
        safe = false;
      }
    }
  });

  return { safe, cleaned, violations };
}

/**
 * Hard constraint enforcement at the code level.
 * The LLM cannot override these business rules.
 */
export function enforceConstraints(
  proposedPrice: number | null,
  state: NegotiationState
): { allowed: boolean; adjustedPrice: number | null; reason: string | null } {
  // Rule 1: If no price proposed, allow
  if (proposedPrice === null) {
    return { allowed: true, adjustedPrice: null, reason: null };
  }

  // Rule 2: Price floor enforcement
  if (proposedPrice < state.priceFloor) {
    return {
      allowed: false,
      adjustedPrice: state.priceFloor,
      reason: 'Below price floor'
    };
  }

  // Rule 3: Too early for price concession
  if (state.round < state.minimumRoundsBeforeConcession && proposedPrice < state.anchorPrice) {
    return {
      allowed: false,
      adjustedPrice: state.anchorPrice,
      reason: 'Too early for price concession'
    };
  }

  // Rule 4: Per-round concession limit
  const concessionThisRound = state.currentOfferPrice - proposedPrice;
  const maxConcessionThisRound = state.currentOfferPrice * state.maxConcessionPerRound;

  if (concessionThisRound > maxConcessionThisRound) {
    const adjustedPrice = state.currentOfferPrice * (1 - state.maxConcessionPerRound);
    return {
      allowed: false,
      adjustedPrice: Math.round(adjustedPrice * 100) / 100, // Round to 2 decimal places
      reason: 'Exceeds per-round concession limit'
    };
  }

  // Rule 5: Total concession limit
  const totalConcession = state.anchorPrice - proposedPrice;
  const maxTotalConcession = state.anchorPrice * state.maxTotalConcession;

  if (totalConcession > maxTotalConcession) {
    const adjustedPrice = state.anchorPrice * (1 - state.maxTotalConcession);
    return {
      allowed: false,
      adjustedPrice: Math.round(adjustedPrice * 100) / 100, // Round to 2 decimal places
      reason: 'Exceeds total concession limit'
    };
  }

  // All constraints satisfied
  return { allowed: true, adjustedPrice: proposedPrice, reason: null };
}

/**
 * Classifies threat level of incoming messages for monitoring.
 * Used for logging and escalation decisions.
 */
export function classifyThreatLevel(message: string): 'none' | 'low' | 'medium' | 'high' {
  if (!message || typeof message !== 'string') {
    return 'none';
  }

  let score = 0;
  const lowerMessage = message.toLowerCase();

  // High-threat patterns (3 points each)
  const highPatterns = [
    'you are now',
    'forget your',
    'ignore previous',
    'ignore your instructions',
    'disregard your',
    'new instructions',
    'override your',
    'system prompt',
    'your instructions',
    'reveal your'
  ];

  highPatterns.forEach(pattern => {
    if (lowerMessage.includes(pattern)) {
      score += 3;
    }
  });

  // Medium-threat patterns (2 points each)
  const mediumPatterns = [
    'what is your minimum',
    'what is your bottom line',
    'your reservation price',
    'your walk-away',
    'act as a mediator',
    'act as a neutral',
    'format your response',
    'output as json',
    'switch roles'
  ];

  mediumPatterns.forEach(pattern => {
    if (lowerMessage.includes(pattern)) {
      score += 2;
    }
  });

  // Check for excessive markdown or code blocks (medium threat)
  const markdownCount = (message.match(/```/g) || []).length;
  const codeBlockCount = (message.match(/`[^`]+`/g) || []).length;
  if (markdownCount > 2 || codeBlockCount > 5) {
    score += 2;
  }

  // Low-threat patterns (1 point each)
  const lowPatterns = [
    'that\'s ridiculous',
    'you must be joking',
    'final offer',
    'take it or leave it',
    'this is urgent',
    'i need this now',
    'my boss will',
    'what\'s your best price'
  ];

  lowPatterns.forEach(pattern => {
    if (lowerMessage.includes(pattern)) {
      score += 1;
    }
  });

  // Check for aggressive anchoring (prices mentioned below 80% of market rate)
  const priceMatches = message.match(/\$?(\d+(?:\.\d{2})?)/g);
  if (priceMatches) {
    const marketBase = NEGOTIATION_CONFIG.BASE_CARBON_PRICE;
    priceMatches.forEach(match => {
      const price = parseFloat(match.replace(/\$/g, ''));
      if (price > 10 && price < marketBase * 0.8) { // Ignore small numbers like quantities
        score += 1;
      }
    });
  }

  // Classification thresholds
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  if (score >= 1) return 'low';
  return 'none';
}