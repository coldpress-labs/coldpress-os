/**
 * VP2 O30 — state.yaml is validated at WRITE time (not only at next-session read),
 * so routing-breaking drift is caught in-loop.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isStateFile, stateValidateHandler } from "../../src/hooks/state-validate";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-state-"));
  mkdirSync(join(dir, ".coldpress"), { recursive: true });
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const VALID = `lane: full
phase: 6
phase_status: entering
security_tier: T0
enforcement: on
iteration: 0
gates: {}
active_stories: []
deltas_open: {}
deploy: {}
`;

function writeState(body: string): string {
  const p = join(dir, ".coldpress/state.yaml");
  writeFileSync(p, body, "utf8");
  return p;
}

describe("isStateFile", () => {
  it("matches .coldpress/state.yaml, abs or relative", () => {
    expect(isStateFile("/proj/.coldpress/state.yaml")).toBe(true);
    expect(isStateFile(".coldpress/state.yaml")).toBe(true);
    expect(isStateFile("_context/sacred/context.md")).toBe(false);
  });
});

describe("stateValidateHandler.run", () => {
  it("passes a non-state write through", () => {
    const d = stateValidateHandler.run({ tool_name: "Write", tool_input: { file_path: join(dir, "src/x.ts") }, cwd: dir });
    expect(d).toEqual({ kind: "none" });
  });

  it("passes valid state", () => {
    const p = writeState(VALID);
    expect(stateValidateHandler.run({ tool_name: "Write", tool_input: { file_path: p }, cwd: dir })).toEqual({ kind: "none" });
  });

  it("DENIES a non-scalar gate-ledger value (the VP2 mandatory_adrs array)", async () => {
    const p = writeState(VALID.replace("gates: {}", 'gates:\n  p5:\n    mandatory_adrs:\n      - delta-001\n      - delta-004'));
    const d = await stateValidateHandler.run({ tool_name: "Edit", tool_input: { file_path: p }, cwd: dir });
    expect(d.kind).toBe("deny");
  });

  it("DENIES a bespoke top-level key (the VP2 phase_5_completed)", async () => {
    const p = writeState(VALID + "phase_5_completed: true\n");
    const d = await stateValidateHandler.run({ tool_name: "Edit", tool_input: { file_path: p }, cwd: dir });
    expect(d.kind).toBe("deny");
  });

  it("is a PostToolUse hook with a non-empty --explain", () => {
    expect(stateValidateHandler.event).toBe("PostToolUse");
    expect(stateValidateHandler.explain.length).toBeGreaterThan(20);
  });
});
