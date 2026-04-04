# Gate Report — P7: AI Engine Guards

**Date:** 2026-04-05
**Tag:** v1.2.0-ai-guards
**Phase:** P7-A (AI Guards, Service Router, Route Wiring)

---

## Objective

Establish cost controls, rate limiting, and timeout management for all AI calls before external users (broker clients) can trigger them via the API. Guard infrastructure must be in place before the AI correspondence engine goes live.

---

## Deliverables

### P7.1 — AI Guards

| Component | File | Lines | Status |
|-----------|------|-------|--------|
| Type definitions | `lib/ai/types.ts` | 62 | Done |
| Cost guard | `lib/ai/guards/cost-guard.ts` | 110 | Done |
| Rate limiter | `lib/ai/guards/rate-limiter.ts` | 87 | Done |
| Timeout guard | `lib/ai/guards/timeout-guard.ts` | 68 | Done |
| System prompts | `lib/ai/prompts/system-prompts.ts` | 112 | Done |

**Cost guard:** 50,000 tokens/day per user, 500,000 tokens/day per organisation. Admin bypass. In-memory counters with daily reset (Postgres persistence when available).

**Rate limiter:** Sliding window counters per user per capability. Negotiation: 10/hr, Market intelligence: 30/hr, Correspondence: 50/hr. Returns retry-after seconds.

**Timeout guard:** Per-capability timeouts from WP6 §3.5 (10s–45s). Graceful fallback messages on timeout. Non-timeout errors re-thrown for caller handling.

### P7.2 — AI Service Router

| Component | File | Lines | Status |
|-----------|------|-------|--------|
| Service router | `lib/ai/ai-service-router.ts` | 154 | Done |

Single entry point `routeAIRequest()`. Guard chain: rate-limiter → cost-guard → timeout-wrapped Claude call. Model selection per capability. Conciseness directive injected into all system prompts. Audit logging for every call (capability, model, tokens, duration, user, guard outcome).

### P7.3 — Route Wiring

| Route | Status |
|-------|--------|
| `app/api/negotiate/route.ts` | Wired through service router |
| `app/api/market-commentary/route.ts` | Wired through service router |

All existing behaviour preserved. Guard rejections return appropriate HTTP status (429 for negotiate, fallback for market commentary).

---

## Gate Criteria

| Criterion | Result |
|-----------|--------|
| `npm run build` | Clean |
| `npx tsc --noEmit` | Zero errors |
| All tests pass | 68 suites, 1599 passed, 3 skipped |
| Guard chain executes before every AI call | Verified (rate → cost → timeout) |
| Service router selects correct model per capability | Verified (Opus 4 for negotiation/advisory, Sonnet 4 for others) |
| Conciseness directive embedded in all AI prompts | Verified |
| Existing negotiation behaviour preserved | Verified (all 20 route tests pass) |
| Existing market commentary behaviour preserved | Verified (fallback on guard rejection) |

---

## Architecture Alignment (WP6 §3.5)

```
lib/ai/
├── ai-service-router.ts         — Routes AI requests, orchestrates guards
├── guards/
│   ├── cost-guard.ts            — Token budget enforcement per user/org
│   ├── rate-limiter.ts          — Sliding window rate limiting
│   └── timeout-guard.ts         — Per-capability timeout with fallback
├── prompts/
│   └── system-prompts.ts        — Conciseness directive, per-capability templates
└── types.ts                     — AI service interfaces
```

Matches WP6 target architecture. Capabilities directory (`lib/ai/capabilities/`) and context templates (`lib/ai/prompts/context-templates.ts`) deferred to when those capabilities are implemented.

---

## Test Fix Note

Fixed pre-existing broken Anthropic SDK mock in `__tests__/api-negotiate-route.test.ts`. The old mock defined `jest.fn()` AFTER Jest hoisted `jest.mock()`, so the module-level `const client = new Anthropic()` captured `undefined` instead of the mock function. All 20 tests were testing the error path rather than the intended business logic. The service router's lazy client initialisation resolved this; test assertions updated to verify correct (success-path) behaviour.

---

## Next Steps

- P7-B: AI correspondence engine (draft outbound emails via service router)
- Individual capability modules (`lib/ai/capabilities/`) as features are built
- Postgres persistence for cost guard counters (currently in-memory only)
