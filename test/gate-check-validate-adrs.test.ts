/**
 * Unit tests for src/gate/checks/validate-adrs.ts (§4.14).
 */

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateAdrs } from "../src/gate/checks/validate-adrs";
import { _resetValidatorCache } from "../src/governance/validate-schema";

let workDir: string;

function adrFrontmatter(overrides: Record<string, unknown> = {}): string {
  const base = {
    id: "ADR-0001",
    name: "adr",
    decision_area: "database",
    phase_authored: 3,
    status: "accepted",
    version: "1.0",
    tier: "T2",
    derived_from: ["_context/planning/stack-shortlist-v1.md"],
    options: ["Convex", "Supabase"],
    chosen: "Convex",
    rubric: {
      fit: 9, cost: 7, team_familiarity: 6, ecosystem: 8,
      lock_in: 5, vibe_fit: 9, weighted_total: 7.5,
    },
    ...overrides,
  };
  return Object.entries(base).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n");
}

function shortlistFrontmatter(areas: string[]): string {
  return `name: "stack-shortlist"
phase_authored: 3
status: final
version: "1.0"
derived_from: ["_context/planning/product-brief-v1.md"]
decision_areas:
${areas.map((a) => `  - area: ${a}\n    candidates: ["Option A", "Option B"]\n    rationale: test`).join("\n")}`;
}

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-validate-adrs-"));
  await mkdir(join(workDir, "_context", "planning", "adrs"), { recursive: true });
  _resetValidatorCache();
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function writeShortlist(areas: string[]): Promise<string> {
  const p = join(workDir, "_context", "planning", "stack-shortlist-v1.md");
  await writeFile(p, `---\n${shortlistFrontmatter(areas)}\n---\n`, "utf8");
  return p;
}

async function writeAdr(area: string, overrides: Record<string, unknown> = {}): Promise<void> {
  const slug = area.toLowerCase().replace(/\s+/g, "-");
  const p = join(workDir, "_context", "planning", "adrs", `adr-${slug}-v1.md`);
  await writeFile(p, `---\n${adrFrontmatter({ decision_area: area, ...overrides })}\n---\n`, "utf8");
}

describe("validateAdrs", () => {
  it("passes when all decision areas have accepted ADRs", async () => {
    const shortlist = await writeShortlist(["database", "auth"]);
    await writeAdr("database");
    await writeAdr("auth");
    const result = await validateAdrs(workDir, "_context/planning/stack-shortlist-v1.md");
    expect(result.ok).toBe(true);
    expect(result.passed).toHaveLength(2);
  });

  it("fails when an ADR is missing for an area", async () => {
    await writeShortlist(["database", "auth"]);
    await writeAdr("database");
    // no auth ADR
    const result = await validateAdrs(workDir, "_context/planning/stack-shortlist-v1.md");
    expect(result.ok).toBe(false);
    expect(result.failed.some((f) => f.area === "auth")).toBe(true);
  });

  it("fails when ADR lacks tier field", async () => {
    await writeShortlist(["database"]);
    await writeAdr("database", { tier: undefined });
    const result = await validateAdrs(workDir, "_context/planning/stack-shortlist-v1.md");
    expect(result.ok).toBe(false);
    expect(result.failed[0]?.reason).toContain("tier");
  });

  it("fails when ADR status is not accepted", async () => {
    await writeShortlist(["database"]);
    await writeAdr("database", { status: "proposed" });
    const result = await validateAdrs(workDir, "_context/planning/stack-shortlist-v1.md");
    expect(result.ok).toBe(false);
    expect(result.failed[0]?.reason).toContain("accepted");
  });
});
