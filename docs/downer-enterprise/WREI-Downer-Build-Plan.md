# WREI Enterprise Deployment — Downer Build Plan (Option B)

**Document Reference:** WR-BLD-001 | **Version:** 1.0 | **Date:** 8 April 2026
**Classification:** Internal — Build Plan
**Inputs:** Downer Requirements Spec (Sarah Taylor), Downer Concept Note, Option B Architecture

---

## 1. Architecture Decision

Option B — shared core, separate shell. The existing broker codebase remains untouched. A new Next.js application is created inside an `enterprise/` directory within the same repository, importing shared modules from the parent directory via TypeScript path aliases. Each application deploys as a separate Vercel project pointing at a different root directory, with its own Postgres instance and environment variables.

### 1.1. Directory Structure

```
wrei-trading-platform/                     ← existing repo root
├── app/                                   ← broker pages (UNCHANGED)
├── lib/                                   ← shared TypeScript modules (UNCHANGED)
│   ├── data-feeds/                        ← market data pipeline
│   ├── config/white-label.ts              ← extended with enterprise deployment type
│   ├── database/                          ← schema + query layer
│   ├── ai/                                ← guards, service router
│   └── defence.ts                         ← input sanitisation
├── components/                            ← shared + broker components (UNCHANGED)
│   ├── intelligence/                      ← ForecastPanel, SupplyDemandPanel, etc.
│   ├── charts/                            ← WREILineChart, WREIBarChart, etc.
│   ├── navigation/                        ← BloombergShell (shared, configurable)
│   └── [broker-only components remain]
├── forecasting/                           ← Python subsystem (UNCHANGED)
├── enterprise/                            ← NEW — enterprise application
│   ├── package.json
│   ├── next.config.ts                     ← webpack aliases for shared imports
│   ├── tsconfig.json                      ← path mappings to ../lib, ../components
│   ├── vercel.json                        ← separate Vercel project config
│   ├── middleware.ts                      ← SSO enforcement (SAML/OIDC)
│   ├── app/
│   │   ├── layout.tsx                     ← enterprise BloombergShell (ORG/PIP/MKT/CMP nav)
│   │   ├── page.tsx                       ← enterprise dashboard
│   │   ├── diagnostic/page.tsx            ← Pre-Validation Diagnostic Engine
│   │   ├── attribution/page.tsx           ← Energy Cost Attribution Tool
│   │   ├── pipeline/page.tsx              ← Project Pipeline (Kanban)
│   │   ├── portfolio/page.tsx             ← Adapted Client Portfolio + entity hierarchy
│   │   ├── intelligence/page.tsx          ← shared intelligence (reuses ForecastPanel etc.)
│   │   └── api/                           ← enterprise API routes
│   │       ├── auth/sso/route.ts          ← SAML/OIDC callback
│   │       ├── diagnostic/route.ts        ← eligibility check + yield estimate
│   │       ├── attribution/route.ts       ← cost attribution logic
│   │       ├── pipeline/route.ts          ← pipeline CRUD
│   │       ├── portfolio/route.ts         ← entity hierarchy + compliance
│   │       └── pdf/route.ts              ← branded PDF generation
│   └── components/                        ← enterprise-only components
│       ├── diagnostic/
│       │   ├── JurisdictionRouter.tsx
│       │   ├── ActivityClassifier.tsx
│       │   ├── EligibilityGate.tsx
│       │   └── YieldEstimator.tsx
│       ├── attribution/
│       │   ├── StakeholderMapper.tsx
│       │   ├── CostResponsibilityTree.tsx
│       │   └── NominationReadiness.tsx
│       ├── pipeline/
│       │   ├── KanbanBoard.tsx
│       │   ├── PipelineCard.tsx
│       │   ├── StageColumn.tsx
│       │   └── PipelineAggregation.tsx
│       └── portfolio/
│           ├── EntityHierarchy.tsx
│           ├── ExposureDashboard.tsx
│           └── ComplianceCountdown.tsx
```

### 1.2. Shared Module Mapping

The enterprise app imports from shared modules using path aliases configured in `tsconfig.json` and resolved in `next.config.ts`.

| Shared Module | Path | Used By Enterprise For |
|---------------|------|----------------------|
| `lib/data-feeds/feed-manager.ts` | `@shared/lib/data-feeds/feed-manager` | Current spot prices for Yield Estimator |
| `lib/config/white-label.ts` | `@shared/lib/config/white-label` | Downer branding |
| `lib/database/` | `@shared/lib/database` | Schema definitions (separate DB instance) |
| `components/intelligence/ForecastPanel.tsx` | `@shared/components/intelligence/ForecastPanel` | Intelligence page |
| `components/intelligence/SupplyDemandPanel.tsx` | `@shared/components/intelligence/SupplyDemandPanel` | Intelligence page |
| `components/intelligence/AlertsFeed.tsx` | `@shared/components/intelligence/AlertsFeed` | Intelligence page |
| `components/charts/*.tsx` | `@shared/components/charts/*` | All chart visualisations |
| `components/navigation/BloombergShell.tsx` | `@shared/components/navigation/BloombergShell` | Terminal chrome with enterprise nav config |
| `forecasting/` (Python) | Via API route proxy | Forecast data for Yield Estimator |

