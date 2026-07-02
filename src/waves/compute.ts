/**
 * `coldpress waves` — the wave algorithm (action plan §4.7 / G1).
 *
 * Validates a story graph and derives the wave plan. Waves + critical path are
 * COMPUTED, never authored:
 *   - Validate: acyclic over dependency edges; a contract story on every
 *     `interface` edge; intra-wave ownership disjointness.
 *   - Compute: topological wave layers; critical path via (o+4m+p)/6; per-wave
 *     team-mode qualification; auto-generated IN-<wave> integration stories.
 *
 * `informs` edges are soft (non-sequencing); `blocks` + `interface` are the
 * dependency edges.
 */

import type { Estimate, Story, StoryGraph } from "../../schemas/story-graph.schema.js";

/** PERT expected duration. */
export function expectedDuration(e: Estimate): number {
  return (e.o + 4 * e.m + e.p) / 6;
}

/** Dependency edges (sequencing) — blocks + interface; informs excluded. */
function depEdges(sg: StoryGraph): { from: string; to: string }[] {
  return sg.edges.filter((e) => e.type === "blocks" || e.type === "interface");
}

/** Two ownership globs overlap if one's directory prefix contains the other. */
export function globsOverlap(a: string, b: string): boolean {
  const norm = (g: string) => g.replace(/\*+$/, "").replace(/\/+$/, "/");
  const x = norm(a);
  const y = norm(b);
  return x === y || x.startsWith(y) || y.startsWith(x);
}

export interface WavesAnalysis {
  errors: string[];
  /** Wave layers (index 0 = wave 1); undefined when a cycle blocks computation. */
  waves?: string[][];
  criticalPath?: { ids: string[]; duration: number };
  /** 1-based wave numbers that qualify for team mode. */
  teamModeWaves?: number[];
  /** Auto-generated integration story ids, one per wave (IN-<n>). */
  integrationStories?: string[];
}

/** Detect a cycle over the dependency edges; returns the offending ids if any. */
function findCycle(ids: string[], edges: { from: string; to: string }[]): string[] | null {
  const adj = new Map<string, string[]>();
  for (const id of ids) adj.set(id, []);
  for (const e of edges) adj.get(e.from)?.push(e.to);
  const state = new Map<string, 0 | 1 | 2>(); // 0 unvisited, 1 in-stack, 2 done
  const stack: string[] = [];
  let cycle: string[] | null = null;
  const dfs = (u: string): boolean => {
    state.set(u, 1);
    stack.push(u);
    for (const v of adj.get(u) ?? []) {
      if (state.get(v) === 1) {
        cycle = stack.slice(stack.indexOf(v)).concat(v);
        return true;
      }
      if (!state.get(v) && dfs(v)) return true;
    }
    stack.pop();
    state.set(u, 2);
    return false;
  };
  for (const id of ids) if (!state.get(id) && dfs(id)) break;
  return cycle;
}

/** Topological wave layers (Kahn) over dependency edges. Assumes acyclic. */
function computeLayers(ids: string[], edges: { from: string; to: string }[]): string[][] {
  const indeg = new Map<string, number>(ids.map((i) => [i, 0]));
  const adj = new Map<string, string[]>(ids.map((i) => [i, []]));
  for (const e of edges) {
    adj.get(e.from)?.push(e.to);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  }
  const layers: string[][] = [];
  let frontier = ids.filter((i) => (indeg.get(i) ?? 0) === 0);
  const placed = new Set<string>();
  while (frontier.length) {
    layers.push([...frontier].sort());
    for (const u of frontier) placed.add(u);
    const next: string[] = [];
    for (const u of frontier) {
      for (const v of adj.get(u) ?? []) {
        indeg.set(v, (indeg.get(v) ?? 0) - 1);
        if ((indeg.get(v) ?? 0) === 0 && !placed.has(v)) next.push(v);
      }
    }
    frontier = [...new Set(next)];
  }
  return layers;
}

