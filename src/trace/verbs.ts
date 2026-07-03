/**
 * `coldpress trace` verbs (§4.6): orphans, why, impact, coverage, release.
 * Pure functions over a built TraceGraph — the CLI + enforcement hooks call these.
 *
 * `release` is a P8→P9 handoff PREVIEW (§4.6 / plan §HND-p8-devops): it derives
 * the release scope — which stories ship, the requirements they satisfy, the
 * file-scope they touch (diffstat surface), and each story's verification state
 * (test-coverage as the verifier-verdict proxy) — straight from the story graph.
 * It needs no persistent REL-* record: the preview is what FEEDS the release
 * record, computed before it exists.
 */

import type { TraceGraph } from "./graph.js";
import type { TraceNode } from "./types.js";

export interface OrphanFinding {
  kind: "dangling-consume" | "unresolved-adr-delta" | "unresolved-delta" | "unmapped-requirement" | "isolated-story";
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

  // 2a. Unresolved deltas (resolution: null) — block phase exit (§4.3).
  for (const d of g.byType("delta")) {
    if (d.attrs?.resolution === null || d.attrs?.resolution === undefined) {
      findings.push({ kind: "unresolved-delta", id: d.id, detail: `${d.id} has no resolution (blocks phase exit)` });
    }
  }

  // 2b. Silent-divergence guard — flag_for_architecture_ADR deltas without a real ADR.
  for (const d of g.byType("delta")) {
    if (d.attrs?.resolution !== "flag_for_architecture_ADR") continue;
    const adrRef = typeof d.attrs.adr_ref === "string" ? d.attrs.adr_ref : undefined;
    if (!adrRef) {
      findings.push({ kind: "unresolved-adr-delta", id: d.id, detail: `${d.id} is flagged for an ADR but has no adr_ref` });
    } else if (!g.has(adrRef)) {
      findings.push({ kind: "unresolved-adr-delta", id: d.id, detail: `${d.id} references ADR "${adrRef}" which does not exist` });
    }
  }

  // 2c. Unmapped requirements (P6 orphan gate, §4.6) — a requirement with no
  //     implementing story. Activates once P4/P6 keying is present.
  for (const r of g.byType("requirement")) {
    if (g.out(r.id, "implements").length === 0) {
      findings.push({ kind: "unmapped-requirement", id: r.id, detail: `requirement ${r.id} has no implementing story` });
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

export interface ReleaseStory {
  id: string;
  title?: string;
  /** Requirements this story satisfies (via `implements` keying). */
  requirements: string[];
  /** File-scope globs the story owns + produces — the release's diffstat surface. */
  diffstat: string[];
  /** Verification state — has ≥1 covering test node (the verifier-verdict proxy). */
  verified: boolean;
}

export interface ReleaseScope {
  stories: ReleaseStory[];
  /** Union of all requirements the release satisfies. */
  requirements: string[];
  /** Union of every owned/produced file-scope glob the release touches. */
  diffstat: string[];
  /** Story ids in scope that are NOT verified — release-readiness blockers. */
  blockers: string[];
}

/**
 * Release-scope preview for the P8→P9 handoff. Every story in the graph is a
 * shippable unit; the preview reports what it satisfies (requirements), what it
 * touches (diffstat surface), and whether it is verified (coverage proxy). An
 * unverified story is surfaced as a blocker — the preview reports it, the P9
 * gate decides.
 */
export function release(g: TraceGraph): ReleaseScope {
  const stories: TraceNode[] = [...g.byType("story"), ...g.byType("contract-story"), ...g.byType("integration-story")];
  const requirements = new Set<string>();
  const diffstat = new Set<string>();
  const blockers: string[] = [];

  const rows: ReleaseStory[] = stories.map((s) => {
    const reqs = g.in(s.id, "implements").map((e) => e.from);
    const files = [...g.out(s.id, "owns"), ...g.out(s.id, "produces")].map((e) => e.to);
    const verified = g.in(s.id, "covers").length > 0;
    reqs.forEach((r) => requirements.add(r));
    files.forEach((f) => diffstat.add(f));
    if (!verified) blockers.push(s.id);
    return { id: s.id, title: s.label, requirements: reqs, diffstat: files, verified };
  });

  return {
    stories: rows,
    requirements: [...requirements].sort(),
    diffstat: [...diffstat].sort(),
    blockers,
  };
}
