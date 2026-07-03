---
step_number: 3
step_name: "Emit the readiness report + SBOM"
step_goal: "Compile the scripted checklist into the schema'd readiness report the deploy-gate reads"
halts_for_input: true
next_step: "complete"
---

## Instructions

1. **Compile the checklist results** into the readiness report at
   `_context/audit/readiness-v{N}.md` (validates against
   `schemas/audit/readiness.schema.json`), with the emitted **SBOM** attached to
   the release record.
2. **Issue the verdict** — `ready` (every check green) / `blocked` (≥1 block-severity FAIL). List every failing check with its findings, not just the first.
3. **This report is the precondition the `deploy-gate` hook reads** before `deploy-prod`. A `blocked` verdict means no production deploy until the named checks pass.
4. **Present to the user** — green readiness → the wave may `deploy-staging`; post-deploy `smoke` + the release record are separate skills.

## Output

`_context/audit/readiness-v{N}.md` (schema'd) + SBOM. Verdict issued. Workflow complete.

## Navigation

→ Workflow complete. If `ready` → `deploy-staging`; production deploy still passes through the `deploy-gate`.
