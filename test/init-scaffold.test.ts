import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initGitRepo } from "../src/utils/git-init";
import { installSecretScanHook } from "../src/utils/install-precommit-hook";
import { assertNoCollision, copyFramework, copyTemplate, slugify } from "../src/utils/scaffold";
import { generateWrappers } from "../src/utils/wrappers";
import { assertValidColdpressYaml } from "../src/utils/yaml-validator";

describe("scaffold helpers", () => {
  describe("slugify", () => {
    it("converts a human-readable name to kebab-case", () => {
      expect(slugify("My Awesome Project")).toBe("my-awesome-project");
      expect(slugify("  Trimmed  ")).toBe("trimmed");
      expect(slugify("Special!!!Chars")).toBe("special-chars");
      expect(slugify("Already-slugged")).toBe("already-slugged");
      expect(slugify("123 numbers ok")).toBe("123-numbers-ok");
    });

    it("strips leading and trailing hyphens", () => {
      expect(slugify("--stripped--")).toBe("stripped");
    });
  });
});

describe("end-to-end scaffold (template + framework + wrappers)", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-init-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("produces a complete consumer project structure", async () => {
    const targetDir = join(tmp, "test-project");

    await assertNoCollision(targetDir);

    await copyTemplate({
      projectName: "Test Project",
      slug: "test-project",
      userName: "Testy McTestface",
      targetDir,
    });
    await copyFramework(targetDir);
    const wrapperCount = await generateWrappers(targetDir);

    // Template files landed with filled values.
    const yaml = await readFile(join(targetDir, "coldpress.yaml"), "utf8");
    expect(yaml).toContain('name: "Test Project"');
    expect(yaml).toContain('slug: "test-project"');
    expect(yaml).toContain('name: "Testy McTestface"');
    expect(yaml).toContain('communication_language: "English"');

    const claude = await readFile(join(targetDir, "CLAUDE.md"), "utf8");
    expect(claude).toContain("Test Project");
    expect(claude).not.toContain("{project.name}");
    expect(claude).not.toContain("{Project Name}");
    // butler.display_name defaults to "Butler" when not supplied.
    expect(claude).not.toContain("{butler.display_name}");
    expect(claude).toContain("You are **Butler**");

    const system = await readFile(join(targetDir, ".claude/SYSTEM.md"), "utf8");
    expect(system).not.toContain("{butler.display_name}");
    expect(system).not.toContain("{project.name}");
    expect(system).toContain("**I am Butler.**");

    // Structural dirs from the template.
    const structural = [
      ".claude/SYSTEM.md",
      ".claude/agents/analyst.md",
      "_context/sacred/.gitkeep",
      "_input/assets/.gitkeep",
      "secure/manifest.yaml",
      "scripts/check-secrets.sh",
    ];
    for (const relPath of structural) {
      await expect(stat(join(targetDir, relPath))).resolves.toBeTruthy();
    }

    // Framework dirs copied under coldpress-os/.
    const frameworkProbes = [
      "coldpress-os/lifecycle/1-bootstrap",
      "coldpress-os/skills/reviews/code-review/SKILL.md",
      "coldpress-os/governance/sacred-docs.md",
      "coldpress-os/data/agents/agent-roster.csv",
    ];
    for (const relPath of frameworkProbes) {
      await expect(stat(join(targetDir, relPath))).resolves.toBeTruthy();
    }

    // Wrappers generated — reasonable floor + at least one known skill.
    expect(wrapperCount).toBeGreaterThan(40);
    const codeReviewWrapper = await readFile(
      join(targetDir, ".claude/skills/code-review/SKILL.md"),
      "utf8",
    );
    expect(codeReviewWrapper).toContain('name: "code-review"');
    expect(codeReviewWrapper).toContain("coldpress-os/skills/reviews/code-review/SKILL.md");
  });

  it("matches the full runInit flow — validator, git init, scaffold commit, pre-commit hook", async () => {
    const targetDir = join(tmp, "e2e-project");
    await copyTemplate({
      projectName: "E2E Project",
      slug: "e2e-project",
      userName: "Tester",
      targetDir,
    });

    // Generated yaml passes post-write validation (phase: init).
    const yamlSource = await readFile(join(targetDir, "coldpress.yaml"), "utf8");
    expect(() => assertValidColdpressYaml(yamlSource, { phase: "init" })).not.toThrow();

    await copyFramework(targetDir);
    await generateWrappers(targetDir);

    // Git repo initialised with a seed commit.
    const gitResult = await initGitRepo({ targetDir });
    expect(gitResult.status).toBe("initialised");
    expect(gitResult.committed).toBe(true);

    const log = spawnSync("git", ["log", "--oneline"], { cwd: targetDir, encoding: "utf8" });
    expect(log.stdout).toContain("chore: coldpress init scaffold");

    // Pre-commit hook installed + executable.
    const hookResult = await installSecretScanHook(targetDir);
    expect(hookResult.status).toBe("installed");

    const hookStat = await stat(join(targetDir, ".git", "hooks", "pre-commit"));
    expect(hookStat.mode & 0o100).toBeGreaterThan(0);

    // 5 _input/ subfolders each carry a README explaining purpose.
    for (const sub of ["assets", "vendor", "raw", "legacy", "reference"]) {
      const readme = await readFile(join(targetDir, "_input", sub, "README.md"), "utf8");
      expect(readme).toContain(`# \`_input/${sub}/\``);
    }

    // CLAUDE.md no longer pre-loads Phase-2/3 sacred-doc paths.
    const claude = await readFile(join(targetDir, "CLAUDE.md"), "utf8");
    expect(claude).not.toContain("_context/sacred/context.md");
    expect(claude).not.toContain("_context/sacred/tech-stack.md");
  });

  it("honours a custom butler display name in scaffolded files", async () => {
    const targetDir = join(tmp, "jeeves-project");
    await copyTemplate({
      projectName: "Jeeves Test",
      slug: "jeeves-test",
      userName: "Tester",
      targetDir,
      butlerDisplayName: "Jeeves",
    });

    const claude = await readFile(join(targetDir, "CLAUDE.md"), "utf8");
    expect(claude).toContain("You are **Jeeves**");
    expect(claude).toContain("**Name:** Jeeves");
    expect(claude).not.toContain("{butler.display_name}");

    const system = await readFile(join(targetDir, ".claude/SYSTEM.md"), "utf8");
    expect(system).toContain("**I am Jeeves.**");
    expect(system).toContain("Introduce yourself as Jeeves");
    expect(system).not.toContain("{butler.display_name}");
  });

  it("refuses to scaffold into a dir with an existing coldpress.yaml", async () => {
    const targetDir = join(tmp, "existing");
    await copyTemplate({
      projectName: "First Run",
      slug: "existing",
      userName: "Tester",
      targetDir,
    });

    await expect(assertNoCollision(targetDir)).rejects.toThrow(/coldpress\.yaml already exists/);
  });
});
