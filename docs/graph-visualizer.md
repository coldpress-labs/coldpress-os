---
name: graph-visualizer
description: Render the project knowledge graph as Mermaid, DOT, or standalone interactive HTML via four canonical subgraph builders
version: "1.0"
---

# Graph Visualizer (§6.1)

> Graphify indexes code + docs + sacred artefacts into `.coldpress/graph/graph.json`, but raw JSON isn't reviewable. This doc specifies the visualizer layer: four canonical subgraph builders + three output formats (Mermaid, DOT, standalone HTML). Composes directly with the Phase-7 gate (visual audit) and the Project Dashboard (§6.10) — the dashboard's Graph tab embeds the HTML export.

**Source decision:** [strategic-improvements-discussion-2026-04-22.md](../../../lab-hq-projects/hq-p001-coldpress-os/docs/strategic-improvements-discussion-2026-04-22.md) §"Visualizer scope".

---

## The CLI

```bash
coldpress graph view <subgraph-name> [options]
```

Arguments:
- `<subgraph-name>` — one of the four registered canonical subgraphs: `sacred-doc-lineage`, `prd-to-impl`, `promotion-status`, `deps`.

Options:
- `--format <mermaid|dot|html>` — output format; default `mermaid`.
- `--output <path>` — write to file; default stdout.
- `--max-nodes <n>` — cap node count (renderer-specific defaults; `0` disables).
- `--cytoscape-src <url>` — HTML only; override the Cytoscape.js script URL.

Exit codes: `0` (rendered), `1` (unknown subgraph / schema error), `2` (no graph found — `.coldpress/graph/graph.json` absent; run `coldpress graph rebuild` first).

---

## The four canonical subgraphs

### `sacred-doc-lineage`

SacredDoc nodes (`context`, `tech-stack`, `prd`, `architecture`, `pert-chart`) and the `descends_from` / `references` edges between them. Tree layout.

**Use case:** verify sacred-doc provenance — does architecture descend from PRD? does PERT reference architecture? Visual audit of the governance chain.

### `prd-to-impl`

Forward traversal from every SacredDoc that looks like a PRD, walking `references` + `implements` + `descends_from` edges into epics → stories → CodeModules. Tree layout.

**Use case:** trace "which code implements which requirement?" end-to-end. Mirror of a PERT-chart drill-down in graph form.

### `promotion-status`

All nodes tagged `env_tag ∈ {sandbox, live, both}` plus any edges between them (including `promoted_from_sandbox`). Cluster layout — groups by env_tag.

**Use case:** which sandbox modules have been promoted to live? Which are still in flight? Which live modules have no sandbox trace (potential governance escape)?

### `deps`

CodeModule nodes + `imports_from` edges only. DAG (left-to-right) layout.

**Use case:** dependency-surface audit. Catch circular imports, unexpected cross-module coupling, fan-in hotspots.

---

## The three renderers

### Mermaid — primary, text-first

Embeds in markdown directly. Deterministic (nodes/edges in input order). Node shapes per `node_type`:

| `node_type` | Mermaid shape |
|-------------|---------------|
| `SacredDoc` | `[[...]]` (subroutine) |
| `CodeModule` | `(...)` (stadium) |
| `CodeSymbol` | `((...))` (circle) |
| `CredentialName` | `{{...}}` (hexagon) |
| `Input` | `[/.../]` (parallelogram) |
| other | `[...]` (rectangle) |

Class-based colouring via `classDef` emits for SacredDoc, sandbox, live, promoted (sandbox→live union), credential.

Node cap: `150` (Mermaid chokes above ~200 nodes in most viewers). Override with `--max-nodes`.

### DOT — Graphviz-compatible

Pipe through `dot -Tsvg` for SVG, `dot -Tpng` for raster, `neato` / `fdp` for different layouts. Coldpress-os emits DOT text; does NOT invoke Graphviz itself.

Node cap: `500` (DOT handles larger graphs than Mermaid).

Edge styles per relation:
- `promoted_from_sandbox` → `bold`
- `superseded_by` → `dashed`
- default → solid

### HTML — standalone interactive

Emits a self-contained HTML file with inline JSON graph data + a CDN `<script>` tag pulling Cytoscape.js. Users open the file in a browser to pan / zoom / click-for-detail.

