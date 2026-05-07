---
step_number: 2
step_name: "Graph Rebuild"
step_goal: "Rebuild the knowledge graph so the incoming phase starts with fresh node data"
severity: "warn"
halts_for_input: false
next_step: "step-03-handoff-log.md"
---

## Goal

Ensure the knowledge graph reflects the current project state before the next phase runs its first graph-first query. Rebuild failures are **warn-not-block** — they set `needs_graph_rebuild: true` in local-config and Butler surfaces it in transition prose.

## Instructions

### 1. Check if rebuild is needed

Read the graph staleness check (per `src/graph/staleness.ts` logic):

- If `reason == "fresh"` — skip the rebuild. Note in transition prose: *"Graph is current — skipping rebuild."*
- If `reason == "stale"`, `"no-graph"`, or `"no-input"` — proceed with rebuild.

### 2. Invoke graph rebuild

```
coldpress graph rebuild
```

This runs Graphify as a subprocess. Typical run: 15-120 seconds depending on project size.

### 3. Handle outcomes

#### Rebuild succeeds

Continue to Step 3. Note the rebuild in transition prose.

#### Rebuild fails (Graphify error, Python missing, timeout)

Set the flag in `.coldpress/local-config.yaml`:

```yaml
needs_graph_rebuild: true
graph_rebuild_error: "{error summary}"
```

Continue to Step 3. Surface in transition prose:

> Graph rebuild failed ({error summary}). The transition will proceed — graph queries in Phase {to_phase} will use the prior build until you run `coldpress graph rebuild` manually.

This matches the warn-not-block pattern established in intake Step 5 (Phase 1 bootstrap).

### 4. Mark step complete

```ts
await markStepStart(projectRoot, `phase-transition.from-phase-${fromPhase}.step-02-graph-rebuild`);
```

## Halts For Input

Does not halt. Runs to completion regardless of outcome; failure is logged and surfaced as a warn.

## Navigation

→ Proceed to [step-03-handoff-log.md](step-03-handoff-log.md)
