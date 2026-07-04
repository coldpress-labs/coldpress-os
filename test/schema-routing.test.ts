/**
 * WS1-E — schema routing coverage. Verifies the extended PATH_PATTERN_SCHEMAS
 * routing resolves the newly-wired artifact families AND that every routed
 * schema file actually exists (guards against dangling schema paths).
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PATH_PATTERN_SCHEMAS,
  SACRED_DOC_SCHEMAS,
  pathPatternSchemaFromPath,
} from "../src/governance/validate-schema";

const schemasDir = join(__dirname, "../schemas");

describe("PATH_PATTERN_SCHEMAS — every routed schema file exists", () => {
  it("has no dangling schemaPath", () => {
    for (const { schemaPath } of PATH_PATTERN_SCHEMAS) {
      expect(existsSync(join(schemasDir, schemaPath)), schemaPath).toBe(true);
    }
  });
});

describe("SACRED_DOC_SCHEMAS — every sacred schema file exists", () => {
  it("has no dangling sacred schema", () => {
    for (const file of Object.values(SACRED_DOC_SCHEMAS)) {
      expect(existsSync(join(schemasDir, "sacred-docs", file)), file).toBe(true);
    }
  });
});

describe("WS1-E wired routes resolve", () => {
  const cases: [string, string][] = [
    ["_context/design/brand-guidelines-v1.md", "design/brand-guidelines.schema.json"],
    ["_context/design/ux-design-spec-v2.md", "design/ux-design-spec.schema.json"],
    ["_context/planning/design-brief-v1.md", "design/design-brief.schema.json"],
    ["_context/planning/epics-v1.md", "planning-artefacts/epic.schema.json"],
    ["_context/planning/breakdown-scope-v1.md", "planning-artefacts/breakdown-scope.schema.json"],
    ["_context/audit/code-review-2026-07-02.md", "audit/code-review.schema.json"],
    ["_context/audit/retro-epic-1-2026-07-02.md", "audit/retrospective.schema.json"],
    ["_context/tracking/deploy-2026-07-02.md", "audit/deploy-log.schema.json"],
    ["_context/tracking/sprint-status.yaml", "tracking/sprint-status.schema.json"],
  ];
  for (const [path, expected] of cases) {
    it(`routes ${path}`, () => {
      expect(pathPatternSchemaFromPath(path)).toBe(expected);
    });
  }

  it("does NOT route an unrelated file", () => {
    expect(pathPatternSchemaFromPath("src/index.ts")).toBeUndefined();
    expect(pathPatternSchemaFromPath("_context/planning/random-note.md")).toBeUndefined();
  });
});
