# WREI Trading Platform: Implementation Orchestration Guide

## Quick Start Commands

### Pre-Implementation Setup

**1. Create Feature Branch**
```bash
git checkout -b feature/negotiate-to-trade-implementation
git push -u origin feature/negotiate-to-trade-implementation
```

**2. Baseline Verification**
```bash
npm run build && npm run type-check
```

**3. Test Current Functionality**
- Visit https://wrei.cbslab.app/negotiate
- Test AI trading with different personas
- Verify all Bloomberg Terminal features work

---

## Phase Execution Commands

### Phase 1: Core Route Migration
**Give Claude this exact command:**

```
Begin Phase 1: Core Route Migration for negotiate-to-trade implementation.

Execute in this exact order:
1. Move app/negotiate/page.tsx to app/trade/page.tsx (preserve all content)
2. Move app/api/negotiate/route.ts to app/api/trade/route.ts (preserve all logic)
3. Update BloombergShell.tsx: change "Trading" navigation item href from "/negotiate" to "/trade"
4. Update any metadata or route references in app/layout.tsx
5. Update route-related TypeScript types in lib/types.ts

CRITICAL: Preserve ALL existing functionality, styling, and Bloomberg Terminal interface.
After changes, run npm run build and report any errors.
Commit changes with message: "Phase 1: Core route migration - preserve functionality"
```

**Verification Steps:**
- [ ] Build completes without errors
- [ ] `/trade` route loads correctly
- [ ] API endpoint `/api/trade` responds
- [ ] Navigation "Trading" button links to `/trade`
- [ ] No 404 errors on core features

---

### Phase 2: Interface Terminology Updates
**Give Claude this exact command:**

```
Begin Phase 2: Interface Terminology Updates for negotiate-to-trade implementation.

Update all user-facing terminology:
1. In app/trade/page.tsx: Update page headings, descriptions, and UI text
2. In components/negotiation/ directory: Update component text and labels
3. Search and replace throughout codebase:
   - "negotiate" → "trade"
   - "negotiation" → "trading"
   - "Negotiate" → "Trade"
   - "Negotiation" → "Trading"

PRESERVE:
- Australian spelling throughout
- Bloomberg Terminal professional tone
- All existing styling and layout
- Component functionality and logic

After changes, verify UI displays correctly and run build check.
Commit changes with message: "Phase 2: Interface terminology updates - preserve styling"
```

**Verification Steps:**
- [ ] All page headings use "trade" terminology
- [ ] Button text and labels updated consistently
- [ ] Professional tone maintained
- [ ] No UI layout breaks or styling issues

---

### Phase 3: Enhanced Trading Features
**Give Claude this exact command:**

```
Begin Phase 3: Enhanced Trading Features for negotiate-to-trade implementation.

Create enhanced trading dashboard components:

1. Create components/trading/TradeExecutionDashboard.tsx:
   - Trade status tracking with Bloomberg Terminal styling
   - Integration with existing negotiation state
   - Professional metrics display using existing design tokens

2. Create components/trading/MarketAnalysisPanel.tsx:
   - Real-time market context display
   - Integration with existing WREI Pricing Index
   - Bloomberg-style data visualization

3. Create components/trading/TradeHistoryView.tsx:
   - Session-based trade tracking
   - Professional table layout using existing ProfessionalDataGrid patterns

4. Create lib/trading-analytics.ts:
   - Utility functions for trade analytics
   - Integration with existing defence layer logic

REQUIREMENTS:
- Use existing Bloomberg Terminal design tokens
- Integrate with current Claude API negotiation engine
- Maintain all existing functionality
- Follow established TypeScript patterns

Test new features and verify no regressions in core functionality.
Commit changes with message: "Phase 3: Enhanced trading features - maintain integration"
```

**Verification Steps:**
- [ ] New trading components render correctly
- [ ] Bloomberg Terminal styling consistent
- [ ] Integration with existing AI negotiation works
- [ ] No performance regressions
- [ ] All original features still functional

---

