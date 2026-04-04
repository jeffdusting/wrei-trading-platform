# Demo Mode Cleanup - Project Orchestration Guide

**Project ID**: DMC-2026-001
**Date**: 2026-03-28
**Status**: Ready for Implementation

---

## Overview

This document provides the complete orchestration framework for the Demo Mode Cleanup project, including task tracking, progressive verification, and context-window-sized execution phases.

---

## Project Structure

### Master Documentation
- **Project Plan**: `PROJECT_DEMO_MODE_CLEANUP.md` - Executive summary and scope
- **Orchestration Guide**: `PROJECT_ORCHESTRATION_GUIDE.md` - This document
- **Phase Prompts**: 5 self-contained implementation guides

### Phase-Specific Prompts
- **Phase 1**: `PHASE_1_PROMPT.md` - Build simplified demo infrastructure (4-6h)
- **Phase 2**: `PHASE_2_PROMPT.md` - Migrate Stage 2 AI components (4-6h)
- **Phase 3**: `PHASE_3_PROMPT.md` - Switch core integration (2-3h)
- **Phase 4**: `PHASE_4_PROMPT.md` - Remove complex infrastructure (3-4h)
- **Phase 5**: `PHASE_5_PROMPT.md` - Restore tests and documentation (3-5h)

---

## Task Tracking System

### Created Tasks with Dependencies

| Task | Subject | Status | Dependencies | Duration |
|------|---------|---------|--------------|----------|
| #1 | Phase 1: Build simplified demo infrastructure | Pending | None | 4-6h |
| #2 | Phase 2: Migrate Stage 2 AI components to simplified data | Pending | Task #1 | 4-6h |
| #3 | Phase 3: Switch core integration to simplified demo | Pending | Task #2 | 2-3h |
| #4 | Phase 4: Remove complex demo infrastructure | Pending | Task #3 | 3-4h |
| #5 | Phase 5: Restore test coverage and update documentation | Pending | Task #4 | 3-5h |
| #6 | Create self-contained phase prompts | **Completed** | None | 2h |

### Task Management Commands
```bash
# Check current task status
TaskList

# Start working on next available task
TaskUpdate taskId="1" status="in_progress"

# Mark task as completed
TaskUpdate taskId="1" status="completed"

# Get detailed task information
TaskGet taskId="1"
```

---

## Progressive Verification Framework

### Phase Gate Verification
Each phase must meet specific criteria before proceeding:

#### Phase 1 → Phase 2 Gate
- [ ] Simplified demo infrastructure created (3 files, ~280 lines)
- [ ] Parallel system works independently
- [ ] TypeScript compilation passes
- [ ] Zero impact on existing functionality

#### Phase 2 → Phase 3 Gate
- [ ] Stage 2 AI components use simplified data
- [ ] All AI functionality preserved
- [ ] No dependencies on complex demo system
- [ ] Component tests pass

#### Phase 3 → Phase 4 Gate
- [ ] Application uses simplified demo system
- [ ] Core integration points updated
- [ ] Demo mode provides trading simulation
- [ ] Navigation and layout function correctly

#### Phase 4 → Phase 5 Gate
- [ ] Complex infrastructure removed (25,400+ lines deleted)
- [ ] No broken import references
- [ ] Application starts without errors
- [ ] 99% code reduction achieved

#### Phase 5 Completion Gate
- [ ] 100% test coverage restored
- [ ] Documentation updated to v2.1
- [ ] Project completion report created
- [ ] All success criteria met

---

## Context-Window Management

### Phase Design Principles
Each phase prompt is designed to:
- **Fit Context Window**: Complete implementation guidance in single session
- **Self-Contained**: All necessary context and instructions included
- **Progressive**: Builds on previous phase without requiring full conversation history
- **Atomic**: Can be executed independently from cleared context

### Prompt Usage Pattern
```bash
# For each phase:
# 1. Clear context (new conversation or memory reset)
# 2. Load appropriate PHASE_X_PROMPT.md
# 3. Execute implementation following phase instructions
# 4. Verify phase gate criteria
# 5. Mark task as completed
# 6. Proceed to next phase
```

### Context Handoff Information
Each prompt includes:
- **Project context**: Why we're doing this phase
- **Previous phase summary**: What should be completed
- **Implementation tasks**: Step-by-step instructions
- **Verification criteria**: How to validate success
- **Next phase setup**: Prerequisites for continuation

---

## Documentation Deliverables Tracking

### Documentation Updates Required

#### Immediate Updates (Phase 5)
- [ ] `docs/03-SYSTEM-FUNCTIONAL-ARCHITECTURE.md` → v2.1
- [ ] `docs/05-API-REFERENCE.md` → v2.1
- [ ] `README.md` - demo mode description correction
- [ ] `CHANGELOG.md` - add demo mode simplification entry

#### New Documentation (Phase 5)
- [ ] `docs/PROJECT_DEMO_MODE_CLEANUP_COMPLETION.md` - project completion report
- [ ] Updated component catalog reflecting simplified demo system
- [ ] Removed references to presentation API endpoints
- [ ] Corrected feature lists and capability descriptions

