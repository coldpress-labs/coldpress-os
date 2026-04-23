/**
 * Ajv-backed sacred-doc frontmatter validator tests (§5.2).
 *
 * Exercises the in-process validator against the 5 shipped sacred-doc
 * JSON Schemas, via fixture docs written to a tmpdir.
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SACRED_DOC_SCHEMAS,
  _resetValidatorCache,
  extractFrontmatter,
  sacredDocIdFromPath,
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

describe("SACRED_DOC_SCHEMAS", () => {
  it("covers the 5 canonical sacred docs", () => {
    expect(Object.keys(SACRED_DOC_SCHEMAS).sort()).toEqual(
      ["architecture", "context", "pert-chart", "prd", "tech-stack"],
    );
  });
});

describe("sacredDocIdFromPath", () => {
  it("resolves by basename", () => {
    expect(sacredDocIdFromPath("/a/b/prd.md")).toBe("prd");
    expect(sacredDocIdFromPath("architecture.md")).toBe("architecture");
    expect(sacredDocIdFromPath("pert-chart.md")).toBe("pert-chart");
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

describe("validateSacredDocSchema — pert-chart", () => {
  it("accepts with properly shaped waves", async () => {
    const p = await writeDoc(
      "pert-chart.md",
      [
        "sacred: true",
        'version: "1.0"',
        'governance: "draft"',
        'workflowType: "pert-chart"',
        "waves:",
        '  - id: "wave-1"',
        '    name: "Foundations"',
        '  - id: "wave-2"',
        '    name: "Core"',
      ].join("\n"),
    );
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(true);
  });

  it("rejects a malformed wave id", async () => {
    const p = await writeDoc(
      "pert-chart.md",
      [
        "sacred: true",
        'version: "1.0"',
        'governance: "draft"',
        'workflowType: "pert-chart"',
        "waves:",
        '  - id: "phase-1"',
        '    name: "Wrong prefix"',
      ].join("\n"),
    );
    const result = await validateSacredDocSchema(p);
    expect(result.ok).toBe(false);
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

  it("validates all 5 docs round-trip", async () => {
    const docs = [
      {
        name: "context.md",
        workflowType: "context",
      },
      {
        name: "tech-stack.md",
        workflowType: "tech-stack",
      },
      {
        name: "prd.md",
        workflowType: "prd",
      },
      {
        name: "architecture.md",
        workflowType: "architecture",
      },
      {
        name: "pert-chart.md",
        workflowType: "pert-chart",
      },
    ];
    for (const doc of docs) {
      const p = await writeDoc(
        doc.name,
        [
          "sacred: true",
          'version: "1.0"',
          'governance: "draft"',
          `workflowType: "${doc.workflowType}"`,
        ].join("\n"),
      );
      const result = await validateSacredDocSchema(p);
      expect(result.ok, `${doc.name} should validate`).toBe(true);
    }
  });
});
