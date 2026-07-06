/**
 * VP2 O2 — the intake seed template must satisfy its own sacred-doc schema.
 *
 * step-07 instructs Butler to create `_context/sacred/context.md` from an
 * embedded template, then (step-07 §4 and step-11 §5) validates it against
 * `schemas/sacred-docs/context.schema.json`. Before the O2 fix the template
 * frontmatter omitted 3 of the 4 schema-required fields (`sacred`, `governance`,
 * `workflowType`), so a context.md written verbatim from the template FAILED its
 * own gate — every full-lane intake hit it. This test round-trips the actual
 * template through the real validator so that drift can never silently return:
 * fails-before / passes-after.
 */

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateSacredDocSchema } from "../src/governance/validate-schema";
import { packageRoot } from "../src/utils/paths";

/** Pull the fenced ```markdown template block out of a lifecycle step file. */
function extractTemplateBlock(stepFile: string): string {
  const raw = readFileSync(stepFile, "utf8");
  const m = /```markdown\n([\s\S]*?)```/.exec(raw);
  if (!m?.[1]) throw new Error(`no \`\`\`markdown template block found in ${stepFile}`);
  return m[1];
}

describe("intake seed template satisfies the context sacred-doc schema (VP2 O2)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-seed-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("step-07 context.md seed frontmatter validates against context.schema.json", async () => {
    const template = extractTemplateBlock(
      join(packageRoot, "lifecycle/1-bootstrap/intake/steps/step-07-intent-seed.md"),
    );
    const sacredDir = join(dir, "_context/sacred");
    mkdirSync(sacredDir, { recursive: true });
    const docPath = join(sacredDir, "context.md");
    writeFileSync(docPath, template, "utf8");

    const result = await validateSacredDocSchema(docPath, { docId: "context" });
    // Message surfaces the failing fields if the template drifts from the schema again.
    expect(result.ok, JSON.stringify(result.ok ? [] : result.issues)).toBe(true);
  });

  it("the seed template carries the draft governance the sacred-guard exemption keys off", () => {
    const template = extractTemplateBlock(
      join(packageRoot, "lifecycle/1-bootstrap/intake/steps/step-07-intent-seed.md"),
    );
    // O1 + O2 interlock: the seed must be `governance: draft` so it is schema-valid
    // AND freely editable during authoring; step-11 promotes it to `locked`.
    expect(template).toMatch(/governance:\s*"?draft"?/);
    expect(template).toMatch(/sacred:\s*true/);
    expect(template).toMatch(/workflowType:\s*"?context"?/);
  });
});
