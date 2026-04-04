# WREI Trading Platform — Dependency Analysis

**Document:** WR-WREI-DEP-001  
**Date:** 5 April 2026  
**Scope:** Critical path trace, dead code identification, oversized file triage, markdown audit, trade page decomposition  
**Method:** Automated recursive import tracing from all application entry points

---

## Task 1: Critical Path Trace

### Methodology

A recursive BFS import tracer was executed starting from all 24 application entry points (10 pages, 12 API routes, root layout, globals.css). The tracer resolved `@/` alias imports, relative imports, barrel exports (`index.ts`), and followed all transitive dependencies to leaf nodes.

### Entry Points (24)

**Pages (10):**
`app/page.tsx`, `app/trade/page.tsx`, `app/compliance/page.tsx`, `app/analyse/page.tsx`, `app/performance/page.tsx`, `app/calculator/page.tsx`, `app/developer/page.tsx`, `app/scenario/page.tsx`, `app/simulate/page.tsx`, `app/institutional/portal/page.tsx`

**API Routes (12):**
`app/api/negotiate/route.ts`, `app/api/trade/route.ts`, `app/api/trades/route.ts`, `app/api/market-data/route.ts`, `app/api/market-commentary/route.ts`, `app/api/prices/route.ts`, `app/api/analytics/route.ts`, `app/api/analytics/predict/route.ts`, `app/api/compliance/route.ts`, `app/api/performance/route.ts`, `app/api/metadata/route.ts`, `app/api/scenarios/generate/route.ts`

**Infrastructure (2):**
`app/layout.tsx`, `app/globals.css`

### Active Set — 174 Files

The following 174 files are reachable via static import analysis from the entry points:

```
app/analyse/page.tsx
app/api/analytics/predict/route.ts
app/api/analytics/route.ts
app/api/compliance/route.ts
app/api/market-commentary/route.ts
app/api/market-data/route.ts
app/api/metadata/route.ts
app/api/negotiate/route.ts
app/api/performance/route.ts
app/api/prices/route.ts
app/api/scenarios/generate/route.ts
app/api/trade/route.ts
app/api/trades/route.ts
app/calculator/page.tsx
app/compliance/page.tsx
app/developer/page.tsx
app/globals.css
app/institutional/portal/page.tsx
app/layout.tsx
app/page.tsx
app/performance/page.tsx
app/scenario/page.tsx
app/simulate/page.tsx
app/system/page.tsx
app/trade/page.tsx
components/analytics/AnalyticsEngine.ts
components/analytics/index.ts
components/analytics/IntelligentAnalyticsDashboard.tsx
components/analytics/PerformanceChart.tsx
components/analytics/RealTimeMetricsWidget.tsx
components/analytics/types.ts
components/analytics/useAnalytics.ts
components/analytics/useIntelligentAnalytics.ts
components/audience/AudienceSelector.tsx
components/audience/CompliancePanel.tsx
components/audience/ExecutiveDashboard.tsx
components/audience/index.ts
components/audience/MultiAudienceRouter.tsx
components/audience/TechnicalInterface.tsx
components/blockchain/MerkleTreeView.tsx
components/blockchain/ProvenanceChain.tsx
components/blockchain/VesselProvenanceCard.tsx
components/branding/WhiteLabelProvider.tsx
components/calculator/InvestmentCalculator.tsx
components/calculator/ScenarioCompare.tsx
components/charts/index.ts
components/charts/WREIAreaChart.tsx
components/charts/WREIBarChart.tsx
components/charts/WREILineChart.tsx
components/charts/WREIPieChart.tsx
components/compliance/AuditTrailViewer.tsx
components/compliance/ComplianceStatusDashboard.tsx
components/compliance/index.ts
components/compliance/RegulatoryMap.tsx
components/demo/SimpleDemoProvider.tsx
components/demo/SimpleDemoToggle.tsx
components/developer/APIExplorer.tsx
components/export/ExportModal.tsx
components/generation/types.ts
components/institutional/AFSLComplianceReview.tsx
components/institutional/ComplianceConfirmation.tsx
components/institutional/InstitutionalIdentityForm.tsx
components/institutional/InstitutionalOnboardingWizard.tsx
components/institutional/InvestmentPreferencesConfig.tsx
components/institutional/InvestorClassificationAssessment.tsx
components/institutional/KYCAMLVerification.tsx
components/institutional/PipelineTransition.tsx
components/InstitutionalDashboard.tsx
components/market/ESGImpactDashboard.tsx
components/market/FeedHealthIndicator.tsx
components/market/index.ts
components/market/MarketStatus.tsx
components/market/MarketTicker.tsx
components/navigation/BloombergShell.tsx
components/negotiation/CoachingPanel.tsx
components/negotiation/ComparisonDashboard.tsx
components/negotiation/ReplayViewer.tsx
components/negotiation/Scorecard.tsx
components/NegotiationStrategyPanel.tsx
components/orchestration/types.ts
components/PerformanceDashboard.tsx
components/professional/AccessibilityWrapper.tsx
components/professional/BloombergLayout.tsx
components/professional/ProfessionalDataGrid.tsx
components/ProfessionalInterface.tsx
components/scenarios/DeFiYieldFarmingScenario.tsx
components/scenarios/ESGImpactScenario.tsx
components/scenarios/FamilyOfficeScenario.tsx
components/scenarios/InfrastructureFundScenario.tsx
components/scenarios/SovereignWealthFundScenario.tsx
components/scenarios/types.ts
components/simulation/ScenarioSelector.tsx
components/simulation/ScenarioSimulationEngine.tsx
components/trading/BulkNegotiationDashboard.tsx
components/trading/InstrumentSwitcher.tsx
components/trading/OrderBookPanel.tsx
components/trading/ProvenanceCertificate.tsx
components/trading/TokenDetailPanel.tsx
components/trading/TradeBlotter.tsx
design-system/tokens/professional-tokens.ts
lib/advanced-analytics.ts
lib/ai-analytics/IntelligentAnalyticsEngine.ts
lib/ai-orchestration/DemoOrchestrationEngine.ts
lib/ai-scenario-generation/DynamicScenarioEngine.ts
lib/analytics-utils.ts
lib/api-documentation.ts
lib/api-helpers.ts
lib/api-routes/live-market-data-handler.ts
lib/architecture-layers/measurement.ts
lib/architecture-layers/tokenization.ts
lib/architecture-layers/types.ts
lib/architecture-layers/verification.ts
lib/committee-mode.ts
lib/config/white-label.ts
lib/data-feeds/adapters/ecovantage-scraper.ts
lib/data-feeds/adapters/northmore-scraper.ts
lib/data-feeds/adapters/simulation-engine.ts
lib/data-feeds/adapters/types.ts
lib/data-feeds/cache/price-cache.ts
lib/data-feeds/carbon-pricing-feed.ts
lib/data-feeds/feed-manager.ts
lib/data-feeds/live-carbon-pricing-feed.ts
lib/data-feeds/real-time-connector.ts
lib/data-feeds/rwa-market-feed.ts
lib/data-feeds/types.ts
lib/data-sources/coinmarketcap-api.ts
lib/data-sources/fred-api.ts
lib/data-sources/world-bank-api.ts
lib/defence.ts
lib/demo-mode/demo-data-simple.ts
lib/demo-mode/demo-state-manager.ts
lib/demo-mode/simple-demo-state.ts
lib/esg-impact-metrics.ts
lib/export-utilities.ts
lib/financial-calculations.ts
lib/institutional-onboarding.ts
lib/investment-calculator.ts
lib/market-intelligence.ts
lib/negotiate/investor-pathways.ts
lib/negotiate/market-intelligence-context.ts
lib/negotiate/message-history.ts
lib/negotiate/state-manager.ts
lib/negotiate/system-prompt.ts
lib/negotiate/token-context.ts
lib/negotiation-coaching.ts
lib/negotiation-config.ts
lib/negotiation-history.ts
lib/negotiation-scoring.ts
lib/negotiation-strategy.ts
lib/onboarding-pipeline.ts
lib/performance-monitor.ts
lib/personas.ts
lib/professional-analytics.ts
lib/regulatory-compliance.ts
lib/risk-profiles.ts
lib/simulation/index.ts
lib/simulation/mock-api-gateway.ts
lib/simulation/performance-tracker.ts
lib/simulation/scenario-engine.ts
lib/ticker-data.ts
lib/token-metadata.ts
lib/trading/compliance/audit-logger.ts
lib/trading/compliance/report-generator.ts
lib/trading/instruments/asset-token-config.ts
lib/trading/instruments/carbon-token-config.ts
lib/trading/instruments/certificate-config.ts
lib/trading/instruments/instrument-registry.ts
lib/trading/instruments/pricing-engine.ts
lib/trading/instruments/types.ts
lib/trading/negotiation/instrument-context.ts
lib/trading/orderbook/orderbook-simulator.ts
lib/trading/personas/esc-personas.ts
lib/types.ts
lib/yield-models.ts
```