Layout hint maps to Cytoscape layout:
- `tree` → `breadthfirst`
- `dag` → `dagre` (requires cytoscape-dagre extension in the user's browser; falls back to breadthfirst otherwise)
- `cluster` → `cose`
- `free` → `cose`

**Offline:** override `--cytoscape-src /path/to/cytoscape.min.js` for local-served rendering. The Project Dashboard (§6.10) uses this: serves Cytoscape from its own vendor dir so the Graph tab works fully offline.

Node cap: `1000` (Cytoscape handles thousands without issue).

---

## Output determinism

All three renderers are deterministic given identical input:
- Nodes emitted in input order.
- Edges filtered then emitted in input order.
- Truncation (when `nodes.length > cap`) takes the first `cap` entries, not a random sample.

CI can diff generated Mermaid/DOT/HTML to detect graph drift between commits.

---

## Adding a fifth subgraph

1. Author a pure builder in `src/graph/subgraphs/index.ts`:
   ```ts
   export const myView: SubgraphBuilder = (graph) => ({
     name: "my-view",
     title: "My custom view",
     description: "What this view shows.",
     nodes: graph.nodesByType("CodeModule").filter(/* predicate */),
     edges: /* filtered edges */,
     layout: "dag",
   });
   ```
2. Register in `SUBGRAPH_REGISTRY`.
3. Add a test in `test/graph-visualizer.test.ts`.
4. Add a row to the "canonical subgraphs" table above.

No renderer change needed — all three work against any registered `Subgraph`.

---

## Integration with the Project Dashboard (§6.10)

The dashboard's Graph tab embeds the HTML renderer's output via `<iframe>` (or inline for minimal dashboard footprint). Dashboard URL patterns:

- `/dashboard/graph/sacred-doc-lineage.html`
- `/dashboard/graph/prd-to-impl.html`
- `/dashboard/graph/promotion-status.html`
- `/dashboard/graph/deps.html`

Dashboard server generates these on-demand by invoking the visualizer machinery in-process (no subprocess). User can override `--cytoscape-src` to `/vendor/cytoscape.min.js` which the dashboard serves from its own static-assets route.

---

## Tested against

- **Hand-authored synthetic fixture** in `test/graph-visualizer.test.ts` covering every node_type + env_tag + relation the builders care about.
- **Real httpx fixture** (144 nodes / 330 edges, vendored under `graph/vendor/graphify/worked/httpx/`) — smoke test for large-graph handling. Note: upstream fixture carries no `coldpress.*` extensions, so the CodeModule-filtered subgraph is empty. That's expected — coldpress enrichment is project-local.

Total: 31 tests in `test/graph-visualizer.test.ts`.

---

## What's NOT in this block

- **SVG emission** from coldpress-os directly. Users who want SVG pipe DOT through `dot -Tsvg`. Rationale: avoid depending on Graphviz as a runtime prereq; keep the package pure-JS.
- **Graph query language** (plan §6.1 mentioned "documentation of graph query language"). The existing `coldpress graph query` CLI (Wave 3 Block N) IS the query surface; re-documentation would duplicate `docs/graph-query.md`. If a declarative syntax becomes valuable later (e.g., Cypher-like `MATCH (a:SacredDoc)-[:DESCENDS_FROM]->(b)`), it ships in a follow-up block with a dedicated spec.
- **Graph diffing between commits.** Deferred; would plug in at the Phase-7 gate level as "graph regression between main and PR".
- **Animated graph evolution.** Not planned; tied to an event-sourced graph history we don't emit.

---

## See also

- [`graph-schema.md`](graph-schema.md) — the underlying coldpress-extended graph JSON schema (Wave 3 Block N).
- [`graph-query.md`](graph-query.md) — `coldpress graph query` CLI (Wave 3 Block N, skill-facing query surface).
- [`secure-pattern.md`](secure-pattern.md) — why credential VALUES never enter the graph; only CredentialName nodes.
- Dashboard protocol doc — lands with Block GG (§6.10).

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 11 Shape A subagents (analyst · architect · pm · ux-designer · scrum-master · developer · qa · devops · reviewer · communicator · valet) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