### 1.3. What the Enterprise App Does NOT Import

The following modules are broker-only and are not referenced by the enterprise app. No exclusion mechanism is needed — the enterprise app simply does not import them.

- `components/negotiation/*` — AI negotiation agent
- `components/correspondence/*` — RFQ drafting, email negotiation
- `components/institutional/*` — investor onboarding wizard
- `components/scenarios/*` — negotiation scenarios
- `app/trade/` — trading desk
- `app/correspondence/` — correspondence management
- `app/negotiate/` — negotiation interface
- `app/api/negotiate` — negotiation API
- `app/api/v1/correspondence/*` — correspondence API
- `app/api/v1/trades/negotiate/*` — negotiation API

### 1.4. Database Separation

Each Vercel project connects to its own Postgres instance via separate `POSTGRES_URL` environment variables. The database schema for the enterprise app shares the base tables (instruments, instrument_config, price_observations, price_history, forecasts, market_metrics, feed_status) and adds enterprise-specific tables.

New enterprise tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `diagnostic_assessments` | Pre-validation results | project_name, jurisdiction, scheme, method, yield_estimate, status |
| `attribution_records` | Cost attribution outcomes | assessment_id, asset_owner, facility_operator, tenant, eligible_saver |
| `pipeline_projects` | Project pipeline | assessment_id, stage, division, client, probability_weight, estimated_value |
| `entity_hierarchy` | Parent/child entity structure | parent_id, entity_name, entity_type, division |
| `entity_compliance` | Per-entity compliance tracking | entity_id, scheme, target, surrendered, shortfall, deadline |

### 1.5. Deployment Configuration

| Property | Broker | Enterprise |
|----------|--------|------------|
| Vercel project name | `wrei-broker` | `wrei-enterprise-downer` |
| Root directory | `/` (repo root) | `/enterprise` |
| Domain | `wrei.cbslab.app` | `downer.wrei.cbslab.app` |
| POSTGRES_URL | Broker instance | Enterprise instance |
| ANTHROPIC_API_KEY | Shared (same key) | Shared (same key) |
| NEXT_PUBLIC_WHITE_LABEL_BROKER | `nmg` (or none) | `downer` |
| AUTH_PROVIDER | `internal` | `saml` |
| SAML_METADATA_URL | N/A | Downer IdP metadata URL |

---

## 2. Phase Sequence

| Phase | File | Objective | Est. Effort |
|-------|------|-----------|-------------|
| D0 | `01-D0-DISCOVERY.md` | Map every shared module and its imports; verify shared components render standalone | 1 session |
| D1 | `02-D1-SCAFFOLD.md` | Create enterprise Next.js project, configure path aliases, verify shared imports build | 1 session |
| D2 | `03-D2-SHELL.md` | Enterprise navigation, Downer branding, SSO middleware, intelligence page from shared components | 1 session |
| D3 | `04-D3-ORIGINATION.md` | Pre-Validation Diagnostic Engine + Energy Cost Attribution Tool | 1–2 sessions |
| D4 | `05-D4-PIPELINE.md` | Project Pipeline Kanban + adapted Client Portfolio with entity hierarchy | 1 session |
| D5 | `06-D5-PDF-VERIFY.md` | Branded PDF generation, forecast integration with Yield Estimator, end-to-end testing | 1 session |

---

## 3. CC Session Prompts

### 3.1. D0 — Discovery

