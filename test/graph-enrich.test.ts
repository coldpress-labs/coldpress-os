import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  enrichGraph,
  inferDirRole,
  inferEnvTag,
  inferNodeType,
} from "../src/graph/enrich";
import {
  applySecureManifest,
  buildCredentialNodes,
  mergeCredentialNodes,
  readSecureManifest,
} from "../src/graph/secure-manifest";
import { GraphJsonSchema } from "../src/graph/types";

describe("inferDirRole", () => {
  const cases: [string, string][] = [
    ["_context/sacred/prd.md", "_context/sacred"],
    ["_context/planning/epics.md", "_context/planning"],
    ["_context/design/ux-spec.md", "_context/design"],
    ["_context/implementation/dev-story-1.md", "_context/implementation"],
    ["_context/testing/test-plan.md", "_context/testing"],
    ["_context/tracking/sprint-status.yaml", "_context/tracking"],
    ["_context/handoffs/phase-4-to-5.md", "_context/handoffs"],
    ["_context/audit/retro-epic-1.md", "_context/audit"],
    ["_input/raw/brief.pdf", "_input/raw"],
    ["_input/legacy/old-notes.md", "_input/legacy"],
    ["_input/reference/competitor-analysis.md", "_input/reference"],
    ["_input/vendor/lib.zip", "_input/vendor"],
    ["_input/assets/logo.svg", "_input/assets"],
    ["secure/manifest.yaml", "secure"],
    ["sandbox/src/auth.ts", "sandbox"],
    ["live/src/auth.ts", "live"],
    ["README.md", "other"],
    ["./_context/sacred/prd.md", "_context/sacred"], // tolerates leading ./
  ];
  for (const [input, expected] of cases) {
    it(`maps "${input}" → "${expected}"`, () => {
      expect(inferDirRole(input)).toBe(expected);
    });
  }
});

describe("inferEnvTag", () => {
  it("tags sandbox / live paths", () => {
    expect(inferEnvTag("sandbox/src/main.ts")).toBe("sandbox");
    expect(inferEnvTag("live/src/main.ts")).toBe("live");
  });
  it("neither for everything else", () => {
    expect(inferEnvTag("_context/sacred/prd.md")).toBe("neither");
    expect(inferEnvTag("docs/README.md")).toBe("neither");
    expect(inferEnvTag("")).toBe("neither");
  });
});

describe("inferNodeType", () => {
  it("preserves an existing coldpress.node_type (CredentialName case)", () => {
    const node = {
      id: "x",
      label: "x",
      source_file: "secure/manifest.yaml",
      coldpress: { node_type: "CredentialName" as const },
    };
    expect(inferNodeType(node)).toBe("CredentialName");
  });

  it("Sacred path → SacredDoc", () => {
    expect(
      inferNodeType({ id: "x", label: "PRD", source_file: "_context/sacred/prd.md", file_type: "doc" }),
    ).toBe("SacredDoc");
  });

  it("Input path → Input", () => {
    expect(
      inferNodeType({ id: "x", label: "raw doc", source_file: "_input/raw/brief.md" }),
    ).toBe("Input");
  });

  it("file_type code + L1 → CodeModule", () => {
    expect(
      inferNodeType({
        id: "x",
        label: "auth.ts",
        source_file: "src/auth.ts",
        file_type: "code",
        source_location: "L1",
      }),
    ).toBe("CodeModule");
  });

  it("file_type code + deeper line → CodeSymbol", () => {
    expect(
      inferNodeType({
        id: "x",
        label: "login()",
        source_file: "src/auth.ts",
        file_type: "code",
        source_location: "L42",
      }),
    ).toBe("CodeSymbol");
  });

  it("audit dir → Artefact", () => {
    expect(
      inferNodeType({ id: "x", label: "retro", source_file: "_context/audit/retro-1.md", file_type: "doc" }),
    ).toBe("Artefact");
  });

  it("tracking yaml → Artefact", () => {
    expect(
      inferNodeType({
        id: "x",
        label: "sprint-status.yaml",
        source_file: "_context/tracking/sprint-status.yaml",
        file_type: "doc",
      }),
    ).toBe("Artefact");
  });

  it("tracking markdown → Document (not Artefact — structure-only promotion)", () => {
    expect(
      inferNodeType({ id: "x", label: "velocity.md", source_file: "_context/tracking/velocity.md", file_type: "doc" }),
    ).toBe("Document");
  });

  it("falls through to Document for unclassified prose", () => {
    expect(
      inferNodeType({ id: "x", label: "notes", source_file: "docs/notes.md", file_type: "doc" }),
    ).toBe("Document");
  });
});

