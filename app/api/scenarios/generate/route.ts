/**
 * WREI Trading Platform - AI Scenario Generation API
 *
 * Stage 2 Component 2: Dynamic Scenario Generation API Route
 * Server-side Claude API integration for generating realistic trading scenarios
 *
 * Date: March 26, 2026
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AudienceType } from '@/components/audience';

// Claude API client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Rate limiting and security
const API_RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 20,
  MAX_REQUESTS_PER_HOUR: 150,
  MAX_PAYLOAD_SIZE: 25000, // 25KB
} as const;

// NSW ESC context for scenario generation
const NSW_ESC_SCENARIO_CONTEXT = `
NSW Energy Savings Scheme (ESS) Trading Platform - Scenario Generation Context:
- Market Size: A$200M annual trading volume
- Current Spot Price: A$47.80 per tonne (AEMO pricing)
- Major Participants: Energy Retailers, Large Energy Users, ACPs, Traders
- Compliance Deadlines: March 31 and December 31
- Market Volatility: 18% annualised, ranging A$35-65 historically
- Average Trade Size: 1000 tonnes
- Settlement: T+0 atomic settlement
- Regulatory Updates: ESS Rule Changes, CER Updates, AFSL Changes

Generate realistic trading scenarios that incorporate:
1. Market condition dynamics (bull/bear/volatile/stable/crisis)
2. Participant behavior models based on risk appetite
3. Regulatory compliance pressures
4. Price volatility and market movements
5. Audience-appropriate complexity levels
`;

/**
 * Input sanitisation for scenario generation requests
 */
function sanitiseScenarioRequest(body: any): any {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  // Remove potentially dangerous content
  const sanitised = JSON.parse(JSON.stringify(body).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));

  // Validate required fields
  const requiredFields = ['operation', 'audience'];
  for (const field of requiredFields) {
    if (!sanitised[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return sanitised;
}

/**
 * Generate market condition scenario prompt
 */
function buildMarketConditionPrompt(config: any, marketData: any): string {
  return `${NSW_ESC_SCENARIO_CONTEXT}

SCENARIO GENERATION REQUEST:
Operation: ${config.operation}
Audience: ${config.audience}
Market Condition: ${config.marketCondition || 'stable'}
Complexity: ${config.complexity || 'moderate'}
Duration: ${config.duration || '30 minutes'}

Current Market Data:
- Spot Price: A$${marketData?.currentPrice || '47.80'}
- Volume: ${marketData?.volume || '1,250,000'} tonnes
- Volatility: ${marketData?.volatility || '18%'}

Generate a realistic trading scenario that includes:
1. Market trajectory and key price movements
2. Participant mix and behavior patterns
3. Risk factors and opportunities
4. Regulatory considerations
5. Timeline of events

Provide response as structured JSON with scenario details, participant profiles, and market conditions.
Format: { "scenario": {...}, "participants": [...], "marketConditions": {...} }`;
}

/**
 * Generate fallback scenario when Claude API fails
 */
function generateFallbackScenario(operation: string): any {
  const fallbacks: Record<string, any> = {
    generate_scenario: {
      scenario: {
        id: `fallback-scenario-${Date.now()}`,
        name: 'NSW ESC Standard Trading Scenario',
        description: 'A typical trading day in the NSW Energy Savings Scheme market',
        marketCondition: 'stable',
        duration: 30,
        complexity: 'moderate'
      },
      participants: [
        {
          type: 'Energy Retailer',
          riskAppetite: 'moderate',
          tradingVolume: '10,000 tonnes',
          strategy: 'compliance-focused'
        },
        {
          type: 'Large Energy User',
          riskAppetite: 'low',
          tradingVolume: '5,000 tonnes',
          strategy: 'cost-minimisation'
        }
      ],
      marketConditions: {
        startPrice: 47.80,
        endPrice: 48.20,
        volatility: 0.15,
        volume: 125000,
        trend: 'stable'
      }
    }
  };

  return fallbacks[operation] || {
    message: 'Fallback scenario for operation: ' + operation,
    status: 'limited_functionality'
  };
}

/**
 * POST /api/scenarios/generate
 * Generate AI-powered trading scenarios
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sanitisedRequest = sanitiseScenarioRequest(body);

    const { operation, audience, config } = sanitisedRequest;

    // Validate audience type
    const validAudiences: AudienceType[] = ['executive', 'technical', 'compliance'];
    if (!validAudiences.includes(audience)) {
      return NextResponse.json(
        { error: 'Invalid audience type' },
        { status: 400 }
      );
    }

    // Rate limiting check (simplified)
    const contentLength = JSON.stringify(body).length;
    if (contentLength > API_RATE_LIMITS.MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    // Generate scenario using Claude API
    try {
      const prompt = buildMarketConditionPrompt(config, sanitisedRequest.marketData);

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude API');
      }

      // Parse Claude's response
      let scenarioData;
      try {
        scenarioData = JSON.parse(content.text);
      } catch {
        // Handle non-JSON response
        scenarioData = {
          scenario: { description: content.text },
          operation: operation,
          audience: audience
        };
      }

      return NextResponse.json({
        success: true,
        data: scenarioData,
        metadata: {
          operation,
          audience,
          timestamp: new Date().toISOString(),
          model: 'claude-3-sonnet-20240229'
        }
      });

    } catch (claudeError) {
      console.error('Claude API error in scenario generation:', claudeError);

      // Return fallback scenario
      const fallbackData = generateFallbackScenario(operation);

      return NextResponse.json({
        success: true,
        data: fallbackData,
        metadata: {
          operation,
          audience,
          timestamp: new Date().toISOString(),
          fallback: true,
          fallbackReason: 'Claude API unavailable'
        }
      });
    }

  } catch (error) {
    console.error('Scenario generation API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error during scenario generation',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'An error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}