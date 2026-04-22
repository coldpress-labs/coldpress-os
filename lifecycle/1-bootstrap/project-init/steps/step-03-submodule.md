---
step_number: 3
step_name: "Install coldpress-os Submodule"
step_goal: "Add coldpress-os as a git submodule pinned to a stable commit"
halts_for_input: true
next_step: "step-04-config.md"
---

## Goal

Install coldpress-os as a read-only git submodule.

## Instructions

1. **Add submodule:** `git submodule add https://github.com/coldpress-labs/coldpress-os.git coldpress-os`
2. **Pin to latest stable commit** (or tag if available).
3. **Verify submodule** is populated and readable.
4. **If submodule fails** (no remote repo yet), offer to copy coldpress-os locally instead.

## User Interaction

"Adding coldpress-os as a git submodule. If the remote repo isn't set up yet, I can copy it locally instead. Proceed?"

## Output

coldpress-os available at `./coldpress-os/`. `step_3_complete: true`

## Navigation

→ Proceed to [step-04-config.md](step-04-config.md)