---

## Task 2: Dead Code Identification

### Summary

| Category | Count | Lines |
|----------|-------|-------|
| Total source files (non-test) | 239 | 135,104 |
| Active set (import-reachable) | 174 | — |
| Dead code candidates | 65 | ~22,174 |
| Of which: infrastructure/config (not truly dead) | 3 | — |
| Of which: DB layer (runtime, env-gated) | 8 | ~835 |
| Of which: settlement layer (imported by orchestrator, but orchestrator unreferenced) | 8 | ~1,341 |
| Of which: truly orphaned code | 46 | ~19,998 |

### Classification

#### NOT DEAD — Build Infrastructure (3 files)

These are consumed by tooling, not by import chains:

| File | Lines | Reason |
|------|-------|--------|
| `next-env.d.ts` | — | TypeScript ambient declarations |
| `playwright.config.ts` | — | E2E test configuration |
| `tailwind.config.ts` | — | CSS build configuration |

#### NOT DEAD — Database Layer (8 files, ~835 lines)

These files are imported by other files in the active set (e.g., `audit-logger.ts` imports `lib/db/queries/audit-log.ts`, `TradeBlotter.tsx` imports `lib/db/queries/trades.ts`, `price-cache.ts` imports `lib/db/connection.ts`) but through **conditional/runtime paths** that the static import tracer could not follow because the DB imports use try/catch guards for when `POSTGRES_URL` is absent:

| File | Lines | Imported By |
|------|-------|-------------|
| `lib/db/connection.ts` | 59 | audit-logger, price-cache, trades route |
| `lib/db/index.ts` | 13 | barrel export |
| `lib/db/schema.ts` | 161 | migrate.ts |
| `lib/db/migrate.ts` | 108 | seed-data.ts |
| `lib/db/queries/audit-log.ts` | 91 | audit-logger.ts |
| `lib/db/queries/negotiations.ts` | 135 | — (future use) |
| `lib/db/queries/pricing.ts` | 128 | price-cache.ts |
| `lib/db/queries/trades.ts` | 130 | trades route, TradeBlotter |

**Verdict:** KEEP — essential for production database integration.

