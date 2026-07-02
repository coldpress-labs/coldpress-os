---
step: 1
name: "Detect + Confirm"
skill: legacy-assessment
agent: architect
---

# Step 1 — Detect + Confirm

## Purpose

Enumerate the contents of `_input/legacy/` and present the file/folder tree to the user before committing to any assessment work. Give the user the option to skip (deferred assessment) before any work begins.

---

## Actions

### 1.1 List `_input/legacy/`

Scan `_input/legacy/` recursively. For each top-level module (folder or file), record:
- Name / path
- File types present (inferred from extensions)
- Approximate size (line count or file count for directories)

Present as a tree view:

```
_input/legacy/
├── auth-module/          (TypeScript, ~320 files)
├── legacy-db-schema.sql  (SQL, 1 file)
└── components/           (JavaScript, ~45 files)
```

If `_input/legacy/` is empty or doesn't exist: write `skipped: no legacy files` to `_sandbox/legacy-manifest.md` and exit cleanly. Inform the user that `legacy-assessment` will re-run automatically when files are added.

### 1.2 Check for prior assessment (idempotent path)

Query graph for any prior legacy-assessment run nodes. If prior run found:

- Display prior decisions summary: `[module]: [decision] (assessed [date])`
- Offer: "Re-assess all modules" (full re-run) or "Assess only new/changed files" (incremental)

If no prior run: proceed as fresh assessment.

### 1.3 Confirm with user

Present:

```
Found [N] module(s) in `_input/legacy/`:
  [module list from 1.1]

Do you want to assess these for migration against your locked tech stack?
  Y — Start assessment
  N — Skip for now (deferred: you can run `@architect legacy-assessment` at any point)
```

If `N`: record `legacy_assessment_deferred: true` in the current session's `planning-scope` if it exists; write a `deferred` entry to `_sandbox/legacy-manifest.md`; exit cleanly.

---

## Output

- `_sandbox/legacy-manifest.md` — created or updated with `status: detected` for each module (on confirmation) or `status: deferred` (on skip).

---

## Mark partial-completion

Write `partial_completion: { skill: "legacy-assessment", step_id: "step-01", status: "in_progress" }` to `.coldpress/local-config.yaml` at start. Clear on clean exit.
