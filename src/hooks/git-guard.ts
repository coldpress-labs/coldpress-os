/**
 * `git-guard` — PreToolUse(Bash) hook (action plan §4.4 / G4 git protocol).
 *
 * Trunk-based discipline: blocks a direct `git commit` to `main`/`master` from a
 * subagent context. Butler (the main session, no `agent_type`) may commit to main
 * — that is where IN-* integration stories land; subagents work on story
 * branches. Only inspects `git commit` commands on the protected branch; all
 * other Bash passes through. Overridable via COLDPRESS_OVERRIDE="git-guard:<reason>".
 */

import { spawnSync } from "node:child_process";
import type { HookDecision, HookHandler, HookInput } from "./types.js";

const PROTECTED = new Set(["main", "master"]);
const COMMIT_RE = /\bgit\b[^\n]*\bcommit\b/;

const EXPLAIN = `git-guard (PreToolUse: Bash)
Blocks a direct \`git commit\` to main/master from a subagent context (trunk-based
protocol). Butler (main session) may commit to main; subagents work on story
branches. Only \`git commit\` on the protected branch is inspected. Override
(logged): COLDPRESS_OVERRIDE="git-guard:<reason>".`;

/** Current branch of the repo at cwd, or undefined if not a git repo. */
export function currentBranch(cwd: string): string | undefined {
  const r = spawnSync("git", ["-C", cwd, "branch", "--show-current"], { encoding: "utf8" });
  if (r.status !== 0) return undefined;
  const b = r.stdout.trim();
  return b || undefined;
}

/** Pure decision — separated for testing without shelling out. */
export function decideGitGuard(command: string, branch: string | undefined, isSubagent: boolean): HookDecision {
  if (!COMMIT_RE.test(command)) return { kind: "none" };
  if (!branch || !PROTECTED.has(branch)) return { kind: "none" };
  if (!isSubagent) return { kind: "none" }; // Butler may commit to main
  return {
    kind: "deny",
    reason:
      `Blocked: direct commit to '${branch}' from a subagent. Trunk-based protocol — ` +
      `work on a story branch (e.g. \`git checkout -b story/ST-xxx\`) and let Butler merge ` +
      `IN-* integration stories to ${branch}. Override (logged): COLDPRESS_OVERRIDE="git-guard:<reason>".`,
  };
}

export const gitGuardHandler: HookHandler = {
  name: "git-guard",
  event: "PreToolUse",
  overrideGate: "git-guard",
  explain: EXPLAIN,
  run(input: HookInput): HookDecision {
    const command = typeof input.tool_input?.command === "string" ? input.tool_input.command : "";
    if (!command || !COMMIT_RE.test(command)) return { kind: "none" };
    const cwd = input.cwd ?? process.cwd();
    const isSubagent = typeof input.agent_type === "string" && input.agent_type.length > 0;
    return decideGitGuard(command, currentBranch(cwd), isSubagent);
  },
};
