/**
 * WREI Trading Platform - Intelligent Analytics Prediction API
 *
 * Stage 2 Component 3: AI-Enhanced Predictive Analytics API Route
 * Server-side Claude API integration for generating market forecasts,
 * risk predictions, and performance optimisations
 *
 * Date: March 26, 2026
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { IntelligentAnalyticsEngine } from '@/lib/ai-analytics/IntelligentAnalyticsEngine';
import { AudienceType } from '@/components/audience';
import {
  PredictiveAnalytics,
  MarketForecast,
  RiskPredictions,
  PerformanceOptimisation,
  CompetitiveIntelligence
} from '@/components/analytics/types';

// Claude API client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Rate limiting and security
const API_RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 30,
  MAX_REQUESTS_PER_HOUR: 200,
  MAX_PAYLOAD_SIZE: 50000, // 50KB
} as const;

// NSW ESC context for AI prompts
const NSW_ESC_AI_CONTEXT = `
NSW Energy Savings Scheme (ESS) Trading Platform Context:
- Market Size: A$200M annual trading volume
- Current Spot Price: A$47.80 per tonne
- Market Participants: 850+ active participants
- Northmore Gordon Market Share: 12%
- Regulatory Framework: Clean Energy Regulator (CER) oversight
- Compliance Deadlines: March 31 and December 31 annually
- Market Volatility: 18% annualised
- Settlement: T+0 atomic settlement via blockchain infrastructure
- Our Competitive Advantage: AI-powered negotiation delivering 18.5% price improvements

Key Market Participants:
1. Energy Trading Solutions Pty Ltd (18% market share)
2. Carbon Markets Australia (15% market share)
3. Northmore Gordon Pty Ltd (12% market share) - Our Position
4. Various smaller traders and brokers (55% combined)

Current Market Trends:
- Increasing corporate sustainability commitments driving demand
- ESS target expansion creating supply-demand imbalances
- Technology adoption improving market efficiency
- Regulatory changes enhancing transparency and compliance requirements
`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request
    const body = await request.json();
    const { action, sessionId, audienceType, forceRefresh = false } = body;

    // Validate required fields
    if (!action || !sessionId || !audienceType) {
      return NextResponse.json(
        {
          error: 'Missing required fields: action, sessionId, audienceType',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Validate audience type
    if (!['executive', 'technical', 'compliance'].includes(audienceType)) {
      return NextResponse.json(
        {
          error: 'Invalid audienceType. Must be: executive, technical, or compliance',
          code: 'INVALID_AUDIENCE'
        },
        { status: 400 }
      );
    }

    // Get intelligent analytics engine instance
    const analyticsEngine = IntelligentAnalyticsEngine.getInstance();

    // Route to appropriate prediction handler
    let result: any;
    let processingTime: number;

    switch (action) {
      case 'generate_full_analysis':
        result = await handleFullAnalysisGeneration(
          sessionId,
          audienceType as AudienceType,
          forceRefresh,
          analyticsEngine
        );
        break;

      case 'generate_market_forecast':
        result = await handleMarketForecastGeneration(
          sessionId,
          audienceType as AudienceType,
          analyticsEngine
        );
        break;

      case 'generate_risk_predictions':
        result = await handleRiskPredictionGeneration(
          sessionId,
          audienceType as AudienceType,
          analyticsEngine
        );
        break;

      case 'generate_performance_optimisation':
        result = await handlePerformanceOptimisationGeneration(
          sessionId,
          audienceType as AudienceType,
          analyticsEngine
        );
        break;

      case 'generate_competitive_intelligence':
        result = await handleCompetitiveIntelligenceGeneration(
          sessionId,
          audienceType as AudienceType,
          analyticsEngine
        );
        break;

      case 'engine_health':
        result = analyticsEngine.healthCheck();
        break;

      case 'performance_metrics':
        result = analyticsEngine.getPerformanceMetrics();
        break;

      default:
        return NextResponse.json(
          {
            error: `Invalid action: ${action}. Valid actions: generate_full_analysis, generate_market_forecast, generate_risk_predictions, generate_performance_optimisation, generate_competitive_intelligence, engine_health, performance_metrics`,
            code: 'INVALID_ACTION'
          },
          { status: 400 }
        );
    }

    processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        sessionId,
        audienceType,
        action,
        processingTime,
        timestamp: new Date().toISOString(),
        source: 'WREI_INTELLIGENT_ANALYTICS_ENGINE'
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('[Analytics Predict API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'PREDICTION_ERROR',
        metadata: {
          processingTime,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Handle full predictive analytics generation
 */
