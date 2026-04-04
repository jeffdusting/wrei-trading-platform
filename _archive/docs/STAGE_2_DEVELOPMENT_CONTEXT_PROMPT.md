# WREI Trading Platform - Stage 2 Development Context Prompt

**Use this prompt after clearing context to begin Stage 2 development with complete project understanding**

---

## Project Context Overview

You are working on the **WREI Trading Platform**, a Next.js 14 demo application that demonstrates Water Roads' carbon credit trading platform with AI negotiation capabilities. This is specifically focused on the **NSW Energy Savings Certificate (ESC) market** with **Northmore Gordon Pty Ltd** firm branding (AFSL 246896).

### Current Development Status: Stage 1 COMPLETE - Stage 2 Ready

**STAGE 1 COMPLETED (All 4 components delivered successfully):**
- ✅ **Step 1.1**: NSW ESC Context Integration (4 hours) - Market context, demo state management
- ✅ **Step 1.2**: Multi-Audience Interface System (8 hours) - Executive, Technical, Compliance dashboards
- ✅ **Step 1.3**: Scenario Library & Templates (6 hours) - Comprehensive scenario management with 6 scenarios
- ✅ **Step 1.4**: Enhanced Negotiation Analytics (6 hours) - Real-time analytics and performance dashboards

**NEXT PHASE:**
- 🚀 **Stage 2**: Advanced Platform Capabilities - AI enhancements, mobile experience, predictive analytics, external integrations

## Technology Stack (Current)

- **Framework**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **AI Engine**: Anthropic Claude API (@anthropic-ai/sdk) - Sonnet 4 for dev, Opus 4.6 for production
- **State Management**: React useState/useReducer + Zustand for demo mode
- **UI Icons**: @heroicons/react
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel free hobby plan (upgrade to Pro recommended for Stage 2)

## Current Architecture (Stage 1 Complete)

```
components/
├── audience/           # Multi-audience interfaces (Step 1.2)
│   ├── AudienceSelector.tsx
│   ├── ExecutiveDashboard.tsx       # Enhanced with Step 1.4 analytics integration
│   ├── TechnicalInterface.tsx       # Ready for Stage 2 enhancements
│   ├── CompliancePanel.tsx          # Ready for Stage 2 enhancements
│   └── MultiAudienceRouter.tsx
├── scenarios/          # Scenario management system (Step 1.3)
│   ├── ScenarioLibrary.tsx          # Central scenario hub
│   ├── ESCMarketScenarios.tsx       # NSW ESC trading (18.5% price improvement)
│   ├── TradingSimulationEngine.tsx  # Live multi-participant trading
│   ├── ComplianceWorkflows.tsx      # CER/AFSL/AML-CTF validation
│   ├── PortfolioOptimizer.tsx       # AI optimization (18.5% return increase)
│   ├── TemplateManager.tsx          # Reusable scenario templates
│   └── types.ts                     # Comprehensive TypeScript definitions
└── analytics/          # Enhanced negotiation analytics (Step 1.4)
    ├── AnalyticsEngine.ts           # Core analytics processing engine
    ├── AnalyticsDashboard.tsx       # Main analytics dashboard interface
    ├── RealTimeMetricsWidget.tsx    # Live metrics component
    ├── PerformanceChart.tsx         # Interactive performance charts
    ├── useAnalytics.ts              # React integration hook
    ├── types.ts                     # Analytics TypeScript definitions
    └── index.ts                     # Central exports and utilities

lib/
├── demo-mode/          # Core demo infrastructure (Step 1.1)
│   ├── demo-state-manager.ts        # Zustand state management
│   └── esc-market-context.ts        # NSW ESC market data and context
├── types.ts                         # Core platform types
├── personas.ts                      # Buyer personas
├── negotiation-config.ts            # Trading parameters and ESC config
└── defence.ts                       # Security layers

__tests__/
├── audience/           # Multi-audience testing
├── scenarios/          # Scenario library testing
└── analytics/          # Analytics testing (51/51 tests passing)
    ├── enhanced-analytics.test.tsx
    └── analytics-engine-simple.test.js
```

## Stage 1 Achievement Summary

### Performance Metrics Delivered
- **18.5% price improvement** vs 12% market average (54% better performance)
- **98% CER compliance score** vs 92% market average (7% better)
- **98% T+0 settlement success** vs 85% market average (15% better)
- **A$95 cost per transaction** vs A$125 market average (24% more efficient)
- **18/100 overall risk score** vs 30/100 typical institutional score (40% lower risk)

