/**
 * Verifies the Phase 3 gate.json structure after Wave 4 rewrite (§4.6 + §4.13 + §4.14).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const GATE_PATH = join(__dirname, "../lifecycle/3-tech-stack/gate.json");

interface CheckEntry {
  id: string;
  stage: number;
  severity: string;
  kind: string;
  command?: string;
  path_pattern?: string;
  remediation: string;
}

interface GateJson {
  acceptance_checks: CheckEntry[];
  entry_conditions: string[];
  next_phase: string;
}

describe("Phase 3 gate.json — Wave 4 structure", () => {
  let gate: GateJson;

  beforeAll(() => {
    gate = JSON.parse(readFileSync(GATE_PATH, "utf8")) as GateJson;
  });

  it("has exactly 12 acceptance_checks", () => {
    // Was 13 before v0.4 WS0 removed the stage-2 graph-freshness check
    // (§8 item 1, Graphify retired).
    expect(gate.acceptance_checks).toHaveLength(12);
  });

  it("has 10 stage-1 checks", () => {
    const stage1 = gate.acceptance_checks.filter((c) => c.stage === 1);
    expect(stage1).toHaveLength(10);
  });

  it("has 2 stage-2 checks", () => {
    const stage2 = gate.acceptance_checks.filter((c) => c.stage === 2);
    expect(stage2).toHaveLength(2);
  });

  it("stage-2 checks include env-provisioned, post-phase-3-update-ran (graph-freshness removed v0.4 WS0)", () => {
    const stage2Ids = gate.acceptance_checks
      .filter((c) => c.stage === 2)
      .map((c) => c.id);
    expect(stage2Ids).toContain("env-provisioned");
    expect(stage2Ids).toContain("post-phase-3-update-ran");
    expect(stage2Ids).not.toContain("graph-freshness");
  });

  it("every check has a remediation field", () => {
    for (const check of gate.acceptance_checks) {
      expect(check.remediation, `check ${check.id} missing remediation`).toBeTruthy();
    }
  });

  it("every automated check has a command field", () => {
    for (const check of gate.acceptance_checks) {
      if (check.kind === "automated") {
        expect(check.command, `check ${check.id} missing command`).toBeTruthy();
      }
    }
  });

  it("next_phase is 4-planning", () => {
    expect(gate.next_phase).toBe("4-planning");
  });

  it("entry_conditions includes product-brief reference", () => {
    const conditions = gate.entry_conditions.join(" ");
    expect(conditions).toContain("product-brief");
  });
});
