/**
 * WS10-C1: the gate-runner. Reads a phase's gate.json + evaluates each check
 * (runs commands via an injectable runner, existence-checks artefacts, surfaces
 * human/agent checks as pending).
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolvePlaceholders, runGate } from "../src/gate/run";

let framework: string;
let project: string;

beforeEach(() => {
  framework = mkdtempSync(join(tmpdir(), "coldpress-gate-fw-"));
  project = mkdtempSync(join(tmpdir(), "coldpress-gate-proj-"));
});
afterEach(() => {
  rmSync(framework, { recursive: true, force: true });
  rmSync(project, { recursive: true, force: true });
});

function writeGate(phase: number, slug: string, checks: unknown[]): void {
  const dir = join(framework, "lifecycle", `${phase}-${slug}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "gate.json"), JSON.stringify({ gate_id: `phase-${phase}-exit`, acceptance_checks: checks }));
}

describe("runGate", () => {
  it("runs command checks via the injected runner + aggregates block failures", () => {
    writeGate(4, "planning", [
      { id: "a", severity: "block", kind: "automated", command: "coldpress outcomes check" },
      { id: "b", severity: "warn", kind: "automated", command: "coldpress config-check foo --expected true" },
    ]);
    const calls: string[][] = [];
    const run = (args: string[]): number => {
      calls.push(args);
      return args[0] === "outcomes" ? 1 : 0; // outcomes fails (block), config-check passes
    };
    const r = runGate(4, { projectDir: project, frameworkDir: framework, run });
    expect(r.evaluated).toBe(2);
    expect(r.blocked).toBe(true); // the block-severity 'a' failed
    expect(calls[0]).toEqual(["outcomes", "check"]);
    expect(r.results.find((x) => x.id === "a")?.status).toBe("fail");
    expect(r.results.find((x) => x.id === "b")?.status).toBe("pass");
  });

  it("a warn-severity command failure does NOT block", () => {
    writeGate(4, "planning", [{ id: "w", severity: "warn", kind: "automated", command: "coldpress config-check x" }]);
    const r = runGate(4, { projectDir: project, frameworkDir: framework, run: () => 1 });
    expect(r.blocked).toBe(false);
    expect(r.results[0]?.status).toBe("fail");
  });

  it("existence-checks an artefact-present check by glob", () => {
    writeGate(9, "deployment", [{ id: "art", severity: "block", kind: "artefact-present", artefact_path: "_context/handoffs/phase-9-to-10-*.md" }]);
    // missing -> fail + blocked
    let r = runGate(9, { projectDir: project, frameworkDir: framework, run: () => 0 });
    expect(r.results[0]?.status).toBe("fail");
    expect(r.blocked).toBe(true);
    // present -> pass
    mkdirSync(join(project, "_context/handoffs"), { recursive: true });
    writeFileSync(join(project, "_context/handoffs/phase-9-to-10-2026-07-04.md"), "handoff");
    r = runGate(9, { projectDir: project, frameworkDir: framework, run: () => 0 });
    expect(r.results[0]?.status).toBe("pass");
    expect(r.blocked).toBe(false);
  });

  it("surfaces human/skill_ref-only checks as pending (not auto-passed)", () => {
    writeGate(6, "architecture", [
      { id: "human", severity: "block", kind: "human" },
      { id: "skillonly", severity: "block", kind: "automated" }, // no command → pending
    ]);
    const r = runGate(6, { projectDir: project, frameworkDir: framework, run: () => 0 });
    expect(r.pending).toBe(2);
    expect(r.evaluated).toBe(0);
    expect(r.blocked).toBe(false); // pending never fabricates a pass OR a block-fail
  });

  it("reports a command with an unresolvable placeholder as pending, not run", () => {
    writeGate(3, "tech-stack", [{ id: "p", severity: "block", kind: "automated", command: "coldpress validate-pack-match _context/planning/stack-shortlist-v{latest}.md" }]);
    const run = (): number => { throw new Error("should not run"); };
    const r = runGate(3, { projectDir: project, frameworkDir: framework, run });
    expect(r.results[0]?.status).toBe("pending");
    expect(r.pending).toBe(1);
  });

  it("returns an empty report for an unknown phase", () => {
    const r = runGate(99, { projectDir: project, frameworkDir: framework, run: () => 0 });
    expect(r.evaluated).toBe(0);
    expect(r.results).toHaveLength(0);
  });
});

describe("resolvePlaceholders", () => {
  it("resolves {date} to today", () => {
    expect(resolvePlaceholders("x _context/a-{date}.md", project, "2026-07-04")).toBe("x _context/a-2026-07-04.md");
  });
  it("resolves {latest} to the highest -v<N> file that exists", () => {
    mkdirSync(join(project, "_context/planning"), { recursive: true });
    writeFileSync(join(project, "_context/planning/shortlist-v1.md"), "");
    writeFileSync(join(project, "_context/planning/shortlist-v3.md"), "");
    const out = resolvePlaceholders("validate _context/planning/shortlist-v{latest}.md", project, "2026-07-04");
    expect(out).toContain("shortlist-v3.md");
  });
  it("returns null when a {latest} has no matching file", () => {
    expect(resolvePlaceholders("validate _context/planning/none-v{latest}.md", project, "2026-07-04")).toBeNull();
  });
  it("leaves a plain command untouched", () => {
    expect(resolvePlaceholders("outcomes check", project, "2026-07-04")).toBe("outcomes check");
  });
});
