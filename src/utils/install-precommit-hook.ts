import { chmod, copyFile, mkdir } from "node:fs/promises";
import { access } from "node:fs/promises";
import { join } from "node:path";

export type HookInstallStatus = "installed" | "no-git-dir" | "no-source-script" | "failed";

export interface HookInstallResult {
  status: HookInstallStatus;
  warning?: string;
}

/**
 * Copy `scripts/check-secrets.sh` into `.git/hooks/pre-commit` and mark it
 * executable. Assumes a git repo already exists at targetDir; returns a
 * `no-git-dir` status (warning-level, not an error) if not.
 */
export async function installSecretScanHook(
  targetDir: string,
): Promise<HookInstallResult> {
  const gitDir = join(targetDir, ".git");
  if (!(await pathExists(gitDir))) {
    return { status: "no-git-dir" };
  }

  const src = join(targetDir, "scripts", "check-secrets.sh");
  if (!(await pathExists(src))) {
    return {
      status: "no-source-script",
      warning: `scripts/check-secrets.sh missing — skipped pre-commit hook install`,
    };
  }

  const hooksDir = join(gitDir, "hooks");
  const dest = join(hooksDir, "pre-commit");
  try {
    await mkdir(hooksDir, { recursive: true });
    await copyFile(src, dest);
    await chmod(dest, 0o755);
    return { status: "installed" };
  } catch (err) {
    return {
      status: "failed",
      warning: `pre-commit hook install failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
