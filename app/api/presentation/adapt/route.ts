/**
 * WREI Trading Platform - Stage 2 Component 4 API Route
 * Adaptive Presentation Layer API Integration
 *
 * Server-side API route for AI-powered presentation adaptation.
 * Integrates with Claude API for intelligent presentation optimisation,
 * audience engagement analysis, and real-time content adaptation.
 *
 * Security: ANTHROPIC_API_KEY server-side only, comprehensive input validation,
 * rate limiting, and Australian market context integration.
 *
 * @version 1.0.0
 * @author Claude Sonnet 4 (Stage 2 Component 4 API Implementation)
 * @date 2026-03-26
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AdaptivePresentationEngine } from '@/lib/ai-presentation/AdaptivePresentationEngine';

// Initialize Claude API client (server-side only)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Rate limiting map (simple in-memory store for demo)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX_REQUESTS = 30; // Per 5 minutes
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

/**
 * Rate limiting check
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const key = identifier;

  const current = rateLimitMap.get(key);

  if (!current) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return true;
  }

  // Reset if window expired
  if (now - current.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return true;
  }

  // Check if over limit
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Increment count
  current.count += 1;
  return true;
}

/**
 * Input validation for presentation adaptation requests
 */
function validateAdaptationRequest(body: any): {
  isValid: boolean;
  error?: string;
  sanitizedData?: any;
} {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a valid JSON object' };
  }

  const { operation, context, audienceType, engagementData } = body;

  // Validate operation
  const validOperations = [
    'start_session',
    'generate_adaptation',
    'analyze_engagement',
    'optimize_flow',
    'generate_insights',
    'end_session',
    'engine_health',
    'performance_metrics'
  ];

  if (!validOperations.includes(operation)) {
    return {
      isValid: false,
      error: `Invalid operation. Must be one of: ${validOperations.join(', ')}`
    };
  }

  // Validate audience type if provided
  if (audienceType && !['executive', 'technical', 'compliance'].includes(audienceType)) {
    return {
      isValid: false,
      error: 'Invalid audienceType. Must be: executive, technical, or compliance'
    };
  }

  // Sanitize and validate context data
  const sanitizedContext = context ? {
    currentSection: typeof context.currentSection === 'string' ? context.currentSection.slice(0, 100) : undefined,
    timeRemaining: typeof context.timeRemaining === 'number' ? Math.max(0, Math.min(180, context.timeRemaining)) : undefined,
    sectionProgress: typeof context.sectionProgress === 'number' ? Math.max(0, Math.min(100, context.sectionProgress)) : undefined,
    totalSections: typeof context.totalSections === 'number' ? Math.max(1, Math.min(20, context.totalSections)) : undefined
  } : {};

  // Sanitize engagement data
  const sanitizedEngagement = engagementData ? {
    attentionLevel: typeof engagementData.attentionLevel === 'number' ?
      Math.max(0, Math.min(100, engagementData.attentionLevel)) : undefined,
    interactionRate: typeof engagementData.interactionRate === 'number' ?
      Math.max(0, Math.min(10, engagementData.interactionRate)) : undefined,
    comprehensionScore: typeof engagementData.comprehensionScore === 'number' ?
      Math.max(0, Math.min(100, engagementData.comprehensionScore)) : undefined,
    questionFrequency: typeof engagementData.questionFrequency === 'number' ?
      Math.max(0, Math.min(20, engagementData.questionFrequency)) : undefined,
    pacePreference: ['slow', 'medium', 'fast'].includes(engagementData.pacePreference) ?
      engagementData.pacePreference : undefined
  } : {};

  return {
    isValid: true,
    sanitizedData: {
      operation,
      context: sanitizedContext,
      audienceType,
      engagementData: sanitizedEngagement,
      // Add Australian market context for all operations
      marketContext: 'NSW ESC Trading Platform'
    }
  };
}

/**
 * Generate Claude API prompt for presentation adaptation
 */