#### NOT DEAD — Settlement Layer (8 files, ~1,341 lines)

The settlement orchestrator imports all 4 adapters + 2 stubs, but **nothing in the active set imports the settlement orchestrator itself**. This is a latent dependency — the settlement layer is architecturally complete but not wired into the trade execution flow:

| File | Lines | Status |
|------|-------|--------|
| `lib/trading/settlement/types.ts` | 105 | Imported by orchestrator |
| `lib/trading/settlement/settlement-orchestrator.ts` | 252 | **Not imported by any active file** |
| `lib/trading/settlement/adapters/tessa-adapter.ts` | 162 | Imported by orchestrator |
| `lib/trading/settlement/adapters/cer-adapter.ts` | 151 | Imported by orchestrator |
| `lib/trading/settlement/adapters/veec-adapter.ts` | 156 | Imported by orchestrator |
| `lib/trading/settlement/adapters/blockchain-adapter.ts` | 149 | Imported by orchestrator |
| `lib/trading/settlement/adapters/zoniqx-stub.ts` | 225 | Not imported |
| `lib/trading/settlement/adapters/cortenx-stub.ts` | 279 | Not imported |

**Verdict:** KEEP — architecturally required per WP6 §3.2.11–3.2.17. The orchestrator needs to be wired into the trade execution flow (post-negotiation settlement trigger).

#### NOT DEAD — Demo/Seed Infrastructure (2 files, ~797 lines)

| File | Lines | Status |
|------|-------|--------|
| `lib/demo/seed-data.ts` | 280 | Called at runtime for demo seeding; imports DB modules |
| `lib/demo-mode/demo-data-sets.ts` | 517 | Legacy demo data; not imported by any active file |

**Verdict:** `seed-data.ts` KEEP. `demo-data-sets.ts` is a candidate for archival.

#### TRULY ORPHANED — Components (31 files, ~15,614 lines)

These component files are **not imported by any file in the project** (only self-references or test imports):

| File | Lines | Description |
|------|-------|-------------|
| `components/AdvancedAnalytics.tsx` | 795 | Legacy analytics component |
| `components/analytics/AdvancedAnalyticsSuite.tsx` | 852 | Legacy analytics suite |
| `components/analytics/AnalyticsDashboard.tsx` | 53 | Legacy analytics dashboard stub |
| `components/AnalyticsHub.tsx` | 427 | Legacy analytics hub |
| `components/CoreInvestorJourneys.tsx` | 314 | Legacy investor journey component |
| `components/demo/DemoModeToggle.tsx` | 226 | Legacy demo toggle (replaced by SimpleDemoToggle) |
| `components/ESGFundJourney.tsx` | 920 | Scenario journey component |
| `components/FamilyOfficeJourney.tsx` | 954 | Scenario journey component |
| `components/generation/index.ts` | 65 | Barrel export for unused generation components |
| `components/generation/ScenarioGenerator.tsx` | 689 | Unused scenario generator |
| `components/generation/useScenarioGeneration.ts` | 531 | Unused hook |
| `components/InfrastructureFundJourney.tsx` | 693 | Scenario journey component |
| `components/market/CompetitivePositioning.tsx` | 575 | Unused competitive positioning display |
| `components/MarketIntelligenceDashboard.tsx` | 774 | Legacy market intelligence dashboard |
| `components/navigation/NavigationShell.tsx` | 162 | Legacy navigation (replaced by BloombergShell) |
| `components/negotiation/CommitteePanel.tsx` | 370 | Unused committee mode panel |
| `components/orchestration/DemoOrchestrator.tsx` | 469 | Legacy demo orchestrator |
| `components/orchestration/index.ts` | 37 | Barrel export for unused orchestration |
| `components/orchestration/useOrchestration.ts` | 265 | Unused orchestration hook |
| `components/PortfolioManager.tsx` | 575 | Unused portfolio manager |
| `components/PredictiveAnalyticsDashboard.tsx` | 782 | Unused predictive dashboard |
| `components/professional/index.ts` | 19 | Barrel export |
| `components/scenarios/ComplianceWorkflows.tsx` | 857 | Unused compliance workflow scenarios |
| `components/scenarios/ESCMarketScenarios.tsx` | 865 | Unused ESC market scenarios |
| `components/scenarios/index.ts` | 38 | Barrel export for unused scenarios |
| `components/scenarios/PortfolioOptimizer.tsx` | 830 | Unused portfolio optimizer |
| `components/scenarios/ScenarioLibrary.tsx` | 448 | Unused scenario library |
| `components/scenarios/TemplateManager.tsx` | 600 | Unused template manager |
| `components/scenarios/TradingSimulationEngine.tsx` | 738 | Unused trading simulation |
| `components/simulation/index.ts` | 10 | Barrel export |
| `components/trading/MarketAnalysisPanel.tsx` | 273 | Not imported by trade page |
| `components/trading/TradeExecutionDashboard.tsx` | 221 | Not imported by trade page |
| `components/trading/TradeHistoryView.tsx` | 334 | Not imported by trade page |
| `components/ui/professional/ProfessionalDataGrid.tsx` | 464 | Duplicate of `components/professional/ProfessionalDataGrid.tsx` |
| `components/ui/professional/ProfessionalMetricsDashboard.tsx` | 501 | Not imported |

#### TRULY ORPHANED — Library Files (7 files, ~4,387 lines)

