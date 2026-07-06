/**
 * Tests for the `sacred-guard` PreToolUse hook (§4.4) — the headline
 * enforcement: sacred docs cannot be edited without an approved change record.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  hasApprovedChange,
  isLockedOnDisk,
  isSacredPath,
  sacredGuardHandler,
} from "../../src/hooks/sacred-guard";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-sacred-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function writeChangeRecord(name: string, body: string): void {
  const d = join(dir, "_context/audit/sacred-changes");
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, name), body, "utf8");
}

/** Write a sacred doc on disk with the given `governance` frontmatter. */
function writeSacredDoc(relPath: string, governance: string): string {
  const abs = join(dir, relPath);
  mkdirSync(join(abs, ".."), { recursive: true });
  writeFileSync(
    abs,
    `---\nsacred: true\nversion: "1.0"\ngovernance: "${governance}"\nworkflowType: "prd"\n---\n\n# doc\n`,
    "utf8",
  );
  return abs;
}

describe("isSacredPath", () => {
  it("matches paths under _context/sacred/, abs or relative", () => {
    expect(isSacredPath("/proj/_context/sacred/prd.md")).toBe(true);
    expect(isSacredPath("_context/sacred/context.md")).toBe(true);
    expect(isSacredPath("/proj/_context/planning/research.md")).toBe(false);
    expect(isSacredPath("src/index.ts")).toBe(false);
  });
});

describe("hasApprovedChange", () => {
  it("finds an approved record targeting the doc", () => {
    writeChangeRecord(
      "CHG-prd-1.yaml",
      "id: CHG-prd-1\ntarget: _context/sacred/prd.md\nstatus: approved\nreason: add auth reqs\napproved_by: aastha\n",
    );
    expect(hasApprovedChange(dir, join(dir, "_context/sacred/prd.md"))).toBe(true);
  });

  it("ignores a proposed (not yet approved) record", () => {
    writeChangeRecord(
      "CHG-prd-1.yaml",
      "id: CHG-prd-1\ntarget: _context/sacred/prd.md\nstatus: proposed\nreason: add auth reqs\n",
    );
    expect(hasApprovedChange(dir, join(dir, "_context/sacred/prd.md"))).toBe(false);
  });

  it("ignores a record targeting a different doc", () => {
    writeChangeRecord(
      "CHG-arch-1.yaml",
      "id: CHG-arch-1\ntarget: _context/sacred/architecture.md\nstatus: approved\nreason: x\napproved_by: a\n",
    );
    expect(hasApprovedChange(dir, join(dir, "_context/sacred/prd.md"))).toBe(false);
  });

  it("returns false with no change dir at all", () => {
    expect(hasApprovedChange(dir, join(dir, "_context/sacred/prd.md"))).toBe(false);
  });
});

describe("isLockedOnDisk", () => {
  it("is false for a non-existent doc (first creation)", () => {
    expect(isLockedOnDisk(dir, join(dir, "_context/sacred/context.md"))).toBe(false);
  });
  it("is false for a draft doc (still authoring)", () => {
    const p = writeSacredDoc("_context/sacred/context.md", "draft");
    expect(isLockedOnDisk(dir, p)).toBe(false);
  });
  it("is true for a locked doc", () => {
    const p = writeSacredDoc("_context/sacred/prd.md", "locked");
    expect(isLockedOnDisk(dir, p)).toBe(true);
  });
  it("is true for a requires-review doc", () => {
    const p = writeSacredDoc("_context/sacred/prd.md", "requires-review");
    expect(isLockedOnDisk(dir, p)).toBe(true);
  });
});

describe("sacredGuardHandler.run", () => {
  it("passes through non-sacred writes", () => {
    const d = sacredGuardHandler.run({ tool_name: "Write", tool_input: { file_path: join(dir, "src/x.ts") }, cwd: dir });
    expect(d).toEqual({ kind: "none" });
  });

  it("ALLOWS first creation of a sacred doc (file absent) — the designed intake path", () => {
    // VP2 O1: creating context.md that does not yet exist must NOT be blocked.
    const d = sacredGuardHandler.run({
      tool_name: "Write",
      tool_input: { file_path: join(dir, "_context/sacred/context.md") },
      cwd: dir,
    });
    expect(d).toEqual({ kind: "none" });
  });

  it("ALLOWS editing a still-draft sacred doc (governance: draft)", () => {
    writeSacredDoc("_context/sacred/context.md", "draft");
    const d = sacredGuardHandler.run({
      tool_name: "Edit",
      tool_input: { file_path: join(dir, "_context/sacred/context.md") },
      cwd: dir,
    });
    expect(d).toEqual({ kind: "none" });
  });

  it("DENIES editing a LOCKED sacred doc with no approved change record", async () => {
    writeSacredDoc("_context/sacred/prd.md", "locked");
    const d = await sacredGuardHandler.run({
      tool_name: "Edit",
      tool_input: { file_path: join(dir, "_context/sacred/prd.md") },
      cwd: dir,
    });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") {
      expect(d.reason).toContain("sacred document");
      expect(d.reason).toContain("sacred-change");
    }
  });

  it("ALLOWS a locked sacred write when an approved change record exists", () => {
    writeSacredDoc("_context/sacred/prd.md", "locked");
    writeChangeRecord(
      "CHG-prd-1.yaml",
      "id: CHG-prd-1\ntarget: _context/sacred/prd.md\nstatus: approved\nreason: add auth\napproved_by: aastha\n",
    );
    const d = sacredGuardHandler.run({
      tool_name: "Edit",
      tool_input: { file_path: join(dir, "_context/sacred/prd.md") },
      cwd: dir,
    });
    expect(d).toEqual({ kind: "none" });
  });

  it("is an overridable PreToolUse hook with a non-empty --explain", () => {
    expect(sacredGuardHandler.event).toBe("PreToolUse");
    expect(sacredGuardHandler.overrideGate).toBe("sacred-guard");
    expect(sacredGuardHandler.explain.length).toBeGreaterThan(20);
  });
});
