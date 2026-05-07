---
step_number: 5
step_name: "Graph prime"
step_goal: "Index the current project state so Phase 2+ skills have cheap retrieval"
halts_for_input: false
next_step: "step-06-gate-and-route.md"
severity: "warn"
---

## Goal

Build the initial knowledge graph from `_input/` material, sacred-doc seeds, and scaffold files. Phase 2+ skills query this graph for quick lookups (e.g., "what does the user have on stakeholders?") instead of re-reading files.

This step is **warn-not-block**. If Graphify fails — Python missing, disk full, corrupted input — we log the failure and continue. Orient's next-session retry prompt (Step 1 of orient) brings it back.

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, "intake/step-05-graph-prime");
```

### 2. Invoke graph rebuild

```bash
coldpress graph rebuild
```

Capture stdout + stderr + exit code.

### 3. Branch on result

#### On success (exit 0)

- Clear `needs_graph_rebuild` + `graph_rebuild_error` from `.coldpress/local-config.yaml` (if they were set from a prior failure).
- Run `coldpress graph stats` and summarise: nodes, edges, community count.
- Append a "Graph primed" block to the intake report.

#### On failure (exit != 0)

- Write to `.coldpress/local-config.yaml`:
  ```yaml
  needs_graph_rebuild: true
  graph_rebuild_error: "<first line of stderr or short diagnosis>"
  ```
- Print a warning to the user — single line, with a hint at the likely cause (Python missing → `coldpress doctor` hint; disk full → `df -h` hint; parse error → which file).
- **Continue to Step 6**. The Phase 1 gate records the graph-prime as `warn`, not `block`.

### 4. Append to the intake report

On success:

```markdown
## Graph prime

- Status: ✓ primed
- Nodes: <n>    Edges: <n>    Communities: <n>
- Top types: <comma-separated list>
```

On failure:

```markdown
## Graph prime

- Status: ⚠ deferred — will retry in the next session
- Reason: <graph_rebuild_error>
```

### 5. Clean exit

```ts
await clearStepMarker(projectRoot);
```

## Halts for Input

No. This step prints a status line and moves on regardless of outcome.

## Navigation

→ `step-06-gate-and-route.md` (always, regardless of prime success or failure).
