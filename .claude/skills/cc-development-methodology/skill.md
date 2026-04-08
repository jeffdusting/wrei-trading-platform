---
name: cc-development-methodology
description: "Structured Claude Code (CC) development methodology for implementation programmes. Use this skill whenever the user asks you to plan, design, or produce CC prompts for any development work that Claude Code will execute — including platform builds, model improvements, feature programmes, refactoring, data pipelines, or any technical implementation. Also trigger when the user mentions 'CC prompt', 'Claude Code session', 'implementation plan', 'phase plan', 'CC project', or asks you to produce structured development instructions for CC. This skill covers both multi-session programmes (file-on-disk architecture with cross-session continuity) and single-session work (lightweight prompt with discovery and verification). It also defines the full development cycle: assess, plan, execute, verify, critique, advance. Use this skill even for seemingly simple CC tasks — the lightweight variant adds minimal overhead and prevents common failures."
---

# CC Development Methodology

## Overview

This skill defines a structured methodology for planning and executing Claude Code (CC) development work. It separates strategic planning (done in Claude chat) from code execution (done in CC), and ensures CC sessions are self-directing, self-verifying, and require zero manual intervention.

The methodology operates at two scales: a **lightweight variant** for single-session work, and a **full programme** for multi-session implementation. Both share the same core principles.

---

## Core Principles

These apply to every CC prompt, regardless of scale.

### 1. Strategic Planning in Chat, Execution in CC

Claude chat produces the architecture, specifications, and phase decomposition. CC executes against those specifications. CC should never make strategic decisions — it reads a spec and implements it. If CC encounters an ambiguity, it logs it and continues with the most conservative interpretation rather than guessing or asking the operator.

### 2. Zero Manual Intervention

Every CC session must execute from start to finish without the operator performing any manual steps. CC installs its own dependencies, creates its own test infrastructure, runs its own verification, executes its own data gathering (scraping, downloading, backfilling), and commits its own output. CC does NOT create scripts "for the operator to run later," does NOT stop to ask for confirmation mid-session (except at discovery phase confirmation points), and does NOT defer work to the operator that CC can do itself.

### 3. Never Defer What Can Be Automated

If data is publicly available, CC scrapes it. If facts need verification, Claude chat searches for them before embedding them in the prompt. If tests need to run, CC runs them. If dependencies need installing, CC installs them. The operator's role is to paste the bootstrap and review outcomes — nothing else. Any instruction that says "the operator should verify this" or "run this manually after reviewing" is a methodology failure.

### 4. Verify Before You Specify

Claude chat must verify all factual assumptions (penalty rates, API endpoints, data formats, pricing, dates, regulatory references) against authoritative sources using web search before embedding them in CC prompts. Do not pass unverified values to CC. Do not ask the operator to verify things that Claude can check. If a value cannot be verified, instruct CC to source it from the authoritative reference at execution time and flag the result for operator review.

### 5. Context Is the Constraint

CC has a finite context window. Every file CC reads consumes context that cannot be recovered. The methodology manages this through persistent discovery summaries (written to disk, read in later sessions instead of re-reading source files), targeted file reading (only read files being modified), and phase sizing that fits within a single session.

---

## The Full Development Cycle

The complete methodology is a six-stage cycle. Not every project requires all stages, but Claude chat should be aware of the full cycle and apply the relevant stages.

```
ASSESS → PLAN → EXECUTE → VERIFY → CRITIQUE → ADVANCE
  ↑                                                 |
  └─────────────────────────────────────────────────┘
```

### Stage 1: Assess

Before producing any CC prompts, understand the current state. This may involve producing a CC discovery prompt (see §Discovery Phase) to gather codebase data, reviewing the output, and producing a structured assessment document identifying defects, risks, opportunities, and dependencies. The assessment drives the plan — do not skip to planning without understanding what exists.

### Stage 2: Plan

Decompose the work into phases, size each phase to fit a single CC session, define gate criteria, and produce the file-on-disk prompt set (full programme) or a single prompt (lightweight). The plan must account for findings from the assessment — if the assessment reveals that a prior assumption was wrong (e.g., training data is all synthetic, not partially genuine), the plan must address the actual state, not the assumed state.