```
You are working on the WREI Trading Platform.
Read context:
  cat TASK_LOG.md 2>/dev/null || echo "No TASK_LOG — starting Downer enterprise build"
  ls -la enterprise/ 2>/dev/null || echo "Enterprise directory does not exist yet"

This session maps the existing codebase to determine which modules are
shared (used by both broker and enterprise apps) and which are broker-only.
DO NOT create or modify any files. Report only.

Complete ALL tasks. Do not stop for confirmation.

TASK 1: MAP SHARED MODULES

1a. Read the following shared library files and list their exports and
    internal dependencies (what other lib/ files they import):

    lib/data-feeds/feed-manager.ts
    lib/data-feeds/adapters/ecovantage-scraper.ts
    lib/data-feeds/adapters/simulation-engine.ts
    lib/data-feeds/cache/price-cache.ts
    lib/config/white-label.ts
    lib/database/ (directory listing, then read schema files)
    lib/ai/guards/ (directory listing)
    lib/defence.ts

1b. For each file, note whether it imports from:
    - Other lib/ files (shared dependency)
    - components/ (potential circular dependency — flag this)
    - app/ (should never happen — flag this)
    - External packages (list them)

TASK 2: MAP SHARED COMPONENTS

2a. Read the following shared component files and list their imports:

    components/intelligence/ForecastPanel.tsx
    components/intelligence/SupplyDemandPanel.tsx
    components/intelligence/AlertsFeed.tsx
    components/intelligence/ClientIntelligencePage.tsx
    components/charts/WREILineChart.tsx
    components/charts/WREIBarChart.tsx
    components/navigation/BloombergShell.tsx
    components/navigation/BloombergLayout.tsx

2b. For each component, determine:
    - Does it import broker-only components? (flag — will need conditional rendering)
    - Does it import from lib/ only? (clean — can be shared directly)
    - Does it depend on app-level state or routing? (flag — needs abstraction)

TASK 3: MAP API ROUTES

3a. Read these API routes and determine if they are generic (shareable)
    or broker-specific:

    app/api/v1/intelligence/forecast/route.ts
    app/api/v1/market/prices/route.ts
    app/api/v1/market/instruments/route.ts
    app/api/v1/clients/route.ts
    app/api/v1/clients/compliance/summary/route.ts
    app/api/cron/intelligence/route.ts

3b. For each route, note:
    - What database tables it queries
    - Whether the logic could be extracted into a lib/ function
      that both broker and enterprise API routes call

TASK 4: VERIFY BUILD BASELINE

4a. Run the existing build to establish the baseline:
    npm run build 2>&1 | tail -20
    npx tsc --noEmit 2>&1 | tail -20

4b. Run the existing test suite:
    npm test 2>&1 | tail -20

4c. Record: total TS errors, total test pass/fail, build time.

TASK 5: PRODUCE SHARED MODULE MAP

Write docs/downer-enterprise/SHARED_MODULE_MAP.md:

```markdown
# WREI Shared Module Map — Downer Enterprise Build
## Date: [timestamp]

### Shared Library Modules (lib/)
| File | Exports | Dependencies | Enterprise Use | Issues |
|------|---------|--------------|---------------|--------|
[Each lib file examined]

### Shared Components (components/)
| Component | Imports From | Broker Dependencies | Can Share Directly? | Issues |
|-----------|-------------|-------------------|-------------------|--------|
[Each component examined]

### Shareable API Logic
| Route | Database Tables | Extractable Logic | Notes |
|-------|----------------|-------------------|-------|
[Each route examined]

### Build Baseline
- TypeScript errors: [count]
- Tests: [pass/fail]
- Build time: [seconds]

### Identified Risks
[Any circular dependencies, broker-specific imports in shared components,
database schema assumptions, etc.]

### Recommendations
[Specific changes needed before enterprise app can import shared modules]
```

VERIFICATION:
  ls -la docs/downer-enterprise/SHARED_MODULE_MAP.md
  wc -l docs/downer-enterprise/SHARED_MODULE_MAP.md

COMMIT:
  git add -A && git commit -m "D0: Shared module map for Downer enterprise build"
  Update TASK_LOG.md. Next: D1 (Enterprise scaffold).
```

### 3.2. D1 — Enterprise Project Scaffold

