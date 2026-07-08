/**
 * Data-artefact schema registry (DV1) — the sibling of the design registry
 * (`schemas/design/index.ts`) for the WS10-era `_context/` DATA artefacts whose
 * schemas are Zod, not JSON: `outcomes.yaml` (P4), `story-graph.yaml` (P7), and
 * the `HND-*.yaml` handoff packets. Each already had a Zod schema + a dedicated
 * phase-exit checker (`coldpress outcomes check`, `coldpress waves`, boundary-guard),
 * but none was in the `schema-validate` PostToolUse routing — so a malformed one
 * passed the write-time hook with "no opinion". This registry closes that gap so
 * they validate in-loop like every other schema'd artefact (§4.4).
 */

import { z } from "zod";
import { OutcomesSchema, parseOutcomes } from "../planning-artefacts/outcomes.schema.js";
import { StoryGraphSchema, parseStoryGraph } from "../story-graph.schema.js";
import { HandoffPacketSchema, parseHandoffPacket } from "../handoff.schema.js";
import { PrdToArchitectureSchema } from "../handoffs/prd-to-architecture.schema.js";

/** A registered data artefact: how to locate it and how to validate it. */
export interface DataArtefactSchema {
  /** Canonical instance path under a project (for docs/diagnostics). */
  path: string;
  /** Regex matching that instance path (for the validator to route by). */
  pattern: RegExp;
  /** Zod schema for the artefact. */
  schema: z.ZodTypeAny;
  /** Throwing parser (validates + returns the typed value). */
  parse: (input: unknown) => unknown;
}

/** One entry per validated data artefact (Zod-schema'd YAML/JSON under _context/). */
export const DATA_ARTEFACT_SCHEMAS: Record<string, DataArtefactSchema> = {
  outcomes: {
    path: "_context/planning/outcomes.yaml",
    pattern: /_context[\\/]planning[\\/]outcomes\.ya?ml$/,
    schema: OutcomesSchema,
    parse: parseOutcomes,
  },
  // VP2 O32: the PRD→architecture sidecar (Zod-schema'd JSON) was never routed.
  "prd-meta": {
    path: "_context/sacred/prd.meta.json",
    pattern: /_context[\\/]sacred[\\/]prd\.meta\.json$/,
    schema: PrdToArchitectureSchema,
    parse: (input: unknown) => PrdToArchitectureSchema.parse(input),
  },
  "story-graph": {
    path: "_context/implementation/story-graph.yaml",
    pattern: /_context[\\/]implementation[\\/]story-graph\.ya?ml$/,
    schema: StoryGraphSchema,
    parse: parseStoryGraph,
  },
  handoff: {
    path: "_context/handoffs/HND-*.yaml",
    pattern: /_context[\\/]handoffs[\\/]HND-.*\.ya?ml$/,
    schema: HandoffPacketSchema,
    parse: parseHandoffPacket,
  },
};

/** Resolve the data-artefact schema registered for an instance path, if any. */
export function dataArtefactSchemaForPath(path: string): DataArtefactSchema | undefined {
  return Object.values(DATA_ARTEFACT_SCHEMAS).find((s) => s.pattern.test(path));
}
