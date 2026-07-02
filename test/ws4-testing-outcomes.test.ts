/**
 * WS4-C — testing.yaml (L0–L7) + outcomes.yaml (outcome contract) + P4 coverage gate.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestingSchema } from "../schemas/testing.schema";
import { OutcomesSchema } from "../schemas/planning-artefacts/outcomes.schema";
import { checkOutcomes, uncoveredRequirements, type Requirement } from "../src/outcomes/coverage";
import { runOutcomesCheck } from "../src/commands/outcomes";

describe("TestingSchema", () => {
  it("accepts a testing.yaml with L0–L7 layers + coverage + flake", () => {
    const t = TestingSchema.parse({
      stack_pack: "vibe-coder-fullstack",
      layers: { L0: { tools: ["tsc", "eslint"] }, L1: { threshold: 70 }, L7: { threshold: "LCP<1.8s" } },
      coverage: { default_lines_pct: 70 },
      flake_quarantine: { max_quarantined: 2 },
    });
    expect(t.layers.L1?.threshold).toBe(70);
  });
  it("rejects an unknown layer key + unknown top-level key (strict)", () => {
    expect(TestingSchema.safeParse({ layers: { L9: {} } }).success).toBe(false);
    expect(TestingSchema.safeParse({ layers: {}, oops: 1 }).success).toBe(false);
  });
});

describe("OutcomesSchema", () => {
  it("accepts a valid outcome with metric + target + source", () => {
    const o = OutcomesSchema.parse({
      outcomes: [{ requirement_id: "R1", priority: "P0", metric: "activation_rate", target: ">= 40%", source: { type: "analytics_event", ref: "signup_completed" } }],
    });
    expect(o.outcomes[0]?.source.type).toBe("analytics_event");
  });
  it("rejects a missing source + bad source type", () => {
    expect(OutcomesSchema.safeParse({ outcomes: [{ requirement_id: "R1", metric: "x", target: 1 }] }).success).toBe(false);
    expect(OutcomesSchema.safeParse({ outcomes: [{ requirement_id: "R1", metric: "x", target: 1, source: { type: "vibes", ref: "y" } }] }).success).toBe(false);
  });
});

describe("uncoveredRequirements — the P4 gate logic", () => {
  const outcomes = OutcomesSchema.parse({
    outcomes: [{ requirement_id: "R1", metric: "m", target: 1, source: { type: "manual", ref: "r" } }],
  });
  const reqs: Requirement[] = [
    { id: "R1", priority: "P0" },
    { id: "R2", priority: "P0" }, // P0 with NO outcome → must be flagged
    { id: "R3", priority: "P2" }, // P2 without outcome → fine
  ];
  it("flags a P0 requirement with no outcome target, ignores P2", () => {
    expect(uncoveredRequirements(reqs, outcomes)).toEqual(["R2"]);
  });
  it("returns [] when every P0/P1 requirement is covered", () => {
    expect(uncoveredRequirements([{ id: "R1", priority: "P0" }], outcomes)).toEqual([]);
  });
});

describe("checkOutcomes + runOutcomesCheck", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-outcomes-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function writeOutcomes(yaml: string): void {
    mkdirSync(join(dir, "_context/planning"), { recursive: true });
    writeFileSync(join(dir, "_context/planning/outcomes.yaml"), yaml, "utf8");
  }

  it("fails when outcomes.yaml is missing", () => {
    expect(checkOutcomes(dir).ok).toBe(false);
    expect(runOutcomesCheck({ projectDir: dir, stderr: () => {} })).toBe(1);
  });

  it("passes a present, valid outcomes.yaml", () => {
    writeOutcomes("outcomes:\n  - requirement_id: R1\n    metric: activation\n    target: '>= 40%'\n    source: {type: analytics_event, ref: signup}\n");
    expect(checkOutcomes(dir).ok).toBe(true);
    let out = "";
    expect(runOutcomesCheck({ projectDir: dir, stdout: (s) => (out += s) })).toBe(0);
    expect(out).toContain("outcomes check OK");
  });

  it("fails a schema-invalid outcomes.yaml", () => {
    writeOutcomes("outcomes:\n  - requirement_id: R1\n    metric: x\n"); // no target/source
    expect(checkOutcomes(dir).ok).toBe(false);
  });

  it("flags an uncovered P0 requirement when requirements are supplied", () => {
    writeOutcomes("outcomes:\n  - requirement_id: R1\n    metric: m\n    target: 1\n    source: {type: manual, ref: r}\n");
    const res = checkOutcomes(dir, [{ id: "R2", priority: "P0" }]);
    expect(res.ok).toBe(false);
    expect(res.errors.join()).toContain("R2");
  });
});
