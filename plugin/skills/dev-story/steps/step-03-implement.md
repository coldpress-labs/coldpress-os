---
step_number: 3
step_name: "Implement"
step_goal: "Execute red-green-refactor for each task until all ACs are satisfied"
halts_for_input: false
next_step: "step-04-validate.md"
---

## Goal

Turn the story's **red acceptance stubs green**, task by task, entirely inside the packet boundary.

## Instructions

The acceptance stubs already exist and are **red by construction** (written by `acceptance-stubs` at P7). You implement the spec until they pass — you do not write the stubs, and you do not weaken them.

For **each task** in the story:

1. **RED (already there):** confirm the task's acceptance stub(s) fail for the right reason. Add finer-grained unit tests where the stubs are coarse — never delete or loosen a stub (`test-integrity` blocks that).
2. **GREEN:** implement the minimal code to make the stubs pass — **only inside the packet's `owns` globs**. A write outside the boundary is blocked by `boundary-guard`; if a task genuinely needs an out-of-scope change, stop and record a **DLT record** (delta) for Butler to reconcile — do not make a stray edit.
3. **REFACTOR:** improve quality while keeping tests green.
4. **UI stories — styleguide self-check:** build components from the **tokens-build** output (CSS vars / framework theme) so token usage is correct by construction; before checking the task off, self-verify the rendered component matches tokens.json + the `/styleguide` route (the same thing `visual-verify` asserts clean-room).
5. **Check the task off** in the story record only when it genuinely passes; update **File List** + **Change Log**.

**Critical rules:**
- Do NOT mark a task complete unless it genuinely passes its stubs (`quality-gate` blocks completing red anyway).
- Do NOT weaken or delete acceptance stubs to force green (`test-integrity`).
- Do NOT edit outside the `owns` boundary — out-of-scope → DLT record, not a stray edit.
- Do NOT stop between tasks — continue through all tasks; check for regressions after each.
- Follow the packet guardrails from Step 2 — specified libraries, architecture §component, patterns.

## Output

All tasks implemented and checked off. `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-validate.md](step-04-validate.md)