```
You are working on the WREI Trading Platform.
Read context:
  cat TASK_LOG.md
  cat docs/downer-enterprise/SHARED_MODULE_MAP.md

This session creates the enterprise Next.js project and verifies that
shared module imports resolve and build. Complete ALL tasks.

TASK 1: CREATE ENTERPRISE PROJECT

1a. Create the enterprise directory and initialise Next.js:

    mkdir -p enterprise
    cd enterprise
    npx create-next-app@latest . --typescript --tailwind --app --no-src-dir \
      --import-alias "@enterprise/*" --no-eslint --no-git

    If create-next-app prompts interactively, use:
    npm init -y
    npm install next@14 react react-dom typescript @types/react @types/node
    npm install -D tailwindcss postcss autoprefixer

1b. Create enterprise/tsconfig.json with path aliases to shared modules:

    {
      "compilerOptions": {
        "target": "ES2017",
        "lib": ["dom", "dom.iterable", "esnext"],
        "module": "esnext",
        "moduleResolution": "bundler",
        "jsx": "preserve",
        "strict": true,
        "baseUrl": ".",
        "paths": {
          "@enterprise/*": ["./*"],
          "@shared/lib/*": ["../lib/*"],
          "@shared/components/*": ["../components/*"]
        }
      },
      "include": ["**/*.ts", "**/*.tsx", "../lib/**/*.ts", "../components/**/*.ts", "../components/**/*.tsx"],
      "exclude": ["node_modules"]
    }

1c. Create enterprise/next.config.ts that resolves imports from outside
    the enterprise directory:

    import type { NextConfig } from 'next';
    import path from 'path';

    const nextConfig: NextConfig = {
      experimental: {
        externalDir: true,  // Allow imports from parent directory
      },
      webpack: (config) => {
        config.resolve.alias = {
          ...config.resolve.alias,
          '@shared/lib': path.resolve(__dirname, '../lib'),
          '@shared/components': path.resolve(__dirname, '../components'),
        };
        return config;
      },
      transpilePackages: ['../lib', '../components'],
    };

    export default nextConfig;

    Note: Next.js 14 may need a different approach. If externalDir or
    transpilePackages doesn't work, try:
    - Symlinks: ln -s ../lib enterprise/shared-lib
    - Or tsconfig project references

1d. Create enterprise/tailwind.config.ts that includes both enterprise
    and shared component paths for class scanning:

    content: [
      './app/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      '../components/**/*.{ts,tsx}',  // shared components
    ]

TASK 2: VERIFY SHARED IMPORTS

2a. Create a minimal test page at enterprise/app/page.tsx:

    import { ForecastPanel } from '@shared/components/intelligence/ForecastPanel';

    export default function EnterpriseDashboard() {
      return (
        <div className="p-8">
          <h1>Enterprise Dashboard — Import Test</h1>
          <ForecastPanel />
        </div>
      );
    }

2b. Attempt to build:
    cd enterprise && npm run build 2>&1

2c. If the build fails due to import resolution:
    - Read the error message carefully
    - Fix the path configuration
    - Try alternative approaches (symlinks, webpack resolve, etc.)
    - Document what worked in the TASK_LOG

2d. If the build fails due to missing dependencies in the enterprise
    package.json (e.g., shared components use recharts, zustand, etc.):
    - Install the missing dependencies in enterprise/
    - The enterprise package.json must list all dependencies used by
      shared components it imports

2e. If a shared component imports broker-only code (flagged in SHARED_MODULE_MAP),
    the enterprise app cannot import it directly. Options:
    - Create a wrapper in enterprise/components/ that conditionally renders
    - Extract the shared portion into a base component that both apps use
    - Document the issue for resolution in a later phase

TASK 3: CREATE ENTERPRISE LAYOUT

3a. Create enterprise/app/layout.tsx with:
    - Downer white-label configuration (colours, branding)
    - Enterprise navigation items: ORG (Origination), PIP (Pipeline),
      MKT (Market Intelligence), CMP (Compliance)
    - Import BloombergShell from shared components if possible
    - If BloombergShell has broker-specific nav items hardcoded, create
      an EnterpriseShell wrapper that passes enterprise nav config

3b. Add Downer to the white-label registry in lib/config/white-label.ts:

    {
      slug: 'downer',
      businessName: 'DOWNER',
      terminalCode: 'DW',
      logoUrl: null,
      primaryColour: '#003DA5',     // Downer blue
      accentColour: '#00A9E0',      // Downer light blue
      primaryTextColour: '#FFFFFF',
      contactEmail: 'certificates@downer.com.au',
      contactPhone: null,
      footerText: 'Downer Environmental Certificate Intelligence Platform',
      showAttribution: true,
      deploymentType: 'enterprise'   // NEW field — 'broker' | 'enterprise'
    }

    Note: This is a small change to a shared file. It adds configuration
    but does not change any existing behaviour. The broker app ignores
    deploymentType if it doesn't use it.

TASK 4: CONFIGURE SEPARATE DATABASE

4a. Create enterprise/lib/database/schema.sql with:
    - Base shared tables (instruments, instrument_config, price_observations,
      price_history, forecasts, market_metrics, feed_status)
    - Enterprise-specific tables (diagnostic_assessments, attribution_records,
      pipeline_projects, entity_hierarchy, entity_compliance)
    - Include all CREATE TABLE statements

4b. Create enterprise/lib/database/enterprise-queries.ts with query functions
    for the enterprise-specific tables. Import shared query functions from
    @shared/lib/database for the base tables.

TASK 5: STUB ENTERPRISE PAGES

Create stub pages for each enterprise route (content will be built in D3–D5):

5a. enterprise/app/diagnostic/page.tsx — "Pre-Validation Diagnostic — Coming in D3"
5b. enterprise/app/attribution/page.tsx — "Cost Attribution Tool — Coming in D3"
5c. enterprise/app/pipeline/page.tsx — "Project Pipeline — Coming in D4"
5d. enterprise/app/portfolio/page.tsx — "Client Portfolio — Coming in D4"
5e. enterprise/app/intelligence/page.tsx — Attempt to render ForecastPanel
    from shared components. If it works, this page is nearly complete.

VERIFICATION:
  cd enterprise && npm run build 2>&1 | tail -20
  cd enterprise && npx tsc --noEmit 2>&1 | tail -20
  # Verify broker app still builds
  cd .. && npm run build 2>&1 | tail -5

  echo "Enterprise pages:"
  find enterprise/app -name "page.tsx" | sort

COMMIT:
  git add -A && git commit -m "D1: Enterprise scaffold + shared imports verified"
  git tag downer-enterprise-scaffold
  Update TASK_LOG.md. Next: D2 (Enterprise shell + SSO).
```

### 3.3. D2 — Enterprise Shell, SSO, and Intelligence Integration

