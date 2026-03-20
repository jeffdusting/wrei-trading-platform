# WREI Trading Platform — Project Context

## What This Project Is

A Next.js 14 (App Router) application that demonstrates Water Roads' WREI carbon credit trading platform. An AI negotiation agent (powered by Claude API) negotiates the sale of WREI-verified carbon credits with human buyers. Deployed on Vercel free tier.

## Technology Stack

- **Framework:** Next.js 14 with App Router, TypeScript, Tailwind CSS
- **AI Engine:** Anthropic Claude API (@anthropic-ai/sdk) — Sonnet 4 for dev, Opus 4.6 for production
- **Deployment:** Vercel (free hobby plan)
- **State:** React useState/useReducer (no database, no localStorage)

## Architecture

```
/app
  /page.tsx                    — Landing page (Water Roads branding)
  /negotiate/page.tsx          — Main negotiation interface (client component)
  /api/negotiate/route.ts      — Server-side API route (Claude API calls, defence layers)
/lib
  /types.ts                    — All TypeScript type definitions
  /personas.ts                 — 5 buyer persona definitions
  /negotiation-config.ts       — Pricing, constraints, negotiation parameters
  /defence.ts                  — Security: input sanitisation, output validation, constraint enforcement
```

## Critical Design Rules

1. **ANTHROPIC_API_KEY must ONLY be used in server-side API routes** — never exposed to the client
2. **Defence layers are non-negotiable:**
   - Price floor ($120/t) enforced in application code, NOT delegated to the LLM
   - Max 5% concession per round enforced in application code
   - Max 20% total concession from anchor enforced in application code
   - Output filtering strips internal reasoning before delivery to client
   - Input sanitisation removes injection attempts before sending to Claude API
3. **No localStorage, no sessionStorage** — all state in React useState/useReducer
4. **Single-file approach** — CSS in Tailwind classes, no separate CSS files
5. **Australian spelling** throughout all user-facing text (e.g., "organised", "recognised", "colour")

## Colour Scheme

- Primary dark: `#1B2A4A` (navy)
- Primary accent: `#0EA5E9` (teal/sky blue)
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Error: `#EF4444` (red)
- Background: `#F8FAFC` (light grey)
- Card background: `#FFFFFF`
- Text primary: `#1E293B`
- Text secondary: `#64748B`

## Negotiation Parameters

The WREI Pricing Index provides dynamic market context for price anchoring.
In production, this is a live feed; in the demo, it's configurable reference values.

- PRICING_INDEX.VCM_SPOT_REFERENCE = 6.34 (current VCM spot, EM SOVCM 2025)
- PRICING_INDEX.FORWARD_REMOVAL_REFERENCE = 180 (forward removal, Sylvera SOCC 2025)
- PRICING_INDEX.DMRV_PREMIUM_BENCHMARK = 1.78 (78% premium for dMRV credits)
- BASE_CARBON_PRICE = 100 (WREI Pricing Index reference, USD/tonne)
- WREI_PREMIUM_MULTIPLIER = 1.5
- ANCHOR_PRICE = 150 (1.5× index reference)
- PRICE_FLOOR = 120 (1.2× index reference — absolute minimum)
- MAX_CONCESSION_PER_ROUND = 0.05 (5%)
- MAX_TOTAL_CONCESSION = 0.20 (20% from anchor)
- MIN_ROUNDS_BEFORE_PRICE_CONCESSION = 3

## Infrastructure Stack (Zoniqx Integration)

**IMPORTANT: All Zoniqx references are knowledge-base content for agent dialogue only. No live Zoniqx integration, API call, SDK, or external service exists in the demo. Do NOT install any Zoniqx packages or create integration stubs.**

The WREI platform separates proprietary layers (verification, negotiation AI, trading intelligence) from infrastructure layers (tokenisation, compliance, identity, settlement) which leverage Zoniqx or equivalent institutional-grade providers.

- **Settlement:** Zoniqx zConnect — T+0 atomic, non-custodial, cross-chain
- **Token standard:** Zoniqx zProtocol (DyCIST / ERC-7518) — CertiK-audited
- **Compliance:** Zoniqx zCompliance — AI-powered, 20+ jurisdictions, real-time
- **Identity/KYC:** Zoniqx zIdentity — KYC/KYB with jurisdiction-based access
- **Pricing signals:** WREI Pricing Index (production: Zoniqx zInsights-style oracle)

When the agent discusses these capabilities, it should reference the specific Zoniqx product names naturally — e.g., "T+0 settlement via Zoniqx zConnect" not "smart contract settlement". The agent should also be able to explain the architecture if asked: WREI provides the verification engine and trading intelligence; Zoniqx (or equivalent) provides the tokenisation and settlement infrastructure.

## Buyer Personas (5 pre-defined + free play)

1. **Corporate Compliance Officer** — time-pressured, audit-focused, risk-averse
2. **ESG Fund Portfolio Manager** — sophisticated, quality-metric driven, premium-tolerant
3. **Carbon Trading Desk Analyst** — transactional, volume-focused, aggressive on price
4. **Sustainability Director (Mid-Cap)** — values-driven, smaller budget, greenwashing-concerned
5. **Government Procurement Officer** — process-driven, multi-approval, long decision cycle

## Build Progress Tracker

When implementing each phase, check this list and mark completed items:

- [ ] Phase 1: Project scaffold, Next.js config, Tailwind, dependencies
- [ ] Phase 2: Type definitions, negotiation config, persona definitions
- [ ] Phase 3: Defence layer utilities (sanitise, validate, enforce, classify)
- [ ] Phase 4: API route with Claude integration and system prompt
- [ ] Phase 5: Negotiation UI (persona selector, chat, dashboard)
- [ ] Phase 6: Analytics panel, error handling, responsive layout, deploy config

## Common Pitfalls to Avoid

- Do NOT use `localStorage` or `sessionStorage` — they don't work in this environment
- Do NOT import Anthropic SDK on the client side — it's server-only
- Do NOT put the API key in client-accessible code
- Do NOT use `Image` component from next/image for simple decorative elements — use plain HTML or SVG
- Ensure the API route returns proper JSON error responses, not thrown errors
- Use `"use client"` directive on the negotiate page component
- The API route must handle the full message history for multi-turn negotiation context
