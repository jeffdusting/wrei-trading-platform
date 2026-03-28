# PHASE 5: Restore Test Coverage and Update Documentation

**Project**: Demo Mode Cleanup (DMC-2026-001)
**Phase**: 5 of 5
**Duration**: 3-5 hours
**Risk Level**: Medium (test updates affect quality assurance)
**Prerequisites**: Phase 1-4 completed (simplified demo system operational, complex infrastructure removed)

---

## CONTEXT FOR FRESH SESSIONS

### What Should Be Complete Before Starting Phase 5
1. **Phases 1-3**: Simplified demo system operational in application
2. **Phase 4**: Complex demo infrastructure removed (99% code reduction achieved)
3. **Current State**: Tests likely broken, documentation outdated

### Pre-Assessment Commands
```bash
# Check current test status
npm test

# Review what was deleted in Phase 4
git log --oneline -10

# Verify simplified system still works
npm run dev
```

### Task Management Context
```bash
# Verify Phase 4 completed
TaskList  # Should show Task #4 as completed

# Start Phase 5
TaskUpdate taskId="5" status="in_progress"

# When done
TaskUpdate taskId="5" status="completed"
```

### Expected Broken Components After Phase 4
Based on actual implementation, these files likely need test updates:
- Tests importing removed complex demo components
- Tests mocking complex `useDemoMode` hook (now should use `useSimpleDemoStore`)
- Integration tests expecting tour/presentation functionality

---

## Context & Objective

**Problem**: Test suite broken by demo infrastructure removal; documentation outdated
**Phase 5 Goal**: Restore 100% test coverage and update documentation suite
**Success Criteria**: All tests pass, documentation reflects simplified system

---

## Current Test Impact Analysis

### Tests Likely Broken by Phase 4 Removals
1. **Demo-specific tests**:
   - `__tests__/demo/demo-state-manager.test.ts`
   - `__tests__/demo/tour-overlay.test.tsx`
   - `__tests__/demo/demo-control-bar.test.tsx`

2. **Component tests importing complex demo**:
   - `__tests__/navigation/navigation-shell.test.tsx`
   - `__tests__/orchestration/demo-orchestrator.test.tsx`
   - `__tests__/analytics/enhanced-analytics.test.tsx`

3. **Integration tests using complex demo state**:
   - Tests mocking complex `useDemoMode` hook
   - Tests expecting tour/presentation functionality

### Baseline Success Rate
- **Target**: 100% test success rate (79/79 suites, 1,926/1,926 tests)
- **Previous Achievement**: 100% success maintained through Phase 1-3
- **Expected Impact**: 8-15 test files need updates

---

## Implementation Tasks

### Task 1: Update Demo-Specific Tests
**Files to Update**:
- `__tests__/demo/demo-state-manager.test.ts`
- Any tour overlay or control bar tests (may be deleted)

**Strategy**:
```typescript
// Replace complex demo state tests
describe('Complex Demo State Manager', () => {
  test('manages tour state', ...) // DELETE
  test('tracks presentation mode', ...) // DELETE
  test('handles ESC market context', ...) // DELETE
})

// With simple demo state tests
describe('Simple Demo State Manager', () => {
  test('activates demo mode', ...) // CREATE
  test('provides demo data', ...) // CREATE
  test('deactivates cleanly', ...) // CREATE
})
```

### Task 2: Update Component Tests with Demo Dependencies
**Files to Update**:
- Navigation shell tests
- Orchestration tests
- Analytics tests
- Audience component tests

**Mock Update Strategy**:
```typescript
// Replace complex demo mocks
jest.mock('@/lib/demo-mode/demo-state-manager', () => ({
  useDemoMode: () => ({
    isActive: false,
    currentTour: null,
    tourStep: 0,
    presentationMode: 'self-service',
    // ... 20+ mock properties
  })
}))

// With simple demo mocks
jest.mock('@/lib/demo-mode/simple-demo-state', () => ({
  useSimpleDemoMode: () => ({
    isActive: false,
    demoData: null,
    activateDemo: jest.fn(),
    deactivateDemo: jest.fn(),
  })
}))
```

### Task 3: Update Documentation Suite
**Files to Update**:

1. **Functional Architecture** (`docs/03-SYSTEM-FUNCTIONAL-ARCHITECTURE.md` → v2.1)
   - Remove tour overlay components from component catalog
   - Remove presentation system architecture
   - Add simplified demo components
   - Update data flow diagrams

