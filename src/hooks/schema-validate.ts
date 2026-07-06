/**
 * `schema-validate` — PostToolUse(Write|Edit) hook (action plan §4.4).
 *
 * Any `_context/` artifact that HAS a registered schema must validate. On a
 * schema violation the errors are fed back to the model (PostToolUse block) so
 * it fixes the artifact in-loop — the "schema-violating artifact → rejected
 * in-loop" acceptance criterion. Reuses `src/governance/validate-schema.ts`
 * (Ajv frontmatter validation); it automatically covers more artifact types as
 * WS1-E extends `SACRED_DOC_SCHEMAS` / `PATH_PATTERN_SCHEMAS` routing.
 *
 * Files with no registered schema pass through untouched (no opinion) — the hook
 * gates on applicability BEFORE validating so unschema'd files never fail.
 * Overridable via COLDPRESS_OVERRIDE="schema-validate:<reason>".
 */

import {
  pathPatternSchemaFromPath,
  sacredDocIdFromPath,
  validateDocSchema,
} from "../governance/validate-schema.js";
import { designSchemaForPath } from "../../schemas/design/index.js";
import { dataArtefactSchemaForPath } from "../../schemas/data-artefacts/index.js";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const EXPLAIN = `schema-validate (PostToolUse: Write|Edit)
Validates any _context/ artifact that has a registered schema (sacred docs +
path-pattern-matched planning artifacts) against its JSON Schema after a write.
On a violation it feeds the field-level errors back to the model so the artifact
is fixed in-loop. Files without a registered schema pass through untouched.
Reuses src/governance/validate-schema.ts. Overridable (logged):
COLDPRESS_OVERRIDE="schema-validate:<reason>".`;

/**
 * A file is in scope only when it lives under _context/ and has a schema —
 * checked across ALL of validateDocSchema's routing sources so the hook fires
 * for every schema'd artefact: sacred docs, path-pattern (JSON) schemas, the
 * design registry, and the data-artefact registry (outcomes/story-graph/handoff,
 * DV1). If a validator can decide, the write-time hook must consult it.
 */
export function schemaApplies(filePath: string): boolean {
  const norm = filePath.replace(/\\/g, "/");
  if (!norm.includes("/_context/") && !norm.startsWith("_context/")) return false;
  return Boolean(
    sacredDocIdFromPath(filePath) ||
      pathPatternSchemaFromPath(filePath) ||
      designSchemaForPath(norm) ||
      dataArtefactSchemaForPath(norm),
  );
}

export const schemaValidateHandler: HookHandler = {
  name: "schema-validate",
  event: "PostToolUse",
  overrideGate: "schema-validate",
  explain: EXPLAIN,
  async run(input: HookInput): Promise<HookDecision> {
    const filePath = typeof input.tool_input?.file_path === "string" ? input.tool_input.file_path : "";
    if (!filePath || !schemaApplies(filePath)) return { kind: "none" };

    let result: Awaited<ReturnType<typeof validateDocSchema>>;
    try {
      result = await validateDocSchema(filePath);
    } catch {
      // File unreadable / vanished — fail-open (a validator error must not wedge).
      return { kind: "none" };
    }
    if (result.ok) return { kind: "none" };

    const issues = result.issues
      .slice(0, 8)
      .map((i) => `  - ${i.path}: ${i.message}`)
      .join("\n");
    return {
      kind: "deny",
      reason:
        `Schema validation failed for ${filePath}` +
        (result.schema_used ? ` (schema: ${result.schema_used})` : "") +
        `:\n${issues}\n` +
        `Fix the frontmatter to satisfy the schema, then re-save. ` +
        `Override (logged): COLDPRESS_OVERRIDE="schema-validate:<reason>".`,
    };
  },
};
