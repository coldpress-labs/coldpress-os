/**
 * `coldpress trace` — build + verbs + CLI (§4.6, WS2-B).
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildTraceGraph } from "../src/trace/build";
import { coverage, impact, orphans, why } from "../src/trace/verbs";
import { runTrace } from "../src/commands/trace";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-trace-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function write(rel: string, body: string): void {
  const full = join(dir, rel);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, body, "utf8");
}

function seedProject(): void {
  write(
    "_context/implementation/story-graph.yaml",
    [
      "stories:",
      "  - id: CT-1",
      "    kind: contract",
      "    estimate: {o: 1, m: 2, p: 3}",
      "    produces: ['src/types/*']",
      "  - id: ST-1",
      "    estimate: {o: 2, m: 4, p: 6}",
      "    owns: ['src/a/*']",
      "    consumes: ['src/types/*']",
      "  - id: ST-2",
      "    estimate: {o: 1, m: 1, p: 2}",
      "    owns: ['src/b/*']",
      "    consumes: ['src/missing/*']",
      "edges:",
      "  - {from: CT-1, to: ST-1, type: interface}",
    ].join("\n"),
  );
  write("_context/planning/adrs/adr-auth-v1.md", "# ADR: auth\n");
  // Resolved flagged delta (adr exists) — NOT an orphan.
  write("_context/deltas/DLT-6-1.yaml", "id: DLT-6-1\norigin_phase: 6\ndescription: auth approach\nimpact: architecture\nresolution: flag_for_architecture_ADR\nresolved_by: a\nadr_ref: adr-auth-v1\n");
  // Flagged delta with no adr_ref — orphan (silent divergence).
  write("_context/deltas/DLT-6-2.yaml", "id: DLT-6-2\norigin_phase: 6\ndescription: rate limiting\nimpact: architecture\nresolution: flag_for_architecture_ADR\nresolved_by: a\n");
}

describe("buildTraceGraph", () => {
  it("builds stories, file-scopes, edges, deltas, adrs", () => {
    seedProject();
    const g = buildTraceGraph(dir);
    expect(g.node("CT-1")?.type).toBe("contract-story");
    expect(g.node("ST-1")?.type).toBe("story");
    expect(g.node("src/types/*")?.type).toBe("file-scope");
    expect(g.node("adr-auth-v1")?.type).toBe("adr");
    expect(g.node("DLT-6-1")?.type).toBe("delta");
  });
});

describe("orphans", () => {
  it("flags a dangling consume, an unresolved-ADR delta, and isolated stories", () => {
    seedProject();
    const f = orphans(buildTraceGraph(dir));
    const kinds = f.map((x) => x.kind);
    expect(f.find((x) => x.kind === "dangling-consume")?.id).toBe("src/missing/*");
    expect(f.find((x) => x.kind === "unresolved-adr-delta")?.id).toBe("DLT-6-2");
    expect(kinds).toContain("isolated-story"); // ST-2 has no dependency edges
    // DLT-6-1 (adr exists) is NOT reported.
    expect(f.some((x) => x.id === "DLT-6-1")).toBe(false);
  });

  it("flags an unresolved delta (resolution: null) — blocks phase exit", () => {
    write("_context/deltas/DLT-8-1.yaml", "id: DLT-8-1\norigin_phase: 8\ndescription: open question\nimpact: impl\nresolution: null\n");
    const f = orphans(buildTraceGraph(dir));
    expect(f.find((x) => x.kind === "unresolved-delta")?.id).toBe("DLT-8-1");
  });
});

describe("impact + why", () => {
  it("impact(CT-1) reaches ST-1 and the file scopes downstream", () => {
    seedProject();
    const g = buildTraceGraph(dir);
    const ids = impact(g, "CT-1").map((s) => s.id);
    expect(ids).toContain("ST-1");
    expect(ids).toContain("src/a/*");
  });
  it("why(src/a/*) reaches ST-1 then CT-1 upstream", () => {
    seedProject();
    const g = buildTraceGraph(dir);
    const ids = why(g, "src/a/*").map((s) => s.id);
    expect(ids).toContain("ST-1");
    expect(ids).toContain("CT-1");
  });
});

describe("coverage", () => {
  it("reports stories uncovered when no test stubs exist yet", () => {
    seedProject();
    const rows = coverage(buildTraceGraph(dir));
    expect(rows.length).toBe(3);
    expect(rows.every((r) => !r.covered)).toBe(true);
  });
});

describe("runTrace CLI", () => {
  it("orphans exits 1 on a blocking finding, 0 when clean", () => {
    seedProject();
    let out = "";
    expect(runTrace("orphans", undefined, { projectDir: dir, stdout: (s) => (out += s) })).toBe(1);
    expect(out).toContain("dangling-consume");

    // Clean project (satisfied graph, connected stories, no flagged deltas) → exit 0, "none".
    rmSync(join(dir, "_context/deltas"), { recursive: true, force: true });
    write(
      "_context/implementation/story-graph.yaml",
      [
        "stories:",
        "  - id: ST-1",
        "    estimate: {o: 1, m: 1, p: 1}",
        "    owns: ['src/a/*']",
        "  - id: ST-2",
        "    estimate: {o: 1, m: 1, p: 1}",
        "    owns: ['src/b/*']",
        "edges:",
        "  - {from: ST-1, to: ST-2, type: blocks}",
      ].join("\n"),
    );
    let out2 = "";
    expect(runTrace("orphans", undefined, { projectDir: dir, stdout: (s) => (out2 += s) })).toBe(0);
    expect(out2).toContain("none");
  });

  it("impact needs an id and reports unknown nodes", () => {
    seedProject();
    let err = "";
    expect(runTrace("impact", undefined, { projectDir: dir, stderr: (s) => (err += s) })).toBe(1);
    expect(runTrace("impact", "NOPE", { projectDir: dir, stderr: (s) => (err += s) })).toBe(1);
  });

  it("rejects an unknown verb", () => {
    expect(runTrace("frobnicate", undefined, { projectDir: dir, stderr: () => {} })).toBe(1);
  });
});
