/**
 * BMAD-import bridge (§5.3) — one-way inbound adapter.
 *
 * Input: a BMAD module directory (config.yaml + optional
 *   module-help.csv + agents/*.md + workflows/<name>/ + templates/).
 * Output: coldpress-os-shaped equivalents:
 *   - `.claude/agents/<slug>.md` — frontmatter + body
 *   - `skills/meta/bmad-imports/<module>/<workflow>/SKILL.md`
 *   - `authoring/imports/<module>/<name>.md` (with attribution header)
 *   - ATTRIBUTION.md listing what was imported + what was dropped.
 *
 * Explicit non-goal: full behavioural fidelity. The adapter is lossy;
 * outputs are coldpress-os-shaped approximations. BMAD's orchestration
 * runtime (message passing, task-file scripts) doesn't translate.
 *
 * Pure core: does not touch disk outside the caller-provided src/target
 * roots. No network.
 */

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

export interface ImportOptions {
  /** Absolute path to a BMAD module directory. */
  sourceDir: string;
  /** Absolute path to the target coldpress-os project root. */
  targetDir: string;
  /** Optional module slug override (default: from config.yaml or dirname). */
  moduleSlug?: string;
  /**
   * When true, overwrite existing files in the target. Default false — the
   * importer refuses to overwrite to protect existing project state.
   */
  overwrite?: boolean;
}

export interface ImportedAgent {
  source: string;
  target: string;
  name: string;
}

export interface ImportedSkill {
  source: string;
  target: string;
  name: string;
}

export interface ImportedTemplate {
  source: string;
  target: string;
  name: string;
}

export interface DroppedItem {
  path: string;
  reason: string;
}

export interface ImportReport {
  moduleSlug: string;
  moduleName?: string;
  moduleVersion?: string;
  agents: ImportedAgent[];
  skills: ImportedSkill[];
  templates: ImportedTemplate[];
  dropped: DroppedItem[];
  /** Path the ATTRIBUTION.md was written to. */
  attributionPath: string;
}

interface BmadConfig {
  id?: string;
  name?: string;
  version?: string;
  description?: string;
  license?: string;
  [k: string]: unknown;
}

const COLDPRESS_MANAGED_MARKER = "<!-- @coldpress-os:imported-from=bmad -->";

export async function importBmadModule(
  options: ImportOptions,
): Promise<ImportReport> {
  const src = resolve(options.sourceDir);
  const target = resolve(options.targetDir);

  const config = await readConfig(src);
  const moduleSlug =
    options.moduleSlug?.trim() ||
    slugify(config.id ?? config.name ?? basename(src));

  const dropped: DroppedItem[] = [];

  const agents = await importAgents(src, target, moduleSlug, dropped, options.overwrite === true);
  const skills = await importWorkflows(src, target, moduleSlug, dropped, options.overwrite === true);
  const templates = await importTemplates(src, target, moduleSlug, dropped, options.overwrite === true);

  const attributionPath = await writeAttribution(target, {
    moduleSlug,
    config,
    sourceDir: src,
    agents,
    skills,
    templates,
    dropped,
  });

  return {
    moduleSlug,
    moduleName: config.name,
    moduleVersion: config.version,
    agents,
    skills,
    templates,
    dropped,
    attributionPath,
  };
}

async function readConfig(src: string): Promise<BmadConfig> {
  const configPath = join(src, "config.yaml");
  try {
    const raw = await readFile(configPath, "utf8");
    const parsed = parseYaml(raw);
    if (parsed && typeof parsed === "object") return parsed as BmadConfig;
    return {};
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `Not a BMAD module — no config.yaml at ${configPath}. ` +
          `BMAD modules must have a config.yaml declaring id/name/version.`,
      );
    }
    throw err;
  }
}