### Business Value Delivered
- **Executive Dashboard**: Strategic KPIs with advanced analytics, market positioning (#3 of 850 participants)
- **Technical Interface**: System performance monitoring (47ms API response, 99.94% uptime)
- **Compliance Panel**: Regulatory oversight (98% CER compliance, comprehensive audit trails)
- **Real-time Analytics**: Live metrics during scenario execution with professional export capabilities
- **Market Intelligence**: Competitive analysis with NSW ESC market integration (A$200M+ market, AEMO pricing)

## Stage 2 Development Plan (FOLLOW STRICTLY)

### Mandatory Reference Documents
**CRITICAL: You MUST read these documents before beginning Stage 2 development:**

1. **`DEMO_DEVELOPMENT_MASTER_PLAN.md`** - Stage 2 overview, components, and success criteria
2. **`DEMO_ARCHITECTURE_SPECIFICATION.md`** - Technical architecture for Stage 2
3. **`DEMO_IMPLEMENTATION_GUIDE.md`** - Step-by-step implementation instructions
4. **`DEMO_REQUIREMENTS_SPECIFICATION.md`** - Detailed Stage 2 requirements
5. **`DEMO_TECHNICAL_SPECIFICATIONS.md`** - Technical specifications and constraints
6. **`CLAUDE.md`** - Core project requirements and design rules (NEVER VIOLATE)

### Stage 2 Components (From Master Plan)

**Duration**: 60-73 hours total
**Objective**: Advanced AI-powered demo orchestration with dynamic scenario generation

#### Component 1: AI Demo Orchestration Engine (15-18 hours)
- Advanced AI-powered demo flow orchestration
- Dynamic scenario selection based on audience behavior
- Intelligent transition management between demo phases
- Real-time adaptation to stakeholder engagement levels

#### Component 2: Dynamic Scenario Generation (18-22 hours)
- AI-generated scenarios based on real market data
- Adaptive scenario parameters based on audience type
- Dynamic narrative generation for scenario context
- Real-time market data integration (Bloomberg, Refinitiv APIs)

#### Component 3: Intelligent Analytics Dashboard (12-15 hours)
- Advanced predictive analytics with ML models
- Dynamic visualization generation based on data patterns
- Intelligent insight generation and recommendations
- Advanced export capabilities with automated report generation

#### Component 4: Adaptive Presentation Layer (10-12 hours)
- Dynamic UI adaptation based on audience preferences
- Mobile-responsive executive experience
- Intelligent content personalization
- Advanced interaction tracking and behavior analysis

#### Component 5: Integration & Advanced Testing (5-6 hours)
- Comprehensive integration testing with Stage 1 components
- Performance optimization for advanced features
- Advanced monitoring and error handling
- Production deployment preparation

## Critical Development Constraints (NON-NEGOTIABLE)

### Security & API Key Management
1. **ANTHROPIC_API_KEY must ONLY be used in server-side API routes** - never exposed to client
2. **All external API keys** (Bloomberg, Refinitiv) must be server-side only
3. **Defence layers are mandatory** - input sanitisation, output validation, constraint enforcement
4. **Price floors and concession limits** must be enforced in application code, NOT delegated to LLMs

### State Management Rules
- **Primary**: React useState/useReducer for component state
- **Demo Mode**: Zustand for demo-specific state management
- **NO localStorage or sessionStorage** - all state must be in-memory
- **External data caching** must be server-side with appropriate TTL

### Design & UX Standards
- **Australian spelling** throughout all user-facing text
- **Consistent color scheme** as defined in CLAUDE.md
- **Mobile-first responsive design** for new Stage 2 components
- **Accessibility standards** - WCAG 2.1 AA compliance
- **Performance targets** - <3s initial load, <500ms interaction response

## NSW ESC Market Context (MAINTAIN CONSISTENCY)

### Market Parameters (DO NOT CHANGE)
- **Current ESC Spot Price**: A$47.80/tonne (AEMO live data)
- **Market Size**: A$200M+ annual trading volume
- **Total Participants**: 850+ active traders and institutions
- **Northmore Gordon Position**: #3 market position, 12% market share, AFSL 246896
- **Compliance Framework**: CER regulations, AFSL obligations, AML/CTF requirements

### Performance Benchmarks (MAINTAIN OR IMPROVE)
- **Price Improvement**: 18.5% (vs 12% market average) - DO NOT REDUCE
- **CER Compliance**: 98% score (vs 92% market average) - MAINTAIN OR IMPROVE
- **Settlement Success**: 98% T+0 success rate (vs 85% market average)
- **Cost Efficiency**: A$95 per transaction (vs A$125 market average)

## Testing Requirements (MANDATORY)

### Test Coverage Standards
- **Unit Tests**: 90%+ coverage for all new components
- **Integration Tests**: Full integration with existing Stage 1 components
- **Performance Tests**: Load testing for AI orchestration engine
- **Security Tests**: API key exposure prevention, input validation
- **Accessibility Tests**: WCAG 2.1 AA compliance validation

### Testing Methodology
- **Test-Driven Development**: Write tests before implementation
- **Component Testing**: React Testing Library for UI components
- **API Testing**: Mock external APIs (Bloomberg, Refinitiv) for development
- **End-to-End Testing**: Full demo flow validation across all audience types
- **Performance Monitoring**: Real-time performance metrics during development

## Stage 2 Development Methodology

### Implementation Approach
1. **Read ALL documentation** - Master Plan, Architecture, Implementation Guide, Requirements
2. **Follow step-by-step process** - DO NOT deviate from documented implementation sequence
3. **Maintain Stage 1 functionality** - All existing features must continue working
4. **Incremental development** - Build and test each component before proceeding
5. **Regular integration testing** - Ensure new components integrate seamlessly

### Quality Gates (MANDATORY CHECKPOINTS)
- **Architecture Review**: Before starting each component
- **Code Review**: After implementing core functionality
- **Integration Testing**: After connecting to existing systems
- **Performance Validation**: After completing each component
- **Security Audit**: Before deployment preparation

### Documentation Standards
- **Implementation Summary**: Document each component upon completion
- **Architecture Diagrams**: Update diagrams to reflect new components
- **API Documentation**: Document all external integrations
- **Testing Reports**: Comprehensive test results and coverage reports
- **Performance Metrics**: Document performance improvements and benchmarks

## External Integration Requirements

### Bloomberg/Refinitiv API Integration
- **Server-side only**: API keys and calls must never reach client
- **Caching strategy**: Implement appropriate TTL for market data
- **Fallback handling**: Graceful degradation when external APIs unavailable
- **Cost management**: Implement usage monitoring and rate limiting
- **Data validation**: Validate all external data before processing

### Mobile Experience Requirements
- **Responsive Design**: Mobile-first approach for all new components
- **Touch Optimization**: Finger-friendly interface elements
- **Performance**: <2s load time on mobile networks
- **Offline Support**: Basic functionality when network unavailable
- **Progressive Web App**: Consider PWA implementation for executive mobile access

## Success Criteria for Stage 2 Completion

### Technical Requirements
- [ ] AI Demo Orchestration Engine functional with dynamic scenario selection
- [ ] Dynamic Scenario Generation with real market data integration
- [ ] Intelligent Analytics Dashboard with predictive capabilities
- [ ] Mobile-responsive Adaptive Presentation Layer
- [ ] 95%+ test coverage across all new components
- [ ] <3s initial load time, <500ms interaction response times
- [ ] Full integration with existing Stage 1 components
- [ ] Production-ready deployment configuration

### Business Requirements
- [ ] Enhanced stakeholder engagement through intelligent adaptation
- [ ] Improved demo effectiveness with dynamic content generation
- [ ] Advanced analytics providing actionable business insights
- [ ] Mobile executive experience for on-the-go demonstrations
- [ ] Integration with real market data for authentic demonstrations
- [ ] Professional-grade scalability and performance

### Integration Requirements
- [ ] Seamless operation with existing NSW ESC context
- [ ] Continued functionality of all Stage 1 audience interfaces
- [ ] Enhanced analytics building on Stage 1 foundation
- [ ] Preserved scenario library with dynamic enhancements
- [ ] Maintained Northmore Gordon branding and compliance context

## File Structure Preparation

### New Directories to Create
```
components/
├── orchestration/      # AI Demo Orchestration Engine
├── generation/         # Dynamic Scenario Generation
├── intelligence/       # Intelligent Analytics Dashboard
├── adaptation/         # Adaptive Presentation Layer
└── mobile/            # Mobile-specific components

lib/
├── ai-orchestration/   # AI orchestration utilities
├── external-apis/      # Bloomberg/Refinitiv integration
├── ml-models/          # Machine learning models
└── mobile-utils/       # Mobile-specific utilities

__tests__/
├── orchestration/      # AI orchestration testing
├── generation/         # Scenario generation testing
├── intelligence/       # Intelligence dashboard testing
├── adaptation/         # Adaptation layer testing
└── integration/        # Stage 1+2 integration testing
```

## Ready to Begin Stage 2

**You are now ready to begin Stage 2 development.** The foundation is complete with:
- ✅ All Stage 1 components delivered and tested (51/51 tests passing)
- ✅ Comprehensive analytics engine ready for AI enhancement
- ✅ Multi-audience interfaces ready for mobile and adaptive features
- ✅ Scenario library ready for dynamic generation capabilities
- ✅ NSW ESC market context consistently integrated across all components
- ✅ Professional-grade performance benchmarks established

## CRITICAL FIRST STEPS

1. **Read the Master Plan**: `DEMO_DEVELOPMENT_MASTER_PLAN.md` - Understand Stage 2 scope completely
2. **Review Architecture**: `DEMO_ARCHITECTURE_SPECIFICATION.md` - Understand technical requirements
3. **Study Implementation Guide**: `DEMO_IMPLEMENTATION_GUIDE.md` - Follow step-by-step process
4. **Verify Current State**: Run existing tests to ensure Stage 1 functionality is intact
5. **Plan Component 1**: Begin with AI Demo Orchestration Engine as specified in Master Plan

**DO NOT DEVIATE** from the documented plan and methodology. Stage 2 success depends on strict adherence to the established architecture and implementation approach.

---

**Stage 1 Status**: ✅ **COMPLETED SUCCESSFULLY**
**Stage 2 Status**: 🚀 **READY TO BEGIN**
**Development Approach**: 📋 **FOLLOW DOCUMENTED PLAN STRICTLY**

---

*Context prepared for Stage 2 development on March 26, 2026*
*WREI Trading Platform - Delivering institutional-grade carbon credit trading with AI-powered negotiation capabilities*