describe("enrichGraph (end-to-end pure transform)", () => {
  const baseJson = {
    directed: false,
    multigraph: false,
    graph: {},
    nodes: [
      { id: "prd", label: "PRD", source_file: "_context/sacred/prd.md", file_type: "doc" as const },
      { id: "auth", label: "auth.ts", source_file: "sandbox/src/auth.ts", file_type: "code" as const, source_location: "L1", community: 1 },
      { id: "login", label: "login()", source_file: "sandbox/src/auth.ts", file_type: "code" as const, source_location: "L42", community: 1 },
      { id: "brief", label: "brief.pdf", source_file: "_input/raw/brief.pdf", file_type: "doc" as const, community: 2 },
    ],
    links: [
      { source: "auth", target: "prd", relation: "implements" },
      { source: "login", target: "auth", relation: "contains" },
    ],
  };

  it("populates coldpress namespace on every node", () => {
    const enriched = enrichGraph(GraphJsonSchema.parse(baseJson));
    for (const node of enriched.nodes) {
      expect(node.coldpress).toBeDefined();
      expect(node.coldpress?.node_type).toBeDefined();
      expect(node.coldpress?.env_tag).toBeDefined();
      expect(node.coldpress?.dir_role).toBeDefined();
    }
  });

  it("classifies the PRD / code / symbol / input correctly", () => {
    const enriched = enrichGraph(GraphJsonSchema.parse(baseJson));
    const byId = Object.fromEntries(enriched.nodes.map((n) => [n.id, n]));
    expect(byId.prd!.coldpress!.node_type).toBe("SacredDoc");
    expect(byId.prd!.coldpress!.env_tag).toBe("neither");
    expect(byId.prd!.coldpress!.dir_role).toBe("_context/sacred");

    expect(byId.auth!.coldpress!.node_type).toBe("CodeModule");
    expect(byId.auth!.coldpress!.env_tag).toBe("sandbox");

    expect(byId.login!.coldpress!.node_type).toBe("CodeSymbol");

    expect(byId.brief!.coldpress!.node_type).toBe("Input");
    expect(byId.brief!.coldpress!.dir_role).toBe("_input/raw");
  });

  it("stamps graph-level metadata — schema_version, coldpress_version, counts", () => {
    const enriched = enrichGraph(GraphJsonSchema.parse(baseJson), {
      coldpressVersion: "0.2.0-alpha",
      projectSlug: "demo",
    });
    expect(enriched.graph.schema_version).toBe(1);
    expect(enriched.graph.coldpress_version).toBe("0.2.0-alpha");
    expect(enriched.graph.project_slug).toBe("demo");
    expect(enriched.graph.counts).toEqual({ nodes: 4, links: 2, communities: 2 });
  });

  it("does not mutate the input", () => {
    const input = GraphJsonSchema.parse(baseJson);
    enrichGraph(input);
    expect(input.nodes[0]!.coldpress).toBeUndefined();
    expect(input.graph.schema_version).toBeUndefined();
  });

  it("preserves an existing coldpress.node_type — CredentialName is not overwritten", () => {
    const withCredential = {
      ...baseJson,
      nodes: [
        ...baseJson.nodes,
        {
          id: "secure__openai_api_key",
          label: "OPENAI_API_KEY",
          source_file: "secure/manifest.yaml",
          file_type: "doc" as const,
          coldpress: { node_type: "CredentialName" as const },
        },
      ],
    };
    const enriched = enrichGraph(GraphJsonSchema.parse(withCredential));
    const cred = enriched.nodes.find((n) => n.id === "secure__openai_api_key");
    expect(cred!.coldpress!.node_type).toBe("CredentialName");
    // But dir_role / env_tag should be populated by enrichment.
    expect(cred!.coldpress!.dir_role).toBe("secure");
    expect(cred!.coldpress!.env_tag).toBe("neither");
  });
});

