/**
 * Tests for the `run-log` Stop/SubagentStop hook (§4.4).
 */

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runIdFromSession, runLogHandler } from "../../src/hooks/run-log";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-runlog-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function readEvents(runId: string): Record<string, unknown>[] {
  const p = join(dir, ".coldpress/runs", runId, "events.jsonl");
  return readFileSync(p, "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l) as Record<string, unknown>);
}

describe("runIdFromSession", () => {
  it("produces a valid kebab-case run id", () => {
    expect(runIdFromSession("Sess_ABC-123")).toBe("run-sess-abc-123");
    expect(runIdFromSession(undefined)).toBeUndefined();
    expect(runIdFromSession("!!!")).toBeUndefined();
  });
});

describe("runLogHandler.run", () => {
  it("appends a session-boundary event and never blocks", async () => {
    const d = await runLogHandler.run({ cwd: dir, session_id: "sess-1", hook_event_name: "Stop" });
    expect(d).toEqual({ kind: "none" });
    const events = readEvents("run-sess-1");
    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe("session-boundary");
    expect(events[0]?.boundary).toBe("stop");
    expect(events[0]?.agent).toBe("butler");
  });

  it("captures phase + lane from state.yaml, and agent from agent_type on SubagentStop", async () => {
    mkdirSync(join(dir, ".coldpress"), { recursive: true });
    writeFileSync(
      join(dir, ".coldpress/state.yaml"),
      "lane: full\nphase: 8\nphase_status: in_progress\nsecurity_tier: T1\nenforcement: on\n",
      "utf8",
    );
    await runLogHandler.run({ cwd: dir, session_id: "sess-2", hook_event_name: "SubagentStop", agent_type: "developer" });
    const e = readEvents("run-sess-2")[0];
    expect(e?.boundary).toBe("subagent-stop");
    expect(e?.agent).toBe("developer");
    expect(e?.phase).toBe(8);
    expect(e?.lane).toBe("full");
  });

  it("appends to the same run across repeated stops (one run per session)", async () => {
    await runLogHandler.run({ cwd: dir, session_id: "sess-3", hook_event_name: "Stop" });
    await runLogHandler.run({ cwd: dir, session_id: "sess-3", hook_event_name: "Stop" });
    const events = readEvents("run-sess-3");
    expect(events).toHaveLength(2);
    expect(events[1]?.seq).toBe(1);
  });

  it("is a non-overridable Stop hook with --explain", () => {
    expect(runLogHandler.event).toBe("Stop");
    expect(runLogHandler.overrideGate).toBeNull();
    expect(runLogHandler.explain.length).toBeGreaterThan(20);
  });
});
