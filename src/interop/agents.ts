import { readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";

export interface Agent {
  /** slug — matches filename without extension */
  name: string;
  /** model tier: sonnet | opus | haiku */
  model: string;
  /** Claude Code tool names, in declaration order */
  tools: string[];
  /** terminal display colour (optional) */
  color?: string;
  /** max autonomous turns (optional) */
  maxTurns?: number;
  /** reasoning effort level (optional) */
  effort?: string;
  /** markdown body — the agent's system prompt */
  systemPrompt: string;
  /** absolute path to source file (for diagnostics) */
  sourcePath: string;
}

const FRONTMATTER_BLOCK = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
const SCALAR_LINE = /^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/;
const LIST_ITEM = /^\s+-\s+(.*)$/;

export async function parseAgentsDir(agentsDir: string): Promise<Agent[]> {
  let entries: string[];
  try {
    entries = await readdir(agentsDir);
  } catch {
    return [];
  }

  const agents: Agent[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".md")) continue;
    const path = join(agentsDir, entry);
    const content = await readFile(path, "utf8");
    const agent = parseAgentFile(content, path);
    if (agent) agents.push(agent);
  }

  // Stable alphabetical order so generated outputs are reproducible.
  agents.sort((a, b) => a.name.localeCompare(b.name));
  return agents;
}

export function parseAgentFile(content: string, sourcePath: string): Agent | null {
  const match = FRONTMATTER_BLOCK.exec(content);
  if (!match) return null;

  const block = match[1] ?? "";
  const body = (match[2] ?? "").trim();

  const parsed = parseFrontmatterBlock(block);

  const name = parsed.scalars.name ?? basename(sourcePath, ".md");
  const model = parsed.scalars.model ?? "sonnet";
  const tools = parsed.arrays.tools ?? [];

  const agent: Agent = {
    name,
    model,
    tools,
    systemPrompt: body,
    sourcePath,
  };

  if (parsed.scalars.color) agent.color = parsed.scalars.color;
  if (parsed.scalars.effort) agent.effort = parsed.scalars.effort;
  if (parsed.scalars.maxTurns) {
    const n = parseInt(parsed.scalars.maxTurns, 10);
    if (Number.isFinite(n)) agent.maxTurns = n;
  }

  return agent;
}

interface ParsedFrontmatter {
  scalars: Record<string, string>;
  arrays: Record<string, string[]>;
}

function parseFrontmatterBlock(block: string): ParsedFrontmatter {
  const scalars: Record<string, string> = {};
  const arrays: Record<string, string[]> = {};

  const lines = block.split("\n");
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trimEnd();

    // Skip blank and continuation lines.
    if (!line || line.startsWith(" ") || line.startsWith("\t") || line.startsWith("-")) {
      i++;
      continue;
    }

    const m = SCALAR_LINE.exec(line);
    if (!m) {
      i++;
      continue;
    }

    const key = m[1] ?? "";
    const rest = (m[2] ?? "").trim();

    if (rest) {
      // Scalar value on the same line.
      scalars[key] = unquote(rest);
      i++;
      continue;
    }

    // Empty right-hand side — expect a YAML list on following indented lines.
    const items: string[] = [];
    i++;
    while (i < lines.length) {
      const next = lines[i] ?? "";
      const itemMatch = LIST_ITEM.exec(next);
      if (!itemMatch) break;
      items.push(unquote((itemMatch[1] ?? "").trim()));
      i++;
    }
    arrays[key] = items;
  }

  return { scalars, arrays };
}

function unquote(value: string): string {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}
