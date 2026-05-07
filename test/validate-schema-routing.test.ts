/**
 * validate-schema routing smoke-tests (§4.14).
 *
 * 4 positive route assertions + 4 anti-route negatives.
 * Anti-route: a valid ADR document at a stack-shortlist path should fail
 * schema validation (schema mismatch, not structural error).
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PATH_PATTERN_SCHEMAS,
  _resetValidatorCache,
  pathPatternSchemaFromPath,
  validateDocSchema,
} from "../src/governance/validate-schema";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-routing-"));
  _resetValidatorCache();
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function writeDoc(name: string, frontmatter: Record<string, unknown>, body = "# doc"): Promise<string> {
  const path = join(workDir, name);
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");
  await writeFile(path, `---\n${fm}\n---\n\n${body}\n`, "utf8");
  return path;
}

describe("PATH_PATTERN_SCHEMAS routing", () => {
  it("routes product-brief-v{N}.md to distillates/product-brief schema", () => {
    expect(pathPatternSchemaFromPath("_context/planning/product-brief-v1.md"))
      .toBe("distillates/product-brief.schema.json");
  });

  it("routes stack-shortlist-v{N}.md to planning-artefacts/stack-shortlist schema", () => {
    expect(pathPatternSchemaFromPath("_context/planning/stack-shortlist-v2.md"))
      .toBe("planning-artefacts/stack-shortlist.schema.json");
  });

  it("routes adr-*-v{N}.md to planning-artefacts/adr schema", () => {
    expect(pathPatternSchemaFromPath("_context/planning/adrs/adr-database-v1.md"))
      .toBe("planning-artefacts/adr.schema.json");
  });

  it("routes stack-selection-summary-v{N}.md to distillates/stack-selection-summary schema", () => {
    expect(pathPatternSchemaFromPath("_context/planning/stack-selection-summary-v1.md"))
      .toBe("distillates/stack-selection-summary.schema.json");
  });
});

describe("Anti-route: valid ADR doc at shortlist path → schema-mismatch error", () => {
  it("fails validation (const check) when an ADR-shaped doc is placed at a shortlist path", async () => {
    const path = await writeDoc("stack-shortlist-v1.md", {
      name: "adr",
      decision_area: "database",
      phase_authored: 3,
      status: "accepted",
      version: "1.0",
      tier: "T2",
      derived_from: ["_context/planning/stack-shortlist-v1.md"],
      options: ["Convex", "Supabase"],
      chosen: "Convex",
      rubric: {
        fit: 9, cost: 7, team_familiarity: 6, ecosystem: 8,
        lock_in: 5, vibe_fit: 9, weighted_total: 7.5,
      },
    });

    const result = await validateDocSchema(path);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.keyword === "const")).toBe(true);
    }
  });
});

describe("Anti-route: unknown file types return 'no schema' error", () => {
  it("returns no-schema error for arbitrary markdown file", async () => {
    const path = await writeDoc("notes.md", { title: "notes" });
    const result = await validateDocSchema(path);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("No schema registered");
    }
  });
});
