import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promptSupersede } from "../src/governance/supersede";

const BASE_OPTS = {
  inputPath: "_input/reference/old-brief.md",
  sacredDocPath: "_context/sacred/context.md",
  conflictingContent: "Old brief states target is enterprise.",
  newContent: "Discovery confirms target is SMBs.",
  decisionContext: "intake Step 8 (vision) — vision question revealed pivot",
};

describe("promptSupersede", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-supersede-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  async function readGraph(): Promise<unknown> {
    const p = join(tmp, ".coldpress", "graph", "graph.json");
    return JSON.parse(await readFile(p, "utf8"));
  }

  async function auditFileContent(date: string): Promise<string> {
    const p = join(tmp, "_context", "audit", `supersessions-${date}.md`);
    return readFile(p, "utf8");
  }

  it("returns confirmed:false and no writes when confirmed is false", async () => {
    const result = await promptSupersede({
      projectRoot: tmp,
      ...BASE_OPTS,
      confirmed: false,
    });

    expect(result.confirmed).toBe(false);
    expect(result.edge_written).toBe(false);
    expect(result.already_existed).toBe(false);
    expect(result.log_entry_id).toBeUndefined();
  });

  it("writes graph edge and audit log when confirmed is true (no pre-existing graph)", async () => {
    const result = await promptSupersede({
      projectRoot: tmp,
      ...BASE_OPTS,
      confirmed: true,
      rationale: "User confirmed pivot after interview",
    });

    expect(result.confirmed).toBe(true);
    expect(result.edge_written).toBe(true);
    expect(result.already_existed).toBe(false);
    expect(typeof result.log_entry_id).toBe("string");
    expect(result.log_entry_id!.startsWith("sup-")).toBe(true);

    const graph = await readGraph() as { links: Array<{ source: string; target: string; relation: string; confidence: string }> };
    expect(graph.links).toHaveLength(1);
    expect(graph.links[0]).toMatchObject({
      source: "_input/reference/old-brief.md",
      target: "_context/sacred/context.md",
      relation: "superseded_by",
      confidence: "MANUAL",
    });
  });

  it("appends an audit log row with the correct columns", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await promptSupersede({
      projectRoot: tmp,
      ...BASE_OPTS,
      confirmed: true,
      rationale: "SMB pivot confirmed",
    });

    const content = await auditFileContent(today);
    expect(content).toMatch(/Supersessions Log/);
    expect(content).toMatch(/_input\/reference\/old-brief\.md/);
    expect(content).toMatch(/_context\/sacred\/context\.md/);
    expect(content).toMatch(/SMB pivot confirmed/);
  });

  it("is idempotent — returns already_existed:true when edge already in graph", async () => {
    // First call writes the edge
    await promptSupersede({ projectRoot: tmp, ...BASE_OPTS, confirmed: true });

    // Second call with same source/target should be a no-op
    const result = await promptSupersede({
      projectRoot: tmp,
      ...BASE_OPTS,
      confirmed: true,
    });

    expect(result.already_existed).toBe(true);
    expect(result.edge_written).toBe(false);

    // Graph still has only one edge
    const graph = await readGraph() as { links: unknown[] };
    expect(graph.links).toHaveLength(1);
  });

  it("is idempotent even when confirmed:false — reports already_existed without writing", async () => {
    await promptSupersede({ projectRoot: tmp, ...BASE_OPTS, confirmed: true });
    const result = await promptSupersede({
      projectRoot: tmp,
      ...BASE_OPTS,
      confirmed: false,
    });

    expect(result.already_existed).toBe(true);
    expect(result.edge_written).toBe(false);
  });

  it("appends to existing graph.json rather than replacing it", async () => {
    const graphDir = join(tmp, ".coldpress", "graph");
    await mkdir(graphDir, { recursive: true });
    const existingGraph = {
      directed: true,
      multigraph: false,
      graph: {},
      nodes: [{ id: "existing-node", label: "existing" }],
      links: [{ source: "a", target: "b", relation: "references" }],
    };
    await writeFile(join(graphDir, "graph.json"), JSON.stringify(existingGraph), "utf8");

    await promptSupersede({ projectRoot: tmp, ...BASE_OPTS, confirmed: true });

    const graph = await readGraph() as { links: unknown[]; nodes: unknown[] };
    expect(graph.links).toHaveLength(2);
    expect(graph.nodes).toHaveLength(1);
  });

  it("appends multiple rows across the same day (does not overwrite)", async () => {
    const today = new Date().toISOString().slice(0, 10);

    await promptSupersede({
      projectRoot: tmp,
      ...BASE_OPTS,
      confirmed: true,
      rationale: "First supersession",
    });

    await promptSupersede({
      projectRoot: tmp,
      inputPath: "_input/reference/vendor-spec.md",
      sacredDocPath: "_context/sacred/context.md",
      conflictingContent: "Old vendor spec",
      newContent: "New finding",
      decisionContext: "Step 3 conflict",
      confirmed: true,
      rationale: "Second supersession",
    });

    const content = await auditFileContent(today);
    expect(content).toMatch(/First supersession/);
    expect(content).toMatch(/Second supersession/);
  });

  it("uses decisionContext as rationale when rationale is omitted", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await promptSupersede({ projectRoot: tmp, ...BASE_OPTS, confirmed: true });
    const content = await auditFileContent(today);
    expect(content).toMatch(/intake Step 8/);
  });
});