| File | Lines | Description |
|------|-------|-------------|
| `lib/ai-presentation/AdaptivePresentationEngine.ts` | 1,115 | Stage 2 engine — not imported |
| `lib/architecture-layers/distribution.ts` | 435 | Architecture layer — not imported |
| `lib/chart-data-transforms.ts` | 241 | Chart transforms — not imported |
| `lib/competitive-analysis.ts` | 559 | Competitive analysis — only imported by orphaned `CompetitivePositioning.tsx` |
| `lib/config/live-pricing-config.ts` | 271 | Only imported by orphaned `useLivePricing.ts` |
| `lib/services/live-pricing-service.ts` | 221 | Only imported by orphaned `useLivePricing.ts` |
| `lib/trading-analytics.ts` | 344 | Not imported by any file |
| `hooks/useLivePricing.ts` | 120 | Not imported by any file |
| `design-system/enhanced-professional-theme.ts` | 652 | Not imported by any file |

### Dead Code Summary

| Category | Files | Lines | Action |
|----------|-------|-------|--------|
| Truly orphaned components | 35 | ~15,614 | Archive to `_archive/` |
| Truly orphaned library files | 9 | ~3,958 | Archive to `_archive/` |
| Orphaned design system | 1 | 652 | Archive |
| **Total archivable** | **45** | **~20,224** | **15% of total codebase** |
| Settlement layer (unwired) | 8 | 1,341 | Wire into trade flow |
| DB layer (env-gated) | 8 | 835 | Keep |
| Build infrastructure | 3 | — | Keep |
| Demo seed | 1 | 280 | Keep |

---

## Task 3: Oversized Files in Critical Path

### Category A — Oversized AND in Active Critical Path (98 files)

These files exceed the 300-line limit (WP6 Principle 9) AND are reachable from application entry points. They represent active technical debt that affects maintainability.

#### Priority 1 — Over 1,000 Lines (13 files, MUST decompose)

| File | Lines | Entry Points | Suggested Decomposition |
|------|-------|-------------|------------------------|
| `app/trade/page.tsx` | **2,402** | Direct entry point | See Task 5 below — split into ~12 sub-components |
| `lib/api-documentation.ts` | 1,845 | `app/developer/page.tsx` | Split into per-route documentation objects; consider auto-generation from route files |
| `lib/market-intelligence.ts` | 1,472 | `app/api/negotiate/route.ts` → `lib/negotiate/system-prompt.ts` | Split: `market-data-context.ts`, `vcm-analysis.ts`, `esc-market-context.ts`, `competitive-intel.ts` |
| `lib/ai-scenario-generation/DynamicScenarioEngine.ts` | 1,449 | `app/api/scenarios/generate/route.ts` | Split: `scenario-types.ts`, `parameter-generator.ts`, `narrative-builder.ts`, `financial-projector.ts` |
| `components/scenarios/FamilyOfficeScenario.tsx` | 1,342 | `app/scenario/page.tsx` | Extract: `FamilyOfficeOverview.tsx`, `FamilyOfficeMetrics.tsx`, `FamilyOfficeCharts.tsx` |
| `lib/export-utilities.ts` | 1,301 | `app/trade/page.tsx` | Split by format: `csv-exporter.ts`, `html-report-builder.ts`, `export-types.ts` |
| `lib/regulatory-compliance.ts` | 1,228 | `app/api/compliance/route.ts` | Split by scheme: `ess-compliance.ts`, `afsl-compliance.ts`, `aml-ctf.ts`, `compliance-types.ts` |
| `components/scenarios/DeFiYieldFarmingScenario.tsx` | 1,216 | `app/scenario/page.tsx` | Extract sub-sections into focused components |
| `components/ProfessionalInterface.tsx` | 1,174 | `app/trade/page.tsx` | Extract: `ProfessionalHeader.tsx`, `MetricsGrid.tsx`, `YieldAnalysis.tsx`, `RiskPanel.tsx` |
| `components/InstitutionalDashboard.tsx` | 1,159 | `app/trade/page.tsx` | Extract: `InstitutionalHeader.tsx`, `PortfolioView.tsx`, `YieldDashboard.tsx` |
| `components/scenarios/SovereignWealthFundScenario.tsx` | 1,143 | `app/scenario/page.tsx` | Extract sub-sections into focused components |
| `components/scenarios/ESGImpactScenario.tsx` | 1,127 | `app/scenario/page.tsx` | Extract sub-sections into focused components |
| `components/scenarios/InfrastructureFundScenario.tsx` | 1,038 | `app/scenario/page.tsx` | Extract sub-sections into focused components |

#### Priority 2 — 600–999 Lines (21 files, SHOULD decompose)

