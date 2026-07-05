/**
 * TypeScript types + Zod schema for coldpress-os's knowledge-graph JSON.
 *
 * The base shape is NetworkX node-link format (`networkx.readwrite.json_graph`).
 * Coldpress-os extends every node with a `coldpress` namespace carrying
 * framework-aware metadata (`node_type`, `env_tag`, `dir_role`, optional
 * `governance`).
 */

import { z } from "zod";

// ─── Coldpress extensions ─────────────────────────────────────────

export const NodeTypeEnum = z.enum([
  "Document",
  "SacredDoc",
  "Artefact",
  "CodeModule",
  "CodeSymbol",
  "CredentialName",
  "Input",
]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

export const EnvTagEnum = z.enum(["sandbox", "live", "both", "neither"]);
export type EnvTag = z.infer<typeof EnvTagEnum>;

export const FileTypeEnum = z.enum(["code", "doc", "image", "video"]);
export type FileType = z.infer<typeof FileTypeEnum>;

export const ConfidenceEnum = z.enum(["EXTRACTED", "INFERRED", "MANUAL"]);
export type Confidence = z.infer<typeof ConfidenceEnum>;

export const RelationEnum = z.enum([
  "imports_from",
  "calls",
  "references",
  "descends_from",
  "implements",
  "tests",
  "deploys_to",
  "promoted_from_sandbox",
  "superseded_by",
  "consumes",
]);
export type Relation = z.infer<typeof RelationEnum>;

export const GovernanceMetaSchema = z.object({
  /** Change-workflow name under `governance/` (e.g. "prd-change"). */
  change_workflow: z.string().min(1),
  /** Document version from its version-control panel. */
  version: z.string().min(1),
});

export const ColdpressNodeMetaSchema = z
  .object({
    node_type: NodeTypeEnum.optional(),
    env_tag: EnvTagEnum.optional(),
    dir_role: z.string().optional(),
    governance: GovernanceMetaSchema.optional(),
  })
  .passthrough(); // tolerate extra fields from future additive changes

// ─── Base Graphify shapes ─────────────────────────────────────────

export const NodeSchema = z
  .object({
    id: z.string().min(1),
    label: z.string(),
    file_type: FileTypeEnum.optional(),
    source_file: z.string().optional(),
    source_location: z.string().optional(),
    community: z.number().int().optional(),
    coldpress: ColdpressNodeMetaSchema.optional(),
  })
  .passthrough();

export const EdgeSchema = z
  .object({
    source: z.string().min(1),
    target: z.string().min(1),
    // `_src` / `_tgt` are Graphify internals; kept for passthrough compatibility.
    _src: z.string().optional(),
    _tgt: z.string().optional(),
    relation: RelationEnum.or(z.string()).optional(),
    confidence: ConfidenceEnum.or(z.string()).optional(),
    source_file: z.string().optional(),
    source_location: z.string().optional(),
    weight: z.number().optional(),
  })
  .passthrough();

export const GraphMetadataSchema = z
  .object({
    schema_version: z.literal(1).optional(),
    project_slug: z.string().optional(),
    generated_at: z.string().optional(),
    graphify_version: z.string().optional(),
    coldpress_version: z.string().optional(),
    counts: z
      .object({
        nodes: z.number().int().optional(),
        links: z.number().int().optional(),
        communities: z.number().int().optional(),
      })
      .optional(),
  })
  .passthrough();

export const GraphJsonSchema = z
  .object({
    directed: z.boolean(),
    multigraph: z.boolean(),
    graph: GraphMetadataSchema,
    nodes: z.array(NodeSchema),
    links: z.array(EdgeSchema),
  })
  .passthrough();

// ─── Type exports ─────────────────────────────────────────────────

export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type GraphMetadata = z.infer<typeof GraphMetadataSchema>;
export type GraphJson = z.infer<typeof GraphJsonSchema>;
