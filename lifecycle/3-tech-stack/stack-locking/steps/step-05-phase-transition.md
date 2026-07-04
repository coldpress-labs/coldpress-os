---
step_number: 5
step_name: "Phase Transition + Exit Hook"
step_goal: "Invoke phase-transition cross-cutting skill; prompt user to run post-phase-3 CLI hook"
halts_for_input: true
next_step: null
---

## Goal

Close out Phase 3 cleanly. Invoke `phase-transition` (Part 2 cross-cutting skill) for gate-check and handoff log. Then prompt the user to run the Phase 3 exit hook CLI command.

## Instructions

### 1. Run Phase 3 gate — Stage 1

Invoke `evaluate-phase-gate --stage 1` for Phase 3. This checks the 10 Stage 1 gate checks (everything except `env-provisioned`, `post-phase-3-update-ran`, `graph-freshness` — those are Stage 2).

If any Stage 1 block check fails: HaltError with the specific check details. Resolve before proceeding.

Warn checks surface as informational — proceed.

### 2. Invoke `phase-transition` (Part 2 cross-cutting skill)

Run `skills/governance/phase-transition/` workflow:
- Step 1: Gate check pass (Stage 1 already ran above — confirm pass)
- Step 3a: Distillate regen check — if `stack-selection-summary-v{N}.md` or `product-brief-v{N}.md` upstream artefacts changed since last regen, prompt regen
- Step 4: Write `_context/handoffs/phase-3-to-4-{date}.md` — summarise Phase 3 outputs for Phase 4 consumption

If handoff log write fails: HaltError. Handoff log is a required warm-handoff input for Phase 4.

### 3. Phase 3 exit hook prompt

> **Phase 3 stack lock is complete.** Before we start `env-provision`, please run this command in your terminal:
>
> ```
> coldpress update --post-phase-3
> ```
>
> This regenerates stack-specific skill wrappers and re-verifies your tools for the locked stack. I'll wait for you to return.

Halt and wait for user to return.

On next turn: read `.coldpress/local-config.yaml`. If `post_phase_3_update_ran: true`: confirm and proceed.

If the user returns without running it: prompt once more with a shorter note. Do not skip — this flag gates env-provision dispatch.

### 4. Stage 2 gate check

Once `post_phase_3_update_ran: true` is confirmed, invoke `evaluate-phase-gate --stage 2` for Phase 3. This checks `env-provisioned` (should be false — user hasn't provisioned yet), `post-phase-3-update-ran` (should now be true), `graph-freshness`.

Warn if Stage 2 checks surface issues; they're non-blocking at this point.

### 5. Update local-config

Write to `.coldpress/local-config.yaml`:
```yaml
phase_3_completed: true
phase_3_completed_at: "{ISO timestamp}"
```

### 6. Close out

> Phase 3 complete. Ready to run `env-provision`.

## Output

phase-transition invoked; handoff log written; post-phase-3 hook confirmed; `phase_3_completed: true` written. `step_5_complete: true`

## Navigation

→ Workflow complete. Proceed to `env-provision`.
