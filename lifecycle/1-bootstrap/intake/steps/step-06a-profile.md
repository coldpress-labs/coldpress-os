---
step_number: 6.5
step_name: "Profile"
step_goal: "One question — the project profile — pre-fills lane, tier, and the stack/deploy/verify packs; everything after is confirm/override"
halts_for_input: true
next_step: "step-07-intent-seed.md"
---

## Goal

Ask **the one question that configures everything** (§4.9). A profile is a preset
harvested from a real project of that shape; picking one pre-fills the axes so the
rest of intake is confirm-or-override, not open-ended.

## Instructions

1. **Present the roster** — read `coldpress-os/data/profiles/*.yaml` and offer them
   by `name` + `description` (brochure-site, editorial-site, saas-app, cli-tool,
   browser-extension, research-spike). Add a "**None / custom**" option.
2. **Ask:** *"Which best describes this project?"* — one answer.
3. **Apply the profile's defaults** to `coldpress.yaml` (all overridable later):
   - `profile:` = the id.
   - `stack_pack`, `deploy_pack`, `verify_pack` from `defaults`.
   - `lane` + `security_tier` from `defaults` (the lane is still confirmed at
     `lane-select`; the tier at the security-tier question — the profile just seeds them).
   - `flags` (e.g. `content_workstream`) + `mcp_set`.
4. **Note the overridability** to the user: *"These are starting points — you can
   change the stack, lane, tier, or anything else as we go."* A profile is defaults,
   not a cage.
5. **None/custom** → skip the pre-fill; the later steps (lane-select, tier question,
   stack discovery at Phase 3) gather each axis directly.

## Output

`coldpress.yaml` seeded with the profile's defaults (or untouched for custom). →
[step-07-intent-seed.md](step-07-intent-seed.md).
