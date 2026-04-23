/**
 * Claude Code → Roo/Kilo tool translation table.
 *
 * Roo/Kilo customMode definitions use "groups" rather than named tools:
 *   read     — read-only filesystem access (ls, cat, grep, glob analogues)
 *   edit     — write access (Edit/Write, with optional fileRegex restrictor)
 *   command  — shell execution (Bash)
 *   browser  — web fetch / search
 *   mcp      — Model Context Protocol tools
 *
 * A single Claude tool maps to exactly one Roo group; duplicates collapse.
 * Edit gets a permissive default fileRegex (`.*`) — individual subagents
 * can narrow it later via Cursor globs or agent-specific overrides.
 */

/** A Roo group is either a bare name or `[name, {fileRegex}]` for edit. */
export type RooGroup = string | [string, { fileRegex?: string; description?: string }];

const CLAUDE_TO_ROO: Record<string, string> = {
  // Read-only filesystem
  Read: "read",
  Grep: "read",
  Glob: "read",
  LS: "read",
  // Write access (collapsed into edit group — fileRegex applied separately)
  Edit: "edit",
  Write: "edit",
  MultiEdit: "edit",
  NotebookEdit: "edit",
  // Shell
  Bash: "command",
  // Web
  WebFetch: "browser",
  WebSearch: "browser",
  // MCP / Agent meta — treat as mcp group
  Task: "mcp",
  Agent: "mcp",
};

/**
 * Translate a Claude tool list into the groups array used by `.roomodes`.
 * Deduplicated. Unknown tools are silently skipped (the generator will
 * surface a warning at emission time via `unmappedClaudeTools`).
 */
export function claudeToolsToRooGroups(tools: string[]): RooGroup[] {
  const groups = new Set<string>();
  for (const tool of tools) {
    const base = tool.split(/[.__]/)[0] ?? tool;
    const group = CLAUDE_TO_ROO[tool] ?? CLAUDE_TO_ROO[base];
    if (!group) continue;
    groups.add(group);
  }

  return Array.from(groups).map((group): RooGroup =>
    group === "edit"
      ? ([group, { fileRegex: ".*", description: "files in the project tree" }] as const)
      : group,
  );
}

/**
 * Return Claude tool names that did not map to any Roo group. Caller can
 * surface these as warnings so users know coverage gaps exist.
 */
export function unmappedClaudeTools(tools: string[]): string[] {
  const unmapped: string[] = [];
  for (const tool of tools) {
    const base = tool.split(/[.__]/)[0] ?? tool;
    if (!CLAUDE_TO_ROO[tool] && !CLAUDE_TO_ROO[base]) unmapped.push(tool);
  }
  return unmapped;
}
