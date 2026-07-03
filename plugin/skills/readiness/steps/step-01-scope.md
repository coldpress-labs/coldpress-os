---
step_number: 1
step_name: "Scope the release + confirm entry"
step_goal: "Fix the release scope and confirm Phase 9 entry conditions before running the hard checklist"
halts_for_input: true
next_step: "step-02-gates.md"
---

## Instructions

1. **Confirm Phase 9 entry conditions** (from the SKILL's `existence_checks`):
   - `wave-status-final == true`,
   - the `phase-8-to-9-{date}` handoff exists,
   - the Phase 7 `implementation-readiness` report is `overall_status: pass`.
   If any is missing, halt — readiness does not run against an unfinished wave.

2. **Establish the release scope** — run **`coldpress trace release`** for the
   preview: which stories ship, the requirements they satisfy, the file-scope
   they touch (the diffstat surface), and each story's verification state. Any
   story the preview flags as an unverified **blocker** is surfaced now — a
   release should not carry an unverified story past this gate.

3. **Read the deploy inputs** — the locked stack's build config (`BUILD_CMD` /
   `BUILD_DIR` / `NODE_VERSION`), `secure/manifest.yaml` (key names), the selected
   `deploy_pack`, `_context/design/budgets.yaml`, and the project **tier** (T2 = revenue/PII unlocks the lockfile-pinning check).

4. **Confirm scope with the user** — the shipping stories + the tier, so the
   checklist runs against the right target.

## Output

Release scope fixed (stories + requirements + diffstat + tier), entry conditions confirmed, `trace release` blockers surfaced. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-gates.md](step-02-gates.md)
