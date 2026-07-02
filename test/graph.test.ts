import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_GRAPH_PATH,
  Graph,
  GraphNotFoundError,
  GraphSchemaError,
  loadGraph,
} from "../src/graph/index";
import { GraphJsonSchema, NodeSchema } from "../src/graph/types";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
// Real graph.json sample (144 nodes, 330 links), relocated to test fixtures
// in v0.4 WS0 when the vendored Graphify tree was removed (§8 item 1, ledger
// delta D5). This is the indexer's OUTPUT data, not the Graphify runtime; it
// exercises the retained src/graph/* modules that WS2 cannibalizes for `trace`.
const httpxFixture = join(
  repoRoot,
  "test",
  "fixtures",
  "graph",
  "httpx",
);

describe("GraphJsonSchema (Zod)", () => {
  it("validates a minimal well-formed graph", () => {
    const minimal = {
      directed: false,
      multigraph: false,
      graph: { schema_version: 1 },
      nodes: [{ id: "a", label: "A" }],
      links: [],
    };
    expect(GraphJsonSchema.safeParse(minimal).success).toBe(true);
  });

  it("accepts additive fields via passthrough", () => {
    const minimal = {
      directed: false,
      multigraph: false,
      graph: { custom_field: "from future" },
      nodes: [
        { id: "a", label: "A", future_field: "ok" },
      ],
      links: [],
    };
    expect(GraphJsonSchema.safeParse(minimal).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(GraphJsonSchema.safeParse({}).success).toBe(false);
    expect(
      GraphJsonSchema.safeParse({
        directed: false,
        multigraph: false,
        graph: {},
        nodes: [{ label: "no id" }],
        links: [],
      }).success,
    ).toBe(false);
  });

  it("accepts optional coldpress extension on a node", () => {
    const node = {
      id: "prd",
      label: "PRD",
      coldpress: {
        node_type: "SacredDoc",
        env_tag: "neither",
        dir_role: "_context/sacred",
        governance: { change_workflow: "prd-change", version: "1.0" },
      },
    };
    expect(NodeSchema.safeParse(node).success).toBe(true);
  });

  it("rejects unknown enum values in the coldpress extension", () => {
    const node = {
      id: "x",
      label: "x",
      coldpress: { node_type: "InventedType" },
    };
    expect(NodeSchema.safeParse(node).success).toBe(false);
  });
});

describe("loadGraph", () => {
  it("loads the vendored httpx fixture", async () => {
    const graph = await loadGraph({
      projectDir: httpxFixture,
      graphPath: "graph.json",
    });
    expect(graph).toBeInstanceOf(Graph);
    expect(graph.json.nodes.length).toBe(144);
    expect(graph.json.links.length).toBe(330);
  });

  it("throws GraphNotFoundError when the file is missing", async () => {
    await expect(
      loadGraph({ projectDir: "/nonexistent/abs/path", graphPath: "missing.json" }),
    ).rejects.toBeInstanceOf(GraphNotFoundError);
  });

  let tmp: string;
  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-graph-"));
  });
  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("throws GraphSchemaError on invalid JSON", async () => {
    const graphPath = join(tmp, DEFAULT_GRAPH_PATH);
    await mkdir(dirname(graphPath), { recursive: true });
    await writeFile(graphPath, "{not valid json", "utf8");

    await expect(loadGraph({ projectDir: tmp })).rejects.toBeInstanceOf(GraphSchemaError);
  });

  it("throws GraphSchemaError on schema-invalid content with actionable issues", async () => {
    const graphPath = join(tmp, DEFAULT_GRAPH_PATH);
    await mkdir(dirname(graphPath), { recursive: true });
    await writeFile(graphPath, JSON.stringify({ garbage: true }), "utf8");

    try {
      await loadGraph({ projectDir: tmp });
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GraphSchemaError);
      if (err instanceof GraphSchemaError) {
        expect(err.issues.length).toBeGreaterThan(0);
        for (const issue of err.issues) {
          expect(typeof issue.path).toBe("string");
          expect(typeof issue.message).toBe("string");
        }
      }
    }
  });
});