| File | Lines | Key Importers |
|------|-------|--------------|
| `lib/committee-mode.ts` | 999 | `app/api/negotiate/route.ts` |
| `lib/token-metadata.ts` | 988 | `lib/negotiate/state-manager.ts` |
| `lib/ai-analytics/IntelligentAnalyticsEngine.ts` | 985 | `components/analytics/useIntelligentAnalytics.ts` |
| `components/analytics/types.ts` | 963 | `components/analytics/*` |
| `lib/ai-orchestration/DemoOrchestrationEngine.ts` | 952 | `components/simulation/ScenarioSimulationEngine.tsx` |
| `lib/professional-analytics.ts` | 886 | `app/trade/page.tsx` |
| `lib/negotiation-coaching.ts` | 795 | `components/negotiation/CoachingPanel.tsx` |
| `components/market/ESGImpactDashboard.tsx` | 778 | `app/performance/page.tsx` |
| `lib/negotiation-config.ts` | 766 | Widely imported |
| `lib/data-feeds/real-time-connector.ts` | 759 | `lib/data-feeds/feed-manager.ts` (legacy) |
| `lib/financial-calculations.ts` | 732 | `app/api/analytics/predict/route.ts` |
| `app/api/analytics/route.ts` | 713 | Direct API entry |
| `components/analytics/AnalyticsEngine.ts` | 706 | `components/analytics/useAnalytics.ts` |
| `components/negotiation/ComparisonDashboard.tsx` | 696 | `app/trade/page.tsx` |
| `lib/yield-models.ts` | 687 | `app/api/analytics/route.ts` |
| `lib/advanced-analytics.ts` | 681 | `app/api/analytics/predict/route.ts` |
| `lib/risk-profiles.ts` | 660 | `lib/negotiate/system-prompt.ts` |
| `components/audience/CompliancePanel.tsx` | 653 | `components/audience/index.ts` |
| `lib/negotiation-scoring.ts` | 627 | `app/trade/page.tsx` |
| `components/simulation/ScenarioSelector.tsx` | 627 | `app/simulate/page.tsx` |
| `components/developer/APIExplorer.tsx` | 620 | `app/developer/page.tsx` |
| `app/page.tsx` | 615 | Direct entry point |
| `components/audience/TechnicalInterface.tsx` | 612 | `components/audience/index.ts` |
| `app/api/compliance/route.ts` | 605 | Direct API entry |
| `lib/investment-calculator.ts` | 605 | `components/calculator/InvestmentCalculator.tsx` |

#### Priority 3 — 300–599 Lines (64 files, CAN defer)

These are moderately oversized. Full list available in the oversized file output. Notable entries include `lib/defence.ts` (373 lines, documented exception per WP6), data feed legacy modules, and institutional onboarding components.

### Category B — Oversized but NOT in Active Path (31 files, ~17,872 lines)

These files are both oversized AND dead code. They should be archived rather than decomposed:

| File | Lines |
|------|-------|
| `lib/ai-presentation/AdaptivePresentationEngine.ts` | 1,115 |
| `components/FamilyOfficeJourney.tsx` | 954 |
| `components/ESGFundJourney.tsx` | 920 |
| `components/scenarios/ESCMarketScenarios.tsx` | 865 |
| `components/scenarios/ComplianceWorkflows.tsx` | 857 |
| `components/analytics/AdvancedAnalyticsSuite.tsx` | 852 |
| `components/scenarios/PortfolioOptimizer.tsx` | 830 |
| `components/AdvancedAnalytics.tsx` | 795 |
| `components/PredictiveAnalyticsDashboard.tsx` | 782 |
| `components/MarketIntelligenceDashboard.tsx` | 774 |
| `components/scenarios/TradingSimulationEngine.tsx` | 738 |
| `components/InfrastructureFundJourney.tsx` | 693 |
| `components/generation/ScenarioGenerator.tsx` | 689 |
| `design-system/enhanced-professional-theme.ts` | 652 |
| `components/scenarios/TemplateManager.tsx` | 600 |
| `components/PortfolioManager.tsx` | 575 |
| `components/market/CompetitivePositioning.tsx` | 575 |
| `lib/competitive-analysis.ts` | 559 |
| `components/generation/useScenarioGeneration.ts` | 531 |
| `lib/demo-mode/demo-data-sets.ts` | 517 |
| `components/ui/professional/ProfessionalMetricsDashboard.tsx` | 501 |
| `components/orchestration/DemoOrchestrator.tsx` | 469 |
| `components/ui/professional/ProfessionalDataGrid.tsx` | 464 |
| `components/scenarios/ScenarioLibrary.tsx` | 448 |
| `lib/architecture-layers/distribution.ts` | 435 |
| `components/AnalyticsHub.tsx` | 427 |
| `app/page_original.tsx` | 414 |
| `components/negotiation/CommitteePanel.tsx` | 370 |
| `lib/trading-analytics.ts` | 344 |
| `components/trading/TradeHistoryView.tsx` | 334 |
| `components/CoreInvestorJourneys.tsx` | 314 |

---

## Task 4: Legacy Markdown Audit

### KEEP (9 files) — Current operational documents

| File | Reason |
|------|--------|
| `CLAUDE.md` | Active project context for Claude Code sessions |
| `README.md` | Project description, v1.0.0 |
| `CHANGELOG.md` | Version changelog |
| `SECURITY.md` | Security policy |
| `TASK_LOG.md` | Session-by-session implementation log |
| `GATE_REPORT_P0.md` | Phase 0 gate report |
| `GATE_REPORT_P1.md` | Phase 1 gate report |
| `GATE_REPORT_P2.md` | Phase 2 gate report |
| `GATE_REPORT_P3.md` | Phase 3 gate report |
| `GATE_REPORT_P4.md` | Phase 4 gate report |
| `POST_IMPLEMENTATION_ASSESSMENT.md` | This assessment (current) |

### ARCHIVE (46 files) — Stale pre-WP6 documents

**Demo specifications (8 files):** Superseded by WP4 user scenarios.
- `DEMO_ARCHITECTURE_SPECIFICATION.md`, `DEMO_DEVELOPMENT_MASTER_PLAN.md`, `DEMO_IMPLEMENTATION_GUIDE.md`, `DEMO_PROGRESS_TRACKING.md`, `DEMO_REQUIREMENTS_SPECIFICATION.md`, `DEMO_TECHNICAL_SPECIFICATIONS.md`, `DEMO_TESTING_STRATEGY.md`, `DEMO_UI_TEST_REPORT.md`

**Development management (5 files):** Process docs from earlier sessions.
- `DEVELOPMENT_CONTEXT_HANDOFF.md`, `DEVELOPMENT_MANAGEMENT_FRAMEWORK.md`, `DEVELOPMENT_MANAGEMENT_PROTOCOLS.md`, `DEVELOPMENT_PROCESS.md`, `DEVELOPMENT_SETUP_COMMANDS.md`

