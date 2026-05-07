/**
 * Unit tests for src/gate/checks/gate-check-supersessions.ts (§4.14).
 */

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkSupersessions } from "../src/gate/checks/gate-check-supersessions";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-supersessions-"));
  await mkdir(join(workDir, "_context", "audit"), { recursive: true });
  await mkdir(join(workDir, ".coldpress"), { recursive: true });
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe("checkSupersessions", () => {
  it("passes when no supersession log files exist", async () => {
    const result = await checkSupersessions(workDir);
    expect(result.ok).toBe(true);
    expect(result.log_count).toBe(0);
  });

  it("passes when log has entry after phase started", async () => {
    await writeFile(
      join(workDir, ".coldpress", "local-config.yaml"),
      "phase_3_started_at: '2026-04-24T08:00:00Z'\n",
      "utf8",
    );
    await writeFile(
      join(workDir, "_context", "audit", "supersessions-2026-04-24.md"),
      "| 2026-04-24T10:00:00Z | user | ... |\n",
      "utf8",
    );
    const result = await checkSupersessions(workDir, "phase_3_started_at");
    expect(result.ok).toBe(true);
  });

  it("fails when log has no entry after phase started", async () => {
    await writeFile(
      join(workDir, ".coldpress", "local-config.yaml"),
      "phase_3_started_at: '2026-04-24T08:00:00Z'\n",
      "utf8",
    );
    await writeFile(
      join(workDir, "_context", "audit", "supersessions-2026-04-22.md"),
      "| 2026-04-22T10:00:00Z | user | ... |\n",
      "utf8",
    );
    const result = await checkSupersessions(workDir, "phase_3_started_at");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("no entries after");
  });
});
