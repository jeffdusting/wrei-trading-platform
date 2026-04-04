/**
 * Cost Guard — Token budget enforcement per user and organisation.
 *
 * Tracks token usage per user per day using in-memory counters.
 * Counters reset at midnight UTC. In production, these would be
 * persisted to Postgres for durability across server restarts.
 */

import type { AICapability, AIGuardResult } from '../types';

const DEFAULT_USER_DAILY_LIMIT = 50_000;
const DEFAULT_ORG_DAILY_LIMIT = 500_000;

interface UsageEntry {
  tokens: number;
  date: string; // YYYY-MM-DD UTC
}

// In-memory usage stores keyed by userId / organisationId
const userUsage = new Map<string, UsageEntry>();
const orgUsage = new Map<string, UsageEntry>();

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(store: Map<string, UsageEntry>, key: string): number {
  const entry = store.get(key);
  if (!entry || entry.date !== todayUTC()) {
    return 0;
  }
  return entry.tokens;
}

function addUsage(store: Map<string, UsageEntry>, key: string, tokens: number): void {
  const today = todayUTC();
  const entry = store.get(key);
  if (!entry || entry.date !== today) {
    store.set(key, { tokens, date: today });
  } else {
    entry.tokens += tokens;
  }
}

/**
 * Check whether a user/org is within their daily token budget.
 * Admin users bypass all limits.
 */
export function checkCostGuard(opts: {
  userId?: string;
  organisationId?: string;
  userRole?: string;
  capability: AICapability;
}): AIGuardResult {
  const { userId, organisationId, userRole } = opts;

  // Admin users: no limit
  if (userRole === 'admin') {
    return { allowed: true };
  }

  // Check user-level limit
  if (userId) {
    const used = getUsage(userUsage, userId);
    if (used >= DEFAULT_USER_DAILY_LIMIT) {
      return {
        allowed: false,
        reason: `Daily token limit exceeded (${used.toLocaleString()}/${DEFAULT_USER_DAILY_LIMIT.toLocaleString()} tokens). Resets at midnight UTC.`,
      };
    }
  }

  // Check organisation-level limit
  if (organisationId) {
    const used = getUsage(orgUsage, organisationId);
    if (used >= DEFAULT_ORG_DAILY_LIMIT) {
      return {
        allowed: false,
        reason: `Organisation daily token limit exceeded (${used.toLocaleString()}/${DEFAULT_ORG_DAILY_LIMIT.toLocaleString()} tokens). Resets at midnight UTC.`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Record token usage after a successful AI call.
 */
export function recordTokenUsage(opts: {
  userId?: string;
  organisationId?: string;
  tokens: number;
}): void {
  const { userId, organisationId, tokens } = opts;
  if (userId) {
    addUsage(userUsage, userId, tokens);
  }
  if (organisationId) {
    addUsage(orgUsage, organisationId, tokens);
  }
}

/**
 * Get current usage for diagnostics / admin dashboard.
 */
export function getTokenUsage(key: string, scope: 'user' | 'org'): number {
  const store = scope === 'user' ? userUsage : orgUsage;
  return getUsage(store, key);
}
