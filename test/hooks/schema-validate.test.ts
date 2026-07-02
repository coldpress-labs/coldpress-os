/**
 * Tests for the `schema-validate` PostToolUse hook (§4.4).
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { schemaApplies, schemaValidateHandler } from "../../src/hooks/schema-validate";
import { _resetValidatorCache } from "../../src/governance/validate-schema";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-schemaval-"));
  _resetValidatorCache();
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function writeContextDoc(body: string): string {
  const d = join(dir, "_context/sacred");
  mkdirSync(d, { recursive: true });
  const p = join(d, "context.md");
  writeFileSync(p, body, "utf8");
  return p;
}

describe("schemaApplies", () => {
  it("is true for a schema'd sacred doc under _context/", () => {
    expect(schemaApplies("/proj/_context/sacred/prd.md")).toBe(true);
    expect(schemaApplies("/proj/_context/sacred/context.md")).toBe(true);
  });
  it("is false for a _context file with no registered schema", () => {
    expect(schemaApplies("/proj/_context/planning/notes.md")).toBe(false);
  });
  it("is false outside _context/ even if the basename matches a sacred doc", () => {
    expect(schemaApplies("/proj/docs/prd.md")).toBe(false);
    expect(schemaApplies("/proj/src/index.ts")).toBe(false);
  });
});

describe("schemaValidateHandler.run", () => {
  it("passes through files with no applicable schema", async () => {
    expect(await schemaValidateHandler.run({ tool_input: { file_path: join(dir, "src/x.ts") } })).toEqual({ kind: "none" });
  });

  it("DENIES a schema'd sacred doc with invalid frontmatter, surfacing issues", async () => {
    const p = writeContextDoc("---\nfoo: bar\n---\n\n# Context\n");
    const d = await schemaValidateHandler.run({ tool_name: "Write", tool_input: { file_path: p } });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") {
      expect(d.reason).toContain("Schema validation failed");
      expect(d.reason).toContain("context.md");
    }
  });

  it("is a PostToolUse hook, overridable, with --explain", () => {
    expect(schemaValidateHandler.event).toBe("PostToolUse");
    expect(schemaValidateHandler.overrideGate).toBe("schema-validate");
    expect(schemaValidateHandler.explain.length).toBeGreaterThan(20);
  });
});
