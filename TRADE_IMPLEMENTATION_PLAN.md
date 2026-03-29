# WREI Platform: Negotiate → Trade Implementation Plan

## Overview

Transform the WREI platform from "negotiate" terminology to "trade" terminology while preserving all existing functionality, Bloomberg Terminal aesthetics, and business logic. Implementation designed for context-window-manageable phases with comprehensive verification at each step.

## Current Functionality Preservation Requirements

### Core Features That Must Be Preserved
1. **AI Agent Negotiation Engine** - Claude API integration for trade execution
2. **Five Buyer Personas** - Corporate, ESG Fund, Trading Desk, Sustainability, Government
3. **Defence Layer System** - Price floors, concession limits, input sanitization
4. **Bloomberg Terminal Interface** - Professional styling, three-panel layout, typography
5. **Demo Mode Integration** - SimpleDemoProvider functionality
6. **Market Ticker** - Real-time market data display
7. **Navigation Structure** - Six-item Bloomberg navigation
8. **API Routes** - Server-side Claude integration with proper error handling
9. **TypeScript Type Safety** - Complete type definitions and validation
10. **Vercel Deployment** - Production build and deployment pipeline

### Critical Configuration Preservation
- ANTHROPIC_API_KEY server-side only usage
- Pricing parameters: $150 anchor, $120 floor, 5% max concession per round
- WREI Pricing Index integration
- Australian spelling throughout
- Professional design tokens and Bloomberg styling
- No localStorage/sessionStorage usage

## Implementation Phases

### Phase 1: Core Route Migration (Context Window: ~500 files)
**Estimated Time:** 45-60 minutes
**Scope:** Route changes, navigation updates, core file renames

**Files to Modify (Priority Order):**
1. `app/negotiate/page.tsx` → `app/trade/page.tsx`
2. `app/api/negotiate/route.ts` → `app/api/trade/route.ts`
3. `components/navigation/BloombergShell.tsx` (navigation item update)
4. `app/layout.tsx` (metadata updates)
5. `lib/types.ts` (route-related types)

**Verification Checkpoint:**
- All routes accessible via new `/trade` URL
- API endpoint responds correctly at `/api/trade`
- Navigation item links to correct route
- No 404 errors on core functionality

### Phase 2: Interface Terminology Updates (Context Window: ~300 files)
**Estimated Time:** 30-45 minutes
**Scope:** User-facing text, headings, descriptions

**Files to Modify:**
1. `app/trade/page.tsx` (page headings and descriptions)
2. `components/negotiation/` directory components
3. Landing page references (`app/page.tsx`)
4. Documentation strings and comments

**Search Patterns for Updates:**
- "negotiate" → "trade"
- "negotiation" → "trading"
- "Negotiate" → "Trade"
- "Negotiation" → "Trading"

**Verification Checkpoint:**
- All user-facing text uses "trade" terminology
- Page titles and descriptions updated
- No broken UI text or layout issues

### Phase 3: Enhanced Trading Features (Context Window: ~400 files)
**Estimated Time:** 60-75 minutes
**Scope:** New trading dashboard features, enhanced analytics

**New Features to Implement:**
1. **Trade Execution Dashboard** - Enhanced trade status tracking
2. **Market Analysis Panel** - Real-time market context integration
3. **Trade History View** - Session-based trade tracking
4. **Position Summary** - Aggregated trading position view

**Files to Create/Modify:**
- `components/trading/TradeExecutionDashboard.tsx`
- `components/trading/MarketAnalysisPanel.tsx`
- `components/trading/TradeHistoryView.tsx`
- `lib/trading-analytics.ts`

**Verification Checkpoint:**
- New trading features functional
- Bloomberg Terminal styling consistent
- No performance regressions

### Phase 4: Type System and Code Quality (Context Window: ~600 files)
**Estimated Time:** 45-60 minutes
**Scope:** TypeScript types, variable names, internal references

**Files to Update:**
- All TypeScript interfaces and types
- Variable names throughout codebase
- Function names and internal references
- Configuration file updates

**Verification Checkpoint:**
- TypeScript compilation successful
- No type errors or warnings
- Code quality maintained

## Phase Execution Instructions

### Before Starting Any Phase

1. **Create Implementation Branch**
   ```bash
   git checkout -b feature/negotiate-to-trade-implementation
   git push -u origin feature/negotiate-to-trade-implementation
   ```

2. **Verify Current State**
   ```bash
   npm run build  # Ensure clean build
   npm run type-check  # Verify TypeScript
   ```

