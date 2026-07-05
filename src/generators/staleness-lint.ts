/**
 * `lint:staleness` (WS11 S3.5 guard) — a denylist grep over shipped docs/skills
 * that catches **content rot** reference-integrity checks miss: retired agents
 * cited as live routing, the desanctified PERT chart, removed CLI verbs, and the
 * old "11 subagents" count. The structure audit found these survive because a
 * "who reads this file" check verifies wiring, not *what the file says*.
 *
 * Each denylisted token flags a line UNLESS the line carries historical/
 * surgery context (e.g. "was @qa", "@qa → @verifier", "removed", a VC date/
 * version) — those legitimately describe the retirement. Whole historical files
 * (CHANGELOG, the overhaul ledger, archive manifests, the attribution audit) are
 * skipped. Run in CI; exit 1 on any live stale reference.
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { packageRoot } from "../utils/paths.js";

/** Shipped source surfaces to scan (plugin/ is generated from skills/ — skip). */
const SCAN_DIRS = [
  "lifecycle",
  "skills",
  "governance",
  "data",
  "authoring",
  "docs",
  "template",
  "schemas",
];

const SCAN_EXT = /\.(md|ya?ml|json)$/;

/**
 * Hand-maintained tabular catalogs scheduled for GENERATION in WS11 S5. They
 * carry known stale rows (retired agents / PERT) until the `build:registries`
 * generator regenerates them; skip-listed here so the lint is green now, and
 * REMOVE from this set when S5 makes each one generated + drift-checked.
 */
const S5_REGEN_TARGETS = new Set([
  "REGISTRY.md",
  "TEMPLATES-REGISTRY.md",
  "docs/flow-map.md",
  "docs/skill-index.md",
  "docs/subagent-phase-matrix.md",
  "docs/decision-trees.md",
  "docs/phase-subfolder-mapping.md",
  "docs/spec-plan-implement-review-mapping.md",
  "docs/handoff-registry.md",
]);

/** Whole files that are legitimately historical — skipped entirely. */
function isHistoricalFile(rel: string): boolean {
  return (
    rel === "CHANGELOG.md" ||
    rel === "CHANGELOG-archive.md" ||
    rel.startsWith("docs/overhaul/") ||
    /ARCHIVE-MANIFEST/i.test(rel) ||
    rel === "docs/attribution-audit.md" || // companion to public NOTICE (kept, historical)
    rel === "docs/agent-schema.md" || // its VC panel documents the roster surgery by design
    S5_REGEN_TARGETS.has(rel)
  );
}

/** Retired tokens that must not appear as *live* references in shipped content. */
const DENYLIST: Array<{ re: RegExp; label: string }> = [
  { re: /(?<![\w@-])@(qa|scrum-master|communicator|valet)\b/, label: "retired agent as live routing" },
  { re: /pert-chart/i, label: "desanctified PERT chart" },
  { re: /wave-orchestration/, label: "retired wave-orchestration skill" },
  { re: /coldpress graph\b/, label: "removed `coldpress graph` verb" },
  { re: /\b11 (subagents|Shape A subagents)\b/i, label: "stale 11-subagent count" },
];

/**
 * A line is allowed (it's describing the retirement, not using it live) when it
 * carries a surgery/historical marker or a VC date/version stamp.
 */
const ALLOW_CONTEXT =
  /→|->|\bwas\b|retire|remov|replac|no longer|excis|deprecat|surgery|legacy|desanctif|abolish|former|historical|renamed|folded|successor|\bgone\b|\bv0\.\d|\d{4}-\d{2}-\d{2}/i;

interface Violation {
  file: string;
  line: number;
  token: string;
  label: string;
  text: string;
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  let out: string[] = [];
  for (const e of readdirSync(dir)) {
    if (e === "node_modules") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (SCAN_EXT.test(e)) out.push(p);
  }
  return out;
}

export function lintStaleness(root: string = packageRoot): Violation[] {
  const violations: Violation[] = [];
  const files = SCAN_DIRS.flatMap((d) => walk(join(root, d)));
  // Root-level shipped markdown (README, TEMPLATES-REGISTRY, NOTICE, …).
  for (const e of readdirSync(root)) {
    if (SCAN_EXT.test(e) && statSync(join(root, e)).isFile()) files.push(join(root, e));
  }

  for (const f of files) {
    const rel = f.slice(root.length + 1);
    if (isHistoricalFile(rel)) continue;
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((text, i) => {
      if (ALLOW_CONTEXT.test(text)) return;
      for (const { re, label } of DENYLIST) {
        const m = re.exec(text);
        if (m) violations.push({ file: rel, line: i + 1, token: m[0], label, text: text.trim().slice(0, 120) });
      }
    });
  }
  return violations;
}

// Run directly (tsx): report + exit.
const found = lintStaleness();
if (found.length === 0) {
  process.stdout.write("lint:staleness OK — no live references to retired agents/PERT/graph/11-subagents.\n");
} else {
  process.stderr.write(`lint:staleness FAILED — ${found.length} stale reference(s):\n`);
  for (const v of found) {
    process.stderr.write(`  ✗ ${v.file}:${v.line} [${v.label}] "${v.token}"\n     ${v.text}\n`);
  }
  process.exit(1);
}