// ────────────────────────────────────────────────────────────────────
// Secure-manifest adapter
// ────────────────────────────────────────────────────────────────────

describe("secure-manifest adapter", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-secure-"));
    await mkdir(join(tmp, "secure"), { recursive: true });
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("returns empty manifest when file is missing", async () => {
    const manifest = await readSecureManifest(tmp);
    expect(manifest).toEqual({ version: 1, keys: [] });
  });

  it("parses a manifest with several keys", async () => {
    await writeFile(
      join(tmp, "secure", "manifest.yaml"),
      `version: 1
keys:
  - name: OPENAI_API_KEY
    service: openai
    required: true
    notes: "LLM calls"
  - name: DATABASE_URL
    service: postgres
    required: true
  - name: SENTRY_DSN
    required: false
`,
      "utf8",
    );

    const manifest = await readSecureManifest(tmp);
    expect(manifest.version).toBe(1);
    expect(manifest.keys).toHaveLength(3);
    expect(manifest.keys.map((k) => k.name)).toEqual([
      "OPENAI_API_KEY",
      "DATABASE_URL",
      "SENTRY_DSN",
    ]);
    expect(manifest.keys[0]!.service).toBe("openai");
    expect(manifest.keys[0]!.required).toBe(true);
    expect(manifest.keys[2]!.required).toBe(false);
  });

  it("tolerates entries without a name (skips them)", async () => {
    await writeFile(
      join(tmp, "secure", "manifest.yaml"),
      `version: 1
keys:
  - name: REAL_KEY
  - service: orphan
  - notes: "no name"
`,
      "utf8",
    );
    const manifest = await readSecureManifest(tmp);
    expect(manifest.keys).toHaveLength(1);
    expect(manifest.keys[0]!.name).toBe("REAL_KEY");
  });

  it("buildCredentialNodes emits one CredentialName per key with no value content", () => {
    const nodes = buildCredentialNodes({
      version: 1,
      keys: [
        { name: "OPENAI_API_KEY", service: "openai", required: true },
        { name: "DATABASE_URL" },
      ],
    });
    expect(nodes).toHaveLength(2);
    expect(nodes[0]!.id).toBe("secure__openai_api_key");
    expect(nodes[0]!.label).toBe("OPENAI_API_KEY");
    expect(nodes[0]!.coldpress!.node_type).toBe("CredentialName");
    expect(nodes[0]!.coldpress!.dir_role).toBe("secure");

    // Defense-in-depth: the manifest's `service`, `required`, and `notes`
    // fields are deliberately dropped — the emitted node carries only
    // the canonical key-name for display + id. No service, no notes,
    // no required-flag, no "required" / "LLM calls" string anywhere.
    // (Note: "openai" appears in the id `secure__openai_api_key` by
    // design — that's the normalised key name, not a service leak.)
    for (const node of nodes) {
      const keys = Object.keys(node).sort();
      expect(keys).toEqual(["coldpress", "file_type", "id", "label", "source_file"]);
      expect(node).not.toHaveProperty("service");
      expect(node).not.toHaveProperty("required");
      expect(node).not.toHaveProperty("notes");
    }
  });

  it("mergeCredentialNodes appends without overwriting existing nodes", () => {
    const base = GraphJsonSchema.parse({
      directed: false,
      multigraph: false,
      graph: {},
      nodes: [{ id: "a", label: "A" }],
      links: [],
    });
    const merged = mergeCredentialNodes(base, {
      version: 1,
      keys: [{ name: "OPENAI_API_KEY" }],
    });
    expect(merged.nodes).toHaveLength(2);
    expect(merged.nodes.find((n) => n.id === "a")).toBeDefined();
    expect(merged.nodes.find((n) => n.id === "secure__openai_api_key")).toBeDefined();
  });

  it("mergeCredentialNodes dedupes on repeated calls", () => {
    const base = GraphJsonSchema.parse({
      directed: false,
      multigraph: false,
      graph: {},
      nodes: [],
      links: [],
    });
    const manifest = { version: 1, keys: [{ name: "KEY1" }] };
    const once = mergeCredentialNodes(base, manifest);
    const twice = mergeCredentialNodes(once, manifest);
    expect(twice.nodes).toHaveLength(1);
  });

  it("applySecureManifest composes read + merge end-to-end", async () => {
    await writeFile(
      join(tmp, "secure", "manifest.yaml"),
      `version: 1\nkeys:\n  - name: SENTRY_DSN\n`,
      "utf8",
    );
    const base = GraphJsonSchema.parse({
      directed: false,
      multigraph: false,
      graph: {},
      nodes: [{ id: "a", label: "A" }],
      links: [],
    });
    const merged = await applySecureManifest(base, tmp);
    expect(merged.nodes).toHaveLength(2);
    expect(merged.nodes.find((n) => n.label === "SENTRY_DSN")).toBeDefined();
  });

  it("applySecureManifest no-ops when manifest.yaml is absent", async () => {
    const base = GraphJsonSchema.parse({
      directed: false,
      multigraph: false,
      graph: {},
      nodes: [{ id: "a", label: "A" }],
      links: [],
    });
    const merged = await applySecureManifest(base, tmp);
    expect(merged.nodes).toHaveLength(1); // unchanged
  });
});

