/**
 * Tests for the `quality-gate` Stop hook (§4.4).
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectChecks, makeQualityGate, readFastLayers, runQualityChecks } from "../../src/hooks/quality-gate";
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

function writeTesting(yaml: string): void {
  mkdirSync(join(dir, "_context/testing"), { recursive: true });
  writeFileSync(join(dir, "_context/testing/testing.yaml"), yaml, "utf8");
}

describe("detectChecks", () => {
  it("returns present checks in fast→slow order (no testing.yaml → fallback)", () => {
    writePkg({ test: "vitest", typecheck: "tsc", build: "tsup" });
    expect(detectChecks(dir)).toEqual(["typecheck", "test"]);
  });
  it("returns [] with no package.json", () => {
    expect(detectChecks(dir)).toEqual([]);
  });
});

describe("detectChecks — testing.yaml driven", () => {
  it("gates only the enabled fast layers' scripts (L0 → typecheck+lint)", () => {
    writePkg({ typecheck: "tsc", lint: "biome", test: "vitest" });
    writeTesting("layers:\n  L0:\n    enabled: true\n");
    expect(detectChecks(dir)).toEqual(["typecheck", "lint"]); // L1 not enabled → no test
  });

  it("L0 + L1 enabled → typecheck, lint, test", () => {
    writePkg({ typecheck: "tsc", lint: "biome", test: "vitest" });
    writeTesting("layers:\n  L0: {enabled: true}\n  L1: {enabled: true}\n");
    expect(detectChecks(dir)).toEqual(["typecheck", "lint", "test"]);
  });

  it("a disabled fast layer is excluded (L1 enabled:false)", () => {
    writePkg({ typecheck: "tsc", test: "vitest" });
    writeTesting("layers:\n  L0: {enabled: true}\n  L1: {enabled: false}\n");
    expect(detectChecks(dir)).toEqual(["typecheck"]);
  });

  it("ONLY heavy layers (L4 e2e) → the Stop gate runs nothing (verifier owns those)", () => {
    writePkg({ typecheck: "tsc", test: "vitest", e2e: "playwright" });
    writeTesting("layers:\n  L4: {enabled: true}\n");
    expect(detectChecks(dir)).toEqual([]);
  });

  it("intersects with scripts the project actually defines", () => {
    writePkg({ typecheck: "tsc" }); // no lint script even though L0 wants it
    writeTesting("layers:\n  L0: {enabled: true}\n");
    expect(detectChecks(dir)).toEqual(["typecheck"]);
  });

  it("readFastLayers is null without a testing.yaml, and falls back", () => {
    writePkg({ test: "vitest" });
    expect(readFastLayers(dir)).toBeNull();
    expect(detectChecks(dir)).toEqual(["test"]); // fallback path
  });

  it("an invalid testing.yaml falls back to script detection (null)", () => {
    writePkg({ typecheck: "tsc", test: "vitest" });
    writeTesting("layers:\n  L9: {enabled: true}\n"); // L9 is not a valid layer key
    expect(readFastLayers(dir)).toBeNull();
    expect(detectChecks(dir)).toEqual(["typecheck", "test"]);
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
