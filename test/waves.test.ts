/**
 * `coldpress waves` — validation + wave computation + CLI emit (§4.7, WS2-C).
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { analyzeWaves, expectedDuration, globsOverlap } from "../src/waves/compute";
import { runWaves } from "../src/commands/waves";
import type { StoryGraph } from "../schemas/story-graph.schema";

const est = (o: number, m: number, p: number) => ({ o, m, p });
const story = (id: string, extra: Partial<StoryGraph["stories"][number]> = {}) =>
  ({ id, kind: "story", estimate: est(1, 1, 1), risk: "medium", owns: [], produces: [], consumes: [], ...extra }) as StoryGraph["stories"][number];

describe("helpers", () => {
  it("expectedDuration = (o + 4m + p)/6", () => {
    expect(expectedDuration(est(1, 2, 3))).toBe(2);
  });
  it("globsOverlap detects equal + prefix, not siblings", () => {
    expect(globsOverlap("src/a/*", "src/a/*")).toBe(true);
    expect(globsOverlap("src/a/*", "src/a/b/*")).toBe(true);
    expect(globsOverlap("src/a/*", "src/b/*")).toBe(false);
  });
});

describe("analyzeWaves — validation rejections (§9 acceptance)", () => {
  it("rejects a dependency cycle", () => {
    const sg: StoryGraph = {
      stories: [story("ST-1"), story("ST-2")],
      edges: [
        { from: "ST-1", to: "ST-2", type: "blocks" },
        { from: "ST-2", to: "ST-1", type: "blocks" },
      ],
    };
    const a = analyzeWaves(sg);
    expect(a.errors.some((e) => e.includes("cycle"))).toBe(true);
    expect(a.waves).toBeUndefined();
  });

  it("rejects an interface edge with no contract story", () => {
    const sg: StoryGraph = {
      stories: [story("ST-1"), story("ST-2")],
      edges: [{ from: "ST-1", to: "ST-2", type: "interface" }],
    };
    expect(analyzeWaves(sg).errors.some((e) => e.includes("no contract story"))).toBe(true);
  });

  it("accepts an interface edge when an endpoint is a contract story", () => {
    const sg: StoryGraph = {
      stories: [story("CT-1", { kind: "contract" }), story("ST-1")],
      edges: [{ from: "CT-1", to: "ST-1", type: "interface" }],
    };
    expect(analyzeWaves(sg).errors).toEqual([]);
  });

  it("rejects intra-wave ownership overlap", () => {
    const sg: StoryGraph = {
      stories: [story("ST-1", { owns: ["src/a/*"] }), story("ST-2", { owns: ["src/a/*"] })],
      edges: [],
    };
    expect(analyzeWaves(sg).errors.some((e) => e.includes("overlapping scope"))).toBe(true);
  });
});

describe("analyzeWaves — computation", () => {
  it("computes topological wave layers", () => {
    const sg: StoryGraph = {
      stories: [
        story("CT-1", { kind: "contract", owns: ["src/types/*"] }),
        story("ST-1", { owns: ["src/a/*"] }),
        story("ST-2", { owns: ["src/b/*"] }),
      ],
      edges: [
        { from: "CT-1", to: "ST-1", type: "interface" },
        { from: "ST-1", to: "ST-2", type: "blocks" },
      ],
    };
    const a = analyzeWaves(sg);
    expect(a.errors).toEqual([]);
    expect(a.waves).toEqual([["CT-1"], ["ST-1"], ["ST-2"]]);
    expect(a.criticalPath?.ids).toEqual(["CT-1", "ST-1", "ST-2"]);
    expect(a.integrationStories).toEqual(["IN-1", "IN-2", "IN-3"]);
  });

  it("qualifies a wave for team mode (>=3 disjoint, no blocks, no security-registry)", () => {
    const sg: StoryGraph = {
      stories: [story("ST-1", { owns: ["src/a/*"] }), story("ST-2", { owns: ["src/b/*"] }), story("ST-3", { owns: ["src/c/*"] })],
      edges: [],
    };
    expect(analyzeWaves(sg).teamModeWaves).toEqual([1]);
  });

  it("disqualifies team mode when a wave story is security-registry", () => {
    const sg: StoryGraph = {
      stories: [
        story("ST-1", { owns: ["src/a/*"] }),
        story("ST-2", { owns: ["src/b/*"] }),
        story("ST-3", { owns: ["src/c/*"], security_registry: true }),
      ],
      edges: [],
    };
    expect(analyzeWaves(sg).teamModeWaves).toEqual([]);
  });
});

describe("runWaves CLI", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-waves-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function writeSG(body: string): void {
    mkdirSync(join(dir, "_context/implementation"), { recursive: true });
    writeFileSync(join(dir, "_context/implementation/story-graph.yaml"), body, "utf8");
  }

  it("emits waves.yaml/schedule.yaml/mermaid on a valid graph", () => {
    writeSG(
      [
        "stories:",
        "  - id: CT-1",
        "    kind: contract",
        "    estimate: {o: 1, m: 2, p: 3}",
        "    owns: ['src/types/*']",
        "  - id: ST-1",
        "    estimate: {o: 2, m: 4, p: 6}",
        "    owns: ['src/a/*']",
        "edges:",
        "  - {from: CT-1, to: ST-1, type: interface}",
      ].join("\n"),
    );
    let out = "";
    expect(runWaves({ projectDir: dir, stdout: (s) => (out += s) })).toBe(0);
    expect(out).toContain("waves OK");
    expect(existsSync(join(dir, "docs/generated/waves.yaml"))).toBe(true);
    expect(existsSync(join(dir, "docs/generated/schedule.yaml"))).toBe(true);
    expect(readFileSync(join(dir, "docs/generated/story-graph.mmd"), "utf8")).toContain("flowchart TD");
  });

  it("exits 1 and does NOT emit on a validation error (ownership overlap)", () => {
    writeSG(
      [
        "stories:",
        "  - id: ST-1",
        "    estimate: {o: 1, m: 1, p: 1}",
        "    owns: ['src/a/*']",
        "  - id: ST-2",
        "    estimate: {o: 1, m: 1, p: 1}",
        "    owns: ['src/a/*']",
        "edges: []",
      ].join("\n"),
    );
    let err = "";
    expect(runWaves({ projectDir: dir, stderr: (s) => (err += s) })).toBe(1);
    expect(err).toContain("overlapping scope");
    expect(existsSync(join(dir, "docs/generated/waves.yaml"))).toBe(false);
  });

  it("exits 1 when no story graph exists", () => {
    expect(runWaves({ projectDir: dir, stderr: () => {} })).toBe(1);
  });
});
