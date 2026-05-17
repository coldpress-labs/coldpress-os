import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";

const FALLBACK_USER_NAME = "coldpress";
const FALLBACK_USER_EMAIL = "noreply@coldpressai.com";

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
 * - If git user.name/user.email is not configured globally, we still
 *   produce the seed commit by passing a fallback identity (`coldpress`
 *   / `noreply@coldpressai.com`) as commit-time environment variables —
 *   the user's later commits use their own identity once they configure
 *   git. This avoids consumers (and CI runners) getting a repo with no
 *   initial commit.
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
    const commitEnv = (await hasGitIdentity(targetDir))
      ? undefined
      : {
          GIT_AUTHOR_NAME: FALLBACK_USER_NAME,
          GIT_AUTHOR_EMAIL: FALLBACK_USER_EMAIL,
          GIT_COMMITTER_NAME: FALLBACK_USER_NAME,
          GIT_COMMITTER_EMAIL: FALLBACK_USER_EMAIL,
        };
    await runGit(["commit", "--quiet", "-m", commitMessage], targetDir, commitEnv);
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

async function hasGitIdentity(cwd: string): Promise<boolean> {
  try {
    await runGit(["config", "--get", "user.name"], cwd);
    await runGit(["config", "--get", "user.email"], cwd);
    return true;
  } catch {
    return false;
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

function runGit(
  args: string[],
  cwd?: string,
  extraEnv?: Record<string, string>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: extraEnv ? { ...process.env, ...extraEnv } : process.env,
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
