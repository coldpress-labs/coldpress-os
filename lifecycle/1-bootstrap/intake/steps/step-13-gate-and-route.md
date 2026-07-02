---
step_number: 13
step_name: "Gate and route"
step_goal: "Run the Phase 1 exit gate; on pass, hand off to Phase 2 Discovery"
halts_for_input: true
next_step: "handoff-to-phase-2"
---

## Goal

Verify every expected Phase 1 artefact is in place, then hand off cleanly to Phase 2. The gate is *contract-backed* — it runs `evaluate-phase-gate` against `lifecycle/1-bootstrap/gate.json` rather than a prose checklist, so pass/fail is machine-checkable.

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, "intake/step-13-gate-and-route");
```

### 2. Run the gate

Invoke the `governance/evaluate-phase-gate` skill with the path to `lifecycle/1-bootstrap/gate.json`. Capture the result.

The gate's acceptance checks (see `gate.json` for the authoritative, current list):

1. `phase_1_completed: true` in `.coldpress/local-config.yaml` — block
2. `user.preferred_ides`, `user.cadence`, `user.team_shape` present in `coldpress.yaml` — block
3. `butler.display_name` present (even default "Butler") — warn
4. `_context/sacred/context.md` exists, frontmatter valid, and `status: authored` (not `seed`) — block
5. All 5 `_input/` subfolders either have content OR a `.intake-skip` marker — warn

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

- Same as Pass, but surface the warnings to the user. Most common: empty `_input/` subfolders that the user chose to skip.
- Continue to step 4.

#### Block

- List the failing blocks with their remedies.
- Halt. Do NOT mark Phase 1 complete. Butler returns control to the user to fix the issue, then re-invoke `intake` from the failing step.

### 4. Invoke phase-transition

On pass, hand off via the `governance/phase-transition` skill (owned by Butler directly — no subagent dispatch) rather than writing the handoff directly:

```
phase-transition --from 1 --to 2
```

`phase-transition` runs the gate (re-runs `evaluate-phase-gate` for Phase 1) and writes the handoff artefact. The handoff artefact created by `phase-transition` replaces the manually-authored artefact below.

**PRD-skip path exception**: If the user has a PRD in `_input/raw/` and wants to bypass Discovery (Phase 2), offer the skip before invoking phase-transition:
> You've pre-loaded what looks like a PRD in `_input/raw/`. Most projects benefit from Phase 2 Discovery — but if your brief is solid, you can jump directly to Phase 4 `create-prd-from-input`. Proceed with Discovery (recommended), or skip to Phase 4?

If skip: invoke `phase-transition --from 1 --to 4` instead. Note the skip in the handoff artefact under `deferred:`.

**Legacy path (if `phase-transition` is not yet wired):** write the handoff artefact manually at `_context/handoffs/intake-to-phase2-{date}.md`:

```markdown
---
from: "intake"
to: "research"
phase_from: 1
phase_to: 2
artefact_type: "handoff"
created: "<ISO-8601>"
---

# Handoff — Phase 1 intake → Phase 2 Discovery

## Completed in Phase 1

- Material inventory: <summary from step 5>
- Project shape: <from step 6>
- Context: authored + sacred-signed-off at `_context/sacred/context.md`
- Working mode: cadence=<>, team_shape=<>, preferred_ides=[...]

## Open questions for Discovery

- Domain/market/constraint research depth (research skill's `depth` parameter)
- Idea validation against kill criteria

## Next skill

`@analyst` runs `research` at `coldpress-os/lifecycle/2-discovery/research/`.
```

### 5. Append to the intake report

```markdown
## Phase 1 gate

- Result: pass | pass-with-warnings | block
- Checks: <5 rows, pass/warn/block per check>

## Handoff

- Next skill: research (Phase 2, @analyst)
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

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `intake` Step 6. |
| 2.0 | 2026-07-02 | Butler | Renumbered to Step 13 (WS5-B, §8 item 6). Dropped the graph-primed gate check (dead — `coldpress graph rebuild` removed in WS0 §8 item 1) and its report row. Fixed `@qa phase-transition` dispatch to plain `phase-transition` (`@qa` was removed in WS4 roster surgery; `phase-transition`'s frontmatter is `agent: "butler"`, so no subagent dispatch is needed). Next-skill target updated from the deleted `pre-project-interview` to `research` (the domain/market/constraint-research merge target, §5 P2). |
