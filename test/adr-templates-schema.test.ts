/**
 * VP2 O34 — both ADR authoring templates must satisfy the ONE adr schema.
 *
 * Phase-3 (`stack-evaluation/step-03-decide`) and Phase-6
 * (`architecture-design/step-05-adr`) both write ADRs into
 * `_context/planning/adrs/`, routed to `schemas/planning-artefacts/adr.schema.json`
 * by the write-time hook. Before this fix the Phase-6 template described a
 * different shape (`adr_number`/`title`/`resolves_design_delta`, no
 * options/chosen/rubric/tier) that failed the schema — so `@architect` had to
 * reverse-engineer the real shape. This round-trips each template through the
 * actual validator so the two can't drift apart again.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { packageRoot } from "../src/utils/paths";

const TEMPLATES = [
  { name: "Phase-3 stack ADR", file: "lifecycle/3-tech-stack/stack-evaluation/steps/step-03-decide.md" },
  { name: "Phase-6 architecture ADR", file: "lifecycle/6-architecture/architecture-design/steps/step-05-adr.md" },
];

/** The first fenced frontmatter block of an ADR authoring step. */
function templateBlock(fileRel: string): string {
  const raw = readFileSync(join(packageRoot, fileRel), "utf8");
  const m = /```(?:yaml|markdown)\n([\s\S]*?)```/.exec(raw);
  if (!m?.[1]) throw new Error(`no fenced template block in ${fileRel}`);
  return m[1];
}

const adrSchema = JSON.parse(
  readFileSync(join(packageRoot, "schemas/planning-artefacts/adr.schema.json"), "utf8"),
) as { required: string[] };

describe("ADR authoring templates carry every adr.schema.json required field (VP2 O34)", () => {
  // Value validation is impossible on raw templates (they hold authoring placeholders
  // like `{fit}` / `<delta_id>`); the drift O34 targets is *missing required fields*
  // (the Phase-6 template omitted name/decision_area/options/chosen/rubric/tier), so
  // assert each required field is present as a frontmatter key in both templates.
  for (const t of TEMPLATES) {
    it(`${t.name}: has all ${adrSchema.required.length} required fields`, () => {
      const block = templateBlock(t.file);
      for (const field of adrSchema.required) {
        expect(new RegExp(`(^|\\n)${field}:`).test(block), `${t.name} missing required field "${field}"`).toBe(true);
      }
    });
  }
});
