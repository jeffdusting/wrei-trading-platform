# PHASE 2: Migrate Stage 2 AI Components to Simplified Data

**Project**: Demo Mode Cleanup (DMC-2026-001)
**Phase**: 2 of 5
**Duration**: 4-6 hours
**Risk Level**: Medium (affects Stage 2 AI functionality)
**Prerequisites**: Phase 1 completed (simplified demo infrastructure exists)

---

## Context & Objective

**Problem**: Stage 2 AI components depend on complex demo data injection
**Phase 2 Goal**: Migrate Stage 2 components to use simplified demo data
**Success Criteria**: All Stage 2 AI functionality preserved with simplified data injection

---

## Stage 2 AI Components to Migrate

### Components Requiring Updates
1. **AI Demo Orchestration** (`components/orchestration/DemoOrchestrator.tsx`)
   - Current: Complex tour management with step tracking
   - Target: Simple scenario orchestration with basic data

2. **Intelligent Analytics** (`components/analytics/useAnalytics.ts`, `IntelligentAnalyticsDashboard.tsx`)
   - Current: Tour-aware analytics with presentation context
   - Target: Basic dummy metrics injection

3. **Audience Targeting** (`components/audience/ExecutiveDashboard.tsx`, `TechnicalInterface.tsx`, `CompliancePanel.tsx`)
   - Current: Presentation-mode awareness and tour integration
   - Target: Simple data injection based on demo mode state

4. **Scenario Generation** (`components/generation/ScenarioGenerator.tsx`)
   - Current: Complex market context from ESC-specific data
   - Target: Basic market scenario from simplified data sets

---

## Current Dependencies Analysis

### Complex Data Sources (to be replaced)
```typescript
// Current complex dependencies
import { useDemoMode } from '@/lib/demo-mode/demo-state-manager'  // 1,140 lines
import { getESCDemoData } from '@/lib/demo-mode/esc-market-context'  // 566 lines
import { DemoHighlight, DemoConditional } from '@/components/demo/DemoDataProvider'  // 322 lines

// Target simple dependencies
import { useSimpleDemoMode } from '@/lib/demo-mode/simple-demo-state'  // 50 lines
import { getSimpleDemoData } from '@/lib/demo-mode/demo-data-simple'  // 150 lines
```

### Data Structure Mapping
```typescript
// Current complex data structure
interface ComplexDemoData {
  tourStep: number;
  currentTour: string;
  presentationMode: string;
  escMarketContext: ESCMarketData;
  tourMetrics: TourMetrics;
  // ... 50+ more fields
}

// Target simple data structure
interface SimpleDemoData {
  isActive: boolean;
  selectedDataSet: 'institutional' | 'retail' | 'compliance';
  persona: BuyerPersona;
  marketData: MarketPricing;
  portfolioMetrics: BasicMetrics;
}
```

---

## Implementation Tasks

### Task 1: Migrate Orchestration Component
**Files**:
- `components/orchestration/DemoOrchestrator.tsx`
- `components/orchestration/useOrchestration.ts`

**Changes Required**:
```typescript
// Replace complex tour orchestration
- getCurrentTour(), nextStep(), skipStep()
- tour-aware state management
- presentation script integration

// With simple scenario orchestration
+ getActiveScenario(), setScenarioData()
+ basic demo mode detection
+ simple data injection
```

### Task 2: Migrate Analytics Components
**Files**:
- `components/analytics/useAnalytics.ts`
- `components/analytics/IntelligentAnalyticsDashboard.tsx`
- `components/analytics/useIntelligentAnalytics.ts`

**Changes Required**:
```typescript
// Replace tour-aware analytics
- tourStep-based metrics
- presentation context adaptation
- complex engagement tracking

// With simple dummy metrics
+ demo-mode-aware data injection
+ basic portfolio metrics from demo data
+ simplified market context
```

### Task 3: Migrate Audience Components
**Files**:
- `components/audience/ExecutiveDashboard.tsx`
- `components/audience/TechnicalInterface.tsx`
- `components/audience/CompliancePanel.tsx`
- `components/audience/AudienceSelector.tsx`

**Changes Required**:
```typescript
// Replace presentation-mode logic
- guided tour integration
- audience-specific tour paths
- tour overlay coordination

// With simple demo awareness
+ demo mode state detection
+ basic data injection per audience type
+ simplified content adaptation
```

### Task 4: Migrate Scenario Generation
**Files**:
- `components/generation/ScenarioGenerator.tsx`
- `lib/ai-scenario-generation/DynamicScenarioEngine.ts`

