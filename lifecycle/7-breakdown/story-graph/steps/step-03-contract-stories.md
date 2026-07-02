---
step_number: 3
step_name: "Contract stories"
step_goal: "Every interface edge resolves to a kind: contract story"
halts_for_input: true
next_step: "step-04-waves.md"
---

## Goal

Guarantee the wave-safety mechanism: every shared interface has a **contract
story** that merges before the wave that depends on it.

## Instructions

1. For each `interface` edge in the graph, confirm there is a `kind: contract`
   story defining that shared surface (these were extracted from the P6
   `api-contract` at `story-slice`).
2. A missing contract story is a **gap** — halt and return to `story-slice` to add
   it, then re-emit the graph. Do not proceed with a dangling interface edge.
3. Contract stories merge to main **before** their wave (G4) — note this ordering
   for the schedule.

## Output

Every interface edge backed by a contract story. → [step-04-waves.md](step-04-waves.md).
