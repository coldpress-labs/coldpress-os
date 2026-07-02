import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseAgentFile, parseAgentsDir } from "../src/interop/agents";
import { runInterop } from "../src/interop/index";
import { MANAGED_MARKER } from "../src/interop/managed";
import { claudeToolsToRooGroups, unmappedClaudeTools } from "../src/interop/tool-map";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const templateAgentsDir = join(repoRoot, "template", ".claude", "agents");

describe("parseAgentFile", () => {
  it("parses Claude Code subagent frontmatter", () => {
    const content = `---
name: analyst
model: sonnet
tools:
  - Read
  - Grep
  - Glob
  - Bash
color: blue
maxTurns: 20
effort: high
---

# Analyst

System prompt body here.
`;
    const agent = parseAgentFile(content, "/virtual/analyst.md");
    expect(agent).not.toBeNull();
    expect(agent!.name).toBe("analyst");
    expect(agent!.model).toBe("sonnet");
    expect(agent!.tools).toEqual(["Read", "Grep", "Glob", "Bash"]);
    expect(agent!.color).toBe("blue");
    expect(agent!.maxTurns).toBe(20);
    expect(agent!.effort).toBe("high");
    expect(agent!.systemPrompt).toContain("# Analyst");
    expect(agent!.systemPrompt).toContain("System prompt body here.");
  });

  it("returns null on input without frontmatter", () => {
    expect(parseAgentFile("# Just body\n", "/virtual/x.md")).toBeNull();
  });
});

describe("parseAgentsDir (against shipped template)", () => {
  it("parses the 11 subagents in the project template", async () => {
    const agents = await parseAgentsDir(templateAgentsDir);
    expect(agents.length).toBe(11);

    const slugs = agents.map((a) => a.name).sort();
    expect(slugs).toEqual(
      ["analyst", "architect", "communicator", "developer", "devops", "pm", "qa", "reviewer", "scrum-master", "ux-designer", "valet"].sort(),
    );

    // Every agent has a non-empty system prompt.
    for (const agent of agents) {
      expect(agent.systemPrompt.length).toBeGreaterThan(50);
      expect(agent.tools.length).toBeGreaterThan(0);
    }
  });
});

describe("tool-map", () => {
  it("translates Claude tools into Roo groups", () => {
    const groups = claudeToolsToRooGroups(["Read", "Grep", "Glob", "Bash", "Edit", "Write"]);
    const names = groups.map((g) => (Array.isArray(g) ? g[0] : g));
    expect(names).toContain("read");
    expect(names).toContain("edit");
    expect(names).toContain("command");

    // Edit group carries a fileRegex object.
    const edit = groups.find((g) => Array.isArray(g) && g[0] === "edit") as [string, { fileRegex: string }];
    expect(edit[1]).toMatchObject({ fileRegex: expect.any(String) });
  });

  it("dedupes read when multiple Claude read-tools are present", () => {
    const groups = claudeToolsToRooGroups(["Read", "Grep", "Glob", "LS"]);
    expect(groups.filter((g) => g === "read")).toHaveLength(1);
  });

  it("maps web tools to browser", () => {
    expect(claudeToolsToRooGroups(["WebFetch", "WebSearch"])).toContain("browser");
  });

  it("reports unmapped tools", () => {
    expect(unmappedClaudeTools(["Read", "SomeExoticTool"])).toEqual(["SomeExoticTool"]);
    expect(unmappedClaudeTools(["Read", "Edit"])).toEqual([]);
  });
});

