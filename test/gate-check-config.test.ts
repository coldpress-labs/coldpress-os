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

async function writeColdpressYaml(content: string): Promise<void> {
  await writeFile(join(workDir, "coldpress.yaml"), content, "utf8");
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

// ── VP1 O8: config-check must read the file that actually holds the key ──
// The P3 gate `stack-pack-written-to-yaml` checks a coldpress.yaml field, but
// config-check historically only read .coldpress/local-config.yaml — so a
// correctly-locked stack reported "not found" and the block-severity gate could
// never pass. The prior suite masked this by writing `stack_pack` INTO
// local-config.yaml (a layout that never occurs: the stack-locking skill writes
// it to coldpress.yaml). These tests use the REAL layout.
describe("configCheck --file coldpress.yaml (VP1 O8 regression)", () => {
  it("FAILS-BEFORE analogue: stack_pack in coldpress.yaml is invisible to the local-config reader", async () => {
    await writeColdpressYaml('stack_pack: "static-multipage-blog"\n');
    // No --file → reads local-config.yaml (absent) → the old always-fail behaviour.
    const result = await configCheck(workDir, "stack_pack", { allowEmptyString: true });
    expect(result.ok).toBe(false);
    expect(result.message).toContain(".coldpress/local-config.yaml");
  });

  it("PASSES-AFTER: --file coldpress.yaml sees the locked stack_pack", async () => {
    await writeColdpressYaml('stack_pack: "static-multipage-blog"\n');
    const result = await configCheck(workDir, "stack_pack", {
      allowEmptyString: true,
      file: "coldpress.yaml",
    });
    expect(result.ok).toBe(true);
    expect(result.actual).toBe("static-multipage-blog");
  });

  it("empty string stack_pack in coldpress.yaml passes with allowEmptyString (no-pack, generic path)", async () => {
    await writeColdpressYaml("stack_pack: ''\n");
    const result = await configCheck(workDir, "stack_pack", {
      allowEmptyString: true,
      file: "coldpress.yaml",
    });
    expect(result.ok).toBe(true);
  });

  it("missing coldpress.yaml key still fails, naming the coldpress.yaml file", async () => {
    await writeColdpressYaml('project:\n  name: "x"\n');
    const result = await configCheck(workDir, "stack_pack", { file: "coldpress.yaml" });
    expect(result.ok).toBe(false);
    expect(result.message).toContain("coldpress.yaml");
  });

  it("--expected still works against coldpress.yaml (e.g. deploy_pack)", async () => {
    await writeColdpressYaml('deploy_pack: "vercel"\n');
    const result = await configCheck(workDir, "deploy_pack", { file: "coldpress.yaml", expected: "vercel" });
    expect(result.ok).toBe(true);
  });
});