```
You are working on the WREI Trading Platform enterprise deployment.
Read context:
  cat TASK_LOG.md
  cat docs/downer-enterprise/SHARED_MODULE_MAP.md

This session builds the enterprise shell (navigation, branding),
SSO middleware, and integrates the shared intelligence components.
Complete ALL tasks.

TASK 1: ENTERPRISE NAVIGATION SHELL

1a. Read components/navigation/BloombergShell.tsx to understand its
    props interface and nav item structure.

1b. If BloombergShell accepts nav items as props (configurable):
    Create enterprise/app/layout.tsx that passes enterprise nav config:
    - ORG (Origination) → /diagnostic
    - PIP (Pipeline) → /pipeline
    - MKT (Market Intelligence) → /intelligence
    - CMP (Compliance) → /portfolio
    - No TRD, no ANA, no SYS

1c. If BloombergShell has nav items hardcoded:
    Create enterprise/components/EnterpriseShell.tsx that wraps or
    extends BloombergShell with enterprise-specific navigation.
    Preserve the Bloomberg Terminal aesthetic (dark background, monospace
    status bar, command bar) but with enterprise nav items.

1d. Apply Downer white-label config from the registry.
    Set NEXT_PUBLIC_WHITE_LABEL_BROKER=downer in enterprise/.env.local.

TASK 2: SSO MIDDLEWARE

2a. Install SSO dependencies:
    cd enterprise && npm install @auth/core next-auth @auth/sapper-adapter \
      passport-saml 2>/dev/null || npm install next-auth

2b. Create enterprise/middleware.ts that:
    - Checks for valid session on every request
    - Redirects unauthenticated users to the SSO login flow
    - Allows /api/auth/* routes through (callback URLs)
    - Allows /api/cron/* routes through (with CRON_SECRET verification)

2c. Create enterprise/app/api/auth/[...nextauth]/route.ts with:
    - SAML provider configuration (reads SAML_METADATA_URL from env)
    - Fallback credentials provider for development/testing
    - Session callback that stores user role and division

2d. If passport-saml or next-auth SAML is too complex for a single session:
    Create a stub middleware that:
    - In development: auto-authenticates with a test user
    - In production: checks for a Bearer token (placeholder for real SSO)
    - Log: "SSO stub — production integration requires SAML_METADATA_URL"

TASK 3: INTELLIGENCE PAGE INTEGRATION

3a. Build enterprise/app/intelligence/page.tsx that renders the shared
    intelligence components:

    - ForecastPanel (from @shared/components/intelligence/ForecastPanel)
    - SupplyDemandPanel (from @shared/components/intelligence/SupplyDemandPanel)
    - AlertsFeed (from @shared/components/intelligence/AlertsFeed)

3b. The intelligence components need data from API routes. Create:
    - enterprise/app/api/intelligence/forecast/route.ts
      This proxies to the shared forecast logic. If the shared intelligence
      API route logic is in a lib/ function, call it directly. If it's only
      in the broker's app/api/ route file, extract the handler into a lib/
      function that both apps can call.

3c. Verify the intelligence page renders with forecast data (simulated
    is fine — the market data pipeline will serve simulated prices if
    no live scrape is available).

TASK 4: ENTERPRISE DASHBOARD

4a. Build enterprise/app/page.tsx as the enterprise landing page:

    Layout: 2×2 grid of summary cards:
    - Pipeline summary: total projects, total estimated value, stage distribution
    - Compliance summary: total entities, total shortfall, next deadline
    - Market snapshot: current ESC spot, 4-week forecast direction, regime
    - Recent activity: last 5 diagnostic assessments

    Each card links to the relevant detail page.
    Use data from enterprise database tables (return demo data if tables empty).

VERIFICATION:
  cd enterprise && npm run build 2>&1 | tail -20
  cd enterprise && npx tsc --noEmit 2>&1 | tail -10
  # Verify broker still builds
  cd .. && npm run build 2>&1 | tail -5

  # Verify enterprise pages render
  cd enterprise && npm run dev &
  sleep 5
  curl -s http://localhost:3001 | head -20
  curl -s http://localhost:3001/intelligence | head -20
  kill %1

COMMIT:
  git add -A && git commit -m "D2: Enterprise shell + SSO + intelligence integration"
  Update TASK_LOG.md. Next: D3 (Diagnostic Engine + Cost Attribution).
```

### 3.4. D3 — Pre-Validation Diagnostic Engine and Cost Attribution Tool

