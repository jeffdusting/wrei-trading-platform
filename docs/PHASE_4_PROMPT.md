# PHASE 4: Remove Complex Demo Infrastructure

**Project**: Demo Mode Cleanup (DMC-2026-001)
**Phase**: 4 of 5
**Duration**: 3-4 hours
**Risk Level**: High (systematic file deletion)
**Prerequisites**: Phase 1-3 completed (application uses simplified demo system)

---

## CONTEXT FOR FRESH SESSIONS

### What Should Be Complete Before Starting Phase 4
1. **Phase 1**: Simplified infrastructure built and working
2. **Phase 2**: All Stage 2 AI components migrated to use `useSimpleDemoStore`
3. **Phase 3**: Core application (layout.tsx, NavigationShell.tsx) switched to simplified system

### Critical Pre-Flight Check
Before removing any files, verify the application works with simplified demo system:
```bash
# Verify application runs without errors
npm run dev

# Check for any remaining complex demo imports
grep -r "useDemoMode\|DemoDataProvider\|getESCDemoData" app/ components/
# Should return minimal/no results if Phase 3 completed properly
```

### Task Management Context
```bash
# Verify Phase 3 completed
TaskList  # Should show Task #3 as completed

# Mark Phase 4 in progress
TaskUpdate taskId="4" status="in_progress"
```

### Emergency Rollback Plan
Keep git commit ready before starting deletions:
```bash
git add .
git commit -m "🚨 CHECKPOINT: Before Phase 4 deletions - simplified system active"
```

---

## Context & Objective

**Problem**: 25,400+ lines of complex demo infrastructure still exist
**Phase 4 Goal**: Systematically remove tour/presentation system
**Success Criteria**: 99% code reduction achieved, no broken references

---

## Files to Remove (Priority Order)

### Tier 1: Tour Overlay System (1,400+ lines)
**Risk**: Medium - UI components with potential import dependencies

1. `components/demo/TourOverlay.tsx` (500 lines)
   - Complex positioning logic and element highlighting
   - CSS animations and backdrop management
   - Mobile responsive tour controls

2. `components/demo/DemoControlBar.tsx` (205 lines)
   - Tour navigation controls (prev/next/skip/end)
   - Progress tracking and tour selection
   - Sticky positioning below navigation

3. `lib/demo-mode/tour-routes.ts` (92 lines)
   - Tour-to-route mapping for automatic navigation
   - Step-by-step page routing logic

### Tier 2: Presentation System (1,000+ lines)
**Risk**: High - deeply integrated with Stage 2 components

4. `lib/demo-mode/presentation-script.ts` (479 lines)
   - Full investor briefing scripts with talking points
   - Slide-by-slide scripts and visual cues
   - Q&A preparation and follow-up materials

5. `lib/demo-mode/esc-market-context.ts` (566 lines)
   - NSW ESC market structure and CER compliance
   - Northmore Gordon firm profile and branding
   - Client-specific demo scenarios

### Tier 3: Complex State Management (1,200+ lines)
**Risk**: Very High - core state management dependencies

6. `lib/demo-mode/demo-state-manager.ts` (1,140 lines)
   - **Strategy**: Replace entire file with 50-line simple version
   - Contains 10+ tour definitions with 60+ tour steps
   - Complex presentation modes and interaction tracking

### Tier 4: Demo Marketing & API (600+ lines)
**Risk**: Medium - isolated pages and endpoints

7. `app/demo/` directory
   - Demo landing page with tour selection
   - Marketing content for demo system itself

8. `app/api/presentation/` directory
   - API endpoints for adaptive presentation
   - Client-specific content adaptation

9. `components/presentation/` directory
   - Adaptive presentation dashboard
   - Audience-specific content optimization

### Tier 5: Complex Data Provider (320+ lines)
**Risk**: High - used throughout application until Phase 3

10. `components/demo/DemoDataProvider.tsx` (322 lines)
    - **Strategy**: Replace with simple provider or remove entirely
    - Complex context with tour integration
    - Multiple HOCs and specialized hooks

---

## Systematic Removal Process

### Pre-Removal Validation
Before deleting any files:
```bash
# Verify application works with simplified demo
npm test
npm run dev
# Test demo toggle functionality
# Verify Stage 2 AI components function
# Confirm no console errors
```

### Step-by-Step Removal

#### Step 1: Find All Import References
**For each file to be deleted**:
```bash
# Find all imports of the file
grep -r "from.*TourOverlay" src/ components/ app/ lib/
grep -r "import.*TourOverlay" src/ components/ app/ lib/

# Check for dynamic imports
grep -r "TourOverlay" src/ components/ app/ lib/
```

#### Step 2: Remove Import References
**Update importing files**:
- Comment out import statements
- Remove component usage
- Delete related function calls
- Clean up unused variables

#### Step 3: Delete Files Safely
**Use git to track deletions**:
```bash
git rm components/demo/TourOverlay.tsx
git commit -m "Remove TourOverlay.tsx (500 lines) - Phase 4 cleanup"
```

#### Step 4: Verify After Each Deletion
**Test immediately**:
- TypeScript compilation: `npm run type-check`
- Application startup: `npm run dev`
- Test suite: `npm test`

---

## Detailed Removal Instructions

### Remove TourOverlay System
```bash
# Step 1: Find references
grep -r "TourOverlay" .
grep -r "DemoControlBar" .
grep -r "tour-routes" .

# Step 2: Update NavigationShell (should be done in Phase 3)
# Verify no remaining imports

# Step 3: Delete files
git rm components/demo/TourOverlay.tsx
git rm components/demo/DemoControlBar.tsx
git rm lib/demo-mode/tour-routes.ts
git commit -m "Remove tour overlay system (797 lines)"

# Step 4: Test
npm run type-check && npm test
```

