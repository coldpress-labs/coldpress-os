/**
 * Graphviz DOT renderer for §6.1 subgraphs.
 *
 * Complements the Mermaid renderer — DOT has better layout algorithms
 * (dot, neato, fdp) for larger graphs. Pipe through `dot -Tsvg` or
 * equivalent; coldpress-os does NOT invoke Graphviz itself.
 */

import type { Edge, Node } from "../types.js";
import type { Subgraph } from "../subgraphs/index.js";

export interface RenderOptions {
  maxNodes?: number;
}

const DEFAULT_MAX_NODES = 500;

export function renderDot(
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
  lines.push(`// ${subgraph.title}`);
  lines.push(`// ${subgraph.description}`);
  if (cap > 0 && subgraph.nodes.length > cap) {
    lines.push(
      `// TRUNCATED: showing first ${cap} of ${subgraph.nodes.length} nodes`,
    );
  }

  const rankdir = rankdirForLayout(subgraph.layout);
  lines.push(`digraph ${quote(subgraph.name)} {`);
  lines.push(`  rankdir=${rankdir};`);
  lines.push(`  node [shape=box, style=filled, fontname="Helvetica"];`);
  lines.push(`  edge [fontname="Helvetica", fontsize=10];`);
  lines.push("");

  if (subgraph.layout === "cluster") {
    renderClustered(limitedNodes, lines);
  } else {
    for (const node of limitedNodes) {
      lines.push(`  ${renderNodeLine(node)}`);
    }
  }

  lines.push("");
  for (const edge of limitedEdges) {
    lines.push(`  ${renderEdgeLine(edge)}`);
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}

function renderClustered(nodes: Node[], lines: string[]): void {
  const byTag = new Map<string, Node[]>();
  for (const n of nodes) {
    const tag = n.coldpress?.env_tag ?? "neither";
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag)!.push(n);
  }
  let i = 0;
  for (const [tag, group] of byTag) {
    lines.push(`  subgraph cluster_${i++} {`);
    lines.push(`    label=${quote(`env_tag: ${tag}`)};`);
    lines.push(`    style=filled; color=lightgrey;`);
    for (const n of group) lines.push(`    ${renderNodeLine(n)}`);
    lines.push("  }");
  }
}

function renderNodeLine(node: Node): string {
  const id = quote(node.id);
  const label = truncate(node.label ?? node.id, 80);
  const attrs: string[] = [`label=${quote(label)}`];
  const fill = fillForNode(node);
  if (fill) attrs.push(`fillcolor=${quote(fill)}`);
  const shape = shapeForNode(node);
  if (shape) attrs.push(`shape=${shape}`);
  return `${id} [${attrs.join(", ")}];`;
}

function renderEdgeLine(edge: Edge): string {
  const src = quote(edge.source);
  const tgt = quote(edge.target);
  const rel = typeof edge.relation === "string" ? edge.relation : undefined;
  const attrs: string[] = [];
  if (rel) attrs.push(`label=${quote(rel)}`);
  const style = styleForRelation(rel);
  if (style) attrs.push(`style=${style}`);
  const attrStr = attrs.length > 0 ? ` [${attrs.join(", ")}]` : "";
  return `${src} -> ${tgt}${attrStr};`;
}

function rankdirForLayout(layout: Subgraph["layout"]): string {
  if (layout === "tree") return "TB";
  if (layout === "dag") return "LR";
  return "LR";
}

function fillForNode(node: Node): string | undefined {
  const tag = node.coldpress?.env_tag;
  if (tag === "sandbox") return "#e0f0ff";
  if (tag === "live") return "#d4edda";
  if (tag === "both") return "#f3e8ff";
  const t = node.coldpress?.node_type;
  if (t === "SacredDoc") return "#ffe4b5";
  if (t === "CredentialName") return "#ffd6d6";
  return "#ffffff";
}

function shapeForNode(node: Node): string | undefined {
  const t = node.coldpress?.node_type;
  if (t === "SacredDoc") return "note";
  if (t === "CredentialName") return "hexagon";
  if (t === "CodeSymbol") return "ellipse";
  if (t === "Input") return "parallelogram";
  return undefined;
}

function styleForRelation(relation: string | undefined): string | undefined {
  if (relation === "promoted_from_sandbox") return "bold";
  if (relation === "superseded_by") return "dashed";
  return undefined;
}

function quote(s: string): string {
  return `"${s.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}
