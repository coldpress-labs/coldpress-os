import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runDoctor } from "../src/commands/doctor";
import {
  exitCodeFor,
  runCoreChecks,
  runStackChecks,
} from "../src/utils/doctor-checks";

describe("doctor — core checks", () => {
  it("returns one result per core-check id and produces a valid suite shape", async () => {
    const suite = await runCoreChecks();
    const ids = suite.results.map((r) => r.id).sort();
    expect(ids).toEqual([
      "claude-code",
      "coldpress-cli",
      "git",
      "git-identity",
      "node",
      "package-manager",
    ]);

    // Each result has a severity in the expected enum.
    for (const r of suite.results) {
      expect(["ok", "warning", "error"]).toContain(r.severity);
      expect(typeof r.label).toBe("string");
    }

    // hasError / hasWarning reflect result contents.
    expect(suite.hasError).toBe(suite.results.some((r) => r.severity === "error"));
    expect(suite.hasWarning).toBe(suite.results.some((r) => r.severity === "warning"));
  });

  it("reports Node and git as OK on the CI/dev machine", async () => {
    // Vitest itself runs on Node ≥ 18 and needs git for most dev flows, so
    // both should land as ok in any sane test environment.
    const suite = await runCoreChecks();
    const node = suite.results.find((r) => r.id === "node");
    const git = suite.results.find((r) => r.id === "git");
    expect(node?.severity).toBe("ok");
    expect(git?.severity).toBe("ok");
  });
});

describe("doctor — stack checks", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-doctor-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("is a no-op (ok + detail) when coldpress.yaml is missing", async () => {
    const suite = await runStackChecks({ projectRoot: tmp });
    expect(suite.hasError).toBe(false);
    expect(suite.results).toHaveLength(1);
    expect(suite.results[0]?.id).toBe("stack-pack");
    expect(suite.results[0]?.detail).toMatch(/not set/);
  });

  it("is a no-op when stack_pack is unset in coldpress.yaml", async () => {
    await writeFile(
      join(tmp, "coldpress.yaml"),
      `project:\n  name: "x"\n  slug: "x"\nuser:\n  name: "u"\n`,
      "utf8",
    );
    const suite = await runStackChecks({ projectRoot: tmp });
    expect(suite.hasError).toBe(false);
    expect(suite.results[0]?.detail).toMatch(/not set/);
  });

  it("warns when stack_pack is set but unknown", async () => {
    await writeFile(
      join(tmp, "coldpress.yaml"),
      `project:\n  name: "x"\n  slug: "x"\nstack_pack: "exotic-pack"\n`,
      "utf8",
    );
    const suite = await runStackChecks({ projectRoot: tmp });
    expect(suite.hasWarning).toBe(true);
    const first = suite.results[0];
    expect(first?.severity).toBe("warning");
    expect(first?.detail).toMatch(/no stack-specific doctor checks/);
  });

  it("invokes the convex checker when stack_pack = vibe-coder-fullstack", async () => {
    await writeFile(
      join(tmp, "coldpress.yaml"),
      `project:\n  name: "x"\n  slug: "x"\nstack_pack: "vibe-coder-fullstack"\n`,
      "utf8",
    );
    const suite = await runStackChecks({ projectRoot: tmp });
    expect(suite.results.some((r) => r.id === "stack-pack" && r.detail === "vibe-coder-fullstack")).toBe(true);
    expect(suite.results.some((r) => r.id === "convex-cli")).toBe(true);
  });
});

describe("doctor — exit codes", () => {
  it("exitCodeFor = 0 on all ok", () => {
    expect(
      exitCodeFor({
        results: [{ id: "a", label: "a", severity: "ok" }],
        hasError: false,
        hasWarning: false,
      }),
    ).toBe(0);
  });

  it("exitCodeFor = 1 when any error present", () => {
    expect(
      exitCodeFor({
        results: [
          { id: "a", label: "a", severity: "warning" },
          { id: "b", label: "b", severity: "error" },
        ],
        hasError: true,
        hasWarning: true,
      }),
    ).toBe(1);
  });

  it("exitCodeFor = 2 on warnings only", () => {
    expect(
      exitCodeFor({
        results: [{ id: "a", label: "a", severity: "warning" }],
        hasError: false,
        hasWarning: true,
      }),
    ).toBe(2);
  });
});

describe("runDoctor — silent mode", () => {
  it("returns a suite + exit code without printing when silent=true", async () => {
    const logs: string[] = [];
    const origLog = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };
    try {
      const result = await runDoctor({ silent: true });
      expect(result.suite).toBeTruthy();
      expect([0, 1, 2]).toContain(result.exitCode);
      expect(logs).toEqual([]);
    } finally {
      console.log = origLog;
    }
  });
});
