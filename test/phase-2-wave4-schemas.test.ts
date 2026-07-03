/**
 * Phase II Part 2 Wave 4 schema tests.
 *
 * Covers:
 *  4.3 — `supersedes` field accepted/rejected on all 5 sacred-doc schemas
 *  4.6 — research-output + product-brief distillate schemas + validateDocSchema path routing
 *  4.7 — Phase 2 gate.json structural contract
 */

import { readFile } from "node:fs/promises";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  _resetValidatorCache,
  pathPatternSchemaFromPath,
  validateDocSchema,
  validateSacredDocSchema,
} from "../src/governance/validate-schema";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-wave4-"));
  _resetValidatorCache();
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function writeDoc(name: string, frontmatter: string, body = "# doc"): Promise<string> {
  const path = join(workDir, name);
  await writeFile(path, `---\n${frontmatter}\n---\n\n${body}\n`, "utf8");
  return path;
}

// ─── 4.3 supersedes field on sacred-doc schemas ─────────────────────────────

describe("sacred-doc schemas — supersedes field (Wave 4.3)", () => {
  // tech-stack.md additionally requires `derived_from` (Phase 3 Round-5 audit fix).
  const SACRED_DOCS: Array<{ name: string; workflowType: string; extras?: string[] }> = [
    { name: "context.md", workflowType: "context" },
    { name: "tech-stack.md", workflowType: "tech-stack", extras: ["derived_from:", '  - "_context/sacred/context.md"'] },
    { name: "prd.md", workflowType: "prd" },
    { name: "architecture.md", workflowType: "architecture" },
  ];

  for (const doc of SACRED_DOCS) {
    const extras = doc.extras ?? [];

    it(`${doc.name}: accepts supersedes with valid _input/ paths`, async () => {
      const p = await writeDoc(
        doc.name,
        [
          "sacred: true",
          'version: "1.0"',
          'governance: "draft"',
          `workflowType: "${doc.workflowType}"`,
          ...extras,
          "supersedes:",
          '  - "_input/raw/original-brief.md"',
          '  - "_input/reference/market-report.pdf"',
        ].join("\n"),
      );
      const result = await validateSacredDocSchema(p);
      expect(result.ok, `${doc.name} with valid supersedes should pass`).toBe(true);
    });

    it(`${doc.name}: accepts docs without supersedes (optional field)`, async () => {
      const p = await writeDoc(
        doc.name,
        [
          "sacred: true",
          'version: "1.0"',
          'governance: "draft"',
          `workflowType: "${doc.workflowType}"`,
          ...extras,
        ].join("\n"),
      );
      const result = await validateSacredDocSchema(p);
      expect(result.ok, `${doc.name} without supersedes should pass`).toBe(true);
    });

    it(`${doc.name}: rejects supersedes paths not starting with _input/`, async () => {
      const p = await writeDoc(
        doc.name,
        [
          "sacred: true",
          'version: "1.0"',
          'governance: "draft"',
          `workflowType: "${doc.workflowType}"`,
          ...extras,
          "supersedes:",
          '  - "_context/sacred/other.md"',
        ].join("\n"),
      );
      const result = await validateSacredDocSchema(p);
      expect(result.ok, `${doc.name} with non-_input/ supersedes path should fail`).toBe(false);
    });
  }
});

// ─── 4.6 validateDocSchema path routing ─────────────────────────────────────

describe("pathPatternSchemaFromPath (Wave 4.6)", () => {
  it("matches product-brief-vN.md at any path depth", () => {
    expect(pathPatternSchemaFromPath("_context/planning/product-brief-v1.md")).toBe(
      "distillates/product-brief.schema.json",
    );
    expect(pathPatternSchemaFromPath("_context/planning/product-brief-v12.md")).toBe(
      "distillates/product-brief.schema.json",
    );
  });

  it("matches research output files under _context/planning/research/", () => {
    expect(
      pathPatternSchemaFromPath("_context/planning/research/domain-research-2026-04-24.md"),
    ).toBe("research-output.schema.json");
    expect(
      pathPatternSchemaFromPath("_context/planning/research/market-research.md"),
    ).toBe("research-output.schema.json");
  });

  it("returns undefined for unrecognised paths", () => {
    expect(pathPatternSchemaFromPath("_context/sacred/context.md")).toBeUndefined();
    expect(pathPatternSchemaFromPath("_context/planning/synthesis.md")).toBeUndefined();
  });
});

