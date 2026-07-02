---
step_number: 1
step_name: "Edges"
step_goal: "Derive typed dependency edges from the sliced stories' owns/produces/consumes"
halts_for_input: false
next_step: "step-02-emit-graph.md"
---

## Goal

Turn the stories' ownership metadata into **typed edges** — the graph `coldpress
waves` will slice into waves.

## Instructions

Read the `ST-*.md` stories (from `story-slice`). For each pair, classify the edge:

- **`blocks`** — story B `consumes` a file/interface that story A `produces`. B
  cannot start until A merges. (Hard ordering; drives the critical path.)
- **`interface`** — two stories share an API/type surface. The surface itself is a
  **contract story** (`kind: contract`) that both depend on and that merges first.
- **`informs`** — a soft dependency (shared context, not a hard block).

Also record per story: `owns` globs (ownership), o/m/p `estimate`, `risk`, and
`kind` (`story` | `contract` | `integration`). Integration (`IN-*`) stories
sequence the merge of a wave's interface-bearing stories.

## Output

The edge list + per-story attributes, ready to serialise. → [step-02-emit-graph.md](step-02-emit-graph.md).
