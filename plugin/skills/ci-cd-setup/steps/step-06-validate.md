---
step_number: 6
step_name: "Validate & Present"
step_goal: "Validate all generated configs and present final summary"
halts_for_input: true
next_step: "complete"
---

## Goal

Ensure all generated files are valid and present the complete setup to the user.

## Instructions

1. **Validate generated YAML** — Check syntax for all pipeline configs.

2. **Verify referenced secrets** — List all `${{ secrets.* }}` references and remind user to configure them.

3. **Verify referenced scripts** — Ensure all build/test/lint commands exist in package.json.

4. **Check build output paths** — Ensure deploy steps reference correct build output directories.

5. **Generate setup report** summarizing:
   - Files created (with paths)
   - Required secrets to configure
   - Pipeline triggers and behavior
   - Next steps for the user

6. **Present to user** with the complete summary.

## User Interaction

Present final report. Ask if any adjustments are needed.

## Output

Setup report at `_context/audit/ops/ci-cd-setup-{date}.md`. Mark workflow complete.

## Navigation

→ Workflow complete.