describe("validateDocSchema — product-brief distillate (Wave 4.6)", () => {
  it("accepts a valid product-brief-v1.md frontmatter", async () => {
    const p = await writeDoc(
      "product-brief-v1.md",
      [
        'name: "product-brief"',
        'tier: "distillate"',
        "version: 1",
        "phase_authored: 2",
        'status: "authored"',
        'derived_from: "synthesis"',
        "synthesis_version: 1",
        "validation_version: 1",
        'project_shape: "greenfield"',
        'created: "2026-04-24"',
        'last_modified: "2026-04-24"',
      ].join("\n"),
    );
    const result = await validateDocSchema(p);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.schema_used).toBe("distillates/product-brief.schema.json");
    }
  });

  it("rejects product-brief missing required tier field", async () => {
    const p = await writeDoc(
      "product-brief-v1.md",
      [
        'name: "product-brief"',
        "version: 1",
        "phase_authored: 2",
        'status: "draft"',
      ].join("\n"),
    );
    const result = await validateDocSchema(p);
    expect(result.ok).toBe(false);
  });

  it("rejects product-brief with tier != distillate", async () => {
    const p = await writeDoc(
      "product-brief-v1.md",
      [
        'name: "product-brief"',
        'tier: "sacred"',
        "version: 1",
        "phase_authored: 2",
        'status: "draft"',
      ].join("\n"),
    );
    const result = await validateDocSchema(p);
    expect(result.ok).toBe(false);
  });
});

describe("validateDocSchema — research output (Wave 4.6)", () => {
  it("accepts a valid research output frontmatter", async () => {
    await writeFile(
      join(workDir, "research-dir"),
      "",
    ).catch(() => {});

    const researchDir = join(workDir, "_context", "planning", "research");
    await writeFile(
      join(workDir, "domain-research-2026-04-24.md"),
      [
        "---",
        'name: "domain-research"',
        "phase_authored: 2",
        'status: "complete"',
        'topic: "AI productivity tooling"',
        'research_mode: "mixed"',
        "graph_hits: []",
        'legacy_scanned: false',
        'project_shape: "greenfield"',
        'created: "2026-04-24"',
        "---",
        "",
        "# Research",
      ].join("\n"),
      "utf8",
    ).catch(() => {});

    // Test via the path-pattern match: simulate _context/planning/research/ path
    const fakePath = join(workDir, "_context", "planning", "research", "domain-research-2026-04-24.md");
    await writeFile(fakePath, [
      "---",
      'name: "domain-research"',
      "phase_authored: 2",
      'status: "complete"',
      'topic: "AI productivity tooling"',
      'research_mode: "mixed"',
      "---",
      "",
      "# Research",
    ].join("\n"), { encoding: "utf8", recursive: true } as Parameters<typeof writeFile>[2]).catch(async () => {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(dirname(fakePath), { recursive: true });
      await writeFile(fakePath, [
        "---",
        'name: "domain-research"',
        "phase_authored: 2",
        'status: "complete"',
        'topic: "AI productivity tooling"',
        'research_mode: "mixed"',
        "---",
        "",
        "# Research",
      ].join("\n"), "utf8");
    });

    const result = await validateDocSchema(fakePath);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.schema_used).toBe("research-output.schema.json");
    }
  });

  it("rejects research output with invalid status value", async () => {
    const { mkdir } = await import("node:fs/promises");
    const researchDir = join(workDir, "_context", "planning", "research");
    await mkdir(researchDir, { recursive: true });
    const fakePath = join(researchDir, "market-research.md");
    await writeFile(fakePath, [
      "---",
      'name: "market-research"',
      "phase_authored: 2",
      'status: "in-progress"',
      "---",
      "",
    ].join("\n"), "utf8");

    const result = await validateDocSchema(fakePath);
    expect(result.ok).toBe(false);
  });
});

