# WREI Trading Platform Development - Context Resume Prompt

**Use this prompt after clearing context to resume development with full project understanding**

---

## Project Context

You are working on the **WREI Trading Platform**, a Next.js 14 demo application that demonstrates Water Roads' carbon credit trading platform with AI negotiation capabilities. This is specifically focused on the **NSW Energy Savings Certificate (ESC) market** with **Northmore Gordon Pty Ltd** firm branding.

### Current Development Status: Stage 1 COMPLETE - Stage 2 Ready

**COMPLETED STEPS:**
- ✅ **Step 1.1**: NSW ESC Context Integration (4 hours) - Market context, demo state management
- ✅ **Step 1.2**: Multi-Audience Interface System (8 hours) - Executive, Technical, Compliance dashboards
- ✅ **Step 1.3**: Scenario Library & Templates (6 hours) - Comprehensive scenario management with 6 scenarios
- ✅ **Step 1.4**: Enhanced Negotiation Analytics (6 hours) - Real-time analytics and performance dashboards COMPLETED

**NEXT PHASE:**
- 🚀 **Stage 2**: Advanced Platform Capabilities - AI enhancements, mobile experience, predictive analytics

## Technology Stack

- **Framework**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **AI Engine**: Anthropic Claude API (@anthropic-ai/sdk)
- **State Management**: Zustand for demo mode state
- **UI Icons**: @heroicons/react
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel free tier

## Critical Project Context

### NSW ESC Market Context (from Step 1.1)
- **Current ESC Spot Price**: A$47.80/tonne
- **Market Size**: A$200M+ annual trading volume, 850+ participants
- **Key Data Sources**: AEMO pricing, Clean Energy Regulator compliance
- **Market Context File**: `lib/demo-mode/esc-market-context.ts`

### Northmore Gordon Firm Branding
- **AFSL**: 246896 (Australian Financial Services License)
- **Market Share**: 12% of NSW ESC market
- **Established**: 1985
- **Positioning**: Institutional-grade carbon credit trading with AI-powered negotiation

### Architecture Overview

```
components/
├── audience/           # Step 1.2: Multi-audience interfaces
│   ├── AudienceSelector.tsx
│   ├── ExecutiveDashboard.tsx       # ROI metrics, strategic KPIs (Enhanced with Step 1.4 analytics)
│   ├── TechnicalInterface.tsx       # System architecture, APIs
│   ├── CompliancePanel.tsx          # Regulatory adherence, audit trails
│   └── MultiAudienceRouter.tsx      # Navigation orchestration
├── scenarios/          # Step 1.3: Scenario management
│   ├── ScenarioLibrary.tsx          # Central scenario hub
│   ├── ESCMarketScenarios.tsx       # NSW ESC trading (18.5% price improvement)
│   ├── TradingSimulationEngine.tsx  # Live multi-participant trading
│   ├── ComplianceWorkflows.tsx      # CER/AFSL/AML-CTF validation
│   ├── PortfolioOptimizer.tsx       # AI optimization (18.5% return increase)
│   ├── TemplateManager.tsx          # Reusable scenario templates
│   └── types.ts                     # Comprehensive TypeScript definitions
└── analytics/          # Step 1.4: Enhanced Negotiation Analytics
    ├── AnalyticsEngine.ts           # Core analytics processing engine
    ├── AnalyticsDashboard.tsx       # Main analytics dashboard interface
    ├── RealTimeMetricsWidget.tsx    # Live metrics component
    ├── PerformanceChart.tsx         # Interactive performance charts
    ├── useAnalytics.ts              # React integration hook
    ├── types.ts                     # Analytics TypeScript definitions
    └── index.ts                     # Central exports and utilities

lib/
├── demo-mode/
│   ├── demo-state-manager.ts        # Zustand state management
│   └── esc-market-context.ts        # NSW ESC market data
├── types.ts                         # Core platform types
├── personas.ts                      # Buyer personas
├── negotiation-config.ts            # Trading parameters
└── defence.ts                       # Security layers
```

## Completed Capabilities

### Multi-Audience Interface System (Step 1.2)
- **Executive Dashboard**: High-level KPIs, ROI analysis (A$2.1M annual savings), portfolio overview
- **Technical Interface**: 47ms API response, 99.94% uptime, integration details
- **Compliance Panel**: 98% CER compliance score, automated audit trails

