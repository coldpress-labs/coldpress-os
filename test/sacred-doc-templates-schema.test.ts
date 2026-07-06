/**
 * VP2 O12 — every sacred-doc creation template must satisfy its own schema's
 * required-field contract.
 *
 * The Phase-1 (O2) and Phase-3 (O12) harvests found the same class of bug in
 * more than one place: an authoring skill embeds a frontmatter template that
 * omits or mistypes fields its sacred-doc schema *requires*, so a doc written
 * verbatim fails its own gate and the agent burns turns reverse-engineering the
 * schema. This test round-trips the actual creation template for all four
 * sacred docs (context, tech-stack, prd, architecture) against the required-field
 * constraints declared in their schemas — so this drift class can't silently
 * return. It checks the *required* fields only (const/pattern/enum), which are
 * placeholder-free by construction; optional fields like `created` carry `<ISO>`
 * placeholders the agent fills at authoring time and are out of scope here.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { packageRoot } from "../src/utils/paths";

interface Case {
  id: string;
  /** Step file that embeds the doc's creation-template frontmatter. */
  file: string;
  /** Fence language the template lives in. */
  fence: "markdown" | "yaml";
}

// Each doc's creation template (the one written at first authoring), NOT the
// later lock/emit deltas.
const CASES: Case[] = [
  { id: "context", file: "lifecycle/1-bootstrap/intake/steps/step-07-intent-seed.md", fence: "markdown" },
  { id: "tech-stack", file: "lifecycle/3-tech-stack/stack-locking/steps/step-02-document.md", fence: "yaml" },
  { id: "prd", file: "lifecycle/4-planning/create-prd/steps/step-05-finalize.md", fence: "yaml" },
  { id: "architecture", file: "lifecycle/6-architecture/architecture-design/steps/step-02-overview.md", fence: "yaml" },
];

/** Strip a leading fenced code block, dedent it, and drop `---` frontmatter fences. */
function extractTemplateFrontmatter(fileRel: string, fence: string): Record<string, unknown> {
  const raw = readFileSync(join(packageRoot, fileRel), "utf8");
  const re = new RegExp("```" + fence + "\\n([\\s\\S]*?)```");
  const m = re.exec(raw);
  if (!m?.[1]) throw new Error(`no \`\`\`${fence} template block in ${fileRel}`);

  // Dedent by the smallest indent of non-blank lines (prd's block is list-indented).
  const lines = m[1].split("\n");
  const indents = lines.filter((l) => l.trim()).map((l) => (l.match(/^ */)?.[0].length ?? 0));
  const min = indents.length ? Math.min(...indents) : 0;
  let block = lines.map((l) => l.slice(min)).join("\n").trim();

  // If the block is a full `---`-fenced document, keep only the frontmatter.
  if (block.startsWith("---")) {
    const end = block.indexOf("\n---", 3);
    block = end >= 0 ? block.slice(3, end) : block.slice(3);
  }
  const parsed = parseYaml(block);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`template frontmatter in ${fileRel} did not parse to an object`);
  }
  return parsed as Record<string, unknown>;
}

function loadSchema(id: string): {
  required: string[];
  properties: Record<string, { const?: unknown; enum?: unknown[]; pattern?: string; type?: string }>;
} {
  return JSON.parse(readFileSync(join(packageRoot, "schemas/sacred-docs", `${id}.schema.json`), "utf8"));
}

describe("sacred-doc creation templates satisfy their schema required-field contract (VP2 O2/O12)", () => {
  for (const c of CASES) {
    it(`${c.id}: creation template has all schema-required fields, correctly typed`, () => {
      const fm = extractTemplateFrontmatter(c.file, c.fence);
      const schema = loadSchema(c.id);

      for (const key of schema.required) {
        expect(fm, `${c.id}: missing required field "${key}"`).toHaveProperty(key);
        const spec = schema.properties[key] ?? {};
        const value = fm[key];
        if ("const" in spec) {
          expect(value, `${c.id}.${key} must equal const`).toBe(spec.const);
        }
        if (spec.enum) {
          expect(spec.enum, `${c.id}.${key}="${String(value)}" not in enum`).toContain(value);
        }
        if (spec.pattern) {
          // Catches architecture's former numeric `version: 1.0` (a number fails type:string).
          expect(typeof value, `${c.id}.${key} must be a string`).toBe("string");
          expect(String(value), `${c.id}.${key}="${String(value)}" fails pattern ${spec.pattern}`).toMatch(
            new RegExp(spec.pattern),
          );
        }
        if (spec.type === "array") {
          expect(Array.isArray(value), `${c.id}.${key} must be an array`).toBe(true);
        }
      }
    });
  }
});
