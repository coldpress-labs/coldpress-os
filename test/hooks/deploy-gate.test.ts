/**
 * Tests for the `deploy-gate` PreToolUse(Skill) hook (§5 P9 / §9 WS6) — the
 * second, independent guard on production deploys.
 */

import { describe, expect, it } from "vitest";
import { decideDeployGate, deployGateHandler, hasAcceptanceRecord } from "../../src/hooks/deploy-gate";
import type { State } from "../../schemas/state.schema";

function state(overrides: Partial<State> = {}): State {
  return {
    lane: "full",
    phase: 9,
    phase_status: "in_progress",
    security_tier: "T1",
    enforcement: "on",
    gates: {},
    active_stories: [],
    deltas_open: {},
    deploy: {},
    ...overrides,
  } as State;
}

const CWD = "/tmp/nonexistent-project-deploy-gate"; // no acceptance dir → hasAcceptanceRecord false

describe("decideDeployGate", () => {
  it("passes when build complete + staging smoke green (full lane, no acceptance required)", () => {
    const s = state({ phase: 9, deploy: { staging_smoke: "green" } });
    expect(decideDeployGate(s, CWD)).toEqual({ kind: "none" });
  });

  it("passes via gates.p8 green when phase is still 8", () => {
    const s = state({
      phase: 8,
      gates: { p8: { done: true, exited: "2026-07-03T00:00:00Z" } },
      deploy: { staging_smoke: true },
    });
    expect(decideDeployGate(s, CWD)).toEqual({ kind: "none" });
  });

  it("denies when build/verification not complete", () => {
    const s = state({ phase: 8, gates: { p8: { done: false } }, deploy: { staging_smoke: "green" } });
    const d = decideDeployGate(s, CWD);
    expect(d.kind).toBe("deny");
    expect(d.kind === "deny" && d.reason).toMatch(/build \+ verification/);
  });

  it("denies when staging smoke is not green", () => {
    const s = state({ phase: 9, deploy: { staging_smoke: "red" } });
    const d = decideDeployGate(s, CWD);
    expect(d.kind).toBe("deny");
    expect(d.kind === "deny" && d.reason).toMatch(/staging smoke/);
  });

  it("denies when acceptance is required but no record exists", () => {
    const s = state({ phase: 9, deploy: { staging_smoke: "green", requires_acceptance: true } });
    const d = decideDeployGate(s, CWD);
    expect(d.kind).toBe("deny");
    expect(d.kind === "deny" && d.reason).toMatch(/acceptance record/);
  });

  it("lite lane: passes when Verify green (or phase ship) + smoke green", () => {
    const s = state({ lane: "lite", phase: "ship", deploy: { staging_smoke: "pass" } });
    expect(decideDeployGate(s, CWD)).toEqual({ kind: "none" });
  });
});

describe("deployGateHandler", () => {
  it("only gates deploy-prod — any other skill passes through", () => {
    expect(deployGateHandler.run({ tool_name: "Skill", tool_input: { skill: "deploy-staging" } })).toEqual({
      kind: "none",
    });
    expect(deployGateHandler.run({ tool_name: "Skill", tool_input: { skill: "create-prd" } })).toEqual({
      kind: "none",
    });
  });

  it("is a PreToolUse hook with an override gate", () => {
    expect(deployGateHandler.event).toBe("PreToolUse");
    expect(deployGateHandler.overrideGate).toBe("deploy-gate");
  });
});

describe("hasAcceptanceRecord", () => {
  it("false when the acceptance dir is absent", () => {
    expect(hasAcceptanceRecord(CWD)).toBe(false);
  });
});
