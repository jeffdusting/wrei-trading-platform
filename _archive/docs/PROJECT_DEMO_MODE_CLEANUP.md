# WREI Trading Platform - Demo Mode Cleanup Project

**Project ID:** DMC-2026-001
**Date Created:** 2026-03-28
**Status:** Planning Complete - Ready for Implementation
**Priority:** High - Platform Simplification

---

## Executive Summary

**Problem:** Demo mode implementation has 65-130x scope expansion (25,800 lines vs 200-400 needed)
**Solution:** Systematic cleanup to restore original simple requirement: "User selects demo mode, completes trades on dummy data"
**Impact:** 99% code reduction while preserving all core functionality and Stage 2 AI capabilities

---

## Project Scope & Objectives

### Primary Objectives
1. **Restore Original Demo Intent**: Simple toggle for trading with dummy data
2. **Eliminate Scope Creep**: Remove 25,400+ lines of tour/presentation infrastructure
3. **Preserve Core Value**: Maintain trading simulation and Stage 2 AI functionality
4. **Maintain Quality**: 100% test coverage and zero regression in core features

### Out of Scope
- Changes to core trading functionality
- Modifications to Stage 2 AI algorithms (only data injection simplification)
- UI/UX changes beyond demo mode simplification

---

## Current State Analysis

### Scope Explosion Metrics
- **Total Demo Infrastructure**: 25,800 lines across 27 files
- **Core Bloat**: `/lib/demo-mode/demo-state-manager.ts` - 1,140 lines for simple toggle
- **Feature Creep**: 10+ tour types, investor briefing scripts, client branding
- **Integration Complexity**: Demo concerns permeate entire application frame

### Components to Remove (High-Level)
1. **Tour System** (1,900+ lines): TourOverlay, DemoControlBar, tour routing
2. **Presentation System** (1,000+ lines): Investor briefings, scripts, client branding
3. **Complex State Management** (900+ lines): 10 tour definitions, metrics tracking
4. **Demo Marketing Pages** (400+ lines): Demo landing page and selection UI

---

## Implementation Strategy

### Phase-Based Approach
**Rationale**: Context-window-sized phases with self-contained prompts
**Verification**: Progressive validation at each phase boundary
**Risk Mitigation**: Parallel build → migration → removal sequence

### Documentation Deliverables
1. **Updated Functional Architecture** (docs/03-SYSTEM-FUNCTIONAL-ARCHITECTURE.md v2.1)
2. **Simplified API Reference** (docs/05-API-REFERENCE.md v2.1)
3. **Updated README** with corrected demo mode description
4. **Project Completion Report** with metrics and lessons learned

---

## Detailed Phase Breakdown

### Phase 1: Foundation & Parallel Build
**Duration**: 4-6 hours
**Context Window**: Manageable - focused on new file creation
**Deliverables**: Simplified demo infrastructure alongside existing system

### Phase 2: Stage 2 AI Migration
**Duration**: 4-6 hours
**Context Window**: Medium - AI component updates
**Deliverables**: Stage 2 components using simplified data injection

### Phase 3: Core Integration Switch
**Duration**: 2-3 hours
**Context Window**: Small - layout and navigation updates
**Deliverables**: Application using simplified demo system

### Phase 4: Infrastructure Removal
**Duration**: 3-4 hours
**Context Window**: Large - systematic file deletion
**Deliverables**: Complex tour/presentation system removed

### Phase 5: Testing & Documentation
**Duration**: 3-5 hours
**Context Window**: Medium - test updates and documentation
**Deliverables**: 100% test coverage, updated documentation suite

---

## Risk Management

### High-Risk Areas
1. **Stage 2 AI Dependencies**: Complex integration with demo data
2. **Test Coverage Loss**: 100% success rate must be maintained
3. **Deployment Pipeline**: Changes to layout.tsx affect entire app

### Mitigation Strategies
1. **Parallel Development**: Build new system alongside old
2. **Atomic Commits**: Granular git history for easy rollback
3. **Feature Branching**: Isolate changes until fully validated
4. **Progressive Testing**: Validate at each phase boundary

---

## Success Criteria

### Quantitative Metrics
- [ ] **Code Reduction**: 25,800 → 200-400 lines (99% reduction)
- [ ] **File Cleanup**: Remove 20+ demo-related files
- [ ] **Test Coverage**: Maintain 100% test success rate
- [ ] **Performance**: No regression in page load times

### Qualitative Validation
- [ ] **User Experience**: Demo mode provides same trading simulation value
- [ ] **Integration**: Stage 2 AI components function with simplified data
- [ ] **Maintainability**: Simplified codebase is easier to understand and modify
- [ ] **Documentation**: Platform docs accurately reflect delivered system

---

## Project Dependencies

### Prerequisites
- Current platform state: 100% test coverage achieved
- Documentation v2.0 baseline established
- Vercel deployment pipeline operational

### External Dependencies
- No external API changes required
- No third-party library updates needed
- No database schema modifications

---

## Communication Plan

### Stakeholder Updates
- **Phase Completion**: Status report after each phase
- **Blocker Resolution**: Immediate escalation for critical issues
- **Final Delivery**: Comprehensive completion report with metrics

### Documentation Updates
- **Real-time**: Task status tracking during development
- **Phase Gates**: Documentation updates at each phase boundary
- **Final**: Complete documentation suite refresh

---

## Next Steps

1. **Approval Gate**: Confirm project scope and approach
2. **Task Setup**: Create tracked tasks for orchestration
3. **Phase 1 Execution**: Begin parallel build of simplified system
4. **Progressive Verification**: Validate each phase before proceeding

---

**Project Manager**: Claude Sonnet 4
**Technical Lead**: Claude Sonnet 4
**Documentation Lead**: Claude Sonnet 4
**QA Lead**: Claude Sonnet 4

*This document serves as the master project specification and will be updated throughout the implementation lifecycle.*