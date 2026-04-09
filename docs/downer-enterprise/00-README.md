# WREI Enterprise Deployment — Downer Build Programme

**Session Model:** Claude Opus (`--model opus`)
**Permissions:** `--dangerously-skip-permissions`
**Working Directory:** Project root

## Context

This programme builds a Downer-branded enterprise deployment of the WREI platform using the Option B architecture (shared core, separate shell). The existing broker application is not modified except for one additive change to the white-label registry. A new Next.js application is created in the `enterprise/` directory.

Read `docs/downer-enterprise/WREI-Downer-Build-Plan.md` for the full architecture, module mapping, and database schema.

## Phase Sequence

| Phase | File | Objective |
|-------|------|-----------|
| D0 | `01-D0-DISCOVERY.md` | Map shared modules, identify import risks, establish build baseline |
| D1 | `02-D1-SCAFFOLD.md` | Create enterprise Next.js project, configure shared imports, verify build |
| D2 | `03-D2-SHELL.md` | Enterprise navigation, Downer branding, SSO middleware, intelligence page |
| D3 | `04-D3-ORIGINATION.md` | Pre-Validation Diagnostic Engine + Energy Cost Attribution Tool |
| D4 | `05-D4-PIPELINE.md` | Project Pipeline Kanban + Client Portfolio with entity hierarchy |
| D5 | `06-D5-PDF-VERIFY.md` | Branded PDF generation, forecast integration, end-to-end verification |

## Context Management

- Read TASK_LOG.md to determine current phase
- Read docs/downer-enterprise/SHARED_MODULE_MAP.md (created in D0) for import guidance
- The broker application must build successfully at every phase gate
- Only modify shared files (lib/, components/) when strictly necessary and verify broker build after
- One phase per session unless capacity permits continuing
