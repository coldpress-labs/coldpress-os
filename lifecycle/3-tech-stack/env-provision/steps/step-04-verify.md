---
step_number: 4
step_name: "Verify Setup"
step_goal: "Run build, lint, test; run baseline checks; report results; write env-provision tracking doc"
halts_for_input: true
next_step: null
---

## Goal

Prove that core tooling and activated baselines are wired up correctly. Baseline check failures are reported but do not block provision — the Phase 7 deploy gate is where block-severity baseline checks fire.

This step runs for both the pack path (after pack quickstart completes) and the generic path.

## Instructions

### 1. Core checks

1. **Run lint** — `pnpm run lint` or equivalent. Fix configuration issues if any.
2. **Run format check** — `pnpm run format:check`. Confirm no conflicts.
3. **Run build** — `pnpm run build` or equivalent. Confirm compilation succeeds.
4. **Run tests** — `pnpm test` or equivalent. Even if no tests exist, confirm the test runner is wired up.
5. **Verify git hooks** — stage a test file and confirm `.husky/pre-commit` fires lint-staged.

### 2. Baseline checks

For each confirmed baseline category (skip opted-out):

| Category | Check to run | Pass condition |
|----------|-------------|----------------|
| `seo_aeo_llm` | File presence: `public/llms.txt`, `public/robots.txt` | Both files present |
| `accessibility` | `eslint --rule 'jsx-a11y/...'` on a sample component | Zero a11y lint errors |
| `security` | `npm audit --audit-level=high` | Zero high/critical advisories |
| `future_proof` | Verify `tsconfig.json` has `strict: true` + `target` set | Fields present |

Baseline check failures: record in tracking doc but proceed — do NOT abort provision.

### 3. scan-secrets

Run `detect-secrets scan` (or installed equivalent) on the project root. If any secrets detected: surface as a warning; do NOT commit until resolved. This fires regardless of baseline opt-in status.

### 4. Write env-provision tracking doc

Write `_context/tracking/env-provision-{date}.md`:

```markdown
---
date: {ISO timestamp}
stack_pack: "{pack_name or empty}"
---

## Core Checks
| Check | Status |
|-------|--------|
| lint | {pass/fail} |
| format | {pass/fail} |
| build | {pass/fail} |
| test | {pass/fail} |
| git hooks | {pass/fail} |

## Baselines Activated
| Category | Status | Notes |
|----------|--------|-------|
| seo_aeo_llm | {confirmed/opted-out} | {check result or skipped} |
| accessibility | {confirmed/opted-out} | {check result or skipped} |
| security | {confirmed/opted-out} | {check result or skipped} |
| future_proof | {confirmed/opted-out} | {check result or skipped} |
```

### 5. Report to user

> **Environment provision complete.**
>
> Core: lint ✓ / format ✓ / build ✓ / test ✓ / hooks ✓
>
> Baselines activated: {list confirmed categories}
> Baselines skipped: {list opted-out categories}
>
> {If any baseline check failed}: ⚠ Baseline check issues noted in `_context/tracking/env-provision-{date}.md`. These will be enforced at Phase 7 deploy gate.
>
> Manual steps remaining: fill in `.env` values for: {list env vars from .env.template}.
>
> Phase 3 is complete. Ready to proceed to Phase 4: Planning.

## Output

Setup verified; tracking doc written; project ready to code. `step_4_complete: true`

## Navigation

→ Workflow complete. Phase 3 done. Proceed to Phase 4: Planning.
