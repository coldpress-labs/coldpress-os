/**
 * `coldpress trace` verbs (§4.6): orphans, why, impact, coverage.
 * Pure functions over a built TraceGraph — the CLI + enforcement hooks call these.
 *
 * (`release` waits for the REL-* schema in WS6; requirement/component orphan
 * checks activate once P4/P6 keying lands in WS4 — the model already supports
 * those node kinds.)
 */

import type { TraceGraph } from "./graph.js";
import type { TraceNode } from "./types.js";

export interface OrphanFinding {
  kind: "dangling-consume" | "unresolved-adr-delta" | "isolated-story";
  id: string;
  detail: string;
}

/**
 * Orphan / integrity findings. The two enforcement-grade checks available in
 * WS2: broken story dependencies, and the silent-divergence guard (every
 * `flag_for_architecture_ADR` delta must resolve to an existing ADR).
 */
export function orphans(g: TraceGraph): OrphanFinding[] {
  const findings: OrphanFinding[] = [];

  // 1. Dangling consumes — a file-scope consumed by a story but produced/owned by none.
  for (const fs of g.byType("file-scope")) {
    const consumedBy = g.in(fs.id, "consumes");
    if (consumedBy.length === 0) continue;
    const producedBy = [...g.in(fs.id, "owns"), ...g.in(fs.id, "produces")];
    if (producedBy.length === 0) {
      findings.push({
        kind: "dangling-consume",
        id: fs.id,
        detail: `${consumedBy.map((e) => e.from).join(", ")} consume "${fs.id}" but no story owns/produces it`,
      });
    }
  }

  // 2. Silent-divergence guard — flag_for_architecture_ADR deltas without a real ADR.
  for (const d of g.byType("delta")) {
    if (d.attrs?.resolution !== "flag_for_architecture_ADR") continue;
    const adrRef = typeof d.attrs.adr_ref === "string" ? d.attrs.adr_ref : undefined;
    if (!adrRef) {
      findings.push({ kind: "unresolved-adr-delta", id: d.id, detail: `${d.id} is flagged for an ADR but has no adr_ref` });
    } else if (!g.has(adrRef)) {
      findings.push({ kind: "unresolved-adr-delta", id: d.id, detail: `${d.id} references ADR "${adrRef}" which does not exist` });
    }
  }

  // 3. Isolated stories — informational (no dependency in or out).
  for (const s of [...g.byType("story"), ...g.byType("contract-story"), ...g.byType("integration-story")]) {
    const wired =
      g.out(s.id, "blocks").length +
      g.out(s.id, "interface").length +
      g.out(s.id, "informs").length +
      g.in(s.id, "blocks").length +
      g.in(s.id, "interface").length +
      g.in(s.id, "informs").length;
    if (wired === 0) {
      findings.push({ kind: "isolated-story", id: s.id, detail: `${s.id} has no dependency edges (verify this is intentional)` });
    }
  }

  return findings;
}

export interface LineageStep {
  id: string;
  type: string;
}

/** Upstream lineage — why does this node exist (what it descends from). */
export function why(g: TraceGraph, id: string): LineageStep[] {
  if (!g.has(id)) return [];
  return g.ancestors(id).map((a) => ({ id: a, type: g.node(a)?.type ?? "unknown" }));
}

/** Downstream blast radius — what a change to this node impacts. */
export function impact(g: TraceGraph, id: string): LineageStep[] {
  if (!g.has(id)) return [];
  return g.descendants(id).map((d) => ({ id: d, type: g.node(d)?.type ?? "unknown" }));
}

export interface CoverageRow {
  story: string;
  tests: string[];
  covered: boolean;
}

/** Test coverage per story (test nodes arrive with WS4 acceptance stubs). */
export function coverage(g: TraceGraph): CoverageRow[] {
  const stories: TraceNode[] = [...g.byType("story"), ...g.byType("contract-story"), ...g.byType("integration-story")];
  return stories.map((s) => {
    const tests = g.in(s.id, "covers").map((e) => e.from);
    return { story: s.id, tests, covered: tests.length > 0 };
  });
}
