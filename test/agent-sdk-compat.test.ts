/**
 * Claude Agent SDK compatibility smoke test — §2.13.
 *
 * Coldpress-os declares that its `.claude/` tree (subagents + skills)
 * loads unchanged under both Claude Code CLI and `@anthropic-ai/claude-agent-sdk`.
 * This test enforces that declaration at the type + shape level:
 *
 *   1. TypeScript compile time: our `Agent` shape maps to the SDK's
 *      `AgentDefinition` type cleanly (the `toAgentDefinition` helper
 *      below will fail to type-check if the SDK ever changes a required
 *      field we don't emit).
 *   2. Runtime: every shipped template subagent produces a non-empty
 *      `AgentDefinition` with valid required fields.
 *
 * What this test does NOT do:
 *   - Actually spin up a session via `query()` or `startup()`. Those
 *     require live Anthropic credentials and network — inappropriate
 *     for a CI smoke test. They're validated out-of-band via
 *     interactive Claude Code usage, which is the dev-time runtime
 *     coldpress-os is already built against.
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentDefinition } from "@anthropic-ai/claude-agent-sdk";
import { describe, expect, it } from "vitest";
import type { Agent } from "../src/interop/agents";
import { parseAgentsDir } from "../src/interop/agents";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const templateAgentsDir = join(repoRoot, "template", ".claude", "agents");
const templateClaudeDir = join(repoRoot, "template", ".claude");

/**
 * Compile-time compat proof: the TypeScript type system verifies that
 * our `Agent` fields satisfy `AgentDefinition`'s requirements. If the
 * SDK ever removes a field we rely on, or adds a required field we
 * don't supply, `npm run typecheck` will fail here.
 */
function toAgentDefinition(agent: Agent): AgentDefinition {
  return {
    description: deriveDescription(agent),
    prompt: agent.systemPrompt,
    tools: agent.tools,
    model: agent.model,
    ...(agent.maxTurns !== undefined ? { maxTurns: agent.maxTurns } : {}),
  };
}

describe("Agent SDK compatibility — .claude/agents/", () => {
  it("every shipped subagent maps to a valid SDK AgentDefinition", async () => {
    const agents = await parseAgentsDir(templateAgentsDir);
    expect(agents.length).toBe(8); // v0.4 roster surgery (§4.5): 8 + Butler

    for (const agent of agents) {
      const def = toAgentDefinition(agent);

      // Required by AgentDefinition.
      expect(def.description).toBeTruthy();
      expect(def.description.length).toBeGreaterThan(0);
      expect(def.prompt).toBeTruthy();
      expect(def.prompt.length).toBeGreaterThan(0);

      // Optional-but-shipped fields: verify they're the right runtime shape.
      expect(Array.isArray(def.tools)).toBe(true);
      expect(typeof def.model).toBe("string");
    }
  });

  it("subagent tools match valid Claude Code tool names", async () => {
    const validTools = new Set([
      "Read", "Grep", "Glob", "LS",
      "Edit", "Write", "MultiEdit", "NotebookEdit",
      "Bash", "Task", "Agent",
      "WebFetch", "WebSearch",
    ]);
    const agents = await parseAgentsDir(templateAgentsDir);

    for (const agent of agents) {
      for (const tool of agent.tools) {
        // MCP tools come through with `mcp__` prefix — allow any such.
        if (tool.startsWith("mcp__")) continue;
        expect(validTools.has(tool), `${agent.name}: unknown tool "${tool}"`).toBe(true);
      }
    }
  });

  it("model values are valid Claude Code aliases", async () => {
    const validModels = new Set(["sonnet", "opus", "haiku", "inherit"]);
    const agents = await parseAgentsDir(templateAgentsDir);
    for (const agent of agents) {
      expect(validModels.has(agent.model), `${agent.name}: unknown model "${agent.model}"`).toBe(true);
    }
  });
});

describe("Agent SDK compatibility — .claude/ tree", () => {
  it("template .claude/ has SYSTEM.md and agents/", async () => {
    const entries = await readdir(templateClaudeDir);
    expect(entries).toContain("SYSTEM.md");
    expect(entries).toContain("agents");
  });

  it("SYSTEM.md exists and is non-empty", async () => {
    const content = await readFile(join(templateClaudeDir, "SYSTEM.md"), "utf8");
    expect(content.length).toBeGreaterThan(100);
  });

  it("no hooks directory ships — hooks are project-owned (not framework-owned)", async () => {
    // Coldpress-os does not ship hooks in the template. If this ever
    // changes (framework-level hooks), update the SDK smoke-test to
    // verify hook registration explicitly.
    const entries = await readdir(templateClaudeDir);
    expect(entries).not.toContain("hooks");
  });
});

function deriveDescription(agent: Agent): string {
  const firstNonHeaderLine = agent.systemPrompt
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#"));
  return firstNonHeaderLine ?? `The ${agent.name} subagent.`;
}