### Remove Presentation System
```bash
# Step 1: Find references
grep -r "presentation-script" .
grep -r "esc-market-context" .

# Step 2: Remove from any Stage 2 components (should be done in Phase 2)
# Verify no remaining imports

# Step 3: Delete files
git rm lib/demo-mode/presentation-script.ts
git rm lib/demo-mode/esc-market-context.ts
git rm -r app/api/presentation/
git rm -r components/presentation/
git commit -m "Remove presentation system (1,045+ lines)"

# Step 4: Test
npm run type-check && npm test
```

### Replace Complex State Manager
```bash
# Step 1: Backup original
cp lib/demo-mode/demo-state-manager.ts lib/demo-mode/demo-state-manager.ts.backup

# Step 2: Replace with simple version (from Phase 1)
cp lib/demo-mode/simple-demo-state.ts lib/demo-mode/demo-state-manager.ts

# Step 3: Update exports to match
# Ensure simple state manager exports match expected interface

# Step 4: Test and commit
npm run type-check && npm test
git add lib/demo-mode/demo-state-manager.ts
git commit -m "Replace complex state manager with simple version (1,090 line reduction)"
```

### Remove Demo Marketing Pages
```bash
# Step 1: Check for route references
grep -r "/demo" app/ components/

# Step 2: Update navigation if needed
# Remove demo page from navigation items if present

# Step 3: Delete directory
git rm -r app/demo/
git commit -m "Remove demo marketing pages"

# Step 4: Test routing
npm run dev
# Verify navigation works correctly
```

---

## Import Cleanup Checklist

### Files Likely to Have Complex Demo Imports
Check and update these files:

- [ ] `app/layout.tsx` (should be updated in Phase 3)
- [ ] `components/navigation/NavigationShell.tsx` (should be updated in Phase 3)
- [ ] Any remaining Stage 2 components (should be updated in Phase 2)
- [ ] Test files in `__tests__/demo/`
- [ ] Any custom hooks using complex demo state

### Common Import Patterns to Remove
```typescript
// Remove these import patterns:
import { useDemoMode } from '@/lib/demo-mode/demo-state-manager'
import { getESCDemoData } from '@/lib/demo-mode/esc-market-context'
import { DemoHighlight, DemoConditional } from '@/components/demo/DemoDataProvider'
import TourOverlay from '@/components/demo/TourOverlay'
import DemoControlBar from '@/components/demo/DemoControlBar'

// These should be replaced with:
import { useSimpleDemoMode } from '@/lib/demo-mode/simple-demo-state'
import { SimpleDemoProvider } from '@/components/demo/SimpleDemoProvider'
```

---

## Risk Mitigation

### High-Risk Areas
1. **State Manager Replacement**: Core file used throughout application
2. **Presentation System**: Deep integration with Stage 2 components
3. **Data Provider**: Context used in multiple components

### Safety Measures
1. **Atomic Commits**: One file deletion per commit
2. **Immediate Testing**: Test after each deletion
3. **Backup Strategy**: Keep deleted files in git history
4. **Rollback Plan**: Git reset for immediate recovery

### Testing Protocol
After each major deletion:
```bash
# Full validation sequence
npm run type-check      # TypeScript compilation
npm test               # Test suite (must be 100%)
npm run dev           # Development server
# Manual testing:
# - Application starts
# - Demo toggle works
# - Stage 2 components function
# - No console errors
```

---

## Verification Checklist

### File Deletion Validation
- [ ] **TourOverlay System**: 3 files deleted (797 lines)
- [ ] **Presentation System**: 4+ files deleted (1,045+ lines)
- [ ] **Demo State Manager**: Replaced with simple version (1,090 line reduction)
- [ ] **Demo Marketing**: Demo pages directory removed
- [ ] **Complex Data Provider**: Removed or replaced with simple version

### Code Quality Validation
- [ ] TypeScript compilation passes without errors
- [ ] ESLint rules satisfied for all modified files
- [ ] No unused imports or variables remain
- [ ] No broken import references
- [ ] Test suite maintains 100% success rate

### Functional Validation
- [ ] Application starts without console errors
- [ ] Demo mode toggle works correctly
- [ ] Trading simulation functions with demo data
- [ ] Stage 2 AI components operate normally
- [ ] Navigation and routing work correctly

---

## Success Metrics

### Quantitative Results
- [ ] **Files Removed**: 10+ files deleted
- [ ] **Lines Deleted**: 25,400+ lines removed
- [ ] **Code Reduction**: 99% reduction from original 25,800 lines
- [ ] **Remaining Code**: ~400 lines for demo functionality

### Qualitative Results
- [ ] **Codebase Clarity**: Simplified, maintainable demo system
- [ ] **Feature Preservation**: Demo mode still provides trading simulation
- [ ] **Integration Integrity**: Stage 2 AI components unaffected
- [ ] **Performance**: No regression in application performance

---

## Emergency Rollback

If critical issues arise:

1. **Immediate Recovery**:
   ```bash
   git log --oneline -10  # Find commit before deletions
   git reset --hard <commit-hash>
   ```

2. **Selective Recovery**:
   ```bash
   git checkout <commit-hash> -- path/to/deleted/file.tsx
   git commit -m "Restore critical file temporarily"
   ```

3. **Incremental Retry**:
   - Restore complex demo system
   - Identify specific deletion causing issues
   - Remove dependencies before deleting file
   - Retry deletion with proper preparation

---

## Next Phase Prerequisites

After Phase 4 completion:
- [ ] Complex demo infrastructure completely removed
- [ ] 99% code reduction achieved
- [ ] Application functions with simplified demo system
- [ ] Ready for test restoration and documentation in Phase 5

---

**After completing this phase, mark Task #4 as completed and proceed to Phase 5 prompt.**