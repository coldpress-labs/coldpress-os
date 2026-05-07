/**
 * Tests for retrofit mode in copyTemplate (Wave 2.2). Verifies we layer
 * onto an existing repo without clobbering user-owned files.
 */

import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertNoCollision, copyTemplate } from "../src/utils/scaffold";

describe("copyTemplate — retrofit mode", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-retrofit-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  async function seedExistingRepo(): Promise<void> {
    // Simulate an existing repo: user's package.json, .gitignore, CLAUDE.md, source code.
    await writeFile(join(tmp, "package.json"), JSON.stringify({ name: "existing-app" }, null, 2));
    await writeFile(join(tmp, ".gitignore"), "node_modules/\n.env\n");
    await writeFile(join(tmp, "CLAUDE.md"), "# User's existing CLAUDE.md\nMy own content.\n");
    await mkdir(join(tmp, "src"), { recursive: true });
    await writeFile(join(tmp, "src", "index.ts"), "// existing source\n");
  }

  it("preserves existing package.json, source, and user CLAUDE.md", async () => {
    await seedExistingRepo();

    await copyTemplate({
      projectName: "Existing App",
      slug: "existing-app",
      userName: "Tester",
      targetDir: tmp,
      retrofit: true,
    });

    // User package.json untouched.
    const pkg = JSON.parse(await readFile(join(tmp, "package.json"), "utf8"));
    expect(pkg.name).toBe("existing-app");

    // User source untouched.
    const src = await readFile(join(tmp, "src", "index.ts"), "utf8");
    expect(src).toBe("// existing source\n");

    // User CLAUDE.md preserved — placeholder fill skipped.
    const claude = await readFile(join(tmp, "CLAUDE.md"), "utf8");
    expect(claude).toBe("# User's existing CLAUDE.md\nMy own content.\n");
  });

  it("writes coldpress.yaml with retrofit: true", async () => {
    await seedExistingRepo();

    await copyTemplate({
      projectName: "Existing App",
      slug: "existing-app",
      userName: "Tester",
      targetDir: tmp,
      retrofit: true,
    });

    const yaml = await readFile(join(tmp, "coldpress.yaml"), "utf8");
    expect(yaml).toMatch(/retrofit:\s*true/);
    expect(yaml).toContain('name: "Existing App"');
  });

  it("layers coldpress-os structural folders (_context, _input, secure, scripts)", async () => {
    await seedExistingRepo();

    await copyTemplate({
      projectName: "Existing App",
      slug: "existing-app",
      userName: "Tester",
      targetDir: tmp,
      retrofit: true,
    });

    // Fresh scaffold folders present even in retrofit.
    for (const probe of [
      "_input/assets/README.md",
      "_input/raw/README.md",
      "_context",
      "secure/manifest.yaml",
      "scripts/check-secrets.sh",
      ".claude/SYSTEM.md",
    ]) {
      await expect(stat(join(tmp, probe))).resolves.toBeTruthy();
    }
  });

  it("fills SYSTEM.md placeholders even in retrofit", async () => {
    await seedExistingRepo();

    await copyTemplate({
      projectName: "Existing App",
      slug: "existing-app",
      userName: "Tester",
      targetDir: tmp,
      retrofit: true,
    });

    const system = await readFile(join(tmp, ".claude", "SYSTEM.md"), "utf8");
    expect(system).toContain("Existing App");
    expect(system).not.toContain("{project.name}");
  });

  it("fills a NEW CLAUDE.md when the user doesn't have one", async () => {
    // No seed — retrofit onto empty dir (edge case; collision check would
    // usually fire for `.claude/` if truly empty, but that's checked
    // separately in assertNoCollision).
    await copyTemplate({
      projectName: "Fresh App",
      slug: "fresh-app",
      userName: "Tester",
      targetDir: tmp,
      retrofit: true,
    });

    const claude = await readFile(join(tmp, "CLAUDE.md"), "utf8");
    expect(claude).toContain("Fresh App");
    expect(claude).not.toContain("{project.name}");
  });

  it("collision check still fires on pre-existing coldpress.yaml in retrofit", async () => {
    await writeFile(join(tmp, "coldpress.yaml"), "# existing\n");
    await expect(assertNoCollision(tmp)).rejects.toThrow(/coldpress\.yaml/);
  });
});
