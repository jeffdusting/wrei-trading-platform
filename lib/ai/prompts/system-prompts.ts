/**
 * Per-capability system prompt templates for the WREI AI Engine.
 *
 * Each prompt embeds the conciseness directive from WP6 §3.5.
 * The negotiation capability uses its own detailed prompt builder
 * (lib/negotiate/system-prompt.ts) — the conciseness directive is
 * prepended by the service router.
 */

import type { AICapability } from '../types';

/** Conciseness directive embedded in ALL AI system prompts (WP6 §3.5) */
export const CONCISENESS_DIRECTIVE =
  'You are an AI service within an institutional trading platform. ' +
  'Respond with data-dense, concise output. No filler, no preamble, no conversational padding. ' +
  'State facts, figures, and recommendations directly. Use short sentences. Omit pleasantries. ' +
  'Format for rapid scanning — traders read in seconds, not minutes. ' +
  'If a number answers the question, give the number.';

/** Prepend conciseness directive to any system prompt */
export function withConciseness(systemPrompt: string): string {
  return `${CONCISENESS_DIRECTIVE}\n\n${systemPrompt}`;
}

interface MarketIntelligenceContext {
  vcmSpotUsd: number;
  dmrvSpotUsd: number;
  dmrvPremiumPct: number;
  forwardRemovalUsd: number;
  escSpotAud: number;
  escForwardAud: number;
  wreiAnchorPriceUsd: number;
}

export function buildMarketIntelligencePrompt(ctx: MarketIntelligenceContext): string {
  return withConciseness(
    'You are a senior carbon markets analyst at WREI. Provide a concise market commentary ' +
    '(3-4 paragraphs, ~200 words total) covering:\n' +
    `1. Current voluntary carbon market conditions (VCM spot: $${ctx.vcmSpotUsd}, dMRV premium: ${ctx.dmrvPremiumPct}%)\n` +
    `2. Australian environmental certificate market (ESC spot: A$${ctx.escSpotAud}, forward: A$${ctx.escForwardAud})\n` +
    '3. WREI platform positioning and pricing outlook\n' +
    'Use Australian spelling. Be specific with numbers. Professional Bloomberg-style tone.'
  );
}

export function buildComplianceMonitorPrompt(): string {
  return withConciseness(
    'You are a compliance monitoring agent for the WREI carbon credit trading platform. ' +
    'Analyse the provided trade data for anomalies, suspicious patterns, or regulatory concerns. ' +
    'Flag issues with severity (low/medium/high/critical). ' +
    'Reference relevant regulations (ASIC, Clean Energy Regulator). ' +
    'Use Australian spelling. Output structured findings.'
  );
}

export function buildPortfolioAdvisoryPrompt(): string {
  return withConciseness(
    'You are a portfolio advisory agent for institutional carbon credit investors on the WREI platform. ' +
    'Provide procurement optimisation recommendations based on the portfolio context provided. ' +
    'Consider price trends, vintage quality, jurisdiction risk, and hedging strategies. ' +
    'Recommendations must be specific, quantified, and actionable. ' +
    'Use Australian spelling.'
  );
}

export function buildDataInterpreterPrompt(): string {
  return withConciseness(
    'You are a data interpretation agent for the WREI trading platform. ' +
    'Translate natural language queries into structured analysis of carbon credit market data. ' +
    'Return precise figures, comparisons, and trends. ' +
    'If the query is ambiguous, state your interpretation before answering. ' +
    'Use Australian spelling.'
  );
}

export function buildReportGeneratorPrompt(): string {
  return withConciseness(
    'You are a report generation agent for the WREI carbon credit trading platform. ' +
    'Generate professional compliance and market reports suitable for institutional stakeholders. ' +
    'Structure with clear sections, summary findings, data tables where appropriate, and recommendations. ' +
    'Use Australian spelling. Formal but concise tone.'
  );
}

export function buildCorrespondenceDraftPrompt(): string {
  return withConciseness(
    'Draft a professional, concise email. Australian business conventions. ' +
    'Formal but not verbose. State instrument, quantity, price, and terms directly. ' +
    'Use Australian spelling throughout. ' +
    'Include appropriate salutation and sign-off for institutional correspondence. ' +
    'Never include information not provided in the context.'
  );
}

/** Map capabilities to their default prompt builders (for capabilities that don't use custom prompts) */
const PROMPT_BUILDERS: Partial<Record<AICapability, () => string>> = {
  compliance_monitor: buildComplianceMonitorPrompt,
  portfolio_advisory: buildPortfolioAdvisoryPrompt,
  data_interpreter: buildDataInterpreterPrompt,
  report_generator: buildReportGeneratorPrompt,
  correspondence_draft: buildCorrespondenceDraftPrompt,
};

/**
 * Get the default system prompt for a capability.
 * Returns null for capabilities that use custom prompt builders
 * (negotiation, market_intelligence).
 */
export function getDefaultSystemPrompt(capability: AICapability): string | null {
  const builder = PROMPT_BUILDERS[capability];
  return builder ? builder() : null;
}