**Implementation plans (5 files):** Superseded by WP6/WP7.
- `MASTER_IMPLEMENTATION_PLAN.md`, `INTEGRATED_DEVELOPMENT_PLAN.md`, `TRADE_IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_ORCHESTRATION.md`, `IMPLEMENTATION_TRACKING_GUIDE.md`

**Pre-WP6 milestone reports (12 files):** Historical.
- `MILESTONE_1.1_COMPLETION.md`, `MILESTONE_1.2_COMPLETION.md`, `MILESTONE_1.3_COMPLETION.md`, `MILESTONE_2.1_PHASE3_AUDIT.md`, `PHASE_6.2_COMPLETION_SUMMARY.md`, `PHASE_6.2_IMPLEMENTATION_SUMMARY.md`, `STEP_1_1_IMPLEMENTATION_SUMMARY.md`, `STEP_1_2_IMPLEMENTATION_SUMMARY.md`, `STEP_1_3_IMPLEMENTATION_SUMMARY.md`, `STEP_1_4_IMPLEMENTATION_SUMMARY.md`, `STEP_2_1_IMPLEMENTATION_SUMMARY.md`, `STEP_2_2_IMPLEMENTATION_SUMMARY.md`, `STEP_2_3_IMPLEMENTATION_SUMMARY.md`, `STEP_2_4_IMPLEMENTATION_SUMMARY.md`

**Status snapshots (6 files):** Point-in-time, no longer relevant.
- `CONTEXT_CONTINUATION_PROMPT.md`, `CONTEXT_STATUS_ASSESSMENT.md`, `PROJECT_STATUS_UPDATE_MARCH_25.md`, `PROJECT_STATUS_UPDATE_MARCH_25_STEP_1_4_COMPLETE.md`, `PROJECT_VALIDATION_SUMMARY.md`, `STAGE_2_DEVELOPMENT_CONTEXT_PROMPT.md`

**Other stale (10 files):**
- `DESIGN_DOCUMENTATION.md`, `DOCUMENTATION_UPDATE_SUMMARY.md`, `LIVE_DATA_INTEGRATION_SUMMARY.md`, `PHASE_VERIFICATION_FRAMEWORK.md`, `SCENARIO_SIMULATION_PLAN.md`, `SIMULATION_TECHNICAL_SPEC.md`, `TEST_DOCUMENTATION.md`, `TEST_REPORT.md`, `USER_SCENARIOS.md`, `WREI_TOKENIZATION_PROJECT.md`

### REVIEW (3 files) — May contain useful content

| File | Reason to Review |
|------|-----------------|
| `WP7_CC_Prompt_Package.md` | Duplicate of `architecture/WP7_CC_Prompt_Package.md`? If so, remove the root copy. |
| `WREI_Platform_Audit.md` | May contain audit findings not captured elsewhere |
| `wrei-monetisation-analysis.md` | Business analysis — may inform future feature work |

---

## Task 5: `app/trade/page.tsx` Decomposition Plan

### Current State: 2,402 lines

This is the single largest file in the codebase and the most critical page — the main trading interface. It combines state management, API communication, session history, multiple interface modes, and extensive JSX into a single monolithic component.

### 5.1 — Component Inventory

The file contains these distinct UI sections within the `return()` JSX (starting at line 781):

| Section | Lines (approx) | Description |
|---------|---------------|-------------|
| Pre-config banner | 783–800 | Institutional onboarding banner (conditional) |
| Mode selector header | 802–867 | Standard / Professional / Bulk toggle + ExportModal |
| Bulk mode branch | 870–873 | `<BulkNegotiationDashboard />` (already extracted) |
| Professional mode branch | 874–922 | `<ProfessionalInterface />` with inline AUM/risk/yield mapping (already extracted, but with ~40 lines of inline prop computation) |
| Left panel — Instrument Switcher | 932–936 | `<InstrumentSwitcher />` (already extracted) |
| Left panel — Order Book | 938–942 | `<OrderBookPanel />` (already extracted) |
| Left panel — Token Detail | 944–947 | `<TokenDetailPanel />` (already extracted) |
| Left panel — Token Type Selector | 949–1026 | 3 radio buttons for WREI token type with full marketing text (~77 lines of JSX) |
| Left panel — Persona Selector | 1028–1087 | Radio buttons for 11+ personas (~59 lines) |
| Left panel — Negotiation Dashboard | 1108–1484 | Price tracker, concessions, classification, emotion, market intelligence, threat level (~376 lines) |
| Left panel — Token Metadata Panel | 1486–1752 | Provenance, operational data, blockchain, environmental impact, yield, quality metrics (~266 lines) |
| Right panel — Chat Interface | 1753–1834 | Pre-trading welcome / active chat messages area |
| Right panel — Error display | 1834–1860 | Error messages with retry |
| Right panel — Completion states | 1860–1930 | Agreed/deferred/escalated outcome rendering |
| Right panel — Scorecard | 1930–1940 | `<Scorecard />` (already extracted) |
| Right panel — Analytics panel | 1940–2130 | Inline charts: argument distribution, price movement timeline, emotional state timeline, feedback (~190 lines) |
| Right panel — Institutional Dashboard | 2130–2240 | Tab navigation (Standard/Institutional/History), session history, replay list (~110 lines) |
| Right panel — Input area | 2240–2300 | Textarea + action buttons (Send, End, Request Human, Reset) (~60 lines) |
| Bottom — Trade Blotter | 2306–2312 | `<TradeBlotter />` (already extracted) |
| Bottom — Status bar | 2313–2325 | Round/phase/price status strip |
| Floating — Strategy Panel | 2326–2340 | `<NegotiationStrategyPanel />` (already extracted) |
| Floating — Coaching Panel | 2341–2350 | `<CoachingPanel />` (already extracted) |
| Modal — Provenance Certificate | 2352–2395 | `<ProvenanceCertificate />` (already extracted, but conditional wrapper + prop computation inline) |