#### Documentation Verification
- [ ] All docs reflect current platform state
- [ ] No references to removed components/APIs
- [ ] Demo mode accurately described
- [ ] Metrics and achievements documented

---

## Risk Management & Rollback

### Rollback Procedures by Phase

#### Phase 1 Rollback (Low Risk)
```bash
# Phase 1 is additive only - simply delete new files
git rm lib/demo-mode/simple-demo-state.ts
git rm lib/demo-mode/demo-data-simple.ts
git rm components/demo/SimpleDemoToggle.tsx
```

#### Phase 2 Rollback (Medium Risk)
```bash
# Restore Stage 2 components to complex demo imports
git checkout HEAD~1 components/orchestration/
git checkout HEAD~1 components/analytics/
git checkout HEAD~1 components/audience/
git checkout HEAD~1 components/generation/
```

#### Phase 3 Rollback (High Risk)
```bash
# Restore layout and navigation to complex demo system
git checkout HEAD~1 app/layout.tsx
git checkout HEAD~1 components/navigation/NavigationShell.tsx
```

#### Phase 4 Rollback (Very High Risk)
```bash
# Restore deleted files from git history
git log --diff-filter=D --summary | grep delete
git checkout <commit-hash>~1 -- <deleted-file-path>
```

#### Phase 5 Rollback (Medium Risk)
```bash
# Restore test files and documentation
git checkout HEAD~1 __tests__/
git checkout HEAD~1 docs/
```

### Emergency Contact
If critical issues arise that cannot be resolved through rollback:
- **Stop implementation immediately**
- **Document the specific issue and context**
- **Preserve current state with git commit**
- **Escalate to project stakeholder for guidance**

---

## Quality Assurance Protocol

### Continuous Testing
After each phase:
```bash
# Required testing sequence
npm run type-check     # TypeScript compilation
npm test              # Full test suite
npm run lint          # Code quality
npm run dev           # Development server startup
```

### Success Metrics Tracking
| Metric | Baseline | Target | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|--------|----------|--------|---------|---------|---------|---------|---------|
| Total Lines | 25,800 | 400 | 25,800 | 25,800 | 25,800 | 400 | 400 |
| Demo Files | 27 | 3 | 30 | 30 | 30 | 3 | 3 |
| Test Success | 100% | 100% | 100% | 100% | 100% | TBD | 100% |
| TypeScript | Pass | Pass | Pass | Pass | Pass | Pass | Pass |

### Performance Monitoring
- **Page Load Time**: Should not regress
- **Memory Usage**: Should decrease after removal
- **Bundle Size**: Should decrease significantly
- **Runtime Performance**: No degradation in demo mode

---

## Communication & Status Updates

### Stakeholder Reporting
- **Phase Completion**: Status report after each phase
- **Blocker Resolution**: Immediate escalation for critical issues
- **Weekly Status**: Progress summary if project spans multiple weeks
- **Final Delivery**: Comprehensive completion report

### Documentation Updates
- **Real-time**: Task status updates during development
- **Phase Gates**: Documentation updates at boundaries
- **Final**: Complete documentation suite refresh

### Status Dashboard
```markdown
## Demo Mode Cleanup Status

**Overall Progress**: X/5 phases completed (XX%)
**Current Phase**: Phase X - Description
**Next Milestone**: Phase X completion
**Estimated Completion**: Date

**Metrics**:
- Code Reduction: X% achieved
- Test Coverage: X% maintained
- Documentation: X% updated
```

---

## Project Completion Criteria

### Technical Completion
- [ ] All 5 phases completed successfully
- [ ] 99% code reduction achieved (25,800 → 400 lines)
- [ ] 100% test coverage maintained
- [ ] Zero regression in core functionality

### Functional Completion
- [ ] Demo mode provides trading simulation value
- [ ] Stage 2 AI components work with simplified data
- [ ] User experience preserved or improved
- [ ] Platform performance maintained or improved

### Documentation Completion
- [ ] All documentation updated to reflect simplified system
- [ ] Project completion report created
- [ ] Lessons learned documented
- [ ] Future maintenance guidelines provided

### Stakeholder Acceptance
- [ ] User acceptance testing completed
- [ ] Performance validation passed
- [ ] Documentation review approved
- [ ] Project officially closed

---

## Getting Started

### To Begin Implementation
1. **Review master project plan**: `docs/PROJECT_DEMO_MODE_CLEANUP.md`
2. **Check current task status**: Use `TaskList` command
3. **Load Phase 1 prompt**: Read `docs/PHASE_1_PROMPT.md`
4. **Mark task as in progress**: `TaskUpdate taskId="1" status="in_progress"`
5. **Begin implementation**: Follow Phase 1 instructions
6. **Verify completion**: Check Phase 1 → Phase 2 gate criteria
7. **Mark task complete**: `TaskUpdate taskId="1" status="completed"`
8. **Proceed to Phase 2**: Load `docs/PHASE_2_PROMPT.md`

### Success Indicators
- Each phase completes within estimated timeframe
- Verification criteria met at each phase gate
- No critical issues requiring project halt
- Progress toward 99% code reduction target
- Maintained quality and functionality throughout

---

**Project Ready for Implementation**
**All orchestration documentation complete**
**Begin with Phase 1 when approved**