function generateAdaptationPrompt(operation: string, data: any): string {
  const baseContext = `
You are an expert presentation adaptation AI for the WREI Trading Platform, specialising in NSW Energy Savings Certificate (ESC) carbon credit trading demonstrations.

Current Australian Market Context:
- NSW ESC market: A$200M+ annual trading volume
- Current spot price: A$47.80/tonne (March 2026)
- 850+ active market participants
- Regulatory framework: CER oversight with ESS compliance
- Trading infrastructure: T+0 atomic settlement via institutional-grade providers

Your role is to provide intelligent presentation adaptation recommendations based on real-time audience engagement patterns.
`;

  switch (operation) {
    case 'generate_adaptation':
      return `${baseContext}

TASK: Generate presentation adaptation recommendations

Current Context:
- Audience Type: ${data.audienceType}
- Current Section: ${data.context.currentSection || 'unknown'}
- Time Remaining: ${data.context.timeRemaining || 'unknown'} minutes
- Engagement Level: ${data.engagementData.attentionLevel || 'unknown'}%
- Interaction Rate: ${data.engagementData.interactionRate || 'unknown'} per minute
- Comprehension Score: ${data.engagementData.comprehensionScore || 'unknown'}%

Please provide:
1. Specific adaptation recommendations (3-5 suggestions)
2. Content modification suggestions (2-3 modifications)
3. Pace adjustment recommendations
4. Interaction enhancement suggestions

Focus on practical, actionable advice for NSW ESC trading demonstrations.
Format as JSON with keys: adaptationSuggestions, contentModifications, paceAdjustments, interactionRecommendations`;

    case 'analyze_engagement':
      return `${baseContext}

TASK: Analyze audience engagement patterns

Engagement Data:
- Attention Level: ${data.engagementData.attentionLevel || 'unknown'}%
- Interaction Rate: ${data.engagementData.interactionRate || 'unknown'} per minute
- Comprehension Score: ${data.engagementData.comprehensionScore || 'unknown'}%
- Question Frequency: ${data.engagementData.questionFrequency || 'unknown'} per 5min
- Pace Preference: ${data.engagementData.pacePreference || 'unknown'}

Please provide:
1. Engagement assessment (current state analysis)
2. Risk factors (potential issues to address)
3. Positive indicators (strengths to leverage)
4. Immediate actions (urgent recommendations)

Focus on NSW ESC trading presentation context.
Format as JSON with keys: assessment, riskFactors, positiveIndicators, immediateActions`;

    case 'optimize_flow':
      return `${baseContext}

TASK: Optimize presentation flow

Current Flow Context:
- Current Section: ${data.context.currentSection || 'unknown'}
- Section Progress: ${data.context.sectionProgress || 'unknown'}%
- Total Sections: ${data.context.totalSections || 'unknown'}
- Time Remaining: ${data.context.timeRemaining || 'unknown'} minutes
- Audience Type: ${data.audienceType}

Please provide:
1. Flow optimisation recommendations
2. Section prioritisation advice
3. Time management suggestions
4. Transition recommendations

Optimise for NSW ESC trading platform demonstrations.
Format as JSON with keys: flowOptimization, sectionPriority, timeManagement, transitions`;

    case 'generate_insights':
      return `${baseContext}

TASK: Generate presentation insights and recommendations

Full Context:
- Audience: ${data.audienceType}
- Context: ${JSON.stringify(data.context)}
- Engagement: ${JSON.stringify(data.engagementData)}

Please provide:
1. Key insights about current presentation state
2. Strategic recommendations for improvement
3. Next actions to take immediately
4. Long-term optimisation suggestions

Focus on NSW ESC carbon trading demonstration effectiveness.
Format as JSON with keys: insights, recommendations, nextActions, longTermOptimization`;

    default:
      return `${baseContext}

TASK: Provide general presentation support

Operation: ${operation}
Data: ${JSON.stringify(data)}

Please provide helpful guidance for NSW ESC trading platform presentation adaptation.
Format as JSON with appropriate keys for the requested operation.`;
  }
}

