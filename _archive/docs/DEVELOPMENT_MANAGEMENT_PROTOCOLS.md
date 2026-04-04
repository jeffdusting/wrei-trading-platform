# WREI Development Management Protocols

**Version:** 1.0
**Date:** 2026-03-22
**Purpose:** Thread Context, Plan Adherence & Model Management
**Status:** Implementation Required

---

## Protocol 1: Thread Context Management

### Context Capacity Monitoring

**Threshold System:**
- **Green Zone (0-70%)**: Continue development normally
- **Yellow Zone (70-85%)**: Monitor closely, prepare for context transfer
- **Red Zone (85%+)**: Mandatory context transfer required

**Context Assessment Triggers:**
```typescript
interface ContextCheck {
  estimatedTokens: number;
  complexityLevel: 'simple' | 'moderate' | 'complex';
  lastMajorDecision: string;
  activeWorkstreams: number;
  status: 'green' | 'yellow' | 'red';
}

// Trigger assessment every:
- 10 tool calls
- Major milestone completion
- Plan deviation detection
- User request for status
```

### Mandatory Context Transfer Protocol

**When Red Zone Reached:**

1. **Immediate Actions:**
   ```
   STOP: Do not proceed with complex development tasks
   ASSESS: Current context status and completion percentage
   DOCUMENT: All active workstreams and decisions made
   PREPARE: Comprehensive handoff documentation
   ```

2. **Context Preservation Steps:**
   ```
   1. Update INTEGRATED_DEVELOPMENT_PLAN.md with current progress
   2. Save current state to DEVELOPMENT_CONTEXT_HANDOFF.md
   3. Create specific continuation prompt with:
      - Current milestone status
      - Active test development
      - Blocking issues
      - Next 3 priority tasks
      - Model selection recommendation
   4. Commit all work in progress
   5. Generate explicit handoff instructions
   ```

3. **Handoff Documentation Template:**
   ```markdown
   # Development Context Handoff

   **Date:** [ISO timestamp]
   **Context Status:** Red Zone (>85%)
   **Handoff Reason:** Context capacity exceeded
   **Recommended Model:** [Sonnet/Opus + justification]

   ## Current Development State
   - **Active Milestone:** [Current milestone]
   - **Testing Phase:** [Phase A/B/C with progress]
   - **Last Completed Task:** [Specific task]
   - **In Progress:** [Specific active work]
   - **Blocking Issues:** [Any blockers]

   ## Continuation Instructions
   1. Read /INTEGRATED_DEVELOPMENT_PLAN.md
   2. Review this handoff document
   3. Run: npm test (verify baseline)
   4. Continue with: [Specific next task]

   ## Critical Decisions Made This Session
   - [List key decisions that must be preserved]

   ## Files Modified This Session
   - [List all files changed with brief descriptions]

   ## Test Status
   - Total Tests: [current count]
   - New Tests Added: [count]
   - Failing Tests: [list any failures]

   ## Next Session Priority
   [Specific next task with detailed context]
   ```

### Prevention Strategies

**Early Warning System:**
- Monitor context usage during long development sessions
- Break complex tasks into smaller chunks
- Commit frequently to preserve work
- Use background agents for research-heavy tasks

---

## Protocol 2: Plan Adherence Management

### Plan Deviation Detection

**Monitoring Points:**
```typescript
interface PlanAdherence {
  currentMilestone: string;
  plannedTasks: Task[];
  completedTasks: Task[];
  deviatedTasks: Task[];
  newUnplannedTasks: Task[];
  adherenceScore: number; // 0-1
}

// Red flags for plan deviation:
- Working on tasks not in INTEGRATED_DEVELOPMENT_PLAN.md
- Skipping testing requirements
- Adding features not in milestone scope
- Changing priorities without explicit approval
- Model switching without justification
```

**Deviation Response Protocol:**

1. **Minor Deviation (Adherence Score 0.8-1.0):**
   ```
   DOCUMENT: Why deviation occurred
   ASSESS: Impact on overall plan
   CONTINUE: With notification to user
   ```

2. **Major Deviation (Adherence Score 0.5-0.8):**
   ```
   STOP: Current work
   EXPLAIN: Deviation reasons to user
   PROPOSE: Plan adjustment options
   AWAIT: User approval before proceeding
   ```

3. **Critical Deviation (Adherence Score <0.5):**
   ```
   HALT: All development work
   ESCALATE: To user immediately
   REQUIRE: Explicit plan revision and approval
   RESTART: Only after plan alignment confirmed
   ```

### Plan Compliance Checkpoints

**Mandatory Checks Before:**
- Starting new milestone
- Adding new features
- Changing test priorities
- Switching development focus
- Major architectural decisions

**Checkpoint Questions:**
```markdown
1. Is this task in INTEGRATED_DEVELOPMENT_PLAN.md?
2. Does this align with current milestone objectives?
3. Are we following test-first development?
4. Have we completed prerequisite tasks?
5. Is the current model appropriate for this task?
```

