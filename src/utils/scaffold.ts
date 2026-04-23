import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { frameworkDirs, frameworkFiles, packageRoot, templateDir } from "./paths.js";

export interface ScaffoldOptions {
  projectName: string;
  slug: string;
  userName: string;
  targetDir: string;
}

export async function assertNoCollision(targetDir: string): Promise<void> {
  const blockers = ["coldpress.yaml", "coldpress-os", ".claude"];
  for (const blocker of blockers) {
    if (await exists(join(targetDir, blocker))) {
      throw new Error(
        `${blocker} already exists at ${targetDir}. Refusing to overwrite. ` +
          `Remove it or choose a different directory.`,
      );
    }
  }
}

export async function copyTemplate(opts: ScaffoldOptions): Promise<void> {
  const { targetDir } = opts;

  await mkdir(targetDir, { recursive: true });

  // fs.cp with a filter to skip .DS_Store noise.
  await cp(templateDir, targetDir, {
    recursive: true,
    filter: (source) => !source.endsWith(".DS_Store"),
  });

  // Overwrite coldpress.yaml with filled Phase-1 values.
  await writeFile(join(targetDir, "coldpress.yaml"), buildYaml(opts), "utf8");

  // Fill CLAUDE.md placeholders.
  const claudePath = join(targetDir, "CLAUDE.md");
  const claudeTemplate = await readFile(claudePath, "utf8");
  await writeFile(claudePath, fillClaude(claudeTemplate, opts), "utf8");
}

export async function copyFramework(targetDir: string): Promise<void> {
  const frameworkTarget = join(targetDir, "coldpress-os");
  await mkdir(frameworkTarget, { recursive: true });

  const copyOpts = {
    recursive: true,
    filter: (source: string) => {
      // Skip .DS_Store and the heavy dist/ + node_modules/ + test/ trees.
      if (source.endsWith(".DS_Store")) return false;
      if (source.includes("/node_modules/")) return false;
      return true;
    },
  };

  for (const dir of frameworkDirs) {
    const src = join(packageRoot, dir);
    if (!(await exists(src))) continue;
    await cp(src, join(frameworkTarget, dir), copyOpts);
  }

  for (const file of frameworkFiles) {
    const src = join(packageRoot, file);
    if (!(await exists(src))) continue;
    await cp(src, join(frameworkTarget, file));
  }
}

function buildYaml(opts: ScaffoldOptions): string {
  return `# coldpress.yaml — Project Configuration
#
# This is the ONLY config file coldpress-os reads from your project.
#
# Phase-1 fields (below) are filled at project init — by the user or
# the \`project-init\` workflow. All other fields are written by their
# owning phase as the lifecycle progresses; the framework writes back
# to this file as each phase completes. See docs/coldpress-yaml-schema.md
# for the full schema and per-field phase ownership.

# ─── Project Identity ──────────────────────────────────────────────
project:
  name: ${yamlString(opts.projectName)}
  slug: ${yamlString(opts.slug)}

# ─── User ──────────────────────────────────────────────────────────
user:
  name: ${yamlString(opts.userName)}
  communication_language: "English"
  document_output_language: "English"
`;
}

function fillClaude(template: string, opts: ScaffoldOptions): string {
  return template
    .replaceAll("{Project Name}", opts.projectName)
    .replaceAll("{project.name}", opts.projectName)
    .replaceAll("{project.slug}", opts.slug)
    .replaceAll("{user.name}", opts.userName);
}

function yamlString(value: string): string {
  // Double-quote + escape backslashes and embedded quotes.
  const escaped = value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${escaped}"`;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