2. **API Reference** (`docs/05-API-REFERENCE.md` → v2.1)
   - Remove presentation API endpoints
   - Simplify demo-related examples
   - Update integration patterns

3. **README** (`README.md`)
   - Correct demo mode description
   - Remove tour/presentation references
   - Update feature list to reflect simplified system

### Task 4: Create Project Completion Report
**File**: `docs/PROJECT_DEMO_MODE_CLEANUP_COMPLETION.md`
**Content**: Comprehensive metrics and lessons learned

---

## Testing Strategy

### Test Update Priority
1. **Critical Path**: Tests blocking application startup
2. **Core Functionality**: Tests validating demo mode works
3. **Stage 2 Integration**: Tests ensuring AI components function
4. **Documentation**: Tests validating examples and API docs

### Mock Update Patterns
**Standard Mock Replacement**:
```typescript
// OLD: Complex mock with tour state
const mockUseDemoMode = {
  isActive: true,
  currentTour: 'executive-overview',
  tourStep: 3,
  presentationMode: 'investor-briefing',
  getESCDemoData: jest.fn(),
  startTour: jest.fn(),
  nextStep: jest.fn(),
}

// NEW: Simple mock with basic state
const mockUseSimpleDemoMode = {
  isActive: true,
  demoData: {
    persona: mockPersona,
    marketData: mockMarketData,
    portfolioMetrics: mockMetrics,
  },
  activateDemo: jest.fn(),
  deactivateDemo: jest.fn(),
}
```

### Component Test Updates
**Component Testing Pattern**:
```typescript
// OLD: Tour-aware component tests
test('shows tour overlay when active', () => {
  render(<Component />, { wrapper: DemoDataProvider })
  expect(screen.getByTestId('tour-overlay')).toBeInTheDocument()
})

// NEW: Simple demo-aware tests
test('shows demo data when active', () => {
  render(<Component />, { wrapper: SimpleDemoProvider })
  expect(screen.getByText('Demo Data')).toBeInTheDocument()
})
```

---

## Documentation Updates

### Functional Architecture Updates (v2.1)

**Component Catalog Changes**:
```markdown
### Demo Components (`components/demo/`)
| Component | Purpose |
|-----------|---------|
| SimpleDemoToggle | Basic demo mode activation toggle |
| SimpleDemoProvider | Simple demo data injection context |

~~### Removed Components~~
~~| TourOverlay | Complex tour system with element highlighting |~~
~~| DemoControlBar | Tour navigation and progress controls |~~
~~| Presentation components | Investor briefing and script system |~~
```