describe("runInterop — full sweep against shipped template", () => {
  let tmp: string;
  let project: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-interop-"));
    project = join(tmp, "proj");
    await mkdir(project, { recursive: true });
    // Copy template/.claude/agents into tmpdir to exercise runInterop.
    await cp(templateAgentsDir, join(project, ".claude", "agents"), { recursive: true });
    // Minimal coldpress.yaml for AGENTS.md / Cline project-name lookup.
    await writeFile(
      join(project, "coldpress.yaml"),
      `project:\n  name: "Test Harness"\n  slug: "test-harness"\nuser:\n  name: "Tester"\n`,
      "utf8",
    );
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("emits all four format families plus legacy outputs", async () => {
    // set:"all" is explicit — the default is now "claude" (AGENTS.md only, §8
    // item 14); this test exercises full emission across every IDE target.
    const result = await runInterop({ targetDir: project, respectManagedMarker: false, set: "all" });

    expect(result.warnings).toEqual([]);
    expect(result.skipped).toEqual([]);

    // Count check — with 11 agents: 1 AGENTS.md + 11 .mdc + 1 .cursorrules +
    // 1 .roomodes + 11 openhands microagents + 2 .clinerules = 27 files.
    expect(result.files.length).toBe(27);

    // Each generated file bears the managed marker.
    for (const filePath of result.files) {
      const content = await readFile(filePath, "utf8");
      expect(content).toContain(MANAGED_MARKER);
    }

    // AGENTS.md contains project metadata and an agent table.
    const agentsMd = await readFile(join(project, "AGENTS.md"), "utf8");
    expect(agentsMd).toContain("Test Harness");
    expect(agentsMd).toContain("analyst");
    expect(agentsMd).toContain("architect");

    // .roomodes parses as YAML and has 11 customModes entries with expected shape.
    const roomodes = await readFile(join(project, ".roomodes"), "utf8");
    expect(roomodes).toContain("customModes:");
    expect(roomodes).toContain("slug: analyst");
    expect(roomodes).toContain("groups:");

    // .cursor/rules/<slug>.mdc exists for every agent.
    for (const slug of ["analyst", "architect", "qa"]) {
      const mdc = await readFile(join(project, ".cursor", "rules", `${slug}.mdc`), "utf8");
      expect(mdc).toContain("description:");
      expect(mdc).toContain("alwaysApply: false");
    }

    // .openhands/microagents frontmatter is correct.
    const analystMicro = await readFile(
      join(project, ".openhands", "microagents", "analyst.md"),
      "utf8",
    );
    expect(analystMicro).toContain("name: analyst");
    expect(analystMicro).toContain("type: repo");
    expect(analystMicro).toContain("agent: CodeActAgent");

    // .clinerules seed files present.
    const clineCtx = await readFile(
      join(project, ".clinerules", "00-project-context.md"),
      "utf8",
    );
    expect(clineCtx).toContain("Test Harness");

    const clineSacred = await readFile(
      join(project, ".clinerules", "10-sacred-docs.md"),
      "utf8",
    );
    expect(clineSacred).toContain("context-change");
    expect(clineSacred).toContain("_context/sacred/prd.md");
  });

  it("refuses to overwrite user-owned files when respectManagedMarker is on", async () => {
    const userAgentsMd = join(project, "AGENTS.md");
    await writeFile(userAgentsMd, "# My hand-written AGENTS.md — no managed marker here\n", "utf8");

    const result = await runInterop({ targetDir: project, respectManagedMarker: true });

    expect(result.skipped.map((s) => s.path)).toContain(userAgentsMd);

    const preserved = await readFile(userAgentsMd, "utf8");
    expect(preserved).toContain("hand-written");
  });

  it("overwrites files that carry the managed marker", async () => {
    // First run generates a marked AGENTS.md.
    await runInterop({ targetDir: project, respectManagedMarker: false });
    const before = await readFile(join(project, "AGENTS.md"), "utf8");
    expect(before).toContain(MANAGED_MARKER);

    // Change the project name — the second run should regenerate.
    await writeFile(
      join(project, "coldpress.yaml"),
      `project:\n  name: "Renamed"\n  slug: "renamed"\nuser:\n  name: "Tester"\n`,
      "utf8",
    );

    await runInterop({ targetDir: project, respectManagedMarker: true });

    const after = await readFile(join(project, "AGENTS.md"), "utf8");
    expect(after).toContain("Renamed");
    expect(after).not.toContain("Test Harness");
  });
});