### Scenario Library & Templates (Step 1.3)
- **6 Predefined Scenarios**: 87-95% success rates, 5-30 minute durations
- **ESC Market Trading**: 5-step AI pipeline with 18.5% price improvement
- **Multi-Participant Trading**: 6 live market participants with real-time dynamics
- **Compliance Workflows**: CER certificate validation (6-step automated process)
- **Portfolio Optimization**: AI-powered optimization with A$45k annual savings
- **Template Management**: Reusable scenarios with version control

### Available Data Sources for Analytics
- **Trading Simulations**: Multi-participant data with negotiation metrics
- **Compliance Data**: Validation results, regulatory scores, audit trails
- **Portfolio Data**: Optimization results, risk metrics, ROI analysis
- **Market Data**: Real-time pricing, volatility, participant behavior

## Step 1.4 Requirements

### Enhanced Negotiation Analytics Scope
- **Real-time negotiation metrics** during trading scenarios
- **Performance benchmarking** against market standards
- **Market comparison analysis** and competitive positioning
- **Risk assessment dashboards** with portfolio analytics
- **Advanced data visualization** with interactive charts
- **Integration with existing audience interfaces** for analytics panels

### Technical Implementation Approach
1. **Analytics Engine**: Process data from existing scenarios
2. **Visualization Components**: Interactive charts and dashboards
3. **Audience Integration**: Add analytics panels to existing interfaces
4. **Real-time Updates**: Live metrics during scenario execution
5. **Export Capabilities**: Professional reporting for stakeholders

## Key Project Files to Reference

### Essential Context Files
- `CLAUDE.md` - Core project requirements and technical constraints
- `PROJECT_STATUS_UPDATE_MARCH_25.md` - Current status and completed work
- `STEP_1_3_IMPLEMENTATION_SUMMARY.md` - Latest completed implementation details

### Implementation Guides
- `DEMO_DEVELOPMENT_MASTER_PLAN.md` - Overall development strategy
- `DEMO_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation instructions
- `DEMO_REQUIREMENTS_SPECIFICATION.md` - Detailed requirements

### Architecture References
- `DEMO_ARCHITECTURE_SPECIFICATION.md` - System architecture overview
- `components/scenarios/types.ts` - Comprehensive type definitions
- `lib/demo-mode/demo-state-manager.ts` - State management implementation

## Testing Status
- **All Components**: 100% smoke test coverage
- **Step 1.1**: Integration tests passing
- **Step 1.2**: 7/7 component tests passing
- **Step 1.3**: 15/15 scenario tests passing
- **Step 1.4**: 51/51 analytics tests passing (2 test files: enhanced-analytics.test.tsx + analytics-engine-simple.test.js)

## Business Context

### Target Audiences
- **Executive**: ROI-focused, strategic decision makers (14-minute demos)
- **Technical**: Integration teams, system architects (16-minute demos)
- **Compliance**: Regulatory, risk management (18-minute demos)

### Value Propositions
- **Trading Execution**: 15-25% improved execution pricing through AI
- **Compliance Efficiency**: 40% reduction in compliance overhead
- **Risk Management**: T+0 atomic settlement with comprehensive audit trails
- **Market Intelligence**: Real-time pricing and participant behavior analysis

## Security & Constraints
- **API Key Security**: ANTHROPIC_API_KEY only in server-side API routes
- **Price Floor**: A$120/tonne minimum (hard constraint in code, not LLM)
- **Concession Limits**: Max 5% per round, 20% total (enforced in application)
- **No External Storage**: All state in React useState/useReducer (no localStorage)

## Stage 1 Complete - Ready for Stage 2

**Stage 1 is now COMPLETE** with all 4 components successfully delivered:
- ✅ NSW ESC market context integration with real-time AEMO pricing
- ✅ Multi-audience interface system with executive, technical, and compliance dashboards
- ✅ Comprehensive scenario library with 6 realistic trading scenarios
- ✅ Enhanced negotiation analytics with real-time performance metrics and professional reporting

**Platform now ready for Stage 2 development** featuring:
- Advanced AI capabilities and machine learning models
- Mobile-responsive executive experience
- Predictive analytics and market forecasting
- Integration with external data providers
- Advanced portfolio optimization algorithms