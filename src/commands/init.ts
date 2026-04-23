import { resolve } from "node:path";
import { cancel, confirm, intro, isCancel, outro, spinner, text } from "@clack/prompts";
import pc from "picocolors";
import { assertNoCollision, copyFramework, copyTemplate, slugify } from "../utils/scaffold.js";
import { generateWrappers } from "../utils/wrappers.js";

export interface InitInput {
  projectNameArg?: string;
}

export async function runInit({ projectNameArg }: InitInput): Promise<void> {
  intro(pc.bgCyan(pc.black(" coldpress init ")));

  // ─── Gather ───────────────────────────────────────────────────
  const projectName = await gatherProjectName(projectNameArg);
  const slug = await gatherSlug(slugify(projectName));
  const userName = await gatherUserName();
  const targetDir = resolve(process.cwd(), slug);

  // ─── Confirm ──────────────────────────────────────────────────
  const confirmed = await confirm({
    message: `Scaffold ${pc.cyan(projectName)} in ${pc.dim(targetDir)}?`,
    initialValue: true,
  });
  if (isCancel(confirmed) || !confirmed) {
    cancel("init cancelled");
    process.exit(0);
  }

  // ─── Collision check ──────────────────────────────────────────
  try {
    await assertNoCollision(targetDir);
  } catch (err) {
    cancel(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  // ─── Execute ──────────────────────────────────────────────────
  const s = spinner();
  s.start("Scaffolding project template");
  try {
    await copyTemplate({ projectName, slug, userName, targetDir });

    s.message("Copying coldpress-os framework");
    await copyFramework(targetDir);

    s.message("Generating skill wrappers");
    const wrapperCount = await generateWrappers(targetDir);

    s.stop(`${pc.green("✓")} Scaffolded ${wrapperCount} skill wrappers`);
  } catch (err) {
    s.stop(pc.red(`✗ Scaffolding failed: ${err instanceof Error ? err.message : String(err)}`));
    process.exit(1);
  }

  // ─── Done ─────────────────────────────────────────────────────
  outro(
    `Ready. Next steps:\n` +
      `  ${pc.cyan(`cd ${slug}`)}\n` +
      `  ${pc.cyan("claude")}   ${pc.dim("# open Claude Code in the project")}`,
  );
}

async function gatherProjectName(initial?: string): Promise<string> {
  if (initial && initial.trim()) return initial.trim();
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

async function gatherSlug(suggested: string): Promise<string> {
  const answer = await text({
    message: "Project slug (kebab-case, used for directory name)?",
    initialValue: suggested,
    validate: (value) => {
      if (!value.trim()) return "Slug is required";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())) {
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

async function gatherUserName(): Promise<string> {
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
