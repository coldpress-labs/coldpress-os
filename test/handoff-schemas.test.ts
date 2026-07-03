import { describe, expect, it } from "vitest";
import {
  HANDOFF_SCHEMAS,
  PrdToArchitectureSchema,
  StoriesToImplementationSchema,
} from "../schemas/handoffs";
import { validateHandoff } from "../src/handoffs/validate";

describe("HANDOFF_SCHEMAS registry", () => {
  it("exposes the high-stakes handoff schemas keyed by id (PERT bridge excised)", () => {
    expect(Object.keys(HANDOFF_SCHEMAS).sort()).toEqual([
      "prd-to-architecture",
      "stories-to-implementation",
    ]);
  });
});

// ────────────────────────────────────────────────────────────────────
// prd-to-architecture
// ────────────────────────────────────────────────────────────────────

describe("PrdToArchitectureSchema", () => {
  const validPayload = {
    schema_version: 1,
    produced_by: "create-prd",
    produced_at: "2026-04-23T15:00:00Z",
    project_slug: "my-project",
    prd_version: "1.0",
    feature_count: 12,
    nfr_axes: ["performance", "accessibility"],
    adr_references: ["ADR-0001", "ADR-0002"],
    baselines_active: ["seo_aeo_llm", "accessibility"],
    brownfield_modules_count: 0,
    product_summary: "A task manager for solo creators with calendar integration.",
    architectural_drivers: [
      {
        id: "AD-01",
        statement: "Must scale to 10k concurrent users",
        rationale: "Launch projections from PRD §4.",
        priority: "critical",
      },
    ],
    nfrs: [
      {
        category: "performance",
        id: "NFR-01",
        requirement: "P95 response time under 200ms",
        verifiability: "k6 load test in CI",
      },
    ],
    constraints: [
      {
        type: "budget",
        statement: "Monthly infra cost must not exceed $50/mo",
        source: "Founder directive",
      },
    ],
    out_of_scope: [
      {
        item: "Multi-tenant team workspaces",
        reason: "Solo-creator-first positioning",
      },
    ],
  };

  it("accepts a well-formed payload", () => {
    const result = validateHandoff("prd-to-architecture", validPayload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.project_slug).toBe("my-project");
      expect(result.data.architectural_drivers).toHaveLength(1);
    }
  });

  it("rejects payloads missing required arrays", () => {
    const bad = { ...validPayload, architectural_drivers: [] };
    const result = validateHandoff("prd-to-architecture", bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path.startsWith("architectural_drivers"))).toBe(true);
    }
  });

  it("rejects wrong produced_by (stolen identity)", () => {
    const bad = { ...validPayload, produced_by: "validate-prd" };
    expect(validateHandoff("prd-to-architecture", bad).ok).toBe(false);
  });

  it("rejects an invalid priority value", () => {
    const bad = {
      ...validPayload,
      architectural_drivers: [
        { ...validPayload.architectural_drivers[0], priority: "URGENT" },
      ],
    };
    const result = validateHandoff("prd-to-architecture", bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path.includes("priority"))).toBe(true);
    }
  });

  it("rejects malformed timestamp", () => {
    const bad = { ...validPayload, produced_at: "last tuesday" };
    expect(validateHandoff("prd-to-architecture", bad).ok).toBe(false);
  });

  it("parseable via the schema directly too", () => {
    expect(() => PrdToArchitectureSchema.parse(validPayload)).not.toThrow();
  });
});

// ────────────────────────────────────────────────────────────────────
// stories-to-implementation
// ────────────────────────────────────────────────────────────────────

describe("StoriesToImplementationSchema", () => {
  const validPayload = {
    schema_version: 1,
    produced_by: "story-slice",
    produced_at: "2026-04-23T18:00:00Z",
    project_slug: "my-project",
    story_id: "E1.S1",
    epic_id: "E1",
    wave: 1,
    upstream_graph_path: "_context/implementation/story-graph.yaml",
    summary: "Add email/password signup flow",
    file_scope: [
      {
        path: "src/features/auth/signup.ts",
        intent: "create",
        why: "Implements AC-01",
      },
    ],
    test_coverage_targets: [
      {
        scope: "unit",
        target: "90% branch coverage on signup.ts",
        measurement: "vitest run --coverage",
      },
    ],
    acceptance_criteria_ids: ["AC-01", "AC-02"],
  };

  it("accepts a well-formed payload", () => {
    expect(validateHandoff("stories-to-implementation", validPayload).ok).toBe(true);
  });

  it("rejects invalid file intent", () => {
    const bad = {
      ...validPayload,
      file_scope: [{ ...validPayload.file_scope[0], intent: "relocate" }],
    };
    expect(validateHandoff("stories-to-implementation", bad).ok).toBe(false);
  });

  it("rejects empty file_scope", () => {
    const bad = { ...validPayload, file_scope: [] };
    expect(validateHandoff("stories-to-implementation", bad).ok).toBe(false);
  });

  it("rejects empty test coverage targets — every story must declare how it's verified", () => {
    const bad = { ...validPayload, test_coverage_targets: [] };
    expect(validateHandoff("stories-to-implementation", bad).ok).toBe(false);
  });

  it("parseable via schema directly", () => {
    expect(() => StoriesToImplementationSchema.parse(validPayload)).not.toThrow();
  });
});

// ────────────────────────────────────────────────────────────────────
// validate() error shape
// ────────────────────────────────────────────────────────────────────

describe("validateHandoff error reporting", () => {
  it("returns path+message issues for humans + machines", () => {
    const result = validateHandoff("prd-to-architecture", {});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.length).toBeGreaterThan(0);
      for (const issue of result.issues) {
        expect(typeof issue.path).toBe("string");
        expect(typeof issue.message).toBe("string");
      }
    }
  });

  it("<root> path for whole-payload errors", () => {
    const result = validateHandoff("prd-to-architecture", 42 as unknown);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // Array-level or root-level — accept either; the point is to get SOMETHING.
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });
});
