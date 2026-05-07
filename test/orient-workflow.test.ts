/**
 * Structural verification for the Phase 1 `orient` skill (Wave 3.1).
 * Ensures the skill files exist with valid frontmatter and the step
 * sequence matches the workflow index. Runtime behaviour is conversational
 * — Butler executes the steps — so this suite verifies the contract
 * (shape, references, outputs), not the dialogue itself.
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const skillDir = join(repoRoot, "lifecycle", "1-bootstrap", "orient");

function parseFm(source: string): Record<string, unknown> {
  const m = /^---\s*\n([\s\S]*?)\n---/.exec(source);
  if (!m) return {};
  return (parseYaml(m[1] ?? "") as Record<string, unknown>) ?? {};
}

const extractFrontmatter = parseFm;

describe("orient skill — structure", () => {
  it("SKILL.md has valid frontmatter with expected lifecycle fields", async () => {
    const raw = await readFile(join(skillDir, "SKILL.md"), "utf8");
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.name).toBe("orient");
    expect(fm.type).toBe("workflow");
    expect(fm.phase).toBe(1);
    expect(fm.agent).toBe("butler");
    expect(fm.next_skill).toBe("intake");
  });

  it("workflow.md references exactly 4 steps", async () => {
    const raw = await readFile(join(skillDir, "workflow.md"), "utf8");
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    expect(fm.total_steps).toBe(4);
  });

  it("all 4 step files exist and carry the expected step_number", async () => {
    const stepNames = [
      "step-01-mode-detect.md",
      "step-02-greeting.md",
      "step-03-sanity-check.md",
      "step-04-lifecycle-intro.md",
    ];
    for (let i = 0; i < stepNames.length; i++) {
      const raw = await readFile(join(skillDir, "steps", stepNames[i]!), "utf8");
      const fm = extractFrontmatter(raw) as Record<string, unknown>;
      expect(fm.step_number).toBe(i + 1);
      expect(typeof fm.step_name).toBe("string");
    }
  });

  it("SKILL.md advertises an orient-{date}.md tracking output", async () => {
    const raw = await readFile(join(skillDir, "SKILL.md"), "utf8");
    const fm = extractFrontmatter(raw) as Record<string, unknown>;
    const outputs = fm.outputs as Array<{ location?: string }>;
    expect(outputs?.[0]?.location).toMatch(/_context\/tracking\/orient-\{date\}\.md/);
  });

  it("Step 1 (mode-detect) handles the graph-rebuild retry prompt", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-01-mode-detect.md"), "utf8");
    expect(raw).toMatch(/needs_graph_rebuild/);
    expect(raw).toMatch(/graph_rebuild_error/);
  });

  it("Step 4 (lifecycle-intro) is skippable via orient_skipped flag", async () => {
    const raw = await readFile(join(skillDir, "steps", "step-04-lifecycle-intro.md"), "utf8");
    expect(raw).toMatch(/orient_skipped/);
  });
});
