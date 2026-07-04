/**
 * WS11 S1.1 — the gate-check verbs are registered and reachable end-to-end.
 *
 * The phase-gate runner (`src/gate/run.ts`) evaluates each `gate.json` check by
 * spawning `coldpress <verb> …` as a CLI subprocess. Before WS11, none of the
 * eight acceptance-check verbs (`config-check`, `validate-adrs`,
 * `validate-pack-match`, `validate-yaml-block`, `validate-schema-latest`,
 * `validate-schema`, `file-exists-after`, `gate-check-supersessions`) existed on
 * the CLI, so every block-severity gate check failed as "unknown command".
 *
 * Two guards:
 *   1. Source invariant (build-free): every `command:` verb in every shipped
 *      gate.json is registered in src/cli.ts. Catches this class for any future
 *      gate.json, not just today's eight.
 *   2. True e2e (spawns dist/cli.js): representative verbs run in a real project
 *      cwd and produce their own ✓/✗ output — never Commander's unknown-command
 *      error. Includes the t1 case (validate-yaml-block resolves the exact
 *      `--schema schemas/…` string the gate.json authors write).
 *
 * Part 2 requires a current `dist/` (CI builds before `npm test`; rebuild
 * locally after touching src/cli.ts).
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(repoRoot, "dist", "cli.js");

/** Every `"command": "coldpress <verb> …"` verb across all shipped gate.json files. */
function gateCommandVerbs(): Set<string> {
  const lifecycle = join(repoRoot, "lifecycle");
  const verbs = new Set<string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name === "gate.json") {
        const raw = readFileSync(p, "utf8");
        for (const m of raw.matchAll(/"command"\s*:\s*"coldpress\s+([a-z][a-z-]*)/g)) {
          verbs.add(m[1]!);
        }
      }
    }
  };
  walk(lifecycle);
  return verbs;
}

describe("gate-check verbs — source invariant (WS11 S1.1)", () => {
  it("every gate.json command verb is registered in src/cli.ts", () => {
    const cliSrc = readFileSync(join(repoRoot, "src", "cli.ts"), "utf8");
    const registered = new Set(
      [...cliSrc.matchAll(/\.command\(\s*["']([a-z][a-z-]*)/g)].map((m) => m[1]!),
    );
    const missing = [...gateCommandVerbs()].filter((v) => !registered.has(v));
    expect(missing, `gate.json verbs with no CLI registration: ${missing.join(", ")}`).toEqual([]);
  });

  it("covers the eight verbs the audit named", () => {
    const verbs = gateCommandVerbs();
    for (const v of [
      "config-check", "validate-adrs", "validate-pack-match", "validate-yaml-block",
      "validate-schema-latest", "validate-schema", "file-exists-after", "gate-check-supersessions",
    ]) {
      expect(verbs.has(v), `expected gate.json to exercise verb ${v}`).toBe(true);
    }
  });
});

describe("gate-check verbs — end-to-end via dist/cli.js (WS11 S1.1)", () => {
  let work: string;
  afterEach(() => {
    if (work) rmSync(work, { recursive: true, force: true });
  });

  const runVerb = (args: string[], cwd: string) =>
    spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });

  beforeAll(() => {
    if (!existsSync(cli)) {
      throw new Error(`dist/cli.js missing — run \`npm run build\` before \`npm test\` (CI does this).`);
    }
  });

  it("config-check runs (not 'unknown command') and passes for an allowed empty string", () => {
    work = mkdtempSync(join(tmpdir(), "cp-verb-config-"));
    mkdirSync(join(work, ".coldpress"), { recursive: true });
    writeFileSync(join(work, ".coldpress", "local-config.yaml"), 'stack_pack: ""\n');
    const r = runVerb(["config-check", "stack_pack", "--allow-empty-string"], work);
    expect(r.stderr).not.toContain("unknown command");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("✓");
  });

  it("validate-pack-match runs and fails cleanly (real check result, not unknown command)", () => {
    work = mkdtempSync(join(tmpdir(), "cp-verb-pack-"));
    const r = runVerb(["validate-pack-match"], work);
    expect(r.stderr).not.toContain("unknown command");
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("stack-shortlist");
  });

  it("gate-check-supersessions runs and passes with no logs", () => {
    work = mkdtempSync(join(tmpdir(), "cp-verb-super-"));
    const r = runVerb(["gate-check-supersessions", "--after-key", "phase_3_started_at"], work);
    expect(r.stderr).not.toContain("unknown command");
    expect(r.status).toBe(0);
  });

  it("validate-yaml-block resolves the exact gate.json --schema string (t1: no doubled schemas/ path)", () => {
    work = mkdtempSync(join(tmpdir(), "cp-verb-yaml-"));
    writeFileSync(
      join(work, "coldpress.yaml"),
      [
        "project:",
        "  name: test",
        'stack_pack: ""',
        "baselines:",
        "  seo_aeo_llm: { status: confirmed, covered_by_pack: \"true\" }",
        "  accessibility: { status: confirmed, covered_by_pack: \"partial\" }",
        "  security: { status: confirmed, covered_by_pack: \"partial\" }",
        "  future_proof: { status: opted-out, covered_by_pack: \"false\", rationale: \"Internal tool\" }",
        "",
      ].join("\n"),
    );
    // The gate.json authors write the schema path relative to the package root
    // (`schemas/baselines.schema.json`); the check resolves under packageRoot/schemas/.
    const r = runVerb(
      ["validate-yaml-block", "coldpress.yaml", "baselines", "--schema", "schemas/baselines.schema.json"],
      work,
    );
    expect(r.stderr).not.toContain("unknown command");
    expect(r.stderr).not.toContain("ENOENT");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("✓");
  });
});