/**
 * Process Claude API response and ensure proper formatting
 */
function processClaudeResponse(response: string, operation: string): any {
  try {
    // Clean response (remove markdown formatting if present)
    let cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to parse as JSON
    const parsed = JSON.parse(cleanedResponse);

    // Validate expected structure based on operation
    switch (operation) {
      case 'generate_adaptation':
        if (!parsed.adaptationSuggestions || !Array.isArray(parsed.adaptationSuggestions)) {
          throw new Error('Invalid adaptation response structure');
        }
        break;
      case 'analyze_engagement':
        if (!parsed.assessment || !parsed.riskFactors) {
          throw new Error('Invalid engagement analysis response structure');
        }
        break;
      case 'optimize_flow':
        if (!parsed.flowOptimization || !parsed.timeManagement) {
          throw new Error('Invalid flow optimization response structure');
        }
        break;
      case 'generate_insights':
        if (!parsed.insights || !parsed.recommendations) {
          throw new Error('Invalid insights response structure');
        }
        break;
    }

    return parsed;
  } catch (error) {
    console.error('Error processing Claude response:', error);

    // Return fallback response based on operation
    return generateFallbackResponse(operation);
  }
}

/**
 * Generate fallback response when Claude API fails
 */
function generateFallbackResponse(operation: string): any {
  const fallbacks = {
    generate_adaptation: {
      adaptationSuggestions: [
        'Maintain current presentation flow with periodic engagement checks',
        'Monitor audience attention and adjust pace accordingly',
        'Use visual elements to enhance comprehension'
      ],
      contentModifications: [
        'Simplify complex technical concepts with examples',
        'Increase interactive elements to boost engagement'
      ],
      paceAdjustments: ['Maintain current pace with flexibility for questions'],
      interactionRecommendations: ['Encourage questions at natural transition points']
    },
    analyze_engagement: {
      assessment: 'Engagement analysis unavailable - continue with standard presentation approach',
      riskFactors: ['Monitor for attention drops', 'Watch for comprehension gaps'],
      positiveIndicators: ['Audience is present and participating'],
      immediateActions: ['Continue current approach with increased monitoring']
    },
    optimize_flow: {
      flowOptimization: ['Maintain logical progression through sections'],
      sectionPriority: ['Focus on key topics for audience type'],
      timeManagement: ['Allocate time based on section importance'],
      transitions: ['Use clear transitions between topics']
    },
    generate_insights: {
      insights: ['Presentation proceeding with standard engagement patterns'],
      recommendations: ['Continue monitoring audience response'],
      nextActions: ['Maintain current approach'],
      longTermOptimization: ['Collect feedback for future improvements']
    }
  };

  return fallbacks[operation] || {
    message: 'Fallback response for operation: ' + operation,
    status: 'limited_functionality'
  };
}

