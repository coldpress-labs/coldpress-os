import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";

export type GitInitStatus = "initialised" | "already-present" | "skipped-missing-git" | "failed";

export interface GitInitResult {
  status: GitInitStatus;
  committed: boolean;
  warning?: string;
}

export interface GitInitOptions {
  targetDir: string;
  commitMessage?: string;
}

/**
 * Initialise a git repo in the scaffolded project and make a single seed commit.
 *
 * - Safe if `.git/` already exists (returns `already-present`, no-op).
 * - Safe if `git` is not installed (returns `skipped-missing-git`, warning set).
 * - If `git init` succeeds but `git commit` fails (e.g. no user.name/email
 *   configured), we still return success on the init step with a warning;
 *   the repo is usable, the user can commit once identity is configured.
 */
export async function initGitRepo(opts: GitInitOptions): Promise<GitInitResult> {
  const { targetDir } = opts;
  const commitMessage = opts.commitMessage ?? "chore: coldpress init scaffold";

  if (await pathExists(join(targetDir, ".git"))) {
    return { status: "already-present", committed: false };
  }

  if (!(await gitAvailable())) {
    return {
      status: "skipped-missing-git",
      committed: false,
      warning: "git binary not found on PATH — skipped repo init",
    };
  }

  try {
    await runGit(["init", "--quiet", "--initial-branch=main"], targetDir);
  } catch (err) {
    return {
      status: "failed",
      committed: false,
      warning: `git init failed: ${describeError(err)}`,
    };
  }

  try {
    await runGit(["add", "."], targetDir);
    await runGit(["commit", "--quiet", "-m", commitMessage], targetDir);
    return { status: "initialised", committed: true };
  } catch (err) {
    return {
      status: "initialised",
      committed: false,
      warning:
        `git repo created, but initial commit failed (${describeError(err)}). ` +
        `Configure git user.name / user.email and run: git commit -m "${commitMessage}"`,
    };
  }
}

async function gitAvailable(): Promise<boolean> {
  try {
    await runGit(["--version"]);
    return true;
  } catch {
    return false;
  }
}

function runGit(args: string[], cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`git ${args.join(" ")} exited ${code}: ${stderr.trim()}`));
    });
  });
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
