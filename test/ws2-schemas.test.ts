/**
 * WS2 data contracts — handoff packet (§4.2), delta record (§4.3), story graph
 * (§4.7). These schemas underpin trace, waves, and boundary-guard.
 */

import { describe, expect, it } from "vitest";
import { HandoffPacketSchema, parseHandoffPacket } from "../schemas/handoff.schema";
import { DeltaRecordSchema, isUnresolved, parseDeltaRecord } from "../schemas/delta.schema";
import { parseStoryGraph, StoryGraphSchema } from "../schemas/story-graph.schema";

describe("HandoffPacketSchema", () => {
  const valid = {
    id: "HND-p7-developer-012",
    from: { phase: 7, agent: "pm" },
    to: { agent: "developer", mode: "standard", model: "sonnet" },
    objective: "Implement ST-008: recipe card servings scaler",
    inputs: [
      { doc: "sacred/prd.md", sections: ["4.2", "4.3"] },
      { doc: "design/tokens.json", sections: "all" },
    ],
    acceptance: "implementation/stories/ST-008.tests.md",
    constraints: ["no new dependencies"],
    forbidden: ["_context/sacred/*", "src/lib/payments/*"],
    return_contract: "diff summary + gate results + open questions as delta records",
  };

  it("accepts the operating-model §II.2 example", () => {
    const p = parseHandoffPacket(valid);
    expect(p.to.agent).toBe("developer");
    expect(p.forbidden).toContain("_context/sacred/*");
  });

  it("defaults constraints/forbidden to []", () => {
    const p = parseHandoffPacket({ ...valid, constraints: undefined, forbidden: undefined });
    expect(p.constraints).toEqual([]);
    expect(p.forbidden).toEqual([]);
  });

  it("rejects a missing objective and unknown keys (strict)", () => {
    expect(() => parseHandoffPacket({ ...valid, objective: undefined })).toThrow();
    expect(HandoffPacketSchema.safeParse({ ...valid, oops: 1 }).success).toBe(false);
  });

  it("requires at least one scoped input", () => {
    expect(() => parseHandoffPacket({ ...valid, inputs: [] })).toThrow();
  });
});

describe("DeltaRecordSchema", () => {
  const base = { id: "DLT-5-1", origin_phase: 5, description: "off-palette accent", impact: "styleguide" };

  it("accepts a resolved delta", () => {
    const d = parseDeltaRecord({ ...base, resolution: "accept_into_prd", resolved_by: "aastha" });
    expect(isUnresolved(d)).toBe(false);
  });

  it("accepts an unresolved delta (resolution null) and flags it", () => {
    const d = parseDeltaRecord({ ...base, resolution: null });
    expect(isUnresolved(d)).toBe(true);
  });

  it("requires resolved_by once resolved", () => {
    expect(() => parseDeltaRecord({ ...base, resolution: "reject" })).toThrow();
  });

  it("rejects an invalid resolution + unknown keys", () => {
    expect(DeltaRecordSchema.safeParse({ ...base, resolution: "maybe" }).success).toBe(false);
    expect(DeltaRecordSchema.safeParse({ ...base, resolution: null, extra: 1 }).success).toBe(false);
  });
});

describe("StoryGraphSchema", () => {
  const graph = {
    stories: [
      { id: "CT-1", kind: "contract", estimate: { o: 1, m: 2, p: 3 }, owns: ["src/types/*"] },
      { id: "ST-1", estimate: { o: 2, m: 4, p: 8 }, risk: "high", owns: ["src/a/*"], consumes: ["src/types/*"] },
    ],
    edges: [{ from: "CT-1", to: "ST-1", type: "interface" }],
  };

  it("accepts a valid graph and defaults story kind to 'story'", () => {
    const g = parseStoryGraph(graph);
    expect(g.stories[1]?.kind).toBe("story");
    expect(g.edges[0]?.type).toBe("interface");
  });

  it("enforces o <= m <= p on estimates", () => {
    expect(() => parseStoryGraph({ stories: [{ id: "ST-1", estimate: { o: 5, m: 2, p: 3 } }] })).toThrow();
  });

  it("rejects an unknown story key and a bad edge type (strict)", () => {
    expect(StoryGraphSchema.safeParse({ stories: [{ id: "ST-1", estimate: { o: 1, m: 1, p: 1 }, oops: 1 }] }).success).toBe(false);
    expect(StoryGraphSchema.safeParse({ stories: [{ id: "ST-1", estimate: { o: 1, m: 1, p: 1 } }], edges: [{ from: "a", to: "b", type: "wat" }] }).success).toBe(false);
  });

  it("requires at least one story", () => {
    expect(() => parseStoryGraph({ stories: [] })).toThrow();
  });
});
