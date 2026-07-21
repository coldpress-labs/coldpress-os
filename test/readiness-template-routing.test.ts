/**
 * VP2 O44 — the Phase-9 readiness report must actually reach its schema.
 *
 * Two independent breaks made `schemas/audit/readiness.schema.json` dead code:
 *
 *  1. **Routing.** The path-pattern router only matched
 *     `_context/audit/deployment-readiness-*.md`, but the `readiness` skill
 *     declares its output at `_context/audit/readiness-v{N}.md`. A report
 *     written exactly as specified was never validated.
 *  2. **No template.** The skill shipped no frontmatter template at all, while
 *     the schema requires nine fields — so `@devops` had to invent the shape,
 *     and did (VP2's real run emitted a readiness report with none of them).
 *
 * Same drift class as O2/O12/O34: a schema nobody routes to and nobody is told
 * how to satisfy. This pins both ends.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { pathPatternSchemaFromPath } from "../src/governance/validate-schema";
import { packageRoot } from "../src/utils/paths";

const SKILL_REL = "lifecycle/9-deployment/readiness/SKILL.md";
const READINESS_SCHEMA = "audit/readiness.schema.json";

const schema = JSON.parse(
  readFileSync(join(packageRoot, "schemas/audit/readiness.schema.json"), "utf8"),
) as { required: string[] };

describe("readiness report routing (VP2 O44)", () => {
  it("routes the path the skill actually declares", () => {
    expect(pathPatternSchemaFromPath("_context/audit/readiness-v1.md")).toBe(READINESS_SCHEMA);
    expect(pathPatternSchemaFromPath("_context/audit/readiness-v12.md")).toBe(READINESS_SCHEMA);
  });

  it("still routes the legacy deployment-readiness-* path (back-compat)", () => {
    expect(pathPatternSchemaFromPath("_context/audit/deployment-readiness-2026-07-20.md")).toBe(
      READINESS_SCHEMA,
    );
  });

  it("does not over-match unrelated audit artifacts", () => {
    expect(pathPatternSchemaFromPath("_context/audit/readiness-notes.md")).not.toBe(READINESS_SCHEMA);
  });
});

describe("readiness SKILL.md template satisfies the schema (VP2 O44)", () => {
  // Value validation is impossible on a raw template (it holds authoring
  // placeholders like `<ISO-8601>`); the drift O44 targets is *missing required
  // fields*, so assert each one is present as a frontmatter key in the template.
  const raw = readFileSync(join(packageRoot, SKILL_REL), "utf8");
  const block = /```yaml\n---\n([\s\S]*?)---\n```/.exec(raw)?.[1];

  it("ships a fenced frontmatter template", () => {
    expect(block, `no yaml frontmatter template block in ${SKILL_REL}`).toBeTruthy();
  });

  for (const field of schema.required) {
    it(`template carries required field "${field}"`, () => {
      expect(new RegExp(`(^|\\n)${field}:`).test(block ?? "")).toBe(true);
    });
  }

  it("template's checks[] entry carries the item-level required fields", () => {
    for (const field of ["check_id", "kind", "status"]) {
      expect(new RegExp(`\\n\\s+-?\\s*${field}:`).test(block ?? ""), field).toBe(true);
    }
  });
});