/**
 * BMAD `agents/*.md` → coldpress-os `.claude/agents/<slug>.md`.
 * Strategy: keep the markdown body as-is (it's the persona); synthesise
 * frontmatter with sensible defaults; prepend the @coldpress-os:imported
 * marker + attribution banner.
 */
async function importAgents(
  src: string,
  target: string,
  moduleSlug: string,
  dropped: DroppedItem[],
  overwrite: boolean,
): Promise<ImportedAgent[]> {
  const agentsDir = join(src, "agents");
  if (!(await dirExists(agentsDir))) return [];

  const targetDir = join(target, ".claude/agents");
  await mkdir(targetDir, { recursive: true });

  const entries = await readdir(agentsDir, { withFileTypes: true });
  const results: ImportedAgent[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const srcPath = join(agentsDir, entry.name);
    const raw = await readFile(srcPath, "utf8");

    const stripped = stripBmadFrontmatter(raw);
    const slug = slugify(`bmad-${moduleSlug}-${entry.name.replace(/\.md$/, "")}`);
    const agentName = entry.name.replace(/\.md$/, "");

    const body = renderAgent({
      slug,
      agentName,
      moduleSlug,
      persona: stripped.body.trim(),
      bmadFrontmatter: stripped.frontmatter,
    });

    const targetPath = join(targetDir, `${slug}.md`);
    if (!overwrite && (await exists(targetPath))) {
      dropped.push({
        path: relative(target, targetPath),
        reason: "target exists; --overwrite not set",
      });
      continue;
    }
    await writeFile(targetPath, body, "utf8");
    results.push({
      source: relative(src, srcPath),
      target: relative(target, targetPath),
      name: slug,
    });
  }
  return results;
}

interface StrippedFrontmatter {
  frontmatter: string | undefined;
  body: string;
}

/**
 * Strip a leading `---\n…\n---` YAML frontmatter block if present.
 * Returns the raw frontmatter string + the body.
 */
function stripBmadFrontmatter(raw: string): StrippedFrontmatter {
  if (!raw.startsWith("---")) return { frontmatter: undefined, body: raw };
  const endIdx = raw.indexOf("\n---", 3);
  if (endIdx === -1) return { frontmatter: undefined, body: raw };
  return {
    frontmatter: raw.slice(3, endIdx).trim(),
    body: raw.slice(endIdx + 4).replace(/^\n/, ""),
  };
}

interface RenderAgentOptions {
  slug: string;
  agentName: string;
  moduleSlug: string;
  persona: string;
  bmadFrontmatter: string | undefined;
}

function renderAgent(opts: RenderAgentOptions): string {
  const frontmatter = [
    "---",
    `name: ${opts.slug}`,
    "model: sonnet",
    "tools:",
    "  - Read",
    "  - Grep",
    "  - Glob",
    "  - Bash",
    "  - Write",
    "  - Edit",
    "  - WebFetch",
    "  - WebSearch",
    "color: purple",
    "maxTurns: 20",
    "effort: medium",
    "---",
  ].join("\n");

  const banner = [
    `# ${opts.agentName} (imported from BMAD)`,
    "",
    COLDPRESS_MANAGED_MARKER,
    "",
    `> Imported from BMAD module \`${opts.moduleSlug}\` by \`coldpress import bmad\`.`,
    `> This is a lossy translation — BMAD runtime orchestration does not carry over. Review and tighten before use.`,
    "",
  ].join("\n");

  const bmadNote = opts.bmadFrontmatter
    ? ["", "<details><summary>Original BMAD frontmatter (preserved for reference)</summary>", "", "```yaml", opts.bmadFrontmatter, "```", "", "</details>", ""].join("\n")
    : "";

  return [frontmatter, "", banner, opts.persona, bmadNote].join("\n");
}

/**
 * BMAD `workflows/<name>/` → `skills/meta/bmad-imports/<module>/<workflow>/SKILL.md`.
 * Strategy: each workflow directory produces ONE skill. The workflow's
 * `workflow.yaml` (or similar) supplies metadata; step files are listed
 * in the Process section as opaque references (user must manually port
 * any step-level logic that matters — we don't fake it).
 */
