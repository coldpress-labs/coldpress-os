---
step_number: 1
step_name: "Mode Detection"
step_goal: "Detect the PRD archetype mode from local-config signals and graph context"
halts_for_input: false
next_step: "step-02-baselines-summary.md"
partial_completion_id: "planning_entry_sync_step_01"
---

## Goal

Determine which PRD archetype mode applies to this project. The mode shapes the recommended skill sequence written to the planning-scope memo.

## Instructions

### Determine Archetype Mode

1. Read from `local-config.yaml`:
   - `project_shape` — product type (e.g., `saas`, `static`, `cli`, `consumer-app`)
   - `team_shape` — `solo` / `small-team` / `agency` / `wds`
   - `archetype` — if explicitly set, use as override

2. Read from graph context (loaded in Step 0):
   - Does the Phase 3 handoff log indicate a design-led kickoff?
   - Is `stack_pack: "static-single-page"` or `"static-multipage-blog"`? (signals content-first, may prefer design-first mode)

3. Apply mode selection logic (first match wins):

   | Condition | Mode |
   |-----------|------|
   | `archetype: "design-first"` in local-config | `design-first` |
   | `team_shape: "wds"` | `design-first` |
   | `team_shape: "solo"` AND `project_shape` in [`saas`, `consumer-app`] | `vibe-coder-lean` |
   | `team_shape: "solo"` with NO explicit archetype | `vibe-coder-lean` |
   | Default | `standard-pm` |

4. Record detected mode in planning context (will be written to scope memo in Step 4):

   **Mode descriptions:**
   - `standard-pm` — full 7-skill flow: planning-entry-sync → create-prd → validate-prd → legacy-assessment (brownfield) → design-brief (optional) → Phase 5 (design) → Phase 6 (architecture)
   - `vibe-coder-lean` — abbreviated: create-prd + validate-prd; design-brief optional post-PRD; architecture in Phase 6
   - `design-first` — design-brief leads: planning-entry-sync → design-brief → create-prd → validate-prd → Phase 5 → Phase 6

### Partial Completion Write

5. Write `partial_completion: { step_id: "planning_entry_sync_step_01", at: "mode_detected" }` to `coldpress.yaml`.

## Output

- Archetype mode detected: `standard-pm` | `vibe-coder-lean` | `design-first`
- Mode rationale recorded (for scope memo)

## Navigation

→ Next: [step-02-baselines-summary.md](step-02-baselines-summary.md)
