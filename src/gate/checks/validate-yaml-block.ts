/**
 * Gate check: validate-yaml-block
 *
 * Reads a named top-level YAML block from a file (e.g., `baselines:` from coldpress.yaml)
 * and validates it against a JSON schema.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { packageRoot } from "../../utils/paths.js";
import type { SchemaValidationIssue } from "../../governance/validate-schema.js";

export interface ValidateYamlBlockResult {
  ok: boolean;
  issues?: SchemaValidationIssue[];
  message?: string;
}

let ajv: Ajv2020 | undefined;
function getAjv(): Ajv2020 {
  if (!ajv) {
    ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
  }
  return ajv;
}

export async function validateYamlBlock(
  filePath: string,
  blockKey: string,
  schemaRelPath: string,
): Promise<ValidateYamlBlockResult> {
  const absPath = resolve(filePath);
  const raw = await readFile(absPath, "utf8");

  let parsed: Record<string, unknown>;
  try {
    parsed = parseYaml(raw) as Record<string, unknown>;
  } catch (e) {
    return { ok: false, message: `Failed to parse YAML at ${filePath}: ${String(e)}` };
  }

  if (!(blockKey in parsed)) {
    return {
      ok: false,
      message: `Block "${blockKey}:" not found in ${filePath}. Ensure the owning phase has run and written this block.`,
    };
  }

  const block = parsed[blockKey];
  const schemaPath = resolve(packageRoot, "schemas", schemaRelPath);
  const schemaRaw = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(schemaRaw) as object;

  const validate = getAjv().compile(schema);
  if (validate(block)) {
    return { ok: true };
  }

  const issues: SchemaValidationIssue[] = (validate.errors ?? []).map((e) => ({
    path: e.instancePath || "(root)",
    message: e.message ?? "invalid",
    keyword: e.keyword,
  }));

  return { ok: false, issues };
}
