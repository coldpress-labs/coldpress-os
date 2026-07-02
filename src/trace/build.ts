/**
 * Build the trace graph from a project's schema'd artifacts (§4.6).
 *
 * WS2 sources: `story-graph.yaml` (stories, file-scopes, typed edges), ADRs
 * (`_context/planning/adrs/adr-*.md`), and delta records (`_context/deltas/
 * DLT-*.yaml`). Requirement/component/threat/release/test nodes arrive as the
 * P4/P6/P7/P9 artifacts gain their keying (WS4+) — the model already has the
 * node/edge kinds; the build here extends without a rewrite. Malformed
 * artifacts are skipped (best-effort), not fatal.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { DeltaRecordSchema } from "../../schemas/delta.schema.js";
import { OutcomesSchema } from "../../schemas/planning-artefacts/outcomes.schema.js";
import { StoryGraphSchema } from "../../schemas/story-graph.schema.js";
import { TraceGraph } from "./graph.js";

function safeReadYaml(path: string): unknown {
  try {
    return parseYaml(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
}

function listFiles(dir: string, filter: (f: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir).filter(filter).map((f) => join(dir, f));
  } catch {
    return [];
  }
}

export function buildTraceGraph(projectDir: string): TraceGraph {
  const g = new TraceGraph();

  // 1. Story graph — stories, file-scopes, typed story→story edges.
  const sgPath = join(projectDir, "_context/implementation/story-graph.yaml");
  if (existsSync(sgPath)) {
    const parsed = StoryGraphSchema.safeParse(safeReadYaml(sgPath));
    if (parsed.success) {
      const sg = parsed.data;
      for (const s of sg.stories) {
        const type =
          s.kind === "contract" ? "contract-story" : s.kind === "integration" ? "integration-story" : "story";
        g.addNode({ id: s.id, type, label: s.title, source: "story-graph.yaml" });
        for (const glob of s.owns) {
          g.addNode({ id: glob, type: "file-scope", path: glob, source: "owns" });
          g.addEdge(s.id, glob, "owns");
        }
        for (const glob of s.produces) {
          g.addNode({ id: glob, type: "file-scope", path: glob, source: "produces" });
          g.addEdge(s.id, glob, "produces");
        }
        for (const glob of s.consumes) {
          g.addNode({ id: glob, type: "file-scope", path: glob, source: "consumes" });
          g.addEdge(s.id, glob, "consumes");
        }
        // P4/P6 keying (WS4-E): the story implements requirement/component ids.
        // Edge points requirement/component → story so `impact(R1)` reaches it.
        for (const ref of s.implements ?? []) {
          g.addNode({ id: ref, type: ref.startsWith("C") ? "component" : "requirement", source: "implements" });
          g.addEdge(ref, s.id, "implements");
        }
      }
      for (const e of sg.edges) g.addEdge(e.from, e.to, e.type);
    }
  }

  // 2. ADRs.
  for (const adrPath of listFiles(join(projectDir, "_context/planning/adrs"), (f) => /^adr-.*\.md$/.test(f))) {
    const id = basename(adrPath, ".md");
    g.addNode({ id, type: "adr", path: adrPath, source: "adr" });
  }

  // 3. Delta records — and the flag_for_architecture_ADR → adr `resolves` edge.
  for (const dPath of listFiles(join(projectDir, "_context/deltas"), (f) => /^DLT-.*\.ya?ml$/.test(f))) {
    const parsed = DeltaRecordSchema.safeParse(safeReadYaml(dPath));
    if (!parsed.success) continue;
    const d = parsed.data;
    g.addNode({
      id: d.id,
      type: "delta",
      label: d.description,
      source: "delta",
      attrs: { resolution: d.resolution, adr_ref: d.adr_ref },
    });
    if (d.resolution === "flag_for_architecture_ADR" && d.adr_ref) {
      g.addEdge(d.id, d.adr_ref, "resolves");
    }
  }

  // 4. Requirements from outcomes.yaml (P4 keying) — each requirement_id is a
  //    requirement node. One with no implementing story is a P6 orphan.
  const outcomesPath = join(projectDir, "_context/planning/outcomes.yaml");
  if (existsSync(outcomesPath)) {
    const parsed = OutcomesSchema.safeParse(safeReadYaml(outcomesPath));
    if (parsed.success) {
      for (const o of parsed.data.outcomes) {
        g.addNode({ id: o.requirement_id, type: "requirement", source: "outcomes" });
      }
    }
  }

  return g;
}