```
You are working on the WREI Trading Platform enterprise deployment.
Read context:
  cat TASK_LOG.md
  cat docs/downer-enterprise/SHARED_MODULE_MAP.md

This session builds the two origination modules from Sarah's requirements spec.
Complete ALL tasks.

TASK 1: PRE-VALIDATION DIAGNOSTIC ENGINE

1a. Create enterprise/lib/diagnostic/scheme-rules.ts containing:

    ESS Rule Set (NSW):
    - Eligible methods: HEER, IHEAB, MBM, PIAMV, ROOA
    - Ending methods: CLESF (ended March 2026), SONA (ended Nov 2025),
      F8/F9 (ending June 2026)
    - Disqualifiers: asset age < 10 years for some methods,
      previous upgrade within 10 years, ineligible facility types
    - Yield calculation: based on ESS Rule Schedule A lookup tables

    VEU Rule Set (VIC):
    - Eligible methods: commercial, residential, industrial
    - Disqualifiers: parallel to ESS but Victorian-specific
    - Yield calculation: based on VEU method-specific tables

    Structure each rule set as a TypeScript interface:
    {
      jurisdiction: 'NSW' | 'VIC',
      methods: MethodDefinition[],
      disqualifiers: Disqualifier[],
      yieldFormulas: YieldFormula[]
    }

1b. Create enterprise/components/diagnostic/JurisdictionRouter.tsx:
    - Dropdown: NSW or VIC
    - Routes to ESS or VEU rule set
    - Updates all downstream components

1c. Create enterprise/components/diagnostic/ActivityClassifier.tsx:
    - Dropdown of asset types mapped to scheme methods:
      Commercial Lighting → CLESF (ended — show warning)
      HVAC → HEER / RDUE
      Motors → MBM
      Hot Water → IHEAB
      Refrigeration → MBM
      Building Shell → PIAMV
    - Selection drives the method-specific yield formula

1d. Create enterprise/components/diagnostic/EligibilityGate.tsx:
    - Series of yes/no questions based on the selected method:
      "Has this equipment been replaced in the last 10 years?"
      "Is the facility in a residential dwelling?"
      "Is the existing equipment operational?"
    - Hard stop on disqualifying answer with explanation
    - Green light on all-clear with "Proceed to Yield Estimate"

1e. Create enterprise/components/diagnostic/YieldEstimator.tsx:
    - Input fields based on the selected method:
      For HEER: current system kW, proposed system kW, annual operating hours
      For IHEAB: water heater type, climate zone, household size
      For MBM: motor count, current kW, proposed kW, load factor
    - Calculates estimated certificate yield using scheme formulas
    - Multiplies yield × current spot price (from shared feed-manager)
    - Multiplies yield × 26-week forecast price (from shared forecast)
    - Displays: estimated certificates, current value, forecast value

1f. Create enterprise/app/diagnostic/page.tsx that assembles the
    full diagnostic workflow:
    JurisdictionRouter → ActivityClassifier → EligibilityGate → YieldEstimator
    with a progress indicator showing the current step.

1g. Create enterprise/app/api/diagnostic/route.ts:
    - POST: saves a completed diagnostic assessment to the database
    - GET: retrieves assessment by ID or lists assessments with filters

TASK 2: ENERGY COST ATTRIBUTION TOOL

2a. Create enterprise/components/attribution/StakeholderMapper.tsx:
    - Three input fields: Asset Owner, Facility Operator, Tenant
    - Each field has entity name + type (individual, company, government)
    - Displays the relationship as a simple diagram

2b. Create enterprise/components/attribution/CostResponsibilityTree.tsx:
    - Decision tree UI (sequential questions):
      Q1: "Who pays the electricity bill?" → Owner / Operator / Tenant
      Q2: "Who holds the retail electricity contract?" → same options
      Q3: "Are electricity costs passed through in the lease/contract?"
           → Yes (direct) / Yes (embedded in service fee) / No
      Q4: "Who controls the energy-using equipment?" → Owner / Operator / Tenant
    - Each answer narrows the eligible "energy saver" determination

2c. Create enterprise/components/attribution/NominationReadiness.tsx:
    - Based on the decision tree answers, determines:
      (a) The legally eligible "energy saver" per ESS/VEU rules
      (b) Whether a split-incentive issue exists
      (c) What contractual arrangement is needed before nomination
    - Displays: eligible saver, confidence level, required actions
    - Flags if the asset owner is not the energy saver (common in
      commercial leases) and notes the contractual resolution needed

2d. Create enterprise/app/attribution/page.tsx that assembles:
    StakeholderMapper → CostResponsibilityTree → NominationReadiness

2e. Create enterprise/app/api/attribution/route.ts:
    - POST: saves attribution outcome linked to a diagnostic assessment
    - GET: retrieves attribution by assessment ID

VERIFICATION:
  cd enterprise && npm run build 2>&1 | tail -20
  cd enterprise && npx tsc --noEmit 2>&1 | tail -10
  cd .. && npm run build 2>&1 | tail -5

COMMIT:
  git add -A && git commit -m "D3: Diagnostic Engine + Cost Attribution Tool"
  Update TASK_LOG.md. Next: D4 (Pipeline + Portfolio).
```

### 3.5. D4 — Project Pipeline and Adapted Client Portfolio