**Changes Required**:
```typescript
// Replace ESC-specific context
- NSW ESC market structure
- Northmore Gordon branding
- complex regulatory framework

// With basic scenario context
+ generic market scenarios
+ simplified regulatory context
+ basic industry parameters
```

---

## Migration Strategy

### Step-by-Step Process
1. **Update Import Statements**: Replace complex demo imports with simple equivalents
2. **Replace Hook Usage**: Swap `useDemoMode()` calls with `useSimpleDemoMode()`
3. **Update Data Access**: Replace tour/presentation data with simple demo data
4. **Remove Tour Logic**: Delete tour step tracking and presentation awareness
5. **Simplify Conditional Rendering**: Replace complex demo conditionals with simple `isActive` checks
6. **Test Component Functionality**: Verify AI capabilities preserved with simple data

### Data Access Pattern Changes
```typescript
// OLD: Complex demo data access
const { isActive, currentTour, tourStep, escContext } = useDemoMode()
const marketData = getESCDemoData().marketContext
if (currentTour === 'executive-overview' && tourStep > 3) { ... }

// NEW: Simple demo data access
const { isActive, demoData } = useSimpleDemoMode()
const marketData = demoData?.marketData
if (isActive) { ... }
```

---

## Verification Checklist

### Stage 2 AI Functionality
- [ ] **Orchestration**: Demo scenarios work without tour system
- [ ] **Analytics**: Intelligent analytics display dummy data correctly
- [ ] **Audience Targeting**: Executive/Technical/Compliance interfaces function
- [ ] **Scenario Generation**: AI scenarios generate with simplified market context

### Data Flow Validation
- [ ] Simple demo data reaches all Stage 2 components
- [ ] No references to complex tour state remain
- [ ] Components gracefully handle demo mode on/off transitions
- [ ] AI predictions and insights work with dummy data

### Integration Points
- [ ] Components integrate with simplified state manager
- [ ] No broken imports or missing dependencies
- [ ] TypeScript compilation passes for all components
- [ ] React component rendering works in demo and non-demo modes

---

## Risk Mitigation

### High-Risk Areas
1. **AI Engine Integration**: Orchestration and scenario generation depend heavily on demo data
2. **Analytics Calculations**: Intelligent analytics may expect specific data structures
3. **Audience Routing**: Multi-audience system may have presentation dependencies

### Mitigation Strategies
1. **Preserve Core AI Logic**: Only change data sources, not algorithms
2. **Maintain Data Contracts**: Ensure simple demo data provides all required fields
3. **Gradual Migration**: Update one component at a time with testing
4. **Rollback Plan**: Keep complex demo imports commented out until validated

---

## Testing Requirements

### Component Testing
- [ ] Each migrated component renders without errors
- [ ] Demo mode activation/deactivation works correctly
- [ ] AI functionality produces expected outputs with dummy data
- [ ] No console errors or warnings in browser dev tools

### Integration Testing
- [ ] Stage 2 components work together with simplified data
- [ ] Navigation between audience interfaces functions
- [ ] Analytics dashboard displays meaningful dummy metrics
- [ ] Scenario generation produces realistic outputs

---

## Success Criteria

### Functional Requirements
- [ ] All Stage 2 AI components function with simplified demo data
- [ ] No loss of AI capabilities or user experience
- [ ] Demo mode provides same value (trading simulation with AI insights)
- [ ] Components handle demo state changes gracefully

### Technical Metrics
- [ ] **Import Reduction**: Complex demo imports removed from Stage 2 components
- [ ] **Data Simplification**: Tour/presentation dependencies eliminated
- [ ] **Code Clarity**: Simplified conditional logic for demo state
- [ ] **Performance**: No regression in component rendering speed

---

## Emergency Rollback

If Stage 2 functionality breaks:
1. **Revert Import Changes**: Restore complex demo imports
2. **Restore Data Access**: Use complex demo data temporarily
3. **Keep Simple Infrastructure**: Don't delete Phase 1 work
4. **Investigate Issues**: Debug data contract mismatches
5. **Incremental Retry**: Migrate one component at a time

---

## Next Phase Prerequisites

After Phase 2 completion:
- [ ] Stage 2 AI components use simplified demo data
- [ ] No dependencies on complex tour system
- [ ] All AI functionality validated with dummy data
- [ ] Ready for core integration switch in Phase 3

---

**After completing this phase, mark Task #2 as completed and proceed to Phase 3 prompt.**