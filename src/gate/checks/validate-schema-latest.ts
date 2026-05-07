/**
 * Gate check: validate-schema-latest
 *
 * Resolves a glob to the highest-versioned file (by `v{N}` numeric suffix)
 * and validates it against the specified schema.
 */

import { glob } from "node:fs/promises";
import { resolve, join } from "node:path";
import { validateDocSchema } from "../../governance/validate-schema.js";
import type { SchemaValidationResult } from "../../governance/validate-schema.js";

export interface ValidateSchemaLatestResult extends SchemaValidationResult {
  resolved_path?: string;
  schema_used?: string;
}

function extractVersion(filename: string): number {
  const match = /v(\d+)\.md$/.exec(filename);
  return match ? parseInt(match[1]!, 10) : -1;
}

export async function validateSchemaLatest(
  projectRoot: string,
  globPattern: string,
): Promise<ValidateSchemaLatestResult> {
  const absPattern = resolve(projectRoot, globPattern);
  const matched: string[] = [];
  try {
    for await (const f of glob(absPattern)) matched.push(f);
  } catch {
    // no match
  }

  if (matched.length === 0) {
    return {
      ok: false,
      issues: [{ path: "(file)", message: `No files matched: ${globPattern}` }],
    };
  }

  // Sort by version number descending, pick highest
  matched.sort((a, b) => extractVersion(b) - extractVersion(a));
  const latest = matched[0]!;

  const result = await validateDocSchema(latest);
  return {
    ...result,
    resolved_path: latest,
    schema_used: (result as { schema_used?: string }).schema_used,
  };
}
