---
step_number: 0
step_name: "Graph-First Load"
step_goal: "Ensure graph is current, then load full Phase 2+3 context via graph queries"
halts_for_input: false
next_step: "step-01-mode-detection.md"
partial_completion_id: "planning_entry_sync_step_00"
---

## Goal

Run the graph-staleness helper (3rd consumer after Phase 2 and Phase 3). Rebuild if stale. Query the graph for the full Phase 2+3 evidence bundle. Cold-read structured YAMLs. Run existence checks.

## Instructions

### Graph-Staleness Check

1. Invoke the graph-staleness helper:
   - Read `coldpress.yaml` — check `graph_last_rebuilt` timestamp vs `phase_3_completed_at`.
   - If `needs_graph_rebuild: true` OR graph timestamp < `phase_3_completed_at`: trigger graph rebuild now.
   - If graph rebuild fails: degrade to direct file reads for each artefact; warn user; continue.

### Graph Queries

2. Query the graph for the following context (do not read source files directly):
   - Full Phase 2+3 project context summary
   - User persona nodes (archetypes, accessibility / device / language targets)
   - Idea-validation nodes (North Star, riskiest assumptions, success metrics)
   - Product-brief nodes (users, value prop, positioning)
   - Stack decision nodes + ADR summaries (areas, choices, rationale)
   - Baseline confirmation nodes (Phase 3 stack-locking Step 5a: which categories confirmed + any opt-outs)
   - Phase 3 flagged-risk nodes (from phase-transition log)

### Cold File Reads

3. Cold-read these structured files (read full content — needed for decisions in later steps):
   - `coldpress.yaml` — `baselines:` block, `stack_pack`, `phase_3_completed: true`, `phase_3_completed_at`
   - `.coldpress/local-config.yaml` — `team_shape`, `project_shape`, `cadence`, `archetype`
   - `_context/handoffs/phase-3-to-4-{date}.md` — structured transition log (most recent, if multiple)

   If the Phase 3 handoff log is missing but `phase_3_completed: true`:
   - Generate a synthetic handoff: use `phase_3_completed_at` + Phase 3 artefact mtimes.
   - Warn user: "Phase 3 handoff log not found — using synthesised handoff from timestamps. Some risk context may be missing."

### Existence Checks

4. Check each artefact for existence (do NOT read content — just presence/absence):

   | Artefact | Path | Status |
   |----------|------|--------|
   | context.md | `_context/sacred/context.md` | present / missing |
   | tech-stack.md | `_context/sacred/tech-stack.md` | present / missing |
   | product-brief | `_context/planning/product-brief-v{N}.md` | present / missing |
   | personas | `_context/planning/personas-v{N}.md` | present / missing |
   | idea-validation | `_context/planning/idea-validation-v{N}.md` | present / missing |
   | research-synthesis | `_context/planning/research-synthesis-v{N}.md` | present / missing |
   | stack-selection-summary | `_context/planning/stack-selection-summary-v{N}.md` | present / missing |

5. Check `_input/legacy/` — if non-empty: set `legacy_files_detected: true`. Record the count of files found.

### Partial Completion Write

6. Write `partial_completion: { step_id: "planning_entry_sync_step_00", at: "graph_load_complete" }` to `coldpress.yaml`.

## Output

- Graph is current (or degraded-path degradation logged)
- Graph context loaded in working memory
- `coldpress.yaml` + `local-config.yaml` + handoff log cold-read
- Existence status for all 7 Phase 2+3 artefacts
- `legacy_files_detected` flag set

## Navigation

→ Next: [step-01-mode-detection.md](step-01-mode-detection.md)
