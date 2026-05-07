---
step_number: 6
step_name: "Gate and route"
step_goal: "Run the Phase 1 exit gate; on pass, hand off to Phase 2 pre-project-interview"
halts_for_input: true
next_step: "handoff-to-phase-2"
---

## Goal

Verify every expected Phase 1 artefact is in place, then hand off cleanly to Phase 2. The gate is *contract-backed* — it runs `evaluate-phase-gate` against `lifecycle/1-bootstrap/gate.json` rather than a prose checklist, so pass/fail is machine-checkable.

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, "intake/step-06-gate-and-route");
```

### 2. Run the gate

Invoke the `governance/evaluate-phase-gate` skill with the path to `lifecycle/1-bootstrap/gate.json`. Capture the result.

The gate has 6 acceptance checks (per Wave 3.5 design):

1. `phase_1_completed: true` in `.coldpress/local-config.yaml` — block
2. `user.preferred_ides`, `user.cadence`, `user.team_shape` present in `coldpress.yaml` — block
3. `butler.display_name` present (even default "Butler") — warn
4. `_context/sacred/context.md` exists + frontmatter valid — block
5. `.coldpress/graph/graph.json` exists and non-empty — warn (coupled with `needs_graph_rebuild` flag)
6. All 5 `_input/` subfolders either have content OR a `.intake-skip` marker — warn

### 3. Branch on result

#### Pass (all blocks green)

- Mark Phase 1 complete:
  ```ts
  await updateLocalConfig(projectRoot, {
    phase_1_completed: true,
    phase_1_completed_at: new Date().toISOString(),
  });
  ```
- Continue to step 4 (handoff).

#### Pass-with-warnings

- Same as Pass, but surface the warnings to the user. Most common: the graph-prime deferred message, or empty `_input/` subfolders that the user chose to skip.
- Continue to step 4.

#### Block

- List the failing blocks with their remedies.
- Halt. Do NOT mark Phase 1 complete. Butler returns control to the user to fix the issue, then re-invoke `intake` from the failing step.

### 4. Invoke phase-transition (Wave 4.5)

On pass, hand off via `governance/phase-transition` rather than writing the handoff directly:

```
@qa phase-transition --from 1 --to 2
```

`phase-transition` runs the gate (Step 1 — re-runs evaluate-phase-gate for Phase 1), rebuilds the graph (Step 2), and writes the handoff artefact (Step 3). The handoff artefact created by phase-transition replaces the manually-authored artefact below.

**PRD-skip path exception**: If the user has a PRD in `_input/raw/` and wants to bypass Discovery (Phase 2), offer the skip before invoking phase-transition:
> You've pre-loaded what looks like a PRD in `_input/raw/`. Most projects benefit from Phase 2 Discovery — but if your brief is solid, you can jump directly to Phase 4 `create-prd-from-input`. Proceed with Discovery (recommended), or skip to Phase 4?

If skip: invoke `phase-transition --from 1 --to 4` instead. Note the skip in the handoff artefact under `deferred:`.

**Legacy path (if phase-transition is not yet wired):** write the handoff artefact manually at `_context/handoffs/intake-to-phase2-{date}.md`:

```markdown
---
from: "intake"
to: "pre-project-interview"
phase_from: 1
phase_to: 2
artefact_type: "handoff"
created: "<ISO-8601>"
---

# Handoff — Phase 1 intake → Phase 2 Discovery

## Completed in Phase 1

- Material inventory: <summary from step 1>
- Project shape: <from step 2>
- Intent seed: "<sentence>" (at `_context/sacred/context.md`)
- Working mode: cadence=<>, team_shape=<>, preferred_ides=[...]
- Graph: primed | deferred

## Open questions for Discovery

- Stakeholders (Butler has no data yet)
- Constraints (budget, timeline, compliance)
- Success criteria

## Next skill

`@analyst` runs `pre-project-interview` at `coldpress-os/lifecycle/2-discovery/pre-project-interview/`.
```

### 5. Append to the intake report

```markdown
## Phase 1 gate

- Result: pass | pass-with-warnings | block
- Checks: <6 rows, pass/warn/block per check>

## Handoff

- Next skill: pre-project-interview (Phase 2, @analyst)
- Handoff artefact: `_context/handoffs/intake-to-phase2-{date}.md`
```

### 6. Clean exit

```ts
await clearStepMarker(projectRoot);
```

## Halts for Input

Only on `block` (needs user to fix) or when offering the optional PRD-skip path on pass.

## Navigation

→ Butler dispatches `@analyst` with the handoff artefact path on pass.
→ Halt on block; intake ends. Butler surfaces the fix-it steps.