async function importWorkflows(
  src: string,
  target: string,
  moduleSlug: string,
  dropped: DroppedItem[],
  overwrite: boolean,
): Promise<ImportedSkill[]> {
  const workflowsDir = join(src, "workflows");
  if (!(await dirExists(workflowsDir))) return [];

  const targetBase = join(target, "coldpress-os/skills/meta/bmad-imports", moduleSlug);
  await mkdir(targetBase, { recursive: true });

  const entries = await readdir(workflowsDir, { withFileTypes: true });
  const results: ImportedSkill[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const workflowDir = join(workflowsDir, entry.name);
    const workflowYaml = await readOptionalYaml(
      join(workflowDir, "workflow.yaml"),
    );
    const stepFiles = await listStepFiles(workflowDir);

    const skillSlug = slugify(entry.name);
    const skillDir = join(targetBase, skillSlug);
    await mkdir(skillDir, { recursive: true });

    const targetPath = join(skillDir, "SKILL.md");
    if (!overwrite && (await exists(targetPath))) {
      dropped.push({
        path: relative(target, targetPath),
        reason: "target exists; --overwrite not set",
      });
      continue;
    }

    const body = renderWorkflowSkill({
      skillSlug,
      moduleSlug,
      workflowName: entry.name,
      workflowMeta: workflowYaml,
      stepFiles: stepFiles.map((p) => relative(workflowDir, p)),
    });
    await writeFile(targetPath, body, "utf8");
    results.push({
      source: relative(src, workflowDir),
      target: relative(target, targetPath),
      name: skillSlug,
    });
  }
  return results;
}

interface RenderWorkflowOptions {
  skillSlug: string;
  moduleSlug: string;
  workflowName: string;
  workflowMeta: Record<string, unknown> | undefined;
  stepFiles: string[];
}

function renderWorkflowSkill(opts: RenderWorkflowOptions): string {
  const description =
    typeof opts.workflowMeta?.description === "string"
      ? opts.workflowMeta.description
      : `BMAD workflow \`${opts.workflowName}\` imported from module \`${opts.moduleSlug}\``;

  const frontmatter = [
    "---",
    `name: "${opts.skillSlug}"`,
    `description: "${escapeForYaml(description)}"`,
    'type: "simple"',
    'category: "meta"',
    'agent: "valet"',
    "phases: []",
    "tools:",
    "  - Read",
    "  - Bash",
    'inputs:',
    '  - "original BMAD workflow dir (reference only)"',
    'outputs:',
    '  - artifact: "import-shaped artefact"',
    '    location: "_context/planning/imports/{date}.md"',
    '    format: "markdown"',
    'version: "1.0"',
    "---",
  ].join("\n");

  const stepList = opts.stepFiles.length > 0
    ? opts.stepFiles.map((f) => `- \`${f}\``).join("\n")
    : "_(no step files detected — workflow directory was empty or contained only nested dirs)_";

  const metaDump = opts.workflowMeta
    ? ["", "### Original `workflow.yaml`", "", "```yaml", stringifyMeta(opts.workflowMeta), "```", ""].join("\n")
    : "";

  return [
    frontmatter,
    "",
    COLDPRESS_MANAGED_MARKER,
    "",
    `## Purpose`,
    "",
    description,
    "",
    `> **Imported from BMAD.** This skill is a structural placeholder generated by \`coldpress import bmad\`. The original BMAD step files are preserved below as opaque references — the adapter does not synthesise coldpress-os step logic from them. Port any step-level behaviour manually.`,
    "",
    `## When to Use`,
    "",
    `- When you need the behaviour BMAD's \`${opts.moduleSlug}/${opts.workflowName}\` workflow provided and have ported (or intend to port) the logic to coldpress-os-native form.`,
    "",
    `## Original BMAD step files`,
    "",
    stepList,
    metaDump,
    `## Migration notes`,
    "",
    `- BMAD's runtime orchestration (task-file dispatch, inter-agent message passing) does not translate. If a step depended on those, redesign it.`,
    `- Outputs should land under \`_context/\` per the coldpress-os canonical subfolder mapping — update this SKILL.md \`outputs[].location\` as you port.`,
    `- Remove the \`@coldpress-os:imported-from=bmad\` marker once you've hand-reviewed and finalised this skill.`,
    "",
    "---",
    "",
    "### Version Control",
    "",
    "| Version | Date | Author | Changes |",
    "|---------|------|--------|---------|",
    `| 1.0 | ${today()} | bmad-import | Auto-generated from BMAD workflow \`${opts.workflowName}\`. Lossy translation — review before use. |`,
    "",
  ].join("\n");
}

