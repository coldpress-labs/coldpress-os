/**
 * Ajv-backed frontmatter validator.
 *
 * Validates YAML frontmatter at the top of:
 *   - Sacred docs (context.md, tech-stack.md, prd.md, architecture.md)
 *     → `schemas/sacred-docs/<id>.schema.json`
 *   - Phase 2 research outputs (`_context/planning/research/*.md`)
 *     → `schemas/research-output.schema.json`
 *   - Phase 2 distillates (`_context/planning/product-brief-v*.md`)
 *     → `schemas/distillates/product-brief.schema.json`
 *
 * Schema selection: basename-match for sacred docs; path-pattern-match for
 * research outputs and distillates (via `schemaIdFromPath`).
 *
 * Structural validation only — "required fields present, correct types,
 * valid enums". Semantic policy checks (e.g. PRD references ≥1 ADR) run at the phase-exit gates (`validate-frontmatter-min`).
 *
 * Pure function; no disk access outside `readFile(docPath)` and the
 * schema file itself.
 */

import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject, ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";
import { designSchemaForPath } from "../../schemas/design/index.js";
import { dataArtefactSchemaForPath } from "../../schemas/data-artefacts/index.js";
import { packageRoot } from "../utils/paths.js";

export interface SchemaValidationIssue {
  path: string;
  message: string;
  keyword?: string;
}

export type SchemaValidationResult =
  | { ok: true; frontmatter: Record<string, unknown> }
  | { ok: false; issues: SchemaValidationIssue[] };

/**
 * Sacred-doc ID → schema file (relative to `schemas/sacred-docs/`).
 * Only these five are structurally validated via basename match.
 */
export const SACRED_DOC_SCHEMAS: Record<string, string> = {
  "context": "context.schema.json",
  "tech-stack": "tech-stack.schema.json",
  "prd": "prd.schema.json",
  "architecture": "architecture.schema.json",
};

/**
 * Path-pattern routing for non-sacred-doc schema types.
 * Each entry: a path substring pattern → schema path relative to `schemas/`.
 * Patterns are tested in order; first match wins.
 */
