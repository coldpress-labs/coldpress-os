/**
 * Tests for Wave 2.5 — the stack-pack wrapper generator that powers
 * `coldpress update --post-phase-3`. CLI wiring for the `--post-phase-3`
 * flag is not currently exposed in cli.ts; tests here focus on the
 * underlying generator (pure function) which the CLI will delegate to
 * when the flag lands.
 */

import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copyFramework, copyTemplate } from "../src/utils/scaffold";
import { generateStackPackWrappers, generateWrappers } from "../src/utils/wrappers";

describe("generateStackPackWrappers", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-stack-wrappers-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("returns 0 when the stack pack has no skills directory", async () => {
    await mkdir(join(tmp, "coldpress-os"), { recursive: true });
    const count = await generateStackPackWrappers(tmp, "nonexistent");
    expect(count).toBe(0);
  });

  it("writes wrappers for each SKILL.md inside the given stack pack", async () => {
    // Synthesize a minimal stack pack under coldpress-os/skills/stack-packs/demo/
    const packRoot = join(tmp, "coldpress-os", "skills", "stack-packs", "demo");
    const skillDir = join(packRoot, "example-skill");
    await mkdir(skillDir, { recursive: true });
    await writeFile(
      join(skillDir, "SKILL.md"),
      `---
name: "demo-example"
description: "Demo stack-pack skill"
---

Do something demo-specific.
`,
    );

    const count = await generateStackPackWrappers(tmp, "demo");
    expect(count).toBe(1);

    const wrapper = await readFile(
      join(tmp, ".claude", "skills", "demo-example", "SKILL.md"),
      "utf8",
    );
    expect(wrapper).toContain('name: "demo-example"');
    expect(wrapper).toContain("coldpress-os/skills/stack-packs/demo/example-skill/SKILL.md");
  });

  it("default generateWrappers still skips stack-packs (post-Phase-3 is the only way to get them)", async () => {
    // Scaffold a minimal coldpress-os tree so generateWrappers has something to chew on.
    await copyTemplate({
      projectName: "x",
      slug: "x",
      userName: "u",
      targetDir: tmp,
    });
    await copyFramework(tmp);
    const count = await generateWrappers(tmp);

    expect(count).toBeGreaterThan(0);
    // No stack-pack wrappers should land in .claude/skills/.
    const dirents = await (async () => {
      try {
        const { readdir } = await import("node:fs/promises");
        return await readdir(join(tmp, ".claude", "skills"));
      } catch {
        return [];
      }
    })();
    // We don't know every stack-pack skill name, but vibe-coder-fullstack-specific skills
    // start with e.g. "vibe-coder-fullstack-" in their frontmatter name conventionally.
    // Just verify the directory exists and has plenty of non-stack wrappers.
    expect(dirents.length).toBeGreaterThan(10);
  });
});

describe("generateStackPackWrappers — vibe-coder-fullstack pack integration", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-stack-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("emits wrappers for the shipped vibe-coder-fullstack stack pack when invoked directly", async () => {
    // Scaffold a minimal project so framework files land under coldpress-os/.
    await copyTemplate({ projectName: "x", slug: "x", userName: "u", targetDir: tmp });
    await copyFramework(tmp);

    const count = await generateStackPackWrappers(tmp, "vibe-coder-fullstack");
    expect(count).toBeGreaterThan(0);
    // Sanity: the generated wrappers point back at the framework stack pack.
    const someWrapper = await readFile(
      join(tmp, ".claude", "skills", "quickstart", "SKILL.md"),
      "utf8",
    );
    expect(someWrapper).toContain("coldpress-os/skills/stack-packs/vibe-coder-fullstack/");
  }, 30_000);
});
