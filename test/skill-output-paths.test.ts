/**
 * Regression test: every shipped SKILL.md writes its artefacts to one of
 * the 10 canonical `_context/*` subfolders (or `_input/.parsed/` for
 * document-ingest skills).
 *
 * Guards against subfolder drift — e.g., a new skill writing to
 * `_context/ops/` instead of `_context/operations/` or `_context/audit/`.
 * The canonical set is defined by `docs/phase-subfolder-mapping.md`; this
 * test is the automated enforcer.
 *
 * Shape A (v0.3.0-alpha) added two roots: `_context/operations/` for
 * Phase 9–10 deliverables (runbooks, observability configs) and
 * `_context/exports/` for cross-phase generator skills (pdf/docx/pptx/xlsx).
 */

import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

/** The 11 canonical top-level `_context/*` subfolders. */
const CANONICAL_CONTEXT_ROOTS = new Set([
  "_context/sacred/",
  "_context/planning/",
  "_context/design/",
  "_context/architecture/", // v0.4 WS4-E: P6 structured artifacts (api-contract, data-model, threat-model, security-registry, …)
  "_context/implementation/",
  "_context/testing/",
  "_context/tracking/",
  "_context/handoffs/",
  "_context/audit/",
  "_context/operations/",
  "_context/exports/",
]);

/** Non-`_context/` roots that are also legitimate SKILL output destinations. */
const OTHER_PERMITTED_ROOTS = new Set([
  "_input/.parsed/",
  "_input/raw/",
  "_input/reference/",
]);

interface ViolatingSkill {
  path: string;
  location: string;
}

async function* walkSkillMds(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkSkillMds(full);
    else if (entry.name === "SKILL.md") yield full;
  }
}

function extractLocations(content: string): string[] {
  // Match every `location: "..."` line under the frontmatter.
  const hits: string[] = [];
  const re = /^\s+location:\s*"([^"]+)"/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    const value = m[1];
    if (value) hits.push(value);
  }
  return hits;
}

function normalisedRoot(location: string): string {
  // Strip leading `./` if any.
  const cleaned = location.replace(/^\.\//, "");
  // Find the first two path segments — that's where the canonical root lives.
  const parts = cleaned.split("/");
  if (parts.length < 2) return cleaned;
  return `${parts[0]}/${parts[1]}/`;
}

function isPermitted(location: string): boolean {
  if (!location.startsWith("_context/") && !location.startsWith("_input/")) {
    // Other roots (e.g., `docs/...`, explicit user-chosen paths via template
    // interpolation like `{target-directory}/index.md`) are out of scope for
    // this audit.
    return true;
  }
  const root = normalisedRoot(location);
  return CANONICAL_CONTEXT_ROOTS.has(root) || OTHER_PERMITTED_ROOTS.has(root);
}

describe("SKILL.md output-path audit", () => {
  const skillsRoot = join(repoRoot, "skills");
  const lifecycleRoot = join(repoRoot, "lifecycle");

  it("every skill under skills/ writes to a canonical root", async () => {
    const violations: ViolatingSkill[] = [];
    for await (const path of walkSkillMds(skillsRoot)) {
      const content = await readFile(path, "utf8");
      for (const location of extractLocations(content)) {
        if (!isPermitted(location)) {
          violations.push({ path, location });
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("every skill under lifecycle/ writes to a canonical root", async () => {
    const violations: ViolatingSkill[] = [];
    for await (const path of walkSkillMds(lifecycleRoot)) {
      const content = await readFile(path, "utf8");
      for (const location of extractLocations(content)) {
        if (!isPermitted(location)) {
          violations.push({ path, location });
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("recognises all 10 canonical `_context/*` subfolders", () => {
    expect(CANONICAL_CONTEXT_ROOTS.size).toBe(10);
    for (const root of CANONICAL_CONTEXT_ROOTS) {
      expect(root.startsWith("_context/")).toBe(true);
      expect(root.endsWith("/")).toBe(true);
    }
  });

  it("isPermitted accepts nested paths under canonical roots", () => {
    expect(isPermitted("_context/audit/ops/security-scan-{date}.md")).toBe(true);
    expect(isPermitted("_context/planning/creative/brainstorm-{topic}.md")).toBe(true);
    expect(isPermitted("_context/audit/reviews/editorial-prose-{date}.md")).toBe(true);
  });

  it("isPermitted rejects top-level non-canonical `_context/*` subfolders", () => {
    expect(isPermitted("_context/ops/foo.md")).toBe(false);
    expect(isPermitted("_context/reviews/foo.md")).toBe(false);
    expect(isPermitted("_context/creative/foo.md")).toBe(false);
    expect(isPermitted("_context/meta/foo.md")).toBe(false);
  });

  it("isPermitted accepts ingest output paths under `_input/.parsed/`", () => {
    expect(isPermitted("_input/.parsed/brief.md")).toBe(true);
  });

  it("isPermitted allows fully-qualified non-context paths (e.g., doc-skill outputs into user-chosen dirs)", () => {
    // Some skills output to the target directory the user passes — these
    // aren't `_context/`-rooted and the audit correctly skips them.
    expect(isPermitted("docs/README.md")).toBe(true);
    expect(isPermitted("{target-directory}/index.md")).toBe(true);
  });
});
