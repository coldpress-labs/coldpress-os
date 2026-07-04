import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

export type CheckSeverity = "ok" | "warning" | "error";

export interface CheckResult {
  id: string;
  label: string;
  severity: CheckSeverity;
  /** Detail string (version, path, reason) — always safe to print. */
  detail?: string;
  /** Human-readable remedy when severity is warning or error. */
  remedy?: string;
}

export interface CheckSuiteResult {
  results: CheckResult[];
  hasError: boolean;
  hasWarning: boolean;
}

function summarise(results: CheckResult[]): CheckSuiteResult {
  return {
    results,
    hasError: results.some((r) => r.severity === "error"),
    hasWarning: results.some((r) => r.severity === "warning"),
  };
}

// ─── Core checks ──────────────────────────────────────────────────────

export async function runCoreChecks(): Promise<CheckSuiteResult> {
  const results: CheckResult[] = [
    checkNode(),
    checkPackageManager(),
    checkGitVersion(),
    checkGitIdentity(),
    checkClaudeCode(),
    checkColdpressCli(),
  ];
  return summarise(results);
}

function checkNode(): CheckResult {
  const res = spawnSync("node", ["--version"], { encoding: "utf8" });
  if (res.status !== 0) {
    return {
      id: "node",
      label: "Node.js ≥ 20",
      severity: "error",
      detail: "node binary not found on PATH",
      remedy: "Install Node.js 20 LTS from https://nodejs.org/",
    };
  }
  const version = (res.stdout ?? "").trim();
  const match = /v?(\d+)\.(\d+)/.exec(version);
  if (!match) {
    return {
      id: "node",
      label: "Node.js ≥ 20",
      severity: "warning",
      detail: `could not parse version: ${version}`,
    };
  }
  const major = parseInt(match[1] ?? "0", 10);
  if (major < 20) {
    return {
      id: "node",
      label: "Node.js ≥ 20",
      severity: "error",
      detail: `found ${version} — coldpress-os requires Node 20+`,
      remedy: "Upgrade to Node 20 LTS from https://nodejs.org/",
    };
  }
  return { id: "node", label: "Node.js ≥ 20", severity: "ok", detail: version };
}

function checkPackageManager(): CheckResult {
  const available: string[] = [];
  for (const bin of ["pnpm", "bun", "yarn", "npm"]) {
    const r = spawnSync(bin, ["--version"], { encoding: "utf8" });
    if (r.status === 0) {
      available.push(`${bin} ${(r.stdout ?? "").trim()}`);
    }
  }
  if (available.length === 0) {
    return {
      id: "package-manager",
      label: "Package manager",
      severity: "error",
      detail: "none of pnpm / bun / yarn / npm on PATH",
      remedy: "Install Node.js (bundles npm) from https://nodejs.org/",
    };
  }
  return {
    id: "package-manager",
    label: "Package manager",
    severity: "ok",
    detail: available.join(", "),
  };
}

function checkGitVersion(): CheckResult {
  const res = spawnSync("git", ["--version"], { encoding: "utf8" });
  if (res.status !== 0) {
    return {
      id: "git",
      label: "git ≥ 2.30",
      severity: "error",
      detail: "git binary not found on PATH",
      remedy: "Install git from https://git-scm.com/",
    };
  }
  const version = (res.stdout ?? "").trim();
  const match = /git version (\d+)\.(\d+)/.exec(version);
  if (!match) {
    return { id: "git", label: "git ≥ 2.30", severity: "warning", detail: `could not parse: ${version}` };
  }
  const major = parseInt(match[1] ?? "0", 10);
  const minor = parseInt(match[2] ?? "0", 10);
  if (major < 2 || (major === 2 && minor < 30)) {
    return {
      id: "git",
      label: "git ≥ 2.30",
      severity: "error",
      detail: `found ${version} — coldpress-os requires git 2.30+`,
      remedy: "Upgrade git from https://git-scm.com/",
    };
  }
  return { id: "git", label: "git ≥ 2.30", severity: "ok", detail: version };
}

function checkGitIdentity(): CheckResult {
  const name = spawnSync("git", ["config", "--global", "user.name"], { encoding: "utf8" });
  const email = spawnSync("git", ["config", "--global", "user.email"], { encoding: "utf8" });
  const nameValue = (name.stdout ?? "").trim();
  const emailValue = (email.stdout ?? "").trim();
  const missing: string[] = [];
  if (!nameValue) missing.push("user.name");
  if (!emailValue) missing.push("user.email");
  if (missing.length > 0) {
    return {
      id: "git-identity",
      label: "git user.name + user.email",
      severity: "warning",
      detail: `missing global ${missing.join(", ")}`,
      remedy: `Run: git config --global user.name "Your Name" && git config --global user.email "you@example.com"`,
    };
  }
  return {
    id: "git-identity",
    label: "git user.name + user.email",
    severity: "ok",
    detail: `${nameValue} <${emailValue}>`,
  };
}

