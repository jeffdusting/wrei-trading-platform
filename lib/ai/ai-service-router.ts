/**
 * AI Service Router — Single entry point for all AI calls across the WREI platform.
 *
 * Executes guards in order: rate-limiter → cost-guard → timeout-guard.
 * Selects model per capability (WP6 §3.5). Embeds conciseness directive.
 * Logs every call to audit trail.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIRequest, AIResponse, AIGuardResult, AICapability } from './types';
import { MODEL_MAP, DEFAULT_MAX_TOKENS } from './types';
import { checkRateLimit, recordCall } from './guards/rate-limiter';
import { checkCostGuard, recordTokenUsage } from './guards/cost-guard';
import { withTimeout, getFallbackMessage } from './guards/timeout-guard';
import { withConciseness } from './prompts/system-prompts';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export type AIRouterResult = {
  ok: true;
  response: AIResponse;
} | {
  ok: false;
  guard: string;
  reason: string;
};

/**
 * Route an AI request through all guards, then to the appropriate Claude model.
 */
export async function routeAIRequest(
  request: AIRequest,
  opts?: { userRole?: string }
): Promise<AIRouterResult> {
  const start = Date.now();
  const capability = request.capability;

  // --- Guard 1: Rate Limiter ---
  const rateResult = checkRateLimit({
    userId: request.userId,
    capability,
  });
  if (!rateResult.allowed) {
    logAuditEntry(capability, 'rate_limited', 0, 0, request.userId, rateResult);
    return { ok: false, guard: 'rate_limiter', reason: rateResult.reason! };
  }

  // --- Guard 2: Cost Guard ---
  const costResult = checkCostGuard({
    userId: request.userId,
    organisationId: request.organisationId,
    userRole: opts?.userRole,
    capability,
  });
  if (!costResult.allowed) {
    logAuditEntry(capability, 'cost_limited', 0, 0, request.userId, costResult);
    return { ok: false, guard: 'cost_guard', reason: costResult.reason! };
  }

  // Record the rate-limit call (after both pre-call guards pass)
  if (request.userId) {
    recordCall(request.userId, capability);
  }

  // --- Model & Token Selection ---
  const model = MODEL_MAP[capability];
  const maxTokens = request.maxTokens ?? DEFAULT_MAX_TOKENS[capability];

  // --- Embed Conciseness Directive ---
  const systemPrompt = withConciseness(request.input.systemPrompt);

  // --- Guard 3: Timeout-Wrapped Claude Call ---
  const client = getClient();
  const apiCall = client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: request.input.messages,
  });

  const timeoutResult = await withTimeout(apiCall, capability, request.timeout);

  if (!timeoutResult.ok) {
    logAuditEntry(capability, 'timeout', 0, timeoutResult.durationMs, request.userId, {
      allowed: false,
      reason: 'Timeout',
    });
    // Return timeout fallback as a successful response so callers can handle gracefully
    return {
      ok: true,
      response: {
        output: getFallbackMessage(capability),
        tokensUsed: 0,
        durationMs: timeoutResult.durationMs,
        model,
        cached: false,
      },
    };
  }

  // --- Process Response ---
  const apiResponse = timeoutResult.result;
  const durationMs = Date.now() - start;
  const outputText = apiResponse.content[0]?.type === 'text' ? apiResponse.content[0].text : '';
  const tokensUsed =
    (apiResponse.usage?.input_tokens ?? 0) + (apiResponse.usage?.output_tokens ?? 0);

  // Record token usage for cost tracking
  recordTokenUsage({
    userId: request.userId,
    organisationId: request.organisationId,
    tokens: tokensUsed,
  });

  const response: AIResponse = {
    output: outputText,
    tokensUsed,
    durationMs,
    model,
    cached: apiResponse.usage?.cache_read_input_tokens
      ? apiResponse.usage.cache_read_input_tokens > 0
      : false,
  };

  logAuditEntry(capability, 'success', tokensUsed, durationMs, request.userId, {
    allowed: true,
  });

  return { ok: true, response };
}

// --- Audit Logging ---

function logAuditEntry(
  capability: AICapability,
  outcome: string,
  tokensUsed: number,
  durationMs: number,
  userId: string | undefined,
  guardResult: AIGuardResult
): void {
  console.log(
    `[WREI AI Audit] capability=${capability} outcome=${outcome} ` +
    `tokens=${tokensUsed} duration=${durationMs}ms ` +
    `user=${userId ?? 'anonymous'} guard=${guardResult.allowed ? 'passed' : guardResult.reason}`
  );
}