### Stage 3: Execute

The operator pastes the bootstrap (full programme) or the prompt (lightweight). CC reads, implements, verifies, and commits. If CC reports findings that change the plan (e.g., discovery reveals missing infrastructure), Claude chat updates subsequent phase specs before the operator runs them.

### Stage 4: Verify

After implementation, run a fresh CC session as an independent auditor. The verification session has explicit instructions to find problems, not fix them. It checks structural integrity (file existence, imports, tests), data integrity (cross-file consistency, correct values), and behavioural correctness (model outputs, pipeline execution, edge cases). The output is a verification report with a verdict: PASS, PASS WITH CAVEATS, or FAIL.

### Stage 5: Critique

After verification, produce an adversarial review examining the work product from a hostile perspective — an investment banker during due diligence, a competitor's engineer, a regulator looking for overreach. Each critique point is specific, evidence-based, and maps to a concrete advancement item. The critique is a document, not a conversation — it should be referenceable.

### Stage 6: Advance

Based on the critique, produce the next programme: remediation items, new capabilities, expanded scope. The advancement plan includes its own CC session prompts, following the same methodology. The cycle repeats.

---

## Lightweight Variant (Single-Session)

Use the lightweight variant when the work fits in one CC session: fewer than 8 files modified, fewer than 500 lines of new code, no cross-session dependency.

### Lightweight Prompt Structure

```
You are working on [project]. Read context:
  cat [discovery summary or relevant config files]
  cat [any specific file CC needs for orientation]

This session [objective]. Complete ALL tasks. Do not stop for confirmation.

TASK 1: [Name]
[Specific instructions with file paths]

TASK 2: [Name]
[...]

VERIFICATION:
  [test suite execution]
  [specific checks — each prints PASS/FAIL]
  [build verification if applicable]

COMMIT:
  git add -A && git commit -m "[description]"
  [Update TASK_LOG.md if one exists from a prior programme]
```

### Lightweight Rules

The lightweight variant preserves the core principles in compressed form:

1. **Discovery preamble.** The first lines read context files. If a discovery summary exists from a prior programme, CC reads it instead of source files.
2. **All tasks specified.** No ambiguity, no strategic decisions for CC.
3. **Automated verification.** Every prompt ends with a verification block that CC executes. Checks print PASS or FAIL.
4. **Commit at the end.** CC commits its own work.
5. **No manual steps.** CC installs dependencies, runs tests, executes data gathering.
6. **No confirmation stops.** CC runs straight through.

### When to Upgrade to Full Programme

Upgrade from lightweight to full programme if during planning you find any of the following: the work requires more than one CC session, later tasks depend on earlier tasks being correct (gate dependency), the operator will run sessions across multiple days, or the scope expands during planning to exceed the lightweight thresholds.

---

## Full Programme

### File Architecture

All CC prompts are stored as files in the project directory. CC reads them from disk. This is more reliable than pasting because large prompts exceed terminal paste buffers, files persist across sessions, the TASK_LOG can reference phase files by path, and phase files are version-controlled alongside the code.

```
docs/{programme-name}/
  00-README.md              ← Context preamble, phase table, session rules
  01-P0-DISCOVERY.md        ← Discovery phase (always first)
  02-P1-{NAME}.md           ← Phase 1 specification
  03-P2A-{NAME}.md          ← Sub-phase (if phase was split)
  ...
  BOOTSTRAP-PROMPT.md       ← Short text the operator pastes into CC
  {PLAN-DOCUMENT}.md        ← Strategic plan (optional, operator reference)
```

### Bootstrap Prompt

The bootstrap is the only text the operator pastes. It is identical for every session:

```markdown
You are working on [project]. Instructions are in `docs/{programme-name}/`.

cat docs/{programme-name}/00-README.md
cat TASK_LOG.md 2>/dev/null || echo "No TASK_LOG — start from Phase 0"

Follow the README to determine which phase to execute.
Read the phase file in full before writing any code.
Execute all tasks without stopping for confirmation.
```

### README Contents

