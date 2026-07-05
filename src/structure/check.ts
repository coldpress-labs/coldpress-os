/**
 * Structure checker (WS11 §S7.7) — converts the structure-hygiene audit's
 * findings into a standing CI guard, the same way the wiring manifest did for
 * producer/consumer seams. Four invariants:
 *
 *   1. Every `files:`-shipped path in package.json exists on disk (a dir removed
 *      from disk but left in `files:` ships an empty/absent entry — this is how
 *      the stale `agents/` dir lingered).
 *   2. Every data file under `data/` is read by something (an orphaned data file
 *      is the class that masked skill-orphan detection, e.g. skill-catalog.csv).
 *   3. Every `skills/` skill has ≥1 inbound route OR an explicit `on-demand: true`
 *      frontmatter marker (silently-unrouted skills are dead weight in the plugin).
 *   4. No framework-internal state (the overhaul workspace) leaks into the npm
 *      package or a scaffold (guards the WS11 S2 fix against regression).
 *
 * Returns doctor-shaped CheckResult[] so it plugs into `coldpress doctor
 * --structure`.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { consumerDocs, frameworkDirs, packageRoot } from "../utils/paths.js";
import type { CheckResult } from "../utils/doctor-checks.js";

function walk(dir: string, match: (name: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  let out: string[] = [];
  for (const e of readdirSync(dir)) {
    if (e === "node_modules") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p, match));
    else if (match(e)) out.push(p);
  }
  return out;
}

/** Concatenate every text file under the given trees into one searchable corpus. */
function readCorpus(trees: string[], exts: RegExp): string {
  const parts: string[] = [];
  for (const t of trees) {
    for (const f of walk(join(packageRoot, t), (n) => exts.test(n))) {
      parts.push(readFileSync(f, "utf8"));
    }
  }
  return parts.join("\n");
}

