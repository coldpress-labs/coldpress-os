/**
 * Ajv-backed sacred-doc frontmatter validator.
 *
 * Validates YAML frontmatter at the top of a sacred doc (context.md,
 * tech-stack.md, prd.md, architecture.md, pert-chart.md) against a JSON
 * Schema in `schemas/sacred-docs/`.
 *
 * Structural validation only — "required fields present, correct types,
 * valid enums". Semantic checks ("PRD must reference an ADR", "NFRs can't
 * contradict tech-stack choices") are Conftest/Rego territory
 * (`validate-sacred-doc`).
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
 * Sacred-doc ID → schema file mapping. Only these five are
 * structurally validated; everything else in `_context/` is prose.
 */
export const SACRED_DOC_SCHEMAS: Record<string, string> = {
  "context": "context.schema.json",
  "tech-stack": "tech-stack.schema.json",
  "prd": "prd.schema.json",
  "architecture": "architecture.schema.json",
  "pert-chart": "pert-chart.schema.json",
};

export function sacredDocIdFromPath(path: string): string | undefined {
  const base = basename(path).replace(/\.md$/, "");
  return base in SACRED_DOC_SCHEMAS ? base : undefined;
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

/** Testing hook — purge compiled-validator cache between test runs. */
export function _resetValidatorCache(): void {
  validatorCache.clear();
  ajvInstance = undefined;
}
