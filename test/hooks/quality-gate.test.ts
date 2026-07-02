/**
 * Tests for the `quality-gate` Stop hook (§4.4).
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectChecks, makeQualityGate, runQualityChecks } from "../../src/hooks/quality-gate";
import type { CheckRunner } from "../../src/hooks/quality-gate";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-qg-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function writePkg(scripts: Record<string, string>): void {
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "t", scripts }), "utf8");
}

describe("detectChecks", () => {
  it("returns present checks in fast→slow order", () => {
    writePkg({ test: "vitest", typecheck: "tsc", build: "tsup" });
    expect(detectChecks(dir)).toEqual(["typecheck", "test"]);
  });
  it("returns [] with no package.json", () => {
    expect(detectChecks(dir)).toEqual([]);
  });
});

describe("runQualityChecks", () => {
  it("short-circuits on the first failure", () => {
    const calls: string[] = [];
    const run: CheckRunner = (s) => {
      calls.push(s);
      return s !== "lint"; // lint fails
    };
    const results = runQualityChecks(dir, ["typecheck", "lint", "test"], run);
    expect(calls).toEqual(["typecheck", "lint"]); // stopped after lint
    expect(results.at(-1)).toEqual({ name: "lint", ok: false });
  });
});

describe("qualityGate.run", () => {
  it("DENIES stop when a check is red", async () => {
    writePkg({ typecheck: "tsc", test: "vitest" });
    const gate = makeQualityGate(() => false); // everything red
    const d = await gate.run({ cwd: dir });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toContain("typecheck");
  });

  it("allows stop when all checks are green", () => {
    writePkg({ typecheck: "tsc" });
    expect(makeQualityGate(() => true).run({ cwd: dir })).toEqual({ kind: "none" });
  });

  it("passes through a project with no checks", () => {
    expect(makeQualityGate(() => false).run({ cwd: dir })).toEqual({ kind: "none" });
  });

  it("is a Stop hook, overridable, with --explain", () => {
    const g = makeQualityGate(() => true);
    expect(g.event).toBe("Stop");
    expect(g.overrideGate).toBe("quality-gate");
    expect(g.explain.length).toBeGreaterThan(20);
  });
});