```
You are working on the WREI Trading Platform enterprise deployment.
Read context:
  cat TASK_LOG.md

This session builds the project pipeline Kanban board and the adapted
client portfolio with entity hierarchy. Complete ALL tasks.

TASK 1: PROJECT PIPELINE KANBAN

1a. Create enterprise/components/pipeline/KanbanBoard.tsx:
    - Six stage columns: Diagnostic → Validation → Implementation →
      M&V/Audit → Registration → Sale
    - Drag-and-drop between adjacent stages (use react-beautiful-dnd
      or @dnd-kit/core — install whichever resolves cleanly)
    - Each card shows: project name, client, scheme, method,
      estimated yield, estimated value, probability weight

1b. Create enterprise/components/pipeline/PipelineCard.tsx:
    - Card displays: project title, client name, scheme badge (ESC/VEEC),
      estimated value (yield × forecast price × probability weight)
    - Colour coding by stage: early stages (blue), mid (amber), late (green)
    - Click opens the linked diagnostic assessment

1c. Create enterprise/components/pipeline/PipelineAggregation.tsx:
    - Summary bar above the Kanban:
      Total pipeline value (sum of all projects × probability weights)
      Projects by stage (count per column)
      Value by division (if division metadata available)
    - Probability weights by stage:
      Diagnostic: 10%, Validation: 25%, Implementation: 50%,
      M&V/Audit: 75%, Registration: 90%, Sale: 100%

1d. Create enterprise/components/pipeline/PipelineFilters.tsx:
    - Filter by: Downer division, client, scheme (ESS/VEEC), stage
    - Sort by: estimated value, date created, client name

1e. Create enterprise/app/pipeline/page.tsx assembling:
    PipelineFilters → PipelineAggregation → KanbanBoard

1f. Create enterprise/app/api/pipeline/route.ts:
    - GET: list pipeline projects with filters
    - POST: create project (typically from diagnostic completion)
    - PUT: update project stage (drag-drop) or details
    - DELETE: archive project

TASK 2: ADAPTED CLIENT PORTFOLIO WITH ENTITY HIERARCHY

2a. Create enterprise/components/portfolio/EntityHierarchy.tsx:
    - Tree view: Downer Group → Division → Business Unit → Client
    - Example: Downer Group → Downer Rail → NSW TrainLink Fleet →
      [specific facilities]
    - Expandable/collapsible nodes
    - Each node shows: entity name, type, certificate count, compliance status

2b. Create enterprise/components/portfolio/ExposureDashboard.tsx:
    - For the selected entity (any level in the hierarchy):
      Compliance shortfall = target - surrendered
      Penalty exposure = shortfall × IPART penalty rate (ESC: A$35.86)
      Surrender deadline countdown (days remaining)
    - Aggregates up the hierarchy: selecting "Downer Group" shows
      total exposure across all divisions

2c. Create enterprise/components/portfolio/ComplianceCountdown.tsx:
    - Visual countdown to next surrender deadline
    - ESS: June 30 (annual) and December 31 (interim)
    - VEU: annual compliance deadline
    - Traffic light: green (>90 days), amber (30-90 days), red (<30 days)
    - Shows: days remaining, outstanding shortfall, estimated procurement cost
      (shortfall × current forecast price)

2d. Create enterprise/app/portfolio/page.tsx assembling:
    EntityHierarchy (left panel) → ExposureDashboard + ComplianceCountdown (right panel)

2e. Create enterprise/app/api/portfolio/route.ts:
    - GET /api/portfolio/entities: list entity hierarchy
    - POST /api/portfolio/entities: create entity
    - GET /api/portfolio/entities/[id]/compliance: compliance detail
    - PUT /api/portfolio/entities/[id]: update entity

VERIFICATION:
  cd enterprise && npm run build 2>&1 | tail -20
  cd enterprise && npx tsc --noEmit 2>&1 | tail -10
  cd .. && npm run build 2>&1 | tail -5

COMMIT:
  git add -A && git commit -m "D4: Project Pipeline Kanban + Client Portfolio with entity hierarchy"
  Update TASK_LOG.md. Next: D5 (PDF generation + integration + verification).
```

### 3.6. D5 — PDF Generation, Integration, and Verification

