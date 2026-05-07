import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initGitRepo } from "../src/utils/git-init";
import { spawnSync } from "node:child_process";

describe("initGitRepo", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-git-"));
    // Seed with at least one file so `git add .` has something to stage.
    await writeFile(join(tmp, "README.md"), "# test\n", "utf8");
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("initialises a git repo and creates the scaffold commit", async () => {
    const result = await initGitRepo({ targetDir: tmp });
    expect(result.status).toBe("initialised");
    expect(result.committed).toBe(true);

    // .git/ directory exists.
    await expect(stat(join(tmp, ".git"))).resolves.toBeTruthy();

    // git log shows exactly one commit with the scaffold message.
    const log = spawnSync("git", ["log", "--oneline"], { cwd: tmp, encoding: "utf8" });
    expect(log.status).toBe(0);
    expect(log.stdout).toContain("chore: coldpress init scaffold");
    expect(log.stdout.trim().split("\n").length).toBe(1);
  });

  it("honours a custom commit message", async () => {
    const result = await initGitRepo({ targetDir: tmp, commitMessage: "feat: custom seed" });
    expect(result.committed).toBe(true);
    const log = spawnSync("git", ["log", "--oneline"], { cwd: tmp, encoding: "utf8" });
    expect(log.stdout).toContain("feat: custom seed");
  });

  it("no-ops when .git/ already exists", async () => {
    // Pre-seed with an existing git repo.
    spawnSync("git", ["init", "--quiet"], { cwd: tmp });

    const result = await initGitRepo({ targetDir: tmp });
    expect(result.status).toBe("already-present");
    expect(result.committed).toBe(false);
    expect(result.warning).toBeUndefined();
  });
});
