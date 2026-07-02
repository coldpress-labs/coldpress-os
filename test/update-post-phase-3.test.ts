/**
 * Post-WS5-C (§8 item 8): init-time skill wrappers — including the stack-pack
 * wrapper generator that powered `coldpress update --post-phase-3` — were
 * deleted. Skills now ship in the self-contained coldpress-os plugin, so ALL
 * stack-pack skills reach the consumer via the plugin bundle rather than being
 * generated per-pack after Phase 3. `--post-phase-3` now only verifies the
 * locked stack's tools (doctor --stack) and records completion.
 *
 * These tests verify the plugin-based distribution replaces the wrapper path.
 */

import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copyFramework, copyTemplate } from "../src/utils/scaffold";

describe("stack-pack skills ship via the plugin (post-WS5-C)", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-plugin-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("copies the plugin into the consumer and bundles stack-pack skills — no wrapper tree", async () => {
    await copyTemplate({ projectName: "x", slug: "x", userName: "u", targetDir: tmp });
    await copyFramework(tmp);

    // No init-time `.claude/skills/` wrapper tree is generated (wrappers deleted).
    await expect(stat(join(tmp, ".claude/skills"))).rejects.toThrow();

    // A vibe-coder-fullstack stack-pack skill is present in the bundled plugin,
    // available without any post-Phase-3 wrapper regeneration.
    const stackSkill = await readFile(
      join(tmp, "coldpress-os/plugin/skills/create-component/SKILL.md"),
      "utf8",
    );
    expect(stackSkill).toContain("name: create-component");
  }, 30_000);
});
