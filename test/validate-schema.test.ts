/**
 * Ajv-backed sacred-doc frontmatter validator tests (§5.2).
 *
 * Exercises the in-process validator against the 4 shipped sacred-doc
 * JSON Schemas, via fixture docs written to a tmpdir.
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdir } from "node:fs/promises";
import {
  SACRED_DOC_SCHEMAS,
  _resetValidatorCache,
  extractFrontmatter,
  sacredDocIdFromPath,
  validateDocSchema,
  validateSacredDocSchema,
} from "../src/governance/validate-schema";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-validate-schema-"));
  _resetValidatorCache();
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function writeDoc(name: string, frontmatter: string, body = "# doc"): Promise<string> {
  const path = join(workDir, name);
  await writeFile(path, `---\n${frontmatter}\n---\n\n${body}\n`, "utf8");
  return path;
}

async function writeData(rel: string, contents: string): Promise<string> {
  const path = join(workDir, rel);
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, contents, "utf8");
  return path;
}

describe("validateDocSchema — F6 design data-file registry (WS10-C2)", () => {
  it("routes _context/design/budgets.yaml to the Zod budgets schema + accepts a valid one", async () => {
    const p = await writeData(
      "_context/design/budgets.yaml",
      "performance: { lcp_ms: 1800, cls: 0.1 }\nweight: { js_kb: 150 }\naccessibility: { wcag_level: AA }\n",
    );
    const result = await validateDocSchema(p);
    expect(result.ok, JSON.stringify(result)).toBe(true);
    expect(result.schema_used).toBe("design/budgets.yaml");
  });

  it("rejects an invalid budgets.yaml with Zod issues", async () => {
    const p = await writeData("_context/design/budgets.yaml", "performance: { lcp_ms: -1, cls: 0.1 }\nweight: { js_kb: 150 }\naccessibility: { wcag_level: ZZ }\n");
    const result = await validateDocSchema(p);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.length).toBeGreaterThan(0);
  });

  it("routes tokens.json + styleguide.yaml through the registry too", async () => {
    const tokens = await writeData(
      "_context/design/tokens.json",
      JSON.stringify({ typography: { families: { sans: "Inter" }, sizes: { base: "1rem" } }, color: { roles: { primary: { light: "#3b82f6" } } }, spacing: { "1": "4px" } }),
    );
    expect((await validateDocSchema(tokens)).ok).toBe(true);
    const sg = await writeData("_context/design/styleguide.yaml", "sections: [{ id: buttons, title: Buttons, components: [Button] }]\nbaselines: { dir: baselines }\n");
    expect((await validateDocSchema(sg)).ok).toBe(true);
  });
});

describe("SACRED_DOC_SCHEMAS", () => {
  it("covers the 4 canonical sacred docs (PERT retired)", () => {
    expect(Object.keys(SACRED_DOC_SCHEMAS).sort()).toEqual(
      ["architecture", "context", "prd", "tech-stack"],
    );
  });
});

describe("sacredDocIdFromPath", () => {
  it("resolves by basename", () => {
    expect(sacredDocIdFromPath("/a/b/prd.md")).toBe("prd");
    expect(sacredDocIdFromPath("architecture.md")).toBe("architecture");
  });

  it("returns undefined for unknown docs", () => {
    expect(sacredDocIdFromPath("readme.md")).toBeUndefined();
    expect(sacredDocIdFromPath("_context/sacred/notes.md")).toBeUndefined();
  });
});

describe("extractFrontmatter", () => {
  it("parses well-formed frontmatter", () => {
    const fm = extractFrontmatter("---\nfoo: bar\nnum: 3\n---\nbody\n");
    expect(fm).toEqual({ foo: "bar", num: 3 });
  });

  it("returns {} for docs with no frontmatter", () => {
    expect(extractFrontmatter("# just a body\n")).toEqual({});
  });

  it("returns undefined when closing --- missing", () => {
    expect(extractFrontmatter("---\nfoo: bar\nbody\n")).toBeUndefined();
  });
});

describe("validateSacredDocSchema — PRD", () => {
  it("accepts a well-formed PRD frontmatter", async () => {
    const p = await writeDoc(
      "prd.md",
      [
        "sacred: true",
        'version: "1.0"',
        'created: "2026-04-24"',
        'last_modified: "2026-04-24"',
        'governance: "requires-review"',
        'workflowType: "prd"',
        "stepsCompleted: []",
        "inputDocuments: []",
        'adr_references: ["ADR-0001"]',
      ].join("\n"),
    );
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(true);
  });

  it("rejects PRD missing required fields", async () => {
    const p = await writeDoc("prd.md", 'workflowType: "prd"');
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const missing = result.issues.map((i) => i.message).join(" ");
      expect(missing).toMatch(/required|must have/i);
    }
  });

  it("rejects PRD with wrong workflowType", async () => {
    const p = await writeDoc(
      "prd.md",
      [
        "sacred: true",
        'version: "1.0"',
        'governance: "requires-review"',
        'workflowType: "architecture"',
      ].join("\n"),
    );
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(false);
  });

  it("rejects PRD with sacred: false", async () => {
    const p = await writeDoc(
      "prd.md",
      [
        "sacred: false",
        'version: "1.0"',
        'governance: "requires-review"',
        'workflowType: "prd"',
      ].join("\n"),
    );
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(false);
  });

  it("rejects PRD with invalid ADR-reference pattern", async () => {
    const p = await writeDoc(
      "prd.md",
      [
        "sacred: true",
        'version: "1.0"',
        'governance: "requires-review"',
        'workflowType: "prd"',
        'adr_references: ["not-an-adr"]',
      ].join("\n"),
    );
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(false);
  });
});

describe("validateSacredDocSchema — architecture", () => {
  it("accepts well-formed architecture frontmatter", async () => {
    const p = await writeDoc(
      "architecture.md",
      [
        "sacred: true",
        'version: "2.0"',
        'governance: "requires-review"',
        'workflowType: "architecture"',
        'approvers: ["alice", "bob"]',
      ].join("\n"),
    );
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(true);
  });
});

describe("validateSacredDocSchema — edge cases", () => {
  it("rejects unknown sacred-doc basename", async () => {
    const p = await writeDoc("readme.md", 'foo: "bar"');
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const message = result.issues.map((i) => i.message).join(" ");
      expect(message).toMatch(/Not a known sacred doc/);
    }
  });

  it("rejects doc with malformed frontmatter", async () => {
    const path = join(workDir, "prd.md");
    await writeFile(path, "---\nfoo: bar\nno-closing-delim\n", "utf8");
    const result = await validateSacredDocSchema(path);
    expect(result.ok).toBe(false);
  });

  it("honours explicit docId override", async () => {
    const p = await writeDoc(
      "something-else.md",
      [
        "sacred: true",
        'version: "1.0"',
        'governance: "requires-review"',
        'workflowType: "context"',
      ].join("\n"),
    );
    const result = await validateSacredDocSchema(p, { docId: "context" });
    expect(result.ok).toBe(true);
  });

  it("validates all 4 docs round-trip", async () => {
    // tech-stack.md additionally requires `derived_from` (Phase 3 Round-5 audit fix).
    const docs: Array<{ name: string; workflowType: string; extras?: string[] }> = [
      { name: "context.md", workflowType: "context" },
      { name: "tech-stack.md", workflowType: "tech-stack", extras: ["derived_from:", '  - "_context/sacred/context.md"'] },
      { name: "prd.md", workflowType: "prd" },
      { name: "architecture.md", workflowType: "architecture" },
    ];
    for (const doc of docs) {
      const p = await writeDoc(
        doc.name,
        [
          "sacred: true",
          'version: "1.0"',
          'governance: "draft"',
          `workflowType: "${doc.workflowType}"`,
          ...(doc.extras ?? []),
        ].join("\n"),
      );
      const result = await validateSacredDocSchema(p);
      expect(result.ok, `${doc.name} should validate`).toBe(true);
    }
  });
});
