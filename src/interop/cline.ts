import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { MANAGED_HEADER_MD } from "./managed.js";

export interface ClineInput {
  targetDir: string;
}

/**
 * Emit `.clinerules/00-project-context.md` and `.clinerules/10-sacred-docs.md`.
 * Cline (and Roo / Kilo for back-compat) reads these on session start to load
 * project context — similar role to `.cursorrules`.
 */
export async function writeCline({ targetDir }: ClineInput): Promise<string[]> {
  const dir = join(targetDir, ".clinerules");
  await mkdir(dir, { recursive: true });

  const projectName = await readProjectName(targetDir);

  const contextPath = join(dir, "00-project-context.md");
  await writeFile(contextPath, buildProjectContext(projectName), "utf8");

  const sacredPath = join(dir, "10-sacred-docs.md");
  await writeFile(sacredPath, buildSacredDocsNote(), "utf8");

  return [contextPath, sacredPath];
}

async function readProjectName(targetDir: string): Promise<string> {
  try {
    const yaml = await readFile(join(targetDir, "coldpress.yaml"), "utf8");
    return /^\s*name:\s*"([^"]*)"/m.exec(yaml)?.[1] ?? "this project";
  } catch {
    return "this project";
  }
}

function buildProjectContext(projectName: string): string {
  return [
    MANAGED_HEADER_MD,
    "",
    `# Project context — ${projectName}`,
    "",
    "This project uses **coldpress-os**, an 11-phase AI-native development framework (Shape A). Start by reading `CLAUDE.md` at the project root — it routes to the active subagent definitions under `.claude/agents/` and the framework skills under `coldpress-os/skills/` and `coldpress-os/lifecycle/`. Type `Hello Butler` to start (or resume) any session.",
    "",
    "## Key directories",
    "",
    "- `_context/sacred/` — sacred documents (protected; see `coldpress-os/governance/`).",
    "- `_context/{planning,design,implementation,testing,tracking,handoffs,audit}/` — produced artefacts.",
    "- `_input/{raw,legacy,reference,vendor,assets}/` — material fed into the project.",
    "- `secure/` — credential declarations (`manifest.yaml` tracked; `.env*` values ignored).",
    "- `.coldpress/` — runtime state (graph index, cache); git-ignored.",
    "",
    "## Modes / profiles",
    "",
    "Cline + Roo / Kilo users: for per-subagent modes see `.roomodes` (Roo / Kilo) or `.cursor/rules/*.mdc` (Cursor). Canonical source of truth is `.claude/agents/<name>.md`.",
    "",
  ].join("\n");
}

function buildSacredDocsNote(): string {
  return [
    MANAGED_HEADER_MD,
    "",
    "# Sacred documents — do not edit directly",
    "",
    "Five documents are protected by governance workflows. Any change must go through the corresponding workflow under `coldpress-os/governance/<doc>-change/workflow.md`.",
    "",
    "| Document | Location | Change workflow |",
    "|----------|----------|-----------------|",
    "| Context | `_context/sacred/context.md` | `coldpress-os/governance/context-change/workflow.md` |",
    "| Tech stack | `_context/sacred/tech-stack.md` | `coldpress-os/governance/tech-stack-change/workflow.md` |",
    "| PRD | `_context/sacred/prd.md` | `coldpress-os/governance/prd-change/workflow.md` |",
    "| Architecture | `_context/sacred/architecture.md` | `coldpress-os/governance/architecture-change/workflow.md` |",
    "| PERT chart | `_context/sacred/pert-chart.md` | `coldpress-os/governance/pert-change/workflow.md` |",
    "",
    "If you need to change a sacred doc, do not edit in place — invoke the change workflow via Butler or your active subagent.",
    "",
  ].join("\n");
}
