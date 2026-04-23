/**
 * Canonical subgraph builders for the §6.1 visualizer.
 *
 * Each builder is a pure function: takes a `Graph`, returns a `Subgraph`
 * (filtered subset of nodes + edges + a display hint). The renderer
 * layer (Mermaid / DOT / HTML) turns a `Subgraph` into output text.
 *
 * The four canonical subgraphs per plan §6.1:
 *   - sacred-doc-lineage      (SacredDoc-centric relationships)
 *   - prd-to-impl             (PRD → epic → story → CodeModule)
 *   - promotion-status        (sandbox vs live nodes + promotion edges)
 *   - deps                    (CodeModule import graph)
 *
 * Adding a new subgraph: author a builder here, register in
 * SUBGRAPH_REGISTRY, update `docs/graph-visualizer.md` §"Canonical views".
 */

import type { Graph } from "../index.js";
import type { Edge, Node } from "../types.js";

export interface Subgraph {
  /** Kebab-case slug — matches the CLI `coldpress graph view <name>` argument. */
  name: string;
  /** Human-readable title shown at the top of rendered output. */
  title: string;
  /** One-sentence description of what the subgraph shows. */
  description: string;
  nodes: Node[];
  edges: Edge[];
  /**
   * Preferred layout hint for renderers that support multiple layouts.
   * `tree` — hierarchical top-to-bottom; good for PRD→impl.
   * `dag`  — left-to-right DAG; good for deps.
   * `cluster` — group by coldpress.env_tag or dir_role; good for promotion-status.
   * `free` — no preference; let the renderer decide.
   */
  layout: "tree" | "dag" | "cluster" | "free";
}

export type SubgraphBuilder = (graph: Graph) => Subgraph;

// ─── builder: sacred-doc-lineage ──────────────────────────────────

export const sacredDocLineage: SubgraphBuilder = (graph) => {
  const nodes = graph.nodesByType("SacredDoc");
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = graph.json.links.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );
  return {
    name: "sacred-doc-lineage",
    title: "Sacred-doc lineage",
    description:
      "The five sacred documents (context / tech-stack / PRD / architecture / PERT) and their inter-references.",
    nodes,
    edges,
    layout: "tree",
  };
};

// ─── builder: prd-to-impl ─────────────────────────────────────────

/**
 * Traverses PRD → epics → stories → CodeModule via `references` +
 * `implements` edges. Starts from every SacredDoc whose id/label ends
 * in `prd.md`; falls back to everything tagged SacredDoc if nothing
 * matches.
 */
export const prdToImpl: SubgraphBuilder = (graph) => {
  const prdNodes = graph
    .nodesByType("SacredDoc")
    .filter((n) => matchesPrd(n));

  const reachable = new Map<string, Node>();
  const edges: Edge[] = [];
  const seen = new Set<string>();

  const walkRelations = new Set(["references", "implements", "descends_from"]);

  const stack = prdNodes.map((n) => n.id);
  for (const start of stack) seen.add(start);
  while (stack.length > 0) {
    const id = stack.pop()!;
    const current = graph.node(id);
    if (current) reachable.set(id, current);

    for (const edge of graph.json.links) {
      if (edge.source !== id) continue;
      if (!walkRelations.has(String(edge.relation))) continue;
      edges.push(edge);
      if (!seen.has(edge.target)) {
        seen.add(edge.target);
        stack.push(edge.target);
      }
    }
  }

  // Include the originating PRD nodes even if they had no outgoing edges.
  for (const n of prdNodes) reachable.set(n.id, n);

  return {
    name: "prd-to-impl",
    title: "PRD → implementation trace",
    description:
      "Traversal from the PRD through referenced artefacts (epics, stories) into the CodeModules that implement them.",
    nodes: Array.from(reachable.values()),
    edges,
    layout: "tree",
  };
};

function matchesPrd(node: Node): boolean {
  const ref = node.source_file ?? node.label ?? node.id;
  return /(^|\/)prd\.md$/i.test(ref);
}

// ─── builder: promotion-status ────────────────────────────────────

/**
 * All nodes with env_tag "sandbox" / "live" / "both". Edges included:
 * `promoted_from_sandbox` (sandbox → live pairs) + any relation edges
 * between included nodes. Layout is `cluster` so renderers can group
 * by env_tag.
 */
export const promotionStatus: SubgraphBuilder = (graph) => {
  const tags = new Set<string>(["sandbox", "live", "both"]);
  const nodes = graph.json.nodes.filter((n) => {
    const tag = n.coldpress?.env_tag;
    return typeof tag === "string" && tags.has(tag);
  });
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = graph.json.links.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );
  return {
    name: "promotion-status",
    title: "Sandbox → Live promotion status",
    description:
      "Nodes tagged sandbox / live / both, with promotion edges where present.",
    nodes,
    edges,
    layout: "cluster",
  };
};

// ─── builder: deps ────────────────────────────────────────────────

/**
 * CodeModule nodes + their `imports_from` edges. Captures the dependency
 * graph of source code (NOT the sacred-doc dependency chain; that's
 * sacred-doc-lineage).
 */
export const dependencies: SubgraphBuilder = (graph) => {
  const nodes = graph.nodesByType("CodeModule");
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = graph
    .edgesByRelation("imports_from")
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  return {
    name: "deps",
    title: "CodeModule dependency graph",
    description:
      "Source-code modules connected by `imports_from` edges.",
    nodes,
    edges,
    layout: "dag",
  };
};

// ─── registry ─────────────────────────────────────────────────────

export const SUBGRAPH_REGISTRY: Record<string, SubgraphBuilder> = {
  "sacred-doc-lineage": sacredDocLineage,
  "prd-to-impl": prdToImpl,
  "promotion-status": promotionStatus,
  deps: dependencies,
};

export function getSubgraphBuilder(name: string): SubgraphBuilder | undefined {
  return SUBGRAPH_REGISTRY[name];
}

export function listSubgraphNames(): string[] {
  return Object.keys(SUBGRAPH_REGISTRY);
}
