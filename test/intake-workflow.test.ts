/**
 * Structural verification for the Phase 1 `intake` skill (Wave 3.2).
 * Same shape as orient-workflow.test.ts — this is a contract/shape suite;
 * runtime behaviour is conversational.
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const skillDir = join(repoRoot, "lifecycle", "1-bootstrap", "intake");

function parseFm(source: string): Record<string, unknown> {
  const m = /^---\s*\n([\s\S]*?)\n---/.exec(source);
  if (!m) return {};
  return (parseYaml(m[1] ?? "") as Record<string, unknown>) ?? {};
}

const extractFrontmatter = parseFm;

describe("intake skill — structure", () => {
  it("SKILL.md has re_runnable: true (re-entry from later phases allowed)", async () => {
    const raw = await readFile(join(skillDir, "SKILL.md"), "utf8");
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.re_runnable).toBe(true);
    expect(fm.name).toBe("intake");
    expect(fm.phase).toBe(1);
    expect(fm.next_skill).toBe("pre-project-interview");
  });

  it("workflow.md advertises 6 total steps", async () => {
    const raw = await readFile(join(skillDir, "workflow.md"), "utf8");
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.total_steps).toBe(6);
    expect(fm.re_runnable).toBe(true);
  });

  it("all 6 step files exist in order with matching step_number", async () => {
    const stepNames = [
      "step-01-material-solicitation.md",
      "step-02-shape-determination.md",
      "step-03-intent-seed.md",
      "step-04-working-mode.md",
      "step-05-graph-prime.md",
      "step-06-gate-and-route.md",
    ];
    for (let i = 0; i < stepNames.length; i++) {
      const raw = await readFile(join(skillDir, "steps", stepNames[i]!), "utf8");
      const fm = extractFrontmatter(raw) as Record<string, unknown>;
      expect(fm.step_number).toBe(i + 1);
      expect(typeof fm.step_name).toBe("string");
    }
  });

  it("Step 1 is the re-entry target (re_entry: allowed)", async () => {
    const raw = await readFile(
      join(skillDir, "steps", "step-01-material-solicitation.md"),
      "utf8",
    );
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.re_entry).toBe("allowed");
  });

  it("Step 1 references the three wired orphan utilities (Wave 3.6)", async () => {
    const raw = await readFile(
      join(skillDir, "steps", "step-01-material-solicitation.md"),
      "utf8",
    );
    expect(raw).toMatch(/index-docs/);
    expect(raw).toMatch(/shard-doc/);
  });

  it("Step 2 references repo-structure-audit for brownfield legacy scans", async () => {
    const raw = await readFile(
      join(skillDir, "steps", "step-02-shape-determination.md"),
      "utf8",
    );
    expect(raw).toMatch(/repo-structure-audit/);
  });

  it("Step 3 writes the seed context.md with the shape specified in the deep-dive", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-03-intent-seed.md"), "utf8");
    expect(raw).toMatch(/_context\/sacred\/context\.md/);
    expect(raw).toMatch(/status:\s*"seed"/);
    expect(raw).toMatch(/validate-schema/);
  });

  it("Step 5 graph-prime is warn-not-block per architectural note 8", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-05-graph-prime.md"), "utf8");
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.severity).toBe("warn");
    expect(raw).toMatch(/needs_graph_rebuild/);
    expect(raw).toMatch(/graph_rebuild_error/);
  });

  it("Step 6 hands off to Phase 2 pre-project-interview via a handoff artefact", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-06-gate-and-route.md"), "utf8");
    expect(raw).toMatch(/pre-project-interview/);
    expect(raw).toMatch(/_context\/handoffs\/intake-to-phase2/);
    expect(raw).toMatch(/evaluate-phase-gate/);
  });
});

describe("orphan utility frontmatter — Wave 3.6 wire-in markers (Part 1 baseline + Part 2 extensions)", () => {
  async function readFm(relPath: string): Promise<Record<string, unknown>> {
    const raw = await readFile(join(repoRoot, relPath), "utf8");
    return extractFrontmatter(raw) as Record<string, unknown>;
  }

  it("index-docs status includes wire-in-phase-1 and phases includes 1", async () => {
    const fm = await readFm("skills/utilities/index-docs/SKILL.md");
    expect(String(fm.status)).toMatch(/wire-in-phase-1/);
    expect(fm.phases).toEqual(expect.arrayContaining([1]));
  });

  it("shard-doc status includes wire-in-phase-1 and phases includes 1 (Part 2 Wave 3.7 may also append wire-in-phase-2)", async () => {
    const fm = await readFm("skills/utilities/shard-doc/SKILL.md");
    expect(String(fm.status)).toMatch(/wire-in-phase-1/);
    expect(fm.phases).toEqual(expect.arrayContaining([1]));
  });

  it("repo-structure-audit status includes wire-in-phase-1 and phases includes 1 (Part 2 Wave 3.7 may also append wire-in-phase-2)", async () => {
    const fm = await readFm("skills/ops/repo-structure-audit/SKILL.md");
    expect(String(fm.status)).toMatch(/wire-in-phase-1/);
    expect(fm.phases).toEqual(expect.arrayContaining([1]));
  });
});
