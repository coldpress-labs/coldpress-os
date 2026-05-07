/**
 * Gate check: validate-adrs
 *
 * For each decision_area in the shortlist, asserts that:
 * 1. An ADR file exists at `_context/planning/adrs/adr-{area}-v{N}.md`
 * 2. The ADR validates against `schemas/planning-artefacts/adr.schema.json`
 * 3. The `tier` field is present
 * 4. The `status` is "accepted" (not "proposed" or "superseded")
 */

import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { resolve, join } from "node:path";
import { parseAllDocuments } from "yaml";
import { validateDocSchema } from "../../governance/validate-schema.js";
import { extractFrontmatter } from "../../governance/validate-schema.js";
import { packageRoot } from "../../utils/paths.js";

export interface ValidateAdrsResult {
  ok: boolean;
  passed: string[];
  failed: Array<{ area: string; reason: string }>;
}

export async function validateAdrs(
  projectRoot: string,
  shortlistPath: string,
): Promise<ValidateAdrsResult> {
  const absShortlist = resolve(projectRoot, shortlistPath);
  const shortlistRaw = await readFile(absShortlist, "utf8");
  const frontmatter = extractFrontmatter(shortlistRaw);

  if (!frontmatter) {
    return {
      ok: false,
      passed: [],
      failed: [{ area: "(shortlist)", reason: "Malformed frontmatter in shortlist file." }],
    };
  }

  const areas = (frontmatter.decision_areas as Array<{ area: string }> | undefined) ?? [];
  const adrsDir = resolve(projectRoot, "_context/planning/adrs");

  const passed: string[] = [];
  const failed: Array<{ area: string; reason: string }> = [];

  for (const { area } of areas) {
    const slug = area.toLowerCase().replace(/\s+/g, "-");
    // Find highest-version ADR for this area
    let adrFiles: string[] = [];
    try {
      const pattern = join(adrsDir, `adr-${slug}-v*.md`);
      adrFiles = [];
      for await (const f of glob(pattern)) adrFiles.push(f);
    } catch {
      // glob error — no files
    }

    if (adrFiles.length === 0) {
      failed.push({ area, reason: `No ADR file found for area "${area}" at ${adrsDir}/adr-${slug}-v*.md` });
      continue;
    }

    // Use latest version (sort lexicographically — vN suffix)
    adrFiles.sort();
    const adrPath = adrFiles[adrFiles.length - 1]!;

    const result = await validateDocSchema(adrPath);
    if (!result.ok) {
      failed.push({
        area,
        reason: `ADR schema validation failed: ${result.issues.map((i) => i.message).join("; ")}`,
      });
      continue;
    }

    const fm = result.frontmatter as Record<string, unknown>;
    if (!fm["tier"]) {
      failed.push({ area, reason: `ADR missing required "tier" field (T1|T2|T3).` });
      continue;
    }
    if (fm["status"] !== "accepted") {
      failed.push({ area, reason: `ADR status is "${fm["status"]}" — must be "accepted" for gate to pass.` });
      continue;
    }

    passed.push(area);
  }

  return { ok: failed.length === 0, passed, failed };
}
