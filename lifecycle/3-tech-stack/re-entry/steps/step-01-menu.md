---
step_number: 1
step_name: "Re-entry Menu"
step_goal: "Surface the 3 valid post-lock paths and wait for user choice"
halts_for_input: true
next_step: "step-02-dispatch.md"
---

## Goal

Phase 3 is complete. Present the available post-lock revision paths without re-running the full Phase 3 flow.

## Instructions

### 1. Confirm lock state

Read `coldpress.yaml`. Confirm `phase_3_completed: true`. If missing or false: this router should not have been invoked — HaltError:
> `re-entry` requires `phase_3_completed: true`. Run Phase 3 first.

### 2. Present menu

> **Phase 3 is complete.** What would you like to revise?
>
> 1. **Amend baselines** — Change which baseline categories are active (confirmed / opted-out / overrides). Produces a new audit row; rewrites `coldpress.yaml baselines:` block. Does NOT require re-running env-provision unless you want to re-apply changes to tooling.
>
> 2. **Revise a specific ADR** — Change a locked stack decision. Routes through the governance change workflow (`governance/change-workflows/tech-stack.md`). Required for any sacred-doc change.
>
> 3. **Re-provision environment** — Re-run env-provision from Step 0 (pack-branch preserved from locked `stack_pack`). Use this after amending baselines or if the environment needs to be rebuilt.

Wait for user input.

## Output

User path selected. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-dispatch.md](step-02-dispatch.md)
