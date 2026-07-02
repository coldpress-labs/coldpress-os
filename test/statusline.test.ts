/**
 * `coldpress statusline` — the orchestration status line (§7.7, WS3-D).
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runStatusLine } from "../src/commands/statusline";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-sl-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function writeState(body: string): void {
  mkdirSync(join(dir, ".coldpress"), { recursive: true });
  writeFileSync(join(dir, ".coldpress/state.yaml"), body, "utf8");
}

describe("runStatusLine", () => {
  it("prints a no-state hint when uninitialized", () => {
    let out = "";
    runStatusLine({ projectDir: dir, stdout: (s) => (out += s) });
    expect(out).toContain("no state");
  });

  it("renders lane/phase/tier/enforcement for a lite project", () => {
    writeState("lane: lite\nphase: spec\nphase_status: entering\nsecurity_tier: T0\nenforcement: on\n");
    let out = "";
    runStatusLine({ projectDir: dir, stdout: (s) => (out += s) });
    expect(out).toContain("lite");
    expect(out).toContain("lite:spec entering");
    expect(out).toContain("T0");
    expect(out).toContain("enf:on");
  });

  it("surfaces unmet gate keys for the current full-lane phase", () => {
    writeState(
      "lane: full\nphase: 6\nphase_status: gates_pending\nsecurity_tier: T1\nenforcement: on\ngates:\n  p6: {trace_orphans_clean: false, diagrams_emitted: true}\n",
    );
    let out = "";
    runStatusLine({ projectDir: dir, stdout: (s) => (out += s) });
    expect(out).toContain("P6");
    expect(out).toContain("gate:1 unmet");
  });
});