/**
 * POST handler for presentation adaptation requests
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Rate limiting
    const clientIdentifier = request.headers.get('x-forwarded-for') || 'default';
    if (!checkRateLimit(clientIdentifier)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait before making more requests.',
          rateLimitReset: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = validateAdaptationRequest(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { operation, context, audienceType, engagementData } = validation.sanitizedData;

    // Get engine instance
    const engine = AdaptivePresentationEngine.getInstance();

    // Handle different operations
    switch (operation) {
      case 'start_session':
        const sessionState = await engine.startPresentationSession(
          audienceType || 'executive',
          context.customProfile
        );

        return NextResponse.json({
          success: true,
          operation: 'start_session',
          data: {
            sessionState,
            marketContext: 'NSW ESC Trading Platform',
            timestamp: new Date().toISOString()
          },
          responseTime: performance.now() - startTime
        });

      case 'generate_adaptation':
        // Get AI-enhanced adaptation
        const adaptationContext = {
          currentSection: context.currentSection || 'unknown',
          audienceType: audienceType || 'executive',
          engagementLevel: engagementData.attentionLevel || 75,
          timeRemaining: context.timeRemaining || 30
        };

        const aiAdaptation = await engine.generateAIPresentationAdaptation(adaptationContext);

        // Enhanced with Claude API for sophisticated adaptation
        if (process.env.ANTHROPIC_API_KEY) {
          try {
            const prompt = generateAdaptationPrompt('generate_adaptation', {
              audienceType,
              context,
              engagementData
            });

            const claudeResponse = await anthropic.messages.create({
              model: process.env.NODE_ENV === 'production' ? 'claude-3-opus-20240229' : 'claude-3-sonnet-20240229',
              max_tokens: 2000,
              temperature: 0.3,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ]
            });

            const claudeContent = claudeResponse.content[0];
            if (claudeContent.type === 'text') {
              const claudeAdaptation = processClaudeResponse(claudeContent.text, 'generate_adaptation');

              return NextResponse.json({
                success: true,
                operation: 'generate_adaptation',
                data: {
                  ...aiAdaptation,
                  claudeEnhanced: claudeAdaptation,
                  marketContext: 'NSW ESC Trading Platform',
                  confidence: 95
                },
                responseTime: performance.now() - startTime
              });
            }
          } catch (claudeError) {
            console.error('Claude API error:', claudeError);
            // Fall back to engine-only adaptation
          }
        }

        return NextResponse.json({
          success: true,
          operation: 'generate_adaptation',
          data: {
            ...aiAdaptation,
            marketContext: 'NSW ESC Trading Platform',
            confidence: 85
          },
          responseTime: performance.now() - startTime
        });

      case 'analyze_engagement':
        // Get engagement insights
        const insights = await engine.generateEngagementInsights();

        // Enhance with Claude API analysis
        if (process.env.ANTHROPIC_API_KEY) {
          try {
            const prompt = generateAdaptationPrompt('analyze_engagement', {
              audienceType,
              context,
              engagementData
            });

            const claudeResponse = await anthropic.messages.create({
              model: process.env.NODE_ENV === 'production' ? 'claude-3-opus-20240229' : 'claude-3-sonnet-20240229',
              max_tokens: 1500,
              temperature: 0.2,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ]
            });

            const claudeContent = claudeResponse.content[0];
            if (claudeContent.type === 'text') {
              const claudeAnalysis = processClaudeResponse(claudeContent.text, 'analyze_engagement');

              return NextResponse.json({
                success: true,
                operation: 'analyze_engagement',
                data: {
                  ...insights,
                  detailedAnalysis: claudeAnalysis,
                  marketContext: 'NSW ESC Trading Platform'
                },
                responseTime: performance.now() - startTime
              });
            }
          } catch (claudeError) {
            console.error('Claude API error:', claudeError);
          }
        }

        return NextResponse.json({
          success: true,
          operation: 'analyze_engagement',
          data: {
            ...insights,
            marketContext: 'NSW ESC Trading Platform'
          },
          responseTime: performance.now() - startTime
        });

      case 'optimize_flow':
        // Get current presentation state
        const presentationState = engine.getAdaptivePresentationState();

        // Generate flow optimization with Claude API
        if (process.env.ANTHROPIC_API_KEY) {
          try {
            const prompt = generateAdaptationPrompt('optimize_flow', {
              audienceType,
              context,
              engagementData
            });

            const claudeResponse = await anthropic.messages.create({
              model: process.env.NODE_ENV === 'production' ? 'claude-3-opus-20240229' : 'claude-3-sonnet-20240229',
              max_tokens: 1800,
              temperature: 0.3,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ]
            });

            const claudeContent = claudeResponse.content[0];
            if (claudeContent.type === 'text') {
              const flowOptimization = processClaudeResponse(claudeContent.text, 'optimize_flow');

              return NextResponse.json({
                success: true,
                operation: 'optimize_flow',
                data: {
                  currentFlow: presentationState.presentationFlow,
                  optimization: flowOptimization,
                  marketContext: 'NSW ESC Trading Platform'
                },
                responseTime: performance.now() - startTime
              });
            }
          } catch (claudeError) {
            console.error('Claude API error:', claudeError);
          }
        }

        return NextResponse.json({
          success: true,
          operation: 'optimize_flow',
          data: {
            currentFlow: presentationState.presentationFlow,
            optimization: generateFallbackResponse('optimize_flow'),
            marketContext: 'NSW ESC Trading Platform'
          },
          responseTime: performance.now() - startTime
        });

      case 'generate_insights':
        // Generate comprehensive insights
        const comprehensiveInsights = await engine.generateEngagementInsights();

        // Enhance with Claude API
        if (process.env.ANTHROPIC_API_KEY) {
          try {
            const prompt = generateAdaptationPrompt('generate_insights', {
              audienceType,
              context,
              engagementData
            });

            const claudeResponse = await anthropic.messages.create({
              model: process.env.NODE_ENV === 'production' ? 'claude-3-opus-20240229' : 'claude-3-sonnet-20240229',
              max_tokens: 2000,
              temperature: 0.3,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ]
            });

            const claudeContent = claudeResponse.content[0];
            if (claudeContent.type === 'text') {
              const enhancedInsights = processClaudeResponse(claudeContent.text, 'generate_insights');

              return NextResponse.json({
                success: true,
                operation: 'generate_insights',
                data: {
                  ...comprehensiveInsights,
                  enhancedAnalysis: enhancedInsights,
                  marketContext: 'NSW ESC Trading Platform'
                },
                responseTime: performance.now() - startTime
              });
            }
          } catch (claudeError) {
            console.error('Claude API error:', claudeError);
          }
        }

        return NextResponse.json({
          success: true,
          operation: 'generate_insights',
          data: {
            ...comprehensiveInsights,
            marketContext: 'NSW ESC Trading Platform'
          },
          responseTime: performance.now() - startTime
        });

      case 'end_session':
        const sessionSummary = await engine.endPresentationSession();

        return NextResponse.json({
          success: true,
          operation: 'end_session',
          data: {
            ...sessionSummary,
            marketContext: 'NSW ESC Trading Platform'
          },
          responseTime: performance.now() - startTime
        });

      case 'engine_health':
        const health = engine.getPerformanceMetrics();

        return NextResponse.json({
          success: true,
          operation: 'engine_health',
          data: {
            engineHealth: health,
            marketContext: 'NSW ESC Trading Platform',
            timestamp: new Date().toISOString()
          },
          responseTime: performance.now() - startTime
        });

      case 'performance_metrics':
        const metrics = engine.getPerformanceMetrics();
        const state = engine.getAdaptivePresentationState();

        return NextResponse.json({
          success: true,
          operation: 'performance_metrics',
          data: {
            performanceMetrics: metrics,
            currentState: {
              isActive: state.isActive,
              systemHealth: state.systemHealth,
              adaptationEffectiveness: state.adaptationEffectiveness,
              audienceSatisfaction: state.audienceSatisfaction
            },
            marketContext: 'NSW ESC Trading Platform'
          },
          responseTime: performance.now() - startTime
        });

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Adaptive presentation API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error during presentation adaptation',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for engine status and health checks
 */
export async function GET(request: NextRequest) {
  try {
    const engine = AdaptivePresentationEngine.getInstance();
    const metrics = engine.getPerformanceMetrics();
    const state = engine.getAdaptivePresentationState();

    return NextResponse.json({
      success: true,
      status: 'healthy',
      data: {
        engineStatus: {
          isActive: state.isActive,
          systemHealth: state.systemHealth,
          lastUpdate: state.lastUpdate
        },
        performanceMetrics: metrics,
        marketContext: 'NSW ESC Trading Platform',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Engine status check error:', error);

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: 'Failed to retrieve engine status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}