---
step_number: 3
step_name: "Evidence Gap Detection"
step_goal: "Surface missing or stale Phase 2+3 artefacts; determine planning impact"
halts_for_input: false
next_step: "step-04-scope-memo.md"
partial_completion_id: "planning_entry_sync_step_03"
---

## Goal

Using the existence-check results from Step 0, build the evidence bundle status table for the planning-scope memo. Identify gaps that will affect PRD quality and surface them to the user in Step 4.

## Instructions

### Build Evidence Status Table

1. For each artefact checked in Step 0, classify:

   | Status | Meaning |
   |--------|---------|
   | ✓ present | Artefact exists on disk AND has a matching graph node with recent content |
   | ⚠ file-only | Artefact exists on disk but no graph node (graph stale — rebuild may fix this) |
   | ⚠ missing | Artefact does not exist on disk |

2. Apply the planning-impact rules:

   | Artefact | If Missing | Impact |
   |----------|-----------|--------|
   | `context.md` | Block — cannot proceed without project context | Critical |
   | `tech-stack.md` | Block — PRD NFRs cannot be derived without stack | Critical |
   | `product-brief-v{N}` | Warn — PRD authoring starts from `context.md` + `idea-validation` only | Degraded |
   | `personas-v{N}` | Warn — user stories will lack persona specificity | Degraded |
   | `idea-validation-v{N}` | Warn — risky assumptions not surfaced during PRD authoring | Degraded |
   | `research-synthesis-v{N}` | Info — research context missing; PRD relies on product-brief | Minor |
   | `stack-selection-summary-v{N}` | Warn — ADRs may still be present; stack context degraded | Degraded |

3. If any Critical artefact is missing: surface a blocking message and halt — do not proceed to Step 4 until resolved. Example:
   > "I cannot start Phase 4 — `_context/sacred/tech-stack.md` is missing. Phase 3 must be completed before proceeding. Run `phase-transition` from Phase 3 or verify Phase 3 outputs are present."

4. For Degraded artefacts: record gap + impact in planning context (will appear in scope memo as warnings). Do not block — Phase 4 can proceed in degraded mode.

### Check for Phase 3 Conflicts

5. From graph Phase 3 flagged-risk nodes (loaded in Step 0): extract any open risks that should be reflected in the PRD. Record these as "inherited risks" in planning context.

### Partial Completion Write

6. Write `partial_completion: { step_id: "planning_entry_sync_step_03", at: "gaps_assessed" }` to `coldpress.yaml`.

## Output

- Evidence bundle status: ✓ / ⚠ per artefact
- Critical gaps identified (blocks) or degraded-mode warnings
- Inherited risk list from Phase 3

## Navigation

→ Next: [step-04-scope-memo.md](step-04-scope-memo.md)
