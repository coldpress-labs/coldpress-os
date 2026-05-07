import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { installSecretScanHook } from "../src/utils/install-precommit-hook";

describe("installSecretScanHook", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-hook-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  async function seedRepoWithSecretScript(): Promise<void> {
    await mkdir(join(tmp, "scripts"), { recursive: true });
    await writeFile(
      join(tmp, "scripts", "check-secrets.sh"),
      "#!/usr/bin/env bash\nexit 0\n",
      { mode: 0o755 },
    );
    spawnSync("git", ["init", "--quiet"], { cwd: tmp });
  }

  it("copies check-secrets.sh to .git/hooks/pre-commit and marks it executable", async () => {
    await seedRepoWithSecretScript();

    const result = await installSecretScanHook(tmp);
    expect(result.status).toBe("installed");

    const hookPath = join(tmp, ".git", "hooks", "pre-commit");
    const hookContents = await readFile(hookPath, "utf8");
    expect(hookContents).toContain("#!/usr/bin/env bash");

    const hookStat = await stat(hookPath);
    // Owner-executable bit set.
    expect(hookStat.mode & 0o100).toBeGreaterThan(0);
  });

  it("returns no-git-dir when .git/ is absent", async () => {
    const result = await installSecretScanHook(tmp);
    expect(result.status).toBe("no-git-dir");
    expect(result.warning).toBeUndefined();
  });

  it("returns no-source-script with a warning when check-secrets.sh is missing", async () => {
    spawnSync("git", ["init", "--quiet"], { cwd: tmp });
    const result = await installSecretScanHook(tmp);
    expect(result.status).toBe("no-source-script");
    expect(result.warning).toMatch(/check-secrets\.sh missing/);
  });
});
