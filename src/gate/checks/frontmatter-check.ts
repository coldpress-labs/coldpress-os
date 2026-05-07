/**
 * Gate check: frontmatter-check
 *
 * Reads YAML frontmatter from a markdown file and asserts that a specified
 * field equals an expected value.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { extractFrontmatter } from "../../governance/validate-schema.js";

export interface FrontmatterCheckResult {
  ok: boolean;
  message: string;
  actual?: unknown;
}

export async function frontmatterCheck(
  filePath: string,
  field: string,
  expected: unknown,
): Promise<FrontmatterCheckResult> {
  const absPath = resolve(filePath);
  let raw: string;
  try {
    raw = await readFile(absPath, "utf8");
  } catch (e) {
    return { ok: false, message: `File not found: ${absPath}` };
  }

  const fm = extractFrontmatter(raw);
  if (!fm) {
    return { ok: false, message: `Malformed frontmatter in ${absPath}.` };
  }

  const actual = fm[field];
  const matches = actual === expected;

  return {
    ok: matches,
    message: matches
      ? `Field "${field}" = ${JSON.stringify(actual)} (expected ${JSON.stringify(expected)}).`
      : `Field "${field}" = ${JSON.stringify(actual)} but expected ${JSON.stringify(expected)}.`,
    actual,
  };
}
