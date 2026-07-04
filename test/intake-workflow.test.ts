/**
 * Structural verification for the Phase 1 `intake` skill (Wave 3.2; WS5-B
 * absorbed `orient` and `pre-project-interview` into this single 13-step
 * skill — see the overhaul ledger, Session 6, Increment B).
 * Runtime behaviour is conversational — Butler executes the steps — so this
 * suite verifies the contract (shape, references, outputs), not the dialogue.
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

/** Strip the trailing "### Version Control" changelog — those rows legitimately name retired skills/paths for history. */
function withoutChangelog(source: string): string {
  return source.split(/\n### Version Control\n/)[0] ?? source;
}

describe("intake skill — structure", () => {
  it("SKILL.md has re_runnable: true (re-entry from later phases allowed)", async () => {
    const raw = await readFile(join(skillDir, "SKILL.md"), "utf8");
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.re_runnable).toBe(true);
    expect(fm.name).toBe("intake");
    expect(fm.phase).toBe(1);
    expect(fm.next_skill).toBe("research");
  });

  it("workflow.md advertises 13 total steps", async () => {
    const raw = await readFile(join(skillDir, "workflow.md"), "utf8");
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.total_steps).toBe(13);
    expect(fm.re_runnable).toBe(true);
  });

  it("all 13 step files exist in order with matching step_number", async () => {
    const stepNames = [
      "step-01-mode-detect.md",
      "step-02-greeting.md",
      "step-03-sanity-check.md",
      "step-04-lifecycle-intro.md",
      "step-05-material-solicitation.md",
      "step-06-shape-determination.md",
      "step-07-intent-seed.md",
      "step-08-vision.md",
      "step-09-users.md",
      "step-10-constraints.md",
      "step-11-synthesize.md",
      "step-12-working-mode.md",
      "step-13-gate-and-route.md",
    ];
    for (let i = 0; i < stepNames.length; i++) {
      const raw = await readFile(join(skillDir, "steps", stepNames[i]!), "utf8");
      const fm = extractFrontmatter(raw) as Record<string, unknown>;
      expect(fm.step_number).toBe(i + 1);
      expect(typeof fm.step_name).toBe("string");
    }
  });

  it("Step 4 (lifecycle-intro) is skippable via orient_skipped flag and shows the current 11-phase lifecycle", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-04-lifecycle-intro.md"), "utf8");
    expect(raw).toMatch(/orient_skipped/);
    expect(raw).toMatch(/Phase 11\s*—\s*Evolve/);
  });

  it("Step 5 is the re-entry target (re_entry: allowed)", async () => {
    const raw = await readFile(
      join(skillDir, "steps", "step-05-material-solicitation.md"),
      "utf8",
    );
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.re_entry).toBe("allowed");
  });

  it("Step 5 references the wired doc utilities (Wave 3.6; docs toolbox post-WS5-B)", async () => {
    const raw = await readFile(
      join(skillDir, "steps", "step-05-material-solicitation.md"),
      "utf8",
    );
    // `index-docs` + `shard-doc` merged into the `docs` toolbox (op: index|shard) in WS5-B.
    expect(raw).toMatch(/op: index/);
    expect(raw).toMatch(/op: shard/);
  });

  it("Step 6 references repo-structure-audit for brownfield legacy scans", async () => {
    const raw = await readFile(
      join(skillDir, "steps", "step-06-shape-determination.md"),
      "utf8",
    );
    expect(raw).toMatch(/repo-structure-audit/);
  });

  it("Step 7 writes the seed context.md with the shape specified in the deep-dive", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-07-intent-seed.md"), "utf8");
    expect(raw).toMatch(/_context\/sacred\/context\.md/);
    expect(raw).toMatch(/status:\s*"seed"/);
    expect(raw).toMatch(/validate-schema/);
  });

  it("no step's operative instructions still invoke the removed `coldpress graph rebuild` CLI verb (WS0 §8 item 1)", async () => {
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(join(skillDir, "steps"));
    for (const file of files) {
      const raw = await readFile(join(skillDir, "steps", file), "utf8");
      expect(withoutChangelog(raw)).not.toMatch(/coldpress graph rebuild/);
    }
  });

  it("Step 11 (synthesize) promotes context.md to authored and routes change requests through sacred-change", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-11-synthesize.md"), "utf8");
    const body = withoutChangelog(raw);
    expect(body).toMatch(/status:\s*seed.*authored|authored.*seed/is);
    expect(body).toMatch(/sacred-change/);
    expect(body).not.toMatch(/governance\/context-change/);
  });

  it("Step 13's operative instructions hand off to Phase 2 research, not the deleted pre-project-interview", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-13-gate-and-route.md"), "utf8");
    const body = withoutChangelog(raw);
    expect(body).toMatch(/research/);
    expect(body).not.toMatch(/pre-project-interview/);
    // Canonical phase-handoff filename (WS10-B5 unified — was intake-to-phase2).
    expect(body).toMatch(/_context\/handoffs\/phase-1-to-2/);
    expect(body).toMatch(/evaluate-phase-gate/);
  });
});

describe("orphan utility frontmatter — Wave 3.6 wire-in markers (Part 1 baseline + Part 2 extensions)", () => {
  async function readFm(relPath: string): Promise<Record<string, unknown>> {
    const raw = await readFile(join(repoRoot, relPath), "utf8");
    return extractFrontmatter(raw) as Record<string, unknown>;
  }

  it("docs toolbox (merged index-docs + shard-doc + distillator) status includes wire-in-phase-1 and phases includes 1", async () => {
    const fm = await readFm("skills/utilities/docs/SKILL.md");
    expect(String(fm.status)).toMatch(/wire-in-phase-1/);
    expect(fm.phases).toEqual(expect.arrayContaining([1]));
  });

  it("repo-structure-audit status includes wire-in-phase-1 and phases includes 1 (Part 2 Wave 3.7 may also append wire-in-phase-2)", async () => {
    const fm = await readFm("skills/ops/repo-structure-audit/SKILL.md");
    expect(String(fm.status)).toMatch(/wire-in-phase-1/);
    expect(fm.phases).toEqual(expect.arrayContaining([1]));
  });
});
