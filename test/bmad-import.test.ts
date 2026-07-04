/**
 * BMAD-import bridge tests (§5.3).
 *
 * Exercises importBmadModule against the hand-authored minimal fixture
 * at test/fixtures/bmad-minimal/. Covers:
 *   - happy-path round trip (agents + workflows + templates + attribution)
 *   - refuses to overwrite without --overwrite
 *   - slug override
 *   - dropped[] collects collisions when overwrite is false
 *   - error path when config.yaml is missing
 */

import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { importBmadModule, slugify } from "../src/imports/bmad";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(here, "fixtures/bmad-minimal");

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-bmad-import-"));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe("slugify", () => {
  it("lowercases, replaces non-alphanum with -, trims", () => {
    expect(slugify("My Demo Module!")).toBe("my-demo-module");
    expect(slugify("  leading and trailing  ")).toBe("leading-and-trailing");
    expect(slugify("bmad-method")).toBe("bmad-method");
  });
});

describe("importBmadModule — happy path", () => {
  it("imports agents + workflows + templates + attribution", async () => {
    const report = await importBmadModule({
      sourceDir: FIXTURE,
      targetDir: workDir,
    });

    expect(report.moduleSlug).toBe("demo-module");
    expect(report.moduleName).toBe("Demo Module");
    expect(report.moduleVersion).toBe("0.1.0");

    expect(report.agents).toHaveLength(2);
    expect(report.skills).toHaveLength(1);
    expect(report.templates).toHaveLength(1);
    expect(report.dropped).toEqual([]);
  });

  it("writes agents to .claude/agents/bmad-<module>-<name>.md", async () => {
    await importBmadModule({ sourceDir: FIXTURE, targetDir: workDir });

    const orchestratorPath = join(
      workDir,
      ".claude/agents/bmad-demo-module-orchestrator.md",
    );
    const body = await readFile(orchestratorPath, "utf8");

    expect(body).toMatch(/^---\nname: bmad-demo-module-orchestrator/m);
    expect(body).toMatch(/model: sonnet/);
    expect(body).toMatch(/tools:/);
    expect(body).toContain("@coldpress-os:imported-from=bmad");
    expect(body).toMatch(/You coordinate the demo workflow/);
    // Original BMAD frontmatter preserved in a details block.
    expect(body).toContain("Original BMAD frontmatter");
    expect(body).toContain("persona: \"Coordinator\"");
  });

  it("writes agent without BMAD frontmatter correctly", async () => {
    await importBmadModule({ sourceDir: FIXTURE, targetDir: workDir });

    const writerPath = join(
      workDir,
      ".claude/agents/bmad-demo-module-writer.md",
    );
    const body = await readFile(writerPath, "utf8");

    expect(body).toMatch(/^---\nname: bmad-demo-module-writer/m);
    expect(body).toMatch(/Clear prose, no jargon/);
    expect(body).not.toContain("Original BMAD frontmatter");
  });

  it("writes workflows as skills under coldpress-os/skills/meta/bmad-imports", async () => {
    await importBmadModule({ sourceDir: FIXTURE, targetDir: workDir });

    const skillPath = join(
      workDir,
      "coldpress-os/skills/meta/bmad-imports/demo-module/draft-demo/SKILL.md",
    );
    const body = await readFile(skillPath, "utf8");

    expect(body).toMatch(/^---/);
    expect(body).toMatch(/name: "draft-demo"/);
    expect(body).toMatch(/category: "meta"/);
    expect(body).toMatch(/agent: "valet"/);
    expect(body).toContain("@coldpress-os:imported-from=bmad");
    expect(body).toContain("Draft a demo artefact end-to-end");
    // All three step files listed.
    expect(body).toContain("01-gather.md");
    expect(body).toContain("02-draft.md");
    expect(body).toContain("03-review.md");
    // Original workflow.yaml preserved.
    expect(body).toMatch(/Original `workflow.yaml`/);
  });

  it("copies templates with attribution header", async () => {
    await importBmadModule({ sourceDir: FIXTURE, targetDir: workDir });

    const tmplPath = join(
      workDir,
      "coldpress-os/authoring/imports/demo-module/demo-artefact.md",
    );
    const body = await readFile(tmplPath, "utf8");

    expect(body).toMatch(
      /^<!-- @coldpress-os:imported-from=bmad module=demo-module file=demo-artefact\.md -->/,
    );
    expect(body).toContain("# Demo Artefact — {title}");
  });

  it("writes ATTRIBUTION.md listing everything", async () => {
    const report = await importBmadModule({
      sourceDir: FIXTURE,
      targetDir: workDir,
    });

    const body = await readFile(report.attributionPath, "utf8");
    expect(body).toMatch(/# BMAD Import — Demo Module/);
    expect(body).toContain("Module id:** demo-module");
    expect(body).toContain("Module version:** 0.1.0");
    expect(body).toContain("Module licence:** MIT");
    // Imported counts.
    expect(body).toMatch(/### Agents \(2\)/);
    expect(body).toMatch(/### Workflows as skills \(1\)/);
    expect(body).toMatch(/### Templates \(1\)/);
    expect(body).toContain("_Nothing dropped._");
    expect(body).toContain("Review checklist before committing");
  });
});

describe("importBmadModule — overwrite semantics", () => {
  it("refuses to overwrite existing files by default", async () => {
    // Pre-seed a conflict.
    await mkdir(join(workDir, ".claude/agents"), { recursive: true });
    await writeFile(
      join(workDir, ".claude/agents/bmad-demo-module-orchestrator.md"),
      "existing content",
      "utf8",
    );

    const report = await importBmadModule({
      sourceDir: FIXTURE,
      targetDir: workDir,
    });

    expect(report.agents).toHaveLength(1);
    expect(report.agents[0]!.name).toBe("bmad-demo-module-writer");
    expect(report.dropped.length).toBeGreaterThanOrEqual(1);

    const existing = await readFile(
      join(workDir, ".claude/agents/bmad-demo-module-orchestrator.md"),
      "utf8",
    );
    expect(existing).toBe("existing content");
  });

  it("overwrites when overwrite: true", async () => {
    await mkdir(join(workDir, ".claude/agents"), { recursive: true });
    await writeFile(
      join(workDir, ".claude/agents/bmad-demo-module-orchestrator.md"),
      "existing content",
      "utf8",
    );

    const report = await importBmadModule({
      sourceDir: FIXTURE,
      targetDir: workDir,
      overwrite: true,
    });

    expect(report.agents).toHaveLength(2);
    expect(report.dropped).toEqual([]);

    const body = await readFile(
      join(workDir, ".claude/agents/bmad-demo-module-orchestrator.md"),
      "utf8",
    );
    expect(body).toMatch(/name: bmad-demo-module-orchestrator/);
    expect(body).not.toBe("existing content");
  });
});

describe("importBmadModule — module slug override", () => {
  it("applies a custom slug", async () => {
    const report = await importBmadModule({
      sourceDir: FIXTURE,
      targetDir: workDir,
      moduleSlug: "custom-alias",
    });

    expect(report.moduleSlug).toBe("custom-alias");
    // Agents path uses the custom slug.
    expect(report.agents[0]!.target).toMatch(
      /\.claude\/agents\/bmad-custom-alias-/,
    );
    // Workflow path uses custom slug.
    expect(report.skills[0]!.target).toMatch(
      /bmad-imports\/custom-alias\/draft-demo\/SKILL\.md$/,
    );
  });
});

describe("importBmadModule — error paths", () => {
  it("throws when config.yaml is missing", async () => {
    const emptyModule = await mkdtemp(join(tmpdir(), "empty-bmad-"));
    try {
      await expect(
        importBmadModule({
          sourceDir: emptyModule,
          targetDir: workDir,
        }),
      ).rejects.toThrow(/Not a BMAD module/);
    } finally {
      await rm(emptyModule, { recursive: true, force: true });
    }
  });

  it("no agents dir → empty agents[], no crash", async () => {
    const minimalModule = await mkdtemp(join(tmpdir(), "minimal-bmad-"));
    try {
      await writeFile(
        join(minimalModule, "config.yaml"),
        'id: bare\nname: Bare\nversion: "0.0.1"\n',
        "utf8",
      );
      const report = await importBmadModule({
        sourceDir: minimalModule,
        targetDir: workDir,
      });
      expect(report.agents).toEqual([]);
      expect(report.skills).toEqual([]);
      expect(report.templates).toEqual([]);
    } finally {
      await rm(minimalModule, { recursive: true, force: true });
    }
  });
});