### Plan Update Protocol

**When Plan Changes Required:**

1. **Document Reason for Change:**
   - Technical blocker discovered
   - User requirement change
   - Better approach identified
   - External dependency issue

2. **Formal Plan Amendment:**
   ```
   1. Create PLAN_AMENDMENT_[DATE].md
   2. Document proposed changes
   3. Show impact on timeline/priorities
   4. Get explicit user approval
   5. Update INTEGRATED_DEVELOPMENT_PLAN.md
   6. Notify all stakeholders
   ```

3. **Change Tracking:**
   ```typescript
   interface PlanChange {
     date: string;
     reason: string;
     changedSections: string[];
     impact: 'minor' | 'major' | 'critical';
     approvedBy: string;
     implementedBy: string;
   }
   ```

---

## Protocol 3: Model Selection & Management

### Model Selection Criteria

**Sonnet 4 (Default for most tasks):**
```
✅ Use for:
- Routine development tasks
- Code implementation
- Test writing
- Documentation updates
- Debug and troubleshooting
- Standard component development

❌ Do not use for:
- Complex architectural decisions
- Strategic planning
- Multi-system integration analysis
- High-stakes problem solving
```

**Opus 4.6 (Strategic and Complex Tasks):**
```
✅ Use for:
- Strategic planning (like the Plan agent review)
- Complex architectural decisions
- Multi-system integration planning
- Major problem analysis
- Plan creation and revision
- Context handoff decisions
- Critical decision points

❌ Do not use for:
- Simple implementation tasks
- Routine coding
- Basic documentation
- Minor bug fixes
```

### Model Escalation Protocol

**Automatic Escalation Triggers:**
- Plan deviation detected
- Complex architectural decision needed
- Multi-milestone planning required
- Major blocker encountered
- Context handoff required
- Strategic decision point reached

**Escalation Process:**
```
1. PAUSE: Current task
2. ASSESS: Complexity and strategic importance
3. DOCUMENT: Why escalation needed
4. SWITCH: To appropriate model with context
5. COMPLETE: Strategic work
6. HANDOFF: Implementation back to Sonnet if appropriate
```

### Model Switching Documentation

**Required Before Model Switch:**
```markdown
# Model Switch Request

**From:** [Current model]
**To:** [Target model]
**Reason:** [Specific justification]
**Task:** [What needs to be done]
**Context:** [Current state summary]
**Expected Outcome:** [What should be delivered]
**Handback Plan:** [How to return to development]
```

**Anti-Pattern Prevention:**
```
❌ NEVER switch to Sonnet for:
- Major strategic decisions
- Complex multi-system analysis
- Plan creation or major revision
- Critical problem solving

❌ NEVER use Opus for:
- Simple code implementation
- Routine test writing
- Basic documentation updates
- Minor bug fixes
```

---

## Implementation Checklist

### Immediate Actions Required:

**Week 1: Protocol Implementation**
- [ ] Create context monitoring system
- [ ] Establish plan adherence tracking
- [ ] Define model selection guidelines
- [ ] Create handoff documentation templates
- [ ] Set up deviation detection alerts

**Week 2: Process Integration**
- [ ] Train team on new protocols
- [ ] Test context handoff procedures
- [ ] Validate plan adherence monitoring
- [ ] Practice model escalation scenarios
- [ ] Create automated checks where possible

**Ongoing: Protocol Maintenance**
- [ ] Review protocols monthly
- [ ] Update based on experience
- [ ] Monitor protocol effectiveness
- [ ] Adjust thresholds based on usage
- [ ] Document lessons learned

### Success Metrics

**Thread Context Management:**
- Zero context loss incidents
- Smooth handoffs between sessions
- Consistent development progress

**Plan Adherence:**
- >90% adherence score maintained
- All deviations properly documented
- User approval for major changes

**Model Management:**
- Appropriate model selection 100%
- No strategic work done on Sonnet
- No routine work escalated to Opus unnecessarily

---

## Emergency Procedures

### Context Loss Recovery
```
1. Reconstruct state from git history
2. Read all recent documentation
3. Run full test suite
4. Identify last known good state
5. Resume from documented checkpoint
```

### Plan Recovery from Major Deviation
```
1. Stop all work immediately
2. Document current state
3. Assess damage/impact
4. Create recovery plan
5. Get user approval
6. Implement corrective measures
```

### Model Selection Error Recovery
```
1. Recognize inappropriate model use
2. Stop current approach
3. Switch to appropriate model
4. Re-approach problem correctly
5. Document lesson learned
```

---

**Status:** Ready for Implementation
**Priority:** Critical - Implement before resuming development
**Dependencies:** Team training and tool setup
**Review:** Weekly effectiveness assessment