describe("Graph — query + stats against httpx fixture", () => {
  let graph: Graph;

  beforeEach(async () => {
    graph = await loadGraph({ projectDir: httpxFixture, graphPath: "graph.json" });
  });

  it("stats reports counts + histograms", () => {
    const s = graph.stats();
    expect(s.nodeCount).toBe(144);
    expect(s.edgeCount).toBe(330);
    expect(s.communityCount).toBeGreaterThan(0);
    expect(Object.keys(s.relationHistogram).length).toBeGreaterThan(0);
  });

  it("node(id) returns a known node", () => {
    const n = graph.node("client_baseclient");
    expect(n).toBeDefined();
    expect(n?.label).toBe("BaseClient");
  });

  it("node(id) returns undefined for an unknown id", () => {
    expect(graph.node("nonexistent_id")).toBeUndefined();
  });

  it("edgesByRelation filters to a known relation", () => {
    const imports = graph.edgesByRelation("imports_from");
    expect(imports.length).toBeGreaterThan(0);
    for (const e of imports) expect(e.relation).toBe("imports_from");
  });

  it("neighbors returns connected nodes", () => {
    // The fixture has imports_from edges; pick a known endpoint.
    const neighbours = graph.neighbors("client_baseclient");
    expect(neighbours.length).toBeGreaterThan(0);
  });

  it("neighbors filtered by relation only returns those neighbours", () => {
    const viaImports = graph.neighbors("client", { relation: "imports_from" });
    // Fewer or equal to unfiltered set.
    const all = graph.neighbors("client");
    expect(viaImports.length).toBeLessThanOrEqual(all.length);
  });

  it("nodesByType returns empty when no coldpress extension is present (httpx fixture is upstream)", () => {
    expect(graph.nodesByType("SacredDoc")).toEqual([]);
  });
});

describe("Graph.assertNoCredentialValue", () => {
  it("returns no hits when values are absent", async () => {
    const graph = await loadGraph({ projectDir: httpxFixture, graphPath: "graph.json" });
    expect(graph.assertNoCredentialValue(["thisvaluedefinitelydoesnotappear12345"])).toEqual([]);
  });

  it("detects a value that would leak into the graph", () => {
    const crafted = {
      directed: false,
      multigraph: false,
      graph: {},
      nodes: [{ id: "a", label: "contains-super-secret-xyz-12345" }],
      links: [],
    };
    const graph = new Graph(
      GraphJsonSchema.parse(crafted),
      "/virtual/graph.json",
    );
    const hits = graph.assertNoCredentialValue(["super-secret-xyz-12345"]);
    expect(hits.length).toBe(1);
  });

  it("ignores trivially short values (< 8 chars)", () => {
    const graph = new Graph(
      GraphJsonSchema.parse({
        directed: false,
        multigraph: false,
        graph: {},
        nodes: [{ id: "a", label: "abc" }],
        links: [],
      }),
      "/virtual/graph.json",
    );
    expect(graph.assertNoCredentialValue(["abc"])).toEqual([]);
  });
});

describe("Graph — coldpress-os extended node metadata", () => {
  const fixtureWithExtensions = {
    directed: false,
    multigraph: false,
    graph: { schema_version: 1, project_slug: "demo" },
    nodes: [
      {
        id: "prd",
        label: "PRD",
        coldpress: {
          node_type: "SacredDoc",
          env_tag: "neither",
          dir_role: "_context/sacred",
        },
      },
      {
        id: "story1",
        label: "Story 1",
        coldpress: { node_type: "Document", dir_role: "_context/planning" },
      },
      {
        id: "implfile",
        label: "impl.ts",
        coldpress: {
          node_type: "CodeModule",
          env_tag: "sandbox",
          dir_role: "sandbox",
        },
      },
      {
        id: "live_implfile",
        label: "impl.ts",
        coldpress: { node_type: "CodeModule", env_tag: "live" },
      },
    ],
    links: [
      { source: "story1", target: "prd", relation: "descends_from" },
      { source: "implfile", target: "story1", relation: "implements" },
      { source: "live_implfile", target: "implfile", relation: "promoted_from_sandbox" },
    ],
  };

  it("filters by node_type, dir_role, env_tag", () => {
    const graph = new Graph(
      GraphJsonSchema.parse(fixtureWithExtensions),
      "/virtual/graph.json",
    );
    expect(graph.nodesByType("SacredDoc").map((n) => n.id)).toEqual(["prd"]);
    expect(graph.nodesByDirRole("sandbox").map((n) => n.id)).toEqual(["implfile"]);
    expect(graph.nodesByEnvTag("live").map((n) => n.id)).toEqual(["live_implfile"]);
  });

  it("computes histograms correctly", () => {
    const graph = new Graph(
      GraphJsonSchema.parse(fixtureWithExtensions),
      "/virtual/graph.json",
    );
    const s = graph.stats();
    expect(s.nodeCount).toBe(4);
    expect(s.edgeCount).toBe(3);
    expect(s.nodeTypeHistogram.SacredDoc).toBe(1);
    expect(s.nodeTypeHistogram.CodeModule).toBe(2);
    expect(s.relationHistogram.descends_from).toBe(1);
    expect(s.relationHistogram.promoted_from_sandbox).toBe(1);
  });
});
