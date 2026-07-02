/**
 * Tests for the `phase-gate` PreToolUse(Skill) hook (§4.4) — full lane only.
 */

import { describe, expect, it } from "vitest";
import {
  _resetSkillPhaseMap,
  decidePhaseGate,
  getSkillPhaseMap,
  isGateGreen,
  phaseGateHandler,
  skillNameFromInput,
} from "../../src/hooks/phase-gate";
import type { State } from "../../schemas/state.schema";

function state(partial: Partial<State>): State {
  return {
    lane: "full",
    phase: 1,
    phase_status: "in_progress",
    security_tier: "T0",
    enforcement: "on",
    gates: {},
    active_stories: [],
    deltas_open: {},
    deploy: {},
    ...partial,
  } as State;
}

describe("getSkillPhaseMap", () => {
  it("maps known lifecycle skills to their phase from the framework tree", () => {
    _resetSkillPhaseMap();
    const map = getSkillPhaseMap();
    // Sanity: at least one Phase-1 skill and one later-phase skill resolved.
    expect([...map.values()].some((p) => p === 1)).toBe(true);
    expect(map.size).toBeGreaterThan(5);
  });
});

describe("skillNameFromInput", () => {
  it("extracts the skill name from common tool_input shapes", () => {
    expect(skillNameFromInput({ tool_input: { skill: "create-prd" } })).toBe("create-prd");
    expect(skillNameFromInput({ tool_input: { name: "intake" } })).toBe("intake");
    expect(skillNameFromInput({ tool_input: {} })).toBeUndefined();
  });
});

describe("isGateGreen", () => {
  it("is green only with an exited marker and no false values", () => {
    expect(isGateGreen({ a: true, exited: "2026-07-01T00:00:00Z" })).toBe(true);
    expect(isGateGreen({ a: false, exited: "2026-07-01T00:00:00Z" })).toBe(false);
    expect(isGateGreen({ a: true })).toBe(false); // no exited marker
    expect(isGateGreen(undefined)).toBe(false);
  });
});

describe("decidePhaseGate", () => {
  it("no-ops in the lite lane", () => {
    expect(decidePhaseGate(state({ lane: "lite", phase: "spec" }), 4)).toEqual({ kind: "none" });
  });
  it("allows phase 1 skills always", () => {
    expect(decidePhaseGate(state({ phase: 1 }), 1)).toEqual({ kind: "none" });
  });
  it("DENIES a phase-4 skill when phase-3 gates are not green", () => {
    const d = decidePhaseGate(state({ phase: 3, gates: { p3: { done: false } } }), 4);
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toContain("Phase 4");
  });
  it("allows a phase-4 skill when phase-3 gates are green", () => {
    expect(decidePhaseGate(state({ phase: 3, gates: { p3: { done: true, exited: "2026-07-01T00:00:00Z" } } }), 4)).toEqual({ kind: "none" });
  });
  it("allows backfilling an earlier-phase skill (already past it)", () => {
    expect(decidePhaseGate(state({ phase: 6 }), 4)).toEqual({ kind: "none" });
  });
});

describe("phaseGateHandler.run", () => {
  it("passes through unknown/atomic skills", () => {
    expect(phaseGateHandler.run({ tool_input: { skill: "not-a-lifecycle-skill-xyz" } })).toEqual({ kind: "none" });
  });
  it("is an overridable PreToolUse hook with --explain", () => {
    expect(phaseGateHandler.event).toBe("PreToolUse");
    expect(phaseGateHandler.overrideGate).toBe("phase-gate");
    expect(phaseGateHandler.explain.length).toBeGreaterThan(20);
  });
});
