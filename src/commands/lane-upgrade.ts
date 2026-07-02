/**
 * `coldpress lane-upgrade` (§6) — promote a lite-lane project to the full lane
 * WITHOUT data loss.
 *
 * Lite keeps everything in `_context/sacred/spec.md` (+ `decisions.md`). The full
 * lane wants the separate sacred docs (context, tech-stack, prd, architecture).
 * This command does the mechanical part: flip `lane: lite → full` in
 * coldpress.yaml + state.yaml, and create the full-lane sacred-doc skeletons that
 * carry forward from `spec.md`. The lite artifacts are PRESERVED (never deleted) —
 * that is the "no data loss" guarantee. The `lane-upgrade` skill then guides
 * splitting spec.md's content into the new docs.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

export interface RunLaneUpgradeOptions {
  projectDir?: string;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

/** The full-lane sacred docs back-filled from a lite spec (PERT desanctified). */
const FULL_SACRED = ["context", "tech-stack", "prd", "architecture"] as const;

export function runLaneUpgrade(opts: RunLaneUpgradeOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();

  const cfgPath = join(cwd, "coldpress.yaml");
  if (!existsSync(cfgPath)) {
    warn("lane-upgrade: no coldpress.yaml here. Run from a project root.\n");
    return 1;
  }
  const cfgRaw = readFileSync(cfgPath, "utf8");
  const cfg = parseYaml(cfgRaw) as { lane?: string };
  if (cfg.lane === "full") {
    warn("lane-upgrade: this project is already on the full lane. Nothing to do.\n");
    return 1;
  }

  const specPath = join(cwd, "_context/sacred/spec.md");
  if (!existsSync(specPath)) {
    warn("lane-upgrade: no _context/sacred/spec.md — nothing to back-fill from. Run the lite Spec phase first.\n");
    return 1;
  }

  // 1. Flip lane in coldpress.yaml (preserve everything else).
  writeFileSync(cfgPath, cfgRaw.replace(/^lane:\s*lite\s*$/m, "lane: full"), "utf8");

  // 2. Flip lane in .coldpress/state.yaml, mapping the lite phase to its full-lane
  //    equivalent so orchestration lands mid-lifecycle rather than restarting.
  const statePath = join(cwd, ".coldpress/state.yaml");
  if (existsSync(statePath)) {
    const litePhaseToFull: Record<string, string> = { spec: "4", build: "7", verify: "8", ship: "9" };
    let s = readFileSync(statePath, "utf8");
    s = s
      .replace(/^lane:\s*lite\s*$/m, "lane: full")
      .replace(/^phase:\s*(spec|build|verify|ship)\s*$/m, (_m, lp: string) => `phase: ${litePhaseToFull[lp] ?? "1"}`);
    writeFileSync(statePath, s, "utf8");
  }

  // 3. Back-fill the full-lane sacred-doc skeletons (never clobber existing).
  const sacredDir = join(cwd, "_context/sacred");
  mkdirSync(sacredDir, { recursive: true });
  const created: string[] = [];
  for (const doc of FULL_SACRED) {
    const p = join(sacredDir, `${doc}.md`);
    if (existsSync(p)) continue;
    writeFileSync(p, skeleton(doc), "utf8");
    created.push(`${doc}.md`);
  }

  write(
    `lane-upgrade: promoted lite → full.\n` +
      `  coldpress.yaml + state.yaml: lane=full.\n` +
      `  Back-filled sacred-doc skeletons: ${created.length ? created.join(", ") : "(all already existed)"}.\n` +
      `  Preserved (no data loss): _context/sacred/spec.md, decisions.md.\n` +
      `Next: run the \`lane-upgrade\` skill to split spec.md's content into the new docs, ` +
      `then continue on the full lane.\n`,
  );
  return 0;
}

function skeleton(doc: string): string {
  const title = doc.replace(/(^|-)([a-z])/g, (_, s, c) => (s ? " " : "") + c.toUpperCase());
  return [
    "---",
    `name: "${doc}"`,
    "status: back-filled",
    "source: _context/sacred/spec.md",
    "---",
    "",
    `# ${title}`,
    "",
    `> Back-filled from \`_context/sacred/spec.md\` by \`coldpress lane-upgrade\`. Split the`,
    `> relevant sections of spec.md into this document (the \`lane-upgrade\` skill guides this).`,
    `> spec.md is preserved as the source of record until this doc is fully populated.`,
    "",
  ].join("\n");
}
