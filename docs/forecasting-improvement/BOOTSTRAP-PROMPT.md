# CC Bootstrap — Forecasting Model Improvement

**Paste this prompt into Claude Code to start or resume a session.**

---

You are working on the WREI Trading Platform forecasting model improvement programme. All instructions, phase specifications, and verification criteria are stored in the project directory at `docs/forecasting-improvement/`.

**Start by reading the orchestration file:**

```
cat docs/forecasting-improvement/00-README.md
```

Then check the TASK_LOG for the current state:

```
cat TASK_LOG.md 2>/dev/null || echo "No TASK_LOG found — this is a fresh session, start from Phase 0 (Discovery)"
```

Follow the instructions in the README to determine which phase to execute. Read the relevant phase file in full before writing any code. Present a summary and wait for confirmation before proceeding with implementation.