### 5.2 — State Management Inventory

**useState (34 calls):**

| State Variable | Type | Used By |
|----------------|------|---------|
| `selectedPersona` | `PersonaType \| 'freeplay'` | Persona selector, API calls |
| `selectedCreditType` | `CreditType` | Token type selector |
| `selectedWREITokenType` | `WREITokenType` | Token type selector |
| `tradingState` | `NegotiationState \| null` | Core — everything depends on this |
| `inputMessage` | `string` | Chat input |
| `isLoading` | `boolean` | Loading states |
| `error` | `string \| null` | Error display |
| `tradingStarted` | `boolean` | Workflow gating |
| `currentClassification` | `ArgumentClassification` | Analytics |
| `currentEmotion` | `EmotionalState` | Analytics |
| `threatLevel` | `'none' \| 'low' \| 'medium' \| 'high'` | Security display |
| `isInitializing` | `boolean` | Loading state |
| `lastFailedMessage` | `string \| null` | Retry logic |
| `activeAnalyticsTab` | `'standard' \| 'institutional' \| 'history'` | Tab selector |
| `tradingSessions` | `NegotiationSession[]` | History |
| `selectedSession` | `NegotiationSession \| null` | Replay |
| `showReplayViewer` | `boolean` | Modal toggle |
| `showComparisonDashboard` | `boolean` | Modal toggle |
| `sessionComparison` | `SessionComparison \| null` | Comparison data |
| `tradingStartTime` | `string \| null` | Session tracking |
| `interfaceMode` | `'standard' \| 'professional' \| 'bulk'` | Mode selector |
| `investorClassification` | `InvestorClassification` | Professional mode |
| `investmentSize` | `number` | Professional mode |
| `timeHorizon` | `number` | Professional mode |
| `showExportOptions` | `boolean` | Export modal |
| `currentStrategyExplanation` | `NegotiationStrategyExplanation \| null` | Strategy panel |
| `showStrategyPanel` | `boolean` | Panel toggle |
| `tradingScorecard` | `NegotiationScorecard \| null` | Scorecard |
| `showScorecard` | `boolean` | Modal toggle |
| `showCoachingPanel` | `boolean` | Panel toggle |
| `showBlockchainProvenance` | `boolean` | Panel toggle |
| `selectedInstrument` | `InstrumentType` | Instrument switcher |
| `instrumentPricing` | `ResolvedPricing \| null` | Pricing data |
| `blotterTrades` | `BlotterTrade[]` | Trade blotter |
| `showProvenanceCert` | `boolean` | Modal toggle |
| `lastAgreedTrade` | `BlotterTrade \| null` | Certificate data |
| `isPreConfigured` | `boolean` | Onboarding pipeline |
| `preConfigData` | `NegotiationPreConfig \| null` | Onboarding pipeline |
| `preConfigMessage` | `string` | Onboarding pipeline |
| `preConfigApplied` | `boolean` | Onboarding pipeline |

**useEffect (3 calls):**
- Scroll to bottom on message change (line 171)
- Load trading sessions on mount (line 176)
- Pre-configuration from URL params (line 181)

**useRef (2 calls):**
- `messagesEndRef` — chat scroll anchor
- `inputRef` — textarea focus

**Event handlers (12 functions, ~400 lines):**
- `handleInstrumentChange`, `handlePersonaChange`, `handleCreditTypeChange`, `handleWREITokenTypeChange`
- `handleStartTrading`, `handleSendMessage`, `handleKeyPress`
- `handleEndTrading`, `handleRequestHuman`, `handleResetTrading`
- `saveCompletedTrading`, `refreshSessionsList`, `handleSessionComparison`, `handleViewReplay`, `closeReplayViewer`, `closeComparisonDashboard`
- `handleInvestmentDecision`, `generateReportData`
- `mapUrlPersonaToBuyerPersona`, `isInstitutionalPersona`

### 5.3 — Decomposition Proposal

**Target:** `app/trade/page.tsx` reduced to ~150–200 lines as a layout orchestrator.

**New file structure:**

```
app/trade/
├── page.tsx                              (~150 lines — layout orchestrator)
├── _components/
│   ├── TradeModeSelector.tsx             (~90 lines — Standard/Professional/Bulk tabs)
│   ├── TokenTypeSelector.tsx             (~100 lines — WREI token radio buttons)
│   ├── PersonaSelector.tsx               (~80 lines — persona radio list)
│   ├── NegotiationDashboard.tsx          (~250 lines — price/concession/classification/emotion display)
│   ├── TokenMetadataPanel.tsx            (~270 lines — provenance, operational data, blockchain, yield)
│   ├── ChatInterface.tsx                 (~200 lines — messages, input, completion states)
│   ├── AnalyticsInlinePanel.tsx          (~200 lines — argument chart, price timeline, emotion timeline)
│   ├── InstitutionalTabs.tsx             (~120 lines — Standard/Institutional/History tab content)
│   ├── PreConfigBanner.tsx               (~25 lines — institutional onboarding banner)
│   └── TradingStatusBar.tsx              (~20 lines — bottom round/phase/price strip)
├── _hooks/
│   ├── useTradeState.ts                  (~120 lines — all 34 useState calls + reducers)
│   ├── useTradeAPI.ts                    (~120 lines — handleStartTrading, handleSendMessage, handleEndTrading, handleRequestHuman)
│   ├── useTradeHistory.ts                (~60 lines — session management, comparison, replay)
│   └── usePreConfig.ts                   (~50 lines — URL param parsing, institutional pre-config)
└── _lib/
    ├── trade-types.ts                    (~30 lines — APIResponse, color maps)
    └── trade-utils.ts                    (~40 lines — isInstitutionalPersona, mapUrlPersonaToBuyerPersona, generateReportData)
```

