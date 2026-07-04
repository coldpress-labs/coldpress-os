/**
 * WS2-D hooks — glob matcher, boundary-guard (packet forbidden globs),
 * git-guard (trunk-based commit protocol).
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { pathMatchesAny, pathMatchesGlob } from "../src/utils/glob-match";
import { activePacket, boundaryGuardHandler } from "../src/hooks/boundary-guard";
import { decideGitGuard, gitGuardHandler } from "../src/hooks/git-guard";

describe("pathMatchesGlob", () => {
  it("matches a relative glob against an absolute path (tail-anchored)", () => {
    expect(pathMatchesGlob("/proj/_context/sacred/prd.md", "_context/sacred/*")).toBe(true);
    expect(pathMatchesGlob("/proj/src/lib/payments/stripe.ts", "src/lib/payments/*")).toBe(true);
  });
  it("does not match siblings, and * stays within a segment", () => {
    expect(pathMatchesGlob("/proj/src/components/X.tsx", "src/lib/payments/*")).toBe(false);
    expect(pathMatchesGlob("/proj/_context/sacred/sub/x.md", "_context/sacred/*")).toBe(false);
  });
  it("** crosses segments", () => {
    expect(pathMatchesGlob("/proj/a/b/c/d.ts", "a/**")).toBe(true);
  });
  it("pathMatchesAny", () => {
    expect(pathMatchesAny("/p/src/x.ts", ["_context/sacred/*", "src/*"])).toBe(true);
  });
});

describe("boundary-guard", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-bg-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function writePacket(name: string, toAgent: string, forbidden: string[], owns: string[] = []): void {
    mkdirSync(join(dir, "_context/handoffs"), { recursive: true });
    const yaml = [
      `id: ${name}`,
      "from: {phase: 7, agent: pm}",
      `to: {agent: ${toAgent}, mode: standard}`,
      "objective: implement ST-1",
      "inputs:",
      "  - {doc: sacred/prd.md, sections: ['4.2']}",
      "acceptance: stories/ST-1.tests.md",
      `forbidden: [${forbidden.map((f) => `'${f}'`).join(", ")}]`,
      `owns: [${owns.map((f) => `'${f}'`).join(", ")}]`,
      "return_contract: diff + gates",
    ].join("\n");
    writeFileSync(join(dir, "_context/handoffs", `${name}.yaml`), yaml, "utf8");
  }

  it("finds the active packet for the dispatching agent", () => {
    writePacket("HND-p7-developer-1", "developer", ["_context/sacred/*"]);
    expect(activePacket(dir, "developer")?.id).toBe("HND-p7-developer-1");
  });

  it("DENIES a write matching the packet's forbidden globs", async () => {
    writePacket("HND-p7-developer-1", "developer", ["_context/sacred/*", "src/lib/payments/*"]);
    const d = await boundaryGuardHandler.run({
      tool_name: "Write",
      tool_input: { file_path: join(dir, "src/lib/payments/stripe.ts") },
      cwd: dir,
      agent_type: "developer",
    });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toContain("HND-p7-developer-1");
  });

  it("ALLOWS an in-scope write", () => {
    writePacket("HND-p7-developer-1", "developer", ["_context/sacred/*"]);
    expect(
      boundaryGuardHandler.run({ tool_name: "Write", tool_input: { file_path: join(dir, "src/components/X.tsx") }, cwd: dir, agent_type: "developer" }),
    ).toEqual({ kind: "none" });
  });

  it("no active packet → no opinion", () => {
    expect(boundaryGuardHandler.run({ tool_name: "Write", tool_input: { file_path: join(dir, "src/x.ts") }, cwd: dir })).toEqual({ kind: "none" });
  });

  it("owns allowlist (WS10-B4): ALLOWS a write inside owns, BLOCKS one outside", async () => {
    writePacket("HND-p7-developer-1", "developer", ["_context/sacred/*"], ["src/features/auth/*"]);
    // inside owns → allowed
    expect(
      await boundaryGuardHandler.run({ tool_name: "Write", tool_input: { file_path: join(dir, "src/features/auth/login.ts") }, cwd: dir, agent_type: "developer" }),
    ).toEqual({ kind: "none" });
    // outside owns (and not forbidden) → blocked by the allowlist
    const d = await boundaryGuardHandler.run({ tool_name: "Write", tool_input: { file_path: join(dir, "src/features/billing/charge.ts") }, cwd: dir, agent_type: "developer" });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toContain("ownership scope");
  });

  it("empty owns → denylist-only (backward compat): a non-forbidden write passes", async () => {
    writePacket("HND-p7-developer-1", "developer", ["_context/sacred/*"]);
    expect(
      await boundaryGuardHandler.run({ tool_name: "Write", tool_input: { file_path: join(dir, "src/anything.ts") }, cwd: dir, agent_type: "developer" }),
    ).toEqual({ kind: "none" });
  });
});

describe("git-guard", () => {
  it("blocks a subagent commit to main, allows Butler + feature branches", () => {
    expect(decideGitGuard("git commit -m x", "main", true).kind).toBe("deny");
    expect(decideGitGuard("git commit -m x", "main", false)).toEqual({ kind: "none" }); // Butler
    expect(decideGitGuard("git commit -m x", "story/ST-1", true)).toEqual({ kind: "none" }); // feature branch
    expect(decideGitGuard("git commit -m x", "master", true).kind).toBe("deny");
  });
  it("ignores non-commit bash", () => {
    expect(decideGitGuard("git status", "main", true)).toEqual({ kind: "none" });
    expect(decideGitGuard("npm test", "main", true)).toEqual({ kind: "none" });
  });
  it("passes through non-commit commands at the handler level", () => {
    expect(gitGuardHandler.run({ tool_name: "Bash", tool_input: { command: "ls -la" } })).toEqual({ kind: "none" });
  });
  it("is an overridable PreToolUse hook with --explain", () => {
    expect(gitGuardHandler.event).toBe("PreToolUse");
    expect(gitGuardHandler.overrideGate).toBe("git-guard");
    expect(gitGuardHandler.explain.length).toBeGreaterThan(20);
  });
});