```
You are working on the WREI Trading Platform enterprise deployment.
Read context:
  cat TASK_LOG.md

This session builds the branded PDF generation, integrates the forecast
into the Yield Estimator, runs end-to-end testing, and produces a
verification report. Complete ALL tasks.

TASK 1: BRANDED PDF GENERATION

1a. Install PDF generation library:
    cd enterprise && npm install @react-pdf/renderer
    (If @react-pdf/renderer has issues with Next.js 14 server components,
    fall back to pdfkit or puppeteer)

1b. Create enterprise/lib/pdf/certificate-opportunity-assessment.tsx (or .ts):

    Generate a Downer-branded PDF containing:
    - Header: Downer logo placeholder, "Certificate Opportunity Assessment"
    - Project details: name, location, jurisdiction, scheme, method
    - Eligibility outcome: pass/fail with notes
    - Energy saver attribution: identified saver, split-incentive flag
    - Yield estimate: certificates, current value, forecast value
    - Price chart: spot price + 26-week forecast (simplified line chart)
    - Disclaimer: "Estimates are indicative. Actual yield depends on
      implementation, measurement, and verification outcomes."
    - Footer: Downer branding, date, WREI attribution

1c. Create enterprise/app/api/pdf/route.ts:
    - POST: accepts assessment_id, generates PDF, returns as blob
    - Fetches assessment data from enterprise DB
    - Fetches current price and forecast from shared feed-manager
    - Generates and returns the branded PDF

1d. Add a "Download PDF" button to the YieldEstimator component
    that calls the PDF API route and triggers browser download.

TASK 2: FORECAST INTEGRATION WITH YIELD ESTIMATOR

2a. Verify that the YieldEstimator (from D3) calls the shared forecast:
    - Current spot price from feed-manager
    - 26-week forecast price and direction from forecast API
    - Ensure the forecast data populates both the yield table and the PDF

2b. If the forecast API returns demo/simulated data, that is acceptable
    for the initial deployment. The enterprise app uses the same market
    data pipeline as the broker — when live scrapers run, the enterprise
    app gets live prices automatically.

TASK 3: END-TO-END WORKFLOW TEST

3a. Test the complete user journey in sequence:
    1. Navigate to /diagnostic
    2. Select NSW → HEER → answer eligibility questions (all pass)
    3. Enter yield inputs → receive certificate estimate + financial value
    4. Navigate to /attribution
    5. Enter stakeholders → complete decision tree → receive eligible saver
    6. Save assessment → project appears in /pipeline at Diagnostic stage
    7. Drag project to Validation stage
    8. Download PDF from the assessment

    Run this test programmatically if possible (create a test script that
    calls the API routes in sequence). If not, verify each step manually
    and document the outcome.

3b. Test the entity hierarchy:
    1. Create Downer Group entity
    2. Create Downer Rail as child of Downer Group
    3. Create a compliance obligation for Downer Rail
    4. Verify the exposure rolls up to Downer Group level

TASK 4: PRODUCE VERIFICATION REPORT

Write docs/downer-enterprise/VERIFICATION_REPORT.md:

```markdown
# Downer Enterprise Deployment — Verification Report
## Date: [timestamp]

### 1. Build Status
- Enterprise build: PASS/FAIL
- Broker build: PASS/FAIL (must still pass — no regression)
- Enterprise TypeScript: [error count]

### 2. Page Inventory
| Route | Renders | Shared Components Used | Issues |
|-------|---------|----------------------|--------|
| / (dashboard) | | | |
| /diagnostic | | | |
| /attribution | | | |
| /pipeline | | | |
| /portfolio | | | |
| /intelligence | | | |

### 3. API Routes
| Route | Methods | Tested | Issues |
|-------|---------|--------|--------|
[Each enterprise API route]

### 4. Shared Module Integration
| Module | Import Works | Renders | Data Flows | Issues |
|--------|-------------|---------|------------|--------|
| ForecastPanel | | | | |
| SupplyDemandPanel | | | | |
| AlertsFeed | | | | |
| BloombergShell | | | | |
| WREILineChart | | | | |
| Feed Manager | | | | |

### 5. End-to-End Workflow
| Step | Status | Notes |
|------|--------|-------|
| Diagnostic → eligibility → yield | | |
| Attribution → eligible saver | | |
| Assessment → pipeline | | |
| Pipeline drag-and-drop | | |
| PDF generation | | |
| Entity hierarchy + exposure rollup | | |

### 6. Broker Regression Check
- Broker build: PASS/FAIL
- Broker tests: [pass count] / [total]
- No broker files modified: [CONFIRMED/list changes]

### 7. Outstanding Items
[Issues that need resolution before production deployment]
```

VERIFICATION:
  cd enterprise && npm run build 2>&1 | tail -10
  cd .. && npm run build 2>&1 | tail -5
  cat docs/downer-enterprise/VERIFICATION_REPORT.md | head -50

COMMIT:
  git add -A && git commit -m "D5: PDF generation + integration + verification"
  git tag downer-enterprise-v1
  Update TASK_LOG.md.
```

---

## 4. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Shared component imports fail due to Next.js external directory restrictions | High | Blocks D1 | Three fallback approaches: externalDir, symlinks, webpack aliases. D1 tries all three. |
| BloombergShell has hardcoded broker nav items | Medium | Delays D2 | Create enterprise wrapper component. |
| Shared intelligence components depend on broker-specific API routes | Medium | Delays D2 | Extract handler logic into lib/ functions callable by both apps. |
| SSO integration complexity exceeds single session | Medium | Delays D2 | Stub middleware for development; full SSO in a dedicated follow-up session. |
| PDF generation library incompatible with Next.js 14 server components | Low | Delays D5 | Three fallback libraries identified: @react-pdf/renderer, pdfkit, puppeteer. |
| Broker build regresses due to shared file changes | Low | High | Only one shared file is modified (white-label.ts — additive change only). Broker build verified at every phase gate. |

---

*End of Downer build plan.*
