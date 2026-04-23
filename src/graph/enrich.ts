/**
 * Enrichment adapter — post-processes Graphify's raw graph.json to
 * populate the `coldpress` namespace on every node.
 *
 * Graphify is a general-purpose indexer; it has no concept of
 * coldpress-os's folder taxonomy, sacred-doc governance, or three-tier
 * sandbox/live environments. This adapter maps Graphify's output onto
 * coldpress-os's semantic model using the `source_file` path + Graphify's
 * native `file_type` classification.
 *
 * Contract: pure function. No I/O, no mutation of the input. Returns a
 * new GraphJson with `coldpress.{node_type, env_tag, dir_role}` added to
 * every node.
 */

import type { EnvTag, GraphJson, Node, NodeType } from "./types.js";

export interface EnrichOptions {
  /** Version string recorded in graph.coldpress_version. Defaults to "unknown". */
  coldpressVersion?: string;
  /** Project slug recorded in graph.project_slug. Optional. */
  projectSlug?: string;
}

/**
 * Return a new GraphJson with every node carrying `coldpress.{node_type,
 * env_tag, dir_role}` and graph-level metadata populated.
 */
export function enrichGraph(json: GraphJson, options: EnrichOptions = {}): GraphJson {
  const nodes: Node[] = json.nodes.map(enrichNode);

  return {
    ...json,
    graph: {
      ...json.graph,
      schema_version: 1,
      coldpress_version: options.coldpressVersion ?? json.graph.coldpress_version ?? "unknown",
      ...(options.projectSlug ? { project_slug: options.projectSlug } : {}),
      counts: {
        nodes: nodes.length,
        links: json.links.length,
        communities: countDistinctCommunities(nodes),
      },
    },
    nodes,
  };
}

function enrichNode(node: Node): Node {
  const path = node.source_file ?? "";
  const dir_role = inferDirRole(path);
  const env_tag = inferEnvTag(path);
  const node_type = inferNodeType(node);

  return {
    ...node,
    coldpress: {
      ...(node.coldpress ?? {}),
      node_type,
      env_tag,
      dir_role,
    },
  };
}

/**
 * Map a source_file path to its coldpress-os directory role.
 * Matches the top-level folder taxonomy documented in docs/graph-schema.md §2.5.
 */
export function inferDirRole(path: string): string {
  // Strip any leading "./" for robustness.
  const p = path.replace(/^\.\//, "");

  // Most-specific first — order matters. `_context/sacred/` must be
  // checked before the broader `_context/` classification.
  if (p.startsWith("_context/sacred/")) return "_context/sacred";
  if (p.startsWith("_context/planning/")) return "_context/planning";
  if (p.startsWith("_context/design/")) return "_context/design";
  if (p.startsWith("_context/implementation/")) return "_context/implementation";
  if (p.startsWith("_context/testing/")) return "_context/testing";
  if (p.startsWith("_context/tracking/")) return "_context/tracking";
  if (p.startsWith("_context/handoffs/")) return "_context/handoffs";
  if (p.startsWith("_context/audit/")) return "_context/audit";

  if (p.startsWith("_input/raw/")) return "_input/raw";
  if (p.startsWith("_input/legacy/")) return "_input/legacy";
  if (p.startsWith("_input/reference/")) return "_input/reference";
  if (p.startsWith("_input/vendor/")) return "_input/vendor";
  if (p.startsWith("_input/assets/")) return "_input/assets";

  if (p.startsWith("secure/")) return "secure";
  if (p.startsWith("sandbox/")) return "sandbox";
  if (p.startsWith("live/")) return "live";

  return "other";
}

/**
 * Environment tag — who owns this file, sandbox or live?
 * Most files are `neither` (planning docs, sacred docs, inputs). Only
 * paths under `sandbox/` or `live/` get the strong env tag.
 */
export function inferEnvTag(path: string): EnvTag {
  const p = path.replace(/^\.\//, "");
  if (p.startsWith("sandbox/")) return "sandbox";
  if (p.startsWith("live/")) return "live";
  return "neither";
}

/**
 * Map a Graphify node (file_type + path + source_location) to a coldpress
 * node_type. Order of precedence:
 *   1. Secure-manifest key name → CredentialName (added by the secure
 *      adapter upstream of this; never inferred from path alone).
 *   2. Sacred-doc path → SacredDoc.
 *   3. Input path → Input.
 *   4. file_type === "code" → CodeModule (top-level) or CodeSymbol (sub).
 *   5. Audit / structured-output directories → Artefact.
 *   6. Everything else → Document.
 */
export function inferNodeType(node: Node): NodeType {
  const path = (node.source_file ?? "").replace(/^\.\//, "");
  const fileType = node.file_type;
  const location = node.source_location;

  // Existing coldpress.node_type wins — the secure-manifest adapter may
  // have marked this node as CredentialName before enrichment runs.
  if (node.coldpress?.node_type) return node.coldpress.node_type;

  if (path.startsWith("_context/sacred/")) return "SacredDoc";
  if (path.startsWith("_input/")) return "Input";

  if (fileType === "code") {
    // Graphify emits "L1" for the file itself and other line numbers for
    // symbols within. Treat missing / "L1" as the module itself.
    if (!location || location === "L1") return "CodeModule";
    return "CodeSymbol";
  }

  if (path.startsWith("_context/audit/")) return "Artefact";
  if (path.startsWith("_context/tracking/") && /\.(ya?ml|json)$/.test(path)) {
    return "Artefact";
  }

  return "Document";
}

function countDistinctCommunities(nodes: Node[]): number {
  const set = new Set<number>();
  for (const n of nodes) if (typeof n.community === "number") set.add(n.community);
  return set.size;
}
