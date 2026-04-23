/**
 * Mermaid renderer for §6.1 subgraphs.
 *
 * Takes a `Subgraph`, returns Mermaid graph source ready to embed in
 * markdown or render with `mmdc`. Keeps output deterministic — nodes
 * and edges emitted in input order so diffs between runs are stable.
 *
 * Layout hint mapping:
 *   tree    → `graph TD`
 *   dag     → `graph LR`
 *   cluster → `graph TB` with `subgraph` blocks per env_tag
 *   free    → `graph LR`
 */

import type { Edge, Node } from "../types.js";
import type { Subgraph } from "../subgraphs/index.js";

export interface RenderOptions {
  /**
   * Cap on node count to render. Useful for huge graphs — Mermaid chokes
   * above ~200 nodes in most viewers. Defaults to 150; 0 disables.
   */
  maxNodes?: number;
}

const DEFAULT_MAX_NODES = 150;

export function renderMermaid(
  subgraph: Subgraph,
  options: RenderOptions = {},
): string {
  const cap = options.maxNodes ?? DEFAULT_MAX_NODES;
  const limitedNodes =
    cap > 0 && subgraph.nodes.length > cap
      ? subgraph.nodes.slice(0, cap)
      : subgraph.nodes;
  const nodeIdSet = new Set(limitedNodes.map((n) => n.id));
  const limitedEdges = subgraph.edges.filter(
    (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target),
  );

  const lines: string[] = [];
  lines.push(`%% ${subgraph.title}`);
  lines.push(`%% ${subgraph.description}`);
  if (cap > 0 && subgraph.nodes.length > cap) {
    lines.push(
      `%% TRUNCATED: showing first ${cap} of ${subgraph.nodes.length} nodes`,
    );
  }
  lines.push("");

  if (subgraph.layout === "cluster") {
    lines.push(...renderClustered(limitedNodes, limitedEdges));
  } else {
    lines.push(`graph ${pickDirection(subgraph.layout)}`);
    lines.push(...renderNodes(limitedNodes).map(indent));
    lines.push(...renderEdges(limitedEdges).map(indent));
  }

  lines.push(...styleClasses());

  return lines.join("\n") + "\n";
}

function pickDirection(
  layout: Subgraph["layout"],
): "TD" | "LR" | "TB" {
  if (layout === "tree") return "TD";
  if (layout === "dag") return "LR";
  return "LR";
}

function renderClustered(nodes: Node[], edges: Edge[]): string[] {
  const lines: string[] = ["graph TB"];
  const byTag = new Map<string, Node[]>();
  for (const n of nodes) {
    const tag = n.coldpress?.env_tag ?? "neither";
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag)!.push(n);
  }
  for (const [tag, group] of byTag) {
    const subId = sanitise(`cluster_${tag}`);
    lines.push(indent(`subgraph ${subId}["env_tag: ${tag}"]`));
    for (const n of group) {
      for (const line of renderNode(n)) lines.push(indent(indent(line)));
    }
    lines.push(indent("end"));
  }
  for (const line of renderEdges(edges)) lines.push(indent(line));
  return lines;
}

function renderNodes(nodes: Node[]): string[] {
  const lines: string[] = [];
  for (const n of nodes) {
    for (const line of renderNode(n)) lines.push(line);
  }
  return lines;
}

function renderNode(node: Node): string[] {
  const id = sanitise(node.id);
  const label = escapeLabel(node.label ?? node.id);
  const shape = shapeForNode(node);
  const lines: string[] = [`${id}${shape.open}"${label}"${shape.close}`];
  const cls = classForNode(node);
  if (cls) lines.push(`class ${id} ${cls}`);
  return lines;
}

function renderEdges(edges: Edge[]): string[] {
  const lines: string[] = [];
  for (const e of edges) {
    const src = sanitise(e.source);
    const tgt = sanitise(e.target);
    const rel = typeof e.relation === "string" ? e.relation : undefined;
    const arrow = rel ? `-- "${escapeLabel(rel)}" -->` : `-->`;
    lines.push(`${src} ${arrow} ${tgt}`);
  }
  return lines;
}

interface Shape {
  open: string;
  close: string;
}

function shapeForNode(node: Node): Shape {
  const t = node.coldpress?.node_type;
  if (t === "SacredDoc") return { open: "[[", close: "]]" };
  if (t === "CredentialName") return { open: "{{", close: "}}" };
  if (t === "CodeModule") return { open: "(", close: ")" };
  if (t === "CodeSymbol") return { open: "((", close: "))" };
  if (t === "Input") return { open: "[/", close: "/]" };
  return { open: "[", close: "]" };
}

function classForNode(node: Node): string | undefined {
  const tag = node.coldpress?.env_tag;
  if (tag === "sandbox") return "sandbox";
  if (tag === "live") return "live";
  if (tag === "both") return "promoted";
  const t = node.coldpress?.node_type;
  if (t === "SacredDoc") return "sacred";
  if (t === "CredentialName") return "credential";
  return undefined;
}

function styleClasses(): string[] {
  return [
    "",
    "classDef sacred     fill:#ffe4b5,stroke:#b8860b,color:#333",
    "classDef sandbox    fill:#e0f0ff,stroke:#4a90e2,color:#333",
    "classDef live       fill:#d4edda,stroke:#28a745,color:#333",
    "classDef promoted   fill:#f3e8ff,stroke:#8a2be2,color:#333",
    "classDef credential fill:#ffd6d6,stroke:#c0392b,color:#333",
  ];
}

/**
 * Mermaid node ids must match `[A-Za-z0-9_]+`. Replace everything else
 * with `_`; prefix with `n_` if the id begins with a digit to stay
 * conservative (some Mermaid versions reject digit-leading ids).
 */
export function sanitise(id: string): string {
  let s = id.replace(/[^A-Za-z0-9_]/g, "_");
  if (/^\d/.test(s)) s = `n_${s}`;
  if (s.length === 0) s = "n_anon";
  return s;
}

function escapeLabel(label: string): string {
  return label.replaceAll('"', "'").replaceAll("\n", " ");
}

function indent(line: string): string {
  return line.length === 0 ? "" : `  ${line}`;
}
