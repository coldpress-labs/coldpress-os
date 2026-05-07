---
name: legacy-assessment-workflow
skill: legacy-assessment
phase: 4
steps: 6
agent: architect
---

# legacy-assessment — Workflow

> 6-step workflow. Idempotent — re-runnable when new files arrive in `_input/legacy/`.

## Steps

| Step | File | Name | Summary |
|------|------|------|---------|
| 1 | [step-01-detect-confirm.md](steps/step-01-detect-confirm.md) | Detect + Confirm | List `_input/legacy/` tree; confirm with user before starting assessment |
| 2 | [step-02-module-assessment.md](steps/step-02-module-assessment.md) | Module Assessment | Identify tech + dependencies for each module; compare against `tech-stack.md`; classify compatible / conflicting / unknown |
| 3 | [step-03-conflict-resolution.md](steps/step-03-conflict-resolution.md) | Conflict Resolution | Present each conflict with resolution table; resolve before proceeding; lightweight ADR amendment or full Phase 3 re-entry |
| 4 | [step-04-migration-decisions.md](steps/step-04-migration-decisions.md) | Migration Decisions | Assign keep / refactor / scaffold / reference to each module; record decision + rationale |
| 5 | [step-05-copy-sandbox.md](steps/step-05-copy-sandbox.md) | Copy to `_sandbox/` | Copy modules to `_sandbox/legacy/{decision}/{module}/`; write/update `legacy-manifest.md` |
| 6 | [step-06-output-graph.md](steps/step-06-output-graph.md) | Output + Graph Update | Write `legacy-migration-plan-v{N}.md`; update graph; signal completion + route back to caller |

## Entry conditions

- `_context/sacred/tech-stack.md` exists (`sacred: true`)
- `coldpress.yaml` exists
- `_input/legacy/` is non-empty

## Exit conditions

- `_sandbox/legacy-manifest.md` written (one entry per module)
- `_context/planning/legacy-migration-plan-v{N}.md` written + schema-validated
- Graph updated with legacy module nodes (decision + rationale annotations)
- Completion signal sent to calling context (planning-entry-sync / create-prd / user-manual)

## Resume behaviour

If interrupted, Butler resumes at the last incomplete step via `partial_completion` marker in `.coldpress/local-config.yaml`. Steps 1–4 are idempotent. Step 5 skips already-copied modules. Step 6 increments the version number if prior output exists and decisions changed.