3. **Document Current Routes**
   - Test `/negotiate` functionality
   - Document all working features
   - Verify API endpoints respond correctly

### Phase 1 Startup Instructions

**Command to Give Claude:**
```
Begin Phase 1: Core Route Migration for negotiate-to-trade implementation.

Priority tasks:
1. Move app/negotiate/page.tsx to app/trade/page.tsx
2. Move app/api/negotiate/route.ts to app/api/trade/route.ts
3. Update navigation in BloombergShell.tsx: "Trading" item should link to /trade
4. Update any direct route references in layout.tsx
5. Update route-related TypeScript types in lib/types.ts

Preserve ALL existing functionality - only change route paths and navigation links.

After changes, run build verification and report any errors.
```

### Phase 2 Startup Instructions

**Command to Give Claude:**
```
Begin Phase 2: Interface Terminology Updates for negotiate-to-trade implementation.

Update user-facing text throughout the platform:
- "negotiate" → "trade"
- "negotiation" → "trading"
- Page headings, descriptions, and button text
- Focus on app/trade/page.tsx and components/negotiation/ directory

Maintain Australian spelling and Bloomberg Terminal professional tone.
Preserve all existing styling and functionality.

After changes, verify UI displays correctly and run build check.
```

### Phase 3 Startup Instructions

**Command to Give Claude:**
```
Begin Phase 3: Enhanced Trading Features for negotiate-to-trade implementation.

Implement enhanced trading dashboard features:
1. Create TradeExecutionDashboard component with trade status tracking
2. Add MarketAnalysisPanel with real-time market context
3. Implement TradeHistoryView for session-based tracking
4. Create trading-analytics utility functions

Maintain Bloomberg Terminal styling and professional design tokens.
Ensure all new features integrate with existing Claude API negotiation engine.

Test new features and verify no regressions in core functionality.
```

### Phase 4 Startup Instructions

**Command to Give Claude:**
```
Begin Phase 4: Type System and Code Quality for negotiate-to-trade implementation.

Complete the transformation by updating:
1. All TypeScript interfaces and type definitions
2. Internal variable names and function names
3. Configuration references and internal comments
4. Ensure complete type safety throughout

Run comprehensive TypeScript check and build verification.
Prepare for final testing and deployment.
```

## Verification Procedures

### After Each Phase
1. **Build Verification**
   ```bash
   npm run build
   npm run type-check
   ```

2. **Functionality Testing**
   - Test core trading functionality
   - Verify Bloomberg Terminal styling intact
   - Check all navigation links work
   - Test API endpoints respond correctly

3. **Git Management**
   ```bash
   git add .
   git commit -m "Phase X: [description] - preserve all functionality"
   git push origin feature/negotiate-to-trade-implementation
   ```

### Final Verification Before Merge
1. **Complete Feature Testing**
   - Execute full trade scenario with each persona
   - Verify all defence layers operational
   - Test responsive design across breakpoints
   - Confirm Vercel deployment successful

2. **Regression Testing**
   - Compare functionality with original negotiate version
   - Verify no performance degradation
   - Check all Bloomberg Terminal features intact
   - Validate API security measures preserved

## Success Criteria

✅ **Route Migration Complete** - `/trade` fully replaces `/negotiate`
✅ **Terminology Consistent** - All user-facing text uses "trade" language
✅ **Enhanced Features** - New trading dashboard components functional
✅ **Type Safety Maintained** - No TypeScript errors or warnings
✅ **Bloomberg Styling Preserved** - Professional interface unchanged
✅ **Core Functionality Intact** - AI agent, personas, defence layers work
✅ **Performance Maintained** - No regressions in build or runtime performance
✅ **Production Deployment** - Successful Vercel deployment with new routes

## Rollback Strategy

If issues arise during any phase:

1. **Phase-Level Rollback**
   ```bash
   git reset --hard HEAD~1  # Rollback last commit
   ```

2. **Full Implementation Rollback**
   ```bash
   git checkout main
   git branch -D feature/negotiate-to-trade-implementation
   ```

3. **Production Rollback**
   - Revert to previous Vercel deployment
   - Restore original `/negotiate` routes

## Context Window Management

Each phase is designed to stay within context limits:
- **Phase 1:** ~15-20 files modified
- **Phase 2:** ~25-30 files modified
- **Phase 3:** ~10-15 new files created
- **Phase 4:** ~35-40 files modified

Total implementation maintains manageable scope while preserving all existing functionality and Bloomberg Terminal professional interface.