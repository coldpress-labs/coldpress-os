/**
 * `Graph` — Node-side wrapper around the coldpress-os knowledge-graph JSON.
 *
 * Responsibilities:
 *  - Load `<project>/.coldpress/graph/graph.json` from disk.
 *  - Validate against the Zod schema (fails loud on schema drift).
 *  - Expose in-memory query helpers: by id, by node_type, by dir_role,
 *    by relation, neighbours, community filter, stats.
 *
 * What this is NOT:
 *  - The indexer. The indexer is Graphify — Python, invoked as a subprocess
 *    by `coldpress graph rebuild`. See src/commands/graph.ts.
 *  - A mutable store. The graph is regenerated wholesale; callers don't
 *    `upsertNode` — they query the in-memory snapshot or trigger a rebuild.
 *  - A RAG / vector surface. Full-text + vector queries land in a later
 *    wave's optional SQLite + sqlite-vec layer (plan §3.7).
 */

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { type GraphJson, GraphJsonSchema, type Node, type Edge } from "./types.js";

export const DEFAULT_GRAPH_PATH = join(".coldpress", "graph", "graph.json");

export interface GraphLoadOptions {
  /** Project root — defaults to process.cwd(). */
  projectDir?: string;
  /** Override the graph-file path relative to projectDir (default: `.coldpress/graph/graph.json`). */
  graphPath?: string;
}

export class GraphNotFoundError extends Error {
  constructor(path: string) {
    super(
      `Graph file not found at ${path}. Run \`coldpress graph rebuild\` in the project root to generate it.`,
    );
    this.name = "GraphNotFoundError";
  }
}

export class GraphSchemaError extends Error {
  public readonly issues: { path: string; message: string }[];
  constructor(issues: { path: string; message: string }[]) {
    super(
      `graph.json does not match the expected schema (${issues.length} issue${
        issues.length === 1 ? "" : "s"
      }). Run \`coldpress graph rebuild\` against the current schema_version.`,
    );
    this.name = "GraphSchemaError";
    this.issues = issues;
  }
}

/**
 * Load + validate a graph.json file. Throws GraphNotFoundError when the
 * file is missing and GraphSchemaError when the content fails schema
 * validation. Both errors carry actionable remediation prose.
 */
export async function loadGraph(options: GraphLoadOptions = {}): Promise<Graph> {
  const projectDir = resolve(options.projectDir ?? process.cwd());
  const relPath = options.graphPath ?? DEFAULT_GRAPH_PATH;
  const absPath = resolve(projectDir, relPath);

  let content: string;
  try {
    content = await readFile(absPath, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new GraphNotFoundError(absPath);
    }
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new GraphSchemaError([
      { path: "<root>", message: `not valid JSON: ${(err as Error).message}` },
    ]);
  }

  const result = GraphJsonSchema.safeParse(parsed);
  if (!result.success) {
    throw new GraphSchemaError(
      result.error.issues.map((i) => ({
        path: i.path.length === 0 ? "<root>" : i.path.map(String).join("."),
        message: i.message,
      })),
    );
  }

  return new Graph(result.data, absPath);
}

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  communityCount: number;
  /** Count of nodes per coldpress node_type. */
  nodeTypeHistogram: Record<string, number>;
  /** Count of edges per relation. */
  relationHistogram: Record<string, number>;
  /** Count of nodes per env_tag. */
  envTagHistogram: Record<string, number>;
}

export class Graph {
  public readonly json: GraphJson;
  public readonly absPath: string;
  private nodeById: Map<string, Node>;
  private edgesByEndpoint: Map<string, Edge[]>;

  constructor(json: GraphJson, absPath: string) {
    this.json = json;
    this.absPath = absPath;
    this.nodeById = new Map(json.nodes.map((n) => [n.id, n]));
    this.edgesByEndpoint = this.indexEdgesByEndpoint(json.links);
  }

  // ─── By-id access ───────────────────────────────────────────────

  node(id: string): Node | undefined {
    return this.nodeById.get(id);
  }

