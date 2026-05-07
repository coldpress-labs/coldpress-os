---
workflow_version: "1.0"
output_file: "_context/planning/breakdown-scope-v{N}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Phase 7 entry skill. 3 steps: graph-first context load + architecture-deltas reconciliation + breakdown-scope memo emit.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 0 | [step-00-context.md](steps/step-00-context.md) | Graph-first context load (14 graph_queries) + 6th-consumer staleness check + existence_checks |
| 1 | [step-01-architecture-deltas-reconciliation.md](steps/step-01-architecture-deltas-reconciliation.md) | Consume architecture_deltas[] from phase-6-to-7 handoff; 4-option reconciliation per delta; for accept_into_prd → invoke `validate-prd --sections=<list>` lightweight amendment + bump PRD VC |
| 2 | [step-02-scope-memo.md](steps/step-02-scope-memo.md) | Emit breakdown-scope-v{N}.md validated-distillate (archetype + baselines + open issues + flagged-deltas-status + personas + legacy + prototype-ref) |

## Execution Rules

1. **Architecture-deltas reconciliation is CRITICAL** — this step is where Phase 6 forward-carry resolves. Cannot skip even when zero deltas (write `architecture_deltas_count: 0` to scope memo for downstream verification).
2. **First real consumer of `validate-prd --sections`** — Phase 5 deferred the impl; Phase 7 entry exercises it.
3. **Halt at user-input prompts** — per-delta decision prompts.
4. **Partial-completion mechanic** active.
5. **Graph-first.** Step 0 loads; subsequent steps consult graph.

## Outputs

- `_context/planning/breakdown-scope-v{N}.md` (validated-distillate; schema-validated)
- (conditional) PRD v(N+1) with bumped VC + amendment_source: phase-7-architecture-reconciliation
