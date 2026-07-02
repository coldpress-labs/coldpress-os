---
step_number: 4
step_name: "Waves"
step_goal: "Run coldpress waves — compute + validate the wave plan"
halts_for_input: true
next_step: "step-05-tracking.md"
---

## Goal

Let the machine compute parallelism. Waves, critical path, and schedule are
**computed from the graph, never hand-authored**.

## Instructions

1. Run:

   ```
   coldpress waves
   ```

   It reads `_context/implementation/story-graph.yaml`, validates it, and emits the
   derived **`docs/generated/waves.yaml`** + **`schedule.yaml`** (critical path via
   PERT-weighted estimate `(o + 4m + p)/6`, plus a mermaid view).

2. `waves` **rejects** and exits non-zero on:
   - a **cycle** in the dependency graph,
   - an `interface` edge with **no contract story**,
   - **intra-wave ownership overlap** (two stories in one wave sharing `owns` globs).

   A rejection is a **graph defect to fix** (return to Step 1–3), never something to
   override — the whole point is that Phase 8 can trust the wave boundaries.

3. Review the computed plan with the user: wave count, critical path, and the
   pre-ranked scope-cut list (non-critical-path stories) for the client timeline.

## Output

`waves.yaml` + `schedule.yaml` computed + accepted. → [step-05-tracking.md](step-05-tracking.md).