  // ─── Filters ────────────────────────────────────────────────────

  nodesByType(nodeType: string): Node[] {
    return this.json.nodes.filter((n) => n.coldpress?.node_type === nodeType);
  }

  nodesByDirRole(dirRole: string): Node[] {
    return this.json.nodes.filter((n) => n.coldpress?.dir_role === dirRole);
  }

  nodesByEnvTag(envTag: string): Node[] {
    return this.json.nodes.filter((n) => n.coldpress?.env_tag === envTag);
  }

  edgesByRelation(relation: string): Edge[] {
    return this.json.links.filter((e) => e.relation === relation);
  }

  /**
   * Neighbours of a node — undirected by default, matching Graphify's
   * default. Returns the node objects, filtered optionally by edge relation.
   */
  neighbors(id: string, options: { relation?: string } = {}): Node[] {
    const edges = this.edgesByEndpoint.get(id) ?? [];
    const neighbourIds = new Set<string>();
    for (const edge of edges) {
      if (options.relation && edge.relation !== options.relation) continue;
      const other = edge.source === id ? edge.target : edge.source;
      neighbourIds.add(other);
    }
    return Array.from(neighbourIds)
      .map((nid) => this.nodeById.get(nid))
      .filter((n): n is Node => n !== undefined);
  }

  // ─── Stats ──────────────────────────────────────────────────────

  stats(): GraphStats {
    const nodeTypeHistogram: Record<string, number> = {};
    const envTagHistogram: Record<string, number> = {};
    for (const node of this.json.nodes) {
      const type = node.coldpress?.node_type ?? "<unclassified>";
      nodeTypeHistogram[type] = (nodeTypeHistogram[type] ?? 0) + 1;
      const env = node.coldpress?.env_tag ?? "<untagged>";
      envTagHistogram[env] = (envTagHistogram[env] ?? 0) + 1;
    }

    const relationHistogram: Record<string, number> = {};
    for (const edge of this.json.links) {
      const rel = String(edge.relation ?? "<none>");
      relationHistogram[rel] = (relationHistogram[rel] ?? 0) + 1;
    }

    const communities = new Set<number>();
    for (const node of this.json.nodes) {
      if (typeof node.community === "number") communities.add(node.community);
    }

    return {
      nodeCount: this.json.nodes.length,
      edgeCount: this.json.links.length,
      communityCount: communities.size,
      nodeTypeHistogram,
      relationHistogram,
      envTagHistogram,
    };
  }

  // ─── Guardrails ─────────────────────────────────────────────────

  /**
   * Defense-in-depth: assert no node or edge carries the word-value of a
   * credential from `secure/.env*`. The adapter layer is supposed to
   * exclude values at index time; this is the last line of defense.
   *
   * Note: this is a sampling check (substring scan over stringified JSON).
   * It won't catch high-entropy tokens that happen to collide with random
   * node ids. Primary defence is the secure-manifest-adapter contract;
   * this asserts "no credential value I know about appears in the graph."
   */
  assertNoCredentialValue(values: string[]): { path: string; snippet: string }[] {
    if (values.length === 0) return [];
    const json = JSON.stringify(this.json);
    const hits: { path: string; snippet: string }[] = [];
    for (const value of values) {
      if (!value || value.length < 8) continue; // skip trivially short strings
      const idx = json.indexOf(value);
      if (idx !== -1) {
        hits.push({
          path: "<graph.json>",
          snippet: `value matches a credential from secure/.env — found at offset ${idx}`,
        });
      }
    }
    return hits;
  }

  // ─── Internals ──────────────────────────────────────────────────

  private indexEdgesByEndpoint(edges: Edge[]): Map<string, Edge[]> {
    const map = new Map<string, Edge[]>();
    for (const edge of edges) {
      for (const endpoint of [edge.source, edge.target]) {
        if (!map.has(endpoint)) map.set(endpoint, []);
        map.get(endpoint)!.push(edge);
      }
    }
    return map;
  }
}
