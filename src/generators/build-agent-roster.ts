/**
 * `build:roster` — regenerate `data/agents/agent-roster.csv` from the subagent
 * frontmatter (action plan §4.5, item ALL). The roster was hand-maintained and
 * stale; it is now a build output derived from `template/.claude/agents/*.md` and
 * drift-checked (`check:drift`). One source, generated view.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { packageRoot } from "../utils/paths.js";

const AGENTS_DIR = join(packageRoot, "template/.claude/agents");
const ROSTER_PATH = join(packageRoot, "data/agents/agent-roster.csv");

interface AgentFrontmatter {
  name?: string;
  description?: string;
  model?: string;
  tools?: string[];
}

function frontmatter(md: string): AgentFrontmatter {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return {};
  return (parseYaml(m[1]!) as AgentFrontmatter) ?? {};
}

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Build the roster CSV string from the agent files. */
export function buildAgentRoster(): string {
  const files = readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
  const rows: string[][] = [["name", "slug", "model", "tools", "description"]];
  for (const f of files) {
    const fm = frontmatter(readFileSync(join(AGENTS_DIR, f), "utf8"));
    const name = String(fm.name ?? f.replace(/\.md$/, ""));
    const tools = Array.isArray(fm.tools) ? fm.tools.join("|") : "";
    rows.push([name, name, String(fm.model ?? ""), tools, String(fm.description ?? "")]);
  }
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n";
}

// Run directly (via `tsx`): write the file.
const csv = buildAgentRoster();
writeFileSync(ROSTER_PATH, csv, "utf8");
process.stdout.write(`agent-roster.csv: ${csv.trim().split("\n").length - 1} agents\n`);