/**
 * BMAD `templates/` → `authoring/imports/<module>/`. Straight file copy
 * with an attribution header prepended to text files.
 */
async function importTemplates(
  src: string,
  target: string,
  moduleSlug: string,
  dropped: DroppedItem[],
  overwrite: boolean,
): Promise<ImportedTemplate[]> {
  const templatesDir = join(src, "templates");
  if (!(await dirExists(templatesDir))) return [];

  const targetBase = join(target, "coldpress-os/authoring/imports", moduleSlug);
  await mkdir(targetBase, { recursive: true });

  const results: ImportedTemplate[] = [];
  await walkAndCopy(templatesDir, targetBase, dropped, results, moduleSlug, target, overwrite);
  return results;
}

async function walkAndCopy(
  srcDir: string,
  targetDir: string,
  dropped: DroppedItem[],
  results: ImportedTemplate[],
  moduleSlug: string,
  targetRoot: string,
  overwrite: boolean,
): Promise<void> {
  const entries = await readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const s = join(srcDir, entry.name);
    const t = join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await mkdir(t, { recursive: true });
      await walkAndCopy(s, t, dropped, results, moduleSlug, targetRoot, overwrite);
    } else if (entry.isFile()) {
      if (!overwrite && (await exists(t))) {
        dropped.push({
          path: relative(targetRoot, t),
          reason: "target exists; --overwrite not set",
        });
        continue;
      }
      const ext = extname(entry.name).toLowerCase();
      const isText = [".md", ".markdown", ".txt", ".yaml", ".yml", ".json", ".csv"].includes(ext);
      if (isText) {
        const content = await readFile(s, "utf8");
        const header = textAttributionHeader(ext, moduleSlug, entry.name);
        await writeFile(t, header + content, "utf8");
      } else {
        const buf = await readFile(s);
        await writeFile(t, buf);
      }
      results.push({
        source: relative(dirname(dirname(srcDir)), s),
        target: relative(targetRoot, t),
        name: entry.name,
      });
    }
  }
}

function textAttributionHeader(ext: string, moduleSlug: string, filename: string): string {
  const marker = `@coldpress-os:imported-from=bmad module=${moduleSlug} file=${filename}`;
  if (ext === ".md" || ext === ".markdown") {
    return `<!-- ${marker} -->\n\n`;
  }
  if (ext === ".yaml" || ext === ".yml" || ext === ".csv" || ext === ".txt") {
    return `# ${marker}\n`;
  }
  if (ext === ".json") {
    // JSON has no comment syntax; skip the header rather than corrupt the file.
    return "";
  }
  return "";
}

interface AttributionInput {
  moduleSlug: string;
  config: BmadConfig;
  sourceDir: string;
  agents: ImportedAgent[];
  skills: ImportedSkill[];
  templates: ImportedTemplate[];
  dropped: DroppedItem[];
}

