import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { frameworkDirs, frameworkFiles, packageRoot, templateDir } from "./paths.js";

export interface ScaffoldOptions {
  projectName: string;
  slug: string;
  userName: string;
  targetDir: string;
  butlerDisplayName?: string;
  /** Retrofit onto an existing repo — do not clobber files that already exist. */
  retrofit?: boolean;
  /** IDE preferences to persist in coldpress.yaml. Matches the interop set chosen at init. */
  preferredIdes?: string[];
  /** Ceremony lane (§6). Default `lite` — the structural default. */
  lane?: "lite" | "full";
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
  const { targetDir, retrofit } = opts;

  await mkdir(targetDir, { recursive: true });

  // Track pre-existing files so retrofit mode can skip placeholder fills
  // on user-owned content (e.g., an existing CLAUDE.md at repo root).
  const claudePath = join(targetDir, "CLAUDE.md");
  const claudePreExisted = retrofit === true && (await exists(claudePath));

  // fs.cp with a filter to skip .DS_Store noise. In retrofit mode, pass
  // force: false so we layer on existing files rather than clobbering.
  await cp(templateDir, targetDir, {
    recursive: true,
    force: retrofit === true ? false : true,
    errorOnExist: false,
    filter: (source) => !source.endsWith(".DS_Store"),
  });

  // Overwrite coldpress.yaml with filled Phase-1 values. (The collision
  // check guarantees this file did not exist before, even in retrofit mode.)
  await writeFile(join(targetDir, "coldpress.yaml"), buildYaml(opts), "utf8");

  // Seed .coldpress/state.yaml — the orchestration spine the load-state /
  // phase-gate hooks route off (schemas/state.schema.ts). Lite lane starts at
  // Spec; the full lane starts at Phase 1. enforcement on, tier T0 by default.
  await writeState(opts);

  // Fill placeholders in files that address the user / the agent by name.
  // Both CLAUDE.md and .claude/SYSTEM.md contain self-references that honour
  // the user's chosen {butler.display_name} and project/user identity.
  // In retrofit mode, skip CLAUDE.md if it pre-existed — user content wins.
  const fillTargets = [".claude/SYSTEM.md"];
  if (!claudePreExisted) fillTargets.unshift("CLAUDE.md");
  for (const relPath of fillTargets) {
    const absPath = join(targetDir, relPath);
    if (!(await exists(absPath))) continue;
    const source = await readFile(absPath, "utf8");
    await writeFile(absPath, fillPlaceholders(source, opts), "utf8");
  }
}

export async function copyFramework(targetDir: string): Promise<void> {
  const frameworkTarget = join(targetDir, "coldpress-os");
  await mkdir(frameworkTarget, { recursive: true });

  const copyOpts = {
    recursive: true,
    filter: (source: string) => {
      // Skip .DS_Store noise.
      //
      // NOTE: do NOT add a blanket `/node_modules/` filter here. When the
      // package is installed via npm/npx, `packageRoot` itself resolves to
      // something like `~/.npm/_npx/<hash>/node_modules/@coldpress/core`,
      // so a path-includes check would reject EVERY source under it and
      // silently skip the entire framework copy. The `frameworkDirs`
      // whitelist (lifecycle / skills / governance / data / agents /
      // templates / docs) is what scopes the copy — no real need for an
      // exclusion list inside those whitelisted trees.
      if (source.endsWith(".DS_Store")) return false;
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
  const butlerDisplayName = opts.butlerDisplayName ?? "Butler";
  const preferredIdesBlock =
    opts.preferredIdes && opts.preferredIdes.length > 0
      ? `  preferred_ides:\n${opts.preferredIdes.map((ide) => `    - ${yamlString(ide)}`).join("\n")}\n`
      : "";
  const retrofitBlock = opts.retrofit === true ? "\nretrofit: true\n" : "";
  return `# coldpress.yaml — Project Configuration
#
# This is the ONLY config file coldpress-os reads from your project.
#
# Phase-1 fields (below) split by when they're filled:
#   * project.* and user.{name, languages, preferred_ides} — filled at
#     project init by \`coldpress init\`.
#   * butler.display_name — defaulted here; overwritten by Butler during
#     Phase-1 \`intake\` if the user customises.
# All other fields are written by their owning phase as the lifecycle
# progresses; the framework writes back to this file as each phase
# completes. See docs/coldpress-yaml-schema.md for the full schema and
# per-field phase ownership.

# ─── Lane ──────────────────────────────────────────────────────────
# Ceremony lane: lite (default — Spec/Build/Verify/Ship) or full (11 phases).
# The lane changes ceremony, never safety. \`coldpress lane-upgrade\` back-fills
# the full-lane sacred docs from lite artifacts without data loss.
lane: ${opts.lane ?? "lite"}

# ─── Project Identity ──────────────────────────────────────────────
project:
  name: ${yamlString(opts.projectName)}
  slug: ${yamlString(opts.slug)}

# ─── User ──────────────────────────────────────────────────────────
user:
  name: ${yamlString(opts.userName)}
  communication_language: "English"
  document_output_language: "English"
${preferredIdesBlock}
# ─── Butler ────────────────────────────────────────────────────────
# Optional. Filled during Phase-1 intake; defaults apply if unset.
# Framework-internal role is always "Butler" regardless of display_name.
butler:
  display_name: ${yamlString(butlerDisplayName)}
${retrofitBlock}`;
}

/** Seed `.coldpress/state.yaml` with the initial orchestration state. */
async function writeState(opts: ScaffoldOptions): Promise<void> {
  const lane = opts.lane ?? "lite";
  const phase = lane === "full" ? "1" : "spec";
  const dir = join(opts.targetDir, ".coldpress");
  await mkdir(dir, { recursive: true });
  const body = [
    "# .coldpress/state.yaml — orchestration state (written by Butler + phase-exit hooks).",
    "# The single source of routing truth; the load-state hook injects a summary each session.",
    `lane: ${lane}`,
    `phase: ${phase}`,
    "phase_status: entering",
    "security_tier: T0",
    "enforcement: on",
    "iteration: 0",
    "gates: {}",
    "active_stories: []",
    "deltas_open: {}",
    "deploy: {}",
    "",
  ].join("\n");
  await writeFile(join(dir, "state.yaml"), body, "utf8");
}

function fillPlaceholders(template: string, opts: ScaffoldOptions): string {
  const butlerDisplayName = opts.butlerDisplayName ?? "Butler";
  return template
    .replaceAll("{Project Name}", opts.projectName)
    .replaceAll("{project.name}", opts.projectName)
    .replaceAll("{project.slug}", opts.slug)
    .replaceAll("{user.name}", opts.userName)
    .replaceAll("{butler.display_name}", butlerDisplayName);
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
