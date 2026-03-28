# PHASE 3: Switch Core Integration to Simplified Demo

**Project**: Demo Mode Cleanup (DMC-2026-001)
**Phase**: 3 of 5
**Duration**: 2-3 hours
**Risk Level**: Medium (affects entire application)
**Prerequisites**: Phase 1 & 2 completed (simplified system built, Stage 2 migrated)

---

## Context & Objective

**Problem**: Application still uses complex demo system in core integration points
**Phase 3 Goal**: Switch application to use simplified demo infrastructure
**Success Criteria**: Clean transition with zero regression in core functionality

---

## Integration Points to Update

### Critical Files
1. **Application Layout** (`app/layout.tsx`)
   - Current: Complex `DemoDataProvider` wrapper
   - Target: Simple `SimpleDemoProvider` wrapper

2. **Navigation Shell** (`components/navigation/NavigationShell.tsx`)
   - Current: Complex `DemoModeToggle` with tour controls
   - Target: Simple toggle with basic demo indicator

3. **Demo Provider Dependencies**
   - Current: Complex context with tour state, metrics, overlays
   - Target: Simple context with just demo data injection

---

## Current Integration Analysis

### Layout Integration (`app/layout.tsx`)
```typescript
// Current complex integration (to be replaced)
import { DemoDataProvider } from '@/components/demo/DemoDataProvider'  // 322 lines
import { useDemoMode } from '@/lib/demo-mode/demo-state-manager'        // 1,140 lines

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DemoDataProvider>  {/* Complex tour/presentation context */}
          <NavigationShell>{children}</NavigationShell>
        </DemoDataProvider>
      </body>
    </html>
  )
}
```

### Navigation Integration (`components/navigation/NavigationShell.tsx`)
```typescript
// Current complex integration (lines 84, 136, 151-153)
import DemoModeToggle, { DemoPresentationStatus, DemoDataIndicator } from '../demo/DemoModeToggle'
import DemoControlBar from '../demo/DemoControlBar'
import TourOverlay from '../demo/TourOverlay'

// Multiple demo UI components scattered through navigation
<DemoModeToggle compact />              // Line 84
{isDemoActive && <DemoControlBar />}    // Line 136
<TourOverlay />                         // Line 151
<DemoPresentationStatus />              // Line 152
<DemoDataIndicator />                   // Line 153
```

---

## Implementation Tasks

### Task 1: Create Simple Demo Provider
**File**: `components/demo/SimpleDemoProvider.tsx`
**Size**: ~60 lines
**Purpose**: Replace 322-line complex provider with minimal data injection

```typescript
// Implementation structure:
interface SimpleDemoContextType {
  isActive: boolean;
  demoData: DemoDataSet | null;
  activateDemo: (dataSet: string) => void;
  deactivateDemo: () => void;
}

// Simple React context provider
// - Wraps children with demo state
// - Provides demo data to consuming components
// - No tour logic, metrics, or overlays
```

### Task 2: Update Application Layout
**File**: `app/layout.tsx`
**Changes**: Replace complex demo provider with simple version

```typescript
// NEW: Simple integration
import { SimpleDemoProvider } from '@/components/demo/SimpleDemoProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SimpleDemoProvider>  {/* Simple demo data only */}
          <NavigationShell>{children}</NavigationShell>
        </SimpleDemoProvider>
      </body>
    </html>
  )
}
```

### Task 3: Update Navigation Shell
**File**: `components/navigation/NavigationShell.tsx`
**Changes**: Replace complex demo UI with simple toggle

```typescript
// Remove complex imports
- import DemoModeToggle, { DemoPresentationStatus, DemoDataIndicator }
- import DemoControlBar from '../demo/DemoControlBar'
- import TourOverlay from '../demo/TourOverlay'

// Add simple import
+ import { SimpleDemoToggle } from '../demo/SimpleDemoToggle'

// Replace complex UI elements
- <DemoModeToggle compact />
- {isDemoActive && <DemoControlBar />}
- <TourOverlay />
- <DemoPresentationStatus />
- <DemoDataIndicator />

// With simple toggle
+ <SimpleDemoToggle />
```

### Task 4: Update Demo State Usage
**Throughout codebase**: Replace complex demo state access with simple version

```typescript
// Replace complex state access
- const { isActive, currentTour, tourStep, presentationMode } = useDemoMode()

// With simple state access
+ const { isActive, demoData } = useSimpleDemoMode()
```

