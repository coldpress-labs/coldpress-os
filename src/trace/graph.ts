/**
 * `TraceGraph` — the in-memory traceability graph + query surface (§4.6).
 * Cannibalized from `src/graph/index.ts`'s load/query pattern, but built from
 * coldpress schema'd artifacts rather than the retired Graphify graph.json.
 */

import type { TraceEdge, TraceEdgeType, TraceNode, TraceNodeType } from "./types.js";

export class TraceGraph {
  private readonly nodes = new Map<string, TraceNode>();
  private readonly edges: TraceEdge[] = [];
  private readonly outAdj = new Map<string, TraceEdge[]>();
  private readonly inAdj = new Map<string, TraceEdge[]>();

  /** Add (or merge) a node. Later adds fill missing fields, never clobber. */
  addNode(node: TraceNode): void {
    const existing = this.nodes.get(node.id);
    if (existing) {
      this.nodes.set(node.id, { ...node, ...existing });
    } else {
      this.nodes.set(node.id, node);
    }
  }

  /** Add an edge, auto-creating placeholder nodes for unknown endpoints. */
  addEdge(from: string, to: string, type: TraceEdgeType): void {
    const edge: TraceEdge = { from, to, type };
    this.edges.push(edge);
    (this.outAdj.get(from) ?? this.outAdj.set(from, []).get(from)!).push(edge);
    (this.inAdj.get(to) ?? this.inAdj.set(to, []).get(to)!).push(edge);
  }

  has(id: string): boolean {
    return this.nodes.has(id);
  }
  node(id: string): TraceNode | undefined {
    return this.nodes.get(id);
  }
  allNodes(): TraceNode[] {
    return [...this.nodes.values()];
  }
  allEdges(): readonly TraceEdge[] {
    return this.edges;
  }
  byType(type: TraceNodeType): TraceNode[] {
    return this.allNodes().filter((n) => n.type === type);
  }

  /** Outgoing edges (optionally filtered by type). */
  out(id: string, type?: TraceEdgeType): TraceEdge[] {
    const e = this.outAdj.get(id) ?? [];
    return type ? e.filter((x) => x.type === type) : e;
  }
  /** Incoming edges (optionally filtered by type). */
  in(id: string, type?: TraceEdgeType): TraceEdge[] {
    const e = this.inAdj.get(id) ?? [];
    return type ? e.filter((x) => x.type === type) : e;
  }

  /** All nodes reachable downstream (following out-edges), excluding the root. */
  descendants(id: string): string[] {
    return this.walk(id, "out");
  }
  /** All nodes reachable upstream (following in-edges), excluding the root. */
  ancestors(id: string): string[] {
    return this.walk(id, "in");
  }

  private walk(start: string, dir: "out" | "in"): string[] {
    const seen = new Set<string>();
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop()!;
      const edges = dir === "out" ? this.out(cur) : this.in(cur);
      for (const e of edges) {
        const next = dir === "out" ? e.to : e.from;
        if (!seen.has(next) && next !== start) {
          seen.add(next);
          stack.push(next);
        }
      }
    }
    return [...seen];
  }
}