export const PATH_PATTERN_SCHEMAS: Array<{ pattern: RegExp; schemaPath: string }> = [
  {
    // product-brief-v{N}.md in _context/planning/
    pattern: /product-brief-v\d+\.md$/,
    schemaPath: "distillates/product-brief.schema.json",
  },
  {
    // stack-selection-summary-v{N}.md in _context/planning/
    pattern: /stack-selection-summary-v\d+\.md$/,
    schemaPath: "distillates/stack-selection-summary.schema.json",
  },
  {
    // stack-shortlist-v{N}.md in _context/planning/
    pattern: /stack-shortlist-v\d+\.md$/,
    schemaPath: "planning-artefacts/stack-shortlist.schema.json",
  },
  {
    // ADRs: _context/planning/adrs/adr-*-v{N}.md
    pattern: /_context[\\/]planning[\\/]adrs[\\/]adr-.+-v\d+\.md$/,
    schemaPath: "planning-artefacts/adr.schema.json",
  },
  {
    // Stack-pack pack.yaml files
    pattern: /skills[\\/]stack-packs[\\/][^/]+[\\/]pack\.yaml$/,
    schemaPath: "pack.schema.json",
  },
  {
    // research output files in _context/planning/research/
    pattern: /_context[\\/]planning[\\/]research[\\/].+\.md$/,
    schemaPath: "research-output.schema.json",
  },

  // ── WS1-E: wire previously-orphaned schemas by their artifact output path ──
  // Paths mirror each producing skill's `output_file` frontmatter. Ambiguous /
  // WS2-owned schemas (story, stories-index, handoffs/*, legacy-migration-plan,
  // prototype-manifest, prd-amendment) are deferred to their workstreams — see
  // the execution ledger (WS1-E). (dev-story-output was dropped in WS11 S4 — no
  // producer ever materialised.)

  // Design (P5) — _context/design/* and the planning-side design-brief.
  { pattern: /_context[\\/]design[\\/]brand-guidelines-v\d+\.md$/, schemaPath: "design/brand-guidelines.schema.json" },
  { pattern: /_context[\\/]design[\\/]legacy-ui-assessment-v\d+\.md$/, schemaPath: "design/legacy-ui-assessment.schema.json" },
  { pattern: /_context[\\/]design[\\/]narrative-v\d+\.md$/, schemaPath: "design/narrative.schema.json" },
  { pattern: /_context[\\/]design[\\/]ux-design-spec-v\d+\.md$/, schemaPath: "design/ux-design-spec.schema.json" },
  { pattern: /_context[\\/]planning[\\/]design-brief-v\d+\.md$/, schemaPath: "design/design-brief.schema.json" },

  // Planning artefacts (P4/P7).
  { pattern: /_context[\\/]planning[\\/]epics-v\d+\.md$/, schemaPath: "planning-artefacts/epic.schema.json" },
  { pattern: /_context[\\/]planning[\\/]breakdown-scope-v\d+\.md$/, schemaPath: "planning-artefacts/breakdown-scope.schema.json" },
  { pattern: /_context[\\/]planning[\\/]planning-scope-v\d+\.md$/, schemaPath: "planning-artefacts/planning-scope.schema.json" },
  { pattern: /_context[\\/]planning[\\/]readiness-report-.+\.md$/, schemaPath: "planning-artefacts/implementation-readiness.schema.json" },

  // Audit / tracking artefacts (P8–P11). Note: some schemas live under
  // schemas/audit/ while their artifact lands under _context/tracking/.
  { pattern: /_context[\\/]audit[\\/]code-review-.+\.md$/, schemaPath: "audit/code-review.schema.json" },
  { pattern: /_context[\\/]audit[\\/]retro-epic-.+\.md$/, schemaPath: "audit/retrospective.schema.json" },
  { pattern: /_context[\\/]audit[\\/]deployment-readiness-.+\.md$/, schemaPath: "audit/readiness.schema.json" },
  { pattern: /_context[\\/]tracking[\\/]deploy-.+\.md$/, schemaPath: "audit/deploy-log.schema.json" },
  { pattern: /_context[\\/]planning[\\/]product-evolution-.+\.md$/, schemaPath: "audit/product-evolution-backlog.schema.json" },
  { pattern: /_context[\\/]planning[\\/]creative[\\/]innovation-.+\.md$/, schemaPath: "audit/innovation-strategy.schema.json" },
  { pattern: /_context[\\/]planning[\\/]sprint-change-proposal-.+\.md$/, schemaPath: "audit/course-correction.schema.json" },
  { pattern: /_context[\\/]tracking[\\/]sprint-status\.ya?ml$/, schemaPath: "tracking/sprint-status.schema.json" },

  // ── VP2 O32: wire the meta-sidecar + phase-handoff schemas that existed but were
  //    never registered (so neither the CLI verb nor the write-time hook validated
  //    them — a "no schema, no opinion" silence that read as "clean"). ──
  { pattern: /_context[\\/]sacred[\\/]architecture\.meta\.json$/, schemaPath: "handoffs/architecture-meta.schema.json" },
  { pattern: /_context[\\/]handoffs[\\/]phase-\d+-to-\d+-.+\.meta\.json$/, schemaPath: "handoffs/phase-handoff.schema.json" },
];

export function sacredDocIdFromPath(path: string): string | undefined {
  const base = basename(path).replace(/\.md$/, "");
  return base in SACRED_DOC_SCHEMAS ? base : undefined;
}

/** Returns a schema path (relative to `schemas/`) matched by path pattern, or undefined. */
export function pathPatternSchemaFromPath(path: string): string | undefined {
  const normalised = path.replace(/\\/g, "/");
  for (const entry of PATH_PATTERN_SCHEMAS) {
    if (entry.pattern.test(normalised)) return entry.schemaPath;
  }
  return undefined;
}

/**
 * Strip the leading `---\n…\n---` YAML frontmatter block. Returns the
 * parsed object, or `{}` if there is no frontmatter.
 */
export function extractFrontmatter(
  raw: string,
): Record<string, unknown> | undefined {
  if (!raw.startsWith("---")) return {};
  const endIdx = raw.indexOf("\n---", 3);
  if (endIdx === -1) return undefined;
  const yamlBody = raw.slice(3, endIdx).trim();
  try {
    const parsed = parseYaml(yamlBody);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return undefined;
  }
}

let ajvInstance: Ajv2020 | undefined;
const validatorCache = new Map<string, ValidateFunction>();

