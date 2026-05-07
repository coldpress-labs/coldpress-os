/**
 * Structural tests for Phase 3 → Phase 4 transition wiring (§4.10).
 *
 * Verifies that:
 * 1. stack-locking step-05 invokes phase-transition
 * 2. phase-transition step-03 handles distillate regen generically (not hardcoded product-brief)
 * 3. The handoff registry row 3 references all expected artefacts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const STEP_05_PATH = join(__dirname, "../lifecycle/3-tech-stack/stack-locking/steps/step-05-phase-transition.md");
const STEP_03_HANDOFF_PATH = join(__dirname, "../skills/governance/phase-transition/steps/step-03-handoff-log.md");
const HANDOFF_REGISTRY_PATH = join(__dirname, "../docs/handoff-registry.md");

describe("Phase 3 → Phase 4 transition wiring", () => {
  it("stack-locking step-05 references phase-transition skill", () => {
    const content = readFileSync(STEP_05_PATH, "utf8");
    expect(content).toContain("phase-transition");
  });

  it("stack-locking step-05 references --stage 1 and --stage 2", () => {
    const content = readFileSync(STEP_05_PATH, "utf8");
    expect(content).toContain("--stage 1");
    expect(content).toContain("--stage 2");
  });

  it("stack-locking step-05 includes post-phase-3 exit hook prompt", () => {
    const content = readFileSync(STEP_05_PATH, "utf8");
    expect(content).toContain("coldpress update --post-phase-3");
  });

  it("phase-transition step-03 handles distillates generically (stack-selection-summary mentioned)", () => {
    const content = readFileSync(STEP_03_HANDOFF_PATH, "utf8");
    expect(content).toContain("stack-selection-summary");
    expect(content).toContain("regeneratable");
  });

  it("phase-transition step-03 does not hardcode product-brief as only distillate", () => {
    const content = readFileSync(STEP_03_HANDOFF_PATH, "utf8");
    // Should describe a generalised loop, not "if product-brief exists"
    expect(content).toContain("distillate");
    expect(content).not.toContain("Phase 2 → 3 only");
  });

  it("handoff registry row 3 includes ADR artefacts", () => {
    const content = readFileSync(HANDOFF_REGISTRY_PATH, "utf8");
    expect(content).toContain("adr-*-v*.md");
    expect(content).toContain("stack-selection-summary");
    expect(content).toContain("stack-shortlist");
  });
});