async function handleFullAnalysisGeneration(
  sessionId: string,
  audienceType: AudienceType,
  forceRefresh: boolean,
  analyticsEngine: IntelligentAnalyticsEngine
): Promise<PredictiveAnalytics> {

  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cached = analyticsEngine.getCachedPredictions(sessionId, audienceType);
    if (cached) {
      const cacheAge = Date.now() - cached.timestamp.getTime();
      if (cacheAge < 300000) { // 5 minutes cache
        return cached;
      }
    }
  }

  // Generate comprehensive AI-enhanced analysis
  const analysis = await analyticsEngine.generatePredictiveAnalytics(
    sessionId,
    audienceType,
    forceRefresh
  );

  // For demonstration, we're using the engine's built-in intelligence
  // In production, this would integrate with Claude API for additional insights
  if (process.env.ANTHROPIC_API_KEY && false) { // Disabled for demo
    const aiEnhancement = await enhanceAnalysisWithClaude(analysis, audienceType);
    analysis.ai_insights = { ...analysis.ai_insights, ...aiEnhancement };
  }

  return analysis;
}

/**
 * Handle market forecast generation
 */
async function handleMarketForecastGeneration(
  sessionId: string,
  audienceType: AudienceType,
  analyticsEngine: IntelligentAnalyticsEngine
): Promise<MarketForecast> {

  const analysis = await analyticsEngine.generatePredictiveAnalytics(
    sessionId,
    audienceType
  );

  return analysis.market_forecast;
}

/**
 * Handle risk predictions generation
 */
async function handleRiskPredictionGeneration(
  sessionId: string,
  audienceType: AudienceType,
  analyticsEngine: IntelligentAnalyticsEngine
): Promise<RiskPredictions> {

  const analysis = await analyticsEngine.generatePredictiveAnalytics(
    sessionId,
    audienceType
  );

  return analysis.risk_predictions;
}

/**
 * Handle performance optimisation generation
 */
async function handlePerformanceOptimisationGeneration(
  sessionId: string,
  audienceType: AudienceType,
  analyticsEngine: IntelligentAnalyticsEngine
): Promise<PerformanceOptimisation> {

  const analysis = await analyticsEngine.generatePredictiveAnalytics(
    sessionId,
    audienceType
  );

  return analysis.performance_optimisation;
}

/**
 * Handle competitive intelligence generation
 */
async function handleCompetitiveIntelligenceGeneration(
  sessionId: string,
  audienceType: AudienceType,
  analyticsEngine: IntelligentAnalyticsEngine
): Promise<CompetitiveIntelligence> {

  const analysis = await analyticsEngine.generatePredictiveAnalytics(
    sessionId,
    audienceType
  );

  return analysis.competitive_intelligence;
}

/**
 * Enhance analysis with Claude API (disabled for demo)
 * This function shows how Claude API integration would work in production
 */
async function enhanceAnalysisWithClaude(
  analysis: PredictiveAnalytics,
  audienceType: AudienceType
): Promise<Partial<any>> {

  const prompt = `${NSW_ESC_AI_CONTEXT}

Based on the following predictive analytics data, provide additional AI insights for a ${audienceType} audience:

Market Forecast: ${JSON.stringify(analysis.market_forecast, null, 2)}

Risk Predictions: ${JSON.stringify(analysis.risk_predictions, null, 2)}

Please provide:
1. 3-5 key strategic insights
2. Specific recommendations for this audience
3. Early warning indicators to monitor
4. Confidence assessment of predictions

Response should be in JSON format optimised for ${audienceType} decision making.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more focused analysis
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch (parseError) {
        console.warn('[Claude API] Failed to parse JSON response:', parseError);
        return { raw_insights: content.text };
      }
    }

    return {};
  } catch (error) {
    console.error('[Claude API] Enhancement failed:', error);
    return {};
  }
}

// GET method for health checks
export async function GET(request: NextRequest) {
  try {
    const analyticsEngine = IntelligentAnalyticsEngine.getInstance();
    const healthStatus = analyticsEngine.healthCheck();
    const performanceMetrics = analyticsEngine.getPerformanceMetrics();

    return NextResponse.json({
      success: true,
      data: {
        health: healthStatus,
        performance: performanceMetrics,
        engine_state: analyticsEngine.getEngineState().engine_status
      },
      metadata: {
        endpoint: '/api/analytics/predict',
        timestamp: new Date().toISOString(),
        source: 'WREI_INTELLIGENT_ANALYTICS_ENGINE'
      }
    });

  } catch (error) {
    console.error('[Analytics Predict API] Health check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Health check failed',
        code: 'HEALTH_CHECK_ERROR'
      },
      { status: 500 }
    );
  }
}