/** Longest path (critical path) by summed expected duration over the DAG. */
function criticalPath(
  ids: string[],
  edges: { from: string; to: string }[],
  dur: Map<string, number>,
): { ids: string[]; duration: number } {
  const order = computeLayers(ids, edges).flat();
  const best = new Map<string, number>();
  const prev = new Map<string, string | null>();
  for (const id of order) {
    best.set(id, dur.get(id) ?? 0);
    prev.set(id, null);
  }
  const adjIn = new Map<string, string[]>(ids.map((i) => [i, []]));
  for (const e of edges) adjIn.get(e.to)?.push(e.from);
  for (const id of order) {
    for (const p of adjIn.get(id) ?? []) {
      const cand = (best.get(p) ?? 0) + (dur.get(id) ?? 0);
      if (cand > (best.get(id) ?? 0)) {
        best.set(id, cand);
        prev.set(id, p);
      }
    }
  }
  let end = order[0] ?? "";
  for (const id of order) if ((best.get(id) ?? 0) > (best.get(end) ?? 0)) end = id;
  const path: string[] = [];
  for (let cur: string | null = end; cur; cur = prev.get(cur) ?? null) path.unshift(cur);
  return { ids: path, duration: end ? (best.get(end) ?? 0) : 0 };
}

/** Validate + compute. Cycles + missing-contract block; ownership overlap is per-wave. */
export function analyzeWaves(sg: StoryGraph): WavesAnalysis {
  const errors: string[] = [];
  const byId = new Map<string, Story>(sg.stories.map((s) => [s.id, s]));
  const ids = sg.stories.map((s) => s.id);
  const edges = depEdges(sg);

  // 1. Contract story on every interface edge (at least one endpoint is a contract).
  for (const e of sg.edges) {
    if (e.type !== "interface") continue;
    const fromC = byId.get(e.from)?.kind === "contract";
    const toC = byId.get(e.to)?.kind === "contract";
    if (!fromC && !toC) {
      errors.push(`interface edge ${e.from}→${e.to} has no contract story (CT-*) — extract one`);
    }
  }

  // 2. Cycle over dependency edges.
  const cycle = findCycle(ids, edges);
  if (cycle) {
    errors.push(`dependency cycle: ${cycle.join(" → ")}`);
    return { errors }; // cannot compute waves on a cyclic graph
  }

  // 3. Compute waves.
  const waves = computeLayers(ids, edges);

  // 4. Intra-wave ownership disjointness.
  for (let w = 0; w < waves.length; w++) {
    const wave = waves[w] ?? [];
    for (let i = 0; i < wave.length; i++) {
      for (let j = i + 1; j < wave.length; j++) {
        const a = byId.get(wave[i]!)!;
        const b = byId.get(wave[j]!)!;
        for (const ga of a.owns) {
          for (const gb of b.owns) {
            if (globsOverlap(ga, gb)) {
              errors.push(`wave ${w + 1}: ${a.id} and ${b.id} both own overlapping scope (${ga} / ${gb})`);
            }
          }
        }
      }
    }
  }

  // 5. Critical path.
  const dur = new Map<string, number>(sg.stories.map((s) => [s.id, expectedDuration(s.estimate)]));
  const cp = criticalPath(ids, edges, dur);

  // 6. Team-mode per wave: >=3 stories, ownership-disjoint (no error above), no
  //    intra-wave blocks, none security-registry.
  const blockPairs = new Set(sg.edges.filter((e) => e.type === "blocks").map((e) => `${e.from}|${e.to}`));
  const teamModeWaves: number[] = [];
  for (let w = 0; w < waves.length; w++) {
    const wave = waves[w] ?? [];
    if (wave.length < 3) continue;
    const anySecReg = wave.some((id) => byId.get(id)?.security_registry);
    const intraBlock = wave.some((a) => wave.some((b) => blockPairs.has(`${a}|${b}`)));
    const overlap = errors.some((e) => e.startsWith(`wave ${w + 1}:`));
    if (!anySecReg && !intraBlock && !overlap) teamModeWaves.push(w + 1);
  }

  const integrationStories = waves.map((_, w) => `IN-${w + 1}`);

  return { errors, waves, criticalPath: cp, teamModeWaves, integrationStories };
}