---

## Risk Assessment & Mitigation

### High-Risk Changes
1. **Layout Provider Switch**: Affects entire application tree
2. **Navigation Updates**: Changes visible UI elements
3. **State Management**: Core demo state access pattern changes

### Mitigation Strategies
1. **Atomic Commits**: One file change per commit for easy rollback
2. **Incremental Testing**: Test each change immediately
3. **Preserve Imports**: Comment out old imports before adding new ones
4. **Validate Rendering**: Ensure UI renders correctly after each change

---

## Step-by-Step Implementation

### Step 1: Create Simple Provider (Low Risk)
- Create `SimpleDemoProvider.tsx` alongside existing provider
- Implement minimal context for demo data injection
- Export simple hooks for state access

### Step 2: Test Provider in Isolation (Low Risk)
- Create test component using simple provider
- Verify state management works correctly
- Validate data injection functionality

### Step 3: Update Layout Integration (High Risk)
- **Backup**: Commit current working state
- Replace complex provider with simple provider in layout
- Test application starts and renders correctly
- **Rollback Plan**: Revert layout changes if issues arise

### Step 4: Update Navigation Shell (High Risk)
- **Backup**: Commit working layout changes
- Remove complex demo UI components from navigation
- Add simple toggle component
- Test navigation renders and demo toggle works
- **Rollback Plan**: Revert navigation changes if UI broken

### Step 5: Update State Access Patterns (Medium Risk)
- Find all `useDemoMode()` calls outside Stage 2 components
- Replace with `useSimpleDemoMode()` calls
- Update conditional logic to use simple state structure
- Test affected components render correctly

---

## Verification Checklist

### Core Functionality
- [ ] Application starts without errors
- [ ] Navigation renders correctly
- [ ] Demo toggle activates/deactivates demo mode
- [ ] Core trading interface works in both demo and normal modes

### Demo Functionality
- [ ] Demo mode provides dummy data for trading simulation
- [ ] Stage 2 AI components receive demo data correctly
- [ ] Switching demo mode on/off works smoothly
- [ ] No complex tour UI elements remain visible

### Integration Validation
- [ ] Simple demo provider wraps application correctly
- [ ] Navigation uses simple demo toggle
- [ ] All demo state access uses simple hooks
- [ ] No references to complex demo system remain in core files

---

## Testing Requirements

### Manual Testing
1. **Application Startup**: Verify app starts without console errors
2. **Demo Toggle**: Click demo toggle and verify activation/deactivation
3. **Data Injection**: Confirm trading interface receives dummy data in demo mode
4. **Navigation**: Test all navigation links work in demo and normal modes
5. **Stage 2 Components**: Verify AI components still function correctly

### Automated Testing
- [ ] Run full test suite: `npm test`
- [ ] Verify 100% test success rate maintained
- [ ] Check for TypeScript compilation errors
- [ ] Validate ESLint passes on modified files

---

## Success Criteria

### Functional Requirements
- [ ] Demo mode provides same user value (trading simulation)
- [ ] Core application functionality unaffected
- [ ] Simple demo toggle works intuitively
- [ ] Stage 2 AI components integrate seamlessly

### Technical Metrics
- [ ] **Provider Simplification**: 322 lines → 60 lines (81% reduction)
- [ ] **Navigation Cleanup**: Complex demo UI removed
- [ ] **State Access**: Simple demo state used throughout application
- [ ] **Zero Regressions**: All existing functionality preserved

---

## Emergency Rollback Procedure

If core application breaks:

1. **Immediate Rollback**:
   ```bash
   git checkout HEAD~1 app/layout.tsx
   git checkout HEAD~1 components/navigation/NavigationShell.tsx
   ```

2. **Restore Complex Provider**:
   - Uncomment complex demo imports
   - Restore complex provider in layout
   - Restore complex demo UI in navigation

3. **Diagnose Issues**:
   - Check browser console for errors
   - Verify data contract mismatches
   - Test simple provider in isolation

4. **Incremental Retry**:
   - Fix identified issues
   - Re-attempt integration one file at a time

---

## Next Phase Prerequisites

After Phase 3 completion:
- [ ] Application uses simplified demo system
- [ ] No dependencies on complex demo infrastructure
- [ ] Core integration points updated
- [ ] Ready for removal of complex system in Phase 4

---

**After completing this phase, mark Task #3 as completed and proceed to Phase 4 prompt.**