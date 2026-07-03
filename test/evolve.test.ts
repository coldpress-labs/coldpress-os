import { describe, expect, it } from "vitest";
import { aggregateEvolve, type TaxonomyLookup } from "../src/evolve/aggregate";
import type { Event } from "../schemas/event-stream.schema";

const BASE = { schema_version: 1 as const, run_id: "run-x", timestamp: "2026-07-03T00:00:00.000Z" };

function boundary(seq: number, over: Partial<Event> = {}): Event {
  return {
    ...BASE,
    seq,
    kind: "session-boundary",
    boundary: "stop",
    ...over,
  } as Event;
}

const taxonomy: TaxonomyLookup = new Map([
  ["skipped-gate", { category: "gate", description: "advanced without a gate" }],
  ["design-token-violation", { category: "design", description: "off-token value" }],
]);

describe("aggregateEvolve (WS7-D)", () => {
  const events: Event[] = [
    boundary(0, {
      agent: "developer",
      model: "claude-opus-4-8",
      tokens: { input: 1000, output: 200, total: 1200 },
      taxonomy_tags: ["skipped-gate", "design-token-violation"],
    }),
    boundary(1, {
      agent: "verifier",
      model: "claude-opus-4-8",
      tokens: { input: 500, output: 100, total: 600 },
      taxonomy_tags: ["skipped-gate"],
    }),
    boundary(2, { agent: "pm", model: "claude-sonnet-5", tokens: { input: 300, output: 50, total: 350 } }),
  ];

  const report = aggregateEvolve({ events, projects: 2, runs: 3, taxonomy });

  it("ranks the failure leaderboard by frequency", () => {
    expect(report.failure_leaderboard[0]).toEqual({ tag: "skipped-gate", count: 2 });
    expect(report.failure_leaderboard).toContainEqual({ tag: "design-token-violation", count: 1 });
  });

  it("sums token cost by model + agent", () => {
    expect(report.cost.total_tokens).toBe(1200 + 600 + 350);
    expect(report.cost.by_model["claude-opus-4-8"]).toBe(1800);
    expect(report.cost.by_model["claude-sonnet-5"]).toBe(350);
    expect(report.cost.by_agent["developer"]).toBe(1200);
  });

  it("proposes top-3 patches with taxonomy category in the text", () => {
    expect(report.top_patches[0]).toMatchObject({ rank: 1, failure_class: "skipped-gate", count: 2 });
    expect(report.top_patches[0]?.proposal).toContain("(gate)");
    expect(report.top_patches.length).toBeLessThanOrEqual(3);
  });

  it("reports cross-project scope + estimation-bias signal", () => {
    expect(report.projects).toBe(2);
    expect(report.runs).toBe(3);
    expect(report.estimation_bias.estimate_blown).toBe(0);
  });

  it("handles clean run-logs (no failures) gracefully", () => {
    const clean = aggregateEvolve({ events: [boundary(0, { tokens: { total: 100 } })], projects: 1, runs: 1 });
    expect(clean.failure_leaderboard).toEqual([]);
    expect(clean.top_patches).toEqual([]);
    expect(clean.cost.total_tokens).toBe(100);
    expect(clean.override_leaderboard).toEqual([]);
  });
});

describe("aggregateEvolve — override leaderboard", () => {
  function override(seq: number, gate: string, reason: string): Event {
    return { ...BASE, seq, kind: "gate-override", gate_id: gate, reason } as Event;
  }

  it("ranks bypassed gates by frequency and keeps the reasons", () => {
    const events: Event[] = [
      override(0, "quality-gate", "flaky coverage tool, fixing next PR"),
      override(1, "quality-gate", "hotfix — CI down"),
      override(2, "deploy-gate", "manual smoke done out-of-band"),
    ];
    const report = aggregateEvolve({ events, projects: 1, runs: 1 });
    expect(report.override_leaderboard[0]).toMatchObject({ gate: "quality-gate", count: 2 });
    expect(report.override_leaderboard[0]?.reasons).toContain("hotfix — CI down");
    expect(report.override_leaderboard[1]).toMatchObject({ gate: "deploy-gate", count: 1 });
  });
});
