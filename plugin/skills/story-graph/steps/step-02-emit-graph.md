---
step_number: 2
step_name: "Emit graph"
step_goal: "Write story-graph.yaml per the schema"
halts_for_input: false
next_step: "step-03-contract-stories.md"
---

## Goal

Serialise the stories + edges to `_context/implementation/story-graph.yaml`, the
single source `coldpress waves` consumes.

## Instructions

1. Write `_context/implementation/story-graph.yaml` conforming to
   **`schemas/story-graph.schema.ts`** (`StoryGraphSchema`):
   - `stories[]` — each with `id`, `kind` (story/contract/integration), `owns` globs,
     `estimate` (o/m/p), `risk` (low/medium/high), and `implements[]` (the requirement
     IDs it satisfies — keys back to `trace`).
   - `edges[]` — each `{ from, to, kind: blocks|interface|informs }`.
2. Keep `owns` globs disjoint across stories intended for the same wave (waves will
   reject overlaps — better to catch it here).
3. Do NOT author waves, ordering, or a schedule — those are computed in Step 4.

## Output

`story-graph.yaml` written + schema-valid. → [step-03-contract-stories.md](step-03-contract-stories.md).
