# WREI Forecasting Model Improvement Programme

**Session Model:** Claude Opus (`--model opus`)
**Permissions:** `--dangerously-skip-permissions` with `.claude/settings.json`
**Working Directory:** Project root
**Programme Version:** 2.0 — 6 April 2026

---

## Programme Overview

This programme improves the WREI Trading Platform's ESC price forecasting system across eight phases (P0–P4, with P2 split into four sub-phases). Each phase has its own specification file in this directory. Phases must be executed in order — each depends on the outputs of the prior phase.

## Context Preamble

You are working on the WREI Trading Platform, a Next.js 14 application deployed on Vercel at wrei.cbslab.app. The platform is an ESC (Energy Savings Certificate) and environmental certificate trading platform with a Bloomberg Terminal-style UI, AI negotiation engine, and market intelligence subsystem.

This programme focuses exclusively on the Python forecasting subsystem located in `forecasting/` and its integration points with the TypeScript application. The forecasting system produces weekly ESC price forecasts at 1w, 4w, 12w, and 26w horizons using a three-model ensemble (Bayesian state-space Kalman filter, bounded Ornstein-Uhlenbeck Monte Carlo, XGBoost walk-forward ML). Forecasts drive procurement timing recommendations, client intelligence reports, and trade decision analysis.

**You must not modify any TypeScript files outside the forecasting integration points unless explicitly instructed.** The broader platform has its own remediation programme.

## Phase Sequence

| Phase | File | Objective | Depends On |
|-------|------|-----------|------------|
| P0 | `01-P0-DISCOVERY.md` | Read all files, write persistent discovery summary | Nothing |
| P1 | `02-P1-FOUNDATION.md` | Fix data integrity (penalty rates, training data, features, HMM, backtesting) | P0 confirmed |
| P2-A | `03-P2A-SCRAPERS.md` | New source scrapers + base dataclass | P1 gate passed |
| P2-B | `04-P2B-INGESTION.md` | Document ingestion pipeline + SQLite schema | P2-A gate passed |
| P2-C | `05-P2C-SIGNALS.md` | Enhanced AI signal extractor | P2-B gate passed |
| P2-D | `06-P2D-INTEGRATION.md` | Wire signals into models + pipeline orchestration | P2-C gate passed |
| P3 | `07-P3-ENHANCEMENTS.md` | Volume forecast, forward curve, ensemble transparency, shadow market | P2-D gate passed |
| P4 | `08-P4-REGRESSION.md` | Full regression test, comparison report, acceptance criteria | P3 gate passed |

## Context Management — CRITICAL

### Rule 1: Persistent Discovery Summary

Phase 0 writes a structured summary to `forecasting/analysis/DISCOVERY_SUMMARY.md`. This file persists on disk across sessions.

**Every subsequent phase MUST start by reading the discovery summary from disk rather than re-reading all source files:**

```bash
cat forecasting/analysis/DISCOVERY_SUMMARY.md
```

**Only re-read a specific source file when you need to modify it.** Do not re-read files for general context — the discovery summary provides that.

### Rule 2: Commit Before Capacity

If you estimate you are within 20% of context capacity — based on the volume of code you have read and generated in this session — **stop immediately and follow the session close procedure:**

1. Commit all current work: `git add -A && git commit -m "[phase]: partial progress — [what was completed]"`
2. Update TASK_LOG.md with what was completed and what remains
3. Report to the operator: "Approaching context limit. Committed at [description]. Resume from TASK_LOG."

Do not attempt to complete a task if you are unsure you have enough context remaining. A clean partial commit is always better than an incomplete or corrupted implementation.

### Rule 3: One Phase per Session as Default

Assume each phase (or sub-phase) is one CC session. If a phase completes with context to spare, you may proceed to the next phase — but only after the gate verification for the completed phase has passed.

### Rule 4: Targeted File Reading

When you need to modify a file:
1. Read only that file (not its neighbours)
2. If the file exceeds 800 lines, read the first 300 and last 300 lines, then read specific sections as needed
3. Never read a file you have already read in this session — use your existing context

## Session Management

### Determining Current Phase

1. Read `TASK_LOG.md` in the project root
2. Find the most recent entry — it states which phase was completed and what to read next
3. If no TASK_LOG exists, start from Phase 0 (Discovery)

### Cross-Session Continuity

At the end of every phase (or if approaching context limits):

1. Complete the current gate verification (or note where you stopped)
2. Commit and tag: `git add -A && git commit -m "[phase description]" && git tag [tag-name]`
3. Update TASK_LOG.md with the template below
4. Stop and report status

### TASK_LOG.md Entry Template

```markdown
## Forecasting Model Improvement — [Phase Name]
**Date:** [timestamp]
**Status:** COMPLETE / PARTIAL / BLOCKED
**Git Tag:** [tag name]

### Tasks Completed
- [List with file citations]

### Tests Run
- [Pass/fail summary]

### Known Issues
- [Any issues discovered during implementation]

### Next Phase
- Read `docs/forecasting-improvement/[next phase file]`
- Prerequisites: [what must be true before starting]
```

## Constraints

- **File size discipline:** No single Python file should exceed 500 lines. Decompose if approaching this limit.
- **Targeted reading:** Never read a file exceeding 800 lines in full. Read first 300 and last 300, plus specific sections as needed.
- **Error isolation:** Each pipeline stage must be wrapped in try/except. No single component failure should crash the entire pipeline.
- **AI cost control:** Maximum 30 Claude API calls per pipeline run for signal extraction.
- **No TypeScript changes** outside the explicit integration points listed in each phase file.

## Architecture Documents

If you need platform context beyond the forecasting system, the following architecture documents are available:

```
docs/architecture/01-EXECUTIVE-SUMMARY.md
docs/architecture/03-SYSTEM-FUNCTIONAL-ARCHITECTURE.md
docs/architecture/04-TECHNICAL-ARCHITECTURE.md
docs/architecture/10-SYSTEM-SPECIFICATION.md
```

Read these only if needed for integration decisions. The discovery summary and phase files contain all necessary detail for the forecasting work.
