/**
 * `coldpress trace` — node/edge model (action plan §4.6, G14).
 *
 * A derived, in-memory traceability graph over coldpress-os's own schema'd
 * artifacts (story-graph, deltas, ADRs, …). NOT the old Graphify AST index
 * (retired in WS0): no staleness checker, no embeddings, no persistent DB —
 * it is rebuilt on each `coldpress trace` invocation.
 */

/** Node kinds (§4.6). Requirement/component/threat/token-set/release/incident
 * arrive as the P4/P6/P9 artifacts gain their keying (WS4+); WS2 sources
 * story/file-scope/delta/adr from what is schema'd today. */
export type TraceNodeType =
  | "requirement"
  | "component"
  | "adr"
  | "story"
  | "contract-story"
  | "integration-story"
  | "file-scope"
  | "test"
  | "delta"
  | "release"
  | "incident"
  | "threat"
  | "token-set";

/** Edge kinds — the declared relationships between artifacts. */
export type TraceEdgeType =
  | "implements" // story → requirement/component
  | "owns" // story → file-scope
  | "produces" // story → file-scope
  | "consumes" // story → file-scope (dependency)
  | "blocks" // story → story (hard dep)
  | "interface" // story → story (shared type/API boundary)
  | "informs" // story → story (soft)
  | "resolves" // delta → adr (flag_for_architecture_ADR)
  | "covers" // test → story
  | "ships"; // release → story

export interface TraceNode {
  id: string;
  type: TraceNodeType;
  /** Project-relative path this node maps to, when it is a file. */
  path?: string;
  /** Human-readable label. */
  label?: string;
  /** Free-form provenance (which artifact declared it). */
  source?: string;
  /** Kind-specific attributes (e.g. a delta's resolution + adr_ref). */
  attrs?: Record<string, unknown>;
}

export interface TraceEdge {
  from: string;
  to: string;
  type: TraceEdgeType;
}
