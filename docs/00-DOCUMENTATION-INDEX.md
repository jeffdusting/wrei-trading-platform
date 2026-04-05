# WREI Trading Platform -- Documentation Suite Index

**Suite Version:** 2.0
**Updated:** 2026-04-05
**Platform:** Water Roads Electric Infrastructure (WREI) Carbon Credit Trading Platform
**Current Release:** v1.7.0-intelligence-complete

---

## Documentation Suite Contents

| # | Document | Version | Scope | Audience |
|---|----------|---------|-------|----------|
| 01 | [Executive Summary](./01-EXECUTIVE-SUMMARY.md) | 2.0 | Platform overview, capabilities, implementation history, future roadmap | Executives, investors, partners |
| 02 | [User Scenarios and Personas](./02-USER-SCENARIOS-AND-PERSONAS.md) | 1.0 | 15 buyer personas, user journey maps, scenario descriptions | Product, sales, demo teams |
| 03 | [System Functional Architecture](./03-SYSTEM-FUNCTIONAL-ARCHITECTURE.md) | 3.0 | 15 page routes, 53 API endpoints, component hierarchy, data flows | Architects, developers |
| 04 | [Technical Architecture](./04-TECHNICAL-ARCHITECTURE.md) | 2.0 | Next.js, TypeScript, AI service router, database, forecasting, security | Developers, security, DevOps |
| 05 | [API Reference](./05-API-REFERENCE.md) | 1.0 | API endpoint specifications (needs update to cover v1 API) | Developers, integrators |
| 06 | [Test Coverage and QA](./06-TEST-COVERAGE-AND-QA.md) | 2.0 | 69 test suites, 1,630 tests, coverage analysis, quality gates | QA, developers |
| 07 | [Deployment and Operations](./07-DEPLOYMENT-AND-OPERATIONS.md) | 1.0 | Setup, build, Vercel deployment (needs update for DB and cron) | DevOps, developers |
| 08 | [Library Module Reference](./08-LIBRARY-MODULE-REFERENCE.md) | 1.0 | Library module inventory (needs update for P5-P11 modules) | Developers |
| 09 | [Gap Analysis and Review](./09-GAP-ANALYSIS-AND-REVIEW.md) | 2.0 | Documentation coverage audit, gap identification, priorities | Product, engineering leads |
| 10 | [System Specification](./10-SYSTEM-SPECIFICATION.md) | 1.0 | All 7 subsystems: negotiation, correspondence, intelligence, clients, AI router, market data, white-label | Architects, developers, QA |
| -- | [Test Plan](./testing/test-plan.md) | 2.0 | Test strategy, 5 layers, regression suite (REG-A1 to REG-G3), gate protocol | QA, developers |

---

## Quick Reference

### Platform Statistics

| Metric | Value |
|--------|-------|
| Page Routes | 15 |
| API Endpoints | 53 (23 legacy + 29 v1 + 1 cron) |
| React Components | 80+ |
| Library Modules | 60+ |
| Python Forecasting Modules | 15 |
| Test Suites | 69 active + 5 E2E |
| Test Cases | 1,630 (1,623 passing) |
| Buyer Personas | 15 |
| Tradeable Instruments | 8 |
| Database Tables | 25 |
| Export Formats | 4 (PDF, Excel, CSV, JSON) |

### Key Files

| Purpose | Path |
|---------|------|
| Project instructions | `CLAUDE.md` |
| Package configuration | `package.json` |
| TypeScript config | `tsconfig.json` |
| Tailwind config | `tailwind.config.ts` |
| Jest config | `jest.config.js` |
| Playwright config | `playwright.config.ts` |
| DB schema | `lib/db/schema.ts` |
| AI service router | `lib/ai/ai-service-router.ts` |
| White-label config | `lib/config/white-label.ts` |

### Navigation Routes

| Route | Feature |
|-------|---------|
| `/` | Live trading dashboard |
| `/trade` | AI-powered trading with negotiation |
| `/intelligence` | ESC market intelligence and forecasting |
| `/correspondence` | AI correspondence engine |
| `/clients` | Client management and compliance |
| `/client-intelligence` | Public white-labelled intelligence |
| `/compliance` | Regulatory compliance dashboard |
| `/calculator` | Investment calculator |
| `/performance` | System performance monitoring |
| `/developer` | Developer portal and API explorer |
| `/institutional/portal` | Institutional onboarding wizard |
| `/scenario` | Scenario simulation |
| `/simulate` | Trading simulation |
| `/analyse` | Market analysis tools |
| `/system` | System management |

---

## Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| CLAUDE.md | Project root | Build instructions, design rules, architecture constraints |
| TASK_LOG.md | Project root | Session-by-session implementation log |
| GATE_REPORT_P0-P11.md | Project root | Phase gate reports with verification results |
| architecture/WP1-WP7 | architecture/ | Work package documents (ESC audit, benchmarking, codebase, scenarios, instruments, architecture, prompts) |
| SECURITY.md | Project root | Defence architecture overview |
| CHANGELOG.md | Project root | Version history |
| README.md | Project root | Quick start and overview |