### Phase 4: Type System and Code Quality
**Give Claude this exact command:**

```
Begin Phase 4: Type System and Code Quality for negotiate-to-trade implementation.

Complete the transformation by updating internal references:

1. Update all TypeScript interfaces and type definitions:
   - Rename negotiation-related types to trading equivalents
   - Update interface names and property names
   - Ensure type safety throughout

2. Update internal variable names and function names:
   - Function parameters and local variables
   - Class names and method names
   - Configuration constants and enums

3. Update internal comments and documentation:
   - JSDoc comments
   - Inline code comments
   - Configuration file documentation

4. Final cleanup:
   - Remove any orphaned negotiate references
   - Ensure consistent terminology throughout
   - Update any remaining configuration references

PRESERVE:
- All existing business logic
- Defence layer functionality
- API integration patterns
- Performance characteristics

Run comprehensive TypeScript check and build verification.
Commit changes with message: "Phase 4: Type system updates - complete transformation"
```

**Verification Steps:**
- [ ] TypeScript compilation clean (no errors/warnings)
- [ ] Build completes successfully
- [ ] All type definitions updated consistently
- [ ] No orphaned references to old terminology

---

## Monitoring and Verification

### After Each Phase

**1. Technical Verification**
```bash
# Build verification
npm run build

# TypeScript verification
npm run type-check

# Git status check
git status
```

**2. Functional Testing**
- Test core trading functionality with different personas
- Verify Bloomberg Terminal styling intact
- Check all navigation and routing works
- Test API endpoints respond correctly

**3. Commit Pattern**
```bash
git add .
git commit -m "Phase X: [description] - [preservation note]"
git push origin feature/negotiate-to-trade-implementation
```

### Final Pre-Merge Verification

**1. Comprehensive Testing**
```bash
# Full build and type check
npm run build && npm run type-check

# Test deployment locally
npm run dev
```

**2. Feature Verification Checklist**
- [ ] AI agent trading works with all 5 personas
- [ ] Defence layers operational (price floors, concession limits)
- [ ] Bloomberg Terminal interface fully preserved
- [ ] Market ticker and real-time data functional
- [ ] Navigation structure intact (6 items, proper styling)
- [ ] API security measures preserved (server-side only)
- [ ] Australian spelling maintained throughout
- [ ] No localStorage/sessionStorage usage

**3. Performance Verification**
- [ ] Build time comparable to baseline
- [ ] Runtime performance maintained
- [ ] Vercel deployment successful
- [ ] Production functionality verified

### Production Deployment Commands

**1. Merge to Main**
```bash
git checkout main
git merge feature/negotiate-to-trade-implementation
git push origin main
```

**2. Verify Vercel Deployment**
- Check Vercel dashboard for successful build
- Test https://wrei.cbslab.app/trade functionality
- Verify all personas and features work in production

### Rollback Procedures

**If Issues Arise:**

**Phase-Level Rollback:**
```bash
git reset --hard HEAD~1
git push --force origin feature/negotiate-to-trade-implementation
```

**Full Implementation Rollback:**
```bash
git checkout main
git branch -D feature/negotiate-to-trade-implementation
```

**Production Emergency Rollback:**
- Use Vercel dashboard to revert to previous deployment
- Restore original `/negotiate` routes immediately

---

## Success Metrics

### Completion Indicators
✅ All routes accessible via `/trade` URL structure
✅ User interface consistently uses trading terminology
✅ Enhanced trading features functional and styled
✅ TypeScript compilation clean with no errors
✅ Bloomberg Terminal professional interface preserved
✅ All original functionality intact (AI agent, personas, defence)
✅ Successful production deployment on Vercel
✅ Performance baseline maintained or improved

### Quality Assurance
✅ No broken links or 404 errors
✅ Responsive design works across all breakpoints
✅ Professional typography system maintained
✅ Australian spelling consistent throughout
✅ API security measures preserved
✅ Demo mode functionality intact

This orchestration ensures systematic implementation while maintaining the professional Bloomberg Terminal interface and preserving all existing WREI platform functionality.