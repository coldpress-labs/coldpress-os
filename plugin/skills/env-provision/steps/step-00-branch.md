---
step_number: 0
step_name: "Stack-Pack Branch"
step_goal: "Read coldpress.yaml stack_pack; dispatch to pack quickstart or generic path"
halts_for_input: false
next_step: "step-01-read-stack.md"
---

## Goal

Before any tooling is installed, check whether the locked stack includes a confirmed pack. If a pack's quickstart skill exists, dispatch to it — pack-internal steps take over from there. If not, continue to the generic provision path (Steps 1–4).

## Instructions

### 1. Read coldpress.yaml

Read `coldpress.yaml`. Extract:
- `stack_pack` — string; `""` means no pack
- `phase_3_completed` — must be `true` to reach this step; if missing: HaltError

> Sanity: if `phase_3_completed` is not `true`, halt with:
> "env-provision requires Phase 3 to be complete. Run `stack-locking` first."

### 2. Branch: pack detected

If `stack_pack` is non-empty:

1. Resolve the quickstart skill path: `skills/stack-packs/{stack_pack}/quickstart/SKILL.md`
2. Check that path exists.

**If it exists:** Dispatch to the pack's quickstart skill.
- Pack-internal steps take over from here; env-provision generic steps are **not** run.
- The quickstart skill is responsible for all install, configure, and verify steps for this pack.
- On quickstart completion: proceed to `step-04-verify.md` for baseline checks only (skip steps 1–3).

**If the path does not exist:** Warn user and fall through to generic path:
> `stack_pack: "{pack_name}"` is set but no quickstart skill was found at `skills/stack-packs/{pack_name}/quickstart/SKILL.md`. Proceeding with generic provision path.

### 3. Branch: no pack (generic path)

If `stack_pack` is `""` or pack resolution fell through: proceed to `step-01-read-stack.md`.

This is the standard provision flow for any project where no starter pack was confirmed.

## Output

Branch decision made. `step_0_complete: true`

## Navigation

→ Pack path: dispatch to `skills/stack-packs/{pack}/quickstart/SKILL.md`, then `step-04-verify.md`
→ Generic path: proceed to [step-01-read-stack.md](step-01-read-stack.md)
