import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { extractFrontmatter } from "./frontmatter.js";

/**
 * Generate thin `.claude/skills/<name>/SKILL.md` wrappers that point at the
 * canonical framework SKILL.md files inside `coldpress-os/`.
 *
 * Scans `coldpress-os/skills/` and `coldpress-os/lifecycle/` inside the
 * consumer project, reads each SKILL.md's frontmatter, and writes one
 * wrapper per non-router, non-stack-pack skill.
 *
 * Returns the number of wrappers written.
 */
export async function generateWrappers(targetDir: string): Promise<number> {
  const frameworkRoot = join(targetDir, "coldpress-os");
  const wrappersRoot = join(targetDir, ".claude", "skills");

  const skillRoots = [join(frameworkRoot, "skills"), join(frameworkRoot, "lifecycle")];

  let count = 0;
  for (const root of skillRoots) {
    for await (const skillFile of findSkillFiles(root)) {
      // Skip stack-pack skills — they're re-generated after Phase 3 locks a stack.
      if (skillFile.includes(`${"skills"}/stack-packs/`)) continue;

      const content = await readFile(skillFile, "utf8");
      const fm = extractFrontmatter(content);

      if (!fm.name || !fm.description) continue;
      // Skip routers — they delegate, they don't get wrapped.
      if (fm.type === "router") continue;

      const relativePath = relative(targetDir, skillFile);
      await writeWrapper(wrappersRoot, fm.name, fm.description, relativePath);
      count++;
    }
  }

  return count;
}

async function writeWrapper(
  wrappersRoot: string,
  name: string,
  description: string,
  canonicalPath: string,
): Promise<void> {
  const wrapperDir = join(wrappersRoot, name);
  await mkdir(wrapperDir, { recursive: true });

  const body = `---
name: "${name}"
description: "${description.replaceAll('"', '\\"')}"
---

Read and follow ${canonicalPath}
`;

  await writeFile(join(wrapperDir, "SKILL.md"), body, "utf8");
}

async function* findSkillFiles(root: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* findSkillFiles(path);
    } else if (entry.isFile() && entry.name === "SKILL.md") {
      yield path;
    }
  }
}