function getAjv(): Ajv2020 {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

async function loadValidator(docId: string): Promise<ValidateFunction> {
  const cached = validatorCache.get(docId);
  if (cached) return cached;

  const schemaFile = SACRED_DOC_SCHEMAS[docId];
  if (!schemaFile) {
    throw new Error(
      `No JSON Schema registered for sacred doc id "${docId}". Expected one of: ${Object.keys(SACRED_DOC_SCHEMAS).join(", ")}.`,
    );
  }
  const schemaPath = resolve(packageRoot, "schemas/sacred-docs", schemaFile);
  const schemaRaw = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(schemaRaw) as object;
  const validator = getAjv().compile(schema);
  validatorCache.set(docId, validator);
  return validator;
}

/**
 * Cross-referenced handoff sub-schemas. `phase-handoff.schema.json` `$ref`s these
 * by relative id (`design-delta.json`, `ops-delta.json`), so they must be added to
 * the Ajv instance before a handoff schema compiles (VP2 O32). Idempotent.
 */
async function ensureHandoffRefs(ajv: Ajv2020): Promise<void> {
  for (const rel of ["handoffs/design-delta.schema.json", "handoffs/ops-delta.schema.json"]) {
    const s = JSON.parse(await readFile(resolve(packageRoot, "schemas", rel), "utf8")) as { $id?: string };
    if (s.$id && !ajv.getSchema(s.$id)) ajv.addSchema(s);
  }
}

async function loadValidatorByRelPath(relSchemaPath: string): Promise<ValidateFunction> {
  const cached = validatorCache.get(relSchemaPath);
  if (cached) return cached;

  const ajv = getAjv();
  // Handoff schemas $ref sibling schemas — preload them so refs resolve.
  if (relSchemaPath.startsWith("handoffs/")) await ensureHandoffRefs(ajv);

  const schemaPath = resolve(packageRoot, "schemas", relSchemaPath);
  const schemaRaw = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(schemaRaw) as object;
  const validator = ajv.compile(schema);
  validatorCache.set(relSchemaPath, validator);
  return validator;
}

function ajvIssuesToIssues(errs: ErrorObject[] | null | undefined): SchemaValidationIssue[] {
  if (!errs) return [];
  return errs.map((e) => ({
    path: e.instancePath || "(root)",
    message: e.message ?? "invalid",
    keyword: e.keyword,
  }));
}

/**
 * Validate a sacred doc's frontmatter. `docPath` drives schema selection
 * by basename; pass `docId` to override.
 */
export async function validateSacredDocSchema(
  docPath: string,
  opts: { docId?: string } = {},
): Promise<SchemaValidationResult> {
  const docId = opts.docId ?? sacredDocIdFromPath(docPath);
  if (!docId) {
    return {
      ok: false,
      issues: [
        {
          path: "(file)",
          message: `Not a known sacred doc: ${basename(docPath)}. Expected one of: ${Object.keys(SACRED_DOC_SCHEMAS).join(", ")}`,
        },
      ],
    };
  }

  const raw = await readFile(docPath, "utf8");
  const frontmatter = extractFrontmatter(raw);
  if (frontmatter === undefined) {
    return {
      ok: false,
      issues: [
        {
          path: "(frontmatter)",
          message:
            "Malformed frontmatter: expected a closing `---` delimiter and valid YAML.",
        },
      ],
    };
  }

  const validator = await loadValidator(docId);
  if (validator(frontmatter)) {
    return { ok: true, frontmatter };
  }
  return { ok: false, issues: ajvIssuesToIssues(validator.errors) };
}

/**
 * Unified validator: routes by basename for sacred docs, then by path pattern
 * for research outputs and distillates. Returns a clear error if no schema
 * matches rather than silently passing.
 *
 * Use this instead of `validateSacredDocSchema` when the doc type is not
 * known at call time (e.g. generic validate-schema skill invocation).
 */
export async function validateDocSchema(
  docPath: string,
): Promise<SchemaValidationResult & { schema_used?: string }> {
  // 1. Try sacred-doc basename match
  const sacredId = sacredDocIdFromPath(docPath);
  if (sacredId) {
    const result = await validateSacredDocSchema(docPath, { docId: sacredId });
    return { ...result, schema_used: `sacred-docs/${SACRED_DOC_SCHEMAS[sacredId]}` };
  }

  // 2. Try path-pattern match. Markdown docs validate their FRONTMATTER; pure
  //    data files (.yaml/.yml/.json — e.g. sprint-status.yaml, WS10-B2) validate
  //    their WHOLE parsed body.
  const relSchemaPath = pathPatternSchemaFromPath(docPath);
  if (relSchemaPath) {
    const raw = await readFile(docPath, "utf8");
    const isData = /\.(ya?ml|json)$/.test(docPath);
    let body: Record<string, unknown> | undefined;
    if (isData) {
      try {
        body = (docPath.endsWith(".json") ? JSON.parse(raw) : parseYaml(raw)) as Record<string, unknown>;
      } catch (e) {
        return { ok: false, schema_used: relSchemaPath, issues: [{ path: "(file)", message: `Unparseable data file: ${e instanceof Error ? e.message : String(e)}` }] };
      }
    } else {
      body = extractFrontmatter(raw);
      if (body === undefined) {
        return {
          ok: false,
          issues: [{ path: "(frontmatter)", message: "Malformed frontmatter: expected closing `---` delimiter and valid YAML." }],
        };
      }
    }
    const validator = await loadValidatorByRelPath(relSchemaPath);
    if (validator(body)) {
      return { ok: true, frontmatter: body, schema_used: relSchemaPath };
    }
    return { ok: false, issues: ajvIssuesToIssues(validator.errors), schema_used: relSchemaPath };
  }

  // 3. Try the F6 design data-file registry (tokens.json / budgets.yaml /
  //    styleguide.yaml). These are DATA files (JSON/YAML), not markdown docs —
  //    validate the whole parsed body via the registered Zod parser (WS10-A2/C2).
  const design = designSchemaForPath(docPath.replace(/\\/g, "/"));
  if (design) {
    const raw = await readFile(docPath, "utf8");
    let body: unknown;
    try {
      body = docPath.endsWith(".json") ? JSON.parse(raw) : parseYaml(raw);
    } catch (e) {
      return { ok: false, issues: [{ path: "(file)", message: `Unparseable design artefact: ${e instanceof Error ? e.message : String(e)}` }] };
    }
    const result = design.schema.safeParse(body);
    if (result.success) {
      return { ok: true, frontmatter: body as Record<string, unknown>, schema_used: `design/${design.path.split("/").pop()}` };
    }
    return {
      ok: false,
      schema_used: `design/${design.path.split("/").pop()}`,
      issues: result.error.issues.map((i) => ({ path: i.path.join(".") || "(root)", message: i.message, keyword: i.code })),
    };
  }

  // 3b. Try the data-artefact registry (DV1): outcomes.yaml / story-graph.yaml /
  //     HND-*.yaml handoff packets — WS10-era Zod-schema'd DATA files that were
  //     missing from the schema-validate routing.
  const data = dataArtefactSchemaForPath(docPath.replace(/\\/g, "/"));
  if (data) {
    const raw = await readFile(docPath, "utf8");
    let body: unknown;
    try {
      body = docPath.endsWith(".json") ? JSON.parse(raw) : parseYaml(raw);
    } catch (e) {
      return { ok: false, issues: [{ path: "(file)", message: `Unparseable data artefact: ${e instanceof Error ? e.message : String(e)}` }] };
    }
    const result = data.schema.safeParse(body);
    if (result.success) {
      return { ok: true, frontmatter: body as Record<string, unknown>, schema_used: `data-artefacts/${basename(data.path)}` };
    }
    return {
      ok: false,
      schema_used: `data-artefacts/${basename(data.path)}`,
      issues: result.error.issues.map((i) => ({ path: i.path.join(".") || "(root)", message: i.message, keyword: i.code })),
    };
  }

  // 4. No schema found
  return {
    ok: false,
    issues: [
      {
        path: "(file)",
        message: `No schema registered for: ${basename(docPath)}. Register it in SACRED_DOC_SCHEMAS (by basename), PATH_PATTERN_SCHEMAS (by path pattern), the design registry (schemas/design/index.ts), or the data-artefact registry (schemas/data-artefacts/index.ts).`,
      },
    ],
  };
}

/** Testing hook — purge compiled-validator cache between test runs. */
export function _resetValidatorCache(): void {
  validatorCache.clear();
  ajvInstance = undefined;
}
