/**
 * `coldpress trace <verb> [id]` — traceability queries + integrity gates (§4.6).
 *
 * Verbs: `orphans` (integrity + silent-divergence guard; exit 1 on a blocking
 * finding so phase-exit gates can call it), `why <id>` (upstream lineage),
 * `impact <id>` (downstream blast radius — also used by sacred-guard, WS2-E),
 * `coverage` (per-story test coverage), `release` (P8→P9 release-scope preview:
 * stories × requirements × diffstat × verification). Derived + in-memory:
 * rebuilt each call.
 */

import { buildTraceGraph } from "../trace/build.js";
import { coverage, impact, orphans, release, why } from "../trace/verbs.js";

export interface RunTraceOptions {
  projectDir?: string;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

export function runTrace(verb: string, id: string | undefined, opts: RunTraceOptions = {}): number {
  const write = opts.stdout ?? ((s: string) => process.stdout.write(s));
  const warn = opts.stderr ?? ((s: string) => process.stderr.write(s));
  const cwd = opts.projectDir ?? process.cwd();
  const g = buildTraceGraph(cwd);

  switch (verb) {
    case "orphans": {
      const findings = orphans(g);
      if (findings.length === 0) {
        write("trace orphans: none — every consumed scope is produced and every flagged delta has an ADR.\n");
        return 0;
      }
      write(`trace orphans: ${findings.length} finding(s):\n`);
      for (const f of findings) write(`  [${f.kind}] ${f.detail}\n`);
      // Blocking = dangling-consume + unresolved-adr-delta; isolated-story is informational.
      const blocking = findings.filter((f) => f.kind !== "isolated-story");
      return blocking.length > 0 ? 1 : 0;
    }

    case "why":
    case "impact": {
      if (!id) {
        warn(`trace ${verb}: needs a node id, e.g. \`coldpress trace ${verb} ST-008\`.\n`);
        return 1;
      }
      if (!g.has(id)) {
        warn(`trace ${verb}: no node "${id}" in the trace graph.\n`);
        return 1;
      }
      const steps = verb === "why" ? why(g, id) : impact(g, id);
      const dir = verb === "why" ? "upstream of" : "downstream of";
      if (steps.length === 0) {
        write(`trace ${verb}: nothing ${dir} ${id}.\n`);
        return 0;
      }
      write(`trace ${verb} — ${steps.length} node(s) ${dir} ${id}:\n`);
      for (const s of steps) write(`  ${s.type}: ${s.id}\n`);
      return 0;
    }

    case "coverage": {
      const rows = coverage(g);
      if (rows.length === 0) {
        write("trace coverage: no stories in the graph.\n");
        return 0;
      }
      const uncovered = rows.filter((r) => !r.covered);
      write(`trace coverage: ${rows.length - uncovered.length}/${rows.length} stories covered.\n`);
      for (const r of uncovered) write(`  uncovered: ${r.story}\n`);
      return 0;
    }

    case "release": {
      const scope = release(g);
      if (scope.stories.length === 0) {
        write("trace release: no stories in the graph — nothing to preview.\n");
        return 0;
      }
      const ready = scope.stories.length - scope.blockers.length;
      write(
        `trace release (preview): ${scope.stories.length} stor${scope.stories.length === 1 ? "y" : "ies"} in scope, ` +
          `${ready} verified, ${scope.blockers.length} blocking; ` +
          `${scope.requirements.length} requirement(s), ${scope.diffstat.length} file-scope path(s).\n`,
      );
      for (const s of scope.stories) {
        const mark = s.verified ? "✓" : "✗";
        const reqs = s.requirements.length ? ` → ${s.requirements.join(", ")}` : "";
        write(`  ${mark} ${s.id}${s.title ? ` (${s.title})` : ""}${reqs}\n`);
      }
      if (scope.blockers.length > 0) {
        write(`  blockers (unverified): ${scope.blockers.join(", ")}\n`);
      }
      // Preview, not a gate — the P9 readiness gate decides. Always exit 0.
      return 0;
    }

    default:
      warn(`trace: unknown verb "${verb}". Use one of: orphans, why, impact, coverage, release.\n`);
      return 1;
  }
}
