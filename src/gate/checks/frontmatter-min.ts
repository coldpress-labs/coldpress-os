/**
 * Gate check: frontmatter-min
 *
 * Asserts a doc's frontmatter array field has at least `min` items. This is the
 * WS11 fold of the two retired Conftest/Rego governance policies into phase gates
 * (the correct at-checkpoint timing — the always-on schema-validate hook *blocks*
 * writes, so a base-schema `required` would reject an in-progress doc):
 *   - P4 exit: `prd.md` must reference ≥1 ADR (adr_references).
 *   - P6 exit: `architecture.md` must name ≥1 approver (approvers).
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

export interface FrontmatterMinResult {
  ok: boolean;
  message: string;
}

export async function frontmatterMin(
  projectRoot: string,
  docPath: string,
  field: string,
  min: number,
): Promise<FrontmatterMinResult> {
  const abs = resolve(projectRoot, docPath);
  let raw: string;
  try {
    raw = await readFile(abs, "utf8");
  } catch {
    return { ok: false, message: `File not found: ${docPath}.` };
  }
  const m = /^---\n([\s\S]*?)\n---/.exec(raw);
  if (!m) {
    return { ok: false, message: `No frontmatter block in ${docPath}.` };
  }
  let fm: Record<string, unknown>;
  try {
    fm = (parseYaml(m[1]!) as Record<string, unknown>) ?? {};
  } catch (e) {
    return { ok: false, message: `Unparseable frontmatter in ${docPath}: ${e instanceof Error ? e.message : String(e)}` };
  }
  const val = fm[field];
  const count = Array.isArray(val) ? val.length : 0;
  if (count >= min) {
    return { ok: true, message: `${docPath}: ${field} has ${count} item(s) (≥ ${min}).` };
  }
  return {
    ok: false,
    message: `${docPath}: ${field} has ${count} item(s), needs ≥ ${min}. ${field === "adr_references" ? "Link at least one ADR (ADR-NNNN)." : field === "approvers" ? "Add at least one named approver." : ""}`.trim(),
  };
}
