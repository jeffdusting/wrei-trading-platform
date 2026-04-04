/**
 * Rate Limiter — Sliding window rate limiting per user per capability.
 *
 * Uses in-memory sliding window counters. Each call timestamp is stored
 * and expired entries are pruned on every check.
 */

import type { AICapability, AIGuardResult } from '../types';

/** Max calls per hour per user, per capability */
const RATE_LIMITS: Record<AICapability, number> = {
  negotiation: 10,
  market_intelligence: 30,
  compliance_monitor: 30,
  portfolio_advisory: 20,
  data_interpreter: 30,
  report_generator: 10,
  correspondence_draft: 50,
};

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Map<"userId:capability", timestamp[]>
const windows = new Map<string, number[]>();

function windowKey(userId: string, capability: AICapability): string {
  return `${userId}:${capability}`;
}

function pruneWindow(timestamps: number[], now: number): number[] {
  const cutoff = now - WINDOW_MS;
  // Find the first entry within the window (timestamps are sorted)
  let i = 0;
  while (i < timestamps.length && timestamps[i] < cutoff) {
    i++;
  }
  return i > 0 ? timestamps.slice(i) : timestamps;
}

/**
 * Check whether a user is within rate limits for a given capability.
 * Anonymous requests (no userId) are not rate-limited.
 */
export function checkRateLimit(opts: {
  userId?: string;
  capability: AICapability;
}): AIGuardResult {
  const { userId, capability } = opts;

  if (!userId) {
    return { allowed: true };
  }

  const key = windowKey(userId, capability);
  const now = Date.now();
  const limit = RATE_LIMITS[capability];

  let timestamps = windows.get(key) || [];
  timestamps = pruneWindow(timestamps, now);
  windows.set(key, timestamps);

  if (timestamps.length >= limit) {
    // Calculate when the oldest entry in the window expires
    const oldestInWindow = timestamps[0];
    const retryAfterMs = (oldestInWindow + WINDOW_MS) - now;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);

    return {
      allowed: false,
      reason: `Rate limit exceeded (${limit} ${capability.replace(/_/g, ' ')} requests/hour). Try again in ${retryAfterSec} seconds.`,
    };
  }

  return { allowed: true };
}

/**
 * Record a call against the sliding window. Call after guard check passes.
 */
export function recordCall(userId: string, capability: AICapability): void {
  const key = windowKey(userId, capability);
  const now = Date.now();
  let timestamps = windows.get(key) || [];
  timestamps = pruneWindow(timestamps, now);
  timestamps.push(now);
  windows.set(key, timestamps);
}
