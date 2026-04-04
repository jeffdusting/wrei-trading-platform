/**
 * AI Engine type definitions for the WREI Trading Platform.
 * All AI capabilities are routed through the AI Service Router
 * with guard enforcement (cost, rate, timeout).
 */

export type AICapability =
  | 'negotiation'
  | 'market_intelligence'
  | 'compliance_monitor'
  | 'portfolio_advisory'
  | 'data_interpreter'
  | 'report_generator'
  | 'correspondence_draft';

export interface AIRequest {
  capability: AICapability;
  userId?: string;
  organisationId?: string;
  sessionId?: string;
  input: {
    systemPrompt: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  };
  maxTokens?: number;
  timeout?: number;
}

export interface AIResponse {
  output: string;
  tokensUsed: number;
  durationMs: number;
  model: string;
  cached?: boolean;
}

export interface AIGuardResult {
  allowed: boolean;
  reason?: string;
}

/** Model assignment per capability (WP6 §3.5) */
export const MODEL_MAP: Record<AICapability, string> = {
  negotiation: 'claude-opus-4-6',
  portfolio_advisory: 'claude-opus-4-6',
  market_intelligence: 'claude-sonnet-4-20250514',
  compliance_monitor: 'claude-sonnet-4-20250514',
  data_interpreter: 'claude-sonnet-4-20250514',
  report_generator: 'claude-sonnet-4-20250514',
  correspondence_draft: 'claude-sonnet-4-20250514',
};

/** Default max tokens per capability (WP6 §3.5) */
export const DEFAULT_MAX_TOKENS: Record<AICapability, number> = {
  negotiation: 1024,
  market_intelligence: 512,
  compliance_monitor: 256,
  portfolio_advisory: 512,
  data_interpreter: 512,
  report_generator: 2048,
  correspondence_draft: 512,
};
