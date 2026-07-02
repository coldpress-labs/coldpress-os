/**
 * WS4-E — P6 artifacts + the trace requirement/component keying that WS2 deferred.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ApiContractSchema,
  AnalyticsPlanSchema,
  DataModelSchema,
  IntegrationInventorySchema,
} from "../schemas/architecture/p6-artifacts.schema";
import { buildTraceGraph } from "../src/trace/build";
import { impact, orphans } from "../src/trace/verbs";

describe("P6 artifact schemas", () => {
  it("api-contract keys operations to requirement ids", () => {
    const c = ApiContractSchema.parse({ operations: [{ id: "createOrder", method: "POST", path: "/orders", requirement_ids: ["R3"] }] });
    expect(c.operations[0]?.requirement_ids).toEqual(["R3"]);
  });
  it("data-model carries per-entity retention/erasure", () => {
    const d = DataModelSchema.parse({ entities: [{ name: "User", fields: ["email"], retention: "24mo", erasure: "on request" }] });
    expect(d.entities[0]?.erasure).toBe("on request");
  });
  it("analytics-plan events tie to an outcome", () => {
    expect(AnalyticsPlanSchema.parse({ events: [{ name: "signup", outcome_ref: "R1" }] }).events[0]?.outcome_ref).toBe("R1");
  });
  it("integration-inventory REQUIRES a failure-mode row", () => {
    expect(IntegrationInventorySchema.safeParse({ integrations: [{ name: "Stripe" }] }).success).toBe(false); // no failure_mode
    expect(IntegrationInventorySchema.safeParse({ integrations: [{ name: "Stripe", failure_mode: "queue + retry" }] }).success).toBe(true);
  });
});

describe("trace requirement keying (§4.6, lit up in WS4-E)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-keying-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function seed(): void {
    mkdirSync(join(dir, "_context/implementation"), { recursive: true });
    mkdirSync(join(dir, "_context/planning"), { recursive: true });
    writeFileSync(
      join(dir, "_context/implementation/story-graph.yaml"),
      [
        "stories:",
        "  - id: ST-1",
        "    estimate: {o: 1, m: 2, p: 3}",
        "    owns: ['src/a/*']",
        "    implements: ['R1']", // ST-1 implements requirement R1
        "edges: []",
      ].join("\n"),
    );
    // Outcomes declare R1 (implemented) and R2 (NOT implemented → orphan).
    writeFileSync(
      join(dir, "_context/planning/outcomes.yaml"),
      [
        "outcomes:",
        "  - {requirement_id: R1, metric: activation, target: 1, source: {type: manual, ref: r}}",
        "  - {requirement_id: R2, metric: retention, target: 1, source: {type: manual, ref: r}}",
      ].join("\n"),
    );
  }

  it("impact(R1) reaches the implementing story and its files", () => {
    seed();
    const g = buildTraceGraph(dir);
    expect(g.node("R1")?.type).toBe("requirement");
    const ids = impact(g, "R1").map((s) => s.id);
    expect(ids).toContain("ST-1");
    expect(ids).toContain("src/a/*");
  });

  it("orphans flags an unmapped requirement (R2 has no implementing story)", () => {
    seed();
    const f = orphans(buildTraceGraph(dir));
    expect(f.find((x) => x.kind === "unmapped-requirement")?.id).toBe("R2");
    // R1 IS implemented → not flagged.
    expect(f.some((x) => x.kind === "unmapped-requirement" && x.id === "R1")).toBe(false);
  });
});