async function writeAttribution(
  targetDir: string,
  input: AttributionInput,
): Promise<string> {
  const attributionDir = join(
    targetDir,
    "coldpress-os/skills/meta/bmad-imports",
    input.moduleSlug,
  );
  await mkdir(attributionDir, { recursive: true });
  const path = join(attributionDir, "ATTRIBUTION.md");

  const body = [
    `# BMAD Import — ${input.config.name ?? input.moduleSlug}`,
    "",
    COLDPRESS_MANAGED_MARKER,
    "",
    `Imported from BMAD module \`${input.moduleSlug}\` on ${today()} via \`coldpress import bmad\`.`,
    "",
    "## Source",
    "",
    `- **Original path (at import time):** \`${input.sourceDir}\``,
    `- **Module id:** ${input.config.id ?? "(unset)"}`,
    `- **Module name:** ${input.config.name ?? "(unset)"}`,
    `- **Module version:** ${input.config.version ?? "(unset)"}`,
    `- **Module licence:** ${input.config.license ?? "(unstated — default to BMAD upstream terms; review before redistribution)"}`,
    "",
    "## What was imported",
    "",
    `### Agents (${input.agents.length})`,
    input.agents.length === 0
      ? "_None._"
      : input.agents.map((a) => `- \`${a.source}\` → \`${a.target}\``).join("\n"),
    "",
    `### Workflows as skills (${input.skills.length})`,
    input.skills.length === 0
      ? "_None._"
      : input.skills.map((s) => `- \`${s.source}\` → \`${s.target}\``).join("\n"),
    "",
    `### Templates (${input.templates.length})`,
    input.templates.length === 0
      ? "_None._"
      : input.templates.map((t) => `- \`${t.source}\` → \`${t.target}\``).join("\n"),
    "",
    "## What was dropped",
    "",
    input.dropped.length === 0
      ? "_Nothing dropped._"
      : input.dropped.map((d) => `- \`${d.path}\` — ${d.reason}`).join("\n"),
    "",
    "## Known non-translating concerns",
    "",
    "- **BMAD runtime orchestration** (task-file dispatch, inter-agent message passing) — coldpress-os uses a different dispatch model. Imported workflows are structural placeholders; port step-level behaviour manually.",
    "- **BMAD agent `<commands>` blocks** — coldpress-os agents don't have an equivalent named-command slot; use skills instead. Review each imported agent and refactor commands into skills.",
    "- **`module-help.csv`** — if present, not parsed into coldpress-os structure today. Reference the CSV when manually porting.",
    "",
    "## Licence note",
    "",
    "BMAD is an external framework with its own licence. Coldpress-os's `coldpress import bmad` only translates structure + prose; it does not re-licence the imported material. Review BMAD upstream terms before redistributing the imported artefacts.",
    "",
    "## Review checklist before committing",
    "",
    "- [ ] Review every imported agent in `.claude/agents/bmad-*.md`; tighten tools + model + persona.",
    "- [ ] Port each imported workflow from its BMAD step files into coldpress-os-native SKILL.md Process sections.",
    "- [ ] Verify imported templates conform to the coldpress-os template registry (see `TEMPLATES-REGISTRY.md`).",
    "- [ ] Remove the `@coldpress-os:imported-from=bmad` markers from any file you've finalised.",
    "- [ ] Decide whether this ATTRIBUTION.md stays in the tree for audit (recommended) or is archived once the imports are finalised.",
    "",
  ].join("\n");

  await writeFile(path, body, "utf8");
  return path;
}

async function readOptionalYaml(
  path: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = parseYaml(raw);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

async function listStepFiles(workflowDir: string): Promise<string[]> {
  const entries = await readdir(workflowDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name !== "workflow.yaml")
    .map((e) => join(workflowDir, e.name));
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function dirExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeForYaml(s: string): string {
  return s.replaceAll('"', '\\"').replaceAll("\n", " ");
}

function stringifyMeta(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v)}`)
    .join("\n");
}
