/**
 * Tests for the `load-state` SessionStart hook (§4.4).
 */

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadStateHandler, summarizeState } from "../../src/hooks/load-state";
import type { State } from "../../schemas/state.schema";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-loadstate-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function writeState(yaml: string): void {
  mkdirSync(join(dir, ".coldpress"), { recursive: true });
  writeFileSync(join(dir, ".coldpress", "state.yaml"), yaml, "utf8");
}

describe("summarizeState", () => {
  it("produces a compact one-glance summary with the key routing facts", () => {
    const state: State = {
      lane: "full",
      phase: 8,
      phase_status: "in_progress",
      security_tier: "T1",
      enforcement: "on",
      iteration: 0,
      gates: { p8: { stories_done: 7, stories_total: 12, review_started: false } },
      active_stories: ["ST-008", "ST-011"],
      deltas_open: { design: 0, architecture: 1 },
      deploy: { pack: "cloudflare", staging_smoke: null, prod: null },
    };
    const s = summarizeState(state);
    expect(s).toContain("lane: full");
    expect(s).toContain("Phase 8 (in_progress)");
    expect(s).toContain("tier T1");
    expect(s).toContain("enforcement on");
    expect(s).toContain("active stories: ST-008, ST-011");
    expect(s).toContain("architecture=1");
    expect(s).toContain("p8 gates NOT yet met: review_started");
    expect(s).toContain("deploy: pack cloudflare");
  });
});

describe("loadStateHandler.run", () => {
  it("injects context from a valid state.yaml", async () => {
    writeState(
      [
        "lane: full",
        "phase: 3",
        "phase_status: gates_pending",
        "security_tier: T2",
        "enforcement: on",
      ].join("\n"),
    );
    const d = await loadStateHandler.run({ cwd: dir });
    expect(d.kind).toBe("context");
    if (d.kind === "context") {
      expect(d.text).toContain("Phase 3 (gates_pending)");
      expect(d.text).toContain("tier T2");
    }
  });

  it("emits nothing when there is no state.yaml (fresh project)", async () => {
    expect(await loadStateHandler.run({ cwd: dir })).toEqual({ kind: "none" });
  });

  it("warns via context when state.yaml is not valid YAML", async () => {
    writeState(":\n  not: [valid");
    const d = await loadStateHandler.run({ cwd: dir });
    expect(d.kind).toBe("context");
    if (d.kind === "context") expect(d.text).toContain("could not be parsed");
  });

  it("warns via context when state.yaml fails schema validation", async () => {
    writeState("lane: sideways\nphase: 3\nphase_status: entering\nsecurity_tier: T0\nenforcement: on");
    const d = await loadStateHandler.run({ cwd: dir });
    expect(d.kind).toBe("context");
    if (d.kind === "context") expect(d.text).toContain("failed schema validation");
  });

  it("is a non-overridable SessionStart hook with a non-empty --explain", () => {
    expect(loadStateHandler.event).toBe("SessionStart");
    expect(loadStateHandler.overrideGate).toBeNull();
    expect(loadStateHandler.explain.length).toBeGreaterThan(20);
  });
});
