import { basename, join, resolve } from "node:path";
import { cancel, confirm, intro, isCancel, outro, spinner, text } from "@clack/prompts";
import { readFile } from "node:fs/promises";
import pc from "picocolors";
import {
  INTEROP_SETS,
  type InteropSet,
  preferredIdesFor,
  runInterop,
} from "../interop/index.js";
import { initGitRepo } from "../utils/git-init.js";
import { installSecretScanHook } from "../utils/install-precommit-hook.js";
import { packageRoot } from "../utils/paths.js";
import { recordInit as recordInitInRegistry } from "../utils/registry.js";
import { assertNoCollision, copyFramework, copyTemplate, slugify } from "../utils/scaffold.js";
import { assertValidColdpressYaml } from "../utils/yaml-validator.js";
import { runDoctor } from "./doctor.js";

export interface InitInput {
  /** Positional project name argument. Equivalent to --name when present. */
  projectNameArg?: string;
  /** Non-interactive mode — skip all prompts. Requires --name / --slug / --user or positional arg. */
  yes?: boolean;
  /** Override project name (used with --yes). */
  name?: string;
  /** Override slug (used with --yes). */
  slug?: string;
  /** Override user name (used with --yes). */
  user?: string;
  /** Retrofit onto an existing repo — targetDir is cwd, not cwd/slug. */
  retrofit?: boolean;
  /** Filter interop outputs. Default: "claude" (AGENTS.md only; cursor/roo/openhands/cline are opt-in via --interop). */
  interop?: InteropSet;
  /** Skip `git init` + seed commit. */
  noGitInit?: boolean;
  /** Skip the pre-flight `coldpress doctor` check. */
  skipDoctor?: boolean;
  /** Ceremony lane (§6). Default `lite`. */
  lane?: "lite" | "full";
}

export interface ResolvedInitInputs {
  projectName: string;
  slug: string;
  userName: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Resolve the required project/slug/user inputs for non-interactive init.
 * Pure — no I/O, no process.exit — so it can be unit-tested. Returns a
 * list of user-facing errors; callers decide how to surface them.
 *
 * When `yes` is false, this function is a no-op (returns `null`) because
 * interactive flows should use the clack-driven gather helpers instead.
 */
export function resolveNonInteractiveInputs(
  input: InitInput,
): { ok: true; resolved: ResolvedInitInputs } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const name = (input.name ?? input.projectNameArg ?? "").trim();
  if (!name) {
    errors.push("--yes requires --name (or a positional project name argument)");
  }

  const rawUser = (input.user ?? "").trim();
  if (!rawUser) {
    errors.push("--yes requires --user");
  }

  const retrofit = input.retrofit === true;
  const suggestedSlug = retrofit
    ? slugify(basename(process.cwd()))
    : name
      ? slugify(name)
      : "";
  const rawSlug = (input.slug ?? suggestedSlug).trim();
  if (!rawSlug) {
    errors.push("--yes requires --slug (could not infer kebab-case slug from inputs)");
  } else if (!SLUG_PATTERN.test(rawSlug)) {
    errors.push(`--slug must be lowercase kebab-case, got "${rawSlug}"`);
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    resolved: { projectName: name, slug: rawSlug, userName: rawUser },
  };
}