The README contains everything CC needs to orient itself in any session: context preamble (2–3 paragraphs describing project and constraints), phase sequence table with dependencies, context management rules (persistent discovery summary path, commit-before-capacity rule, one-phase-per-session default, targeted file reading), and constraints (file size limits, error isolation, dependency rules).

### Phase File Contents

Each phase file is self-contained. It states prerequisites, points to the discovery summary for context, lists tasks with file paths and expected behaviour, includes the gate verification script, defines the archive point (commit + tag), and provides the TASK_LOG entry template with the "Next Phase" instruction pointer.

---

## Discovery Phase

Every programme starts with discovery. Its purpose is to read the codebase, assess the current state, and write a persistent summary to disk.

### Discovery Rules

1. **No code changes.** Discovery reads and reports only.
2. **Write to disk.** The summary is a committed markdown file: `{subsystem}/analysis/DISCOVERY_SUMMARY.md`. It is NOT a chat message — it persists across sessions.
3. **Structured output.** File inventory with line counts, architecture state, configuration values, data integrity flags, test coverage, and dependencies.
4. **Operator confirmation.** Discovery is the one phase where CC waits for confirmation. The operator reviews the summary and may adjust subsequent phases based on findings.

### Execution Feedback Loop

When CC's discovery (or any phase) reports findings that change the plan, Claude chat must update subsequent phase specifications before the operator runs them. The plan is living, not static. Examples from practice: P0 discovers all training data is synthetic → rewrite P1 data quality task from "segregate synthetic vs genuine" to "flag everything as synthetic and prepare for genuine data arrival." P0 discovers zero test coverage → add test infrastructure setup as the first task in P1.

---

## Phase Sizing and Splitting

### Sizing Rules

Each phase must fit in a single CC Opus session. The constraints are:

| Factor | Guideline |
|--------|-----------|
| Source files to read | Maximum 8–10 per session (fewer if files are large) |
| Files to create or modify | Maximum 6–8 per session |
| New code lines | Maximum 400–600 lines per session |
| Context budget for reading | Budget 30% of context for discovery summary + phase spec + source files |

### When to Split

Split a phase into sub-phases (P2-A, P2-B, etc.) when it would require CC to read more than 10 source files, modify more than 8 files, or generate more than 600 lines of new code. Each sub-phase gets its own gate verification, commit point, and TASK_LOG entry. Sub-phases are independently resumable — if CC hits context limits between P2-B and P2-C, the work from P2-A and P2-B is already committed.

### Splitting Heuristic

