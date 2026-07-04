import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import type { RichFrontmatter, ValidationIssue } from "./skill-spec.js";
import {
  renderSpecFrontmatter,
  toSpecFrontmatter,
  validateBody,
  validateDescription,
  validateName,
} from "./skill-spec.js";

/**
 * Skill names that intentionally differ from their parent directory (WS11 S1.3).
 * The spec's default is name === parent-dir, but pack/lane sub-skills are
 * deliberately namespaced with their pack/lane prefix so their names are globally
 * unique across the plugin — a generic parent dir (`quickstart`, `audit`,
 * `build`, …) would otherwise collide (exactly the bug that silently dropped the
 * three stack-pack quickstarts before they were renamed `<pack>-quickstart`).
 * These are correct-by-design, so the name-parent-mismatch warning is suppressed
 * for them. Add a name here when a new pack/lane sub-skill is intentionally
 * namespaced; leave it off to let the warning catch accidental drift.
 */
const INTENTIONAL_NAME_MISMATCHES = new Set<string>([
  // stack-pack roots + quickstarts (dir `quickstart`, namespaced by pack)
  "browser-extension-pack",
  "browser-extension-quickstart",
  "cli-npm-publishable-quickstart",
  "vibe-coder-fullstack-quickstart",
  "static-single-page-quickstart",
  "static-multipage-blog-quickstart",
  // seo capability-pack sub-skills (dirs audit/content/local/schema/technical)
  "seo-audit",
  "seo-content",
  "seo-local",
  "seo-schema",
  "seo-technical",
  // lite-lane phase skills (dirs spec/build/verify/ship)
  "lite-spec",
  "lite-build",
  "lite-verify",
  "lite-ship",
]);

export interface SourceSkill {
  /** skill name — primary key in the emitted plugin */
  name: string;
  /** absolute source path */
  sourcePath: string;
  /** source path relative to package root — for diagnostics */
  sourceRel: string;
  /** parsed frontmatter */
  frontmatter: RichFrontmatter;
  /** markdown body after frontmatter (stripped of leading/trailing whitespace) */
  body: string;
  /** all issues raised during parsing */
  issues: ValidationIssue[];
}

export interface GenerateResult {
  /** skills successfully emitted */
  emitted: string[];
  /** skills skipped with reason */
  skipped: { source: string; reason: string }[];
  /** all warnings + errors across the corpus */
  issues: { source: string; issue: ValidationIssue }[];
}

const FRONTMATTER_BLOCK = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
const SCALAR_LINE = /^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/;
const LIST_ITEM = /^\s+-\s+(.*)$/;

export interface GenerateOptions {
  /** package root — where skills/ and lifecycle/ live */
  packageRoot: string;
  /** output directory root — typically <packageRoot>/plugin/skills */
  outputDir: string;
  /** if true, skip router-type skills (default true) */
  skipRouters?: boolean;
}

export async function generatePluginSkills(opts: GenerateOptions): Promise<GenerateResult> {
  const { packageRoot, outputDir, skipRouters = true } = opts;

  // Wipe the output dir so stale skills don't survive a rename.
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const sources: SourceSkill[] = [];
  for (const root of [join(packageRoot, "skills"), join(packageRoot, "lifecycle")]) {
    for await (const sourcePath of walkSkillFiles(root)) {
      const sourceRel = relative(packageRoot, sourcePath);
      const skill = await parseSkillFile(sourcePath, sourceRel);
      if (skill) sources.push(skill);
    }
  }

  const result: GenerateResult = { emitted: [], skipped: [], issues: [] };
  const emittedByName = new Map<string, SourceSkill>();

  for (const skill of sources) {
    if (skipRouters && skill.frontmatter.type === "router") {
      result.skipped.push({ source: skill.sourceRel, reason: "router" });
      continue;
    }

    // Validate name / description — errors here block emission.
    const nameIssues = validateName(skill.frontmatter.name ?? "");
    const descIssues = validateDescription(skill.frontmatter.description ?? "");
    const bodyIssues = validateBody(skill.body);

    const allIssues = [...skill.issues, ...nameIssues, ...descIssues, ...bodyIssues];
    for (const issue of allIssues) {
      result.issues.push({ source: skill.sourceRel, issue });
    }
    const fatal = allIssues.some((i) => i.severity === "error");
    if (fatal) {
      result.skipped.push({ source: skill.sourceRel, reason: "validation error" });
      continue;
    }

    const name = skill.frontmatter.name ?? "";
    const existing = emittedByName.get(name);
    if (existing) {
      // Dedupe — first-wins policy. `skills/` trees iterate before `lifecycle/`,
      // so canonical atomic skills shadow any duplicate in a lifecycle phase.
      result.skipped.push({
        source: skill.sourceRel,
        reason: `duplicate name (already emitted from ${existing.sourceRel})`,
      });
      continue;
    }
    emittedByName.set(name, skill);

    const emittedPath = await emitSkill(outputDir, skill);
    result.emitted.push(emittedPath);
  }

  return result;
}