// ────────────────────────────────────────────────────────────────────
// End-to-end: enrichGraph + applySecureManifest composed
// ────────────────────────────────────────────────────────────────────

describe("enrichGraph ∘ applySecureManifest (the full post-process pass)", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-postprocess-"));
    await mkdir(join(tmp, "secure"), { recursive: true });
    await writeFile(
      join(tmp, "secure", "manifest.yaml"),
      `version: 1\nkeys:\n  - name: OPENAI_API_KEY\n  - name: DATABASE_URL\n`,
      "utf8",
    );
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("produces a fully-classified, credential-aware graph", async () => {
    const raw = {
      directed: false,
      multigraph: false,
      graph: {},
      nodes: [
        { id: "prd", label: "PRD", source_file: "_context/sacred/prd.md", file_type: "doc" as const },
        { id: "auth", label: "auth.ts", source_file: "sandbox/src/auth.ts", file_type: "code" as const, source_location: "L1" },
      ],
      links: [{ source: "auth", target: "prd", relation: "implements" }],
    };

    const parsed = GraphJsonSchema.parse(raw);
    const withCredentials = await applySecureManifest(parsed, tmp);
    const finalJson = enrichGraph(withCredentials, { coldpressVersion: "test", projectSlug: "demo" });

    // 2 original + 2 credential nodes.
    expect(finalJson.nodes).toHaveLength(4);
    expect(finalJson.graph.counts?.nodes).toBe(4);
    expect(finalJson.graph.schema_version).toBe(1);

    const byType = new Map<string, number>();
    for (const node of finalJson.nodes) {
      const t = node.coldpress?.node_type ?? "unknown";
      byType.set(t, (byType.get(t) ?? 0) + 1);
    }
    expect(byType.get("SacredDoc")).toBe(1);
    expect(byType.get("CodeModule")).toBe(1);
    expect(byType.get("CredentialName")).toBe(2);
  });
});
