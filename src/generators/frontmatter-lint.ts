/**
 * `lint:frontmatter` (action plan §9 WS5) — validate every SKILL.md's frontmatter
 * across the corpus. Enforces: required fields (name, description), a valid
 * `agent:` reference (the post-§4.5 roster + Butler), and a valid `type`. Run in
 * CI (via check or its own job); exit 1 on any violation.
 *
 * The "frontmatter-lint green corpus-wide" acceptance depends on this passing.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { packageRoot } from "../utils/paths.js";

/** The valid subagent slugs after the v0.4 roster surgery (§4.5) + Butler. */
const VALID_AGENTS = new Set([
  "analyst",
  "pm",
  "ux-designer",
  "architect",
  "developer",
  "devops",
  "verifier",
  "reviewer",
  "butler",
]);

const VALID_TYPES = new Set(["simple", "workflow", "router", "meta", "pack", "reference"]);

interface Violation {
  file: string;
  message: string;
}

function walk(dir: string): string[] {
  let out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (e === "SKILL.md") out.push(p);
  }
  return out;
}

function frontmatter(md: string): Record<string, unknown> | null {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return null;
  try {
    return (parseYaml(m[1]!) as Record<string, unknown>) ?? {};
  } catch {
    return null;
  }
}

export function lintFrontmatter(root: string = packageRoot): Violation[] {
  const violations: Violation[] = [];
  const files = [join(root, "skills"), join(root, "lifecycle")].flatMap((d) => walk(d));

  for (const f of files) {
    const rel = f.slice(root.length + 1);
    const fm = frontmatter(readFileSync(f, "utf8"));
    if (!fm) {
      violations.push({ file: rel, message: "missing or unparseable YAML frontmatter" });
      continue;
    }
    if (typeof fm.name !== "string" || !fm.name.trim()) violations.push({ file: rel, message: "missing `name`" });
    if (typeof fm.description !== "string" || !fm.description.trim()) violations.push({ file: rel, message: "missing `description` (required by the Agent Skills spec)" });
    if (typeof fm.type === "string" && !VALID_TYPES.has(fm.type)) violations.push({ file: rel, message: `invalid \`type: ${fm.type}\` (expected ${[...VALID_TYPES].join(" | ")})` });
    if (fm.agent !== undefined) {
      if (typeof fm.agent !== "string" || !VALID_AGENTS.has(fm.agent)) {
        violations.push({ file: rel, message: `invalid \`agent: ${String(fm.agent)}\` (not in the roster: ${[...VALID_AGENTS].join(", ")})` });
      }
    }
  }
  return violations;
}

// Run directly (tsx): report + exit.
const found = lintFrontmatter();
if (found.length === 0) {
  process.stdout.write("lint:frontmatter OK — all SKILL.md frontmatter is valid.\n");
} else {
  process.stderr.write(`lint:frontmatter FAILED — ${found.length} violation(s):\n`);
  for (const v of found) process.stderr.write(`  ✗ ${v.file}: ${v.message}\n`);
  process.exit(1);
}
