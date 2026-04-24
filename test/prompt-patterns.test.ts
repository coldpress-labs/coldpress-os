/**
 * §6.7 prompt-pattern regression test (Block II).
 *
 * Asserts the high-stakes skill set carries the required pattern
 * markers. Future additions to the set: update HIGH_STAKES_SKILLS +
 * run the test.
 *
 * We only assert what's cheap to check textually — presence of an
 * "## Output Contract" section, presence of "## ATTENTION" in
 * machine-parsed skills, Mermaid block reference in
 * diagram-forcing skills. Deeper correctness (are the imperatives
 * actually non-negotiable?) is a review concern, not a test concern.
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);

interface PatternAsserts {
  /** Must contain `## Output Contract` heading (Pattern 5). */
  outputContract: boolean;
  /** Must contain `## ATTENTION` heading (Pattern 2). */
  attention: boolean;
  /** Must contain a Mermaid forcing-function block reference (Pattern 3). */
  mermaidForcing: boolean;
}

interface HighStakesSkill {
  label: string;
  path: string;
  asserts: PatternAsserts;
}

const HIGH_STAKES_SKILLS: HighStakesSkill[] = [
  {
    label: "create-prd",
    path: "lifecycle/4-planning/create-prd/SKILL.md",
    asserts: {
      outputContract: true,
      attention: false, // PRD is prose-shaped; no ATTENTION preamble needed.
      mermaidForcing: false, // PRD is prose-shaped; no mandatory Mermaid.
    },
  },
  {
    label: "create-architecture",
    path: "lifecycle/4-planning/create-architecture/SKILL.md",
    asserts: {
      outputContract: true,
      attention: false, // Architecture is prose-shaped with tables, not machine-parsed.
      mermaidForcing: true, // Mandatory Component Interaction Diagram.
    },
  },
  {
    label: "parallelization-strategy",
    path: "lifecycle/5-breakdown/parallelization-strategy/SKILL.md",
    asserts: {
      outputContract: true,
      attention: true, // Wave table is parsed by sprint-planning.
      mermaidForcing: true, // Mandatory DAG.
    },
  },
];

describe("§6.7 prompt patterns — high-stakes skill coverage", () => {
  for (const skill of HIGH_STAKES_SKILLS) {
    describe(skill.label, () => {
      it(`has the required pattern markers per HIGH_STAKES_SKILLS spec`, async () => {
        const body = await readFile(join(repoRoot, skill.path), "utf8");

        if (skill.asserts.outputContract) {
          expect(body, `${skill.label}: Output Contract marker`).toMatch(
            /^## Output Contract\b/m,
          );
        }
        if (skill.asserts.attention) {
          expect(body, `${skill.label}: ATTENTION preamble`).toMatch(
            /^## ATTENTION\b/m,
          );
        }
        if (skill.asserts.mermaidForcing) {
          expect(body, `${skill.label}: Mermaid forcing-function block`).toMatch(
            /mermaid/i,
          );
          expect(body, `${skill.label}: mandatory diagram discipline`).toMatch(
            /mandatory|FORCING|forcing-function/,
          );
        }
      });

      it("references the prompt-patterns doc OR the snippet library", async () => {
        const body = await readFile(join(repoRoot, skill.path), "utf8");
        const cites =
          body.includes("docs/prompt-patterns.md") ||
          body.includes("templates/prompt-snippets/") ||
          body.includes("§6.7");
        expect(cites, `${skill.label} should reference §6.7 provenance`).toBe(
          true,
        );
      });
    });
  }
});

describe("prompt-snippets library", () => {
  const EXPECTED_SNIPPETS = [
    "attention-preamble.md",
    "forcing-function-mermaid.md",
    "forcing-function-table.md",
    "review-cot-triangle.md",
    "output-contract.md",
  ];

  it("ships all 5 canonical snippets", async () => {
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(join(repoRoot, "templates/prompt-snippets"));
    expect(files.sort()).toEqual([...EXPECTED_SNIPPETS].sort());
  });

  it("every snippet carries a coldpress-os HTML-comment provenance header", async () => {
    for (const snippet of EXPECTED_SNIPPETS) {
      const body = await readFile(
        join(repoRoot, "templates/prompt-snippets", snippet),
        "utf8",
      );
      expect(body, `${snippet}: starts with a <!-- comment marker`).toMatch(
        /^<!--/,
      );
      expect(body, `${snippet}: cites §6.7 source`).toContain("§6.7");
      expect(body, `${snippet}: cites docs/prompt-patterns.md`).toContain(
        "docs/prompt-patterns.md",
      );
    }
  });
});

describe("docs/prompt-patterns.md — self-consistency", () => {
  it("enumerates the 5 patterns AND lists every high-stakes skill", async () => {
    const body = await readFile(
      join(repoRoot, "docs/prompt-patterns.md"),
      "utf8",
    );
    // The five pattern sections.
    for (const heading of [
      "## Pattern 1 — Inline section-level meta-descriptions",
      "## Pattern 2 — \"ATTENTION\" preamble with numbered imperatives",
      "## Pattern 3 — Forcing-function artefacts",
      "## Pattern 4 — Tripartite code-review CoT scaffold",
      "## Pattern 5 — Closing \"Output Contract\" block",
    ]) {
      expect(body, `doc should contain: ${heading}`).toContain(heading);
    }
    // Applied-set table mentions each high-stakes skill by name.
    for (const skill of ["create-prd", "create-architecture", "parallelization-strategy"]) {
      expect(body, `applied-set should mention ${skill}`).toContain(skill);
    }
  });
});
