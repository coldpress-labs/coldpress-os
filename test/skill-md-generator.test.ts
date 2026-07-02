import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generatePluginSkills } from "../src/generators/skill-md-generator";
import {
  MAX_BODY_LINES,
  MAX_DESCRIPTION_LEN,
  MAX_NAME_LEN,
  SKILL_NAME_RE,
  buildCompatibility,
  renderSpecFrontmatter,
  toSpecFrontmatter,
  validateBody,
  validateDescription,
  validateName,
} from "../src/generators/skill-spec";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

describe("skill-spec validators", () => {
  it("accepts well-formed names", () => {
    expect(validateName("code-review")).toEqual([]);
    expect(validateName("a")).toEqual([]);
    expect(validateName("dev-story")).toEqual([]);
  });

  it("rejects empty, overlength, or mis-formatted names", () => {
    expect(validateName("")).toMatchObject([{ code: "name-empty" }]);
    expect(validateName("Code-Review")).toMatchObject([{ code: "name-format" }]);
    expect(validateName("code_review")).toMatchObject([{ code: "name-format" }]);
    expect(validateName("a".repeat(MAX_NAME_LEN + 1)).length).toBeGreaterThan(0);
  });

  it("rejects empty or overlength descriptions", () => {
    expect(validateDescription("")).toMatchObject([{ code: "description-empty" }]);
    expect(validateDescription("a".repeat(MAX_DESCRIPTION_LEN + 1))).toMatchObject([
      { code: "description-too-long" },
    ]);
    expect(validateDescription("Short and fine.")).toEqual([]);
  });

  it("warns (not errors) on overly-long bodies", () => {
    const longBody = Array.from({ length: MAX_BODY_LINES + 10 }, (_, i) => `line ${i}`).join("\n");
    const issues = validateBody(longBody);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ severity: "warning", code: "body-too-long" });
    expect(validateBody("short body")).toEqual([]);
  });
});

describe("buildCompatibility", () => {
  it("renders agent + phase when both present", () => {
    expect(buildCompatibility({ agent: "scrum-master", phase: 8 })).toBe(
      "Invoked by @scrum-master in Phase 8",
    );
  });

  it("falls back to phase-only or agent-only", () => {
    expect(buildCompatibility({ phase: 6 })).toBe("Phase 6");
    expect(buildCompatibility({ agent: "architect" })).toBe("Invoked by @architect");
  });

  it("prefers phase over phases[0] but falls back to phases[0]", () => {
    expect(buildCompatibility({ agent: "qa", phases: [6] })).toBe(
      "Invoked by @qa in Phase 6",
    );
  });

  it("reports reusable when neither is present", () => {
    expect(buildCompatibility({})).toBe("Reusable across phases");
  });
});

describe("toSpecFrontmatter", () => {
  it("maps rich frontmatter into the spec shape", () => {
    const spec = toSpecFrontmatter({
      name: "code-review",
      description: "Review code changes with parallel review layers",
      agent: "developer",
      phases: [6],
      version: "1.0",
    });
    expect(spec).toMatchObject({
      name: "code-review",
      description: "Review code changes with parallel review layers",
      license: "MIT",
      compatibility: "Invoked by @developer in Phase 6",
      version: "1.0",
    });
  });

  it("includes allowed-tools as space-separated when tools are set", () => {
    const spec = toSpecFrontmatter({
      name: "runner",
      description: "Runs things",
      tools: ["Read", "Bash"],
    });
    expect(spec["allowed-tools"]).toBe("Read Bash");
  });

  it("omits allowed-tools when tools are absent", () => {
    const spec = toSpecFrontmatter({ name: "x", description: "y" });
    expect(spec["allowed-tools"]).toBeUndefined();
  });
});

describe("renderSpecFrontmatter", () => {
  it("emits deterministic YAML-ish frontmatter", () => {
    const out = renderSpecFrontmatter({
      name: "code-review",
      description: "A review",
      license: "MIT",
      compatibility: "Phase 6",
      version: "1.0",
    });
    expect(out).toBe(
      [
        "---",
        "name: code-review",
        "description: A review",
        "license: MIT",
        "compatibility: Phase 6",
        'version: "1.0"',
        "---",
      ].join("\n"),
    );
  });

  it("quotes descriptions containing special chars", () => {
    const out = renderSpecFrontmatter({
      name: "x",
      description: 'Contains: a colon and "quotes"',
      license: "MIT",
    });
    expect(out).toContain('description: "Contains: a colon and \\"quotes\\""');
  });
});

