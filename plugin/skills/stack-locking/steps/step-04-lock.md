---
step_number: 4
step_name: "Sacred Lock"
step_goal: "Validate → lock tech-stack.md as sacred → write stack_pack + baselines to coldpress.yaml → validate baselines block"
halts_for_input: true
next_step: "step-05-phase-transition.md"
---

## Goal

Execute the sacred lock with the exact ordered sub-steps below. **Sub-step ordering is load-bearing (R4-5):** validate-schema fires before `sacred: true` is written. A failed validation after sacred-lock would permanently lock an invalid document. Never reorder.

## Sub-Step Sequence

### Sub-step 1: validate-schema (MUST be first)

Run `validate-schema` on `_context/sacred/tech-stack.md` against `schemas/sacred-docs/tech-stack.schema.json`.

**If schema validation fails:** HaltError — do NOT proceed to sub-step 2. Report the validation errors. User must fix the document, then re-run from sub-step 1.

> Schema validation failed for tech-stack.md: {error details}
> Please review and fix the listed fields, then re-run `stack-locking`.

### Sub-step 2: Write `sacred: true` + approver + lock notice

Only after sub-step 1 passes:

1. Update `_context/sacred/tech-stack.md` frontmatter:
   ```yaml
   sacred: true
   approved_by: "user"
   lock_date: "{ISO timestamp}"
   ```
2. Add a lock notice at the top of the document body:
   ```
   > **SACRED DOCUMENT.** This tech stack is locked. Changes require revisiting the relevant ADR(s) and running the governance change-workflow at `governance/change-workflows/tech-stack.md`.
   ```
3. Update `status: "final"`.

Present to user:

> **Tech stack locked.** `_context/sacred/tech-stack.md` is now sacred.
>
> Any future changes require the `governance/change-workflows/tech-stack.md` process. Proceed?

Wait for confirmation.

### Sub-step 3: Write `stack_pack` + `baselines:` to `coldpress.yaml`

Check the confirmed pack from stack-discovery-sync:
- If user confirmed a pack: `stack_pack: "{pack_name}"` (e.g., `"vibe-coder-fullstack"`)
- If no pack confirmed / user skipped packs: `stack_pack: ""` (explicit empty string — means "no pack, generic env-provision path")

Write `stack_pack` field to `coldpress.yaml`.

Write the `baselines:` block prepared in Step 5a to `coldpress.yaml`.

If `coldpress.yaml` write fails (disk/permissions): HaltError.
> Cannot write to `coldpress.yaml`. Check permissions: `ls -la coldpress.yaml`

### Sub-step 4: Validate baselines block

Run `validate-schema` on the `baselines:` block from `coldpress.yaml` against `schemas/baselines.schema.json`.

**If validation fails:** HaltError with error details. The baselines block is malformed; user must fix and re-run from sub-step 3.

### Sub-step 5: Handle supersessions

If tech-stack.md has any `supersedes:` entries:
- Confirm supersede audit rows exist in `_context/audit/supersessions-{date}.md` for each superseded item
- If missing: write the row now (append-only, format per `docs/supersessions-log-spec.md`)
- Emit `supersedes:` frontmatter on `stack-selection-summary-v{N}.md` as well

### Sub-step 6: Mark stack-selection-summary as final

Update `_context/planning/stack-selection-summary-v{N}.md` frontmatter `status: "final"`. Run `validate-schema` against distillate schema.

## Output

`tech-stack.md` locked as sacred. `coldpress.yaml` `stack_pack` + `baselines:` written and schema-valid. `step_4_complete: true`

## Navigation

→ Proceed to [step-05-phase-transition.md](step-05-phase-transition.md)
