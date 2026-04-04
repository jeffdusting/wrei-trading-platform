# Archive

This directory contains code and documentation archived during the post-P4 cleanup (5 April 2026).

These files are NOT part of the active codebase. They are retained for historical reference only.

## Contents

- `components/` — 35 orphaned UI components not imported by any active page or route
- `lib/` — 10 orphaned library files not imported by any active module
- `design-system/` — 1 unused theme file
- `hooks/` — 1 unused hook
- `docs/` — 46 stale markdown documents superseded by the WP1–WP7 architecture documents
- `review/` — 2 files flagged for manual review (may contain useful content)
- `__tests__/` — 12 test files that tested archived components/libraries

## Restoration

If any archived file is needed, move it back to its original location and update imports:
```bash
git mv _archive/components/[file] components/[file]
```

## Source

Archival decisions documented in:
- `DEPENDENCY_ANALYSIS.md` (dead code identification)
- `POST_IMPLEMENTATION_ASSESSMENT.md` (technical debt assessment)