async function emitSkill(outputDir: string, skill: SourceSkill): Promise<string> {
  const skillDir = join(outputDir, skill.frontmatter.name ?? "unnamed");
  await mkdir(skillDir, { recursive: true });

  // Bundle the FULL skill tree so plugin skills are self-contained + portable:
  // steps/, workflow.md, and any assets travel with the SKILL.md so references
  // like "via steps/" resolve relative to the plugin skill dir. Nested skills
  // (a subdir with its own SKILL.md — e.g. stack-pack sub-skills) are skipped;
  // they emit separately under their own name.
  const srcDir = dirname(skill.sourcePath);
  await copyTreeExcludingNestedSkills(srcDir, skillDir);

  // Overwrite the top-level SKILL.md with the spec-transformed frontmatter+body
  // (the verbatim copy from the tree walk is replaced here).
  const spec = toSpecFrontmatter(skill.frontmatter);
  const frontmatter = renderSpecFrontmatter(spec);
  const body = skill.body.trim();
  const content = `${frontmatter}\n\n${body}\n`;
  const emittedPath = join(skillDir, "SKILL.md");
  await writeFile(emittedPath, content, "utf8");
  return emittedPath;
}

/**
 * Recursively copy a source skill directory into the plugin, excluding the
 * top-level SKILL.md (written transformed by the caller) and any subdirectory
 * that is itself a skill (contains its own SKILL.md — emitted separately).
 */
async function copyTreeExcludingNestedSkills(srcDir: string, destDir: string): Promise<void> {
  const entries = await readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      // Skip nested skills — a subdir with its own SKILL.md emits on its own.
      if (await pathExists(join(srcPath, "SKILL.md"))) continue;
      await mkdir(destPath, { recursive: true });
      await copyTreeExcludingNestedSkills(srcPath, destPath);
    } else if (entry.isFile() && entry.name !== "SKILL.md") {
      await copyFile(srcPath, destPath);
    }
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function parseSkillFile(sourcePath: string, sourceRel: string): Promise<SourceSkill | null> {
  const content = await readFile(sourcePath, "utf8");
  const match = FRONTMATTER_BLOCK.exec(content);
  if (!match) return null;

  const block = match[1] ?? "";
  const body = (match[2] ?? "").trim();

  const frontmatter = parseRichFrontmatter(block);

  // If the parent directory name differs from the skill name, flag it —
  // the spec requires name = parent-dir-name.
  const parentDir = basename(dirname(sourcePath));
  const issues: ValidationIssue[] = [];
  if (
    frontmatter.name &&
    frontmatter.name !== parentDir &&
    !INTENTIONAL_NAME_MISMATCHES.has(frontmatter.name)
  ) {
    issues.push({
      severity: "warning",
      code: "name-parent-mismatch",
      message: `name "${frontmatter.name}" does not match parent dir "${parentDir}"`,
    });
  }

  return {
    name: frontmatter.name ?? parentDir,
    sourcePath,
    sourceRel,
    frontmatter,
    body,
    issues,
  };
}

function parseRichFrontmatter(block: string): RichFrontmatter {
  const result: RichFrontmatter = {};
  const lines = block.split("\n");
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trimEnd();

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
      // Inline scalar.
      const value = unquote(rest);
      switch (key) {
        case "name":
          result.name = value;
          break;
        case "description":
          result.description = value;
          break;
        case "type":
          result.type = value;
          break;
        case "category":
          result.category = value;
          break;
        case "agent":
          result.agent = value;
          break;
        case "version":
          result.version = value;
          break;
        case "context":
          result.context = value;
          break;
        case "disable-model-invocation":
          result.disableModelInvocation = value === "true";
          break;
        case "tools":
          // Inline array form: tools: ["Read", "Bash"] (multi-line handled below).
          result.tools = parseInlineArray(value);
          break;
        case "disallowed-tools":
          result.disallowedTools = parseInlineArray(value);
          break;
        case "phase": {
          const n = parseInt(value, 10);
          result.phase = Number.isFinite(n) ? n : value;
          break;
        }
        case "phases": {
          // Inline array: phases: [6] or phases: [4, 5]
          const arrayMatch = /^\[(.*)\]$/.exec(value);
          if (arrayMatch) {
            result.phases = arrayMatch[1]
              ?.split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => {
                const n = parseInt(s, 10);
                return Number.isFinite(n) ? n : s;
              });
          }
          break;
        }
      }
      i++;
      continue;
    }

    // Multi-line array.
    const items: string[] = [];
    i++;
    while (i < lines.length) {
      const next = lines[i] ?? "";
      const itemMatch = LIST_ITEM.exec(next);
      if (!itemMatch) break;
      items.push(unquote((itemMatch[1] ?? "").trim()));
      i++;
    }
    if (key === "tools") result.tools = items;
    else if (key === "disallowed-tools") result.disallowedTools = items;
    else if (key === "phases") {
      result.phases = items.map((s) => {
        const n = parseInt(s, 10);
        return Number.isFinite(n) ? n : s;
      });
    }
    // Other multi-line fields (inputs, outputs) are intentionally ignored —
    // the spec-compliant SKILL.md doesn't carry them.
  }

  return result;
}

/** Parse an inline YAML array — `["Read", "Bash"]` or `[Read, Bash]` — to strings. */
function parseInlineArray(value: string): string[] {
  const m = /^\[(.*)\]$/.exec(value.trim());
  if (!m) return [];
  return (m[1] ?? "")
    .split(",")
    .map((s) => unquote(s.trim()))
    .filter(Boolean);
}

async function* walkSkillFiles(root: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walkSkillFiles(path);
    } else if (entry.isFile() && entry.name === "SKILL.md") {
      yield path;
    }
  }
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
