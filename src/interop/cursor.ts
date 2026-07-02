import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Agent } from "./agents.js";
import { MANAGED_HEADER_MD } from "./managed.js";

export interface CursorInput {
  targetDir: string;
  agents: Agent[];
}

/**
 * Emit `.cursor/rules/<slug>.mdc` per subagent plus a legacy
 * `.cursorrules` file at the target root for older Cursor versions.
 */
export async function writeCursor({ targetDir, agents }: CursorInput): Promise<string[]> {
  const written: string[] = [];

  // Modern `.cursor/rules/*.mdc` — 2025 frontmatter schema.
  const rulesDir = join(targetDir, ".cursor", "rules");
  await mkdir(rulesDir, { recursive: true });
  for (const agent of agents) {
    const path = join(rulesDir, `${agent.name}.mdc`);
    await writeFile(path, buildMdc(agent), "utf8");
    written.push(path);
  }

  // Legacy `.cursorrules` — 15-20 lines pointing at CLAUDE.md + sacred docs.
  const legacyPath = join(targetDir, ".cursorrules");
  await writeFile(legacyPath, buildLegacyCursorrules(), "utf8");
  written.push(legacyPath);

  return written;
}

function buildMdc(agent: Agent): string {
  const description = firstSentence(agent.systemPrompt) || `The ${agent.name} subagent.`;
  const header = [
    "---",
    `description: "${yamlEscape(description)}"`,
    "alwaysApply: false",
    "---",
    "",
  ].join("\n");

  const body = [
    MANAGED_HEADER_MD,
    "",
    `# ${titleCase(agent.name)}`,
    "",
    `> Cursor rule generated from \`.claude/agents/${agent.name}.md\`. When this rule activates, follow its system prompt below.`,
    "",
    agent.systemPrompt,
    "",
  ].join("\n");

  return header + body;
}

function buildLegacyCursorrules(): string {
  return [
    MANAGED_HEADER_MD,
    "",
    "# coldpress-os project",
    "",
    "This project uses **coldpress-os** — an AI-native development framework.",
    "",
    "**Start here:** read `CLAUDE.md` for the project entry point and routing.",
    "",
    "**Sacred documents** (protected by governance workflows — do not edit directly):",
    "- `_context/sacred/context.md` — project context (Phase 2)",
    "- `_context/sacred/tech-stack.md` — locked tech stack (Phase 3)",
    "- `_context/sacred/prd.md` — product requirements (Phase 4)",
    "- `_context/sacred/architecture.md` — architecture doc (Phase 4)",
    "- `_context/sacred/pert-chart.md` — PERT chart / wave plan (Phase 5)",
    "",
    "Sacred-doc changes go through the `sacred-change` skill (enforced by the `sacred-guard` hook) — see `coldpress-os/governance/sacred-docs.md`.",
    "",
    "**Modern Cursor users:** `.cursor/rules/` holds one rule per subagent (see `.cursor/rules/*.mdc`).",
    "",
  ].join("\n");
}

function firstSentence(text: string): string {
  const match = text.match(/You are (?:the |an? )?([^.]+)\./);
  if (match) return `You are ${match[1]}.`;
  const firstLine = text.split("\n").find((l) => l.trim() && !l.startsWith("#"));
  return firstLine?.trim() ?? "";
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function yamlEscape(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