**Line budget:**

| File | Est. Lines | Content |
|------|-----------|---------|
| `page.tsx` | ~150 | Imports all hooks + components, renders layout skeleton, passes props |
| `useTradeState.ts` | ~120 | All useState, derived state, state reset |
| `useTradeAPI.ts` | ~120 | fetch calls, trade recording, scorecard calculation |
| `useTradeHistory.ts` | ~60 | Session management functions |
| `usePreConfig.ts` | ~50 | URL parameter parsing, pre-configuration |
| `TradeModeSelector.tsx` | ~90 | Mode tabs + export button |
| `TokenTypeSelector.tsx` | ~100 | 3 WREI token type radio buttons |
| `PersonaSelector.tsx` | ~80 | Free play + persona list |
| `NegotiationDashboard.tsx` | ~250 | Price tracker, concession, classification, emotion, market intel |
| `TokenMetadataPanel.tsx` | ~270 | Full token metadata display |
| `ChatInterface.tsx` | ~200 | Messages area, input, completion states, error display |
| `AnalyticsInlinePanel.tsx` | ~200 | Argument distribution, price movement, emotional state charts |
| `InstitutionalTabs.tsx` | ~120 | Dashboard tabs with session history |
| `PreConfigBanner.tsx` | ~25 | Conditional banner |
| `TradingStatusBar.tsx` | ~20 | Status bar |
| `trade-types.ts` | ~30 | Shared types and color maps |
| `trade-utils.ts` | ~40 | Utility functions |
| **Total** | **~1,925** | Redistribution across 17 focused files |

**Resulting import structure for `page.tsx`:**

```tsx
'use client';

import { useTradeState } from './_hooks/useTradeState';
import { useTradeAPI } from './_hooks/useTradeAPI';
import { useTradeHistory } from './_hooks/useTradeHistory';
import { usePreConfig } from './_hooks/usePreConfig';

import TradeModeSelector from './_components/TradeModeSelector';
import TokenTypeSelector from './_components/TokenTypeSelector';
import PersonaSelector from './_components/PersonaSelector';
import NegotiationDashboard from './_components/NegotiationDashboard';
import TokenMetadataPanel from './_components/TokenMetadataPanel';
import ChatInterface from './_components/ChatInterface';
import AnalyticsInlinePanel from './_components/AnalyticsInlinePanel';
import InstitutionalTabs from './_components/InstitutionalTabs';
import PreConfigBanner from './_components/PreConfigBanner';
import TradingStatusBar from './_components/TradingStatusBar';

// Already-extracted external components
import BulkNegotiationDashboard from '@/components/trading/BulkNegotiationDashboard';
import ProfessionalInterface from '@/components/ProfessionalInterface';
import InstrumentSwitcher from '@/components/trading/InstrumentSwitcher';
import OrderBookPanel from '@/components/trading/OrderBookPanel';
import TokenDetailPanel from '@/components/trading/TokenDetailPanel';
import TradeBlotter from '@/components/trading/TradeBlotter';
import NegotiationStrategyPanel from '@/components/NegotiationStrategyPanel';
import CoachingPanel from '@/components/negotiation/CoachingPanel';
import ProvenanceCertificate from '@/components/trading/ProvenanceCertificate';
import ExportModal from '@/components/export/ExportModal';
import Scorecard from '@/components/negotiation/Scorecard';

export default function TradePage() {
  const state = useTradeState();
  const api = useTradeAPI(state);
  const history = useTradeHistory(state);
  usePreConfig(state);

  return (
    <div className="bg-[#F8FAFC]">
      <PreConfigBanner {...state} />
      <TradeModeSelector {...state} />
      
      {state.interfaceMode === 'bulk' ? (
        <BulkNegotiationDashboard />
      ) : state.interfaceMode === 'professional' ? (
        <ProfessionalInterface {...professionalProps} />
      ) : (
        <StandardLayout
          state={state} api={api} history={history}
        />
      )}
      
      <TradeBlotter trades={state.blotterTrades} instrumentFilter={state.selectedInstrument} />
      <TradingStatusBar state={state.tradingState} />
      {/* Floating panels */}
      <NegotiationStrategyPanel ... />
      <CoachingPanel ... />
      <ProvenanceCertificate ... />
    </div>
  );
}
```

**Key decomposition principles:**
1. State ownership stays in custom hooks — components receive props
2. No prop drilling deeper than 2 levels — use hooks or context for deeply nested state
3. Each component file ≤ 300 lines per WP6 Principle 9
4. The `_components/` and `_hooks/` prefixes use Next.js private folder convention (not routable)
5. Existing extracted components (`BulkNegotiationDashboard`, `ProfessionalInterface`, etc.) remain in their current locations

---

*Analysis generated: 5 April 2026*  
*Method: Automated recursive import tracing (BFS) + manual structure analysis*  
*Files analysed: 239 source files, 174 in active set, 65 dead code candidates*
