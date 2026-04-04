/**
 * Timeout Guard — Wraps AI calls with per-capability timeouts.
 *
 * Default timeouts from WP6 §3.5. On timeout, returns a graceful
 * fallback message instead of an error.
 */

import type { AICapability } from '../types';

/** Default timeouts in milliseconds per capability (WP6 §3.5) */
export const DEFAULT_TIMEOUTS: Record<AICapability, number> = {
  negotiation: 30_000,
  market_intelligence: 15_000,
  compliance_monitor: 10_000,
  portfolio_advisory: 20_000,
  data_interpreter: 15_000,
  report_generator: 45_000,
  correspondence_draft: 20_000,
};

/** Fallback messages when a capability times out (WP6 §3.5) */
const FALLBACK_MESSAGES: Record<AICapability, string> = {
  negotiation: 'AI negotiation unavailable. Manual order entry available.',
  market_intelligence: 'Market intelligence temporarily unavailable. Displaying cached data.',
  compliance_monitor: 'Compliance check timed out. Flagged for manual review.',
  portfolio_advisory: 'Advisory service temporarily unavailable.',
  data_interpreter: 'Data query timed out. Please use structured filters.',
  report_generator: 'Report generation timed out. Generating report without AI summary section.',
  correspondence_draft: 'Correspondence drafting temporarily unavailable.',
};

export function getFallbackMessage(capability: AICapability): string {
  return FALLBACK_MESSAGES[capability];
}

/**
 * Race a promise against a timeout. Returns the promise result on success,
 * or a timeout indicator on expiry.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  capability: AICapability,
  overrideMs?: number
): Promise<{ ok: true; result: T } | { ok: false; fallback: string; durationMs: number }> {
  const timeoutMs = overrideMs ?? DEFAULT_TIMEOUTS[capability];
  const start = Date.now();

  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error('AI_TIMEOUT')), timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return { ok: true, result };
  } catch (error) {
    clearTimeout(timer!);
    const durationMs = Date.now() - start;
    if (error instanceof Error && error.message === 'AI_TIMEOUT') {
      console.warn(
        `[WREI AI Timeout] ${capability} timed out after ${durationMs}ms (limit: ${timeoutMs}ms)`
      );
      return { ok: false, fallback: FALLBACK_MESSAGES[capability], durationMs };
    }
    throw error; // Re-throw non-timeout errors
  }
}