**API Routes Changes**:
```markdown
### API Routes
| Endpoint | File | Methods | Purpose |
|----------|------|---------|---------|
| `/api/negotiate` | `app/api/negotiate/route.ts` | POST | Claude API negotiation engine |
| `/api/analytics` | `app/api/analytics/route.ts` | POST | Financial calculation engine |
~~| `/api/presentation/adapt` | `app/api/presentation/adapt/route.ts` | POST | Adaptive presentation layer |~~

~~### Removed API Routes~~
~~| `/api/presentation/*` | Presentation adaptation endpoints |~~
```

### README Updates

**Demo Mode Description**:
```markdown
## Demo Mode

**Simple Trading Simulation**: Toggle demo mode to practice trading with realistic dummy data.

~~## Features~~
~~- **AI-Powered Tours**: Guided walkthroughs with contextual overlays~~
~~- **Presentation Mode**: Investor briefing with scripted presentations~~
~~- **Multi-Audience Tours**: Executive, Technical, and Compliance experiences~~

**How It Works**:
1. Click "Demo Mode" in navigation
2. Select data scenario (Institutional, Retail, Compliance)
3. Trade with realistic dummy data
4. AI insights work with simulated market conditions
```

### Project Completion Report Structure

**File**: `docs/PROJECT_DEMO_MODE_CLEANUP_COMPLETION.md`
```markdown
# Demo Mode Cleanup Project - Completion Report

## Executive Summary
- **Objective Achieved**: 99% code reduction (25,800 → 400 lines)
- **Functionality Preserved**: Demo mode provides trading simulation
- **Quality Maintained**: 100% test coverage restored

## Metrics
### Before Cleanup
- Files: 27 demo-related files
- Lines: 25,800 lines of demo infrastructure
- Complexity: 10+ tour types, presentation scripts, client branding

### After Cleanup
- Files: 3 demo-related files
- Lines: 400 lines of simple demo system
- Complexity: Simple toggle with data injection

## Lessons Learned
1. **Scope Creep Prevention**: Regular requirement review needed
2. **Feature Simplicity**: Start with minimal viable solution
3. **Documentation Importance**: Clear requirements prevent expansion
4. **Testing Value**: 100% coverage enabled confident refactoring

## Success Factors
1. **Phased Approach**: Minimized risk through parallel development
2. **Progressive Validation**: Testing at each phase boundary
3. **Atomic Commits**: Easy rollback when issues arose
4. **Clear Documentation**: Self-contained phase prompts enabled execution
```

---

## Verification Checklist

### Test Coverage Restoration
- [ ] **Full Test Suite**: All tests pass (100% success rate)
- [ ] **Demo Tests**: Updated for simplified system
- [ ] **Component Tests**: Mocks updated for simple demo state
- [ ] **Integration Tests**: End-to-end functionality validated

### Documentation Accuracy
- [ ] **Functional Architecture**: Components and APIs reflect current state
- [ ] **API Reference**: No references to removed endpoints
- [ ] **README**: Demo mode described accurately
- [ ] **Completion Report**: Comprehensive metrics and analysis

### Quality Assurance
- [ ] **TypeScript**: Compilation passes without errors
- [ ] **ESLint**: Code quality standards maintained
- [ ] **Performance**: No regression in application speed
- [ ] **Browser Testing**: Manual validation in multiple browsers

---

## Testing Protocol

### Automated Testing
```bash
# Run full test suite
npm test

# Check specific test types
npm run test:unit         # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # End-to-end tests (if available)

# Verify coverage
npm run test:coverage
```

### Manual Testing Checklist
- [ ] **Application Startup**: No console errors on load
- [ ] **Demo Toggle**: Activate/deactivate demo mode successfully
- [ ] **Data Injection**: Trading interface receives dummy data in demo mode
- [ ] **Stage 2 AI**: All AI components function with demo data
- [ ] **Navigation**: All routes work in demo and normal modes
- [ ] **Responsive Design**: Demo mode works on mobile devices

### Cross-Browser Validation
- [ ] **Chrome**: Demo mode functions correctly
- [ ] **Firefox**: No browser-specific issues
- [ ] **Safari**: Mobile responsive design works
- [ ] **Edge**: Enterprise compatibility maintained

---

## Success Criteria

### Project Completion Metrics
- [ ] **Code Reduction**: 99% achieved (25,800 → 400 lines)
- [ ] **Test Coverage**: 100% success rate restored
- [ ] **Documentation**: All docs updated to reflect simplified system
- [ ] **Functionality**: Demo mode provides same trading simulation value

### Quality Metrics
- [ ] **Performance**: No regression in page load times
- [ ] **Maintainability**: Simplified codebase easier to understand
- [ ] **User Experience**: Demo mode intuitive and valuable
- [ ] **Integration**: Stage 2 AI components work seamlessly

### Completion Validation
- [ ] **All 5 phases completed successfully**
- [ ] **All 6 tasks marked as completed**
- [ ] **Project documentation complete**
- [ ] **Platform ready for production use**

---

## Final Deliverables

### Code Deliverables
1. **Simplified Demo System**: 3 files, ~400 lines total
2. **Updated Application**: Uses simple demo throughout
3. **Clean Codebase**: 25,400 lines of complexity removed
4. **100% Test Coverage**: All tests passing

### Documentation Deliverables
1. **Updated Architecture Docs**: v2.1 with simplified demo system
2. **Updated API Reference**: v2.1 with removed endpoints documented
3. **Updated README**: Accurate demo mode description
4. **Project Completion Report**: Comprehensive analysis and metrics
5. **Phase Prompts**: Self-contained implementation guides

---

## Project Closure

After Phase 5 completion:
- [ ] Mark all tasks as completed
- [ ] Commit final documentation updates
- [ ] Deploy updated documentation to Vercel
- [ ] Archive project plans in `/docs/archive/`
- [ ] Update CHANGELOG.md with demo mode simplification

---

**Congratulations! Demo Mode Cleanup Project Complete.**
**Original requirement restored: "User selects demo mode, completes trades on dummy data"**