function frontmatter(md: string): Record<string, unknown> | null {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return null;
  const fm: Record<string, unknown> = {};
  for (const line of m[1]!.split("\n")) {
    const kv = /^([a-z][a-z0-9_-]*):\s*(.+)$/i.exec(line.trim());
    if (kv) {
      const val = kv[2]!.replace(/\s+#.*$/, "").trim().replace(/^["']|["']$/g, ""); // strip inline comment + quotes
      fm[kv[1]!] = val;
    }
  }
  return fm;
}

export function checkStructure(): CheckResult[] {
  const results: CheckResult[] = [];

  // ── 1. Every files:-shipped path exists ──────────────────────────────────
  const pkg = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as { files: string[] };
  const missing = pkg.files
    .filter((f) => !f.startsWith("!"))
    .filter((f) => !existsSync(join(packageRoot, f)));
  if (missing.length) {
    results.push({
      id: "structure:files-exist",
      label: "package.json files: — every shipped path exists",
      severity: "error",
      detail: `missing on disk: ${missing.join(", ")}`,
      remedy: "Remove the stale entry from package.json files:, or restore the path.",
    });
  } else {
    results.push({ id: "structure:files-exist", label: `package.json files: — all ${pkg.files.filter((f) => !f.startsWith("!")).length} shipped paths exist`, severity: "ok" });
  }

  // ── 2. Every data file is read by something ──────────────────────────────
  const consumers = readCorpus(["src", "skills", "lifecycle", "schemas", "authoring", "governance"], /\.(ts|md|yaml|yml|json)$/);
  const dataFiles = walk(join(packageRoot, "data"), (n) => /\.(csv|ya?ml|json|md)$/.test(n));
  const orphanData = dataFiles.filter((f) => {
    const rel = relative(packageRoot, f);
    const base = f.slice(f.lastIndexOf("/") + 1);
    const stem = base.replace(/\.[^.]+$/, "");
    const dir = rel.slice(0, rel.lastIndexOf("/")); // e.g. "data/ci-cd"
    const dirBase = dir.slice(dir.lastIndexOf("/") + 1); // e.g. "ci-cd"
    // A data file is "read" if its basename/stem is named, OR its containing dir
    // is referenced (many skills load a whole `data/<x>/` directory).
    return (
      !consumers.includes(base) &&
      !consumers.includes(stem) &&
      !consumers.includes(dir) &&
      !consumers.includes(`${dirBase}/`)
    );
  });
  if (orphanData.length) {
    results.push({
      id: "structure:data-readers",
      label: "every data/ file has a reader",
      severity: "warning",
      detail: `no reader found: ${orphanData.map((f) => relative(packageRoot, f)).join(", ")}`,
      remedy: "Wire a reader (skill/code/generator), or delete the orphaned data file.",
    });
  } else {
    results.push({ id: "structure:data-readers", label: `every data/ file has a reader (${dataFiles.length} files)`, severity: "ok" });
  }

  // ── 3. Every skills/ skill is routed or explicitly on-demand ─────────────
  // Routing corpus: all SKILL.md bodies + lifecycle READMEs/gates + data (routing tables).
  const routingCorpus = readCorpus(["lifecycle", "data", "authoring"], /\.(md|json|yaml|yml|csv)$/) +
    readCorpus(["skills"], /\.md$/);
  const skillFiles = walk(join(packageRoot, "skills"), (n) => n === "SKILL.md");
  const unrouted: string[] = [];
  for (const f of skillFiles) {
    const rel = relative(packageRoot, f);
    // Stack-pack / capability-pack skills are pack-routed (pack.yaml wires them
    // by path; they run when their pack is the selected/active pack).
    if (rel.includes("stack-packs/") || rel.includes("capability-packs/")) continue;
    const fm = frontmatter(readFileSync(f, "utf8"));
    const name = (fm?.name as string) ?? f.split("/").slice(-2)[0]!;
    if (fm?.["on-demand"] === "true" || fm?.["on-demand"] === true) continue;
    // Referenced by name anywhere outside its own file → routed.
    const selfDir = f.slice(0, f.lastIndexOf("/"));
    const refs = routingCorpus.split(name).length - 1;
    // The skill's own SKILL.md contributes ≥1 mention (its frontmatter name); a
    // route means the name appears somewhere too — use a >1 threshold, then
    // confirm the extra mention isn't just the skill's own step/workflow files.
    if (refs <= 1) {
      // Double-check: is it referenced outside its own directory?
      const outsideRefs = readCorpus(["lifecycle", "data", "authoring"], /\.(md|json|yaml|yml|csv)$/).includes(name);
      if (!outsideRefs) unrouted.push(relative(packageRoot, selfDir) + ` (${name})`);
    }
  }
  if (unrouted.length) {
    results.push({
      id: "structure:skill-routing",
      label: "every skills/ skill has an inbound route or on-demand: true",
      severity: "warning",
      detail: `unrouted (add a route or 'on-demand: true'): ${unrouted.join("; ")}`,
      remedy: "Route the skill from a lifecycle/routing surface, or mark it `on-demand: true` in frontmatter.",
    });
  } else {
    results.push({ id: "structure:skill-routing", label: `every skills/ skill is routed or on-demand (${skillFiles.length} skills)`, severity: "ok" });
  }

  // ── 4. No framework-internal state leaks into package/scaffold ───────────
  const DENYLIST = ["docs/overhaul"];
  const filesArr = pkg.files;
  const leaks: string[] = [];
  for (const deny of DENYLIST) {
    // Shipped if a files: entry covers it and no negation excludes it.
    const covered = filesArr.some((f) => !f.startsWith("!") && deny.startsWith(f));
    const excluded = filesArr.includes(`!${deny}`);
    if (covered && !excluded) leaks.push(`${deny} (npm tarball)`);
    // Scaffolded if a frameworkDir or consumerDoc covers it.
    if ((frameworkDirs as readonly string[]).some((d) => deny.startsWith(d)) &&
        !(deny === "docs/overhaul")) leaks.push(`${deny} (scaffold)`);
  }
  // consumerDocs must not name an internal doc; frameworkDirs must not include docs wholesale.
  if ((frameworkDirs as readonly string[]).includes("docs")) {
    leaks.push("docs/ copied wholesale (should be the consumerDocs subset)");
  }
  if ((consumerDocs as readonly string[]).some((d) => d.includes("overhaul"))) {
    leaks.push("consumerDocs names an overhaul doc");
  }
  if (leaks.length) {
    results.push({
      id: "structure:no-internal-leak",
      label: "framework-internal state stays out of the package + scaffold",
      severity: "error",
      detail: leaks.join("; "),
      remedy: "Exclude the internal path from package.json files: (!path) and the init framework-copy.",
    });
  } else {
    results.push({ id: "structure:no-internal-leak", label: "no framework-internal state leaks into package/scaffold", severity: "ok" });
  }

  return results;
}