describe("modern frontmatter fields (WS5-D)", () => {
  it("emits context: fork and the fork agent only when context is fork", () => {
    expect(toSpecFrontmatter({ name: "x", description: "y", context: "fork", agent: "reviewer" })).toMatchObject(
      { context: "fork", agent: "reviewer" },
    );
    // agent without fork drives compatibility prose, NOT a spec `agent:` field.
    const noFork = toSpecFrontmatter({ name: "x", description: "y", agent: "pm" });
    expect(noFork.context).toBeUndefined();
    expect(noFork.agent).toBeUndefined();
    // fork without an explicit agent omits agent (Claude Code defaults to general-purpose).
    expect(toSpecFrontmatter({ name: "x", description: "y", context: "fork" }).agent).toBeUndefined();
  });

  it("emits disable-model-invocation only when true", () => {
    expect(
      toSpecFrontmatter({ name: "x", description: "y", disableModelInvocation: true })["disable-model-invocation"],
    ).toBe(true);
    expect(
      toSpecFrontmatter({ name: "x", description: "y" })["disable-model-invocation"],
    ).toBeUndefined();
  });

  it("maps disallowed-tools to a space-separated string", () => {
    expect(
      toSpecFrontmatter({ name: "x", description: "y", disallowedTools: ["Bash", "WebFetch"] })["disallowed-tools"],
    ).toBe("Bash WebFetch");
  });

  it("renders the modern fields in the frontmatter block", () => {
    const out = renderSpecFrontmatter({
      name: "adversarial-review",
      description: "A review",
      license: "MIT",
      context: "fork",
      "disable-model-invocation": true,
    });
    expect(out).toContain("context: fork");
    expect(out).toContain("disable-model-invocation: true");
  });
});

describe("SKILL_NAME_RE", () => {
  it("matches only lowercase + hyphens, starting with a letter", () => {
    expect(SKILL_NAME_RE.test("abc")).toBe(true);
    expect(SKILL_NAME_RE.test("a-b")).toBe(true);
    expect(SKILL_NAME_RE.test("a1-b2")).toBe(true);
    expect(SKILL_NAME_RE.test("-abc")).toBe(false);
    expect(SKILL_NAME_RE.test("1abc")).toBe(false);
    expect(SKILL_NAME_RE.test("Abc")).toBe(false);
    expect(SKILL_NAME_RE.test("a_b")).toBe(false);
  });
});

describe("generatePluginSkills end-to-end against shipped corpus", () => {
  let tmp: string;
  let outputDir: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-gen-"));
    outputDir = join(tmp, "plugin", "skills");
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("emits >70 skills with zero errors against the shipped skill corpus", async () => {
    const result = await generatePluginSkills({
      packageRoot: repoRoot,
      outputDir,
    });

    const errors = result.issues.filter((x) => x.issue.severity === "error");
    expect(errors).toEqual([]);

    expect(result.emitted.length).toBeGreaterThan(70);

    // Any skip carries a known reason. (The 21 `type: router` stubs were deleted
    // in v0.4 WS5-B — plugin discovery replaces routing — so there are no longer
    // routers to skip; the generator still skips dedupe/other cases cleanly.)
    for (const s of result.skipped) {
      expect(typeof s.reason).toBe("string");
      expect(s.reason.length).toBeGreaterThan(0);
    }
  });

  it("every emitted SKILL.md has spec-compliant frontmatter", async () => {
    const result = await generatePluginSkills({
      packageRoot: repoRoot,
      outputDir,
    });

    // Spot-check a subset to keep runtime reasonable.
    const sample = result.emitted.slice(0, 5);
    for (const path of sample) {
      const content = await readFile(path, "utf8");
      expect(content).toMatch(/^---\nname: [a-z][a-z0-9-]*\n/);
      expect(content).toContain("license: MIT");
      expect(content).toMatch(/compatibility:/);
    }
  });

  it("dedupes by name — first-wins", async () => {
    // Craft a synthetic corpus where two skills share a name.
    const root = join(tmp, "synthetic");
    await mkdir(join(root, "skills", "a", "same-name"), { recursive: true });
    await mkdir(join(root, "lifecycle", "1-bootstrap", "same-name"), { recursive: true });

    const frontmatter = `---\nname: "same-name"\ndescription: "first copy"\nversion: "1.0"\n---\n\nBody A\n`;
    const frontmatterB = `---\nname: "same-name"\ndescription: "second copy"\nversion: "1.0"\n---\n\nBody B\n`;
    await writeFile(join(root, "skills", "a", "same-name", "SKILL.md"), frontmatter);
    await writeFile(join(root, "lifecycle", "1-bootstrap", "same-name", "SKILL.md"), frontmatterB);

    const result = await generatePluginSkills({
      packageRoot: root,
      outputDir: join(tmp, "out"),
    });

    expect(result.emitted).toHaveLength(1);
    const duplicateSkip = result.skipped.find((s) => s.reason.startsWith("duplicate"));
    expect(duplicateSkip).toBeDefined();

    // The emitted copy should be from skills/, not lifecycle/ (first-wins via iteration order).
    const emittedContent = await readFile(result.emitted[0]!, "utf8");
    expect(emittedContent).toContain("first copy");
    expect(emittedContent).not.toContain("second copy");
  });

  it("wipes stale skills from the output dir on each run", async () => {
    // Seed a stale skill in the output dir.
    await mkdir(join(outputDir, "stale-skill"), { recursive: true });
    await writeFile(join(outputDir, "stale-skill", "SKILL.md"), "should be removed\n");

    await generatePluginSkills({ packageRoot: repoRoot, outputDir });

    const remaining = await readdir(outputDir);
    expect(remaining).not.toContain("stale-skill");
  });
});
