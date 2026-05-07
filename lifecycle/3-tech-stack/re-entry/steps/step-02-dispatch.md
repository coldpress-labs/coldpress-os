---
step_number: 2
step_name: "Dispatch"
step_goal: "Invoke the target skill for the user's chosen path"
halts_for_input: false
next_step: null
---

## Goal

Route the user to the correct skill or step based on their menu selection. Each path is a minimal targeted invocation — not a full Phase 3 re-run.

## Instructions

### Path 1: Amend baselines

Invoke `stack-locking` — single-step re-invocation of **Step 5a only** (`step-05a-baselines-confirmation.md`).

- Open `stack-locking/steps/step-05a-baselines-confirmation.md` directly.
- Run the full per-category confirmation loop.
- After all 4 categories are confirmed/opted-out:
  - Build new baselines block
  - Overwrite `coldpress.yaml baselines:` block
  - Append new audit rows to `_context/audit/baselines-confirmations-{date}.md`
  - Update the Baselines section in `_context/sacred/tech-stack.md` (document remains sacred — only the baselines summary section is updated, not the lock status)
- Prompt user: "Baselines amended. Run env-provision to re-apply to tooling? [Y/N]"
  - Y: route to Path 3 (re-provision)
  - N: complete

### Path 2: Revise a specific ADR

Route to the governance change workflow: `governance/change-workflows/tech-stack.md`.

This is the required path for any change to a sacred document or locked stack decision. The governance workflow handles:
- Identifying the affected ADR
- Running the change-request process
- Updating `_context/sacred/tech-stack.md` via the sacred-doc amendment protocol
- Emitting a new versioned ADR

After governance workflow completes, prompt: "Stack decision revised. Re-provision environment? [Y/N]"
- Y: route to Path 3
- N: complete

### Path 3: Re-provision environment

Invoke `env-provision` from **Step 0** (`step-00-branch.md`).

- `stack_pack` from `coldpress.yaml` is authoritative — pack-branch or generic path is preserved from the original lock.
- Full provision sequence: step-00 → (pack quickstart or steps 1–3) → step-04-verify.

## Output

Target skill invoked. `step_2_complete: true`

## Navigation

→ Workflow complete for chosen path.
