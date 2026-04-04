import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { NegotiationState, ClaudeResponse, ArgumentClassification, EmotionalState } from '@/lib/types';
import { sanitiseInput, validateOutput, enforceConstraints, classifyThreatLevel } from '@/lib/defence';
import { buildSystemPrompt } from '@/lib/negotiate/system-prompt';
import { buildMessageHistory } from '@/lib/negotiate/message-history';
import { updateNegotiationState } from '@/lib/negotiate/state-manager';
import {
  generateStrategyExplanation,
  createMockPortfolioContext,
  NegotiationStrategyExplanation,
  InstitutionalNegotiationContext
} from '@/lib/negotiation-strategy';
import {
  CommitteeConfig,
  CommitteeResponse,
  buildCommitteeSystemPromptSection,
  parseCommitteeResponse,
  advanceSpeaker,
} from '@/lib/committee-mode';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  let state: NegotiationState | undefined;

  try {
    // Step 1: Input Processing
    const body = await request.json();
    const { message, state: requestState, isOpening, committee: committeeConfig } = body as {
      message: string;
      state: NegotiationState;
      isOpening: boolean;
      committee?: CommitteeConfig;
    };
    state = requestState;

    // Determine if committee mode is active
    const isCommitteeMode = committeeConfig?.enabled === true;

    let sanitizedMessage = message;
    let threatLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    let threats: string[] = [];

    if (!isOpening && message) {
      // Sanitise input and classify threat level for non-opening messages
      const sanitizeResult = sanitiseInput(message);
      sanitizedMessage = sanitizeResult.cleaned;
      threats = sanitizeResult.threats;
      threatLevel = classifyThreatLevel(message);

      // Log threats for monitoring (in production this would go to proper logging)
      if (threats.length > 0) {
        console.log(`[WREI Security] Threats detected: ${threats.join(', ')} - Level: ${threatLevel}`);
      }
    }

    // Step 2: System Prompt Construction
    let systemPrompt = buildSystemPrompt(state);

    // Step 2a: Append committee mode instructions if active
    if (isCommitteeMode && committeeConfig) {
      systemPrompt += buildCommitteeSystemPromptSection(committeeConfig);
    }

    // Step 3: Build Message History
    const messageHistory = buildMessageHistory(state, sanitizedMessage, isOpening);

    // Step 4: Claude API Call
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: isCommitteeMode ? 2048 : 1024, // Committee mode needs more tokens for multiple perspectives
      system: systemPrompt,
      messages: messageHistory,
    });

    const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';

    // Step 5: Response Processing
    let claudeResponse: ClaudeResponse;
    try {
      claudeResponse = JSON.parse(responseText);
    } catch (error) {
      // If JSON parsing fails, return with default classifications
      claudeResponse = {
        response: responseText.replace(/^```json\n?|\n?```$/g, '').trim() || 'I apologise, but I need to recalibrate my response. Could you please restate your position?',
        argumentClassification: 'general',
        emotionalState: 'neutral',
        detectedWarmth: 5,
        detectedDominance: 5,
        proposedPrice: isOpening ? state.anchorPrice : null, // Set anchor price for opening based on credit type
        suggestedConcession: null,
        escalate: false,
        escalationReason: null
      };
    }

    // For opening messages, ensure proposedPrice is set to anchor if not already
    if (isOpening && claudeResponse.proposedPrice === null) {
      claudeResponse.proposedPrice = state.anchorPrice;
    }

    // Step 6: Output Validation
    const validationResult = validateOutput(claudeResponse.response, state);
    if (!validationResult.safe) {
      console.log(`[WREI Security] Output violations detected: ${validationResult.violations.join(', ')}`);
      claudeResponse.response = validationResult.cleaned;
    }

    // Step 7: Constraint Enforcement
    let adjustedPrice = claudeResponse.proposedPrice;
    let premiumDefence = '';

    if (claudeResponse.proposedPrice !== null) {
      const constraintResult = enforceConstraints(claudeResponse.proposedPrice, state);
      if (!constraintResult.allowed) {
        adjustedPrice = constraintResult.adjustedPrice;
        premiumDefence = ' Our WREI verification premium remains essential to ensuring the digital MRV quality differential that protects your organisation against greenwashing exposure.';
        console.log(`[WREI Constraints] Price adjustment: ${claudeResponse.proposedPrice} -> ${adjustedPrice} (${constraintResult.reason})`);
      }
    }

    // Step 8: Update Negotiation State
    const updatedState = updateNegotiationState(
      state,
      claudeResponse,
      adjustedPrice,
      message,
      claudeResponse.response + premiumDefence,
      isOpening
    );

    // Step 9: Generate Strategy Explanation for Institutional Investors
    let strategyExplanation: NegotiationStrategyExplanation | null = null;

    // Check if this is an institutional persona
    const institutionalPersonas = [
      'esg_impact_investor', 'defi_yield_farmer', 'family_office', 'sovereign_wealth',
      'infrastructure_fund', 'pension_fund'
    ];

    if (institutionalPersonas.includes(state.buyerProfile.persona as string)) {
      try {
        const portfolioContext = createMockPortfolioContext(state.buyerProfile.persona as any);
        const negotiationContext: InstitutionalNegotiationContext = {
          persona: state.buyerProfile.persona as any,
          portfolioContext,
          investorClassification: state.buyerProfile.investorClassification || 'wholesale',
          negotiationObjective: 'acquisition',
          mandateConstraints: {
            priceFloor: state.priceFloor,
            priceCeiling: state.anchorPrice * 1.2, // 20% above anchor as ceiling
            volumeMin: state.buyerProfile.volumeInterest || undefined,
            timeConstraints: state.phase === 'closure' ? 'Negotiation reaching final phase' : undefined
          }
        };

        strategyExplanation = generateStrategyExplanation(
          updatedState,
          negotiationContext,
          `${claudeResponse.response + premiumDefence}`
        );
      } catch (error) {
        console.error('[Strategy Explanation Error]', error);
        // Continue without strategy explanation if generation fails
      }
    }

    // Step 9a: Process Committee Mode Response (if active)
    let committeeResponse: CommitteeResponse | null = null;
    let updatedCommitteeConfig: CommitteeConfig | null = null;

    if (isCommitteeMode && committeeConfig) {
      try {
        // Parse the raw Claude response for committee perspectives
        const rawParsed = JSON.parse(responseText);
        committeeResponse = parseCommitteeResponse(
          rawParsed,
          committeeConfig,
          adjustedPrice || state.currentOfferPrice,
          state.anchorPrice,
          state.round,
          state.phase
        );

        // Advance the speaker for next round
        updatedCommitteeConfig = advanceSpeaker({
          ...committeeConfig,
          roundsCompleted: committeeResponse.roundsCompleted,
          currentSpeakerIndex: committeeResponse.currentSpeakerIndex,
        });

        // Update member stances in committee config based on perspectives
        if (committeeResponse.perspectives.length > 0) {
          updatedCommitteeConfig.members = updatedCommitteeConfig.members.map(member => {
            const perspective = committeeResponse!.perspectives.find(p => p.role === member.role);
            if (perspective) {
              return {
                ...member,
                stance: perspective.stance,
                reasoning: perspective.response,
                concerns: perspective.concerns,
                conditions: perspective.conditions,
              };
            }
            return member;
          });
        }

        // Store committee decisions
        if (committeeResponse.decision) {
          updatedCommitteeConfig.decisions = [
            ...updatedCommitteeConfig.decisions,
            committeeResponse.decision,
          ];
        }

        console.log(`[WREI Committee] Round ${committeeConfig.roundsCompleted + 1} processed. Perspectives: ${committeeResponse.perspectives.length}. Decision: ${committeeResponse.decision?.outcome || 'pending'}`);
      } catch (committeeError) {
        console.error('[WREI Committee] Error processing committee response:', committeeError);
        // Fall back to default committee response based on negotiation state
        committeeResponse = parseCommitteeResponse(
          {},
          committeeConfig,
          adjustedPrice || state.currentOfferPrice,
          state.anchorPrice,
          state.round,
          state.phase
        );
        updatedCommitteeConfig = advanceSpeaker(committeeConfig);
      }
    }

    // Step 10: Return Response
    return Response.json({
      agentMessage: claudeResponse.response + premiumDefence,
      state: updatedState,
      classification: claudeResponse.argumentClassification,
      emotionalState: claudeResponse.emotionalState,
      threatLevel,
      tokenMetadata: updatedState.tokenMetadata || null, // Include metadata in response
      strategyExplanation, // Add strategy explanation for institutional investors
      // Committee mode data (only present when committee mode is active)
      ...(isCommitteeMode && {
        committeeResponse,
        committeeConfig: updatedCommitteeConfig,
      }),
    });

  } catch (error) {
    console.error('[WREI API Error]', error);

    // Log more specific error details for debugging
    if (error instanceof Error) {
      console.error('[WREI API Error Details]', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      });
    }

    // Graceful error handling - never expose internal errors
    return Response.json({
      agentMessage: "The WREI platform is momentarily unavailable. Please try again.",
      state: state || null,
      classification: 'general' as ArgumentClassification,
      emotionalState: 'neutral' as EmotionalState,
      threatLevel: 'none' as const,
      error: "Service temporarily unavailable"
    }, { status: 500 });
  }
}