export async function runInit(input: InitInput): Promise<void> {
  const yes = input.yes === true;
  const retrofit = input.retrofit === true;
  // Default: AGENTS.md only (§8 item 14). Extra IDE targets are opt-in via
  // --interop (cursor|roo|openhands|cline|all). A coldpress.yaml `interop:`
  // list persisting the choice arrives with the coldpress.yaml schema (WS1/WS3).
  const interopSet: InteropSet = input.interop ?? "claude";

  if (!INTEROP_SETS.includes(interopSet)) {
    console.error(
      pc.red(`✗ Invalid --interop value: ${interopSet}. Must be one of ${INTEROP_SETS.join("|")}`),
    );
    process.exit(1);
  }

  intro(pc.bgCyan(pc.black(" coldpress init ")));

  // ─── Pre-flight doctor ────────────────────────────────────────
  if (input.skipDoctor !== true) {
    const doctor = await runDoctor({ silent: true });
    if (doctor.exitCode === 1) {
      const errors = doctor.suite.results.filter((r) => r.severity === "error");
      console.log(pc.red("✗ Environment not ready:"));
      for (const r of errors) {
        console.log(pc.red(`  ✗ ${r.label} — ${r.detail ?? ""}`));
        if (r.remedy) console.log(pc.dim(`      → ${r.remedy}`));
      }
      console.log(pc.dim("  (use --skip-doctor to bypass this check)"));
      cancel("init aborted");
      process.exit(1);
    }
    if (doctor.exitCode === 2) {
      const warnings = doctor.suite.results.filter((r) => r.severity === "warning");
      console.log(pc.yellow(`⚠ doctor: ${warnings.length} warning(s) — run \`coldpress doctor --verbose\` for details`));
    }
  }

  // ─── Gather inputs ────────────────────────────────────────────
  let projectName: string;
  let slug: string;
  let userName: string;
  if (yes) {
    const resolved = resolveNonInteractiveInputs(input);
    if (!resolved.ok) {
      for (const err of resolved.errors) console.error(pc.red(`✗ ${err}`));
      process.exit(1);
    }
    ({ projectName, slug, userName } = resolved.resolved);
  } else {
    projectName = await gatherProjectName(input.name ?? input.projectNameArg, false);
    const slugSuggested = retrofit ? slugify(basename(process.cwd())) : slugify(projectName);
    slug = await gatherSlug(input.slug, slugSuggested, false);
    userName = await gatherUserName(input.user, false);
  }
  const targetDir = retrofit ? resolve(process.cwd()) : resolve(process.cwd(), slug);

  // ─── Confirm (interactive only) ───────────────────────────────
  if (!yes) {
    const confirmed = await confirm({
      message: retrofit
        ? `Layer coldpress-os onto ${pc.cyan(targetDir)}?`
        : `Scaffold ${pc.cyan(projectName)} in ${pc.dim(targetDir)}?`,
      initialValue: true,
    });
    if (isCancel(confirmed) || !confirmed) {
      cancel("init cancelled");
      process.exit(0);
    }
  }

  // ─── Collision check ──────────────────────────────────────────
  // Even in retrofit, the three coldpress-specific paths must not exist
  // (otherwise we'd overwrite another coldpress-os install).
  try {
    await assertNoCollision(targetDir);
  } catch (err) {
    cancel(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  // ─── Execute ──────────────────────────────────────────────────
  const s = spinner();
  s.start(retrofit ? "Layering template onto existing repo" : "Scaffolding project template");
  try {
    await copyTemplate({
      projectName,
      slug,
      userName,
      targetDir,
      retrofit,
      preferredIdes: preferredIdesFor(interopSet),
      lane: input.lane ?? "lite",
    });

    // Post-write validation — catches template corruption or substitution bugs
    // before the project lands.
    const writtenYaml = await readFile(join(targetDir, "coldpress.yaml"), "utf8");
    assertValidColdpressYaml(writtenYaml, { phase: "init" });

    s.message("Copying coldpress-os framework + skill plugin");
    await copyFramework(targetDir);

    s.message(interopMessage(interopSet));
    const interop = await runInterop({
      targetDir,
      respectManagedMarker: false,
      set: interopSet,
    });

    s.stop(
      `${pc.green("✓")} coldpress-os skill plugin bundled + ${interop.files.length} interop files (${interopSet})`,
    );

    for (const warning of interop.warnings) {
      console.log(pc.yellow(`  ⚠ ${warning}`));
    }

    // Seed the project as a git repo so the user has a clean baseline.
    if (input.noGitInit !== true) {
      const gitResult = await initGitRepo({ targetDir });
      if (gitResult.warning) {
        console.log(pc.yellow(`  ⚠ ${gitResult.warning}`));
      } else if (gitResult.status === "initialised" && gitResult.committed) {
        console.log(pc.dim(`  ↳ git repo initialised with scaffold commit`));
      } else if (gitResult.status === "already-present") {
        console.log(pc.dim(`  ↳ existing git repo preserved (no re-init)`));
      }

      if (gitResult.status === "initialised" || gitResult.status === "already-present") {
        const hookResult = await installSecretScanHook(targetDir);
        if (hookResult.warning) {
          console.log(pc.yellow(`  ⚠ ${hookResult.warning}`));
        } else if (hookResult.status === "installed") {
          console.log(pc.dim(`  ↳ pre-commit secret-scan hook installed`));
        }
      }
    }

    // Record the init in ~/.coldpress/registry.json (courtesy — never blocks).
    const version = await resolveCoreVersion();
    const recordResult = await recordInitInRegistry({
      slug,
      path: targetDir,
      created: new Date().toISOString(),
      version,
    });
    if (recordResult === "failed") {
      console.log(pc.yellow("  ⚠ Could not update ~/.coldpress/registry.json (continuing anyway)"));
    }
  } catch (err) {
    s.stop(pc.red(`✗ Scaffolding failed: ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }

  // ─── Done ─────────────────────────────────────────────────────
  const nextSteps = retrofit
    ? `Ready. Your existing repo now has coldpress-os layered on. Next:\n` +
      `  ${pc.cyan("claude")}   ${pc.dim("# open Claude Code in this project")}`
    : `Ready. Next steps:\n` +
      `  ${pc.cyan(`cd ${slug}`)}\n` +
      `  ${pc.cyan("claude")}   ${pc.dim("# open Claude Code in the project")}`;
  outro(
    `${nextSteps}\n\n` +
      `${pc.dim("The coldpress-os skill plugin auto-enables when you trust the folder in Claude Code —")}\n` +
      `${pc.dim("no manual /plugin install needed. Then type `Hello Butler` to begin.")}\n\n` +
      `${pc.dim("If anything surprised you during init, run `coldpress feedback` — first impressions help.")}`,
  );
}

function interopMessage(set: InteropSet): string {
  if (set === "none" || set === "claude") return "Generating AGENTS.md";
  if (set === "all") return "Generating interop outputs (AGENTS.md, Cursor, Roo, OpenHands, Cline)";
  return `Generating interop outputs (${set})`;
}

async function resolveCoreVersion(): Promise<string> {
  try {
    const raw = await readFile(join(packageRoot, "package.json"), "utf8");
    const pkg = JSON.parse(raw) as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

// ─── Input gatherers (interactive / non-interactive hybrid) ──────────

async function gatherProjectName(
  preset: string | undefined,
  yes: boolean,
): Promise<string> {
  if (preset && preset.trim()) return preset.trim();
  if (yes) {
    console.error(pc.red("✗ --yes requires --name (or a positional project name argument)"));
    process.exit(1);
  }
  const answer = await text({
    message: "What's your project called?",
    placeholder: "My Awesome Project",
    validate: (value) => (value.trim() ? undefined : "Project name is required"),
  });
  if (isCancel(answer)) {
    cancel("init cancelled");
    process.exit(0);
  }
  return answer.trim();
}

async function gatherSlug(
  preset: string | undefined,
  suggested: string,
  yes: boolean,
): Promise<string> {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (preset !== undefined && preset.trim()) {
    if (!slugPattern.test(preset.trim())) {
      console.error(pc.red(`✗ --slug must be lowercase kebab-case, got "${preset}"`));
      process.exit(1);
    }
    return preset.trim();
  }
  if (yes) {
    // Non-interactive with no --slug: infer from suggested, and validate.
    if (!slugPattern.test(suggested)) {
      console.error(pc.red(`✗ --yes requires --slug (could not infer kebab-case slug from inputs)`));
      process.exit(1);
    }
    return suggested;
  }
  const answer = await text({
    message: "Project slug (kebab-case, used for directory name)?",
    initialValue: suggested,
    validate: (value) => {
      if (!value.trim()) return "Slug is required";
      if (!slugPattern.test(value.trim())) {
        return "Slug must be lowercase kebab-case (letters, digits, hyphens)";
      }
      return undefined;
    },
  });
  if (isCancel(answer)) {
    cancel("init cancelled");
    process.exit(0);
  }
  return answer.trim();
}

async function gatherUserName(preset: string | undefined, yes: boolean): Promise<string> {
  if (preset && preset.trim()) return preset.trim();
  if (yes) {
    console.error(pc.red("✗ --yes requires --user"));
    process.exit(1);
  }
  const answer = await text({
    message: "Your name (used in Butler's prose)?",
    placeholder: "Aastha",
    validate: (value) => (value.trim() ? undefined : "User name is required"),
  });
  if (isCancel(answer)) {
    cancel("init cancelled");
    process.exit(0);
  }
  return answer.trim();
}