Group related files into sub-phases by dependency: files that must be modified together (because one imports from the other, or they share a data structure) belong in the same sub-phase. Files that are independent (new scrapers that don't depend on each other) can be split arbitrarily.

---

## Cross-Session Continuity

### TASK_LOG.md

The TASK_LOG is the single source of truth for programme progress. It lives in the project root and CC reads it at the start of every session.

1. **CC writes the TASK_LOG.** The phase spec includes the exact template.
2. **Every commit updates the TASK_LOG.** Even partial completions get an entry.
3. **The "Next Phase" field is the instruction pointer.** CC reads it to know what to do.
4. **The TASK_LOG is committed to git** and persists across sessions.

### Context Management Rules

These rules appear in every README and CC must follow them:

1. **Read the discovery summary, not source files.** Every phase after P0 reads the persistent discovery summary for context. Source files are only read when being modified.
2. **Commit before capacity.** If CC estimates it is within 20% of context capacity, it stops immediately: commits current work, updates TASK_LOG with what was completed and what remains, and reports to the operator.
3. **One phase per session as default.** If a phase completes with context to spare and all gates pass, CC may proceed to the next phase.
4. **Never re-read.** Files read earlier in the same session are already in context. Do not read them again.

---

## Gate Verification

Every phase ends with automated verification. Gates confirm the phase's work is correct and establish preconditions for the next phase.

### Gate Rules

1. **Gates are bash scripts** that CC runs inline.
2. **Each check prints PASS or FAIL** with diagnostic detail.
3. **All gates must pass** before the next phase starts.
4. **Gates test behaviour, not implementation** — check that the function returns the right output, not that a specific line of code exists.
5. **Include the full test suite** — every gate ends with `python -m pytest --tb=short -q` (or equivalent) to catch regressions.
6. **Include build verification** if the project has a build step (`npm run build`, `npx tsc --noEmit`).

---

## Independent Verification

After implementation is complete, produce a verification CC prompt designed for a fresh session with no prior context. The verification session is an auditor, not a developer — its instructions are to find problems, not fix them.

### Verification Structure

1. **Structural integrity** — file existence against expected list, import chain (every module imports cleanly), test suite execution, build pass.
2. **Data integrity** — cross-file consistency of critical values (verified in at least three locations), correct data flags, source attribution.
3. **Behavioural correctness** — pipeline execution (end-to-end with mock data if external services unavailable), edge cases (boundary conditions, empty inputs, error paths), output sanity checks (economic plausibility, constraint enforcement).
4. **Verification report** — committed to the repo as `{subsystem}/analysis/VERIFICATION_REPORT.md` with a numbered issue list and a verdict: PASS, PASS WITH CAVEATS, or FAIL.

---

## Adversarial Critique

After verification, produce a black hat critique document examining the work product from hostile perspectives. Each critique must be specific, evidence-based, and actionable.

### Critique Perspectives

Choose perspectives relevant to the project. Common perspectives include: investment banker (due diligence on claims and metrics), competitor's engineer (technical weaknesses and scalability limits), regulator (compliance gaps and overreach), end user (usability failures and misleading outputs), data scientist (statistical validity and methodology flaws).

### Critique-to-Advancement Mapping

Every critique point must map to a concrete advancement item with estimated effort, impact, and dependency. The mapping table is explicit: "Critique §2.1 (synthetic validation) → Advancement §5.1.2 (genuine data backfill), Weeks 1–2." This ensures the critique is actionable, not merely observational.

---

## Git Discipline

### Commit Points

Every completed phase commits: `git add -A && git commit -m "P{N}: {description}"`. Every partial phase (context limit) commits: `git add -A && git commit -m "P{N}: partial — {what completed}"`. CC never proceeds to the next phase without committing.

### Tags

Each phase has a defined tag: `git tag {programme}-{phase}-{name}`. Tags are archive points — if a later phase corrupts work, the operator can roll back.

---

## Common Patterns

### Dependency Installation

CC installs its own dependencies as the first step of any phase that needs them. For Python: `pip install {package} --break-system-packages`. For Node: `npm install {package}`. Do not assume the operator has installed anything.

### Test Infrastructure from Scratch

If discovery finds no test framework: install it, create the directory structure, create conftest/setup files with shared fixtures, write minimum viable tests for existing functionality, and verify the suite passes — all within the first implementation phase, not as a separate phase.

### Large Files

If a file exceeds 800 lines: read the first 300 and last 300, then read specific sections by line range as needed. Never read a large file in full.

### External Service Unavailability

If a phase requires an external service (API, database, registry) that is unavailable: code must degrade gracefully (try/except, fallback mode), tests must run in mock mode, the phase still completes and commits. Unavailability is logged in the TASK_LOG known issues, not treated as a blocker.

### Data Gathering and Backfill

If the project needs historical data that is publicly available, CC scrapes it, stores it, and validates it — in the same session, not as a deferred manual step. Historical scraper methods, backfill orchestration, cross-validation between sources, and data assembly updates are all CC tasks. The operator does not run backfill scripts.

---

## Producing the Prompt Set

When producing CC prompts, deliver the following:

1. **Assessment document** (if scope warrants) — identifies defects, risks, opportunities. Stays in chat or saved as an artefact.
2. **File set** — README, bootstrap, phase files, stored in `docs/{programme-name}/`.
3. **Setup instruction** — one line: "Copy `{programme-name}/` to `docs/{programme-name}/` in the project directory. Paste the bootstrap."

Do not produce a single monolithic prompt for multi-session work. Do not produce prompts that require pasting. Do not produce prompts that stop for confirmation (except discovery). Do not produce prompts that defer executable work to the operator.

For lightweight (single-session) work, produce a single prompt that the operator pastes directly into CC, following the lightweight structure defined above.