describe("validateDocSchema — sacred doc routing still works (Wave 4.6)", () => {
  it("routes context.md to sacred-doc schema", async () => {
    const p = await writeDoc(
      "context.md",
      [
        "sacred: true",
        'version: "1.0"',
        'governance: "draft"',
        'workflowType: "context"',
      ].join("\n"),
    );
    const result = await validateDocSchema(p);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.schema_used).toMatch(/sacred-docs/);
    }
  });

  it("returns no-schema error for unrecognised files", async () => {
    const p = await writeDoc("unrecognised.md", 'foo: "bar"');
    const result = await validateDocSchema(p);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]!.message).toMatch(/No schema registered/);
    }
  });
});

// ─── 4.7 Phase 2 gate.json structure ────────────────────────────────────────

describe("Phase 2 gate.json structural contract (Wave 4.7)", () => {
  let gate: {
    gate_id: string;
    phase: number;
    acceptance_checks: Array<{ id: string; severity: string; kind: string }>;
    next_phase: string;
  };

  beforeEach(async () => {
    const raw = await readFile(
      resolve(repoRoot, "lifecycle/2-discovery/gate.json"),
      "utf8",
    );
    gate = JSON.parse(raw) as typeof gate;
  });

  it("gate_id is phase-2-exit", () => {
    expect(gate.gate_id).toBe("phase-2-exit");
  });

  it("next_phase is 3-tech-stack", () => {
    expect(gate.next_phase).toBe("3-tech-stack");
  });

  it("has exactly 4 acceptance checks", () => {
    // Was 7 before v0.4 WS0 removed the graph-freshness check (§8 item 1,
    // Graphify retired — no graph staleness gate). Was 6 before WS5-B moved
    // context-md-status-authored + context-sacred-signoff to the Phase 1 gate
    // (pre-project-interview, which owned this transition, merged into Phase 1
    // intake — §8 item 6).
    expect(gate.acceptance_checks).toHaveLength(4);
  });

  it("no longer carries the context-authoring checks (moved to Phase 1, WS5-B)", () => {
    expect(gate.acceptance_checks.find((c) => c.id === "context-md-status-authored")).toBeUndefined();
    expect(gate.acceptance_checks.find((c) => c.id === "context-sacred-signoff")).toBeUndefined();
  });

  it("research-synthesis-exists is block severity", () => {
    const check = gate.acceptance_checks.find((c) => c.id === "research-synthesis-exists");
    expect(check).toBeDefined();
    expect(check!.severity).toBe("block");
  });

  it("product-brief-authored is block severity", () => {
    const check = gate.acceptance_checks.find((c) => c.id === "product-brief-authored");
    expect(check).toBeDefined();
    expect(check!.severity).toBe("block");
  });

  it("idea-validation-exists is warn severity", () => {
    const check = gate.acceptance_checks.find((c) => c.id === "idea-validation-exists");
    expect(check).toBeDefined();
    expect(check!.severity).toBe("warn");
  });

  it("no longer has a graph-freshness check (Graphify retired, v0.4 WS0)", () => {
    const check = gate.acceptance_checks.find((c) => c.id === "graph-freshness");
    expect(check).toBeUndefined();
  });

  it("supersessions-log-if-applicable is warn severity", () => {
    const check = gate.acceptance_checks.find((c) => c.id === "supersessions-log-if-applicable");
    expect(check).toBeDefined();
    expect(check!.severity).toBe("warn");
  });

  it("block checks come before warn checks in the list", () => {
    const checks = gate.acceptance_checks;
    let seenWarn = false;
    for (const check of checks) {
      if (check.severity === "warn") seenWarn = true;
      if (check.severity === "block" && seenWarn) {
        throw new Error(`block check "${check.id}" appears after a warn check`);
      }
    }
  });
});
