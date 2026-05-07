/**
 * Unit tests for src/gate/checks/config-check.ts (§4.14).
 */

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configCheck } from "../src/gate/checks/config-check";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-config-check-"));
  await mkdir(join(workDir, ".coldpress"), { recursive: true });
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function writeConfig(content: string): Promise<void> {
  await writeFile(join(workDir, ".coldpress", "local-config.yaml"), content, "utf8");
}

describe("configCheck", () => {
  it("passes when key equals expected value", async () => {
    await writeConfig("post_phase_3_update_ran: true\n");
    const result = await configCheck(workDir, "post_phase_3_update_ran", { expected: "true" });
    expect(result.ok).toBe(true);
  });

  it("fails when key does not match expected", async () => {
    await writeConfig("post_phase_3_update_ran: false\n");
    const result = await configCheck(workDir, "post_phase_3_update_ran", { expected: "true" });
    expect(result.ok).toBe(false);
    expect(result.message).toContain("expected");
  });

  it("passes with allowEmptyString when value is empty string", async () => {
    await writeConfig("stack_pack: ''\n");
    const result = await configCheck(workDir, "stack_pack", { allowEmptyString: true });
    expect(result.ok).toBe(true);
  });

  it("fails when key is absent", async () => {
    await writeConfig("phase_1_completed: true\n");
    const result = await configCheck(workDir, "post_phase_3_update_ran");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("not found");
  });

  it("passes presence check (no expected) when key is set to any value", async () => {
    await writeConfig("phase_3_started_at: '2026-04-24T10:00:00Z'\n");
    const result = await configCheck(workDir, "phase_3_started_at");
    expect(result.ok).toBe(true);
  });
});