function checkClaudeCode(): CheckResult {
  const res = spawnSync("claude", ["--version"], { encoding: "utf8" });
  if (res.status !== 0) {
    return {
      id: "claude-code",
      label: "Claude Code CLI",
      severity: "warning",
      detail: "claude binary not found on PATH",
      remedy: "Install Claude Code — see https://claude.ai/code",
    };
  }
  return {
    id: "claude-code",
    label: "Claude Code CLI",
    severity: "ok",
    detail: (res.stdout ?? "").trim(),
  };
}

/**
 * The `coldpress` CLI must be on PATH (WS10-E1). Every enforcement hook, the
 * SessionStart state-load, and the statusLine invoke `coldpress …` via the thin
 * `scripts/hooks/run.mjs` runner — which fail-opens (exit 0) when the CLI is
 * absent. That is the correct safety posture, but it means a user whose global
 * `coldpress` is missing gets NO enforcement while believing sacred-guard,
 * quality-gate, boundary-guard, etc. are protecting them. This check makes that
 * silent no-op loud: error (not warning), because "protection you think you have
 * but don't" is worse than a visibly-broken install.
 */
function checkColdpressCli(): CheckResult {
  const res = spawnSync("coldpress", ["--version"], { encoding: "utf8" });
  if (res.status !== 0 || res.error) {
    return {
      id: "coldpress-cli",
      // Warning (not error): visible + exit-2 so it never hard-blocks `init`,
      // but loud enough that a user sees enforcement is off. The danger is
      // "protection you think you have but don't".
      label: "coldpress CLI on PATH (enforcement hooks depend on it)",
      severity: "warning",
      detail: "coldpress not found on PATH — ALL hooks + state-load + statusLine silently no-op (NO enforcement)",
      remedy: "Install it globally: `npm i -g @coldpress/core`. Without it, sacred-guard / quality-gate / boundary-guard do nothing.",
    };
  }
  return {
    id: "coldpress-cli",
    label: "coldpress CLI on PATH (enforcement hooks depend on it)",
    severity: "ok",
    detail: (res.stdout ?? "").trim(),
  };
}

// ─── Stack-specific checks (opt-in via --stack) ───────────────────────

export interface StackCheckOptions {
  /** Project root — where coldpress.yaml lives. */
  projectRoot: string;
}

/**
 * Read `coldpress.yaml stack_pack` and run pack-specific tool checks.
 * Returns an empty result set (valid / no-op) when yaml is missing or
 * `stack_pack` is unset / empty — Phase 3 hasn't run yet.
 */
export async function runStackChecks(
  opts: StackCheckOptions,
): Promise<CheckSuiteResult> {
  const stackPack = await readStackPack(opts.projectRoot);
  if (!stackPack) {
    return summarise([
      {
        id: "stack-pack",
        label: "stack_pack",
        severity: "ok",
        detail: "not set — Phase 3 stack-locking has not run (no stack checks apply)",
      },
    ]);
  }

  const checks = STACK_CHECKERS[stackPack];
  if (!checks) {
    return summarise([
      {
        id: "stack-pack",
        label: `stack_pack = ${stackPack}`,
        severity: "warning",
        detail: `no stack-specific doctor checks defined for "${stackPack}"`,
      },
    ]);
  }
  return summarise([
    {
      id: "stack-pack",
      label: "stack_pack",
      severity: "ok",
      detail: stackPack,
    },
    ...checks(),
  ]);
}

async function readStackPack(projectRoot: string): Promise<string | undefined> {
  try {
    const source = await readFile(`${projectRoot}/coldpress.yaml`, "utf8");
    // Intentionally shallow — avoids pulling the yaml parser into a fast-path.
    const match = /^\s*stack_pack\s*:\s*["']?([\w-]+)["']?/m.exec(source);
    if (!match || !match[1]) return undefined;
    return match[1];
  } catch {
    return undefined;
  }
}

type StackChecker = () => CheckResult[];

const STACK_CHECKERS: Record<string, StackChecker> = {
  "vibe-coder-fullstack": () => {
    // Short-timeout PATH lookup — avoid npx fetching convex over the network
    // inside a doctor run. If convex is a devDep in the consumer project it
    // lives at node_modules/.bin/convex and PATH pickup works when invoked
    // from the project root.
    const res = spawnSync("convex", ["--version"], { encoding: "utf8", timeout: 3000 });
    if (res.status === 0) {
      return [
        {
          id: "convex-cli",
          label: "Convex CLI",
          severity: "ok",
          detail: (res.stdout ?? "").trim(),
        },
      ];
    }
    return [
      {
        id: "convex-cli",
        label: "Convex CLI",
        severity: "warning",
        detail: "convex not on PATH — usually fine when it's a project devDep",
        remedy: "If needed standalone: npm install -D convex (then use via npx convex)",
      },
    ];
  },
};

// ─── Exit code helper ────────────────────────────────────────────────

/**
 * Map a completed suite to an exit code:
 *   0 — all pass
 *   1 — at least one error
 *   2 — warnings only (no errors)
 */
export function exitCodeFor(suite: CheckSuiteResult): 0 | 1 | 2 {
  if (suite.hasError) return 1;
  if (suite.hasWarning) return 2;
  return 0;
}
