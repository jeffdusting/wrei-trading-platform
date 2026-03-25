# WREI Trading Platform -- Deployment and Operations Guide

**Document Version:** 1.0
**Date:** 2026-03-25

---

## 1. Environment Setup

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package management |
| Git | 2.x | Version control |
| Anthropic API key | -- | Claude API access (production) |

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd wrei-trading-platform

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local:
# ANTHROPIC_API_KEY=your_claude_api_key_here
# WREI_API_KEY=optional_external_api_key

# 4. Start development server
npm run dev

# 5. Open browser
open http://localhost:3000
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for negotiation) | None | Claude API authentication key |
| `WREI_API_KEY` | No | None | External API authentication (skips validation if unset) |
| `NODE_ENV` | Auto | development | Environment mode |

### Playwright Setup (E2E Testing)

```bash
# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

---

## 2. Build Process

### Development Build

```bash
npm run dev
# Starts Next.js development server at http://localhost:3000
# Hot module replacement enabled
# Source maps enabled
```

### Production Build

```bash
npm run build
# Runs next build
# Output: .next/ directory
# Performs TypeScript type checking
# Tree-shakes unused code
# Optimises for production

npm run start
# Starts production server from .next/ build output
```

### Build Validation

```bash
# Full quality check
npm run validate:quality
# Runs: npm run lint && npm test && echo 'Quality gates passed'

# Individual checks
npm run lint        # ESLint
npm test           # Jest test suite
npm run build      # Production build
```

---

## 3. Vercel Deployment

### Configuration

The platform is configured for Vercel via `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Deployment URLs

- **Production:** https://wrei-trading-platform.vercel.app
- **Preview:** Auto-generated for each branch/PR

### Environment Variables on Vercel

Configure in Vercel project settings:

| Variable | Scope | Description |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | Production, Preview | Claude API key |
| `WREI_API_KEY` | Production | External API authentication |

### Deployment Process

1. Push to `main` branch triggers automatic production deployment
2. Pull requests generate preview deployments
3. Vercel builds and deploys serverless functions for API routes
4. Static assets served via global CDN

### Vercel Hobby Plan Constraints

- **Serverless Function Timeout:** 10 seconds (affects Claude API calls)
- **Build Time:** 45 minutes max
- **Bandwidth:** 100GB/month
- **Serverless Execution:** 100GB-Hours/month
- **No persistent storage** (all state resets on deploy)

---

## 4. Monitoring and Observability

### Built-in Performance Monitoring

The platform includes a `PerformanceMonitor` class that tracks:

- **API response times** (average, P95, P99)
- **Calculation performance** (financial, risk, analytics)
- **System throughput** (requests per minute)
- **Business metrics** (sessions, calculations, compliance checks)
- **System health** (healthy/warning/critical status)

Access monitoring via:
- **UI:** `/performance` page
- **API:** `GET /api/performance?action=snapshot`

### Health Check Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/performance?action=health` | GET | System health report |
| `/api/performance?action=snapshot` | GET | Real-time performance metrics |
| `/api/performance?action=benchmarks` | GET | Performance benchmark data |

### Log Monitoring

Server-side logging is emitted to console (visible in Vercel function logs):

- `[WREI Security]` -- Threat detection alerts
- `[WREI API]` -- API request/response logging
- `[WREI Metadata API]` -- Token metadata operations
- `[WREI Performance]` -- Performance metric events

### Alert Thresholds

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| API Response Time | <500ms | 500-1000ms | >1000ms |
| Calculation Time | <100ms | 100-500ms | >500ms |
| Throughput | >100 req/min | 50-100 req/min | <50 req/min |
| Error Rate | <0.1% | 0.1-1% | >1% |

---

## 5. Maintenance Procedures

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update non-breaking changes
npm update

# Major version updates (review changelog first)
npm install <package>@latest
```

### Key Dependencies to Monitor

| Package | Current | Purpose | Update Risk |
|---------|---------|---------|-------------|
| next | 14.1.0 | Framework | High -- major version changes API |
| react | ^18.2.0 | UI library | Medium -- React 19 has breaking changes |
| @anthropic-ai/sdk | ^0.80.0 | Claude API | Low -- SDK is backwards compatible |
| recharts | ^3.8.0 | Charts | Low -- stable API |
| jest | ^30.3.0 | Testing | Medium -- config changes between versions |

### Database/Storage

**There is no database.** All state is:
- **Client-side:** React useState/useReducer and Zustand store (lost on page refresh)
- **Server-side:** In-memory maps (reset on Vercel deploy/cold start)
- **This is by design** per CLAUDE.md: "No localStorage, no sessionStorage"

### Backup Strategy

- **Code:** Git repository (main branch)
- **Configuration:** Environment variables in Vercel dashboard
- **Data:** Not applicable (stateless architecture)
- **Documentation:** Versioned in `/docs` directory

---

## 6. Troubleshooting

### Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| Negotiation API returns 500 | Missing or invalid ANTHROPIC_API_KEY | Set environment variable in .env.local or Vercel |
| "Rate limit exceeded" on API calls | >100 requests/minute from same key | Wait 60 seconds or distribute across keys |
| Build fails on TypeScript errors | Strict mode catches type issues | Run `npx tsc --noEmit` locally to identify errors |
| Tests fail after dependency update | Breaking changes in testing library | Check jest.config.js transform settings |
| Market ticker shows static data | Expected behaviour in demo | Production would connect to live feeds |
| Performance shows "Loading..." | PerformanceMonitor needs initial metrics | Generate API traffic to populate metrics |
| Committee mode not responding | Needs higher token limit | Verify API route uses 2048 max_tokens for committee |

### Vercel-Specific Issues

| Issue | Resolution |
|-------|------------|
| Function timeout (>10s) | Claude API calls may timeout on complex negotiations; consider streaming |
| Cold start delays | First request after idle period is slower; Vercel Pro has always-warm |
| Build cache issues | Clear Vercel cache in project settings and redeploy |
| Environment variable not found | Verify variable is set in correct scope (Production/Preview) |

---

## 7. npm Script Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `next lint` | ESLint check |
| `test` | `jest` | Run all tests |
| `test:watch` | `jest --watch` | Watch mode |
| `test:coverage` | `jest --coverage` | Coverage report |
| `test:phase1` | `jest --testPathPatterns=phase1` | Phase 1 tests |
| `test:phase2` | `jest --testPathPatterns=phase2` | Phase 2 tests |
| `test:phase3` | `jest --testPathPatterns=phase3` | Phase 3 tests |
| `test:integration` | `jest --testPathPatterns=integration` | Integration tests |
| `test:e2e` | `playwright test` | E2E tests |
| `test:e2e:ui` | `playwright test --ui` | E2E with UI |
| `test:e2e:headed` | `playwright test --headed` | Headed E2E |
| `test:visual` | `playwright test --grep='visual'` | Visual regression |
| `test:scenario` | `playwright test --grep='scenario'` | Scenario tests |
| `validate:quality` | `npm run lint && npm test` | Full quality gate |
| `setup:playwright` | `npx playwright install` | Install browsers |
